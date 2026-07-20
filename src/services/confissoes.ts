import type { Confissao } from "@/types";
import { confissoes } from "@/data/confissoes";

export function getConfissoes(): Confissao[] {
  return confissoes;
}

export function getConfissaoById(id: string): Confissao | null {
  return confissoes.find((c) => c.id === id) ?? null;
}
