import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { ROOT, esc, attr, u, rootPrefix } from './lib.mjs';
import { icon } from './icons.mjs';
import { SITE, NAV, FOOTER_LINKS, FOOTER_OFFICES, COOKIE, CONTACT } from './content.mjs';
import { topCategories } from './data.mjs';

// Cache-busting token derived from the CSS/JS content: identical sources give identical HTML.
export const ASSET_VERSION = crypto.createHash('sha1')
  .update(fs.readFileSync(path.join(ROOT, 'src/css/main.css')))
  .update(fs.readFileSync(path.join(ROOT, 'src/js/main.js')))
  .digest('hex').slice(0, 8);

// Logo from a cached sprite; the charcoal part uses currentColor (white on dark).
const logo = () => `<svg class="logo" viewBox="0 0 2834 628" width="162" height="36" role="img" aria-label="TEMCO, Tehno Electro Medical Company"><use href="${u('/assets/brand/logo-sprite.svg')}#logo"/></svg>`;

function isCurrent(href, current, isPost) {
  if (href === '/') return current === '/';
  if (href === '/produsele-noastre/') return /^\/(produsele-noastre|produse|categorie-produs|tag)\//.test(current);
  if (href === '/instruire-evenimente/') return current === href || isPost;
  return current.startsWith(href);
}

function header(current, isPost) {
  const items = NAV.map((n) => {
    const cur = isCurrent(n.href, current, isPost);
    const aria = current === n.href ? ' aria-current="page"' : '';
    const cls = `nav-link${cur && !aria ? ' is-section' : ''}`;
    if (n.menu) {
      return `<li class="nav-item" data-dropdown>
        <a class="${cls}" href="${u(n.href)}"${aria} aria-haspopup="true" aria-expanded="false">${n.label}${icon('chevronDown')}</a>
        <div class="dropdown">
          <ul>${topCategories.map((c) => `<li><a href="${u(c.url)}">${esc(c.name)}</a></li>`).join('')}</ul>
          <a class="all" href="${u('/produsele-noastre/')}">Toate produsele ${icon('arrowRight', { size: 18 })}</a>
        </div>
      </li>`;
    }
    return `<li class="nav-item"><a class="${cls}" href="${u(n.href)}"${aria}>${n.label}</a></li>`;
  }).join('');

  const mobile = NAV.map((n) => n.menu
    ? `<li><button class="m-link" type="button" aria-expanded="false" aria-controls="m-produse">${n.label}${icon('chevronDown')}</button>
        <div class="m-sub" id="m-produse"><div><ul>
          ${topCategories.map((c) => `<li><a href="${u(c.url)}">${esc(c.name)}</a></li>`).join('')}
          <li><a href="${u('/produsele-noastre/')}"><strong>Toate produsele</strong></a></li>
        </ul></div></div></li>`
    : `<li><a class="m-link" href="${u(n.href)}"${current === n.href ? ' aria-current="page"' : ''}>${n.label}</a></li>`).join('');

  return `
<a class="skip-link" href="#main">Sari la conținut</a>
<header class="site-header" data-header>
  <div class="container header-inner">
    <a class="brand" href="${u('/')}" aria-label="TEMCO, pagina principală">${logo()}</a>
    <nav class="nav" aria-label="Navigație principală"><ul>${items}</ul></nav>
    <div class="header-actions">
      <button class="icon-btn" type="button" data-search-open aria-label="Caută">${icon('search')}</button>
      <a class="btn btn-primary btn-sm" href="${u('/contact/')}#formular">Solicită ofertă</a>
      <button class="icon-btn menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Deschide meniul">${icon('menu', { size: 22 })}</button>
    </div>
  </div>
</header>
<nav class="mobile-nav" id="mobile-nav" aria-label="Meniu mobil">
  <ul>${mobile}</ul>
  <div class="mobile-contact">
    <a href="${SITE.phone.href}">${SITE.phone.label}</a>
    <a href="mailto:${SITE.email}">${SITE.email}</a>
    <a class="btn btn-primary" href="${u('/contact/')}#formular" style="margin-top:12px">Solicită ofertă</a>
  </div>
</nav>`;
}

