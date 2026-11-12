import { useState, useEffect } from 'react';

export interface MedicalNewsItem {
  id: string;
  headline: string;
  source: string;
  time?: string;
  url?: string;
  description?: string;
  content?: string;
  publishedAt?: string;
  region?: 'worldwide' | 'sri-lanka';
  imageUrl?: string;
}

const FALLBACK_NEWS: MedicalNewsItem[] = [
  {
    id: 'fn-1',
    headline: '2026 ACC/AHA Valvular Heart Disease Clinical Practice Guidelines Released',
    source: 'ACC / AHA',
    time: 'Today',
    region: 'worldwide',
    imageUrl: '/images/cardio-heart.jpg',
  },
  {
    id: 'fn-2',
    headline: 'USMLE Step 1 High-Yield Clinical Reasoning & Pathology Question Bank Updated',
    source: 'MedCore Board Prep',
    time: '2h ago',
    region: 'worldwide',
    imageUrl: '/images/neuro-brain.jpg',
  },
  {
    id: 'fn-3',
    headline: 'Sepsis-3 Early Resuscitation Protocols Aligned with Surviving Sepsis Campaign Guidelines',
    source: 'Critical Care Med',
    time: '3h ago',
    region: 'worldwide',
    imageUrl: '/images/emergency-care.jpg',
  },
  {
    id: 'fn-4',
    headline: 'Surgical Approach to the Thoracic Wall & Median Sternotomy Peer-Reviewed by Board-Certified Surgeons',
    source: 'Annals of Surgery',
    time: '4h ago',
    region: 'worldwide',
    imageUrl: '/images/thorax-anatomy.jpg',
  },
  {
    id: 'fn-5',
    headline: 'Over 50,000 Medical Students & Resident Physicians Learning Daily on MedCore',
    source: 'MedCore Analytics',
    time: 'Today',
    region: 'worldwide',
    imageUrl: '/images/medical-hero-1.jpg',
  },
  {
    id: 'fn-6',
    headline: 'WHO Issues Updated 2026 Advisory on Antimicrobial Resistance Stewardship in Tertiary Care',
    source: 'World Health Organization',
    time: '5h ago',
    region: 'worldwide',
    imageUrl: '/images/medical-hero-2.jpg',
  },
  {
    id: 'fn-7',
    headline: 'New Advances in Minimally Invasive Transcatheter Aortic Valve Replacement (TAVR)',
    source: 'NEJM Evidence',
    time: '6h ago',
    region: 'worldwide',
    imageUrl: '/images/medical-hero-3.jpg',
  },
  {
    id: 'fn-8',
    headline: 'Targeted Immunotherapy Showing Unprecedented Responses in Refractory Solid Tumors',
    source: 'The Lancet Oncology',
    time: '7h ago',
    region: 'worldwide',
    imageUrl: '/images/medical-hero-4.jpg',
  },
];

const SRI_LANKA_FALLBACK_NEWS: MedicalNewsItem[] = [
  {
    id: 'lk-fn-1',
    headline: 'Sri Lanka health services and public health updates',
    source: 'Sri Lanka Ministry of Health',
    time: 'Today',
    region: 'sri-lanka',
    imageUrl: '/images/medical-hero-4.jpg',
  },
  {
    id: 'lk-fn-2',
    headline: 'Latest Sri Lankan healthcare and community health developments',
    source: 'NewsFirst',
    time: 'Today',
    region: 'sri-lanka',
    imageUrl: '/images/emergency-care.jpg',
  },
  {
    id: 'lk-fn-3',
    headline: 'Regional medical research, hospitals, and health policy coverage',
    source: 'Ada Derana',
    time: 'Today',
    region: 'sri-lanka',
    imageUrl: '/images/medical-hero-3.jpg',
  },
  {
    id: 'lk-fn-4',
    headline: 'Sri Lankan public health and medical community briefing',
    source: 'Daily Mirror',
    time: 'Today',
    region: 'sri-lanka',
    imageUrl: '/images/neuro-brain.jpg',
  },
];

const NEWS_IMAGE_FALLBACKS = [
  '/images/cardio-heart.jpg',
  '/images/neuro-brain.jpg',
  '/images/emergency-care.jpg',
  '/images/thorax-anatomy.jpg',
  '/images/medical-hero-2.jpg',
];

