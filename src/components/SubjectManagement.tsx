import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SubjectsApiClient } from '../client/api/subjects.api';
import { TopicsApiClient } from '../client/api/topics.api';
import type { Subject } from '../client/types/subject.types';
import type { Topic } from '../client/types/topic.types';
import { ImageUploader } from './ImageUploader';
import { SystemAlert } from './SystemAlert';
import { parseDocxForSubject } from '../utils/document-parser';
import './SubjectManagement.css';

export interface SubjectManagementProps {
  showAlert?: (config: any) => void;
  closeAlert?: () => void;
  onSubjectsUpdated?: () => void;
}

interface SubjectFormData {
  title: string;
  slug: string;
  description: string;
  notes: string;
  iconUrl: string;
  orderIndex: number;
}

interface TopicFormData {
  subjectId: string;
  title: string;
  slug: string;
  description: string;
  orderIndex: number;
}

export const SubjectManagement: React.FC<SubjectManagementProps> = ({
  showAlert: externalShowAlert,
  closeAlert: externalCloseAlert,
  onSubjectsUpdated,
}) => {
  // Local Alert State fallback if not provided by parent
  const [localAlertConfig, setLocalAlertConfig] = useState<any>(null);
  const showAlert = externalShowAlert || ((cfg: any) => setLocalAlertConfig(cfg));
  const closeAlert = externalCloseAlert || (() => setLocalAlertConfig(null));

  // Subject List State
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState<boolean>(true);
  const [subjectsError, setSubjectsError] = useState<string | null>(null);
  const [subjectSearch, setSubjectSearch] = useState<string>('');

  // Topic List State
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState<boolean>(true);
  const [topicsError, setTopicsError] = useState<string | null>(null);
  const [topicSearch, setTopicSearch] = useState<string>('');
  const [topicSubjectFilter, setTopicSubjectFilter] = useState<string>('ALL');

  // Subject Form State
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [subjectForm, setSubjectForm] = useState<SubjectFormData>({
    title: '',
    slug: '',
    description: '',
    notes: '',
    iconUrl: '',
    orderIndex: 0,
  });
  const [subjectSaving, setSubjectSaving] = useState<boolean>(false);
  const [showSubjectAdvanced, setShowSubjectAdvanced] = useState<boolean>(false);

  // Word Document Import State
  const [importingDoc, setImportingDoc] = useState<boolean>(false);
  const [docImportSuccess, setDocImportSuccess] = useState<string | null>(null);
  const [docImportError, setDocImportError] = useState<string | null>(null);
  const [pendingDocFile, setPendingDocFile] = useState<File | null>(null);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState<boolean>(false);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  // Topic Form State
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [topicForm, setTopicForm] = useState<TopicFormData>({
    subjectId: '',
    title: '',
    slug: '',
    description: '',
    orderIndex: 0,
  });
  const [topicSaving, setTopicSaving] = useState<boolean>(false);
  const [showTopicAdvanced, setShowTopicAdvanced] = useState<boolean>(false);

  // Scroll ref for smooth navigation on edit
  const subjectFormRef = useRef<HTMLDivElement>(null);
  const topicFormRef = useRef<HTMLDivElement>(null);

  // Fetch Subjects
  const fetchSubjects = useCallback(async () => {
    setSubjectsLoading(true);
    setSubjectsError(null);
    try {
      const res = await SubjectsApiClient.getSubjects({ limit: 100 });
      setSubjects(res.data || []);
      if (onSubjectsUpdated) onSubjectsUpdated();
    } catch (err: any) {
      setSubjectsError(err?.message || 'Failed to load medical subjects.');
    } finally {
      setSubjectsLoading(false);
    }
  }, [onSubjectsUpdated]);

  // Fetch Topics
  const fetchTopics = useCallback(async () => {
    setTopicsLoading(true);
    setTopicsError(null);
    try {
      const res = await TopicsApiClient.getTopics({ limit: 200 });
      setTopics(res.data || []);
    } catch (err: any) {
      setTopicsError(err?.message || 'Failed to load medical topics.');
    } finally {
      setTopicsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
    fetchTopics();
  }, [fetchSubjects, fetchTopics]);

  // Helper: Reset Subject Form
  const resetSubjectForm = () => {
    setEditingSubjectId(null);
    setSubjectForm({
      title: '',
      slug: '',
      description: '',
      notes: '',
      iconUrl: '',
      orderIndex: subjects.length,
    });
    setDocImportSuccess(null);
    setDocImportError(null);
    setShowSubjectAdvanced(false);
    if (docFileInputRef.current) docFileInputRef.current.value = '';
  };

  // Helper: Reset Topic Form
  const resetTopicForm = () => {
    setEditingTopicId(null);
    setTopicForm({
      subjectId: subjects[0]?.id || '',
      title: '',
      slug: '',
      description: '',
      orderIndex: topics.length,
    });
    setShowTopicAdvanced(false);
  };

  // Handle Document Parsing Execution
  const processDocxImport = async (file: File) => {
    setImportingDoc(true);
    setDocImportError(null);
    setDocImportSuccess(null);

    try {
      const parsed = await parseDocxForSubject(file);

      // Auto-populate Subject Name if currently blank
      setSubjectForm((prev) => ({
        ...prev,
        title: prev.title.trim() ? prev.title : parsed.title,
        description: prev.description.trim() ? prev.description : parsed.description,
        notes: parsed.formattedNotes,
      }));

      setDocImportSuccess(
        `Successfully imported "${file.name}" (~${parsed.wordCount} words). Headings, clinical sections, and structured notes have been loaded into Subject Notes below. Review and edit before saving.`
      );
    } catch (err: any) {
      setDocImportError(
        err?.message || 'Failed to parse Word document. Please ensure you upload a valid .docx file.'
      );
    } finally {
      setImportingDoc(false);
      setPendingDocFile(null);
      if (docFileInputRef.current) {
        docFileInputRef.current.value = '';
      }
    }
  };

  // Handle Word Document Upload Change (.docx only)
  const handleDocxFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file extension
    if (!file.name.toLowerCase().endsWith('.docx')) {
      setDocImportError('Only Word documents (.docx) are supported. Please select a .docx file.');
      if (docFileInputRef.current) docFileInputRef.current.value = '';
      return;
    }

    // Accidental Overwrite Protection
    if (subjectForm.notes.trim().length > 0) {
      setPendingDocFile(file);
      setShowOverwriteConfirm(true);
      return;
    }

    processDocxImport(file);
  };

  // Confirm Overwrite
  const handleConfirmOverwrite = () => {
    setShowOverwriteConfirm(false);
    if (pendingDocFile) {
      processDocxImport(pendingDocFile);
    }
  };

  // Cancel Overwrite
  const handleCancelOverwrite = () => {
    setShowOverwriteConfirm(false);
    setPendingDocFile(null);
    if (docFileInputRef.current) {
      docFileInputRef.current.value = '';
    }
  };

  // Handle Subject Save / Update
  const handleSaveSubject = async () => {
    if (!subjectForm.title.trim()) {
      showAlert({
        type: 'warning',
        title: 'Missing Field',
        message: 'Subject Name is required.',
      });
      return;
    }

    setSubjectSaving(true);
    try {
      const payload = {
        title: subjectForm.title.trim(),
        slug:
          subjectForm.slug.trim() ||
          subjectForm.title
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, ''),
        description: subjectForm.description.trim() || undefined,
        notes: subjectForm.notes.trim() || undefined,
        iconUrl: subjectForm.iconUrl || undefined,
        orderIndex: subjectForm.orderIndex,
      };

      if (editingSubjectId) {
        await SubjectsApiClient.updateSubject(editingSubjectId, payload);
        showAlert({
          type: 'success',
          title: 'Subject Updated',
          message: `Subject "${payload.title}" was updated successfully.`,
        });
      } else {
        await SubjectsApiClient.createSubject(payload);
        showAlert({
          type: 'success',
          title: 'Subject Created',
          message: `Subject "${payload.title}" has been created.`,
        });
      }

      resetSubjectForm();
      await fetchSubjects();
    } catch (err: any) {
      showAlert({
        type: 'danger',
        title: 'Save Failed',
        message: err?.message || 'Failed to save subject. Please check inputs and permissions.',
      });
    } finally {
      setSubjectSaving(false);
    }
  };

  // Handle Subject Edit
  const handleStartEditSubject = (sub: Subject) => {
    setEditingSubjectId(sub.id);
    setSubjectForm({
      title: sub.title,
      slug: sub.slug,
      description: sub.description || '',
      notes: sub.notes || '',
      iconUrl: sub.iconUrl || '',
      orderIndex: sub.orderIndex,
    });
    setDocImportSuccess(null);
    setDocImportError(null);
    if (sub.slug || sub.orderIndex !== 0) {
      setShowSubjectAdvanced(true);
    }
    subjectFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Handle Subject Delete
  const handleDeleteSubject = (subject: Subject) => {
    showAlert({
      type: 'danger',
      title: 'Delete Subject',
      message: `Are you sure you want to delete "${subject.title}" and all its clinical topics? This action cannot be undone.`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        closeAlert();
        try {
          await SubjectsApiClient.deleteSubject(subject.id);
          await Promise.all([fetchSubjects(), fetchTopics()]);
        } catch (err: any) {
          showAlert({
            type: 'danger',
            title: 'Delete Failed',
            message: err?.message || 'Failed to delete subject.',
          });
        }
      },
    });
  };

  // Handle Topic Save / Update
  const handleSaveTopic = async () => {
    if (!topicForm.subjectId) {
      showAlert({
        type: 'warning',
        title: 'Missing Specialty',
        message: 'Please select a parent Medical Subject for this topic.',
      });
      return;
    }
    if (!topicForm.title.trim()) {
      showAlert({
        type: 'warning',
        title: 'Missing Field',
        message: 'Topic Name is required.',
      });
      return;
    }

    setTopicSaving(true);
    try {
      const payload = {
        subjectId: topicForm.subjectId,
        title: topicForm.title.trim(),
        slug:
          topicForm.slug.trim() ||
          topicForm.title
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, ''),
        description: topicForm.description.trim() || undefined,
        orderIndex: topicForm.orderIndex,
      };

      if (editingTopicId) {
        await TopicsApiClient.updateTopic(editingTopicId, payload);
        showAlert({
          type: 'success',
          title: 'Topic Updated',
          message: `Topic "${payload.title}" was updated successfully.`,
        });
      } else {
        await TopicsApiClient.createTopic(payload);
        showAlert({
          type: 'success',
          title: 'Topic Created',
          message: `Topic "${payload.title}" has been created.`,
        });
      }

      resetTopicForm();
      await fetchTopics();
    } catch (err: any) {
      showAlert({
        type: 'danger',
        title: 'Save Failed',
        message: err?.message || 'Failed to save topic.',
      });
    } finally {
      setTopicSaving(false);
    }
  };

  // Handle Topic Edit
  const handleStartEditTopic = (topic: Topic) => {
    setEditingTopicId(topic.id);
    setTopicForm({
      subjectId: topic.subjectId,
      title: topic.title,
      slug: topic.slug,
      description: topic.description || '',
      orderIndex: topic.orderIndex,
    });
    if (topic.slug || topic.orderIndex !== 0) {
      setShowTopicAdvanced(true);
    }
    topicFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Handle Topic Delete
  const handleDeleteTopic = (topic: Topic) => {
    showAlert({
      type: 'danger',
      title: 'Delete Topic',
      message: `Are you sure you want to delete topic "${topic.title}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        closeAlert();
        try {
          await TopicsApiClient.deleteTopic(topic.id);
          await fetchTopics();
        } catch (err: any) {
          showAlert({
            type: 'danger',
            title: 'Delete Failed',
            message: err?.message || 'Failed to delete topic.',
          });
        }
      },
    });
  };

  // Filtered Subjects
  const filteredSubjects = subjects.filter(
    (s) =>
      s.title.toLowerCase().includes(subjectSearch.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(subjectSearch.toLowerCase())) ||
      s.slug.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  // Filtered Topics
  const filteredTopics = topics.filter((t) => {
    const matchesSubject =
      topicSubjectFilter === 'ALL' || t.subjectId === topicSubjectFilter;
    const matchesSearch =
      t.title.toLowerCase().includes(topicSearch.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(topicSearch.toLowerCase())) ||
      t.slug.toLowerCase().includes(topicSearch.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  // Calculate notes word count
  const notesWordCount = subjectForm.notes.trim()
    ? subjectForm.notes.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="subject-mgmt-container" data-testid="subject-management-panel">
      {/* LOCAL ALERT FALLBACK */}
      {!externalShowAlert && localAlertConfig && (
        <SystemAlert {...localAlertConfig} onClose={closeAlert} />
      )}

      {/* OVERWRITE CONFIRMATION MODAL */}
      {showOverwriteConfirm && (
        <div className="confirm-modal-overlay">
          <div className="confirm-modal-box">
            <div className="confirm-modal-header">
              <div className="confirm-modal-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h3 className="confirm-modal-title">Replace Existing Notes?</h3>
              </div>
            </div>
            <p className="confirm-modal-body">
              You already have entered notes for this subject. Importing from{' '}
              <strong>"{pendingDocFile?.name}"</strong> will replace your current Subject Notes with the document's content.
            </p>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={handleCancelOverwrite}
              >
                Keep Current Notes
              </button>
              <button
                type="button"
                className="btn-modal-confirm"
                onClick={handleConfirmOverwrite}
              >
                Replace Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: CREATE / EDIT SUBJECT */}
      <section className="subject-mgmt-card" ref={subjectFormRef}>
        <div className="subject-mgmt-card-header">
          <div className="subject-mgmt-card-title-wrap">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="subject-mgmt-badge">Curriculum Taxonomy</span>
              {editingSubjectId && (
                <span className="editing-badge-indicator">Editing Active Subject</span>
              )}
            </div>
            <h2 className="subject-mgmt-card-title">
              {editingSubjectId ? 'Edit Medical Subject' : 'Create New Subject'}
            </h2>
            <p className="subject-mgmt-card-subtitle">
              {editingSubjectId
                ? 'Update specialty naming, clinical notes, media, and anatomical taxonomy.'
                : 'Define anatomical systems and clinical specialties structuring student curriculum modules.'}
            </p>
          </div>
          {editingSubjectId && (
            <button
              type="button"
              className="btn-secondary"
              onClick={resetSubjectForm}
            >
              Cancel Edit
            </button>
          )}
        </div>

        {/* PROMINENT WORD DOCUMENT (.DOCX) IMPORT CARD */}
        <div className="word-import-card">
          <div className="word-import-header">
            <div className="word-import-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div className="word-import-copy">
              <h3>Import Word Document (.docx)</h3>
              <p>
                Upload curriculum outlines, syllabus notes, or clinical guidelines (.docx only).
                Headings, formatting, and directives are automatically extracted into Subject Notes.
              </p>
            </div>
            <div className="word-import-action">
              <input
                ref={docFileInputRef}
                type="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleDocxFileSelect}
                style={{ display: 'none' }}
                data-testid="subject-docx-input"
              />
              <button
                type="button"
                className="btn-word-upload"
                onClick={() => docFileInputRef.current?.click()}
                disabled={importingDoc}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {importingDoc ? 'Parsing Document...' : 'Upload Word Document (.docx)'}
              </button>
            </div>
          </div>

          {/* SUCCESS BANNER */}
          {docImportSuccess && (
            <div className="word-import-success-alert">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{docImportSuccess}</span>
            </div>
          )}

          {/* ERROR BANNER */}
          {docImportError && (
            <div className="word-import-error-alert">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{docImportError}</span>
            </div>
          )}
        </div>

        {/* SUBJECT FORM FIELDS */}
        <div className="subject-form-grid">
          {/* SUBJECT NAME */}
          <div className="form-field">
            <label className="field-label" htmlFor="subject-name-input">
              Subject Name <span className="field-required">*</span>
            </label>
            <input
              id="subject-name-input"
              type="text"
              className="field-input"
              placeholder="e.g., Cardiovascular Medicine or Upper Limb Anatomy"
              value={subjectForm.title}
              onChange={(e) => setSubjectForm({ ...subjectForm, title: e.target.value })}
              aria-required="true"
              data-testid="subject-name-input"
            />
            <p className="field-help">
              The primary discipline name shown across student dashboards, study roadmaps, and article headers.
            </p>
          </div>

          {/* DESCRIPTION */}
          <div className="form-field">
            <label className="field-label" htmlFor="subject-desc-input">
              Description <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Optional)</span>
            </label>
            <input
              id="subject-desc-input"
              type="text"
              className="field-input"
              placeholder="Brief clinical focus or curriculum summary..."
              value={subjectForm.description}
              onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
              data-testid="subject-description-input"
            />
          </div>

          {/* SUBJECT NOTES (WITH EDITABLE PREVIEW) */}
          <div className="form-field">
            <div className="notes-header-meta">
              <label className="field-label" htmlFor="subject-notes-input">
                Subject Notes &amp; Clinical Guidelines{' '}
                <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Optional)</span>
              </label>
              {notesWordCount > 0 && (
                <span className="notes-word-count-badge">
                  {notesWordCount} {notesWordCount === 1 ? 'word' : 'words'}
                </span>
              )}
            </div>
            <p className="field-help" style={{ marginBottom: '4px' }}>
              Detailed study notes, core clinical competencies, or high-yield references shown on the student subject details page. Directly editable.
            </p>
            <textarea
              id="subject-notes-input"
              className="field-textarea"
              rows={6}
              placeholder="Enter or paste clinical directives, or import from a Word document (.docx) above..."
              value={subjectForm.notes}
              onChange={(e) => setSubjectForm({ ...subjectForm, notes: e.target.value })}
              data-testid="subject-notes-textarea"
            />
          </div>

          {/* SUBJECT IMAGE */}
          <div className="form-field">
            <ImageUploader
              value={subjectForm.iconUrl}
              onChange={(iconUrl) => setSubjectForm({ ...subjectForm, iconUrl })}
              label="Subject Image / Icon"
              helpText="Upload an anatomical icon or clinical banner (PNG, JPG, WEBP). Drag and drop or supply a direct image URL."
              variant="avatar"
            />
          </div>

          {/* EXPANDABLE ADVANCED SETTINGS */}
          <div>
            <button
              type="button"
              className={`advanced-settings-toggle-btn ${showSubjectAdvanced ? 'expanded' : ''}`}
              onClick={() => setShowSubjectAdvanced((prev) => !prev)}
              aria-expanded={showSubjectAdvanced}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <span>{showSubjectAdvanced ? 'Hide Advanced Settings' : 'Advanced Settings (Slug & Display Order)'}</span>
            </button>

            {showSubjectAdvanced && (
              <div className="advanced-settings-panel">
                <div className="form-row-2col">
                  <div className="form-field">
                    <label className="field-label" htmlFor="subject-slug-input">
                      URL Slug <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Optional)</span>
                    </label>
                    <input
                      id="subject-slug-input"
                      type="text"
                      className="field-input"
                      placeholder="e.g., cardiovascular-medicine (auto-generated if empty)"
                      value={subjectForm.slug}
                      onChange={(e) => setSubjectForm({ ...subjectForm, slug: e.target.value })}
                      data-testid="subject-slug-input"
                    />
                    <p className="field-help">Custom URL slug. If blank, automatically generated from the subject name.</p>
                  </div>

                  <div className="form-field">
                    <label className="field-label" htmlFor="subject-order-input">
                      Display Order Index
                    </label>
                    <input
                      id="subject-order-input"
                      type="number"
                      min="0"
                      className="field-input"
                      placeholder="0"
                      value={subjectForm.orderIndex}
                      onChange={(e) => setSubjectForm({ ...subjectForm, orderIndex: Number(e.target.value) })}
                      data-testid="subject-order-input"
                    />
                    <p className="field-help">Lower numbers appear first in the curriculum catalog.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ACTIONS BAR */}
          <div className="subject-mgmt-actions-bar">
            {editingSubjectId ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={resetSubjectForm}
                disabled={subjectSaving}
              >
                Cancel Edit
              </button>
            ) : (
              (subjectForm.title || subjectForm.notes || subjectForm.description) && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={resetSubjectForm}
                  disabled={subjectSaving}
                >
                  Clear Form
                </button>
              )
            )}
            <button
              type="button"
              className="btn-primary"
              onClick={handleSaveSubject}
              disabled={subjectSaving}
              data-testid="save-subject-button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {subjectSaving
                ? 'Saving...'
                : editingSubjectId
                ? 'Update Subject'
                : 'Create Subject'}
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: EXISTING MEDICAL SUBJECTS */}
      <section className="subject-mgmt-card">
        <div className="subject-mgmt-card-header">
          <div className="subject-mgmt-card-title-wrap">
            <h2 className="subject-mgmt-card-title">Existing Medical Subjects</h2>
            <p className="subject-mgmt-card-subtitle">
              All registered anatomical and specialty disciplines currently published in the system.
            </p>
          </div>
          <div className="table-toolbar">
            <div className="table-search-box">
              <svg className="table-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="table-search-input"
                placeholder="Search subjects by name or slug..."
                value={subjectSearch}
                onChange={(e) => setSubjectSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {subjectsLoading ? (
          <div className="table-empty-box">Loading medical subjects...</div>
        ) : subjectsError ? (
          <div className="table-empty-box" style={{ color: '#ef4444' }}>{subjectsError}</div>
        ) : filteredSubjects.length === 0 ? (
          <div className="table-empty-box">
            {subjectSearch ? 'No subjects matching search criteria.' : 'No subjects registered in the database.'}
          </div>
        ) : (
          <div className="reviewer-table-wrapper">
            <table className="reviewer-table">
              <thead>
                <tr>
                  <th>Specialty / Subject</th>
                  <th>Slug</th>
                  <th>Description</th>
                  <th>Notes Excerpt</th>
                  <th>Topics</th>
                  <th>Articles</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {sub.iconUrl ? (
                          <img
                            src={sub.iconUrl}
                            alt=""
                            className="admin-subject-thumbnail"
                            style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              background: 'rgba(13, 148, 136, 0.1)',
                              color: 'var(--teal-600, #0d9488)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '13px',
                            }}
                          >
                            {sub.title.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <strong style={{ color: 'var(--text-h)' }}>{sub.title}</strong>
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: '12px', background: 'var(--surface-hover)', padding: '2px 6px', borderRadius: '4px' }}>
                        {sub.slug}
                      </code>
                    </td>
                    <td style={{ maxWidth: '200px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      {sub.description || '—'}
                    </td>
                    <td style={{ maxWidth: '240px' }}>
                      {sub.notes ? (
                        <span className="subject-table-notes-preview">
                          {sub.notes}
                        </span>
                      ) : (
                        <em style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>No notes</em>
                      )}
                    </td>
                    <td>
                      <span className="nav-item-badge">{sub._count?.topics ?? 0} Topics</span>
                    </td>
                    <td>
                      <span className="nav-item-badge" style={{ background: 'var(--teal-500, #0d9488)', color: '#ffffff' }}>
                        {sub._count?.articles ?? 0} Articles
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>#{sub.orderIndex}</span>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="btn-action-edit"
                          onClick={() => handleStartEditSubject(sub)}
                          data-testid={`edit-subject-${sub.id}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-action-delete"
                          onClick={() => handleDeleteSubject(sub)}
                          data-testid={`delete-subject-${sub.id}`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* SECTION 3: CREATE / EDIT CLINICAL TOPIC */}
      <section className="subject-mgmt-card" ref={topicFormRef}>
        <div className="subject-mgmt-card-header">
          <div className="subject-mgmt-card-title-wrap">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="subject-mgmt-badge">Nested Topics</span>
              {editingTopicId && (
                <span className="editing-badge-indicator">Editing Active Topic</span>
              )}
            </div>
            <h2 className="subject-mgmt-card-title">
              {editingTopicId ? 'Edit Clinical Topic' : 'Create Clinical Topic'}
            </h2>
            <p className="subject-mgmt-card-subtitle">
              Add sub-topics nested under medical subjects to organize articles and quiz questions.
            </p>
          </div>
          {editingTopicId && (
            <button
              type="button"
              className="btn-secondary"
              onClick={resetTopicForm}
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="subject-form-grid">
          <div className="form-row-2col">
            {/* PARENT SPECIALTY */}
            <div className="form-field">
              <label className="field-label" htmlFor="topic-subject-select">
                Parent Medical Specialty <span className="field-required">*</span>
              </label>
              <select
                id="topic-subject-select"
                className="field-select"
                value={topicForm.subjectId}
                onChange={(e) => setTopicForm({ ...topicForm, subjectId: e.target.value })}
                data-testid="topic-subject-select"
              >
                <option value="">-- Select Parent Subject --</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.title}
                  </option>
                ))}
              </select>
            </div>

            {/* TOPIC NAME */}
            <div className="form-field">
              <label className="field-label" htmlFor="topic-name-input">
                Topic Name <span className="field-required">*</span>
              </label>
              <input
                id="topic-name-input"
                type="text"
                className="field-input"
                placeholder="e.g., Cardiac Arrhythmias or Coronary Arteries"
                value={topicForm.title}
                onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                data-testid="topic-name-input"
              />
            </div>
          </div>

          {/* TOPIC DESCRIPTION */}
          <div className="form-field">
            <label className="field-label" htmlFor="topic-desc-input">
              Description <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Optional)</span>
            </label>
            <input
              id="topic-desc-input"
              type="text"
              className="field-input"
              placeholder="Clinical scope or anatomical region..."
              value={topicForm.description}
              onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
              data-testid="topic-description-input"
            />
          </div>

          {/* EXPANDABLE ADVANCED SETTINGS FOR TOPIC */}
          <div>
            <button
              type="button"
              className={`advanced-settings-toggle-btn ${showTopicAdvanced ? 'expanded' : ''}`}
              onClick={() => setShowTopicAdvanced((prev) => !prev)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <span>{showTopicAdvanced ? 'Hide Advanced Settings' : 'Advanced Settings (Slug & Order)'}</span>
            </button>

            {showTopicAdvanced && (
              <div className="advanced-settings-panel">
                <div className="form-row-2col">
                  <div className="form-field">
                    <label className="field-label" htmlFor="topic-slug-input">
                      Topic Slug <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Optional)</span>
                    </label>
                    <input
                      id="topic-slug-input"
                      type="text"
                      className="field-input"
                      placeholder="e.g., cardiac-arrhythmias (auto-generated if empty)"
                      value={topicForm.slug}
                      onChange={(e) => setTopicForm({ ...topicForm, slug: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label className="field-label" htmlFor="topic-order-input">
                      Display Order Index
                    </label>
                    <input
                      id="topic-order-input"
                      type="number"
                      min="0"
                      className="field-input"
                      placeholder="0"
                      value={topicForm.orderIndex}
                      onChange={(e) => setTopicForm({ ...topicForm, orderIndex: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* TOPIC ACTIONS */}
          <div className="subject-mgmt-actions-bar">
            {editingTopicId && (
              <button
                type="button"
                className="btn-secondary"
                onClick={resetTopicForm}
                disabled={topicSaving}
              >
                Cancel Edit
              </button>
            )}
            <button
              type="button"
              className="btn-primary"
              onClick={handleSaveTopic}
              disabled={topicSaving}
              data-testid="save-topic-button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {topicSaving
                ? 'Saving...'
                : editingTopicId
                ? 'Update Topic'
                : 'Create Topic'}
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 4: EXISTING CLINICAL TOPICS */}
      <section className="subject-mgmt-card">
        <div className="subject-mgmt-card-header">
          <div className="subject-mgmt-card-title-wrap">
            <h2 className="subject-mgmt-card-title">Existing Clinical Topics</h2>
            <p className="subject-mgmt-card-subtitle">
              Browse, filter, and maintain clinical subtopics grouped by medical specialty.
            </p>
          </div>
          <div className="table-toolbar">
            <select
              className="table-filter-select"
              value={topicSubjectFilter}
              onChange={(e) => setTopicSubjectFilter(e.target.value)}
              aria-label="Filter topics by subject"
            >
              <option value="ALL">All Medical Specialties</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>

            <div className="table-search-box">
              <svg className="table-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="table-search-input"
                placeholder="Search topics..."
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {topicsLoading ? (
          <div className="table-empty-box">Loading clinical topics...</div>
        ) : topicsError ? (
          <div className="table-empty-box" style={{ color: '#ef4444' }}>{topicsError}</div>
        ) : filteredTopics.length === 0 ? (
          <div className="table-empty-box">
            {topicSearch || topicSubjectFilter !== 'ALL'
              ? 'No topics match the selected filters.'
              : 'No topics registered in the database.'}
          </div>
        ) : (
          <div className="reviewer-table-wrapper">
            <table className="reviewer-table">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Parent Specialty</th>
                  <th>Slug</th>
                  <th>Description</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTopics.map((topic) => {
                  const parentSub =
                    topic.subject || subjects.find((s) => s.id === topic.subjectId);
                  return (
                    <tr key={topic.id}>
                      <td>
                        <strong style={{ color: 'var(--text-h)' }}>{topic.title}</strong>
                      </td>
                      <td>
                        <span className="nav-item-badge">
                          {parentSub?.title || '—'}
                        </span>
                      </td>
                      <td>
                        <code style={{ fontSize: '12px', background: 'var(--surface-hover)', padding: '2px 6px', borderRadius: '4px' }}>
                          {topic.slug}
                        </code>
                      </td>
                      <td style={{ maxWidth: '280px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        {topic.description || '—'}
                      </td>
                      <td>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>#{topic.orderIndex}</span>
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            className="btn-action-edit"
                            onClick={() => handleStartEditTopic(topic)}
                            data-testid={`edit-topic-${topic.id}`}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-action-delete"
                            onClick={() => handleDeleteTopic(topic)}
                            data-testid={`delete-topic-${topic.id}`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
