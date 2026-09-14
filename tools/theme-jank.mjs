// מדידת תקיעות במעברי רקע: גוללים בגלילה חלקה אמיתית (Lenis) דרך כל גבול בין נושאים,
// ומודדים זמני פריים ב-rAF ואת זמן חישוב הסגנונות של הדפדפן בזמן המעבר.
// usage: node tools/theme-jank.mjs [--size 1440x900] [--mobile] [--base url]
import { spawn } from "node:child_process";
import path from "node:path";
const CH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const args = process.argv.slice(2);
let W = 1440, H = 900, mobile = false;
const bi = args.indexOf("--base"), BASE = bi >= 0 ? args[bi + 1] : "http://localhost:5173/v3/";
const si = args.indexOf("--size"); if (si >= 0) [W, H] = args[si + 1].split("x").map(Number);
if (args.includes("--mobile")) { mobile = true; W = 390; H = 844; }
const port = 9600 + Math.floor(Math.random() * 90);
const chrome = spawn(CH, ["--headless=new", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(process.env.TEMP, "tj-" + port)}`, `--window-size=${W},${H}`, "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let wsUrl; for (let i = 0; i < 40 && !wsUrl; i++) { try { const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); wsUrl = l.find(t => t.type === "page")?.webSocketDebuggerUrl; } catch {} if (!wsUrl) await sleep(250); }
const ws = new WebSocket(wsUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (m, p = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
const js = async e => (await send("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true })).result.result?.value;
const metric = async n => (await send("Performance.getMetrics")).result.metrics.find(m => m.name === n).value * 1000;
await send("Page.enable"); await send("Performance.enable");
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile });
await send("Page.navigate", { url: BASE + "?at=0" });
await sleep(6500);
// גבולות: מיקום הגלילה שבו מרכז המסך עובר מסקשן לסקשן עם נושא אחר
const bounds = await js(`(() => { const s=[...document.querySelectorAll('[data-theme]')], o=[]; for(let i=1;i<s.length;i++){ if(s[i].dataset.theme!==s[i-1].dataset.theme) o.push({ at:(s[i].getBoundingClientRect().top+scrollY-innerHeight/2)|0, from:s[i-1].dataset.theme, to:s[i].dataset.theme }); } return o; })()`);
const rows = [];
// ביקורת: אותה גלילה בדיוק, בתוך סקשן אחד בלי מעבר נושא
const ctl = await js(`(() => { const s=document.querySelector('#works'); return (s.getBoundingClientRect().top+scrollY+s.offsetHeight/2-innerHeight/2)|0; })()`);
bounds.unshift({ at: ctl, from: 'control', to: 'control' });
for (const b of bounds) {
  await js(`lenis.scrollTo(${b.at - 500}, {immediate:true, force:true}); ScrollTrigger.update(); 1`);
  await sleep(1400);
  const s0 = await metric("RecalcStyleDuration"), l0 = await metric("LayoutDuration");
  const r = await js(`new Promise(res => { const t=[]; let last=performance.now(), go=true; const f=n=>{ t.push(n-last); last=n; if(go) requestAnimationFrame(f); }; requestAnimationFrame(f);
    lenis.scrollTo(${b.at + 500}, { duration: 1.6, easing: x => x, force:true });
    setTimeout(() => { go=false; t.shift(); t.sort((a,b)=>b-a); res({ frames:t.length, worst:+t[0].toFixed(1), p95:+t[Math.floor(t.length*.05)].toFixed(1), over34:t.filter(x=>x>34).length }); }, 2600); })`);
  const s1 = await metric("RecalcStyleDuration"), l1 = await metric("LayoutDuration");
  rows.push({ ...b, ...r, style: +(s1 - s0).toFixed(0), layout: +(l1 - l0).toFixed(0) });
}
console.table(rows);
const tot = rows.reduce((a, r) => ({ over34: a.over34 + r.over34, style: a.style + r.style, worst: Math.max(a.worst, r.worst) }), { over34: 0, style: 0, worst: 0 });
console.log(`סה"כ: פריימים מעל 34ms ${tot.over34} · פריים גרוע ${tot.worst}ms · חישוב סגנונות ${tot.style}ms`);
ws.close(); chrome.kill();
