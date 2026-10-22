# D255 للأشياء المبعثرة ولـ«لمس واحد». يخرج بـ 1 مع أي إخفاق. الاستعمال: python3 test/layout_run.py [ملف] [جولات]
#   (أ) مشهد «ابحث في الغرفة» (m1.u2.d6) نفسه جولاتٍ كثيرة على ثلاث شاشات. في كل انتظار: لا يتراكب رسما شيئين، ولا يأخذ مركزَ رسم شيءٍ غيرُه
#       (كما يوجّه tapOne فعلاً)، ولكل شيء منطقة لمس واحدة لا تبلغ رسم جاره. وفي جولة من كل ثلاث يخطئ الطفل مرتين قبل الصواب، وفي بعض الجولات
#       تُدار الشاشة ثم تُعاد: فلا تكبر المنطقة عن حجمها في المحاولة الأولى (كانت تتكدّس وتكبر 12 وحدة مع كل سؤال، وتتضاعف مع كل تدوير).
#   (ب) لمس حقيقي على رسم مرئي: شيئان متراكبان عمداً لكل زوج من أشياء الغرفة العشرة (بُعد المركزين 40 في كل محور، ومنطقة اللمس 90)،
#       وشرطٌ مسبق أن منطقة الثاني فوق مركز الأول فعلاً؛ ويُلمس مركز رسم كل منهما بالإصبع فيجب أن يصل إليه هو.
#   (ج) لمس حقيقي على منطقتين شفافتين فقط بين شيئين متجاورين: يذهب إلى الأقرب رسماً (لا إلى المنطقة العليا)، ويُشترط أن يكون الأقربُ
#       هو الأسفلَ في عشر حالات على الأقل، وإلا لم يُختبر شيء.
#   (د) شيء مرئي ليس هدفاً بين منطقتين يحجب ما تحته: اللمسة عليه لصاحب المنطقة التي فوقه، لا لشيء مختبئ تحته وإن كان أقرب.
#   (هـ) الشيء المسؤول عنه يقع في الخانات الست بالتساوي تقريباً (300 غرفة)، والغرفة لا تقبل أكثر من ستة أشياء.
#   (و) hitPad على الشيء نفسه مرتين يُبقي منطقة واحدة بأكبر الحدّين، ومنطقة شيءٍ فيه شيء له منطقة تُقاس من الرسم وحده.
#   (ز) هدف داخل هدف: اللمسة على رسم الداخل له، وعلى رسم الخارج للخارج. (ح) شكل لا يُرى (شفافية صفر) من هدفٍ فوق رسم هدفٍ آخر لا يأخذ لمسته.
#   وفي (أ) أيضاً: كل رسم داخل المسرح بهامش 8 وحدات على الأقل من حافته.
#   (ط) ضمانات التخطيط نفسه في 5000 غرفة (layoutPts 'rows'): بين جارين في صف 90 على الأقل، وبين صفّين 90 في أحد المحورين، والمراكز في x 48–312 وy 65–235.
import asyncio, os, sys, json
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
FILE = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'dist', 'واحة_الرياضيات.dev.html'))
ROUNDS = int(sys.argv[2]) if len(sys.argv) > 2 else 60; DEVICES = ['Galaxy S5', 'iPhone SE', 'Pixel 5']
# إطار الرسم المرئي بالبكسل، بقياس مستقل عن التطبيق: كل شكل أو نص يُرى (لونه أو حدّه غير شفاف)، بلا مناطق اللمس
LIB = """const seen = e => { if (e.matches('rect.hit')) return false; const cs = getComputedStyle(e), clear = v => !v || v === 'none' || v === 'transparent' || /^rgba\\(.*,\\s*0\\)$/.test(v);
    if (+cs.opacity === 0) return false; return !((clear(cs.fill) || +cs.fillOpacity === 0) && (clear(cs.stroke) || +cs.strokeOpacity === 0 || parseFloat(cs.strokeWidth) === 0)); };
  const box = g => { let r = null; for (const e of g.querySelectorAll('circle,ellipse,rect,polygon,path,line,polyline,text')) { if (!seen(e)) continue;
    const b = e.getBoundingClientRect(); if (!b.width && !b.height) continue; r = r ? { l: Math.min(r.l, b.left), t: Math.min(r.t, b.top), r: Math.max(r.r, b.right), b: Math.max(r.b, b.bottom) } : { l: b.left, t: b.top, r: b.right, b: b.bottom }; } return r; };
  const pads = g => [...g.querySelectorAll(':scope > rect.hit')]; const rr = e => { const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom }; };
  const meet = (a, q) => Math.min(a.r, q.r) - Math.max(a.l, q.l) > .5 && Math.min(a.b, q.b) - Math.max(a.t, q.t) > .5;
  const far = (r, x, y) => Math.hypot(Math.max(r.l - x, 0, x - r.r), Math.max(r.t - y, 0, y - r.b));"""
