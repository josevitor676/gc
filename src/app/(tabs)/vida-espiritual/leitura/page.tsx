"use client";

import { useEffect, useState } from "react";
import VersiculoDoDiaCard from "@/components/vida-espiritual/VersiculoDoDia";
import PlanoLeitura from "@/components/vida-espiritual/PlanoLeitura";
import { useTheme } from "@/contexts/ThemeContext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { PLANO_ID, PLANO_LEITURA_NT_30_DIAS } from "@/data/plano-leitura-novo-testamento";
import type { VersiculoDoDia } from "@/types";

export default function LeituraPage() {
  const { colors } = useTheme();
  const isOnline = useOnlineStatus();
  const [versiculo, setVersiculo] = useState<VersiculoDoDia | null>(null);
  const [versiculoLoading, setVersiculoLoading] = useState(true);
  const [versiculoError, setVersiculoError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOnline) {
      setVersiculoLoading(false);
      return;
    }

    async function loadVersiculo() {
      try {
        setVersiculoLoading(true);
        setVersiculoError(null);

        const res = await fetch("/api/versiculo-do-dia", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Nao foi possivel carregar o versiculo do dia");
        }

        const payload = (await res.json()) as { data: VersiculoDoDia };
        setVersiculo(payload.data);
      } catch (err) {
        setVersiculoError(err instanceof Error ? err.message : "Erro inesperado");
      } finally {
        setVersiculoLoading(false);
      }
    }

    void loadVersiculo();
  }, [isOnline]);

  return (
    <div className="px-5 py-8 max-w-2xl mx-auto md:max-w-3xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
          Plano de Leitura
        </h1>
      </div>

      {!isOnline ? (
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3 mb-4 text-sm"
          style={{ backgroundColor: colors.surfaceAlt, color: colors.textMuted }}
        >
          <span>📵</span>
          <span>Versículo do dia indisponível offline. Seu progresso de leitura está salvo.</span>
        </div>
      ) : versiculoLoading ? (
        <div
          className="flex justify-center mb-6"
          role="status"
          aria-label="Carregando versículo..."
        >
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: colors.primaryLight, borderTopColor: "transparent" }}
          />
        </div>
      ) : versiculoError ? null : versiculo ? (
        <div className="mb-6">
          <VersiculoDoDiaCard versiculo={versiculo} />
        </div>
      ) : null}

      <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
        O progresso fica salvo no seu dispositivo via localStorage.
      </p>

      <PlanoLeitura
        planoId={PLANO_ID}
        titulo="Novo Testamento em 30 dias"
        dias={PLANO_LEITURA_NT_30_DIAS}
      />
    </div>
  );
}
