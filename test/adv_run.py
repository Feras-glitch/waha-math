# فحوص قبول مراجعة الخصم الشاملة (5 نوفمبر 2026، على main 69049f1؛ المعرّفات من التقرير: C- للشيفرة، وX- للتفاعل، وA- للتقييم، وM- للمادة).
# كل فحص يخفق على 69049f1 ما لم يُذكر أنه ضابط (لا أخطاء في الصفحة، والسليم يبقى سليماً).
#   C-01 «بدء كل الدروس من جديد»: لا ينهار، ويحذف صور الطفل وحده قبل أي محو، وإخفاق حذفها لا يمحو شيئاً، وبعد إعادة الفتح كذلك.
#   C-02 بوابة الكبار بالزمن الحقيقي: جوابٌ خاطئ ثم «رجوع» ثم درس: لا تعود البوابة فوقه؛ وبلا «رجوع» يُعاد السؤال (ضابط).
#   X-06 مهلة البوابة لا تبقى بعد أن يعود الجهاز إلى الطفل: بعد إغلاق اللوحة يُسأل من جديد، و«درس إضافي» يُسأل دائماً.
#   X-01 نقرة مزدوجة بالإصبع (لمستان بينهما 280 م.ث) على الجواب الصحيح، بالزمن الحقيقي: «لوحة المقاول» (u4/d4) والإتقان (u3/d4):
#       جوابٌ واحد لكل سؤال، ولا خطأ من اللمسة الثانية، ويُتقَن المفهوم؛ وضابط: لمسة واحدة لكل سؤال تُقبل كلها.
#   A-01 الإتقان بلا إشارة صواب أو خطأ: ما يُسمع ويُرى بعد الجواب واحدٌ للصحيح والخاطئ (u1/d1، u2/d2، u3/d3، u4/d2).
#   A-02 مراجعة اليوم: خطأ أول ثم خروج: يُحفظ الخطأ فوراً ولا يعود المفهوم في اليوم نفسه، ولا يبلغ «ثابت» بالخروج والإعادة (أيام 1، 4، 11، 32).
#   A-05 التقرير الأسبوعي: مقام «الصواب من المحاولة الأولى» المحاولات الأولى وحدها.
#   A-06 مفهومٌ أُجّل ثم ثبت في المراجعة: لا «مؤجَّل» في اللوحة، و«ثابت بالمراجعة».
#   A-08 «لوّن بطريقة جديدة» في إتقان N005: «تمّ» بلا لمسة ليس صواباً.
#   A-10 الخيارات العددية الثلاثة: رتبة الجواب بينها (أصغر، أوسط، أكبر) قريبة من الثلث لكلٍّ.
#   A-14/C-09 الساعة: موعد «بعد يوم» لا يحين بعد دقائق من منتصف الليل، وساعةٌ رجعت لا تُبقي الاستراحة مفروضة.
#   X-02/X-04/X-05/X-11/C-17 النطق بمحرّكات مصطنعة (بالزمن الحقيقي): محرّكٌ يخفق قبل البدء، وأصوات بلا عربي، وجسر أندرويد بلا صوت عربي،
#       ومحرّكٌ لا يبدأ، ومحرّكٌ لا يُطلق النهاية، وتسجيلٌ تالف؛ وضابطان: صوت عربي سليم، والكتم.
# الاستعمال: python3 test/adv_run.py [ملف نسخة الفحص]   (ONLY=C-01,X-01 لبعضها؛ يخرج بـ 1 مع أي إخفاق)
import asyncio, json, os, re, sys
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

# ---------- النطق: محرّكات مصطنعة تُحقن قبل التطبيق ----------
U_ = "window.SpeechSynthesisUtterance = function (t) { this.text = String(t); this.lang = ''; this.voice = null; this.rate = 1; this.pitch = 1; };"
def synth(voices, speak, extra=''):
  return "() => { " + U_ + " const V = " + voices + "; let cur = []; const S = { speaking: false, pending: false, paused: false, getVoices: () => V, addEventListener() {}, removeEventListener() {}, speak(u) { window.__spoke = (window.__spoke || 0) + 1; " + speak + " }, cancel() { cur.forEach(clearTimeout); cur = []; S.speaking = false; S.pending = false; window.__cancel = (window.__cancel || 0) + 1; }, pause() {}, resume() {} }; Object.defineProperty(window, 'speechSynthesis', { value: S, configurable: true }); " + extra + " }"
