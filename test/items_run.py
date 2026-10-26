# كل بند يُقيَّم أو يُراجَع، بندًا بندًا وفي سياق درسه (الفحص المستقل C، ن-ح1): السائق الآلي يمرّ بالمسار، والمراجعة فيه لا تبلغ إلا البند الأول
# من مخزون كل درس (والثاني بعد خطأ)، فبند المراجعة الثاني في الدرس 6 من S1-U3 كان يوقف الدرس («جملة غير موجودة: gen.numw.21») ولم يره فحص.
# هنا يُشغَّل كل بند في الدروس كلها مرتين، صحيحًا ثم خطأً (والخطأ بالدرجات الأربع حيث المساعدة، ثم التوأم صحيحًا):
#   مخزون المراجعة (review)، وبنود اختبار الوحدة (test)، وبنود الإتقان والبند المختلط (mastery)، وبنود العلاج (remedial).
# والمطلوب: كل بند ينتهي بلا خطأ في الصفحة ولا شاشة انهيار، وحكمه كما أُجيب (الصحيح صحيح، والخطأ خطأ)، وكل توأم يُشغَّل بعد الكشف في العلاج.
# وكل طريق مرسوم في «أيّ وصف يوصل؟» لا يمسّ إلا أشياءه في دورها، وما في اليد مرفوع واليد عليه (بالرسم الحقيقي).
# python3 test/items_run.py   (FILE=نسخة فحص أخرى، ONLY=m1.u3.d6,… دروس بعينها)
import asyncio, os, re, sys
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
FILE = os.environ.get('FILE', os.path.join(HERE, '..', 'dist', 'واحة_الرياضيات.dev.html'))
ONLY = [x for x in os.environ.get('ONLY', '').split(',') if x]
FAILS = []
PROBES = set(filter(None, os.environ.get('PROBES', '').split(',')))   # للطفرات: مجسّات بعينها من الجديدة (COUNTB…)، وبلا PROBES كلها
def probe_on(k): return not PROBES or k in PROBES   # (لا want: اسمٌ محلّي في main)
def check(ok, what): print(('ok   ' if ok else 'FAIL ') + what); (None if ok else FAILS.append(what))
# ومع مجسّات بعينها (PROBES=…) تُطبع الفحوص الدائمة ولا تُحسب، فلا يُنسب إخفاقها إلى المجسّ في أصل الطفرة (الفحص المستقل F2 (9))؛ وPROBES=none الدائمة وحدها
BASE_SKIP = bool(PROBES) and 'none' not in PROBES
def cbase(ok, what):
  if BASE_SKIP: print(('base ok   ' if ok else 'base-fail ') + what); return
  check(ok, what)
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
# و«هل بقي عددها كما هو؟» بإضافة: الأشياء لا يلامس بعضها بعضاً في العدّ (الفحص المستقل E: المُضاف يلامس شيئاً من الدائرة في 16 بذرة من 20)؛ كل بند ثماني مرات
SAMES = r"""async () => { const found = []; const walk = (v, id) => { if (Array.isArray(v)) return v.forEach(x => walk(x, id)); if (!v || typeof v !== 'object') return;
    if (v.t === 'same' && v.add) found.push([id, v]); for (const [k, x] of Object.entries(v)) if (k !== 'lines' && k !== 'labels') walk(x, id); };
  for (const id of UNITS.flatMap(u => u.lessons)) walk(LDATA[id], id); const out = [];
  for (const [id, spec] of found) for (let rep = 0; rep < 8; rep++) { hush(); FLOW++; CUR = LDATA[id]; show('lesson'); window.__auto = null; const it = ITEM.same.make(JSON.parse(JSON.stringify(spec))); ITEM.same.ask(it, 'explore', 1).catch(() => {});
    for (let w = 0; w < 200 && !window.__auto; w++) await new Promise(r => setTimeout(r, 25));
    const P = [...(it._to || []), ...(it._extra ? [it._extra] : [])]; let m = 1e9; for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) m = Math.min(m, Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y));
    out.push([id, spec.mk + ' ' + spec.n + '+' + spec.add, Math.round(m), !!it._extra]); }
  hush(); FLOW++; return out; }"""
# و«ضع النجمة في منطقتها» لا يبدأ والنجمة في المنطقة المطلوبة (الفحص المستقل E: «خارج الدائرة وخارج المربع» والرفّ خارجهما، فالمطلوب صحيح قبل أن يُفعل شيء)
PLACES = r"""async () => { const found = []; const walk = (v, id) => { if (Array.isArray(v)) return v.forEach(x => walk(x, id)); if (!v || typeof v !== 'object') return;
    if (v.t === 'place' && v.ref === 'regions') found.push([id, v]); for (const [k, x] of Object.entries(v)) if (k !== 'lines' && k !== 'labels') walk(x, id); };
  for (const id of UNITS.flatMap(u => u.lessons)) walk(LDATA[id], id); const out = [];
  for (const [id, spec] of found) { hush(); FLOW++; CUR = LDATA[id]; show('lesson'); const it = ITEM.place.make(JSON.parse(JSON.stringify(spec))); ITEM.place.ask(it, 'explore', 0);
    await new Promise(r => setTimeout(r, 120)); const th = document.querySelector('#stage [data-start-region]');
    out.push([id, spec.q, spec.at, th ? th.dataset.startRegion : null]); }
  hush(); FLOW++; return out; }"""
# ومناطق اللمس تُعاد حين يتغيّر المسرح، فحسابها رخيص: الطريق بثلاث وعشرين منطقة على معالج أبطأ أربع مرات أقلّ من 25 م.ث (الفحص المستقل E: كان 98–116)
PADS = r"""async () => { hush(); FLOW++; CUR = LDATA['m1.u3.d6']; show('lesson'); const spec = JSON.parse(JSON.stringify(CUR.practice.normal[2])); const T = ITEM[itemType(spec)]; T.ask(T.make(spec), 'explore', 0).catch(() => {});
  await new Promise(r => setTimeout(r, 1200)); const svg = document.querySelector('#stage svg'); const n = svg.querySelectorAll('rect.hit').length;
  const t0 = performance.now(); for (let i = 0; i < 10; i++) refreshPads(svg); const ms = (performance.now() - t0) / 10; hush(); FLOW++; return [n, ms]; }"""
# ولمسة بالإصبع على حافة جدار الصندوق السفلى في «ما الذي داخل الصندوق؟» لا تُسجَّل جواباً (الفحص المستقل E: كان المتصفّح ينقلها إلى الدبّ تحت الصندوق)
EDGE_START = r"""(px) => { const L = LDATA['m1.u3.d1']; const it = (new Function('L', 'return L.' + px))(L); hush(); CUR = L; FLOW++; show('lesson'); window.__res = null; window.__att = [];
  if (!window.__la2) { window.__la2 = logAttempt; logAttempt = a => { (window.__att = window.__att || []).push(a); return window.__la2(a); }; }
  runItem(JSON.parse(JSON.stringify(it)), 'practice', { scene: 'edge' }).then(r => { window.__res = r.ok; }); }"""
EDGE_PT = r"""() => { const f = document.querySelector('#stage [data-front]'); if (!f) return null; const r = f.getBoundingClientRect(); return [(r.left + r.right) / 2, r.bottom - 5]; }"""
# والتوقّع من الصورة في الميزان يُجرَّب بعد الجواب الصحيح أيضاً (H11): بعد «أيّهما أثقل؟» بالصورة وحدها يُرسم الميزان وفيه الشيئان
PICS = r"""async () => { const found = []; const walk = (v, id) => { if (Array.isArray(v)) return v.forEach(x => walk(x, id)); if (!v || typeof v !== 'object') return;
    if (v.t === 'balance' && v.mode === 'pic') found.push([id, v]); for (const [k, x] of Object.entries(v)) if (k !== 'lines' && k !== 'labels') walk(x, id); };
  for (const id of UNITS.flatMap(u => u.lessons)) walk(LDATA[id], id); const out = [];
  for (const [id, spec] of found) { hush(); FLOW++; CUR = LDATA[id]; show('lesson'); window.__auto = null; let done = false, n0 = -1;
    runItem(JSON.parse(JSON.stringify(spec)), 'practice', { scene: 'pic' }).then(() => { done = true; }, () => { done = true; });
    for (let w = 0; w < 400 && !done; w++) { const a = window.__auto; if (a && a.n !== n0) { n0 = a.n; a.ok(); } const go = document.querySelector('#go'); if (go && !go.hidden && !go.disabled) go.click(); await new Promise(r => setTimeout(r, 25)); }
    const B = document.querySelector('#stage [data-balance]'); const ws = B ? [...B.querySelectorAll('[data-weigh]')].map(g => g.dataset.weigh).sort().join(',') : '';
    out.push([id, spec.q, done, ws, [spec.a, spec.b].sort().join(',')]); }
  hush(); FLOW++; return out; }"""
# والقياس الخاطئ في «أيّ القياسين صحيح؟» خطؤه واحد: الفراغات والوحدات المختلفة تمتدّ من بداية الشيء إلى نهايته، والبداية من الوسط تنتهي عند نهايته
# (الفحص المستقل A لبوابة S1-U4: صفّ الفراغات كان يقف قبل النهاية، فالخطأ خطآن). يُرسم كل بند من بيانات الوحدة بدالّة البند نفسها، وتُقاس حدود وحداته
MEASP = r"""() => { const out = []; const walk = (v, id) => { if (Array.isArray(v)) return v.forEach(x => walk(x, id)); if (!v || typeof v !== 'object') return;
    if (v.t === 'unitCheck') out.push([id, v]); if (v.t === 'reason' && v.pic && v.pic.kind === 'units' && v.pic.bad) out.push([id, { obj: v.pic.obj || 'book', unit: v.pic.unit || 'clip', n: v.pic.n, bad: v.pic.bad, q: v.q }]);
    for (const [k, x] of Object.entries(v)) if (k !== 'lines' && k !== 'labels') walk(x, id); };
  for (const id of UNITS.flatMap(u => u.lessons)) walk(LDATA[id], id); hush(); FLOW++; CUR = LDATA['m1.u4.d3']; show('lesson');
  return out.map(([id, it]) => { const svg = newStage(300, { oasis: false, ground: 0 }); const L = it.n * UNIT_U[it.unit], res = [];
    for (const kind of ['ok', 'bad']) { const P = measPanel(svg, it, 64, kind), lo = Math.min(...P.U.map(u => u.left)), hi = Math.max(...P.U.map(u => u.right));
      const want = kind === 'bad' && it.bad === 'start' ? [MS_X - L, MS_X - 2 * UNIT_U[it.unit]] : [MS_X - L, MS_X]; res.push([kind, Math.round(lo), Math.round(hi), want, Math.abs(lo - want[0]) <= 1.5 && Math.abs(hi - want[1]) <= 1.5]); }
    return [id, it.q, it.bad, it.n, res]; }); }"""
# و«ابنِ العدد»: المكعب العاشر يبقى منفرداً كما وضعه الطفل وزرّ «مكعب» يعمل بعده، والكشف مكان بناء الطفل لا فوقه (الفحص المستقل B لبوابة S1-U4:
# عشر لمسات رسمت عموداً وسكت الزرّ، والكشف رُسم فوق البناء الخاطئ فرُئي بناءان وقيل عدد واحد)
RODB = r"""async () => { hush(); FLOW++; CUR = LDATA['m1.u4.d5']; show('lesson'); window.__auto = null; const out = {};
  const I = ITEM.rodBuild, it = I.make({ t: 'rodBuild', q: 'pr.2', n: 17 }); const p = I.ask(it, 'practice', 0);
  for (let w = 0; w < 200 && !document.querySelector('.choices.build [data-k="one"]'); w++) await new Promise(r => setTimeout(r, 20));
  const b = k => document.querySelector('.choices.build [data-k="' + k + '"]');
  for (let i = 0; i < 11; i++) { b('one').click(); await new Promise(r => setTimeout(r, 5)); }
  out.rods = document.querySelectorAll('#stage svg [data-teen] [data-rod]').length; out.ones = document.querySelectorAll('#stage svg [data-teen] [data-one]').length;
  b('done').click(); const r = await p; out.ans = r.ans; await I.reveal(it, r); out.atReveal = document.querySelectorAll('#stage svg [data-teen]').length;
  hush(); FLOW++; return out; }"""
# وزرّ «حاذِ البدايات» و«افرد» يُخفى بعد عمله ولا يُزال: إزالته وسط الانتظار تكبّر المسرح فيقفز الرسم تحت الإصبع (الفحص المستقل B لبوابة S1-U4)
ALIGNJ = r"""async () => { const out = []; for (const [k, it] of [['align', { t: 'lenPick', q: 'gm.1', lens: [204, 172], ask: 'long', kind: 'strip', shift: [0, 64] }], ['wave', { t: 'lenPick', q: 'pr.c1', lens: [200, 170], ask: 'long', kind: 'ribbon', wavy: [0] }]]) {
    hush(); FLOW++; CUR = LDATA[k === 'align' ? 'm1.u4.d8' : 'm1.u4.d1']; show('lesson'); window.__auto = null; const p = runItem(it, 'practice', { scene: 'alignj' });
    let b = null; for (let w = 0; w < 200 && !(b = document.querySelector('.choices [data-k="' + k + '"]')); w++) await new Promise(r => setTimeout(r, 20));
    if (!b) { out.push([k, null, null]); continue; } const h0 = document.querySelector('#stage svg').getBoundingClientRect().height; b.click(); await new Promise(r => setTimeout(r, 400));
    const h1 = document.querySelector('#stage svg').getBoundingClientRect().height; out.push([k, Math.round(h0), Math.round(h1)]); const a = window.__auto; if (a) a.ok(); await Promise.race([p, new Promise(r => setTimeout(r, 3000))]); }
  hush(); FLOW++; return out; }"""
