"use client";

import DocumentoLeituraList from "@/components/DocumentoLeituraList";
import { getConfissoes } from "@/services/confissoes";

export default function ConfissoesPage() {
  return (
    <DocumentoLeituraList
      items={getConfissoes()}
      backHref="/vida-espiritual"
      backLabel="Vida espiritual"
      eyebrow="Símbolos de fé"
      titulo="Confissões"
      descricao="As confissões e catecismos históricos das igrejas reformadas."
      basePath="/vida-espiritual/confissoes"
      tint="#F6ECD8"
      ink="#7A4A16"
    />
  );
}
