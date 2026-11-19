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
  async ask(item, mode, tries) { const svg = newStage(270, { oasis: false, ground: 0 }), Gd = geoGrid(svg), [x, y] = Gd.P(item.r, item.u); ptAt(svg, x, y, item.name || 'a', { r: 7, lab: [item.r >= Gd.cols ? -14 : 14, item.u >= Gd.rows ? 22 : -10] }); let walk = null;   /* الحرف داخل المسرح عند الحافة */
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

/* =====================================================================
   الدرس 3: القطعة المستقيمة (C106 قياسها، C107 تسميتها بطرفيها، C114 أقصر مسافة بين نقطتين)
   ===================================================================== */
const SEGFIG = {
  tri: { pts: { a: [90, 176], b: [270, 176], j: [180, 56] }, segs: ['ab', 'bj', 'ja'], lab: { a: [-14, 8], b: [14, 8], j: [0, -12] } },
  zed: { pts: { a: [70, 66], b: [250, 66], j: [110, 176], d: [290, 176] }, segs: ['ab', 'bj', 'jd'], lab: { a: [0, -12], b: [0, -12], j: [0, 24], d: [0, 24] } },
  quad: { pts: { a: [84, 62], b: [270, 54], j: [290, 172], d: [72, 184] }, segs: ['ab', 'bj', 'jd', 'da'], lab: { a: [-10, -10], b: [10, -10], j: [14, 16], d: [-14, 16] } },
  fan: { pts: { a: [60, 182], b: [180, 46], j: [300, 182], d: [180, 182] }, segs: ['ab', 'bj', 'bd'], lab: { a: [-10, 20], b: [0, -12], j: [10, 20], d: [0, 24] } },
};
const segSame = (x, y) => x === y || x === y[1] + y[0];
function segFigAt(svg, name, o = {}) { const F = SEGFIG[name], G = {}; el('rect', { x: 20, y: 14, width: 320, height: 204, rx: 14, fill: GEO.paper, stroke: css('--line'), 'stroke-width': 2 }, svg);
  for (const sg of F.segs) { const P = F.pts[sg[0]], Q = F.pts[sg[1]], g = el('g', { 'data-seg': sg }, svg); geoLine(g, P[0], P[1], Q[0], Q[1], { color: 'transparent', w: 30 }); geoLine(g, P[0], P[1], Q[0], Q[1], { w: 4 }); if (o.ticks && o.ticks[sg]) geoObj(g, 'seg', P, Q, { ticks: o.ticks[sg], dots: false, color: 'transparent' }); G[sg] = g; }
  for (const [k, [x, y]] of Object.entries(F.pts)) ptAt(svg, x, y, k, { r: 5.5, lab: F.lab[k] }).setAttribute('pointer-events', 'none'); return { F, G }; }
/* ================= ⑤ المس القطعة المسمّاة (C107): fig، want حرفان بترتيب النطق (ب ج أو ج ب: القطعة نفسها) ================= */
ITEM.segTap = {
  make(spec) { return { ...spec, tag: 'seg-tap' }; },
  async ask(item, mode, tries) { const svg = newStage(232, { oasis: false, ground: 0 }), { F, G } = segFigAt(svg, item.fig), keys = F.segs, hit = keys.find(k => segSame(k, item.want)); let done = false;
    if (tries >= 3) { const m = helpG(svg); for (const k of item.want) { const [x, y] = F.pts[k]; el('circle', { cx: x, cy: y, r: 13, fill: 'none', stroke: css('--think'), 'stroke-width': 2.5, 'stroke-dasharray': '4 3' }, m); } }   /* الحلّ المشترك: الطرفان محاطان، واللمس للطفل */
    const askQ = async () => { await S(tries >= 3 ? 'gen.geo.together.seg' : (item.q || 'gen.geo.tapSeg'), { noGap: true }); for (const [i, k] of [...item.want].entries()) await sayLtr(k, i ? {} : { noGap: true }); }; askQ(); REPLAY_HOOK = () => askQ(); REPLAY_HOOK.live = () => !done && svg.isConnected;
    const k = await tapOne(keys.map(sg => ({ g: G[sg], k: sg, label: labelText('geoSeg') + ' ' + LTR[sg[0]] + ' ' + LTR[sg[1]] })), { ok: hit, pad: 56 }); done = true; REPLAY_HOOK = null; hush(); return { ans: k, ctx: { svg, G, hit } }; },
  judge(item, k) { return segSame(k, item.want) ? { ok: true } : { ok: false, err: k.includes(item.want[0]) || k.includes(item.want[1]) ? 'segOneEnd' : 'segName' }; },
  mark(r, k, col) { for (const l of r.ctx.G[k].querySelectorAll('line')) if (l.getAttribute('stroke') !== 'transparent') { l.setAttribute('stroke', col); l.setAttribute('stroke-width', 6); } },
  onOk(item, r) { SFX.good(); this.mark(r, r.ans, GEO.hl); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const F = SEGFIG[item.fig], m = helpG(r.ctx.svg); for (const k of item.want) { const [x, y] = F.pts[k]; el('circle', { cx: x, cy: y, r: 13, fill: 'none', stroke: css('--think'), 'stroke-width': 2.5 }, m); } await sleep(1400); m.remove(); }, async together() {},
  async reveal(item, r) { this.mark(r, r.ctx.hit, GEO.hl); await S('gen.geo.reveal.seg2'); },
  praise: () => 'praiseLook', twin(item) { return item.twin || null; },
};
/* ---------- ثلاثة طرق بين نقطتين: واحد مستقيم (رقمه st)، وواحد منحنٍ، وواحد منكسر ---------- */
function roads3At(svg, st, v = 0) { const A = [56, 116], B = [304, 116], G = []; el('rect', { x: 20, y: 14, width: 320, height: 204, rx: 14, fill: '#eef3e6', stroke: css('--line'), 'stroke-width': 2 }, svg);
  const ST = 'M56 116 L304 116', CU = 'M56 116 C120 6 240 6 304 116', CD = 'M56 116 C120 226 240 226 304 116', BU = 'M56 116 L110 56 L180 100 L250 50 L304 116', BD = 'M56 116 L120 190 L190 146 L250 196 L304 116';
  const CU2 = 'M56 116 C100 40 260 60 304 116', CD2 = 'M56 116 C90 190 270 170 304 116', BU2 = 'M56 116 L150 40 L304 116', BD2 = 'M56 116 L200 200 L304 116';
  /* v: 0 منحنٍ ومنكسر، 1 منحنيان، 2 منكسران؛ والمستقيم بينهما دائماً */
  const up = v === 3 ? BU2 : v === 2 ? BU : CU, dn = v === 3 ? CD2 : v === 2 ? BD2 : v === 1 ? CD2 : BD, up2 = v === 3 ? CU2 : v === 2 ? BU2 : v === 1 ? CU2 : BU, dn2 = v === 3 ? BD2 : v === 2 ? BD : CD;   /* 3: منكسر فوق ومنحنٍ تحت */
  const list = st === 0 ? [ST, up, dn] : st === 1 ? [up, ST, dn] : [up2, dn2, ST];
  list.forEach((d, i) => { const g = el('g', { 'data-road': i }, svg); el('path', { d, fill: 'none', stroke: 'transparent', 'stroke-width': 30 }, g); el('path', { d, fill: 'none', stroke: GEO.road, 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g); G.push(g); });
  for (const [P, home] of [[A, true], [B, false]]) { const g = el('g', { 'pointer-events': 'none' }, svg); el('circle', { cx: P[0], cy: P[1], r: 13, fill: '#fffdf6', stroke: GEO.ink, 'stroke-width': 2.5 }, g); if (home) el('path', { d: `M${P[0] - 7} ${P[1] + 6} V${P[1] - 2} L${P[0]} ${P[1] - 8} L${P[0] + 7} ${P[1] - 2} V${P[1] + 6} Z`, fill: css('--chaos') }, g); else el('rect', { x: P[0] - 7, y: P[1] - 6, width: 14, height: 12, fill: css('--compass') }, g); }
  return { G, want: st }; }
/* ================= ⑥ أيّ الطرق أقصر؟ (C114): st موضع الطريق المستقيم (0 الأول، 1 الأوسط، 2 الأخير) ================= */
ITEM.pathShort = {
  make(spec) { return { ...spec, tag: 'path-short' }; },
  async ask(item, mode, tries) { const svg = newStage(232, { oasis: false, ground: 0 }), R3 = roads3At(svg, item.st, item.v || 0);
    if (tries >= 3) { const m = helpG(svg), p = R3.G[R3.want].querySelectorAll('path')[1]; el('path', { d: p.getAttribute('d'), fill: 'none', stroke: css('--think'), 'stroke-width': 2, 'stroke-dasharray': '5 4', transform: 'translate(0 -9)' }, m); }   /* الحلّ المشترك: خيط مشدود مرسوم فوق أحد الطرق، والاختيار للطفل */
    say(...lineOf(tries >= 3 ? 'gen.geo.together.short' : item.q), { free: true });
    const k = await tapOne(R3.G.map((g, i) => ({ g, k: i, label: labelText('geoRoad') + ' ' + DG(i + 1) })), { ok: R3.want, pad: 56 }); hush(); return { ans: k, ctx: { svg, R3 } }; },
  judge(item, k) { return k === item.st ? { ok: true } : { ok: false, err: 'pathNotStraight' }; },
  paint(r, k, col) { r.ctx.R3.G[k].querySelectorAll('path')[1].setAttribute('stroke', col); },
  onOk(item, r) { SFX.good(); this.paint(r, r.ans, GEO.hl); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const p = r.ctx.R3.G[r.ctx.R3.want].querySelectorAll('path')[1], m = helpG(r.ctx.svg); el('path', { d: p.getAttribute('d'), fill: 'none', stroke: css('--think'), 'stroke-width': 2, 'stroke-dasharray': '5 4', transform: 'translate(0 -9)' }, m); await sleep(1400); m.remove(); }, async together() {},
  async reveal(item, r) { this.paint(r, r.ctx.R3.want, GEO.hl); await S('gen.geo.reveal.short'); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};
/* ---------- مشاهد الدرس 3 ---------- */
/* الخيط المشدود: دبّوسان وخيط مرتخٍ بينهما؛ يلمسه الطفل فيُشدّ. lines: [الدعوة، بعد الشدّ] */
SCENES.tautString = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), [l1, l2] = c.lines, A = [60, 120], B = [300, 120]; el('rect', { x: 20, y: 14, width: 320, height: 204, rx: 14, fill: GEO.paper, stroke: css('--line'), 'stroke-width': 2 }, svg);
  const g = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg), hitp = el('path', { fill: 'none', stroke: 'transparent', 'stroke-width': 40 }, g), p = el('path', { fill: 'none', stroke: GEO.road, 'stroke-width': 5, 'stroke-linecap': 'round' }, g), set = t => { const d = `M${A[0]} ${A[1]} C${130} ${120 + 90 * t} ${230} ${120 - 80 * t} ${B[0]} ${B[1]}`; p.setAttribute('d', d); hitp.setAttribute('d', d); }; set(1);
  ptAt(svg, A[0], A[1], 'a', { r: 6, lab: [0, -14] }); ptAt(svg, B[0], B[1], 'b', { r: 6, lab: [0, -14] });
  await answerWhile(l1, () => tapOne([{ g, k: 's', label: labelText('rulString') }], { ok: 's', pad: 60 })); await symTween(900, t => set(1 - t)); set(0); SFX.good(); logAttempt({ scene: c.s || 'hook', tag: 'tautString', ok: true }); await S(l2); };
