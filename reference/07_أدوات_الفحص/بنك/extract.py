# يستخرج البنك كما يعمل فعلاً، ومعه البنود «الميتة» التي استبدلتها كتل Object.assign لاحقة
import asyncio, json, sys
from playwright.async_api import async_playwright
APP=sys.argv[1]; OUT=sys.argv[2]
INIT = r"""
(() => {
  const orig = Object.assign;
  window.__cbSeen = [];   // [cid, fn]
  Object.assign = function(target, ...srcs) {
    try {
      for (const s of srcs) if (s && typeof s === 'object') for (const k of Object.keys(s)) {
        if (/^C\d{3}$/.test(k) && Array.isArray(s[k])) {
          if (Array.isArray(target[k])) target[k].forEach(f => window.__cbSeen.push([k, f]));
          s[k].forEach(f => window.__cbSeen.push([k, f]));
        }
      }
    } catch (e) {}
    return orig.call(Object, target, ...srcs);
  };
})();
"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); ctx=await b.new_context(); await ctx.add_init_script(INIT)
    pg=await ctx.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('file://'+APP); await pg.wait_for_timeout(800)
    r=await pg.evaluate("""()=>{
      // البنود الابتدائية في const CB قبل أي Object.assign غير مرصودة؛ نرصدها من __cbSeen حين تُستبدل، والباقي من CB النهائي
      const finalSet=new Set(); Object.values(CB).forEach(a=>a.forEach(f=>finalSet.add(f)));
      const ser=(f,cid)=>{ const it=f(); const keys=Object.keys(it);
        const o={cid, svg: it.svg||null, kind: itemKind(it), kindExplicit: !!it.kind, type: it.type, q: it.q, hint: it.hint||'', steps: it.steps||[], tol: it.tol??null, extra: keys.filter(k=>!['type','q','opts','ans','hint','steps','tol','kind'].includes(k))};
        if (it.type==='choice'){ o.correct=it.opts[it.ans]; o.wrongs=it.opts.filter((x,i)=>i!==it.ans); } else o.ans=it.ans;
        return o; };
      const live={}; for(const c of Object.keys(CB)) live[c]=CB[c].map(f=>ser(f,c));
      const deadSeen=new Set(); const dead=[];
      for(const [c,f] of window.__cbSeen){ if(finalSet.has(f)||deadSeen.has(f)) continue; deadSeen.add(f); try{dead.push(ser(f,c))}catch(e){dead.push({cid:c,error:String(e)})} }
      return {live, dead, assignCalls: window.__cbSeen.length};
    }""")
    r['errors']=errs
    json.dump(r,open(OUT,'w'),ensure_ascii=False,indent=1)
    nlive=sum(len(v) for v in r['live'].values())
    print('concepts',len(r['live']),'live fns',nlive,'dead',len(r['dead']),'errors',errs)
    extra=set(k for v in r['live'].values() for x in v for k in x['extra']); print('extra fields',extra)
    await b.close()
asyncio.run(main())
