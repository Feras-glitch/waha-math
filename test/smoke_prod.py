# فحص دخاني لنسخة الأطفال (بلا خطافات): ملف → خريطة → بدء الدرس الأول → ظهور المشهد الأول، بلا أخطاء في الصفحة.
# الاستعمال: python3 test/smoke_prod.py [ملف=dist/واحة_الرياضيات.html]
import asyncio, os, sys
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
F = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'dist', 'واحة_الرياضيات.html')
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); ctx = await b.new_context(**p.devices['Pixel 5']); pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append('console:' + m.text) if m.type == 'error' and 'ERR_TUNNEL' not in m.text and 'Failed to load resource' not in m.text else None)
    await pg.goto('file://' + F); await pg.wait_for_timeout(500)
    ok = {}
    ok['profile shown'] = await pg.evaluate("!document.getElementById('profileCover').hidden")
    await pg.fill('#pName', 'سلمى'); await pg.click('#gF'); await pg.click('#pSave'); await pg.wait_for_timeout(400)
    ok['home shown'] = await pg.evaluate("!document.getElementById('home').hidden && document.querySelectorAll('.stop[data-lesson]').length === 9")
    ok['no test hooks'] = await pg.evaluate("Object.keys(window).every(k => !k.startsWith('__')) && typeof TESTHOOK === 'undefined' && FAST === false")
    await pg.click('.stop[data-lesson="m1.u1.d1"]'); await pg.wait_for_timeout(1500)
    ok['lesson shown'] = await pg.evaluate("!document.getElementById('lesson').hidden")
    ok['first scene rendered'] = await pg.evaluate("!!document.querySelector('#stage svg [role=button]') && document.getElementById('say').textContent.length > 10")
    await pg.screenshot(path=os.path.join(HERE, 'out', 'smoke_prod_hook.png'))
    # اللمس يعمل: اختيار العربة ثم تتقدّم الجملة
    await pg.evaluate("document.querySelector('#stage svg [role=button]').dispatchEvent(new MouseEvent('click', {bubbles: true}))"); await pg.wait_for_timeout(6000)
    ok['progressed after touch'] = await pg.evaluate("document.getElementById('say').textContent !== ''") and await pg.evaluate("!!document.querySelector('#stage svg')")
    ok['data-ok not exposed'] = await pg.evaluate("!document.querySelector('[data-ok]')")
    ok['no page errors'] = not errs
    for k, v in ok.items(): print(('OK  ' if v else 'FAIL') , k)
    if errs: print('errors', errs)
    await b.close(); sys.exit(0 if all(ok.values()) else 1)
asyncio.run(main())
