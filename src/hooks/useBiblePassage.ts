"use client";

import { useState, useCallback, useMemo } from "react";
import type { BibleVerse, BibleReference } from "@/types";
import { fetchVerses } from "@/services/bible";
import { getCachedBibleVerses, cacheBibleVerses } from "@/services/storage";
import staticPassages from "@/data/bible-passages.json";

const bundled = staticPassages as Record<string, BibleVerse[]>;

export function useBiblePassage() {
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPassage = useCallback(async (refs: BibleReference | BibleReference[]) => {
    setLoading(true);
    setError(null);

    const refList = Array.isArray(refs) ? refs : [refs];
    const combined: BibleVerse[] = [];

    try {
      for (const ref of refList) {
        const cacheKey = `${ref.book}-${ref.chapter}-${ref.verseStart}-${ref.verseEnd ?? ref.verseStart}`;

        let verses: BibleVerse[] | null = null;

        const cached = await getCachedBibleVerses(cacheKey);
        if (cached) {
          try {
            verses = JSON.parse(cached) as BibleVerse[];
          } catch {
            // Cache corrompido — busca na rede
          }
        }

        if (!verses) {
          try {
            verses = await fetchVerses(ref.book, ref.chapter, ref.verseStart, ref.verseEnd);
            await cacheBibleVerses(cacheKey, JSON.stringify(verses));
          } catch {
            // Fallback: dados estáticos pré-bundled
            const fallback = bundled[cacheKey];
            if (fallback && fallback.length > 0) {
              verses = fallback;
              await cacheBibleVerses(cacheKey, JSON.stringify(fallback)).catch(() => {});
            }
          }
        }

        if (verses) {
          combined.push(...verses);
        }
      }

      if (combined.length > 0) {
        setVerses(combined);
      } else {
        setError("Passagem não disponível offline. Abra o app com internet para carregar.");
      }
    } catch {
      setError("Passagem não disponível offline. Abra o app com internet para carregar.");
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setVerses([]);
    setError(null);
  }, []);

  return useMemo(
    () => ({ verses, loading, error, loadPassage, clear }),
    [verses, loading, error, loadPassage, clear]
  );
}