AR = "[{ name: 'Arabic', lang: 'ar-SA', default: false, localService: true, voiceURI: 'ar' }]"
MOCK = {
  # Chromium بلا أصوات: synthesis-failed بعد لحظة (X-02)
  'fail': synth('[]', "cur.push(setTimeout(() => { u.onerror && u.onerror({ error: 'synthesis-failed' }); }, 6));"),
  # أصوات الجهاز إنجليزية وحدها (X-11): لا يقرأ صوتٌ إنجليزي نصاً عربياً
  'en': synth("[{ name: 'English', lang: 'en-US', default: true, localService: true, voiceURI: 'en' }]", "cur.push(setTimeout(() => { S.speaking = true; u.onstart && u.onstart({}); cur.push(setTimeout(() => { S.speaking = false; u.onend && u.onend({}); }, 60 * u.text.length)); }, 30));"),
  # جسر أندرويد بلا صوت عربي: لا يبدأ ولا يُعلن خطأً، والجسر يقول ttsState = 2 (X-04)
  'android': synth(AR, "", "window.AndroidBridge = { ttsState: () => 2 };"),
  # محرّكٌ موجود لا يبدأ ولا يخطئ (بلا جسر): الأولى والثانية بمهلة، ثم صامتاً (X-04 للويب)
  'nostart': synth(AR, ""),
  # يبدأ ولا يُطلق النهاية ويبقى «يتكلّم» (X-05)
  'hang': synth(AR, "cur.push(setTimeout(() => { S.speaking = true; u.onstart && u.onstart({}); }, 30));"),
  # ضابط: صوت عربي سليم يقرأ 70 م.ث للحرف
  'ok': synth(AR, "(S.q = S.q || []).push(u); const run = () => { if (S.busy || !S.q.length) return; const x = S.q.shift(); S.busy = true; cur.push(setTimeout(() => { S.speaking = true; x.onstart && x.onstart({}); cur.push(setTimeout(() => { S.speaking = false; S.busy = false; x.onend && x.onend({}); run(); }, 70 * x.text.length)); }, 40)); }; run();", "const c0 = S.cancel; S.cancel = () => { S.q = []; S.busy = false; c0(); };"),   # طابورٌ كالمحرّك الحقيقي: جزءٌ بعد جزء
}
TXT = ['هذا مربع صغير، وله أربعة رؤوس وأربعة أضلاع متساوية في الطول.', 'نعدّ الرؤوس معاً واحداً واحداً، ثم نضع الشكل في سلّته.', 'أحسنتِ، هذه هي السلة الصحيحة لهذا الشكل.']
SAY3 = """async (txt) => { const out = []; for (const t of txt) { const t0 = performance.now(); await speakNow('compass', 'gen.adv', t); out.push([Math.round(performance.now() - t0), readTime(t)]); } return out; }"""
async def speech_ctx(b, mock, muted=False):
  ctx = await b.new_context(viewport={'width': 412, 'height': 860}); pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
  if mock: await ctx.add_init_script('(' + MOCK[mock] + ')()')
  await pg.goto(REAL); await pg.wait_for_timeout(250)
  await pg.evaluate("""(m) => { localStorage.clear(); localStorage.setItem('hp_kids', JSON.stringify([{ id: 'k1', name: 'سلمى', gender: 'f', photo: '', avatar: 'f3' }])); localStorage.setItem('hp_kid', JSON.stringify('k1'));
    localStorage.setItem('hp_settings:k1', JSON.stringify({ sessionMax: 0, muted: m })); localStorage.setItem('hp_prog:k1', JSON.stringify({ schema: 3 })); }""", muted)
  await reopen(pg); return ctx, pg, errs
