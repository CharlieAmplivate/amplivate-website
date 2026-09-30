#!/usr/bin/env python3
"""Build the Amplivate static site (one folder per URL) from the single-file design."""
import json, re, os, html, shutil

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(BASE, 'amplivate.html')
OUT = os.path.join(BASE, 'dist')
DOMAIN = 'https://amplivate.co.uk'
LASTMOD = '2026-09-30'

# ================= YOUR DETAILS =================
# Fill these in and rebuild; anything left empty simply doesn't appear on the site.
PHONE = ''              # leave empty to keep your number off the site
TEXTBACK_DEMO = False   # True once Missed-Call Text Back is running on PHONE: adds "call us and see it in action"
BOOKING_URL = ''        # e.g. 'https://cal.com/amplivate/strategy-call' - strategy-call buttons open this
FOUNDER_PHOTO = 'charlie.jpg'  # square photo kept in build/, copied to site/assets/
SOCIALS = {             # leave a value empty to hide it
    'instagram': '',
    'linkedin': '',
    'facebook': '',
    'google': '',       # your Google Business Profile link
}
# ================================================

src = open(SRC).read()
gen = json.load(open(os.path.join(BASE, 'gen.json')))

def between(text, start, end, include=True):
    i = text.index(start); j = text.index(end, i + len(start))
    return text[i:j + len(end)] if include else text[i + len(start):j]

# ---------- shared parts ----------
css = between(src, '<style>', '</style>', include=False)
sprite = between(src, '<!-- logo sprite -->', '</svg>')
header = between(src, '<header class="hdr" id="hdr">', '</header>')
drawer = between(src, '<div class="drawer" id="drawer">', '</div>\n\n<div class="veil"')[:-len('\n\n<div class="veil"')]
veil = between(src, '<div class="veil" id="veil"', '</div>')
footer = between(src, '<footer>', '</footer>')
mbar = between(src, '<a class="mbar"', '</a>')

ROUTES = {
    'home': '/', 'services': '/services/', 'work': '/work/', 'about': '/about/', 'faqs': '/faqs/',
    'contact': '/contact/', 'strategy-call': BOOKING_URL or '/contact/#strategy-call', 'privacy': '/privacy/', 'terms': '/terms/',
}
for slug in gen['order']:
    ROUTES[slug] = f'/services/{slug}/'

def fix_links(h):
    """Point in-page hash links at real URLs (only <a> tags, never <use href>)."""
    def rep(m):
        key = m.group(2)
        return m.group(1) + 'href="' + ROUTES.get(key, '#' + key) + '"'
    out = re.sub(r'(<a\b[^>]*?)href="#([^"]+)"', rep, h)
    if BOOKING_URL:
        out = out.replace(f'href="{BOOKING_URL}"', f'href="{BOOKING_URL}" target="_blank" rel="noopener"')
    return out