/* اسم القطعة: يلمسها الطفل فتدور نصف دورة ويتبادل الطرفان موضعيهما: القطعة هي هي. lines: [الاسم، الدعوة، ختام] */
SCENES.segNameShow = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), [l1, l2, l3] = c.lines; el('rect', { x: 20, y: 14, width: 320, height: 204, rx: 14, fill: GEO.paper, stroke: css('--line'), 'stroke-width': 2 }, svg);
  const g = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg), inner = el('g', {}, g); geoLine(inner, 80, 140, 280, 90, { color: 'transparent', w: 36 }); geoLine(inner, 80, 140, 280, 90, { w: 4 }); const pa = ptAt(svg, 80, 140, 'a', { r: 6, lab: [0, -14] }), pb = ptAt(svg, 280, 90, 'b', { r: 6, lab: [0, -14] });
  await S(l1, { noGap: true }); await sayLtr('a', { noGap: true }); await sayLtr('b');
  await answerWhile(l2, () => tapOne([{ g, k: 's', label: labelText('geoSeg') }], { ok: 's', pad: 60 })); pa.remove(); pb.remove(); const pts = el('g', {}, svg); await symTween(900, t => { inner.setAttribute('transform', `rotate(${180 * t} 180 115)`); });
  ptAt(pts, 80, 140, 'b', { r: 6, lab: [0, -14] }); ptAt(pts, 280, 90, 'a', { r: 6, lab: [0, -14] }); SFX.pop(); logAttempt({ scene: c.s || 'explore', tag: 'segName', ok: true }); await S('gen.geo.seg', { noGap: true }); await sayLtr('b', { noGap: true }); await sayLtr('a'); await S(l3); };
/* «صحّح لفوضى» ببندٍ من البنود: فوضى على المسرح، والطفل يحلّ البند حتى يصيب. C: item (مواصفة البند، وq جملة فوضى)، after */
SCENES.chaosItem = async C => { const def = ITEM[C.item.t], it = def.make({ ...C.item, q: C.find }); let tries = 0;
  if (C.lines) { const svg = newStage(232, { oasis: false, ground: 0 }), fz = chaosAt(svg, 180, 120, .6); await chaosGiggle(fz); await S(C.lines); }   /* قول فوضى أولاً (حين يكون المشهد إشعالاً) */
  while (true) { const p = def.ask(it, 'chaos', tries >= 2 ? 3 : 0), svg = $('#stage svg'); if (tries === 0 && svg) { const fz = chaosAt(svg, 334, 30, .28); chaosGiggle(fz); }
    const r = await p, ok = def.judge(it, r.ans, r).ok; tries++; logAttempt({ scene: 'chaos', tag: 'find', ok, firstTry: tries === 1 }); document.querySelectorAll('#stage .choices').forEach(b => b.remove()); if (ok) { if (def.onOk) await def.onOk(it, r); else SFX.good(); break; } SFX.soft(); await S('gen.pat.chaosNo'); }
  if (C.after) await S(C.after); };
SCENES.recallSeg = async c => { const svg = newStage(232, { oasis: false, ground: 0 }); segFigAt(svg, c.fig || 'tri'); await sleep(300); await S(c.lines); };
SCENES.recallRoads = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), R3 = roads3At(svg, c.st ?? 1, c.v || 0); await sleep(400); R3.G[R3.want].querySelectorAll('path')[1].setAttribute('stroke', GEO.hl); await S(c.lines); };
WRAP_ART.segRoad = svg => { const g = el('g', {}, svg); el('rect', { x: 60, y: 60, width: 240, height: 130, rx: 14, fill: '#eef3e6', stroke: css('--line'), 'stroke-width': 2 }, g); geoObj(g, 'seg', [90, 150], [270, 100], { names: ['a', 'b'], labP: [0, -12], labQ: [0, -12], w: 5, color: GEO.road }); anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200, fill: 'both' }); palmAt(svg, 330, 250, .7); palmAt(svg, 30, 250, .8); };

/* =====================================================================
   الدرس 4: القطع المتساوية وعلاماتها (C108)، ونقطة المنتصف (C109)
   ===================================================================== */
