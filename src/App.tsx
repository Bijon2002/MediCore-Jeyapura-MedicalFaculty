import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Home } from './components/Home';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { Dashboard } from './components/Dashboard';
import { ReviewerDashboard } from './components/ReviewerDashboard';
import { ArticleEditor } from './components/ArticleEditor';
import { QuizEditor } from './components/QuizEditor';
import { ArticleList } from './components/ArticleList';
import { ArticleDetail } from './components/ArticleDetail';
import { SubjectList } from './components/SubjectList';
import { SubjectDetail } from './components/SubjectDetail';
import { TopicList } from './components/TopicList';
import { QuizList } from './components/QuizList';
import { QuizDetail } from './components/QuizDetail';
import { QuizAttempts } from './components/QuizAttempts';
import { Login } from './components/Login';
import { Registration } from './components/Registration';
import { Profile } from './components/Profile';
import { ReviewerApplication } from './components/ReviewerApplication';
import { AppPreloader } from './components/AppPreloader';
import { FloatingAiChat } from './components/FloatingAiChat';
import { Developers } from './components/Developers';
import { DeveloperDetail } from './components/DeveloperDetail';
import { ForStudents } from './components/ForStudents';
import { ForEducators } from './components/ForEducators';
import { Features } from './components/Features';
import { PolicyPage } from './components/PolicyPage';
import { parseRoute, pushRoute, type RouteState } from './components/route-utils';
import { useAuth } from './auth/AuthContext';
import type { Article } from './client/types/article.types';
import type { Subject } from './client/types/subject.types';
import type { UserRole } from './client/types/auth.types';
import type { AdminWorkspaceTab } from './components/ReviewerDashboard';
import './App.css';

