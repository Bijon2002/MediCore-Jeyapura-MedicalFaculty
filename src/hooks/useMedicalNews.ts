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
  category?: string;
}

export const FALLBACK_NEWS: MedicalNewsItem[] = [
  {
    id: 'ww-1',
    headline: 'Medical students: How to write a public comment, shape health policy',
    source: 'American Medical Association | AMA',
    time: '01:07 PM',
    region: 'worldwide',
    category: 'Health Policy',
    description: 'Practical guide for medical trainees on submitting impactful public comments to influence healthcare legislation and health agency administrative rules.',
    content: 'Medical students and resident physicians possess unique frontline perspectives that can powerfully shape health policy. The American Medical Association highlights actionable frameworks for trainees to review proposed federal rules, articulate clinical evidence, and submit official public comments to federal and state health departments.',
    url: 'https://www.ama-assn.org/medical-students/specialty-profiles/medical-students-how-write-public-comment-shape-health-policy',
    imageUrl: '/images/medical-hero-1.jpg',
  },
  {
    id: 'ww-2',
    headline: 'Fed up with the healthcare industry, this red state capped insulin prices for patients',
    source: 'North Dakota Monitor',
    time: '11:06 AM',
    region: 'worldwide',
    category: 'Endocrinology',
    description: 'Bipartisan legislation establishes strict price caps on out-of-pocket insulin copays to prevent rationing and severe diabetic ketoacidosis complications.',
    content: 'State lawmakers have enacted comprehensive legislation capping out-of-pocket insulin costs for residents with diabetes. The policy responds to widespread clinical reports of patients rationing life-sustaining insulin due to escalating pharmacy benefit manager costs.',
    url: 'https://northdakotamonitor.com',
    imageUrl: '/images/cardio-heart.jpg',
  },
  {
    id: 'ww-3',
    headline: 'States Offer Perks To Attract Healthcare Workers to Rural Areas — With a Catch',
    source: 'KFF Health News',
    time: '10:02 AM',
    region: 'worldwide',
    category: 'Workforce',
    description: 'Loan forgiveness and recruitment bonuses aim to resolve physician shortages in underserved communities while facing retention challenges.',
    content: 'State health programs are expanding recruitment packages including full medical school tuition reimbursement and housing stipends for clinicians committing to rural regional facilities. However, long-term retention remains challenging after multi-year service agreements expire.',
    url: 'https://kffhealthnews.org',
    imageUrl: '/images/emergency-care.jpg',
  },
  {
    id: 'ww-4',
    headline: 'Medical school should start after students take the Step 1 exam',
    source: 'STAT',
    time: '09:35 AM',
    region: 'worldwide',
    category: 'Medical Education',
    description: 'Curriculum debate on preclinical basic science integration and transitioning to earlier experiential clinical clerkships.',
    content: 'Medical educators propose restructuring standard four-year MD curricula to allow accelerated entry into hospital-based clinical rotations following foundational board evaluation, optimizing clerkship readiness and practical patient-care competence.',
    url: 'https://www.statnews.com',
    imageUrl: '/images/neuro-brain.jpg',
  },
  {
    id: 'ww-5',
    headline: 'Prescription by subscription: The hidden risks of online health care',
    source: 'Medical Xpress',
    time: '12:30 PM',
    region: 'worldwide',
    category: 'Digital Health',
    description: 'Clinicians raise concerns regarding automated telehealth subscription platforms prescribing controlled medications without continuous physical exams.',
    content: 'Direct-to-consumer digital health startups offering monthly medication subscriptions for GLP-1 agonists, stimulants, and dermatologics face regulatory scrutiny over fragmented medical records, inadequate baseline laboratory monitoring, and lack of continuity of care.',
    url: 'https://medicalxpress.com',
    imageUrl: '/images/thorax-anatomy.jpg',
  },
  {
    id: 'ww-6',
    headline: 'UMass Chan-Baystate med student conducts research in Bolivia, creates health policy elective',
    source: 'UMass Chan Medical School',
    time: '05:17 AM',
    region: 'worldwide',
    category: 'Global Health',
    description: 'International clinical research into maternal health outcomes leads to novel experiential curriculum for aspiring global health practitioners.',
    content: 'Investigating high-altitude maternal healthcare delivery in rural Bolivian communities, medical researchers identified critical gaps in prenatal emergency transport, developing an accredited health policy elective for incoming medical cohorts.',
    url: 'https://www.umassmed.edu',
    imageUrl: '/images/medical-hero-2.jpg',
  },
  {
    id: 'ww-7',
    headline: "Pakistan ex-PM Imran Khan appeals for urgent medical help, says he 'may not return alive'",
    source: 'Reuters',
    time: '12:37 PM',
    region: 'worldwide',
    category: 'Public Health',
    description: 'International human rights and medical bodies called upon to evaluate prison healthcare standards and specialist physician access.',
    content: 'Legal representatives and medical teams appeal to international monitors for independent clinical assessment following reports of worsening chronic medical symptoms and delayed tertiary diagnostic access in correctional custody.',
    url: 'https://www.reuters.com',
    imageUrl: '/images/medical-hero-3.jpg',
  },
  {
    id: 'ww-8',
    headline: 'Cordica Medical Launches PTFE Etched Liners for Interventional Catheter Designs',
    source: 'AFP.com',
    time: '12:00 PM',
    region: 'worldwide',
    category: 'MedTech',
    description: 'Next-generation fluoropolymer catheter liners enable ultra-thin walls and enhanced lubricity for microvascular neurological interventions.',
    content: 'Biomedical engineering firm Cordica Medical unveiled high-precision PTFE etched catheter liners engineered to improve crossability and pushability during complex percutaneous coronary and neurovascular interventions.',
    url: 'https://www.afp.com',
    imageUrl: '/images/medical-hero-4.jpg',
  },
];

