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
# 7) الخروج من كل نوع انتظار (فرز، وبناء، واختيار، ولمس الكل، والبيت) ثم «أعد الجملة» في درس آخر: لا شيء من الأول، ولا عطل (الدرس 105).
import asyncio, os, sys
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
FILE = os.environ.get('FILE', os.path.join(HERE, '..', 'dist', 'واحة_الرياضيات.dev.html'))
FAILS = []
def check(ok, what):
  print(('ok   ' if ok else 'FAIL ') + what); (None if ok else FAILS.append(what))

async def boot(p, seed=7, fast=True, settings=None):
  b = await p.chromium.launch(); ctx = await b.new_context(**p.devices['Pixel 5']); pg = await ctx.new_page(); errs = []
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

async def main():
  async with async_playwright() as p:
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
    OPT = lambda c: '.bin.' in c or '.opt.' in c or '.numw' in c or '.op.' in c
    WORDS = """() => Object.keys(GL).filter(k => /^gen\.(numw2?|opt|bin|op)\./.test(k)).map(k => G(lineOf(k)[2]).trim())"""   # نصوص كل خيار وكل كلمة عدد كما تُكتب في الفقاعة
    for lid, stop, label, opts in [('m1.u1.d6', lambda s: s['mode'] == 'test' and s['kind'] == 'sort', 'سلال الاختبار', True),
                             ('m1.u2.d6', lambda s: s['mode'] == 'test' and s['kind'] == 'sort', 'سلال الاختبار (المجسّمات)', True),
                             ('m1.u2.d5', lambda s: s['kind'] == 'buildTo', '«أضف/أبعد» في البناء', True),
                             ('m1.u1.d6', lambda s: s['kind'] == 'pick' and s['itype'] == 'yesno', 'خيارا «نعم/لا»', True),
                             ('m1.u2.d6', lambda s: s['kind'] == 'pick' and s['itype'] == 'property', 'خيارات الخاصية', True),
                             ('m1.u2.d5', lambda s: s['kind'] == 'sentence', 'بطاقتا الجملة العددية', True),
                             ('m1.u2.d5', lambda s: s['mode'] == 'mastery' and s['itype'] == 'fact' and s['kind'] == 'num', 'أعداد الحقيقة', True),
                             ('m1.u2.d4', lambda s: s['mode'] == 'mastery' and s['itype'] == 'split' and s['kind'] == 'num', 'أعداد التفكيك', True),
                             ('m1.u1.d4', lambda s: s['mode'] == 'mastery' and s['kind'] == 'produce', 'ضعي… وعددها', False),
                             ('m1.u1.d5', lambda s: s['mode'] == 'mastery' and s['itype'] == 'digitPick' and s['kind'] == 'tap', 'المسي بطاقة العدد…', False)]:
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
    for lid, kind in [('m1.u1.d6', 'sort'), ('m1.u2.d5', 'buildTo'), ('m1.u2.d6', 'pick'), ('m1.u1.d2', 'tapAll'), ('m1.u1.d2', 'house')]:
      await exit_then_replay(p, lid, lambda s, k=kind: s['kind'] == k and not s['scene'].endswith(':bag'), 'm1.u2.d1' if lid.startswith('m1.u1') else 'm1.u1.d3', 'الخروج عند ' + kind)
  print('FAILS:', len(FAILS))
asyncio.run(main())
sys.exit(1 if FAILS else 0)   # إخفاق ⇒ رمز خروج 1 (الفحص المستقل الرابع، ج8)
