import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function sanitizeRequiredText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function sanitizeOptionalText(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isPdfFile(file: File, buffer: Buffer): boolean {
  const header = buffer.subarray(0, 4).toString("utf8");

  return (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf") ||
    header === "%PDF"
  );
}

function isDbTimeoutError(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: unknown }).code === "ETIMEDOUT"
  );
}

async function withDbRetry<T>(operation: () => Promise<T>, attempts = 2): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (!isDbTimeoutError(error) || attempts <= 1) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    return withDbRetry(operation, attempts - 1);
  }
}

export async function POST(request: NextRequest) {
  const adminToken = process.env.BIBLIOTECA_ADMIN_TOKEN;

  if (!adminToken) {
    return NextResponse.json(
      { error: "Upload da biblioteca nao configurado no servidor." },
      { status: 503 }
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Requisicao invalida. Envie os dados do formulario." },
      { status: 400 }
    );
  }

  const token = sanitizeRequiredText(formData.get("token"));
  const titulo = sanitizeRequiredText(formData.get("titulo"));
  const descricao = sanitizeOptionalText(formData.get("descricao"));
  const arquivo = formData.get("arquivo");

  if (token !== adminToken) {
    return NextResponse.json({ error: "Token administrativo invalido." }, { status: 401 });
  }

  if (titulo.length < 3) {
    return NextResponse.json(
      { error: "Titulo muito curto. Use pelo menos 3 caracteres." },
      { status: 400 }
    );
  }

  if (!(arquivo instanceof File)) {
    return NextResponse.json({ error: "Selecione um arquivo PDF valido." }, { status: 400 });
  }

  const buffer = Buffer.from(await arquivo.arrayBuffer());

  if (buffer.byteLength === 0) {
    return NextResponse.json({ error: "O arquivo enviado esta vazio." }, { status: 400 });
  }

  if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "O PDF excede o limite de 10 MB para esta fase do projeto." },
      { status: 400 }
    );
  }

  if (!isPdfFile(arquivo, buffer)) {
    return NextResponse.json(
      { error: "Arquivo invalido. Envie um PDF valido." },
      { status: 400 }
    );
  }

  try {
    const novoPdf = await withDbRetry(() =>
      prisma.bibliotecaPDF.create({
        data: {
          titulo,
          descricao,
          nomeArquivo: arquivo.name,
          tamanhoBytes: buffer.byteLength,
          conteudoBase64: buffer.toString("base64"),
        },
        select: {
          id: true,
          titulo: true,
          descricao: true,
          nomeArquivo: true,
          tamanhoBytes: true,
          criadoEm: true,
        },
      })
    );

    return NextResponse.json(novoPdf, { status: 201 });
  } catch (error) {
    if (isDbTimeoutError(error)) {
      return NextResponse.json(
        { error: "Banco de dados indisponivel no momento. Tente novamente em alguns segundos." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao salvar PDF na biblioteca." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const pdfs = await withDbRetry(() =>
      prisma.bibliotecaPDF.findMany({
        select: {
          id: true,
          titulo: true,
          descricao: true,
          nomeArquivo: true,
          tamanhoBytes: true,
          criadoEm: true,
        },
        orderBy: { criadoEm: "desc" },
      })
    );

    return NextResponse.json(pdfs);
  } catch (error) {
    if (isDbTimeoutError(error)) {
      return NextResponse.json(
        { error: "Banco de dados indisponivel no momento. Tente novamente em alguns segundos." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao carregar biblioteca." },
      { status: 500 }
    );
  }
}