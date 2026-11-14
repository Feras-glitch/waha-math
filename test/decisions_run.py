# فحوص قبول قرارات فراس في 14 نوفمبر 2026 (D266) على فرع review/decisions-2026-11-14:
# كل فحص يخفق على 9043412 (فرع review/fresh-2026-11-13) ما لم يُذكر أنه ضابط.
#   A-03 اختبار الوحدة: لا يُكشف الجواب أثناءه؛ العتبتان مقرّبتان إلى الأسفل (10 من 12، 9 من 11؛ و7 و6)؛ الشرائح الثلاث؛
#        «متقدّم مع دعم» يفتح الحيّ التالي ويُقرّب مراجعة دروس الخطأ؛ ولا إعادة قبل الدرس الأضعف ومرور يوم؛ والخريطة واللوحة تقولان ذلك.
#   A-09 المراجعة: المواعيد القصيرة (بعد يوم وبعد 3 أيام) قبل غيرها حين يزيد المستحق على السقف.
#   R02  الصيانة بعد «ثابت»: 30 ثم 60 ثم 90 يوماً لمفهومٍ له 4 بنود مراجعة فأكثر؛ الخطأ يُرجعه إلى خطوة 3 أيام؛ وبندٌ عرضي يُحسب صيانةً.
#   A-04 سطر «ثابت مبدئي» في تقرير الكبار.
#   D6   نصوص القرار 6 (M-05..M-25 وA-12 وA-13) في المتصفح: الأشياء الجديدة (الشطيرة والجزرة والعلبة المعدنية) تُرسم ولا يبقى القديم؛ حلّ المربع المشترك
#        بالركن من درس «ركن» فصاعداً؛ «صحّح لفوضى» بعد ثلاثة أخطاء كشفٌ محايد بلا «نعم!» ولا نغمة نجاح؛ واختبار الحيّ الأول 12 بنداً فيها بند «نعم».
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

async def a09_cases(b):
  # مستحقٌّ أكثر من السقف: نصفه خطوة 3 (21 يوماً) متأخّرٌ عشرة أيام، ونصفه خطوة 0 أو 1 مستحقٌّ منذ ساعة
  ctx, pg, errs = await fresh(b)
  r = await pg.evaluate("""() => { const now = Date.now(); let i = 0; const ids = Object.keys(LDATA).filter(id => (LDATA[id].review || []).length);
    for (const id of ids) { const cs = {}; for (const C of srsConcepts(LDATA[id])) { const shortStep = i++ % 2 === 0; cs[C] = shortStep ? { step: i % 4 === 1 ? 0 : 1, due: now - 36e5, last: now - 2 * 864e5 } : { step: 3, due: now - 10 * 864e5, last: now - 30 * 864e5 }; } PROG.srs[id] = { cs, k: {}, k2: 0 }; }
    const due = reviewDue(), pick = reviewPick(); return { due: due.length, short: due.filter(d => PROG.srs[d.L.id].cs[d.C].step <= 1).length, pick: pick.map(d => PROG.srs[d.L.id].cs[d.C].step) }; }""")
  check('A-09', r['due'] > 3 and r['short'] >= 3 and len(r['pick']) == 3 and all(x <= 1 for x in r['pick']), 'المستحق أكثر من السقف: «بعد يوم» و«بعد 3 أيام» تُختار قبل «بعد 21 يوماً» الأقدم منها موعداً', r)
  r2 = await pg.evaluate("""() => { for (const r of Object.values(PROG.srs)) for (const x of Object.values(r.cs)) if (x.step <= 1) x.due = Date.now() + 5 * 864e5; return reviewPick().map(d => PROG.srs[d.L.id].cs[d.C].step); }""")
  check('A-09', len(r2) == 3 and all(x == 3 for x in r2), 'ضابط: ولا قصير مستحقّاً: يُختار الأقدم موعداً، والسقف 3 كما هو', r2)
  check('A-09', not errs, 'لا أخطاء في الصفحة', errs[:3]); await ctx.close()

MAINT = """([id, C, last, step, due, m]) => { const now = Date.now(); PROG.srs[id] = { cs: {}, k: {}, k2: 0 }; for (const c of srsConcepts(LDATA[id])) PROG.srs[id].cs[c] = { step: 1, due: now + 864e5 * 9, last: now };
  const x = { step, due, last: now - last * 864e5 }; if (m != null) x.m = m; PROG.srs[id].cs[C] = x; saveProg(); return reviewDue().filter(d => d.L.id === id && d.C === C).length; }"""
