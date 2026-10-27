import asyncio, json, time
from playwright.async_api import async_playwright
import os
URL = 'file://' + os.environ.get('U1FILE', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '05b_نسخة_الفحص_dev.html')) + '#fast'   # D249
OUT = '/home/claude/audit/s152_'
KID_PNG = '/tmp/claude-0/-home-claude/adc5da83-ca85-5fee-8abd-f1dd7bb3338c/scratchpad/kid.png'
async def wait_scene(pg, pred, ms=8000):
  for _ in range(ms // 50):
    sc = await pg.evaluate("window.__scene")
    if pred(sc): return sc
    await pg.wait_for_timeout(50)
  raise Exception('scene timeout, last=' + str(sc))
async def go(pg):
  await pg.wait_for_function("!document.getElementById('go').disabled", timeout=8000); await pg.click('#go')
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); ctx = await b.new_context(**p.devices['Pixel 5']); pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append('console:' + m.text) if m.type == 'error' and 'ERR_TUNNEL' not in m.text else None)
    await pg.goto(URL); await pg.wait_for_timeout(300)
    prog = {f'm1.u1.d{i}': {'done': True, 'mastered': True, 'at': int(time.time() * 1000)} for i in range(1, 6)}
    prog.update({f'm1.u2.d{i}': {'done': True, 'mastered': True} for i in range(1, 5)}); prog['badge:m1.u1'] = True; prog['badge:m1.u2'] = True
    # ملف قديم واحد: يجب أن يُنقل إلى أطفال الجهاز
    await pg.evaluate("""(prog)=>{localStorage.setItem('hp_profile', JSON.stringify({name:'سلمى',gender:'f',photo:''})); localStorage.setItem('hp_prog', JSON.stringify(prog));
      localStorage.setItem('hp_log', JSON.stringify({attempts:[{t:Date.now(),lesson:'m1.u1.d1',scene:'practice',ok:false,firstTry:true,ms:600},{t:Date.now(),lesson:'m1.u1.d1',scene:'practice',ok:false,firstTry:true,ms:700},{t:Date.now(),lesson:'m1.u1.d1',scene:'practice',ok:false,firstTry:true,ms:500}]}));}""", prog)
    await pg.reload(); await pg.wait_for_timeout(500)
    mig = await pg.evaluate("({kids: localStorage.getItem('hp_kids'), prog: !!localStorage.getItem('hp_prog:k1'), home: !document.getElementById('home').hidden})"); print('migration', mig)
    await pg.screenshot(path=OUT + '01_home.png')
    print('workshop stops', await pg.evaluate("[...document.querySelectorAll('.stop.ws')].map(b=>b.dataset.workshop+':'+b.getAttribute('aria-disabled'))"))
    # الورشة: ألغاز الوحدة الأولى
    await pg.click('.stop[data-workshop="m1.u1"]'); await pg.wait_for_timeout(300); await pg.screenshot(path=OUT + '02_ws_menu.png')
    await pg.click('.choices.icons .pick[data-k=puzzle]')
    for i in range(5):
      sc = await wait_scene(pg, lambda s: s.startswith('ws:') and s not in ('ws:menu',)); await pg.wait_for_timeout(200)
      if i in (0, 3): await pg.screenshot(path=OUT + f'03_puzzle_{sc[3:]}.png')
      await pg.evaluate("window.__wsSolve()"); await pg.wait_for_timeout(300)
      if i == 3: await pg.screenshot(path=OUT + f'04_solved_{sc[3:]}.png')
      await go(pg); await pg.wait_for_timeout(150)
    await wait_scene(pg, lambda s: s == 'home', 12000)
    print('ws solved u1', await pg.evaluate("JSON.parse(localStorage.getItem('hp_prog:k1')).ws"))
    # ألغاز الوحدة الثانية
    await pg.click('.stop[data-workshop="m1.u2"]'); await pg.wait_for_timeout(300); await pg.click('.choices.icons .pick[data-k=puzzle]')
    for i in range(4):
      sc = await wait_scene(pg, lambda s: s.startswith('ws:') and s != 'ws:menu'); await pg.wait_for_timeout(200)
      await pg.screenshot(path=OUT + f'05_u2_{sc[3:]}.png'); await pg.evaluate("window.__wsSolve()"); await pg.wait_for_timeout(300)
      await pg.screenshot(path=OUT + f'05_u2_{sc[3:]}_done.png'); await go(pg); await pg.wait_for_timeout(150)
    await wait_scene(pg, lambda s: s == 'home', 12000)
    # البناء الحر والحفظ
    await pg.click('.stop[data-workshop="m1.u1"]'); await pg.wait_for_timeout(300); await pg.click('.choices.icons .pick[data-k=free]'); await wait_scene(pg, lambda s: s == 'ws:free')
    for k in ['square', 'triangle', 'circle']: await pg.evaluate(f"document.querySelector('[data-ws-spawn={k}]').dispatchEvent(new MouseEvent('click',{{bubbles:true}}))"); await pg.wait_for_timeout(80)
    await pg.click('#wsRot'); await pg.click('#wsSave'); await pg.wait_for_timeout(400); await pg.screenshot(path=OUT + '06_free.png')
    print('designs', await pg.evaluate("JSON.parse(localStorage.getItem('hp_designs:k1')).length"))
    await go(pg); await wait_scene(pg, lambda s: s == 'home')
    # المعرض وصيد الكاميرا
    await pg.click('#galBtn'); await pg.wait_for_timeout(400)
    print('hunt kinds', await pg.evaluate("[...document.querySelectorAll('[data-hunt]')].map(b=>b.dataset.hunt)"))
    async with pg.expect_file_chooser() as fc: await pg.click('[data-hunt=circle]')
    ch = await fc.value; await ch.set_files(KID_PNG); await pg.wait_for_timeout(1200)
    print('photos', await pg.evaluate("document.querySelectorAll('.gitems img').length"), '| designs shown', await pg.evaluate("document.querySelectorAll('.gitems .design').length"))
    await pg.screenshot(path=OUT + '07_gallery.png')
    await pg.click('#galClose'); await pg.wait_for_timeout(200)
    # لوحة الكبار: الإشارات، والقراءة الأبطأ، والتقرير، وإضافة طفل
    await pg.click('#adultBtn'); await pg.fill('#gateIn', str(await pg.evaluate('window.__gateAns'))); await pg.click('#gateForm button'); await pg.wait_for_timeout(300)
    print('signals', await pg.evaluate("document.getElementById('panel').innerText.includes('يخمّن')"))
    await pg.click('#slowBtn'); await pg.wait_for_timeout(150); print('slow', await pg.evaluate("localStorage.getItem('hp_settings:k1')"))
    await pg.click('#repBtn'); await pg.wait_for_timeout(500); await pg.screenshot(path=OUT + '08_report.png', full_page=False)
    rep = await pg.evaluate("document.getElementById('report').innerText"); print('report:', rep.replace('\n', ' | ')[:500])
    await pg.emulate_media(media='print'); await pg.screenshot(path=OUT + '09_report_print.png'); await pg.emulate_media(media='screen')
    await pg.click('#repBack'); await pg.wait_for_timeout(200)
    ids=set(json.load(open('/home/claude/audit/script_u1.xlsx.ids.json'))); cl=set(await pg.evaluate('window.__clips||[]')); print('clips before reload', len(cl), 'missing', sorted(cl-ids))
    await pg.click('#addKid'); await pg.wait_for_timeout(200)
    await pg.fill('#pName', 'يوسف'); await pg.click('#gM'); await pg.click('#pSave'); await pg.wait_for_timeout(900)
    print('after add: kids', await pg.evaluate("JSON.parse(localStorage.getItem('hp_kids')).map(k=>k.name)"), '| picker', await pg.evaluate("!document.getElementById('kidsCover').hidden"))
    await pg.screenshot(path=OUT + '10_kids.png')
    # الطفل الجديد يبدأ من الصفر، وسلمى تحتفظ بتقدّمها
    cur = await pg.evaluate("document.querySelector('.kid[aria-pressed=true] span:last-child').textContent"); print('current', cur)
    await pg.click('.kid[aria-pressed=true]'); await pg.wait_for_timeout(300)
    print('youssef done lessons', await pg.evaluate("document.querySelectorAll('.stop .st circle').length + document.querySelectorAll('.stop .st path[fill=\"#f2b33d\"]').length"))
    await pg.click('#meBtn'); await pg.wait_for_timeout(300); await pg.click('.kid[aria-pressed=false]'); await pg.wait_for_timeout(900)
    print('back to', await pg.evaluate("document.getElementById('helloName').textContent"), '| stars', await pg.evaluate("document.querySelectorAll('.stop .st path[fill=\"#f2b33d\"]').length"))
    await pg.click('.kid[aria-pressed=true]'); await pg.wait_for_timeout(200); await pg.emulate_media(color_scheme='dark'); await pg.click('#galBtn'); await pg.wait_for_timeout(400); await pg.screenshot(path=OUT + '11_gallery_dark.png')
    ids=set(json.load(open('/home/claude/audit/script_u1.xlsx.ids.json'))); cl=set(await pg.evaluate('window.__clips||[]')); print('clips', len(cl), 'missing', sorted(cl-ids))
    print('errors', errs); await b.close()
asyncio.run(main())
