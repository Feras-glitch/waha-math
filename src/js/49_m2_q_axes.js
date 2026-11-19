/* =====================================================================
   S2-U5 «محاور القصر» (المرحلة 2، نوفمبر 2026)
   د1 صورة النقطة والبعد المتساوي (C170)، ومحور التماثل وطرق التحقق الثلاث (C171)، والواصل عمودي على المحور ويقطعه في منتصفه (C172)، والطيّ وخط التماثل (C021، C022)
   د2 شبه المنحرف متساوي الساقين (C178)، وعدد المحاور (C173)، والمنتظم ذو n ضلعاً له n محوراً (C174)، والمحاور المائلة (C175)
   د3 إكمال الشكل بالنسبة لمحور رأسي وأفقي وقطري (C176) · د4 التماثل في عالمنا (C177) ومهمة «قصر المرايا» · د5 الاختبار
   المحاور تُحسب من الرؤوس لا تُكتب باليد: كل محور يمرّ بمركز الرؤوس، ويحمل كل رأس إلى رأس. والطيّ هو الحكم: النصف المطويّ يُرى شفّافاً فوق أخيه.
   ===================================================================== */
const AXC = { line: '#c8392d', img: '#2f6fb0', pt: '#1f4f7a', fold: '#f2c66d', guide: '#8e6bbf', ok: '#2f9d6b' };
const axMid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
/* انعكاس نقطة على خط يمرّ بـ at بزاوية ang (بالدرجات، الأفقي 0، والرأسي 90، وy إلى الأسفل في الرسم) */
const axRefl = (q, at, ang) => { const a = ang * Math.PI / 180, u = [Math.cos(a), -Math.sin(a)], d = [q[0] - at[0], q[1] - at[1]], t = d[0] * u[0] + d[1] * u[1]; return [at[0] + 2 * t * u[0] - d[0], at[1] + 2 * t * u[1] - d[1]]; };
const axHas = (P, ang, at = [0, 0]) => P.every(q => { const r = axRefl(q, at, ang); return P.some(p => Math.hypot(p[0] - r[0], p[1] - r[1]) < 1.5); });
const axNorm = a => +((((a % 180) + 180) % 180)).toFixed(2);
/* المحاور كلها: كل محور يمرّ بمركز الرؤوس وبرأس أو بمنتصف ضلع، فتكفي هذه الاتجاهات مرشّحةً */
function axesOf(P) { const n = P.length, C = [...P, ...P.map((p, i) => axMid(p, P[(i + 1) % n]))], out = [];
  for (const q of C) { if (Math.hypot(q[0], q[1]) < 1) continue; const a = axNorm(Math.atan2(-q[1], q[0]) * 180 / Math.PI); if (out.some(b => Math.abs(b - a) < .6 || Math.abs(Math.abs(b - a) - 180) < .6)) continue; if (axHas(P, a)) out.push(a); }
  return out.sort((x, y) => x - y); }
/* الشكل: من مكتبة المضلعات (k) بدورانه وتكبيره، رؤوسه حول مركزها؛ أو رسماً من مكتبة S1-U6 (sym) بخطوط تماثله */
function axShape(spec) { axSymReady();
  if (spec.sym) { const D = SYM[spec.sym], rot = spec.rot || 0; return { sym: spec.sym, P: null, axes: D.lines === 'all' ? 'all' : D.lines.map(a => axNorm(a - rot)), near: !!D.near, central: false }; }
  const sh = POLYS[spec.k]; if (sh.circle) return { k: spec.k, P: null, circle: sh.circle * (spec.s || 1), axes: 'all', central: true };
  const P0 = polyXf(sh.p, [0, 0], spec.rot || 0, spec.s || 1), n = P0.length, c = P0.reduce((s, p) => [s[0] + p[0] / n, s[1] + p[1] / n], [0, 0]), P = P0.map(p => [p[0] - c[0], p[1] - c[1]]);
  return { k: spec.k, P, axes: axesOf(P), central: P.every(q => P.some(p => Math.hypot(p[0] + q[0], p[1] + q[1]) < 1.5)) }; }
/* خط البند: زاوية تمرّ بالمركز (ang)، أو خط يمرّ بموضعين من الشكل (thru: رأسان i، أو منتصفا ضلعين 'm'+i) */
function axLineOf(S, spec) { if (spec.thru && S.P) { const n = S.P.length, pt = x => typeof x === 'number' ? S.P[x] : axMid(S.P[+x.slice(1)], S.P[(+x.slice(1) + 1) % n]), A = pt(spec.thru[0]), B = pt(spec.thru[1]); return { at: A, ang: axNorm(Math.atan2(-(B[1] - A[1]), B[0] - A[0]) * 180 / Math.PI) }; }
  return { at: [0, 0], ang: spec.ang ?? 90 }; }
const axIsAxis = (S, L) => S.axes === 'all' ? Math.hypot(L.at[0], L.at[1]) < 1 : S.P ? axHas(S.P, L.ang, L.at) : Math.hypot(L.at[0], L.at[1]) < 1 && S.axes.some(a => Math.abs(a - axNorm(L.ang)) < .6);
let AX_ID = 0;
async function axTween(ms, fn) { const N = 14; for (let i = 0; i <= N; i++) { fn(i / N); if (i < N) await sleep(ms / N); } }
/* شكل يُطوى على خطّه: نصفان مقصوصان بالخط، والمتحرّك ينعكس عليه ويُرى شفّافاً. يعيد { g، line، fold()، open()، flat()، match } */
function axFoldAt(parent, spec, C, L, o = {}) { const S = o.S || axShape(spec), id = 'axc' + (++AX_ID), phi = 90 - L.ang, at = L.at, k = o.k || 1;
  if (S.sym) { const F = symFoldAt(parent, S.sym, C[0], C[1], o.symK || 1.7, L.ang, spec.rot || 0, { lineR: o.lineR || 60, lineColor: AXC.line, line: o.line }); F.match = axIsAxis(S, L); return F; }
  const g = el('g', { transform: `translate(${C[0]} ${C[1]}) scale(${k})`, 'data-fold': spec.k }, parent), T0 = `translate(${at[0]} ${at[1]}) rotate(${phi})`;
  for (const [s, x0] of [['a', -.5], ['b', -400]]) { const cp = el('clipPath', { id: id + s }, g); el('rect', { x: x0, y: -400, width: 400.5, height: 800, transform: T0 }, cp); }
  const A = el('g', { 'clip-path': `url(#${id}a)` }, g), Bw = el('g', {}, g), B = el('g', { 'clip-path': `url(#${id}b)` }, Bw);
  const draw = (h, fill) => S.circle ? el('circle', { r: S.circle, fill, stroke: PLY.edge, 'stroke-width': 4 }, h) : el('polygon', { points: polyStr(S.P), fill, stroke: PLY.edge, 'stroke-width': 4, 'stroke-linejoin': 'round' }, h);
  draw(A, o.fill || PLY.fill); draw(B, o.fill || PLY.fill);
  const a = L.ang * Math.PI / 180, u = [Math.cos(a), -Math.sin(a)], R0 = o.lineR || 112, tf = -(at[0] * u[0] + at[1] * u[1]), F0 = [at[0] + tf * u[0], at[1] + tf * u[1]];   /* الخط متناظر حول أقرب نقطة فيه إلى مركز الشكل */
  const line = el('line', { x1: F0[0] - u[0] * R0, y1: F0[1] - u[1] * R0, x2: F0[0] + u[0] * R0, y2: F0[1] + u[1] * R0, stroke: AXC.line, 'stroke-width': 3.4, 'stroke-dasharray': '9 6', 'stroke-linecap': 'round', 'pointer-events': 'none', opacity: o.line === false ? 0 : 1 }, g);
  const set = s => Bw.setAttribute('transform', `${T0} scale(${s} 1) rotate(${-phi}) translate(${-at[0]} ${-at[1]})`);
  const tint = on => B.querySelector('polygon,circle').setAttribute('fill', on ? AXC.fold : (o.fill || PLY.fill));
  let folded = false;
  return { g, line, S, match: axIsAxis(S, L),
    async fold(ms = 800) { if (folded) return; folded = true; SFX.tick(); tint(true); await axTween(ms, t => { set(1 - 2 * t); Bw.setAttribute('opacity', 1 - .45 * t); }); },
    async open(ms = 500) { if (!folded) return; folded = false; await axTween(ms, t => { set(-1 + 2 * t); Bw.setAttribute('opacity', .55 + .45 * t); }); tint(false); },
    flat() { folded = true; tint(true); set(-1); Bw.setAttribute('opacity', .55); } }; }
const axStage = (H = 250) => { const svg = newStage(H, { oasis: false, ground: 0 }); plyFrame(svg, H - 28); return svg; };
const AX_C = [180, 122];
const axYesNo = want => choosePick([['yes', labelText('axYes'), '<i></i>', 'gen.ax.yes'], ['no', labelText('axNo'), '<i></i>', 'gen.ax.no']], want);
/* المحاور مرسومة خطوطاً متقطّعة (للحلّ والتذكّر) */
function axLinesAt(parent, S, C, o = {}) { const g = el('g', { 'pointer-events': 'none' }, parent), R0 = o.r || 104, angs = S.axes === 'all' ? [0, 30, 60, 90, 120, 150] : S.axes;
  angs.forEach((ang, i) => { const a = ang * Math.PI / 180, u = [Math.cos(a), -Math.sin(a)]; el('line', { x1: C[0] - u[0] * R0, y1: C[1] - u[1] * R0, x2: C[0] + u[0] * R0, y2: C[1] + u[1] * R0, stroke: o.color || AXC.line, 'stroke-width': 3, 'stroke-dasharray': '9 6', 'stroke-linecap': 'round', opacity: o.dim ? .35 : 1 }, g); });
  return g; }
