// צילום עמוד מקומי במלואו דרך CDP, עם גישה לפונטים ב-file:// (הדפים של בחירת פונט).
// usage: node tools/shot-file.mjs <html> <out.png> [width]
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const CH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const [src, out, wArg] = process.argv.slice(2);
const W = +(wArg || 1280);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = 9410 + Math.floor(Math.random() * 60);
const chrome = spawn(CH, [
  "--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files",
  `--remote-debugging-port=${port}`, `--user-data-dir=${path.join(process.env.TEMP, "shot-file-" + port)}`,
  `--window-size=${W},900`, "about:blank",
], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));

let wsUrl;
for (let i = 0; i < 40 && !wsUrl; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    wsUrl = list.find(t => t.type === "page")?.webSocketDebuggerUrl;
  } catch {}
  if (!wsUrl) await sleep(250);
}
const ws = new WebSocket(wsUrl);
await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const send = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

await send("Page.enable");
await send("Page.navigate", { url: pathToFileURL(path.resolve(root, src)).href });
await sleep(7000);
const h = (await send("Runtime.evaluate", { expression: "document.body.scrollHeight", returnByValue: true })).result.result.value;
const H = Math.min(h, 16000);
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
await sleep(2000);
const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
fs.writeFileSync(path.resolve(root, out), Buffer.from(shot.result.data, "base64"));
console.log(out, `${W}x${H}`, "(page", h + ")");
ws.close(); chrome.kill();
