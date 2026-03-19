import type { TemplateConfig } from "../types";
import { corporativaClasica } from "./corporativa-clasica";
import { modernaMinimalista } from "./moderna-minimalista";
import { tecnicaDocumentacion } from "./tecnica-documentacion";
import { modernaAzul } from "./moderna-azul";
import { profesionalModerna } from "./profesional-moderna";

export { corporativaClasica } from "./corporativa-clasica";
export { modernaMinimalista } from "./moderna-minimalista";
export { tecnicaDocumentacion } from "./tecnica-documentacion";
export { modernaAzul } from "./moderna-azul";
export { profesionalModerna } from "./profesional-moderna";

export const DEFAULT_TEMPLATE: TemplateConfig = corporativaClasica;

const templatesMap: Record<string, TemplateConfig> = {
  [corporativaClasica.id]: corporativaClasica,
  [modernaMinimalista.id]: modernaMinimalista,
  [tecnicaDocumentacion.id]: tecnicaDocumentacion,
  [modernaAzul.id]: modernaAzul,
  [profesionalModerna.id]: profesionalModerna,
};

export function getTemplateById(id: string): TemplateConfig | undefined {
  return templatesMap[id];
}

export function getAllTemplates(): TemplateConfig[] {
  return [
    corporativaClasica,
    modernaMinimalista,
    tecnicaDocumentacion,
    modernaAzul,
    profesionalModerna,
  ];
}
