/* =====================================================================
   البنود (D240): كل سؤال للطفل بند من نوع، وكل نوع يعرّف:
     make(spec) ← بند جديد · ask(item, mode) ← {ans, ctx} · judge(item, ans) ← {ok, err, alt}
     hint2(item, r, err) حركة الأداة · together(item, r) الحل المشترك حتى الخطوة الأخيرة · reveal(item, r) · reason(item) · twin(item)
   والتلميح الثلاثي: الأول سؤال خاص بالخطأ لا يذكر الجواب ولا اسم الفئة (errors.json)، والثاني حركة أداة إلزامية،
   والثالث حلّ مشترك يتوقف قبل الخطوة الأخيرة ويُتمّها الطفل، ثم مسألة توأم.
   ===================================================================== */
const ITEM = {};
const itemType = spec => (spec && typeof spec === 'object' && !Array.isArray(spec) && spec.t) ? spec.t : 'sort';
/* السؤال الأول (المستوى 1) للخطأ: من الدرس إن خصّصه، وإلا من سجلّ الأخطاء */
const ERRQ_LAST = {};
function errQ(err, item) { const D = CUR ? LDATA[CUR.id] : null; const o = D && D.errQ && D.errQ[err]; if (o) return o;
  const e = ERRORS[err]; const ids = e && e.q ? (Array.isArray(e.q) ? e.q : Object.keys(e.q)) : ['gen.err.generic.01', 'gen.err.generic.02'];
  let id = pick(ids); if (ids.length > 1) while (id === ERRQ_LAST[err]) id = pick(ids); ERRQ_LAST[err] = id; return id; }   // صيغ متنوّعة للسؤال نفسه (M6)
let streak = 0;
async function praiseFor(item, tries) {
  const T = ITEM[item.itype]; const b = tries > 1 ? 'retry' : ((T.praise && T.praise(item)) || 'praise');
  streak = tries === 1 ? streak + 1 : 0;
  await S(bank(streak === 3 ? 'streak' : b) || 'gen.correct.02');
}
/* mode: practice | explore | remedial (بمساعدة) · mastery | review | test (بلا مساعدة، من المحاولة الأولى) */
async function runItem(spec, mode = 'practice', ctx = {}) {
  /*T*/const outer = { item: window.__item, mode: window.__itemMode };/*/T*/
  try { return await runItem0(spec, mode, ctx); } finally { /*T*/window.__item = outer.item; window.__itemMode = outer.mode || '';/*/T*/ }   /* وضع الفحص: نمط البند الجاري لا يبقى بعد انتهائه */
}
async function runItem0(spec, mode, ctx) {
  const type = itemType(spec); const T = ITEM[type]; if (!T) throw new Error('نوع بند غير معروف: ' + type);
  const item = T.make(spec); item.itype = type; item.spec = spec;   // itype لا type: البند قد يكون شكلاً له type
  const help = mode === 'practice' || mode === 'explore' || mode === 'remedial';
  const scene = ctx.scene || mode; let tries = 0, together = false;
  /*T*/window.__item = item; window.__itemMode = mode;/*/T*/
  while (true) {
    if (help) armIdle(async () => { await S(T.idleLine ? T.idleLine(item) : 'gen.hint.look'); if (T.idle) await T.idle(item); }, { first: firstTime('item:' + type) });
    const t0 = Date.now(); const r = await T.ask(item, mode, tries); disarmIdle();
    const j = T.judge(item, r.ans); tries++;
    logAttempt({ scene, type, tag: item.tag, ans: r.ans, ok: j.ok, firstTry: tries === 1, err: j.ok ? null : (j.err || 'generic'), ms: Date.now() - t0 });
    if (j.ok) {
      if (T.onOk) await T.onOk(item, r, j);
      if (mode === 'test') return { firstTry: tries === 1, ok: true, item };
      if (mode !== 'mastery') { await praiseFor(item, tries); if (j.alt && T.altLine) await S(T.altLine(item, r, j)); const why = T.reason && T.reason(item); if (why) await S(why); }
      else { const why = T.reason && T.reason(item); if (why) await S(why); }
      if (together && help && mode !== 'explore' && T.twin) { const tw = T.twin(item); if (tw) { await S('gen.twin.01'); await runItem(tw, mode, { scene: scene + '-twin' }); } }
      return { firstTry: tries === 1, ok: true, item };
    }
    if (T.onWrong) await T.onWrong(item, r, j);
    if (mode === 'test') { if (T.mark) T.mark(item, r); return { firstTry: false, ok: false, item }; }
    if (mode === 'mastery') { await S('gen.ms.noted'); return { firstTry: false, ok: false, item }; }
    if (mode === 'review') { await T.reveal(item, r); const why = T.reason && T.reason(item); if (why) await S(why); return { firstTry: false, ok: false, item }; }
    if (tries === 1) { await S(errQ(j.err, item)); await sleep(300); continue; }                       // المستوى 1: سؤال
    if (tries === 2) { await S(bank('look') || 'gen.hint2.01'); await T.hint2(item, r, j.err); await sleep(300); continue; }   // المستوى 2: حركة الأداة
    if (tries === 3) { together = true; await T.together(item, r, j.err); continue; }                  // المستوى 3: حلّ مشترك، والخطوة الأخيرة للطفل
    await T.reveal(item, r); { const why = T.reason && T.reason(item); if (why) await S(why); }
    if (help && mode !== 'explore' && T.twin) { const tw = T.twin(item); if (tw) { await S('gen.twin.01'); await runItem(tw, mode, { scene: scene + '-twin' }); } }
    return { firstTry: false, ok: false, item };
  }
}

