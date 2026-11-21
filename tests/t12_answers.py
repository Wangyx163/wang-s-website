import os
import asyncio,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from common import setup, URL
from playwright.async_api import async_playwright
async def main():
    os.makedirs('out12',exist_ok=True)
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for w,h,tag,lim in [(1440,900,'d','.hticket'),(390,844,'m','.hphotos'),(1100,800,'d2','.hticket')]:
            pg=await (await b.new_context(viewport={'width':w,'height':h},device_scale_factor=2 if w<900 else 1)).new_page(); errs=[]
            pg.on('pageerror',lambda e:errs.append(str(e))); await setup(pg)
            await pg.goto(URL); await pg.wait_for_timeout(1800)
            for i,q in enumerate(['你最近在读什么啊？','你又有什么新想法了？','介绍一下你自己吧？','你在做什么项目','今天天气怎么样']):
                await pg.evaluate(f"askA({q!r})"); await pg.wait_for_timeout(600)
                r=await pg.evaluate(f"""(()=>{{const a=document.querySelector('#slips .aa').getBoundingClientRect(),t=document.querySelector('{lim}').getBoundingClientRect();return [Math.round(a.top),Math.round(a.bottom),Math.round(t.top),document.querySelector('.apn')?document.querySelector('.apn').innerText:'1/1',document.querySelector('#slips .aa').innerText.replace(/\\s+/g,' ').slice(0,90)]}})()""")
                print(tag,q,r)
                if i==0:
                    await pg.locator('#slips').scroll_into_view_if_needed(); await pg.wait_for_timeout(300)
                    await pg.screenshot(path=f'out12/ask_{tag}_1.png')
                    if await pg.locator('#slips .an').count():
                        await pg.click('#slips .an'); await pg.wait_for_timeout(500); await pg.screenshot(path=f'out12/ask_{tag}_2.png')
                        print(tag,'page2',await pg.evaluate("document.querySelector('#slips .aa').innerText.replace(/\\s+/g,' ')"))
            await pg.click('#slips .ax'); await pg.wait_for_timeout(200)
            print(tag,'closed',await pg.evaluate("document.getElementById('slips').innerHTML.length"),'errs',errs)
        await b.close()
asyncio.run(main())
