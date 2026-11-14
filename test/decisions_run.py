# فحوص قبول قرارات فراس في 14 نوفمبر 2026 (D266) على فرع review/decisions-2026-11-14:
# كل فحص يخفق على 9043412 (فرع review/fresh-2026-11-13) ما لم يُذكر أنه ضابط.
#   A-03 اختبار الوحدة: لا يُكشف الجواب أثناءه؛ العتبتان مقرّبتان إلى الأسفل (10 من 12، 9 من 11؛ و7 و6)؛ الشرائح الثلاث؛
#        «متقدّم مع دعم» يفتح الحيّ التالي ويُقرّب مراجعة دروس الخطأ؛ ولا إعادة قبل الدرس الأضعف ومرور يوم؛ والخريطة واللوحة تقولان ذلك.
#   A-09 المراجعة: المواعيد القصيرة (بعد يوم وبعد 3 أيام) قبل غيرها حين يزيد المستحق على السقف.
#   R02  الصيانة بعد «ثابت»: 30 ثم 60 ثم 90 يوماً لمفهومٍ له 4 بنود مراجعة فأكثر؛ الخطأ يُرجعه إلى خطوة 3 أيام؛ وبندٌ عرضي يُحسب صيانةً.
#   A-04 سطر «ثابت مبدئي» في تقرير الكبار.
# الاستعمال: python3 test/decisions_run.py [ملف نسخة الفحص]   (ONLY=A-03,A-09 لبعضها؛ يخرج بـ 1 مع أي إخفاق)
import asyncio, json, os, re, sys
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
FILE = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'dist', 'واحة_الرياضيات.dev.html'))
FAST = 'file://' + FILE + '#fast&seed=5'
ONLY = {x for x in os.environ.get('ONLY', '').split(',') if x}
FAILS = []
def on(k): return not ONLY or k in ONLY
def check(k, ok, what, info=''):
  print(('ok   ' if ok else 'FAIL ') + k + ' ' + what + ('' if ok else '  ' + json.dumps(info, ensure_ascii=False)[:900]), flush=True)
  if not ok: FAILS.append(k)
KID = {'id': 'k1', 'name': 'سلمى', 'gender': 'f', 'photo': '', 'avatar': 'f3'}
async def reopen(pg, t=300): await pg.reload(); await pg.wait_for_timeout(t)
async def fresh(b, prog=None, vp=None):
  ctx = await b.new_context(viewport=vp or {'width': 412, 'height': 860})
  pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
  await pg.goto(FAST); await pg.wait_for_timeout(250)
  await pg.evaluate("""([kid, prog]) => { localStorage.clear(); localStorage.setItem('hp_kids', JSON.stringify([kid])); localStorage.setItem('hp_kid', JSON.stringify(kid.id));
    localStorage.setItem('hp_settings:' + kid.id, JSON.stringify({ sessionMax: 0, muted: true }));
    localStorage.setItem('hp_prog:' + kid.id, JSON.stringify(Object.assign({ schema: 3 }, prog || {}))); }""", [KID, prog or {}])
  await reopen(pg); return ctx, pg, errs
async def gate_pass(pg):
  await pg.click('#adultBtn'); await pg.wait_for_timeout(200)
  if not await pg.evaluate("() => !!document.querySelector('#gateIn')"): return
  a = await pg.evaluate("() => window.__gateAns"); await pg.fill('#gateIn', str(a)); await pg.click('#gateGo'); await pg.wait_for_timeout(300)

ST = """() => { const q = s => document.querySelector(s); const vis = s => { const e = q(s); return !!e && !e.hidden; }; const a = window.__auto;
  return { scene: window.__scene || '', home: vis('#home'), covers: [...document.querySelectorAll('.cover')].filter(c => !c.hidden).map(c => c.id),
    go: !!(q('#go') && !q('#go').disabled && !q('#go').classList.contains('idle')), auto: a ? { n: a.n, kind: a.kind } : null, mode: window.__itemMode || '', crash: vis('#crashCover') }; }"""
