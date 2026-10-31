import { esc, attr, u, img, srcOf, roDate, truncate, plural, readingTime, mediaInfo, stripTags, fold, docUrl, fileSize } from './lib.mjs';
import { icon, DOMAIN_ICON } from './icons.mjs';
import { SITE, HOME, ABOUT, CONTACT } from './content.mjs';
import { page, arcs, mapEmbed } from './layout.mjs';
import { sectionHead, breadcrumbs, pageHero, domainCard, subcatCard, productCard, eventCard, docList, share, contactForm, ctaBand, catalog } from './components.mjs';
import { products, categories, topCategories, tags, tagById, posts, pages, siteAssets, ancestors, manufacturers, manufacturerCounts, catById } from './data.mjs';

const brandCount = manufacturers.length;

// ============================================================== HOME
export function home() {
  const slides = HOME.slides.map((s, i) => `
      <figure class="hero-slide${i === 0 ? ' is-active' : ''}" data-slide>
        ${img(s, { alt: i === 0 ? 'Sală de endoscopie echipată cu tehnologie OLYMPUS' : 'Ilustrație a rețelei neuronale — tehnologie medicală de vârf', sizes: '100vw', eager: i === 0, priority: i === 0 })}
      </figure>`).join('');
  const values = HOME.values.map((v, i) => `
      <div class="value" data-reveal style="--rd:${i * 90}">
        <span class="ico">${icon(v.icon, { size: 24 })}</span>
        <div><h3>${v.title}</h3><p>${v.text}</p></div>
      </div>`).join('');
  const firsts = ABOUT.milestones.slice(1).map((m, i) => `
      <article class="first" data-reveal style="--rd:${i * 90}">
        <span class="k">${m.kicker}</span>
        <span class="yr">${m.year}</span>
        <h3>${m.title}</h3>
        <p>${truncate(m.text.replace(/<[^>]+>/g, ''), 150)}</p>
      </article>`).join('');
  const brandPills = manufacturers.filter((m) => manufacturerCounts[m] >= 2)
    .map((m) => `<a class="brand-pill" href="${u('/produse/')}?producator=${encodeURIComponent(m)}">${esc(m)} <small>${manufacturerCounts[m]}</small></a>`);
  const half = Math.ceil(brandPills.length / 2);
  const row = (list, rev) => `<div class="marquee${rev ? ' is-reverse' : ''}" style="--dur:${list.length * 4.5}s"><div class="marquee-track">${list.join('')}<span aria-hidden="true" style="display:contents">${list.join('').replace(/<a /g, '<a tabindex="-1" ')}</span></div></div>`;

  const body = `
  <section class="hero" data-hero aria-roledescription="carusel" aria-label="Prezentare TEMCO">
    <div class="hero-media">${slides}<div class="hero-scrim"></div>${arcs()}</div>
    <div class="container hero-inner">
      <div class="hero-content">
        <span class="eyebrow is-light fade-up" style="--d:.1s">Tehno Electro Medical Company · din 1990</span>
        <h1 data-split>Aparatură medicală de <span class="accent">referință</span> pentru toată România</h1>
        <p class="hero-lead fade-up" style="--d:.55s">Endoscopie, chirurgie laparoscopică, imagistică, microscopie, laborator, stomatologie și simulatoare medicale — de la producători de top mondial, alături de medici și clinici din toată țara.</p>
        <div class="hero-cta fade-up" style="--d:.7s">
          <a class="btn btn-primary btn-lg" href="${u('/produsele-noastre/')}">Explorează produsele ${icon('arrowRight', { cls: 'i-arrow' })}</a>
          <a class="btn btn-glass btn-lg" href="${u('/contact/')}">Contactează-ne</a>
        </div>
      </div>
    </div>
    <div class="hero-controls fade-up" style="--d:.9s">
      <span class="hero-count"><b data-hero-current>01</b> / 0${HOME.slides.length}</span>
      <div class="hero-dots" role="tablist" aria-label="Alege imaginea">${HOME.slides.map((_, i) => `<button class="hero-dot${i === 0 ? ' is-active' : ''}" type="button" role="tab" aria-selected="${i === 0}" aria-label="Imaginea ${i + 1}" data-dot="${i}"><span></span></button>`).join('')}</div>
      <div class="hero-arrows">
        <button type="button" data-hero-prev aria-label="Imaginea anterioară">${icon('chevronLeft')}</button>
        <button type="button" data-hero-next aria-label="Imaginea următoare">${icon('chevronRight')}</button>
      </div>
    </div>
  </section>

  <section class="values" aria-labelledby="values-title">
    <h2 class="sr-only" id="values-title">Valorile TEMCO</h2>
    <div class="container"><div class="values-card">${values}</div></div>
  </section>

  <section class="section" id="produse">
    <div class="container">
      ${sectionHead({ eyebrow: 'Portofoliu', title: 'Produsele <em>noastre</em>', text: `${products.length} de echipamente și soluții, organizate pe ${topCategories.length} domenii medicale.`, split: `<a class="btn btn-ghost" href="${u('/produse/')}">Toate produsele ${icon('arrowRight', { cls: 'i-arrow', size: 18 })}</a>` })}
      <ul class="domain-grid">${topCategories.map((c, i) => domainCard(c, i)).join('')}</ul>
    </div>
  </section>

  <section class="section is-soft">
    <div class="container split">
      <div class="about-media" data-reveal="left">
        <div class="frame">${img(HOME.slides[1], { alt: 'Ilustrație a rețelei neuronale', sizes: '(max-width:1080px) 90vw, 600px' })}</div>
        <div class="float"><b data-count-to="1990" data-count-from="1960">1990</b><span>anul în care<br>s-a născut TEMCO</span></div>
        <div class="float float-2">${icon('award')}<span><strong style="color:var(--ink);display:block">Certificat ISO</strong>9001 · 13485 · 14001</span></div>
      </div>
      <div class="about-text">
        ${sectionHead({ eyebrow: 'Despre noi', title: 'Peste trei decenii de <em>premiere</em> în tehnica medicală' })}
        <p class="lead" style="margin-top:-20px">${ABOUT.lead}</p>
        <div class="stats">
          <div class="stat" data-reveal><b><span data-count-to="80">80</span><sup>+</sup></b><span>de specialiști în echipa TEMCO</span></div>
          <div class="stat" data-reveal style="--rd:80"><b><span data-count-to="${products.length}">${products.length}</span></b><span>de produse în portofoliu</span></div>
          <div class="stat" data-reveal style="--rd:160"><b><span data-count-to="${brandCount}">${brandCount}</span></b><span>de producători reprezentați</span></div>
          <div class="stat" data-reveal style="--rd:240"><b><span data-count-to="8">8</span></b><span>sedii și puncte de lucru în țară</span></div>
        </div>
        <div><a class="btn btn-dark" href="${u('/despre-noi/')}">Află povestea noastră ${icon('arrowRight', { cls: 'i-arrow', size: 18 })}</a></div>
      </div>
    </div>
  </section>

  <section class="section firsts on-dark">
    <div class="container">
      ${sectionHead({ eyebrow: 'Premiere', title: 'Tehnici noi, aduse <em>primele</em> în România', text: 'TEMCO a fost alături de medicii români la introducerea unor tehnologii care au schimbat practica medicală.', light: true })}
      <div class="firsts-grid">${firsts}</div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      ${sectionHead({ eyebrow: 'Parteneri', title: 'Producători <em>reprezentați</em>', text: 'Lucrăm cu lideri mondiali în tehnologie medicală — de la OLYMPUS, liderul mondial în endoscopie, la Dürr Dental, Dentsply Sirona sau Surgical Science – Simbionix.', center: true })}
    </div>
    <div data-reveal>${row(brandPills.slice(0, half))}${row(brandPills.slice(half), true)}</div>
  </section>

  <section class="section is-soft">
    <div class="container">
      ${sectionHead({ eyebrow: 'Instruire / Evenimente', title: 'Cursuri, congrese și <em>workshop-uri</em>', split: `<a class="btn btn-ghost" href="${u('/instruire-evenimente/')}">Toate evenimentele ${icon('arrowRight', { cls: 'i-arrow', size: 18 })}</a>` })}
      <ul class="event-grid">${posts.slice(0, 3).map((p, i) => eventCard(p, { i })).join('')}</ul>
    </div>
  </section>
  ${ctaBand()}`;

  const heroM = mediaInfo(HOME.slides[0]);
  const preload = heroM ? `<link rel="preload" as="image" imagesrcset="${heroM.variants.map((v) => `${u('/' + v.src)} ${v.w}w`).join(', ')}" imagesizes="100vw" fetchpriority="high">` : '';
  return page({ path: '/', head: preload, title: '', description: 'Când vorbim despre sănătate, TEMCO pune întotdeauna oamenii pe primul loc. Doar împreună putem oferi servicii de calitate. Aparatură medicală de referință pentru toată România, din 1990.', body, ogImage: HOME.slides[0],
    jsonld: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Temco', url: SITE.url + '/', potentialAction: { '@type': 'SearchAction', target: SITE.url + '/cautare/?q={search_term_string}', 'query-input': 'required name=search_term_string' } }] });
}

// ============================================================== ABOUT
export function about() {
  const bc = breadcrumbs([{ name: 'Despre noi', url: '/despre-noi/' }]);
  const tl = ABOUT.milestones.map((m) => `
      <li class="tl-item" data-reveal>
        <span class="yr${/^\d+$/.test(m.year) ? '' : ' is-word'}">${m.year}</span>
        <div class="tl-card"><span class="k">${m.kicker}</span><h3>${m.title}</h3><p>${m.text}</p></div>
      </li>`).join('');
  const certs = siteAssets.despre.iso.map((src, i) => `
      <li data-reveal style="--rd:${i * 90}">
        <button class="cert" type="button" data-lightbox="iso" data-src="${attr(srcOf(src, 1600))}" data-alt="${attr('Certificat ' + ABOUT.iso[i].code + ' TEMCO')}">
          <span class="paper">${img(src, { alt: 'Certificat ' + ABOUT.iso[i].code, sizes: '(max-width:860px) 70vw, 380px' })}<span class="zoom">${icon('zoom')}</span></span>
          <span class="lbl"><b>${ABOUT.iso[i].code}</b><span>${ABOUT.iso[i].name}</span></span>
        </button>
      </li>`).join('');
  const pdf = siteAssets.despre.brochurePdf;
  const body = `
  ${pageHero({ eyebrow: 'Tehno Electro Medical Company', title: 'Despre noi', lead: 'Din 1990, de la trei membri la peste 80 de specialiști — promotorul unor tehnici și aparatură medicală de referință pentru toată România.', crumbs: bc.html,
    extra: `<div class="hero-stats fade-up" style="--d:.5s"><span class="hero-stat">${icon('history')}Din <b>1990</b></span><span class="hero-stat">${icon('users')}<b>80+</b> membri</span><span class="hero-stat">${icon('award')}<b>3</b> certificări ISO</span></div>` })}

  <section class="section">
    <div class="container split is-top">
      <div class="about-text" style="position:sticky;top:calc(var(--header-h) + 32px)">
        ${sectionHead({ eyebrow: 'Cine suntem', title: 'O companie construită pe <em>încredere</em>' })}
        <p class="lead" style="margin-top:-20px">${ABOUT.lead}</p>
        <div class="stats">
          <div class="stat"><b><span data-count-to="1990" data-count-from="1960">1990</span></b><span>anul înființării</span></div>
          <div class="stat"><b><span data-count-to="80">80</span><sup>+</sup></b><span>de membri în prezent</span></div>
        </div>
      </div>
      <div>
        <ol class="timeline" data-timeline><span class="tl-progress" aria-hidden="true"></span>${tl}</ol>
      </div>
    </div>
  </section>

  <section class="section is-soft" id="brosura">
    <div class="container">
      <div class="brochure" data-reveal="scale">
        <a class="cover" href="${attr(docUrl(pdf))}" target="_blank" rel="noopener" aria-label="Descarcă broșura TEMCO (PDF)">${img(siteAssets.despre.brochureCover, { alt: 'Coperta broșurii TEMCO', sizes: '220px' })}</a>
        <div>
          <span class="eyebrow is-light">Broșura TEMCO</span>
          <h3 style="margin-top:12px">Descoperiți TEMCO în broșura de prezentare</h3>
          <p>Istoric, domenii de activitate, parteneri și certificări — totul într-un singur document. ${fileSize(pdf) ? `PDF · ${fileSize(pdf)}` : ''}</p>
          <a class="btn btn-primary" href="${attr(docUrl(pdf))}" target="_blank" rel="noopener">${icon('download', { size: 18 })} Descarcă broșura</a>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="certificari">
    <div class="container">
      ${sectionHead({ eyebrow: 'Calitate certificată', title: 'Certificatele <em>ISO</em> ale TEMCO', text: ABOUT.isoIntro + '.' })}
      <ul class="cert-grid">${certs}</ul>
    </div>
  </section>
  ${ctaBand()}`;
  return page({ path: '/despre-noi/', title: 'Despre noi', description: stripTags(ABOUT.lead), body, jsonld: [bc.ld], ogImage: HOME.slides[1] });
}

// ============================================================== PRODUCTS HUB
const indexTree = (nodes) => `<ul>${nodes.map((k) => `<li><a href="${u(k.url)}">${esc(k.name)}<span class="n">${k.count || '—'}</span></a>${k.children.length ? indexTree(k.children) : ''}</li>`).join('')}</ul>`;
export function productsHub() {
  const bc = breadcrumbs([{ name: 'Produse', url: '/produsele-noastre/' }]);
  const index = topCategories.map((c, i) => `
    <div class="index-col" data-reveal style="--rd:${(i % 3) * 60}">
      <a class="index-head" href="${u(c.url)}"><span class="ico">${icon(DOMAIN_ICON[c.slug] || 'grid', { size: 18 })}</span><strong>${esc(c.name)}</strong><span class="n">${c.count}</span></a>
      ${c.children.length ? indexTree(c.children) : `<p class="index-none">${plural(c.count, 'produs', 'produse')} — <a href="${u(c.url)}">vezi lista</a></p>`}
    </div>`).join('');
  const brandLinks = manufacturers.map((m) => `<a class="chip" href="${u('/produse/')}?producator=${encodeURIComponent(m)}">${esc(m)} <span class="count">${manufacturerCounts[m]}</span></a>`).join('');
  const body = `
  ${pageHero({ eyebrow: 'Catalog', title: 'Produsele noastre', lead: `${products.length} de echipamente medicale din ${topCategories.length} domenii, de la ${brandCount} de producători internaționali.`, crumbs: bc.html,
    extra: `<button class="hero-search fade-up" style="--d:.5s" type="button" data-search-open>${icon('search', { size: 20 })}<span>Caută după produs, model sau producător…</span><kbd data-kbd>Ctrl K</kbd></button>` })}
  <section class="section">
    <div class="container">
      ${sectionHead({ eyebrow: 'Domenii', title: 'Alegeți <em>domeniul</em> de interes', split: `<a class="btn btn-ghost" href="${u('/produse/')}">Toate produsele (${products.length}) ${icon('arrowRight', { cls: 'i-arrow', size: 18 })}</a>` })}
      <ul class="domain-grid">${topCategories.map((c, i) => domainCard(c, i)).join('')}</ul>
    </div>
  </section>
  <section class="section is-soft">
    <div class="container">
      ${sectionHead({ eyebrow: 'Index', title: 'Toate <em>categoriile</em>', text: 'Structura completă a catalogului, cu numărul de produse din fiecare categorie.' })}
      <div class="cat-index">${index}</div>
    </div>
  </section>
  <section class="section">
    <div class="container">
      ${sectionHead({ eyebrow: 'Producători', title: 'Caută după <em>producător</em>' })}
      <div class="chip-row" data-reveal>${brandLinks}</div>
    </div>
  </section>
  ${ctaBand()}
  <script>
  // Compatibilitate cu vechile adrese: /produsele-noastre/?taxonomy_id=13
  (function(){var q=new URLSearchParams(location.search),id=q.get('taxonomy_id');var m=${JSON.stringify(Object.fromEntries(categories.map((c) => [c.id, c.url.slice(1)])))};if(id&&m[id])location.replace(document.documentElement.dataset.root+m[id]);})();
  </script>`;
  return page({ path: '/produsele-noastre/', title: 'Produse', description: `Catalogul TEMCO: ${products.length} de produse medicale — ${topCategories.map((c) => c.name).join(', ')}.`, body, jsonld: [bc.ld] });
}

// ============================================================== ALL PRODUCTS
export function allProducts() {
  const bc = breadcrumbs([{ name: 'Produse', url: '/produsele-noastre/' }, { name: 'Toate produsele', url: '/produse/' }]);
  const body = `
  ${pageHero({ eyebrow: 'Catalog complet', title: 'Toate produsele', lead: `Filtrați cele ${products.length} de produse după domeniu, producător sau căutați direct după model.`, crumbs: bc.html })}
  <section class="section is-tight">
    <div class="container">
      ${catalog({ items: products, tree: topCategories, treeTitle: 'Domenii', currentUrl: '/produse/', chips: topCategories.filter((c) => c.count), treeDepth: 0 })}
    </div>
  </section>
  ${ctaBand()}`;
  return page({ path: '/produse/', title: 'Toate produsele', description: `Catalogul complet TEMCO — ${products.length} de produse medicale filtrabile după domeniu și producător.`, body, jsonld: [bc.ld, itemList(products.slice(0, 50))] });
}

function itemList(items) {
  return { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: items.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE.url + p.url, name: p.name })) };
}

