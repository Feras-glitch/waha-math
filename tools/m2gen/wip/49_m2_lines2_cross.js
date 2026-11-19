/* =====================================================================
   S2-U2 «تقاطعات المدينة» (المرحلة 2، نوفمبر 2026)
   د1 المستقيمان المتقاطعان ونقطة التقاطع (C120) · د2 المتوازيان (C121)، والمسافة بينهما تُقاس عمودياً (C122)، وعلامة التوازي (C123)
   د3 ركن الورقة (C133 مدخل)، والمتعامدان (C124)، وعلامة التعامد (C125) · د4 التوازي والتعامد في الأشكال (C127)، وأقصر طريق من نقطة إلى خط (C126 مدخل)
   الرمزان ∥ و⊥ يُرسمان علامتين على الرسم (سهمان صغيران، ومربع صغير): لا حرف لهما في خط القراءة.
   ===================================================================== */
const CRS = { a: '#1f4f7a', b: '#b0552f', mark: '#c8392d', paper: '#fff7d6', paperEdge: '#c9a54a' };
/* مستقيم كامل يمرّ بالنقطة P باتجاه ang (درجات، عكس عقارب الساعة)، يمتدّ حتى حافة الإطار وبطرفيه سهمان. o: color، w، arrows، part: [t1، t2] جزء منه فقط (بلا أسهم) */
function fullLineAt(parent, P, ang, o = {}) { const a = ang * Math.PI / 180, u = [Math.cos(a), -Math.sin(a)], g = el('g', { 'data-line': ang }, parent), col = o.color || GEO.ink;
  if (o.part) { geoLine(g, P[0] + u[0] * o.part[0], P[1] + u[1] * o.part[0], P[0] + u[0] * o.part[1], P[1] + u[1] * o.part[1], { color: col, w: o.w || 3.6 }); return g; }
  const E1 = rayEdge(P, [P[0] + u[0], P[1] + u[1]]), E2 = rayEdge(P, [P[0] - u[0], P[1] - u[1]]); geoLine(g, E2[0], E2[1], E1[0], E1[1], { color: col, w: o.w || 3.6 });
  if (o.arrows !== false) { const d = Math.atan2(u[1], u[0]) * 180 / Math.PI; geoArrow(g, E1[0], E1[1], d, col, 9); geoArrow(g, E2[0], E2[1], d + 180, col, 9); }
  if (o.mark) { const m = [P[0] + u[0] * (o.markAt || 46), P[1] + u[1] * (o.markAt || 46)], d = Math.atan2(u[1], u[0]) * 180 / Math.PI; for (let i = 0; i < o.mark; i++) geoArrow(g, m[0] + u[0] * i * 9, m[1] + u[1] * i * 9, d, CRS.mark, 8); }   /* علامة التوازي: سهم صغير على المستقيم */
  return g; }
/* مربع التعامد الصغير عند P بين الاتجاهين a1 وa2 */
function perpMarkAt(parent, P, a1, a2, s = 13) { const r = d => [Math.cos(d * Math.PI / 180), -Math.sin(d * Math.PI / 180)], u = r(a1), v = r(a2); return el('path', { d: `M${P[0] + u[0] * s} ${P[1] + u[1] * s} L${P[0] + (u[0] + v[0]) * s} ${P[1] + (u[1] + v[1]) * s} L${P[0] + v[0] * s} ${P[1] + v[1] * s}`, fill: 'none', stroke: CRS.mark, 'stroke-width': 2.6, 'pointer-events': 'none' }, parent); }
/* زوج من المستقيمات في إطار: kind = cross (زاوية ang بينهما) | perp | para (بُعد d) | conv (يكادان يتوازيان ويلتقيان خارج الرسم). rot: دوران الزوج كله. marks: علامات التوازي أو مربع التعامد */
function linePairAt(parent, kind, o = {}) { const C = o.C || [180, 116], rot = o.rot || 0, g = el('g', { 'data-pair': kind }, parent), d = o.d || 56, n = [Math.sin(rot * Math.PI / 180), Math.cos(rot * Math.PI / 180)];
  if (kind === 'para' || kind === 'conv') { const P1 = [C[0] - n[0] * d / 2, C[1] - n[1] * d / 2], P2 = [C[0] + n[0] * d / 2, C[1] + n[1] * d / 2], dv = kind === 'conv' ? (o.dv || 7) : 0, sh = o.short;
    fullLineAt(g, P1, rot + dv, { color: CRS.a, mark: o.marks ? 1 : 0, part: sh ? [-sh, sh] : null, arrows: !sh }); fullLineAt(g, P2, rot - dv, { color: CRS.b, mark: o.marks ? 1 : 0, part: sh ? [-sh, sh] : null, arrows: !sh }); return { g, P1, P2, meet: null }; }
  const ang = kind === 'perp' ? 90 : (o.ang || 55); fullLineAt(g, C, rot, { color: CRS.a }); fullLineAt(g, C, rot + ang, { color: CRS.b }); if (o.marks && kind === 'perp') perpMarkAt(g, C, rot, rot + 90); return { g, meet: C, ang }; }
