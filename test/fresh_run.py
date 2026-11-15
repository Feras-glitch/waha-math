# فحوص قبول المراجعة بعين جديدة (13 نوفمبر 2026، على فرع review/adv-2026-11 3c8443a) وما أُغلق معها من مراجعة الخصم (5 نوفمبر):
# كل فحص يخفق على 3c8443a ما لم يُذكر أنه ضابط (لا أخطاء في الصفحة، والسليم يبقى سليماً).
#   U1   صيغة الخطاب اختيارٌ صريح للكبار: بنتٌ اختارت صورة ولد تُحفظ «بنتاً»، والصورة تقترح ما لم يُختر؛ وتُعدَّل للطفل القائم؛ واللوحة تقولها.
#   U2   تنبيه «لا صوت عربي» في الخريطة للكبار: يظهر بلا صوت عربي، ولا يظهر بصوتٍ عربي (ضابط)، ويُنتظر محرّك أندرويد حتى يبدأ، ويُخفى ويبقى مخفياً.
#   U2   لا رقم قرار داخلي في لوحة الكبار.
#   X-07 رابط «للكبار» في مجرى الصفحة لا فوق بطاقات الدروس (ثلاثة مقاسات هاتف)، و«رجوع» البوابة زرٌّ بأيقونة في أعلاها، ولا يُركَّز حقلها في جهاز لمسي.
#   C-04 حارس المتصفح القديم: سكربتٌ لا يُحلَّل أو يتوقّف قبل آخر البداية يُظهر للكبار ما العمل، لا صفحةً فارغة؛ والفتح السليم بلا رسالة (ضابط).
#   A-07 السجلّ يكفي التجربة: بصمة البناء ووضع البند ورقم المحاولة ومواصفته في كل محاولة، و2000 محاولة لا 800 بحدٍّ للحجم، وإعادة كتابة بعد امتلاء المساحة.
#   M-10 تقييم كل درس فيه برجان بمكعبين مختلفي الحجم فيه بندٌ لا تنجح فيه «اختر الأقصر».
#   M-21 نصوص الكبار (حوار البيت وبطاقة الكبار) بصيغة البنت للبنت.
#   C-22 سير عمل CI: القراءة على مستواه، والكتابة لوظيفتي النشر وحدهما، والنشر من main وحده.
# الاستعمال: python3 test/fresh_run.py [ملف نسخة الفحص]   (ONLY=U1,A-07 لبعضها؛ SRC_ROOT=مجلد المصدر لفحص C-22؛ يخرج بـ 1 مع أي إخفاق)
import asyncio, json, os, re, sys, tempfile
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
FILE = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'dist', 'واحة_الرياضيات.dev.html'))
SRC_ROOT = os.path.abspath(os.environ.get('SRC_ROOT', os.path.join(HERE, '..')))
FAST = 'file://' + FILE + '#fast&seed=5'
ONLY = {x for x in os.environ.get('ONLY', '').split(',') if x}
FAILS = []
def on(k): return not ONLY or k in ONLY
def check(k, ok, what, info=''):
  print(('ok   ' if ok else 'FAIL ') + k + ' ' + what + ('' if ok else '  ' + json.dumps(info, ensure_ascii=False)[:900]), flush=True)
  if not ok: FAILS.append(k)
KID = {'id': 'k1', 'name': 'سلمى', 'gender': 'f', 'photo': '', 'avatar': 'f3'}
async def reopen(pg, t=300): await pg.reload(); await pg.wait_for_timeout(t)
async def fresh(b, prog=None, kids=None, extra=None, url=FAST, vp=None, init=None, touch=False):
  ctx = await b.new_context(viewport=vp or {'width': 412, 'height': 860}, has_touch=touch, is_mobile=touch)
  if init: await ctx.add_init_script(init)
  pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
  await pg.goto(url); await pg.wait_for_timeout(250)
  kids = kids or [KID]
  await pg.evaluate("""([kids, prog, extra]) => { localStorage.clear(); localStorage.setItem('hp_kids', JSON.stringify(kids)); localStorage.setItem('hp_kid', JSON.stringify(kids[0].id));
    for (const k of kids) localStorage.setItem('hp_settings:' + k.id, JSON.stringify({ sessionMax: 0, muted: true }));
    localStorage.setItem('hp_prog:' + kids[0].id, JSON.stringify(Object.assign({ schema: 3 }, prog || {})));
    for (const [k, v] of Object.entries(extra || {})) localStorage.setItem(k, v); }""", [kids, prog or {}, extra or {}])
  await reopen(pg); return ctx, pg, errs
