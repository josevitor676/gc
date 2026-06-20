"use client";

import Link from "next/link";
import { Heart, BookOpen, HandHeart, ChevronRight } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const ITENS = [
  {
    href: "/vida-espiritual/devocional",
    label: "Devocional",
    desc: "A palavra de Deus para o seu dia",
    icon: Heart,
    tint: "#FBEAF0",
    ink: "#72243E",
  },
  {
    href: "/vida-espiritual/leitura",
    label: "Plano de leitura",
    desc: "Leia o Novo Testamento em um ano",
    icon: BookOpen,
    tint: "#E6F1FB",
    ink: "#0C447C",
  },
  {
    href: "/vida-espiritual/oracao",
    label: "Mural de oração",
    desc: "Compartilhe e interceda por pedidos",
    icon: HandHeart,
    tint: "#E1F5EE",
    ink: "#085041",
  },
];

export default function VidaEspiritualPage() {
  const { colors } = useTheme();

  return (
    <div className="px-5 py-6 max-w-2xl mx-auto md:max-w-3xl">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: colors.textMuted }}>
          Sua caminhada com Deus
        </p>
        <h2 className="text-2xl font-extrabold mt-1 leading-tight" style={{ color: colors.text }}>
          Vida espiritual
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {ITENS.map(({ href, label, desc, icon: Icon, tint, ink }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-2xl border p-4 active:scale-[0.99] transition-transform"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: tint, color: ink }}
            >
              <Icon size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold" style={{ color: colors.text }}>
                {label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
                {desc}
              </p>
            </div>
            <ChevronRight size={20} color={colors.textMuted} />
          </Link>
        ))}
      </div>
    </div>
  );
}
