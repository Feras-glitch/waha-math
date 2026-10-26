# ألغاز الورشة باللمس الحقيقي (D246، D255؛ الفحص المستقل B لبوابة S1-U4، حاجب: بديل اللمس تعطّل بعد أول قطعة توضع، لأن منطقة لمس القطعة الموضوعة
# كبرت بمقياسها فغطّت الظلال الباقية، وفي الطوف غطّت منطقةُ ظلٍّ رسمَ الظلّ فوقه). لكل لغز في كل وحدة: يلمس الطفل القطعة على الرفّ بإصبعه
# (touchscreen.tap في مركز رسمها)، ثم «دوّر» إن احتاج، ثم الظلّ في مركز رسمه، ويجب أن يمتلئ هذا الظلّ نفسه؛ بترتيب الظلال على جهاز وبعكسه على الآخر.
# python3 test/ws_tap_run.py [جهاز…]   (FILE=نسخة أخرى)
import asyncio, os, sys
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
FILE = os.environ.get('FILE', os.path.join(HERE, '..', 'dist', 'واحة_الرياضيات.dev.html'))
DEVICES = sys.argv[1:] or ['iPhone SE', 'Pixel 5']
FAILS = []
def check(ok, what): print(('ok   ' if ok else 'FAIL ') + what); (None if ok else FAILS.append(what))
CENTER = """(e) => { let r = null; for (const c of [e, ...e.querySelectorAll('*')]) { if (!(c instanceof SVGGeometryElement) || c.matches('rect.hit')) continue; const b = c.getBoundingClientRect(); if (!b.width && !b.height) continue;
  r = r ? { l: Math.min(r.l, b.left), t: Math.min(r.t, b.top), r: Math.max(r.r, b.right), b: Math.max(r.b, b.bottom) } : { l: b.left, t: b.top, r: b.right, b: b.bottom }; } return r ? [(r.l + r.r) / 2, (r.t + r.b) / 2] : null; }"""
# ولمسة قرب حافة القطعة على الرفّ (حيث رسمها هو الأعلى) تختارها هي لا جارتها (السائق بنقاط الحواف: حافة المستطيل في لغز القطار ذهبت إلى الدائرة)
EDGES = """() => { const svg = document.querySelector('#stage svg'); const blank = e => { const cs = getComputedStyle(e); const clr = v => !v || v === 'none' || v === 'transparent' || /,\\s*0\\)$/.test(v); return e.matches('rect.hit') || ((clr(cs.fill) || +cs.fillOpacity === 0) && (clr(cs.stroke) || +cs.strokeOpacity === 0)); };
  const P = [...svg.querySelectorAll('[data-ws]')].filter(g => !g.dataset.placed); const out = [];
  for (const g of P) { let r = null; for (const c of [g, ...g.querySelectorAll('*')]) { if (!(c instanceof SVGGeometryElement) || blank(c)) continue; const b = c.getBoundingClientRect(); if (!b.width && !b.height) continue; r = r ? { l: Math.min(r.l, b.left), t: Math.min(r.t, b.top), r: Math.max(r.r, b.right), b: Math.max(r.b, b.bottom) } : { l: b.left, t: b.top, r: b.right, b: b.bottom }; }
    if (!r) continue; const cy = (r.t + r.b) / 2;
    for (const x of [r.l + 4, r.r - 4]) { const e = document.elementsFromPoint(x, cy).find(e => e instanceof SVGElement && svg.contains(e) && e !== svg && !blank(e)); if (e && (e === g || g.contains(e))) out.push([P.indexOf(g), x, cy]); } }
  P.forEach((g, i) => g.dataset.e = i); return out; }"""
# وزرّ «دوّري» لا يغطّي ظلاً ولا قطعة ولا علامتي الباب والنافذة (الفحص المستقل C2 لبوابة S1-U4: في «غرفة الأطفال» غطّى أعلى ظلّ المربّع وأخذ لمسة حافّته)
BARLAP = """() => { const bar = document.querySelector('#stage .wsbar'); if (!bar || bar.hidden) return []; const b = bar.getBoundingClientRect();
  return [...document.querySelectorAll('#stage svg [data-shadow], #stage svg [data-ws], #stage svg [data-wsmark]')].filter(g => { const r = g.getBoundingClientRect(); return r.width && b.right > r.left && b.left < r.right && b.bottom > r.top && b.top < r.bottom; })
    .map(g => g.dataset.shadow || g.dataset.ws || g.dataset.wsmark); }"""
