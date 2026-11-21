"""给「存成一张图」用的字体：把页面上出现过的字，从各字体里裁出来，打包成一份 CSS（字体内联成 data:）。
截图时整页画进 SVG，SVG 里拿不到网页已经加载的网络字体，所以手写体、等宽体这些系统里没有的要自带。用法：python3 tools/build_export_fonts.py"""
import base64, io, os, re
from fontTools.ttLib import TTFont, TTCollection
from fontTools import subset

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# 字体来源：npm 装好 @fontsource/caveat、oswald、ibm-plex-mono、homemade-apple、long-cang，或者用 FONTSOURCE_DIR 指过去
FS = os.environ.get('FONTSOURCE_DIR', os.path.join(ROOT, 'node_modules/@fontsource'))
html = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
CHARS = set(chr(c) for c in range(0x20, 0x7f)) | set(ch for ch in html if ord(ch) > 0x7e)
CHARS |= set('·—…“”‘’《》「」『』（）、，。：；！？～¥×←→↗↓↑‹›★☆●○')

def subset_font(font, chars):
    opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = ['*']; opts.name_IDs = ['*']; opts.notdef_outline = True
    sub = subset.Subsetter(opts); sub.populate(unicodes=[ord(c) for c in chars]); sub.subset(font)
    buf = io.BytesIO(); font.flavor = 'woff2'; font.save(buf); return buf.getvalue()

def ttc_sc(path):
    col = TTCollection(path)
    for f in col.fonts:
        if 'SC' in f['name'].getDebugName(1): return f
    return col.fonts[0]

rules = []
def add(family, weight, data, urange=None):
    b64 = base64.b64encode(data).decode()
    rules.append(f"@font-face{{font-family:'{family}';font-weight:{weight};font-style:normal;font-display:block;src:url(data:font/woff2;base64,{b64}) format('woff2'){';unicode-range:'+urange if urange else ''}}}")
    return len(data)

total = 0
# 正文用的思源宋体 / 黑体不打包：图里会自动换成系统自带的宋体、黑体（苹方、宋体-简等），样子很接近，能省下 3MB
for fam, folder, w in [('Caveat', 'caveat', 500), ('Caveat', 'caveat', 700), ('Oswald', 'oswald', 400), ('Oswald', 'oswald', 500), ('Oswald', 'oswald', 600),
                       ('IBM Plex Mono', 'ibm-plex-mono', 400), ('IBM Plex Mono', 'ibm-plex-mono', 500), ('IBM Plex Mono', 'ibm-plex-mono', 600), ('Homemade Apple', 'homemade-apple', 400)]:
    data = open(os.path.join(FS, folder, 'files', f'{folder}-latin-{w}-normal.woff2'), 'rb').read(); total += add(fam, w, data)
# 龙藏体：fontsource 切成了很多片，只留用得到的字
css = open(os.path.join(FS, 'long-cang/index.css')).read()
for m in re.finditer(r"@font-face\s*{(.*?)}", css, re.S):
    blk = m.group(1); f = re.search(r"url\(\./files/([^)]+\.woff2)\)", blk); ur = re.search(r"unicode-range:\s*([^;]+);", blk)
    if not f: continue
    font = TTFont(os.path.join(FS, 'long-cang/files', f.group(1))); cmap = set(chr(c) for c in font.getBestCmap())
    need = CHARS & cmap
    if not need: continue
    total += add('Long Cang', 400, subset_font(font, need))
out = '/* 存成一张图用的字体子集，由 tools/build_export_fonts.py 生成 */\n' + '\n'.join(rules)
open(os.path.join(ROOT, 'fonts', 'export.css'), 'w').write(out)
print('rules', len(rules), 'fonts', total // 1024, 'KB', 'css', len(out) // 1024, 'KB')
