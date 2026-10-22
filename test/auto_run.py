# السائق الآلي للمحرّك v2: يقرأ window.__auto (كل انتظار لفعل الطفل يسجّل حلّه الصحيح وخطأً مقصوداً) ويضغط «التالي».
# الاستعمال: python3 test/auto_run.py [ok|mixed|deep|failmastery|failtest|replay] [mat|screen] [f|m] [عدد الدروس]
#   ok: كل جواب صحيح · mixed: أول مرة لكل نوع بند يخطئ ثم يصيب (يمرّ بالتلميح الثلاثي) · failmastery: يخطئ في كل بنود الإتقان (التأجيل بعد دورتين)
#   failreview: خطآن متتاليان في بند المراجعة نفسه (الأول والثاني الفوري) فيُعاد الدرس (المبدأ 14)
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
SMALL = """() => { const out = []; for (const e of document.querySelectorAll('button, [role=button], input, svg g[style*="grab"], svg rect.route')) {   /* وما يُسحب: 64 (D250)؛ والمكدّس يُقاس بمنطقة توجيهه (route) */ const r = e.getBoundingClientRect(); if (!r.width || !r.height || e.closest('[hidden]') || e.dataset.routed) continue;
  if (getComputedStyle(e).visibility === 'hidden' || +getComputedStyle(e).opacity < .5) continue;   
  if (e instanceof SVGElement && getComputedStyle(e).cursor !== 'grab' && !e.onclick) continue;   /* عنصر SVG لم يصر هدفاً بعد (لا فعل له الآن) */   /* ما يختفي بعد الجواب (حركة خروج) ليس هدفاً */
  const need = (e.closest('#panel') || e.id === 'adultBtn') ? 44 : getComputedStyle(e).cursor === 'grab' ? 64 : 56; const m = Math.min(r.width, r.height);
  if (m < need - 0.5) out.push([e.id || (e.getAttribute('class') || e.tagName), Math.round(r.width), Math.round(r.height), need]); } return out; }"""
NONAME = """() => [...document.querySelectorAll('button, [role=button]')].filter(e => { const r = e.getBoundingClientRect(); return r.width && !e.closest('[hidden]') && getComputedStyle(e).visibility !== 'hidden' && !e.disabled && (e.tagName === 'BUTTON' || e.onclick) && !(e.getAttribute('aria-label') || '').trim() && !(e.textContent || '').trim(); }).map(e => e.id || e.getAttribute('class') || e.tagName)"""   # لكل هدف اسم مسموع لقارئ الشاشة
# D255: مركز كل هدف يذهب إليه هو. «سُرق» إن أخذ اللمسَ هدفٌ آخر (إلا قطعة متماثلة في مكانها، data-twin)، و«حُجب» إن وقع على شيء ليس هدفاً، و«وُجّه خطأ» إن وجّهته منطقة مشتركة (route) إلى غيره
TAPS = """() => { const svg = document.querySelector('#stage svg'); if (!svg) return []; const tg = [...svg.querySelectorAll('[role=button]')].filter(g => (g.onclick || getComputedStyle(g).cursor === 'grab') && !g.closest('[hidden]') && +getComputedStyle(g).opacity >= .5);
  const owner = e => { while (e && e !== svg) { if (tg.includes(e)) return e; e = e.parentNode; } return null; }; const name = g => g.dataset.slot || g.getAttribute('aria-label') || g.tagName; const out = [];
  for (const g of tg) { let r = null; if (g.tagName === 'line') { const b = g.getBoundingClientRect(); r = { l: b.left, t: b.top, r: b.right, b: b.bottom }; }   /* هدف هو خطّ (ضلع): منتصفه */
    for (const c of g.querySelectorAll('circle,ellipse,rect,polygon,path,line,polyline,text')) { if (c.matches('rect.hit')) continue; const f = c.getAttribute('fill'), s = c.getAttribute('stroke'); if ((f === 'transparent' || f === 'none') && (!s || s === 'none')) continue;
      const b = c.getBoundingClientRect(); if (!b.width && !b.height) continue; r = r ? { l: Math.min(r.l, b.left), t: Math.min(r.t, b.top), r: Math.max(r.r, b.right), b: Math.max(r.b, b.bottom) } : { l: b.left, t: b.top, r: b.right, b: b.bottom }; }
    if (!r) continue; const x = (r.l + r.r) / 2, y = (r.t + r.b) / 2; if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue; const e = document.elementFromPoint(x, y); if (!e) continue;
    if (e.__route) { if (e.__route(x, y) !== g) out.push(['routed-wrong', name(g)]); continue; }
    const o = owner(e); if (o === g) continue;
    if (o) { if (o.__route && o.__route(x, y) === g) continue; if (!(g.dataset.twin && g.dataset.twin === o.dataset.twin && name(g) === name(o))) out.push(['stolen', name(g), name(o)]); }
    else if (svg.contains(e) || e === svg) out.push(['blocked', name(g), (e.getAttribute('class') || e.tagName)]); }
  return out; }"""
