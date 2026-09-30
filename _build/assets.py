import asyncio, os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist', 'assets')
from playwright.async_api import async_playwright
MARK = '<circle cx="30" cy="212" r="30"/><path d="M53 128 93 78 160 242H105Z"/><path d="M97 0h53l117 242h-57Z"/>'
WM = '<path fill="none" stroke="{c}" stroke-width="2.4" stroke-linecap="square" d="M0 24 10 0 20 24M38 24V0l10 16L58 0v24M76 24V0h10a6 6 0 0 1 0 12H76M110 0v24h15M143 0v24M161 0l10 24 10-24M199 24 209 0l10 24M237 0h20M247 0v24M290 0h-15v24h15M275 12h13"/>'
OG = f'''<html><body style="margin:0;width:1200px;height:630px;background:#1a1f26;display:grid;place-items:center;overflow:hidden;font-family:DejaVu Sans,Arial,sans-serif">
<div style="position:absolute;inset:0;background:radial-gradient(60% 70% at 70% 20%,rgba(142,162,192,.18),transparent 70%)"></div>
<svg viewBox="0 0 267 242" style="position:absolute;right:-60px;bottom:-80px;width:520px;opacity:.06;fill:#c3ccda">{MARK}</svg>
<div style="position:relative;display:grid;justify-items:center;gap:34px">
<svg viewBox="0 0 267 242" style="width:170px;fill:#9fb0cc">{MARK}</svg>
<svg viewBox="-3 -3 296 30" style="width:560px">{WM.format(c="#c3ccda")}</svg>
<div style="width:90px;height:2px;background:#7385a3"></div>
<div style="color:#a7b1c1;font-size:22px;letter-spacing:.42em;text-transform:uppercase">Amplify Reach. Elevate Business.</div>
</div></body></html>'''
ICON = lambda size, pad: f'''<html><body style="margin:0;width:{size}px;height:{size}px;background:#ffffff;display:grid;place-items:center">
<svg viewBox="0 0 267 242" style="width:{size-2*pad}px;fill:#4a5669">{MARK}</svg></body></html>'''
LOGO = f'''<html><body style="margin:0;width:512px;height:512px;background:transparent;display:grid;place-items:center">
<svg viewBox="0 0 267 242" style="width:440px;fill:#4a5669">{MARK}</svg></body></html>'''
async def shot(p, html, w, h, path, transparent=False):
    pg = await p.new_page(viewport={'width':w,'height':h})
    await pg.set_content(html); await pg.screenshot(path=path, omit_background=transparent); await pg.close()
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        await shot(b, OG, 1200, 630, os.path.join(OUT, 'og-image.png'))
        await shot(b, ICON(180, 30), 180, 180, os.path.join(OUT, 'apple-touch-icon.png'))
        await shot(b, ICON(32, 3), 32, 32, os.path.join(OUT, 'favicon-32.png'), True)
        await shot(b, LOGO, 512, 512, os.path.join(OUT, 'logo.png'), True)
        await b.close()
asyncio.run(main())
