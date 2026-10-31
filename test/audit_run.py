# فحوص قبول تقرير المهندس الخصم (28 أكتوبر 2026، المعرّفات A01–A08 ثابتة). على الإيداع المفحوص 246a102 يخفق 60 فحصاً من 84، ولكل بندٍ منها فحوصٌ تخفق (A01 9، A02 3، A03 12، A04 4، A05 22، A06 5، A07 3، A08 2)؛
# والـ 24 الباقية ضوابط تنجح عليه عمداً (لا أخطاء في الصفحة، والسليم يُقبل، وما لا يُمسّ باقٍ)، فلا يُحسب الإصلاح بإسقاطها.
#   A01 حكم الكبير بثلاث إجابات «نعم» صريحة وحدها، بالترتيبات الستة، وبعد إعادة الفتح.
#   A02 «ليس بعد» بعد «نعم» يلغي حكم الكبير وحده: لا يمحو إتقان التطبيق المستقل، وتتفق البطاقة والخريطة بعد إعادة الفتح.
#   A03 حقول النسخة المستوردة لا تصير شيفرة: معرّف الطفل وصورته وشكله وتصميماته تُرفض إن خالفت صيغتها، ولا تُنفَّذ حمولة قبل الحفظ ولا بعده،
#       ولا من بيانات وُضعت في التخزين مباشرة.
#   A04 الاستعادة معاملة: فشل أيّ كتابة أو انقطاعها في أيّ موضع يترك ما كان كاملاً أو الجديد كاملاً، ولا رسالة تزعم ما لم يحدث.
#   A05 النسخة التالفة في داخلها تُرفض قبل أي كتابة، والتالف في التخزين لا يعطّل لوحة الكبار ولا التقرير ولا المعرض، ويبقى السليم منه.
#   A06 التبويب الذي فقد القفل لا يكتب شيئاً من أيّ شاشة، وغطاؤه فوق لوحة الكبار، والكاتب القديم يُردّ ولو فاته إشعار التبويب الآخر.
#   A07 المراجعة لكل مفهوم: كل مفهوم يُسأل في كل مراحله قبل أن يثبت، والخطأ يرجع مفهومه وحده، وجلسة المراجعة بسقفها.
#   A08 حذف الطفل يمحو صوره ومفاتيحه ونسخه، ولا يمسّ غيره ولا حزمة الصوت، وإخفاق حذف الصور لا يُعلَن حذفاً.
# وإعادة الفحص المستقلة (30 أكتوبر 2026، WM101-R1-01..03، مرتبطة بـ A06 وA08؛ على 1d53a12 يخفق 26 فحصاً من 39: R1-01 17، R1-02 7، R1-03 2، والباقي «لا أخطاء في الصفحة»):
#   R1-01 إخفاق كل كتابة في حذف الطفل: الذاكرة كالتخزين، ولا يُعلَن حذف، واللوحة تقول إنه لم يكتمل، و«أكملوا الحذف» يكمله، وبعد إعادة الفتح.
#   R1-02 عملٌ بدأ قبل فقد القفل لا يكتب ولا يحذف بعده: حذف الصور (أثناء الفتح وداخل المعاملة)، وحفظ الصورة، وواجهة الصيد، وحذف حزمة الصوت؛ ولا يعود الحذف الملغى وحده.
#   R1-03 قاعدة الصور لا تُفتح: لا يُحذف الطفل، وتبقى صور الذاكرة، ويكتمل الحذف حين يعود الوصول.
# ثم ملاحظة المراجع على الجولة الثانية (31 أكتوبر): الحذف المعلّق عبر تبويبين وإعادة الفتح، 8 فحوص تحت R1-01 (ONLY=R1-01P لها وحدها)؛ على 1d53a12 يخفق 6 منها والباقيان «لا أخطاء»:
#   حذفٌ لم يكتمل في A ثم يُفتح B: القائمة كالمحفوظ في كلٍّ منهما، وA بعد فقد القفل لا يكتب صورةً ولا تقدّماً للطفل الجاري حذفه ولا يكمل حذفه،
#   و«أكملوا الحذف» في B يكمله كله ويبقى الطفل الآخر سليماً، واختيار الطفل المعلّق حذفه يلغي الحذف ويقول ذلك، وكلٌّ بعد إعادة الفتح.
# الاستعمال: python3 test/audit_run.py [ملف نسخة الفحص]   (ONLY=A01,A04 لبعضها؛ يخرج بـ 1 مع أي إخفاق)
import asyncio, io, itertools, json, os, struct, sys, tempfile, wave, zipfile
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
FILE = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'dist', 'واحة_الرياضيات.dev.html'))
URL = 'file://' + FILE + '#fast&seed=5'
ONLY = {x for x in os.environ.get('ONLY', '').split(',') if x}
TMP = tempfile.mkdtemp(prefix='audit_'); FAILS = []
def on(k): return not ONLY or k in ONLY
def check(k, ok, what, info=''):
  print(('ok   ' if ok else 'FAIL ') + k + ' ' + what + (('  ' + json.dumps(info, ensure_ascii=False)[:600]) if info != '' else ''), flush=True)
  if not ok: FAILS.append(k + ' ' + what)

KID = {'id': 'k1', 'name': 'سلمى', 'gender': 'f', 'photo': '', 'avatar': 'f3'}
async def reopen(pg):   # فتح حقيقي: الانتقال إلى العنوان نفسه بوسمه لا يعيد التحميل
  await pg.goto('about:blank'); await pg.goto(URL); await pg.wait_for_timeout(450)
async def fresh(b, prog=None, kids=None, extra=None):
  ctx = await b.new_context(viewport={'width': 412, 'height': 860}); pg = await ctx.new_page(); errs = []
  pg.on('pageerror', lambda e: errs.append(str(e)))
  await pg.goto(URL); await pg.wait_for_timeout(250)
  kids = kids or [KID]
  await pg.evaluate("""([kids, prog, extra]) => { localStorage.clear(); localStorage.setItem('hp_kids', JSON.stringify(kids)); localStorage.setItem('hp_kid', JSON.stringify(kids[0].id));
    for (const k of kids) localStorage.setItem('hp_settings:' + k.id, JSON.stringify({ sessionMax: 0, muted: true }));
    localStorage.setItem('hp_prog:' + kids[0].id, JSON.stringify(Object.assign({ schema: 3 }, prog || {})));
    for (const [k, v] of Object.entries(extra || {})) localStorage.setItem(k, v); }""", [kids, prog or {}, extra or {}])
  await reopen(pg); return ctx, pg, errs
HP = "() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (/^hp_(kids|kid|digits|muted|(prog|log|session|settings|designs):)/.test(k)) o[k] = JSON.parse(localStorage.getItem(k)); } return o; }"
def same(a, b): return json.dumps(a, sort_keys=True, ensure_ascii=False) == json.dumps(b, sort_keys=True, ensure_ascii=False)
OK_APPLY = "(r) => r === true || !!(r && r.ok === true)"

# ---------- A01 وA02: بطاقة الكبير ----------
CARD = """([L, C]) => { const b = document.querySelector('[data-ac="' + L + '"]'); const card = b ? b.closest('.talkcard') : null;
  const map = [...document.querySelectorAll('#panel details')].find(d => /خريطة الإتقان/.test(d.textContent));
  const row = map ? [...map.querySelectorAll('tr')].find(r => r.cells[0] && r.cells[0].textContent === LDATA[L].concepts[C]) : null;
  return { pill: !!card && card.textContent.includes('متقن بحكم الكبير'), map: row ? row.cells[1].textContent.trim() : null }; }"""
MAST = lambda st: st['map'] is not None and 'متقن' in st['map']
async def click_ans(pg, L, i, v):
  await pg.click('[data-ac="%s"][data-i="%d"][data-v="%d"]' % (L, i, v)); await pg.wait_for_timeout(60)
