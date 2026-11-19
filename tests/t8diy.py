import asyncio, sys, os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from common import setup, URL
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); ctx=await b.new_context(viewport={'width':1440,'height':900}); pg=await ctx.new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m:errs.append('console:'+m.text) if m.type=='error' else None)
        await setup(pg); await pg.goto(URL); await pg.evaluate('localStorage.clear()'); await pg.reload(); await pg.wait_for_timeout(1500)
        print('label',await pg.locator('#dlabel').text_content(), 'done hidden',await pg.locator('#donebtn').is_hidden())
        await pg.click('.hdiy .roll'); await pg.wait_for_timeout(300)
        await pg.mouse.move(700,700); await pg.mouse.down(); await pg.mouse.move(820,660,steps=8); await pg.mouse.up()
        await pg.click('#tray [data-tool=stamp]'); await pg.mouse.click(1000,640)
        await pg.click('#tray [data-tool=sticker]'); await pg.wait_for_timeout(300)
        for k,(x,y) in zip(['star','night','camera','pick'],[(640,300),(760,330),(880,300),(560,360)]):
            bb=await pg.locator(f'.sheet [data-k={k}]').bounding_box()
            if not bb: print('no sticker',k); continue
            await pg.mouse.move(bb['x']+bb['width']/2,bb['y']+bb['height']/2); await pg.mouse.down(); await pg.mouse.move(x,y,steps=8); await pg.mouse.up(); await pg.wait_for_timeout(150)
        await pg.click('#tray [data-tool=pencil]'); await pg.mouse.move(560,720); await pg.mouse.down(); await pg.mouse.move(640,760,steps=10); await pg.mouse.move(700,700,steps=10); await pg.mouse.up()
        await pg.click('#tray [data-tool=note]'); await pg.mouse.click(1120,180); await pg.keyboard.type('喜欢这个磁带！'); 
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)
        print('label',await pg.locator('#dlabel').text_content(), 'done hidden',await pg.locator('#donebtn').is_hidden())
        await pg.screenshot(path='out8/diy_board.png')
        await pg.click('#donebtn'); await pg.wait_for_timeout(400); await pg.screenshot(path='out8/diy_after.png')
        await pg.click('#after [data-a=save]'); await pg.wait_for_timeout(2500); await pg.screenshot(path='out8/diy_save.png')
        await pg.click('#after [data-a=close]'); await pg.wait_for_timeout(300)
        await pg.click('#dlabel'); await pg.wait_for_timeout(300); await pg.click('#after [data-a=send]'); await pg.wait_for_timeout(400)
        await pg.fill('#after textarea','建议把磁带的歌换成你自己弹的版本'); await pg.fill('#after input[name=as]','小林')
        await pg.screenshot(path='out8/diy_send.png')
        await pg.click('#after .asend .ago'); await pg.wait_for_timeout(800); await pg.screenshot(path='out8/diy_sent.png')
        print('mail href',(await pg.locator('#after .adone a.ago').get_attribute('href'))[:160])
        print('errors',errs); await b.close()
asyncio.run(main())