START = """(K) => { FLOW++; hush(); const L = LDATA['m1.u2.d6']; CUR = L; show('lesson'); const c = L.flow.find(s => s.scene === 'roomHunt'); if (!c) return 'no roomHunt';
  reseed('layout_run|' + K); window.__lr = 'run'; SCENES.roomHunt({ ...c, after: null, rounds: Array.from({ length: K }, (_, i) => c.rounds[i % c.rounds.length]) }).then(() => window.__lr = 'done', e => window.__lr = 'ERR ' + e.message); return 'ok'; }"""
MEASURE = """(first) => { %s const svg = document.querySelector('#stage svg'); const tg = [...svg.querySelectorAll('[role=button]')].filter(g => g.onclick); const name = g => g.getAttribute('aria-label') || '?'; const out = [];
  const B = tg.map(box); tg.forEach((g, i) => { const r = B[i]; const x = (r.l + r.r) / 2, y = (r.t + r.b) / 2; const e = document.elementFromPoint(x, y); const o = tg.find(t => t === e || t.contains(e));
    if (o && o !== g && !(o.__route && o.__route(x, y) === g)) out.push(['stolen', name(g), name(o)]);
    const P = pads(g); if (P.length !== 1) out.push(['pads', name(g), P.length]);
    if (P.length) { const pr = rr(P[0]); tg.forEach((q, j) => { if (j !== i && meet(pr, B[j])) out.push(['padReach', name(g), name(q)]); });
      const w = Math.round(pr.r - pr.l); if (first) g.__w0 = w; else if (Math.abs(w - g.__w0) > 1) out.push(['padGrow', name(g), g.__w0, w]); }
    for (let j = i + 1; j < tg.length; j++) if (meet(r, B[j])) out.push(['overlap', name(g), name(tg[j])]);
    const S = svg.getBoundingClientRect(), u = svg.getScreenCTM().a, m = Math.min(r.l - S.left, S.right - r.r, r.t - S.top, S.bottom - r.b) / u; if (m < 8) out.push(['edge', name(g), Math.round(m)]); });
  return { n: tg.length, out }; }""" % LIB
PAIR = """([a, b, dx, dy]) => { %s const svg = newStage(300, { oasisOpacity: .1 }); const T = [a, b].map((ref, i) => { const s = make(ref); return { g: fitThing(svg, { ...s, label: null }, 150 + i * dx, 120 + i * dy, 70), k: i, label: ref }; });
  window.__T = T; return T.map(t => { const r = box(t.g); return [(r.l + r.r) / 2, (r.t + r.b) / 2]; }); }""" % LIB
ARM = """(i) => { window.__got = null; tapOne(window.__T, { ok: i, pulse: false, pad: 90 }).then(k => window.__got = k); }"""
PRE_B = """([x, y]) => { const e = document.elementFromPoint(x, y); return !!(e && e.matches('rect.hit') && window.__T[1].g.contains(e)); }"""
# (ج) نقطتا طرفَي الشريط الذي تتقاطع فيه المنطقتان (لا رسم فيهما)، والمتوقَّع الأقرب رسماً
ZONE = """() => { %s const [A, B] = window.__T, pa = rr(pads(A.g)[0]), pb = rr(pads(B.g)[0]), ba = box(A.g), bb = box(B.g); const l = Math.max(pa.l, pb.l) + 1, r = Math.min(pa.r, pb.r) - 1, y = (ba.t + ba.b + bb.t + bb.b) / 4;
  if (r - l < 2) return []; return [l, r].map(x => { const on = document.elementsFromPoint(x, y); const both = [A, B].every(t => on.some(e => e.matches('rect.hit') && t.g.contains(e))); const drawn = on.some(e => [A, B].some(t => t.g.contains(e)) && seen(e));
    const da = far(ba, x, y), db = far(bb, x, y); return { x, y, ok: both && !drawn && Math.abs(da - db) > 2, want: da < db ? 0 : 1 }; }); }""" % LIB