# ما يُسحب في المسرح (g بمؤشّر السحب) ولا رسم مرئياً فيه: منطقة سحب حول لا شيء (كانت في لغز المتجر منطقة سحب فارغة في زاوية المسرح؛ الفحص المستقل الخامس).
# (أهداف اللمس الشفافة فوق رسم ليس هدفاً، كنقاط العدّ ورفّ «أين أكثر؟»، مقصودة فلا تُعدّ هنا)
EMPTY = """() => { const svg = document.querySelector('#stage svg'); if (!svg) return []; const clear = v => !v || v === 'none' || v === 'transparent' || /^rgba\\(.*,\\s*0\\)$/.test(v);
  const seen = e => { if (e.matches('rect.hit')) return false; const cs = getComputedStyle(e); return +cs.opacity !== 0 && !((clear(cs.fill) || +cs.fillOpacity === 0) && (clear(cs.stroke) || +cs.strokeOpacity === 0 || parseFloat(cs.strokeWidth) === 0)); };
  return [...svg.querySelectorAll('g[style*="grab"]')].filter(g => !g.closest('[hidden]') && +getComputedStyle(g).opacity >= .5)
    .filter(g => ![...g.querySelectorAll('circle,ellipse,rect,polygon,path,line,polyline,text,image')].some(e => { if (!seen(e)) return false; try { const k = e.getBBox(); return k.width || k.height; } catch (x) { return true; } }))   /* بإطار الرسم نفسه، لا بحجمه على الشاشة أثناء حركة الدخول */
    .map(g => g.getAttribute('aria-label') || g.dataset.k || g.getAttribute('class') || 'g'); }"""
CARDS = """() => { const c = [...document.querySelectorAll('.choices.cards .card')]; if (!c.length) return null;   /* بطاقتا فوضى: كلتاهما مخفية النص، ومتماثلتان بالنظر (D254 (1)) */
  if (!c.every(b => b.classList.contains('hidden-text'))) return 'card text visible'; return [...new Set(c.map(b => b.innerHTML))].length > 1 ? 'cards differ' : null; }"""
WATCH = """() => { window.__shown = []; const s = document.querySelector('#say'), b = document.querySelector('#bubble'); if (window.__obs) window.__obs.disconnect();   /* كل نصّ تظهره الفقاعة أثناء الإعادة */
  window.__obs = new MutationObserver(() => window.__shown.push([s.textContent, b.classList.contains('hidetext')])); window.__obs.observe(s, { childList: true, characterData: true, subtree: true }); }"""
LEAKED = """() => { const L = CUR && LDATA[CUR.id]; const w = L && L.chaos && L.chaos.wrong; if (!w) return null; const t = G(lineOf(w, L)[2]); if (window.__obs) window.__obs.disconnect();
  const x = (window.__shown || []).find(([s, h]) => !h && s === t); return x ? x[0] : null; }"""
