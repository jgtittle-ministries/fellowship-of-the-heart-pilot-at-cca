// ============================================
// Markdown parser — handles the source's actual subset
// (Unchanged from the proven IJH reader. Renders fetched markdown verbatim:
//  headings, bold/italic, links, images, tables, admonitions, lists,
//  blockquotes, code, hr. He/Him capitalization is preserved as written.)
// ============================================
(function () {
  'use strict';

  const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  // Inline formatting: code, bold, italic, links, images
  function inline(text) {
    let s = escapeHtml(text);
    // Inline code
    s = s.replace(/`([^`]+)`/g, (_, code) => '<code>' + code + '</code>');
    // Shared: resolve a relative path against the current chapter's docs/ dir.
    function resolvePath(u) {
      if (/^https?:|^data:|^\//.test(u)) return u;
      const ctx = window.__current_md_path || '';
      const parts = ctx.substring(0, ctx.lastIndexOf('/')).split('/');
      let t = u;
      if (t.startsWith('./')) t = t.slice(2);
      while (t.startsWith('../')) { parts.pop(); t = t.slice(3); }
      return (parts.length ? parts.join('/') + '/' : '') + t;
    }
    // Images ![alt](src) with an optional {: …} attr-list. Any .classes in
    // the attr-list are added to the figure (e.g. {: .inset-left} for a small
    // float-left figure); default with no attr-list is the full-width figure.
    s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)(?:\{:\s*([^}]*?)\s*\})?/g, (_, alt, src, attrs) => {
      const safeAlt = alt.replace(/"/g, '&quot;');
      const resolved = resolvePath(src);
      let cls = 'md-figure';
      if (attrs) { const m = attrs.match(/\.[A-Za-z0-9_-]+/g); if (m) cls += ' ' + m.map(c => c.slice(1)).join(' '); }
      // `alt` is already HTML-escaped (inline() escapes the whole string up
      // front), so it is safe to drop straight into the figcaption — escaping
      // again here would double-encode apostrophes/ampersands in captions.
      return '<figure class="' + cls + '"><img src="' + resolved + '" alt="' + safeAlt + '" loading="lazy"/>' +
             (alt ? '<figcaption>' + alt + '</figcaption>' : '') +
             '</figure>';
    });
    // Links [text](url) with an optional {: …} attr-list (MkDocs attr_list,
    // used by the PDF-popup links). .md links open in the reader; PDFs and
    // other files get their relative path resolved and any classes/
    // data-pdf-label carried through so the popup handler can pick them up.
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)(?:\{:\s*([^}]*?)\s*\})?/g, (_, txt, url, attrs) => {
      const safeUrl = url.replace(/"/g, '%22');
      // In-page anchor link [text](#slug): keep it as a bare fragment (do NOT
      // resolve it against the current directory) so the delegated handler can
      // scroll to the matching heading, whose id is "h-"+slug.
      if (safeUrl.startsWith('#')) {
        return '<a class="anchor-link" href="' + safeUrl + '">' + txt + '</a>';
      }
      if (/\.md(#|$)/.test(safeUrl) && !/^https?:/.test(safeUrl)) {
        return '<a href="reader.html#' + encodeURIComponent(resolvePath(safeUrl)) + '">' + txt + '</a>';
      }
      let cls = [], label = '';
      if (attrs) {
        (attrs.match(/\.[A-Za-z0-9_-]+/g) || []).forEach(c => cls.push(c.slice(1)));
        // escapeHtml has already run, so the quotes are &quot; here.
        const m = attrs.match(/data-pdf-label\s*=\s*(?:"|&quot;)([\s\S]*?)(?:"|&quot;)/);
        if (m) label = m[1];
      }
      const resolved = resolvePath(safeUrl);
      let attrStr = '';
      if (cls.length) attrStr += ' class="' + cls.join(' ') + '"';
      if (label) attrStr += ' data-pdf-label="' + label.replace(/"/g, '&quot;') + '"';
      const ext = /^https?:/.test(safeUrl) ? ' target="_blank" rel="noopener"' : '';
      return '<a href="' + resolved + '"' + attrStr + ext + '>' + txt + '</a>';
    });
    // Bold **text** and __text__
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    // Italic *text* and _text_ (single, not surrounded by other *)
    s = s.replace(/(?<![*\w])\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>');
    s = s.replace(/(?<![_\w])_([^_\n]+?)_(?!_)/g, '<em>$1</em>');
    return s;
  }

  function parseTable(lines, start) {
    // lines[start] is header row, lines[start+1] is separator
    if (start + 1 >= lines.length) return null;
    if (!/^\s*\|?[\s\-:|]+\|?\s*$/.test(lines[start + 1])) return null;
    const splitRow = (row) => row.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(c => c.trim());
    const header = splitRow(lines[start]);
    let i = start + 2;
    const rows = [];
    while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
      rows.push(splitRow(lines[i]));
      i++;
    }
    let html = '<table><thead><tr>';
    header.forEach(h => html += '<th>' + inline(h) + '</th>');
    html += '</tr></thead><tbody>';
    rows.forEach(r => {
      html += '<tr>';
      r.forEach(c => html += '<td>' + inline(c) + '</td>');
      html += '</tr>';
    });
    html += '</tbody></table>';
    return { html, consumed: i - start };
  }

  function parseAdmonition(lines, start) {
    const m = lines[start].match(/^!!!\s+(\w+)(?:\s+"([^"]*)")?/);
    if (!m) return null;
    const kind = m[1].toLowerCase();
    const title = m[2] || kind.toUpperCase();
    let i = start + 1;
    const inner = [];
    while (i < lines.length) {
      const ln = lines[i];
      if (ln.trim() === '') { inner.push(''); i++; continue; }
      if (/^    /.test(ln) || /^\t/.test(ln)) {
        inner.push(ln.replace(/^(    |\t)/, ''));
        i++;
      } else {
        break;
      }
    }
    // trim trailing blanks
    while (inner.length && inner[inner.length-1] === '') inner.pop();
    const inside = parseBlocks(inner);
    const html = `<div class="admonition ${kind}"><div class="admonition-title">${escapeHtml(title)}</div>${inside}</div>`;
    return { html, consumed: i - start };
  }

  function parseList(lines, start, ordered) {
    const marker = ordered ? /^(\s*)\d+\.\s+(.*)$/ : /^(\s*)[-*+]\s+(.*)$/;
    const items = [];
    let i = start;
    let baseIndent = -1;
    while (i < lines.length) {
      const m = lines[i].match(marker);
      if (m) {
        const indent = m[1].length;
        if (baseIndent === -1) baseIndent = indent;
        if (indent !== baseIndent) break;
        const itemLines = [m[2]];
        i++;
        while (i < lines.length) {
          if (lines[i].trim() === '') {
            // could be paragraph continuation; peek ahead
            const next = lines[i + 1];
            if (next && /^\s{2,}/.test(next) && !next.match(marker)) {
              itemLines.push('');
              i++;
              continue;
            }
            break;
          }
          if (lines[i].match(marker) && (lines[i].match(/^(\s*)/)[1].length === baseIndent)) break;
          if (/^\s+/.test(lines[i])) {
            itemLines.push(lines[i].replace(new RegExp('^\\s{' + (baseIndent + 2) + '}'), ''));
            i++;
          } else if (/^\s*[-*+]\s/.test(lines[i]) || /^\s*\d+\.\s/.test(lines[i])) {
            itemLines.push(lines[i]);
            i++;
          } else {
            break;
          }
        }
        items.push(itemLines);
      } else if (lines[i].trim() === '' && i + 1 < lines.length && lines[i + 1].match(marker)) {
        i++;
      } else {
        break;
      }
    }
    if (!items.length) return null;
    const tag = ordered ? 'ol' : 'ul';
    let html = '<' + tag + '>';
    items.forEach(itemLines => {
      // If item has multiple paragraphs (blanks inside), parse as blocks; otherwise inline
      const hasBlock = itemLines.some(l => l === '') || itemLines.some(l => /^[-*+\d]/.test(l));
      if (hasBlock) {
        html += '<li>' + parseBlocks(itemLines) + '</li>';
      } else {
        html += '<li>' + inline(itemLines.join(' ')) + '</li>';
      }
    });
    html += '</' + tag + '>';
    return { html, consumed: i - start };
  }

  function parseBlocks(lines) {
    let out = '';
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Blank line
      if (trimmed === '') { i++; continue; }

      // HR
      if (/^(\s*)(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
        out += '<hr/>';
        i++; continue;
      }

      // Heading
      const hm = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
      if (hm) {
        const level = hm[1].length;
        out += '<h' + level + '>' + inline(hm[2]) + '</h' + level + '>';
        i++; continue;
      }

      // Code block
      if (/^```/.test(trimmed)) {
        const fence = trimmed.match(/^(`{3,})/)[1];
        i++;
        const code = [];
        while (i < lines.length && !lines[i].startsWith(fence)) {
          code.push(lines[i]);
          i++;
        }
        out += '<pre><code>' + escapeHtml(code.join('\n')) + '</code></pre>';
        i++; continue;
      }

      // Admonition !!! kind "title"
      if (/^!!!\s+\w+/.test(line)) {
        const r = parseAdmonition(lines, i);
        if (r) { out += r.html; i += r.consumed; continue; }
      }

      // Blockquote
      if (/^>\s?/.test(trimmed)) {
        const quoteLines = [];
        while (i < lines.length && (/^>/.test(lines[i].trim()) || lines[i].trim() === '')) {
          if (lines[i].trim() === '') {
            if (i + 1 < lines.length && /^>/.test(lines[i+1].trim())) {
              quoteLines.push('');
              i++;
              continue;
            }
            break;
          }
          quoteLines.push(lines[i].replace(/^\s*>\s?/, ''));
          i++;
        }
        out += '<blockquote>' + parseBlocks(quoteLines) + '</blockquote>';
        continue;
      }

      // Table
      if (line.includes('|') && i + 1 < lines.length && /^\s*\|?[\s\-:|]+\|?\s*$/.test(lines[i + 1])) {
        const r = parseTable(lines, i);
        if (r) { out += r.html; i += r.consumed; continue; }
      }

      // Lists
      if (/^\s*[-*+]\s/.test(line)) {
        const r = parseList(lines, i, false);
        if (r) { out += r.html; i += r.consumed; continue; }
      }
      if (/^\s*\d+\.\s/.test(line)) {
        const r = parseList(lines, i, true);
        if (r) { out += r.html; i += r.consumed; continue; }
      }

      // Paragraph
      const pLines = [];
      while (i < lines.length && lines[i].trim() !== '' &&
             !/^#{1,6}\s/.test(lines[i]) &&
             !/^>\s?/.test(lines[i].trim()) &&
             !/^!!!/.test(lines[i]) &&
             !/^```/.test(lines[i].trim()) &&
             !/^\s*[-*+]\s/.test(lines[i]) &&
             !/^\s*\d+\.\s/.test(lines[i]) &&
             !/^(\s*)(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i])) {
        pLines.push(lines[i]);
        i++;
      }
      if (pLines.length) {
        out += '<p>' + inline(pLines.join(' ').trim()) + '</p>';
      }
    }
    return out;
  }

  function stripFrontmatter(text) {
    if (!text.startsWith('---')) return text;
    const end = text.indexOf('\n---', 3);
    if (end === -1) return text;
    return text.slice(end + 4).replace(/^\s*\n/, '');
  }

  function renderMarkdown(text) {
    // Normalize CRLF/CR → LF first. IJH's docs/*.md are currently LF, but a
    // future docx→md import on Windows would use CRLF; several block regexes
    // end in `(.*)$`, which a trailing \r defeats (`.` won't eat \r, `$` won't
    // match before it) — that makes list markers fail to parse and the block
    // dispatch loop spin without advancing (an infinite "Loading…" hang).
    const norm = stripFrontmatter(text).replace(/\r\n?/g, '\n');
    return parseBlocks(norm.split('\n'));
  }

  window.renderMarkdown = renderMarkdown;
})();

