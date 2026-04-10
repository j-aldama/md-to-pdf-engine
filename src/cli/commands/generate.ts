import { Command } from "commander";
import { resolve, dirname, basename, extname, join, relative } from "path";
import { readFileSync, writeFileSync, existsSync, statSync, renameSync } from "fs";
import { randomBytes } from "crypto";
import fastGlob from "fast-glob";
import { PDFDocument } from "pdf-lib";
import { generatePDFFromMarkdown, launchBrowser } from "../../pdf-engine";
import { getTemplateById, DEFAULT_TEMPLATE } from "../../templates";
import { postProcess } from "../../post-process";
import { loadConfig, mergeOptions } from "../config";
import { createLogger } from "../logger";
import type { PDFOptions, PostProcessOptions, ResolvedOptions } from "../../types";

function buildPDFOptions(opts: ResolvedOptions, template: { margins: { top: number; bottom: number; left: number; right: number } }): PDFOptions {
  return {
    pageSize: opts.pageSize,
    orientation: opts.orientation,
    margins: opts.margins ?? template.margins,
    includeCoverPage: opts.includeCoverPage,
    includePageNumbers: opts.includePageNumbers,
    pageNumberFormat: opts.pageNumberFormat,
  };
}

function buildPostProcessOptions(opts: ResolvedOptions): PostProcessOptions {
  const ppOpts: PostProcessOptions = {};

  if (opts.title || opts.author || opts.subject || opts.keywords) {
    ppOpts.metadata = {
      title: opts.title,
      author: opts.author,
      subject: opts.subject,
      keywords: opts.keywords,
      creator: "md-to-pdf-engine",
    };
  }

  if (opts.watermarkPath) {
    ppOpts.watermark = {
      imagePath: resolve(opts.watermarkPath),
      opacity: opts.watermarkOpacity ?? 0.3,
    };
  }

  if (opts.encrypt && opts.password) {
    ppOpts.encrypt = { password: opts.password };
  }

  return ppOpts;
}

function resolveOutputPath(inputFile: string, output?: string, outputDir?: string, baseDir?: string): string {
  if (output) return resolve(output);

  const name = basename(inputFile, extname(inputFile));

  if (outputDir) {
    const relDir = baseDir ? relative(baseDir, dirname(inputFile)) : "";
    return resolve(outputDir, relDir, `${name}.pdf`);
  }

  return join(dirname(inputFile), `${name}.pdf`);
}

function safeWrite(outputPath: string, buffer: Buffer, overwrite: boolean): void {
  if (existsSync(outputPath) && !overwrite) {
    throw new Error(`Output file exists: ${outputPath}. Use --overwrite to replace.`);
  }

  const dir = dirname(outputPath);
  if (!existsSync(dir)) {
    const { mkdirSync } = require("fs");
    mkdirSync(dir, { recursive: true });
  }

  const tmpPath = `${outputPath}.tmp-${randomBytes(4).toString("hex")}`;
  writeFileSync(tmpPath, buffer);
  renameSync(tmpPath, outputPath);
}

