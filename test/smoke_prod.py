# فحص دخاني لنسخة الأطفال (بلا خطافات) بالزمن الحقيقي: البداية → الصورة → الخريطة → الدرس الأول → الحقيبة → المشهد الأول → لمسة تتقدّم بها الجملة.
# الاستعمال: python3 test/smoke_prod.py [ملف=dist/واحة_الرياضيات.html]
import asyncio, os, sys
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
F = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'dist', 'واحة_الرياضيات.html')
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); ctx = await b.new_context(**p.devices['iPhone 13']); pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.type + ': ' + m.text) if (m.type == 'error' and 'Failed to load resource' not in m.text) or (m.type == 'warning' and 'keyframe' in m.text.lower()) else None)
    await pg.goto('file://' + F); await pg.wait_for_timeout(600)
    ok = {}
    ok['start cover (no reading needed)'] = await pg.evaluate("!document.getElementById('startCover').hidden && !!document.getElementById('startBtn')")
    await pg.click('#startBtn'); await pg.wait_for_timeout(600)
    ok['profile: avatars'] = await pg.evaluate("document.querySelectorAll('.av[data-av]').length >= 8")
    await pg.click('.av[data-av="f3"]'); await pg.click('#pSave'); await pg.wait_for_timeout(800)
    ok['home: 12 lessons + workshops'] = await pg.evaluate("!document.getElementById('home').hidden && document.querySelectorAll('.stop[data-lesson]').length === 12 && document.querySelectorAll('.stop.ws').length === 2")
    ok['no test hooks'] = await pg.evaluate("Object.keys(window).every(k => !k.startsWith('__')) && typeof TESTHOOK === 'undefined' && FAST === false && !document.querySelector('[data-ok]')")
    await pg.click('.stop.now'); await pg.wait_for_timeout(2500)
    ok['bag question: two choices'] = await pg.evaluate("[...document.querySelectorAll('.choices .pick')].map(b => b.dataset.k).join() === 'mat,screen'")
    await pg.evaluate("() => [...document.querySelectorAll('.choices .pick')].find(x => x.dataset.k === 'screen').click()"); await pg.wait_for_timeout(5000)
    ok['first scene rendered'] = await pg.evaluate("!!document.querySelector('#stage svg [role=button]') && document.getElementById('say').textContent.length > 10")
    await pg.screenshot(path=os.path.join(HERE, 'out', 'smoke_prod_hook.png'))
    before = await pg.evaluate("document.getElementById('say').textContent")
    await pg.evaluate("document.querySelector('#stage svg [role=button]').dispatchEvent(new MouseEvent('click', {bubbles: true}))"); await pg.wait_for_timeout(9000)
    ok['progressed after touch'] = await pg.evaluate("document.getElementById('say').textContent") != before
    ok['no page errors / invalid keyframes'] = not errs
    for k, v in ok.items(): print(('OK  ' if v else 'FAIL'), k)
    if errs: print('errors', errs[:8])
    await b.close(); sys.exit(0 if all(ok.values()) else 1)
asyncio.run(main())
