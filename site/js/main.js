/* =========================================================
   ליאב מצרי · v2 שוויצרי. כל מהלך מסומן ב-MV-ID שלו מהמאגר.
   ייבוא התנהגות בלבד. צבעים, פונטים וריווח מגיעים מהטוקנים.
   ========================================================= */
gsap.registerPlugin(ScrollTrigger, SplitText, Draggable, InertiaPlugin);
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
const DESK = () => innerWidth >= 900;
const EASE = 'power3.out';
const QA_AT = +new URLSearchParams(location.search).get('at');
const { works, steps } = window.SITE;

/* ---------- תוכן דינמי: שואוקייס, אינדקס, שלבים ---------- */
(function build(){
  const track = document.getElementById('track');
  track.innerHTML = works.map((w,i) => `<figure><img src="img/works/${String(i+1).padStart(2,'0')}.webp" alt="${w.n}" ${i>2?'loading="lazy"':''}></figure>`).join('');
  const pl = document.getElementById('pl');
  pl.innerHTML = works.map((w,i) => `<div class="pl-row" data-i="${i}"><span class="mono">${String(i+1).padStart(2,'0')}</span><h3>${w.n}</h3><span class="mono tag">${w.tag}</span><div class="thumb"><img src="img/works/${String(i+1).padStart(2,'0')}-s.webp" alt="" loading="lazy"></div></div>`).join('');
  document.getElementById('pl-prev').innerHTML = works.map((w,i) => `<img src="img/works/${String(i+1).padStart(2,'0')}-s.webp" alt="" loading="lazy">`).join('');
  const media = document.getElementById('ss-media');
  steps.forEach((s,i) => media.insertAdjacentHTML('afterbegin', `<img src="img/works/${String(s.img).padStart(2,'0')}.webp" alt="" loading="lazy"${i===0?' class="on"':''}>`));
  document.getElementById('ss-list').innerHTML = steps.map((s,i) => `<div class="ss-item${i===0?' on':''}" data-i="${i}"><div class="ss-head"><span class="mono">${String(i+1).padStart(2,'0')}</span><h3>${s.t}</h3></div><div class="ss-body"><div><p>${s.p}</p><div class="ss-mobile"><img src="img/works/${String(s.img).padStart(2,'0')}-s.webp" alt="" loading="lazy"></div></div></div></div>`).join('');
})();

/* ---------- G38: Lenis ---------- */
let lenis = null;
if(!REDUCE){
  lenis = new Lenis({ lerp:.1, wheelMultiplier:1, syncTouch:false, content: document.body });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t*1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}
const scrollToId = id => { const el = document.querySelector(id); if(!el) return; lenis ? lenis.scrollTo(el, {duration:1.4, offset:-20}) : el.scrollIntoView({behavior:'smooth'}); };
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); scrollToId(a.getAttribute('href')); }));

/* ---------- G15: פרילודר עם מונה, ואז כניסת ההירו (LM5) ---------- */
(function(){
  const pre = document.getElementById('pre'), num = pre.querySelector('.num');
  const heroIn = () => {
    const tl = gsap.timeline({ defaults:{ ease:EASE } });
    tl.from('.hero .h1w span', { yPercent:110, duration:1, stagger:.09 }, 0)
      .from('.show', { y:40, autoAlpha:0, duration:1 }, .15)
      .from('.show-meta', { autoAlpha:0, duration:.6 }, .7)
      .from('.hd', { y:-20, autoAlpha:0, duration:.8 }, .3)
      .to('.hero .rv', { y:0, autoAlpha:1, duration:.8, stagger:.1 }, .55);
  };
  const open = () => {
    gsap.to(pre, { yPercent:-100, duration:.8, ease:'power3.inOut', onComplete(){ pre.style.display='none'; } });
    lenis && lenis.start();
    heroIn();
    ScrollTrigger.refresh();
  };
  if(REDUCE || QA_AT >= 0 && !isNaN(QA_AT) && location.search.includes('at=')){
    pre.style.display = 'none'; lenis && lenis.start();
    gsap.set('.hero .rv', {autoAlpha:1, y:0});
    return;
  }
  const o = { v:0 };
  gsap.to(o, { v:100, duration:1.6, ease:'power2.inOut', onUpdate(){ num.textContent = String(Math.round(o.v)).padStart(2,'0'); }, onComplete:open });
})();

