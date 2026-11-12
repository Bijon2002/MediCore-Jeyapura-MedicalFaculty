import React from 'react';
import { SEOHead } from './seo/SEOHead';
import './StaticContent.css';

export interface ForEducatorsProps {
  onApplyReviewer: () => void;
  onNavigateToArticles: () => void;
}

export const ForEducators: React.FC<ForEducatorsProps> = ({ onApplyReviewer, onNavigateToArticles }) => {
  return (
    <div className="static-page-wrapper">
      <SEOHead
        title="Create Medical Learning Content"
        description="Author, curate, and peer-review clinical education content on medcore. A platform for professors, consultants, and senior clinicians to publish high-yield teaching resources."
        canonicalPath="/for-educators"
      />

      <div className="static-hero-section">
        <div className="static-tag-pill">EDUCATOR &amp; CLINICIAN PORTAL</div>
        <h1 className="static-title">Teach, Mentor, and Publish for a Global Audience</h1>
        <p className="static-lead">
          Share your clinical expertise, surgical techniques, and diagnostic pathways with thousands of aspiring physicians through our peer-reviewed educational infrastructure.
        </p>
        <div className="static-cta-group">
          <button type="button" className="static-primary-btn" onClick={onApplyReviewer}>
            Apply as Faculty Reviewer →
          </button>
          <button type="button" className="static-secondary-btn" onClick={onNavigateToArticles}>
            View Published Guides
          </button>
        </div>
      </div>

      <div className="static-feature-grid">
        <div className="static-card">
          <div className="static-card-icon">🩺</div>
          <h3>Peer-Review Governance</h3>
          <p>
            Ensure medical accuracy and educational rigor by reviewing student submissions and validating evidence-based references before publication.
          </p>
        </div>

        <div className="static-card">
          <div className="static-card-icon">📚</div>
          <h3>Structured Clinical Tooling</h3>
          <p>
            Create diagnostic algorithms, case vignettes, and multi-step practice questions using rich clinical formatting tools and DOCX import capabilities.
          </p>
        </div>

        <div className="static-card">
          <div className="static-card-icon">🌍</div>
          <h3>Open-Access Educational Impact</h3>
          <p>
            Democratize healthcare education by making high-quality clinical teaching materials freely accessible to under-resourced medical faculties worldwide.
          </p>
        </div>
      </div>
    </div>
  );
};

