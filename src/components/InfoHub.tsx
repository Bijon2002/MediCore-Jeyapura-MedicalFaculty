import React from 'react';
import { SEOHead } from './seo/SEOHead';
import { useMedicalNews, type MedicalNewsItem } from '../hooks/useMedicalNews';
import './InfoHub.css';

export interface InfoHubProps {
  onNavigateHome: () => void;
}

const fallbackImages = [
  '/images/cardio-heart.jpg',
  '/images/neuro-brain.jpg',
  '/images/emergency-care.jpg',
  '/images/thorax-anatomy.jpg',
  '/images/medical-hero-2.jpg',
];

const NewsCard: React.FC<{ item: MedicalNewsItem; index: number; onSelect: (item: MedicalNewsItem) => void }> = ({ item, index, onSelect }) => {
  const fallbackImage = fallbackImages[index % fallbackImages.length];
  const content = (
    <>
      <div className="info-news-card-media">
        <img
          src={item.imageUrl || fallbackImage}
          alt=""
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = fallbackImage;
          }}
        />
      </div>
      <div className="info-news-card-meta">
        <span>{item.source}</span>
        <time>{item.time || 'Today'}</time>
      </div>
      <h3>{item.headline}</h3>
      {item.description && <p>{item.description}</p>}
      <span className="info-news-card-link">Read article <span aria-hidden="true">→</span></span>
    </>
  );

  return (
    <button type="button" className="info-news-card info-news-card-button" onClick={() => onSelect(item)} aria-label={`Read ${item.headline}`}>
      {content}
    </button>
  );
};

export const InfoHub: React.FC<InfoHubProps> = ({ onNavigateHome }) => {
  const { news, sriLankaNews, loading, error } = useMedicalNews();
  const [selectedNews, setSelectedNews] = React.useState<MedicalNewsItem | null>(null);

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
          {error && <p className="info-news-status" role="status">{error}</p>}
          {loading && <div className="info-news-grid info-news-skeleton-grid">{[1, 2, 3].map((item) => <div key={item} className="info-news-skeleton" />)}</div>}
          {!loading && (
            <div className="info-news-grid">
              {news.slice(0, 8).map((item, index) => <NewsCard key={item.id} item={item} index={index} onSelect={setSelectedNews} />)}
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
            {(sriLankaNews.length > 0 ? sriLankaNews : news.slice(0, 4)).map((item, index) => (
              <NewsCard key={`lk-${item.id}`} item={{ ...item, region: 'sri-lanka' }} index={index} onSelect={setSelectedNews} />
            ))}
          </div>
        </section>

        <section className="info-sources-section">
          <div className="info-section-heading">
            <div>
              <span className="info-section-kicker">Trusted starting points</span>
              <h2>Medical News Sources</h2>
            </div>
            <p>Use the original publishers for full context. MedCore links out rather than reproducing source articles.</p>
          </div>
          <div className="info-sources-grid">
            <div className="info-source-group">
              <h3>Sri Lankan medical news</h3>
              <a href="https://health.gov.lk/" target="_blank" rel="noopener noreferrer">Sri Lanka Ministry of Health <span aria-hidden="true">↗</span></a>
              <a href="https://www.newsfirst.lk/" target="_blank" rel="noopener noreferrer">NewsFirst <span aria-hidden="true">↗</span></a>
              <a href="https://www.adaderana.lk/" target="_blank" rel="noopener noreferrer">Ada Derana <span aria-hidden="true">↗</span></a>
              <a href="https://www.dailymirror.lk/" target="_blank" rel="noopener noreferrer">Daily Mirror <span aria-hidden="true">↗</span></a>
            </div>
            <div className="info-source-group">
              <h3>International medical news</h3>
              <a href="https://www.who.int/rss-feeds/news-english.xml" target="_blank" rel="noopener noreferrer">WHO News RSS <span aria-hidden="true">↗</span></a>
              <a href="https://www.who.int/api/news/diseaseoutbreaknews" target="_blank" rel="noopener noreferrer">WHO Disease Outbreak News <span aria-hidden="true">↗</span></a>
              <a href="https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=medical&retmode=json" target="_blank" rel="noopener noreferrer">PubMed medical research <span aria-hidden="true">↗</span></a>
              <a href="https://news.google.com/rss/search?q=medical+health+news&hl=en&gl=US&ceid=US:en" target="_blank" rel="noopener noreferrer">Google News medical RSS <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </section>
      </main>

      {selectedNews && (
        <div className="info-news-reader-backdrop" role="presentation" onClick={() => setSelectedNews(null)}>
          <article className="info-news-reader" role="dialog" aria-modal="true" aria-labelledby="news-reader-title" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="info-news-reader-close" onClick={() => setSelectedNews(null)} aria-label="Close article">×</button>
            <img src={selectedNews.imageUrl || fallbackImages[0]} alt="" />
            <div className="info-news-reader-body">
              <div className="info-news-card-meta">
                <span>{selectedNews.source}</span>
                <time>{selectedNews.time || 'Today'}</time>
              </div>
              <h2 id="news-reader-title">{selectedNews.headline}</h2>
              <p>{selectedNews.content || selectedNews.description || 'Open the original publisher for the complete article.'}</p>
              {selectedNews.url && (
                <a className="info-news-reader-source" href={selectedNews.url} target="_blank" rel="noopener noreferrer">
                  Read original article <span aria-hidden="true">→</span>
                </a>
              )}
            </div>
          </article>
        </div>
      )}
    </div>
  );
};
