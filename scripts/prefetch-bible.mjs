#!/usr/bin/env node
/**
 * Pré-busca todas as referências bíblicas dos estudos e grava
 * src/data/bible-passages.json para funcionar como fallback offline.
 *
 * Uso:
 *   node scripts/prefetch-bible.mjs
 *
 * Execute antes de `pnpm build` sempre que studies.json for atualizado.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Abreviações (espelho de src/data/bible-abbreviations.ts) ─────────────────

const BIBLE_ABBREV_MAP = {
  "Gn": "gn", "Gênesis": "gn", "Genesis": "gn",
  "Êx": "ex", "Ex": "ex", "Êxodo": "ex", "Exodo": "ex",
  "Lv": "lv", "Levítico": "lv", "Levitico": "lv",
  "Nm": "nm", "Números": "nm", "Numeros": "nm",
  "Dt": "dt", "Deuteronômio": "dt", "Deuteronomio": "dt",
  "Js": "js", "Josué": "js", "Josue": "js",
  "Jz": "jz", "Juízes": "jz", "Juizes": "jz",
  "Rt": "rt", "Rute": "rt",
  "1Sm": "1sm", "1 Sm": "1sm", "1 Samuel": "1sm",
  "2Sm": "2sm", "2 Sm": "2sm", "2 Samuel": "2sm",
  "1Rs": "1rs", "1 Rs": "1rs", "1 Reis": "1rs",
  "2Rs": "2rs", "2 Rs": "2rs", "2 Reis": "2rs",
  "1Cr": "1cr", "1 Cr": "1cr", "1 Crônicas": "1cr",
  "2Cr": "2cr", "2 Cr": "2cr", "2 Crônicas": "2cr",
  "Ed": "ed", "Esdras": "ed",
  "Ne": "ne", "Neemias": "ne",
  "Et": "et", "Ester": "et",
  "Jó": "job",
  "Sl": "sl", "Salmos": "sl", "Salmo": "sl",
  "Pv": "pv", "Provérbios": "pv", "Proverbios": "pv",
  "Ec": "ec", "Eclesiastes": "ec",
  "Ct": "ct", "Cantares": "ct", "Cânticos": "ct",
  "Is": "is", "Isaías": "is", "Isaias": "is",
  "Jr": "jr", "Jeremias": "jr",
  "Lm": "lm", "Lamentações": "lm",
  "Ez": "ez", "Ezequiel": "ez",
  "Dn": "dn", "Daniel": "dn",
  "Os": "os", "Oséias": "os", "Oseias": "os",
  "Jl": "jl", "Joel": "jl",
  "Am": "am", "Amós": "am", "Amos": "am",
  "Ob": "ob", "Obadias": "ob",
  "Jn": "jn", "Jonas": "jn",
  "Mq": "mq", "Miquéias": "mq", "Miqueias": "mq",
  "Na": "na", "Naum": "na",
  "Hc": "hc", "Habacuque": "hc",
  "Sf": "sf", "Sofonias": "sf",
  "Ag": "ag", "Ageu": "ag",
  "Zc": "zc", "Zacarias": "zc",
  "Ml": "ml", "Malaquias": "ml",
  "Mt": "mt", "Mateus": "mt",
  "Mc": "mc", "Marcos": "mc",
  "Lc": "lc", "Lucas": "lc",
  "Jo": "jo", "João": "jo", "Joao": "jo",
  "At": "at", "Atos": "at",
  "Rm": "rm", "Romanos": "rm",
  "1Co": "1co", "1 Co": "1co", "1 Coríntios": "1co",
  "2Co": "2co", "2 Co": "2co", "2 Coríntios": "2co",
  "Gl": "gl", "Gálatas": "gl", "Galatas": "gl",
  "Ef": "ef", "Efésios": "ef", "Efesios": "ef",
  "Fp": "fp", "Filipenses": "fp",
  "Cl": "cl", "Colossenses": "cl",
  "1Ts": "1ts", "1 Ts": "1ts", "1 Tessalonicenses": "1ts",
  "2Ts": "2ts", "2 Ts": "2ts", "2 Tessalonicenses": "2ts",
  "1Tm": "1tm", "1 Tm": "1tm", "1 Timóteo": "1tm",
  "2Tm": "2tm", "2 Tm": "2tm", "2 Timóteo": "2tm",
  "Tt": "tt", "Tito": "tt",
  "Fm": "fm", "Filemom": "fm", "Filemon": "fm",
  "Hb": "hb", "Hebreus": "hb",
  "Tg": "tg", "Tiago": "tg",
  "1Pe": "1pe", "1 Pe": "1pe", "1 Pedro": "1pe",
  "2Pe": "2pe", "2 Pe": "2pe", "2 Pedro": "2pe",
  "1Jo": "1jo", "1 Jo": "1jo", "1 João": "1jo",
  "2Jo": "2jo", "2 Jo": "2jo", "2 João": "2jo",
  "3Jo": "3jo", "3 Jo": "3jo", "3 João": "3jo",
  "Jd": "jd", "Judas": "jd",
  "Ap": "ap", "Apocalipse": "ap",
};

const BIBLE_BOOK_NAMES = {
  gn: "Gênesis", ex: "Êxodo", lv: "Levítico", nm: "Números",
  dt: "Deuteronômio", js: "Josué", jz: "Juízes", rt: "Rute",
  "1sm": "1 Samuel", "2sm": "2 Samuel", "1rs": "1 Reis", "2rs": "2 Reis",
  "1cr": "1 Crônicas", "2cr": "2 Crônicas", ed: "Esdras", ne: "Neemias",
  et: "Ester", job: "Jó", sl: "Salmos", pv: "Provérbios",
  ec: "Eclesiastes", ct: "Cantares", is: "Isaías", jr: "Jeremias",
  lm: "Lamentações", ez: "Ezequiel", dn: "Daniel", os: "Oséias",
  jl: "Joel", am: "Amós", ob: "Obadias", jn: "Jonas",
  mq: "Miquéias", na: "Naum", hc: "Habacuque", sf: "Sofonias",
  ag: "Ageu", zc: "Zacarias", ml: "Malaquias",
  mt: "Mateus", mc: "Marcos", lc: "Lucas", jo: "João",
  at: "Atos", rm: "Romanos", "1co": "1 Coríntios", "2co": "2 Coríntios",
  gl: "Gálatas", ef: "Efésios", fp: "Filipenses", cl: "Colossenses",
  "1ts": "1 Tessalonicenses", "2ts": "2 Tessalonicenses",
  "1tm": "1 Timóteo", "2tm": "2 Timóteo", tt: "Tito",
  fm: "Filemom", hb: "Hebreus", tg: "Tiago",
  "1pe": "1 Pedro", "2pe": "2 Pedro",
  "1jo": "1 João", "2jo": "2 João", "3jo": "3 João",
  jd: "Judas", ap: "Apocalipse",
};

// ── Parser de referências (espelho de src/utils/bible-ref-parser.ts) ─────────

const abbreviations = Object.keys(BIBLE_ABBREV_MAP)
  .sort((a, b) => b.length - a.length)
  .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  .join("|");

const BIBLE_REF_REGEX = new RegExp(
  `(${abbreviations})\\s*(\\d{1,3})\\s*[:\\.](\\s*\\d{1,3})(?:\\s*[-–]\\s*(\\d{1,3}))?`,
  "g"
);

function parseBibleReferences(text) {
  const refs = [];
  const regex = new RegExp(BIBLE_REF_REGEX.source, "g");
  let match;
  while ((match = regex.exec(text)) !== null) {
    const bookAbbr = match[1];
    const book = BIBLE_ABBREV_MAP[bookAbbr];
    if (!book) continue;
    refs.push({
      book,
      chapter: parseInt(match[2], 10),
      verseStart: parseInt(match[3].trim(), 10),
      verseEnd: match[4] ? parseInt(match[4], 10) : undefined,
    });
  }
  return refs;
}

function cacheKey(book, chapter, verseStart, verseEnd) {
  return `${book}-${chapter}-${verseStart}-${verseEnd ?? verseStart}`;
}

// ── Fetch da API ──────────────────────────────────────────────────────────────

function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const DELAY_MS = 1_500;       // pausa entre cada requisição
const MAX_RETRIES = 5;         // tentativas ao receber 429
const RETRY_BASE_MS = 5_000;   // espera inicial antes de tentar novamente

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchVerses(book, chapter, verseStart, verseEnd) {
  const bookName = BIBLE_BOOK_NAMES[book] ?? book;
  const bookSlug = removeAccents(bookName).toLowerCase();
  const ref =
    verseEnd && verseEnd !== verseStart
      ? `${bookSlug}+${chapter}:${verseStart}-${verseEnd}`
      : `${bookSlug}+${chapter}:${verseStart}`;

  const url = `https://bible-api.com/${encodeURIComponent(ref)}?translation=almeida`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url);

    if (res.status === 429) {
      const wait = RETRY_BASE_MS * attempt;
      console.warn(`    ⏳ 429 — aguardando ${wait / 1000}s antes de tentar novamente (tentativa ${attempt}/${MAX_RETRIES})...`);
      await sleep(wait);
      continue;
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    if (data.verses && Array.isArray(data.verses)) {
      return data.verses.map((v) => ({
        book_name: v.book_name,
        chapter: v.chapter,
        verse: v.verse,
        text: v.text.trim(),
      }));
    }
    return [{
      book_name: data.book_name ?? bookName,
      chapter: data.chapter ?? chapter,
      verse: data.verse ?? verseStart,
      text: (data.text ?? "").trim(),
    }];
  }

  throw new Error(`HTTP 429 após ${MAX_RETRIES} tentativas`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

const studiesPath = resolve(__dirname, "../src/data/studies.json");
const outputPath = resolve(__dirname, "../src/data/bible-passages.json");

const studies = JSON.parse(readFileSync(studiesPath, "utf-8"));

// Carrega passagens já salvas para não rebuscar as que já funcionaram
let passages = {};
try {
  const existing = readFileSync(outputPath, "utf-8");
  passages = JSON.parse(existing);
} catch {
  // arquivo não existe ainda
}

// Coleta todas as referências únicas dos estudos
const allRefs = new Map();

for (const study of studies) {
  for (const lesson of study.lessons) {
    const texts = [
      lesson.bibleReference,
      ...lesson.content.map((b) => b.text),
      ...lesson.reflectionQuestions,
    ];

    for (const text of texts) {
      for (const ref of parseBibleReferences(text)) {
        const key = cacheKey(ref.book, ref.chapter, ref.verseStart, ref.verseEnd);
        if (!allRefs.has(key)) allRefs.set(key, ref);
      }
    }
  }
}

// Filtra apenas as que ainda não foram buscadas
const pending = [...allRefs.entries()].filter(([key]) => !passages[key]);

console.log(`📖 ${allRefs.size} referências no total | ${Object.keys(passages).length} já salvas | ${pending.length} para buscar`);

if (pending.length === 0) {
  console.log("✅ Tudo já está salvo. Nada a fazer.");
  process.exit(0);
}

let ok = 0;
let fail = 0;

for (const [key, ref] of pending) {
  try {
    passages[key] = await fetchVerses(ref.book, ref.chapter, ref.verseStart, ref.verseEnd);
    console.log(`  ✅ ${key}`);
    ok++;
    // Salva progressivamente — se o script for interrompido, não perde o que já buscou
    writeFileSync(outputPath, JSON.stringify(passages, null, 2), "utf-8");
    await sleep(DELAY_MS);
  } catch (e) {
    console.warn(`  ⚠️  ${key}: ${e.message}`);
    fail++;
  }
}

console.log(`\n✅ ${ok} novas passagens salvas | ⚠️  ${fail} falhas`);
console.log(`📄 Arquivo: ${outputPath}`);
