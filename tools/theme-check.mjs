// בדיקת מעברי נושא: שלושת הכשלים שכבר קרו, בכל גבול בין סקשן בהיר לכהה.
//   1. מונפש:  המעבר באמת קורה בהדרגה (נדגמת שקיפות ביניים של שכבת הרקע). נכשל כשהמעברים "מושבתים".
//   2. קריא:   במצב נח לפני, באמצע ואחרי הגבול, כל טקסט שעל המסך בניגודיות 3 לפחות מול הרקע בפועל. נכשל כשסקשן "נבלע".
//   3. חלק:    זמני פריים בגלילה חלקה דרך הגבול קרובים לגלילה בלי גבול. נכשל כשהמעבר "תקוע".
//   4. בלי קו חד: אף סקשן לא צובע רקע משלו (אחרת המעבר הוא קו ולא אנימציה).
// ופריימים לעין לכל גבול ב-tools/shots/theme/.
// usage: node tools/theme-check.mjs [--size WxH] [--mobile] [--base url]
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
let W = 1440, H = 900, mobile = false;
const BASE = opt("--base", "http://localhost:5173/v3/");
if (args.includes("--size")) [W, H] = opt("--size").split("x").map(Number);
if (args.includes("--mobile")) { mobile = true; W = 390; H = 844; }
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "tools", "shots", "theme"); fs.mkdirSync(out, { recursive: true });
for (const f of fs.readdirSync(out)) if (f.startsWith(`${W}x${H}`)) fs.unlinkSync(path.join(out, f));
const port = 9400 + Math.floor(Math.random() * 90);
const chrome = spawn(CH, ["--headless=new", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(process.env.TEMP, "tc-" + port)}`, `--window-size=${W},${H}`, "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 40 && !wsUrl; i++) { try { const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); wsUrl = l.find(t => t.type === "page")?.webSocketDebuggerUrl; } catch {} if (!wsUrl) await sleep(250); }
const ws = new WebSocket(wsUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map(), errors = [];
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); };
const send = (m, p = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
const js = async e => { const r = (await send("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true })).result; if (r.exceptionDetails) console.log("EVAL ERR", r.exceptionDetails.exception?.description); return r.result?.value; };
const shot = async n => { const s = await send("Page.captureScreenshot", { format: "jpeg", quality: 65 }); fs.writeFileSync(path.join(out, `${W}x${H}-${n}.jpg`), Buffer.from(s.result.data, "base64")); };

await send("Page.enable"); await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile });
await send("Page.navigate", { url: BASE + "?at=0" });
await sleep(6500);

// הרקע מאחורי כל טקסט: הרקע האטום הקרוב, ואם אין, השכבה העליונה הדולקת של #bg
const READABLE = String.raw`(() => {
  const parse = c => { const m = c.match(/[\d.]+/g); if (!m) return null; const s = /^color\(srgb/.test(c); const v = m.slice(0,3).map(Number).map(x => s ? x * 255 : x); const a = s ? (/\//.test(c) ? +m[3] : 1) : (m[3] !== undefined ? +m[3] : 1); return v.concat(a); };
  const lum = ([r,g,b]) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126*f(r) + .7152*f(g) + .0722*f(b); };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };
  const layers = [...document.querySelectorAll('#bg i')].filter(l => +getComputedStyle(l).opacity > .99).sort((a, b) => (+b.style.zIndex || 0) - (+a.style.zIndex || 0));
  const pageBg = layers.length ? parse(getComputedStyle(layers[0]).backgroundColor).slice(0, 3) : [241,241,241];
  // רקע = ההורה האטום הקרוב, או שכבת הרקע. elementsFromPoint נוסה ונפסל: הוא מחזיר גם שכבות בשקיפות 0 וממציא כשלים
  const bgOf = el => { let p = el; while (p && p !== document.body) { const c = parse(getComputedStyle(p).backgroundColor); if (c && c[3] > .5) return c.slice(0, 3); p = p.parentElement; } return pageBg; };
  const bad = [];
  for (const el of document.querySelectorAll('h1, h2, h3, p, .mono, b, label')) {
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.bottom < 70 || r.top > innerHeight - 10) continue;
    const s = getComputedStyle(el); if (s.visibility === 'hidden' || +s.opacity < .5) continue;
    // .mo-switch: הכפתור הפעיל יושב על פיל ליים שמחליק מאחוריו כאח ולא כהורה, ולכן לא נמדד כאן
    if (el.closest('[aria-hidden="true"], .hd, .stickycta, .vt-media, .pl-prev, #pre, .mo-switch')) continue;
    const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('');
    const txt = own || (el.children.length ? '' : el.textContent.trim());
    if (txt.length < 2) continue;
    const fg = parse(s.color); if (!fg || fg[3] < .5) continue;
    const k = ratio(fg.slice(0, 3), bgOf(el)); if (k < 3) bad.push(txt.slice(0, 24) + ' ' + k.toFixed(2));
  }
  const paint = [...document.querySelectorAll('[data-theme]')].filter(s => { const c = parse(getComputedStyle(s).backgroundColor); return c && c[3] > .5; }).length;
  return { bad, pageBg: pageBg.join(','), paint };
})()`;

const bounds = await js(`(() => { const s=[...document.querySelectorAll('[data-theme]')], o=[]; for(let i=1;i<s.length;i++){ if(s[i].dataset.theme!==s[i-1].dataset.theme) o.push({ at:(s[i].getBoundingClientRect().top+scrollY-innerHeight/2)|0, from:s[i-1].dataset.theme, to:s[i].dataset.theme, name:s[i].className.split(' ')[0] }); } return o; })()`);
const ctlAt = await js(`(() => { const s=document.querySelector('#works'); return (s.getBoundingClientRect().top+scrollY+s.offsetHeight/2-innerHeight/2)|0; })()`);
const glide = async (from, to) => {
  await js(`lenis.scrollTo(${from}, {immediate:true, force:true}); ScrollTrigger.update(); 1`);
  await sleep(1300);
  return js(`new Promise(res => { const t = [], ops = []; let last = performance.now(), go = true;
    const top = () => [...document.querySelectorAll('#bg i')].sort((a, b) => (+b.style.zIndex || 0) - (+a.style.zIndex || 0))[0];
    const f = n => { t.push(n - last); last = n; ops.push(+getComputedStyle(top()).opacity); if (go) requestAnimationFrame(f); };
    requestAnimationFrame(f); lenis.scrollTo(${to}, { duration: 1.4, easing: x => x, force: true });
    setTimeout(() => { go = false; t.shift(); const s = [...t].sort((a, b) => b - a); res({ worst: +s[0].toFixed(1), p95: +s[Math.floor(s.length * .05)].toFixed(1), animated: ops.some(o => o > .06 && o < .94) }); }, 2300); })`);
};

const ctl = await glide(ctlAt - 400, ctlAt + 400);
const rows = [], fails = [];
for (const [i, b] of bounds.entries()) {
  const g = await glide(b.at - 400, b.at + 400);
  const read = {};
  for (const [tag, y] of [["before", b.at - 260], ["mid", b.at + 40], ["after", b.at + 260]]) {
    await js(`lenis.scrollTo(${y}, {immediate:true, force:true}); ScrollTrigger.update(); 1`);
    await sleep(1100);
    read[tag] = await js(READABLE);
    await shot(`${String(i).padStart(2, "0")}-${b.name}-${tag}`);
  }
  const unreadable = [...read.before.bad, ...read.mid.bad, ...read.after.bad];
  const row = { boundary: `${b.from}>${b.to} ${b.name}`, animated: g.animated, worst: g.worst, p95: g.p95, unreadable: unreadable.length, paint: read.mid.paint };
  rows.push(row);
  if (!g.animated) fails.push(`${row.boundary}: המעבר לא מונפש`);
  if (unreadable.length) fails.push(`${row.boundary}: טקסט לא קריא: ${unreadable.slice(0, 3).join(' | ')}`);
  if (g.p95 > ctl.p95 * 2 + 2) fails.push(`${row.boundary}: p95 ${g.p95}ms מול ביקורת ${ctl.p95}ms`);
  if (read.mid.paint) fails.push(`${row.boundary}: ${read.mid.paint} סקשנים צובעים רקע משלהם, קו חד במקום מעבר`);
}
console.log(`ביקורת, גלילה בלי גבול: worst ${ctl.worst}ms · p95 ${ctl.p95}ms`);
console.table(rows);
if (errors.length) fails.push(`שגיאות קונסולה: ${errors.length}`);
console.log(fails.length ? "כשלים:\n  " + fails.join("\n  ") : `הכול עובר: ${rows.length} גבולות מונפשים, קריאים וחלקים. פריימים ב-tools/shots/theme`);
ws.close(); chrome.kill();
process.exit(fails.length ? 1 : 0);
