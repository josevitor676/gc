import studies from "@/data/studies.json";
import LessonPageContent from "./LessonPageContent";

interface Props {
  params: Promise<{ studyId: string; lessonId: string }>;
}

export function generateStaticParams() {
  return (studies as Array<{ id: string; lessons: Array<{ id: string }> }>).flatMap((s) =>
    s.lessons.map((l) => ({ studyId: s.id, lessonId: l.id }))
  );
}

export default async function LessonPage({ params }: Props) {
  const { studyId, lessonId } = await params;
  return <LessonPageContent studyId={studyId} lessonId={lessonId} />;
}