Object.assign(LFIG, {
  pX: { p: { cross: 1 }, d: g => { geoObj(g, 'line', [-22, 14], [22, -14], { ext: 14, dots: false, color: CRS.a }); geoObj(g, 'line', [-18, -16], [18, 16], { ext: 14, dots: false, color: CRS.b }); } },
  pX2: { p: { cross: 1 }, d: g => { geoObj(g, 'line', [-24, 4], [24, -4], { ext: 12, dots: false, color: CRS.a }); geoObj(g, 'line', [-6, -24], [6, 24], { ext: 10, dots: false, color: CRS.b }); } },
  pNear: { p: { cross: 1, conv: 1 }, d: g => { geoLine(g, -34, -12, 30, -4, { color: CRS.a }); geoLine(g, -34, 14, 30, 4, { color: CRS.b }); } },
  pPar: { p: { par: 1 }, d: g => { geoObj(g, 'line', [-24, -14], [24, -14], { ext: 12, dots: false, color: CRS.a }); geoObj(g, 'line', [-24, 14], [24, 14], { ext: 12, dots: false, color: CRS.b }); } },
  pParV: { p: { par: 1 }, d: g => { geoObj(g, 'line', [-14, -24], [-14, 24], { ext: 12, dots: false, color: CRS.a }); geoObj(g, 'line', [14, -24], [14, 24], { ext: 12, dots: false, color: CRS.b }); } },
  pParD: { p: { par: 1 }, d: g => { geoObj(g, 'line', [-30, 6], [10, -26], { ext: 10, dots: false, color: CRS.a }); geoObj(g, 'line', [-10, 26], [30, -6], { ext: 10, dots: false, color: CRS.b }); } },
  pPerp: { p: { cross: 1, perp: 1 }, d: g => { geoObj(g, 'line', [-24, 8], [24, 8], { ext: 12, dots: false, color: CRS.a }); geoObj(g, 'line', [4, -24], [4, 24], { ext: 12, dots: false, color: CRS.b }); } },
  pPerpD: { p: { cross: 1, perp: 1 }, d: g => { geoObj(g, 'line', [-20, 20], [20, -20], { ext: 12, dots: false, color: CRS.a }); geoObj(g, 'line', [-20, -20], [20, 20], { ext: 12, dots: false, color: CRS.b }); } },
  pSkew: { p: { cross: 1, skew: 1 }, d: g => { geoObj(g, 'line', [-24, 8], [24, 8], { ext: 12, dots: false, color: CRS.a }); geoObj(g, 'line', [-6, -24], [14, 24], { ext: 10, dots: false, color: CRS.b }); } },
  mArrow: { p: { mpar: 1 }, d: g => { geoLine(g, -30, -12, 30, -12, { color: CRS.a }); geoLine(g, -30, 14, 30, 14, { color: CRS.b }); geoArrow(g, 6, -12, 0, CRS.mark, 9); geoArrow(g, 6, 14, 0, CRS.mark, 9); } },
  mSquare: { p: { mperp: 1 }, d: g => { geoLine(g, -30, 14, 30, 14, { color: CRS.a }); geoLine(g, -4, -28, -4, 30, { color: CRS.b }); perpMarkAt(g, [-4, 14], 0, 90, 12); } },
  mTicks: { p: { meq: 1 }, d: g => { geoObj(g, 'seg', [-30, -12], [30, -12], { ticks: 1, dots: false, color: CRS.a }); geoObj(g, 'seg', [-30, 14], [30, 14], { ticks: 1, dots: false, color: CRS.b }); } },
});
Object.assign(LINE_ERR, { cross: 'crossPar', par: 'crossPar', perp: 'perpEye', mpar: 'markWrong', mperp: 'markWrong' });

