import type { TemplateConfig } from "./types";

/**
 * Generates the complete CSS for the HTML document rendered as PDF.
 * Styles are based on the template configuration (colors, fonts, margins).
 */
export function generatePDFStyles(template: TemplateConfig): string {
  const { colors, fonts } = template;

  return `
    /* Reset and base */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: ${fonts.body}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 12pt;
      line-height: 1.6;
      color: ${colors.text};
      background-color: ${colors.background};
    }

    /* Headings */
    h1, h2, h3, h4, h5, h6 {
      font-family: ${fonts.heading}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.3;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      page-break-after: avoid;
      break-after: avoid;
      orphans: 2;
      widows: 2;
    }

    h1 {
      font-size: 28pt;
      color: ${colors.primary};
      border-bottom: 2px solid ${colors.primary};
      padding-bottom: 0.3em;
      margin-top: 0;
    }

    h2 {
      font-size: 22pt;
      color: ${colors.primary};
      border-bottom: 1px solid ${colors.secondary};
      padding-bottom: 0.2em;
    }

    h3 { font-size: 18pt; color: ${colors.secondary}; }
    h4 { font-size: 15pt; color: ${colors.secondary}; }
    h5 { font-size: 13pt; color: ${colors.secondary}; }
    h6 { font-size: 12pt; color: ${colors.secondary}; font-style: italic; }

    /* Paragraphs and text */
    p {
      margin-bottom: 0.8em;
      orphans: 2;
      widows: 2;
      break-inside: avoid;
    }

    a { color: ${colors.accent}; text-decoration: underline; }
    strong { font-weight: 700; }
    em { font-style: italic; }

    /* Lists */
    ul, ol { margin-bottom: 1em; padding-left: 2em; }
    ul ul, ol ol, ul ol, ol ul { margin-bottom: 0; margin-top: 0.3em; }
    li { margin-bottom: 0.3em; page-break-inside: avoid; break-inside: avoid; }
    ul > li { list-style-type: disc; }
    ul > li > ul > li { list-style-type: circle; }
    ul > li > ul > li > ul > li { list-style-type: square; }
    li::marker { color: ${colors.accent}; }

    /* Tables */
    table { width: 100%; border-collapse: collapse; margin-bottom: 1.5em; page-break-inside: auto; }
    thead { background-color: ${colors.primary}; color: ${colors.background}; }
    th { font-weight: 700; text-align: left; padding: 10px 12px; border: 1px solid ${colors.secondary}; }
    td { padding: 8px 12px; border: 1px solid ${colors.secondary}; }
    tbody tr:nth-child(even) { background-color: rgba(0, 0, 0, 0.03); }
    tr { page-break-inside: avoid; }

    /* Code blocks */
    .code-block-wrapper { position: relative; margin-bottom: 1em; page-break-inside: avoid; }
    .code-lang-label {
      position: absolute; top: 0; right: 0;
      background-color: ${colors.secondary}20; color: ${colors.secondary};
      font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace;
      font-size: 8pt; padding: 2px 8px; border-radius: 0 6px 0 4px;
      text-transform: uppercase; letter-spacing: 0.03em; z-index: 1;
    }
    pre {
      background-color: ${colors.secondary}1a; border: 1px solid ${colors.secondary}40;
      border-radius: 6px; padding: 1em; margin-bottom: 0;
      overflow-x: visible; white-space: pre-wrap; word-wrap: break-word;
      overflow-wrap: break-word; font-size: 10pt; page-break-inside: avoid;
    }
    pre code { background: none; border: none; padding: 0; font-size: inherit; white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word; }
    code {
      font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace;
      background-color: #f0f0f0; border-radius: 3px; padding: 0.15em 0.3em; font-size: 0.9em;
    }

    /* Blockquotes */
    blockquote { border-left: 4px solid ${colors.primary}; background-color: rgba(0, 0, 0, 0.02); padding: 0.8em 1.2em; margin: 0 0 1em 0; color: ${colors.text}; }
    blockquote p { margin-bottom: 0.4em; }
    blockquote p:last-child { margin-bottom: 0; }

    /* Horizontal rule */
    hr { border: none; border-top: 2px solid ${colors.secondary}; margin: 2em 0; }

    /* Images */
    img { max-width: 100%; height: auto; }

    /* Pagination */
    .page-break { page-break-after: always; }
    .cover-page { page-break-after: always; break-after: page; }
    * { orphans: 2; widows: 2; }

    @media print {
      h1, h2, h3, h4, h5, h6 { page-break-after: avoid; break-after: avoid; orphans: 2; widows: 2; }
      p { page-break-inside: avoid; break-inside: avoid; }
      li { page-break-inside: avoid; break-inside: avoid; }
      pre, blockquote, figure { page-break-inside: avoid; break-inside: avoid; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; break-inside: avoid; }
      thead { display: table-header-group; }
      img { page-break-inside: avoid; break-inside: avoid; }
    }
  `;
}

/**
 * Generates the HTML header with logo for the document.
 */
export function generateHeaderHTML(template: TemplateConfig): string {
  if (!template.logoUrl) {
    return "";
  }

  const alignMap: Record<string, string> = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  };

  const justify = alignMap[template.logoPosition] ?? "flex-start";

  return `
    <div style="display: flex; justify-content: ${justify}; align-items: center; padding: 0 0 10px 0; border-bottom: 1px solid #e0e0e0; margin-bottom: 10px;">
      <img src="${template.logoUrl}" style="max-height: ${template.logoMaxSize}px; max-width: 200px;" alt="Logo" />
    </div>
  `;
}

/**
 * Generates the footer HTML with page number.
 */
export function generateFooterHTML(pageNumberFormat: string): string {
  let content: string;

  switch (pageNumberFormat) {
    case "X/Y":
      content = '<span class="pageNumber"></span>/<span class="totalPages"></span>';
      break;
    case "X":
      content = '<span class="pageNumber"></span>';
      break;
    case "Page X of Y":
      content = 'Page <span class="pageNumber"></span> of <span class="totalPages"></span>';
      break;
    case "Página X de Y":
    default:
      content = 'Página <span class="pageNumber"></span> de <span class="totalPages"></span>';
      break;
  }

  return `
    <div style="font-size: 9pt; color: #666; text-align: center; width: 100%; padding-top: 5px; border-top: 1px solid #e0e0e0;">
      ${content}
    </div>
  `;
}
