// בדיקת סקשן הלקוחות בווידאו: מדידות ההצמדה, צילומים לאורך הרצועה, ופתיחת הנגן.
// usage: node tools/vt-probe.mjs [--size 1440x900] [--mobile] [--base url]
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const args = process.argv.slice(2);
let W = 1440, H = 900, mobile = false;
const bi = args.indexOf("--base"), BASE = bi >= 0 ? args[bi + 1] : "http://localhost:5173/";
const si = args.indexOf("--size"); if (si >= 0) [W, H] = args[si + 1].split("x").map(Number);
if (args.includes("--mobile")) { mobile = true; W = 390; H = 844; }
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "tools", "shots"); fs.mkdirSync(out, { recursive: true });
const port = 9700 + Math.floor(Math.random() * 80);
const chrome = spawn(CH, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--autoplay-policy=no-user-gesture-required",
  `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(process.env.TEMP, "vt-" + port)}`, `--window-size=${W},${H}`, "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 40 && !wsUrl; i++) { try { const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); wsUrl = l.find(t => t.type === "page")?.webSocketDebuggerUrl; } catch {} if (!wsUrl) await sleep(250); }
const ws = new WebSocket(wsUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map(), errors = [];
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); };
const send = (m, p = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
const js = async e => { const r = (await send("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true })).result; if (r.exceptionDetails) console.log("EVAL ERR", r.exceptionDetails.exception?.description); return r.result?.value; };
const shot = async n => { const s = await send("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(path.join(out, n + ".png"), Buffer.from(s.result.data, "base64")); console.log("shot", n); };
const tag = `vt-${W}x${H}`;

await send("Page.enable"); await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile });
await send("Page.navigate", { url: BASE + "?at=0" });
await sleep(6000);
const g = await js(`(() => { const s=document.getElementById('clients'), pin=s.querySelector('.vt-pin'), sp=pin.parentElement;
  const st = ScrollTrigger.getAll().find(t => t.pin === pin);
  return { start: st && st.start, end: st && st.end, secTop: s.getBoundingClientRect().top + scrollY, cardW: document.querySelector('.vt-card').offsetWidth,
    mediaH: document.querySelector('.vt-media').offsetHeight, docW: document.documentElement.scrollWidth, vw: innerWidth }; })()`);
console.log(JSON.stringify(g), await js("location.href + ' ' + document.querySelectorAll('section').length + ' ' + document.title"));
const go = async y => { await js(`(() => { lenis && lenis.scrollTo(${y}, {immediate:true, force:true}); scrollTo(0, ${y}); ScrollTrigger.update(); return 1; })()`); await sleep(1400); };
// lenis הוא let בסקריפט, נגיש מהקונסולה
await go(g.secTop - 60); await shot(`${tag}-0-head`);
const live = async () => js(`(() => { const st = ScrollTrigger.getAll().find(t => t.pin === document.querySelector('#clients .vt-pin')); return { start: st.start, end: st.end }; })()`);
for (const [n, f] of [["1-start", 0], ["2-mid", .5], ["3-end", 1]]) {
  const L = await live(); g.start = L.start; g.end = L.end; console.log("pin", JSON.stringify(L));
  await go(g.start + (g.end - g.start) * f + (f === 0 ? 2 : f === 1 ? -2 : 0));
  const st = await js(`({ idx: document.getElementById('vt-idx').textContent, live: [...document.querySelectorAll('.vt-card')].map(c => c.classList.contains('live') ? 1 : 0).join(''), x: gsap.getProperty('#vt-track','x'), sy: scrollY, ly: lenis && lenis.scroll, pinTop: document.querySelector('.vt-pin').getBoundingClientRect().top, pos: getComputedStyle(document.querySelector('.vt-pin')).position })`);
  console.log(n, JSON.stringify(st));
  await shot(`${tag}-${n}`);
}
await go(g.start + (g.end - g.start) * .4);
await js(`document.querySelectorAll('.vt-card')[2].click(); 1`);
await sleep(1500);
const lb = await js(`(() => { const f=document.querySelector('.vt-lb-frame').getBoundingClientRect(); return { open: document.getElementById('vt-lb').classList.contains('open'), frame: [f.left|0, f.top|0, f.width|0, f.height|0], focus: document.activeElement.className }; })()`);
console.log("lightbox", JSON.stringify(lb));
await shot(`${tag}-4-lightbox`);
await js(`document.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape', bubbles:true})); window.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape'})); 1`);
await sleep(1200);
console.log("closed", await js(`!document.getElementById('vt-lb').classList.contains('open')`));
await go(g.end + 200); await shot(`${tag}-5-after`);
console.log("errors", JSON.stringify(errors));
ws.close(); chrome.kill();
