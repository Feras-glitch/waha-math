import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page()
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file:///home/claude/work/app.html'); await pg.wait_for_timeout(600)
        r=await pg.evaluate("""()=>{const bad=[];let total=0;
          for(const cid of Object.keys(CB)){const fns=CB[cid]||[];total+=fns.length;
            const qs=new Set();let dup=0;const kinds={};
            for(const f of fns){const it=f();qs.add(it.q);}
            if(qs.size<fns.length) bad.push([cid,'dup',fns.length-qs.size]);
          }
          return {total,bad:bad.slice(0,10),nbad:bad.length}}""")
        print(r)
        fahm=await pg.evaluate("""()=>Object.keys(CB).filter(c=>drawDistinct(c,'فهم',3,[]).length<3).length""")
        print('concepts lacking 3 فهم items:', fahm)
        print('errors', errs)
        await b.close()
asyncio.run(main())