async def r02_cases(b):
  ctx, pg, errs = await fresh(b)
  n4 = await pg.evaluate("() => LDATA['m1.u4.d4'].review.filter(x => x.c === 'D001').length"); n2 = await pg.evaluate("() => LDATA['m1.u1.d1'].review.filter(x => x.c === 'C001').length")
  d31 = await pg.evaluate(MAINT, ['m1.u4.d4', 'D001', 31, 4, None, None])
  d29 = await pg.evaluate(MAINT, ['m1.u4.d4', 'D001', 29, 4, None, None])
  two = await pg.evaluate(MAINT, ['m1.u1.d1', 'C001', 200, 4, None, None])
  check('R02', n4 >= 4 and d31 == 1, 'مفهومٌ له 4 بنود مراجعة، «ثابت» منذ 31 يوماً: يعود في المراجعة (صيانة)', [n4, d31])
  check('R02', d29 == 0, 'ضابط: و«ثابت» منذ 29 يوماً لم يحن بعد', d29)
  check('R02', n2 == 2 and two == 0, 'ومفهومٌ له بندان: لا صيانة ولو مضى 200 يوم (الشرط الأول: لا صيانة ببندين محفوظين)', [n2, two])
  ok = await pg.evaluate("""() => { const id = 'm1.u4.d4'; srsUpdate(id, 'D001', true); const x = PROG.srs[id].cs.D001; const due60 = typeof maintDue === 'function' ? maintDue(LDATA[id], 'D001', x) : null;
    return { m: x.m, due: x.due, step: x.step, gap: due60 ? Math.round((due60 - x.last) / 864e5) : null }; }""")
  check('R02', ok['m'] == 1 and ok['due'] is None and ok['step'] == 4 and ok['gap'] in (59, 60), 'صيانة صحيحة: يبقى «ثابتاً»، والتالية بعد 60 يوماً', ok)
  await pg.evaluate(MAINT, ['m1.u4.d4', 'D001', 95, 4, None, 2])
  bad = await pg.evaluate("""() => { const id = 'm1.u4.d4'; srsUpdate(id, 'D001', false); const x = PROG.srs[id].cs.D001; return { m: x.m, step: x.step, days: x.due ? Math.round((x.due - Date.now()) / 864e5) : null }; }""")
  check('R02', bad['step'] == 1 and bad['m'] == 0 and bad['days'] in (2, 3), 'صيانة خاطئة: يعود المفهوم إلى خطوة 3 أيام، لا إلى البداية', bad)
  await pg.evaluate(MAINT, ['m1.u4.d4', 'D001', 95, 4, None, 3])
  done = await pg.evaluate("() => reviewDue().filter(d => d.L.id === 'm1.u4.d4').length")
  check('R02', done == 0, 'بعد الصيانات الثلاث لا يعود', done)
  await reopen(pg); rep = await pg.evaluate("() => STORE_ISSUES.repaired")
  check('R02', not rep and not errs, 'ضابط: حقل الصيانة يُقبل بعد إعادة الفتح، ولا أخطاء', [rep, errs[:2]]); await ctx.close()
  # البند المشتبك في إتقان m1.u4.d5 يسأل عن D001: صوابه يُحسب صيانةً
  ctx, pg, errs = await fresh(b)
  await pg.evaluate(MAINT, ['m1.u4.d4', 'D001', 29, 4, None, None]); r = await drive(pg, 'm1.u4.d5')
  last = await pg.evaluate("() => Math.round((Date.now() - PROG.srs['m1.u4.d4'].cs.D001.last) / 864e5)")
  check('R02', r == 'done' and last == 0, 'صوابٌ في البند المشتبك (إتقان درسٍ لاحق) يُحسب صيانةً لمفهومه الثابت', [r, last])
  await gate_pass(pg); t = await pg.evaluate("() => document.querySelector('#panel').textContent")
  check('R02', 'صيانة بعد' in t and 'صيانةٌ بعد ٣٠' in t, 'لوحة الكبار تقول موعد الصيانة وقاعدتها', t[t.find('المراجعة المتباعدة'):][:160] if 'المراجعة المتباعدة' in t else '')
  check('A-04', 'فـ«ثابت» هنا مبدئي' in t, 'سطر «ثابت مبدئي» في جدول المراجعة في لوحة الكبار', '')
  check('R02', not errs, 'لا أخطاء في الصفحة (البند المشتبك)', errs[:3]); await ctx.close()

