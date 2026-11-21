import os
import asyncio,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from common import setup, URL
from playwright.async_api import async_playwright
async def main():
    os.makedirs('out11',exist_ok=True)
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await (await b.new_context(viewport={'width':1440,'height':900},device_scale_factor=2)).new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e))); await setup(pg)
        await pg.goto(URL); await pg.evaluate('localStorage.clear()'); await pg.reload(); await pg.wait_for_timeout(2000)
        await pg.evaluate("document.querySelector('.hticket').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(1000)
        await pg.click('#pmbtn'); await pg.wait_for_timeout(4800)
        cb=await pg.locator('#pass .sign canvas').bounding_box(); print('canvas',cb)
        clip={'x':cb['x']-60,'y':cb['y']-120,'width':cb['width']+140,'height':200}
        await pg.mouse.move(10,10); await pg.wait_for_timeout(400); await pg.screenshot(path='out11/pen_rest.png',clip=clip)
        await pg.mouse.move(cb['x']+40,cb['y']+cb['height']*.6); await pg.wait_for_timeout(300); await pg.screenshot(path='out11/pen_hover.png',clip=clip)
        print('cursor',await pg.evaluate("getComputedStyle(document.querySelector('#pass .sign canvas')).cursor"))
        await pg.mouse.down()
        for i in range(1,30):
            await pg.mouse.move(cb['x']+40+i*5,cb['y']+cb['height']*(.6-.3*((i%6)/6)),steps=2)
        await pg.screenshot(path='out11/pen_draw.png',clip=clip)
        await pg.mouse.up(); await pg.mouse.move(10,10); await pg.wait_for_timeout(500); await pg.screenshot(path='out11/pen_after.png',clip=clip)
        await pg.evaluate("document.getElementById('tearbtn').click()"); await pg.wait_for_timeout(3200)
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(400)
        print('pen opacity after tear',await pg.evaluate("(()=>{const p=document.querySelector('#pass .spen');return p?getComputedStyle(p).opacity:'none'})()"))
        await pg.evaluate("document.querySelector('.hrcpt').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(1000)
        bb=await pg.locator('.hrcpt').bounding_box(); await pg.screenshot(path='out11/rcpt_new.png',clip={'x':bb['x']-40,'y':bb['y']-40,'width':bb['width']+80,'height':bb['height']+80})
        print('errs',errs); await b.close()
asyncio.run(main())