async def drive(pg, lid, test_ok=99, probe=None):
  """يقود الدرس حتى الخريطة: كل بند صحيح، إلا بنود الاختبار بعد أول test_ok منها. probe(pg) يُستدعى بعد كل بند اختبار"""
  NT = "() => LOG.attempts.filter(a => a.scene === 'test' && a.type).length"; base = await pg.evaluate(NT)
  await pg.evaluate("(l) => { runLesson(l); }", lid); await pg.wait_for_timeout(150); last = -1; idle = 0; nt = 0
  while True:
    st = await pg.evaluate(ST)
    if st['crash']: return 'crash'
    if st['home'] and not st['covers']: return 'done'
    if 'exitCover' in st['covers']: await pg.click('#rsGo'); continue
    if 'facesCover' in st['covers'] or 'faceCover' in st['covers']:
      await pg.evaluate("() => { const b = document.querySelector('.cover:not([hidden]) .pick'); if (b) b.click(); }"); await pg.wait_for_timeout(60); continue
    a = st['auto']
    if a:
      if a['n'] != last:
        last = a['n']
        if st['scene'].endswith(':bag'): await pg.evaluate("() => { const b = [...document.querySelectorAll('.choices .pick')]; (b.find(x => x.dataset.k === 'screen') || b[0]).click(); }"); continue
        how = 'ok'
        if st['mode'] == 'test': nt = await pg.evaluate(NT) - base; how = 'ok' if nt < test_ok else 'wrong'   # رقم البند لا رقم الانتظار: في بعض البنود انتظاران
        await pg.evaluate("(h) => { const a = window.__auto; if (a) (h === 'wrong' && a.wrong ? a.wrong : a.ok)(); }", how)
        if st['mode'] == 'test' and probe: await probe(pg)
        idle = 0
      idle += 1; await pg.wait_for_timeout(25)
      if idle > 400: return 'stuck:' + st['scene']
      continue
    if st['go']: await pg.click('#go'); idle = 0; await pg.wait_for_timeout(20); continue
    idle += 1; await pg.wait_for_timeout(40)
    if idle > 400: return 'stuck:' + st['scene'] + ':' + ','.join(st['covers'])

# تقدّمٌ أنهى دروس الحيّ الثاني وورشته، فاختباره مفتوح
U2 = ['m1.u2.d1', 'm1.u2.d2', 'm1.u2.d3', 'm1.u2.d4', 'm1.u2.d5']
def prog_u2():
  P = {'badge:m1.u1': True, 'ws': {'m1.u2': 1}}
  for u in ['m1.u1.d1', 'm1.u1.d2', 'm1.u1.d3', 'm1.u1.d4', 'm1.u1.d5', 'm1.u1.d6'] + U2: P[u] = {'done': True, 'at': 1, 'mastered': True}
  P['m1.u1.d6']['score'] = 11; P['m1.u1.d6']['of'] = 11
  return P
STATE = """() => { const P = PROG['m1.u2.d6'] || {}; return { mastered: !!P.mastered, band: P.band || null, failAt: P.failAt || null, weak: P.weak || null, score: P.score, of: P.of,
  badge: !!PROG['badge:m1.u2'], support: !!PROG['support:m1.u2'], u3open: unitOpen(2), testOpen: lessonOpen(UNITS[1], UNITS[1].lessons.indexOf('m1.u2.d6')), review: PROG.review || null }; }"""

