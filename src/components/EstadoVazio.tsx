"use client";

import type { LucideIcon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  icon: LucideIcon;
  titulo: string;
  descricao?: string;
  acaoLabel?: string;
  onAcao?: () => void;
}

export default function EstadoVazio({ icon: Icon, titulo, descricao, acaoLabel, onAcao }: Props) {
  const { colors } = useTheme();

  return (
    <div className="flex flex-col items-center text-center px-6 py-12">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
        style={{ backgroundColor: colors.surfaceAlt }}
      >
        <Icon size={26} color={colors.textMuted} />
      </div>
      <p className="text-sm font-semibold" style={{ color: colors.text }}>
        {titulo}
      </p>
      {descricao && (
        <p className="text-xs mt-1 max-w-xs leading-relaxed" style={{ color: colors.textMuted }}>
          {descricao}
        </p>
      )}
      {acaoLabel && onAcao && (
        <button
          onClick={onAcao}
          className="mt-4 px-5 py-2.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ backgroundColor: colors.primaryBg, color: colors.badgeText }}
        >
          {acaoLabel}
        </button>
      )}
    </div>
  );
}
