import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GCs — Grupos de Crescimento",
  description: "Estudos bíblicos para Grupos de Crescimento da IPVO",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GCs",
  },
};

export const viewport: Viewport = {
  themeColor: "#5B21B6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.className} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-180.png" />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
