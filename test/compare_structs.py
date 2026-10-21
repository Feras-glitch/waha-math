# يقارن البنى البيانية بين ملفين (المصدر القديم والناتج الجديد) داخل متصفح حقيقي، بعشوائية مثبّتة:
# الدروس (سلال، تمارين مولّدة، أخطاء، فوضى، ختام، تحدّي)، والنصوص العامة، والورشة، والصيد، وبطاقات الحوار.
# الاستعمال: python3 test/compare_structs.py <ملف A> <ملف B>
import asyncio, json, sys
from playwright.async_api import async_playwright
A, B = sys.argv[1], sys.argv[2]
SEED = "(() => { let s = 12345; Math.random = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; }; })();"
DUMP = """() => {
  const mk = f => { const o = f(); return o; };
  const NAMES = ['PRAISE','PRAISE2','TEST_INTRO','TEST_SCORE','TEST_AGAIN_LOW','TEST_AGAIN_NEAR','SOLVE','MS_AGAIN','MS_LATER','KIDS_WHO','HUNT_LINE','GAL_INTRO','GAL_EMPTY','HUNT_SAVED',
    'WS_INTRO','WS_PUZ','WS_TURN','WS_NO','WS_HINT','WS_SOLVED','WS_ALL','WS_FREE','WS_SAVED','REVIEW_INTRO','REVIEW_DONE','REVIEW_LATER','SESSION_BREAK','BIN_NAMES','ERRN','UNITS','HOSTS','HUNT','WS','TALK','NEUTRAL'];
  const out = { consts: {} }; for (const n of NAMES) out.consts[n] = eval(n);
  out.lessons = LESSONS.map(L => { const o = { id: L.id, title: L.title, icon: L.icon, hasHook: typeof L.hook, hasExplore: typeof L.explore, worked: (L.worked || []).length, hasBuild: typeof L.build, hasWrap: typeof L.wrap, wrapLines: L.wrapLines || null, homeTask: homeTask(L), talk: TALK[L.id] || null, chaos: L.chaos || null };
    if (L.sort) { const S = L.sort; o.sort = { bins: S.bins, intro: S.intro, ERR: S.ERR, msOk: S.msOk, praise: S.praise || null, kindOf: S.kindOf ? S.kindOf.toString() : null,
      practice: S.practice.map(mk), sets: S.sets.map(s => s.map(mk)), remedial: S.remedial.map(mk) };
      const items = [...o.sort.practice, ...o.sort.sets.flat(), ...o.sort.remedial];
      o.sort.reasons = items.map(it => { const i = { ...it }; if (S.kindOf) i.kind = S.kindOf(i); if (!i.riddle && !S.bins.includes(i.kind)) i.kind = 'other'; return [i.tag, i.kind, S.reason(i)]; });
      o.sort.errorOf = items.flatMap(it => S.bins.map(b => { const i = { ...it }; if (S.kindOf) i.kind = S.kindOf(i); if (!i.riddle && !S.bins.includes(i.kind)) i.kind = 'other'; return [i.tag, b, S.errorOf(i, b)]; }));
      o.sort.twins = items.map(it => [it.tag, S.twin(it)()]);
      o.sort.recall = S.recall.toString(); o.sort.showErr = S.showErr ? S.showErr.toString() : null; }
    if (L.test) { const T = L.test; o.test = { lessonOf: T.lessonOf, review: T.review, badgeLine: T.badgeLine, winLine: T.winLine, badgeName: T.badgeName, art: typeof T.art,
      items: T.items.map(Q => ({ id: Q.id, q: Q.q, ans: Q.ans, opts: Q.opts ? Q.opts() : null, show: Q.show ? Q.show() : null, choices: Q.choices || null })) }; }
    return o; });
  return out; }"""
async def dump(p, f):
  b = await p.chromium.launch(); pg = await b.new_page(); errs = []
  pg.on('pageerror', lambda e: errs.append(str(e)))
  await pg.add_init_script(SEED); await pg.goto('file://' + f + '#fast'); await pg.wait_for_timeout(400)
  d = await pg.evaluate(DUMP); await b.close(); return d, errs
async def main():
  async with async_playwright() as p:
    da, ea = await dump(p, A); db, eb = await dump(p, B)
  ja, jb = json.dumps(da, ensure_ascii=False, sort_keys=True, indent=1), json.dumps(db, ensure_ascii=False, sort_keys=True, indent=1)
  print('errors A', ea, '| errors B', eb)
  if ja == jb: print('IDENTICAL structures:', len(da['lessons']), 'lessons,', len(ja), 'chars'); return
  la, lb = ja.split('\n'), jb.split('\n'); import difflib
  diff = list(difflib.unified_diff(la, lb, 'A', 'B', lineterm='', n=1)); print('\n'.join(diff[:120])); print('DIFF lines', len(diff)); sys.exit(1)
asyncio.run(main())
