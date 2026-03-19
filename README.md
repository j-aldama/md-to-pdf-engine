# md-to-pdf-engine

Professional PDF generation from Markdown with customizable templates, syntax highlighting, and cover pages.

## Install

```bash
npm install -g md-to-pdf-engine
```

## CLI Usage

```bash
# Basic — generates PDF in the same directory
md-to-pdf document.md

# With template and cover page
md-to-pdf document.md --template profesional-moderna --cover

# Custom output path and page size
md-to-pdf document.md --output report.pdf --size Letter --orientation landscape

# List available templates
md-to-pdf --list-templates
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--template <id>` | Template to use | `corporativa-clasica` |
| `--output <path>` | Output PDF path | Same name with `.pdf` |
| `--size <size>` | `A4` \| `Letter` \| `Legal` | `A4` |
| `--orientation <o>` | `portrait` \| `landscape` | `portrait` |
| `--cover` | Include cover page (first H1) | off |
| `--no-page-numbers` | Disable page numbering | on |

### Templates

| ID | Name | Best for |
|----|------|----------|
| `corporativa-clasica` | Corporativa Clasica | Formal reports, proposals |
| `moderna-minimalista` | Moderna Minimalista | Clean presentations |
| `tecnica-documentacion` | Tecnica/Documentacion | Technical manuals, code docs |
| `moderna-azul` | Moderna Azul | Modern blue-themed documents |
| `profesional-moderna` | Profesional Moderna | Contemporary professional style |

## API Usage

```typescript
import { generatePDFFromMarkdown, getTemplateById } from "md-to-pdf-engine";
import type { PDFOptions } from "md-to-pdf-engine";
import { readFileSync, writeFileSync } from "fs";

const markdown = readFileSync("document.md", "utf-8");
const template = getTemplateById("tecnica-documentacion")!;

const options: PDFOptions = {
  pageSize: "A4",
  orientation: "portrait",
  margins: template.margins,
  includeCoverPage: true,
  includePageNumbers: true,
  pageNumberFormat: "Page X of Y",
};

const pdfBuffer = await generatePDFFromMarkdown(markdown, template, options);
writeFileSync("output.pdf", pdfBuffer);
```

## Features

- 5 built-in templates with customizable colors, fonts, and margins
- Syntax highlighting for code blocks (highlight.js)
- Cover page support (first H1 becomes cover)
- Page numbering with multiple formats
- Logo support (per-page or first-page only)
- GFM (GitHub Flavored Markdown) support
- Tables with styled headers and alternating rows
- Smart page breaks (avoids cutting content mid-element)
- A4, Letter, and Legal page sizes
- Portrait and landscape orientation

## Requirements

- Node.js >= 18
- Puppeteer (included as dependency — downloads Chromium automatically)

## License

MIT - Juan Ignacio Aldama
