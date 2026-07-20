import type { DocumentoLeitura } from "@/types";
import credoApostolico from "./credo-apostolico.json";
import credoNiceno from "./credo-niceno.json";
import credoCalcedonia from "./credo-calcedonia.json";

// Registro central dos credos históricos da igreja. Mesma estrutura das
// confissões e da teologia (documentos de leitura). Para publicar um novo,
// adicione o JSON aqui — o serviço, a lista e as páginas SSG leem daqui.
export const credos = [
  credoApostolico,
  credoNiceno,
  credoCalcedonia,
] as unknown as DocumentoLeitura[];