Object.assign(SEGFIG, {
  rectF: { pts: { a: [80, 62], b: [280, 62], j: [280, 172], d: [80, 172] }, segs: ['ab', 'bj', 'jd', 'da'], lab: { a: [-10, -10], b: [10, -10], j: [12, 18], d: [-12, 18] } },
  kiteF: { pts: { a: [180, 34], b: [262, 100], j: [180, 204], d: [98, 100] }, segs: ['ab', 'bj', 'jd', 'da'], lab: { a: [0, -10], b: [14, 4], j: [0, 0], d: [-14, 4] } },
  isoF: { pts: { a: [90, 180], b: [270, 180], j: [180, 52] }, segs: ['ab', 'bj', 'ja'], lab: { a: [-12, 12], b: [12, 12], j: [0, -12] } },
});
SEGFIG.kiteF.lab.j = [16, 10];
SEGFIG.paraF = { pts: { a: [110, 62], b: [290, 62], j: [250, 172], d: [70, 172] }, segs: ['ab', 'bj', 'jd', 'da'], lab: { a: [-10, -10], b: [10, -10], j: [12, 18], d: [-12, 18] } };
/* ================= ⑦ أيّ قطعة تساوي القطعة المعلَّمة؟ (C108): fig، ticks { قطعة: عدد الشرطات }، ref القطعة المسؤول عنها ================= */
ITEM.tickMatch = {
  make(spec) { const want = Object.keys(spec.ticks).find(k => k !== spec.ref && spec.ticks[k] === spec.ticks[spec.ref]); return { ...spec, want, tag: 'tick-match' }; },
  async ask(item, mode, tries) { const svg = newStage(232, { oasis: false, ground: 0 }), { F, G } = segFigAt(svg, item.fig, { ticks: item.ticks }), others = F.segs.filter(k => k !== item.ref); ITEM.segTap.mark({ ctx: { G } }, item.ref, css('--compass')); let done = false;
    if (tries >= 3) { const m = helpG(svg), P = F.pts[item.ref[0]], Q = F.pts[item.ref[1]]; el('circle', { cx: (P[0] + Q[0]) / 2, cy: (P[1] + Q[1]) / 2, r: 17, fill: 'none', stroke: css('--think'), 'stroke-width': 2.5, 'stroke-dasharray': '4 3' }, m); }   /* الحلّ المشترك: شرطات القطعة المسؤول عنها محاطة، والبحث عن مثلها للطفل */
    const askQ = async () => { await S(tries >= 3 ? 'gen.geo.together.tick' : (item.q || 'gen.geo.tickQ'), { noGap: true }); for (const [i, k] of [...item.ref].entries()) await sayLtr(k, i ? {} : { noGap: true }); }; askQ(); REPLAY_HOOK = () => askQ(); REPLAY_HOOK.live = () => !done && svg.isConnected;
    const k = await tapOne(others.map(sg => ({ g: G[sg], k: sg, label: labelText('geoSeg') + ' ' + LTR[sg[0]] + ' ' + LTR[sg[1]] })), { ok: item.want, pad: 56 }); done = true; REPLAY_HOOK = null; hush(); return { ans: k, ctx: { svg, G } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'tickWrong' }; },
  onOk(item, r) { SFX.good(); ITEM.segTap.mark(r, r.ans, GEO.hl); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const F = SEGFIG[item.fig], m = helpG(r.ctx.svg); for (const sg of [item.ref, item.want]) { const P = F.pts[sg[0]], Q = F.pts[sg[1]]; el('circle', { cx: (P[0] + Q[0]) / 2, cy: (P[1] + Q[1]) / 2, r: 17, fill: 'none', stroke: css('--think'), 'stroke-width': 2.5 }, m); } await sleep(1500); m.remove(); }, async together() {},
  async reveal(item, r) { ITEM.segTap.mark(r, item.want, GEO.hl); await S('gen.geo.reveal.tick'); },
  praise: () => 'praiseLook', twin(item) { return item.twin || null; },
};
/* ================= ⑧ ضع نقطة المنتصف (C109، إنتاج): len طول القطعة (سم). يسحب الطفل النقطة م على القطعة، وزرّان للمليمتر ================= */
ITEM.midMark = {
  make(spec) { const a = spec.a || 0; return { ...spec, a, want: a * 10 + spec.len * 5, tag: 'mid-mark' + (a ? '-off' : '') }; },   /* a: القطعة تبدأ عند a سم لا عند الصفر */
  async ask(item, mode, tries) { const svg = newStage(290, { oasis: false, ground: 0 }), y = 196, R = rulerAt(svg, { x: 30, y, pxcm: 30, from: 0, to: 10, mm: false }), A0 = item.a * 10, L = A0 + item.len * 10; let v = item.start ?? Math.max(A0 + 5, Math.min(L - 5, Math.round(A0 + item.len * 3))), Ln = null;
    geoObj(svg, 'seg', [R.X(item.a), y - 12], [R.X(item.a + item.len), y - 12], { names: item.names || ['a', 'b'], labP: [0, -12], labQ: [0, -12] });
    const tip = el('g', { 'pointer-events': 'none' }, svg); el('circle', { r: 9, fill: css('--chaos'), stroke: '#fff', 'stroke-width': 2.5 }, tip); const tl = el('text', { y: -14, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: css('--chaos') }, tip); tl.textContent = LTR.m;
    const parts = el('g', { 'pointer-events': 'none' }, svg);
    if (tries >= 3) { const g = helpG(svg); for (const [a, b] of [[0, .5], [.5, 1]]) el('path', { d: `M${R.X(item.a + item.len * a)} ${y - 44} Q${R.X(item.a + item.len * (a + b) / 2)} ${y - 70} ${R.X(item.a + item.len * b)} ${y - 44}`, fill: 'none', stroke: css('--think'), 'stroke-width': 2.4, 'stroke-dasharray': '5 4' }, g); }   /* الحلّ المشترك: قوسان متساويان فوق القطعة، والسحب للطفل */
    const set = n => { v = Math.max(A0, Math.min(L, Math.round(n))); tip.setAttribute('transform', `translate(${R.X(v / 10)} ${y - 12})`); if (Ln) Ln.remove(); Ln = rulerLens(svg, R, v / 10, { y: 16, cx: 180 }); /*T*/window.__midV = v;/*/T*/ }; set(v);
    say(...lineOf(tries >= 3 ? 'gen.geo.together.mid' : item.q), { free: true });
    const input = fingerInput(svg, { map: e => { const q = svgPoint(svg, e); return [q.x, q.y]; }, down(q) { if (q[1] < y - 50 || q[1] > y + RUL_H + 6) return false; set((q[0] - R.X(0)) / 3); }, move(q) { set((q[0] - R.X(0)) / 3); }, up() {} });
    /*T*/window.__midWant = item.want; window.__midAt = n => { const m = svg.getScreenCTM(); return { x: m.a * R.X(n / 10) + m.e, y: m.d * (y - 12) + m.f }; };/*/T*/
    const nudge = rulNudges(svg, 262, s => set(v + s), ['rulLeft', 'rulRight']); AUTO({ kind: 'midMark', ok: () => { set(item.want); rulDoneBtn().click(); }, wrong: () => { set(item.want + (item.want + 12 <= L ? 12 : -12)); rulDoneBtn().click(); } });
    await rulDone(() => { input.off(); nudge.forEach(b => b.remove()); }); return { ans: v, ctx: { svg, R, set, y } }; },
  judge(item, v) { return Math.abs(v - item.want) <= 1 ? { ok: true } : { ok: false, err: Math.abs(v - item.want) <= 15 ? 'midEye' : 'midOff' }; },
  show(item, r) { const { svg, R, y } = r.ctx, g = helpG(svg); for (const [a, b] of [[0, .5], [.5, 1]]) el('path', { d: `M${R.X(item.a + item.len * a)} ${y - 44} Q${R.X(item.a + item.len * (a + b) / 2)} ${y - 70} ${R.X(item.a + item.len * b)} ${y - 44}`, fill: 'none', stroke: GEO.hl, 'stroke-width': 2.6 }, g); return g; },
  onOk(item, r) { SFX.good(); r.ctx.set(item.want); this.show(item, r); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const g = this.show(item, r); await sleep(1400); g.remove(); }, async together() {},
  async reveal(item, r) { const a = r.ans; await symTween(700, t => r.ctx.set(a + (item.want - a) * t)); r.ctx.set(item.want); this.show(item, r); await S('gen.geo.reveal.mid'); },
  praise: () => 'praiseMeasure', twin(item) { return item.twin || null; },
};
/* ================= ⑨ هل م منتصف القطعة؟ (C109): l وr طولا الجزأين بالسنتيمتر مكتوبان على الرسم ================= */
ITEM.midJudge = {
  make(spec) { return { ...spec, want: spec.l === spec.r ? 'yes' : 'no', tag: 'mid-judge' }; },
  draw(item, svg) { const k = 30, x0 = 180 - (item.l + item.r) * k / 2, y = 120, xm = x0 + item.l * k, x1 = x0 + (item.l + item.r) * k; el('rect', { x: 20, y: 14, width: 320, height: 204, rx: 14, fill: GEO.paper, stroke: css('--line'), 'stroke-width': 2 }, svg);
    geoObj(svg, 'seg', [x0, y], [x1, y], { names: ['a', 'b'], labP: [0, -14], labQ: [0, -14] }); ptAt(svg, xm, y, 'm', { r: 6, color: css('--chaos'), lab: [0, -14] });
    for (const [xa, xb, n] of [[x0, xm, item.l], [xm, x1, item.r]]) { el('path', { d: `M${xa + 3} ${y + 14} v8 H${xb - 3} v-8`, fill: 'none', stroke: GEO.soft, 'stroke-width': 2 }, svg); const t = el('text', { x: (xa + xb) / 2, y: y + 46, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: GEO.ink }, svg); t.textContent = DG(n) + ' ' + labelText('rulCm'); } },
  async ask(item, mode, tries) { const svg = newStage(232, { oasis: false, ground: 0 }); this.draw(item, svg); await S(tries >= 3 ? 'gen.geo.together.midJ' : item.q); const k = await choosePick([['yes', labelText('yes')], ['no', labelText('no')]], item.want); return { ans: k, ctx: { svg } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'midJudgeWrong' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); }, async hint2() { await S('gen.geo.hint.midJ'); }, async together() {},
  async reveal(item) { await S(item.want === 'yes' ? 'gen.geo.reveal.midYes' : 'gen.geo.reveal.midNo'); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};
/* ================= ⑩ قطعة طولها len: كم يبعد منتصفها عن طرفها؟ (C109) ================= */
ITEM.halfLen = { ...numItem,
  make(spec) { const w = spec.len / 2; return { ...spec, want: w, nums: rulNear(w, spec.len, w + 1, w - 1), tag: 'half-len' }; },
  async ask(item, mode, tries) { const svg = newStage(214, { oasis: false, ground: 0 }), it = ITEM.rulerRead.make({ b: item.len, thing: ['a', 'b'] }), R = ITEM.rulerRead.draw(it, svg); let hops = null;
    if (tries >= 3) { await S('gen.geo.together.half'); hops = await rulerHops(svg, R, 0, item.len / 2, { silent: true }); ptAt(svg, R.X(item.len / 2), 118, 'm', { r: 6, color: css('--chaos'), lab: [0, -14] }); } else await S(item.q);
    const np = numberPick(shuffle(item.nums), item.want, { digits: true, west: true }); return { ans: await np.p, ctx: { svg, np, R, hops } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: k === item.len ? 'halfWhole' : 'halfWrong' }; },
  async hint2(item, r) { const g = ptAt(r.ctx.svg, r.ctx.R.X(item.len / 2), 118, 'm', { r: 6, color: css('--chaos'), lab: [0, -14] }); await sleep(1300); g.remove(); }, async together() {},
  async reveal(item, r) { ptAt(r.ctx.svg, r.ctx.R.X(item.len / 2), 118, 'm', { r: 6, color: css('--chaos'), lab: [0, -14] }); r.ctx.R.mark(item.len / 2); await sayLen(item.want); },
  praise: () => 'praiseMeasure', twin(item) { return item.twin || null; },
};
/* ---------- مشاهد الدرس 4 ---------- */
/* علامات التساوي: مستطيل، يلمس الطفل كل ضلع فتظهر شرطاته (المتساويان بالعدد نفسه). c: fig، ticks، order، lines: [الدعوة، بعد الزوج الأول، ختام] */
SCENES.ticksShow = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), { F, G } = segFigAt(svg, c.fig || 'rectF'), [l1, l2, l3] = c.lines, order = c.order || ['ab', 'jd', 'bj', 'da']; S(l1, { free: true });
  for (const [i, sg] of order.entries()) { await tapOne([{ g: G[sg], k: sg, label: labelText('geoSeg') + ' ' + LTR[sg[0]] + ' ' + LTR[sg[1]] }], { ok: sg, pad: 56, pulse: true }); if (i === 0) hush(); geoObj(svg, 'seg', F.pts[sg[0]], F.pts[sg[1]], { ticks: c.ticks[sg], dots: false, color: 'transparent' }); SFX.tick(); if (i === 1) await S(l2); }
  logAttempt({ scene: c.s || 'explore', tag: 'ticksShow', ok: true }); await S(l3); };
