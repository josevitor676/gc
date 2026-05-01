"use client";

import { HIGHLIGHT_COLORS } from "@/types";
import { useTheme } from "@/contexts/ThemeContext";

interface Props {
  position: { x: number; y: number; yBottom: number };
  onColorSelect: (color: string) => void;
  onDismiss: () => void;
}

// Toolbar height (h-11 circles 44px + py-2.5 20px padding) ≈ 64px
const TOOLBAR_H = 64;
const TOOLBAR_GAP = 10; // gap between toolbar edge and selection

export default function HighlightToolbar({ position, onColorSelect, onDismiss }: Props) {
  const { colors } = useTheme();

  // Clamp x so the toolbar (≈240px wide) never overflows viewport
  const safeX =
    typeof window !== "undefined"
      ? Math.max(120, Math.min(position.x, window.innerWidth - 120))
      : position.x;

  // Prefer showing above the selection; fall back to below when near the top
  const showAbove = position.y > TOOLBAR_H + TOOLBAR_GAP + 8;
  const safeY = showAbove
    ? position.y - TOOLBAR_H - TOOLBAR_GAP
    : position.yBottom + TOOLBAR_GAP;

  return (
    <>
      {/* Transparent backdrop — tap anywhere outside to dismiss */}
      <div className="fixed inset-0 z-40" onClick={onDismiss} />

      {/* Toolbar pill */}
      <div
        role="toolbar"
        aria-label="Opções de destaque"
        className="fixed z-50 flex items-center gap-3 px-4 py-2.5 rounded-full shadow-xl"
        style={{
          left: safeX,
          top: safeY,
          transform: "translateX(-50%)",
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          boxShadow: "0 6px 28px rgba(0,0,0,0.22)",
        }}
      >
        {HIGHLIGHT_COLORS.map((color) => (
          <button
            key={color}
            aria-label="Destacar com esta cor"
            // w-11 h-11 = 44 px — comfortable touch target on mobile
            className="w-11 h-11 rounded-full transition-transform active:scale-90"
            style={{
              backgroundColor: color,
              border: "2.5px solid rgba(255,255,255,0.9)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
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
