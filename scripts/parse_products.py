import json, glob, os, re, sys
from bs4 import BeautifulSoup
crawl=sys.argv[1]
api=json.load(open(f'{crawl}/api/produse.json'))
out=[]
issues=[]
for p in api:
    slug=p['slug']
    fn=f'{crawl}/prod/{slug}.html'
    if not os.path.exists(fn):
        # url-decoded slug
        cand=[f for f in glob.glob(f'{crawl}/prod/*.html') if p['link'].rstrip('/').split('/')[-1] in f]
        fn=cand[0] if cand else None
    if not fn: issues.append(('missing',slug)); continue
    soup=BeautifulSoup(open(fn).read(),'lxml')
    inner=soup.select_one('.site-inner')
    # breadcrumbs
    bc=[(a.get_text(strip=True), a['href']) for a in inner.select('#breadcrumbs a')]
    # gallery
    gal=[]
    for img in inner.select('.carousel-item img'):
        src=img.get('src')
        if src and src not in gal: gal.append(src)
    # heading modules
    mods=inner.select('.fl-module')
    info_html=None; desc_html=None; brochures=[]
    state=None
    h1count=0
    for m in mods:
        cls=m.get('class',[])
        if 'fl-module-heading' in cls:
            t=m.get_text(' ',strip=True)
            if t.startswith('Descriere'): state='desc'
            elif t.startswith('Formular'): state='form'
            else:
                h1count+=1
                state='info' if h1count>=2 else 'title'
            continue
        if 'fl-module-rich-text' in cls:
            rt=m.select_one('.fl-rich-text')
            if rt is None: continue
            if rt.select('.carousel-item') or rt.select('form'): continue
            if rt.select('.button-brosura'):
                for a in rt.select('.button-brosura a'):
                    brochures.append({'url':a['href'],'label':a.get_text(strip=True)})
                # other text in brochure module?
                txt=rt.get_text(' ',strip=True)
                for a in rt.select('.button-brosura'): pass
                continue
            html=rt.decode_contents().strip()
            if state=='info':
                info_html=(info_html or '')+html
            elif state=='desc':
                desc_html=(desc_html or '')+html
        if 'fl-module-html' in cls and state=='desc':
            pass
    # also capture brochures links not in button-brosura? any pdf link in desc
    title=p['title']['rendered']
    rec={
        'id':p['id'],'slug':slug,'link':p['link'],'title':title,
        'date':p['date'],'modified':p['modified'],
        'cats':p['categorie-produs'],'tags':p['tags'],
        'featured_media':p['featured_media'],
        'api_content':p['content']['rendered'],
        'excerpt':p['excerpt']['rendered'],
        'breadcrumbs':bc,'gallery':gal,'info_html':info_html,'desc_html':desc_html,
        'brochures':brochures,
        'yoast_desc':(p.get('yoast_head_json') or {}).get('description') or (p.get('yoast_head_json') or {}).get('og_description'),
    }
    if not gal: issues.append(('nogallery',slug))
    if not desc_html: issues.append(('nodesc',slug))
    if not info_html: issues.append(('noinfo',slug))
    out.append(rec)
json.dump(out,open(f'{crawl}/products_parsed.json','w'),ensure_ascii=False,indent=1)
print(len(out))
import collections
print(collections.Counter(i[0] for i in issues))
for i in issues[:40]: print(i)
