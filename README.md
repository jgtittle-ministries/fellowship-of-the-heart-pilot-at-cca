# Fellowship of the Heart — CCA Pilot

*The operational expression of the Intentional Journey of the Heart (IJH) framework, prepared for the first Covenant Christian Academy of Warrenton cohort.*

**By John G. Tittle**

📖 **Read the site:** **[jgtittle-ministries.github.io/fellowship-of-the-heart-pilot-at-cca](https://jgtittle-ministries.github.io/fellowship-of-the-heart-pilot-at-cca/)**

[![License: CC BY-SA 4.0](https://licensebuttons.net/l/by-sa/4.0/88x31.png)](https://creativecommons.org/licenses/by-sa/4.0/)

---

## What's here

Three sequential series walked across a year of Tuesday evenings:

1. **Getting Started** — 10 weeks introducing the Four Connects.
2. **Going Deeper** — 12 weeks of the diagnostic, therapeutic, and developmental work of IJH Vol 2.
3. **Going Out** — 12 weeks discerning and equipping leaders to start formation groups of their own.

Plus the shared participant materials (Personal Heart Journal, Family Conversation Cards, Rhythm Card, Reading List).

The full reading experience is the site, not the repo. Open the [live site](https://jgtittle-ministries.github.io/fellowship-of-the-heart-pilot-at-cca/) for the rendered content with navigation, search, and dark/light mode.

---

## How the site works

This repo is a **static, hand-authored reader** — no build step, no MkDocs, no GitHub Actions. GitHub Pages serves the files directly from `main` (root), with `.nojekyll` so they're served as-is. `reader.html` reads the chapter path from the URL hash, `fetch()`es the matching `docs/*.md`, and renders it in the browser with a small Markdown parser. The landing pages (Home, Start here, each series index) are ordinary `docs/*.md`, so content stays single-sourced.

---

## Repo layout

```
docs/                  # curriculum content (Markdown) — fetched + rendered at runtime
├── index.md           # site home
├── start-here.md      # orientation page
├── getting-started/   # Series 1: 10 weeks + handbook + pre-cohort guide
├── going-deeper/      # Series 2: 12 weeks + handbook
├── going-out/         # Series 3: 12 weeks + 2 handbooks
└── shared/            # participant materials used across all 3 series
index.html             # 3-line redirect into the reader
reader.html            # reader shell (top nav, sidebar, search, theme toggle, rails)
reader.js              # Markdown parser + series-aware page logic
styles.css             # warm editorial theme, dark mode, responsive scrolling tables
manifest.js            # GENERATED — site config + series/chapter nav
search-index.json      # GENERATED — client-side search corpus
.nojekyll              # serve files as-is (skip Jekyll) on GitHub Pages
tools/                 # build-manifest.mjs, build-search-index.mjs, titles.mjs
```

---

## Run / edit locally

```bash
# No build step. Serve over HTTP — the reader fetch()es Markdown, so file:// won't work:
python -m http.server 8000        # then open http://localhost:8000/

# After adding, removing, or retitling anything under docs/, regenerate the
# nav manifest and the search index (dependency-free, Node 16+):
node tools/build-manifest.mjs && node tools/build-search-index.mjs
```

Chapter titles come from each file's title block (week files → "Week N — Title") and series indexes from their `#` heading, with an override map in `tools/titles.mjs` for the handbooks, guides, cards, and change logs.

---

## License

Curriculum content released under [**Creative Commons Attribution-ShareAlike 4.0 International**](https://creativecommons.org/licenses/by-sa/4.0/). See [docs/index.md](docs/index.md) for the full license note (including the carve-out for participant content).

---

John G. Tittle, jgtittle-ministries.
