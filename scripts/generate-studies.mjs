#!/usr/bin/env node
/**
 * Gera src/data/studies.json lendo os arquivos SQL de seed.
 * Uso: node scripts/generate-studies.mjs
 *
 * Fontes SQL (em ../../gc-app/scripts/):
 *   seed-studies.sql                   → Efésios (15 lições)
 *   seed-catecismo-nova-cidade-1.sql   → CNC1    (12 lições)
 *   seed-catecismo-nova-cidade-2.sql   → CNC2    (12 lições)
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Metadados dos estudos ────────────────────────────────────
const studiesRaw = [
  {
    id: 'efesios',
    title: 'Efésios',
    subtitle: 'Um Guia de Estudos para Grupos Pequenos',
    author: 'Luciano Rocha Guimarães',
    introduction: `Paulo escreveu esta bela carta da prisão (3:1; 4:1 e 6:20). Durante dois anos Paulo ficou sob custódia do imperador em Roma. As circunstâncias, mesmas as mais adversas, não dobraram o ânimo desse gigante de Deus. Ao contrário, mesmo preso, ele foi um canal de ensino, consolo, encorajamento e fé para as igrejas.\n\nEstudar essa carta é pisar em solo sagrado com os pés descalços e o coração desarmado. Paulo aborda nesta carta alguns temas da mais alta relevância, como: nossa nova condição em Cristo, a reconciliação dos povos, o mistério do evangelho, a plenitude do Espírito Santo, a família cristã e a batalha espiritual. Essa não é apenas uma carta teológica, mas também prática e vivencial. Ele esclarece de forma profunda e clara alguns princípios que devem nortear a família e a igreja neste mundo tenebroso, inundado de escuridão.\n\nMinha ardente oração é que o estudo desta bela carta inunde e inflame a sua alma, aqueça o seu coração e abra seus lábios para anunciar ao mundo que Jesus Cristo nos amou e se entregou por nós!`,
    coverImage: null,
    displayOrder: 1,
  },
  {
    id: 'catecismo-nova-cidade-1',
    title: 'Catecismo Nova Cidade',
    subtitle: 'Devocional - Parte 1',
    author: 'Timothy Keller (Introdução)',
    introduction: `A verdade de Deus para nossos corações e mentes. O Catecismo Nova Cidade é um recurso devocional baseado em perguntas e respostas fundamentais da fé cristã, com comentários de grandes teólogos e aplicações práticas através da seção "Mudando de Canais", que conecta as verdades bíblicas com a cultura contemporânea.`,
    coverImage: null,
    displayOrder: 2,
  },
  {
    id: 'catecismo-nova-cidade-2',
    title: 'Catecismo Nova Cidade',
    subtitle: 'Devocional - Parte 2',
    author: 'Timothy Keller (Introdução)',
    introduction: `A verdade de Deus para nossos corações e mentes. O segundo volume do Catecismo Nova Cidade Devocional aborda temas fundamentais como a lei de Deus, o pecado, a idolatria, o juízo divino, a redenção e a pessoa de Cristo. Com comentários de grandes teólogos e aplicações práticas através da seção "Mudando de Canais", que conecta as verdades bíblicas com a cultura contemporânea.`,
    coverImage: null,
    displayOrder: 3,
  },
];

// ── Parser SQL ───────────────────────────────────────────────

/**
 * Encontra o ';' que encerra um statement SQL, ignorando ';' dentro de strings.
 */
function findStatementEnd(sql, fromPos) {
  let pos = fromPos;
  while (pos < sql.length) {
    const ch = sql[pos];
    if (ch === "'") {
      pos++;
      while (pos < sql.length) {
        if (sql[pos] === "'" && sql[pos + 1] === "'") { pos += 2; }
        else if (sql[pos] === "'") { pos++; break; }
        else pos++;
      }
    } else if (ch === '-' && sql[pos + 1] === '-') {
      while (pos < sql.length && sql[pos] !== '\n') pos++;
    } else if (ch === ';') {
      return pos;
    } else {
      pos++;
    }
  }
  return -1;
}

function readSqlString(str, startPos) {
  let pos = startPos;
  while (pos < str.length && /\s/.test(str[pos])) pos++;
  if (str[pos] !== "'") throw new Error(`Expected ' at ${pos}, got '${str[pos]}'`);
  pos++;
  let result = '';
  while (pos < str.length) {
    if (str[pos] === "'" && str[pos + 1] === "'") { result += "'"; pos += 2; }
    else if (str[pos] === "'") { pos++; break; }
    else result += str[pos++];
  }
  while (pos < str.length && /\s/.test(str[pos])) pos++;
  if (str[pos] === ',') pos++;
  return { value: result, pos };
}

