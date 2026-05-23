// scripts/pdf-to-study-json.ts
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');
const pdfParseFn = pdfParseModule?.default || pdfParseModule;
const PDFParseClass = pdfParseModule?.PDFParse || pdfParseModule?.default?.PDFParse;

interface ContentBlock {
  type: 'paragraph' | 'bible_quote' | 'heading';
  text: string;
  bold?: boolean;
}

interface Lesson {
  id: string;
  order: number;
  title: string;
  bibleReference: string;
  content: ContentBlock[];
  reflectionQuestions: string[];
}

interface StudyJson {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  introduction: string;
  coverImage: string | null;
  lessons: Lesson[];
}

// Padrões específicos do Catecismo Nova Cidade
const SECTION_PATTERNS = {
  bibleRef: /^(\d\s+)?[A-Za-zÀ-ú\s]+\d+[.,:]\d+/,
  commentarios: /^Comentários$/,
  mudandoDeCanais: /^Mudando de Canais$/,
  textoPratica: /^O Texto na Prática$/,
  questionNumber: /^\d+\.\s/,
  // Nomes de teólogos conhecidos (bold)
  theologians: /^(João Calvino|Timothy Keller|D\. A\. Carson|Jonathan Edwards|Richard Baxter|Kevin Deyoung|J\. C\. Ryle|John Piper|R\. Kent Hughes|Richard Sibbes|Bryan Chapell|John Wesley|Juan Sanchez|John Bunyan|John Yates|Martyn Lloyd-Jones|Stephen Um|João Bradford|Thabiti Anyabwile|Charles Haddon Spurgeon|John Lin|Martinho Lutero)$/,
};

// Artigos e preposições que podem aparecer em minúsculas em títulos portuguêses
const TITLE_LOWERCASE_EXCEPTIONS = new Set(['e', 'é', 'a', 'o', 'de', 'do', 'da', 'dos', 'das', 'ao', 'em']);

function isTitleCaseLine(line: string): boolean {
  const words = line.replace(/[?!.,;:\-–]/g, '').split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return false;
  // Permite art./prep. minúsculos (e, é, a, o, de, ...)
  return words.every(w => TITLE_LOWERCASE_EXCEPTIONS.has(w.toLowerCase()) || /^[A-ZÁÉÍÓÚÀÃÕÂÊÎÔÛ]/.test(w));
}

function normalizePdfText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'text' in value) {
    const text = (value as { text?: unknown }).text;
    return typeof text === 'string' ? text : '';
  }
  return '';
}

async function getPdfText(dataBuffer: Buffer): Promise<string> {
  const binaryData = new Uint8Array(dataBuffer);

  if (typeof pdfParseFn === 'function') {
    const data = await (pdfParseFn as any)(binaryData);
    return normalizePdfText(data);
  }

  if (PDFParseClass) {
    const parser = new PDFParseClass(binaryData);
    const text = await parser.getText();
    return normalizePdfText(text);
  }

  throw new Error('Nao foi possivel carregar o modulo pdf-parse.');
}