/* ---------- G65 + FLIP: לקוחות בווידאו ----------
   נבנה לפני שאר הטריגרים, כי ההצמדה מוסיפה גובה לעמוד וכל מה שמתחתיה נמדד אחריה. */
(function(){
  const sec = document.getElementById('clients'); if(!sec) return;
  const list = window.SITE.clients, N = list.length;
  const track = document.getElementById('vt-track'), strip = sec.querySelector('.vt-strip');
  const idx = document.getElementById('vt-idx'), bar = sec.querySelector('.vt-bar i');
  const pad = n => String(n).padStart(2,'0');
  track.innerHTML = list.map((c,i) => `<button class="vt-card" type="button" data-i="${i}" aria-label="צפייה בהמלצה של ${c.n}"><span class="vt-media"><img src="video/${c.v}.webp" alt="" loading="lazy"><video muted playsinline loop preload="none" src="video/${c.v}.mp4" tabindex="-1" aria-hidden="true"></video><span class="vt-q">${c.q}</span><span class="vt-play"><i></i>צפייה</span></span><span class="vt-meta"><b>${c.n}</b><span class="mono">${c.r}</span></span></button>`).join('');
  const cards = [...track.children], clips = cards.map(c => c.querySelector('video'));
  idx.textContent = `01 / ${pad(N)}`;

  /* סרטון חי אחד בכל רגע: הכרטיס הקרוב למרכז, ורק כשהסקשן על המסך */
  let live = -1, inView = false;
  const setLive = i => {
    if(REDUCE) return;
    if(!inView) i = -1;
    if(i === live) return;
    clips.forEach((v,n) => { if(n !== i && !v.paused){ v.pause(); } cards[n].classList.toggle('live', n === i && !v.paused); });
    live = i;
    if(i >= 0){ const v = clips[i]; v.play().then(() => { if(live === i) cards[i].classList.add('live'); }).catch(() => {}); }
  };
  ScrollTrigger.create({ trigger:sec, start:'top 55%', end:'bottom 45%', onToggle(self){ inView = self.isActive; const l = live; live = -2; setLive(inView ? Math.max(0,l) : -1); } });

  if(!REDUCE){
    const geo = () => {
      const cs = getComputedStyle(strip), inner = strip.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const w = cards[0].offsetWidth, g = parseFloat(getComputedStyle(track).columnGap) || 0;
      return { inner, w, g, x0: w/2 - inner/2, x1: (N-1)*(w+g) + w/2 - inner/2 };
    };
    let G = geo();
    const layout = () => {
      const x = gsap.getProperty(track, 'x'), step = G.w + G.g;
      const pos = (x - G.x0) / step;   /* 0 בכרטיס הראשון, N-1 באחרון */
      cards.forEach((c,i) => {
        const d = Math.min(Math.abs(i - pos), 1.4);
        gsap.set(c, { scale: 1 - d*.12 });
        c.style.setProperty('--dim', d);
        c.querySelector('.vt-meta').style.opacity = 1 - d*.5;
        c.querySelector('.vt-q').style.opacity = c.querySelector('.vt-play').style.opacity = Math.max(0, 1 - d*1.6);
      });
      const p = gsap.utils.clamp(0, 1, pos/(N-1));
      bar.style.transform = `scaleX(${p})`;
      const near = gsap.utils.clamp(0, N-1, Math.round(pos));
      idx.textContent = `${pad(near+1)} / ${pad(N)}`;
      setLive(near);
    };
    gsap.fromTo(track, { x: () => G.x0 }, {
      x: () => G.x1, ease:'none', onUpdate: layout,
      scrollTrigger:{ trigger: sec.querySelector('.vt-pin'), start:'top top', end: () => '+=' + (G.x1 - G.x0), pin:true, scrub:.5, invalidateOnRefresh:true, onRefreshInit(){ G = geo(); } }
    });
    layout();
  }

  /* נגן: הכרטיס מתרחב למסך מלא עם קול, ונסגר חזרה למקום שלו */
  const lb = document.getElementById('vt-lb'), frame = lb.querySelector('.vt-lb-frame'), lv = frame.querySelector('video');
  const bg = lb.querySelector('.vt-lb-bg'), close = lb.querySelector('.vt-lb-close'), cap = lb.querySelector('.vt-lb-cap');
  let open = -1, back = null;
  const rectOf = i => { const r = cards[i].querySelector('.vt-media').getBoundingClientRect(); return { left:r.left, top:r.top, width:r.width, height:r.height }; };
  const fit = i => {
    const img = cards[i].querySelector('img'), ar = img.naturalWidth && img.naturalHeight ? img.naturalWidth/img.naturalHeight : 9/16;
    const maxH = innerHeight - 150, maxW = innerWidth - 32;
    let h = maxH, w = h*ar; if(w > maxW){ w = maxW; h = w/ar; }
    return { left:(innerWidth-w)/2, top:(innerHeight-h)/2, width:w, height:h };
  };
  const D = REDUCE ? 0 : 1;
  function show(i){
    if(open >= 0) return;
    open = i; back = document.activeElement;
    const c = list[i];
    setLive(-1); inView = false;
    lv.poster = `video/${c.v}.webp`; lv.src = `video/${c.v}.mp4`; lv.muted = false;
    lv.play().catch(() => {});
    cap.querySelector('b').textContent = c.n; cap.querySelector('.mono').textContent = c.r;
    lb.classList.add('open'); document.body.classList.add('vt-open');
    lenis ? lenis.stop() : (document.body.style.overflow = 'hidden');
    cards[i].querySelector('.vt-media').style.visibility = 'hidden';
    gsap.set(frame, rectOf(i));
    gsap.timeline({ defaults:{ ease:'power3.inOut' } })
      .to(bg, { opacity:1, duration:.5*D }, 0)
      .to(frame, { ...fit(i), duration:.75*D }, 0)
      .to([close, cap], { opacity:1, duration:.4*D, ease:'power2.out' }, .5*D);
    close.focus({ preventScroll:true });
  }
  function hide(){
    if(open < 0) return;
    const i = open; lv.pause();
    gsap.timeline({ defaults:{ ease:'power3.inOut' }, onComplete(){
      cards[i].querySelector('.vt-media').style.visibility = '';
      lb.classList.remove('open'); document.body.classList.remove('vt-open');
      lv.removeAttribute('src'); lv.load();
      lenis ? lenis.start() : (document.body.style.overflow = '');
      open = -1; back && back.focus({ preventScroll:true });
      inView = ScrollTrigger.isInViewport(sec, .2); live = -2; layoutLive();
    }})
      .to([close, cap], { opacity:0, duration:.2*D }, 0)
      .to(frame, { ...rectOf(i), duration:.6*D }, 0)
      .to(bg, { opacity:0, duration:.45*D }, .15*D);
  }
  const layoutLive = () => { const t = idx.textContent.slice(0,2); setLive(inView ? (+t - 1) : -1); };
  cards.forEach((c,i) => c.addEventListener('click', () => show(i)));
  close.addEventListener('click', hide); bg.addEventListener('click', hide);
  addEventListener('keydown', e => {
    if(open < 0) return;
    if(e.key === 'Escape') hide();
    if(e.key === 'Tab'){ const f = [close, lv]; const k = f.indexOf(document.activeElement); e.preventDefault(); f[(k + (e.shiftKey ? f.length-1 : 1)) % f.length].focus(); }
  });
  addEventListener('resize', () => { if(open >= 0) gsap.set(frame, fit(open)); });
})();

