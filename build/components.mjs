import { esc, attr, u, img, fold, roDate, fileSize, docLabel, docUrl, truncate, plural, mediaInfo } from './lib.mjs';
import { icon, DOMAIN_ICON } from './icons.mjs';
import { SITE, CONTACT } from './content.mjs';
import { arcs } from './layout.mjs';
import { ancestors, manufacturers, byName } from './data.mjs';

// ---------------------------------------------------------------- headings
export function sectionHead({ eyebrow, title, text, center = false, split = '', light = false }) {
  return `
  <div class="section-head${center ? ' is-center' : ''}${split ? ' is-split' : ''}" data-reveal>
    <div style="display:grid;gap:14px;${center ? 'justify-items:center' : ''}">
      ${eyebrow ? `<span class="eyebrow${light ? ' is-light' : ''}">${eyebrow}</span>` : ''}
      <h2>${title}</h2>
      <span class="bar" aria-hidden="true"></span>
      ${text ? `<p>${text}</p>` : ''}
    </div>
    ${split}
  </div>`;
}

// ---------------------------------------------------------------- breadcrumbs (+ JSON-LD)
export function breadcrumbs(items, { light = false } = {}) {
  const all = [{ name: 'Acasă', url: '/' }, ...items];
  const html = `
  <nav class="crumbs${light ? ' crumbs-light' : ''}" aria-label="Breadcrumb">
    <ol>${all.map((c, i) => i === all.length - 1
      ? `<li><span aria-current="page">${esc(c.name)}</span></li>`
      : `<li><a href="${u(c.url)}">${i === 0 ? icon('building', { size: 15 }) : ''}${esc(c.name)}</a></li>`).join('')}</ol>
  </nav>`;
  const ld = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: all.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: SITE.url + c.url })),
  };
  return { html, ld };
}

export function pageHero({ eyebrow, title, lead = '', crumbs, media = '', extra = '', mediaWhite = false }) {
  return `
  <section class="page-hero">
    ${arcs()}
    <div class="container">
      ${crumbs}
      <div class="${media ? 'page-hero-grid' : ''}">
        <div>
          ${eyebrow ? `<span class="eyebrow is-light fade-up" style="--d:.05s;margin-top:28px">${eyebrow}</span>` : '<div style="height:10px"></div>'}
          <h1 data-split>${title}</h1>
          ${lead ? `<p class="lead fade-up" style="--d:.35s">${lead}</p>` : ''}
          ${extra}
        </div>
        ${media ? `<div class="page-hero-media fade-up${mediaWhite ? ' on-white' : ''}" style="--d:.25s">${media}</div>` : ''}
      </div>
    </div>
  </section>`;
}

// ---------------------------------------------------------------- cards
export function domainCard(c, i = 0) {
  return `
  <li data-reveal style="--rd:${(i % 4) * 70}">
    <a class="domain-card" href="${u(c.url)}">
      <div class="media">${c.image ? img(c.image, { alt: '', sizes: '(max-width:600px) 50vw, (max-width:1080px) 33vw, 300px' }) : ''}
        <span class="ico">${icon(DOMAIN_ICON[c.slug] || 'grid', { size: 22 })}</span>
      </div>
      <div class="body">
        <h3>${esc(c.name)}</h3>
        <div class="meta"><span>${c.count ? plural(c.count, 'produs', 'produse') : 'La cerere'}</span><span class="go">${icon('arrowRight')}</span></div>
      </div>
    </a>
  </li>`;
}

