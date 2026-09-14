/* =========================================================
   ליאב מצרי · v3. העמוד מחליף נושא בגלילה, וכל סקשן נושא מהלך אחד משלו.
   כל מהלך מסומן ב-MV-ID מהמאגר. ייבוא התנהגות בלבד, הטוקנים מהאתר.
   ========================================================= */
gsap.registerPlugin(ScrollTrigger, SplitText, Draggable, InertiaPlugin);
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
const DESK = () => innerWidth >= 900;
const EASE = 'power3.out';
const QA = /[?&](at|qa|st|rm)=/.test(location.search);
const QA_AT = +new URLSearchParams(location.search).get('at');
const { works, clients } = window.SITE;
const pad = n => String(n).padStart(2, '0');
const src = (i, s) => `../img/works/${pad(i)}${s ? '-s' : ''}.webp`;

/* המלצות כתובות מהאתר הישן, כמו שהן */
const QUOTES = [
  { n:'שון בלו', t:'זמר ויזם', i:'01', q:'ליאב בנה לי אתר מושקע עד לפרטים הקטנים ואפשר לראות את התוצאות בלידים שמגיעים.' },
  { n:'אמיר בלדיגה', t:'יזם, מרצה ומלווה עסקים', i:'02', q:'מקצוען, שירותי ובעיקר ייחודי. לעבוד עם ליאב זו זכות שנפלה על העסק שלי משמיים.' },
  { n:'נורית בר', t:'יועצת עסקית', i:'03', q:'קיבלתי מליאב שירות מקצועי, קשוב ואכפתי עד לפרטים הקטנים. דף המכירה שלי שודרג מקצה לקצה.' },
  { n:'אבי פריד', t:'מומחה בינה מלאכותית לעסקים', i:'04', q:'אני אישית חושב שהוא במקצוע הלא נכון והוא צריך ליצור יצירות אומנות. כי זה מה שאתם תקבלו ממנו: יצירת אמנות מעוצבת בתור אתר לעסק שלכם.' },
  { n:'יוסף כהן', t:'יזם דיגיטלי', i:'05', q:'לא פגשתי בעל עסק שמתייחס ללקוחות שלו כמו שאתה התייחסת אליי. ומי שרואה את זה, אל תתלבטו לרגע, ליאב הוא האדם שלכם.' },
  { n:'שי כליף', t:'שירותי גרירה וחילוץ', i:'06', logo:1, q:'ליאב מביא איתו שילוב של ידע טכני, יצירתיות ושירותיות נדירה. ממליץ עליו בחום לכל מי שמחפש שותף אמיתי לתהליך.' },
  { n:'שירה דניאל', t:'מנטורית', i:'07', q:'אין על ליאב. עבודה מהירה ומקצועית, אמאלה מה הוא עשה לי בכמה ימים. שווה כל שקל, לא להתבלבל, הוא מושלם.' },
  { n:'יוגב מירו', t:'אסטרטג מכירות', i:'08', q:'אחרי שנפלתי עם אנשי מקצוע סוף סוף הגעתי לליאב. יצרנו ביחד דף נחיתה שעד היום אני רק מקבל עליו מחמאות, אבל גם עובד בצורה מדהימה.' },
  { n:'נטלי דבח', t:'צלמת מקצועית', i:'09', q:'אין על השירות והמקצועיות של ליאב. תודה על אתר פשוט מושלם וכל כך מדויק עבורי. מקבלת עליו ים של מחמאות.' },
  { n:'עמנואל כוגן', t:'עיצוב תעשייתי', i:'10', q:'ליאב בנה עבורי אתר שיווקי מקצה לקצה. מקצועי ומבין עניין, חי את חוויית הלקוח, בעל הבנה עיצובית גבוהה ויכולת ירידה לפרטים.' },
  { n:'טל אליהו', t:'תילתן ייעוץ משכנתאות', i:'11', q:'ליאב בנה לי את האתר לעסק בצורה מקצועית ויצירתית. התהליך היה יעיל, מסודר ומאורגן בשקיפות מלאה בכל שלב.' },
];
const FEATURED = [3, 1, 5, 9, 11, 14];                 /* לערימה */
const REST = works.map((w, i) => i + 1).filter(i => !FEATURED.includes(i));
const GEN_IMGS = [2, 8, 12];                          /* שלושה מוקאפים לשלושת המשפטים */
const TILES = [4, 6, 7, 10, 13];

