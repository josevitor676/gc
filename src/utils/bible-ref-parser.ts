import { BibleReference } from "../types";
import { BIBLE_ABBREV_MAP } from "../data/bible-abbreviations";

// Build regex from abbreviation keys, sorted longest first to avoid partial matches
const abbreviations = Object.keys(BIBLE_ABBREV_MAP)
  .sort((a, b) => b.length - a.length)
  .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  .join("|");

/**
 * Matches patterns like:
 * - Rm 5:1
 * - 1Jo 2:15-17
 * - Efésios 1:1-14
 * - Jo 15:16
 * - 2Ts 2:13
 * - 1 Pe 1:1-4
 * - Sl 55:5; Sl 58:3  (each matched separately)
 */
const BIBLE_REF_REGEX = new RegExp(
  `(${abbreviations})\\s*(\\d{1,3})\\s*[:\\.](\\s*\\d{1,3})(?:\\s*[-–]\\s*(\\d{1,3}))?`,
  "g"
);

export interface ParsedSegment {
  type: "text" | "reference";
  value: string;
  reference?: BibleReference;
}

export function parseBibleReferences(text: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  let lastIndex = 0;

  const regex = new RegExp(BIBLE_REF_REGEX.source, "g");
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Text before this match
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        value: text.slice(lastIndex, match.index),
      });
    }

    const bookAbbr = match[1];
    const chapter = parseInt(match[2], 10);
    const verseStart = parseInt(match[3].trim(), 10);
    const verseEnd = match[4] ? parseInt(match[4], 10) : undefined;

    const apiBook = BIBLE_ABBREV_MAP[bookAbbr];

    if (apiBook) {
      segments.push({
        type: "reference",
        value: match[0],
        reference: {
          raw: match[0],
          book: apiBook,
          bookAbbr,
          chapter,
          verseStart,
          verseEnd,
        },
      });

      // Detect continuation verse references in the same chapter: e.g. ", 15" or ", 17-20"
      // after a matched reference like "Salmos 86.8-10"
      let scanPos = match.index + match[0].length;
      const contPattern = /^\s*,\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?/;
      while (scanPos < text.length) {
        const contMatch = contPattern.exec(text.slice(scanPos));
        if (!contMatch) break;
        const afterCont = text.slice(scanPos + contMatch[0].length);
        // If followed by a letter (new book name) or . / : (new chapter.verse), not a continuation
        if (/^\s*[a-zA-ZÀ-ÿ]/.test(afterCont) || /^\s*[.:]/.test(afterCont)) break;

        const contVerseStart = parseInt(contMatch[1], 10);
        const contVerseEnd = contMatch[2] ? parseInt(contMatch[2], 10) : undefined;

        // Push a text segment for the comma separator
        const commaText = contMatch[0].slice(0, contMatch[0].indexOf(contMatch[1]));
        segments.push({ type: "text", value: commaText });

        const contRaw = `${bookAbbr} ${chapter}.${contVerseStart}${contVerseEnd ? `-${contVerseEnd}` : ""}`;
        segments.push({
          type: "reference",
          value: contRaw,
          reference: {
            raw: contRaw,
            book: apiBook,
            bookAbbr,
            chapter,
            verseStart: contVerseStart,
            verseEnd: contVerseEnd,
          },
        });

        scanPos += contMatch[0].length;
      }

      lastIndex = scanPos;
      regex.lastIndex = scanPos;
    } else {
      segments.push({ type: "text", value: match[0] });
      lastIndex = match.index + match[0].length;
    }
  }

  // Trailing text
  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments;
}
