import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page()
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file:///home/claude/work/app.html'); await pg.wait_for_timeout(600)
        r=await pg.evaluate("""()=>{const out=[];for(let t=0;t<30;t++){startConceptPractice('C202');out.push(PR.items.map(i=>i.q));}
          const dup=out.filter(a=>new Set(a).size<a.length).length;return {runs:out.length,withDup:dup,sample:out[0]}}""")
        print(r)
        await pg.evaluate("openLesson('p2u7l4')"); await pg.wait_for_timeout(400)
        n=await pg.evaluate("document.querySelectorAll('#lgTray .item').length")
        print('p2u7l4 tray items', n, 'errors', errs)
        await b.close()
asyncio.run(main())
