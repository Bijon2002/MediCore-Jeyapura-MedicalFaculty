import React, { useRef, useEffect, useState, useCallback } from 'react';
import './RichTextEditor.css';

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Type your medical text here, format anatomy sections, and structure clinical insights...',
  minHeight = '360px',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceCode, setSourceCode] = useState(value);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    justifyFull: false,
    insertUnorderedList: false,
    insertOrderedList: false,
  });

  // Calculate word & character counts
  const getCounts = useCallback((html: string) => {
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    return { words, chars };
  }, []);

  const [stats, setStats] = useState(() => getCounts(value));

  // Sync incoming value to contentEditable when not in source mode
  useEffect(() => {
    if (!editorRef.current || isSourceMode) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
      setStats(getCounts(value));
    }
  }, [value, isSourceMode, getCounts]);

  // Keep sourceCode in sync with value
  useEffect(() => {
    setSourceCode(value);
    setStats(getCounts(value));
  }, [value, getCounts]);

  const updateActiveFormats = () => {
    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        justifyLeft: document.queryCommandState('justifyLeft'),
        justifyCenter: document.queryCommandState('justifyCenter'),
        justifyRight: document.queryCommandState('justifyRight'),
        justifyFull: document.queryCommandState('justifyFull'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        insertOrderedList: document.queryCommandState('insertOrderedList'),
      });
    } catch {
      // Ignore if document selection is outside editor
    }
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    onChange(html);
    setSourceCode(html);
    setStats(getCounts(html));
    updateActiveFormats();
  };

  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (isSourceMode) return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, arg);
    handleInput();
  };

  const handleFormatBlock = (tag: string) => {
    if (isSourceMode) return;
    executeCommand('formatBlock', tag);
  };

  const handleFontFamily = (family: string) => {
    if (isSourceMode) return;
    executeCommand('fontName', family);
  };

  const handleFontSize = (sizeVal: string) => {
    if (isSourceMode) return;
    // execCommand fontSize accepts 1-7
    executeCommand('fontSize', sizeVal);
  };

  const handleTextColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    executeCommand('foreColor', e.target.value);
  };

  const handleHighlightColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    executeCommand('hiliteColor', e.target.value);
  };

  const handleInsertLink = () => {
    const url = prompt('Enter URL for the link:', 'https://');
    if (url && url !== 'https://') {
      executeCommand('createLink', url);
    }
  };

  const toggleSourceMode = () => {
    if (isSourceMode) {
      // Switching back to visual mode
      onChange(sourceCode);
      setIsSourceMode(false);
    } else {
      // Switching to source mode
      if (editorRef.current) {
        setSourceCode(editorRef.current.innerHTML);
      }
      setIsSourceMode(true);
    }
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setSourceCode(val);
    onChange(val);
    setStats(getCounts(val));
  };

  return (
    <div className="wordpad-editor-wrapper">
      {/* WORDPAD RIBBON TOOLBAR */}
      <div className="wordpad-ribbon" role="toolbar" aria-label="WordPad Formatting Toolbar">
        {/* GROUP 1: HISTORY */}
        <div className="ribbon-group" title="Undo / Redo">
          <button
            type="button"
            className="ribbon-btn"
            onClick={() => executeCommand('undo')}
            title="Undo (Ctrl+Z)"
            disabled={isSourceMode}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 7v6h6" />
              <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
            </svg>
          </button>
          <button
            type="button"
            className="ribbon-btn"
            onClick={() => executeCommand('redo')}
            title="Redo (Ctrl+Y)"
            disabled={isSourceMode}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 7v6h-6" />
              <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
            </svg>
          </button>
        </div>

        <div className="ribbon-divider" />

        {/* GROUP 2: FONT & SIZE DROPDOWNS */}
        <div className="ribbon-group">
          <select
            className="ribbon-select font-family-select"
            onChange={(e) => handleFontFamily(e.target.value)}
            disabled={isSourceMode}
            defaultValue="Inter, system-ui, sans-serif"
            title="Font Family"
          >
            <option value="Inter, system-ui, sans-serif">Inter (Modern Sans)</option>
            <option value="Arial, Helvetica, sans-serif">Arial</option>
            <option value="Calibri, Candara, sans-serif">Calibri</option>
            <option value="'Times New Roman', Times, serif">Times New Roman</option>
            <option value="Georgia, serif">Georgia (Clinical)</option>
            <option value="'Courier New', Courier, monospace">Courier (Monospace)</option>
          </select>

          <select
            className="ribbon-select font-size-select"
            onChange={(e) => handleFontSize(e.target.value)}
            disabled={isSourceMode}
            defaultValue="3"
            title="Font Size"
          >
            <option value="1">10 pt (Small)</option>
            <option value="2">12 pt (Body)</option>
            <option value="3">14 pt (Normal)</option>
            <option value="4">16 pt (Medium)</option>
            <option value="5">18 pt (Subheading)</option>
            <option value="6">24 pt (Heading)</option>
            <option value="7">32 pt (Title)</option>
          </select>

          <select
            className="ribbon-select format-heading-select"
            onChange={(e) => handleFormatBlock(e.target.value)}
            disabled={isSourceMode}
            defaultValue="<p>"
            title="Style / Heading"
          >
            <option value="<p>">Normal Paragraph</option>
            <option value="<h1>">Heading 1 (Main Topic)</option>
            <option value="<h2>">Heading 2 (Section)</option>
            <option value="<h3>">Heading 3 (Sub-point)</option>
            <option value="<h4>">Heading 4 (Minor Point)</option>
            <option value="<blockquote>">Clinical Callout / Quote</option>
            <option value="<pre>">Diagnostic / Code Block</option>
          </select>
        </div>

        <div className="ribbon-divider" />

        {/* GROUP 3: CHARACTER FORMATTING (B, I, U, S) */}
        <div className="ribbon-group" title="Text Styles">
          <button
            type="button"
            className={`ribbon-btn format-bold ${activeFormats.bold ? 'active' : ''}`}
            onClick={() => executeCommand('bold')}
            title="Bold (Ctrl+B)"
            disabled={isSourceMode}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            className={`ribbon-btn format-italic ${activeFormats.italic ? 'active' : ''}`}
            onClick={() => executeCommand('italic')}
            title="Italic (Ctrl+I)"
            disabled={isSourceMode}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className={`ribbon-btn format-underline ${activeFormats.underline ? 'active' : ''}`}
            onClick={() => executeCommand('underline')}
            title="Underline (Ctrl+U)"
            disabled={isSourceMode}
          >
            <u>U</u>
          </button>
          <button
            type="button"
            className={`ribbon-btn format-strike ${activeFormats.strikeThrough ? 'active' : ''}`}
            onClick={() => executeCommand('strikeThrough')}
            title="Strikethrough"
            disabled={isSourceMode}
          >
            <s>S</s>
          </button>

          {/* Color pickers */}
          <label className="ribbon-color-label" title="Text Color">
            <span className="color-icon-text">A</span>
            <input
              type="color"
              className="ribbon-color-picker"
              defaultValue="#1e293b"
              onChange={handleTextColor}
              disabled={isSourceMode}
            />
          </label>

          <label className="ribbon-color-label highlight-label" title="Highlight Color">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m9 11-6 6v3h3l6-6" />
              <path d="m22 2-2.7 2.7a2 2 0 0 1-2.8 0l-3.2-3.2a2 2 0 0 0-2.8 0L2 10" />
            </svg>
            <input
              type="color"
              className="ribbon-color-picker"
              defaultValue="#fef08a"
              onChange={handleHighlightColor}
              disabled={isSourceMode}
            />
          </label>
        </div>

        <div className="ribbon-divider" />

        {/* GROUP 4: PARAGRAPH ALIGNMENT & LISTS */}
        <div className="ribbon-group" title="Alignment & Lists">
          <button
            type="button"
            className={`ribbon-btn ${activeFormats.justifyLeft ? 'active' : ''}`}
            onClick={() => executeCommand('justifyLeft')}
            title="Align Left (Ctrl+L)"
            disabled={isSourceMode}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="15" y1="12" x2="3" y2="12" />
              <line x1="17" y1="18" x2="3" y2="18" />
            </svg>
          </button>
          <button
            type="button"
            className={`ribbon-btn ${activeFormats.justifyCenter ? 'active' : ''}`}
            onClick={() => executeCommand('justifyCenter')}
            title="Align Center (Ctrl+E)"
            disabled={isSourceMode}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="6" />
              <line x1="21" y1="12" x2="3" y2="12" />
              <line x1="18" y1="18" x2="6" y2="18" />
            </svg>
          </button>
          <button
            type="button"
            className={`ribbon-btn ${activeFormats.justifyRight ? 'active' : ''}`}
            onClick={() => executeCommand('justifyRight')}
            title="Align Right (Ctrl+R)"
            disabled={isSourceMode}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="12" x2="9" y2="12" />
              <line x1="21" y1="18" x2="7" y2="18" />
            </svg>
          </button>
          <button
            type="button"
            className={`ribbon-btn ${activeFormats.justifyFull ? 'active' : ''}`}
            onClick={() => executeCommand('justifyFull')}
            title="Justify Text (Ctrl+J)"
            disabled={isSourceMode}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="12" x2="3" y2="12" />
              <line x1="21" y1="18" x2="3" y2="18" />
            </svg>
          </button>

          <div className="ribbon-sub-divider" />

          {/* Bullet List */}
          <button
            type="button"
            className={`ribbon-btn ${activeFormats.insertUnorderedList ? 'active' : ''}`}
            onClick={() => executeCommand('insertUnorderedList')}
            title="Bullet List (Clinical Findings)"
            disabled={isSourceMode}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="9" y1="6" x2="20" y2="6" />
              <line x1="9" y1="12" x2="20" y2="12" />
              <line x1="9" y1="18" x2="20" y2="18" />
              <circle cx="4" cy="6" r="2" fill="currentColor" />
              <circle cx="4" cy="12" r="2" fill="currentColor" />
              <circle cx="4" cy="18" r="2" fill="currentColor" />
            </svg>
          </button>

          {/* Numbered List */}
          <button
            type="button"
            className={`ribbon-btn ${activeFormats.insertOrderedList ? 'active' : ''}`}
            onClick={() => executeCommand('insertOrderedList')}
            title="Numbered List (Step-by-step Diagnostic Steps)"
            disabled={isSourceMode}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="10" y1="6" x2="21" y2="6" />
              <line x1="10" y1="12" x2="21" y2="12" />
              <line x1="10" y1="18" x2="21" y2="18" />
              <path d="M4 6h1v4M3 10h3" />
              <path d="M3 14h2a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3v1h3" />
            </svg>
          </button>

          {/* Indent / Outdent */}
          <button
            type="button"
            className="ribbon-btn"
            onClick={() => executeCommand('outdent')}
            title="Decrease Indent"
            disabled={isSourceMode}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="7 8 3 12 7 16" />
              <line x1="21" y1="12" x2="11" y2="12" />
              <line x1="21" y1="6" x2="11" y2="6" />
              <line x1="21" y1="18" x2="11" y2="18" />
            </svg>
          </button>
          <button
            type="button"
            className="ribbon-btn"
            onClick={() => executeCommand('indent')}
            title="Increase Indent"
            disabled={isSourceMode}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="17 8 21 12 17 16" />
              <line x1="3" y1="12" x2="13" y2="12" />
              <line x1="3" y1="6" x2="13" y2="6" />
              <line x1="3" y1="18" x2="13" y2="18" />
            </svg>
          </button>
        </div>

        <div className="ribbon-divider" />

        {/* GROUP 5: INSERTION & CLEAR */}
        <div className="ribbon-group" title="Insert Items">
          <button
            type="button"
            className="ribbon-btn"
            onClick={handleInsertLink}
            title="Insert Clinical Web Link"
            disabled={isSourceMode}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </button>

          <button
            type="button"
            className="ribbon-btn"
            onClick={() => executeCommand('insertHorizontalRule')}
            title="Insert Section Divider Line"
            disabled={isSourceMode}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
            </svg>
          </button>

          <button
            type="button"
            className="ribbon-btn"
            onClick={() => executeCommand('removeFormat')}
            title="Clear Formatting"
            disabled={isSourceMode}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7V4h16v3" />
              <path d="M9 20h6" />
              <path d="M12 4v16" />
              <line x1="18" y1="14" x2="22" y2="18" />
              <line x1="22" y1="14" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="ribbon-divider" />

        {/* GROUP 6: VIEW MODE TOGGLE */}
        <div className="ribbon-group" style={{ marginLeft: 'auto' }}>
          <button
            type="button"
            className={`ribbon-btn-toggle ${isSourceMode ? 'active-mode' : ''}`}
            onClick={toggleSourceMode}
            title={isSourceMode ? 'Switch to WordPad Visual Canvas' : 'View / Edit Raw HTML Source'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span>{isSourceMode ? 'Visual Mode' : 'HTML Source'}</span>
          </button>
        </div>
      </div>

      {/* WORDPAD PAPER / EDITING CANVAS */}
      <div className="wordpad-canvas-container">
        {isSourceMode ? (
          <textarea
            className="wordpad-source-editor"
            value={sourceCode}
            onChange={handleSourceChange}
            style={{ minHeight }}
            placeholder="Edit HTML markup directly..."
          />
        ) : (
          <div
            ref={editorRef}
            className="wordpad-paper-canvas"
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyUp={updateActiveFormats}
            onMouseUp={updateActiveFormats}
            style={{ minHeight }}
            data-placeholder={placeholder}
          />
        )}
      </div>

      {/* WORDPAD STATUS BAR */}
      <div className="wordpad-status-bar">
        <div className="status-item">
          <span>Words: <strong>{stats.words}</strong></span>
          <span className="status-sep">|</span>
          <span>Characters: <strong>{stats.chars}</strong></span>
        </div>
        <div className="status-item">
          <span>Est. Reading Time: <strong>{Math.max(1, Math.ceil(stats.words / 200))} min</strong></span>
        </div>
      </div>
    </div>
  );
};