/* ---------- B55: מחוון מחליק בניווט ---------- */
(function(){
  const nav = document.querySelector('.tg'); if(!nav) return;
  const pill = nav.querySelector('.tg-pill'), links = [...nav.querySelectorAll('a:not(.cta)')];
  let active = null;
  const move = (el, animate) => {
    links.forEach(x => x.classList.toggle('hot', x===el));
    if(!el){ gsap.to(pill, {opacity:0, duration:.25}); return; }
    const to = { x:el.offsetLeft, y:el.offsetTop-4, width:el.offsetWidth, height:el.offsetHeight, opacity:1 };
    animate && !REDUCE ? gsap.to(pill, {...to, duration:.4, ease:'back.out(1.4)'}) : gsap.set(pill, to);
  };
  links.forEach(a => { a.addEventListener('mouseenter', () => move(a, true)); a.addEventListener('focus', () => move(a, true)); });
  nav.addEventListener('mouseleave', () => move(active, true));
  move(null, false);
  /* הסקשן הפעיל לפי הגלילה */
  links.forEach(a => {
    const sec = document.querySelector(a.getAttribute('href')); if(!sec) return;
    ScrollTrigger.create({ trigger:sec, start:'top 50%', end:'bottom 50%', onToggle(self){ if(self.isActive){ active = a; move(a, true); } else if(active === a){ active = null; move(null, true); } } });
  });
})();

