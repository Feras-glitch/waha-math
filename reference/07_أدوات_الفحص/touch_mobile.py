import asyncio, json, sys
from playwright.async_api import async_playwright
APP=sys.argv[1]
async def touch(cdp, typ, x, y):
    pts=[] if typ=='touchEnd' else [{'x':x,'y':y}]
    await cdp.send('Input.dispatchTouchEvent',{'type':typ,'touchPoints':pts})
async def drag(pg,cdp,x0,y0,x1,y1,hold,steps=12):
    await touch(cdp,'touchStart',x0,y0)
    if hold: await pg.wait_for_timeout(hold)
    ghosts=0
    for i in range(1,steps+1):
        await touch(cdp,'touchMove',x0+(x1-x0)*i/steps,y0+(y1-y0)*i/steps); await pg.wait_for_timeout(16)
        ghosts=max(ghosts, await pg.evaluate("document.querySelectorAll('.drag-ghost').length"))
    await touch(cdp,'touchEnd',x1,y1); await pg.wait_for_timeout(120)
    return ghosts
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); dev=p.devices['Pixel 5']
    ctx=await b.new_context(**dev); pg=await ctx.new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('file://'+APP); await pg.wait_for_timeout(700)
    cdp=await ctx.new_cdp_session(pg); R={}
    # ---- generated sort lesson
    await pg.evaluate("openLesson('lesson4')"); await pg.wait_for_timeout(300)
    async def first_item_and_bin():
        return await pg.evaluate("""()=>{const it=document.querySelector('#lgTray .item'); it.scrollIntoView({block:'center'}); const r=it.getBoundingClientRect();
          const idx=[...LG.L.items.keys()].find(i=>!LG.placed[i]); const kind=LG.L.items[idx].kind; return {x:r.x+r.width/2,y:r.y+r.height/2,kind,label:LG.L.items[idx].label}}""")
    a=await first_item_and_bin()
    sy0=await pg.evaluate("scrollY")
    # quick swipe upward on an item: should scroll, not drag
    await drag(pg,cdp,a['x'],a['y'],a['x'],a['y']-250,0,8)
    sy1=await pg.evaluate("scrollY"); placed1=await pg.evaluate("Object.keys(LG.placed).length")
    R['swipe_scrolls']={'scrollDelta':sy1-sy0,'placed':placed1}
    # long-press drag to the matching bin (bin brought into view next to item)
    a=await first_item_and_bin()
    binpos=await pg.evaluate("""(k)=>{const b=document.querySelector('#lgBins [data-k="'+k+'"]'); const r=b.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+Math.min(r.height/2,40)}}""",a['kind'])
    # position: scroll so both visible
    await pg.evaluate("(y)=>window.scrollBy(0, y)", (binpos['y']-a['y'])/2 if abs(binpos['y']-a['y'])>500 else 0)
    a2=await pg.evaluate("""()=>{const it=document.querySelector('#lgTray .item'); const r=it.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}}""")
    bp=await pg.evaluate("""(k)=>{const b=document.querySelector('#lgBins [data-k="'+k+'"]'); const r=b.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+Math.min(r.height/2,40), vh:innerHeight}}""",a['kind'])
    g=await drag(pg,cdp,a2['x'],a2['y'],bp['x'],min(bp['y'],bp['vh']-5),300,15)
    R['longpress_drag']={'maxGhosts':g,'placed':await pg.evaluate("Object.keys(LG.placed).length"),'fb':await pg.evaluate("document.getElementById('lgFeedback').textContent"), 'item':a['label']}
    # tap still works: tap bin then tap item
    R['tap']=await pg.evaluate("""()=>{const idx=[...LG.L.items.keys()].find(i=>!LG.placed[i]); const k=LG.L.items[idx].kind; lgPickBin(k); const n0=Object.keys(LG.placed).length; lgPlace(idx); return Object.keys(LG.placed).length-n0}""")
    # ---- hand-built lesson 1 (select-then-bin model) with long-press drag downward
    await pg.evaluate("show('unit1'); resetGame && resetGame()"); await pg.wait_for_timeout(400)
    info=await pg.evaluate("""()=>{const it=document.querySelector('#tray .item'); it.scrollIntoView({block:'start'}); const r=it.getBoundingClientRect();
       const label=it.innerText.trim(); const obj=ITEMS.find(x=>x.label===label); const binEl=document.getElementById(obj.kind==='circle'?'circleItems':'squareItems').closest('.bin');
       const br=binEl.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2,bx:br.x+br.width/2,by:Math.min(br.y+30, innerHeight-5),label}}""")
    g=await drag(pg,cdp,info['x'],info['y'],info['bx'],info['by'],300,15)
    R['lesson1_drag_down']={'maxGhosts':g,'placed':await pg.evaluate("Object.keys(placed).length"),'fb':await pg.evaluate("document.getElementById('feedback').textContent")}
    R['errors']=errs
    print(json.dumps(R,ensure_ascii=False,indent=1)); await b.close()
asyncio.run(main())
