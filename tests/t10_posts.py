import os
import asyncio,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from common import setup, URL
from playwright.async_api import async_playwright
async def main():
    os.makedirs('out10',exist_ok=True)
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for w,h,tag in [(1440,900,'d'),(390,844,'m')]:
            pg=await (await b.new_context(viewport={'width':w,'height':h},device_scale_factor=2 if w<900 else 1,has_touch=w<900)).new_page(); errs=[]
            pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m:errs.append('console:'+m.text) if m.type=='error' else None)
            pg.on('dialog',lambda d:asyncio.ensure_future(d.accept()))
            await setup(pg)
            await pg.goto(URL+'#/projects'); await pg.evaluate('localStorage.clear()'); await pg.reload(); await pg.wait_for_timeout(1500)
            print(tag,'chips',await pg.evaluate("document.getElementById('pjf').innerText.replace(/\\n/g,' ')"),'| posts',await pg.evaluate("[...document.querySelectorAll('.po')].map(x=>x.innerText.replace(/\\n/g,' / '))"))
            await pg.evaluate("document.getElementById('posts-项目').scrollIntoView({block:'start'})"); await pg.wait_for_timeout(600)
            await pg.screenshot(path=f'out10/po_{tag}_list.png')
            await pg.click('#pjf .pjf[data-f=项目]'); await pg.wait_for_timeout(300)
            print(tag,'filter 项目',await pg.evaluate("[!!document.querySelector('.pubs[hidden]'),document.querySelectorAll('.po').length]"))
            await pg.click('#pjf .pjf[data-f=all]'); await pg.wait_for_timeout(300)
            await pg.click('.po-a'); await pg.wait_for_timeout(1200)
            print(tag,'post',await pg.evaluate("[location.hash,document.title,document.querySelector('[data-page=post]').hidden,document.querySelectorAll('.pv-body h2').length,document.querySelectorAll('.pv-toc [data-s]').length,document.querySelector('.nav a[aria-current]')&&document.querySelector('.nav a[aria-current]').dataset.nav]"))
            await pg.screenshot(path=f'out10/po_{tag}_top.png')
            if w>=900:
                await pg.click('.pv-toc [data-s=s3]'); await pg.wait_for_timeout(1300)
                print(tag,'toc→s3',await pg.evaluate("[Math.round(document.getElementById('s3').getBoundingClientRect().top),document.querySelector('.pv-toc .on')&&document.querySelector('.pv-toc .on').dataset.s,document.querySelector('.pv-prog').style.transform]"))
                await pg.screenshot(path=f'out10/po_{tag}_mid.png')
            else:
                await pg.click('.pv-tocm summary'); await pg.wait_for_timeout(300); await pg.screenshot(path=f'out10/po_{tag}_toc.png')
                await pg.click('.pv-tocm [data-s=s3]'); await pg.wait_for_timeout(1300)
                print(tag,'tocm→s3',await pg.evaluate("[Math.round(document.getElementById('s3').getBoundingClientRect().top),document.querySelector('.pv-tocm').open,document.querySelector('.pv-prog').style.transform]"))
                await pg.screenshot(path=f'out10/po_{tag}_mid.png')
            await pg.evaluate("scrollTo(0,document.body.scrollHeight)"); await pg.wait_for_timeout(500)
            print(tag,'end prog',await pg.evaluate("document.querySelector('.pv-prog').style.transform"))
            await pg.screenshot(path=f'out10/po_{tag}_end.png')
            await pg.click('[data-page=post] .goback'); await pg.wait_for_timeout(800)
            print(tag,'back',await pg.evaluate("location.hash"))
            await pg.goto(URL+'#/p/nope'); await pg.wait_for_timeout(800)
            print(tag,'404',await pg.evaluate("document.getElementById('postv').innerText.replace(/\\n/g,' ')"))
            print(tag,'errs',errs)
        # dev：写一篇
        pg=await (await b.new_context(viewport={'width':1440,'height':900})).new_page(); errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('dialog',lambda d:asyncio.ensure_future(d.accept())); await setup(pg)
        await pg.goto(URL+'?dev#/projects'); await pg.evaluate('localStorage.clear()'); await pg.reload(); await pg.wait_for_timeout(1500)
        await pg.click('[data-dev=post-add]'); await pg.wait_for_timeout(400)
        await pg.screenshot(path='out10/po_dev_add.png')
        await pg.select_option('#ed-kind','实习'); await pg.fill('#ed-tag','某公司'); await pg.fill('#ed-t','测试实习'); await pg.fill('#ed-sum','一句话。')
        await pg.fill('#ed-body','## 做了什么\n\n第一段，有**加粗**和`代码`和[链接](https://example.com)。\n\n- 一\n- 二\n\n> 引用一句\n\n```\nprint(1)\n```\n\n## 学到的\n\n第二段。')
        await pg.click('#ed-body'); await pg.keyboard.press('Control+End')
        await pg.set_input_files('#ed .edins input[type=file]',os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','photos','blk_bench.jpg')); await pg.wait_for_timeout(1500)
        print('after insert',await pg.evaluate("[document.getElementById('ed-body').value.match(/!\\[[^\\]]*\\]\\([^)]*\\)/g),document.querySelector('.edins-t').innerText]"))
        await pg.screenshot(path='out10/po_dev_img.png')
        await pg.click('#ed .ago'); await pg.wait_for_timeout(900)
        print('figure',await pg.evaluate("[...document.querySelectorAll('.pv-body figure img')].map(i=>[i.naturalWidth,i.src.slice(0,22)])"))
        await pg.locator('.pv-body figure').scroll_into_view_if_needed(); await pg.wait_for_timeout(400); await pg.screenshot(path='out10/po_dev_fig.png')
        print('dev add →',await pg.evaluate("[location.hash,document.title,document.querySelectorAll('.pv-body ul li').length,!!document.querySelector('.pv-body pre'),!!document.querySelector('.pv-body blockquote'),document.querySelector('.pv-body a').getAttribute('target')]"))
        await pg.screenshot(path='out10/po_dev_post.png')
        await pg.goto(URL+'?dev#/projects'); await pg.wait_for_timeout(1200)
        print('chips after',await pg.evaluate("document.getElementById('pjf').innerText.replace(/\\n/g,' ')"),await pg.evaluate("[...document.querySelectorAll('.posts .pub-h')].map(h=>h.innerText.replace(/\\n/g,''))"))
        await pg.click('.po:has-text(\"测试实习\") [data-dev=post-del]'); await pg.wait_for_timeout(400); await pg.screenshot(path='out10/po_askok.png'); await pg.click('#askok .yes'); await pg.wait_for_timeout(500)
        print('after del',await pg.evaluate("POSTS.length"),'errs',errs)
        # 打印
        await pg.goto(URL+'#/p/colwork'); await pg.wait_for_timeout(1000); await pg.emulate_media(media='print'); await pg.pdf(path='out10/po_print.pdf'); print('pdf ok')
        await b.close()
asyncio.run(main())
