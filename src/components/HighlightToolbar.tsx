"use client";

import { HIGHLIGHT_COLORS } from "@/types";

interface Props {
  onSelectColor: (color: string) => void;
  position: { x: number; y: number };
}

export default function HighlightToolbar({ onSelectColor, position }: Props) {
  return (
    <div
      className="fixed z-50 flex items-center gap-1 bg-gray-900 rounded-full px-2 py-1.5 shadow-xl"
      style={{ top: position.y - 56, left: Math.max(10, position.x - 88) }}
    >
      {HIGHLIGHT_COLORS.map((color) => (
        <button
          key={color}
          onClick={() => onSelectColor(color)}
          className="w-8 h-8 rounded-full border-2 border-white hover:scale-110 transition-transform"
          style={{ backgroundColor: color }}
          aria-label={`Destacar em ${color}`}
        />
      ))}
    </div>
  );
}
