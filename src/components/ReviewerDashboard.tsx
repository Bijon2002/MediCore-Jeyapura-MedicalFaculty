import React, { useState, useEffect, useCallback } from 'react';
import { ArticlesApiClient } from '../client/api/articles.api';
import { QuizzesApiClient } from '../client/api/quizzes.api';
import { SubjectsApiClient } from '../client/api/subjects.api';
import { TopicsApiClient } from '../client/api/topics.api';
import { supabase } from '../lib/supabase';
import { getAccessToken } from '../auth/auth-storage';
import { useAuth } from '../auth/AuthContext';
import type { Article, ArticleStatus } from '../client/types/article.types';
import type { Quiz } from '../client/types/quiz.types';
import type { Subject } from '../client/types/subject.types';
import type { Topic } from '../client/types/topic.types';
import { AdminApplicationReview } from './AdminApplicationReview';
import { Profile } from './Profile';
import { ImageUploader } from './ImageUploader';
import './ReviewerDashboard.css';

export type AdminWorkspaceTab = 'OVERVIEW' | 'ARTICLES' | 'QUIZZES' | 'REVIEWERS' | 'SUBJECTS' | 'PROFILE' | 'USERS' | 'HERO_SLIDES';

export interface ReviewerDashboardProps {
  onCreateArticle: () => void;
  onEditArticle: (articleId: string) => void;
  onCreateQuiz?: () => void;
  onEditQuiz?: (quizId: string) => void;
  activeTab?: AdminWorkspaceTab;
  onTabChange?: (tab: AdminWorkspaceTab) => void;
}

