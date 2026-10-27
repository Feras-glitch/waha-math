import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        pg=await b.new_page()
        errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file:///home/claude/work/app.html')
        await pg.wait_for_timeout(800)
        r=await pg.evaluate("""()=>({hasCB: typeof CB!=='undefined', keys: typeof CB!=='undefined'?Object.keys(CB).length:0,
          concept: (()=>{try{const it=makeConceptItem('C202'); return it?it.q:null}catch(e){return 'ERR '+e}})(),
          lessons: typeof LESSONS!=='undefined'?Object.keys(LESSONS).length:0})""")
        print(r); print('errors', errs)
        await b.close()
asyncio.run(main())