def near(d, rt, lo=0.9, hi=1.25): return lo * rt <= d <= hi * rt + 250
async def speech_cases(b):
  # X-02: يخفق قبل البدء: كل جملة بزمن قراءتها لا تومض
  ctx, pg, errs = await speech_ctx(b, 'fail'); r1 = await pg.evaluate(SAY3, TXT[:1]); sp1 = await pg.evaluate("() => window.__spoke || 0"); r = r1 + await pg.evaluate(SAY3, TXT[1:])
  check('X-02', all(near(d, rt) for d, rt in r), 'محرّكٌ يخفق قبل البدء (synthesis-failed): كل جملة تبقى بزمن قراءتها، لا تومض', r)
  sp = await pg.evaluate("() => window.__spoke || 0"); await pg.evaluate("() => openPanel()"); note = await pg.evaluate("() => !!document.querySelector('#noTts')")
  check('X-02', sp1 >= 1 and sp == sp1 and note, 'وبعد أول إخفاق لا يُطلب من المحرّك شيء في الجلسة، ولوحة الكبار تقول إن الجمل تُعرض مكتوبة', [sp1, sp, note])
  check('X-02', not errs, 'لا أخطاء في الصفحة (محرّكٌ يخفق)', errs[:3]); await ctx.close()
  # X-11: أصوات بلا عربي: لا يُطلب من المحرّك شيء، والجمل بزمن قراءتها
  ctx, pg, errs = await speech_ctx(b, 'en'); r = await pg.evaluate(SAY3, TXT[:2]); sp = await pg.evaluate("() => window.__spoke || 0")
  check('X-11', sp == 0 and all(near(d, rt) for d, rt in r), 'أصوات الجهاز بلا عربي: لا يقرأ صوتٌ إنجليزي النصّ العربي، والجمل بزمن قراءتها', [sp, r]); await ctx.close()
  # X-04: جسر أندرويد بلا صوت عربي: بلا الثواني الثلاث الصامتة قبل كل جملة
  ctx, pg, errs = await speech_ctx(b, 'android'); r = await pg.evaluate(SAY3, TXT)
  check('X-04', all(near(d, rt) for d, rt in r), 'جسر أندرويد بلا صوت عربي: كل جملة بزمن قراءتها، بلا ثلاث ثوانٍ صامتة قبلها', r); await ctx.close()
  # X-04 للويب: محرّك لا يبدأ ولا يخطئ: الأوليان بمهلة، ثم بزمن القراءة وحده
  ctx, pg, errs = await speech_ctx(b, 'nostart'); r = await pg.evaluate(SAY3, TXT)
  check('X-04', near(r[2][0], r[2][1]) and r[0][0] >= r[0][1] + 2500, 'محرّكٌ لا يبدأ ولا يخطئ: بعد مرتين متتاليتين تُقرأ الجمل صامتةً بزمن قراءتها وحده', r); await ctx.close()
  # X-05: يبدأ ولا يُطلق النهاية: سقفٌ بطول النص لا 12 ثانية فأكثر
  ctx, pg, errs = await speech_ctx(b, 'hang'); r = await pg.evaluate(SAY3, TXT[:2]); n = [len(t.replace('،', '').replace('.', '')) for t in TXT[:2]]
  check('X-05', all(d <= len(t) * 130 + 2600 for (d, rt), t in zip(r, TXT[:2])) and all(d >= 0.9 * rt for d, rt in r), 'محرّكٌ يبدأ ولا يُطلق النهاية: الجملة تنتهي بسقفٍ بطول نصّها، لا 12–15 ثانية', [r, n])
  check('X-05', not errs, 'لا أخطاء في الصفحة (محرّكٌ عالق)', errs[:3]); await ctx.close()
  # C-17: تسجيل تالف: يقرؤه صوت الجهاز لا الصمت
  ctx, pg, errs = await speech_ctx(b, 'ok')
  r = await pg.evaluate("""async (t) => { CLIPS['gen.adv'] = 'data:audio/mpeg;base64,AAAA'; window.__spoke = 0; const t0 = performance.now(); await speakNow('compass', 'gen.adv', t); return [Math.round(performance.now() - t0), window.__spoke]; }""", TXT[0])
  check('C-17', r[1] >= 1, 'تسجيلٌ تالف في حزمة الصوت: يقرأ الجملةَ صوتُ الجهاز لا الصمت', r); await ctx.close()
  # ضابطان: صوت عربي سليم يُنطق (لا يُقرأ صامتاً)، والكتم بزمن القراءة بلا محرّك
  ctx, pg, errs = await speech_ctx(b, 'ok'); r = await pg.evaluate(SAY3, TXT[:2]); sp = await pg.evaluate("() => window.__spoke || 0")
  check('X-02', sp >= 2 and all(d >= len(t) * 60 for (d, rt), t in zip(r, TXT[:2])), 'ضابط: صوت عربي سليم: الجمل تُنطق ويُنتظر نهايتها', [sp, r]); await ctx.close()
  ctx, pg, errs = await speech_ctx(b, 'ok', muted=True); r = await pg.evaluate(SAY3, TXT[:2]); sp = await pg.evaluate("() => window.__spoke || 0")
  check('X-02', sp == 0 and all(near(d, rt) for d, rt in r), 'ضابط: الكتم بزمن القراءة بلا محرّك', [sp, r]); await ctx.close()

