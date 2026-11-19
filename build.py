# 把 parts/ 里的样式、页面和脚本拼成一个 index.html：python3 build.py
import re, os
ROOT=os.path.dirname(os.path.abspath(__file__))
P=os.path.join(ROOT,'parts')+os.sep
rd=lambda f:open(P+f,encoding='utf-8').read()

css=rd('head.css')+rd('home.css')+rd('review.css')+rd('v7.css')+rd('v8.css')+rd('v9.css')
kept_css='\n/* ── 保留的模块：工牌 / Thoughts to Things / 收集册 ── */\n'+rd('legacy/kept.css')+'\n'
i=css.index('@media (max-width:980px)')
css=css[:i]+kept_css+'\n'+css[i:]

# 整页等比缩放：桌面按 1440 宽、手机按 390 宽排版，再整体缩放到窗口宽度。
# 所以版式只有两套：≥900 一套、<900 一套；中间的断点全部并到 899。
def mq(m):
    n=int(m.group(1))
    return '@media (max-width:899px)' if n>=390 else '@media (max-width:0px)'
css=re.sub(r'@media \(max-width:(\d+)px\)',mq,css)
# vw / vh 换成“排版宽高”的百分之一（由脚本按缩放比例算好），缩放后看起来和设计稿一致
css=re.sub(r'(?<![\w.#-])(?<!--vw,)(\d*\.?\d+)(?:s|d)?vw\b',lambda m:f'calc(var(--vw,1vw) * {m.group(1)})',css)
css=re.sub(r'(?<![\w.#-])(?<!--vh,)(\d*\.?\d+)(?:s|d)?vh\b',lambda m:f'calc(var(--vh,1vh) * {m.group(1)})',css)

head='''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Star Wang</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Homemade+Apple&family=IBM+Plex+Mono:wght@400;500;600&family=Long+Cang&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@500;600;700&family=Oswald:wght@400;500;600&display=swap" rel="stylesheet">
<style>
'''+css+'''</style>
</head>'''
FIT0='''<script>(function(){var d=document.documentElement,w=d.clientWidth,h=innerHeight,m=innerWidth<900,s=m?Math.min(1.5,Math.max(.8,w/390)):Math.min(2,Math.max(.6,w/1440));document.body.style.zoom=s;d.style.setProperty('--vw',w/s/100+'px');d.style.setProperty('--vh',h/s/100+'px');d.classList.toggle('mob',m)})()</script>'''
strip=lambda s:re.sub(r'<b>[①②③④⑤⑥]</b>','',s)
body=rd('pages.html')
body=body.replace('<body>','<body>\n'+FIT0,1)
mind=strip(rd('legacy/mind.html')).replace('<section class="sec" id="mind"','<section class="sec own-only" id="mind"',1)
import re as _re
mind=_re.sub(r'\n\s*<p class="foot"[^\n]*</p>','',mind)
body=body.replace('{{MIND}}',mind)
body=body.replace('{{FOUND}}',strip(rd('legacy/found.html')).replace('<section class="sec" id="found"','<section class="sec own-only" id="found"',1)).replace('{{RIG}}',rd('rig.html'))
body+='\n'+rd('legacy/tail.html')
js='<script>\n'+rd('legacy/pre.js')+'\n'+rd('new.js')+'\n'+rd('legacy/post.js')+'\n'+rd('site.js')+'\n'+rd('v7.js')+'\n'+rd('v9.js')+'\n</script>\n</body>\n</html>\n'
out=head+'\n'+body+'\n\n'+js
open(os.path.join(ROOT,'index.html'),'w',encoding='utf-8').write(out)
print('ok',len(out))
