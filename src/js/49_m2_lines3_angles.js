/* =====================================================================
   S2-U3 «زوايا الأركان» (المرحلة 2، نوفمبر 2026)
   د1 الزاوية: رأس وضلعان وانفتاح (C130)، والزاوية دوران (C131)، والتسمية بثلاثة أحرف والرأس في الوسط (C132)
   د2 القائمة مرجعاً (C133) والحادة والمنفرجة (C134) · د3 الدرجة والمستقيمة والكاملة (C135)، والصفرية للفضول (C136)
   د4 المنعكسة، والزاوية ومتبقّيها 360 (C135، D242) · د5 المنقلة (C137) وقياس المنعكسة 360 − س (C138)
   د6 الرسم بقياس معلوم (C139) والتقدير قبل القياس (C140) · د7 مدينة الزوايا والاتجاهات الأصلية (C191) · د8 المراجعة والاختبار
   الزاوية تُرسم ضلعين من رأس وقوساً على الجهة المقصودة؛ والقياس بالدرجات بأرقام المسطرة (D229 (4)).
   ===================================================================== */
const ANG = { side: '#24323a', arc: '#2f9d6b', rx: '#8e6bbf', v: '#c8392d', prot: '#eaf4fa', protEdge: '#4f86a8', protInk: '#24323a', hand: '#b0552f' };
const angU = d => [Math.cos(d * Math.PI / 180), -Math.sin(d * Math.PI / 180)];
const angP = (V, d, r) => { const u = angU(d); return [V[0] + u[0] * r, V[1] + u[1] * r]; };
const ANG_KIND = d => d === 0 ? 'zero' : d < 90 ? 'acute' : d === 90 ? 'right' : d < 180 ? 'obtuse' : d === 180 ? 'straight' : d < 360 ? 'reflex' : 'full';
/* قوس من الاتجاه a1 إلى a2 عكس عقارب الساعة (درجات الرياضيات، والشاشة y إلى الأسفل)، full: دائرة كاملة */
function angArc(V, r, a1, a2, full) { if (full) return `M${V[0] + r} ${V[1]} A${r} ${r} 0 1 0 ${V[0] - r} ${V[1]} A${r} ${r} 0 1 0 ${V[0] + r} ${V[1]}`;
  const sw = ((a2 - a1) % 360 + 360) % 360, P = angP(V, a1, r), Q = angP(V, a2, r); return `M${P[0].toFixed(1)} ${P[1].toFixed(1)} A${r} ${r} 0 ${sw > 180 ? 1 : 0} 0 ${Q[0].toFixed(1)} ${Q[1].toFixed(1)}`; }
/* زاوية: الضلع الأول باتجاه a1، والثاني بعده بـdeg عكس عقارب الساعة. o: l1، l2 طولا الضلعين، names [طرف الأول، الرأس، طرف الثاني]، arc: in | out | both | false، col، w
   يرجع { g، V، a1، a2، P1، P2، s1، s2، vtx، arcIn، arcOut } */
function angleAt(parent, V, a1, deg, o = {}) { const g = el('g', { 'data-angle': deg }, parent), a2 = a1 + deg, l1 = o.l1 || 110, l2 = o.l2 || l1, P1 = angP(V, a1, l1), P2 = angP(V, a2, l2), col = o.col || ANG.side;
  const side = (P, a, nm) => { const s = el('g', { 'data-side': nm }, g), Q0 = angP(V, a, 22); el('line', { x1: Q0[0], y1: Q0[1], x2: P[0], y2: P[1], stroke: 'transparent', 'stroke-width': 30, 'stroke-linecap': 'round' }, s); geoLine(s, V[0], V[1], P[0], P[1], { color: col, w: o.w || 4 }); return s; };
  const s1 = side(P1, a1, 's1'), s2 = side(P2, a2, 's2'); let arcIn = null, arcOut = null;
  if (o.arc === 'in' || o.arc === 'both' || o.arc == null) arcIn = el('path', { d: deg >= 360 ? angArc(V, o.r || 26, 0, 0, true) : angArc(V, o.r || 26, a1, a2), fill: 'none', stroke: ANG.arc, 'stroke-width': 3.2, 'pointer-events': 'none' }, g);
  if (o.arc === 'out' || o.arc === 'both') arcOut = el('path', { d: angArc(V, (o.r || 26) - 6, a2, a1 + 360), fill: 'none', stroke: ANG.rx, 'stroke-width': 3.2, 'pointer-events': 'none' }, g);
  const vtx = el('g', { 'data-vtx': 1 }, g); el('circle', { cx: V[0], cy: V[1], r: 6, fill: ANG.v, stroke: '#fff', 'stroke-width': 2 }, vtx);
  if (o.names) { const [n1, nv, n2] = o.names, lab = (P, k, a) => { const q = angP(P, a, 16), t = el('text', { x: q[0], y: q[1] + 6, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: GEO.ink, 'pointer-events': 'none' }, g); t.textContent = LTR[k]; };
    lab(P1, n1, a1); lab(P2, n2, a2); lab(V, nv, deg >= 180 ? a1 - 90 : a1 + deg / 2 + 180); }
  return { g, V, a1, a2, P1, P2, s1, s2, vtx, arcIn, arcOut }; }
/* درجات منطوقة: «تسعون درجة» (تُلحق بالفقاعة كتتمة السؤال) */
const degw = n => 'gen.deg.' + n;
async function sayDeg(n, opt = {}) { return S(degw(n), { append: true, ...opt }); }
/* المنقلة: نصف قرص مركزه V، خط أساسه باتجاه base، والمقياسان: الخارجي يبدأ من الصفر عند base، والداخلي يبدأ من الصفر عند الطرف الآخر.
   o: R، step تسمية كل step درجات (10)، hi: { deg، scale: out | in } يلوّن تدريجة القراءة */
function protAt(parent, V, base, o = {}) { const R = o.R || 140, g = el('g', { 'data-prot': base, 'pointer-events': 'none' }, parent), A = t => base + t;
  const P0 = angP(V, base, R), P1 = angP(V, base + 180, R); el('path', { d: `M${P0[0]} ${P0[1]} A${R} ${R} 0 0 0 ${P1[0]} ${P1[1]} Z`, fill: ANG.prot, stroke: ANG.protEdge, 'stroke-width': 2, opacity: .93 }, g);
  for (let t = 0; t <= 180; t += 5) { const big = t % 10 === 0, a = angP(V, A(t), R), b = angP(V, A(t), R - (big ? 12 : 7)); el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: ANG.protInk, 'stroke-width': big ? 1.6 : 1 }, g); }
  const step = o.step || 10, lab = el('g', { 'pointer-events': 'none', 'data-prot-lab': 1 }, g); for (let t = 0; t <= 180; t += step) for (const [val, r, sz, col] of [[t, R - 23, 11, ANG.protInk], [180 - t, R - 41, 9.5, '#6a7f8c']]) { const q = angP(V, A(t), r), tx = el('text', { x: q[0], y: q[1] + 4, 'text-anchor': 'middle', 'font-size': sz, 'font-weight': 700, fill: col, direction: 'ltr', 'font-family': 'var(--font-read)', stroke: ANG.prot, 'stroke-width': 3, 'paint-order': 'stroke', 'stroke-linejoin': 'round' }, lab); tx.textContent = String(val); }   /* حدّ بلون المنقلة حول كل عدد: يُقرأ وإن مرّ تحته ضلع (الفحص المستقل لبوابة S2-U2/U3 (11)) */
  geoLine(g, P0[0], P0[1], P1[0], P1[1], { color: ANG.protEdge, w: 2 }); el('circle', { cx: V[0], cy: V[1], r: 5, fill: 'none', stroke: ANG.v, 'stroke-width': 2 }, g); geoLine(g, V[0], V[1] - 9, V[0], V[1] + 2, { color: ANG.v, w: 1.6 });
  return { g, R, lab, top() { parent.appendChild(lab); }, mark(t, col = ANG.v) { const a = angP(V, A(t), R), b = angP(V, A(t), R - 46); el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: col, 'stroke-width': 3 }, g); } }; }
/* إطار الزاوية (مسرح 232) */
const angFrame = svg => rayFrame(svg);
/* عدد بالدرجات: الرقم ودائرة صغيرة فوقه (رمز الدرجة لا يغطّيه خط القراءة، D256) */
function degText(parent, x, y, n, o = {}) { const fs = o.size || 18, g = el('g', { 'pointer-events': 'none' }, parent), t = el('text', { x, y, 'text-anchor': 'middle', 'font-size': fs, 'font-weight': 700, fill: o.color || GEO.ink, direction: 'ltr', 'font-family': 'var(--font-read)' }, g); t.textContent = String(n); el('circle', { cx: x + String(n).length * fs * .29 + fs * .22, cy: y - fs * .66, r: fs * .13, fill: 'none', stroke: o.color || GEO.ink, 'stroke-width': fs * .09 }, g); return g; }

