// QA מקיף על העמוד החי או המקומי, בכל רוחב, דרך CDP.
// usage: node tools/qa.mjs [--base http://localhost:5173/] [--widths 375,390,414,768,1024,1280,1440,1920]
// בודק: גלישה אופקית, ניגודיות, יעדי מגע, סולם ריווח, יישור גריד, טעינת פונטים,
// יחס טיפוגרפי, measure, חפיפות, טקסט חתוך, תמונות מעוותות, וטבעות פוקוס.
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const BASE = opt("--base", "http://localhost:5173/");
const WIDTHS = opt("--widths", "375,390,768,1024,1280,1440,1920").split(",").map(Number);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = 9500 + Math.floor(Math.random() * 80);
const chrome = spawn(CH, ["--headless=new", "--disable-gpu", "--hide-scrollbars",
  `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(process.env.TEMP, "qa-" + port)}`,
  "--window-size=1280,900", "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));

let wsUrl;
for (let i = 0; i < 40 && !wsUrl; i++) {
  try { const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); wsUrl = l.find(t => t.type === "page")?.webSocketDebuggerUrl; } catch {}
  if (!wsUrl) await sleep(250);
}
const ws = new WebSocket(wsUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evalJS = async expr => {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400));
  return r.result.result.value;
};

const PROBE = String.raw`(() => {
  const out = { overflow: [], contrast: [], touch: [], spacing: [], grid: [], fonts: [], type: {}, measure: [], clipped: [], images: [], focus: [], dup: [] };
  const vw = innerWidth;
  const vis = el => { const s = getComputedStyle(el); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const name = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0,2).join('.') : '');

  // --- 1. גלישה אופקית ---
  if (document.documentElement.scrollWidth > vw + 1) out.overflow.push({ el: 'document', w: document.documentElement.scrollWidth, vw });
  for (const el of document.querySelectorAll('body *')) {
    if (!vis(el)) continue;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    if (s.position === 'fixed') continue;
    if (r.right > vw + 1.5 || r.left < -1.5) {
      // מתעלמים מאלמנטים שההורה שלהם חותך אותם בכוונה
      let p = el.parentElement, clipped = false;
      while (p && p !== document.body) { const ps = getComputedStyle(p); if (/hidden|clip/.test(ps.overflowX)) { clipped = true; break; } p = p.parentElement; }
      if (!clipped) out.overflow.push({ el: name(el), left: Math.round(r.left), right: Math.round(r.right), vw });
    }
  }

  // --- 2. ניגודיות טקסט מול הרקע האפקטיבי ---
  const lum = ([r,g,b]) => { const f = v => { v/=255; return v<=.03928 ? v/12.92 : Math.pow((v+.055)/1.055,2.4); }; return .2126*f(r)+.7152*f(g)+.0722*f(b); };
  const parse = c => { const m = c.match(/[\d.]+/g); return m ? m.slice(0,3).map(Number).concat(m[3]!==undefined?+m[3]:1) : null; };
  const bgOf = el => { let p = el; while (p) { const c = parse(getComputedStyle(p).backgroundColor); if (c && c[3] > .5) return c.slice(0,3); p = p.parentElement; } return [255,255,255]; };
  const ratio = (a,b) => { const [l1,l2] = [lum(a),lum(b)].sort((x,y)=>y-x); return (l1+.05)/(l2+.05); };
  for (const el of document.querySelectorAll('p, h1, h2, h3, a, span, label, button, small, li')) {
    if (!vis(el)) continue;
    const txt = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('');
    if (txt.length < 2) continue;
    const s = getComputedStyle(el);
    const fg = parse(s.color); if (!fg || fg[3] < .5) continue;
    const r = ratio(fg.slice(0,3), bgOf(el));
    const size = parseFloat(s.fontSize), bold = +s.fontWeight >= 700;
    const need = (size >= 24 || (size >= 18.66 && bold)) ? 3 : 4.5;
    if (r < need) out.contrast.push({ el: name(el), txt: txt.slice(0,28), ratio: +r.toFixed(2), need, size: Math.round(size) });
  }

  // --- 3. יעדי מגע ---
  if (vw < 900) for (const el of document.querySelectorAll('a, button, input')) {
    if (!vis(el)) continue;
    const r = el.getBoundingClientRect();
    if (el.closest('.mono') && r.height < 20) continue;
    if (r.height < 44 || r.width < 24) out.touch.push({ el: name(el), w: Math.round(r.width), h: Math.round(r.height) });
  }

  // --- 4. סולם ריווח ---
  // 25 ו-15 הם המרזב והשוליים של הגריד השוויצרי, בדיוק כמו ב-madewithgsap. הם הסולם, לא חריגה.
  const SCALE = new Set([0,1,2,4,6,8,10,12,14,15,16,18,20,22,24,25,26,28,32,36,40,44,48,56,60,64,70,72,80,88,96,112,120,128,140,160,180,200]);
  const seen = new Map();
  for (const el of document.querySelectorAll('section, .grid, .pl-row, .ss-item, .pill, .sec-head, footer, header')) {
    if (!vis(el)) continue;
    const s = getComputedStyle(el);
    for (const p of ['paddingTop','paddingBottom','paddingLeft','paddingRight','marginTop','marginBottom','rowGap','columnGap']) {
      const v = Math.round(parseFloat(s[p]) || 0);
      const centering = /padding(Left|Right)/.test(p) && vw > 1680;
      if (v && !SCALE.has(v) && !centering) { const k = name(el) + ' ' + p + ':' + v; if (!seen.has(k)) seen.set(k, v); }
    }
  }
  out.spacing = [...seen.keys()].slice(0, 24);

  // --- 5. יישור גריד: קצה ההתחלה של כל סקשן ---
  const edges = [];
  for (const sec of document.querySelectorAll('.grid')) {
    if (!vis(sec)) continue;
    const r = sec.getBoundingClientRect();
    const s = getComputedStyle(sec);
    edges.push({ el: name(sec), start: Math.round(vw - r.right + parseFloat(s.paddingRight)) });
  }
  const starts = [...new Set(edges.map(e => e.start))];
  if (starts.length > 1) out.grid = edges;

  // --- 6. פונטים: מה באמת הוחל ---
  const fam = el => getComputedStyle(el).fontFamily.split(',')[0].replace(/['"]/g,'').trim();
  const want = { h1: 'Sataf', h2: 'Sataf', h3: 'Sataf', 'p:not(.mono)': 'Begin', '.mono': 'IndexMono' };
  for (const [sel, exp] of Object.entries(want)) {
    const el = [...document.querySelectorAll(sel)].find(vis);
    if (el) { const got = fam(el); if (got !== exp) out.fonts.push({ sel, want: exp, got }); }
  }
  out.fonts.push({ loaded: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight) });

  // --- 7. יחס טיפוגרפי ומשקלים ---
  const h1 = [...document.querySelectorAll('h1')].find(vis);
  const bp = [...document.querySelectorAll('p')].find(vis);
  if (h1 && bp) {
    const hs = parseFloat(getComputedStyle(h1).fontSize), bs = parseFloat(getComputedStyle(bp).fontSize);
    out.type.ratio = +(hs/bs).toFixed(2); out.type.h1 = Math.round(hs); out.type.body = Math.round(bs);
    out.type.lhH1 = +(parseFloat(getComputedStyle(h1).lineHeight)/hs).toFixed(2);
    out.type.lhP  = +(parseFloat(getComputedStyle(bp).lineHeight)/bs).toFixed(2);
    out.type.lsH1 = getComputedStyle(h1).letterSpacing;
  }
  const weights = new Set();
  for (const el of document.querySelectorAll('h1,h2,h3,p,a,span,button,label,small')) if (vis(el)) weights.add(getComputedStyle(el).fontWeight);
  out.type.weights = [...weights].sort();

  // --- 8. measure ---
  for (const el of document.querySelectorAll('p')) {
    if (!vis(el)) continue;
    const t = el.textContent.trim(); if (t.length < 40) continue;
    const r = el.getBoundingClientRect(), fs = parseFloat(getComputedStyle(el).fontSize);
    const ch = Math.round(r.width / (fs * 0.5));
    if (ch > 80) out.measure.push({ el: name(el), ch, w: Math.round(r.width) });
  }

  // --- 9. טקסט חתוך ---
  for (const el of document.querySelectorAll('h1,h2,h3,p,a,span,button,label')) {
    if (!vis(el)) continue;
    const s = getComputedStyle(el);
    if (!/hidden|clip/.test(s.overflow) && !/hidden|clip/.test(s.overflowY)) continue;
    // .ff-btn מחזיק שלושה מצבים מוערמים בכוונה, ו-.h1w הוא מסכת הכניסה
    if (el.scrollHeight > el.clientHeight + 2 && el.clientHeight > 0 && !el.closest('.h1w') && !el.classList.contains('ff-btn')) out.clipped.push({ el: name(el), sh: el.scrollHeight, ch: el.clientHeight });
  }

  // --- 10. תמונות: עיוות יחס וטעינה ---
  for (const img of document.querySelectorAll('img')) {
    // lazy מתחת לקיפול הוא התנהגות נכונה, לא תקלה. בודקים רק מה שקרוב למסך.
    // תצוגות מקדימות מוסתרות נטענות רק בהובר, וזו התנהגות נכונה
    if (img.closest('[aria-hidden="true"]')) continue;
    const rr = img.getBoundingClientRect();
    // שקופית שיושבת מחוץ למסגרת החותכת של הקרוסלה אינה נראית, גם אם היא בתוך המסך
    let clipBox = null, anc = img.parentElement;
    while (anc && anc !== document.body) { if (/hidden|clip/.test(getComputedStyle(anc).overflow + getComputedStyle(anc).overflowX)) { clipBox = anc.getBoundingClientRect(); break; } anc = anc.parentElement; }
    const inClip = !clipBox || (rr.left < clipBox.right - 1 && rr.right > clipBox.left + 1 && rr.top < clipBox.bottom - 1 && rr.bottom > clipBox.top + 1);
    const near = inClip && rr.top < innerHeight && rr.bottom > 0 && rr.left < innerWidth && rr.right > 0;
    if (!vis(img)) continue;
    if (!img.complete) { if (near) out.images.push({ src: img.getAttribute('src'), issue: 'not-loaded' }); continue; }
    if (!img.naturalWidth) { out.images.push({ src: img.getAttribute('src'), issue: 'broken' }); continue; }
    const r = img.getBoundingClientRect(), s = getComputedStyle(img);
    const natR = img.naturalWidth / img.naturalHeight, boxR = r.width / r.height;
    if (Math.abs(natR - boxR) > .02 && (s.objectFit === 'fill' || s.objectFit === 'none'))
      out.images.push({ src: img.getAttribute('src'), issue: 'distorted', natR: +natR.toFixed(2), boxR: +boxR.toFixed(2) });
    if (r.width > img.naturalWidth * 1.6) out.images.push({ src: img.getAttribute('src'), issue: 'upscaled', box: Math.round(r.width), nat: img.naturalWidth });
  }

  // --- 11. טבעת פוקוס ---
  const fr = [...document.styleSheets].some(ss => { try { return [...ss.cssRules].some(r => /focus-visible/.test(r.selectorText || '')); } catch { return false; } });
  if (!fr) out.focus.push('אין כלל focus-visible');

  out.docH = document.body.scrollHeight;
  return out;
})()`;

