"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import VersiculoDoDiaCard from "@/components/vida-espiritual/VersiculoDoDia";
import { useStudies } from "@/hooks/useStudies";
import StudyCard from "@/components/StudyCard";
import { useTheme } from "@/contexts/ThemeContext";
import type { VersiculoDoDia } from "@/types";

export default function EstudosPage() {
  const { studies, loading, error } = useStudies();
  const { colors } = useTheme();
  const [versiculo, setVersiculo] = useState<VersiculoDoDia | null>(null);
  const [versiculoLoading, setVersiculoLoading] = useState(true);
  const [versiculoError, setVersiculoError] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  return (
    <div className="px-5 py-8 max-w-2xl mx-auto md:max-w-3xl">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: colors.textMuted }}>
          Bem-vindo ao
        </p>
        <h2 className="text-3xl font-extrabold mt-1 leading-tight" style={{ color: colors.text }}>
          Grupos de Crescimento IPVO
        </h2>
        <p className="text-sm mt-2" style={{ color: colors.textSecondary }}>
          Escolha um estudo para o seu GC
        </p>
      </div>

      {versiculoLoading ? (
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

      <Link
        href="/vida-espiritual/leitura"
        className="block rounded-2xl p-4 mb-6 shadow-md hover:shadow-lg transition-shadow"
        style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
          Recursos para crescimento
        </p>
        <h3 className="text-lg font-bold mt-1" style={{ color: colors.text }}>
          Plano de Leitura
        </h3>
        <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
          Acompanhe seu progresso no Novo Testamento em 30 dias.
        </p>
      </Link>

      {loading ? (
        <div
          className="flex justify-center mt-12"
          role="status"
          aria-label="Carregando estudos..."
        >
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: colors.primaryLight, borderTopColor: "transparent" }}
          />
        </div>
      ) : error ? (
        <div className="flex justify-center mt-12">
          <p className="text-sm text-center" style={{ color: colors.textMuted }}>
            {error}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {studies.map((study) => (
            <StudyCard key={study.id} study={study} />
          ))}
        </div>
      )}
    </div>
  );
}