# ---------- X-01: النقرة المزدوجة ----------
FINDOK = """() => { const a = window.__auto; if (!a) return null; const k = a.kind; const vis = e => e && e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden';
  const c = e => { if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? [r.left + r.width / 2, r.top + r.height / 2] : null; };
  if (['pick', 'num', 'card'].includes(k)) { const B = [...document.querySelectorAll('#stage .choices:not([data-done]) .pick')].filter(vis); return { n: a.n, kind: k, ok: c(B.find(b => b.dataset.ok === 'true')) }; }
  if (k === 'tap') { const G = [...document.querySelectorAll('#stage svg [role=button]')].filter(g => g.onclick && g.dataset.ok === 'true'); return { n: a.n, kind: k, ok: c(G[0]) }; }
  return { n: a.n, kind: k, ok: null }; }"""
RUNST = """([lid, what]) => { const L = LDATA[lid]; CUR = L; FLOW++; show('lesson'); lockGo(); const P = progOf(lid); P.path = 'screen';
  const st = what === 'mastery' ? null : L.flow.find(s => s.scene === what || s.s === what); SCENE_NOW = what; window.__scene = lid + ':' + what; window.__fin = false;
  (st ? runStage(L, st) : masteryStage(L)).then(() => { window.__fin = true; }, e => { window.__fin = 'ERR ' + e; }); }"""
async def dbl_run(b, lid, what, gap, maxw=6, secs=90):
  ctx = await b.new_context(viewport={'width': 360, 'height': 640}, has_touch=True, is_mobile=True); pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
  await pg.goto(REAL); await pg.wait_for_timeout(250)
  await pg.evaluate("""() => { localStorage.clear(); localStorage.setItem('hp_kids', JSON.stringify([{ id: 'k1', name: 'سلمى', gender: 'f', photo: '', avatar: 'f3' }])); localStorage.setItem('hp_kid', JSON.stringify('k1'));
    localStorage.setItem('hp_settings:k1', JSON.stringify({ sessionMax: 0, muted: true })); localStorage.setItem('hp_prog:k1', JSON.stringify({ schema: 3, unlockAll: true })); }""")
  await reopen(pg); await pg.evaluate(RUNST, [lid, what]); res = []; last = None; t0 = asyncio.get_event_loop().time()
  while asyncio.get_event_loop().time() - t0 < secs and len(res) < maxw:
    if await pg.evaluate("() => window.__fin"): break
    f = await pg.evaluate(FINDOK)
    if f and f['n'] != last:
      last = f['n']
      if f['ok']:
        await pg.wait_for_timeout(200); a0 = await pg.evaluate("() => LOG.attempts.length")
        await pg.touchscreen.tap(*f['ok'])
        if gap: await pg.wait_for_timeout(gap); await pg.touchscreen.tap(*f['ok'])
        await pg.wait_for_timeout(1300); a1 = await pg.evaluate("() => LOG.attempts.length")
        res.append({'kind': f['kind'], 'n': a1 - a0, 'att': await pg.evaluate("(n) => LOG.attempts.slice(-Math.max(1, n)).map(a => [a.scene, a.ok, a.firstTry])", a1 - a0)})
      else: await pg.evaluate("() => { const a = window.__auto; if (a && a.ok) a.ok(); }")
    await pg.wait_for_timeout(80)
  fin = await pg.evaluate("() => window.__fin"); cs = await pg.evaluate("(lid) => (progOf(lid).cs || {})", lid); await ctx.close()
  return res, fin, cs, errs
