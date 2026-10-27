import asyncio, json, sys
from playwright.async_api import async_playwright
APP=sys.argv[1]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('file://'+APP); await pg.wait_for_timeout(600)
    keys=await pg.evaluate("Object.keys(LESSONS)")
    fails=[]
    for k in keys:
      r=await pg.evaluate("""async (k)=>{openLesson(k); await new Promise(r=>setTimeout(r,20)); const L=LG.L;
        if(L.mode==='pick'){ const els=[...document.querySelectorAll('#lgTray .item')]; const order=LG.order;
           const pos=order.findIndex(i=>L.items[i].ok); els[pos].click(); }
        else { L.bins.forEach(bn=>{ lgPickBin(bn.k); [...document.querySelectorAll('#lgTray .item')]; L.items.forEach((it,i)=>{ if(it.kind===bn.k && !LG.placed[i]) lgPlace(i); }); }); }
        return {done:LG.done, fb:document.getElementById('lgFeedback').textContent, next:getComputedStyle(document.getElementById('lgNext')).display}}""",k)
      if not r['done']: fails.append((k,r))
    print('lessons',len(keys),'failed',len(fails),fails[:5],'errors',errs[:5]); await b.close()
asyncio.run(main())