# ولمسة «رتّب» وسحب الشريط لما تحت الإصبع (D255؛ الفحص المستقل B لبوابة S1-U4): على جسم الشريط الثاني قرب حافته السفلى، حيث تمتدّ منطقة لمس الشريط الذي تحته
ORD_START = r"""() => { hush(); FLOW++; CUR = LDATA['m1.u4.d1']; show('lesson'); window.__auto = null; runItem({ t: 'orderBy', q: 'pr.c2', by: 'len', vals: [120, 230, 170, 90, 200], dir: 'up', shift: [40, 0, 60, 20, 10] }, 'practice', { scene: 'ordedge' }); }"""
ORD_PT = r"""(j) => { const gs = [...document.querySelectorAll('#stage svg [data-order]')]; const g = gs[j]; if (!g) return null; let r = null;
  for (const c of g.querySelectorAll('rect,path,polygon,ellipse,circle')) { if (c.matches('rect.hit')) continue; const b = c.getBoundingClientRect(); if (!b.width) continue; r = r ? { l: Math.min(r.l, b.left), t: Math.min(r.t, b.top), r: Math.max(r.r, b.right), b: Math.max(r.b, b.bottom) } : { l: b.left, t: b.top, r: b.right, b: b.bottom }; }
  return [(r.l + r.r) / 2, r.b - 4, gs.map(x => x.getAttribute('transform'))]; }"""
# و«صحّح لفوضى» في الدرس 5: كل بطاقة فوق بنائها (الفحص المستقل B لبوابة S1-U4: خُلطت البطاقتان فوق بناءين ثابتين)، بأربع بذور
CH31 = r"""async () => { const out = []; for (const sd of [1, 2, 3, 7]) { reseed('ch31|' + sd); hush(); FLOW++; CUR = LDATA['m1.u4.d5']; show('lesson'); window.__auto = null; const L = LDATA['m1.u4.d5'];
    const p = SCENES.chaos31(L.chaos, L); let ok = null;
    for (let w = 0; w < 400; w++) { if (document.querySelectorAll('#stage svg [data-card]').length === 2) { const box = e => e.getBoundingClientRect();
        ok = [...document.querySelectorAll('#stage svg [data-card]')].every(c => { const b = document.querySelector('#stage svg [data-build="' + c.dataset.card + '"]'), cb = box(c), bb = box(b), x = (cb.left + cb.right) / 2; return x > bb.left - 4 && x < bb.right + 4; }); break; }
      const a = window.__auto; if (a && a.n !== window.__ch31n) { window.__ch31n = a.n; a.ok(); } const go = document.querySelector('#go'); if (go && !go.hidden && !go.disabled) go.click(); await new Promise(r => setTimeout(r, 20)); }
    out.push(ok); } hush(); FLOW++; return out; }"""
# وصفّ «حاذِ البدايات» المخفيّ وسط الانتظار يُزال بعده، فلا يصغر المسرح في الانتظار التالي (الفحص المستقل C2 لبوابة S1-U4: بقي 64 بكسلاً في الاكتشاف و«صحّح لفوضى»)
HIDBAR = r"""async () => { const out = []; for (const [id, get, run] of [['m1.u4.d1', L => L.flow[1], (c, L) => SCENES.alignExplore(c, L)], ['m1.u4.d1', L => L.chaos, (c, L) => SCENES.chaosEnds(c, L)]]) {
    hush(); FLOW++; const L = LDATA[id]; CUR = L; show('lesson'); window.__auto = null; run(get(L), L); let n0 = -1, k = 0, got = null;
    for (let w = 0; w < 500 && got === null; w++) { const a = window.__auto; if (a && a.n !== n0) { n0 = a.n; k++;
        if (a.kind !== 'align' && k > 1) { await new Promise(r => setTimeout(r, 60)); got = [...document.querySelectorAll('#stage .choices')].filter(b => getComputedStyle(b).visibility === 'hidden').length; break; } a.ok(); }
      const go = document.querySelector('#go'); if (go && !go.hidden && !go.disabled) go.click(); await new Promise(r => setTimeout(r, 20)); }
    out.push([get(L).scene, got]); } hush(); FLOW++; return out; }"""
# والملتوي لا يُحلّ بالنظر (الفحص المستقل F2 (2ب)): كل بند ملتوٍ وتوأمه يُرسم، ويُقرأ عرض كل شريط كما يُرى، فيُحكم بأطوله أو أقصره كما يُرى
WAVYSIGHT = r"""async () => { const out = [], items = []; const walk = (v, L, w) => { if (Array.isArray(v)) return v.forEach((x, i) => walk(x, L, w)); if (!v || typeof v !== 'object') return;
    if (v.t === 'lenPick' && (v.wavy || []).length) items.push([L, v, w]); for (const [k, x] of Object.entries(v)) if (x && typeof x === 'object') walk(x, L, k === 'twin' ? 'twin' : w); };
  for (const L of Object.values(LDATA)) for (const [p, v] of [['normal', (L.practice || {}).normal], ['challenge', (L.practice || {}).challenge], ['assess', [L.mastery, L.review, L.test]], ['flow', L.flow]]) walk(v, L, p);
  for (const [L, v, path] of items) { hush(); FLOW++; CUR = L; show('lesson'); window.__auto = null; const it = ITEM.lenPick.make(JSON.parse(JSON.stringify(v)));
    ITEM.lenPick.ask(it, 'practice', 0).catch(() => {}); await new Promise(r => setTimeout(r, 400));
    const W = [...document.querySelectorAll('#stage svg [data-len]')].map(g => Math.round(g.getBBox().width)); out.push([L.id, path, v.q, v.ask || 'long', it.want, W, v.wavy]); }
  hush(); FLOW++; return out; }"""
# و«ميزان الحديقة»: «وَهَاتَانِ» لشيئين مؤنثين و«وَهَذَانِ» لغيرهما (الفحص المستقل E1 (6): «وَهَذَانِ» للوسادة والتفاحة)
# ومعها جولة مصنوعة بزوجين مختلطَي الجنس (الفحص المستقل F1 (12): لا زوج مختلط في الجولات، فنجت طفرة «جنس الأول وحده»): التفاحة والكتاب، والكتاب والتفاحة
GARDENG = r"""async () => { const out = [], SY = []; for (const L of Object.values(LDATA)) for (const st of (L.flow || []).filter(s => s.scene === 'gardenBalance')) SY.push([L, st], [L, { ...st, rounds: [st.rounds[0], ['apple', 'book'], ['book', 'apple']] }]);
  for (const [L, st] of SY) {
    hush(); FLOW++; CUR = L; show('lesson'); window.__auto = null; window.__clips = []; let done = false; SCENES.gardenBalance(st, L).then(() => { done = true; }).catch(() => {}); let n0 = -1;
    for (let w = 0; w < 2000 && !done; w++) { const a = window.__auto; if (a && a.n !== n0) { n0 = a.n; a.ok(); } await new Promise(r => setTimeout(r, 20)); }
    out.push([L.id, done, st.rounds.slice(1).map(p => 'gen.garden.again' + (p.every(k => WEIGH_F.has(k)) ? '.f' : '')), (window.__clips || []).filter(c => c.startsWith('gen.garden.again'))]); }
  hush(); FLOW++; return out; }"""
# و«سباق الديدان»: الفائزة تجري ورأسها داخل المسرح، وحلقة الجواب حولها حيث وقفت (الفحص المستقل E2: الحلقة على الذيل وفراغ، والرأس خارج الحافّة)
WORMWIN = r"""async () => { const out = [], L = LDATA['m1.u4.d1'], st = L.flow.find(s => s.scene === 'wormRace');
  for (const rd of st.rounds) { hush(); FLOW++; CUR = L; show('lesson'); window.__auto = null; let done = false; SCENES.wormRace({ rounds: [rd] }, L).then(() => { done = true; }).catch(() => {}); let n0 = -1;
    for (let w = 0; w < 600 && !done; w++) { const a = window.__auto; if (a && a.n !== n0) { n0 = a.n; a.ok(); } await new Promise(r => setTimeout(r, 20)); }
    const svg = document.querySelector('#stage svg'), S = svg.getBoundingClientRect(), want = lenWant(rd.lens, rd.ask), W = [...svg.querySelectorAll('[data-len]')][want], ring = svg.querySelector('[data-ring]');
    const wb = W.getBoundingClientRect(), rb = ring ? ring.getBoundingClientRect() : null;
    out.push([rd.q, done, Math.round(wb.left - S.left), !!rb && rb.left <= wb.left + 2 && rb.right >= wb.right - 2]); }
  hush(); FLOW++; return out; }"""
# ولمسة حقيقية داخل حافّة العربة تختارها هي لا جارتها (الفحص المستقل C2 لبوابة S1-U4: كروم يعدّل موضع click نحو جارةٍ منطقتُها أعلى، فلمسة على بُعد ثلاث نقاط داخل
# حافّة العربة أجابت بالتالية على iPhone SE وGalaxy S5): يبدأ البند، وتُلمس العربة i عند حافّتيها، ويُقرأ الجواب
# وعلى كل صفٍّ في البيانات (طابورٌ وقطار بأطواله) وعلى جهازين (الفحص المستقل D2 لبوابة S1-U4 (9): كان بندٌ واحد على SE وحده، والخطأ كان على S5 أيضاً):
# لمسةٌ داخل حافّة كل هدف ظاهر تختار ما تختاره لمسته بلا موضع
CARGO_ITEMS = r"""() => { const out = [], seen = new Set(); for (const L of Object.values(LDATA)) { const walk = (v, w) => { if (Array.isArray(v)) return v.forEach((x, i) => walk(x, w + '[' + i + ']')); if (!v || typeof v !== 'object') return;
      if (v.t === 'lineTap' && v.row) { const k = v.row.kind + '|' + (v.row.n || (v.row.members || []).length); if (!seen.has(k)) { seen.add(k); out.push([L.id, w.slice(1), k]); } }
      for (const [k, x] of Object.entries(v)) if (x && typeof x === 'object' && k !== 'lines' && k !== 'labels') walk(x, w + '.' + k); };
    walk({ flow: L.flow, practice: L.practice, mastery: L.mastery, review: L.review }, ''); } return out; }"""
CARGO = r"""async ([lid, px, i, side]) => { hush(); FLOW++; const L = LDATA[lid]; CUR = L; show('lesson'); window.__auto = null; window.__carK = undefined;
  const it = (new Function('L', 'return L.' + px))(L); ITEM.lineTap.ask(ITEM.lineTap.make(JSON.parse(JSON.stringify(it))), 'practice', 0).then(r => { window.__carK = r.ans.k; }).catch(() => {}); await new Promise(r => setTimeout(r, 500));
  const svg = document.querySelector('#stage svg'), S = svg.getBoundingClientRect(), M = [...svg.querySelectorAll('[role=button]')]; const g = M[i]; if (!g) return null;
  if (side < 0) { g.dispatchEvent(new MouseEvent('click', { bubbles: true })); await new Promise(r => setTimeout(r, 60)); return [window.__carK, M.length]; }   /* لمسته بلا موضع: الهدف نفسه */
  if (g.closest('[hidden]') || getComputedStyle(g).visibility === 'hidden') return null; let r = null;
  for (const c of g.querySelectorAll('rect,path,polygon,ellipse,circle')) { if (c.matches('rect.hit')) continue; const b = c.getBoundingClientRect(); if (!b.width) continue; r = r ? { l: Math.min(r.l, b.left), t: Math.min(r.t, b.top), r: Math.max(r.r, b.right), b: Math.max(r.b, b.bottom) } : { l: b.left, t: b.top, r: b.right, b: b.bottom }; }
  if (!r || r.l < S.left || r.r > S.right) return null; return [side ? r.r - 3 : r.l + 3, (r.t + r.b) / 2, M.length]; }"""
# ولوحا تتبّع العدد برقمين لا تتراكب منطقتا لمسهما (تمتدّ 4 وحدات حول اللوح): بين اللوحين أكثر من ثماني وحدات (الفحص المستقل B لبوابة S1-U4)
TRACEGAP = r"""async () => { hush(); FLOW++; CUR = LDATA['m1.u4.d5']; show('lesson'); window.__auto = null; ITEM.teenTrace.ask(ITEM.teenTrace.make({ t: 'teenTrace', q: 'pr.c1', n: 14 }), 'practice', 0);
  for (let w = 0; w < 100 && document.querySelectorAll('#stage svg [data-place]').length < 2; w++) await new Promise(r => setTimeout(r, 20));
  const b = [...document.querySelectorAll('#stage svg [data-place]')].map(g => g.querySelector('rect').getBoundingClientRect()); const svg = document.querySelector('#stage svg'), k = svg.getScreenCTM().a;
  const gap = (Math.max(b[0].left, b[1].left) - Math.min(b[0].right, b[1].right)) / k; hush(); FLOW++; return Math.round(gap); }"""
# وما يوضع في الكفّة المرتفعة لا يخترق ذراع الميزان: أعلاه تحت طرف الذراع بثماني وحدات على الأقل (الفحص المستقل B لبوابة S1-U4)
BALH = r"""() => { const svg = newStage(300, { oasis: false, ground: 0 }); const out = []; for (const k of Object.keys(WEIGH)) { const g = el('g', {}, svg); weighAt(g, k, 0, 0, .82); const b = g.getBBox(); out.push([k, Math.round(-b.y), BAL.hang - 8]); g.remove(); } return out.filter(([k, h, m]) => h > m); }"""
# وعين «انظر مرة أخرى» في اللمحة: مرة واحدة في التقييم فلا تصير عدّاً (الفحص المستقل A لبوابة S1-U4)، وتعود في التمرين، وتُبلغ بلوحة المفاتيح، وتزول بعد الجواب (الفحص المستقل B)
EYE = r"""async () => { const out = {}; for (const [t, lid, n] of [['frameGlance', 'm1.u4.d6', 7], ['glance', 'm1.u1.d4', 4]]) for (const mode of ['mastery', 'practice']) {
    hush(); FLOW++; CUR = LDATA[lid]; show('lesson'); window.__auto = null; const I = ITEM[t], it = I.make({ t, n }); const p = I.ask(it, mode, 0);
    let e = null; for (let w = 0; w < 200 && !(e = document.querySelector('#stage svg [data-eye]')); w++) await new Promise(r => setTimeout(r, 20));
    const key = e && e.getAttribute('tabindex') === '0'; e.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })); await new Promise(r => setTimeout(r, 400));
    const back = !!document.querySelector('#stage svg [data-eye]'); const b = document.querySelector('.choices .pick'); if (b) b.click(); const r = await Promise.race([p, new Promise(r => setTimeout(() => r(null), 3000))]);
    out[t + ':' + mode] = [key, back, !!document.querySelector('#stage svg [data-eye]')]; }
  hush(); FLOW++; return out; }"""
