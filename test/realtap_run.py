# اللمس الحقيقي (D255، الدرس 106): السائق الآلي يجيب بخطّاف البند (dispatchEvent بلا موضع)، فلا يمرّ بتوجيه اللمس ولا بما يحجب الهدف بعد وضع قطعة.
# هذا الفحص يلمس بإصبع حقيقي (touchscreen.tap) في المركز المرئي لكل هدف، ويتحقق أن الانتظار انتهى:
#   - tapAll (العدّ، والأضلاع، والوجوه…): يلمس كل هدف مرة، فيجب أن ينتهي الانتظار.
#   - tap (اختيار واحد): يلمس الهدف الصحيح، فيجب أن ينتهي.
#   - house (بيت الأشكال): يلمس القطعة ثم مكانها، بالترتيبين (الجدار قبل النافذة، والنافذة قبل الجدار)، فيجب أن يتقدّم بعد كل وضع.
#   - sort (الفرز): يسحب الشيء بالإصبع (أحداث لمس حقيقية عبر CDP) أو بالفأرة إلى سلّته، فيجب أن ينتهي الانتظار وأن يُحسب الجواب صحيحاً.
#   - produce وfill (ضع العدد): يلمس القطع واحدة واحدة ثم «تمّ»؛ وsplitMake (لوّن البرج بطريقة جديدة): يلمس المكعبات ثم «تمّ»؛ ويجب أن يُحسب الجواب صحيحاً.
#   - S1-U3: place (ضع الشيء: لمس الحلقة على شاشة، وسحب الشيء إليها على أخرى)، وprog (أزرار الروبوت ثم «انطلق»)، وroad (لمس البلاطات بالترتيب ثم «تمّ»)،
#     وpaint (لوّن العربات ثم «تمّ»)؛ وما خرج من نافذة القطار أو الطريق يُظهَر أولاً بلمس زرّ التحريك (لا يُلمس ما لا يُرى)، ويجب أن يُحسب الجواب صحيحاً.
#   (والسحب في «قارن الطولين» وبناء الروبوت فُحص يدوياً في الفحص المستقل الرابع، v6؛ لا يغطّيه هذا الفحص)
# وبالفأرة أيضاً (MOUSE=1): الكبير الذي يجرّب على حاسوب. ويخرج بـ 1 إن كان فيه إخفاق.
# python3 test/realtap_run.py [جهاز…]   (FILE=نسخة أخرى، كالنسخة التي فيها الخطأ القديم: الدرس 98)
import asyncio, os, sys
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
FILE = os.environ.get('FILE', os.path.join(HERE, '..', 'dist', 'واحة_الرياضيات.dev.html'))
DEVICES = sys.argv[1:] or ['iPhone SE', 'Pixel 5']
MOUSE = os.environ.get('MOUSE') == '1'; DRAG_PAUSE = int(os.environ.get('DRAG_PAUSE', '0'))
# السحب بسرعة إصبع (16 جزءاً من الثانية بين خطوة وأخرى) ويقف على السلّة قبل الرفع: إصبع يُرفع وهو يتحرّك «رمية»، والمتصفح نفسه يُسقط click
# للمسة تليها بأقل من نحو 350 جزءاً من الثانية (صفحة صغيرة بلا كود التطبيق: 20 من 20 بعد الرمية، و0 من 20 بعد الوقوف؛ الفحص المستقل الخامس، ن5)
STATE = """() => { const a = window.__auto; const q = s => document.querySelector(s);
  return { scene: window.__scene || '', n: a ? a.n : null, kind: a ? a.kind : null, go: !!(q('#go') && !q('#go').disabled && !q('#go').classList.contains('idle')),
    home: !q('#home').hidden, covers: [...document.querySelectorAll('.cover')].filter(c => !c.hidden).map(c => c.id) }; }"""
