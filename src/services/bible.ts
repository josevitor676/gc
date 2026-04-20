import type { BibleVerse } from "@/types";
import { BIBLE_BOOK_NAMES } from "@/data/bible-abbreviations";

const BASE_URL = "https://bible-api.com";

function removeAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export async function fetchVerses(
  book: string,
  chapter: number,
  verseStart: number,
  verseEnd?: number
): Promise<BibleVerse[]> {
  const bookName = BIBLE_BOOK_NAMES[book] ?? book;
  const bookSlug = removeAccents(bookName).toLowerCase();

  const ref =
    verseEnd && verseEnd !== verseStart
      ? `${bookSlug}+${chapter}:${verseStart}-${verseEnd}`
      : `${bookSlug}+${chapter}:${verseStart}`;

  const res = await fetch(`${BASE_URL}/${encodeURIComponent(ref)}?translation=almeida`);
  if (!res.ok) throw new Error(`Erro ao buscar passagem (${res.status})`);
  const data = await res.json();

  if (data.verses && Array.isArray(data.verses)) {
    return data.verses.map((v: { book_name: string; chapter: number; verse: number; text: string }) => ({
      book_name: v.book_name,
      chapter: v.chapter,
      verse: v.verse,
      text: v.text.trim(),
    }));
  }

  return [{
    book_name: data.book_name ?? bookName,
    chapter: data.chapter ?? chapter,
    verse: data.verse ?? verseStart,
    text: (data.text ?? "").trim(),
  }];
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
