import type { BibleVerse } from "@/types";
import { BIBLE_BOOK_NAMES } from "@/data/bible-abbreviations";

const BASE_URL = "https://bible-api.com";
const FETCH_TIMEOUT_MS = 8_000;

function removeAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function isPositiveInt(n: number): boolean {
  return Number.isInteger(n) && n > 0;
}

function parseBibleApiVerse(v: unknown): BibleVerse | null {
  if (
    v !== null &&
    typeof v === "object" &&
    typeof (v as Record<string, unknown>).book_name === "string" &&
    typeof (v as Record<string, unknown>).chapter === "number" &&
    typeof (v as Record<string, unknown>).verse === "number" &&
    typeof (v as Record<string, unknown>).text === "string"
  ) {
    const record = v as { book_name: string; chapter: number; verse: number; text: string };
    return {
      book_name: record.book_name,
      chapter: record.chapter,
      verse: record.verse,
      text: record.text.trim(),
    };
  }
  return null;
}

export async function fetchVerses(
  book: string,
  chapter: number,
  verseStart: number,
  verseEnd?: number
): Promise<BibleVerse[]> {
  if (!(book in BIBLE_BOOK_NAMES)) {
    throw new Error("Referência bíblica inválida: livro desconhecido");
  }
  if (!isPositiveInt(chapter) || !isPositiveInt(verseStart)) {
    throw new Error("Referência bíblica inválida: capítulo/versículo inválido");
  }
  if (verseEnd !== undefined && (!isPositiveInt(verseEnd) || verseEnd < verseStart)) {
    throw new Error("Referência bíblica inválida: intervalo de versículos inválido");
  }

  const bookName = BIBLE_BOOK_NAMES[book]!;
  const bookSlug = removeAccents(bookName).toLowerCase();

  const ref =
    verseEnd && verseEnd !== verseStart
      ? `${bookSlug}+${chapter}:${verseStart}-${verseEnd}`
      : `${bookSlug}+${chapter}:${verseStart}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/${encodeURIComponent(ref)}?translation=almeida`, {
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) throw new Error(`Erro ao buscar passagem (${res.status})`);

  const data: unknown = await res.json();

  if (
    data !== null &&
    typeof data === "object" &&
    Array.isArray((data as Record<string, unknown>).verses)
  ) {
    const verses = ((data as Record<string, unknown>).verses as unknown[])
      .map(parseBibleApiVerse)
      .filter((v): v is BibleVerse => v !== null);
    if (verses.length > 0) return verses;
  }

  const single = parseBibleApiVerse(data);
  if (single) return [single];

  throw new Error("Resposta da API em formato inesperado");
}

export function formatReference(
  book: string,
  chapter: number,
  verseStart: number,
  verseEnd?: number
): string {
  const ref = `${book} ${chapter}:${verseStart}`;
  return verseEnd && verseEnd !== verseStart ? `${ref}-${verseEnd}` : ref;
}
