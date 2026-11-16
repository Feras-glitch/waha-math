# القراءة الآلية (D270، قرار فراس، 16 نوفمبر 2026):
#   1) الصورة قبل الصوت: مقدّمةٌ مؤجّلة (introOnStage) لا تُقرأ قبل أن يُرسم المشهد، وبين اللوح الجديد وأول جملة وقفة استقرار
#   2) «تخطَّ»: ظاهرٌ أثناء الكلام، ولمسه يُنهي الجملة وما بعدها حتى انتظار فعل الطفل، والنصّ مكتوب في الفقاعة؛ ثم يعود الكلام عادياً بعد AUTO
#   3) تلوين الكلمة المقروءة: الجملة كلمات (span.w) ونصّ الفقاعة كما هو، والكلمة الملوّنة تتقدّم، ولا يبقى تلوين بعد انتهاء الجملة
#   4) صفحة الكبار: أوضاع القراءة الثلاثة و«أسرع» تُحفظ للجهاز كله
# python3 test/reading_run.py   (FILE=نسخة فحص أخرى)
import asyncio, os, sys
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
FILE = os.environ.get('FILE', os.path.join(HERE, '..', 'dist', 'واحة_الرياضيات.dev.html'))
FAILS = []
def check(ok, what): print(('ok   ' if ok else 'FAIL ') + what); (None if ok else FAILS.append(what))

