"use client";

import { useState } from "react";
import { MapPin, Users, Clock, HandCoins, Copy, Check, Phone, MessageCircle, Mail, Navigation } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const TINTS = {
  azul: { tint: "#E6F1FB", ink: "#0C447C" },
  roxo: { tint: "#EEEDFE", ink: "#3C3489" },
  verde: { tint: "#E1F5EE", ink: "#085041" },
  ambar: { tint: "#FAEEDA", ink: "#633806" },
};

function mapsLink(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
export function waLink(digits: string, message?: string) {
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

const SEDE = "Av. Paissandú, 32 - Vila Operária, Maringá - PR, 87050-130";
const MANDAGUACU = "R. Gastão Vidgal, 76 - Vila Bernardino, Mandaguaçu - PR, 87160-000";

const PASTORES = [
  { nome: "Rev. Luciano Rocha", display: "(44) 99104-0617", tel: "5544991040617" },
  { nome: "Rev. Daniel Garcia", display: "(44) 99732-7947", tel: "5544997327947" },
  { nome: "Rev. Dalmo Ribas", display: "(44) 99105-1535", tel: "5544991051535" },
];

const OFERTAS = [
  {
    titulo: "Dízimos e ofertas (Terreno)",
    banco: "Banco Itaú",
    ag: "0113",
    cc: "99239-0",
    pix: "financeiro@ipvo.com.br",
    qr: "/informacoes/qr-terreno.jpeg",
  },
  {
    titulo: "Oferta missionária",
    banco: "Banco Bradesco",
    ag: "0972",
    cc: "4092-4",
    pix: "44 99923-0444",
    qr: "/informacoes/qr-missionaria.jpeg",
  },
];

export default function InformacoesPage() {
  const { colors } = useTheme();
  const [copiado, setCopiado] = useState<string | null>(null);

  async function copiar(valor: string) {
    try {
      await navigator.clipboard.writeText(valor);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = valor;
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiado(valor);
    window.setTimeout(() => setCopiado((v) => (v === valor ? null : v)), 2000);
  }

  function CopyBtn({ valor, rotulo }: { valor: string; rotulo?: string }) {
    const ok = copiado === valor;
    return (
      <button
        type="button"
        onClick={() => copiar(valor)}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors"
        style={{ backgroundColor: ok ? "#E1F5EE" : colors.surfaceAlt, color: ok ? "#085041" : colors.textSecondary }}
        aria-label={`Copiar ${rotulo ?? valor}`}
      >
        {ok ? <Check size={14} /> : <Copy size={14} />}
        {ok ? "Copiado" : "Copiar"}
      </button>
    );
  }

  function Pill({ href, icon: Icon, children }: { href: string; icon: typeof Phone; children: React.ReactNode }) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
        style={{ backgroundColor: colors.primaryBg, color: colors.badgeText }}
      >
        <Icon size={14} />
        {children}
      </a>
    );
  }

  function Card({ children }: { children: React.ReactNode }) {
    return (
      <div className="rounded-2xl border p-4" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        {children}
      </div>
    );
  }

  function Chip({ icon: Icon, titulo, cor }: { icon: typeof MapPin; titulo: string; cor: { tint: string; ink: string } }) {
    return (
      <div className="flex items-center gap-2.5 mb-3">
        <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: cor.tint, color: cor.ink }}>
          <Icon size={18} />
        </span>
        <h3 className="text-base font-bold" style={{ color: colors.text }}>{titulo}</h3>
      </div>
    );
  }

  return (
    <div className="px-5 py-6 max-w-2xl mx-auto md:max-w-3xl">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: colors.textMuted }}>
          Igreja Presbiteriana Vila Operária
        </p>
        <h2 className="text-2xl font-extrabold mt-1 leading-tight" style={{ color: colors.text }}>
          Informações
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        {/* Onde estamos */}
        <Card>
          <Chip icon={MapPin} titulo="Onde estamos" cor={TINTS.azul} />
          <p className="text-sm font-medium" style={{ color: colors.text }}>Sede · Maringá - PR</p>
          <p className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>{SEDE}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Pill href={mapsLink(SEDE)} icon={Navigation}>Como chegar</Pill>
            <Pill href="tel:+554432264473" icon={Phone}>(44) 3226-4473</Pill>
            <Pill href={waLink("5544999230444")} icon={MessageCircle}>WhatsApp</Pill>
          </div>
        </Card>

        {/* Congregação */}
        <Card>
          <Chip icon={MapPin} titulo="Congregação de Mandaguaçu" cor={TINTS.azul} />
          <p className="text-sm font-medium" style={{ color: colors.text }}>Mandaguaçu - PR</p>
          <p className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>{MANDAGUACU}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Pill href={mapsLink(MANDAGUACU)} icon={Navigation}>Como chegar</Pill>
          </div>
        </Card>

        {/* Pastores */}
        <Card>
          <Chip icon={Users} titulo="Pastores" cor={TINTS.roxo} />
          <div className="flex flex-col gap-3">
            {PASTORES.map((p) => (
              <div key={p.tel} className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold" style={{ color: colors.text }}>{p.nome}</p>
                  <p className="text-xs" style={{ color: colors.textMuted }}>{p.display}</p>
                </div>
                <div className="flex gap-2">
                  <Pill href={`tel:+${p.tel}`} icon={Phone}>Ligar</Pill>
                  <Pill href={waLink(p.tel)} icon={MessageCircle}>WhatsApp</Pill>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Secretaria e contato */}
        <Card>
          <Chip icon={Clock} titulo="Secretaria e contato" cor={TINTS.verde} />
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Atendimento: <span style={{ color: colors.text }}>segunda a sexta, 07:30 às 17:00</span>
          </p>

          <div className="mt-3 flex flex-col gap-3">
            <div>
              <p className="text-sm font-semibold" style={{ color: colors.text }}>Secretária · Bruna Emerick</p>
              <div className="flex flex-wrap gap-2 mt-1.5">
                <Pill href="mailto:secretaria@ipvo.com.br" icon={Mail}>E-mail</Pill>
                <CopyBtn valor="secretaria@ipvo.com.br" rotulo="e-mail da secretaria" />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: colors.text }}>Financeiro · Simone Rampim</p>
              <div className="flex flex-wrap gap-2 mt-1.5">
                <Pill href={waLink("5544998854900")} icon={MessageCircle}>WhatsApp</Pill>
                <Pill href="mailto:financeiro@ipvo.com.br" icon={Mail}>E-mail</Pill>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: colors.text }}>Tesoureiro · Roberto Matos</p>
              <div className="flex flex-wrap gap-2 mt-1.5">
                <Pill href={waLink("5544991158044")} icon={MessageCircle}>WhatsApp</Pill>
              </div>
            </div>
          </div>
        </Card>

        {/* Dízimos e ofertas */}
        <Card>
          <Chip icon={HandCoins} titulo="Dízimos e ofertas" cor={TINTS.ambar} />

          <blockquote
            className="px-3 py-3 rounded-r-lg border-l-4 mb-3"
            style={{ backgroundColor: colors.reflectionBg, borderLeftColor: colors.primaryLight }}
          >
            <p className="text-sm italic" style={{ color: colors.textSecondary }}>
              “Trazei todos os dízimos à casa do tesouro… e fazei prova de mim nisto, diz o Senhor dos
              Exércitos, se eu não vos abrir as janelas do céu e não derramar sobre vós bênção sem medida.”
            </p>
            <p className="text-xs font-semibold mt-1.5" style={{ color: colors.primary }}>Malaquias 3:10</p>
          </blockquote>

          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Sua contribuição sustenta a obra de Deus na nossa igreja e comunidade. Toque para copiar a chave
            PIX ou os dados bancários.
          </p>

          <div className="flex flex-col gap-4 mt-4">
            {OFERTAS.map((o) => (
              <div key={o.titulo} className="rounded-2xl p-4" style={{ backgroundColor: colors.surfaceAlt }}>
                <p className="text-sm font-bold" style={{ color: colors.text }}>{o.titulo}</p>

                <div className="flex gap-4 mt-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={o.qr}
                    alt={`QR Code para ${o.titulo}`}
                    width={104}
                    height={104}
                    className="rounded-lg shrink-0 bg-white"
                    style={{ width: 104, height: 104, objectFit: "contain" }}
                  />
                  <div className="min-w-0 flex-1 text-sm" style={{ color: colors.textSecondary }}>
                    <p>{o.banco}</p>
                    <p>Ag: {o.ag} · Cc: {o.cc}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <CopyBtn valor={`Ag ${o.ag} Cc ${o.cc}`} rotulo="dados bancários" />
                    </div>
                    <div className="flex items-center flex-wrap gap-2 mt-2">
                      <span className="text-xs" style={{ color: colors.textMuted }}>PIX: {o.pix}</span>
                      <CopyBtn valor={o.pix} rotulo="chave PIX" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
