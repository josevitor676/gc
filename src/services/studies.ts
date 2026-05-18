import type { Study, Lesson } from "@/types";
import efesiosData from "@/data/estudos/efesios.json";
import catecismo1Data from "@/data/estudos/catecismo-nova-cidade-1.json";
import catecismo2Data from "@/data/estudos/catecismo-nova-cidade-2.json";

const studies = [efesiosData, catecismo1Data, catecismo2Data] as Study[];

export function getStudies(): Study[] {
  return studies;
}

export function getStudyById(id: string): Study | null {
  return studies.find((s) => s.id === id) ?? null;
}

export function getLessonById(studyId: string, lessonId: string): Lesson | null {
  const study = getStudyById(studyId);
  if (!study) return null;
  return study.lessons.find((l) => l.id === lessonId) ?? null;
}
