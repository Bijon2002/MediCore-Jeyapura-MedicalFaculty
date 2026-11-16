/**
 * MedicalDayBanner — displays today's international health awareness day
 *
 * On first page load: a centered popup (rendered into document.body via Portal).
 * In hero section: a sleek floating info pill with medical SVG icon, placed
 * on the opposite side below the clinical marquee.
 *
 * Uses useMedicalDay() hook for data (no emojis, purely medical SVG iconography).
 */
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMedicalDay, type MedicalDayIcon } from '../hooks/useMedicalDay';
import './MedicalDayBanner.css';

const STORAGE_KEY = 'medcore_medical_day_dismissed';

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

/** Pure medical SVG icon renderer — zero emojis */
export const MedicalIcon: React.FC<{ type: MedicalDayIcon; size?: number; color?: string; className?: string }> = ({
  type,
  size = 24,
  color = 'currentColor',
  className = '',
}) => {
  switch (type) {
    case 'heart':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          <path d="M12 9v4" />
          <path d="M10 11h4" />
        </svg>
      );
    case 'lungs':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 3v9" />
          <path d="M12 7l-4 3" />
          <path d="M12 7l4 3" />
          <path d="M6 10a4 4 0 0 0-4 4c0 4 2 7 5 7h1a2 2 0 0 0 2-2v-8a1 1 0 0 0-1-1H6Z" />
          <path d="M18 10a4 4 0 0 1 4 4c0 4-2 7-5 7h-1a2 2 0 0 1-2-2v-8a1 1 0 0 1 1-1h4Z" />
        </svg>
      );
    case 'brain':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M9.5 2A4.5 4.5 0 0 0 5 6.5c0 .77.2 1.5.55 2.14A4.5 4.5 0 0 0 3 12.5C3 14.5 4.3 16.2 6.1 16.8A4.5 4.5 0 0 0 10.5 21c.5 0 1-.08 1.5-.24V3.24A4.5 4.5 0 0 0 9.5 2Z" />
          <path d="M14.5 2A4.5 4.5 0 0 1 19 6.5c0 .77-.2 1.5-.55 2.14A4.5 4.5 0 0 1 21 12.5c0 2-1.3 3.7-3.1 4.3A4.5 4.5 0 0 1 13.5 21c-.5 0-1-.08-1.5-.24V3.24A4.5 4.5 0 0 1 14.5 2Z" />
        </svg>
      );
    case 'ribbon':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M8 3c-2 0-3.5 1.5-3.5 3.5 0 2.5 3.5 7.5 7.5 11.5l3.5 4 1.5-1.5-4-4.5c3-3 6.5-6.5 6.5-9.5 0-2-1.5-3.5-3.5-3.5-2 0-3.5 1.5-4 2.5C11.5 4.5 10 3 8 3Z" />
          <path d="M9 13.5l-4 4.5 1.5 1.5 3.5-4" />
        </svg>
      );
    case 'droplet':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          <path d="M12 11v4" />
          <path d="M10 13h4" />
        </svg>
      );
    case 'stetho':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M4.5 3v5a4.5 4.5 0 0 0 9 0V3" />
          <path d="M6 3h-3" />
          <path d="M15 3h-3" />
          <path d="M9 12.5v3.5a4 4 0 0 0 8 0v-2" />
          <circle cx="17" cy="12" r="2" />
        </svg>
      );
    case 'shield':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case 'bone':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="6" r="3" />
          <circle cx="18" cy="18" r="3" />
          <line x1="6" y1="9" x2="6" y2="15" />
          <line x1="18" y1="9" x2="18" y2="15" />
          <line x1="9" y1="6" x2="15" y2="6" />
          <line x1="9" y1="18" x2="15" y2="18" />
          <line x1="6" y1="12" x2="18" y2="12" />
        </svg>
      );
    case 'eye':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case 'dna':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <path d="M2 15c6.667-6 13.333 0 20-6" />
          <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993" />
          <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993" />
          <path d="M17 6l-2.5-2.5" />
          <path d="M14 8l-1-1" />
          <path d="M7 18l2.5 2.5" />
          <path d="M3.5 14.5l3-3" />
        </svg>
      );
    case 'cross':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      );
  }
};

