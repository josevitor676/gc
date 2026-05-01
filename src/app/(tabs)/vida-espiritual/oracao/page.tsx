"use client";

import { useCallback, useEffect, useState } from "react";
import FormPedidoOracao from "@/components/vida-espiritual/FormPedidoOracao";
import MuralOracao from "@/components/vida-espiritual/MuralOracao";
import { useTheme } from "@/contexts/ThemeContext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import type { PedidoOracao } from "@/types";

export default function OracaoPage() {
  const { colors } = useTheme();
  const isOnline = useOnlineStatus();
  const [pedidos, setPedidos] = useState<PedidoOracao[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPedidos = useCallback(async () => {
    if (!isOnline) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/pedidos-oracao", { cache: "no-store" });
      if (!res.ok) throw new Error("Falha ao carregar pedidos");
      const data = (await res.json()) as PedidoOracao[];
      setPedidos(data);
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  useEffect(() => {
    void loadPedidos();
  }, [loadPedidos]);

  if (!isOnline) {
    return (
      <div className="px-5 py-8 max-w-2xl mx-auto md:max-w-3xl flex flex-col items-center justify-center text-center" style={{ minHeight: "60dvh" }}>
        <div className="text-5xl mb-5">📵</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
          Sem conexão
        </h2>
        <p className="text-sm leading-relaxed max-w-xs" style={{ color: colors.textSecondary }}>
          O Mural de Oração precisa de internet para carregar e enviar pedidos. Conecte-se e tente novamente.
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 py-8 max-w-2xl mx-auto md:max-w-3xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
          Mural de Oração
        </h1>
      </div>

      <p className="text-sm" style={{ color: colors.textSecondary }}>
        Envie seu pedido e ore tambem pelos demais.
      </p>

      <FormPedidoOracao onNovoPedido={loadPedidos} />
      <MuralOracao pedidos={pedidos} loading={loading} />
    </div>
  );
}