async def run(p, dev, rev, kbd=False):   # kbd: القطعة والتدوير والظلّ بلوحة المفاتيح (المسافة ثم Enter)، على الجهاز الثالث (الفحص المستقل E2: لا فحص يضغط مفتاحاً على قطع الورشة)
  b = await p.chromium.launch(); ctx = await b.new_context(**p.devices[dev]); pg = await ctx.new_page(); errs = []
  pg.on('pageerror', lambda e: errs.append(str(e)))
  await pg.goto('file://' + os.path.abspath(FILE) + '#fast&seed=7'); await pg.wait_for_timeout(300)
  await pg.evaluate("""() => { localStorage.clear(); localStorage.setItem('hp_kids', JSON.stringify([{ id: 'k1', name: 'سلمى', gender: 'f' }])); localStorage.setItem('hp_kid', JSON.stringify('k1'));
    localStorage.setItem('hp_settings:k1', JSON.stringify({ sessionMax: 0, muted: true })); localStorage.setItem('hp_prog:k1', JSON.stringify({ schema: 3, unlockAll: true })); }""")
  await pg.reload(); await pg.wait_for_timeout(500)
  puzzles = await pg.evaluate("() => UNITS.filter(u => WS[u.id]).flatMap(u => WS[u.id].puzzles.map((P, i) => [u.id, i, P.id]))")
  for uid, i, pid in puzzles:
    await pg.evaluate("([uid, i]) => { hush(); CUR = null; FLOW++; show('lesson'); window.__wsDone = false; wsPuzzle(UNITS.find(u => u.id === uid), WS[uid].puzzles[i], i).then(() => { window.__wsDone = true; }); }", [uid, i])
    await pg.wait_for_timeout(400)
    stolen = []
    for i0, x, y in await pg.evaluate(EDGES):
      await pg.touchscreen.tap(x, y); await pg.wait_for_timeout(80)
      got = await pg.evaluate("() => { const g = document.querySelector('#stage svg .wssel'); return g ? +g.dataset.e : null; }")
      if got != i0: stolen.append('%s → %s' % (i0, got))
    check(not stolen, '%s %s %s: لمسة قرب حافة كل قطعة على الرفّ تختارها هي%s' % (dev, uid, pid, '' if not stolen else ': ' + ', '.join(stolen[:4])))
    bl = await pg.evaluate(BARLAP)
    check(not bl, '%s %s %s: زرّ «دوّري» لا يغطّي ظلاً ولا قطعة ولا الباب والنافذة%s' % (dev, uid, pid, '' if not bl else ': ' + ', '.join(bl)))
    # والألواح على الرفّ بنسب أطوالها (الفحص المستقل C1 لبوابة S1-U4: التدوير على الرفّ صغّرها إلى طول واحد فمُحيت المقارنة)
    rat = await pg.evaluate("() => [...document.querySelectorAll('#stage svg [data-ws=plank]')].filter(g => !g.dataset.placed).map(g => { let r = null; for (const c of g.querySelectorAll('*')) { if (!(c instanceof SVGGeometryElement) || c.matches('rect.hit')) continue; const b = c.getBoundingClientRect(); if (!b.width) continue; r = r ? { l: Math.min(r.l, b.left), t: Math.min(r.t, b.top), r: Math.max(r.r, b.right), b: Math.max(r.b, b.bottom) } : { l: b.left, t: b.top, r: b.right, b: b.bottom }; } return [+g.dataset.size, Math.max(r.r - r.l, r.b - r.t) / +g.dataset.size]; })")
    if rat:
      rs = [r for _, r in rat]; check(max(rs) / min(rs) < 1.06, '%s %s %s: الألواح على الرفّ بنسب أطوالها (%s)' % (dev, uid, pid, ', '.join('%d:%.2f' % (k, r) for k, r in rat)))
    shadows = await pg.evaluate("() => [...document.querySelectorAll('#stage svg [data-shadow]')].map((g, j) => (g.dataset.j = j, [j, g.dataset.shadow, +g.dataset.size, +g.dataset.rot]))")
    order = list(reversed(shadows)) if rev else shadows; bad = []
    for j, k, size, rot in order:
      pc = await pg.evaluate("([k, size]) => { const g = [...document.querySelectorAll('#stage svg [data-ws]')].find(g => g.dataset.ws === k && +g.dataset.size === size && !g.dataset.placed && !g.dataset.extra); if (!g) return null; g.dataset.pick = 1; return true; }", [k, size])
      if not pc: bad.append('%s: no piece' % j); continue
      if kbd:
        fo = await pg.evaluate("() => { const g = document.querySelector('#stage svg [data-pick]'); g.focus(); return document.activeElement === g; }")
        if not fo: bad.append('%s: القطعة لا تأخذ التركيز' % j); continue
        await pg.keyboard.press('Space'); await pg.wait_for_timeout(120)
        if not await pg.evaluate("() => !!document.querySelector('#stage svg [data-pick].wssel, #stage svg .wssel[data-pick]')"): bad.append('%s: المسافة لا تختار القطعة' % j)
      else:
        xy = await pg.evaluate("(c) => (new Function('e', 'return (' + c + ')(e)'))(document.querySelector('#stage svg [data-pick]'))", CENTER)
        await pg.touchscreen.tap(*xy); await pg.wait_for_timeout(120)
      # الدوران حتى يطابق الظلّ (اللوح بتماثل 180، والأشكال بتماثلها)، بزرّ «دوّر» باللمس
      for _ in range(4):
        need = await pg.evaluate("([rot]) => { const g = document.querySelector('#stage svg [data-pick]'); const m = (g.querySelector('g') || g).getAttribute('transform') || ''; const r = +((m.match(/rotate\\(([-\\d.]+)\\)/) || [0, 0])[1]); const s = ROTSYM[g.dataset.ws] || 1; return s !== 1 && (((r - rot) % s) + s) % s !== 0; }", [rot])
        if not need: break
        bx = await pg.evaluate("() => { const b = document.querySelector('#wsRot'); if (!b) return null; const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }")
        if not bx: break
        if kbd: await pg.evaluate("() => document.querySelector('#wsRot').focus()"); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
        else: await pg.touchscreen.tap(*bx); await pg.wait_for_timeout(100)
      if kbd:
        fo = await pg.evaluate("(j) => { const g = document.querySelector('#stage svg [data-j=\"' + j + '\"]'); g.focus(); return document.activeElement === g; }", str(j))
        if not fo: bad.append('%s: الظلّ لا يأخذ التركيز' % j)
        await pg.keyboard.press('Enter'); await pg.wait_for_timeout(200)
      else:
        sxy = await pg.evaluate("([c, j]) => (new Function('e', 'return (' + c + ')(e)'))(document.querySelector('#stage svg [data-j=\"' + j + '\"]'))", [CENTER, str(j)])
        await pg.touchscreen.tap(*sxy); await pg.wait_for_timeout(200)
      filled = await pg.evaluate("(j) => !!document.querySelector('#stage svg [data-j=\"' + j + '\"]').dataset.filled", str(j))
      await pg.evaluate("() => { const g = document.querySelector('#stage svg [data-pick]'); if (g) delete g.dataset.pick; }")
      if not filled: bad.append('%s (%s %s): %s الظلّ لم تملأه' % (j, k, size, 'Enter على' if kbd else 'لمسة'))
    for _ in range(80):
      if await pg.evaluate("() => window.__wsDone"): break
      await pg.wait_for_timeout(50)
    done = await pg.evaluate("() => window.__wsDone")
    bar = await pg.evaluate("() => !!document.querySelector('#wsRot')")
    check(not bad and done and not bar, '%s %s %s (%s): القطعة ثم ظلّها %s%s، واللغز يُحلّ ويُزال زرّ التدوير' % (dev, uid, pid, 'بالعكس' if rev else 'بالترتيب', 'بلوحة المفاتيح' if kbd else 'باللمس', '' if not bad else ': ' + '; '.join(bad[:3])))
  await b.close(); check(not errs, '%s: بلا أخطاء صفحة %s' % (dev, errs[:2]))
async def main():
  async with async_playwright() as p:
    for n, dev in enumerate(DEVICES): await run(p, dev, n % 2 == 1, kbd=n == 2 or (len(DEVICES) == 1 and os.environ.get('KBD') == '1'))
  print('FAILS:', len(FAILS)); sys.exit(1 if FAILS else 0)
asyncio.run(main())