/* ---------- قواعد البيانات: when → قيمة (أول مطابقة) ---------- */
function matchWhen(w, item, ans) { if (!w) return true;
  for (const [k, v] of Object.entries(w)) { const x = k === 'bin' ? ans : k === 'rot' ? !!item.rot : k === 'solid' ? !!item.solid : k === 'sheet' ? !!item.sheet : item[k]; if (Array.isArray(v) ? !v.includes(x) : x !== v) return false; } return true; }
const ruleOf = (rules, item, ans, key) => { for (const r of rules || []) if (matchWhen(r.when, item, ans)) return r[key]; return null; };

/* ---------- حركات الأداة (المستوى 2، M8: الخطأ يُرى لا يُقال فقط) ---------- */
const VIS = {
  straighten: (item, c) => straighten(c.g, item, item.x ?? 180, item.y ?? 104),
  dashedCircle: async (item, c) => { const r = (item.size || 120) / 2; const k = el('circle', { cx: item.x ?? 180, cy: item.y ?? 104, r, fill: 'none', stroke: css('--compass'), 'stroke-width': 4, 'stroke-dasharray': '8 6' }, c.svg);
    await anim(k, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 600 }).done; await sleep(1400); },
  vertices: async (item, c) => { if (!item.type || !shapeGeom(item).poly) return VIS.edges(item, c); const P = worldPoly({ ...item, x: item.x ?? 180, y: item.y ?? 104 }); const m = el('g', {}, c.svg);
    for (const [i, [x, y]] of P.entries()) { badge(m, x, y, i + 1); SFX.tick(); await S(numw(i + 1), { noGap: true, num: true }); } await sleep(700); m.remove(); },
  edges: async (item, c) => { const g = c.g; await anim(g, [{ filter: 'none' }, { filter: 'drop-shadow(0 0 8px #1f5f99)' }, { filter: 'none' }], { duration: 1600 }).done; },
  sides: async (item, c) => { const P = worldPoly({ ...item, x: item.x ?? 180, y: item.y ?? 104 }); if (!P.length) return VIS.edges(item, c); const m = el('g', {}, c.svg);
    for (const [i, a] of P.entries()) { const b = P[(i + 1) % P.length]; el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: css('--rect'), 'stroke-width': 8, 'stroke-linecap': 'round' }, m); badge(m, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, i + 1, css('--triangle')); SFX.tick(); await S(numw(i + 1), { noGap: true, num: true }); }
    await sleep(700); m.remove(); },
  compareSides: async (item, c) => { const P = worldPoly({ ...item, x: item.x ?? 180, y: item.y ?? 104 }); if (P.length !== 4) return VIS.sides(item, c);
    const m = el('g', {}, c.svg); const [a, b, d] = [P[0], P[1], P[3]];
    el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: css('--rect'), 'stroke-width': 9, 'stroke-linecap': 'round' }, m); el('line', { x1: a[0], y1: a[1], x2: d[0], y2: d[1], stroke: css('--square'), 'stroke-width': 9, 'stroke-linecap': 'round' }, m);
    await sleep(1800); m.remove(); },
  corner: async (item, c) => { const P = worldPoly({ ...item, x: item.x ?? 180, y: item.y ?? 104 }); const m = el('g', {}, c.svg);
    for (const [i, p] of P.entries()) { const a = P[(i + P.length - 1) % P.length], b = P[(i + 1) % P.length];
      const u = [a[0] - p[0], a[1] - p[1]], v = [b[0] - p[0], b[1] - p[1]]; const lu = Math.hypot(...u), lv = Math.hypot(...v); const cos = (u[0] * v[0] + u[1] * v[1]) / (lu * lv);
      const right = Math.abs(cos) < .08; const s = 22; const q1 = [p[0] + u[0] / lu * s, p[1] + u[1] / lu * s], q2 = [p[0] + v[0] / lv * s, p[1] + v[1] / lv * s];
      el('path', { d: `M${q1[0]} ${q1[1]} L${q1[0] + v[0] / lv * s} ${q1[1] + v[1] / lv * s} L${q2[0]} ${q2[1]}`, fill: 'none', stroke: right ? css('--good') : css('--think'), 'stroke-width': 4 }, m);
      SFX.tick(); await sleep(450); }
    await sleep(1200); m.remove(); },
  thin: async (item, c) => { const x = item.x ?? 180, y = item.y ?? 104; await anim(c.g, [{ transform: `translate(${x}px,${y}px) scale(1,1)` }, { transform: `translate(${x}px,${y}px) scale(.04,1)` }, { transform: `translate(${x}px,${y}px) scale(1,1)` }], { duration: 1800, easing: 'ease-in-out' }).done; },
  roll: async (item, c) => { await anim(c.g, [{ transform: 'translate(180px,104px) rotate(0)' }, { transform: 'translate(220px,104px) rotate(40deg)' }, { transform: 'translate(180px,104px) rotate(0)' }], { duration: 1400 }).done; },
  pointy: async (item, c) => { const g = c.g; await anim(g, [{ transform: g.getAttribute('transform') }, { transform: g.getAttribute('transform') + ' scale(1.08)' }, { transform: g.getAttribute('transform') }], { duration: 900, iterations: 2 }).done; },
  riddle: async (item) => { await S(item.riddle[0]); },
  coneRoll: async (item, c) => { const o = el('svg', { x: 0, y: 0, width: 360, height: +c.svg.getAttribute('viewBox').split(' ')[3], viewBox: '0 0 360 300', preserveAspectRatio: 'xMidYMid slice' }, c.svg); topView(o); await rollTop(o, 'cone'); await sleep(500); o.remove(); },
  faces: async (item, c) => { const fs = [...c.g.querySelectorAll('[data-face]')].filter(f => f.dataset.face !== 'curved'); fs.forEach(f => { f.setAttribute('stroke', css('--compass')); f.setAttribute('stroke-width', 6); }); await sleep(1600); fs.forEach(f => { f.setAttribute('stroke', '#fff'); f.setAttribute('stroke-width', 3); }); },
  shelf: async () => {},
};

