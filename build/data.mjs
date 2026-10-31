import fs from 'node:fs';
import path from 'node:path';
import { ROOT, fold, stripTags } from './lib.mjs';

const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8'));

// No long dashes anywhere on the site: ranges become "65-67", separators " - ".
export const undash = (s) => typeof s !== 'string' ? s : s
  .replace(/(\d)\s*[\u2013\u2014]\s*(\d)/g, '$1-$2')
  .replace(/\s+[\u2013\u2014]\s+/g, ' - ')
  .replace(/[\u2013\u2014]/g, '-');
const BRAND = { 'Surgical Science – Simbionix': 'Surgical Science Simbionix' };

export const products = read('products.json').map((p) => ({
  ...p,
  title: undash(p.title), name: undash(p.name), model: undash(p.model), description: undash(p.description), summary: undash(p.summary),
  manufacturer: undash(BRAND[p.manufacturer] || p.manufacturer), extra: p.extra.map(undash),
  docs: p.docs.map((d) => ({ ...d, label: undash(d.label) })),
  imageAlt: undash(p.imageAlt), logos: p.logos.map((l) => ({ ...l, alt: undash(l.alt) })),
}));
export const categories = read('categories.json').map((c) => ({ ...c, name: undash(c.name), description: undash(c.description) }));
export const tags = read('tags.json').map((t) => ({ ...t, name: undash(t.name) }));
export const posts = read('posts.json').map((p) => ({ ...p, title: undash(p.title), body: undash(p.body), excerpt: undash(p.excerpt) }))
  .sort((a, b) => b.date.localeCompare(a.date));
export const pages = Object.fromEntries(Object.entries(read('pages.json')).map(([k, v]) => [k, { ...v, title: undash(v.title), body: undash(v.body) }]));
export const siteAssets = read('site-assets.json');

// Four products were never assigned a category in the old CMS (reachable only
// through the flat archive). Place them beside their sibling products.
const CATEGORY_FIX = {
  'sistem-holter-ecg-holcard-24w-alfa-system-a712-v-301': [27],
  'sistem-holter-ecg-holcard-24w-alfa-system-a703-v-301': [27],
  'silent-1c-umed-pompa-aspiratie-uscata-cu-canistra-producator-mgf-compressors': [34],
  'microscop-inversat-de-cercetare-ix83-olympus': [61, 99],
};

const collator = new Intl.Collator('ro', { sensitivity: 'base', numeric: true });
export const byName = (a, b) => collator.compare(a.name, b.name);

// ---------------------------------------------------------------- categories
export const catById = new Map(categories.map((c) => [c.id, c]));
export const catBySlug = new Map(categories.map((c) => [c.slug, c]));
for (const c of categories) {
  c.url = `/categorie-produs/${c.path}/`;
  c.children = [];
}
for (const c of categories) if (c.parent) catById.get(c.parent).children.push(c);
for (const c of categories) c.children.sort(byName);
export const topCategories = categories.filter((c) => !c.parent).sort((a, b) => a.menuOrder - b.menuOrder || byName(a, b));

export function ancestors(c) {
  const chain = [c];
  while (chain[0].parent) chain.unshift(catById.get(chain[0].parent));
  return chain;
}
export function descendants(c) {
  const out = [c];
  for (const ch of c.children) out.push(...descendants(ch));
  return out;
}

// ---------------------------------------------------------------- products
export const productBySlug = new Map();
for (const p of products) {
  if (!p.categories.length && CATEGORY_FIX[p.slug]) {
    p.categories = CATEGORY_FIX[p.slug];
    p.primaryCategory = CATEGORY_FIX[p.slug].at(-1);
  }
  p.url = `/produse/${p.slug}/`;
  p.primary = p.primaryCategory ? catById.get(p.primaryCategory) : null;
  p.chain = p.primary ? ancestors(p.primary) : [];
  p.domain = p.chain[0] || null;
  p.cover = p.images[0] || null;
  productBySlug.set(p.slug, p);
}
products.sort(byName);

for (const c of categories) {
  const ids = new Set(descendants(c).map((x) => x.id));
  c.products = products.filter((p) => p.categories.some((id) => ids.has(id)));
  c.count = c.products.length;
  if (!c.image) c.image = c.products.find((p) => p.cover)?.cover || null;
  c.domain = ancestors(c)[0];
}

// ---------------------------------------------------------------- tags
export const tagById = new Map(tags.map((t) => [t.id, t]));
for (const t of tags) {
  t.url = `/tag/${t.slug}/`;
  t.products = products.filter((p) => p.tags.includes(t.id));
}

// ---------------------------------------------------------------- posts
for (const p of posts) p.url = `/${p.slug}/`;

// ---------------------------------------------------------------- manufacturers
export const manufacturers = [...new Set(products.map((p) => p.manufacturer).filter(Boolean))]
  .sort((a, b) => collator.compare(a, b));
export const manufacturerCounts = Object.fromEntries(manufacturers.map((m) => [m, products.filter((p) => p.manufacturer === m).length]));

// ---------------------------------------------------------------- search index
export function searchIndex() {
  const items = [];
  for (const p of products) {
    items.push({
      t: 'p', n: p.name, u: p.url, i: p.cover, m: p.model || '', b: p.manufacturer || '',
      c: p.chain.map((c) => c.name).join(' › '),
      k: fold([p.title, p.model, p.manufacturer, p.chain.map((c) => c.name).join(' '), p.tags.map((id) => tagById.get(id)?.name).join(' ')].join(' ')),
    });
  }
  for (const c of categories) {
    items.push({ t: 'c', n: c.name, u: c.url, i: c.image, c: ancestors(c).slice(0, -1).map((x) => x.name).join(' › '), q: c.count, k: fold(c.name) });
  }
  for (const p of posts) {
    items.push({ t: 'a', n: p.title, u: p.url, i: p.featured, d: p.date.slice(0, 10), k: fold(p.title + ' ' + stripTags(p.body)) });
  }
  for (const [n, u, k] of [
    ['Despre noi', '/despre-noi/', 'despre noi istoric companie iso certificari brosura'],
    ['Contact', '/contact/', 'contact adresa telefon email sediu cluj bucuresti iasi constanta alexandria'],
    ['Instruire / Evenimente', '/instruire-evenimente/', 'instruire evenimente cursuri congrese workshop'],
    ['Produse', '/produsele-noastre/', 'toate produsele catalog'],
    ['Politică de confidențialitate', '/politica-de-confidentialitate/', 'politica confidentialitate gdpr date personale'],
    ['Politica cookies', '/politica-cookies/', 'politica cookies cookie-uri'],
  ]) items.push({ t: 'g', n, u, k: fold(n + ' ' + k) });
  return items;
}