async def adult_cases(b):
  # (أ) C008 مدخل لا يتقنه التطبيق: يحكم الكبير وحده
  d4 = {'m1.u2.d4': {'done': True, 'at': 1, 'path': 'mat', 'entry': False, 'cs': {'C008': {'entry': True, 'appOk': True, 'ok': 3, 'of': 3, 'round': 1, 'at': 1}, 'N005': {'mastered': True, 'ok': 3, 'of': 3, 'round': 1, 'at': 1}}}}
  ctx, pg, errs = await fresh(b, d4)
  for order in itertools.permutations(range(3)):
    await pg.evaluate("() => { PROG.adult = {}; saveProg(); openPanel(); }")
    steps = []
    for j, i in enumerate(order):
      await click_ans(pg, 'm1.u2.d4', i, 1); st = await pg.evaluate(CARD, ['m1.u2.d4', 'C008']); steps.append(st)
    early_ok = all(not s['pill'] and not MAST(s) for s in steps[:2]); last = steps[2]
    check('A01', early_ok and last['pill'] and MAST(last), 'C008: الحكم بعد ثلاث «نعم» وحدها، بالترتيب %s' % (order,), steps)
  # السؤال الأخير وحده، ثم إعادة الفتح
  await pg.evaluate("() => { PROG.adult = {}; saveProg(); openPanel(); }"); await click_ans(pg, 'm1.u2.d4', 2, 1)
  st = await pg.evaluate(CARD, ['m1.u2.d4', 'C008']); await reopen(pg); await pg.evaluate("() => openPanel()"); st2 = await pg.evaluate(CARD, ['m1.u2.d4', 'C008'])
  check('A01', not st['pill'] and not MAST(st) and not st2['pill'] and not MAST(st2), 'C008: «نعم» في السؤال الأخير وحده لا تمنح الحكم، ولا بعد إعادة الفتح', [st, st2])
  # «نعم» ثلاثاً ثم «ليس بعد» في الثاني: يُلغى الحكم في البطاقة والخريطة، وبعد إعادة الفتح
  for i in range(3): await click_ans(pg, 'm1.u2.d4', i, 1)
  yes = await pg.evaluate(CARD, ['m1.u2.d4', 'C008']); await click_ans(pg, 'm1.u2.d4', 1, 0); no = await pg.evaluate(CARD, ['m1.u2.d4', 'C008'])
  await reopen(pg); await pg.evaluate("() => openPanel()"); no2 = await pg.evaluate(CARD, ['m1.u2.d4', 'C008'])
  check('A02', yes['pill'] and MAST(yes) and not no['pill'] and not MAST(no) and not no2['pill'] and not MAST(no2) and 'مدخل' in (no2['map'] or ''), 'C008: «ليس بعد» بعد «نعم» يلغي الحكم في البطاقة والخريطة وبعد إعادة الفتح', [yes, no, no2])
  # وتغيير الجواب مرات ثم إعادة الفتح: الحالة من الأجوبة الحاضرة
  for i, v in [(1, 1), (0, 0), (0, 1)]: await click_ans(pg, 'm1.u2.d4', i, v)
  st = await pg.evaluate(CARD, ['m1.u2.d4', 'C008']); await reopen(pg); await pg.evaluate("() => openPanel()"); st2 = await pg.evaluate(CARD, ['m1.u2.d4', 'C008'])
  check('A01', st['pill'] and MAST(st) and st2 == st, 'C008: بعد تبديل الأجوبة ثم «نعم» في الثلاثة: الحكم قائم وبعد إعادة الفتح كما هو', [st, st2])
  check('A01', not errs, 'C008: لا أخطاء في الصفحة', errs[:3]); await ctx.close()
  # (ب) C005 مفهوم يتقنه التطبيق أيضاً: الحكم لا يمحو إتقان التطبيق ولا يصنعه
  for name, app, path in [('لم يتقنه التطبيق', False, 'mat'), ('أتقنه التطبيق بالأشياء', True, 'mat'), ('أتقنه التطبيق على الشاشة', True, 'screen')]:
    cs = {'mastered': True, 'deferred': False, 'ok': 3, 'of': 3, 'round': 1, 'at': 1} if app else {'deferred': True, 'ok': 1, 'of': 3, 'round': 2, 'at': 1}
    p = {'m1.u1.d4': {'done': True, 'at': 1, 'path': path, 'entry': path == 'screen', 'mastered': False, 'cs': {'C005': cs, 'N002': {'mastered': True, 'ok': 3, 'of': 3, 'round': 1, 'at': 1}}}}
    ctx, pg, errs = await fresh(b, p); await pg.evaluate("() => openPanel()")
    st0 = await pg.evaluate(CARD, ['m1.u1.d4', 'C005']); await click_ans(pg, 'm1.u1.d4', 2, 1); st1 = await pg.evaluate(CARD, ['m1.u1.d4', 'C005'])
    for i in range(2): await click_ans(pg, 'm1.u1.d4', i, 1)
    st3 = await pg.evaluate(CARD, ['m1.u1.d4', 'C005']); await click_ans(pg, 'm1.u1.d4', 0, 0); st4 = await pg.evaluate(CARD, ['m1.u1.d4', 'C005'])
    await reopen(pg); await pg.evaluate("() => openPanel()"); st5 = await pg.evaluate(CARD, ['m1.u1.d4', 'C005'])
    app_full = app and path == 'mat'   # إتقان التطبيق بالأشياء «متقن» بلا حكم
    ok1 = MAST(st1) == app_full and not st1['pill']
    ok3 = st3['pill'] and MAST(st3)
    ok4 = not st4['pill'] and MAST(st4) == app_full and st4['map'] == st0['map'] and st5 == st4
    check('A01', ok1, 'C005 (%s): «نعم» في الأخير وحده لا تغيّر الحالة' % name, [st0, st1])
    check('A02', ok3 and ok4, 'C005 (%s): الحكم ثم إلغاؤه يعيد حالة التطبيق نفسها، وبعد إعادة الفتح' % name, [st0, st3, st4, st5])
    check('A02', not errs, 'C005 (%s): لا أخطاء في الصفحة' % name, errs[:3]); await ctx.close()

# ---------- A03 وA05: النسخة المستوردة ----------
async def mk_backup(pg): return await pg.evaluate("() => JSON.parse(JSON.stringify(backupData()))")
async def try_check(pg, d):
  return await pg.evaluate("""(t) => { const before = JSON.stringify(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)]));
    let r; try { r = backupCheck(t); } catch (e) { r = { ok: false, threw: String(e) }; }
    return { ok: !!r.ok, why: r.why || r.threw || null, same: before === JSON.stringify(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)])) }; }""", json.dumps(d, ensure_ascii=False))
def with_data(bk, **kv):
  d = json.loads(json.dumps(bk)); d['data'].update({k.replace('__', ':'): (v if isinstance(v, str) else json.dumps(v, ensure_ascii=False)) for k, v in kv.items()}); return d
def kids_bk(bk, kids, kid=None):
  d = json.loads(json.dumps(bk)); d['data']['hp_kids'] = json.dumps(kids, ensure_ascii=False)
  if kid is not None: d['data']['hp_kid'] = json.dumps(kid)
  return d
