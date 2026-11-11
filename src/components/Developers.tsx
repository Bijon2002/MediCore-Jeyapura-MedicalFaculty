import React from 'react';
import { SEOHead } from './seo/SEOHead';
import './Developers.css';

export interface DevelopersProps {
  onSelectDeveloper?: (slug: string) => void;
  onNavigateHome?: () => void;
}

export const Developers: React.FC<DevelopersProps> = ({ onSelectDeveloper }) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'MediCore Development Team',
    description: 'The software engineers behind the MediCore open-access medical education platform.',
    mainEntity: [
      {
        '@type': 'Person',
        name: 'Bijosilin Marisilin',
        jobTitle: 'Software Developer & Co-creator',
        sameAs: [
          'https://bijonn.pages.dev/',
          'https://github.com/Bijon2002',
          'https://linkedin.com/in/marisilin-bijosilin',
        ],
      },
      {
        '@type': 'Person',
        name: 'Puvanenthira Mathushan',
        jobTitle: 'Software Developer & Co-creator',
      },
    ],
  };

  return (
    <div className="developers-page">
      <SEOHead
        title="MediCore Development Team"
        description="Meet the software engineering team behind MediCore, an open-access medical education platform created with modern web technologies."
        canonicalPath="/developers"
        structuredData={structuredData}
      />

      <div className="developers-hero">
        <div className="dev-tag-pill">ENGINEERING &amp; ARCHITECTURE</div>
        <h1 className="developers-title">The Engineers Behind MediCore</h1>
        <p className="developers-subtitle">
          MediCore was conceived and built with modern full-stack web technologies to democratize high-yield clinical resources for medical students and clinicians worldwide.
        </p>
      </div>

      <div className="developers-grid">
        {/* Bijosilin Marisilin Card */}
        <div className="developer-card">
          <div className="developer-badge">Co-Creator &amp; Lead Engineer</div>
          <div className="developer-avatar-wrapper">
            <div className="developer-avatar-initials">BM</div>
          </div>
          <h2 className="developer-name">Bijosilin Marisilin</h2>
          <p className="developer-role">Software Developer · Full-Stack &amp; Product Architecture</p>
          <p className="developer-bio">
            Co-creator of MediCore. Specialized in modern React architectures, TypeScript ecosystem, scalable database design with Supabase, and clinical knowledge delivery systems.
          </p>
          <div className="developer-links">
            <a href="https://bijonn.pages.dev/" target="_blank" rel="noopener noreferrer" className="dev-btn portfolio">
              Portfolio
            </a>
            <a href="https://github.com/Bijon2002" target="_blank" rel="noopener noreferrer" className="dev-btn github">
              GitHub
            </a>
            <a href="https://linkedin.com/in/marisilin-bijosilin" target="_blank" rel="noopener noreferrer" className="dev-btn linkedin">
              LinkedIn
            </a>
          </div>
          {onSelectDeveloper && (
            <button
              type="button"
              className="dev-view-profile-btn"
              onClick={() => onSelectDeveloper('bijosilin-marisilin')}
            >
              View Full Profile →
            </button>
          )}
        </div>

        {/* Puvanenthira Mathushan Card */}
        <div className="developer-card">
          <div className="developer-badge">Co-Creator &amp; Software Developer</div>
          <div className="developer-avatar-wrapper">
            <div className="developer-avatar-initials alt">PM</div>
          </div>
          <h2 className="developer-name">Puvanenthira Mathushan</h2>
          <p className="developer-role">Software Developer · Backend Systems &amp; Education Tools</p>
          <p className="developer-bio">
            Co-creator of MediCore. Focused on backend engineering, interactive medical assessment logic, clinical workflow automation, and educational UX patterns.
          </p>
          <div className="developer-links">
            <span className="dev-badge-tech">React 19</span>
            <span className="dev-badge-tech">TypeScript</span>
            <span className="dev-badge-tech">Supabase</span>
            <span className="dev-badge-tech">Vite</span>
          </div>
          {onSelectDeveloper && (
            <button
              type="button"
              className="dev-view-profile-btn"
              onClick={() => onSelectDeveloper('puvanenthira-mathushan')}
            >
              View Full Profile →
            </button>
          )}
        </div>
      </div>

      <div className="institutional-origin-strip">
        <div className="origin-icon">🎓</div>
        <div className="origin-text">
          <h3>Academic &amp; Institutional Origin</h3>
          <p>
            MediCore is a medical education project created by students of the <strong>Faculty of Medical Sciences, University of Sri Jayewardenepura, Sri Lanka</strong>. MediCore is developed independently as an open-access academic initiative to support medical education internationally.
          </p>
        </div>
      </div>
    </div>
  );
};
