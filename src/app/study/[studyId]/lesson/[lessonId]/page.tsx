import efesiosData from "@/data/estudos/efesios.json";
import catecismo1Data from "@/data/estudos/catecismo-nova-cidade-1.json";
import catecismo2Data from "@/data/estudos/catecismo-nova-cidade-2.json";
import LessonPageContent from "./LessonPageContent";

const studies = [efesiosData, catecismo1Data, catecismo2Data];

interface Props {
  params: Promise<{ studyId: string; lessonId: string }>;
}

export function generateStaticParams() {
  return studies.flatMap((s) =>
    s.lessons.map((l) => ({ studyId: s.id, lessonId: l.id }))
  );
}

export default async function LessonPage({ params }: Props) {
  const { studyId, lessonId } = await params;
  return <LessonPageContent studyId={studyId} lessonId={lessonId} />;
}

