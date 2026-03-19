#!/usr/bin/env node
/**
 * CLI for generating PDF from a Markdown file.
 *
 * Usage:
 *   md-to-pdf <file.md> [options]
 *
 * Options:
 *   --template <id>       Template: corporativa-clasica | moderna-minimalista | tecnica-documentacion | moderna-azul | profesional-moderna
 *   --output <path>       Output PDF path (default: same name with .pdf)
 *   --size <size>         Page size: A4 | Letter | Legal (default: A4)
 *   --orientation <o>     Orientation: portrait | landscape (default: portrait)
 *   --cover               Include cover page
 *   --no-page-numbers     Disable page numbers
 *   --list-templates      List available templates
 */

import { resolve, dirname, basename, extname, join } from "path";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { generatePDFFromMarkdown } from "./pdf-engine";
import { getTemplateById, DEFAULT_TEMPLATE, getAllTemplates } from "./templates";
import type { PDFOptions } from "./types";

function printUsage(): void {
  console.log(`
md-to-pdf — Professional PDF generation from Markdown

Usage:
  md-to-pdf <file.md> [options]

Options:
  --template <id>       Template to use (default: corporativa-clasica)
  --output <path>       Output PDF path
  --size <size>         A4 | Letter | Legal (default: A4)
  --orientation <o>     portrait | landscape (default: portrait)
  --cover               Include cover page
  --no-page-numbers     Disable page numbers
  --list-templates      List available templates

Templates:
${getAllTemplates()
  .map((t) => `  - ${t.id} (${t.name})`)
  .join("\n")}
`);
}

function parseArgs(args: string[]): {
  inputFile: string;
  templateId: string;
  outputFile: string;
  pageSize: "A4" | "Letter" | "Legal";
  orientation: "portrait" | "landscape";
  includeCover: boolean;
  includePageNumbers: boolean;
} {
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printUsage();
    process.exit(0);
  }

  if (args.includes("--list-templates")) {
    console.log("Available templates:");
    for (const t of getAllTemplates()) {
      console.log(`  ${t.id} - ${t.name}`);
    }
    process.exit(0);
  }

  const inputFile = args[0];
  let templateId = "corporativa-clasica";
  let outputFile = "";
  let pageSize: "A4" | "Letter" | "Legal" = "A4";
  let orientation: "portrait" | "landscape" = "portrait";
  let includeCover = false;
  let includePageNumbers = true;

  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case "--template":
        templateId = args[++i];
        break;
      case "--output":
        outputFile = args[++i];
        break;
      case "--size":
        pageSize = args[++i] as "A4" | "Letter" | "Legal";
        break;
      case "--orientation":
        orientation = args[++i] as "portrait" | "landscape";
        break;
      case "--cover":
        includeCover = true;
        break;
      case "--no-page-numbers":
        includePageNumbers = false;
        break;
    }
  }

  if (!outputFile) {
    const dir = dirname(inputFile);
    const name = basename(inputFile, extname(inputFile));
    outputFile = join(dir, `${name}.pdf`);
  }

  return {
    inputFile: resolve(inputFile),
    templateId,
    outputFile: resolve(outputFile),
    pageSize,
    orientation,
    includeCover,
    includePageNumbers,
  };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const config = parseArgs(args);

  if (!existsSync(config.inputFile)) {
    console.error(`Error: file not found: ${config.inputFile}`);
    process.exit(1);
  }

  const template = getTemplateById(config.templateId) ?? DEFAULT_TEMPLATE;
  if (config.templateId && !getTemplateById(config.templateId)) {
    console.warn(
      `Warning: template "${config.templateId}" not found, using "${template.id}"`,
    );
  }

  const markdown = readFileSync(config.inputFile, "utf-8");

  const pdfOptions: PDFOptions = {
    pageSize: config.pageSize,
    orientation: config.orientation,
    margins: template.margins,
    includeCoverPage: config.includeCover,
    includePageNumbers: config.includePageNumbers,
    pageNumberFormat: "Página X de Y",
  };

  console.log(`Generating PDF...`);
  console.log(`  Input:       ${config.inputFile}`);
  console.log(`  Template:    ${template.name} (${template.id})`);
  console.log(`  Size:        ${config.pageSize} ${config.orientation}`);
  console.log(`  Cover page:  ${config.includeCover ? "Yes" : "No"}`);
  console.log(`  Page numbers: ${config.includePageNumbers ? "Yes" : "No"}`);

  const pdfBuffer = await generatePDFFromMarkdown(markdown, template, pdfOptions);

  writeFileSync(config.outputFile, pdfBuffer);

  const sizeMB = (pdfBuffer.length / 1024 / 1024).toFixed(2);
  console.log(`\nPDF generated: ${config.outputFile} (${sizeMB} MB)`);
}

main().catch((err) => {
  console.error("Error generating PDF:", err);
  process.exit(1);
});