function App() {
  const { user, isLoading } = useAuth();
  const [route, setRoute] = useState<RouteState>(() => parseRoute());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);
  const currentRole: UserRole = user?.role || 'STUDENT';
  const [adminActiveTab, setAdminActiveTab] = useState<AdminWorkspaceTab>('OVERVIEW');

  const isStudentWorkspaceRoute =
    currentRole === 'STUDENT' &&
    (route.type === 'dashboard' ||
      route.type === 'quiz-attempts' ||
      route.type === 'profile' ||
      route.type === 'apply-reviewer');

  const isWorkspaceRoute =
    ((currentRole === 'ADMIN' || currentRole === 'MEDICAL_REVIEWER') &&
      (route.type === 'reviewer-dashboard' ||
        route.type === 'create-article' ||
        route.type === 'edit-article' ||
        route.type === 'create-quiz' ||
        route.type === 'edit-quiz')) ||
    isStudentWorkspaceRoute;

  const hasSidebar = isWorkspaceRoute;

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseRoute());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToHome = () => {
    setRoute({ type: 'home' });
    pushRoute('/');
  };

  const navigateToAbout = () => {
    setRoute({ type: 'about' });
    pushRoute('/about');
  };

  const navigateToContact = () => {
    setRoute({ type: 'contact' });
    pushRoute('/contact');
  };

  const navigateToLogin = () => {
    setRoute({ type: 'login' });
    pushRoute('/login');
  };

  const navigateToRegister = () => {
    setRoute({ type: 'register' });
    pushRoute('/register');
  };

  const navigateToProfile = () => {
    if (user?.role === 'ADMIN') {
      setAdminActiveTab('PROFILE');
      setRoute({ type: 'reviewer-dashboard' });
      pushRoute('/admin');
    } else if (user?.role === 'MEDICAL_REVIEWER') {
      setAdminActiveTab('PROFILE');
      setRoute({ type: 'reviewer-dashboard' });
      pushRoute('/reviewer');
    } else {
      setRoute({ type: 'profile' });
      pushRoute('/profile');
    }
  };

  const handleLoginSuccess = (userRole: UserRole) => {
    if (userRole === 'ADMIN') {
      setAdminActiveTab('OVERVIEW');
      setRoute({ type: 'reviewer-dashboard' });
      pushRoute('/admin');
    } else if (userRole === 'MEDICAL_REVIEWER') {
      setAdminActiveTab('ARTICLES');
      setRoute({ type: 'reviewer-dashboard' });
      pushRoute('/reviewer');
    } else {
      setRoute({ type: 'dashboard' });
      pushRoute('/dashboard');
    }
  };

  // Route protection effect based on authenticated user?.role
  useEffect(() => {
    if (isLoading) return;

    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    const isAdminRoute = route.type === 'reviewer-dashboard' && (path === '/admin' || path === '/admin/');
    const isReviewerRoute = route.type === 'reviewer-dashboard' && !isAdminRoute;
    const isCreateRoute = route.type === 'create-article' || route.type === 'create-quiz';
    const isEditRoute = route.type === 'edit-article' || route.type === 'edit-quiz';
    const isLoginRoute = route.type === 'login';
    const isRegisterRoute = route.type === 'register';
    const isProfileRoute = route.type === 'profile';
    const isDashboardRoute = route.type === 'dashboard';

    // If user is not logged in, prevent showing any dashboard/workspace route and move to home
    if (!user) {
      if (isAdminRoute || isReviewerRoute || isDashboardRoute || isCreateRoute || isEditRoute || isProfileRoute) {
        navigateToHome();
        return;
      }
    }

    const role = user?.role;

    // If authenticated user visits /login or /register, redirect to their role dashboard
    if ((isLoginRoute || isRegisterRoute) && role) {
      handleLoginSuccess(role);
      return;
    }

    // Protect /profile route
    if (isProfileRoute && !role) {
      navigateToHome();
      return;
    }

    // Redirect admin & reviewer /dashboard directly to their dedicated workspaces
    if (isDashboardRoute && role === 'ADMIN') {
      setAdminActiveTab('OVERVIEW');
      setRoute({ type: 'reviewer-dashboard' });
      pushRoute('/admin');
      return;
    }
    if (isDashboardRoute && role === 'MEDICAL_REVIEWER') {
      setAdminActiveTab('ARTICLES');
      setRoute({ type: 'reviewer-dashboard' });
      pushRoute('/reviewer');
      return;
    }

    // Redirect admin & reviewer /profile to workspace profile tab so the layout stays dedicated
    if (isProfileRoute && role === 'ADMIN') {
      setAdminActiveTab('PROFILE');
      setRoute({ type: 'reviewer-dashboard' });
      pushRoute('/admin');
      return;
    }
    if (isProfileRoute && role === 'MEDICAL_REVIEWER') {
      setAdminActiveTab('PROFILE');
      setRoute({ type: 'reviewer-dashboard' });
      pushRoute('/reviewer');
      return;
    }

    if (isAdminRoute) {
      if (role !== 'ADMIN') {
        navigateToHome();
      }
    } else if (isReviewerRoute || isCreateRoute || isEditRoute) {
      if (role !== 'MEDICAL_REVIEWER' && role !== 'ADMIN') {
        navigateToHome();
      }
    }
  }, [route, user, isLoading]);

  // Navigation callbacks
  const navigateToApplyReviewer = () => {
    setRoute({ type: 'apply-reviewer' });
    pushRoute('/apply-reviewer');
  };

  const navigateToDashboard = () => {
    if (user?.role === 'ADMIN') {
      setAdminActiveTab('OVERVIEW');
      setRoute({ type: 'reviewer-dashboard' });
      pushRoute('/admin');
    } else if (user?.role === 'MEDICAL_REVIEWER') {
      setAdminActiveTab('ARTICLES');
      setRoute({ type: 'reviewer-dashboard' });
      pushRoute('/reviewer');
    } else {
      setRoute({ type: 'dashboard' });
      pushRoute('/dashboard');
    }
  };

  const navigateToReviewerDashboard = () => {
    setRoute({ type: 'reviewer-dashboard' });
    pushRoute('/reviewer');
  };

  const navigateToCreateArticle = () => {
    setRoute({ type: 'create-article' });
    pushRoute('/articles/new');
  };

  const navigateToEditArticle = (articleId: string) => {
    setRoute({ type: 'edit-article', articleId });
    pushRoute(`/articles/edit/${articleId}`);
  };

  const navigateToCreateQuiz = () => {
    setRoute({ type: 'create-quiz' });
    pushRoute('/quizzes/new');
  };

  const navigateToEditQuiz = (quizId: string) => {
    setRoute({ type: 'edit-quiz', quizId });
    pushRoute(`/quizzes/edit/${quizId}`);
  };

  const navigateToArticles = () => {
    setRoute({ type: 'article-list' });
    pushRoute('/articles');
  };

  const navigateToArticleDetail = (article: Article) => {
    if (article.slug) {
      setRoute({ type: 'article-detail', slug: article.slug });
      pushRoute(`/articles/${article.slug}`);
    }
  };

  const navigateToSubjects = () => {
    setRoute({ type: 'subject-list' });
    pushRoute('/subjects');
  };

  const navigateToSubjectDetail = (subject: Subject) => {
    setRoute({ type: 'subject-detail', subjectSlug: subject.slug });
    pushRoute(`/subjects/${subject.slug}`);
  };

  const navigateToTopic = (subjectSlug: string, topicSlug: string | null) => {
    if (topicSlug) {
      setRoute({ type: 'subject-detail', subjectSlug, topicSlug });
      pushRoute(`/subjects/${subjectSlug}/topics/${topicSlug}`);
    } else {
      setRoute({ type: 'subject-detail', subjectSlug });
      pushRoute(`/subjects/${subjectSlug}`);
    }
  };

  const navigateToTopics = () => {
    setRoute({ type: 'topic-list' });
    pushRoute('/topics');
  };

  const navigateToQuizzes = () => {
    setRoute({ type: 'quiz-list' });
    pushRoute('/quizzes');
  };

  const navigateToQuizAttempts = () => {
    setRoute({ type: 'quiz-attempts' });
    pushRoute('/quizzes/attempts');
  };

  const navigateToQuizDetail = (quizId: string) => {
    setRoute({ type: 'quiz-detail', quizId });
    pushRoute(`/quizzes/${quizId}`);
  };

  const navigateToFeatures = () => {
    setRoute({ type: 'features' });
    pushRoute('/features');
  };

  const navigateToForStudents = () => {
    setRoute({ type: 'for-students' });
    pushRoute('/for-students');
  };

  const navigateToForEducators = () => {
    setRoute({ type: 'for-educators' });
    pushRoute('/for-educators');
  };

  const navigateToDevelopers = () => {
    setRoute({ type: 'developers' });
    pushRoute('/developers');
  };

  const navigateToDeveloperDetail = (slug: string) => {
    setRoute({ type: 'developer-detail', slug });
    pushRoute(`/developers/${slug}`);
  };

  const navigateToPolicy = (policyType: 'editorial-policy' | 'content-guidelines' | 'medical-disclaimer' | 'privacy-policy' | 'terms') => {
    setRoute({ type: 'policy', policyType });
    pushRoute(`/${policyType}`);
  };

  const handleSwitchToWorkspace = () => {
    if (!user) {
      navigateToLogin();
    } else if (user.role === 'ADMIN') {
      setRoute({ type: 'reviewer-dashboard' });
      pushRoute('/admin');
    } else if (user.role === 'MEDICAL_REVIEWER') {
      navigateToReviewerDashboard();
    } else {
      navigateToDashboard();
    }
  };

  const handleSidebarNavigate = (
    type: 'dashboard' | 'reviewer-dashboard' | 'apply-reviewer' | 'article-list' | 'subject-list' | 'topic-list' | 'quiz-list' | 'profile' | 'quiz-attempts',
  ) => {
    switch (type) {
      case 'dashboard':
        navigateToDashboard();
        break;
      case 'reviewer-dashboard':
        navigateToReviewerDashboard();
        break;
      case 'apply-reviewer':
        navigateToApplyReviewer();
        break;
      case 'article-list':
        navigateToArticles();
        break;
      case 'subject-list':
        navigateToSubjects();
        break;
      case 'topic-list':
        navigateToTopics();
        break;
      case 'quiz-list':
        navigateToQuizzes();
        break;
      case 'quiz-attempts':
        navigateToQuizAttempts();
        break;
      case 'profile':
        setRoute({ type: 'profile' });
        pushRoute('/profile');
        break;
    }
  };

  return (
    <div className="medcore-app">
      {showPreloader && (
        <AppPreloader
          isReady={!isLoading}
          onLoaded={() => setShowPreloader(false)}
        />
      )}

      {/* HEADER */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
        onNavigateHome={navigateToHome}
        onNavigateToDashboard={navigateToDashboard}
        onNavigateToLogin={navigateToLogin}
        onNavigateToProfile={navigateToProfile}
        onNavigateToArticles={navigateToArticles}
        onNavigateToSubjects={navigateToSubjects}
        onNavigateToQuizzes={navigateToQuizzes}
        onNavigateToQuizAttempts={navigateToQuizAttempts}
        onNavigateToAbout={navigateToAbout}
        onNavigateToContact={navigateToContact}
        onSwitchToWorkspace={handleSwitchToWorkspace}
        isWorkspaceView={hasSidebar}
        activeRouteType={route.type}
        currentRole={currentRole}
      />

      {/* MAIN SHELL BODY */}
      <div className={`medcore-shell-body ${hasSidebar ? 'with-sidebar' : 'public-layout'}`}>
        {/* SIDEBAR NAVIGATION (Rendered on administrative/reviewer workspaces and student dashboard) */}
        {hasSidebar ? (
          <Sidebar
            activeRoute={route}
            onNavigate={handleSidebarNavigate}
            isOpen={isSidebarOpen}
            onCloseMobile={() => setIsSidebarOpen(false)}
            currentRole={currentRole}
            adminTab={adminActiveTab}
            onSelectAdminTab={(tab) => {
              setAdminActiveTab(tab);
              if (route.type !== 'reviewer-dashboard') {
                setRoute({ type: 'reviewer-dashboard' });
                pushRoute(currentRole === 'ADMIN' ? '/admin' : '/reviewer');
              }
            }}
            onSwitchToPublic={navigateToHome}
          />
        ) : null}

        {/* MAIN CONTENT AREA */}
        <main className={`medcore-main ${hasSidebar ? 'workspace-content' : 'public-content'}`}>
          {route.type === 'home' ? (
            <Home
              onNavigateToArticles={navigateToArticles}
              onNavigateToArticleDetail={navigateToArticleDetail}
              onNavigateToSubjects={navigateToSubjects}
              onNavigateToSubjectDetail={navigateToSubjectDetail}
              onNavigateToQuizzes={navigateToQuizzes}
              onNavigateToAbout={navigateToAbout}
              onNavigateToContact={navigateToContact}
              onSearchSubmit={() => navigateToArticles()}
            />
          ) : route.type === 'about' ? (
            <About
              onNavigateHome={navigateToHome}
              onNavigateToArticles={navigateToArticles}
              onNavigateToContact={navigateToContact}
              onNavigateToApplyReviewer={navigateToApplyReviewer}
            />
          ) : route.type === 'contact' ? (
            <Contact
              onNavigateHome={navigateToHome}
              onNavigateToArticles={navigateToArticles}
            />
          ) : route.type === 'features' ? (
            <Features
              onNavigateToQuizzes={navigateToQuizzes}
              onNavigateToArticles={navigateToArticles}
            />
          ) : route.type === 'for-students' ? (
            <ForStudents
              onNavigateToQuizzes={navigateToQuizzes}
              onNavigateToArticles={navigateToArticles}
              onNavigateToSpecialties={navigateToSubjects}
              onRegister={navigateToRegister}
            />
          ) : route.type === 'for-educators' ? (
            <ForEducators
              onApplyReviewer={navigateToApplyReviewer}
              onNavigateToArticles={navigateToArticles}
            />
          ) : route.type === 'developers' ? (
            <Developers
              onSelectDeveloper={navigateToDeveloperDetail}
              onNavigateHome={navigateToHome}
            />
          ) : route.type === 'developer-detail' ? (
            <DeveloperDetail
              slug={route.slug}
              onBackToDevelopers={navigateToDevelopers}
            />
          ) : route.type === 'policy' ? (
            <PolicyPage type={route.policyType} />
          ) : route.type === 'login' ? (
            <Login
              onLoginSuccess={handleLoginSuccess}
              onNavigateHome={navigateToHome}
              onNavigateToRegister={navigateToRegister}
            />
          ) : route.type === 'register' ? (
            <Registration
              onNavigateToLogin={navigateToLogin}
              onNavigateHome={navigateToHome}
            />
          ) : route.type === 'apply-reviewer' ? (
            <ReviewerApplication
              onNavigateToLogin={navigateToLogin}
              onNavigateToRegister={navigateToRegister}
              onNavigateToReviewerDashboard={navigateToReviewerDashboard}
            />
          ) : route.type === 'profile' ? (
            <Profile />
          ) : route.type === 'dashboard' ? (
            <Dashboard
              onNavigateToSubjects={navigateToSubjects}
              onNavigateToTopics={navigateToTopics}
              onNavigateToArticles={navigateToArticles}
              onNavigateToQuizzes={navigateToQuizzes}
              onNavigateToQuizAttempts={navigateToQuizAttempts}
              onNavigateToProfile={navigateToProfile}
              onNavigateToApplyReviewer={navigateToApplyReviewer}
            />
          ) : route.type === 'reviewer-dashboard' ? (
            <ReviewerDashboard
              onCreateArticle={navigateToCreateArticle}
              onEditArticle={navigateToEditArticle}
              onCreateQuiz={navigateToCreateQuiz}
              onEditQuiz={navigateToEditQuiz}
              activeTab={adminActiveTab}
              onTabChange={(tab) => setAdminActiveTab(tab)}
            />
          ) : route.type === 'create-article' ? (
            <ArticleEditor
              onSuccess={navigateToReviewerDashboard}
              onCancel={navigateToReviewerDashboard}
            />
          ) : route.type === 'edit-article' ? (
            <ArticleEditor
              articleId={route.articleId}
              onSuccess={navigateToReviewerDashboard}
              onCancel={navigateToReviewerDashboard}
            />
          ) : route.type === 'create-quiz' ? (
            <QuizEditor
              onSuccess={navigateToReviewerDashboard}
              onCancel={navigateToReviewerDashboard}
            />
          ) : route.type === 'edit-quiz' ? (
            <QuizEditor
              quizId={route.quizId}
              onSuccess={navigateToReviewerDashboard}
              onCancel={navigateToReviewerDashboard}
            />
          ) : route.type === 'article-detail' ? (
            <ArticleDetail slug={route.slug} onBack={navigateToArticles} />
          ) : route.type === 'subject-list' ? (
            <SubjectList onSelectSubject={navigateToSubjectDetail} />
          ) : route.type === 'subject-detail' ? (
            <SubjectDetail
              subjectSlug={route.subjectSlug}
              topicSlug={route.topicSlug}
              onSelectTopic={navigateToTopic}
              onArticleClick={navigateToArticleDetail}
              onBackToSubjects={navigateToSubjects}
            />
          ) : route.type === 'topic-list' ? (
            <TopicList onSelectTopic={navigateToTopic} />
          ) : route.type === 'quiz-list' ? (
            <QuizList onSelectQuiz={navigateToQuizDetail} onViewAttempts={navigateToQuizAttempts} />
          ) : route.type === 'quiz-attempts' ? (
            <QuizAttempts onBackToQuizzes={navigateToQuizzes} onStartQuiz={navigateToQuizDetail} />
          ) : route.type === 'quiz-detail' ? (
            <QuizDetail quizId={route.quizId} onBackToQuizzes={navigateToQuizzes} />
          ) : (
            <ArticleList
              onArticleClick={navigateToArticleDetail}
              onSelectSubject={(subjectSlug) => {
                navigateToSubjects();
                console.log('Selected subject:', subjectSlug);
              }}
            />
          )}

          {/* FOOTER (Shown on secondary pages, Home has its own comprehensive Pomaii footer) */}
          {route.type !== 'home' ? (
            <footer className="medcore-footer">
              <div className="footer-container">
                <div className="footer-brand" onClick={navigateToHome} style={{ cursor: 'pointer' }}>
                  <div className="footer-mini-icon">
                    <img src="/medcore-logo.png" alt="MedCore Logo" className="footer-mini-logo-img" />
                  </div>
                  <span>MedCore Clinical Platform</span>
                </div>
                <div className="footer-links">
                  <button type="button" onClick={navigateToHome}>Home</button>
                  <span>·</span>
                  <button type="button" onClick={navigateToArticles}>Articles</button>
                  <span>·</span>
                  <button type="button" onClick={navigateToSubjects}>Specialties</button>
                  <span>·</span>
                  <button type="button" onClick={navigateToQuizzes}>Quizzes</button>
                  <span>·</span>
                  <button type="button" onClick={navigateToAbout}>About Us</button>
                  <span>·</span>
                  <button type="button" onClick={navigateToFeatures}>Features</button>
                  <span>·</span>
                  <button type="button" onClick={navigateToForStudents}>For Students</button>
                  <span>·</span>
                  <button type="button" onClick={navigateToForEducators}>For Educators</button>
                  <span>·</span>
                  <button type="button" onClick={navigateToDevelopers}>Developers</button>
                  <span>·</span>
                  <button type="button" onClick={() => navigateToPolicy('editorial-policy')}>Editorial Policy</button>
                  <span>·</span>
                  <button type="button" onClick={() => navigateToPolicy('medical-disclaimer')}>Medical Disclaimer</button>
                  <span>·</span>
                  <button type="button" onClick={() => navigateToPolicy('privacy-policy')}>Privacy Policy</button>
                  <span>·</span>
                  <button type="button" onClick={() => navigateToPolicy('terms')}>Terms</button>
                  <span>·</span>
                  <button type="button" onClick={navigateToContact}>Contact</button>
                  <span>·</span>
                  <button type="button" onClick={handleSwitchToWorkspace}>Clinical Workspace</button>
                </div>
                <p className="footer-origin" style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>
                  medcore is a medical education project created by students of the Faculty of Medical Sciences, University of Sri Jayewardenepura, Sri Lanka.
                </p>
                <p className="footer-copy">
                  &copy; {new Date().getFullYear()} MedCore Medical Platform. All rights reserved.
                </p>
              </div>
            </footer>
          ) : null}
        </main>
      </div>

      {/* FLOATING AI ASSISTANT ON LEFT SIDE */}
      <FloatingAiChat />
    </div>
  );
}

export default App;