/* ================= فرز (السلال) ================= */
const SOLID_BINS = ['cube', 'sphere', 'cylinder', 'cone', 'flat', 'solid'];
const noShadowIfMixed = list => { if (list.some(s => s.solid) && list.some(s => !s.solid)) list.forEach(s => s.noShadow = true); return list; };   /* خيارات فيها مسطّح ومجسّم: بلا ظلّ (D238) */
function sortCfg() { const D = CUR ? LDATA[CUR.id] : null; return (D && D.sort) || { bins: ['other'], errors: [], reasons: [], twins: {} }; }
ITEM.sort = {
  make(spec) { const cfg = sortCfg(); const ref = spec && spec.mk ? spec.mk : spec; const item = make(ref);
    if ((spec && spec.kindOf) || cfg.kindOf) { item.kind = item.solid ? 'solid' : 'flat'; item.noShadow = true; }   /* D238: الظلّ ليس قاعدة للتمييز بين المسطّح والمجسّم */
    const bins = (spec && spec.bins) || cfg.bins; if (bins.some(b => SOLID_BINS.includes(b))) item.noShadow = true;   /* وفي كل فرز فيه مجسّمات: الورقة بين المجسّمات لا تُعرف بغياب ظلّها (D238) */
    if (spec && spec.kindOf) item.kindOf = spec.kindOf; item.bins = bins; item.trueKind = item.kind; if (!item.riddle && !bins.includes(item.kind)) item.kind = 'other';
    item.accept = (cfg.accept && cfg.accept[item.kind]) || []; return item; },
  ask(item, mode) { const cfg = sortCfg();
    let intro = null;
    if (!item.riddle) { const nm = objClip(item); intro = [nm && lineOf(nm), lineOf(item.kindOf || cfg.kindOf ? 'gen.sort.askFS' : 'gen.sort.ask')].filter(Boolean); intro.forEach(l => say(...l, { free: true })); }   /* سؤال مسموع واسم الشيء (المبدأ 8) */
    else say(...lineOf(item.riddle[0]), { free: true });
    const newBins = String(item.bins) !== String(cfg.bins);   /* سلال غير سلال الدرس (البند المشتبك): تُقرأ أيضاً، فلا تمرين قبلها يسمّيها */
    return askSort(item, item.bins, { readBins: !item.riddle && (mode === 'review' || mode === 'test' || newBins), intro }).then(r => { hush(); return { ans: r.bin, ctx: r }; }); },
  judge(item, bin) { if (bin === item.kind) return { ok: true }; if (item.accept.includes(bin)) return { ok: true, alt: true };
    return { ok: false, err: ruleOf(sortCfg().errors, item, bin, 'err') || 'generic' }; },
  onOk(item, r) { const b = r.ctx.binsEl.querySelector(`[data-k="${r.ans}"]`); b.classList.add('ok'); SFX.good(); anim(r.ctx.g, [{ opacity: 1 }, { opacity: 0, transform: 'translate(180px,250px) scale(.25)' }], { duration: 450, fill: 'forwards' }); },
  onWrong(item, r) { const b = r.ctx.binsEl.querySelector(`[data-k="${r.ans}"]`); b.classList.add('no', 'shut'); SFX.soft(); },
  altLine(item) { const cfg = sortCfg(); return cfg.acceptLine && cfg.acceptLine[item.kind]; },
  praise() { return sortCfg().praise || 'praise'; },
  hint2(item, r, err) { const v = (ERRORS[err] && ERRORS[err].vis) || 'edges'; return (VIS[v] || VIS.edges)(item, r.ctx); },
  async together(item) { await S('gen.solve.' + item.kind); },
  async reveal(item, r) { const b = r.ctx.binsEl.querySelector(`[data-k="${item.kind}"]`); if (b) b.classList.add('ok'); await sleep(500); },
  mark(item, r) { const b = r.ctx.binsEl.querySelector(`[data-k="${item.kind}"]`); if (b) b.classList.add('ok'); },
  /* شيء من درس آخر لا سلّة لنوعه هنا (البند المشتبك): السبب يسمّيه بنوعه الحقيقي، فلا يقال عن مكعب «ليس مكعباً» */
  reason(item) { const cfg = sortCfg(); if (item.kind === 'other' && item.trueKind && (cfg.bins || []).includes(item.trueKind) && GL['gen.why.notHere.' + item.trueKind]) return 'gen.why.notHere.' + item.trueKind;   /* لنوعه سلّة في درسه لا في هذه السلال */
    return ruleOf(cfg.reasons, item, null, 'id'); },
  twin(item) { const t = sortCfg().twins || {}; return t[item.tag] || t['*']; },
};