ICONS = {
    'instagram': ('Instagram', '<path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM12 3.8c2.7 0 3 0 4 .1 2.7.1 4 1.4 4.1 4.1.1 1.1.1 1.4.1 4s0 3-.1 4c-.1 2.7-1.4 4-4.1 4.1-1.1.1-1.4.1-4 .1s-3 0-4-.1c-2.7-.1-4-1.4-4.1-4.1-.1-1.1-.1-1.4-.1-4s0-3 .1-4C4 5.3 5.3 4 8 3.9c1.1-.1 1.4-.1 4-.1zM12 2c-2.7 0-3.1 0-4.1.1C4.2 2.2 2.2 4.2 2.1 7.9 2 8.9 2 9.3 2 12s0 3.1.1 4.1c.1 3.7 2.1 5.7 5.8 5.8 1 .1 1.4.1 4.1.1s3.1 0 4.1-.1c3.7-.1 5.7-2.1 5.8-5.8.1-1 .1-1.4.1-4.1s0-3.1-.1-4.1c-.1-3.7-2.1-5.7-5.8-5.8C15.1 2 14.7 2 12 2z"/>'),
    'linkedin': ('LinkedIn', '<path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.2c0-1.2 0-2.9-1.8-2.9s-2 1.4-2 2.8V21h-4z"/>'),
    'facebook': ('Facebook', '<path d="M14 8.5V6.7c0-.8.2-1.2 1.4-1.2H17V2.2A21 21 0 0 0 14.6 2C12 2 10.5 3.6 10.5 6.4v2.1H8V12h2.5v10H14V12h2.7l.4-3.5z"/>'),
    'google': ('Google Business Profile', '<path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3zM12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22zM6.4 14a6 6 0 0 1 0-4V7.4H3.1a10 10 0 0 0 0 9zM12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.7 9.4 6 12 6z"/>'),
}
tel = re.sub(r'[^0-9+]', '', PHONE)
PHONE_FOOT = f'<p class="phone-line"><a href="tel:{tel}">{html.escape(PHONE)}</a></p>' if PHONE else ''
PHONE_INFO = (f'<div class="it"><span class="k">Phone</span><span class="v"><a href="tel:{tel}">{html.escape(PHONE)}</a></span>'
              + ('<span class="v" style="font-weight:500;color:var(--muted)">Call us. If we miss you, you\'ll get our instant text back, the same system we set up for clients.</span>' if TEXTBACK_DEMO else '')
              + '</div>') if PHONE else ''
live = [(k, v) for k, v in SOCIALS.items() if v]
SOCIALS_HTML = ('<div class="socials">' + ''.join(f'<a href="{html.escape(v)}" target="_blank" rel="noopener" aria-label="{ICONS[k][0]}"><svg viewBox="0 0 24 24">{ICONS[k][1]}</svg></a>' for k, v in live) + '</div>') if live else ''
footer = re.sub(r'<!--PHONE_FOOT-->.*?<!--/PHONE_FOOT-->', lambda m: PHONE_FOOT, footer, flags=re.S).replace('<!--SOCIALS-->', SOCIALS_HTML)
if FOUNDER_PHOTO:
    IMG = f'<img src="/assets/{FOUNDER_PHOTO}" alt="Charlie, founder of Amplivate" width="296" height="296">'
    src = re.sub(r'(<div class="(?:meet-av|monogram)">)(?:<svg.*?</svg>|<img[^>]*>)(</div>)', lambda m: m.group(1) + IMG + m.group(2), src)

extra_css = '''
/* ---------- standalone page additions ---------- */
html,body{margin:0}
img{max-width:100%}
[hidden]{display:none!important}
.veil-on .veil{transform:none;visibility:visible}
.veil-on .veil .mark{opacity:1;transform:none}
.hp{position:absolute!important;left:-9999px;width:1px;height:1px;opacity:0}
.form-err{color:var(--danger);font-size:15px;font-weight:600}
.btn:disabled{opacity:.7;cursor:wait}
.skip{position:absolute;left:12px;top:-60px;z-index:100;background:var(--fg);color:var(--bg);padding:10px 14px;border-radius:8px;font-weight:600}
.skip:focus{top:12px}
.nf{min-height:50vh;display:grid;align-content:center;gap:22px}
.sc .btn{justify-self:start}
'''

def page_block(name):
    start = src.index(f'<div class="page" data-page="{name}"')
    end_markers = [src.find('<!-- =================', start + 10), src.find('</main>', start)]
    end = min(m for m in end_markers if m > 0)
    block = src[start:end].rstrip()
    block = re.sub(r'^<div class="page" data-page="\w+"[^>]*>\s*', '', block)
    assert block.endswith('</div>'), name
    return block[:-len('</div>')].rstrip()

def fill(block, container_id, inner):
    pat = re.compile(r'(<div[^>]*id="' + container_id + r'"[^>]*>)(</div>)')
    assert pat.search(block), container_id
    return pat.sub(lambda m: m.group(1) + inner + m.group(2), block, count=1)

# ---------- head ----------
FONTS = between(src, '<link rel="preconnect" href="https://fonts.googleapis.com">', 'display=swap">')