async function extractLessonsFromPdf(pdfPath: string, lessonIdPrefix: string): Promise<Lesson[]> {
  const dataBuffer = fs.readFileSync(pdfPath);
  const text = await getPdfText(dataBuffer);
  
  // Divide por linhas e limpa (remove page markers do pdf-parse v2)
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !/^-- \d+ of \d+ --$/.test(l));

  const lessons: Lesson[] = [];
  let currentLesson: Partial<Lesson> | null = null;
  let currentSection: 'answer' | 'comments' | 'mudando' | 'questions' | null = null;
  let lessonOrder = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1] || '';

    // Detecta início de nova lição (título em Title Case terminando com ?, pode ser multi-linha)
    // Verificado antes dos guards de seção para permitir transição de 'questions' para nova lição
    {
      const wordCount = line.replace(/[?!.,;:\-–]/g, '').split(/\s+/).filter(w => w.length > 0).length;
      const isTitle = wordCount >= 2 &&
        /^[A-ZÁÉÍÓÚÀÃÕÂÊÎÔÛ]/.test(line) &&  // primeira palavra em maiúscula
        isTitleCaseLine(line) &&
        !SECTION_PATTERNS.commentarios.test(line) &&
        !SECTION_PATTERNS.mudandoDeCanais.test(line) &&
        !SECTION_PATTERNS.textoPratica.test(line) &&
        !SECTION_PATTERNS.theologians.test(line);

      let fullTitle = '';
      if (isTitle && line.endsWith('?')) {
        fullTitle = line;
      } else if (isTitle) {
        // Lookahead de até 2 linhas para títulos multi-linha
        let joined = line;
        let advanced = 0;
        for (let j = i + 1; j <= i + 2 && j < lines.length; j++) {
          const nextL = lines[j];
          if (!isTitleCaseLine(nextL)) break;
          joined += ' ' + nextL;
          advanced++;
          if (nextL.endsWith('?')) {
            fullTitle = joined;
            i += advanced;
            break;
          }
        }
      }

      if (fullTitle) {
        if (currentLesson?.title) {
          lessons.push(finalizeLesson(currentLesson, ++lessonOrder, lessonIdPrefix));
        }
        currentLesson = {
          title: fullTitle.toUpperCase(),
          content: [],
          reflectionQuestions: [],
          bibleReference: '',
        };
        currentSection = 'answer';
        continue;
      }
    }

    if (!currentLesson) continue;

    // Detecta referência bíblica (logo após o título da resposta)
    if (currentSection === 'answer' && SECTION_PATTERNS.bibleRef.test(line) && !line.includes('?')) {
      if (!currentLesson.bibleReference) {
        currentLesson.bibleReference = line.replace('–', '-');
        continue;
      }
    }

    // Seção: Comentários
    if (SECTION_PATTERNS.commentarios.test(line)) {
      currentSection = 'comments';
      currentLesson.content?.push({ type: 'heading', text: 'Comentários' });
      continue;
    }

    // Seção: Mudando de Canais
    if (SECTION_PATTERNS.mudandoDeCanais.test(line)) {
      currentSection = 'mudando';
      currentLesson.content?.push({ type: 'heading', text: 'Mudando de Canais' });
      continue;
    }

    // Seção: O Texto na Prática (perguntas de reflexão)
    if (SECTION_PATTERNS.textoPratica.test(line)) {
      currentSection = 'questions';
      continue;
    }

    // Número de página (ignora)
    if (/^\d+$/.test(line)) continue;

    // Perguntas de reflexão
    if (currentSection === 'questions') {
      if (SECTION_PATTERNS.questionNumber.test(line)) {
        const question = line.replace(/^\d+\.\s/, '').trim();
        // Verifica se a próxima linha é continuação da pergunta
        let fullQuestion = question;
        while (i + 1 < lines.length && !SECTION_PATTERNS.questionNumber.test(lines[i + 1]) && 
               !(isTitleCaseLine(lines[i + 1]) && lines[i + 1].endsWith('?')) && !/^\d+$/.test(lines[i + 1])) {
          i++;
          fullQuestion += ' ' + lines[i];
        }
        currentLesson.reflectionQuestions?.push(fullQuestion);
      }
      continue;
    }

    // Nome de teólogo (bold)
    if (SECTION_PATTERNS.theologians.test(line) && currentSection === 'comments') {
      currentLesson.content?.push({ type: 'paragraph', text: line, bold: true });
      continue;
    }

    // Versículo bíblico em itálico (identifica por contexto: vem logo após a resposta do catecismo)
    if (currentSection === 'answer' && currentLesson.bibleReference &&
        currentLesson.content?.filter(c => c.type === 'bible_quote').length === 0) {
      // Acumula o versículo que pode estar em múltiplas linhas
      let verseText = line;
      while (i + 1 < lines.length && 
             !SECTION_PATTERNS.commentarios.test(lines[i + 1]) &&
             !SECTION_PATTERNS.theologians.test(lines[i + 1]) &&
             !/^\d+$/.test(lines[i + 1])) {
        i++;
        verseText += ' ' + lines[i];
        if (verseText.includes(currentLesson.bibleReference?.split(':')[0] || '')) break;
      }
      currentLesson.content?.push({ type: 'bible_quote', text: verseText });
      continue;
    }

    // Parágrafo normal
    if (line.length > 20) {
      // Acumula parágrafos que continuam na próxima linha
      let paragraph = line;
      while (i + 1 < lines.length && 
             lines[i + 1].length > 0 &&
             !(isTitleCaseLine(lines[i + 1]) && lines[i + 1].endsWith('?')) &&
             !SECTION_PATTERNS.commentarios.test(lines[i + 1]) &&
             !SECTION_PATTERNS.mudandoDeCanais.test(lines[i + 1]) &&
             !SECTION_PATTERNS.textoPratica.test(lines[i + 1]) &&
             !SECTION_PATTERNS.theologians.test(lines[i + 1]) &&
             !SECTION_PATTERNS.bibleRef.test(lines[i + 1]) &&
             !/^\d+$/.test(lines[i + 1]) &&
             // Linha seguinte parece ser continuação (não começa nova ideia)
             !lines[i + 1].match(/^[A-Z][a-z].*:$/) &&
             paragraph.length < 800) {
        i++;
        paragraph += ' ' + lines[i];
      }
      currentLesson.content?.push({ type: 'paragraph', text: paragraph });
    }
  }

  if (currentLesson?.title) {
    lessons.push(finalizeLesson(currentLesson, ++lessonOrder, lessonIdPrefix));
  }

  return lessons;
}

