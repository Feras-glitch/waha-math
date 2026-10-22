# فحص دخاني لنسخة الأطفال (بلا خطافات) بالزمن الحقيقي: البداية → الصورة → الخريطة → الدرس الأول → الحقيبة → المشهد الأول → لمسة تتقدّم بها الجملة.
# الاستعمال: python3 test/smoke_prod.py [ملف=dist/واحة_الرياضيات.html]
# ومعه (D232، D256): لا طلب شبكة واحد، والخطّان المضمّنان محمّلان، وكل حرف في الفقاعة والخيارات ونصوص الرسم يُرسم بخط القراءة Waha Naskh
# والعناوين بـ Baloo Bhaijaan 2، بقراءة الخط المستعمل فعلاً من المتصفح (CSS.getPlatformFontsForNode)، لا بالقاعدة المكتوبة. ونصوص الرسم في كل مشهد يفحصها auto_run.py.
import asyncio, os, sys
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
READ, DISPLAY = 'Waha Naskh', 'Baloo Bhaijaan 2'
async def used(cdp, sel, all_=False):
  # الخطوط التي رسم بها المتصفح نصّ العنصر فعلاً وعدد الحروف بكلٍّ منها
  root = (await cdp.send('DOM.getDocument', {'depth': -1, 'pierce': True}))['root']['nodeId']
  ids = (await cdp.send('DOM.querySelectorAll', {'nodeId': root, 'selector': sel}))['nodeIds']; out = {}
  for i in (ids if all_ else ids[:1]):
    for f in (await cdp.send('CSS.getPlatformFontsForNode', {'nodeId': i}))['fonts']: out[f['familyName']] = out.get(f['familyName'], 0) + f['glyphCount']
  return out
def only(fonts, fam): return bool(fonts) and set(fonts) == {fam}
F = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'dist', 'واحة_الرياضيات.html')
# العدّ المتوقّع من المحتوى نفسه لا رقماً مكتوباً (كان 19 + 3 فأخفق حين أُضيفت S1-U4، الدرس 113): كل dN.json درس، وكل unit.json فيه workshop ورشة
import glob, json
NL = len(glob.glob(os.path.join(ROOT, 'content', 'm*', 'u*', 'd*.json')))
NW = sum(1 for f in glob.glob(os.path.join(ROOT, 'content', 'm*', 'u*', 'unit.json')) if json.load(open(f)).get('workshop'))
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); ctx = await b.new_context(**p.devices['iPhone 13']); pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); net = []
    pg.on('request', lambda r: net.append(r.url) if not r.url.startswith(('file:', 'data:', 'blob:', 'about:')) else None)
    cdp = await ctx.new_cdp_session(pg); fonts = {}; await cdp.send('DOM.enable'); await cdp.send('CSS.enable')
    pg.on('console', lambda m: errs.append(m.type + ': ' + m.text) if (m.type == 'error' and 'Failed to load resource' not in m.text) or (m.type == 'warning' and 'keyframe' in m.text.lower()) else None)
    await pg.goto('file://' + F); await pg.wait_for_timeout(600)
    ok = {}
    ok['start cover (no reading needed)'] = await pg.evaluate("!document.getElementById('startCover').hidden && !!document.getElementById('startBtn')")
    await pg.evaluate('document.fonts.ready')
    await pg.click('#startBtn'); await pg.wait_for_timeout(600)
    fonts['profile bubble'] = await used(cdp, '#profileCover .coversay')
    ok['profile: avatars'] = await pg.evaluate("document.querySelectorAll('.av[data-av]').length >= 8")
    await pg.click('.av[data-av="f3"]'); await pg.click('#pSave'); await pg.wait_for_timeout(800)
    ok[f'home: {NL} lessons + {NW} workshops'] = await pg.evaluate(f"!document.getElementById('home').hidden && document.querySelectorAll('.stop[data-lesson]').length === {NL} && document.querySelectorAll('.stop.ws').length === {NW}")
    fonts['home h1'] = await used(cdp, '.banner h1'); fonts['home stop title'] = await used(cdp, '.stop[data-lesson]'); fonts['home stop small'] = await used(cdp, '.stop small', True)
    fonts['home unit title'] = await used(cdp, '.unithead .ut'); fonts['home unit small'] = await used(cdp, '.unithead small', True)
    ok['no test hooks'] = await pg.evaluate("Object.keys(window).every(k => !k.startsWith('__')) && typeof TESTHOOK === 'undefined' && FAST === false && !document.querySelector('[data-ok]')")
    await pg.click('.stop.now'); await pg.wait_for_timeout(2500)
    ok['bag question: two choices'] = await pg.evaluate("[...document.querySelectorAll('.choices .pick')].map(b => b.dataset.k).join() === 'mat,screen'")
    fonts['lesson bubble'] = await used(cdp, '#say'); fonts['lesson choices'] = await used(cdp, '.choices .pick', True)
    await pg.evaluate("() => [...document.querySelectorAll('.choices .pick')].find(x => x.dataset.k === 'screen').click()"); await pg.wait_for_timeout(5000)
    ok['first scene rendered'] = await pg.evaluate("!!document.querySelector('#stage svg [role=button]') && document.getElementById('say').textContent.length > 10")
    await pg.screenshot(path=os.path.join(HERE, 'out', 'smoke_prod_hook.png'))
    before = await pg.evaluate("document.getElementById('say').textContent")
    await pg.evaluate("document.querySelector('#stage svg [role=button]').dispatchEvent(new MouseEvent('click', {bubbles: true}))"); await pg.wait_for_timeout(9000)
    ok['progressed after touch'] = await pg.evaluate("document.getElementById('say').textContent") != before
    ok['no page errors / invalid keyframes'] = not errs
    ok['no network requests (D232)'] = not net
    ok['embedded faces loaded (D256)'] = await pg.evaluate("""() => { const l = [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/"/g, '') + ' ' + f.weight);
      return ['Waha Naskh 400', 'Waha Naskh 700', 'Baloo Bhaijaan 2 400 800'].every(x => l.includes(x)); }""")
    for k in ('profile bubble', 'home stop small', 'home unit small', 'lesson bubble', 'lesson choices'): ok['reading font only: ' + k + ' ' + str(fonts.get(k))] = only(fonts.get(k), READ)
    for k in ('home h1', 'home stop title', 'home unit title'): ok['display font: ' + k + ' ' + str(fonts.get(k))] = DISPLAY in fonts.get(k, {}) and set(fonts[k]) <= {DISPLAY, READ}
    for k, v in ok.items(): print(('OK  ' if v else 'FAIL'), k)
    if errs: print('errors', errs[:8])
    if net: print('network', net[:8])
    await b.close(); sys.exit(0 if all(ok.values()) else 1)
asyncio.run(main())