/* ---------- B23: תפריט נייד ---------- */
(function(){
  const btn = document.querySelector('.nv-toggle'), ov = document.querySelector('.nv-overlay');
  const links = [...ov.querySelectorAll('a')];
  let open = false;
  function set(v){
    open = v; document.body.classList.toggle('nv-open', v);
    btn.setAttribute('aria-expanded', String(v)); ov.setAttribute('aria-hidden', String(!v));
    btn.querySelector('.nv-label').textContent = v ? 'Close' : 'Menu';
    if(lenis){ v ? lenis.stop() : lenis.start(); } else document.body.style.overflow = v ? 'hidden' : '';
  }
  btn.addEventListener('click', () => set(!open));
  links.forEach(a => a.addEventListener('click', () => set(false)));
  addEventListener('keydown', e => { if(open && e.key==='Escape') set(false); });
})();

/* ---------- השואוקייס: גרירה עם אינרציה (G06) + החלפה כל 4 שניות ---------- */
(function(){
  const card = document.getElementById('show'), track = document.getElementById('track');
  const idxEl = document.getElementById('show-idx'), nameEl = document.getElementById('show-name');
  const N = works.length; let cur = 0, timer = null, w = () => card.clientWidth;
  const label = i => { idxEl.textContent = `#${String(i+1).padStart(2,'0')} / ${N}`; nameEl.textContent = works[i].n; };
  label(0);
  const snapTo = i => { cur = gsap.utils.wrap(0, N, i); label(cur); gsap.to(track, { x:-cur*w(), duration:.9, ease:'power3.out', overwrite:true }); };
  const autoplay = () => { clearInterval(timer); if(REDUCE) return; timer = setInterval(() => snapTo(cur+1), 4000); };
  const d = Draggable.create(track, {
    type:'x', inertia:true, edgeResistance:.75, dragResistance:.05,
    bounds:{ minX:-(N-1)*w(), maxX:0 },
    snap:{ x: v => Math.round(v/w())*w() },
    onPress(){ clearInterval(timer); },
    onDrag(){ const i = gsap.utils.clamp(0, N-1, Math.round(-this.x/w())); if(i!==cur){ cur=i; label(cur); } },
    onThrowUpdate(){ const i = gsap.utils.clamp(0, N-1, Math.round(-this.x/w())); if(i!==cur){ cur=i; label(cur); } },
    onThrowComplete(){ cur = gsap.utils.clamp(0, N-1, Math.round(-this.x/w())); label(cur); autoplay(); },
    onRelease(){ if(!this.tween) autoplay(); },
  })[0];
  card.addEventListener('mouseenter', () => clearInterval(timer));
  card.addEventListener('mouseleave', autoplay);
  addEventListener('resize', () => { d.applyBounds({ minX:-(N-1)*w(), maxX:0 }); gsap.set(track, {x:-cur*w()}); });
  autoplay();
  /* ההירו בגלילה החוצה: הכותרות נפרדות והכרטיס מתכווץ */
  if(!REDUCE){
    gsap.timeline({ scrollTrigger:{ trigger:'.hero', start:'top top', end:'bottom top', scrub:.6 } })
      .to('.hero .h-r', { x: () => DESK() ? 80 : 0, ease:'none' }, 0)
      .to('.hero .h-l', { x: () => DESK() ? -80 : 0, ease:'none' }, 0)
      .to('.show', { scale:.92, y:60, ease:'none' }, 0)
      .to('.hero-bottom', { autoAlpha:0, y:-30, ease:'none' }, 0);
  }
})();

