"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sun, Moon, Book, BookOpen, Heart, HandHeart, RefreshCw, BookMarked } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import InstallBanner from "@/components/InstallBanner";
const NAV_ITEMS = [
  {
    href: "/",
    label: "Estudos",
    icon: Book,
  },
  {
    href: "/vida-espiritual/devocional",
    label: "Devocional",
    icon: Heart,
  },
  {
    href: "/biblia",
    label: "Bíblia",
    icon: BookMarked,
  },
  {
    href: "/vida-espiritual/leitura",
    label: "Leitura",
    icon: BookOpen,
  },
  {
    href: "/vida-espiritual/oracao",
    label: "Oração",
    icon: HandHeart,
  },
    {
    href: "/informacoes",
    label: "Informações",
    icon: HandHeart,
  },
  // {
  //   href: "/biblioteca",
  //   label: "Biblioteca",
  //   icon: LibraryBig,
  // },
];

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const { dark, colors, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [updating, setUpdating] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  const handleReload = async () => {
    if (updating) return;
    setUpdating(true);
    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          // Força busca do SW atualizado no servidor
          await registration.update();
          // Se há um SW esperando para ativar, avisa para pular a espera
          const pendingSW = registration.installing || registration.waiting;
          if (pendingSW) {
            pendingSW.postMessage({ type: "SKIP_WAITING" });
            // Aguarda o novo SW assumir o controle antes de recarregar
            await new Promise<void>((resolve) => {
              const onControllerChange = () => {
                navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
                resolve();
              };
              navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
              // Segurança: recarrega em até 4s mesmo que o evento não dispare
              setTimeout(resolve, 4000);
            });
          }
        }
      }
    } catch {
      // API de SW indisponível — recarrega normalmente
    }
    window.location.reload();
  };

  return (
    <div className="flex flex-col min-h-dvh">
      <header
        className="flex items-center justify-between px-5 py-3 sticky top-0 z-30"
        style={{ backgroundColor: colors.headerBg }}
      >
        <h1 className="text-white font-semibold text-base tracking-tight">
          Grupos de Crescimento
        </h1>
        <div className="flex items-center align-middle gap-3">
          <button
          onClick={toggleTheme}
          className="p-1.5 rounded-full hover:opacity-70 transition-opacity"
          aria-label="Alternar tema"
        >
          {dark ? <Sun size={20} color="#fff" /> : <Moon size={20} color="#fff" />}
        </button>
        <button
          onClick={handleReload}
          disabled={updating}
          className="p-1.5 rounded-full hover:opacity-70 transition-opacity flex items-center justify-center"
          aria-label="Recarregar"
        >
          <RefreshCw size={20} color="#fff" className={updating ? "animate-spin" : ""} />
        </button>
        </div>
      </header>

      <main className="flex-1 pb-24">{children}</main>

      <nav
        className="fixed bottom-0 left-0 right-0 flex justify-around items-center px-2 py-3 border-t z-20"
        style={{
          backgroundColor: colors.headerBg,
          borderColor: colors.border,
        }}
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 flex-1 min-w-0 py-1 px-1 rounded-lg transition-colors"
              aria-label={label}
              title={label}
              style={{
                color: active ? (dark ? colors.primary : '#FFFFFF') : colors.headerText,
                fontWeight: active ? 'bold' : 'normal',
                transform: active ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium leading-tight truncate w-full text-center">{label}</span>
            </Link>
          );
        })}
      </nav>
      <InstallBanner />
    </div>
  );
}
