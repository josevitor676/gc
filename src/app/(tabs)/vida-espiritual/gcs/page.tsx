"use client";

import { useMemo, useState } from "react";
import { Clock, LocateFixed, MessageCircle, Navigation, Users } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { waLink, mapsLink } from "@/lib/links";
import { GRUPOS_CRESCIMENTO, whatsappDigits, type GrupoCrescimento } from "@/data/gcs";

const ORDEM_DIAS = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

type Coordenadas = { lat: number; lng: number };

function distanciaKm(a: Coordenadas, b: Coordenadas): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function formatarDistancia(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace(".", ",")} km`;
}

export default function GcsPage() {
  const { colors } = useTheme();
  const [diaFiltro, setDiaFiltro] = useState<string | null>(null);
  const [posicao, setPosicao] = useState<Coordenadas | null>(null);
  const [buscandoPosicao, setBuscandoPosicao] = useState(false);
  const [erroPosicao, setErroPosicao] = useState<string | null>(null);

  const dias = useMemo(
    () =>
      [...new Set(GRUPOS_CRESCIMENTO.map((g) => g.dia))].sort(
        (a, b) => ORDEM_DIAS.indexOf(a) - ORDEM_DIAS.indexOf(b)
      ),
    []
  );

  const grupos = useMemo(() => {
    const filtrados = diaFiltro
      ? GRUPOS_CRESCIMENTO.filter((g) => g.dia === diaFiltro)
      : [...GRUPOS_CRESCIMENTO];

    if (posicao) {
      return filtrados
        .map((g) => ({ ...g, distancia: distanciaKm(posicao, g) }))
        .sort((a, b) => a.distancia - b.distancia);
    }

    return filtrados
      .map((g) => ({ ...g, distancia: null as number | null }))
      .sort(
        (a, b) =>
          ORDEM_DIAS.indexOf(a.dia) - ORDEM_DIAS.indexOf(b.dia) ||
          a.hora.localeCompare(b.hora) ||
          a.nome.localeCompare(b.nome)
      );
  }, [diaFiltro, posicao]);

  function usarLocalizacao() {
    if (buscandoPosicao) return;
    if (posicao) {
      setPosicao(null);
      return;
    }
    if (!("geolocation" in navigator)) {
      setErroPosicao("Seu aparelho não oferece localização.");
      return;
    }
    setBuscandoPosicao(true);
    setErroPosicao(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosicao({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setBuscandoPosicao(false);
      },
      () => {
        setErroPosicao("Não foi possível obter sua localização. Verifique a permissão no navegador.");
        setBuscandoPosicao(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }

  function mensagemWhatsApp(g: GrupoCrescimento): string {
    return `Olá! Vi o ${g.nome} no app da IPVO e gostaria de participar de um encontro.`;
  }

  function Chip({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
        style={{
          backgroundColor: ativo ? colors.primary : colors.surfaceAlt,
          color: ativo ? "#fff" : colors.textSecondary,
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <div className="px-5 py-6 max-w-2xl mx-auto md:max-w-3xl">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: colors.textMuted }}>
          Comunhão durante a semana
        </p>
        <h2 className="text-2xl font-extrabold mt-1 leading-tight" style={{ color: colors.text }}>
          Encontre seu GC
        </h2>
        <p className="text-sm mt-2" style={{ color: colors.textSecondary }}>
          Os Grupos de Crescimento se reúnem nos lares durante a semana. Escolha um perto de você e fale
          com o líder pelo WhatsApp — você será muito bem-vindo!
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Chip ativo={diaFiltro === null} onClick={() => setDiaFiltro(null)}>
          Todos
        </Chip>
        {dias.map((dia) => (
          <Chip key={dia} ativo={diaFiltro === dia} onClick={() => setDiaFiltro(diaFiltro === dia ? null : dia)}>
            {dia.replace("-feira", "")}
          </Chip>
        ))}
      </div>

      <button
        type="button"
        onClick={usarLocalizacao}
        disabled={buscandoPosicao}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors mb-4"
        style={{
          backgroundColor: posicao ? "#E1F5EE" : colors.primaryBg,
          color: posicao ? "#085041" : colors.badgeText,
        }}
      >
        <LocateFixed size={14} className={buscandoPosicao ? "animate-pulse" : ""} />
        {buscandoPosicao
          ? "Localizando..."
          : posicao
            ? "Ordenado por distância · limpar"
            : "Ordenar pelos mais próximos"}
      </button>

      {erroPosicao && (
        <p className="text-xs mb-4 -mt-2" style={{ color: colors.textMuted }}>
          {erroPosicao}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {grupos.map((g) => (
          <article
            key={g.id}
            className="rounded-2xl border p-4"
            style={{ backgroundColor: colors.card, borderColor: colors.border }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: colors.primaryBg, color: colors.primary }}
                >
                  <Users size={18} />
                </span>
                <h3 className="text-base font-bold truncate" style={{ color: colors.text }}>
                  {g.nome}
                </h3>
              </div>
              {g.distancia !== null && (
                <span
                  className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-bold"
                  style={{ backgroundColor: colors.badgeBg, color: colors.badgeText }}
                >
                  {formatarDistancia(g.distancia)}
                </span>
              )}
            </div>

            <p className="flex items-center gap-1.5 text-sm mt-3" style={{ color: colors.textSecondary }}>
              <Clock size={14} />
              {g.dia}, às {g.hora}
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              <a
                href={waLink(whatsappDigits(g.whatsapp), mensagemWhatsApp(g))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ backgroundColor: colors.primary, color: "#fff" }}
              >
                <MessageCircle size={14} />
                Quero participar
              </a>
              <a
                href={mapsLink(`${g.lat},${g.lng}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ backgroundColor: colors.primaryBg, color: colors.badgeText }}
              >
                <Navigation size={14} />
                Como chegar
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