# (د) أنبوب عريض (أ) ثم مستطيل مرئي ليس هدفاً بعد حافته ثم شمعة نحيلة (ب) منطقتها فوق المستطيل: اللمسة على المستطيل للشمعة
BLOCK = """() => { %s const svg = newStage(300, { oasisOpacity: .1 }); const A = { g: fitThing(svg, { ...make('tube'), label: null }, 140, 140, 70), k: 0 };
  const ba = box(A.g), m = svg.getScreenCTM(), u = 1 / m.a; const blk = el('rect', { x: 0, y: 0, width: 1, height: 1, fill: '#9b8a6a' }, svg);
  const B = { g: fitThing(svg, { ...make('candle'), label: null }, 140 + 84, 140, 70), k: 1 }; window.__T = [A, B]; tapOne(window.__T, { ok: 1, pulse: false, pad: 110 }).then(k => window.__got = k); window.__got = null;
  const pb = rr(pads(B.g)[0]), pa = rr(pads(A.g)[0]), bb = box(B.g); const x0 = Math.max(ba.r + 2, pb.l + 2), x1 = Math.min(pa.r, bb.l) - 2;
  const p0 = svg.createSVGPoint(); const toU = (x, y) => { p0.x = x; p0.y = y; return p0.matrixTransform(m.inverse()); }; const q0 = toU(x0, ba.t), q1 = toU(x1, ba.b);
  blk.setAttribute('x', q0.x); blk.setAttribute('y', q0.y); blk.setAttribute('width', Math.max(1, q1.x - q0.x)); blk.setAttribute('height', Math.max(1, q1.y - q0.y));
  const x = (x0 + x1) / 2, y = (ba.t + ba.b) / 2, on = document.elementsFromPoint(x, y); const okPre = x1 - x0 > 3 && on[0] && on[0].matches('rect.hit') && B.g.contains(on[0]) && on.includes(blk) && on.some(e => e.matches('rect.hit') && A.g.contains(e)) && far(ba, x, y) < far(bb, x, y);
  return { x, y, ok: !!okPre }; }""" % LIB
SPREAD = """() => { const c = { n: 6, things: ['cyl', 'tube', 'cube', 'die', 'sphere', 'orange', 'teaBox', 'candle', 'cone'] }; const cnt = [0, 0, 0, 0, 0, 0]; let n7 = 'no error';
  if (typeof roomThings !== 'function') return { cnt, n7: 'roomThings missing' };
  for (let t = 0; t < 300; t++) { const svg = newStage(300, { oasisOpacity: .1 }); const T = roomThings(svg, c, 'cone'); cnt[T.findIndex(x => x.k === 'cone')]++; }
  try { roomThings(newStage(300, {}), { ...c, n: 7 }, 'cone'); } catch (e) { n7 = 'threw'; } return { cnt, n7 }; }"""
PADS = """() => { const svg = newStage(300, { oasisOpacity: .1 }); const out = []; const W = r => Math.round(+r.getAttribute('width'));
  const g = el('g', {}, svg); el('circle', { cx: 100, cy: 100, r: 20, fill: '#c55' }, g); hitPad(g, 76); hitPad(g, 90); const P = g.querySelectorAll(':scope > rect.hit');
  if (P.length !== 1) out.push(['twice', P.length]); else if (+P[0].dataset.min !== 90 || W(P[0]) !== 90) out.push(['twiceSize', P[0].dataset.min, W(P[0])]);
  const h = el('g', {}, svg), c = el('g', {}, h); el('rect', { x: 200, y: 80, width: 30, height: 30, fill: '#5a5' }, c); hitPad(c, 150);
  const one = hitPad(h, 10, 1); const w = W(one); if (Math.abs(w - 42) > 1) out.push(['nested', w]); return out; }"""
NEST = """() => { %s const svg = newStage(300, { oasisOpacity: .1 }); const out = el('g', {}, svg); el('rect', { x: 60, y: 60, width: 240, height: 180, fill: '#d9c9a3' }, out);
  const inn = el('g', {}, out); el('circle', { cx: 180, cy: 150, r: 34, fill: '#4a7fb0' }, inn); window.__T = [{ g: out, k: 0 }, { g: inn, k: 1 }]; const bi = box(inn);
  return [[(bi.l + bi.r) / 2, (bi.t + bi.b) / 2, 1], [rr(out.firstChild).l + 12, rr(out.firstChild).t + 12, 0]]; }""" % LIB
