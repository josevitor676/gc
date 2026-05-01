"use client";

import { useTheme } from "@/contexts/ThemeContext";
import type { DevocionalDiario } from "@/types";

interface Props {
  devocional: DevocionalDiario;
}

export default function DevocionalCard({ devocional }: Props) {
  const { colors } = useTheme();

  return (
    <article
      className="rounded-2xl p-5 shadow-md"
      style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
    >
      <p className="text-sm italic" style={{ color: colors.textSecondary }}>
        "{devocional.versiculo}"
      </p>
      <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
        - {devocional.referencia}
      </p>

      <h1 className="text-2xl font-bold mt-4" style={{ color: colors.text }}>
        {devocional.titulo}
      </h1>

      <section className="mt-5">
        <h2 className="text-base font-semibold" style={{ color: colors.text }}>
          Reflexao
        </h2>
        <p className="text-sm leading-7 mt-2" style={{ color: colors.textSecondary }}>
          {devocional.reflexao}
        </p>
      </section>

      <section className="mt-5">
        <h2 className="text-base font-semibold" style={{ color: colors.text }}>
          Aplicacao
        </h2>
        <p className="text-sm leading-7 mt-2" style={{ color: colors.textSecondary }}>
          {devocional.aplicacao}
        </p>
      </section>

      <section className="mt-5">
        <h2 className="text-base font-semibold" style={{ color: colors.text }}>
          Oração
        </h2>
        <p className="text-sm leading-7 mt-2" style={{ color: colors.textSecondary }}>
          {devocional.oracao}
        </p>
      </section>
    </article>
  );
}