# ولوحة المفاتيح لكل هدف على المسرح في الوحدات كلها (مواصفة المحرّك 8؛ kbdStage ومستمع Enter العامّ في 30_tools.js): Tab يبلغ الهدف،
# وEnter عليه يلمسه وإن لم يكن له مفتاح خاص به (وجه المخروط في S1-U2، وبلاطة الطريق في S1-U3: كانا بلا مفتاح، عدّاد keyless targets)
KBD_START = r"""([lid, px]) => { hush(); FLOW++; const L = LDATA[lid]; CUR = L; show('lesson'); window.__auto = null; window.__clips = [];
  const it = (new Function('L', 'return L.' + px))(L); const I = ITEM[it.t]; I.ask(I.make(JSON.parse(JSON.stringify(it))), 'practice', 0).catch(() => {}); return true; }"""
KBD_FOCUS = r"""(sel) => { const e = document.querySelector(sel); if (!e) return [false, null]; e.focus(); window.__clips = []; return [document.activeElement === e, e.getAttribute('tabindex')]; }"""
KBD_AFTER = r"""(sel) => { const e = document.querySelector(sel); return { stroke: e && e.getAttribute('stroke'), clips: (window.__clips || []).slice() }; }"""
# وجواب التعدّي من الطولين لا من اسم السلّة (الفحص المستقل C2 لبوابة S1-U4: «الأطول» كان ما سلّته «أطول»، فزوج (بطول الشبر، أقصر) يعطي الخطأ):
# كل بند تعدٍّ في البيانات وتوائمه، وجوابه هنا من الطولين في بايثون
TRANSW = r"""() => { const out = []; const walk = v => { if (Array.isArray(v)) return v.forEach(walk); if (!v || typeof v !== 'object') return;
    if (v.t === 'transPick') out.push([v.q, v.a, v.la, v.b, v.lb, v.ask || 'longer', ITEM.transPick.make(v).want]);
    if (v.trans && v.house) { const H = Object.fromEntries(v.house), [a, b] = v.trans.pair; out.push(['board', a, H[a], b, H[b], 'longer', transLong(v)]); }
    for (const x of Object.values(v)) if (x && typeof x === 'object') walk(x); };
  for (const L of Object.values(LDATA)) walk([L.practice, L.mastery, L.review, L.test, L.flow]);
  /* ولوحة المقاول بكل زوج سلّتين (الفحص المستقل E1 (14)): (بطوله، أقصر) و(أطول، بطوله) و(أقصر، أطول) */
  for (const [a, la, b, lb] of [['comb', 112, 'key', 84], ['shoe', 252, 'fork', 112], ['crayon', 84, 'book', 280]]) out.push(['board*', a, la, b, lb, 'longer', transLong({ house: [[a, la], [b, lb]], trans: { pair: [a, b] } })]);
  return out; }"""
# وسؤال الخطأ في بند طولٍ بداياته غير محاذاة سؤالُ المحاذاة لا «أيّها أبعد عن خط البداية؟» (الفحص المستقل D1 لبوابة S1-U4): كل خطأ ممكن في كل بند مُزاح وتوائمه
LENERR = r"""() => { const out = []; const walk = v => { if (Array.isArray(v)) return v.forEach(walk); if (!v || typeof v !== 'object') return;
    /* والملتوي: الوسم بحسب ما فعله الطفل، يُحسب المتوقَّع في بايثون من البيانات (الفحصان المستقلان F1 (4) وF2 (2)) */
    if (v.t === 'lenPick' && (v.wavy || []).length) { const it = ITEM.lenPick.make(JSON.parse(JSON.stringify(v)));
      it._st = v.lens.map((L, i) => ({ x0: MS_X, end: MS_X - L, wavy: v.wavy.includes(i) }));
      v.lens.forEach((_, k) => { if (k === it.want) return; out.push(['wv:' + v.q + ':' + (v.ask || 'long') + ':' + it.want + ':' + v.wavy.join('.'), k, ITEM.lenPick.judge(it, k).err]); }); }
    if (v.t === 'lenPick' && (v.shift || []).some(Boolean)) { const it = ITEM.lenPick.make(JSON.parse(JSON.stringify(v)));
      it._st = v.lens.map((L, i) => { const x0 = MS_X - ((v.shift || [])[i] || 0); return { x0, end: x0 - L, wavy: (v.wavy || []).includes(i) }; });
      v.lens.forEach((_, k) => { if (k === it.want) return; const r = ITEM.lenPick.judge(it, k); out.push([v.q, k, r.err]); }); }
    /* و«في أيّ سلّة؟» بالشبر: كل خطأ والشبر غير محاذٍ سؤاله المحاذاة، ومحاذياً «أين النهايتان؟» (الفحص المستقل E1 (8)) */
    if (v.t === 'spanSort') for (const al of [false, true]) { const it = ITEM.spanSort.make(JSON.parse(JSON.stringify(v))); it._al = al; it._end = MS_X - v.len + (v.shift || 0);
      for (const k of ['short', 'same', 'long']) if (k !== it.want) out.push(['ss:' + v.q + ':' + al, k, ITEM.spanSort.judge(it, k).err]); }
    /* و«كم زاد؟»: كل عدد خاطئ سؤاله المقابلة، لا «أيّ عمود أعلى؟» (الفحص المستقل D1) */
    if (v.t === 'barRead' && v.ask === 'more') { const it = ITEM.barRead.make(JSON.parse(JSON.stringify(v))); for (let k = 0; k <= 10; k++) if (k !== it.want) out.push(['bar:' + v.q, k, ITEM.barRead.judge(it, k).err]); }
    for (const x of Object.values(v)) if (x && typeof x === 'object') walk(x); };
  for (const L of Object.values(LDATA)) walk([L.flow, L.practice, L.mastery, L.review, L.test]);
  /* وملتويات مصنوعة بالحالات كلها: الملتوي أقصرهما في «أقصر؟» و«أطول؟»، وملتويان في ثلاثة (F2 (2أ): لا بند في البيانات اليوم الملتوي فيه جواب «أقصر؟») */
  walk([{ t: 'lenPick', q: 'syn1', lens: [150, 130], ask: 'short', wavy: [1] }, { t: 'lenPick', q: 'syn2', lens: [150, 190], ask: 'long', wavy: [0] },
        { t: 'lenPick', q: 'syn3', lens: [210, 170, 140], ask: 'short', wavy: [0, 2] }, { t: 'lenPick', q: 'syn4', lens: [150, 196, 120], ask: 'long', wavy: [1, 2] }]); return out; }"""
# «لم يخدعك الحجم!» لزوجٍ أكبرُه أخفّ وحده (الفحص المستقل D1 لبوابة S1-U4 (15)): بنك مدح كل بند ميزان (وتوأمه) من أوزان البيت
PRAISEW = r"""async () => { const out = [], items = []; const walk = (v, L) => { if (Array.isArray(v)) return v.forEach(x => walk(x, L)); if (!v || typeof v !== 'object') return;
    if (v.t === 'balance') items.push([L, v]); for (const x of Object.values(v)) if (x && typeof x === 'object') walk(x, L); };
  for (const L of Object.values(LDATA)) walk([L.flow, L.practice, L.mastery, L.review, L.test], L);
  /* والتوقّع من الصورة يُلعب كما يلعبه الطفل (الفحص المستقل E2): توقّعٌ صحيح ثم قراءة صحيحة، ثم توقّعٌ خاطئ ثم قراءة صحيحة */
  const next = async n0 => { for (let w = 0; w < 200; w++) { const a = window.__auto; if (a && a.n !== n0 && a.kind === 'tap') return a; await new Promise(r => setTimeout(r, 20)); } return null; };
  for (const [L, v] of items) { const A = WEIGH[v.a], B = WEIGH[v.b], trap = A.big !== B.big && (A.big ? A.g < B.g : B.g < A.g);
    if ((v.mode || 'read') !== 'pic') { out.push([v.a, v.b, trap, ITEM.balance.praise(ITEM.balance.make(JSON.parse(JSON.stringify(v)))), 'read']); continue; }
    for (const pred of ['ok', 'wrong']) { hush(); FLOW++; CUR = L; show('lesson'); window.__auto = null; const it = ITEM.balance.make(JSON.parse(JSON.stringify(v))); let done = false;
      ITEM.balance.ask(it, 'practice', 0).then(() => { done = true; }).catch(() => {}); const a1 = await next(-1); if (!a1) { out.push([v.a, v.b, trap, null, pred]); continue; } a1[pred]();
      const a2 = await next(a1.n); if (a2) a2.ok(); for (let w = 0; w < 100 && !done; w++) await new Promise(r => setTimeout(r, 20));
      out.push([v.a, v.b, trap && pred === 'ok', ITEM.balance.praise(it), 'pic-' + pred]); } }
  hush(); FLOW++; return out; }"""
# والحلّ المشترك في «كم مكعباً؟» للعدد 11: منفردٌ واحد، فلا «أحد عشر، اثنا عشر…» (الفحص المستقل D2 لبوابة S1-U4، عرَضاً)
TEENONE = r"""async () => { const out = [], items = [], seen = new Set(); const walk = v => { if (Array.isArray(v)) return v.forEach(walk); if (!v || typeof v !== 'object') return;
    if (v.t === 'rodCount' && !seen.has(v.n)) { seen.add(v.n); items.push(v); } for (const x of Object.values(v)) if (x && typeof x === 'object') walk(x); };
  for (const L of Object.values(LDATA)) walk([L.flow, L.practice, L.mastery, L.review, L.test]);
  for (const v of items) { hush(); FLOW++; CUR = LDATA['m1.u4.d5']; show('lesson'); window.__auto = null; window.__clips = []; const it = ITEM.rodCount.make(JSON.parse(JSON.stringify(v)));
    ITEM.rodCount.ask(it, 'practice', 3).catch(() => {}); for (let w = 0; w < 80 && !(window.__clips || []).some(c => c.startsWith('gen.teen.together')); w++) await new Promise(r => setTimeout(r, 25));
    out.push([v.n, (window.__clips || []).find(c => c.startsWith('gen.teen.together')) || null]); }
  hush(); FLOW++; return out; }"""
# وبعد الحلّ المشترك في «نرجع إلى العشرة» (ما خارج الإطار مشطوب) لا يُقال «ابدأ بالتي خارج الإطار» ويُطلب الباقي «من الإطار» (الفحص المستقل D1 لبوابة S1-U4)
BACKT = r"""async () => { const out = [], items = []; const walk = (v, L) => { if (Array.isArray(v)) return v.forEach(x => walk(x, L)); if (!v || typeof v !== 'object') return;
    if (v.t === 'backTen' && !v.q) items.push([L, v]); for (const x of Object.values(v)) if (x && typeof x === 'object') walk(x, L); };
  for (const L of Object.values(LDATA)) walk([L.flow, L.practice, L.mastery, L.review, L.test], L);
  /* والباقي واحد أو اثنان بلفظه (الفحص المستقل E1 (7)): بنود مصنوعة بالحلّ المشترك وبلا مساعدة */
  const L7 = LDATA['m1.u4.d7'], X = [[{ t: 'backTen', a: 17, b: 8 }, 3], [{ t: 'backTen', a: 12, b: 4 }, 3], [{ t: 'backTen', a: 11, b: 4 }, 3], [{ t: 'backTen', a: 12, b: 1 }, 0], [{ t: 'backTen', a: 13, b: 2 }, 0]];
  for (const [L, v, tries = 3] of [...items, ...X.map(([v, t]) => [L7, v, t])]) { hush(); FLOW++; CUR = L; show('lesson'); window.__auto = null; window.__clips = []; const it = ITEM.backTen.make(JSON.parse(JSON.stringify(v)));
    ITEM.backTen.ask(it, 'practice', tries).catch(() => {}); for (let w = 0; w < 120 && !(window.__auto && window.__auto.kind === 'frameTake'); w++) await new Promise(r => setTimeout(r, 25));
    await new Promise(r => setTimeout(r, 300)); const c = window.__clips || [], ti = c.findIndex(x => x.startsWith('gen.backTen.take'));
    out.push([v.a, v.b, tries >= 3 && c.some(x => x.startsWith('gen.backTen.first')), tries >= 3 && c.some(x => x.startsWith('gen.backTen.fromFrame')), tries >= 3 && v.b > v.a - 10, tries, c[ti] || null, c[ti + 1] || null]); }
  hush(); FLOW++; return out; }"""
