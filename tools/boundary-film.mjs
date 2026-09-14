// צילום רצף פריימים סביב גבול בין שני סקשנים, בגלילה חלקה אמיתית, כדי לראות מה העין רואה במעבר.
// usage: node tools/boundary-film.mjs <selector-of-lower-section> [--size WxH] [--mobile] [--base url] [--span 900] [--n 12]
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const CH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const args = process.argv.slice(2);
const sel = args[0];
let W = 1440, H = 900, mobile = false;
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const BASE = opt("--base", "http://localhost:5173/v3/"), SPAN = +opt("--span", 900), N = +opt("--n", 12);
if (args.includes("--size")) [W, H] = opt("--size").split("x").map(Number);
if (args.includes("--mobile")) { mobile = true; W = 390; H = 844; }
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "tools", "shots", "boundary"); fs.mkdirSync(out, { recursive: true });
const port = 9500 + Math.floor(Math.random() * 90);
const chrome = spawn(CH, ["--headless=new", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(process.env.TEMP, "bf-" + port)}`, `--window-size=${W},${H}`, "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let wsUrl; for (let i = 0; i < 40 && !wsUrl; i++) { try { const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); wsUrl = l.find(t => t.type === "page")?.webSocketDebuggerUrl; } catch {} if (!wsUrl) await sleep(250); }
const ws = new WebSocket(wsUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (m, p = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
const js = async e => (await send("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true })).result.result?.value;
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile });
await send("Page.navigate", { url: BASE + "?at=0" });
await sleep(6500);
const at = await js(`(() => { const s=document.querySelector('${sel}'); return (s.getBoundingClientRect().top + scrollY) | 0; })()`);
const rows = [];
for (let k = 0; k < N; k++) {
  const y = Math.round(at - SPAN + (2 * SPAN) * k / (N - 1));
  await js(`lenis.scrollTo(${y}, {immediate:true, force:true}); ScrollTrigger.update(); 1`);
  await sleep(900);
  const info = await js(`(() => { const on=[...document.querySelectorAll('#bg i')].map(l => l.dataset.t + ':' + (+getComputedStyle(l).opacity).toFixed(2) + ':' + (l.style.zIndex||0)).join(' ');
    const px = (x, yy) => { const e = document.elementFromPoint(x, yy); return e ? (e.className && e.className.baseVal === undefined ? e.className : e.tagName) : ''; };
    const secs=[...document.querySelectorAll('[data-theme]')].map(s => { const r=s.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight ? s.className.split(' ')[0] + '[' + (r.top|0) + ',' + (r.bottom|0) + ']' : null; }).filter(Boolean).join(' ');
    return { y: scrollY|0, body: [...document.body.classList].filter(c => c.startsWith('t-')).join(), layers: on, secs }; })()`);
  rows.push(info);
  const sh = await send("Page.captureScreenshot", { format: "jpeg", quality: 70 });
  fs.writeFileSync(path.join(out, `${String(k).padStart(2, "0")}.jpg`), Buffer.from(sh.result.data, "base64"));
}
rows.forEach((r, k) => console.log(String(k).padStart(2), JSON.stringify(r)));
ws.close(); chrome.kill();
