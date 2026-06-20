#!/usr/bin/env node
// Parser configurável para os livretos de estudo (formato Luciano Rocha e afins).
// Estrutura geral: Índice (com pontilhados) -> capítulos (título do índice) ->
// linha de referência bíblica -> conteúdo (parágrafos, pontos numerados,
// subtítulos como "Introdução"/"Conclusão"/"Para Refletir").
//
// Uso: node scripts/parse-booklet.mjs <chave>   (ou "all")
import fs from 'fs';
import path from 'path';

const TXT_DIR = path.resolve(process.cwd(), 'tmp-pdf-text');
const OUT_DIR = path.resolve(process.cwd(), 'src/data/estudos');

const CONNECTORS = new Set(['de','da','do','das','dos','e','o','a','os','as','em','no','na','nos','nas','um','uma','para','por','com','que','ao','aos','à','às','se','sua','seu','não','ou','é']);
const SUBHEADINGS = new Set(['INTRODUCAO','CONCLUSAO','PARA REFLETIR','APLICACAO','APLICACAO PRATICA','COMENTARIOS','REFLEXAO']);

function norm(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\s+/g, ' ').trim();
}
// normalização para casar títulos (remove aspas e pontuação final)
function normT(s) {
  return norm(s.replace(/[“”"'‘’]/g, '')).replace(/[?!.,;:]+$/, '').trim();
}

const BOOK_NAMES = new Set(['SALMO','SALMOS','GENESIS','EXODO','LEVITICO','NUMEROS','DEUTERONOMIO','JOSUE','JUIZES','RUTE','SAMUEL','REIS','CRONICAS','ESDRAS','NEEMIAS','ESTER','JO','PROVERBIOS','ECLESIASTES','CANTARES','CANTICOS','ISAIAS','JEREMIAS','LAMENTACOES','EZEQUIEL','DANIEL','OSEIAS','JOEL','AMOS','OBADIAS','JONAS','MIQUEIAS','NAUM','HABACUQUE','SOFONIAS','AGEU','ZACARIAS','MALAQUIAS','MATEUS','MARCOS','LUCAS','JOAO','ATOS','ROMANOS','CORINTIOS','GALATAS','EFESIOS','FILIPENSES','COLOSSENSES','TESSALONICENSES','TIMOTEO','TITO','FILEMOM','HEBREUS','TIAGO','PEDRO','JUDAS','APOCALIPSE']);

function isOneRef(p) {
  const m = p.trim().match(/^(?:[1-3]\s*)?([A-Za-zÀ-ú]+(?:\s+[A-Za-zÀ-ú]+){0,2})\s+\d+(?:\s*[:.]\s*\d+(?:\s*[-,]\s*\d+)*)?$/);
  if (!m) return false;
  return norm(m[1]).split(' ').some((w) => BOOK_NAMES.has(w));
}
function isStandaloneRef(line) {
  const t = line.trim().replace(/\.$/, '');
  if (t.length > 60) return false;
  const parts = t.split(/\s*;\s*/);
  return parts.length >= 1 && parts.every(isOneRef);
}
function cleanRef(line) {
  return line.trim().replace(/\.$/, '').split(/\s*;\s*/)
    .map((p) => p.replace(/\s*:\s*/, ':').replace(/\s*([-,])\s*/g, '$1').replace(/\s+/g, ' ').trim()
      .replace(/^III\s+/, '3 ').replace(/^II\s+/, '2 ').replace(/^I\s+/, '1 '))
    .join('; ');
}
function stripNum(s) {
  return s.replace(/^\s*\d+\s*[-–.)]\s*/, '').trim();
}
function capFirst(w) {
  return w.replace(/\p{L}/u, (c) => c.toUpperCase());
}
function titleCasePt(input) {
  const words = input.toLowerCase().split(/(\s+)/);
  let firstAlpha = false;
  return words.map((tok) => {
    if (/^\s*$/.test(tok)) return tok;
    const bare = tok.replace(/[^\p{L}]/gu, '');
    const res = (!firstAlpha || !CONNECTORS.has(bare)) ? capFirst(tok) : tok;
    if (/\p{L}/u.test(tok)) firstAlpha = true;
    return res;
  }).join('');
}
function isAllCaps(line) {
  const core = line.replace(/\([^)]*\)/g, ' ');
  const letters = core.replace(/[^\p{L}]/gu, '');
  if (letters.length < 3) return false;
  return core.replace(/[^\p{Lu}]/gu, '').length / letters.length > 0.85;
}

// Referência bíblica isolada numa linha: "Filipenses 4: 14 - 20", "Marcos 4:3-9",
// "2 Coríntios 5:11-17", "Rute 3:1", "Lucas 3:21,22".
const REF_LINE = /^((?:[1-3]\s*)?[A-Za-zÀ-ú]+(?:\s+[A-Za-zÀ-ú]+){0,2})\s+\d+\s*[:.]\s*\d+(?:\s*[-,]\s*\d+)*\s*$/;
const NUMBERED = /^(\d+)[.)]\s+(.*)/;