/* ================= ① المس الرأس، أو ضلعاً (C130): deg، rot، ask v | s ================= */
ITEM.angleParts = {
  make(spec) { return { ...spec, ask: spec.ask || 'v', tag: 'ang-part-' + (spec.ask || 'v') }; },
  async ask(item, mode, tries) { const svg = newStage(232, { oasis: false, ground: 0 }); angFrame(svg); const V = item.V || [150, 150], A = angleAt(svg, V, item.rot || 0, item.deg || 60, { arc: false, l1: item.l1 || 120, l2: item.l2 || 110 });
    if (tries >= 3) { const m = helpG(svg); for (const [P, a] of [[A.P1, A.a1], [A.P2, A.a2]]) { const q = angP(V, a, 60); geoArrow(m, q[0], q[1], -(a + 180), css('--think'), 10); } }   /* الحلّ المشترك: سهمان على الضلعين نحو الرأس */
    say(...lineOf(tries >= 3 ? (item.ask === 'v' ? 'gen.ang.together.v' : 'gen.ang.together.s') : item.q), { free: true });
    const k = await tapOne([{ g: A.vtx, k: 'v', label: labelText('angVertex') }, { g: A.s1, k: 's1', label: labelText('angSide') }, { g: A.s2, k: 's2', label: labelText('angSide') }], { ok: item.ask === 'v' ? 'v' : ['s1', 's2'], pad: 44 }); hush(); return { ans: k, ctx: { svg, A } }; },
  judge(item, k) { return (item.ask === 'v' ? k === 'v' : k !== 'v') ? { ok: true } : { ok: false, err: item.ask === 'v' ? 'angVertex' : 'angSide' }; },
  onOk(item, r) { SFX.good(); okRing(r.ctx.svg, r.ans === 'v' ? r.ctx.A.vtx : r.ctx.A[r.ans], 4); }, onWrong() { SFX.soft(); },
  async hint2(item) { await S(item.ask === 'v' ? 'gen.ang.hint.v' : 'gen.ang.hint.s'); }, async together() {},
  async reveal(item, r) { okRing(r.ctx.svg, item.ask === 'v' ? r.ctx.A.vtx : r.ctx.A.s1, 4); await S(item.ask === 'v' ? 'gen.ang.reveal.v' : 'gen.ang.reveal.s'); },
  praise: () => 'praiseLook', twin(item) { return item.twin || null; },
};
/* ================= ② أيّ الزاويتين أكبر (أو أصغر)؟ (C130): degs [يمين، يسار]، lens طولا ضلعي كلٍّ منهما، ask big | small ================= */
ITEM.angleBig = {
  make(spec) { const big = (spec.ask || 'big') === 'big', d = spec.degs, w = big ? (d[0] > d[1] ? 0 : 1) : (d[0] < d[1] ? 0 : 1); /*T*/if (TESTHOOK && d[0] === d[1]) testBug('angleBig: زاويتان متساويتان');/*/T*/ return { ...spec, ask: big ? 'big' : 'small', want: w, tag: 'ang-big-' + (big ? 'big' : 'small') }; },
  draw(item, svg) {   /* كل زاوية تُوضع بعرضها الحقيقي داخل الإطار (الضلع الطويل لا يخرج منه)، والفراغ يُوزَّع بالتساوي؛ الأولى إلى اليمين */
    const ext = item.degs.map((d, i) => { const r = item.rots ? item.rots[i] : 0, l = item.lens[i], xs = [0, l * Math.cos(r * Math.PI / 180), l * Math.cos((r + d) * Math.PI / 180)]; return [Math.min(...xs), Math.max(...xs)]; });
    const w = ext.map(([a, b]) => b - a), s = Math.max(8, (308 - w[0] - w[1]) / 3), left = [26 + s + w[1] + s, 26 + s];
    /*T*/if (TESTHOOK && w[0] + w[1] + 24 > 308) testBug('angleBig: الزاويتان أعرض من الإطار');/*/T*/
    return item.degs.map((d, i) => angleAt(svg, [left[i] - ext[i][0], 176], item.rots ? item.rots[i] : 0, d, { l1: item.lens[i], l2: item.lens[i] })); },
  async ask(item, mode, tries) { const svg = newStage(232, { oasis: false, ground: 0 }); angFrame(svg); const As = this.draw(item, svg), G = As.map(A => A.g);
    if (tries >= 3) { const m = helpG(svg); As.forEach(A => el('path', { d: angArc(A.V, 40, A.a1, A.a2), fill: 'none', stroke: css('--think'), 'stroke-width': 5, opacity: .7 }, m)); }   /* الحلّ المشترك: قوسان بنصف قطر واحد، فيُقارَن الانفتاح لا الضلعان */
    say(...lineOf(tries >= 3 ? (item.ask === 'small' ? 'gen.ang.together.small' : 'gen.ang.together.big') : item.q), { free: true });
    const k = await tapOne(G.map((g, i) => ({ g, k: i, label: labelText('angAngle') + ' ' + DG(i + 1) })), { ok: item.want, pad: 30 }); hush(); return { ans: k, ctx: { svg, G } }; },
  judge(item, k) { if (k === item.want) return { ok: true }; const longer = item.lens[k] > item.lens[1 - k]; return { ok: false, err: longer ? 'angSideLen' : 'angOpen' }; },
  onOk(item, r) { SFX.good(); okRing(r.ctx.svg, r.ctx.G[r.ans], 2); }, onWrong() { SFX.soft(); },
  async hint2(item) { await S(item.ask === 'small' ? 'gen.ang.hint.small' : 'gen.ang.hint.big'); }, async together() {},
  async reveal(item, r) { okRing(r.ctx.svg, r.ctx.G[item.want], 2); await S('gen.ang.reveal.big'); },
  praise: () => 'praiseLook', twin(item) { return item.twin || null; },
};
/* ================= ③ ما اسم الزاوية؟ (C132): deg، rot، nm [طرف، رأس، طرف]. البطاقات: الاسم والرأس في الوسط، والرأس أولاً، والرأس آخراً ================= */
ITEM.angleName = {
  make(spec) { const [x, v, y] = spec.nm, opts = [[x + v + y, true], [v + x + y], [x + y + v]]; return { ...spec, opts, tag: 'ang-name' }; },
  draw(item, svg) { angFrame(svg); return angleAt(svg, item.V || [170, 150], item.rot || 0, item.deg || 50, { names: item.nm }); },
  async ask(item, mode, tries) { const svg = newStage(232, { oasis: false, ground: 0 }), A = this.draw(item, svg);
    if (tries >= 3) el('circle', { cx: A.V[0], cy: A.V[1], r: 22, fill: 'none', stroke: css('--think'), 'stroke-width': 2.5, 'stroke-dasharray': '4 3' }, helpG(svg));   /* الحلّ المشترك: الرأس محاط، وحرفه في وسط الاسم */
    const q = tries >= 3 ? 'gen.ang.together.name' : item.q; await S(q); const cp = cardPick(item.opts.map(([nm, ok], i) => ({ id: 'gen.ang.nm.' + nm, k: 'o' + i, ok: !!ok })), { intro: q }), c = await cp.p; cp.done(); return { ans: c.ok ? 'ok' : c.k, ctx: { svg, cp, c, A } }; },
  judge(item, a) { return a === 'ok' ? { ok: true } : { ok: false, err: 'angNameVertex' }; },
  onOk(item, r) { SFX.good(); r.ctx.cp.btns.find(b => b.dataset.k === r.ctx.c.k).classList.add('ok'); }, onWrong(item, r) { SFX.soft(); r.ctx.cp.btns.find(b => b.dataset.k === r.ctx.c.k).classList.add('no'); },
  async hint2() { await S('gen.ang.hint.name'); }, async together() {},
  async reveal(item, r) { const b = r.ctx.cp.btns.find(x => x.dataset.k === 'o0'); if (b) b.classList.add('ok'); await S('gen.ang.nm.' + item.opts[0][0]); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};
/* ---------- عقرب يدور حول الرأس (للدوران): يرجع { set(a)، g } ---------- */
function angHandAt(parent, V, len, col = ANG.hand) { const g = el('g', { 'pointer-events': 'none' }, parent), ln = el('line', { x1: V[0], y1: V[1], x2: V[0] + len, y2: V[1], stroke: col, 'stroke-width': 6, 'stroke-linecap': 'round' }, g); el('circle', { cx: V[0], cy: V[1], r: 7, fill: col, stroke: '#fff', 'stroke-width': 2 }, g);
  return { g, set(a) { const P = angP(V, a, len); ln.setAttribute('x2', P[0]); ln.setAttribute('y2', P[1]); } }; }
const TURN_KEYS = { 1: 'q1', 2: 'q2', 3: 'q3', 4: 'q4' };
/* ================= ④ كم دار العقرب؟ (C131): q ربع (1) أو نصف (2) أو ثلاثة أرباع (3) أو دورة كاملة (4)، rot البدء. يلمس الطفل الساعة فيدور العقرب، ثم يختار ================= */
ITEM.angleTurn = {
  make(spec) { return { ...spec, want: TURN_KEYS[spec.turns], tag: 'ang-turn' }; },
  async ask(item, mode, tries) { const svg = newStage(232, { oasis: false, ground: 0 }); angFrame(svg); const V = [180, 118], rot = item.rot ?? 90; el('circle', { cx: V[0], cy: V[1], r: 86, fill: '#fffdf6', stroke: css('--line'), 'stroke-width': 3 }, svg);
    for (let i = 0; i < 4; i++) { const P = angP(V, i * 90, 78), Q = angP(V, i * 90, 68); geoLine(svg, P[0], P[1], Q[0], Q[1], { color: GEO.ink, w: 3 }); }
    geoLine(svg, V[0], V[1], ...angP(V, rot, 70), { color: '#9fb0bb', w: 4, dash: '6 5' }); const H = angHandAt(svg, V, 70); H.set(rot); const trail = el('path', { fill: 'none', stroke: ANG.arc, 'stroke-width': 4, 'pointer-events': 'none' }, svg);
    const hot = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg); el('circle', { cx: V[0], cy: V[1], r: 90, fill: '#fff', opacity: .01 }, hot);
    say(...lineOf(tries >= 3 ? 'gen.ang.together.turn' : item.q), { free: true }); await tapOne([{ g: hot, k: 'h', label: labelText('angClock') }], { ok: 'h', pad: 20 }); hush(); hot.remove();
    const tot = item.turns * 90, cw = item.cw !== false; await symTween(tries >= 3 ? 600 * item.turns : 380 * item.turns, t => { const a = rot + (cw ? -1 : 1) * tot * t; H.set(a); trail.setAttribute('d', tot * t >= 359.5 ? angArc(V, 40, 0, 0, true) : cw ? angArc(V, 40, a, rot) : angArc(V, 40, rot, a)); if (tries >= 3) { /* الحلّ المشترك: نُعدّ أرباع الدورة بصوت */ } }); SFX.tick();
    if (tries >= 3) for (let i = 1; i <= item.turns; i++) { el('circle', { cx: 46 + i * 22, cy: 34, r: 8, fill: css('--think') }, helpG(svg)); await S(numw(i), { num: true, noGap: true }); }
    const k = await choosePick([1, 2, 3, 4].map(n => [TURN_KEYS[n], labelText('angTurn' + n), '<i></i>', 'gen.ang.turn.' + n]), item.want); return { ans: k, ctx: { svg } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'angTurn' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); }, async hint2() { await S('gen.ang.hint.turn'); }, async together() {},
  async reveal(item) { await S('gen.ang.turn.' + item.turns); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};
/* ================= ⑤ باب القلعة: أدر الباب حتى ينفتح انفتاح الزاوية النموذج (C130، إنتاج): deg المطلوب، l طول ضلعي النموذج، from0 زاوية البدء. زرّان بخطوة 15 ================= */
ITEM.angleMatch = {
  make(spec) { return { ...spec, tag: 'ang-match' }; },
  async ask(item, mode, tries) { const svg = newStage(290, { oasis: false, ground: 0 }); angFrame(svg); angleAt(svg, [262, 74], 0, item.deg, { l1: item.l || 56, col: '#6a7f8c' });   /* النموذج صغير الضلعين أعلى اليمين */
    const Vd = [166, 200]; geoLine(svg, 40, Vd[1], 320, Vd[1], { color: '#8a6a4a', w: 7 });   /* المفصل في الوسط: الباب يبقى في الإطار حتى نصف الدورة */ let ang = item.from0 ?? 30; const door = el('g', { 'pointer-events': 'none' }, svg), arc = el('path', { fill: 'none', stroke: ANG.arc, 'stroke-width': 3, 'pointer-events': 'none' }, svg);
    const set = a => { ang = Math.max(15, Math.min(180, Math.round(a / 15) * 15)); door.innerHTML = ''; const P = angP(Vd, ang, 118); geoLine(door, Vd[0], Vd[1], P[0], P[1], { color: '#b0552f', w: 9 }); arc.setAttribute('d', angArc(Vd, 30, 0, ang)); /*T*/window.__angMatch = ang;/*/T*/ }; set(ang);
    el('circle', { cx: Vd[0], cy: Vd[1], r: 7, fill: ANG.v, stroke: '#fff', 'stroke-width': 2 }, svg);
    if (tries >= 3) el('path', { d: angArc(Vd, 52, 0, item.deg), fill: 'none', stroke: css('--think'), 'stroke-width': 5, opacity: .65 }, helpG(svg));   /* الحلّ المشترك: قوس الانفتاح المطلوب عند الباب، والتدوير للطفل */
    say(...lineOf(tries >= 3 ? 'gen.ang.together.match' : item.q), { free: true });
    const nudge = rulNudges(svg, 250, s => set(ang - s * 15), ['angOpenMore', 'angOpenLess']); /*T*/window.__angMatchWant = item.deg; window.__angBtn = s => { const r = nudge[s < 0 ? 0 : 1].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };/*/T*/
    AUTO({ kind: 'angMatch', ok: () => { set(item.deg); rulDoneBtn().click(); }, wrong: () => { set(item.deg + (item.deg + 30 <= 180 ? 30 : -30)); rulDoneBtn().click(); } });
    await rulDone(() => nudge.forEach(b => b.remove())); return { ans: ang, ctx: { svg, set } }; },
  judge(item, a) { return a === item.deg ? { ok: true } : { ok: false, err: 'angMatchOff' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); }, async hint2() { await S('gen.ang.hint.match'); }, async together() {},
  async reveal(item, r) { r.ctx.set(item.deg); await S('gen.ang.reveal.match'); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};

/* ================= ⑥ ما نوع الزاوية؟ (C133، C134، C135): deg، rot، set ثلاثة أنواع للاختيار، corner: يلمس الطفل الرسم فيوضع ركن الورقة على الضلع الأول ================= */
const ANG_ERR = (want, k) => (want === 'right' || k === 'right') ? 'angRightEye' : (want === 'reflex' || k === 'reflex') ? 'angReflexObtuse' : (want === 'straight' || k === 'straight') ? 'angStraight' : (want === 'full' || k === 'full' || want === 'zero' || k === 'zero') ? 'angFullZero' : 'angAcuteObtuse';
ITEM.angleKind = {
  make(spec) { const want = ANG_KIND(spec.deg); /*T*/if (TESTHOOK && !spec.set.includes(want)) testBug('angleKind: النوع الصحيح ليس بين الخيارات');/*/T*/ return { ...spec, want, tag: 'ang-kind-' + want }; },
  draw(item, svg) { angFrame(svg); const d = item.deg, V = d > 180 ? [190, 120] : d === 180 ? [180, 116] : (item.V || [130, 160]), l = d === 180 ? 88 : 100; return angleAt(svg, V, item.rot || 0, d >= 360 ? 360 : d, { arc: d > 180 && d < 360 ? 'out' : 'in', l1: l, l2: l }); },   /* المستقيمة في وسط الإطار بضلعين أقصر: تبقى فيه بأي دوران */
  async ask(item, mode, tries) { const svg = newStage(232, { oasis: false, ground: 0 }); let A;
    if (item.deg > 180 && item.deg < 360) { A = angleAt((angFrame(svg), svg), [180, 120], item.rot || 0, 360 - item.deg, { arc: 'out', l1: 92, l2: 92 }); }   /* المنعكسة: يُرسم ضلعاها، والقوس على الجهة الكبرى */
    else A = this.draw(item, svg);
    if (item.corner) { const g = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg); el('rect', { x: 26, y: 20, width: 308, height: 192, rx: 10, fill: '#fff', opacity: .01 }, g);
      say(...lineOf(tries >= 3 ? 'gen.ang.together.corner' : item.q), { free: true }); await tapOne([{ g, k: 'c', label: labelText('crsCorner') }], { ok: 'c', pad: 40 }); hush(); g.remove(); paperCornerAt(svg, A.V, A.a1, 64); SFX.tick(); await sleep(tries >= 3 ? 700 : 300); }
    else { if (tries >= 3) { const t = el('text', { x: 180, y: 36, 'text-anchor': 'middle', 'font-size': 15, fill: css('--think') }, helpG(svg)); t.textContent = labelText('angAid.' + (item.deg > 180 ? 'gtHalf' : item.deg === 180 ? 'eqHalf' : item.deg === 90 ? 'eqQ' : item.deg < 90 ? 'ltQ' : 'gtQ')); }   /* الحلّ المشترك: موازنة الزاوية بربع الدورة أو نصفها مكتوبة */
      await S(tries >= 3 ? 'gen.ang.together.kind' : item.q); }
    const k = await choosePick(item.set.map(s => [s, labelText('angK.' + s), '<i></i>', 'gen.ang.k.' + s]), item.want);   /* بلا أيقونة PICKICON (للمستقيمة فيها سهم من م1) */ return { ans: k, ctx: { svg, A } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: ANG_ERR(item.want, k) }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); }, async hint2(item) { await S(item.deg >= 180 ? 'gen.ang.hint.half' : 'gen.ang.hint.quarter'); }, async together() {},
  async reveal(item) { await S('gen.ang.reveal.' + item.want); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};
/* ================= ⑦ في أيّ رسم زاوية حادة (قائمة، منفرجة…)؟ (C134، C135): degs ثلاث، rots، ask النوع؛ والنوع لرسم واحد ================= */
ITEM.angleKindPick = {
  make(spec) { const has = spec.degs.map(d => ANG_KIND(d) === spec.ask), want = has.indexOf(true); /*T*/if (TESTHOOK && has.filter(Boolean).length !== 1) testBug('angleKindPick: النوع ' + spec.ask + ' ليس لرسم واحد');/*/T*/ return { ...spec, want, tag: 'ang-pick-' + spec.ask }; },
  async ask(item, mode, tries) { const svg = newStage(200, { oasis: false, ground: 0 }), G = item.degs.map((d, i) => { const x = LINE_X3[i], g = el('g', { transform: `translate(${x} 100)` }, svg); el('rect', { x: -50, y: -50, width: 100, height: 100, rx: 16, fill: GEO.paper, stroke: css('--line'), 'stroke-width': 2.5 }, g);
      const rx = d > 180 && d < 360, r0 = (item.rots || [])[i] || 0, sw = rx ? 360 - d : d, l = d === 180 ? 40 : 44, xs = [0, Math.cos(r0 * Math.PI / 180) * l, Math.cos((r0 + sw) * Math.PI / 180) * l], ys = [0, -Math.sin(r0 * Math.PI / 180) * l, -Math.sin((r0 + sw) * Math.PI / 180) * l];
      const V = rx ? [0, 0] : [-(Math.min(...xs) + Math.max(...xs)) / 2, -(Math.min(...ys) + Math.max(...ys)) / 2]; angleAt(g, V, r0, sw, { l1: l, arc: rx ? 'out' : 'in', r: 14, w: 3.4 }); return g; });   /* كل رسم في وسط بطاقته بعرضه الحقيقي: ضلع المنفرجة لا يدخل البطاقة المجاورة */
    if (tries >= 3) { const m = helpG(svg); item.degs.forEach((d, i) => { const t = el('text', { x: LINE_X3[i], y: 176, 'text-anchor': 'middle', 'font-size': 12.5, fill: css('--think') }, m); t.textContent = labelText('angAid.' + (d > 180 ? 'gtHalf' : d === 180 ? 'eqHalf' : d === 90 ? 'eqQ' : d < 90 ? 'ltQ' : 'gtQ')); }); }
    say(...lineOf(tries >= 3 ? 'gen.geo.together.pick' : item.q), { free: true });
    const k = await tapOne(G.map((g, i) => ({ g, k: i, label: labelText('angAngle') + ' ' + DG(i + 1) })), { ok: item.want, pad: 100 }); hush(); return { ans: k, ctx: { svg, G } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: ANG_ERR(item.ask, ANG_KIND(item.degs[k])) }; },
  onOk(item, r) { SFX.good(); okRing(r.ctx.svg, r.ctx.G[r.ans], 2); }, onWrong() { SFX.soft(); },
  async hint2(item) { await S(['reflex', 'straight', 'full'].includes(item.ask) ? 'gen.ang.hint.half' : 'gen.ang.hint.quarter'); }, async together() {},
  async reveal(item, r) { okRing(r.ctx.svg, r.ctx.G[item.want], 2); await S('gen.ang.reveal.' + item.ask); },
  praise: () => 'praiseLook', twin(item) { return item.twin || null; },
};
/* ---------- قرص الدرجات: دائرة بأرباعها، وقطاع ملوّن بقدر turns أرباع ---------- */
function discAt(parent, C, r, quarters, o = {}) { const g = el('g', { 'pointer-events': 'none' }, parent), a0 = o.a0 || 0; el('circle', { cx: C[0], cy: C[1], r, fill: '#fffdf6', stroke: css('--line'), 'stroke-width': 3 }, g);
  if (quarters) { const a2 = a0 + quarters * 90; el('path', { d: quarters >= 4 ? angArc(C, r - 4, 0, 0, true) : `M${C[0]} ${C[1]} L${angP(C, a0, r - 4).join(' ')} ${angArc(C, r - 4, a0, a2).replace(/^M[^A]*/, '')} Z`, fill: o.fill || '#bfe3d3', stroke: ANG.arc, 'stroke-width': 2 }, g); }
  for (let i = 0; i < 4; i++) geoLine(g, C[0], C[1], ...angP(C, i * 90, r), { color: '#9fb0bb', w: 1.6, dash: '4 4' }); el('circle', { cx: C[0], cy: C[1], r: 5, fill: ANG.v }, g); return g; }
/* ================= ⑧ كم درجة ربع الدورة (نصفها، ثلاثة أرباعها، الدورة)؟ (C135): turns ================= */
ITEM.turnDeg = { ...numItem,
  make(spec) { const w = spec.turns * 90; return { ...spec, want: w, nums: [w, ...[90, 180, 270, 360].filter(x => x !== w)].slice(0, 3), tag: 'turn-deg' }; },
  async ask(item, mode, tries) { const svg = newStage(220, { oasis: false, ground: 0 }), a0 = item.a0 || 0; discAt(svg, [180, 110], 88, item.turns, { a0 }); let hops = null;   /* a0: بداية القطاع الملوّن */
    if (tries >= 3) { await S('gen.ang.together.deg'); hops = helpG(svg); for (let i = 1; i <= item.turns; i++) { const q = angP([180, 110], a0 + i * 90 - 45, 52), t = el('text', { x: q[0], y: q[1] + 6, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: css('--think'), direction: 'ltr' }, hops); t.textContent = '90'; await S(degw(90), { num: true, noGap: true }); } }   /* الحلّ المشترك: تسعون في كل ربع، والجمع للطفل */
    else await S(item.q);
    const np = numberPick(shuffle(item.nums), item.want, { west: true, word: degw }); return { ans: await np.p, ctx: { svg, np, hops } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'angDegTurn' }; },
  async hint2() { await S('gen.ang.hint.deg'); }, async together() {},
  async reveal(item) { await S('gen.ang.reveal.deg', { noGap: true }); await sayDeg(item.want); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};
/* ================= ⑨ الزاوية deg، فكم المنعكسة المقابلة لها؟ (C135، C138): rot، prot: المنقلة موضوعة على الزاوية الداخلية ================= */
ITEM.reflexOf = { ...numItem,
  make(spec) { const w = 360 - spec.deg, alt = [...new Set([180 + spec.deg, 180 - spec.deg, 270 - spec.deg, spec.deg + 90])].filter(x => x !== w && x > 0 && x < 360); return { ...spec, want: w, nums: [w, ...alt].slice(0, 3), tag: 'reflex-of' }; },
  async ask(item, mode, tries) { const svg = newStage(item.prot ? 250 : 232, { oasis: false, ground: 0 }); angFrame(svg); const V = item.prot ? [180, 196] : [180, 124];
    const PR = item.prot ? protAt(svg, V, 0, { R: 140 }) : null; const A = angleAt(svg, V, item.prot ? 0 : (item.rot || 0), item.deg, { arc: 'both', l1: 104, l2: 104 }); if (PR) PR.top();
    if (!item.prot) { const q = angP(V, A.a1 + item.deg / 2, 48); degText(svg, q[0], q[1] + 6, item.deg, { size: 15, color: ANG.arc }); }   /* الزاوية الداخلية مكتوبة، والمنعكسة بقوسها البنفسجي */
    let aid = null; if (tries >= 3) { await S('gen.ang.together.reflex'); aid = helpG(svg); const t = el('text', { x: 180, y: 34, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: css('--think'), direction: 'ltr' }, aid); t.textContent = '360 − ' + item.deg; } else await S(item.q);
    const np = numberPick(shuffle(item.nums), item.want, { west: true, word: degw }); return { ans: await np.p, ctx: { svg, np, aid } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: k === 180 - item.deg ? 'reflex180' : 'reflexCalc' }; },
  async hint2() { await S('gen.ang.hint.reflex'); }, async together() {},
  async reveal(item) { await S('gen.ang.reveal.rfxCalc', { noGap: true }); await sayDeg(item.want); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};

/* ================= ⑩ اقرأ المنقلة (C137): deg، side r (الضلع الأول إلى اليمين: المقياس الخارجي) أو l (إلى اليسار: الداخلي). الخطأ المقصود قراءة المقياس الآخر ================= */
ITEM.protRead = { ...numItem,
  make(spec) { const w = spec.deg, other = w === 90 ? 60 : 180 - w, near = w < 90 ? (w >= 20 ? w - 15 : w + 15) : (w <= 160 ? w + 15 : w - 15); /*T*/if (TESTHOOK && w % 5) testBug('protRead: قياس ليس من مضاعفات 5: ' + w);/*/T*/ return { ...spec, side: spec.side || 'r', want: w, nums: [w, other, near], tag: 'prot-read' }; },   /* القائمة يقرؤها المقياسان تسعين: مشتّتها غير المقياس الآخر */
  draw(item, svg) { angFrame(svg); const V = [180, 200], P = protAt(svg, V, 0, { R: 142 }), l = item.side === 'l', a1 = l ? 180 : 0, a2 = l ? 180 - item.deg : item.deg; const A = angleAt(svg, V, Math.min(a1, a2), item.deg, { arc: 'in', l1: 150, l2: 150, r: 22 }); P.top(); return { P, A, V, l }; },
  async ask(item, mode, tries) { const svg = newStage(232, { oasis: false, ground: 0 }), D = this.draw(item, svg); let aid = null;
    if (tries >= 3) { await S('gen.ang.together.prot'); aid = helpG(svg); const z = angP(D.V, D.l ? 180 : 0, D.l ? D.P.R - 41 : D.P.R - 23); el('circle', { cx: z[0], cy: z[1], r: 11, fill: 'none', stroke: css('--think'), 'stroke-width': 2.5 }, aid); }   /* الحلّ المشترك: الصفر الذي نبدأ منه محاط على مقياسه نفسه (الخارجي حين الضلع الأول يميناً، والداخلي حين يساراً) */
    else await S(item.q);
    const np = numberPick(shuffle(item.nums), item.want, { west: true, word: degw }); return { ans: await np.p, ctx: { svg, np, D, aid } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: k === 180 - item.deg ? 'protScale' : 'protRead' }; },
  async hint2(item) { await S(item.deg < 90 ? 'gen.ang.hint.protAcute' : item.deg === 90 ? 'gen.ang.hint.protZero' : 'gen.ang.hint.protObtuse'); }, async together() {},
  async reveal(item, r) { r.ctx.D.P.mark(r.ctx.D.l ? 180 - item.deg : item.deg); await S('gen.ang.reveal.prot', { noGap: true }); await sayDeg(item.want); },
  praise: () => 'praiseMeasure', twin(item) { return item.twin || null; },
};
/* ================= ⑪ أين نضع مركز المنقلة؟ (C137): deg، rot، ord ترتيب النقاط الثلاث (0 الرأس، 1 على الضلع، 2 داخل الزاوية) ================= */
ITEM.protPlace = {
  make(spec) { const ord = spec.ord || [0, 1, 2]; return { ...spec, ord, want: ord.indexOf(0), tag: 'prot-place' }; },
  async ask(item, mode, tries) { const svg = newStage(232, { oasis: false, ground: 0 }); angFrame(svg); const V = [150, 170], rot = item.rot || 0, A = angleAt(svg, V, rot, item.deg, { arc: false, l1: 140, l2: 120 });
    const cand = [V, angP(V, rot, 80), angP(V, rot + item.deg / 2, 64)], names = ['a', 'b', 'j'];
    const G = item.ord.map((ci, i) => { const g = el('g', {}, svg); el('circle', { cx: cand[ci][0], cy: cand[ci][1], r: 11, fill: 'none', stroke: css('--compass'), 'stroke-width': 3 }, g); ptAt(g, cand[ci][0], cand[ci][1], names[i], { r: 3, lab: ci === 0 ? [0, 24] : [0, -18] }); return g; });
    if (tries >= 3) el('circle', { cx: V[0], cy: V[1], r: 24, fill: 'none', stroke: css('--think'), 'stroke-width': 2.5, 'stroke-dasharray': '4 3' }, helpG(svg));   /* الحلّ المشترك: النقطة التي يلتقي عندها الضلعان محاطة */
    say(...lineOf(tries >= 3 ? 'gen.ang.together.place' : item.q), { free: true });
    const k = await tapOne(G.map((g, i) => ({ g, k: i, label: labelText('geoPoint') + ' ' + LTR[names[i]] })), { ok: item.want, pad: 60 }); hush(); return { ans: k, ctx: { svg, G, V, rot, cand } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'protCenter' }; },
  async onOk(item, r) { SFX.good(); const p = protAt(r.ctx.svg, r.ctx.V, r.ctx.rot, { R: 120, step: 30 }); p.g.setAttribute('opacity', .8); },
  onWrong() { SFX.soft(); }, async hint2() { await S('gen.ang.hint.place'); }, async together() {},
  async reveal(item, r) { okRing(r.ctx.svg, r.ctx.G[item.want], 6); await S('gen.ang.reveal.place'); },
  praise: () => 'praiseMeasure', twin(item) { return item.twin || null; },
};
/* ================= ⑫ ارسم زاوية قياسها deg (C139، إنتاج): الضلع الأول إلى اليمين والمنقلة عليه، ويدير الطفل الضلع الثاني بالسحب أو بزرّين (5 درجات).
   reflex: deg أكبر من 180، فيرسم الطفل 360 − deg ثم يلمس جهة القوس الكبرى ================= */
ITEM.angleDraw = {
  make(spec) { const rx = spec.deg > 180; return { ...spec, reflex: rx, inner: rx ? 360 - spec.deg : spec.deg, tag: 'ang-draw' + (rx ? '-reflex' : '') }; },
  async ask(item, mode, tries) { const svg = newStage(290, { oasis: false, ground: 0 }); angFrame(svg); const V = [180, 196], PR = protAt(svg, V, 0, { R: 142 }); geoLine(svg, V[0], V[1], V[0] + 150, V[1], { color: ANG.side, w: 4 });
    let a = item.from0 ?? 20, done = false; const g2 = el('g', { 'pointer-events': 'none' }, svg), arc = el('path', { fill: 'none', stroke: ANG.arc, 'stroke-width': 3.2, 'pointer-events': 'none' }, svg); PR.top();
    const set = n => { a = Math.max(5, Math.min(180, Math.round(n / 5) * 5)); g2.innerHTML = ''; const P = angP(V, a, 150); geoLine(g2, V[0], V[1], P[0], P[1], { color: ANG.hand, w: 4.5 }); el('circle', { cx: P[0], cy: P[1], r: 11, fill: css('--compass'), stroke: '#fff', 'stroke-width': 3 }, g2); arc.setAttribute('d', angArc(V, 24, 0, a)); /*T*/window.__angDraw = a;/*/T*/ }; set(a);
    el('circle', { cx: V[0], cy: V[1], r: 6, fill: ANG.v, stroke: '#fff', 'stroke-width': 2 }, svg);
    degText(svg, 158, 262, item.deg, { size: 20 }); { const t = el('text', { x: 214, y: 262, 'text-anchor': 'middle', 'font-size': 15, fill: GEO.ink, 'pointer-events': 'none' }, svg); t.textContent = labelText('angWant'); }   /* القياس المطلوب مكتوب بجانب كلمته، فلا يُظنّ أنه قراءة الضلع الآن */
    if (tries >= 3) { const m = helpG(svg), P = angP(V, item.inner, 142), Q = angP(V, item.inner, 100); geoLine(m, P[0], P[1], Q[0], Q[1], { color: css('--think'), w: 4 }); if (item.reflex) { const t = el('text', { x: 180, y: 34, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: css('--think'), direction: 'ltr' }, m); t.textContent = '360 − ' + item.deg + ' = ' + item.inner; } }   /* الحلّ المشترك: علامة القياس على المنقلة، والتدوير للطفل */
    const askQ = async () => { await S(tries >= 3 ? 'gen.ang.together.draw' : (item.q || 'gen.ang.drawQ'), { noGap: true }); await sayDeg(item.deg); }; askQ(); REPLAY_HOOK = () => askQ(); REPLAY_HOOK.live = () => !done && svg.isConnected;
    const input = fingerInput(svg, { map: e => { const q = svgPoint(svg, e); return [q.x, q.y]; }, down(q) { if (q[1] > V[1] + 14 || Math.hypot(q[0] - V[0], q[1] - V[1]) < 40) return false; set(Math.atan2(V[1] - q[1], q[0] - V[0]) * 180 / Math.PI); }, move(q) { set(Math.atan2(V[1] - q[1], q[0] - V[0]) * 180 / Math.PI); }, up() {} });
    /*T*/window.__angDrawWant = item.inner; window.__angDrawAt = n => { const m = svg.getScreenCTM(), P = angP(V, n, 120); return { x: m.a * P[0] + m.e, y: m.d * P[1] + m.f }; };/*/T*/
    const nudge = rulNudges(svg, 254, s => set(a - s * 5), ['angOpenMore', 'angOpenLess']); AUTO({ kind: 'angDraw', ok: () => { set(item.inner); rulDoneBtn().click(); }, wrong: () => { set(180 - item.inner === item.inner ? item.inner + 20 : 180 - item.inner); rulDoneBtn().click(); } });
    await rulDone(() => { done = true; REPLAY_HOOK = null; input.off(); nudge.forEach(b => b.remove()); });
    let side = 'in'; if (item.reflex && a === item.inner) {   /* المنعكسة: بعد الضلعين يلمس الطفل الجهة التي يُرسم عليها القوس */
      const gi = el('g', {}, svg), go = el('g', {}, svg); el('path', { d: angArc(V, 50, 0, a), fill: 'none', stroke: ANG.arc, 'stroke-width': 10, opacity: .55 }, gi); el('path', { d: angArc(V, 50, a, 360), fill: 'none', stroke: ANG.rx, 'stroke-width': 10, opacity: .55 }, go);
      await S('gen.ang.drawSide'); side = await tapOne([{ g: gi, k: 'in', label: labelText('angArcIn') }, { g: go, k: 'out', label: labelText('angArcOut') }], { ok: 'out', pad: 24, kind: 'angSide' }); hush(); gi.remove(); go.remove(); }
    return { ans: { a, side }, ctx: { svg, set, V } }; },
  judge(item, r) { if (r.a !== item.inner) return { ok: false, err: r.a === 180 - item.inner ? 'protScale' : 'angDrawOff' }; return !item.reflex || r.side === 'out' ? { ok: true } : { ok: false, err: 'angDrawSide' }; },
  onOk(item, r) { SFX.good(); if (item.reflex) el('path', { d: angArc(r.ctx.V, 34, item.inner, 360), fill: 'none', stroke: ANG.rx, 'stroke-width': 3.2 }, r.ctx.svg); }, onWrong() { SFX.soft(); },
  async hint2(item) { await S(item.reflex ? 'gen.ang.hint.drawReflex' : item.deg < 90 ? 'gen.ang.hint.protAcute' : item.deg === 90 ? 'gen.ang.hint.protZero' : 'gen.ang.hint.protObtuse'); }, async together() {},
  async reveal(item, r) { const a = r.ans.a; await symTween(700, t => r.ctx.set(a + (item.inner - a) * t)); r.ctx.set(item.inner); if (item.reflex) el('path', { d: angArc(r.ctx.V, 34, item.inner, 360), fill: 'none', stroke: ANG.rx, 'stroke-width': 3.2 }, r.ctx.svg); await S('gen.ang.reveal.draw', { noGap: true }); await sayDeg(item.deg); },
  praise: () => 'praiseMeasure', twin(item) { return item.twin || null; },
};
/* ================= ⑬ قدّر قبل أن تقيس (C140): deg، rot، est ثلاثة تقديرات؛ الجواب أقربها، ثم تظهر المنقلة بالقياس ================= */
ITEM.angleEstimate = { ...numItem,
  make(spec) { const best = spec.est.reduce((b, x) => Math.abs(x - spec.deg) < Math.abs(b - spec.deg) ? x : b); /*T*/if (TESTHOOK && spec.est.filter(x => Math.abs(x - spec.deg) === Math.abs(best - spec.deg)).length > 1) testBug('angleEstimate: تقديران بالبعد نفسه');/*/T*/ return { ...spec, want: best, nums: spec.est, tag: 'ang-est' }; },
  async ask(item, mode, tries) { const svg = newStage(232, { oasis: false, ground: 0 }); angFrame(svg); const V = [180, 196], A = angleAt(svg, V, 0, item.deg, { l1: 130, l2: 130 }); let aid = null;
    if (tries >= 3) { await S('gen.ang.together.est'); aid = helpG(svg); for (const t of [45, 90, 135]) { const P = angP(V, t, 120); geoLine(aid, V[0], V[1], P[0], P[1], { color: css('--think'), w: 1.6, dash: '5 4' }); const q = angP(V, t, 134), x = el('text', { x: q[0], y: q[1] + 4, 'text-anchor': 'middle', 'font-size': 12, fill: css('--think'), direction: 'ltr' }, aid); x.textContent = String(t); } }   /* الحلّ المشترك: خطوط مرجعية عند 45 و90 و135 */
    else await S(item.q);
    const np = numberPick(shuffle(item.nums), item.want, { west: true, word: degw }); return { ans: await np.p, ctx: { svg, np, V, aid } }; },   /* مخلوطة: الأقرب ليس في الوسط دائماً (الفحص المستقل (3)) */
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'angEstimate' }; },
  show(item, r) { const p = protAt(r.ctx.svg, r.ctx.V, 0, { R: 142 }); r.ctx.svg.insertBefore(p.g, r.ctx.svg.children[1]); p.mark(item.deg); },
  onOk(item, r) { SFX.good(); this.show(item, r); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.ang.hint.est'); }, async together() {},
  async reveal(item, r) { this.show(item, r); await S('gen.ang.reveal.est', { noGap: true }); await sayDeg(item.deg); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};

/* ---------- وردة الاتجاهات: الشمال إلى الأعلى. dirs: n e s w، والأذرع أهداف لمس ---------- */
const CMP = ['n', 'e', 's', 'w'], CMP_A = { n: 90, e: 0, s: 270, w: 180 };
function roseAt(parent, C, R = 84, o = {}) { const g = el('g', {}, parent), arms = {};
  el('circle', { cx: C[0], cy: C[1], r: R + 8, fill: '#fffdf6', stroke: css('--line'), 'stroke-width': 2.5 }, g);
  for (const d of CMP) { const a = CMP_A[d], P = angP(C, a, R), L = angP(C, a + 90, 14), Rr = angP(C, a - 90, 14), arm = el('g', { 'data-dir': d }, g); el('path', { d: `M${C[0]} ${C[1]} L${L[0]} ${L[1]} L${P[0]} ${P[1]} L${Rr[0]} ${Rr[1]} Z`, fill: d === 'n' ? '#c8392d' : '#5b6770', stroke: '#fff', 'stroke-width': 1.5 }, arm);
    const q = angP(C, a, R + 22), t = el('text', { x: q[0], y: q[1] + 6, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: GEO.ink, 'pointer-events': 'none' }, arm); t.textContent = labelText('cmp.' + d); if (o.hide && o.hide.includes(d)) t.textContent = '؟'; arms[d] = arm; }
  el('circle', { cx: C[0], cy: C[1], r: 6, fill: '#fff', stroke: GEO.ink, 'stroke-width': 2 }, g); return { g, arms }; }
/* السهم الذي يقف عليه الطفل (اتجاه نظره) */
function faceArrow(parent, C, d, col = css('--compass')) { const a = CMP_A[d], g = el('g', { 'pointer-events': 'none' }, parent), P = angP(C, a, 50); geoLine(g, C[0], C[1], P[0], P[1], { color: col, w: 6 }); geoArrow(g, P[0], P[1], -a, col, 14);   /* geoArrow بزاوية الشاشة (y إلى الأسفل) */ return g; }
const cmpTurn = (d, q, cw) => CMP[(CMP.indexOf(d) + (cw ? q : 4 - q)) % 4];
/* ================= ⑭ المس الاتجاه (C191): want، hide اتجاهات بلا اسم (يُستدلّ بالترتيب) ================= */
ITEM.compassFind = {
  make(spec) { return { ...spec, tag: 'cmp-find' }; },
  async ask(item, mode, tries) { const svg = newStage(250, { oasis: false, ground: 0 }), C = [180, 128], Rs = roseAt(svg, C, 80, { hide: item.hide || [] });
    if (tries >= 3) { const m = helpG(svg); el('path', { d: angArc(C, 104, 180, 90), fill: 'none', stroke: css('--think'), 'stroke-width': 3, 'stroke-dasharray': '6 5' }, m); geoArrow(m, ...angP(C, 0, 104), 90, css('--think'), 10); }   /* الحلّ المشترك: قوس مع عقارب الساعة من الشمال: شمال، شرق، جنوب، غرب */
    say(...lineOf(tries >= 3 ? 'gen.cmp.together.find' : item.q), { free: true });
    const k = await tapOne(CMP.map(d => ({ g: Rs.arms[d], k: d, label: labelText('cmpArm') + ' ' + DG(CMP.indexOf(d) + 1) })), { ok: item.want, pad: 30 }); hush(); return { ans: k, ctx: { svg, Rs } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'compassDir' }; },
  onOk(item, r) { SFX.good(); okRing(r.ctx.svg, r.ctx.Rs.arms[r.ans], 4); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.cmp.hint.find'); }, async together() {},
  async reveal(item, r) { okRing(r.ctx.svg, r.ctx.Rs.arms[item.want], 4); await S('gen.cmp.reveal.' + item.want); },
  praise: () => 'praiseLook', twin(item) { return item.twin || null; },
};
/* ================= ⑮ تنظر إلى face والتفتّ q أرباع دورة (cw مع عقارب الساعة)، فإلى أين تنظر؟ (C191): يلمس الطفل الذراع ================= */
ITEM.compassTurn = {
  make(spec) { const cw = spec.cw !== false; return { ...spec, cw, want: cmpTurn(spec.face, spec.turns, cw), tag: 'cmp-turn' }; },
  async ask(item, mode, tries) { const svg = newStage(250, { oasis: false, ground: 0 }), C = [180, 128], Rs = roseAt(svg, C, 80); faceArrow(svg, C, item.face);
    if (tries >= 3) { const m = helpG(svg), a0 = CMP_A[item.face], a1 = a0 + (item.cw ? -90 : 90) * item.turns; el('path', { d: item.cw ? angArc(C, 104, a1, a0) : angArc(C, 104, a0, a1), fill: 'none', stroke: css('--think'), 'stroke-width': 4 }, m); geoArrow(m, ...angP(C, a1, 104), -(a1 + (item.cw ? -90 : 90)), css('--think'), 11); }   /* الحلّ المشترك: قوس الالتفات مرسوم */
    say(...lineOf(tries >= 3 ? 'gen.cmp.together.turn' : item.q), { free: true });
    const k = await tapOne(CMP.map(d => ({ g: Rs.arms[d], k: d, label: labelText('cmp.' + d) })), { ok: item.want, pad: 30 }); hush(); return { ans: k, ctx: { svg, Rs, C } }; },
  judge(item, k) { if (k === item.want) return { ok: true }; return { ok: false, err: k === cmpTurn(item.face, item.turns, !item.cw) ? 'compassCw' : 'compassDir' }; },
  onOk(item, r) { SFX.good(); faceArrow(r.ctx.svg, r.ctx.C, r.ans, ANG.arc); }, onWrong() { SFX.soft(); },
  async hint2(item) { await S(item.cw ? 'gen.cmp.hint.cw' : 'gen.cmp.hint.ccw'); }, async together() {},
  async reveal(item, r) { faceArrow(r.ctx.svg, r.ctx.C, item.want, ANG.arc); await S('gen.cmp.reveal.' + item.want); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};

/* ---------- مشاهد S2-U3 ---------- */
const angHot = (svg, H = 192) => { const g = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg); el('rect', { x: 26, y: 20, width: 308, height: H, rx: 10, fill: '#fff', opacity: .01 }, g); return g; };
/* الباب ينفتح: يلمسه الطفل فيزيد انفتاحه ثلاث مرات. c.steps، lines: [الدعوة، ختام] */
SCENES.doorHook = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), [l1, l2] = c.lines, V = [180, 200]; el('rect', { x: 20, y: 14, width: 320, height: 204, rx: 14, fill: '#efe6d6', stroke: css('--line'), 'stroke-width': 2 }, svg); geoLine(svg, 30, V[1], 330, V[1], { color: '#8a6a4a', w: 6 });
  const door = el('g', { 'pointer-events': 'none' }, svg), arc = el('path', { fill: 'none', stroke: ANG.arc, 'stroke-width': 3.5 }, svg), set = a => { door.innerHTML = ''; const P = angP(V, a, 130); geoLine(door, V[0], V[1], P[0], P[1], { color: '#b0552f', w: 12 }); arc.setAttribute('d', a > 1 ? angArc(V, 46, 0, a) : ''); }; set(2); el('circle', { cx: V[0], cy: V[1], r: 7, fill: ANG.v }, svg);
  const hot = angHot(svg); S(l1, { free: true }); let a = 2; for (const b of c.steps || [25, 55, 95]) { await tapOne([{ g: hot, k: b, label: labelText('angDoor') }], { ok: b, pad: 20 }); if (a === 2) hush(); const a0 = a; await symTween(600, t => set(a0 + (b - a0) * t)); a = b; SFX.tick(); }
  hot.remove(); logAttempt({ scene: c.s || 'hook', tag: 'doorHook', ok: true }); await S(l2); };
/* العودان والمشبك: يلمس الطفل فيُفتح العودان ويُغلقان، ثم تُسمّى الأجزاء. lines: [الدعوة، الرأس، الضلعان، الانفتاح] */
SCENES.sticksAngle = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), [l1, l2, l3, l4] = c.lines, V = [110, 170]; angFrame(svg); const g = el('g', { 'pointer-events': 'none' }, svg);
  const draw = a => { g.innerHTML = ''; for (const [b, col] of [[0, '#c9a46a'], [a, '#b88a4a']]) { const P = angP(V, b, 170); geoLine(g, V[0], V[1], P[0], P[1], { color: col, w: 12 }); } el('circle', { cx: V[0], cy: V[1], r: 10, fill: '#7a8a96', stroke: '#fff', 'stroke-width': 2 }, g); };
  draw(20); const hot = angHot(svg); await answerWhile(l1, () => tapOne([{ g: hot, k: 1, label: labelText('angSticks') }], { ok: 1, pad: 20 })); await symTween(900, t => draw(20 + 70 * Math.sin(t * Math.PI))); await symTween(600, t => draw(20 + 40 * t)); hot.remove();
  const A = angleAt(svg, V, 0, 60, { l1: 170, l2: 170, arc: false, w: 2 }); A.g.setAttribute('opacity', .01); el('circle', { cx: V[0], cy: V[1], r: 18, fill: 'none', stroke: ANG.v, 'stroke-width': 3 }, svg); SFX.pop(); await S(l2);
  for (const b of [0, 60]) { const q = angP(V, b, 120); geoArrow(svg, q[0], q[1], -b, css('--compass'), 12); } await S(l3); el('path', { d: angArc(V, 50, 0, 60), fill: 'none', stroke: ANG.arc, 'stroke-width': 4 }, svg); SFX.good(); logAttempt({ scene: c.s || 'explore', tag: 'sticksAngle', ok: true }); await S(l4); };
