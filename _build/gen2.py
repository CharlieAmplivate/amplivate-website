#!/usr/bin/env python3
"""Build the Amplivate site (new look, October 2026) as one folder per URL.

Design sources live in _build/v2/:
  body.html  every page and the shared header, menu and footer
  style.css  the look (charcoal concrete by default, white as the second theme)
  app.js     the single-file preview version of the script (used to render pages)
  site.js    the live-site version of the script (real page addresses)
"""
import json, re, os, html, shutil, subprocess, datetime

BASE = os.path.dirname(os.path.abspath(__file__))
V2 = os.path.join(BASE, 'v2')
OUT = os.path.join(BASE, 'dist')
DOMAIN = 'https://amplivate.co.uk'
LASTMOD = datetime.date.today().isoformat()
WEB3FORMS_KEY = '0c852d7c-179f-4c67-8edf-9389951be07d'
VER = datetime.datetime.now().strftime('%Y%m%d%H%M')

body = open(os.path.join(V2, 'body.html')).read()
css = open(os.path.join(V2, 'style.css')).read()
app_preview = open(os.path.join(V2, 'app.js')).read()
site_js = open(os.path.join(V2, 'site.js')).read()

# ---------- 1. render every page in a browser ----------
tmp = os.path.join(BASE, 'v2', '_render')
if os.path.exists(tmp): shutil.rmtree(tmp)
os.makedirs(tmp)
for f in ('fraunces.woff2', 'manrope.woff2'): shutil.copy(os.path.join(BASE, 'fonts', f), tmp)
shutil.copy(os.path.join(BASE, 'charlie.jpg'), tmp)
FONTFACE = ('@font-face{font-family:"Fraunces";font-style:normal;font-weight:100 900;font-display:swap;src:url("fonts/fraunces.woff2") format("woff2")}\n'
            '@font-face{font-family:"Manrope";font-style:normal;font-weight:200 800;font-display:swap;src:url("fonts/manrope.woff2") format("woff2")}\n')
preview = ('<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
           '<style>' + FONTFACE.replace('fonts/', '') + css + '</style></head><body>'
           + body.replace('__PHOTO__', 'charlie.jpg') + '<script>' + app_preview + '</script></body></html>')
open(os.path.join(tmp, 'index.html'), 'w').write(preview)
cap_json = os.path.join(tmp, 'pages.json')
subprocess.run(['node', os.path.join(V2, 'capture.js'), os.path.join(tmp, 'index.html'), cap_json], check=True,
               env={**os.environ, 'NODE_PATH': subprocess.run(['npm', 'root', '-g'], capture_output=True, text=True).stdout.strip()})
pages = json.load(open(cap_json))
shutil.rmtree(tmp)

# ---------- 2. shared parts ----------
def between(text, start, end):
    i = text.index(start); j = text.index(end, i + len(start))
    return text[i:j + len(end)]
sprite = between(body, '<!-- logo sprite -->', '</svg>')
header = between(body, '<header class="hdr" id="hdr">', '</header>')
drawer = between(body, '<div class="drawer" id="drawer">', '</div>')
glint = '<div class="glint" aria-hidden="true"></div>'
sweep = between(body, '<div class="sweep" id="sweep"', '</div>')
footer = between(body, '<footer>', '</footer>')
mbar = between(body, '<a class="mbar"', '</a>')
assert glint in body

SLUGS = ['local-seo', 'google-business-profile', 'website-design', 'social-media-management', 'missed-call-text-back', 'google-review-follow-up']
ROUTES = {'home': '/', 'services': '/services/', 'work': '/work/', 'about': '/about/', 'faqs': '/faqs/', 'contact': '/contact/',
          'strategy-call': '/contact/#strategy-call', 'privacy': '/privacy/', 'terms': '/terms/'}
for s in SLUGS: ROUTES[s] = f'/services/{s}/'

def fix_links(h):
    return re.sub(r'(<a\b[^>]*?)href="#([^"]+)"', lambda m: m.group(1) + 'href="' + ROUTES.get(m.group(2), '#' + m.group(2)) + '"', h)

# ---------- 3. page content ----------
def page_html(key):
    h = pages[key]
    h = re.sub(r'^<div class="page"([^>]*)\shidden(="")?', r'<div class="page"\1', h)
    return h

