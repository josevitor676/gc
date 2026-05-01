"use client";

import { useEffect, useState } from "react";
import DevocionalCard from "@/components/vida-espiritual/DevocionalCard";
import { useTheme } from "@/contexts/ThemeContext";
import type { DevocionalDiario } from "@/types";

interface DevocionalResponse {
  data: DevocionalDiario;
}

export default function DevocionalPage() {
  const { colors } = useTheme();
  const [devocional, setDevocional] = useState<DevocionalDiario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/devocional-hoje", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Nao foi possivel carregar o devocional do dia");
        }

        const payload = (await res.json()) as DevocionalResponse;
        setDevocional(payload.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro inesperado");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  return (
    <div className="px-5 py-8 max-w-2xl mx-auto md:max-w-3xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
          Devocional Diario
        </h1>
      </div>

      {loading ? <p style={{ color: colors.textMuted }}>Carregando devocional...</p> : null}
      {!loading && error ? <p style={{ color: colors.textMuted }}>{error}</p> : null}
      {!loading && !error && devocional ? <DevocionalCard devocional={devocional} /> : null}
    </div>
  );
}
