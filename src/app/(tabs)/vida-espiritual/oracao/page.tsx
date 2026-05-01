"use client";

import { useCallback, useEffect, useState } from "react";
import FormPedidoOracao from "@/components/vida-espiritual/FormPedidoOracao";
import MuralOracao from "@/components/vida-espiritual/MuralOracao";
import { useTheme } from "@/contexts/ThemeContext";
import type { PedidoOracao } from "@/types";

export default function OracaoPage() {
  const { colors } = useTheme();
  const [pedidos, setPedidos] = useState<PedidoOracao[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPedidos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/pedidos-oracao", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Falha ao carregar pedidos");
      }

      const data = (await res.json()) as PedidoOracao[];
      setPedidos(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPedidos();
  }, [loadPedidos]);

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
