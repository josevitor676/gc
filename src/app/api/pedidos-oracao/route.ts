import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const PEDIDO_MIN = 10;
const PEDIDO_MAX = 500;

function sanitizeOptionalText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function sanitizeRequiredText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  const pedidos = await prisma.pedidoOracao.findMany({
    where: { ativo: true },
    orderBy: { criadoEm: "desc" },
    take: 50,
  });

  return NextResponse.json(pedidos);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { solicitante?: unknown; pedido?: unknown };
    const solicitante = sanitizeOptionalText(body.solicitante);
    const pedido = sanitizeRequiredText(body.pedido);

    if (pedido.length < PEDIDO_MIN) {
      return NextResponse.json(
        { error: "Pedido muito curto. Descreva melhor sua necessidade." },
        { status: 400 }
      );
    }

    if (pedido.length > PEDIDO_MAX) {
      return NextResponse.json(
        { error: "Pedido muito longo. Maximo de 500 caracteres." },
        { status: 400 }
      );
    }

    const novo = await prisma.pedidoOracao.create({
      data: {
        solicitante,
        pedido,
      },
    });

    return NextResponse.json(novo, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisicao invalido. Envie JSON valido." },
      { status: 400 }
    );
  }
}
