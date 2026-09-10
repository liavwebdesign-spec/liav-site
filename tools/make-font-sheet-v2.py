# דף בחירת פונט v2: כל משפחה עברית שיש בתיקיית הפונטים, במבנה ההירו של madewithgsap
# (בהיר, כותרת מפוצלת סביב כרטיס כהה, תוויות מונו). ליאב מסמן עד 3.
import os, re, html, pathlib

ROOT = r"C:/Users/liav/Desktop/עסק/פונטים"
OUT = pathlib.Path(__file__).resolve().parent / "font-sheet-v2.html"
FOLDERS = ["פונטאפ", "aaa-fonts", "Reisinger-fonts", "הפונטיה", "פונטשוק", "חינמיים"]
W = {"thin":100,"hairline":100,"ultralight":200,"extralight":200,"light":300,"book":400,"regular":400,"normal":400,
     "medium":500,"semibold":600,"demibold":600,"bold":700,"extrabold":800,"ultrabold":800,"heavy":800,"black":900,"ultra":900}
SKIP = re.compile(r"(italic|hollow|stencil|wireframe|arabic|latin|-mono|dirty|round|rounded|yad|tzar|compressed|wide|condensed|serif|product|_r_|_w_)", re.I)

def url(p): return "file:///" + p.replace(os.sep, "/").replace(" ", "%20")

fams = {}
for folder in FOLDERS:
    base = os.path.join(ROOT, folder)
    for dp, dn, fn in os.walk(base):
        for f in fn:
            if not f.lower().endswith(".woff2") or f.startswith("._"): continue
            stem = f[:-6]
            if SKIP.search(stem): continue
            s = re.sub(r"(-aaa|-web| V\d| v\d|-ffc-web|-webfont|-1\.01)", "", stem, flags=re.I)
            # HammerPro-100400: משקל בארבע הספרות האחרונות
            m = re.match(r"(HammerPro)-(\d)(\d)0(\d)", stem)
            if m:
                name, wt = "Hammer Pro", int(m.group(2))*100 + 100
            else:
                m = re.match(r"^(.*?)[\s_-]+-?\s*([A-Za-z]+)$", s)
                if not m: continue
                name, wtok = m.group(1).strip(" -_"), m.group(2).lower()
                if wtok not in W: continue
                wt = W[wtok]
            name = name.replace("_", " ").replace("-", " ").strip()
            fams.setdefault(name, {})
            fams[name].setdefault(wt, os.path.join(dp, f))

names = sorted(fams, key=lambda n: n.lower())
css, cards = [], []
for i, n in enumerate(names):
    for wt, p in sorted(fams[n].items()):
        css.append(f"@font-face{{font-family:'{n}';src:url('{url(p)}') format('woff2');font-weight:{wt};font-display:block}}")
    heavy = max(fams[n]); light = min(fams[n])
    cards.append(f"""<section class="card" data-font="{html.escape(n)}" style="--f:'{html.escape(n)}'">
  <header><span class="mono">{i+1:02d} / {len(names):02d}</span><span class="name">{html.escape(n)} · {', '.join(str(w) for w in sorted(fams[n]))}</span><button class="pick" type="button">סמן</button></header>
  <div class="hero">
    <h1 class="r">אתרים ב-AI</h1>
    <div class="card-dark"><span class="mono">SHOWCASE 14</span><span class="mono idx">#04</span></div>
    <h1 class="l">שלא נראים כמו AI.</h1>
  </div>
  <div class="sub"><p class="lead" style="font-weight:{min(500,heavy)}">אמן אתרים. חוויית גלילה אינטראקטיבית, אתרי פרימיום.</p><span class="mono">DRAG TO EXPLORE</span><span class="pill">דברו איתי</span></div>
  <p class="body" style="font-weight:{light}">נעים מאוד, ליאב. כל פרויקט עובר דרך הידיים שלי, מהרעיון ועד הפריים האחרון. 0123456789</p>
</section>""")

doc = f"""<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>בחירת פונט v2 · {len(names)} משפחות</title>
<style>
{chr(10).join(css)}
@font-face{{font-family:'Mono';src:local('Consolas'),local('JetBrains Mono'),local('Courier New')}}
:root{{--bg:#F1F1F1;--ink:#0A0A0B;--grey:#777;--line:rgba(10,10,11,.14);--accent:#D8FC73;--dark:#0A0A0B}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--ink);font-family:system-ui;padding:0 25px 80px}}
.top{{position:sticky;top:0;background:var(--bg);padding:14px 0;border-bottom:1px solid var(--line);z-index:5;display:flex;gap:16px;align-items:center;flex-wrap:wrap;font-size:14px}}
.top code{{background:#fff;border:1px solid var(--line);padding:6px 10px;border-radius:8px;direction:ltr}}
.mono{{font-family:'Mono',monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--grey)}}
.card{{padding:36px 0 28px;border-bottom:1px solid var(--line);font-family:var(--f),sans-serif}}
.card header{{display:flex;gap:14px;align-items:center;font-family:system-ui;font-size:13px;margin-bottom:22px}}
.card .name{{direction:ltr;color:var(--ink)}}
.pick{{margin-inline-start:auto;background:transparent;color:var(--ink);border:1px solid var(--ink);border-radius:999px;padding:7px 16px;font:inherit;font-size:13px;cursor:pointer}}
.card.on{{background:#fff}}.card.on .pick{{background:var(--accent);border-color:var(--accent)}}
.hero{{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:24px}}
h1{{font-size:clamp(28px,4.2vw,62px);font-weight:500;line-height:1;letter-spacing:-.02em;margin:0}}
h1.r{{text-align:start}}h1.l{{text-align:end}}
.card-dark{{width:min(360px,30vw);aspect-ratio:16/9;background:var(--dark);border-radius:16px;color:#fff;display:grid;place-items:center;position:relative}}
.card-dark .mono{{color:#fff}}.card-dark .idx{{position:absolute;bottom:-22px;inset-inline-start:0;color:var(--grey)}}
.sub{{display:flex;align-items:center;gap:22px;margin-top:34px;flex-wrap:wrap}}
.lead{{margin:0;font-size:clamp(17px,1.5vw,22px);max-width:34ch;line-height:1.3}}
.pill{{background:var(--accent);border-radius:999px;padding:10px 20px;font-size:15px;font-weight:600}}
.body{{margin:14px 0 0;color:var(--grey);font-size:16px;max-width:60ch}}
</style></head><body>
<div class="top"><strong>{len(names)} משפחות, במבנה ההירו של madewithgsap.</strong><span>סמן עד 3, העתק:</span><code id="out">אין סימונים</code><button class="pick" id="copy" type="button">העתק</button></div>
{chr(10).join(cards)}
<script>
const picks=new Set();
document.querySelectorAll('.pick:not(#copy)').forEach(b=>b.addEventListener('click',()=>{{const c=b.closest('.card'),f=c.dataset.font;
 if(picks.has(f))picks.delete(f);else{{if(picks.size>=3)return alert('עד 3');picks.add(f)}}c.classList.toggle('on',picks.has(f));
 document.getElementById('out').textContent=picks.size?[...picks].join(' | '):'אין סימונים'}}));
document.getElementById('copy').addEventListener('click',()=>navigator.clipboard.writeText([...picks].join(' | ')));
</script></body></html>"""
OUT.write_text(doc, encoding="utf-8")
print(len(names), "families ->", OUT)
for n in names: print(" ", n, sorted(fams[n]))
