/**
 * SystemAlert — a beautiful centered modal dialog to replace browser
 * window.confirm() and window.alert() calls across the MedCore platform.
 *
 * Usage:
 *   <SystemAlert
 *     type="confirm"          // "confirm" | "alert" | "success" | "danger"
 *     title="Delete Article"
 *     message="Are you sure you want to delete..."
 *     confirmLabel="Delete"   // optional, default "Confirm"
 *     cancelLabel="Cancel"    // optional, shown only for "confirm" type
 *     onConfirm={() => { ... }}
 *     onCancel={() => { ... }}
 *   />
 */
import React, { useEffect, useRef } from 'react';
import './SystemAlert.css';

export type SystemAlertType = 'confirm' | 'alert' | 'success' | 'danger' | 'warning' | 'info';

export interface SystemAlertProps {
  type?: SystemAlertType;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  /** If true, dialog is shown. Control visibility from outside. */
  isOpen: boolean;
}

const ICONS: Record<SystemAlertType, React.ReactNode> = {
  confirm: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  alert: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  success: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  danger: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

const CONFIRM_BTN_CLASS: Record<SystemAlertType, string> = {
  confirm: 'sa-btn-confirm',
  alert: 'sa-btn-alert',
  success: 'sa-btn-success',
  danger: 'sa-btn-danger',
  warning: 'sa-btn-warning',
  info: 'sa-btn-info',
};

export const SystemAlert: React.FC<SystemAlertProps> = ({
  type = 'confirm',
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isOpen,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  /* Focus confirm button on open */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => confirmBtnRef.current?.focus(), 60);
    }
  }, [isOpen]);

  /* Keyboard: Escape → cancel, Enter → confirm */
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel?.();
      if (e.key === 'Enter') onConfirm?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onConfirm, onCancel]);

  if (!isOpen) return null;

  const resolvedLabel = confirmLabel ?? (type === 'danger' ? 'Delete' : 'OK');

  return (
    <div
      className="sa-overlay"
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sa-title"
      onClick={(e) => { if (e.target === overlayRef.current) onCancel?.(); }}
    >
      <div className={`sa-modal sa-modal--${type}`}>
        <div className="sa-icon-box">{ICONS[type]}</div>

        <div className="sa-content">
          <h2 id="sa-title" className="sa-title">{title}</h2>
          <div className="sa-message">{message}</div>
        </div>

        <div className="sa-actions">
          {(type === 'confirm' || type === 'danger' || type === 'warning') && onCancel && (
            <button type="button" className="sa-btn sa-btn-cancel" onClick={onCancel}>
              {cancelLabel}
            </button>
          )}
          {onConfirm && (
            <button
              ref={confirmBtnRef}
              type="button"
              className={`sa-btn ${CONFIRM_BTN_CLASS[type]}`}
              onClick={onConfirm}
            >
              {resolvedLabel}
            </button>
          )}
          {!onConfirm && onCancel && (
            <button type="button" className="sa-btn sa-btn-cancel" onClick={onCancel}>
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
