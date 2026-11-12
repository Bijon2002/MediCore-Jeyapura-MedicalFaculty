import React from 'react';
import { SEOHead } from './seo/SEOHead';
import './Developers.css';

export interface DeveloperDetailProps {
  slug: string;
  onBackToDevelopers: () => void;
}

export const DeveloperDetail: React.FC<DeveloperDetailProps> = ({ slug, onBackToDevelopers }) => {
  const isBijosilin = slug === 'bijosilin-marisilin';

  const developerData = isBijosilin
    ? {
        name: 'Bijosilin',
        title: 'Software Developer & Co-creator of medcore',
        initials: 'BM',
        colorClass: '',
        metaDesc:
          'Explore the technical contributions, architecture work, and profile of Bijosilin, software developer and co-creator of medcore medical platform.',
        portfolio: 'https://bijonn.pages.dev/',
        github: 'https://github.com/Bijon2002',
        linkedin: 'https://linkedin.com/in/marisilin-bijosilin',
        roleDescription:
          'Bijosilin is a software developer responsible for frontend architecture, state synchronization, database integration, and UI design systems for medcore.',
        contributions: [
          'Engineered responsive React 19 frontend architecture using Vite and TypeScript.',
          'Integrated Supabase PostgreSQL database schemas with Row Level Security (RLS) policies.',
          'Designed clinical workspace navigation with dedicated Admin, Reviewer, and Student dashboards.',
          'Developed rich-text medical article authoring system with live image uploads and docx parser.',
          'Configured global technical SEO architecture, XML sitemaps, JSON-LD schemas, and Cloudflare Pages deployment.',
        ],
        technologies: ['React 19', 'TypeScript', 'Vite', 'Supabase', 'PostgreSQL', 'Cloudflare Pages', 'HTML5 / CSS3', 'Git'],
      }
    : {
        name: 'Mathusan',
        title: 'Software Developer & Co-creator of medcore',
        initials: 'PM',
        colorClass: 'alt',
        metaDesc:
          'Explore the contributions and engineering background of Mathusan, software developer and co-creator of the medcore medical education platform.',
        portfolio: null,
        github: null,
        linkedin: null,
        roleDescription:
          'Puvanenthira is a software developer focused on medical question banks, assessment logic, scoring algorithms, and content management workflows.',
        contributions: [
          'Co-architected interactive medical question bank and instant assessment grading engine.',
          'Contributed to database schema design for quizzes, questions, options, and student attempts.',
          'Built topic-based categorization system aligning clinical articles with medical specialties.',
          'Engineered review workflows for faculty medical review applications and peer assessments.',
        ],
        technologies: ['React', 'TypeScript', 'Vite', 'PostgreSQL', 'Supabase Auth', 'Algorithmic Logic'],
      };

  const personStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: developerData.name,
    jobTitle: developerData.title,
    worksFor: {
      '@type': 'Organization',
      name: 'medcore',
      url: 'https://medcore.lk',
    },
    ...(developerData.portfolio || developerData.github || developerData.linkedin
      ? {
          sameAs: [developerData.portfolio, developerData.github, developerData.linkedin].filter(Boolean),
        }
      : {}),
  };

  return (
    <div className="developers-page">
      <SEOHead
        title={`${developerData.name} | Software Developer`}
        description={developerData.metaDesc}
        canonicalPath={`/developers/${slug}`}
        ogType="profile"
        structuredData={personStructuredData}
      />

      <button type="button" className="dev-back-btn" onClick={onBackToDevelopers}>
        ← Back to All Developers
      </button>

      <div className="developer-profile-header">
        <img
          className={`developer-avatar large ${developerData.colorClass}`}
          src={isBijosilin ? '/Developers/bijon.png' : '/Developers/mathu.jpeg'}
          alt={developerData.name}
        />
        <div className="profile-header-meta">
          <div className="dev-tag-pill">VERIFIED DEVELOPER</div>
          <h1 className="profile-dev-name">{developerData.name}</h1>
          <p className="profile-dev-title">{developerData.title}</p>
          <div className="profile-links-row">
            {developerData.portfolio && (
              <a href={developerData.portfolio} target="_blank" rel="noopener noreferrer" className="dev-btn portfolio">
                Personal Portfolio
              </a>
            )}
            {developerData.github && (
              <a href={developerData.github} target="_blank" rel="noopener noreferrer" className="dev-btn github">
                GitHub Profile
              </a>
            )}
            {developerData.linkedin && (
              <a href={developerData.linkedin} target="_blank" rel="noopener noreferrer" className="dev-btn linkedin">
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="profile-content-section">
        <h2>About the Developer</h2>
        <p className="profile-bio-text">{developerData.roleDescription}</p>

        <h2>Key Project Contributions to medcore</h2>
        <ul className="profile-contributions-list">
          {developerData.contributions.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>

        <h2>Technology Stack &amp; Skills</h2>
        <div className="profile-tech-grid">
          {developerData.technologies.map((tech, idx) => (
            <span key={idx} className="dev-badge-tech large">
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="institutional-origin-strip" style={{ marginTop: '50px' }}>
        <div className="origin-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 21h18M5 18V9h14v9M3 9l9-6 9 6M8 18v-5M12 18v-5M16 18v-5" /></svg></div>
        <div className="origin-text">
          <h3>Faculty &amp; Academic Heritage</h3>
          <p>
            Developed by students at the <strong>Faculty of Medical Sciences, University of Sri Jayewardenepura, Sri Lanka</strong> to support open-access medical learning for peers globally.
          </p>
        </div>
      </div>
    </div>
  );
};