export function subcatCard(c) {
  const m = mediaInfo(c.image);
  return `
  <li>
    <a class="subcat-card" href="${u(c.url)}">
      <span class="thumb${m && (m.alpha || isProductShot(c.image)) ? ' is-contain' : ''}">${c.image ? img(c.image, { alt: '', sizes: '60px' }) : icon(DOMAIN_ICON[c.domain.slug] || 'grid')}</span>
      <span><strong>${esc(c.name)}</strong><span>${c.count ? plural(c.count, 'produs', 'produse') : 'Disponibil la cerere'}</span></span>
      ${icon('chevronRight', { cls: 'i-chev', size: 18 })}
    </a>
  </li>`;
}
const isProductShot = (url) => !/grid-product|banner|laborator-morga|bnr_|scan-r|abbelight|65cc6d7b/.test(url || '');

export function productCard(p, { sizes = '(max-width:600px) 50vw, (max-width:1080px) 33vw, 290px', i = 0, filterable = false } = {}) {
  const data = filterable ? ` data-name="${attr(fold(p.name + ' ' + (p.model || '') + ' ' + (p.manufacturer || '')))}" data-cats="${p.categories.join(' ')}" data-brand="${attr(p.manufacturer || '')}" data-date="${p.date.slice(0, 10)}" data-sort="${attr(fold(p.name))}"` : '';
  const badges = [
    p.docs.length ? `<span class="badge">${icon('file')}${p.docs.length > 1 ? p.docs.length + ' documente' : 'Broșură'}</span>` : '',
    p.shopUrl ? `<span class="badge is-blue">${icon('bag')}Online</span>` : '',
  ].join('');
  return `
  <li class="p-item"${data}>
    <article class="p-card">
      <div class="media on-white">
        ${p.cover ? img(p.cover, { alt: p.imageAlt || p.name, sizes, vt: '' }) : icon('image', { size: 40 })}
        ${badges ? `<div class="badges">${badges}</div>` : ''}
      </div>
      <span class="go" aria-hidden="true">${icon('arrowRight')}</span>
      <div class="body">
        ${p.primary ? `<span class="cat">${esc(p.primary.name)}</span>` : ''}
        <h3><a href="${u(p.url)}" data-vt-link>${esc(p.name)}</a></h3>
        <div class="meta">
          <span class="brand-name">${esc(p.manufacturer || 'TEMCO')}</span>
          ${p.model ? `<span class="model" title="Model ${attr(p.model)}">${esc(p.model)}</span>` : ''}
        </div>
      </div>
    </article>
  </li>`;
}

export function eventCard(post, { featured = false, i = 0 } = {}) {
  const d = new Date(post.date);
  const m = mediaInfo(post.featured);
  const poster = m && m.h > m.w * 1.05;
  const months = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  return `
  <li class="${featured ? 'is-featured-li' : ''}" data-reveal style="--rd:${(i % 3) * 80}${featured ? ';grid-column:1/-1' : ''}" data-year="${d.getFullYear()}">
    <article class="e-card${featured ? ' is-featured' : ''}">
      <div class="media${poster ? ' is-poster' : ''}">
        ${poster ? `<span class="poster-bg" style="background-image:url('${m ? u('/' + m.variants[0].src) : ''}')"></span>` : ''}
        ${post.featured ? img(post.featured, { alt: '', sizes: featured ? '(max-width:860px) 100vw, 640px' : '(max-width:600px) 100vw, 400px' }) : ''}
        <span class="date-tag"><b>${d.getDate()}</b><span>${months[d.getMonth()]} ${d.getFullYear()}</span></span>
      </div>
      <div class="body">
        <div class="meta"><span>${icon('calendar')}${roDate(post.date)}</span><span>${icon('user')}${esc(post.author)}</span></div>
        <h3><a href="${u(post.url)}">${esc(post.title)}</a></h3>
        <p>${esc(truncate(post.excerpt, featured ? 260 : 150))}</p>
        <span class="link-arrow">Citește mai mult ${icon('arrowRight', { size: 18 })}</span>
      </div>
    </article>
  </li>`;
}

