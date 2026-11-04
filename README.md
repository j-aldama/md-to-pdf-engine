# md-to-pdf-engine

Professional PDF generation from Markdown with customizable templates, syntax highlighting, and cover pages.

## Install

```bash
npm install -g md-to-pdf-engine
```

## CLI Usage

### Generate (default command)

```bash
# Basic — generates PDF in the same directory
md-to-pdf document.md

# With template and cover page
md-to-pdf generate document.md --template profesional-moderna --cover

# Custom output path and page size
md-to-pdf generate document.md --output report.pdf --size Letter --orientation landscape

# With metadata
md-to-pdf generate document.md --title "My Report" --author "Juan Aldama"

# With watermark
md-to-pdf generate document.md --watermark logo.png --watermark-opacity 0.2

# Encrypt output
md-to-pdf generate document.md --encrypt --password mysecret

# Batch processing — all .md files in a directory
md-to-pdf generate docs/ -r --output-dir output/

# Output to stdout (for piping)
md-to-pdf generate document.md --stdout > output.pdf

# Verbose mode with timing
md-to-pdf generate document.md --verbose
```

### Merge

```bash
# Merge multiple Markdown files into one PDF
md-to-pdf merge intro.md chapter1.md chapter2.md -o book.pdf

# With cover page on first file
md-to-pdf merge intro.md chapter1.md -o book.pdf --cover --template moderna-azul
```

### List Templates

```bash
md-to-pdf list-templates
```

### Info

```bash
# Show PDF metadata and page count
md-to-pdf info output.pdf
```

### Generate Options

| Option | Description | Default |
|--------|-------------|---------|
| `-t, --template <id>` | Template to use | `corporativa-clasica` |
| `-o, --output <path>` | Output PDF path | Same name with `.pdf` |
| `--output-dir <dir>` | Output directory (batch mode) | Same as source |
| `-r, --recursive` | Find .md files recursively | off |
| `--size <size>` | `A4` \| `Letter` \| `Legal` | `A4` |
| `--orientation <o>` | `portrait` \| `landscape` | `portrait` |
| `--cover` | Include cover page (first H1) | off |
| `--no-page-numbers` | Disable page numbering | on |
| `--title <title>` | PDF title metadata | — |
| `--author <author>` | PDF author metadata | — |
| `--subject <subject>` | PDF subject metadata | — |
| `--keywords <words>` | PDF keywords (comma-separated) | — |
| `--watermark <path>` | Watermark image (PNG/JPG) | — |
| `--watermark-opacity <n>` | Watermark opacity (0-1) | `0.3` |
| `--encrypt` | Encrypt the output PDF | off |
| `--password <pass>` | Encryption password | — |
| `--stdout` | Write PDF to stdout | off |
| `--overwrite` | Overwrite existing output file | off |
| `--verbose` | Show detailed progress and timing | off |
| `--quiet` | Suppress non-error output | off |

### Templates

| ID | Name | Best for |
|----|------|----------|
| `corporativa-clasica` | Corporativa Clasica | Formal reports, proposals |
| `moderna-minimalista` | Moderna Minimalista | Clean presentations |
| `tecnica-documentacion` | Tecnica/Documentacion | Technical manuals, code docs |
| `moderna-azul` | Moderna Azul | Modern blue-themed documents |
| `profesional-moderna` | Profesional Moderna | Contemporary professional style |
| `ejecutiva-oscura` | Ejecutiva Oscura | Dark executive reports with cover, progress bars and Gantt |
| `manual-usuario` | Manual de Usuario | Printed end-user manuals with callouts and framed screenshots |

## Config File

Create a `.md-to-pdfrc.json` in your project root to avoid repeating CLI flags:

```json
{
  "template": "tecnica-documentacion",
  "size": "A4",
  "orientation": "portrait",
  "cover": true,
  "pageNumbers": true,
  "author": "My Company",
  "title": "Document Title"
}
```

Supported config files: `.md-to-pdfrc`, `.md-to-pdfrc.json`, `md-to-pdf.config.js`, `md-to-pdf.config.cjs`, or `md-to-pdf` key in `package.json`.

CLI flags always override config file values.

## API Usage

```typescript
import { generatePDFFromMarkdown, getTemplateById, postProcess } from "md-to-pdf-engine";
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

let pdfBuffer = await generatePDFFromMarkdown(markdown, template, options);

// Optional: add metadata and watermark
pdfBuffer = await postProcess(pdfBuffer, {
  metadata: { title: "My Document", author: "Juan Aldama" },
  watermark: { imagePath: "logo.png", opacity: 0.2 },
});

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
- PDF metadata (title, author, subject, keywords)
- Watermark overlay (PNG/JPG with configurable opacity)
- PDF encryption via qpdf (AES-256)
- Merge multiple Markdown files into one PDF
- Batch processing with recursive directory scanning
- Config file support (.md-to-pdfrc.json)
- Verbose mode with generation timing
- Safe write with atomic rename

## Requirements

- Node.js >= 18
- Puppeteer (included as dependency — downloads Chromium automatically)
- qpdf (optional — only needed for `--encrypt`)

## License

MIT - Juan Ignacio Aldama
