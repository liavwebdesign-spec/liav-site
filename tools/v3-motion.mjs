// בדיקת תנועה, לא צילום סטטי: גוללים באמת לאורך העמוד בצעדים קטנים, דוגמים את הלופים
// ואת ההצמדות בזמן, ומחפשים קפיצות. בסוף מצלמים סרט-פריימים ומדביקים לגיליון אחד.
// usage: node tools/v3-motion.mjs [--size 1440x900] [--mobile] [--base url]
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const args = process.argv.slice(2);
let W = 1440, H = 900, mobile = false;
const bi = args.indexOf("--base"), BASE = bi >= 0 ? args[bi + 1] : "http://localhost:5173/v3/";
const si = args.indexOf("--size"); if (si >= 0) [W, H] = args[si + 1].split("x").map(Number);
if (args.includes("--mobile")) { mobile = true; W = 390; H = 844; }
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "tools", "shots", "film"); fs.mkdirSync(out, { recursive: true });
const port = 9900 + Math.floor(Math.random() * 80);
const chrome = spawn(CH, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--autoplay-policy=no-user-gesture-required",
  `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(process.env.TEMP, "v3m-" + port)}`, `--window-size=${W},${H}`, "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 40 && !wsUrl; i++) { try { const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); wsUrl = l.find(t => t.type === "page")?.webSocketDebuggerUrl; } catch {} if (!wsUrl) await sleep(250); }
const ws = new WebSocket(wsUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map(), errors = [];
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); };
const send = (m, p = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
const js = async e => { const r = (await send("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true })).result; if (r.exceptionDetails) console.log("EVAL ERR", r.exceptionDetails.exception?.description); return r.result?.value; };
const tag = `${W}x${H}`;
const fails = [];
const check = (ok, msg) => { console.log((ok ? "עובר  " : "נכשל  ") + msg); if (!ok) fails.push(msg); };

await send("Page.enable"); await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile });
await send("Page.navigate", { url: BASE });
await sleep(7000);   // פרילודר אמיתי, לא מצב QA: בודקים את הכניסה כמו גולש

// --- 1. הירו G54: אחרי הכניסה כל תשע העבודות התכנסו לגריד (בלי היסט, סיבוב או שקיפות) ---
const cvEnd = await js(`[...document.querySelectorAll('#cv figure')].map(f => [gsap.getProperty(f,'xPercent'), gsap.getProperty(f,'yPercent'), gsap.getProperty(f,'rotate'), gsap.getProperty(f,'scale'), +getComputedStyle(f).opacity])`);
check(cvEnd.length === 9 && cvEnd.every(([x, y, r, s, o]) => Math.abs(x) < .5 && Math.abs(y) < .5 && Math.abs(r) < .5 && Math.abs(s - 1) < .01 && o > .99), `הגריד בהירו התכנס: ${cvEnd.length} עבודות במקום`);

// --- 2. גלילה אמיתית לאורך כל העמוד, בצעדים, עם דגימה של הרצועות והצמדות ---
const total = await js(`document.body.scrollHeight - innerHeight`);
const step = 24, frames = [];
let mqPrev = null, mqJumps = 0, mqSamples = 0, themes = new Set(), errorsMid = errors.length;
const filmY = Array.from({ length: 24 }, (_, i) => Math.round(total * i / 23)); let fi = 0;
let y = 0, k = 0;
while (y <= total) {
  await js(`lenis ? lenis.scrollTo(${y}, {immediate:true, force:true}) : scrollTo(0, ${y}); ScrollTrigger.update(); 1`);
  if (k % 6 === 0) {
    const s = await js(`(() => { const rows=[...document.querySelectorAll('.mq-in')]; return { mq: rows.map(r => +gsap.getProperty(r,'x')), setW: rows.map(r => r.scrollWidth), theme: [...document.body.classList].find(c => c.startsWith('t-')), y: scrollY|0 }; })()`);
    themes.add(s.theme);
    if (mqPrev) {
      s.mq.forEach((x, i) => { const d = x - mqPrev.mq[i]; mqSamples++; if (Math.abs(d) > 400 && Math.abs(Math.abs(d) - mqPrev.setW[i] / 3) > 400 && Math.abs(d) < mqPrev.setW[i] * .6) mqJumps++; });
    }
    mqPrev = s;
  }
  if (fi < filmY.length && y >= filmY[fi]) { fi++; await sleep(350); const sh = await send("Page.captureScreenshot", { format: "jpeg", quality: 60 }); frames.push(Buffer.from(sh.result.data, "base64")); }
  y += step; k++;
  await sleep(16);
}
check(mqJumps === 0, `הרצועות לא קופצות במהלך גלילה (${mqSamples} דגימות, ${mqJumps} קפיצות)`);
check([...themes].filter(Boolean).length >= 3, `הנושא מתחלף בגלילה: ${[...themes].join(', ')}`);

// --- 3. רצועה במנוחה: רציפות ומהירות ---
await js(`lenis ? lenis.scrollTo(document.querySelector('#mq').getBoundingClientRect().top + scrollY - innerHeight/2, {immediate:true, force:true}) : 1; ScrollTrigger.update(); 1`);
await sleep(600);
const mq = await sample(`[...document.querySelectorAll('.mq-in')].map(r => +gsap.getProperty(r,'x'))`, 10, 100);
const speed = Math.abs(mq[9][0] - mq[0][0]) / .9;
check(speed > 50 && speed < 400, `מהירות הרצועה במנוחה ~${speed.toFixed(0)}px/s`);
const gaps = await js(`(() => { const r = document.querySelector('.mq-in'); const w = r.scrollWidth; return { w, vw: innerWidth, ok: w >= innerWidth * 2 }; })()`);
check(gaps.ok, `הרצועה רחבה פי שניים מהמסך לפחות (${gaps.w} מול ${gaps.vw})`);

// --- 4. הצמדת הווידאו: הרצועה זזה עם הגלילה ---
const pin = await js(`(() => { const st = ScrollTrigger.getAll().find(t => t.pin && t.pin.classList.contains('vt-pin')); return st ? { s: st.start, e: st.end } : null; })()`);
if (pin) {
  const xs = [];
  for (const f of [0.05, .5, .95]) { await js(`lenis ? lenis.scrollTo(${pin.s + (pin.e - pin.s) * f}, {immediate:true, force:true}) : 1; ScrollTrigger.update(); 1`); await sleep(500); xs.push(await js(`({ x: +gsap.getProperty('#vt-track','x'), idx: document.getElementById('vt-idx').textContent })`)); }
  check(xs[0].x < xs[1].x && xs[1].x < xs[2].x, `רצועת הווידאו נגללת עם ההצמדה: ${xs.map(v => v.idx).join(' → ')}`);
} else check(false, "לא נמצאה הצמדה לרצועת הווידאו");

// --- 5. הפורטרט נחשף ---
await js(`lenis ? lenis.scrollTo(document.querySelector('#about').getBoundingClientRect().top + scrollY, {immediate:true, force:true}) : 1; ScrollTrigger.update(); 1`);
await sleep(2200);
const por = await js(`({ clip: getComputedStyle(document.getElementById('portrait')).clipPath, h: document.getElementById('portrait').offsetHeight })`);
check(/inset\(0(px|%)/.test(por.clip) || por.clip === 'none', `הפורטרט נחשף במלואו (${por.clip}), גובה ${por.h}px`);
check(por.h > (mobile ? 380 : 520), `הפורטרט גדול (${por.h}px)`);

check(errors.length === 0, `אפס שגיאות קונסולה (${errors.length})`);
// --- גיליון פריימים ---
frames.forEach((b, i) => fs.writeFileSync(path.join(out, `${tag}-${String(i).padStart(2, "0")}.jpg`), b));
fs.writeFileSync(path.join(out, `${tag}-frames.json`), JSON.stringify(frames.length));
console.log(`\n${fails.length ? 'כשלים: ' + fails.length : 'הכול עובר'} · ${frames.length} פריימים ב-tools/shots/film`);
ws.close(); chrome.kill();
process.exit(fails.length ? 1 : 0);
