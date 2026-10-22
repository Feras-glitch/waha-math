# اللمس السريع على طريق الأعداد (الفحص المستقل B، M5): طفل يعدّ بسرعة فيلمس البلاطات بفاصل 150–200 م.ث، أي أثناء قفزة الطفل السابقة.
# بزمن الحركة الحقيقي (بلا #fast): لمسات حقيقية بالترتيب ثم «تمّ» يجب أن تُحسب عدّاً صحيحاً، لا «قفز عن بلاطة» (كانت اللمسة أثناء القفزة تُسقط).
# وبعده: «تمّ» يُلمس والقفزة الأخيرة لم تنتهِ، فينتظر انتهاءها. وعلى جهازين (لمس حقيقي).
# python3 test/quicktap_run.py   (FILE=نسخة فحص أخرى)
import asyncio, os, sys
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
FILE = os.environ.get('FILE', os.path.join(HERE, '..', 'dist', 'واحة_الرياضيات.dev.html'))
FAILS = []
def check(ok, what): print(('ok   ' if ok else 'FAIL ') + what); (None if ok else FAILS.append(what))
CASES = [('m1.u3.d5', {'t': 'roadHop', 'q': 'pr.1', 'a': 5, 'b': 9}, 150), ('m1.u3.d6', {'t': 'roadHop', 'q': 'pr.add', 'a': 9, 'n': 4}, 200),
         ('m1.u3.d5', {'t': 'roadHop', 'q': 'pr.c1', 'a': 15, 'b': 11}, 170)]
async def main():
  async with async_playwright() as p:
    for dev in ['Pixel 5', 'iPhone SE']:
      b = await p.chromium.launch(); ctx = await b.new_context(**p.devices[dev]); pg = await ctx.new_page(); errs = []
      pg.on('pageerror', lambda e: errs.append(str(e)))
      await pg.goto('file://' + os.path.abspath(FILE) + '#test&seed=7'); await pg.wait_for_timeout(300)
      await pg.evaluate("""() => { localStorage.clear(); localStorage.setItem('hp_kids', JSON.stringify([{ id: 'k1', name: 'سلمى', gender: 'f' }])); localStorage.setItem('hp_kid', JSON.stringify('k1'));
        localStorage.setItem('hp_settings:k1', JSON.stringify({ sessionMax: 0, muted: true })); localStorage.setItem('hp_prog:k1', JSON.stringify({ schema: 3, unlockAll: true })); }""")
      await pg.reload(); await pg.wait_for_timeout(600)
      for lid, spec, gap in CASES:
        LOGN = "() => { const k = Object.keys(localStorage).find(k => k.startsWith('hp_log:')); return k ? (JSON.parse(localStorage.getItem(k) || '{}').attempts || []).length : 0; }"
        n0 = await pg.evaluate(LOGN)
        await pg.evaluate("([lid, spec]) => { CUR = LDATA[lid]; show('lesson'); window.__res = null; runItem(spec, 'explore').then(r => { window.__res = r; }); }", [lid, spec])
        await pg.wait_for_function("() => window.__road && document.querySelector('.pick.done')", timeout=8000)
        seq = (await pg.evaluate("() => window.__road"))['seq']
        SEEN = "(m) => { const g = document.querySelector('#stage svg g[data-n=\"' + m + '\"]'); if (!g || getComputedStyle(g).visibility === 'hidden') return null; const r = g.querySelector('rect:not(.hit),circle:not(.hit)').getBoundingClientRect(), s = document.querySelector('#stage svg').getBoundingClientRect(); return r.left >= s.left - 1 && r.right <= s.right + 1 ? [r.left + r.width / 2, r.top + r.height / 2] : null; }"
        waits = 0
        for m in seq:   # الطفل يلمس البلاطة التالية حالما يراها، بلا انتظار انتهاء القفزة السابقة (والطريق يكشفها وحده)
          xy = None   # والبلاطة ثابتة لا ينزلق بها الطريق (يصوّب الطفل على ما يقف، أما قفزة صورته فلا ينتظرها)
          for _ in range(30):
            a1 = await pg.evaluate(SEEN, m); await pg.wait_for_timeout(40); a2 = await pg.evaluate(SEEN, m)
            if a1 and a1 == a2: xy = a2; break
            waits += 1
          check(bool(xy), '%s: البلاطة %d تُرى قبل لمسها (يكشفها الطريق وحده)' % (dev, m))
          if not xy: break
          await pg.touchscreen.tap(xy[0], xy[1]); await pg.wait_for_timeout(gap)
        d = await pg.evaluate("() => { const e = document.querySelector('.pick.done'); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }")
        await pg.touchscreen.tap(*d)   # «تمّ» فوراً بعد آخر لمسة، والقفزة لم تنتهِ
        await pg.wait_for_function("(n0) => { const k = Object.keys(localStorage).find(k => k.startsWith('hp_log:')); return k && (JSON.parse(localStorage.getItem(k) || '{}').attempts || []).length > n0; }", arg=n0, timeout=15000)
        last = await pg.evaluate("() => { const k = Object.keys(localStorage).find(k => k.startsWith('hp_log:')); const a = (JSON.parse(localStorage.getItem(k) || '{}').attempts || []); return a.length ? [a[a.length - 1].ok, a[a.length - 1].err, a[a.length - 1].ans] : null; }")
        check(bool(last) and last[0] is True, '%s: %s من %s، لمسات بفاصل %d م.ث ثم «تمّ» فوراً: عدّ صحيح %s' % (dev, spec['q'], lid, gap, last))
        if not (last and last[0] is True): break   # البند يعيد السؤال بعد الخطأ: لا نبدأ غيره فوقه
        await pg.wait_for_function("() => window.__res", timeout=15000); await pg.evaluate("() => { hush(); }"); await pg.wait_for_timeout(300)
      check(not errs, '%s: لا خطأ في الصفحة %s' % (dev, errs[:2])); await b.close()
  print('FAILS:', len(FAILS)); sys.exit(1 if FAILS else 0)
asyncio.run(main())
