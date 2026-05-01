"use client";

import { HIGHLIGHT_COLORS } from "@/types";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  position: { x: number; y: number };
  onColorSelect: (color: string) => void;
  onDismiss: () => void;
}

export default function HighlightToolbar({ position, onColorSelect, onDismiss }: Props) {
  const { colors } = useTheme();

  const safeX =
    typeof window !== "undefined"
      ? Math.max(88, Math.min(position.x, window.innerWidth - 88))
      : position.x;
  const safeY = Math.max(8, position.y - 52);

  return (
    <>
      {/* Backdrop — click dismisses */}
      <div className="fixed inset-0 z-40" onClick={onDismiss} />

      {/* Toolbar */}
      <div
        role="toolbar"
        aria-label="Opções de destaque"
        className="fixed z-50 flex items-center gap-2 px-3 py-2 rounded-full shadow-lg"
        style={{
          left: safeX,
          top: safeY,
          transform: "translateX(-50%)",
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
        }}
      >
        {HIGHLIGHT_COLORS.map((color) => (
          <button
            key={color}
            aria-label={`Destacar com esta cor`}
            className="w-6 h-6 rounded-full transition-transform active:scale-90 hover:scale-110"
            style={{
              backgroundColor: color,
              border: "2px solid rgba(255,255,255,0.85)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onColorSelect(color);
            }}
          />
        ))}
      </div>
    </>
  );
}
