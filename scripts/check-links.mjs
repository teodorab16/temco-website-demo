// Verifies every internal href/src/srcset in ./site resolves to a real file.
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../site');
const files = [];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : e.name.endsWith('.html') && files.push(p); });
walk(ROOT);
const missing = new Map(); let checked = 0; const external = new Set();
for (const f of files) {
  if (f.endsWith('404.html')) continue;
  const html = fs.readFileSync(f, 'utf8');
  const refs = [];
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) refs.push(m[1]);
  for (const m of html.matchAll(/\ssrcset="([^"]+)"/g)) m[1].split(',').forEach((s) => refs.push(s.trim().split(' ')[0]));
  for (const m of html.matchAll(/url\('([^']+)'\)/g)) refs.push(m[1]);
  for (let r of refs) {
    r = r.replace(/&amp;/g, '&');
    if (/^(mailto:|tel:|#|data:|javascript:)/.test(r)) continue;
    if (/^https?:/.test(r)) { external.add(new URL(r).host); continue; }
    const clean = decodeURIComponent(r.split('#')[0].split('?')[0]);
    if (!clean) continue;
    let target = path.resolve(path.dirname(f), clean);
    if (clean.endsWith('/') || (fs.existsSync(target) && fs.statSync(target).isDirectory())) target = path.join(target, 'index.html');
    checked++;
    if (!fs.existsSync(target)) {
      const k = path.relative(ROOT, target);
      if (!missing.has(k)) missing.set(k, path.relative(ROOT, f));
    }
  }
}
console.log(`${files.length} pages, ${checked} internal references checked`);
console.log('external hosts:', [...external].sort().join(', '));
if (missing.size) { console.log(`MISSING (${missing.size}):`); for (const [k, v] of [...missing].slice(0, 40)) console.log('  ', k, '← from', v); process.exitCode = 1; }
else console.log('All internal references resolve ✔');
