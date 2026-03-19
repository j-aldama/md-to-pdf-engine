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