/* الزاوية دوران: يدور ضلع حول الرأس ربعاً ثم نصفاً ثم دورة كاملة، بلمسة لكل منها. lines: [الدعوة، بعد الربع، بعد النصف، بعد الدورة] */
SCENES.turnShow = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), [l1, l2, l3, l4] = c.lines, V = [180, 120]; angFrame(svg); geoLine(svg, V[0], V[1], V[0] + 90, V[1], { color: ANG.side, w: 5 }); const H = angHandAt(svg, V, 84); H.set(0); const arc = el('path', { fill: 'none', stroke: ANG.arc, 'stroke-width': 4, 'pointer-events': 'none' }, svg), hot = angHot(svg);
  S(l1, { free: true }); let a = 0; for (const [b, ln] of [[90, l2], [180, l3], [360, l4]]) { await tapOne([{ g: hot, k: b, label: labelText('angTurnHand') }], { ok: b, pad: 20 }); if (!a) hush(); const a0 = a; await symTween(450 * (b - a0) / 90, t => { const x = a0 + (b - a0) * t; H.set(x); arc.setAttribute('d', x >= 359.5 ? angArc(V, 36, 0, 0, true) : angArc(V, 36, 0, x)); }); a = b; SFX.tick(); await S(ln); }
  hot.remove(); logAttempt({ scene: c.s || 'explore', tag: 'turnShow', ok: true }); };