/* ================= ① أيّ نقطة هي نقطة التقاطع؟ (C120): ang زاوية المستقيمين، rot دوران الزوج، ord ترتيب النقاط الثلاث (0 التقاطع، 1 على الأول، 2 على الثاني) ================= */
ITEM.crossPick = {
  make(spec) { const ord = spec.ord || [0, 1, 2]; return { ...spec, ord, want: ord.indexOf(0), tag: 'cross-pick' }; },
  async ask(item, mode, tries) { const svg = newStage(232, { oasis: false, ground: 0 }); rayFrame(svg); const rot = item.rot || 0, ang = item.ang || 60, C = [180, 116], Pr = linePairAt(svg, 'cross', { rot, ang }), r = d => [Math.cos(d * Math.PI / 180), -Math.sin(d * Math.PI / 180)], u = r(rot), v = r(rot + ang);
    const cand = [C, [C[0] + u[0] * 74, C[1] + u[1] * 74], [C[0] - v[0] * 70, C[1] - v[1] * 70]], names = ['a', 'b', 'j'], G = item.ord.map((ci, i) => { const g = el('g', {}, svg); ptAt(g, cand[ci][0], cand[ci][1], names[i], { r: 7, color: CRS.mark, lab: [0, -15] }); return g; });
    if (tries >= 3) { const m = helpG(svg); el('circle', { cx: C[0], cy: C[1], r: 22, fill: 'none', stroke: css('--think'), 'stroke-width': 2.5, 'stroke-dasharray': '4 3' }, m); }   /* الحلّ المشترك: موضع الالتقاء محاط، واللمس للطفل */
    say(...lineOf(tries >= 3 ? 'gen.crs.together.cross' : item.q), { free: true });
    const k = await tapOne(G.map((g, i) => ({ g, k: i, label: labelText('geoPoint') + ' ' + LTR[names[i]] })), { ok: item.want, pad: 64 }); hush(); return { ans: k, ctx: { svg, G } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'crossOneLine' }; },
  onOk(item, r) { SFX.good(); okRing(r.ctx.svg, r.ctx.G[r.ans], 6); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.crs.hint.cross'); }, async together() {},
  async reveal(item, r) { okRing(r.ctx.svg, r.ctx.G[item.want], 6); await S('gen.crs.reveal.cross'); },
  praise: () => 'praiseLook', twin(item) { return item.twin || null; },
};
/* ================= ② هل يلتقيان لو مددناهما؟ (C120، C121): kind conv (يلتقيان خارج الرسم) أو para. يلمس الطفل الرسم فيُمدّ الخطان، ثم يحكم ================= */
ITEM.meetJudge = {
  make(spec) { return { ...spec, want: spec.kind === 'para' ? 'no' : 'yes', tag: 'meet-' + spec.kind }; },
  geo(item) { const rot = item.rot || 0, a = rot * Math.PI / 180, u = [Math.cos(a), -Math.sin(a)], n = [u[1], -u[0]], dv = item.kind === 'para' ? 0 : (item.dv || 8), d = 54, C = [130 + (item.kind === 'para' ? 40 : 0), 116]; const dir = s => { const b = (rot + s * dv) * Math.PI / 180; return [Math.cos(b), -Math.sin(b)]; };
    return { P1: [C[0] - n[0] * d / 2, C[1] - n[1] * d / 2], P2: [C[0] + n[0] * d / 2, C[1] + n[1] * d / 2], u1: dir(-1), u2: dir(1) }; },
  async ask(item, mode, tries) { const svg = newStage(232, { oasis: false, ground: 0 }); rayFrame(svg); const Gm = this.geo(item), L = 60, seg = (P, u, col) => geoLine(svg, P[0] - u[0] * L, P[1] - u[1] * L, P[0] + u[0] * L, P[1] + u[1] * L, { color: col, w: 4 }); seg(Gm.P1, Gm.u1, CRS.a); seg(Gm.P2, Gm.u2, CRS.b);
    const g = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg); el('rect', { x: 26, y: 20, width: 308, height: 192, rx: 10, fill: '#fff', opacity: .01 }, g);
    say(...lineOf(tries >= 3 ? 'gen.crs.together.meet' : item.q), { free: true }); await tapOne([{ g, k: 'x', label: labelText('crsExtend') }], { ok: 'x', pad: 60 }); hush(); g.remove();
    const ext = el('g', { 'pointer-events': 'none' }, svg), far = (P, u, col) => { const E1 = rayEdge(P, [P[0] + u[0], P[1] + u[1]]), E2 = rayEdge(P, [P[0] - u[0], P[1] - u[1]]); return geoLine(ext, E2[0], E2[1], E1[0], E1[1], { color: col, w: 2.4, dash: '6 5' }); }; far(Gm.P1, Gm.u1, CRS.a); far(Gm.P2, Gm.u2, CRS.b);
    await anim(ext, [{ opacity: 0 }, { opacity: 1 }], { duration: tries >= 3 ? 1400 : 700, fill: 'forwards' }).done.catch(() => {}); SFX.tick();
    const k = await choosePick([['yes', labelText('yes')], ['no', labelText('no')]], item.want); return { ans: k, ctx: { svg } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: item.kind === 'para' ? 'paraMeet' : 'convPar' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); }, async hint2() { await S('gen.crs.hint.meet'); }, async together() {},
  async reveal(item) { await S(item.want === 'yes' ? 'gen.crs.reveal.meetYes' : 'gen.crs.reveal.meetNo'); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};

/* ---------- شبكة المتوازيين: مستقيمان أفقيان (أو رأسيان) على الشبكة بينهما d مربعات ---------- */
function paraGridAt(svg, d, o = {}) { const Gd = geoGrid(svg, { cols: 7, rows: 5 }), v = o.dir === 'v', lo = o.lo ?? 1, line = (k, col, mark) => { const g = el('g', { 'pointer-events': 'none' }, svg), [x1, y1] = v ? Gd.P(k, 0) : Gd.P(0, k), [x2, y2] = v ? Gd.P(k, Gd.rows) : Gd.P(Gd.cols, k); geoLine(g, x1, y1, x2, y2, { color: col, w: 4 }); if (mark) geoArrow(g, (x1 + x2) / 2 + (v ? 0 : 8), (y1 + y2) / 2 - (v ? 8 : 0), v ? -90 : 0, CRS.mark, 9); return g; };
  return { Gd, v, lo, line, base: line(lo, CRS.a, o.marks), other: o.noOther ? null : line(lo + d, CRS.b, o.marks) }; }
/* ================= ③ كم مربعاً المسافة بين المتوازيين؟ (C122): d، dir (h أو v)، lo موضع الأول ================= */
ITEM.paraGap = { ...numItem,
  make(spec) { return { ...spec, want: spec.d, nums: rulNear(spec.d, spec.d + 1, spec.d + 2, spec.d - 1), tag: 'para-gap' }; },
  async ask(item, mode, tries) { const svg = newStage(270, { oasis: false, ground: 0 }), Pg = paraGridAt(svg, item.d, { dir: item.dir, lo: item.lo, marks: true }), Gd = Pg.Gd; let hops = null;
    const hop = () => { const m = helpG(svg), c = item.at ?? 3; for (let i = 0; i < item.d; i++) { const [xa, ya] = Pg.v ? Gd.P(Pg.lo + i, c) : Gd.P(c, Pg.lo + i), [xb, yb] = Pg.v ? Gd.P(Pg.lo + i + 1, c) : Gd.P(c, Pg.lo + i + 1); el('path', { d: Pg.v ? `M${xa} ${ya} Q${(xa + xb) / 2} ${ya - 16} ${xb} ${yb}` : `M${xa} ${ya} Q${xa + 16} ${(ya + yb) / 2} ${xb} ${yb}`, fill: 'none', stroke: css('--think'), 'stroke-width': 2.6 }, m); } return m; };
    if (tries >= 3) { await S('gen.crs.together.gap'); hops = hop(); } else await S(item.q);
    const np = numberPick(shuffle(item.nums), item.want, { digits: true }); return { ans: await np.p, ctx: { svg, np, hop, hops } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: k === item.d + 1 ? 'gridPlusOne' : 'paraGapWrong' }; },
  async hint2(item, r) { const m = r.ctx.hop(); await sleep(1300); m.remove(); }, async together() {},
  async reveal(item, r) { if (!r.ctx.hops) r.ctx.hop(); await S(numw(item.want), { num: true }); },
  praise: () => 'praiseMeasure', twin(item) { return item.twin || null; },
};
/* ================= ④ أيّ قياس هو المسافة بين المتوازيين؟ (C122): d، ord ترتيب القياسات الثلاثة (0 العمودي، 1 مائل، 2 أشدّ ميلاً) ================= */
ITEM.paraSeg = {
  make(spec) { const ord = spec.ord || [0, 1, 2]; return { ...spec, ord, want: ord.indexOf(0), tag: 'para-seg' }; },
  async ask(item, mode, tries) { const svg = newStage(270, { oasis: false, ground: 0 }), Pg = paraGridAt(svg, item.d, { lo: 1 }), Gd = Pg.Gd, X0 = [1, 3, 5], SL = [0, 1, 2], COL = [css('--compass'), css('--think'), '#8e6bbf'];
    const G = item.ord.map((kind, i) => { const [x1, y1] = Gd.P(X0[i], 1), [x2, y2] = Gd.P(X0[i] + SL[kind], 1 + item.d), g = el('g', {}, svg); geoLine(g, x1, y1, x2, y2, { color: 'transparent', w: 34 }); geoLine(g, x1, y1, x2, y2, { color: COL[i], w: 5 }); ptAt(g, x1, y1, null, { r: 4, color: COL[i] }); ptAt(g, x2, y2, null, { r: 4, color: COL[i] }); return g; });
    if (tries >= 3) { const i = item.want, [x, y] = Gd.P(X0[i], 1); perpMarkAt(helpG(svg), [x, y], 0, 90, 11); }   /* الحلّ المشترك: مربع التعامد على أحد القياسات، والاختيار للطفل */
    say(...lineOf(tries >= 3 ? 'gen.crs.together.seg' : item.q), { free: true });
    const k = await tapOne(G.map((g, i) => ({ g, k: i, label: labelText('crsMeasure') + ' ' + DG(i + 1) })), { ok: item.want, pad: 56 }); hush(); return { ans: k, ctx: { svg, G, Gd, X0 } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'paraSlant' }; },
  onOk(item, r) { SFX.good(); okRing(r.ctx.svg, r.ctx.G[r.ans], 4); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const [x, y] = r.ctx.Gd.P(r.ctx.X0[item.want], 1), m = helpG(r.ctx.svg); perpMarkAt(m, [x, y], 0, 90, 11); await sleep(1400); m.remove(); }, async together() {},
  async reveal(item, r) { okRing(r.ctx.svg, r.ctx.G[item.want], 4); await S('gen.crs.reveal.seg'); },
  praise: () => 'praiseMeasure', twin(item) { return item.twin || null; },
};
/* ================= ⑤ ارسم مستقيماً يوازي المعطى على بُعد d مربعات (C121، إنتاج): dir، lo موضع المعطى. يحرّك الطفل المستقيم الثاني بزرّين أو بالسحب ================= */
ITEM.paraDraw = {
  make(spec) { return { ...spec, tag: 'para-draw' }; },
  async ask(item, mode, tries) { const svg = newStage(290, { oasis: false, ground: 0 }), Pg = paraGridAt(svg, 0, { dir: item.dir, lo: item.lo ?? 1, noOther: true, marks: true }), Gd = Pg.Gd, v = Pg.v, max = v ? Gd.cols : Gd.rows; let k = item.start ?? Math.min(max, Pg.lo + 1), mv = null, done = false;
    const g2 = el('g', { 'pointer-events': 'none' }, svg), set = n => { k = Math.max(0, Math.min(max, Math.round(n))); g2.innerHTML = ''; const [x1, y1] = v ? Gd.P(k, 0) : Gd.P(0, k), [x2, y2] = v ? Gd.P(k, Gd.rows) : Gd.P(Gd.cols, k); geoLine(g2, x1, y1, x2, y2, { color: CRS.b, w: 4 }); geoArrow(g2, (x1 + x2) / 2 + (v ? 0 : 8), (y1 + y2) / 2 - (v ? 8 : 0), v ? -90 : 0, CRS.mark, 9); /*T*/window.__paraK = k;/*/T*/ }; set(k);
    { const t = el('text', { x: 180, y: 252, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 700, fill: GEO.ink, 'pointer-events': 'none' }, svg); t.textContent = DG(item.d); }
    if (tries >= 3) { const m = helpG(svg), c = 3; for (let i = 0; i < item.d; i++) { const [xa, ya] = v ? Gd.P(Pg.lo + i, c) : Gd.P(c, Pg.lo + i), [xb, yb] = v ? Gd.P(Pg.lo + i + 1, c) : Gd.P(c, Pg.lo + i + 1); el('path', { d: v ? `M${xa} ${ya} Q${(xa + xb) / 2} ${ya - 16} ${xb} ${yb}` : `M${xa} ${ya} Q${xa + 16} ${(ya + yb) / 2} ${xb} ${yb}`, fill: 'none', stroke: css('--think'), 'stroke-width': 2.6 }, m); } }   /* الحلّ المشترك: القفزات من المستقيم المعطى مرسومة */
    const askQ = async () => { await S(tries >= 3 ? 'gen.crs.together.draw' : (item.q || 'gen.crs.drawQ'), { noGap: true }); await S(numw(item.d), { num: true }); }; askQ(); REPLAY_HOOK = () => askQ(); REPLAY_HOOK.live = () => !done && svg.isConnected;
    const input = fingerInput(svg, { map: e => { const q = svgPoint(svg, e); return [q.x, q.y]; }, down(q) { if (q[1] > Gd.y0 + 20) return false; const s = Gd.snap(q); set(v ? s[0] : s[1]); }, move(q) { const s = Gd.snap(q); set(v ? s[0] : s[1]); }, up() {} });
    /*T*/window.__paraAt = n => { const m = svg.getScreenCTM(), [x, y] = v ? Gd.P(n, 2) : Gd.P(3, n); return { x: m.a * x + m.e, y: m.d * y + m.f }; }; window.__paraWant = Pg.lo + item.d <= max ? Pg.lo + item.d : Pg.lo - item.d;/*/T*/
    const nudge = rulNudges(svg, 262, s => set(k + (v ? s : s)), v ? ['rulLeft', 'rulRight'] : ['crsDown', 'crsUp']); AUTO({ kind: 'paraDraw', ok: () => { set(Pg.lo + item.d <= max ? Pg.lo + item.d : Pg.lo - item.d); rulDoneBtn().click(); }, wrong: () => { const w = Pg.lo + item.d + 1 <= max ? Pg.lo + item.d + 1 : Pg.lo + item.d - 1; set(w === Pg.lo ? Pg.lo + 1 : w); rulDoneBtn().click(); } });
    await rulDone(() => { done = true; REPLAY_HOOK = null; input.off(); nudge.forEach(b => b.remove()); }); return { ans: Math.abs(k - Pg.lo), ctx: { svg, set, Pg } }; },
  judge(item, d) { return d === item.d ? { ok: true } : { ok: false, err: d === item.d + 1 ? 'gridPlusOne' : 'paraDrawOff' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); }, async hint2() { await S('gen.crs.hint.draw'); }, async together() {},
  async reveal(item, r) { const Pg = r.ctx.Pg, max = Pg.v ? Pg.Gd.cols : Pg.Gd.rows; r.ctx.set(Pg.lo + item.d <= max ? Pg.lo + item.d : Pg.lo - item.d); await S('gen.crs.reveal.draw'); },
  praise: () => 'praiseMeasure', twin(item) { return item.twin || null; },
};
/* ---------- ركن الورقة: ورقة مطوية مرتين، ركنها قائم، يوضع عند نقطة P ضلعه الأول باتجاه a ---------- */
function paperCornerAt(parent, P, a, s = 62) { const g = el('g', { transform: `translate(${P[0]} ${P[1]}) rotate(${-a})`, 'pointer-events': 'none', 'data-corner': 1 }, parent); el('path', { d: `M0 0 H${s} V${-s * .55} Q${s * .55} ${-s * .8} ${s * .2} ${-s} H0 Z`, fill: CRS.paper, stroke: CRS.paperEdge, 'stroke-width': 2, opacity: .92 }, g); el('path', { d: `M0 0 H${s} M0 0 V${-s}`, stroke: CRS.paperEdge, 'stroke-width': 3.4, 'stroke-linecap': 'round' }, g); return g; }
/* ================= ⑥ هل المستقيمان متعامدان؟ (C124): ang الزاوية بينهما (90 أو غيرها)، rot. يلمس الطفل الرسم فيوضع ركن الورقة، ثم يحكم ================= */
ITEM.cornerCheck = {
  make(spec) { const ang = spec.ang ?? 90; return { ...spec, ang, want: ang === 90 ? 'yes' : 'no', tag: 'corner-check' }; },
  async ask(item, mode, tries) { const svg = newStage(232, { oasis: false, ground: 0 }); rayFrame(svg); const rot = item.rot || 0, C = [180, 126]; linePairAt(svg, 'cross', { C, rot, ang: item.ang });
    const g = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg); el('rect', { x: 26, y: 20, width: 308, height: 192, rx: 10, fill: '#fff', opacity: .01 }, g);
    say(...lineOf(tries >= 3 ? 'gen.crs.together.corner' : item.q), { free: true }); await tapOne([{ g, k: 'c', label: labelText('crsCorner') }], { ok: 'c', pad: 60 }); hush(); g.remove();
    const pc = paperCornerAt(svg, [C[0] - 150, C[1] - 60], rot); await symTween(tries >= 3 ? 1300 : 650, t => pc.setAttribute('transform', `translate(${C[0] - 150 * (1 - t)} ${C[1] - 60 * (1 - t)}) rotate(${-rot})`)); SFX.tick();
    const k = await choosePick([['yes', labelText('crsPerpYes')], ['no', labelText('crsPerpNo')]], item.want); return { ans: k, ctx: { svg } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: item.want === 'yes' ? 'perpTilted' : 'perpEye' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); }, async hint2() { await S('gen.crs.hint.corner'); }, async together() {},
  async reveal(item) { await S(item.want === 'yes' ? 'gen.crs.reveal.perpYes' : 'gen.crs.reveal.perpNo'); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};
/* ================= ⑦ أدر الشارع حتى يتعامد مع الآخر (C124، إنتاج): rot اتجاه الشارع الثابت، start زاوية البدء بينهما. زرّان يديران 15 درجة ================= */
ITEM.perpTurn = {
  make(spec) { return { ...spec, tag: 'perp-turn' }; },
  async ask(item, mode, tries) { const svg = newStage(290, { oasis: false, ground: 0 }); rayFrame(svg); const rot = item.rot || 0, C = [180, 116]; fullLineAt(svg, C, rot, { color: CRS.a, w: 7, arrows: false }); let ang = item.start ?? 45, pc = null;
    const g2 = el('g', { 'pointer-events': 'none' }, svg), set = a => { ang = ((Math.round(a / 15) * 15) % 180 + 180) % 180; if (ang === 0) ang = 15; g2.innerHTML = ''; fullLineAt(g2, C, rot + ang, { color: CRS.b, w: 7, arrows: false }); /*T*/window.__perpAng = ang;/*/T*/ }; set(ang);
    if (tries >= 3) pc = paperCornerAt(helpG(svg), C, rot);   /* الحلّ المشترك: ركن الورقة موضوع على الشارع الثابت، والتدوير للطفل */
    say(...lineOf(tries >= 3 ? 'gen.crs.together.turn' : item.q), { free: true });
    const nudge = rulNudges(svg, 250, s => set(ang - s * 15), ['crsTurnL', 'crsTurnR']); AUTO({ kind: 'perpTurn', ok: () => { set(90); rulDoneBtn().click(); }, wrong: () => { set(75); rulDoneBtn().click(); } });
    await rulDone(() => { nudge.forEach(b => b.remove()); }); return { ans: ang, ctx: { svg, set, C, rot } }; },
  judge(item, a) { return a === 90 ? { ok: true } : { ok: false, err: 'perpEye' }; },
  onOk(item, r) { SFX.good(); perpMarkAt(r.ctx.svg, r.ctx.C, r.ctx.rot, r.ctx.rot + 90); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const m = helpG(r.ctx.svg); paperCornerAt(m, r.ctx.C, r.ctx.rot); await sleep(1500); m.remove(); }, async together() {},
  async reveal(item, r) { r.ctx.set(90); perpMarkAt(r.ctx.svg, r.ctx.C, r.ctx.rot, r.ctx.rot + 90); await S('gen.crs.reveal.perpYes'); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};
/* ================= ⑧ المس ضلعاً يوازي (rel: par) أو يعامد (rel: perp) الضلع المسمّى (C127): fig من SEGFIG، ref ================= */
const SIDE_REL = { rectF: { par: { ab: ['jd'], bj: ['da'], jd: ['ab'], da: ['bj'] }, perp: { ab: ['bj', 'da'], bj: ['ab', 'jd'], jd: ['bj', 'da'], da: ['ab', 'jd'] } }, paraF: { par: { ab: ['jd'], bj: ['da'], jd: ['ab'], da: ['bj'] }, perp: {} } };
ITEM.sideRel = {
  make(spec) { return { ...spec, wants: (SIDE_REL[spec.fig][spec.rel] || {})[spec.ref] || [], tag: 'side-' + spec.rel }; },
  async ask(item, mode, tries) { const svg = newStage(232, { oasis: false, ground: 0 }), { F, G } = segFigAt(svg, item.fig), others = F.segs.filter(k => k !== item.ref); ITEM.segTap.mark({ ctx: { G } }, item.ref, css('--compass')); let done = false;
    if (tries >= 3) { const m = helpG(svg); if (item.rel === 'perp') { const P = F.pts[item.ref[0]]; paperCornerAt(m, P, 0, 40).setAttribute('opacity', .7); } else for (const sg of [item.ref, ...item.wants]) { const P = F.pts[sg[0]], Q = F.pts[sg[1]]; geoArrow(m, (P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2, Math.atan2(Q[1] - P[1], Q[0] - P[0]) * 180 / Math.PI, CRS.mark, 10); } }
    const askQ = async () => { await S(tries >= 3 ? 'gen.crs.together.side' : item.q, { noGap: true }); for (const [i, k] of [...item.ref].entries()) await sayLtr(k, i ? {} : { noGap: true }); }; askQ(); REPLAY_HOOK = () => askQ(); REPLAY_HOOK.live = () => !done && svg.isConnected;
    const k = await tapOne(others.map(sg => ({ g: G[sg], k: sg, label: labelText('geoSeg') + ' ' + LTR[sg[0]] + ' ' + LTR[sg[1]] })), { ok: item.wants, pad: 56 }); done = true; REPLAY_HOOK = null; hush(); return { ans: k, ctx: { svg, G } }; },
  judge(item, k) { return item.wants.includes(k) ? { ok: true } : { ok: false, err: item.rel === 'par' ? 'sidePar' : 'sidePerp' }; },
  onOk(item, r) { SFX.good(); ITEM.segTap.mark(r, r.ans, GEO.hl); }, onWrong() { SFX.soft(); },
  async hint2(item) { await S(item.rel === 'par' ? 'gen.crs.hint.sidePar' : 'gen.crs.hint.sidePerp'); }, async together() {},
  async reveal(item, r) { for (const w of item.wants) ITEM.segTap.mark(r, w, GEO.hl); await S(item.rel === 'par' ? 'gen.crs.reveal.sidePar' : 'gen.crs.reveal.sidePerp'); },
  praise: () => 'praiseLook', twin(item) { return item.twin || null; },
};
/* ================= ⑨ أقصر طريق من الجزيرة إلى الشاطئ (C126 مدخل): ord ترتيب النقاط الثلاث على الشاطئ (0 العمودي)، ix موضع الجزيرة ================= */
function shoreGeo(ix) { const I = [ix, 60], y = 176; return { I, y, foot: [ix, y], cands: [[ix, y], [ix + 76, y], [ix - 118 < 40 ? ix + 140 : ix - 118, y]] }; }
function shoreAt(svg, ix) { const Gm = shoreGeo(ix); el('rect', { x: 20, y: 14, width: 320, height: 204, rx: 14, fill: '#cfe8f3', stroke: css('--line'), 'stroke-width': 2 }, svg); el('rect', { x: 21, y: Gm.y, width: 318, height: 41, fill: '#ead9b2' }, svg); geoLine(svg, 21, Gm.y, 339, Gm.y, { color: '#b9955a', w: 3 });
  el('ellipse', { cx: Gm.I[0], cy: Gm.I[1], rx: 26, ry: 15, fill: '#dcc48f', stroke: '#b9955a', 'stroke-width': 2 }, svg); palmAt(svg, Gm.I[0] + 6, Gm.I[1] + 2, .34); ptAt(svg, Gm.I[0], Gm.I[1] + 15, null, { r: 4.5 }); return Gm; }
ITEM.shortToLine = {
  make(spec) { const ord = spec.ord || [0, 1, 2]; return { ...spec, ord, want: ord.indexOf(0), tag: 'short-line' }; },
  async ask(item, mode, tries) { const svg = newStage(232, { oasis: false, ground: 0 }), Gm = shoreAt(svg, item.ix || 150), names = ['a', 'b', 'j'], from = [Gm.I[0], Gm.I[1] + 15];
    const G = item.ord.map((ci, i) => { const g = el('g', {}, svg), [x, y] = Gm.cands[ci]; geoLine(g, from[0], from[1], x, y, { color: GEO.road, w: 2.4, dash: '6 5' }); ptAt(g, x, y, names[i], { r: 7, color: CRS.mark, lab: [0, 24] }); return g; });
    if (tries >= 3) perpMarkAt(helpG(svg), Gm.foot, 0, 90, 11);   /* الحلّ المشترك: مربع التعامد عند أحد الخيوط، والاختيار للطفل */
    say(...lineOf(tries >= 3 ? 'gen.crs.together.shore' : item.q), { free: true });
    const k = await tapOne(G.map((g, i) => ({ g, k: i, label: labelText('geoPoint') + ' ' + LTR[names[i]] })), { ok: item.want, pad: 60 }); hush(); return { ans: k, ctx: { svg, G, Gm } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'shoreSlant' }; },
  onOk(item, r) { SFX.good(); okRing(r.ctx.svg, r.ctx.G[r.ans], 4); perpMarkAt(r.ctx.svg, r.ctx.Gm.foot, 0, 90, 11); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const m = helpG(r.ctx.svg); perpMarkAt(m, r.ctx.Gm.foot, 0, 90, 11); await sleep(1400); m.remove(); }, async together() {},
  async reveal(item, r) { okRing(r.ctx.svg, r.ctx.G[item.want], 4); perpMarkAt(r.ctx.svg, r.ctx.Gm.foot, 0, 90, 11); await S('gen.crs.reveal.shore'); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};
/* ================= ⑩ ما علاقة المستقيمين؟ (C120، C121، C124): kind para | perp | cross، rot، ang. عند المتقاطعين يوضع ركن الورقة فيُحكم به لا بالنظر ================= */
ITEM.pairName = {
  make(spec) { return { ...spec, want: spec.kind, tag: 'pair-' + spec.kind }; },
  async ask(item, mode, tries) { const svg = newStage(232, { oasis: false, ground: 0 }); rayFrame(svg); const C = [180, 126], Pr = linePairAt(svg, item.kind, { C, rot: item.rot || 0, ang: item.ang || 60, d: item.d });
    if (Pr.meet) paperCornerAt(svg, C, item.rot || 0, 52); if (tries >= 3) { const t = el('text', { x: 180, y: 34, 'text-anchor': 'middle', 'font-size': 15, fill: css('--think') }, helpG(svg)); t.textContent = labelText(Pr.meet ? 'crsAidMeet' : 'crsAidNoMeet'); }
    await S(tries >= 3 ? 'gen.crs.together.pair' : item.q); const k = await choosePick([['para', labelText('crsPara')], ['perp', labelText('crsPerp')], ['cross', labelText('crsCross')]], item.want); return { ans: k, ctx: { svg } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: item.want === 'para' || k === 'para' ? 'crossPar' : 'perpEye' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); }, async hint2(item) { await S(item.kind === 'para' ? 'gen.crs.hint.meet' : 'gen.crs.hint.corner'); }, async together() {},
  async reveal(item) { await S('gen.crs.reveal.pair.' + item.kind); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};

/* ---------- مشاهد S2-U2 ---------- */
const crsHot = svg => { const g = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg); el('rect', { x: 26, y: 20, width: 308, height: 192, rx: 10, fill: '#fff', opacity: .01 }, g); return g; };
/* تقاطع شارعين: يلمس الطفل حيث يلتقيان فتظهر نقطة التقاطع م. lines: [السؤال، بعد] */
SCENES.crossHook = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), [l1, l2] = c.lines, C = [190, 120]; el('rect', { x: 20, y: 14, width: 320, height: 204, rx: 14, fill: '#e3ecd9', stroke: css('--line'), 'stroke-width': 2 }, svg);
  for (const a of [12, 100]) { fullLineAt(svg, C, a, { color: '#8d9aa3', w: 22, arrows: false }); fullLineAt(svg, C, a, { color: '#fff', w: 1.6, arrows: false }).firstChild.setAttribute('stroke-dasharray', '8 8'); }
  const hot = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg); el('circle', { cx: C[0], cy: C[1], r: 24, fill: css('--compass'), opacity: .2, stroke: css('--compass'), 'stroke-width': 2.5 }, hot);
  await answerWhile(l1, () => tapOne([{ g: hot, k: 'm', label: labelText('crsMeet') }], { ok: 'm', pad: 64, pulse: true })); hot.remove(); ptAt(svg, C[0], C[1], 'm', { r: 7, color: CRS.mark, lab: [18, -12] }); SFX.good(); logAttempt({ scene: 'hook', tag: 'crossHook', ok: true }); await S(l2); };
/* العودان: يلمس الطفل فيدور العود الثاني إلى وضع جديد، وفي كل وضع نقطة مشتركة واحدة. lines: [الدعوة، ختام] */
SCENES.sticksLab = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), [l1, l2] = c.lines, C = [180, 116]; rayFrame(svg); fullLineAt(svg, C, 8, { color: CRS.a, w: 6 }); const g2 = el('g', { 'pointer-events': 'none' }, svg), pt = el('g', { 'pointer-events': 'none' }, svg), hot = crsHot(svg);
  const show = (P, a) => { g2.innerHTML = ''; pt.innerHTML = ''; fullLineAt(g2, P, a, { color: CRS.b, w: 6 }); const t = (P[1] - C[1]) / (Math.tan(a * Math.PI / 180) || 1e-6), u8 = Math.tan(8 * Math.PI / 180); /* نقطة التقاطع مع المستقيم الأول */
    const A1 = -u8, B1 = C[1] + u8 * C[0], A2 = -Math.tan(a * Math.PI / 180), B2 = P[1] - A2 * P[0], x = (B2 - B1) / (A1 - A2), y = A1 * x + B1; el('circle', { cx: x, cy: y, r: 8, fill: CRS.mark, stroke: '#fff', 'stroke-width': 2.5 }, pt); };
  const POS = [[[150, 116], 70], [[230, 110], 120], [[120, 120], 40], [[200, 118], 95]]; show(...POS[0]); S(l1, { free: true });
  for (let i = 1; i < POS.length; i++) { await tapOne([{ g: hot, k: i, label: labelText('crsTurnStick') }], { ok: i, pad: 60 }); if (i === 1) hush(); show(...POS[i]); SFX.tick(); await sleep(300); }
  logAttempt({ scene: c.s || 'explore', tag: 'sticksLab', ok: true }); await S(l2); };