/* ---------- תוכן דינמי ---------- */
(function build(){
  document.getElementById('fan').innerHTML = FEATURED.slice(0, 5).map((i, k) => `<figure style="--k:${k}"><img src="${src(i)}" alt="" ${k > 1 ? 'loading="lazy"' : ''}></figure>`).join('');
  document.getElementById('stack').innerHTML = FEATURED.map((i, k) => `<article class="sc" style="--i:${k}"><div class="sc-media"><img src="${src(i)}" alt="${works[i-1].n}" loading="lazy"></div><div class="sc-row"><span class="mono">${pad(k+1)}</span><h3>${works[i-1].n}</h3><span class="mono">${works[i-1].tag}</span></div></article>`).join('');
  document.getElementById('gen-media').innerHTML = GEN_IMGS.map(i => `<img src="${src(i)}" alt="" loading="lazy">`).join('');
  document.querySelectorAll('.mq-in').forEach((row, r) => { const list = r ? [...REST.slice(4), ...REST.slice(0, 4)] : REST; row.innerHTML = [...list, ...list].map(i => `<figure><img src="${src(i, 1)}" alt=""></figure>`).join(''); });
  document.getElementById('tiles').innerHTML = TILES.map((i, k) => `<figure data-k="${k}"><span class="tin"><img src="${src(i, 1)}" alt=""></span></figure>`).join('');
  document.getElementById('vrow').innerHTML = clients.map((c, i) => `<button class="vt-card" type="button" data-i="${i}" aria-label="צפייה בהמלצה של ${c.n}"><span class="vt-media"><img src="../video/${c.v}.webp" alt="" loading="lazy"><video muted playsinline loop preload="none" src="../video/${c.v}.mp4" tabindex="-1" aria-hidden="true"></video><span class="vt-q">${c.q}</span><span class="vt-play"><i></i>צפייה</span></span><span class="vt-meta"><b>${c.n}</b><span class="mono">${c.r}</span></span></button>`).join('');
  const card = q => `<div class="tq-card"><img src="../img/testi/${q.i}.webp" alt="" loading="lazy"${q.logo ? ' class="logo"' : ''}><div><p>${q.q}</p><small><b>${q.n}</b> · ${q.t}</small></div></div>`;
  const a = QUOTES.slice(0, 6), b = QUOTES.slice(6);
  document.getElementById('tq').innerHTML = `<div class="tq-row" data-dir="1" style="--d:70s">${[...a, ...a].map(card).join('')}</div><div class="tq-row" data-dir="-1" style="--d:62s">${[...b, ...b].map(card).join('')}</div>`;
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

/* ---------- SplitText לשורות, פעם אחת, לכל הכותרות ---------- */
const splitLines = el => new SplitText(el, { type:'lines', linesClass:'line' }).lines.map(l => { const s = document.createElement('span'); while(l.firstChild) s.appendChild(l.firstChild); l.appendChild(s); return s; });
const LINES = new Map();
const FONTS = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 1800))]);
const READY = FONTS.then(() => { document.querySelectorAll('.t-lines, .h-lines').forEach(h => LINES.set(h, splitLines(h))); });

