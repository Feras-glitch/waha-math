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
