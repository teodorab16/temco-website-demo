#!/usr/bin/env python3
"""
Normalises the raw temco.ro export (WP REST API dumps + downloaded product
pages) into clean JSON consumed by build.mjs.

Usage:  python3 -I scripts/extract.py <crawl-dir> <out-data-dir>

<crawl-dir> must contain:
  api/{produse,posts,pages,categorie-produs,tags,media}.json   (scripts/scrape.py)
  products_parsed.json                                         (scripts/parse_products.py)
"""
import json, re, sys, html, os, unicodedata
from bs4 import BeautifulSoup, NavigableString, Comment

CRAWL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
J = lambda n: json.load(open(os.path.join(CRAWL, n)))

api_products = J('api/produse.json')
parsed = {p['id']: p for p in J('products_parsed.json')}
api_cats = J('api/categorie-produs.json')
api_tags = J('api/tags.json')
api_media = {m['id']: m for m in J('api/media.json')}
api_posts = J('api/posts.json')
api_pages = {p['slug']: p for p in J('api/pages.json')}

un = lambda s: html.unescape(s or '').replace('\xa0', ' ').strip()
SHOP_HOST = 'echipamentestoma.ro'
assets = set()

def norm_url(u):
    if not u: return u
    u = u.strip()
    u = re.sub(r'^https?://(www\.)?temco\.ro', 'https://www.temco.ro', u)
    return u

def full_size(u):
    """WordPress resized variant -> original upload."""
    u = norm_url(u)
    return re.sub(r'-\d{2,4}x\d{2,4}(?=\.(jpe?g|png|gif|webp)$)', '', u, flags=re.I)

def is_upload(u):
    return u and u.startswith('https://www.temco.ro/wp-content/uploads/')

def media_url(mid):
    m = api_media.get(mid)
    if not m: return None
    if m.get('mime_type') == 'application/pdf':  # WP renders a JPG preview of PDFs
        full = (m.get('media_details') or {}).get('sizes', {}).get('full')
        return norm_url(full['source_url']) if full else None
    return norm_url(m['source_url'])

def media_alt(mid):
    m = api_media.get(mid)
    return un(m.get('alt_text')) if m else ''

# ---------------------------------------------------------------- sanitiser
ALLOWED = {
    'p': [], 'br': [], 'strong': [], 'b': [], 'em': [], 'i': [], 'u': [], 'sup': [], 'sub': [],
    'ul': [], 'ol': [], 'li': [], 'a': ['href'], 'h2': [], 'h3': [], 'h4': [], 'h5': [],
    'table': [], 'thead': [], 'tbody': [], 'tr': [], 'td': ['colspan', 'rowspan'], 'th': ['colspan', 'rowspan'],
    'img': ['src', 'alt', 'width', 'height'], 'figure': [], 'figcaption': [], 'blockquote': [],
}
RENAME = {'h1': 'h2', 'b': 'strong', 'pre': 'p', 'code': 'span', 'div': None, 'span': None,
          'section': None, 'center': None, 'font': None}

def sanitize(fragment):
    soup = BeautifulSoup(fragment or '', 'lxml')
    for c in soup.find_all(string=lambda t: isinstance(t, Comment)): c.extract()
    for t in soup(['script', 'style', 'form', 'noscript', 'iframe', 'input', 'button', 'svg']): t.decompose()
    for t in soup.select('.social-box, .button-brosura'): t.decompose()
    body = soup.body or soup
    for el in list(body.find_all(True)):
        name = el.name
        if name in RENAME:
            if RENAME[name] is None: el.unwrap(); continue
            el.name = name = RENAME[name]
        if name not in ALLOWED:
            el.unwrap(); continue
        keep = ALLOWED[name]
        for a in list(el.attrs):
            if a not in keep: del el.attrs[a]
        if name == 'a':
            h = norm_url(el.get('href', ''))
            if not h or h.startswith('#'): el.unwrap(); continue
            el['href'] = h
        if name == 'img':
            src = full_size(el.get('src', ''))
            el['src'] = src
            if is_upload(src): assets.add(src)
    out = body.decode_contents()
    # strip stray "Array" (toolset debug output) and empty paragraphs
    out = re.sub(r'<p>\s*Array\s*</p>', '', out)
    out = re.sub(r'(?<=>)\s*Array\s*(?=<)', '', out)
    out = out.replace('\xa0', ' ')
    for _ in range(3):
        out = re.sub(r'<(p|h2|h3|h4|strong|em|li)>\s*(<br/?>\s*)*</\1>', '', out)
    out = re.sub(r'(<br/?>\s*){3,}', '<br/><br/>', out)
    out = re.sub(r'<p>\s*(<br/?>\s*)+', '<p>', out)
    out = re.sub(r'(\s*<br/?>)+\s*</p>', '</p>', out)
    out = re.sub(r'<(i|em|strong|span|u)>\s*</\1>\s*', '', out)
    out = re.sub(r'<(h2|h3|h4|p|li)>(\s*<strong>)?\s+', lambda m: '<' + m.group(1) + '>' + (m.group(2) or '').strip(), out)
    out = re.sub(r'\n{2,}', '\n', out).strip()
    return out

