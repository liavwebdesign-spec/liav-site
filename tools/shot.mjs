// QA screenshots through CDP, viewport-only (no captureBeyondViewport), so scrolled states
// render as a visitor sees them. usage: node tools/shot.mjs [--size 1280x720] [--mobile] at1 at2 ...
// Output: tools/shots/<W>x<H>-<at>.png. Needs the preview server on :5173 and Chrome installed.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CH = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const args = process.argv.slice(2);
let W = 1280, H = 720, mobile = false;
const ats = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--size") { [W, H] = args[++i].split("x").map(Number); }
  else if (args[i] === "--mobile") { mobile = true; W = 390; H = 844; }
  else ats.push(+args[i]);
}
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "tools", "shots");
fs.mkdirSync(outDir, { recursive: true });
const port = 9333;
const profile = path.join(process.env.TEMP || ".", "liav-site-shots");
const chrome = spawn(CH, [
  "--headless=new", "--disable-gpu", "--hide-scrollbars", `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`, `--window-size=${W},${H}`, "about:blank",
], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function target() {
  for (let i = 0; i < 40; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const t = list.find(x => x.type === "page");
      if (t) return t.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error("chrome did not start");
}

const ws = new WebSocket(await target());
await new Promise(r => ws.onopen = r);
let id = 0; const pending = new Map();
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile });
if (mobile) await send("Emulation.setUserAgentOverride", { userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/128 Mobile Safari/537.36" });

for (const at of ats) {
  await send("Page.navigate", { url: `${process.env.BASE || "http://localhost:5173/v3/"}?at=${at}&shot=${Date.now()}` });
  await sleep(mobile ? 6500 : 6000);
  const { result } = await send("Runtime.evaluate", { expression: "JSON.stringify({y:scrollY, at:document.documentElement.dataset.at, w:innerWidth})", returnByValue: true });
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  const out = path.join(outDir, `${W}x${H}-${at}.png`);
  fs.writeFileSync(out, Buffer.from(shot.result.data, "base64"));
  console.log(path.relative(root, out), result.result.value);
}
ws.close(); chrome.kill();