XSS = 'evil"><img src=x onerror="window.__x=1"><b x="'
NOX = "() => ({ x: window.__x === undefined, img: !document.querySelector('img[onerror], [onclick], [onerror]') })"
async def import_cases(b):
  p = {'m1.u1.d1': {'done': True, 'at': 1, 'path': 'mat', 'mastered': True, 'cs': {'C001': {'mastered': True, 'ok': 3, 'of': 3, 'round': 1, 'at': 1}}}}
  ctx, pg, errs = await fresh(b, p, kids=[KID, {'id': 'k2', 'name': 'علي', 'gender': 'm', 'photo': '', 'avatar': 'm2'}])
  bk = await mk_backup(pg)
  r = await try_check(pg, bk); check('A03', r['ok'], 'النسخة السليمة نفسها تُقبل', r)
  k2 = {'id': 'k2', 'name': 'علي', 'gender': 'm', 'photo': '', 'avatar': 'm2'}
  bad_kids = [('معرّف فيه وسم HTML', [KID, {**k2, 'id': XSS}]), ('معرّف بعلامة اقتباس', [KID, {**k2, 'id': "x' onclick='1"}]), ('معرّف بمسافة', [KID, {**k2, 'id': 'a b'}]),
              ('معرّف فارغ', [KID, {**k2, 'id': ''}]), ('معرّف أطول من 24', [KID, {**k2, 'id': 'k' * 25}]), ('معرّفان متطابقان', [KID, {**k2, 'id': 'k1'}]),
              ('شكل الطفل وسم HTML', [KID, {**k2, 'avatar': '"><img src=x onerror="window.__x=1">'}]), ('صورة الطفل من الشبكة', [KID, {**k2, 'photo': 'https://example.com/a.png'}]),
              ('صورة الطفل javascript:', [KID, {**k2, 'photo': 'javascript:window.__x=1'}]), ('بلا أطفال', [])]
  for name, kids in bad_kids:
    r = await try_check(pg, kids_bk(bk, kids)); check('A03', not r['ok'] and r['same'], 'تُرفض النسخة (%s) ولا يتغيّر شيء' % name, r)
  r = await try_check(pg, kids_bk(bk, [KID, k2], kid='k9')); check('A03', not r['ok'] and r['same'], 'تُرفض النسخة (الطفل النشط ليس في القائمة)', r)
  # تصميمات الورشة: قطعة بنوع غير معروف أو بلا قطع
  good_design = {'t': 1700000000000, 'unit': 'm1.u1', 'pieces': [{'k': 'circle', 'size': 70, 'rot': 0, 'x': 180, 'y': 130}]}
  r = await try_check(pg, with_data(bk, hp_designs__k1=[good_design])); check('A05', r['ok'], 'تصميم سليم يُقبل', r)
  for name, ds in [('قطعة بنوع وسم HTML', [{**good_design, 'pieces': [{**good_design['pieces'][0], 'k': '"><img src=x onerror=window.__x=1>'}]}]), ('تصميم بلا قطع', [{'t': 1, 'unit': 'm1.u1'}]),
                   ('قطعة بموضع نصّي', [{**good_design, 'pieces': [{**good_design['pieces'][0], 'x': 'a'}]}]), ('تصميم ليس كائناً', [None])]:
    r = await try_check(pg, with_data(bk, hp_designs__k1=ds)); check('A05', not r['ok'] and r['same'], 'تُرفض النسخة (%s)' % name, r)
  # بنية التقدّم والسجل والجلسة والإعدادات في داخلها (A05)
  P = json.loads(bk['data']['hp_prog:k1'])
  bad_prog = [('srs بقيمة null', {**P, 'srs': {'m1.u1.d1': None}}), ('srs ليس كائناً', {**P, 'srs': None}), ('خطوة سالبة', {**P, 'srs': {'m1.u1.d1': {'step': -1, 'due': None}}}),
              ('خطوة خارج المدى', {**P, 'srs': {'m1.u1.d1': {'step': 9, 'due': None}}}), ('موعد نصّي', {**P, 'srs': {'m1.u1.d1': {'step': 1, 'due': 'غداً'}}}),
              ('مفهوم بقيمة null', {**P, 'm1.u1.d1': {**P['m1.u1.d1'], 'cs': {'C001': None}}}), ('درس ليس كائناً', {**P, 'm1.u1.d2': 5}),
              ('مفتاح غير معروف', {**P, 'evil': {'x': 1}}), ('استئناف بمرحلة سالبة', {**P, 'm1.u1.d2': {'resume': {'stage': -3, 't': 1}}}),
              ('أجوبة بطاقة الكبير نصّية', {**P, 'adult': {'m1.u2.d4': ['yes', True, True]}})]
  for name, v in bad_prog:
    r = await try_check(pg, with_data(bk, hp_prog__k1=v)); check('A05', not r['ok'] and r['same'], 'تُرفض النسخة (%s)' % name, r)
  for name, v in [('إصدار بنية دروس أقدم (schema 2)', {**P, 'schema': 2}), ('بلا إصدار بنية', {k: x for k, x in P.items() if k != 'schema'})]:
    r = await try_check(pg, with_data(bk, hp_prog__k1=v)); check('A05', not r['ok'] and r['same'], 'تُرفض النسخة (%s)' % name, r)
  d = json.loads(json.dumps(bk)); d['v'] = 2; r = await try_check(pg, d); check('A05', not r['ok'] and r['same'], 'تُرفض النسخة (إصدار ملف غير مدعوم)', r)
  for name, key, v in [('خطأ في السجل بلا نصّ', 'hp_log__k1', {'attempts': [], 'errors': [{'t': 1, 'scene': 'x'}], 'faces': []}), ('زمن خطأ خارج مدى التاريخ', 'hp_log__k1', {'attempts': [], 'errors': [{'t': 1e20, 'msg': 'x', 'scene': 'x'}], 'faces': []}),
                       ('محاولة ليست كائناً', 'hp_log__k1', {'attempts': [None], 'errors': [], 'faces': []}), ('جلسة بعدد سالب', 'hp_session__k1', {'n': -1, 't': 0}),
                       ('حدّ جلسة نصّي', 'hp_settings__k1', {'sessionMax': 'كثير'})]:
    r = await try_check(pg, with_data(bk, **{key: v})); check('A05', not r['ok'] and r['same'], 'تُرفض النسخة (%s)' % name, r)
  # اسم فيه وسم يُقبل ويُعرض نصّاً بعد الاستعادة وإعادة الفتح: في اللوحة واختيار الطفل والخريطة
  d = kids_bk(bk, [{**KID, 'name': '<img src=x onerror="window.__x=1">'}, k2])
  r = await pg.evaluate("(t) => { const c = backupCheck(t); if (!c.ok) return { ok: false, why: c.why }; const a = backupApply(c); return { ok: a === true || !!(a && a.ok) }; }", json.dumps(d, ensure_ascii=False))
  await reopen(pg); await pg.evaluate("() => { openPanel(); }"); await pg.wait_for_timeout(150); n1 = await pg.evaluate(NOX)
  await pg.evaluate("() => { $('#panel').hidden = true; openKids(false); }"); await pg.wait_for_timeout(150); n2 = await pg.evaluate(NOX)
  await pg.evaluate("() => { $('#kidsCover').hidden = true; showHome(); }"); await pg.wait_for_timeout(150); n3 = await pg.evaluate(NOX)
  check('A03', r['ok'] and all(x['x'] and x['img'] for x in (n1, n2, n3)), 'اسم فيه وسم: يُستعاد ولا يُنفَّذ في اللوحة ولا اختيار الطفل ولا الخريطة', [r, n1, n2, n3])
  check('A03', not errs, 'لا أخطاء في الصفحة (الاستيراد)', errs[:3]); await ctx.close()
  # بيانات وُضعت في التخزين مباشرة (لا من الاستيراد): لا تُنفَّذ بعد إعادة الفتح، ويُحفظ التالف ويُسقط
  ctx, pg, errs = await fresh(b, p, kids=[KID, {**k2, 'id': XSS}, {**k2, 'id': 'k3', 'avatar': '"><img src=x onerror="window.__x=1">', 'photo': 'https://example.com/a.png'}])
  await pg.evaluate("() => { openPanel(); }"); await pg.wait_for_timeout(200); n1 = await pg.evaluate(NOX)
  await pg.evaluate("() => { $('#panel').hidden = true; openKids(false); }"); await pg.wait_for_timeout(200); n2 = await pg.evaluate(NOX)
  st = await pg.evaluate("() => ({ ids: KIDS.map(k => k.id), photo: KIDS.map(k => k.photo), av: KIDS.map(k => k.avatar), net: performance.getEntriesByType('resource').filter(e => /^https?:/.test(e.name)).map(e => e.name) })")
  check('A03', n1['x'] and n1['img'] and n2['x'] and n2['img'] and XSS not in st['ids'] and not any(st['photo']) and st['net'] == [], 'معرّف وشكل وصورة تالفة في التخزين: لا تُنفَّذ ولا تُطلب من الشبكة', [n1, n2, st])
  check('A03', not errs, 'لا أخطاء في الصفحة (التخزين المباشر)', errs[:3]); await ctx.close()
  # التالف في بنية التقدّم والسجل والتصميمات داخل التخزين: اللوحة والتقرير والمعرض تعمل، والسليم يبقى، ونسخة التالف محفوظة
  badp = {**p, 'srs': {'m1.u1.d1': None, 'm1.u1.d2': {'step': 'x'}}, 'm1.u1.d2': {'done': True, 'cs': {'C002': None}}, 'adult': {'m1.u2.d4': 'نعم'}}
  ctx, pg, errs = await fresh(b, badp, extra={'hp_log:k1': json.dumps({'attempts': [None, {'t': 1, 'scene': 'practice', 'ok': True}], 'errors': [{'t': 1e20, 'msg': 5}], 'faces': [None]}),
                                             'hp_designs:k1': json.dumps([{'t': 1, 'unit': 'm1.u1'}, None, {'t': 2, 'unit': 'm1.u1', 'pieces': [{'k': 'nope', 'x': 1, 'y': 1}]}])})
  res = {}
  for name, js in [('اللوحة', "() => { openPanel(); }"), ('تقرير الأسبوع', "async () => { await weeklyReport(); }"), ('المعرض', "async () => { $('#panel').hidden = true; await openGallery(); }")]:
    try: await pg.evaluate(js); await pg.wait_for_timeout(200); res[name] = True
    except Exception as e: res[name] = str(e).splitlines()[0][:160]
  st = await pg.evaluate("() => ({ d1: !!(PROG['m1.u1.d1'] && PROG['m1.u1.d1'].done), corrupt: Object.keys(localStorage).filter(k => k.startsWith('hp_corrupt:')).length })")
  check('A05', all(v is True for v in res.values()) and st['d1'] and st['corrupt'] >= 1 and not errs, 'التالف في التخزين لا يعطّل اللوحة ولا التقرير ولا المعرض، والدرس السليم باقٍ، ونسخة التالف محفوظة', [res, st, errs[:2]])
  await ctx.close()

# ---------- A04: الاستعادة معاملة ----------
INSTR = """([mode, at]) => { const S = Storage.prototype; window.__ops = 0; window.__frozen = false; const o = { set: S.setItem, rem: S.removeItem };
  window.__restoreStorage = () => { S.setItem = o.set; S.removeItem = o.rem; };
  const hit = () => { window.__ops++; if (window.__frozen) return 'skip'; if (mode === 'freeze' && window.__ops >= at) { window.__frozen = true; return 'skip'; }
    if (mode === 'one' && window.__ops === at) return 'throw'; if (mode === 'from' && window.__ops >= at) return 'throwSet'; return 'go'; };
  S.setItem = function (k, v) { const h = hit(); if (h === 'skip') return; if (h === 'throw' || h === 'throwSet') throw new DOMException('quota', 'QuotaExceededError'); return o.set.call(this, k, v); };
  S.removeItem = function (k) { const h = hit(); if (h === 'skip') return; if (h === 'throw') throw new DOMException('quota', 'QuotaExceededError'); return o.rem.call(this, k); }; }"""
