"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ALargeSmall, ExternalLink, ListTree } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import LessonContent from "@/components/LessonContent";
import ReadingSettings from "@/components/ReadingSettings";
import BiblePassageViewer from "@/components/BiblePassageViewer";
import type { BibleReference, DocumentoLeitura } from "@/types";

interface Props {
  item: DocumentoLeitura;
  backHref: string;
  backLabel: string;
  eyebrowSingular: string;
  pdfBasePath: string;
}

// Leitor genérico de documentos (Confissões, Teologia reformada): mostra a
// leitura estruturada (secoes) ou o visualizador de PDF (documentos escaneados).
export default function DocumentoLeituraView({ item, backHref, backLabel, eyebrowSingular, pdfBasePath }: Props) {
  const { colors, fontSize } = useTheme();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedRefs, setSelectedRefs] = useState<BibleReference[]>([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [bibleModalVisible, setBibleModalVisible] = useState(false);

  const handleBibleRefPress = useCallback((ref: BibleReference) => {
    setSelectedRefs([ref]);
    setSelectedTitle(ref.raw);
    setBibleModalVisible(true);
  }, []);

  const isPdf = item.tipo === "pdf";
  const pdfSrc = item.arquivoPdf ? `${pdfBasePath}/${item.arquivoPdf}` : null;

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: "100dvh" }}>
      {/* Barra superior */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: colors.headerBg }}
      >
        <Link
          href={backHref}
          className="flex items-center gap-1 text-white/80 hover:text-white transition-colors"
          aria-label={`Voltar para ${backLabel.toLowerCase()}`}
        >
          <ChevronLeft size={20} />
          <span className="text-sm font-medium">Voltar</span>
        </Link>
        {!isPdf && (
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            aria-label="Ajustes de leitura"
          >
            <ALargeSmall size={20} color="#fff" />
          </button>
        )}
      </div>

      <div className="px-5 py-6 max-w-2xl mx-auto md:max-w-3xl md:px-8 pb-24">
        {/* Cabeçalho */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: colors.primaryLight }}>
            {item.ano ? `${eyebrowSingular} · ${item.ano}` : eyebrowSingular}
          </p>
          <h1 className="text-2xl font-extrabold leading-tight mb-1" style={{ color: colors.text }}>
            {item.titulo}
          </h1>
          {item.subtitulo && (
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              {item.subtitulo}
            </p>
          )}
          {item.autor && (
            <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
              por {item.autor}
            </p>
          )}
          {item.descricao && (
            <p className="text-sm leading-relaxed mt-3" style={{ color: colors.textSecondary }}>
              {item.descricao}
            </p>
          )}
        </div>

        {isPdf ? (
          /* ── Visualizador de PDF (documentos digitalizados) ── */
          pdfSrc && (
            <div className="flex flex-col gap-3">
              <a
                href={pdfSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 self-start px-4 py-2.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ backgroundColor: colors.primaryBg, color: colors.badgeText }}
              >
                <ExternalLink size={16} />
                Abrir PDF em nova aba
              </a>
              <iframe
                src={pdfSrc}
                title={item.titulo}
                className="w-full rounded-2xl border"
                style={{
                  height: "calc(100dvh - 320px)",
                  minHeight: 420,
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceAlt,
                }}
              />
            </div>
          )
        ) : (
          /* ── Leitura estruturada ── */
          <>
            {pdfSrc && (
              <a
                href={pdfSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mb-5 px-3 py-2 rounded-full text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ backgroundColor: colors.surfaceAlt, color: colors.textSecondary }}
              >
                <ExternalLink size={14} />
                Ver PDF original (digitalizado)
              </a>
            )}

            {item.secoes.length > 1 && (
              <details
                className="mb-6 rounded-2xl border overflow-hidden"
                style={{ borderColor: colors.border, backgroundColor: colors.surface }}
              >
                <summary
                  className="flex items-center gap-2 px-4 py-3 cursor-pointer text-sm font-bold select-none"
                  style={{ color: colors.text }}
                >
                  <ListTree size={18} color={colors.primary} />
                  Índice ({item.secoes.length})
                </summary>
                <nav className="px-2 pb-2">
                  {item.secoes.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="block px-2 py-1.5 rounded-lg text-sm hover:opacity-70 transition-opacity"
                      style={{ color: colors.textSecondary }}
                    >
                      {s.title}
                    </a>
                  ))}
                </nav>
              </details>
            )}

            {item.secoes.map((secao) => (
              <section key={secao.id} id={secao.id} className="mb-8 scroll-mt-20">
                <h2 className="text-lg font-extrabold mb-3 leading-snug" style={{ color: colors.text }}>
                  {secao.title}
                </h2>
                {secao.bibleReference && (
                  <p className="text-xs font-semibold mb-2" style={{ color: colors.primaryLight }}>
                    {secao.bibleReference}
                  </p>
                )}
                <LessonContent blocks={secao.content} onBibleRefPress={handleBibleRefPress} />
              </section>
            ))}

            <p className="text-xs text-center mt-4" style={{ color: colors.textMuted, fontSize: fontSize - 3 }}>
              Texto convertido automaticamente do PDF original.
            </p>
          </>
        )}
      </div>

      <ReadingSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <BiblePassageViewer
        references={selectedRefs}
        title={selectedTitle}
        visible={bibleModalVisible}
        onClose={() => setBibleModalVisible(false)}
      />
    </div>
  );
}