async def gate_pass(pg):
  await pg.click('#adultBtn'); await pg.wait_for_timeout(200)
  if not await pg.evaluate("() => !!document.querySelector('#gateIn')"): return
  a = await pg.evaluate("() => window.__gateAns"); await pg.fill('#gateIn', str(a)); await pg.click('#gateGo'); await pg.wait_for_timeout(300)

# محرّك نطق مصطنع يُحقن قبل التطبيق (كما في adv_run.py)
U_ = "window.SpeechSynthesisUtterance = function (t) { this.text = String(t); this.lang = ''; this.voice = null; this.rate = 1; this.pitch = 1; };"
def synth(voices, extra=''):
  return "(() => { " + U_ + " const V = " + voices + "; const S = { speaking: false, pending: false, paused: false, getVoices: () => V, addEventListener() {}, removeEventListener() {}, speak(u) { setTimeout(() => { u.onerror && u.onerror({ error: 'synthesis-failed' }); }, 6); }, cancel() {}, pause() {}, resume() {} }; Object.defineProperty(window, 'speechSynthesis', { value: S, configurable: true }); " + extra + " })()"
AR = "[{ name: 'Arabic', lang: 'ar-SA', default: false, localService: true, voiceURI: 'ar' }]"
EN = "[{ name: 'English', lang: 'en-US', default: true, localService: true, voiceURI: 'en' }]"
NOTE = "() => { const n = document.querySelector('#voiceNote'); return { el: !!n, shown: !!n && !n.hidden && n.getBoundingClientRect().height > 0, text: n ? n.textContent : '' }; }"

