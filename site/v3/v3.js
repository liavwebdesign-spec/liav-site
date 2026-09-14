/* =========================================================
   ליאב מצרי · v3. העמוד מחליף נושא בגלילה, וכל סקשן נושא מהלך אחד משלו.
   כל מהלך מסומן ב-MV-ID מהמאגר. ייבוא התנהגות בלבד, הטוקנים מהאתר.
   ========================================================= */
gsap.registerPlugin(ScrollTrigger, SplitText, Draggable, InertiaPlugin);
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover:hover) and (pointer:fine)').matches;
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
const ALL = works.map((w, i) => i + 1);
const GEN_IMGS = [2, 8, 12];
const CV = [1, 3, 5, 9, 2, 11, 6, 13, 8];
const STRIP = [4, 7, 10];

/* ---------- תוכן דינמי ---------- */
(function build(){
  document.getElementById('cv').innerHTML = CV.map(i => `<figure><img src="${src(i, 1)}" alt=""></figure>`).join('');
  document.getElementById('pl').innerHTML = works.map((w, i) => `<div class="pl-row" data-i="${i}"><span class="mono">${pad(i+1)}</span><h3>${w.n}</h3><span class="mono tag">${w.tag}</span><div class="thumb"><img src="${src(i+1, 1)}" alt="" loading="lazy"></div></div>`).join('');
  document.getElementById('pl-prev').innerHTML = '<div class="pl-prev-in">' + works.map((w, i) => `<img src="${src(i+1)}" alt="" loading="lazy">`).join('') + '</div>';
  document.getElementById('gen-media').innerHTML = GEN_IMGS.map(i => `<img src="${src(i)}" alt="" loading="lazy">`).join('');
  document.querySelectorAll('.mq-in').forEach((row, r) => { const list = r ? [...ALL.slice(7), ...ALL.slice(0, 7)] : ALL; row.innerHTML = list.map(i => `<figure><img src="${src(i, 1)}" alt=""></figure>`).join(''); });
  document.getElementById('sp-img').innerHTML = STRIP.map(i => `<figure><img src="${src(i)}" alt="" loading="lazy"></figure>`).join('');
  document.getElementById('vt-track').innerHTML = clients.map((c, i) => `<button class="vt-card" type="button" data-i="${i}" aria-label="צפייה בהמלצה של ${c.n}"><span class="vt-media"><img src="../video/${c.v}.webp" alt="" loading="lazy"><video muted playsinline loop preload="none" src="../video/${c.v}.mp4" tabindex="-1" aria-hidden="true"></video><span class="vt-q">${c.q}</span><span class="vt-play"><i></i>צפייה</span></span><span class="vt-meta"><b>${c.n}</b><span class="mono">${c.r}</span></span></button>`).join('');
  const card = (q, k) => `<div class="tq-card"><img src="../img/testi/${q.i}.webp" alt="" loading="lazy"${q.logo ? ' class="logo"' : ''}><div><p>${q.q}</p><small><b>${q.n}</b> · ${q.t}</small></div></div>`;
  const a = QUOTES.slice(0, 6), b = QUOTES.slice(6);
  document.getElementById('tq').innerHTML = `<div class="tq-row" data-dir="1" style="--d:64s">${[...a, ...a].map(card).join('')}</div><div class="tq-row" data-dir="-1" style="--d:56s">${[...b, ...b].map(card).join('')}</div>`;
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

/* ---------- SplitText לשורות, אחרי שהפונטים נטענו ---------- */
const splitLines = el => new SplitText(el, { type:'lines', linesClass:'line' }).lines.map(l => { const s = document.createElement('span'); while(l.firstChild) s.appendChild(l.firstChild); l.appendChild(s); return s; });
const LINES = new Map();
const FONTS = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 1800))]);
const READY = FONTS.then(() => { document.querySelectorAll('.t-lines, .h-lines').forEach(h => LINES.set(h, splitLines(h))); });

/* ---------- פרילודר: לוגו עולה מאחורי קו, והמסך מתרומם. ואז כניסת ההירו ---------- */
(function(){
  const pre = document.getElementById('pre');
  const heroIn = () => {
    const h1 = document.querySelector('.hero h1');
    gsap.timeline({ defaults:{ ease:EASE } })
      .from(LINES.get(h1), { yPercent:110, duration:1.1, stagger:.1 }, 0)
      .from('.hero .kick', { autoAlpha:0, y:10, duration:.6 }, .2)
      .to(h1.querySelector('em'), { '--u':1, duration:.8, ease:'power2.inOut' }, .9)
      .to('.hero .rv', { y:0, autoAlpha:1, duration:.9, stagger:.1 }, .5)
      .from('.hd', { y:-20, autoAlpha:0, duration:.8 }, .3)
      .from('.hero-foot', { autoAlpha:0, duration:.6 }, 1);
    converge();
  };
  if(REDUCE || QA){
    pre.style.display = 'none'; lenis && lenis.start();
    gsap.set('.hero .rv', {autoAlpha:1, y:0}); gsap.set('.hero h1 em', {'--u':1});
    READY.then(() => ScrollTrigger.refresh());
    return;
  }
  const intro = gsap.timeline()
    .to('.pre-mark img', { y:0, duration:.9, ease:'power3.out' })
    .to('.pre-line i', { scaleX:1, duration:.9, ease:'power2.inOut' }, .2);
  gsap.utils.toArray('.pre-shp .b').forEach((s, k, all) => {
    intro.fromTo(s, { opacity:1, scale:.3, rotate:-90 }, { scale:1, rotate:0, duration:.16, ease:'back.out(2.4)', immediateRender:false }, .05 + k * .15);
    if(k < all.length - 1) intro.set(s, { opacity:0 }, .05 + (k + 1) * .15);
  });
  Promise.all([READY, intro.then()]).then(() => {
    gsap.to(pre, { yPercent:-100, duration:.9, ease:'power3.inOut', onStart(){ lenis && lenis.start(); heroIn(); ScrollTrigger.refresh(); }, onComplete(){ pre.style.display = 'none'; } });
  });
})();

