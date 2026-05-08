import type { BibliotecaPdfItem } from "@/types";

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? "Erro inesperado na biblioteca.";
  } catch {
    return "Erro inesperado na biblioteca.";
  }
}

export async function listarBiblioteca(): Promise<BibliotecaPdfItem[]> {
  const response = await fetch("/api/biblioteca-pdf", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as BibliotecaPdfItem[];
}

export function getBibliotecaPdfUrl(id: number): string {
  return `/api/biblioteca-pdf/arquivo?id=${id}`;
}
