import asyncio, json, sys
from playwright.async_api import async_playwright
APP=sys.argv[1]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); ctx=await b.new_context(); pg=await ctx.new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
    await pg.goto('file://'+APP); await pg.wait_for_timeout(600)
    R={}
    # ح-1: concept practice then due review -> practice menu must render
    R['h1']=await pg.evaluate("""()=>{startConceptPractice('C001'); PR.score=3; PR.i=PR.items.length; finishPractice();
       const bad=Object.keys(state.srs||{}).filter(k=>!/^p\\d+u\\d+$/.test(k));
       state.srs=state.srs||{}; state.srs['C002']={ivl:1,due:0}; let ok=true; try{ dueHtml(); renderPracticeMenu&&renderPracticeMenu(); }catch(e){ok=String(e)}
       const txt=document.getElementById('practiceBody').innerHTML; return {conceptKeysInSrs:bad, renderOk:ok, retryBtnConcept: txt.includes("startConceptPractice('C001')")}}""")
    # reload with a poisoned srs entry -> cleaned at load
    await pg.evaluate("""()=>{const d=JSON.parse(localStorage.getItem('handasoPolis_v1'));d.srs={C001:{ivl:1,due:0},p2u1:{ivl:1,due:0}};localStorage.setItem('handasoPolis_v1',JSON.stringify(d))}""")
    await pg.reload(); await pg.wait_for_timeout(600)
    R['h1_reload']=await pg.evaluate("()=>{let ok=true;try{dueHtml()}catch(e){ok=String(e)};return {srs:Object.keys(state.srs),ok}}")
    # ح-2: sort lesson feedback survives
    R['h2']=await pg.evaluate("""()=>{openLesson('lesson4'); const L=LESSONS['lesson4']; const k=L.items[0].kind; lgPickBin(k);
       const i=L.items.findIndex(x=>x.kind===k); lgPlace(i); const good=document.getElementById('lgFeedback').textContent;
       const j=L.items.findIndex((x,idx)=>x.kind!==k && !LG.placed[idx]); lgPlace(j); const bad=document.getElementById('lgFeedback').textContent;
       return {good,bad}}""")
    # ع-4: pick lesson locked after success, letters ordered, check btn hidden
    R['a4']=await pg.evaluate("""()=>{openLesson('p4u3l1'); const L=LG.L; const ci=L.items.findIndex(x=>x.ok); lgPick(ci);
       const after=document.getElementById('lgFeedback').textContent; const wi=L.items.findIndex(x=>!x.ok); lgPick(wi);
       const after2=document.getElementById('lgFeedback').textContent;
       openLesson('p4u3l1'); const labels=[...document.querySelectorAll('#lgTray .item')].map(e=>e.innerText.trim().slice(-1));
       return {lockedSame: after===after2, labels, checkHidden: getComputedStyle(document.getElementById('lgCheckBtn')).display}}""")
    # ح-3: badge message
    R['h3']=await pg.evaluate("""()=>{startPractice('p2u0','test'); PR.score=PR.items.length; PR.i=PR.items.length; finishPractice();
       const t=document.getElementById('practiceBody').innerText; return {saved:state.assess.prac_p2u0.pass, saysBadge:t.includes('ربحت شارتها'), msg:t.slice(0,200)}}""")
    # ح-6: XSS via import
    R['h6']=await pg.evaluate("""()=>{window.__x=0; applyData({app:'handasopolis',child:'<img src=x onerror="window.__x=1">سلمى',photo:'x" onerror="window.__x=2',notes:[{d:'1',t:'<img src=x onerror="window.__x=3">'}]});
       renderReport(); renderHeader(); return new Promise(r=>setTimeout(()=>r({x:window.__x, child:state.child, photo:state.photo}),300))}""")
    # ع-1: bad prefs and bad assess
    await pg.evaluate("""()=>{localStorage.setItem('handaso_pref','{bad');const d=JSON.parse(localStorage.getItem('handasoPolis_v1'));d.assess={diag1:{levels:null},x:5};localStorage.setItem('handasoPolis_v1',JSON.stringify(d))}""")
    errs.clear(); await pg.reload(); await pg.wait_for_timeout(600)
    R['a1']=await pg.evaluate("()=>{let r={};try{renderAssess();r.assess='ok'}catch(e){r.assess=String(e)};try{renderReport();r.report='ok'}catch(e){r.report=String(e)};try{setPref('night',false);r.pref='ok'}catch(e){r.pref=String(e)};r.header=!!document.querySelector('header');return r}")
    R['errors']=errs
    print(json.dumps(R,ensure_ascii=False,indent=1)); await b.close()
asyncio.run(main())
