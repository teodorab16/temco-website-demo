# TEMCO, website nou (înlocuitor pentru www.temco.ro)

Site static, rapid și modern pentru **TEMCO, Tehno Electro Medical Company**.
Păstrează **tot conținutul** site-ului actual (WordPress) și **aceleași adrese URL**, cu un design nou, animații și o experiență de navigare mult îmbunătățită.

## Ce conține

| Secțiune | Adresă | Conținut |
|---|---|---|
| Acasă | `/` | slider, valorile TEMCO, cele 12 domenii, despre noi + cifre, premiere, producători, evenimente |
| Despre noi | `/despre-noi/` | istoric (cronologie animată), broșura TEMCO (PDF), certificatele ISO 9001 / 13485 / 14001 |
| Produse | `/produsele-noastre/` | domenii, index complet al categoriilor, filtrare după producător |
| Toate produsele | `/produse/` | catalog filtrabil (căutare, domeniu, producător, sortare) - 315 produse |
| Categorii | `/categorie-produs/…/` | toate cele 53 de categorii, cu subcategorii și filtre |
| Produs | `/produse/<slug>/` | galerie cu zoom și lightbox, specificații, descriere, broșuri PDF, magazin online, formular de ofertă, produse similare |
| Etichete | `/tag/<slug>/` | toate cele 123 de etichete |
| Instruire / Evenimente | `/instruire-evenimente/` + `/<articol>/` | cele 10 articole, cu galerii foto |
| Contact | `/contact/` | sediu social + 7 puncte de lucru, formular, hartă |
| Legal | `/politica-de-confidentialitate/`, `/politica-cookies/` | cu cuprins automat |
| Căutare | `/cautare/?q=` + paleta ⌘K / Ctrl K | caută în produse, modele, producători, categorii, articole |

Toate cele 505 adrese din sitemap-ul vechi există în site-ul nou; adresele vechi de tip
`/lista-produse/?wpvcategorieprodus=…`, `/produsele-noastre/?taxonomy_id=…`, `/?s=…`,
`/category/articole/`, `/author/madalina/` redirecționează automat către pagina nouă potrivită.

## Detalii

- **Design minimalist**: mult spațiu alb, titluri mari, puține cuvinte, imagini mari. Roșul TEMCO doar pentru acțiuni.
- **Logo vectorial** (SVG) refăcut din broșura oficială, fonturi Manrope + Inter găzduite local (fără Google Fonts).
- **Animații discrete**: imaginile din slider se schimbă lent, textul valorilor TEMCO se „aprinde” cuvânt cu cuvânt la scroll, elementele apar cu un fade scurt. Toate respectă setarea „reduce motion”.
- **UX**: meniu Produse compact, căutare instantanee (⌘K / Ctrl K, fără diacritice), filtre după subcategorie și producător păstrate în URL, galerie cu zoom și ecran complet, formular cu validare.
- **Accesibilitate**: testat cu axe-core (WCAG 2 AA), navigare completă din tastatură.
- **SEO**: aceleași URL-uri, meta description și Open Graph, date structurate, `sitemap.xml`, `robots.txt`.
- **GDPR**: banner de cookie-uri cu textele site-ului actual; harta Google se încarcă doar după acord.

## Structură

```
build/        generatorul de site (Node.js, fără dependențe)
  content.mjs   textele paginilor corporate (Acasă, Despre noi, Contact)
  pages.mjs     șabloanele paginilor
src/css, src/js, src/brand   stiluri, interacțiuni, logo/favicon
data/         conținutul exportat din WordPress (produse, categorii, articole, pagini)
scripts/      export conținut, procesare imagini, server local, verificare link-uri
site/         site-ul generat (acesta se publică)
```

## Comenzi

```bash
npm run build        # generează ./site
npm run serve        # previzualizare la http://localhost:8080
node scripts/check-links.mjs   # verifică toate link-urile interne
```

Re-importul conținutului din WordPress (opțional, cât timp site-ul vechi este online):

```bash
python3 scripts/scrape.py <dir>                  # export REST API + paginile de produs
python3 scripts/parse_products.py <dir>          # galerii / descrieri / broșuri din paginile de produs
python3 scripts/extract.py <dir> data            # normalizare
python3 scripts/assets.py <cache-dir>            # descărcare imagini + WebP
npm run build
```

## Înainte de lansare

1. **Formulare**, în `build/content.mjs` setați `formEndpoint` (ex. Formspree, Netlify Forms sau un endpoint propriu).
   Până atunci, formularele deschid un email pre-completat către office@temco.ro.
2. **Broșuri PDF** (~550 MB), rămân deocamdată în `https://www.temco.ro/wp-content/uploads/`. Dacă WordPress
   este oprit, copiați fișierele PDF din `wp-content/uploads/` pe noul server și modificați `DOCS_BASE` în `build/lib.mjs`.
3. **Găzduire într-un subfolder** (ex. GitHub Pages): `SITE_BASE=/nume-folder/ npm run build` pentru pagina 404.

## Previzualizare online (GitHub Pages)

Site-ul este publicat din ramura `gh-pages`: **https://teodorab16.github.io/temco-website-demo/**
La fiecare push pe ramura implicită, workflow-ul `.github/workflows/pages.yml` reconstruiește site-ul și actualizează `gh-pages`.
(Setare necesară o singură dată: Settings → Pages → Deploy from a branch → `gh-pages` / root.)