/* طيّ الشريط: شريط ورقي طرفاه أ وب؛ يلمسه الطفل فيُطوى حتى ينطبق الطرفان، ثم يُفتح وعند خط الطيّ النقطة م. c: len، lines: [الدعوة، بعد الطيّ، بعد الفتح والقياس] */
SCENES.foldStrip = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), [l1, l2, l3] = c.lines, L = c.len || 8, k = 30, x0 = 180 - L * k / 2, y = 96, xm = 180; el('rect', { x: 20, y: 14, width: 320, height: 204, rx: 14, fill: GEO.paper, stroke: css('--line'), 'stroke-width': 2 }, svg);
  const g = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg), left = el('rect', { x: x0, y: y - 14, width: L * k / 2, height: 28, fill: '#f6d98a', stroke: '#c9a54a', 'stroke-width': 2 }, g), right = el('rect', { x: xm, y: y - 14, width: L * k / 2, height: 28, fill: '#f6d98a', stroke: '#c9a54a', 'stroke-width': 2 }, g);
  const pa = ptAt(svg, x0, y, 'a', { r: 5, lab: [0, -22] }), pb = ptAt(svg, x0 + L * k, y, 'b', { r: 5, lab: [0, -22] });
  await answerWhile(l1, () => tapOne([{ g, k: 's', label: labelText('geoStrip') }], { ok: 's', pad: 60 }));
  await symTween(900, t => { const sx = 1 - 2 * t; right.setAttribute('transform', `translate(${xm} 0) scale(${sx} 1) translate(${-xm} 0)`); pb.setAttribute('transform', `translate(${-L * k * t} 0)`); }); SFX.pop(); await S(l2);
  await symTween(700, t => { const sx = -1 + 2 * t; right.setAttribute('transform', `translate(${xm} 0) scale(${sx} 1) translate(${-xm} 0)`); pb.setAttribute('transform', `translate(${-L * k * (1 - t)} 0)`); }); right.removeAttribute('transform'); pb.removeAttribute('transform');
  geoLine(svg, xm, y - 14, xm, y + 14, { color: css('--chaos'), w: 2.4, dash: '4 3' }); ptAt(svg, xm, y, 'm', { r: 6, color: css('--chaos'), lab: [0, -22] });
  for (const [xa, xb] of [[x0, xm], [xm, x0 + L * k]]) { el('path', { d: `M${xa + 3} ${y + 26} v8 H${xb - 3} v-8`, fill: 'none', stroke: GEO.soft, 'stroke-width': 2 }, svg); const t = el('text', { x: (xa + xb) / 2, y: y + 58, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: GEO.ink }, svg); t.textContent = DG(L / 2) + ' ' + labelText('rulCm'); }
  SFX.good(); logAttempt({ scene: c.s || 'explore', tag: 'foldStrip', ok: true }); await S(l3); };