// ---------------------------------------------------------------- documents
export function docList(docs, product = null) {
  const unnamed = docs.filter((d) => !d.label).length;
  let k = 0;
  return `<ul class="docs">${docs.map((d) => {
    const size = fileSize(d.url);
    const file = decodeURIComponent(d.url.split('/').pop());
    // Untitled uploads ("Descarca brosura") get a readable name instead of the raw file name.
    const label = d.label ? docLabel(d) : product
      ? `Broșură ${product.model || product.name}${unnamed > 1 ? ` (${++k})` : ''}`
      : docLabel(d);
    return `
    <li><a class="doc" href="${attr(docUrl(d.url))}" target="_blank" rel="noopener" title="${attr(file)}">
      <span class="ficon">PDF</span>
      <span class="txt"><strong>${esc(label)}</strong><span>Document PDF${size ? ' · ' + size : ''}</span></span>
      <span class="dl">${icon('download')}</span>
    </a></li>`;
  }).join('')}</ul>`;
}

// ---------------------------------------------------------------- share
export function share(path, title, image) {
  const url = encodeURIComponent(SITE.url + path);
  const t = encodeURIComponent(title);
  return `
  <div class="share">
    <span>Distribuie</span>
    <a href="https://www.facebook.com/sharer/sharer.php?u=${url}" target="_blank" rel="noopener nofollow" aria-label="Distribuie pe Facebook">${icon('facebook')}</a>
    <a href="https://www.linkedin.com/sharing/share-offsite/?url=${url}" target="_blank" rel="noopener nofollow" aria-label="Distribuie pe LinkedIn">${icon('linkedin')}</a>
    <a href="https://twitter.com/intent/tweet?text=${t}&amp;url=${url}" target="_blank" rel="noopener nofollow" aria-label="Distribuie pe X">${icon('x')}</a>
    <a href="https://pinterest.com/pin/create/button/?url=${url}${image ? '&amp;media=' + encodeURIComponent(image) : ''}&amp;description=${t}" target="_blank" rel="noopener nofollow" aria-label="Distribuie pe Pinterest">${icon('pinterest')}</a>
    <a href="https://wa.me/?text=${t}%20${url}" target="_blank" rel="noopener nofollow" aria-label="Trimite pe WhatsApp">${icon('whatsapp')}</a>
    <button type="button" data-copy="${attr(SITE.url + path)}" aria-label="Copiază linkul">${icon('link')}</button>
  </div>`;
}

// ---------------------------------------------------------------- inquiry form
export function contactForm({ product = null, id = 'formular', title = 'Formular contact', intro = '' } = {}) {
  const ctx = product ? `
    <div class="form-context">
      ${product.cover ? img(product.cover, { alt: '', sizes: '56px' }) : ''}
      <div><small>Solicitare pentru</small><strong>${esc(product.name)}</strong></div>
    </div>` : '';
  return `
  <div class="form-card" id="${id}">
    <h3>${title.replace(/(contact|ofertă)$/i, '<span class="h-accent">$1</span>')}</h3>
    <p>${intro || 'Completați formularul și un specialist TEMCO vă va contacta în cel mai scurt timp.'}</p>
    ${ctx}
    <form class="form-grid" data-form novalidate action="${attr(SITE.formEndpoint || 'mailto:' + SITE.email)}" method="post">
      <div class="field full"><input id="${id}-name" name="nume" type="text" placeholder=" " autocomplete="name" required maxlength="400"><label for="${id}-name">Numele și prenumele dumneavoastră <span class="req">*</span></label><span class="err" aria-live="polite"></span></div>
      <div class="field"><input id="${id}-email" name="email" type="email" placeholder=" " autocomplete="email" required maxlength="400"><label for="${id}-email">Email <span class="req">*</span></label><span class="err" aria-live="polite"></span></div>
      <div class="field"><input id="${id}-tel" name="telefon" type="tel" placeholder=" " autocomplete="tel" required maxlength="400" pattern="[0-9 +().\\-/]{6,}"><label for="${id}-tel">Telefon <span class="req">*</span></label><span class="err" aria-live="polite"></span></div>
      <div class="field full"><input id="${id}-city" name="oras" type="text" placeholder=" " autocomplete="address-level2" required maxlength="400"><label for="${id}-city">Oraș <span class="req">*</span></label><span class="err" aria-live="polite"></span></div>
      <div class="field full"><textarea id="${id}-msg" name="mesaj" placeholder=" " required maxlength="2000" rows="5">${product ? '' : ''}</textarea><label for="${id}-msg">Mesajul dumneavoastră <span class="req">*</span></label><span class="err" aria-live="polite"></span></div>
      <div class="hp" aria-hidden="true"><label>Nu completați acest câmp <input name="website" tabindex="-1" autocomplete="off"></label></div>
      ${product ? `<input type="hidden" name="produs" value="${attr(product.name)}"><input type="hidden" name="url_produs" value="${attr(SITE.url + product.url)}">` : ''}
      <label class="consent full"><input type="checkbox" name="acord" required><span>Prin trimiterea acestui formular sunt de acord cu <a href="${u('/politica-de-confidentialitate/')}">Politica de confidențialitate</a>.</span></label>
      <div class="form-foot full">
        <small>Câmpurile marcate cu <span style="color:var(--red)">*</span> sunt obligatorii.</small>
        <button class="btn btn-primary" type="submit">Trimite ${icon('send', { size: 18, cls: 'i-arrow' })}</button>
      </div>
    </form>
  </div>`;
}