/* ---------- תוויות סקשן: קו שנמתח + reveal ---------- */
gsap.utils.toArray('.sec-head').forEach(h => ScrollTrigger.create({ trigger:h, start:'top 85%', once:true, onEnter(){ h.classList.add('in'); } }));
gsap.utils.toArray('section:not(.hero) .rv').forEach(el => gsap.to(el, { autoAlpha:1, y:0, duration:.9, ease:EASE, scrollTrigger:{ trigger:el, start:'top 88%', once:true } }));

/* ---------- G4 רמה א: כותרות נחשפות מילה אחרי מילה ---------- */
if(!REDUCE) document.querySelectorAll('.t-reveal').forEach(h => {
  const s = new SplitText(h, { type:'words' });
  gsap.from(s.words, { clipPath:'inset(100% 0% 0% 0%)', opacity:0, stagger:.12, duration:.9, ease:EASE, scrollTrigger:{ trigger:h, start:'top 82%', once:true } });
});

/* ---------- G48: המניפסט נצבע מילה-מילה ---------- */
(function(){
  const p = document.getElementById('hl-src');
  const MARK = ['ההחלטות', 'ליצירה'];
  const bare = w => w.replace(/[.,:;!?"'׳״]/g, '');
  const words = p.textContent.trim().split(/\s+/); p.textContent = '';
  const marks = [];
  const spans = words.map((w,i) => {
    const s = document.createElement('span'); s.className = 'w';
    const core = bare(w);
    if(MARK.includes(core)){ const mk = document.createElement('span'); mk.className='mk'; mk.textContent=core; s.appendChild(mk); s.appendChild(document.createTextNode(w.slice(core.length))); marks.push({mk, i}); }
    else s.textContent = w;
    p.appendChild(s); if(i < words.length-1) p.appendChild(document.createTextNode(' '));
    return s;
  });
  if(REDUCE){ gsap.set(spans, {color:'var(--ink)'}); gsap.set(marks.map(m=>m.mk), {'--fill':1}); return; }
  const STEP = .35;
  const tl = gsap.timeline({ scrollTrigger:{ trigger:'.mani .hl', start:'top 75%', end:'bottom 55%', scrub:.4 } });
  tl.to(spans, { color:'var(--ink)', duration:.4, stagger:STEP, ease:'none' }, 0);
  marks.forEach(m => tl.fromTo(m.mk, {'--fill':0}, {'--fill':1, duration:.4, ease:'power2.out'}, m.i*STEP));
})();

/* ---------- G43: אינדקס עם תצוגה שעוקבת אחרי הסמן ---------- */
(function(){
  const list = document.getElementById('pl'), prev = document.getElementById('pl-prev');
  const rows = [...list.querySelectorAll('.pl-row')], shots = [...prev.querySelectorAll('img')];
  gsap.from(rows, { y:30, autoAlpha:0, duration:.8, ease:EASE, stagger:.06, scrollTrigger:{ trigger:list, start:'top 85%', once:true } });
  if(!FINE) return;
  const xTo = gsap.quickTo(prev, 'x', {duration:.55, ease:'power3'}), yTo = gsap.quickTo(prev, 'y', {duration:.55, ease:'power3'});
  let shown = false, placed = false;
  function place(e){
    let x = e.clientX - prev.offsetWidth - 26; if(x < 12) x = e.clientX + 26;
    const y = gsap.utils.clamp(12, innerHeight - prev.offsetHeight - 12, e.clientY - prev.offsetHeight/2);
    if(!placed){ placed = true; gsap.set(prev, {x, y}); }
    xTo(x); yTo(y);
  }
  list.addEventListener('pointermove', place);
  rows.forEach(r => r.addEventListener('pointerenter', () => {
    rows.forEach(x => x.classList.toggle('on', x===r)); shots.forEach((s,i) => s.classList.toggle('on', i===+r.dataset.i));
    if(!shown){ shown = true; list.classList.add('hovering'); gsap.to(prev, {opacity:1, scale:1, duration:.35, ease:'power3.out'}); }
  }));
  list.addEventListener('pointerleave', () => { shown = false; list.classList.remove('hovering'); rows.forEach(x => x.classList.remove('on')); gsap.to(prev, {opacity:0, scale:.94, duration:.25, ease:'power2.in'}); });
})();

/* ---------- B41: שלבים עם מדיה מוצמדת ---------- */
(function(){
  const items = gsap.utils.toArray('.ss-item'), shots = [...document.querySelectorAll('#ss-media img')].reverse(), tag = document.getElementById('ss-tag');
  const activate = i => { items.forEach((it,n) => it.classList.toggle('on', n===i)); shots.forEach((s,n) => s.classList.toggle('on', n===i)); tag.textContent = String(i+1).padStart(2,'0'); };
  items.forEach((item,i) => ScrollTrigger.create({ trigger:item, start:'top 62%', end:'bottom 45%', onToggle(self){ if(self.isActive) activate(i); } }));
})();

/* ---------- G12: פרלקס בסקשן מי אני ---------- */
if(!REDUCE){
  const RANGE = 160;
  gsap.utils.toArray('.about [data-depth]').forEach(el => { const d = +el.dataset.depth; gsap.fromTo(el, {y:d*RANGE}, {y:-d*RANGE, ease:'none', scrollTrigger:{ trigger:'.about', start:'top bottom', end:'bottom top', scrub:.4 }}); });
}

/* ---------- B29: העמוד מחליף לכהה בסקשן האחרון ---------- */
(function(){
  const page = document.querySelector('.page');
  ScrollTrigger.create({ trigger:'#contact', start:'top 15%', end:'bottom top', onToggle(self){ page.classList.toggle('dark', self.isActive); } });
  /* הניווט הקבוע צריך להתהפך יחד עם הרקע, אחרת הלוגו הכהה יושב על שחור */
  ScrollTrigger.create({ trigger:'#contact', start:'top 15%', endTrigger:'.rvf-footer', end:'bottom bottom', onToggle(self){ document.body.classList.toggle('nav-dark', self.isActive); } });
})();

/* ---------- B40: פוטר קבוע מאחורי העמוד ---------- */
(function(){
  const page = document.querySelector('.page'), footer = document.querySelector('.rvf-footer');
  const fit = () => { page.style.marginBottom = footer.offsetHeight + 'px'; ScrollTrigger.refresh(); };
  fit(); addEventListener('resize', fit); document.fonts && document.fonts.ready.then(fit);
  /* תמונה או פונט שנטענים מאוחר משנים את גובה העמוד. בלי רענון, ההצמדות מתחתם נפתחות במקום הלא נכון */
  let h = page.offsetHeight, t = 0;
  new ResizeObserver(() => { const nh = page.offsetHeight; if(Math.abs(nh - h) < 2) return; h = nh; clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 150); }).observe(page);
})();

/* ---------- G08: סמן ---------- */
(function(){
  if(!FINE || REDUCE) return;
  const fo = document.createElement('div'); fo.className='follow'; document.body.appendChild(fo); document.body.classList.add('cursor-on');
  let mx=-100,my=-100,px=-100,py=-100,shown=false;
  document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; if(!shown){ shown=true; fo.style.opacity=1; } });
  document.addEventListener('mouseleave', () => { fo.style.opacity=0; shown=false; });
  gsap.ticker.add(() => { px+=(mx-px)*.22; py+=(my-py)*.22; gsap.set(fo, {x:px-7, y:py-7}); });
  const grow = s => () => gsap.to(fo, {scale:s, duration:.3, ease:'power2.out'});
  document.querySelectorAll('a, button, input, .show-card, .pl-row').forEach(t => { t.addEventListener('mouseenter', grow(3)); t.addEventListener('mouseleave', grow(1)); });
})();

