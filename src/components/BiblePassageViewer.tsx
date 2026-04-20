"use client";

import { useEffect, useRef } from "react";
import type { BibleReference } from "@/types";
import { useBiblePassage } from "@/hooks/useBiblePassage";
import { BIBLE_BOOK_NAMES } from "@/data/bible-abbreviations";
import { useTheme } from "@/contexts/ThemeContext";
import { X } from "lucide-react";

interface Props {
  reference: BibleReference | null;
  visible: boolean;
  onClose: () => void;
}

export default function BiblePassageViewer({ reference, visible, onClose }: Props) {
  const { verses, loading, error, loadPassage, clear } = useBiblePassage();
  const { colors, fontSize } = useTheme();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (visible && reference) {
      dialogRef.current?.showModal();
      loadPassage(reference);
    } else {
      dialogRef.current?.close();
      clear();
    }
  }, [visible, reference, loadPassage, clear]);

  if (!reference) return null;

  const bookName = BIBLE_BOOK_NAMES[reference.book] ?? reference.bookAbbr;
  const verseRange =
    reference.verseEnd
      ? `${reference.verseStart}-${reference.verseEnd}`
      : `${reference.verseStart}`;
  const title = `${bookName} ${reference.chapter}:${verseRange}`;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => { if (e.target === dialogRef.current) onClose(); }}
      className="m-auto mt-auto mb-0 w-full max-w-2xl rounded-t-2xl p-0 shadow-2xl backdrop:bg-black/45 max-h-[75dvh] outline-none border-0"
      style={{ backgroundColor: colors.surface }}
    >
      {/* Handle bar */}
      <div className="flex justify-center pt-2.5 pb-1">
        <div className="w-10 h-1 rounded-full" style={{ backgroundColor: colors.border }} />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between px-5 py-4">
        <div>
          <p className="text-lg font-bold" style={{ color: colors.primary }}>{title}</p>
          <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
            Almeida Revista e Atualizada (ARA)
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity shrink-0"
          style={{ backgroundColor: colors.surfaceAlt }}
          aria-label="Fechar"
        >
          <X size={16} color={colors.textMuted} />
        </button>
      </div>

      {/* Content */}
      <div className="overflow-y-auto px-5 pb-8" style={{ maxHeight: "55dvh" }}>
        {loading && (
          <div className="flex flex-col items-center py-8 gap-2">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: colors.primaryLight, borderTopColor: "transparent" }}
            />
            <p className="text-sm" style={{ color: colors.textMuted }}>Carregando...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg p-4 bg-red-50 border border-red-200">
            <p className="text-red-600 text-center text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && verses.length > 0 && (
          <div className="space-y-1">
            {verses.map((v) => (
              <p key={v.verse} style={{ fontSize, color: colors.textSecondary, lineHeight: `${fontSize * 1.7}px` }}>
                <sup
                  className="font-bold mr-1"
                  style={{ color: colors.primaryLight, fontSize: fontSize - 4 }}
                >
                  {v.verse}
                </sup>
                {v.text}
              </p>
            ))}
          </div>
        )}
      </div>
    </dialog>
  );
}