// ---------------------------------------------------------------- CTA band
export function ctaBand({ title = 'Aveți nevoie de o ofertă sau de consultanță tehnică?', text = 'Echipa TEMCO vă stă la dispoziție pentru informații despre produse, demonstrații și oferte personalizate pentru clinica sau spitalul dumneavoastră.' } = {}) {
  return `
  <section class="section is-tight">
    <div class="container">
      <div class="cta-band" data-reveal="scale">
        ${arcs()}
        <div>
          <span class="eyebrow is-light">Contact</span>
          <h2 style="margin-top:14px">${title}</h2>
          <p>${text}</p>
        </div>
        <div class="cta-actions">
          <a class="btn btn-light btn-lg" href="${u('/contact/')}#formular">Trimite o solicitare ${icon('arrowRight', { cls: 'i-arrow' })}</a>
          <a class="cta-line" href="${SITE.phone.href}">${icon('phone')}<span><small>Telefon</small><strong>${SITE.phone.label}</strong></span></a>
          <a class="cta-line" href="mailto:${SITE.email}">${icon('mail')}<span><small>Email</small><strong>${SITE.email}</strong></span></a>
        </div>
      </div>
    </div>
  </section>`;
}

// ---------------------------------------------------------------- catalog (filterable product grid)
function treeLinks(nodes, currentUrl, maxDepth = 3, depth = 0) {
  return `<ul>${nodes.map((c) => `
    <li><a href="${u(c.url)}"${c.url === currentUrl ? ' aria-current="page"' : ''} class="${c.count ? '' : 'is-empty'}">${esc(c.name)}<span class="n">${c.count}</span></a>
    ${c.children.length && depth < maxDepth ? treeLinks(c.children, currentUrl, maxDepth, depth + 1) : ''}</li>`).join('')}</ul>`;
}