const stripFeedMarkup = (value?: string) => value
  ?.replace(/<[^>]*>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'")
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

export function useMedicalNews() {
  const [news, setNews] = useState<MedicalNewsItem[]>(FALLBACK_NEWS);
  const [sriLankaNews, setSriLankaNews] = useState<MedicalNewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchFeed = async (
      url: string,
      region: 'worldwide' | 'sri-lanka',
      fallback: MedicalNewsItem[],
    ): Promise<MedicalNewsItem[]> => {
      const dateKey = new Date().toISOString().slice(0, 10);
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const articles = data.articles || data.results || data.items;
          if (articles && articles.length > 0) {
            const liveItems: MedicalNewsItem[] = articles.map(
              (a: { title?: string; source?: { name?: string }; source_id?: string; author?: string; url?: string; link?: string; description?: string; pubDate?: string; publishedAt?: string; image?: string; image_url?: string; thumbnail?: string; enclosure?: { link?: string } }, idx: number) => ({
                id: `${region}-${dateKey}-${idx}`,
                headline: (a.title || 'Medical news update').replace(/\s*-\s*[^-]*$/, ''),
                source: a.source?.name || a.source_id || a.author || 'Medical News',
                time: (a.publishedAt || a.pubDate) ? new Date(a.publishedAt || a.pubDate || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
                publishedAt: a.publishedAt || a.pubDate,
                description: stripFeedMarkup(a.description),
                content: stripFeedMarkup((a as { content?: string }).content),
                url: a.url || a.link,
                imageUrl: a.image || a.image_url || a.thumbnail || a.enclosure?.link || NEWS_IMAGE_FALLBACKS[idx % NEWS_IMAGE_FALLBACKS.length],
                region,
              }),
            );
            return liveItems;
          }
        }
      } catch (err) {
        console.warn(`Medical news feed notice (${region}):`, err);
      }
      return fallback.map((item) => ({ ...item, region }));
    };

    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const newsDataApiKey = (import.meta as any).env?.VITE_NEWSDATA_API_KEY;
        const apiKey = (import.meta as any).env?.VITE_GNEWS_API_KEY;
        const worldwideRss = 'https://news.google.com/rss/search?q=medical+OR+healthcare&hl=en&gl=US&ceid=US:en';
        const sriLankaRss = 'https://news.google.com/rss/search?q=Sri+Lanka+(medical+OR+health)&hl=en&gl=LK&ceid=LK:en';
        const rssProxy = (rssUrl: string) => `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
        const worldwideUrl = newsDataApiKey
          ? `https://newsdata.io/api/1/news?apikey=${newsDataApiKey}&category=health&language=en&country=us,gb,au,in`
          : apiKey
            ? `https://gnews.io/api/v4/top-headlines?topic=health&lang=en&max=8&apikey=${apiKey}`
            : rssProxy(worldwideRss);
        const sriLankaUrl = newsDataApiKey
          ? `https://newsdata.io/api/1/news?apikey=${newsDataApiKey}&category=health&language=en&country=lk`
          : apiKey
            ? `https://gnews.io/api/v4/top-headlines?topic=health&country=lk&lang=en&max=8&apikey=${apiKey}`
            : rssProxy(sriLankaRss);
        const [worldwide, sriLanka] = await Promise.all([
          fetchFeed(worldwideUrl, 'worldwide', FALLBACK_NEWS),
          fetchFeed(sriLankaUrl, 'sri-lanka', SRI_LANKA_FALLBACK_NEWS),
        ]);
        if (isMounted) {
          setNews(worldwide);
          setSriLankaNews(sriLanka);
          if (!worldwide.some((item) => item.url) && !sriLanka.some((item) => item.url)) {
            setError('Live medical news is temporarily unavailable. Showing the latest available MedCore updates.');
          }
        }
      } catch (err) {
        console.warn('Medical news feed notice:', err);
        if (isMounted) {
          setError('Live medical news is temporarily unavailable. Showing the latest available MedCore updates.');
          setNews(FALLBACK_NEWS);
          setSriLankaNews(SRI_LANKA_FALLBACK_NEWS);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNews();
    return () => {
      isMounted = false;
    };
  }, []);

  return { news, sriLankaNews, loading, error };
}

