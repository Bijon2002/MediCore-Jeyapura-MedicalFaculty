import React, { useState, useEffect, useRef } from 'react';
import { ArticlesApiClient } from '../client/api/articles.api';
import { SubjectsApiClient } from '../client/api/subjects.api';
import { getAccessToken } from '../auth/auth-storage';
import type { Article, ArticleStatus } from '../client/types/article.types';
import type { Subject } from '../client/types/subject.types';
import { RichTextEditor } from './RichTextEditor';
import { parseWordDocument } from '../utils/document-parser';
import './AnatomyNotesManagement.css';

export interface AnatomyNotesManagementProps {
  subjectSlug?: string;
  subjectTitle?: string;
}

export const AnatomyNotesManagement: React.FC<AnatomyNotesManagementProps> = ({
  subjectSlug = 'anatomy',
  subjectTitle = 'Anatomy',
}) => {
  // Resolved subject state
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loadingSubject, setLoadingSubject] = useState<boolean>(true);
  const [subjectError, setSubjectError] = useState<string | null>(null);

  // Notes list state
  const [notes, setNotes] = useState<Article[]>([]);
  const [loadingNotes, setLoadingNotes] = useState<boolean>(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ArticleStatus>('ALL');

  // Editor mode state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Note Form Fields
  const [title, setTitle] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [status, setStatus] = useState<ArticleStatus>('DRAFT');
  const [saving, setSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Word Document Upload State
  const [importingDoc, setImportingDoc] = useState<boolean>(false);
  const [docImportSuccess, setDocImportSuccess] = useState<string | null>(null);
  const wordFileInputRef = useRef<HTMLInputElement>(null);

  // Delete confirmation
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  // 1. Resolve Subject by slug dynamically (never hardcode UUID)
  const resolveSubject = async () => {
    setLoadingSubject(true);
    setSubjectError(null);
    try {
      const resolved = await SubjectsApiClient.getSubjectBySlug(subjectSlug);
      if (!resolved || !resolved.id) {
        throw new Error(`Subject with slug "${subjectSlug}" could not be found.`);
      }
      setSubject(resolved);
    } catch (err: any) {
      setSubjectError(
        err?.message || `Failed to find "${subjectTitle}" specialty. Please ensure the subject is registered in Specialties & Topics.`
      );
    } finally {
      setLoadingSubject(false);
    }
  };

  useEffect(() => {
    resolveSubject();
  }, [subjectSlug]);

  // 2. Fetch Notes for this subject
  const fetchNotes = async () => {
    if (!subject?.id) return;
    setLoadingNotes(true);
    setNotesError(null);
    try {
      const response = await ArticlesApiClient.getArticles({
        type: 'NOTE',
        subjectId: subject.id,
        limit: 100,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: searchTerm.trim() || undefined,
      });
      setNotes(response.data || []);
    } catch (err: any) {
      setNotesError(err?.message || 'Failed to load daily notes.');
    } finally {
      setLoadingNotes(false);
    }
  };

  useEffect(() => {
    if (subject?.id) {
      fetchNotes();
    }
  }, [subject?.id, statusFilter, searchTerm]);

  // 3. Open Note Editor for New Note
  const handleOpenCreate = () => {
    setEditingNoteId(null);
    setTitle('');
    setSummary('');
    setContent('');
    setStatus('DRAFT');
    setFormError(null);
    setFormSuccess(null);
    setDocImportSuccess(null);
    setIsEditing(true);
  };

  // 4. Open Note Editor for Edit Note
  const handleOpenEdit = async (note: Article) => {
    setEditingNoteId(note.id);
    setTitle(note.title || '');
    setSummary(note.summary || '');
    setContent(note.content || '');
    setStatus(note.status || 'DRAFT');
    setFormError(null);
    setFormSuccess(null);
    setDocImportSuccess(null);
    setIsEditing(true);

    // If content wasn't loaded in full summary payload, fetch complete article
    if (!note.content) {
      try {
        const full = await ArticlesApiClient.getArticleById(note.id);
        setContent(full.content || '');
      } catch (err) {
        console.warn('Could not fetch full content', err);
      }
    }
  };

  // 5. Close Editor
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingNoteId(null);
    setTitle('');
    setSummary('');
    setContent('');
    setFormError(null);
    setFormSuccess(null);
    setDocImportSuccess(null);
  };

  // 6. Word Document Import (.docx / .doc / .txt)
  const handleWordFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportingDoc(true);
    setFormError(null);
    setDocImportSuccess(null);

    try {
      const parsed = await parseWordDocument(file);

      if (parsed.title) {
        setTitle(parsed.title);
      }
      if (parsed.summary) {
        setSummary(parsed.summary);
      }
      if (parsed.contentHtml) {
        setContent(parsed.contentHtml);
      }

      setDocImportSuccess(
        `Successfully imported "${file.name}" (~${parsed.wordCount} words). Headings, formatted paragraphs, lists, and tables have been populated into the editor.`
      );
    } catch (err: any) {
      setFormError(`Failed to parse Word document: ${err?.message || 'Unsupported format'}. Please upload a valid .docx file.`);
    } finally {
      setImportingDoc(false);
      if (wordFileInputRef.current) {
        wordFileInputRef.current.value = '';
      }
    }
  };

  // 7. Save Note (Create or Update)
  const handleSaveNote = async (targetStatus?: ArticleStatus) => {
    setFormError(null);
    setFormSuccess(null);

    if (!subject?.id) {
      setFormError(`Cannot save note: ${subjectTitle} subject ID could not be resolved.`);
      return;
    }

    if (!title.trim()) {
      setFormError('Note Title is required.');
      return;
    }

    const plainText = content.replace(/<[^>]+>/g, '').trim();
    if (!plainText && !content.trim()) {
      setFormError('Note content cannot be empty.');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setFormError('Authentication required. Please log in as an Administrator.');
      return;
    }

    setSaving(true);
    const finalStatus = targetStatus || status;

    try {
      if (editingNoteId) {
        await ArticlesApiClient.updateArticle(
          editingNoteId,
          {
            title: title.trim(),
            summary: summary.trim() || undefined,
            content: content.trim(),
            status: finalStatus,
            type: 'NOTE',
            subjectId: subject.id,
          },
          token
        );
        setFormSuccess('Note updated successfully.');
      } else {
        await ArticlesApiClient.createArticle(
          {
            title: title.trim(),
            summary: summary.trim() || undefined,
            content: content.trim(),
            status: finalStatus,
            type: 'NOTE',
            subjectId: subject.id,
          },
          token
        );
        setFormSuccess('New daily note created and saved successfully.');
      }

      // Refresh list and return to table after short delay
      await fetchNotes();
      setTimeout(() => {
        setIsEditing(false);
        setEditingNoteId(null);
      }, 700);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save note. Please verify permissions.');
    } finally {
      setSaving(false);
    }
  };

  // 8. Delete Note
  const handleDeleteNote = async (noteId: string) => {
    const token = getAccessToken();
    if (!token) return;

    try {
      await ArticlesApiClient.deleteArticle(noteId, token);
      setDeletingNoteId(null);
      await fetchNotes();
    } catch (err: any) {
      alert(`Failed to delete note: ${err?.message || 'Unknown error'}`);
    }
  };

  // 9. Quick Publish / Unpublish Toggle
  const handleTogglePublish = async (note: Article) => {
    const token = getAccessToken();
    if (!token) return;
    const newStatus: ArticleStatus = note.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await ArticlesApiClient.updateArticle(note.id, { status: newStatus }, token);
      await fetchNotes();
    } catch (err: any) {
      alert(`Could not update status: ${err?.message || 'Unknown error'}`);
    }
  };

  // RENDER: SUBJECT RESOLUTION ERROR
  if (loadingSubject) {
    return (
      <div className="reviewer-table-card notes-loading-state">
        <div className="spinner-teal" />
        <p>Resolving {subjectTitle} specialty configuration...</p>
      </div>
    );
  }

  if (subjectError || !subject) {
    return (
      <div className="reviewer-table-card notes-error-banner">
        <div className="error-icon-box">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div>
          <h3>Cannot Load {subjectTitle} Notes</h3>
          <p>{subjectError || `The "${subjectTitle}" specialty could not be resolved from the database.`}</p>
          <button type="button" className="btn-secondary" onClick={resolveSubject} style={{ marginTop: '8px' }}>
            Retry Resolution
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="anatomy-notes-container">
      {/* HEADER BAR */}
      <div className="reviewer-header">
        <div className="reviewer-title-group">
          <span className="reviewer-badge anatomy-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Specialty Curriculum
          </span>
          <h1 className="reviewer-title">{subject.title} Daily Notes Management</h1>
          <p className="reviewer-subtitle">
            Upload, manage, and publish daily anatomical clinical guides and dissection notes with formatted Word document import.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            className="btn-create-article btn-create-note"
            onClick={handleOpenCreate}
            data-testid="btn-create-anatomy-note"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create New Note
          </button>
        )}
      </div>

      {/* VIEW: NOTE EDITOR FORM */}
      {isEditing ? (
        <div className="reviewer-table-card note-editor-card">
          <div className="editor-top-actions">
            <div>
              <h2 className="editor-section-title">
                {editingNoteId ? `Edit Note: ${title || 'Untitled'}` : `Create New ${subject.title} Daily Note`}
              </h2>
              <p className="editor-section-subtitle">
                Fill in the details below, or import directly from a formatted medical Word document (.docx).
              </p>
            </div>
            <button type="button" className="btn-cancel-note" onClick={handleCancelEdit}>
              &larr; Back to Notes List
            </button>
          </div>

          {/* WORD DOCUMENT IMPORT BAR */}
          <div className="word-import-strip">
            <div className="word-import-info">
              <div className="word-icon-wrapper">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div>
                <strong>Import from Word Document (.docx)</strong>
                <p>Upload a .docx file to automatically populate note title, summary, and rich formatted content.</p>
              </div>
            </div>

            <div className="word-import-action">
              <input
                ref={wordFileInputRef}
                type="file"
                accept=".docx,.doc,.txt"
                style={{ display: 'none' }}
                onChange={handleWordFileChange}
                disabled={importingDoc || saving}
              />
              <button
                type="button"
                className="btn-word-upload"
                onClick={() => wordFileInputRef.current?.click()}
                disabled={importingDoc || saving}
              >
                {importingDoc ? 'Parsing Document...' : 'Choose Word Document'}
              </button>
            </div>
          </div>

          {docImportSuccess && (
            <div className="import-success-banner">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{docImportSuccess}</span>
            </div>
          )}

          {formError && (
            <div className="form-error-banner">
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="form-success-banner">
              <span>{formSuccess}</span>
            </div>
          )}

          {/* FORM FIELDS */}
          <div className="note-form-grid">
            <div className="form-group">
              <label htmlFor="note-title" className="form-label">
                Note Title <span className="req">*</span>
              </label>
              <input
                id="note-title"
                type="text"
                className="form-control"
                placeholder="e.g., Upper Limb Anatomy — Brachial Plexus Architecture"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="note-status" className="form-label">
                Publication Status
              </label>
              <select
                id="note-status"
                className="form-control"
                value={status}
                onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                disabled={saving}
              >
                <option value="DRAFT">DRAFT (Hidden from Students)</option>
                <option value="PUBLISHED">PUBLISHED (Visible to Students)</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="note-summary" className="form-label">
              Executive Summary / Learning Objective (Optional)
            </label>
            <input
              id="note-summary"
              type="text"
              className="form-control"
              placeholder="Brief 1-2 sentence overview for the notes list preview..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">
              Full Clinical & Anatomical Content <span className="req">*</span>
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Type your anatomical dissection notes, format clinical sections, insert tables, and list high-yield correlates..."
              minHeight="420px"
            />
          </div>

          {/* FORM BUTTONS */}
          <div className="editor-submit-row">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCancelEdit}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-save-draft"
              onClick={() => handleSaveNote('DRAFT')}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="button"
              className="btn-primary btn-save-publish"
              onClick={() => handleSaveNote('PUBLISHED')}
              disabled={saving}
            >
              {saving ? 'Publishing...' : 'Save & Publish Note'}
            </button>
          </div>
        </div>
      ) : (
        /* VIEW: NOTES TABLE & SEARCH */
        <div className="reviewer-table-card">
          <div className="notes-controls-row">
            <div className="notes-search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search notes by title or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button type="button" className="clear-btn" onClick={() => setSearchTerm('')}>
                  &times;
                </button>
              )}
            </div>

            <div className="notes-filter-pills">
              <button
                type="button"
                className={`filter-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setStatusFilter('ALL')}
              >
                All Notes ({notes.length})
              </button>
              <button
                type="button"
                className={`filter-pill ${statusFilter === 'PUBLISHED' ? 'active' : ''}`}
                onClick={() => setStatusFilter('PUBLISHED')}
              >
                Published
              </button>
              <button
                type="button"
                className={`filter-pill ${statusFilter === 'DRAFT' ? 'active' : ''}`}
                onClick={() => setStatusFilter('DRAFT')}
              >
                Drafts
              </button>
            </div>
          </div>

          {notesError && (
            <div className="notes-error-banner" style={{ margin: '16px' }}>
              <span>{notesError}</span>
            </div>
          )}

          {loadingNotes ? (
            <div className="notes-loading-state">
              <div className="spinner-teal" />
              <p>Loading {subject.title} daily notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="notes-empty-state">
              <div className="empty-icon-circle">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <h3>No {subject.title} Notes Found</h3>
              <p>
                {searchTerm
                  ? 'No daily notes matched your search query. Try another keyword.'
                  : `No daily notes have been uploaded for ${subject.title} yet. Create one or import from a Word document.`}
              </p>
              {!searchTerm && (
                <button type="button" className="btn-create-article btn-create-note" onClick={handleOpenCreate}>
                  Create First Note
                </button>
              )}
            </div>
          ) : (
            <div className="reviewer-table-wrapper">
              <table className="reviewer-table">
                <thead>
                  <tr>
                    <th>Note Title &amp; Summary</th>
                    <th>Status</th>
                    <th>Date Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notes.map((note) => {
                    const formattedDate = note.createdAt
                      ? new Date(note.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—';

                    return (
                      <tr key={note.id}>
                        <td style={{ maxWidth: '420px' }}>
                          <strong className="note-table-title">{note.title}</strong>
                          {note.summary && <p className="note-table-summary">{note.summary}</p>}
                        </td>
                        <td>
                          <span
                            className={`status-pill ${
                              note.status === 'PUBLISHED' ? 'status-published' : 'status-draft'
                            }`}
                          >
                            {note.status}
                          </span>
                        </td>
                        <td>
                          <span className="note-date-text">{formattedDate}</span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="btn-action-edit"
                              onClick={() => handleOpenEdit(note)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn-action-toggle-status"
                              onClick={() => handleTogglePublish(note)}
                            >
                              {note.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                            </button>
                            {deletingNoteId === note.id ? (
                              <div className="confirm-delete-inline">
                                <span>Sure?</span>
                                <button
                                  type="button"
                                  className="btn-action-delete"
                                  onClick={() => handleDeleteNote(note.id)}
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  className="btn-action-cancel"
                                  onClick={() => setDeletingNoteId(null)}
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="btn-action-delete"
                                onClick={() => setDeletingNoteId(note.id)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
