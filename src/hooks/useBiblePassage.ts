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

  const loadPassage = useCallback(async (ref: BibleReference) => {
    setLoading(true);
    setError(null);

    const cacheKey = `${ref.book}-${ref.chapter}-${ref.verseStart}-${ref.verseEnd ?? ref.verseStart}`;

    try {
      const cached = await getCachedBibleVerses(cacheKey);
      if (cached) {
        try {
          setVerses(JSON.parse(cached) as BibleVerse[]);
          setLoading(false);
          return;
        } catch {
          // Cache corrompido — busca na rede
        }
      }

      const data = await fetchVerses(ref.book, ref.chapter, ref.verseStart, ref.verseEnd);
      setVerses(data);
      await cacheBibleVerses(cacheKey, JSON.stringify(data));
    } catch {
      // Fallback 1: dados estáticos pré-bundled
      const fallback = bundled[cacheKey];
      if (fallback && fallback.length > 0) {
        setVerses(fallback);
        // Armazena no IndexedDB para uso futuro enquanto online
        await cacheBibleVerses(cacheKey, JSON.stringify(fallback)).catch(() => {});
      } else {
        // Fallback 2: mensagem de erro amigável
        setError("Passagem não disponível offline. Abra o app com internet para carregar.");
      }
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