# والحلّ المشترك في التعدّي لا يدلّ على الجواب (الفحص المستقل D1 لبوابة S1-U4: كانت الحلقة على سلّة الجواب وحدها): حلقتان على رمزي السلّتين
# في كل بند تعدٍّ وتوأمه، وجملته بزوج السلّتين (gen.trans.together.<الزوج>.<السؤال>)؛ ومشهد اللوحة يحسب الأطول بـ make نفسه
TRANSHELP = r"""async () => { const out = [], items = []; const walk = (v, L) => { if (Array.isArray(v)) return v.forEach(x => walk(x, L)); if (!v || typeof v !== 'object') return;
    if (v.t === 'transPick') items.push([L, v]); for (const x of Object.values(v)) if (x && typeof x === 'object') walk(x, L); };
  for (const L of Object.values(LDATA)) walk([L.flow, L.practice, L.mastery, L.review, L.test], L);
  /* وكل حلقة تُرسم قبل جملة سلّتها: يُسجَّل لكل حلقة موضعها وعدد جمل التعدّي حين رُسمت (الفحص المستقل E1 (11)) */
  const tc = () => (window.__clips || []).filter(c => c.startsWith('gen.trans.')).length;
  for (const [L, v] of items) { hush(); FLOW++; CUR = L; show('lesson'); window.__auto = null; window.__clips = []; const it = ITEM.transPick.make(JSON.parse(JSON.stringify(v))), log = [];
    const mo = new MutationObserver(R => { for (const r of R) for (const n of r.addedNodes) if (n.nodeName === 'circle' && +n.getAttribute('r') === 32 && n.closest('[data-help]')) log.push([Math.round(+n.getAttribute('cx')), tc()]); });
    mo.observe(document.querySelector('#stage'), { childList: true, subtree: true });
    ITEM.transPick.ask(it, 'practice', 3).catch(() => {}); for (let w = 0; w < 120 && !((window.__auto && window.__auto.kind) && (window.__clips || []).some(c => c.startsWith('gen.trans.pick'))); w++) await new Promise(r => setTimeout(r, 25));
    await new Promise(r => setTimeout(r, 30)); mo.disconnect(); out.push([v.q, v.la, v.lb, v.ask || 'longer', log, (window.__clips || []).filter(c => c.startsWith('gen.trans.'))]); }
  hush(); FLOW++; return out; }"""
# ومع تقليل الحركة يُرى ما تُريه المساعدة (الفحص المستقل C2 لبوابة S1-U4: حلقة حركة الأداة في التعدّي كانت وميضاً بـ 1 م.ث فلا تُرى): خطآن ثم حركة الأداة،
# وحلقتها ظاهرة (شفافيتها فوق 0.9) في عيّنات متتالية كل 20 م.ث
RMFLASH = r"""async () => { RM = true; hush(); FLOW++; const L = LDATA['m1.u4.d4']; CUR = L; show('lesson'); window.__auto = null; let res = null, n0 = -1, k = 0, seen = 0;
  runItem(JSON.parse(JSON.stringify(L.practice.challenge[1])), 'practice', { scene: 'rmf' }).then(r => { res = r; });
  for (let w = 0; w < 600 && !res; w++) { const a = window.__auto; if (a && a.n !== n0) { n0 = a.n; k++; (k <= 2 ? a.wrong : a.ok)(); }
    if ([...document.querySelectorAll('#stage svg circle[r="32"]')].some(c => +getComputedStyle(c).opacity > .9)) seen++;
    const go = document.querySelector('#go'); if (go && !go.hidden && !go.disabled) go.click(); await new Promise(r => setTimeout(r, 20)); }
  RM = false; hush(); FLOW++; return [seen, k, !!(res && res.ok)]; }"""
# ولوحة المقاول: خطأٌ والشبر غير محاذٍ سؤاله المحاذاة، وخطأٌ بعد المحاذاة سؤال المقارنة (الفحص المستقل G2 (12): أُعيد سؤال اللوحة إلى fromEnd فلم يرَه فحص)
BOARDALIGN = r"""async () => { const L = LDATA['m1.u4.d4'], st = L.flow.find(s => s.scene === 'contractorBoard'), out = [], w = ms => new Promise(r => setTimeout(r, ms));
  for (const al of [false, true]) { hush(); FLOW++; CUR = L; show('lesson'); window.__auto = null; window.__clips = [];
    SCENES.contractorBoard({ ...JSON.parse(JSON.stringify(st)), house: [st.house[al ? 1 : 0]], trans: null }).catch(() => {});
    let a = null; for (let i = 0; i < 200 && (!(a = window.__auto) || a.kind !== 'pick'); i++) await w(20);   /* محدودة (الفحص المستقل H2 (9): كان الجزء الثاني بلا حدّ) */
    if (al) { const sp = document.querySelector('#stage [data-spantool]'); sp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); for (let i = 0; i < 100 && sp.dataset.align !== 'yes'; i++) await w(20); }
    if (a) a.wrong(); for (let i = 0; i < 100 && !(window.__clips || []).some(c => c.startsWith('gen.err.ssort')); i++) await w(20);
    out.push([al, (window.__clips || []).filter(c => c.startsWith('gen.err.ssort')).map(c => c.replace(/_[mf]$/, ''))]); }
  hush(); FLOW++; return out; }"""
# وثبات تقليل الحركة بالزمن الحقيقي (#test لا #fast): الظهور العابر يُرى 600 م.ث على الأقل ثم يعود (الفحص المستقل G2 (6ب): الفحوص كلها بـ #fast فنجا ثباتٌ بـ 1 م.ث)
RMHOLD = r"""async () => { RM = true; const svg = newStage(200, null), A = el('rect', { width: 40, height: 40 }, svg); A.style.opacity = '0.22'; const T = [], t0 = performance.now();
  anim(A, [{ opacity: .22 }, { opacity: .6 }, { opacity: .22 }], { duration: 400 });
  while (performance.now() - t0 < 1300) { T.push([Math.round(performance.now() - t0), +getComputedStyle(A).opacity]); await new Promise(r => setTimeout(r, 10)); }   /* كل 10 م.ث (كانت 40 فضاق الهامش: 563 والحدّ 550، H2 (9)) */
  RM = false; const on = T.filter(x => Math.abs(x[1] - .6) < .02); return [on.length ? on[on.length - 1][0] - on[0][0] : 0, T[T.length - 1][1]]; }"""
# وثباتان متداخلان يعيدان الأصل، والفانوس ثلاث مرات في الورشة يترك الظلّ كما كان ويثبّته في كل مرة بالقيمة نفسها (الفحص المستقل G2 (7))
RMHOLD2 = r"""async () => { RM = true; const svg = newStage(200, null), A = el('rect', { width: 40, height: 40 }, svg), w = ms => new Promise(r => setTimeout(r, ms)); A.style.opacity = '0.22';
  anim(A, [{ opacity: .22 }, { opacity: .6 }, { opacity: .22 }], { duration: 400 }); await w(120); anim(A, [{ opacity: .22 }, { opacity: .9 }, { opacity: .22 }], { duration: 400 }); await w(900);
  const two = A.style.opacity, out = [two];
  for (const u of ['m1.u1', 'm1.u4']) { const U = UNITS.find(x => x.id === u), W = WS[u]; hush(); FLOW++; CUR = null; show('lesson'); wsPuzzle(U, W.puzzles[0], 0); await w(300);
    const sh = document.querySelector('#stage svg [data-shadow]'), b0 = sh.style.opacity, held = [];
    for (let i = 0; i < 3; i++) { document.querySelector('#helpBtn').click(); await w(60); held.push(sh.style.opacity); }
    await w(1500); out.push([u, b0, held, sh.style.opacity]); disarmIdle(); }
  RM = false; hush(); FLOW++; return out; }"""
# وبالزمن الحقيقي (#test): ثباتان متداخلان بمدّتين (القصير بعد الطويل وينتهي قبله) يعيدان الأصل، وما غيّره الكود بين ثباتين متداخلين هو الأصل الذي يُعاد (الفحص المستقل H2 (5):
# بقيت العقدة على 0.9، وعادت 1 إلى 0.22؛ وRMHOLD2 بمدّة واحدة في #fast لا يراه)
RMHOLD3 = r"""async () => { RM = true; const svg = newStage(200, null), w = ms => new Promise(r => setTimeout(r, ms)), A = el('rect', { width: 40, height: 40 }, svg), B = el('rect', { width: 40, height: 40 }, svg);
  A.style.opacity = '0.22'; anim(A, [{ opacity: .22 }, { opacity: .6 }, { opacity: .22 }], { duration: 1500 }); await w(300); anim(A, [{ opacity: .22 }, { opacity: .9 }, { opacity: .22 }], { duration: 400 });
  B.style.opacity = '0.22'; anim(B, [{ opacity: .22 }, { opacity: .6 }, { opacity: .22 }], { duration: 1200 }); await w(100); B.style.opacity = '1'; await w(100); anim(B, [{ opacity: 1 }, { opacity: .5 }, { opacity: 1 }], { duration: 400 });
  await w(450); const midA = A.style.opacity; await w(1100); RM = false; return [midA, A.style.opacity, B.style.opacity]; }"""
# والملتوي يبدأ عند خط البداية بلا تجاوز، وأمواجه متباعدة لا كتلة (الفحص المستقل G2 (8)): الحافّة اليمنى لجسم كل شيء ≤ خط البداية + 2، والمسافة بين قمّتين متجاورتين أكبر من عرض حدّه
WAVYEDGE = r"""async () => { const out = [], items = []; const walk = v => { if (Array.isArray(v)) return v.forEach(walk); if (!v || typeof v !== 'object') return; if (v.t === 'lenPick') items.push(v); for (const x of Object.values(v)) if (x && typeof x === 'object') walk(x); };
  for (const L of Object.values(LDATA)) walk([L.flow, L.practice, L.mastery, L.review, L.test, L.sort]);
  for (const v of items) { hush(); FLOW++; show('lesson'); window.__auto = null; const it = ITEM.lenPick.make(JSON.parse(JSON.stringify(v))); ITEM.lenPick.ask(it, 'practice', 0).catch(() => {}); await new Promise(r => setTimeout(r, 120));
    const svg = document.querySelector('#stage svg');
    /* الحافّة اليمنى بالهندسة وحدّ كل عنصر (لا الظلّ): الخطّ المكسور بطرفيه (نصف الحدّ في اتجاه العمود على أول قطعة) ووصلاته المستديرة، وغيره بإطاره ونصف حدّه */
    const ext = e => { const st = e.getAttribute('stroke'), half = st && st !== 'none' ? +(e.getAttribute('stroke-width') || 1) / 2 : 0, d = e.nodeName === 'path' ? e.getAttribute('d') : '';
      if (/^M\s*-?[\d.]+[ ,]-?[\d.]+(?:\s*L\s*-?[\d.]+[ ,]-?[\d.]+)+\s*$/.test(d)) { const P = d.match(/-?[\d.]+/g).map(Number), Q = []; for (let i = 0; i + 1 < P.length; i += 2) Q.push([P[i], P[i + 1]]);
        return Math.max(...Q.map((q, i) => { if (i && i < Q.length - 1) return q[0] + half; const o = Q[i ? i - 1 : 1], L = Math.hypot(o[0] - q[0], o[1] - q[1]) || 1; return q[0] + half * Math.abs(o[1] - q[1]) / L; })); }
      const b = e.getBBox(); return b.x + b.width + half; };
    for (const g of svg.querySelectorAll('[data-len]')) { const body = g.querySelector(':scope > g'), right = body ? Math.max(...[...body.children].map(ext)) : null, x0 = 0;   /* جسم الشيء: المجموعة بعد مستطيل اللمس (.hit)، وكان أول عنصر فقيس المستطيل الفارغ (-Infinity) فنجت الطفرتان */
      const path = body && body.querySelector('path'); let gap = null, wv = false;
      if (path && (v.wavy || []).length) { const P = path.getAttribute('d').match(/-?[\d.]+/g).map(Number), pts = []; for (let i = 0; i + 1 < P.length; i += 2) pts.push([P[i], P[i + 1]]);
        const peaks = pts.filter((q, i) => i > 0 && i < pts.length - 1 && q[1] > pts[i - 1][1] && q[1] >= pts[i + 1][1]).map(q => q[0]); const sw = +((body.querySelectorAll('path')[1] || path).getAttribute('stroke-width'));
        gap = peaks.length > 1 ? [+Math.min(...peaks.slice(1).map((x, i) => Math.abs(x - peaks[i]))).toFixed(1), sw] : null; wv = pts.some(q => Math.abs(q[1]) > .5); }
      out.push([v.q, (v.wavy || []).length > 0, right == null || !isFinite(right) ? null : +(right - x0).toFixed(1), gap, wv]); } }
  hush(); FLOW++; return out; }"""
# وفي «أعد الجملة» عند حلّ التعدّي مع تقليل الحركة تخفت الحلقة الأخرى ما دامت جملة كل سلّة تُقال (الفحص المستقل G2 (6أ): الوميض الرتيب لا يُرى)
TRANSHOOKRM = r"""async () => { RM = true; hush(); FLOW++; const L = LDATA['m1.u4.d4']; CUR = L; show('lesson'); window.__auto = null; window.__clips = []; const v = L.practice.normal.find(x => x.t === 'transPick');
  const it = ITEM.transPick.make(JSON.parse(JSON.stringify(v))); ITEM.transPick.ask(it, 'practice', 3).catch(() => {}); const w = ms => new Promise(r => setTimeout(r, ms));
  for (let i = 0; i < 200 && !(window.__clips || []).some(c => c.startsWith('gen.trans.pick')); i++) await w(20); await w(60);
  const seen = []; const mo = new MutationObserver(() => {}); window.__clips = []; replayLine();
  for (let i = 0; i < 200 && !(window.__clips || []).some(c => c.startsWith('gen.trans.pick')); i++) { const R = [...document.querySelectorAll('#stage [data-help] circle[r="32"]')].map(c => +getComputedStyle(c).opacity), last = (window.__clips || []).slice(-1)[0] || '';
    if (/gen\.trans\.basket/.test(last)) seen.push([last.replace(/_[mf]$/, ''), R.map(x => +x.toFixed(2))]); await w(10); }
  await w(60); const atPick = [...document.querySelectorAll('#stage [data-help] circle[r="32"]')].map(c => +(+getComputedStyle(c).opacity).toFixed(2));   /* وعند سؤال الحلّ تعود الحلقتان (H2 (9): نجت «بلا lit(null)») */
  RM = false; hush(); FLOW++; return [seen, atPick]; }"""
