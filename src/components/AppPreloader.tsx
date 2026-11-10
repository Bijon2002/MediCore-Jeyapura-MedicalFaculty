import React, { useState, useEffect } from 'react';
import './AppPreloader.css';

interface AppPreloaderProps {
  onLoaded?: () => void;
  isReady?: boolean;
}

export const AppPreloader: React.FC<AppPreloaderProps> = ({ onLoaded, isReady = true }) => {
  const isAlreadyVisited = typeof window !== 'undefined' && sessionStorage.getItem('medcore_visited') === 'true';
  const [progress, setProgress] = useState<number>(isAlreadyVisited ? 100 : 40);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(isAlreadyVisited);
  const [isRemoved, setIsRemoved] = useState<boolean>(isAlreadyVisited);

  useEffect(() => {
    if (isAlreadyVisited) {
      if (onLoaded) onLoaded();
      return;
    }

    if (isReady) {
      setProgress(100);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('medcore_visited', 'true');
      }
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
        const removeTimer = setTimeout(() => {
          setIsRemoved(true);
          if (onLoaded) {
            onLoaded();
          }
        }, 120);
        return () => clearTimeout(removeTimer);
      }, 80);

      return () => clearTimeout(fadeTimer);
    } else {
      const t = setTimeout(() => {
        setProgress((prev) => Math.min(prev + 30, 90));
      }, 60);
      return () => clearTimeout(t);
    }
  }, [isReady, onLoaded, isAlreadyVisited]);

  if (isRemoved || isAlreadyVisited) {
    return null;
  }

  return (
    <div
      className={`medcore-preloader-overlay ${isFadingOut ? 'fade-out' : ''}`}
      aria-label="Loading MedCore"
      role="status"
    >
      <div className="preloader-content-box">
        {/* LOGO SQUIRCLE */}
        <div className="preloader-logo-squircle">
          <img
            src="/medcore-logo.png"
            alt="MedCore Logo"
            className="preloader-logo-img"
          />
          <div className="preloader-pulse-glow" aria-hidden="true" />
        </div>

        {/* BRAND TITLE */}
        <h1 className="preloader-brand-title">MedCore</h1>

        {/* HORIZONTAL PROGRESS BAR */}
        <div className="preloader-progress-track">
          <div
            className="preloader-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* WELCOME MESSAGE */}
        <p className="preloader-welcome-text">Welcome to MedCore</p>
      </div>
    </div>
  );
};
