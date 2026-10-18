(function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const css = n => getComputedStyle(document.body).getPropertyValue(n).trim();
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const wait = ms => new Promise(r => setTimeout(r, reduce ? Math.min(ms, 60) : ms));
  const CK = '<svg aria-hidden="true"><use href="#ck"/></svg>';
  const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#star"/></svg>';
  const GO = '<svg aria-hidden="true"><use href="#go"/></svg>';
  const MK = cls => `<svg class="mark ${cls||''}" viewBox="0 0 267 242" aria-hidden="true"><use href="#mk"/></svg>`;
  const PHONE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1z"/></svg>';
  const whenSeen = (el, fn, th = .35) => {
    if (!('IntersectionObserver' in window)) { fn(); return; }
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); fn(); } }, {threshold:th});
    io.observe(el);
  };

  /* ---------------- content ---------------- */
  const SERVICES = [
    {slug:'local-seo', group:'vm', name:'Local SEO', tag:'Rank higher for the searches that bring customers through the door.',
     overview:'We optimise your website, on page content, local citations and Google Business Profile structure so you show up for the searches that matter in your area. Built for businesses competing locally, or taking local SEO seriously for the first time.',
     benefits:['Higher visibility in local search results and Google Maps','More enquiries from people who are ready to buy','A clear picture of which searches actually bring you customers'],
     included:['Technical SEO audit and fixes','On page optimisation for local search terms','Local citation building and clean up','Monthly ranking and traffic reporting'],
     steps:[['Audit','We assess your current rankings, technical issues, and what competitors are doing.'],['Build','Fixes, content, and citations go in, prioritised by impact.'],['Track','Rankings and traffic are monitored monthly, and the plan adjusts.']],
     faqs:[['How long does local SEO take to work?','Weeks to months rather than days. It depends on how competitive your market is and the current state of your site.'],['Do I need a new website for local SEO?','Not always. Local SEO can work on your existing site; we\'ll assess whether your current setup is holding you back.']]},
    {slug:'google-business-profile', group:'vm', name:'Google Business Profile Optimisation', tag:'Turn your Google listing into your strongest source of new enquiries.',
     overview:'We fully optimise your Google Business Profile, including categories, service areas, photos, posts and review management, so it works as hard as your website does. Best suited to businesses that already have a Google listing but have never had it properly set up.',
     benefits:['Better visibility in the Google Maps \'local pack\'','A profile that answers customer questions before they even call','More clicks, calls, and direction requests'],
     included:['Full profile setup and optimisation','Category, service, and description review','Photo and post management','Review monitoring and response support'],
     steps:[['Review','We check what\'s currently set up, what\'s missing, and what\'s actively working against you.'],['Optimise','Categories, services, descriptions, and photos are all brought up to a standard that converts.'],['Maintain','Ongoing posts, updates, and review responses keep the profile active, and Google rewards profiles that stay current.']],
     faqs:[['Can you manage my Google Business Profile if I already have one?','Yes, most of our work is improving existing profiles rather than starting from scratch.'],['Do you respond to reviews for me?','We can, either by drafting responses for your approval or handling it directly, depending on what you\'d prefer.']]},
    {slug:'website-design', group:'vm', name:'Website Design & Landing Page Build', tag:'A site built to convert, not just to look good in a portfolio.',
     overview:'A website that looks nice but doesn\'t generate enquiries isn\'t doing its job. We design sites around what a visitor needs to see to pick up the phone or fill in a form, built properly, not from a generic template.',
     benefits:['A site built around your actual customers, not a stock template','Fast, mobile first, and built to convert','Easy for you to update yourself, no developer needed'],
     included:['Custom design based on your business and market','Mobile first, fast loading build','Basic on page SEO foundation','Content management system so you can edit it yourself'],
     steps:[['Plan','We work out what the site needs to do for your business before any design starts.'],['Design & Build','A site designed around your business, built properly rather than assembled from a generic template.'],['Launch & Train','Once it\'s live, we show you how to update it yourself, so there\'s no waiting on a developer for small changes.']],
     faqs:[['Can I update the website myself once it\'s live?','Yes, every site we build comes with a content management system so you can edit text, images, and pages without touching code.'],['How long does a new website take?','It depends on scope and how quickly content is ready on your side. We\'ll give you a realistic estimate during the strategy call.']]},
    {slug:'social-media-management', group:'vm', name:'Social Media Management', tag:'Consistent, on brand posting across your channels with active replies, so your business stays visible between jobs.',
     overview:'Your business keeps an active social presence even when you\'re not posting yourself. We plan, create, and publish content that keeps your profiles current and on brand, so social media comes off your to do list.',
     benefits:['Consistent posting','On brand content','Better visibility','Monthly reporting','Time back for you'],
     included:['Content calendar','Post design and copywriting','Scheduling','Light community management','Monthly performance report'],
     steps:[['Discovery call','Learning your brand, audience, and goals.'],['Content plan','Monthly posts approved in advance.'],['Creation','Design, writing, and post creation.'],['Publishing','Scheduled posts go live automatically.'],['Reporting','Monthly performance check in and planning.']],
     faqs:[['How many posts do I get each month?','That depends on your plan. We\'ll agree a posting frequency during onboarding and stick to it.'],['Do I need to approve posts before they go live?','Yes, you\'ll get a content calendar to review each month before anything is published.']]},
    {slug:'missed-call-text-back', group:'ai', name:'Missed Call Text Back', tag:'Automation that follows up missed calls for you when you can\'t get to the phone.',
     overview:'Never lose a job to a missed call. The second a call goes unanswered, your customer gets an instant text back with a way to book, so the enquiry doesn\'t go to a competitor.',
     benefits:['Fewer lost leads','Instant response','No extra effort'],
     included:['Automatic text back for missed calls','Custom message written for your business','Lead capture','Monthly reporting'],
     steps:[['Setup','We connect the service to your business number.'],['Customise','You approve the text message template.'],['Go live','Missed calls trigger an instant text automatically.'],['Review','Monthly reports show leads recovered.']],
     faqs:[['What does the customer receive when I miss their call?','An instant text letting them know you\'ll be in touch, with an option to leave details or book in directly.'],['Does this work with my existing business number?','Yes, it connects to the number you already use, so there\'s nothing new for customers to learn.']]},
    {slug:'google-review-follow-up', group:'ai', name:'Google Review Follow Up', tag:'Automatic, on brand follow up that gets more of your happy customers leaving reviews.',
     overview:'Most happy customers never leave a review, not because they don\'t want to, but because nobody asked them at the right time. We set up automatic, on brand follow up that asks at the right moment, without sounding like a robot.',
     benefits:['More reviews from customers who were already happy','Follow up that happens automatically, with no manual chasing','Requests and responses that sound like your business, not a template'],
     included:['Automated review request follow up','On brand messaging tailored to your business','Monthly reporting on review volume and rating'],
     steps:[['Set up','Follow up messaging is written in your voice and connected to however you currently manage customers.'],['Automate','Requests go out automatically at the right moment after a job or purchase, with no manual chasing.'],['Monitor','Volume and sentiment are tracked monthly.']],
     faqs:[['Will this feel like spam to my customers?','No, requests are timed and worded to feel like a genuine follow up, not a mass blast.'],['What happens if a customer leaves negative feedback?','Negative feedback is flagged to you immediately, so you can respond fast, put things right, and keep the customer happy.']]}
  ];
  const EXTRA = {
    'local-seo':{
      why:'When someone needs a local service, they search for it and pick from the first few businesses Google shows them, usually in the map results. If you\'re not there, those customers go to whoever is. Local SEO is how you earn that spot: a technically sound website, content that matches what people in your area actually search for, and consistent business details across the web so Google trusts you.',
      who:['Trades and local service businesses competing for "near me" searches','Businesses that rely on customers from a particular town or area','Anyone whose competitors keep appearing above them on Google Maps'],
      when:['Week 1','Weeks 2 to 4','Every month']},
    'google-business-profile':{
      why:'For many local searches, your Google Business Profile is the first thing a customer sees, often before they ever reach your website. A complete, active profile with the right categories, real photos and recent reviews gives people the confidence to call, and helps Google show you to more of them.',
      who:['Businesses with a Google listing that has never been properly set up','Anyone getting fewer calls from Google Maps than they should','Businesses with several services or service areas to show off'],
      when:['Week 1','Week 2','Ongoing']},
    'website-design':{
      why:'Your website is where people decide whether to get in touch. If it\'s slow, awkward on a phone, or doesn\'t make the next step obvious, visitors leave, however much you spend getting them there. A site built around your customers turns more of those visits into calls, forms and bookings.',
      who:['Businesses whose current site looks dated or rarely brings in enquiries','New businesses that need a proper site from day one','Anyone sending traffic to pages that don\'t convert'],
      when:['Week 1','Build phase','Launch']},
    'social-media-management':{
      why:'Customers often check your social profiles before they call, to see that you\'re active, trustworthy and do good work. Regular, on brand posts keep you front of mind between jobs and show the quality of what you do, without you having to find the time to post yourself.',
      who:['Businesses that know they should post but never find the time','Anyone whose social profiles haven\'t been updated in months','Businesses that want a consistent presence without hiring in house'],
      when:['Week 1','Week 2','Weeks 3 to 4','Ongoing','Monthly']},
    'missed-call-text-back':{
      why:'When a call goes unanswered, most people don\'t leave a voicemail. They ring the next business on the list. An instant text back keeps the conversation going, gives the customer an easy way to book, and means a busy day on the job doesn\'t cost you work.',
      who:['Trades and service businesses who can\'t answer the phone mid job','Busy practices and shops where calls get missed at peak times','Anyone who has lost a job because the customer rang someone else'],
      when:['Week 1','Week 1','Week 2','Monthly']},
    'google-review-follow-up':{
      why:'Reviews play a big part in whether a customer picks you, and they help your Google ranking too. Most happy customers are willing to leave one; they just need asking at the right moment. Automating that ask means your review count grows steadily without you chasing anyone.',
      who:['Businesses with happy customers but only a handful of Google reviews','Anyone who forgets to ask for reviews at the end of a job','Businesses whose competitors have far more reviews than they do'],
      when:['Week 1','Week 2','Monthly']}
  };
  SERVICES.forEach(s => Object.assign(s, EXTRA[s.slug]));
  const BASE = root.dataset.base || '';
  const ROUTE = {home:'', services:'services/', work:'work/', about:'about/', faqs:'faqs/', contact:'contact/', privacy:'privacy/', terms:'terms/', 'strategy-call':'contact/#strategy-call'};
  SERVICES.forEach(sv => ROUTE[sv.slug] = 'services/' + sv.slug + '/');
  const SHORT = {
    'local-seo':'Rank higher for the searches that bring customers through the door.',
    'google-business-profile':'Turn your Google listing into your strongest source of new enquiries.',
    'website-design':'A site built to convert, not just to look good in a portfolio.',
    'social-media-management':'Consistent, on brand posting across your channels with active replies, so your business stays visible between jobs.',
    'missed-call-text-back':'Automation that follows up missed calls for you when you can\'t get to the phone.',
    'google-review-follow-up':'Automatic, on brand follow up that gets more of your happy customers leaving reviews.'
  };
  const LABEL = {'local-seo':'Local SEO','google-business-profile':'Google Business Profile','website-design':'Websites and landing pages','social-media-management':'Social media','missed-call-text-back':'Missed call text back','google-review-follow-up':'Review follow up'};
  const LINK = {'local-seo':'Local SEO','google-business-profile':'Google Business Profiles','website-design':'websites and landing pages','social-media-management':'social media management','missed-call-text-back':'missed call text back','google-review-follow-up':'review follow up'};
  const VZ = {'local-seo':'seo','google-business-profile':'gbp','website-design':'web','social-media-management':'social','missed-call-text-back':'mctb','google-review-follow-up':'rev'};
  const WORK = [
    {tag:'Local SEO', title:'Rebuilding search visibility for an independent HVAC company', desc:'A ground up Google Business Profile and local SEO structure for a trades business competing against national franchises on search, the kind of groundwork most local businesses are missing.', art:'serp'},
    {tag:'Branding and website', title:'A new identity and site for a boutique fitness studio', desc:'Brand identity and a conversion focused website built around class bookings and trial sign ups, replacing a generic template site that wasn\'t built to sell anything.', art:'site'},
    {tag:'AI solutions', title:'AI review follow up for a multi location practice', desc:'Automated, on brand review requests and a first response chatbot designed to handle the repetitive enquiries that were previously eating up front desk time.', art:'chat'},
    {tag:'Website design', title:'A conversion focused rebuild for an independent dental practice', desc:'Replacing an outdated site with a fast, mobile first build structured around booking enquiries rather than a static About page nobody reads.', art:'phone'}
  ];
  const FAQS = [
    ['SEO','Can you guarantee a number one ranking?','No, and any agency that promises this isn\'t being straight with you. Nobody controls Google\'s algorithm. What we can guarantee is a properly executed strategy and honest reporting on what it\'s achieving.'],
    ['Websites','Do I own my website once it\'s built?','Yes, completely. The site, the content, and the domain are yours, and there\'s no dependency on us to keep it running.'],
    ['Timelines','How quickly will I see results?','It depends on the service. SEO typically takes 8 to 12 weeks to show movement, while a new website or ad campaign can start generating enquiries within days of going live.'],
    ['Reporting','How will I know what I\'m getting for my money?','You\'ll get monthly reporting written in plain English, not a dashboard full of numbers with no explanation. If something isn\'t working, we\'ll tell you.'],
    ['AI tools','Is my customer data safe with the AI tools you use?','Yes, the tools we use are limited to your own business data, such as your services and review requests, and don\'t share it beyond what\'s needed to do the job.'],
    ['Pricing','Are there any hidden fees on top of the monthly plan?','No. Everything is covered in the fixed monthly price we agree upfront, and anything extra is always discussed and agreed with you first.'],
    ['Contracts','Am I locked into a long contract?','No, our plans run monthly with no long term tie in. We\'d rather earn your business every month than lock you into a contract.'],
    ['Support','Who do I actually speak to if I have a question?','The person doing the work, not a call centre or a rotating account manager. Direct access is part of how we operate.']
  ];

  /* ---------------- demos ---------------- */
  const DEMO = {};
  const eg = t => `<p class="eg">${t}</p>`;

  /* Local SEO: drag through the months */
  const RANK = {pos:[18,15,11,7,5,4,3], seen:[140,260,520,880,1240,1560,1820], calls:[2,3,6,9,13,17,21]};
  DEMO.seo = {
    html: () => `<div class="demo d-seo"><div class="rank"><div class="chart"><div class="plot"><svg viewBox="0 0 300 140" preserveAspectRatio="none" aria-hidden="true"><g class="grid"><line x1="0" y1="0" x2="300" y2="0"/><line x1="0" y1="66" x2="300" y2="66"/><line x1="0" y1="140" x2="300" y2="140"/></g><path class="ra"/><path class="rl"/></svg><span class="dot"></span></div><span class="ax" style="left:6px;top:8px">1st</span><span class="ax" style="left:2px;top:42%">10th</span><span class="ax" style="left:2px;bottom:28px">20th</span><span class="ax" style="left:34px;bottom:8px">Start</span><span class="ax" style="right:12px;bottom:8px">Month 6</span></div>
      <div class="kpis"><div class="kpi"><small>Average position on Google</small><b data-k="pos">18th</b></div><div class="kpi"><small>Times you showed up</small><b data-k="seen">140</b></div><div class="kpi"><small>Calls and enquiries</small><b data-k="calls">2</b></div></div></div>
      <div class="range"><label for="rk">Drag through the months <span data-k="m">Start</span></label><input type="range" min="0" max="6" step="1" value="0"></div>${eg('Example figures for a typical local business. Your market, starting point and competition change the numbers.')}</div>`,
    init(el){
      const r = $('input', el), line = $('.rl', el), area = $('.ra', el), dot = $('.dot', el);
      r.id = 'rk' + Math.random().toString(36).slice(2,7); $('label', el).htmlFor = r.id;
      const X = m => m * 50, Y = p => (p - 1) / 19 * 140;
      const ord = n => n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th');
      const set = v => {
        const m = Math.round(v), pts = RANK.pos.slice(0, m + 1).map((p, i) => [X(i), Y(p)]);
        const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
        line.setAttribute('d', d); area.setAttribute('d', d + ` L${pts[pts.length-1][0]} 140 L0 140Z`);
        dot.style.left = (X(m) / 300 * 100) + '%'; dot.style.top = (Y(RANK.pos[m]) / 140 * 100) + '%';
        $('[data-k=pos]', el).textContent = ord(RANK.pos[m]);
        $('[data-k=seen]', el).textContent = RANK.seen[m].toLocaleString('en-GB');
        $('[data-k=calls]', el).textContent = RANK.calls[m];
        $('[data-k=m]', el).textContent = m ? 'Month ' + m : 'Start';
        r.style.setProperty('--fill', (m / 6 * 100) + '%');
      };
      let touched = false;
      r.addEventListener('input', () => { touched = true; set(r.value); });
      set(0);
      whenSeen(el, async () => { for (let m = 1; m <= 6 && !touched && el.isConnected; m++){ await wait(520); if (!touched) { r.value = m; set(m); } } });
    }
  };

  /* Google Business Profile: switch things on and watch the profile fill in */
  const GBP_T = [['photos','Real photos'],['hours','Opening hours'],['services','Services listed'],['reviews','Reviews answered'],['posts','Weekly updates']];
  DEMO.gbp = {
    html: () => `<div class="demo d-gbp"><div class="gbp"><div class="prof" aria-hidden="true"><div class="photos"><i></i><i></i><i></i></div><div class="pb"><span class="pn">Your Business Name</span><span class="pr"><b style="color:var(--ink)">4.8</b><span class="st">${STAR.repeat(5)}</span><span data-k="rc">(6)</span></span><span class="row"><span class="v off" data-k="hours"><span class="open">Open now</span>, closes 6pm</span></span><span class="row"><span class="v off" data-k="services">Repairs, installs, emergency call outs</span></span></div><div class="post">Latest update: finished a full bathroom refit in Lancing this week.</div><div class="acts"><span>Call</span><span>Directions</span><span>Website</span></div></div>
      <div><div class="checks" role="group" aria-label="Profile improvements">${GBP_T.map(([k,t]) => `<button type="button" class="tog" data-k="${k}" aria-pressed="false">${t}<span class="sw" aria-hidden="true"></span></button>`).join('')}</div>
      <div class="meter"><div class="lbl"><span>Profile strength</span><b data-k="pct">20%</b></div><div class="trk"><div class="fil"></div></div></div>
      <div class="meter"><div class="lbl"><span>Calls from Google a month</span><b data-k="calls">4</b></div><div class="trk"><div class="fil" data-k="callbar"></div></div></div></div></div>
      ${eg('Tap each improvement to switch it on. Example figures only.')}</div>`,
    init(el){
      const g = $('.gbp', el), togs = $$('.tog', el);
      let touched = false;
      const sync = () => {
        const on = togs.filter(t => t.getAttribute('aria-pressed') === 'true').map(t => t.dataset.k);
        GBP_T.forEach(([k]) => g.classList.toggle('on-' + k, on.includes(k)));
        $('[data-k=hours]', el).classList.toggle('off', !on.includes('hours'));
        $('[data-k=services]', el).classList.toggle('off', !on.includes('services'));
        $('[data-k=rc]', el).textContent = on.includes('reviews') ? '(42)' : '(6)';
        const pct = 20 + on.length * 16, calls = 4 + on.length * 5;
        $('[data-k=pct]', el).textContent = pct + '%';
        $$('.fil', el)[0].style.setProperty('--w', pct + '%');
        $('[data-k=calls]', el).textContent = calls;
        $('[data-k=callbar]', el).style.setProperty('--w', (calls / 29 * 100) + '%');
      };
      togs.forEach(t => t.addEventListener('click', e => { if (e.isTrusted) touched = true; t.setAttribute('aria-pressed', t.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); sync(); }));
      sync();
      whenSeen(el, async () => { for (const t of togs){ await wait(650); if (touched || !el.isConnected) return; t.click(); } });
    }
  };

  /* Website: drag between the old site and the rebuild */
  DEMO.web = {
    html: () => `<div class="demo d-web"><div class="ba" style="--x:50%">
        <div class="side before" aria-hidden="true"><div class="chrome"><i></i><i></i><i></i></div><div class="pg"><div class="sb"><b></b><b></b><b></b><b></b><b></b></div><div class="mn"><h5>WELCOME TO OUR WEBSITE!!</h5><span class="mq">Click HERE for our latest news and offers</span><span class="ln"></span><span class="ln" style="width:90%"></span><span class="ln" style="width:70%"></span><span class="tiny">Est. 1998. We do all types of work. Please call the office during opening hours or fill in the enquiry form on the contact page which can be found in the menu.</span><span class="ln" style="width:80%"></span></div></div></div>
        <div class="side after" aria-hidden="true"><div class="chrome"><i></i><i></i><i></i></div><div class="pg"><div class="nv"><span class="lg"></span><span class="bt">Get a quote</span></div><div class="hr"><div class="im"></div><div><h5>Boiler fixed today, by someone local.</h5><p>Engineers across West Sussex.</p><span class="cta">Book a visit</span><div class="trust"><span>4.9 rating</span><span>Same week visits</span></div></div></div></div></div>
        <span class="lab l">Before</span><span class="lab r">After</span>
        <div class="handle"><button type="button" class="knob" role="slider" aria-label="Compare the old site and the rebuild" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6-6 6 6 6M15 6l6 6-6 6"/></svg></button></div>
      </div>
      <div class="web-stats"><div class="kpi"><small>Loads in</small><b data-k="a">6.8s</b></div><div class="kpi"><small>Works on phones</small><b data-k="b">No</b></div><div class="kpi"><small>Next step</small><b data-k="c">Hidden</b></div></div>
      ${eg('Drag the handle, or use the arrow keys. An illustration, not a real client site.')}</div>`,
    init(el){
      const ba = $('.ba', el), knob = $('.knob', el);
      let x = 50, touched = false, drag = false;
      const set = v => {
        x = Math.max(4, Math.min(96, v)); ba.style.setProperty('--x', x + '%'); knob.setAttribute('aria-valuenow', Math.round(x));
        const after = x < 50;
        $('[data-k=a]', el).textContent = after ? '1.2s' : '6.8s';
        $('[data-k=b]', el).textContent = after ? 'Yes' : 'No';
        $('[data-k=c]', el).textContent = after ? 'First thing' : 'Hidden';
      };
      const fromEvent = e => { const r = ba.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); };
      ba.addEventListener('pointerdown', e => { touched = drag = true; ba.setPointerCapture(e.pointerId); fromEvent(e); });
      ba.addEventListener('pointermove', e => { if (drag) fromEvent(e); });
      ba.addEventListener('pointerup', () => drag = false); ba.addEventListener('pointercancel', () => drag = false);
      knob.addEventListener('keydown', e => { const d = {ArrowLeft:-5,ArrowRight:5,Home:-100,End:100}[e.key]; if (d !== undefined){ e.preventDefault(); touched = true; set(x + d); } });
      set(50);
      whenSeen(el, async () => {
        const anim = async (to, ms) => { const from = x, t0 = performance.now(); await new Promise(res => { const f = t => { if (touched){ res(); return; } const k = Math.min(1, (t - t0) / ms), e = k < .5 ? 2*k*k : 1 - Math.pow(-2*k+2, 2)/2; set(from + (to - from) * e); k < 1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); }); };
        if (reduce) return;
        await wait(300); await anim(88, 900); await wait(350); await anim(14, 1300); await wait(500); await anim(40, 700);
      });
    }
  };

  /* Social: plan the week, watch the feed fill */
  const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const POSTS = ['Before and after from Tuesday\'s job. Same day, start to finish.','Meet the team: twelve years on the tools and still loves a tricky one.','Review of the week: "Turned up on time and left it spotless."','Quick tip: bleed your radiators before the cold snap.','Booking up for next month. Get in touch for a slot.','Behind the scenes at this morning\'s job.','Our week in pictures. Thanks to everyone who booked in.'];
  DEMO.social = {
    html: () => `<div class="demo d-social"><div class="soc"><div><div class="week">${DAYS.map(d => `<span class="dn">${d}</span>`).join('')}${DAYS.map((d, i) => `<button type="button" class="day" data-i="${i}" aria-pressed="${[0,2,4].includes(i)}" aria-label="Post on ${d}"><span class="pl" aria-hidden="true">+</span><span class="pt" aria-hidden="true"></span></button>`).join('')}</div>
      <div class="soc-meta"><span class="chip" data-k="n">3 posts this week</span><span class="chip">Approved by you first</span><span class="chip">Replies handled</span></div>
      <p class="eg" style="margin-top:12px">Tap a day to add or remove a post.</p></div>
      <div class="feed" aria-live="polite"><div class="fh"><span class="av">${MK()}</span>Your Business</div></div></div></div>`,
    init(el){
      const feed = $('.feed', el), days = $$('.day', el), ims = ['','b','c'];
      const render = (fresh) => {
        $$('.fp', feed).forEach(f => f.remove());
        const on = days.filter(d => d.getAttribute('aria-pressed') === 'true').map(d => +d.dataset.i).reverse();
        on.forEach(i => feed.insertAdjacentHTML('beforeend', `<div class="fp"${i === fresh ? '' : ' style="animation:none"'}><div class="im ${ims[i % 3]}"></div><div class="tx">${esc(POSTS[i])}</div><div class="rx"><span>${DAYS[i]}</span><span>${8 + i * 3} likes</span><span>${1 + (i % 3)} comments</span></div></div>`));
        $('[data-k=n]', el).textContent = on.length + (on.length === 1 ? ' post' : ' posts') + ' this week';
      };
      days.forEach(d => d.addEventListener('click', () => { const on = d.getAttribute('aria-pressed') !== 'true'; d.setAttribute('aria-pressed', on); render(on ? +d.dataset.i : -1); }));
      render(-1);
    }
  };

  /* Missed call text back: ring the business */
  DEMO.mctb = {
    html: () => `<div class="demo d-mctb"><div class="mc"><div class="phone" aria-hidden="true"><div class="scr"><div class="sb"><i></i></div><div class="th"><span class="av">${MK()}</span><span>Your Business<small>Automatic text back</small></span></div><div class="msgs"></div><div class="call"><span class="ring">${PHONE}</span><b>New customer</b><small>Calling your business</small></div></div></div>
      <div><div class="mc-log">${[['Call goes unanswered','You\'re up a ladder or with a customer'],['Text sent in seconds','Written in your words, sent automatically'],['Customer replies','The conversation keeps going'],['Lead saved and booked','Logged so nothing gets lost']].map(([b,s]) => `<div class="mc-step"><i><svg viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></i><div><b>${b}</b><span>${s}</span></div></div>`).join('')}</div>
      <div class="demo-ctl" style="margin-top:18px"><button type="button" class="mini-btn" data-k="go">${PHONE.replace('<svg ', '<svg fill="currentColor" ')}Call the business</button></div></div></div>
      ${eg('A demo of the flow. The message is written with you before it goes live.')}</div>`,
    init(el){
      const msgs = $('.msgs', el), call = $('.call', el), steps = $$('.mc-step', el), btn = $('[data-k=go]', el);
      let run = 0;
      const add = (cls, html) => { msgs.insertAdjacentHTML('beforeend', `<div class="bub ${cls}">${html}</div>`); return msgs.lastElementChild; };
      const typing = async (cls, html, ms) => { const t = add(cls + ' typing', '<i></i><i></i><i></i>'); await wait(ms); t.className = 'bub ' + cls; t.innerHTML = html; };
      const go = async () => {
        const id = ++run; btn.disabled = true; msgs.innerHTML = ''; steps.forEach(s => s.classList.remove('ok'));
        const ok = () => id === run && el.isConnected;
        call.classList.add('show','ringing'); call.classList.remove('missed'); $('small', call).textContent = 'Calling your business';
        await wait(1700); if (!ok()) return;
        call.classList.remove('ringing'); call.classList.add('missed'); $('small', call).textContent = 'Missed call'; steps[0].classList.add('ok');
        await wait(900); if (!ok()) return;
        call.classList.remove('show'); add('sys', 'Missed call, just now');
        await wait(500); await typing('out', 'Sorry we missed your call, we\'re on a job. Reply with a good time and we\'ll ring you back, or tap here to book.', 900); if (!ok()) return; steps[1].classList.add('ok');
        await wait(700); await typing('in', 'Thursday morning would be great.', 1000); if (!ok()) return; steps[2].classList.add('ok');
        await wait(500); await typing('out', 'Booked you in for Thursday at 10am. See you then.', 800); if (!ok()) return; steps[3].classList.add('ok');
        btn.disabled = false; btn.lastChild.textContent = 'Run it again';
      };
      btn.addEventListener('click', go);
      whenSeen(el, () => { if (el.isConnected) go(); }, .5);
    }
  };

  /* Review follow up: rate the job */
  DEMO.rev = {
    html: () => `<div class="demo d-rev"><div class="rv"><div class="rv-card"><span class="from">Text from Your Business, after the job</span><p class="q">Thanks for choosing us today! How did we do?</p><div class="stars-in" role="radiogroup" aria-label="Rate the job">${[1,2,3,4,5].map(n => `<button type="button" role="radio" aria-checked="false" aria-label="${n} star${n > 1 ? 's' : ''}" data-n="${n}">${STAR}</button>`).join('')}</div><div data-k="out"></div></div>
      <div class="score"><div class="big"><b data-k="avg">4.6</b><span class="st">${STAR.repeat(5)}</span></div><span class="cnt" data-k="cnt">23 Google reviews</span><div class="bars">${[5,4,3,2,1].map(n => `<div><span>${n}</span><span><i data-b="${n}"></i></span></div>`).join('')}</div></div></div>
      <div class="demo-ctl"><span class="hint">Pick a rating as if you were the customer.</span><button type="button" class="mini-btn ghost" data-k="reset">Start again</button></div></div>`,
    init(el){
      const base = {5:17,4:4,3:1,2:1,1:0}; let dist = {...base};
      const stars = $$('.stars-in button', el), out = $('[data-k=out]', el);
      const draw = () => {
        const n = Object.values(dist).reduce((a, b) => a + b, 0), sum = Object.entries(dist).reduce((a, [k, v]) => a + k * v, 0);
        $('[data-k=avg]', el).textContent = (sum / n).toFixed(1);
        $('[data-k=cnt]', el).textContent = n + ' Google reviews';
        Object.entries(dist).forEach(([k, v]) => $(`[data-b="${k}"]`, el).style.setProperty('--w', (v / n * 100) + '%'));
      };
      const paint = n => stars.forEach((s, i) => s.classList.toggle('on', i < n));
      stars.forEach((s, i) => {
        s.addEventListener('mouseenter', () => paint(i + 1));
        s.addEventListener('mouseleave', () => paint(+(stars.find(x => x.getAttribute('aria-checked') === 'true')?.dataset.n || 0)));
        s.addEventListener('click', () => {
          const n = i + 1; stars.forEach(x => x.setAttribute('aria-checked', x === s)); paint(n); dist = {...base};
          if (n >= 4){ dist[n]++; out.innerHTML = '<p class="rv-out good">Thanks! We\'ve opened Google so you can share that in a couple of taps.</p>'; }
          else out.innerHTML = '<p class="rv-out priv">Thanks for telling us. This goes straight to the owner, so they can put it right before anything is posted.</p>';
          draw();
        });
      });
      $('[data-k=reset]', el).addEventListener('click', () => { dist = {...base}; stars.forEach(x => x.setAttribute('aria-checked', 'false')); paint(0); out.innerHTML = ''; draw(); });
      draw();
      whenSeen(el, async () => { if (reduce) return; for (let k = 1; k <= 5; k++){ await wait(140); if (out.innerHTML || !el.isConnected) return; paint(k); } await wait(500); if (!out.innerHTML) paint(0); });
    }
  };
  const mountDemo = (host, slug) => { const d = DEMO[VZ[slug]]; host.innerHTML = d.html(); d.init(host.firstElementChild); };

  /* ---------------- builders ---------------- */
  // home: service switcher
  (function(){
    const sw = $('#switch'); if (!sw) return;
    const tab = (s, i) => `<button type="button" class="tab" role="tab" id="tab-${s.slug}" aria-controls="stage" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-slug="${s.slug}">${esc(LABEL[s.slug])}<span class="bar" aria-hidden="true"></span></button>`;
    sw.innerHTML = `<div class="tabs" role="tablist" aria-orientation="vertical" aria-label="Services"><span class="grp">Visibility and marketing</span>${SERVICES.filter(s => s.group === 'vm').map(tab).join('')}<span class="grp">AI solutions <span class="chip">AI</span></span>${SERVICES.filter(s => s.group === 'ai').map((s) => tab(s, 9)).join('')}</div><div class="stage" id="stage" role="tabpanel" tabindex="0"></div>`;
    const stage = $('#stage'), tabs = $$('.tab', sw);
    const pick = (slug, focus) => {
      const s = SERVICES.find(x => x.slug === slug);
      tabs.forEach(t => { const on = t.dataset.slug === slug; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
      stage.setAttribute('aria-labelledby', 'tab-' + slug);
      stage.innerHTML = `<div class="stage-head panel-in"><h3>${esc(s.name)}</h3><p>${esc(SHORT[s.slug])}</p></div><div class="panel-in" data-demo></div><div class="stage-foot"><a class="btn btn-line" href="#${s.slug}">More about ${esc(LINK[s.slug])}</a>${s.group === 'ai' ? '<span class="chip">AI solution</span>' : ''}</div>`;
      mountDemo($('[data-demo]', stage), slug);
      fixLinks(stage);
    };
    tabs.forEach(t => t.addEventListener('click', () => pick(t.dataset.slug)));
    $('.tabs', sw).addEventListener('keydown', e => {
      const i = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
      const k = {ArrowDown:1,ArrowRight:1,ArrowUp:-1,ArrowLeft:-1}[e.key];
      if (k){ e.preventDefault(); pick(tabs[(i + k + tabs.length) % tabs.length].dataset.slug, true); }
    });
    pick(SERVICES[0].slug);
  })();

  // services page: chapters with live demos
  const chapter = s => `<article class="chap"><div class="chap-text"><h2 class="title">${esc(s.name)}</h2><p class="tagl">${esc(s.tag)}</p><ul>${s.benefits.slice(0,3).map(b => `<li>${CK}<span>${esc(b)}</span></li>`).join('')}</ul><a class="btn btn-line" href="#${s.slug}">More about ${esc(LINK[s.slug])}</a></div><div data-demo="${s.slug}"></div></article>`;
  if ($('#sgVM')){
    $('#sgVM').innerHTML = SERVICES.filter(s => s.group === 'vm').map(chapter).join('');
    $('#sgAI').innerHTML = SERVICES.filter(s => s.group === 'ai').map(chapter).join('');
    $$('#sgVM [data-demo], #sgAI [data-demo]').forEach(h => mountDemo(h, h.dataset.demo));
  }

  // work
  const ART = {
    serp:'<div class="a-serp"><div class="r"><i></i><b></b><small>1</small></div><div class="r"><i></i><b></b><small>2</small></div><div class="r you"><i></i><b></b><small>You</small></div></div>',
    site:'<div class="a-site"><div class="bar"><i></i><i></i><i></i></div><div class="pg"><div class="ln"><b></b><b></b><b></b><span class="pill">Book a trial</span></div><div class="im"></div></div></div>',
    chat:`<div class="a-chat"><div class="b me">Thanks for visiting today! Would you mind leaving us a quick review?</div><div class="b th">Of course, happy to!</div><div class="b me">Here's the link<div class="st">${STAR.repeat(5)}</div></div></div>`,
    phone:'<div class="a-phone"><div class="s"><div class="im"></div><b></b><b style="width:80%"></b><b style="width:60%"></b><span class="p">Book appointment</span></div></div>'
  };
  const workTile = w => `<article class="wk"><div><span class="tg">${esc(w.tag)}</span> <span class="chip" style="margin-left:6px">Concept</span><h3>${esc(w.title)}</h3><p>${esc(w.desc)}</p></div><div class="art" aria-hidden="true">${ART[w.art]}</div></article>`;
  if ($('#homeWork')) $('#homeWork').innerHTML = WORK.slice(0, 3).map(workTile).join('');
  if ($('#allWork')) $('#allWork').innerHTML = WORK.map(workTile).join('');

  // faqs
  const qa = (q, a, cat) => `<div class="qa"${cat ? ` data-cat="${esc(cat)}"` : ''}><button type="button" class="qh" aria-expanded="false"><span>${cat ? `<span class="cat">${esc(cat)}</span>` : ''}<span class="qt">${esc(q)}</span></span><span class="pm" aria-hidden="true"></span></button><div class="ab"><div><p>${esc(a)}</p></div></div></div>`;
  if ($('#faqList')) $('#faqList').innerHTML = FAQS.map(([c, q, a]) => qa(q, a, c)).join('');

  function bindQA(scope){
    $$('.qa .qh', scope).forEach(b => b.addEventListener('click', () => { const q = b.closest('.qa'), open = !q.classList.contains('open'); q.classList.toggle('open', open); b.setAttribute('aria-expanded', open); }));
  }
  bindQA(document);

  (function(){
    const list = $('#faqList'); if (!list) return;
    const items = $$('.qa', list), input = $('#faqSearch'), fl = $('#faqFilters');
    const cats = ['All', ...new Set(FAQS.map(f => f[0]))];
    fl.innerHTML = cats.map((c, i) => `<button type="button" class="fchip" aria-pressed="${i === 0}" data-c="${esc(c)}">${esc(c)}</button>`).join('');
    let cat = 'All';
    const run = () => {
      const q = input.value.trim().toLowerCase(); let n = 0;
      items.forEach((it, i) => {
        const [c, qq, a] = FAQS[i], hit = (cat === 'All' || c === cat) && (!q || (qq + ' ' + a).toLowerCase().includes(q));
        it.hidden = !hit; if (hit) n++;
        const mark = t => q ? esc(t).replace(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>') : esc(t);
        $('.qt', it).innerHTML = mark(qq); $('.ab p', it).innerHTML = mark(a);
        if (q && hit && !it.classList.contains('open')) { it.classList.add('open'); $('.qh', it).setAttribute('aria-expanded', 'true'); }
      });
      $('#faqCount').textContent = n === FAQS.length ? `${n} questions` : `Showing ${n} of ${FAQS.length} questions`;
      $('#faqEmpty').hidden = n > 0;
    };
    fl.addEventListener('click', e => { const b = e.target.closest('.fchip'); if (!b) return; cat = b.dataset.c; $$('.fchip', fl).forEach(x => x.setAttribute('aria-pressed', x === b)); run(); });
    input.addEventListener('input', run);
    run();
  })();

  // service detail
  function renderService(s){
    const others = SERVICES.filter(o => o.slug !== s.slug);
    $('#serviceDetail').innerHTML = `
      <header class="phead"><svg class="deco deco-bars" viewBox="0 0 267 242" aria-hidden="true"><path d="M53 128 93 78 160 242H105Z"/><path d="M97 0h53l117 242h-57Z"/></svg><span class="deco deco-dot" aria-hidden="true"></span><div class="wrap phead-split"><div>
        <p class="crumb"><a href="#services">Services</a><span aria-hidden="true">/</span><span>${s.group === 'ai' ? 'AI solutions' : 'Visibility and marketing'}</span></p>
        <h1 class="display" style="font-size:clamp(40px,5.4vw,74px)">${esc(s.name)}</h1><p class="lead">${esc(s.tag)}</p>
        <div class="btn-row"><a class="btn btn-primary" href="#strategy-call">Book a free strategy call</a><a class="btn btn-line" href="#how">How it works</a></div>
      </div><div data-demo></div></div></header>
      <section class="sec" style="padding-top:clamp(24px,4vw,48px)"><div class="wrap sd">
        <div class="sd-main">
          <div><p class="sd-over">${esc(s.overview)}</p></div>
          <div class="sd-block"><h2 class="title-s">Benefits</h2><ul class="ticks">${s.benefits.map(b => `<li>${CK}<span>${esc(b)}</span></li>`).join('')}</ul></div>
          <div class="sd-block"><h2 class="title-s">Why it matters</h2><p>${esc(s.why)}</p></div>
          <div class="sd-block"><h2 class="title-s">Who it's for</h2><ul class="ticks">${s.who.map(w => `<li>${CK}<span>${esc(w)}</span></li>`).join('')}</ul></div>
          <div class="sd-block" id="how"><h2 class="title-s">How it works</h2><p class="muted" style="margin:-8px 0 26px">Typical timings. We'll confirm yours on the strategy call.</p>
            <ol class="vsteps"><li class="track" aria-hidden="true"><i></i></li>${s.steps.map((st, i) => `<li class="vstep"><span class="when">${esc(s.when[i])}</span><h3>${esc(st[0])}</h3><p>${esc(st[1])}</p></li>`).join('')}</ol></div>
          <div class="sd-block"><h2 class="title-s">Common questions</h2><div class="faqs">${s.faqs.map(([q, a]) => qa(q, a)).join('')}</div></div>
        </div>
        <aside class="aside-card"><h3>What's included</h3><ul class="ticks">${s.included.map(b => `<li>${CK}<span>${esc(b)}</span></li>`).join('')}</ul><a class="btn btn-primary" href="#strategy-call">Book a free strategy call</a><p class="small">Pricing is agreed upfront on the call, with no hidden fees.</p></aside>
      </div></section>
      <section class="sec fog"><div class="wrap"><h2 class="title" style="margin-bottom:28px">More services</h2><div class="more-list">${others.map(o => `<a href="#${o.slug}"><div><b>${esc(o.name)}</b><br><span>${esc(SHORT[o.slug])}</span></div>${GO}</a>`).join('')}</div></div></section>
      <section class="sec night cta-band" data-cta>${MK('bg-mark')}<div class="wrap">
        <h2 class="title">Ready to grow your business?</h2>
        <p>Book a free strategy call. No pressure, no scripted pitch, just a conversation about what's possible for your business and what it would cost to get there.</p>
        <div class="btn-row"><a class="btn btn-light" href="#strategy-call">Book your free strategy call</a><a class="btn btn-line" href="#contact">Contact Amplivate</a></div>
      </div></section>`;
    mountDemo($('#serviceDetail [data-demo]'), s.slug);
    bindQA($('#serviceDetail'));
    bindBands($('#serviceDetail'));
    $('#serviceDetail a[href="#how"]').addEventListener('click', e => { e.preventDefault(); $('#how').scrollIntoView({behavior: reduce ? 'auto' : 'smooth'}); });
    if (window.__ampCtaObs) $$('#serviceDetail [data-cta]').forEach(el => window.__ampCtaObs.observe(el));
    fixLinks($('#serviceDetail'));
  }

  /* ---------------- theme ---------------- */
  const redrawers = [];
  const themeBtn = $('#themeBtn');
  const sysDark = matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : sysDark.matches;
  const syncTheme = () => { const d = isDark(); document.body.classList.toggle('is-dark', d); themeBtn.setAttribute('aria-label', d ? 'Switch to light mode' : 'Switch to dark mode'); redrawers.forEach(f => f()); };
  if (!root.dataset.theme) root.dataset.theme = 'light';
  themeBtn.addEventListener('click', () => { root.dataset.theme = isDark() ? 'light' : 'dark'; try { localStorage.setItem('amp-theme', root.dataset.theme); } catch(e){} syncTheme(); });
  sysDark.addEventListener('change', syncTheme);

  /* ---------------- header, nav indicator, drawer ---------------- */
  const hdr = $('#hdr');
  addEventListener('scroll', () => hdr.classList.toggle('scrolled', scrollY > 8), {passive:true});
  const ind = $('#navInd'), navLinks = $$('#navList a');
  const moveInd = a => { if (!a){ ind.style.opacity = 0; return; } ind.style.opacity = 1; ind.style.width = (a.offsetWidth - 28) + 'px'; ind.style.transform = `translateX(${a.offsetLeft + 14}px)`; };
  const curNav = () => navLinks.find(a => a.getAttribute('aria-current') === 'page');
  navLinks.forEach(a => { a.addEventListener('mouseenter', () => moveInd(a)); a.addEventListener('focus', () => moveInd(a)); });
  $('#navList').addEventListener('mouseleave', () => moveInd(curNav()));
  const menuBtn = $('#menuBtn'), drawer = $('#drawer');
  const setMenu = open => { drawer.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', open); menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); document.body.style.overflow = open ? 'hidden' : ''; };
  menuBtn.addEventListener('click', () => setMenu(!drawer.classList.contains('open')));
  $$('a', drawer).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------------- hero finder ---------------- */
  (function(){
    const f = $('#finder'); if (!f) return;
    const pack = $('#pack'), input = $('#finderInput'), echo = $('#finderEcho'), seg = $('.seg', f), thumb = $('.thumb', seg), segBtns = $$('button', seg);
    const ROWS = {
      nat:{n:'Big national franchise', r:'4.1', c:212, d:'Covers the whole county'},
      comp:{n:'Competitor down the road', r:'4.6', c:57, d:'0.8 miles away'},
      dir:{n:'Directory listing site', r:'3.9', c:18, d:'Lists other firms, not you'},
      you:{n:'Your business', r:'4.8', c:4, d:'0.3 miles away'}
    };
    const ORDER = {before:['nat','comp','dir','you'], after:['nat','you','comp','dir']};
    pack.innerHTML = Object.entries(ROWS).map(([k, v]) => `<div class="res" data-k="${k}"><span class="pos"></span><span class="nm"><b>${v.n}</b><small><span><b class="rt" style="display:inline;color:var(--ink);font-size:13px">${v.r}</b></span><span class="st">${STAR.repeat(5)}</span><span class="rc">(${v.c})</span><span class="dd">${v.d}</span></small></span><span class="act">Call</span></div>`).join('');
    const rows = Object.fromEntries($$('.res', pack).map(r => [r.dataset.k, r]));
    const H = () => (rows.nat.offsetHeight || 56) + 6;
    let state = 'before';
    const setState = st => {
      state = st; f.classList.toggle('after', st === 'after');
      segBtns.forEach((b, i) => { const on = b.dataset.state === st; b.setAttribute('aria-pressed', on); if (on){ thumb.style.width = b.offsetWidth + 'px'; thumb.style.transform = `translateX(${b.offsetLeft - 3}px)`; } });
      ORDER[st].forEach((k, i) => { const r = rows[k]; r.style.top = (i * H()) + 'px'; $('.pos', r).textContent = (k === 'you' && st === 'before') ? '9' : i + 1; r.classList.toggle('out', st === 'after' && i === 3); });
      const y = rows.you;
      y.classList.add('you'); y.classList.toggle('low', st === 'before');
      $('.rc', y).textContent = st === 'after' ? '(38)' : '(4)';
      $('.rt', y).textContent = st === 'after' ? '4.9' : '4.8';
      $('.dd', y).textContent = st === 'after' ? 'Open now, 0.3 miles away' : 'Page 2, most people never see it';
      $('#youPin').classList.toggle('dim', st === 'before'); $('#youN').textContent = st === 'after' ? '2' : '';
      $('#pin2').textContent = st === 'after' ? '3' : '2'; $('#pin3').parentElement.style.opacity = st === 'after' ? .35 : 1; $('#pin3').textContent = st === 'after' ? '' : '3';
    };
    let auto = true, loop = null;
    const stopAuto = () => { auto = false; clearInterval(loop); clearTimeout(typer); };
    segBtns.forEach(b => b.addEventListener('click', () => { stopAuto(); setState(b.dataset.state); }));
    $('#finderForm').addEventListener('submit', e => {
      e.preventDefault(); stopAuto();
      const q = input.value.trim().replace(/\s+/g, ' ').slice(0, 48) || 'plumber near me';
      echo.textContent = q; setState('before'); setTimeout(() => setState('after'), reduce ? 0 : 650);
    });
    input.addEventListener('focus', () => { if (auto){ stopAuto(); input.value = ''; } });
    // typed examples until someone interacts
    const EX = ['plumber near me','roofer in Worthing','dentist in Chichester','electrician near me','hair salon in Brighton','dog groomer in Horsham'];
    let typer = null, ei = 0;
    const type = (word, k = 0) => { if (!auto) return; input.value = word.slice(0, k); if (k <= word.length) typer = setTimeout(() => type(word, k + 1), 55); else { echo.textContent = word; } };
    setState('before');
    new ResizeObserver(() => setState(state)).observe(pack);
    if (!reduce){
      type(EX[0]);
      setTimeout(() => { if (auto) setState('after'); }, 2400);
      loop = setInterval(() => { if (!auto) return; ei = (ei + 1) % EX.length; setState('before'); type(EX[ei]); setTimeout(() => { if (auto) setState('after'); }, 1700); }, 5600);
    } else { input.value = EX[0]; setState('after'); }
  })();


  /* ---------------- interactive network background ---------------- */
  (function(){
    const c = document.createElement('canvas'); c.className = 'bg-net'; c.setAttribute('aria-hidden','true');
    document.body.prepend(c);
    const ctx = c.getContext('2d'); let w = 0, h = 0, dpr = 1, nodes = [], raf = 0;
    const ptr = {x:-9999, y:-9999, tx:-9999, ty:-9999};
    const seed = () => { const n = Math.round(Math.min(90, Math.max(28, w*h/17000))); nodes = Array.from({length:n}, () => ({x:Math.random()*w, y:Math.random()*h, vx:(Math.random()-.5)*.22, vy:(Math.random()-.5)*.22, r:1.2+Math.random()*1.6})); };
    const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); const ow = w; w = innerWidth; h = innerHeight; c.width = w*dpr; c.height = h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); if (!nodes.length || Math.abs(w-ow) > 80) seed(); };
    addEventListener('resize', size); size();
    addEventListener('pointermove', e => { ptr.tx = e.clientX; ptr.ty = e.clientY; if (ptr.x < -9000){ ptr.x = ptr.tx; ptr.y = ptr.ty; } }, {passive:true});
    document.addEventListener('pointerleave', () => { ptr.tx = ptr.ty = -9999; });
    let lastY = scrollY;
    const draw = () => {
      const col = getComputedStyle(root).getPropertyValue('--net').trim() || '157,176,202';
      const base = parseFloat(getComputedStyle(root).getPropertyValue('--net-a')) || .4;
      ctx.clearRect(0,0,w,h);
      if (ptr.tx > -9000){ ptr.x += (ptr.tx - ptr.x) * .12; ptr.y += (ptr.ty - ptr.y) * .12; } else { ptr.x = ptr.y = -9999; }
      const dy = (scrollY - lastY) * .15; lastY = scrollY;
      const link = Math.min(170, Math.max(110, w * .12)), reach = 190;
      for (const p of nodes){
        if (!reduce){ p.x += p.vx; p.y += p.vy - dy; }
        const dx = p.x - ptr.x, dyy = p.y - ptr.y, d = Math.hypot(dx, dyy);
        if (d < reach && d > 1){ const f = (1 - d/reach) * 1.4; p.x += dx/d * f; p.y += dyy/d * f; }
        if (p.x < -20) p.x = w + 20; else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20; else if (p.y > h + 20) p.y = -20;
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++){
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++){
          const b = nodes[j], d = Math.hypot(a.x-b.x, a.y-b.y);
          if (d < link){ ctx.strokeStyle = `rgba(${col},${(1 - d/link) * base * .55})`; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); }
        }
        const pd = Math.hypot(a.x-ptr.x, a.y-ptr.y);
        if (pd < reach + 60){ ctx.strokeStyle = `rgba(${col},${(1 - pd/(reach+60)) * base * 1.3})`; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(ptr.x,ptr.y); ctx.stroke(); }
        const glow = pd < reach + 60 ? (1 - pd/(reach+60)) : 0;
        ctx.fillStyle = `rgba(${col},${Math.min(1, base * 1.4 + glow * .5)})`;
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r + glow * 1.6, 0, 7); ctx.fill();
      }
    };
    const loop = () => { draw(); raf = requestAnimationFrame(loop); };
    redrawers.push(draw);
    if (reduce) draw(); else loop();
    document.addEventListener('visibilitychange', () => { if (reduce) return; if (document.hidden) cancelAnimationFrame(raf); else loop(); });
  })();

  /* ---------------- canvas: amplitude strip ---------------- */
  function setup(canvas, draw){
    const ctx = canvas.getContext('2d'); let w = 0, h = 0, raf = 0, running = false, t = 0;
    const size = () => { const dpr = Math.min(devicePixelRatio || 1, 2); w = canvas.clientWidth; h = canvas.clientHeight; if (!w || !h) return; canvas.width = w*dpr; canvas.height = h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); draw(ctx, w, h, t); };
    const loop = () => { t += .016; if (w && h) draw(ctx, w, h, t); raf = requestAnimationFrame(loop); };
    new ResizeObserver(size).observe(canvas); size();
    redrawers.push(() => { if (w && h) draw(ctx, w, h, t); });
    if (reduce) return;
    new IntersectionObserver(es => { const v = es[0].isIntersecting; if (v && !running){ running = true; loop(); } else if (!v && running){ running = false; cancelAnimationFrame(raf); } }).observe(canvas);
  }
  (function(){
    const canvas = $('#ampCanvas'); if (!canvas) return;
    const host = $('.hero');
    let px = -9999, target = -9999;
    host.addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect(); target = e.clientX - r.left; });
    host.addEventListener('pointerleave', () => { target = -9999; });
    setup(canvas, (ctx, w, h, t) => {
      ctx.clearRect(0,0,w,h);
      const hi = css('--steel-deep'), lo = css('--steel');
      const gap = w < 600 ? 6 : 8, bw = Math.max(2, gap*.42), n = Math.ceil(w/gap)+1;
      px += (target - px) * .08;
      for (let i = 0; i < n; i++){
        const x = i*gap, k = x/w, env = .3 + .7*Math.pow(k, 1.2);
        const osc = .5 + .5*Math.sin(i*.19 + t*1.6)*Math.cos(i*.047 - t*.7);
        const near = target > -9000 ? Math.exp(-Math.pow(x-px,2)/(2*120*120)) : 0;
        const amp = Math.min(1, env*osc + near*.6), bh = Math.max(2, amp*h*.92);
        ctx.globalAlpha = amp > .58 ? .55 + .45*amp : .12 + .45*amp; ctx.fillStyle = amp > .58 ? hi : lo;
        ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, h-bh, bw, bh, bw/2); else ctx.rect(x, h-bh, bw, bh); ctx.fill();
      }
      ctx.globalAlpha = 1;
    });
  })();

  /* ---------------- CTA bands follow the pointer a little ---------------- */
  function bindBands(scope){
    if (reduce) return;
    $$('.cta-band', scope).forEach(b => {
      const m = $('.bg-mark', b); if (!m) return;
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); m.style.setProperty('--tx', ((e.clientX - r.left) / r.width - .5) * 30 + 'px'); m.style.setProperty('--ty', ((e.clientY - r.top) / r.height - .5) * 24 + 'px'); });
      b.addEventListener('pointerleave', () => { m.style.setProperty('--tx', '0px'); m.style.setProperty('--ty', '0px'); });
    });
  }
  bindBands(document);

  /* ---------------- steps progress ---------------- */
  function onPageScroll(){
    const page = current(); if (!page) return;
    const vh = innerHeight;
    $$('.steps, .vsteps', page).forEach(st => {
      const r = st.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh*.75 - r.top) / (r.height*.85 + vh*.1)));
      st.style.setProperty('--p', p.toFixed(3));
      const items = $$('.step, .vstep', st); items.forEach((s, i) => s.classList.toggle('on', p >= i / items.length + .02));
    });
  }
  addEventListener('scroll', onPageScroll, {passive:true}); addEventListener('resize', onPageScroll);

  /* ---------------- legal: contents with scroll spy ---------------- */
  $$('.legal-grid').forEach(g => {
    const toc = $('.toc', g), hs = $$('.prose h2', g), pg = g.closest('.page').dataset.page;
    hs.forEach((h, i) => h.id = pg + '-' + i);
    toc.innerHTML = hs.map(h => `<a href="#${h.id}">${esc(h.textContent)}</a>`).join('');
    const links = $$('a', toc);
    links.forEach((a, i) => a.addEventListener('click', e => { e.preventDefault(); hs[i].scrollIntoView({behavior: reduce ? 'auto' : 'smooth'}); }));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ const i = hs.indexOf(e.target); links.forEach((a, j) => a.classList.toggle('on', i === j)); } }), {rootMargin:'-20% 0px -70% 0px'});
    hs.forEach(h => io.observe(h));
  });

  /* ---------------- pages, links and the sweep between pages ---------------- */
  function fixLinks(scope){
    $$('a[href^="#"]', scope || document).forEach(a => { const k = a.getAttribute('href').slice(1); if (k in ROUTE) a.setAttribute('href', (BASE + ROUTE[k]) || './'); });
  }
  const current = () => $('.page');
  const PAGE = document.body.dataset.page || 'home';
  function markStrategy(){
    if (PAGE !== 'contact' || location.hash !== '#strategy-call') return;
    setTimeout(() => {
      setTopic('Free strategy call');
      const sc = $('#sc-block'); if (sc){ sc.classList.remove('flash'); void sc.offsetWidth; sc.classList.add('flash'); }
      if (innerWidth < 961 && $('#cform')) $('#cform').scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'start'});
    }, 400);
  }
  addEventListener('hashchange', markStrategy);
  const sweep = $('#sweep');
  document.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]'); if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    const href = a.getAttribute('href'); if (!href || href.startsWith('#') || /^(mailto|tel):/.test(href)) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname){ if (url.hash) return; e.preventDefault(); scrollTo({top:0, behavior: reduce ? 'auto' : 'smooth'}); return; }
    if (reduce || !sweep) return;
    e.preventDefault(); setMenu(false);
    try { sessionStorage.setItem('amp-sweep', '1'); } catch(err){}
    sweep.classList.remove('out'); void sweep.offsetWidth; sweep.classList.add('in');
    setTimeout(() => { location.href = url.href; }, 520);
  });
  addEventListener('pageshow', e => { if (e.persisted && sweep){ sweep.classList.remove('in','out'); root.classList.remove('sweep-on'); } });

  /* ---------------- mobile booking bar ---------------- */
  (function(){
    const bar = $('#mbar'); if (!bar) return; let inCta = false;
    const update = () => { const pg = current(); bar.classList.toggle('show', scrollY > 520 && !inCta && pg && pg.dataset.page !== 'contact'); };
    const seen = new Set();
    const ob = new IntersectionObserver(es => { es.forEach(e => e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)); inCta = seen.size > 0; update(); });
    $$('[data-cta], footer').forEach(el => ob.observe(el)); window.__ampCtaObs = ob;
    addEventListener('scroll', update, {passive:true}); addEventListener('hashchange', () => setTimeout(update, 700)); update();
  })();

  /* ---------------- contact ---------------- */
  const sel = $('#cf-topic');
  let tbtns = [];
  function setTopic(v, focus){ if (!sel) return; sel.value = v; tbtns.forEach((b, i) => { const on = sel.options[i].value === v; b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); }); }
  function copyText(text, btn, label){
    const fail = () => { btn.textContent = 'Press Ctrl+C to copy'; setTimeout(() => btn.textContent = label, 2400); };
    try { navigator.clipboard.writeText(text).then(() => { btn.textContent = 'Copied'; setTimeout(() => btn.textContent = label, 1800); }, fail); } catch(e){ fail(); }
  }
  $$('[data-copy]').forEach(b => b.addEventListener('click', () => copyText(b.dataset.copy, b, 'Copy')));
  if (sel){
    const topics = $('#topics');
    topics.innerHTML = [...sel.options].map(o => `<button type="button" class="topic" role="radio" aria-checked="${o.selected}" tabindex="${o.selected ? 0 : -1}">${esc(o.text.replace(' & ', ' and '))}</button>`).join('');
    tbtns = $$('.topic', topics);
    tbtns.forEach((b, i) => b.addEventListener('click', () => setTopic(sel.options[i].value)));
    topics.addEventListener('keydown', e => { const k = {ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[e.key]; if (!k) return; e.preventDefault(); const i = sel.selectedIndex; setTopic(sel.options[(i + k + sel.options.length) % sel.options.length].value, true); });
    const msg = $('#cf-msg'); msg.addEventListener('input', () => $('#msgCount').textContent = `${msg.value.length} of 2000`);
    const form = $('#cform'), done = $('#cdone'), sent = $('#csent'), errBox = $('#cerr'), submit = $('button[type="submit"]', form);
    const setErr = (id, m) => { const f = $('#' + id).closest('.fld'); f.classList.toggle('bad', !!m); $('.err', f).textContent = m || ''; };
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (errBox) errBox.hidden = true;
      const name = $('#cf-name').value.trim(), email = $('#cf-email').value.trim(), biz = $('#cf-biz').value.trim(), topic = sel.value, m = msg.value.trim();
      let ok = true;
      setErr('cf-name', name ? '' : 'Add your name so we know who to reply to.'); ok = ok && !!name;
      const em = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      setErr('cf-email', em ? '' : 'Enter an email address like name@business.co.uk.'); ok = ok && em;
      setErr('cf-msg', m ? '' : 'Tell us a little about what you need.'); ok = ok && !!m;
      if (!ok){ const bad = $('.fld.bad input, .fld.bad textarea', form); if (bad) bad.focus(); return; }
      const subject = `Website enquiry: ${topic}${biz ? ' (' + biz + ')' : ''}`;
      const key = (form.dataset.web3formsKey || '').trim();
      if (!key){
        const body = `Name: ${name}\nEmail: ${email}\nBusiness: ${biz || 'Not given'}\nEnquiry: ${topic}\n\n${m}`;
        $('#cpre').textContent = `To: hello@amplivate.co.uk\nSubject: ${subject}\n\n${body}`;
        $('#cMailto').href = `mailto:hello@amplivate.co.uk?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        form.hidden = true; done.hidden = false; done.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'center'});
        return;
      }
      const label = submit.textContent; submit.disabled = true; submit.textContent = 'Sending';
      try {
        const res = await fetch('https://api.web3forms.com/submit', {method:'POST', headers:{'Content-Type':'application/json', Accept:'application/json'},
          body: JSON.stringify({access_key:key, subject, from_name:'Amplivate website', name, email, business: biz || 'Not given', enquiry: topic, message: m, botcheck: $('#cf-bot') ? $('#cf-bot').checked : false})});
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) throw new Error('send failed');
        form.hidden = true; sent.hidden = false; sent.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'center'});
      } catch(err){ if (errBox) errBox.hidden = false; }
      finally { submit.disabled = false; submit.textContent = label; }
    });
    const again = $('#cAgain'); if (again) again.addEventListener('click', () => { form.reset(); setTopic('General enquiry'); $('#msgCount').textContent = '0 of 2000'; sent.hidden = true; form.hidden = false; $('#cf-name').focus(); });
    $('#cEdit').addEventListener('click', () => { done.hidden = true; form.hidden = false; msg.focus(); });
    $('#scBtn').addEventListener('click', () => { setTopic('Free strategy call'); form.hidden = false; done.hidden = true; if (sent) sent.hidden = true; $('#cf-name').focus({preventScroll:true}); form.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'start'}); });
    $('#cCopyMsg').addEventListener('click', e => copyText($('#cpre').textContent, e.currentTarget, 'Copy message'));
  }

  /* ---------------- start ---------------- */
  syncTheme();
  if (PAGE === 'service'){ const sv = SERVICES.find(x => x.slug === document.body.dataset.slug); if (sv) renderService(sv); }
  fixLinks(document);
  moveInd(curNav());
  onPageScroll();
  markStrategy();
  if (root.classList.contains('sweep-on') && sweep){ root.classList.remove('sweep-on'); sweep.classList.add('out'); setTimeout(() => sweep.classList.remove('out'), 700); }
  else if (PAGE === 'home'){ document.body.classList.add('load'); requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.remove('load'))); }
  setTimeout(() => $$('.wm.draw').forEach(w => w.classList.remove('draw')), 2200);
})();
