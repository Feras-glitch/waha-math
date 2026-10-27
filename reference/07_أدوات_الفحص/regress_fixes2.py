import asyncio, json, sys
from playwright.async_api import async_playwright
APP=sys.argv[1]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
    await pg.goto('file://'+APP); await pg.wait_for_timeout(700)
    R={}
    R['parseNum']=await pg.evaluate("""()=>Object.fromEntries(['12','12 سم','12سم','12,5','١٢٫٥','۱۲','٣-','-3','−4','1/2','0x10','Infinity','1e3','','abc','٧ سم²','90°'].map(x=>[x,parseNum(x)]))""")
    # Enter submits
    R['enter']=await pg.evaluate("""async()=>{startConceptPractice('C202'); let i=PR.items.findIndex(x=>x.type==='num'); if(i<0)return 'no num'; PR.i=i; drawPractice();
       const e=document.getElementById('pAns'); e.value=String(PR.items[i].ans)+' سم'; e.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
       await new Promise(r=>setTimeout(r,50)); return document.getElementById('pFb').textContent}""")
    # stage map
    R['map']=await pg.evaluate("""()=>{show('home'); const tabs=[...document.querySelectorAll('.stage-tab')].map(t=>t.textContent); switchStage(4);
       const s4=[...document.querySelectorAll('#curriculumList .tileLine')].map(x=>x.textContent);
       openLesson('u2l1'); LG.done=false; state.done_u2l1=true; switchStage(1); const s1=[...document.querySelectorAll('#curriculumList .tileLine')].map(x=>x.textContent);
       return {tabs, s4n:s4.length, s4first:s4[0], s1:s1.slice(0,3)}}""")
    R['continue']=await pg.evaluate("""()=>{state.unit1Done=true; state.lastLesson='u2l1'; state.done_u2l1=true; show('home'); return document.querySelector('#home .tile.primary').textContent}""")
    R['explainOpen']=await pg.evaluate("""()=>{openLesson('p3u1l1'); const d=document.querySelector('#lgExplain details'); return d? d.open : 'no explain'}""")
    # geolab
    R['geo']=await pg.evaluate("""()=>{show('geoLab'); initGeoLab(); const t1=document.getElementById('geoTaskText').textContent; nextGeoboardTask(); const t2=document.getElementById('geoTaskText').textContent;
       return {first:t1, second:t2, vertsAtTri:GEO.verts.length, ang:document.getElementById('angTaskText').textContent, rulerOff:GEO.ruler.off}}""")
    # find triangle task and solve it
    R['geoTri']=await pg.evaluate("""()=>{GEO.taskIdx=0; nextGeoboardTask(); GEO.verts=[[1,1],[4,1],[1,5]]; return {task:GEO.task.text, ok:GEO.task.check(GEO.verts)}}""")
    # mirror double tap
    R['mirror']=await pg.evaluate("""async()=>{MIR=null; show('mirror'); startMirror(); for(let r=0;r<5;r++){ const w=MIR.opts.findIndex(o=>!o.ok); if(r===0) mirrorPick(w); const j=MIR.opts.findIndex(o=>o.ok); mirrorPick(j); mirrorPick(j); await new Promise(res=>setTimeout(res,1000)); }
       return {round:MIR.round, score:MIR.score, text:document.getElementById('mirrorBody').innerText.slice(0,80)}}""")
    # gate
    R['gate']=await pg.evaluate("""()=>{let opened=false; gateParent(()=>{opened=true}); const html=document.getElementById('gateBox').innerHTML; const leaks=/gateCheck\\(\\d/.test(html);
       document.getElementById('gateIn').value='1'; gateCheck(); return {hasInput:!!document.getElementById('gateIn'), leaks, opened}}""")
    R['errors']=errs
    print(json.dumps(R,ensure_ascii=False,indent=1)); await b.close()
asyncio.run(main())
