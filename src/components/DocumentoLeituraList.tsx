"use client";

import Link from "next/link";
import { ScrollText, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import type { DocumentoLeitura } from "@/types";

interface Props {
  items: DocumentoLeitura[];
  backHref: string;
  backLabel: string;
  eyebrow: string;
  titulo: string;
  descricao: string;
  basePath: string;
  tint: string;
  ink: string;
}

// Lista genérica de documentos de leitura (Confissões, Teologia reformada).
export default function DocumentoLeituraList({ items, backHref, backLabel, eyebrow, titulo, descricao, basePath, tint, ink }: Props) {
  const { colors } = useTheme();

  return (
    <div className="px-5 py-6 max-w-2xl mx-auto md:max-w-3xl">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm font-medium mb-4 hover:opacity-70 transition-opacity"
        style={{ color: colors.textMuted }}
      >
        <ChevronLeft size={18} />
        {backLabel}
      </Link>

      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: colors.textMuted }}>
          {eyebrow}
        </p>
        <h2 className="text-2xl font-extrabold mt-1 leading-tight" style={{ color: colors.text }}>
          {titulo}
        </h2>
        <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
          {descricao}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const Icon = item.tipo === "pdf" ? FileText : ScrollText;
          return (
            <Link
              key={item.id}
              href={`${basePath}/${item.id}`}
              className="flex items-center gap-3 rounded-2xl border p-4 active:scale-[0.99] transition-transform"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: tint, color: ink }}
              >
                <Icon size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold" style={{ color: colors.text }}>
                  {item.titulo}
                </p>
                <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
                  {item.subtitulo}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {item.ano && (
                    <span
                      className="text-[10px] font-semibold rounded-full px-2 py-0.5"
                      style={{ backgroundColor: colors.surfaceAlt, color: colors.textSecondary }}
                    >
                      {item.ano}
                    </span>
                  )}
                  <span
                    className="text-[10px] font-semibold rounded-full px-2 py-0.5"
                    style={{ backgroundColor: colors.surfaceAlt, color: colors.textSecondary }}
                  >
                    {item.tipo === "pdf" ? "PDF" : "Leitura"}
                  </span>
                </div>
              </div>
              <ChevronRight size={20} color={colors.textMuted} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
