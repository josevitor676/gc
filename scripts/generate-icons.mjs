#!/usr/bin/env node
/**
 * Gera ícones PWA em public/icons/ a partir de assets/icon.png
 * 
 * Uso:
 *   node scripts/generate-icons.mjs
 */

import sharp from "sharp";
import { mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const src = resolve(__dirname, "../../gc-app/assets/icon.png");
const outDir = resolve(__dirname, "../public/icons");

mkdirSync(outDir, { recursive: true });

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "icon-180.png", size: 180 }, // Apple touch icon
  { name: "icon-144.png", size: 144 },
  { name: "icon-96.png",  size: 96  },
];

for (const { name, size } of sizes) {
  const out = resolve(outDir, name);
  await sharp(src).resize(size, size).toFile(out);
  console.log(`✅ ${name} (${size}×${size})`);
}

console.log(`\nÍcones gerados em ${outDir}`);
