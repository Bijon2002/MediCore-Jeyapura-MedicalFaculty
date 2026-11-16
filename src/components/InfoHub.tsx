import React, { useState, useMemo } from 'react';
import { SEOHead } from './seo/SEOHead';
import { useMedicalNews, type MedicalNewsItem } from '../hooks/useMedicalNews';
import './InfoHub.css';

export interface InfoHubProps {
  onNavigateHome: () => void;
}

const fallbackImages = [
  '/images/medical-hero-1.jpg',
  '/images/cardio-heart.jpg',
  '/images/emergency-care.jpg',
  '/images/neuro-brain.jpg',
  '/images/thorax-anatomy.jpg',
  '/images/medical-hero-2.jpg',
  '/images/medical-hero-3.jpg',
  '/images/medical-hero-4.jpg',
];

const NewsCard: React.FC<{
  item: MedicalNewsItem;
  index: number;
  onSelect: (item: MedicalNewsItem) => void;
}> = ({ item, index, onSelect }) => {
  const fallbackImage = fallbackImages[index % fallbackImages.length];

  return (
    <article
      className="info-news-card info-news-card-button"
      onClick={() => onSelect(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(item);
        }
      }}
      aria-label={`Read ${item.headline}`}
    >
      <div className="info-news-card-media">
        <img
          src={item.imageUrl || fallbackImage}
          alt=""
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = fallbackImage;
          }}
        />
        <span className="info-news-region-badge">
          {item.region === 'sri-lanka' ? '🇱🇰 Sri Lanka' : '🌐 Global'}
        </span>
      </div>

      <div className="info-news-card-body">
        <div className="info-news-card-meta">
          <span className="info-news-source">{item.source}</span>
          <time className="info-news-time">{item.time || 'Today'}</time>
        </div>

        {item.category && (
          <span className="info-news-category-tag">{item.category}</span>
        )}

        <h3 className="info-news-headline">{item.headline}</h3>

        {item.description && (
          <p className="info-news-desc">{item.description}</p>
        )}

        <div className="info-news-card-link">
          Read briefing <span aria-hidden="true">→</span>
        </div>
      </div>
    </article>
  );
};

