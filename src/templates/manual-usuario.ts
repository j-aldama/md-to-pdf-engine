import type { TemplateConfig } from "../types";

/**
 * Plantilla genérica para MANUALES DE USUARIO (uno o varios clientes).
 *
 * Aporta los refinamientos de estilo de manual impreso (ancho de línea legible,
 * callouts destacados, tablas con aire, capturas encuadradas, jerarquía clara)
 * vía `generateManualStyles` en pdf-styles.ts, atado a este `id`.
 *
 * Los COLORES de abajo son el default (Navy/Red). Para otro cliente, pasá una
 * copia de esta config con sus colores de marca:
 *   primary   = títulos (azul/oscuro de marca)
 *   secondary = separadores/acentos (color del logo)
 *   accent    = enlaces/detalles (color de botones)
 */
export const manualUsuario: TemplateConfig = {
  id: "manual-usuario",
  name: "Manual de Usuario",
  logoUrl: "",
  logoPosition: "center",
  logoDisplay: "all-pages",
  logoMaxSize: 100,
  colors: {
    primary: "#1B2559",
    secondary: "#C8232C",
    accent: "#C8232C",
    background: "#FFFFFF",
    text: "#333333",
  },
  fonts: {
    heading: "Georgia, serif",
    body: "Garamond, serif",
  },
  margins: {
    top: 25,
    bottom: 25,
    left: 20,
    right: 20,
  },
};
