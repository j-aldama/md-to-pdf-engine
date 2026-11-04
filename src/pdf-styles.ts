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

  return `
    /* ===== Ejecutiva Oscura — full-bleed dark page =====
       The dark background must reach every physical edge of the sheet AND
       every page must have breathing room at the top/bottom. We keep a
       physical @page top/bottom margin (so every page — not just the first —
       has a top margin) while painting the full sheet (margin box included)
       with the dark background. Left/right padding lives on <main>. */
    @page {
      margin: 16mm 0;
      background-color: ${colors.background};
    }
    html {
      background-color: ${colors.background} !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      background-color: ${colors.background} !important;
      color: ${colors.text};
      margin: 0;
      padding: 0;
    }
    /* Horizontal inner padding only — vertical spacing comes from @page. */
    main {
      display: block;
      background-color: ${colors.background};
      padding: 0 16mm;
    }
    /* Avoid ugly mid-block page cuts. Long tables MAY split across pages
       (so they don't leave a big empty gap), but individual rows never split,
       the header repeats, and short blocks (notes, headings) stay together. */
    main table { page-break-inside: auto; break-inside: auto; }
    main thead { display: table-header-group; }
    main tr { page-break-inside: avoid; break-inside: avoid; }
    main h1, main h2, main h3 { page-break-after: avoid; break-after: avoid; }
    main blockquote { page-break-inside: avoid; break-inside: avoid; }

    /* ===== Cover page (Neurya-style) =====
       A <div class="cover-page"> at the top of the document becomes a full
       dark sheet with the title block centered. No page number on the cover
       (the footer script already hides it on page 1). */
    .cover-page {
      position: relative;
      page-break-after: always;
      break-after: page;
      min-height: 248mm; /* ~A4 height minus the 16mm top+bottom @page margin */
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      /* Radial+linear gradient (dark navy → deep black) like the brand cover.
         Negative margins + matching padding bleed the gradient to the page
         edges (the 16mm @page margin + 16mm <main> side padding). */
      margin: -16mm -16mm 0 -16mm;
      padding: 16mm 16mm 0 16mm;
      background:
        radial-gradient(120% 80% at 50% 38%, #1b2c4a 0%, #0e1726 46%, #070b13 100%);
    }
    .cover-page .cover-logo {
      max-height: 58px;
      max-width: 60%;
      margin-bottom: 16mm;
    }
    .cover-page h1 {
      border: none;
      font-size: 34pt;
      letter-spacing: 0.02em;
      margin: 0 0 4mm 0;
      color: #ffffff;
    }
    .cover-page .cover-subtitle {
      color: ${colors.primary};
      text-transform: uppercase;
      letter-spacing: 0.35em;
      font-size: 13pt;
      font-weight: 700;
      margin-bottom: 22mm;
    }
    /* The CLIENTE/PROYECTO/FECHA cards sit lower on the cover */
    .cover-page .cover-meta {
      display: flex;
      gap: 10mm;
      justify-content: center;
      flex-wrap: wrap;
      width: 100%;
    }
    .cover-page .cover-meta .cover-card {
      border-left: 3px solid ${colors.primary};
      background-color: ${panel};
      padding: 10px 18px;
      text-align: left;
      min-width: 48mm;
      border-radius: 4px;
    }
    .cover-page .cover-meta .cover-card .label {
      display: block;
      color: ${muted};
      text-transform: uppercase;
      letter-spacing: 0.18em;
      font-size: 7.5pt;
      margin-bottom: 3px;
    }
    .cover-page .cover-meta .cover-card .value {
      color: #ffffff;
      font-weight: 700;
      font-size: 11pt;
    }
    .cover-page .cover-confidential {
      margin-top: 24mm;
      color: ${muted};
      font-size: 8pt;
      letter-spacing: 0.1em;
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

    /* ===== Real progress bars =====
       A <span class="bar" data-pct="70"> … </span> in a table cell renders a
       proportional fill (not unicode blocks). Color by completion / state. */
    .bar {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      min-width: 90px;
    }
    .bar .track {
      flex: 1;
      height: 9px;
      background: #0c1525;
      border: 1px solid ${panelBorder};
      border-radius: 999px;
      overflow: hidden;
    }
    .bar .fill {
      display: block;
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, ${colors.primary}, #5ab0ff);
    }
    .bar.is-done .fill { background: linear-gradient(90deg, ${ok}, #34d27f); }
    .bar.is-warn .fill { background: linear-gradient(90deg, ${warn}, #fbbf4d); }
    .bar.is-blocked .fill { background: linear-gradient(90deg, ${danger}, #f06868); }
    .bar .pct {
      font-size: 8.5pt;
      font-weight: 700;
      color: ${muted};
      min-width: 30px;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }

    /* ===== Gantt with real horizontal bars =====
       Table where each phase row has month columns; the bar is an absolutely
       positioned element inside a .gantt-track cell spanning the active span. */
    table.gantt td, table.gantt th { text-align: center; }
    table.gantt td:first-child, table.gantt th:first-child { text-align: left; }
    table.gantt .phase { font-weight: 700; color: #fff; }
    table.gantt .phase small { display: block; color: ${muted}; font-weight: 400; font-size: 7.5pt; }
    table.gantt .gantt-cell { padding: 6px 4px; position: relative; }
    .gantt-bar {
      display: block;
      height: 12px;
      border-radius: 999px;
      background: ${colors.primary};
    }
    .gantt-bar.is-dev { background: ${colors.primary}; }
    .gantt-bar.is-done { background: ${ok}; }
    .gantt-bar.is-delay {
      background: repeating-linear-gradient(
        45deg, ${danger}, ${danger} 4px, #b23636 4px, #b23636 8px
      );
    }
    .gantt-bar.is-milestone {
      width: 12px; height: 12px; border-radius: 50%;
      background: ${ok}; margin: 0 auto;
    }
    .gantt-empty { color: #2a3a55; }

    /* ===== Blockquotes / important notes ===== */
    blockquote {
      background-color: ${panel};
      border-left: 4px solid ${warn};
      color: ${colors.text};
      border-radius: 0 6px 6px 0;
    }
    blockquote strong { color: ${warn}; }

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
