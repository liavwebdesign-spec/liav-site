// אימות סבב 16: סקשן "איך עובדים יחד" בעמוד הבית ועמוד ה-AI, בשתי השפות, כולל שגיאות קונסול.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const CH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = "http://localhost:5173/";
const out = path.join(process.cwd(), "qa-shots", "r16"); fs.mkdirSync(out, { recursive: true });
const port = 9910 + Math.floor(Math.random() * 40);
const chrome = spawn(CH, ["--headless=new", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(process.env.TEMP, "r16-" + port)}`, "--window-size=1440,900", "about:blank"], { stdio: "ignore" });
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
  for (const L of ['v3', 'en']) {
    errors.length = 0;
    await send("Page.navigate", { url: BASE + L + '/' }); await sleep(6500);
    await go('#method', m ? 0 : 40, 2600); await shot(`${t}-${L}-1-process`);
    if (!m) await goY('scrollY + 260', 1200), await shot(`${t}-${L}-2-process-b`);
    console.log(t, L, 'home errors', errors.length, 'nav', await js(`[...document.querySelectorAll('.sec-head .mono:first-child')].map(e => e.textContent).join(' | ')`));
    errors.length = 0;
    await send("Page.navigate", { url: BASE + L + '/ai.html' }); await sleep(4000);
    await shot(`${t}-${L}-3-ai-hero`);
    await pinAt('gen-pin', .5); await shot(`${t}-${L}-4-ai-gen`);
    await pinAt('mo-pin', .98); await shot(`${t}-${L}-5-ai-months`);
    await go('.tools', 0, 2200); await shot(`${t}-${L}-6-ai-tools`);
    await go('.ai-end', 0, 2000); await shot(`${t}-${L}-7-ai-end`);
    console.log(t, L, 'ai errors', errors.slice(0, 3), 'themes', await js(`[...document.querySelectorAll('[data-theme]')].map(s => s.dataset.theme).join(',')`));
  }
}
ws.close(); chrome.kill(); process.exit(0);
