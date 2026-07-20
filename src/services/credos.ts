import type { DocumentoLeitura } from "@/types";
import { credos } from "@/data/credos";

export function getCredos(): DocumentoLeitura[] {
  return credos;
}

export function getCredoById(id: string): DocumentoLeitura | null {
  return credos.find((c) => c.id === id) ?? null;
}
