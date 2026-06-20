#!/usr/bin/env node
// Parser dedicado para "Milagres de Jesus" (Luciano Rocha Guimarães).
// Estrutura: Índice -> capítulos (título em CAIXA ALTA) -> passagem bíblica
// terminada em " - Ref" -> parágrafos / pontos numerados (CAIXA ALTA) ->
// blocos "PARA REFLETIR" -> "CONCLUSÃO".
import fs from 'fs';
import path from 'path';

const TXT = process.argv[2] || path.resolve(process.cwd(), 'tmp-pdf-text', 'Milagres de Jesus - livreto.txt');
const OUT = process.argv[3] || path.resolve(process.cwd(), 'src/data/estudos/milagres-de-jesus.json');

const CHAPTER_TITLES = [
  'AS PROMESSAS DE VIDA',
  'OS CINCO MANDAMENTOS DE UM CORAÇÃO SARADO',
  'CONVIVENDO COM OS IMPREVISTOS',
  'JESUS AINDA NÃO VIERA TER COM ELES',
  'JESUS VAI CONOSCO',
  'O CAMINHO DE EMAÚS',
  'ENTRE O MONTE E O VALE',
  'OS AGENTES DA ESPERANÇA',
  'OS DOIS TOQUES DE CRISTO',
  'UM HOMEM PARA OS OUTROS',
  'ELES ESTIVERAM COM JESUS',
  'VOLTANDO PARA CASA',
  'ZAQUEU: MÃOS CHEIAS E CORAÇÃO VAZIO',
];

const CONNECTORS = new Set(['de','da','do','das','dos','e','o','a','os','as','em','no','na','nos','nas','um','uma','para','por','com','que','ao','aos','à','às','se','sua','seu','não']);

function norm(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\s+/g, ' ').trim();
}

function capFirst(w) {
  if (!w) return w;
  return w.replace(/\p{L}/u, (c) => c.toUpperCase()); // 1ª letra, mesmo após "("
}

function titleCasePt(input) {
  const lowered = input.toLowerCase();
  const words = lowered.split(/(\s+)/); // keep separators
  let firstAlphaSeen = false;
  return words.map((tok) => {
    if (/^\s+$/.test(tok) || tok === '') return tok;
    // preserve tokens that look like refs/parentheses with digits
    const isConnector = CONNECTORS.has(tok.replace(/[^\p{L}]/gu, ''));
    const result = (!firstAlphaSeen || !isConnector) ? capFirst(tok) : tok;
    if (/\p{L}/u.test(tok)) firstAlphaSeen = true;
    return result;
  }).join('');
}

function isAllCaps(line) {
  // ignora trechos entre parênteses (refs como "(João 4.46-54)") na avaliação
  const core = line.replace(/\([^)]*\)/g, ' ');
  const letters = core.replace(/[^\p{L}]/gu, '');
  if (letters.length < 3) return false;
  const upper = core.replace(/[^\p{Lu}]/gu, '').length;
  return upper / letters.length > 0.85;
}

const SCRIPTURE_REF = /[-–]\s*((?:[1-3]\s*)?[A-Za-zÀ-ú]+(?:\s+[A-Za-zÀ-ú]+)?\s+\d+[:.]\d+(?:[-,]\d+)*)\s*$/;
const NUMBERED = /^(\d+)[.)]\s+(.*)/;

function buildLines(text) {
  let raw = text.split('\n').map((l) => l.replace(/\t/g, ' ').trim());
  // merge wrapped scripture ref end ("João 5:1-" + "9")
  for (let i = 0; i < raw.length - 1; i++) {
    if (/\d+[:.]\d+-$/.test(raw[i])) {
      let j = i + 1;
      while (j < raw.length && raw[j] === '') j++;
      if (j < raw.length && /^\d+$/.test(raw[j])) {
        raw[i] = raw[i] + raw[j];
        raw[j] = '';
      }
    }
  }
  return raw.filter((l) =>
    l.length > 0 &&
    !/^-- \d+ of \d+ --$/.test(l) &&
    !/^Milagres de Jesus\s+\d+$/.test(l) &&
    !/^\d+$/.test(l)
  );
}

