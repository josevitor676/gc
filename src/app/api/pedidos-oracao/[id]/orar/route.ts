import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const id = Number.parseInt(idParam, 10);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Pedido invalido." }, { status: 400 });
  }

  const result = await prisma.pedidoOracao.updateMany({
    where: { id, ativo: true },
    data: { oracoes: { increment: 1 } },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Pedido nao encontrado." }, { status: 404 });
  }

  const pedido = await prisma.pedidoOracao.findUnique({ where: { id } });
  return NextResponse.json(pedido);
}
