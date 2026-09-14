// צילומי אימות לסבב 8: הירו G54 (פיזור, התכנסות, הטיה ביציאה) בדסקטופ ובנייד.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const CH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.argv[2] || "http://localhost:5173/v3/";
const out = path.join(process.cwd(), "qa-shots", "r8"); fs.mkdirSync(out, { recursive: true });
const port = 9250 + Math.floor(Math.random() * 40);
const chrome = spawn(CH, ["--headless=new", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(process.env.TEMP, "r8-" + port)}`, "--window-size=1440,900", "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let wsUrl; for (let i = 0; i < 40 && !wsUrl; i++) { try { const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); wsUrl = l.find(t => t.type === "page")?.webSocketDebuggerUrl; } catch {} if (!wsUrl) await sleep(250); }
const ws = new WebSocket(wsUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map(), errors = [];
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); };
const send = (m, p = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
const js = async e => { const r = (await send("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true })).result; if (r.exceptionDetails) console.log("EVAL ERR", r.exceptionDetails.exception?.description); return r.result?.value; };
const shot = async n => { const s = await send("Page.captureScreenshot", { format: "jpeg", quality: 75 }); fs.writeFileSync(path.join(out, n + ".jpg"), Buffer.from(s.result.data, "base64")); };
const go = async (sel, off = 80, wait = 1600) => { await js(`(() => { const y = document.querySelector('${sel}').getBoundingClientRect().top + scrollY - ${off}; lenis.scrollTo(y, {immediate:true, force:true}); ScrollTrigger.update(); return 1; })()`); await sleep(wait); };
const view = async (w, h, mobile) => send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile });
const mouse = (x, y) => send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });

await send("Page.enable"); await send("Runtime.enable");
for (const [w, h, m, t] of [[1440, 900, false, "d"], [390, 844, true, "m"]]) {
  await view(w, h, m);
  await send("Page.navigate", { url: BASE });
  const t0 = Date.now();
  const at = async ms => { await sleep(Math.max(0, ms - (Date.now() - t0))); };
  const log = [];
  for (let ms = 800; ms < 4200; ms += 150) { await at(ms); const v = await js(`(() => { const f = document.querySelector('#cv figure:nth-child(3)'); return f ? [+gsap.getProperty(f,'scale').toFixed(2), +getComputedStyle(f).opacity.slice(0,4), getComputedStyle(document.getElementById('pre')).display] : null; })()`); log.push(ms + ':' + JSON.stringify(v)); if (v && v[0] > .55 && v[0] < .8 && v[2] === "none" && !log.shot) { log.shot = 1; await shot(`${t}-hero-mid`); } }
  console.log(t, log.join(' '));
  await at(7500); await shot(`${t}-hero-done`);
  await js(`lenis.scrollTo(innerHeight * .55, {immediate:true, force:true}); ScrollTrigger.update(); 1`); await sleep(1200); await shot(`${t}-hero-tilt`);
}
console.log("errors", errors); ws.close(); chrome.kill(); process.exit(0);
