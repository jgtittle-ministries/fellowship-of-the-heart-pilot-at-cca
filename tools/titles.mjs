// =====================================================================
// titles.mjs — shared chapter-title extraction for the FotH reader build.
// Imported by build-manifest.mjs and build-search-index.mjs so the nav,
// sidebar, prev/next, page <title>, and search results all agree.
//
// The FotH source docs lead with a repeated title block —
//   **FELLOWSHIP OF THE HEART** / *<series> series* / Week N /
//   **<Chapter Title>** / *<deck>* / **COMPANION LESSON PLAN** / … /
//   # Quick Reference Card / ## WEEK N — TITLE (90 minutes)
// so a naive "first # heading or first **bold**" picks up boilerplate
// ("Quick Reference Card", "FELLOWSHIP OF THE HEART") instead of the real
// title. The rules below extract the intended title per doc type.
//
// Dependency-free (Node 16+).
// =====================================================================
import { readFileSync } from 'node:fs';

// Irregular files whose real title isn't reliably in an H1 or the first
// bold line (handbooks, guides, cards, change logs). Keyed by docs-relative
// path. Anything not listed falls through to the heuristics below.
export const TITLE_OVERRIDES = {
  'getting-started/handbook.md': 'Companion Handbook',
  'getting-started/precohort-discernment-guide.md': 'Pre-Cohort Discernment Guide',
  'getting-started/CHANGELOG.md': 'Change Log',
  'going-deeper/handbook.md': 'Companion Handbook',
  'going-deeper/CHANGELOG.md': 'Change Log',
  'going-out/handbook.md': 'Companion Handbook',
  'going-out/inviting-others-handbook.md': 'Inviting Others Handbook',
  'going-out/CHANGELOG.md': 'Change Log',
  'shared/family-conversation-cards.md': 'Family Conversation Cards',
  'shared/personal-heart-journal.md': 'Personal Heart Journal',
  'shared/proapt-card.md': 'PROAPT Card',
  'shared/reading-list.md': 'Reading List',
  'shared/rhythm-card.md': 'Rhythm Card',
  'shared/interrogating-reality-card.md': 'Interrogating Reality Card'
};

const SMALL = new Set(['a','an','and','the','of','to','in','on','for','at','by','or','as','is','it']);
const titleCase = (s) => s.toLowerCase().split(/\s+/).map((w, i) =>
  (i > 0 && SMALL.has(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1)
).join(' ');

const stripFm = (t) => t.replace(/\r/g, '').replace(/^---[\s\S]*?\n---\s*/, '');

// Extract "Week N — <Chapter Title>" from a lesson-plan title block.
const weekTitle = (txt) => {
  const lines = txt.split('\n');
  for (let i = 0; i < Math.min(lines.length, 30); i++) {
    const m = lines[i].match(/^Week\s+(\d+)\s*$/i);
    if (!m) continue;
    for (let j = i + 1; j < Math.min(lines.length, i + 6); j++) {
      const b = lines[j].match(/^\*\*(.+?)\*\*\s*$/);
      if (b) return `Week ${m[1]} — ${b[1].trim()}`;
      if (lines[j].trim() !== '') break;
    }
  }
  // fallback: title-case the "## WEEK N — TITLE (90 minutes)" section head
  const h2 = txt.match(/^##\s+WEEK\s+(\d+)\s*[—-]\s*(.+?)(?:\s*\([^)]*\))?\s*$/mi);
  if (h2) return `Week ${h2[1]} — ${titleCase(h2[2])}`;
  return null;
};

// file: absolute path; rel: docs-relative path with forward slashes.
export function titleFromMd(file, rel) {
  if (TITLE_OVERRIDES[rel]) return TITLE_OVERRIDES[rel];

  const txt = stripFm(readFileSync(file, 'utf8'));
  const base = rel.split('/').pop();

  if (/week-\d+/i.test(base)) {
    const wt = weekTitle(txt);
    if (wt) return wt;
  }

  const h1 = txt.match(/^#\s+(.+?)\s*#*\s*$/m);
  if (h1) return h1[1].trim().replace(/\*\*/g, '');

  const bold = txt.match(/^\*\*(.+?)\*\*\s*$/m);
  if (bold) return bold[1].trim();

  return titleCase(base.replace(/\.md$/, '').replace(/[-_]+/g, ' '));
}
