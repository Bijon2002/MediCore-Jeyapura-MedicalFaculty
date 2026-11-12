import React from 'react';
import { SEOHead } from './seo/SEOHead';
import './StaticContent.css';

export interface ForStudentsProps {
  onNavigateToQuizzes: () => void;
  onNavigateToArticles: () => void;
  onNavigateToSpecialties: () => void;
  onRegister: () => void;
}

export const ForStudents: React.FC<ForStudentsProps> = ({
  onNavigateToQuizzes,
  onNavigateToArticles,
  onNavigateToSpecialties,
  onRegister,
}) => {
  return (
    <div className="static-page-wrapper">
      <SEOHead
        title="Medical Learning Resources for Students"
        description="High-yield medical study resources, clinical MCQ question banks, and peer-reviewed anatomical guides designed for medical undergraduates and board exam candidates."
        canonicalPath="/for-students"
      />

      <div className="static-hero-section">
        <div className="static-tag-pill">STUDENT LEARNING PATHWAY</div>
        <h1 className="static-title">Empowering the Next Generation of Clinicians</h1>
        <p className="static-lead">
          Master foundational sciences, clinical reasoning, and board examination topics with zero subscription paywalls. Designed by medical students for medical students.
        </p>
        <div className="static-cta-group">
          <button type="button" className="static-primary-btn" onClick={onNavigateToQuizzes}>
            Practice Medical Quizzes →
          </button>
          <button type="button" className="static-secondary-btn" onClick={onNavigateToArticles}>
            Browse Clinical Articles
          </button>
          <button type="button" className="static-secondary-btn" onClick={onNavigateToSpecialties}>
            Explore Specialties
          </button>
        </div>
      </div>

      <div className="static-feature-grid">
        <div className="static-card">
          <div className="static-card-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 3 5h2V4Z" /><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-3 5h-2V4Z" /><path d="M12 4v16" /></svg></div>
          <h3>Active Recall &amp; Board MCQs</h3>
          <p>
            Reinforce clinical retention with peer-reviewed multiple choice questions modeled after USMLE Step 1/2 and regional clinical licensing exams.
          </p>
        </div>

        <div className="static-card">
          <div className="static-card-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20S4 15 4 9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 6-6 10-6 10Z" /><path d="M4 12h4l2-3 2 5 2-3h6" /></svg></div>
          <h3>High-Yield Specialty Guides</h3>
          <p>
            Dive into cardiovascular medicine, surgical anatomy, neurology, and pediatrics with verified diagnostic algorithms and physiological mechanisms.
          </p>
        </div>

        <div className="static-card">
          <div className="static-card-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h5" /></svg></div>
          <h3>Contribute &amp; Author Knowledge</h3>
          <p>
            Solidify your understanding by drafting clinical guides and submitting them for faculty peer-review to build your verified academic portfolio.
          </p>
        </div>
      </div>

      <div className="static-callout-banner">
        <h2>Start Your Free Clinical Journey Today</h2>
        <p>Join medical students and resident doctors who rely on medcore for day-to-day clinical preparation.</p>
        <button type="button" className="static-white-btn" onClick={onRegister}>
          Create Student Account
        </button>
      </div>
    </div>
  );
};