/* ---------- פרילודר: לוגו עולה מאחורי קו, והמסך מתרומם. ואז כניסת ההירו ---------- */
(function(){
  const pre = document.getElementById('pre');
  const heroIn = () => {
    const h1 = document.querySelector('.hero h1');
    const tl = gsap.timeline({ defaults:{ ease:EASE } });
    tl.from(LINES.get(h1), { yPercent:110, duration:1.1, stagger:.1 }, 0)
      .from('.hero .kick', { autoAlpha:0, y:10, duration:.6 }, .2)
      .to(h1.querySelector('em'), { '--u':1, duration:.8, ease:'power2.inOut' }, .9)
      .to('.hero .rv', { y:0, autoAlpha:1, duration:.9, stagger:.1 }, .5)
      .from('.hd', { y:-20, autoAlpha:0, duration:.8 }, .3)
      .from('.hero-foot', { autoAlpha:0, duration:.6 }, 1);
    tl.fromTo('#fan figure', { rotate:0, y:60, autoAlpha:0 }, { rotate:k => (k - 2) * 7, y:k => Math.abs(k - 2) * 14, autoAlpha:1, duration:1.2, stagger:.06, ease:'power3.out' }, .3);
  };
  if(REDUCE || QA){
    pre.style.display = 'none'; lenis && lenis.start();
    gsap.set('.hero .rv', {autoAlpha:1, y:0}); gsap.set('.hero h1 em', {'--u':1});
    gsap.set('#fan figure', { rotate:k => (k - 2) * 7, y:k => Math.abs(k - 2) * 14 });
    READY.then(() => ScrollTrigger.refresh());
    return;
  }
  const intro = gsap.timeline()
    .to('.pre-mark img', { y:0, duration:.9, ease:'power3.out' })
    .to('.pre-line i', { scaleX:1, duration:.9, ease:'power2.inOut' }, .2);
  Promise.all([READY, intro.then()]).then(() => {
    gsap.to(pre, { yPercent:-100, duration:.9, ease:'power3.inOut', onStart(){ lenis && lenis.start(); heroIn(); ScrollTrigger.refresh(); }, onComplete(){ pre.style.display = 'none'; } });
  });
})();

/* ---------- G12 + G37: המניפה נעה בעומק בגלילה, ומגיבה לעכבר ---------- */
(function(){
  const figs = gsap.utils.toArray('#fan figure'); if(!figs.length || REDUCE) return;
  gsap.to('#fan', { y:-120, ease:'none', scrollTrigger:{ trigger:'.hero', start:'top top', end:'bottom top', scrub:.6 } });
  gsap.to('.hero-copy', { y:-60, autoAlpha:0, ease:'none', scrollTrigger:{ trigger:'.hero', start:'40% top', end:'bottom top', scrub:.6 } });
  if(!FINE) return;
  const fan = document.getElementById('fan');
  const xs = figs.map(f => gsap.quickTo(f, 'x', {duration:.8, ease:'power3'}));
  fan.closest('.hero').addEventListener('mousemove', e => { const r = fan.getBoundingClientRect(); const dx = (e.clientX - (r.left + r.width/2)) / r.width; figs.forEach((f, k) => xs[k](dx * (k + 1) * 14)); });
})();

/* ---------- B23: תפריט נייד ---------- */
(function(){
  const btn = document.querySelector('.nv-toggle'), ov = document.querySelector('.nv-overlay');
  let open = false;
  function set(v){
    open = v; document.body.classList.toggle('nv-open', v);
    btn.setAttribute('aria-expanded', String(v)); ov.setAttribute('aria-hidden', String(!v));
    btn.querySelector('.nv-label').textContent = v ? 'Close' : 'Menu';
    if(lenis){ v ? lenis.stop() : lenis.start(); } else document.body.style.overflow = v ? 'hidden' : '';
  }
  btn.addEventListener('click', () => set(!open));
  ov.querySelectorAll('a').forEach(a => a.addEventListener('click', () => set(false)));
  addEventListener('keydown', e => { if(open && e.key==='Escape') set(false); });
})();

