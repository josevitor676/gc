"use client";

import { FormEvent, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  onNovoPedido: () => Promise<void>;
}

export default function FormPedidoOracao({ onNovoPedido }: Props) {
  const { colors } = useTheme();
  const [solicitante, setSolicitante] = useState("");
  const [pedido, setPedido] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEnviando(true);
    setMensagem(null);

    try {
      const res = await fetch("/api/pedidos-oracao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solicitante, pedido }),
      });

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        setMensagem(err.error ?? "Falha ao enviar pedido.");
        return;
      }

      setMensagem("Pedido enviado com sucesso. Estaremos orando por voce.");
      setSolicitante("");
      setPedido("");
      await onNovoPedido();
    } catch {
      setMensagem("Falha de rede ao enviar pedido.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-4 mt-4"
      style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
    >
      <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
        Compartilhe um pedido
      </h2>

      <label className="block text-sm mt-4" style={{ color: colors.textSecondary }} htmlFor="solicitante">
        Nome (opcional)
      </label>
      <input
        id="solicitante"
        type="text"
        value={solicitante}
        onChange={(e) => setSolicitante(e.target.value)}
        className="w-full rounded-lg px-3 py-2 text-sm mt-1"
        style={{ backgroundColor: colors.surfaceAlt, color: colors.text }}
        maxLength={60}
        placeholder="Como prefere ser chamado"
      />

      <label className="block text-sm mt-4" style={{ color: colors.textSecondary }} htmlFor="pedido">
        Pedido de oração
      </label>
      <textarea
        id="pedido"
        value={pedido}
        onChange={(e) => setPedido(e.target.value)}
        className="w-full rounded-lg px-3 py-2 text-sm mt-1"
        style={{ backgroundColor: colors.surfaceAlt, color: colors.text }}
        rows={4}
        minLength={10}
        maxLength={500}
        required
        placeholder="Descreva seu pedido (10 a 500 caracteres)"
      />

      <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
        {pedido.trim().length}/500
      </p>

      {mensagem ? (
        <p className="text-sm mt-3" role="alert" style={{ color: colors.textSecondary }}>
          {mensagem}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={enviando || pedido.trim().length < 10}
        className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
        style={{ backgroundColor: colors.primary, color: "#fff" }}
      >
        {enviando ? "Enviando..." : "Enviar pedido"}
      </button>
    </form>
  );
}