const report = {};
await send("Page.enable");
for (const W of WIDTHS) {
  const mobile = W < 900;
  await send("Emulation.setDeviceMetricsOverride", { width: W, height: mobile ? 844 : 900, deviceScaleFactor: 1, mobile });
  await send("Page.navigate", { url: `${BASE}?qa=1&w=${W}` });
  await sleep(mobile ? 5200 : 4600);
  await evalJS("window.scrollTo(0, document.body.scrollHeight); 1");
  await sleep(1400);
  await evalJS("window.scrollTo(0, 0); 1");
  await sleep(2200);   // מעבר הנושא נמשך 0.8 שניות. מודדים רק אחרי שהוא נח.
  report[W] = await evalJS(PROBE);
}
ws.close(); chrome.kill();

let fails = 0;
for (const [W, r] of Object.entries(report)) {
  const lines = [];
  const add = (label, arr, fmt = JSON.stringify) => { if (arr && arr.length) { lines.push(`  ${label} (${arr.length}):`); arr.slice(0, 6).forEach(x => lines.push(`     ${typeof x === 'string' ? x : fmt(x)}`)); fails += arr.length; } };
  add("גלישה אופקית", r.overflow);
  add("ניגודיות", r.contrast);
  add("יעדי מגע", r.touch);
  add("מחוץ לסולם ריווח", r.spacing);
  add("קצוות גריד לא מיושרים", r.grid);
  add("פונט לא הוחל", r.fonts.filter(f => f.sel));
  add("measure מעל 80", r.measure);
  add("טקסט חתוך", r.clipped);
  add("תמונות", r.images);
  add("פוקוס", r.focus);
  const t = r.type;
  if (t.ratio && t.ratio < 3 && +W >= 900) { lines.push(`  יחס H1/גוף ${t.ratio} (${t.h1}/${t.body}), נדרש 3.0`); fails++; }
  if (t.lhH1 && t.lhP && (t.lhP - t.lhH1) < .35) { lines.push(`  הפרש גובה שורה ${(t.lhP-t.lhH1).toFixed(2)}, נדרש 0.35`); fails++; }
  if (t.weights && t.weights.length > 4) { lines.push(`  ${t.weights.length} משקלים: ${t.weights.join(',')}`); fails++; }
  console.log(`\n=== ${W}px === גובה ${r.docH} | H1/גוף ${t.ratio} | משקלים ${(t.weights||[]).join(',')}`);
  console.log(lines.length ? lines.join("\n") : "  נקי");
}
console.log(`\nסך ממצאים: ${fails}`);
