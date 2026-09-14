// רצף פריימים לאורך סקשן מוצמד, כדי לראות את הכוריאוגרפיה של אנימציה מבוססת גלילה בעין.
// usage: node tools/pin-film.mjs <pin-class> [--n 6] [--size WxH] [--mobile] [--base url]
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const CH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const PIN = args[0], N = +opt("--n", 6), BASE = opt("--base", "http://localhost:5173/v3/");
let W = 1440, H = 900, mobile = false;
if (args.includes("--mobile")) { mobile = true; W = 390; H = 844; }
if (args.includes("--size")) [W, H] = opt("--size").split("x").map(Number);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "tools", "shots", "pin"); fs.mkdirSync(out, { recursive: true });
const port = 9300 + Math.floor(Math.random() * 90);
const chrome = spawn(CH, ["--headless=new", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(process.env.TEMP, "pf-" + port)}`, `--window-size=${W},${H}`, "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let wsUrl; for (let i = 0; i < 40 && !wsUrl; i++) { try { const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); wsUrl = l.find(t => t.type === "page")?.webSocketDebuggerUrl; } catch {} if (!wsUrl) await sleep(250); }
const ws = new WebSocket(wsUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map(), errors = [];
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); };
const send = (m, p = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
const js = async e => { const r = (await send("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true })).result; if (r.exceptionDetails) console.log("EVAL ERR", r.exceptionDetails.exception?.description); return r.result?.value; };
await send("Page.enable"); await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile });
await send("Page.navigate", { url: BASE + "?at=0" });
await sleep(6500);
const st = await js(`(() => { const s = ScrollTrigger.getAll().find(t => t.pin && t.pin.classList.contains('${PIN}')); return s ? { a: s.start, b: s.end } : null; })()`);
if (!st) { console.log("no pin", PIN); process.exit(1); }
const files = [];
for (let k = 0; k < N; k++) {
  const y = Math.round(st.a + (st.b - st.a) * k / (N - 1));
  await js(`lenis.scrollTo(${y}, {immediate:true, force:true}); ScrollTrigger.update(); 1`);
  await sleep(1200);
  const s = await send("Page.captureScreenshot", { format: "jpeg", quality: 70 });
  const f = path.join(out, `${PIN}-${W}-${k}.jpg`); fs.writeFileSync(f, Buffer.from(s.result.data, "base64")); files.push(f);
}
console.log(JSON.stringify({ pin: st, frames: files.length, errors }));
ws.close(); chrome.kill();
