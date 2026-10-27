import asyncio, json, sys
from playwright.async_api import async_playwright
APP=sys.argv[1]; OUT=sys.argv[2]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page()
    await pg.goto('file://'+APP); await pg.wait_for_timeout(500)
    d=await pg.evaluate("""()=>{const bank={};for(const c of Object.keys(CB)){const seen=new Set(),arr=[];
        for(const f of CB[c]){const it=f();const k=itemKind(it)+'|'+it.q;if(seen.has(k))continue;seen.add(k);
          arr.push({kind:itemKind(it),type:it.type,q:it.q,opts:it.opts||null,ans:it.ans,tol:it.tol??null,hint:it.hint||'',steps:it.steps||[]});}
        bank[c]=arr;}
      const titles={};for(const u of ALL_UNITS){try{titles[u]=unitTitle(u)}catch(e){titles[u]=u}}
      return {bank,units:ALL_UNITS,uc:UNIT_CONCEPTS,names:CONCEPT_NAMES,why:CONCEPT_WHY,titles}}""")
    await b.close()
  bank,uc,names,why=d['bank'],d['uc'],d['names'],d['why']
  stage={'1':'المرحلة الأولى (6–7 سنوات)','2':'المرحلة الثانية','3':'المرحلة الثالثة','4':'المرحلة الرابعة'}
  L=[]; A=L.append
  total=sum(len(v) for v in bank.values())
  nf=sum(1 for v in bank.values() for x in v if x['kind']=='فهم')
  A('# مراجعة البنود والإجابات النموذجية (مولَّدة من التطبيق)\n')
  A(f'- المصدر: `{APP.split("/")[-1]}` — تُولَّد آلياً من بنك الأسئلة كما يعمل في المتصفح، فلا تحرَّر يدوياً؛ أعد توليدها بعد أي تعديل.')
  A(f'- المفاهيم: **{len(bank)}** — البنود الفريدة: **{total}** (فهم: {nf}، تعرّف: {total-nf}).')
  A('- الرموز: ✅ الإجابة الصحيحة، ✗ خيار خاطئ، 🔢 سؤال إدخال رقمي، 🧠 فهم، 👁 تعرّف.\n')
  A('## الفهرس\n')
  placed=set(); cur=None
  for u in d['units']:
    s=u[1]
    if s!=cur: cur=s; A(f'\n**{stage.get(s,s)}**\n')
    cs=[c for c in uc.get(u,[]) if c in bank]
    A(f'- {d["titles"].get(u,u)} — المفاهيم: {len(cs)}، البنود: {sum(len(bank[c]) for c in cs)}')
  cur=None
  for u in d['units']:
    s=u[1]
    if s!=cur: cur=s; A(f'\n---\n\n# {stage.get(s,s)}\n')
    A(f'\n## {d["titles"].get(u,u)}\n')
    for c in uc.get(u,[]):
      if c not in bank: A(f'\n### {c} — {names.get(c,"")}\n\n> ⚠️ لا بنود لهذا المفهوم في بنك الأسئلة.\n'); continue
      if c in placed: A(f'\n### {c} — {names.get(c,"")} (مكرر: سبق عرضه في وحدة أخرى)\n'); continue
      placed.add(c); items=bank[c]
      A(f'\n### {c} — {names.get(c,"")}\n')
      if why.get(c): A(f'> **لماذا؟** {why[c]}\n')
      A(f'_البنود: {len(items)} — فهم {sum(x["kind"]=="فهم" for x in items)}، تعرّف {sum(x["kind"]!="فهم" for x in items)}_\n')
      for i,x in enumerate(items,1):
        icon='🧠' if x['kind']=='فهم' else '👁'
        A(f'{i}. {icon} **{x["q"]}**')
        if x['type']=='choice' and x['opts']:
          for j,o in enumerate(x['opts']): A(f'   - {"✅" if j==x["ans"] else "✗"} {o}')
        else:
          tol=f' (هامش ±{x["tol"]})' if x['tol'] else ''
          A(f'   - 🔢 الإجابة: **{x["ans"]}**{tol}')
        if x['hint']: A(f'   - 💡 التلميح: {x["hint"]}')
        if x['steps']: A(f'   - 🪜 الخطوات: ' + ' ← '.join(x['steps']))
  missing=[c for c in bank if c not in placed]
  if missing:
    A('\n---\n\n# مفاهيم في البنك غير مربوطة بأي وحدة\n')
    for c in missing: A(f'- {c} — {names.get(c,"")} ({len(bank[c])} بنداً)')
  open(OUT,'w',encoding='utf-8').write('\n'.join(L)+'\n')
  print('written',OUT,'concepts placed',len(placed),'unplaced',missing,'items',total)
asyncio.run(main())