SCENES.recallTicks = async c => { const svg = newStage(232, { oasis: false, ground: 0 }); segFigAt(svg, c.fig || 'rectF', { ticks: c.ticks || { ab: 1, jd: 1, bj: 2, da: 2 } }); await sleep(300); await S(c.lines); };
SCENES.recallMid = async c => { const svg = newStage(232, { oasis: false, ground: 0 }); ITEM.midJudge.draw({ l: c.l || 4, r: c.r || 4 }, svg); await sleep(300); await S(c.lines); };
WRAP_ART.restStop = svg => { const g = el('g', {}, svg); el('rect', { x: 60, y: 70, width: 240, height: 110, rx: 14, fill: '#eef3e6', stroke: css('--line'), 'stroke-width': 2 }, g); geoObj(g, 'seg', [90, 130], [270, 130], { w: 5, color: GEO.road }); el('circle', { cx: 180, cy: 130, r: 12, fill: css('--chaos'), stroke: '#fff', 'stroke-width': 3 }, g); el('path', { d: 'M168 118 L180 102 L192 118 Z', fill: css('--compass') }, g); anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200, fill: 'both' }); palmAt(svg, 330, 250, .7); palmAt(svg, 30, 250, .8); };

/* =====================================================================
   الدرس 5: الشعاع وتسميته المرتّبة (C110): البداية أولاً
   ===================================================================== */
const RAYPTS = { v: { a: [180, 186], b: [180, 96] }, vj: { j: [170, 60], d: [170, 150] }, h: { a: [90, 150], b: [230, 150] }, up: { a: [100, 180], b: [220, 100] }, dn: { a: [110, 70], b: [230, 150] }, hj: { j: [100, 120], d: [250, 120] }, upj: { j: [260, 180], d: [150, 90] }, dnj: { j: [250, 70], d: [130, 150] } };
const rayEdge = (P, Q) => { const dx = Q[0] - P[0], dy = Q[1] - P[1]; let t = 1e9; for (const [v, d, lo, hi] of [[P[0], dx, 30, 330], [P[1], dy, 26, 206]]) { if (d > 0) t = Math.min(t, (hi - v) / d); else if (d < 0) t = Math.min(t, (lo - v) / d); } return [P[0] + dx * t, P[1] + dy * t]; };
function rayFrame(svg) { return el('rect', { x: 20, y: 14, width: 320, height: 204, rx: 14, fill: GEO.paper, stroke: css('--line'), 'stroke-width': 2 }, svg); }
function rayLineAt(parent, P, Q, col) { const E = rayEdge(P, Q), g = el('g', { 'pointer-events': 'none' }, parent); geoLine(g, P[0], P[1], E[0], E[1], { color: col, w: 4 }); geoArrow(g, E[0], E[1], Math.atan2(Q[1] - P[1], Q[0] - P[0]) * 180 / Math.PI, col, 11); return g; }
/* ================= ⑪ ارسم الشعاع (C110، إنتاج): pts مجموعة نقاط (RAYPTS)، want حرفان: البداية ثم النقطة التي يمرّ بها ================= */
ITEM.rayDraw = {
  make(spec) { return { ...spec, tag: 'ray-draw' }; },
  async ask(item, mode, tries) { const svg = newStage(232, { oasis: false, ground: 0 }), PT = RAYPTS[item.pts], keys = Object.keys(PT); rayFrame(svg); let done = false;
    const G = {}; for (const k of keys) { const g = el('g', {}, svg); ptAt(g, PT[k][0], PT[k][1], k, { r: 7, lab: [0, -16] }); G[k] = g; }
    if (tries >= 3) { const m = helpG(svg), [x, y] = PT[item.want[0]]; el('circle', { cx: x, cy: y, r: 15, fill: 'none', stroke: css('--think'), 'stroke-width': 2.5, 'stroke-dasharray': '4 3' }, m); }   /* الحلّ المشترك: نقطة البداية محاطة، واللمس للطفل */
    const askQ = async () => { await S(tries >= 3 ? 'gen.geo.together.ray' : (item.q || 'gen.geo.rayQ'), { noGap: true }); for (const [i, k] of [...item.want].entries()) await sayLtr(k, i ? {} : { noGap: true }); }; askQ(); REPLAY_HOOK = () => askQ(); REPLAY_HOOK.live = () => !done && svg.isConnected;
    const t = k => ({ g: G[k], k, label: labelText('geoPoint') + ' ' + LTR[k] }), p1 = await tapOne(keys.map(t), { ok: item.want[0], pad: 64 }); hush(); el('circle', { cx: PT[p1][0], cy: PT[p1][1], r: 12, fill: 'none', stroke: css('--compass'), 'stroke-width': 3, 'pointer-events': 'none' }, svg); SFX.tick();
    const p2 = await tapOne(keys.filter(k => k !== p1).map(t), { ok: item.want[1], pad: 64, kind: 'rayTo' }); done = true;   /* kind آخر: مرحلتان لا محاولتان (عدّاد الفحص) */ REPLAY_HOOK = null; rayLineAt(svg, PT[p1], PT[p2], css('--compass')); return { ans: p1 + p2, ctx: { svg, PT } }; },
  judge(item, a) { return a === item.want ? { ok: true } : { ok: false, err: a === item.want[1] + item.want[0] ? 'rayReversed' : 'rayWrong' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const m = helpG(r.ctx.svg), [x, y] = r.ctx.PT[item.want[0]]; el('circle', { cx: x, cy: y, r: 15, fill: 'none', stroke: css('--think'), 'stroke-width': 2.5 }, m); await sleep(1400); m.remove(); }, async together() {},
  async reveal(item, r) { rayLineAt(r.ctx.svg, r.ctx.PT[item.want[0]], r.ctx.PT[item.want[1]], GEO.hl); await S('gen.geo.reveal.rayDraw'); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};
/* ================= ⑫ ما اسم هذا الرسم؟ (C107، C110، C111): kind seg | ray | line، pts، from وto (بترتيب الرسم). الخيارات ثلاث بطاقات مكتوبة ================= */
ITEM.geoName = {
  make(spec) { const a = spec.from, b = spec.to, opts = spec.kind === 'ray' ? [['ray', a + b, true], ['ray', b + a], ['seg', a + b]] : spec.kind === 'line' ? [['line', a + b, true], ['ray', a + b], ['seg', a + b]] : [['seg', a + b, true], ['ray', a + b], ['line', a + b]]; return { ...spec, opts, tag: 'geo-name-' + spec.kind }; },
  draw(item, svg) { const PT = RAYPTS[item.pts], P = PT[item.from], Q = PT[item.to]; rayFrame(svg); if (item.kind === 'ray') rayLineAt(svg, P, Q, GEO.ink); else if (item.kind === 'line') { rayLineAt(svg, P, Q, GEO.ink); rayLineAt(svg, Q, P, GEO.ink); } else geoLine(svg, P[0], P[1], Q[0], Q[1], { w: 4 }); for (const k of [item.from, item.to]) ptAt(svg, PT[k][0], PT[k][1], k, { r: 7, lab: [0, -16] }); },
  async ask(item) { const svg = newStage(232, { oasis: false, ground: 0 }); this.draw(item, svg); await S(item.q); const cp = cardPick(item.opts.map(([k, nm, ok], i) => ({ id: `gen.nm.${k}.${nm}`, k: 'o' + i, ok: !!ok })), { intro: item.q }), c = await cp.p; cp.done(); return { ans: c.ok ? 'ok' : c.k, ctx: { svg, cp, c } }; },
  judge(item, a) { return a === 'ok' ? { ok: true } : { ok: false, err: item.kind === 'ray' && a === 'o1' ? 'rayReversed' : 'segRayLine' }; },
  onOk(item, r) { SFX.good(); r.ctx.cp.btns.find(b => b.dataset.k === r.ctx.c.k).classList.add('ok'); }, onWrong(item, r) { SFX.soft(); r.ctx.cp.btns.find(b => b.dataset.k === r.ctx.c.k).classList.add('no'); },
  mark(item, r) { const b = r.ctx.cp.btns.find(x => x.dataset.k === 'o0'); if (b) b.classList.add('ok'); },
  async hint2(item) { await S(item.kind === 'ray' ? 'gen.geo.hint.rayName' : 'gen.geo.hint.name'); }, async together() {},
  async reveal(item, r) { this.mark(item, r); await S(`gen.nm.${item.opts[0][0]}.${item.opts[0][1]}`); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};
/* ================= ⑬ أيّ نجمة يضيئها الشعاع؟ (C110): ang اتجاه الشعاع بالدرجات. نجمة على امتداده، ونجمة خلف بدايته، ونجمة خارج خطّه ================= */
function rayStarGeo(ang) { const a = ang * Math.PI / 180, u = [Math.cos(a), -Math.sin(a)], n = [-u[1], u[0]], C = [180, 116], A = [C[0] - u[0] * 60, C[1] - u[1] * 60], B = [A[0] + u[0] * 62, A[1] + u[1] * 62];
  return { A, B, S: [[A[0] + u[0] * 150, A[1] + u[1] * 150], [A[0] - u[0] * 52, A[1] - u[1] * 52], [A[0] + u[0] * 96 + n[0] * 58, A[1] + u[1] * 96 + n[1] * 58]] }; }
const starPath = (x, y, r) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; d += (i ? 'L' : 'M') + (x + rr * Math.cos(a)).toFixed(1) + ' ' + (y + rr * Math.sin(a)).toFixed(1); } return d + 'Z'; };
ITEM.rayStar = {
  make(spec) { const ord = spec.ord || [0, 1, 2]; return { ...spec, ord, want: ord.indexOf(0), tag: 'ray-star' }; },
  async ask(item, mode, tries) { const svg = newStage(232, { oasis: false, ground: 0 }), Gm = rayStarGeo(item.ang); el('rect', { x: 20, y: 14, width: 320, height: 204, rx: 14, fill: '#22324a', stroke: css('--line'), 'stroke-width': 2 }, svg);
    const St = item.ord.map((si, i) => { const [x, y] = Gm.S[si], g = el('g', {}, svg); el('path', { d: starPath(x, y, 15), fill: '#8f9bb0', stroke: '#fff', 'stroke-width': 1.5 }, g); return g; });
    const tor = el('g', { 'pointer-events': 'none' }, svg); el('circle', { cx: Gm.A[0], cy: Gm.A[1], r: 9, fill: '#f6d24a', stroke: '#fff', 'stroke-width': 2 }, tor); ptAt(tor, Gm.A[0], Gm.A[1], 'a', { r: 3, color: '#fff', lab: [0, -16] }); ptAt(tor, Gm.B[0], Gm.B[1], 'b', { r: 4.5, color: '#fff', lab: [0, -14] });
    if (tries >= 3) geoLine(helpG(svg), Gm.A[0], Gm.A[1], Gm.B[0], Gm.B[1], { color: '#f6d24a', w: 4 });   /* الحلّ المشترك: أول الشعاع مرسوم من أ إلى ب، والامتداد للطفل */
    say(...lineOf(tries >= 3 ? 'gen.geo.together.star' : item.q), { free: true });
    const k = await tapOne(St.map((g, i) => ({ g, k: i, label: labelText('geoStar') + ' ' + DG(i + 1) })), { ok: item.want, pad: 64 }); hush(); const beam = rayLineAt(svg, Gm.A, Gm.B, '#f6d24a'); svg.insertBefore(beam, St[0]); return { ans: k, ctx: { svg, St, Gm } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: item.ord[k] === 1 ? 'rayBehind' : 'rayOffLine' }; },
  lit(r, i) { r.ctx.St[i].firstChild.setAttribute('fill', '#f6d24a'); },
  onOk(item, r) { SFX.good(); this.lit(r, r.ans); }, onWrong() { SFX.soft(); }, async hint2(item, r) { await sleep(1200); }, async together() {},
  async reveal(item, r) { this.lit(r, item.want); await S('gen.geo.reveal.star'); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};
/* ---------- مشاهد الدرس 5 ---------- */
/* المصباح: غرفة معتمة ومصباح عند أ؛ يلمسه الطفل فيخرج الضوء ويمتدّ حتى حافة المسرح وما بعدها. lines: [الدعوة، بعد] */
SCENES.torchHook = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), [l1, l2] = c.lines, A = [70, 150], B = [170, 110]; el('rect', { x: 20, y: 14, width: 320, height: 204, rx: 14, fill: '#22324a', stroke: css('--line'), 'stroke-width': 2 }, svg);
  const tor = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg); el('rect', { x: A[0] - 34, y: A[1] - 2, width: 34, height: 18, rx: 5, fill: '#c9cfd6', transform: `rotate(-22 ${A[0]} ${A[1]})` }, tor); el('circle', { cx: A[0], cy: A[1], r: 11, fill: '#f6d24a', stroke: '#fff', 'stroke-width': 2 }, tor);
  await answerWhile(l1, () => tapOne([{ g: tor, k: 't', label: labelText('geoTorch') }], { ok: 't', pad: 64, pulse: true })); const E = rayEdge(A, B), beam = geoLine(svg, A[0], A[1], A[0], A[1], { color: '#f6d24a', w: 6 }); svg.insertBefore(beam, tor);
  await symTween(900, t => { beam.setAttribute('x2', A[0] + (E[0] - A[0]) * t); beam.setAttribute('y2', A[1] + (E[1] - A[1]) * t); }); geoArrow(svg, E[0], E[1], Math.atan2(B[1] - A[1], B[0] - A[0]) * 180 / Math.PI, '#f6d24a', 12); SFX.good(); logAttempt({ scene: 'hook', tag: 'torch', ok: true }); await S(l2); };