export const SRI_LANKA_FALLBACK_NEWS: MedicalNewsItem[] = [
  {
    id: 'lk-1',
    headline: 'Sri Lanka warns of leptospirosis risk in 5 districts',
    source: 'The Peninsula Qatar',
    time: '10:19 AM',
    region: 'sri-lanka',
    category: 'Infectious Diseases',
    description: 'Epidemiology Unit alerts paddy farmers and flood-affected communities in Kalutara, Galle, Matara, Ratnapura, and Kurunegala to take prophylactic doxycycline.',
    content: 'The Ministry of Health Epidemiology Unit in Sri Lanka has issued urgent advisories across five major agricultural districts following seasonal monsoon rains. Agricultural workers and residents exposed to muddy waters are urged to obtain free prophylactic doxycycline capsules from local Medical Officer of Health (MOH) offices.',
    url: 'https://thepeninsulaqatar.com',
    imageUrl: '/images/emergency-care.jpg',
  },
  {
    id: 'lk-2',
    headline: 'Nearly one in five Sri Lankans suffering from diabetes – Dy Minister',
    source: 'Ada Derana',
    time: '03:43 AM',
    region: 'sri-lanka',
    category: 'Non-Communicable Diseases',
    description: 'Health authorities highlight escalating non-communicable disease burden and call for enhanced primary care lifestyle intervention screening.',
    content: 'Official health statistics indicate national adult diabetes prevalence has approached 20%, driven by dietary shifts and sedentary lifestyles. The Ministry of Health is deploying expanded community screening clinics across rural divisional secretariats.',
    url: 'https://www.adaderana.lk',
    imageUrl: '/images/cardio-heart.jpg',
  },
  {
    id: 'lk-3',
    headline: 'Sri Lanka launches the WHO SAFER technical package and its first alcohol investment case',
    source: 'World Health Organization (WHO)',
    time: '07:00 AM',
    region: 'sri-lanka',
    category: 'Preventive Medicine',
    description: 'Strategic roadmap to turn evidence into action, curbing alcohol-related non-communicable diseases, mental health morbidity, and trauma.',
    content: 'In partnership with the World Health Organization, Sri Lanka unveiled its national alcohol investment case and the WHO SAFER package, detailing economic and public health returns from evidence-based fiscal policies and clinical brief interventions.',
    url: 'https://www.who.int/srilanka',
    imageUrl: '/images/medical-hero-3.jpg',
  },
  {
    id: 'lk-4',
    headline: 'Sri Lanka advances national efforts to combat substandard and falsified medical products',
    source: 'World Health Organization (WHO)',
    time: '07:00 AM',
    region: 'sri-lanka',
    category: 'Pharmacology & Safety',
    description: 'National Medicines Regulatory Authority (NMRA) bolsters post-marketing surveillance and batch verification protocols across national hospitals.',
    content: 'Multi-agency collaboration led by the National Medicines Regulatory Authority and WHO is strengthening port-of-entry inspection, barcode verification, and rapid recall protocols for essential pharmaceutical supplies.',
    url: 'https://www.who.int/srilanka',
    imageUrl: '/images/medical-hero-2.jpg',
  },
  {
    id: 'lk-5',
    headline: 'Navy assists bringing ashore critically ill fisherman for medical attention',
    source: 'Sri Lanka Navy',
    time: '08:08 AM',
    region: 'sri-lanka',
    category: 'Emergency Medicine',
    description: 'Offshore medical evacuation operation coordinates rapid triage and ambulance transfer to regional base hospital.',
    content: 'A naval patrol craft evacuated a critically distressed deep-sea fisherman experiencing acute cardiac symptoms 40 nautical miles off the southern coast, providing immediate maritime first aid prior to urgent emergency ward admission.',
    url: 'https://news.navy.lk',
    imageUrl: '/images/medical-hero-1.jpg',
  },
  {
    id: 'lk-6',
    headline: 'Providing eye care in Sri Lanka: Training and surgical outreach',
    source: 'Association of Optometrists (AOP)',
    time: '02:38 PM',
    region: 'sri-lanka',
    category: 'Ophthalmology',
    description: 'International collaborative outreach addresses cataract backlogs and diabetic retinopathy screening across peripheral healthcare units.',
    content: 'Ophthalmic surgical missions visiting provincial general hospitals perform hundreds of sight-restoring cataract procedures while conducting clinical training workshops for local optometrists and primary eye care nurses.',
    url: 'https://www.optometry.co.uk',
    imageUrl: '/images/neuro-brain.jpg',
  },
  {
    id: 'lk-7',
    headline: 'WHO Goodwill Ambassador for Leprosy Elimination visits Sri Lanka to accelerate progress towards zero leprosy',
    source: 'World Health Organization (WHO)',
    time: '07:00 AM',
    region: 'sri-lanka',
    category: 'Dermatology & Public Health',
    description: 'High-level mission emphasizes active case detection, stigma reduction, and multidrug therapy distribution.',
    content: 'The Anti-Leprosy Campaign of Sri Lanka joined the WHO Goodwill Ambassador to review district-level detection rates and reiterate commitments toward eliminating transmission and disability caused by Hansen disease.',
    url: 'https://www.who.int/srilanka',
    imageUrl: '/images/thorax-anatomy.jpg',
  },
  {
    id: 'lk-8',
    headline: 'India Vision Institute launches mobile eye health unit at Mandapam Sri Lankan Tamils rehabilitation camp',
    source: 'The Hindu',
    time: '12:05 PM',
    region: 'sri-lanka',
    category: 'Community Health',
    description: 'Cross-border community health initiative delivers specialized refraction and vision screenings to over 3,000 residents.',
    content: 'Equipped with diagnostic slit lamps and autorefractors, a custom mobile clinical van initiated comprehensive visual acuity assessments and distributed corrective spectacles free of charge to camp residents.',
    url: 'https://www.thehindu.com',
    imageUrl: '/images/medical-hero-4.jpg',
  },
  {
    id: 'lk-9',
    headline: 'As butterflies sweep Sri Lanka, global study finds expanding ranges linked to climate change',
    source: 'Mongabay',
    time: '05:26 AM',
    region: 'sri-lanka',
    category: 'Environmental Health',
    description: 'Ecological shifts highlight shifting vector habitats and the emergence of vector-borne zoonotic diseases in hill country zones.',
    content: 'Biologists tracking migration patterns across the Central Highlands observe climate-mediated habitat elevation shifts, warning public health epidemiologists about concomitant expansion of mosquito vector species into previously malaria- and dengue-free regions.',
    url: 'https://news.mongabay.com',
    imageUrl: '/images/emergency-care.jpg',
  },
  {
    id: 'lk-10',
    headline: 'Bing Chun responds to Rs. 84,000 fine over ice cream standards violations',
    source: 'Newswire',
    time: '04:18 AM',
    region: 'sri-lanka',
    category: 'Public Health Regulations',
    description: 'Public Health Inspectors enforce Food Act compliance on microbiological thresholds and cold-chain integrity.',
    content: 'Following routine food safety audits by Public Health Inspectors (PHIs) in the Colombo municipality, corporate food safety managers issued corrective action plans to reinforce storage temperature verification and microbiological testing.',
    url: 'https://www.newswire.lk',
    imageUrl: '/images/medical-hero-2.jpg',
  },
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
  const [sriLankaNews, setSriLankaNews] = useState<MedicalNewsItem[]>(SRI_LANKA_FALLBACK_NEWS);
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
          if (articles && Array.isArray(articles) && articles.length > 0) {
            const liveItems: MedicalNewsItem[] = articles.map(
              (a: any, idx: number) => ({
                id: `${region}-${dateKey}-${idx}`,
                headline: (a.title || fallback[idx % fallback.length]?.headline || 'Medical news update').replace(/\s*-\s*[^-]*$/, ''),
                source: a.source?.name || a.source_id || a.author || fallback[idx % fallback.length]?.source || 'Medical News',
                time: (a.publishedAt || a.pubDate) ? new Date(a.publishedAt || a.pubDate || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (fallback[idx % fallback.length]?.time || 'Today'),
                publishedAt: a.publishedAt || a.pubDate,
                description: stripFeedMarkup(a.description) || fallback[idx % fallback.length]?.description,
                content: stripFeedMarkup(a.content) || fallback[idx % fallback.length]?.content,
                url: a.url || a.link || fallback[idx % fallback.length]?.url,
                imageUrl: a.image || a.image_url || a.thumbnail || a.enclosure?.link || fallback[idx % fallback.length]?.imageUrl,
                region,
                category: fallback[idx % fallback.length]?.category || (region === 'sri-lanka' ? 'National Health' : 'Clinical Update'),
              }),
            );
            return liveItems;
          }
        }
      } catch (err) {
        console.warn(`Medical news feed notice (${region}):`, err);
      }
      return fallback;
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
          setNews(worldwide.length > 0 ? worldwide : FALLBACK_NEWS);
          setSriLankaNews(sriLanka.length > 0 ? sriLanka : SRI_LANKA_FALLBACK_NEWS);
        }
      } catch (err) {
        console.warn('Medical news feed notice:', err);
        if (isMounted) {
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