ARMN = """(i) => { window.__got = null; tapOne(window.__T, { ok: i, pulse: false, pad: false }).then(k => window.__got = k); }"""
# (ح) أ مرسوم، ثم ب فيه دائرة مرئية بعيدة ومستطيل لا يُرى (شفافية التعبئة صفر، أو الشفافية كلها صفر) فوق مركز أ: اللمسة على مركز أ لـ أ
GHOST = """(mode) => { %s const svg = newStage(300, { oasisOpacity: .1 }); const A = { g: el('g', {}, svg), k: 0 }; el('circle', { cx: 120, cy: 150, r: 34, fill: '#b5533c' }, A.g);
  const B = { g: el('g', {}, svg), k: 1 }; el('circle', { cx: 260, cy: 150, r: 34, fill: '#4a7fb0' }, B.g);
  el('rect', Object.assign({ x: 90, y: 120, width: 60, height: 60, fill: '#333' }, mode === 'fill' ? { 'fill-opacity': 0 } : { opacity: 0 }), B.g); window.__T = [A, B];
  const a = box(A.g); return [(a.l + a.r) / 2, (a.t + a.b) / 2]; }""" % LIB
ROWS = """() => { let bad = []; for (let t = 0; t < 5000 && bad.length < 5; t++) { const P = layoutPts(6, 'rows', 180, 150, 130);
    P.forEach((p, i) => { if (p.x < 48 - 1e-6 || p.x > 312 + 1e-6 || p.y < 65 || p.y > 235) bad.push(['range', Math.round(p.x), Math.round(p.y)]);
      P.forEach((q, j) => { if (j > i && Math.max(Math.abs(p.x - q.x), Math.abs(p.y - q.y)) < 90 - 1e-6) bad.push(['gap', i, j, Math.round(Math.max(Math.abs(p.x - q.x), Math.abs(p.y - q.y)))]); }); }); }
  return bad; }"""
CLEAN = """() => { AUTO_CLEAR(); (window.__T || []).forEach(t => { t.g.onclick = null; t.g.querySelectorAll(':scope > rect.hit').forEach(h => h.remove()); }); }"""
async def tap_get(pg, x, y):
  await pg.touchscreen.tap(x, y); await pg.wait_for_timeout(20); return await pg.evaluate("() => window.__got")