/* ---------- תוויות סקשן + reveal בסיסי + כותרות בשורות (G4) ---------- */
gsap.utils.toArray('.sec-head').forEach(h => ScrollTrigger.create({ trigger:h, start:'top 85%', once:true, onEnter(){ h.classList.add('in'); } }));
gsap.utils.toArray('section:not(.hero) .rv').forEach(el => gsap.to(el, { autoAlpha:1, y:0, duration:.9, ease:EASE, scrollTrigger:{ trigger:el, start:'top 88%', once:true } }));
if(!REDUCE) READY.then(() => document.querySelectorAll('.t-lines').forEach(h => gsap.from(LINES.get(h), { yPercent:110, duration:1, stagger:.1, ease:EASE, scrollTrigger:{ trigger:h, start:'top 85%', once:true } })));

/* ---------- 01 ערימה: כל כרטיס נדבק, והקודם מתכווץ ומתעמעם כשהבא עולה עליו ---------- */
(function(){
  const cards = gsap.utils.toArray('.sc'); if(REDUCE) return;
  cards.forEach((c, i) => {
    const next = cards[i + 1]; if(!next) return;
    gsap.to(c, { scale:.94, filter:'brightness(.45)', ease:'none', scrollTrigger:{ trigger:next, start:'top bottom', end:'top 12vh', scrub:true } });
  });
  gsap.from(cards[0], { y:60, autoAlpha:0, duration:1, ease:EASE, scrollTrigger:{ trigger:cards[0], start:'top 85%', once:true } });
})();

/* ---------- 02 G60: שלושה משפטים מתחלפים על מסך מוצמד, והתמונה איתם ---------- */
(function(){
  const lines = gsap.utils.toArray('#gen-lines p'), imgs = gsap.utils.toArray('#gen-media img'), idx = document.getElementById('gen-idx'), bar = document.querySelector('.gen-bar i');
  if(REDUCE) return;
  const N = lines.length;
  const tl = gsap.timeline({ scrollTrigger:{ trigger:'.gen-pin', start:'top top', end:'+=' + N * 70 + '%', pin:true, scrub:.5,
    onUpdate(self){ const k = Math.min(N - 1, Math.floor(self.progress * N)); idx.textContent = `${pad(k+1)} / ${pad(N)}`; bar.style.transform = `scaleX(${self.progress})`; } } });
  lines.forEach((p, i) => {
    if(i === 0) return;
    const at = i;
    tl.to(lines[i-1], { y:-40, autoAlpha:0, duration:.35, ease:'power2.in' }, at)
      .to(imgs[i-1], { autoAlpha:0, scale:1.06, duration:.5, ease:'power2.inOut' }, at)
      .fromTo(p, { y:40, autoAlpha:0 }, { y:0, autoAlpha:1, duration:.45, ease:'power2.out' }, at + .3)
      .fromTo(imgs[i], { autoAlpha:0, scale:1.06 }, { autoAlpha:1, scale:1, duration:.6, ease:'power2.out' }, at + .2);
  });
  tl.to({}, { duration:.6 });
})();

/* ---------- 03 חודשים → ימים: קו מוחק, השורה השנייה מתעוררת, "בתוך ימים" נצבע ---------- */
(function(){
  const h = document.getElementById('mo-h'), l2 = h.querySelector('.mo-l2');
  if(REDUCE){ gsap.set(l2, {'--mix':1}); gsap.set(h.querySelector('.mk'), {'--fill':1}); return; }
  const tl = gsap.timeline({ scrollTrigger:{ trigger:'.mo-pin', start:'top top', end:'+=120%', pin:true, scrub:.6 } });
  tl.from(h.querySelector('.mo-l1'), { yPercent:30, autoAlpha:0, duration:.4, ease:'power2.out' })
    .to(h.querySelector('.strike i'), { scaleX:1, duration:.5, ease:'power2.inOut' }, .5)
    .to(h.querySelector('.strike > span'), { opacity:.35, duration:.3 }, .7)
    .from(l2, { yPercent:20, autoAlpha:0, duration:.5, ease:'power2.out' }, .9)
    .to(l2, { '--mix':1, duration:.4 }, 1.2)
    .to(h.querySelector('.mk'), { '--fill':1, duration:.5, ease:'power2.inOut' }, 1.4)
    .to({}, { duration:.5 });
})();