/* التسمية: زاوية بحروفها؛ يلمس الطفل الرأس فيُنطق الاسم مرتين (الحرف الأوسط هو الرأس). c.nm، lines: [الدعوة، ختام] */
SCENES.nameShow = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), [l1, l2] = c.lines, nm = c.nm || ['a', 'b', 'j']; angFrame(svg); const A = angleAt(svg, [170, 150], 15, 55, { names: nm });
  await answerWhile(l1, () => tapOne([{ g: A.vtx, k: 'v', label: labelText('angVertex') }], { ok: 'v', pad: 40, pulse: true })); el('circle', { cx: A.V[0], cy: A.V[1], r: 22, fill: 'none', stroke: ANG.v, 'stroke-width': 3 }, svg); SFX.pop();
  await S('gen.ang.nm.' + nm.join('')); await S('gen.ang.nm.' + [...nm].reverse().join('')); logAttempt({ scene: c.s || 'explore', tag: 'nameShow', ok: true }); await S(l2);
  if (c.lines[2]) { const cap = symCaption(svg, 260, 204, ['ang', nm.join('')], { size: 26 }); anim(cap, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, fill: 'both' }); SFX.tick(); await S(c.lines[2]); } };   /* رمز الزاوية ∠ مرسوماً قبل الأحرف (ليس في خط القراءة) */
