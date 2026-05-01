"use client";

import { useState, useEffect, useRef } from "react";
import type { Highlight, Annotation } from "@/types";
import { X, Trash2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  highlight: Highlight;
  snippetText: string;
  annotation: Annotation | null;
  onSave: (text: string) => void;
  onDeleteHighlight: () => void;
  onClose: () => void;
}

export default function AnnotationModal({
  highlight,
  snippetText,
  annotation,
  onSave,
  onDeleteHighlight,
  onClose,
}: Props) {
  const { colors, fontSize } = useTheme();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [text, setText] = useState(annotation?.text ?? "");

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    setText(annotation?.text ?? "");
  }, [annotation]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="m-auto mt-auto mb-0 w-full max-w-2xl rounded-t-2xl p-0 shadow-2xl backdrop:bg-black/45 outline-none border-0"
      style={{ backgroundColor: colors.surface }}
      aria-modal="true"
      aria-labelledby="annotation-dialog-title"
    >
      {/* Handle bar */}
      <div className="flex justify-center pt-2.5 pb-1">
        <div className="w-10 h-1 rounded-full" style={{ backgroundColor: colors.border }} />
      </div>

      <div className="px-5 pt-3 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2
            id="annotation-dialog-title"
            className="text-base font-bold"
            style={{ color: colors.text }}
          >
            Anotação
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity"
            style={{ backgroundColor: colors.surfaceAlt }}
            aria-label="Fechar"
          >
            <X size={16} color={colors.textMuted} />
          </button>
        </div>

        {/* Highlighted text preview */}
        {snippetText && (
          <div
            className="rounded-lg px-3 py-2 mb-4 italic"
            style={{
              backgroundColor: highlight.color + "55",
              color: colors.textSecondary,
              fontSize: fontSize - 1,
              lineHeight: `${(fontSize - 1) * 1.5}px`,
            }}
          >
            &ldquo;
            {snippetText.length > 100 ? snippetText.slice(0, 100) + "…" : snippetText}
            &rdquo;
          </div>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escreva sua anotação aqui..."
          className="w-full h-28 p-3 rounded-xl border resize-none focus:outline-none focus:ring-2"
          style={{
            backgroundColor: colors.surfaceAlt,
            borderColor: colors.border,
            color: colors.text,
            fontSize,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ["--tw-ring-color" as any]: colors.primaryLight,
          }}
          autoFocus
        />

        <div className="flex gap-2 mt-4">
          <button
            onClick={onDeleteHighlight}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm transition-opacity hover:opacity-75"
            style={{ borderColor: "#fca5a5", color: "#ef4444" }}
          >
            <Trash2 size={14} />
            Remover
          </button>
          <button
            onClick={() => onSave(text)}
            className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: colors.primary, color: "#fff" }}
          >
            Salvar
          </button>
        </div>
      </div>
    </dialog>
  );
}
