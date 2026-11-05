# فحوص قبول مراجعة الخصم الشاملة (5 نوفمبر 2026، على main 69049f1؛ المعرّفات من التقرير: C- للشيفرة، وX- للتفاعل، وA- للتقييم، وM- للمادة).
# كل فحص يخفق على 69049f1 ما لم يُذكر أنه ضابط (لا أخطاء في الصفحة، والسليم يبقى سليماً).
#   C-01 «بدء كل الدروس من جديد»: لا ينهار، ويحذف صور الطفل وحده قبل أي محو، وإخفاق حذفها لا يمحو شيئاً، وبعد إعادة الفتح كذلك.
#   C-02 بوابة الكبار بالزمن الحقيقي: جوابٌ خاطئ ثم «رجوع» ثم درس: لا تعود البوابة فوقه؛ وبلا «رجوع» يُعاد السؤال (ضابط).
#   X-06 مهلة البوابة لا تبقى بعد أن يعود الجهاز إلى الطفل: بعد إغلاق اللوحة يُسأل من جديد، و«درس إضافي» يُسأل دائماً.
# الاستعمال: python3 test/adv_run.py [ملف نسخة الفحص]   (ONLY=C-01,X-01 لبعضها؛ يخرج بـ 1 مع أي إخفاق)
import asyncio, json, os, sys
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
FILE = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'dist', 'واحة_الرياضيات.dev.html'))
FAST = 'file://' + FILE + '#fast&seed=5'
REAL = 'file://' + FILE + '#test&seed=5'   # الزمن الحقيقي: بلا #fast (المؤقتات والنطق كما عند الطفل)
ONLY = {x for x in os.environ.get('ONLY', '').split(',') if x}
FAILS = []
def on(k): return not ONLY or k in ONLY
def check(k, ok, what, info=''):
  print(('ok   ' if ok else 'FAIL ') + k + ' ' + what + ('' if ok else '  ' + json.dumps(info, ensure_ascii=False)[:900]), flush=True)
  if not ok: FAILS.append(k)
KID = {'id': 'k1', 'name': 'سلمى', 'gender': 'f', 'photo': '', 'avatar': 'f3'}
K2 = {'id': 'k2', 'name': 'علي', 'gender': 'm', 'photo': '', 'avatar': 'm2'}
async def reopen(pg): await pg.reload(); await pg.wait_for_timeout(300)
async def fresh(b, prog=None, kids=None, extra=None, url=FAST, vp=None):
  ctx = await b.new_context(viewport=vp or {'width': 412, 'height': 860}); pg = await ctx.new_page(); errs = []
  pg.on('pageerror', lambda e: errs.append(str(e)))
  await pg.goto(url); await pg.wait_for_timeout(250)
  kids = kids or [KID]
  await pg.evaluate("""([kids, prog, extra]) => { localStorage.clear(); localStorage.setItem('hp_kids', JSON.stringify(kids)); localStorage.setItem('hp_kid', JSON.stringify(kids[0].id));
    for (const k of kids) localStorage.setItem('hp_settings:' + k.id, JSON.stringify({ sessionMax: 0, muted: true }));
    localStorage.setItem('hp_prog:' + kids[0].id, JSON.stringify(Object.assign({ schema: 3 }, prog || {})));
    for (const [k, v] of Object.entries(extra || {})) localStorage.setItem(k, v); }""", [kids, prog or {}, extra or {}])
  await reopen(pg); return ctx, pg, errs
# صفوف قاعدة الصور مقروءةً بفتحٍ مستقل (لا بدوال التطبيق)
ROWS = """() => new Promise(res => { const r = indexedDB.open('hp_gallery', 1); r.onupgradeneeded = () => r.result.createObjectStore('photos', { keyPath: 'id' });
  r.onsuccess = () => { const db = r.result; const q = db.transaction('photos').objectStore('photos').getAll(); q.onsuccess = () => { res(q.result.map(x => x.id + ':' + x.kid).sort()); db.close(); }; q.onerror = () => res(null); }; r.onerror = () => res(null); })"""
PUTP = """async (rows) => { for (const [id, kid] of rows) await IDB.put({ id, kid, k: 'circle', t: 1, data: 'data:image/jpeg;base64,AA==' }); }"""
DONE = {'m1.u1.d1': {'done': True, 'at': 1, 'mastered': True}, 'srs': {'m1.u1.d1': {'C001': {'step': 1, 'due': 1}}}}

# ---------- C-01: بدء كل الدروس من جديد ----------
RST = """() => ({ prog: JSON.parse(localStorage.getItem('hp_prog:k1') || 'null'), log: JSON.parse(localStorage.getItem('hp_log:k1') || 'null'),
  designs: JSON.parse(localStorage.getItem('hp_designs:k1') || 'null'), mem: Object.keys(PROG).filter(k => /^m1\\./.test(k)), memSrs: Object.keys(PROG.srs || {}),
  panel: !document.querySelector('#panel').hidden, crash: !document.querySelector('#crashCover').hidden,
  msg: (document.querySelector('#resetMsg') || {}).textContent || '', home: window.__scene === 'home' || !!document.querySelector('#path'),
  errs: (LOG.errors || []).map(e => e.msg.split('\\n')[0]) })"""