def contact_extras(h):
    h = h.replace('<form class="form" id="cform" novalidate="">', f'<form class="form" id="cform" novalidate="" data-web3forms-key="{WEB3FORMS_KEY}">')
    h = h.replace('<form class="form" id="cform" novalidate>', f'<form class="form" id="cform" novalidate data-web3forms-key="{WEB3FORMS_KEY}">')
    h = h.replace('<button class="btn btn-primary" type="submit">',
        '<input type="checkbox" id="cf-bot" name="botcheck" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">'
        '<p class="form-err" id="cerr" role="alert" hidden="">We couldn\'t send your message just now. Please try again, or email hello@amplivate.co.uk.</p>'
        '<button class="btn btn-primary" type="submit">', 1)
    h = h.replace('<div class="done" id="cdone" hidden="">',
        '<div class="done" id="csent" role="status" hidden=""><h3>Thanks, your message has been sent.</h3>'
        '<p>We aim to reply within one working day. If it\'s urgent, email <strong>hello@amplivate.co.uk</strong>.</p>'
        '<div class="row"><button class="btn btn-line" type="button" id="cAgain">Send another message</button></div></div>'
        '<div class="done" id="cdone" hidden="">', 1)
    h = re.sub(r'<!--PHONE_INFO-->.*?<!--/PHONE_INFO-->', '', h, flags=re.S)
    if not ("data-web3forms-key" in h and 'id="csent"' in h and 'id="cf-bot"' in h): open("/tmp/claude-0/contact_dbg.html","w").write(h); raise SystemExit("contact form wiring missing")
    return h

NOTFOUND = '''<div class="page" data-page="notfound"><header class="phead"><svg class="deco deco-bars" viewBox="0 0 267 242" aria-hidden="true"><path d="M53 128 93 78 160 242H105Z"/><path d="M97 0h53l117 242h-57Z"/></svg><div class="wrap">
  <p class="crumb">Error 404</p><h1 class="display">This page doesn't exist.</h1>
  <p class="lead">The link may be old, or the address may have a typo. Everything else is still here.</p>
  <div class="btn-row" style="margin-top:30px"><a class="btn btn-primary" href="#home">Back to home</a><a class="btn btn-line" href="#services">View services</a></div>
</div></header></div>'''

# ---------- 4. head ----------
ORG = {
    "@context": "https://schema.org", "@type": "ProfessionalService", "name": "Amplivate",
    "url": DOMAIN + "/", "logo": DOMAIN + "/assets/logo.png", "image": DOMAIN + "/assets/og-image.png",
    "email": "hello@amplivate.co.uk", "slogan": "Get found. Get chosen. Get the call.",
    "description": "Digital marketing agency helping local businesses across the UK with Local SEO, Google Business Profiles, websites, social media and practical AI tools.",
    "areaServed": {"@type": "Country", "name": "United Kingdom"},
    "knowsAbout": ["Local SEO", "Google Business Profile optimisation", "Website design", "Social media management", "Missed call text back", "Google review follow up"],
    "sameAs": ["https://www.facebook.com/share/1CfDDcUhrs/", "https://www.instagram.com/amplivate.agency/"]
}
def crumbs(items):
    return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": DOMAIN + u} for i, (n, u) in enumerate(items)]}

def head(title, desc, path, page, slug='', ld=(), noindex=False):
    t, d = html.escape(title), html.escape(desc)
    lds = ''.join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>\n' for x in ld)
    robots = '<meta name="robots" content="noindex">\n' if noindex else ''
    canon = path if path != '/404' else '/'
    return f'''<!doctype html>
<html lang="en-GB" data-base="__BASE__">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{t}</title>
<meta name="description" content="{d}">
{robots}<link rel="canonical" href="{DOMAIN}{canon}">
<meta name="theme-color" content="#15181d">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Amplivate">
<meta property="og:locale" content="en_GB">
<meta property="og:title" content="{t}">
<meta property="og:description" content="{d}">
<meta property="og:url" content="{DOMAIN}{canon}">
<meta property="og:image" content="{DOMAIN}/assets/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Amplivate: Get found. Get chosen. Get the call.">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/assets/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/fraunces.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/manrope.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/site.css?v={VER}">
<script>(function(d){{var t=null;try{{t=localStorage.getItem('amp-theme');if(sessionStorage.getItem('amp-sweep')){{d.classList.add('sweep-on');sessionStorage.removeItem('amp-sweep')}}}}catch(e){{}}d.dataset.theme=t||'dark'}})(document.documentElement)</script>
{lds}<script src="/assets/site.js?v={VER}" defer></script>
</head>
<body data-page="{page}"{f' data-slug="{slug}"' if slug else ''}>
<a class="skip" href="#main">Skip to content</a>
'''

