"use client";

import DocumentoLeituraList from "@/components/DocumentoLeituraList";
import { getTeologias } from "@/services/teologia";

export default function TeologiaPage() {
  return (
    <DocumentoLeituraList
      items={getTeologias()}
      backHref="/vida-espiritual"
      backLabel="Vida espiritual"
      eyebrow="Doutrinas da Reforma"
      titulo="Teologia reformada"
      descricao="Documentos e resumos da fé reformada — as bases da Reforma Protestante."
      basePath="/vida-espiritual/teologia"
      tint="#E7EDFB"
      ink="#1E3A8A"
    />
  );
}
