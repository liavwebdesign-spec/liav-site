// אימות סבב 13: לפטופ עם הקלטת מסך. בדסקטופ בריחוף על העבודות, בנייד דביק עם פוקוס, ב-02 במשפט השני. וגם: אף סרטון לא נטען בטעינה.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const CH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.argv[2] || "http://localhost:5173/v3/";
const out = path.join(process.cwd(), "qa-shots", "r13"); fs.mkdirSync(out, { recursive: true });
const port = 9850 + Math.floor(Math.random() * 40);
const chrome = spawn(CH, ["--headless=new", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(process.env.TEMP, "r13-" + port)}`, "--window-size=1440,900", "about:blank"], { stdio: "ignore" });
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
const vids = new Set();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.method === 'Network.requestWillBeSent' && /\.mp4/.test(m.params.request.url)) vids.add(m.params.request.url.split('/').pop()); });
await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable");
const vstate = sel => js(`(() => { const v = document.querySelector('${sel}'); return v ? { src: v.currentSrc.split('/').pop(), t: +v.currentTime.toFixed(2), on: v.classList.contains('on'), rs: v.readyState, paused: v.paused } : null; })()`);
for (const [w, h, m, t] of [[1440, 900, false, "d"], [390, 844, true, "m"]]) {
  vids.clear();
  await view(w, h, m);
  if (m) await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await send("Page.navigate", { url: BASE });
  await sleep(6500);
  console.log(t, 'mp4 after load:', [...vids]);
  if (!m) {
    await go('#pl', 120, 1500);
    const r = await js(`(() => { const e = document.querySelectorAll('.pl-row')[1].getBoundingClientRect(); return [e.left + e.width * .6, e.top + e.height / 2]; })()`);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: r[0], y: r[1] }); await sleep(100);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: r[0] - 4, y: r[1] + 2 }); await sleep(2600);
    await shot(`${t}-1-hover`); console.log(t, 'hover video', JSON.stringify(await vstate('#pl-prev video')));
    const r2 = await js(`(() => { const e = document.querySelectorAll('.pl-row')[4].getBoundingClientRect(); return [e.left + e.width * .6, e.top + e.height / 2]; })()`);
    await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: r2[0], y: r2[1] }); await sleep(250); await shot(`${t}-2-swap`);
    await sleep(2400); await shot(`${t}-3-swap-play`); console.log(t, 'swap video', JSON.stringify(await vstate('#pl-prev video')));
  } else {
    await go('#pl', 40, 1800); await shot(`${t}-1-sticky`);
    await goY('scrollY + 420', 2600); await shot(`${t}-2-sticky-mid`); console.log(t, 'sticky video', JSON.stringify(await vstate('.pl-sticky video')), await js(`[...document.querySelectorAll('.pl-row.on-m h3')].map(e => e.textContent)`));
  }
  await pinAt('gen-pin', .45); await sleep(2200); await shot(`${t}-4-gen`); console.log(t, 'gen video', JSON.stringify(await vstate('.gm-lap video')));
  await pinAt('gen-pin', .9); await sleep(800); console.log(t, 'gen after', JSON.stringify(await vstate('.gm-lap video')));
  console.log(t, 'mp4 total:', [...vids]);
}
console.log("errors", errors); ws.close(); chrome.kill(); process.exit(0);
