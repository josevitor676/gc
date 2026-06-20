const PREFIX = "gc-progresso-";

function key(studyId: string, lessonId: string): string {
  return `${PREFIX}${studyId}__${lessonId}`;
}

export function isLicaoLida(studyId: string, lessonId: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(key(studyId, lessonId)) === "1";
}

export function marcarLicaoLida(studyId: string, lessonId: string): void {
  localStorage.setItem(key(studyId, lessonId), "1");
}

export function desmarcarLicaoLida(studyId: string, lessonId: string): void {
  localStorage.removeItem(key(studyId, lessonId));
}

export function getProgressoEstudo(studyId: string, lessonIds: string[]): number {
  if (typeof window === "undefined") return 0;
  return lessonIds.filter((id) => isLicaoLida(studyId, id)).length;
}

const ULTIMA_KEY = "gc-ultima-licao";

export interface UltimaLicao {
  studyId: string;
  lessonId: string;
}

export function registrarUltimaLicao(studyId: string, lessonId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ULTIMA_KEY, JSON.stringify({ studyId, lessonId }));
  } catch {
    // ignora indisponibilidade do storage
  }
}

export function getUltimaLicao(): UltimaLicao | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ULTIMA_KEY);
    return raw ? (JSON.parse(raw) as UltimaLicao) : null;
  } catch {
    return null;
  }
}