# وتقليل الحركة في anim (الفحص المستقل D2 لبوابة S1-U4 (2)): الظهور العابر يُرى مدّته ثم تعود شفافية العقدة المضمّنة كما كانت (لا ''، فيعتم ظلّ الورشة .22)،
# والخفوت (1←0) يقفز إلى نهايته ولا يُعامل وميضاً يبقى ظاهراً
RMANIM = r"""async () => { const was = RM; RM = true; const svg = newStage(200, null), R = () => el('rect', { width: 40, height: 40 }, svg), A = R(), B = R(), C = R(), D = R(), E = R(), w = ms => new Promise(r => setTimeout(r, ms));
  A.style.opacity = '0.22'; const fa = anim(A, [{ opacity: .22 }, { opacity: .6 }, { opacity: .22 }], { duration: 400 });
  const fb = anim(B, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' });
  /* (الفحص المستقل E2) وحلقة الروبوت (من الصفر وتنتهي بأعلاها)، والرسالة وهي تُعدّ (تخفت ثم تعود)، والطريق المشترك (بـ fill، يبقى بآخره) */
  const fc = anim(C, [{ opacity: 0 }, { opacity: 1 }, { opacity: .3 }, { opacity: 1 }], { duration: 1400 }), fd = anim(D, [{ opacity: 1 }, { opacity: .25 }, { opacity: 1 }], { duration: 420 });
  const fe = anim(E, [{ opacity: 0 }, { opacity: 1 }, { opacity: 1 }, { opacity: .55 }], { duration: 900, fill: 'forwards' });
  await w(120); const op = e => Math.round(100 * +getComputedStyle(e).opacity) / 100, mid = [op(A), op(B), op(C), op(D), op(E)];
  /* (الفحص المستقل F2 (8)): وما تغيّر أثناء المهلة لا تُعاد شفافيته القديمة (الظلّ يُملأ أثناء التلميح)؛ و(F2 (4)): الوهج والحركة ذهاباً وإياباً تُريان ثم تعودان */
  const F = R(), G = R(), H = R(); F.style.opacity = '0.22'; const ff = anim(F, [{ opacity: .22 }, { opacity: .6 }, { opacity: .22 }], { duration: 400 });
  const fg = anim(G, [{ filter: 'none' }, { filter: 'drop-shadow(0 0 8px #1f5f99)' }, { filter: 'none' }], { duration: 1600 }), fh = anim(H, [{ transform: 'scale(1,1)' }, { transform: 'scale(.04,1)' }, { transform: 'scale(1,1)' }], { duration: 1800 });
  await w(120); F.style.opacity = '0.9'; const gm = getComputedStyle(G).filter, hm = getComputedStyle(H).transform;
  await fa.done; await fb.done; await fc.done; await fd.done; await fe.done; await ff.done; await fg.done; await fh.done; const after = [A.style.opacity, E.style.opacity];
  RM = was; return [mid, after, [F.style.opacity, gm, hm, G.style.filter, H.style.transform]]; }"""
# ومع تقليل الحركة تُرى حركات الأداة التي تعود إلى أوّلها (الفحص المستقل F2 (4)): «الحواف» و«رفيع» و«يتدحرج» و«مدبّب» ترسم ما تُريه ثابتاً، في 5 عيّنات على الأقل
RMVIS = r"""async () => { const was = RM; RM = true; const out = [];
  for (const k of ['edges', 'thin', 'roll', 'pointy']) { const svg = newStage(200, null), g = el('g', { transform: 'translate(180 104)' }, svg); el('rect', { x: -30, y: -30, width: 60, height: 60, fill: '#888' }, g);
    const base = [getComputedStyle(g).filter, getComputedStyle(g).transform]; let seen = 0, done = false; VIS[k]({ x: 180, y: 104 }, { g, svg }).then(() => { done = true; });
    for (let i = 0; i < 300 && !done; i++) { const cs = getComputedStyle(g); if (cs.filter !== base[0] || cs.transform !== base[1]) seen++; await new Promise(r => setTimeout(r, 20)); }
    out.push([k, seen, done]); }
  RM = was; return out; }"""
# وشارة العدّ داخل المسرح على الشيء الأعلى (السائق: «١» مقصوصة على الطبق الأعلى في دائرة من تسعة، clipped texts): يُلمس كل شيء فتُرسم شاراته
# وطرفا كل شيء يُقاس يُريان ليلاً ونهاراً (الفحص المستقل C2 لبوابة S1-U4: رأس الفرشاة وفتيل الشمعة بلون داكن بلا حدّ أبيض، فبدت الفرشاة ليلاً تبدأ عند الحلقة
# المعدنية والمشابك قبلها): عند كل طرف جزءٌ يبلغه (على بُعد 5 وحدات) لونُ ملئه أو حدّه بتباين 3:1 مع ورق الوضعين، أو ما يقارب جسم الشيء (0.6 من تباين أكبر أجزائه)
# إن كان الشيء كله فاتحاً (الملعقة نهاراً): فلا يبدو الشيء أقصر مما هو
ENDS = r"""() => { const hex = c => { if (!c || c === 'none' || c === 'transparent') return null; if (c === 'white') c = '#ffffff'; if (/^#[0-9a-f]{3}$/i.test(c)) c = '#' + [...c.slice(1)].map(x => x + x).join(''); const m = c.match(/^#([0-9a-f]{6})$/i); if (m) return [0, 2, 4].map(i => parseInt(m[1].slice(i, i + 2), 16));
    const r = c.match(/rgba?\(([^)]+)\)/); if (r) { const v = r[1].split(',').map(Number); return v.length > 3 && v[3] < .6 ? null : v.slice(0, 3); } return null; };
  const lum = ([r, g, b]) => { const f = x => { x /= 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  hush(); FLOW++; CUR = LDATA['m1.u4.d3']; show('lesson'); const P = { dark: hex('#1d313b'), light: hex('#fffdf8') }, out = []; const svg = newStage(200, { oasis: false, ground: 0 });
  for (const k of Object.keys(HOUSE_DRAW)) { if (k === 'ruler0') continue; const L = 168, H = houseAt(svg, k, L, 300, 100);
    const cons = e => { const op = +(e.getAttribute('opacity') ?? 1) * +(e.getAttribute('fill-opacity') ?? 1), cs = [];
      if (op >= .6 && e.tagName !== 'line') cs.push(hex(e.getAttribute('fill'))); if (+(e.getAttribute('stroke-width') || 0) >= 1.5 && +(e.getAttribute('stroke-opacity') ?? 1) * +(e.getAttribute('opacity') ?? 1) >= .6) cs.push(hex(e.getAttribute('stroke'))); return cs.filter(Boolean); };
    const big = [...H.g.querySelectorAll('rect,path,polygon,circle,ellipse')].map(e => { const b = e.getBBox(); return [b.width * b.height, e]; }).sort((a, b) => b[0] - a[0])[0];
    const body = { dark: 0, light: 0 }; if (big) for (const c of cons(big[1])) for (const m of ['dark', 'light']) body[m] = Math.max(body[m], ratio(c, P[m]));
    for (const [end, X] of [['start', 0], ['end', -L]]) { const best = { dark: 0, light: 0 };
      for (const e of H.g.querySelectorAll('rect,path,polygon,circle,ellipse,line')) { let b; try { b = e.getBBox(); } catch (x) { continue; } if (!b.width && !b.height) continue;
        const m = H.g.getCTM().inverse().multiply(e.getCTM()), xs = [b.x, b.x + b.width].map(x => m.a * x + m.e); if (Math.abs((X === 0 ? Math.max(...xs) : Math.min(...xs)) - X) > 5) continue;
        for (const c of cons(e)) for (const m of ['dark', 'light']) best[m] = Math.max(best[m], ratio(c, P[m])); }
      out.push([k, end, +best.dark.toFixed(2), +best.light.toFixed(2), +Math.min(3, .6 * body.dark).toFixed(2), +Math.min(3, .6 * body.light).toFixed(2)]); } }
  hush(); FLOW++; return out; }"""
# وما ينتظر أن يوضع في الميزان لا تركبه الكفّتان ولا الذراع (الفحص المستقل C2 لبوابة S1-U4: الخيوط الأطول أنزلت الكفّتين على كرة الشاطئ والبالون على الأرض)
PANLAP = r"""async () => { const out = []; CUR = LDATA['m1.u4.d2']; show('lesson');
  for (const [a, b] of [['beachBall', 'stone'], ['balloon', 'toyCar'], ['watermelon', 'leaf'], ['pillow', 'apple'], ['pumpkin', 'feather']]) { hush(); FLOW++; window.__auto = null;
    runItem({ t: 'balance', q: 'pr.c3', a, b, mode: 'test', ask: 'heavy' }, 'practice', { scene: 'panlap' }).catch(() => {});
    for (let w = 0; w < 100 && !(window.__auto && window.__auto.kind === 'weighPut'); w++) await new Promise(r => setTimeout(r, 20));
    const svg = document.querySelector('#stage svg'), B = svg.querySelector('[data-balance]'); const W = [...svg.querySelectorAll('[data-weigh]')].filter(g => !B.contains(g));
    const parts = [...B.querySelectorAll('path,rect,circle,ellipse')].filter(e => !e.closest('[data-weigh]'));
    for (const g of W) { const r = g.getBoundingClientRect(); for (const e of parts) { const q = e.getBoundingClientRect(); const ox = Math.min(r.right, q.right) - Math.max(r.left, q.left), oy = Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top);
      if (ox > 2 && oy > 2) { out.push([g.dataset.weigh, e.tagName, Math.round(ox), Math.round(oy)]); break; } } }
    if (!W.length) out.push([a + '/' + b, 'لا شيء ينتظر']);
    /* والرفّ يُزال حين يفرغ (الفحص المستقل D1 لبوابة S1-U4: بقي فارغاً فوق الميزان) */
    if (window.__auto && window.__auto.kind === 'weighPut') { window.__auto.ok(); await new Promise(r => setTimeout(r, 300)); const n = svg.querySelectorAll('[data-wshelf]').length; if (n) out.push([a + '/' + b, 'الرفّ باقٍ بعد الوضع', n]); } }
  hush(); FLOW++; return out; }"""
# وجمل الشيء العامة بضميره (الفحص المستقل C1 لبوابة S1-U4: «نهايتُه… فهو أقصر» للملعقة، و«من بدايتِه» للفرشاة): كشف سلّة الشبر وحلّ «كم مكعباً طوله؟» المشترك
# لكل شيء في البيانات وتوائمها، والمؤنث (HOUSE_F) بلاحقة .f وحده
GENDOBJ = r"""async () => { const out = []; const seen = new Set(), items = []; const walk = (v, L) => { if (Array.isArray(v)) return v.forEach(x => walk(x, L)); if (!v || typeof v !== 'object') return;
    if ((v.t === 'spanSort' || v.t === 'unitCount' || v.t === 'unitLay') && v.obj) { const k = v.t + v.obj; if (!seen.has(k)) { seen.add(k); items.push([L, v]); } } for (const x of Object.values(v)) if (x && typeof x === 'object') walk(x, L); };
  for (const L of Object.values(LDATA)) walk([L.flow, L.practice, L.mastery, L.review, L.test], L);
  for (const [L, v] of items) { hush(); FLOW++; CUR = L; show('lesson'); window.__auto = null; window.__clips = []; const I = ITEM[v.t], it = I.make(JSON.parse(JSON.stringify(v)));
    if (v.t === 'spanSort') await I.reveal(it, {}); else { const K = v.t === 'unitLay' ? 'gen.lay.together' : 'gen.meas.together'; I.ask(it, 'practice', 3).catch(() => {}); for (let w = 0; w < 60 && !(window.__clips || []).some(c => c.startsWith(K)); w++) await new Promise(r => setTimeout(r, 25)); }
    const c = (window.__clips || []).find(c => /^gen\.(ssort\.reveal|meas\.together|lay\.together)/.test(c)) || null; out.push([v.t, v.obj, HOUSE_F.has(v.obj), c]);
    /* وكشف «ضع المشابك» بضميره أيضاً (الفحص المستقل D1: نجت طفرة حذف .f منه) */
    if (v.t === 'unitLay') { hush(); FLOW++; window.__clips = []; const svg = newStage(270, { oasis: false, ground: 0 }); await I.reveal(it, { ctx: { svg, rowG: el('g', {}, svg) } });
      out.push([v.t + ':reveal', v.obj, HOUSE_F.has(v.obj), (window.__clips || []).find(c => c.startsWith('gen.lay.reveal')) || null]); } }
  hush(); FLOW++; return out; }"""
