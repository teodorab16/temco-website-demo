import fs from 'node:fs';
import path from 'node:path';

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
export const OUT = path.join(ROOT, 'site');
const readJSON = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8'));
export const MEDIA = readJSON('media.json');
export const DOC_SIZES = readJSON('docs.json');

// ---------------------------------------------------------------- escaping
export const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const attr = esc;

// ---------------------------------------------------------------- relative URLs
// Every page is rendered with knowledge of its own path so all links are
// relative: the site works from a domain root, a sub-folder (GitHub Pages) or a CDN.
let CURRENT = '/';
export function setPage(p) { CURRENT = p; }
// The 404 page is served at arbitrary URLs, so it links from the deploy base
// (override with SITE_BASE=/temco-website-demo/ for a GitHub Pages project site).
export const SITE_BASE = process.env.SITE_BASE || '/';
export function rootPrefix() {
  if (CURRENT === '/404.html') return SITE_BASE;
  const depth = CURRENT.split('/').filter(Boolean).length;
  return depth ? '../'.repeat(depth) : '';
}
export function u(target) {
  if (!target) return '';
  if (/^(https?:|mailto:|tel:|#|data:)/.test(target)) return target;
  const clean = target.replace(/^\//, '');
  const r = rootPrefix() + clean;
  return r || './';
}

// ---------------------------------------------------------------- docs
const DOCS_BASE = 'https://www.temco.ro/wp-content/uploads/';
// Brochures remain on the existing uploads folder (≈550 MB of PDFs). To self-host them
// later, mirror wp-content/uploads/*.pdf and change DOCS_BASE here only.
export function docUrl(url) { return url.replace('https://www.temco.ro/wp-content/uploads/', DOCS_BASE); }
export function fileSize(url) {
  const b = DOC_SIZES[url];
  if (!b) return '';
  const mb = b / 1048576;
  return mb >= 1 ? `${mb.toLocaleString('ro-RO', { maximumFractionDigits: 1 })} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;
}
export function docLabel(d) {
  if (d.label) return d.label.replace(/\s+/g, ' ').trim(); // keep model numbers like "50-25" intact
  const name = decodeURIComponent(d.url.split('/').pop()).replace(/\.pdf$/i, '');
  return name.replace(/_+/g, ' ').replace(/\s+/g, ' ').trim();
}

// ---------------------------------------------------------------- images
export function mediaInfo(url) { return url ? MEDIA[url] : null; }
export function srcOf(url, want = 960) {
  const m = MEDIA[url];
  if (!m) return url;
  const v = m.variants.find((x) => x.w >= want) || m.variants[m.variants.length - 1];
  return u('/' + v.src);
}
/**
 * Responsive <img>. `sizes` describes rendered width; placeholder colour comes
 * from the dominant colour computed at asset build time (blur-up feel, no CLS).
 */
export function img(url, { alt = '', sizes = '100vw', cls = '', eager = false, fit = '', priority = false, vt = '' } = {}) {
  const m = MEDIA[url];
  if (!m) {
    if (!url) return '';
    return `<img src="${attr(url)}" alt="${attr(alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async" class="${cls}">`;
  }
  const srcset = m.variants.map((v) => `${u('/' + v.src)} ${v.w}w`).join(', ');
  const def = m.variants.find((v) => v.w >= 960) || m.variants[m.variants.length - 1];
  const style = [`--ph:${m.color}`, vt ? `view-transition-name:${vt}` : ''].filter(Boolean).join(';');
  return `<img src="${u('/' + def.src)}" srcset="${srcset}" sizes="${sizes}" width="${m.w}" height="${m.h}" alt="${attr(alt)}"${eager ? '' : ' loading="lazy"'} decoding="async"${priority ? ' fetchpriority="high"' : ''} class="${cls}${m.alpha ? ' is-alpha' : ''}${fit ? ' ' + fit : ''}" style="${style}">`;
}

// ---------------------------------------------------------------- text
const MONTHS = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
export function roDate(iso) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
export function fold(s = '') {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[șş]/gi, 's').replace(/[țţ]/gi, 't').toLowerCase();
}
export function stripTags(h = '') { return h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }
export function truncate(s = '', n = 160) {
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,.;:\--\s]+$/, '') + '…';
}
// Romanian numerals: 1 produs · 2-19 produse · 20+ de produse (101-119 → no "de")
export function plural(n, one, many) {
  const de = n % 100 >= 20 || (n > 0 && n % 100 === 0);
  return `${n.toLocaleString('ro-RO')} ${n === 1 ? one : (de ? 'de ' + many : many)}`;
}
export function readingTime(html) {
  const words = stripTags(html).split(' ').length;
  return Math.max(1, Math.round(words / 200));
}

// ---------------------------------------------------------------- output
export function write(p, html) {
  const file = path.join(OUT, p.replace(/^\//, ''), p.endsWith('/') || p === '/' ? 'index.html' : '');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}
