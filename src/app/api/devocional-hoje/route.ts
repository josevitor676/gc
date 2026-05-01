import { NextResponse } from "next/server";
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

async function getLatestDevocional() {
  return prisma.devocional.findFirst({
    orderBy: { data: "desc" },
  });
}

export async function GET() {
  const hoje = getBrazilDateKey();
  const dataDb = dateKeyToDbDate(hoje);

  const existente = await prisma.devocional.findUnique({ where: { data: dataDb } });
  if (existente) {
    return NextResponse.json({ source: "db", data: existente });
  }

  try {
    const gerado = await gerarDevocional();
    const novo = await prisma.devocional.create({
      data: {
        data: dataDb,
        ...gerado,
      },
    });

    return NextResponse.json({ source: "on-demand", data: novo });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      const devocional = await prisma.devocional.findUnique({ where: { data: dataDb } });
      if (devocional) {
        return NextResponse.json({ source: "db", data: devocional });
      }
    }

    const fallback = await getLatestDevocional();
    if (fallback) {
      return NextResponse.json({
        source: "fallback-db",
        warning: "Gemini indisponivel. Exibindo o devocional mais recente salvo.",
        data: fallback,
      });
    }

    return NextResponse.json(
      {
        error: "Falha ao carregar devocional do dia",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 503 }
    );
  }
}
