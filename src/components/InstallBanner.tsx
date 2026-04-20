"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa-install-dismissed";

export default function InstallBanner() {
  const { colors } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed or installed
    if (localStorage.getItem(DISMISSED_KEY)) return;

    // Detect iOS (Safari doesn't support beforeinstallprompt)
    const ios =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !(window.navigator as Navigator & { standalone?: boolean }).standalone;
    setIsIOS(ios);
    if (ios) {
      setVisible(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-0"
      style={{ pointerEvents: "none" }}
    >
      <div
        className="rounded-2xl p-4 shadow-xl flex items-start gap-3"
        style={{
          backgroundColor: colors.card,
          border: `1px solid ${colors.border}`,
          pointerEvents: "auto",
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: colors.primaryBg }}
        >
          <Download size={20} color={colors.primary} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: colors.text }}>
            Instalar o app
          </p>
          {isIOS ? (
            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: colors.textSecondary }}>
              Toque em{" "}
              <span className="font-semibold" style={{ color: colors.primary }}>
                Compartilhar{" "}
              </span>
              e depois{" "}
              <span className="font-semibold" style={{ color: colors.primary }}>
                "Adicionar à Tela de Início"
              </span>{" "}
              para instalar.
            </p>
          ) : (
            <>
              <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                Adicione à tela inicial para acesso rápido e offline.
              </p>
              <button
                onClick={handleInstall}
                className="mt-2.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-opacity hover:opacity-80"
                style={{ backgroundColor: colors.primary, color: "#fff" }}
              >
                Instalar
              </button>
            </>
          )}
        </div>

        <button
          onClick={handleDismiss}
          className="p-1 rounded-full hover:opacity-60 transition-opacity shrink-0"
          aria-label="Fechar"
        >
          <X size={16} color={colors.textMuted} />
        </button>
      </div>
    </div>
  );
}
