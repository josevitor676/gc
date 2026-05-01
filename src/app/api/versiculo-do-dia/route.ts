import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buscarVersiculo, getVersiculoDaData } from "@/lib/vida-espiritual/bible";
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

async function getLatestVersiculoCache() {
  return prisma.versiculoCache.findFirst({
    orderBy: { data: "desc" },
  });
}

export async function GET() {
  const hoje = getBrazilDateKey();
  const dataDb = dateKeyToDbDate(hoje);

  const existente = await prisma.versiculoCache.findUnique({ where: { data: dataDb } });
  if (existente) {
    return NextResponse.json({ source: "db", data: existente });
  }

  try {
    const referencia = getVersiculoDaData(hoje);
    const versiculo = await buscarVersiculo(referencia);

    const novo = await prisma.versiculoCache.create({
      data: {
        data: dataDb,
        ...versiculo,
      },
    });

    return NextResponse.json({ source: "api", data: novo });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      const cache = await prisma.versiculoCache.findUnique({ where: { data: dataDb } });
      if (cache) {
        return NextResponse.json({ source: "db", data: cache });
      }
    }

    const fallback = await getLatestVersiculoCache();
    if (fallback) {
      return NextResponse.json({
        source: "fallback-db",
        warning: "API biblica indisponivel. Exibindo o versiculo mais recente salvo.",
        data: fallback,
      });
    }

    return NextResponse.json(
      {
        error: "Falha ao carregar versiculo do dia",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 503 }
    );
  }
}