# ---------- U1: صيغة الخطاب ----------
async def u1_cases(b):
  ctx, pg, errs = await fresh(b)
  await pg.evaluate("() => localStorage.clear()"); await reopen(pg)
  await pg.click('#startBtn'); await pg.wait_for_timeout(200)
  av = await pg.evaluate("() => { const m = Object.keys(AVATARS).filter(k => AVATARS[k].g === 'm'), f = Object.keys(AVATARS).filter(k => AVATARS[k].g === 'f'); return { m, f }; }")
  has = await pg.evaluate("() => !!document.querySelector('#pGender [data-g=f]')")
  check('U1', has, 'شاشة الطفل الأول فيها اختيار صيغة الخطاب (ولد/بنت) للكبار', has)
  if has:
    await pg.click('#avList [data-av="%s"]' % av['m'][0]); await pg.wait_for_timeout(80)
    await pg.evaluate("() => { document.querySelector('#profileCover details').open = true; }")
    await pg.click('#pGender [data-g=f]'); await pg.wait_for_timeout(80)
    await pg.click('#avList [data-av="%s"]' % av['m'][-1]); await pg.wait_for_timeout(80)
    pr = await pg.evaluate("() => [...document.querySelectorAll('#pGender [data-g]')].map(x => x.dataset.g + ':' + x.getAttribute('aria-pressed'))")
    await pg.click('#pSave'); await pg.wait_for_timeout(300)
    k = await pg.evaluate("() => JSON.parse(localStorage.getItem('hp_kids'))[0]")
    check('U1', k['gender'] == 'f' and k['avatar'] == av['m'][-1] and pr == ['m:false', 'f:true'], 'صورة ولد ثم «بنت» ثم صورة ولدٍ أخرى: يُحفظ الطفل بنتاً بالصورة الأخيرة، والزرّ المضغوط «بنت»', [k, pr])
  check('U1', not errs, 'لا أخطاء في الصفحة (الطفل الأول)', errs[:3]); await ctx.close()
  # ضابط: بلا اختيار الصيغة، الصورة تقترحها
  for g in ('m', 'f'):
    ctx, pg, errs = await fresh(b); await pg.evaluate("() => localStorage.clear()"); await reopen(pg); await pg.click('#startBtn'); await pg.wait_for_timeout(200)
    await pg.click('#avList [data-av="%s"]' % av[g][0]); await pg.wait_for_timeout(80); await pg.click('#pSave'); await pg.wait_for_timeout(300)
    k = await pg.evaluate("() => JSON.parse(localStorage.getItem('hp_kids'))[0]")
    check('U1', k['gender'] == g and not errs, 'ضابط: بلا اختيار الصيغة تقترحها الصورة (%s)' % g, [k, errs[:2]]); await ctx.close()
  # طفلٌ قائم: تُعدَّل صيغته من شاشته، واللوحة تقولها
  ctx, pg, errs = await fresh(b)
  await pg.evaluate("() => openProfile(false)"); await pg.wait_for_timeout(200)
  pr0 = await pg.evaluate("() => [...document.querySelectorAll('#pGender [data-g]')].map(x => x.dataset.g + ':' + x.getAttribute('aria-pressed'))")
  if pr0: await pg.click('#pGender [data-g=m]'); await pg.wait_for_timeout(80)
  await pg.click('#pSave'); await pg.wait_for_timeout(300)
  k = await pg.evaluate("() => JSON.parse(localStorage.getItem('hp_kids'))[0]")
  check('U1', pr0 == ['m:false', 'f:true'] and k['gender'] == 'm' and k['avatar'] == 'f3', 'طفلٌ قائم: تظهر صيغته الحالية، وتُعدَّل إلى «ولد» وتبقى صورته', [pr0, k])
  await gate_pass(pg); t = await pg.evaluate("() => document.querySelector('#panel').textContent")
  check('U1', 'سلمى (ولد)' in t, 'لوحة الكبار تقول صيغة خطاب كل طفل', t[:200])
  check('U1', not errs, 'لا أخطاء في الصفحة (الطفل القائم)', errs[:3]); await ctx.close()