/* يُمدّ خطّان لا يلتقيان في الرسم: kind conv (يلتقيان) أو para (لا يلتقيان). lines: [الدعوة، بعد] */
SCENES.extendShow = async c => { const it = ITEM.meetJudge.make({ kind: c.kind || 'conv', rot: c.rot || 0, dv: c.dv }), svg = newStage(232, { oasis: false, ground: 0 }), [l1, l2] = c.lines; rayFrame(svg); const Gm = ITEM.meetJudge.geo(it), L = 60;
  for (const [P, u, col] of [[Gm.P1, Gm.u1, CRS.a], [Gm.P2, Gm.u2, CRS.b]]) geoLine(svg, P[0] - u[0] * L, P[1] - u[1] * L, P[0] + u[0] * L, P[1] + u[1] * L, { color: col, w: 4 }); const hot = crsHot(svg);
  await answerWhile(l1, () => tapOne([{ g: hot, k: 'x', label: labelText('crsExtend') }], { ok: 'x', pad: 60 })); hot.remove(); const ext = el('g', { 'pointer-events': 'none' }, svg);
  for (const [P, u, col] of [[Gm.P1, Gm.u1, CRS.a], [Gm.P2, Gm.u2, CRS.b]]) { const E1 = rayEdge(P, [P[0] + u[0], P[1] + u[1]]), E2 = rayEdge(P, [P[0] - u[0], P[1] - u[1]]); geoLine(ext, E2[0], E2[1], E1[0], E1[1], { color: col, w: 2.4, dash: '6 5' }); }
  await anim(ext, [{ opacity: 0 }, { opacity: 1 }], { duration: 900, fill: 'forwards' }).done.catch(() => {}); SFX.tick(); logAttempt({ scene: c.s || 'explore', tag: 'extendShow', ok: true }); await S(l2); };
