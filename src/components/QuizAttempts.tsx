import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAccessToken } from '../auth/auth-storage';
import { QuizzesApiClient } from '../client/api/quizzes.api';
import type { QuizAttemptHistoryItem, Quiz } from '../client/types/quiz.types';
import { ApiClientError } from '../client/api/api-client';
import './QuizAttempts.css';

export interface QuizAttemptsProps {
  onBackToQuizzes: () => void;
  onStartQuiz?: (quizId: string) => void;
}

export const QuizAttempts: React.FC<QuizAttemptsProps> = ({ onBackToQuizzes, onStartQuiz }) => {
  const [attempts, setAttempts] = useState<QuizAttemptHistoryItem[]>([]);
  const [suggestedQuizzes, setSuggestedQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthenticated, setUnauthenticated] = useState<boolean>(false);

  const fetchAttempts = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUnauthenticated(false);

    const token = getAccessToken();
    if (!token) {
      setUnauthenticated(true);
      setLoading(false);
      return;
    }

    try {
      const [attemptsData, allQuizzes] = await Promise.allSettled([
        QuizzesApiClient.getMyAttempts(token),
        QuizzesApiClient.getQuizzes(),
      ]);

      if (attemptsData.status === 'fulfilled') {
        setAttempts(attemptsData.value || []);
      }
      if (allQuizzes.status === 'fulfilled') {
        setSuggestedQuizzes(allQuizzes.value || []);
      }
      setLoading(false);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setError(err.message || 'Failed to load quiz attempts. Please try again.');
      } else {
        setError('An unexpected error occurred while fetching quiz attempts.');
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttempts();
  }, [fetchAttempts]);

  const stats = useMemo(() => {
    if (attempts.length === 0) {
      return { total: 0, avg: 0, best: 0 };
    }
    const total = attempts.length;
    const avg = Math.round(attempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / total);
    const best = Math.max(...attempts.map((a) => a.percentage || 0));
    return { total, avg, best };
  }, [attempts]);

  const formatDate = (dateValue: string | Date): string => {
    try {
      const date = new Date(dateValue);
      return date.toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return String(dateValue);
    }
  };

  const getScoreGrade = (percentage: number) => {
    if (percentage >= 80) {
      return {
        label: 'High Distinction',
        gradeClass: 'grade-excellent',
      };
    }
    if (percentage >= 60) {
      return {
        label: 'Passed',
        gradeClass: 'grade-pass',
      };
    }
    return {
      label: 'Needs Review',
      gradeClass: 'grade-review',
    };
  };

  if (unauthenticated) {
    return (
      <div className="medcore-quiz-attempts-container">
        <div className="quiz-state-card quiz-auth-state">
          <div className="quiz-state-icon-wrapper">
            <svg
              className="quiz-state-icon"
              viewBox="0 0 24 24"
              width="36"
              height="36"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="quiz-state-title">Authentication Required</h2>
          <p className="quiz-state-message">
            Please log in to view your quiz attempt history.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="medcore-quiz-attempts-container">
        <div className="quiz-attempts-header">
          <div className="quiz-attempts-title-area">
            <h1 className="quiz-attempts-title">My Quiz Attempts</h1>
            <p className="quiz-attempts-subtitle">
              Review your previous quiz submissions and test performance history.
            </p>
          </div>
        </div>
        <div className="quiz-skeleton-grid" aria-label="Loading quiz attempts">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="quiz-skeleton-card">
              <div className="quiz-skeleton-badge-row">
                <div className="quiz-skeleton-badge" />
                <div className="quiz-skeleton-badge short" />
              </div>
              <div className="quiz-skeleton-title" />
              <div className="quiz-skeleton-text" />
              <div className="quiz-skeleton-footer" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="medcore-quiz-attempts-container">
        <div className="quiz-attempts-header">
          <div className="quiz-attempts-title-area">
            <h1 className="quiz-attempts-title">My Quiz Attempts</h1>
          </div>
          <button
            type="button"
            className="quiz-back-btn"
            onClick={onBackToQuizzes}
            aria-label="Back to Quizzes"
          >
            <svg
              className="quiz-back-btn-icon"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Quizzes
          </button>
        </div>
        <div className="quiz-state-card quiz-error-state" role="alert">
          <div className="quiz-state-icon-wrapper quiz-error-icon-wrapper">
            <svg
              className="quiz-state-icon"
              viewBox="0 0 24 24"
              width="36"
              height="36"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="quiz-state-title">Unable to Load Quiz Attempts</h2>
          <p className="quiz-state-message">{error}</p>
          <button
            type="button"
            className="quiz-retry-btn"
            onClick={fetchAttempts}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="medcore-quiz-attempts-container">
      <div className="quiz-attempts-header">
        <div className="quiz-attempts-title-area">
          <div className="quiz-title-badge">Student Assessment Record</div>
          <h1 className="quiz-attempts-title">My Quizzes &amp; Scores</h1>
          <p className="quiz-attempts-subtitle">
            Review your previous quiz submissions, scores, and practice new medical question banks.
          </p>
        </div>
        <button
          type="button"
          className="quiz-back-btn"
          onClick={onBackToQuizzes}
          aria-label="Browse All Quizzes"
        >
          <svg
            className="quiz-back-btn-icon"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Browse All Quizzes
        </button>
      </div>

      {/* 1. ATTEMPT HISTORY SECTION */}
      {attempts.length > 0 ? (
        <>
          <div className="quiz-attempts-summary-banner">
            <div className="summary-stat-box">
              <span className="summary-stat-label">Total Attempts</span>
              <span className="summary-stat-val">{stats.total}</span>
              <span className="summary-stat-caption">Recorded submissions</span>
            </div>
            <div className="summary-stat-divider" />
            <div className="summary-stat-box">
              <span className="summary-stat-label">Average Accuracy</span>
              <span className="summary-stat-val text-accent">{stats.avg}% Avg</span>
              <span className="summary-stat-caption">Across all subjects</span>
            </div>
            <div className="summary-stat-divider" />
            <div className="summary-stat-box">
              <span className="summary-stat-label">Highest Score</span>
              <span className="summary-stat-val text-success">{stats.best}% Peak</span>
              <span className="summary-stat-caption">Personal best</span>
            </div>
          </div>

          <div className="attempts-section-header" style={{ margin: '28px 0 16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-h, #0f172a)' }}>
              Completed Assessments History
            </h2>
          </div>

          <div className="attempts-list">
            {attempts.map((attempt) => {
              const topicTitle = attempt.topic?.name ?? 'General';
              const subjectTitle = attempt.subject?.name ?? '';
              const grade = getScoreGrade(attempt.percentage);

              return (
                <div key={attempt.attemptId} className={`attempt-card ${grade.gradeClass}`}>
                  <div className="attempt-card-main">
                    <div className="attempt-info">
                      <div className="attempt-badges">
                        {subjectTitle && (
                          <span className="attempt-subject">{subjectTitle}</span>
                        )}
                        <span className="attempt-topic-separator">•</span>
                        <span className="attempt-topic">{topicTitle}</span>
                        <span className={`attempt-grade-pill ${grade.gradeClass}`}>
                          {grade.label}
                        </span>
                      </div>

                      <h2 className="attempt-quiz-title">{attempt.quizTitle}</h2>

                      <div className="attempt-completed-date">
                        <svg
                          className="attempt-date-icon"
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>Completed {formatDate(attempt.completedAt)}</span>
                      </div>
                    </div>

                    <div className="attempt-results-summary">
                      <div className="attempt-metrics-wrapper">
                        <div className="attempt-score-box">
                          <span className="attempt-score-label">Score</span>
                          <span className="attempt-score-value">
                            {attempt.score} / {attempt.total}
                          </span>
                        </div>

                        <div className="attempt-metrics-divider" />

                        <div className="attempt-percentage-box">
                          <span className="attempt-percentage-label">Percentage</span>
                          <span className="attempt-percentage-value">
                            {attempt.percentage}%
                          </span>
                        </div>
                      </div>

                      <div className="attempt-progress-bar-container">
                        <div
                          className={`attempt-progress-bar-fill ${grade.gradeClass}`}
                          style={{ width: `${Math.min(100, Math.max(0, attempt.percentage))}%` }}
                          role="progressbar"
                          aria-valuenow={attempt.percentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Empty attempts note with encouragement */
        <div className="quiz-empty-attempts-banner" style={{
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.06), rgba(13, 148, 136, 0.06))',
          border: '1px solid rgba(2, 132, 199, 0.18)',
          borderRadius: '16px',
          padding: '24px 28px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              No Quiz Submissions Yet
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
              Your completed quiz scores and progress analytics will appear here. Choose a recommended quiz below to test your clinical knowledge!
            </p>
          </div>
        </div>
      )}

      {/* 2. SUGGESTED / AVAILABLE QUIZZES SECTION */}
      <div className="suggested-quizzes-section" style={{ marginTop: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-h, #0f172a)' }}>
              Suggested Clinical Quizzes
            </h2>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted, #64748b)' }}>
              Faculty-curated clinical vignettes and board-style self-assessments
            </p>
          </div>
          <button
            type="button"
            className="quiz-view-all-link-btn"
            onClick={onBackToQuizzes}
            style={{
              background: 'none',
              border: 'none',
              color: '#0284c7',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>View All</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        {suggestedQuizzes.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '18px',
          }}>
            {suggestedQuizzes.slice(0, 6).map((q) => {
              const questionCount = q.questions?.length || 0;
              const subjectName = q.subject?.title || 'Clinical Practice';

              return (
                <div
                  key={q.id}
                  style={{
                    background: 'var(--surface, #ffffff)',
                    border: '1px solid var(--border, #e2e8f0)',
                    borderRadius: '14px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'rgba(2, 132, 199, 0.1)',
                        color: '#0284c7',
                      }}>
                        {subjectName}
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                        {questionCount} {questionCount === 1 ? 'Question' : 'Questions'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-h, #0f172a)', lineHeight: 1.35 }}>
                      {q.title}
                    </h3>
                    {q.description && (
                      <p style={{
                        fontSize: '13px',
                        color: 'var(--text-muted, #64748b)',
                        margin: '0 0 16px',
                        lineHeight: 1.45,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {q.description}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onStartQuiz) onStartQuiz(q.id);
                      else onBackToQuizzes();
                    }}
                    style={{
                      marginTop: '12px',
                      padding: '10px 16px',
                      background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>Start Practice Quiz</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '14px' }}>
            No clinical quizzes available yet. Check back soon!
          </p>
        )}
      </div>
    </div>
  );
};