def dedupe_headings(fragment):
    """Old editor sometimes repeated a heading block verbatim; drop exact repeats."""
    soup = BeautifulSoup(fragment, 'lxml')
    seen = ''
    for h in soup.find_all(['h2', 'h3', 'h4']):
        t = re.sub(r'\s+', ' ', h.get_text(' ', strip=True)).strip().lower()
        if t and len(t) > 12 and t in seen:
            h.decompose(); continue
        seen += ' ' + t
    return (soup.body or soup).decode_contents()

def text_of(fragment):
    t = BeautifulSoup(fragment or '', 'lxml').get_text(' ', strip=True)
    return re.sub(r'\s+', ' ', t).strip()

# ---------------------------------------------------------------- categories
cat_by_id = {c['id']: c for c in api_cats}
def cat_chain(c):
    chain = [c]
    while chain[0]['parent']: chain.insert(0, cat_by_id[chain[0]['parent']])
    return chain

HOME_GRID = {  # imagery used on the original home / "Produsele noastre" grid
    'ati-sala-operatie': 'https://www.temco.ro/wp-content/uploads/2019/12/grid-product-04.jpg',
    'chirurgie-laparoscopica': 'https://www.temco.ro/wp-content/uploads/2019/12/grid-product-02.jpg',
    'diagnostic': 'https://www.temco.ro/wp-content/uploads/2019/12/grid-product-07.jpg',
    'endoscopie': 'https://www.temco.ro/wp-content/uploads/2019/12/grid-product-01.jpg',
    'imagistica': 'https://www.temco.ro/wp-content/uploads/2019/12/grid-product-10.jpg',
    'laborator-morga': 'https://www.temco.ro/wp-content/uploads/2022/04/laborator-morga.jpg',
    'microscopie': 'https://www.temco.ro/wp-content/uploads/2019/12/grid-product-05.jpg',
    'orl': 'https://www.temco.ro/wp-content/uploads/2019/12/grid-product-03.jpg',
    'periferice-medicale': 'https://www.temco.ro/wp-content/uploads/2019/12/grid-product-06.jpeg',
    'simulatoare-medicale-realitate-virtuala': 'https://www.temco.ro/wp-content/uploads/2019/12/grid-product-08.jpg',
    'stomatologie': 'https://www.temco.ro/wp-content/uploads/2019/12/grid-product-11.jpg',
    'terapie': 'https://www.temco.ro/wp-content/uploads/2019/12/grid-product-09.jpg',
}
HOME_ORDER = list(HOME_GRID.keys())

categories = []
for c in api_cats:
    chain = cat_chain(c)
    img = c.get('z_taxonomy_image_url') or ''
    if 'placeholder' in img: img = ''
    img = norm_url(img) or None
    if c['slug'] in HOME_GRID: img = HOME_GRID[c['slug']]
    if img and img.endswith('-scaled.jpg'): img = img.replace('-scaled.jpg', '.jpg')
    categories.append({
        'id': c['id'], 'slug': c['slug'], 'name': un(c['name']),
        'parent': c['parent'] or None,
        'path': '/'.join(x['slug'] for x in chain),
        'description': un(c.get('description')),
        'image': img, 'directCount': c['count'],
        'menuOrder': HOME_ORDER.index(c['slug']) if c['slug'] in HOME_ORDER else 999,
    })

