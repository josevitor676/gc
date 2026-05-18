import efesiosData from "@/data/estudos/efesios.json";
import catecismo1Data from "@/data/estudos/catecismo-nova-cidade-1.json";
import catecismo2Data from "@/data/estudos/catecismo-nova-cidade-2.json";
import StudyPageContent from "./StudyPageContent";

const studies = [efesiosData, catecismo1Data, catecismo2Data];

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
