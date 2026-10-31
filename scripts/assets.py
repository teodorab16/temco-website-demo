#!/usr/bin/env python3
"""
Downloads every image referenced by data/*.json and writes responsive WebP
variants into site/media/. Produces data/media.json (url -> variants, size,
dominant colour) used by build.mjs for <img srcset> and blur-up placeholders.

Usage: python3 -I scripts/assets.py <raw-cache-dir>
"""
import json, os, sys, hashlib, urllib.request, urllib.parse, re
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageOps
Image.MAX_IMAGE_PIXELS = None

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = sys.argv[1]
OUT = os.path.join(ROOT, 'site', 'media')
os.makedirs(RAW, exist_ok=True); os.makedirs(OUT, exist_ok=True)
assets = json.load(open(os.path.join(ROOT, 'data', 'assets.json')))
# hero / banner images get bigger renditions
BIG = ('home-banner', 'laborator-morga', 'bnr_', 'banner', 'art')
WIDTHS = [480, 960, 1600]
HERO_WIDTHS = [768, 1280, 1920, 2560]

def local_name(url):
    path = urllib.parse.urlparse(url).path.replace('/wp-content/uploads/', '')
    base, _ = os.path.splitext(path)
    base = urllib.parse.unquote(base)
    base = re.sub(r'[^A-Za-z0-9/_\-]+', '-', base).strip('-')
    return base

# Files that 404 at the URL the old site referenced; the same upload exists elsewhere.
FALLBACK = {
    'https://www.temco.ro/wp-content/uploads/2019/12/art23.jpg': 'https://www.temco.ro/wp-content/uploads/2019/12/art23-2.jpg',
    'https://www.temco.ro/wp-content/uploads/2019/12/Ghid-de-intubatie-malebil-poza.jpg': 'https://www.temco.ro/wp-content/uploads/2018/03/Ghid-de-intubatie-malebil-poza.jpg',
}

def fetch(url):
    dst = os.path.join(RAW, hashlib.sha1(url.encode()).hexdigest())
    if os.path.exists(dst) and os.path.getsize(dst) > 0: return url, dst
    src = FALLBACK.get(url, url)
    src = urllib.parse.quote(src, safe=':/%?=&')
    try:
        req = urllib.request.Request(src, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=60) as r: data = r.read()
        open(dst, 'wb').write(data)
        return url, dst
    except Exception as e:
        print('FAIL', url, e); return url, None

with ThreadPoolExecutor(8) as ex: files = list(ex.map(fetch, assets))

media = {}
for url, path in files:
    if not path: continue
    try:
        im = Image.open(path); im = ImageOps.exif_transpose(im)
    except Exception as e:
        print('BAD', url, e); continue
    has_alpha = im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info)
    im = im.convert('RGBA' if has_alpha else 'RGB')
    w, h = im.size
    name = local_name(url)
    name = re.sub(r'[^\x00-\x7f]', '', name).replace('--', '-')
    widths = HERO_WIDTHS if any(k in name for k in BIG) and w >= 1200 else WIDTHS
    variants = []
    for tw in widths:
        tw = min(tw, w)
        if variants and variants[-1]['w'] >= tw: break
        th = round(h * tw / w)
        rel = f'{name}-{tw}.webp'
        dst = os.path.join(OUT, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if not os.path.exists(dst):
            im.resize((tw, th), Image.LANCZOS).save(dst, 'WEBP', quality=80, method=6)
        variants.append({'w': tw, 'src': 'media/' + rel})
        if tw == w: break
    # dominant/average colour for blur-up placeholder
    small = im.convert('RGB').resize((1, 1), Image.LANCZOS)
    r, g, b = small.getpixel((0, 0))
    media[url] = {'w': w, 'h': h, 'alpha': has_alpha, 'color': f'#{r:02x}{g:02x}{b:02x}', 'variants': variants}

json.dump(media, open(os.path.join(ROOT, 'data', 'media.json'), 'w'), indent=1)
print('images', len(media))
