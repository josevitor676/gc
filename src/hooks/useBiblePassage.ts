"use client";

import { useState, useCallback } from "react";
import type { BibleVerse, BibleReference } from "@/types";
import { fetchVerses } from "@/services/bible";
import { getCachedBibleVerses, cacheBibleVerses } from "@/services/storage";

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
        setVerses(JSON.parse(cached));
        setLoading(false);
        return;
      }

      const data = await fetchVerses(ref.book, ref.chapter, ref.verseStart, ref.verseEnd);
      setVerses(data);
      await cacheBibleVerses(cacheKey, JSON.stringify(data));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao carregar passagem";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setVerses([]);
    setError(null);
  }, []);

  return { verses, loading, error, loadPassage, clear };
}