def one_each(res): return bool(res) and all(r['n'] == 1 and all(a[1] for a in r['att']) for r in res)
async def dbl_cases(b):
  r, fin, cs, errs = await dbl_run(b, 'm1.u4.d4', 'contractorBoard', 280, 4)
  check('X-01', len(r) >= 3 and one_each(r), '«لوحة المقاول» بنقرة مزدوجة على كل جواب صحيح: جوابٌ واحد مسجَّل لكل بيت، ولا خطأ من اللمسة الثانية', r)
  check('X-01', not errs, 'لا أخطاء في الصفحة (نقرة مزدوجة، لوحة المقاول)', errs[:3])
  r, fin, cs, errs = await dbl_run(b, 'm1.u3.d4', 'mastery', 280, 8)
  m = {k: (v or {}).get('mastered') for k, v in cs.items()}
  check('X-01', len(r) >= 3 and one_each(r) and m and all(m.values()), 'الإتقان (u3/d4) بنقرة مزدوجة على كل جواب صحيح: لا خطأ من اللمسة الثانية، فيُتقَن المفهوم', [r, m, fin])
  check('X-01', not errs, 'لا أخطاء في الصفحة (نقرة مزدوجة، الإتقان)', errs[:3])
  r, fin, cs, errs = await dbl_run(b, 'm1.u3.d4', 'mastery', 0, 8)
  m = {k: (v or {}).get('mastered') for k, v in cs.items()}
  check('X-01', len(r) >= 3 and one_each(r) and m and all(m.values()), 'ضابط: لمسة واحدة على كل جواب في الإتقان تُقبل كلها، ويُتقَن المفهوم', [r, m])

# ---------- التقييم: A-01 وA-02 وA-05 وA-06 وA-08 وA-10 وA-14 وC-09 ----------
CLOCK = "window.__off = +(sessionStorage.getItem('__off') || 0); const __n = Date.now.bind(Date); Date.now = () => __n() + (window.__off || 0);"   # الإزاحة تبقى بعد إعادة الفتح
ST = """() => { const q = s => document.querySelector(s); const vis = s => { const e = q(s); return !!e && !e.hidden; }; const a = window.__auto;
  return { scene: window.__scene || '', home: vis('#home'), covers: [...document.querySelectorAll('.cover')].filter(c => !c.hidden).map(c => c.id), go: !!(q('#go') && !q('#go').disabled && !q('#go').classList.contains('idle')),
    auto: a ? { kind: a.kind, n: a.n } : null, crash: vis('#crashCover'), mode: window.__itemMode || '', spec: window.__item ? JSON.stringify(window.__item.spec) : null }; }"""
async def drive(pg, sel, policy, quit_on=None, on_answer=None):   # سائقٌ بالأزرار الحقيقية (من أدوات مراجع التقييم)
  await pg.evaluate("(s) => { const e = document.querySelector(s); if (e) e.scrollIntoView(); }", sel); await pg.click(sel); await pg.wait_for_timeout(150)
  last = -1; idle = 0
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
        how = policy(st)
        if on_answer: await on_answer(pg, st, how, 'before')
        await pg.evaluate("(h) => { const a = window.__auto; if (a) (h === 'wrong' && a.wrong ? a.wrong : a.ok)(); }", how)
        if on_answer: await on_answer(pg, st, how, 'after')
        if how == 'wrong' and quit_on and quit_on(st):
          await pg.wait_for_timeout(200); await pg.click('#mapBtn'); await pg.wait_for_timeout(200); await pg.click('#exLeave'); await pg.wait_for_timeout(250); return 'quit'
      idle = 0; await pg.wait_for_timeout(25); continue
    if st['go']: await pg.click('#go'); idle = 0; await pg.wait_for_timeout(20); continue
    idle += 1; await pg.wait_for_timeout(40)
    if idle > 400: return 'stuck:' + st['scene']
