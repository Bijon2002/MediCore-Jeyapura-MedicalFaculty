import React from 'react';
import { SEOHead } from './seo/SEOHead';
import { useMedicalNews, type MedicalNewsItem } from '../hooks/useMedicalNews';
import './InfoHub.css';

export interface InfoHubProps {
  onNavigateHome: () => void;
}

const NewsCard: React.FC<{ item: MedicalNewsItem }> = ({ item }) => {
  const content = (
    <>
      <div className="info-news-card-meta">
        <span>{item.source}</span>
        <time>{item.time || 'Today'}</time>
      </div>
      <h3>{item.headline}</h3>
      {item.description && <p>{item.description}</p>}
      {item.url && <span className="info-news-card-link">Read source <span aria-hidden="true">→</span></span>}
    </>
  );

  return item.url ? (
    <a className="info-news-card" href={item.url} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  ) : (
    <article className="info-news-card">{content}</article>
  );
};

export const InfoHub: React.FC<InfoHubProps> = ({ onNavigateHome }) => {
  const { news, sriLankaNews, loading } = useMedicalNews();

  return (
    <div className="info-hub-page">
      <SEOHead
        title="Today's Medical News | MedCore Information Hub"
        description="Daily worldwide and Sri Lankan medical news, research updates, and public health information curated for healthcare learners."
        canonicalPath="/info-hub"
      />

      <section className="info-hub-hero">
        <div className="info-hub-hero-glow" aria-hidden="true" />
        <div className="info-hub-container">
          <button type="button" className="info-hub-back-btn" onClick={onNavigateHome}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to MedCore
          </button>
          <span className="info-hub-eyebrow">Daily clinical intelligence</span>
          <h1>Information Hub</h1>
          <p>One clear view of the medical stories shaping conversations around the world and in Sri Lanka.</p>
          <div className="info-hub-update-note">
            <span className="info-live-dot" aria-hidden="true" />
            Updated daily · Stories refresh automatically every 24 hours
          </div>
        </div>
      </section>

      <main className="info-hub-container info-hub-main">
        <section className="info-news-section">
          <div className="info-section-heading">
            <div>
              <span className="info-section-kicker">Worldwide</span>
              <h2>Today&apos;s Medical News</h2>
            </div>
            <p>Top health, research, and clinical updates from trusted sources.</p>
          </div>
          {loading && <div className="info-news-grid info-news-skeleton-grid">{[1, 2, 3].map((item) => <div key={item} className="info-news-skeleton" />)}</div>}
          {!loading && (
            <div className="info-news-grid">
              {news.slice(0, 8).map((item) => <NewsCard key={item.id} item={item} />)}
            </div>
          )}
        </section>

        <section className="info-news-section sri-lanka-news-section">
          <div className="info-section-heading">
            <div>
              <span className="info-section-kicker sri-lanka-kicker">Sri Lanka</span>
              <h2>Local Medical Updates</h2>
            </div>
            <p>Regional health information and medical developments relevant to Sri Lankan learners and clinicians.</p>
          </div>
          <div className="info-news-grid">
            {(sriLankaNews.length > 0 ? sriLankaNews : news.slice(0, 4)).map((item) => (
              <NewsCard key={`lk-${item.id}`} item={{ ...item, region: 'sri-lanka' }} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