function parse() {
  const text = fs.readFileSync(TXT, 'utf-8');
  const lines = buildLines(text);

  const titleSet = new Map(CHAPTER_TITLES.map((t, i) => [norm(t), i]));
  const starts = [];
  for (let i = 0; i < lines.length; i++) {
    if (titleSet.has(norm(lines[i]))) starts.push(i);
  }

  const lessons = [];
  for (let s = 0; s < starts.length; s++) {
    const start = starts[s];
    const end = s + 1 < starts.length ? starts[s + 1] : lines.length;
    const titleRaw = lines[start];
    const seg = lines.slice(start + 1, end);

    const content = [];
    let bibleReference = '';
    let i = 0;

    // 1) passagem bíblica: do topo do capítulo até a primeira linha com " - Ref"
    {
      let refIdx = -1;
      for (let k = 0; k < seg.length; k++) {
        if (SCRIPTURE_REF.test(seg[k])) { refIdx = k; break; }
      }
      if (refIdx !== -1) {
        const m = seg[refIdx].match(SCRIPTURE_REF);
        bibleReference = m[1].replace(/\s+/g, ' ').trim();
        const verse = seg.slice(0, refIdx + 1).join(' ').replace(SCRIPTURE_REF, '').replace(/\s*[-–]\s*$/, '').trim();
        if (verse) content.push({ type: 'bible_quote', text: verse });
        i = refIdx + 1;
      }
    }

    const isMarker = (l) =>
      l === 'PARA REFLETIR' || l === 'CONCLUSÃO' || NUMBERED.test(l) || isAllCaps(l);

    // 2) corpo
    while (i < seg.length) {
      const line = seg[i];

      if (line === 'PARA REFLETIR') { content.push({ type: 'heading', text: 'Para Refletir' }); i++; continue; }
      if (line === 'CONCLUSÃO') { content.push({ type: 'heading', text: 'Conclusão' }); i++; continue; }

      const num = line.match(NUMBERED);
      if (num) {
        let pieces = [num[2]];
        i++;
        // anexa continuação em CAIXA ALTA ou referência entre parênteses,
        // sem engolir o próximo ponto numerado ou marcador
        while (
          i < seg.length &&
          !NUMBERED.test(seg[i]) && seg[i] !== 'PARA REFLETIR' && seg[i] !== 'CONCLUSÃO' &&
          (isAllCaps(seg[i]) || /^\(/.test(seg[i]))
        ) {
          pieces.push(seg[i]); i++;
          if (/^\(/.test(seg[i - 1])) break;
        }
        content.push({ type: 'numbered_point', text: titleCasePt(pieces.join(' ').replace(/\s+/g, ' ').trim()), bold: true });
        continue;
      }

      if (isAllCaps(line)) {
        let pieces = [line];
        i++;
        while (i < seg.length && isAllCaps(seg[i]) && !NUMBERED.test(seg[i]) && seg[i] !== 'PARA REFLETIR' && seg[i] !== 'CONCLUSÃO') { pieces.push(seg[i]); i++; }
        content.push({ type: 'heading', text: titleCasePt(pieces.join(' ').replace(/\s+/g, ' ').trim()) });
        continue;
      }

      // parágrafo: acumula até próximo marcador
      let pieces = [line];
      i++;
      while (i < seg.length && !isMarker(seg[i])) { pieces.push(seg[i]); i++; }
      content.push({ type: 'paragraph', text: pieces.join(' ').replace(/\s+/g, ' ').trim() });
    }

    lessons.push({
      id: `milagres-de-jesus-${String(s + 1).padStart(2, '0')}`,
      order: s + 1,
      title: titleCasePt(titleRaw),
      bibleReference,
      content,
      reflectionQuestions: [],
    });
  }

  return lessons;
}

const lessons = parse();
const study = {
  id: 'milagres-de-jesus',
  title: 'Milagres de Jesus',
  subtitle: 'A vida que Jesus oferece nos sinais do Evangelho',
  author: 'Luciano Rocha Guimarães',
  coverImage: null,
  introduction: 'Os milagres realizados por Jesus e narrados pelos evangelistas não são apenas demonstrações de poder, mas veículos que ilustram e comunicam a vida que Ele veio oferecer. Cada um deles revela um aspecto dessa vida abundante que recebemos em Cristo. Neste estudo, percorremos esses sinais para que, mais do que admirar o milagre, possamos encontrar o Senhor da vida — Aquele que cura, restaura, aproxima e salva. Que cada encontro com Jesus nestas páginas aqueça o seu coração e fortaleça a sua fé.',
  lessons,
};

fs.writeFileSync(OUT, JSON.stringify(study, null, 2), 'utf-8');
console.log(`✓ ${OUT}`);
console.log(`Lições: ${lessons.length}`);
lessons.forEach((l) => console.log(`  ${l.order}. ${l.title} | ${l.bibleReference} | blocos: ${l.content.length}`));
