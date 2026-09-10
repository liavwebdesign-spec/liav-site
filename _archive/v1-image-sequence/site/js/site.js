/* =========================================================
   שכבת ה-GSAP של האתר. כל מהלך מסומן ב-MV-ID שלו מהמאגר.
   ייבוא התנהגות בלבד: הצבעים והפונטים מגיעים מהטוקנים.
   ========================================================= */
gsap.registerPlugin(ScrollTrigger, SplitText);
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
const EASE = 'power3.out';

/* ---------- G38: Lenis מניע את הגלילה, ScrollTrigger והמנוע מאזינים ---------- */
let lenis = null;
if(!REDUCE){
  /* content: body. עם overflow על ה-html, ה-documentElement נמדד 0 והגבול של Lenis היה 0 */
  lenis = new Lenis({ lerp: .1, wheelMultiplier: 1, syncTouch: false, content: document.body });
  lenis.on('scroll', e => { ScrollTrigger.update(); window.sequence && sequence.onScroll(e.scroll); });
  gsap.ticker.add(t => { try{ lenis.raf(t * 1000); }catch(err){ console.error('[lenis]', err); } });
  gsap.ticker.lagSmoothing(0);
  lenis.stop();                     /* נעול עד שהפרילודר עולה */
}else{
  addEventListener('scroll', () => window.sequence && sequence.onScroll(scrollY), {passive:true});
}

/* ---------- G15: פרילודר עולה כשהסצנה הראשונה מוכנה ---------- */
(function(){
  const pre = document.getElementById('pre');
  let done = false;
  function up(){
    if(done) return; done = true;
    gsap.to(pre, { yPercent:-100, duration:.7, ease:'power3.inOut', delay:.25,
      onComplete(){ pre.style.display = 'none'; lenis && lenis.start(); ScrollTrigger.refresh(); } });
  }
  (window.sequence ? sequence.ready : Promise.resolve()).then(up);
  /* ?at=N: מצב QA. מדלג על הפרילודר וקופץ למיקום גלילה, כמה פעמים כי הפריסה
     משתנה כשה-pin spacers של ScrollTrigger נוספים */
  const at = +new URLSearchParams(location.search).get('at');
  if(at > 0){
    done = true; pre.style.display = 'none'; lenis && lenis.start();
    const jump = () => {
      if(lenis){ lenis.resize(); lenis.scrollTo(at, {immediate:true, force:true}); }
      scrollTo(0, at); window.sequence && sequence.onScroll(at); ScrollTrigger.update();
      document.documentElement.dataset.at = String(scrollY|0);
    };
    jump(); [600, 1800, 3500].forEach(ms => setTimeout(jump, ms));
    (window.sequence ? sequence.ready : Promise.resolve()).then(() => setTimeout(jump, 200));
  }
  setTimeout(up, 9000);            /* רשת איטית: לא משאירים מסך שחור */
})();

/* ---------- B23: תפריט מסך מלא ---------- */
(function(){
  const btn = document.querySelector('.nv-toggle'), ov = document.querySelector('.nv-overlay');
  const links = [...ov.querySelectorAll('a')];
  let open = false, lastFocus = null;
  function set(v){
    open = v;
    document.body.classList.toggle('nv-open', v);
    btn.setAttribute('aria-expanded', String(v));
    ov.setAttribute('aria-hidden', String(!v));
    btn.querySelector('.nv-label').textContent = v ? 'סגירה' : 'תפריט';
    if(lenis){ v ? lenis.stop() : lenis.start(); }
    else { document.body.style.overflow = v ? 'hidden' : ''; }
    if(v){ lastFocus = document.activeElement; setTimeout(()=>links[0].focus(), 260); }
    else if(lastFocus) lastFocus.focus();
  }
  btn.addEventListener('click', () => set(!open));
  links.forEach(a => a.addEventListener('click', e => {
    set(false);
    const id = a.getAttribute('href');
    if(id && id.startsWith('#') && lenis){ e.preventDefault(); setTimeout(()=>lenis.scrollTo(id, {offset:0, duration:1.4}), 320); }
  }));
  addEventListener('keydown', e => {
    if(!open) return;
    if(e.key === 'Escape'){ set(false); return; }
    if(e.key !== 'Tab') return;
    const f = [btn, ...links], i = f.indexOf(document.activeElement);
    const next = e.shiftKey ? (i<=0 ? f.length-1 : i-1) : (i===f.length-1 ? 0 : i+1);
    e.preventDefault(); f[next].focus();
  });
  /* קישורי עוגן בשאר העמוד עוברים דרך Lenis */
  document.querySelectorAll('a[href^="#"]:not(.nv-link)').forEach(a => a.addEventListener('click', e => {
    if(!lenis) return; e.preventDefault(); lenis.scrollTo(a.getAttribute('href'), {duration:1.4});
  }));
})();