async def kid_ctx(b, prog=None):
  ctx = await b.new_context(viewport={'width': 412, 'height': 860}, timezone_id='Africa/Cairo'); await ctx.add_init_script(CLOCK); pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
  await pg.goto(FAST.replace('seed=5', 'seed=11')); await pg.wait_for_timeout(250)
  await pg.evaluate("""(p) => { localStorage.clear(); localStorage.setItem('hp_kids', JSON.stringify([{ id: 'k1', name: 'سلمى', gender: 'f', photo: '', avatar: 'f3' }])); localStorage.setItem('hp_kid', JSON.stringify('k1'));
    localStorage.setItem('hp_settings:k1', JSON.stringify({ sessionMax: 0, muted: true })); localStorage.setItem('hp_prog:k1', JSON.stringify(Object.assign({ schema: 3, unlockAll: true }, p || {}))); }""", prog or {})
  await reopen(pg); return ctx, pg, errs
async def setday(pg, d): await pg.evaluate("(d) => { window.__off = d * 864e5 + 10 * 3600e3; sessionStorage.setItem('__off', String(window.__off)); showHome(); }", d); await pg.wait_for_timeout(150)
SIG0 = """() => { if (window.__sfxW) return; window.__sfxW = 1; window.__sfx = []; window.__sigs = []; window.__mark = null;
  const t0 = tone; tone = function (notes) { window.__sfx.push(JSON.stringify(notes)); return t0.apply(this, arguments); };   /* ما يُسمع فعلاً، لا اسم النغمة */
  const la = logAttempt; logAttempt = function (a) { if (window.__itemMode === 'mastery') window.__mark = [(window.__clips || []).length, window.__sfx.length]; return la.apply(this, arguments); };   /* البداية لحظة تسجيل الجواب */
  const orig = runItem; runItem = async function (spec, mode, ctx) { const r = await orig(spec, mode, ctx);   /* والنهاية نهاية البند وحده، لا الجولة */
    if (mode === 'mastery' && window.__mark) { const [c, f] = window.__mark; window.__mark = null;
      window.__sigs.push({ ok: !!r.firstTry, clips: (window.__clips || []).slice(c).map(x => x.replace(/_[mf]$/, '')), sfx: window.__sfx.slice(f).filter(x => x !== '[[880,0.1]]'),
        marks: document.querySelectorAll('#stage .pick.ok, #stage .pick.no, #stage .no, #stage .shut').length }); }
    return r; }; }"""
async def a01_cases(b):
  for lid in ('m1.u1.d1', 'm1.u2.d2', 'm1.u3.d3', 'm1.u4.d2'):
    ctx, pg, errs = await kid_ctx(b); flip = {}
    def pol(st):
      if st['mode'] != 'mastery': return 'ok'
      flip[st['spec']] = flip.get(st['spec'], 0) + 1; return 'wrong' if flip[st['spec']] == 1 and len(flip) % 2 else 'ok'
    async def on_ans(pg, st, how, when):
      if when == 'before' and st['mode'] == 'mastery': await pg.evaluate(SIG0)
    r = await drive(pg, '.stop[data-lesson="%s"]' % lid, pol, on_answer=on_ans); sigs = await pg.evaluate("() => window.__sigs || []")
    key = lambda x: json.dumps({k: x[k] for k in ('clips', 'sfx', 'marks')}, ensure_ascii=False, sort_keys=True)
    ok_s = {key(x) for x in sigs if x['ok']}; bad_s = {key(x) for x in sigs if not x['ok']}
    check('A-01', r == 'done' and ok_s and bad_s and ok_s == bad_s and all(x['marks'] == 0 for x in sigs),
          'الإتقان في %s: ما يُسمع ويُرى بعد الجواب الصحيح هو نفسه بعد الخاطئ (لا علامة ولا نغمة ولا تعليل يكشفه)' % lid, [r, sorted(ok_s)[:3], sorted(bad_s)[:3]])
    check('A-01', not errs, 'لا أخطاء في الصفحة (الإتقان المحايد، %s)' % lid, errs[:3]); await ctx.close()
