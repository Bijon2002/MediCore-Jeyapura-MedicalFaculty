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
        description="Discover MediCore platform features: high-yield interactive medical quizzes, peer-reviewed clinical articles, DOCX file import, instant avatar sync, and floating AI assistant."
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
          <div className="static-card-icon">⚡</div>
          <h3>Sub-Second Content Delivery</h3>
          <p>
            Vite-powered lightweight bundling and column-level query optimization ensure instant navigation between clinical specialties and diagnostic guides.
          </p>
        </div>

        <div className="static-card">
          <div className="static-card-icon">📊</div>
          <h3>Interactive Medical Quizzes</h3>
          <p>
            Timed and untimed clinical vignettes with instant scoring, comprehensive diagnostic rationales, and historical attempt analytics.
          </p>
        </div>

        <div className="static-card">
          <div className="static-card-icon">📄</div>
          <h3>DOCX Word Import &amp; Rich Formatting</h3>
          <p>
            Author clinical articles effortlessly with our clinical wordpad editor supporting direct Word file ingestion and automatic formatting.
          </p>
        </div>

        <div className="static-card">
          <div className="static-card-icon">🤖</div>
          <h3>Floating Clinical AI Assistant</h3>
          <p>
            Get quick reference prompts for ECG pearls, acid-base evaluation, and Sepsis-3 diagnostic algorithms directly on any screen.
          </p>
        </div>

        <div className="static-card">
          <div className="static-card-icon">🛡️</div>
          <h3>Row-Level Security (RLS)</h3>
          <p>
            PostgreSQL security policies guarantee authenticated clinical governance and protect user assessment records while providing open public access.
          </p>
        </div>

        <div className="static-card">
          <div className="static-card-icon">📱</div>
          <h3>Responsive Touch &amp; Mobile Experience</h3>
          <p>
            Fluid navigation drawers, touch-optimized sidebars, and adaptive layouts make clinical study seamless on phones, tablets, and desktop workstations.
          </p>
        </div>
      </div>
    </div>
  );
};
