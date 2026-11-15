# فحوص قبول إصلاحات الألعاب بعد تجربة فراس نسخة الويب (15 نوفمبر 2026، D267)؛ كل فحص يخفق على 6e2e386 ما لم يُذكر أنه ضابط:
#   STORY  «قصص الواحة»: القصة باقية في الفقاعة وقت البناء ووقت «كم معنا الآن؟»، وعدداها رقمان على المسرح؛ و«تمّ» ببرجٍ يخالف القصة
#          لا تسأل «كم؟»: «لا يطابق القصة بعد» والبرج كما بناه، ثم تلميحها، ثم نمثّلها معاً؛ والجواب عدد البرج، ولا يُحسب من أول محاولة (وفي المراجعة كذلك).
#   MINUS  «أبعد» تنطق العدد الجديد كـ«أضف»: بعد ثلاث إضافات وإبعادٍ آخر عددٍ مسموع عدد البرج (بزمنٍ حقيقي وصوتٍ غير مكتوم).
#   OFFER  عرض «هل نفكّر معاً؟» يُسمع والسؤال باقٍ في الفقاعة.
#   FRAME  لعبة «أكمل الإطار»: التعليمة كاملة بعددها في الجولات الثلاث.
#   TEN    قصص «نكوّن العشرة أولاً» و«نرجع إلى العشرة» باقية في الفقاعة وقت العمل ووقت السؤال؛ و«…عددها ستة. ابدئي…» بفاصلٍ بعد العدد؛
#          وحين يمتلئ الإطار (والحافلة) تومض القطع الزرقاء كلها، ما دخله وما بقي خارجه.
#   DRAW   «أيّ الجملتين تناسب الصورة؟»: السهم برأس؛ والمكعب الأبيض بحدٍّ غير أبيض.
# والضوابط (تنجح على 6e2e386 أيضاً): «الصحيح من أول محاولة»، والجولة الأولى في «أكمل الإطار» وانتهاء اللعبة، و«بلا خطأ في الصفحة».
# الاستعمال: python3 test/games_run.py [ملف نسخة الفحص]   (ONLY=STORY,MINUS لبعضها؛ يخرج بـ 1 مع أي إخفاق)
import asyncio, json, os, re, sys
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
FILE = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'dist', 'واحة_الرياضيات.dev.html'))
ONLY = {x for x in os.environ.get('ONLY', '').split(',') if x}
FAILS = []
def on(k): return not ONLY or k in ONLY
def check(k, ok, what, info=''):
  print(('ok   ' if ok else 'FAIL ') + k + ' ' + what + ('' if ok else '  ' + json.dumps(info, ensure_ascii=False)[:900]), flush=True)
  if not ok: FAILS.append(k)
KID = {'id': 'k1', 'name': 'سلمى', 'gender': 'f', 'photo': '', 'avatar': 'f3'}
async def page(b, fast=True):
  ctx = await b.new_context(viewport={'width': 393, 'height': 851}); pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
  await pg.goto('file://' + FILE + ('#fast&seed=5' if fast else '#test&seed=5')); await pg.wait_for_timeout(250)
  await pg.evaluate("""([kid, muted]) => { localStorage.clear(); localStorage.setItem('hp_kids', JSON.stringify([kid])); localStorage.setItem('hp_kid', JSON.stringify(kid.id));
    localStorage.setItem('hp_settings:' + kid.id, JSON.stringify({ sessionMax: 0, muted })); localStorage.setItem('hp_prog:' + kid.id, JSON.stringify({ schema: 3, unlockAll: true })); }""", [KID, fast])
  await pg.reload(); await pg.wait_for_timeout(400); return ctx, pg, errs
START = """([lid, spec, mode]) => { hush(); CUR = LDATA[lid]; FLOW++; show('lesson'); window.__res = null; window.__err = null; window.__clips = [];
  const p = typeof spec === 'number' ? (() => { const st = LDATA[lid].flow[spec]; return SCENES[st.scene](st, LDATA[lid]); })() : runItem(spec, mode, { scene: mode });
  p.then(r => { window.__res = { ok: !!(r && r.ok), first: !!(r && r.firstTry) }; }, e => { window.__err = String(e && e.message || e); }); }"""
