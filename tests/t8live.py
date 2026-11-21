import asyncio, sys, os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from common import setup, URL
from playwright.async_api import async_playwright
async def run(w,h,tag):
    async with async_playwright() as p:
        b=await p.chromium.launch()
        ctx=await b.new_context(viewport={'width':w,'height':h},device_scale_factor=2 if w<900 else 1,has_touch=w<900)
        pg=await ctx.new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m:errs.append('console:'+m.text) if m.type=='error' else None)
        await setup(pg)
        await pg.goto(URL); await pg.wait_for_timeout(1500)
        await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(1500)
        hk=pg.locator('.hticket')
        await hk.scroll_into_view_if_needed(); await pg.wait_for_timeout(700)
        await pg.screenshot(path=f'out8/{tag}_t0_idle.png')
        # 命中测试：取票按钮
        hit=await pg.evaluate('''()=>{const b=document.getElementById('pmbtn').getBoundingClientRect();const e=document.elementFromPoint(b.left+b.width/2,b.top+b.height/2);return e&&e.closest('#pmbtn')?'ok':(e?e.className:'none')}''')
        print('btn hit',hit)
        await pg.click('#pmbtn'); await pg.wait_for_timeout(900)
        await pg.screenshot(path=f'out8/{tag}_t1_printing.png')
        await pg.wait_for_timeout(3600)
        await pg.screenshot(path=f'out8/{tag}_t2_issued.png')
        # 打孔
        for k in ['like','kick','seal']:
            await pg.click(f'.pch[data-k={k}]'); await pg.wait_for_timeout(350)
        await pg.wait_for_timeout(700)
        await pg.evaluate("document.querySelector('#pass .sign canvas').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(1000)
        cb=await pg.locator('#pass .sign canvas').bounding_box()
        print('cursor',await pg.evaluate("getComputedStyle(document.querySelector('#pass .sign canvas')).cursor.slice(0,30)"))
        sx,sy=cb['x']+6,cb['y']+cb['height']*.7
        await pg.mouse.move(sx,sy); await pg.wait_for_timeout(400)
        print('at',await pg.evaluate('([x,y])=>{return document.elementsFromPoint(x,y).slice(0,4).map(e=>e.tagName+"."+(e.className.baseVal??e.className)).join(" > ")+" | canvasRect "+JSON.stringify(document.querySelector("#pass .sign canvas").getBoundingClientRect())}',[sx,sy]), cb)
        await pg.mouse.down()
        import math
        for i in range(1,30):
            await pg.mouse.move(sx+i*(cb['width']-12)/30, sy-math.sin(i/3)*cb['height']*.35)
        await pg.mouse.up()
        print('sig pts',await pg.evaluate("[(JSON.parse(localStorage.getItem('sw-pass-v1')).sig||[]).map(s=>s.length),JSON.stringify(PASS.sig).slice(0,80)]"))
        await pg.screenshot(path=f'out8/{tag}_t3_punched.png')
        st=await pg.evaluate("JSON.parse(localStorage.getItem('sw-pass-v1'))")
        print('pass',st)
        # 撕
        await pg.evaluate("document.querySelector('#pass .ps-stub').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(300)
        box=await pg.locator('#pass .ps-stub').bounding_box()
        x=box['x']+box['width']*.6; y=box['y']+box['height']*.85
        await pg.mouse.move(x,y); await pg.mouse.down()
        for i in range(1,16):
            await pg.mouse.move(x+i*9,y+i*6); await pg.wait_for_timeout(16)
        await pg.mouse.up(); await pg.wait_for_timeout(1400)
        await pg.screenshot(path=f'out8/{tag}_t4_torn.png')
        st=await pg.evaluate("[document.querySelector('.hticket').dataset.st,[...document.querySelectorAll('.pch')].map(b=>b.disabled),document.getElementById('pmbtn').disabled,document.getElementById('pnote').textContent,document.getElementById('rcpt').innerText.slice(0,80)]")
        print('after tear',st)
        # 撕下来之后，存根弹窗会自己打开；关掉以后点提示里的链接可以再打开
        await pg.wait_for_selector('#keep[open]',timeout=5000)
        print('keep?',await pg.evaluate("[!!document.getElementById('keep'),document.getElementById('keep').open,document.activeElement.className]"))
        await pg.screenshot(path=f'out8/{tag}_t5_keep.png')
        await pg.click('#keep .ok'); await pg.wait_for_timeout(300)
        await pg.click('#pnote .pnagain'); await pg.wait_for_selector('#keep[open]',timeout=3000)
        print('keep again',await pg.evaluate("document.getElementById('keep').open"))
        await pg.screenshot(path=f'out8/{tag}_t5_keep.png')
        await pg.click('#keep .ok'); await pg.wait_for_timeout(300)
        # 刷新后状态保持
        await pg.reload(); await pg.wait_for_timeout(1800); await hk.scroll_into_view_if_needed(); await pg.wait_for_timeout(400)
        await pg.screenshot(path=f'out8/{tag}_t6_reload.png')
        print('errors',errs)
        await b.close()
if __name__=="__main__":
    os.makedirs('out8',exist_ok=True)
    w=int(sys.argv[1]) if len(sys.argv)>1 else 1440
    asyncio.run(run(w,900 if w>=900 else 844,'d' if w>=900 else 'm'))
