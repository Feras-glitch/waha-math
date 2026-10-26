# «أعد الجملة» (المبدأ 13، D236، D254 (1)): فحص موجّه لما لا يراه السائق الآلي.
# python3 test/replay_run.py   (FILE=مسار نسخة الفحص لتشغيله على نسخة أخرى، كالنسخة التي فيها الخطأ القديم: الدرس 98)
# 1) الخروج إلى الخريطة عند البطاقتين، ثم درس آخر و«أعد الجملة»: لا تُسمع بطاقتا الدرس الأول ولا جملة فوضى، ولا عطل.
# 2) الخروج عند بند تعليل، ثم درس آخر و«أعد الجملة»: لا شاشة عطل.
# 3) «أعد الجملة» أثناء جملة تُقال (بالزمن الحقيقي): تُعاد الجملة من أولها، لا صمت.
# 4) «أعد الجملة» أثناء قراءة البطاقتين، بالترتيبين وبتأخيرات مختلفة: الإعادة التالية تُسمع البطاقتين كلتيهما، وجملة فوضى مسبوقة بـ «فوضى تظنّ…»، والفقاعة لا تكتبها.
# 5) «أعد الجملة» عند بند التعليل يعيد السؤال ثم الأسباب.
# 6) بعد قراءة الخيارات (سلال الاختبار، و«أضف/أبعد» في البناء، و«نعم/لا» والخاصية، وبطاقتا الجملة العددية، وأعداد الحقيقة والتفكيك) وبعد عددٍ يُلحَق بالسؤال (ضعي… ثمانية، المسي بطاقة العدد…):
#    «أعد الجملة» يعيد السؤال أولاً لا خياراً ولا عدداً، والفقاعة ليست نصّ خيار ولا كلمة عدد وحدها؛ والمقارنة بنصّ الجمل المقروءة نفسها لا بنصّ الأزرار (الفحص المستقل الرابع، ج7)
# (كان:) «أعد الجملة» يعيد السؤال ثم الخيارات، لا آخر خيار وحده،
#    والفقاعة تبقى على السؤال (اسم السلّة الأخير كان أحياناً الجواب وأحياناً الخطأ).
# 7) الخروج من كل نوع انتظار (فرز، وبناء، واختيار، ولمس الكل، والبيت؛ وفي S1-U3: ضع الشيء، ولوّن العربات، والروبوت، والطريق، والخريطة) ثم «أعد الجملة» في درس آخر: لا شيء من الأول، ولا عطل (الدرس 105).
# وفي (6) خيارات S1-U3: كلمات الموضع، والأعداد الترتيبية، واليمين واليسار، وبطاقتا العدد قبل وبعد.
# 8) بعد فعل الطفل (لمس بلاطة، وزرّ أمر الروبوت، وعرض المساعدة، و«نبقى» في غطاء الخروج): «أعد الجملة» يعيد السؤال والفقاعة عليه (الفحص المستقل B).
# 9) غطاء الخروج يوقف الدرس: لا جملة ولا عرض مساعدة تحته، و«نبقى» تعيد المقطوعة؛ و«أعد» عند سؤال حلّ التعدّي يعيد الحلّ كله (الفحص المستقل F2 (1) و(3)).
import asyncio, os, sys
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
FILE = os.environ.get('FILE', os.path.join(HERE, '..', 'dist', 'واحة_الرياضيات.dev.html'))
FAILS = []
def check(ok, what):
  print(('ok   ' if ok else 'FAIL ') + what); (None if ok else FAILS.append(what))

async def boot(p, seed=7, fast=True, settings=None, dev='Pixel 5'):
  b = await p.chromium.launch(); ctx = await b.new_context(**p.devices[dev]); pg = await ctx.new_page(); errs = []
  pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
  await pg.goto('file://' + os.path.abspath(FILE) + ('#fast' if fast else '#test') + '&seed=%d' % seed); await pg.wait_for_timeout(300)
  s = {'sessionMax': 0}; s.update(settings or {})
  await pg.evaluate("""(s) => { localStorage.clear(); localStorage.setItem('hp_kids', JSON.stringify([{ id: 'k1', name: 'سلمى', gender: 'f' }])); localStorage.setItem('hp_kid', JSON.stringify('k1'));
    localStorage.setItem('hp_settings:k1', JSON.stringify(s)); localStorage.setItem('hp_prog:k1', JSON.stringify({ schema: 3, unlockAll: true })); }""", s)
  await pg.reload(); await pg.wait_for_timeout(500)
  return b, pg, errs

STATE = """() => { const a = window.__auto; const q = s => document.querySelector(s);
  return { scene: window.__scene || '', n: a ? a.n : null, kind: a ? a.kind : null, mode: window.__itemMode || '', itype: window.__item ? window.__item.itype : '',
    go: !!(q('#go') && !q('#go').disabled && !q('#go').classList.contains('idle')), home: !q('#home').hidden, covers: [...document.querySelectorAll('.cover')].filter(c => !c.hidden).map(c => c.id) }; }"""

async def drive_until(pg, stop, maxsteps=4000):
  last = -1
  for _ in range(maxsteps):
    st = await pg.evaluate(STATE)
    if stop(st) or (st['home'] and not st['covers']) or 'crashCover' in st['covers']: return st
    if st['n'] is not None and st['n'] != last:
      last = st['n']
      if st['kind'] == 'pick' and st['scene'].endswith(':bag'): await pg.evaluate("() => { const b = [...document.querySelectorAll('.choices .pick')]; (b.find(x => x.dataset.k === 'screen') || b[0]).click(); }")
      else: await pg.evaluate("() => { const a = window.__auto; if (a) a.ok(); }")
      await pg.wait_for_timeout(40); continue
    if st['go']: await pg.click('#go'); await pg.wait_for_timeout(30); continue
    await pg.wait_for_timeout(50)
  return await pg.evaluate(STATE)

async def exit_then_replay(p, first, stop, second, label):
  b, pg, errs = await boot(p)
  await pg.evaluate("(id) => { runLesson(id); }", first)
  st = await drive_until(pg, stop); await pg.wait_for_timeout(400)
  check(stop(st), '%s: بلغ الموضع (%s)' % (label, st['scene']))
  await pg.click('#mapBtn'); await pg.wait_for_timeout(200); await pg.click('#exLeave'); await pg.wait_for_timeout(300)
  await pg.evaluate("(id) => { runLesson(id); }", second)
  for _ in range(100):
    s2 = await pg.evaluate(STATE)
    if s2['n'] is not None or s2['go']: break
    await pg.wait_for_timeout(50)
  await pg.wait_for_timeout(300); await pg.evaluate("() => { window.__clips = []; }")
  await pg.click('#replay'); await pg.wait_for_timeout(1200)
  clips = await pg.evaluate("() => window.__clips"); covers = (await pg.evaluate(STATE))['covers']
  check(not any(('.ch.' in c or 'gen.chaos' in c or first in c) for c in clips), '%s: «أعد الجملة» في %s لا يُسمع شيئاً من %s ولا جملة فوضى %s' % (label, second, first, clips))
  check('crashCover' not in covers and not errs, '%s: لا عطل %s' % (label, errs[:2]))
  await b.close()

CARDJS = """async (d) => { replayLine(); await new Promise(r => setTimeout(r, 300)); window.__clips = [];
  replayLine(); await new Promise(r => setTimeout(r, d)); const mark = window.__clips.length; replayLine(); await new Promise(r => setTimeout(r, 600));
  const seen = []; return { after: window.__clips.slice(mark), say: document.querySelector('#say').textContent, hide: document.querySelector('#bubble').classList.contains('hidetext') }; }"""

async def section8(p):
  # 8) السؤال يبقى ما يُعاد بعد أن يفعل الطفل (الفحص المستقل B، M6): بعد لمس بلاطة (يُقال عددها)، وبعد زرّ أمر الروبوت (يُقال الأمر)،
  #    وبعد عرض المساعدة حين يسكت الطفل («هل نفكّر معاً؟»)، وبعد «نبقى» في غطاء الخروج: «أعد الجملة» يعيد السؤال، والفقاعة عليه
  QTXT = "() => { const it = window.__item; return it ? [it.q, G(lineOf(it.q)[2])] : null; }"
  async def ask_again(pg, label, act):
    q = await pg.evaluate(QTXT); await act(); await pg.wait_for_timeout(700)
    said = await pg.evaluate("() => (window.__clips || []).slice(-3)")
    await pg.evaluate("() => { window.__clips = []; }"); await pg.click('#replay'); await pg.wait_for_timeout(900)
    clips = await pg.evaluate("() => window.__clips"); say = await pg.evaluate("() => document.querySelector('#say').textContent")
    check(bool(q) and bool(clips) and ('.' + q[0]) in clips[0] and say.strip() == q[1].strip(),
          '%s: بعده %s، و«أعد الجملة» يعيد السؤال %s، والفقاعة «%s»' % (label, said, clips[:2], say[:40]))
  for lid, stop, label, act in [
      ('m1.u3.d5', lambda s: s['mode'] == 'practice' and s['itype'] == 'roadHop' and s['kind'] == 'road', 'لمس بلاطة',
       lambda pg: pg.evaluate("() => { const it = window.__item; const n = it.a + (it.b != null ? Math.sign(it.b - it.a) : (it.dir || 1)); document.querySelector('#stage [data-n=\"' + n + '\"]').dispatchEvent(new MouseEvent('click', { bubbles: true })); }")),
      ('m1.u3.d3', lambda s: s['mode'] == 'practice' and s['itype'] == 'robot' and s['kind'] == 'prog', 'زرّ أمر الروبوت',
       lambda pg: pg.evaluate("() => document.querySelector('.rbbar .pick[data-k=\"F\"]').click()")),
      ('m1.u3.d2', lambda s: s['mode'] == 'practice' and s['itype'] == 'lineTap' and s['kind'] == 'tap', 'عرض المساعدة بعد السكوت',
       lambda pg: pg.wait_for_function("() => (window.__clips || []).some(c => c.startsWith('gen.hintOffer'))", timeout=8000)),
      ('m1.u3.d1', lambda s: s['mode'] == 'practice' and s['itype'] == 'place' and s['kind'] == 'place', '«نبقى» في غطاء الخروج',
       lambda pg: pg.evaluate("async () => { document.querySelector('#mapBtn').click(); await new Promise(r => setTimeout(r, 500)); document.querySelector('#exStay').click(); }"))]:
    b, pg, errs = await boot(p)
    await pg.evaluate("(id) => { runLesson(id); }", lid)
    st = await drive_until(pg, stop); await pg.wait_for_timeout(1200)
    if not stop(st): check(False, '%s (%s): لم يبلغ الموضع %s' % (label, lid, st['scene'])); await b.close(); continue
    await ask_again(pg, '%s (%s)' % (label, lid), lambda: act(pg))
    check(not errs, '%s: لا خطأ في الصفحة %s' % (label, errs[:2])); await b.close()

  # و«أعد الجملة» في «أيّ أمر اتّبع الروبوت؟» يعيد حركة الروبوت مع السؤال (الفحص المستقل C، ن-ث11؛ وD: لم يكن له فحص)، في الإتقان حيث لا تلميح يعيدها
  b, pg, errs = await boot(p)
  await pg.evaluate("""() => { CUR = LDATA['m1.u3.d3']; show('lesson'); const spec = CUR.mastery.concepts.C013.find(x => x.t === 'robotWatch'); runItem(JSON.parse(JSON.stringify(spec)), 'mastery', { scene: 'mastery' }); }""")
  await pg.wait_for_function("() => window.__auto && window.__auto.kind === 'card'", timeout=15000); await pg.wait_for_timeout(600)
  await pg.evaluate("""() => { window.__moves = 0; const svg = document.querySelector('#stage svg'); window.__rbmo = new MutationObserver(ms => { for (const m of ms) if (m.addedNodes.length) window.__moves++; }); window.__rbmo.observe(svg, { childList: true, subtree: true }); }""")
  await pg.click('#replay'); await pg.wait_for_timeout(2500)
  moves = await pg.evaluate("() => { window.__rbmo.disconnect(); return window.__moves; }")
  check(moves > 0 and not errs, '«أعد الجملة» في «أيّ أمر اتّبع الروبوت؟» يعيد حركته (%d تغييراً في المسرح) %s' % (moves, errs[:1])); await b.close()

  # والجملة الأطول من ثلاثة أسطر على الشاشة القصيرة (الفحص المستقل B): سهم في أسفل الفقاعة، وزرّ «أعد» يبقى فيها حين يُمرَّر النصّ، وبعد الجملة يُرى آخرها
  for dev in ['iPhone SE', 'Galaxy S5']:
    b, pg, errs = await boot(p, fast=False, settings={'muted': True}, dev=dev)
    await pg.evaluate("() => { CUR = LDATA['m1.u3.d4']; show('lesson'); newStage(320, {}); window.__done = false; say(...lineOf('ex.find0')).then(() => { window.__done = true; }); }"); await pg.wait_for_timeout(500)
    cue = await pg.evaluate("() => document.querySelector('#bubble').classList.contains('saymore')")
    await pg.evaluate("() => { const s = document.querySelector('#say'); s.scrollTop = s.scrollHeight; }"); await pg.wait_for_timeout(200)
    inside = await pg.evaluate("() => { const r = document.querySelector('#replay').getBoundingClientRect(), b = document.querySelector('#bubble').getBoundingClientRect(); return r.top >= b.top - 1 && r.bottom <= b.bottom + 1; }")
    await pg.evaluate("() => { document.querySelector('#say').scrollTop = 0; }")
    await pg.wait_for_function("() => window.__done", timeout=40000); await pg.wait_for_timeout(900)
    end = await pg.evaluate("() => { const s = document.querySelector('#say'); return s.scrollTop + s.clientHeight >= s.scrollHeight - 2; }")
    check(cue and inside and end and not errs, '%s: جملة أطول من ثلاثة أسطر: سهم البقية %s، و«أعد» في الفقاعة بعد التمرير %s، وآخر الجملة يُرى بعدها %s' % (dev, cue, inside, end)); await b.close()