# D256: كل حرف يقرؤه الطفل في الدرس (الفقاعة، والخيارات، والسلال، ونصوص الرسم) يرسمه المتصفح فعلاً بخط القراءة، لا ببديل من خطوط النظام
READ_FONT = 'Waha Naskh'; READ_SEL = '#say, .choices .pick, .bin, #stage svg text'
async def font_fallbacks(cdp):
  root = (await cdp.send('DOM.getDocument', {'depth': -1}))['root']['nodeId']; out = []
  for i in (await cdp.send('DOM.querySelectorAll', {'nodeId': root, 'selector': READ_SEL}))['nodeIds']:
    try: fs = (await cdp.send('CSS.getPlatformFontsForNode', {'nodeId': i}))['fonts']
    except Exception: continue
    other = [f['familyName'] for f in fs if f['familyName'] != READ_FONT]
    if other: out.append((tuple(other), (await cdp.send('DOM.getOuterHTML', {'nodeId': i}))['outerHTML'][:90]))
  return out

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); ctx = await b.new_context(**p.devices[os.environ.get('DEVICE', 'Pixel 5')],   # DEVICE: جهاز آخر (الشاشة القصيرة: iPhone SE، Galaxy S5)
                                      color_scheme='dark' if os.environ.get('DARK') == '1' else 'light'); pg = await ctx.new_page(); errs = []   # DARK=1: الوضع الليلي
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e) + ' | ' + ' <- '.join(l.strip().split(' (')[0].replace('at ', '') + ':' + l.rsplit(':', 2)[-2] for l in (e.stack or '').split('\n')[1:9]))); pg.on('console', lambda m: errs.append('console: ' + m.text) if (m.type == 'error' and 'ERR_TUNNEL' not in m.text and 'ERR_NAME' not in m.text) or (m.type == 'warning' and 'keyframe' in m.text.lower()) else None)   # الخط من الشبكة يفشل في البيئة المغلقة فلا يُعدّ
    cdp = await ctx.new_cdp_session(pg); await cdp.send('DOM.enable'); await cdp.send('CSS.enable'); fontfb = {}
    await pg.goto(URL); await pg.wait_for_timeout(500)
    await pg.evaluate("localStorage.setItem('hp_settings', JSON.stringify({sessionMax: 0}))"); await pg.reload(); await pg.wait_for_timeout(500)
    if SHOTS: await pg.screenshot(path=OUT + '/00_start.png')
    await pg.click('#startBtn'); await pg.wait_for_timeout(300)
    if SHOTS: await pg.screenshot(path=OUT + '/01_profile.png')
    await pg.click('.av[data-av="%s"]' % ('f3' if GENDER == 'f' else 'm2')); await pg.wait_for_timeout(200); await pg.click('#pSave'); await pg.wait_for_timeout(400)
    if SHOTS: await pg.screenshot(path=OUT + '/02_home.png')
    small = {}; noname = {}; empty = {}; taps = {}; leaks = []; failed_rev = {}; redo_seen = set(); replay_q = None; crashes = 0; seen_types = set(); deep = {}; failed_test = {}; shots = set(); report = []; lessons = 0
    visits = 0   # MAXL يعدّ الدروس وحدها (لا المراجعة ولا الورشة)، وسقف الزيارات كلها 200 حارس من حلقة
    while lessons < MAXL and visits < 200:
      target = await pg.evaluate("""() => { const n = document.querySelector('.stop.now'); if (n) return n.dataset.lesson ? ['lesson', n.dataset.lesson] : n.dataset.review ? ['review', 'review'] : null;
        const w = document.querySelector('.stop.ws.must[aria-disabled=false]'); if (w) return ['ws', w.dataset.workshop]; return null; }""")
      if MODE == 'failreview' and not target is None and await pg.evaluate("() => Object.values(PROG.srs).some(r => r.due != null && r.due > Date.now())"):   # المراجعة تحين فوراً (لا ننتظر يوماً)
        await pg.evaluate("() => { Object.values(PROG.srs).forEach(r => { if (r.due != null) r.due = Date.now() - 1; }); saveProg(); showHome(); }"); await pg.wait_for_timeout(200); continue
      if not target and MODE == 'replay' and replay_q is None:   # بعد المسار كله: يُعاد كل درس مرة في الجلسة نفسها (كشف حالة تبقى من التشغيل الأول)
        replay_q = await pg.evaluate("() => UNITS.flatMap(u => u.lessons)")
      if not target and replay_q: target = ['lesson', replay_q.pop(0)]
      if not target: break
      kind, tid = target
      if MODE == 'failreview': redo_seen.update(await pg.evaluate("() => Object.keys(PROG.redo || {})"))
      sel = '.stop[data-lesson="%s"]' % tid if kind == 'lesson' else '.stop.review' if kind == 'review' else '.stop.ws[data-workshop="%s"]' % tid
      await pg.click(sel); await pg.wait_for_timeout(200); lessons += kind == 'lesson'; visits += 1; t0 = time.time(); last_n = -1; idle = 0; steps = 0; stuck = False; acts = []
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
          for x in await pg.evaluate(NONAME): noname.setdefault((x, a['kind']), sc)
          for x in await pg.evaluate(EMPTY): empty.setdefault((sc, a['kind'], x), 0)
          for x in await pg.evaluate(TAPS): taps.setdefault((sc, a['kind']) + tuple(x), 0); taps[(sc, a['kind']) + tuple(x)] += 1
          for fam, html in await font_fallbacks(cdp): fontfb.setdefault((fam, html), sc)
          last_n = a['n']; how = 'ok'
          if sc.endswith(':bag') or (a['kind'] == 'pick' and 'bag' in sc): how = 'bag'
          elif MODE == 'mixed' and st['mode'] in ('practice', 'explore') and st['itype'] and st['itype'] not in seen_types: seen_types.add(st['itype']); how = 'wrong'
          elif MODE == 'deep' and st['mode'] == 'practice' and st['itype'] and deep.get(st['itype'], 0) < 4: deep[st['itype']] = deep.get(st['itype'], 0) + 1; how = 'wrong'
          elif MODE == 'failtest' and st['mode'] == 'test' and failed_test.setdefault(sc.split(':')[0], 0) < 3: failed_test[sc.split(':')[0]] += 1; how = 'wrong'
          elif MODE == 'failmastery' and st['mode'] == 'mastery': how = 'wrong'
          elif MODE == 'failreview' and st['mode'] == 'review':   # المبدأ 14: خطأ في بند ثم في البند الثاني ← إعادة الدرس (بالبنود لا بالانتظارات، فالبند ذو الخطوات الكثيرة خطأ واحد)
            aid = await pg.evaluate("() => { const it = window.__item; if (!it) return null; if (!it.__aid) it.__aid = (window.__aidN = (window.__aidN || 0) + 1); return it.__aid; }")
            fr = failed_rev.setdefault(sc.split(':')[0] + ':' + (await pg.evaluate("() => (CUR && CUR.id) || ''")), set())
            if aid in fr: how = 'wrong'
            elif aid is not None and len(fr) < 2: fr.add(aid); how = 'wrong'
          if a['kind'] == 'card' and sc.endswith(':chaos'):   # D236: «أعد الجملة» أثناء البطاقتين لا يكشف جملة فوضى نصاً، والبطاقتان مخفيتان ومتماثلتان بالنظر
            cv = await pg.evaluate(CARDS)
            if cv: leaks.append((sc, cv))
            await pg.wait_for_timeout(300)              # «أعد الجملة» والخاطئة آخر ما قيل، أياً كان ترتيب البطاقتين (الدرس 98: هكذا ظهر الخطأ القديم)
            await pg.evaluate("() => { const L = CUR && LDATA[CUR.id]; if (L && L.chaos && L.chaos.wrong) { const [who, id, text] = lineOf(L.chaos.wrong, L); lastLine = { who, id, text, lesson: CUR.id, hideText: true }; } }")
            await pg.evaluate(WATCH); await pg.click('#replay'); await pg.wait_for_timeout(30); await pg.click('#replay')   # ثم مرة ثانية تقطع الأولى، وتُراقَب الفقاعة طوال القراءة
            for _ in range(40):
              if not await pg.evaluate("() => speechBusy()"): break
              await pg.wait_for_timeout(25)
            lk = await pg.evaluate(LEAKED)
            if lk: leaks.append((sc, lk))
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
    print('unnamed targets:', len(noname)); [print(' ', k, v) for k, v in list(noname.items())[:20]]
    print('tap conflicts:', len(taps)); [print(' ', v, *k) for k, v in list(taps.items())[:20]]
    if MODE == 'failreview': print('redo lessons (two review errors):', sorted(redo_seen), 'still pending:', await pg.evaluate("() => Object.keys(PROG.redo || {})"))
    print('chaos leaks:', len(leaks)); [print(' ', *x) for x in leaks[:10]]
    print('font fallbacks:', len(fontfb)); [print(' ', v, *k) for k, v in list(fontfb.items())[:20]]
    print('assessment misses:', len(bad)); [print(' ', *x) for x in bad[:40]]
    clips = set(await pg.evaluate("() => window.__clips || []"))
    ids = set(json.load(open(os.path.join(HERE, '..', 'dist', 'script_m1.xlsx.ids.json'))))
    miss = sorted(clips - ids)                       # كل جملة منطوقة لها سطر في جدول التسجيل (القسم 12 من الميثاق)
    print('clips spoken: %d unique, %d of %d recording ids; NOT in script: %d' % (len(clips), len(clips & ids), len(ids), len(miss))); [print('  ', m) for m in miss[:20]]
    all_ids = await pg.evaluate("() => UNITS.flatMap(u => u.lessons)")   # كل درس انتهى، ولا درس توقّف أو دار في حلقة أو انهار (الفحص المستقل الخامس، ج1)
    blocked = [r for r in report if r[1] in ('CRASH', 'LOOP', 'STUCK', 'stuck')]; not_done = [i for i in all_ids if not any(r[0] == i and r[1] == 'done' for r in report)]
    if os.environ.get('CLIPS_OUT'): json.dump(sorted(clips), open(os.environ['CLIPS_OUT'], 'w'))   # تجمعها test/unspoken.py: جمل لم تُنطق في أي تشغيل
    await pg.screenshot(path=OUT + '/99_home.png'); await b.close()
    for r in report: print(*r)
    print('errors:', len(errs)); [print(' ', e[:400]) for e in errs[:30]]
    print('LOG.errors:', len(errlog)); [print(' ', e) for e in errlog[:20]]
    print('small targets:', len(small)); [print(' ', *v) for v in list(small.values())[:30]]
    print('empty drags:', len(empty)); [print(' ', *k) for k in list(empty)[:20]]
    print('blocked lessons:', len(blocked)); [print(' ', *r) for r in blocked[:20]]
    print('lessons not done:', len(not_done) if MAXL >= len(all_ids) else 0, not_done if MAXL >= len(all_ids) else '(MAXL)')
asyncio.run(main())
