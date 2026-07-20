"use client";

import { useEffect, useState } from "react";
import { HandHeart } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import type { PedidoOracao } from "@/types";

interface Props {
  pedidos: PedidoOracao[];
  loading?: boolean;
}

const STORAGE_KEY = "oracao:pedidos-orados";

function getOrados(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is number => typeof v === "number") : [];
  } catch {
    return [];
  }
}

function saveOrados(ids: number[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // armazenamento indisponível — o botão ainda funciona, só não persiste
  }
}

function BotaoOrar({ pedido, orado, onOrar }: { pedido: PedidoOracao; orado: boolean; onOrar: (id: number) => void }) {
  const { colors } = useTheme();
  const [count, setCount] = useState(pedido.oracoes);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setCount(pedido.oracoes);
  }, [pedido.oracoes]);

  async function handleClick() {
    if (orado || sending) return;
    setSending(true);
    setCount((c) => c + 1);
    onOrar(pedido.id);
    try {
      const res = await fetch(`/api/pedidos-oracao/${pedido.id}/orar`, { method: "POST" });
      if (res.ok) {
        const atualizado = (await res.json()) as PedidoOracao;
        setCount(atualizado.oracoes);
      }
    } catch {
      // falha de rede: mantém o registro local; o contador sincroniza no próximo carregamento
    } finally {
      setSending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={orado || sending}
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:cursor-default"
      style={{
        backgroundColor: orado ? "#E1F5EE" : colors.surfaceAlt,
        color: orado ? "#085041" : colors.textSecondary,
      }}
      aria-label={orado ? "Você está orando por este pedido" : "Marcar que está orando por este pedido"}
    >
      <HandHeart size={14} />
      {orado ? "Orando" : "Estou orando"}
      {count > 0 && <span aria-label={`${count} pessoas orando`}>· {count}</span>}
    </button>
  );
}

export default function MuralOracao({ pedidos, loading = false }: Props) {
  const { colors } = useTheme();
  const [orados, setOrados] = useState<number[]>([]);

  useEffect(() => {
    setOrados(getOrados());
  }, []);

  function handleOrar(id: number) {
    setOrados((atual) => {
      if (atual.includes(id)) return atual;
      const atualizado = [...atual, id];
      saveOrados(atualizado);
      return atualizado;
    });
  }

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

          <div className="mt-3 flex items-center justify-between gap-2 text-xs" style={{ color: colors.textMuted }}>
            <div className="min-w-0">
              <span className="block truncate">{pedido.solicitante ?? "Anonimo"}</span>
              <span>{new Date(pedido.criadoEm).toLocaleDateString("pt-BR")}</span>
            </div>
            <BotaoOrar pedido={pedido} orado={orados.includes(pedido.id)} onOrar={handleOrar} />
          </div>
        </article>
      ))}
    </section>
  );
}
