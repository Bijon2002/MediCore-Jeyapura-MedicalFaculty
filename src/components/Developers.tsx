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
    name: 'medcore Development Team',
    description: 'The software engineers behind the medcore open-access medical education platform.',
    mainEntity: [
      {
        '@type': 'Person',
        name: 'Bijosilin',
        jobTitle: 'Software Developer & Co-creator',
        sameAs: [
          'https://bijonn.pages.dev/',
          'https://github.com/Bijon2002',
          'https://linkedin.com/in/marisilin-bijosilin',
        ],
      },
      {
        '@type': 'Person',
        name: 'Mathusan',
        jobTitle: 'Software Developer & Co-creator',
      },
    ],
  };

  return (
    <div className="developers-page">
      <SEOHead
        title="medcore Development Team"
        description="Meet the software engineering team behind medcore, an open-access medical education platform created with modern web technologies."
        canonicalPath="/developers"
        structuredData={structuredData}
      />

      <div className="developers-hero">
        <div className="dev-tag-pill">ENGINEERING &amp; ARCHITECTURE</div>
        <h1 className="developers-title">The Engineers Behind medcore</h1>
        <p className="developers-subtitle">
          medcore was conceived and built with modern full-stack web technologies to democratize high-yield clinical resources for medical students and clinicians worldwide.
        </p>
      </div>

      <div className="developers-grid">
        {/* Bijosilin Card */}
        <div className="developer-card">
          <div className="developer-badge">Co-Creator &amp; Lead Engineer</div>
          <div className="developer-avatar-wrapper">
            <img className="developer-avatar" src="/Developers/bijon.png" alt="Bijosilin" />
          </div>
          <h2 className="developer-name">Bijosilin</h2>
          <p className="developer-role">Software Developer · Full-Stack &amp; Product Architecture</p>
          <p className="developer-bio">
            Co-creator of medcore. Specialized in modern React architectures, TypeScript ecosystem, scalable database design with Supabase, and clinical knowledge delivery systems.
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

        {/* Mathusan Card */}
        <div className="developer-card">
          <div className="developer-badge">Co-Creator &amp; Software Developer</div>
          <div className="developer-avatar-wrapper">
            <img className="developer-avatar alt" src="/Developers/mathu.jpeg" alt="Mathusan" />
          </div>
          <h2 className="developer-name">Mathusan</h2>
          <p className="developer-role">Software Developer · Backend Systems &amp; Education Tools</p>
          <p className="developer-bio">
            Co-creator of medcore. Focused on backend engineering, interactive medical assessment logic, clinical workflow automation, and educational UX patterns.
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
        <div className="origin-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m3 9 9-5 9 5-9 5-9-5Z" /><path d="M7 11v5c3 2 7 2 10 0v-5M21 9v6" /></svg></div>
        <div className="origin-text">
          <h3>Academic &amp; Institutional Origin</h3>
          <p>
            medcore is a medical education project created by students of the <strong>Faculty of Medical Sciences, University of Sri Jayewardenepura, Sri Lanka</strong>. medcore is developed independently as an open-access academic initiative to support medical education internationally.
          </p>
        </div>
      </div>
    </div>
  );
};