// ============================================================== CATEGORY
export function categoryPage(c) {
  const chain = ancestors(c);
  const bc = breadcrumbs([{ name: 'Produse', url: '/produsele-noastre/' }, ...chain.map((x) => ({ name: x.name, url: x.url }))]);
  const domain = chain[0];
  const isTop = chain.length === 1;
  const lead = c.description || (c.count
    ? `${plural(c.count, 'produs', 'produse')}${c.children.length ? ` în ${plural(c.children.length, 'subcategorie', 'subcategorii')}` : ''}${!isTop ? ` · ${domain.name}` : ''}.`
    : 'Pentru informații despre echipamentele din această categorie, vă rugăm să ne contactați.');
  const brandsHere = [...new Set(c.products.map((p) => p.manufacturer).filter(Boolean))];
  const heroMedia = c.image ? img(c.image, { alt: c.name, sizes: '(max-width:1080px) 90vw, 520px', eager: true, priority: true }) : '';
  const white = c.image && !/grid-product|laborator-morga|bnr_|scan-r|abbelight|65cc6d7b|Capture/.test(c.image);
  const subs = c.children.length ? `
    <section class="section is-tight" style="padding-bottom:0">
      <div class="container">
        <h2 class="mini-title">Subcategorii</h2>
        <ul class="subcat-grid">${c.children.map(subcatCard).join('')}</ul>
      </div>
    </section>` : '';
  const content = c.count ? `
    <section class="section is-tight">
      <div class="container">
        ${catalog({ items: c.products, tree: [domain], treeTitle: domain.name, currentUrl: c.url, chips: c.children.filter((k) => k.count) })}
      </div>
    </section>` : `
    <section class="section is-tight">
      <div class="container">
        <div class="empty-state" style="padding:72px 24px">
          <span class="ico">${icon(DOMAIN_ICON[domain.slug] || 'grid', { size: 28 })}</span>
          <h2 style="font-size:1.35rem">Echipamente disponibile la cerere</h2>
          <p>Portofoliul pentru <strong>${esc(c.name)}</strong> este în curs de actualizare. Specialiștii noștri vă pot prezenta soluțiile disponibile.</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"><a class="btn btn-primary btn-sm" href="${u('/contact/')}#formular">Solicită informații</a><a class="btn btn-ghost btn-sm" href="${u(chain.length > 1 ? chain[chain.length - 2].url : '/produsele-noastre/')}">Înapoi la ${esc(chain.length > 1 ? chain[chain.length - 2].name : 'produse')}</a></div>
        </div>
      </div>
    </section>`;
  const body = `
  ${pageHero({ eyebrow: isTop ? 'Domeniu' : esc(domain.name), title: esc(c.name), lead: esc(lead), crumbs: bc.html, media: heroMedia, mediaWhite: white,
    extra: c.count ? `<div class="hero-stats fade-up" style="--d:.5s"><span class="hero-stat">${icon('layers')}<b>${c.count}</b> produse</span>${brandsHere.length ? `<span class="hero-stat">${icon('building')}<b>${brandsHere.length}</b> ${brandsHere.length === 1 ? 'producător' : 'producători'}</span>` : ''}${c.products.some((p) => p.docs.length) ? `<span class="hero-stat">${icon('file')}Broșuri PDF</span>` : ''}</div>` : '' })}
  ${subs}
  ${content}
  ${ctaBand({ title: `Căutați echipamente pentru ${c.name.toLowerCase().startsWith('ati') ? 'ATI / sala de operație' : esc(c.name.toLowerCase())}?` })}`;
  return page({ path: c.url, title: c.name, description: truncate(`${c.name} — ${lead} ${c.products.slice(0, 4).map((p) => p.name).join(', ')}`, 158), body, jsonld: [bc.ld, itemList(c.products)], ogImage: c.image });
}

