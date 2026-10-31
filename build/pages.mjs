import { esc, attr, u, img, srcOf, roDate, truncate, plural, mediaInfo, stripTags, fold, docUrl, fileSize } from './lib.mjs';
import { icon } from './icons.mjs';
import { SITE, HOME, ABOUT, CONTACT } from './content.mjs';
import { page, mapEmbed } from './layout.mjs';
import { sectionHead, more, pageHead, breadcrumbLd, tile, productCard, eventCard, docList, contactForm, catalog } from './components.mjs';
import { products, categories, topCategories, tagById, posts, pages, siteAssets, ancestors, manufacturers, manufacturerCounts } from './data.mjs';

const brandCount = manufacturers.length;
const itemList = (items) => ({ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: items.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE.url + p.url, name: p.name })) });
const flat = (path) => (path || '').replace(/^(\.\.\/)+/, '');

// ============================================================== shared: mosaic + interactive list
const MOSAIC_ORDER = ['stomatologie', 'endoscopie', 'microscopie', 'diagnostic', 'ati-sala-operatie', 'orl', 'imagistica', 'laborator-morga', 'chirurgie-laparoscopica', 'simulatoare-medicale-realitate-virtuala', 'periferice-medicale', 'terapie'];
const countLabel = (c) => plural(c.count, 'produs', 'produse');
function mosaic() {
  const doms = MOSAIC_ORDER.map((sl) => topCategories.find((c) => c.slug === sl)).filter(Boolean);
  return `<ul class="bento">${doms.map((c, i) => `
    <li class="${i === 0 ? 'b-xl' : i === 1 ? 'b-wide' : ''}" data-reveal style="--rd:${(i % 4) * 50}"><a class="b-card" href="${u(c.url)}">${c.image ? img(c.image, { alt: '', sizes: i < 2 ? '(max-width:720px) 100vw, 640px' : '(max-width:720px) 50vw, 320px' }) : ''}
      <span class="b-go">${icon('arrowUpRight', { size: 18 })}</span>
      <span class="b-txt"><strong>${esc(c.name)}</strong><span>${countLabel(c)}</span></span></a></li>`).join('')}</ul>
  <a class="explore" href="${u('/produsele-noastre/')}" data-reveal>
    <span><strong>Explorează toate produsele</strong><span>${products.length} de produse · ${topCategories.length} domenii · ${brandCount} de producători</span></span>
    <span class="go">${icon('arrowRight', { size: 22 })}</span>
  </a>`;
}
function domainList() {
  return `
    <div class="dlist" data-dlist>
      <ol>${topCategories.map((c, i) => `
        <li><a href="${u(c.url)}" data-i="${i}"><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="thumb">${c.image ? img(c.image, { alt: '', sizes: '64px' }) : ''}</span><strong>${esc(c.name)}</strong><span class="c">${c.count}</span>${icon('arrowRight', { size: 22 })}</a></li>`).join('')}</ol>
      <div class="dlist-preview" aria-hidden="true">${topCategories.map((c, i) => `<div class="${i === 0 ? 'is-on' : ''}">${c.image ? img(c.image, { alt: '', sizes: '520px' }) : ''}</div>`).join('')}</div>
    </div>`;
}

