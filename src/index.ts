// PDF Engine
export { generatePDFFromMarkdown, markdownToHTML, launchBrowser } from "./pdf-engine";

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

// Post-processing
export { postProcess, setMetadata, applyWatermark, encryptPDF, isQpdfAvailable } from "./post-process";

// Types
export type {
  TemplateConfig,
  PDFOptions,
  PDFMetadata,
  PostProcessOptions,
  ConfigFile,
  ResolvedOptions,
} from "./types";
