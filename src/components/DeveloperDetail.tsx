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
        name: 'Bijosilin Marisilin (Bijon)',
        title: 'Software Engineer | Full-Stack Developer | AI Developer',
        pronouns: null,
        initials: 'BM',
        colorClass: '',
        metaDesc:
          'Bijosilin Marisilin (Bijon) is a Software Engineer, Full-Stack Developer, and AI researcher who co-created MedCore (https://medcore.lk/). Discover his technical architecture, GitHub, and portfolio.',
        keywords:
          'Bijosilin Marisilin, Bijon, Bijosilin Marisilin Software Engineer, Bijon Software Engineer, Bijon Full Stack Developer, Bijosilin Marisilin Developer Sri Lanka, Bijosilin Marisilin MedCore, MedCore Developer, MedCore Software Engineer',
        portfolio: 'https://bijonn.pages.dev/',
        github: 'https://github.com/Bijon2002',
        linkedin: 'https://www.linkedin.com/in/marisilin-bijosilin/',
        location: 'Jaffna, Northern Province, Sri Lanka',
        achievement: 'ML Researcher · First Class SE Graduate',
        roleDescription:
          'Bijosilin Marisilin (known professionally as Bijon) is a Software Engineer, Full-Stack Developer, and AI researcher who co-created and architected MedCore. With extensive experience in full-stack architecture, machine learning research, and cloud infrastructure, he has built mission-critical production platforms serving five government administrative districts across Sri Lanka.',
        elaboration: [
          'At MedCore, Bijon leads the overall technical design — engineering the high-performance React 19 single-page application with TypeScript, designing the Supabase PostgreSQL database schemas with granular Row Level Security (RLS), and architecting the clinical knowledge authoring, search, and delivery pipelines.',
          'His work centers on uniting modern software reliability, medical informatics, and scalable cloud systems to provide barrier-free, academically rigorous learning resources for medical students and clinicians worldwide.',
        ],
        contributions: [
          'Engineered responsive React 19 frontend architecture using Vite and TypeScript.',
          'Integrated Supabase PostgreSQL database schemas with Row Level Security (RLS) policies.',
          'Designed clinical workspace navigation with dedicated Admin, Reviewer, and Student dashboards.',
          'Developed rich-text medical article authoring system with live image uploads and docx parser.',
          'Configured global technical SEO architecture, XML sitemaps, JSON-LD schemas, and Cloudflare Pages deployment.',
        ],
        technologies: ['React 19', 'TypeScript', 'Vite', 'Supabase', 'PostgreSQL', 'Cloudflare Pages', 'Full-Stack Architecture', 'Artificial Intelligence', 'HTML5 / CSS3', 'Git'],
      }
    : {
        name: 'Puvanenthira Mathushan',
        title: 'Software Developer & Co-creator of MedCore',
        pronouns: null,
        initials: 'PM',
        colorClass: 'alt',
        metaDesc:
          'Explore the contributions and engineering background of Puvanenthira Mathushan, software developer, CS undergraduate at SLIIT Northern University, and co-creator of the MedCore medical education platform.',
        keywords: 'Puvanenthira Mathushan, Mathushan Developer, MedCore Developer',
        portfolio: null,
        github: null,
        linkedin: 'https://www.linkedin.com/in/puvanenthira-mathushan/',
        location: 'Jaffna District, Northern Province, Sri Lanka',
        achievement: 'Undergraduate – Computer Science | SLIIT Northern Uni',
        roleDescription:
          'Puvanenthira Mathushan is the co-creator and software developer of MedCore, currently pursuing his undergraduate degree in Computer Science at SLIIT Northern University, Jaffna. He brings strong backend engineering skills and a keen focus on building practical, student-centric academic tools.',
        elaboration: [
          'Within MedCore, Mathushan focuses on backend engineering, data modelling, assessment scoring algorithms, and educational workflow automation. He co-architected the interactive clinical quiz engine, timed examination modules, and specialty categorization models that empower medical students to test diagnostic knowledge against board-style question banks.',
          'He is dedicated to optimizing full-stack applications that streamline complex medical learning into intuitive, high-yield digital experiences — bridging the gap between computer science and clinical education.',
        ],
        contributions: [
          'Co-architected interactive medical question bank and instant assessment grading engine.',
          'Contributed to database schema design for quizzes, questions, options, and student attempts.',
          'Built topic-based categorization system aligning clinical articles with medical specialties.',
          'Engineered review workflows for faculty medical review applications and peer assessments.',
          'Developed timed examination modules and specialty-based diagnostic question banks.',
        ],
        technologies: ['React', 'TypeScript', 'Vite', 'PostgreSQL', 'Supabase Auth', 'Algorithmic Logic', 'Node.js'],
      };

  const personStructuredData = isBijosilin
    ? {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Bijosilin Marisilin',
        alternateName: ['Bijon', 'Marisilin Bijosilin'],
        jobTitle: 'Software Engineer | Full-Stack Developer | AI Developer',
        description: 'Software Engineer, Full-Stack Developer, AI researcher, and co-creator of MedCore.',
        worksFor: {
          '@type': 'Organization',
          name: 'MedCore',
          url: 'https://medcore.lk',
        },
        url: 'https://bijonn.pages.dev/',
        sameAs: [
          'https://bijonn.pages.dev/',
          'https://github.com/Bijon2002',
          'https://www.linkedin.com/in/marisilin-bijosilin/',
        ],
        knowsAbout: [
          'Software Engineering',
          'Full-Stack Web Development',
          'Artificial Intelligence',
          'React 19',
          'TypeScript',
          'PostgreSQL',
          'Supabase',
          'Cloudflare Pages',
          'Medical Informatics',
        ],
        alumniOf: {
          '@type': 'EducationalOrganization',
          name: 'Software Engineering Graduate (First Class)',
        },
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: developerData.name,
        jobTitle: developerData.title,
        worksFor: {
          '@type': 'Organization',
          name: 'MedCore',
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
        title={`${developerData.name} | Software Engineer & AI Developer`}
        description={developerData.metaDesc}
        canonicalPath={`/developers/${slug}`}
        ogType="profile"
        keywords={developerData.keywords}
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
          {developerData.pronouns && (
            <span className="dev-pronouns-badge">{developerData.pronouns}</span>
          )}
          <p className="profile-dev-title">{developerData.title}</p>
          <div className="profile-chips-row">
            <span className="dev-chip location-chip">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {developerData.location}
            </span>
            <span className="dev-chip achievement-chip">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              {developerData.achievement}
            </span>
          </div>
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
        {developerData.elaboration.map((para, idx) => (
          <p key={idx} className="profile-bio-text" style={{ marginTop: '14px' }}>{para}</p>
        ))}

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
