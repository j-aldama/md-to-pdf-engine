/** Template configuration for PDF generation */
export interface TemplateConfig {
  /** Template display name */
  name: string;
  /** Unique template identifier */
  id: string;
  /** URL or base64 of the company logo */
  logoUrl: string;
  /** Logo position in header */
  logoPosition: "left" | "center" | "right";
  /** Show logo on first page only or all pages */
  logoDisplay: "first-page" | "all-pages";
  /** Maximum logo size in pixels */
  logoMaxSize: number;
  /** Template colors */
  colors: {
    /** Primary color (h1-h2 headings, main borders) */
    primary: string;
    /** Secondary color (h3-h6 headings, table borders) */
    secondary: string;
    /** Accent color (links, bullets) */
    accent: string;
    /** Background color */
    background: string;
    /** Text color */
    text: string;
  };
  /** Fonts */
  fonts: {
    /** Heading font family */
    heading: string;
    /** Body text font family */
    body: string;
  };
  /** Page margins in mm */
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

/** PDF generation options */
export interface PDFOptions {
  /** Page size */
  pageSize: "A4" | "Letter" | "Legal";
  /** Page orientation */
  orientation: "portrait" | "landscape";
  /** Custom margins in mm */
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  /** Include cover page */
  includeCoverPage: boolean;
  /** Include page numbers */
  includePageNumbers: boolean;
  /** Page number format */
  pageNumberFormat: "Página X de Y" | "Page X of Y" | "X/Y" | "X";
}

/** Config file schema loaded from .md-to-pdfrc, .md-to-pdfrc.json, etc. */
export interface ConfigFile {
  template?: string;
  size?: "A4" | "Letter" | "Legal";
  orientation?: "portrait" | "landscape";
  cover?: boolean;
  pageNumbers?: boolean;
  pageNumberFormat?: "Página X de Y" | "Page X of Y" | "X/Y" | "X";
  author?: string;
  title?: string;
  subject?: string;
  keywords?: string[];
  logoUrl?: string;
  watermark?: string;
  watermarkOpacity?: number;
}

/** PDF metadata to embed in the document */
export interface PDFMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
  producer?: string;
}

/** Options for the post-processing pipeline */
export interface PostProcessOptions {
  metadata?: PDFMetadata;
  watermark?: { imagePath: string; opacity: number };
  encrypt?: { password: string };
}

/** Fully resolved options after merging CLI flags, config file, and defaults */
export interface ResolvedOptions {
  pageSize: "A4" | "Letter" | "Legal";
  orientation: "portrait" | "landscape";
  margins: { top: number; bottom: number; left: number; right: number };
  includeCoverPage: boolean;
  includePageNumbers: boolean;
  pageNumberFormat: "Página X de Y" | "Page X of Y" | "X/Y" | "X";
  templateId: string;
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  watermarkPath?: string;
  watermarkOpacity?: number;
  encrypt?: boolean;
  password?: string;
  stdout?: boolean;
  overwrite?: boolean;
  verbose?: boolean;
  quiet?: boolean;
  outputDir?: string;
  recursive?: boolean;
  logoUrl?: string;
}
