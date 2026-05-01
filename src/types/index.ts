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

export interface Highlight {
  id: string;
  lessonId: string;
  blockIndex: number;
  startOffset: number;
  endOffset: number;
  color: string;
  createdAt: string;
}

export interface Annotation {
  id: string;
  highlightId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
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
}

export const HIGHLIGHT_COLORS = ["#FDE68A", "#BBF7D0", "#BAE6FD", "#FBCFE8"];