// ============================================================== PRODUCT
export function productPage(p, related) {
  const bc = breadcrumbs([{ name: 'Produse', url: '/produsele-noastre/' }, ...p.chain.map((x) => ({ name: x.name, url: x.url })), { name: p.name, url: p.url }], { light: true });
  const imgs = p.images.length ? p.images : [];
  const slides = imgs.map((s, i) => `<div class="stage-slide${i === 0 ? ' is-active' : ''}" data-index="${i}">${img(s, { alt: `${p.name}${imgs.length > 1 ? ` — imaginea ${i + 1}` : ''}`, sizes: '(max-width:1080px) 92vw, 640px', eager: i === 0, priority: i === 0, vt: i === 0 ? 'product-hero' : '' })}</div>`).join('');
  const thumbs = imgs.length > 1 ? `<div class="thumbs" role="tablist" aria-label="Imagini produs">${imgs.map((s, i) => `<button type="button" role="tab" aria-current="${i === 0}" aria-label="Imaginea ${i + 1}" data-thumb="${i}">${img(s, { alt: '', sizes: '76px' })}</button>`).join('')}</div>` : '';
  const lbData = JSON.stringify(imgs.map((s) => ({ src: srcOf(s, 1600), thumb: srcOf(s, 200), alt: p.name })));
  const manu = p.manufacturer ? (p.manufacturerUrl ? `<a href="${attr(p.manufacturerUrl)}" target="_blank" rel="noopener">${esc(p.manufacturer)}${icon('external')}</a>` : esc(p.manufacturer)) : '';
  const tagLinks = p.tags.map((id) => tagById.get(id)).filter(Boolean);
  const desc = stripTags(p.description);
  const hasDesc = desc.length > 0;
  const specs = [
    p.model && ['Model', esc(p.model)],
    manu && ['Producător', manu],
    p.primary && ['Categorie', `<a href="${u(p.primary.url)}">${esc(p.primary.name)}</a>`],
    p.chain.length > 1 && ['Domeniu', `<a href="${u(p.domain.url)}">${esc(p.domain.name)}</a>`],
    p.docs.length && ['Documentație', `${p.docs.length === 1 ? 'Broșură PDF' : p.docs.length + ' documente PDF'}`],
  ].filter(Boolean);
  const tabs = [['descriere', 'Descriere', 0], p.docs.length && ['documente', 'Documente', p.docs.length], ['oferta', 'Solicită ofertă', 0], related.length && ['similare', 'Produse similare', 0]].filter(Boolean);

  const body = `
  <div class="pd">
    <div class="container">
      ${bc.html}
      <div class="pd-top">
        <div class="gallery" data-gallery data-images='${attr(lbData)}'>
          <div class="stage" data-stage tabindex="0" aria-label="Imagine produs — click pentru mărire">
            <div class="stage-track" data-track>${slides || `<div class="stage-slide is-active">${icon('image', { size: 64 })}</div>`}</div>
            <span class="zoom-hint">${icon('zoom', { size: 14 })} Treceți cu mouse-ul pentru zoom</span>
            ${imgs.length > 1 ? `<button class="stage-nav prev" type="button" data-prev aria-label="Imaginea anterioară">${icon('chevronLeft')}</button><button class="stage-nav next" type="button" data-next aria-label="Imaginea următoare">${icon('chevronRight')}</button><span class="stage-count"><b data-cur>1</b> / ${imgs.length}</span>` : ''}
            <div class="stage-ui"><button type="button" data-open-lightbox aria-label="Vezi imaginea pe tot ecranul">${icon('expand', { size: 18 })}</button></div>
          </div>
          ${thumbs}
        </div>
        <div class="pd-info">
          ${p.primary ? `<a class="cat-link fade-up" href="${u(p.primary.url)}">${icon(DOMAIN_ICON[p.domain.slug] || 'grid')}${esc(p.primary.name)}</a>` : ''}
          <h1 class="fade-up" style="--d:.08s">${esc(p.name)}</h1>
          <div class="pd-sub fade-up" style="--d:.14s">
            ${p.manufacturer ? `<span class="badge is-blue">${icon('building')}${esc(p.manufacturer)}</span>` : ''}
            ${p.model ? `<span class="badge">${icon('tag')}Model: ${esc(p.model)}</span>` : ''}
            ${p.shopUrl ? `<span class="badge is-red">${icon('bag')}Disponibil online</span>` : ''}
          </div>
          ${hasDesc ? `<p class="lead fade-up" style="--d:.2s;font-size:1.06rem">${esc(truncate(desc, 210))}</p>` : ''}
          <div class="specs fade-up" style="--d:.26s"><dl>${specs.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl></div>
          ${p.extra.length ? `<div class="prose">${p.extra.map((e) => `<p>${esc(e)}</p>`).join('')}</div>` : ''}
          <div class="pd-actions fade-up" style="--d:.32s">
            <a class="btn btn-primary btn-lg" href="#oferta" data-focus-form>Solicită ofertă ${icon('arrowRight', { cls: 'i-arrow' })}</a>
            ${p.docs.length ? `<a class="btn btn-light btn-lg" href="${p.docs.length === 1 ? attr(docUrl(p.docs[0].url)) : '#documente'}"${p.docs.length === 1 ? ' target="_blank" rel="noopener"' : ''}>${icon('download', { size: 18 })} ${p.docs.length === 1 ? 'Descarcă broșura' : 'Documente'}</a>` : ''}
            ${p.shopUrl ? `<a class="btn btn-ghost btn-lg" href="${attr(p.shopUrl)}" target="_blank" rel="noopener">${icon('bag', { size: 18 })} Magazin online</a>` : ''}
          </div>
          ${p.logos.length ? `<div class="pd-logos">${p.logos.map((l) => l.href ? `<a href="${attr(l.href)}" target="_blank" rel="noopener" aria-label="Site-ul producătorului">${img(l.src, { alt: l.alt || 'Logo producător', sizes: '260px' })}</a>` : `<span>${img(l.src, { alt: l.alt || '', sizes: '260px' })}</span>`).join('')}</div>` : ''}
          <ul class="assurance" role="list">
            <li>${icon('shield')}<span>Distribuitor de echipamente medicale în România din 1990</span></li>
            <li>${icon('award')}<span>Certificat ISO 9001 · ISO 13485 · ISO 14001</span></li>
            <li>${icon('phone')}<span>Consultanță: <a href="${SITE.phone.href}">${SITE.phone.label}</a> · <a href="mailto:${SITE.email}">${SITE.email}</a></span></li>
          </ul>
          ${share(p.url, p.name, p.cover)}
        </div>
      </div>
    </div>
    <nav class="pd-tabs" aria-label="Secțiuni produs" data-tabs>
      <div class="container"><ul>${tabs.map(([id, label, n], i) => `<li><a href="#${id}"${i === 0 ? ' class="is-active"' : ''}>${label}${n ? ` <span class="n">${n}</span>` : ''}</a></li>`).join('')}</ul></div>
    </nav>
    <div class="container">
      <section class="pd-section" id="descriere">
        <div class="pd-section-grid">
          <header><h2>Descriere <em>produs</em></h2><div class="bar"></div></header>
          <div>
            ${hasDesc ? `<div class="prose">${p.description}</div>` : `<div class="desc-empty">${icon('info', { size: 22 })}<p>Pentru specificațiile tehnice complete ${p.docs.length ? 'consultați broșura produsului sau ' : ''}<a href="#oferta" data-focus-form>contactați un specialist TEMCO</a>.</p></div>`}
            ${tagLinks.length ? `<div class="tag-cloud" style="margin-top:28px" aria-label="Etichete">${tagLinks.map((t) => `<a href="${u(t.url)}">${esc(t.name)}</a>`).join('')}</div>` : ''}
          </div>
        </div>
      </section>
      ${p.docs.length ? `
      <section class="pd-section" id="documente">
        <div class="pd-section-grid">
          <header><h2>Documente <em>tehnice</em></h2><p>Broșuri și fișe tehnice ale producătorului.</p><div class="bar"></div></header>
          ${docList(p.docs, p)}
        </div>
      </section>` : ''}
      <section class="pd-section" id="oferta">
        <div class="pd-section-grid">
          <header><h2>Formular <em>contact</em></h2><p>Solicitați o ofertă, o demonstrație sau informații tehnice despre acest produs.</p><div class="bar"></div></header>
          ${contactForm({ product: p, id: 'form-produs', title: 'Solicită ofertă' })}
        </div>
      </section>
    </div>
    ${related.length ? `
    <section class="section is-soft" id="similare">
      <div class="container">
        ${sectionHead({ eyebrow: p.primary ? esc(p.primary.name) : 'Produse', title: 'Produse <em>similare</em>', split: p.primary ? `<a class="btn btn-ghost" href="${u(p.primary.url)}">Vezi categoria ${icon('arrowRight', { cls: 'i-arrow', size: 18 })}</a>` : '' })}
        <ul class="product-grid cols-4">${related.map((r) => productCard(r)).join('')}</ul>
      </div>
    </section>` : ''}
  </div>`;
  const ld = {
    '@context': 'https://schema.org', '@type': 'Product', name: p.name, url: SITE.url + p.url,
    image: p.images.map((s) => SITE.url + '/' + srcOf(s, 1600).replace(/^(\.\.\/)+/, '')),
    description: truncate(desc || p.name, 300), ...(p.model ? { model: p.model, mpn: p.model } : {}),
    ...(p.manufacturer ? { brand: { '@type': 'Brand', name: p.manufacturer } } : {}),
    category: p.chain.map((c) => c.name).join(' > '),
  };
  return page({ path: p.url, title: p.title, description: truncate(desc || `${p.name}${p.model ? ', model ' + p.model : ''}${p.manufacturer ? ', producător ' + p.manufacturer : ''}. Distribuit în România de TEMCO.`, 158), body, heroTheme: 'light', jsonld: [bc.ld, ld], ogImage: p.cover, ogType: 'product', bodyClass: 'is-product' });
}

