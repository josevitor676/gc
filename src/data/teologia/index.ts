import type { DocumentoLeitura } from "@/types";
import as95Teses from "./95-teses.json";
import cincoSolas from "./cinco-solas.json";
import cincoPontos from "./cinco-pontos-calvinismo.json";

// Registro central dos documentos de Teologia reformada. Mesma estrutura das
// confissões: documentos de tipo "pdf" (digitalizações em public/teologia/) ou
// "leitura" (gerados por scripts/pdf-to-confissao-json.ts a partir de texto).
// Para publicar um novo, adicione o JSON aqui — o serviço, a lista e as páginas
// SSG leem todos a partir desta lista.
export const teologias = [
  as95Teses,
  cincoSolas,
  cincoPontos,
] as unknown as DocumentoLeitura[];
