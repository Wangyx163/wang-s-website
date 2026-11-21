import asyncio, sys, os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from common import setup, URL
from playwright.async_api import async_playwright
async def run(w,h,tag):
    async with async_playwright() as p:
        b=await p.chromium.launch()
        ctx=await b.new_context(viewport={'width':w,'height':h},device_scale_factor=1,has_touch=w<900)
        pg=await ctx.new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m:errs.append('console:'+m.text) if m.type=='error' else None)
        await setup(pg); await pg.goto(URL+'?shot'); await pg.wait_for_timeout(1500)
        async def hitcheck(sel):
            return await pg.evaluate('''(sel)=>{const out=[];document.querySelectorAll(sel).forEach(el=>{const r=el.getBoundingClientRect();if(!r.width)return;
              const pts=[[.5,.5],[.15,.5],[.85,.5]];pts.forEach(([a,b])=>{const x=r.left+r.width*a,y=r.top+r.height*b;if(y<0||y>innerHeight)return;const e=document.elementFromPoint(x,y);out.push(e&&(e===el||el.contains(e))?1:(e?e.tagName+'.'+(e.className.baseVal??e.className):'none'))})});return out}''',sel)
        # 1 每个入口的命中测试（滚到对应位置）
        for sel in ['.hphotos .door','a.hfilm','.hcards .door','.hbooks .door','.hbooks .ledge','.hbadge .bdlink','.hbadge .eye','#dlabel','.hrcpt a.ln','#cassette','#pmbtn']:
            el=pg.locator(sel).first
            if await el.count()==0 or not await el.is_visible(): print(sel,'hidden'); continue
            await el.scroll_into_view_if_needed(); await pg.wait_for_timeout(150)
            print('hit',sel,await hitcheck(sel))
        # 2 胶卷 → 照片页
        if w>=900:
            await pg.locator('a.hfilm').click(); await pg.wait_for_timeout(1200)
            print('after film', await pg.evaluate('location.hash'))
            await pg.screenshot(path=f'out8/{tag}_photos.png')
            await pg.locator('#lt .pp').nth(1).click(); await pg.wait_for_timeout(600); await pg.click('#vnext'); await pg.wait_for_timeout(500)
            await pg.screenshot(path=f'out8/{tag}_viewer.png'); await pg.keyboard.press('Escape'); await pg.wait_for_timeout(300)
            await pg.click('.page[data-page=photos] .goback'); await pg.wait_for_timeout(800); print('back ->',await pg.evaluate('location.hash'))
        # 3 书 → shelf
        await pg.locator('#homeBooks .sp').nth(1).scroll_into_view_if_needed()
        await pg.locator('#homeBooks .sp').nth(1).click(); 
        await pg.wait_for_timeout(1200); print('book ->',await pg.evaluate('[location.hash,document.activeElement.id]'))
        await pg.screenshot(path=f'out8/{tag}_shelf.png')
        # 4 工牌 → about，眼睛
        await pg.goto(URL+'?shot#/'); await pg.wait_for_timeout(1000)
        await pg.locator('.hbadge .eye').scroll_into_view_if_needed(); await pg.locator('.hbadge .eye').click(); await pg.wait_for_timeout(200)
        print('eye',await pg.evaluate("[location.hash,document.querySelector('.hbadge .rn').textContent]"))
        await pg.locator('.hbadge .bdlink').click(); await pg.wait_for_timeout(1000)
        print('badge ->',await pg.evaluate("[location.hash,document.querySelector('.contact .rn').textContent]"))
        await pg.screenshot(path=f'out8/{tag}_about.png',full_page=True)
        for pgname in ['mind','projects']:
            await pg.goto(URL+f'?shot#/{pgname}'); await pg.wait_for_timeout(900)
            await pg.screenshot(path=f'out8/{tag}_{pgname}.png')
        await pg.goto(URL+'?shot#/inbox'); await pg.wait_for_timeout(900); print('inbox text',await pg.evaluate("document.getElementById('ibsum').textContent"))
        print('errors',errs)
        await b.close()
if __name__=="__main__":
    os.makedirs('out8',exist_ok=True)
    w=int(sys.argv[1]) if len(sys.argv)>1 else 1440; asyncio.run(run(w,900 if w>=900 else 844,'pd' if w>=900 else 'pm'))