/* ---------- B61: מגנט ---------- */
(function(){
  if(!FINE || REDUCE) return;
  const PULL = .3;
  document.querySelectorAll('.mg').forEach(zone => {
    const el = zone.firstElementChild;
    zone.addEventListener('mousemove', e => { const r = zone.getBoundingClientRect(); zone.classList.remove('leave'); el.style.setProperty('--x', ((e.clientX-(r.left+r.width/2))*PULL).toFixed(1)+'px'); el.style.setProperty('--y', ((e.clientY-(r.top+r.height/2))*PULL).toFixed(1)+'px'); });
    zone.addEventListener('mouseleave', () => { zone.classList.add('leave'); el.style.setProperty('--x','0px'); el.style.setProperty('--y','0px'); });
  });
})();

/* ---------- B03: FAB נייד ---------- */
(function(){
  const sticky = document.querySelector('.stickycta'), visible = new Set();
  const io = new IntersectionObserver(es => { es.forEach(e => e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)); sticky.classList.toggle('show', visible.size===0 && scrollY > innerHeight*.8); }, {rootMargin:'-72px'});
  document.querySelectorAll('.main-cta').forEach(el => io.observe(el));
  addEventListener('scroll', () => { if(visible.size===0) sticky.classList.toggle('show', scrollY > innerHeight*.8); }, {passive:true});
})();