# المركز المرئي لكل هدف: إطار ما يُرسم فيه (لا منطقة اللمس)، ومنتصف الخطّ للخطوط
CENTRES = """(sel) => { const svg = document.querySelector('#stage svg'); if (!svg) return [];
  const vis = g => g.onclick && +getComputedStyle(g).opacity >= .5 && getComputedStyle(g).pointerEvents !== 'none' && !g.closest('[hidden]');
  const box = g => { if (g.tagName === 'line') { const b = g.getBoundingClientRect(); return b; } let r = null;
    for (const c of g.querySelectorAll('circle,ellipse,rect,polygon,path,line,polyline')) { if (c.matches('rect.hit')) continue; const f = c.getAttribute('fill'), s = c.getAttribute('stroke'); if ((f === 'transparent' || f === 'none') && (!s || s === 'none')) continue;
      const b = c.getBoundingClientRect(); if (!b.width && !b.height) continue; r = r ? { left: Math.min(r.left, b.left), top: Math.min(r.top, b.top), right: Math.max(r.right, b.right), bottom: Math.max(r.bottom, b.bottom) } : { left: b.left, top: b.top, right: b.right, bottom: b.bottom }; }
    return r || g.getBoundingClientRect(); };
  return [...svg.querySelectorAll(sel)].filter(vis).map(g => { const r = box(g); return { x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2, ok: g.dataset.ok, k: g.dataset.id || g.dataset.k || '', slot: g.dataset.slot || '', label: g.getAttribute('aria-label') || g.tagName }; }); }"""
LESSONS = ['m1.u1.d1', 'm1.u1.d2', 'm1.u1.d3', 'm1.u1.d4', 'm1.u1.d5', 'm1.u1.d6', 'm1.u2.d1', 'm1.u2.d2', 'm1.u2.d3', 'm1.u2.d4', 'm1.u2.d5', 'm1.u2.d6',
           'm1.u3.d1', 'm1.u3.d2', 'm1.u3.d3', 'm1.u3.d4', 'm1.u3.d5', 'm1.u3.d6', 'm1.u3.d7']
if os.environ.get('ONLY'): LESSONS = [l for l in LESSONS if l in os.environ['ONLY'].split(',')]   # تشغيل جزئي أثناء التطوير
# ما خرج من نافذة الشريط (القطار، الطريق) مخفيّ لا يُلمس: يُلمس زرّ التحريك نحوه حتى يظهر
REVEAL = """(sel) => { const g = document.querySelector(sel); if (!g || getComputedStyle(g).visibility !== 'hidden') return null;
  const r = g.getBoundingClientRect(), w = document.querySelector('#stage svg').getBoundingClientRect(); const k = (r.left + r.right) / 2 < (w.left + w.right) / 2 ? 'back' : 'fwd';
  const b = document.querySelector('#stage svg [data-panbtn=' + k + ']'); if (!b || getComputedStyle(b).visibility === 'hidden') return 'stuck'; const q = b.getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2]; }"""
CENTER_OF = """(sel) => { const e = document.querySelector(sel); if (!e) return null; let r = null;
  for (const c of e.querySelectorAll('circle,ellipse,rect,polygon,path,text')) { if (c.matches('rect.hit')) continue; const f = c.getAttribute('fill'); if (f === 'transparent') continue; const b = c.getBoundingClientRect(); if (!b.width) continue;
    r = r ? { l: Math.min(r.l, b.left), t: Math.min(r.t, b.top), r: Math.max(r.r, b.right), b: Math.max(r.b, b.bottom) } : { l: b.left, t: b.top, r: b.right, b: b.bottom }; }
  if (!r) { const b = e.getBoundingClientRect(); r = { l: b.left, t: b.top, r: b.right, b: b.bottom }; } return [(r.l + r.r) / 2, (r.t + r.b) / 2]; }"""

