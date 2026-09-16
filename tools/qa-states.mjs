// בדיקת מצבים שסריקה סטטית לא רואה: פוקוס, הובר, תפריט פתוח, ותנועה מופחתת.
// usage: node tools/qa-states.mjs [--base url]
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const args = process.argv.slice(2);
const BASE = (args.indexOf("--base") >= 0 && args[args.indexOf("--base") + 1]) || "http://localhost:5173/v3/";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "tools", "shots");
fs.mkdirSync(out, { recursive: true });
const port = 9600 + Math.floor(Math.random() * 70);
const chrome = spawn(CH, ["--headless=new", "--disable-gpu", "--hide-scrollbars",
  `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(process.env.TEMP, "st-" + port)}`,
  "--window-size=1440,900", "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 40 && !wsUrl; i++) {
  try { const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); wsUrl = l.find(t => t.type === "page")?.webSocketDebuggerUrl; } catch {}
  if (!wsUrl) await sleep(250);
}
const ws = new WebSocket(wsUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (m, p = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
const js = async e => (await send("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true })).result.result.value;
const shot = async n => { const s = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false }); fs.writeFileSync(path.join(out, n + ".png"), Buffer.from(s.result.data, "base64")); };

await send("Page.enable");
await send("Emulation.setFocusEmulationEnabled", { enabled: true });
const results = [];

// --- תנועה מופחתת: כלום לא אמור לזוז, והכול אמור להיראות ---
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: BASE + "?rm=1" });

await sleep(5000);
results.push({ test: "תנועה מופחתת, פרילודר נסגר", pass: await js("getComputedStyle(document.getElementById('pre')).display === 'none'") });
results.push({ test: "תנועה מופחתת, תוכן ההירו גלוי", pass: await js("[...document.querySelectorAll('.hero .rv')].every(e => +getComputedStyle(e).opacity > .9)") });
results.push({ test: "תנועה מופחתת, המניפסט קריא", pass: await js("[...document.querySelectorAll('.mani .w')].every(e => getComputedStyle(e).color !== 'rgba(0, 0, 0, 0)')") });
await shot("state-reduced");

// --- מצב רגיל: פוקוס, הובר, תפריט ---
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
await send("Page.navigate", { url: BASE + "?st=1" });
await sleep(5200);

const tab = async () => { for (const type of ["keyDown", "keyUp"]) await send("Input.dispatchKeyEvent", { type, key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 }); await sleep(160); };
await js("document.body.focus(); 1");
let focusInfo = null;
for (let i = 0; i < 8 && !focusInfo; i++) {
  await tab();
  focusInfo = await js(`(() => { const el = document.activeElement; if (!el || el === document.body) return null;
    const s = getComputedStyle(el);
    return { on: el.tagName + '.' + (el.className||''), outline: s.outlineWidth + ' ' + s.outlineStyle + ' ' + s.outlineColor }; })()`);
}
focusInfo = focusInfo || { outline: "none", on: "לא הגיע לאף אלמנט" };
results.push({ test: "טבעת פוקוס ב-Tab אמיתי", pass: !/none|0px/.test(focusInfo.outline), detail: focusInfo.on + " | " + focusInfo.outline });
await shot("state-focus");

await js("document.querySelector('#contact').scrollIntoView(); 1");
await sleep(900);
await js("document.querySelector('.ff-field input').focus(); 1");
await sleep(700);
const inputFocus = await js("(() => { const s = getComputedStyle(document.querySelector('.ff-field input')); return { border: s.borderBottomColor, outline: s.outlineStyle }; })()");
results.push({ test: "שדה טופס בפוקוס משנה צבע (ולא טבעת דפדפן)", pass: /^rgb\(216, 252, 115\)$/.test(inputFocus.border), detail: JSON.stringify(inputFocus) });

// תפריט מסך מלא
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await sleep(900);
await js("document.querySelector('.nv-toggle').click(); 1");
await sleep(1100);
const menu = await js(`(() => {
  const ov = document.querySelector('.nv-overlay'), l = ov.querySelector('.nv-link');
  const ls = getComputedStyle(l), os = getComputedStyle(ov);
  const lum = c => { const m = c.match(/[\\d.]+/g).slice(0,3).map(Number); const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)}; return .2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2]); };
  const r = (a,b) => { const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p); return (x+.05)/(y+.05); };
  return { open: os.clipPath, ratio: +r(ls.color, os.backgroundColor).toFixed(2), logoLight: +getComputedStyle(document.querySelector('.hd .logo .on-dark')).opacity };
})()`);
results.push({ test: "תפריט נפתח במלואו", pass: /^inset\(0px( 0px){0,3}\)$|none/.test(menu.open), detail: menu.open });
results.push({ test: "ניגודיות קישורי התפריט", pass: menu.ratio >= 4.5, detail: menu.ratio });
results.push({ test: "לוגו בהיר כשהתפריט פתוח", pass: menu.logoLight > .9, detail: menu.logoLight });
await shot("state-menu");

// --- שואוקייס: האם ההחלפה האוטומטית באמת מזיזה ---
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: BASE + "?sc=1" });
await sleep(5200);
const a = await js("document.getElementById('show-idx').textContent");
await sleep(5200);
const b = await js("document.getElementById('show-idx').textContent");
results.push({ test: "השואוקייס מתקדם לבד", pass: a !== b, detail: a + " -> " + b });

ws.close(); chrome.kill();
let bad = 0;
for (const r of results) { if (!r.pass) bad++; console.log(`${r.pass ? "עובר" : "נכשל"}  ${r.test}${r.detail !== undefined ? "   [" + r.detail + "]" : ""}`); }
console.log(`\nכשלים: ${bad} מתוך ${results.length}`);