/* ركن الورقة مرجعاً: ثلاث زوايا، يلمس الطفل كلاً منها فيوضع عليها ركن الورقة ويُنطق نوعها. c.degs، lines: [الدعوة، ختام] */
SCENES.cornerCompare = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), [l1, l2] = c.lines, degs = c.degs || [50, 90, 130]; angFrame(svg); const X = [255, 160, 72]; S(l1, { free: true });
  for (const [i, d] of degs.entries()) { const g = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg), V = [X[i], 190]; el('rect', { x: V[0] - 26, y: 40, width: 100, height: 160, fill: '#fff', opacity: .01 }, g); angleAt(g, V, 0, d, { l1: 70, l2: 70, r: 18 });
    await tapOne([{ g, k: i, label: labelText('angAngle') + ' ' + DG(i + 1) }], { ok: i, pad: 20, pulse: true }); if (!i) hush(); paperCornerAt(svg, V, 0, 46).setAttribute('opacity', .85); SFX.tick(); await S('gen.ang.k.' + ANG_KIND(d)); }
  logAttempt({ scene: c.s || 'explore', tag: 'cornerCompare', ok: true }); await S(l2); };
/* الباب حتى الخط المستقيم: يلمس الطفل فينفتح الباب حتى يصير مع الجدار خطاً واحداً. lines: [الدعوة، ختام] */
SCENES.doorStraight = async c => { await SCENES.doorHook({ s: c.s, steps: [45, 90, 180], lines: c.lines }); };
/* قرص الدرجات: الدورة 360 جزءاً صغيراً، يلمس الطفل فيُلوَّن ربع ثم نصف ثم الكل وتُنطق درجاتها. lines: [الدعوة، ختام] */
SCENES.degreeDisc = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), [l1, l2] = c.lines, C = [180, 116]; angFrame(svg); let d = discAt(svg, C, 92, 0); for (let t = 0; t < 360; t += 10) { const P = angP(C, t, 92), Q = angP(C, t, t % 90 ? 86 : 78); geoLine(svg, P[0], P[1], Q[0], Q[1], { color: GEO.ink, w: t % 90 ? 1 : 2.4 }); }
  const hot = angHot(svg); S(l1, { free: true });
  for (const q of [1, 2, 4]) { await tapOne([{ g: hot, k: q, label: labelText('angDisc') }], { ok: q, pad: 20 }); if (q === 1) hush(); const nd = discAt(svg, C, 92, q); svg.insertBefore(nd, d); d.remove(); d = nd; SFX.tick(); await S('gen.ang.turn.' + q, { noGap: true }); await sayDeg(q * 90); }
  hot.remove(); logAttempt({ scene: c.s || 'explore', tag: 'degreeDisc', ok: true }); await S(l2); };