/* ---------- 04 LM8: שתי רצועות במרקי, ומהירות הגלילה דוחפת אותן ומטה אותן ---------- */
(function(){
  const rows = gsap.utils.toArray('.mq'); if(!rows.length) return;
  const wrap = document.getElementById('mq');
  const state = rows.map(r => ({ el:r.querySelector('.mq-in'), dir:+r.dataset.dir, x:0, w:0 }));
  const measure = () => state.forEach(s => { s.w = s.el.scrollWidth / 2; });
  measure(); addEventListener('resize', measure);
  if(REDUCE) return;
  let vel = 0;
  ScrollTrigger.create({ trigger:wrap, start:'top bottom', end:'bottom top', onUpdate(self){ vel = self.getVelocity(); } });
  const skewTo = gsap.quickTo(wrap, 'skewX', { duration:.5, ease:'power3' });
  gsap.ticker.add((t, dt) => {
    const v = gsap.utils.clamp(-2500, 2500, vel); vel *= .9;
    const speed = (40 + Math.abs(v) * .12) * dt / 1000;
    state.forEach(s => { s.x = (s.x + speed * s.dir * (v < 0 ? -1 : 1)) % s.w; if(s.x > 0) s.x -= s.w; gsap.set(s.el, { x:s.x }); });
    skewTo(gsap.utils.clamp(-8, 8, v / 250));
  });
})();