/* ---------- B32: טופס ---------- */
(function(){
  const form = document.querySelector('.ff'), btn = form.querySelector('.ff-btn'), fields = [...form.querySelectorAll('.ff-field')];
  const ENDPOINT = 'https://hkywmjyvdbaarwqzpzme.supabase.co/functions/v1/public-pricing-lead';
  const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhreXdtanl2ZGJhYXJ3cXpwem1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NDQwNzMsImV4cCI6MjEwMzEyMDA3M30.I8Quoq72ApZ83DIQQtwLAznowADZudaq3wbmg3jbw_U';
  const bad = f => { const el = f.querySelector('input'), v = el.value.trim(); return el.type==='tel' ? !/^0\d{8,9}$/.test(v.replace(/[\s-]/g,'')) : v.length < 2; };
  fields.forEach(f => { const el = f.querySelector('input'); el.addEventListener('input', () => { if(f.classList.contains('bad') && !bad(f)) f.classList.remove('bad'); }); });
  const utm = () => { const p = new URLSearchParams(location.search), o = {}; ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid'].forEach(k => { if(p.get(k)) o[k]=p.get(k); }); return o; };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    let first = null; fields.forEach(f => { const b = bad(f); f.classList.toggle('bad', b); if(b && !first) first = f; });
    if(first){ first.querySelector('input').focus(); return; }
    if(btn.classList.contains('done') || btn.classList.contains('load')) return;
    btn.classList.add('load');
    try{
      const res = await fetch(ENDPOINT, { method:'POST', headers:{ 'Content-Type':'application/json', apikey:ANON, Authorization:'Bearer '+ANON }, body:JSON.stringify({ name:form.name.value.trim(), phone:form.phone.value.trim(), company:form.company.value, site_type:'האתר החדש', page_url:location.href, utm:utm() }) });
      const data = await res.json().catch(()=>({}));
      if(!res.ok || data.error) throw new Error(data.error || res.status);
      btn.classList.remove('load'); btn.classList.add('done');
    }catch(err){ console.error('[lead]', err); btn.classList.remove('load'); fields[1].querySelector('.ff-err').textContent = 'לא הצלחנו לשלוח. כתבו לי בוואטסאפ'; fields[1].classList.add('bad'); }
  });
})();

/* ---------- ?at=N: מצב QA, קפיצה למיקום גלילה ---------- */
if(location.search.includes('at=')){
  const jump = () => { if(lenis){ lenis.resize(); lenis.scrollTo(QA_AT, {immediate:true, force:true}); } scrollTo(0, QA_AT); ScrollTrigger.update(); document.documentElement.dataset.at = String(scrollY|0); };
  jump(); [500, 1500, 3000].forEach(ms => setTimeout(jump, ms));
}