PREP = """() => { document.querySelectorAll('[id$=Cover]').forEach(c => c.hidden = true); SET.muted = true; hush(); FLOW++; show('lesson');
  window.__ev = []; const sn = speakNow; speakNow = function (w, id, t, o) { window.__ev.push(['say', id, performance.now(), !!document.querySelector('#stage svg [data-mark]')]); return sn.apply(this, arguments); }; }"""

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); page = await b.new_page(viewport={'width': 412, 'height': 842})
    errs = []; page.on('pageerror', lambda e: errs.append(str(e)))
    await page.goto('file://' + FILE); await page.wait_for_timeout(800)
    # 1) الصورة قبل الصوت
    await page.evaluate(PREP)
    r = await page.evaluate("""async () => { introOnStage('gen.practice.intro'); await new Promise(z => setTimeout(z, 200));
      const before = window.__ev.length; const svg = newStage(250, {}); const t0 = performance.now(); el('rect', { 'data-mark': 1, width: 10, height: 10 }, svg);
      await new Promise(z => setTimeout(z, 900)); const e = window.__ev.find(x => x[1] === 'gen.practice.intro'); return { before, said: !!e, drawn: e && e[3], wait: e && Math.round(e[2] - t0) }; }""")
    check(r['before'] == 0, f'المقدّمة المؤجّلة لا تُقرأ قبل المشهد: {r}')
    check(r['said'] and r['drawn'], f'المقدّمة تُقرأ والمشهد مرسوم: {r}')
    check(r['wait'] is not None and r['wait'] >= 250, f'وقفة استقرار قبل أول جملة بعد اللوح: {r}')
    # 2) «تخطَّ»
    await page.evaluate(PREP)
    await page.evaluate("() => { newStage(250, {}); window.__done = null; S(['gen.practice.intro', 'gen.ms.intro', 'gen.test.intro']).then(() => window.__done = performance.now()); }")
    await page.wait_for_timeout(700)
    on = await page.evaluate("() => $('#skipBtn').classList.contains('on') && getComputedStyle($('#skipBtn')).visibility === 'visible'")
    check(on, '«تخطَّ» ظاهر أثناء الكلام')
    t = await page.evaluate('performance.now()'); await page.click('#skipBtn'); await page.wait_for_timeout(400)
    r = await page.evaluate("() => ({ done: window.__done, say: $('#say').textContent, on: $('#skipBtn').classList.contains('on') && $('#skipBtn').dataset.m === 'skip', back: $('#skipBtn').dataset.m, skips: progOf(CUR ? CUR.id : 'x').skips || 0 })")
    check(r['done'] is not None and r['done'] - t < 400, f'«تخطَّ» يُنهي الجملة وما بعدها فوراً: {r}')
    check('أَسْئِلَةُ الوَاحَةِ' in r['say'] or 'الوَاحَةِ' in r['say'], f'آخر جملة مكتوبة في الفقاعة: {r["say"][:40]}')
    check(not r['on'] and r['back'] == 'back', f'«تخطَّ» يصير «السابق» بعد التخطّي، فيراجع الطفل ما تخطّاه: {r["back"]}')
    await page.evaluate("() => { AUTO({ kind: 'test' }); window.__d2 = null; S('gen.practice.intro').then(() => window.__d2 = performance.now()); }")
    await page.wait_for_timeout(600)
    r = await page.evaluate("() => ({ d2: window.__d2, on: $('#skipBtn').classList.contains('on') })")
    check(r['d2'] is None and r['on'], f'بعد انتظار فعل الطفل (AUTO) يعود الكلام عادياً: {r}')
    await page.evaluate("() => { hush(); AUTO_CLEAR(); }")
    # 3) تلوين الكلمة المقروءة
    await page.evaluate(PREP)
    await page.evaluate("() => { newStage(250, {}); S('gen.test.intro'); }")
    await page.wait_for_timeout(700)
    a = await page.evaluate("() => ({ n: $('#say').querySelectorAll('.w').length, on: [...$('#say').querySelectorAll('.w')].findIndex(w => w.classList.contains('on')), txt: $('#say').textContent })")
    await page.wait_for_timeout(1500)
    b2 = await page.evaluate("() => [...$('#say').querySelectorAll('.w')].findIndex(w => w.classList.contains('on'))")
    full = await page.evaluate("() => G(lineOf('gen.test.intro')[2])")
    check(a['n'] > 3 and a['txt'] == full, f'الجملة كلماتٌ ونصّها كما هو: {a["n"]} كلمة')
    check(a['on'] >= 0 and b2 > a['on'], f'الكلمة الملوّنة تتقدّم: {a["on"]} ← {b2}')
    await page.wait_for_timeout(4000)
    c = await page.evaluate("() => $('#say').querySelectorAll('.w.on').length")
    check(c == 0, f'لا يبقى تلوين بعد انتهاء الجملة: {c}')
    # 5) «السابق» (D271): بعد جملتين يصير الزرّ «السابق»، ولمسه يعيد الجملة التي قبل الأخيرة، ثم لا رجوع قبل الأولى
    await page.evaluate(PREP)
    await page.evaluate("() => { newStage(250, {}); window.__dd = null; S(['gen.practice.intro', 'gen.ms.intro']).then(() => window.__dd = 1); }")
    for _ in range(40):
      if await page.evaluate('window.__dd'): break
      await page.wait_for_timeout(250)
    await page.wait_for_timeout(300)
    m = await page.evaluate("() => [$('#skipBtn').dataset.m, $('#skipBtn').classList.contains('on'), $('#skipBtn').getAttribute('aria-label')]")
    check(m[0] == 'back' and m[1], f'بعد جملتين يظهر «السابق»: {m}')
    await page.click('#skipBtn'); await page.wait_for_timeout(300)
    r = await page.evaluate("() => ({ say: $('#say').textContent, want: G(lineOf('gen.practice.intro')[2]) })")
    check(r['say'] == r['want'], f'«السابق» يعيد الجملة التي قبل الأخيرة: {r["say"][:30]}')
    for _ in range(40):
      if not await page.evaluate('speechBusy()'): break
      await page.wait_for_timeout(250)
    await page.wait_for_timeout(200)
    m = await page.evaluate("() => $('#skipBtn').classList.contains('on')")
    check(not m, f'لا «سابق» قبل أول جملة في الشاشة: {m}')
    await page.evaluate("() => { newStage(250, {}); }"); await page.wait_for_timeout(100)
    m = await page.evaluate("() => $('#skipBtn').classList.contains('on')")
    check(not m, 'شاشة جديدة: سجلّها فارغ')
    # 6) بطاقات فوضى المخفية بلا صوت (كتم، أو «بلا صوت»، أو «تخطَّ»): تُكتب البطاقتان، وبطاقة فوضى بلونها و«فوضى تظنّ»
    await page.evaluate(PREP)
    await page.evaluate("() => { newStage(220, {}); window.__cp = cardPick([{ id: 'gen.practice.intro', k: 'r', ok: true, hide: true }, { id: 'gen.ms.intro', k: 'w', ok: false, hide: true, chaos: true }]); }")
    await page.wait_for_timeout(400)
    r = await page.evaluate("() => [...document.querySelectorAll('.choices.cards .card')].map(b => ({ hid: b.classList.contains('hidden-text'), ch: b.classList.contains('chaos'), n: (b.querySelector('.cn') || {}).textContent, t: b.textContent.length }))")
    check(all(not x['hid'] and x['t'] > 10 for x in r) and sum(x['ch'] for x in r) == 1 and sorted(x['n'] for x in r) == ['١', '٢'], f'البطاقات المخفية تُكتب حين لا تُسمع، مرقّمة، وبطاقة فوضى بلونها: {r}')
    await page.evaluate("() => { window.__cp.btns[0].click(); hush(); }")
    # وبالصوت (بلا كتم): تبقى مخفيّة مرقّمة
    await page.evaluate("() => { SET.muted = false; NO_TTS = false; hush(); FLOW++; newStage(220, {}); window.__cp = cardPick([{ id: 'gen.practice.intro', k: 'r', ok: true, hide: true }, { id: 'gen.ms.intro', k: 'w', ok: false, hide: true }]); }")
    r = await page.evaluate("() => [...document.querySelectorAll('.choices.cards .card')].map(b => b.classList.contains('hidden-text') && !!b.querySelector('.cn'))")
    check(all(r) and len(r) == 2, f'بالصوت تبقى البطاقتان مخفيّتين مرقّمتين: {r}')
    await page.evaluate("() => { hush(); SET.muted = true; }")
    # 4) صفحة الكبار
    await page.evaluate("() => { hush(); openPanel(); }"); await page.wait_for_timeout(300)
    await page.click('#segRead [data-m="questions"]'); await page.wait_for_timeout(200); await page.click('#quickBtn'); await page.wait_for_timeout(200)
    r = await page.evaluate("() => ({ mode: READ.mode, fast: READ.fast, stored: localStorage.getItem('hp_reading') })")
    check(r['mode'] == 'questions' and r['fast'] is True and r['stored'] and 'questions' in r['stored'], f'أوضاع القراءة تُحفظ للجهاز: {r}')
    check(not errs, f'لا أخطاء في الصفحة: {errs[:3]}')
    await b.close()
  print('FAILS:', len(FAILS))
  sys.exit(1 if FAILS else 0)
asyncio.run(main())