/* ترتيب التسمية: يلمس الطفل أ ثم ب فيُرسم الشعاع أ ب، ثم ب ثم أ فيُرسم الشعاع ب أ بلون آخر. lines: [دعوة الأول، بعد الأول، دعوة الثاني، ختام] */
SCENES.rayOrderShow = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), [l1, l2, l3, l4] = c.lines, PT = { a: [130, 130], b: [230, 100] }; rayFrame(svg); const G = {};
  for (const k of ['a', 'b']) { const g = el('g', {}, svg); ptAt(g, PT[k][0], PT[k][1], k, { r: 7, lab: [0, -16] }); G[k] = g; }
  const two = async (k1, k2, col, line) => { S(line, { free: true }); await tapOne([{ g: G[k1], k: k1, label: labelText('geoPoint') + ' ' + LTR[k1] }], { ok: k1, pad: 64, pulse: true }); hush(); SFX.tick(); await sayLtr(k1, { noGap: true }); await tapOne([{ g: G[k2], k: k2, label: labelText('geoPoint') + ' ' + LTR[k2] }], { ok: k2, pad: 64, pulse: true }); SFX.tick(); await sayLtr(k2); const r = rayLineAt(svg, PT[k1], PT[k2], col); svg.insertBefore(r, G.a); return r; };
  const r1 = await two('a', 'b', css('--compass'), l1); await S(l2); r1.setAttribute('opacity', .35); await two('b', 'a', css('--chaos'), l3); r1.setAttribute('opacity', 1); logAttempt({ scene: c.s || 'explore', tag: 'rayOrder', ok: true }); await S(l4); };
