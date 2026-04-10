import { Marked } from "marked";
import hljs from "highlight.js";
import puppeteer, { type Browser } from "puppeteer";
import { generatePDFStyles, generateHeaderHTML, generateFooterHTML } from "./pdf-styles";
import type { TemplateConfig, PDFOptions } from "./types";
import type { Logger } from "./cli/logger";

const PAGE_SIZE_MAP: Record<string, { width: string; height: string }> = {
  A4: { width: "210mm", height: "297mm" },
  Letter: { width: "8.5in", height: "11in" },
  Legal: { width: "8.5in", height: "14in" },
};

function getHighlightCSS(): string {
  return `
    .hljs { background: #f5f5f5; color: #24292e; }
    .hljs-comment, .hljs-quote { color: #6a737d; font-style: italic; }
    .hljs-keyword, .hljs-selector-tag, .hljs-addition { color: #d73a49; }
    .hljs-string, .hljs-meta .hljs-string, .hljs-regexp { color: #032f62; }
    .hljs-number, .hljs-literal, .hljs-variable, .hljs-template-variable, .hljs-tag .hljs-attr { color: #005cc5; }
    .hljs-type, .hljs-title, .hljs-section, .hljs-name, .hljs-selector-id, .hljs-selector-class { color: #6f42c1; }
    .hljs-attribute, .hljs-symbol, .hljs-bullet, .hljs-built_in, .hljs-link { color: #e36209; }
    .hljs-subst { color: #24292e; }
    .hljs-deletion { color: #b31d28; background-color: #ffeef0; }
    .hljs-emphasis { font-style: italic; }
    .hljs-strong { font-weight: bold; }
  `;
}

function createConfiguredMarked(): Marked {
  const marked = new Marked();

  const renderer = {
    code({ text, lang }: { text: string; lang?: string }): string {
      const language = lang && hljs.getLanguage(lang) ? lang : undefined;
      let highlighted: string;

      if (language) {
        highlighted = hljs.highlight(text, { language }).value;
      } else {
        highlighted = hljs.highlightAuto(text).value;
      }

      const langClass = language ? ` language-${language}` : "";
      const langLabel = language
        ? `<div class="code-lang-label">${language}</div>`
        : "";
      return `<div class="code-block-wrapper">${langLabel}<pre><code class="hljs${langClass}">${highlighted}</code></pre></div>\n`;
    },
  };

  marked.setOptions({ gfm: true, breaks: false });
  marked.use({ renderer });

  return marked;
}

function wrapCoverPage(htmlContent: string): string {
  const h1Regex = /(<h1[\s>])/i;
  const match = h1Regex.exec(htmlContent);

  if (!match || match.index === undefined) {
    return htmlContent;
  }

  const h1Index = match.index;
  const h1CloseIndex = htmlContent.indexOf("</h1>", h1Index);
  if (h1CloseIndex === -1) {
    return htmlContent;
  }

  const coverEnd = h1CloseIndex + "</h1>".length;
  const coverContent = htmlContent.slice(0, coverEnd);
  const restContent = htmlContent.slice(coverEnd);

  return `<div class="cover-page">${coverContent}</div>${restContent}`;
}

/**
 * Converts Markdown to full HTML with styles applied, ready for rendering.
 */