async def d6_cases(b):
  ctx, pg, errs = await fresh(b)
  objs = await pg.evaluate("""() => { const out = {}; const svg = newStage(260, { oasis: false, ground: 0 });
    for (const k of ['sandwich', 'carrotCone', 'can']) { let s; try { s = make(k); } catch (e) { out[k] = { err: String(e) }; continue; } const g = fitThing(svg, s, 170, 120, 130); const fills = [...g.querySelectorAll('*')].map(e => e.getAttribute('fill'));
      out[k] = { kind: s.kind, object: s.object, label: s.label, polys: g.querySelectorAll('polygon').length, crumb: fills.includes('#f3e0b5'), leaves: fills.filter(f => f === '#7e9a4e').length, band: fills.includes('#e8d9b0') }; }
    out.old = ['kite', 'funnel', 'tube'].map(k => typeof MK[k]); return out; }""")
  check('D6', objs['sandwich'].get('kind') == 'triangle' and objs['sandwich'].get('label') == 'شَطِيرَة' and objs['sandwich'].get('crumb') and objs['sandwich'].get('polys', 0) >= 2, 'M-08 شطيرة مثلّثة بدل الطائرة الورقية: مثلثٌ اسمه لا يسمّي شكلاً، ولبّها مرسوم', objs['sandwich'])
  check('D6', objs['carrotCone'].get('kind') == 'cone' and objs['carrotCone'].get('label') == 'جَزَرَة' and objs['carrotCone'].get('leaves') == 3, 'M-09 جزرة (مخروط مصمت له رأس) بدل القمع، بأوراقها', objs['carrotCone'])
  check('D6', objs['can'].get('kind') == 'cylinder' and objs['can'].get('label') == 'عُلْبَةٌ مَعْدِنِيَّةٌ' and objs['can'].get('band'), 'M-09 علبة معدنية مغلقة (لها وجهان) بدل لفّة الكرتون المفتوحة', objs['can'])
  check('D6', objs['old'] == ['undefined'] * 3, 'لا يبقى مولّد للطائرة الورقية ولا للقمع ولا للفّة الكرتون', objs['old'])
  bag = await pg.evaluate("""() => { CUR = LDATA['m1.u2.d2']; const svg = newStage(200, { oasis: false, ground: 0 }); const n0 = svg.childElementCount; try { bagIcon(svg, { icon: 'can', label: 'bagCan' }, 100, 100); } catch (e) { return { drawn: false, err: String(e), text: '', items: LDATA['m1.u2.d2'].bag.items.map(r => r.icon) }; }
    const add = [...svg.children].slice(n0); return { drawn: add.some(e => e.tagName === 'g' && e.querySelectorAll('ellipse,path').length > 2), text: svg.textContent, items: LDATA['m1.u2.d2'].bag.items.map(r => r.icon) }; }""")
  check('D6', bag['drawn'] and 'عُلْبَةٌ مَعْدِنِيَّةٌ' in bag['text'] and bag['items'][0] == 'can', 'M-09 حقيبة u2/d2: أيقونة العلبة المعدنية مرسومة باسمها', bag)
  sv = await pg.evaluate("""() => { const r = []; const P0 = PROG['m1.u1.d3']; delete PROG['m1.u1.d3'];
    if (typeof solveLine !== 'function') return 'لا solveLine';
    for (const id of ['m1.u1.d1', 'm1.u1.d2', 'm1.u1.d3', 'm1.u1.d6', 'm1.u2.d6']) { CUR = LDATA[id]; r.push(solveLine('square')); }
    CUR = LDATA['m1.u1.d1']; PROG['m1.u1.d3'] = { done: true, at: 1 }; r.push(solveLine('square')); r.push(solveLine('rect')); r.push(solveLine('cube'));
    if (P0) PROG['m1.u1.d3'] = P0; else delete PROG['m1.u1.d3']; return r; }""")
  check('D6', sv == ['gen.solve.square', 'gen.solve.square', 'gen.solve.squareC', 'gen.solve.squareC', 'gen.solve.squareC', 'gen.solve.squareC', 'gen.solve.rect', 'gen.solve.cube'],
        'M-05 حلّ المربع المشترك: بالحوافّ في d1 وd2، وبالركن من درس «ركن» (d3) فصاعداً، وفي مراجعة درسٍ سابق لطفلٍ أنهى d3', sv)
  await ctx.close()
  # M-12: «صحّح لفوضى» بثلاثة اختيارات خاطئة، ثم ضابط: الصحيحة من الأولى
  for how, label in (('wrong', 'ثلاثة أخطاء'), ('ok', 'ضابط: الصحيحة من الأولى')):
    ctx, pg, errs = await fresh(b)
    await pg.evaluate("""() => { const L = LDATA['m1.u1.d1']; CUR = L; show('lesson'); window.__clips = []; window.__good = 0; const g0 = SFX.good; SFX.good = (...a) => { window.__good++; return g0(...a); };
      window.__chaosDone = false; chaosCards({ right: 'ch.right', wrong: 'ch.wrong' }).then(() => { window.__chaosDone = true; }, e => { window.__chaosDone = 'err:' + e; }); }""")
    last = -1
    for _ in range(600):
      st = await pg.evaluate("() => ({ done: window.__chaosDone, a: window.__auto ? { n: window.__auto.n, kind: window.__auto.kind } : null })")
      if st['done']: break
      if st['a'] and st['a']['n'] != last and st['a']['kind'] == 'card':
        last = st['a']['n']; await pg.evaluate("(h) => { const a = window.__auto; (h === 'wrong' ? a.wrong : a.ok)(); }", how)
      await pg.wait_for_timeout(30)
    r = await pg.evaluate("() => ({ done: window.__chaosDone, clips: window.__clips.filter(c => c.startsWith('gen.chaos') || c.includes('.ch.')), good: window.__good })")
    c = r['clips']; has = lambda k: [i for i, x in enumerate(c) if x.startswith(k)]
    if how == 'wrong':
      rv, rt, ww = has('gen.chaos.reveal'), has('m1.u1.d1.ch.right'), has('gen.chaos.wasWrong')
      ok = r['done'] is True and not has('gen.chaos.right') and r['good'] == 0 and len(has('gen.chaos.together')) == 1 and rv and rt and ww and rv[0] < rt[-1] < ww[0]
      check('D6', ok, 'M-12 بعد ثلاثة اختيارات خاطئة: لا «نعم!» ولا نغمة نجاح، و«اسمعهما مرة أخرى» مرةً واحدة فقط، ثم «هذه هي الجملة التي تحقّقنا منها بأيدينا» والجملة و«فوضى أخطأت»', r)
    else:
      ok = r['done'] is True and has('gen.chaos.right') and r['good'] == 1 and not has('gen.chaos.reveal') and not has('gen.chaos.wasWrong')
      check('D6', ok, 'M-12 ' + label + ': «نعم! هذه هي الجملة الصحيحة» ونغمة النجاح كما كانتا', r)
    check('D6', not errs, 'لا أخطاء في الصفحة (' + label + ')', errs[:3]); await ctx.close()
  # A-12: اختبار الحيّ الأول 12 بنداً، فيها بند «نعم» يُسأل ويُحسب، والنجاح 10 منها
  P = {}
  for u in ['m1.u1.d1', 'm1.u1.d2', 'm1.u1.d3', 'm1.u1.d4', 'm1.u1.d5']: P[u] = {'done': True, 'at': 1, 'mastered': True}
  ctx, pg, errs = await fresh(b, P)
  meta = await pg.evaluate("() => { const T = LDATA['m1.u1.d6'].test.items; const y = T.find(q => q.id === 't12'); return { n: T.length, yes: y && y.item.t === 'yesno' && y.item.ans === true, need: typeof testNeed === 'function' ? testNeed(T.length) : null }; }")
  r = await drive(pg, 'm1.u1.d6', test_ok=10)
  st = await pg.evaluate("() => { const P = PROG['m1.u1.d6'] || {}; return { score: P.score, of: P.of, mastered: !!P.mastered, asked: (window.__clips || []).some(c => c.startsWith('m1.u1.d6.ts.corners')), badge: !!PROG['badge:m1.u1'] }; }")
  check('D6', meta == {'n': 12, 'yes': True, 'need': 10}, 'A-12 اختبار الحيّ الأول 12 بنداً، فيها بند «نعم» (t12)، والنجاح 10 منها', meta)
  check('D6', r == 'done' and st['asked'] and st['score'] == 10 and st['of'] == 12 and st['mastered'] and st['badge'], 'A-12 الاختبار يُقاد كله: يُسأل بند الأركان، و10 من 12 تنجح', [r, st])
  check('D6', not errs, 'لا أخطاء في الصفحة (اختبار الحيّ الأول)', errs[:3]); await ctx.close()

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch()
    if on('A-03'): await a03_cases(b)
    if on('A-09'): await a09_cases(b)
    if on('R02') or on('A-04'): await r02_cases(b)
    if on('D6'): await d6_cases(b)
    await b.close()
  print('FAILS:', len(FAILS)); sys.exit(1 if FAILS else 0)
asyncio.run(main())