SCENES.recallRay = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), it = ITEM.geoName.make({ kind: c.kind || 'ray', pts: c.pts || 'up', from: c.from || 'a', to: c.to || 'b' }); ITEM.geoName.draw(it, svg); await sleep(300); await S(c.lines); };
WRAP_ART.torchRay = svg => { const g = el('g', {}, svg); el('rect', { x: 60, y: 60, width: 240, height: 130, rx: 14, fill: '#22324a' }, g); rayLineAt(g, [90, 160], [170, 130], '#f6d24a'); el('circle', { cx: 90, cy: 160, r: 9, fill: '#f6d24a', stroke: '#fff', 'stroke-width': 2 }, g); el('path', { d: starPath(250, 96, 10), fill: '#f6d24a' }, g); anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200, fill: 'both' }); palmAt(svg, 330, 250, .7); palmAt(svg, 30, 250, .8); };

/* =====================================================================
   الدرس 6: المستقيم (C111)، ومن نقطتين مستقيم واحد (C112)، والنقاط على استقامة واحدة (C113)
   ===================================================================== */
/* ثلاث نقاط: الأولى والثالثة على خط اتجاهه ang، والوسطى تبعد عنه off (0 = على استقامة واحدة) */
function col3Geo(ang, off) { const a = ang * Math.PI / 180, u = [Math.cos(a), -Math.sin(a)], n = [-u[1], u[0]], C = [180, 116]; return [[C[0] - u[0] * 110, C[1] - u[1] * 110], [C[0] + u[0] * 10 + n[0] * off, C[1] + u[1] * 10 + n[1] * off], [C[0] + u[0] * 110, C[1] + u[1] * 110]]; }
/* ================= ⑭ هل النقاط الثلاث على استقامة واحدة؟ (C113): ang، off. يلمس الطفل النقاط فتوضع حافة المسطرة على الأولى والثالثة، ثم يحكم ================= */
ITEM.colJudge = {
  make(spec) { return { ...spec, want: spec.off ? 'no' : 'yes', tag: 'col-judge' }; },
  async ask(item, mode, tries) { const svg = newStage(232, { oasis: false, ground: 0 }), P = col3Geo(item.ang, item.off); rayFrame(svg); const g = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg); el('rect', { x: 26, y: 20, width: 308, height: 192, rx: 10, fill: '#fff', opacity: .01 }, g);
    const edge = () => { const e = el('g', { 'pointer-events': 'none' }, svg), a = Math.atan2(P[2][1] - P[0][1], P[2][0] - P[0][0]) * 180 / Math.PI, r = el('g', { transform: `translate(${P[0][0]} ${P[0][1]}) rotate(${a})` }, e); el('rect', { x: -24, y: 0, width: 268, height: 26, fill: RUL.body, stroke: RUL.edge, 'stroke-width': 1.5, opacity: .85 }, r); for (let i = 0; i <= 12; i++) el('line', { x1: -14 + i * 20, y1: 0, x2: -14 + i * 20, y2: 8, stroke: RUL.ink, 'stroke-width': 1.2 }, r); svg.insertBefore(e, pts); return e; };
    const pts = el('g', { 'pointer-events': 'none' }, svg); ['a', 'b', 'j'].forEach((k, i) => ptAt(pts, P[i][0], P[i][1], k, { r: 6, lab: [0, -14] }));
    say(...lineOf(tries >= 3 ? 'gen.geo.together.col' : item.q), { free: true }); await tapOne([{ g, k: 'p', label: labelText('geoLayRuler') }], { ok: 'p', pad: 60 }); hush(); g.remove(); edge(); SFX.tick(); await sleep(tries >= 3 ? 900 : 400);
    const k = await choosePick([['yes', labelText('yes')], ['no', labelText('no')]], item.want); return { ans: k, ctx: { svg } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'colWrong' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); }, async hint2() { await S('gen.geo.hint.col'); }, async together() {},
  async reveal(item) { await S(item.want === 'yes' ? 'gen.geo.reveal.col' : 'gen.geo.reveal.ncol'); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};
/* ================= ⑮ جدول المقارنة: هل للرسم بداية (start)؟ نهاية (end)؟ طول يُقاس (len)؟ (C111): fig = seg | ray | line ================= */
const GEO_PROP = { seg: { start: 1, end: 1, len: 1 }, ray: { start: 1, end: 0, len: 0 }, line: { start: 0, end: 0, len: 0 } };
ITEM.propAsk = {
  make(spec) { return { ...spec, want: GEO_PROP[spec.fig][spec.prop] ? 'yes' : 'no', tag: 'prop-' + spec.prop }; },
  async ask(item, mode, tries) { const svg = newStage(200, { oasis: false, ground: 0 }), g = lfigAt(svg, item.fig + (item.alt ? '2' : ''), 180, 100); g.setAttribute('transform', 'translate(180 100) scale(1.5)');
    if (tries >= 3) { const t = el('text', { x: 180, y: 192, 'text-anchor': 'middle', 'font-size': 15, fill: css('--think') }, helpG(svg)); t.textContent = labelText(item.fig === 'seg' ? 'geoAidSeg' : item.fig === 'ray' ? 'geoAidRay' : 'geoAidLine'); }
    await S(tries >= 3 ? 'gen.geo.together.prop' : item.q); const k = await choosePick([['yes', labelText('yes')], ['no', labelText('no')]], item.want); return { ans: k, ctx: { svg } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'segRayLine' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); }, async hint2(item) { await S('gen.geo.hint.name'); }, async together() {},
  async reveal(item) { await S('gen.geo.reveal.' + item.fig); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};
/* ---------- مشاهد الدرس 6 ---------- */
/* سكة الحديد: قطعة من السكة؛ يلمسها الطفل فتمتدّ من الجهتين. lines: [الدعوة، بعد] */
SCENES.railHook = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), [l1, l2] = c.lines; el('rect', { x: 20, y: 14, width: 320, height: 204, rx: 14, fill: '#eef3e6', stroke: css('--line'), 'stroke-width': 2 }, svg);
  const g = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg), rail = (x1, x2, parent) => { const r = el('g', {}, parent); for (let x = x1; x <= x2; x += 14) el('rect', { x: x - 2.5, y: 100, width: 5, height: 34, fill: '#8a6a4a' }, r); for (const y of [106, 128]) geoLine(r, x1 - 4, y, x2 + 4, y, { color: '#5b6770', w: 4 }); return r; }; rail(138, 222, g);
  await answerWhile(l1, () => tapOne([{ g, k: 'r', label: labelText('geoRail') }], { ok: 'r', pad: 60, pulse: true })); const ext = el('g', {}, svg); svg.insertBefore(ext, g); const L = rail(40, 124, ext), R = rail(236, 320, ext);
  await anim(ext, [{ opacity: 0 }, { opacity: 1 }], { duration: 800, fill: 'forwards' }).done.catch(() => {}); geoArrow(svg, 336, 117, 0, GEO.ink, 12); geoArrow(svg, 24, 117, 180, GEO.ink, 12); SFX.good(); logAttempt({ scene: 'hook', tag: 'rail', ok: true }); await S(l2); };
