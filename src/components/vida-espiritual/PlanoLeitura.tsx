"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { calcularPercentual, getProgresso, marcarDia } from "@/lib/plano-leitura";
import type { DiaPlano } from "@/lib/plano-leitura";

interface Props {
  planoId: string;
  titulo: string;
  dias: DiaPlano[];
}

export default function PlanoLeitura({ planoId, titulo, dias }: Props) {
  const { colors } = useTheme();
  const [progresso, setProgresso] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setProgresso(getProgresso(planoId));
  }, [planoId]);

  const percentual = useMemo(() => calcularPercentual(progresso, dias.length), [progresso, dias.length]);

  function handleToggle(dia: number, lido: boolean) {
    const atualizado = marcarDia(planoId, dia, lido);
    setProgresso({ ...atualizado });
  }

  return (
    <section
      className="rounded-2xl p-4"
      style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
    >
      <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
        {titulo}
      </h2>

      <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
        Progresso: {percentual}%
      </p>

      <div className="mt-3 h-2 rounded-full" style={{ backgroundColor: colors.surfaceAlt }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percentual}%`, backgroundColor: colors.primary }}
        />
      </div>

      <ul className="mt-4 space-y-2">
        {dias.map((dia) => {
          const checked = Boolean(progresso[dia.dia]);

          return (
            <li
              key={dia.dia}
              className="rounded-xl p-3 flex items-start gap-3"
              style={{ backgroundColor: colors.surfaceAlt }}
            >
              <input
                type="checkbox"
                className="mt-1"
                checked={checked}
                onChange={(event) => handleToggle(dia.dia, event.target.checked)}
                aria-label={`Marcar dia ${dia.dia} como lido`}
              />

              <div className="min-w-0">
                <p className="text-sm font-semibold" style={{ color: colors.text }}>
                  Dia {dia.dia}: {dia.titulo}
                </p>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  {dia.referencia}
                </p>
                {dia.descricao ? (
                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                    {dia.descricao}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