export function createGenerateCommand(): Command {
  return new Command("generate")
    .description("Generate PDF from Markdown file(s)")
    .argument("<input>", "Markdown file or directory")
    .option("-o, --output <path>", "Output PDF path")
    .option("--output-dir <dir>", "Output directory for batch processing")
    .option("-r, --recursive", "Recursively find .md files in directory")
    .option("-t, --template <id>", "Template ID")
    .option("--size <size>", "Page size: A4 | Letter | Legal")
    .option("--orientation <o>", "portrait | landscape")
    .option("--cover", "Include cover page")
    .option("--no-page-numbers", "Disable page numbers")
    .option("--title <title>", "PDF title metadata")
    .option("--author <author>", "PDF author metadata")
    .option("--subject <subject>", "PDF subject metadata")
    .option("--keywords <words>", "PDF keywords (comma-separated)")
    .option("--watermark <path>", "Watermark image path (PNG or JPG)")
    .option("--watermark-opacity <n>", "Watermark opacity 0-1 (default: 0.3)", parseFloat)
    .option("--encrypt", "Encrypt the output PDF")
    .option("--password <pass>", "Encryption password")
    .option("--stdout", "Write PDF to stdout instead of file")
    .option("--overwrite", "Overwrite output file without warning")
    .option("--verbose", "Verbose output")
    .option("--quiet", "Suppress non-error output")
    .action(async (input: string, cmdOpts) => {
      const logLevel = cmdOpts.verbose ? "verbose" as const : cmdOpts.quiet ? "quiet" as const : "normal" as const;
      const logger = createLogger(logLevel);

      const configFile = await loadConfig();
      if (configFile) logger.verbose("Loaded config file");

      const cliFlags: Partial<ResolvedOptions> = {};
      if (cmdOpts.template) cliFlags.templateId = cmdOpts.template;
      if (cmdOpts.size) cliFlags.pageSize = cmdOpts.size;
      if (cmdOpts.orientation) cliFlags.orientation = cmdOpts.orientation;
      if (cmdOpts.cover) cliFlags.includeCoverPage = true;
      if (cmdOpts.pageNumbers === false) cliFlags.includePageNumbers = false;
      if (cmdOpts.title) cliFlags.title = cmdOpts.title;
      if (cmdOpts.author) cliFlags.author = cmdOpts.author;
      if (cmdOpts.subject) cliFlags.subject = cmdOpts.subject;
      if (cmdOpts.keywords) cliFlags.keywords = cmdOpts.keywords.split(",").map((k: string) => k.trim());
      if (cmdOpts.watermark) cliFlags.watermarkPath = cmdOpts.watermark;
      if (cmdOpts.watermarkOpacity !== undefined) cliFlags.watermarkOpacity = cmdOpts.watermarkOpacity;
      if (cmdOpts.encrypt) cliFlags.encrypt = true;
      if (cmdOpts.password) cliFlags.password = cmdOpts.password;
      if (cmdOpts.stdout) cliFlags.stdout = true;
      if (cmdOpts.overwrite) cliFlags.overwrite = true;
      if (cmdOpts.outputDir) cliFlags.outputDir = cmdOpts.outputDir;
      if (cmdOpts.recursive) cliFlags.recursive = true;

      const opts = mergeOptions(cliFlags, configFile);

      const resolvedInput = resolve(input);
      let inputFiles: string[];
      let baseDir: string | undefined;

      if (existsSync(resolvedInput) && statSync(resolvedInput).isDirectory()) {
        baseDir = resolvedInput;
        const pattern = opts.recursive ? "**/*.md" : "*.md";
        inputFiles = await fastGlob(pattern, { cwd: resolvedInput, absolute: true });
        if (inputFiles.length === 0) {
          logger.warn(`No .md files found in ${resolvedInput}`);
          return;
        }
        logger.info(`Found ${inputFiles.length} Markdown file(s)`);
      } else if (existsSync(resolvedInput)) {
        inputFiles = [resolvedInput];
      } else {
        logger.error(`File not found: ${resolvedInput}`);
        process.exit(1);
      }

      const template = getTemplateById(opts.templateId) ?? DEFAULT_TEMPLATE;
      if (opts.templateId && !getTemplateById(opts.templateId)) {
        logger.warn(`Template "${opts.templateId}" not found, using "${template.id}"`);
      }

      const effectiveTemplate = opts.logoUrl
        ? { ...template, logoUrl: opts.logoUrl }
        : template;

      const pdfOptions = buildPDFOptions(opts, effectiveTemplate);
      const ppOptions = buildPostProcessOptions(opts);

      const isBatch = inputFiles.length > 1;
      const browser = isBatch ? await launchBrowser() : undefined;
      if (browser) logger.verbose("Launched shared browser for batch processing");

      try {
        for (let i = 0; i < inputFiles.length; i++) {
          const file = inputFiles[i];
          const label = isBatch ? `[${i + 1}/${inputFiles.length}] ` : "";

          logger.info(`${label}Generating ${basename(file)}...`);
          logger.time("generation");

          const markdown = readFileSync(file, "utf-8");
          let buffer = await generatePDFFromMarkdown(markdown, effectiveTemplate, pdfOptions, browser, logger);
          buffer = await postProcess(buffer, ppOptions, logger);

          const pageCount = (await PDFDocument.load(buffer)).getPageCount();
          const elapsed = logger.timeEnd("generation");

          if (opts.stdout && !isBatch) {
            process.stdout.write(buffer);
          } else {
            const outputPath = resolveOutputPath(file, isBatch ? undefined : cmdOpts.output, opts.outputDir, baseDir);
            safeWrite(outputPath, buffer, opts.overwrite ?? false);

            const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
            logger.info(`${label}${outputPath} (${pageCount} pages, ${sizeMB} MB${elapsed ? `, ${elapsed}` : ""})`);
          }
        }
      } finally {
        if (browser) {
          await browser.close();
          logger.verbose("Closed shared browser");
        }
      }
    });
}
