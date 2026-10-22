# كل بند يُقيَّم أو يُراجَع، بندًا بندًا وفي سياق درسه (الفحص المستقل C، ن-ح1): السائق الآلي يمرّ بالمسار، والمراجعة فيه لا تبلغ إلا البند الأول
# من مخزون كل درس (والثاني بعد خطأ)، فبند المراجعة الثاني في الدرس 6 من S1-U3 كان يوقف الدرس («جملة غير موجودة: gen.numw.21») ولم يره فحص.
# هنا يُشغَّل كل بند في الدروس كلها مرتين، صحيحًا ثم خطأً (والخطأ بالدرجات الأربع حيث المساعدة، ثم التوأم صحيحًا):
#   مخزون المراجعة (review)، وبنود اختبار الوحدة (test)، وبنود الإتقان والبند المختلط (mastery)، وبنود العلاج (remedial).
# والمطلوب: كل بند ينتهي بلا خطأ في الصفحة ولا شاشة انهيار، وحكمه كما أُجيب (الصحيح صحيح، والخطأ خطأ)، وكل توأم يُشغَّل بعد الكشف في العلاج.
# وكل طريق مرسوم في «أيّ وصف يوصل؟» لا يمسّ إلا أشياءه في دورها، وما في اليد مرفوع واليد عليه (بالرسم الحقيقي).
# python3 test/items_run.py   (FILE=نسخة فحص أخرى، ONLY=m1.u3.d6,… دروس بعينها)
import asyncio, os, sys
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
FILE = os.environ.get('FILE', os.path.join(HERE, '..', 'dist', 'واحة_الرياضيات.dev.html'))
ONLY = [x for x in os.environ.get('ONLY', '').split(',') if x]
FAILS = []
def check(ok, what): print(('ok   ' if ok else 'FAIL ') + what); (None if ok else FAILS.append(what))
LIST = """(only) => { const out = []; for (const id of UNITS.flatMap(u => u.lessons)) { if (only.length && !only.includes(id)) continue; const L = LDATA[id], M = L.mastery || {};
  (L.review || []).forEach((it, i) => out.push([id, id, 'review', 'rv' + i, it]));
  ((L.test && L.test.items) || []).forEach(q => out.push([id, id, 'test', q.id, q.item]));
  for (const [c, a] of Object.entries(M.concepts || {})) a.forEach((it, i) => out.push([id, id, 'mastery', c + '.' + i, it]));
  if (M.mixed) out.push([id, M.mixed.lesson, 'mastery', 'mixed', M.mixed.item]);   /* البند المشتبك بإعدادات درسه وجمله (50_flow) */
  for (const [c, a] of Object.entries(M.remedial || {})) a.forEach((it, i) => out.push([id, id, 'remedial', 'rm.' + c + '.' + i, it])); }
  window.__ITEMS = out; return out.map(([id, cur, mode, k], n) => [id, mode, k, n]); }"""
START = """(n) => { const [id, cur, mode, k, it] = window.__ITEMS[n]; hush(); CUR = LDATA[cur]; FLOW++; show('lesson'); SCENE_NOW = 'items:' + id; window.__res = null; window.__fails = 0;
  if (!window.__la) { window.__la = logAttempt; logAttempt = a => { if (a && a.ok === false && a.scene === 'items') window.__fails++; return window.__la(a); }; }   /* محاولات البند الخاطئة (لا التوأم: مشهده items-twin) */
  runItem(JSON.parse(JSON.stringify(it)), mode, { scene: 'items' }).then(r => { window.__res = { ok: r.ok, first: r.firstTry }; }, e => { window.__res = { err: String(e && e.message || e) }; }); }"""
STATE = """() => { const a = window.__auto; const c = document.querySelector('#crashCover'); const go = document.querySelector('#go');
  return { res: window.__res, auto: a ? { n: a.n, kind: a.kind, wrong: !!a.wrong } : null, twin: !!window.__itemTwin, fails: window.__fails || 0, crash: !!c && !c.hidden, go: !!go && !go.disabled && !go.hidden && !go.classList.contains('idle') }; }"""