/* العقربان: عقرب لم يتحرّك، وعقرب دار دورة كاملة وعاد؛ الشكل واحد والدوران مختلف (الصفرية للفضول). lines: [الدعوة، بعد الأول، بعد الثاني، ختام] */
SCENES.clockTwins = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), [l1, l2, l3, l4] = c.lines; angFrame(svg); const Cs = [[262, 118], [98, 118]], H = Cs.map(C => { el('circle', { cx: C[0], cy: C[1], r: 66, fill: '#fffdf6', stroke: css('--line'), 'stroke-width': 3 }, svg); const h = angHandAt(svg, C, 54); h.set(90); return h; });
  const trail = el('path', { fill: 'none', stroke: ANG.arc, 'stroke-width': 4, 'pointer-events': 'none' }, svg), hot = angHot(svg); S(l1, { free: true });
  await tapOne([{ g: hot, k: 1, label: labelText('angClock') }], { ok: 1, pad: 20 }); hush(); await sleep(900); SFX.tick(); await S(l2);
  await tapOne([{ g: hot, k: 2, label: labelText('angClock') }], { ok: 2, pad: 20 }); await symTween(2200, t => { const a = 90 - 360 * t; H[1].set(a); trail.setAttribute('d', t >= .999 ? angArc(Cs[1], 30, 0, 0, true) : angArc(Cs[1], 30, a, 90)); }); SFX.tick(); await S(l3);
  hot.remove(); logAttempt({ scene: c.s || 'explore', tag: 'clockTwins', ok: true }); await S(l4); };
