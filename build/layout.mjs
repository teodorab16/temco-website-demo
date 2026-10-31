import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { ROOT, esc, attr, u, img, srcOf, rootPrefix } from './lib.mjs';
import { icon, DOMAIN_ICON } from './icons.mjs';
import { SITE, NAV, FOOTER_LINKS, FOOTER_OFFICES, COOKIE, CONTACT } from './content.mjs';
import { topCategories, products } from './data.mjs';

// Logo is referenced from a cached sprite; the charcoal part uses currentColor
// so it can turn white on dark backgrounds.
const logo = () => `<svg class="logo" viewBox="0 0 2834 628" width="190" height="42" role="img" aria-label="TEMCO — Tehno Electro Medical Company"><use href="${u('/assets/brand/logo-sprite.svg')}#logo"/></svg>`;
// Cache-busting token derived from the CSS/JS content: identical sources → identical HTML.
export const ASSET_VERSION = crypto.createHash('sha1')
  .update(fs.readFileSync(path.join(ROOT, 'src/css/main.css')))
  .update(fs.readFileSync(path.join(ROOT, 'src/js/main.js')))
  .digest('hex').slice(0, 8);

// Concentric arcs echoing the TEMCO mark (decorative, drawn on load).
export function arcs(cls = 'hero-arcs') {
  const cx = 620, cy = 900;
  let paths = '';
  const radii = [120, 190, 260, 330, 420, 520, 640, 780];
  radii.forEach((rx, i) => {
    const ry = Math.round(rx * 1.18);
    const red = i === 1 || i === 3 || i === 5;
    paths += `<path class="${red ? 'a-r' : 'a-w'}" style="--d:${i}" pathLength="1" d="M${cx - rx} ${cy} A${rx} ${ry} 0 0 1 ${cx + rx} ${cy}"/>`;
  });
  return `<svg class="${cls} arcs" viewBox="0 0 1240 900" aria-hidden="true" focusable="false">${paths}</svg>`;
}

function navCurrent(href, current, isPost) {
  if (href === '/') return current === '/';
  if (href === '/produsele-noastre/') return /^\/(produsele-noastre|produse|categorie-produs|tag)\//.test(current);
  if (href === '/instruire-evenimente/') return current === href || isPost;
  return current.startsWith(href);
}

function megaMenu() {
  const domains = topCategories.map((c, i) => `
      <a class="mega-domain${i === 0 ? ' is-active' : ''}" href="${u(c.url)}" data-domain="${c.slug}">
        <span class="ico">${icon(DOMAIN_ICON[c.slug] || 'grid')}</span>
        <span>${esc(c.name)}</span><span class="n">${c.count}</span>${icon('chevronRight', { cls: 'chev' })}
      </a>`).join('');
  const panels = topCategories.map((c, i) => {
    const kids = c.children.length
      ? `<ul class="mega-links">${c.children.map((k) => `
          <li><a href="${u(k.url)}">${esc(k.name)} <span class="n">${k.count || ''}</span></a>${k.children.length ? `<ul>${k.children.map((g) => `<li><a href="${u(g.url)}">${esc(g.name)}</a></li>`).join('')}</ul>` : ''}</li>`).join('')}</ul>`
      : `<ul class="mega-links">${c.products.slice(0, 10).map((p) => `<li><a href="${u(p.url)}">${esc(p.name)}</a></li>`).join('')}</ul>`;
    return `
      <div class="mega-panel${i === 0 ? ' is-active' : ''}" data-panel="${c.slug}">
        <div>
          <h3>${esc(c.name)}</h3>
          <p class="sub">${c.children.length ? `${c.children.length} subcategorii · ` : ''}${c.count} produse</p>
          ${kids}
        </div>
        <a class="mega-feature" href="${u(c.url)}" tabindex="-1">
          ${c.image ? img(c.image, { alt: '', sizes: '300px' }) : ''}
          <strong>${esc(c.name)}</strong>
          <span>Vezi toate produsele ${icon('arrowRight', { size: 16 })}</span>
        </a>
      </div>`;
  }).join('');
  return `
  <div class="mega" id="mega-produse" aria-label="Categorii de produse">
    <div class="container">
      <div class="mega-inner">
        <nav class="mega-domains" aria-label="Domenii">${domains}</nav>
        <div class="mega-panels">${panels}</div>
      </div>
      <div class="mega-foot">
        <p>${products.length} de produse de la ${new Set(products.map((p) => p.manufacturer).filter(Boolean)).size} de producători internaționali</p>
        <a class="link-arrow" href="${u('/produse/')}">Vezi toate produsele ${icon('arrowRight', { size: 18 })}</a>
      </div>
    </div>
  </div>`;
}

