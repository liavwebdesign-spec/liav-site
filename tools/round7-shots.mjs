// צילומי אימות לסבב 7: הירו, אודות, תצוגת עבודות בזמן תנועת עכבר, מרקי, ופריים באמצע ניגוב.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const CH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.argv[2] || "http://localhost:5173/v3/";
const out = path.join(process.cwd(), "qa-shots", "r7"); fs.mkdirSync(out, { recursive: true });
const port = 9150 + Math.floor(Math.random() * 40);
const chrome = spawn(CH, ["--headless=new", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(process.env.TEMP, "r7-" + port)}`, "--window-size=1440,900", "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let wsUrl; for (let i = 0; i < 40 && !wsUrl; i++) { try { const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); wsUrl = l.find(t => t.type === "page")?.webSocketDebuggerUrl; } catch {} if (!wsUrl) await sleep(250); }
const ws = new WebSocket(wsUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map(), errors = [];
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text); };
const send = (m, p = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
const js = async e => { const r = (await send("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true })).result; if (r.exceptionDetails) console.log("EVAL ERR", r.exceptionDetails.exception?.description); return r.result?.value; };
const shot = async n => { const s = await send("Page.captureScreenshot", { format: "jpeg", quality: 75 }); fs.writeFileSync(path.join(out, n + ".jpg"), Buffer.from(s.result.data, "base64")); };
const go = async (sel, off = 80, wait = 1600) => { await js(`(() => { const y = document.querySelector('${sel}').getBoundingClientRect().top + scrollY - ${off}; lenis.scrollTo(y, {immediate:true, force:true}); ScrollTrigger.update(); return 1; })()`); await sleep(wait); };
const view = async (w, h, mobile) => send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile });
const mouse = (x, y) => send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });

await send("Page.enable"); await send("Runtime.enable");
await view(1440, 900, false);
await send("Page.navigate", { url: BASE + "?at=0" });
await sleep(6500);
await shot("1-hero");

// אודות
await go('#about', 60, 2600); await shot("2-about");
const ab = await js(`(() => { const p = document.getElementById('portrait').getBoundingClientRect(), t = document.querySelector('.about-text').getBoundingClientRect(), n = document.querySelector('.stats b').getBoundingClientRect(), l = document.querySelector('.stats span'); return { portrait:[p.left|0, p.right|0, p.width|0, p.height|0], text:[t.left|0, t.right|0], gap: Math.round(p.left - t.right), numH: Math.round(n.height), numFs: getComputedStyle(document.querySelector('.stats b')).fontSize, labelFs: getComputedStyle(l).fontSize }; })()`);
console.log("about", JSON.stringify(ab));

// עבודות: ריחוף, ואז תנועה מהירה כדי לראות את ההטיה
await go('#pl', 120, 1800);
const row = await js(`(() => { const r = document.querySelectorAll('.pl-row')[2].getBoundingClientRect(); return { x: r.right - 200, y: r.top + r.height / 2 }; })()`);
await mouse(row.x, row.y); await sleep(120); await mouse(row.x - 5, row.y + 2); await sleep(900);
await shot("3-works-hover");
for (let k = 0; k < 8; k++) { await mouse(row.x - 60 * k, row.y + 14 * k); await sleep(16); }
await sleep(40); await shot("4-works-tilt");
const tilt = await js(`(() => { const i = document.querySelector('.pl-prev-in'), p = document.getElementById('pl-prev').getBoundingClientRect(); return { rot: gsap.getProperty(i,'rotation').toFixed(1), ry: gsap.getProperty(i,'rotationY').toFixed(1), clip: getComputedStyle(i).clipPath, w: p.width|0, h: p.height|0 }; })()`);
console.log("preview", JSON.stringify(tilt));
await mouse(5, 5); await sleep(600);

// מרקי המלצות
await go('#tq', 300, 1400); await shot("5-marquee");
console.log("lime cards", await js(`document.querySelectorAll('.tq-card.lime').length`));

// ניגוב באמצע: גלילה חלקה דרך הגבול בין הטעם (לבן) לאנשים (כהה)
const at = await js(`(() => { const s = document.querySelector('#clients'); return (s.getBoundingClientRect().top + scrollY - innerHeight / 2) | 0; })()`);
await js(`lenis.scrollTo(${at - 300}, {immediate:true, force:true}); ScrollTrigger.update(); 1`); await sleep(1400);
await js(`lenis.scrollTo(${at + 300}, {duration:.6, easing:x=>x, force:true}); 1`);
await sleep(620); await shot("6-wipe-mid");
const wipe = await js(`(() => { const e = document.querySelector('.bg-edge'); return { edgeOpacity: getComputedStyle(e).opacity, edgeY: Math.round(gsap.getProperty(e,'y')) }; })()`);
console.log("wipe", JSON.stringify(wipe));
await sleep(1200); await shot("7-wipe-done");

// נייד: אודות
await view(390, 844, true);
await send("Page.navigate", { url: BASE + "?at=0" }); await sleep(6000);
await shot("8-hero-mobile");
await go('.stats', 500, 2600); await shot("9-about-mobile");
console.log("errors", JSON.stringify(errors));
ws.close(); chrome.kill();
