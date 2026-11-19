import asyncio, sys, os, json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from common import setup, URL
from playwright.async_api import async_playwright
VPS=[(1920,1080),(1440,900),(1280,800),(1100,800),(960,760),(899,800),(768,1024),(390,844),(360,740)]
async def main(which):
    os.makedirs('out8',exist_ok=True)
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for (w,h) in VPS:
            if which!='all' and str(w) not in which.split(','): continue
            ctx=await b.new_context(viewport={'width':w,'height':h},device_scale_factor=1)
            pg=await ctx.new_page(); errs=[]
            pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m:errs.append('console:'+m.text) if m.type=='error' else None)
            await setup(pg)
            await pg.goto(URL+'?shot'); await pg.wait_for_timeout(1800)
            info=await pg.evaluate('''()=>({zoom:document.body.style.zoom,sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,home:[document.getElementById('home').offsetWidth,document.getElementById('home').offsetHeight]})''')
            await pg.screenshot(path=f'out8/home_{w}.png',full_page=True)
            print(w,h,info,'errors',errs[:5])
            await ctx.close()
        await b.close()
if __name__=="__main__": asyncio.run(main(sys.argv[1] if len(sys.argv)>1 else 'all'))
