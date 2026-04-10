import { PDFDocument } from "pdf-lib";
import { readFileSync } from "fs";
import { extname } from "path";

export async function applyWatermark(
  pdfBuffer: Buffer,
  imagePath: string,
  opacity: number = 0.3,
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const imageBytes = readFileSync(imagePath);
  const ext = extname(imagePath).toLowerCase();

  const image = ext === ".png"
    ? await pdfDoc.embedPng(imageBytes)
    : await pdfDoc.embedJpg(imageBytes);

  const pages = pdfDoc.getPages();
  for (const page of pages) {
    const { width, height } = page.getSize();
    const scaled = image.scaleToFit(width * 0.5, height * 0.5);
    page.drawImage(image, {
      x: (width - scaled.width) / 2,
      y: (height - scaled.height) / 2,
      width: scaled.width,
      height: scaled.height,
      opacity,
    });
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
