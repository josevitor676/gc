#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const mod = require('pdf-parse');
const PDFParse = mod?.PDFParse || mod?.default?.PDFParse;
const parseFn = mod?.default || mod;

const srcDir = process.argv[2] || 'C:/Users/vinis/OneDrive/Documentos/projects/Livretos GCs';
const outDir = process.argv[3] || path.resolve(process.cwd(), 'tmp-pdf-text');
fs.mkdirSync(outDir, { recursive: true });

async function getText(buffer) {
  const data = new Uint8Array(buffer);
  if (PDFParse) {
    const parser = new PDFParse(data);
    const r = await parser.getText();
    return typeof r === 'string' ? r : (r?.text ?? '');
  }
  const r = await parseFn(data);
  return typeof r === 'string' ? r : (r?.text ?? '');
}

const files = fs.readdirSync(srcDir).filter((f) => f.toLowerCase().endsWith('.pdf'));
for (const f of files) {
  try {
    const buf = fs.readFileSync(path.join(srcDir, f));
    const text = await getText(buf);
    fs.writeFileSync(path.join(outDir, f.replace(/\.pdf$/i, '.txt')), text, 'utf-8');
    console.log(`OK ${f} -> ${text.length} chars`);
  } catch (e) {
    console.log(`ERR ${f}: ${e.message}`);
  }
}