/* ---------- G59: עבודות נבחרות מתקרבות מהעומק ---------- */
(function(){
  const cards = gsap.utils.toArray('.dp-card');
  if(REDUCE){ gsap.set(cards, {position:'relative', opacity:1, marginBottom:24}); document.querySelector('.dp').style.height='auto'; return; }
  const FAR=-1400, NEAR=140, SLOT=.6, DUR=.9;
  const tl = gsap.timeline({ scrollTrigger:{ trigger:'.dp', start:'top top', end:'bottom bottom', scrub:.6 } });
  cards.forEach((c,i) => {
    tl.fromTo(c, {z:FAR, opacity:0, filter:'blur(14px)'}, {z:NEAR, opacity:1, filter:'blur(0px)', ease:'none', duration:DUR}, i*SLOT)
      .to(c, {opacity:1, duration:DUR*.4, ease:'none'}, i*SLOT);
    if(i < cards.length-1) tl.to(c, {opacity:0, ease:'none', duration:.25}, i*SLOT + DUR*.86);
  });
  gsap.from('.dp-eyebrow', { autoAlpha:0, y:14, duration:.8, ease:EASE, scrollTrigger:{ trigger:'.dp', start:'top 60%', once:true } });
})();

/* ---------- G37: ענן עבודות מרחפות בעומק (דסקטופ בלבד) ---------- */
(function(){
  const sec = document.querySelector('.cloud'), imgs = [...sec.querySelectorAll('.cloud-img')];
  if(innerWidth < 900 || REDUCE){
    gsap.from(imgs, { autoAlpha:0, y:24, duration:.8, ease:EASE, stagger:.06, scrollTrigger:{ trigger:sec, start:'top 75%', once:true } });
    return;
  }
  imgs.forEach(el => { const w = +el.dataset.w; gsap.set(el, { left:el.dataset.x+'%', top:el.dataset.y+'%', width:w+'vw', height:w*0.755+'vw', autoAlpha:0, scale:.9 }); });
  gsap.to(imgs, { autoAlpha:1, scale:1, duration:.9, ease:EASE, stagger:{each:.06, from:'random'}, scrollTrigger:{ trigger:sec, start:'top 70%', toggleActions:'play none none none' } });
  const tl = gsap.timeline({ scrollTrigger:{ trigger:sec, start:'top top', end:'+=160%', pin:true, scrub:1 } });
  imgs.forEach(el => tl.to(el, { y:() => -innerHeight*0.55*(+el.dataset.d), ease:'none' }, 0));
  if(FINE){
    const setters = imgs.map(el => ({ x:gsap.quickTo(el,'x',{duration:.9, ease:'power3'}), d:+el.dataset.d }));
    sec.addEventListener('mousemove', e => { const r = sec.getBoundingClientRect(); const nx = (e.clientX - r.left)/r.width - .5; setters.forEach(s => s.x(-nx*60*s.d)); });
  }
})();

/* ---------- G4: המניפסט נחשף. (א) בדסקטופ, (ב) בנייד ---------- */
(function(){
  if(REDUCE) return;
  const clip = innerWidth >= 900;
  document.querySelectorAll('.t-reveal').forEach(h => {
    const s = new SplitText(h, { type:'words' });   /* עברית: בלי chars. בלי lines: שורה אחת, והנקודה לא נופלת לשורה משלה */
    const from = clip ? { clipPath:'inset(100% 0% 0% 0%)', opacity:0 } : { opacity:.15 };
    gsap.from(s.words, { ...from, stagger:.5, scrollTrigger:{ trigger:h, start:'top 80%', end:'top 30%', scrub:1 } });
  });
})();

/* ---------- G12: פרלקס עדין בסקשן "מי אני" ---------- */
(function(){
  if(REDUCE) return;
  const RANGE = 200;
  gsap.utils.toArray('.about [data-depth]').forEach(el => {
    const d = parseFloat(el.dataset.depth);
    gsap.fromTo(el, {y:d*RANGE}, {y:-d*RANGE, ease:'none', scrollTrigger:{ trigger:'.about', start:'top bottom', end:'bottom top', scrub:.4 }});
  });
  gsap.fromTo('.about .text', {y:-30}, {y:30, ease:'none', scrollTrigger:{ trigger:'.about', start:'top bottom', end:'bottom top', scrub:.4 }});
  gsap.from('.about .text > *', { y:30, autoAlpha:0, duration:.9, ease:EASE, stagger:.12, scrollTrigger:{ trigger:'.about', start:'top 65%', once:true } });
  gsap.from('.contact .inner > *', { y:24, autoAlpha:0, duration:.8, ease:EASE, stagger:.08, scrollTrigger:{ trigger:'.contact', start:'top 60%', once:true } });
})();

/* ---------- B40: הפוטר קבוע מאחורי העמוד ---------- */
(function(){
  const page = document.querySelector('.page'), footer = document.querySelector('.rvf-footer');
  function fit(){ page.style.marginBottom = footer.offsetHeight + 'px'; ScrollTrigger.refresh(); }
  fit(); addEventListener('resize', fit);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
})();

