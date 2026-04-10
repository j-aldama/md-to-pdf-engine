import { execFileSync } from "child_process";
import { writeFileSync, readFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { randomBytes } from "crypto";

export function isQpdfAvailable(): boolean {
  try {
    execFileSync("qpdf", ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function encryptPDF(pdfBuffer: Buffer, password: string): Buffer {
  const id = randomBytes(8).toString("hex");
  const tmpInput = join(tmpdir(), `md-to-pdf-in-${id}.pdf`);
  const tmpOutput = join(tmpdir(), `md-to-pdf-out-${id}.pdf`);

  try {
    writeFileSync(tmpInput, pdfBuffer);
    execFileSync("qpdf", [
      "--encrypt", password, password, "256", "--",
      tmpInput, tmpOutput,
    ]);
    return readFileSync(tmpOutput);
  } finally {
    try { unlinkSync(tmpInput); } catch { /* ignore */ }
    try { unlinkSync(tmpOutput); } catch { /* ignore */ }
  }
}
