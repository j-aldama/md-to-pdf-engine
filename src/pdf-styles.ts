import type { TemplateConfig } from "./types";

/**
 * Generates the complete CSS for the HTML document rendered as PDF.
 * Styles are based on the template configuration (colors, fonts, margins).
 */
export function generatePDFStyles(template: TemplateConfig): string {
  const { colors, fonts } = template;

  const baseCss = `
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

  // Rich dark theme: extra rules attached to this template's id only.
  // Other templates are unaffected.
  if (template.id === "ejecutiva-oscura") {
    return baseCss + generateDarkExecutiveStyles(template);
  }

  return baseCss;
}

/**
 * Extra CSS for the "ejecutiva-oscura" template: full-bleed dark page,
 * metric cards, status pills, colored progress bars and grouped table rows.
 * Built to render the executive status-report layout on a dark background.
 */
function generateDarkExecutiveStyles(template: TemplateConfig): string {
  const { colors } = template;
  const panel = "#16223a"; // card / panel surface
  const panelBorder = "#243b5e"; // panel & table border
  const muted = "#8aa0bd"; // secondary / muted text
  const ok = "#22c55e"; // green — done / good
  const warn = "#f59e0b"; // amber — delay / pending
  const danger = "#ef4444"; // red — critical / blocker
  const info = "#38bdf8"; // cyan — in approval / dev

  return `
    /* ===== Ejecutiva Oscura — full-bleed dark page =====
       The dark background must reach every physical edge of the sheet.
       @page margin:0 removes the print margin; html/body paint the full
       page background; inner spacing lives on <main> so the fill bleeds. */
    @page {
      margin: 0;
      background-color: ${colors.background};
    }
    html {
      background-color: ${colors.background} !important;
    }
    body {
      background-color: ${colors.background} !important;
      color: ${colors.text};
      margin: 0;
      padding: 0;
      min-height: 100vh;
    }
    /* Inner page padding (page margins are 0 so the fill is full-bleed) */
    main {
      display: block;
      background-color: ${colors.background};
      padding: 20mm 16mm;
    }

    /* Headings on dark */
    h1 { color: ${colors.primary}; border-bottom: 2px solid ${colors.primary}; }
    h2 {
      color: ${colors.primary};
      border-bottom: 1px solid ${panelBorder};
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-size: 20pt;
    }
    h3, h4, h5, h6 { color: ${colors.text}; }
    strong { color: #ffffff; }
    em { color: ${muted}; }
    a { color: ${colors.accent}; }
    hr { border-top: 1px solid ${panelBorder}; }
    li::marker { color: ${colors.accent}; }

    /* ===== Tables on dark ===== */
    table {
      border: 1px solid ${panelBorder};
      border-radius: 8px;
      overflow: hidden;
      background-color: ${panel};
    }
    thead { background-color: #0f1d34; color: ${colors.primary}; }
    th {
      border: none;
      border-bottom: 1px solid ${panelBorder};
      text-transform: uppercase;
      letter-spacing: 0.03em;
      font-size: 9.5pt;
      color: ${colors.primary};
    }
    td {
      border: none;
      border-bottom: 1px solid ${panelBorder};
      color: ${colors.text};
      vertical-align: middle;
    }
    tbody tr:nth-child(even) { background-color: rgba(255, 255, 255, 0.02); }
    tbody tr:last-child td { border-bottom: none; }

    /* Group header rows (a bold cell as a section title inside a table,
       e.g. "**🎨 DEMO INTERACTIVO**" with the other cells empty). */
    tbody tr td strong:only-child { color: ${colors.primary}; }

    /* ===== Metric cards (header: 3-column single-row table) =====
       Add the .metric-cards class to that table in markdown to render the
       three header tiles (Inicio · Fase · Retraso) as cards. */
    .metric-cards, table.metric-cards { border: none; background: none; }
    .metric-cards thead { display: none; }
    .metric-cards td {
      background-color: ${panel};
      border: 1px solid ${panelBorder};
      border-left: 3px solid ${colors.primary};
      border-radius: 8px;
      text-align: center;
      padding: 14px 10px;
      font-size: 14pt;
    }

    /* ===== Status pills =====
       Inline code spans are used in the source as status badges
       (e.g. \`COMPLETADO\`, \`PENDIENTE\`). Render them as pills. */
    code {
      background-color: rgba(46, 155, 255, 0.12);
      color: ${colors.primary};
      border: 1px solid ${colors.primary}66;
      border-radius: 999px;
      padding: 2px 10px;
      font-family: Inter, sans-serif;
      font-size: 8.5pt;
      font-weight: 700;
      letter-spacing: 0.03em;
      white-space: nowrap;
    }
    /* Progress bars (unicode blocks) keep tight spacing */
    td code:only-child { letter-spacing: 0; }

    /* ===== Blockquotes / important notes ===== */
    blockquote {
      background-color: ${panel};
      border-left: 4px solid ${warn};
      color: ${colors.text};
      border-radius: 0 6px 6px 0;
    }
    blockquote strong { color: ${warn}; }

    /* ===== Semantic color helpers (opt-in via classes in markdown) ===== */
    .ok, .status-ok { color: ${ok}; border-color: ${ok}66; background-color: ${ok}1f; }
    .warn, .status-warn { color: ${warn}; border-color: ${warn}66; background-color: ${warn}1f; }
    .danger, .status-danger { color: ${danger}; border-color: ${danger}66; background-color: ${danger}1f; }
    .info, .status-info { color: ${info}; border-color: ${info}66; background-color: ${info}1f; }
    .bar-ok { color: ${ok}; }
    .bar-warn { color: ${warn}; }
    .bar-muted { color: ${muted}; }

    /* Footer line (italic confidential) */
    main > p > em:only-child { color: ${muted}; }
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
 * When `darkTheme` is true, the footer blends into a dark page background
 * (muted text, no light separator line) instead of the default light look.
 */
export function generateFooterHTML(
  pageNumberFormat: string,
  darkTheme = false,
): string {
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

  const footerColor = darkTheme ? "#8aa0bd" : "#666";
  const footerBorder = darkTheme ? "1px solid #243b5e" : "1px solid #e0e0e0";

  return `
    <div style="font-size: 9pt; color: ${footerColor}; text-align: center; width: 100%; padding-top: 5px; border-top: ${footerBorder};">
      ${content}
    </div>
  `;
}
