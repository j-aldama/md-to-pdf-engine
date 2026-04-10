import { lilconfig } from "lilconfig";
import type { ConfigFile, ResolvedOptions } from "../types";

const explorer = lilconfig("md-to-pdf", {
  searchPlaces: [
    ".md-to-pdfrc",
    ".md-to-pdfrc.json",
    "md-to-pdf.config.js",
    "md-to-pdf.config.cjs",
    "package.json",
  ],
});

export async function loadConfig(searchFrom?: string): Promise<ConfigFile | null> {
  const result = await explorer.search(searchFrom);
  if (!result || result.isEmpty) return null;
  return result.config as ConfigFile;
}

const DEFAULT_OPTIONS: ResolvedOptions = {
  pageSize: "A4",
  orientation: "portrait",
  margins: { top: 25, bottom: 25, left: 20, right: 20 },
  includeCoverPage: false,
  includePageNumbers: true,
  pageNumberFormat: "Página X de Y",
  templateId: "corporativa-clasica",
};

export function mergeOptions(
  cliFlags: Partial<ResolvedOptions>,
  configFile: ConfigFile | null,
): ResolvedOptions {
  const resolved: ResolvedOptions = { ...DEFAULT_OPTIONS };

  if (configFile) {
    if (configFile.template) resolved.templateId = configFile.template;
    if (configFile.size) resolved.pageSize = configFile.size;
    if (configFile.orientation) resolved.orientation = configFile.orientation;
    if (configFile.cover !== undefined) resolved.includeCoverPage = configFile.cover;
    if (configFile.pageNumbers !== undefined) resolved.includePageNumbers = configFile.pageNumbers;
    if (configFile.pageNumberFormat) resolved.pageNumberFormat = configFile.pageNumberFormat;
    if (configFile.author) resolved.author = configFile.author;
    if (configFile.title) resolved.title = configFile.title;
    if (configFile.subject) resolved.subject = configFile.subject;
    if (configFile.keywords) resolved.keywords = configFile.keywords;
    if (configFile.logoUrl) resolved.logoUrl = configFile.logoUrl;
    if (configFile.watermark) resolved.watermarkPath = configFile.watermark;
    if (configFile.watermarkOpacity !== undefined) resolved.watermarkOpacity = configFile.watermarkOpacity;
  }

  for (const [key, value] of Object.entries(cliFlags)) {
    if (value !== undefined) {
      (resolved as unknown as Record<string, unknown>)[key] = value;
    }
  }

  return resolved;
}
