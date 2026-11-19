/* =====================================================================
   S2-U1 «خيوط الطرق» (المرحلة 2، نوفمبر 2026)
   د1 النقطة وتسميتها (C101) وموقعها على الشبكة (C102) · د2 مستقيم ومنحنٍ ومنكسر (C103)، مفتوح ومغلق (C104)، أفقي ورأسي ومائل (C105)
   د3 القطعة المستقيمة وقياسها (C106) وتسميتها (C107) وأقصر مسافة (C114) · د4 تساوي القطع وعلاماتها (C108) ونقطة المنتصف (C109)
   د5 الشعاع وتسميته المرتبة (C110) · د6 المستقيم (C111)، ومن نقطتين مستقيم واحد (C112)، والاستقامة الواحدة (C113)
   ===================================================================== */
const GEO = { ink: '#24323a', pt: '#1f4f7a', road: '#8a6a4a', hl: '#2f9d6b', soft: '#9fb4c0', paper: '#fffdf6' };
const LTR = { a: 'أ', b: 'ب', j: 'ج', d: 'د', h: 'هـ', m: 'م', w: 'و', l: 'ل' };
/* نقطة مسمّاة: دائرة صغيرة وحرفها بجانبها (lab: إزاحة الحرف) */
function ptAt(parent, x, y, key, o = {}) { const g = el('g', { 'data-pt': key || '' }, parent); el('circle', { cx: x, cy: y, r: o.r || 4.5, fill: o.color || GEO.pt }, g);
  if (key) { const [dx, dy] = o.lab || [0, -12], t = el('text', { x: x + dx, y: y + dy, 'text-anchor': 'middle', 'font-size': o.size || 19, 'font-weight': 700, fill: o.color || GEO.ink, 'pointer-events': 'none' }, g); t.textContent = LTR[key] || key; } return g; }
