import { PDFDocument } from "pdf-lib";
import type { PDFMetadata } from "../types";

export async function setMetadata(pdfBuffer: Buffer, metadata: PDFMetadata): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);

  if (metadata.title) pdfDoc.setTitle(metadata.title);
  if (metadata.author) pdfDoc.setAuthor(metadata.author);
  if (metadata.subject) pdfDoc.setSubject(metadata.subject);
  if (metadata.keywords) pdfDoc.setKeywords(metadata.keywords);
  if (metadata.creator) pdfDoc.setCreator(metadata.creator);
  if (metadata.producer) pdfDoc.setProducer(metadata.producer);

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
