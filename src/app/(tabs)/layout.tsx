"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, Book, BookOpen, Heart, HandHeart } from "lucide-react";
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
    href: "/vida-espiritual/leitura",
    label: "Leitura",
    icon: BookOpen,
  },
  {
    href: "/vida-espiritual/oracao",
    label: "Oração",
    icon: HandHeart,
  },
];

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  const { dark, colors, toggleTheme } = useTheme();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex flex-col min-h-dvh">
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

      <main className="flex-1 pb-24">{children}</main>

      <nav
        className="fixed bottom-0 left-0 right-0 flex justify-center items-center gap-8 px-5 py-4 border-t z-20"
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
              className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors"
              aria-label={label}
              title={label}
              style={{
                color: active ? colors.primary : colors.headerText,
              }}
            >
              <Icon size={24} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
      <InstallBanner />
    </div>
  );
}
