"use client";

import { Minus, Plus, Sun, Moon, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

const PRESETS: { label: string; size: number }[] = [
  { label: "Normal", size: 15 },
  { label: "Grande", size: 20 },
  { label: "Maior", size: 26 },
];

export default function ReadingSettings({ open, onClose }: Props) {
  const {
    colors,
    dark,
    fontSize,
    lineHeight,
    minFontSize,
    maxFontSize,
    toggleTheme,
    setFontSizeValue,
    increaseFontSize,
    decreaseFontSize,
    increaseLineHeight,
    decreaseLineHeight,
  } = useTheme();

  if (!open) return null;

  const bigBtn = (extra: React.CSSProperties = {}): React.CSSProperties => ({
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    ...extra,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
      role="dialog"
      aria-label="Ajustes de leitura"
    >
      <div
        className="w-full max-w-2xl mx-auto rounded-t-3xl p-5 pb-8"
        style={{ backgroundColor: colors.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: colors.text }}>
            Leitura
          </h2>
          <button onClick={onClose} aria-label="Fechar" style={bigBtn({ width: 40, height: 40, borderRadius: 12 })}>
            <X size={20} />
          </button>
        </div>

        {/* Presets de tamanho */}
        <p className="text-sm font-semibold mb-2" style={{ color: colors.textSecondary }}>
          Tamanho do texto
        </p>
        <div className="flex gap-2 mb-3">
          {PRESETS.map((p) => {
            const ativo = fontSize === p.size;
            return (
              <button
                key={p.label}
                onClick={() => setFontSizeValue(p.size)}
                className="flex-1 rounded-2xl py-3 font-semibold transition-colors"
                style={{
                  backgroundColor: ativo ? colors.primary : colors.surfaceAlt,
                  color: ativo ? "#fff" : colors.textSecondary,
                  fontSize: 14,
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Ajuste fino do tamanho */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={decreaseFontSize}
            disabled={fontSize <= minFontSize}
            aria-label="Diminuir fonte"
            style={bigBtn({ opacity: fontSize <= minFontSize ? 0.4 : 1 })}
          >
            <Minus size={22} />
          </button>
          <div
            className="flex-1 text-center rounded-2xl py-2"
            style={{ backgroundColor: colors.surfaceAlt }}
          >
            <span style={{ fontSize: Math.min(fontSize, 22), fontWeight: 700, color: colors.text }}>A</span>
            <span className="ml-2 text-xs" style={{ color: colors.textMuted }}>{fontSize}px</span>
          </div>
          <button
            onClick={increaseFontSize}
            disabled={fontSize >= maxFontSize}
            aria-label="Aumentar fonte"
            style={bigBtn({ opacity: fontSize >= maxFontSize ? 0.4 : 1 })}
          >
            <Plus size={22} />
          </button>
        </div>

        {/* Espaçamento entre linhas */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-sm font-semibold" style={{ color: colors.textSecondary }}>
            Espaçamento
          </span>
          <div className="flex items-center gap-3">
            <button onClick={decreaseLineHeight} aria-label="Diminuir espaçamento" style={bigBtn({ width: 44, height: 44 })}>
              <Minus size={20} />
            </button>
            <span className="text-sm tabular-nums w-8 text-center" style={{ color: colors.textMuted }}>
              {lineHeight.toFixed(1)}
            </span>
            <button onClick={increaseLineHeight} aria-label="Aumentar espaçamento" style={bigBtn({ width: 44, height: 44 })}>
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Tema */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-sm font-semibold" style={{ color: colors.textSecondary }}>
            Tema
          </span>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 rounded-2xl px-4 py-3 font-semibold"
            style={{ backgroundColor: colors.surfaceAlt, color: colors.text, fontSize: 14 }}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
            {dark ? "Claro" : "Escuro"}
          </button>
        </div>

        {/* Prévia */}
        <div className="rounded-2xl p-4" style={{ backgroundColor: colors.surfaceAlt }}>
          <p style={{ fontSize, lineHeight, color: colors.textSecondary }}>
            &ldquo;Lâmpada para os meus pés é a tua palavra e luz para o meu caminho.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
