import { notFound } from "next/navigation";
import { teologias } from "@/data/teologia";
import { getTeologiaById } from "@/services/teologia";
import DocumentoLeituraView from "@/components/DocumentoLeituraView";

interface Props {
  params: Promise<{ teologiaId: string }>;
}

export function generateStaticParams() {
  return teologias.map((t) => ({ teologiaId: t.id }));
}

export default async function TeologiaItemPage({ params }: Props) {
  const { teologiaId } = await params;
  const item = getTeologiaById(teologiaId);
  if (!item) notFound();

  return (
    <DocumentoLeituraView
      item={item}
      backHref="/vida-espiritual/teologia"
      backLabel="Teologia reformada"
      eyebrowSingular="Teologia reformada"
      pdfBasePath="/teologia"
    />
  );
}