async def restore_cases(b):
  old = {'m1.u1.d1': {'done': True, 'at': 1, 'path': 'mat'}, 'm1.u1.d2': {'done': True, 'at': 2, 'path': 'mat'}, 'm1.u1.d3': {'done': True, 'at': 3, 'path': 'mat'}}
  k2 = {'id': 'k2', 'name': 'علي', 'gender': 'm', 'photo': '', 'avatar': 'm2'}
  ctx, pg, errs = await fresh(b, old, kids=[KID, k2], extra={'hp_prog:k2': json.dumps({'schema': 3, 'm1.u1.d1': {'done': True, 'at': 5}})})
  OLD = await pg.evaluate(HP)
  # النسخة الجديدة: طفل واحد بتقدّم آخر (فتختلف المفاتيح: يُحذف بعضها ويُكتب غيره)
  new = json.loads(json.dumps(await mk_backup(pg))); new['data'] = {'hp_kids': json.dumps([{**KID, 'name': 'سلمى ٢'}], ensure_ascii=False), 'hp_kid': json.dumps('k1'),
    'hp_prog:k1': json.dumps({'schema': 3, 'srs': {}, 'ws': {}, 'streams': {}, 'm1.u2.d1': {'done': True, 'at': 9, 'path': 'mat'}}), 'hp_settings:k1': json.dumps({'sessionMax': 3, 'muted': True})}
  NEW = {k: json.loads(v) for k, v in new['data'].items()}
  text = json.dumps(new, ensure_ascii=False)
  async def reset():
    await pg.evaluate("(o) => { localStorage.clear(); for (const [k, v] of Object.entries(o)) localStorage.setItem(k, JSON.stringify(v)); }", OLD); await reopen(pg)
  # عدد الكتابات في الاستعادة الكاملة
  await reset(); await pg.evaluate(INSTR, ['count', 0]); r = await pg.evaluate("(t) => { const a = backupApply(backupCheck(t)); window.__restoreStorage(); return [a === true || !!(a && a.ok), window.__ops]; }", text)
  n_ops = r[1]; st = await pg.evaluate(HP); check('A04', r[0] and same(st, NEW), 'الاستعادة بلا عطل: الجديد كاملاً (%d كتابة)' % n_ops, [r])
  rescue = await pg.evaluate("() => { try { return JSON.parse(localStorage.getItem('hp_before_restore')).data; } catch (e) { return null; } }")
  check('A04', rescue is not None and same({k: json.loads(v) for k, v in rescue.items()}, OLD), 'ونسخة ما كان على الجهاز محفوظة كاملة', list((rescue or {}).keys()))
  bad = []
  for mode in ('one', 'from'):
    for at in range(1, n_ops + 2):
      await reset(); await pg.evaluate(INSTR, [mode, at])
      r, part = await pg.evaluate("(t) => { let a; try { a = backupApply(backupCheck(t)); } catch (e) { a = { ok: false, threw: String(e) }; } window.__restoreStorage(); return [a === true || !!(a && a.ok), !!(a && a.why === 'partial')]; }", text)
      st = await pg.evaluate(HP); now_ok = same(st, NEW) if r else (same(st, OLD) or part)   # «partial»: تعذّر الإرجاع في الحال فيُعاد الفتح (اللوحة تعيده)، والمطلوب ما بعده
      await reopen(pg); st2 = await pg.evaluate(HP); after_ok = same(st2, NEW) if r else same(st2, OLD)
      if not (now_ok and after_ok): bad.append([mode, at, r, sorted(st.keys()), sorted(st2.keys())])
  check('A04', not bad, 'فشل الكتابة في كل موضع (كتابة واحدة، ومن موضعٍ إلى النهاية): ما كان كاملاً أو الجديد كاملاً، قبل إعادة الفتح وبعدها', bad[:4])
  bad = []
  for at in range(1, n_ops + 2):   # انقطاعٌ قبل الكتابة رقم at (يُغلق التطبيق): ما بعدها لا يُكتب، ثم يُفتح من جديد
    await reset(); await pg.evaluate(INSTR, ['freeze', at])
    await pg.evaluate("(t) => { try { backupApply(backupCheck(t)); } catch (e) {} }", text); await reopen(pg)
    st = await pg.evaluate(HP); left = await pg.evaluate("() => Object.keys(localStorage).filter(k => /restore_pending|hp_restore/.test(k))")
    if not (same(st, OLD) or same(st, NEW)) or left: bad.append([at, sorted(st.keys()), left])
  check('A04', not bad, 'انقطاع الاستعادة في كل موضع ثم إعادة الفتح: ما كان كاملاً أو الجديد كاملاً', bad[:4])
  # الرسالة في اللوحة لا تزعم حفظ ما كان إن لم يُحفظ (والمساحة ممتلئة من أول كتابة)
  await reset(); f = os.path.join(TMP, 'new.json'); open(f, 'w', encoding='utf-8').write(text)
  await pg.evaluate("() => openPanel()"); await pg.set_input_files('#bkIn', [f]); await pg.wait_for_timeout(250)
  await pg.click('#bkGo'); await pg.evaluate(INSTR, ['from', 1]); await pg.click('#bkGo'); await pg.wait_for_timeout(300)
  msg = await pg.text_content('#bkMsg'); await pg.evaluate("() => window.__restoreStorage()")
  kept = await pg.evaluate("() => !!localStorage.getItem('hp_before_restore')"); st = await pg.evaluate(HP)
  claims = 'حُفظ ما كان' in msg or 'وحُفظ' in msg
  check('A04', same(st, OLD) and not (claims and not kept) and 'استُعيدت' not in msg, 'المساحة ممتلئة: لا يتغيّر شيء، والرسالة لا تزعم حفظاً ولا استعادة', [msg, kept])
  await pg.wait_for_timeout(2800); st = await pg.evaluate(HP); check('A04', same(st, OLD), 'وبعد مهلة الرسالة: ما كان كما هو')
  check('A04', not errs, 'لا أخطاء في الصفحة (الاستعادة)', errs[:3]); await ctx.close()

# ---------- A06: تبويبان ----------
async def tab_cases(b):
  p = {'m1.u2.d4': {'done': True, 'at': 1, 'path': 'mat', 'cs': {'C008': {'entry': True, 'appOk': True, 'ok': 3, 'of': 3, 'round': 1, 'at': 1}}}}
  ctx, A, errsA = await fresh(b, p); await A.evaluate("() => openPanel()")
  B = await ctx.new_page(); errsB = []; B.on('pageerror', lambda e: errsB.append(str(e))); await B.goto(URL); await B.wait_for_timeout(600)
  st = await A.evaluate("""() => { const c = $('#tabCover'); const r = c.getBoundingClientRect(); const top = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
    const z = e => +getComputedStyle(e).zIndex || 0; return { lost: TAB_LOST, shown: !c.hidden, top: !!top && c.contains(top) && z(c) > z($('#panel')), panelInert: !!$('#panel').inert || !!$('#panel').closest('[inert]') }; }""")   # فوقها رسماً لا لمساً وحده: العناصر الخاملة لا تُلمس
  check('A06', st['lost'] and st['shown'] and st['top'], 'التبويب الأقدم يرى غطاء التبويب فوق لوحة الكبار', st)
  await B.evaluate("() => { progOf('m1.u1.d1').done = true; saveProg(); }")
  # كاتب قديم في A من كل شاشة: زرّ بطاقة الكبير (معالجٌ باقٍ)، وحفظ التقدّم، وتعديل الملف، وحذف طفل، والاستعادة، والإعدادات، والسجل
  r = await A.evaluate("""() => { const out = {}; const b = document.querySelector('[data-ac="m1.u2.d4"][data-i="0"][data-v="1"]'); if (b) b.click();
    progOf('m1.u1.d3').done = true; out.save = saveProg(); KIDS[0].name = 'قديم'; out.kids = store.set('hp_kids', KIDS); SET.sessionMax = 3; out.set = saveSet();
    logAttempt({ scene: 'stale', ok: true }); let ap; try { const c = backupCheck(JSON.stringify(backupData())); ap = backupApply(c); } catch (e) { ap = String(e); } out.apply = ap === true || !!(ap && ap.ok); return out; }""")
  stored = await B.evaluate("() => { const P = JSON.parse(localStorage.getItem('hp_prog:k1')); const L = JSON.parse(localStorage.getItem('hp_log:k1') || '{\"attempts\":[]}'); return { d1: !!(P['m1.u1.d1'] || {}).done, d3: !!(P['m1.u1.d3'] || {}).done, adult: P.adult || null, name: JSON.parse(localStorage.getItem('hp_kids'))[0].name, max: JSON.parse(localStorage.getItem('hp_settings:k1')).sessionMax, stale: L.attempts.some(a => a.scene === 'stale') }; }")
  check('A06', stored['d1'] and not stored['d3'] and not stored['adult'] and stored['name'] == 'سلمى' and stored['max'] == 0 and not stored['stale'] and not r['apply'], 'الكاتب القديم في التبويب الأقدم لا يكتب شيئاً، ويبقى تقدّم التبويب الأحدث', [r, stored])
  # تبويبٌ فاته إشعار التبويب الآخر (عُلّق ثم عاد) والقفل انتهى: يُردّ بمراجعة ما كتبه غيره
  await B.close(); await A.evaluate("() => { TAB_LOST = false; $('#tabCover').hidden = true; localStorage.setItem('hp_lock', JSON.stringify({ tab: 'gone', t: Date.now() - 60000 })); }")
  r = await A.evaluate("() => { progOf('m1.u1.d4').done = true; return saveProg(); }")
  stored = await A.evaluate("() => { const P = JSON.parse(localStorage.getItem('hp_prog:k1')); return { d1: !!(P['m1.u1.d1'] || {}).done, d4: !!(P['m1.u1.d4'] || {}).done, lost: TAB_LOST, cover: !$('#tabCover').hidden }; }")
  check('A06', stored['d1'] and not stored['d4'] and stored['lost'] and stored['cover'], 'تبويبٌ عاد بعد تعليقٍ فاته فيه ما كتبه غيره: لا يكتب فوقه، ويظهر غطاؤه', [r, stored])
  await reopen(A); st = await A.evaluate("() => ({ d1: !!(PROG['m1.u1.d1'] || {}).done, lost: TAB_LOST, cover: !$('#tabCover').hidden })")
  check('A06', st['d1'] and not st['lost'] and not st['cover'], 'بعد إغلاق التبويبين وإعادة الفتح: أحدث البيانات، والتطبيق يعمل', st)
  # «هنا» في التبويب الأقدم يعيد قراءة الحالة قبل أيّ حفظ
  B = await ctx.new_page(); await B.goto(URL); await B.wait_for_timeout(600); await B.evaluate("() => { progOf('m1.u1.d5').done = true; saveProg(); }")
  await A.wait_for_timeout(200); here = await A.evaluate("() => { const h = document.querySelector('#tabHere'); if (!h || $('#tabCover').hidden) return false; h.click(); return true; }"); await A.wait_for_timeout(900)
  st = await A.evaluate("() => ({ d5: !!(PROG['m1.u1.d5'] || {}).done, lost: TAB_LOST })"); await A.evaluate("() => { progOf('m1.u1.d6').done = true; saveProg(); }")
  st2 = await A.evaluate("() => { const P = JSON.parse(localStorage.getItem('hp_prog:k1')); return { d5: !!(P['m1.u1.d5'] || {}).done, d6: !!(P['m1.u1.d6'] || {}).done }; }")
  check('A06', here and st['d5'] and not st['lost'] and st2['d5'] and st2['d6'], '«هنا» يعيد قراءة الحالة ثم يحفظ فوقها', [here, st, st2])
  check('A06', not errsA and not errsB, 'لا أخطاء في الصفحتين', (errsA + errsB)[:3]); await ctx.close()

