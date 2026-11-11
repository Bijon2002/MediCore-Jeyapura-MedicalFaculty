# MediCore: Complete Global SEO Master Implementation Plan

**Brand:** MediCore  
**Platform:** Global Medical Education & Learning Platform  
**Target Domain:** https://medcore.lk  
**Access:** Open-access  
**Audience:** International medical students, educators, and clinicians  
**Institutional Origin:** Student-created medical education project originating from the Faculty of Medical Sciences, University of Sri Jayewardenepura, Sri Lanka  
**Frontend:** React 19 · TypeScript · Vite  
**Backend & Auth:** Supabase PostgreSQL with Row Level Security (RLS)  
**Hosting:** Cloudflare Pages  
**Developers:** Bijosilin Marisilin & Puvanenthira Mathushan  

---

## 1. Product Positioning & SEO Foundation

### 1.1 MediCore's Identity
MediCore is an open-access medical education platform, not a hospital, healthcare provider, or clinical diagnostic portal.
- **Core Purpose:** Enable students and educators to explore medical learning resources, study structured subjects and topics, read peer-reviewed educational guides, practice clinical quizzes, and author educational content.
- **Brand Statement:** *MediCore is an open-access medical education platform that brings students and educators together to explore, create, and share educational articles, quizzes, and medical learning resources.*
- **Institutional Origin Statement:** *MediCore is a medical education project created by students of the Faculty of Medical Sciences, University of Sri Jayewardenepura, Sri Lanka.* (Must not claim official university endorsement, ownership, or approval).

### 1.2 Core SEO Objectives
1. International search engine discoverability (Google, Bing).
2. Discoverability of educational articles, quizzes, subjects, and topics.
3. Dual-audience positioning: Student learning + Educator creation.
4. Genuine institutional attribution without implying university ownership.
5. High-visibility developer recognition (Bijosilin Marisilin & Puvanenthira Mathushan).

---

## 2. Public Website Architecture & Routing

### Priority 0 (P0) — Essential Launch Routes
- `/` — Platform Landing Page (Hero, Audience cards, Curated topics/articles/quizzes, Origin, Developer showcase)
- `/about` — Mission, educational vision, origin, and university connection
- `/features` — Core interactive capabilities (Interactive MCQs, High-yield anatomical guides, Reviewer workflows)
- `/for-students` — Dedicated student pathway (USMLE/ERPM preparation, anatomical algorithms, quiz tracking)
- `/for-educators` — Educator & clinician authoring/reviewing pathway
- `/developers` — Development team showcase
- `/developers/bijosilin-marisilin` — Bijosilin Marisilin detailed developer profile
- `/developers/puvanenthira-mathushan` — Puvanenthira Mathushan detailed developer profile

### Priority 1 (P1) — Content & Trust Routes
- `/subjects` — Medical specialties directory
- `/subjects/:slug` — Individual subject view (with topic list and linked articles)
- `/articles` — Clinical and anatomical article directory
- `/articles/:slug` — Public educational article detail with crawlable text and Schema
- `/quizzes` — Public quiz directory
- `/quizzes/:id` — Individual quiz overview & practice landing
- `/editorial-policy` — Content quality standards and review process
- `/content-guidelines` — Contributor guidelines for students and educators
- `/privacy-policy` — Data protection and privacy
- `/terms` — Terms of use
- `/medical-disclaimer` — Educational disclaimer (non-clinical advice declaration)

---

## 3. SEO Metadata & Technical Architecture

### 3.1 Metadata Management System
Create a centralized SEO component `src/components/seo/SEOHead.tsx` managing:
- Document title (`<title>`)
- Meta description
- Canonical link tag (`rel="canonical"`)
- Open Graph tags (`og:title`, `og:description`, `og:url`, `og:image`, `og:type`)
- Twitter Cards (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)
- Meta robots directives (`index, follow` vs `noindex, nofollow` for admin/private views)
- Structured Data (JSON-LD script injection)

### 3.2 Canonical URLs & Domain Strategy
- Canonical Origin: `https://medcore.lk`
- Self-referencing canonical URLs on every public route.
- Private routes (dashboard, admin, reviewer editor, quiz creation, profile settings) marked `noindex, nofollow`.

### 3.3 Robots.txt & Sitemap
- `public/robots.txt` specifying allowed crawl paths and Sitemap location (`https://medcore.lk/sitemap.xml`).
- Dynamic/build-generated `public/sitemap.xml` listing all P0 and P1 canonical pages.

---

## 4. Structured Data (JSON-LD)

- **Organization:** MediCore educational entity identity.
- **WebSite:** Global platform schema with Sitelinks searchbox.
- **Person:** Individual developer schemas for Bijosilin Marisilin and Puvanenthira Mathushan with verified `sameAs` links.
- **Article:** Applied to `/articles/:slug` pages with headline, author, datePublished, dateModified, and publisher.
- **BreadcrumbList:** Navigational hierarchy across Subjects, Topics, and Articles.

---

## 5. Developer Recognition & Public Profiles

### Bijosilin Marisilin
- **Title:** Software Developer & Co-creator of MediCore
- **Portfolio:** https://bijonn.pages.dev/
- **GitHub:** https://github.com/Bijon2002
- **LinkedIn:** https://linkedin.com/in/marisilin-bijosilin

### Puvanenthira Mathushan
- **Title:** Software Developer & Co-creator of MediCore
- **Role:** Full-stack development, database architecture & educational tooling

---

## 6. Medical Content Trust & Quality

- Explicit separation between **Content Author** and **Peer Reviewer**.
- Transparent display of review status (`DRAFT`, `PUBLISHED`, `PEER_REVIEWED`).
- Prominent **Medical Disclaimer**: MediCore provides open-access educational materials for healthcare students and professionals, not patient diagnoses or medical advice.
