# السائق الآلي للمحرّك v2: يقرأ window.__auto (كل انتظار لفعل الطفل يسجّل حلّه الصحيح وخطأً مقصوداً) ويضغط «التالي».
# الاستعمال: python3 test/auto_run.py [ok|mixed|deep|failmastery|failtest|replay] [mat|screen] [f|m] [عدد الدروس]
#   ok: كل جواب صحيح · mixed: أول مرة لكل نوع بند يخطئ ثم يصيب (يمرّ بالتلميح الثلاثي) · failmastery: يخطئ في كل بنود الإتقان (التأجيل بعد دورتين)
#   deep: أربعة أخطاء لكل نوع في التمرين · failtest: ثلاثة أخطاء في اختبار الوحدة ثم المراجعة والإعادة · replay: المسار كله ثم كل درس مرة ثانية في الجلسة نفسها
import asyncio, json, os, sys, time
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
FILE = os.environ.get('FILE', os.path.join(HERE, '..', 'dist', 'واحة_الرياضيات.dev.html'))
OUT = os.environ.get('OUT', os.path.join(HERE, 'out', 'auto')); os.makedirs(OUT, exist_ok=True)
MODE = sys.argv[1] if len(sys.argv) > 1 else 'ok'; PATH = sys.argv[2] if len(sys.argv) > 2 else 'screen'; GENDER = sys.argv[3] if len(sys.argv) > 3 else 'f'
MAXL = int(sys.argv[4]) if len(sys.argv) > 4 else 99; SEED = os.environ.get('SEED', '7'); SHOTS = os.environ.get('SHOTS', '1') == '1'
URL = 'file://' + os.path.abspath(FILE) + '#fast&seed=' + SEED
STATE = """() => { const q = s => document.querySelector(s); const vis = s => { const e = q(s); return !!e && !e.hidden; };
  const a = window.__auto; return { scene: window.__scene || '', home: vis('#home'), lesson: vis('#lesson'), covers: [...document.querySelectorAll('.cover')].filter(c => !c.hidden).map(c => c.id),
    go: !!(q('#go') && !q('#go').disabled && !q('#go').classList.contains('idle')), auto: a ? { kind: a.kind, n: a.n, scene: a.scene } : null, mode: window.__itemMode || '', itype: window.__item ? window.__item.itype : '',
    say: q('#say') ? q('#say').textContent : '', crash: (q('#crashCover') && !q('#crashCover').hidden) }; }"""