/* المسافة بين المتوازيين: ثلاثة قياسات على الشبكة (عمودي ومائلان)؛ يلمس الطفل كلاً منها فيظهر طوله. c: d، lines: [الدعوة، ختام] */
SCENES.distShow = async c => { const svg = newStage(270, { oasis: false, ground: 0 }), d = c.d || 3, Pg = paraGridAt(svg, d, { lo: 1, marks: true }), Gd = Pg.Gd, [l1, l2] = c.lines, X0 = [5, 3, 1], SL = [2, 1, 0], COL = ['#8e6bbf', css('--think'), css('--compass')]; S(l1, { free: true });
  for (let i = 0; i < 3; i++) { const [x1, y1] = Gd.P(X0[i], 1), [x2, y2] = Gd.P(X0[i] + SL[i], 1 + d), g = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg); geoLine(g, x1, y1, x2, y2, { color: 'transparent', w: 34 }); geoLine(g, x1, y1, x2, y2, { color: COL[i], w: 5 });
    await tapOne([{ g, k: i, label: labelText('crsMeasure') + ' ' + DG(i + 1) }], { ok: i, pad: 56, pulse: true }); if (i === 0) hush(); const mm = Math.round(Math.hypot(SL[i], d) * 10), t = el('text', { x: (x1 + x2) / 2 + 30, y: (y1 + y2) / 2 + 6, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: COL[i], 'pointer-events': 'none' }, svg); t.textContent = DG(Math.floor(mm / 10)) + ' ' + labelText('rulCm') + (mm % 10 ? ' ' + DG(mm % 10) + ' ' + labelText('rulMm') : ''); SFX.tick();
    await sayLen(Math.floor(mm / 10), 'cm', mm % 10 ? { noGap: true } : {}); if (mm % 10) { await S('gen.rul.and', { noGap: true }); await sayLen(mm % 10, 'mm'); } if (i === 2) perpMarkAt(svg, [x1, y1], 0, 90, 11); }
  logAttempt({ scene: c.s || 'explore', tag: 'distShow', ok: true }); SFX.good(); await S(l2); };