export const ReviewerDashboard: React.FC<ReviewerDashboardProps> = ({
  onCreateArticle,
  onEditArticle,
  onCreateQuiz,
  onEditQuiz,
  activeTab: controlledActiveTab,
  onTabChange,
}) => {
  const { user } = useAuth();

  const isReviewerOrAdmin = user?.role === 'MEDICAL_REVIEWER' || user?.role === 'ADMIN';
  const isAdmin = user?.role === 'ADMIN';

  // Active Tab State: can be controlled from parent or managed locally
  const [localActiveTab, setLocalActiveTab] = useState<AdminWorkspaceTab>(
    isAdmin ? 'OVERVIEW' : 'ARTICLES'
  );

  const activeTab = controlledActiveTab ?? localActiveTab;

  const handleSetActiveTab = (tab: AdminWorkspaceTab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setLocalActiveTab(tab);
    }
  };

  // SUBJECTS STATE (for Admin View)
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState<boolean>(false);
  const [subjectsError, setSubjectsError] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState<boolean>(false);
  const [topicsError, setTopicsError] = useState<string | null>(null);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [subjectForm, setSubjectForm] = useState({ title: '', slug: '', description: '', iconUrl: '', orderIndex: 0 });
  const [topicForm, setTopicForm] = useState({ subjectId: '', title: '', slug: '', description: '', orderIndex: 0 });

  // ARTICLES STATE
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState<boolean>(true);
  const [articlesError, setArticlesError] = useState<string | null>(null);
  const [articleStatusFilter, setArticleStatusFilter] = useState<'ALL' | ArticleStatus>('ALL');
  const [articleSearchTerm, setArticleSearchTerm] = useState<string>('');

  // QUIZZES STATE
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState<boolean>(false);
  const [quizzesError, setQuizzesError] = useState<string | null>(null);
  const [quizStatusFilter, setQuizStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'UNPUBLISHED'>('ALL');
  const [quizSearchTerm, setQuizSearchTerm] = useState<string>('');

  // USERS STATE (Admin-only)
  interface UserProfile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    role: string | null;
    created_at: string | null;
    avatar_url: string | null;
  }
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [userRoleChanges, setUserRoleChanges] = useState<Record<string, string>>({});
  const [userSavingId, setUserSavingId] = useState<string | null>(null);

  // HERO SLIDES STATE (Admin-only)
  interface HeroSlideEditable {
    bgImage: string;
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    lead: string;
    cta: string;
    badgeTitle: string;
    badgeSubtitle: string;
  }
  const defaultHeroSlidesAdmin: HeroSlideEditable[] = [
    { bgImage: '/images/medical-hero-1.jpg', eyebrow: 'DIAGNOSTIC PRECISION & NEUROLOGY', titleLine1: 'Discover Medicine.', titleLine2: 'Find Your Precision.', lead: 'Peer-reviewed clinical neuro-imaging, surgical anatomy guides, and high-yield diagnostic algorithms crafted for healthcare practitioners.', cta: 'Explore Guides', badgeTitle: 'MRI Diagnostic Protocol', badgeSubtitle: '99.4% Peer-Reviewed Concordance' },
    { bgImage: '/images/medical-hero-2.jpg', eyebrow: 'OPERATIVE THEATER CURRICULUM', titleLine1: 'Master Board Exams.', titleLine2: 'Empower Operative Care.', lead: 'Over 500+ clinically verified surgical procedures and USMLE Step 1 & 2 diagnostic question banks designed to reinforce bedside decision-making.', cta: 'Start Quizzes', badgeTitle: 'Operative Anatomy & Critical Care', badgeSubtitle: '500+ Surgical Protocols Verified' },
    { bgImage: '/images/medical-hero-3.jpg', eyebrow: 'CARDIOVASCULAR MEDICINE & CATH LAB', titleLine1: 'Cardiology Algorithms.', titleLine2: 'Master Systemic Hemodynamics.', lead: 'Comprehensive 3D anatomical breakdowns, coronary angiography pathways, and valvular guidelines with zero paywalls.', cta: 'Browse Specialties', badgeTitle: 'Left Ventricular EF: 55-70% • Cath Protocols', badgeSubtitle: '2026 ACC/AHA Valvular Guidelines Active' },
    { bgImage: '/images/medical-hero-4.jpg', eyebrow: 'PEDIATRICS & EMERGENCY RESUSCITATION', titleLine1: 'Trauma & Critical Triage.', titleLine2: 'Real-Time Bedside Care.', lead: 'Instant access to emergency protocols, pediatric Glasgow Coma Scale (pGCS), and trauma resuscitation guidelines.', cta: 'View Emergency Care', badgeTitle: 'Pediatric Triage Matrix', badgeSubtitle: 'Real-Time Evidence-Based Algorithms' },
  ];
  const [heroSlidesAdmin, setHeroSlidesAdmin] = useState<HeroSlideEditable[]>(() => {
    try {
      const stored = localStorage.getItem('medcore_hero_slides');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Map full slides to editable fields
        return parsed.map((s: any, index: number) => ({
          bgImage: s.bgImage || defaultHeroSlidesAdmin[index]?.bgImage || '',
          eyebrow: s.eyebrow || '',
          titleLine1: s.titleLine1 || '',
          titleLine2: s.titleLine2 || '',
          lead: s.lead || '',
          cta: s.cta || '',
          badgeTitle: s.badgeTitle || s.leftBadge || '',
          badgeSubtitle: s.badgeSubtitle || s.rightBadge || '',
        }));
      }
    } catch {}
    return defaultHeroSlidesAdmin;
  });
  const [heroSlidesSaved, setHeroSlidesSaved] = useState(false);

  // FETCH ARTICLES
  const fetchArticles = useCallback(async () => {
    setArticlesLoading(true);
    setArticlesError(null);
    const token = getAccessToken() || undefined;

    try {
      const response = await ArticlesApiClient.getArticles(
        {
          limit: 100,
          status: articleStatusFilter === 'ALL' ? undefined : articleStatusFilter,
          search: articleSearchTerm || undefined,
        },
        token,
      );
      setArticles(response.data || []);
    } catch (err: any) {
      setArticlesError(err?.message || 'Failed to load reviewer articles.');
    } finally {
      setArticlesLoading(false);
    }
  }, [articleStatusFilter, articleSearchTerm]);

  // FETCH QUIZZES
  const fetchQuizzes = useCallback(async () => {
    setQuizzesLoading(true);
    setQuizzesError(null);
    const token = getAccessToken();
    if (!token) {
      setQuizzesError('Authentication required to view quizzes.');
      setQuizzesLoading(false);
      return;
    }

    try {
      const data = await QuizzesApiClient.getQuizzes(token);
      setQuizzes(data || []);
    } catch (err: any) {
      setQuizzesError(err?.message || 'Failed to load quizzes.');
    } finally {
      setQuizzesLoading(false);
    }
  }, []);

  // FETCH SUBJECTS (for Admin View)
  const fetchSubjects = useCallback(async () => {
    setSubjectsLoading(true);
    setSubjectsError(null);
    try {
      const response = await SubjectsApiClient.getSubjects({ limit: 50 });
      setSubjects(response.data || []);
    } catch (err: any) {
      setSubjectsError(err?.message || 'Failed to load specialties.');
    } finally {
      setSubjectsLoading(false);
    }
  }, []);

  const fetchTopics = useCallback(async () => {
    setTopicsLoading(true);
    setTopicsError(null);
    try {
      const response = await TopicsApiClient.getTopics({ limit: 200 });
      setTopics(response.data || []);
    } catch (err: any) {
      setTopicsError(err?.message || 'Failed to load topics.');
    } finally {
      setTopicsLoading(false);
    }
  }, []);

  const resetSubjectForm = () => {
    setEditingSubjectId(null);
    setSubjectForm({ title: '', slug: '', description: '', iconUrl: '', orderIndex: subjects.length });
  };

  const resetTopicForm = () => {
    setEditingTopicId(null);
    setTopicForm({ subjectId: subjects[0]?.id || '', title: '', slug: '', description: '', orderIndex: topics.length });
  };

  const handleSaveSubject = async () => {
    if (!subjectForm.title.trim()) {
      alert('Specialty name is required.');
      return;
    }
    try {
      const payload = {
        title: subjectForm.title.trim(),
        slug: subjectForm.slug.trim() || subjectForm.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        description: subjectForm.description.trim() || undefined,
        iconUrl: subjectForm.iconUrl || undefined,
        orderIndex: subjectForm.orderIndex,
      };
      if (editingSubjectId) {
        await SubjectsApiClient.updateSubject(editingSubjectId, payload);
      } else {
        await SubjectsApiClient.createSubject(payload);
      }
      resetSubjectForm();
      await fetchSubjects();
    } catch (err: any) {
      alert(err?.message || 'Failed to save specialty.');
    }
  };

  const handleSaveTopic = async () => {
    if (!topicForm.subjectId || !topicForm.title.trim()) {
      alert('Topic name and specialty are required.');
      return;
    }
    try {
      const payload = {
        subjectId: topicForm.subjectId,
        title: topicForm.title.trim(),
        slug: topicForm.slug.trim() || topicForm.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        description: topicForm.description.trim() || undefined,
        orderIndex: topicForm.orderIndex,
      };
      if (editingTopicId) {
        await TopicsApiClient.updateTopic(editingTopicId, payload);
      } else {
        await TopicsApiClient.createTopic(payload);
      }
      resetTopicForm();
      await fetchTopics();
    } catch (err: any) {
      alert(err?.message || 'Failed to save topic.');
    }
  };

  const handleDeleteSubject = async (subject: Subject) => {
    if (!window.confirm(`Delete "${subject.title}" and its topics?`)) return;
    try {
      await SubjectsApiClient.deleteSubject(subject.id);
      await Promise.all([fetchSubjects(), fetchTopics()]);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete specialty.');
    }
  };

  const handleDeleteTopic = async (topic: Topic) => {
    if (!window.confirm(`Delete "${topic.title}"?`)) return;
    try {
      await TopicsApiClient.deleteTopic(topic.id);
      await fetchTopics();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete topic.');
    }
  };

  // FETCH USERS (Admin-only)
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role, created_at, avatar_url')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
      // Initialize role-change map
      const map: Record<string, string> = {};
      (data || []).forEach((u: any) => { map[u.id] = u.role || 'STUDENT'; });
      setUserRoleChanges(map);
    } catch (err: any) {
      setUsersError(err?.message || 'Failed to load users.');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const handleSaveUserRole = async (userId: string) => {
    const newRole = userRoleChanges[userId];
    if (!newRole) return;
    setUserSavingId(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      if (error) throw error;
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err: any) {
      alert(err?.message || 'Failed to update user role.');
    } finally {
      setUserSavingId(null);
    }
  };

  const handleSaveHeroSlides = () => {
    try {
      localStorage.setItem('medcore_hero_slides', JSON.stringify(heroSlidesAdmin));
      window.dispatchEvent(new CustomEvent('medcore:hero-slides-updated'));
      setHeroSlidesSaved(true);
      setTimeout(() => setHeroSlidesSaved(false), 2500);
    } catch (err) {
      alert('Failed to save hero slides.');
    }
  };

  useEffect(() => {
    if (isReviewerOrAdmin) {
      if (activeTab === 'OVERVIEW') {
        fetchArticles();
        fetchQuizzes();
        fetchSubjects();
      } else if (activeTab === 'ARTICLES') {
        fetchArticles();
      } else if (activeTab === 'QUIZZES') {
        fetchQuizzes();
      } else if (activeTab === 'SUBJECTS') {
        fetchSubjects();
        fetchTopics();
      } else if (activeTab === 'USERS') {
        fetchUsers();
      }
    }
  }, [isReviewerOrAdmin, activeTab, fetchArticles, fetchQuizzes, fetchSubjects, fetchTopics, fetchUsers]);

  // DELETE ARTICLE
  const handleDeleteArticle = async (articleId: string, articleTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${articleTitle}"?`)) {
      return;
    }

    const token = getAccessToken();
    if (!token) {
      alert('Authentication required.');
      return;
    }

    try {
      await ArticlesApiClient.deleteArticle(articleId, token);
      fetchArticles();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete article. Admin permissions required.');
    }
  };

  const handleToggleFeaturedArticle = async (article: Article) => {
    try {
      await ArticlesApiClient.setFeaturedArticle(article.id, !article.isFeatured);
      await fetchArticles();
    } catch (err: any) {
      alert(err?.message || 'Failed to update featured article state.');
    }
  };

  // TOGGLE QUIZ PUBLISH / UNPUBLISH
  const handleToggleQuizPublish = async (quiz: Quiz) => {
    const token = getAccessToken();
    if (!token) {
      alert('Authentication required.');
      return;
    }

    try {
      if (quiz.isPublished) {
        await QuizzesApiClient.unpublishQuiz(quiz.id, token);
      } else {
        await QuizzesApiClient.publishQuiz(quiz.id, token);
      }
      fetchQuizzes();
    } catch (err: any) {
      alert(err?.message || 'Failed to change quiz publication state.');
    }
  };

  // DELETE QUIZ
  const handleDeleteQuiz = async (quizId: string, quizTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete quiz "${quizTitle}"?`)) {
      return;
    }

    const token = getAccessToken();
    if (!token) {
      alert('Authentication required.');
      return;
    }

    try {
      await QuizzesApiClient.deleteQuiz(quizId, token);
      fetchQuizzes();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete quiz. Admin credentials required.');
    }
  };

  // RESTRICTED ACCESS
  if (!isReviewerOrAdmin) {
    return (
      <div className="reviewer-dashboard-container">
        <div className="reviewer-restricted-card">
          <div className="restricted-icon-box">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2>Reviewer Workspace Restricted</h2>
          <p>
            You are currently viewing as <strong>{user?.role || 'Student / Guest'}</strong>. Access to Medical Reviewer authoring and workflow management requires <strong>MEDICAL_REVIEWER</strong> or <strong>ADMIN</strong> role credentials.
          </p>
        </div>
      </div>
    );
  }

  // Articles counts
  const totalArticlesCount = articles.length;
  const draftArticlesCount = articles.filter((a) => a.status === 'DRAFT').length;
  const publishedArticlesCount = articles.filter((a) => a.status === 'PUBLISHED').length;

  // Filtered Quizzes
  const filteredQuizzes = quizzes.filter((q) => {
    const matchesStatus =
      quizStatusFilter === 'ALL'
        ? true
        : quizStatusFilter === 'PUBLISHED'
        ? q.isPublished
        : !q.isPublished;

    const term = quizSearchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      q.title.toLowerCase().includes(term) ||
      (q.description && q.description.toLowerCase().includes(term)) ||
      (q.subject && q.subject.title.toLowerCase().includes(term));

    return matchesStatus && matchesSearch;
  });

  const totalQuizzesCount = quizzes.length;
  const publishedQuizzesCount = quizzes.filter((q) => q.isPublished).length;
  const draftQuizzesCount = quizzes.filter((q) => !q.isPublished).length;

  return (
    <div className="reviewer-dashboard-container">
      {/* WORKSPACE NAVIGATION TABS */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        {isAdmin && (
          <button
            type="button"
            onClick={() => handleSetActiveTab('OVERVIEW')}
            style={{
              background: activeTab === 'OVERVIEW' ? 'var(--accent, #0d9488)' : 'var(--surface)',
              color: activeTab === 'OVERVIEW' ? '#ffffff' : 'var(--text-muted)',
              border: '1px solid var(--border)',
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
            data-testid="admin-tab-overview"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
            System Overview
          </button>
        )}

        {isAdmin && (
          <button
            type="button"
            onClick={() => handleSetActiveTab('REVIEWERS')}
            style={{
              background: activeTab === 'REVIEWERS' ? 'var(--accent, #0d9488)' : 'var(--surface)',
              color: activeTab === 'REVIEWERS' ? '#ffffff' : 'var(--text-muted)',
              border: '1px solid var(--border)',
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
            data-testid="admin-tab-reviewers"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <polyline points="17 11 19 13 23 9" />
            </svg>
            Reviewer Applications
          </button>
        )}

        <button
          type="button"
          onClick={() => handleSetActiveTab('ARTICLES')}
          style={{
            background: activeTab === 'ARTICLES' ? 'var(--accent, #0d9488)' : 'var(--surface)',
            color: activeTab === 'ARTICLES' ? '#ffffff' : 'var(--text-muted)',
            border: '1px solid var(--border)',
            padding: '0.5rem 1.25rem',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
          data-testid="admin-tab-articles"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Clinical Articles
        </button>

        <button
          type="button"
          onClick={() => handleSetActiveTab('QUIZZES')}
          style={{
            background: activeTab === 'QUIZZES' ? 'var(--accent, #0d9488)' : 'var(--surface)',
            color: activeTab === 'QUIZZES' ? '#ffffff' : 'var(--text-muted)',
            border: '1px solid var(--border)',
            padding: '0.5rem 1.25rem',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
          data-testid="admin-tab-quizzes"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Medical Quizzes
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={() => handleSetActiveTab('SUBJECTS')}
            style={{
              background: activeTab === 'SUBJECTS' ? 'var(--accent, #0d9488)' : 'var(--surface)',
              color: activeTab === 'SUBJECTS' ? '#ffffff' : 'var(--text-muted)',
              border: '1px solid var(--border)',
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
            data-testid="admin-tab-subjects"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21h18" />
              <path d="M5 21V7l8-4v18" />
              <path d="M19 21V11l-6-4" />
              <path d="M9 9h1" />
              <path d="M9 13h1" />
              <path d="M9 17h1" />
            </svg>
            Specialties & Topics
          </button>
        )}

        <button
          type="button"
          onClick={() => handleSetActiveTab('PROFILE')}
          style={{
            background: activeTab === 'PROFILE' ? 'var(--accent, #0d9488)' : 'var(--surface)',
            color: activeTab === 'PROFILE' ? '#ffffff' : 'var(--text-muted)',
            border: '1px solid var(--border)',
            padding: '0.5rem 1.25rem',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
          }}
          data-testid="admin-tab-profile"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {isAdmin ? 'Admin Profile' : 'Reviewer Profile'}
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={() => handleSetActiveTab('USERS')}
            style={{
              background: activeTab === 'USERS' ? 'var(--accent, #0d9488)' : 'var(--surface)',
              color: activeTab === 'USERS' ? '#ffffff' : 'var(--text-muted)',
              border: '1px solid var(--border)',
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
            data-testid="admin-tab-users"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Manage Users
          </button>
        )}

        {isAdmin && (
          <button
            type="button"
            onClick={() => handleSetActiveTab('HERO_SLIDES')}
            style={{
              background: activeTab === 'HERO_SLIDES' ? 'var(--accent, #0d9488)' : 'var(--surface)',
              color: activeTab === 'HERO_SLIDES' ? '#ffffff' : 'var(--text-muted)',
              border: '1px solid var(--border)',
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
            data-testid="admin-tab-hero-slides"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            Hero Slides
          </button>
        )}
      </div>

      {/* VIEW: OVERVIEW (ADMIN ONLY) */}
      {isAdmin && activeTab === 'OVERVIEW' ? (
        <div className="admin-overview" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* WELCOME BANNER */}
          <div
            className="admin-overview-grid"
            style={{
              background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.12), rgba(2, 132, 199, 0.08))',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px 28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <span className="reviewer-badge" style={{ marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Administration Portal
              </span>
              <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '6px 0 4px', color: 'var(--text-h)' }}>
                System Governance & Overview
              </h1>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
                Directly manage clinical content, reviewer accreditations, specialties, and system security without leaving the console.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {onCreateArticle && (
                <button
                  type="button"
                  className="btn-create-article"
                  onClick={onCreateArticle}
                  style={{ fontSize: '13px', padding: '8px 16px' }}
                >
                  + New Article
                </button>
              )}
              {onCreateQuiz && (
                <button
                  type="button"
                  className="btn-create-article"
                  onClick={onCreateQuiz}
                  style={{
                    background: 'linear-gradient(135deg, #0d9488, #059669)',
                    fontSize: '13px',
                    padding: '8px 16px',
                  }}
                >
                  + New Quiz
                </button>
              )}
            </div>
          </div>

          {/* KPI STATS CARDS */}
          <div className="reviewer-stats-grid">
            <div
              className="reviewer-stat-card"
              style={{ cursor: 'pointer' }}
              onClick={() => handleSetActiveTab('ARTICLES')}
              title="Click to manage articles"
            >
              <span className="stat-label">Clinical Articles</span>
              <span className="stat-value">{totalArticlesCount}</span>
              <span className="stat-subtext" style={{ color: 'var(--teal-500)', fontWeight: 600 }}>
                {publishedArticlesCount} Published · {draftArticlesCount} Drafts →
              </span>
            </div>

            <div
              className="reviewer-stat-card"
              style={{ cursor: 'pointer' }}
              onClick={() => handleSetActiveTab('QUIZZES')}
              title="Click to manage quizzes"
            >
              <span className="stat-label">Medical Quizzes</span>
              <span className="stat-value">{totalQuizzesCount}</span>
              <span className="stat-subtext" style={{ color: '#0284c7', fontWeight: 600 }}>
                {publishedQuizzesCount} Published · {draftQuizzesCount} Drafts →
              </span>
            </div>

            <div
              className="reviewer-stat-card"
              style={{ cursor: 'pointer' }}
              onClick={() => handleSetActiveTab('REVIEWERS')}
              title="Click to view reviewer applications"
            >
              <span className="stat-label">Reviewer Verification</span>
              <span className="stat-value" style={{ color: '#d97706' }}>
                Pending Review
              </span>
              <span className="stat-subtext" style={{ fontWeight: 600 }}>
                Manage Applications →
              </span>
            </div>

            <div
              className="reviewer-stat-card"
              style={{ cursor: 'pointer' }}
              onClick={() => handleSetActiveTab('SUBJECTS')}
              title="Click to view specialties"
            >
              <span className="stat-label">Medical Specialties</span>
              <span className="stat-value">{subjects.length}</span>
              <span className="stat-subtext" style={{ color: 'var(--text-muted)' }}>
                Anatomical Systems Active →
              </span>
            </div>
          </div>

          {/* QUICK IN-PAGE SECTION JUMP CARDS */}
          <div
            className="admin-overview-card"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            <div
              className="admin-overview-card"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(13, 148, 136, 0.1)', color: 'var(--accent, #0d9488)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <polyline points="17 11 19 13 23 9" />
                  </svg>
                </div>
                <strong style={{ fontSize: '15px' }}>Reviewer Verification</strong>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Inspect doctor credentials, GMC/license certificates, and approve or reject reviewer applications with audit notes.
              </p>
              <button
                type="button"
                onClick={() => handleSetActiveTab('REVIEWERS')}
                style={{
                  marginTop: '8px',
                  alignSelf: 'flex-start',
                  padding: '6px 14px',
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Open Reviewer Queue →
              </button>
            </div>

            <div
              className="admin-overview-card"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <strong style={{ fontSize: '15px' }}>Content Governance</strong>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Curate clinical literature, review drafts submitted by reviewers, edit rich content, or remove outdated guidelines.
              </p>
              <button
                type="button"
                onClick={() => handleSetActiveTab('ARTICLES')}
                style={{
                  marginTop: '8px',
                  alignSelf: 'flex-start',
                  padding: '6px 14px',
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Manage Articles →
              </button>
            </div>

            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <strong style={{ fontSize: '15px' }}>Assessment Center</strong>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Publish new USMLE/PLAB/MCQ clinical quizzes, verify explanations and distractors, or toggle quiz availability for students.
              </p>
              <button
                type="button"
                onClick={() => handleSetActiveTab('QUIZZES')}
                style={{
                  marginTop: '8px',
                  alignSelf: 'flex-start',
                  padding: '6px 14px',
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Manage Quizzes →
              </button>
            </div>
          </div>
        </div>
      ) : activeTab === 'PROFILE' ? (
        /* VIEW: EMBEDDED PROFILE (IN-PAGE) */
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-h)' }}>
              {isAdmin ? 'Administrator Profile Settings' : 'Medical Reviewer Profile'}
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
              Manage your personal credentials, contact name, and clinical credentials directly from the workspace.
            </p>
          </div>
          <Profile />
        </div>
      ) : isAdmin && activeTab === 'SUBJECTS' ? (
        /* VIEW: SPECIALTIES & TOPICS (ADMIN ONLY) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="reviewer-header">
            <div className="reviewer-title-group">
              <span className="reviewer-badge">Curriculum Taxonomy</span>
              <h1 className="reviewer-title">Medical Specialties & Anatomical Systems</h1>
              <p className="reviewer-subtitle">
                Hierarchical subjects and topics structuring all articles and clinical quiz questions.
              </p>
            </div>
          </div>

          <div className="reviewer-table-card" style={{ padding: '20px' }}>
            <div className="reviewer-header" style={{ marginBottom: '16px' }}>
              <div className="reviewer-title-group">
                <h2 className="reviewer-section-title">{editingSubjectId ? 'Edit Specialty' : 'Create Specialty'}</h2>
                <p className="reviewer-subtitle">Maintain the specialties shown on the public curriculum page.</p>
              </div>
              {editingSubjectId && (
                <button type="button" className="btn-action-edit" onClick={resetSubjectForm}>Cancel Edit</button>
              )}
            </div>
            <div className="admin-inline-form">
              <input aria-label="Specialty name" placeholder="Specialty name" value={subjectForm.title} onChange={(e) => setSubjectForm({ ...subjectForm, title: e.target.value })} />
              <input aria-label="Specialty slug" placeholder="Slug (optional)" value={subjectForm.slug} onChange={(e) => setSubjectForm({ ...subjectForm, slug: e.target.value })} />
              <input aria-label="Specialty description" placeholder="Description" value={subjectForm.description} onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })} />
              <input aria-label="Specialty order" type="number" min="0" placeholder="Order" value={subjectForm.orderIndex} onChange={(e) => setSubjectForm({ ...subjectForm, orderIndex: Number(e.target.value) })} />
              <ImageUploader
                value={subjectForm.iconUrl}
                onChange={(iconUrl) => setSubjectForm({ ...subjectForm, iconUrl })}
                label="Specialty image"
                helpText="Upload a square specialty image or icon (PNG, JPG, WEBP)."
                variant="avatar"
              />
              <button type="button" className="btn-create-article" onClick={handleSaveSubject}>{editingSubjectId ? 'Update Specialty' : 'Add Specialty'}</button>
            </div>
          </div>

          <div className="reviewer-table-card">
            {subjectsLoading ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading Specialties...
              </div>
            ) : subjectsError ? (
              <div style={{ padding: '24px', color: '#ef4444' }}>{subjectsError}</div>
            ) : subjects.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No specialties registered in the database.
              </div>
            ) : (
              <div className="reviewer-table-wrapper">
                <table className="reviewer-table">
                  <thead>
                    <tr>
                      <th>Specialty Name</th>
                      <th>Slug</th>
                      <th>Description</th>
                      <th>Topics</th>
                      <th>Articles</th>
                      <th>Order</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((sub) => (
                      <tr key={sub.id}>
                        <td>
                          {sub.iconUrl && <img src={sub.iconUrl} alt="" className="admin-subject-thumbnail" />}
                          <strong style={{ color: 'var(--text-h)' }}>{sub.title}</strong>
                        </td>
                        <td>
                          <code style={{ fontSize: '12px', background: 'var(--surface-hover)', padding: '2px 6px', borderRadius: '4px' }}>
                            {sub.slug}
                          </code>
                        </td>
                        <td style={{ maxWidth: '300px', fontSize: '13px', color: 'var(--text-muted)' }}>
                          {sub.description || 'No description'}
                        </td>
                        <td>
                          <span className="nav-item-badge">{sub._count?.topics ?? 0} Topics</span>
                        </td>
                        <td>
                          <span className="nav-item-badge" style={{ background: 'var(--teal-500)', color: '#ffffff' }}>
                            {sub._count?.articles ?? 0} Articles
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '13px', fontWeight: 600 }}>#{sub.orderIndex}</span>
                        </td>
                        <td>
                          <div className="admin-row-actions">
                            <button type="button" className="btn-action-edit" onClick={() => {
                              setEditingSubjectId(sub.id);
                              setSubjectForm({ title: sub.title, slug: sub.slug, description: sub.description || '', iconUrl: sub.iconUrl || '', orderIndex: sub.orderIndex });
                            }}>Edit</button>
                            <button type="button" className="btn-action-delete" onClick={() => handleDeleteSubject(sub)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="reviewer-table-card" style={{ padding: '20px' }}>
            <div className="reviewer-header" style={{ marginBottom: '16px' }}>
              <div className="reviewer-title-group">
                <h2 className="reviewer-section-title">{editingTopicId ? 'Edit Topic' : 'Create Topic'}</h2>
                <p className="reviewer-subtitle">Add and maintain the clinical topics nested under each specialty.</p>
              </div>
              {editingTopicId && (
                <button type="button" className="btn-action-edit" onClick={resetTopicForm}>Cancel Edit</button>
              )}
            </div>
            <div className="admin-inline-form">
              <select aria-label="Topic specialty" value={topicForm.subjectId} onChange={(e) => setTopicForm({ ...topicForm, subjectId: e.target.value })}>
                <option value="">Select specialty</option>
                {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.title}</option>)}
              </select>
              <input aria-label="Topic name" placeholder="Topic name" value={topicForm.title} onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })} />
              <input aria-label="Topic slug" placeholder="Slug (optional)" value={topicForm.slug} onChange={(e) => setTopicForm({ ...topicForm, slug: e.target.value })} />
              <input aria-label="Topic description" placeholder="Description" value={topicForm.description} onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })} />
              <input aria-label="Topic order" type="number" min="0" placeholder="Order" value={topicForm.orderIndex} onChange={(e) => setTopicForm({ ...topicForm, orderIndex: Number(e.target.value) })} />
              <button type="button" className="btn-create-article" onClick={handleSaveTopic}>{editingTopicId ? 'Update Topic' : 'Add Topic'}</button>
            </div>
          </div>

          <div className="reviewer-table-card">
            {topicsLoading ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Topics...</div>
            ) : topicsError ? (
              <div style={{ padding: '24px', color: '#ef4444' }}>{topicsError}</div>
            ) : (
              <div className="reviewer-table-wrapper">
                <table className="reviewer-table">
                  <thead><tr><th>Topic</th><th>Specialty</th><th>Description</th><th>Order</th><th>Actions</th></tr></thead>
                  <tbody>
                    {topics.map((topic) => (
                      <tr key={topic.id}>
                        <td><strong style={{ color: 'var(--text-h)' }}>{topic.title}</strong></td>
                        <td>{topic.subject?.title || subjects.find((subject) => subject.id === topic.subjectId)?.title || '—'}</td>
                        <td style={{ maxWidth: '300px', fontSize: '13px', color: 'var(--text-muted)' }}>{topic.description || 'No description'}</td>
                        <td><span style={{ fontSize: '13px', fontWeight: 600 }}>#{topic.orderIndex}</span></td>
                        <td>
                          <div className="admin-row-actions">
                            <button type="button" className="btn-action-edit" onClick={() => {
                              setEditingTopicId(topic.id);
                              setTopicForm({ subjectId: topic.subjectId, title: topic.title, slug: topic.slug, description: topic.description || '', orderIndex: topic.orderIndex });
                            }}>Edit</button>
                            <button type="button" className="btn-action-delete" onClick={() => handleDeleteTopic(topic)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {topics.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No topics registered.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : isAdmin && activeTab === 'REVIEWERS' ? (
        <AdminApplicationReview />
      ) : isAdmin && activeTab === 'USERS' ? (
        /* VIEW: MANAGE USERS (ADMIN ONLY) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="reviewer-header">
            <div className="reviewer-title-group">
              <span className="reviewer-badge">User Management</span>
              <h1 className="reviewer-title">Registered Platform Users</h1>
              <p className="reviewer-subtitle">
                View all registered users, update their roles, and manage platform access.
              </p>
            </div>
          </div>

          <div className="reviewer-table-card">
            {usersLoading ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading Users...
              </div>
            ) : usersError ? (
              <div style={{ padding: '24px', color: '#ef4444' }}>{usersError}</div>
            ) : users.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No users found.
              </div>
            ) : (
              <div className="reviewer-table-wrapper">
                <table className="reviewer-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <strong style={{ color: 'var(--text-h)' }}>
                            {[u.first_name, u.last_name].filter(Boolean).join(' ') || 'N/A'}
                          </strong>
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{u.email || '—'}</td>
                        <td>
                          <select
                            value={userRoleChanges[u.id] ?? (u.role || 'STUDENT')}
                            onChange={(e) => setUserRoleChanges((prev) => ({ ...prev, [u.id]: e.target.value }))}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: '1px solid var(--border)',
                              background: 'var(--surface)',
                              color: 'var(--text)',
                              fontSize: '13px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            <option value="STUDENT">STUDENT</option>
                            <option value="MEDICAL_REVIEWER">MEDICAL_REVIEWER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td>
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-action-edit"
                            disabled={userSavingId === u.id}
                            onClick={() => handleSaveUserRole(u.id)}
                          >
                            {userSavingId === u.id ? 'Saving…' : 'Save'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : isAdmin && activeTab === 'HERO_SLIDES' ? (
        /* VIEW: HERO SLIDES EDITOR (ADMIN ONLY) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="reviewer-header">
            <div className="reviewer-title-group">
              <span className="reviewer-badge">Homepage Editor</span>
              <h1 className="reviewer-title">Hero Slides Configuration</h1>
              <p className="reviewer-subtitle">
                Edit the 4 hero slides displayed on the MedCore home page. Changes are saved to localStorage and applied instantly.
              </p>
            </div>
            <button
              type="button"
              className="btn-create-article"
              onClick={handleSaveHeroSlides}
              style={{ background: heroSlidesSaved ? '#16a34a' : undefined }}
            >
              {heroSlidesSaved ? '✓ Saved!' : 'Save All Slides'}
            </button>
          </div>

          {heroSlidesAdmin.map((slide, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
            <div className="hero-slide-editor-heading">
              <div>
                <span className="reviewer-badge">Homepage Hero</span>
                <strong>Slide {idx + 1}</strong>
              </div>
              <ImageUploader
                value={slide.bgImage}
                onChange={(bgImage) => {
                  const updated = [...heroSlidesAdmin];
                  updated[idx] = { ...updated[idx], bgImage };
                  setHeroSlidesAdmin(updated);
                }}
                label="Background image"
                helpText="Use a wide medical image (PNG, JPG, WEBP)."
                variant="banner"
              />
            </div>
              {(['eyebrow', 'titleLine1', 'titleLine2', 'lead', 'cta', 'badgeTitle', 'badgeSubtitle'] as (keyof HeroSlideEditable)[]).map((field) => (
                <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                  </label>
                  {field === 'lead' ? (
                    <textarea
                      rows={3}
                      value={slide[field]}
                      onChange={(e) => {
                        const updated = [...heroSlidesAdmin];
                        updated[idx] = { ...updated[idx], [field]: e.target.value };
                        setHeroSlidesAdmin(updated);
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: 'var(--bg)',
                        color: 'var(--text)',
                        fontSize: '13px',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                      }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={slide[field]}
                      onChange={(e) => {
                        const updated = [...heroSlidesAdmin];
                        updated[idx] = { ...updated[idx], [field]: e.target.value };
                        setHeroSlidesAdmin(updated);
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: 'var(--bg)',
                        color: 'var(--text)',
                        fontSize: '13px',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : activeTab === 'QUIZZES' ? (
        /* VIEW: QUIZZES MANAGEMENT */
        <>
          <div className="reviewer-header">
            <div className="reviewer-title-group">
              <span className="reviewer-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Assessment Center
              </span>
              <h1 className="reviewer-title">Medical Quizzes Management</h1>
              <p className="reviewer-subtitle">
                Create, edit, validate, and publish multi-question clinical evaluations for students.
              </p>
            </div>

            {onCreateQuiz && (
              <button type="button" className="btn-create-article" onClick={onCreateQuiz}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Create New Quiz
              </button>
            )}
          </div>

          {/* STATS OVERVIEW CARDS */}
          <div className="reviewer-stats-grid">
            <div className="reviewer-stat-card">
              <span className="stat-label">Total Quizzes</span>
              <span className="stat-value">{totalQuizzesCount}</span>
              <span className="stat-subtext">In Question Bank</span>
            </div>

            <div className="reviewer-stat-card">
              <span className="stat-label">Unpublished</span>
              <span className="stat-value" style={{ color: '#d97706' }}>
                {draftQuizzesCount}
              </span>
              <span className="stat-subtext">Drafts / In Review</span>
            </div>

            <div className="reviewer-stat-card">
              <span className="stat-label">Live Quizzes</span>
              <span className="stat-value" style={{ color: 'var(--teal-500)' }}>
                {publishedQuizzesCount}
              </span>
              <span className="stat-subtext">Available to Students</span>
            </div>
          </div>

          {/* QUIZZES TABLE */}
          <div className="reviewer-table-card">
            <div className="table-toolbar">
              <div className="filter-pills">
                <button
                  type="button"
                  className={`pill-btn ${quizStatusFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setQuizStatusFilter('ALL')}
                >
                  All ({totalQuizzesCount})
                </button>
                <button
                  type="button"
                  className={`pill-btn ${quizStatusFilter === 'PUBLISHED' ? 'active' : ''}`}
                  onClick={() => setQuizStatusFilter('PUBLISHED')}
                >
                  Published ({publishedQuizzesCount})
                </button>
                <button
                  type="button"
                  className={`pill-btn ${quizStatusFilter === 'UNPUBLISHED' ? 'active' : ''}`}
                  onClick={() => setQuizStatusFilter('UNPUBLISHED')}
                >
                  Drafts ({draftQuizzesCount})
                </button>
              </div>

              <input
                type="text"
                className="table-search-input"
                placeholder="Search quizzes by title or subject..."
                value={quizSearchTerm}
                onChange={(e) => setQuizSearchTerm(e.target.value)}
              />
            </div>

            {quizzesError ? (
              <div style={{ padding: '24px', color: '#ef4444', fontWeight: 600 }}>{quizzesError}</div>
            ) : null}

            {quizzesLoading ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading Quizzes...
              </div>
            ) : !quizzesLoading && filteredQuizzes.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No quizzes found matching the current filter.
              </div>
            ) : (
              <div className="reviewer-table-wrapper">
                <table className="reviewer-table">
                  <thead>
                    <tr>
                      <th>Quiz Title & Scope</th>
                      <th>Subject / Topic</th>
                      <th>Questions</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuizzes.map((quiz) => (
                      <tr key={quiz.id}>
                        <td>
                          <div className="article-row-title">{quiz.title}</div>
                          <div className="article-row-summary">
                            {quiz.description || 'No description provided.'}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--text-h)' }}>
                            {quiz.subject?.title || 'General'}
                          </span>
                          {quiz.topic && (
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              {quiz.topic.title}
                            </div>
                          )}
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>
                            {quiz.questions?.length ?? 0} Qs
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${
                              quiz.isPublished ? 'published' : 'draft'
                            }`}
                          >
                            {quiz.isPublished ? 'PUBLISHED' : 'DRAFT'}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            {onEditQuiz && (
                              <button
                                type="button"
                                className="btn-action-edit"
                                onClick={() => onEditQuiz(quiz.id)}
                              >
                                Edit
                              </button>
                            )}
                            <button
                              type="button"
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--border)',
                                background: quiz.isPublished ? 'rgba(239, 68, 68, 0.08)' : 'rgba(20, 184, 166, 0.08)',
                                color: quiz.isPublished ? '#ef4444' : 'var(--teal-500)',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                              onClick={() => handleToggleQuizPublish(quiz)}
                            >
                              {quiz.isPublished ? 'Unpublish' : 'Publish'}
                            </button>
                            {isAdmin && (
                              <button
                                type="button"
                                className="btn-action-delete"
                                onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* VIEW: ARTICLES MANAGEMENT */
        <>
          <div className="reviewer-header">
            <div className="reviewer-title-group">
              <span className="reviewer-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Reviewer Workspace
              </span>
              <h1 className="reviewer-title">Medical Reviewer Dashboard</h1>
              <p className="reviewer-subtitle">
                Manage, author, review, and publish peer-reviewed clinical articles and anatomical guides.
              </p>
            </div>

            <button type="button" className="btn-create-article" onClick={onCreateArticle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create New Article
            </button>
          </div>

          {/* STATS OVERVIEW CARDS */}
          <div className="reviewer-stats-grid">
            <div className="reviewer-stat-card">
              <span className="stat-label">Total Articles</span>
              <span className="stat-value">{totalArticlesCount}</span>
              <span className="stat-subtext">In Reviewer Database</span>
            </div>

            <div className="reviewer-stat-card">
              <span className="stat-label">Drafts</span>
              <span className="stat-value" style={{ color: '#d97706' }}>
                {draftArticlesCount}
              </span>
              <span className="stat-subtext">Work in Progress</span>
            </div>

            <div className="reviewer-stat-card">
              <span className="stat-label">Published</span>
              <span className="stat-value" style={{ color: 'var(--teal-500)' }}>
                {publishedArticlesCount}
              </span>
              <span className="stat-subtext">Live for Students</span>
            </div>
          </div>

          {/* ARTICLES TABLE SECTION */}
          <div className="reviewer-table-card">
            <div className="table-toolbar">
              <div className="filter-pills">
                <button
                  type="button"
                  className={`pill-btn ${articleStatusFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setArticleStatusFilter('ALL')}
                >
                  All ({totalArticlesCount})
                </button>
                <button
                  type="button"
                  className={`pill-btn ${articleStatusFilter === 'DRAFT' ? 'active' : ''}`}
                  onClick={() => setArticleStatusFilter('DRAFT')}
                >
                  Drafts ({draftArticlesCount})
                </button>
                <button
                  type="button"
                  className={`pill-btn ${articleStatusFilter === 'PUBLISHED' ? 'active' : ''}`}
                  onClick={() => setArticleStatusFilter('PUBLISHED')}
                >
                  Published ({publishedArticlesCount})
                </button>
              </div>

              <input
                type="text"
                className="table-search-input"
                placeholder="Search articles by title or summary..."
                value={articleSearchTerm}
                onChange={(e) => setArticleSearchTerm(e.target.value)}
              />
            </div>

            {articlesError ? (
              <div style={{ padding: '24px', color: '#ef4444', fontWeight: 600 }}>{articlesError}</div>
            ) : null}

            {articlesLoading ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading Reviewer Articles...
              </div>
            ) : !articlesLoading && articles.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No articles found matching the current filter.
              </div>
            ) : (
              <div className="reviewer-table-wrapper">
                <table className="reviewer-table">
                  <thead>
                    <tr>
                      <th>Article Title & Summary</th>
                      <th>Status</th>
                      <th>Last Updated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((article) => (
                      <tr key={article.id}>
                        <td>
                          <div className="article-row-title">{article.title}</div>
                          <div className="article-row-summary">
                            {article.summary || 'No summary provided.'}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${
                              article.status === 'PUBLISHED' ? 'published' : 'draft'
                            }`}
                          >
                            {article.status}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            {new Date(article.updatedAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="btn-action-edit"
                              onClick={() => onEditArticle(article.id)}
                            >
                              Edit
                            </button>
                            {article.status === 'PUBLISHED' && (
                              <button
                                type="button"
                                className={`btn-feature-article ${article.isFeatured ? 'active' : ''}`}
                                onClick={() => handleToggleFeaturedArticle(article)}
                              >
                                {article.isFeatured ? 'Featured' : 'Feature'}
                              </button>
                            )}
                            {(user?.role === 'ADMIN' ||
                              (user?.role === 'MEDICAL_REVIEWER' && article.status === 'DRAFT')) && (
                              <button
                                type="button"
                                className="btn-action-delete"
                                onClick={() => handleDeleteArticle(article.id, article.title)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
