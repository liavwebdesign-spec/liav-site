/* =========================================================
   image sequence מוצמד לסקשן (מבוסס על scroll-template של velox)
   מה השתנה מול המקור:
   - הקנבס יושב ב-sticky בתוך #intro במקום fixed + spacer. הגלילה נמדדת
     יחסית לתחילת הסקשן, ואחרי הסוף הסקשן משתחרר והעמוד ממשיך.
   - הגלילה מגיעה מ-Lenis (גלגלת עם lerp, טאץ' 1:1). אין lerp פנימי.
   - CONFIG.frames הוא מערך: לכל סצנה מספר פריימים משלה.
   - אין לופ בסוף. הפריים האחרון קופא לאורך endHoldPx, ואז המסירה.
   מה לא השתנה (ואסור לשנות): <img> בלבד, warmDecode בחלון נע, התור,
   סולם הנפילה, DOM diff, מסנן ה-resize, ספי LOW_POWER/PORTRAIT.
   ========================================================= */
(function(){
const CONFIG = {
  scenes: 3,
  frames: [168, 120, 96],   // 24fps: 7.0s, 5.0s, 4.0s
  pxPerFrame: 24,           // 24 = הקצב שאושר ב-velox
  introPx: 220,             // גלילה על הפריים הפותח + הכותרת דרך המסכה
  holdPx: 520,              // hold אחרי כל סצנה
  endHoldPx: 420,           // hold על הפריים האחרון לפני שהסקשן משתחרר
  revealAt: .82,
  maskFade: .45,            // איזה חלק מסצנה 1 לוקח למסכת הכותרת להיעלם
  path:   (s,f) => `frames/${s}/${String(f).padStart(3,'0')}.jpg`,
  pathLo: (s,f) => `frames-lo/${s}/${String(f).padStart(3,'0')}.jpg`,
  pathPt: (s,f) => `frames-pt/${s}/${String(f).padStart(3,'0')}.jpg`,
  opening: 'opening.jpg',
  openingPt: 'opening-pt.jpg',
};

const intro = document.getElementById('intro');
const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d', {alpha:false});
const layers = [...intro.querySelectorAll('.layer')];
const titlemask = document.getElementById('titlemask');
const bufferPill = document.getElementById('buffer');
const pre = document.getElementById('pre');
const loadbar = document.getElementById('loadbar');
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;

const store = { hi:{}, lo:{} };
const loaded = { hi:{}, lo:{} };
let opening = null;

const LOW_POWER = innerWidth < 900 || (navigator.deviceMemory && navigator.deviceMemory <= 4);
const USE_HI = !LOW_POWER;
const PORTRAIT = LOW_POWER && (innerHeight / innerWidth) > 1.4;
const proxyPath = PORTRAIT ? CONFIG.pathPt : CONFIG.pathLo;
const FR = s => CONFIG.frames[s-1];

/* ---------- timeline ---------- */
const seg = [];
(function buildTimeline(){
  let cur = CONFIG.introPx;
  for(let s=1; s<=CONFIG.scenes; s++){
    const start = cur, end = start + FR(s) * CONFIG.pxPerFrame;
    const holdEnd = end + (s === CONFIG.scenes ? CONFIG.endHoldPx : CONFIG.holdPx);
    seg[s] = {start, end, holdEnd};
    cur = holdEnd;
  }
})();
const TOTAL = REDUCE ? 0 : seg[CONFIG.scenes].holdEnd;
function applyHeight(){ intro.style.height = (TOTAL + innerHeight) + 'px'; }

/* ---------- drawing ---------- */
let dpr = 1, lastImg = null;
/* מסכת הכותרת: viewBox = המסך, והטקסט מכויל ל-88% מהרוחב, כך שבפורטרט הוא לא נחתך */
function fitMask(){
  const svg = titlemask.querySelector('svg'), text = svg.querySelector('text');
  const W = innerWidth, H = innerHeight;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('preserveAspectRatio', 'none');
  svg.querySelectorAll('rect').forEach(r => { r.setAttribute('width', W); r.setAttribute('height', H); });
  text.setAttribute('x', W/2); text.setAttribute('y', H/2);
  text.setAttribute('font-size', 100);
  const w = text.getComputedTextLength() || 1;
  text.setAttribute('font-size', Math.min(100 * (W*.88) / w, H*.42));
}
function resize(){
  dpr = Math.min(window.devicePixelRatio || 1, LOW_POWER ? 1.5 : 2);
  fitMask();
  canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
  canvas.style.width = innerWidth+'px'; canvas.style.height = innerHeight+'px';
  applyHeight();
  if(lastImg) draw(lastImg);
}
function draw(img){
  const iw = img && (img.width || img.naturalWidth), ih = img && (img.height || img.naturalHeight);
  if(!iw || !ih) return;
  lastImg = img;
  const cw = canvas.width, ch = canvas.height, ir = iw/ih, cr = cw/ch;
  let dw, dh, dx, dy;
  if(cr > ir){ dw = cw; dh = cw/ir; dx = 0; dy = (ch-dh)/2; } else { dh = ch; dw = ch*ir; dy = 0; dx = (cw-dw)/2; }
  ctx.drawImage(img, dx, dy, dw, dh);
}

/* ---------- loading ---------- */
function loadImage(src){ return new Promise(res=>{ const im = new Image(); im.onload = ()=>res(im); im.onerror = ()=>res(null); im.src = src; }); }
let decodeBusy = 0;
function warmDecode(s, from){
  const tier = (USE_HI && store.hi[s]) ? 'hi' : 'lo';
  const arr = store[tier][s]; if(!arr) return;
  for(let i=Math.max(0,from-6); i<Math.min(from+40, FR(s)); i++){
    if(decodeBusy >= 4) return;
    const im = arr[i];
    if(im && im.naturalWidth && !im.__warm){ im.__warm = 1; decodeBusy++; im.decode().catch(()=>{}).then(()=>{ decodeBusy--; }); }
  }
}
async function loadScene(s, tier, onProgress){
  const st = store[tier], ld = loaded[tier];
  if(ld[s]) return st[s];
  if(st[s] && st[s].__loading) return st[s].__loading;
  st[s] = st[s] || [];
  const path = tier==='hi' ? CONFIG.path : proxyPath;
  const tasks = [];
  for(let f=1; f<=FR(s); f++){
    tasks.push(loadImage(path(s,f)).then(im=>{
      if(im && im.naturalWidth) st[s][f-1] = im;
      onProgress && onProgress();
      if(pending && pending.scene===s && pending.frame===f-1) render(true);
    }));
  }
  const p = Promise.all(tasks).then(()=>{ ld[s]=true; return st[s]; });
  st[s].__loading = p;
  return p;
}
let queue = [], pumping = false, queueScene = 1;
function buildQueue(cur){
  const order = [];
  for(let s=1; s<=CONFIG.scenes; s++) if(!loaded.lo[s]) order.push({s, tier:'lo'});
  const fwd=[], back=[];
  if(USE_HI){
    for(let s=cur; s<=CONFIG.scenes; s++) if(!loaded.hi[s]) fwd.push({s, tier:'hi'});
    for(let s=cur-1; s>=1; s--) if(!loaded.hi[s]) back.push({s, tier:'hi'});
  }
  const curLo = order.findIndex(x=>x.s===cur);
  if(curLo>0) order.unshift(order.splice(curLo,1)[0]);
  queue = order.concat(fwd, back);
}
async function pump(){ if(pumping) return; pumping = true; while(queue.length){ const {s, tier} = queue.shift(); await loadScene(s, tier); } pumping = false; }
function prioritize(s){ if(s === queueScene && pumping) return; queueScene = s; buildQueue(s); pump(); }
function frameFor(s, idx){
  const hi = USE_HI ? store.hi[s] : null, lo = store.lo[s];
  if(hi && hi[idx]) return {img:hi[idx], exact:true};
  if(lo && lo[idx]) return {img:lo[idx], exact:true};
  for(let d=1; d<FR(s); d++){
    const cands = [hi&&hi[idx-d], hi&&hi[idx+d], lo&&lo[idx-d], lo&&lo[idx+d]];
    for(const c of cands) if(c) return {img:c, exact:false};
  }
  return {img:null, exact:false};
}

/* ---------- scroll -> frame ---------- */
let viewY = 0, pending = null;
function sceneAt(y){
  if(y < CONFIG.introPx) return 0;
  for(let s=1; s<=CONFIG.scenes; s++) if(y < seg[s].holdEnd) return s;
  return CONFIG.scenes;
}
let lastExact = null, lastLayer = -1, lastLayerOn = null, lastMask = -1;
function setLayer(idx, on){
  on = !!on;
  if(idx === lastLayer && on === lastLayerOn) return;
  layers.forEach(l => l.classList.toggle('show', (+l.dataset.scene === idx) && on));
  lastLayer = idx; lastLayerOn = on;
}
/* מסכת הכותרת: מלאה על הפריים הפותח, נמסה בתחילת סצנה 1 עם זום קל */
function setMask(y){
  const s1 = seg[1];
  const fadeLen = (s1.end - s1.start) * CONFIG.maskFade;
  let t = y <= s1.start ? 0 : Math.min(1, (y - s1.start) / fadeLen);
  t = Math.round(t*200)/200;
  if(t === lastMask) return;
  lastMask = t;
  titlemask.style.opacity = String(1 - t);
  titlemask.style.transform = `scale(${1 + t*.35})`;
  titlemask.style.visibility = t >= 1 ? 'hidden' : 'visible';
}
function render(redrawOnly){
  const y = Math.max(0, Math.min(viewY, TOTAL));
  const s = sceneAt(y);
  if(s === 0){
    pending = null;
    draw(opening);
    setLayer(0, 1);
    if(!redrawOnly) setMask(y);
    return;
  }
  const {start, end} = seg[s];
  let frame, local;
  if(y <= end){ local = (y - start) / (end - start); frame = Math.min(FR(s)-1, Math.floor((y - start) / CONFIG.pxPerFrame)); }
  else { local = 1; frame = FR(s) - 1; }
  pending = {scene:s, frame};
  if(s !== queueScene) prioritize(s);
  const {img, exact} = frameFor(s, frame);
  if(img && img !== lastImg) draw(img);
  if(exact !== lastExact){ bufferPill.classList.toggle('show', !exact); lastExact = exact; }
  if(redrawOnly) return;
  warmDecode(s, frame);
  setLayer(s, local >= CONFIG.revealAt ? 1 : 0);
  setMask(y);   /* מסצנה 2 והלאה t=1, כך שקפיצה ישירה לא משאירה את המסכה */
}

/* ---------- driver: Lenis מספק את מיקום הגלילה, ה-rAF רק מרנדר ---------- */
let scrollNow = 0;
function onScroll(v){ scrollNow = v; }
function tick(){
  const top = intro.offsetTop;
  const target = Math.max(0, Math.min(scrollNow - top, TOTAL));
  if(target !== viewY || !lastImg){ viewY = target; render(); }
  requestAnimationFrame(tick);
}

/* resize מסונן: לא מגיבים לשורת הכתובת של המובייל */
let lastW = innerWidth, lastH = innerHeight;
addEventListener('resize', ()=>{
  const dw = Math.abs(innerWidth - lastW), dh = Math.abs(innerHeight - lastH);
  if(dw < 1 && dh < 160) return;
  lastW = innerWidth; lastH = innerHeight;
  const nowPortrait = LOW_POWER && (innerHeight / innerWidth) > 1.4;
  if(nowPortrait !== PORTRAIT){ location.reload(); return; }
  resize(); render(true);
  window.ScrollTrigger && ScrollTrigger.refresh();
});

/* ---------- boot ---------- */
if(document.fonts && document.fonts.ready) document.fonts.ready.then(fitMask);
const ready = (async function boot(){
  if(scrollY > 0) scrollTo({top:0, behavior:'auto'});
  resize();
  let done = 0;
  const total = (REDUCE ? 0 : FR(1)) + 1;
  const prog = ()=>{ done++; loadbar.style.width = Math.min(100,Math.round(done/total*100))+'%'; };
  opening = await loadImage(PORTRAIT ? CONFIG.openingPt : CONFIG.opening); prog();
  if(REDUCE){ draw(opening); titlemask.style.opacity = 1; return; }
  await loadScene(1, USE_HI ? 'hi' : 'lo', prog);
  render();
  requestAnimationFrame(tick);
  prioritize(1);
})();

window.sequence = { CONFIG, seg, TOTAL, ready, onScroll, LOW_POWER, PORTRAIT, USE_HI, store, loaded, intro };
})();