/* ================= اختيار صورة من صور (التحدّي و«خمّن الشكل») ================= */
ITEM.pick = {
  make(spec) { const opts = noShadowIfMixed(spec.opts.map(r => make(r))); return { ...spec, opts, tag: spec.tag || 'pick' }; },
  async ask(item) { const svg = newStage(250, { oasis: false, ground: 0 }); const order = item.order || (item.order = shuffle(item.opts.map((_, i) => i)));
    /*T*/window.__test = { ans: order.indexOf(item.ans) };/*/T*/
    const n = order.length, cols = n <= 3 ? n : 2, rows = Math.ceil(n / cols), cw = 320 / cols, box = Math.min(96, cw - 18);   // أربعة خيارات فأكثر: شبكة عمودين لا صفّ متراكب
    const gs = order.map((oi, pos) => { const x = 340 - (pos % cols + .5) * cw, y = rows === 1 ? 120 : 68 + Math.floor(pos / cols) * 114; const g = fitThing(svg, item.opts[oi], x, y, box); return { g, k: oi, x, y, r: box * .64, label: (item.opts[oi].label || labelText('shapeOne')) }; });   /* اسم محايد لا يكشف الجواب */
    const qs = [].concat(item.q); let answered = false; const p = tapOne(gs, { ok: item.ans }).then(k => { answered = true; hush(); return k; });
    (async () => { for (const q of qs) { if (answered) break; await say(...lineOf(q), { free: true }); } })();
    const k = await p; return { ans: k, ctx: { svg, gs } }; },
  judge(item, k) { return k === item.ans ? { ok: true } : { ok: false, err: item.err || 'generic' }; },
  onOk(item, r) { SFX.good(); const t = r.ctx.gs.find(x => x.k === r.ans); el('circle', { cx: t.x, cy: t.y, r: t.r, fill: 'none', stroke: css('--good'), 'stroke-width': 5 }, r.ctx.svg); },
  onWrong() { SFX.soft(); },
  mark(item, r) { const t = r.ctx.gs.find(x => x.k === item.ans); el('circle', { cx: t.x, cy: t.y, r: t.r, fill: 'none', stroke: css('--good'), 'stroke-width': 5 }, r.ctx.svg); },
  async hint2(item, r) { for (const t of r.ctx.gs) await VIS.edges(null, { g: t.g, svg: r.ctx.svg }); },   // ننظر إلى كل خيار بالدور، بلا كشف
  async together(item) { await S(item.solve || ('gen.solve.' + (item.opts[item.ans].kind || 'other'))); },
  async reveal(item, r) { ITEM.pick.mark(item, r); await sleep(600); },
  reason(item) { return item.why || null; },
  twin(item) { return item.twin || null; },
};