# ---------------------------------------------------------------- tags
tags = [{'id': t['id'], 'slug': t['slug'], 'name': un(t['name']), 'count': t['count']} for t in api_tags]

# ---------------------------------------------------------------- products
DOMAIN_BRAND = {
    'olympus-lifescience.com': 'Olympus', 'olympus-europa.com': 'Olympus', 'slee.de': 'SLEE medical',
    'simbionix.com': 'Simbionix', 'kugel-medical.de': 'Kugel medical', 'biocare.com.cn': 'Biocare',
}

def split_label(text):
    m = re.match(r'^\s*\[?v?\s*([A-Za-zăâîșțĂÂÎȘȚ \-]{2,40}?)\s*:\s*(.*)$', text, flags=re.S)
    return (m.group(1).strip(), m.group(2).strip()) if m else (None, text.strip())

def parse_info(info_html, extra_docs):
    soup = BeautifulSoup(info_html or '', 'lxml')
    for c in soup.find_all(string=lambda t: isinstance(t, Comment)): c.extract()
    for t in soup.select('.social-box, script, style'): t.decompose()
    res = {'model': None, 'manufacturer': None, 'manufacturerUrl': None, 'shopUrl': None,
           'logos': [], 'docs': [], 'extra': [], 'shortDescription': None, 'images': [], 'descHtml': ''}
    # some entries embed a "Descriere Produs" heading inside the info block
    marker = soup.find(lambda t: t.name in ('p', 'h2', 'h3', 'h4', 'strong') and
                       re.sub(r'\s+', ' ', t.get_text(' ', strip=True)).lower() == 'descriere produs')
    if marker:
        top = marker
        while top.parent and top.parent.name not in ('body', '[document]') and \
                re.sub(r'\s+', ' ', top.parent.get_text(' ', strip=True)).lower() == 'descriere produs':
            top = top.parent
        rest = []
        for sib in list(top.find_next_siblings()):
            rest.append(str(sib)); sib.decompose()
        top.decompose()
        res['descHtml'] = ''.join(rest)
    # logos & image links
    for img in soup.find_all('img'):
        a = img.find_parent('a')
        src = full_size(img.get('src'))
        href = norm_url(a.get('href')) if a else None
        if 'link-magazin-online' in (src or ''):
            if href: res['shopUrl'] = href
        elif not href:
            if is_upload(src): assets.add(src)
            res['images'].append(src)
        else:
            if is_upload(src): assets.add(src)
            res['logos'].append({'src': src, 'href': href, 'alt': un(img.get('alt'))})
            if href and not res['manufacturerUrl'] and SHOP_HOST not in href: res['manufacturerUrl'] = href
        (a or img).decompose() if a else img.decompose()
    # anchors
    for a in soup.find_all('a'):
        href = norm_url(a.get('href', ''))
        label = a.get_text(' ', strip=True)
        if not href: continue
        if href.lower().endswith('.pdf'):
            res['docs'].append({'url': href, 'label': label or 'Document'}); a.decompose(); continue
        if SHOP_HOST in href:
            res['shopUrl'] = href; a.decompose(); continue
        host = re.sub(r'^https?://(www\.)?', '', href).split('/')[0]
        if host in ('facebook.com', 'twitter.com', 'pinterest.com', 'plus.google.com'):
            a.decompose(); continue
        if not res['manufacturerUrl']: res['manufacturerUrl'] = href
        if label and not label.lower().startswith('link'):
            a.replace_with(label)  # keep the brand name as text
        else:
            a.decompose()
    # paragraphs
    blocks = [p for p in soup.find_all(['p', 'li', 'h2', 'h3', 'pre']) if not p.find(['p', 'li'])]
    short_mode = False
    for p in blocks:
        t = re.sub(r'\s+', ' ', p.get_text(' ', strip=True)).strip()
        if not t or t == 'Array': continue
        if short_mode:
            res['shortDescription'] = (res['shortDescription'] + ' ' + t).strip() if res['shortDescription'] else t
            continue
        label, val = split_label(t)
        if not label:
            m3 = re.match(r'(?i)^(model|produc[aă]tor)\s+(.+)$', t)
            if m3: label, val = m3.group(1), m3.group(2)
        low = (label or '').lower()
        if low.startswith('model'):
            m2 = re.match(r'(?i)model\s*(.*)', label)
            prefix = m2.group(1).strip() if m2 else ''
            v = (prefix + (':' if prefix and val else '') + val) if prefix else val
            res['model'] = v.strip(' :') or res['model']
        elif low.startswith('producator') or low.startswith('producător'):
            res['manufacturer'] = val.strip(' :') or res['manufacturer']
        elif 'magazin' in low:
            pass  # shop link already captured from anchor
        elif low.startswith('scurta descriere'):
            short_mode = True
            if val: res['shortDescription'] = val
        elif t.lower().startswith('link c') or t.lower() in ('un produs', 'scu'):
            pass
        else:
            res['extra'].append(t)
    if not res['manufacturer'] and res['manufacturerUrl']:
        host = re.sub(r'^https?://(www\.)?', '', res['manufacturerUrl']).split('/')[0]
        res['manufacturer'] = DOMAIN_BRAND.get(host)
    for d in extra_docs:
        if not any(x['url'] == d['url'] for x in res['docs']): res['docs'].append(d)
    for d in res['docs']:
        d['url'] = norm_url(d['url'])
        if d['label'] in ('Descarca brosura', ''): d['label'] = None
    return res

