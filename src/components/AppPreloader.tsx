import React, { useState, useEffect } from 'react';
import './AppPreloader.css';

interface AppPreloaderProps {
  onLoaded?: () => void;
  isReady?: boolean;
}

export const AppPreloader: React.FC<AppPreloaderProps> = ({ onLoaded, isReady = true }) => {
  const [progress, setProgress] = useState<number>(15);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [isRemoved, setIsRemoved] = useState<boolean>(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(50);
    }, 250);

    const t2 = setTimeout(() => {
      setProgress(85);
    }, 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (isReady && progress >= 85) {
      const finishTimer = setTimeout(() => {
        setProgress(100);

        const fadeTimer = setTimeout(() => {
          setIsFadingOut(true);

          const removeTimer = setTimeout(() => {
            setIsRemoved(true);
            if (onLoaded) {
              onLoaded();
            }
          }, 500);

          return () => clearTimeout(removeTimer);
        }, 350);

        return () => clearTimeout(fadeTimer);
      }, 350);

      return () => clearTimeout(finishTimer);
    }
  }, [isReady, progress, onLoaded]);

  if (isRemoved) {
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
