import { esc, attr, u, img, fold, roDate, fileSize, docLabel, docUrl, mediaInfo } from './lib.mjs';
import { icon } from './icons.mjs';
import { SITE } from './content.mjs';

// ---------------------------------------------------------------- headings
export function sectionHead(title, link = '') {
  return `<div class="section-head" data-reveal><h2 class="h2">${title}</h2>${link}</div>`;
}
export const more = (href, label) => `<a class="text-link" href="${u(href)}">${label} ${icon('arrowRight', { size: 18 })}</a>`;

export function pageHead({ title, sub = '', back = null, media = '', mediaProduct = false, extra = '' }) {
  const text = `
    ${back ? `<a class="back-link" href="${u(back.url)}">${icon('arrowLeft', { size: 16 })}${esc(back.name)}</a>` : ''}
    <h1 class="h1 fade-up">${title}</h1>
    ${sub ? `<p class="sub fade-up" style="--d:.1s">${sub}</p>` : ''}
    ${extra}`;
  return `
  <section class="page-head">
    <div class="container">
      ${media ? `<div class="page-head-grid"><div>${text}</div><div class="head-media fade-up${mediaProduct ? ' is-product' : ''}" style="--d:.15s">${media}</div></div>` : text}
    </div>
  </section>`;
}

// Breadcrumbs are kept for search engines (JSON-LD) only; pages show a single back link.
export function breadcrumbLd(items) {
  const all = [{ name: 'Acasă', url: '/' }, ...items];
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: all.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: SITE.url + c.url })),
  };
}

// ---------------------------------------------------------------- cards
export function tile(c, i = 0) {
  return `
  <li data-reveal style="--rd:${(i % 4) * 60}">
    <a class="tile" href="${u(c.url)}">
      <div class="media">${c.image ? img(c.image, { alt: '', sizes: '(max-width:720px) 50vw, (max-width:1080px) 33vw, 300px' }) : ''}</div>
      <h3>${esc(c.name)}${icon('arrowRight', { size: 18 })}</h3>
    </a>
  </li>`;
}

export function productCard(p, { filterable = false } = {}) {
  const data = filterable ? ` data-name="${attr(fold(p.name + ' ' + (p.model || '') + ' ' + (p.manufacturer || '')))}" data-cats="${p.categories.join(' ')}" data-brand="${attr(p.manufacturer || '')}" data-date="${p.date.slice(0, 10)}" data-sort="${attr(fold(p.name))}"` : '';
  return `
  <li class="p-item"${data}>
    <article class="p-card">
      <div class="media">${p.cover ? img(p.cover, { alt: p.imageAlt || p.name, sizes: '(max-width:720px) 50vw, (max-width:1080px) 33vw, 290px' }) : ''}</div>
      <h3><a href="${u(p.url)}">${esc(p.name)}</a></h3>
      ${p.manufacturer ? `<p>${esc(p.manufacturer)}</p>` : ''}
    </article>
  </li>`;
}

export function eventCard(post, i = 0) {
  const m = mediaInfo(post.featured);
  const poster = m && m.h > m.w * 1.05;
  return `
  <li data-reveal style="--rd:${(i % 3) * 70}" data-year="${new Date(post.date).getFullYear()}">
    <a class="e-card" href="${u(post.url)}">
      <div class="media${poster ? ' is-poster' : ''}">
        ${poster ? `<span class="poster-bg" style="background-image:url('${u('/' + m.variants[0].src)}')"></span>` : ''}
        ${post.featured ? img(post.featured, { alt: '', sizes: '(max-width:720px) 100vw, 400px' }) : ''}
      </div>
      <time datetime="${post.date}">${roDate(post.date)}</time>
      <h3>${esc(post.title)}</h3>
    </a>
  </li>`;
}

// ---------------------------------------------------------------- documents
export function docList(docs, product = null) {
  const unnamed = docs.filter((d) => !d.label).length;
  let k = 0;
  return `<ul class="docs">${docs.map((d) => {
    const size = fileSize(d.url);
    const file = decodeURIComponent(d.url.split('/').pop());
    const label = d.label ? docLabel(d) : product
      ? `Broșură ${product.model || product.name}${unnamed > 1 ? ` (${++k})` : ''}`
      : docLabel(d);
    return `
    <li><a class="doc" href="${attr(docUrl(d.url))}" target="_blank" rel="noopener" title="${attr(file)}">
      <span class="txt"><strong>${esc(label)}</strong><span>PDF${size ? ' · ' + size : ''}</span></span>
      ${icon('download', { size: 18 })}
    </a></li>`;
  }).join('')}</ul>`;
}

