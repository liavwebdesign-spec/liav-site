// צילומי מעבר על הגרסה האנגלית: כל סקשן בדסקטופ ובנייד, כולל הסקשנים המוצמדים באמצע.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const CH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.argv[2] || "http://localhost:5173/en/";
const out = path.join(process.cwd(), "qa-shots", "en"); fs.mkdirSync(out, { recursive: true });
const port = 9890 + Math.floor(Math.random() * 40);
const chrome = spawn(CH, ["--headless=new", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(process.env.TEMP, "en-" + port)}`, "--window-size=1440,900", "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let wsUrl; for (let i = 0; i < 40 && !wsUrl; i++) { try { const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); wsUrl = l.find(t => t.type === "page")?.webSocketDebuggerUrl; } catch {} if (!wsUrl) await sleep(250); }
const ws = new WebSocket(wsUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map(), errors = [];
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); };
const send = (m, p = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
const js = async e => { const r = (await send("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true })).result; if (r.exceptionDetails) console.log("EVAL ERR", r.exceptionDetails.exception?.description); return r.result?.value; };
const shot = async n => { const s = await send("Page.captureScreenshot", { format: "jpeg", quality: 75 }); fs.writeFileSync(path.join(out, n + ".jpg"), Buffer.from(s.result.data, "base64")); };
const view = async (w, h, mobile) => send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile });
const mouse = (x, y) => send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });

const go = async (sel, off = 80, wait = 1600) => { await js(`(() => { const y = document.querySelector('${sel}').getBoundingClientRect().top + scrollY - ${off}; lenis.scrollTo(y, {immediate:true, force:true}); ScrollTrigger.update(); return 1; })()`); await sleep(wait); };
const goY = async (expr, wait = 1400) => { await js(`(() => { lenis.scrollTo(${expr}, {immediate:true, force:true}); ScrollTrigger.update(); return 1; })()`); await sleep(wait); };
const pinAt = async (cls, p) => { const r = await js(`(() => { const st = ScrollTrigger.getAll().find(s => s.pin && s.pin.classList.contains('${cls}')); return [st.start, st.end]; })()`); await goY(Math.round(r[0] + (r[1] - r[0]) * p)); };
await send("Page.enable"); await send("Runtime.enable");
const T = process.env.TAG || 'a';
for (const [w, h, m, t] of [[1440, 900, false, "d"], [390, 844, true, "m"]]) {
  await view(w, h, m);
  await send("Page.navigate", { url: BASE }); await sleep(6500);
  await shot(`${T}-${t}-00-hero`);
  await go('#works', 0, 1600); await shot(`${T}-${t}-01-works`);
  await pinAt('gen-pin', .5); await shot(`${T}-${t}-02-gen`);
  await pinAt('mo-pin', .98); await shot(`${T}-${t}-03-months`);
  await go('.mo-body', 60, 1800); await shot(`${T}-${t}-04-mobody`);
  await go('.flow', 20, 1500); await shot(`${T}-${t}-05-flow`);
  await go('.tools', 0, 2400); await shot(`${T}-${t}-06-tools`);
  await pinAt('taste-pin', .5); await shot(`${T}-${t}-07-taste-mid`);
  await pinAt('taste-pin', .99); await sleep(600); await shot(`${T}-${t}-08-taste-end`);
  await go('#clients', 0, 1600); await shot(`${T}-${t}-09-people`);
  await pinAt('vt-pin', .5); await shot(`${T}-${t}-10-strip`);
  await go('#tq', 100, 1400); await shot(`${T}-${t}-11-tq`);
  await go('#about', 0, 2600); await shot(`${T}-${t}-12-about`);
  await go('#contact', 0, 2000); await shot(`${T}-${t}-13-contact`);
  if (m) { await js(`document.querySelector('.nv-toggle').click(); 1`); await sleep(1100); await shot(`${T}-${t}-14-menu`); }
}
console.log("errors", errors); ws.close(); chrome.kill(); process.exit(0);
