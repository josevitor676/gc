"use client";

import { useEffect, useState } from "react";
import { Download, Share, MoreVertical, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export default function InstallButton() {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Já está rodando como app instalado — botão desnecessário
    if (isStandalone()) return;

    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));
    setVisible(true);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function handleClick() {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        if (outcome === "accepted") setVisible(false);
        return;
      } catch {
        // Prompt já consumido (ex.: usado pelo banner) — cai nas instruções
        setDeferredPrompt(null);
      }
    }
    setOpen((v) => !v);
  }

  if (!visible) return null;

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="p-1.5 rounded-full hover:opacity-70 transition-opacity"
        aria-label="Instalar o aplicativo"
        aria-expanded={open}
      >
        <Download size={20} color="#fff" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div
            className="absolute right-0 top-full mt-2 z-50 w-[300px] max-w-[calc(100vw-2rem)] rounded-2xl border shadow-lg"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
            role="region"
            aria-label="Como instalar o aplicativo"
          >
            <div
              className="px-4 py-3 border-b flex items-center justify-between"
              style={{ borderColor: colors.border }}
            >
              <p className="text-sm font-bold" style={{ color: colors.text }}>
                Instalar o app
              </p>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-full hover:opacity-60 transition-opacity"
                aria-label="Fechar"
              >
                <X size={16} color={colors.textMuted} />
              </button>
            </div>

            <div className="px-4 py-3">
              {isIOS ? (
                <ol className="text-xs leading-relaxed space-y-2" style={{ color: colors.textSecondary }}>
                  <li className="flex items-start gap-2">
                    <span
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: colors.primaryBg, color: colors.primary }}
                    >
                      <Share size={13} />
                    </span>
                    <span>
                      Toque em <span className="font-semibold" style={{ color: colors.primary }}>Compartilhar</span> na
                      barra do Safari
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[13px] font-bold"
                      style={{ backgroundColor: colors.primaryBg, color: colors.primary }}
                    >
                      +
                    </span>
                    <span>
                      Escolha{" "}
                      <span className="font-semibold" style={{ color: colors.primary }}>
                        Adicionar à Tela de Início
                      </span>{" "}
                      e confirme
                    </span>
                  </li>
                </ol>
              ) : (
                <ol className="text-xs leading-relaxed space-y-2" style={{ color: colors.textSecondary }}>
                  <li className="flex items-start gap-2">
                    <span
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: colors.primaryBg, color: colors.primary }}
                    >
                      <MoreVertical size={13} />
                    </span>
                    <span>Abra o menu do navegador (três pontos)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: colors.primaryBg, color: colors.primary }}
                    >
                      <Download size={13} />
                    </span>
                    <span>
                      Toque em{" "}
                      <span className="font-semibold" style={{ color: colors.primary }}>
                        Adicionar à tela inicial
                      </span>{" "}
                      (ou &quot;Instalar app&quot;)
                    </span>
                  </li>
                </ol>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