/* ---------- 05 פרומפט שנכתב לבד, ואז הפסקה נצבעת מילה-מילה (G48) ---------- */
(function(){
  const txt = document.getElementById('prompt-txt'), FULL = 'תבנה לי אתר יפה לעסק שלי, עם עיצוב מודרני ואנימציות';
  const p = document.getElementById('tools-p'), MARK = ['פרומפט'];
  const bare = w => w.replace(/[.,:;!?"'׳״]/g, '');
  const words = p.textContent.trim().split(/\s+/); p.textContent = '';
  const spans = words.map((w, i) => { const s = document.createElement('span'); s.className = 'w'; if(MARK.includes(bare(w))){ s.innerHTML = `<span class="mk"><span>${bare(w)}</span></span>${w.slice(bare(w).length)}`; } else s.textContent = w; p.appendChild(s); if(i < words.length - 1) p.appendChild(document.createTextNode(' ')); return s; });
  const mk = p.querySelector('.mk');
  if(REDUCE){ txt.textContent = FULL; gsap.set(spans, {'--on':1}); mk && gsap.set(mk, {'--fill':1}); return; }
  const o = { n:0 };
  gsap.to(o, { n:FULL.length, ease:'none', onUpdate(){ txt.textContent = FULL.slice(0, Math.round(o.n)); }, scrollTrigger:{ trigger:'.tools-in', start:'top 75%', end:'top 25%', scrub:.3 } });
  const tl = gsap.timeline({ scrollTrigger:{ trigger:p, start:'top 78%', end:'bottom 45%', scrub:.4 } });
  tl.to(spans, { '--on':1, duration:.4, stagger:.35, ease:'none' }, 0);
  mk && tl.to(mk, { '--fill':1, duration:.6, ease:'power2.out' }, spans.length * .35 - 1);
})();

/* ---------- 06 G35 + G37: אותיות בגל לפי הגלילה, ואריחים שנעים עם העכבר ובעומק ---------- */
(function(){
  const h = document.getElementById('wave');
  const chars = new SplitText(h, { type:'words,chars', charsClass:'char' }).chars;
  const tiles = gsap.utils.toArray('#tiles figure');
  const POS = [[3, 5, .19], [72, 3, .14], [79, 70, .17], [2, 62, .16], [40, 84, .12]];   /* אחוזי מיקום ורוחב יחסי */
  tiles.forEach((f, k) => { const [l, t, w] = POS[k]; f.style.left = l + '%'; f.style.top = t + '%'; f.style.setProperty('--w', `max(90px, ${w * 100}vw)`); f.dataset.depth = (.4 + k * .12).toFixed(2); });
  if(REDUCE) return;
  gsap.from(chars, { yPercent:120, autoAlpha:0, duration:.9, stagger:{ each:.012, from:'start' }, ease:EASE, scrollTrigger:{ trigger:h, start:'top 85%', once:true } });
  const pin = document.querySelector('.taste-pin'), inners = tiles.map(f => f.querySelector('.tin'));
  ScrollTrigger.create({ trigger:pin, start:'top top', end:'+=100%', pin:true, scrub:true,
    onUpdate(self){ const p = self.progress; chars.forEach((c, i) => { c.style.transform = `translateY(${(Math.sin(i * .55 + p * 9) * 10 * Math.sin(p * Math.PI)).toFixed(2)}px)`; });
      inners.forEach((el, k) => gsap.set(el, { y: -p * 160 * +tiles[k].dataset.depth })); } });
  if(!FINE) return;
  const setX = tiles.map(f => gsap.quickTo(f, 'x', { duration:1, ease:'power3' })), setY = tiles.map(f => gsap.quickTo(f, 'y', { duration:1, ease:'power3' }));
  pin.addEventListener('mousemove', e => { const dx = (e.clientX / innerWidth - .5), dy = (e.clientY / innerHeight - .5); tiles.forEach((f, k) => { const d = +f.dataset.depth * 60; setX[k](-dx * d); setY[k](-dy * d); }); });
})();

/* ---------- 07 וידאו: שורה נגררת עם אינרציה (G06), הקרוב למרכז מתנגן, ולחיצה פותחת נגן ---------- */
(function(){
  const row = document.getElementById('vrow'), wrap = row.parentElement, cards = [...row.children], clips = cards.map(c => c.querySelector('video')), idx = document.getElementById('v-idx');
  const N = cards.length;
  let live = -1, inView = false;
  const setLive = i => {
    if(REDUCE) return; if(!inView) i = -1; if(i === live) return;
    clips.forEach((v, n) => { if(n !== i && !v.paused) v.pause(); cards[n].classList.toggle('live', n === i && !v.paused); });
    live = i;
    if(i >= 0){ const v = clips[i]; v.play().then(() => { if(live === i) cards[i].classList.add('live'); }).catch(() => {}); }
  };
  const nearest = () => { const cx = innerWidth / 2; let best = 0, bd = 1e9; cards.forEach((c, i) => { const r = c.getBoundingClientRect(); const d = Math.abs(r.left + r.width/2 - cx); if(d < bd){ bd = d; best = i; } }); return best; };
  const update = () => { const n = nearest(); idx.textContent = `${pad(n+1)} / ${pad(N)}`; setLive(n); };
  ScrollTrigger.create({ trigger:wrap, start:'top 80%', end:'bottom 20%', onToggle(self){ inView = self.isActive; const l = live; live = -2; setLive(inView ? Math.max(0, l) : -1); if(inView) update(); } });
  /* ב-RTL הרצועה מתחילה בימין וגולשת שמאלה, אז גוררים ימינה כדי לראות עוד */
  const bounds = () => { const cs = getComputedStyle(wrap); const over = row.scrollWidth - (wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)); return { minX:0, maxX:Math.max(0, over) }; };
  const d = Draggable.create(row, { type:'x', inertia:true, edgeResistance:.8, bounds:bounds(), onDrag:update, onThrowUpdate:update, onThrowComplete:update })[0];
  addEventListener('resize', () => d.applyBounds(bounds()));
  if(!REDUCE) gsap.from(cards, { y:40, autoAlpha:0, duration:.9, stagger:.07, ease:EASE, scrollTrigger:{ trigger:wrap, start:'top 85%', once:true } });

  /* נגן: הכרטיס מתרחב למסך מלא עם קול, ונסגר חזרה למקום שלו */
  const lb = document.getElementById('vt-lb'), frame = lb.querySelector('.vt-lb-frame'), lv = frame.querySelector('video');
  const bg = lb.querySelector('.vt-lb-bg'), close = lb.querySelector('.vt-lb-close'), cap = lb.querySelector('.vt-lb-cap');
  let open = -1, back = null, moved = false;
  d.addEventListener('dragstart', () => moved = true); d.addEventListener('press', () => moved = false);
  const rectOf = i => { const r = cards[i].querySelector('.vt-media').getBoundingClientRect(); return { left:r.left, top:r.top, width:r.width, height:r.height }; };
  const fit = i => { const img = cards[i].querySelector('img'), ar = img.naturalWidth ? img.naturalWidth / img.naturalHeight : 9/16; const maxH = innerHeight - 150, maxW = innerWidth - 32; let h = maxH, w = h * ar; if(w > maxW){ w = maxW; h = w / ar; } return { left:(innerWidth - w)/2, top:(innerHeight - h)/2, width:w, height:h }; };
  const D = REDUCE ? 0 : 1;
  function show(i){
    if(open >= 0 || moved) return;
    open = i; back = document.activeElement; const c = clients[i];
    setLive(-1); inView = false;
    lv.poster = `../video/${c.v}.webp`; lv.src = `../video/${c.v}.mp4`; lv.muted = false; lv.play().catch(() => {});
    cap.querySelector('b').textContent = c.n; cap.querySelector('.mono').textContent = c.r;
    lb.classList.add('open'); document.body.classList.add('vt-open');
    lenis ? lenis.stop() : (document.body.style.overflow = 'hidden');
    cards[i].querySelector('.vt-media').style.visibility = 'hidden';
    gsap.set(frame, rectOf(i));
    gsap.timeline({ defaults:{ ease:'power3.inOut' } }).to(bg, { opacity:1, duration:.5*D }, 0).to(frame, { ...fit(i), duration:.75*D }, 0).to([close, cap], { opacity:1, duration:.4*D, ease:'power2.out' }, .5*D);
    close.focus({ preventScroll:true });
  }
  function hide(){
    if(open < 0) return; const i = open; lv.pause();
    gsap.timeline({ defaults:{ ease:'power3.inOut' }, onComplete(){
      cards[i].querySelector('.vt-media').style.visibility = ''; lb.classList.remove('open'); document.body.classList.remove('vt-open');
      lv.removeAttribute('src'); lv.load(); lenis ? lenis.start() : (document.body.style.overflow = '');
      open = -1; back && back.focus({ preventScroll:true }); inView = ScrollTrigger.isInViewport(wrap, .2); live = -2; update();
    }}).to([close, cap], { opacity:0, duration:.2*D }, 0).to(frame, { ...rectOf(i), duration:.6*D }, 0).to(bg, { opacity:0, duration:.45*D }, .15*D);
  }
  cards.forEach((c, i) => c.addEventListener('click', () => show(i)));
  close.addEventListener('click', hide); bg.addEventListener('click', hide);
  addEventListener('keydown', e => { if(open < 0) return; if(e.key === 'Escape') hide(); if(e.key === 'Tab'){ const f = [close, lv]; const k = f.indexOf(document.activeElement); e.preventDefault(); f[(k + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus(); } });
  addEventListener('resize', () => { if(open >= 0) gsap.set(frame, fit(open)); });
})();

/* ---------- 08 G12 פרלקס לפורטרט + G15 מספרים שנספרים ---------- */
(function(){
  if(!REDUCE){
    const RANGE = 140;
    gsap.utils.toArray('.about [data-depth]').forEach(el => { const d = +el.dataset.depth; gsap.fromTo(el, {y:d*RANGE}, {y:-d*RANGE, ease:'none', scrollTrigger:{ trigger:'.about', start:'top bottom', end:'bottom top', scrub:.4 }}); });
  }
  document.querySelectorAll('.stats .num').forEach(b => {
    const n = +b.dataset.n, plus = b.dataset.plus ? '+' : '';
    const write = v => { b.textContent = Math.round(v) + plus; };
    if(REDUCE){ write(n); return; }
    const o = { v:0 };
    ScrollTrigger.create({ trigger:b, start:'top 88%', once:true, onEnter(){ gsap.to(o, { v:n, duration:1.6, ease:'power3.out', onUpdate(){ write(o.v); } }); } });
  });
})();

/* ---------- B40: פוטר קבוע מאחורי העמוד, ורענון כשגובה העמוד משתנה ---------- */
(function(){
  const page = document.querySelector('.page'), footer = document.querySelector('.rvf-footer');
  const fit = () => { page.style.marginBottom = footer.offsetHeight + 'px'; ScrollTrigger.refresh(); };
  fit(); addEventListener('resize', fit); document.fonts && document.fonts.ready.then(fit);
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
  document.querySelectorAll('a, button, input, .sc, .vrow').forEach(t => { t.addEventListener('mouseenter', grow(3)); t.addEventListener('mouseleave', grow(1)); });
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
      const res = await fetch(ENDPOINT, { method:'POST', headers:{ 'Content-Type':'application/json', apikey:ANON, Authorization:'Bearer '+ANON }, body:JSON.stringify({ name:form.name.value.trim(), phone:form.phone.value.trim(), company:form.company.value, site_type:'האתר החדש (v3)', page_url:location.href, utm:utm() }) });
      const data = await res.json().catch(()=>({}));
      if(!res.ok || data.error) throw new Error(data.error || res.status);
      btn.classList.remove('load'); btn.classList.add('done');
    }catch(err){ console.error('[lead]', err); btn.classList.remove('load'); fields[1].querySelector('.ff-err').textContent = 'לא הצלחנו לשלוח. כתבו לי בוואטסאפ'; fields[1].classList.add('bad'); }
  });
})();

