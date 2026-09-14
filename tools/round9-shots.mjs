// צילומי אימות לסבב 9: סמלי המותג. פרילודר, סמל מתחלף ב-02, ניצוץ בחודשים, סטיקר באודות, ומגרש הסמלים בפוטר.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const CH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.argv[2] || "http://localhost:5173/v3/";
const out = path.join(process.cwd(), "qa-shots", "r9"); fs.mkdirSync(out, { recursive: true });
const port = 9350 + Math.floor(Math.random() * 40);
const chrome = spawn(CH, ["--headless=new", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(process.env.TEMP, "r9-" + port)}`, "--window-size=1440,900", "about:blank"], { stdio: "ignore" });
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
await send("Page.enable"); await send("Runtime.enable");
for (const [w, h, m, t] of [[1440, 900, false, "d"], [390, 844, true, "m"]]) {
  await view(w, h, m);
  await send("Page.navigate", { url: BASE });
  await sleep(620); await shot(`${t}-1-pre`);
  await sleep(6000);
  // 02: אמצע המשפט השני
  const gp = await js(`(() => { const st = ScrollTrigger.getAll().find(s => s.pin && s.pin.classList.contains('gen-pin')); return [st.start, st.end]; })()`);
  await goY(Math.round(gp[0] + (gp[1] - gp[0]) * .55)); await shot(`${t}-2-gen`);
  const mp = await js(`(() => { const st = ScrollTrigger.getAll().find(s => s.pin && s.pin.classList.contains('mo-pin')); return [st.start, st.end]; })()`);
  await goY(Math.round(mp[1] - 10)); await shot(`${t}-3-months`);
  await go('#portrait', m ? 40 : 60, 2600); await shot(`${t}-4-about`);
  await goY(`document.body.scrollHeight`, 400);
  await sleep(2600); await shot(`${t}-5-footer`);
  const toys = await js(`[...document.querySelectorAll('.toy')].map(e => { const r = e.getBoundingClientRect(); return [r.left|0, r.top|0, r.width|0]; })`);
  const lg = await js(`(() => { const r = document.querySelector('.rvf-footer .big').getBoundingClientRect(); return [r.top|0, r.bottom|0, innerWidth]; })()`);
  console.log(t, 'toys', JSON.stringify(toys), 'logo', JSON.stringify(lg));
  // זריקה: גוררים את הסמל הראשון ומשחררים במהירות
  const [x0, y0, s0] = toys[0]; const cx = x0 + s0 / 2, cy = y0 + s0 / 2;
  const P = (type, x, y) => send("Input.dispatchMouseEvent", { type, x, y, button: "left", buttons: type === "mouseReleased" ? 0 : 1, clickCount: 1 });
  await P("mousePressed", cx, cy);
  for (let k = 1; k <= 10; k++) { await P("mouseMoved", cx + k * 40, cy - k * 22); await sleep(16); }
  await P("mouseReleased", cx + 400, cy - 220);
  await sleep(260); await shot(`${t}-6-throw`);
  await sleep(2600); await shot(`${t}-7-settled`);
  console.log(t, 'after', JSON.stringify(await js(`[...document.querySelectorAll('.toy')].map(e => { const r = e.getBoundingClientRect(); return [r.left|0, r.top|0]; })`)));
}
console.log("errors", errors); ws.close(); chrome.kill(); process.exit(0);
