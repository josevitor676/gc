import { GoogleGenerativeAI } from "@google/generative-ai";

export interface DevocionalGerado {
  versiculo: string;
  referencia: string;
  titulo: string;
  reflexao: string;
  aplicacao: string;
  oracao: string;
}

const DEFAULT_GEMINI_MODELS = [
  "gemini-3-flash-preview"
];

const PROMPT_DEVOCIONAL = `
Voce e um pastor presbiteriano reformado, herdeiro da tradicao da Reforma Protestante
(Calvino, os puritanos, a Confissao de Fe de Westminster), escrevendo um devocional
diario em portugues brasileiro para membros de uma igreja presbiteriana.

Siga RIGOROSAMENTE estes principios teologicos, que sao inegociaveis:

- Cristocentrico: todo devocional deve apontar para a pessoa e a obra de Jesus Cristo,
  lendo o texto dentro da historia da redencao. Mesmo textos do Antigo Testamento e da
  Lei devem ser lidos a luz de Cristo — nunca como moralismo isolado ou exemplo generico
  de "boas atitudes" desconectado do evangelho.
- Os solas da Reforma: graca (sola gratia), fe (sola fide), Escritura (sola Scriptura) e
  a gloria de Deus (soli Deo gloria) devem permear a reflexao.
- Soberania de Deus e condicao humana: reconheca com honestidade a depravacao humana e a
  iniciativa graciosa de Deus na salvacao. Jamais apresente o evangelho como autoajuda,
  "poder pessoal", positividade ou teologia da prosperidade.
- Indicativo antes do imperativo: a aplicacao pratica deve nascer daquilo que Cristo ja
  fez por nos (indicativo do evangelho), e nao de esforco moral autonomo do leitor.
  Mostre primeiro a graca recebida em Cristo; a obediencia e a resposta de gratidao que
  flui dela, nunca a condicao para merece-la.
- Reverencia e sobriedade: linguagem pastoral, biblica e teologicamente precisa. Evite
  sensacionalismo emocional, jargoes de autoajuda e frases de efeito vazias.

Crie um devocional diario curto (leitura de 5 a 8 minutos) seguindo EXATAMENTE esta estrutura JSON:

{
  "versiculo": "texto completo do versiculo base (tradução Almeida ou NVI)",
  "referencia": "Livro Capitulo:Versiculo (ex: Joao 3:16)",
  "titulo": "titulo que aponta para Cristo ou para a graca de Deus (maximo 10 palavras)",
  "reflexao": "reflexao teologica e cristocentrica com 250 a 300 palavras: explique o texto em seu contexto biblico e como ele se conecta a obra de Cristo e ao evangelho da graca, evitando moralismo",
  "aplicacao": "1 aplicacao pratica que flui do evangelho (indicativo -> imperativo), mostrando como a graca recebida em Cristo transforma a vida diaria, com 80 a 100 palavras",
  "oracao": "oracao final em primeira pessoa, reconhecendo a graca de Deus em Cristo e respondendo com fe e gratidao, com 60 a 80 palavras"
}

Responda APENAS com JSON valido, sem markdown, sem texto adicional.
Escolha um versiculo diferente a cada geracao, alternando entre Antigo e Novo Testamento.
Priorize temas como graca, alianca, justificacao pela fe, santificacao, a soberania de
Deus, a cruz de Cristo, a ressurreicao e a gloria de Deus — sempre com o evangelho no
centro. Evite temas genericos de autoajuda (ex: "acredite em si mesmo", "seja positivo")
e nunca separe a etica crista da pessoa e obra de Cristo.
`;


function assertNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Campo invalido no JSON do Gemini: ${field}`);
  }
  return value.trim();
}

function parseGeminiJson(rawText: string): DevocionalGerado {
  const stripped = rawText
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  const firstBrace = stripped.indexOf("{");
  const lastBrace = stripped.lastIndexOf("}");
  if (firstBrace < 0 || lastBrace < firstBrace) {
    throw new Error("Resposta do Gemini nao contem JSON valido");
  }

  const payload = JSON.parse(stripped.slice(firstBrace, lastBrace + 1)) as Record<string, unknown>;

  return {
    versiculo: assertNonEmptyString(payload.versiculo, "versiculo"),
    referencia: assertNonEmptyString(payload.referencia, "referencia"),
    titulo: assertNonEmptyString(payload.titulo, "titulo"),
    reflexao: assertNonEmptyString(payload.reflexao, "reflexao"),
    aplicacao: assertNonEmptyString(payload.aplicacao, "aplicacao"),
    oracao: assertNonEmptyString(payload.oracao, "oracao"),
  };
}

function isModelNotFoundError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return message.includes("404") && message.includes("model") && message.includes("not found");
}

function getModelCandidates(): string[] {
  const fromEnv = process.env.GEMINI_MODEL?.trim();
  if (!fromEnv) {
    return DEFAULT_GEMINI_MODELS;
  }

  return [fromEnv, ...DEFAULT_GEMINI_MODELS.filter((model) => model !== fromEnv)];
}

export async function gerarDevocional(): Promise<DevocionalGerado> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY nao configurada");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const candidates = getModelCandidates();
  let lastError: unknown = null;

  for (const modelName of candidates) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const response = await model.generateContent(PROMPT_DEVOCIONAL);
      const text = response.response.text().trim();

      return parseGeminiJson(text);
    } catch (error) {
      lastError = error;

      if (isModelNotFoundError(error)) {
        continue;
      }

      throw error;
    }
  }

  throw new Error(
    `Nenhum modelo Gemini disponivel para generateContent. Modelos testados: ${candidates.join(", ")}. Ultimo erro: ${lastError instanceof Error ? lastError.message : "Erro desconhecido"}`
  );
}