ST = """() => { const a = window.__auto, st = document.querySelector('#stage'), svg = st && st.querySelector('svg');
  const cubes = svg ? [...svg.querySelectorAll('g')].filter(g => g.querySelector(':scope > polygon[data-face]')).length : 0;
  return { say: (document.querySelector('#say') || {}).textContent || '', auto: a ? { n: a.n, kind: a.kind } : null, res: window.__res, err: window.__err, clips: window.__clips || [],
    nums: st ? [...st.querySelectorAll('.choices.nums button')].map(b => +b.dataset.k) : [], cubes, storyNums: st ? [...st.querySelectorAll('[data-story-num]')].map(g => +g.dataset.storyNum) : [],
    glow: document.querySelector('#helpBtn') ? document.querySelector('#helpBtn').classList.contains('glow') : null }; }"""
FLASH = "() => { const f = [...document.querySelectorAll('#stage svg [data-counter][data-flash]')]; return [f.length, f.filter(k => k.closest('[data-frame]')).length, f.filter(k => !k.closest('[data-frame]')).length]; }"
async def until(pg, pred, t=20000):
  """ينتظر حالةً تحقّق pred، ويعيدها (أو آخر حالة عند المهلة)"""
  st = None
  for _ in range(t // 50):
    st = await pg.evaluate(ST)
    if st['err'] or pred(st): return st
    await pg.wait_for_timeout(50)
  return st
def wait_kind(kind, after=-1): return lambda s: s['auto'] and s['auto']['kind'] == kind and s['auto']['n'] != after
async def ok_now(pg): await pg.evaluate("() => { const a = window.__auto; if (a) a.ok(); }")
async def tap(pg, k): await pg.click('#stage .build [data-k="%s"]' % k, timeout=8000)
S01 = {'t': 'story', 'op': '+', 'a': 3, 'b': 2, 'line': 'gen.story.s01'}
S02 = {'t': 'story', 'op': '-', 'a': 6, 'b': 2, 'line': 'gen.story.s02'}

async def story(b):
  ctx, pg, errs = await page(b)
  # (1) الطريق الصحيح: القصة في الفقاعة والتعليمة مسموعة، والعددان رقمان؛ ثم السؤال بعد القصة
  await pg.evaluate(START, ['m1.u2.d5', S01, 'practice']); st = await until(pg, wait_kind('story'))
  check('STORY', 'ثَلَاثُ تَمَرَاتٍ' in st['say'] and 'المُكَعَّبَاتِ كَمَا' not in st['say'] and any(c.startswith('gen.story.add') for c in st['clips']),
        'وقت البناء: القصة في الفقاعة، و«أضيفي المكعبات كما في القصة» مسموعة لا تمحوها', st['say'])
  check('STORY', st['storyNums'] == [3, 2], 'عددا القصة رقمان على المسرح (٣ ثم ٢)', st['storyNums'])
  a0 = st['auto']['n']; await ok_now(pg); st = await until(pg, wait_kind('num', a0))
  check('STORY', 'ثَلَاثُ تَمَرَاتٍ' in st['say'] and 'كَمْ مَعَنَا الآنَ؟' in st['say'] and st['storyNums'] == [3, 2], 'وقت «كم معنا الآن؟»: القصة والسؤال في الفقاعة، والرقمان باقيان', st['say'])
  await ok_now(pg); st = await until(pg, lambda s: s['res']); check('STORY', st['res'] == {'ok': True, 'first': True} and not errs, 'والصحيح من أول محاولة', [st['res'], errs[:1]])
  # (2) برجٌ يخالف القصة: لا سؤال، والبرج كما بناه، ثم يصلحه فيكون جوابه ما يراه
  for mode in ('practice', 'review'):
    await pg.evaluate(START, ['m1.u2.d5', S01, mode]); st = await until(pg, wait_kind('story')); a0 = st['auto']['n']
    await tap(pg, 'plus'); await pg.wait_for_timeout(120); await tap(pg, 'done')
    st = await until(pg, lambda s: any(c.startswith('gen.story.notYet') for c in s['clips']) or s['nums'])
    check('STORY', not st['nums'] and st['cubes'] == 4 and any(c.startswith('gen.story.notYet') for c in st['clips']),
          '(%s) «تمّ» ببرجٍ من أربعة: لا «كم؟»، بل «برجكِ لا يطابق القصة بعد»، والبرج أربعة كما بناه' % mode, [st['nums'], st['cubes'], st['clips'][-4:]])
    st = await until(pg, wait_kind('story', a0)); check('STORY', 'ثَلَاثُ تَمَرَاتٍ' in st['say'] and st['cubes'] == 4, '(%s) ثم تُعاد القصة، والبرج باقٍ ليصلحه' % mode, [st['say'], st['cubes']])
    await tap(pg, 'plus'); await pg.wait_for_timeout(120); await tap(pg, 'done'); st = await until(pg, lambda s: s['nums'])
    check('STORY', st['cubes'] == 5 and 5 in st['nums'], '(%s) أصلحه فصار خمسة: «كم؟» وبين الخيارات عدد برجه' % mode, [st['cubes'], st['nums']])
    await pg.click('#stage .choices.nums button[data-k="5"]', timeout=8000); st = await until(pg, lambda s: s['res'])
    check('STORY', st['res'] == {'ok': True, 'first': False} and not errs, '(%s) جوابه عدد برجه صحيح، ولا يُحسب من أول محاولة' % mode, [st['res'], errs[:1]])
  # (3) ثلاث مرات يخالفها: التلميح في الثانية، ونمثّلها معاً في الثالثة؛ وفي الإبعاد كذلك
  for spec, want in ((S01, 5), (S02, 4)):
    await pg.evaluate(START, ['m1.u2.d5', spec, 'practice']); last = -1
    for i in range(3):
      st = await until(pg, wait_kind('story', last)); last = st['auto']['n']; await tap(pg, 'done')
      if i < 2: await until(pg, lambda s: s['auto'] and s['auto']['n'] != last)
    st = await until(pg, lambda s: s['nums'], 30000); hint = 'gen.story.hintAdd' if spec['op'] == '+' else 'gen.story.hintRemove'
    check('STORY', st['cubes'] == want and any(c.startswith(hint) for c in st['clips']) and any(c.startswith('gen.story.together') for c in st['clips']) and spec['line'] in ' '.join(st['clips']),
          '%s: ثلاث مرات «تمّ» بالبرج الأول: تلميح القصة، ثم «نمثّل القصة معاً» فيصير البرج %d، ثم «كم؟»' % (spec['op'], want), [st['cubes'], st['clips'][-8:]])
    await ok_now(pg); st = await until(pg, lambda s: s['res']); check('STORY', st['res'] == {'ok': True, 'first': False}, '%s: ولا يُحسب من أول محاولة' % spec['op'], st['res'])
  # (4) بعد خطأ العدّ يبقى البرج مبنياً كما في القصة، والقصة في الفقاعة
  await pg.evaluate(START, ['m1.u2.d5', S01, 'practice']); st = await until(pg, wait_kind('story')); a0 = st['auto']['n']; await ok_now(pg)
  st = await until(pg, wait_kind('num', a0)); a1 = st['auto']['n']; await pg.evaluate("() => window.__auto.wrong()")
  st = await until(pg, wait_kind('num', a1), 30000)
  check('STORY', st['cubes'] == 5 and 'ثَلَاثُ تَمَرَاتٍ' in st['say'] and 'كَمْ مَعَنَا الآنَ؟' in st['say'], 'بعد خطأ العدّ: البرج خمسة كما في القصة، والقصة والسؤال في الفقاعة', [st['cubes'], st['say']])
  await ok_now(pg); await until(pg, lambda s: s['res']); check('STORY', not errs, 'بلا خطأ في الصفحة', errs[:2]); await ctx.close()

async def minus(b):
  ctx, pg, errs = await page(b, fast=False)
  await pg.evaluate(START, ['m1.u2.d5', S01, 'practice']); await pg.wait_for_selector('#stage .build [data-k="plus"]'); await until(pg, wait_kind('story'), 30000)
  for k in ('plus', 'plus', 'plus', 'minus'): await tap(pg, k); await pg.wait_for_timeout(1300)
  num = lambda s: [c for c in s['clips'] if c.startswith('gen.numw.')]
  st = await until(pg, lambda s: num(s)[-1:] == ['gen.numw.05'] and len(num(s)) >= 4, 8000); nums = num(st)   # العدد ينتظر دور ما قبله في الطابور
  check('MINUS', st['cubes'] == 5 and nums[-1:] == ['gen.numw.05'], 'ثلاث إضافات ثم إبعاد: البرج خمسة، وآخر عددٍ مسموع «خمسة» لا «ستة»', [st['cubes'], nums[-4:]])
  check('MINUS', not errs, 'بلا خطأ في الصفحة', errs[:2]); await ctx.close()

async def offer(b):
  ctx, pg, errs = await page(b)
  await pg.evaluate(START, ['m1.u2.d5', S01, 'practice']); st = await until(pg, wait_kind('story')); before = st['say']
  st = await until(pg, lambda s: any(c.startswith('gen.hintOffer') for c in s['clips']), 15000); await pg.wait_for_timeout(300); st = await pg.evaluate(ST)
  check('OFFER', any(c.startswith('gen.hintOffer') for c in st['clips']) and st['glow'] and st['say'] == before and 'ثَلَاثُ تَمَرَاتٍ' in st['say'],
        'عرض «هل نفكّر معاً؟» مسموع والفانوس يتوهّج، والقصة باقية في الفقاعة', [st['say'], before, st['glow']])
  check('OFFER', not errs, 'بلا خطأ في الصفحة', errs[:2]); await ctx.close()

async def frame(b):
  ctx, pg, errs = await page(b)
  await pg.evaluate(START, ['m1.u4.d6', 3, 'game']); last = -1; seen = []
  for i, w in enumerate(('ثَلَاثَة', 'خَمْسَة', 'اثْنَان')):
    st = await until(pg, wait_kind('tap', last)); last = st['auto']['n']; seen.append(st['say'])
    check('FRAME', 'يَكْتَمِلُ بِهَذَا العَدَدِ' in st['say'] and w in st['say'], 'الجولة %d: التعليمة كاملة بعددها في الفقاعة' % (i + 1), st['say'])
    await ok_now(pg)
  st = await until(pg, lambda s: s['res']); check('FRAME', st['res'] is not None and not errs, 'وتنتهي اللعبة بلا خطأ', [st['res'], errs[:1]]); await ctx.close()

async def ten(b):
  ctx, pg, errs = await page(b)
  for spec, words, kinds in (({'t': 'makeTen', 'a': 7, 'b': 6, 'ask': 'total', 'story': 'pr.st2'}, 'سَبْعَةُ مَشَابِكَ', ('frameMove', 'num')),
                             ({'t': 'backTen', 'a': 12, 'b': 5, 'story': 'pr.st4'}, 'بُرْتُقَالَةً', ('frameTake', 'num'))):
    await pg.evaluate(START, ['m1.u4.d7', spec, 'practice']); last = -1
    for k in kinds:
      st = await until(pg, wait_kind(k, last)); last = st['auto']['n']
      check('TEN', words in st['say'], '%s: القصة في الفقاعة وقت %s' % (spec['t'], k), st['say'])
      if spec['t'] == 'makeTen' and k == 'num':
        fl = await pg.evaluate(FLASH); check('TEN', fl == [6, 3, 3], 'makeTen: حين امتلأ الإطار ومضت الزرقاء الست كلها: ثلاث فيه وثلاث خارجه', fl)
      await ok_now(pg)
    await until(pg, lambda s: s['res'])
  # ولعبة «حافلة الواحة»: الجولة الأولى 7 و5، فحين تمتلئ يومض الركّاب الخمسة الجدد: ثلاثة صعدوا واثنان ينتظرون
  await pg.evaluate(START, ['m1.u4.d7', 3, 'game']); st = await until(pg, wait_kind('frameMove')); a0 = st['auto']['n']; await ok_now(pg)
  st = await until(pg, wait_kind('num', a0)); fl = await pg.evaluate(FLASH)
  check('TEN', fl == [5, 3, 2], '«حافلة الواحة»: حين امتلأت ومض الركّاب الخمسة الجدد كلهم: ثلاثة فيها واثنان ينتظرون', fl)
  for _ in range(12):
    st = await until(pg, lambda s: s['res'] or s['auto'], 8000)
    if st['res']: break
    await ok_now(pg); await pg.wait_for_timeout(60)
  await pg.evaluate(START, ['m1.u4.d7', {'t': 'backTen', 'a': 14, 'b': 6}, 'practice']); st = await until(pg, wait_kind('frameTake'))
  check('TEN', re.search(r'سِتَّة\. اِبْدَئِي', st['say']) is not None, '«أبعدي قطعاً عددها ستة. ابدئي بالتي خارج الإطار»: فاصلٌ بعد العدد', st['say'])
  await ok_now(pg); st = await until(pg, wait_kind('num')); await ok_now(pg); await until(pg, lambda s: s['res'])
  check('TEN', not errs, 'بلا خطأ في الصفحة', errs[:2]); await ctx.close()

async def draw(b):
  ctx, pg, errs = await page(b)
  for op in ('+', '-'):
    await pg.evaluate(START, ['m1.u2.d5', {'t': 'sentence', 'op': op, 'a': 6, 'b': 2}, 'practice']); await until(pg, wait_kind('sentence'))
    n = await pg.evaluate("() => document.querySelectorAll('#stage svg [data-arrowhead]').length")
    check('DRAW', n == 1, '«أيّ الجملتين…» (%s): للسهم رأس' % op, n); await ok_now(pg); await until(pg, lambda s: s['res'])
  await pg.evaluate(START, ['m1.u2.d5', {'t': 'join', 'a': 4, 'b': 3}, 'practice']); await until(pg, wait_kind('tap'))
  w = await pg.evaluate("() => { const st = [...document.querySelectorAll('#stage svg polygon[data-face]')].map(p => p.getAttribute('stroke')); const E = typeof CUBE_EDGE_W === 'undefined' ? '#ffffff' : CUBE_EDGE_W; return [st.filter(s => s === E).length, st.length, E]; }")
  check('DRAW', w[0] >= 3 * 2 and w[2].lower() != '#ffffff', 'المكعبات البيضاء الثلاثة بحدٍّ غير أبيض', w)
  await ok_now(pg); st = await until(pg, wait_kind('num')); await ok_now(pg); await until(pg, lambda s: s['res'])
  check('DRAW', not errs, 'بلا خطأ في الصفحة', errs[:2]); await ctx.close()

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch()
    for k, f in (('STORY', story), ('MINUS', minus), ('OFFER', offer), ('FRAME', frame), ('TEN', ten), ('DRAW', draw)):
      if not on(k): continue
      try: await f(b)
      except Exception as e: check(k, False, 'توقّف القسم باستثناء', str(e)[:300])   # (على النسخة القديمة يمضي البند إلى «كم؟» فلا تُلمس أزرار البناء)
    await b.close()
  print('FAILS: %d' % len(FAILS)); sys.exit(1 if FAILS else 0)
asyncio.run(main())