/* الكعكة: قرص تُقطع منه شريحة؛ الشريحة حادة، والباقي منعكسة، ومجموعهما الدورة. c.deg، lines: [الدعوة، الشريحة، الباقي، ختام] */
SCENES.cakeSlice = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), [l1, l2, l3, l4] = c.lines, C = [180, 118], R = 90, d = c.deg || 60; angFrame(svg); el('circle', { cx: C[0], cy: C[1], r: R, fill: '#f2c98a', stroke: '#b9853d', 'stroke-width': 3 }, svg);
  const hot = angHot(svg); await answerWhile(l1, () => tapOne([{ g: hot, k: 1, label: labelText('angCake') }], { ok: 1, pad: 20 })); hot.remove();
  const sl = el('path', { d: `M${C[0]} ${C[1]} L${angP(C, 0, R).join(' ')} ${angArc(C, R, 0, d).replace(/^M[^A]*/, '')} Z`, fill: '#e8a94f', stroke: '#fff', 'stroke-width': 3 }, svg); await symTween(700, t => sl.setAttribute('transform', `translate(${angU(d / 2)[0] * 26 * t} ${angU(d / 2)[1] * 26 * t})`)); SFX.pop();
  el('path', { d: angArc(C, 30, 0, d), fill: 'none', stroke: ANG.arc, 'stroke-width': 4, transform: `translate(${angU(d / 2)[0] * 26} ${angU(d / 2)[1] * 26})` }, svg); await S(l2); el('path', { d: angArc(C, 40, d, 360), fill: 'none', stroke: ANG.rx, 'stroke-width': 4 }, svg); SFX.tick(); await S(l3);
  logAttempt({ scene: c.s || 'explore', tag: 'cakeSlice', ok: true }); await S(l4); };
/* أجزاء المنقلة: يلمس الطفل المركز ثم خط الأساس ثم المقياسين. lines: [المركز، الأساس، المقياس الخارجي، الداخلي، ختام] */
SCENES.protIntro = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), L = c.lines, V = [180, 200]; angFrame(svg); protAt(svg, V, 0, { R: 142 });
  const spot = (x, y, r, k, lab) => { const g = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg); el('circle', { cx: x, cy: y, r, fill: css('--compass'), opacity: .18, stroke: css('--compass'), 'stroke-width': 2.5 }, g); return { g, k, label: labelText(lab) }; };
  for (const [t, ln, mk] of [[spot(V[0], V[1], 18, 'c', 'protCenter'), L[0], () => el('circle', { cx: V[0], cy: V[1], r: 16, fill: 'none', stroke: ANG.v, 'stroke-width': 3 }, svg)], [spot(260, 200, 16, 'b', 'protBase'), L[1], () => geoLine(svg, 40, 200, 320, 200, { color: ANG.v, w: 3 })],
    [spot(...angP(V, 60, 119), 16, 'o', 'protOuter'), L[2], () => el('path', { d: angArc(V, 119, 0, 180), fill: 'none', stroke: css('--compass'), 'stroke-width': 3 }, svg)], [spot(...angP(V, 120, 101), 16, 'i', 'protInner'), L[3], () => el('path', { d: angArc(V, 101, 0, 180), fill: 'none', stroke: css('--think'), 'stroke-width': 3 }, svg)]]) {
    await answerWhile(ln, () => tapOne([t], { ok: t.k, pad: 30, pulse: true })); t.g.remove(); mk(); SFX.tick(); }
  logAttempt({ scene: c.s || 'explore', tag: 'protIntro', ok: true }); await S(L[4]); };
/* بطاقة القياس: الخطوات الأربع على زاوية، كل لمسة خطوة. c.deg، lines: [المركز، الأساس، القراءة، التحقق] */
SCENES.protSteps = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), L = c.lines, V = [180, 200], d = c.deg || 120; angFrame(svg); const A = angleAt(svg, V, 0, d, { l1: 150, l2: 150, r: 22 }), hot = angHot(svg); let P = null;
  await answerWhile(L[0], () => tapOne([{ g: hot, k: 1, label: labelText('protCenter') }], { ok: 1, pad: 20 })); P = protAt(svg, [V[0] - 120, V[1] - 90], 0, { R: 142 }); await symTween(800, t => P.g.setAttribute('transform', `translate(${120 * t} ${90 * t})`)); svg.insertBefore(P.g, A.g); SFX.tick();
  await answerWhile(L[1], () => tapOne([{ g: hot, k: 2, label: labelText('protBase') }], { ok: 2, pad: 20 })); geoLine(svg, V[0], V[1], V[0] + 150, V[1], { color: ANG.v, w: 3 }); SFX.tick();
  await answerWhile(L[2], () => tapOne([{ g: hot, k: 3, label: labelText('protOuter') }], { ok: 3, pad: 20 })); P.mark(d); SFX.tick(); await sayDeg(d, { append: false });
  hot.remove(); logAttempt({ scene: c.s || 'explore', tag: 'protSteps', ok: true }); await S(L[3]); };
/* الرسم بقياس معلوم: الضلع الأول، والمنقلة، والعلامة، والوصل. c.deg (والمنعكسة أكبر من 180)، lines: [الدعوة، ختام] */
SCENES.angDrawShow = async c => { const it = ITEM.angleDraw.make({ deg: c.deg, q: c.lines[0] }); let n = 0;
  while (true) { const r = await ITEM.angleDraw.ask(it, 'explore', n >= 2 ? 3 : 0), ok = ITEM.angleDraw.judge(it, r.ans).ok; logAttempt({ scene: c.s || 'explore', tag: 'angDrawShow', ok, firstTry: n === 0 }); n++; if (ok) { ITEM.angleDraw.onOk(it, r); break; } SFX.soft(); await S('gen.ang.again'); }
  await S(c.lines[1]); };
/* قدّر ثم قِس: زاوية، يختار الطفل تقديره، ثم توضع المنقلة ويُقرأ القياس ويُقارن. c.deg، est، lines: [الدعوة، بعد القياس] */
SCENES.estimateShow = async c => { const it = ITEM.angleEstimate.make({ deg: c.deg, est: c.est, q: c.lines[0] }), r = await ITEM.angleEstimate.ask(it, 'explore', 0); ITEM.angleEstimate.show(it, r); SFX.tick();
  await S('gen.ang.reveal.est', { noGap: true }); await sayDeg(c.deg); logAttempt({ scene: c.s || 'explore', tag: 'estimateShow', ok: true }); await S(c.lines[1]); };
/* الاتجاهات الأربعة: الشمس تشرق، ثم يلمس الطفل الأذرع بترتيب عقارب الساعة. lines: [الشمس، الدعوة، ختام] */
SCENES.compassIntro = async c => { const svg = newStage(250, { oasis: false, ground: 0 }), [l1, l2, l3] = c.lines, C = [180, 128], Rs = roseAt(svg, C, 80); const sun = el('g', {}, svg); el('circle', { cx: 340, cy: 128, r: 13, fill: '#f6c443' }, sun); for (let i = 0; i < 8; i++) { const a = i * 45, P = angP([340, 128], a, 18), Q = angP([340, 128], a, 24); geoLine(sun, P[0], P[1], Q[0], Q[1], { color: '#f6c443', w: 2.4 }); }
  await S(l1); S(l2, { free: true }); for (const [i, d] of CMP.entries()) { await tapOne([{ g: Rs.arms[d], k: d, label: labelText('cmp.' + d) }], { ok: d, pad: 30, pulse: true }); if (!i) hush(); okRing(svg, Rs.arms[d], 2); SFX.tick(); await S('gen.cmp.' + d); }
  logAttempt({ scene: c.s || 'explore', tag: 'compassIntro', ok: true }); await S(l3); };
