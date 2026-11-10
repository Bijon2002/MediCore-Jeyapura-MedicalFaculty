import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import type { UserRole } from '../client/types/auth.types';
import './Header.css';

export interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onNavigateHome: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToLogin?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToArticles?: () => void;
  onNavigateToSubjects?: () => void;
  onNavigateToQuizzes?: () => void;
  onNavigateToQuizAttempts?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToContact?: () => void;
  onSwitchToWorkspace?: () => void;
  isWorkspaceView?: boolean;
  activeRouteType?: string;
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNavigateHome,
  onNavigateToDashboard,
  onNavigateToLogin,
  onNavigateToProfile,
  onNavigateToArticles,
  onNavigateToSubjects,
  onNavigateToQuizzes,
  onNavigateToQuizAttempts,
  onNavigateToAbout,
  onNavigateToContact,
  onSwitchToWorkspace,
  isWorkspaceView = false,
  activeRouteType = 'home',
  currentRole = 'STUDENT',
}) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const activeRole: UserRole = user?.role || currentRole;

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    }

    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const getRoleBadgeLabel = () => {
    switch (activeRole) {
      case 'MEDICAL_REVIEWER':
        return 'Medical Reviewer';
      case 'ADMIN':
        return 'Admin';
      default:
        return 'Medical Student';
    }
  };

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    try {
      await logout();
    } finally {
      if (onNavigateHome) {
        onNavigateHome();
      }
    }
  };

  const handleBrandClick = () => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    if (onNavigateHome) {
      onNavigateHome();
    }
  };

  const handleNavClick = (callback?: () => void) => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    if (callback) callback();
  };

  return (
    <header className="medcore-header">
      <div className="header-container">
        {/* LEFT SECTION: BRAND & SIDEBAR / MOBILE TOGGLE */}
        <div className="header-left">
          {isWorkspaceView ? (
            <button
              type="button"
              className="sidebar-toggle-btn"
              onClick={onToggleSidebar}
              aria-label="Toggle Navigation Sidebar"
              title="Toggle Sidebar"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              className="mobile-nav-toggle-btn"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle mobile menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}

          <div
            className="brand-logo"
            onClick={handleBrandClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleBrandClick();
              }
            }}
          >
            <div className="brand-icon-wrapper">
              <img src="/medcore-logo.png" alt="MedCore Logo" className="brand-logo-img" />
            </div>
            <div className="brand-text-block">
              <span className="brand-title">MedCore</span>
              <span className="brand-tagline">Explore. Learn. Discover.</span>
            </div>
          </div>
        </div>

        {/* CENTER SECTION: WORKSPACE BADGE OR MAIN PUBLIC NAVIGATION LINKS */}
        {isWorkspaceView ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '999px',
                background:
                  currentRole === 'ADMIN'
                    ? 'rgba(217, 119, 6, 0.12)'
                    : currentRole === 'MEDICAL_REVIEWER'
                    ? 'rgba(13, 148, 136, 0.12)'
                    : 'rgba(2, 132, 199, 0.12)',
                color:
                  currentRole === 'ADMIN'
                    ? '#d97706'
                    : currentRole === 'MEDICAL_REVIEWER'
                    ? 'var(--teal-500)'
                    : '#0284c7',
                border:
                  currentRole === 'ADMIN'
                    ? '1px solid rgba(217, 119, 6, 0.3)'
                    : currentRole === 'MEDICAL_REVIEWER'
                    ? '1px solid rgba(13, 148, 136, 0.3)'
                    : '1px solid rgba(2, 132, 199, 0.3)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              {currentRole === 'ADMIN'
                ? 'Administration Console'
                : currentRole === 'MEDICAL_REVIEWER'
                ? 'Reviewer Workspace'
                : 'Student Learning Workspace'}
            </span>
          </div>
        ) : (
          <nav className="header-nav-tabs" aria-label="Main Navigation">
            <button
              type="button"
              className={`nav-tab-btn ${activeRouteType === 'home' ? 'active' : ''}`}
              onClick={() => handleNavClick(onNavigateHome)}
            >
              Home
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeRouteType === 'article-list' || activeRouteType === 'article-detail' ? 'active' : ''}`}
              onClick={() => handleNavClick(onNavigateToArticles)}
            >
              Articles
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeRouteType === 'subject-list' || activeRouteType === 'subject-detail' || activeRouteType === 'topic-list' ? 'active' : ''}`}
              onClick={() => handleNavClick(onNavigateToSubjects)}
            >
              Specialties
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeRouteType === 'quiz-list' || activeRouteType === 'quiz-detail' || activeRouteType === 'quiz-attempts' ? 'active' : ''}`}
              onClick={() => handleNavClick(onNavigateToQuizzes)}
            >
              Quizzes
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeRouteType === 'about' ? 'active' : ''}`}
              onClick={() => handleNavClick(onNavigateToAbout)}
            >
              About Us
            </button>

            <button
              type="button"
              className={`nav-tab-btn ${activeRouteType === 'contact' ? 'active' : ''}`}
              onClick={() => handleNavClick(onNavigateToContact)}
            >
              Contact
            </button>
          </nav>
        )}

        {/* RIGHT SECTION: SEARCH, FAVORITES, WORKSPACE SWITCHER & PROFILE DROPDOWN */}
        <div className="header-right">
          {/* Quick Action Icon: Search */}
          <button
            type="button"
            className="header-action-icon-btn"
            onClick={onNavigateToArticles}
            title="Search clinical library"
            aria-label="Search articles"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          {/* Quick Action Icon: Favorites */}
          <button
            type="button"
            className="header-action-icon-btn"
            onClick={onNavigateToArticles}
            title="Saved & Bookmarked Guides"
            aria-label="Bookmarked Guides"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* 9-dot Grid Icon for Clinical Workspace */}
          <button
            type="button"
            className="header-action-icon-btn grid-menu-btn"
            onClick={isWorkspaceView ? onNavigateHome : onSwitchToWorkspace}
            title={isWorkspaceView ? 'Return to Public View' : 'Clinical Workspace / Dashboard'}
            aria-label="Switch Workspace"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="5" r="2" />
              <circle cx="12" cy="5" r="2" />
              <circle cx="19" cy="5" r="2" />
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
              <circle cx="5" cy="19" r="2" />
              <circle cx="12" cy="19" r="2" />
              <circle cx="19" cy="19" r="2" />
            </svg>
          </button>

          {/* If in workspace view, show return button */}
          {isWorkspaceView ? (
            <button
              type="button"
              className="btn-switch-portal to-public"
              onClick={onNavigateHome}
              title="Return to Public Medical Website"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>Public View</span>
            </button>
          ) : null}

          {/* User profile dropdown OR Sign in button */}
          {user ? (
            <div className="header-user-wrapper" ref={profileDropdownRef}>
              <button
                type="button"
                className={`user-profile-pill clickable ${profileDropdownOpen ? 'active' : ''}`}
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                aria-expanded={profileDropdownOpen}
                aria-haspopup="true"
                title={`${user.firstName || ''} ${user.lastName || ''} (${getRoleBadgeLabel()})`}
              >
                <div className="user-avatar">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Profile" className="user-avatar-img" />
                  ) : user?.firstName ? (
                    user.firstName[0].toUpperCase()
                  ) : (
                    activeRole[0]
                  )}
                </div>
                <span className="user-role-label">{getRoleBadgeLabel()}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className={`dropdown-chevron ${profileDropdownOpen ? 'open' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {profileDropdownOpen && (
                <div className="profile-dropdown-card" role="menu">
                  {/* User info banner */}
                  <div className="dropdown-user-header">
                    <div className="dropdown-user-avatar">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Profile" className="user-avatar-img" />
                      ) : user?.firstName ? (
                        user.firstName[0].toUpperCase()
                      ) : (
                        activeRole[0]
                      )}
                    </div>
                    <div className="dropdown-user-meta">
                      <strong className="dropdown-user-name">
                        {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : getRoleBadgeLabel()}
                      </strong>
                      <span className="dropdown-user-email">{user.email}</span>
                      <span className={`dropdown-role-tag ${activeRole.toLowerCase()}`}>
                        {getRoleBadgeLabel()}
                      </span>
                    </div>
                  </div>

                  <div className="dropdown-divider" />

                  {/* Menu Item: Dashboard */}
                  <button
                    type="button"
                    className="dropdown-menu-item"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      if (onNavigateToDashboard) onNavigateToDashboard();
                    }}
                    role="menuitem"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                    </svg>
                    <span>
                      {activeRole === 'ADMIN'
                        ? 'Admin Console'
                        : activeRole === 'MEDICAL_REVIEWER'
                        ? 'Reviewer Workspace'
                        : 'Student Dashboard'}
                    </span>
                  </button>

                  {/* Menu Item: Profile */}
                  <button
                    type="button"
                    className="dropdown-menu-item"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      if (onNavigateToProfile) onNavigateToProfile();
                    }}
                    role="menuitem"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>My Profile</span>
                  </button>

                  {/* Menu Item: Scores (Students only) */}
                  {activeRole === 'STUDENT' && (
                    <button
                      type="button"
                      className="dropdown-menu-item"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        if (onNavigateToQuizAttempts) onNavigateToQuizAttempts();
                        else if (onNavigateToQuizzes) onNavigateToQuizzes();
                      }}
                      role="menuitem"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                      <span>My Quiz Scores</span>
                    </button>
                  )}

                  <div className="dropdown-divider" />

                  {/* Menu Item: Sign Out */}
                  <button
                    type="button"
                    className="dropdown-menu-item logout-item"
                    onClick={handleLogout}
                    role="menuitem"
                    data-testid="logout-button"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="btn-header-login"
              onClick={onNavigateToLogin}
              title="Sign in to MedCore"
              data-testid="login-nav-button"
            >
              <span className="login-btn-label">Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {mobileMenuOpen && !isWorkspaceView ? (
        <div className="mobile-nav-dropdown">
          <button
            type="button"
            className={`mobile-nav-item ${activeRouteType === 'home' ? 'active' : ''}`}
            onClick={() => handleNavClick(onNavigateHome)}
          >
            Home
          </button>
          <button
            type="button"
            className={`mobile-nav-item ${activeRouteType === 'article-list' ? 'active' : ''}`}
            onClick={() => handleNavClick(onNavigateToArticles)}
          >
            Articles
          </button>
          <button
            type="button"
            className={`mobile-nav-item ${activeRouteType === 'subject-list' ? 'active' : ''}`}
            onClick={() => handleNavClick(onNavigateToSubjects)}
          >
            Specialties
          </button>
          <button
            type="button"
            className={`mobile-nav-item ${activeRouteType === 'quiz-list' ? 'active' : ''}`}
            onClick={() => handleNavClick(onNavigateToQuizzes)}
          >
            Quizzes
          </button>
          <button
            type="button"
            className={`mobile-nav-item ${activeRouteType === 'about' ? 'active' : ''}`}
            onClick={() => handleNavClick(onNavigateToAbout)}
          >
            About Us
          </button>
          <button
            type="button"
            className={`mobile-nav-item ${activeRouteType === 'contact' ? 'active' : ''}`}
            onClick={() => handleNavClick(onNavigateToContact)}
          >
            Contact
          </button>

          {user && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '6px' }}>
              <button
                type="button"
                className="mobile-nav-item"
                onClick={() => handleNavClick(onNavigateToDashboard)}
              >
                {activeRole === 'ADMIN' ? 'Admin Console' : activeRole === 'MEDICAL_REVIEWER' ? 'Reviewer Workspace' : 'Student Dashboard'}
              </button>
              <button
                type="button"
                className="mobile-nav-item"
                onClick={() => handleNavClick(onNavigateToProfile)}
              >
                My Profile
              </button>
              <button
                type="button"
                className="mobile-nav-item"
                style={{ color: '#dc2626' }}
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      ) : null}
    </header>
  );
};