# ---------- U2: تنبيه الصوت، وأرقام القرارات ----------
async def u2_cases(b):
  for name, init, want in [('بلا أصوات', synth('[]'), True), ('أصواتٌ إنجليزية وحدها', synth(EN), True), ('ضابط: صوتٌ عربي', synth(AR), False),
                           ('جسر أندرويد بلا عربية', synth('[]', 'window.AndroidBridge = { ttsState: () => 2 };'), True),
                           ('ضابط: جسر أندرويد يبدأ بعد 250 م.ث', synth('[]', 'const __t0 = Date.now(); window.AndroidBridge = { ttsState: () => Date.now() - __t0 > 250 ? 1 : 0 };'), False)]:
    ctx, pg, errs = await fresh(b, init=init); await pg.wait_for_timeout(600); st = await pg.evaluate(NOTE)
    good = (st['shown'] and 'لا صوت عربي' in st['text']) if want else not st['shown']
    check('U2', good and not errs, 'تنبيه الصوت في الخريطة (%s): %s' % (name, 'يظهر للكبار' if want else 'لا يظهر'), [st, errs[:2]]); await ctx.close()
  ctx, pg, errs = await fresh(b, init=synth('[]')); await pg.wait_for_timeout(400)
  ok = await pg.evaluate("() => !!document.querySelector('#vnHow')")
  if ok:
    await pg.click('#vnHow'); await pg.wait_for_timeout(100); how = await pg.evaluate("() => { const t = document.querySelector('#vnText'); return t && !t.hidden ? t.textContent : ''; }")
    await pg.click('#vnHide'); await pg.wait_for_timeout(100); st1 = await pg.evaluate(NOTE); await reopen(pg, 600); st2 = await pg.evaluate(NOTE)
    ok = len(how) > 20 and not st1['shown'] and not st2['shown']
  check('U2', ok, '«كيف نضيفه؟» يشرح، و«إخفاء» يخفيه ويبقى مخفياً بعد إعادة الفتح', ok)
  check('U2', not errs, 'لا أخطاء في الصفحة (تنبيه الصوت)', errs[:3]); await ctx.close()
  # والدرس التالي «الثقل» (u4/d2): بطاقته في اللوحة تقول ما على الشاشة، وكان فيها (D252)
  ctx, pg, errs = await fresh(b)
  await pg.evaluate("() => { const P = JSON.parse(localStorage.getItem('hp_prog:k1')); for (const id of Object.keys(LDATA)) { if (id === 'm1.u4.d2') break; P[id] = { done: true, at: 1, mastered: true }; } UNITS.forEach(U => { if (U.id !== 'm1.u4') P['badge:' + U.id] = true; }); localStorage.setItem('hp_prog:k1', JSON.stringify(P)); }")
  await reopen(pg); await gate_pass(pg)
  t = await pg.evaluate("() => document.querySelector('#panel').textContent"); ids = sorted(set(re.findall(r'(?<![\w-])D\d{3}(?!\w)', t)))
  check('U2', len(t) > 500 and 'كفّتي ميزان' in t and not ids, 'لا رقم قرار داخلي في لوحة الكبار (ومعها بطاقة الدرس التالي)', [ids, 'كفّتي ميزان' in t])
  check('U2', not errs, 'لا أخطاء في الصفحة (اللوحة)', errs[:3]); await ctx.close()

# ---------- X-07: رابط الكبار وبوابتهم ----------
OVER = """() => { const a = document.querySelector('#adultBtn').getBoundingClientRect(); const hits = [];
  const P = document.querySelector('#path').getBoundingClientRect();   /* الطريق يُمرَّر في داخله: الظاهر من البطاقة ما في إطاره */
  for (const s of document.querySelectorAll('#path .stop')) { const q = s.getBoundingClientRect(); const r = { left: Math.max(q.left, P.left), right: Math.min(q.right, P.right), top: Math.max(q.top, P.top), bottom: Math.min(q.bottom, P.bottom) };
    if (r.bottom - r.top > 2 && a.left < r.right && a.right > r.left && a.top < r.bottom && a.bottom > r.top) hits.push(s.dataset.lesson || s.className); }
  return { hits, pos: getComputedStyle(document.querySelector('#adultBtn')).position }; }"""
