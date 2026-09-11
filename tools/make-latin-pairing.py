# דף השוואה: Sataf ו-Begin אין להם אותיות לטיניות בכלל (0 מתוך 52).
# כאן בודקים בעין מי הפונט הלטיני שמתלבש עליהם הכי טוב, דרך unicode-range,
# מול האפשרות של משפחה אחת שמכסה את שתי השפות.
import os, pathlib, html

FUP = r"C:/Users/liav/Desktop/עסק/פונטים/פונטאפ"
AAA = r"C:/Users/liav/Desktop/עסק/פונטים/aaa-fonts"
OUT = pathlib.Path(__file__).resolve().parent / "latin-pairing.html"

HEB_RANGE = "U+0590-05FF, U+FB1D-FB4F, U+200F, U+200E"
LAT_RANGE = "U+0000-058F, U+2000-206F, U+2190-21FF, U+2600-26FF"

def u(p): return "file:///" + p.replace(os.sep, "/").replace(" ", "%20")
def fup(fam, w): return f"{FUP}/FUP {fam}/FUP {fam} - For Web/FUP {fam} - {w}/FUP {fam} - {w}.woff2"
def aaa(fam, w): return f"{AAA}/{fam}/webfont_files/{fam}-{w}-aaa.woff2"

# מועמדים לליווי לטיני: כולם מורשים, מקומיים, ועם לטינית מלאה
CANDS = [("almoni","Almoni"),("ploni","Ploni"),("atlas","Atlas"),
         ("primaries","Primaries"),("index","Index"),("asimon","Asimon")]
SOLO  = [("almoni","Almoni"),("atlas","Atlas"),("primaries","Primaries")]

css = []
# העברית תמיד מ-Sataf/Begin, בלי לטינית
for w, n in [("Medium",500),("SemiBold",600),("Bold",700)]:
    css.append(f"@font-face{{font-family:'H';src:url('{u(fup('Sataf',w))}') format('woff2');font-weight:{n};unicode-range:{HEB_RANGE};font-display:block}}")
for w, n in [("Light",300),("Regular",400),("Medium",500)]:
    css.append(f"@font-face{{font-family:'HB';src:url('{u(fup('Begin',w))}') format('woff2');font-weight:{n};unicode-range:{HEB_RANGE};font-display:block}}")
# לכל מועמד: אותה משפחה לוגית, אבל הלטינית מגיעה ממנו
for key, label in CANDS:
    for w, n in [("regular",400),("medium",500),("demibold",600),("bold",700)]:
        p = aaa(key, w)
        if os.path.exists(p):
            css.append(f"@font-face{{font-family:'H-{key}';src:url('{u(p)}') format('woff2');font-weight:{n};unicode-range:{LAT_RANGE};font-display:block}}")
            css.append(f"@font-face{{font-family:'HB-{key}';src:url('{u(p)}') format('woff2');font-weight:{n};unicode-range:{LAT_RANGE};font-display:block}}")
# משפחה אחת לכל השפות
for key, label in SOLO:
    for w, n in [("light",300),("regular",400),("medium",500),("demibold",600),("bold",700)]:
        p = aaa(key, w)
        if os.path.exists(p):
            css.append(f"@font-face{{font-family:'SOLO-{key}';src:url('{u(p)}') format('woff2');font-weight:{n};font-display:block}}")

def block(title, note, head_stack, body_stack, tone=""):
    return f"""<section class="card {tone}">
  <header><span class="tag">{html.escape(title)}</span><span class="note">{html.escape(note)}</span><button class="pick" type="button">סמן</button></header>
  <h1 style="font-family:{head_stack}">אתרים ב-AI</h1>
  <h2 style="font-family:{head_stack}">Alon Clinic · קרן גרינלייט</h2>
  <div class="rows" style="font-family:{head_stack}">
    <div>Kimco Creative Studio<i>09</i></div>
    <div>Muscle &amp; Motion<i>05</i></div>
    <div>סטודיו צילום N<i>12</i></div>
  </div>
  <p style="font-family:{body_stack}">אמן אתרים. עובד עם AI כמו עם כל כלי אחר, ביד ובקפדנות. WhatsApp · Instagram · 2026</p>
</section>"""

