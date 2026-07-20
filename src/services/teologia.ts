import type { DocumentoLeitura } from "@/types";
import { teologias } from "@/data/teologia";

export function getTeologias(): DocumentoLeitura[] {
  return teologias;
}

export function getTeologiaById(id: string): DocumentoLeitura | null {
  return teologias.find((t) => t.id === id) ?? null;
}
