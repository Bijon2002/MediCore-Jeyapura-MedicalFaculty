/**
 * MedicalDayBanner — displays today's international health awareness day
 *
 * On first page load: a centered popup (like a "did you know" notification).
 * After closing: a small floating info pill in the hero section.
 *
 * Uses useMedicalDay() hook for data (no API key required).
 */
import React, { useState, useEffect } from 'react';
import { useMedicalDay } from '../hooks/useMedicalDay';
import './MedicalDayBanner.css';

const STORAGE_KEY = 'medcore_medical_day_dismissed';

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

/** Full-screen centered popup (shown once per day) */
export const MedicalDayPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { today } = useMedicalDay();
  if (!today) return null;

  return (
    <div className="mdb-overlay" role="dialog" aria-modal="true" aria-labelledby="mdb-popup-title">
      <div className="mdb-popup" style={{ '--mdb-color': today.color } as React.CSSProperties}>
        <button className="mdb-close-btn" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="mdb-popup-top-stripe" />

        <div className="mdb-popup-emoji" aria-hidden="true">{today.emoji}</div>

        <div className="mdb-popup-badge">
          <span className="mdb-pulse-dot" />
          <span>Today · {today.org}</span>
        </div>

        <h2 id="mdb-popup-title" className="mdb-popup-title">{today.name}</h2>

        {today.theme && (
          <div className="mdb-popup-theme">
            <span>🏷️</span>
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
};

/** Floating pill shown in the hero section after popup is dismissed */
export const MedicalDayHeroPill: React.FC = () => {
  const { today } = useMedicalDay();
  const [visible, setVisible] = useState(true);
  if (!today || !visible) return null;

  return (
    <div
      className="mdb-hero-pill"
      style={{ '--mdb-color': today.color } as React.CSSProperties}
      title={today.description}
    >
      <span className="mdb-hero-pill-emoji" aria-hidden="true">{today.emoji}</span>
      <div className="mdb-hero-pill-text">
        <span className="mdb-hero-pill-label">Today</span>
        <span className="mdb-hero-pill-name">{today.name}</span>
      </div>
      {today.link && (
        <a href={today.link} target="_blank" rel="noopener noreferrer" className="mdb-hero-pill-link" aria-label="Learn more">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      )}
      <button className="mdb-hero-pill-close" onClick={() => setVisible(false)} aria-label="Dismiss">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};

/**
 * Controller component — handles showing popup once per day, then pill.
 * Place inside Home.tsx.
 */
export const MedicalDayController: React.FC = () => {
  const { today } = useMedicalDay();
  const [showPopup, setShowPopup] = useState(false);
  const [showPill, setShowPill] = useState(false);

  useEffect(() => {
    if (!today) return;
    const dismissed = localStorage.getItem(STORAGE_KEY);
    const todayKey = getTodayKey();
    if (dismissed !== todayKey) {
      // Show popup after a short delay (let page load first)
      const timer = setTimeout(() => setShowPopup(true), 1200);
      return () => clearTimeout(timer);
    } else {
      setShowPill(true);
    }
  }, [today]);

  const handleClose = () => {
    setShowPopup(false);
    setShowPill(true);
    localStorage.setItem(STORAGE_KEY, getTodayKey());
  };

  return (
    <>
      {showPopup && <MedicalDayPopup onClose={handleClose} />}
      {showPill && !showPopup && <MedicalDayHeroPill />}
    </>
  );
};
