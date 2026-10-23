import React, { useState, useEffect, useCallback } from 'react';
import { ArticlesApiClient } from '../client/api/articles.api';
import { QuizzesApiClient } from '../client/api/quizzes.api';
import { SubjectsApiClient } from '../client/api/subjects.api';
import { getAccessToken } from '../auth/auth-storage';
import { useAuth } from '../auth/AuthContext';
import type { Article, ArticleStatus } from '../client/types/article.types';
import type { Quiz } from '../client/types/quiz.types';
import type { Subject } from '../client/types/subject.types';
import { AdminApplicationReview } from './AdminApplicationReview';
import { Profile } from './Profile';
import './ReviewerDashboard.css';

export type AdminWorkspaceTab = 'OVERVIEW' | 'ARTICLES' | 'QUIZZES' | 'REVIEWERS' | 'SUBJECTS' | 'PROFILE';

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
      }
    }
  }, [isReviewerOrAdmin, activeTab, fetchArticles, fetchQuizzes, fetchSubjects]);

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
            }}
            data-testid="admin-tab-overview"
          >
            📊 System Overview
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
            }}
            data-testid="admin-tab-reviewers"
          >
            🩺 Reviewer Applications
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
          }}
          data-testid="admin-tab-articles"
        >
          📝 Clinical Articles
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
          }}
          data-testid="admin-tab-quizzes"
        >
          ❓ Medical Quizzes
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
            }}
            data-testid="admin-tab-subjects"
          >
            🏥 Specialties & Topics
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
          }}
          data-testid="admin-tab-profile"
        >
          👤 {isAdmin ? 'Admin Profile' : 'Reviewer Profile'}
        </button>
      </div>

      {/* VIEW: OVERVIEW (ADMIN ONLY) */}
      {isAdmin && activeTab === 'OVERVIEW' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* WELCOME BANNER */}
          <div
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
              <span className="reviewer-badge" style={{ marginBottom: '8px' }}>
                🛡️ Administration Portal
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
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
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
                <span style={{ fontSize: '20px' }}>🩺</span>
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
                <span style={{ fontSize: '20px' }}>📝</span>
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
                <span style={{ fontSize: '20px' }}>❓</span>
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
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((sub) => (
                      <tr key={sub.id}>
                        <td>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : isAdmin && activeTab === 'REVIEWERS' ? (
        <AdminApplicationReview />
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