ORG = {
    "@context": "https://schema.org", "@type": "ProfessionalService", "name": "Amplivate",
    "url": DOMAIN + "/", "logo": DOMAIN + "/assets/logo.png", "image": DOMAIN + "/assets/og-image.png",
    "email": "hello@amplivate.co.uk", "slogan": "Amplify Reach. Elevate Business.",
    "description": "West Sussex digital marketing agency helping local businesses across the UK with Local SEO, Google Business Profiles, websites, social media and practical AI tools.",
    "address": {"@type": "PostalAddress", "addressRegion": "West Sussex", "addressCountry": "GB"},
    "areaServed": {"@type": "Country", "name": "United Kingdom"},
    "knowsAbout": ["Local SEO", "Google Business Profile optimisation", "Website design", "Social media management", "Missed-call text back", "Google review follow-up"]
}

def crumbs(items):
    return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": DOMAIN + u} for i, (n, u) in enumerate(items)]}

def head(title, desc, path, ld=(), noindex=False):
    t, d = html.escape(title), html.escape(desc)
    lds = ''.join(f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>\n' for x in ld)
    robots = '<meta name="robots" content="noindex">\n' if noindex else ''
    return f'''<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{t}</title>
<meta name="description" content="{d}">
{robots}<link rel="canonical" href="{DOMAIN}{path}">
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#1a1f26" media="(prefers-color-scheme: dark)">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Amplivate">
<meta property="og:locale" content="en_GB">
<meta property="og:title" content="{t}">
<meta property="og:description" content="{d}">
<meta property="og:url" content="{DOMAIN}{path}">
<meta property="og:image" content="{DOMAIN}/assets/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Amplivate logo: Amplify Reach. Elevate Business.">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/assets/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
{FONTS}
<link rel="stylesheet" href="/assets/site.css">
<script>(function(d){{try{{var t=localStorage.getItem('amp-theme');if(t)d.dataset.theme=t;if(sessionStorage.getItem('amp-veil')){{d.classList.add('veil-on');sessionStorage.removeItem('amp-veil')}}}}catch(e){{}}}})(document.documentElement)</script>
{lds}<script src="/assets/site.js" defer></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
'''

def chrome_top(active):
    h = fix_links(header)
    h = h.replace('data-nav="' + active + '"', 'data-nav="' + active + '" aria-current="page"') if active else h
    return sprite + '\n\n' + h + '\n\n' + fix_links(drawer) + '\n\n' + veil + '\n\n<main id="main" class="page">\n'

def chrome_bottom(show_bar=True):
    return '\n</main>\n\n' + fix_links(footer) + ('\n\n' + fix_links(mbar) if show_bar else '') + '\n</body>\n</html>\n'

def write(path, content):
    fp = os.path.join(OUT, path.strip('/'), 'index.html') if path != '/404' else os.path.join(OUT, '404.html')
    os.makedirs(os.path.dirname(fp), exist_ok=True)
    if path != '/404':
        depth = len([p for p in path.strip('/').split('/') if p])
        prefix = '../' * depth or './'
        content = re.sub(r'((?:href|src)=")/(?!/)', lambda m: m.group(1) + prefix, content)
    open(fp, 'w').write(content)

def build(path, active, title, desc, body, ld=(), noindex=False):
    bottom = chrome_bottom(path != '/contact/')
    if 'data-cta' in body or path == '/contact/':
        bottom = re.sub(r'\s*<div class="foot-cta" id="footCta">.*?</div>', '', bottom, count=1, flags=re.S)
    write(path, head(title, desc, path if path != '/404' else '/', ld, noindex) + chrome_top(active) + fix_links(body) + bottom)

if os.path.exists(OUT): shutil.rmtree(OUT)
os.makedirs(OUT + '/assets')

# ---------- home ----------
home = page_block('home')
home = fill(home, 'homeSvc', gen['homeSvc'])
home = fill(home, 'homeWork', gen['homeWork'])
home = fill(home, 'mq', gen['mq'])
home = fill(home, 'homePreview', gen['homePreview'])
build('/', None, 'Amplivate | Local SEO & Digital Marketing, West Sussex & UK-wide',
      'Amplivate is a West Sussex digital marketing agency helping local businesses across the UK with Local SEO, Google Business Profiles, websites, social media and AI tools.',
      home, [ORG, {"@context": "https://schema.org", "@type": "WebSite", "name": "Amplivate", "url": DOMAIN + "/"}])

# ---------- services ----------
svc = page_block('services')
svc = fill(svc, 'sgVM', gen['sgVM']); svc = fill(svc, 'sgAI', gen['sgAI'])
build('/services/', 'services', 'Services | Amplivate',
      'Local SEO, Google Business Profiles, websites, social media and practical AI tools for local businesses, built around each client.',
      svc, [crumbs([('Home', '/'), ('Services', '/services/')])])

for slug in gen['order']:
    s = gen['services'][slug]
    first = re.split(r'(?<=[.!?])\s', s['overview'])[0]
    desc = (s['tag'] + ' ' + first)
    if len(desc) > 158: desc = desc[:155].rsplit(' ', 1)[0] + '…'
    ld = [
        {"@context": "https://schema.org", "@type": "Service", "name": s['name'], "serviceType": s['name'], "description": s['overview'],
         "provider": {"@type": "ProfessionalService", "name": "Amplivate", "url": DOMAIN + "/"},
         "areaServed": {"@type": "Country", "name": "United Kingdom"}, "url": f"{DOMAIN}/services/{slug}/"},
        {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in s['faqs']]},
        crumbs([('Home', '/'), ('Services', '/services/'), (s['name'], f'/services/{slug}/')]),
    ]
    build(f'/services/{slug}/', 'services', f"{s['name']} | Amplivate", desc, s['html'], ld)

