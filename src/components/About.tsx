import React from 'react';
import { SEOHead } from './seo/SEOHead';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './About.css';

export interface AboutProps {
  onNavigateHome: () => void;
  onNavigateToArticles: () => void;
  onNavigateToContact: () => void;
  onNavigateToApplyReviewer?: () => void;
}

export const About: React.FC<AboutProps> = ({
  onNavigateHome,
  onNavigateToArticles,
  onNavigateToContact,
  onNavigateToApplyReviewer,
}) => {
  useScrollReveal();

  return (
    <div className="medcore-about-page">
      <SEOHead
        title="About MedCore | Mission, Origin & Architecture"
        description="Learn about MedCore, an open-access medical education initiative created by students of the Faculty of Medical Sciences, University of Sri Jayewardenepura, Sri Lanka."
        canonicalPath="/about"
      />
      {/* =========================================================================
          HERO BANNER
          ========================================================================= */}
      <section className="about-hero">
        <div
          className="about-hero-bg-image"
          style={{ backgroundImage: "url('/images/medical-hero-1.jpg')" }}
        />
        <div className="about-hero-scenic-overlay" />

        <div className="about-hero-container hero-slide-up">
          <nav className="about-breadcrumbs" aria-label="Breadcrumb">
            <button type="button" className="breadcrumb-btn" onClick={onNavigateHome}>
              Home
            </button>
            <span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-active">About MedCore</span>
          </nav>

          <span className="about-hero-tag">Peer-Reviewed Medical Platform</span>
          <h1 className="about-hero-title">Advancing Global Medical Knowledge</h1>
          <p className="about-hero-subtitle">
            MedCore is an open-access clinical education platform bridging the gap between dense medical textbooks and practical bedside mastery through peer-reviewed articles and clinical correlates.
          </p>
        </div>
      </section>

      {/* =========================================================================
          MISSION & VISION
          ========================================================================= */}
      <section className="about-section mission-section reveal-on-scroll">
        <div className="about-container">
          <div className="mission-grid reveal-stagger">
            <div className="mission-card">
              <div className="mission-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <h2>Our Mission</h2>
              <p>
                To provide medical students, residents, and healthcare professionals with free, authoritative, peer-reviewed clinical knowledge that simplifies complex anatomical, physiological, and surgical concepts without sacrificing academic rigor.
              </p>
            </div>

            <div className="mission-card">
              <div className="mission-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <h2>Our Vision</h2>
              <p>
                A world where quality medical education is completely open, borderless, and free of paywalls, enabling future physicians in any country to train with the highest standards of evidence-based clinical medicine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOUNDER & DEVELOPMENT TEAM & SUPPORTERS
          ========================================================================= */}
      <section className="about-section people-section reveal-on-scroll">
        <div className="about-container">
          <div className="about-section-header">
            <span className="about-section-tag">People Behind MedCore</span>
            <h2>Founder &amp; Engineering Team</h2>
            <p>Meet the people building, engineering, and championing an open, practical, and academically rigorous medical learning platform.</p>
          </div>

          {/* FOUNDER CARD */}
          <div className="founder-profile-card">
            <div className="founder-photo-wrapper">
              <img
                src="/images/founder.jpeg"
                alt="Thuvarakan Srikaran - Founder of MedCore"
                className="founder-photo-img"
                loading="lazy"
              />
            </div>
            <div>
              <span className="people-card-label">Founder – MedCore</span>
              <h3>Thuvarakan Srikaran</h3>
              <p className="people-card-role">Founder | Medical Student</p>
              <p>
                Thuvarakan S. is the founder of MedCore, an emerging medical education platform established with the vision of making high-quality medical knowledge accessible to students, healthcare professionals, and educators.
              </p>
              <p>
                He is a third-year medical student at the University of Sri Jayewardenepura, Sri Lanka, with a strong passion for medical education, clinical learning, and academic development.
              </p>
              <p>
                Through MedCore, he aims to bridge the gap between theoretical knowledge and practical clinical understanding by creating opportunities for expert-led learning, educational webinars, academic resources, and collaborative knowledge sharing.
              </p>
              <p>
                His vision is to build MedCore into a trusted medical education platform that empowers the next generation of healthcare professionals.
              </p>
              <strong className="founder-signature">Building knowledge. Inspiring healthcare. Shaping the future.</strong>
            </div>
          </div>

          {/* CO-CREATORS & ENGINEERING TEAM */}
          <div className="people-team-grid">
            <article className="people-team-card developer-profile-card">
              <div className="developer-photo-wrapper">
                <img
                  src="/Developers/bijon.png"
                  alt="Bijosilin Marisilin - Co-Creator & Lead Engineer"
                  className="developer-photo-img"
                  loading="lazy"
                />
              </div>
              <div className="developer-info-col">
                <span className="people-card-label">Co-Creator &amp; Lead Engineer</span>
                <h3>Bijosilin Marisilin</h3>
                <p className="people-card-role">
                  Software Engineering Graduate · Software Engineer · Full-Stack &amp; Product Architecture
                </p>

                <div className="dev-badges-row">
                  <span className="dev-chip location-chip">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Jaffna, Northern Province, Sri Lanka
                  </span>
                  <span className="dev-chip achievement-chip">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    Built production systems serving 5 govt districts
                  </span>
                </div>

                <p>
                  Bijosilin Marisilin is the co-creator and lead software architect of MedCore. With extensive experience in full-stack architecture, machine learning research, and cloud infrastructure, he has engineered mission-critical production platforms serving five government administrative districts across Sri Lanka.
                </p>
                <p>
                  At MedCore, he leads the overall technical design, engineered the high-performance React 19 single-page application with TypeScript, designed the Supabase PostgreSQL database schemas with granular Row Level Security (RLS), and architected the clinical knowledge authoring, search, and delivery pipelines.
                </p>
                <p>
                  His work centers on uniting modern software reliability, medical informatics, and scalable cloud systems to provide barrier-free, academically rigorous learning resources for medical students and clinicians.
                </p>

                <div className="dev-social-actions">
                  <a
                    href="https://www.linkedin.com/in/marisilin-bijosilin/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dev-linkedin-btn"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    <span>LinkedIn Profile</span>
                  </a>
                </div>
              </div>
            </article>

            <article className="people-team-card developer-profile-card">
              <div className="developer-photo-wrapper">
                <img
                  src="/Developers/mathu.jpeg"
                  alt="Puvanenthira Mathushan - Co-Creator & Software Developer"
                  className="developer-photo-img"
                  loading="lazy"
                />
              </div>
              <div className="developer-info-col">
                <span className="people-card-label">Co-Creator &amp; Software Developer</span>
                <h3>Puvanenthira Mathushan</h3>
                <p className="people-card-role">
                  Backend Systems &amp; Education Tools · Computer Science Undergraduate
                </p>

                <div className="dev-badges-row">
                  <span className="dev-chip education-chip">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                    Undergraduate - Computer Science | SLIIT Northern Uni
                  </span>
                  <span className="dev-chip location-chip">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Jaffna District, Northern Province, Sri Lanka
                  </span>
                </div>

                <p>
                  Puvanenthira Mathushan is the co-creator and software developer of MedCore, currently pursuing his undergraduate studies in Computer Science at SLIIT Northern University, Jaffna District.
                </p>
                <p>
                  Within MedCore, he focuses on backend engineering, data modeling, assessment scoring algorithms, and education workflow automation. He co-architected the interactive clinical quiz engine, timed examination modules, and specialty categorization models that empower medical students to test diagnostic knowledge against board-style question banks.
                </p>
                <p>
                  He is dedicated to engineering practical, student-centric academic tools and optimizing full-stack applications that streamline complex medical learning into intuitive, high-yield digital experiences.
                </p>

                <div className="dev-social-actions">
                  <a
                    href="https://www.linkedin.com/in/puvanenthira-mathushan/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dev-linkedin-btn"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    <span>LinkedIn Profile</span>
                  </a>
                </div>
              </div>
            </article>
          </div>


        </div>
      </section>

      {/* =========================================================================
          FOUR PILLARS OF CLINICAL RIGOR
          ========================================================================= */}
      <section className="about-section pillars-section reveal-on-scroll">
        <div className="about-container">
          <div className="about-section-header">
            <span className="about-section-tag">Quality Assurance</span>
            <h2>Our 4 Pillars of Clinical Rigor</h2>
            <p>Every article published on MedCore adheres to strict editorial and scientific benchmarks.</p>
          </div>

          <div className="pillars-grid reveal-stagger">
            <div className="pillar-item">
              <div className="pillar-number">01</div>
              <h3>Evidence-Based Medicine</h3>
              <p>
                All clinical statements, anatomical relationships, and treatment principles are grounded in peer-reviewed medical literature, consensus guidelines, and authoritative anatomical nomenclature.
              </p>
            </div>

            <div className="pillar-item">
              <div className="pillar-number">02</div>
              <h3>Specialist Peer Review</h3>
              <p>
                Before publication, drafts are evaluated by certified Medical Reviewers (attending physicians, senior clinical residents, and medical educators) for accuracy, clarity, and clinical relevance.
              </p>
            </div>

            <div className="pillar-item">
              <div className="pillar-number">03</div>
              <h3>High-Yield Clinical Correlates</h3>
              <p>
                Preclinical anatomy and pathology are explicitly tied to real-world patient presentations, surgical landmarks, physical exam findings, and board examination scenarios (USMLE, PLAB).
              </p>
            </div>

            <div className="pillar-item">
              <div className="pillar-number">04</div>
              <h3>Continuous Editorial Audits</h3>
              <p>
                As clinical trials conclude and guidelines evolve, articles undergo scheduled re-reviews to ensure pharmacological doses, clinical indications, and surgical insights remain current.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          EDITORIAL WORKFLOW
          ========================================================================= */}
      <section className="about-section workflow-section reveal-on-scroll">
        <div className="about-container">
          <div className="workflow-card">
            <div className="about-section-header">
              <span className="about-section-tag">Editorial Workflow</span>
              <h2>How an Article Becomes a Published Guide</h2>
              <p>Our transparent 4-stage pipeline guarantees publication integrity.</p>
            </div>

            <div className="workflow-timeline">
              <div className="timeline-node">
                <div className="node-badge">Step 1</div>
                <h4>Author Submission</h4>
                <p>Medical students or clinicians author comprehensive, citation-backed drafts.</p>
              </div>

              <div className="timeline-connector">→</div>

              <div className="timeline-node">
                <div className="node-badge">Step 2</div>
                <h4>Double-Blind Review</h4>
                <p>Assigned clinical specialists audit factual precision, diagrams, and takeaways.</p>
              </div>

              <div className="timeline-connector">→</div>

              <div className="timeline-node">
                <div className="node-badge">Step 3</div>
                <h4>Revision &amp; Verification</h4>
                <p>Reviewer feedback is incorporated, and references are independently cross-checked.</p>
              </div>

              <div className="timeline-connector">→</div>

              <div className="timeline-node">
                <div className="node-badge">Step 4</div>
                <h4>Open Clinical Release</h4>
                <p>The verified guide goes live with the reviewer verification badge and full accreditation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CALL TO ACTION / JOIN REVIEW BOARD
          ========================================================================= */}
      <section className="about-section cta-section reveal-on-scroll">
        <div className="about-container">
          <div className="about-cta-card">
            <h2>Are You a Clinician or Medical Educator?</h2>
            <p>
              Help shape the next generation of physicians. Join our peer-review network to review upcoming clinical articles and contribute to global medical knowledge.
            </p>
            <div className="about-cta-buttons">
              {onNavigateToApplyReviewer ? (
                <button type="button" className="btn-cta-primary" onClick={onNavigateToApplyReviewer}>
                  Apply as a Medical Reviewer
                </button>
              ) : null}
              <button type="button" className="btn-cta-secondary" onClick={onNavigateToContact}>
                Contact Our Editorial Office
              </button>
              <button type="button" className="btn-cta-text" onClick={onNavigateToArticles}>
                Explore Published Articles →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