export function masthead(current, isPost = false) {
  const items = NAV.map((n) => {
    const cur = navCurrent(n.href, current, isPost);
    if (n.mega) {
      return `<li class="nav-item has-mega" data-mega>
        <a class="nav-link${cur ? ' is-section' : ''}" href="${u(n.href)}"${current === n.href ? ' aria-current="page"' : ''} aria-haspopup="true" aria-expanded="false" aria-controls="mega-produse">${n.label}${icon('chevronDown')}</a>
      </li>`;
    }
    return `<li class="nav-item"><a class="nav-link${cur && current !== n.href ? ' is-section' : ''}" href="${u(n.href)}"${current === n.href ? ' aria-current="page"' : ''}>${n.label}</a></li>`;
  }).join('');

  return `
<a class="skip-link" href="#main">Sari la conținut</a>
<header class="masthead" data-masthead>
  <div class="topbar">
    <div class="container">
      <div class="topbar-group">
        <a href="${SITE.phone.href}">${icon('phone')}<span><strong>Telefon:</strong> ${SITE.phone.label}</span></a>
        <a href="mailto:${SITE.email}">${icon('mail')}<span><strong>Email:</strong> ${SITE.email}</span></a>
      </div>
      <div class="topbar-group">
        <a class="topbar-iso" href="${u('/despre-noi/')}#certificari">${icon('award')}<span>Certificat ISO 9001 · 13485 · 14001</span></a>
        <a href="${u('/contact/')}">${icon('pin')}<span>București · Cluj-Napoca · Iași · Constanța · Alexandria</span></a>
      </div>
    </div>
  </div>
  <div class="site-header">
    <div class="container header-inner">
      <a class="brand" href="${u('/')}" aria-label="TEMCO — pagina principală">${logo()}</a>
      <nav class="main-nav" aria-label="Navigație principală">
        <ul>${items}</ul>
        <span class="nav-pill" aria-hidden="true"></span>
      </nav>
      <div class="header-actions">
        <button class="search-trigger" type="button" data-search-open aria-label="Caută produse">
          ${icon('search', { size: 18 })}<span class="label">Caută produse…</span><kbd data-kbd>Ctrl K</kbd>
        </button>
        <a class="btn btn-primary btn-sm" href="${u('/contact/')}#formular">Solicită ofertă</a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Deschide meniul">${icon('menu', { size: 22 })}</button>
      </div>
    </div>
    ${megaMenu()}
  </div>
</header>
<div class="mega-scrim" data-mega-scrim></div>
${mobileNav(current)}`;
}

function mobileNav(current) {
  let i = 0;
  const li = NAV.map((n) => {
    i++;
    if (n.mega) {
      return `<li style="--i:${i}">
        <button class="m-link" type="button" aria-expanded="false" aria-controls="m-produse">${n.label}${icon('chevronDown')}</button>
        <div class="m-sub" id="m-produse"><div><ul>
          <li><a href="${u('/produsele-noastre/')}"><span class="ico">${icon('grid')}</span>Toate domeniile</a></li>
          ${topCategories.map((c) => `<li><a href="${u(c.url)}"><span class="ico">${icon(DOMAIN_ICON[c.slug] || 'grid')}</span>${esc(c.name)}<span class="n">${c.count}</span></a></li>`).join('')}
        </ul></div></div>
      </li>`;
    }
    return `<li style="--i:${i}"><a class="m-link" href="${u(n.href)}"${current === n.href ? ' aria-current="page"' : ''}>${n.label}${icon('arrowRight')}</a></li>`;
  }).join('');
  return `
<nav class="mobile-nav" id="mobile-nav" aria-label="Meniu mobil">
  <ul>${li}</ul>
  <div class="mobile-contact">
    <a href="${SITE.phone.href}">${icon('phone')} ${SITE.phone.label}</a>
    <a href="mailto:${SITE.email}">${icon('mail')} ${SITE.email}</a>
    <a class="btn btn-primary btn-lg" href="${u('/contact/')}#formular" style="justify-content:center;background:var(--red);color:#fff">Solicită ofertă ${icon('arrowRight', { cls: 'i-arrow' })}</a>
  </div>
</nav>`;
}

