import type { PostProcessOptions } from "../types";
import type { Logger } from "../cli/logger";
import { setMetadata } from "./metadata";
import { applyWatermark } from "./watermark";
import { encryptPDF, isQpdfAvailable } from "./encrypt";

/**
 * Applies post-processing steps in order: metadata -> watermark -> encrypt.
 * Encrypt must be last because it makes the buffer opaque to further pdf-lib operations.
 */
export async function postProcess(
  pdfBuffer: Buffer,
  options: PostProcessOptions,
  logger?: Logger,
): Promise<Buffer> {
  let buffer = pdfBuffer;

  if (options.metadata) {
    logger?.verbose("Setting PDF metadata...");
    buffer = await setMetadata(buffer, options.metadata);
  }

  if (options.watermark) {
    logger?.verbose(`Applying watermark from ${options.watermark.imagePath}...`);
    buffer = await applyWatermark(buffer, options.watermark.imagePath, options.watermark.opacity);
  }

  if (options.encrypt) {
    if (!isQpdfAvailable()) {
      logger?.warn("qpdf not found — skipping encryption. Install qpdf to enable PDF encryption.");
    } else {
      logger?.verbose("Encrypting PDF...");
      buffer = encryptPDF(buffer, options.encrypt.password);
    }
  }

  return buffer;
}

export { setMetadata } from "./metadata";
export { applyWatermark } from "./watermark";
export { encryptPDF, isQpdfAvailable } from "./encrypt";
