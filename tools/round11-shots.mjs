// צילומי אימות לסבב 11: ניצוץ וריבוע מתגלגל ב"אנשים שעבדו איתי", כוכבית על הטופס ופיצוץ סמלים (באירוע מדומה, בלי שליחת ליד).
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const CH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.argv[2] || "http://localhost:5173/v3/";
const out = path.join(process.cwd(), "qa-shots", "r11"); fs.mkdirSync(out, { recursive: true });
const port = 9650 + Math.floor(Math.random() * 40);
const chrome = spawn(CH, ["--headless=new", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(process.env.TEMP, "r11-" + port)}`, "--window-size=1440,900", "about:blank"], { stdio: "ignore" });
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
  await go('#clients', m ? 40 : 60, 2200); await shot(`${t}-1-people-top`);
  for (const p of [.15, .6]) { await pinAt('vt-pin', p); await shot(`${t}-2-strip-${p}`); }
  console.log(t, 'roll', await js(`document.querySelector('.vt-roll').style.transform`));
  await go('.c-form', m ? 140 : 220, 2400); await shot(`${t}-3-form`);
  await js(`document.dispatchEvent(new CustomEvent('lead:sent')); 1`);
  await sleep(380); await shot(`${t}-4-burst`);
  await sleep(2200); console.log(t, 'burst left', await js(`document.querySelectorAll('.burst span').length`));
}
console.log("errors", errors); ws.close(); chrome.kill(); process.exit(0);
