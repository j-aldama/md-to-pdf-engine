// PDF Engine
export { generatePDFFromMarkdown, markdownToHTML } from "./pdf-engine";

// Styles
export { generatePDFStyles, generateHeaderHTML, generateFooterHTML } from "./pdf-styles";

// Templates
export {
  DEFAULT_TEMPLATE,
  getTemplateById,
  getAllTemplates,
  corporativaClasica,
  modernaMinimalista,
  tecnicaDocumentacion,
  modernaAzul,
  profesionalModerna,
} from "./templates";

// Types
export type { TemplateConfig, PDFOptions } from "./types";
