export interface Study {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  coverImage?: string | null;
  introduction: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  studyId: string;
  order: number;
  title: string;
  bibleReference: string;
  content: ContentBlock[];
  reflectionQuestions: string[];
}

export type ContentBlockType =
  | "paragraph"
  | "heading"
  | "numbered_point"
  | "sub_point"
  | "bible_quote";

export interface ContentBlock {
  type: ContentBlockType;
  text: string;
  bold?: boolean;
  italic?: boolean;
}

export interface BibleReference {
  raw: string;
  book: string;
  bookAbbr: string;
  chapter: number;
  verseStart: number;
  verseEnd?: number;
}

export interface BibleVerse {
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface DevocionalDiario {
  id: number;
  data: string;
  versiculo: string;
  referencia: string;
  titulo: string;
  reflexao: string;
  aplicacao: string;
  oracao: string;
  criadoEm: string;
}

export interface VersiculoDoDia {
  id: number;
  data: string;
  versiculo: string;
  referencia: string;
  livro: string;
  criadoEm: string;
}

export interface PedidoOracao {
  id: number;
  solicitante: string | null;
  pedido: string;
  criadoEm: string;
  ativo: boolean;
  oracoes: number;
}

export interface BibliotecaPdfItem {
  id: number;
  titulo: string;
  descricao: string | null;
  nomeArquivo: string;
  tamanhoBytes: number;
  criadoEm: string;
}

// ── Confissões (símbolos de fé das igrejas reformadas) ──────
// Cada confissão é servida a partir de arquivos no repositório:
// - tipo "leitura": conteúdo estruturado em `secoes` (gerado por
//   scripts/pdf-to-confissao-json.ts a partir de PDFs com texto).
// - tipo "pdf": PDF escaneado exibido em visualizador; o arquivo fica
//   em public/confissoes/ e o nome vai em `arquivoPdf`.

export interface ConfissaoSecao {
  id: string;
  order: number;
  title: string;
  bibleReference?: string;
  content: ContentBlock[];
}

export interface Confissao {
  id: string;
  titulo: string;
  subtitulo: string;
  autor: string;
  ano: string;
  descricao: string;
  tipo: "leitura" | "pdf";
  arquivoPdf: string | null;
  secoes: ConfissaoSecao[];
}

// Confissões e Teologia reformada compartilham a mesma estrutura de documento
// (leitura estruturada ou visualizador de PDF) e o mesmo componente de leitura.
export type DocumentoLeitura = Confissao;
