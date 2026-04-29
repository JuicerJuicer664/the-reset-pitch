#!/usr/bin/env node
/**
 * Embeds assets/hero.png into the-reset.html as a base64 data URL.
 * Replaces the marker `<!--HERO_DATA_URL-->` (which is the value of the
 * src attribute on the hero <img>).
 *
 * Usage: node tools/embed-hero.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const HERO = resolve(ROOT, 'assets/hero.png');
const HTML = resolve(ROOT, 'the-reset.html');
const MARKER = '<!--HERO_DATA_URL-->';

if (!existsSync(HERO)) {
  console.error(`hero image not found at ${HERO}`);
  process.exit(1);
}
if (!existsSync(HTML)) {
  console.error(`html file not found at ${HTML}`);
  process.exit(1);
}

const png = readFileSync(HERO);
const dataUrl = `data:image/png;base64,${png.toString('base64')}`;

const html = readFileSync(HTML, 'utf8');
if (!html.includes(MARKER)) {
  console.error(`marker ${MARKER} not found in ${HTML}. Has the image already been embedded? If so, restore the marker before re-running.`);
  process.exit(1);
}
const updated = html.replace(MARKER, dataUrl);
writeFileSync(HTML, updated);
console.log(`embedded ${(png.length / 1024 / 1024).toFixed(2)} MB hero into the-reset.html`);