async def a02_cases(b):
  ctx, pg, errs = await kid_ctx(b); await setday(pg, 0)
  await drive(pg, '.stop[data-lesson="m1.u1.d1"]', lambda st: 'wrong' if st['mode'] == 'mastery' else 'ok')
  rows = []
  for d in (1, 4, 11, 32):
    await setday(pg, d); due0 = await pg.evaluate("() => reviewDue().filter(x => x.L.id === 'm1.u1.d1').map(x => x.C)")
    if not due0: rows.append([d, 'لا شيء مستحق']); continue
    b0 = await pg.evaluate("() => JSON.parse(JSON.stringify(PROG.srs['m1.u1.d1'].cs))")
    r = await drive(pg, '.stop.review', lambda st: 'wrong' if st['mode'] == 'review' and st['scene'] == 'review:m1.u1.d1' else 'ok', quit_on=lambda st: st['mode'] == 'review' and st['scene'] == 'review:m1.u1.d1')
    await reopen(pg); m0 = await pg.evaluate("() => JSON.parse(JSON.stringify(PROG.srs['m1.u1.d1'].cs))"); due1 = await pg.evaluate("() => reviewDue().filter(x => x.L.id === 'm1.u1.d1').map(x => x.C)")
    rows.append([d, r, b0, m0, due1])
  print('    A-02 rows:', json.dumps(rows, ensure_ascii=False)[:600], flush=True) if os.environ.get('DBG') else None
  ok = sum(1 for x in rows if len(x) == 5) >= 3 and all(len(x) == 5 and x[1] == 'quit' and not x[4] and all(x[3][c]['step'] <= max(0, x[2][c]['step'] - 1) or x[3][c]['step'] == 0 for c in x[2] if c in x[3]) for x in rows if x[1] != 'لا شيء مستحق')
  final = await pg.evaluate("() => PROG.srs['m1.u1.d1'].cs")
  check('A-02', ok and rows and all(v.get('due') is not None for v in final.values()), 'خطأ أول في مراجعة اليوم ثم خروج: يُحفظ الخطأ فوراً، ولا يعود المفهوم في اليوم نفسه، ولا يبلغ «ثابت» بالخروج والإعادة', [rows, final])
  check('A-02', not errs, 'لا أخطاء في الصفحة (المراجعة والخروج)', errs[:3]); await ctx.close()
  # ضابط: مراجعة بلا خطأ تتقدّم خطوة وتُحفظ
  ctx, pg, errs = await kid_ctx(b); await setday(pg, 0); await drive(pg, '.stop[data-lesson="m1.u1.d1"]', lambda st: 'ok'); await setday(pg, 1)
  r = await drive(pg, '.stop.review', lambda st: 'ok'); await reopen(pg); cs = await pg.evaluate("() => PROG.srs['m1.u1.d1'].cs")
  check('A-02', r == 'done' and all(v['step'] == 1 for v in cs.values()), 'ضابط: مراجعة بلا خطأ تتقدّم خطوة وتبقى بعد إعادة الفتح', [r, cs]); await ctx.close()
async def report_cases(b):
  now = 'Date.now()'
  att = [{'t': 0, 'lesson': 'm1.u1.d2', 'scene': 'practice', 'ok': i < 4, 'firstTry': True} for i in range(10)] + [{'t': 0, 'lesson': 'm1.u1.d2', 'scene': 'practice', 'ok': True, 'firstTry': False} for _ in range(6)]
  ctx, pg, errs = await kid_ctx(b)
  await pg.evaluate("(a) => { const t = Date.now() - 3600e3; LOG.attempts = a.map(x => Object.assign({}, x, { t })); store.set(kk('hp_log'), LOG); }", att)
  await pg.evaluate("() => weeklyReport()"); await pg.wait_for_timeout(300); txt = await pg.evaluate("() => document.querySelector('#report').textContent"); want = await pg.evaluate("() => DG(40) + '٪ (' + DG(4) + ' من ' + DG(10) + ')'")
  check('A-05', want in txt, 'التقرير الأسبوعي: «الصواب من المحاولة الأولى» = 4 من 10 (المحاولات الأولى وحدها، لا 4 من 16)', [want, txt[txt.find('المحاولة الأولى'):][:80]]); await ctx.close()
  # A-06: مفهومٌ مؤجَّل يثبت في المراجعة
  pr = {'m1.u1.d1': {'done': True, 'at': 1, 'deferred': True, 'cs': {'C001': {'deferred': True, 'ok': 1, 'of': 4, 'round': 2, 'at': 1}}}, 'srs': {'m1.u1.d1': {'cs': {'C001': {'step': 3, 'due': 1}}, 'k': {}, 'k2': 0}}}
  ctx, pg, errs = await kid_ctx(b, pr); r = await drive(pg, '.stop.review', lambda st: 'ok'); await reopen(pg); await pg.evaluate("() => openPanel()"); await pg.wait_for_timeout(200)
  st = await pg.evaluate("() => ({ srs: PROG.srs['m1.u1.d1'].cs.C001, pill: statusPill(LDATA['m1.u1.d1']), concept: conceptPill(LDATA['m1.u1.d1'], 'C001') })")
  check('A-06', r == 'done' and st['srs']['due'] is None and 'مؤجَّل' not in st['pill'] and 'ثابت بالمراجعة' in st['concept'], 'مفهومٌ أُجّل ثم ثبت في المراجعة: لا «مؤجَّل» في اللوحة، و«ثابت بالمراجعة» في خريطة الإتقان', [r, st])
  check('A-06', not errs, 'لا أخطاء في الصفحة (المؤجَّل يثبت)', errs[:3]); await ctx.close()
