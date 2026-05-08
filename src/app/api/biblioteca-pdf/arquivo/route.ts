import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const idParam = request.nextUrl.searchParams.get("id");
  const id = Number(idParam);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "ID invalido." }, { status: 400 });
  }

  const pdf = await prisma.bibliotecaPDF.findUnique({
    where: { id },
    select: {
      nomeArquivo: true,
      conteudoBase64: true,
    },
  });

  if (!pdf) {
    return NextResponse.json({ error: "PDF nao encontrado." }, { status: 404 });
  }

  const buffer = Buffer.from(pdf.conteudoBase64, "base64");
  const fallbackName = "documento.pdf";
  const safeName = pdf.nomeArquivo?.trim() ? pdf.nomeArquivo : fallbackName;

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(buffer.byteLength),
      "Content-Disposition": `inline; filename="${safeName.replace(/\"/g, "")}"`,
      "Cache-Control": "public, max-age=300",
      "X-Frame-Options": "SAMEORIGIN",
      "Content-Security-Policy": "frame-ancestors 'self'",
    },
  });
}