/**
 * Full-screen centered popup (shown on first visit today).
 * Uses React Portal into document.body to ensure zero scrolling is needed
 * regardless of any parent CSS transforms.
 */
export const MedicalDayPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { today } = useMedicalDay();
  if (!today) return null;

  const content = (
    <div className="mdb-overlay" role="dialog" aria-modal="true" aria-labelledby="mdb-popup-title">
      <div className="mdb-popup" style={{ '--mdb-color': today.color } as React.CSSProperties}>
        <button className="mdb-close-btn" onClick={onClose} aria-label="Close dialog">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="mdb-popup-top-stripe" />

        {/* Clean medical icon box — no emojis */}
        <div className="mdb-popup-icon-container">
          <div className="mdb-popup-icon-pulse" />
          <MedicalIcon type={today.iconType} size={46} color={today.color} />
        </div>

        <div className="mdb-popup-badge">
          <span className="mdb-pulse-dot" />
          <span>Today · {today.org || 'Global Healthcare'}</span>
        </div>

        <h2 id="mdb-popup-title" className="mdb-popup-title">{today.name}</h2>

        {today.theme && (
          <div className="mdb-popup-theme">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            <span>Theme: <em>{today.theme}</em></span>
          </div>
        )}

        <p className="mdb-popup-desc">{today.description}</p>

        <div className="mdb-popup-actions">
          {today.link && (
            <a
              href={today.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mdb-btn-primary"
              style={{ background: today.color }}
            >
              Learn More
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
          <button type="button" className="mdb-btn-secondary" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
};

/**
 * Floating info pill shown inside the hero section on the opposite side
 * (top-left, well below the marquee ticker), styled cleanly with SVG icons.
 */
export const MedicalDayHeroPill: React.FC = () => {
  const { today } = useMedicalDay();
  const [visible, setVisible] = useState(true);

  if (!today || !visible) return null;

  return (
    <aside
      className="mdb-hero-pill"
      style={{ '--mdb-color': today.color } as React.CSSProperties}
      aria-label="Today's Global Health Awareness Day"
    >
      <div
        className="mdb-hero-pill-icon-box"
        style={{ background: `color-mix(in srgb, ${today.color} 22%, transparent)` }}
      >
        <MedicalIcon type={today.iconType} size={18} color={today.color} />
      </div>

      <div className="mdb-hero-pill-text">
        <div className="mdb-hero-pill-sub">
          <span className="mdb-hero-pill-pulse" style={{ background: today.color }} />
          <span>AWARENESS DAY · {today.org || 'GLOBAL'}</span>
        </div>
        <div className="mdb-hero-pill-title" title={today.name}>{today.name}</div>
      </div>

      {today.link && (
        <a
          href={today.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mdb-hero-pill-link"
          aria-label={`Learn more about ${today.name}`}
          title="Learn more"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      )}

      <button
        type="button"
        className="mdb-hero-pill-close"
        onClick={() => setVisible(false)}
        aria-label="Dismiss banner"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </aside>
  );
};

/**
 * Controller component — triggers the centered popup on first load of the day.
 * Mounts in Home.tsx.
 */
export const MedicalDayController: React.FC = () => {
  const { today } = useMedicalDay();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (!today) return;
    const dismissed = localStorage.getItem(STORAGE_KEY);
    const todayKey = getTodayKey();
    if (dismissed !== todayKey) {
      // Delay slightly for smooth page entry
      const timer = setTimeout(() => setShowPopup(true), 800);
      return () => clearTimeout(timer);
    }
  }, [today]);

  const handleClose = () => {
    setShowPopup(false);
    localStorage.setItem(STORAGE_KEY, getTodayKey());
    window.dispatchEvent(new CustomEvent('medcore:medical-day-dismissed'));
  };

  if (!showPopup) return null;

  return <MedicalDayPopup onClose={handleClose} />;
};
