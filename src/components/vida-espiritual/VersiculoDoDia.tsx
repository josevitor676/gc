"use client";

import { useTheme } from "@/contexts/ThemeContext";
import type { VersiculoDoDia } from "@/types";

interface Props {
  versiculo: VersiculoDoDia;
}

export default function VersiculoDoDiaCard({ versiculo }: Props) {
  const { colors } = useTheme();

  return (
    <article
      className="rounded-2xl p-6 shadow-md"
      style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
    >
      <p className="text-xs uppercase tracking-wider" style={{ color: colors.textMuted }}>
        Versiculo do dia
      </p>

      <blockquote className="text-lg leading-8 mt-3" style={{ color: colors.text }}>
        "{versiculo.versiculo}"
      </blockquote>

      <p className="text-sm mt-3" style={{ color: colors.textSecondary }}>
        - {versiculo.referencia}
      </p>

      <p className="text-xs mt-2" style={{ color: colors.textMuted }}>
        Livro: {versiculo.livro}
      </p>
    </article>
  );
}
