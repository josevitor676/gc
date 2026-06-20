import type { Study } from "@/types";
import efesios from "./efesios.json";
import catecismo1 from "./catecismo-nova-cidade-1.json";
import catecismo2 from "./catecismo-nova-cidade-2.json";
import catecismo3 from "./catecismo-nova-cidade-3.json";
import milagresDeJesus from "./milagres-de-jesus.json";
import caminhoDoPeregrino from "./caminho-do-peregrino.json";
import proverbiosDeJesus from "./proverbios-de-jesus.json";
import quemEJesus from "./quem-e-jesus.json";
import todaFamilia from "./toda-familia-precisa-de-um-milagre.json";
import umaIgrejaSaudavel from "./uma-igreja-saudavel.json";
import umaIgrejaViva from "./uma-igreja-viva.json";
import salmos from "./salmos.json";
import vocacaoEPaixao from "./vocacao-e-paixao.json";
import oMestreDasPerguntas from "./o-mestre-das-perguntas.json";

// Registro central dos estudos. Para publicar um novo livro, gere o JSON em
// src/data/estudos/ e adicione uma linha aqui — os consumidores (serviço de
// estudos e páginas SSG) leem todos a partir desta lista.
export const studies = [
  efesios,
  catecismo1,
  catecismo2,
  catecismo3,
  milagresDeJesus,
  caminhoDoPeregrino,
  proverbiosDeJesus,
  quemEJesus,
  todaFamilia,
  umaIgrejaSaudavel,
  umaIgrejaViva,
  salmos,
  vocacaoEPaixao,
  oMestreDasPerguntas,
] as unknown as Study[];