COUNTB = r"""async () => { const res = []; const seen = new Set(), items = []; const walk = (v, L) => { if (Array.isArray(v)) return v.forEach(x => walk(x, L)); if (!v || typeof v !== 'object') return;
    if (v.t === 'count' && !v.shapeObj) { const k = JSON.stringify(v); if (!seen.has(k)) { seen.add(k); items.push([L, v]); } } for (const x of Object.values(v)) if (x && typeof x === 'object') walk(x, L); };
  for (const L of Object.values(LDATA)) walk([L.flow, L.practice, L.mastery, L.review, L.test], L);
  /* كل بند عدٍّ في البيانات وتوائمه: بالعدّ باللمس (المحاولة الأولى) وبالحلّ المشترك (الرابعة) */
  /* والمبعثر بستّ بذور أخرى (تخطيطه عشوائي: كانت الشارات تتراكب في بعض تخطيطاته وحدها) */
  const sn = new Set(); const runs = items.flatMap(([L, it]) => [[L, it, 0, null], [L, it, 3, null], ...(it.layout === 'scatter' && !sn.has(it.n) && sn.add(it.n) ? [1, 2, 3, 4, 5, 6].map(sd => [L, it, 0, sd]) : [])]);   /* لكل عددٍ مبعثر مرة */
  for (const [L, it, tries, sd] of runs) { if (sd != null) reseed('countb|' + sd); hush(); FLOW++; CUR = L; show('lesson'); window.__auto = null; const I = ITEM[it.t];
    I.ask(I.make(JSON.parse(JSON.stringify(it))), 'practice', tries).catch(() => {}); await new Promise(r => setTimeout(r, tries ? 1500 : 700));
    const svg = document.querySelector('#stage svg'); const T = tries ? [] : [...svg.querySelectorAll('[role=button]')]; for (const g of T) { g.dispatchEvent(new MouseEvent('click', { bubbles: true })); await new Promise(r => setTimeout(r, 30)); }
    await new Promise(r => setTimeout(r, 300)); const H = svg.viewBox.baseVal.height, S = svg.getScreenCTM();   /* بوحدات المسرح: من موضعها على الشاشة */
    const out = [...svg.querySelectorAll('text')].filter(t => /[٠-٩0-9]/.test(t.textContent)).map(t => { const b = t.getBoundingClientRect(); return [t.textContent, Math.round((b.top - S.f) / S.d), Math.round((b.bottom - S.f) / S.d)]; });
    /* ولا تتراكب شارتان (الفحص المستقل C2: الشارة المقلوبة تحت الطبق الأعلى غطّت شارة الذي تحته): مركزا كل شارتين أبعد من 26 وحدة */
    const C = [...svg.querySelectorAll('circle[r="15"]')].map(c => { const b = c.getBoundingClientRect(); return [(b.left + b.width / 2 - S.e) / S.a, (b.top + b.height / 2 - S.f) / S.d]; });
    const lap = []; C.forEach((a, i) => C.slice(i + 1).forEach(b => { const d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (d < 31) lap.push(Math.round(d)); }));   /* الشارة نصف قطرها 15 وحدّها 3: تتماسّان دون 33 (D2) */
    res.push([L.id + ' ' + (it.layout || 'row') + ' ' + (it.n || '') + (tries ? ' معاً' : '') + (sd != null ? ' بذرة ' + sd : ''), C.length, out.filter(([, a, z]) => a < 0 || z > H), lap]); }
  /* وتخطيطات مبنيّة تقع فيها الحالة المقصودة بلا بذرة (الفحص المستقل D2 لبوابة S1-U4 (9): أمسكت البذور طفرة «الشارة المقلوبة» في عرض واحد من 66):
     شيئان في عمود عند أعلى المسرح، وصفٌّ عند أعلاه، وعمودٌ عند حافّته اليمنى واليسرى، فتنقلب الشارة العليا ولا تقع على شارة جارها */
  const SYN = { 'عمود أعلى': [[180, 28], [180, 72], [180, 116]], 'صفّ أعلى': [[60, 26], [104, 26], [148, 26], [192, 26]], 'حافّة يمنى': [[340, 30], [340, 74], [296, 30]], 'حافّة يسرى': [[20, 30], [20, 74], [64, 30]] };   /* أشياء العدّ 44 وحدة بينها على الأقل */
  /* بأداة العدّ نفسها (countTouch) لا بـ badgeSpot وحدها، فتمرّ بما يحسبه المستدعي (الفحص المستقل E2: طفرة D2 في المستدعي أُمسكت بعرضٍ واحد) */
  for (const [nm, P] of Object.entries(SYN)) { hush(); FLOW++; window.__auto = null; const svg = newStage(260, { oasis: false, ground: 0 }), pts = P.map(([x, y]) => ({ x, y }));
    countTouch(svg, pts).catch(() => {}); await new Promise(r => setTimeout(r, 200));
    for (const g of [...svg.querySelectorAll('[role=button]')]) { g.dispatchEvent(new MouseEvent('click', { bubbles: true })); await new Promise(r => setTimeout(r, 30)); }
    await new Promise(r => setTimeout(r, 200)); const S = svg.getScreenCTM(), C = [...svg.querySelectorAll('circle[r="15"]')].map(c => { const b = c.getBoundingClientRect(); return { x: (b.left + b.width / 2 - S.e) / S.a, y: (b.top + b.height / 2 - S.f) / S.d }; }), lap = [];
    C.forEach((a, i) => C.slice(i + 1).forEach(b => { const d = Math.hypot(a.x - b.x, a.y - b.y); if (d < 31) lap.push(Math.round(d)); }));
    res.push(['مبنيّ ' + nm, C.length, C.filter(c => c.y < 15 || c.x < 15 || c.x > 345).map(c => [Math.round(c.x), Math.round(c.y)]), lap]); }
  hush(); FLOW++; return res; }"""
# وهدفٌ يتبدّل بالمفتاح مرةً واحدة ويبقى التركيز عليه (الفحص المستقل D2 لبوابة S1-U4 (4، 6): مستمعٌ يلمس مرتين يعيد المكعب كما كان فلا يُرى خطأ،
# وإعادة رسم البرج كانت تُضيع التركيز إلى BODY): مكعب «فكّك العدد» في S1-U2 د4 بالمسافة ثم بـ Enter
KBTOG = r"""(i) => { const L = [...document.querySelectorAll('#stage svg [role=button]')], e = L[i]; if (i === -1) { const c = L[2]; if (!c) return null; c.focus(); return [c.innerHTML.length, c.innerHTML.replace(/\s/g, '').slice(0, 400)]; }   /* الأوسط: لا أوّل الأهداف (الفحص المستقل E2) */
  const A = document.activeElement, j = L.indexOf(A); return [j, A && A.innerHTML.replace(/\s/g, '').slice(0, 400)]; }"""
KBD_TAB = r"""() => { const a = document.activeElement; return !!(a && a.closest && a.closest('#stage svg') && a.getAttribute('role') === 'button'); }"""
# والتوقّع من الصورة لا يُحكم: توقّعٌ خاطئ ثم قراءة صحيحة للميزان جوابٌ صحيح من المحاولة الأولى، والميزان أمام الطفل حين يُسأل (الفحص المستقل A لبوابة S1-U4)
PICW = r"""async () => { hush(); FLOW++; CUR = LDATA['m1.u4.d2']; show('lesson'); window.__auto = null; let res = null, n0 = -1, k = 0, balAt2 = null, shelf2 = null;
  runItem({ t: 'balance', q: 'pr.4', a: 'balloon', b: 'stone', mode: 'pic' }, 'practice', { scene: 'picw' }).then(r => { res = r; });
  for (let w = 0; w < 400 && !res; w++) { const a = window.__auto; if (a && a.n !== n0) { n0 = a.n; k++; if (k === 2) { balAt2 = !!document.querySelector('#stage [data-balance]'); shelf2 = !document.querySelector('#stage [data-shelf]'); } (k === 1 ? a.wrong : a.ok)(); }
    const go = document.querySelector('#go'); if (go && !go.hidden && !go.disabled) go.click(); await new Promise(r => setTimeout(r, 20)); }
  hush(); FLOW++; return [res && res.ok, res && res.firstTry, balAt2, shelf2]; }"""
# و«ضع في الميزان»: جملة البند (أمرٌ بالوضع) تُقال قبل الوضع، و«أيّهما أخفّ؟» بعد الميل لا جملة البند (الفحص المستقل C1 لبوابة S1-U4: كانت «ضعي… أيّهما أخفّ؟» تُقال بعد الوضع والميل)
PUTQ = r"""async () => { hush(); FLOW++; CUR = LDATA['m1.u4.d2']; show('lesson'); window.__auto = null; window.__clips = []; let res = null, n0 = -1, k = 0, pre = null, post = null;
  runItem({ t: 'balance', q: 'pr.c3', a: 'pumpkin', b: 'feather', mode: 'test', ask: 'light' }, 'practice', { scene: 'putq' }).then(r => { res = r; });
  for (let w = 0; w < 400 && !res; w++) { const a = window.__auto; if (a && a.n !== n0) { n0 = a.n; k++; await new Promise(r => setTimeout(r, 400)); const c = [...window.__clips]; window.__clips = [];
      if (k === 1) pre = [a.kind, c]; else if (k === 2) post = [a.kind, c]; a.ok(); }
    const go = document.querySelector('#go'); if (go && !go.hidden && !go.disabled) go.click(); await new Promise(r => setTimeout(r, 20)); }
  hush(); FLOW++; return [pre, post, res && res.ok]; }"""