// ---------------------------------------------------------------- inquiry form
export function contactForm({ product = null, id = 'formular' } = {}) {
  return `
    <form class="form-grid" id="${id}" data-form novalidate action="${attr(SITE.formEndpoint || 'mailto:' + SITE.email)}" method="post">
      <div class="field full"><input id="${id}-name" name="nume" type="text" placeholder=" " autocomplete="name" required maxlength="400"><label for="${id}-name">Numele și prenumele <span class="req">*</span></label><span class="err" aria-live="polite"></span></div>
      <div class="field"><input id="${id}-email" name="email" type="email" placeholder=" " autocomplete="email" required maxlength="400"><label for="${id}-email">Email <span class="req">*</span></label><span class="err" aria-live="polite"></span></div>
      <div class="field"><input id="${id}-tel" name="telefon" type="tel" placeholder=" " autocomplete="tel" required maxlength="400"><label for="${id}-tel">Telefon <span class="req">*</span></label><span class="err" aria-live="polite"></span></div>
      <div class="field full"><input id="${id}-city" name="oras" type="text" placeholder=" " autocomplete="address-level2" required maxlength="400"><label for="${id}-city">Oraș <span class="req">*</span></label><span class="err" aria-live="polite"></span></div>
      <div class="field full"><textarea id="${id}-msg" name="mesaj" placeholder=" " required maxlength="2000" rows="5"></textarea><label for="${id}-msg">Mesajul dumneavoastră <span class="req">*</span></label><span class="err" aria-live="polite"></span></div>
      <div class="hp" aria-hidden="true"><label>Nu completați <input name="website" tabindex="-1" autocomplete="off"></label></div>
      ${product ? `<input type="hidden" name="produs" value="${attr(product.name)}"><input type="hidden" name="url_produs" value="${attr(SITE.url + product.url)}">` : ''}
      <label class="consent full"><input type="checkbox" name="acord" required><span>Sunt de acord cu <a href="${u('/politica-de-confidentialitate/')}">Politica de confidențialitate</a>.</span></label>
      <div class="form-foot full"><button class="btn btn-primary" type="submit">Trimite ${icon('arrowRight', { size: 18, cls: 'i-arrow' })}</button></div>
    </form>`;
}

// ---------------------------------------------------------------- catalog (filterable grid)
export function catalog({ items, chips = [], pageSize = 24 }) {
  const brands = [...new Set(items.map((p) => p.manufacturer).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ro'));
  const bCount = (b) => items.filter((p) => p.manufacturer === b).length;
  return `
  <div class="catalog" data-catalog data-page-size="${pageSize}">
    <div class="toolbar">
      <label class="field-search">${icon('search', { size: 18 })}<span class="sr-only">Caută în listă</span>
        <input type="search" placeholder="Caută" data-q autocomplete="off">
        <button class="clear" type="button" data-q-clear hidden aria-label="Șterge">${icon('close', { size: 16 })}</button>
      </label>
      ${brands.length > 1 ? `<div class="pop" data-pop>
        <button type="button" aria-expanded="false" aria-controls="brands-panel">Producător <span class="n" data-brand-count></span>${icon('chevronDown')}</button>
        <div class="pop-panel" id="brands-panel" hidden>${brands.map((b) => `<label class="check"><input type="checkbox" name="brand" value="${attr(b)}"><span>${esc(b)}</span><span class="n">${bCount(b)}</span></label>`).join('')}</div>
      </div>` : ''}
      <div class="select"><label class="sr-only" for="sort">Sortare</label>
        <select id="sort" data-sort><option value="az">A-Z</option><option value="za">Z-A</option><option value="new">Cele mai noi</option></select>${icon('chevronDown')}</div>
      <p class="result-count" aria-live="polite"><span data-count>${items.length}</span> <span data-count-label>produse</span></p>
    </div>
    ${chips.length > 1 ? `<div class="chip-row is-scroll" role="group" aria-label="Filtrează">
      <button class="chip" type="button" aria-pressed="true" data-chip="">Toate</button>
      ${chips.map((c) => `<button class="chip" type="button" aria-pressed="false" data-chip="${descIds(c)}" data-chip-slug="${c.slug}">${esc(c.name)}</button>`).join('')}
    </div>` : '<div style="height:22px"></div>'}
    <h2 class="sr-only">Produse</h2>
    <ul class="grid" data-grid>${items.map((p) => productCard(p, { filterable: true })).join('')}</ul>
    <div class="empty-state" data-empty hidden>
      <h2>Niciun rezultat</h2>
      <button class="btn btn-line btn-sm" type="button" data-reset>Resetează filtrele</button>
    </div>
    <div class="load-more-wrap" data-more-wrap hidden>
      <p data-shown></p>
      <button class="btn btn-line" type="button" data-load-more>Mai multe</button>
    </div>
  </div>`;
}
function descIds(c) {
  const out = [c.id];
  const walk = (n) => n.children.forEach((k) => { out.push(k.id); walk(k); });
  walk(c);
  return out.join(' ');
}