# ---------- work ----------
work = fill(page_block('work'), 'allWork', gen['allWork'])
build('/work/', 'work', 'Our Work | Amplivate',
      'Concept projects showing how Amplivate approaches Local SEO, branding, websites and AI tools for local businesses.',
      work, [crumbs([('Home', '/'), ('Work', '/work/')])])

# ---------- about ----------
build('/about/', 'about', 'About | Amplivate',
      'A small digital marketing agency based in West Sussex: fair pricing, honest reporting, and direct access to the person doing the work.',
      page_block('about'), [crumbs([('Home', '/'), ('About', '/about/')])])

# ---------- faqs ----------
faqs = fill(page_block('faqs'), 'faqList', gen['faqList'])
build('/faqs/', None, 'FAQs | Amplivate',
      'Straight answers on SEO timelines, website ownership, reporting, pricing, contracts and the AI tools Amplivate uses.',
      faqs, [{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
          {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for _, q, a in gen['FAQS']]},
          crumbs([('Home', '/'), ('FAQs', '/faqs/')])])

# ---------- contact ----------
contact = page_block('contact')
contact = contact.replace('<form class="form" id="cform" novalidate>',
    '<!-- Paste your Web3Forms access key between the quotes below to send enquiries straight to your inbox. -->\n'
    '        <form class="form" id="cform" novalidate data-web3forms-key="0c852d7c-179f-4c67-8edf-9389951be07d">')
contact = contact.replace('<button class="btn btn-primary" type="submit">',
    '<input type="checkbox" id="cf-bot" name="botcheck" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">\n'
    '          <p class="form-err" id="cerr" role="alert" hidden>We couldn\'t send your message just now. Please try again, or email hello@amplivate.co.uk.</p>\n'
    '          <button class="btn btn-primary" type="submit">')
contact = contact.replace('<div class="done" id="cdone" hidden>',
    '<div class="done" id="csent" role="status" hidden>\n'
    '          <h3>Thanks, your message has been sent.</h3>\n'
    '          <p>We aim to reply within one working day. If it\'s urgent, email <strong>hello@amplivate.co.uk</strong>.</p>\n'
    '          <div class="row"><button class="btn btn-ghost" type="button" id="cAgain">Send another message</button></div>\n'
    '        </div>\n'
    '        <div class="done" id="cdone" hidden>')
