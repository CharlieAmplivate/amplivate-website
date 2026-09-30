"""Run the page-building part of the single-file site in Node and save the generated HTML fragments."""
import re, subprocess, os, json
BASE = os.path.dirname(os.path.abspath(__file__))
s = open(os.path.join(BASE, 'amplivate.html')).read()
js = re.findall(r'<script>(.*?)</script>', s, re.S)[0]
start = js.index('(function(){') + len('(function(){')
end = js.index('  /* ---------------- theme')
body = js[start:end]
harness = '''
const store={};
globalThis.window={};globalThis.matchMedia=()=>({matches:false,addEventListener(){}});
const fakeEl=(sel)=>({set innerHTML(v){store[sel]=v}});
globalThis.document={documentElement:{},querySelector:(s)=>fakeEl(s),querySelectorAll:()=>[]};
function bindInteractive(){}
''' + body + '''
const services={};
for (const sv of SERVICES){ renderService(sv); services[sv.slug]={html:store['#serviceDetail'], name:sv.name, tag:sv.tag, overview:sv.overview, group:sv.group, faqs:sv.faqs}; }
const out={homePreview:store['#homePreview'],homeSvc:store['#homeSvc'],homeWork:store['#homeWork'],allWork:store['#allWork'],sgVM:store['#sgVM'],sgAI:store['#sgAI'],mq:store['#mq'],faqList:store['#faqList'],services,FAQS,order:SERVICES.map(s=>s.slug)};
require('fs').writeFileSync(''' + json.dumps(os.path.join(BASE, 'gen.json')) + ''',JSON.stringify(out));
'''
open(os.path.join(BASE, 'harness.js'), 'w').write(harness)
subprocess.run(['node', os.path.join(BASE, 'harness.js')], check=True)
print('prerendered')
