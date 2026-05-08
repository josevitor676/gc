"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { FileText, LibraryBig } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useBiblioteca } from "@/hooks/useBiblioteca";
import { getBibliotecaPdfUrl } from "@/services/biblioteca";

function formatarTamanho(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatarData(data: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(data));
}

export default function BibliotecaPage() {
  const { colors } = useTheme();
  const { itens, loading, error } = useBiblioteca();
  const [selecionadoId, setSelecionadoId] = useState<number | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const prevBlobRef = useRef<string | null>(null);

  const itemSelecionado = useMemo(
    () => itens.find((item) => item.id === selecionadoId) ?? itens[0] ?? null,
    [itens, selecionadoId]
  );

  useEffect(() => {
    if (!itemSelecionado) return;

    setLoadingPdf(true);
    setBlobUrl(null);

    fetch(getBibliotecaPdfUrl(itemSelecionado.id))
      .then((res) => res.blob())
      .then((blob) => {
        if (prevBlobRef.current) URL.revokeObjectURL(prevBlobRef.current);
        const url = URL.createObjectURL(blob);
        prevBlobRef.current = url;
        setBlobUrl(url);
      })
      .catch(() => setBlobUrl(null))
      .finally(() => setLoadingPdf(false));
  }, [itemSelecionado?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="flex flex-col max-w-6xl mx-auto w-full px-5 pt-5"
      style={{ height: "calc(100dvh - 144px)" }}
    >
      <div className="mb-4 shrink-0">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: colors.textMuted }}>
          Acervo digital
        </p>
        <h2 className="text-2xl font-extrabold mt-1 leading-tight" style={{ color: colors.text }}>
          Biblioteca da igreja
        </h2>
      </div>

      {error && (
        <p className="text-sm mb-3 shrink-0" style={{ color: "#dc2626" }}>
          {error}
        </p>
      )}

      <div className="grid gap-4 flex-1 min-h-0 pb-2 xl:grid-cols-[300px_minmax(0,1fr)]">
        <section
          className="rounded-3xl border p-4 overflow-y-auto"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <LibraryBig size={20} color={colors.primary} />
              <h3 className="text-lg font-bold" style={{ color: colors.text }}>
                Livros
              </h3>
            </div>
            <span className="text-xs font-semibold" style={{ color: colors.textMuted }}>
              {itens.length} itens
            </span>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm" style={{ color: colors.textMuted }}>
              Carregando biblioteca...
            </div>
          ) : itens.length === 0 ? (
            <div className="py-10 text-center text-sm" style={{ color: colors.textMuted }}>
              Nenhum livro cadastrado.
            </div>
          ) : (
            <div className="space-y-3">
              {itens.map((item) => {
                const ativo = itemSelecionado?.id === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelecionadoId(item.id)}
                    className="w-full text-left rounded-2xl border p-4 transition-colors"
                    style={{
                      backgroundColor: ativo ? colors.primaryBg : colors.surfaceAlt,
                      borderColor: ativo ? colors.primaryLight : colors.border,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: colors.surface, color: colors.primary }}
                      >
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold leading-snug" style={{ color: colors.text }}>
                          {item.titulo}
                        </p>
                        <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                          {formatarTamanho(item.tamanhoBytes)} • {formatarData(item.criadoEm)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section
          className="flex flex-col rounded-3xl border p-4 min-h-0"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          {itemSelecionado ? (
            <>
              <div className="mb-3 shrink-0">
                <h3 className="text-xl font-bold" style={{ color: colors.text }}>
                  {itemSelecionado.titulo}
                </h3>
                {itemSelecionado.descricao && (
                  <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                    {itemSelecionado.descricao}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 text-xs font-semibold mt-2" style={{ color: colors.textMuted }}>
                  <span>{itemSelecionado.nomeArquivo}</span>
                  <span>{formatarTamanho(itemSelecionado.tamanhoBytes)}</span>
                  <span>{formatarData(itemSelecionado.criadoEm)}</span>
                </div>
              </div>

              {loadingPdf ? (
                <div
                  className="flex-1 min-h-0 rounded-2xl border flex items-center justify-center text-sm"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surfaceAlt,
                    color: colors.textMuted,
                  }}
                >
                  Carregando PDF...
                </div>
              ) : (
                <iframe
                  key={itemSelecionado.id}
                  src={blobUrl ?? undefined}
                  className="flex-1 min-h-0 w-full rounded-2xl border"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surfaceAlt,
                  }}
                />
              )}
            </>
          ) : (
            <div className="h-full min-h-80 flex items-center justify-center text-center text-sm" style={{ color: colors.textMuted }}>
              Selecione um livro para visualizar.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