async def run(p, dev):
  b = await p.chromium.launch(); ctx = await b.new_context(**p.devices[dev]); pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
  vp = p.devices[dev]['viewport']
  await pg.goto('file://' + FILE + '#fast&seed=9'); await pg.wait_for_timeout(400)
  await pg.evaluate("localStorage.setItem('hp_settings', JSON.stringify({sessionMax: 0}))")
  await pg.click('#startBtn'); await pg.click('.av[data-av="f3"]'); await pg.click('#pSave'); await pg.wait_for_timeout(300)
  await pg.evaluate("() => { PROG.unlockAll = true; runLesson('m1.u2.d6').catch(() => {}); }"); await pg.wait_for_timeout(800)
  fails = []; st = await pg.evaluate(START, ROUNDS); stats = {'rounds': 0, 'waits': 0, 'rotations': 0}
  if st != 'ok': fails.append(['start', st])
  last = -1; guard = 0; attempt = 0
  while st == 'ok' and stats['rounds'] < ROUNDS and guard < ROUNDS * 200:   # (أ)
    guard += 1; a = await pg.evaluate("() => window.__auto ? { n: window.__auto.n, k: window.__auto.kind } : null")
    if a and a['k'] == 'tap' and a['n'] != last:
      last = a['n']; r = stats['rounds']; stats['waits'] += 1
      if attempt > 0 and r % 10 == 4:                     # تدوير الشاشة ثم إعادتها في منتصف الجولة
        await pg.set_viewport_size({'width': vp['height'], 'height': vp['width']}); await pg.wait_for_timeout(250)
        await pg.set_viewport_size(vp); await pg.wait_for_timeout(250); stats['rotations'] += 1
      m = await pg.evaluate(MEASURE, attempt == 0)
      if m['n'] != 6: fails.append(['targets', m['n']])
      fails += [['round %d.%d' % (r + 1, attempt + 1)] + x for x in m['out']]
      if r % 3 == 0 and attempt < 2: attempt += 1; await pg.evaluate("() => window.__auto.wrong()")
      else: attempt = 0; stats['rounds'] += 1; await pg.evaluate("() => window.__auto.ok()")
    await pg.wait_for_timeout(25)
  if stats['rounds'] < ROUNDS: fails.append(['rounds', stats['rounds'], await pg.evaluate("() => window.__lr")])
  await pg.evaluate("() => { FLOW++; hush(); reseed('layout_run|pairs'); }"); await pg.wait_for_timeout(300)
  things = await pg.evaluate("() => LDATA['m1.u2.d6'].flow.find(s => s.scene === 'roomHunt').things"); stats.update(taps=0, zone=0, zoneLower=0)
  for a in things:
    for bb in things:
      if a == bb: continue
      C = await pg.evaluate(PAIR, [a, bb, 40, 40])          # (ب)
      await pg.evaluate(ARM, 0)
      if not await pg.evaluate(PRE_B, C[0]): fails.append(['pre(b)', a, bb])
      await pg.evaluate(CLEAN)
      for i, (x, y) in enumerate(C):
        await pg.evaluate(ARM, i); got = await tap_get(pg, x, y); stats['taps'] += 1
        if got != i: fails.append(['tap(b)', [a, bb][i], 'got', None if got is None else [a, bb][got]])
        await pg.evaluate(CLEAN)
      await pg.evaluate(PAIR, [a, bb, 82, 0])               # (ج)
      await pg.evaluate(ARM, 0); Z = await pg.evaluate(ZONE); await pg.evaluate(CLEAN)
      for z in Z:
        if not z['ok']: continue
        await pg.evaluate(ARM, z['want']); got = await tap_get(pg, z['x'], z['y']); stats['zone'] += 1; stats['zoneLower'] += z['want'] == 0
        if got != z['want']: fails.append(['tap(c)', [a, bb][z['want']], 'got', None if got is None else [a, bb][got]])
        await pg.evaluate(CLEAN)
  if stats['zoneLower'] < 10: fails.append(['zone(c) untested', stats['zone'], stats['zoneLower']])
  K = await pg.evaluate(BLOCK)                               # (د)
  if not K['ok']: fails.append(['pre(d)'])
  else:
    got = await tap_get(pg, K['x'], K['y']); stats['block'] = got
    if got != 1: fails.append(['tap(d)', 'want candle', 'got', got])
  await pg.evaluate(CLEAN)
  S = await pg.evaluate(SPREAD); stats['cells'] = S['cnt']        # (هـ)
  fails += [['hitPad'] + x for x in await pg.evaluate(PADS)]          # (و)
  fails += [['rows'] + x for x in await pg.evaluate(ROWS)]            # (ط)
  for (x, y, want) in await pg.evaluate(NEST):                          # (ز)
    await pg.evaluate(ARMN, want); got = await tap_get(pg, x, y)
    if got != want: fails.append(['nested', 'want', ['outer', 'inner'][want], 'got', got])
    await pg.evaluate(CLEAN)
  for mode in ('fill', 'opacity'):                                      # (ح)
    x, y = await pg.evaluate(GHOST, mode); await pg.evaluate(ARMN, 0); got = await tap_get(pg, x, y)
    if got != 0: fails.append(['ghost', mode, 'got', got])
    await pg.evaluate(CLEAN)
  if max(S['cnt']) > 90 or min(S['cnt']) < 25: fails.append(['spread', S['cnt']])
  if S['n7'] != 'threw': fails.append(['n>6', S['n7']])
  await b.close(); return {'device': dev, 'stats': stats, 'fails': fails, 'errors': errs[:3]}
async def main():
  async with async_playwright() as p:
    bad = 0
    for dev in DEVICES:
      r = await run(p, dev); n = len(r['fails']) + len(r['errors']); bad += n; s = r['stats']
      kinds = {}
      for f in r['fails']: k = f[1] if f[0].startswith('round') else f[0]; kinds[k] = kinds.get(k, 0) + 1
      print(f"{dev}: {s['rounds']} جولة ({s['waits']} انتظاراً، {s['rotations']} تدويراً)، ب {s['taps']} لمسة، ج {s['zone']} لمسة ({s['zoneLower']} للأسفل)، خانات {s.get('cells')} — إخفاق {n}",
            json.dumps(kinds, ensure_ascii=False) if kinds else '')
      for f in r['fails'][:8]: print('  ', json.dumps(f, ensure_ascii=False))
      for e in r['errors']: print('   error', e)
    print('FAILS', bad); sys.exit(1 if bad else 0)
asyncio.run(main())
