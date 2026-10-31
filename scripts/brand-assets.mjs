// Renders PNG favicons and the default social-share image from the SVG brand
// files (run once: `node scripts/brand-assets.mjs`; requires Playwright).
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const B = path.join(ROOT, 'src/brand');
const fav = fs.readFileSync(path.join(B, 'favicon.svg'), 'utf8');
const logo = fs.readFileSync(path.join(B, 'logo.svg'), 'utf8');
const browser = await chromium.launch();
for (const [name, size] of [['favicon-32.png', 32], ['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  const p = await browser.newPage({ viewport: { width: size, height: size } });
  await p.setContent(`<html><body style="margin:0;background:transparent">${fav.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
  await p.screenshot({ path: path.join(B, name), omitBackground: true });
  await p.close();
}
const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await og.setContent(`<html><body style="margin:0;width:1200px;height:630px;display:grid;place-items:center;background:radial-gradient(60% 80% at 100% 0%,rgba(212,46,18,.35),transparent 60%),radial-gradient(50% 70% at 0% 100%,rgba(41,134,226,.3),transparent 60%),#0e1115;font-family:sans-serif">
  <div style="text-align:center;color:#fff">
    <div style="color:#fff;width:640px;margin:0 auto">${logo.replace('<svg ', '<svg width="640" ')}</div>
    <p style="margin-top:38px;font-size:30px;letter-spacing:.02em;opacity:.8">Aparatură medicală de referință pentru toată România · din 1990</p>
  </div></body></html>`);
await og.screenshot({ path: path.join(B, 'og-default.jpg'), type: 'jpeg', quality: 88 });
await browser.close();
console.log('brand assets written');