SMALL = """() => { const out = []; for (const e of document.querySelectorAll('button, [role=button], input')) { const r = e.getBoundingClientRect(); if (!r.width || !r.height || e.closest('[hidden]')) continue;
  if (getComputedStyle(e).visibility === 'hidden') continue; const need = (e.closest('#panel') || e.id === 'adultBtn') ? 44 : 56; const m = Math.min(r.width, r.height);
  if (m < need - 0.5) out.push([e.id || (e.getAttribute('class') || e.tagName), Math.round(r.width), Math.round(r.height), need]); } return out; }"""
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); ctx = await b.new_context(**p.devices['Pixel 5'], color_scheme='dark' if os.environ.get('DARK') == '1' else 'light'); pg = await ctx.new_page(); errs = []   # DARK=1: الوضع الليلي
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e) + ' | ' + ' <- '.join(l.strip().split(' (')[0].replace('at ', '') + ':' + l.rsplit(':', 2)[-2] for l in (e.stack or '').split('\n')[1:9]))); pg.on('console', lambda m: errs.append('console: ' + m.text) if (m.type == 'error' and 'ERR_TUNNEL' not in m.text and 'ERR_NAME' not in m.text) or (m.type == 'warning' and 'keyframe' in m.text.lower()) else None)   # الخط من الشبكة يفشل في البيئة المغلقة فلا يُعدّ
    await pg.goto(URL); await pg.wait_for_timeout(500)
    await pg.evaluate("localStorage.setItem('hp_settings', JSON.stringify({sessionMax: 0}))"); await pg.reload(); await pg.wait_for_timeout(500)
    if SHOTS: await pg.screenshot(path=OUT + '/00_start.png')
    await pg.click('#startBtn'); await pg.wait_for_timeout(300)
    if SHOTS: await pg.screenshot(path=OUT + '/01_profile.png')
    await pg.click('.av[data-av="%s"]' % ('f3' if GENDER == 'f' else 'm2')); await pg.wait_for_timeout(200); await pg.click('#pSave'); await pg.wait_for_timeout(400)
    if SHOTS: await pg.screenshot(path=OUT + '/02_home.png')
    small = {}; replay_q = None; crashes = 0; seen_types = set(); deep = {}; failed_test = {}; shots = set(); report = []; lessons = 0
    while lessons < MAXL:
      target = await pg.evaluate("""() => { const n = document.querySelector('.stop.now'); if (n) return n.dataset.lesson ? ['lesson', n.dataset.lesson] : n.dataset.review ? ['review', 'review'] : null;
        const w = document.querySelector('.stop.ws.must[aria-disabled=false]'); if (w) return ['ws', w.dataset.workshop]; return null; }""")
      if not target and MODE == 'replay' and replay_q is None:   # بعد المسار كله: يُعاد كل درس مرة في الجلسة نفسها (كشف حالة تبقى من التشغيل الأول)
        replay_q = await pg.evaluate("() => UNITS.flatMap(u => u.lessons)")
      if not target and replay_q: target = ['lesson', replay_q.pop(0)]
      if not target: break
      kind, tid = target
      sel = '.stop[data-lesson="%s"]' % tid if kind == 'lesson' else '.stop.review' if kind == 'review' else '.stop.ws[data-workshop="%s"]' % tid
      await pg.click(sel); await pg.wait_for_timeout(200); lessons += 1; t0 = time.time(); last_n = -1; idle = 0; steps = 0; stuck = False; acts = []
      while True:
        st = await pg.evaluate(STATE); steps += 1
        if st['crash']: report.append([tid, 'CRASH', st['scene']]); await pg.screenshot(path=OUT + '/crash_%s.png' % tid.replace('.', '_')); await pg.click('#crashOk'); crashes += 1; break
        if st['home'] and not st['covers']: break
        sc = st['scene']
        if len(acts) > 900: stuck = True; report.append([tid, 'LOOP', sc, st['say'][:60], st['auto']]); await pg.screenshot(path=OUT + '/loop_%s.png' % tid.replace('.', '_')); break   # حلقة بلا نهاية: أفعال كثيرة في درس واحد
        if sc not in shots:
          shots.add(sc); await pg.wait_for_timeout(120)
          if SHOTS: await pg.screenshot(path=OUT + '/s_' + sc.replace(':', '__').replace('.', '_') + '.png')
          sm = await pg.evaluate(SMALL)                 # أهداف اللمس: 56 للطفل (D246)، و44 لرابط الكبار وما في اللوحة
          for x in sm: small.setdefault(tuple(x[:1]), (sc, x))
        if 'exitCover' in st['covers']: await pg.click('#rsGo'); continue
        a = st['auto']
        if a and a['n'] != last_n:
          for x in await pg.evaluate(SMALL): small.setdefault(tuple(x[:1]) + (a['kind'],), (sc, x))   # كل انتظار لفعل الطفل: أهدافه الآن
          last_n = a['n']; how = 'ok'
          if sc.endswith(':bag') or (a['kind'] == 'pick' and 'bag' in sc): how = 'bag'
          elif MODE == 'mixed' and st['mode'] in ('practice', 'explore') and st['itype'] and st['itype'] not in seen_types: seen_types.add(st['itype']); how = 'wrong'
          elif MODE == 'deep' and st['mode'] == 'practice' and st['itype'] and deep.get(st['itype'], 0) < 4: deep[st['itype']] = deep.get(st['itype'], 0) + 1; how = 'wrong'
          elif MODE == 'failtest' and st['mode'] == 'test' and failed_test.setdefault(sc.split(':')[0], 0) < 3: failed_test[sc.split(':')[0]] += 1; how = 'wrong'
          elif MODE == 'failmastery' and st['mode'] == 'mastery': how = 'wrong'
          if how == 'bag': await pg.evaluate("""(p) => { const b = [...document.querySelectorAll('.choices .pick')]; (b.find(x => x.dataset.k === p) || b[0]).click(); }""", PATH)
          else: await pg.evaluate("(h) => { const a = window.__auto; if (a) (h === 'wrong' && a.wrong ? a.wrong : a.ok)(); }", how)
          acts.append((sc, a['kind'], how)); idle = 0; await pg.wait_for_timeout(40); continue
        if st['go']: await pg.click('#go'); idle = 0; await pg.wait_for_timeout(30); continue
        idle += 1; await pg.wait_for_timeout(50)
        if idle > 300: stuck = True; report.append([tid, 'STUCK', sc, st['say'][:60], st['auto']]); await pg.screenshot(path=OUT + '/stuck_%s.png' % tid.replace('.', '_')); break
      prog = await pg.evaluate("(id) => { const k = Object.keys(localStorage).find(k => k.startsWith('hp_prog:')); const P = JSON.parse(localStorage.getItem(k) || '{}'); return P[id] || null; }", tid)
      report.append([tid, 'done' if not stuck else 'stuck', round(time.time() - t0, 1), 'acts=%d' % len(acts), json.dumps({k: prog.get(k) for k in ('done', 'mastered', 'deferred', 'entry', 'path', 'score', 'of')} if prog else None, ensure_ascii=False)])
      print('..', *report[-1], flush=True)              # تقدّم مرئي أثناء التشغيل الطويل
      if stuck or crashes > 2: break
    errlog = await pg.evaluate("() => { const k = Object.keys(localStorage).find(k => k.startsWith('hp_log:')); const L = JSON.parse(localStorage.getItem(k) || '{}'); return (L.errors || []).map(e => e.scene + ' ' + e.msg.split('file:').map((x,i)=>i? x.slice(x.indexOf('.html:')+6):x).join('@').slice(0, 900)); }")
    bad = await pg.evaluate("() => { const k = Object.keys(localStorage).find(k => k.startsWith('hp_log:')); const L = JSON.parse(localStorage.getItem(k) || '{}'); return (L.attempts || []).filter(a => a.ok === false && /^(mastery|test|review)/.test(a.scene || '')).map(a => [a.lesson, a.scene, a.type, a.tag, JSON.stringify(a.ans), a.err]); }")
    print('assessment misses:', len(bad)); [print(' ', *x) for x in bad[:40]]
    clips = set(await pg.evaluate("() => window.__clips || []"))
    ids = set(json.load(open(os.path.join(HERE, '..', 'dist', 'script_m1.xlsx.ids.json'))))
    miss = sorted(clips - ids)                       # كل جملة منطوقة لها سطر في جدول التسجيل (القسم 12 من الميثاق)
    print('clips spoken: %d unique, %d of %d recording ids; NOT in script: %d' % (len(clips), len(clips & ids), len(ids), len(miss))); [print('  ', m) for m in miss[:20]]
    await pg.screenshot(path=OUT + '/99_home.png'); await b.close()
    for r in report: print(*r)
    print('errors:', len(errs)); [print(' ', e[:400]) for e in errs[:30]]
    print('LOG.errors:', len(errlog)); [print(' ', e) for e in errlog[:20]]
    print('small targets:', len(small)); [print(' ', *v) for v in list(small.values())[:30]]
asyncio.run(main())