/* ركن الورقة: ورقة تُطوى مرتين فيظهر ركنها. lines: [الطيّة الأولى، الطيّة الثانية، الركن] */
SCENES.cornerFold = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), [l1, l2, l3] = c.lines; rayFrame(svg); const g = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg), r = el('path', { d: 'M96 44 L250 30 L268 180 L84 196 Z', fill: CRS.paper, stroke: CRS.paperEdge, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
  await answerWhile(l1, () => tapOne([{ g, k: 1, label: labelText('crsPaper') }], { ok: 1, pad: 60 })); r.setAttribute('d', 'M96 110 L262 110 L268 180 L84 196 Z'); el('line', { x1: 96, y1: 110, x2: 262, y2: 110, stroke: CRS.paperEdge, 'stroke-width': 3.4 }, g); SFX.pop();
  await answerWhile(l2, () => tapOne([{ g, k: 2, label: labelText('crsPaper') }], { ok: 2, pad: 60 })); g.innerHTML = ''; g.removeAttribute('role'); g.removeAttribute('tabindex'); paperCornerAt(svg, [130, 170], 0, 110); SFX.good();
  el('circle', { cx: 130, cy: 170, r: 16, fill: 'none', stroke: CRS.mark, 'stroke-width': 3 }, svg); logAttempt({ scene: c.s || 'explore', tag: 'cornerFold', ok: true }); await S(l3); };
/* المتعامدان: يوضع ركن الورقة عند التقاطع فينطبق ضلعاه على المستقيمين، ثم يُدار الرسم كله فيبقيان متعامدين. lines: [الدعوة، بعد الانطباق، بعد التدوير] */
SCENES.perpShow = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), [l1, l2, l3] = c.lines, C = [180, 126]; rayFrame(svg); const all = el('g', {}, svg); linePairAt(all, 'perp', { C, rot: 0 }); const hot = crsHot(svg);
  await answerWhile(l1, () => tapOne([{ g: hot, k: 'c', label: labelText('crsCorner') }], { ok: 'c', pad: 60 })); const pc = paperCornerAt(all, [C[0] - 150, C[1] - 60], 0); await symTween(700, t => pc.setAttribute('transform', `translate(${C[0] - 150 * (1 - t)} ${C[1] - 60 * (1 - t)}) rotate(0)`)); perpMarkAt(all, C, 180, 270, 13); SFX.good(); await S(l2);
  await symTween(1100, t => all.setAttribute('transform', `rotate(${-40 * t} ${C[0]} ${C[1]})`)); logAttempt({ scene: c.s || 'explore', tag: 'perpShow', ok: true }); await S(l3); };
