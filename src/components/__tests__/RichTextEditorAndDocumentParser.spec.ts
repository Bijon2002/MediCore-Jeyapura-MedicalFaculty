import { describe, it, expect } from 'vitest';
import { cleanFileNameToTitle, parseWordDocument } from '../../utils/document-parser';

describe('Document Parser & Title Extraction Tests', () => {
  it('cleanFileNameToTitle should format underscores, dashes, and casing cleanly', () => {
    expect(cleanFileNameToTitle('upper_limb_brachial_plexus-v2.docx')).toBe(
      'Upper Limb Brachial Plexus'
    );
    expect(cleanFileNameToTitle('cardiovascular-system-pathology.doc')).toBe(
      'Cardiovascular System Pathology'
    );
    expect(cleanFileNameToTitle('renal_failure_clinical_notes.txt')).toBe(
      'Renal Failure Clinical Notes'
    );
  });

  it('parseWordDocument should parse text-based documents cleanly', async () => {
    const textContent =
      'Acute Coronary Syndrome Clinical Pathways\n\n' +
      'Executive Summary: Acute coronary syndromes represent a continuum of ischemic heart disease from unstable angina to ST-segment elevation myocardial infarction.\n\n' +
      'Detailed clinical mechanisms and emergency catheterization triage protocols.';

    const file = new File([textContent], 'acute_coronary_syndrome.txt', {
      type: 'text/plain',
    });

    const result = await parseWordDocument(file);

    expect(result.title).toBe('Acute Coronary Syndrome');
    expect(result.summary).toContain('Acute coronary syndromes represent');
    expect(result.contentHtml).toContain('<p>Acute Coronary Syndrome Clinical Pathways</p>');
    expect(result.wordCount).toBeGreaterThan(15);
  });
});

