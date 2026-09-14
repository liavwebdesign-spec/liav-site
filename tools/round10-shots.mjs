// צילומי אימות לסבב 10: פרילודר בלי לוגו, הירו עם סמלים, סמל כתום ב-02, ניצוץ כתום ושבשבת, סמלים בכלים, ריווח ומספרים באודות.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const CH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.argv[2] || "http://localhost:5173/v3/";
const out = path.join(process.cwd(), "qa-shots", "r10"); fs.mkdirSync(out, { recursive: true });
const port = 9550 + Math.floor(Math.random() * 40);
const chrome = spawn(CH, ["--headless=new", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(process.env.TEMP, "r10-" + port)}`, "--window-size=1440,900", "about:blank"], { stdio: "ignore" });
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
for (const [w, h, m, t] of [[1440, 900, false, "d"], [390, 844, true, "m"]]) {
  await view(w, h, m);
  await send("Page.navigate", { url: BASE });
  const t0 = Date.now(); const at = async ms => { await sleep(Math.max(0, ms - (Date.now() - t0))); };
  for (const ms of [500, 950, 1500]) { await at(ms); await shot(`${t}-0-pre-${ms}`); }
  await at(3100); await shot(`${t}-1-hero-in`);
  await at(6500); await shot(`${t}-1-hero`);
  await goY('innerHeight * .5', 1200); await shot(`${t}-1-hero-out`);
  await pinAt('gen-pin', .12); await shot(`${t}-2-gen`);
  await pinAt('mo-pin', .45); await shot(`${t}-3-months-mid`);
  await pinAt('mo-pin', .98); await shot(`${t}-3-months`);
  await go('.tools', m ? -40 : -60, 2200); await shot(`${t}-4-tools`);
  await go('.about', m ? -60 : 0, 2600); await shot(`${t}-5-about`);
  await go('.stats', m ? 260 : 500, 2400); await shot(`${t}-5-about-stats`);
  console.log(t, JSON.stringify(await js(`(() => { const p = document.querySelector('.portrait-wrap').getBoundingClientRect(), x = document.querySelector('.about-text').getBoundingClientRect(), s = document.querySelector('.stats').getBoundingClientRect(); return { gapX: Math.round(p.left - x.right), gapY: Math.round(p.top - s.bottom), nums: [...document.querySelectorAll('.stats b')].map(b => [b.textContent, b.getBoundingClientRect().width|0, b.parentElement.getBoundingClientRect().width|0]) }; })()`)));
}
console.log("errors", errors); ws.close(); chrome.kill(); process.exit(0);
