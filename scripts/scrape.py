#!/usr/bin/env python3
"""
Exports the live temco.ro WordPress content.
Usage: python3 scripts/scrape.py <crawl-dir>
Writes <crawl-dir>/api/*.json (REST API) and <crawl-dir>/prod/<slug>.html
(product pages: gallery, description and brochures live in custom fields
that the REST API does not expose).
"""
import json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
BASE = 'https://www.temco.ro/wp-json/wp/v2/'
UA = {'User-Agent': 'Mozilla/5.0 (TEMCO site export)'}

def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read(), dict(r.headers)

def all_of(ep):
    out, page = [], 1
    while True:
        body, h = get(f'{BASE}{ep}?per_page=100&page={page}')
        out += json.loads(body)
        if page >= int(h.get('X-WP-TotalPages', h.get('x-wp-totalpages', '1'))): return out
        page += 1

crawl = sys.argv[1]
os.makedirs(os.path.join(crawl, 'api'), exist_ok=True)
os.makedirs(os.path.join(crawl, 'prod'), exist_ok=True)
for ep in ['produse', 'posts', 'pages', 'categorie-produs', 'tags', 'categories', 'media']:
    data = all_of(ep)
    json.dump(data, open(os.path.join(crawl, 'api', ep + '.json'), 'w'), ensure_ascii=False)
    print(ep, len(data))

def page(p):
    body, _ = get(p['link'])
    open(os.path.join(crawl, 'prod', p['slug'] + '.html'), 'wb').write(body)
products = json.load(open(os.path.join(crawl, 'api', 'produse.json')))
with ThreadPoolExecutor(6) as ex: list(ex.map(page, products))
print('product pages', len(products))