def write(path, content):
    fp = os.path.join(OUT, path.strip('/'), 'index.html') if path != '/404' else os.path.join(OUT, '404.html')
    os.makedirs(os.path.dirname(fp), exist_ok=True)
    if path != '/404':
        depth = len([p for p in path.strip('/').split('/') if p])
        prefix = '../' * depth
        content = re.sub(r'((?:href|src)=")/(?!/)', lambda m: m.group(1) + (prefix or './'), content)
        content = content.replace('href="./"', 'href="./"')
        content = content.replace('__BASE__', prefix)
    else:
        content = content.replace('__BASE__', '/')
    open(fp, 'w').write(content)

def build(path, nav, page, title, desc, content, slug='', ld=(), noindex=False):
    hdr = header.replace(f'data-nav="{nav}"', f'data-nav="{nav}" aria-current="page"') if nav else header
    foot = footer
    if 'data-cta' in content or page == 'contact':
        foot = re.sub(r'\s*<div class="foot-cta" id="footCta">.*?</div>', '', foot, count=1, flags=re.S)
    doc = (head(title, desc, path, page, slug, ld, noindex) + sprite + '\n' + fix_links(hdr) + '\n' + fix_links(drawer) + '\n' + glint + '\n' + sweep +
           '\n<main id="main">\n' + fix_links(content) + '\n</main>\n' + fix_links(foot) + ('\n' + fix_links(mbar) if page != 'contact' else '') + '\n</body>\n</html>\n')
    doc = doc.replace('__PHOTO__', '/assets/charlie.jpg').replace('src="charlie.jpg"', 'src="/assets/charlie.jpg"')
    write(path, doc)

if os.path.exists(OUT): shutil.rmtree(OUT)
os.makedirs(OUT + '/assets')

# ---------- 5. pages ----------
SVC_INFO = json.loads(subprocess.run(['node', '-e', '''
const src=require("fs").readFileSync(process.argv[1],"utf8");
const a=src.indexOf("const SERVICES = ["), b=src.indexOf("SERVICES.forEach(s => Object.assign(s, EXTRA[s.slug]));");
const FAQ_a=src.indexOf("const FAQS = ["), FAQ_b=src.indexOf("];", FAQ_a)+2;
eval(src.slice(a,b)+"SERVICES.forEach(s => Object.assign(s, EXTRA[s.slug]));"+src.slice(FAQ_a,FAQ_b)+";globalThis.OUT={S:SERVICES,F:FAQS}");
console.log(JSON.stringify(OUT));''', os.path.join(V2, 'app.js')], capture_output=True, text=True, check=True).stdout)
SV = {s['slug']: s for s in SVC_INFO['S']}

build('/', None, 'home', 'Amplivate | Local SEO & Digital Marketing across the UK',
      'Amplivate is a digital marketing agency helping local businesses across the UK with Local SEO, Google Business Profiles, websites, social media and AI tools.',
      page_html('home'), ld=[ORG, {"@context": "https://schema.org", "@type": "WebSite", "name": "Amplivate", "url": DOMAIN + "/"}])
build('/services/', 'services', 'services', 'Services | Amplivate',
      'Local SEO, Google Business Profiles, websites, social media and practical AI tools for local businesses, built around each client.',
      page_html('services'), ld=[crumbs([('Home', '/'), ('Services', '/services/')])])
for slug in SLUGS:
    s = SV[slug]
    first = re.split(r'(?<=[.!?])\s', s['overview'])[0]
    desc = s['tag'] + ' ' + first
    if len(desc) > 158: desc = desc[:155].rsplit(' ', 1)[0] + '…'
    ld = [{"@context": "https://schema.org", "@type": "Service", "name": s['name'], "serviceType": s['name'], "description": s['overview'],
           "provider": {"@type": "ProfessionalService", "name": "Amplivate", "url": DOMAIN + "/"},
           "areaServed": {"@type": "Country", "name": "United Kingdom"}, "url": f"{DOMAIN}/services/{slug}/"},
          {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
              {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in s['faqs']]},
          crumbs([('Home', '/'), ('Services', '/services/'), (s['name'], f'/services/{slug}/')])]
    build(f'/services/{slug}/', 'services', 'service', f"{s['name']} | Amplivate", desc, page_html(slug), slug=slug, ld=ld)