ROUTES = r"""async () => { const found = []; const walk = (v, id) => { if (Array.isArray(v)) return v.forEach(x => walk(x, id)); if (!v || typeof v !== 'object') return;
    if (v.t === 'routePick') found.push([id, v]); for (const [k, x] of Object.entries(v)) if (k !== 'lines' && k !== 'labels') walk(x, id); };
  for (const id of UNITS.flatMap(u => u.lessons)) walk(LDATA[id], id); const out = [];
  for (const [id, spec] of found) { hush(); FLOW++; CUR = LDATA[id]; show('lesson'); const it = ITEM.routePick.make(JSON.parse(JSON.stringify(spec))); ITEM.routePick.ask(it, 'explore', 0);
    await new Promise(r => setTimeout(r, 120)); const svg = document.querySelector('#stage svg'), path = [...svg.querySelectorAll('path')].find(p => p.getAttribute('stroke') === '#c94f3d');
    const m = path.getScreenCTM(), P = path.getAttribute('d').slice(1).split('L').map(t => { const [x, y] = t.trim().split(/\s+/).map(Number); const p = svg.createSVGPoint(); p.x = x; p.y = y; return p.matrixTransform(m); });
    const pieces = [...svg.querySelectorAll('[data-piece]')], cut = [];
    /* كل قطعة من الخط لا تمسّ إلا الشيء الذي تخرج منه والشيء الذي تتّجه إليه (data-stops في الرسم)، فلا يمرّ الطريق بشيء ليس عليه، ولا بشيء من أشيائه قبل دوره
       (الفحص المستقل D: كانت القطعة تُعفى إن كان أحد طرفيها داخل شيء، فمرّ طريق «إلى السجادة ثم السرير» بالسرير أولاً لأن المنعطف داخله) */
    const stops = (path.getAttribute('data-stops') || '').split(','); if (stops.length !== P.length) { out.push([id, spec.q, 'لا data-stops للخط']); continue; }
    const toward = j => stops.slice(j).find(Boolean);
    spec.lay.items.forEach((li, i) => { const key = li.id || li.k; const b = pieces[i].getBoundingClientRect(), e = 2, L = b.left + e, R = b.right - e, T = b.top + e, B = b.bottom - e;
      for (let j = 1; j < P.length; j++) { if (key === stops[j - 1] || key === toward(j)) continue; const a = P[j - 1], c = P[j]; let t0 = 0, t1 = 1, ok = true; const dx = c.x - a.x, dy = c.y - a.y;   /* قصّ القطعة المستقيمة بالمستطيل (Liang–Barsky) */
        for (const [p, q] of [[-dx, a.x - L], [dx, R - a.x], [-dy, a.y - T], [dy, B - a.y]]) { if (p === 0) { if (q < 0) { ok = false; break; } continue; } const r = q / p; if (p < 0) { if (r > t1) { ok = false; break; } t0 = Math.max(t0, r); } else { if (r < t0) { ok = false; break; } t1 = Math.min(t1, r); } }
        if (ok && t1 - t0 > 1e-6) { cut.push((spec.path || []).includes(key) ? 'يمرّ بـ' + key + ' قبل دوره' : 'يقطع ' + key + ' وليس عليه'); break; } } });
    out.push([id, spec.q, cut.join('، ')]); }
  hush(); FLOW++; return out; }"""
