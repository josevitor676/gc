"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const { dark, colors, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col min-h-dvh" style={{ backgroundColor: colors.bg }}>
      <header
        className="flex items-center justify-between px-5 py-3 sticky top-0 z-30"
        style={{ backgroundColor: colors.headerBg }}
      >
        <h1 className="text-white font-semibold text-base tracking-tight">
          Grupos de Crescimento
        </h1>
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-full hover:opacity-70 transition-opacity"
          aria-label="Alternar tema"
        >
          {dark ? <Sun size={20} color="#fff" /> : <Moon size={20} color="#fff" />}
        </button>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