# ---------- A07: المراجعة لكل مفهوم ----------
CLOCK = """() => { if (window.__clockSet) return; window.__clockSet = true; const real = Date.now.bind(Date); window.__off = 0; Date.now = () => real() + window.__off; }"""
async def review_days(pg, days, policy):   # يمضي الأيام: كل يوم «مراجعة اليوم» إن حانت، ويجيب الطفل بحسب policy(اليوم، المفهوم، رقم سؤاله)
  await pg.evaluate(CLOCK)
  await pg.evaluate("""() => { if (window.__wrapped) return; window.__wrapped = true; window.__rv = []; const o = runItem;
    runItem = window.runItem = (s, m, c) => { if (m === 'review') window.__rv.push([CUR ? CUR.id : null, s.c || null, (c && c.scene) || m, window.__day || 0]); return o(s, m, c); }; }""")
  sessions = []
  for day in range(1, days + 1):
    await pg.evaluate("(d) => { window.__day = d; window.__off = d * 864e5; showHome(); }", day); await pg.wait_for_timeout(60)
    if not await pg.evaluate("() => !!document.querySelector('.stop.review')"): continue
    n0 = await pg.evaluate("() => window.__rv.length"); await pg.click('.stop.review'); last = None; asked = {}
    for _ in range(3000):
      s = await pg.evaluate("() => ({ a: window.__auto ? window.__auto.n : null, mode: window.__itemMode || '', c: window.__item && window.__item.spec ? window.__item.spec.c || null : null, home: !$('#home').hidden && [...document.querySelectorAll('.cover')].every(c => c.hidden), go: !!(document.querySelector('#go') && !document.querySelector('#go').disabled && !document.querySelector('#go').classList.contains('idle')) })")
      if s['home']: break
      if s['a'] is not None and s['a'] != last:
        last = s['a']; key = (s['c'], len(await pg.evaluate("() => window.__rv")))
        first = key not in asked; asked[key] = True
        good = policy(day, s['c'], first) if s['mode'] == 'review' else True
        await pg.evaluate("(g) => { const a = window.__auto; if (!a) return; if (g || !a.wrong) a.ok(); else a.wrong(); }", good)
      elif s['go']: await pg.click('#go')
      await pg.wait_for_timeout(25)
    rv = await pg.evaluate("() => window.__rv"); sessions.append([day, rv[n0:]])
  return sessions
async def review_cases(b):
  done = lambda ids: {i: {'done': True, 'at': 1, 'path': 'mat', 'mastered': True} for i in ids}
  # (1) كل مفهوم يُسأل في كل مراحله قبل أن يثبت: درسان متعددا المفاهيم معاً
  ctx, pg, errs = await fresh(b, done(['m1.u1.d2', 'm1.u4.d2']))
  await pg.evaluate("() => { srsStart('m1.u1.d2'); srsStart('m1.u4.d2'); saveProg(); }")
  ss = await review_days(pg, 70, lambda d, c, f: True)
  per = {}; cap = 0
  for day, rv in ss:
    firsts = [x for x in rv if x[2] == 'review']; cap = max(cap, len(firsts))
    for x in firsts: per.setdefault((x[0], x[1]), []).append(day)
  want = {('m1.u1.d2', 'C002'), ('m1.u1.d2', 'N001'), ('m1.u1.d2', 'C004'), ('m1.u4.d2', 'C024'), ('m1.u4.d2', 'C025')}
  cov = {k: len(per.get(k, [])) for k in sorted(want)}
  left = await pg.evaluate("() => reviewDue().length")
  check('A07', all(v >= 4 for v in cov.values()) and left == 0, 'كل مفهوم في الدرسين يُسأل أربع مرات على الأقل قبل أن يثبت درسه', {'%s:%s' % k: v for k, v in cov.items()})
  check('A07', 0 < cap <= 3, 'جلسة المراجعة بسقفها: ثلاثة بنود على الأكثر قبل بند الخطأ الثاني', cap)
  gaps_ok = all(all(b2 - a2 >= 1 for a2, b2 in zip(v, v[1:])) for v in per.values())
  check('A07', gaps_ok, 'لا يُسأل المفهوم مرتين في يوم واحد من بنوده الأولى', {'%s:%s' % k: v for k, v in per.items()})
  await pg.evaluate("() => openPanel()"); txt = await pg.evaluate("() => { const d = [...document.querySelectorAll('#panel details')].find(x => /المراجعة المتباعدة/.test(x.textContent)); return d ? d.textContent : ''; }")
  check('A07', 'ثابت' in txt, 'اللوحة تعرض «ثابت» بعد أن ثبتت المفاهيم كلها', txt[:200])
  check('A07', not errs, 'لا أخطاء في الصفحة (المراجعة)', errs[:3]); await ctx.close()
  # (2) «ثابت» لا يظهر إلا بدليله: بعد أربعين يوماً، كل سطر «ثابت» في اللوحة (درساً أو مفهوماً) سُئلت مفاهيمه أربع مرات
  ctx, pg, errs = await fresh(b, done(['m1.u1.d2']))
  await pg.evaluate("() => { srsStart('m1.u1.d2'); saveProg(); }")
  ss = await review_days(pg, 40, lambda d, c, f: True); cnt = {}
  for _, rv in ss:
    for x in rv:
      if x[2] == 'review': cnt[x[1]] = cnt.get(x[1], 0) + 1
  await pg.evaluate("() => openPanel()")
  rows = await pg.evaluate("""() => { const d = [...document.querySelectorAll('#panel details')].find(x => /المراجعة المتباعدة/.test(x.textContent)); const L = LDATA['m1.u1.d2'];
    return d ? [...d.querySelectorAll('tr')].filter(r => /ثابت/.test(r.textContent)).map(r => { const t = r.cells[0].textContent.trim(); const C = Object.keys(L.concepts).find(c => t === L.concepts[c] || t.endsWith(L.concepts[c]));
      return C ? [C] : t.includes(plain(L.title)) ? Object.keys(L.concepts) : ['?' + t]; }) : []; }""")
  bad = [r for r in rows if any(cnt.get(c, 0) < 4 for c in r)]
  check('A07', rows and not bad, 'كل «ثابت» في اللوحة سُئلت مفاهيمه أربع مرات', [cnt, rows])
  await ctx.close()
  # (3) الخطأ يرجع مفهومه وحده: الجدول نفسه للمفاهيم الأخرى بخطأٍ وبلا خطأ
  runs = []
  for err in (False, True):
    ctx, pg, errs = await fresh(b, done(['m1.u1.d2']))
    await pg.evaluate("() => { srsStart('m1.u1.d2'); saveProg(); }")
    hit = {'n': 0}
    def pol(d, c, first, err=err, hit=hit):
      if err and c == 'C002' and first and hit['n'] == 0: hit['n'] = 1; return False
      return True
    ss = await review_days(pg, 50, pol); per = {}
    for day, rv in ss:
      for x in rv:
        if x[2] == 'review': per.setdefault(x[1], []).append(day)
    seconds = [x for _, rv in ss for x in rv if x[2] != 'review']
    runs.append((per, seconds)); await ctx.close()
  (p0, _), (p1, sec) = runs
  others = all(p0.get(c) == p1.get(c) for c in ('N001', 'C004'))
  check('A07', others and p1.get('C002') != p0.get('C002') and len(p1.get('C002', [])) > len(p0.get('C002', [])) and sec and all(x[1] == 'C002' for x in sec),
        'خطأ في C002 يرجعه وحده (ويُتبع ببند ثانٍ منه)، وجدول N001 وC004 كما هو', {'بلا خطأ': p0, 'بخطأ': p1, 'البند الثاني': sec[:2]})