cards = [block("היום, בלי תיקון", "Sataf ו-Begin בלי לטינית. האנגלית נופלת לפונט המערכת, וזה מה שנראה מנותק",
               "'H',Assistant,system-ui,sans-serif", "'HB',Assistant,system-ui,sans-serif", "bad")]
for key, label in CANDS:
    cards.append(block(f"עברית Sataf · לטינית {label}", "unicode-range. כל אות נשלפת מהפונט שמתאים לה",
                       f"'H','H-{key}',sans-serif", f"'HB','HB-{key}',sans-serif"))
for key, label in SOLO:
    cards.append(block(f"משפחה אחת: {label}", "מוותרים על Sataf ו-Begin, ומקבלים עקביות מוחלטת",
                       f"'SOLO-{key}',sans-serif", f"'SOLO-{key}',sans-serif", "solo"))

doc = f"""<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ליווי לטיני ל-Sataf ו-Begin</title><style>
{chr(10).join(css)}
:root{{--bg:#F1F1F1;--ink:#0A0A0B;--grey:#777;--line:rgba(10,10,11,.16);--accent:#D8FC73}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--ink);font-family:system-ui;padding:0 25px 90px}}
.top{{position:sticky;top:0;background:var(--bg);padding:16px 0;border-bottom:1px solid var(--line);z-index:5;display:flex;gap:14px;align-items:center;flex-wrap:wrap;font-size:14px}}
.top code{{background:#fff;border:1px solid var(--line);padding:6px 10px;border-radius:8px;direction:ltr;font-size:13px}}
.card{{padding:34px 0 26px;border-bottom:1px solid var(--line)}}
.card header{{display:flex;gap:12px;align-items:center;margin-bottom:18px;font-size:13px}}
.tag{{font-weight:600}}.note{{color:var(--grey)}}
.pick{{margin-inline-start:auto;background:transparent;border:1px solid var(--ink);border-radius:999px;padding:7px 16px;font:inherit;font-size:13px;cursor:pointer}}
.card.on{{background:#fff}}.card.on .pick{{background:var(--accent);border-color:var(--accent)}}
.card.bad{{background:#fff4f4}}.card.solo{{background:#f6f6ff}}
h1{{font-size:clamp(38px,5.4vw,84px);font-weight:500;line-height:1;letter-spacing:-.02em;margin:0 0 10px}}
h2{{font-size:clamp(22px,2.6vw,40px);font-weight:500;line-height:1.1;margin:0 0 16px;color:#333}}
.rows{{border-top:1px solid var(--line);margin-bottom:14px}}
.rows div{{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid var(--line);padding:10px 0;font-size:clamp(20px,2.2vw,34px);font-weight:500}}
.rows i{{font-style:normal;font-size:12px;color:var(--grey);font-family:Consolas,monospace}}
p{{margin:0;font-size:18px;color:#444;max-width:70ch;line-height:1.5}}
</style></head><body>
<div class="top"><strong>האנגלית והעברית לא מאותו פונט. איזה שילוב נראה לך הכי קשור?</strong><span>סמן אחד:</span><code id="out">אין סימון</code></div>
{chr(10).join(cards)}
<script>
document.querySelectorAll('.pick').forEach(b=>b.addEventListener('click',()=>{{
 document.querySelectorAll('.card').forEach(c=>c.classList.remove('on'));
 const c=b.closest('.card'); c.classList.add('on');
 document.getElementById('out').textContent=c.querySelector('.tag').textContent;
}}));
</script></body></html>"""
OUT.write_text(doc, encoding="utf-8")
print("candidates:", len(cards), "->", OUT)