export const InfoHub: React.FC<InfoHubProps> = ({ onNavigateHome }) => {
  const { news, sriLankaNews, loading } = useMedicalNews();
  const [selectedNews, setSelectedNews] = useState<MedicalNewsItem | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'worldwide' | 'sri-lanka'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSources, setShowSources] = useState(false);

  // Filter combined news by active tab and search query
  const filteredItems = useMemo(() => {
    let pool: MedicalNewsItem[] = [];
    if (activeTab === 'all') {
      pool = [...sriLankaNews, ...news];
    } else if (activeTab === 'sri-lanka') {
      pool = sriLankaNews;
    } else {
      pool = news;
    }

    if (!searchQuery.trim()) return pool;
    const q = searchQuery.toLowerCase().trim();
    return pool.filter(
      (item) =>
        item.headline.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q))
    );
  }, [news, sriLankaNews, activeTab, searchQuery]);

  return (
    <div className="info-hub-page">
      <SEOHead
        title="Clinical Intelligence & Medical News | MedCore Information Hub"
        description="Daily worldwide and Sri Lankan medical news, clinical trial updates, and public health intelligence curated for medical learners and clinicians."
        canonicalPath="/info-hub"
      />

      {/* HERO SECTION */}
      <section className="info-hub-hero">
        <div className="info-hub-hero-glow" aria-hidden="true" />
        <div className="info-hub-container">
          <button type="button" className="info-hub-back-btn" onClick={onNavigateHome}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to MedCore
          </button>

          <div className="info-hub-eyebrow">
            <span>Daily Clinical Intelligence</span>
          </div>

          <h1>
            MedCore <span>Information Hub</span>
          </h1>
          <p>
            One clear, evidence-focused view of the medical stories and clinical developments
            shaping healthcare across Sri Lanka and worldwide.
          </p>

          <div className="info-hub-hero-bar">
            <div className="info-hub-update-note">
              <span className="info-live-dot" aria-hidden="true" />
              <span>Updated daily · Continuous clinical feed</span>
            </div>

            <div className="info-hub-quick-stats">
              <div className="info-stat-pill">
                <strong>{news.length}</strong> Worldwide Stories
              </div>
              <div className="info-stat-pill">
                <strong>{sriLankaNews.length}</strong> Sri Lanka Updates
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER & SEARCH BAR */}
      <div className="info-hub-filter-bar">
        <div className="info-hub-container info-hub-filter-inner">
          <div className="info-hub-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'all'}
              className={`info-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Updates ({sriLankaNews.length + news.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'sri-lanka'}
              className={`info-tab-btn ${activeTab === 'sri-lanka' ? 'active' : ''}`}
              onClick={() => setActiveTab('sri-lanka')}
            >
              🇱🇰 Sri Lanka ({sriLankaNews.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'worldwide'}
              className={`info-tab-btn ${activeTab === 'worldwide' ? 'active' : ''}`}
              onClick={() => setActiveTab('worldwide')}
            >
              🌐 Worldwide ({news.length})
            </button>
          </div>

          <div className="info-search-wrapper">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Search medical updates, topics, or journals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="info-search-input"
              aria-label="Search medical updates"
            />
            {searchQuery && (
              <button
                type="button"
                className="info-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="info-hub-container info-hub-main">
        {loading && (
          <div className="info-news-grid info-news-skeleton-grid">
            {[1, 2, 3, 4, 5, 6].map((k) => (
              <div key={k} className="info-news-skeleton" />
            ))}
          </div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="info-no-results">
            <div className="info-no-results-icon">🔍</div>
            <h3>No medical stories matched &ldquo;{searchQuery}&rdquo;</h3>
            <p>Try searching for diabetes, cardiology, surgery, WHO, or Sri Lanka.</p>
            <button
              type="button"
              className="info-reset-btn"
              onClick={() => {
                setSearchQuery('');
                setActiveTab('all');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}

        {!loading && filteredItems.length > 0 && (
          <>
            {activeTab === 'all' && !searchQuery ? (
              <>
                {/* 1. SRI LANKA SPOTLIGHT */}
                <section className="info-news-section sri-lanka-news-section">
                  <div className="info-section-heading">
                    <div>
                      <span className="info-section-kicker sri-lanka-kicker">🇱🇰 Regional Focus</span>
                      <h2>Sri Lanka Local Medical Updates</h2>
                    </div>
                    <p>
                      Healthcare developments, public health advisories, and clinical news from Sri Lanka.
                    </p>
                  </div>
                  <div className="info-news-grid">
                    {sriLankaNews.map((item, index) => (
                      <NewsCard
                        key={`sl-${item.id}`}
                        item={item}
                        index={index}
                        onSelect={setSelectedNews}
                      />
                    ))}
                  </div>
                </section>

                {/* 2. WORLDWIDE MEDICAL NEWS */}
                <section className="info-news-section">
                  <div className="info-section-heading">
                    <div>
                      <span className="info-section-kicker">🌐 International Dispatch</span>
                      <h2>Today&apos;s Worldwide Medical News</h2>
                    </div>
                    <p>
                      Peer-reviewed breakthroughs, clinical guideline changes, and health policy updates.
                    </p>
                  </div>
                  <div className="info-news-grid">
                    {news.map((item, index) => (
                      <NewsCard
                        key={`ww-${item.id}`}
                        item={item}
                        index={index}
                        onSelect={setSelectedNews}
                      />
                    ))}
                  </div>
                </section>
              </>
            ) : (
              <section className="info-news-section">
                <div className="info-section-heading">
                  <div>
                    <span className="info-section-kicker">
                      {activeTab === 'sri-lanka' ? '🇱🇰 Sri Lanka Focus' : '🌐 Worldwide Focus'}
                    </span>
                    <h2>
                      {searchQuery
                        ? `Search Results (${filteredItems.length})`
                        : activeTab === 'sri-lanka'
                        ? 'Sri Lanka Medical Updates'
                        : 'Worldwide Medical News'}
                    </h2>
                  </div>
                  <p>Displaying {filteredItems.length} curated clinical news briefing(s).</p>
                </div>
                <div className="info-news-grid">
                  {filteredItems.map((item, index) => (
                    <NewsCard
                      key={item.id}
                      item={item}
                      index={index}
                      onSelect={setSelectedNews}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* DETAILS SECTION: Collapsible toggle to keep the page clean */}
        <section className="info-sources-wrapper">
          <button
            type="button"
            className="info-sources-toggle-btn"
            onClick={() => setShowSources((prev) => !prev)}
            aria-expanded={showSources}
          >
            <span>Trusted Medical Sources &amp; Syndication Partners</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              style={{ transform: showSources ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {showSources && (
            <div className="info-sources-section">
              <div className="info-sources-grid">
                <div className="info-source-group">
                  <h3>Sri Lankan Medical News Sources</h3>
                  <a href="https://health.gov.lk/" target="_blank" rel="noopener noreferrer">
                    Sri Lanka Ministry of Health <span>↗</span>
                  </a>
                  <a href="https://www.newsfirst.lk/" target="_blank" rel="noopener noreferrer">
                    NewsFirst Medical <span>↗</span>
                  </a>
                  <a href="https://www.adaderana.lk/" target="_blank" rel="noopener noreferrer">
                    Ada Derana Health <span>↗</span>
                  </a>
                  <a href="https://www.dailymirror.lk/" target="_blank" rel="noopener noreferrer">
                    Daily Mirror Health <span>↗</span>
                  </a>
                </div>
                <div className="info-source-group">
                  <h3>International Clinical Journals &amp; Portals</h3>
                  <a href="https://www.who.int/rss-feeds/news-english.xml" target="_blank" rel="noopener noreferrer">
                    WHO News &amp; Advisories <span>↗</span>
                  </a>
                  <a href="https://www.who.int/api/news/diseaseoutbreaknews" target="_blank" rel="noopener noreferrer">
                    WHO Disease Outbreak News <span>↗</span>
                  </a>
                  <a href="https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=medical&retmode=json" target="_blank" rel="noopener noreferrer">
                    PubMed Biomedical Search <span>↗</span>
                  </a>
                  <a href="https://news.google.com/rss/search?q=medical+health+news&hl=en&gl=US&ceid=US:en" target="_blank" rel="noopener noreferrer">
                    Google Health &amp; Medical RSS <span>↗</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* FULL ARTICLE MODAL READER */}
      {selectedNews && (
        <div
          className="info-news-reader-backdrop"
          role="presentation"
          onClick={() => setSelectedNews(null)}
        >
          <article
            className="info-news-reader"
            role="dialog"
            aria-modal="true"
            aria-labelledby="news-reader-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="info-news-reader-close"
              onClick={() => setSelectedNews(null)}
              aria-label="Close article"
            >
              ×
            </button>
            <img src={selectedNews.imageUrl || fallbackImages[0]} alt="" />
            <div className="info-news-reader-body">
              <div className="info-news-card-meta">
                <span className="info-news-source">{selectedNews.source}</span>
                <time className="info-news-time">{selectedNews.time || 'Today'}</time>
              </div>

              {selectedNews.category && (
                <span className="info-news-category-tag" style={{ display: 'inline-block', marginBottom: '8px' }}>
                  {selectedNews.category}
                </span>
              )}

              <h2 id="news-reader-title">{selectedNews.headline}</h2>
              <p>
                {selectedNews.content ||
                  selectedNews.description ||
                  'Open the original publisher for the complete article.'}
              </p>

              {selectedNews.url && (
                <a
                  className="info-news-reader-source"
                  href={selectedNews.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read original publisher article <span aria-hidden="true">→</span>
                </a>
              )}
            </div>
          </article>
        </div>
      )}
    </div>
  );
};
