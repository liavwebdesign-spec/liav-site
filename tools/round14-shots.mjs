// אימות סבב 14: הדר עם כפתור, לפטופ עם צל, זרם מוקאפים בנייד, מרקי המלצות לפי גלילה, "או" בטופס, יציאה מהתפריט.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const CH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.argv[2] || "http://localhost:5173/v3/";
const out = path.join(process.cwd(), "qa-shots", "r14"); fs.mkdirSync(out, { recursive: true });
const port = 9870 + Math.floor(Math.random() * 40);
const chrome = spawn(CH, ["--headless=new", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(process.env.TEMP, "r14-" + port)}`, "--window-size=1440,900", "about:blank"], { stdio: "ignore" });
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
  await sleep(6500);
  await shot(`${t}-1-header`);
  await go('#pl', m ? 40 : 120, 1500);
  if (!m) { const r = await js(`(() => { const e = document.querySelectorAll('.pl-row')[2].getBoundingClientRect(); return [e.left + e.width * .6, e.top + e.height / 2]; })()`);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: r[0], y: r[1] }); await sleep(120); await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: r[0] - 3, y: r[1] + 1 }); await sleep(2400); }
  else await goY('scrollY + 300', 2600);
  await shot(`${t}-2-laptop`);
  await go('.flow .mq-wrap', m ? 200 : 300, 1400); await shot(`${t}-3-flow`);
  await go('#tq', m ? 200 : 300, 1200);
  const ts0 = await js(`window.TQ.tweens.map(t => +t.timeScale().toFixed(2))`);
  await js(`(() => { let y = scrollY, n = 0; const id = setInterval(() => { y += 60; lenis.scrollTo(y, {immediate:true, force:true}); ScrollTrigger.update(); if(++n > 8) clearInterval(id); }, 16); return 1; })()`);
  await sleep(120); const ts1 = await js(`window.TQ.tweens.map(t => +t.timeScale().toFixed(2))`);
  console.log(t, 'tq timeScale rest', ts0, 'while scrolling', ts1);
  await sleep(600); await shot(`${t}-4-tq`);
  await go('.ff-actions', m ? 300 : 400, 1400); await shot(`${t}-5-form`);
  if (m) {
    await js(`document.querySelector('.nv-toggle').click(); 1`); await sleep(1100); await shot(`${t}-6-menu-open`);
    await js(`document.querySelector('.nv-toggle').click(); 1`); await sleep(160); await shot(`${t}-7-menu-closing`); await sleep(260); await shot(`${t}-8-menu-closing2`); await sleep(500); await shot(`${t}-9-menu-closed`);
  }
}
console.log("errors", errors); ws.close(); chrome.kill(); process.exit(0);