// ============================================================== TAG
export function tagPage(t) {
  const bc = breadcrumbs([{ name: 'Produse', url: '/produsele-noastre/' }, { name: '#' + t.name, url: t.url }]);
  const body = `
  ${pageHero({ eyebrow: 'Etichetă', title: '#' + esc(t.name), lead: t.products.length ? `${plural(t.products.length, 'produs', 'produse')} cu eticheta „${esc(t.name)}”.` : 'Nu există produse cu această etichetă momentan.', crumbs: bc.html })}
  <section class="section is-tight"><div class="container">
    <h2 class="sr-only">Produse</h2>
    ${t.products.length ? `<ul class="product-grid">${t.products.map((p) => productCard(p)).join('')}</ul>` : `<div class="empty-state"><span class="ico">${icon('tag', { size: 28 })}</span><h3>Nicio potrivire</h3><p>Explorați catalogul complet.</p><a class="btn btn-dark btn-sm" href="${u('/produse/')}">Toate produsele</a></div>`}
  </div></section>`;
  return page({ path: t.url, title: `#${t.name}`, description: `Produse TEMCO etichetate „${t.name}”: ${t.products.map((p) => p.name).slice(0, 4).join(', ')}.`, body, jsonld: [bc.ld], noindex: t.products.length < 2 });
}

