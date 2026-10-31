#!/usr/bin/env node
// Static site generator for temco.ro · `npm run build` → ./site
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, OUT, setPage, write, fold } from './lib.mjs';
import { SITE } from './content.mjs';
import * as P from './pages.mjs';
import { products, categories, tags, posts, searchIndex } from './data.mjs';

const t0 = Date.now();
const KEEP = new Set(['media']);

// ---------------------------------------------------------------- clean
for (const entry of fs.readdirSync(OUT, { withFileTypes: true })) {
  if (KEEP.has(entry.name)) continue;
  if (entry.name === 'assets') {
    for (const a of fs.readdirSync(path.join(OUT, 'assets'))) if (a !== 'fonts') fs.rmSync(path.join(OUT, 'assets', a), { recursive: true, force: true });
    continue;
  }
  fs.rmSync(path.join(OUT, entry.name), { recursive: true, force: true });
}

// ---------------------------------------------------------------- static assets
const copy = (from, to) => { fs.mkdirSync(path.dirname(path.join(OUT, to)), { recursive: true }); fs.copyFileSync(path.join(ROOT, from), path.join(OUT, to)); };
const minCss = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '\n').replace(/\n+/g, '\n').trim();
fs.mkdirSync(path.join(OUT, 'assets/css'), { recursive: true });
fs.writeFileSync(path.join(OUT, 'assets/css/main.css'), minCss(fs.readFileSync(path.join(ROOT, 'src/css/main.css'), 'utf8')));
fs.mkdirSync(path.join(OUT, 'assets/js'), { recursive: true });
for (const f of fs.readdirSync(path.join(ROOT, 'src/js'))) copy(`src/js/${f}`, `assets/js/${f}`);
for (const f of fs.readdirSync(path.join(ROOT, 'src/brand'))) copy(`src/brand/${f}`, `assets/brand/${f}`);
copy('src/brand/og-default.jpg', 'assets/og-default.jpg');

// ---------------------------------------------------------------- pages
const urls = [];
function emit(p, render, { sitemap = true, priority = 0.5 } = {}) {
  setPage(p);
  write(p, render());
  if (sitemap) urls.push({ p, priority });
}

emit('/', P.home, { priority: 1 });
emit('/despre-noi/', P.about, { priority: 0.8 });
emit('/produsele-noastre/', P.productsHub, { priority: 0.9 });
emit('/produse/', P.allProducts, { priority: 0.8 });
emit('/instruire-evenimente/', () => P.eventsPage(), { priority: 0.7 });
emit('/contact/', P.contactPage, { priority: 0.8 });
emit('/politica-de-confidentialitate/', () => P.legalPage('politica-de-confidentialitate'), { priority: 0.2 });
emit('/politica-cookies/', () => P.legalPage('politica-cookies'), { priority: 0.2 });
emit('/cautare/', P.searchPage, { sitemap: false });

for (const c of categories) emit(c.url, () => P.categoryPage(c), { priority: c.parent ? 0.6 : 0.8 });

for (const p of products) {
  const pool = p.primary ? p.primary.products : [];
  const domainPool = p.domain ? p.domain.products : [];
  const related = [...new Set([...pool, ...domainPool])].filter((x) => x !== p).slice(0, 4);
  emit(p.url, () => P.productPage(p, related), { priority: 0.6 });
}
for (const t of tags) emit(t.url, () => P.tagPage(t), { sitemap: t.products.length > 1, priority: 0.3 });
posts.forEach((post, i) => emit(post.url, () => P.articlePage(post, posts[i + 1], posts[i - 1]), { priority: 0.5 }));

// 404 page: served at arbitrary depths, so it resolves links against the site base.
setPage('/404.html');
write('/404.html', P.notFound());

// Old WordPress URLs → new homes (keeps bookmarks & search-engine links alive)
const redirects = {
  '/lista-produse/': ['/produse/', 'Lista produse'],
  '/lista-produse-2/': ['/produse/', 'Lista produse'],
  '/category/articole/': ['/instruire-evenimente/', 'Articole'],
  '/author/madalina/': ['/instruire-evenimente/', 'Lupu Madalina'],
  '/test/': ['/contact/', 'Contact'],
  '/acasa/': ['/', 'Acasă'],
  '/pagina-exemplu/': ['/', 'Acasă'],
};
for (const [from, [to, title]] of Object.entries(redirects)) write(from, P.redirect(from, to, title));

// ---------------------------------------------------------------- search index (loaded on demand)
const idx = searchIndex().map((x) => ({ ...x, u: x.u.replace(/^\//, ''), i: x.i ? mediaThumb(x.i) : '' }));
function mediaThumb(url) {
  const m = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/media.json'), 'utf8'))[url];
  return m ? m.variants[0].src : '';
}
fs.writeFileSync(path.join(OUT, 'assets/js/search-index.js'), `window.__TEMCO_INDEX=${JSON.stringify(idx)};`);

// ---------------------------------------------------------------- sitemap, robots, manifest
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((x) => `  <url><loc>${SITE.url}${x.p}</loc><lastmod>${today}</lastmod><priority>${x.priority.toFixed(1)}</priority></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /cautare/\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, 'site.webmanifest'), JSON.stringify({
  name: 'TEMCO · Tehno Electro Medical Company', short_name: 'TEMCO', lang: 'ro', start_url: './', display: 'standalone',
  background_color: '#ffffff', theme_color: '#d42e12',
  icons: [{ src: 'assets/brand/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'assets/brand/icon-512.png', sizes: '512x512', type: 'image/png' }, { src: 'assets/brand/favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
}, null, 2));
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

const count = (dir) => fs.readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? count(path.join(dir, e.name)) : e.name.endsWith('.html') ? 1 : 0), 0);
console.log(`Built ${count(OUT)} HTML pages · ${products.length} products · ${categories.length} categories · ${tags.length} tags · ${posts.length} articles in ${Date.now() - t0} ms`);
