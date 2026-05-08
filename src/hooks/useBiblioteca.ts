"use client";

import { useEffect, useState } from "react";
import type { BibliotecaPdfItem } from "@/types";
import { listarBiblioteca } from "@/services/biblioteca";

export function useBiblioteca() {
  const [itens, setItens] = useState<BibliotecaPdfItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function carregar() {
    try {
      setError(null);
      const resposta = await listarBiblioteca();
      setItens(resposta);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar biblioteca");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void carregar();
  }, []);

  return {
    itens,
    loading,
    error,
    recarregar: carregar,
  };
}