function cleanLines(text, cfg) {
  let raw = text.split('\n').map((l) => l.replace(/\t/g, ' ').replace(/ /g, ' ').trim());
  // junta fim de referência que quebrou de linha ("João 5:1-" + "9")
  for (let i = 0; i < raw.length - 1; i++) {
    if (/\d+[:.]\d+-$/.test(raw[i])) {
      let j = i + 1;
      while (j < raw.length && raw[j] === '') j++;
      if (j < raw.length && /^\d+$/.test(raw[j])) { raw[i] += raw[j]; raw[j] = ''; }
    }
  }
  return raw.filter((l) =>
    l.length > 0 &&
    !/^-- \d+ of \d+ --$/.test(l) &&
    !/^\d+$/.test(l) &&
    !/^Capítulo \d+$/i.test(l) &&
    !(cfg.headerRegex && cfg.headerRegex.test(l))
  );
}

function findChapterStarts(lines, titles) {
  // pula o índice: começa após a última linha com pontilhados
  let idxEnd = -1;
  for (let i = 0; i < lines.length; i++) if (/\.{4,}/.test(lines[i])) idxEnd = i;
  const body = lines.map((l, i) => ({ l, i })).filter(({ i }) => i > idxEnd && !/\.{4,}/.test(lines[i]));

  const starts = [];
  let cursor = 0;
  for (const title of titles) {
    // casa o título completo OU a parte após "Palavra: " (corpo às vezes omite o prefixo)
    const cands = [normT(title)];
    if (/:\s/.test(title)) cands.push(normT(title.split(/:\s/).slice(1).join(': ')));
    let found = -1, span = 1;
    for (let k = cursor; k < body.length && found === -1; k++) {
      let joined = '';
      for (let w = 0; w < 5 && k + w < body.length; w++) {
        joined = (joined ? joined + ' ' : '') + stripNum(body[k + w].l);
        if (cands.includes(normT(joined))) { found = k; span = w + 1; break; }
      }
    }
    if (found === -1) {
      // fallback: prefixo
      const nt = cands[0];
      for (let k = cursor; k < body.length; k++) {
        if (normT(stripNum(body[k].l)).startsWith(nt.slice(0, Math.min(nt.length, 18)))) { found = k; span = 1; break; }
      }
    }
    if (found === -1) { console.warn(`  ⚠️ título não encontrado: "${title}"`); continue; }
    starts.push({ lineIdx: body[found].i, span, title });
    cursor = found + span;
  }
  return { starts, bodyStartIdx: idxEnd + 1 };
}