async def x07_cases(b):
  for vp in ({'width': 360, 'height': 640}, {'width': 390, 'height': 844}, {'width': 412, 'height': 860}):
    ctx, pg, errs = await fresh(b, vp=vp); hits = []; pos = ''
    H = await pg.evaluate("() => document.documentElement.scrollHeight")
    PH = await pg.evaluate("() => document.querySelector('#path').scrollHeight")
    for y in range(0, max(H, PH) + 1, 120):
      await pg.evaluate("(y) => { window.scrollTo(0, y); document.querySelector('#path').scrollTop = y; }", y); await pg.wait_for_timeout(20); r = await pg.evaluate(OVER); hits += r['hits']; pos = r['pos']
    check('X-07', not hits and pos != 'fixed', 'رابط «للكبار» لا يقع فوق بطاقة درس في أي موضع تمرير (%dx%d)' % (vp['width'], vp['height']), [sorted(set(hits))[:4], pos])
    check('X-07', not errs, 'لا أخطاء في الصفحة (%dx%d)' % (vp['width'], vp['height']), errs[:3]); await ctx.close()
  GATE = """() => { const b = document.querySelector('#gateBack'), i = document.querySelector('#gateIn'); if (!b || !i) return null; const s = getComputedStyle(b);
    return { above: b.getBoundingClientRect().bottom <= i.getBoundingClientRect().top, icon: !!b.querySelector('svg'), border: parseFloat(s.borderTopWidth), h: b.getBoundingClientRect().height, focus: document.activeElement === i }; }"""
  for touch in (True, False):
    ctx, pg, errs = await fresh(b, touch=touch); await pg.click('#adultBtn'); await pg.wait_for_timeout(400); g = await pg.evaluate(GATE)
    if touch: check('X-07', bool(g) and g['above'] and g['icon'] and g['border'] >= 2 and g['h'] >= 44, '«رجوع» البوابة زرٌّ بإطار وأيقونة فوق حقل الجواب', g)
    check('X-07', bool(g) and g['focus'] == (not touch), ('جهاز لمسي: لا يُركَّز حقل البوابة فلا يقفز لوح المفاتيح' if touch else 'ضابط: بالفأرة يُركَّز حقل البوابة'), g)
    if g:
      await pg.click('#gateBack'); await pg.wait_for_timeout(200); home = await pg.evaluate("() => !document.querySelector('#home').hidden && document.querySelector('#panel').hidden")
      check('X-07', home, '«رجوع» يعيد إلى الخريطة', home)
    check('X-07', not errs, 'لا أخطاء في الصفحة (البوابة)', errs[:3]); await ctx.close()

# ---------- C-04: حارس المتصفح القديم ----------
OLD = "() => { const d = document.querySelector('#oldWeb'); return d ? { why: d.dataset.why, text: d.textContent, h: d.getBoundingClientRect().height } : null; }"
async def c04_cases(b):
  src = open(FILE, encoding='utf-8').read(); tmp = tempfile.mkdtemp(prefix='c04_')
  def variant(name, a, rep):
    assert src.count(a) == 1, (name, src.count(a)); p = os.path.join(tmp, name + '.html'); open(p, 'w', encoding='utf-8').write(src.replace(a, rep, 1)); return 'file://' + p + '#fast&seed=5'
  urls = {'parse': variant('parse', "\n'use strict';\n", "\n'use strict';\nclass {\n"), 'boot': variant('boot', "\nconst CONTENT = ", "\nthrow new Error('boot-test');\nconst CONTENT = ")}
  ctx = await b.new_context(viewport={'width': 412, 'height': 860}); pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
  await pg.goto(FAST); await pg.wait_for_timeout(400); o = await pg.evaluate(OLD); home = await pg.evaluate("() => !document.querySelector('#home').hidden || !document.querySelector('#startCover').hidden")
  check('C-04', o is None and home and not errs, 'ضابط: الفتح السليم بلا رسالة المتصفح القديم', [o, home, errs[:2]])
  for why, url in urls.items():
    await pg.goto(url); await pg.wait_for_timeout(500); o = await pg.evaluate(OLD)
    want = 'أقدم' if why == 'parse' else 'أغلقوه وافتحوه'
    check('C-04', bool(o) and o['why'] == why and want in o['text'] and o['h'] > 200, ('سكربتٌ لا يُحلَّل (متصفّح أقدم من ES2020): رسالة للكبار بما يفعلون، لا صفحة فارغة' if why == 'parse' else 'سكربتٌ حُلِّل وتوقّف قبل آخر البداية: رسالة «تعذّر فتح التطبيق»'), o)
  await ctx.close()

# ---------- A-07: سجلّ يكفي التجربة ----------
ST = """() => { const q = s => document.querySelector(s); const vis = s => { const e = q(s); return !!e && !e.hidden; }; const a = window.__auto;
  return { scene: window.__scene || '', home: vis('#home'), covers: [...document.querySelectorAll('.cover')].filter(c => !c.hidden).map(c => c.id),
    go: !!(q('#go') && !q('#go').disabled && !q('#go').classList.contains('idle')), auto: a ? { n: a.n, kind: a.kind } : null, mode: window.__itemMode || '', crash: vis('#crashCover') }; }"""