/* الالتفات زاوية: تنظر إلى الشمال، وكل لمسة ربع دورة مع عقارب الساعة. lines: [الدعوة، ختام] */
SCENES.compassTurns = async c => { const svg = newStage(250, { oasis: false, ground: 0 }), [l1, l2] = c.lines, C = [180, 128]; roseAt(svg, C, 80); let f = faceArrow(svg, C, 'n'); const arc = el('path', { fill: 'none', stroke: css('--think'), 'stroke-width': 4, 'pointer-events': 'none' }, svg), hot = angHot(svg, 210);
  S(l1, { free: true }); for (let q = 1; q <= 4; q++) { await tapOne([{ g: hot, k: q, label: labelText('cmpTurn') }], { ok: q, pad: 20 }); if (q === 1) hush(); f.remove(); const d = CMP[q % 4]; f = faceArrow(svg, C, d); arc.setAttribute('d', q === 4 ? angArc(C, 104, 0, 0, true) : angArc(C, 104, 90 - q * 90, 90)); SFX.tick(); await S('gen.ang.turn.' + q, { noGap: true }); await sayDeg(q * 90); }
  hot.remove(); logAttempt({ scene: c.s || 'explore', tag: 'compassTurns', ok: true }); await S(l2); };
/* مدينة الزوايا (مشروع د7): صورة فيها سطح وسلّم ومقصّ وساعة؛ يختار الطفل ثلاثة منها، ولكلٍّ يقيس الزاوية ثم يصنّفها. lines: [المقدمة، دعوة الاختيار، بعد كل زاوية، ختام] */
const CITY_ANG = { roof: { deg: 110, side: 'l' }, ladder: { deg: 70, side: 'r' }, scissors: { deg: 40, side: 'r' }, clock: { deg: 90, side: 'r' }, slide: { deg: 140, side: 'l' } };
SCENES.angleCity = async c => { const L = c.lines, chosen = [], picAt = (g, k, x, y) => { const p = el('g', { transform: `translate(${x} ${y})` }, g);
    if (k === 'roof') { el('rect', { x: -26, y: -4, width: 52, height: 34, fill: '#e0c9a6' }, p); el('path', { d: 'M-34 -4 L0 -27.8 L34 -4 Z', fill: '#b0552f' }, p); }   /* رأس السطح 110 درجة */
    else if (k === 'ladder') { geoLine(p, -36, 30, 36, 30, { color: '#6a7f8c', w: 3 }); for (const o of [0, 20]) geoLine(p, -18 + o, 30, 5 + o, -33, { color: '#8a6a4a', w: 5 }); for (let i = 1; i <= 4; i++) { const t = i / 5; geoLine(p, -18 + 23 * t, 30 - 63 * t, 2 + 23 * t, 30 - 63 * t, { color: '#8a6a4a', w: 3 }); } }   /* السلّم على الأرض بزاوية 70 درجة */
    else if (k === 'scissors') { geoLine(p, -24.2, 10.3, 21, -6.2, { color: '#5b6770', w: 5 }); geoLine(p, -24.2, -10.3, 21, 6.2, { color: '#5b6770', w: 5 }); el('circle', { cx: -30, cy: 13, r: 8, fill: 'none', stroke: '#c8392d', 'stroke-width': 4 }, p); el('circle', { cx: -30, cy: -13, r: 8, fill: 'none', stroke: '#c8392d', 'stroke-width': 4 }, p); }   /* شفرتان بينهما 40 درجة */
    else if (k === 'clock') { el('circle', { r: 30, fill: '#fffdf6', stroke: GEO.ink, 'stroke-width': 3 }, p); geoLine(p, 0, 0, 0, -22, { color: GEO.ink, w: 4 }); geoLine(p, 0, 0, 18, 0, { color: GEO.ink, w: 4 }); }
    else { geoLine(p, -32, 19.6, 20, -24, { color: '#3d7cc0', w: 6 }); geoLine(p, 20, -24, 32, -24, { color: '#3d7cc0', w: 6 }); geoLine(p, 32, -24, 32, 30, { color: '#8a6a4a', w: 4 }); }   /* الزحليقة والمنصّة 140 درجة */
    return p; };
  const city = () => { const svg = newStage(250, { oasis: false, ground: 0 }); el('rect', { x: 14, y: 10, width: 332, height: 230, rx: 14, fill: '#e3ecd9', stroke: css('--line'), 'stroke-width': 2 }, svg); const G = {}; [['roof', 290, 70], ['ladder', 180, 70], ['scissors', 70, 70], ['clock', 290, 180], ['slide', 120, 180]].forEach(([k, x, y]) => { G[k] = picAt(svg, k, x, y); if (chosen.includes(k)) G[k].setAttribute('opacity', .35); }); return { svg, G }; };
  { city(); await S(L[0]); }
  for (let i = 0; i < 3; i++) { const { G } = city(), left = Object.keys(CITY_ANG).filter(k => !chosen.includes(k)); S(L[1], { free: true });
    const k = await tapOne(left.map(x => ({ g: G[x], k: x, label: labelText('angCity.' + x) })), { ok: left, pad: 30, pulse: false }); hush(); chosen.push(k); SFX.tick();
    for (const [def, spec, tag] of [[ITEM.protRead, { ...CITY_ANG[k], q: 'gen.ang.cityMeasure' }, 'cityMeasure'], [ITEM.angleKind, { deg: CITY_ANG[k].deg, set: ['acute', 'right', 'obtuse'], q: 'gen.ang.cityKind' }, 'cityKind']]) { const it = def.make(spec); let n = 0;
      while (true) { const r = await def.ask(it, 'explore', n >= 2 ? 3 : 0), ok = def.judge(it, r.ans).ok; document.querySelectorAll('#stage .choices').forEach(b => b.remove()); logAttempt({ scene: c.s || 'game', tag, ok, firstTry: n === 0 }); n++; if (ok) { if (def.onOk) await def.onOk(it, r); break; } SFX.soft(); await S('gen.ang.again'); } }
    await S(L[2]); }
  { const { svg } = city(); SFX.good(); logAttempt({ scene: c.s || 'game', tag: 'angleCity', ok: true }); await S(L[3]); } };
SCENES.recallAngle = async c => { const svg = newStage(232, { oasis: false, ground: 0 }); angFrame(svg); const d = c.deg || 60, rx = d > 180 && d < 360; angleAt(svg, rx ? [180, 120] : d === 180 ? [180, 116] : [140, 160], c.rot || 0, rx ? 360 - d : d, { names: c.nm, arc: rx ? c.arc || 'out' : c.arc || 'in', l1: d === 180 ? 88 : 100, l2: d === 180 ? 88 : 100 }); if (c.corner) paperCornerAt(svg, rx ? [180, 120] : [140, 160], c.rot || 0, 56); await sleep(300); await S(c.lines); };
SCENES.recallKinds = async c => { const svg = newStage(200, { oasis: false, ground: 0 }), degs = c.degs || [50, 90, 130]; degs.forEach((d, i) => { const g = el('g', { transform: `translate(${LINE_X3[i]} 100)` }, svg), rx = d > 180 && d < 360; el('rect', { x: -50, y: -50, width: 100, height: 100, rx: 16, fill: GEO.paper, stroke: css('--line'), 'stroke-width': 2.5 }, g); angleAt(g, rx ? [0, 0] : d === 180 ? [0, 14] : [-26, 26], 0, rx ? 360 - d : d, { l1: d === 180 ? 40 : 54, arc: rx ? 'out' : 'in', r: 16, w: 3.4 }); const t = el('text', { x: 0, y: 72, 'text-anchor': 'middle', 'font-size': 13, fill: GEO.ink }, g); t.textContent = labelText('angK.' + ANG_KIND(d)); }); await sleep(300); await S(c.lines); };
SCENES.recallProt = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), it = ITEM.protRead.make({ deg: c.deg || 120, side: c.side || 'r' }), D = ITEM.protRead.draw(it, svg); D.P.mark(D.l ? 180 - it.deg : it.deg); await sleep(300); await S(c.lines); };
SCENES.recallTurn = async c => { const svg = newStage(220, { oasis: false, ground: 0 }); discAt(svg, [180, 110], 88, c.turns || 1); await sleep(300); await S(c.lines); };
SCENES.recallRose = async c => { const svg = newStage(250, { oasis: false, ground: 0 }), C = [180, 128]; roseAt(svg, C, 80); if (c.face) faceArrow(svg, C, c.face); await sleep(300); await S(c.lines); };
WRAP_ART.angleDoor = svg => { const g = el('g', {}, svg), V = [130, 190]; el('rect', { x: 60, y: 60, width: 240, height: 140, rx: 14, fill: '#efe6d6' }, g); geoLine(g, 70, V[1], 290, V[1], { color: '#8a6a4a', w: 6 }); geoLine(g, V[0], V[1], ...angP(V, 60, 120), { color: '#b0552f', w: 10 }); el('path', { d: angArc(V, 40, 0, 60), fill: 'none', stroke: ANG.arc, 'stroke-width': 4 }, g); anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200, fill: 'both' }); palmAt(svg, 330, 250, .7); palmAt(svg, 30, 250, .8); };
WRAP_ART.angleKinds = svg => { const g = el('g', {}, svg); el('rect', { x: 50, y: 70, width: 260, height: 120, rx: 14, fill: '#fffdf6' }, g); [[45, 250], [90, 160], [135, 70]].forEach(([d, x]) => angleAt(g, [x + 20, 170], 0, d, { l1: 60, l2: 60, r: 16, w: 3 })); anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200, fill: 'both' }); palmAt(svg, 330, 250, .7); palmAt(svg, 30, 250, .8); };
WRAP_ART.turnArt = svg => { const g = el('g', {}, svg); discAt(g, [180, 140], 70, 2); anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200, fill: 'both' }); palmAt(svg, 330, 250, .7); palmAt(svg, 30, 250, .8); };
WRAP_ART.cakeArt = svg => { const g = el('g', {}, svg), C = [180, 130]; el('circle', { cx: C[0], cy: C[1], r: 62, fill: '#f2c98a', stroke: '#b9853d', 'stroke-width': 3 }, g); el('path', { d: `M${C[0]} ${C[1]} L${angP(C, 0, 62).join(' ')} ${angArc(C, 62, 0, 60).replace(/^M[^A]*/, '')} Z`, fill: '#e8a94f', stroke: '#fff', 'stroke-width': 3, transform: 'translate(16 -10)' }, g); anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200, fill: 'both' }); palmAt(svg, 330, 250, .7); palmAt(svg, 30, 250, .8); };
WRAP_ART.protArt = svg => { const g = el('g', {}, svg); protAt(g, [180, 190], 0, { R: 110, step: 30 }); anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200, fill: 'both' }); palmAt(svg, 330, 250, .7); palmAt(svg, 30, 250, .8); };
WRAP_ART.roseArt = svg => { const g = el('g', {}, svg); roseAt(g, [180, 130], 56); anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200, fill: 'both' }); palmAt(svg, 330, 250, .7); palmAt(svg, 30, 250, .8); };