# والجملة العددية: الرموز من اليمين مع الأرقام المشرقية ومن اليسار مع الغربية (D251)، والعدد برقميه العشرات على اليسار في الكتابتين (D229 (6))
# (الفحص المستقل A لبوابة S1-U4، حاجب: الرسم من اليمين بـ bidi-override قلب رقمي العدد فكُتب «٨ + ٥ = ٣١»). مواضع الحروف المرسومة فعلاً: في SVG وفي بطاقة الجملة
SENT = r"""async () => { const out = []; const xs = (node, i) => { const r = document.createRange(); r.setStart(node, i); r.setEnd(node, i + 1); const b = r.getBoundingClientRect(); return b.left + b.width / 2; };
  for (const dg of ['east', 'west']) { SET.digits = dg; hush(); FLOW++; CUR = LDATA['m1.u4.d7']; show('lesson');
    const svg = newStage(200, { oasis: false, ground: 0 }); const g = sentenceAt(svg, 180, 100, 8, '+', 5, 13); const t = g.querySelector('text'), s = t.textContent;
    const ten = s.indexOf(DG(13)), a = s.indexOf(DG(8)); const X = i => t.getStartPositionOfChar(i).x;
    out.push([dg, 'svg', s, X(ten) < X(ten + 1), dg === 'east' ? X(a) > X(ten) : X(a) < X(ten)]);
    window.__auto = null; runItem({ t: 'sentence', a: 13, b: 5, op: '-' }, 'explore', { scene: 'sent' }).catch(() => {});
    for (let w = 0; w < 200 && !document.querySelector('.choices.sentences bdo'); w++) await new Promise(r => setTimeout(r, 25));
    for (const bd of document.querySelectorAll('.choices.sentences bdo')) { const n = bd.firstChild, s2 = n.textContent, i13 = s2.indexOf(DG(13)), i5 = s2.lastIndexOf(DG(5)); const iR = s2.search(DG(8)) >= 0 ? s2.indexOf(DG(8)) : s2.indexOf(DG(18));
      out.push([dg, 'card', s2, xs(n, i13) < xs(n, i13 + 1), dg === 'east' ? xs(n, i13) > xs(n, iR) : xs(n, i13) < xs(n, iR)]); } }
  SET.digits = 'east'; hush(); FLOW++; return out; }"""
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
        if bad or not res or res.get('err'): cbase(False, '%s: %s' % (tag, (bad[:1] or [res and res.get('err') or 'لم ينتهِ البند'])[0][:160])); continue
        want = how == 'ok' or wrongs == 0   # بند لا خطأ مقصوداً له (a.wrong) يُجاب صحيحًا في الحالتين
        if res['ok'] != want and mode != 'remedial': cbase(False, '%s: الحكم %s والجواب %s' % (tag, res['ok'], how)); continue
        if mode == 'remedial' and how == 'wrong' and wrongs >= 4: need_twins += 1; twins += t_seen; (None if t_seen else cbase(False, '%s: بلغ الكشف ولم يُشغَّل توأمه' % tag))
        counts[mode] = counts.get(mode, 0) + 1
    # والطريق المرسوم في «أيّ وصف يوصل؟» لا يقطع قطعةً ليست عليه (الفحص المستقل C، ن-ك6: طريق توأم في الدرس 4 مرّ عبر السرير، فالوصف «الصحيح» خطأ بالصورة):
    # كل بند routePick في المحتوى كله (الاكتشاف والتمرين والتوائم والاختبار)، بالرسم الحقيقي على الشاشة
    routes = await pg.evaluate(ROUTES); bad_routes = [r for r in routes if r[2]]
    for lid, q, cut in bad_routes: cbase(False, '%s: طريق «%s»: %s' % (lid, q, cut))
    cbase(bool(routes) and not bad_routes, 'الطرق المرسومة (%d) لا تقطع قطعةً ليست عليها، ولا تمرّ بقطعة منها قبل دورها' % len(routes))
    holds = await pg.evaluate(HOLDS); bad_holds = [r for r in holds if r[2]]
    for lid, q, why in bad_holds: cbase(False, '%s: «%s»: %s' % (lid, q, why))
    cbase(bool(holds) and not bad_holds, 'ما في اليد (%d بنود) مرفوع واليد عليه' % len(holds))
    sames = await pg.evaluate(SAMES); bad_sames = [r for r in sames if not r[3] or r[2] < 50]
    for lid, what, m, ex in bad_sames[:6]: cbase(False, '%s: «بقي كما هو» (%s): شيئان يتلامسان (أقرب مسافة %d، والحجم 44)%s' % (lid, what, m, '' if ex else '، ولا مُضاف'))
    cbase(bool(sames) and not bad_sames, '«بقي كما هو» بإضافة (%d تشغيلاً): لا يتلامس شيئان' % len(sames))
    # على iPhone SE (أضيق شاشة، والمناطق فيه أكبر بوحدات الرسم)، في صفحة مستقلة بمعالج أبطأ أربع مرات
    c2 = await b.new_context(**p.devices['iPhone SE']); p2 = await c2.new_page(); await p2.goto('file://' + os.path.abspath(FILE) + '#fast&seed=7'); await p2.wait_for_timeout(300)
    await p2.evaluate("""() => { localStorage.clear(); localStorage.setItem('hp_kids', JSON.stringify([{ id: 'k1', name: 'سلمى', gender: 'f' }])); localStorage.setItem('hp_kid', JSON.stringify('k1'));
      localStorage.setItem('hp_settings:k1', JSON.stringify({ sessionMax: 0, muted: true })); localStorage.setItem('hp_prog:k1', JSON.stringify({ schema: 3, unlockAll: true })); }""")
    await p2.reload(); await p2.wait_for_timeout(500); cdp = await c2.new_cdp_session(p2); await cdp.send('Emulation.setCPUThrottlingRate', {'rate': 4}); pads = await p2.evaluate(PADS); 
    if probe_on('CARGO'):
      cars = []; c3 = await b.new_context(**p.devices['Galaxy S5']); p3 = await c3.new_page(); await p3.goto('file://' + os.path.abspath(FILE) + '#fast&seed=7'); await p3.wait_for_timeout(300)
      await p3.evaluate("""() => { localStorage.clear(); localStorage.setItem('hp_kids', JSON.stringify([{ id: 'k1', name: 'سلمى', gender: 'f' }])); localStorage.setItem('hp_kid', JSON.stringify('k1'));
        localStorage.setItem('hp_settings:k1', JSON.stringify({ sessionMax: 0, muted: true })); localStorage.setItem('hp_prog:k1', JSON.stringify({ schema: 3, unlockAll: true })); }"""); await p3.reload(); await p3.wait_for_timeout(500)
      for dev, pp in (('iPhone SE', p2), ('Galaxy S5', p3)):
        for lid, px, rk in await pp.evaluate(CARGO_ITEMS):
          for i in range(12):
            base = await pp.evaluate(CARGO, [lid, px, i, -1])
            if not base: break
            for side in (0, 1):
              xy = await pp.evaluate(CARGO, [lid, px, i, side])
              if not xy: continue
              await pp.touchscreen.tap(xy[0], xy[1]); await pp.wait_for_timeout(150); k = await pp.evaluate("() => window.__carK")
              cars.append((dev, rk, i, side, base[0], k))
        await pp.evaluate("() => { hush(); FLOW++; }")
      await c3.close()
      bad_c = [c for c in cars if c[5] != c[4]]
      check(len(cars) >= 40 and len({c[1] for c in cars}) >= 4 and not bad_c, 'لمسة حقيقية داخل حافّة كل عربة وكل واقف في الطابور تختاره هو (iPhone SE وGalaxy S5، %d لمسة في %d صفّاً)%s' % (len(cars), len({c[1] for c in cars}), '' if not bad_c else ': ' + str(bad_c[:8])))
    edges = []
    for px in ['flow[3].items[1].twin', 'practice.challenge[3]']:   # «ما الذي داخل الصندوق؟» (التوأم)، و«ما الذي تحت الصندوق؟»
      await p2.evaluate(EDGE_START, px)
      for _ in range(200):
        if await p2.evaluate("() => !!window.__auto"): break
        await p2.wait_for_timeout(50)
      await p2.wait_for_timeout(500); pt = await p2.evaluate(EDGE_PT)
      if pt: await p2.touchscreen.tap(pt[0], pt[1]); await p2.wait_for_timeout(700)
      edges.append((px, pt, await p2.evaluate("() => (window.__att || []).map(a => a.ans)")))
    await cdp.send('Emulation.setCPUThrottlingRate', {'rate': 1})
    await p2.evaluate(ORD_START); await p2.wait_for_timeout(700); x, y, tr0 = await p2.evaluate(ORD_PT, 1)
    await p2.touchscreen.tap(x, y); await p2.wait_for_timeout(200); sq = await p2.evaluate("() => document.querySelector('#stage svg [data-seq]').dataset.seq")
    await p2.mouse.move(x, y); await p2.mouse.down(); await p2.mouse.move(x + 30, y, steps=6); await p2.mouse.up(); await p2.wait_for_timeout(200); tr1 = (await p2.evaluate(ORD_PT, 1))[2]
    moved = [j for j in range(len(tr0)) if tr0[j] != tr1[j]]
    cbase(sq == '1' and moved == [1], '«رتّب» على iPhone SE: لمسة جسم الشريط الثاني قرب حافته تعدّه هو (%s)، والسحب من النقطة نفسها يحرّكه هو (%s)' % (sq, moved))
    aj = await p2.evaluate(ALIGNJ)   # على أضيق شاشة يكبر المسرح حين يُزال صفّ الأزرار
    cbase(len(aj) == 2 and all(h0 and h0 == h1 for k, h0, h1 in aj), 'زرّا «حاذِ البدايات» و«افرد» لا يغيّران حجم المسرح وسط الانتظار، iPhone SE (%s)' % aj)
    await c2.close()
    bad_e = [e for e in edges if not e[1] or e[2]]
    cbase(not bad_e, 'لمسة على حافة جدار الصندوق السفلى لا تُسجَّل جواباً (iPhone SE)%s' % ('' if not bad_e else ': ' + '; '.join('%s → %s' % (e[0], e[2] or 'لا جدار') for e in bad_e)))
    cbase(pads[0] >= 20 and pads[1] < 25, 'حساب مناطق اللمس (%d منطقة على الطريق، معالج أبطأ أربع مرات): %.1f م.ث (المطلوب أقل من 25)' % tuple(pads))
    sents = await pg.evaluate(SENT); bad_s = [r for r in sents if not (r[3] and r[4])]
    for dg, where, txt, tens, order in bad_s: cbase(False, 'الجملة العددية (%s، %s) «%s»: %s' % (dg, where, txt, 'رقم العشرات ليس على اليسار' if not tens else 'ترتيب الرموز ليس من %s' % ('اليمين' if dg == 'east' else 'اليسار')))
    cbase(len(sents) >= 6 and not bad_s, 'الجملة العددية (%d رسماً بالكتابتين): العشرات على اليسار، والرموز من اليمين مع المشرقية ومن اليسار مع الغربية' % len(sents))
    bh = await pg.evaluate(BALH)
    cbase(not bh, 'ما يوضع في الكفّة لا يخترق ذراع الميزان المرتفعة%s' % ('' if not bh else ': ' + ', '.join('%s (%d > %d)' % tuple(x) for x in bh)))
    if probe_on('PICW'):
      pw = await pg.evaluate(PICW)
      check(pw == [True, True, True, True], 'التوقّع من الصورة لا يُحكم: توقّع خاطئ ثم قراءة صحيحة للميزان صحيحة من المحاولة الأولى، والميزان أمامه ورفّ الصورة ذهب (%s)' % pw)
    if probe_on('PUTQ'):
      pq = await pg.evaluate(PUTQ); pre, post = (pq[0] or [None, []]), (pq[1] or [None, []])
      q_pre = any(c.startswith('m1.u4.d2.pr.c3') for c in pre[1]); q_post = any(c.startswith('m1.u4.d2.pr.c3') for c in post[1]); ask_post = any(c.startswith('gen.weigh.ask.light.f') for c in post[1])   # اليقطينة والريشة مؤنثتان: «المسيها» (الفحص المستقل D1)
      check(pre[0] == 'weighPut' and q_pre and not q_post and ask_post and pq[2], '«ضع في الميزان»: جملة البند قبل الوضع، و«أيّهما أخفّ؟» بعد الميل لا جملة البند (%s)' % pq)
    kb = []
    for lid, px, sel, ok in [('m1.u2.d2', 'practice.normal[5]', '#stage svg [role=button]', lambda a: a['stroke'] == '#f6cf7e'), ('m1.u3.d5', 'practice.normal[0]', '#stage svg [data-n="6"]', lambda a: any(c.startswith('gen.numw.06') for c in a['clips']))]:
      await pg.evaluate(KBD_START, [lid, px]); await pg.wait_for_timeout(1500)
      await pg.evaluate("() => { if (document.activeElement) document.activeElement.blur(); }"); tab = False
      for _ in range(60):
        await pg.keyboard.press('Tab')
        if await pg.evaluate(KBD_TAB): tab = True; break
      fo = await pg.evaluate(KBD_FOCUS, sel); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(900); af = await pg.evaluate(KBD_AFTER, sel)
      kb.append((lid, tab, fo[0], ok(af)))
    await pg.evaluate(KBD_START, ['m1.u2.d4', 'flow[5].items[1]']); await pg.wait_for_timeout(1500); t0 = await pg.evaluate(KBTOG, -1)
    await pg.keyboard.press('Space'); await pg.wait_for_timeout(500); t1 = await pg.evaluate(KBTOG, 0)
    await pg.keyboard.press('Enter'); await pg.wait_for_timeout(500); t2 = await pg.evaluate(KBTOG, 0)
    # وبعد التوقّع من الصورة بالمفتاح لا يقفز التركيز إلى كفّة الميزان (الفحص المستقل E2: Enter ثانية كانت تجيب بالتوقّع دون قراءة الميزان)
    await pg.evaluate(KBD_START, ['m1.u4.d2', 'practice.normal[3]']); await pg.wait_for_timeout(1200); pf0 = await pg.evaluate(KBD_FOCUS, '#stage svg [role=button]')
    await pg.keyboard.press('Enter'); await pg.wait_for_timeout(1800); pf1 = await pg.evaluate("() => { const a = document.activeElement; return !!(a && a.closest && a.closest('#stage svg') && a.getAttribute('role') === 'button'); }")
    cbase(pf0[0] and not pf1, 'بعد التوقّع من الصورة بالمفتاح لا يقفز التركيز إلى كفّة الميزان (%s، %s)' % (pf0, pf1))
    await pg.evaluate("() => { hush(); FLOW++; }")
    cbase(bool(t0) and t1[0] == 2 and t1[1] != t0[1] and t2[0] == 2 and t2[1] == t0[1], 'مكعب «فكّك العدد» بالمفتاح: المسافة تلوّنه مرةً ويبقى التركيز عليه، وEnter يعيده (%s)' % [t0 and t0[0], t1[0], t2[0], t1[1] != (t0 or [0, ''])[1], t2[1] == (t0 or [0, ''])[1]])
    await pg.evaluate("() => { hush(); FLOW++; }")
    cbase(all(t and f and o for _, t, f, o in kb), 'لوحة المفاتيح في الوحدات كلها: Tab يبلغ هدفاً على المسرح، وEnter على وجه المخروط وبلاطة الطريق يلمسهما (%s)' % kb)
    if probe_on('TRANSW'):
      tw = await pg.evaluate(TRANSW); bad_t = [r for r in tw if r[6] != ((r[1] if r[2] > r[4] else r[3]) if r[5] == 'longer' else (r[1] if r[2] < r[4] else r[3]))]
      check(len(tw) >= 7 and any(r[0] == 'board' for r in tw) and not bad_t, 'جواب التعدّي من الطولين في %d بنداً ولوحة المقاول (بلا سلّة «بطول الشبر» يُخطئ من يحكم باسم السلّة)%s' % (len(tw), '' if not bad_t else ': ' + str(bad_t)))
    def wv_want(r):   # الملتوي بما فعله الطفل (جدول المعاني، لا صيغة الكود: الفحص المستقل G1 (8) والدرس 196)
      _, q, ask, want, W = r[0].split(':'); W = [int(x) for x in W.split('.')]; kw, aw = r[1] in W, int(want) in W
      if ask == 'long' and kw: return 'wavyLong'                 # اختار ملتوياً أطولَ وليس الجواب: يظن الملتوي أطول
      if ask == 'short' and not kw and aw: return 'wavyLong'     # ترك الملتوي (الجواب) في «أقصر؟»: يظنّه أطول
      if ask == 'short' and kw: return 'wavyShort'               # اختار ملتوياً أقصرَ وليس الجواب: حكم بما يُرى
      if ask == 'long' and not kw and aw: return 'wavyShort'     # ترك الملتوي (الجواب) في «أطول؟»: حكم بما يُرى فظنّه أقصر
      return 'lenWrong'
    if probe_on('LENERR'):
      le = await pg.evaluate(LENERR); bad_le = [r for r in le if (r[2] == 'lenWrong' and not str(r[0]).startswith('wv:')) or (str(r[0]).startswith('bar:') and r[2] not in ('moreDiff', 'moreWrong')) or (str(r[0]).startswith('ss:') and r[2] != ('ssortWrong' if r[0].endswith(':true') else 'ssortAlign')) or (str(r[0]).startswith('wv:') and r[2] != wv_want(r))]
      check(len(le) >= 20 and not bad_le, 'سؤال الخطأ في بنود الطول غير المحاذاة سؤال المحاذاة، وفي «كم زاد؟» سؤال المقابلة (%d خطأً ممكناً)%s' % (len(le), '' if not bad_le else ': ' + str(bad_le[:8])))
    if probe_on('PRAISEW'):
      pw = await pg.evaluate(PRAISEW); bad_pw = [r for r in pw if r[3] != ('praiseWeighTrap' if r[2] else 'praiseWeigh')]
      check(len(pw) >= 10 and any(r[2] for r in pw) and not all(r[2] for r in pw) and any(r[4] == 'pic-wrong' for r in pw) and not bad_pw, '«لم يخدعك الحجم!» لزوجٍ أكبرُه أخفّ وحده، ولمن لم يخدعه في التوقّع من الصورة (%d عرضاً)%s' % (len(pw), '' if not bad_pw else ': ' + str(bad_pw)))
    if probe_on('TEENONE'):
      te = await pg.evaluate(TEENONE); bad_te = [r for r in te if not r[1] or r[1].startswith('gen.teen.together.one') != (r[0] == 11)]
      check(any(r[0] == 11 for r in te) and any(r[0] > 11 for r in te) and not bad_te, 'الحلّ المشترك في «كم مكعباً؟»: للعدد 11 منفردٌ واحد بلا «اثنا عشر…» (%d عدداً)%s' % (len(te), '' if not bad_te else ': ' + str(bad_te)))
    if probe_on('BACKT'):
      bk = await pg.evaluate(BACKT)
      def take_ok(r):
        n = r[1] - (r[0] - 10) if r[5] >= 3 else r[1]
        if n <= 0: return r[6] is None
        t6 = re.sub(r'_[mf]$', '', r[6] or ''); return t6 == {1: 'gen.backTen.takeOne', 2: 'gen.backTen.takeTwo'}.get(n, 'gen.backTen.take') and (n <= 2 or r[7] == 'gen.numw.%02d' % n)
      bad_bk = [r for r in bk if r[2] or (r[4] and not r[3]) or not take_ok(r)]
      check(len(bk) >= 8 and not bad_bk, '«نرجع إلى العشرة» بعد الحلّ المشترك: الباقي «من الإطار» بعدده، لا «ابدأ بالتي خارج الإطار»، والواحدة والاثنتان بلفظهما (%d بنود)%s' % (len(bk), '' if not bad_bk else ': ' + str(bad_bk)))
    if probe_on('TRANSHELP'):
      th = await pg.evaluate(TRANSHELP)
      def scat(L): return 'short' if L < 112 * .85 else 'long' if L > 112 * 1.15 else 'same'   # SPAN_S، والسلّة من الطول هنا لا من الكود
      nf = lambda c: re.sub(r'_[mf]$', '', c)   # معرّف الجملة بلا صيغة المخاطب
      bad_h = [r for r in th if r[4] != [[266, 0], [94, 1]] or [nf(c) for c in r[5]] != ['gen.trans.basket.' + scat(r[1]), 'gen.trans.basket2.' + scat(r[2]), 'gen.trans.pick.' + r[3]]]
      check(len(th) >= 9 and not bad_h, 'الحلّ المشترك في التعدّي: حلقة على سلّة اليمين بجملتها ثم على سلّة اليسار بجملتها ثم السؤال، في %d بنداً (لا يدلّ على الجواب)%s' % (len(th), '' if not bad_h else ': ' + str(bad_h[:3])))
    if probe_on('RMANIM'):
      ra = await pg.evaluate(RMANIM)
      m_, af_, ex_ = ra
      check(ex_[0] == '0.9' and ex_[1] not in ('none', '') and ex_[2] not in ('none', '') and ex_[3] == '' and ex_[4] == '', 'تقليل الحركة: ما تغيّرت شفافيته أثناء المهلة يبقى (%s)، والوهج والحركة ذهاباً وإياباً تُريان ثم تعودان (%s)' % (ex_[0], ex_[1:]))
      check(abs(m_[0] - .6) < .02 and af_[0] == '0.22' and m_[1] < .05 and m_[2] > .95 and abs(m_[3] - .25) < .02 and m_[4] > .95 and af_[1] == '0.55', 'تقليل الحركة: الظهور العابر يُرى ثم تعود الشفافية المضمّنة (0.22)، والخفوت يقفز إلى نهايته، وحلقة الروبوت والرسالة تُعدّ تُريان، وما بـ fill يبقى بآخره (%s)' % ra)
    if probe_on('RMVIS'):
      rv = await pg.evaluate(RMVIS)
      check(len(rv) == 4 and all(r[1] >= 5 and r[2] for r in rv), 'مع تقليل الحركة تُرى حركات الأداة التي تعود إلى أوّلها (الحواف، رفيع، يتدحرج، مدبّب؛ المطلوب 5 عيّنات على الأقل لكلٍّ): %s' % rv)
    if probe_on('RMFLASH'):
      rf = await pg.evaluate(RMFLASH)
      check(rf[0] >= 5 and rf[2], 'مع تقليل الحركة تُرى حلقة حركة الأداة في التعدّي (%d عيّنة ظاهرة، المطلوب 5 على الأقل؛ %s)' % (rf[0], rf))
    if probe_on('BOARDALIGN'):
      ba = await pg.evaluate(BOARDALIGN)
      check(len(ba) == 2 and ba[0][1][:1] == ['gen.err.ssortAlign.01'] and ba[1][1][:1] == ['gen.err.ssortWrong.01'], 'لوحة المقاول: الخطأ والشبر غير محاذٍ سؤاله المحاذاة، وبعد المحاذاة سؤال المقارنة (%s)' % ba)
    if probe_on('RMHOLD'):
      pr = await b.new_context(**p.devices['Pixel 5']); pp = await pr.new_page(); await pp.goto('file://' + os.path.abspath(FILE) + '#test&seed=7'); await pp.wait_for_timeout(400)
      rh = await pp.evaluate(RMHOLD); await pr.close()
      check(rh[0] >= 570 and abs(rh[1] - .22) < .02, 'تقليل الحركة بالزمن الحقيقي: الظهور العابر ثابتٌ %d م.ث (المطلوب 600 تقريباً على الأقل) ثم يعود (%s)' % (rh[0], rh[1]))
    if probe_on('RMHOLD3'):
      pr = await b.new_context(**p.devices['Pixel 5']); pp = await pr.new_page(); await pp.goto('file://' + os.path.abspath(FILE) + '#test&seed=7'); await pp.wait_for_timeout(400)
      r3 = await pp.evaluate(RMHOLD3); await pr.close()
      check(r3[0] == '0.9' and r3[1] == '0.22' and r3[2] == '1', 'تقليل الحركة بالزمن الحقيقي: ثباتان بمدّتين يعيدان الأصل 0.22 (أثناءهما %s، وبعدهما %s)، وما غيّره الكود بين ثباتين يبقى (%s، المطلوب 1)' % tuple(r3))
    if probe_on('RMHOLD2'):
      r2 = await pg.evaluate(RMHOLD2)
      check(r2[0] == '0.22' and all(x[3] == x[1] and len(set(x[2])) == 1 and x[2][0] != x[1] for x in r2[1:]), 'تقليل الحركة: ثباتان متداخلان يعيدان الأصل (%s)، والفانوس ثلاث مرات يثبّت الظلّ بالقيمة نفسها ثم يعيده (%s)' % (r2[0], r2[1:]))
    if probe_on('WAVYEDGE'):
      we = await pg.evaluate(WAVYEDGE); bad_w = [r for r in we if r[2] is None or r[2] > 2 or r[2] < -1 or (r[4] and not r[3]) or (r[3] and r[3][0] <= r[3][1])]   # وما لم يُقَس إخفاق (الدرس 133)
      check(len(we) >= 40 and sum(1 for r in we if r[4]) >= 4 and not bad_w, 'كل شيء يبدأ عند بدايته بلا تجاوز (الحافّة اليمنى بين بدايته − 1 وبدايته + 2، مقيسةً لكل شيء)، وأمواج الملتوي متباعدة أكثر من عرض حدّه (%d شيئاً، والملتوية منها %d)%s' % (len(we), sum(1 for r in we if r[4]), '' if not bad_w else ': ' + str(bad_w[:6])))
    if probe_on('TRANSHOOKRM'):
      tr, at_pick = await pg.evaluate(TRANSHOOKRM); by = {}
      for k, R in tr: by.setdefault(k, []).append(R)
      okk = len(by) == 2 and all(any(len(R) == 2 and R[i] > .9 and R[1 - i] < .3 for R in by[k]) for i, k in enumerate(sorted(by, key=lambda k: 'basket2' in k)))
      check(okk and len(at_pick) == 2 and all(x > .9 for x in at_pick), 'مع تقليل الحركة في «أعد الجملة» عند حلّ التعدّي: حلقة كل سلّة ظاهرة والأخرى خافتة ما دامت جملتها تُقال (%s)، والحلقتان ظاهرتان عند سؤال الحلّ (%s)' % ({k: by[k][:2] for k in by}, at_pick))
    if probe_on('ENDS'):
      en = await pg.evaluate(ENDS); bad_e2 = [r for r in en if r[2] < r[4] or r[3] < r[5] or not (r[4] > 0 and r[5] > 0)]   # والحدّ صفرٌ حين لا يُقاس الجسم: إخفاق لا نجاح (الدرس 133)
      check(len(en) >= 30 and not bad_e2, 'طرفا كل شيء يُقاس يُريان ليلاً ونهاراً (%d طرفاً: تباين 3:1، أو كجسم الشيء الفاتح)%s' % (len(en), '' if not bad_e2 else ': ' + str(bad_e2)))
    if probe_on('PANLAP'):
      pl = await pg.evaluate(PANLAP)
      check(not pl, 'ما ينتظر أن يوضع في الميزان لا تركبه الكفّتان ولا الذراع، ورفّه يُزال بعد الوضع (خمسة أزواج فيها الكبار)%s' % ('' if not pl else ': ' + str(pl)))
    if probe_on('GENDOBJ'):
      gd = await pg.evaluate(GENDOBJ); bad_g = [r for r in gd if not r[3] or (('.f' in r[3]) != r[2])]
      check(len(gd) >= 8 and not bad_g, 'جمل الشيء العامة بضميره: المؤنث بلاحقة .f وحده (%d شيئاً في سلّة الشبر و«كم مكعباً طوله؟»)%s' % (len(gd), '' if not bad_g else ': ' + str(bad_g)))
    if probe_on('COUNTB'):
      cb = await pg.evaluate(COUNTB)
      cb_out = [(w, o) for w, n, o, l in cb if o]; cb_lap = [(w, l) for w, n, o, l in cb if l]; cb_none = [w for w, n, o, l in cb if n < 2]
      check(len(cb) >= 10 and not cb_none and not cb_out, 'شارات العدّ داخل المسرح في كل بنود العدّ (%d عرضاً، باللمس ومعاً)%s' % (len(cb), '' if not (cb_out or cb_none) else ': ' + str(cb_out or cb_none)))
      check(len(cb) >= 10 and not cb_lap, 'شارات العدّ لا تتراكب في كل بنود العدّ (%d عرضاً)%s' % (len(cb), '' if not cb_lap else ': ' + str(cb_lap)))
    ey = await pg.evaluate(EYE)
    cbase(all(v[0] for v in ey.values()) and not ey['frameGlance:mastery'][1] and not ey['glance:mastery'][1] and ey['frameGlance:practice'][1] and ey['glance:practice'][1] and not any(v[2] for v in ey.values()),
          'عين اللمحة: بلوحة المفاتيح، ومرة واحدة في التقييم، وتعود في التمرين، وتزول بعد الجواب (%s)' % ey)
    if probe_on('WAVYSIGHT'):
      ws = await pg.evaluate(WAVYSIGHT)
      def sight_ok(r):   # الحكم بما يُرى: أعرض شريط لـ«أطول؟» وأضيقه لـ«أقصر؟»
        W = r[5]; x = (max if r[3] == 'long' else min)(W); return W.count(x) == 1 and W.index(x) == r[4]
      hit = [r for r in ws if sight_ok(r)]; byp = {}
      for r in ws:
        if r[1] != 'twin': byp.setdefault((r[0], r[1]), []).append(sight_ok(r))
      allp = [k for k, v in byp.items() if all(v)]
      check(len(ws) >= 4 and len(hit) * 2 <= len(ws) and not allp, 'الملتوي لا يُحلّ بالنظر: الحكم بعرض ما يُرى يصيب %d من %d بنداً ملتوياً، ولا مسار كلّه%s' % (len(hit), len(ws), '' if not (hit or allp) else ': ' + str([r[2] for r in hit]) + str(allp)))
    if probe_on('GARDENG'):
      gg = await pg.evaluate(GARDENG); bad_g = [r for r in gg if not r[1] or r[2] != [re.sub(r'_[mf]$', '', c) for c in r[3]]]
      check(gg and any('.f' in x for r in gg for x in r[2]) and any(not x.endswith('.f') for r in gg for x in r[2]) and not bad_g, '«ميزان الحديقة»: «وَهَاتَانِ» لشيئين مؤنثين و«وَهَذَانِ» لغيرهما (%d لعبة)%s' % (len(gg), '' if not bad_g else ': ' + str(bad_g)))
    if probe_on('WORMWIN'):
      ww = await pg.evaluate(WORMWIN); bad_w = [r for r in ww if not r[1] or r[2] < 0 or not r[3]]
      check(len(ww) >= 3 and not bad_w, '«سباق الديدان»: الفائزة داخل المسرح بعد جريها، والحلقة حولها (%s)' % ww)
    if probe_on('HIDBAR'):
      hb = await pg.evaluate(HIDBAR)
      check(len(hb) == 2 and all(n == 0 for _, n in hb), 'صفّ «حاذِ البدايات» المخفيّ يُزال بعد انتهاء انتظاره (%s)' % hb)
    tg = await pg.evaluate(TRACEGAP)
    cbase(tg > 10, 'لوحا تتبّع العدد برقمين: بينهما %s وحدة (أكثر من 10، فلا تتراكب منطقتا لمسهما)' % tg)
    c31 = await pg.evaluate(CH31)
    cbase(c31 and all(x is True for x in c31), '«صحّح لفوضى» في الدرس 5: كل بطاقة فوق بنائها (%s)' % c31)
    rb = await pg.evaluate(RODB)
    cbase(rb.get('rods') == 0 and rb.get('ones') == 11, '«ابنِ العدد»: إحدى عشرة لمسة «مكعب» تبني إحدى عشرة منفردة بلا عمود (%s عمود، %s منفردة)' % (rb.get('rods'), rb.get('ones')))
    cbase(rb.get('atReveal') == 1, '«ابنِ العدد»: الكشف مكان بناء الطفل، بناء واحد على المسرح (%s)' % rb.get('atReveal'))
    meas = await pg.evaluate(MEASP); bad_m = [r for r in meas if not all(x[4] for x in r[4])]
    for lid, q, bad, n, res in bad_m: cbase(False, '%s: «%s» (%s، %d): الوحدات من %s إلى %s والمطلوب %s' % (lid, q, bad, n, [x[1] for x in res], [x[2] for x in res], [x[3] for x in res]))
    cbase(len(meas) >= 10 and not bad_m, 'القياس الصحيح والخاطئ (%d بنداً): الوحدات من بداية الشيء إلى نهايته، والخطأ واحد' % len(meas))
    pics = await pg.evaluate(PICS); bad_pics = [r for r in pics if not r[2] or r[3] != r[4]]
    for lid, q, d, ws, want in bad_pics: cbase(False, '%s: «%s»: بعد التوقّع الصحيح من الصورة %s' % (lid, q, 'لم ينتهِ البند' if not d else 'لا ميزان فيه الشيئان (%s)' % (ws or 'لا ميزان')))
    cbase(bool(pics) and not bad_pics, 'التوقّع من الصورة (%d بنود) يُجرَّب بالميزان بعد الجواب الصحيح' % len(pics))
    places = await pg.evaluate(PLACES); bad_places = [r for r in places if not r[3] or r[3] == r[2]]
    for lid, q, at, st in bad_places: cbase(False, '%s: «%s»: النجمة تبدأ في المنطقة المطلوبة (%s)' % (lid, q, st or 'لا علامة بداية'))
    cbase(bool(places) and not bad_places, '«ضع النجمة» (%d بنود) لا يبدأ والمطلوب صحيح' % len(places))
    await b.close()
    print('items run:', ', '.join('%s %d' % kv for kv in sorted(counts.items())), '| remedial twins %d of %d' % (twins, need_twins))
    cbase(sum(counts.values()) == 2 * len(items), 'كل البنود (%d بنداً × صحيح وخطأ) انتهت بلا خطأ' % len(items))
  print('FAILS:', len(FAILS)); sys.exit(1 if FAILS else 0)
asyncio.run(main())
