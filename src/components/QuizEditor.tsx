import React, { useState, useEffect } from 'react';
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

  const [questions, setQuestions] = useState<QuestionFormState[]>([
    {
      question: '',
      explanation: '',
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

  // Fetch subjects for dropdown
  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await SubjectsApiClient.getSubjects({ limit: 100 });
        setSubjects(res.data || []);
        if (!subjectId && res.data && res.data.length > 0) {
          setSubjectId(res.data[0].id);
        }
      } catch (err: any) {
        console.error('Failed to load subjects:', err);
      }
    }
    loadSubjects();
  }, []);

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
            quiz.questions.map((q) => ({
              question: q.question,
              explanation: q.explanation || '',
              options: q.options.map((opt, idx) => ({
                optionText: opt.optionText,
                isCorrect: idx === 0, // Fallback if backend doesn't return isCorrect in non-admin view
              })),
            })),
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
      q.options = q.options.map((opt, i) => ({
        ...opt,
        isCorrect: i === optIndex,
      }));
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
      if (correctCount !== 1) {
        setError(`Question ${i + 1} must have exactly one correct option selected.`);
        return;
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
        // Update basic info
        await QuizzesApiClient.updateQuiz(
          quizId,
          {
            title: title.trim(),
            description: description.trim() || undefined,
            subjectId,
            topicId: topicId || undefined,
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
          <div className="form-field">
            <label className="field-label">
              Subject <span className="field-required">*</span>
            </label>
            <select
              className="field-select"
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setTopicId('');
              }}
            >
              <option value="" disabled>
                Select Subject...
              </option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
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
              Each question requires 4-5 options and exactly 1 correct answer.
            </span>
          </div>

          {questions.map((q, qIndex) => (
            <div key={qIndex} className="question-block">
              <div className="question-header">
                <span className="question-number-badge">Question #{qIndex + 1}</span>
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
                <span className="options-label">Answer Options (Select the correct one)</span>
                {q.options.map((opt, optIndex) => (
                  <div key={optIndex} className="option-row">
                    <input
                      type="radio"
                      name={`correct-option-${qIndex}`}
                      className="option-radio"
                      title="Mark as correct answer"
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
