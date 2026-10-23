import React from 'react';
import type { RouteState } from './route-utils';
import type { UserRole } from '../client/types/auth.types';
import type { AdminWorkspaceTab } from './ReviewerDashboard';
import './Sidebar.css';

export interface SidebarProps {
  activeRoute: RouteState;
  onNavigate: (type: 'dashboard' | 'reviewer-dashboard' | 'apply-reviewer' | 'article-list' | 'subject-list' | 'topic-list' | 'quiz-list' | 'profile') => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  currentRole: UserRole;
  adminTab?: AdminWorkspaceTab;
  onSelectAdminTab?: (tab: AdminWorkspaceTab) => void;
  onSwitchToPublic?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeRoute,
  onNavigate,
  isOpen,
  onCloseMobile,
  currentRole,
  adminTab = 'OVERVIEW',
  onSelectAdminTab,
  onSwitchToPublic,
}) => {
  const isDashboardActive = activeRoute.type === 'dashboard';
  const isArticlesActive = activeRoute.type === 'article-list' || activeRoute.type === 'article-detail';
  const isSubjectsActive = activeRoute.type === 'subject-list' || activeRoute.type === 'subject-detail';
  const isTopicsActive = activeRoute.type === 'topic-list';
  const isQuizzesActive = activeRoute.type === 'quiz-list' || activeRoute.type === 'quiz-detail' || activeRoute.type === 'quiz-attempts';
  const isApplyReviewerActive = activeRoute.type === 'apply-reviewer';

  const handleSelectNav = (type: 'dashboard' | 'reviewer-dashboard' | 'apply-reviewer' | 'article-list' | 'subject-list' | 'topic-list' | 'quiz-list' | 'profile') => {
    onNavigate(type);
    onCloseMobile();
  };

  const handleAdminTabClick = (tab: AdminWorkspaceTab) => {
    if (onSelectAdminTab) {
      onSelectAdminTab(tab);
    }
    // Ensure we are on reviewer-dashboard / admin route
    if (activeRoute.type !== 'reviewer-dashboard') {
      onNavigate('reviewer-dashboard');
    }
    onCloseMobile();
  };

  return (
    <>
      {/* MOBILE BACKDROP OVERLAY */}
      <div
        className={`medcore-sidebar-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      {/* SIDEBAR NAVIGATION */}
      <aside className={`medcore-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-nav-container">
          {/* ============================================================== */}
          {/* ROLE: ADMINISTRATOR — DEDICATED ADMIN CONTROL CONSOLE           */}
          {/* ============================================================== */}
          {currentRole === 'ADMIN' ? (
            <>
              <div className="sidebar-section-group">
                <div className="sidebar-section-header">Admin Control Center</div>

                {/* 1. SYSTEM OVERVIEW */}
                <button
                  type="button"
                  className={`sidebar-nav-item ${adminTab === 'OVERVIEW' && activeRoute.type === 'reviewer-dashboard' ? 'active' : ''}`}
                  onClick={() => handleAdminTabClick('OVERVIEW')}
                  data-testid="admin-nav-overview"
                >
                  <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                  </svg>
                  <span className="nav-item-label">System Overview</span>
                </button>

                {/* 2. REVIEWER APPLICATIONS */}
                <button
                  type="button"
                  className={`sidebar-nav-item ${adminTab === 'REVIEWERS' && activeRoute.type === 'reviewer-dashboard' ? 'active' : ''}`}
                  onClick={() => handleAdminTabClick('REVIEWERS')}
                  data-testid="admin-nav-reviewers"
                >
                  <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <polyline points="17 11 19 13 23 9" />
                  </svg>
                  <span className="nav-item-label">Reviewer Applications</span>
                  <span className="nav-item-badge" style={{ background: '#d97706', color: '#ffffff' }}>
                    Review
                  </span>
                </button>

                {/* 3. MANAGE ARTICLES */}
                <button
                  type="button"
                  className={`sidebar-nav-item ${adminTab === 'ARTICLES' && activeRoute.type === 'reviewer-dashboard' ? 'active' : ''}`}
                  onClick={() => handleAdminTabClick('ARTICLES')}
                  data-testid="admin-nav-articles"
                >
                  <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  <span className="nav-item-label">Manage Articles</span>
                </button>

                {/* 4. MANAGE QUIZZES */}
                <button
                  type="button"
                  className={`sidebar-nav-item ${adminTab === 'QUIZZES' && activeRoute.type === 'reviewer-dashboard' ? 'active' : ''}`}
                  onClick={() => handleAdminTabClick('QUIZZES')}
                  data-testid="admin-nav-quizzes"
                >
                  <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span className="nav-item-label">Manage Quizzes</span>
                </button>

                {/* 5. SPECIALTIES & TOPICS */}
                <button
                  type="button"
                  className={`sidebar-nav-item ${adminTab === 'SUBJECTS' && activeRoute.type === 'reviewer-dashboard' ? 'active' : ''}`}
                  onClick={() => handleAdminTabClick('SUBJECTS')}
                  data-testid="admin-nav-subjects"
                >
                  <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                  <span className="nav-item-label">Specialties & Topics</span>
                </button>

                {/* 6. ADMIN PROFILE */}
                <button
                  type="button"
                  className={`sidebar-nav-item ${adminTab === 'PROFILE' ? 'active' : ''}`}
                  onClick={() => handleAdminTabClick('PROFILE')}
                  data-testid="admin-nav-profile"
                >
                  <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="nav-item-label">Admin Profile</span>
                  <span className="nav-item-badge">Admin</span>
                </button>
              </div>

              {/* SEPARATE STUDENT SITE PREVIEW SECTION */}
              <div className="sidebar-section-group" style={{ marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div className="sidebar-section-header">Student View Preview</div>
                <button
                  type="button"
                  className="sidebar-nav-item"
                  onClick={() => {
                    if (onSwitchToPublic) onSwitchToPublic();
                    onCloseMobile();
                  }}
                  title="Preview the public student learning portal"
                >
                  <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  <span className="nav-item-label">View Student Platform</span>
                </button>
              </div>
            </>
          ) : currentRole === 'MEDICAL_REVIEWER' ? (
            /* ============================================================== */
            /* ROLE: MEDICAL REVIEWER — REVIEWER WORKSPACE                     */
            /* ============================================================== */
            <>
              <div className="sidebar-section-group">
                <div className="sidebar-section-header">Reviewer Workspace</div>

                <button
                  type="button"
                  className={`sidebar-nav-item ${adminTab === 'ARTICLES' && activeRoute.type === 'reviewer-dashboard' ? 'active' : ''}`}
                  onClick={() => handleAdminTabClick('ARTICLES')}
                >
                  <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                  </svg>
                  <span className="nav-item-label">Clinical Articles</span>
                  <span className="nav-item-badge" style={{ background: 'var(--teal-500)', color: '#ffffff' }}>
                    Author
                  </span>
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${adminTab === 'QUIZZES' && activeRoute.type === 'reviewer-dashboard' ? 'active' : ''}`}
                  onClick={() => handleAdminTabClick('QUIZZES')}
                >
                  <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span className="nav-item-label">Medical Quizzes</span>
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${adminTab === 'PROFILE' ? 'active' : ''}`}
                  onClick={() => handleAdminTabClick('PROFILE')}
                >
                  <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="nav-item-label">Reviewer Profile</span>
                </button>
              </div>

              {/* SEPARATE STUDENT SITE PREVIEW */}
              <div className="sidebar-section-group" style={{ marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div className="sidebar-section-header">Student View Preview</div>
                <button
                  type="button"
                  className="sidebar-nav-item"
                  onClick={() => {
                    if (onSwitchToPublic) onSwitchToPublic();
                    onCloseMobile();
                  }}
                >
                  <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  <span className="nav-item-label">View Student Platform</span>
                </button>
              </div>
            </>
          ) : (
            /* ============================================================== */
            /* ROLE: STUDENT — LEARNING & CURRICULUM DISCOVERY                */
            /* ============================================================== */
            <>
              <div className="sidebar-section-group">
                <div className="sidebar-section-header">Core Navigation</div>

                <button
                  type="button"
                  className={`sidebar-nav-item ${isDashboardActive ? 'active' : ''}`}
                  onClick={() => handleSelectNav('dashboard')}
                >
                  <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                  </svg>
                  <span className="nav-item-label">Dashboard</span>
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${isArticlesActive ? 'active' : ''}`}
                  onClick={() => handleSelectNav('article-list')}
                >
                  <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  <span className="nav-item-label">Articles</span>
                  <span className="nav-item-badge">Verified</span>
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${isSubjectsActive ? 'active' : ''}`}
                  onClick={() => handleSelectNav('subject-list')}
                >
                  <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                  <span className="nav-item-label">Subjects</span>
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${isTopicsActive ? 'active' : ''}`}
                  onClick={() => handleSelectNav('topic-list')}
                >
                  <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                  <span className="nav-item-label">Topics</span>
                </button>

                <button
                  type="button"
                  className={`sidebar-nav-item ${isQuizzesActive ? 'active' : ''}`}
                  onClick={() => handleSelectNav('quiz-list')}
                  data-testid="sidebar-quizzes-btn"
                >
                  <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span className="nav-item-label">Quizzes</span>
                </button>
              </div>

              <div className="sidebar-section-group" style={{ marginTop: '16px' }}>
                <div className="sidebar-section-header">Become a Reviewer</div>

                <button
                  type="button"
                  className={`sidebar-nav-item ${isApplyReviewerActive ? 'active' : ''}`}
                  onClick={() => handleSelectNav('apply-reviewer')}
                  data-testid="sidebar-apply-reviewer-btn"
                >
                  <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="17" y1="11" x2="23" y2="11" />
                  </svg>
                  <span className="nav-item-label">Apply as Reviewer</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* SIDEBAR FOOTER */}
        <div className="sidebar-footer">
          <div className="footer-info-row">
            <span className="platform-version">
              {currentRole === 'ADMIN' ? 'Admin Portal' : currentRole === 'MEDICAL_REVIEWER' ? 'Reviewer Portal' : 'MedCore Platform'}
            </span>
            <span className="nav-item-badge">v1.0</span>
          </div>
          <div className="platform-subtitle">
            {currentRole === 'ADMIN' ? 'Full System Governance' : 'Clinical Learning System'}
          </div>
        </div>
      </aside>
    </>
  );
};
