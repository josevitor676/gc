export interface DiaPlano {
  dia: number;
  titulo: string;
  referencia: string;
  descricao?: string;
}

const getChave = (planoId: string) => `plano_leitura_${planoId}`;

function parseProgress(raw: string | null): Record<number, boolean> {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const normalized: Record<number, boolean> = {};

    for (const [key, value] of Object.entries(parsed)) {
      const day = Number(key);
      if (Number.isInteger(day) && day > 0) {
        normalized[day] = Boolean(value);
      }
    }

    return normalized;
  } catch {
    return {};
  }
}

export function getProgresso(planoId: string): Record<number, boolean> {
  if (typeof window === "undefined") {
    return {};
  }

  return parseProgress(localStorage.getItem(getChave(planoId)));
}

export function marcarDia(planoId: string, dia: number, lido: boolean): Record<number, boolean> {
  const progresso = getProgresso(planoId);
  progresso[dia] = lido;

  if (typeof window !== "undefined") {
    localStorage.setItem(getChave(planoId), JSON.stringify(progresso));
  }

  return progresso;
}

export function calcularPercentual(progresso: Record<number, boolean>, totalDias: number): number {
  if (totalDias <= 0) {
    return 0;
  }

  const lidos = Object.values(progresso).filter(Boolean).length;
  return Math.round((lidos / totalDias) * 100);
}
