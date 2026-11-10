import React, { useState, useEffect, useRef } from 'react';
import { ArticlesApiClient } from '../client/api/articles.api';
import { getAccessToken } from '../auth/auth-storage';
import type { ArticleStatus } from '../client/types/article.types';
import { RichTextEditor } from './RichTextEditor';
import { ImageUploader } from './ImageUploader';
import { parseWordDocument } from '../utils/document-parser';
import './ArticleEditor.css';

export interface ArticleEditorProps {
  articleId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
  articleId,
  onSuccess,
  onCancel,
}) => {
  const isEditMode = Boolean(articleId);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [status, setStatus] = useState<ArticleStatus>('DRAFT');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Word Document Upload State
  const [importingDoc, setImportingDoc] = useState(false);
  const [docImportSuccess, setDocImportSuccess] = useState<string | null>(null);
  const wordFileInputRef = useRef<HTMLInputElement>(null);

  // If in edit mode, fetch article details
  useEffect(() => {
    if (!articleId) return;

    async function fetchArticleDetails() {
      setLoading(true);
      const token = getAccessToken() || undefined;

      try {
        const article = await ArticlesApiClient.getArticleById(articleId!, token);
        setTitle(article.title || '');
        setSummary(article.summary || '');
        setContent(article.content || '');
        setFeaturedImageUrl(article.featuredImageUrl || '');
        setStatus(article.status || 'DRAFT');
      } catch (err: any) {
        setError(err?.message || 'Failed to load article for editing.');
      } finally {
        setLoading(false);
      }
    }

    fetchArticleDetails();
  }, [articleId]);

  // Handle Word Document Upload (.docx / .doc / .txt)
  const handleWordFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportingDoc(true);
    setError(null);
    setDocImportSuccess(null);

    try {
      const parsed = await parseWordDocument(file);

      // Auto-populate Title if empty or provide confirmation
      if (parsed.title) {
        setTitle(parsed.title);
      }

      // Auto-populate Summary
      if (parsed.summary) {
        setSummary(parsed.summary);
      }

      // Auto-populate Content with formatted HTML
      if (parsed.contentHtml) {
        setContent(parsed.contentHtml);
      }

      setDocImportSuccess(
        `Successfully imported "${file.name}" (~${parsed.wordCount} words). Title, executive summary, and formatted clinical text have been recognized and populated.`
      );
    } catch (err: any) {
      setError(`Failed to parse Word document: ${err?.message || 'Unsupported format'}. Please try a valid .docx file.`);
    } finally {
      setImportingDoc(false);
      if (wordFileInputRef.current) {
        wordFileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (targetStatus?: ArticleStatus) => {
    setError(null);

    if (!title.trim()) {
      setError('Article Title is required.');
      return;
    }

    // Extract text from content (stripping HTML tags) to ensure it's not empty
    const plainText = content.replace(/<[^>]+>/g, '').trim();
    if (!plainText && !content.trim()) {
      setError('Full Clinical Content is required.');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setError('Authentication required. Please log in as a Medical Reviewer.');
      return;
    }

    setSubmitting(true);
    const finalStatus = targetStatus || status;

    try {
      if (isEditMode && articleId) {
        await ArticlesApiClient.updateArticle(
          articleId,
          {
            title: title.trim(),
            summary: summary.trim() || undefined,
            content: content.trim(),
            featuredImageUrl: featuredImageUrl.trim() || undefined,
            status: finalStatus,
          },
          token,
        );
      } else {
        await ArticlesApiClient.createArticle(
          {
            title: title.trim(),
            summary: summary.trim() || undefined,
            content: content.trim(),
            featuredImageUrl: featuredImageUrl.trim() || undefined,
            status: finalStatus,
          },
          token,
        );
      }

      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Failed to save article. Please check your inputs and permissions.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="article-editor-container">
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
          Loading Article Data...
        </div>
      </div>
    );
  }

  return (
    <div className="article-editor-container">
      {/* EDITOR HEADER */}
      <div className="editor-header">
        <div className="editor-title-group">
          <h1 className="editor-title">
            {isEditMode ? 'Edit Medical Article' : 'Create New Clinical Article'}
          </h1>
          <p className="editor-subtitle">
            {isEditMode
              ? 'Update clinical content, subject classification, and publication status.'
              : 'Author and submit peer-reviewed clinical articles, anatomical guides, or literature.'}
          </p>
        </div>

        <button type="button" className="btn-back-link" onClick={onCancel}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      {/* ERROR BANNER */}
      {error ? <div className="editor-error-banner">{error}</div> : null}

      {/* WORD DOCUMENT IMPORT BANNER / CARD */}
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
            <h3>Import Word Document (.docx / .doc)</h3>
            <p>
              Upload a manuscript or case study. The system automatically extracts headings, clinical sections, and formatting so you don't have to retype.
            </p>
          </div>
          <div className="word-import-action">
            <input
              ref={wordFileInputRef}
              type="file"
              accept=".docx,.doc,.txt"
              onChange={handleWordFileChange}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="btn-word-upload"
              onClick={() => wordFileInputRef.current?.click()}
              disabled={importingDoc}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {importingDoc ? 'Recognizing Document...' : 'Upload Word File'}
            </button>
          </div>
        </div>

        {docImportSuccess && (
          <div className="word-import-success-alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{docImportSuccess}</span>
          </div>
        )}
      </div>

      {/* EDITOR FORM */}
      <div className="editor-form-card">
        {/* TITLE */}
        <div className="form-field">
          <label className="field-label">
            Article Title <span className="field-required">*</span>
          </label>
          <input
            type="text"
            className="field-input"
            placeholder="e.g., Upper Limb Brachial Plexus Anatomy & Clinical Correlates"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* SUMMARY */}
        <div className="form-field">
          <label className="field-label">Executive Summary</label>
          <input
            type="text"
            className="field-input"
            placeholder="Brief high-level summary for medical students and reviewers..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>

        {/* CONTENT - WORDPAD STYLE WYSIWYG */}
        <div className="form-field">
          <label className="field-label">
            Full Clinical Content <span className="field-required">*</span>
          </label>
          <p className="field-help" style={{ marginBottom: '6px' }}>
            WordPad-style rich editor: format headings, clinical findings, alignments, diagnostic lists, and medical callouts.
          </p>
          <RichTextEditor
            value={content}
            onChange={(newVal) => setContent(newVal)}
            placeholder="Detailed clinical text, anatomy, physiological mechanisms, or diagnosis pathways..."
            minHeight="380px"
          />
        </div>

        {/* FEATURED IMAGE UPLOAD (REPLACES URL INPUT) */}
        <div className="form-field">
          <ImageUploader
            value={featuredImageUrl}
            onChange={(url) => setFeaturedImageUrl(url)}
            label="Featured Clinical Image"
            helpText="Upload anatomical diagrams, histological slides, or surgical scans (PNG, JPG, WEBP). Or paste a direct URL below."
            variant="banner"
          />
        </div>

        {/* STATUS ROW */}
        <div className="form-field" style={{ maxWidth: '400px' }}>
          <label className="field-label">Publication Status</label>
          <select
            className="field-select"
            value={status}
            onChange={(e) => setStatus(e.target.value as ArticleStatus)}
          >
            <option value="DRAFT">Draft (Reviewer Workspace only)</option>
            <option value="PUBLISHED">Published (Visible to all Students)</option>
          </select>
        </div>

        {/* ACTIONS BAR */}
        <div className="editor-actions-bar">
          <button type="button" className="btn-editor-cancel" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-editor-save-draft"
            onClick={() => handleSubmit('DRAFT')}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            className="btn-editor-publish"
            onClick={() => handleSubmit('PUBLISHED')}
            disabled={submitting}
          >
            {submitting ? 'Publishing...' : 'Publish Article'}
          </button>
        </div>
      </div>
    </div>
  );
};
