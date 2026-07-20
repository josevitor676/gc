"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, HandHeart, Heart } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface Notificacao {
  id: string;
  tipo: "pedido-oracao" | "devocional";
  titulo: string;
  descricao: string;
  data: string;
  href: string;
}

const LAST_SEEN_KEY = "notificacoes:lastSeen";

function getLastSeen(): string {
  try {
    return localStorage.getItem(LAST_SEEN_KEY) ?? "";
  } catch {
    return "";
  }
}

function saveLastSeen(iso: string) {
  try {
    localStorage.setItem(LAST_SEEN_KEY, iso);
  } catch {
    // armazenamento indisponível — badge volta a aparecer na próxima visita
  }
}

function formatarData(iso: string): string {
  const data = new Date(iso);
  const agora = new Date();
  const mesmoDia = data.toDateString() === agora.toDateString();
  if (mesmoDia) {
    return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  const ontem = new Date(agora);
  ontem.setDate(agora.getDate() - 1);
  if (data.toDateString() === ontem.toDateString()) {
    return "Ontem";
  }
  return data.toLocaleDateString("pt-BR");
}

const ICONES = {
  "pedido-oracao": HandHeart,
  devocional: Heart,
} as const;

export default function NotificationBell() {
  const { colors } = useTheme();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [lastSeen, setLastSeen] = useState("");
  const [open, setOpen] = useState(false);
  const [novas, setNovas] = useState<Set<string>>(new Set());
  const carregouRef = useRef(false);

  const carregar = useCallback(async () => {
    try {
      const res = await fetch("/api/notificacoes", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as Notificacao[];
      setNotificacoes(data);
      carregouRef.current = true;
    } catch {
      // offline ou erro de rede: mantém o que já tem
    }
  }, []);

  useEffect(() => {
    setLastSeen(getLastSeen());
    void carregar();

    const onFocus = () => void carregar();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [carregar]);

  const naoLidas = notificacoes.filter((n) => n.data > lastSeen);
  const badge = naoLidas.length;

  function handleToggle() {
    if (!open) {
      // Guarda quais eram novas para destacá-las no painel, e marca tudo como visto
      setNovas(new Set(naoLidas.map((n) => n.id)));
      if (notificacoes.length > 0) {
        const maisRecente = notificacoes.reduce((max, n) => (n.data > max ? n.data : max), lastSeen);
        setLastSeen(maisRecente);
        saveLastSeen(maisRecente);
      }
    }
    setOpen((v) => !v);
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="p-1.5 rounded-full hover:opacity-70 transition-opacity relative"
        aria-label={badge > 0 ? `Notificações: ${badge} novas` : "Notificações"}
        aria-expanded={open}
      >
        <Bell size={20} color="#fff" />
        {badge > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
            style={{ backgroundColor: "#DC2626", color: "#fff" }}
          >
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div
            className="absolute right-0 top-full mt-2 z-50 w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl border shadow-lg overflow-hidden"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
            role="region"
            aria-label="Notificações"
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: colors.border }}>
              <p className="text-sm font-bold" style={{ color: colors.text }}>
                Notificações
              </p>
            </div>

            {notificacoes.length === 0 ? (
              <p className="px-4 py-6 text-sm text-center" style={{ color: colors.textMuted }}>
                {carregouRef.current ? "Sem novidades por enquanto." : "Não foi possível carregar. Verifique sua conexão."}
              </p>
            ) : (
              <ul className="max-h-[60dvh] overflow-y-auto">
                {notificacoes.map((n) => {
                  const Icone = ICONES[n.tipo];
                  const nova = novas.has(n.id);
                  return (
                    <li key={n.id} className="border-b last:border-b-0" style={{ borderColor: colors.divider }}>
                      <Link
                        href={n.href}
                        onClick={() => setOpen(false)}
                        className="flex items-start gap-3 px-4 py-3 transition-opacity hover:opacity-80"
                      >
                        <span
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                          style={{ backgroundColor: colors.badgeBg, color: colors.badgeText }}
                        >
                          <Icone size={16} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold truncate" style={{ color: colors.text }}>
                              {n.titulo}
                            </span>
                            {nova && (
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: colors.primary }}
                                aria-label="Nova"
                              />
                            )}
                          </span>
                          <span className="block text-xs mt-0.5 line-clamp-2" style={{ color: colors.textSecondary }}>
                            {n.descricao}
                          </span>
                          <span className="block text-[11px] mt-1" style={{ color: colors.textMuted }}>
                            {formatarData(n.data)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
