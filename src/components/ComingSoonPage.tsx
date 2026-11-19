import React from 'react';
import './ComingSoonPage.css';

export interface ComingSoonPageProps {
  type: '3d-atlas' | 'info-hub';
  onNavigateHome: () => void;
  onNavigateToArticles?: () => void;
  onNavigateToQuizzes?: () => void;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
  type,
  onNavigateHome,
  onNavigateToArticles,
  onNavigateToQuizzes,
}) => {
  const isAtlas = type === '3d-atlas';

  const config = isAtlas
    ? {
        badge: 'Locked · Arriving in Release 2.0',
        title: 'Interactive 3D Human Body Atlas',
        description:
          'Our cutting-edge real-time 3D anatomical visualization engine is undergoing final clinical accuracy verification and performance calibration. It will unlock in our upcoming platform release.',
        features: [
          {
            status: 'Ready',
            title: '147+ Segmented Structures',
            desc: 'Individually isolatable organs, vasculature, nerves, and musculoskeletal layers.',
          },
          {
            status: 'Validated',
            title: 'Male & Female References',
            desc: 'Dual full-body physiological models with accurate organ geometry and dimorphic features.',
          },
          {
            status: 'Beta',
            title: 'Clinical Overlays & Quizzes',
            desc: 'Direct integration with high-yield USMLE pearls, surgery angles, and pathology notes.',
          },
        ],
      }
    : {
        badge: 'Locked · Launching in Next Release',
        title: 'Daily Clinical Intelligence Hub',
        description:
          'MedCore’s syndicated medical intelligence service is in final automated testing with global and Sri Lankan health agency feeds. Full public access unlocks in our next scheduled platform update.',
        features: [
          {
            status: 'Connected',
            title: 'Sri Lanka Health Alerts',
            desc: 'Automated monitoring of Ministry of Health advisories, disease outbreaks, and NMRA alerts.',
          },
          {
            status: 'Validated',
            title: 'Worldwide Journal Feeds',
            desc: 'Curated clinical practice changes from NEJM, The Lancet, JAMA, and WHO guidelines.',
          },
          {
            status: 'In Test',
            title: 'Clinical Briefing Digest',
            desc: 'Morning summaries distilling complex multi-centre trials for fast student & doctor review.',
          },
        ],
      };

  return (
    <div className="coming-soon-wrapper">
      <div className="coming-soon-bg-orb coming-soon-orb-1" />
      <div className="coming-soon-bg-orb coming-soon-orb-2" />

      <div className="coming-soon-card">
        {/* Release Lock Badge */}
        <div className="coming-soon-badge-row">
          <div className="coming-soon-badge">
            <span className="coming-soon-pulse-dot" />
            <span>{config.badge}</span>
          </div>
        </div>

        {/* BIG PROMINENT COMING SOON DISPLAY */}
        <div className="coming-soon-big-title">COMING SOON</div>

        {/* Feature Subheading */}
        <h2 className="coming-soon-feature-title">{config.title}</h2>

        {/* Feature Overview Description */}
        <p className="coming-soon-description">{config.description}</p>

        {/* Preview Cards Grid */}
        <div className="coming-soon-preview-grid">
          {config.features.map((f, i) => (
            <div key={i} className="coming-soon-preview-item">
              <div className="coming-soon-preview-header">
                <div className="coming-soon-preview-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="coming-soon-status-badge">{f.status}</span>
              </div>
              <h3 className="coming-soon-preview-title">{f.title}</h3>
              <p className="coming-soon-preview-desc">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="coming-soon-actions">
          <button type="button" className="cs-btn-primary" onClick={onNavigateHome}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Return to MedCore Home
          </button>

          {onNavigateToArticles && (
            <button type="button" className="cs-btn-secondary" onClick={onNavigateToArticles}>
              Explore Clinical Library
            </button>
          )}

          {onNavigateToQuizzes && (
            <button type="button" className="cs-btn-secondary" onClick={onNavigateToQuizzes}>
              Take Quizzes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