async def drive(pg, lid, wrong_first=True):
  await pg.evaluate("(l) => { runLesson(l); }", lid); await pg.wait_for_timeout(150); last = -1; idle = 0; seen = set()
  while True:
    st = await pg.evaluate(ST)
    if st['crash']: return 'crash'
    if st['home'] and not st['covers']: return 'done'
    if 'exitCover' in st['covers']: await pg.click('#rsGo'); continue
    a = st['auto']
    if a:
      if a['n'] != last:
        last = a['n']
        if st['scene'].endswith(':bag'): await pg.evaluate("() => { const b = [...document.querySelectorAll('.choices .pick')]; (b.find(x => x.dataset.k === 'screen') || b[0]).click(); }"); continue
        key = (st['mode'], a['kind']); how = 'wrong' if wrong_first and st['mode'] == 'practice' and key not in seen else 'ok'; seen.add(key)
        await pg.evaluate("(h) => { const a = window.__auto; if (a) (h === 'wrong' && a.wrong ? a.wrong : a.ok)(); }", how)
        idle = 0
      idle += 1; await pg.wait_for_timeout(25)
      if idle > 400: return 'stuck:' + st['scene'] + ':' + json.dumps(a)
      continue
    if st['go']: await pg.click('#go'); idle = 0; await pg.wait_for_timeout(20); continue
    idle += 1; await pg.wait_for_timeout(40)
    if idle > 400: return 'stuck:' + st['scene'] + ':' + ','.join(st['covers'])