/* ---------- B29 מוכלל: הסקשן שמרכז המסך נמצא בו קובע את הנושא של body ----------
   נמדד לפי getBoundingClientRect בכל עדכון, ולא לפי טווחי טריגרים, כי ההצמדות משנות את הגבהים. */
(function(){
  const secs = [...document.querySelectorAll('[data-theme]')], THEMES = ['t-light', 't-dark', 't-lime'];
  let cur = '';
  const pick = () => {
    const mid = innerHeight / 2; let t = cur || 'light';
    for(const s of secs){ const r = s.getBoundingClientRect(); if(r.top <= mid && r.bottom > mid){ t = s.dataset.theme; break; } if(r.top > mid) break; }
    if(t === cur) return; cur = t;
    THEMES.forEach(c => document.body.classList.toggle(c, c === 't-' + t));
  };
  ScrollTrigger.create({ trigger:document.body, start:0, end:'max', onUpdate:pick, onRefresh:pick });
  pick();
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
  links.forEach(a => {
    const sec = document.querySelector(a.getAttribute('href')); if(!sec) return;
    ScrollTrigger.create({ trigger:sec, start:'top 50%', end:'bottom 50%', onToggle(self){ if(self.isActive){ active = a; move(a, true); } else if(active === a){ active = null; move(null, true); } } });
  });
})();

/* ---------- ?at=N: מצב QA ---------- */
if(location.search.includes('at=')){
  const jump = () => { if(lenis){ lenis.resize(); lenis.scrollTo(QA_AT, {immediate:true, force:true}); } scrollTo(0, QA_AT); ScrollTrigger.update(); document.documentElement.dataset.at = String(scrollY|0); };
  jump(); [500, 1500, 3000].forEach(ms => setTimeout(jump, ms));
}