async def press_reset(pg):
  await pg.evaluate("() => openPanel()"); await pg.wait_for_timeout(150)
  await pg.evaluate("() => { const d = [...document.querySelectorAll('#panel details')].find(x => x.querySelector('#resetAll')); if (d) d.open = true; }")
  await pg.click('#resetAll'); await pg.click('#resetAll'); await pg.wait_for_timeout(700)
async def c01_cases(b):
  extra = {'hp_log:k1': json.dumps({'attempts': [{'t': 1, 'lesson': 'm1.u1.d1', 'ok': True}], 'errors': [], 'faces': []}), 'hp_designs:k1': json.dumps([{'n': 1}]),
           'hp_prog:k2': json.dumps({'schema': 3, 'm1.u1.d1': {'done': True, 'at': 1}})}
  # (أ) النجاح: لا انهيار، ويُمحى التقدّم والسجل والتصاميم وصور الطفل وحده، وتُغلق اللوحة، وبعد إعادة الفتح كذلك
  ctx, pg, errs = await fresh(b, DONE, [KID, K2], extra)
  await pg.evaluate(PUTP, [['pa', 'k1'], ['pb', 'k1'], ['pc', 'k2']]); r0 = await pg.evaluate(ROWS)
  await press_reset(pg); s = await pg.evaluate(RST); r1 = await pg.evaluate(ROWS)
  check('C-01', r0 == ['pa:k1', 'pb:k1', 'pc:k2'] and not s['mem'] and not s['memSrs'] and s['prog'] and not [k for k in s['prog'] if k.startswith('m1.')] and not (s['prog'].get('srs') or {})
        and s['log'] and not s['log'].get('attempts') and s['designs'] == [] and r1 == ['pc:k2'] and not s['panel'] and not s['crash'] and not s['errs'],
        'بدء كل الدروس من جديد: يمحو تقدّم الطفل وسجلّه وتصاميمه وصوره، ولا يمسّ صور الطفل الآخر، ويغلق اللوحة بلا عطل', [s, r0, r1])
  await reopen(pg); s2 = await pg.evaluate(RST); r2 = await pg.evaluate(ROWS); k2 = await pg.evaluate("() => JSON.parse(localStorage.getItem('hp_prog:k2'))")
  check('C-01', not s2['mem'] and r2 == ['pc:k2'] and k2.get('m1.u1.d1', {}).get('done') and not s2['crash'], 'وبعد إعادة الفتح: لا يعود شيء، وتقدّم الطفل الآخر وصوره باقية', [s2, r2])
  check('C-01', not errs, 'لا أخطاء في الصفحة (بدء من جديد)', errs[:3]); await ctx.close()
  # (ب) إخفاق حذف الصور: لا يُمحى شيء، واللوحة تقول ذلك، وبعد زوال الإخفاق يكتمل
  ctx, pg, errs = await fresh(b, DONE, [KID, K2], extra)
  await pg.evaluate(PUTP, [['pa', 'k1'], ['pc', 'k2']])
  await pg.evaluate("() => { window.__d0 = IDBObjectStore.prototype.delete; IDBObjectStore.prototype.delete = function () { throw new DOMException('injected', 'UnknownError'); }; }")
  await press_reset(pg); s = await pg.evaluate(RST); r1 = await pg.evaluate(ROWS)
  check('C-01', s['mem'] == ['m1.u1.d1'] and s['prog'].get('m1.u1.d1', {}).get('done') and s['log'].get('attempts') and s['designs'] == [{'n': 1}] and r1 == ['pa:k1', 'pc:k2']
        and s['panel'] and 'تعذّر حذف صور' in s['msg'] and not s['crash'] and not s['errs'],
        'إخفاق حذف الصور: لا يُمحى تقدّم ولا سجلّ ولا تصميم ولا صورة، واللوحة باقية تقول إن شيئاً لم يُمحَ', [s, r1])
  await pg.evaluate("() => { IDBObjectStore.prototype.delete = window.__d0; }")
  await pg.click('#resetAll'); await pg.click('#resetAll'); await pg.wait_for_timeout(700); s3 = await pg.evaluate(RST); r3 = await pg.evaluate(ROWS)
  check('C-01', not s3['mem'] and r3 == ['pc:k2'] and not s3['panel'] and not s3['crash'], 'وبعد زوال الإخفاق: المحاولة من اللوحة نفسها تكمل البدء من جديد', [s3, r3])
  check('C-01', not errs, 'لا أخطاء في الصفحة (إخفاق حذف الصور)', errs[:3]); await ctx.close()