# ---------- A08: حذف الطفل ----------
def wav_bytes(ms=80):
  bb = io.BytesIO(); w = wave.open(bb, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(8000); w.writeframes(struct.pack('<' + 'h' * (8 * ms), *([0] * (8 * ms)))); w.close(); return bb.getvalue()
ROWS = "async () => { const db = await IDB.open(); if (!db) return null; return await new Promise(res => { const r = db.transaction('photos').objectStore('photos').getAll(); r.onsuccess = () => res(r.result.map(x => [x.id, x.kid])); r.onerror = () => res(null); }); }"
async def delete_cases(b):
  k2 = {'id': 'k2', 'name': 'علي', 'gender': 'm', 'photo': '', 'avatar': 'm2'}
  extra = {'hp_prog:k2': json.dumps({'schema': 3, 'm1.u1.d1': {'done': True, 'at': 1}}), 'hp_log:k2': json.dumps({'attempts': []}), 'hp_designs:k2': '[]',
           'hp_prog_bak:k2:v2': '{}', 'hp_corrupt:hp_prog:k2:1700000000000': '{}', 'hp_designs:k1': '[]'}
  for fail in (False, True):
    ctx, pg, errs = await fresh(b, {'m1.u1.d1': {'done': True, 'at': 1}}, kids=[KID, k2], extra=extra)
    loose = os.path.join(TMP, 'gen.first.hello.wav'); open(loose, 'wb').write(wav_bytes())
    await pg.evaluate("() => openPanel()"); await pg.set_input_files('#vpIn', [loose]); await pg.wait_for_function("() => /استُورد|لم يُستورد|تعذّر/.test(document.querySelector('#vpMsg').textContent)", timeout=15000)
    vp0 = await pg.evaluate("() => VPACK.n")
    await pg.evaluate("async () => { await IDB.put({ id: 'pk1', kid: 'k1', k: 'circle', t: 1, data: 'data:image/jpeg;base64,AAAA' }); await IDB.put({ id: 'pk2', kid: 'k2', k: 'circle', t: 2, data: 'data:image/jpeg;base64,AAAA' }); await IDB.put({ id: 'pk3', kid: 'k2', k: 'square', t: 3, data: 'data:image/jpeg;base64,AAAA' }); }")
    if fail:   # إخفاق معاملة حذف الصور
      await pg.evaluate("() => { const db0 = IDB.db; const P = IDBObjectStore.prototype, d0 = P.delete; window.__undel = () => { P.delete = d0; }; P.delete = function () { throw new DOMException('fail', 'UnknownError'); }; }")
    await pg.evaluate("() => openPanel()"); await pg.click('[data-del="k2"]'); await pg.click('[data-del="k2"]'); await pg.wait_for_timeout(500)
    if fail: await pg.evaluate("() => window.__undel()")
    rows = await pg.evaluate(ROWS); keys = await pg.evaluate("() => Object.keys(localStorage).filter(k => /k2/.test(k))")
    kids = await pg.evaluate("() => KIDS.map(k => k.id)"); txt = await pg.evaluate("() => $('#panel').textContent")
    stored_kids = await pg.evaluate("() => JSON.parse(localStorage.getItem('hp_kids')).map(k => k.id)")
    if not fail:
      await reopen(pg); rows2 = await pg.evaluate(ROWS); vp1 = await pg.evaluate("() => new Promise(r => setTimeout(() => r(VPACK.n), 300))")
      k1 = await pg.evaluate("() => ({ d1: !!(PROG['m1.u1.d1'] || {}).done, kids: KIDS.map(k => k.id) })")
      check('A08', 'k2' not in kids and 'k2' not in stored_kids and not keys and rows is not None and all(r[1] != 'k2' for r in rows) and ['pk1', 'k1'] in rows and rows2 == rows,
            'حذف الطفل يمحو صوره ومفاتيحه ونسخه، وتبقى صور الطفل الآخر، وبعد إعادة الفتح كذلك', [keys, rows, rows2])
      check('A08', k1['d1'] and k1['kids'] == ['k1'] and vp1 == vp0 == 1, 'ولا يتغيّر تقدّم الطفل الآخر ولا حزمة الصوت', [k1, vp0, vp1])
    else:
      check('A08', 'k2' in kids and 'k2' in stored_kids and 'hp_prog:k2' in keys and rows is not None and sum(1 for r in rows if r[1] == 'k2') == 2 and 'تعذّر' in txt,
            'إخفاق حذف الصور: لا يُحذف الطفل ولا يُعلَن حذفه، وتظهر رسالة', [kids, keys, rows, txt[txt.find('تعذّر') - 10:][:80] if 'تعذّر' in txt else ''])
    check('A08', not errs, 'لا أخطاء في الصفحة (الحذف%s)' % (' مع الإخفاق' if fail else ''), errs[:3]); await ctx.close()

# ---------- إعادة الفحص المستقلة (30 أكتوبر 2026، المعرّفات WM101-R1-01..03 ثابتة، مرتبطة بـ A06 وA08) ----------
K2 = {'id': 'k2', 'name': 'علي', 'gender': 'm', 'photo': '', 'avatar': 'm2'}
K2_KEYS = ['hp_prog:k2', 'hp_log:k2', 'hp_designs:k2', 'hp_settings:k2', 'hp_prog_bak:k2:v2', 'hp_corrupt:hp_prog:k2:1700000000000']
def k2_extra():
  rescue = {'v': 1, 't': 1, 'data': {'hp_kids': json.dumps([KID, K2], ensure_ascii=False), 'hp_kid': '"k1"', 'hp_prog:k1': '{"schema":3}', 'hp_prog:k2': '{"schema":3}'}}
  return {'hp_prog:k2': json.dumps({'schema': 3, 'm1.u1.d1': {'done': True, 'at': 1}}), 'hp_log:k2': json.dumps({'attempts': []}), 'hp_designs:k2': '[]',
          'hp_prog_bak:k2:v2': '{}', 'hp_corrupt:hp_prog:k2:1700000000000': '{}', 'hp_before_restore': json.dumps(rescue, ensure_ascii=False)}
# حال الحذف كما تراه الذاكرة والتخزين والقاعدة واللوحة
DSTATE = """async () => { const db = await IDB.open(true); let rows = null;
  if (db) rows = await new Promise(res => { const r = db.transaction('photos').objectStore('photos').getAll(); r.onsuccess = () => res(r.result.map(x => x.id)); r.onerror = () => res(null); });
  let rescue = null; try { const d = JSON.parse(localStorage.getItem('hp_before_restore')); rescue = Object.keys(d.data).filter(k => /k2/.test(k) || (k === 'hp_kids' && /"k2"/.test(d.data[k]))); } catch (e) {}
  const note = document.querySelector('#kidDelNote');
  return { mem: KIDS.some(k => k.id === 'k2'), stored: JSON.parse(localStorage.getItem('hp_kids')).some(k => k.id === 'k2'),
    keys: Object.keys(localStorage).filter(k => /^hp_.*:k2(:|$)/.test(k)).sort(), photos: rows && rows.filter(x => x === 'pk2' || x === 'pk3'), pk1: !!rows && rows.includes('pk1'),
    rescue, note: note ? note.textContent : '', finish: !!document.querySelector('[data-del="k2"][data-sure="1"]'), marker: localStorage.getItem('hp_kid_del'),
    k1: !!(JSON.parse(localStorage.getItem('hp_prog:k1')) || {})['m1.u1.d1'], memPhotos: IDB.mem.filter(x => x.kid === 'k2').length }; }"""
GONE = lambda st: not st['mem'] and not st['stored'] and not st['keys'] and st['photos'] == [] and not st['rescue'] and st['pk1'] and st['k1'] and not st['memPhotos']
WHOLE = lambda st: st['mem'] and st['stored'] and st['keys'] == sorted(K2_KEYS) and st['photos'] == ['pk2', 'pk3'] and st['pk1'] and st['k1']
async def seed_k2(b):
  ctx, pg, errs = await fresh(b, {'m1.u1.d1': {'done': True, 'at': 1}}, kids=[KID, K2], extra=k2_extra())
  await pg.evaluate("async () => { localStorage.setItem('hp_settings:k2', JSON.stringify({ sessionMax: 0, muted: true })); for (const [id, kid, t] of [['pk1', 'k1', 1], ['pk2', 'k2', 2], ['pk3', 'k2', 3]]) await IDB.put({ id, kid, k: 'circle', t, data: 'data:image/jpeg;base64,AAAA' }); }")
  await reopen(pg); await pg.evaluate("() => openPanel()"); return ctx, pg, errs
async def del_click(pg, finish=False):   # بلا زرٍّ (الطفل غاب، أو لا «أكملوا» في الأصل): لا ضغط، فيُحكم بالحال كما هي ولا يتوقّف الفحص
  sel = '[data-del="k2"][data-sure="1"]' if finish else '[data-del="k2"]:not([data-sure="1"])'
  if not await pg.query_selector(sel): return False
  await pg.click(sel)
  if not finish: await pg.click('[data-del="k2"]:not(#kidDelNote + .seg [data-del])')
  await pg.wait_for_timeout(450); return True
async def r1_cases(b):
  # WM101-R1-01: إخفاق كل كتابة في الحذف (حذف كل مفتاح، وسجلّ الحذف، ونسخة ما قبل الاستعادة، والقائمة) ثم إعادة الفتح ثم الإكمال
  points = [('removeItem', k) for k in K2_KEYS] + [('setItem', 'hp_kid_del'), ('setItem', 'hp_before_restore'), ('setItem', 'hp_kids')]
  for how, key in points:
    ctx, pg, errs = await seed_k2(b)
    await pg.evaluate("""([how, key]) => { const P = Storage.prototype, f0 = P[how]; P[how] = function (k, v) { if (k === key) throw new DOMException('blocked', 'QuotaExceededError'); return f0.call(this, k, v); }; }""", [how, key])
    await del_click(pg); s1 = await pg.evaluate(DSTATE)
    await reopen(pg); await pg.evaluate("() => openPanel()"); s2 = await pg.evaluate(DSTATE)
    nothing = how == 'setItem' and key == 'hp_kid_del'   # سجلّ الحذف لا يُكتب: لا يبدأ شيء
    ok1 = s1['mem'] == s1['stored'] and s2['mem'] == s2['stored'] and s1['stored'] and s2['stored']
    ok2 = 'تعذّر' in s1['note'] and (WHOLE(s1) and WHOLE(s2) and not s2['note'] if nothing else ('لم يكتمل' in s2['note'] and s2['finish']))
    check('R1-01', ok1 and ok2, 'إخفاق %s(%s) في الحذف: الطفل في الذاكرة كما في التخزين، ولا يُعلَن حذفه، و%s' % (how, key, 'لا يتغيّر شيء' if nothing else 'اللوحة تقول إن حذفه لم يكتمل وبعد إعادة الفتح'),
          {'قبل': {k: s1[k] for k in ('mem', 'stored', 'keys', 'photos', 'note')}, 'بعد الفتح': {k: s2[k] for k in ('mem', 'stored', 'keys', 'photos', 'note')}})
    if not nothing:
      await del_click(pg, finish=True); s3 = await pg.evaluate(DSTATE); await reopen(pg); await pg.evaluate("() => openPanel()"); s4 = await pg.evaluate(DSTATE)
      check('R1-01', GONE(s3) and GONE(s4) and not s3['note'] and not s4['marker'], 'وبعد زوال الإخفاق: «أكملوا الحذف» يكمله كله، ويبقى الطفل الأول وصوره، وبعد إعادة الفتح', [{k: s3[k] for k in ('mem', 'stored', 'keys', 'photos', 'rescue')}, s4['marker']])
    check('R1-01', not errs, 'لا أخطاء في الصفحة (إخفاق %s(%s))' % (how, key), errs[:3]); await ctx.close()
  # WM101-R1-03: قاعدة الصور لا تُفتح (موجودة من قبل): لا يُحذف الطفل، وتبقى صور الذاكرة، ويكتمل الحذف حين يعود الوصول
  ctx, pg, errs = await seed_k2(b)
  await pg.evaluate("""() => { if (IDB.db) IDB.db.close(); IDB.db = null; IDB.mem.push({ id: 'pm2', kid: 'k2', k: 'circle', t: 5, data: 'data:image/jpeg;base64,AAAA' });
    window.__idbOpen = indexedDB.open; indexedDB.open = function () { throw new DOMException('no', 'UnknownError'); }; }""")
  await del_click(pg); s1 = await pg.evaluate("""() => ({ mem: KIDS.some(k => k.id === 'k2'), stored: JSON.parse(localStorage.getItem('hp_kids')).some(k => k.id === 'k2'),
    keys: Object.keys(localStorage).filter(k => /^hp_.*:k2(:|$)/.test(k)).length, memPhotos: IDB.mem.filter(x => x.kid === 'k2').length, note: ($('#kidDelNote') || {}).textContent || '' })""")
  check('R1-03', s1['mem'] and s1['stored'] and s1['keys'] == len(K2_KEYS) and s1['memPhotos'] == 1 and 'صوره' in s1['note'] and 'لم يكتمل' in s1['note'],
        'قاعدة الصور لا تُفتح: لا يُحذف الطفل ولا مفاتيحه، وتبقى صوره في الذاكرة، وتقول اللوحة لماذا لم يكتمل', s1)
  await pg.evaluate("() => { indexedDB.open = window.__idbOpen; }"); await del_click(pg, finish=True); s3 = await pg.evaluate(DSTATE)
  await reopen(pg); s4 = await pg.evaluate(DSTATE)
  check('R1-03', GONE(s3) and GONE(s4), 'وحين يعود الوصول: «أكملوا الحذف» يكمله كله، وبعد إعادة الفتح', [{k: s3[k] for k in ('mem', 'stored', 'keys', 'photos', 'memPhotos')}])
  check('R1-03', not errs, 'لا أخطاء في الصفحة (قاعدة الصور لا تُفتح)', errs[:3]); await ctx.close()
  # WM101-R1-02: عملٌ بدأ قبل فقد القفل لا يكتب ولا يحذف بعده، في كل موضع انتظار، وواجهة الصيد الحقيقية
  PEND_OPEN = "() => { window.__open0 = IDB.open; IDB.open = function (r) { return new Promise(res => { window.__go = () => { IDB.open = window.__open0; res(window.__open0.call(IDB, r)); }; }); }; }"
  LOSE_IN_TX = "() => { const P = IDBObjectStore.prototype, g0 = P.getAll; P.getAll = function () { const r = g0.apply(this, arguments); localStorage.setItem('hp_lock', JSON.stringify({ tab: 'other', t: Date.now() })); P.getAll = g0; return r; }; }"
  for where in ('open', 'tx'):
    ctx, A, errs = await seed_k2(b); errsB = []
    if where == 'open': await A.evaluate(PEND_OPEN)
    else: await A.evaluate(LOSE_IN_TX)
    if where == 'tx': await del_click(A)
    else: await A.click('[data-del="k2"]:not([data-sure="1"])'); await A.click('[data-del="k2"]')   # بلا انتظار: الحذف معلّق عند فتح القاعدة
    if where == 'open':
      B = await ctx.new_page(); B.on('pageerror', lambda e: errsB.append(str(e))); await B.goto(URL); await B.wait_for_timeout(500)
      lost = await A.evaluate('() => TAB_LOST'); await A.evaluate('() => window.__go()'); await A.wait_for_timeout(450)
    else: B = await ctx.new_page(); B.on('pageerror', lambda e: errsB.append(str(e))); await B.goto(URL); await B.wait_for_timeout(500); lost = await A.evaluate('() => TAB_LOST')
    st = await B.evaluate(DSTATE); a_txt = await A.evaluate("() => ($('#kidDelNote') || {}).textContent || ''")
    check('R1-02', lost and WHOLE(st), 'حذف طفل وفقد القفل %s: لا يُحذف شيء من صوره ولا مفاتيحه ولا قائمته' % ('أثناء فتح القاعدة' if where == 'open' else 'داخل المعاملة قبل الحذف'), {k: st[k] for k in ('mem', 'stored', 'keys', 'photos')})
    await reopen(B); await B.evaluate("() => openPanel()"); st2 = await B.evaluate(DSTATE)
    check('R1-02', WHOLE(st2) and not a_txt, 'وبعد إعادة الفتح لا يعود الحذف الملغى وحده، ولا أثر له في واجهة التبويب الأقدم', [{k: st2[k] for k in ('mem', 'stored', 'keys', 'photos', 'note')}, a_txt])
    check('R1-02', not errs and not errsB, 'لا أخطاء في الصفحتين (الحذف، %s)' % where, (errs + errsB)[:3]); await ctx.close()
  # حفظ صورة: القفل يُفقد أثناء فتح القاعدة
  ctx, A, errs = await seed_k2(b); await A.evaluate("() => { IDB.db = null; }"); await A.evaluate(PEND_OPEN)
  await A.evaluate("() => { window.__put = IDB.put({ id: 'late', kid: 'k1', k: 'circle', t: 9, data: 'data:image/jpeg;base64,AAAA' }); }")
  B = await ctx.new_page(); await B.goto(URL); await B.wait_for_timeout(500); await A.evaluate('() => window.__go()'); r = await A.evaluate('() => window.__put')
  rows = await B.evaluate(ROWS)
  check('R1-02', r == 'tab' and rows is not None and all(x[0] != 'late' for x in rows), 'صورةٌ بدأ حفظها قبل فقد القفل لا تُكتب بعده', [r, rows]); await ctx.close()
  # وواجهة الصيد الحقيقية: اختيار الصورة بعد أن يأخذ تبويبٌ آخر القفل (والصورة تُقرأ وتُرسم ثم تُحفظ)
  ctx, A, errs = await fresh(b, {'m1.u1.d1': {'done': True, 'at': 1}})
  png = os.path.join(TMP, 'shape.png'); open(png, 'wb').write(__import__('base64').b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='))
  await A.evaluate("() => openGallery()"); await A.wait_for_timeout(300)
  async with A.expect_file_chooser() as fc: await A.click('[data-hunt="circle"]')
  chooser = await fc.value
  B = await ctx.new_page(); await B.goto(URL); await B.wait_for_timeout(500)
  n0 = await A.evaluate("() => LOG.attempts.filter(x => x.scene === 'hunt').length")
  await chooser.set_files(png); await A.wait_for_timeout(1200)
  rows = await B.evaluate(ROWS); n1 = await A.evaluate("() => LOG.attempts.filter(x => x.scene === 'hunt').length")
  logB = await B.evaluate("() => (JSON.parse(localStorage.getItem('hp_log:k1') || '{\"attempts\":[]}').attempts || []).filter(x => x.scene === 'hunt').length")
  check('R1-02', rows is not None and not any(x[1] == 'k1' for x in rows) and n1 == n0 and logB == 0, 'صورة الصيد تُختار بعد فقد القفل: لا تُحفظ، ولا تُحسب صيداً', [rows, n0, n1, logB])
  check('R1-02', not errs, 'لا أخطاء في الصفحة (الصيد)', errs[:3]); await ctx.close()
  # حزمة الصوت: حذفها والقفل يُفقد أثناء فتح قاعدتها
  ctx, A, errs = await fresh(b, {}); loose = os.path.join(TMP, 'gen.first.hello.wav'); open(loose, 'wb').write(wav_bytes())
  await A.evaluate("() => openPanel()"); await A.set_input_files('#vpIn', [loose]); await A.wait_for_function("() => /استُورد|لم يُستورد|تعذّر/.test(document.querySelector('#vpMsg').textContent)", timeout=15000)
  await A.evaluate("() => { window.__vo = VPACK.open; VPACK.open = function () { return new Promise(res => { window.__vgo = () => { VPACK.open = window.__vo; res(window.__vo.call(VPACK)); }; }); }; window.__vclr = VPACK.clear(); }")
  B = await ctx.new_page(); await B.goto(URL); await B.wait_for_timeout(500); await A.evaluate('() => window.__vgo()'); r = await A.evaluate('() => window.__vclr')
  await B.reload(); await B.wait_for_timeout(700); n = await B.evaluate('() => VPACK.n')
  check('R1-02', r is False and n == 1, 'حذف حزمة الصوت بعد فقد القفل لا يمحوها', [r, n]); await ctx.close()

# حذفٌ معلّق (لم يكتمل) عبر تبويبين وإعادة الفتح (ملاحظة المراجع بعد الجولة الثانية):
# القائمة تطابق المحفوظ في كل تبويب وبعد كل فتح، والتبويب الأقدم لا يكتب للطفل الجاري حذفه ولا يحذف، والإكمال من التبويب الجديد بعد عودة التخزين،
# والطفل الآخر سليم. واختيار الطفل المعلّق حذفه يلغي الحذف ويقول ذلك، والقائمة كالمحفوظ.
PEND_LATE = """async () => { const r = {}; r.put = await IDB.put({ id: 'lateA', kid: 'k2', k: 'circle', t: 8, data: 'data:image/jpeg;base64,AAAA' });
  r.set = store.set('hp_prog:k2', { schema: 3, late: true }); r.del = typeof kidDelete === 'function' ? await kidDelete('k2') : { why: 'لا kidDelete' }; r.lost = TAB_LOST; return r; }"""
SEEN = "() => ({ mem: KIDS.map(k => k.id), stored: JSON.parse(localStorage.getItem('hp_kids')).map(k => k.id), kid: KID, marker: localStorage.getItem('hp_kid_del'), note: ($('#kidDelNote') || {}).textContent || '', late: localStorage.getItem('hp_prog:k2') })"
async def r1_pending(b):
  for how in ('finish', 'pick'):
    ctx, A, errs = await seed_k2(b); errsB = []
    await A.evaluate("() => { const P = Storage.prototype, f0 = P.removeItem; P.removeItem = function (k) { if (k === 'hp_log:k2') throw new DOMException('blocked', 'QuotaExceededError'); return f0.call(this, k); }; }")
    await del_click(A); sA = await A.evaluate(DSTATE)
    pend = sA['mem'] and sA['stored'] and 'لم يكتمل' in sA['note'] and sA['finish'] and bool(sA['marker'])
    check('R1-01', pend, 'حذفٌ معلّق في التبويب A (إخفاق حذف hp_log:k2): الطفل في القائمة كما في المحفوظ، واللوحة تعرض «أكملوا الحذف»', {k: sA[k] for k in ('mem', 'stored', 'keys', 'photos', 'note', 'marker')})
    B = await ctx.new_page(); B.on('pageerror', lambda e: errsB.append(str(e))); await B.goto(URL); await B.wait_for_timeout(500); await B.evaluate("() => openPanel()")
    sB = await B.evaluate(DSTATE)
    late = await A.evaluate(PEND_LATE); rowsB = await B.evaluate(ROWS); seenB = await B.evaluate(SEEN)
    check('R1-01', pend and late['lost'] and late['put'] == 'tab' and late['set'] is False and late['del'].get('why') == 'tab' and rowsB is not None and all(r[0] != 'lateA' for r in rowsB) and seenB['late'] is None
          and sB['mem'] and sB['stored'] and seenB['mem'] == seenB['stored'] and 'لم يكتمل' in sB['note'] and sB['finish'],
          'وفي التبويب B الأحدث: القائمة كالمحفوظ والحذف معلّق ظاهر، والتبويب A بعد فقد القفل لا يكتب صورةً ولا تقدّماً للطفل الجاري حذفه ولا يكمل حذفه', [late, seenB, rowsB, sB['note']])
    if how == 'finish':
      await del_click(B, finish=True); s3 = await B.evaluate(DSTATE); s3s = await B.evaluate(SEEN); await reopen(B); await B.evaluate("() => openPanel()"); s4 = await B.evaluate(DSTATE); s4s = await B.evaluate(SEEN)
      check('R1-01', GONE(s3) and GONE(s4) and s3s['mem'] == s3s['stored'] == ['k1'] and s4s['mem'] == s4s['stored'] == ['k1'] and not s4['marker'] and not s4['note'],
            'و«أكملوا الحذف» في B بعد عودة التخزين يكمله كله، والطفل الآخر وصوره وتقدّمه سليمة، والقائمة كالمحفوظ وبعد إعادة الفتح', [{k: s3[k] for k in ('keys', 'photos', 'rescue', 'pk1', 'k1')}, s3s, s4s])
    else:
      await B.evaluate("() => { $('#panel').hidden = true; openKids(); }"); await B.wait_for_timeout(200)
      if await B.query_selector('#kidList [data-kid="k2"]'):   # في الأصل غاب الطفل من القائمة: لا زرّ، فيُحكم بالحال كما هي
        async with B.expect_navigation(): await B.click('#kidList [data-kid="k2"]')
      await B.wait_for_timeout(500); await B.evaluate("() => openPanel()"); s3 = await B.evaluate(SEEN); k1 = await B.evaluate("() => !!(JSON.parse(localStorage.getItem('hp_prog:k1')) || {})['m1.u1.d1']")
      await reopen(B); await B.evaluate("() => openPanel()"); s4 = await B.evaluate(SEEN)
      check('R1-01', s3['kid'] == 'k2' and s3['marker'] is None and 'أُلغي' in s3['note'] and s3['mem'] == s3['stored'] == ['k1', 'k2'] and k1 and s4['marker'] is None and s4['mem'] == s4['stored'] == ['k1', 'k2'] and s4['kid'] == 'k2',
            'واختيار الطفل المعلّق حذفه في B يلغي الحذف ويقول ذلك، ولا يُستأنف بعد إعادة الفتح، والقائمة كالمحفوظ، والطفل الآخر سليم', [s3, s4, k1])
    check('R1-01', not errs and not errsB, 'لا أخطاء في الصفحتين (حذف معلّق، %s)' % how, (errs + errsB)[:3]); await ctx.close()

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch()
    if on('A01') or on('A02'): await adult_cases(b)
    if on('A03') or on('A05'): await import_cases(b)
    if on('A04'): await restore_cases(b)
    if on('A06'): await tab_cases(b)
    if on('A07'): await review_cases(b)
    if on('A08'): await delete_cases(b)
    if on('R1-01') or on('R1-02') or on('R1-03'): await r1_cases(b)
    if on('R1-01') or on('R1-01P'): await r1_pending(b)
    await b.close()
  print('FAILS:', len(FAILS)); sys.exit(1 if FAILS else 0)
asyncio.run(main())