async def run(p, dev):
  b = await p.chromium.launch(); ctx = await b.new_context(**p.devices[dev]); pg = await ctx.new_page(); errs = []
  pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
  await pg.goto('file://' + os.path.abspath(FILE) + '#fast&seed=7'); await pg.wait_for_timeout(300)
  await pg.evaluate("""() => { localStorage.clear(); localStorage.setItem('hp_kids', JSON.stringify([{ id: 'k1', name: 'سلمى', gender: 'f' }])); localStorage.setItem('hp_kid', JSON.stringify('k1'));
    localStorage.setItem('hp_settings:k1', JSON.stringify({ sessionMax: 0 })); localStorage.setItem('hp_prog:k1', JSON.stringify({ schema: 3, unlockAll: true })); }""")
  await pg.reload(); await pg.wait_for_timeout(500)
  tap = (lambda x, y: pg.mouse.click(x, y)) if MOUSE else (lambda x, y: pg.touchscreen.tap(x, y))
  cdp = await ctx.new_cdp_session(pg)
  async def drag(x0, y0, x1, y1, steps=10):
    if MOUSE:
      await pg.mouse.move(x0, y0); await pg.mouse.down(); await pg.mouse.move(x1, y1, steps=steps); await pg.mouse.up(); return
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x0, 'y': y0}]})
    for i in range(1, steps + 1): await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x0 + (x1 - x0) * i / steps, 'y': y0 + (y1 - y0) * i / steps}]}); await pg.wait_for_timeout(16)   # بسرعة إصبع لا قفزة واحدة
    await pg.wait_for_timeout(100); await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})   # يقف الإصبع على السلّة ثم يُرفع (يضع لا يرمي)
    if DRAG_PAUSE: await pg.wait_for_timeout(DRAG_PAUSE)
  LASTOK = "() => { const k = Object.keys(localStorage).find(k => k.startsWith('hp_log:')); const a = (JSON.parse(localStorage.getItem(k) || '{}').attempts || []); return a.length ? a[a.length - 1].ok : null; }"
  CENTER = "(e) => { const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }"
  bad = []; tried = {}
  async def reveal(sel):
    for _ in range(14):
      xy = await pg.evaluate(REVEAL, sel)
      if xy is None: return True
      if xy == 'stuck': return False
      await tap(*xy); await pg.wait_for_timeout(520)
    return False
  async def tap_sel(sel):
    if not await reveal(sel): return False
    xy = await pg.evaluate(CENTER_OF, sel)
    if xy: await tap(*xy)
    return bool(xy)
  async def gone(n0):
    for _ in range(30):
      s = await pg.evaluate(STATE)
      if s['n'] != n0 or s['kind'] is None: return True
      await pg.wait_for_timeout(60)
    return False
  for lid in LESSONS:
    await pg.evaluate("(id) => { runLesson(id); }", lid); last = -1
    for _ in range(5000):
      st = await pg.evaluate(STATE)
      if (st['home'] and not st['covers']) or 'crashCover' in st['covers']: break
      if st['n'] is not None and st['n'] != last:
        last = st['n']; k = st['kind']
        if k == 'pick' and st['scene'].endswith(':bag'): await pg.evaluate("() => { const b = [...document.querySelectorAll('.choices .pick')]; (b.find(x => x.dataset.k === 'screen') || b[0]).click(); }"); await pg.wait_for_timeout(40); continue
        # «لوّن» بالإصبع في «لوّن العربات ثم المس» وحده (kamAyn، S1-U3)؛ وبند التلوين بالأوعية (paint، S1-U1) بخطّافه كما كان
        kam = k == 'paint' and await pg.evaluate("() => !!(window.__item && window.__item.ask === 'kamAyn')")
        if k in ('tapAll', 'tap', 'house', 'sort', 'produce', 'fill', 'splitMake', 'place', 'prog', 'road') or kam:
          await pg.wait_for_timeout(150); tried[k] = tried.get(k, 0) + 1
          if k == 'tapAll':
            for c in await pg.evaluate(CENTRES, '[role=button]'): await tap(c['x'], c['y']); await pg.wait_for_timeout(80)
          elif k == 'tap':
            if await pg.evaluate("() => !!document.querySelector('#stage svg [data-car][data-ok=true], #stage svg [data-n][data-ok=true]')"): await reveal('#stage svg [role=button][data-ok=true]')   # عربة أو بلاطة خارج النافذة
            cs = [c for c in await pg.evaluate(CENTRES, '[role=button]') if c['ok'] == 'true']
            if cs: await tap(cs[0]['x'], cs[0]['y'])
            else:   # زرّ تحت المسرح («أبقى مكاني»، وأوامر الروبوت في الاكتشاف وفوضى)
              xy = await pg.evaluate("() => { const b = document.querySelector('#stage .choices .pick[data-ok=true]'); if (!b) return null; const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }")
              if xy: await tap(*xy)
          elif k == 'sort':   # الفرز بالسحب إلى السلّة الصحيحة (ولغز المتجر بلمس الرفّ)
            info = await pg.evaluate("""() => { const it = window.__item; const ok = [it.kind, ...(it.accept || [])]; const b = [...document.querySelectorAll('.bins .bin')].find(x => ok.includes(x.dataset.k)); const rb = b.getBoundingClientRect();
              const g = [...document.querySelectorAll('#stage svg g')].find(x => x.style.cursor === 'grab' && x.getBBox().width > 4); const r = g && g.getBoundingClientRect();
              return { riddle: !!it.riddle || !g, x0: r ? r.left + r.width / 2 : 0, y0: r ? r.top + r.height / 2 : 0, x1: rb.left + rb.width / 2, y1: rb.top + rb.height / 2 }; }""")
            if info['riddle']: await tap(info['x1'], info['y1'])
            else: await drag(info['x0'], info['y0'], info['x1'], info['y1'])
          elif k in ('produce', 'fill'):   # ضع العدد: لمس القطع ثم «تمّ»
            need = await pg.evaluate("() => window.__item.n - document.querySelectorAll('#stage svg [data-twin=in]').length")
            for _ in range(max(0, need)):
              xy = await pg.evaluate("(c) => { const e = document.querySelector('#stage svg [data-twin=out]'); if (!e) return null; return (" + CENTER + ")(e); }", None)
              if not xy: break
              await tap(*xy); await pg.wait_for_timeout(60)
            xy = await pg.evaluate("() => { const e = document.querySelector('.pick.done'); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }"); await tap(*xy)
          elif k == 'splitMake':   # لوّن البرج بطريقة لم ترها: يلمس أول k مكعبات (k تفكيك غير المعروض)، ثم «تمّ»
            kk = await pg.evaluate("() => { const it = window.__item, n = it.n, av = (it.avoid || []).map(p => Math.min(...p)); for (let k = 1; k <= n; k++) if (!av.includes(Math.min(k, n - k))) return k; return n; }")
            for i in range(kk):
              xy = await pg.evaluate("(i) => { const e = document.querySelectorAll('#stage svg [data-routed]')[i]; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }", i); await tap(*xy); await pg.wait_for_timeout(60)
            xy = await pg.evaluate("() => { const e = document.querySelector('.pick.done'); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }"); await tap(*xy)
          elif k == 'place':   # ضع الشيء: لمس الحلقة الصحيحة (Pixel 5)، أو سحب الشيء إليها بالإصبع (غيره)
            ring = await pg.evaluate(CENTER_OF, '#stage svg [data-spot][data-ok=true]')
            thing = await pg.evaluate("() => { const g = [...document.querySelectorAll('#stage svg g[role=button]')].find(x => x.style.cursor === 'grab'); if (!g) return null; const r = g.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }")
            if dev == 'Pixel 5' or not thing: await tap(*ring)
            else: await drag(thing[0], thing[1], ring[0], ring[1])
          elif k == 'prog':   # الروبوت: أوامر البند بالترتيب (بعد ما ملأه الحلّ المشترك)، ثم «انطلق»
            prog = await pg.evaluate("() => window.__item.prog")
            for c in prog:
              xy = await pg.evaluate("(c) => { const b = document.querySelector('.rbbar .pick[data-k=' + c + ']'); const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }", c); await tap(*xy); await pg.wait_for_timeout(60)
            xy = await pg.evaluate("() => { const b = document.querySelector('.rbbar .pick[data-k=G]'); const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }"); await tap(*xy)
          elif k == 'road':   # الطريق: البلاطات بالترتيب (يُحرَّك الطريق حين تخرج البلاطة من النافذة)، ثم «تمّ»
            rd = await pg.evaluate("() => window.__road")   # البلاطات الباقية إلى الهدف (في البنود والمشاهد)، و«تمّ» بعدها إلا في «اسمع البلاطات»
            for m in rd['seq']: await tap_sel('#stage svg g[data-n="%d"]' % m); await pg.wait_for_timeout(560)
            if rd['done']: xy = await pg.evaluate("() => { const e = document.querySelector('.pick.done'); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }"); await tap(*xy)
          elif k == 'paint':   # لوّن العربات الأولى بعدد البند، ثم «تمّ»
            kk = await pg.evaluate("() => window.__item.k")
            for i in range(kk): await tap_sel('#stage svg g[data-car="%d"]' % i); await pg.wait_for_timeout(80)
            xy = await pg.evaluate("() => { const e = document.querySelector('.pick.done'); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }"); await tap(*xy)
          else:   # البيت: أكبر قطعة باقية (الجدار قبل النافذة)، ثم مكانها
            pieces = await pg.evaluate(CENTRES, 'g[data-k]'); slots = await pg.evaluate(CENTRES, 'g[data-slot]')
            area = await pg.evaluate("() => Object.fromEntries([...document.querySelectorAll('#stage svg g[data-k]')].map(g => [g.dataset.id, g.getBBox().width * g.getBBox().height]))")
            pieces.sort(key=lambda c: area.get(c['k'], 0) * (1 if dev == 'Pixel 5' else -1))   # الأكبر أولاً على SE، والأصغر أولاً على Pixel 5: الترتيبان
            if pieces:
              pc = pieces[0]; sl = [s for s in slots if s['slot'] == pc['k']]
              await tap(pc['x'], pc['y']); await pg.wait_for_timeout(80)
              if sl: await tap(sl[0]['x'], sl[0]['y'])
          ok = await gone(st['n'])
          if ok and k in ('sort', 'produce', 'fill', 'splitMake', 'place', 'prog', 'road') and await pg.evaluate("() => !!window.__item"): await pg.wait_for_timeout(100); ok = (await pg.evaluate(LASTOK)) is True   # وأن يُحسب الجواب صحيحاً
          if not ok:
            bad.append((dev, st['scene'], k)); await pg.screenshot(path=os.path.join(HERE, 'out', 'realtap_%s_%s.png' % (dev.replace(' ', ''), st['scene'].replace(':', '_').replace('.', '_'))))
            await pg.evaluate("() => { const a = window.__auto; if (a) a.ok(); }")   # يكمل بخطّاف البند ليتابع الدرس
          continue
        await pg.evaluate("() => { const a = window.__auto; if (a) a.ok(); }"); await pg.wait_for_timeout(40); continue
      if st['go']: await pg.click('#go'); await pg.wait_for_timeout(30); continue
      await pg.wait_for_timeout(50)
  await b.close()
  return bad, tried, errs

async def main():
  os.makedirs(os.path.join(HERE, 'out'), exist_ok=True); allbad = []
  async with async_playwright() as p:
    for dev in DEVICES:
      bad, tried, errs = await run(p, dev); allbad += bad
      print(dev, ('mouse' if MOUSE else 'touch'), 'waits tried:', tried, '| incomplete:', bad, '| errors:', errs[:3])
      allbad += [('errors', dev)] if errs else []
  print('FAILS:', len(allbad))
  sys.exit(1 if allbad else 0)
asyncio.run(main())
