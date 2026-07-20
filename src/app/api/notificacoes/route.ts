import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dateKeyToDbDate, getBrazilDateKey } from "@/lib/vida-espiritual/date";

export const runtime = "nodejs";

const MAX_PEDIDOS = 20;
const DESCRICAO_MAX = 90;

export interface Notificacao {
  id: string;
  tipo: "pedido-oracao" | "devocional";
  titulo: string;
  descricao: string;
  data: string;
  href: string;
}

function resumir(texto: string): string {
  const limpo = texto.trim().replace(/\s+/g, " ");
  return limpo.length > DESCRICAO_MAX ? `${limpo.slice(0, DESCRICAO_MAX - 1)}…` : limpo;
}

export async function GET() {
  const dataHoje = dateKeyToDbDate(getBrazilDateKey());

  const [pedidos, devocionalHoje] = await Promise.all([
    prisma.pedidoOracao.findMany({
      where: { ativo: true },
      orderBy: { criadoEm: "desc" },
      take: MAX_PEDIDOS,
    }),
    // Apenas consulta — a geração fica a cargo do cron e da página do devocional
    prisma.devocional.findUnique({ where: { data: dataHoje } }),
  ]);

  const notificacoes: Notificacao[] = pedidos.map((p) => ({
    id: `pedido-${p.id}`,
    tipo: "pedido-oracao",
    titulo: p.solicitante ? `Novo pedido de oração — ${p.solicitante}` : "Novo pedido de oração",
    descricao: resumir(p.pedido),
    data: p.criadoEm.toISOString(),
    href: "/vida-espiritual/oracao",
  }));

  if (devocionalHoje) {
    notificacoes.push({
      id: `devocional-${getBrazilDateKey()}`,
      tipo: "devocional",
      titulo: "Devocional de hoje disponível",
      descricao: resumir(devocionalHoje.titulo),
      data: devocionalHoje.criadoEm.toISOString(),
      href: "/vida-espiritual/devocional",
    });
  }

  notificacoes.sort((a, b) => (a.data < b.data ? 1 : -1));

  return NextResponse.json(notificacoes);
}