// ============================================================== EVENTS
export function eventsPage(path = '/instruire-evenimente/') {
  const bc = breadcrumbs([{ name: 'Instruire / Evenimente', url: '/instruire-evenimente/' }]);
  const years = [...new Set(posts.map((p) => new Date(p.date).getFullYear()))];
  const body = `
  ${pageHero({ eyebrow: 'Formare medicală', title: 'Instruire / Evenimente', lead: 'Cursuri hands-on, congrese și simpozioane susținute de TEMCO alături de OLYMPUS și de partenerii noștri internaționali.', crumbs: bc.html,
    extra: `<div class="hero-stats fade-up" style="--d:.5s"><span class="hero-stat">${icon('calendar')}<b>${posts.length}</b> evenimente</span><span class="hero-stat">${icon('mail')}Înscrieri: <b>cstupu@temco.ro</b></span></div>` })}
  <section class="section is-tight">
    <div class="container">
      <div class="chip-row" role="group" aria-label="Filtrează după an" data-year-filter>
        <button class="chip" type="button" aria-pressed="true" data-year="">Toate <span class="count">${posts.length}</span></button>
        ${years.map((y) => `<button class="chip" type="button" aria-pressed="false" data-year="${y}">${y} <span class="count">${posts.filter((p) => new Date(p.date).getFullYear() === y).length}</span></button>`).join('')}
      </div>
      <h2 class="sr-only">Lista evenimentelor</h2>
      <ul class="event-grid" data-events>${posts.map((p, i) => eventCard(p, { featured: i === 0, i })).join('')}</ul>
    </div>
  </section>
  ${ctaBand({ title: 'Doriți să participați la un curs sau la o demonstrație?', text: 'Pentru înregistrare la evenimentele TEMCO scrieți-ne la cstupu@temco.ro sau sunați la +40 744 552 454.' })}`;
  return page({ path, title: 'Instruire / Evenimente', description: 'Instruire și evenimente TEMCO: Master Class Ureteroscopie Flexibilă, Bucharest Live Endoscopy, ROMURO, Endoscopie Digestivă Cluj-Napoca și altele.', body, jsonld: [bc.ld], noindex: path !== '/instruire-evenimente/' });
}