function finalizeLesson(lesson: Partial<Lesson>, order: number, idPrefix: string): Lesson {
  const id = `${idPrefix}-${String(order).padStart(2, '0')}`;
  return {
    id,
    order,
    title: lesson.title || '',
    bibleReference: lesson.bibleReference || '',
    content: lesson.content || [],
    reflectionQuestions: lesson.reflectionQuestions || [],
  };
}

function toTitleCase(str: string): string {
  return str.split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

function resolveLessonIdPrefix(existing: StudyJson | null, override?: string): string {
  if (override) return override;
  const existingId = existing?.lessons?.[0]?.id || '';
  const match = existingId.match(/^([A-Za-z0-9]+)-\d+$/);
  if (match) return match[1];
  return 'lesson';
}

function compareLessons(existing: Lesson[] | undefined, generated: Lesson[]): string[] {
  if (!existing || existing.length === 0) return [];
  const changes: string[] = [];
  const max = Math.max(existing.length, generated.length);

  for (let i = 0; i < max; i++) {
    const prev = existing[i];
    const next = generated[i];
    if (!prev || !next) {
      changes.push(`Licao ${i + 1}: quantidade mudou`);
      continue;
    }
    const prevStr = JSON.stringify(prev);
    const nextStr = JSON.stringify(next);
    if (prevStr !== nextStr) {
      changes.push(`Licao ${prev.order}: ${prev.title}`);
    }
  }

  return changes;
}

function parseArgs(argv: string[]) {
  const result: Record<string, string> = {};
  const positionals: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = argv[i + 1];
      if (!value || value.startsWith('--')) {
        result[key] = 'true';
      } else {
        result[key] = value;
        i++;
      }
    } else {
      positionals.push(arg);
    }
  }

  return { result, positionals };
}

// Executa
const { result: args, positionals } = parseArgs(process.argv.slice(2));
const inputPdfPath = positionals[0] || './Catecismo_-_Nova_Cidade.pdf';
let pdfPath = inputPdfPath;

if (!fs.existsSync(pdfPath) && !path.isAbsolute(pdfPath)) {
  const fallbackPath = path.resolve(process.cwd(), 'scripts', 'pdf', pdfPath);
  if (fs.existsSync(fallbackPath)) {
    pdfPath = fallbackPath;
  }
}

const pdfBase = path.basename(pdfPath, path.extname(pdfPath));
const defaultId = slugify(pdfBase);

const outDir = path.resolve(process.cwd(), 'src', 'data', 'estudos');
const providedJsonPath = args.json ? path.resolve(process.cwd(), args.json) : '';
const providedOutPath = args.out ? path.resolve(process.cwd(), args.out) : '';
const defaultOutPath = path.join(outDir, `${args.id || defaultId}.json`);
const outputPath = providedOutPath || providedJsonPath || defaultOutPath;

const existingPath = providedJsonPath || (fs.existsSync(outputPath) ? outputPath : '');
const existingJson = existingPath
  ? (JSON.parse(fs.readFileSync(existingPath, 'utf-8')) as StudyJson)
  : null;

const lessonIdPrefix = resolveLessonIdPrefix(existingJson, args['lesson-prefix']);

extractLessonsFromPdf(pdfPath, lessonIdPrefix).then(lessons => {
  const output: StudyJson = {
    id: args.id || existingJson?.id || defaultId,
    title: args.title || existingJson?.title || toTitleCase(pdfBase),
    subtitle: args.subtitle || existingJson?.subtitle || '',
    author: args.author || existingJson?.author || '',
    introduction: args.introduction || existingJson?.introduction || '',
    coverImage: args['cover-image'] || existingJson?.coverImage || null,
    lessons,
  };

  const changes = compareLessons(existingJson?.lessons, lessons);
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

  if (!existingJson) {
    console.log(`✓ JSON criado → ${outputPath}`);
  } else if (changes.length === 0) {
    console.log(`✓ Sem divergencias. JSON atualizado → ${outputPath}`);
  } else {
    console.log(`✓ ${changes.length} licoes divergentes atualizadas → ${outputPath}`);
  }
});