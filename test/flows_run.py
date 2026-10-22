# فحص المسارات خارج الدرس: الخروج الآمن والاستئناف، والاستراحة بعد حدّ الجلسة وتجاوزها ببوابة الكبار،
# و«أرقامي» (بطاقة التعارف ولعبة المطابقة ثم العرض الغربي)، ولوحة الكبار خلف البوابة، والوضع الليلي.
# الاستعمال: python3 test/flows_run.py   (يكتب الصور في test/out/flows)
import asyncio, json, os, sys
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
FILE = os.environ.get('FILE', os.path.join(HERE, '..', 'dist', 'واحة_الرياضيات.dev.html'))
OUT = os.path.join(HERE, 'out', 'flows'); os.makedirs(OUT, exist_ok=True)
URL = 'file://' + os.path.abspath(FILE) + '#fast&seed=7'
fails = []
def check(cond, msg):
  print(('ok   ' if cond else 'FAIL ') + msg)
  if not cond: fails.append(msg)
async def vis(pg, sel): return await pg.evaluate("s => { const e = document.querySelector(s); return !!e && !e.hidden && getComputedStyle(e).display !== 'none'; }", sel)
async def drive(pg, n):           # يتقدّم n خطوة في الدرس بالحلّ الصحيح (بروتوكول __auto) أو «التالي»
  last = -1
  for _ in range(n * 40):
    st = await pg.evaluate("() => ({ a: window.__auto ? window.__auto.n : null, k: window.__auto ? window.__auto.kind : null, go: !!(document.querySelector('#go') && !document.querySelector('#go').disabled && !document.querySelector('#go').classList.contains('idle')) })")
    if st['a'] is not None and st['a'] != last:
      last = st['a']; n -= 1
      if st['k'] == 'pick': await pg.evaluate("() => { const b = [...document.querySelectorAll('.choices .pick')]; (b.find(x => x.dataset.k === 'screen') || b[0]).click(); }")
      else: await pg.evaluate("() => window.__auto.ok()")
    elif st['go']: await pg.click('#go'); n -= 1
    if n <= 0: return
    await pg.wait_for_timeout(60)
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); errs = []
    # 0) ترحيل تقدّم من بنية دروس أقدم: يُحفظ ويُبدأ من جديد، ويرى الكبير التنبيه
    ctx = await b.new_context(**p.devices['Pixel 5']); pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    await pg.goto(URL); await pg.wait_for_timeout(300)
    await pg.evaluate("""() => { localStorage.clear(); localStorage.setItem('hp_kids', JSON.stringify([{ id: 'k1', name: 'سلمى', gender: 'f' }])); localStorage.setItem('hp_kid', JSON.stringify('k1'));
      localStorage.setItem('hp_prog:k1', JSON.stringify({ 'm1.u2.d4': { done: true }, 'm1.u1.d1': { done: true }, badge: true, srs: {} })); }""")
    await pg.reload(); await pg.wait_for_timeout(500)
    st = await pg.evaluate("() => ({ d4: !!(PROG['m1.u2.d4'] && PROG['m1.u2.d4'].done), schema: PROG.schema, bak: Object.keys(localStorage).filter(k => k.startsWith('hp_prog_bak:')), mig: STORE_ISSUES.migrated })")
    check(not st['d4'] and st['schema'] == 3 and st['bak'] == ['hp_prog_bak:k1:v1'] and st['mig'] == 1, 'ترحيل التقدّم القديم: نسخة احتياطية وبداية جديدة ' + json.dumps(st))
    await pg.click('#adultBtn'); await pg.wait_for_timeout(150); ans = await pg.evaluate("() => window.__gateAns"); await pg.fill('#gateIn', str(ans)); await pg.click('#gateGo'); await pg.wait_for_timeout(300)
    check(await vis(pg, '#storeWarn'), 'تنبيه الترحيل ظاهر في لوحة الكبار')
    await pg.reload(); await pg.wait_for_timeout(400)
    check(await pg.evaluate("() => STORE_ISSUES.migrated === null && PROG.schema === 3"), 'لا ترحيل ثانٍ بعد إعادة التحميل')
    await ctx.close()
    for scheme in ('light', 'dark'):
      ctx = await b.new_context(**p.devices['Pixel 5'], color_scheme=scheme); pg = await ctx.new_page()
      pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e) + ' ' + (e.stack or '')[:300]))
      await pg.goto(URL); await pg.wait_for_timeout(400)
      await pg.click('#startBtn'); await pg.wait_for_timeout(200); await pg.click('.av[data-av="m2"]'); await pg.click('#pSave'); await pg.wait_for_timeout(400)
      sfx = '_' + scheme
      # 1) الخروج الآمن ثم الاستئناف
      await pg.click('.stop.now'); await pg.wait_for_timeout(300); await drive(pg, 6)
      before = await pg.evaluate("() => window.__scene")
      await pg.click('#mapBtn'); await pg.wait_for_timeout(200)
      check(await vis(pg, '#exitCover'), scheme + ': زرّ الخريطة يفتح سؤال الخروج')
      await pg.screenshot(path=OUT + '/exit' + sfx + '.png')
      await pg.click('#exLeave'); await pg.wait_for_timeout(300)
      check(await vis(pg, '#home'), scheme + ': «إلى الخريطة» يعيد الخريطة')
      res = await pg.evaluate("() => { const k = Object.keys(localStorage).find(k => k.startsWith('hp_prog:')); const P = JSON.parse(localStorage.getItem(k)); return P['m1.u1.d1'] && P['m1.u1.d1'].resume; }")
      check(bool(res), scheme + ': حُفظ موضع الاستئناف ' + json.dumps(res))
      await pg.click('.stop.now'); await pg.wait_for_timeout(200)
      check(await vis(pg, '#exitCover') and await pg.evaluate("() => !!document.querySelector('#rsGo')"), scheme + ': سؤال «نكمل أم من البداية؟»')
      await pg.screenshot(path=OUT + '/resume' + sfx + '.png')
      await pg.click('#rsGo'); await pg.wait_for_timeout(300)
      after = await pg.evaluate("() => window.__scene")
      check(after.split(':')[1:2] == before.split(':')[1:2] or after.startswith('m1.u1.d1:'), scheme + ': الاستئناف يعود إلى المرحلة نفسها (%s ← %s)' % (before, after))
      await pg.click('#mapBtn'); await pg.wait_for_timeout(150); await pg.click('#exLeave'); await pg.wait_for_timeout(200)
      # 2) الاستراحة بعد حدّ الجلسة، ثم «درس آخر» خلف بوابة الكبار
      await pg.evaluate("() => { SESSION.n = SET.sessionMax; SESSION.t = Date.now(); store.set(kk('hp_session'), SESSION); }")
      await pg.click('.stop.now'); await pg.wait_for_timeout(300)
      check(await vis(pg, '#breakCover'), scheme + ': تظهر الاستراحة عند حدّ الجلسة')
      await pg.screenshot(path=OUT + '/break' + sfx + '.png')
      await pg.click('#moreBtn'); await pg.wait_for_timeout(150)
      check(await vis(pg, '#panel'), scheme + ': «درس آخر» يمرّ ببوابة الكبار')
      await pg.fill('#gateIn', '1'); await pg.click('#gateGo')
      msg = await pg.evaluate("() => (document.querySelector('#gateMsg') || {}).textContent || ''")   # يُقرأ فوراً: في وضع الفحص تُعاد البوابة بعد 60 جزءاً من الثانية
      check('غير صحيح' in msg, scheme + ': جواب البوابة الخاطئ يُرفض')
      await pg.wait_for_timeout(200)
      ans = await pg.evaluate("() => window.__gateAns"); await pg.fill('#gateIn', str(ans)); await pg.click('#gateGo'); await pg.wait_for_timeout(300)
      check(await vis(pg, '#lesson') or await vis(pg, '#exitCover'), scheme + ': بعد البوابة يبدأ الدرس')
      if await vis(pg, '#exitCover'): await pg.click('#rsNew'); await pg.wait_for_timeout(200)
      await pg.click('#mapBtn'); await pg.wait_for_timeout(150); await pg.click('#exLeave'); await pg.wait_for_timeout(200)
      # 3) «أرقامي»: يظهر بعد الدرس 5، وأول تبديل بطاقة تعارف ولعبة مطابقة
      check(not await vis(pg, '#digBtn'), scheme + ': زرّ «أرقامي» مخفيّ قبل درس الأرقام')
      txt0 = await pg.evaluate("() => document.querySelector('#path').textContent")
      check(not any(ch in txt0 for ch in '0123456789٠١٢٣٤٥٦٧٨٩'), scheme + ': لا رقم مكتوب في الخريطة قبل درس الأرقام (D254 (4))')
      await pg.evaluate("() => { progOf('m1.u1.d5').done = true; saveProg(); renderDigits(); }")
      check(await vis(pg, '#digBtn'), scheme + ': زرّ «أرقامي» يظهر بعد درس الأرقام')
      await pg.click('#digBtn'); await pg.wait_for_timeout(300)
      check(await vis(pg, '#digitsCover'), scheme + ': أول تبديل يفتح بطاقة التعارف')
      await pg.screenshot(path=OUT + '/digits_intro' + sfx + '.png')
      for _ in range(60):
        if await pg.evaluate("() => !!document.querySelector('#dMatch .opts .pick')"): break
        await pg.wait_for_timeout(50)
      await pg.screenshot(path=OUT + '/digits_match' + sfx + '.png')
      for _ in range(4):
        await pg.evaluate("() => { const b = [...document.querySelectorAll('#dMatch .opts .pick')]; const w = b.find(x => x.dataset.ok === 'false'); if (w) w.click(); }"); await pg.wait_for_timeout(80)
        await pg.evaluate("() => { const b = document.querySelector('#dMatch .opts .pick[data-ok=true]'); if (b) b.click(); }"); await pg.wait_for_timeout(500)
      for _ in range(60):
        if await vis(pg, '#dDone'): break
        await pg.wait_for_timeout(50)
      check(await vis(pg, '#dDone'), scheme + ': تنتهي لعبة المطابقة بزرّ «تمّ»')
      await pg.click('#dDone'); await pg.wait_for_timeout(300)
      txt = await pg.evaluate("() => document.querySelector('#path').textContent")
      check(any(ch in txt for ch in '0123456789') and not any(ch in txt for ch in '٠١٢٣٤٥٦٧٨٩'), scheme + ': الخريطة تعرض الأرقام الغربية بعد التبديل')
      await pg.screenshot(path=OUT + '/home_west' + sfx + '.png')
      await pg.click('#digBtn'); await pg.wait_for_timeout(200)
      txt = await pg.evaluate("() => document.querySelector('#path').textContent")
      check(any(ch in txt for ch in '٠١٢٣٤٥٦٧٨٩'), scheme + ': التبديل الثاني يعيد المشرقية بلا بطاقة')
      # 3ب) المعرض وصيد الأشكال بالكاميرا (D201): شكل درس منجز ← صورة ← تُحفظ وتظهر في «مَعْرِضِي»
      await pg.evaluate("() => { progOf('m1.u1.d1').done = true; saveProg(); }")
      await pg.click('#galBtn'); await pg.wait_for_timeout(300)
      check(await vis(pg, '#galCover') and await pg.evaluate("() => document.querySelectorAll('#huntGrid .bin').length >= 1"), scheme + ': المعرض يفتح بسلال أشكال الدروس المنجزة')
      async with pg.expect_file_chooser() as fc:
        await pg.evaluate("() => document.querySelector('#huntGrid .bin').click()")
      await (await fc.value).set_files(os.path.join(HERE, 'fixtures', 'kid.png'))
      for _ in range(80):
        if await pg.evaluate("() => document.querySelectorAll('#galCover .gitems img').length >= 1"): break
        await pg.wait_for_timeout(50)
      check(await pg.evaluate("() => document.querySelectorAll('#galCover .gitems img').length >= 1"), scheme + ': الصورة تُحفظ وتظهر في المعرض')
      await pg.screenshot(path=OUT + '/gallery' + sfx + '.png')
      await pg.click('#galClose'); await pg.wait_for_timeout(200)
      # 4) لوحة الكبار
      await pg.click('#adultBtn'); await pg.wait_for_timeout(150)
      if await vis(pg, '#gateIn'):                  # البوابة تُفتح مرة كل عشر دقائق
        ans = await pg.evaluate("() => window.__gateAns"); await pg.fill('#gateIn', str(ans)); await pg.click('#gateGo'); await pg.wait_for_timeout(300)
      check(await vis(pg, '#panel'), scheme + ': لوحة الكبار تفتح')
      await pg.screenshot(path=OUT + '/panel' + sfx + '.png', full_page=True)
      tabs = await pg.evaluate("() => [...document.querySelectorAll('#panel [role=tab], #panel .tabs button')].map(b => b.textContent.trim())")
      for i, t in enumerate(tabs):
        await pg.evaluate("(i) => [...document.querySelectorAll('#panel [role=tab], #panel .tabs button')][i].click()", i); await pg.wait_for_timeout(200)
        await pg.screenshot(path=OUT + '/panel_%d%s.png' % (i, sfx))
      # 5) أهداف اللمس في الخريطة واللوحة (56 للطفل، 44 للكبار)
      small = await pg.evaluate("""() => { const out = []; for (const e of document.querySelectorAll('button, [role=button], input, a')) { const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; if (e.closest('[hidden]')) continue;
          const need = (e.closest('#panel') || e.id === 'adultBtn') ? 44 : 56;   /* رابط الكبار هدف للكبار (44)، وكل ما يلمسه الطفل 56 */ if (Math.min(r.width, r.height) < need - 0.5) out.push([e.id || e.className.baseVal || e.className || e.tagName, Math.round(r.width), Math.round(r.height), need]); } return out; }""")
      check(not small, scheme + ': أهداف اللمس في الخريطة واللوحة ' + str(small[:6]))
      clips = set(await pg.evaluate("() => window.__clips || []")); ids = set(json.load(open(os.path.join(HERE, '..', 'dist', 'script_m1.xlsx.ids.json'))))
      check(not (clips - ids), scheme + ': كل جملة منطوقة في جدول التسجيل ' + str(sorted(clips - ids)[:5]))
      await ctx.close()
    # 6) الأغطية على أضيق شاشة (320×568): لا يخرج شيء عن العرض، ولا تُقصّ الفقاعة (D255)
    ctx = await b.new_context(**p.devices['iPhone SE']); pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    await pg.goto(URL); await pg.wait_for_timeout(400)
    FIT = """() => { const c = [...document.querySelectorAll('.cover')].find(x => !x.hidden); if (!c) return ['no cover']; const W = Math.min(innerWidth, visualViewport ? visualViewport.width : innerWidth, screen.width), bad = [];
      for (const e of c.querySelectorAll('button, .bubble, .talk, .avatars')) { const r = e.getBoundingClientRect(); if (!r.width || e.closest('[hidden]')) continue; if (r.left < -0.5 || r.right > W + 0.5) bad.push((e.id || e.className) + ' ' + Math.round(r.left) + '..' + Math.round(r.right)); }
      for (const b of c.querySelectorAll('.bubble')) if (b.scrollHeight > b.clientHeight + 1) bad.push('bubble clipped ' + b.clientHeight + '<' + b.scrollHeight);
      return bad; }"""
    await pg.click('#startBtn'); await pg.wait_for_timeout(300)
    r1 = await pg.evaluate(FIT); check(r1 == [], 'iPhone SE: غطاء الملف داخل الشاشة وفقاعته كاملة ' + str(r1[:4]))
    await pg.screenshot(path=OUT + '/profile_se.png')
    await pg.click('.av[data-av="g1"]') if await pg.query_selector('.av[data-av="g1"]') else await pg.click('.av'); await pg.click('#pSave'); await pg.wait_for_timeout(400)
    await pg.click('.stop.now'); await pg.wait_for_timeout(300); await drive(pg, 3); await pg.click('#mapBtn'); await pg.wait_for_timeout(250)
    r2 = await pg.evaluate(FIT); check(r2 == [], 'iPhone SE: غطاء الخروج داخل الشاشة وفقاعته كاملة ' + str(r2[:4]))
    await pg.screenshot(path=OUT + '/exit_se.png')
    await ctx.close()
    # 7) اسم طويل من كلمتين على الشاشتين الضيقتين: الخريطة (وفيها زرّ «أرقامي» بعد درس الأرقام) وغطاء الاستراحة فوقها لا يتّسعان عن العرض (D255)
    # العرض المرئي لا innerWidth: المتصفح على الهاتف يوسّع مساحة التخطيط لتسع ما يفيض، فيكبر innerWidth معه (438 لا 320)
    WIDE = """() => { const W = Math.min(innerWidth, visualViewport ? visualViewport.width : innerWidth, screen.width), bad = []; if (innerWidth > W + 0.5) bad.push('layout ' + innerWidth + '>' + W); if (document.documentElement.scrollWidth > W + 0.5) bad.push('page ' + document.documentElement.scrollWidth + '>' + W);
      for (const e of document.querySelectorAll('#home .hello, #home .banner, #home .stop, .cover:not([hidden]) button, .cover:not([hidden]) .bubble')) { const r = e.getBoundingClientRect(); if (!r.width || e.closest('[hidden]')) continue; if (r.left < -0.5 || r.right > W + 0.5) bad.push((e.id || e.className) + ' ' + Math.round(r.left) + '..' + Math.round(r.right)); }
      const P = [...document.querySelectorAll('#path > *')].filter(e => e.getBoundingClientRect().height);   /* ولا يغطّي عنصرٌ في الخريطة ما تحته، ولا يفيض نصّه عن زرّه */
      P.forEach((e, i) => { const r = e.getBoundingClientRect(); if (P[i + 1] && r.bottom > P[i + 1].getBoundingClientRect().top + 0.5) bad.push('overlap ' + e.className); const t = e.matches('.stop') ? e : e.querySelector('.ut'); if (t && t.scrollHeight > t.clientHeight + 8) bad.push('overflow ' + e.className + ' ' + t.clientHeight + '<' + t.scrollHeight); });   /* النصّ لا يفيض عن زرّه (رسم المضيفين يتجاوز صندوقه عمداً؛ وهامش 8 لأن مقاييس خط النسخ أطول من ارتفاع السطر بلا قصّ) */
      const h = document.querySelector('#helloName'); if (h && h.textContent && h.scrollWidth > h.clientWidth + 1) bad.push('name cut ' + h.clientWidth + '<' + h.scrollWidth);
      return bad; }"""
    for dev in ('iPhone SE', 'Galaxy S5', 'Pixel 5'):
      ctx = await b.new_context(**p.devices[dev]); pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
      await pg.goto(URL); await pg.wait_for_timeout(300)
      await pg.evaluate("""() => { localStorage.clear(); localStorage.setItem('hp_kids', JSON.stringify([{ id: 'k1', name: 'عبد الرحمن', gender: 'm', av: 'm2' }])); localStorage.setItem('hp_kid', JSON.stringify('k1'));
        localStorage.setItem('hp_settings:k1', JSON.stringify({ sessionMax: 3 })); localStorage.setItem('hp_prog:k1', JSON.stringify({ schema: 3, 'm1.u1.d1': { done: true }, 'm1.u1.d2': { done: true }, 'm1.u1.d3': { done: true }, 'm1.u1.d4': { done: true }, 'm1.u1.d5': { done: true } })); }""")
      await pg.reload(); await pg.wait_for_timeout(500)
      w1 = await pg.evaluate(WIDE); check(w1 == [] and await vis(pg, '#digBtn'), dev + ': الخريطة باسم «عبد الرحمن» وزرّ «أرقامي» داخل العرض ' + str(w1[:4]))
      await pg.screenshot(path=OUT + '/home_longname_' + dev.replace(' ', '') + '.png')
      await pg.evaluate("() => { SESSION.n = SET.sessionMax; SESSION.t = Date.now(); store.set(kk('hp_session'), SESSION); }"); await pg.evaluate("() => document.querySelector('.stop[data-lesson][aria-disabled=false]').click()"); await pg.wait_for_timeout(400)
      w2 = await pg.evaluate(WIDE); f2 = await pg.evaluate(FIT); check(await vis(pg, '#breakCover') and w2 == [] and f2 == [], dev + ': غطاء الاستراحة فوقها داخل العرض وفقاعته كاملة ' + str((w2 + f2)[:4]))
      await pg.screenshot(path=OUT + '/break_longname_' + dev.replace(' ', '') + '.png')
      await ctx.close()
    await b.close()
    print('errors:', len(errs)); [print(' ', e[:300]) for e in errs[:10]]
    print('FAILS:', len(fails)); [print(' ', f) for f in fails]
    return len(fails) + len(errs)
sys.exit(1 if asyncio.run(main()) else 0)   # إخفاق ⇒ رمز خروج 1
