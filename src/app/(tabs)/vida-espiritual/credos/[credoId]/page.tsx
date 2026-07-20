import { notFound } from "next/navigation";
import { credos } from "@/data/credos";
import { getCredoById } from "@/services/credos";
import DocumentoLeituraView from "@/components/DocumentoLeituraView";

interface Props {
  params: Promise<{ credoId: string }>;
}

export function generateStaticParams() {
  return credos.map((c) => ({ credoId: c.id }));
}

export default async function CredoPage({ params }: Props) {
  const { credoId } = await params;
  const item = getCredoById(credoId);
  if (!item) notFound();

  return (
    <DocumentoLeituraView
      item={item}
      backHref="/vida-espiritual/credos"
      backLabel="Credos históricos"
      eyebrowSingular="Credo histórico"
      pdfBasePath="/credos"
    />
  );
}