const geoLine = (parent, x1, y1, x2, y2, o = {}) => el('line', { x1, y1, x2, y2, stroke: o.color || GEO.ink, 'stroke-width': o.w || 3.2, 'stroke-linecap': 'round', 'stroke-dasharray': o.dash || null }, parent);
function geoArrow(parent, x, y, ang, col = GEO.ink, s = 9) { const a = ang * Math.PI / 180, c = Math.cos(a), n = Math.sin(a); return el('path', { d: `M${x} ${y} L${x - s * c + s * .6 * n} ${y - s * n - s * .6 * c} M${x} ${y} L${x - s * c - s * .6 * n} ${y - s * n + s * .6 * c}`, stroke: col, 'stroke-width': 3, 'stroke-linecap': 'round', fill: 'none' }, parent); }
/* قطعة أو شعاع أو مستقيم بين نقطتين [x، y]: kind = seg | ray (من P عبر Q) | line. ext: كم يمتدّ بعد النقطة. ticks: شرطات التساوي */
function geoObj(parent, kind, P, Q, o = {}) { const g = el('g', { 'data-geo': kind }, parent), dx = Q[0] - P[0], dy = Q[1] - P[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, e = o.ext ?? 34, ang = Math.atan2(dy, dx) * 180 / Math.PI;
  const A = kind === 'line' ? [P[0] - ux * e, P[1] - uy * e] : P, B = kind === 'seg' ? Q : [Q[0] + ux * e, Q[1] + uy * e]; geoLine(g, A[0], A[1], B[0], B[1], o);
  if (kind !== 'seg') geoArrow(g, B[0], B[1], ang, o.color); if (kind === 'line') geoArrow(g, A[0], A[1], ang + 180, o.color);
  if (o.ticks) { const mx = (P[0] + Q[0]) / 2, my = (P[1] + Q[1]) / 2; for (let i = 0; i < o.ticks; i++) { const t = (i - (o.ticks - 1) / 2) * 6, cx = mx + ux * t, cy = my + uy * t; geoLine(g, cx - uy * 8, cy + ux * 8, cx + uy * 8, cy - ux * 8, { color: o.tickColor || css('--chaos'), w: 2.6 }); } }
  if (o.dots !== false) { ptAt(g, P[0], P[1], o.names && o.names[0], { lab: o.labP }); if (kind !== 'x') ptAt(g, Q[0], Q[1], o.names && o.names[1], { lab: o.labQ }); } return g; }
/* أسماء منطوقة: «القطعة» ثم حرفاها، والحروف بأسمائها (ألف، باء…) */
async function sayGeo(kind, keys, opt = {}) { await S('gen.geo.' + kind, { noGap: true }); for (const [i, k] of keys.entries()) await S('gen.ltr.' + k, i < keys.length - 1 ? { noGap: true } : opt); }
async function sayLtr(k, opt) { return S('gen.ltr.' + k, opt); }

/* ---------- مكتبة الرسوم الصغيرة (تُرسم في مربع 96 × 96 مركزه الأصل): لكل رسم خصائصه التي تسأل عنها بنود linePick ---------- */
const LFIG = {
  stH: { p: { straight: 1, open: 1, h: 1 }, d: g => geoLine(g, -36, 0, 36, 0) },
  stV: { p: { straight: 1, open: 1, v: 1 }, d: g => geoLine(g, 0, -36, 0, 36) },
  stD: { p: { straight: 1, open: 1, dg: 1 }, d: g => geoLine(g, -32, 30, 32, -30) },
  stD2: { p: { straight: 1, open: 1, dg: 1 }, d: g => geoLine(g, -34, -18, 34, 18) },
  wave: { p: { curve: 1, open: 1 }, d: g => el('path', { d: 'M-38 6 C-22 -34 -8 34 6 0 S30 -22 38 4', fill: 'none', stroke: GEO.ink, 'stroke-width': 3.2, 'stroke-linecap': 'round' }, g) },
  arc: { p: { curve: 1, open: 1 }, d: g => el('path', { d: 'M-36 22 Q0 -46 36 22', fill: 'none', stroke: GEO.ink, 'stroke-width': 3.2, 'stroke-linecap': 'round' }, g) },
  spiral: { p: { curve: 1, open: 1 }, d: g => el('path', { d: 'M4 4 C-10 -6 -14 14 2 16 C22 18 26 -12 4 -20 C-22 -28 -36 6 -22 26', fill: 'none', stroke: GEO.ink, 'stroke-width': 3.2, 'stroke-linecap': 'round' }, g) },
  zig: { p: { broken: 1, open: 1 }, d: g => el('path', { d: 'M-38 20 L-18 -22 L2 20 L20 -22 L38 14', fill: 'none', stroke: GEO.ink, 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g) },
  stair: { p: { broken: 1, open: 1 }, d: g => el('path', { d: 'M-36 30 H-12 V6 H12 V-18 H36', fill: 'none', stroke: GEO.ink, 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g) },
  bolt: { p: { broken: 1, open: 1 }, d: g => el('path', { d: 'M-10 -36 L-26 2 L4 -4 L-8 36', fill: 'none', stroke: GEO.ink, 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g) },
  ring: { p: { curve: 1, closed: 1 }, d: g => el('ellipse', { rx: 34, ry: 26, fill: 'none', stroke: GEO.ink, 'stroke-width': 3.2 }, g) },
  bean: { p: { curve: 1, closed: 1 }, d: g => el('path', { d: 'M-30 -6 C-34 -34 20 -36 30 -10 C40 16 10 12 4 26 C-4 40 -30 30 -30 -6 Z', fill: 'none', stroke: GEO.ink, 'stroke-width': 3.2 }, g) },
  boxC: { p: { broken: 1, closed: 1 }, d: g => el('path', { d: 'M-30 -28 H30 V28 H-30 Z', fill: 'none', stroke: GEO.ink, 'stroke-width': 3.2, 'stroke-linejoin': 'round' }, g) },
  triC: { p: { broken: 1, closed: 1 }, d: g => el('path', { d: 'M0 -32 L34 28 L-34 28 Z', fill: 'none', stroke: GEO.ink, 'stroke-width': 3.2, 'stroke-linejoin': 'round' }, g) },
  pentC: { p: { broken: 1, closed: 1 }, d: g => el('path', { d: 'M0 -34 L32 -8 L20 30 L-20 30 L-32 -8 Z', fill: 'none', stroke: GEO.ink, 'stroke-width': 3.2, 'stroke-linejoin': 'round' }, g) },
  boxGap: { p: { broken: 1, open: 1, gap: 1 }, d: g => el('path', { d: 'M-12 -28 H-30 V28 H30 V-28 H-2', fill: 'none', stroke: GEO.ink, 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g) },
  ringGap: { p: { curve: 1, open: 1, gap: 1 }, d: g => el('path', { d: 'M8 -26 A34 26 0 1 0 22 -20', fill: 'none', stroke: GEO.ink, 'stroke-width': 3.2, 'stroke-linecap': 'round' }, g) },
  triGap: { p: { broken: 1, open: 1, gap: 1 }, d: g => el('path', { d: 'M-8 -18 L-34 28 L34 28 L4 -26', fill: 'none', stroke: GEO.ink, 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g) },
  eight: { p: { curve: 1, closed: 1, cross: 1 }, d: g => el('path', { d: 'M0 0 C-30 -40 -44 14 0 0 C44 -14 30 40 0 0 Z', fill: 'none', stroke: GEO.ink, 'stroke-width': 3.2 }, g) },
  seg: { p: { seg: 1 }, d: g => geoObj(g, 'seg', [-32, 14], [32, -14]) },
  seg2: { p: { seg: 1 }, d: g => geoObj(g, 'seg', [-34, -4], [34, 6]) },
  ray: { p: { ray: 1 }, d: g => geoObj(g, 'ray', [-34, 14], [2, -2], { ext: 32 }) },
  ray2: { p: { ray: 1 }, d: g => geoObj(g, 'ray', [30, 18], [-2, 4], { ext: 32 }) },
  line: { p: { line: 1 }, d: g => geoObj(g, 'line', [-14, 6], [14, -6], { ext: 24 }) },
  line2: { p: { line: 1 }, d: g => geoObj(g, 'line', [-12, -10], [12, 10], { ext: 24 }) },
  dotFine: { p: { fine: 1 }, d: g => { el('circle', { r: 3.2, fill: GEO.pt }, g); } },
  dotFat: { p: { fat: 1 }, d: g => { el('circle', { r: 22, fill: GEO.pt, opacity: .85 }, g); } },
  dotRing: { p: { fat: 1 }, d: g => { el('circle', { r: 20, fill: 'none', stroke: GEO.pt, 'stroke-width': 5 }, g); } },
  dotX: { p: { fat: 1 }, d: g => { el('path', { d: 'M-22 -22 L22 22 M22 -22 L-22 22', stroke: css('--chaos'), 'stroke-width': 12, 'stroke-linecap': 'round' }, g); } },
  col: { p: { col: 1 }, d: g => { for (const [x, y] of [[-30, 18], [0, 0], [30, -18]]) ptAt(g, x, y); } },
  col2: { p: { col: 1 }, d: g => { for (const [x, y] of [[-32, -8], [-4, -1], [32, 8]]) ptAt(g, x, y); } },
  ncol: { p: { ncol: 1 }, d: g => { for (const [x, y] of [[-30, 18], [0, -14], [30, 14]]) ptAt(g, x, y); } },
  ncol2: { p: { ncol: 1 }, d: g => { for (const [x, y] of [[-30, -6], [2, 8], [30, -10]]) ptAt(g, x, y); } },
};
function lfigAt(parent, name, x, y, k = 1) { const g = el('g', { transform: `translate(${x} ${y})`, 'data-fig': name }, parent); el('rect', { x: -50, y: -50, width: 100, height: 100, rx: 16, fill: GEO.paper, stroke: css('--line'), 'stroke-width': 2.5 }, g); LFIG[name].d(el('g', { transform: `scale(${k})` }, g)); return g; }
/* ================= ① أيّ الرسوم…؟ (C101، C103، C104، C105، C110، C111، C113): pics ثلاثة، ask خاصيّة واحدة يملكها رسم واحد منها ================= */
const LINE_X3 = [290, 180, 70];
const LINE_ERR = { fine: 'pointFat', straight: 'lineKind', curve: 'lineKind', broken: 'lineKind', open: 'lineOpen', closed: 'lineOpen', h: 'lineDir', v: 'lineDir', dg: 'lineDir', seg: 'segRayLine', ray: 'segRayLine', line: 'segRayLine', col: 'colWrong', ncol: 'colWrong' };
ITEM.figPick = {
  make(spec) { const has = spec.pics.map(n => !!LFIG[n].p[spec.ask]), want = has.indexOf(true); /*T*/if (TESTHOOK && has.filter(Boolean).length !== 1) testBug('figPick: الخاصيّة ' + spec.ask + ' ليست لرسم واحد في ' + spec.pics.join(','));/*/T*/ return { ...spec, want, tag: 'line-' + spec.ask }; },
  async ask(item, mode, tries) { const svg = newStage(200, { oasis: false, ground: 0 }), G = item.pics.map((n, i) => lfigAt(svg, n, LINE_X3[i], 100));
    if (tries >= 3) this.aid(item, svg, G);   /* الحلّ المشترك: علامة على ما يميّز كل رسم، والاختيار للطفل */
    say(...lineOf(tries >= 3 ? 'gen.geo.together.pick' : item.q), { free: true });
    const k = await tapOne(G.map((g, i) => ({ g, k: i, label: labelText('geoFig') + ' ' + DG(i + 1) })), { ok: item.want, pad: 100 }); hush(); return { ans: k, ctx: { svg, G } }; },
  aid(item, svg, G) { const m = helpG(svg); item.pics.forEach((n, i) => { const p = LFIG[n].p, key = p.gap ? 'geoAidGap' : p.closed ? 'geoAidClosed' : p.broken ? 'geoAidBroken' : p.curve ? 'geoAidCurve' : p.straight ? 'geoAidStraight' : p.seg ? 'geoAidSeg' : p.ray ? 'geoAidRay' : p.line ? 'geoAidLine' : null; if (!key) return;
      const t = el('text', { x: LINE_X3[i], y: 176, 'text-anchor': 'middle', 'font-size': 14, fill: css('--think') }, m); t.textContent = labelText(key); }); return m; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: LINE_ERR[item.ask] || 'lineKind' }; },
  onOk(item, r) { SFX.good(); okRing(r.ctx.svg, r.ctx.G[r.ans], 2); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const m = this.aid(item, r.ctx.svg, r.ctx.G); await sleep(1600); m.remove(); }, async together() {},
  async reveal(item, r) { okRing(r.ctx.svg, r.ctx.G[item.want], 2); await S('gen.geo.reveal.' + item.ask); },
  praise: () => 'praiseLook', twin(item) { return item.twin || null; },
};

/* ---------- الشبكة: نقطة البداية أسفل اليسار، والعدّ يميناً ثم إلى الأعلى (C102) ---------- */
function geoGrid(svg, o = {}) { const c = o.cell || 40, cols = o.cols || 7, rows = o.rows || 5, x0 = o.x0 ?? (360 - cols * c) / 2, y0 = o.y0 ?? 18 + rows * c, g = el('g', { 'data-grid': 1 }, svg);
  el('rect', { x: x0 - 10, y: y0 - rows * c - 10, width: cols * c + 20, height: rows * c + 20, rx: 10, fill: GEO.paper, stroke: css('--line'), 'stroke-width': 2 }, g);
  for (let i = 0; i <= cols; i++) geoLine(g, x0 + i * c, y0, x0 + i * c, y0 - rows * c, { color: '#cfdde6', w: 1.4 }); for (let j = 0; j <= rows; j++) geoLine(g, x0, y0 - j * c, x0 + cols * c, y0 - j * c, { color: '#cfdde6', w: 1.4 });
  const P = (r, u) => [x0 + r * c, y0 - u * c]; el('circle', { cx: x0, cy: y0, r: 7, fill: css('--compass'), stroke: '#fff', 'stroke-width': 2 }, g);
  return { g, P, c, cols, rows, x0, y0,
    snap(q) { return [Math.max(0, Math.min(cols, Math.round((q[0] - x0) / c))), Math.max(0, Math.min(rows, Math.round((y0 - q[1]) / c)))]; },
    async walk(r, u, o2 = {}) { const m = helpG(svg); for (let i = 1; i <= r; i++) { const [xa, ya] = P(i - 1, 0), [xb] = P(i, 0); el('path', { d: `M${xa} ${ya} Q${(xa + xb) / 2} ${ya - 18} ${xb} ${ya}`, fill: 'none', stroke: css('--compass'), 'stroke-width': 2.6 }, m); SFX.tick(); if (o2.silent) await sleep(o2.ms || 200); else await S(numw(i), { noGap: true, num: true }); }
      for (let j = 1; j <= u; j++) { const [xa, ya] = P(r, j - 1), [, yb] = P(r, j); el('path', { d: `M${xa} ${ya} Q${xa + 18} ${(ya + yb) / 2} ${xa} ${yb}`, fill: 'none', stroke: css('--think'), 'stroke-width': 2.6 }, m); SFX.tick(); if (o2.silent) await sleep(o2.ms || 200); else await S(numw(j), { noGap: true, num: true }); } return m; } }; }
/* لافتة الحركة: سهم يمين وعدده، ثم سهم إلى الأعلى وعدده (الأسهم مرسومة: لا حرف سهم في خط القراءة) */
const geoMoveLabel = (svg, r, u) => { const g = el('g', { 'pointer-events': 'none' }, svg), num = (x, n) => { const t = el('text', { x, y: 257, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 700, fill: GEO.ink }, g); t.textContent = DG(n); };
  geoLine(g, 122, 250, 148, 250, { color: css('--compass'), w: 3 }); geoArrow(g, 150, 250, 0, css('--compass'), 8); num(166, r); geoLine(g, 206, 262, 206, 240, { color: css('--think'), w: 3 }); geoArrow(g, 206, 238, -90, css('--think'), 8); num(224, u); return g; };
/* ================= ② ضع النقطة: r مربعات يميناً ثم u إلى الأعلى (C102، إنتاج) ================= */
ITEM.gridPoint = {
  make(spec) { return { ...spec, tag: 'grid-point' }; },
  async ask(item, mode, tries) { const svg = newStage(270, { oasis: false, ground: 0 }), Gd = geoGrid(svg); geoMoveLabel(svg, item.r, item.u); let cur = null, dot = null, walk = null, done = false;
    if (tries >= 3) walk = await Gd.walk(item.r, 0, { silent: true });   /* الحلّ المشترك: قفزات اليمين مرسومة، والصعود للطفل */
    const askQ = async () => { await S(tries >= 3 ? 'gen.geo.together.grid' : (item.q || 'gen.geo.gridQ'), { noGap: true }); await S(numw(item.r), { noGap: true, num: true }); await S('gen.geo.thenUp', { noGap: true }); await S(numw(item.u), { num: true }); };
    askQ(); REPLAY_HOOK = () => askQ(); REPLAY_HOOK.live = () => !done && svg.isConnected;
    const set = (r, u) => { cur = [r, u]; if (dot) dot.remove(); const [x, y] = Gd.P(r, u); dot = el('g', { 'pointer-events': 'none' }, svg); el('circle', { cx: x, cy: y, r: 9, fill: GEO.pt, stroke: '#fff', 'stroke-width': 2.5 }, dot); /*T*/window.__gridPt = cur;/*/T*/ };
    const input = fingerInput(svg, { map: e => { const q = svgPoint(svg, e); return [q.x, q.y]; }, down(q) { if (q[1] > Gd.y0 + 24) return false; set(...Gd.snap(q)); SFX.tick(); }, move(q) { set(...Gd.snap(q)); }, up() {} });
    /*T*/window.__gridPtAt = (r, u) => { const m = svg.getScreenCTM(), [x, y] = Gd.P(r, u); return { x: m.a * x + m.e, y: m.d * y + m.f }; }; window.__gridPtWant = [item.r, item.u];/*/T*/
    /* بلوحة المفاتيح: كل تقاطع خانةٌ تُركَّز (gridcell) ومفتاح الفعل يضع النقطة عندها، كخانات شبكة المئة (D275) */
    const mv = []; for (let u = Gd.rows; u >= 0; u--) for (let r = 0; r <= Gd.cols; r++) { const [x, y] = Gd.P(r, u), b = el('g', { role: 'gridcell', tabindex: 0, 'aria-label': `${labelText('geoRight')} ${DG(r)}، ${labelText('geoUp')} ${DG(u)}` }, svg); el('circle', { cx: x, cy: y, r: 10, fill: 'transparent', 'pointer-events': 'none' }, b); b.onkeydown = e => { if (isActKey(e)) { e.preventDefault(); set(r, u); SFX.tick(); } }; mv.push(b); }
    AUTO({ kind: 'gridPt', ok: () => { set(item.r, item.u); rulDoneBtn().click(); }, wrong: () => { set(item.u, item.r); rulDoneBtn().click(); } });
    await rulDone(() => { done = true; REPLAY_HOOK = null; input.off(); mv.forEach(b => b.remove()); }); return { ans: cur || [0, 0], ctx: { svg, Gd, set, walk } }; },
  judge(item, a) { return a[0] === item.r && a[1] === item.u ? { ok: true } : { ok: false, err: a[0] === item.u && a[1] === item.r ? 'gridSwap' : a[0] === item.r + 1 || a[1] === item.u + 1 ? 'gridPlusOne' : 'gridOff' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const m = await r.ctx.Gd.walk(item.r, item.u, { silent: true, ms: 260 }); await sleep(700); m.remove(); }, async together() {},
  async reveal(item, r) { if (r.ctx.walk) r.ctx.walk.remove(); await r.ctx.Gd.walk(item.r, item.u, { silent: true, ms: 160 }); r.ctx.set(item.r, item.u); await S('gen.geo.reveal.grid'); },
  praise: () => 'praisePlace', twin(item) { return item.twin || null; },
};
/* ================= ③ اقرأ موقع النقطة: كم مربعاً يميناً (ask: r) أو إلى الأعلى (ask: u)؟ (C102) ================= */
ITEM.gridRead = { ...numItem,
  make(spec) { const w = spec.ask === 'u' ? spec.u : spec.r, o = spec.ask === 'u' ? spec.r : spec.u; return { ...spec, want: w, nums: rulNear(w, o, w + 1, w - 1), tag: 'grid-read-' + (spec.ask || 'r') }; },
  async ask(item, mode, tries) { const svg = newStage(270, { oasis: false, ground: 0 }), Gd = geoGrid(svg), [x, y] = Gd.P(item.r, item.u); ptAt(svg, x, y, item.name || 'a', { r: 7, lab: [14, -10] }); let walk = null;
    if (tries >= 3) { await S('gen.geo.together.read'); walk = await Gd.walk(item.r, item.u, { silent: true }); } else await S(item.q);
    const np = numberPick(shuffle(item.nums), item.want, { digits: true }); return { ans: await np.p, ctx: { svg, np, Gd, walk } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: k === (item.ask === 'u' ? item.r : item.u) ? 'gridSwap' : k === item.want + 1 ? 'gridPlusOne' : 'gridOff' }; },
  async hint2(item, r) { const m = await r.ctx.Gd.walk(item.r, item.u, { silent: true, ms: 240 }); await sleep(700); m.remove(); }, async together() {},
  async reveal(item, r) { if (!r.ctx.walk) await r.ctx.Gd.walk(item.r, item.u, { silent: true, ms: 140 }); await S(numw(item.want), { num: true }); },
  praise: () => 'praisePlace', twin(item) { return item.twin || null; },
};
/* ================= ④ المس النقطة المسمّاة (C101): pts = [[مفتاح الحرف، x، y]…]، want مفتاح ================= */
ITEM.pointTap = {
  make(spec) { return { ...spec, tag: 'point-tap' }; },
  async ask(item, mode, tries) { const svg = newStage(230, { oasis: false, ground: 0 }); el('rect', { x: 20, y: 14, width: 320, height: 200, rx: 14, fill: GEO.paper, stroke: css('--line'), 'stroke-width': 2 }, svg); let done = false;
    const G = item.pts.map(([k, x, y]) => { const g = el('g', {}, svg); ptAt(g, x, y, k, { r: 6, lab: [0, -14] }); return g; });
    if (tries >= 3) { const i = item.pts.findIndex(p => p[0] === item.want), m = helpG(svg); el('circle', { cx: item.pts[i][1], cy: item.pts[i][2] - 20, r: 15, fill: 'none', stroke: css('--think'), 'stroke-width': 2.5, 'stroke-dasharray': '4 3' }, m); }   /* الحلّ المشترك: الحرف محاط، واللمس للطفل */
    const askQ = async () => { await S(tries >= 3 ? 'gen.geo.together.name' : (item.q || 'gen.geo.tapPt'), { noGap: true }); await sayLtr(item.want); }; askQ(); REPLAY_HOOK = () => askQ(); REPLAY_HOOK.live = () => !done && svg.isConnected;
    const k = await tapOne(item.pts.map(([key], i) => ({ g: G[i], k: key, label: labelText('geoPoint') + ' ' + LTR[key] })), { ok: item.want, pad: 64 }); done = true; REPLAY_HOOK = null; hush(); return { ans: k, ctx: { svg, G } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'pointName' }; },
  onOk(item, r) { SFX.good(); okRing(r.ctx.svg, r.ctx.G[item.pts.findIndex(p => p[0] === r.ans)], 6); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const i = item.pts.findIndex(p => p[0] === item.want), m = helpG(r.ctx.svg); el('circle', { cx: item.pts[i][1], cy: item.pts[i][2] - 20, r: 15, fill: 'none', stroke: css('--think'), 'stroke-width': 2.5 }, m); await sleep(1300); m.remove(); }, async together() {},
  async reveal(item, r) { okRing(r.ctx.svg, r.ctx.G[item.pts.findIndex(p => p[0] === item.want)], 6); await S('gen.geo.reveal.name', { noGap: true }); await sayLtr(item.want); },
  praise: () => 'praiseLook', twin(item) { return item.twin || null; },
};

/* ---------- مشاهد الدرس 1 ---------- */
/* خريطة الكنز: علامة عريضة، فيلمسها الطفل فتصير نقطة دقيقة باسمها. lines: [السؤال، بعد اللمس] */
SCENES.treasureHook = async c => { const svg = newStage(250, { oasis: false, ground: 0 }), [l1, l2] = c.lines; el('rect', { x: 26, y: 16, width: 308, height: 214, rx: 14, fill: '#f3e6c4', stroke: '#c9a54a', 'stroke-width': 3 }, svg);
  el('path', { d: 'M50 190 C100 150 110 210 160 170 S230 120 250 96', fill: 'none', stroke: GEO.road, 'stroke-width': 3, 'stroke-dasharray': '7 6' }, svg); palmAt(svg, 80, 120, .5); palmAt(svg, 300, 200, .45);
  const X = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg); el('path', { d: 'M232 78 L268 114 M268 78 L232 114', stroke: css('--chaos'), 'stroke-width': 13, 'stroke-linecap': 'round' }, X);
  await answerWhile(l1, () => tapOne([{ g: X, k: 'x', label: labelText('geoMark') }], { ok: 'x', pad: 64, pulse: true })); X.setAttribute('opacity', .22); X.removeAttribute('role'); X.removeAttribute('tabindex'); X.setAttribute('pointer-events', 'none'); ptAt(svg, 250, 96, 'a', { r: 4, lab: [16, -8] }); SFX.good(); logAttempt({ scene: 'hook', tag: 'treasure', ok: true }); await S(l2); };
/* النقطة: قلم عريض وقلم رفيع يدلّان على المكان نفسه؛ ثم تُسمّى النقاط بحروف. lines: [العريض والرفيع، الدعوة إلى التسمية، ختام] */
SCENES.pointShow = async c => { const svg = newStage(230, { oasis: false, ground: 0 }), [l1, l2, l3] = c.lines; el('rect', { x: 20, y: 14, width: 320, height: 200, rx: 14, fill: GEO.paper, stroke: css('--line'), 'stroke-width': 2 }, svg);
  const fat = el('circle', { cx: 110, cy: 110, r: 22, fill: GEO.pt, opacity: .8 }, svg), fine = el('circle', { cx: 250, cy: 110, r: 3.5, fill: GEO.pt }, svg); await S(l1); await anim(fat, [{ r: 22 }, { r: 3.5 }], { duration: 900, fill: 'forwards' }).done.catch(() => {}); fat.setAttribute('r', 3.5); fat.setAttribute('opacity', 1); SFX.pop();
  const P = [['a', 110, 110], ['b', 250, 110], ['j', 180, 170]]; ptAt(svg, 180, 170, null, { r: 3.5 }); S(l2, { free: true });
  for (const [i, [k, x, y]] of P.entries()) { const g = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg); el('circle', { cx: x, cy: y, r: 16, fill: css('--compass'), opacity: .16 }, g); await tapOne([{ g, k, label: labelText('geoPoint') }], { ok: k, pad: 64, pulse: true }); if (i === 0) hush(); g.remove(); ptAt(svg, x, y, k, { r: 3.5, lab: [0, -14] }); SFX.tick(); await sayLtr(k); }
  logAttempt({ scene: c.s || 'explore', tag: 'pointShow', ok: true }); await S(l3); };
/* المشي على الشبكة: من نقطة البداية يميناً ثم إلى الأعلى، والطفل يلمس كل قفزة (التالية تنبض). c: r، u، lines: [الدعوة، بعد اليمين، ختام] */
SCENES.gridWalk = async c => { const svg = newStage(270, { oasis: false, ground: 0 }), Gd = geoGrid(svg), [l1, l2, l3] = c.lines, m = helpG(svg); geoMoveLabel(svg, c.r, c.u); S(l1, { free: true });
  const hop = async (r, u, i, n, col) => { const [x, y] = Gd.P(r, u), g = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg); el('circle', { cx: x, cy: y, r: 13, fill: col, opacity: .3, stroke: col, 'stroke-width': 2 }, g); await tapOne([{ g, k: i, label: labelText('geoHop') + ' ' + DG(n) }], { ok: i, pad: 60, pulse: true }); g.remove(); el('circle', { cx: x, cy: y, r: 5, fill: col }, m); SFX.tick(); await S(numw(n), { noGap: true, num: true }); };
  for (let i = 1; i <= c.r; i++) { await hop(i, 0, 'r' + i, i, css('--compass')); if (i === 1) hush(); } await S(l2); for (let j = 1; j <= c.u; j++) await hop(c.r, j, 'u' + j, j, css('--think'));
  const [x, y] = Gd.P(c.r, c.u); ptAt(svg, x, y, 'a', { r: 7, lab: [14, -10] }); SFX.good(); logAttempt({ scene: c.s || 'explore', tag: 'gridWalk', ok: true }); await S(l3); };
/* «صحّح لفوضى» على الشبكة: فوضى وضعت النقطة في غير موضعها (C.wr، C.wu)؛ يضعها الطفل في موضعها. C: r، u، find، after */
SCENES.chaosGridPt = async C => { const it = ITEM.gridPoint.make({ r: C.r, u: C.u, q: C.find }); let tries = 0;
  while (true) { const p = ITEM.gridPoint.ask(it, 'chaos', tries >= 2 ? 3 : 0), svg = $('#stage svg'), Gd = null; if (tries === 0) { const fz = chaosAt(svg, 330, 30, .3); chaosGiggle(fz); } { const g = el('g', { 'pointer-events': 'none', opacity: .55 }, svg), c = 40, x0 = (360 - 7 * c) / 2, y0 = 18 + 5 * c; el('circle', { cx: x0 + C.wr * c, cy: y0 - C.wu * c, r: 8, fill: css('--chaos') }, g); }
    const r = await p, ok = ITEM.gridPoint.judge(it, r.ans).ok; tries++; logAttempt({ scene: 'chaos', tag: 'find', ok, firstTry: tries === 1 }); if (ok) { SFX.good(); break; } SFX.soft(); await S('gen.pat.chaosNo'); }
  if (C.after) await S(C.after); };
SCENES.recallGridPt = async c => { const svg = newStage(270, { oasis: false, ground: 0 }), Gd = geoGrid(svg); geoMoveLabel(svg, c.r || 3, c.u || 2); await sleep(300); await Gd.walk(c.r || 3, c.u || 2, { silent: true }); const [x, y] = Gd.P(c.r || 3, c.u || 2); ptAt(svg, x, y, 'a', { r: 7, lab: [14, -10] }); await S(c.lines); };
SCENES.recallFigs = async c => { const svg = newStage(200, { oasis: false, ground: 0 }); (c.pics || ['dotFine', 'dotFat', 'dotX']).forEach((n, i) => lfigAt(svg, n, LINE_X3[i], 100)); await sleep(300); await S(c.lines); };
WRAP_ART.treasureMap = svg => { const g = el('g', {}, svg); el('rect', { x: 70, y: 50, width: 220, height: 150, rx: 12, fill: '#f3e6c4', stroke: '#c9a54a', 'stroke-width': 3 }, g); el('path', { d: 'M90 170 C130 140 150 190 190 150 S240 110 256 96', fill: 'none', stroke: GEO.road, 'stroke-width': 3, 'stroke-dasharray': '7 6' }, g); ptAt(g, 256, 96, 'a', { r: 5, lab: [14, -8] }); anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200, fill: 'both' }); palmAt(svg, 326, 250, .8); palmAt(svg, 34, 250, .9); };

/* ---------- مشاهد الدرس 2: أنواع الخطوط ---------- */
/* معمل الرسوم: رسوم يلمسها الطفل واحداً واحداً (التالي ينبض)، ولكلٍّ جملته. c: { things: [{ fig، line }]، intro، after } */
SCENES.figLab = async c => { const svg = newStage(200, { oasis: false, ground: 0 }), n = c.things.length, X = i => n === 2 ? [250, 110][i] : n === 4 ? [312, 224, 136, 48][i] : LINE_X3[i], k = n === 4 ? .8 : 1;
  const G = c.things.map((t, i) => { const g = lfigAt(svg, t.fig, X(i), 100); if (k !== 1) g.setAttribute('transform', `translate(${X(i)} 100) scale(${k})`); g.setAttribute('opacity', .45); return g; }); S(c.intro, { free: true });
  for (const [i, t] of c.things.entries()) { G[i].setAttribute('opacity', 1); await tapOne([{ g: G[i], k: i, label: labelText('geoFig') + ' ' + DG(i + 1) }], { ok: i, pad: n === 4 ? 80 : 100, pulse: true }); if (i === 0) hush(); okRing(svg, G[i], 2); SFX.tick(); await S(t.line); }
  logAttempt({ scene: c.s || 'explore', tag: 'figLab', ok: true }); if (c.after) await S(c.after); };
/* طريق فوضى المتعرّج: «كلها خطوط مستقيمة!»؛ يلمسه الطفل فتُلوَّن أجزاؤه المستقيمة جزءاً جزءاً. lines: [قول فوضى، الدعوة، ختام] */
SCENES.zigHook = async c => { const svg = newStage(230, { oasis: false, ground: 0 }), [l1, l2, l3] = c.lines, P = [[40, 170], [100, 70], [160, 170], [220, 70], [300, 150]], g = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg);
  el('path', { d: 'M' + P.map(p => p.join(' ')).join(' L'), fill: 'none', stroke: GEO.road, 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g); const fz = chaosAt(svg, 320, 40, .34); await chaosGiggle(fz); await S(l1);
  await answerWhile(l2, () => tapOne([{ g, k: 'z', label: labelText('geoRoad') }], { ok: 'z', pad: 60 })); fz.remove(); const COL = [css('--compass'), css('--think'), GEO.hl, css('--chaos')];
  for (let i = 0; i < P.length - 1; i++) { geoLine(svg, P[i][0], P[i][1], P[i + 1][0], P[i + 1][1], { color: COL[i], w: 5 }); SFX.tick(); await sleep(420); } logAttempt({ scene: 'hook', tag: 'zigHook', ok: true }); await S(l3); };
/* النملة: خط مغلق وخط فيه فتحة؛ يلمس الطفل كلاً منهما فتحاول النملة الخروج. c: figs [مغلق، مفتوح]، lines: [الدعوة، المغلق، المفتوح، ختام] */
SCENES.antEscape = async c => { const svg = newStage(220, { oasis: false, ground: 0 }), [l1, l2, l3, l4] = c.lines, X = [256, 104], F = [c.closed || 'ring', c.open || 'ringGap'];
  const G = F.map((n, i) => { const g = el('g', { transform: `translate(${X[i]} 110) scale(1.5)`, role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg); el('rect', { x: -48, y: -48, width: 96, height: 96, rx: 12, fill: GEO.paper, stroke: css('--line'), 'stroke-width': 1.6 }, g); LFIG[n].d(g); return g; });
  const ant = i => { const a = el('g', {}, svg); el('ellipse', { rx: 5, ry: 3.4, fill: '#3b2a20' }, a); el('circle', { cx: 6, r: 2.6, fill: '#3b2a20' }, a); a.setAttribute('transform', `translate(${X[i]} 114)`); return a; }, A = [ant(0), ant(1)]; S(l1, { free: true });
  for (const i of [0, 1]) { await tapOne([{ g: G[i], k: i, label: labelText(i ? 'geoOpenFig' : 'geoClosedFig') }], { ok: i, pad: 100, pulse: true }); if (i === 0) hush();
    if (i === 0) { for (const [dx, dy] of [[26, -10], [-24, 12], [14, 20], [0, 4]]) { await symTween(260, t => A[0].setAttribute('transform', `translate(${X[0] + dx * t} ${114 + dy * t})`)); SFX.tick(); } await S(l2); }
    else { await symTween(500, t => A[1].setAttribute('transform', `translate(${X[1] + 18 * t} ${114 - 44 * t})`)); await symTween(500, t => A[1].setAttribute('transform', `translate(${X[1] + 18 + 30 * t} ${70 - 50 * t})`)); SFX.pop(); await S(l3); } }
  logAttempt({ scene: c.s || 'explore', tag: 'antEscape', ok: true }); await S(l4); };
/* «صحّح لفوضى» بالرسوم: فوضى اختارت رسماً خاطئاً (C.says رقمه)؛ يختار الطفل الصحيح. C: pics، ask، find، after */
SCENES.chaosFig = async C => { const it = ITEM.figPick.make({ pics: C.pics, ask: C.ask, q: C.find }), svg = newStage(200, { oasis: false, ground: 0 }), G = C.pics.map((n, i) => lfigAt(svg, n, LINE_X3[i], 100)), fz = chaosAt(svg, LINE_X3[C.says] + 34, 46, .26); await chaosGiggle(fz); let tries = 0;
  while (true) { S(C.find, { free: true }); const k = await tapOne(G.map((g, i) => ({ g, k: i, label: labelText('geoFig') + ' ' + DG(i + 1) })), { ok: it.want, pad: 100 }); hush(); tries++; logAttempt({ scene: 'chaos', tag: 'find', ok: k === it.want, firstTry: tries === 1 }); if (k === it.want) break; SFX.soft(); await S('gen.pat.chaosNo'); if (tries >= 2) { const m = ITEM.figPick.aid(it, svg, G); await sleep(1400); m.remove(); } }
  SFX.good(); fz.remove(); okRing(svg, G[it.want], 2); if (C.after) await S(C.after); };
WRAP_ART.roadKinds = svg => { const g = el('g', {}, svg); el('path', { d: 'M60 90 H300', stroke: GEO.road, 'stroke-width': 7, 'stroke-linecap': 'round' }, g); el('path', { d: 'M60 140 C110 100 150 180 200 140 S270 110 300 140', fill: 'none', stroke: GEO.road, 'stroke-width': 7, 'stroke-linecap': 'round' }, g); el('path', { d: 'M60 196 L120 166 L180 196 L240 166 L300 190', fill: 'none', stroke: GEO.road, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g); anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200, fill: 'both' }); palmAt(svg, 330, 250, .7); palmAt(svg, 30, 250, .8); };
