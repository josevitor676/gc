import type { LucideIcon } from "lucide-react";
import {
  Mail,
  BookText,
  Church,
  Home,
  Music,
  HelpCircle,
  Footprints,
} from "lucide-react";

export interface Categoria {
  key: string;
  label: string;
  icon: LucideIcon;
  cover: string; // cor forte (fundo da capa)
  tint: string; // cor clara (chip/badge)
  ink: string; // cor do texto sobre o tint
}

// Ordem de exibição dos filtros na home
export const CATEGORIAS: Categoria[] = [
  { key: "cartas", label: "Cartas", icon: Mail, cover: "#6D5BD0", tint: "#EEEDFE", ink: "#3C3489" },
  { key: "evangelhos", label: "Evangelhos", icon: BookText, cover: "#1D9E75", tint: "#E1F5EE", ink: "#085041" },
  { key: "igreja", label: "Igreja", icon: Church, cover: "#2F7ED1", tint: "#E6F1FB", ink: "#0C447C" },
  { key: "familia", label: "Família", icon: Home, cover: "#D85A30", tint: "#FAECE7", ink: "#712B13" },
  { key: "salmos", label: "Salmos", icon: Music, cover: "#C98A1E", tint: "#FAEEDA", ink: "#633806" },
  { key: "vida-crista", label: "Vida cristã", icon: Footprints, cover: "#C24E78", tint: "#FBEAF0", ink: "#72243E" },
  { key: "catecismo", label: "Catecismo", icon: HelpCircle, cover: "#639922", tint: "#EAF3DE", ink: "#27500A" },
];

const POR_ESTUDO: Record<string, string> = {
  efesios: "cartas",
  "catecismo-nova-cidade-1": "catecismo",
  "catecismo-nova-cidade-2": "catecismo",
  "catecismo-nova-cidade-3": "catecismo",
  "milagres-de-jesus": "evangelhos",
  "quem-e-jesus": "evangelhos",
  "proverbios-de-jesus": "evangelhos",
  "o-mestre-das-perguntas": "evangelhos",
  "uma-igreja-saudavel": "igreja",
  "uma-igreja-viva": "igreja",
  "vocacao-e-paixao": "igreja",
  "toda-familia-precisa-de-um-milagre": "familia",
  salmos: "salmos",
  "caminho-do-peregrino": "vida-crista",
};

const POR_CHAVE = new Map(CATEGORIAS.map((c) => [c.key, c]));
const FALLBACK = CATEGORIAS[0];

export function getCategoria(studyId: string): Categoria {
  const chave = POR_ESTUDO[studyId];
  return (chave && POR_CHAVE.get(chave)) || FALLBACK;
}
