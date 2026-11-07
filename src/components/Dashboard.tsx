import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { SubjectsApiClient } from '../client/api/subjects.api';
import { TopicsApiClient } from '../client/api/topics.api';
import { ArticlesApiClient } from '../client/api/articles.api';
import './Dashboard.css';

export interface DashboardProps {
  onNavigateToSubjects: () => void;
  onNavigateToTopics: () => void;
  onNavigateToArticles: () => void;
  onNavigateToQuizzes?: () => void;
  onNavigateToQuizAttempts?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToApplyReviewer?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateToSubjects,
  onNavigateToTopics,
  onNavigateToArticles,
  onNavigateToQuizzes,
  onNavigateToQuizAttempts,
  onNavigateToProfile,
  onNavigateToApplyReviewer,
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    subjectsCount: 0,
    topicsCount: 0,
    articlesCount: 0,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardStats() {
      try {
        const [subjectsRes, topicsRes, articlesRes] = await Promise.allSettled([
          SubjectsApiClient.getSubjects({ limit: 1 }),
          TopicsApiClient.getTopics({ limit: 1 }),
          ArticlesApiClient.getArticles({ limit: 1 }),
        ]);

        if (!isMounted) return;

        const subjectsCount =
          subjectsRes.status === 'fulfilled' ? subjectsRes.value.meta?.total || subjectsRes.value.data?.length || 0 : 0;
        const topicsCount =
          topicsRes.status === 'fulfilled' ? topicsRes.value.meta?.total || topicsRes.value.data?.length || 0 : 0;
        const articlesCount =
          articlesRes.status === 'fulfilled' ? articlesRes.value.meta?.total || articlesRes.value.data?.length || 0 : 0;

        setStats({
          subjectsCount,
          topicsCount,
          articlesCount,
          loading: false,
        });
      } catch {
        if (isMounted) {
          setStats((prev) => ({ ...prev, loading: false }));
        }
      }
    }

    loadDashboardStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const studentName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'Medical Student';

