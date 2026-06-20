const PREFIX = "gc-nota-";

function key(studyId: string, lessonId: string): string {
  return `${PREFIX}${studyId}__${lessonId}`;
}

export function getNota(studyId: string, lessonId: string): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(key(studyId, lessonId)) ?? "";
  } catch {
    return "";
  }
}

export function setNota(studyId: string, lessonId: string, texto: string): void {
  try {
    const k = key(studyId, lessonId);
    if (texto.trim().length === 0) {
      localStorage.removeItem(k);
    } else {
      localStorage.setItem(k, texto);
    }
  } catch {
    // ignora indisponibilidade do storage
  }
}
