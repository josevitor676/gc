"use client";

import { useTheme } from "@/contexts/ThemeContext";
import type { PedidoOracao } from "@/types";

interface Props {
  pedidos: PedidoOracao[];
  loading?: boolean;
}

export default function MuralOracao({ pedidos, loading = false }: Props) {
  const { colors } = useTheme();

  if (loading) {
    return (
      <div className="rounded-2xl p-4 mt-4" style={{ backgroundColor: colors.card }}>
        <p className="text-sm" style={{ color: colors.textMuted }}>
          Carregando pedidos...
        </p>
      </div>
    );
  }

  if (pedidos.length === 0) {
    return (
      <div className="rounded-2xl p-4 mt-4" style={{ backgroundColor: colors.card }}>
        <p className="text-sm" style={{ color: colors.textMuted }}>
          Ainda nao ha pedidos ativos.
        </p>
      </div>
    );
  }

  return (
    <section className="mt-4 space-y-3">
      {pedidos.map((pedido) => (
        <article
          key={pedido.id}
          className="rounded-2xl p-4"
          style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
        >
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            {pedido.pedido}
          </p>

          <div className="mt-3 flex items-center justify-between text-xs" style={{ color: colors.textMuted }}>
            <span>{pedido.solicitante ?? "Anonimo"}</span>
            <span>{new Date(pedido.criadoEm).toLocaleDateString("pt-BR")}</span>
          </div>
        </article>
      ))}
    </section>
  );
}
