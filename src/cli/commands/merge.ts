import { Command } from "commander";
import { resolve, basename } from "path";
import { readFileSync, existsSync } from "fs";
import { PDFDocument } from "pdf-lib";
import { generatePDFFromMarkdown, launchBrowser } from "../../pdf-engine";
import { getTemplateById, DEFAULT_TEMPLATE } from "../../templates";
import { postProcess } from "../../post-process";
import { loadConfig, mergeOptions } from "../config";
import { createLogger } from "../logger";
import type { PDFOptions, PostProcessOptions, ResolvedOptions } from "../../types";

async function mergePDFBuffers(buffers: Buffer[]): Promise<Buffer> {
  const mergedDoc = await PDFDocument.create();
  for (const buf of buffers) {
    const srcDoc = await PDFDocument.load(buf);
    const pages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
    for (const page of pages) {
      mergedDoc.addPage(page);
    }
  }
  const bytes = await mergedDoc.save();
  return Buffer.from(bytes);
}

export function createMergeCommand(): Command {
  return new Command("merge")
    .description("Merge multiple Markdown files into a single PDF")
    .argument("<files...>", "Markdown files to merge")
    .option("-o, --output <path>", "Output PDF path", "merged.pdf")
    .option("-t, --template <id>", "Template ID")
    .option("--size <size>", "Page size: A4 | Letter | Legal")
    .option("--orientation <o>", "portrait | landscape")
    .option("--cover", "Include cover page (first file only)")
    .option("--title <title>", "PDF title metadata")
    .option("--author <author>", "PDF author metadata")
    .option("--subject <subject>", "PDF subject metadata")
    .option("--keywords <words>", "PDF keywords (comma-separated)")
    .option("--watermark <path>", "Watermark image path (PNG or JPG)")
    .option("--watermark-opacity <n>", "Watermark opacity 0-1 (default: 0.3)", parseFloat)
    .option("--encrypt", "Encrypt the output PDF")
    .option("--password <pass>", "Encryption password")
    .option("--stdout", "Write PDF to stdout")
    .option("--overwrite", "Overwrite output file without warning")
    .option("--verbose", "Verbose output")
    .option("--quiet", "Suppress non-error output")
    .action(async (files: string[], cmdOpts) => {
      const logLevel = cmdOpts.verbose ? "verbose" as const : cmdOpts.quiet ? "quiet" as const : "normal" as const;
      const logger = createLogger(logLevel);

      const configFile = await loadConfig();
      const cliFlags: Partial<ResolvedOptions> = {};
      if (cmdOpts.template) cliFlags.templateId = cmdOpts.template;
      if (cmdOpts.size) cliFlags.pageSize = cmdOpts.size;
      if (cmdOpts.orientation) cliFlags.orientation = cmdOpts.orientation;
      if (cmdOpts.title) cliFlags.title = cmdOpts.title;
      if (cmdOpts.author) cliFlags.author = cmdOpts.author;
      if (cmdOpts.subject) cliFlags.subject = cmdOpts.subject;
      if (cmdOpts.keywords) cliFlags.keywords = cmdOpts.keywords.split(",").map((k: string) => k.trim());
      if (cmdOpts.watermark) cliFlags.watermarkPath = cmdOpts.watermark;
      if (cmdOpts.watermarkOpacity !== undefined) cliFlags.watermarkOpacity = cmdOpts.watermarkOpacity;
      if (cmdOpts.encrypt) cliFlags.encrypt = true;
      if (cmdOpts.password) cliFlags.password = cmdOpts.password;

      const opts = mergeOptions(cliFlags, configFile);
      const template = getTemplateById(opts.templateId) ?? DEFAULT_TEMPLATE;

      for (const file of files) {
        if (!existsSync(resolve(file))) {
          logger.error(`File not found: ${file}`);
          process.exit(1);
        }
      }

      logger.info(`Merging ${files.length} files...`);
      logger.time("merge");

      const browser = await launchBrowser();
      const pdfBuffers: Buffer[] = [];

      try {
        for (let i = 0; i < files.length; i++) {
          const file = resolve(files[i]);
          const markdown = readFileSync(file, "utf-8");

          const pdfOptions: PDFOptions = {
            pageSize: opts.pageSize,
            orientation: opts.orientation,
            margins: opts.margins ?? template.margins,
            includeCoverPage: cmdOpts.cover && i === 0,
            includePageNumbers: false,
            pageNumberFormat: opts.pageNumberFormat,
          };

          logger.verbose(`[${i + 1}/${files.length}] Generating ${basename(file)}...`);
          const buffer = await generatePDFFromMarkdown(markdown, template, pdfOptions, browser, logger);
          pdfBuffers.push(buffer);
        }
      } finally {
        await browser.close();
      }

      logger.verbose("Merging PDF buffers...");
      let mergedBuffer = await mergePDFBuffers(pdfBuffers);

      const ppOptions: PostProcessOptions = {};
      if (opts.title || opts.author || opts.subject || opts.keywords) {
        ppOptions.metadata = {
          title: opts.title,
          author: opts.author,
          subject: opts.subject,
          keywords: opts.keywords,
          creator: "md-to-pdf-engine",
        };
      }
      if (opts.watermarkPath) {
        ppOptions.watermark = { imagePath: resolve(opts.watermarkPath), opacity: opts.watermarkOpacity ?? 0.3 };
      }
      if (opts.encrypt && opts.password) {
        ppOptions.encrypt = { password: opts.password };
      }

      mergedBuffer = await postProcess(mergedBuffer, ppOptions, logger);

      const pageCount = (await PDFDocument.load(mergedBuffer)).getPageCount();
      const elapsed = logger.timeEnd("merge");

      if (cmdOpts.stdout) {
        process.stdout.write(mergedBuffer);
      } else {
        const outputPath = resolve(cmdOpts.output);
        if (existsSync(outputPath) && !cmdOpts.overwrite) {
          logger.error(`Output file exists: ${outputPath}. Use --overwrite to replace.`);
          process.exit(1);
        }
        const { writeFileSync: writeFile } = require("fs");
        writeFile(outputPath, mergedBuffer);
        const sizeMB = (mergedBuffer.length / 1024 / 1024).toFixed(2);
        logger.info(`Merged PDF: ${outputPath} (${pageCount} pages, ${sizeMB} MB${elapsed ? `, ${elapsed}` : ""})`);
      }
    });
}
