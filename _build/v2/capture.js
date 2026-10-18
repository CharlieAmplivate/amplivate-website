// Renders each page of the design in a real browser and saves the finished HTML of that page,
// so every URL ships its full content (good for Google and for visitors without JavaScript).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const [preview, out] = process.argv.slice(2);
const routes = ['home','services','work','about','faqs','contact','privacy','terms',
  'local-seo','google-business-profile','website-design','social-media-management','missed-call-text-back','google-review-follow-up'];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:1440,height:900}, reducedMotion:'reduce', colorScheme:'dark'});
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(preview));
  await p.waitForTimeout(800);
  const res = {};
  for (const r of routes){
    await p.evaluate(h => { location.hash = h; }, r);
    await p.waitForTimeout(900);
    res[r] = await p.evaluate(() => document.querySelector('.page:not([hidden])').outerHTML);
  }
  await b.close();
  if (errs.length){ console.error(errs.join('\n')); process.exit(1); }
  fs.writeFileSync(out, JSON.stringify(res));
  console.log('captured', Object.keys(res).length, 'pages');
})();
