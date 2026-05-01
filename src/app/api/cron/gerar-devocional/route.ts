import { NextRequest, NextResponse } from "next/server";
import { gerarDevocional } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { dateKeyToDbDate, getBrazilDateKey } from "@/lib/vida-espiritual/date";

export const runtime = "nodejs";

function isUniqueConstraintError(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: unknown }).code === "P2002"
  );
}

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET nao configurado" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hoje = getBrazilDateKey();
  const dataDb = dateKeyToDbDate(hoje);

  const existente = await prisma.devocional.findUnique({ where: { data: dataDb } });
  if (existente) {
    return NextResponse.json({ message: "Devocional ja existe para hoje", data: existente });
  }

  try {
    const gerado = await gerarDevocional();
    const novo = await prisma.devocional.create({
      data: {
        data: dataDb,
        ...gerado,
      },
    });

    return NextResponse.json({ message: "Devocional gerado com sucesso", data: novo });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      const devocional = await prisma.devocional.findUnique({ where: { data: dataDb } });
      if (devocional) {
        return NextResponse.json({
          message: "Devocional ja existia (concorrencia)",
          data: devocional,
        });
      }
    }

    return NextResponse.json(
      {
        error: "Falha ao gerar devocional do dia",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 503 }
    );
  }
}
