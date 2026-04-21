"use client";

import { useState, useEffect } from "react";
import type { Study } from "@/types";
import { getStudies } from "@/services/studies";

export function useStudies() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setStudies(getStudies());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar estudos");
    } finally {
      setLoading(false);
    }
  }, []);

  return { studies, loading, error };
}