async def misc_cases(b):
  ctx, pg, errs = await kid_ctx(b)
  r = await pg.evaluate("""() => { const spec = LDATA['m1.u2.d4'].mastery.concepts.N005.find(x => x.t === 'splitMake'); const it = ITEM.splitMake.make(spec);
    return { spec, none: ITEM.splitMake.judge(it, 0).ok, all: ITEM.splitMake.judge(it, spec.n).ok, some: [...Array(spec.n + 1).keys()].filter(k => ITEM.splitMake.judge(it, k).ok) }; }""")
  check('A-08', not r['none'] and not r['all'] and r['some'] and min(r['some']) >= 1, '«لوّن بطريقة جديدة» في إتقان N005: «تمّ» بلا لمسة ليس صواباً، والجواب يحتاج تلويناً', r)
  d = await pg.evaluate("""() => { const c = [0, 0, 0]; let n = 0; for (let i = 0; i < 9000; i++) { const a = 1 + (i % 9); const o = nearNums(a, 10).slice().sort((x, y) => x - y); c[o.indexOf(a)]++; n++; } return c.map(x => x / n); }""")
  check('A-10', all(0.25 <= x <= 0.42 for x in d), 'الخيارات العددية الثلاثة (الأجوبة 1–9): رتبة الجواب أصغرها وأوسطها وأكبرها قريبة من الثلث لكلٍّ', d)
  t = await pg.evaluate("""() => { const d = new Date(); d.setHours(23, 59, 0, 0); const t0 = d.getTime(); return [(dueAfter(t0, 1) - t0) / 36e5, (dueAfter(t0 - 12 * 36e5, 1) - (t0 - 12 * 36e5)) / 36e5]; }""")
  check('A-14', t[0] >= 16 and t[1] <= 24.01, 'موعد «بعد يوم»: لدرسٍ انتهى قبيل منتصف الليل لا يحين قبل 16 ساعة، ولدرسٍ ظهراً يبقى منتصف ليل الغد', t)
  nb = await pg.evaluate("""() => { SET.sessionMax = 2; SESSION = { n: 2, t: Date.now() + 2 * 36e5 }; return needBreak(); }""")
  check('C-09', nb is False, 'ساعة الجهاز رجعت ساعتين بعد جلسة بلغت حدّها: جلسة جديدة، لا استراحة مفروضة', nb)
  check('A-08', not errs, 'لا أخطاء في الصفحة (التقييم: بنود متفرّقة)', errs[:3]); await ctx.close()

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch()
    if on('C-01'): await c01_cases(b)
    if on('C-02') or on('X-06'): await gate_cases(b)
    if on('X-01'): await dbl_cases(b)
    if on('A-01'): await a01_cases(b)
    if on('A-02'): await a02_cases(b)
    if on('A-05') or on('A-06'): await report_cases(b)
    if any(on(k) for k in ('A-08', 'A-10', 'A-14', 'C-09')): await misc_cases(b)
    if any(on(k) for k in ('X-02', 'X-04', 'X-05', 'X-11', 'C-17')): await speech_cases(b)
    await b.close()
  print('FAILS:', len(FAILS)); sys.exit(1 if FAILS else 0)
asyncio.run(main())