# وما في اليد في «ما الذي في يده…؟» مرفوع عن الأرض واليد عليه (الفحص المستقل C، ن-ك3؛ وD: لم يكن له فحص)
HOLDS = r"""async () => { const found = []; const walk = (v, id) => { if (Array.isArray(v)) return v.forEach(x => walk(x, id)); if (!v || typeof v !== 'object') return;
    if (v.t === 'lrTap' && v.ask === 'hold') found.push([id, v]); for (const [k, x] of Object.entries(v)) if (k !== 'lines' && k !== 'labels') walk(x, id); };
  for (const id of UNITS.flatMap(u => u.lessons)) walk(LDATA[id], id); const out = [];
  for (const [id, spec] of found) { hush(); FLOW++; CUR = LDATA[id]; show('lesson'); const it = ITEM.lrTap.make(JSON.parse(JSON.stringify(spec))); ITEM.lrTap.ask(it, 'explore', 0);
    await new Promise(r => setTimeout(r, 120)); const svg = document.querySelector('#stage svg'), kid = svg.querySelector('[data-kid]'); const bad = [];
    const ty = g => +((g.getAttribute('transform') || '').match(/translate\(\s*[-\d.]+[ ,]+([-\d.]+)/) || [0, NaN])[1], feet = ty(kid);   /* مرسى الشيء أسفله، ومرسى الطفل قدماه (بوحدات الرسم) */
    for (const side of Object.keys(spec.hold)) { const th = [...svg.querySelectorAll('[data-thing]')].find(g => g.dataset.thing === spec.hold[side] && !kid.contains(g)), hd = kid.querySelector('[data-hand="' + side + '"]');
      if (!th || !hd) { bad.push(side + ': لا شيء أو لا يد'); continue; } const t = th.getBoundingClientRect(), h = hd.getBoundingClientRect(), hx = (h.left + h.right) / 2, hy = (h.top + h.bottom) / 2;
      if (!(ty(th) <= feet - 12)) bad.push(side + ': على الأرض (' + ty(th) + ' من ' + feet + ')'); if (hx < t.left - 6 || hx > t.right + 6 || hy < t.top - 6 || hy > t.bottom + 6) bad.push(side + ': اليد ليست عليه'); }
    out.push([id, spec.q, bad.join('، ')]); }
  hush(); FLOW++; return out; }"""
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); ctx = await b.new_context(**p.devices['Pixel 5']); pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.goto('file://' + os.path.abspath(FILE) + '#fast&seed=7'); await pg.wait_for_timeout(300)
    await pg.evaluate("""() => { localStorage.clear(); localStorage.setItem('hp_kids', JSON.stringify([{ id: 'k1', name: 'سلمى', gender: 'f' }])); localStorage.setItem('hp_kid', JSON.stringify('k1'));
      localStorage.setItem('hp_settings:k1', JSON.stringify({ sessionMax: 0, muted: true })); localStorage.setItem('hp_prog:k1', JSON.stringify({ schema: 3, unlockAll: true })); }""")
    await pg.reload(); await pg.wait_for_timeout(500)
    items = await pg.evaluate(LIST, ONLY); counts = {}; twins = 0; need_twins = 0
    for lid, mode, key, n in items:
      for how in ('ok', 'wrong'):
        e0 = len(errs); await pg.evaluate(START, n); last = -1; wrongs = 0; t_seen = False; t0 = 0; res = None
        for _ in range(1200):
          st = await pg.evaluate(STATE)
          if st['crash'] or len(errs) > e0: break
          if st['res']: res = st['res']; break
          a = st['auto']
          if a and a['n'] != last:
            last = a['n']; t_seen = t_seen or st['twin']
            h = 'wrong' if how == 'wrong' and not st['twin'] and a['wrong'] and st['fails'] < 4 else 'ok'; wrongs = max(wrongs, st['fails'] + (h == 'wrong'))   # بالمحاولات المحكومة لا بالانتظارات (البند بخطوتين)
            await pg.evaluate("(h) => { const a = window.__auto; if (a) (h === 'wrong' && a.wrong ? a.wrong : a.ok)(); }", h); t0 = 0; continue
          if st['go']: await pg.click('#go'); continue
          t0 += 1; await pg.wait_for_timeout(25)
        tag = '%s %s %s (%s)' % (lid, mode, key, how)
        bad = errs[e0:]
        if bad or not res or res.get('err'): check(False, '%s: %s' % (tag, (bad[:1] or [res and res.get('err') or 'لم ينتهِ البند'])[0][:160])); continue
        want = how == 'ok' or wrongs == 0   # بند لا خطأ مقصوداً له (a.wrong) يُجاب صحيحًا في الحالتين
        if res['ok'] != want and mode != 'remedial': check(False, '%s: الحكم %s والجواب %s' % (tag, res['ok'], how)); continue
        if mode == 'remedial' and how == 'wrong' and wrongs >= 4: need_twins += 1; twins += t_seen; (None if t_seen else check(False, '%s: بلغ الكشف ولم يُشغَّل توأمه' % tag))
        counts[mode] = counts.get(mode, 0) + 1
    # والطريق المرسوم في «أيّ وصف يوصل؟» لا يقطع قطعةً ليست عليه (الفحص المستقل C، ن-ك6: طريق توأم في الدرس 4 مرّ عبر السرير، فالوصف «الصحيح» خطأ بالصورة):
    # كل بند routePick في المحتوى كله (الاكتشاف والتمرين والتوائم والاختبار)، بالرسم الحقيقي على الشاشة
    routes = await pg.evaluate(ROUTES); bad_routes = [r for r in routes if r[2]]
    for lid, q, cut in bad_routes: check(False, '%s: طريق «%s»: %s' % (lid, q, cut))
    check(bool(routes) and not bad_routes, 'الطرق المرسومة (%d) لا تقطع قطعةً ليست عليها، ولا تمرّ بقطعة منها قبل دورها' % len(routes))
    holds = await pg.evaluate(HOLDS); bad_holds = [r for r in holds if r[2]]
    for lid, q, why in bad_holds: check(False, '%s: «%s»: %s' % (lid, q, why))
    check(bool(holds) and not bad_holds, 'ما في اليد (%d بنود) مرفوع واليد عليه' % len(holds))
    await b.close()
    print('items run:', ', '.join('%s %d' % kv for kv in sorted(counts.items())), '| remedial twins %d of %d' % (twins, need_twins))
    check(sum(counts.values()) == 2 * len(items), 'كل البنود (%d بنداً × صحيح وخطأ) انتهت بلا خطأ' % len(items))
  print('FAILS:', len(FAILS)); sys.exit(1 if FAILS else 0)
asyncio.run(main())
