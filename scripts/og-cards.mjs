// Designed link-preview images (WhatsApp, Facebook, LinkedIn, iMessage...).
// 1200x630 JPEG; all important content sits in the central 630px column so it
// still reads when WhatsApp crops the image to a square thumbnail.
// Run after scripts/assets.py:  node scripts/og-cards.mjs
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'src/brand/og');
fs.mkdirSync(OUT, { recursive: true });
const products = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/products.json'), 'utf8'));
const domains = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/categories.json'), 'utf8')).filter((c) => !c.parent).length;
const logo = fs.readFileSync(path.join(ROOT, 'src/brand/logo.svg'), 'utf8').replace('<svg ', '<svg width="300" ');
const f = (p) => 'file://' + path.join(ROOT, p);

const CARDS = [
  { name: 'home', title: 'Tehnologie medicală<br>de referință.', sub: 'Din 1990, pentru medicii din toată România.', bg: 'site/media/2019/12/home-banner-01-1600.webp' },
  { name: 'despre-noi', title: 'Despre noi', sub: 'Din 1990, alături de medicii din România.', bg: 'site/media/2019/12/home-banner-02-1600.webp' },
  { name: 'produse', title: `${products.length} de produse<br>în ${domains} domenii`, sub: 'Endoscopie, imagistică, microscopie, stomatologie.', bg: 'site/media/2022/04/laborator-morga-1280.webp' },
  { name: 'evenimente', title: 'Instruire<br>și evenimente', sub: 'Cursuri, congrese și workshop-uri medicale.', bg: 'site/media/2019/12/art5-842.webp' },
  { name: 'contact', title: 'Hai să vorbim.', sub: 'București · Cluj-Napoca · Iași · Constanța · Alexandria', bg: 'site/media/2019/12/home-banner-01-1600.webp' },
];

const html = (c) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Manrope; src: url("${f('site/assets/fonts/manrope-latin-wght-normal.woff2')}") format("woff2"); font-weight: 200 800; }
@font-face { font-family: Manrope; src: url("${f('site/assets/fonts/manrope-latin-ext-wght-normal.woff2')}") format("woff2"); font-weight: 200 800; unicode-range: U+0100-024F, U+0218-021B; }
@font-face { font-family: Inter; src: url("${f('site/assets/fonts/inter-latin-wght-normal.woff2')}") format("woff2"); font-weight: 100 900; }
@font-face { font-family: Inter; src: url("${f('site/assets/fonts/inter-latin-ext-wght-normal.woff2')}") format("woff2"); font-weight: 100 900; unicode-range: U+0100-024F, U+0218-021B; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; overflow: hidden; background: #0b0d10; font-family: Inter, sans-serif; color: #fff; position: relative; }
.bg { position: absolute; inset: 0; background: url("${f(c.bg)}") center / cover; filter: brightness(.5) saturate(.85); }
.shade { position: absolute; inset: 0; background: radial-gradient(60% 75% at 50% 48%, rgba(8,10,13,.55), rgba(8,10,13,.25) 70%, rgba(8,10,13,.6)), linear-gradient(180deg, rgba(8,10,13,.35), rgba(8,10,13,.15) 40%, rgba(8,10,13,.75)); }
.wrap { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 26px; padding-bottom: 20px; }
.logo { color: #fff; }
h1 { font-family: Manrope, sans-serif; font-weight: 700; font-size: 66px; line-height: 1.04; letter-spacing: -2.2px; text-wrap: balance; }
p { font-size: 27px; color: rgba(255,255,255,.88); max-width: 620px; line-height: 1.35; }
.foot { position: absolute; left: 0; right: 0; bottom: 34px; display: flex; justify-content: center; gap: 28px; font-size: 23px; color: rgba(255,255,255,.82); }
.foot span { display: inline-flex; align-items: center; gap: 10px; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: #d42e12; }
</style></head><body>
<div class="bg"></div><div class="shade"></div>
<div class="wrap"><div class="logo">${logo}</div><h1>${c.title}</h1><p>${c.sub}</p></div>
<div class="foot"><span><i class="dot"></i>021 252 46 50</span><span><i class="dot"></i>office@temco.ro</span></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const c of CARDS) {
  const tmp = path.join(OUT, `.${c.name}.html`);
  fs.writeFileSync(tmp, html(c));
  await page.goto('file://' + tmp, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(OUT, `${c.name}.jpg`), type: 'jpeg', quality: 84 });
  fs.rmSync(tmp);
}
// Logo bitmap used by scripts/og-images.py for the small badge on product previews
await page.setViewportSize({ width: 600, height: 133 });
const lp = path.join(OUT, '.logo.html');
fs.writeFileSync(lp, `<html><body style="margin:0;background:transparent;color:#2B2926">${logo.replace('width="300"', 'width="600"')}</body></html>`);
await page.goto('file://' + lp);
await page.screenshot({ path: path.join(OUT, 'logo-badge.png'), omitBackground: true, clip: { x: 0, y: 0, width: 600, height: 133 } });
fs.rmSync(lp);
await browser.close();
for (const c of CARDS) console.log(c.name, Math.round(fs.statSync(path.join(OUT, `${c.name}.jpg`)).size / 1024) + ' KB');