// ============================================================== HOME
export function home() {
  const slides = HOME.slides.map((s, i) => `
    <figure class="hero-slide${i === 0 ? ' is-active' : ''}" data-slide>${img(s, { alt: i === 0 ? 'Sală de endoscopie echipată cu tehnologie OLYMPUS' : 'Ilustrație a rețelei neuronale', sizes: '100vw', eager: i === 0, priority: i === 0 })}</figure>`).join('');
  const brands = manufacturers.filter((m) => manufacturerCounts[m] >= 2)
    .map((m) => `<a href="${u('/produse/')}?producator=${encodeURIComponent(m)}">${esc(m)}</a>`).join('');
  const heroM = mediaInfo(HOME.slides[0]);
  const preload = heroM ? `<link rel="preload" as="image" imagesrcset="${heroM.variants.map((v) => `${u('/' + v.src)} ${v.w}w`).join(', ')}" imagesizes="100vw" fetchpriority="high">` : '';

  const body = `
  <section class="hero" data-hero aria-label="TEMCO">
    ${slides}
    <div class="container hero-inner">
      <div>
        <h1 class="display fade-up">Tehnologie medicală de referință.</h1>
        <p class="sub fade-up" style="--d:.12s">Din 1990, pentru medicii din toată România.</p>
        <div class="hero-cta fade-up" style="--d:.22s">
          <a class="btn btn-primary" href="${u('/produsele-noastre/')}">Descoperă produsele ${icon('arrowRight', { cls: 'i-arrow', size: 18 })}</a>
          <a class="hero-contact" href="${SITE.phone.href}">${icon('phone', { size: 17 })}${SITE.phone.label}</a>
          <a class="hero-contact" href="mailto:${SITE.email}">${icon('mail', { size: 17 })}${SITE.email}</a>
        </div>
      </div>
      <div class="hero-progress fade-up" style="--d:.3s">
        <span><b data-hero-current>01</b> / 0${HOME.slides.length}</span>
        ${HOME.slides.map((_, i) => `<button class="hero-dot${i === 0 ? ' is-active' : ''}" type="button" aria-label="Imaginea ${i + 1}" data-dot="${i}"><span></span></button>`).join('')}
      </div>
      <ul class="hero-values" aria-label="Valorile TEMCO">${HOME.values.map((v, i) => `
        <li class="fade-up" style="--d:${0.36 + i * 0.08}s"><span class="ico">${icon(v.icon, { size: 18 })}</span><div><strong>${v.title}</strong><span>${v.text}</span></div></li>`).join('')}
      </ul>
    </div>
    <div class="hero-brands fade-up" style="--d:.6s" aria-label="Producători reprezentați">
      <div class="marquee" style="--dur:80s"><div class="marquee-track">${brands}<span aria-hidden="true" style="display:contents">${brands.replace(/<a /g, '<a tabindex="-1" ')}</span></div></div>
    </div>
  </section>

  <section class="section" style="padding-top:0">
    <div class="container">
      ${sectionHead('Produse', more('/produsele-noastre/', 'Explorează toate'))}
      ${mosaic()}
    </div>
  </section>

  <section class="section" style="padding-top:0">
    <div class="container numbers" data-reveal>
      <div><b data-count-to="1990" data-count-from="1960">1990</b><span>Anul înființării</span></div>
      <div><b><span data-count-to="80">80</span>+</b><span>Specialiști</span></div>
      <div><b data-count-to="${products.length}">${products.length}</b><span>Produse</span></div>
      <div><b data-count-to="${brandCount}">${brandCount}</b><span>Producători</span></div>
    </div>
  </section>

  <section class="section on-dark">
    <div class="container">
      ${sectionHead('Premiere în România', more('/despre-noi/', 'Povestea noastră'))}
      <ul class="firsts">${ABOUT.milestones.map((m, i) => `<li data-reveal style="--rd:${i * 70}"><b>${m.year}</b><span>${m.short}</span></li>`).join('')}</ul>
    </div>
  </section>

  <section class="section">
    <div class="container">
      ${sectionHead('Evenimente', more('/instruire-evenimente/', 'Toate'))}
      <ul class="events">${posts.slice(0, 3).map(eventCard).join('')}</ul>
    </div>
  </section>`;

  return page({ path: '/', head: preload, heroTheme: 'dark', title: '', description: 'Când vorbim despre sănătate, TEMCO pune întotdeauna oamenii pe primul loc. Aparatură medicală de referință pentru toată România, din 1990.', body, ogImage: HOME.slides[0],
    jsonld: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Temco', url: SITE.url + '/', potentialAction: { '@type': 'SearchAction', target: SITE.url + '/cautare/?q={search_term_string}', 'query-input': 'required name=search_term_string' } }] });
}

// ============================================================== ABOUT
export function about() {
  const pdf = siteAssets.despre.brochurePdf;
  const body = `
  ${pageHead({ title: 'Despre noi', sub: 'Din 1990, alături de medicii din România.' })}
  <section class="section" style="padding-top:0">
    <div class="container"><p class="lead-xl" data-reveal>${ABOUT.lead}</p></div>
  </section>
  <section class="section" style="padding-top:0">
    <div class="container">
      ${sectionHead('Premiere')}
      <ol class="timeline">${ABOUT.milestones.map((m) => `
        <li class="tl-item" data-reveal><span class="yr">${m.year}</span><div><h3>${m.title}</h3><p>${m.text}</p></div></li>`).join('')}
      </ol>
    </div>
  </section>
  <section class="section is-soft" id="certificari">
    <div class="container">
      ${sectionHead('Certificări ISO')}
      <ul class="certs">${siteAssets.despre.iso.map((src, i) => `
        <li data-reveal style="--rd:${i * 70}"><button class="cert" type="button" data-lightbox="iso" data-src="${attr(srcOf(src, 1600))}" data-alt="${attr('Certificat ' + ABOUT.iso[i])}">
          <span class="paper">${img(src, { alt: 'Certificat ' + ABOUT.iso[i], sizes: '(max-width:720px) 70vw, 380px' })}</span><span>${ABOUT.iso[i]}</span>
        </button></li>`).join('')}
      </ul>
    </div>
  </section>
  <section class="section" id="brosura">
    <div class="container brochure" data-reveal>
      <a class="cover" href="${attr(docUrl(pdf))}" target="_blank" rel="noopener" aria-label="Broșura TEMCO (PDF)">${img(siteAssets.despre.brochureCover, { alt: 'Coperta broșurii TEMCO', sizes: '160px' })}</a>
      <div>
        <h2 class="h2">Broșura TEMCO</h2>
        <p>PDF${fileSize(pdf) ? ' · ' + fileSize(pdf) : ''}</p>
        <a class="btn btn-dark" href="${attr(docUrl(pdf))}" target="_blank" rel="noopener">Descarcă ${icon('download', { size: 18 })}</a>
      </div>
    </div>
  </section>`;
  return page({ path: '/despre-noi/', title: 'Despre noi', description: stripTags(ABOUT.lead), body, jsonld: [breadcrumbLd([{ name: 'Despre noi', url: '/despre-noi/' }])], ogImage: HOME.slides[1] });
}

// ============================================================== PRODUCTS HUB
export function productsHub() {
  const body = `
  ${pageHead({ title: 'Produse', sub: `${products.length} de produse în ${topCategories.length} domenii.`,
    extra: `<button class="head-search fade-up" style="--d:.2s" type="button" data-search-open>${icon('search', { size: 20 })}<span>Caută un produs</span></button>` })}
  <section class="section" style="padding-top:0">
    <div class="container">
      <h2 class="sr-only">Domenii</h2>
      ${domainList()}
      <a class="explore" href="${u('/produse/')}" style="margin-top:48px">
        <span><strong>Toate produsele</strong><span>Catalogul complet, cu filtre după domeniu și producător</span></span>
        <span class="go">${icon('arrowRight', { size: 22 })}</span>
      </a>
    </div>
  </section>
  <script>
  // Old addresses /produsele-noastre/?taxonomy_id=13 keep working
  (function(){var q=new URLSearchParams(location.search),id=q.get('taxonomy_id');var m=${JSON.stringify(Object.fromEntries(categories.map((c) => [c.id, c.url.slice(1)])))};if(id&&m[id])location.replace(document.documentElement.dataset.root+m[id]);})();
  </script>`;
  return page({ path: '/produsele-noastre/', title: 'Produse', description: `Catalogul TEMCO: ${products.length} de produse medicale. ${topCategories.map((c) => c.name).join(', ')}.`, body, jsonld: [breadcrumbLd([{ name: 'Produse', url: '/produsele-noastre/' }])] });
}

// ============================================================== ALL PRODUCTS
export function allProducts() {
  const body = `
  ${pageHead({ title: 'Toate produsele', back: { name: 'Produse', url: '/produsele-noastre/' } })}
  <section class="section" style="padding-top:0">
    <div class="container">${catalog({ items: products, chips: topCategories.filter((c) => c.count) })}</div>
  </section>`;
  return page({ path: '/produse/', title: 'Toate produsele', description: `Catalogul complet TEMCO: ${products.length} de produse medicale.`, body, jsonld: [breadcrumbLd([{ name: 'Produse', url: '/produsele-noastre/' }, { name: 'Toate produsele', url: '/produse/' }]), itemList(products.slice(0, 50))] });
}

// ============================================================== CATEGORY
export function categoryPage(c) {
  const chain = ancestors(c);
  const parent = chain.length > 1 ? chain[chain.length - 2] : { name: 'Produse', url: '/produsele-noastre/' };
  const sub = c.description || (c.count ? plural(c.count, 'produs', 'produse') : '');
  const isPhoto = c.image && /grid-product|laborator-morga|bnr_|scan-r|abbelight|65cc6d7b|Capture/.test(c.image);
  const media = c.image ? img(c.image, { alt: c.name, sizes: '(max-width:1080px) 90vw, 520px', eager: true, priority: true }) : '';
  const content = c.count
    ? catalog({ items: c.products, chips: c.children.filter((k) => k.count) })
    : `<div class="empty-state"><h2>Disponibil la cerere</h2><p>Contactați-ne pentru echipamentele din această categorie.</p><a class="btn btn-primary" href="${u('/contact/')}#formular">Solicită informații</a></div>`;
  const body = `
  ${pageHead({ title: esc(c.name), sub: esc(sub), back: parent, media, mediaProduct: c.image && !isPhoto })}
  <section class="section" style="padding-top:0"><div class="container">${content}</div></section>`;
  const crumbs = [{ name: 'Produse', url: '/produsele-noastre/' }, ...chain.map((x) => ({ name: x.name, url: x.url }))];
  return page({ path: c.url, title: c.name, description: truncate(`${c.name}. ${sub}. ${c.products.slice(0, 4).map((p) => p.name).join(', ')}`, 158), body, jsonld: [breadcrumbLd(crumbs), itemList(c.products)], ogImage: c.image });
}

// ============================================================== PRODUCT
export function productPage(p, related) {
  const imgs = p.images;
  const slides = imgs.map((s, i) => `<div class="stage-slide${i === 0 ? ' is-active' : ''}">${img(s, { alt: `${p.name}${imgs.length > 1 ? `, imaginea ${i + 1}` : ''}`, sizes: '(max-width:1080px) 92vw, 640px', eager: i === 0, priority: i === 0 })}</div>`).join('');
  const lbData = JSON.stringify(imgs.map((s) => ({ src: srcOf(s, 1600), thumb: srcOf(s, 200), alt: p.name })));
  const desc = stripTags(p.description);
  const tagLinks = p.tags.map((id) => tagById.get(id)).filter(Boolean);
  const tagsHtml = tagLinks.length ? `<p class="tags">${tagLinks.map((t) => `<a href="${u(t.url)}">#${esc(t.name)}</a>`).join('')}</p>` : '';
  const back = p.primary ? { name: p.primary.name, url: p.primary.url } : { name: 'Toate produsele', url: '/produse/' };
  const kv = [
    p.model && ['Model', esc(p.model)],
    p.manufacturer && ['Producător', p.manufacturerUrl ? `<a href="${attr(p.manufacturerUrl)}" target="_blank" rel="noopener">${esc(p.manufacturer)}</a>` : esc(p.manufacturer)],
    p.primary && ['Categorie', `<a href="${u(p.primary.url)}">${esc(p.primary.name)}</a>`],
  ].filter(Boolean);
  const oneDoc = p.docs.length === 1;
  const sections = [];
  if (desc) sections.push(['descriere', 'Descriere', `<div class="prose">${p.description}</div>`]);
  if (p.docs.length) sections.push(['documente', 'Documente', docList(p.docs, p)]);
  sections.push(['oferta', 'Solicită ofertă', contactForm({ product: p, id: 'form-produs' })]);
  if (tagsHtml) sections[0][2] += tagsHtml;

  const body = `
  <div class="pd">
    <div class="container">
      <a class="back-link" href="${u(back.url)}">${icon('arrowLeft', { size: 16 })}${esc(back.name)}</a>
      <div class="pd-top">
        <div class="gallery" data-gallery data-images='${attr(lbData)}'>
          <div class="stage" data-stage tabindex="0" aria-label="Imagine produs, click pentru mărire">
            <div class="stage-track" data-track>${slides || `<div class="stage-slide is-active">${icon('image', { size: 56 })}</div>`}</div>
            ${imgs.length > 1 ? `<button class="stage-nav prev" type="button" data-prev aria-label="Imaginea anterioară">${icon('chevronLeft')}</button><button class="stage-nav next" type="button" data-next aria-label="Imaginea următoare">${icon('chevronRight')}</button>` : ''}
            ${imgs.length ? `<button class="stage-expand" type="button" data-open-lightbox aria-label="Mărește imaginea">${icon('expand', { size: 17 })}</button>` : ''}
          </div>
          ${imgs.length > 1 ? `<div class="thumbs">${imgs.map((s, i) => `<button type="button" aria-current="${i === 0}" aria-label="Imaginea ${i + 1}" data-thumb="${i}">${img(s, { alt: '', sizes: '72px' })}</button>`).join('')}</div>` : ''}
        </div>
        <div class="pd-info">
          ${p.manufacturer ? `<p class="label fade-up">${esc(p.manufacturer)}</p>` : ''}
          <h1 class="fade-up" style="--d:.06s">${esc(p.name)}</h1>
          ${kv.length ? `<dl class="kv fade-up" style="--d:.12s">${kv.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>` : ''}
          ${p.extra.length ? `<div class="prose" style="margin-top:20px">${p.extra.map((e) => `<p>${esc(e)}</p>`).join('')}</div>` : ''}
          <div class="pd-actions fade-up" style="--d:.18s">
            <a class="btn btn-primary" href="#oferta" data-focus-form>Solicită ofertă ${icon('arrowRight', { cls: 'i-arrow', size: 18 })}</a>
            ${p.docs.length ? `<a class="text-link" href="${oneDoc ? attr(docUrl(p.docs[0].url)) : '#documente'}"${oneDoc ? ' target="_blank" rel="noopener"' : ''}>${oneDoc ? 'Broșură PDF' : 'Documente'} ${icon(oneDoc ? 'download' : 'arrowRight', { size: 17 })}</a>` : ''}
          </div>
          <div class="pd-links">
            ${p.shopUrl ? `<a href="${attr(p.shopUrl)}" target="_blank" rel="noopener">${icon('bag')}Magazin online</a>` : ''}
            <button type="button" data-share="${attr(SITE.url + p.url)}" data-share-title="${attr(p.name)}">${icon('share')}Distribuie</button>
          </div>
          ${p.logos.length ? `<div class="pd-logos">${p.logos.map((l) => l.href ? `<a href="${attr(l.href)}" target="_blank" rel="noopener" aria-label="Site-ul producătorului">${img(l.src, { alt: l.alt || 'Logo producător', sizes: '240px' })}</a>` : img(l.src, { alt: l.alt || '', sizes: '240px' })).join('')}</div>` : ''}
        </div>
      </div>
    </div>
    <div class="container" style="margin-top:clamp(64px,8vw,120px)">
      ${sections.map(([id, title, html]) => `
      <section class="pd-section" id="${id}"><div class="pd-section-grid"><h2>${title}</h2><div>${html}</div></div></section>`).join('')}
    </div>
    ${related.length ? `
    <section class="section is-soft">
      <div class="container">
        ${sectionHead('Produse similare', p.primary ? more(p.primary.url, esc(p.primary.name)) : '')}
        <ul class="grid">${related.map((r) => productCard(r)).join('')}</ul>
      </div>
    </section>` : ''}
  </div>`;
  const crumbs = [{ name: 'Produse', url: '/produsele-noastre/' }, ...p.chain.map((x) => ({ name: x.name, url: x.url })), { name: p.name, url: p.url }];
  const ld = {
    '@context': 'https://schema.org', '@type': 'Product', name: p.name, url: SITE.url + p.url,
    image: imgs.map((s) => SITE.url + '/' + flat(srcOf(s, 1600))),
    description: truncate(desc || p.name, 300), ...(p.model ? { model: p.model, mpn: p.model } : {}),
    ...(p.manufacturer ? { brand: { '@type': 'Brand', name: p.manufacturer } } : {}),
    category: p.chain.map((c) => c.name).join(' > '),
  };
  return page({ path: p.url, title: p.title, description: truncate(desc || `${p.name}${p.model ? ', model ' + p.model : ''}${p.manufacturer ? ', producător ' + p.manufacturer : ''}. Distribuit în România de TEMCO.`, 158), body, jsonld: [breadcrumbLd(crumbs), ld], ogImage: p.cover, ogType: 'product' });
}

// ============================================================== TAG
export function tagPage(t) {
  const body = `
  ${pageHead({ title: '#' + esc(t.name), sub: t.products.length ? plural(t.products.length, 'produs', 'produse') : '', back: { name: 'Produse', url: '/produsele-noastre/' } })}
  <section class="section" style="padding-top:0"><div class="container">
    <h2 class="sr-only">Produse</h2>
    ${t.products.length ? `<ul class="grid">${t.products.map((p) => productCard(p)).join('')}</ul>` : `<div class="empty-state"><h2>Niciun produs</h2>${more('/produse/', 'Toate produsele')}</div>`}
  </div></section>`;
  return page({ path: t.url, title: `#${t.name}`, description: `Produse TEMCO: ${t.products.map((p) => p.name).slice(0, 4).join(', ')}.`, body, jsonld: [breadcrumbLd([{ name: 'Produse', url: '/produsele-noastre/' }, { name: '#' + t.name, url: t.url }])], noindex: t.products.length < 2 });
}

// ============================================================== EVENTS
export function eventsPage(path = '/instruire-evenimente/') {
  const years = [...new Set(posts.map((p) => new Date(p.date).getFullYear()))];
  const body = `
  ${pageHead({ title: 'Instruire / Evenimente' })}
  <section class="section" style="padding-top:0">
    <div class="container">
      <div class="chip-row" role="group" aria-label="An" data-year-filter>
        <button class="chip" type="button" aria-pressed="true" data-year="">Toate</button>
        ${years.map((y) => `<button class="chip" type="button" aria-pressed="false" data-year="${y}">${y}</button>`).join('')}
      </div>
      <h2 class="sr-only">Evenimente</h2>
      <ul class="events" data-events>${posts.map(eventCard).join('')}</ul>
    </div>
  </section>`;
  return page({ path, title: 'Instruire / Evenimente', description: 'Instruire și evenimente TEMCO: cursuri, congrese și workshop-uri de endoscopie, urologie și ORL.', body, jsonld: [breadcrumbLd([{ name: 'Instruire / Evenimente', url: '/instruire-evenimente/' }])], noindex: path !== '/instruire-evenimente/' });
}

// ============================================================== ARTICLE
export function articlePage(post, prev, next) {
  const m = mediaInfo(post.featured);
  const wide = m && m.w > m.h * 1.25;
  const gallery = post.images.filter((s) => s !== post.featured);
  const lb = JSON.stringify(post.images.map((s) => ({ src: srcOf(s, 1600), thumb: srcOf(s, 200), alt: post.title })));
  const bodyHtml = post.body.includes('<h3>') ? post.body : post.body.replace(/<(\/?)h4>/g, '<$1h3>');
  const body = `
  <article>
    <header class="article-head container narrow">
      <a class="back-link" href="${u('/instruire-evenimente/')}">${icon('arrowLeft', { size: 16 })}Instruire / Evenimente</a>
      <time datetime="${post.date}">${roDate(post.date)}</time>
      <h1 class="fade-up">${esc(post.title)}</h1>
    </header>
    <div class="container" data-gallery-group data-images='${attr(lb)}'>
      ${post.featured ? `<button class="article-cover fade-up${wide ? ' is-wide' : ''}" style="--d:.1s" type="button" data-lightbox-index="0" aria-label="Mărește imaginea">
        ${!wide && m ? `<span class="bg" style="background-image:url('${u('/' + m.variants[0].src)}')"></span>` : ''}
        ${img(post.featured, { alt: post.title, sizes: '(max-width:1240px) 92vw, 1200px', eager: true, priority: true })}
      </button>` : ''}
      <div class="article-body narrow" style="margin-inline:auto;padding-inline:0">
        <div class="prose">${bodyHtml}</div>
        ${post.docs.length ? `<div style="margin-top:36px">${docList(post.docs)}</div>` : ''}
        ${gallery.length ? `<div class="masonry">${gallery.map((s) => `<button type="button" data-lightbox-index="${post.images.indexOf(s)}" aria-label="Mărește fotografia">${img(s, { alt: post.title, sizes: '(max-width:720px) 50vw, 260px' })}</button>`).join('')}</div>` : ''}
      </div>
    </div>
  </article>
  <div class="container narrow">
    <nav class="post-nav" aria-label="Alte evenimente">
      ${prev ? `<a href="${u(prev.url)}"><small>Anterior</small><strong>${esc(prev.title)}</strong></a>` : '<span></span>'}
      ${next ? `<a class="next" href="${u(next.url)}"><small>Următor</small><strong>${esc(next.title)}</strong></a>` : '<span></span>'}
    </nav>
  </div>`;
  const ld = { '@context': 'https://schema.org', '@type': 'Article', headline: post.title, datePublished: post.date, dateModified: post.modified, author: { '@type': 'Person', name: post.author }, image: post.featured ? SITE.url + '/' + flat(srcOf(post.featured, 1600)) : undefined, publisher: { '@id': SITE.url + '/#organization' } };
  return page({ path: post.url, title: post.title, description: truncate(post.excerpt || post.title, 158), body, isPost: true, jsonld: [breadcrumbLd([{ name: 'Instruire / Evenimente', url: '/instruire-evenimente/' }, { name: post.title, url: post.url }]), ld], ogImage: post.featured, ogType: 'article' });
}

// ============================================================== CONTACT
export function contactPage() {
  const hq = CONTACT.hq;
  const body = `
  ${pageHead({ title: 'Contact' })}
  <section class="section" style="padding-top:0">
    <div class="container contact-grid">
      <div>
        <div class="hq">
          <p class="label">Sediu social</p>
          <address>${hq.lines.join('<br>')}</address>
          <div class="lines">
            ${hq.phones.map((p) => `<a href="${CONTACT.tel(p)}">${p}</a>`).join('')}
            <a href="mailto:${hq.email}">${hq.email}</a>
          </div>
        </div>
        <p class="label" style="margin-top:72px">Sedii secundare / puncte de lucru</p>
        <ul class="branches">${CONTACT.branches.map((b) => `
          <li><strong>${b.city}</strong>${b.lines.join('<br>')}${b.phones.length ? '<br>' + b.phones.map((p) => `<a href="${CONTACT.tel(p)}">${p}</a>`).join(', ') : ''}</li>`).join('')}
        </ul>
      </div>
      <div class="form-wrap" id="formular">
        <h2 class="h2" style="margin-bottom:28px">Formular contact</h2>
        ${contactForm({ id: 'form-contact' })}
      </div>
    </div>
  </section>
  <section class="section" style="padding-top:0" id="harta">
    <div class="container">${mapEmbed(hq.map, 'TEMCO, Str. Călușei 69A, București')}</div>
  </section>`;
  return page({ path: '/contact/', title: 'Contact', description: 'Contact TEMCO: Str. Călușei nr. 69A, sector 2, București. Tel/fax 021/252 46 50, office@temco.ro. Puncte de lucru în Cluj-Napoca, Iași, Constanța, Alexandria.', body, jsonld: [breadcrumbLd([{ name: 'Contact', url: '/contact/' }]), { '@context': 'https://schema.org', '@type': 'ContactPage', name: 'Contact TEMCO', url: SITE.url + '/contact/' }] });
}

// ============================================================== LEGAL
export function legalPage(slug) {
  const pg = pages[slug];
  const path = `/${slug}/`;
  let n = 0;
  const toc = [];
  const slugify = (t) => fold(stripTags(t)).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  let html = pg.body.replace(/<(h2|h3)>(.*?)<\/\1>/g, (_, h, t) => {
    const id = 's-' + (++n) + '-' + slugify(t);
    toc.push({ id, t: stripTags(t), lvl: h === 'h2' ? 2 : 3 });
    return `<${h} id="${id}">${t}</${h}>`;
  });
  if (!toc.length) html = html.replace(/<p>([^<]{3,60}\??)<\/p>/g, (m, t) => {
    if (!/\?$|^Concluzie$/.test(t.trim())) return m;
    const id = 's-' + (++n) + '-' + slugify(t);
    toc.push({ id, t: t.trim(), lvl: 2 });
    return `<h2 id="${id}">${t.trim()}</h2>`;
  });
  const body = `
  ${pageHead({ title: esc(pg.title), sub: `Actualizat ${roDate(pg.modified)}` })}
  <section class="section" style="padding-top:0">
    <div class="container legal">
      <nav class="toc" aria-label="Cuprins" data-toc>${toc.length ? `<h2 class="t-h">Cuprins</h2><ol>${toc.map((x) => `<li class="lvl-${x.lvl}"><a href="#${x.id}">${esc(x.t)}</a></li>`).join('')}</ol>` : ''}</nav>
      <div class="prose">${html}</div>
    </div>
  </section>`;
  return page({ path, title: pg.title, description: truncate(stripTags(pg.body), 158), body, jsonld: [breadcrumbLd([{ name: pg.title, url: path }])] });
}

// ============================================================== SEARCH
export function searchPage() {
  const body = `
  ${pageHead({ title: 'Căutare', extra: `<form role="search" action="" style="margin-top:32px"><label class="field-search" style="max-width:560px">${icon('search', { size: 18 })}<span class="sr-only">Caută</span><input type="search" name="q" placeholder="Caută produse, modele, producători" autocomplete="off" data-search-page-input></label></form>` })}
  <section class="section" style="padding-top:0">
    <div class="container" data-search-page>
      <p class="result-count" style="margin:0 0 28px" data-search-summary></p>
      <div data-search-cats></div>
      <h2 class="sr-only">Produse găsite</h2>
      <ul class="grid" data-search-products></ul>
      <div data-search-posts style="margin-top:56px"></div>
    </div>
  </section>`;
  return page({ path: '/cautare/', title: 'Căutare', description: 'Caută în catalogul TEMCO.', body, noindex: true });
}

// ============================================================== 404 + redirects
export function notFound() {
  const body = `
  <section class="nf">
    <div>
      <div class="big">404</div>
      <h1 class="h2" style="margin-top:12px">Pagina nu a fost găsită</h1>
      <p>Adresa s-a schimbat sau nu mai există.</p>
      <div class="actions">
        <button class="btn btn-dark" type="button" data-search-open>${icon('search', { size: 18 })} Caută un produs</button>
        <a class="btn btn-line" href="${u('/')}">Pagina principală</a>
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
  return `<!doctype html><html lang="ro"><head><meta charset="utf-8"><title>${esc(title)} | TEMCO</title>
<meta name="robots" content="noindex"><link rel="canonical" href="${SITE.url}${to}">
<script>(function(){var r=${JSON.stringify(root)},m=${map},q=new URLSearchParams(location.search),c=q.get('wpvcategorieprodus');location.replace(r+(c&&m[c]?m[c]:${JSON.stringify(to.slice(1))}));})();</script>
<meta http-equiv="refresh" content="0; url=${root}${to.slice(1)}">
</head><body><p>Pagina s-a mutat: <a href="${root}${to.slice(1)}">${esc(title)}</a></p></body></html>`;
}
