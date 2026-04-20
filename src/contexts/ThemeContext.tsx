"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  divider: string;
  primary: string;
  primaryLight: string;
  primaryBg: string;
  headerBg: string;
  headerText: string;
  card: string;
  badgeBg: string;
  badgeText: string;
  reflectionBg: string;
}

const lightColors: ThemeColors = {
  bg: "#F9FAFB",
  surface: "#fff",
  surfaceAlt: "#F3F4F6",
  text: "#1F2937",
  textSecondary: "#4B5563",
  textMuted: "#9CA3AF",
  border: "#E5E7EB",
  divider: "#F3F4F6",
  primary: "#6D28D9",
  primaryLight: "#7C3AED",
  primaryBg: "#EDE9FE",
  headerBg: "#5B21B6",
  headerText: "#fff",
  card: "#fff",
  badgeBg: "#EDE9FE",
  badgeText: "#6D28D9",
  reflectionBg: "#F5F3FF",
};

const darkColors: ThemeColors = {
  bg: "#111827",
  surface: "#1F2937",
  surfaceAlt: "#374151",
  text: "#F9FAFB",
  textSecondary: "#D1D5DB",
  textMuted: "#6B7280",
  border: "#374151",
  divider: "#374151",
  primary: "#A78BFA",
  primaryLight: "#C4B5FD",
  primaryBg: "#2E1065",
  headerBg: "#1F2937",
  headerText: "#F9FAFB",
  card: "#1F2937",
  badgeBg: "#2E1065",
  badgeText: "#C4B5FD",
  reflectionBg: "#1E1547",
};

interface ThemeContextType {
  dark: boolean;
  colors: ThemeColors;
  fontSize: number;
  toggleTheme: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  dark: false,
  colors: lightColors,
  fontSize: 15,
  toggleTheme: () => {},
  increaseFontSize: () => {},
  decreaseFontSize: () => {},
});

const MIN_FONT = 12;
const MAX_FONT = 24;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  const [fontSize, setFontSize] = useState(15);

  const toggleTheme = useCallback(() => setDark((d) => !d), []);
  const increaseFontSize = useCallback(
    () => setFontSize((s) => Math.min(s + 1, MAX_FONT)),
    []
  );
  const decreaseFontSize = useCallback(
    () => setFontSize((s) => Math.max(s - 1, MIN_FONT)),
    []
  );

  const colors = dark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{ dark, colors, fontSize, toggleTheme, increaseFontSize, decreaseFontSize }}
    >
      <div
        data-theme={dark ? "dark" : "light"}
        style={{ backgroundColor: colors.bg, minHeight: "100dvh" }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
