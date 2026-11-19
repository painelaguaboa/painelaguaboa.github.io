#!/usr/bin/env python3
"""Build: src.html -> html final (mesmo pipeline da v4.3.4). Uso: build.py SRC OUT"""
import json, re, os, sys, base64, subprocess
src, final = sys.argv[1], sys.argv[2]
ROOT = os.path.dirname(os.path.abspath(__file__))
def _achar(*cands):
    for pth in cands:
        if os.path.isfile(pth):
            return pth
    raise SystemExit('Não achei: ' + ' | '.join(cands))
FERR = os.path.join(ROOT, 'ferramentas')
V43 = "/workspace/painel/v43src"
html = open(src, encoding="utf-8").read()
b64 = lambda p: base64.b64encode(open(p, "rb").read()).decode()
html = html.replace("%%FONT400%%", b64(_achar(os.path.join(FERR, 'r400.woff2'), '/tmp/fs/r400.woff2')))
html = html.replace("%%FONT700%%", b64(_achar(os.path.join(FERR, 'r700.woff2'), '/tmp/fs/r700.woff2')))
def sym(path, id, cor=None):
    t = open(path, encoding="utf-8").read()
    vb = re.search(r'viewBox="([^"]+)"', t).group(1)
    inner = re.search(r"<svg[^>]*>(.*)</svg>", t, re.S).group(1)
    if cor: inner = inner.replace('fill="#231f20"', 'fill="currentColor"')
    return "<symbol id='%s' viewBox='%s'>%s</symbol>" % (id, vb, inner), vb
logo = _achar(os.path.join(FERR, 'logotipo.svg'), V43 + '/logotipo.svg')
escudo = _achar(os.path.join(FERR, 'escudo.webp'), V43 + '/escudo.webp')
minify_js = _achar(os.path.join(FERR, 'minify.js'), V43 + '/minify.js')
ls, lvb = sym(logo, "s-logo", True)
html = html.replace("%%LOGO_SYM%%", ls).replace("%%LOGO_VB%%", lvb).replace("%%ESCUDO_WEBP%%", b64(escudo))
html = html.replace("O escudo é a versão vetorial oficial, sem recoloração, distorção ou efeito.",
    "O escudo é a imagem oficial do MIV (WebP comprimido a partir do vetor), sem recoloração, distorção ou efeito.")
bad = re.findall(r"%%\w+%%", html)
if bad: raise SystemExit("placeholders: %s" % bad)
pat = re.compile(r"(<script>)(.*?)(</script>)|(<style>)(.*?)(</style>)", re.S)
items = [{"tipo":"js","code":m.group(2)} if m.group(1) else {"tipo":"css","code":m.group(5)} for m in pat.finditer(html)]
json.dump(items, open("/tmp/min_in_434t.json","w"))
subprocess.run(["node", minify_js, "/tmp/min_in_434t.json", "/tmp/min_out_434t.json"], check=True)
it = iter(json.load(open("/tmp/min_out_434t.json")))
html = pat.sub(lambda m: ("<script>"+next(it)+"</script>") if m.group(1) else ("<style>"+next(it)+"</style>"), html)
segs = re.split(r"(<script>.*?</script>|<style>.*?</style>)", html, flags=re.S)
html = "".join(x if x.startswith("<script>") or x.startswith("<style>") else re.sub(r"\n\s+", "\n", x) for x in segs)
open(final, "w", encoding="utf-8").write(html)
for i, sc in enumerate(re.findall(r"<script>(.*?)</script>", html, re.S)):
    p = "/tmp/pa_434t_%d.js" % i; open(p,"w",encoding="utf-8").write(sc)
    r = subprocess.run(["node","--check",p],capture_output=True,text=True)
    if r.returncode: raise SystemExit("SYNTAX FAIL %d %s" % (i, r.stderr[:400]))
print("ok", final, len(html.encode()))