/* الجزيرة والشاطئ: يلمس الطفل ثلاث نقاط على الشاطئ فيُشدّ خيط إلى كل منها ويظهر طوله. lines: [الدعوة، ختام] */
SCENES.shoreShow = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), Gm = shoreAt(svg, c.ix || 150), [l1, l2] = c.lines, from = [Gm.I[0], Gm.I[1] + 15], order = [2, 1, 0]; S(l1, { free: true });
  for (const [n, ci] of order.entries()) { const [x, y] = Gm.cands[ci], g = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg); el('circle', { cx: x, cy: y, r: 11, fill: CRS.mark, opacity: .35, stroke: CRS.mark, 'stroke-width': 2 }, g);
    await tapOne([{ g, k: ci, label: labelText('crsShorePt') + ' ' + DG(n + 1) }], { ok: ci, pad: 60, pulse: true }); if (n === 0) hush(); g.remove(); geoLine(svg, from[0], from[1], x, y, { color: GEO.road, w: 3 }); ptAt(svg, x, y, null, { r: 5, color: CRS.mark }); const mm = Math.round(Math.hypot(x - from[0], y - from[1]) / 3), t = el('text', { x: x + (ci === 2 && x < from[0] ? -4 : 4), y: y + 26, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GEO.ink, 'pointer-events': 'none' }, svg); t.textContent = DG(Math.round(mm / 10)) + ' ' + labelText('rulCm'); SFX.tick(); await sayLen(Math.round(mm / 10)); }
  perpMarkAt(svg, Gm.foot, 0, 90, 11); logAttempt({ scene: c.s || 'explore', tag: 'shoreShow', ok: true }); SFX.good(); await S(l2); };
