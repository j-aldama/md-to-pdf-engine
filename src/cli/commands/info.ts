import { Command } from "commander";
import { PDFDocument } from "pdf-lib";
import { readFileSync, statSync } from "fs";
import { resolve } from "path";

export function createInfoCommand(): Command {
  return new Command("info")
    .description("Show information about a PDF file")
    .argument("<file>", "PDF file to inspect")
    .action(async (file: string) => {
      const filePath = resolve(file);
      const buffer = readFileSync(filePath);
      const pdfDoc = await PDFDocument.load(buffer);
      const stat = statSync(filePath);

      const sizeMB = (stat.size / 1024 / 1024).toFixed(2);
      const sizeKB = (stat.size / 1024).toFixed(1);
      const sizeStr = stat.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;

      console.log(`File:       ${filePath}`);
      console.log(`Size:       ${sizeStr}`);
      console.log(`Pages:      ${pdfDoc.getPageCount()}`);
      console.log(`Title:      ${pdfDoc.getTitle() ?? "(none)"}`);
      console.log(`Author:     ${pdfDoc.getAuthor() ?? "(none)"}`);
      console.log(`Subject:    ${pdfDoc.getSubject() ?? "(none)"}`);
      console.log(`Keywords:   ${pdfDoc.getKeywords() ?? "(none)"}`);
      console.log(`Creator:    ${pdfDoc.getCreator() ?? "(none)"}`);
      console.log(`Producer:   ${pdfDoc.getProducer() ?? "(none)"}`);
      console.log(`Created:    ${pdfDoc.getCreationDate()?.toISOString() ?? "(none)"}`);
      console.log(`Modified:   ${pdfDoc.getModificationDate()?.toISOString() ?? "(none)"}`);
    });
}
