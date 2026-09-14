// סיור לאורך v3: צילום בכל סקשן, שגיאות קונסולה, מצב הנושא, וההצמדות.
// usage: node tools/v3-probe.mjs [--size 1440x900] [--mobile] [--base url]
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const args = process.argv.slice(2);
let W = 1440, H = 900, mobile = false;
const bi = args.indexOf("--base"), BASE = bi >= 0 ? args[bi + 1] : "http://localhost:5173/v3/";
const si = args.indexOf("--size"); if (si >= 0) [W, H] = args[si + 1].split("x").map(Number);
if (args.includes("--mobile")) { mobile = true; if (si < 0) { W = 390; H = 844; } }
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "tools", "shots"); fs.mkdirSync(out, { recursive: true });
const port = 9800 + Math.floor(Math.random() * 80);
const chrome = spawn(CH, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--autoplay-policy=no-user-gesture-required",
  `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(process.env.TEMP, "v3-" + port)}`, `--window-size=${W},${H}`, "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 40 && !wsUrl; i++) { try { const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); wsUrl = l.find(t => t.type === "page")?.webSocketDebuggerUrl; } catch {} if (!wsUrl) await sleep(250); }
const ws = new WebSocket(wsUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map(), errors = [];
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); if (m.method === "Log.entryAdded" && m.params.entry.level === "error") errors.push(m.params.entry.text); };
const send = (m, p = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
const js = async e => { const r = (await send("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true })).result; if (r.exceptionDetails) console.log("EVAL ERR", r.exceptionDetails.exception?.description); return r.result?.value; };
const shot = async n => { const s = await send("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(path.join(out, n + ".png"), Buffer.from(s.result.data, "base64")); };
const tag = `v3-${W}x${H}`;

await send("Page.enable"); await send("Runtime.enable"); await send("Log.enable");
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile });
await send("Page.navigate", { url: BASE + "?at=0" });
await sleep(6500);
const go = async y => { await js(`(() => { lenis && lenis.scrollTo(${y}, {immediate:true, force:true}); scrollTo(0, ${y}); ScrollTrigger.update(); return 1; })()`); await sleep(1500); };
const pins = await js(`ScrollTrigger.getAll().filter(t => t.pin).map(t => ({ el: t.pin.className, start: t.start|0, end: t.end|0 }))`);
console.log("pins", JSON.stringify(pins));
console.log("doc", await js(`({ h: document.body.scrollHeight, w: document.documentElement.scrollWidth, vw: innerWidth })`));
const stops = await js(`(() => { const o = []; for (const s of document.querySelectorAll('section')) { o.push({ n: s.className.split(' ')[0], top: s.getBoundingClientRect().top + scrollY, h: s.offsetHeight }); } return o; })()`);
const frac = (s, f) => s.top + s.h * f;
const plan = [];
for (const s of stops) {
  const n = s.n;
  if (n === 'hero') plan.push([n, 0]);
  else if (n === 'works') { plan.push([n + '-a', s.top + 200]); plan.push([n + '-b', frac(s, .55)]); }
  else if (n === 'generic' || n === 'months' || n === 'taste' || n === 'people') { const p = pins.find(x => { const t = s.top; return x.start >= t - 5 && x.start <= t + s.h; }); if (p) { plan.push([n + '-a', p.start + 5]); plan.push([n + '-b', p.start + (p.end - p.start) * .55]); plan.push([n + '-c', p.end - 5]); } else plan.push([n, s.top]); }
  else if (n === 'flow' || n === 'works') { plan.push([n, s.top - 80]); plan.push([n + '-b', s.top + s.h * .5]); }
  else plan.push([n, s.top - 80]);
}
plan.push(['bottom', 99999]);
for (const [n, y] of plan) {
  await go(y);
  const st = await js(`({ theme: document.body.className, y: scrollY|0 })`);
  console.log(n.padEnd(12), JSON.stringify(st));
  await shot(`${tag}-${n}`);
}
console.log("errors", JSON.stringify(errors));
ws.close(); chrome.kill();
