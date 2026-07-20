import { notFound } from "next/navigation";
import { confissoes } from "@/data/confissoes";
import { getConfissaoById } from "@/services/confissoes";
import DocumentoLeituraView from "@/components/DocumentoLeituraView";

interface Props {
  params: Promise<{ confissaoId: string }>;
}

export function generateStaticParams() {
  return confissoes.map((c) => ({ confissaoId: c.id }));
}

export default async function ConfissaoPage({ params }: Props) {
  const { confissaoId } = await params;
  const item = getConfissaoById(confissaoId);
  if (!item) notFound();

  return (
    <DocumentoLeituraView
      item={item}
      backHref="/vida-espiritual/confissoes"
      backLabel="Confissões"
      eyebrowSingular="Confissão"
      pdfBasePath="/confissoes"
    />
  );
}
