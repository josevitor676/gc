"use client";

import { useEffect, useState } from "react";
import DevocionalCard from "@/components/vida-espiritual/DevocionalCard";
import { useTheme } from "@/contexts/ThemeContext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import type { DevocionalDiario } from "@/types";

interface DevocionalResponse {
  data: DevocionalDiario;
}

const CACHE_KEY = "devocional-cache";

function saveCache(data: DevocionalDiario) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch { /* noop */ }
}

function loadCache(): DevocionalDiario | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as DevocionalDiario) : null;
  } catch { return null; }
}

export default function DevocionalPage() {
  const { colors } = useTheme();
  const isOnline = useOnlineStatus();
  const [devocional, setDevocional] = useState<DevocionalDiario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    async function load() {
      if (!isOnline) {
        const cached = loadCache();
        setDevocional(cached);
        setFromCache(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setFromCache(false);

        const res = await fetch("/api/devocional-hoje", { cache: "no-store" });
        if (!res.ok) throw new Error("Nao foi possivel carregar o devocional do dia");

        const payload = (await res.json()) as DevocionalResponse;
        setDevocional(payload.data);
        saveCache(payload.data);
      } catch (err) {
        const cached = loadCache();
        if (cached) {
          setDevocional(cached);
          setFromCache(true);
        } else {
          setError(err instanceof Error ? err.message : "Erro inesperado");
        }
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [isOnline]);

  return (
    <div className="px-5 py-8 max-w-2xl mx-auto md:max-w-3xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
          Devocional Diário
        </h1>
      </div>

      {!isOnline && (
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3 mb-4 text-sm"
          style={{ backgroundColor: colors.surfaceAlt, color: colors.textMuted }}
        >
          <span>📵</span>
          <span>{fromCache && devocional ? "Exibindo devocional salvo — você está offline." : "Você está offline."}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center mt-12" role="status" aria-label="Carregando devocional...">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: colors.primaryLight, borderTopColor: "transparent" }}
          />
        </div>
      ) : error ? (
        <p style={{ color: colors.textMuted }}>{error}</p>
      ) : devocional ? (
        <DevocionalCard devocional={devocional} />
      ) : (
        <p style={{ color: colors.textMuted }}>Nenhum devocional disponível.</p>
      )}
    </div>
  );
}
