import { studies } from "@/data/estudos";
import StudyPageContent from "./StudyPageContent";

interface Props {
  params: Promise<{ studyId: string }>;
}

export function generateStaticParams() {
  return studies.map((s) => ({ studyId: s.id }));
}

export default async function StudyPage({ params }: Props) {
  const { studyId } = await params;
  return <StudyPageContent studyId={studyId} />;
}
