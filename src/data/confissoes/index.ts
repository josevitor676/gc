import type { Confissao } from "@/types";
import heidelberg from "./heidelberg.json";
import canonesDeDort from "./canones-de-dort.json";
import confissaoBelga from "./confissao-belga.json";
import confissaoGuanabara from "./confissao-guanabara.json";
import westminsterMaior from "./westminster-maior.json";
import westminsterBreve from "./westminster-breve.json";
import westminsterConfissao from "./westminster-confissao.json";

// Registro central das confissões/símbolos reformados. As de tipo "leitura"
// (Heidelberg, Dort) são geradas por scripts/pdf-to-confissao-json.ts a partir
// dos PDFs com texto; as de tipo "pdf" (Belga, Guanabara) são digitalizações
// exibidas em visualizador, com o arquivo em public/confissoes/.
// Para publicar uma nova confissão, adicione o JSON aqui — o serviço, a lista e
// as páginas SSG leem todas a partir desta lista.
export const confissoes = [
  heidelberg,
  canonesDeDort,
  confissaoBelga,
  confissaoGuanabara,
  westminsterMaior,
  westminsterBreve,
  westminsterConfissao,
] as unknown as Confissao[];