// ============================================================== ARTICLE
export function articlePage(post, prev, next) {
  const bc = breadcrumbs([{ name: 'Instruire / Evenimente', url: '/instruire-evenimente/' }, { name: post.title, url: post.url }], { light: true });
  const m = mediaInfo(post.featured);
  const wide = m && m.w > m.h * 1.25;
  const gallery = post.images.filter((s) => s !== post.featured);
  const lb = JSON.stringify(post.images.map((s) => ({ src: srcOf(s, 1600), thumb: srcOf(s, 200), alt: post.title })));
  const body = `
  <div class="read-progress" data-read-progress></div>
  <article>
    <header class="article-hero">
      <div class="container">
        ${bc.html}
        <h1 data-split>${esc(post.title)}</h1>
        <div class="article-meta fade-up" style="--d:.3s">
          <span>${icon('calendar')}<time datetime="${post.date}">${roDate(post.date)}</time></span>
          <span>${icon('user')}${esc(post.author)}</span>
          <span>${icon('clock')}${readingTime(post.body)} min de citit</span>
          ${post.images.length ? `<span>${icon('image')}${post.images.length} fotografii</span>` : ''}
        </div>
      </div>
    </header>
    <div class="container" data-gallery-group data-images='${attr(lb)}'>
      ${post.featured ? `<button class="article-cover fade-up${wide ? ' is-wide' : ''}" style="--d:.2s;width:100%" type="button" data-lightbox-index="0" aria-label="Mărește imaginea">
        ${!wide && m ? `<span class="bg" style="background-image:url('${u('/' + m.variants[0].src)}')"></span>` : ''}
        ${img(post.featured, { alt: post.title, sizes: '(max-width:1280px) 92vw, 1200px', eager: true, priority: true })}
      </button>` : ''}
      <div class="article-body">
        <div>
          <div class="prose prose-lg">${post.body.includes('<h3>') ? post.body : post.body.replace(/<(\/?)h4>/g, '<$1h3>')}</div>
          ${post.docs.length ? `<div style="margin-top:32px">${docList(post.docs)}</div>` : ''}
          ${gallery.length ? `
          <h2 class="mini-title" style="margin:48px 0 18px">Galerie foto</h2>
          <div class="masonry">${gallery.map((s) => `<button type="button" data-lightbox-index="${post.images.indexOf(s)}" aria-label="Mărește fotografia">${img(s, { alt: post.title, sizes: '(max-width:860px) 50vw, 300px' })}</button>`).join('')}</div>` : ''}
          <div style="margin-top:40px;padding-top:24px;border-top:1px solid var(--line)">${share(post.url, post.title, post.featured)}</div>
        </div>
        <div class="article-aside">
          <div class="aside-card">
            <h2 class="a-h">Înscrieri și informații</h2>
            <p>Pentru înregistrare la cursurile și evenimentele TEMCO:</p>
            <a class="mail" href="mailto:cstupu@temco.ro">${icon('mail', { size: 17 })}cstupu@temco.ro</a>
            <a class="mail" href="tel:+40744552454">${icon('phone', { size: 17 })}+40 744 552 454</a>
          </div>
          <div class="aside-card">
            <h2 class="a-h">Publicat</h2>
            <p><strong style="color:var(--ink)">${roDate(post.date)}</strong><br>de ${esc(post.author)}</p>
          </div>
          <a class="btn btn-ghost btn-block" href="${u('/instruire-evenimente/')}">${icon('arrowLeft', { size: 18 })} Toate evenimentele</a>
        </div>
      </div>
    </div>
  </article>
  <section class="section is-tight" style="padding-top:0">
    <div class="container">
      <nav class="post-nav" aria-label="Alte evenimente">
        ${prev ? `<a href="${u(prev.url)}"><small>${icon('arrowLeft', { size: 15 })}Eveniment anterior</small><strong>${esc(prev.title)}</strong></a>` : '<span></span>'}
        ${next ? `<a class="next" href="${u(next.url)}"><small>Eveniment următor${icon('arrowRight', { size: 15 })}</small><strong>${esc(next.title)}</strong></a>` : '<span></span>'}
      </nav>
    </div>
  </section>`;
  const ld = { '@context': 'https://schema.org', '@type': 'Article', headline: post.title, datePublished: post.date, dateModified: post.modified, author: { '@type': 'Person', name: post.author }, image: post.featured ? SITE.url + '/' + srcOf(post.featured, 1600).replace(/^(\.\.\/)+/, '') : undefined, publisher: { '@id': SITE.url + '/#organization' } };
  return page({ path: post.url, title: post.title, description: truncate(post.excerpt || post.title, 158), body, heroTheme: 'light', isPost: true, jsonld: [bc.ld, ld], ogImage: post.featured, ogType: 'article' });
}