export function catalog({ items, tree = [], treeTitle = 'Categorii', currentUrl = '', chips = [], pageSize = 24, emptyHint = '', treeDepth = 3 }) {
  const brands = [...new Set(items.map((p) => p.manufacturer).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ro'));
  const bCount = (b) => items.filter((p) => p.manufacturer === b).length;
  const brandList = brands.map((b, i) => `<label class="check"${i >= 8 ? ' data-more hidden' : ''}><input type="checkbox" name="brand" value="${attr(b)}"><span>${esc(b)}</span><span class="n">${bCount(b)}</span></label>`).join('');
  return `
  <div class="catalog" data-catalog data-page-size="${pageSize}">
    <aside class="catalog-side" data-side aria-label="Filtre">
      <div class="side-head"><h3>Filtre</h3><button type="button" data-side-close aria-label="Închide filtrele">${icon('close')}</button></div>
      ${tree.length ? `<div class="side-block"><h2 class="s-h">${treeTitle}</h2><nav class="tree" aria-label="${attr(treeTitle)}">${treeLinks(tree, currentUrl, treeDepth)}</nav></div>` : ''}
      ${brands.length > 1 ? `<div class="side-block"><h2 class="s-h">Producător</h2><div class="check-list">${brandList}</div>${brands.length > 8 ? `<button class="check-more" type="button" data-more-toggle>+ Încă ${brands.length - 8} producători</button>` : ''}</div>` : ''}
      <div class="side-apply"><button class="btn btn-ghost btn-sm" type="button" data-reset style="flex:1">Resetează</button><button class="btn btn-primary btn-sm" type="button" data-side-close style="flex:1.4">Vezi rezultatele</button></div>
    </aside>
    <div class="side-scrim" data-side-scrim></div>
    <div class="catalog-main">
      <div class="catalog-toolbar">
        <label class="field-search">${icon('search', { size: 18 })}<span class="sr-only">Filtrează produsele</span>
          <input type="search" placeholder="Filtrează după nume, model, producător…" data-q autocomplete="off">
          <button class="clear" type="button" data-q-clear hidden aria-label="Șterge textul">${icon('close', { size: 16 })}</button>
        </label>
        <div class="select"><label class="sr-only" for="sort-${currentUrl.length}">Sortare</label>
          <select id="sort-${currentUrl.length}" data-sort>
            <option value="az">Nume: A – Z</option><option value="za">Nume: Z – A</option><option value="new">Cele mai noi</option><option value="brand">Producător</option>
          </select>${icon('chevronDown')}</div>
        <button class="btn btn-light btn-sm filters-toggle" type="button" data-side-open>${icon('filter', { size: 18 })} Filtre <span data-filter-count></span></button>
        <p class="result-count" aria-live="polite"><b data-count>${items.length}</b> <span data-count-label>${items.length === 1 ? 'produs' : 'produse'}</span></p>
      </div>
      ${chips.length > 1 ? `<div class="chip-row is-scroll" role="group" aria-label="Subcategorii">
        <button class="chip" type="button" aria-pressed="true" data-chip="">Toate <span class="count">${items.length}</span></button>
        ${chips.map((c) => `<button class="chip" type="button" aria-pressed="false" data-chip="${descIds(c)}" data-chip-slug="${c.slug}">${esc(c.name)} <span class="count">${c.count}</span></button>`).join('')}
      </div>` : ''}
      <div class="active-filters" data-active hidden></div>
      <ul class="product-grid" data-grid>${items.map((p, i) => productCard(p, { filterable: true, i })).join('')}</ul>
      <div class="empty-state" data-empty hidden>
        <span class="ico">${icon('search', { size: 28 })}</span>
        <h3>Niciun produs nu corespunde filtrelor</h3>
        <p>Încercați alți termeni sau resetați filtrele. ${emptyHint}</p>
        <button class="btn btn-dark btn-sm" type="button" data-reset>Resetează filtrele</button>
      </div>
      <div class="load-more-wrap" data-more-wrap hidden>
        <p data-shown></p>
        <div class="progress"><span data-progress></span></div>
        <button class="btn btn-ghost" type="button" data-load-more>Afișează mai multe ${icon('chevronDown', { size: 18 })}</button>
      </div>
    </div>
  </div>`;
}
function descIds(c) {
  const out = [c.id];
  const walk = (n) => n.children.forEach((k) => { out.push(k.id); walk(k); });
  walk(c);
  return out.join(' ');
}