/* أضلاع المستطيل: يلمس الطفل ضلعاً فيظهر ما يوازيه (سهمان)، ثم ضلعاً فيظهر ما يعامده (مربع صغير). lines: [دعوة التوازي، بعده، دعوة التعامد، ختام] */
SCENES.sidesShow = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), { F, G } = segFigAt(svg, 'rectF'), [l1, l2, l3, l4] = c.lines, mid = sg => { const P = F.pts[sg[0]], Q = F.pts[sg[1]]; return [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2, Math.atan2(Q[1] - P[1], Q[0] - P[0]) * 180 / Math.PI]; };
  await answerWhile(l1, () => tapOne([{ g: G.ab, k: 'ab', label: labelText('geoSeg') }], { ok: 'ab', pad: 56, pulse: true })); for (const sg of ['ab', 'jd']) { ITEM.segTap.mark({ ctx: { G } }, sg, CRS.a); const [x, y] = mid(sg); geoArrow(svg, x + 6, y, 0, CRS.mark, 10); } SFX.tick(); await S(l2);
  await answerWhile(l3, () => tapOne([{ g: G.bj, k: 'bj', label: labelText('geoSeg') }], { ok: 'bj', pad: 56, pulse: true })); ITEM.segTap.mark({ ctx: { G } }, 'bj', CRS.b); perpMarkAt(svg, F.pts.b, 180, 270, 14); SFX.good(); logAttempt({ scene: c.s || 'explore', tag: 'sidesShow', ok: true }); await S(l4); };
SCENES.recallPair = async c => { const svg = newStage(232, { oasis: false, ground: 0 }); rayFrame(svg); const Pr = linePairAt(svg, c.kind || 'para', { C: [180, 126], rot: c.rot || 0, ang: c.ang, marks: true }); if (c.corner && Pr.meet) paperCornerAt(svg, [180, 126], c.rot || 0, 52); await sleep(300); await S(c.lines); };
SCENES.recallShore = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), Gm = shoreAt(svg, c.ix || 150); geoLine(svg, Gm.I[0], Gm.I[1] + 15, Gm.foot[0], Gm.foot[1], { color: GEO.road, w: 3 }); perpMarkAt(svg, Gm.foot, 0, 90, 11); await sleep(300); await S(c.lines); };
SCENES.recallParaGrid = async c => { const svg = newStage(270, { oasis: false, ground: 0 }), Pg = paraGridAt(svg, c.d || 3, { lo: 1, marks: true }), [x, y] = Pg.Gd.P(3, 1), [x2, y2] = Pg.Gd.P(3, 1 + (c.d || 3)); geoLine(svg, x, y, x2, y2, { color: css('--compass'), w: 5 }); perpMarkAt(svg, [x, y], 0, 90, 11); await sleep(300); await S(c.lines); };
WRAP_ART.crossRoads = svg => { const g = el('g', {}, svg); el('rect', { x: 60, y: 60, width: 240, height: 130, rx: 14, fill: '#e3ecd9', stroke: css('--line'), 'stroke-width': 2 }, g); geoLine(g, 70, 150, 290, 100, { color: '#8d9aa3', w: 16 }); geoLine(g, 150, 66, 200, 184, { color: '#8d9aa3', w: 16 }); el('circle', { cx: 178, cy: 126, r: 7, fill: CRS.mark, stroke: '#fff', 'stroke-width': 2 }, g); anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200, fill: 'both' }); palmAt(svg, 330, 250, .7); palmAt(svg, 30, 250, .8); };
WRAP_ART.railPair = svg => { const g = el('g', {}, svg); el('rect', { x: 60, y: 70, width: 240, height: 110, rx: 14, fill: '#eef3e6', stroke: css('--line'), 'stroke-width': 2 }, g); for (const y of [104, 146]) { geoLine(g, 70, y, 290, y, { color: '#5b6770', w: 5 }); geoArrow(g, 190, y, 0, CRS.mark, 10); } anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200, fill: 'both' }); palmAt(svg, 330, 250, .7); palmAt(svg, 30, 250, .8); };
WRAP_ART.paperCorner = svg => { const g = el('g', {}, svg); paperCornerAt(g, [130, 190], 0, 120); el('circle', { cx: 130, cy: 190, r: 16, fill: 'none', stroke: CRS.mark, 'stroke-width': 3 }, g); anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200, fill: 'both' }); palmAt(svg, 330, 250, .7); palmAt(svg, 30, 250, .8); };
WRAP_ART.islandShore = svg => { const g = el('g', {}, svg); el('rect', { x: 60, y: 50, width: 240, height: 150, rx: 14, fill: '#cfe8f3' }, g); el('rect', { x: 60, y: 170, width: 240, height: 30, fill: '#ead9b2' }, g); el('ellipse', { cx: 170, cy: 90, rx: 24, ry: 13, fill: '#dcc48f', stroke: '#b9955a', 'stroke-width': 2 }, g); geoLine(g, 170, 103, 170, 170, { color: GEO.road, w: 3 }); perpMarkAt(g, [170, 170], 0, 90, 10); anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200, fill: 'both' }); palmAt(svg, 330, 250, .7); palmAt(svg, 30, 250, .8); };