  return (
    <div className="medcore-student-dashboard">
      {/* 1. HORIZONTAL STUDENT SUBNAV BAR */}
      <div className="student-horizontal-subnav">
        <div className="student-profile-strip">
          <div className="student-avatar-badge">
            {user?.firstName ? user.firstName[0].toUpperCase() : 'S'}
          </div>
          <div className="student-info-meta">
            <div className="student-name-row">
              <span className="student-display-name">{studentName}</span>
              <span className="student-status-indicator">
                <span className="pulse-dot" />
                Active Student
              </span>
            </div>
            <span className="student-institution">
              Jeyapura Medical Faculty • Clinical Learning Portal
            </span>
          </div>
        </div>

        {/* HORIZONTAL QUICK NAV LINKS */}
        <nav className="student-horizontal-nav-links" aria-label="Student Navigation">
          <button
            type="button"
            className="student-nav-pill active"
            title="Overview"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
            Dashboard
          </button>

          <button
            type="button"
            className="student-nav-pill"
            onClick={onNavigateToSubjects}
            title="Browse Medical Specialties"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            Specialties
          </button>

          <button
            type="button"
            className="student-nav-pill"
            onClick={onNavigateToTopics}
            title="Explore Clinical Topics"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            Topics
          </button>

          <button
            type="button"
            className="student-nav-pill"
            onClick={onNavigateToArticles}
            title="Read Peer-Reviewed Articles"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Articles
          </button>

          {onNavigateToQuizzes && (
            <button
              type="button"
              className="student-nav-pill"
              onClick={onNavigateToQuizzes}
              title="Self-Assessment Medical Quizzes"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Quizzes
            </button>
          )}

          {onNavigateToQuizAttempts && (
            <button
              type="button"
              className="student-nav-pill highlight"
              onClick={onNavigateToQuizAttempts}
              title="Review Your Test Scores"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              My Scores
            </button>
          )}

          {onNavigateToProfile && (
            <button
              type="button"
              className="student-nav-pill"
              onClick={onNavigateToProfile}
              title="Student Profile"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Profile
            </button>
          )}
        </nav>
      </div>

      {/* 2. HERO BANNER */}
      <section className="student-hero-card">
        <div className="hero-content-column">
          <div className="hero-pill-tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Medical Student Academic Portal
          </div>
          <h1 className="hero-title">Welcome to your Medical Learning Workspace</h1>
          <p className="hero-subtitle">
            Explore structured medical subjects, core anatomical topics, and peer-reviewed clinical articles designed for medical students, clinicians, and reviewers.
          </p>

          <div className="hero-actions">
            <button type="button" className="btn-hero-primary" onClick={onNavigateToSubjects}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              Explore Subjects
            </button>

            <button type="button" className="btn-hero-secondary" onClick={onNavigateToArticles}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Browse Peer-Reviewed Articles
            </button>

            {onNavigateToQuizzes && (
              <button type="button" className="btn-hero-accent" onClick={onNavigateToQuizzes}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Take a Quiz
              </button>
            )}

            {onNavigateToQuizAttempts && (
              <button type="button" className="btn-hero-outline" onClick={onNavigateToQuizAttempts}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                My Quiz Scores
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. HORIZONTAL METRICS ROW */}
      <section className="dashboard-metrics-grid">
        <div className="metric-card" onClick={onNavigateToSubjects} style={{ cursor: 'pointer' }}>
          <div className="metric-info">
            <span className="metric-title">Medical Subjects</span>
            <span className="metric-value">
              {stats.loading ? '...' : stats.subjectsCount}
            </span>
            <span className="metric-description">Curriculum Core Modules</span>
          </div>
          <div className="metric-icon-box sky">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
        </div>

        <div className="metric-card" onClick={onNavigateToTopics} style={{ cursor: 'pointer' }}>
          <div className="metric-info">
            <span className="metric-title">Clinical Topics</span>
            <span className="metric-value">
              {stats.loading ? '...' : stats.topicsCount}
            </span>
            <span className="metric-description">Anatomical & Physiological</span>
          </div>
          <div className="metric-icon-box teal">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
        </div>

        <div className="metric-card" onClick={onNavigateToArticles} style={{ cursor: 'pointer' }}>
          <div className="metric-info">
            <span className="metric-title">Peer-Reviewed Articles</span>
            <span className="metric-value">
              {stats.loading ? '...' : stats.articlesCount}
            </span>
            <span className="metric-description">Published Guides</span>
          </div>
          <div className="metric-icon-box sky">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
        </div>

        <div className="metric-card" onClick={onNavigateToQuizzes || onNavigateToArticles} style={{ cursor: 'pointer' }}>
          <div className="metric-info">
            <span className="metric-title">Interactive Quizzes</span>
            <span className="metric-value" style={{ color: '#0284c7' }}>
              Practice
            </span>
            <span className="metric-description">MCQs & Self-Assessment</span>
          </div>
          <div className="metric-icon-box green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        </div>
      </section>

      {/* 4. CORE CLINICAL SECTIONS */}
      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <h2 className="section-title">Core Sections</h2>
          <span className="section-subtitle-tag">Clinical Curriculum Modules</span>
        </div>

        <div className="quick-action-grid">
          <div className="quick-card" onClick={onNavigateToSubjects}>
            <div className="quick-card-header">
              <div className="quick-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <span className="quick-card-title">Medical Subjects</span>
            </div>
            <p className="quick-card-desc">
              Browse foundational medical subjects such as Anatomy, Physiology, Pathology, and Pharmacology.
            </p>
            <div className="quick-card-footer">
              Explore Subjects
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>

          <div className="quick-card" onClick={onNavigateToTopics}>
            <div className="quick-card-header">
              <div className="quick-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <span className="quick-card-title">Clinical Topics</span>
            </div>
            <p className="quick-card-desc">
              Dive into specific anatomical structures, physiological concepts, and organ system topics.
            </p>
            <div className="quick-card-footer">
              Explore Topics
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>

          <div className="quick-card" onClick={onNavigateToArticles}>
            <div className="quick-card-header">
              <div className="quick-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <span className="quick-card-title">Peer-Reviewed Articles</span>
            </div>
            <p className="quick-card-desc">
              Read comprehensive clinical guides, articles, and peer-reviewed reference materials.
            </p>
            <div className="quick-card-footer">
              Read Articles
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>

          {onNavigateToQuizzes && (
            <div className="quick-card" onClick={onNavigateToQuizzes}>
              <div className="quick-card-header">
                <div className="quick-card-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <span className="quick-card-title">Medical Quizzes</span>
              </div>
              <p className="quick-card-desc">
                Test your knowledge across core medical subjects and clinical topics with self-assessment quizzes.
              </p>
              <div className="quick-card-footer">
                Take Quizzes
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. BECOME A REVIEWER HORIZONTAL BANNER */}
      {onNavigateToApplyReviewer && (
        <section className="student-reviewer-pathway-card">
          <div className="reviewer-pathway-content">
            <div className="reviewer-pathway-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <polyline points="17 11 19 13 23 9" />
              </svg>
            </div>
            <div className="reviewer-pathway-text">
              <h3 className="reviewer-pathway-title">Interested in Academic Peer Review?</h3>
              <p className="reviewer-pathway-desc">
                Advanced medical students, clinical fellows, and researchers can apply to become verified Medical Reviewers to evaluate student articles and contribute to faculty-reviewed curriculum guides.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-apply-reviewer"
            onClick={onNavigateToApplyReviewer}
          >
            Apply as Reviewer
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </section>
      )}
    </div>
  );
};