BRAND_ALIASES = {
    'durr dental': 'Dürr Dental', 'dürr dental': 'Dürr Dental',
    'surgical science – simbionix': 'Surgical Science – Simbionix', 'surgical science- simbionix': 'Surgical Science – Simbionix',
    'surgical science -simbionix': 'Surgical Science – Simbionix', 'simbionix': 'Surgical Science – Simbionix',
    'vbm': 'VBM Medizintechnik', 'vbm medizintechnik gmbh': 'VBM Medizintechnik',
    'iba dosimetry': 'IBA Dosimetry', 'fuji film': 'Fujifilm', 'euromedical instruments': 'Euromedical Instruments',
    'waldmann': 'Waldmann', 'kugel medical': 'Kugel medical', 'modjaw': 'MODJAW',
}
def norm_brand(b):
    if not b: return b
    b = re.sub(r'\s+', ' ', b).strip(' .,:')
    return BRAND_ALIASES.get(b.lower(), b)

def clean_title(t):
    m = re.match(r'^(.*?)[,\s\-–]+Produc[aă]tor\s*:\s*(.+)$', t)
    return (m.group(1).strip(' ,-–'), m.group(2).strip()) if m else (t, None)

products = []
for ap in api_products:
    pp = parsed[ap['id']]
    title = un(ap['title']['rendered'])
    display, title_brand = clean_title(title)
    brochures = [{'url': norm_url(b['url']), 'label': b['label']} for b in pp['brochures']]
    info = parse_info(pp['info_html'], brochures)
    desc = sanitize(pp['desc_html'] or '')
    if not text_of(desc) and info['descHtml']:
        desc = sanitize(info['descHtml'])
    if not text_of(desc) and info['shortDescription']:
        desc = '<p>' + html.escape(info['shortDescription']) + '</p>'
    gallery = [full_size(g) for g in pp['gallery'] if g]
    gallery += info['images']
    gallery = list(dict.fromkeys(gallery))
    fm = media_url(ap['featured_media'])
    if not gallery and fm: gallery = [fm]
    for g in gallery:
        if is_upload(g): assets.add(g)
    # primary category = deepest assigned category (breadcrumb order)
    bc_slugs = [re.sub(r'/$', '', u).split('/')[-1] for _, u in pp['breadcrumbs'] if '/categorie-produs/' in u]
    cats = ap['categorie-produs']
    primary = None
    if bc_slugs:
        s = bc_slugs[-1]
        primary = next((c['id'] for c in api_cats if c['slug'] == s), None)
    if not primary and cats:
        primary = max(cats, key=lambda i: len(cat_chain(cat_by_id[i])))
    manufacturer = norm_brand(info['manufacturer'] or title_brand)
    products.append({
        'id': ap['id'], 'slug': ap['slug'], 'title': title, 'name': display,
        'model': info['model'], 'manufacturer': manufacturer, 'manufacturerUrl': info['manufacturerUrl'],
        'shopUrl': info['shopUrl'], 'logos': info['logos'], 'docs': info['docs'], 'extra': info['extra'],
        'images': gallery, 'imageAlt': media_alt(ap['featured_media']) or display,
        'description': desc, 'summary': text_of(desc)[:220],
        'categories': cats, 'primaryCategory': primary, 'tags': ap['tags'],
        'date': ap['date'], 'modified': ap['modified'],
    })