export function mapEmbed(query, title = 'Hartă') {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`;
  return `
  <div class="map-wrap" data-map data-src="${attr(src)}" data-title="${attr(title)}">
    <div class="map-consent"><div class="inner">
      <p>Harta este furnizată de Google și poate seta cookie-uri.</p>
      <button class="btn btn-dark btn-sm" type="button" data-map-load>Încarcă harta</button>
    </div></div>
  </div>`;
}

function footer(current) {
  return `
<footer class="site-footer">
  <div class="container">
    <div class="footer-cta">
      <div>
        <h2>Hai să vorbim.</h2>
        <div class="lines"><a href="mailto:${SITE.email}">${SITE.email}</a><a href="${SITE.phone.href}">${SITE.phone.label}</a></div>
      </div>
      <a class="btn btn-white" href="${u('/contact/')}#formular">Solicită ofertă ${icon('arrowRight', { cls: 'i-arrow', size: 18 })}</a>
    </div>
    <div class="footer-grid">
      <div><a class="brand" href="${u('/')}" aria-label="TEMCO, pagina principală">${logo()}</a></div>
      <div>
        <h2 class="f-h">Linkuri rapide</h2>
        <ul>${FOOTER_LINKS.map((l) => `<li><a href="${u(l.href)}"${current === l.href ? ' aria-current="page"' : ''}>${l.label}</a></li>`).join('')}</ul>
      </div>
      ${FOOTER_OFFICES.map((o) => `
      <div>
        <h2 class="f-h">${o.title}</h2>
        <address>${o.lines.join('<br>')}<br>${o.phones.map((p) => `<a href="${CONTACT.tel(p)}">${p}</a>`).join('<br>')}</address>
      </div>`).join('')}
    </div>
    <div class="footer-bottom">
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
<button class="to-top" type="button" data-to-top aria-label="Înapoi sus">${icon('arrowUp')}</button>
<dialog class="search-dialog" data-search aria-label="Căutare">
  <form class="sd-head" method="dialog" role="search">
    ${icon('search', { size: 20 })}
    <input type="search" name="q" placeholder="Caută produse, modele, producători" autocomplete="off" spellcheck="false" aria-label="Caută" aria-controls="sd-results" aria-autocomplete="list" role="combobox" aria-expanded="true">
    <button type="button" data-search-close aria-label="Închide"><kbd>Esc</kbd></button>
  </form>
  <div class="sd-body" id="sd-results" role="listbox" aria-label="Rezultate"></div>
  <div class="sd-foot"><span><kbd>↑</kbd> <kbd>↓</kbd> <kbd>↵</kbd></span><a class="all" href="${u('/cautare/')}" data-search-all>Toate rezultatele</a></div>
</dialog>
<div class="cookie" role="dialog" aria-modal="false" aria-labelledby="cookie-title" aria-describedby="cookie-text" data-cookie hidden>
  <h2 id="cookie-title">${COOKIE.title}</h2>
  <p id="cookie-text">${COOKIE.text} <a href="${u('/politica-cookies/')}">Politica de cookie-uri</a></p>
  <div class="actions">
    <button class="btn btn-line btn-sm" type="button" data-cookie-choice="rejected">${COOKIE.reject}</button>
    <button class="btn btn-dark btn-sm" type="button" data-cookie-choice="accepted">${COOKIE.accept}</button>
  </div>
</div>
<div class="toast" role="status" aria-live="polite" data-toast></div>`;
}

export function page({ path: p, title, description, body, heroTheme = 'light', jsonld = [], ogCard = 'home', ogTitle, ogType = 'website', bodyClass = '', isPost = false, noindex = false, head = '' }) {
  const canonical = SITE.url + p;
  const fullTitle = title ? `${title} | TEMCO` : 'TEMCO | Tehno Electro Medical Company';
  const desc = description || SITE.description;
  // Designed 1200x630 preview card (WhatsApp, Facebook, LinkedIn, iMessage)
  const og = `${SITE.url}/assets/og/${ogCard}.jpg?v=${ASSET_VERSION}`;
  const isDemo = !SITE.url.includes('temco.ro');
  const ld = [{
    '@context': 'https://schema.org', '@type': 'MedicalBusiness', '@id': SITE.url + '/#organization',
    name: 'TEMCO, Tehno Electro Medical Company', alternateName: 'TEMCO', url: SITE.url + '/', email: SITE.email,
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
${noindex || isDemo ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<meta name="theme-color" content="#ffffff">
<meta property="og:locale" content="ro_RO">
<meta property="og:site_name" content="Temco">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${attr(ogTitle || title || 'TEMCO, Tehno Electro Medical Company')}">
<meta property="og:description" content="${attr(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${attr(og)}">
<meta property="og:image:secure_url" content="${attr(og)}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="TEMCO, Tehnologie medicală de referință. Din 1990, pentru medicii din toată România.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${attr(og)}">
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
<body class="${heroTheme === 'dark' ? 'has-dark-hero' : ''} ${bodyClass}">
${header(p, isPost)}
<main id="main" tabindex="-1">
${heroTheme === 'dark' ? '' : '<div class="header-spacer" aria-hidden="true"></div>'}${body}
</main>
${footer(p)}
${chrome()}
<script src="${u('/assets/js/main.js')}?v=${ASSET_VERSION}" defer></script>
</body>
</html>`;
}
