# كل بند فرز في كل درس، ولكل سلّة خاطئة: أيّ وسم خطأ يُسجَّل؟ لا يسقط شيء إلى السؤال العام generic (D253 (4))،
# ولا يُعلَّل شيء بنفي نوعه (البند المشتبك في سلال درس آخر). الاستعمال: python3 test/sort_errors.py
import asyncio, os, sys
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
FILE = os.environ.get('FILE', os.path.join(HERE, '..', 'dist', 'واحة_الرياضيات.dev.html'))
JS = """() => { const out = [], seen = new Set();
  const visit = (v, L, where) => { if (Array.isArray(v)) return v.forEach(x => visit(x, L, where)); if (!v || typeof v !== 'object') return;
    if (v.t === 'sort') for (let rep = 0; rep < 3; rep++) { CUR = L; const it = ITEM.sort.make(v);
      for (const b of it.bins || []) { if (b === it.kind || (it.accept || []).includes(b)) continue; const j = ITEM.sort.judge(it, b);
        const key = L.id + '|' + JSON.stringify(v.mk) + '|' + b; if (!seen.has(key)) { seen.add(key); out.push([L.id, where, JSON.stringify(v.mk), it.kind, b, j.err]); } } }
    for (const [k, x] of Object.entries(v)) if (!['lines', 'labels'].includes(k)) visit(x, L, where); };
  for (const L of Object.values(LDATA)) { visit(L.practice, L, 'practice'); visit(L.mastery && L.mastery.concepts, L, 'mastery'); visit(L.mastery && L.mastery.remedial, L, 'remedial');
    visit(L.review, L, 'review'); visit(L.test && L.test.items, L, 'test'); visit(L.flow, L, 'flow'); visit(L.sort && L.sort.twins, L, 'twins');
    if (L.mastery && L.mastery.mixed) visit(L.mastery.mixed.item, LDATA[L.mastery.mixed.lesson], 'mixed@' + L.id); }
  const why = []; for (const L of Object.values(LDATA)) { const M = L.mastery && L.mastery.mixed; if (!M || itemType(M.item) !== 'sort') continue;
    CUR = LDATA[M.lesson]; const it = ITEM.sort.make(M.item); const id = ITEM.sort.reason(it); if (it.kind === 'other' && it.trueKind !== 'other' && !/notHere/.test(id || '')) why.push([L.id, JSON.stringify(M.item.mk), id]); }
  return { out, why }; }"""
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); pg = await (await b.new_context()).new_page()
    await pg.goto('file://' + os.path.abspath(FILE) + '#fast&seed=7'); await pg.wait_for_timeout(500)
    r = await pg.evaluate(JS); gen = [x for x in r['out'] if x[5] == 'generic']
    print('sort judgments:', len(r['out']), '· generic:', len(gen), '· mixed reasons negating the kind:', len(r['why']))
    for x in gen + r['why']: print(' ', x)
    await b.close(); sys.exit(1 if gen or r['why'] else 0)
asyncio.run(main())