async def a07_cases(b):
  ctx, pg, errs = await fresh(b); r = await drive(pg, 'm1.u1.d1')
  A = await pg.evaluate("() => ({ att: JSON.parse(localStorage.getItem('hp_log:k1')).attempts.filter(a => a.type), id: typeof BUILD_ID === 'string' ? BUILD_ID : null })")
  att = A['att']; bad = [a for a in att if not (isinstance(a.get('v'), str) and re.fullmatch(r'[0-9a-f]{8}', a['v']) and isinstance(a.get('mode'), str) and isinstance(a.get('try'), int) and a['try'] >= 1
                                               and isinstance(a.get('spec'), str) and 2 <= len(a['spec']) <= 200)]
  modes = sorted({a.get('mode') for a in att if a.get('mode')}); tries = max([a.get('try') or 0 for a in att] or [0])
  check('A-07', r == 'done' and len(att) > 10 and not bad and A['id'] and all(a['v'] == A['id'] for a in att), 'كل محاولة بند في درسٍ كامل تحمل بصمة البناء ووضع البند ورقم المحاولة ومواصفته (حتى 200 حرف)',
        [r, len(att), bad[:2], A['id']])
  check('A-07', tries >= 2 and 'mastery' in modes and 'practice' in modes, 'رقم المحاولة يبلغ 2 بعد الخطأ، والوضع يفرّق التمرين عن الإتقان', [tries, modes])
  sp = [a.get('spec') or '' for a in att]; parsed = sum(1 for s in sp if s.startswith('{') and (s.endswith('}') or s.endswith('…')))
  check('A-07', parsed == len(sp), 'المواصفة نصّ البند بلا توأمه (أو أوّله بـ«…»)', sp[:3])
  await reopen(pg); rep = await pg.evaluate("() => ({ rep: STORE_ISSUES.repaired, n: LOG.attempts.filter(a => a.try).length })")
  check('A-07', 'hp_log:k1' not in rep['rep'] and rep['n'] == len(att), 'بعد إعادة الفتح تُقبل المحاولات بحقولها الجديدة (لا «أُصلح» ولا إسقاط)', rep)
  # الحدّان: 2000 محاولة لا 800، و300 ألف حرف معاً
  n = await pg.evaluate("() => { LOG.attempts = Array.from({ length: 2100 }, (_, i) => ({ t: Date.now() - 1e6 + i, scene: 'x', ok: true })); logAttempt({ scene: 'x', ok: true }); return JSON.parse(localStorage.getItem('hp_log:k1')).attempts.length; }")
  check('A-07', n == 2000, 'أقصى السجلّ 2000 محاولة (كان 800: يُمحى أوّله في أسبوع تجربة)', n)
  r = await pg.evaluate("() => { const pad = 'x'.repeat(420); LOG.attempts = Array.from({ length: 1500 }, (_, i) => ({ t: Date.now() - 1e6 + i, scene: 'x', ok: true, ans: pad })); logAttempt({ scene: 'x', ok: true }); const A = JSON.parse(localStorage.getItem('hp_log:k1')).attempts; return { n: A.length, len: JSON.stringify(A).length, last: A[A.length - 1].scene }; }")
  check('A-07', r['len'] <= 300000 and r['n'] > 600 and r['last'] == 'x', 'وحجمه معاً 300 ألف حرف على الأكثر لكل طفل (يُحذف الأقدم)', r)
  check('A-07', not errs, 'لا أخطاء في الصفحة (السجلّ)', errs[:3]); await ctx.close()
  # المساحة ممتلئة: يُحذف الربع الأقدم وتُعاد الكتابة مرة
  ctx, pg, errs = await fresh(b)
  r = await pg.evaluate("""() => { const pad = 'y'.repeat(180); LOG.attempts = Array.from({ length: 400 }, (_, i) => ({ t: Date.now() - 1e6 + i, scene: 'x', ok: true, ans: pad }));
    localStorage.setItem('hp_log:k1', JSON.stringify({ attempts: [], errors: [], faces: [] })); store.seen['hp_log:k1'] = localStorage.getItem('hp_log:k1');
    const set0 = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k === 'hp_log:k1' && String(v).length > 70000) throw new DOMException('full', 'QuotaExceededError'); return set0.call(this, k, v); };
    logAttempt({ scene: 'x', ok: true }); Storage.prototype.setItem = set0; const A = JSON.parse(localStorage.getItem('hp_log:k1')).attempts; return { n: A.length, last: A.length ? A[A.length - 1].scene : null }; }""")
  check('A-07', r['n'] > 250 and r['last'] == 'x', 'المساحة لا تسع السجلّ: يُحذف ربعه الأقدم ويُحفظ، ولا تضيع المحاولة الجديدة', r)
  check('A-07', not errs, 'لا أخطاء في الصفحة (المساحة)', errs[:3]); await ctx.close()