function readNumber(str, startPos) {
  let pos = startPos;
  while (pos < str.length && /\s/.test(str[pos])) pos++;
  let n = '';
  while (pos < str.length && /\d/.test(str[pos])) n += str[pos++];
  while (pos < str.length && /\s/.test(str[pos])) pos++;
  if (str[pos] === ',') pos++;
  return { value: parseInt(n, 10), pos };
}

function readJsonb(str, startPos) {
  let pos = startPos;
  while (pos < str.length && /\s/.test(str[pos])) pos++;
  if (str[pos] !== "'") throw new Error(`Expected ' for jsonb at ${pos}`);
  pos++;
  let json = '';
  while (pos < str.length) {
    if (str[pos] === "'" && str[pos + 1] === "'") { json += "'"; pos += 2; }
    else if (str[pos] === "'") { pos++; break; }
    else json += str[pos++];
  }
  while (pos < str.length && /\s/.test(str[pos])) pos++;
  if (str.startsWith('::jsonb', pos)) pos += 7;
  while (pos < str.length && /\s/.test(str[pos])) pos++;
  if (str[pos] === ',') pos++;
  return { value: JSON.parse(json), pos };
}

function parseLessonsFromSql(sql) {
  const lessons = [];
  const marker = 'INSERT INTO lessons';
  let searchFrom = 0;

  while (true) {
    const insertIdx = sql.indexOf(marker, searchFrom);
    if (insertIdx === -1) break;

    const semiIdx = findStatementEnd(sql, insertIdx + marker.length);
    if (semiIdx === -1) break;

    const block = sql.slice(insertIdx, semiIdx + 1);
    searchFrom = semiIdx + 1;

    const valuesIdx = block.indexOf('VALUES');
    if (valuesIdx === -1) continue;
    const parenOpen = block.indexOf('(', valuesIdx + 6);
    if (parenOpen === -1) continue;

    const innerRaw = block.slice(parenOpen + 1, block.lastIndexOf(')'));

    try {
      let pos = 0;
      const r1 = readSqlString(innerRaw, pos); const id = r1.value;       pos = r1.pos;
      const r2 = readSqlString(innerRaw, pos); const studyId = r2.value;  pos = r2.pos;
      const r3 = readNumber(innerRaw, pos);    const order = r3.value;    pos = r3.pos;
      const r4 = readSqlString(innerRaw, pos); const title = r4.value;    pos = r4.pos;
      const r5 = readSqlString(innerRaw, pos); const bibleRef = r5.value; pos = r5.pos;
      const r6 = readJsonb(innerRaw, pos);     const content = r6.value;  pos = r6.pos;
      const r7 = readJsonb(innerRaw, pos);     const questions = r7.value;

      lessons.push({ id, studyId, order, title, bibleReference: bibleRef, content, reflectionQuestions: questions });
    } catch (err) {
      console.warn(`⚠️  Erro ao parsear lição (pos ~${searchFrom}): ${err.message}`);
    }
  }
  return lessons;
}

// ── Ler SQL e gerar JSON ─────────────────────────────────────
const sqlDir = resolve(__dirname, '../../gc-app/scripts');
const sqlFiles = [
  'seed-studies.sql',
  'seed-catecismo-nova-cidade-1.sql',
  'seed-catecismo-nova-cidade-2.sql',
];

const allLessons = [];
for (const f of sqlFiles) {
  const sql = readFileSync(resolve(sqlDir, f), 'utf-8');
  const parsed = parseLessonsFromSql(sql);
  console.log(`📄 ${f}: ${parsed.length} lição(ões)`);
  allLessons.push(...parsed);
}

const output = studiesRaw
  .sort((a, b) => a.displayOrder - b.displayOrder)
  .map(({ displayOrder: _d, ...study }) => ({
    ...study,
    lessons: allLessons
      .filter((l) => l.studyId === study.id)
      .sort((a, b) => a.order - b.order)
      .map(({ studyId: _s, ...l }) => l),
  }));

const outPath = resolve(__dirname, '../src/data/studies.json');
writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');
console.log(`\n✅ studies.json gerado em ${outPath}`);
output.forEach((s) => console.log(`   - ${s.id}: ${s.lessons.length} lição(ões)`));
