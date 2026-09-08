# Builds tools/font-sheet.html: the site's real headlines in all 32 Fontup families on black.
# Liav marks up to 3, copies the list. Fonts load from the local folder (file://), never CDN.
import os, html

ROOT = r"C:/Users/liav/Desktop/עסק/פונטים/פונטאפ"
OUT = os.path.join(os.path.dirname(__file__), "font-sheet.html")
WEIGHTS = [("Light", 300), ("Regular", 400), ("Medium", 500), ("SemiBold", 600), ("Bold", 700), ("ExtraBold", 800)]

def url(p):
    return "file:///" + p.replace(os.sep, "/").replace(" ", "%20")

fams = sorted(d for d in os.listdir(ROOT) if os.path.isdir(os.path.join(ROOT, d)))
css, cards = [], []
for i, f in enumerate(fams):
    web = os.path.join(ROOT, f, f"{f} - For Web")
    files = {}
    if os.path.isdir(web):
        for w in os.listdir(web):
            files[w.split(" - ")[-1]] = os.path.join(web, w, w + ".woff2")
    for wname, wt in WEIGHTS:
        if wname in files:
            css.append(f"@font-face{{font-family:'{f}';src:url('{url(files[wname])}') format('woff2');font-weight:{wt};font-display:block}}")
    cards.append(f"""<section class="card" data-font="{html.escape(f)}" style="font-family:'{html.escape(f)}',sans-serif">
  <header><span class="num">{i+1:02d}</span><span class="name">{html.escape(f)}</span><button class="pick" type="button">סמן</button></header>
  <h1>אמן אתרים</h1>
  <h2>אתרים שלא נראים <em>כמו AI</em></h2>
  <p class="w800">נראה מוכר? יש דרך אחרת. ככה.</p>
  <p class="w500">יוצר אתרים ב-AI. חוויית גלילה אינטראקטיבית. אתרי פרימיום.</p>
  <p class="w300">שם · טלפון · דברו איתי · LIAV MATZRI 0123456789</p>
</section>""")

doc = f"""<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>בחירת פונט · 32 משפחות פונטאפ</title>
<style>
{chr(10).join(css)}
:root{{--canvas:#070708;--ink:#F4F4F6;--muted:#9A9AA6;--accent:#D8FC73;--line:rgba(255,255,255,.1)}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--canvas);color:var(--ink);font-family:system-ui;padding:24px}}
.top{{position:sticky;top:0;background:var(--canvas);padding:12px 0 16px;border-bottom:1px solid var(--line);z-index:5;display:flex;gap:16px;align-items:center;flex-wrap:wrap}}
.top strong{{font-size:18px}}.top code{{background:#141416;padding:6px 10px;border-radius:8px;font-size:14px;direction:ltr}}
.card{{padding:40px 0 32px;border-bottom:1px solid var(--line)}}
.card header{{display:flex;gap:14px;align-items:center;font-family:system-ui;color:var(--muted);font-size:14px;margin-bottom:14px}}
.card .name{{direction:ltr;color:var(--ink)}}
.pick{{margin-inline-start:auto;background:transparent;color:var(--accent);border:1px solid var(--accent);border-radius:12px;padding:6px 14px;font:inherit;cursor:pointer}}
.card.on{{background:rgba(216,252,115,.05)}}.card.on .pick{{background:var(--accent);color:var(--canvas)}}
h1{{font-size:clamp(64px,13vw,220px);font-weight:700;line-height:.95;margin:0 0 12px;letter-spacing:-.01em}}
h2{{font-size:clamp(34px,6vw,86px);font-weight:500;line-height:1.05;margin:0 0 18px}}h2 em{{font-style:normal;color:var(--accent)}}
p{{margin:6px 0;font-size:clamp(20px,2.2vw,32px)}}.w800{{font-weight:800}}.w500{{font-weight:500}}.w300{{font-weight:300;color:var(--muted)}}
</style></head><body>
<div class="top"><strong>32 פונטים של פונטאפ על שחור.</strong><span>לחצו "סמן" על עד 3, ואז העתיקו את הרשימה:</span><code id="out">אין סימונים</code><button class="pick" id="copy" type="button">העתק</button></div>
{chr(10).join(cards)}
<script>
const picks=new Set();
document.querySelectorAll('.pick:not(#copy)').forEach(b=>b.addEventListener('click',()=>{{const c=b.closest('.card'),f=c.dataset.font;
 if(picks.has(f))picks.delete(f);else{{if(picks.size>=3)return alert('עד 3');picks.add(f)}}c.classList.toggle('on',picks.has(f));
 document.getElementById('out').textContent=picks.size?[...picks].join(' | '):'אין סימונים'}}));
document.getElementById('copy').addEventListener('click',()=>navigator.clipboard.writeText([...picks].join(' | ')));
</script></body></html>"""
open(OUT, "w", encoding="utf-8").write(doc)
print(len(fams), "families,", len(css), "faces ->", OUT)
