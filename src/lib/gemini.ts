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
Voce e um escritor de devocionais cristaos evangelicos em portugues brasileiro.
Crie um devocional diario curto (leitura de 5 a 8 minutos) seguindo EXATAMENTE esta estrutura JSON:

{
  "versiculo": "texto completo do versiculo base",
  "referencia": "Livro Capitulo:Versiculo (ex: Joao 3:16)",
  "titulo": "titulo inspirador do devocional (maximo 10 palavras)",
  "reflexao": "reflexao teologica e pratica com 250 a 300 palavras, linguagem acessivel",
  "aplicacao": "1 aplicacao pratica objetiva para o dia a dia com 80 a 100 palavras",
  "oracao": "oracao final em primeira pessoa com 60 a 80 palavras"
}

Responda APENAS com JSON valido, sem markdown, sem texto adicional.
Escolha um versiculo diferente a cada geracao. Priorize temas como fe, esperanca, amor,
comunidade, oracao, proposito e graca.
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