function parseBook(cfg) {
  const text = fs.readFileSync(path.join(TXT_DIR, cfg.file), 'utf-8');
  const lines = cleanLines(text, cfg);
  const { starts, bodyStartIdx } = findChapterStarts(lines, cfg.chapters);

  // introdução automática = prosa entre o índice e o 1º capítulo
  let introduction = cfg.introduction || '';
  if (!introduction && starts.length) {
    const preLines = [];
    for (let i = bodyStartIdx; i < starts[0].lineIdx; i++) {
      const l = lines[i];
      if (!l || /^Introdução$/i.test(l) || isAllCaps(l)) continue;
      preLines.push(l);
    }
    introduction = joinParagraphs(preLines).join('\n\n');
  }

  const lessons = [];
  for (let s = 0; s < starts.length; s++) {
    const cur = starts[s];
    const startContent = cur.lineIdx + cur.span;
    const end = s + 1 < starts.length ? starts[s + 1].lineIdx : lines.length;
    const seg = lines.slice(startContent, end);

    const content = [];
    let bibleReference = '';
    let i = 0;

    // pula remanescentes do título (linhas em CAIXA ALTA curtas que não são ref)
    while (i < seg.length && isAllCaps(seg[i]) && !isStandaloneRef(seg[i]) && !/^\d+\s+\p{L}/u.test(seg[i])) i++;

    // caso a lição comece com a passagem de versículos e a ref venha no fim
    // (mas não quando a própria linha já é a referência, ex.: "2 Samuel 6:1-23")
    if (i < seg.length && /^\d+\s+\p{L}/u.test(seg[i]) && !isStandaloneRef(seg[i])) {
      let m = i; const acc = [];
      while (m < seg.length && !isStandaloneRef(seg[m]) && acc.length < 45) { acc.push(seg[m]); m++; }
      if (m < seg.length && isStandaloneRef(seg[m])) {
        bibleReference = cleanRef(seg[m]);
        pushQuote(content, acc.join(' '));
        i = m + 1;
      }
    }

    // referência bíblica + eventual passagem de versículos (antes ou depois da ref)
    if (!bibleReference) {
      let refIdx = -1;
      const WINDOW = 16;
      for (let k = i; k < Math.min(seg.length, i + WINDOW); k++) {
        if (isStandaloneRef(seg[k])) { refIdx = k; break; }
      }
      if (refIdx !== -1) {
        bibleReference = cleanRef(seg[refIdx]);
        const pre = seg.slice(i, refIdx).filter((l) => l.length);
        if (pre.length && /^\d+\s+\p{L}/u.test(pre[0])) {
          pushQuote(content, pre.join(' '));
          i = refIdx + 1;
        } else if (pre.length === 0) {
          // passagem logo após a ref (até "Introdução"/ponto numerado)
          let m = refIdx + 1; const acc = [];
          if (m < seg.length && /^\d+\s+\p{L}/u.test(seg[m])) {
            while (m < seg.length && !SUBHEADINGS.has(norm(seg[m])) && !NUMBERED.test(seg[m]) && acc.length < 60) { acc.push(seg[m]); m++; }
            pushQuote(content, acc.join(' '));
            i = m;
          } else {
            i = refIdx + 1;
          }
        } else {
          // linhas avulsas antes da ref: vira(m) parágrafo(s)
          for (const para of splitParagraphs(pre)) if (para.length >= 2) content.push({ type: 'paragraph', text: para });
          i = refIdx + 1;
        }
      }
    }

    const isMarker = (l) =>
      NUMBERED.test(l) || SUBHEADINGS.has(norm(l)) || (cfg.capsStyle && isAllCaps(l));

    while (i < seg.length) {
      const line = seg[i];

      if (SUBHEADINGS.has(norm(line))) {
        content.push({ type: 'heading', text: titleCasePt(line) }); i++; continue;
      }

      const num = line.match(NUMBERED);
      if (num) {
        if (cfg.capsStyle) {
          // estilo CAIXA ALTA: título do ponto em caps + parágrafo separado.
          // Quando título e explicação vêm na mesma linha ("...(v 21). Em Betel"),
          // separa após "(v N)." e devolve o restante para virar parágrafo.
          let head = num[2]; let rest = '';
          const m2 = head.match(/^(.+?\([vV][^)]*\)\.?)\s+(.+)$/);
          if (m2) { head = m2[1]; rest = m2[2]; }
          let pieces = [head]; i++;
          if (!rest) {
            while (i < seg.length && !isMarker(seg[i]) && (isAllCaps(seg[i]) || /^\(/.test(seg[i]))) {
              pieces.push(seg[i]); i++;
              if (/^\(/.test(seg[i - 1])) break;
            }
          }
          content.push({ type: 'numbered_point', text: titleCasePt(pieces.join(' ').replace(/\s+/g, ' ').trim()), bold: true });
          if (rest) seg.splice(i, 0, rest);
        } else {
          // estilo título: 1ª sentença em negrito; explicação fica em parágrafos
          let pieces = [num[2]]; i++;
          while (i < seg.length && !isMarker(seg[i]) && !/[.?!]["”]?\)?$/.test(pieces[pieces.length - 1])) {
            pieces.push(seg[i]); i++;
          }
          content.push({ type: 'numbered_point', text: pieces.join(' ').replace(/\s+/g, ' ').trim(), bold: true });
        }
        continue;
      }

      if (cfg.capsStyle && isAllCaps(line)) {
        let pieces = [line]; i++;
        while (i < seg.length && isAllCaps(seg[i]) && !isMarker(seg[i])) { pieces.push(seg[i]); i++; }
        content.push({ type: 'heading', text: titleCasePt(pieces.join(' ').replace(/\s+/g, ' ').trim()) });
        continue;
      }

      // corre as linhas de prosa até o próximo marcador e quebra em parágrafos
      // pela heurística de largura (linha curta terminada em pontuação = fim de parágrafo)
      let run = [line]; i++;
      while (i < seg.length && !isMarker(seg[i])) { run.push(seg[i]); i++; }
      for (const para of splitParagraphs(run)) {
        if (para.length >= 2) content.push({ type: 'paragraph', text: para });
      }
    }

    lessons.push({
      id: `${cfg.id}-${String(s + 1).padStart(2, '0')}`,
      order: s + 1,
      title: titleCasePt(cur.title),
      bibleReference,
      content,
      reflectionQuestions: [],
    });
  }

  const study = {
    id: cfg.id, title: cfg.title, subtitle: cfg.subtitle, author: cfg.author,
    coverImage: null, introduction, lessons,
  };
  fs.writeFileSync(path.join(OUT_DIR, `${cfg.id}.json`), JSON.stringify(study, null, 2), 'utf-8');
  console.log(`\n✓ ${cfg.id}.json — ${lessons.length} lições`);
  lessons.forEach((l) => console.log(`  ${l.order}. ${l.title} | ${l.bibleReference || '(sem ref)'} | blocos: ${l.content.length}`));
  return study;
}

// Divide um bloco de linhas de prosa (sem markers) em parágrafos.
// Heurística: uma linha "curta" (bem menor que a largura típica de quebra)
// terminada em pontuação de fim de frase encerra um parágrafo.
function pushQuote(content, text) {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length >= 2) content.push({ type: 'bible_quote', text: t });
}

function splitParagraphs(run) {
  const widths = run.map((l) => l.length).filter((n) => n <= 72);
  const full = widths.length ? Math.max(...widths) : 60;
  const paras = [];
  let buf = [];
  for (const l of run) {
    buf.push(l);
    const endsSentence = /[.!?:]["”’)\]]?$/.test(l);
    const short = l.length <= full - 5;
    if (endsSentence && short) {
      paras.push(buf.join(' ').replace(/\s+/g, ' ').trim());
      buf = [];
    }
  }
  if (buf.length) paras.push(buf.join(' ').replace(/\s+/g, ' ').trim());
  return paras;
}

function joinParagraphs(lines) {
  const out = [];
  let buf = [];
  for (const l of lines) { buf.push(l); }
  if (buf.length) out.push(buf.join(' ').replace(/\s+/g, ' ').trim());
  return out;
}

// ── Configs por livro ────────────────────────────────────────
const CONFIGS = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'scripts/booklet-configs.json'), 'utf-8'));

const key = process.argv[2] || 'all';
const list = key === 'all' ? Object.keys(CONFIGS) : [key];
for (const k of list) {
  if (!CONFIGS[k]) { console.error(`config desconhecida: ${k}`); continue; }
  const cfg = CONFIGS[k];
  if (cfg.headerRegex) cfg.headerRegex = new RegExp(cfg.headerRegex);
  parseBook(cfg);
}
