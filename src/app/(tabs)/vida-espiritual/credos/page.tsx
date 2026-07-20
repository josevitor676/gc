"use client";

import DocumentoLeituraList from "@/components/DocumentoLeituraList";
import { getCredos } from "@/services/credos";

export default function CredosPage() {
  return (
    <DocumentoLeituraList
      items={getCredos()}
      backHref="/vida-espiritual"
      backLabel="Vida espiritual"
      eyebrow="A fé da igreja antiga"
      titulo="Credos históricos"
      descricao="As confissões ecumênicas da igreja cristã dos primeiros séculos."
      basePath="/vida-espiritual/credos"
      tint="#EDE7FB"
      ink="#4A2A7C"
    />
  );
}