export function mapEmbed(query, { small = false, title = 'Hartă' } = {}) {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`;
  return `
  <div class="map-wrap${small ? ' is-small' : ''}" data-map data-src="${attr(src)}" data-title="${attr(title)}">
    <div class="map-consent">
      <div class="inner">
        <span class="pin">${icon('pin', { size: small ? 18 : 24 })}</span>
        ${small ? '' : `<strong>${esc(query)}</strong>`}
        <p>Harta este furnizată de Google și poate seta cookie-uri.</p>
        <button class="btn ${small ? 'btn-glass btn-sm' : 'btn-dark btn-sm'}" type="button" data-map-load>Încarcă harta</button>
      </div>
    </div>
  </div>`;
}

export function footer(current) {
  const links = FOOTER_LINKS.map((l) => `<li><a href="${u(l.href)}"${current === l.href ? ' aria-current="page"' : ''}>${l.label}</a></li>`).join('');
  const offices = FOOTER_OFFICES.map((o) => `
    <div class="footer-office">
      <h2 class="f-h">${o.title}</h2>
      <address>${o.lines.join('<br>')}</address>
      <div class="row">${icon('phone')}<span>Tel/fax: ${o.phones.map((p) => `<a href="${CONTACT.tel(p)}">${p}</a>`).join(';<br>')}</span></div>
      ${o.email ? `<div class="row">${icon('mail')}<a href="mailto:${o.email}">${o.email}</a></div>` : ''}
    </div>`).join('');
  return `
<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <a class="brand" href="${u('/')}" aria-label="TEMCO — pagina principală">${logo()}</a>
      <p>Din 1990, promotorul unor tehnici și aparatură medicală de referință pentru toată România.</p>
      <div class="iso-row"><span>${icon('award')}ISO 9001</span><span>${icon('award')}ISO 13485</span><span>${icon('award')}ISO 14001</span></div>
    </div>
    <div>
      <h2 class="f-h">Linkuri rapide</h2>
      <ul class="footer-links">${links}</ul>
    </div>
    ${offices}
    <div class="footer-map">
      <h2 class="f-h">Aici suntem poziționați</h2>
      ${mapEmbed('Str. Călușei 69A, București', { small: true, title: 'TEMCO București pe hartă' })}
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container">
      <p>© <span data-year>${new Date().getFullYear()}</span> Temco. Toate drepturile rezervate.</p>
      <nav aria-label="Legal">
        <a href="${u('/politica-de-confidentialitate/')}">Politică de confidențialitate</a>
        <a href="${u('/politica-cookies/')}">Politica cookies</a>
        <button type="button" data-cookie-settings>Setări cookie</button>
      </nav>
    </div>
  </div>
</footer>`;
}

function chrome() {
  return `
<button class="to-top" type="button" data-to-top aria-label="Înapoi sus">
  <svg class="ring" viewBox="0 0 56 56" aria-hidden="true"><circle class="track" cx="28" cy="28" r="26.5" pathLength="100"/><circle class="bar" cx="28" cy="28" r="26.5" pathLength="100"/></svg>
  ${icon('arrowUp')}
</button>
<dialog class="search-dialog" data-search aria-label="Căutare">
  <form class="sd-head" method="dialog" role="search" data-search-form>
    ${icon('search', { size: 22 })}
    <input type="search" name="q" placeholder="Caută produse, modele, producători, categorii…" autocomplete="off" spellcheck="false" aria-label="Caută" aria-controls="sd-results" aria-autocomplete="list" role="combobox" aria-expanded="true">
    <button type="button" class="btn btn-light btn-sm" data-search-close aria-label="Închide căutarea"><kbd>Esc</kbd></button>
  </form>
  <div class="sd-body" id="sd-results" role="listbox" aria-label="Rezultate"></div>
  <div class="sd-foot">
    <span><kbd>↑</kbd><kbd>↓</kbd> navigare</span>
    <span><kbd>↵</kbd> deschide</span>
    <span><kbd>Esc</kbd> închide</span>
    <a class="all" href="${u('/cautare/')}" data-search-all>Toate rezultatele →</a>
  </div>
</dialog>
<div class="cookie" role="dialog" aria-modal="false" aria-labelledby="cookie-title" aria-describedby="cookie-text" data-cookie hidden>
  <div class="head"><span class="ico">${icon('cookie')}</span><h2 id="cookie-title">${COOKIE.title}</h2></div>
  <p id="cookie-text">${COOKIE.text} <a href="${u('/politica-cookies/')}">Politica de cookie-uri</a></p>
  <div class="actions">
    <button class="btn btn-ghost btn-sm" type="button" data-cookie-choice="rejected">${COOKIE.reject}</button>
    <button class="btn btn-primary btn-sm" type="button" data-cookie-choice="accepted">${COOKIE.accept}</button>
  </div>
</div>
<div class="toast" role="status" aria-live="polite" data-toast></div>`;
}

export function page({ path: p, title, description, body, heroTheme = 'dark', jsonld = [], ogImage, ogType = 'website', bodyClass = '', isPost = false, noindex = false, head = '' }) {
  const current = p;
  const canonical = SITE.url + p;
  const fullTitle = title ? `${title} — TEMCO` : 'TEMCO — Tehno Electro Medical Company';
  const desc = description || SITE.description;
  const og = ogImage ? (SITE.url + '/' + srcOf(ogImage, 1200).replace(/^(\.\.\/)+/, '')) : SITE.url + '/assets/og-default.jpg';
  const ld = [{
    '@context': 'https://schema.org', '@type': 'MedicalBusiness', '@id': SITE.url + '/#organization',
    name: 'TEMCO — Tehno Electro Medical Company', alternateName: 'TEMCO', url: SITE.url + '/', email: SITE.email,
    telephone: '+40212524650', foundingDate: '1990', logo: SITE.url + '/assets/brand/logo.svg',
    address: { '@type': 'PostalAddress', streetAddress: 'Str. Călușei nr. 69A, sector 2', addressLocality: 'București', addressCountry: 'RO' },
  }, ...jsonld];
  return `<!doctype html>
<html lang="ro" data-root="${rootPrefix() || './'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${attr(desc)}">
<link rel="canonical" href="${canonical}">
${noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<meta name="theme-color" content="#0e1115">
<meta property="og:locale" content="ro_RO">
<meta property="og:site_name" content="Temco">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${attr(title || 'TEMCO — Tehno Electro Medical Company')}">
<meta property="og:description" content="${attr(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${attr(og)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${u('/assets/brand/favicon.svg')}" type="image/svg+xml">
<link rel="icon" href="${u('/assets/brand/favicon-32.png')}" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="${u('/assets/brand/apple-touch-icon.png')}">
<link rel="manifest" href="${u('/site.webmanifest')}">
<link rel="preload" href="${u('/assets/fonts/manrope-latin-wght-normal.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${u('/assets/fonts/inter-latin-wght-normal.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${u('/assets/css/main.css')}?v=${ASSET_VERSION}">
<script>document.documentElement.classList.add('js');</script>
${head}
<script type="application/ld+json">${JSON.stringify(ld.length === 1 ? ld[0] : { '@context': 'https://schema.org', '@graph': ld.map(({ '@context': _, ...r }) => r) })}</script>
</head>
<body class="${heroTheme === 'dark' ? 'has-dark-hero' : 'has-light-top'} ${bodyClass}">
${masthead(current, isPost)}
<main id="main" tabindex="-1">
${heroTheme === 'dark' ? '' : '<div class="header-spacer" aria-hidden="true"></div>'}${body}
</main>
${footer(current)}
${chrome()}
<script src="${u('/assets/js/main.js')}?v=${ASSET_VERSION}" defer></script>
</body>
</html>`;
}
