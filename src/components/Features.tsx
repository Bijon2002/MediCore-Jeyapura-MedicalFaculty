import React from 'react';
import { SEOHead } from './seo/SEOHead';
import './StaticContent.css';

export interface FeaturesProps {
  onNavigateToQuizzes?: () => void;
  onNavigateToArticles?: () => void;
}

export const Features: React.FC<FeaturesProps> = ({ onNavigateToQuizzes, onNavigateToArticles }) => {
  return (
    <div className="static-page-wrapper">
      <SEOHead
        title="Platform Capabilities & Clinical Tools"
        description="Discover medcore platform features: high-yield interactive medical quizzes, peer-reviewed clinical articles, DOCX file import, instant avatar sync, and floating AI assistant."
        canonicalPath="/features"
      />

      <div className="static-hero-section">
        <div className="static-tag-pill">PLATFORM CAPABILITIES</div>
        <h1 className="static-title">Modern Full-Stack Medical Learning Architecture</h1>
        <p className="static-lead">
          Built with React 19, TypeScript, and Supabase to deliver sub-second clinical queries, responsive diagnostic guides, and rigorous peer-review workflows.
        </p>
        <div className="static-cta-group">
          {onNavigateToQuizzes && (
            <button type="button" className="static-primary-btn" onClick={onNavigateToQuizzes}>
              Try Interactive Quizzes →
            </button>
          )}
          {onNavigateToArticles && (
            <button type="button" className="static-secondary-btn" onClick={onNavigateToArticles}>
              Explore Clinical Guides
            </button>
          )}
        </div>
      </div>

      <div className="static-feature-grid">
        <div className="static-card">
          <div className="static-card-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" /></svg></div>
          <h3>Sub-Second Content Delivery</h3>
          <p>
            Vite-powered lightweight bundling and column-level query optimization ensure instant navigation between clinical specialties and diagnostic guides.
          </p>
        </div>

        <div className="static-card">
          <div className="static-card-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5M4 19h16M8 16v-5M12 16V7M16 16v-9" /></svg></div>
          <h3>Interactive Medical Quizzes</h3>
          <p>
            Timed and untimed clinical vignettes with instant scoring, comprehensive diagnostic rationales, and historical attempt analytics.
          </p>
        </div>

        <div className="static-card">
          <div className="static-card-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></svg></div>
          <h3>DOCX Word Import &amp; Rich Formatting</h3>
          <p>
            Author clinical articles effortlessly with our clinical wordpad editor supporting direct Word file ingestion and automatic formatting.
          </p>
        </div>

        <div className="static-card">
          <div className="static-card-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="7" width="16" height="13" rx="3" /><path d="M12 3v4M8 13h.01M16 13h.01M9 17h6" /></svg></div>
          <h3>Floating Clinical AI Assistant</h3>
          <p>
            Get quick reference prompts for ECG pearls, acid-base evaluation, and Sepsis-3 diagnostic algorithms directly on any screen.
          </p>
        </div>

        <div className="static-card">
          <div className="static-card-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 20 6v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3Z" /><path d="m8 12 2.5 2.5L16 9" /></svg></div>
          <h3>Row-Level Security (RLS)</h3>
          <p>
            PostgreSQL security policies guarantee authenticated clinical governance and protect user assessment records while providing open public access.
          </p>
        </div>

        <div className="static-card">
          <div className="static-card-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="2" /><path d="M10 18h4" /></svg></div>
          <h3>Responsive Touch &amp; Mobile Experience</h3>
          <p>
            Fluid navigation drawers, touch-optimized sidebars, and adaptive layouts make clinical study seamless on phones, tablets, and desktop workstations.
          </p>
        </div>
      </div>
    </div>
  );
};
