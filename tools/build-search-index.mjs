#!/usr/bin/env node
// =====================================================================
// build-search-index.mjs — generate search-index.json from docs/.
// Run from the repo root after content changes:
//     node tools/build-search-index.mjs
// Strips markdown to plain text so the reader's client-side search can
// match titles and body. Dependency-free (Node 16+).
// =====================================================================
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { titleFromMd } from './titles.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'docs');

const SERIES_NAMES = {
  '': 'Home',
  'getting-started': 'Getting Started',
  'going-deeper': 'Going Deeper',
  'going-out': 'Going Out',
  'shared': 'Shared materials'
};

// Root pages get nav-friendly names (mirrors build-manifest.mjs pageMeta).
const PAGE_TITLES = { 'index.md': 'Home', 'start-here.md': 'Start here' };

const walk = (dir) => {
  let out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out = out.concat(walk(p));
    else if (e.endsWith('.md')) out.push(p);
  }
  return out;
};

const toText = (md) =>
  md.replace(/^---[\s\S]*?\n---\s*/, '')        // frontmatter
    .replace(/```[\s\S]*?```/g, ' ')            // code fences
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')      // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')    // links → text
    .replace(/[#>*_`|!-]+/g, ' ')               // md punctuation
    .replace(/\s+/g, ' ')
    .trim();

const index = [];
for (const file of walk(DOCS)) {
  const rel = relative(ROOT, file).split(/[\\/]/).join('/');  // docs/<series>/<file>
  const docsRel = relative(DOCS, file).split(/[\\/]/).join('/'); // <series>/<file>
  const parts = rel.split('/');
  const seriesKey = parts.length > 2 ? parts[1] : '';
  const md = readFileSync(file, 'utf8');
  index.push({
    path: rel,
    title: PAGE_TITLES[docsRel] || titleFromMd(file, docsRel),
    series: SERIES_NAMES[seriesKey] || seriesKey,
    text: toText(md).slice(0, 4000)             // cap per-doc text
  });
}

writeFileSync(join(ROOT, 'search-index.json'), JSON.stringify(index));
console.log(`search-index.json written: ${index.length} documents.`);
