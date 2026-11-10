import mammoth from 'mammoth';

export interface ParsedDocumentResult {
  title: string;
  summary: string;
  contentHtml: string;
  wordCount: number;
}

/**
 * Clean a file name into a human-readable title
 * e.g., "upper_limb_brachial_plexus-v2.docx" -> "Upper Limb Brachial Plexus"
 */
export function cleanFileNameToTitle(fileName: string): string {
  const withoutExt = fileName.replace(/\.[^/.]+$/, '');
  const withSpaces = withoutExt
    .replace(/[-_]+/g, ' ')
    .replace(/\bv\d+(\.\d+)?\b/gi, '')
    .trim();

  // Capitalize words
  return withSpaces
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Extract title from HTML content if an <h1> or <h2> exists
 */
function extractTitleFromHtml(html: string): string | null {
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match && h1Match[1]) {
    const clean = h1Match[1].replace(/<[^>]+>/g, '').trim();
    if (clean) return clean;
  }

  const h2Match = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  if (h2Match && h2Match[1]) {
    const clean = h2Match[1].replace(/<[^>]+>/g, '').trim();
    if (clean) return clean;
  }

  return null;
}

/**
 * Extract summary from HTML (first paragraph or summary block)
 */
function extractSummaryFromHtml(html: string): string {
  const pMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (pMatch && pMatch[1]) {
    const clean = pMatch[1].replace(/<[^>]+>/g, '').trim();
    if (clean.length > 300) {
      return clean.slice(0, 297) + '...';
    }
    return clean;
  }
  return '';
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === 'function') {
    return file.arrayBuffer();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

function readFileAsText(file: File): Promise<string> {
  if (typeof file.text === 'function') {
    return file.text();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * Parse an uploaded Word Document (.docx) or plain text/markdown document
 */
export async function parseWordDocument(file: File): Promise<ParsedDocumentResult> {
  const fileName = file.name;
  const isDocx = fileName.toLowerCase().endsWith('.docx');
  const isDoc = fileName.toLowerCase().endsWith('.doc');

  if (isDocx) {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const contentHtml = result.value || '';

    const textOnly = contentHtml.replace(/<[^>]+>/g, ' ').trim();
    const wordCount = textOnly ? textOnly.split(/\s+/).filter(Boolean).length : 0;

    const extractedTitle = extractTitleFromHtml(contentHtml);
    const title = extractedTitle || cleanFileNameToTitle(fileName);
    const summary = extractSummaryFromHtml(contentHtml);

    return {
      title,
      summary,
      contentHtml,
      wordCount,
    };
  }

  if (isDoc) {
    // For legacy .doc (binary Word), mammoth does not directly parse CFB/binary doc.
    // We try reading as arrayBuffer or text fallback
    try {
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const result = await mammoth.convertToHtml({ arrayBuffer });
      if (result.value && result.value.trim().length > 0) {
        const contentHtml = result.value;
        const textOnly = contentHtml.replace(/<[^>]+>/g, ' ').trim();
        return {
          title: extractTitleFromHtml(contentHtml) || cleanFileNameToTitle(fileName),
          summary: extractSummaryFromHtml(contentHtml),
          contentHtml,
          wordCount: textOnly ? textOnly.split(/\s+/).filter(Boolean).length : 0,
        };
      }
    } catch {
      // Fall through to text reader
    }
  }

  // Fallback for .txt or other text-based documents
  const text = await readFileAsText(file);
  const cleanTitle = cleanFileNameToTitle(fileName);
  const paragraphs = text
    .split(/\r?\n\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  let summary = '';
  if (paragraphs.length > 1) {
    const summaryPara = paragraphs.find((p) => /^(executive\s+summary|summary|overview|abstract)/i.test(p));
    if (summaryPara) {
      summary = summaryPara.replace(/^(executive\s+summary|summary|overview|abstract)[:\s-]*/i, '').trim();
    } else if (paragraphs[0].length < 80) {
      summary = paragraphs[1];
    } else {
      summary = paragraphs[0];
    }
  } else if (paragraphs.length === 1) {
    summary = paragraphs[0];
  }

  const contentHtml = paragraphs.map((p) => `<p>${p}</p>`).join('\n');
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return {
    title: cleanTitle,
    summary: summary.length > 300 ? summary.slice(0, 297) + '...' : summary,
    contentHtml,
    wordCount,
  };
}
