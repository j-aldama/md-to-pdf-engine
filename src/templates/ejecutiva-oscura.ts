import type { TemplateConfig } from "../types";

/**
 * Ejecutiva Oscura — dark executive theme for status reports and
 * board-style documents. Deep navy background with a blue accent,
 * metric cards, status pills and colored progress bars.
 *
 * The logo is optional: leave `logoUrl` empty and no header logo is rendered,
 * so the template works for any company out of the box. Set `logoUrl`
 * (URL or base64 data URI) to brand the document.
 *
 * The richer visual components (cards, pills, colored bars, grouped rows)
 * are attached to this template's `id` inside pdf-styles.ts.
 */
export const ejecutivaOscura: TemplateConfig = {
  id: "ejecutiva-oscura",
  name: "Ejecutiva Oscura",
  logoUrl: "",
  logoPosition: "center",
  logoDisplay: "first-page",
  logoMaxSize: 80,
  colors: {
    primary: "#2e9bff", // accent blue — headings, key borders
    secondary: "#1c2942", // panel/border blue-gray
    accent: "#2e9bff", // links, bullets
    background: "#0e1726", // deep navy page background
    text: "#e6edf6", // light foreground text
  },
  fonts: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
  },
  // Full-bleed dark page: no white Puppeteer margins. Inner spacing is
  // handled by CSS padding so the dark background reaches every edge.
  margins: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
};