# ---------- C-02 وX-06: بوابة الكبار ----------
GATE = "() => ({ panel: !document.querySelector('#panel').hidden, gate: !!document.querySelector('#gateForm') && !document.querySelector('#panel').hidden, scene: window.__scene || '' })"
async def gate_wrong(pg):
  await pg.click('#adultBtn'); await pg.wait_for_timeout(200); a = await pg.evaluate("() => window.__gateAns")
  await pg.fill('#gateIn', str(a + 1)); await pg.click('#gateGo'); await pg.wait_for_timeout(150)
async def gate_pass(pg):   # وإن لم تسأل البوابة (المهلة قائمة) فاللوحة مفتوحة أصلاً
  await pg.click('#adultBtn'); await pg.wait_for_timeout(200)
  if not await pg.evaluate("() => !!document.querySelector('#gateIn')"): return
  a = await pg.evaluate("() => window.__gateAns"); await pg.fill('#gateIn', str(a)); await pg.click('#gateGo'); await pg.wait_for_timeout(300)
async def back_or_close(pg):
  await pg.evaluate("() => { const b = document.querySelector('#gateBack') || document.querySelector('#closePanel'); if (b) b.click(); }"); await pg.wait_for_timeout(300)
async def gate_cases(b):
  # C-02 (أ): خطأ ثم «رجوع» ثم بدء درس: بعد أربع ثوانٍ لا بوابة فوق الدرس
  ctx, pg, errs = await fresh(b, url=REAL); await gate_wrong(pg); await pg.click('#gateBack'); await pg.wait_for_timeout(100)
  await pg.evaluate("() => { runLesson('m1.u1.d1'); }"); await pg.wait_for_timeout(4000); st = await pg.evaluate(GATE)
  check('C-02', not st['gate'] and not st['panel'] and st['scene'].startswith('m1.u1.d1'), 'جواب خاطئ ثم «رجوع» ثم درس: لا تعود البوابة وحدها فوق الدرس', st)
  check('C-02', not errs, 'لا أخطاء في الصفحة (البوابة بعد «رجوع»)', errs[:3]); await ctx.close()
  # C-02 (ب) ضابط: خطأ بلا «رجوع»: يُعاد السؤال بعد المهلة، والزرّ يعمل
  ctx, pg, errs = await fresh(b, url=REAL); await gate_wrong(pg); q1 = await pg.evaluate("() => window.__gateAns"); await pg.wait_for_timeout(3600)
  st = await pg.evaluate(GATE); en = await pg.evaluate("() => !!document.querySelector('#gateGo') && !document.querySelector('#gateGo').disabled")
  check('C-02', st['gate'] and en, 'ضابط: جواب خاطئ بلا «رجوع»: يُعاد السؤال بعد المهلة وزرّ المتابعة يعمل', [st, en, q1])
  await ctx.close()
  # X-06 (أ): بعد أن يجتاز الكبير البوابة ثم يغلق اللوحة، «للكبار» يسأل من جديد
  ctx, pg, errs = await fresh(b, url=REAL); await gate_pass(pg); st0 = await pg.evaluate(GATE)
  await pg.click('#closePanel'); await pg.wait_for_timeout(300); await pg.click('#adultBtn'); await pg.wait_for_timeout(300); st = await pg.evaluate(GATE)
  check('X-06', st0['panel'] and not st0['gate'] and st['gate'], 'بعد أن يغلق الكبير اللوحة: «للكبار» يسأل من جديد (لا مهلة بعد أن عاد الجهاز إلى الطفل)', [st0, st])
  # X-06 (ب): «درس إضافي» في غطاء الاستراحة يُسأل دائماً، ولو كانت المهلة قائمة
  await back_or_close(pg); await gate_pass(pg); await pg.evaluate("() => { document.querySelector('#panel').hidden = true; window.__more = 0; breakScene(() => { window.__more = 1; }); }")
  await pg.wait_for_timeout(300); await pg.click('#moreBtn'); await pg.wait_for_timeout(300); st = await pg.evaluate(GATE); more = await pg.evaluate("() => window.__more")
  check('X-06', st['gate'] and more == 0, '«درس إضافي» في غطاء الاستراحة يسأل الكبير دائماً، ولا يبدأ الدرس بلا جواب', [st, more])
  if st['gate']: a = await pg.evaluate("() => window.__gateAns"); await pg.fill('#gateIn', str(a)); await pg.click('#gateGo'); await pg.wait_for_timeout(300)
  more = await pg.evaluate("() => window.__more")
  check('X-06', more == 1, 'ضابط: وبالجواب الصحيح يبدأ الدرس الإضافي', more)
  check('X-06', not errs, 'لا أخطاء في الصفحة (مهلة البوابة)', errs[:3]); await ctx.close()

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch()
    if on('C-01'): await c01_cases(b)
    if on('C-02') or on('X-06'): await gate_cases(b)
    await b.close()
  print('FAILS:', len(FAILS)); sys.exit(1 if FAILS else 0)
asyncio.run(main())