// ============================================================== CONTACT
export function contactPage() {
  const bc = breadcrumbs([{ name: 'Contact', url: '/contact/' }]);
  const hq = CONTACT.hq;
  const office = (o, i, isHq = false) => `
    <li class="office${isHq ? ' is-hq' : ''}" data-reveal style="--rd:${(i % 2) * 70}">
      <div class="top"><span class="badge ${isHq ? 'is-red' : 'is-blue'}">${icon(isHq ? 'building' : 'pin')}${isHq ? 'Sediu social · ' + o.city : o.city}</span><span class="num" aria-hidden="true" data-n="${isHq ? '' : String(i).padStart(2, '0')}"></span></div>
      <address>${o.lines.join('<br>')}</address>
      ${o.phones.length || o.email ? `<div class="tels">${o.phones.map((p) => `<a href="${CONTACT.tel(p)}">${icon('phone')}${p}</a>`).join('')}${o.email ? `<a href="mailto:${o.email}">${icon('mail')}${o.email}</a>` : ''}</div>` : ''}
      <a class="dir" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.lines.join(', '))}" target="_blank" rel="noopener">${icon('navigation')}Direcții în Google Maps</a>
    </li>`;
  const body = `
  ${pageHero({ eyebrow: 'Suntem aici pentru dumneavoastră', title: 'Contact', lead: 'Sediul social în București și puncte de lucru în Cluj-Napoca, Iași, Constanța și Alexandria — sunați-ne, scrieți-ne sau completați formularul.', crumbs: bc.html,
    extra: `<div class="quick-contact fade-up" style="--d:.5s">
      <a class="qc" href="${SITE.phone.href}"><span class="ico">${icon('phone')}</span><span><small>Telefon / fax</small><strong>021 252 46 50</strong></span></a>
      <a class="qc" href="mailto:${SITE.email}"><span class="ico">${icon('mail')}</span><span><small>Email</small><strong>${SITE.email}</strong></span></a>
      <a class="qc" href="#harta"><span class="ico">${icon('pin')}</span><span><small>Sediu social</small><strong>Str. Călușei nr. 69A, București</strong></span></a>
    </div>` })}
  <section class="section">
    <div class="container contact-layout">
      <div>
        <h2 class="mini-title">Sediu social</h2>
        <ul class="offices" role="list">${office(hq, 0, true)}</ul>
        <h2 class="mini-title" style="margin-top:40px">Sedii secundare / puncte de lucru</h2>
        <ol class="offices" role="list">${CONTACT.branches.map((b, i) => office(b, i + 1)).join('')}</ol>
      </div>
      <div class="sticky">${contactForm({ id: 'formular' })}</div>
    </div>
  </section>
  <section class="section is-tight" id="harta" style="padding-top:0">
    <div class="container">${mapEmbed(hq.map, { title: 'TEMCO — Str. Călușei 69A, București' })}</div>
  </section>`;
  const ld = { '@context': 'https://schema.org', '@type': 'ContactPage', name: 'Contact TEMCO', url: SITE.url + '/contact/' };
  return page({ path: '/contact/', title: 'Contact', description: 'Contact TEMCO: Str. Călușei nr. 69A, sector 2, București · Tel/fax 021/252 46 50 · office@temco.ro · puncte de lucru în Cluj-Napoca, Iași, Constanța, Alexandria.', body, jsonld: [bc.ld, ld] });
}