# ---------------------------------------------------------------- posts
AUTHOR = {3: 'Lupu Madalina'}
posts = []
for p in api_posts:
    soup = BeautifulSoup(p['content']['rendered'], 'lxml')
    images, docs = [], []
    for a in soup.find_all('a'):
        h = norm_url(a.get('href', ''))
        if h.lower().endswith('.pdf'):
            docs.append({'url': h, 'label': a.get_text(' ', strip=True) or 'Descarcă flyer'})
    for img in soup.find_all('img'):
        src = full_size(img.get('src', ''))
        if src.lower().endswith('.pdf'):
            if not any(d['url'] == src for d in docs): docs.append({'url': src, 'label': 'Flyer eveniment'})
            continue
        if not re.search(r'\.(jpe?g|png|gif|webp)$', src, re.I): continue
        if src not in images: images.append(src)
    for t in soup.find_all(['img', 'figure']): t.decompose()
    for a in soup.find_all('a'):
        if a.get('href', '').lower().endswith(('.pdf', '.jpg', '.jpeg', '.png')): a.decompose()
    body = dedupe_headings(sanitize(str(soup)))
    featured = media_url(p['featured_media'])
    if featured and featured not in images: images.insert(0, featured)
    for i in images: assets.add(i)
    posts.append({
        'id': p['id'], 'slug': p['slug'], 'title': un(p['title']['rendered']),
        'date': p['date'], 'modified': p['modified'], 'author': AUTHOR.get(p['author'], 'TEMCO'),
        'featured': featured, 'images': images, 'docs': docs, 'body': body,
        'excerpt': text_of(body)[:240],
    })

# ---------------------------------------------------------------- pages
def page_html(slug):
    return sanitize(api_pages[slug]['content']['rendered'])
pages = {
    'politica-de-confidentialitate': {
        'title': un(api_pages['politica-de-confidentialitate']['title']['rendered']),
        'body': page_html('politica-de-confidentialitate').replace('http://test.e-mk.ro', 'https://www.temco.ro'),
        'modified': api_pages['politica-de-confidentialitate']['modified'],
    },
    'politica-cookies': {
        'title': un(api_pages['politica-cookies']['title']['rendered']),
        'body': page_html('politica-cookies'),
        'modified': api_pages['politica-cookies']['modified'],
    },
}

# despre-noi assets
despre = BeautifulSoup(api_pages['despre-noi']['content']['rendered'], 'lxml')
iso = []
for img in despre.find_all('img'):
    src = full_size(img['src'])
    assets.add(src)
    if 'ISO' in src: iso.append(src)
brochure_cover = full_size(despre.find('img', src=re.compile('Screen-Shot'))['src'])
assets.update(HOME_GRID.values())
for extra in ['https://www.temco.ro/wp-content/uploads/2019/12/home-banner-01.jpg',
              'https://www.temco.ro/wp-content/uploads/2019/12/home-banner-02.jpg',
              'https://www.temco.ro/wp-content/uploads/2019/12/logo-temco.png',
              'https://www.temco.ro/wp-content/uploads/2018/04/cropped-fav.png']:
    assets.add(extra)
for c in categories:
    if c['image']: assets.add(c['image'])

site = {
    'despre': {'iso': iso, 'brochureCover': brochure_cover,
               'brochurePdf': 'https://www.temco.ro/wp-content/uploads/2017/12/brosura-temco-1.pdf'},
}

def dump(name, obj):
    json.dump(obj, open(os.path.join(OUT, name), 'w'), ensure_ascii=False, indent=1)

dump('categories.json', categories)
dump('tags.json', tags)
dump('products.json', products)
dump('posts.json', posts)
dump('pages.json', pages)
dump('site-assets.json', site)
assets = sorted(a for a in assets if a and is_upload(a))
dump('assets.json', assets)
print('categories', len(categories), 'products', len(products), 'posts', len(posts), 'assets', len(assets))
