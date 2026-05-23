# Fellowship of the Heart — CCA Pilot

*The operational expression of the Intentional Journey of the Heart (IJH) framework, prepared for the first Covenant Christian Academy cohort.*

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

## Repo layout

```
docs/                          # MkDocs source — the site content
├── index.md                   # site home
├── getting-started/           # Series 1: 10 weeks + handbook + pre-cohort guide
├── going-deeper/              # Series 2: 12 weeks + handbook
├── going-out/                 # Series 3: 12 weeks + 2 handbooks
└── shared/                    # participant materials used across all 3 series
mkdocs.yml                     # site config
requirements.txt               # build dependencies
.github/workflows/deploy.yml   # GitHub Actions build + Pages deploy
```

---

## Build locally

```bash
pip install -r requirements.txt
mkdocs serve          # live-reload preview at http://127.0.0.1:8000
mkdocs build --strict # build to site/, fail on broken links
```

---

## License

Curriculum content released under [**Creative Commons Attribution-ShareAlike 4.0 International**](https://creativecommons.org/licenses/by-sa/4.0/). See [docs/index.md](docs/index.md) for the full license note (including the carve-out for participant content).

---

John G. Tittle, jgtittle-ministries.
