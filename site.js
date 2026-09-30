/* Amplivate site script: theme, navigation, page transitions, animations, contact form. */
(function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const css = n => getComputedStyle(root).getPropertyValue(n).trim();
  const redrawers = [];

  /* ---------- theme (follows the device until the visitor toggles) ---------- */
  const themeBtn = $('#themeBtn');
  const sysDark = matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : sysDark.matches;
  const syncTheme = () => {
    const d = isDark();
    document.body.classList.toggle('is-dark', d);
    if (themeBtn) themeBtn.setAttribute('aria-label', d ? 'Switch to light mode' : 'Switch to dark mode');
    redrawers.forEach(f => f());
  };
  if (themeBtn) themeBtn.addEventListener('click', () => {
    root.dataset.theme = isDark() ? 'light' : 'dark';
    try { localStorage.setItem('amp-theme', root.dataset.theme); } catch(e){}
    syncTheme();
  });
  sysDark.addEventListener('change', syncTheme);

  /* ---------- header + mobile menu ---------- */
  const hdr = $('#hdr');
  const onScroll = () => hdr && hdr.classList.toggle('scrolled', scrollY > 12);
  addEventListener('scroll', onScroll, {passive:true}); onScroll();
  const menuBtn = $('#menuBtn'), drawer = $('#drawer');
  const setMenu = open => {
    if (!drawer) return;
    drawer.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  if (menuBtn) menuBtn.addEventListener('click', () => setMenu(!drawer.classList.contains('open')));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- page transition veil ---------- */
  const veil = $('#veil');
  const entering = root.classList.contains('veil-on');
  if (entering && veil) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      root.classList.remove('veil-on');
      veil.classList.add('out');
      setTimeout(() => veil.classList.remove('out'), 440);
    }));
  }
  addEventListener('pageshow', e => { if (e.persisted && veil) { veil.classList.remove('in','out'); root.classList.remove('veil-on'); setMenu(false); } });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return;
    if (url.pathname === location.pathname) { setMenu(false); return; } /* same page: let the hash do its thing */
    if (reduce || !veil) return;
    e.preventDefault();
    setMenu(false);
    veil.classList.remove('out'); void veil.offsetWidth; veil.classList.add('in');
    try { sessionStorage.setItem('amp-veil', '1'); } catch(err){}
    setTimeout(() => { location.href = url.href; }, 260);
  });

  /* ---------- per-element interactions ---------- */
  const fine = matchMedia('(pointer:fine)').matches;
  $$('.val').forEach(v => v.addEventListener('pointermove', e => { const r = v.getBoundingClientRect(); v.style.setProperty('--mx', (e.clientX - r.left) + 'px'); v.style.setProperty('--my', (e.clientY - r.top) + 'px'); }));
  if (!reduce) $$('.playable').forEach(c => c.addEventListener('mouseenter', () => { c.classList.remove('play'); void c.offsetWidth; requestAnimationFrame(() => c.classList.add('play')); }));
  if (!reduce && fine) $$('.mag').forEach(b => {
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width/2) * .18}px, ${(e.clientY - r.top - r.height/2) * .3}px)`; });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });

  /* ---------- reveal on scroll ---------- */
  let io = null;
  if (!reduce && 'IntersectionObserver' in window) io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, sibs = [...el.parentElement.children].filter(c => c.hasAttribute('data-rv'));
    el.style.transitionDelay = (Math.max(0, sibs.indexOf(el)) * 80) + 'ms';
    el.classList.add('in'); io.unobserve(el);
    if (el.classList.contains('playable')) setTimeout(() => el.classList.add('play'), 500);
  }), {threshold:.12, rootMargin:'0px 0px -6% 0px'});
  (function reveal(){
    const vh = innerHeight; let i = 0;
    $$('[data-rv]').forEach(el => {
      if (!io) { if (el.classList.contains('card')) el.classList.add('play'); return; }
      if (el.getBoundingClientRect().top < vh) {
        if (entering) { el.classList.add('enter'); el.style.animationDelay = (180 + i++ * 70) + 'ms'; }
        if (el.classList.contains('playable')) setTimeout(() => el.classList.add('play'), entering ? 800 : 600);
      } else { el.classList.add('rv'); io.observe(el); }
    });
  })();

  /* ---------- process line + CTA watermark parallax ---------- */
  function onPageScroll(){
    const vh = innerHeight;
    $$('.steps').forEach(steps => {
      const r = steps.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * .78 - r.top) / (r.height * .9 + vh * .15)));
      steps.style.setProperty('--p', p.toFixed(3));
      const st = $$('.step', steps); st.forEach((s, i) => s.classList.toggle('on', p >= i / st.length + .02));
    });
    if (!reduce) $$('[data-cta] .wm-big').forEach(m => { const r = m.parentElement.getBoundingClientRect(); if (r.top < vh && r.bottom > 0) m.style.transform = `translateY(${(r.top - vh/2) * -.08}px) rotate(${(r.top - vh/2) * .006}deg)`; });
  }
  addEventListener('scroll', onPageScroll, {passive:true}); addEventListener('resize', onPageScroll); onPageScroll();


  /* ---------- home services preview: auto-cycles, hover or focus a row to jump to it ---------- */
  (function(){
    const pv = $('#homePreview'); if (!pv) return;
    const frames = $$('.spv', pv), rows = $$('#homeSvc .svc');
    let i = 0, timer = null, hovering = false, visible = false;
    const show = k => {
      i = k;
      frames.forEach((f, j) => { f.classList.toggle('on', j === k); f.classList.remove('play'); });
      void pv.offsetWidth; if (frames[k]) frames[k].classList.add('play');
      rows.forEach((r, j) => r.classList.toggle('is-active', j === k));
    };
    const tick = () => { if (!hovering && visible) show((i + 1) % frames.length); };
    const start = () => { clearInterval(timer); if (!reduce) timer = setInterval(tick, 6500); };
    rows.forEach((r, j) => {
      r.addEventListener('mouseenter', () => { hovering = true; show(j); });
      r.addEventListener('mouseleave', () => { hovering = false; start(); });
      r.addEventListener('focus', () => { show(j); start(); });
    });
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { const v = es[0].isIntersecting; if (v && !visible) show(i); visible = v; }).observe(pv);
    else visible = true;
    show(0); start();
  })();

  /* ---------- mobile booking bar: appears after the hero, steps aside for call-to-action bands ---------- */
  (function(){
    const bar = $('#mbar'); if (!bar) return;
    let inCta = false;
    const update = () => bar.classList.toggle('show', scrollY > 520 && !inCta);
    if ('IntersectionObserver' in window) {
      const seen = new Set();
      const ob = new IntersectionObserver(es => { es.forEach(e => e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)); inCta = seen.size > 0; update(); });
      $$('[data-cta], footer').forEach(el => ob.observe(el));
    }
    addEventListener('scroll', update, {passive:true}); update();
  })();

  /* ---------- copy buttons ---------- */
  function copyText(text, btn, label, selectEl){
    const fallback = () => {
      if (selectEl) { const rg = document.createRange(); rg.selectNodeContents(selectEl); const s = getSelection(); s.removeAllRanges(); s.addRange(rg); }
      btn.textContent = 'Selected, press Ctrl+C'; setTimeout(() => btn.textContent = label, 2400);
    };
    try { navigator.clipboard.writeText(text).then(() => { btn.textContent = 'Copied'; setTimeout(() => btn.textContent = label, 1800); }, fallback); } catch(e){ fallback(); }
  }
  $$('[data-copy]').forEach(b => b.addEventListener('click', () => copyText(b.dataset.copy, b, 'Copy', b.previousElementSibling)));

  /* ---------- contact form ---------- */
  const form = $('#cform');
  if (form) {
    const sent = $('#csent'), done = $('#cdone'), errBox = $('#cerr'), submit = $('button[type="submit"]', form);
    const setErr = (id, msg) => { const f = $('#' + id).closest('.fld'); f.classList.toggle('bad', !!msg); $('.err', f).textContent = msg || ''; };
    const markStrategy = () => {
      if (location.hash !== '#strategy-call') return;
      $('#cf-topic').value = 'Free strategy call';
      const sc = $('#sc-block'); if (sc) { sc.classList.remove('flash'); void sc.offsetWidth; sc.classList.add('flash'); }
      if (innerWidth < 981) setTimeout(() => form.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'start'}), entering ? 500 : 50);
    };
    markStrategy(); addEventListener('hashchange', markStrategy);

    form.addEventListener('submit', async e => {
      e.preventDefault();
      errBox.hidden = true;
      const name = $('#cf-name').value.trim(), email = $('#cf-email').value.trim(), biz = $('#cf-biz').value.trim(), topic = $('#cf-topic').value, msg = $('#cf-msg').value.trim();
      let ok = true;
      setErr('cf-name', name ? '' : 'Add your name so we know who to reply to.'); ok = ok && !!name;
      const em = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      setErr('cf-email', em ? '' : 'Enter an email address like name@business.co.uk.'); ok = ok && em;
      setErr('cf-msg', msg ? '' : 'Tell us a little about what you need.'); ok = ok && !!msg;
      if (!ok) { const bad = $('.fld.bad input, .fld.bad textarea', form); if (bad) bad.focus(); return; }
      const key = (form.dataset.web3formsKey || '').trim();
      const subject = `Website enquiry: ${topic}${biz ? ' (' + biz + ')' : ''}`;

      if (!key) { /* no email service connected yet: hand the visitor a ready-made email */
        const body = `Name: ${name}\nEmail: ${email}\nBusiness: ${biz || '-'}\nEnquiry: ${topic}\n\n${msg}`;
        $('#cpre').textContent = `To: hello@amplivate.co.uk\nSubject: ${subject}\n\n${body}`;
        $('#cMailto').href = `mailto:hello@amplivate.co.uk?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        form.hidden = true; done.hidden = false; done.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'center'});
        return;
      }

      const label = submit.innerHTML;
      submit.disabled = true; submit.textContent = 'Sending…';
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method:'POST', headers:{'Content-Type':'application/json', Accept:'application/json'},
          body: JSON.stringify({
            access_key: key, subject, from_name:'Amplivate website',
            name, email, business: biz || '-', enquiry: topic, message: msg,
            botcheck: $('#cf-bot').checked
          })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) throw new Error(data && data.body && data.body.message || 'send failed');
        form.hidden = true; sent.hidden = false; sent.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'center'});
      } catch (err) {
        errBox.hidden = false;
      } finally {
        submit.disabled = false; submit.innerHTML = label;
      }
    });
    const again = $('#cAgain'); if (again) again.addEventListener('click', () => { form.reset(); sent.hidden = true; form.hidden = false; $('#cf-name').focus(); });
    const edit = $('#cEdit'); if (edit) edit.addEventListener('click', () => { done.hidden = true; form.hidden = false; $('#cf-msg').focus(); });
    const cm = $('#cCopyMsg'); if (cm) cm.addEventListener('click', e => copyText($('#cpre').textContent, e.currentTarget, 'Copy message', $('#cpre')));
    const scBtn = $('#scBtn'); if (scBtn) scBtn.addEventListener('click', () => { $('#cf-topic').value = 'Free strategy call'; form.hidden = false; if (done) done.hidden = true; if (sent) sent.hidden = true; $('#cf-name').focus({preventScroll:true}); form.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'start'}); });
  }

  /* ---------- home hero canvases ---------- */
  function setup(canvas, draw){
    const ctx = canvas.getContext('2d'); let w = 0, h = 0, raf = 0, running = false, t = 0;
    const size = () => { const dpr = Math.min(devicePixelRatio || 1, 2); w = canvas.clientWidth; h = canvas.clientHeight; if (!w || !h) return; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr,0,0,dpr,0,0); draw(ctx, w, h, t); };
    const loop = () => { t += .016; if (w && h) draw(ctx, w, h, t); raf = requestAnimationFrame(loop); };
    new ResizeObserver(size).observe(canvas); size();
    redrawers.push(() => { if (w && h) draw(ctx, w, h, t); });
    if (reduce) return;
    new IntersectionObserver(es => { const v = es[0].isIntersecting; if (v && !running) { running = true; loop(); } else if (!v && running) { running = false; cancelAnimationFrame(raf); } }).observe(canvas);
  }
  const net = $('#net');
  if (net) {
    let nodes = [], lastW = 0;
    const seed = (w, h) => { const n = Math.round(Math.min(46, Math.max(18, w * h / 26000))); nodes = Array.from({length:n}, () => ({x:Math.random()*w, y:Math.random()*h, vx:(Math.random()-.5)*.18, vy:(Math.random()-.5)*.18})); lastW = w; };
    setup(net, (ctx, w, h) => {
      if (!nodes.length || Math.abs(w - lastW) > 60) seed(w, h);
      ctx.clearRect(0,0,w,h);
      const col = css('--faint'), link = Math.min(190, w * .28);
      if (!reduce) nodes.forEach(p => { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1; });
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) { const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y); if (d < link) { ctx.globalAlpha = (1 - d / link) * .35; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } }
        ctx.globalAlpha = .6; ctx.beginPath(); ctx.arc(nodes[i].x, nodes[i].y, 2.2, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
    });
  }
  const wave = $('#wave'), hero = $('.hero');
  if (wave && hero) {
    let px = -9999, target = -9999;
    hero.addEventListener('pointermove', e => { const r = wave.getBoundingClientRect(); target = e.clientX - r.left; });
    hero.addEventListener('pointerleave', () => { target = -9999; });
    setup(wave, (ctx, w, h, t) => {
      ctx.clearRect(0,0,w,h);
      const hi = css('--accent'), lo = css('--faint');
      const gap = w < 600 ? 7 : 9, bw = Math.max(2, gap * .5), n = Math.ceil(w / gap) + 1;
      px += (target - px) * .08;
      for (let i = 0; i < n; i++) {
        const x = i * gap, k = x / w, env = .12 + .88 * Math.pow(k, 1.35);
        const osc = .55 + .45 * Math.sin(i * .21 + t * 1.7) * Math.cos(i * .053 - t * .8);
        const near = target > -9000 ? Math.exp(-Math.pow(x - px, 2) / (2 * 110 * 110)) : 0;
        const amp = Math.min(1, env * osc + near * .55), bh = Math.max(2, amp * h * .9);
        ctx.globalAlpha = .2 + .7 * amp; ctx.fillStyle = amp > .62 ? hi : lo;
        ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, h/2 - bh/2, bw, bh, bw/2); else ctx.rect(x, h/2 - bh/2, bw, bh); ctx.fill();
      }
      ctx.globalAlpha = 1;
    });
  }

  /* wordmark draws once, then stays solid */
  setTimeout(() => $$('.wm.draw').forEach(w => w.classList.remove('draw')), 2200);
  syncTheme();
})();
