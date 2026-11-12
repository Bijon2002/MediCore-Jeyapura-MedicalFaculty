import { useState, useEffect } from 'react';

export interface MedicalNewsItem {
  id: string;
  headline: string;
  source: string;
  time?: string;
  url?: string;
  description?: string;
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
  },
  {
    id: 'fn-2',
    headline: 'USMLE Step 1 High-Yield Clinical Reasoning & Pathology Question Bank Updated',
    source: 'MedCore Board Prep',
    time: '2h ago',
    region: 'worldwide',
  },
  {
    id: 'fn-3',
    headline: 'Sepsis-3 Early Resuscitation Protocols Aligned with Surviving Sepsis Campaign Guidelines',
    source: 'Critical Care Med',
    time: '3h ago',
    region: 'worldwide',
  },
  {
    id: 'fn-4',
    headline: 'Surgical Approach to the Thoracic Wall & Median Sternotomy Peer-Reviewed by Board-Certified Surgeons',
    source: 'Annals of Surgery',
    time: '4h ago',
    region: 'worldwide',
  },
  {
    id: 'fn-5',
    headline: 'Over 50,000 Medical Students & Resident Physicians Learning Daily on MedCore',
    source: 'MedCore Analytics',
    time: 'Today',
    region: 'worldwide',
  },
  {
    id: 'fn-6',
    headline: 'WHO Issues Updated 2026 Advisory on Antimicrobial Resistance Stewardship in Tertiary Care',
    source: 'World Health Organization',
    time: '5h ago',
    region: 'worldwide',
  },
  {
    id: 'fn-7',
    headline: 'New Advances in Minimally Invasive Transcatheter Aortic Valve Replacement (TAVR)',
    source: 'NEJM Evidence',
    time: '6h ago',
    region: 'worldwide',
  },
  {
    id: 'fn-8',
    headline: 'Targeted Immunotherapy Showing Unprecedented Responses in Refractory Solid Tumors',
    source: 'The Lancet Oncology',
    time: '7h ago',
    region: 'worldwide',
  },
];

export function useMedicalNews() {
  const [news, setNews] = useState<MedicalNewsItem[]>(FALLBACK_NEWS);
  const [sriLankaNews, setSriLankaNews] = useState<MedicalNewsItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchFeed = async (
      url: string,
      region: 'worldwide' | 'sri-lanka',
      fallback: MedicalNewsItem[],
    ): Promise<MedicalNewsItem[]> => {
      const dateKey = new Date().toISOString().slice(0, 10);
      const cacheKey = `medcore_medical_news_${region}_${dateKey}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          return JSON.parse(cached) as MedicalNewsItem[];
        } catch {
          localStorage.removeItem(cacheKey);
        }
      }

      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const articles = data.articles || data.results;
          if (articles && articles.length > 0) {
            const liveItems: MedicalNewsItem[] = articles.map(
              (a: { title: string; source?: { name?: string }; source_id?: string; url?: string; link?: string; description?: string; publishedAt?: string; pubDate?: string; image?: string; image_url?: string }, idx: number) => ({
                id: `${region}-${dateKey}-${idx}`,
                headline: a.title.replace(/\s*-\s*[^-]*$/, ''),
                source: a.source?.name || a.source_id || 'Medical News',
                time: (a.publishedAt || a.pubDate) ? new Date(a.publishedAt || a.pubDate || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
                publishedAt: a.publishedAt || a.pubDate,
                description: a.description,
                url: a.url || a.link,
                imageUrl: a.image || a.image_url,
                region,
              }),
            );
            localStorage.setItem(cacheKey, JSON.stringify(liveItems));
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
      try {
        const newsDataApiKey = (import.meta as any).env?.VITE_NEWSDATA_API_KEY;
        const apiKey = (import.meta as any).env?.VITE_GNEWS_API_KEY;
        if (newsDataApiKey || apiKey) {
          const worldwideUrl = newsDataApiKey
            ? `https://newsdata.io/api/1/news?apikey=${newsDataApiKey}&category=health&language=en&country=us,gb,au,in`
            : `https://gnews.io/api/v4/top-headlines?topic=health&lang=en&max=8&apikey=${apiKey}`;
          const sriLankaUrl = newsDataApiKey
            ? `https://newsdata.io/api/1/news?apikey=${newsDataApiKey}&category=health&language=en&country=lk`
            : `https://gnews.io/api/v4/top-headlines?topic=health&country=lk&lang=en&max=8&apikey=${apiKey}`;
          const [worldwide, sriLanka] = await Promise.all([
            fetchFeed(
              worldwideUrl,
              'worldwide',
              FALLBACK_NEWS,
            ),
            fetchFeed(
              sriLankaUrl,
              'sri-lanka',
              FALLBACK_NEWS.filter((item) => /WHO|clinical|medical|sepsis/i.test(item.headline)).slice(0, 4),
            ),
          ]);
          if (isMounted) {
            setNews(worldwide);
            setSriLankaNews(sriLanka);
          }
        } else if (isMounted) {
          setSriLankaNews(FALLBACK_NEWS.slice(0, 4).map((item) => ({ ...item, region: 'sri-lanka' })));
        }
      } catch (err) {
        console.warn('Medical news feed notice:', err);
        if (isMounted) {
          setSriLankaNews(FALLBACK_NEWS.slice(0, 4).map((item) => ({ ...item, region: 'sri-lanka' })));
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

  return { news, sriLankaNews, loading };
}