async function axLinesOneByOne(parent, Sh, C, o = {}) { const g = el('g', { 'pointer-events': 'none' }, parent), R0 = o.r || 104; const angs = Sh.axes === 'all' ? [0, 45, 90, 135, 22.5, 67.5, 112.5, 157.5] : Sh.axes;
  for (const [i, ang] of angs.entries()) { const a = ang * Math.PI / 180, u = [Math.cos(a), -Math.sin(a)]; const ln = el('line', { x1: C[0] - u[0] * R0, y1: C[1] - u[1] * R0, x2: C[0] + u[0] * R0, y2: C[1] + u[1] * R0, stroke: AXC.line, 'stroke-width': 3, 'stroke-dasharray': '9 6', 'stroke-linecap': 'round' }, g); SFX.tick();
    if (o.count && Sh.axes !== 'all') { const p = [C[0] + u[0] * (R0 + 4), C[1] + u[1] * (R0 + 4)]; badge(g, Math.max(36, Math.min(324, p[0])), Math.max(30, Math.min(220, p[1])), i + 1, AXC.line); await S(numw(i + 1), { noGap: true, num: true }); } else await sleep(FAST ? 20 : 260); }
  return g; }

/* ================= ① هل الخط محور تماثل؟ (C171): يحكم الطفل ثم يُطوى الشكل فيتحقق. k أو sym، ang أو thru، rot ================= */
ITEM.axisIs = {
  make(spec) { const Sh = axShape(spec), L = axLineOf(Sh, spec), want = axIsAxis(Sh, L) ? 'yes' : 'no'; return { ...spec, want, cs: Sh.central && Math.hypot(L.at[0], L.at[1]) < 1, tag: 'axis-is-' + want }; },
  async ask(item, mode, tries) { const svg = axStage(), Sh = axShape(item), F = axFoldAt(svg, item, AX_C, axLineOf(Sh, item), { S: Sh });
    if (tries >= 3) { await S('gen.ax.together.is'); await F.fold(1400); await sleep(500); await F.open(); }   /* الحلّ المشترك: نطوي معاً ونفتح، والحكم للطفل */
    else await S(item.q);
    const a = await axYesNo(item.want); return { ans: a, ctx: { svg, F } }; },
  judge(item, a) { if (a === item.want) return { ok: true }; return { ok: false, err: item.want === 'yes' ? 'axMissed' : item.cs ? 'axHalfArea' : 'axNotAxis' }; },
  async onOk(item, r) { SFX.good(); await r.ctx.F.fold(); await sleep(400); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { await r.ctx.F.fold(1500); await sleep(700); await r.ctx.F.open(); }, async together() {},
  async reveal(item, r) { await r.ctx.F.fold(); await S('gen.ax.reveal.' + item.want); },
  praise: () => 'praiseSym', twin(item) { return item.twin || null; },
};

/* ================= ② كم محور تماثل؟ (C173، C174): k أو sym، rot. الدائرة: محاورها لا تنتهي ================= */
ITEM.axisCount = {
  make(spec) { const Sh = axShape(spec), n = Sh.axes === 'all' ? -1 : Sh.axes.length; return { ...spec, want: n, nums: n < 0 ? null : nearNums(n, 10, 0), tag: 'axis-count' + (n < 0 ? '-all' : '') }; },
  async ask(item, mode, tries) { const svg = axStage(), Sh = axShape(item); let aid = null;
    const F = Sh.sym ? symAt(svg, item.sym, AX_C[0], AX_C[1], 1.7, item.rot || 0) : Sh.circle ? el('circle', { cx: AX_C[0], cy: AX_C[1], r: Sh.circle, fill: PLY.fill, stroke: PLY.edge, 'stroke-width': 4 }, svg) : el('polygon', { points: polyStr(Sh.P.map(p => [p[0] + AX_C[0], p[1] + AX_C[1]])), fill: PLY.fill, stroke: PLY.edge, 'stroke-width': 4, 'stroke-linejoin': 'round' }, svg);
    if (tries >= 3 && Sh.axes !== 'all') { await S('gen.ax.together.count'); aid = await axLinesOneByOne(svg, Sh, AX_C, { count: true }); }
    else await S(item.q);
    if (item.want < 0) { const k = await choosePick([['1', labelText('ax.n.1'), '<i></i>', 'gen.ax.n.1'], ['2', labelText('ax.n.2'), '<i></i>', 'gen.ax.n.2'], ['all', labelText('ax.n.all'), '<i></i>', 'gen.ax.n.all']], 'all'); return { ans: k === 'all' ? -1 : +k, ctx: { svg, Sh, aid } }; }
    const np = numberPick(item.nums, item.want); return { ans: await np.p, ctx: { svg, Sh, np, aid } }; },
  judge(item, k) { if (k === item.want) return { ok: true }; const sh = item.k && POLYS[item.k] ? polyProps(POLYS[item.k]) : {};
    return { ok: false, err: item.want < 0 ? 'axCircleOne' : sh.quad === 'rect' && k === 4 ? 'axDiagRect' : sh.quad === 'para' && k > 0 ? 'axParaHas' : sh.quad === 'trap' && item.want === 0 && k > 0 ? 'axTrapAll' : 'axCountOff' }; },
  onOk(item, r) { SFX.good(); markNum(r, r.ans, 'ok'); }, onWrong(item, r) { SFX.soft(); markNum(r, r.ans, 'no'); },
  async hint2(item, r) { if (r.ctx.Sh.axes === 'all') { const g = axLinesAt(r.ctx.svg, r.ctx.Sh, AX_C, { dim: true }); await sleep(1400); g.remove(); return; } await S('gen.ax.hint.count'); }, async together() {},
  async reveal(item, r) { if (!r.ctx.aid) await axLinesOneByOne(r.ctx.svg, r.ctx.Sh, AX_C); if (item.want < 0) { await S('gen.ax.reveal.all'); return; } await S('gen.ax.reveal.count', { noGap: true }); await S(numw(item.want), { num: true }); },
  praise: () => 'praiseCount', twin(item) { return item.twin || null; },
};

/* ================= ③ عدّاد المحاور (C173، إنتاج): يلمس الطفل موضعين على حافة الشكل (رأسين أو منتصفي ضلعين) فيُطوى عليهما؛
   المحور يبقى بنجمة، وغيره يُمحى. «تمّ» حين يظنّ أنه وجدها كلها، ثم يُعدّ ما وُجد ================= */
ITEM.axisHunt = {
  make(spec) { const Sh = axShape(spec); /*T*/if (TESTHOOK && (!Sh.P || !Sh.axes.length)) testBug('axisHunt: شكل بلا محاور أو بلا رؤوس');/*/T*/ return { ...spec, want: Sh.axes.length, tag: 'axis-hunt' }; },
  async ask(item, mode, tries) { const svg = axStage(262), Sh = axShape(item), C = AX_C, n = Sh.P.length, spots = [...Sh.P.map((p, i) => ({ id: i, p })), ...Sh.P.map((p, i) => ({ id: 'm' + i, p: axMid(p, Sh.P[(i + 1) % n]) }))];
    const base = el('polygon', { points: polyStr(Sh.P.map(p => [p[0] + C[0], p[1] + C[1]])), fill: PLY.fill, stroke: PLY.edge, 'stroke-width': 4, 'stroke-linejoin': 'round' }, svg);
    const found = [], kept = el('g', { 'pointer-events': 'none' }, svg), stars = el('g', { 'pointer-events': 'none' }, svg); let first = null, busy = false, done = false;
    if (tries >= 3) axLinesAt(svg, Sh, C, { dim: true, color: AXC.guide });   /* الحلّ المشترك: المحاور كلها باهتة، وعلى الطفل أن يطويها */
    const dots = spots.map(s => { const g = el('g', { role: 'button', tabindex: 0, 'aria-label': plain(G(labelText(typeof s.id === 'number' ? 'plyVertex' : 'axMidSide'))), 'data-spot': s.id, style: 'cursor:pointer' }, svg), x = s.p[0] + C[0], y = s.p[1] + C[1];
      el('circle', { cx: x, cy: y, r: 22, fill: '#fff', opacity: .01 }, g); el('circle', { cx: x, cy: y, r: typeof s.id === 'number' ? 7 : 6, fill: typeof s.id === 'number' ? PLY.edge : '#fff', stroke: PLY.edge, 'stroke-width': 2.5, class: 'dot' }, g); s.g = g; s.x = x; s.y = y; return s; });
    const sameAx = (a, b) => Math.abs(a - b) < .6 || Math.abs(Math.abs(a - b) - 180) < .6;
    const pickSpot = async s => { if (busy || done) return; if (!first) { first = s; s.g.querySelector('.dot').setAttribute('fill', AXC.line); SFX.tick(); return; } if (first === s) { first.g.querySelector('.dot').setAttribute('fill', typeof s.id === 'number' ? PLY.edge : '#fff'); first = null; return; }
      busy = true; const A = first, B = s; first = null; A.g.querySelector('.dot').setAttribute('fill', typeof A.id === 'number' ? PLY.edge : '#fff');
      const L = { at: A.p, ang: axNorm(Math.atan2(-(B.p[1] - A.p[1]), B.p[0] - A.p[0]) * 180 / Math.PI) }, isAx = axIsAxis(Sh, L), dup = isAx && found.some(f => sameAx(f, L.ang));
      base.setAttribute('opacity', 0); const F = axFoldAt(svg, item, C, L, { S: Sh }); svg.insertBefore(F.g, kept); await F.fold(FAST ? 200 : 700); await sleep(isAx ? 350 : 650); await F.open(FAST ? 100 : 400); F.g.remove(); base.setAttribute('opacity', 1);
      if (isAx && !dup) { found.push(L.ang); const a = L.ang * Math.PI / 180, u = [Math.cos(a), -Math.sin(a)], R0 = 112; el('line', { x1: C[0] - u[0] * R0, y1: C[1] - u[1] * R0, x2: C[0] + u[0] * R0, y2: C[1] + u[1] * R0, stroke: AXC.ok, 'stroke-width': 3.4, 'stroke-dasharray': '9 6', 'stroke-linecap': 'round' }, kept);
        const st = el('path', { d: starPath(318 - (found.length - 1) * 30, 236, 12), fill: '#f2b33d', stroke: '#b07a10', 'stroke-width': 1.5 }, stars); anim(st, [{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 300 }); SFX.good(); }
      else if (!isAx) SFX.soft();
      /*T*/window.__axFound = found.length;/*/T*/ busy = false; };
    dots.forEach(s => { s.g.onclick = () => pickSpot(s); s.g.onkeydown = e => { if (isActKey(e)) { e.preventDefault(); pickSpot(s); } }; });
    /*T*/window.__axSpots = () => dots.map(s => { const m = svg.getScreenCTM(); return { id: s.id, x: m.a * s.x + m.e, y: m.d * s.y + m.f }; }); window.__axHuntWant = (() => { const out = []; for (const ang of Sh.axes) { let pair = null; for (const a of dots) { for (const b of dots) { if (a === b || pair) continue; const L = { at: a.p, ang: axNorm(Math.atan2(-(b.p[1] - a.p[1]), b.p[0] - a.p[0]) * 180 / Math.PI) }; if (sameAx(L.ang, ang) && axIsAxis(Sh, L)) pair = [a.id, b.id]; } } if (pair) out.push(pair); } return out; })(); window.__axFound = 0;/*/T*/
    await S(tries >= 3 ? 'gen.ax.together.hunt' : item.q);
    AUTO({ kind: 'axHunt', ok: () => { for (const a of Sh.axes) found.push(a); rulDoneBtn().click(); }, wrong: () => rulDoneBtn().click() });
    await rulDone(() => { done = true; dots.forEach(s => { s.g.onclick = null; s.g.onkeydown = null; s.g.removeAttribute('role'); }); });
    return { ans: found.length, ctx: { svg, Sh, kept, found } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: k > item.want ? 'axCountOff' : 'axHuntMiss' }; },
  async onOk(item, r) { SFX.good(); await S('gen.ax.huntN', { noGap: true }); await S(numw(item.want), { num: true }); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { await S('gen.ax.hint.hunt'); }, async together() {},
  async reveal(item, r) { r.ctx.kept.innerHTML = ''; await axLinesOneByOne(r.ctx.svg, r.ctx.Sh, AX_C, { count: true }); },
  praise: () => 'praiseSym', twin(item) { return item.twin || null; },
};

/* ================= شبكة النقاط والمحور ================= */
/* ax: v (رأسي عند العمود a) | h (أفقي عند الصف a) | d (قطري صاعد يمرّ بـ a = [r، u]) | e (قطري نازل يمرّ بـ a) */
const AXG = { c: 28, cols: 10, rows: 6, x0: 40, y0: 196 };
const axgP = (G0, r, u) => [G0.x0 + r * G0.c, G0.y0 - u * G0.c];
const axImg = (ax, a, p) => ax === 'v' ? [2 * a - p[0], p[1]] : ax === 'h' ? [p[0], 2 * a - p[1]] : ax === 'd' ? [a[0] + (p[1] - a[1]), a[1] + (p[0] - a[0])] : [a[0] - (p[1] - a[1]), a[1] - (p[0] - a[0])];
/* إحداثيا النقطة بالنسبة للمحور: s بعدها العمودي عنه (بإشارة الجهة)، وt موضعها على امتداده */
const axST = (ax, a, p) => ax === 'v' ? [p[0] - a, p[1]] : ax === 'h' ? [p[1] - a, p[0]] : ax === 'd' ? [(p[0] - a[0]) - (p[1] - a[1]), (p[0] - a[0]) + (p[1] - a[1])] : [(p[0] - a[0]) + (p[1] - a[1]), (p[0] - a[0]) - (p[1] - a[1])];
const axAngOf = ax => ({ v: 90, h: 0, d: 45, e: 135 })[ax];
function axGrid(svg, ax, a, G0 = AXG) { const g = el('g', { 'data-grid': 1 }, svg), { c, cols, rows, x0, y0 } = G0;
  el('rect', { x: x0 - 12, y: y0 - rows * c - 12, width: cols * c + 24, height: rows * c + 24, rx: 10, fill: GEO.paper, stroke: css('--line'), 'stroke-width': 2 }, g);
  for (let i = 0; i <= cols; i++) geoLine(g, x0 + i * c, y0, x0 + i * c, y0 - rows * c, { color: '#d5e2ea', w: 1.3 }); for (let j = 0; j <= rows; j++) geoLine(g, x0, y0 - j * c, x0 + cols * c, y0 - j * c, { color: '#d5e2ea', w: 1.3 });
  /* المحور مقصوص بحدود الشبكة */
  let A, B; if (ax === 'v') { A = axgP(G0, a, 0); B = axgP(G0, a, rows); } else if (ax === 'h') { A = axgP(G0, 0, a); B = axgP(G0, cols, a); }
  else { const sg = ax === 'd' ? 1 : -1, ts = []; for (let t = -20; t <= 20; t++) { const r = a[0] + t, u = a[1] + sg * t; if (r >= 0 && r <= cols && u >= 0 && u <= rows) ts.push(t); } const t0 = Math.min(...ts), t1 = Math.max(...ts); A = axgP(G0, a[0] + t0, a[1] + sg * t0); B = axgP(G0, a[0] + t1, a[1] + sg * t1); }
  const axl = el('line', { x1: A[0], y1: A[1], x2: B[0], y2: B[1], stroke: AXC.line, 'stroke-width': 3.6, 'stroke-dasharray': '10 6', 'stroke-linecap': 'round', 'pointer-events': 'none' }, g);
  const P = (r, u) => axgP(G0, r, u), at = ax === 'v' ? P(a, 0) : ax === 'h' ? P(0, a) : P(a[0], a[1]);
  return { g, P, axl, at, ang: axAngOf(ax), G0, ...G0,
    snap(q) { return [Math.max(0, Math.min(cols, Math.round((q[0] - x0) / c))), Math.max(0, Math.min(rows, Math.round((y0 - q[1]) / c)))]; } }; }
/* الشكل على الشبكة: نقاطه (أقراص) وقطعه */
function axFigAt(parent, Gd, pts, segs, o = {}) { const g = el('g', { 'pointer-events': 'none' }, parent), col = o.color || AXC.pt;
  for (const [i, j] of segs || []) if (pts[i] && pts[j]) { const A = Gd.P(...pts[i]), B = Gd.P(...pts[j]); geoLine(g, A[0], A[1], B[0], B[1], { color: col, w: 4 }); }
  pts.forEach(p => { if (!p) return; const [x, y] = Gd.P(...p); el('circle', { cx: x, cy: y, r: o.r || 6.5, fill: col, stroke: '#fff', 'stroke-width': 2 }, g); }); return g; }
/* المرآة تتحقّق: نسخة من الشكل تنعكس على المحور حتى تقع على صورته */
async function axMirrorCheck(svg, Gd, pts, segs, ms = 900) { const phi = 90 - Gd.ang, T0 = `translate(${Gd.at[0]} ${Gd.at[1]}) rotate(${phi})`, back = `rotate(${-phi}) translate(${-Gd.at[0]} ${-Gd.at[1]})`;
  const w = el('g', { opacity: .7 }, svg); axFigAt(w, Gd, pts, segs, { color: AXC.fold, r: 8 }); await axTween(ms, t => w.setAttribute('transform', `${T0} scale(${1 - 2 * t} 1) ${back}`)); SFX.tick(); return w; }
/* خطّ العمود من النقطة إلى المحور، وشارات المربعات (في القطري: خطوات قطرية) */
async function axGuide(parent, Gd, ax, a, p, o = {}) { const g = el('g', { 'pointer-events': 'none' }, parent), [s] = axST(ax, a, p), q = axImg(ax, a, p), A = Gd.P(...p), B = Gd.P(...q);
  geoLine(g, A[0], A[1], B[0], B[1], { color: AXC.guide, w: 2.6, dash: '6 5' }); if (!o.count) return g;
  const n = ax === 'v' || ax === 'h' ? Math.abs(s) : Math.abs(s) / 2, step = [(B[0] - A[0]) / (2 * n), (B[1] - A[1]) / (2 * n)];
  for (let i = 1; i <= n; i++) { badge(g, A[0] + step[0] * (i - .5) + (ax === 'h' ? 16 : 0), A[1] + step[1] * (i - .5) - (ax === 'h' ? 0 : 16), i, AXC.guide); SFX.tick(); await S(numw(i), { noGap: true, num: true }); }
  return g; }

/* ================= ④ ارسم الصورة (C170، C176، إنتاج): pts نقاط الشكل، segs قطعه، ax وa المحور. يلمس الطفل صورة كل نقطة ليست على المحور بالترتيب
   (النقطة التي دورها محاطة)، فتُرسم القطع حين تكتمل أطرافها؛ ثم تنعكس المرآة على المحور لتتحقّق ================= */
ITEM.ptImage = {
  make(spec) { const off = spec.pts.map((p, i) => i).filter(i => axST(spec.ax, spec.a, spec.pts[i])[0] !== 0); return { ...spec, off, want: off.map(i => axImg(spec.ax, spec.a, spec.pts[i])), tag: 'pt-image-' + spec.ax + (spec.segs ? '-fig' : '') }; },
  async ask(item, mode, tries) { const svg = newStage(252, { oasis: false, ground: 0 }), Gd = axGrid(svg, item.ax, item.a), fig = axFigAt(svg, Gd, item.pts, item.segs);
    const placed = item.pts.map((p, i) => item.off.includes(i) ? null : p), imgL = el('g', { 'pointer-events': 'none' }, svg), ring = el('circle', { r: 13, fill: 'none', stroke: css('--think'), 'stroke-width': 3, 'stroke-dasharray': '5 4', 'pointer-events': 'none' }, svg);
    let cur = 0, guide = null, done = false; const ans = [];
    const redraw = () => { imgL.innerHTML = ''; const imSegs = (item.segs || []).filter(([i, j]) => placed[i] && placed[j]); axFigAt(imgL, Gd, placed, imSegs, { color: AXC.img }); };
    const focus = async () => { if (guide) { guide.remove(); guide = null; } if (cur >= item.off.length) { ring.setAttribute('opacity', 0); return; } const [x, y] = Gd.P(...item.pts[item.off[cur]]); ring.setAttribute('cx', x); ring.setAttribute('cy', y); ring.setAttribute('opacity', 1);
      if (tries >= 3) guide = await axGuide(svg, Gd, item.ax, item.a, item.pts[item.off[cur]], { count: true }); };
    redraw(); await S(tries >= 3 ? 'gen.ax.together.img' : item.q); await focus();
    const fin = new Promise(res => { const put = async q => { if (done || cur >= item.off.length) return; const i = item.off[cur]; placed[i] = q; ans.push(q); SFX.tick(); redraw(); cur++; /*T*/window.__axPlaced = ans.length;/*/T*/ if (cur >= item.off.length) { done = true; input.off(); kg.remove(); res(); } else await focus(); };
      const input = fingerInput(svg, { map: e => { const p = svgPoint(svg, e); return [p.x, p.y]; }, down(q) { if (q[1] > Gd.y0 + 20 || q[1] < Gd.y0 - Gd.rows * Gd.c - 20) return false; put(Gd.snap(q)); return false; }, move() {}, up() {} });
      /* بلوحة المفاتيح: كل تقاطع خانة */
      var kg = el('g', { role: 'grid', 'aria-label': labelText('geoGrid') }, svg); for (let u = Gd.rows; u >= 0; u--) { const row = el('g', { role: 'row' }, kg); for (let r = 0; r <= Gd.cols; r++) { const [x, y] = Gd.P(r, u), b = el('g', { role: 'gridcell', tabindex: 0, 'aria-label': `${DG(r)}، ${DG(u)}` }, row); el('circle', { cx: x, cy: y, r: 10, fill: 'transparent', 'pointer-events': 'none' }, b); b.onkeydown = e => { if (isActKey(e)) { e.preventDefault(); put([r, u]); } }; } }
      /*T*/window.__axAt = (r, u) => { const m = svg.getScreenCTM(), [x, y] = Gd.P(r, u); return { x: m.a * x + m.e, y: m.d * y + m.f }; }; window.__axWant = item.want; window.__axPlaced = 0;/*/T*/
      AUTO({ kind: 'axPts', ok: () => { for (const w of item.want) put(w); }, wrong: () => { const w0 = item.want[0]; put([w0[0], w0[1] + (w0[1] < Gd.rows ? 1 : -1)]); for (let k = 1; k < item.want.length; k++) put(item.want[k]); } }); });
    await gate(fin); AUTO_CLEAR(); if (guide) guide.remove(); ring.remove();
    return { ans, ctx: { svg, Gd, imgL, placed, redraw } }; },
  judge(item, a) { for (let k = 0; k < item.want.length; k++) { const w = item.want[k], q = a[k]; if (q && q[0] === w[0] && q[1] === w[1]) continue; const p = item.pts[item.off[k]], [sp, tp] = axST(item.ax, item.a, p), [sq, tq] = axST(item.ax, item.a, q || p);
      if (k > 0 && a[0]) { const d0 = [a[0][0] - item.pts[item.off[0]][0], a[0][1] - item.pts[item.off[0]][1]]; if (q && q[0] === p[0] + d0[0] && q[1] === p[1] + d0[1]) return { ok: false, err: 'imgShift' }; }
      return { ok: false, err: Math.sign(sq) === Math.sign(sp) ? 'imgSide' : tq === tp ? 'imgDist' : Math.abs(sq) === Math.abs(sp) ? 'imgSlant' : 'imgOff' }; }
    return { ok: true }; },
  async onOk(item, r) { SFX.good(); const w = await axMirrorCheck(r.ctx.svg, r.ctx.Gd, item.pts, item.segs); await sleep(500); w.remove(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const w = await axMirrorCheck(r.ctx.svg, r.ctx.Gd, item.pts, item.segs, 1200); await sleep(800); w.remove(); }, async together() {},
  async reveal(item, r) { item.off.forEach((i, k) => { r.ctx.placed[i] = item.want[k]; }); r.ctx.redraw(); const w = await axMirrorCheck(r.ctx.svg, r.ctx.Gd, item.pts, item.segs); await S('gen.ax.reveal.img'); w.remove(); },
  praise: () => 'praiseSym', twin(item) { return item.twin || null; },
};

/* ================= ⑤ أين المحور؟ (C171، C172، إنتاج): نقطة p وصورتها p2. يلمس الطفل منتصف الواصل بينهما، فيُرسم المحور عمودياً عليه ================= */
ITEM.axisFind = {
  make(spec) { const m = [(spec.p[0] + spec.p2[0]) / 2, (spec.p[1] + spec.p2[1]) / 2]; /*T*/if (TESTHOOK && (m[0] % 1 || m[1] % 1)) testBug('axisFind: المنتصف ليس على الشبكة');/*/T*/ return { ...spec, want: m.join(','), m, tag: 'axis-find' }; },
  async ask(item, mode, tries) { const svg = newStage(252, { oasis: false, ground: 0 }), G0 = AXG, { p, p2: q } = item, dr = q[0] - p[0], du = q[1] - p[1], g0 = Math.abs(dr) && Math.abs(du) ? Math.min(Math.abs(dr), Math.abs(du)) : Math.max(Math.abs(dr), Math.abs(du));
    const Gd = axGrid(svg, 'v', -99, G0); Gd.axl.remove(); const A = Gd.P(...p), B = Gd.P(...q); geoLine(svg, A[0], A[1], B[0], B[1], { color: AXC.guide, w: 3, dash: '7 5' });
    axFigAt(svg, Gd, [p], []); axFigAt(svg, Gd, [q], [], { color: AXC.img });
    const T = []; for (let i = 1; i < g0; i++) { const r = p[0] + dr / g0 * i, u = p[1] + du / g0 * i, [x, y] = Gd.P(r, u), g = el('g', { 'data-k': r + ',' + u }, svg); el('circle', { cx: x, cy: y, r: 9, fill: '#fff', stroke: AXC.guide, 'stroke-width': 2.5 }, g); T.push({ g, k: r + ',' + u, label: labelText('axSpot') }); }
    if (tries >= 3) { const m = helpG(svg), half = g0 / 2; for (let i = 1; i <= half; i++) { const a1 = Gd.P(p[0] + dr / g0 * (i - .5), p[1] + du / g0 * (i - .5)), b1 = Gd.P(q[0] - dr / g0 * (i - .5), q[1] - du / g0 * (i - .5)); badge(m, a1[0], a1[1] - 16, i, css('--think')); badge(m, b1[0], b1[1] - 16, i, AXC.img); } }
    await S(tries >= 3 ? 'gen.ax.together.find' : item.q);
    const k = await tapOne(T, { ok: item.want, pad: 40 }); return { ans: k, ctx: { svg, Gd, A, B, T } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'axMidOff' }; },
  async onOk(item, r) { SFX.good(); await axFindDraw(item, r); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const m = helpG(r.ctx.svg); [item.p, item.p2].forEach(pt => { const [x, y] = r.ctx.Gd.P(...pt); thinkRing(m, [x, y], 16); }); await S('gen.ax.hint.find'); await sleep(600); m.remove(); }, async together() {},
  async reveal(item, r) { await axFindDraw(item, r); await S('gen.ax.reveal.find'); },
  praise: () => 'praiseSym', twin(item) { return item.twin || null; },
};
/* المحور عمودي على الواصل في منتصفه، وعلامة القائمة عنده */
async function axFindDraw(item, r) { const { svg, Gd, A, B } = r.ctx, M = Gd.P(...item.m), d = [B[0] - A[0], B[1] - A[1]], L = Math.hypot(...d), u = [-d[1] / L, d[0] / L], R0 = 96, g = el('g', { 'pointer-events': 'none' }, svg);
  const ln = el('line', { x1: M[0], y1: M[1], x2: M[0], y2: M[1], stroke: AXC.line, 'stroke-width': 3.6, 'stroke-dasharray': '10 6', 'stroke-linecap': 'round' }, g);
  await axTween(600, t => { ln.setAttribute('x1', M[0] - u[0] * R0 * t); ln.setAttribute('y1', M[1] - u[1] * R0 * t); ln.setAttribute('x2', M[0] + u[0] * R0 * t); ln.setAttribute('y2', M[1] + u[1] * R0 * t); });
  const e = [d[0] / L * 12, d[1] / L * 12], f = [u[0] * 12, u[1] * 12]; el('path', { d: `M${M[0] + e[0]} ${M[1] + e[1]} L${M[0] + e[0] + f[0]} ${M[1] + e[1] + f[1]} L${M[0] + f[0]} ${M[1] + f[1]}`, fill: 'none', stroke: AXC.ok, 'stroke-width': 2.8 }, g); SFX.tick(); return g; }

/* ================= ⑥ أيّ صورة صحيحة؟ (C170، C172، C176): ثلاث لوحات صغيرة على شبكة بمحور رأسي؛ في واحدة الصورة صحيحة، وفي الأخريين
   خطأ: البعد (dist)، أو الميل عن العمود (slant)، أو الإزاحة بدل العكس (shift)، أو البقاء في الجهة نفسها (side) ================= */
const AXI_X3 = [290, 180, 70];
function axVariant(kind, pts, a) { return pts.map(p => { const s = p[0] - a; if (s === 0) return p; if (kind === 'ok') return [a - s, p[1]]; if (kind === 'dist') return [a - s - Math.sign(s), p[1]]; if (kind === 'slant') return [a - s, p[1] + 1]; return p; }); }
function axShiftOf(pts, a) { const S0 = pts.map(p => p[0] - a), lo = Math.min(...S0), hi = Math.max(...S0); return pts.map(p => [p[0] - a - (lo + hi) + a, p[1]]); }
ITEM.imageCheck = {
  make(spec) { const kinds = ['ok', ...spec.wrong]; return { ...spec, kinds, want: 'ok', tag: 'image-check-' + spec.wrong.join('-') }; },
  async ask(item, mode, tries) { const svg = newStage(212, { oasis: false, ground: 0 }), order = shuffle(item.kinds), c = 15, panels = [];
    order.forEach((kind, i) => { const g = el('g', { 'data-k': kind }, svg), x0 = AXI_X3[i] - 45, y0 = 160;
      el('rect', { x: x0 - 9, y: y0 - 6 * c - 9, width: 6 * c + 18, height: 6 * c + 18, rx: 10, fill: GEO.paper, stroke: css('--line'), 'stroke-width': 2 }, g);
      for (let k = 0; k <= 6; k++) { geoLine(g, x0 + k * c, y0, x0 + k * c, y0 - 6 * c, { color: '#d5e2ea', w: 1 }); geoLine(g, x0, y0 - k * c, x0 + 6 * c, y0 - k * c, { color: '#d5e2ea', w: 1 }); }
      const P = (r, u) => [x0 + r * c, y0 - u * c], a = 3; geoLine(g, ...P(a, 0), ...P(a, 6), { color: AXC.line, w: 2.6, dash: '6 4' });
      const im = kind === 'shift' ? axShiftOf(item.pts, a) : axVariant(kind, item.pts, a), dr = (pp, col) => { for (const [i2, j2] of item.segs || []) geoLine(g, ...P(...pp[i2]), ...P(...pp[j2]), { color: col, w: 3 }); pp.forEach(p => el('circle', { cx: P(...p)[0], cy: P(...p)[1], r: 4.5, fill: col, stroke: '#fff', 'stroke-width': 1.5 }, g)); };
      dr(item.pts, AXC.pt); dr(im, AXC.img); if (tries >= 3 && kind !== 'ok' && i === order.findIndex(k2 => k2 !== 'ok')) g.setAttribute('opacity', .25);   /* الحلّ المشترك: لوحة خطأ تُبعد */
      panels.push({ g, k: kind, label: labelText('axPanel') + ' ' + DG(i + 1) }); });
    await S(tries >= 3 ? 'gen.ax.together.check' : item.q);
    const live = tries >= 3 ? panels.filter(p => p.g.getAttribute('opacity') !== '0.25') : panels;
    const k = await tapOne(live, { ok: 'ok', pad: false }); return { ans: k, ctx: { svg, panels } }; },
  judge(item, k) { return k === 'ok' ? { ok: true } : { ok: false, err: { dist: 'imgDist', slant: 'imgSlant', shift: 'imgShift', side: 'imgSide' }[k] || 'imgOff' }; },
  onOk(item, r) { SFX.good(); okRing(r.ctx.svg, r.ctx.panels.find(p => p.k === 'ok').g, 2); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.ax.hint.check'); }, async together() {},
  async reveal(item, r) { okRing(r.ctx.svg, r.ctx.panels.find(p => p.k === 'ok').g, 2); await S('gen.ax.reveal.check'); },
  praise: () => 'praiseSym', twin(item) { return item.twin || null; },
};

/* ================= ⑦ اكتشف الخطأ (C176): شكل وصورته، وصورة نقطة واحدة (bad) في غير موضعها بـ off. يلمس الطفل النقطة الخطأ ================= */
ITEM.imageError = {
  make(spec) { return { ...spec, want: String(spec.bad), tag: 'image-error' }; },
  async ask(item, mode, tries) { const svg = newStage(252, { oasis: false, ground: 0 }), Gd = axGrid(svg, item.ax, item.a); axFigAt(svg, Gd, item.pts, item.segs);
    const im = item.pts.map((p, i) => { const q = axImg(item.ax, item.a, p); return i === item.bad ? [q[0] + item.off[0], q[1] + item.off[1]] : q; }); axFigAt(svg, Gd, im, item.segs, { color: AXC.img });
    const T = im.map((q, i) => ({ q, i })).filter(({ i }) => axST(item.ax, item.a, item.pts[i])[0] !== 0).map(({ q, i }) => { const [x, y] = Gd.P(...q), g = el('g', { 'data-k': i }, svg); el('circle', { cx: x, cy: y, r: 13, fill: '#fff', opacity: .01 }, g); return { g, k: String(i), label: labelText('axSpot') }; });
    if (tries >= 3) { const m = helpG(svg); for (const { k } of T.slice(0, 2)) if (k !== item.want) { const q = im[+k]; thinkRing(m, Gd.P(...q), 15); } }   /* الحلّ المشترك: نقطتان صحيحتان محاطتان */
    await S(tries >= 3 ? 'gen.ax.together.err' : item.q);
    const k = await tapOne(T, { ok: item.want, pad: 40 }); return { ans: k, ctx: { svg, Gd, im, T } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'imgErrMiss' }; },
  async onOk(item, r) { SFX.good(); await axGuide(r.ctx.svg, r.ctx.Gd, item.ax, item.a, item.pts[item.bad]); okRing(r.ctx.svg, r.ctx.T.find(t => t.k === item.want).g, 4); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { await S('gen.ax.hint.err'); }, async together() {},
  async reveal(item, r) { await axGuide(r.ctx.svg, r.ctx.Gd, item.ax, item.a, item.pts[item.bad]); okRing(r.ctx.svg, r.ctx.T.find(t => t.k === item.want).g, 4); await S('gen.ax.reveal.err'); },
  praise: () => 'praiseLook', twin(item) { return item.twin || null; },
};

/* ================= ⑧ ساقا شبه المنحرف (C178): الساقان (الضلعان غير المتوازيين) ملوّنتان، وأداة القياس تكتب الأطوال؛ هل الساقان متساويتان؟ ================= */
const axLegs = R => { const P = R.P, n = 4, dir = i => Math.atan2(P[(i + 1) % n][1] - P[i][1], P[(i + 1) % n][0] - P[i][0]), par = (i, j) => { let d = Math.abs(dir(i) - dir(j)) % Math.PI; return Math.min(d, Math.PI - d) < .012; }; return par(0, 2) ? [1, 3] : [0, 2]; };
ITEM.trapLegs = {
  make(spec) { const pr = polyProps({ ...POLYS[spec.k], p: polyXf(POLYS[spec.k].p, [0, 0], spec.rot || 0) }); /*T*/if (TESTHOOK && pr.quad !== 'trap') testBug('trapLegs: ليس شبه منحرف');/*/T*/ const R0 = { P: polyXf(POLYS[spec.k].p, [0, 0], spec.rot || 0) }, [i, j] = axLegs(R0); const eq = Math.abs(cmOf(pr.L[i]) - cmOf(pr.L[j])) < .01; return { ...spec, legs: [i, j], want: eq ? 'eq' : 'ne', tag: 'trap-legs-' + (eq ? 'eq' : 'ne') }; },
  async ask(item, mode, tries) { const svg = axStage(), R = polyAt(svg, item.k, [196, 122], { rot: item.rot || 0 }); item.legs.forEach(i => polyHl(R, 'side', i, AXC.img)); const tools = plyTools(svg, R, { len: true });
    if (tries >= 3) { tools.show('len'); await sleep(400); await S('gen.ax.together.legs'); } else await S(item.q);
    const k = await choosePick([['eq', labelText('axLegsEq'), '<i></i>', 'gen.ax.legs.eq'], ['ne', labelText('axLegsNe'), '<i></i>', 'gen.ax.legs.ne']], item.want); tools.off(); return { ans: k, ctx: { svg, R, tools } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'trapLegs' }; },
  onOk(item, r) { SFX.good(); if (item.want === 'eq') polyMarks(r.ctx.R.g, r.ctx.R, ['eq']); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { r.ctx.tools.show('len'); await sleep(500); await S('gen.ax.hint.legs'); }, async together() {},
  async reveal(item, r) { r.ctx.tools.show('len'); await sleep(400); await S('gen.ax.reveal.legs.' + item.want); },
  praise: () => 'praiseMeasure', twin(item) { return item.twin || null; },
};

/* ================= ⑨ لغز المحاور (C174): ثلاثة أشكال، ولكلٍّ عدد محاوره؛ «لي n محوراً وأضلاعي متساوية» ================= */
ITEM.axisRiddle = {
  make(spec) { const ok = spec.figs.filter(k => { const Sh = axShape({ k }), pr = polyProps(POLYS[k]); return Sh.axes.length === spec.n && (spec.eqSides ? pr.allEqL : true); }); /*T*/if (TESTHOOK && ok.length !== 1) testBug('axisRiddle: الجواب ليس واحداً ' + ok.join(','));/*/T*/ return { ...spec, want: ok[0], tag: 'axis-riddle' }; },
  async ask(item, mode, tries) { const svg = newStage(222, { oasis: false, ground: 0 }), T = item.figs.map((k, i) => { const g = el('g', { 'data-k': k }, svg); el('rect', { x: AXI_X3[i] - 52, y: 26, width: 104, height: 170, rx: 14, fill: GEO.paper, stroke: css('--line'), 'stroke-width': 2 }, g); const xs = POLYS[k].p.map(p => p[0]), w = Math.max(...xs) - Math.min(...xs), sc = Math.min(.55, 84 / w); polyAt(g, k, [AXI_X3[i], 111], { s: sc, dots: false }); return { g, k, label: labelText('plyShape') + ' ' + DG(i + 1) }; });
    if (tries >= 3) { const m = helpG(svg); T.forEach((t, i) => { const Sh = axShape({ k: t.k, s: Math.min(.55, 84 / (Math.max(...POLYS[t.k].p.map(p => p[0])) - Math.min(...POLYS[t.k].p.map(p => p[0])))) }); axLinesAt(m, Sh, [AXI_X3[i], 111], { r: 52, dim: true }); }); }
    await S(tries >= 3 ? 'gen.ax.together.rd' : item.q); const k = await tapOne(T, { ok: item.want, pad: false }); return { ans: k, ctx: { svg, T } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'axRiddle' }; },
  onOk(item, r) { SFX.good(); okRing(r.ctx.svg, r.ctx.T.find(t => t.k === item.want).g, 2); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.ax.hint.rd'); }, async together() {},
  async reveal(item, r) { okRing(r.ctx.svg, r.ctx.T.find(t => t.k === item.want).g, 2); await S('gen.ax.reveal.rd'); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};

/* ================= ⑩ التماثل في عالمنا (C177): ثلاث صور، والمطلوب المتماثلة منها (ask: yes) أو غير المتماثلة (ask: no). الورقة «تقريباً» ================= */
/* رسوم جديدة للوحدة بخطوط تماثلها: نجمة البحر (5)، وزخرفة النجمة الثمانية (8)، وأعلام مخترعة (لا علم بلد)، وحروف بخطّين */
const axSymP = (g, d, fill) => el('path', { d, fill, stroke: '#fff', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
const AX_SYM = {
  starfish: { lines: [90, 18, 162, 54, 126], draw: g => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 17 : 44; d += (i ? 'L' : 'M') + (r * Math.cos(a)).toFixed(1) + ' ' + (r * Math.sin(a)).toFixed(1); } axSymP(g, d + 'Z', '#ee8a5a'); el('circle', { r: 6, fill: '#f6c08a' }, g); } },
  star8: { lines: [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5], draw: g => { for (const r0 of [0, 45]) el('rect', { x: -30, y: -30, width: 60, height: 60, transform: `rotate(${r0})`, fill: r0 ? '#3d7cc0' : '#2f9d6b', stroke: '#fff', 'stroke-width': 2.5 }, g); el('circle', { r: 14, fill: '#f6e7c8', stroke: '#fff', 'stroke-width': 2 }, g); } },
  flagH3: { lines: [0, 90], draw: g => { [['#c8392d', -30], ['#fff', -10], ['#c8392d', 10]].forEach(([f, y]) => el('rect', { x: -46, y, width: 92, height: 20, fill: f, stroke: '#9fb4c0', 'stroke-width': 1 }, g)); } },
  flagX: { lines: [0, 90], draw: g => { el('rect', { x: -46, y: -30, width: 92, height: 60, fill: '#2f6fb0' }, g); el('rect', { x: -46, y: -7, width: 92, height: 14, fill: '#fff' }, g); el('rect', { x: -7, y: -30, width: 14, height: 60, fill: '#fff' }, g); } },
  flagV2: { lines: [0], draw: g => { el('rect', { x: -46, y: -30, width: 46, height: 60, fill: '#2f9d6b' }, g); el('rect', { x: 0, y: -30, width: 46, height: 60, fill: '#f2b33d' }, g); } },
  flagCross: { lines: [0, 90, 45, 135], draw: g => { el('rect', { x: -32, y: -32, width: 64, height: 64, fill: '#c8392d' }, g); el('rect', { x: -32, y: -7, width: 64, height: 14, fill: '#fff' }, g); el('rect', { x: -7, y: -32, width: 14, height: 64, fill: '#fff' }, g); } },
  flagDiag: { lines: [], draw: g => { el('path', { d: 'M-46 -30 H46 L-46 30 Z', fill: '#3d7cc0' }, g); el('path', { d: 'M46 -30 V30 H-46 Z', fill: '#f2b33d' }, g); } },
  /* حرف بخط هندسي (كوفي مربع): متماثل؛ وبخط اليد: غير متماثل. الحكم بحسب شكل الخط المعروض */
  kufiBa: { lines: [90], draw: g => { axSymP(g, 'M-40 -18 H-26 V8 H26 V-18 H40 V22 H-40 Z', '#33454c'); el('rect', { x: -6, y: 30, width: 12, height: 12, fill: '#33454c' }, g); } },
  handBa: { lines: [], draw: g => { el('path', { d: 'M-42 -14 C-46 14 -30 24 0 24 C24 24 40 18 44 -10', fill: 'none', stroke: '#33454c', 'stroke-width': 10, 'stroke-linecap': 'round' }, g); el('circle', { cx: -4, cy: 40, r: 6, fill: '#33454c' }, g); } },
  kufiHa: { lines: [90, 0], draw: g => { axSymP(g, 'M-30 -30 H30 V30 H-30 Z M-14 -14 V14 H14 V-14 Z', '#33454c'); } },
  handHa: { lines: [], draw: g => { el('path', { d: 'M-8 -34 C-30 -20 -36 12 -14 26 C8 38 34 22 30 0 C26 -18 6 -20 -4 -6', fill: 'none', stroke: '#33454c', 'stroke-width': 10, 'stroke-linecap': 'round' }, g); } },
  kufiAlif: { lines: [90, 0], draw: g => el('rect', { x: -7, y: -40, width: 14, height: 80, fill: '#33454c' }, g) },
  handAlif: { lines: [], draw: g => el('path', { d: 'M4 -42 C10 -20 6 10 -2 40', fill: 'none', stroke: '#33454c', 'stroke-width': 11, 'stroke-linecap': 'round' }, g) },
};
/* تُضاف إلى مكتبة S1-U6 عند أول استعمال (ملفّها بعد هذا الملف) */
const axSymReady = () => { if (!SYM.starfish) Object.assign(SYM, AX_SYM); };
ITEM.worldPick = {
  make(spec) { axSymReady(); const isS = k => (SYM[k].lines === 'all' || SYM[k].lines.length > 0), want = spec.pics.filter(k => (spec.ask === 'no') !== isS(k)); /*T*/if (TESTHOOK && want.length !== 1) testBug('worldPick: الجواب ليس واحداً');/*/T*/ return { ...spec, want: want[0], tag: 'world-pick-' + (spec.ask || 'yes') }; },
  async ask(item, mode, tries) { axSymReady(); const svg = newStage(222, { oasis: false, ground: 0 }), T = item.pics.map((k, i) => { const g = el('g', { 'data-k': k }, svg); el('rect', { x: AXI_X3[i] - 52, y: 26, width: 104, height: 170, rx: 14, fill: GEO.paper, stroke: css('--line'), 'stroke-width': 2 }, g); symAt(g, k, AXI_X3[i], 111, .95); return { g, k, label: labelText('axPic') + ' ' + DG(i + 1) }; });
    if (tries >= 3) { const m = helpG(svg); T.forEach((t, i) => { const L = SYM[t.k].lines; if (L !== 'all' && L.length) axLinesAt(m, { axes: L }, [AXI_X3[i], 111], { r: 56, dim: true }); }); }
    await S(tries >= 3 ? 'gen.ax.together.world' : item.q); const k = await tapOne(T, { ok: item.want, pad: false }); return { ans: k, ctx: { svg, T } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: SYM[k] && SYM[k].near ? 'axNear' : 'worldSym' }; },
  async onOk(item, r) { SFX.good(); const i = item.pics.indexOf(item.want), L = SYM[item.want].lines; okRing(r.ctx.svg, r.ctx.T[i].g, 2); if (L !== 'all' && L.length) axLinesAt(r.ctx.svg, { axes: L }, [AXI_X3[i], 111], { r: 56 }); await sleep(500); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.ax.hint.world'); }, async together() {},
  async reveal(item, r) { const i = item.pics.indexOf(item.want); okRing(r.ctx.svg, r.ctx.T[i].g, 2); await S('gen.ax.reveal.world'); },
  praise: () => 'praiseSym', twin(item) { return item.twin || null; },
};

/* ================= ⑪ صمّم بمحاور (C177، إنتاج): شبكة 5×5 يلوّن الطفل خاناتها؛ need: أقلّ عدد للمحاور (المحاور الممكنة أربعة: رأسي وأفقي وقطران) ================= */
const DSG = { n: 5, c: 48, x0: 60, y0: 16 };   /* خانة 48 بكسلاً: هدف لمس كامل */
const dsgAxes = on => { const n = DSG.n, has = f => on.size > 0 && [...on].every(k => { const [r, c] = k.split(',').map(Number), [r2, c2] = f(r, c); return on.has(r2 + ',' + c2); });
  return [['v', (r, c) => [r, n - 1 - c]], ['h', (r, c) => [n - 1 - r, c]], ['d', (r, c) => [c, r]], ['e', (r, c) => [n - 1 - c, n - 1 - r]]].filter(([, f]) => has(f)).map(([k]) => k); };
ITEM.designSym = {
  make(spec) { return { ...spec, want: spec.need, tag: 'design-sym-' + spec.need }; },
  async ask(item, mode, tries) { const svg = newStage(272, { oasis: false, ground: 0 }), { n, c, x0, y0 } = DSG, on = new Set(), cells = {};
    el('rect', { x: x0 - 8, y: y0 - 8, width: n * c + 16, height: n * c + 16, rx: 10, fill: GEO.paper, stroke: css('--line'), 'stroke-width': 2 }, svg);
    const axG = el('g', { 'pointer-events': 'none' }, svg), mid = x0 + n * c / 2, midY = y0 + n * c / 2;
    const guides = { v: [mid, y0 - 4, mid, y0 + n * c + 4], h: [x0 - 4, midY, x0 + n * c + 4, midY], d: [x0, y0, x0 + n * c, y0 + n * c], e: [x0 + n * c, y0, x0, y0 + n * c] };
    if (tries >= 3) for (const k of ['v', 'h']) geoLine(axG, ...guides[k], { color: AXC.guide, w: 2.4, dash: '7 5' });   /* الحلّ المشترك: المحوران الرأسي والأفقي مرسومان، واللون للطفل */
    const show = () => { /*T*/window.__dsgOn = [...on];/*/T*/ };
    for (let r = 0; r < n; r++) for (let q = 0; q < n; q++) { const k = r + ',' + q, g = el('g', { role: 'button', tabindex: 0, 'aria-label': `${DG(r + 1)}، ${DG(q + 1)}`, 'data-cell': k, style: 'cursor:pointer' }, svg), b = el('rect', { x: x0 + q * c + 1, y: y0 + r * c + 1, width: c - 2, height: c - 2, rx: 4, fill: '#fff', stroke: '#d5e2ea', 'stroke-width': 1.5 }, g);
      const tog = () => { if (on.has(k)) { on.delete(k); b.setAttribute('fill', '#fff'); } else { on.add(k); b.setAttribute('fill', '#3d7cc0'); } SFX.tick(); show(); }; g.onclick = tog; g.onkeydown = e => { if (isActKey(e)) { e.preventDefault(); tog(); } }; cells[k] = { g, tog }; }
    for (const k of item.start || []) { cells[k].tog(); cells[k].g.onclick = null; cells[k].g.onkeydown = null; cells[k].g.removeAttribute('role'); cells[k].g.querySelector('rect').setAttribute('fill', '#2a5f94'); }   /* خانات البداية (start): مُلوَّنة ثابتة يكمل الطفل حولها */
    /*T*/window.__dsgCell = k => { const m = svg.getScreenCTM(), [r, q] = k.split(',').map(Number), x = x0 + q * c + c / 2, y = y0 + r * c + c / 2; return { x: m.a * x + m.e, y: m.d * y + m.f }; }; window.__dsgWant = (item.need >= 2 ? ['1,1', '1,3', '3,1', '3,3', '2,2'] : (item.start || []).length ? ['1,3', '2,3'] : ['0,1', '0,3', '2,2']).filter(k => !(item.start || []).includes(k));/*/T*/
    await S(tries >= 3 ? 'gen.ax.together.dsg' : item.q);
    AUTO({ kind: 'dsg', ok: () => { for (const k of window.__dsgWant || ['2,2']) if (!on.has(k)) cells[k].tog(); rulDoneBtn().click(); }, wrong: () => { if (!on.has('0,1')) cells['0,1'].tog(); rulDoneBtn().click(); } });
    await rulDone(() => { for (const k in cells) { cells[k].g.onclick = null; cells[k].g.onkeydown = null; cells[k].g.removeAttribute('role'); } });
    const ax = dsgAxes(on); return { ans: ax.length, ctx: { svg, on, ax, axG, guides } }; },
  judge(item, k) { return k >= item.need ? { ok: true } : { ok: false, err: k ? 'dsgFew' : 'dsgNone' }; },
  async onOk(item, r) { SFX.good(); for (const k of r.ctx.ax) { geoLine(r.ctx.axG, ...r.ctx.guides[k], { color: AXC.ok, w: 3, dash: '9 6' }); SFX.tick(); await sleep(300); } r.ctx.svg.appendChild(r.ctx.axG); await S('gen.ax.dsgN', { noGap: true }); await S(numw(r.ctx.ax.length), { num: true }); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.ax.hint.dsg'); }, async together() {},
  async reveal(item, r) { await S('gen.ax.reveal.dsg'); },
  praise: () => 'praiseSym', twin(item) { return item.twin || null; },
};

/* ================= المشاهد ================= */
/* الإشعال: جبل وصورته في البحيرة، وخط الماء بينهما */
SCENES.lakeHook = async c => { const svg = newStage(250, { oasis: false, ground: 0 }), L = c.lines, W = 126;
  el('rect', { x: 20, y: 14, width: 320, height: W - 14, rx: 12, fill: '#dff0fb' }, svg); el('rect', { x: 20, y: W, width: 320, height: 110, rx: 12, fill: '#7fb6d9' }, svg);
  const mt = g => { el('path', { d: 'M60 126 L140 40 L180 84 L220 30 L300 126 Z', fill: '#7d8f6a', stroke: '#fff', 'stroke-width': 2 }, g); el('path', { d: 'M205 46 L220 30 L236 48 L226 52 L220 44 L212 52 Z', fill: '#fff' }, g); el('circle', { cx: 92, cy: 60, r: 14, fill: '#f2c66d' }, g); };
  mt(el('g', {}, svg)); const im = el('g', { transform: `translate(0 ${2 * W}) scale(1 -1)`, opacity: .55 }, svg); mt(im);
  await S(L[0]); const ln = el('line', { x1: 20, y1: W, x2: 340, y2: W, stroke: AXC.line, 'stroke-width': 3.6, 'stroke-dasharray': '10 6' }, svg); anim(ln, [{ opacity: 0 }, { opacity: 1 }], { duration: 500 }); SFX.tick(); await S(L[1]); };
/* الاكتشاف (أ): نقطة أمام المرآة وصورتها، والبعدان متساويان */
SCENES.mirrorDist = async c => { const svg = newStage(250, { oasis: false, ground: 0 }), L = c.lines, Gd = axGrid(svg, 'v', 5), p = c.p || [2, 3], q = axImg('v', 5, p);
  el('rect', { x: Gd.P(5, 6)[0] - 4, y: Gd.P(5, 6)[1], width: 8, height: Gd.rows * Gd.c, fill: '#bfe0f2', opacity: .8, 'pointer-events': 'none' }, svg);
  axFigAt(svg, Gd, [p], []); await S(L[0]); axFigAt(svg, Gd, [q], [], { color: AXC.img }); SFX.pop(); await S(L[1]);
  const g1 = await axGuide(svg, Gd, 'v', 5, p, { count: false }); g1.remove(); const m = helpG(svg); const s = 5 - p[0]; for (let i = 1; i <= s; i++) { badge(m, Gd.P(p[0] + i - .5, p[1])[0], Gd.P(p[0], p[1])[1] - 16, i, css('--think')); badge(m, Gd.P(q[0] - i + .5, p[1])[0], Gd.P(p[0], p[1])[1] - 16, i, AXC.img); SFX.tick(); await sleep(FAST ? 20 : 260); }
  await S(L[2]); };
/* الاكتشاف (ب): ورقة مطوية وثقب، فتظهر الصورة؛ وخط الطيّ هو المحور */
SCENES.pinFold = async c => { const svg = newStage(250, { oasis: false, ground: 0 }), L = c.lines, F = axFoldAt(svg, { k: c.k || 'qRect' }, [180, 122], { at: [0, 0], ang: 90 }, { fill: GEO.paper, line: false });
  const p = [48, -12]; el('circle', { cx: 180 + p[0], cy: 122 + p[1], r: 6, fill: AXC.pt }, svg); await S(L[0]); await F.fold(); const pin = el('circle', { cx: 180 + p[0], cy: 122 + p[1], r: 9, fill: 'none', stroke: AXC.line, 'stroke-width': 3 }, svg); SFX.pop(); await sleep(500); await F.open(); pin.remove();
  el('circle', { cx: 180 - p[0], cy: 122 + p[1], r: 6, fill: AXC.img }, svg);   /* النصف الأيسر هو الذي يُطوى فوق النقطة، فالثقب يظهر فيه */ await S(L[1]); F.line.setAttribute('opacity', 1); SFX.tick(); await S(L[2]); };
/* الاكتشاف (ج): الواصل بين النقطة وصورتها عمودي على المحور ويقطعه في منتصفه */
SCENES.axPerpShow = async c => { const svg = newStage(250, { oasis: false, ground: 0 }), L = c.lines, Gd = axGrid(svg, 'v', 5), p = c.p || [2, 2], q = axImg('v', 5, p); axFigAt(svg, Gd, [p], []); axFigAt(svg, Gd, [q], [], { color: AXC.img });
  await S(L[0]); const A = Gd.P(...p), B = Gd.P(...q); geoLine(svg, A[0], A[1], B[0], B[1], { color: AXC.guide, w: 3.2 }); SFX.tick();
  const M = Gd.P(5, p[1]); paperCornerAt(svg, M, 0, 34); await S(L[1]); ptAt(svg, M[0], M[1], '', { r: 6, color: AXC.ok }); await S(L[2]); };
/* بطاقة طرق التحقق الثلاث: الطيّ، والمرآة، والورق الشفّاف */
SCENES.checkWays = async c => { const L = c.lines, k = c.k || 'tIsoA';
  { const svg = axStage(), F = axFoldAt(svg, { k }, AX_C, { at: [0, 0], ang: 90 }, {}); await S(L[0]); await F.fold(); await sleep(400); await S(L[1]); }
  { const svg = axStage(), S0 = axShape({ k }), half = el('g', {}, svg), id = 'axm' + (++AX_ID), cp = el('clipPath', { id }, svg); el('rect', { x: 180, y: 0, width: 200, height: 260 }, cp); half.setAttribute('clip-path', `url(#${id})`);
    el('polygon', { points: polyStr(S0.P.map(p => [p[0] + 180, p[1] + 122])), fill: PLY.fill, stroke: PLY.edge, 'stroke-width': 4 }, half); el('rect', { x: 176, y: 24, width: 8, height: 196, fill: '#bfe0f2', stroke: '#7fb6d9', 'stroke-width': 1.5 }, svg);
    const im = el('g', { transform: 'translate(360 0) scale(-1 1)', opacity: 0 }, svg); im.appendChild(half.cloneNode(true)); await S(L[2]); anim(im, [{ opacity: 0 }, { opacity: .6 }], { duration: 600, fill: 'forwards' }); SFX.tick(); await S(L[3]); }
  { const svg = axStage(), S0 = axShape({ k }), pts = S0.P.map(p => [p[0] + 180, p[1] + 122]); el('polygon', { points: polyStr(pts), fill: PLY.fill, stroke: PLY.edge, 'stroke-width': 4 }, svg);
    const tr = el('g', { opacity: .85 }, svg); el('rect', { x: 60, y: 30, width: 120, height: 180, fill: '#fff', opacity: .55, stroke: '#9fb4c0', 'stroke-width': 1.5 }, tr); const id = 'axt' + (++AX_ID), cp = el('clipPath', { id }, tr); el('rect', { x: 60, y: 30, width: 120, height: 180 }, cp);
    el('polygon', { points: polyStr(pts), fill: 'none', stroke: AXC.line, 'stroke-width': 3, 'stroke-dasharray': '6 4', 'clip-path': `url(#${id})` }, tr); await S(L[4]); await axTween(900, t => tr.setAttribute('transform', `translate(180 0) scale(${1 - 2 * t} 1) translate(-180 0)`)); SFX.tick(); await S(L[5]); } };
/* د2: شبه المنحرف متساوي الساقين: الساقان تُقاسان وتُعلَّمان */
SCENES.trapIntro = async c => { const L = c.lines; for (const [i, k] of (c.keys || ['qTrap', 'qTrap2']).entries()) { const svg = axStage(), R = polyAt(svg, k, [196, 122], {}), legs = axLegs(R); legs.forEach(j => polyHl(R, 'side', j, AXC.img)); if (!i) await S(L[0]); const T = plyTools(svg, R); T.show('len'); await sleep(FAST ? 60 : 900); T.off();
    const pr = R.pr, eq = Math.abs(cmOf(pr.L[legs[0]]) - cmOf(pr.L[legs[1]])) < .01; if (eq) { polyMarks(R.g, R, ['eq']); await S(L[1]); } else await S(L[2]); } };
/* جدول عدّ المحاور بالطيّ: كل شكل يُطوى على محاوره واحداً واحداً، ويُكتب عدده في جدوله */
SCENES.foldTable = async c => { const L = c.lines, K = c.keys || ['tEq', 'tIsoA', 'tScaA'];
  await S(L[0]); for (const k of K) { const svg = axStage(), S0 = axShape({ k }); if (S0.circle) { el('circle', { cx: AX_C[0], cy: AX_C[1], r: S0.circle, fill: PLY.fill, stroke: PLY.edge, 'stroke-width': 4 }, svg); if (L[1]) await S(L[1]); await axLinesOneByOne(svg, S0, AX_C, { r: S0.circle + 14 }); await S('gen.ax.reveal.all'); continue; } el('polygon', { points: polyStr(S0.P.map(p => [p[0] + AX_C[0], p[1] + AX_C[1]])), fill: PLY.fill, stroke: PLY.edge, 'stroke-width': 4 }, svg);
    if (!S0.axes.length) { svg.lastChild.remove(); const F = axFoldAt(svg, { k }, AX_C, { at: [0, 0], ang: 90 }, { S: S0 }); await F.fold(); await sleep(400); await S('gen.ax.n.0'); }
    else { await axLinesOneByOne(svg, S0, AX_C, { count: true }); await sleep(300); } }
  };
/* المنتظم ذو n ضلعاً له n محوراً */
SCENES.regularAxes = async c => { const L = c.lines; await S(L[0]); for (const k of c.keys || ['tEq', 'qSq', 'r5', 'r6']) { const svg = axStage(), S0 = axShape({ k, s: k === 'tEq' ? 1 : .95 }); el('polygon', { points: polyStr(S0.P.map(p => [p[0] + AX_C[0], p[1] + AX_C[1]])), fill: PLY.fill, stroke: PLY.edge, 'stroke-width': 4 }, svg); await axLinesOneByOne(svg, S0, AX_C, { count: true }); await sleep(300); } await S(L[1]); };
/* المحاور المائلة: المربع والمعيّن مدوَّرين، والقطران محوران */
SCENES.slantAxes = async c => { const L = c.lines; for (const [i, [k, rot]] of (c.figs || [['qSq', 30], ['qRhom', 20]]).entries()) { const svg = axStage(), S0 = axShape({ k, rot }); el('polygon', { points: polyStr(S0.P.map(p => [p[0] + AX_C[0], p[1] + AX_C[1]])), fill: PLY.fill, stroke: PLY.edge, 'stroke-width': 4 }, svg); if (!i) await S(L[0]); await axLinesOneByOne(svg, S0, AX_C); await S(L[i + 1]); } };
/* د3: ترميم النافذة بالعدّ (مثال محلول): النقاط تُعدّ إلى المحور وتُنقل */
SCENES.axGridWorked = async c => { const svg = newStage(252, { oasis: false, ground: 0 }), L = c.lines, Gd = axGrid(svg, c.ax || 'v', c.a ?? 5); axFigAt(svg, Gd, c.pts, c.segs); await S(L[0]);
  const placed = c.pts.map(p => axST(c.ax || 'v', c.a ?? 5, p)[0] === 0 ? p : null), lay = el('g', {}, svg);
  for (const [i, p] of c.pts.entries()) { if (placed[i]) continue; const g = await axGuide(svg, Gd, c.ax || 'v', c.a ?? 5, p, { count: !lay.childNodes.length }); placed[i] = axImg(c.ax || 'v', c.a ?? 5, p); lay.innerHTML = ''; axFigAt(lay, Gd, placed, (c.segs || []).filter(([a, b]) => placed[a] && placed[b]), { color: AXC.img }); await sleep(FAST ? 20 : 500); g.remove(); }
  await S(L[1]); const w = await axMirrorCheck(svg, Gd, c.pts, c.segs); await S(L[2]); w.remove(); };
/* المحور القطري: تدور الورقة حتى يصير المحور رأسياً */
SCENES.turnPaper = async c => { const svg = newStage(252, { oasis: false, ground: 0 }), L = c.lines, holder = el('g', {}, svg), Gd = axGrid(holder, 'd', [3, 1], { c: 28, cols: 8, rows: 6, x0: 68, y0: 196 }); axFigAt(holder, Gd, c.pts || [[2, 3], [1, 4]], c.segs || [[0, 1]]);
  await S(L[0]); const at = Gd.at; await axTween(1000, t => holder.setAttribute('transform', `rotate(${-45 * t} ${at[0]} ${at[1]})`)); SFX.tick(); await S(L[1]); await axTween(700, t => holder.setAttribute('transform', `rotate(${-45 * (1 - t)} ${at[0]} ${at[1]})`)); await S(L[2]); };
/* د4: جولة في عالمنا: كل صورة تُطوى على محورها (أو لا ينطبق نصفاها) */
SCENES.worldTour = async c => { axSymReady(); const L = c.lines; for (const [i, k] of (c.pics || ['butterfly', 'starfish', 'star8']).entries()) { const svg = axStage(), D = SYM[k]; if (D.lines !== 'all' && D.lines.length) { const F = symFoldAt(svg, k, 180, 122, 1.7, D.lines[0], 0, { lineR: 60, lineColor: AXC.line }); await S(L[i]); await F.fold(); await sleep(300); await F.open(); if (D.lines.length > 1) await axLinesOneByOne(svg, { axes: D.lines }, [180, 122], { r: 92 }); } else { symAt(svg, k, 180, 122, 1.7); await S(L[i]); } } };
/* الطبيعة تقريبية: ورقة الشجر تُطوى فلا ينطبق نصفاها تماماً */
SCENES.nearLeaf = async c => { const svg = axStage(), L = c.lines, F = symFoldAt(svg, 'leaf', 180, 122, 1.7, 90, 0, { lineR: 60, lineColor: AXC.line }); await S(L[0]); await F.fold(); await sleep(500); await S(L[1]); };
/* الحرف بخطّين: الحكم بحسب شكل الخط */
SCENES.letterStyles = async c => { axSymReady(); const L = c.lines; for (const [i, [a, b]] of (c.pairs || [['kufiBa', 'handBa']]).entries()) { const svg = newStage(222, { oasis: false, ground: 0 }); for (const [j, k] of [a, b].entries()) { const x = j ? 92 : 268; el('rect', { x: x - 70, y: 22, width: 140, height: 178, rx: 14, fill: GEO.paper, stroke: css('--line'), 'stroke-width': 2 }, svg); const F = symFoldAt(svg, k, x, 111, 1.15, 90, 0, { lineR: 60, lineColor: AXC.line }); if (j === 0) await S(L[2 * i]); await F.fold(); await sleep(200); } await S(L[2 * i + 1]); } };
/* التذكّر */
SCENES.recallAxis = async c => { const svg = axStage(), F = axFoldAt(svg, { k: c.k || 'tIsoA', rot: c.rot || 0 }, AX_C, { at: [0, 0], ang: c.ang ?? 90 }, {}); await sleep(300); await F.fold(); await S(c.lines[0]); };
SCENES.recallImg = async c => { const svg = newStage(252, { oasis: false, ground: 0 }), Gd = axGrid(svg, c.ax || 'v', c.a ?? 5), pts = c.pts || [[2, 3]]; axFigAt(svg, Gd, pts, c.segs); axFigAt(svg, Gd, pts.map(p => axImg(c.ax || 'v', c.a ?? 5, p)), c.segs, { color: AXC.img }); for (const p of pts) await axGuide(svg, Gd, c.ax || 'v', c.a ?? 5, p); await S(c.lines[0]); };
SCENES.recallCount = async c => { const svg = axStage(), S0 = axShape({ k: c.k || 'qRect', rot: c.rot || 0 }); el('polygon', { points: polyStr(S0.P.map(p => [p[0] + AX_C[0], p[1] + AX_C[1]])), fill: PLY.fill, stroke: PLY.edge, 'stroke-width': 4 }, svg); axLinesAt(svg, S0, AX_C); await S(c.lines[0]); };
SCENES.recallWorld = async c => { axSymReady(); const svg = axStage(), k = c.pic || 'butterfly', D = SYM[k]; symAt(svg, k, 180, 122, 1.7); if (D.lines !== 'all' && D.lines.length) axLinesAt(svg, { axes: D.lines }, [180, 122], { r: 92 }); await S(c.lines[0]); };
WRAP_ART.axArt = svg => { const g = el('g', {}, svg); el('path', { d: 'M110 200 V110 L130 90 L150 110 V80 L180 50 L210 80 V110 L230 90 L250 110 V200 Z', fill: '#f2d38a', stroke: '#b9794e', 'stroke-width': 3 }, g); el('path', { d: 'M168 200 V160 A12 12 0 0 1 192 160 V200 Z', fill: '#8a6a4a' }, g); geoLine(g, 180, 40, 180, 212, { color: AXC.line, w: 3.2, dash: '9 6' }); anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200, fill: 'both' }); palmAt(svg, 326, 250, .8); palmAt(svg, 34, 250, .9); };
