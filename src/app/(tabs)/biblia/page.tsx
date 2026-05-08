"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, WifiOff } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { BIBLE_BOOKS } from "@/data/bible-books";

function removeAccents(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export default function BibliaPage() {
  const { colors, dark } = useTheme();
  const router = useRouter();
  const isOnline = useOnlineStatus();
  const [search, setSearch] = useState("");
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = removeAccents(search.trim().toLowerCase());
    if (!q) return BIBLE_BOOKS;
    return BIBLE_BOOKS.filter((b) =>
      removeAccents(b.name.toLowerCase()).includes(q)
    );
  }, [search]);

  const atBooks = filtered.filter((b) => b.testament === "AT");
  const ntBooks = filtered.filter((b) => b.testament === "NT");

  function handleBookPress(slug: string) {
    setExpandedSlug((prev) => (prev === slug ? null : slug));
  }

  function handleChapterPress(slug: string, chapter: number) {
    router.push(`/biblia/${slug}/${chapter}`);
  }

  function renderBook(book: (typeof BIBLE_BOOKS)[number]) {
    const isExpanded = expandedSlug === book.slug;
    const chapterCount = book.chapters;
    const chapters = Array.from({ length: chapterCount }, (_, i) => i + 1);

    return (
      <div key={book.slug}>
        <button
          onClick={() => handleBookPress(book.slug)}
          className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
          style={{
            borderBottom: isExpanded ? "none" : `1px solid ${colors.border}`,
          }}
        >
          <span
            className="text-base"
            style={{
              color: isExpanded ? colors.primary : colors.text,
              fontWeight: isExpanded ? 700 : 400,
            }}
          >
            {book.name}
          </span>
        </button>

        {isExpanded && (
          <div
            className="px-4 pb-4 pt-2"
            style={{
              borderBottom: `1px solid ${colors.border}`,
              backgroundColor: dark ? colors.surfaceAlt : colors.surfaceAlt,
            }}
          >
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-7">
              {chapters.map((ch) => (
                <button
                  key={ch}
                  onClick={() => handleChapterPress(book.slug, ch)}
                  className="aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: colors.surface,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="min-h-full"
      style={{ backgroundColor: colors.bg }}
    >
      {/* Offline banner */}
      {!isOnline && (
        <div
          className="flex items-center gap-3 px-4 py-3 mx-4 mt-3 rounded-xl"
          style={{ backgroundColor: colors.surfaceAlt, border: `1px solid ${colors.border}` }}
        >
          <WifiOff size={18} style={{ color: colors.textMuted }} />
          <p className="text-sm" style={{ color: colors.textMuted }}>
            Você está offline. Capítulos visitados anteriormente ainda estão disponíveis.
          </p>
        </div>
      )}

      {/* Search */}
      <div className="sticky top-0 z-10 px-4 py-3" style={{ backgroundColor: colors.bg }}>
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
          style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
        >
          <Search size={18} style={{ color: colors.textMuted }} />
          <input
            type="text"
            placeholder="Pesquisar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: colors.text }}
          />
        </div>
      </div>

      {/* Book list */}
      <div style={{ backgroundColor: colors.surface }}>
        {atBooks.length > 0 && (
          <>
            {(!search || ntBooks.length > 0) && (
              <div
                className="px-5 py-2"
                style={{ backgroundColor: colors.surfaceAlt }}
              >
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: colors.textMuted }}>
                  Antigo Testamento
                </span>
              </div>
            )}
            {atBooks.map(renderBook)}
          </>
        )}

        {ntBooks.length > 0 && (
          <>
            <div
              className="px-5 py-2"
              style={{ backgroundColor: colors.surfaceAlt }}
            >
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: colors.textMuted }}>
                Novo Testamento
              </span>
            </div>
            {ntBooks.map(renderBook)}
          </>
        )}

        {filtered.length === 0 && (
          <div className="flex justify-center py-16">
            <p className="text-sm" style={{ color: colors.textMuted }}>
              Nenhum livro encontrado
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