/* ---------- G08: סמן שגדל על לחיצים (דסקטופ) ---------- */
(function(){
  if(!FINE || REDUCE) return;
  const fo = document.createElement('div'); fo.className = 'follow'; document.body.appendChild(fo);
  document.body.classList.add('cursor-on');
  let mx=-100, my=-100, px=-100, py=-100, shown = false;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; if(!shown){ shown = true; fo.style.opacity = 1; } });
  document.addEventListener('mouseleave', () => { fo.style.opacity = 0; shown = false; });
  gsap.ticker.add(() => { px += (mx-px)*.2; py += (my-py)*.2; gsap.set(fo, {x:px-11, y:py-11}); });
  document.querySelectorAll('button, a, input').forEach(t => {
    t.addEventListener('mouseenter', () => gsap.to(fo, {scale:2.4, duration:.3, ease:'power2.out'}));
    t.addEventListener('mouseleave', () => gsap.to(fo, {scale:1, duration:.3, ease:'power2.out'}));
  });
})();

/* ---------- B61: משיכה מגנטית לכפתורים ---------- */
(function(){
  if(!FINE || REDUCE) return;
  const PULL = .35;
  document.querySelectorAll('.mg').forEach(zone => {
    const el = zone.firstElementChild;
    zone.addEventListener('mousemove', e => {
      const r = zone.getBoundingClientRect(), dx = e.clientX-(r.left+r.width/2), dy = e.clientY-(r.top+r.height/2);
      zone.classList.remove('leave');
      el.style.setProperty('--x', (dx*PULL).toFixed(1)+'px'); el.style.setProperty('--y', (dy*PULL).toFixed(1)+'px');
    });
    zone.addEventListener('mouseleave', () => { zone.classList.add('leave'); el.style.setProperty('--x','0px'); el.style.setProperty('--y','0px'); });
  });
})();

/* ---------- B03: FAB וואטסאפ בנייד, נעלם כשכפתור ראשי על המסך ---------- */
(function(){
  const sticky = document.querySelector('.stickycta'); const visible = new Set();
  const io = new IntersectionObserver(es => {
    es.forEach(e => e.isIntersecting ? visible.add(e.target) : visible.delete(e.target));
    sticky.classList.toggle('show', visible.size === 0 && scrollY > innerHeight);
  }, {rootMargin:'-72px'});
  document.querySelectorAll('.main-cta').forEach(el => io.observe(el));
  addEventListener('scroll', () => { if(visible.size === 0) sticky.classList.toggle('show', scrollY > innerHeight); }, {passive:true});
})();

/* ---------- B32: טופס שם + טלפון אל ה-CRM ---------- */
(function(){
  const form = document.querySelector('.ff'), btn = form.querySelector('.ff-btn');
  const fields = [...form.querySelectorAll('.ff-field')];
  const ENDPOINT = 'https://hkywmjyvdbaarwqzpzme.supabase.co/functions/v1/public-pricing-lead';
  const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhreXdtanl2ZGJhYXJ3cXpwem1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NDQwNzMsImV4cCI6MjEwMzEyMDA3M30.I8Quoq72ApZ83DIQQtwLAznowADZudaq3wbmg3jbw_U';
  function bad(f){
    const el = f.querySelector('input'), v = el.value.trim();
    if(el.type === 'tel') return !/^0\d{8,9}$/.test(v.replace(/[\s-]/g,''));
    return v.length < 2;
  }
  fields.forEach(f => {
    const el = f.querySelector('input');
    el.addEventListener('input', () => { if(f.classList.contains('bad') && !bad(f)) f.classList.remove('bad'); });
    el.addEventListener('blur', () => { if(el.value.trim()) f.classList.toggle('bad', bad(f)); });
  });
  function utm(){
    const p = new URLSearchParams(location.search), o = {};
    ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid'].forEach(k => { if(p.get(k)) o[k] = p.get(k); });
    return o;
  }
  form.addEventListener('submit', async e => {
    e.preventDefault();
    let first = null;
    fields.forEach(f => { const b = bad(f); f.classList.toggle('bad', b); if(b && !first) first = f; });
    if(first){ first.querySelector('input').focus(); return; }
    if(btn.classList.contains('done') || btn.classList.contains('load')) return;
    btn.classList.add('load');
    const body = {
      name: form.name.value.trim(), phone: form.phone.value.trim(), company: form.company.value,
      site_type: 'האתר החדש', page_url: location.href, utm: utm()
    };
    try{
      const res = await fetch(ENDPOINT, { method:'POST', headers:{ 'Content-Type':'application/json', apikey:ANON, Authorization:'Bearer '+ANON }, body:JSON.stringify(body) });
      const data = await res.json().catch(()=>({}));
      if(!res.ok || data.error) throw new Error(data.error || res.status);
      btn.classList.remove('load'); btn.classList.add('done');
    }catch(err){
      console.error('[lead]', err);
      btn.classList.remove('load');
      fields[1].querySelector('.ff-err').textContent = 'לא הצלחנו לשלוח. כתבו לי בוואטסאפ';
      fields[1].classList.add('bad');
    }
  });
})();
