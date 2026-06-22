"use client";

import Link from "next/link";
import { Heart, BookOpen, HandHeart, ChevronRight, Send } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { waLink } from "../informacoes/page";

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
      <div className="mt-5">
        <h2 className="text-2xl font-extrabold mt-1 leading-tight" style={{ color: colors.text }}>
          Agendamento
        </h2>
        <Link
            href={waLink("5544999230444", "Olá, gostaria de agendar um horário com o pastor para aconselhamento e oração.")}
            className="flex items-center gap-3 rounded-2xl border p-4 active:scale-[0.99] transition-transform mt-2"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#e7dcf7", color: "#5B21B6" }}
            >
              <Send size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold" style={{ color: colors.text }}>
                Agendamento Pastoral
              </p>
              <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
                Agende um horário com o pastor para aconselhamento e oração
              </p>
            </div>
          </Link>
      </div>
    </div>
  );
}
