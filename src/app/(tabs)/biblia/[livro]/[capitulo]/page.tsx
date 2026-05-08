"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { BIBLE_BOOKS } from "@/data/bible-books";
import { fetchChapter } from "@/services/bible";
import { getCachedBibleVerses, cacheBibleVerses } from "@/services/storage";
import type { BibleVerse } from "@/types";

export default function CapituloPage() {
  const { colors, fontSize, increaseFontSize, decreaseFontSize } = useTheme();
  const isOnline = useOnlineStatus();
  const router = useRouter();
  const params = useParams();
  const livro = typeof params.livro === "string" ? params.livro : "";
  const capituloParam = typeof params.capitulo === "string" ? parseInt(params.capitulo, 10) : 1;

  const book = BIBLE_BOOKS.find((b) => b.slug === livro);
  const [chapter, setChapter] = useState(capituloParam);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!book) return;
    setLoading(true);
    setError(null);

    const cacheKey = `chapter:${book.slug}:${chapter}`;

    getCachedBibleVerses(cacheKey)
      .then(async (cached) => {
        if (cached) {
          setVerses(JSON.parse(cached) as BibleVerse[]);
          return;
        }
        if (!navigator.onLine) {
          setError("offline");
          return;
        }
        const v = await fetchChapter(book.slug, chapter);
        setVerses(v);
        await cacheBibleVerses(cacheKey, JSON.stringify(v)).catch(() => {});
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Erro ao carregar capítulo")
      )
      .finally(() => setLoading(false));
  }, [book, chapter]);

  // Scroll to top when chapter changes
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [chapter]);

  if (!book) {
    return (
      <div className="flex items-center justify-center min-h-dvh" style={{ backgroundColor: colors.bg }}>
        <p style={{ color: colors.textMuted }}>Livro não encontrado.</p>
      </div>
    );
  }

  const hasPrev = chapter > 1;
  const hasNext = chapter < book.chapters;

  function goTo(ch: number) {
    setChapter(ch);
    router.replace(`/biblia/${book!.slug}/${ch}`, { scroll: false });
  }

  return (
    <div
      className="flex flex-col min-h-dvh"
      style={{ backgroundColor: colors.bg }}
    >
      {/* Scrollable content — pb accounts for prev/next bar (48px) + tab bar (72px) */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pb-44 px-5 pt-6 max-w-2xl mx-auto w-full">
        {/* Back button + heading + font size controls */}
        <div className="relative flex items-center justify-center mb-6 min-h-20">
          <button
            onClick={() => router.push("/biblia")}
            className="absolute left-0 p-1.5 rounded-full transition-opacity hover:opacity-70"
            style={{ backgroundColor: colors.primaryBg }}
            aria-label="Voltar para lista de livros"
          >
            <ArrowLeft size={20} style={{ color: colors.primary }} />
          </button>
          <div className="text-center">
            <p
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: colors.textMuted }}
            >
              {book.name}
            </p>
            <p
              className="font-extrabold"
              style={{ color: colors.text, fontSize: "3.5rem", lineHeight: 1 }}
            >
              {chapter}
            </p>
          </div>
          {/* Font size controls */}
          <div
            className="absolute right-0 flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ backgroundColor: colors.surfaceAlt }}
          >
            <button
              onClick={decreaseFontSize}
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-opacity hover:opacity-70"
              style={{ backgroundColor: colors.surface }}
              aria-label="Diminuir fonte"
            >
              <span className="font-bold" style={{ color: colors.text, fontSize: 14 }}>−</span>
            </button>
            <span className="text-xs font-semibold w-5 text-center" style={{ color: colors.text }}>{fontSize}</span>
            <button
              onClick={increaseFontSize}
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-opacity hover:opacity-70"
              style={{ backgroundColor: colors.surface }}
              aria-label="Aumentar fonte"
            >
              <span className="font-bold" style={{ color: colors.text, fontSize: 14 }}>+</span>
            </button>
          </div>
        </div>

        {/* Verses */}
        {loading && (
          <div className="flex justify-center mt-12" role="status" aria-label="Carregando...">
            <div
              className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: colors.primaryLight, borderTopColor: "transparent" }}
            />
          </div>
        )}

        {error && !loading && error === "offline" && (
          <div className="flex flex-col items-center gap-4 mt-16 px-6 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.surfaceAlt }}
            >
              {/* WifiOff icon inline SVG to avoid extra import complexity */}
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: colors.textMuted }}>
                <line x1="2" y1="2" x2="22" y2="22"/>
                <path d="M8.5 16.5a5 5 0 0 1 7 0"/>
                <path d="M2 8.82a15 15 0 0 1 4.17-2.65"/>
                <path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76"/>
                <path d="M16.85 11.25a10 10 0 0 1 2.22 1.68"/>
                <path d="M5 13a10 10 0 0 1 5.24-2.76"/>
                <circle cx="12" cy="20" r="1"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-base mb-1" style={{ color: colors.text }}>
                Sem conexão com a internet
              </p>
              <p className="text-sm" style={{ color: colors.textMuted }}>
                Este capítulo ainda não foi carregado. Conecte-se à internet para acessar a Bíblia pela primeira vez.
              </p>
            </div>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                const cacheKey = `chapter:${book.slug}:${chapter}`;
                getCachedBibleVerses(cacheKey)
                  .then(async (cached) => {
                    if (cached) { setVerses(JSON.parse(cached) as BibleVerse[]); return; }
                    const v = await fetchChapter(book.slug, chapter);
                    setVerses(v);
                    await cacheBibleVerses(cacheKey, JSON.stringify(v)).catch(() => {});
                  })
                  .catch((e: unknown) => setError(e instanceof Error ? e.message : "Erro ao carregar capítulo"))
                  .finally(() => setLoading(false));
              }}
              className="text-sm px-5 py-2 rounded-lg"
              style={{ backgroundColor: colors.primaryBg, color: colors.primary }}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {error && !loading && error !== "offline" && (
          <div className="flex flex-col items-center gap-3 mt-12">
            <p className="text-sm text-center" style={{ color: colors.textMuted }}>
              {error}
            </p>
            <button
              onClick={() => { setLoading(true); setError(null); fetchChapter(book.slug, chapter).then(setVerses).catch((e: unknown) => setError(e instanceof Error ? e.message : "Erro")).finally(() => setLoading(false)); }}
              className="text-sm px-4 py-2 rounded-lg"
              style={{ backgroundColor: colors.primaryBg, color: colors.primary }}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && (
          <p
            className="leading-relaxed"
            style={{ color: colors.text, fontSize, lineHeight: 1.9 }}
          >
            {verses.map((v) => (
              <span key={v.verse}>
                <sup
                  className="font-semibold mr-0.5"
                  style={{ color: colors.primary, fontSize: "0.65em" }}
                >
                  {v.verse}
                </sup>
                {v.text}{" "}
              </span>
            ))}
          </p>
        )}
      </div>

      {/* Prev / Next bar — sits above the tab bar (~72px tall) */}
      <div
        className="fixed bottom-16 left-0 right-0 z-20 border-t"
        style={{ backgroundColor: colors.headerBg, borderColor: colors.border }}
      >
        <div className="flex items-center justify-between px-6 py-3">
          <button
            onClick={() => hasPrev && goTo(chapter - 1)}
            disabled={!hasPrev}
            className="p-2 rounded-full transition-opacity"
            style={{ opacity: hasPrev ? 1 : 0.3 }}
            aria-label="Capítulo anterior"
          >
            <ChevronLeft size={24} color="#fff" />
          </button>

          <span className="text-sm font-semibold" style={{ color: "#fff" }}>
            {book.name} {chapter}
          </span>

          <button
            onClick={() => hasNext && goTo(chapter + 1)}
            disabled={!hasNext}
            className="p-2 rounded-full transition-opacity"
            style={{ opacity: hasNext ? 1 : 0.3 }}
            aria-label="Próximo capítulo"
          >
            <ChevronRight size={24} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
}