export function markdownToHTML(
  markdown: string,
  template: TemplateConfig,
  options?: { includeCoverPage?: boolean },
): string {
  const marked = createConfiguredMarked();
  let htmlContent = marked.parse(markdown) as string;
  const css = generatePDFStyles(template);
  const highlightCSS = getHighlightCSS();
  const headerHTML = generateHeaderHTML(template);

  if (options?.includeCoverPage) {
    htmlContent = wrapCoverPage(htmlContent);
  }

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>${css}</style>
  <style>${highlightCSS}</style>
</head>
<body>
  ${headerHTML}
  <main>${htmlContent}</main>
</body>
</html>`;
}

function buildFooterTextScript(format: string): string {
  switch (format) {
    case "X/Y":
      return `textEl.textContent = adjustedPage + '/' + adjustedTotal;`;
    case "X":
      return `textEl.textContent = String(adjustedPage);`;
    case "Page X of Y":
      return `textEl.textContent = 'Page ' + adjustedPage + ' of ' + adjustedTotal;`;
    case "Página X de Y":
    default:
      return `textEl.textContent = 'Página ' + adjustedPage + ' de ' + adjustedTotal;`;
  }
}

function buildFooterTemplate(
  options: PDFOptions,
  margins: { top: number; bottom: number; left: number; right: number },
): string {
  const baseFooter = generateFooterHTML(options.pageNumberFormat);

  if (options.includeCoverPage) {
    return `<div style="width: 100%; padding: 0 ${margins.left}mm 0 ${margins.right}mm;">
      <div id="footer-content" style="font-size: 9pt; color: #666; text-align: center; width: 100%; padding-top: 5px; border-top: 1px solid #e0e0e0;">
        <span id="footer-text"></span>
      </div>
      <script>
        try {
          var pageNum = parseInt(document.querySelector('.pageNumber')?.textContent || '0', 10);
          var totalPages = parseInt(document.querySelector('.totalPages')?.textContent || '0', 10);
          var footerEl = document.getElementById('footer-content');
          var textEl = document.getElementById('footer-text');
          if (pageNum <= 1) {
            footerEl.style.display = 'none';
          } else {
            var adjustedPage = pageNum - 1;
            var adjustedTotal = totalPages - 1;
            ${buildFooterTextScript(options.pageNumberFormat)}
          }
        } catch(e) {}
      </script>
      <span class="pageNumber" style="display:none;"></span>
      <span class="totalPages" style="display:none;"></span>
    </div>`;
  }

  return `<div style="width: 100%; padding: 0 ${margins.left}mm 0 ${margins.right}mm;">
    ${baseFooter}
  </div>`;
}

/**
 * Main PDF rendering engine.
 * Converts Markdown to PDF using Puppeteer with full visual hierarchy.
 *
 * @param externalBrowser - Optional shared browser instance for batch mode (avoids re-launching Chromium).
 * @param logger - Optional logger for verbose output.
 */
export async function generatePDFFromMarkdown(
  markdown: string,
  template: TemplateConfig,
  options: PDFOptions,
  externalBrowser?: Browser,
  logger?: Logger,
): Promise<Buffer> {
  const shouldClose = !externalBrowser;
  let browser: Browser | null = externalBrowser ?? null;

  try {
    const fullHTML = markdownToHTML(markdown, template, {
      includeCoverPage: options.includeCoverPage,
    });

    const margins = options.margins ?? template.margins;

    if (!browser) {
      logger?.verbose("Launching Puppeteer...");
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }

    const page = await browser.newPage();
    logger?.verbose("Rendering HTML content...");
    await page.setContent(fullHTML, { waitUntil: "networkidle0" });

    const pageSize = PAGE_SIZE_MAP[options.pageSize] ?? PAGE_SIZE_MAP["A4"];
    const isLandscape = options.orientation === "landscape";

    const logoJustify = template.logoPosition === "right"
      ? "flex-end"
      : template.logoPosition === "center"
        ? "center"
        : "flex-start";
    const logoMaxHeight = Math.min(template.logoMaxSize, 50);

    let headerTemplate: string;
    if (!template.logoUrl) {
      headerTemplate = '<div style="font-size: 1px;"></div>';
    } else if (template.logoDisplay === "first-page") {
      headerTemplate = `<div style="width: 100%; padding: 0 ${margins.left}mm 0 ${margins.right}mm;">
        <div id="header-logo" style="display: flex; justify-content: ${logoJustify}; padding: 5px 0;">
          <img src="${template.logoUrl}" style="max-height: ${logoMaxHeight}px;" />
        </div>
        <span class="pageNumber" style="display:none;"></span>
        <script>
          try {
            var pageNum = parseInt(document.querySelector('.pageNumber').textContent || '0', 10);
            if (pageNum > 1) {
              document.getElementById('header-logo').style.display = 'none';
            }
          } catch(e) {}
        </script>
      </div>`;
    } else {
      headerTemplate = `<div style="width: 100%; padding: 0 ${margins.left}mm 0 ${margins.right}mm;">
           <div style="display: flex; justify-content: ${logoJustify}; padding: 5px 0;">
             <img src="${template.logoUrl}" style="max-height: ${logoMaxHeight}px;" />
           </div>
         </div>`;
    }

    const footerTemplate = options.includePageNumbers
      ? buildFooterTemplate(options, margins)
      : '<div style="font-size: 1px;"></div>';

    logger?.verbose("Generating PDF...");
    const pdfBuffer = await page.pdf({
      width: pageSize.width,
      height: pageSize.height,
      landscape: isLandscape,
      printBackground: true,
      displayHeaderFooter: options.includePageNumbers || !!template.logoUrl,
      headerTemplate,
      footerTemplate,
      margin: {
        top: `${margins.top}mm`,
        bottom: `${margins.bottom}mm`,
        left: `${margins.left}mm`,
        right: `${margins.right}mm`,
      },
    });

    await page.close();

    if (shouldClose && browser) {
      await browser.close();
      browser = null;
    }

    return Buffer.from(pdfBuffer);
  } finally {
    if (shouldClose && browser) {
      try {
        await browser.close();
      } catch {
        // Ignore close error
      }
    }
  }
}

/**
 * Launch a shared Puppeteer browser for batch processing.
 */
export async function launchBrowser(): Promise<Browser> {
  return puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}
