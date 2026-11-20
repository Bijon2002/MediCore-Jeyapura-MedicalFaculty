import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { QuizzesApiClient } from '../client/api/quizzes.api';
import { SubjectsApiClient } from '../client/api/subjects.api';
import { getAccessToken } from '../auth/auth-storage';
import type { Subject } from '../client/types/subject.types';
import './QuizEditor.css';
import './ArticleEditor.css';

export interface QuizEditorProps {
  quizId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface QuestionFormState {
  question: string;
  explanation: string;
  allowMultiple: boolean;
  options: {
    optionText: string;
    isCorrect: boolean;
  }[];
}

export const QuizEditor: React.FC<QuizEditorProps> = ({
  quizId,
  onSuccess,
  onCancel,
}) => {
  const isEditMode = Boolean(quizId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState<string | null>(null);

  // Searchable Subject Combobox State
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [subjectSearchQuery, setSubjectSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const comboboxRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [questions, setQuestions] = useState<QuestionFormState[]>([
    {
      question: '',
      explanation: '',
      allowMultiple: false,
      options: [
        { optionText: '', isCorrect: true },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
      ],
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch subjects for dropdown (handling all pages)
  const loadSubjects = useCallback(async () => {
    setSubjectsLoading(true);
    setSubjectsError(null);
    try {
      const allSubjects: Subject[] = [];
      let currentPage = 1;
      let totalPages = 1;

      do {
        const res = await SubjectsApiClient.getSubjects({ page: currentPage, limit: 100 });
        if (res.data && res.data.length > 0) {
          allSubjects.push(...res.data);
        }
        totalPages = res.meta?.totalPages || 1;
        currentPage += 1;
      } while (currentPage <= totalPages);

      setSubjects(allSubjects);
      // Only set initial subject in create mode if none selected yet
      if (!isEditMode && allSubjects.length > 0) {
        setSubjectId((prev) => (prev ? prev : allSubjects[0].id));
      }
    } catch (err: any) {
      console.error('Failed to load subjects:', err);
      setSubjectsError(err?.message || 'Failed to load medical subjects.');
    } finally {
      setSubjectsLoading(false);
    }
  }, [isEditMode]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  // Click outside listener for subject combobox
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsSubjectDropdownOpen(false);
      }
    };
    if (isSubjectDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSubjectDropdownOpen]);

  // Filtered subjects based on search query (by title and slug)
  const filteredSubjects = useMemo(() => {
    const q = subjectSearchQuery.trim().toLowerCase();
    if (!q) return subjects;
    return subjects.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.slug && s.slug.toLowerCase().includes(q))
    );
  }, [subjects, subjectSearchQuery]);

  // Keep highlighted index in bounds
  useEffect(() => {
    setHighlightedIndex(0);
  }, [subjectSearchQuery]);

  const handleSelectSubject = (id: string) => {
    if (id !== subjectId) {
      setSubjectId(id);
      setTopicId(''); // Only reset topic if subject actually changed
    }
    setIsSubjectDropdownOpen(false);
    setSubjectSearchQuery('');
  };

  const handleComboboxKeyDown = (e: React.KeyboardEvent) => {
    if (!isSubjectDropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsSubjectDropdownOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsSubjectDropdownOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredSubjects.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSubjects.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSubjects.length > 0 && filteredSubjects[highlightedIndex]) {
        handleSelectSubject(filteredSubjects[highlightedIndex].id);
      }
    }
  };

  // If in edit mode, fetch existing quiz details
  useEffect(() => {
    if (!quizId) return;

    async function loadQuiz() {
      setLoading(true);
      const token = getAccessToken();
      if (!token) {
        setError('Authentication required to edit quiz.');
        setLoading(false);
        return;
      }

      try {
        const quiz = await QuizzesApiClient.getQuizById(quizId!, token);
        setTitle(quiz.title || '');
        setDescription(quiz.description || '');
        if (quiz.subjectId) setSubjectId(quiz.subjectId);
        if (quiz.topicId) setTopicId(quiz.topicId);

        if (quiz.questions && quiz.questions.length > 0) {
          setQuestions(
            quiz.questions.map((q) => {
              const correctCount = q.options.filter((opt) => opt.isCorrect).length;
              const hasMultiple = Boolean(q.allowMultiple || correctCount > 1);
              return {
                question: q.question,
                explanation: q.explanation || '',
                allowMultiple: hasMultiple,
                options: q.options.map((opt, idx) => ({
                  optionText: opt.optionText,
                  isCorrect: opt.isCorrect !== undefined ? Boolean(opt.isCorrect) : idx === 0,
                })),
              };
            }),
          );
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load quiz details.');
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [quizId]);

  const selectedSubject = subjects.find((s) => s.id === subjectId);
  const availableTopics = selectedSubject?.topics || [];

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question: '',
        explanation: '',
        allowMultiple: false,
        options: [
          { optionText: '', isCorrect: true },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
        ],
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) {
      alert('A quiz must have at least one question.');
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, field: 'question' | 'explanation', value: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleOptionChange = (qIndex: number, optIndex: number, text: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const q = { ...copy[qIndex] };
      const options = [...q.options];
      options[optIndex] = { ...options[optIndex], optionText: text };
      q.options = options;
      copy[qIndex] = q;
      return copy;
    });
  };

  const handleSetCorrectOption = (qIndex: number, optIndex: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const q = { ...copy[qIndex] };
      if (q.allowMultiple) {
        // Toggle the clicked option's isCorrect
        q.options = q.options.map((opt, i) => ({
          ...opt,
          isCorrect: i === optIndex ? !opt.isCorrect : opt.isCorrect,
        }));
      } else {
        // Single-answer: only one correct at a time
        q.options = q.options.map((opt, i) => ({
          ...opt,
          isCorrect: i === optIndex,
        }));
      }
      copy[qIndex] = q;
      return copy;
    });
  };

  const handleToggleMultiple = (qIndex: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const q = { ...copy[qIndex] };
      const newAllowMultiple = !q.allowMultiple;
      q.allowMultiple = newAllowMultiple;
      if (!newAllowMultiple) {
        // Switching back to single: keep only the first correct option (or first option)
        const firstCorrectIdx = q.options.findIndex((o) => o.isCorrect);
        q.options = q.options.map((opt, i) => ({
          ...opt,
          isCorrect: i === (firstCorrectIdx >= 0 ? firstCorrectIdx : 0),
        }));
      }
      copy[qIndex] = q;
      return copy;
    });
  };

  const handleAddOption = (qIndex: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const q = { ...copy[qIndex] };
      if (q.options.length >= 5) {
        alert('Maximum 5 options allowed per question.');
        return prev;
      }
      q.options = [...q.options, { optionText: '', isCorrect: false }];
      copy[qIndex] = q;
      return copy;
    });
  };

  const handleRemoveOption = (qIndex: number, optIndex: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const q = { ...copy[qIndex] };
      if (q.options.length <= 4) {
        alert('Each question must have at least 4 options.');
        return prev;
      }
      const wasCorrect = q.options[optIndex].isCorrect;
      q.options = q.options.filter((_, i) => i !== optIndex);
      if (wasCorrect && q.options.length > 0) {
        q.options[0].isCorrect = true;
      }
      copy[qIndex] = q;
      return copy;
    });
  };

  const handleSubmit = async (publishImmediately: boolean) => {
    setError(null);

    if (!title.trim() || title.trim().length < 3) {
      setError('Quiz Title must be at least 3 characters.');
      return;
    }

    if (!subjectId) {
      setError('Please select a Subject.');
      return;
    }

    if (questions.length === 0) {
      setError('Please add at least one question.');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim() || q.question.trim().length < 5) {
        setError(`Question ${i + 1} text must be at least 5 characters.`);
        return;
      }
      if (q.options.length < 4 || q.options.length > 5) {
        setError(`Question ${i + 1} must have between 4 and 5 options.`);
        return;
      }
      const hasEmptyOption = q.options.some((opt) => !opt.optionText.trim());
      if (hasEmptyOption) {
        setError(`All options in Question ${i + 1} must have text filled in.`);
        return;
      }
      const correctCount = q.options.filter((opt) => opt.isCorrect).length;
      if (q.allowMultiple) {
        if (correctCount < 2) {
          setError(`Question ${i + 1} is set to "Multiple answers" — please select at least 2 correct options.`);
          return;
        }
      } else {
        if (correctCount !== 1) {
          setError(`Question ${i + 1} must have exactly one correct option selected.`);
          return;
        }
      }
    }

    const token = getAccessToken();
    if (!token) {
      setError('Authentication required. Please log in as a Medical Reviewer or Admin.');
      return;
    }

    setSubmitting(true);

    try {
      if (isEditMode && quizId) {
        // Update quiz and questions
        await QuizzesApiClient.updateQuiz(
          quizId,
          {
            title: title.trim(),
            description: description.trim() || undefined,
            subjectId,
            topicId: topicId || undefined,
            questions: questions.map((q, qIndex) => ({
              question: q.question.trim(),
              explanation: q.explanation.trim() || undefined,
              orderIndex: qIndex,
              options: q.options.map((opt, optIndex) => ({
                optionText: opt.optionText.trim(),
                isCorrect: opt.isCorrect,
                orderIndex: optIndex,
              })),
            })),
          },
          token,
        );

        if (publishImmediately) {
          await QuizzesApiClient.publishQuiz(quizId, token);
        }
      } else {
        // Create new quiz
        const created = await QuizzesApiClient.createQuiz(
          {
            title: title.trim(),
            description: description.trim() || undefined,
            subjectId,
            topicId: topicId || undefined,
            questions: questions.map((q, qIndex) => ({
              question: q.question.trim(),
              explanation: q.explanation.trim() || undefined,
              orderIndex: qIndex,
              options: q.options.map((opt, optIndex) => ({
                optionText: opt.optionText.trim(),
                isCorrect: opt.isCorrect,
                orderIndex: optIndex,
              })),
            })),
          },
          token,
        );

        if (publishImmediately && created?.id) {
          await QuizzesApiClient.publishQuiz(created.id, token);
        }
      }

      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Failed to save quiz. Please check validation rules.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="quiz-editor-container">
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-muted)' }}>
          Loading quiz editor...
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-editor-container">
      {/* HEADER */}
      <div className="quiz-editor-header">
        <div className="quiz-editor-title-group">
          <h1 className="quiz-editor-title">
            {isEditMode ? 'Edit Quiz' : 'Create New Medical Quiz'}
          </h1>
          <p className="quiz-editor-subtitle">
            {isEditMode
              ? 'Modify quiz metadata, subject mapping, and review questions.'
              : 'Construct peer-reviewed clinical questions with rationale and answers.'}
          </p>
        </div>
        <button type="button" className="btn-back-link" onClick={onCancel}>
          &larr; Back to Workspace
        </button>
      </div>

      {error ? <div className="editor-error-banner">{error}</div> : null}

      {/* FORM BODY */}
      <div className="quiz-form-card">
        {/* Title */}
        <div className="form-field">
          <label className="field-label">
            Quiz Title <span className="field-required">*</span>
          </label>
          <input
            type="text"
            className="field-input"
            placeholder="e.g. Cardiology Assessment: Valvular Heart Diseases"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="form-field">
          <label className="field-label">Description / Instructions</label>
          <textarea
            className="field-input"
            rows={3}
            placeholder="Provide context, clinical guidelines, or target level for students..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Subject & Topic Selector */}
        <div className="form-group-row">
          <div className="form-field" style={{ position: 'relative' }}>
            <label className="field-label" id="subject-combobox-label">
              Subject <span className="field-required">*</span>
            </label>

            <div className="subject-combobox" ref={comboboxRef} onKeyDown={handleComboboxKeyDown}>
              <button
                type="button"
                id="subject-combobox-button"
                aria-haspopup="listbox"
                aria-expanded={isSubjectDropdownOpen}
                aria-labelledby="subject-combobox-label subject-combobox-button"
                className={`subject-combobox-trigger ${isSubjectDropdownOpen ? 'open' : ''}`}
                onClick={() => {
                  const nextState = !isSubjectDropdownOpen;
                  setIsSubjectDropdownOpen(nextState);
                  if (nextState) {
                    setTimeout(() => searchInputRef.current?.focus(), 50);
                  }
                }}
                disabled={subjectsLoading && subjects.length === 0}
              >
                <div className="subject-trigger-content">
                  {selectedSubject ? (
                    <>
                      {selectedSubject.iconUrl ? (
                        <img
                          src={selectedSubject.iconUrl}
                          alt=""
                          className="subject-trigger-icon"
                        />
                      ) : (
                        <span className="subject-item-badge">
                          {selectedSubject.title.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <span className="subject-trigger-title">{selectedSubject.title}</span>
                    </>
                  ) : (
                    <span className="subject-trigger-placeholder">
                      {subjectsLoading ? 'Loading subjects...' : 'Search & select a medical subject...'}
                    </span>
                  )}
                </div>

                <svg
                  className={`subject-trigger-chevron ${isSubjectDropdownOpen ? 'open' : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* DROPDOWN POPOVER */}
              {isSubjectDropdownOpen && (
                <div className="subject-combobox-dropdown" role="region" aria-label="Subject Selector">
                  {/* Search bar inside dropdown */}
                  <div className="subject-search-wrap">
                    <svg
                      className="subject-search-icon"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      ref={searchInputRef}
                      type="text"
                      className="subject-search-input"
                      placeholder="Filter by subject name or slug..."
                      value={subjectSearchQuery}
                      onChange={(e) => setSubjectSearchQuery(e.target.value)}
                      aria-label="Filter medical subjects"
                    />
                    {subjectSearchQuery && (
                      <button
                        type="button"
                        className="subject-search-clear"
                        onClick={() => {
                          setSubjectSearchQuery('');
                          searchInputRef.current?.focus();
                        }}
                        title="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* List of items */}
                  {subjectsLoading && subjects.length === 0 ? (
                    <div className="subject-combobox-loading">
                      <span>Loading specialties from database...</span>
                    </div>
                  ) : subjectsError ? (
                    <div className="subject-combobox-error">
                      <span>{subjectsError}</span>
                      <button
                        type="button"
                        className="subject-combobox-retry-btn"
                        onClick={() => loadSubjects()}
                      >
                        Retry
                      </button>
                    </div>
                  ) : filteredSubjects.length === 0 ? (
                    <div className="subject-combobox-empty">
                      <span>No subjects matching "{subjectSearchQuery}"</span>
                    </div>
                  ) : (
                    <ul
                      className="subject-combobox-list"
                      role="listbox"
                      aria-labelledby="subject-combobox-label"
                    >
                      {filteredSubjects.map((s, index) => {
                        const isSelected = s.id === subjectId;
                        const isHighlighted = index === highlightedIndex;

                        return (
                          <li
                            key={s.id}
                            role="option"
                            aria-selected={isSelected}
                            className={`subject-combobox-item ${isSelected ? 'selected' : ''} ${
                              isHighlighted ? 'highlighted' : ''
                            }`}
                            onClick={() => handleSelectSubject(s.id)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                          >
                            <div className="subject-item-left">
                              {s.iconUrl ? (
                                <img src={s.iconUrl} alt="" className="subject-item-icon" />
                              ) : (
                                <span className="subject-item-badge">
                                  {s.title.slice(0, 2).toUpperCase()}
                                </span>
                              )}
                              <span className="subject-item-title">
                                {s.title}
                                {s.slug && <span className="subject-item-slug">({s.slug})</span>}
                              </span>
                            </div>

                            {isSelected && (
                              <svg
                                className="subject-item-check"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {/* Footer status summary */}
                  <div className="subject-combobox-footer">
                    <span>
                      {subjects.length} total subject{subjects.length === 1 ? '' : 's'} available
                    </span>
                    <button
                      type="button"
                      className="subject-combobox-retry-btn"
                      onClick={() => loadSubjects()}
                      title="Reload subjects from database"
                    >
                      ↻ Refresh
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Explanatory helper text when single or few subjects */}
            {subjects.length === 1 && !subjectsLoading && (
              <div className="subject-hint-note">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>
                  Currently 1 subject in database. Create more via Admin Panel &rarr; Specialties &amp; Topics.
                </span>
              </div>
            )}
          </div>

          <div className="form-field">
            <label className="field-label">Topic (Optional)</label>
            <select
              className="field-select"
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              disabled={availableTopics.length === 0}
            >
              <option value="">
                {availableTopics.length > 0 ? 'All Topics / General' : 'No topics available'}
              </option>
              {availableTopics.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* QUESTIONS LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-h)', margin: 0 }}>
              Questions ({questions.length})
            </h2>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Each question requires 4-5 options and 1 or more correct answers.
            </span>
          </div>

          {questions.map((q, qIndex) => (
            <div key={qIndex} className="question-block">
              <div className="question-header">
                <span className="question-number-badge">Question #{qIndex + 1}</span>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: q.allowMultiple ? 'var(--teal-600, #0d9488)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: q.allowMultiple ? 'rgba(13,148,136,0.09)' : 'var(--surface-hover)',
                    border: q.allowMultiple ? '1px solid rgba(13,148,136,0.3)' : '1px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={q.allowMultiple}
                    onChange={() => handleToggleMultiple(qIndex)}
                    style={{ accentColor: '#0d9488', width: '15px', height: '15px' }}
                  />
                  Multiple answers
                </label>
                {questions.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove-question"
                    onClick={() => handleRemoveQuestion(qIndex)}
                  >
                    Delete Question
                  </button>
                )}
              </div>

              {/* Question Text */}
              <div className="form-field">
                <label className="field-label">
                  Prompt / Scenario <span className="field-required">*</span>
                </label>
                <textarea
                  className="field-input"
                  rows={2}
                  placeholder="Enter medical clinical vignette or conceptual question..."
                  value={q.question}
                  onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                />
              </div>

              {/* Options */}
              <div className="options-section">
                <span className="options-label">
                  {q.allowMultiple
                    ? 'Answer Options (Check all correct answers)'
                    : 'Answer Options (Select the correct one)'}
                </span>
                {q.options.map((opt, optIndex) => (
                  <div key={optIndex} className="option-row">
                    <input
                      type={q.allowMultiple ? 'checkbox' : 'radio'}
                      name={q.allowMultiple ? undefined : `correct-option-${qIndex}`}
                      className="option-radio"
                      title={q.allowMultiple ? 'Mark as a correct answer' : 'Mark as correct answer'}
                      checked={opt.isCorrect}
                      onChange={() => handleSetCorrectOption(qIndex, optIndex)}
                    />
                    <input
                      type="text"
                      className={`option-input ${opt.isCorrect ? 'correct' : ''}`}
                      placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                      value={opt.optionText}
                      onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                    />
                    {q.options.length > 4 && (
                      <button
                        type="button"
                        className="btn-remove-option"
                        title="Remove option"
                        onClick={() => handleRemoveOption(qIndex, optIndex)}
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}

                {q.options.length < 5 && (
                  <button
                    type="button"
                    className="btn-add-option"
                    onClick={() => handleAddOption(qIndex)}
                  >
                    + Add 5th Option
                  </button>
                )}
              </div>

              {/* Explanation */}
              <div className="form-field">
                <label className="field-label">Clinical Explanation / Rationale</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="Explain why the correct answer is right and why distractors are incorrect..."
                  value={q.explanation}
                  onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                />
              </div>
            </div>
          ))}

          {!isEditMode && (
            <button type="button" className="btn-add-question" onClick={handleAddQuestion}>
              + Add Another Question
            </button>
          )}
        </div>

        {/* ACTIONS */}
        <div className="editor-actions-bar">
          <button
            type="button"
            className="btn-editor-cancel"
            disabled={submitting}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-editor-save-draft"
            disabled={submitting}
            onClick={() => handleSubmit(false)}
          >
            {submitting ? 'Saving...' : 'Save as Unpublished'}
          </button>
          <button
            type="button"
            className="btn-editor-publish"
            disabled={submitting}
            onClick={() => handleSubmit(true)}
          >
            {submitting ? 'Publishing...' : 'Save & Publish Live'}
          </button>
        </div>
      </div>
    </div>
  );
};