/* من نقطة واحدة مستقيمات كثيرة، ومن نقطتين مستقيم واحد. lines: [دعوة النقطة الواحدة، بعدها، دعوة النقطتين، بعد الأول، بعد الثاني] */
SCENES.linesThrough = async c => { const [l1, l2, l3, l4, l5] = c.lines; let svg = newStage(232, { oasis: false, ground: 0 }); rayFrame(svg); const C = [180, 116], hot = () => { const g = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg); el('rect', { x: 26, y: 20, width: 308, height: 192, rx: 10, fill: '#fff', opacity: .01 }, g); return g; };
  const full = (P, Q, col) => { const g = el('g', { 'pointer-events': 'none' }, svg), E1 = rayEdge(P, Q), E2 = rayEdge(Q, P); geoLine(g, E2[0], E2[1], E1[0], E1[1], { color: col, w: 3.6 }); const a = Math.atan2(Q[1] - P[1], Q[0] - P[0]) * 180 / Math.PI; geoArrow(g, E1[0], E1[1], a, col, 10); geoArrow(g, E2[0], E2[1], a + 180, col, 10); return g; };
  let h = hot(); const p0 = ptAt(svg, C[0], C[1], 'a', { r: 7, lab: [14, -12] }); p0.setAttribute('pointer-events', 'none'); S(l1, { free: true }); const COL = [css('--compass'), css('--think'), GEO.hl, css('--chaos')];
  for (let i = 0; i < 4; i++) { await tapOne([{ g: h, k: i, label: labelText('geoAddLine') }], { ok: i, pad: 60 }); if (i === 0) hush(); const a = (20 + i * 42) * Math.PI / 180, ln = full(C, [C[0] + Math.cos(a) * 40, C[1] - Math.sin(a) * 40], COL[i]); svg.insertBefore(ln, p0); SFX.tick(); await sleep(250); } await S(l2);
  svg = newStage(232, { oasis: false, ground: 0 }); rayFrame(svg); const A = [110, 140], B = [250, 92]; h = hot(); const pa = ptAt(svg, A[0], A[1], 'a', { r: 7, lab: [0, -16] }); pa.setAttribute('pointer-events', 'none'); ptAt(svg, B[0], B[1], 'b', { r: 7, lab: [0, -16] }).setAttribute('pointer-events', 'none'); S(l3, { free: true });
  await tapOne([{ g: h, k: 0, label: labelText('geoAddLine') }], { ok: 0, pad: 60 }); hush(); let ln = full(A, B, css('--compass')); svg.insertBefore(ln, pa); SFX.tick(); S(l4, { free: true });
  await tapOne([{ g: h, k: 1, label: labelText('geoAddLine') }], { ok: 1, pad: 60 }); hush(); ln = full(A, B, css('--chaos')); svg.insertBefore(ln, pa); await anim(ln, [{ opacity: 1 }, { opacity: .2 }, { opacity: 1 }], { duration: 900 }).done.catch(() => {}); SFX.good(); logAttempt({ scene: c.s || 'explore', tag: 'linesThrough', ok: true }); await S(l5); };
SCENES.recallCol = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), P = col3Geo(c.ang || 15, c.off || 0); rayFrame(svg); geoLine(svg, P[0][0], P[0][1], P[2][0], P[2][1], { color: GEO.soft, w: 2, dash: '5 4' }); ['a', 'b', 'j'].forEach((k, i) => ptAt(svg, P[i][0], P[i][1], k, { r: 6, lab: [0, -14] })); await sleep(300); await S(c.lines); };
WRAP_ART.railLine = svg => { const g = el('g', {}, svg); el('rect', { x: 50, y: 80, width: 260, height: 90, rx: 14, fill: '#eef3e6', stroke: css('--line'), 'stroke-width': 2 }, g); for (let x = 66; x <= 294; x += 14) el('rect', { x: x - 2.5, y: 108, width: 5, height: 34, fill: '#8a6a4a' }, g); for (const y of [114, 136]) geoLine(g, 58, y, 302, y, { color: '#5b6770', w: 4 }); anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200, fill: 'both' }); palmAt(svg, 330, 250, .7); palmAt(svg, 30, 250, .8); };

/* =====================================================================
   الدرس 7: مشروع «خريطة الطرق» (ربط الوحدة) ثم اختبارها
   ===================================================================== */
/* خريطة مدينة صغيرة: المدرسة والحديقة والمخبز. يبني الطفل طرقها خطوةً خطوة باللمس (الهدف التالي ينبض):
   قطعة بين مكانين وتُسمّى وتُقاس، ثم شعاع يخرج من المدينة، ثم سكة حديد (مستقيم)، ثم محطة راحة عند منتصف أطول طريق، ثم طريق حرّ من اختياره.
   lines: [مقدّمة، القطعة، بعدها، الشعاع، بعده، المستقيم، بعده، المحطة، بعدها، الحرّ، ختام] */
SCENES.roadMap = async c => { const svg = newStage(270, { oasis: false, ground: 0 }), L = c.lines; el('rect', { x: 14, y: 10, width: 332, height: 250, rx: 14, fill: '#eef3e6', stroke: css('--line'), 'stroke-width': 2 }, svg);
  const PL = { a: [70, 200, '#c8392d'], b: [250, 200, '#2f9d6b'], j: [160, 80, '#d99a2b'], d: [300, 90, '#3d7cc0'] }, roads = el('g', { 'pointer-events': 'none' }, svg), G = {};
  for (const [k, [x, y, col]] of Object.entries(PL)) { const g = el('g', {}, svg); el('circle', { cx: x, cy: y, r: 15, fill: '#fffdf6', stroke: col, 'stroke-width': 3 }, g); el('rect', { x: x - 7, y: y - 5, width: 14, height: 11, fill: col }, g); el('path', { d: `M${x - 9} ${y - 5} L${x} ${y - 12} L${x + 9} ${y - 5} Z`, fill: col }, g); const t = el('text', { x, y: y + 34, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: GEO.ink, 'pointer-events': 'none' }, g); t.textContent = LTR[k]; G[k] = g; }
  const pick = async (k, pulse = true) => { await tapOne([{ g: G[k], k, label: labelText('geoPlace') + ' ' + LTR[k] }], { ok: k, pad: 64, pulse }); SFX.tick(); }, P = k => [PL[k][0], PL[k][1]];
  await S(L[0]); S(L[1], { free: true }); await pick('a'); hush(); await pick('b'); geoLine(roads, ...P('a'), ...P('b'), { color: GEO.road, w: 6 }); await sayGeo('seg', ['a', 'b']); const cmL = Math.round(Math.hypot(P('b')[0] - P('a')[0], P('b')[1] - P('a')[1]) / 30);
  { const t = el('text', { x: (P('a')[0] + P('b')[0]) / 2, y: P('a')[1] - 12, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: GEO.ink, 'pointer-events': 'none' }, svg); t.textContent = cmL + ' ' + labelText('rulCm'); } await S(L[2]); await sayLen(cmL);
  S(L[3], { free: true }); await pick('j'); hush(); await pick('d'); roads.appendChild(rayLineAt(svg, P('j'), P('d'), GEO.road)); await sayGeo('ray', ['j', 'd']); await S(L[4]);
  S(L[5], { free: true }); await pick('a'); hush(); await pick('j'); { const E1 = rayEdge(P('a'), P('j')), E2 = rayEdge(P('j'), P('a')), g = el('g', {}, roads); geoLine(g, E2[0], E2[1], E1[0], E1[1], { color: '#5b6770', w: 5, dash: '10 5' }); const a = Math.atan2(P('j')[1] - P('a')[1], P('j')[0] - P('a')[0]) * 180 / Math.PI; geoArrow(g, E1[0], E1[1], a, '#5b6770', 11); geoArrow(g, E2[0], E2[1], a + 180, '#5b6770', 11); } await sayGeo('line', ['a', 'j']); await S(L[6]);
  const mid = [(P('a')[0] + P('b')[0]) / 2, P('a')[1]], st = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg); el('circle', { cx: mid[0], cy: mid[1], r: 13, fill: css('--chaos'), opacity: .3, stroke: css('--chaos'), 'stroke-width': 2.5 }, st);
  await answerWhile(L[7], () => tapOne([{ g: st, k: 'm', label: labelText('geoStop') }], { ok: 'm', pad: 64, pulse: true })); st.remove(); ptAt(svg, mid[0], mid[1], 'm', { r: 8, color: css('--chaos'), lab: [0, 26] }); SFX.good(); await S(L[8]); await sayLen(cmL / 2);
  S(L[9], { free: true }); await pick('b', false); hush(); await pick('d', false); geoLine(roads, ...P('b'), ...P('d'), { color: GEO.road, w: 6 }); await sayGeo('seg', ['b', 'd']); logAttempt({ scene: c.s || 'game', tag: 'roadMap', ok: true }); await S(L[10]); };