build('/work/', 'work', 'work', 'Our Work | Amplivate',
      'Concept projects showing how Amplivate approaches Local SEO, branding, websites and AI tools for local businesses.',
      page_html('work'), ld=[crumbs([('Home', '/'), ('Work', '/work/')])])
build('/about/', 'about', 'about', 'About | Amplivate',
      'A small digital marketing agency working with businesses across the UK: fair pricing, honest reporting, and direct access to the person doing the work.',
      page_html('about'), ld=[crumbs([('Home', '/'), ('About', '/about/')])])
build('/faqs/', 'faqs', 'faqs', 'FAQs | Amplivate',
      'Straight answers on SEO timelines, website ownership, reporting, pricing, contracts and the AI tools Amplivate uses.',
      page_html('faqs'), ld=[{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
          {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for _, q, a in SVC_INFO['F']]},
          crumbs([('Home', '/'), ('FAQs', '/faqs/')])])
build('/contact/', 'contact', 'contact', 'Contact | Amplivate',
      'Book a free strategy call or send Amplivate a message. We work with businesses across the UK and aim to reply within one working day.',
      contact_extras(page_html('contact')), ld=[crumbs([('Home', '/'), ('Contact', '/contact/')])])
build('/privacy/', None, 'privacy', 'Privacy Policy | Amplivate',
      'How Amplivate collects, uses and protects personal data submitted through this website, and your rights under UK GDPR.', page_html('privacy'))
build('/terms/', None, 'terms', 'Terms of Service | Amplivate',
      'The terms that apply to Amplivate\'s digital marketing services, plans, billing, cancellation and website ownership.', page_html('terms'))
build('/404', None, 'notfound', 'Page not found | Amplivate', 'This page doesn\'t exist.', NOTFOUND, noindex=True)

# ---------- 6. assets ----------
EXTRA_CSS = '''
/* live site additions */
.sweep-on .sweep{visibility:visible}
.sweep-on .sweep i{transform:translateX(0) skewX(-24deg)}
.sweep-on .sweep .mark{opacity:1;transform:none}
.hp{position:absolute!important;left:-9999px;width:1px;height:1px;opacity:0}
.form-err{color:var(--danger);font-size:15px;font-weight:600}
.btn:disabled{opacity:.7;cursor:wait}
.skip{position:absolute;left:12px;top:-60px;z-index:100;background:var(--ink);color:var(--paper);padding:10px 14px;border-radius:8px;font-weight:600}
.skip:focus{top:12px}
'''
open(OUT + '/assets/site.css', 'w').write(FONTFACE + css + EXTRA_CSS)
open(OUT + '/assets/site.js', 'w').write(site_js)
shutil.copytree(os.path.join(BASE, 'fonts'), OUT + '/assets/fonts')
shutil.copy(os.path.join(BASE, 'charlie.jpg'), OUT + '/assets/charlie.jpg')
open(OUT + '/assets/favicon.svg', 'w').write(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-12 -24 291 290"><style>path,circle{fill:#1a1d22}@media (prefers-color-scheme:dark){path,circle{fill:#e9ecf0}}</style>'
    '<circle cx="30" cy="212" r="30"/><path d="M53 128 93 78 160 242H105Z"/><path d="M97 0h53l117 242h-57Z"/></svg>\n')
urls = ['/', '/services/'] + [f'/services/{s}/' for s in SLUGS] + ['/work/', '/about/', '/faqs/', '/contact/', '/privacy/', '/terms/']
open(OUT + '/sitemap.xml', 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    ''.join(f'  <url><loc>{DOMAIN}{u}</loc><lastmod>{LASTMOD}</lastmod></url>\n' for u in urls) + '</urlset>\n')
open(OUT + '/robots.txt', 'w').write(f'User-agent: *\nAllow: /\n\nSitemap: {DOMAIN}/sitemap.xml\n')
print('built', len(urls) + 1, 'pages')
