const KEY = "gc-favoritos";

function ler(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function gravar(ids: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // ignora indisponibilidade do storage
  }
}

export function getFavoritos(): string[] {
  return ler();
}

export function isFavorito(studyId: string): boolean {
  return ler().includes(studyId);
}

export function toggleFavorito(studyId: string): boolean {
  const ids = ler();
  const i = ids.indexOf(studyId);
  if (i === -1) {
    ids.push(studyId);
    gravar(ids);
    return true;
  }
  ids.splice(i, 1);
  gravar(ids);
  return false;
}