/* ---------- 00 G54: גריד מפוזר שמתכנס. כל עבודה יוצאת מכיוון שנגזר ממקומה בגריד, ביחידות xPercent,
   כך שהפיזור נשאר פרופורציונלי בכל רוחב. ביציאה מההירו הגריד כולו נוטה לעומק ---------- */
function converge(){
  const cv = document.getElementById('cv'); if(!cv || REDUCE) return;
  const items = [...cv.children], g = cv.getBoundingClientRect(), cx = g.left + g.width / 2, cy = g.top + g.height / 2;
  items.forEach((el, k) => {
    const r = el.getBoundingClientRect(), dx = (r.left + r.width / 2 - cx) / g.width, dy = (r.top + r.height / 2 - cy) / g.height;
    const spin = (k % 2 ? -1 : 1) * 7;
    gsap.fromTo(el, { xPercent:dx * 260, yPercent:dy * 230, scale:.42, rotate:dx * 30 + spin, rotateY:dx * -30, autoAlpha:0 },
      { xPercent:0, yPercent:0, scale:1, rotate:0, rotateY:0, autoAlpha:1, duration:1.9, ease:'power3.out', delay:.75 + Math.hypot(dx, dy) * .45 });   /* ההשהיה: הפרילודר מתרומם ב-0.9 שניות, וההתכנסות צריכה לקרות מול העיניים ולא מאחוריו */
  });
}
(function(){
  if(REDUCE) return;
  gsap.to('#cv', { rotateX:26, rotateZ:-5, yPercent:-6, scale:.9, ease:'none', scrollTrigger:{ trigger:'.hero', start:'top top', end:'bottom top', scrub:.6 } });
  gsap.to('.hero-copy', { y:-60, autoAlpha:0, ease:'none', scrollTrigger:{ trigger:'.hero', start:'40% top', end:'bottom top', scrub:.6 } });
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

/* ---------- תוויות סקשן + reveal בסיסי + כותרות בשורות (G4) + קווי ליים ---------- */
gsap.utils.toArray('.sec-head').forEach(h => ScrollTrigger.create({ trigger:h, start:'top 85%', once:true, onEnter(){ h.classList.add('in'); } }));
gsap.utils.toArray('section:not(.hero) .rv').forEach(el => gsap.to(el, { autoAlpha:1, y:0, duration:.9, ease:EASE, scrollTrigger:{ trigger:el, start:'top 88%', once:true } }));
if(!REDUCE) READY.then(() => document.querySelectorAll('.t-lines').forEach(h => gsap.from(LINES.get(h), { yPercent:110, duration:1, stagger:.1, ease:EASE, scrollTrigger:{ trigger:h, start:'top 85%', once:true } })));
if(!REDUCE) document.querySelectorAll('.taste .u').forEach(u => gsap.to(u, { '--u':1, duration:.8, ease:'power2.inOut', scrollTrigger:{ trigger:u, start:'top 80%', once:true } }));

/* ---------- 01 G43 משודרג: רשימת פרויקטים עם תצוגה גדולה שעוקבת אחרי הסמן ----------
   נפתחת במסכה מלמטה עם זום פנימי, מתחלפת בין פרויקטים בהחלקה אנכית, ומוטה לפי מהירות העכבר:
   סיבוב קל במישור והטיה בתלת-ממד (css15). כשהעכבר נעצר, הכול מתיישר. */
(function(){
  const list = document.getElementById('pl'), prev = document.getElementById('pl-prev'), inner = prev.querySelector('.pl-prev-in');
  const rows = [...list.querySelectorAll('.pl-row')], shots = [...inner.querySelectorAll('img')];
  if(!REDUCE) gsap.from(rows, { y:30, autoAlpha:0, duration:.8, ease:EASE, stagger:.05, scrollTrigger:{ trigger:list, start:'top 85%', once:true } });
  if(!FINE) return;
  gsap.set(inner, { transformPerspective:1000 });
  const xTo = gsap.quickTo(prev, 'x', { duration:.6, ease:'power3' }), yTo = gsap.quickTo(prev, 'y', { duration:.6, ease:'power3' });
  const rz = gsap.quickTo(inner, 'rotation', { duration:.5, ease:'power3' }), ry = gsap.quickTo(inner, 'rotationY', { duration:.6, ease:'power3' }), rx = gsap.quickTo(inner, 'rotationX', { duration:.6, ease:'power3' });
  let shown = false, placed = false, cur = -1, z = 1, lx = null, ly = null, vx = 0, vy = 0;
  function place(e){
    if(lx !== null){ vx += ((e.clientX - lx) - vx) * .35; vy += ((e.clientY - ly) - vy) * .35; }
    lx = e.clientX; ly = e.clientY;
    const w = prev.offsetWidth, h = prev.offsetHeight;
    let x = e.clientX - w - 40; if(x < 16) x = e.clientX + 40;
    x = gsap.utils.clamp(16, innerWidth - w - 16, x);
    const y = gsap.utils.clamp(16, innerHeight - h - 16, e.clientY - h / 2);
    if(!placed){ placed = true; gsap.set(prev, { x, y }); }
    xTo(x); yTo(y);
  }
  /* מהירות שדועכת: כשהעכבר זז התצוגה נוטה לכיוון התנועה, וכשהוא נעצר היא חוזרת לישר */
  gsap.ticker.add(() => {
    if(!shown || REDUCE) return;
    vx *= .88; vy *= .88;
    rz(gsap.utils.clamp(-10, 10, vx * .5));
    ry(gsap.utils.clamp(-18, 18, vx * .9));
    rx(gsap.utils.clamp(-12, 12, -vy * .9));
  });
  function swap(i){
    if(i === cur) return;
    const inc = shots[i], out = shots[cur], down = cur < 0 || i > cur;
    cur = i; inc.style.zIndex = ++z; inc.style.visibility = 'visible';
    gsap.fromTo(inc, { yPercent: down ? 100 : -100, scale:1.2 }, { yPercent:0, scale:1, duration:.7, ease:'power4.out', overwrite:true });
    if(out) gsap.to(out, { yPercent: down ? -30 : 30, scale:1.05, duration:.7, ease:'power4.out', overwrite:true, onComplete(){ if(shots[cur] !== out) out.style.visibility = 'hidden'; } });
  }
  list.addEventListener('pointermove', place);
  rows.forEach(r => r.addEventListener('pointerenter', () => {
    rows.forEach(x => x.classList.toggle('on', x === r));
    const i = +r.dataset.i;
    if(!shown){
      shown = true; list.classList.add('hovering');
      shots.forEach((s, k) => { if(k !== i) s.style.visibility = 'hidden'; });
      cur = -1; swap(i);
      gsap.fromTo(inner, { clipPath:'inset(100% 0% 0% 0%)' }, { clipPath:'inset(0% 0% 0% 0%)', duration:.75, ease:'power4.out', overwrite:'auto' });
    } else swap(i);
  }));
  list.addEventListener('pointerleave', () => {
    shown = false; list.classList.remove('hovering'); rows.forEach(x => x.classList.remove('on'));
    gsap.to(inner, { clipPath:'inset(0% 0% 100% 0%)', duration:.4, ease:'power3.in', overwrite:'auto' });
    rz(0); ry(0); rx(0); vx = vy = 0; lx = ly = null;
  });
})();

/* ---------- 02 G60: שלושה משפטים מתחלפים על מסך מוצמד, כל אחד עם קו ליים, והתמונה איתם ---------- */
(function(){
  const lines = gsap.utils.toArray('#gen-lines p'), imgs = gsap.utils.toArray('#gen-media img'), idx = document.getElementById('gen-idx'), bar = document.querySelector('.gen-bar i');
  if(REDUCE){ lines.forEach(p => gsap.set(p.querySelector('.u'), {'--u':1})); return; }
  const N = lines.length, shp = gsap.utils.toArray('.gen-shp .b');
  const tl = gsap.timeline({ scrollTrigger:{ trigger:'.gen-pin', start:'top top', end:'+=' + N * 70 + '%', pin:true, anticipatePin:1, scrub:.5,
    onUpdate(self){ const k = Math.min(N - 1, Math.floor(self.progress * N)); idx.textContent = `${pad(k+1)} / ${pad(N)}`; bar.style.transform = `scaleX(${self.progress})`; } } });
  tl.to(lines[0].querySelector('.u'), { '--u':1, duration:.4, ease:'power2.inOut' }, .15);
  lines.forEach((p, i) => {
    if(i === 0) return;
    const at = i;
    tl.to(lines[i-1], { y:-40, autoAlpha:0, duration:.35, ease:'power2.in' }, at)
      .to(imgs[i-1], { autoAlpha:0, scale:1.06, duration:.5, ease:'power2.inOut' }, at)
      .fromTo(p, { y:40, autoAlpha:0 }, { y:0, autoAlpha:1, duration:.45, ease:'power2.out' }, at + .3)
      .to(p.querySelector('.u'), { '--u':1, duration:.4, ease:'power2.inOut' }, at + .6)
      .fromTo(imgs[i], { autoAlpha:0, scale:1.06 }, { autoAlpha:1, scale:1, duration:.6, ease:'power2.out' }, at + .2)
      /* סמל אחר לכל משפט: הקודם מסתובב החוצה, הבא נכנס בקפיצה. "כל אתר מקבל שפה משלו" */
      .to(shp[i-1], { scale:0, rotate:120, opacity:0, duration:.3, ease:'power2.in' }, at)
      .fromTo(shp[i], { scale:0, rotate:-120, opacity:1 }, { scale:1, rotate:0, duration:.45, ease:'back.out(2)' }, at + .3);
  });
  tl.to({}, { duration:.6 });
})();

/* ---------- 03 חודשים → ימים: הכותרת והטיימליין על אותו ציר גלילה ----------
   1. השורה הראשונה נכנסת והמסלול מבריף להשקה נמתח.  2. "חודשים" נמחקת בזמן שהנקודה זוחלת לאט.
   3. השורה השנייה מתעוררת והמסלול מתכווץ לקטע קצר.  4. "בתוך ימים" נצבע והנקודה מגיעה להשקה, עם פעימה. */
(function(){
  const h = document.getElementById('mo-h'), l2 = h.querySelector('.mo-l2'), mk = h.querySelector('.mk');
  const tl = document.getElementById('tl'), seg = tl.querySelector('.tl-seg'), dot = tl.querySelector('.tl-dot'), ring = dot.querySelector('i');
  const ticks = tl.querySelector('.tl-ticks'); ticks.innerHTML = '<i></i>'.repeat(25);
  const tk = [...ticks.children], flag = tl.querySelector('.tl-flag'), was = tl.querySelector('.tl-was'), now = tl.querySelector('.tl-now');
  if(REDUCE){
    gsap.set(l2, {'--mix':1}); gsap.set(mk, {'--fill':1});
    gsap.set(seg, {'--w':.34, '--draw':1, '--p':1}); gsap.set(tl.querySelector('.tl-rail'), {'--draw':1}); gsap.set([dot, flag, now], {opacity:1}); gsap.set(tk, {opacity:1}); gsap.set(was, {opacity:0});
    return;
  }
  /* ערכי התחלה מפורשים: GSAP לא יודע לנפח משתנה CSS שאין לו ערך, ופשוט קופץ לסוף. זה מה שהסתיר את הזחילה */
  /* בטלפון קטע של שליש מסלול קצר מדי, ודגל ההשקה נדחס על תווית הבריף */
  const SHORT = innerWidth < 900 ? .6 : .34;
  gsap.set(seg, { '--draw':0, '--p':0, '--w':1 }); gsap.set(ring, { '--ring':1, '--ringo':0 });
  const t = gsap.timeline({ scrollTrigger:{ trigger:'.mo-pin', start:'top top', end:'+=160%', pin:true, anticipatePin:1, scrub:.6 } });
  t.from(h.querySelector('.mo-l1'), { yPercent:30, autoAlpha:0, duration:.4, ease:'power2.out' }, 0)
    .to([seg, tl.querySelector('.tl-rail')], { '--draw':1, duration:.5, ease:'power2.inOut' }, .05)
    .to(tk, { opacity:1, duration:.2, stagger:.012 }, .15)
    .to(dot, { opacity:1, duration:.15 }, .45)
    /* חודשים: הנקודה זוחלת לאורך מסלול ארוך, בזמן שהמילה נמחקת */
    .to(h.querySelector('.strike i'), { scaleX:1, duration:.5, ease:'power2.inOut' }, .55)
    .to(h.querySelector('.strike > span'), { opacity:.35, duration:.3 }, .75)
    .to(seg, { '--p':.28, duration:.55, ease:'none' }, .55)
    /* ימים: המסלול מתכווץ לקטע קצר והשורה השנייה מתעוררת */
    .from(l2, { yPercent:20, autoAlpha:0, duration:.5, ease:'power2.out' }, 1.1)
    .to(l2, { '--mix':1, duration:.4 }, 1.35)
    .to(seg, { '--w':SHORT, duration:.6, ease:'power3.inOut' }, 1.15)
    .to(was, { opacity:0, y:-8, duration:.25 }, 1.2)
    .fromTo(now, { opacity:0, y:8 }, { opacity:1, y:0, duration:.25 }, 1.35)
    /* הגעה: הנקודה רצה לסוף, "בתוך ימים" נצבע, דגל ההשקה קופץ ופעימה אחת */
    .to(seg, { '--p':1, duration:.35, ease:'power2.out' }, 1.6)
    .to(mk, { '--fill':1, duration:.5, ease:'power2.inOut' }, 1.6)
    .fromTo(flag, { opacity:0, y:8 }, { opacity:1, y:0, duration:.2, ease:'back.out(2)' }, 1.92)
    .fromTo(ring, { '--ring':1, '--ringo':0 }, { '--ring':3.2, '--ringo':1, duration:.45, ease:'power2.out' }, 1.94)
    .fromTo(h.querySelector('.mk-spark'), { scale:0, rotate:-160 }, { scale:1, rotate:0, duration:.35, ease:'back.out(3)' }, 1.98)
    .to({}, { duration:.45 });

  /* פעם / היום: פסי זמן בשני הלוחות. נכנס למסך ומתחלף ל"היום", ובלחיצה אפשר להשוות */
  const box = document.getElementById('mo-two'), cards = [...box.querySelectorAll('.mo-card')];
  const btns = [...box.querySelectorAll('.mo-switch button')], pill = box.querySelector('.mo-switch-pill');
  const setState = (s, animate) => {
    btns.forEach(b => { const on = b.dataset.s === s; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
    const b = btns.find(x => x.dataset.s === s);
    gsap.to(pill, { x: b.offsetLeft - 4, width: b.offsetWidth, duration: animate ? .45 : 0, ease:'power3.inOut' });
    cards.forEach(c => { gsap.set(c.querySelector('.bar-track'), { '--g': +c.dataset.before }); gsap.to(c.querySelector('.bar-fill'), { scaleX: +c.dataset[s] / 100, duration: animate ? 1.1 : 0, ease:'power3.inOut', overwrite:true }); });
    box.classList.toggle('cmp', s === 'today');
  };
  setState('before', false);
  ScrollTrigger.create({ trigger:box, start:'top 75%', once:true, onEnter(){ setTimeout(() => setState('today', true), 350); } });
  btns.forEach(b => b.addEventListener('click', () => setState(b.dataset.s, true)));
  addEventListener('resize', () => { const b = btns.find(x => x.classList.contains('on')); gsap.set(pill, { x: b.offsetLeft - 4, width: b.offsetWidth }); });
})();

/* ---------- 04 LM8: שתי רצועות בלופ אינסופי. הגלילה רק מאיצה ומטה, אף פעם לא מזיזה מיקום ---------- */
(function(){
  const rows = gsap.utils.toArray('.mq'); if(!rows.length) return;
  const wrap = document.getElementById('mq');
  const tweens = [];
  const build = () => {
    tweens.splice(0).forEach(t => t.kill());
    rows.forEach(row => {
      const inner = row.querySelector('.mq-in');
      const base = [...inner.children].slice(0, 14);
      inner.innerHTML = ''; base.forEach(f => inner.appendChild(f));
      gsap.set(inner, { x:0 });
      /* עותק אחד = מחזור. משכפלים עד שהרצועה מכסה פעמיים את המסך, כך שאין רגע ריק */
      const gap = parseFloat(getComputedStyle(inner).columnGap) || 0;
      const setW = inner.scrollWidth + gap;
      const copies = Math.max(2, Math.ceil((innerWidth * 2) / setW) + 1);
      for(let c = 1; c < copies; c++) base.forEach(f => inner.appendChild(f.cloneNode(true)));
      const dir = +row.dataset.dir;
      const t = gsap.fromTo(inner, { x: dir > 0 ? 0 : -setW }, { x: dir > 0 ? -setW : 0, duration: setW / 90, ease:'none', repeat:-1 });
      if(REDUCE) t.pause();
      tweens.push(t);
    });
  };
  build();
  let rw = innerWidth; addEventListener('resize', () => { if(Math.abs(innerWidth - rw) > 60){ rw = innerWidth; build(); } });
  if(REDUCE) return;
  let vel = 0;
  ScrollTrigger.create({ trigger:wrap, start:'top bottom', end:'bottom top', onUpdate(self){ vel = self.getVelocity(); }, onToggle(self){ tweens.forEach(t => self.isActive ? t.play() : t.pause()); } });
  const skewTo = gsap.quickTo(wrap, 'skewX', { duration:.5, ease:'power3' });
  gsap.ticker.add(() => {
    const v = gsap.utils.clamp(-3000, 3000, vel); vel *= .92;
    const ts = 1 + Math.abs(v) / 900;
    tweens.forEach(t => t.timeScale(ts));
    skewTo(gsap.utils.clamp(-6, 6, v / 400));
  });
})();

/* ---------- 05 הפרומפט נכתב לבד, מייצר שלד גנרי, והפסקה מולו נצבעת מילה-מילה (G48) ---------- */
(function(){
  const txt = document.getElementById('prompt-txt'), FULL = 'תבנה לי אתר יפה לעסק שלי, עם עיצוב מודרני ואנימציות';
  const skel = gsap.utils.toArray('#skel > *'), note = document.querySelector('.prompt-note');
  const p = document.getElementById('tools-p'), MARK = ['פרומפט'];
  const bare = w => w.replace(/[.,:;!?"'׳״]/g, '');
  const words = p.textContent.trim().split(/\s+/); p.textContent = '';
  const spans = words.map((w, i) => { const s = document.createElement('span'); s.className = 'w'; if(MARK.includes(bare(w))){ s.innerHTML = `<span class="mk"><span>${bare(w)}</span></span>${w.slice(bare(w).length)}`; } else s.textContent = w; p.appendChild(s); if(i < words.length - 1) p.appendChild(document.createTextNode(' ')); return s; });
  const mk = p.querySelector('.mk');
  if(REDUCE){ txt.textContent = FULL; gsap.set(spans, {'--on':1}); mk && gsap.set(mk, {'--fill':1}); return; }
  const o = { n:0 };
  gsap.timeline({ scrollTrigger:{ trigger:'.prompt', start:'top 80%', end:'bottom 40%', scrub:.3 } })
    .to(o, { n:FULL.length, duration:1, ease:'none', onUpdate(){ txt.textContent = FULL.slice(0, Math.round(o.n)); } })
    .fromTo(skel, { opacity:.1, scaleX:.4 }, { opacity:.55, scaleX:1, duration:.5, stagger:.06, ease:'power2.out' }, 1.1)
    .to(note, { opacity:1, duration:.3 }, 1.6);
  const tw = gsap.timeline({ scrollTrigger:{ trigger:p, start:'top 78%', end:'bottom 45%', scrub:.4 } });
  tw.to(spans, { '--on':1, duration:.4, stagger:.35, ease:'none' }, 0);
  mk && tw.to(mk, { '--fill':1, duration:.6, ease:'power2.out' }, spans.length * .35 - 1);
})();

/* ---------- 06 G108: שתי שורות הכותרת מתחילות צמודות, נפתחות בגלילה, ורצועת העבודות נחשפת ביניהן מהאמצע ----------
   המרחק נמדד ב-offsetTop, שלא מושפע מה-transform, ומחושב מחדש ב-refresh */
(function(){
  const pin = document.querySelector('.taste-pin'); if(!pin || REDUCE) return;
  const [a, b] = pin.querySelectorAll('.sp-l'), strip = document.getElementById('sp-img'), cap = pin.querySelector('.sp-cap');
  const half = () => (b.offsetTop - (a.offsetTop + a.offsetHeight)) / 2;
  gsap.timeline({ scrollTrigger:{ trigger:pin, start:'top top', end:'+=130%', pin:true, anticipatePin:1, scrub:.6, invalidateOnRefresh:true } })
    .fromTo(a, { y:() => half() }, { y:0, duration:1, ease:'power3.inOut' }, 0)
    .fromTo(b, { y:() => -half() }, { y:0, duration:1, ease:'power3.inOut' }, 0)
    .fromTo(strip, { clipPath:'inset(50% 0% 50% 0%)' }, { clipPath:'inset(0% 0% 0% 0%)', duration:1, ease:'power3.inOut' }, 0)
    .fromTo(strip.querySelectorAll('img'), { scale:1.3 }, { scale:1, duration:1, ease:'power3.inOut' }, 0)
    .to([a, b], { scale:.9, duration:.4, ease:'power2.out' }, .7)
    .fromTo(cap, { autoAlpha:0, y:24 }, { autoAlpha:1, y:0, duration:.35, ease:'power2.out' }, .8);
})();

/* ---------- 07 G65: רצועת וידאו מוצמדת שנגללת לרוחב, הכרטיס שבמרכז גדל ומתנגן. לחיצה פותחת נגן ---------- */
(function(){
  const sec = document.getElementById('clients');
  const track = document.getElementById('vt-track'), strip = sec.querySelector('.vt-strip');
  const idx = document.getElementById('vt-idx'), bar = sec.querySelector('.vt-bar i');
  const cards = [...track.children], clips = cards.map(c => c.querySelector('video')), N = cards.length;
  let live = -1, inView = false;
  const setLive = i => {
    if(REDUCE) return; if(!inView) i = -1; if(i === live) return;
    clips.forEach((v, n) => { if(n !== i && !v.paused) v.pause(); cards[n].classList.toggle('live', n === i && !v.paused); });
    live = i;
    if(i >= 0){ const v = clips[i]; v.play().then(() => { if(live === i) cards[i].classList.add('live'); }).catch(() => {}); }
  };
  const pinEl = sec.querySelector('.vt-pin');
  ScrollTrigger.create({ trigger:pinEl, start:'top 55%', end:'bottom 45%', onToggle(self){ inView = self.isActive; const l = live; live = -2; setLive(inView ? Math.max(0, l) : -1); } });
  let G = null;
  if(!REDUCE){
    const geo = () => {
      const cs = getComputedStyle(strip), inner = strip.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const w = cards[0].offsetWidth, g = parseFloat(getComputedStyle(track).columnGap) || 0;
      return { inner, w, g, x0: w/2 - inner/2, x1: (N-1)*(w+g) + w/2 - inner/2 };
    };
    G = geo();
    const layout = () => {
      const x = gsap.getProperty(track, 'x'), step = G.w + G.g, pos = (x - G.x0) / step;
      cards.forEach((c, i) => {
        const d = Math.min(Math.abs(i - pos), 1.4);
        gsap.set(c, { scale: 1 - d*.12 });
        c.querySelector('.vt-meta').style.opacity = 1 - d*.5;
        c.querySelector('.vt-q').style.opacity = c.querySelector('.vt-play').style.opacity = Math.max(0, 1 - d*1.6);
      });
      bar.style.transform = `scaleX(${gsap.utils.clamp(0, 1, pos/(N-1))})`;
      const near = gsap.utils.clamp(0, N-1, Math.round(pos));
      idx.textContent = `${pad(near+1)} / ${pad(N)}`;
      setLive(near);
    };
    gsap.fromTo(track, { x: () => G.x0 }, { x: () => G.x1, ease:'none', onUpdate: layout,
      scrollTrigger:{ trigger:pinEl, start:'top top', end: () => '+=' + (G.x1 - G.x0), pin:true, anticipatePin:1, scrub:.5, invalidateOnRefresh:true, onRefreshInit(){ G = geo(); } } });
    layout();
  }
  /* נגן: הכרטיס מתרחב למסך מלא עם קול, ונסגר חזרה למקום שלו */
  const lb = document.getElementById('vt-lb'), frame = lb.querySelector('.vt-lb-frame'), lv = frame.querySelector('video');
  const bg = lb.querySelector('.vt-lb-bg'), close = lb.querySelector('.vt-lb-close'), cap = lb.querySelector('.vt-lb-cap');
  let open = -1, back = null;
  const rectOf = i => { const r = cards[i].querySelector('.vt-media').getBoundingClientRect(); return { left:r.left, top:r.top, width:r.width, height:r.height }; };
  const fit = i => { const img = cards[i].querySelector('img'), ar = img.naturalWidth ? img.naturalWidth / img.naturalHeight : 9/16; const maxH = innerHeight - 150, maxW = innerWidth - 32; let h = maxH, w = h * ar; if(w > maxW){ w = maxW; h = w / ar; } return { left:(innerWidth - w)/2, top:(innerHeight - h)/2, width:w, height:h }; };
  const D = REDUCE ? 0 : 1;
  function show(i){
    if(open >= 0) return;
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
      open = -1; back && back.focus({ preventScroll:true }); inView = ScrollTrigger.isInViewport(pinEl, .2); live = -2; setLive(inView ? +idx.textContent.slice(0, 2) - 1 : -1);
    }}).to([close, cap], { opacity:0, duration:.2*D }, 0).to(frame, { ...rectOf(i), duration:.6*D }, 0).to(bg, { opacity:0, duration:.45*D }, .15*D);
  }
  cards.forEach((c, i) => c.addEventListener('click', () => show(i)));
  close.addEventListener('click', hide); bg.addEventListener('click', hide);
  addEventListener('keydown', e => { if(open < 0) return; if(e.key === 'Escape') hide(); if(e.key === 'Tab'){ const f = [close, lv]; const k = f.indexOf(document.activeElement); e.preventDefault(); f[(k + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus(); } });
  addEventListener('resize', () => { if(open >= 0) gsap.set(frame, fit(open)); });
})();

/* ---------- 08 הפורטרט נחשף מלמטה ומתיישב, ואז המספרים נספרים (G15) ---------- */
(function(){
  const fig = document.getElementById('portrait');
  if(!REDUCE){
    gsap.timeline({ scrollTrigger:{ trigger:fig, start:'top 80%', once:true } })
      .to(fig, { clipPath:'inset(0% 0 0 0)', duration:1.4, ease:'power3.inOut' }, 0)
      .to(fig.querySelector('img'), { scale:1, duration:1.8, ease:'power3.out' }, .1);
    gsap.to(fig.parentNode, { y:-40, ease:'none', scrollTrigger:{ trigger:'.about', start:'top bottom', end:'bottom top', scrub:.4 } });
    /* הסטיקר קופץ כשהפורטרט נחשף, ומסתובב עם הגלילה */
    const st = document.querySelector('.about .sticker');
    gsap.to(st, { scale:1, duration:.7, ease:'back.out(2.2)', scrollTrigger:{ trigger:fig, start:'top 45%', once:true } });
    gsap.fromTo(st, { rotate:-40 }, { rotate:220, ease:'none', scrollTrigger:{ trigger:'.about', start:'top bottom', end:'bottom top', scrub:.8 } });
  }
  document.querySelectorAll('.stats .num').forEach(b => {
    const n = +b.dataset.n, plus = b.dataset.plus ? '+' : '';
    const write = v => { b.textContent = Math.round(v) + plus; };
    if(REDUCE){ write(n); return; }
    const o = { v:0 };
    ScrollTrigger.create({ trigger:b, start:'top 98%', once:true, onEnter(){ gsap.to(o, { v:n, duration:1.6, ease:'power3.out', onUpdate(){ write(o.v); } }); } });
  });
})();

/* ---------- B40: פוטר קבוע מאחורי העמוד, ורענון כשגובה העמוד משתנה ---------- */
(function(){
  const page = document.querySelector('.page'), footer = document.querySelector('.rvf-footer');
  /* padding על body ולא margin על העמוד: margin של הילד האחרון קורס החוצה מ-body, ו-Lenis (content: body) מודד
     את body.scrollHeight בלי הרווח. התוצאה הייתה שבגלגלת אי אפשר היה לגלול עד הפוטר בכלל */
  const fit = () => { document.body.style.paddingBottom = footer.offsetHeight + 'px'; lenis && lenis.resize(); ScrollTrigger.refresh(); };
  fit(); addEventListener('resize', fit); document.fonts && document.fonts.ready.then(fit);
  let h = page.offsetHeight, t = 0;
  new ResizeObserver(() => { const nh = page.offsetHeight; if(Math.abs(nh - h) < 2) return; h = nh; clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 150); }).observe(page);
})();

/* ---------- מגרש הסמלים בפוטר: פיזיקה קטנה על gsap.ticker ----------
   כל סמל הוא עיגול לצורך התנגשות. כבידה, ריצפה על הקצה העליון של הלוגו, קירות, התנגשות בין סמלים,
   וגלגול: על הרצפה הסיבוב נגזר מהמהירות האופקית. גרירה בעכבר או באצבע, והמהירות של השחרור נשמרת.
   הלולאה רצה רק כשמשהו זז, ונעצרת כשהכול נח. */
(function(){
  const box = document.querySelector('.toys'), footer = document.querySelector('.rvf-footer'), logo = footer && footer.querySelector('.big');
  if(!box || !logo) return;
  const els = [...box.children], G = 2600, DT = 1 / 120;
  let W = 0, H = 0, run = false, calm = 0, dropped = false;
  const B = els.map(el => ({ el, r:0, x:0, y:0, vx:0, vy:0, a:0, va:0, drag:false, px:0, py:0, t:0 }));
  const measure = () => {
    box.style.height = Math.max(120, logo.offsetTop + logo.offsetHeight * .18) + 'px';
    W = box.clientWidth; H = box.clientHeight;
    B.forEach(b => { b.s = b.el.offsetWidth; b.r = b.s * .46; b.x = Math.min(Math.max(b.x, b.s / 2), W - b.s / 2); b.y = Math.min(b.y, H - b.r); });
  };
  const draw = () => B.forEach(b => { b.el.style.transform = `translate3d(${(b.x - b.s / 2).toFixed(1)}px,${(b.y - b.s / 2).toFixed(1)}px,0) rotate(${b.a.toFixed(3)}rad)`; });
  const step = () => {
    for(const b of B){
      if(b.drag) continue;
      b.vy += G * DT; b.x += b.vx * DT; b.y += b.vy * DT;
      /* הקירות לפי חצי הרוחב הנראה ולא לפי רדיוס ההתנגשות, כדי שאף סמל לא יחרוג מהמסך */
      const hw = b.s / 2;
      if(b.x < hw){ b.x = hw; b.vx = Math.abs(b.vx) * .5; }
      if(b.x > W - hw){ b.x = W - hw; b.vx = -Math.abs(b.vx) * .5; }
      if(b.y > H - b.r){ b.y = H - b.r; b.vy = Math.abs(b.vy) > 120 ? -b.vy * .38 : 0; b.vx *= .985; b.va = b.vx / b.r; }
      else b.va *= .998;
      b.a += b.va * DT;
    }
    for(let i = 0; i < B.length; i++) for(let k = i + 1; k < B.length; k++){
      const p = B[i], q = B[k], dx = q.x - p.x, dy = q.y - p.y, min = p.r + q.r, d2 = dx * dx + dy * dy;
      if(d2 >= min * min || d2 === 0) continue;
      const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, o = min - d;
      const wp = p.drag ? 0 : (q.drag ? 1 : .5), wq = q.drag ? 0 : (p.drag ? 1 : .5);
      p.x -= nx * o * wp; p.y -= ny * o * wp; q.x += nx * o * wq; q.y += ny * o * wq;
      const rel = (q.vx - p.vx) * nx + (q.vy - p.vy) * ny;
      if(rel < 0){ const jn = -rel * .7; if(!p.drag){ p.vx -= nx * jn * (wp ? 1 : 0); p.vy -= ny * jn * (wp ? 1 : 0); } if(!q.drag){ q.vx += nx * jn; q.vy += ny * jn; } p.va += (q.vy - p.vy) * .0015; q.va -= (q.vy - p.vy) * .0015; }
    }
  };
  let acc = 0;
  const tick = (t, dt) => {
    acc += Math.min(dt, 50) / 1000;
    while(acc >= DT){ step(); acc -= DT; }
    draw();
    const moving = B.some(b => b.drag || Math.abs(b.vx) > 30 || Math.abs(b.vy) > 60);
    calm = moving ? 0 : calm + 1;
    if(calm > 30) stop();
  };
  const start = () => { if(run) return; run = true; calm = 0; acc = 0; gsap.ticker.add(tick); };
  const stop = () => { if(!run) return; run = false; gsap.ticker.remove(tick); };
  /* הנחה ראשונית: שורה על הלוגו, בלי תנועה. משמשת גם ל-reduced motion ולמצב QA */
  const rest = () => { B.forEach((b, i) => { b.x = b.s / 2 + (W - b.s) * i / (B.length - 1); b.y = H - b.r; b.vx = b.vy = b.va = 0; b.a = (i % 2 ? -1 : 1) * .25; b.el.style.visibility = 'visible'; }); draw(); };
  const drop = () => {
    if(dropped) return; dropped = true;
    B.forEach((b, i) => { b.x = W * (i + .5) / B.length + (i % 2 ? -1 : 1) * b.r * .4; b.y = -b.r - i * b.s * .55 - 40; b.vx = (Math.random() - .5) * 160; b.vy = 0; b.a = Math.random() * 3; b.va = (Math.random() - .5) * 6; b.el.style.visibility = 'visible'; });
    start();
  };
  measure();
  if(REDUCE || QA){ rest(); dropped = true; }
  /* לפי סוף הגלילה ולא לפי סקשן: הפוטר נחשף רק בגובה שלו האחרון, והסמלים נופלים כשחצי ממנו כבר על המסך */
  else ScrollTrigger.create({ start:() => ScrollTrigger.maxScroll(window) - footer.offsetHeight * .6, end:() => ScrollTrigger.maxScroll(window) + 1, onEnter:drop });
  addEventListener('resize', () => { measure(); if(dropped){ draw(); start(); } });
  if(REDUCE) return;
  B.forEach(b => {
    const at = e => { const r = box.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    b.el.addEventListener('pointerdown', e => {
      if(!dropped){ rest(); dropped = true; }
      b.el.setPointerCapture(e.pointerId); b.drag = true; b.el.classList.add('drag');
      const [x, y] = at(e); b.ox = b.x - x; b.oy = b.y - y; b.px = b.x; b.py = b.y; b.t = performance.now(); b.vx = b.vy = 0; start();
    });
    b.el.addEventListener('pointermove', e => {
      if(!b.drag) return;
      const [x, y] = at(e), now = performance.now(), dt = Math.max(8, now - b.t) / 1000;
      b.x = Math.min(Math.max(x + b.ox, b.s / 2), W - b.s / 2); b.y = Math.min(y + b.oy, H - b.r);
      b.vx = b.vx * .5 + (b.x - b.px) / dt * .5; b.vy = b.vy * .5 + (b.y - b.py) / dt * .5; b.va = b.vx / b.r * .6;
      b.px = b.x; b.py = b.y; b.t = now;
    });
    const up = () => { if(!b.drag) return; b.drag = false; b.el.classList.remove('drag'); if(performance.now() - b.t > 80){ b.vx *= .2; b.vy *= .2; } start(); };
    b.el.addEventListener('pointerup', up); b.el.addEventListener('pointercancel', up);
  });
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
  document.querySelectorAll('a, button, input, .pl-row, .toy').forEach(t => { t.addEventListener('mouseenter', grow(3)); t.addEventListener('mouseleave', grow(1)); });
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

/* ---------- B29 מוכלל: כל המסך בנושא של הסקשן שבמרכז, במעבר מונפש ----------
   רקע: שכבה קבועה לכל נושא, החדשה עולה מעל ב-opacity (מאיץ גרפי, בלי ציור מחדש).
   טקסט: מתהפך בבת אחת כשהרקע כבר באמצע הדרך, ורק בסקשנים שעל המסך או במרחק מסך אחד ממנו.
   סקשן רחוק מקבל את הנושא כשהוא מתקרב, כך שהעלות מתפזרת ולא נופלת על פריים ההחלפה. */
(function(){
  const secs = [...document.querySelectorAll('[data-theme]')], layers = [...document.querySelectorAll('#bg i')];
  const bg = document.getElementById('bg'), page = document.querySelector('.page'), THEMES = ['t-light', 't-dark', 't-white'];
  const FLIP = REDUCE ? 0 : 300;   /* מתוך 700ms של המעבר: הטקסט מתהפך כשהרקע כבר רחוק מהצבע הקודם */
  let cur = 'light', shown = 'light', z = 1, timer = 0;
  const paint = (s, t) => { if(s._t === t) return; s._t = t; s.classList.toggle('th-dark', t === 'dark'); s.classList.toggle('th-white', t === 'white'); };
  const near = r => r.bottom > -innerHeight && r.top < innerHeight * 2;
  const sync = rects => secs.forEach((s, i) => { if(near(rects[i])) paint(s, shown); });
  const pick = () => {
    const rects = secs.map(s => s.getBoundingClientRect()), mid = innerHeight / 2;
    let t = cur;
    for(let i = 0; i < secs.length; i++){ if(rects[i].top <= mid && rects[i].bottom > mid){ t = secs[i].dataset.theme; break; } }
    /* אמצע המסך מעל הפוטר (אין שם סקשן): הנושא של הסקשן האחרון שכבר עבר, גם אחרי קפיצה ישירה לסוף */
    if(rects[secs.length - 1].bottom <= mid) t = secs[secs.length - 1].dataset.theme;
    if(t !== cur){
      cur = t;
      layers.forEach(l => { const on = l.dataset.t === t; if(on) l.style.zIndex = ++z; l.classList.toggle('on', on); });
      clearTimeout(timer);
      timer = setTimeout(() => { shown = cur; THEMES.forEach(c => document.body.classList.toggle(c, c === 't-' + shown)); sync(secs.map(s => s.getBoundingClientRect())); }, FLIP);
    }
    sync(rects);
    /* בסוף העמוד השכבה עולה עם קצה הדף כדי שהפוטר שמאחור ייחשף, עם חפיפה של שני פיקסלים נגד תפר */
    gsap.set(bg, { y: Math.min(0, Math.round(page.getBoundingClientRect().bottom - innerHeight) + 2) });
  };
  ScrollTrigger.create({ trigger:document.body, start:0, end:'max', onUpdate:pick, onRefresh:pick });
  addEventListener('resize', pick);
  pick();
})();

/* ---------- B55: מחוון מחליק בניווט. נוצר אחרון, אחרי ההצמדות, כדי שהטווחים יימדדו נכון ---------- */
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