contact = contact.replace('Contact form submissions are processed via [name the form-handling service once one is in place].', 'Contact form submissions are processed via Web3Forms, which forwards them to our inbox.')
contact = re.sub(r'<!--PHONE_INFO-->.*?<!--/PHONE_INFO-->', lambda m: PHONE_INFO, contact, flags=re.S)
if BOOKING_URL:
    contact = contact.replace('<button class="btn btn-band" type="button" id="scBtn">Request a call <span class="arr">→</span></button>',
                              f'<a class="btn btn-band" href="{BOOKING_URL}" target="_blank" rel="noopener">Pick a time <span class="arr">→</span></a>')
assert 'data-web3forms-key' in contact and 'id="csent"' in contact and 'id="cf-bot"' in contact
build('/contact/', 'contact', 'Contact | Amplivate',
      'Book a free strategy call or send Amplivate a message. Based in West Sussex, working UK-wide, and we aim to reply within one working day.',
      contact, [crumbs([('Home', '/'), ('Contact', '/contact/')])])

# ---------- legal ----------
build('/privacy/', None, 'Privacy Policy | Amplivate', 'How Amplivate collects, uses and protects personal data submitted through this website, and your rights under UK GDPR.', page_block('privacy').replace('Contact form submissions are processed via [name the form-handling service once one is in place].', 'Contact form submissions are processed via Web3Forms, which forwards them to our inbox.'))
build('/terms/', None, 'Terms of Service | Amplivate', 'The terms that apply to Amplivate\'s digital marketing services, plans, billing, cancellation and website ownership.', page_block('terms'))

# ---------- 404 ----------
nf = '''  <section class="sec"><div class="wrap nf">
    <span class="eyebrow">Error 404</span>
    <h1 style="font-size:clamp(40px,6.2vw,82px);letter-spacing:-.025em">This page doesn't exist.</h1>
    <p class="lead">The link may be old, or the address may have a typo. Everything else is still here.</p>
    <div class="hero-cta" style="margin-top:8px;animation:none"><a class="btn btn-primary" href="#home">Back to home <span class="arr">→</span></a><a class="btn btn-ghost" href="#services">View Services</a></div>
  </div></section>'''
build('/404', None, 'Page not found | Amplivate', 'This page doesn\'t exist.', nf, noindex=True)

# ---------- assets ----------
open(OUT + '/assets/site.css', 'w').write(css.strip() + '\n' + extra_css)
shutil.copy(os.path.join(BASE, 'site.js'), OUT + '/assets/site.js')
if FOUNDER_PHOTO: shutil.copy(os.path.join(BASE, FOUNDER_PHOTO), OUT + '/assets/' + FOUNDER_PHOTO)
open(OUT + '/assets/favicon.svg', 'w').write(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-12 -24 291 290"><style>path,circle{fill:#4a5669}@media (prefers-color-scheme:dark){path,circle{fill:#c3ccda}}</style>'
    '<circle cx="30" cy="212" r="30"/><path d="M53 128 93 78 160 242H105Z"/><path d="M97 0h53l117 242h-57Z"/></svg>\n')

urls = ['/', '/services/'] + [f'/services/{s}/' for s in gen['order']] + ['/work/', '/about/', '/faqs/', '/contact/', '/privacy/', '/terms/']
open(OUT + '/sitemap.xml', 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    ''.join(f'  <url><loc>{DOMAIN}{u}</loc><lastmod>{LASTMOD}</lastmod></url>\n' for u in urls) + '</urlset>\n')
open(OUT + '/robots.txt', 'w').write(f'User-agent: *\nAllow: /\n\nSitemap: {DOMAIN}/sitemap.xml\n')
print('built', len(urls) + 1, 'pages')
