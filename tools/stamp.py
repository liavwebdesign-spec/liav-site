# Cache-busting: rewrites ?b=<stamp> on local css/js links in site/index.html. Run after every edit.
import re,time,pathlib
p=pathlib.Path(__file__).resolve().parent.parent/'site'/'index.html'
s=p.read_text(encoding='utf-8'); b=str(int(time.time()))
s=re.sub(r'((?:href|src)="(?:css|js)/[^"?]+)(\?b=\d+)?"', lambda m: f'{m.group(1)}?b={b}"', s)
p.write_text(s,encoding='utf-8'); print('stamp',b)