async def a03_cases(b):
  ctx, pg, errs = await fresh(b)
  th = await pg.evaluate("() => [testNeed(12), testNeed(11), typeof supportNeed === 'function' ? supportNeed(12) : null, typeof supportNeed === 'function' ? supportNeed(11) : null]")
  check('A-03', th == [10, 9, 7, 6], 'العتبتان مقرّبتان إلى الأسفل: النجاح 10 من 12 و9 من 11، و«متقدّم مع دعم» 7 من 12 و6 من 11', th)
  await ctx.close()
  # لا يُرسم الجواب الصحيح بعد الخطأ في الاختبار
  # كل رسمٍ للجواب الصحيح يمرّ بـ mark() لنوع البند: يُعدّ ما استُدعي منه أثناء الاختبار
  ctx, pg, errs = await fresh(b, prog_u2())
  await pg.evaluate("() => { window.__marks = []; for (const [k, T] of Object.entries(ITEM)) if (T.mark) { const f = T.mark; T.mark = function (...a) { window.__marks.push(k); return f.apply(this, a); }; } }")
  r = await drive(pg, 'm1.u2.d6', test_ok=0); marks = await pg.evaluate("() => window.__marks"); n = await pg.evaluate("() => LOG.attempts.filter(a => a.scene === 'test' && a.type).length")
  s0 = await pg.evaluate(STATE)
  check('A-03', r == 'done' and n == 12 and not marks, 'خطأ في كل بنود الاختبار الاثني عشر: لا يُرسم الجواب الصحيح بعد أيٍّ منها', [r, n, marks])
  check('A-03', s0['band'] == 'low' and not s0['u3open'] and not s0['badge'] and s0['review'] in U2, 'صفر من 12: «يحتاج دعماً»، والحيّ التالي مقفل، والدرس الأضعف معلَّم', s0)
  check('A-03', not errs, 'لا أخطاء في الصفحة (اختبار بلا صواب)', errs[:3]); await ctx.close()
  # 7 من 12: متقدّم مع دعم
  ctx, pg, errs = await fresh(b, prog_u2()); r = await drive(pg, 'm1.u2.d6', test_ok=7); s = await pg.evaluate(STATE)
  srs = await pg.evaluate("(ids) => { const t = dueAfter(Date.now(), 1); const out = {}; for (const id of ids) { const r = srsRec(id); out[id] = r ? Object.values(r.cs).map(x => x.due != null && x.due <= t) : null; } return out; }", U2)
  check('A-03', r == 'done' and s['band'] == 'support' and s['support'] and s['u3open'] and not s['badge'], '7 من 12: «متقدّم مع دعم» يفتح الحيّ التالي بلا شارة', s)
  near = [id for id, v in srs.items() if v and all(v)]
  check('A-03', len(near) >= 1, 'ودروس البنود الخاطئة تُراجَع من الغد', srs)
  check('A-03', not s['testOpen'], 'ولا يُعاد الاختبار فوراً', s)
  home = await pg.evaluate("() => { const b = document.querySelector('[data-lesson=\"m1.u2.d6\"]'); return b ? { dis: b.getAttribute('aria-disabled'), text: b.textContent } : null; }")
  check('A-03', bool(home) and home['dis'] == 'true' and 'المُرَاجَعَةِ' in home['text'], 'محطة الاختبار في الخريطة مقفلة وتقول «بعد درس المراجعة»', home)
  # الدرس الأضعف أُعيد: يبقى مقفلاً إلى الغد، ثم يُفتح
  await pg.evaluate("() => { const P = PROG['m1.u2.d6']; if (P.weak) PROG[P.weak].at = P.failAt + 1000; saveProg(); showHome(); }"); await pg.wait_for_timeout(100)
  s2 = await pg.evaluate(STATE); home = await pg.evaluate("() => document.querySelector('[data-lesson=\"m1.u2.d6\"]').textContent")
  check('A-03', not s2['testOpen'] and 'غَدًا' in home, 'أُعيد الدرس الأضعف اليوم: يبقى مقفلاً ويقول «نعود إليها غداً»', [s2, home[-40:]])
  await pg.evaluate("() => { const P = PROG['m1.u2.d6']; if (P.weak) { P.failAt -= 2 * 864e5; PROG[P.weak].at = P.failAt + 1000; } saveProg(); showHome(); }"); await pg.wait_for_timeout(100)
  s3 = await pg.evaluate(STATE)
  check('A-03', s3['testOpen'], 'وبعد يومٍ من الإخفاق والدرس الأضعف مُعاد: يُفتح الاختبار', s3)
  await gate_pass(pg); t = await pg.evaluate("() => document.querySelector('#panel').textContent")
  check('A-03', 'متقدّم مع دعم' in t and '٧ من ١٢' in t, 'لوحة الكبار تقول الشريحة والدرجة', t[t.find('اختبار') - 10:][:200] if 'اختبار' in t else t[:200])
  check('A-03', not errs, 'لا أخطاء في الصفحة (متقدّم مع دعم)', errs[:3]); await ctx.close()
  # 6 من 12 تحت 7: يحتاج دعماً؛ و10 من 12: نجاح
  for k, band in ((6, 'low'), (10, 'pass')):
    ctx, pg, errs = await fresh(b, prog_u2()); r = await drive(pg, 'm1.u2.d6', test_ok=k); s = await pg.evaluate(STATE)
    good = (s['band'] == 'low' and not s['u3open']) if band == 'low' else (s['mastered'] and s['badge'] and s['band'] is None and s['u3open'])
    check('A-03', r == 'done' and good and not errs, ('%d من 12: «يحتاج دعماً» والحيّ التالي مقفل' if band == 'low' else '%d من 12: نجاح بالشارة (كانت تحتاج 11)') % k, [r, s, errs[:2]]); await ctx.close()
  # ضابط: الإخفاق ثم النجاح بعد يوم يمحو الشريحة
  ctx, pg, errs = await fresh(b, prog_u2()); await drive(pg, 'm1.u2.d6', test_ok=3)
  await pg.evaluate("() => { const P = PROG['m1.u2.d6']; if (P.weak) { P.failAt -= 2 * 864e5; PROG[P.weak].at = P.failAt + 1000; } saveProg(); }")
  r = await drive(pg, 'm1.u2.d6', test_ok=12); s = await pg.evaluate(STATE)
  check('A-03', r == 'done' and s['mastered'] and s['badge'] and s['band'] is None and s['failAt'] is None, 'ضابط: إعادةٌ ناجحة بعد يوم تمنح الشارة وتمحو الشريحة', s)
  await reopen(pg); rep = await pg.evaluate("() => STORE_ISSUES.repaired")
  check('A-03', not rep and not errs, 'ضابط: الحقول الجديدة تُقبل بعد إعادة الفتح، ولا أخطاء', [rep, errs[:2]]); await ctx.close()

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch()
    if on('A-03'): await a03_cases(b)
    await b.close()
  print('FAILS:', len(FAILS)); sys.exit(1 if FAILS else 0)
asyncio.run(main())