// ============================================
// Theme (dark mode) — set ASAP, persisted
// ============================================
(function () {
  const KEY = 'foth-theme';
  const saved = localStorage.getItem(KEY);
  const sys = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (sys ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  window.__setTheme = (t) => { document.documentElement.setAttribute('data-theme', t); localStorage.setItem(KEY, t); updateBtn(t); };
  window.__toggleTheme = () => window.__setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  function updateBtn(t) {
    const b = document.getElementById('theme-toggle'); if (!b) return;
    b.querySelector('.ico').textContent = t === 'dark' ? '☾' : '☀';
    b.setAttribute('aria-label', t === 'dark' ? 'Switch to light' : 'Switch to dark');
  }
  document.addEventListener('DOMContentLoaded', () => updateBtn(document.documentElement.getAttribute('data-theme')));
})();

// ============================================
// Reader page logic (series-aware, FotH)
// ============================================
(function () {
  'use strict';

  const escapeHTML = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  const params = new URLSearchParams(window.location.search);
  let path = params.get('path');
  if (!path && window.location.hash) path = decodeURIComponent(window.location.hash.replace(/^#/, ''));
  if (!path) path = 'docs/index.md';

  // A cross-chapter link may carry an in-content anchor as "docs/…/file.md#slug".
  // Split it off so the manifest lookup and fetch use the bare path; the anchor
  // is used after render to scroll to the target heading.
  let targetAnchor = '';
  const anchorPos = path.indexOf('#');
  if (anchorPos !== -1) {
    targetAnchor = path.slice(anchorPos + 1);
    path = path.slice(0, anchorPos);
  }

  window.__current_md_path = path;

  const SITE = window.SITE || {};
  const SERIES = window.SERIES || [];
  const info = window.PATH_TO_INFO[path];

  const body = document.getElementById('reader-body');
  const foot = document.getElementById('chapter-foot');
  const chList = document.getElementById('ch-list');
  const sidebarTitle = document.getElementById('sidebar-title');
  const railSeries = document.getElementById('rail-vol');
  const railSource = document.getElementById('rail-source');
  const railEdition = document.getElementById('rail-edition');
  const progress = document.getElementById('progress');
  const topnavVols = document.getElementById('topnav-vols');

  // ---- Crest / env label / license, all data-driven (no baked chrome) ----
  const crestWork = document.getElementById('crest-work');
  const crestSub = document.getElementById('crest-sub');
  if (crestWork) crestWork.textContent = SITE.title || 'Fellowship of the Heart';
  if (crestSub) crestSub.textContent = [SITE.subtitle, SITE.envLabel].filter(Boolean).join(' · ');
  const licenseLink = document.getElementById('license-link');
  if (licenseLink && SITE.license) { licenseLink.textContent = SITE.license.label; licenseLink.href = SITE.license.url; }

  // ---- Top nav from SERIES ----
  if (topnavVols) {
    topnavVols.innerHTML = SERIES.map(s => {
      const target = s.kind === 'page' ? s.path : (s.index || (s.chapters[0] && s.chapters[0].path));
      const cur = (info && info.seriesId === s.id) ? ' class="current"' : '';
      return `<a href="reader.html#${encodeURIComponent(target)}"${cur}><span class="v-num">·</span>${escapeHTML(s.name)}</a>`;
    }).join('');
  }

  if (!info) {
    body.innerHTML = '<div class="reader-error">Page not in manifest: <code>' + escapeHTML(path) + '</code></div>';
    return;
  }

  document.title = info.title + ' — ' + (SITE.title || 'FotH');

  // ---- Sidebar: current series' chapters, or the standalone pages list ----
  const series = SERIES.find(s => s.id === info.seriesId);
  sidebarTitle.textContent = info.seriesName;
  let listHTML = '';
  if (series && series.kind === 'series' && series.chapters.length) {
    series.chapters.forEach(ch => {
      const cur = ch.path === path ? ' class="current"' : '';
      listHTML += `<li><a href="reader.html#${encodeURIComponent(ch.path)}"${cur}>${escapeHTML(ch.title)}</a></li>`;
    });
  } else {
    // standalone page: show all top-level nav entries
    SERIES.forEach(s => {
      const target = s.kind === 'page' ? s.path : s.index;
      const cur = s.id === info.seriesId ? ' class="current"' : '';
      listHTML += `<li><a href="reader.html#${encodeURIComponent(target)}"${cur}>${escapeHTML(s.name)}</a></li>`;
    });
  }
  chList.innerHTML = listHTML;

  if (railSeries) railSeries.textContent = info.seriesName;
  if (railSource) railSource.textContent = path;
  if (railEdition) railEdition.textContent = info.edition || (series && series.edition) || '—';

  // ---- Fetch + render (relative path; works on Pages from root) ----
  fetch(path)
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
    .then(text => {
      const meta = `<div class="chapter-meta"><span>${escapeHTML(info.seriesName)}</span>` +
        (info.edition || (series && series.edition) ? `<span>·</span><span>edition ${escapeHTML(info.edition || series.edition)}</span>` : '') +
        (series && series.kind === 'series' ? `<span>·</span><a href="reader.html#${encodeURIComponent(series.index)}">Series contents</a>` : '') +
        `</div>`;
      body.innerHTML = meta + window.renderMarkdown(text);

      // ---- Assign ids to headings so in-content anchor links can target them ----
      body.querySelectorAll('h1, h2, h3, h4').forEach((h, i) => {
        if (!h.id) {
          const slug = (h.textContent || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          h.id = 'h-' + (slug || ('section-' + i));
        }
      });

      // ---- Make every table horizontally scrollable (the make-or-break) ----
      body.querySelectorAll('table').forEach(t => {
        if (t.parentElement && t.parentElement.classList.contains('table-scroll')) return;
        const wrap = document.createElement('div');
        wrap.className = 'table-scroll';
        wrap.setAttribute('tabindex', '0');
        wrap.setAttribute('role', 'region');
        wrap.setAttribute('aria-label', 'Scrollable table');
        t.parentNode.insertBefore(wrap, t);
        wrap.appendChild(t);
      });

      // ---- Long-chapter reading-time banner (lesson plans are long) ----
      const sections = body.querySelectorAll('h1, h2');
      if (sections.length >= 4 || text.length > 12000) {
        body.classList.add('long-chapter');
        const words = text.replace(/[\s\W_]+/g, ' ').trim().split(/\s+/).length;
        const mins = Math.max(1, Math.round(words / 220));
        const firstH = body.querySelector('h1');
        const banner = document.createElement('div');
        banner.className = 'chapter-banner';
        banner.innerHTML =
          `<div class="cb-item"><div class="cb-lbl">Sections</div><div class="cb-val accent">${sections.length}</div></div>` +
          `<div class="cb-item"><div class="cb-lbl">Words</div><div class="cb-val">${words.toLocaleString()}</div></div>` +
          `<div class="cb-item"><div class="cb-lbl">Reading time</div><div class="cb-val">~${mins} min</div></div>`;
        if (firstH) firstH.after(banner); else body.prepend(banner);
      }

      // ---- prev / next ----
      const prevHTML = info.prev
        ? `<a href="reader.html#${encodeURIComponent(info.prev)}"><span class="ar-lbl">← Previous</span><span class="ar-name">${escapeHTML(window.PATH_TO_INFO[info.prev].title)}</span></a>`
        : (series && series.kind === 'series' ? `<a href="reader.html#${encodeURIComponent(series.index)}"><span class="ar-lbl">← Series</span><span class="ar-name">${escapeHTML(info.seriesName)}</span></a>` : '<div></div>');
      const nextHTML = info.next
        ? `<a class="next" href="reader.html#${encodeURIComponent(info.next)}"><span class="ar-lbl">Next →</span><span class="ar-name">${escapeHTML(window.PATH_TO_INFO[info.next].title)}</span></a>`
        : '<div></div>';
      foot.innerHTML = prevHTML + nextHTML;

      // Scroll to the target heading if a cross-chapter anchor was supplied,
      // otherwise to the top. Heading ids are "h-"+slug; anchors carry the slug.
      let scrolledToAnchor = false;
      if (targetAnchor) {
        const el = document.getElementById('h-' + targetAnchor) || document.getElementById(targetAnchor);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 70;
          window.scrollTo({ top: top < 0 ? 0 : top, behavior: 'instant' });
          scrolledToAnchor = true;
        }
      }
      if (!scrolledToAnchor) window.scrollTo(0, 0);
    })
    .catch(err => {
      body.innerHTML = '<div class="reader-error">Failed to load <code>' + escapeHTML(path) + '</code><br/><br/>Error: ' +
        escapeHTML(err.message) + '<br/><br/><em>The reader fetches markdown over HTTP — serve the folder (or open the GitHub Pages URL), not file://.</em></div>';
    });

  // ---- Reading progress ----
  function onScroll() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const pct = h > 0 ? window.scrollY / h : 0;
    if (progress) progress.style.width = (pct * 100) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  window.addEventListener('hashchange', () => window.location.reload());

  // In-page anchor links ([text](#slug)) scroll to the matching heading without
  // changing the hash (which holds the chapter path) or triggering the reload.
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a.anchor-link[href^="#"]');
    if (!a) return;
    const slug = a.getAttribute('href').slice(1);
    const el = document.getElementById('h-' + slug) || document.getElementById(slug);
    if (el) {
      e.preventDefault();
      const top = el.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: top < 0 ? 0 : top, behavior: 'instant' });
    }
  });

  // ---- Theme toggle button ----
  const tt = document.getElementById('theme-toggle');
  if (tt) tt.addEventListener('click', () => window.__toggleTheme());

  // ============================================
  // Search (loads search-index.json on first open)
  // ============================================
  const overlay = document.getElementById('search-overlay');
  const sInput = document.getElementById('search-input');
  const sResults = document.getElementById('search-results');
  const sToggle = document.getElementById('search-toggle');
  let index = null, loading = false;

  function openSearch() {
    if (!overlay) return;
    overlay.classList.add('open');
    sInput.value = '';
    sResults.innerHTML = '<div class="search-empty">Type to search the curriculum…</div>';
    sInput.focus();
    if (!index && !loading) {
      loading = true;
      fetch('search-index.json').then(r => r.json()).then(j => { index = j; loading = false; if (sInput.value) runSearch(sInput.value); })
        .catch(() => { loading = false; sResults.innerHTML = '<div class="search-empty">Search index not found. Run <code>node tools/build-search-index.mjs</code>.</div>'; });
    }
  }
  function closeSearch() { if (overlay) overlay.classList.remove('open'); }

  function runSearch(q) {
    if (!index) return;
    q = q.trim().toLowerCase();
    if (!q) { sResults.innerHTML = '<div class="search-empty">Type to search the curriculum…</div>'; return; }
    const terms = q.split(/\s+/);
    const scored = [];
    index.forEach(doc => {
      const hay = (doc.title + ' ' + doc.text).toLowerCase();
      let score = 0;
      terms.forEach(t => { if (doc.title.toLowerCase().includes(t)) score += 5; const n = hay.split(t).length - 1; score += Math.min(n, 8); });
      if (score > 0) scored.push({ doc, score });
    });
    scored.sort((a, b) => b.score - a.score);
    if (!scored.length) { sResults.innerHTML = '<div class="search-empty">No matches for “' + escapeHTML(q) + '”.</div>'; return; }
    sResults.innerHTML = scored.slice(0, 20).map(({ doc }) => {
      const lc = doc.text.toLowerCase();
      let pos = lc.indexOf(terms[0]); if (pos < 0) pos = 0;
      let snip = doc.text.slice(Math.max(0, pos - 60), pos + 120).trim();
      terms.forEach(t => { snip = snip.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); });
      return `<a href="reader.html#${encodeURIComponent(doc.path)}"><div class="sr-series">${escapeHTML(doc.series || '')}</div>` +
        `<div class="sr-title">${escapeHTML(doc.title)}</div><div class="sr-snip">…${snip}…</div></a>`;
    }).join('');
  }

  if (sToggle) sToggle.addEventListener('click', openSearch);
  if (sInput) sInput.addEventListener('input', () => runSearch(sInput.value));
  if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSearch(); });
  document.addEventListener('keydown', (e) => {
    if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && overlay && !overlay.classList.contains('open')) {
      e.preventDefault(); openSearch();
    } else if (e.key === 'Escape') { closeSearch(); }
  });

  // ── PDF popup modal ────────────────────────────────────────────────
  // Links rendered with class `pdf-popup` open the PDF in an overlay
  // iframe (the browser's native viewer). Close via ×, backdrop, or Esc.
  // Click handling is delegated, so it survives chapter re-renders.
  function pdfEnsureModal() {
    if (document.getElementById('pdf-popup-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'pdf-popup-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML =
      '<div class="pdf-popup-backdrop" title="Click to close"></div>' +
      '<div class="pdf-popup-window" role="dialog" aria-modal="true" aria-label="PDF document">' +
        '<div class="pdf-popup-bar">' +
          '<span class="pdf-popup-title"></span>' +
          '<span class="pdf-popup-hint">Click outside or press Esc to close</span>' +
          '<a class="pdf-popup-open" href="#" target="_blank" rel="noopener">Open in new tab ↗</a>' +
          '<button class="pdf-popup-close" aria-label="Close" type="button">×</button>' +
        '</div>' +
        '<iframe class="pdf-popup-frame" src="" title="PDF document"></iframe>' +
      '</div>';
    document.body.appendChild(modal);
    modal.querySelector('.pdf-popup-close').addEventListener('click', pdfCloseModal);
    modal.querySelector('.pdf-popup-backdrop').addEventListener('click', pdfCloseModal);
  }
  function pdfOpenModal(href, label) {
    pdfEnsureModal();
    const modal = document.getElementById('pdf-popup-modal');
    // Open at 100% zoom — browsers default to a too-small "fit width".
    const sep = href.includes('#') ? '&' : '#';
    modal.querySelector('.pdf-popup-frame').src = href + sep + 'zoom=100';
    modal.querySelector('.pdf-popup-open').href = href;
    modal.querySelector('.pdf-popup-title').textContent = label || '';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function pdfCloseModal() {
    const modal = document.getElementById('pdf-popup-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modal.querySelector('.pdf-popup-frame').src = '';
    document.body.style.overflow = '';
  }
  document.addEventListener('click', (e) => {
    const link = e.target.closest && e.target.closest('a.pdf-popup');
    if (!link) return;
    e.preventDefault();
    pdfOpenModal(link.href, link.getAttribute('data-pdf-label') || '');
  });
  document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('pdf-popup-modal');
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) pdfCloseModal();
  });
})();
