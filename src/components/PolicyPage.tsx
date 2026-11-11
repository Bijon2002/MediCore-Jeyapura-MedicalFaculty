import React from 'react';
import { SEOHead } from './seo/SEOHead';
import './StaticContent.css';

export interface PolicyPageProps {
  type: 'editorial-policy' | 'content-guidelines' | 'medical-disclaimer' | 'privacy-policy' | 'terms';
}

export const PolicyPage: React.FC<PolicyPageProps> = ({ type }) => {
  const getPolicyDetails = () => {
    switch (type) {
      case 'editorial-policy':
        return {
          title: 'Editorial Policy & Content Standards',
          metaDesc: 'MediCore editorial policy, peer-review standards, source verification rules, and medical content quality guidelines.',
          canonical: '/editorial-policy',
          tag: 'EDITORIAL GOVERNANCE',
          heading: 'MediCore Editorial & Review Standards',
          content: (
            <>
              <p>
                MediCore adheres to a high standard of academic accuracy to ensure our medical learning resources provide reliable educational value for students and healthcare trainees.
              </p>
              <h3>1. Creator Attribution</h3>
              <p>
                All published clinical articles and interactive quizzes must clearly identify their author. Submissions authored by medical students undergo faculty review prior to public dissemination.
              </p>
              <h3>2. Evidence-Based Citations</h3>
              <p>
                Clinical claims, anatomical descriptions, and diagnostic algorithms must reference standard authoritative medical texts (e.g., Guyton &amp; Hall, Moore's Clinically Oriented Anatomy, Robbins Basic Pathology) or international clinical guidelines (e.g., ACC/AHA, Surviving Sepsis Campaign, WHO).
              </p>
              <h3>3. Peer-Review Process</h3>
              <p>
                Articles marked as <em>Peer-Reviewed</em> have been evaluated by registered faculty reviewers or board-certified practitioners for physiological accuracy, surgical safety, and educational clarity.
              </p>
              <h3>4. Corrections &amp; Updates</h3>
              <p>
                Medical science evolves continuously. If an error, ambiguity, or outdated recommendation is identified in any published article, users can flag it for immediate editorial revision.
              </p>
            </>
          ),
        };

      case 'content-guidelines':
        return {
          title: 'Content Creation Guidelines',
          metaDesc: 'Guidelines and formatting criteria for authors and educators drafting medical articles and quizzes on MediCore.',
          canonical: '/content-guidelines',
          tag: 'CONTRIBUTOR GUIDELINES',
          heading: 'Clinical Content Authoring Guidelines',
          content: (
            <>
              <p>
                We welcome educational contributions from medical undergraduates, postgraduates, and clinical educators. To maintain consistency, all submissions should follow these formatting rules:
              </p>
              <h3>1. Structure &amp; Organization</h3>
              <p>
                Articles should begin with an <strong>Executive Summary</strong> summarizing high-yield board concepts, followed by physiological mechanisms, clinical manifestations, diagnosis pathways, and management pearls.
              </p>
              <h3>2. Media &amp; Medical Illustrations</h3>
              <p>
                All anatomical diagrams, histological slides, and radiologic images must be open-access, appropriately licensed, or original works. Patient identifiers must never be included in any clinical media.
              </p>
              <h3>3. Question Bank Design</h3>
              <p>
                Quiz items should test clinical application rather than pure rote recall. Include a comprehensive explanation rationale for both correct and incorrect answer choices.
              </p>
            </>
          ),
        };

      case 'medical-disclaimer':
        return {
          title: 'Medical Education Disclaimer',
          metaDesc: 'Educational disclaimer for MediCore. The platform provides educational materials for medical students and clinicians, not patient diagnoses or treatment.',
          canonical: '/medical-disclaimer',
          tag: 'IMPORTANT NOTICE',
          heading: 'Medical & Educational Disclaimer',
          content: (
            <>
              <div className="disclaimer-alert-box">
                <strong>MediCore is exclusively an academic educational platform.</strong> The contents, quizzes, algorithms, and articles on this website are designed for educational study by medical students, healthcare trainees, and educators.
              </div>
              <h3>1. Not Medical Advice</h3>
              <p>
                The materials provided on MediCore do not constitute medical advice, clinical diagnosis, or treatment recommendations for individuals. Patients and the general public should never use MediCore to diagnose or treat a health problem. Always consult a qualified medical professional for health concerns.
              </p>
              <h3>2. Clinical Decision-Making</h3>
              <p>
                While our content is peer-reviewed for educational accuracy, healthcare professionals must exercise independent clinical judgment and refer to official hospital protocols and current drug formularies when managing patients.
              </p>
              <h3>3. Institutional Independence</h3>
              <p>
                MediCore is a student-created initiative originating from the Faculty of Medical Sciences, University of Sri Jayewardenepura, Sri Lanka. It does not represent an official institutional policy or official endorsement by the university.
              </p>
            </>
          ),
        };

      case 'privacy-policy':
        return {
          title: 'Privacy Policy',
          metaDesc: 'MediCore privacy policy explaining how user profile data, assessment results, and account information are safely handled.',
          canonical: '/privacy-policy',
          tag: 'DATA PROTECTION',
          heading: 'Privacy Policy',
          content: (
            <>
              <p>
                At MediCore, we take user privacy and account security seriously. This policy explains what information we collect and how it is used.
              </p>
              <h3>1. Information We Collect</h3>
              <p>
                We collect your name, email address, and voluntary profile information (such as your avatar picture and institutional affiliation) solely to facilitate account authentication and display author credits.
              </p>
              <h3>2. Assessment &amp; Quiz Data</h3>
              <p>
                When you complete medical practice quizzes, your responses and scores are recorded to help you track your personal academic progress. These attempts are kept confidential within your student workspace.
              </p>
              <h3>3. No Third-Party Data Selling</h3>
              <p>
                MediCore does not sell, trade, or monetize personal user data or assessment histories to third parties or advertisers.
              </p>
            </>
          ),
        };

      case 'terms':
      default:
        return {
          title: 'Terms of Use',
          metaDesc: 'Terms of service and usage conditions for the MediCore open-access medical learning platform.',
          canonical: '/terms',
          tag: 'LEGAL TERMS',
          heading: 'Terms of Use',
          content: (
            <>
              <p>
                By accessing or using MediCore (medcore.lk), you agree to be bound by these Terms of Use and our Medical Disclaimer.
              </p>
              <h3>1. Educational Use Only</h3>
              <p>
                You agree to use MediCore solely for educational, academic, and professional training purposes. You agree not to misuse or misrepresent content as patient-specific clinical advice.
              </p>
              <h3>2. User-Generated Content</h3>
              <p>
                Authors grant MediCore an open-access license to distribute submitted educational articles and question banks to medical learners worldwide while retaining moral authorship rights.
              </p>
              <h3>3. Prohibited Conduct</h3>
              <p>
                Users must not upload copyrighted images without permission, post abusive or discriminatory material, or attempt to compromise platform security or Row-Level Security policies.
              </p>
            </>
          ),
        };
    }
  };

  const details = getPolicyDetails();

  return (
    <div className="static-page-wrapper">
      <SEOHead
        title={details.title}
        description={details.metaDesc}
        canonicalPath={details.canonical}
      />

      <div className="static-hero-section">
        <div className="static-tag-pill">{details.tag}</div>
        <h1 className="static-title">{details.heading}</h1>
      </div>

      <div className="policy-body-container">{details.content}</div>
    </div>
  );
};

