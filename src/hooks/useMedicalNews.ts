import { useState, useEffect } from 'react';

export interface MedicalNewsItem {
  id: string;
  headline: string;
  source: string;
  time?: string;
  url?: string;
}

const FALLBACK_NEWS: MedicalNewsItem[] = [
  {
    id: 'fn-1',
    headline: '2026 ACC/AHA Valvular Heart Disease Clinical Practice Guidelines Released',
    source: 'ACC / AHA',
    time: 'Today',
  },
  {
    id: 'fn-2',
    headline: 'USMLE Step 1 High-Yield Clinical Reasoning & Pathology Question Bank Updated',
    source: 'MedCore Board Prep',
    time: '2h ago',
  },
  {
    id: 'fn-3',
    headline: 'Sepsis-3 Early Resuscitation Protocols Aligned with Surviving Sepsis Campaign Guidelines',
    source: 'Critical Care Med',
    time: '3h ago',
  },
  {
    id: 'fn-4',
    headline: 'Surgical Approach to the Thoracic Wall & Median Sternotomy Peer-Reviewed by Board-Certified Surgeons',
    source: 'Annals of Surgery',
    time: '4h ago',
  },
  {
    id: 'fn-5',
    headline: 'Over 50,000 Medical Students & Resident Physicians Learning Daily on MedCore',
    source: 'MedCore Analytics',
    time: 'Today',
  },
  {
    id: 'fn-6',
    headline: 'WHO Issues Updated 2026 Advisory on Antimicrobial Resistance Stewardship in Tertiary Care',
    source: 'World Health Organization',
    time: '5h ago',
  },
  {
    id: 'fn-7',
    headline: 'New Advances in Minimally Invasive Transcatheter Aortic Valve Replacement (TAVR)',
    source: 'NEJM Evidence',
    time: '6h ago',
  },
  {
    id: 'fn-8',
    headline: 'Targeted Immunotherapy Showing Unprecedented Responses in Refractory Solid Tumors',
    source: 'The Lancet Oncology',
    time: '7h ago',
  },
];

export function useMedicalNews() {
  const [news, setNews] = useState<MedicalNewsItem[]>(FALLBACK_NEWS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchNews = async () => {
      setLoading(true);
      try {
        // Try fetching health headlines from GNews or public health news feed
        const apiKey = (import.meta as any).env?.VITE_GNEWS_API_KEY;
        if (apiKey) {
          const res = await fetch(
            `https://gnews.io/api/v4/top-headlines?topic=health&lang=en&max=8&apikey=${apiKey}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.articles && data.articles.length > 0) {
              const liveItems: MedicalNewsItem[] = data.articles.map(
                (a: { title: string; source: { name: string }; url?: string }, idx: number) => ({
                  id: `gnews-${idx}`,
                  headline: a.title.replace(/\s*-\s*[^-]*$/, ''),
                  source: a.source?.name || 'Medical News',
                  time: 'Live',
                  url: a.url,
                })
              );
              if (isMounted) setNews(liveItems);
              return;
            }
          }
        }
      } catch (err) {
        // Fall back gracefully
        console.warn('Live medical news API fetch notice:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNews();
    return () => {
      isMounted = false;
    };
  }, []);

  return { news, loading };
}
