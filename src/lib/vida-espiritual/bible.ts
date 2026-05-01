const VERSICULO_REFS = [
  "filipenses 4:13",
  "jeremias 29:11",
  "salmos 23:1",
  "joao 3:16",
  "romanos 8:28",
  "proverbios 3:5-6",
  "isaias 40:31",
  "mateus 6:33",
  "salmos 119:105",
  "2 timoteo 1:7",
  "galatas 5:22-23",
  "marcos 11:24",
  "hebreus 11:1",
  "salmos 46:1",
  "efesios 2:8-9",
  "tiago 1:5",
  "joao 14:6",
  "1 pedro 5:7",
  "romanos 12:2",
  "mateus 11:28",
];

interface BibleApiResponse {
  text?: string;
  reference?: string;
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function getDayOfYear(dateKey: string): number {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

export function getVersiculoDaData(dateKey: string): string {
  const day = getDayOfYear(dateKey);
  return VERSICULO_REFS[day % VERSICULO_REFS.length];
}

export async function buscarVersiculo(referencia: string): Promise<{
  versiculo: string;
  referencia: string;
  livro: string;
}> {
  const ref = encodeURIComponent(referencia);
  const response = await fetch(`https://bible-api.com/${ref}?translation=almeida`, {
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar versiculo (${response.status})`);
  }

  const payload = (await response.json()) as BibleApiResponse;
  const versiculo = normalizeWhitespace(payload.text ?? "");
  const referenciaResolvida = normalizeWhitespace(payload.reference ?? "");

  if (!versiculo || !referenciaResolvida) {
    throw new Error("Resposta da API biblica em formato inesperado");
  }

  const livro = referenciaResolvida.replace(/\d+:\d+.*$/, "").trim() || referencia;

  return {
    versiculo,
    referencia: referenciaResolvida,
    livro,
  };
}
