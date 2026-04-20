import type { Study, Lesson } from "@/types";
import studiesData from "@/data/studies.json";

const studies = studiesData as Study[];

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
