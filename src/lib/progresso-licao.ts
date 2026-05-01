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