async def section9(p):
  # 9) غطاء الخروج يوقف الدرس (الفحص المستقل F2 (1)(ب) و(3)): لا تُقال تحته جملة درس ولا عرض مساعدة، ولا يمضي انتظار بالبوابة؛
  #    و«نبقى» تعيد الجملة التي قطعها من أولها ثم يمضي الدرس؛ و«أعد الجملة» عند سؤال الحلّ المشترك في التعدّي يعيد الحلّ كله (F2 (1)(أ))
  nf = lambda c: c[:-2] if c.endswith(('_f', '_m')) else c
  TRANS = """async (q) => { const L = LDATA['m1.u4.d4']; CUR = L; show('lesson'); window.__clips = []; const v = [...L.practice.normal, ...L.practice.challenge].find(x => x.q === q);
    const it = ITEM.transPick.make(JSON.parse(JSON.stringify(v))); ITEM.transPick.ask(it, 'practice', 3).catch(() => {}); return ['gen.trans.basket.' + spanCat(it.la), 'gen.trans.basket2.' + spanCat(it.lb), 'gen.trans.pick.' + it.ask]; }"""
  TR = lambda pg: pg.evaluate("() => (window.__clips || []).filter(c => !c.startsWith('gen.exit'))")
  # أدوات الأقسام (مرفوعة: SUB9 يشغّل أقساماً بعينها، الفحص المستقل H2)
  async def wf(pg, js, ms, arg=None):   # انتظارٌ لا يوقف التشغيل إن لم يتحقّق: يخفق الفحص بعده برسالته
    try: await pg.wait_for_function(js, arg=arg, timeout=ms)
    except Exception: pass
  async def stay_after(pg, start_js, wait_js, k_done, settings=None, delay=500):
    await pg.evaluate(start_js); await pg.wait_for_function(wait_js, timeout=20000, polling=20); await pg.wait_for_timeout(delay)
    await pg.evaluate("() => { window.__clips = []; }"); await pg.click('#mapBtn'); await pg.wait_for_timeout(3000); under = await TR(pg)
    await pg.evaluate("() => { window.__clips = []; }"); await pg.click('#exStay')
    try: await pg.wait_for_function("(k) => k.every(x => (window.__clips || []).some(c => c.startsWith(x)))", arg=k_done, timeout=30000)
    except Exception: pass   # ما لم يُقل بعد «نبقى» يخفق الفحص برسالته، لا التشغيل كله
    await pg.wait_for_timeout(200); return under, [nf(c) for c in await TR(pg)]
  CARDS = "() => { const L = LDATA['m1.u1.d1']; CUR = L; show('lesson'); window.__clips = []; chaosCards({ right: 'ch.right', wrong: 'ch.wrong' }).catch(() => {}); }"
  HOOK = "() => { const L = LDATA['m1.u4.d4']; CUR = L; show('lesson'); window.__clips = []; window.__clipT = []; SCENES.mixedHook(L.flow[0]).catch(() => {}); }"
  # rAF كما في الجهاز: كل إطار يمرّ بطابور يُسلَّم في الإطار الحقيقي التالي إن كانت الصفحة ظاهرة، فلا يجري إطارٌ طُلب قبل الإخفاء والصفحة مخفية (RAFW قبل بدء الحركة)
  RAFW = """() => { if (window.__raf0) return; const raf0 = window.__raf0 = window.requestAnimationFrame.bind(window); let Q = [], on = false;
    const pump = ts => { on = false; if (document.hidden) return; const q = Q; Q = []; q.forEach(f => f(ts)); };
    window.__rafKick = () => { if (Q.length && !on) { on = true; raf0(pump); } }; window.requestAnimationFrame = f => { Q.push(f); window.__rafKick(); return 0; }; }"""
  HIDE = """(h) => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => h }); }"""
  FLUSH = "() => { if (window.__rafKick) window.__rafKick(); }"
  VIS = "() => document.dispatchEvent(new Event('visibilitychange'))"
  if on9('أ'):
    # (أ) «أعد الجملة» عند سؤال الحلّ
    b, pg, errs = await boot(p)
    want = await pg.evaluate(TRANS, 'pr.t2')
    await pg.wait_for_function("() => (window.__clips || []).some(c => c.startsWith('gen.trans.pick'))", timeout=10000); await pg.wait_for_timeout(300)
    await pg.evaluate("() => { window.__clips = []; }"); await pg.click('#replay'); await pg.wait_for_timeout(1200)
    got = [nf(c) for c in await pg.evaluate("() => window.__clips")]
    check(got[:3] == want and not errs, '«أعد الجملة» عند سؤال الحلّ المشترك في التعدّي يعيد السلّتين ثم السؤال %s (المطلوب %s)' % (got[:4], want)); await b.close()
  if on9('ب'):
    # (ب) الخريطة وسط جملة السلّة الأولى (بالزمن الحقيقي، صامتاً بزمن القراءة): لا جملة درس تحت الغطاء، ثم «نبقى» تعيدها ثم الثانية ثم السؤال
    b, pg, errs = await boot(p, fast=False, settings={'muted': True})
    want = await pg.evaluate(TRANS, 'pr.t1')
    await pg.wait_for_function("() => (window.__clips || []).some(c => c.startsWith('gen.trans.basket.'))", timeout=10000); await pg.wait_for_timeout(400)
    await pg.evaluate("() => { window.__clips = []; }"); tm = await pg.evaluate("() => performance.now()"); await pg.click('#mapBtn'); await pg.wait_for_timeout(7000)
    under = await TR(pg); n0 = await pg.evaluate("() => window.__autoN || 0")
    await pg.evaluate("() => { window.__clips = []; }"); ts = await pg.evaluate("() => performance.now()"); await pg.click('#exStay')
    await pg.wait_for_function("() => (window.__clips || []).some(c => c.startsWith('gen.trans.pick'))", timeout=20000); await pg.wait_for_timeout(200)
    after = [nf(c) for c in await TR(pg)]
    check(not under and after[:3] == want and not errs, 'الخريطة وسط جملة سلّة التعدّي: تحت الغطاء %s، وبعد «نبقى» %s (المطلوب %s)' % (under, after[:4], want))
    T = await pg.evaluate("() => window.__clipT || []")
    cut = [x for x in T if x[1] == 's' and x[2] < tm and not x[0].startswith('gen.exit')][-1:]
    e_cut = [x for x in T if cut and x[0] == cut[0][0] and x[1] == 'e' and x[2] > cut[0][2]][:1]
    q = [x for x in T if x[0].startswith('gen.exit.ask') and x[1] == 's' and x[2] > tm][:1]
    late = [x[0] for x in T if x[2] > ts and x[1] == 's' and x[0].startswith('gen.exit')]
    check(bool(cut and e_cut and q) and q[0][3] and e_cut[0][2] <= q[0][2] + 50 and not late,
          'الغطاء يقطع الجملة الجارية قبل سؤاله (نهايتها %s، وبدء السؤال %s)، وسؤاله يبدأ والغطاء مفتوح (%s)، ولا سؤال خروج بعد «نبقى» %s' % (
            e_cut and round(e_cut[0][2]), q and round(q[0][2]), q and q[0][3], late)); await b.close()
  if on9('ج'):
    # (ج) الخريطة والطفل يفكّر (بند «ضع»، بعد مهلة الفانوس): لا عرض مساعدة تحت الغطاء ولا بعد «نبقى»، و«نبقى» تعيد السؤال
    b, pg, errs = await boot(p)
    await pg.evaluate("(id) => { runLesson(id); }", 'm1.u3.d1')
    stop = lambda s: s['mode'] == 'practice' and s['itype'] == 'place' and s['kind'] == 'place'
    st = await drive_until(pg, stop); await pg.wait_for_timeout(600)
    q = await pg.evaluate("() => window.__item && window.__item.q"); n0 = await pg.evaluate("() => window.__autoN || 0")
    await pg.evaluate("() => { window.__clips = []; }"); await pg.click('#mapBtn'); await pg.wait_for_timeout(3500)
    under = await TR(pg); await pg.evaluate("() => { window.__clips = []; }"); await pg.click('#exStay'); await pg.wait_for_timeout(900)
    after = await TR(pg); n1 = await pg.evaluate("() => window.__autoN || 0")
    check(stop(st) and not under and bool(after) and ('.' + str(q)) in after[0] and not any('hintOffer' in c for c in after) and n1 == n0 and not errs,
          'الخريطة والطفل يفكّر: تحت الغطاء %s، وبعد «نبقى» %s، والانتظار نفسه (%s، %s)' % (under, after[:3], n0, n1)); await b.close()
  if on9('د'):
    # (د) انتظار بالبوابة ينتظر «نبقى»، والخريطة تُسقطه
    b, pg, errs = await boot(p)
    # والبوابة نفسها بوعدٍ خام لا بـ sleep وحدها: sleep صار psleep يقف مع الدرس، فنجت طفرة «البوابة لا تنتظر الغطاء» (قبل الفحص المستقل H)
    r = await pg.evaluate("""async () => { CUR = LDATA['m1.u1.d1']; show('lesson'); const out = []; let a = false, c = false, g = false; pauseLesson();
      sleep(40).then(() => { a = true; }); gate(new Promise(r => setTimeout(r, 40))).then(() => { g = true; }); await new Promise(r => setTimeout(r, 300)); out.push(a, g); resumeLesson(); await new Promise(r => setTimeout(r, 120)); out.push(a, g);
      pauseLesson(); sleep(40).then(() => { c = true; }); await new Promise(r => setTimeout(r, 200)); showHome(); await new Promise(r => setTimeout(r, 200)); out.push(c, PAUSED === null); return out; }""")
    check(r == [False, False, True, True, False, True] and not errs, 'انتظار بالبوابة والدرس موقوف (sleep ووعدٌ خام): لا يمضي حتى «نبقى»، ويسقط بالخريطة %s' % r); await b.close()
  if on9('هـ'):
    # (هـ) «نبقى» وسط البطاقات المسموعة أو الخيارات المقروءة تعيدها بتمهيدها كلها (الفحص المستقل G2 (1)): «فَوْضَى تَظُنُّ…» قبل جملتها الخاطئة، والسؤال قبل الخيارات
    for nth in (1, 2):
      b, pg, errs = await boot(p, fast=False, settings={'muted': True})
      wait = "() => (window.__clips || []).filter(c => /^m1\\.u1\\.d1\\.ch\\.(wrong|right)/.test(c)).length >= %d" % nth
      under, after = await stay_after(pg, CARDS, wait, ['m1.u1.d1.ch.wrong', 'm1.u1.d1.ch.right'])
      iw = after.index('m1.u1.d1.ch.wrong') if 'm1.u1.d1.ch.wrong' in after else -1
      check(not under and iw > 0 and after[iw - 1] == 'gen.chaos.thinks' and 'm1.u1.d1.ch.right' in after and not errs,
            '«نبقى» وسط البطاقة %d من البطاقتين المسموعتين: تحت الغطاء %s، وبعدها %s (المطلوب «فوضى تظنّ…» قبل الخاطئة، والبطاقتان)' % (nth, under, after[:5])); await b.close()
    for case, wait, st in (('وسط خيار «نعم»', "() => (window.__clips || []).includes('gen.opt.yes')", {'muted': True}),
                           ('بعد السؤال وقبل أول خيار', "() => (window.__clipT || []).some(x => x[0] === 'm1.u4.d4.hook.01' && x[1] === 'e')", {'muted': True, 'slow': True})):
      b, pg, errs = await boot(p, fast=False, settings=st)
      under, after = await stay_after(pg, HOOK, wait, ['gen.opt.yes', 'gen.opt.no'], delay=0 if 'قبل' in case else 400)
      check(not under and after[:3] == ['m1.u4.d4.hook.01', 'gen.opt.yes', 'gen.opt.no'] and not errs,
            '«نبقى» %s: تحت الغطاء %s، وبعدها %s (المطلوب السؤال ثم الخياران)' % (case, under, after[:4])); await b.close()
  if on9('و'):
    # (و) لوحة المفاتيح تحت الغطاء (الفحص المستقل G2 (3)): التركيز على «نبقى»، والدرس لا يُبلغ (inert)، والزرّ لا يفتح الغطاء مرتين، و«نبقى» تعيد التركيز إلى الخريطة
    b, pg, errs = await boot(p)
    await pg.evaluate(TRANS, 'pr.t2'); await pg.wait_for_function("() => (window.__clips || []).some(c => c.startsWith('gen.trans.pick'))", timeout=10000); await pg.wait_for_timeout(200)
    await pg.focus('#mapBtn'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(300)
    k1 = await pg.evaluate("() => [document.activeElement && document.activeElement.id, $('#lesson').inert === true]")
    await pg.keyboard.press('Tab'); await pg.wait_for_timeout(100)
    k2 = await pg.evaluate("() => !!(document.activeElement && document.activeElement.closest('#exitCover'))")
    k3 = await pg.evaluate("() => { const t = document.querySelector('#stage svg [role=button]'); if (t) t.focus(); return !!(document.activeElement && document.activeElement.closest('#lesson')); }")
    await pg.evaluate("() => { $('#mapBtn').click(); }"); await pg.wait_for_timeout(400)
    n_ask = await pg.evaluate("() => (window.__clips || []).filter(c => c.startsWith('gen.exit.ask')).length")
    await pg.click('#exStay'); await pg.wait_for_timeout(300)
    k4 = await pg.evaluate("() => [$('#lesson').inert === false, document.activeElement && document.activeElement.id]")
    check(k1 == ['exStay', True] and k2 and not k3 and n_ask == 1 and k4 == [True, 'mapBtn'] and not errs,
          'لوحة المفاتيح تحت غطاء الخروج: التركيز %s، وTab داخل الغطاء %s، وهدف المسرح لا يُبلغ %s، وسؤال الخروج مرة %d، وبعد «نبقى» %s' % (k1, k2, not k3, n_ask, k4)); await b.close()
  if on9('ز'):
    # (ز) الإيقاف يوقف الحركة والمؤقّتات (الفحص المستقل G2 (4)): tween وحركات الصفحة وpsleep تقف تحت الغطاء وتمضي بعد «نبقى»
    b, pg, errs = await boot(p, fast=False, settings={'muted': True})
    # وبعد «نبقى» (الفحص المستقل H2 (9): نجت «لا play() بعد نبقى» و«tween لا يطرح زمن الإيقاف» و«الإيقاف يلتقط كل الحركات»، وH2 (3) «تُبعث الملغاة»): الحركة الموقوفة
    # تمضي من موضعها، والانزلاق بعد 80 م.ث بين موضعه تحت الغطاء وآخره، والحركة المنتهية بـ fill لا تُعاد من أوّلها، والتي أُلغيت تحت الغطاء تبقى ملغاة
    r = await pg.evaluate("""async () => { const L = LDATA['m1.u4.d1']; CUR = L; show('lesson'); const svg = newStage(250, { oasis: false, ground: 0 }), w = ms => new Promise(r => setTimeout(r, ms));
      const o = lenAt(svg, { kind: 'strip', len: 150 }, MS_X - 120, 120); alignTo(o, MS_X, 1200);
      const r = el('rect', { width: 20, height: 20 }, svg); anim(r, [{ transform: 'translate(0px,0px)' }, { transform: 'translate(100px,0px)' }], { duration: 1200, fill: 'forwards' });
      const f = el('rect', { width: 20, height: 20 }, svg); anim(f, [{ transform: 'translate(0px,0px)' }, { transform: 'translate(50px,0px)' }], { duration: 100, fill: 'forwards' });
      const z = el('rect', { width: 20, height: 20 }, svg), za = z.animate([{ opacity: 1 }, { opacity: .3 }], { duration: 300, iterations: Infinity });
      let slept = false; psleep(1000).then(() => { slept = true; });
      await w(300); const fEnd = getComputedStyle(f).transform; $('#mapBtn').click(); await w(50); const x1 = o.x0, t1 = getComputedStyle(r).transform; za.cancel(); await w(1500); const x2 = o.x0, t2 = getComputedStyle(r).transform, s2 = slept;
      $('#exStay').click(); await w(80); const x3 = o.x0, t3 = getComputedStyle(r).transform, f3 = getComputedStyle(f).transform; await w(1600);
      return [x1 === x2, t1 === t2, s2, Math.abs(o.x0 - MS_X) < .5, slept, x1 > MS_X - 120 + 1 && x1 < MS_X - 1, x3 > x2 + .5 && x3 < MS_X - 5, t3 !== t2, getComputedStyle(r).transform === 'matrix(1, 0, 0, 1, 100, 0)', f3 === fEnd, za.playState]; }""")
    check(r == [True, True, False, True, True, True, True, True, True, True, 'idle'] and not errs,
          'غطاء الخروج يوقف الانزلاق (tween) والحركة والمؤقّت، ثم بعد «نبقى»: الانزلاق من موضعه لا من آخره، والحركة تمضي إلى نهايتها، والمنتهية لا تُعاد، والملغاة تبقى ملغاة %s' % r); await b.close()
  if on9('ح'):
    # (ح) إطفاء الشاشة يوقف الدرس كالغطاء، وظهورها يعيد المقطوعة ثم يمضي (الفحص المستقل G2 (5))
    b, pg, errs = await boot(p, fast=False, settings={'muted': True})
    await pg.evaluate("() => { const L = LDATA['m1.u4.d1']; CUR = L; show('lesson'); window.__clips = []; (async () => { await S('gen.glance.look'); await S('gen.glance.ask'); })(); }")
    await wf(pg, "() => (window.__clips || []).some(c => c.startsWith('gen.glance.look'))", 10000); await pg.wait_for_timeout(400)
    await pg.evaluate("() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); window.__clips = []; }")
    await pg.wait_for_timeout(5000); hid = [nf(c) for c in await pg.evaluate("() => window.__clips")]
    await pg.evaluate("() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); }")
    await wf(pg, "() => (window.__clips || []).some(c => c.startsWith('gen.glance.ask'))", 15000); await pg.wait_for_timeout(100)
    vis = [nf(c) for c in await pg.evaluate("() => window.__clips")]
    check(not hid and vis[:2] == ['gen.glance.look', 'gen.glance.ask'] and not errs, 'إطفاء الشاشة يوقف الدرس: والشاشة مطفأة %s، وبعد ظهورها %s' % (hid, vis[:3])); await b.close()
    # وكما في الجهاز (الفحص المستقل H2 (1) و(9)): المتصفح لا ينادي rAF والصفحة مخفية، فالإطار المؤجَّل يأتي بعد الظهور (أو قبل حدثه): الانزلاق بعد الظهور بـ 80 م.ث بين
    # موضعه عند الإخفاء وآخره، بالترتيبين؛ وبطاقتان مسموعتان يعيدهما الظهور بتمهيدهما (الخطّاف: نجت «الظهور resumeLesson لا resumeBack»)؛ والورشة بلا CUR لا تتكلّم
    # والشاشة مطفأة (H2 (2))؛ وسؤال غطاء الخروج يُقطع بالإخفاء ويُعاد بالظهور، ولا يُستأنف الدرس والغطاء مفتوح
    for order in ('frame-after', 'frame-before'):
      b, pg, errs = await boot(p, fast=False, settings={'muted': True})
      await pg.evaluate(RAFW); await pg.evaluate("() => { const L = LDATA['m1.u4.d1']; CUR = L; show('lesson'); const svg = newStage(250, { oasis: false, ground: 0 }); window.__o = lenAt(svg, { kind: 'strip', len: 150 }, MS_X - 120, 120); alignTo(window.__o, MS_X, 1500); }")
      await pg.wait_for_timeout(300); await pg.evaluate(HIDE, True); await pg.evaluate(VIS); xh = await pg.evaluate("() => window.__o.x0"); await pg.wait_for_timeout(2000)
      await pg.evaluate(HIDE, False)
      if order == 'frame-before': await pg.evaluate(FLUSH); await pg.wait_for_timeout(30); await pg.evaluate(VIS)
      else: await pg.evaluate(VIS); await pg.evaluate(FLUSH)
      await pg.wait_for_timeout(80); xv = await pg.evaluate("() => [window.__o.x0, MS_X]")
      check(xh < xv[0] < xv[1] - 5 and not errs, 'إطفاء الشاشة وسط الانزلاق (rAF مؤجَّل، الإطار %s): بعد الظهور بـ 80 م.ث %.1f بين موضعه عند الإخفاء %.1f وآخره %d' % (order, xv[0], xh, xv[1])); await b.close()
    # والبطاقتان بترتيبٍ عشوائي: الإطفاء وسط الأولى وهي الصحيحة يجعل «الظهور resumeLesson لا resumeBack» مكافئة (تُعاد المقطوعة ثم «فوضى تظنّ…» والخاطئة)، فنجت
    # في المجموعة وأُمسكت وحدها؛ ووسط الثانية تُعاد الثانية وحدها بلا الأولى في الترتيبين، كما في (هـ) (الدرس 239)
    for nth in (1, 2):
      b, pg, errs = await boot(p, fast=False, settings={'muted': True})
      await pg.evaluate(CARDS); await wf(pg, "() => (window.__clips || []).filter(c => /^m1\\.u1\\.d1\\.ch\\.(wrong|right)/.test(c)).length >= %d" % nth, 20000); await pg.wait_for_timeout(500)
      await pg.evaluate(HIDE, True); await pg.evaluate(VIS); await pg.evaluate("() => { window.__clips = []; }"); await pg.wait_for_timeout(3000); hid = [nf(c) for c in await pg.evaluate("() => window.__clips")]
      await pg.evaluate(HIDE, False); await pg.evaluate(VIS); await pg.evaluate(FLUSH)
      await wf(pg, "() => ['m1.u1.d1.ch.wrong', 'm1.u1.d1.ch.right'].every(x => (window.__clips || []).some(c => c.startsWith(x)))", 30000); await pg.wait_for_timeout(200)
      after = [nf(c) for c in await pg.evaluate("() => window.__clips")]; iw = after.index('m1.u1.d1.ch.wrong') if 'm1.u1.d1.ch.wrong' in after else -1
      check(not hid and iw > 0 and after[iw - 1] == 'gen.chaos.thinks' and 'm1.u1.d1.ch.right' in after and not errs,
            'إطفاء الشاشة وسط البطاقتين المسموعتين (البطاقة %d): والشاشة مطفأة %s، وبعد ظهورها %s (المطلوب البطاقتان بتمهيد «فوضى تظنّ…»)' % (nth, hid, after[:5])); await b.close()
    b, pg, errs = await boot(p, fast=False, settings={'muted': True})
    await pg.evaluate("() => { runWorkshop(UNITS.find(u => u.id === 'm1.u4')); }"); await wf(pg, "() => (window.__clips || []).length >= 1", 15000); await pg.wait_for_timeout(300)
    await pg.evaluate(HIDE, True); await pg.evaluate(VIS); await pg.evaluate("() => { window.__clips = []; }"); await pg.wait_for_timeout(4000); hid = [nf(c) for c in await pg.evaluate("() => window.__clips")]
    pz = await pg.evaluate("() => !!PAUSED"); await pg.evaluate(HIDE, False); await pg.evaluate(VIS); await pg.evaluate(FLUSH); await pg.wait_for_timeout(2500)
    vis = [nf(c) for c in await pg.evaluate("() => window.__clips")]
    check(not hid and pz and bool(vis) and not errs, 'إطفاء الشاشة في الورشة (بلا CUR): لا جملة والشاشة مطفأة %s (موقوفة %s)، وبعد ظهورها %s' % (hid, pz, vis[:3])); await b.close()
    b, pg, errs = await boot(p, fast=False, settings={'muted': True})
    await pg.evaluate("() => { const L = LDATA['m1.u4.d1']; CUR = L; show('lesson'); window.__clips = []; window.__clipT = []; (async () => { await S('gen.glance.look'); await S('gen.glance.ask'); })(); }")
    await wf(pg, "() => (window.__clips || []).some(c => c.startsWith('gen.glance.look'))", 10000); await pg.wait_for_timeout(300)
    await pg.click('#mapBtn'); await wf(pg, "() => (window.__clipT || []).some(x => x[0].startsWith('gen.exit.ask') && x[1] === 's')", 5000); await pg.wait_for_timeout(200)
    await pg.evaluate(HIDE, True); th = await pg.evaluate("() => performance.now()"); await pg.evaluate(VIS); await pg.wait_for_timeout(3000)
    await pg.evaluate(HIDE, False); tv = await pg.evaluate("() => performance.now()"); await pg.evaluate(VIS); await pg.evaluate(FLUSH); await pg.wait_for_timeout(1500)
    T = await pg.evaluate("() => window.__clipT || []"); lesson_under = [x[0] for x in T if x[1] == 's' and x[2] > th and not x[0].startswith('gen.exit')]
    cut = [x for x in T if x[0].startswith('gen.exit.ask') and x[1] == 'e' and th <= x[2] < th + 200]; again = [x for x in T if x[0].startswith('gen.exit.ask') and x[1] == 's' and x[2] >= tv]
    still = await pg.evaluate("() => [!!PAUSED, !$('#exitCover').hidden]")
    check(bool(cut) and bool(again) and not lesson_under and still == [True, True] and not errs,
          'غطاء الخروج والصفحة مخفية: سؤاله يُقطع بالإخفاء (%s) ويُعاد بالظهور (%s)، ولا جملة درس (%s)، والدرس موقوف والغطاء مفتوح (%s)' % (bool(cut), bool(again), lesson_under, still)); await b.close()
    b, pg, errs = await boot(p, fast=False, settings={'muted': True})
    await pg.evaluate("() => { const L = LDATA['m1.u4.d1']; CUR = L; show('lesson'); window.__clips = []; (async () => { await S('gen.glance.look'); await S('gen.glance.ask'); })(); }")
    await wf(pg, "() => (window.__clips || []).some(c => c.startsWith('gen.glance.look'))", 10000); await pg.wait_for_timeout(300)
    await pg.evaluate(HIDE, True); await pg.evaluate(VIS); await pg.evaluate("() => { $('#mapBtn').click(); }"); await pg.wait_for_timeout(500); await pg.evaluate("() => { window.__clips = []; }")
    await pg.evaluate(HIDE, False); await pg.evaluate(VIS); await pg.evaluate(FLUSH); await pg.wait_for_timeout(2500)
    got = [nf(c) for c in await pg.evaluate("() => window.__clips") if not c.startswith('gen.exit')]; still = await pg.evaluate("() => [!!PAUSED, !$('#exitCover').hidden]")
    check(not got and still == [True, True] and not errs, 'الغطاء فُتح والصفحة مخفية: لا يستأنف ظهورُها الدرسَ تحت الغطاء (%s، %s)' % (got[:3], still)); await b.close()
  if on9('ل'):
    # (ل) الغطاء في الفاصل بين البطاقتين المسموعتين (الفحص المستقل H2 (4أ)): لا تضيء التالية ولا تدقّ نغمة فوضى والغطاء مفتوح
    b, pg, errs = await boot(p, fast=False, settings={'muted': True})
    await pg.evaluate("""() => { const L = LDATA['m1.u1.d1']; CUR = L; show('lesson'); newStage(220, {}); window.__clipT = []; window.__sfx = []; const c0 = SFX.chaos; SFX.chaos = () => { window.__sfx.push(!$('#exitCover').hidden); c0(); };
      window.__cp = cardPick([{ id: 'ch.right', k: 'r', ok: true, hide: true }, { id: 'ch.wrong', k: 'w', ok: false, hide: true, pre: async () => { SFX.chaos(); await S('gen.chaos.thinks', { free: true }); } }], { keepOrder: true }); }""")
    await wf(pg, "() => (window.__clipT || []).some(x => x[0].startsWith('m1.u1.d1.ch.right') && x[1] === 'e')", 20000); await pg.evaluate("() => { $('#mapBtn').click(); }")
    await pg.wait_for_timeout(2000); u = await pg.evaluate("() => [window.__sfx.filter(Boolean).length, window.__cp.btns[1].classList.contains('reading')]")   # الأولى تبقى مضيئة في فاصلها الموقوف
    await pg.click('#exStay'); await wf(pg, "() => (window.__clipT || []).some(x => x[0].startsWith('m1.u1.d1.ch.wrong') && x[1] === 's')", 15000); n = await pg.evaluate("() => window.__sfx.length")
    check(u == [0, False] and n >= 1 and not errs, 'الغطاء في الفاصل بين البطاقتين: لا نغمة فوضى ولا تضيء البطاقة التالية تحته %s، والنغمة بعد «نبقى» (%d)' % (u, n)); await b.close()
  if on9('ن'):
    # (ن) مهلة العرض تقف مع الدرس (الفحص المستقل H2 (4ب)): دليل التقاطع في «حركات الجسم» (مسار «معي») باقٍ بعد غطاءٍ أطول من مهلته، فتُعاد الجملة ومعها الدليل
    b, pg, errs = await boot(p, fast=False, settings={'muted': True})
    r = await pg.evaluate("""async () => { const L = LDATA['m1.u3.d3']; CUR = L; PROG[L.id] = { ...(PROG[L.id] || {}), path: 'mat' }; show('lesson'); const w = ms => new Promise(r => setTimeout(r, ms));
      const c = L.flow.find(s => s.scene === 'bodyMoves'); SCENES.bodyMoves(JSON.parse(JSON.stringify(c))).catch(() => {});
      const guide = () => [...document.querySelectorAll('#stage svg ellipse')].some(e => e.getAttribute('rx') === '8' && e.getAttribute('ry') === '12');
      for (let i = 0; i < 300 && !guide(); i++) { const a = window.__auto; if (a && a.kind === 'material') a.ok(); await w(100); }
      const had = guide(); await w(300); $('#mapBtn').click(); await w(5500); const under = guide(); $('#exStay').click(); await w(150); return [had, under, guide()]; }""")
    check(r == [True, True, True] and not errs, 'مهلة دليل التقاطع تقف تحت غطاء الخروج: موجود قبله وتحته وبعد «نبقى» %s' % r); await b.close()
  if on9('س'):
    # (س) Enter مضغوطاً على زرّ الخريطة لا يقلّب الغطاء (الفحص المستقل H2 (8)): يُفتح مرة ويُسأل مرة
    b, pg, errs = await boot(p)
    await pg.evaluate(TRANS, 'pr.t2'); await pg.wait_for_function("() => (window.__clips || []).some(c => c.startsWith('gen.trans.pick'))", timeout=10000); await pg.wait_for_timeout(200)
    await pg.focus('#mapBtn'); await pg.evaluate("() => { window.__clips = []; window.__keyRep = 0; }")
    for _ in range(9): await pg.keyboard.down('Enter'); await pg.wait_for_timeout(30)
    await pg.keyboard.up('Enter'); await pg.wait_for_timeout(600)
    r = await pg.evaluate("() => [!$('#exitCover').hidden, (window.__clips || []).filter(c => c.startsWith('gen.exit.ask')).length, window.__keyRep || 0]")   # والمكرَّر أُسقط حقاً (Playwright يكرّر down بلا up)
    check(r[:2] == [True, 1] and r[2] >= 7 and not errs, 'Enter مضغوطاً على زرّ الخريطة: الغطاء مفتوح، وسؤاله مرة، والضغطات المكرّرة المُسقطة %s' % r); await b.close()
    # وعلى هدف المسرح، لا زرّ الخريطة والغطاء وحدهما (الفحص المستقل I2 (8)): ثلاثة tapOne متتالية على العقدة نفسها، فـ Enter المضغوط يلمسها مرة
    b, pg, errs = await boot(p)
    await pg.evaluate("""() => { const L = LDATA['m1.u4.d1']; CUR = L; show('lesson'); const svg = newStage(220, {}); window.__hits = 0; const g = el('g', {}, svg); el('rect', { x: 100, y: 60, width: 120, height: 80, fill: '#ccc' }, g);
      (async () => { for (let i = 0; i < 3; i++) { await tapOne([{ g, k: 'x', label: 'x' }], { ok: 'x' }); window.__hits++; } })(); }""")
    await pg.wait_for_timeout(300); await pg.evaluate("() => { const t = document.querySelector('#stage svg [role=button]'); if (t) t.focus(); }")
    for _ in range(9): await pg.keyboard.down('Enter'); await pg.wait_for_timeout(30)
    await pg.keyboard.up('Enter'); await pg.wait_for_timeout(400); r = await pg.evaluate("() => window.__hits")
    check(r == 1 and not errs, 'Enter مضغوطاً على هدف المسرح: %d لمسة (المطلوب 1)' % r); await b.close()
  if on9('ع'):
    # (ع) أداةٌ أدّت عملها لا تُقرأ (الفحص المستقل H2 (6)): بعد «اُفْرُدِي» يعيد «أعد الجملة» السؤال بلا اسم الزرّ المخفيّ
    b, pg, errs = await boot(p)
    r = await pg.evaluate("""async () => { const L = LDATA['m1.u4.d1']; CUR = L; show('lesson'); window.__clips = []; const w = ms => new Promise(r => setTimeout(r, ms)); const v = L.practice.challenge.find(x => x.q === 'pr.c1');
      const it = ITEM.lenPick.make(JSON.parse(JSON.stringify(v))); ITEM.lenPick.ask(it, 'practice', 0).catch(() => {});
      for (let i = 0; i < 300 && !(window.__clips || []).some(c => c.startsWith('gen.opt.straightenIt')); i++) await w(20); await w(300);
      const btn = document.querySelector('#stage .choices button[data-k="wave"]'); if (!btn) return ['no button']; btn.click(); await w(1500); window.__clips = []; replayLine(); await w(1500);
      return (window.__clips || []).map(c => c.replace(/_[mf]$/, '')); }""")
    check(bool(r) and r[0] == 'm1.u4.d1.pr.c1' and 'gen.opt.straightenIt' not in r and not errs, 'بعد «اُفْرُدِي»: «أعد الجملة» يعيد السؤال ولا يقرأ الزرّ المخفيّ %s' % r); await b.close()
  if on9('م'):
    # (م) مهلة الفانوس تقف مع الدرس (الفحص المستقل H2 (4ج)): خمولٌ 1000 م.ث، ثم إيقاف 1000، ثم 500 بعد العودة يتوهّج (بـ #fast المهلة 1500)
    b, pg, errs = await boot(p)
    r = await pg.evaluate("""async () => { const L = LDATA['m1.u1.d1']; CUR = L; show('lesson'); const w = ms => new Promise(r => setTimeout(r, ms)); armIdle(() => {});
      await w(1000); pauseLesson(); await w(1000); const under = help.classList.contains('glow'); resumeLesson(); await w(250); const early = help.classList.contains('glow'); await w(600); const on = help.classList.contains('glow'); disarmIdle(); return [under, early, on]; }""")
    check(r == [False, False, True] and not errs, 'مهلة الفانوس لا تعدّ زمن الإيقاف: لا توهّج تحته ولا قبل باقيها، ثم يتوهّج (%s)' % r); await b.close()
  if on9('ط'):
    # (ط) «نبقى» تستأنف المقطوعة لا آخر جملة (الأرقام لا تصير آخر جملة)، والاستئناف لا يَعِد بما أسقطه hush (الفحص المستقل G2 (2))
    b, pg, errs = await boot(p, fast=False, settings={'muted': True})
    await pg.evaluate("() => { const L = LDATA['m1.u4.d1']; CUR = L; show('lesson'); window.__clips = []; (async () => { await say(...lineOf('gen.glance.look'), { free: true }); await say(...lineOf(numw(3)), { num: true, free: true }); await say(...lineOf(numw(4)), { num: true, free: true }); })(); }")
    await wf(pg, "() => (window.__clips || []).some(c => c.startsWith('gen.numw.03'))", 10000); await pg.wait_for_timeout(300)
    await pg.click('#mapBtn'); await pg.wait_for_timeout(1500); await pg.evaluate("() => { window.__clips = []; }"); await pg.click('#exStay')
    await wf(pg, "() => (window.__clips || []).some(c => c.startsWith('gen.numw.04'))", 10000)
    num = [nf(c) for c in await pg.evaluate("() => window.__clips") if not c.startswith('gen.exit')]
    r2 = await pg.evaluate("""async () => { const w = ms => new Promise(r => setTimeout(r, ms)); say(...lineOf('gen.glance.look'), { free: true }); await w(300); pauseLesson(); hush(); const a = resumeLesson(); return a; }""")
    check(num[:2] == ['gen.numw.03', 'gen.numw.04'] and r2 is False and not errs, '«نبقى» وسط العدّ تعيد العدد المقطوع ثم التالي %s، وبعد hush تحت الإيقاف لا تَعِد بشيء (%s)' % (num[:3], r2)); await b.close()
  if on9('ك'):
    # (ك) اللمحة تحت الغطاء: مدّتها تقف معه، فيرى الطفل الإطار بعد «نبقى» ما بقي منها ثم يُغطّى (الفحص المستقل G2 (4): عاد الطفل والإطار مغطّى)
    b, pg, errs = await boot(p, fast=False, settings={'muted': True})
    r = await pg.evaluate("""async () => { const L = LDATA['m1.u4.d6']; CUR = L; show('lesson'); const w = ms => new Promise(r => setTimeout(r, ms)); window.__clipT = [];
      const it = ITEM.frameGlance.make({ t: 'frameGlance', n: 7 }); ITEM.frameGlance.ask(it, 'mastery', 0).catch(() => {});
      for (let i = 0; i < 400 && !(window.__clipT || []).some(x => x[0].startsWith('gen.fglance.look') && x[1] === 'e'); i++) await w(20);
      await w(350); $('#mapBtn').click(); await w(3000); const covered = () => [...document.querySelectorAll('#stage svg rect')].some(r => r.getAttribute('width') === '240' && r.getAttribute('height') === '116');
      const under = covered(); $('#exStay').click(); await w(150); const justAfter = covered(); await w(1600); return [under, justAfter, covered()]; }""")
    check(r == [False, False, True] and not errs, 'اللمحة تحت غطاء الخروج: لا يُغطّى الإطار تحته، ويُرى بعد «نبقى» ما بقي من مدّتها ثم يُغطّى %s' % r); await b.close()
  if on9('ي'):
    # (ي) خفوتٌ قطعه الغطاء أو الخروج لا يُعلَن عطلاً في نسخة الفحص (الفحص المستقل G2 (11))
    b, pg, errs = await boot(p)
    r = await pg.evaluate("""async () => { const L = LDATA['m1.u4.d1']; CUR = L; show('lesson'); const w = ms => new Promise(r => setTimeout(r, ms)); LOG.errors = [];
      const svg = newStage(250, { oasis: false, ground: 0 }), c = el('circle', { cx: 100, cy: 100, r: 30 }, svg); const a = anim(c, [{ opacity: 1 }, { opacity: 0 }], { duration: 2000 }); a.done.then(() => c.remove());
      $('#mapBtn').click(); await w(300); $('#exLeave').click(); await w(800); return (LOG.errors || []).filter(e => /خفوت/.test(JSON.stringify(e))).length; }""")
    check(r == 0 and not errs, 'خفوتٌ قطعه الخروج إلى الخريطة لا يُعلَن عطلاً (%s)' % r); await b.close()
  if on9('ف'):
    # (ف) حركة CSS أُزيل صنفها تحت الغطاء لا تُبعث (الفحص المستقل I2 (1)): نبض الهدف ووهج الفانوس، والغطاء يُفتح بالمفتاح ويُغلق باللمس («نبقى» و«الخريطة»):
    #     أول لمسة تُزيل الصنفين، والحركة الموقوفة بالكود تبقى «paused» فكانت «نبقى» تبعثها بلا صنفها
    for close in ('#exStay', '#exLeave'):
      b, pg, errs = await boot(p)
      await pg.evaluate("""() => { const L = LDATA['m1.u4.d1']; CUR = L; show('lesson'); const svg = newStage(220, {}); const g = el('g', {}, svg); el('circle', { cx: 120, cy: 110, r: 40, fill: '#ccc' }, g);
        pulse([g]); armIdle(() => {}); help.hidden = false; help.classList.add('glow'); }""")
      await pg.wait_for_timeout(300); n0 = await pg.evaluate("() => document.getAnimations().filter(a => a.playState === 'running' && window.CSSAnimation && a instanceof CSSAnimation).length")
      await pg.focus('#mapBtn'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(300); await pg.tap(close); await pg.wait_for_timeout(500)
      if close == '#exLeave': await pg.evaluate("(id) => { runLesson(id); }", 'm1.u4.d2'); await pg.wait_for_timeout(600)
      r = await pg.evaluate("""() => document.getAnimations().filter(a => a.playState === 'running' && window.CSSAnimation && a instanceof CSSAnimation).map(a => { const t = a.effect && a.effect.target;
        return [a.animationName, !!t && t.isConnected && getComputedStyle(t, a.effect.pseudoElement || null).animationName.split(',').map(x => x.trim()).includes(a.animationName)]; }).filter(x => !x[1]).map(x => x[0])""")
      check(n0 >= 2 and not r and not errs, 'الغطاء بالمفتاح ثم %s باللمس: حركات CSS قبله %d، وما يجري بلا صنفه بعده %s' % ('«نبقى»' if close == '#exStay' else '«الخريطة» ودرس آخر', n0, r)); await b.close()
    # والطريقان الأكثر وقوعاً (الفحص المستقل J2 (1)): إطفاء الشاشة وإظهارها، والمفتاح فتحاً وإغلاقاً، ثم لمسة حقيقية على المسرح: الحركة التي بقي صنفها تجري بعد العودة،
    #     ولا يجري بعد اللمسة ما أُزيل صنفه (كان الكود يوقف حركات CSS ويبعثها فتصير لا تقف بإزالة صنفها)
    for path in ('hide', 'keykey'):
      b, pg, errs = await boot(p)
      await pg.evaluate("""() => { const L = LDATA['m1.u4.d1']; CUR = L; show('lesson'); const svg = newStage(220, {}); const g = el('g', {}, svg); el('circle', { cx: 120, cy: 110, r: 40, fill: '#ccc' }, g);
        pulse([g]); armIdle(() => {}); help.hidden = false; help.classList.add('glow'); }""")
      await pg.wait_for_timeout(300); n0 = await pg.evaluate("() => document.getAnimations().filter(a => a.playState === 'running' && window.CSSAnimation && a instanceof CSSAnimation).length")
      RUN = "() => document.getAnimations().filter(a => a.playState === 'running' && window.CSSAnimation && a instanceof CSSAnimation && !(a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('.cover, .panel'))).map(a => a.animationName)"   # وما في الغطاء نفسه يتحرّك
      if path == 'hide': await pg.evaluate(HIDE, True); await pg.evaluate(VIS); await pg.wait_for_timeout(300); nu = await pg.evaluate(RUN); await pg.evaluate(HIDE, False); await pg.evaluate(VIS)
      else: await pg.focus('#mapBtn'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(300); nu = await pg.evaluate(RUN); await pg.focus('#exStay'); await pg.keyboard.press('Enter')
      await pg.wait_for_timeout(300); n1 = await pg.evaluate("() => document.getAnimations().filter(a => a.playState === 'running' && window.CSSAnimation && a instanceof CSSAnimation).length")
      await pg.tap('#stage svg circle'); await pg.wait_for_timeout(400); r = await pg.evaluate("""() => document.getAnimations().filter(a => a.playState === 'running' && window.CSSAnimation && a instanceof CSSAnimation).map(a => { const t = a.effect && a.effect.target;
        return [a.animationName, !!t && t.isConnected && getComputedStyle(t, a.effect.pseudoElement || null).animationName.split(',').map(x => x.trim()).includes(a.animationName)]; }).filter(x => !x[1]).map(x => x[0])""")
      check(n0 >= 2 and nu == [] and n1 >= 2 and not r and not errs, '%s ثم لمسة على المسرح: حركات CSS قبله %d، وتجري تحت الإيقاف خارج الغطاء %s، وبعد العودة %d، وما يجري بلا صنفه بعد اللمسة %s' % ('إطفاء الشاشة وإظهارها' if path == 'hide' else 'الغطاء بالمفتاح فتحاً وإغلاقاً', n0, nu, n1, r)); await b.close()
  if on9('ص'):
    # (ص) غطاء التبويب الآخر فوق الدرس لا يُستأنف الدرس تحته بعد ظهور الصفحة (الفحص المستقل I2 (2))، أُطفئت الشاشة قبله أو بعده
    for order in ('hide-first', 'tab-first'):
      b, pg, errs = await boot(p, fast=False, settings={'muted': True})
      await pg.evaluate("() => { const L = LDATA['m1.u4.d1']; CUR = L; show('lesson'); window.__clips = []; (async () => { await S('gen.glance.look'); await S('gen.glance.ask'); })(); }")
      await wf(pg, "() => (window.__clips || []).some(c => c.startsWith('gen.glance.look'))", 10000); await pg.wait_for_timeout(300)
      spoke = await pg.evaluate("() => (window.__clips || []).some(c => c.startsWith('gen.glance.look'))")   # والدرس تكلّم حقاً قبل الإخفاء (الفحص المستقل J2: الانتظار يمضي إلى حدّه بلا إخفاق)
      if order == 'hide-first': await pg.evaluate(HIDE, True); await pg.evaluate(VIS); await pg.evaluate("() => { showTabLost(); }")
      else: await pg.evaluate("() => { showTabLost(); }"); await pg.evaluate(HIDE, True); await pg.evaluate(VIS)
      await pg.evaluate("() => { window.__clips = []; }"); await pg.wait_for_timeout(500); await pg.evaluate(HIDE, False); await pg.evaluate(VIS); await pg.wait_for_timeout(3000)
      r = await pg.evaluate("() => [(window.__clips || []).filter(c => !c.startsWith('gen.exit')), !!PAUSED, !$('#tabCover').hidden]")
      check(spoke and r[0] == [] and r[1] is False and r[2] and not errs, 'غطاء التبويب الآخر (%s): تكلّم الدرس قبله %s، وبعد ظهور الصفحة لا جملة درس %s، ولا إيقاف معلّق %s، والغطاء ظاهر %s' % (order, spoke, r[0][:3], r[1], r[2])); await b.close()
    # ومهلة الفانوس لا تمضي تحت غطاء التبويب ولا العطل، ولا بعد الخروج ثم التبويب (الفحص المستقل J2 (3))؛ وغطاء التبويب في الورشة بلا CUR (J2 (6))
    for case in ('tab', 'crash', 'exit-tab', 'exit-crash'):
      b, pg, errs = await boot(p)
      await pg.evaluate("() => { const L = LDATA['m1.u4.d1']; CUR = L; show('lesson'); newStage(220, {}); window.__clips = []; armIdle(() => {}); }")
      if case.startswith('exit'): await pg.evaluate("() => { $('#mapBtn').click(); }"); await pg.wait_for_timeout(200)
      await pg.evaluate("(c) => { if (c.endsWith('crash')) onCrash(new Error('فحص')); else showTabLost(); window.__clips = []; }", case); await pg.wait_for_timeout(2600)
      r = await pg.evaluate("() => [(window.__clips || []).filter(c => c.startsWith('gen.hintOffer')).length, help.classList.contains('glow') && !help.hidden, !!PAUSED]")
      check(r == [0, False, False] and not errs, 'مهلة الفانوس تحت %s: «هل نفكّر معاً؟» %d مرة، وتوهّج %s، وإيقاف معلّق %s' % ({'tab': 'غطاء التبويب', 'crash': 'غطاء العطل', 'exit-tab': 'غطاء التبويب بعد الخروج', 'exit-crash': 'غطاء العطل بعد الخروج'}[case], r[0], r[1], r[2])); await b.close()
    b, pg, errs = await boot(p)
    await pg.evaluate("() => { runWorkshop(UNITS.find(u => u.id === 'm1.u4')); }"); await pg.wait_for_timeout(800)
    r = await pg.evaluate("() => { TAB_LOST = true; onTabLost(); return [CUR === null, !$('#lesson').hidden, !$('#tabCover').hidden]; }")
    check(r == [True, True, True] and not errs, 'تبويبٌ آخر والطفل في الورشة (بلا CUR): غطاء التبويب ظاهر %s' % r); await b.close()
  if on9('ق'):
    # (ق) سؤال كل غطاء يُعاد بعد ظهور الصفحة لا سؤال الخروج وحده (الفحص المستقل I2 (3)): «نكمل؟» على الخريطة، والاستراحة؛ وسط السؤال وبعد نهايته
    #     (كان الانتظار بلا معامله فيمضي إلى حدّه، فلم يُفحص «وسط السؤال» قط)
    for (name, js, key), when in [(x, w) for x in (('«نكمل؟»', "() => { showHome(); window.__clips = []; resumeAsk('m1.u4.d1'); }", 'gen.resume.ask'), ('الاستراحة', "() => { showHome(); window.__clips = []; breakScene(() => {}); }", 'gen.session.break')) for w in ('mid', 'end')]:
      b, pg, errs = await boot(p, fast=False, settings={'muted': True})
      await pg.evaluate(js); await pg.wait_for_function("([k, w]) => (window.__clipT || []).some(x => x[0].startsWith(k) && x[1] === (w === 'mid' ? 's' : 'e'))", arg=[key, when], timeout=20000)
      sp = await pg.evaluate("() => speaking"); await pg.wait_for_timeout(300 if when == 'mid' else 600)
      await pg.evaluate(HIDE, True); await pg.evaluate(VIS); await pg.wait_for_timeout(400); await pg.evaluate("() => { window.__clips = []; }")
      await pg.evaluate(HIDE, False); await pg.evaluate(VIS); await pg.wait_for_timeout(1500)
      r = [nf(c) for c in await pg.evaluate("() => window.__clips || []")]
      check(r[:1] == [key] and len([c for c in r if c == key]) == 1 and sp == (when == 'mid') and not errs, 'غطاء %s: إطفاء الشاشة %s ثم ظهورها يعيده مرة %s' % (name, 'وسط سؤاله' if when == 'mid' else 'بعد سؤاله', r[:3])); await b.close()
    # والغطاء الأعلى لا الأول في الصفحة، وبوابة الكبار فوق غطاءٍ لا يُعاد تحتها سؤاله (الفحص المستقل J2 (2))
    #     والإخفاء بعد انتهاء الكلام كله (الدرس 251: كانت جملة العطل الطويلة تُقطع فتُعاد هي، فلم يميّز الفحص الغطاء الأعلى من الأول)
    for name, js, want, covs in (('الخروج ثم العطل', "() => { const L = LDATA['m1.u4.d1']; CUR = L; show('lesson'); newStage(220, {}); $('#mapBtn').click(); setTimeout(() => onCrash(new Error('فحص')), 300); }", ['gen.crash'], ['exitCover', 'crashCover']),
                           ('بوابة الكبار فوق الاستراحة', "() => { showHome(); breakScene(() => {}); setTimeout(() => $('#moreBtn').click(), 2500); }", [], ['breakCover', 'panel'])):
      b, pg, errs = await boot(p, fast=False, settings={'muted': True})
      await pg.evaluate(js); await pg.wait_for_timeout(3000)
      try: await pg.wait_for_function("() => !speaking && !HELD", timeout=15000)
      except Exception: pass
      await pg.wait_for_timeout(300); pre = await pg.evaluate("() => [!speaking, [...document.querySelectorAll('.cover, #panel')].filter(c => !c.hidden).map(c => c.id)]")
      await pg.evaluate(HIDE, True); await pg.evaluate(VIS); await pg.wait_for_timeout(400); await pg.evaluate("() => { window.__clips = []; }")
      await pg.evaluate(HIDE, False); await pg.evaluate(VIS); await pg.wait_for_timeout(1500)
      r = [nf(c) for c in await pg.evaluate("() => window.__clips || []")]
      check(pre == [True, covs] and r[:1] == want and not errs, '%s (صامتٌ والظاهر قبل الإخفاء %s): بعد ظهور الصفحة يُعاد %s (المطلوب %s)' % (name, pre, r[:2], want)); await b.close()
  if on9('ظ'):
    # (ظ) تسلسل غطاءٍ خارج الدرس لا يمضي والصفحة مخفية («أرقامي»: التمهيد ثم الأرقام ثم المطابقة): لا جملة تحت الإخفاء، وبعد الظهور تُعاد المقطوعة ثم ما بعدها
    #     (كان hush() فعدّت الأرقام والشاشة مطفأة، ثم أُعيد التمهيد بعدها في غير موضعه)
    for cut, nxt in (('gen.digits.intro', 'gen.numw.01'), ('gen.numw.03', 'gen.numw.04')):
      b, pg, errs = await boot(p, fast=False, settings={'muted': True})
      await pg.evaluate("() => { window.__clips = []; westIntro(); }")
      await pg.wait_for_function("(k) => (window.__clips || []).some(c => c.startsWith(k))", arg=cut, timeout=30000); await pg.wait_for_timeout(150)
      await pg.evaluate(HIDE, True); await pg.evaluate(VIS); await pg.evaluate("() => { window.__clips = []; }"); await pg.wait_for_timeout(3500)
      hid = [nf(c) for c in await pg.evaluate("() => window.__clips")]
      await pg.evaluate("() => { window.__clips = []; }"); await pg.evaluate(HIDE, False); await pg.evaluate(VIS)
      try: await pg.wait_for_function("(k) => (window.__clips || []).some(c => c.startsWith(k))", arg=nxt, timeout=30000)
      except Exception: pass
      vis = [nf(c) for c in await pg.evaluate("() => window.__clips")]
      check(hid == [] and vis[:2] == [cut, nxt] and not errs, '«أرقامي» والصفحة مخفية وسط «%s»: تحت الإخفاء %s، وبعد الظهور %s (المطلوب %s ثم %s)' % (cut, hid[:4], vis[:3], cut, nxt)); await b.close()
  if on9('غ'):
    # (غ) حارس التشغيل في نسخة الفحص (الفحص المستقل J2 (8): صيغ قاعدة lint تُحصى ولا تُغلق): نغمةٌ بعد مهلةٍ بدأت في شاشةٍ تُركت، وجملةٌ لغير الغطاء الظاهر،
    #     ونغمةٌ والصفحة مخفية تُعلَن عطلاً يراه السائق في كل تشغيل؛ والمهلة في الشاشة نفسها لا تُعلَن
    b, pg, errs = await boot(p)
    r = await pg.evaluate("""async (hide) => { const w = ms => new Promise(r => setTimeout(r, ms)); const since = a => LOG.errors.slice(a).map(e => e.msg.split(':')[0]); const o = []; let a;
      CUR = LDATA['m1.u1.d1']; show('lesson'); a = LOG.errors.length; psleep(300).then(() => SFX.soft()); showHome(); await w(500); o.push(since(a));
      a = LOG.errors.length; psleep(300).then(() => SFX.soft()); await w(500); o.push(since(a));
      a = LOG.errors.length; cover('tabCover', '<p>x</p>'); await say('compass', 'gen.glance.look', 'x', { free: true }); $('#tabCover').hidden = true; o.push(since(a));
      a = LOG.errors.length; eval(hide)(true); tone([[440, .05]]); eval(hide)(false); o.push(since(a));
      a = LOG.errors.length; eval(hide)(true); speakNow('compass', 'gen.glance.look', 'x', { free: true }).catch(() => {}); hush(); eval(hide)(false); o.push(since(a)); return o; }""", HIDE)
    want = [['نغمةٌ بعد مهلةٍ من شاشةٍ تُركت'], [], ['جملةٌ لغير الغطاء الظاهر (tabCover)'], ['نغمةٌ والصفحة مخفية'], ['جملةٌ تبدأ والصفحة مخفية']]
    check(r == want and not errs, 'حارس التشغيل: %s (المطلوب %s)' % (r, want)); await b.close()
    b, pg, errs = await boot(p, fast=False, settings={'muted': True})
    await pg.evaluate("() => { const L = LDATA['m1.u4.d1']; CUR = L; show('lesson'); newStage(220, {}); window.__clips = []; }")
    await pg.evaluate(HIDE, True); await pg.evaluate(VIS); await pg.evaluate("() => { $('#mapBtn').click(); }"); await pg.wait_for_timeout(1200); hid = await pg.evaluate("() => (window.__clips || []).slice()")
    await pg.evaluate(HIDE, False); await pg.evaluate(VIS); await pg.wait_for_timeout(1200); vis = [nf(c) for c in await pg.evaluate("() => window.__clips || []")]
    check(hid == [] and vis.count('gen.exit.ask') == 1 and not errs, 'غطاء الخروج يُفتح والصفحة مخفية: تحت الإخفاء %s، وبعد الظهور %s' % (hid, vis[:3])); await b.close()
  if on9('ض'):
    # (ض) ما يُعاد بعد الظهور ما يُسأل عنه الآن (الفحص المستقل J2 (7)): الصيد بصورةٍ من الكاميرا لا يعيد تعليمته بعدها (والملف وصل والصفحة مخفية)،
    #     ومطابقة «أرقامي» يُعاد فيها الرقم المطلوب لا تمهيد اللعبة
    import base64, tempfile
    png = os.path.join(tempfile.mkdtemp(), 'hunt.png'); open(png, 'wb').write(base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='))
    b, pg, errs = await boot(p, fast=False, settings={'muted': True})
    k = await pg.evaluate("async () => { HUNT.forEach(([k, l]) => { PROG[l] = Object.assign(PROG[l] || {}, { done: true }); }); await openGallery(); const b = document.querySelector('#huntGrid .bin'); window.__clips = []; b.click(); return b.dataset.hunt; }")
    await pg.wait_for_function("(k) => (window.__clips || []).some(c => c.startsWith('gen.hunt.' + k))", arg=k, timeout=10000); await pg.wait_for_timeout(200)
    await pg.evaluate(HIDE, True); await pg.evaluate(VIS); await pg.set_input_files('#huntIn', png); await pg.wait_for_timeout(600); await pg.evaluate("() => { window.__clips = []; }")
    await pg.evaluate(HIDE, False); await pg.evaluate(VIS)
    try: await pg.wait_for_function("() => (window.__clips || []).some(c => c.startsWith('gen.hunt.saved'))", timeout=15000)
    except Exception: pass
    r = [nf(c) for c in await pg.evaluate("() => window.__clips || []")]
    check(('gen.hunt.saved' in r and ('gen.hunt.' + k) not in r[:r.index('gen.hunt.saved')]) and not errs, 'الصيد: صورةٌ وصلت والصفحة مخفية، فبعد الظهور %s (لا تُعاد التعليمة قبل «صِدْتَهُ»)' % r[:3]); await b.close()
    b, pg, errs = await boot(p, fast=False, settings={'muted': True})
    await pg.evaluate("() => { window.__clips = []; westIntro(); }")
    await pg.wait_for_function("() => { const c = window.__clips || [], i = c.findIndex(x => x.startsWith('gen.digits.match')); return i >= 0 && c.slice(i + 1).some(x => x.startsWith('gen.numw')); }", timeout=60000)
    num = await pg.evaluate("() => { const c = window.__clips, i = c.findIndex(x => x.startsWith('gen.digits.match')); return c.slice(i + 1).find(x => x.startsWith('gen.numw')); }")
    await pg.wait_for_function("(n) => (window.__clipT || []).some(x => x[0] === n && x[1] === 'e')", arg=num, timeout=10000)
    # والكلام انتهى حقاً قبل الإخفاء: بعد نهاية الجملة يبقى الطابور يتكلّم في فاصله، فكان الإخفاء يقطعه وتُعاد المقطوعة لا سؤال الغطاء (الدرس 251)
    try: await pg.wait_for_function("() => !speaking && !HELD", timeout=10000)
    except Exception: pass
    await pg.wait_for_timeout(200); quiet = await pg.evaluate("() => !speaking")
    await pg.evaluate(HIDE, True); await pg.evaluate(VIS); await pg.wait_for_timeout(300); await pg.evaluate("() => { window.__clips = []; }")
    await pg.evaluate(HIDE, False); await pg.evaluate(VIS); await pg.wait_for_timeout(1500)
    r = await pg.evaluate("() => window.__clips || []")
    check(quiet and r[:1] == [num] and not errs, '«أرقامي» في المطابقة بعد انتهاء الرقم (صامتٌ قبل الإخفاء %s): بعد الظهور يُعاد %s (المطلوب %s)' % (quiet, r[:2], num)); await b.close()
  if on9('ر'):
    # (ر) ما يُسمع بعد مهلةٍ لا يُدقّ على الخريطة بعد الخروج (الفحص المستقل I2 (4): نغمة سباق العربتين)، ويُدقّ بعد «نبقى» مرة؛ والغطاء بعد بدء السباق بـ 300 م.ث، أي وسط مهلة النغمة (900)
    for close in ('#exLeave', '#exStay'):
      b, pg, errs = await boot(p, fast=False, settings={'muted': True})
      r = await pg.evaluate("""async (close) => { const L = LDATA['m1.u1.d1']; CUR = L; show('lesson'); const w = ms => new Promise(r => setTimeout(r, ms)); window.__soft = []; const s0 = SFX.soft; SFX.soft = () => { window.__soft.push(!$('#home').hidden); s0(); };
        SCENES.cartsRace(JSON.parse(JSON.stringify(L.flow[0]))).catch(() => {}); const race = () => document.getAnimations().some(a => a.effect && a.effect.getTiming().duration === 3200);
        for (let i = 0; i < 600 && !(window.__auto && window.__auto.kind === 'tap'); i++) await w(50); if (window.__auto) window.__auto.ok();
        for (let i = 0; i < 1500 && !race(); i++) await w(10); const on = race(); await w(300); $('#mapBtn').click(); await w(300); $(close).click(); await w(2500); return [on, window.__soft]; }""", close)
      check(r[0] and (r[1] == [] if close == '#exLeave' else r[1] == [False]) and not errs, 'نغمة سباق العربتين بعد غطاءٍ في المهلة ثم %s: %s' % ('«الخريطة»' if close == '#exLeave' else '«نبقى»', r)); await b.close()
  if on9('ش'):
    # (ش) القصاصات تقف مع الدرس (الفحص المستقل I2 (5)): تحت الغطاء أطول من مدّتها تبقى، وبعد العودة تسقط ثم تُزال
    b, pg, errs = await boot(p)
    r = await pg.evaluate("""async () => { CUR = LDATA['m1.u1.d1']; show('lesson'); const w = ms => new Promise(r => setTimeout(r, ms)); confetti(); await w(300); const n0 = $('#confetti').children.length;
      pauseLesson(); await w(2600); const under = $('#confetti').children.length; resumeLesson(); await w(300); const after = $('#confetti').children.length; await w(2600); return [n0, under, after, $('#confetti').children.length]; }""")
    check(r[0] > 0 and r[1] == r[0] and r[2] > 0 and r[3] == 0 and not errs, 'القصاصات تحت الإيقاف تبقى ثم تسقط وتُزال بعده %s' % r); await b.close()
    # وبالغطاء الحقيقي (الفحص المستقل J2 (4)): لا تُرى فوقه، وبعد «نبقى» تسقط، وبعد «الخريطة» لا قصاصة على الخريطة
    for close in ('#exStay', '#exLeave'):
      b, pg, errs = await boot(p)
      r = await pg.evaluate("""async (close) => { CUR = LDATA['m1.u1.d1']; show('lesson'); const w = ms => new Promise(r => setTimeout(r, ms)); confetti(); await w(300); $('#mapBtn').click(); await w(500);
        const box = $('#confetti'), under = [box.children.length, getComputedStyle(box).visibility]; $(close).click(); await w(200); const after = [box.children.length, getComputedStyle(box).visibility, !$('#home').hidden];
        await w(2600); return [under, after, box.children.length]; }""", close)
      ok = r[0][0] > 0 and r[0][1] == 'hidden' and r[1][1] == 'visible' and r[2] == 0 and ((r[1][0] > 0 and not r[1][2]) if close == '#exStay' else (r[1][0] == 0 and r[1][2]))
      check(ok and not errs, 'القصاصات وغطاء الخروج ثم %s: تحته [عددها، ظهورها] %s، وبعده %s، وبعد 2.6 ث %d' % ('«نبقى»' if close == '#exStay' else '«الخريطة»', r[0], r[1], r[2])); await b.close()
  if on9('ت'):
    # (ت) ثلاثة خيارات عددية وإن كثرت أعداد «معي» (الفحص المستقل I2 (7)): كانت nearNums(0) بأعدادٍ من واحد إلى ستة خياراً واحداً؛ وإن لم يبقَ في المدى غيرها قُبل منها (nearNums(2, 3))
    b, pg, errs = await boot(p)
    r = await pg.evaluate("""() => { const out = []; const T = (av, f) => { MAT_AVOID = new Set(av); out.push(f().length); };
      T([1, 2, 3, 4, 5, 6], () => nearNums(0)); T([1, 2, 3, 4, 5, 6], () => nearNums(2)); T([1, 2, 3, 4, 5, 6], () => optsWith(2, [10])); T([0, 1, 3], () => nearNums(2, 3)); T([5, 6, 7, 8, 9], () => nearNums(8)); T([5, 6, 7, 8, 9], () => nearNums(10));
      T([1, 6, 7, 9, 16], () => nearNums(10)); T([11, 12, 13, 14, 15], () => teenOpts(13)); MAT_AVOID = null; return out; }""")
    check(all(x >= 3 for x in r) and not errs, 'خيارات عددية ثلاثة مع أعداد «معي» كثيرة %s' % r); await b.close()
    # وفي مواضع النداء لا بعدها ترشيحٌ يُنقصها (الفحص المستقل J2 (5)): اللمحة في «مراجعة اليوم» بـ n=2 في بذورٍ عدّة، ومولّدٌ بحدٍّ أدنى
    cnt = []
    for seed in range(1, 9):
      b, pg, errs = await boot(p, seed=seed)
      await pg.evaluate("() => { CUR = null; show('lesson'); runItem({ t: 'glance', n: 2 }, 'review').catch(() => {}); }")
      try: await pg.wait_for_function("() => document.querySelectorAll('#stage .choices.nums .pick.num').length > 0", timeout=8000)
      except Exception: pass
      cnt.append(await pg.evaluate("() => document.querySelectorAll('#stage .choices.nums .pick.num').length")); await b.close()
    b, pg, errs = await boot(p)
    lo = await pg.evaluate("() => { const o = []; for (let i = 0; i < 40; i++) for (const n of [1, 2]) { const x = nearNums(n, 6, 1); o.push(x.length === 3 && x.every(v => v >= 1) && x.includes(n)); } return o.every(Boolean); }")
    # وحارس نسخة الفحص: numberPick بأقلّ من ثلاثة خيارات يُعلَن عطلاً يراه السائق في كل موضع (الفحص المستقل J2 (5))
    g = await pg.evaluate("() => { const a = LOG.errors.length; const np = numberPick([1, 2], 1); np.box.remove(); return LOG.errors.slice(a).map(e => e.msg.split(':')[0]); }")
    check(all(c >= 3 for c in cnt) and lo and g == ['numberPick بأقلّ من ثلاثة خيارات'] and not errs, 'اللمحة في «مراجعة اليوم» بـ n=2: الخيارات %s، وnearNums بحدٍّ أدنى %s، وحارس الخيارين %s' % (cnt, lo, g)); await b.close()
  if on9('ث'):
    # (ث) حركةٌ تبدأ تحت الإيقاف تبدأ من أوّلها بعد العودة (الفحص المستقل I2 (8): ساعة الدرس بلا الإيقاف الجاري أعطت t سالباً)
    b, pg, errs = await boot(p, fast=False, settings={'muted': True})
    r = await pg.evaluate("""async () => { CUR = LDATA['m1.u4.d1']; show('lesson'); const w = ms => new Promise(r => setTimeout(r, ms)); let v = null, lo = 9;
      pauseLesson(); await w(300); const p = tween(800, t => { v = t; lo = Math.min(lo, t); }); await w(500); const under = v; resumeLesson(); await w(250); const after = v; await p; return [under, after, lo]; }""")
    check(r[0] is None and r[1] is not None and 0.12 <= r[1] <= 0.5 and r[2] >= 0 and not errs, 'حركةٌ بدأت تحت الإيقاف: لا إطار تحته، وبعد العودة بـ 250 م.ث من أوّلها %s' % r); await b.close()
  if on9('خ'):
    # (خ) مهلة الفانوس تُلغى بإنهاء الأداة (disarmIdle) فلا توهّج ولا «هل نفكّر معاً؟» بعدها (الفحص المستقل I2 (8))
    b, pg, errs = await boot(p)
    r = await pg.evaluate("""async () => { CUR = LDATA['m1.u1.d1']; show('lesson'); const w = ms => new Promise(r => setTimeout(r, ms)); window.__clips = []; armIdle(() => {}); await w(500); disarmIdle(); await w(2200);
      return [help.classList.contains('glow'), (window.__clips || []).filter(c => c.startsWith('gen.hintOffer')).length]; }""")
    check(r == [False, 0] and not errs, 'إنهاء الأداة يلغي مهلة الفانوس %s' % r); await b.close()
  if on9('ذ'):
    # (ذ) أعداد «معي» تُمحى بالخروج إلى شاشة أخرى (show) لا بخطوة الدرس التالية وحدها (الفحص المستقل I2 (8))
    b, pg, errs = await boot(p)
    r = await pg.evaluate("""() => { const o = []; MAT_AVOID = new Set([4, 14]); show('home'); o.push(MAT_AVOID); MAT_AVOID = new Set([3]); show('lesson'); o.push(MAT_AVOID); return o; }""")
    check(r == [None, None] and not errs, 'show يمحو أعداد «معي» %s' % r); await b.close()

SUB9 = set(filter(None, os.environ.get('SUB9', '').split(',')))   # SUB9=ز,ح: أقسام التاسع بعينها (لطفرات mutants_run، أسرع)
def on9(k): return not SUB9 or k in SUB9
SECTION = os.environ.get('SECTION', '')   # SECTION=8: القسم الثامن وحده (لطفرات mutants_run)، وSECTION=9: التاسع
async def main():
  async with async_playwright() as p:
    if SECTION == '8': await section8(p); print('FAILS:', len(FAILS)); return
    if SECTION == '9': await section9(p); print('FAILS:', len(FAILS)); return
    await exit_then_replay(p, 'm1.u1.d1', lambda s: s['scene'].endswith(':chaos') and s['kind'] == 'card', 'm1.u1.d2', 'الخروج عند البطاقتين')
    await exit_then_replay(p, 'm1.u2.d1', lambda s: s['mode'] == 'mastery' and s['itype'] == 'reason' and s['kind'] == 'card', 'm1.u1.d2', 'الخروج عند التعليل')
    # 3) أثناء جملة تُقال، بالزمن الحقيقي (صامتاً بزمن القراءة)
    b, pg, errs = await boot(p, fast=False, settings={'muted': True})
    await pg.evaluate("(id) => { runLesson(id); }", 'm1.u1.d3')
    for _ in range(100):
      if await pg.evaluate("() => (window.__clips||[]).some(c => /bag.ask/.test(c))"): break
      await pg.wait_for_timeout(50)
    await pg.wait_for_timeout(500); busy = await pg.evaluate("() => speaking")
    await pg.evaluate("() => { window.__clips = []; }"); await pg.click('#replay'); await pg.wait_for_timeout(400)
    clips = await pg.evaluate("() => window.__clips")
    check(busy and any('bag.ask' in c for c in clips), '«أعد الجملة» أثناء الجملة يعيدها من أولها %s' % clips)
    await b.close()
    # 4) أثناء قراءة البطاقتين، بالترتيبين
    for seed in (7, 8):
      b, pg, errs = await boot(p, seed=seed)
      await pg.evaluate("(id) => { runLesson(id); }", 'm1.u1.d1')
      await drive_until(pg, lambda s: s['scene'].endswith(':chaos') and s['kind'] == 'card'); await pg.wait_for_timeout(500)
      bad = []
      for d in (0, 10, 20, 35, 50, 70, 90):
        r = await pg.evaluate(CARDJS, d); a = [c.replace('m1.u1.d1.', '').replace('gen.chaos.', '') for c in r['after']]
        ok = 'ch.right' in a and 'ch.wrong' in a and a.index('thinks') == a.index('ch.wrong') - 1 if 'thinks' in a and 'ch.wrong' in a else False
        if not ok or not r['hide'] and 'ch.wrong' in a[-1:]: bad.append((d, a))
      check(not bad and not errs, 'البذرة %d: كل إعادة بعد قطع القراءة تُسمع البطاقتين، والخاطئة بتمهيدها %s' % (seed, bad[:2]))
      await b.close()
    # 5) بند التعليل: السؤال ثم الأسباب
    b, pg, errs = await boot(p)
    await pg.evaluate("(id) => { runLesson(id); }", 'm1.u2.d1')
    await drive_until(pg, lambda s: s['mode'] == 'mastery' and s['itype'] == 'reason' and s['kind'] == 'card'); await pg.wait_for_timeout(500)
    q = await pg.evaluate("() => window.__item && window.__item.q")
    await pg.evaluate("() => { window.__clips = []; }"); await pg.click('#replay'); await pg.wait_for_timeout(800)
    clips = await pg.evaluate("() => window.__clips")
    check(bool(clips) and q and q in clips[0] and len(clips) >= 4, '«أعد الجملة» عند التعليل يعيد السؤال ثم الأسباب %s' % clips[:4])
    await b.close()
    # 6) بعد قراءة الخيارات
    OPT = lambda c: '.bin.' in c or '.opt.' in c or '.numw' in c or '.op.' in c or 'gen.pos.' in c or 'gen.ord.' in c   # S1-U3: كلمات الموضع والأعداد الترتيبية خيارات مسموعة
    WORDS = r"""() => Object.keys(GL).filter(k => /^gen\.(numw2?|opt|bin|op|pos|ord)\./.test(k)).map(k => G(lineOf(k)[2]).trim())"""   # نصوص كل خيار وكل كلمة عدد كما تُكتب في الفقاعة
    for lid, stop, label, opts in [('m1.u1.d6', lambda s: s['mode'] == 'test' and s['kind'] == 'sort', 'سلال الاختبار', True),
                             ('m1.u2.d6', lambda s: s['mode'] == 'test' and s['kind'] == 'sort', 'سلال الاختبار (المجسّمات)', True),
                             ('m1.u2.d5', lambda s: s['kind'] == 'buildTo', '«أضف/أبعد» في البناء', True),
                             ('m1.u1.d6', lambda s: s['kind'] == 'pick' and s['itype'] == 'yesno', 'خيارا «نعم/لا»', True),
                             ('m1.u2.d6', lambda s: s['kind'] == 'pick' and s['itype'] == 'property', 'خيارات الخاصية', True),
                             ('m1.u2.d5', lambda s: s['kind'] == 'sentence', 'بطاقتا الجملة العددية', True),
                             ('m1.u2.d5', lambda s: s['mode'] == 'mastery' and s['itype'] == 'fact' and s['kind'] == 'num', 'أعداد الحقيقة', True),
                             ('m1.u2.d4', lambda s: s['mode'] == 'mastery' and s['itype'] == 'split' and s['kind'] == 'num', 'أعداد التفكيك', True),
                             ('m1.u1.d4', lambda s: s['mode'] == 'mastery' and s['kind'] == 'produce', 'ضعي… وعددها', False),
                             ('m1.u1.d5', lambda s: s['mode'] == 'mastery' and s['itype'] == 'digitPick' and s['kind'] == 'tap', 'المسي بطاقة العدد…', False),
                             ('m1.u3.d1', lambda s: s['mode'] == 'mastery' and s['itype'] == 'where' and s['kind'] == 'pick', 'كلمات الموضع', True),
                             ('m1.u3.d2', lambda s: s['itype'] == 'linePick' and s['kind'] == 'pick', 'العربة الأولى… العاشرة', True),
                             ('m1.u3.d3', lambda s: s['mode'] == 'mastery' and s['itype'] == 'lrPick' and s['kind'] == 'pick', 'على يمينه أم على يساره', True),
                             ('m1.u3.d5', lambda s: s['mode'] == 'mastery' and s['itype'] == 'roadPick' and s['kind'] == 'card', 'العدد قبل وبعد (بطاقتان مسموعتان)', True)]:
      b, pg, errs = await boot(p)
      await pg.evaluate("(id) => { runLesson(id); }", lid)
      st = await drive_until(pg, stop); await pg.wait_for_timeout(900)
      before = await pg.evaluate("() => (window.__clips || []).slice(-6)")
      read = any(OPT(c) for c in before)
      await pg.evaluate("() => { window.__clips = []; }"); await pg.click('#replay'); await pg.wait_for_timeout(900)
      clips = await pg.evaluate("() => window.__clips"); say = await pg.evaluate("() => document.querySelector('#say').textContent")
      words = set(await pg.evaluate(WORDS))
      q0 = next((i for i, c in enumerate(clips) if 'fact.ask' in c), 0) if 'fact' in label or 'الحقيقة' in label else 0   # سؤال الحقيقة يبدأ بجملتها العددية، فالخيارات بعد «كم يساوي؟»
      check(stop(st) and (read or not opts) and clips and (q0 > 0 or not OPT(clips[0])) and (any(OPT(c) for c in clips[q0 + 1:]) or not opts) and say.strip() not in words and not errs,
            '%s (%s): الخيارات قُرئت %s، و«أعد الجملة» يعيد السؤال ثم الخيارات %s، والفقاعة «%s»' % (label, lid, read, clips[:5], say[:40]))
      await b.close()
    # 7) الخروج من كل نوع انتظار
    for lid, kind in [('m1.u1.d6', 'sort'), ('m1.u2.d5', 'buildTo'), ('m1.u2.d6', 'pick'), ('m1.u1.d2', 'tapAll'), ('m1.u1.d2', 'house'),
                      ('m1.u3.d1', 'place'), ('m1.u3.d2', 'paint'), ('m1.u3.d3', 'prog'), ('m1.u3.d5', 'road'), ('m1.u3.d4', 'tap')]:   # وانتظارات S1-U3
      await exit_then_replay(p, lid, lambda s, k=kind: s['kind'] == k and not s['scene'].endswith(':bag'), 'm1.u2.d1' if lid.startswith('m1.u1') else 'm1.u1.d3', 'الخروج عند ' + kind)
    await section8(p)
    await section9(p)
  print('FAILS:', len(FAILS))
asyncio.run(main())
sys.exit(1 if FAILS else 0)   # إخفاق ⇒ رمز خروج 1 (الفحص المستقل الرابع، ج8)
