import React, { useState, useEffect, useRef } from 'react';
import './AppPreloader.css';

interface AppPreloaderProps {
  onLoaded?: () => void;
  isReady?: boolean;
}

type PreloaderPhase = 'ECG' | 'LOGO';

export const AppPreloader: React.FC<AppPreloaderProps> = ({ onLoaded, isReady = true }) => {
  const [phase, setPhase] = useState<PreloaderPhase>('ECG');
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [isRemoved, setIsRemoved] = useState<boolean>(false);
  const [isWaitingForAuth, setIsWaitingForAuth] = useState<boolean>(false);

  // Keep track of whether the minimum animation sequence reached LOGO phase
  const isSequenceFinishedRef = useRef(false);
  const isReadyRef = useRef(isReady);
  isReadyRef.current = isReady;

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setPhase('LOGO');
      isSequenceFinishedRef.current = true;
      if (isReady) {
        setIsFadingOut(true);
        const t = setTimeout(() => {
          setIsRemoved(true);
          onLoaded?.();
        }, 300);
        return () => clearTimeout(t);
      }
      return;
    }

    // Timeline:
    // ECG Heartbeat: 0.0s – 1.5s
    const logoTimer = setTimeout(() => {
      setPhase('LOGO');
    }, 1500);

    // MedCore Logo Reveal: 1.5s – 2.5s (Start fade out at 2.5s; fade duration 0.5s -> completes at 3.0s)
    const sequenceCompleteTimer = setTimeout(() => {
      isSequenceFinishedRef.current = true;

      if (isReadyRef.current) {
        // App is already loaded and authenticated -> start smooth transition to website (2.5s -> 3.0s)
        setIsFadingOut(true);
        const removeTimer = setTimeout(() => {
          setIsRemoved(true);
          onLoaded?.();
        }, 500);
        return () => clearTimeout(removeTimer);
      } else {
        // App is still authenticating or loading data -> show subtle waiting status without restarting animation
        setIsWaitingForAuth(true);
      }
    }, 2500);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(sequenceCompleteTimer);
    };
  }, [onLoaded]);

  // When app becomes ready after the initial sequence has reached completion (>= 2.5s)
  useEffect(() => {
    if (isReady && isSequenceFinishedRef.current && !isFadingOut) {
      setIsWaitingForAuth(false);
      setIsFadingOut(true);
      const removeTimer = setTimeout(() => {
        setIsRemoved(true);
        onLoaded?.();
      }, 500);
      return () => clearTimeout(removeTimer);
    }
  }, [isReady, isFadingOut, onLoaded]);

  if (isRemoved) {
    return null;
  }

  return (
    <div
      className={`medcore-preloader-overlay ${isFadingOut ? 'fade-out' : ''}`}
      aria-label="Loading MedCore Clinical Platform"
      role="status"
    >
      <div className="preloader-stage">
        {/* PHASE 1: ECG HEARTBEAT (0.0s - 1.5s) */}
        {phase === 'ECG' && (
          <div className="preloader-ecg-container" aria-hidden="true">
            <svg
              className="ecg-svg"
              viewBox="0 0 360 90"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Subtle baseline track */}
              <path
                className="ecg-path-bg"
                d="M 10 45 L 85 45 L 95 38 L 105 45 L 125 45 L 135 15 L 148 78 L 160 30 L 172 45 L 195 45 L 210 32 L 225 45 L 350 45"
              />

              {/* Clean Teal (#0D9488) animated heartbeat pulse */}
              <path
                className="ecg-path-pulse"
                d="M 10 45 L 85 45 L 95 38 L 105 45 L 125 45 L 135 15 L 148 78 L 160 30 L 172 45 L 195 45 L 210 32 L 225 45 L 350 45"
              />

              {/* Pulse lead dot */}
              <circle
                className="ecg-lead-dot"
                cx="148"
                cy="78"
                r="3.5"
                fill="#0d9488"
              />
            </svg>
            <span className="ecg-status-text">System Vitals Initializing</span>
          </div>
        )}

        {/* PHASE 2: ORIGINAL MEDCORE LOGO REVEAL (1.5s - 2.5s+) */}
        {phase === 'LOGO' && (
          <div className="preloader-logo-container">
            {/* Clean logo box on pure white */}
            <div className="preloader-logo-box">
              <img
                src="/medcore-logo.png"
                alt="MedCore Logo"
                className="preloader-logo-image"
              />
            </div>

            {/* Brand Title */}
            <h1 className="preloader-brand-name">
              Med<span className="brand-core">Core</span>
            </h1>

            {/* Subtitle */}
            <p className="preloader-tagline">Medical Curriculum &amp; Clinical Decision Platform</p>

            {/* Subtle Waiting Indicator if Supabase Auth is still completing */}
            {isWaitingForAuth && (
              <div className="preloader-waiting-pill">
                <span>Connecting workspace...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
