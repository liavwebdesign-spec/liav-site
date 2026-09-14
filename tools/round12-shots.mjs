// צילומי מצב לסבב 12 בנייד: עבודות, 02, המעבר ל-03, ראש ההמלצות, מרקי, זרימה, הדר ומפרידים.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const CH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.argv[2] || "http://localhost:5173/v3/";
const out = path.join(process.cwd(), "qa-shots", "r12"); fs.mkdirSync(out, { recursive: true });
const port = 9750 + Math.floor(Math.random() * 40);
const chrome = spawn(CH, ["--headless=new", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(process.env.TEMP, "r12-" + port)}`, "--window-size=1440,900", "about:blank"], { stdio: "ignore" });
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
const T = process.env.TAG || 'before';
for (const [w, h, m, t] of [[390, 844, true, "m"], [1440, 900, false, "d"]]) {
  await view(w, h, m);
  await send("Page.navigate", { url: BASE });
  await sleep(6500);
  await shot(`${T}-${t}-0-top`);
  await go('.hero-foot, #works', m ? 500 : 600, 1200); await shot(`${T}-${t}-1-seam`);
  await go('#works .pl', m ? 100 : 200, 1400); await shot(`${T}-${t}-2-works`);
  for (const p of [.05, .5, .95]) { await pinAt('gen-pin', p); await shot(`${T}-${t}-3-gen-${p}`); }
  const ge = await js(`(() => { const st = ScrollTrigger.getAll().find(s => s.pin && s.pin.classList.contains('gen-pin')); return st.end; })()`);
  await goY(ge + Math.round(h * .5)); await shot(`${T}-${t}-4-gen-end`);
  console.log(t, 'gap gen->months', JSON.stringify(await js(`(() => { const g = document.querySelector('.gen-text').getBoundingClientRect(), gm = document.querySelector('.gen-media').getBoundingClientRect(), s = document.querySelector('.generic').getBoundingClientRect(), mo = document.querySelector('#mo-h').getBoundingClientRect(); return { genBottom: Math.round(Math.max(g.bottom, gm.bottom)), secBottom: Math.round(s.bottom), moTop: Math.round(mo.top) }; })()`)));
  await go('#clients .people-top', m ? 80 : 120, 1600); await shot(`${T}-${t}-5-people`);
  console.log(t, 'people gap', JSON.stringify(await js(`(() => { const p = document.querySelector('.people-top p').getBoundingClientRect(), c = document.querySelector('.vt-card').getBoundingClientRect(); return { pBottom: Math.round(p.bottom), cardTop: Math.round(c.top) }; })()`)));
  await go('#tq', m ? 120 : 200, 1600); await shot(`${T}-${t}-6-tq`);
  await go('.flow', m ? 20 : 20, 1600); await shot(`${T}-${t}-7-flow`);
}
console.log("errors", errors); ws.close(); chrome.kill(); process.exit(0);