# ---------- M-10 وM-21: المحتوى في نسخة الفحص ----------
async def content_cases(b):
  ctx, pg, errs = await fresh(b)
  bad = await pg.evaluate("""() => { const out = []; const shortWins = v => { const ha = v.a * (v.sa || 24), hb = v.b * (v.sb || 24); return v.a !== v.b && ha !== hb && (v.a > v.b) === (ha < hb); };
    const towers = n => { const o = []; const w = v => { if (Array.isArray(v)) return v.forEach(w); if (!v || typeof v !== 'object') return; if (v.t === 'compare' && (v.sa || 24) !== (v.sb || 24)) o.push(v); for (const [k, x] of Object.entries(v)) if (k !== 'twin') w(x); }; w(n); return o; };
    for (const L of Object.values(LDATA)) { const G2 = [...Object.entries((L.mastery && L.mastery.concepts) || {}), ['review', L.review], ['test', L.test]];
      for (const [nm, g] of G2) { const T = towers(g || []); if (T.length && T.every(shortWins)) out.push(L.id + ' ' + nm + ' ' + T.map(v => v.a + '/' + v.b + '@' + (v.sa || 24) + '/' + (v.sb || 24)).join(',')); } } return out; }""")
  check('M-10', not bad, 'في كل تقييم فيه برجان بمكعبين مختلفي الحجم بندٌ لا تنجح فيه «اختر الأقصر»', bad)
  FIX = {'m1.u1.d4': ['talk', 'how', 0, 1, 2], 'm1.u2.d1': ['talk'], 'm1.u2.d4': ['talk', 0, 1, 2], 'm1.u2.d5': ['talk'], 'm1.u3.d3': ['talk'], 'm1.u3.d4': ['talk', 0, 1, 2],
         'm1.u3.d5': ['talk'], 'm1.u3.d6': ['talk'], 'm1.u1.d2': ['talk'], 'm1.u1.d3': ['talk'], 'm1.u3.d1': ['talk'], 'm1.u3.d7': ['talk'], 'm1.u4.d3': ['talk'], 'm1.u4.d6': ['talk']}
  same = await pg.evaluate("""(F) => { const out = []; const two = t => { const p = PROFILE.gender; PROFILE.gender = 'm'; const m = G(t); PROFILE.gender = 'f'; const f = G(t); PROFILE.gender = p; return [m, f]; };
    for (const [id, ks] of Object.entries(F)) { const L = LDATA[id]; for (const k of ks) { const t = k === 'talk' ? (TALK[id] || L.talk) : k === 'how' ? L.adultCard.how : L.adultCard.qs[k]; const [m, f] = two(t || ''); if (!t || m === f) out.push(id + ':' + k); } } return out; }""", FIX)
  check('M-21', not same, 'نصوص الكبار (حوار البيت وبطاقة الكبار) في %d درساً لها صيغة البنت' % len(FIX), same)
  ac = await pg.evaluate("() => { const p = PROFILE.gender; PROFILE.gender = 'f'; const h = adultCardHTML(LDATA['m1.u1.d4']); PROFILE.gender = p; return h; }")
  check('M-21', 'منها أن تضعها' in ac and '{' not in re.sub(r'<[^>]+>', '', ac), 'بطاقة الكبار في اللوحة تعرض صيغة البنت للبنت، بلا أقواس الصيغتين', re.sub(r'<[^>]+>', ' ', ac)[:300])
  check('M-21', not errs, 'لا أخطاء في الصفحة (المحتوى)', errs[:3]); await ctx.close()

# ---------- C-22: سير عمل CI ----------
def c22_case():
  import yaml
  w = yaml.safe_load(open(os.path.join(SRC_ROOT, '.github', 'workflows', 'build-all.yml'), encoding='utf-8'))
  J = w['jobs']; MAIN = "github.ref == 'refs/heads/main'"
  writers = sorted(j for j, v in J.items() if (v.get('permissions') or {}).get('contents') == 'write')
  check('C-22', w.get('permissions') == {'contents': 'read'}, 'صلاحية سير العمل كله قراءة فقط', w.get('permissions'))
  check('C-22', writers == ['pages', 'release'], 'الكتابة لوظيفتي النشر وحدهما (الويب والإصدار)', writers)
  pub = {j: J[j].get('if', '') for j in ('pages', 'android-release', 'release')}
  check('C-22', all(MAIN in v for v in pub.values()), 'النشر وتوقيع APK من main وحده: تشغيلٌ يدوي على فرعٍ لا ينشر', pub)
  chk = {j: J[j].get('if', '') for j in ('android', 'android-device', 'windows')}
  check('C-22', all(MAIN not in v for v in chk.values()), 'ضابط: نسخ الفحص (APK التجريبي، والمحاكيان، وويندوز) تُبنى على أي فرعٍ بالتشغيل اليدوي', chk)

async def main():
  if on('C-22'): c22_case()
  async with async_playwright() as p:
    b = await p.chromium.launch()
    if on('U1'): await u1_cases(b)
    if on('U2'): await u2_cases(b)
    if on('X-07'): await x07_cases(b)
    if on('C-04'): await c04_cases(b)
    if on('A-07'): await a07_cases(b)
    if on('M-10') or on('M-21'): await content_cases(b)
    await b.close()
  print('FAILS:', len(FAILS)); sys.exit(1 if FAILS else 0)
asyncio.run(main())