// ============================================================== LEGAL
export function legalPage(slug) {
  const pg = pages[slug];
  const path = `/${slug}/`;
  const bc = breadcrumbs([{ name: pg.title, url: path }]);
  let n = 0;
  const toc = [];
  const html = pg.body.replace(/<(h2|h3)>(.*?)<\/\1>/g, (_, h, t) => {
    const id = 's-' + (++n) + '-' + fold(stripTags(t)).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
    toc.push({ id, t: stripTags(t), lvl: h === 'h2' ? 2 : 3 });
    return `<${h} id="${id}">${t}</${h}>`;
  });
  // The cookie policy uses plain paragraphs as headings: promote short question-like lines.
  const html2 = toc.length ? html : html.replace(/<p>([^<]{3,60}\??)<\/p>/g, (m, t) => {
    if (!/\?$|^Concluzie$/.test(t.trim())) return m;
    const id = 's-' + (++n) + '-' + fold(t).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    toc.push({ id, t: t.trim(), lvl: 2 });
    return `<h2 id="${id}">${t.trim()}</h2>`;
  });
  const body = `
  ${pageHero({ eyebrow: 'Informații legale', title: esc(pg.title), crumbs: bc.html })}
  <section class="section">
    <div class="container legal">
      <nav class="toc" aria-label="Cuprins" data-toc>${toc.length ? `<h2 class="t-h">Cuprins</h2><ol>${toc.map((x) => `<li class="lvl-${x.lvl}"><a href="#${x.id}">${esc(x.t)}</a></li>`).join('')}</ol>` : ''}</nav>
      <div>
        <span class="updated">${icon('clock', { size: 15 })}Ultima actualizare: ${roDate(pg.modified)}</span>
        <div class="prose">${html2}</div>
      </div>
    </div>
  </section>`;
  return page({ path, title: pg.title, description: truncate(stripTags(pg.body), 158), body, jsonld: [bc.ld] });
}

// ============================================================== SEARCH
export function searchPage() {
  const bc = breadcrumbs([{ name: 'Căutare', url: '/cautare/' }]);
  const body = `
  ${pageHero({ eyebrow: 'Căutare', title: 'Rezultatele căutării', crumbs: bc.html,
    extra: `<form class="hero-search-form fade-up" style="--d:.3s" role="search" action="" data-search-page-form><label class="field-search" style="max-width:640px;margin-top:26px">${icon('search', { size: 18 })}<span class="sr-only">Caută</span><input type="search" name="q" placeholder="Caută produse, modele, producători…" autocomplete="off" data-search-page-input></label></form>` })}
  <section class="section is-tight">
    <div class="container" data-search-page>
      <p class="result-count" style="margin:0 0 18px" data-search-summary></p>
      <div data-search-cats></div>
      <h2 class="sr-only">Produse găsite</h2>
      <ul class="product-grid" data-search-products></ul>
      <div data-search-posts style="margin-top:40px"></div>
    </div>
  </section>`;
  return page({ path: '/cautare/', title: 'Căutare', description: 'Caută în catalogul TEMCO.', body, noindex: true });
}

// ============================================================== 404 + redirects
export function notFound() {
  const body = `
  <section class="nf">
    ${arcs()}
    <div>
      <div class="big">404</div>
      <h1>Pagina nu a fost găsită</h1>
      <p>Este posibil ca adresa să se fi schimbat odată cu noul site. Căutați produsul dorit sau reveniți la pagina principală.</p>
      <div class="actions">
        <button class="btn btn-primary" type="button" data-search-open>${icon('search', { size: 18 })} Caută un produs</button>
        <a class="btn btn-glass" href="${u('/')}">Pagina principală</a>
      </div>
    </div>
  </section>`;
  return page({ path: '/404.html', title: 'Pagina nu a fost găsită', body, noindex: true });
}

export function redirect(path, to, title = 'Redirecționare') {
  // Static redirect that also maps old query-string URLs (?wpvcategorieprodus=slug).
  const map = JSON.stringify(Object.fromEntries(categories.map((c) => [c.slug, c.url.slice(1)])));
  const depth = path.split('/').filter(Boolean).length;
  const root = depth ? '../'.repeat(depth) : './';
  return `<!doctype html><html lang="ro"><head><meta charset="utf-8"><title>${esc(title)} — TEMCO</title>
<meta name="robots" content="noindex"><link rel="canonical" href="${SITE.url}${to}">
<script>(function(){var r=${JSON.stringify(root)},m=${map},q=new URLSearchParams(location.search),c=q.get('wpvcategorieprodus');location.replace(r+(c&&m[c]?m[c]:${JSON.stringify(to.slice(1))}));})();</script>
<meta http-equiv="refresh" content="0; url=${root}${to.slice(1)}">
</head><body><p>Pagina s-a mutat: <a href="${root}${to.slice(1)}">${esc(title)}</a></p></body></html>`;
}
