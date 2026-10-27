import asyncio, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page()
        await pg.goto('file:///home/claude/work/app.html'); await pg.wait_for_timeout(500)
        r=await pg.evaluate("""()=>{const out={};for(const c of Object.keys(CB)){const seen={};const arr=[];
          for(const f of CB[c]){const it=f();const k=itemKind(it)+'|'+it.q; if(seen[k])continue; seen[k]=1;
            arr.push({kind:itemKind(it),type:it.type,q:it.q,opts:it.opts||null,ans:it.ans,tol:it.tol??null,hint:it.hint||'',steps:it.steps||[]});}
          out[c]=arr;}
          return {concepts:Object.keys(out).length, items:Object.values(out).reduce((a,b)=>a+b.length,0), bank:out}}""")
        json.dump(r['bank'],open('bank_dump.json','w'),ensure_ascii=False,indent=1)
        lessons=await pg.evaluate("()=>Object.keys(LESSONS).length")
        print('concepts',r['concepts'],'items',r['items'],'lessons',lessons)
        await b.close()
asyncio.run(main())
