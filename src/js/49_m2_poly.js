/* =====================================================================
   S2-U4 «عائلة المضلعات» (المرحلة 2، نوفمبر 2026)
   د1 المضلع وشروطه الثلاثة (C150) وأضلاعه ورؤوسه وزواياه (C151) · د2 المثلثات بالأضلاع (C152) وبالزوايا (C153)
   د3 المتقابلة والمتجاورة (C162)، والمربع والمستطيل (C154) · د4 متوازي الأضلاع والمعيّن (C155) (د3 المرجع مقسوم: يتجاوز السقف)
   د5 شبه المنحرف والطائرة الورقية (C156)، والقطر (C157)، وعائلة الرباعيات (C158) · د6 أسماء المضلعات (C159)، والمنتظم (C160)، والمقعّر مدخلاً بصرياً (C161)
   د7 التفكيك والتركيب (C163) ومدينة المضلعات · د8 الاختبار
   خصائص كل شكل تُحسب من رؤوسه (الأطوال والزوايا والتوازي)، لا تُكتب باليد: فالجواب من الرسم نفسه.
   D241: لا نعلّم ما سننفيه. الاسم الأعمّ الصحيح يُقبل (المربع مستطيل ومعيّن ومتوازي أضلاع، ومتساوي الأضلاع متساوي الساقين) مع «وله اسم أخصّ»،
   ولا يكون الاسم الأعمّ الصحيح مشتّتاً أبداً: متوازي الأضلاع لا يُسأل «أهو شبه منحرف؟»، والمعيّن لا يُسأل «أهو طائرة ورقية؟».
   ===================================================================== */
const PLY = { fill: '#e6f0f5', edge: '#24323a', hl: '#2f9d6b', mark: '#c8392d', cut: '#b0552f', soft: '#9fb4c0', rx: '#7a4fb0' };
const PCM = 20;   /* بكسل لكل سنتيمتر في قياس الأضلاع باللمس */
/* رؤوس منتظم بعدد n ونصف قطر R، يبدأ من الأعلى (y إلى الأسفل) */
const polyReg = (n, R = 70, a0 = -90) => [...Array(n)].map((_, i) => { const a = (a0 + i * 360 / n) * Math.PI / 180; return [+(R * Math.cos(a)).toFixed(2), +(R * Math.sin(a)).toFixed(2)]; });
/* المكتبة: رؤوس بالبكسل حول المركز (y إلى الأسفل). open: خطّ غير مغلق · curve: [رقم الضلع، الانبعاج] · circle: نصف القطر */
const POLYS = {
  /* مثلثات */
  tEq: { p: [[0, -52], [60, 52], [-60, 52]] }, tEq2: { p: [[0, -43], [50, 43], [-50, 43]] },
  tIsoA: { p: [[0, -62], [45, 50], [-45, 50]] }, tIsoA2: { p: [[0, -58], [36, 52], [-36, 52]] },
  tIsoR: { p: [[-50, -50], [50, 50], [-50, 50]] }, tIsoR2: { p: [[0, -40], [80, 40], [-80, 40]] },
  tIsoO: { p: [[0, -22], [75, 30], [-75, 30]] }, tIsoO2: { p: [[0, -12], [90, 30], [-90, 30]] },
  tScaA: { p: [[20, -58], [75, 45], [-62, 40]] }, tScaA2: { p: [[-30, -55], [72, 40], [-58, 48]] },
  tScaR: { p: [[-60, -45], [70, 45], [-60, 45]] }, tScaR2: { p: [[-55, -55], [45, 50], [-55, 50]] },
  tScaO: { p: [[-80, 40], [60, 40], [100, -35]] }, tScaO2: { p: [[-95, 35], [25, 35], [60, -35]] },
  /* رباعيات */
  qSq: { p: [[-50, -50], [50, -50], [50, 50], [-50, 50]] }, qSq2: { p: [[-40, -40], [40, -40], [40, 40], [-40, 40]] },
  qRect: { p: [[-75, -40], [75, -40], [75, 40], [-75, 40]] }, qRect2: { p: [[-40, -60], [40, -60], [40, 60], [-40, 60]] },
  qPara: { p: [[-50, -40], [80, -40], [50, 40], [-80, 40]] }, qPara2: { p: [[-80, -35], [40, -35], [80, 35], [-40, 35]] },
  qRhom: { p: [[0, -55], [75, 0], [0, 55], [-75, 0]] }, qRhom2: { p: [[-80, -40], [20, -40], [80, 40], [-20, 40]] },
  qTrap: { p: [[-40, -40], [40, -40], [85, 40], [-85, 40]] }, qTrap2: { p: [[-30, -40], [60, -40], [85, 40], [-85, 40]] }, qTrapR: { p: [[-75, -40], [25, -40], [75, 40], [-75, 40]] },
  qKite: { p: [[0, -60], [45, -20], [0, 60], [-45, -20]] }, qKite2: { p: [[-65, 0], [0, -38], [80, 0], [0, 38]] },
  qOther: { p: [[-60, -30], [50, -52], [78, 40], [-42, 50]] }, qOther2: { p: [[-70, -20], [30, -55], [60, 45], [-30, 35]] },
  /* مضلعات أكثر أضلاعاً: منتظمة، وغير منتظمة */
  r5: { p: polyReg(5) }, r6: { p: polyReg(6, 70, 0) }, r7: { p: polyReg(7) }, r8: { p: polyReg(8, 70, -67.5) }, r9: { p: polyReg(9) }, r10: { p: polyReg(10, 72, -72) },
  i5: { p: [[-20, -60], [72, -30], [60, 50], [-50, 55], [-82, -12]] }, i6: { p: [[-40, -55], [50, -55], [85, 5], [40, 55], [-55, 45], [-85, -5]] },
  i6eL: { p: [[-30, -51.2], [30, -51.2], [72.4, -8.8], [30, 33.6], [-30, 33.6], [-72.4, -8.8]].map(([x, y]) => [x, y + 8.8]) },   /* أضلاعه متساوية وزواياه غير متساوية */
  i6eA: { p: [[-40, -52], [40, -52], [60, -17.4], [20, 51.9], [-20, 51.9], [-60, -17.4]] },   /* زواياه متساوية وأضلاعه غير متساوية */
  i6b: { p: [[-60, -50], [60, -50], [90, 0], [60, 50], [-60, 50], [-30, 0]] },
  i7: { p: [[0, -62], [55, -40], [78, 15], [40, 58], [-35, 55], [-80, 10], [-50, -40]] }, i8: { p: [[-30, -60], [35, -58], [80, -20], [70, 35], [25, 62], [-40, 55], [-82, 15], [-70, -35]] },
  i5h: { p: [[0, -60], [70, -10], [70, 55], [-70, 55], [-70, -10]] },   /* بيت: خماسي غير منتظم */
  /* مقعّرة (رأس منبعج للداخل) */
  c5: { p: [[-70, -45], [0, -10], [70, -45], [55, 50], [-55, 50]] }, c4: { p: [[0, -62], [55, 55], [0, 18], [-55, 55]] },
  c6: { p: [[-80, -40], [10, -40], [80, 0], [10, 40], [-80, 40], [-35, 0]] }, c8: { p: [[-70, -60], [-20, -60], [-20, 10], [40, 10], [40, -60], [80, -60], [80, 55], [-70, 55]] },
  /* ليست مضلعات */
  nOpen: { p: [[-30, -55], [70, -10], [55, 55], [-55, 55], [-75, -15]], open: true }, nOpen2: { p: [[-70, 45], [-70, -45], [70, -45], [70, 45], [-20, 45]], open: true },
  nCurve: { p: [[-70, 45], [0, -55], [70, 45]], curve: [0, 34] }, nCurve2: { p: [[-70, -45], [70, -45], [70, 45], [-70, 45]], curve: [1, 30] },
  nCircle: { circle: 62 }, nCross: { p: [[-70, -45], [70, 45], [70, -45], [-70, 45]] }, nStar: { p: polyReg(5, 66).map((_, i, a) => a[(i * 2) % 5]) },
};
/* تحويل: دوران rot (درجات، عكس عقارب الساعة على الشاشة) وتكبير s، ثم الإزاحة إلى C */
const polyXf = (pts, C, rot = 0, s = 1) => { const a = -rot * Math.PI / 180, c = Math.cos(a), n = Math.sin(a); return pts.map(([x, y]) => [C[0] + s * (x * c - y * n), C[1] + s * (x * n + y * c)]); };
const segX = (A, B, C, D) => { const o = (P, Q, R) => Math.sign((Q[0] - P[0]) * (R[1] - P[1]) - (Q[1] - P[1]) * (R[0] - P[0])); return o(A, B, C) * o(A, B, D) < 0 && o(C, D, A) * o(C, D, B) < 0; };
/* الخصائص من الرؤوس: n، الأطوال، الزوايا الداخلية، أزواج التوازي، التساوي، النوع */
function polyProps(sh) {
  if (sh.circle) return { poly: false, why: 'curve', n: 0 };
  if (sh.open) return { poly: false, why: 'open', n: sh.p.length - 1 };
  if (sh.curve) return { poly: false, why: 'curve', n: sh.p.length };
  const P = sh.p, n = P.length, L = P.map((p, i) => Math.hypot(P[(i + 1) % n][0] - p[0], P[(i + 1) % n][1] - p[1]));
  for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) if (!(i === 0 && j === n - 1) && segX(P[i], P[(i + 1) % n], P[j], P[(j + 1) % n])) return { poly: false, why: 'cross', n };
  let area = 0; for (let i = 0; i < n; i++) area += P[i][0] * P[(i + 1) % n][1] - P[(i + 1) % n][0] * P[i][1]; const sg = Math.sign(area);
  const A = P.map((p, i) => { const a = P[(i + n - 1) % n], b = P[(i + 1) % n], u = [a[0] - p[0], a[1] - p[1]], v = [b[0] - p[0], b[1] - p[1]], cr = u[0] * v[1] - u[1] * v[0], dt = u[0] * v[0] + u[1] * v[1];
    let t = Math.atan2(Math.abs(cr), dt) * 180 / Math.PI; if (Math.sign(cr) === sg) t = 360 - t; return +t.toFixed(2); });
  const eqL = (a, b) => Math.abs(a - b) <= 1.2, eqA = (a, b) => Math.abs(a - b) <= .6, dir = i => { const a = P[i], b = P[(i + 1) % n]; return Math.atan2(b[1] - a[1], b[0] - a[0]); };
  const par = (i, j) => { let d = Math.abs(dir(i) - dir(j)) % Math.PI; return Math.min(d, Math.PI - d) < .012; };
  const pr = { poly: true, n, P, L, A, concave: A.some(a => a > 180.5), allEqL: L.every(l => eqL(l, L[0])), allEqA: A.every(a => eqA(a, A[0])), right: A.filter(a => eqA(a, 90)).length };
  pr.regular = pr.allEqL && pr.allEqA;
  if (n === 3) { pr.side = pr.allEqL ? 'eq' : (eqL(L[0], L[1]) || eqL(L[1], L[2]) || eqL(L[0], L[2])) ? 'iso' : 'sca'; pr.ang = pr.right ? 'right' : A.some(a => a > 90.6) ? 'obtuse' : 'acute'; }
  if (n === 4 && !pr.concave) { pr.pars = [par(0, 2), par(1, 3)].filter(Boolean).length; const opp = eqL(L[0], L[2]) && eqL(L[1], L[3]), kite = (eqL(L[0], L[1]) && eqL(L[2], L[3])) || (eqL(L[1], L[2]) && eqL(L[3], L[0]));
    pr.quad = pr.pars === 2 ? (pr.allEqL ? (pr.right === 4 ? 'square' : 'rhom') : pr.right === 4 ? 'rect' : 'para') : pr.pars === 1 ? 'trap' : kite ? 'kite' : 'other'; pr.oppEq = opp; }
  return pr; }
/* الأسماء الصحيحة كلها بحسب تعريفات م2 الشمولية (D241)، أخصّها أولاً */
const QTRUE = { square: ['square', 'rect', 'rhom', 'para', 'trap', 'kite'], rect: ['rect', 'para', 'trap'], rhom: ['rhom', 'para', 'trap', 'kite'], para: ['para', 'trap'], trap: ['trap'], kite: ['kite'], other: [] };
const TTRUE = { eq: ['eq', 'iso'], iso: ['iso'], sca: ['sca'] };
const QN = ['square', 'rect', 'para', 'rhom', 'trap', 'kite'];
/* رسم شكل: { g، P (رؤوس الشاشة)، sides، verts، pr }. o: rot، s، names (مفاتيح LTR)، dots، marks (علامات التساوي والتوازي والقائمة من الخصائص)، fill، hit (أهداف لمس للأضلاع والرؤوس) */
function polyAt(parent, key, C, o = {}) { const sh = typeof key === 'string' ? POLYS[key] : key, g = el('g', { 'data-poly': typeof key === 'string' ? key : '' }, parent), col = o.color || PLY.edge, s = o.s || 1;
  if (sh.circle) { el('circle', { cx: C[0], cy: C[1], r: sh.circle * s, fill: o.fill || PLY.fill, stroke: col, 'stroke-width': 4 }, g); return { g, P: [], sides: [], verts: [], pr: polyProps(sh) }; }
  const P = polyXf(sh.p, C, o.rot || 0, s), n = P.length, pr = polyProps({ ...sh, p: P }), sides = [], verts = [];
  if (!sh.open && !sh.curve) el('polygon', { points: polyStr(P), fill: o.fill || PLY.fill, stroke: 'none' }, g);
  else if (sh.curve) { const [ci, b] = sh.curve; let d = `M${P[0][0]} ${P[0][1]}`; for (let i = 0; i < n; i++) { const a = P[i], c = P[(i + 1) % n]; if (i === ci) { const m = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2], L = Math.hypot(c[0] - a[0], c[1] - a[1]), u = [(c[1] - a[1]) / L, -(c[0] - a[0]) / L], cx = m[0] + u[0] * b * 2 * s, cy = m[1] + u[1] * b * 2 * s; d += ` Q${cx} ${cy} ${c[0]} ${c[1]}`; } else d += ` L${c[0]} ${c[1]}`; } el('path', { d: d + 'Z', fill: o.fill || PLY.fill, stroke: 'none' }, g); }
  const m = sh.open ? n - 1 : n;
  for (let i = 0; i < m; i++) { const a = P[i], c = P[(i + 1) % n], sg = el('g', { 'data-side': i }, g);
    if (sh.curve && sh.curve[0] === i) { const [, b] = sh.curve, mm = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2], L = Math.hypot(c[0] - a[0], c[1] - a[1]), u = [(c[1] - a[1]) / L, -(c[0] - a[0]) / L], q = [mm[0] + u[0] * b * 2 * s, mm[1] + u[1] * b * 2 * s];
      el('path', { d: `M${a[0]} ${a[1]} Q${q[0]} ${q[1]} ${c[0]} ${c[1]}`, fill: 'none', stroke: 'transparent', 'stroke-width': 30 }, sg); el('path', { d: `M${a[0]} ${a[1]} Q${q[0]} ${q[1]} ${c[0]} ${c[1]}`, fill: 'none', stroke: col, 'stroke-width': 4, 'stroke-linecap': 'round' }, sg); sg.mid = [mm[0] + u[0] * b * s, mm[1] + u[1] * b * s]; }
    else { el('line', { x1: a[0], y1: a[1], x2: c[0], y2: c[1], stroke: 'transparent', 'stroke-width': 30, 'stroke-linecap': 'round' }, sg); geoLine(sg, a[0], a[1], c[0], c[1], { color: col, w: 4 }); sg.mid = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2]; }
    sides.push(sg); }
  const cen = P.reduce((s2, p) => [s2[0] + p[0] / n, s2[1] + p[1] / n], [0, 0]);
  P.forEach((p, i) => { const vg = el('g', { 'data-vtx': i }, g); el('circle', { cx: p[0], cy: p[1], r: 16, fill: '#fff', opacity: .01 }, vg); if (o.dots !== false) el('circle', { cx: p[0], cy: p[1], r: o.dotR || 4.5, fill: o.dotCol || PLY.edge }, vg);
    if (o.names && o.names[i]) { const dx = p[0] - cen[0], dy = p[1] - cen[1], d = Math.hypot(dx, dy) || 1, t = el('text', { x: p[0] + dx / d * 17, y: p[1] + dy / d * 17 + 6, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: GEO.ink, 'pointer-events': 'none' }, vg); t.textContent = LTR[o.names[i]] || o.names[i]; }
    verts.push(vg); });
  const R = { g, P, sides, verts, pr, cen, n };
  if (o.marks && pr.poly) polyMarks(g, R, o.marks);
  return R; }
/* علامات من الخصائص: شرطات للأضلاع المتساوية (مجموعة أولى شرطة، ثانية شرطتان)، وأسهم للمتوازية، ومربع للقائمة. which: true (الكل) أو مصفوفة من 'eq' و'par' و'right' */
function polyMarks(g, R, which) { const W = which === true ? ['eq', 'par', 'right'] : which, { P, pr, n } = R, m = el('g', { 'pointer-events': 'none', 'data-marks': 1 }, g), eqL = (a, b) => Math.abs(a - b) <= 1.2;
  const u = i => { const a = P[i], b = P[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]); return [(b[0] - a[0]) / L, (b[1] - a[1]) / L]; };
  if (W.includes('eq')) { const grp = []; pr.L.forEach((l, i) => { let k = grp.findIndex(x => eqL(x.l, l)); if (k < 0) { grp.push({ l, s: [] }); k = grp.length - 1; } grp[k].s.push(i); });
    let t = 0; for (const G2 of grp) { if (G2.s.length < 2) continue; t++; for (const i of G2.s) { const a = P[i], b = P[(i + 1) % n], c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], v = u(i); for (let k = 0; k < t; k++) { const o2 = (k - (t - 1) / 2) * 6, x = c[0] + v[0] * o2, y = c[1] + v[1] * o2; geoLine(m, x - v[1] * 8, y + v[0] * 8, x + v[1] * 8, y - v[0] * 8, { color: PLY.mark, w: 2.6 }); } } } }
  if (W.includes('par') && n === 4) { let t = 0; for (const [i, j] of [[0, 2], [1, 3]]) { const a = u(i), b = u(j); if (Math.abs(a[0] * b[1] - a[1] * b[0]) > .012) continue; t++; for (const s of [i, j]) { const A = P[s], B = P[(s + 1) % n], v = u(s), c = [A[0] + (B[0] - A[0]) * .3, A[1] + (B[1] - A[1]) * .3]; for (let k = 0; k < t; k++) geoArrow(m, c[0] + v[0] * k * 8, c[1] + v[1] * k * 8, Math.atan2(v[1], v[0]) * 180 / Math.PI, PLY.mark, 8); } } }
  if (W.includes('right')) pr.A.forEach((a, i) => { if (Math.abs(a - 90) > .6) return; const p = P[i], A = P[(i + n - 1) % n], B = P[(i + 1) % n], la = Math.hypot(A[0] - p[0], A[1] - p[1]), lb = Math.hypot(B[0] - p[0], B[1] - p[1]), s = 12, ua = [(A[0] - p[0]) / la * s, (A[1] - p[1]) / la * s], ub = [(B[0] - p[0]) / lb * s, (B[1] - p[1]) / lb * s];
    el('path', { d: `M${p[0] + ua[0]} ${p[1] + ua[1]} L${p[0] + ua[0] + ub[0]} ${p[1] + ua[1] + ub[1]} L${p[0] + ub[0]} ${p[1] + ub[1]}`, fill: 'none', stroke: PLY.mark, 'stroke-width': 2.4 }, m); });
  return m; }
/* قياس ضلع باللمس: طوله بالسنتيمتر بجانبه (بأرقام المسطرة، D229)، وقياس زاوية: درجتها بجانب الرأس */
const cmOf = l => Math.round(l / PCM * 2) / 2;
function sideLabel(parent, R, i, col = css('--compass')) { const s = R.sides[i]; if (!s || s.dataset.shown) return; s.dataset.shown = 1; const P = R.P, a = P[i], b = P[(i + 1) % R.n], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = mx - R.cen[0], dy = my - R.cen[1], d = Math.hypot(dx, dy) || 1;
  const x = mx + dx / d * 22, y = my + dy / d * 22 + 5, g = el('g', { 'pointer-events': 'none', 'data-len': i }, parent); el('rect', { x: x - 26, y: y - 15, width: 52, height: 21, rx: 6, fill: '#fff', stroke: col, 'stroke-width': 1.5 }, g);
  const t = el('text', { x, y: y + 1, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: col }, g); t.textContent = String(cmOf(R.pr.L[i])).replace('.', '٫') + ' ' + labelText('rulCm'); return g; }
function vertLabel(parent, R, i, col = css('--think')) { const v = R.verts[i]; if (!v || v.dataset.shown) return; v.dataset.shown = 1; const p = R.P[i], dx = R.cen[0] - p[0], dy = R.cen[1] - p[1], d = Math.hypot(dx, dy) || 1, a = R.pr.A[i];
  if (Math.abs(a - 90) <= .6) { const A = R.P[(i + R.n - 1) % R.n], B = R.P[(i + 1) % R.n], la = Math.hypot(A[0] - p[0], A[1] - p[1]), lb = Math.hypot(B[0] - p[0], B[1] - p[1]), s = 13, ua = [(A[0] - p[0]) / la * s, (A[1] - p[1]) / la * s], ub = [(B[0] - p[0]) / lb * s, (B[1] - p[1]) / lb * s]; el('path', { d: `M${p[0] + ua[0]} ${p[1] + ua[1]} L${p[0] + ua[0] + ub[0]} ${p[1] + ua[1] + ub[1]} L${p[0] + ub[0]} ${p[1] + ub[1]}`, fill: 'none', stroke: col, 'stroke-width': 2.6, 'pointer-events': 'none' }, parent); }
  else { const A = R.P[(i + R.n - 1) % R.n], B = R.P[(i + 1) % R.n], a1 = Math.atan2(-(A[1] - p[1]), A[0] - p[0]) * 180 / Math.PI, a2 = Math.atan2(-(B[1] - p[1]), B[0] - p[0]) * 180 / Math.PI; let s0 = a1, s1 = a2; if ((((s1 - s0) % 360) + 360) % 360 > 180.5 !== a > 180.5) [s0, s1] = [a2, a1]; el('path', { d: angArc(p, 18, s0, s0 + a), fill: 'none', stroke: a > 180.5 ? PLY.rx : col, 'stroke-width': 3, 'pointer-events': 'none' }, parent); }
  degText(parent, p[0] + dx / d * 40, p[1] + dy / d * 40 + 6, Math.round(a), { size: 14, color: col }); }
/* ضلع أو رأس يضيء */
const polyHl = (R, kind, i, col = PLY.hl) => { const g = (kind === 'side' ? R.sides : R.verts)[i]; if (!g) return; g.querySelectorAll(kind === 'side' ? 'line:not([stroke="transparent"]),path:not([stroke="transparent"])' : 'circle').forEach(x => { if (kind === 'side') { x.setAttribute('stroke', col); x.setAttribute('stroke-width', 6); } else if (+x.getAttribute('r') < 10) { x.setAttribute('fill', col); x.setAttribute('r', 7); } }); };
const plyFrame = (svg, H = 204) => el('rect', { x: 20, y: 14, width: 320, height: H, rx: 14, fill: GEO.paper, stroke: css('--line'), 'stroke-width': 2 }, svg);
/* أداتا القياس فوق الإطار (القياس لا الحكم بالنظر): المسطرة تكتب طول كل ضلع، وركن المنقلة يكتب كل زاوية. تبقيان متاحتين حتى الجواب ولا تحبسان الطفل.
   o: len، ang (أيّهما يظهر)، layer: طبقة الكتابة. يعيد { off()، used: { len، ang } } */
const PLY_TOOL_IC = { len: '<rect x="-17" y="-7" width="34" height="14" rx="2" fill="#f6d77a" stroke="#8a6a1a" stroke-width="1.6"/><path d="M-12 -7v6M-6 -7v4M0 -7v6M6 -7v4M12 -7v6" stroke="#8a6a1a" stroke-width="1.4"/>',
  ang: '<path d="M-14 10 H14 M-14 10 L6 -12" stroke="#24323a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M-4 10 A10 10 0 0 0 -7.4 2.6" stroke="#2f9d6b" stroke-width="2.6" fill="none"/>' };
function plyTools(svg, R, o = {}) { const used = { len: false, ang: false }, gs = [], layer = o.layer || el('g', { 'pointer-events': 'none' }, svg);
  const mk = (k, x, y, fn) => { const g = el('g', { role: 'button', tabindex: 0, 'aria-label': plain(G(labelText(k === 'len' ? 'plyMeasure' : 'plyAngles'))), style: 'cursor:pointer', 'data-tool': k }, svg); el('circle', { cx: x, cy: y, r: 23, fill: '#fff', stroke: css('--line'), 'stroke-width': 2 }, g); const ic = el('g', { transform: `translate(${x} ${y})`, 'pointer-events': 'none' }, g); ic.innerHTML = PLY_TOOL_IC[k]; hitPad(g, 56, 56);
    g.onclick = async () => { if (used[k]) return; used[k] = true; g.setAttribute('opacity', .45); SFX.tick(); for (let i = 0; i < R.n; i++) { if (k === 'len') { if (R.sides[i]) sideLabel(layer, R, i); } else vertLabel(layer, R, i); await sleep(FAST ? 10 : 160); } if (o.after) o.after(k); }; gs.push(g); return g; };
  if (o.len !== false) mk('len', 48, 44); if (o.ang) mk('ang', 48, o.len === false ? 44 : 100);
  return { used, layer, off: () => gs.forEach(g => { g.onclick = null; g.removeAttribute('role'); g.setAttribute('opacity', .2); }), show: k => gs.find(g => g.dataset.tool === k)?.onclick() }; }

/* ---------- مسرح البنود: إطار وشكل في وسطه ---------- */
const plyStage = (H = 232) => { const svg = newStage(H, { oasis: false, ground: 0 }); plyFrame(svg, H - 28); return svg; };
const PLY_C = [196, 118];   /* مركز الشكل: يسار الإطار لأداتي القياس */
const plyDraw = (svg, item, o = {}) => polyAt(svg, item.k, o.C || PLY_C, { rot: item.rot || 0, s: item.s || 1, names: item.names, marks: o.marks ?? item.marks, dots: o.dots ?? item.dots });
const thinkRing = (parent, P, r = 16) => el('circle', { cx: P[0], cy: P[1], r, fill: 'none', stroke: css('--think'), 'stroke-width': 3, 'stroke-dasharray': '5 4', 'pointer-events': 'none' }, parent);
/* اسم منطوق وتسمية مكتوبة لكل اسم: الرباعيات (q.)، والمثلثات بالأضلاع (ts.) وبالزوايا (ta.)، والمضلعات بعدد أضلاعها (n.) */
const plyOpt = (grp, k) => [k, labelText('ply.' + grp + '.' + k), '<i></i>', 'gen.poly.' + grp + '.' + k];
const PLY_ERR = { quad: (w, a) => w === 'rhom' && a === 'square' ? 'rhomSquare' : w === 'para' && a === 'rect' ? 'paraRect' : w === 'rect' && a === 'square' ? 'rectSquare' : w === 'square' && a === 'other' ? 'quadName' : (w === 'trap' || w === 'kite') ? 'trapKite' : 'quadName' };

/* ================= ① مضلع أم لا؟ (C150): k من المكتبة. خطوتان: نعم أو لا، ثم الشرط الذي لم يتحقّق ================= */
ITEM.polyIs = {
  make(spec) { const pr = polyProps(POLYS[spec.k]), want = pr.poly ? 'yes' : pr.why; return { ...spec, want, tag: 'poly-is-' + want }; },
  async ask(item, mode, tries) { const svg = plyStage(), R = plyDraw(svg, item, { C: [180, 118] });
    if (tries >= 3) { const m = helpG(svg), sh = POLYS[item.k];   /* الحلّ المشترك: الموضع الذي يخالف الشرط محاط؛ وفي المضلع تُرقَّم أضلاعه المستقيمة */
      if (item.want === 'open') { thinkRing(m, R.P[0], 18); thinkRing(m, R.P[R.P.length - 1], 18); }
      else if (item.want === 'curve') { if (sh.circle) thinkRing(m, [180, 118], 70); else thinkRing(m, R.sides[sh.curve[0]].mid, 26); }
      else if (item.want === 'cross') { for (let i = 0; i < R.n; i++) for (let j = i + 2; j < R.n; j++) { const A = R.P[i], B = R.P[(i + 1) % R.n], C2 = R.P[j], D = R.P[(j + 1) % R.n]; if (!(i === 0 && j === R.n - 1) && segX(A, B, C2, D)) { const d = (B[0] - A[0]) * (D[1] - C2[1]) - (B[1] - A[1]) * (D[0] - C2[0]), t = ((C2[0] - A[0]) * (D[1] - C2[1]) - (C2[1] - A[1]) * (D[0] - C2[0])) / d; thinkRing(m, [A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])], 14); } } }
      else R.sides.forEach((sg, i) => badge(m, sg.mid[0], sg.mid[1], i + 1, css('--think'))); }
    await S(tries >= 3 ? 'gen.poly.together.is' : item.q);
    const a = await choosePick([['yes', labelText('plyYes'), '<i></i>', 'gen.poly.yes'], ['no', labelText('plyNo'), '<i></i>', 'gen.poly.no']], item.want === 'yes' ? 'yes' : 'no');
    if (a === 'yes') return { ans: 'yes', ctx: { svg, R } };
    await S('gen.poly.why'); const w = await choosePick(['open', 'curve', 'cross'].map(k => plyOpt('why', k)), item.want === 'yes' ? null : item.want); return { ans: w, ctx: { svg, R } }; },
  judge(item, a) { if (a === item.want) return { ok: true }; return { ok: false, err: item.want === 'yes' ? 'polyNotIs' : a === 'yes' ? (item.want === 'curve' ? 'polyCurve' : item.want === 'open' ? 'polyOpen' : 'polyCross') : 'polyReason' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.poly.hint.is'); }, async together() {},
  async reveal(item) { await S('gen.poly.reveal.' + item.want); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};
/* ================= ② كم ضلعاً (رأساً، زاوية)؟ (C151): ask = sides | verts | angles ================= */
ITEM.polyCount = { ...numItem,
  make(spec) { const pr = polyProps(POLYS[spec.k]); /*T*/if (TESTHOOK && !pr.poly) testBug('polyCount: الشكل ليس مضلعاً');/*/T*/ return { ...spec, want: pr.n, nums: nearNums(pr.n, 12, 3), tag: 'poly-count-' + spec.ask }; },
  async ask(item, mode, tries) { const svg = plyStage(), R = plyDraw(svg, item, { C: [180, 118] }); let aid = null;
    if (tries >= 3) { await S('gen.poly.together.count'); aid = helpG(svg); const pts = item.ask === 'sides' ? R.sides.map(sg => ({ x: sg.mid[0], y: sg.mid[1] })) : R.P.map(p => ({ x: p[0], y: p[1] }));
      if (item.ask === 'angles') R.P.forEach((p, i) => { const A = R.P[(i + R.n - 1) % R.n], B = R.P[(i + 1) % R.n], a1 = Math.atan2(-(A[1] - p[1]), A[0] - p[0]) * 180 / Math.PI; let a2 = Math.atan2(-(B[1] - p[1]), B[0] - p[0]) * 180 / Math.PI; const sw = R.pr.A[i]; const st = (((a2 - a1) % 360) + 360) % 360; el('path', { d: Math.abs(st - sw) < 1 ? angArc(p, 16, a1, a1 + sw) : angArc(p, 16, a2, a2 + sw), fill: 'none', stroke: css('--think'), 'stroke-width': 3 }, aid); });
      await badgeCount(aid, pts, css('--think')); }
    else await S(item.q);
    const np = numberPick(item.nums, item.want); return { ans: await np.p, ctx: { svg, R, np, aid } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'polyCountOff' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item) { await S('gen.poly.hint.count'); }, async together() {},
  async reveal(item, r) { await S('gen.poly.reveal.count', { noGap: true }); await S(numw(item.want), { num: true }); },
  praise: () => 'praiseCount', twin(item) { return item.twin || null; },
};
/* ================= ③ أصلح الشكل ليصير مضلعاً (C150، إنتاج): مفتوح يُغلق بلمس طرفيه، وضلع منحنٍ يُلمس فيستقيم ================= */
ITEM.polyFix = {
  make(spec) { const sh = POLYS[spec.k]; /*T*/if (TESTHOOK && !sh.open && !sh.curve) testBug('polyFix: الشكل لا يحتاج إصلاحاً');/*/T*/ return { ...spec, kind: sh.open ? 'open' : 'curve', tag: 'poly-fix-' + (sh.open ? 'open' : 'curve') }; },
  async ask(item, mode, tries) { const svg = plyStage(), R = plyDraw(svg, item, { C: [180, 118] }), sh = POLYS[item.k], m = tries >= 3 ? helpG(svg) : null;
    if (item.kind === 'open') { const ends = [0, R.P.length - 1]; if (m) ends.forEach(i => thinkRing(m, R.P[i], 20));
      say(...lineOf(tries >= 3 ? 'gen.poly.together.fixOpen' : item.q), { free: true });
      const a = await tapOne(R.verts.map((g, i) => ({ g, k: i, label: labelText('plyVertex') + ' ' + DG(i + 1) })), { ok: ends, pad: 44 }); hush(); polyHl(R, 'vtx', a);
      if (!ends.includes(a)) return { ans: { a, b: null }, ctx: { svg, R } };
      const b0 = ends.find(e => e !== a); await S('gen.poly.fixOther');
      const b = await tapOne(R.verts.map((g, i) => ({ g, k: i, label: labelText('plyVertex') + ' ' + DG(i + 1) })).filter(t => t.k !== a), { ok: b0, pad: 44 }); hush(); polyHl(R, 'vtx', b);
      if (b === b0) geoLine(svg, R.P[a][0], R.P[a][1], R.P[b][0], R.P[b][1], { color: PLY.hl, w: 4 });
      return { ans: { a, b }, ctx: { svg, R } }; }
    const ci = sh.curve[0]; if (m) thinkRing(m, R.sides[ci].mid, 26);
    say(...lineOf(tries >= 3 ? 'gen.poly.together.fixCurve' : item.q), { free: true });
    const k = await tapOne(R.sides.map((g, i) => ({ g, k: i, label: labelText('plySide') + ' ' + DG(i + 1) })), { ok: ci, pad: 40 }); hush();
    if (k === ci) { const A = R.P[ci], B = R.P[(ci + 1) % R.n], pth = R.sides[ci].querySelectorAll('path')[1], fillP = R.g.querySelector('path'); await symTween(500, t => { const [, bb] = sh.curve, mm = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], L = Math.hypot(B[0] - A[0], B[1] - A[1]), u = [(B[1] - A[1]) / L, -(B[0] - A[0]) / L], q = [mm[0] + u[0] * bb * 2 * (1 - t), mm[1] + u[1] * bb * 2 * (1 - t)]; pth.setAttribute('d', `M${A[0]} ${A[1]} Q${q[0]} ${q[1]} ${B[0]} ${B[1]}`); }); if (fillP) fillP.setAttribute('d', 'M' + R.P.map(p => p.join(' ')).join(' L') + 'Z'); pth.setAttribute('stroke', PLY.hl); }
    return { ans: { a: k, b: null }, ctx: { svg, R } }; },
  judge(item, r) { if (item.kind === 'open') { const E = [0, POLYS[item.k].p.length - 1]; return E.includes(r.a) && E.includes(r.b) && r.a !== r.b ? { ok: true } : { ok: false, err: 'polyFixEnd' }; } return r.a === POLYS[item.k].curve[0] ? { ok: true } : { ok: false, err: 'polyFixSide' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item) { await S(item.kind === 'open' ? 'gen.poly.hint.fixOpen' : 'gen.poly.hint.fixCurve'); }, async together() {},
  async reveal(item, r) { const R = r.ctx.R; if (item.kind === 'open') { const a = R.P[0], b = R.P[R.P.length - 1]; geoLine(r.ctx.svg, a[0], a[1], b[0], b[1], { color: PLY.hl, w: 4 }); } else polyHl(R, 'side', POLYS[item.k].curve[0], css('--think')); await S(item.kind === 'open' ? 'gen.poly.reveal.fixOpen' : 'gen.poly.reveal.fixCurve'); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};
/* ================= ④ المثلث بأضلاعه (C152) أو بزواياه (C153) أو بكليهما (الجدول المزدوج): by = side | ang | both. marks: علامات مرسومة، وإلا فأداتا القياس ================= */
ITEM.triKind = {
  make(spec) { const pr = polyProps(POLYS[spec.k]); /*T*/if (TESTHOOK && pr.n !== 3) testBug('triKind: ليس مثلثاً');/*/T*/ const by = spec.by || 'side'; return { ...spec, by, side: pr.side, ang: pr.ang, tag: 'tri-' + by + '-' + (by === 'ang' ? pr.ang : pr.side) + (by === 'both' ? '-' + pr.ang : '') }; },
  async ask(item, mode, tries) { const svg = plyStage(), R = plyDraw(svg, item), T = item.marks ? null : plyTools(svg, R, { len: item.by !== 'ang', ang: item.by !== 'side' });
    if (tries >= 3) { await S(item.by === 'ang' ? 'gen.poly.together.triA' : 'gen.poly.together.triS'); if (T) { if (item.by !== 'ang') await T.show('len'); if (item.by !== 'side') await T.show('ang'); } else polyMarks(R.g, R, true); }
    else await S(item.q);
    const ans = {}; if (item.by !== 'ang') { if (item.by === 'both') await S('gen.poly.bySide'); ans.side = await choosePick(['eq', 'iso', 'sca'].map(k => plyOpt('ts', k)), TTRUE[item.side]); }
    if (item.by !== 'side') { if (item.by === 'both') await S('gen.poly.byAng'); ans.ang = await choosePick(['acute', 'right', 'obtuse'].map(k => plyOpt('ta', k)), item.ang); }
    if (T) T.off(); return { ans, ctx: { svg, R } }; },
  judge(item, a) { if (a.side !== undefined && !TTRUE[item.side].includes(a.side)) return { ok: false, err: item.side === 'iso' && a.side === 'eq' ? 'triIsoEq' : 'triSideType' };
    if (a.ang !== undefined && a.ang !== item.ang) return { ok: false, err: item.ang === 'obtuse' && a.ang === 'acute' ? 'triObtuseMiss' : 'triAngType' }; return { ok: true }; },
  async onOk(item, r) { SFX.good(); if (r.ans.side && r.ans.side !== item.side) await S('gen.poly.exact.eq'); }, onWrong() { SFX.soft(); },
  async hint2(item) { await S(item.by === 'ang' ? 'gen.poly.hint.triA' : 'gen.poly.hint.triS'); }, async together() {},
  async reveal(item, r) { polyMarks(r.ctx.R.g, r.ctx.R, true); if (item.by !== 'ang') await S('gen.poly.ts.' + item.side); if (item.by !== 'side') await S('gen.poly.ta.' + item.ang); },
  praise: () => 'praiseMeasure', twin(item) { return item.twin || null; },
};
/* ================= ⑤ المتقابلة والمتجاورة (C162): رباعي برؤوس مسمّاة. ask = oppSide | adjSide (لمس) | oppAng (لمس رأس) | adjN | oppN (عدد) ================= */
ITEM.quadOpp = {
  make(spec) { const i = spec.i || 0, ask = spec.ask, want = ask === 'oppSide' ? (i + 2) % 4 : ask === 'adjSide' ? [(i + 1) % 4, (i + 3) % 4] : ask === 'oppAng' ? (i + 2) % 4 : ask === 'adjN' ? 2 : 1; return { ...spec, i, want, names: spec.names || ['a', 'b', 'j', 'd'], tag: 'quad-' + ask }; },
  async ask(item, mode, tries) { const svg = plyStage(), R = plyDraw(svg, item, { C: [180, 118] }), side = item.ask !== 'oppAng';
    if (side) polyHl(R, 'side', item.i, CRS.b); else { const v = item.i, p = R.P[v], A = R.P[(v + 3) % 4], B = R.P[(v + 1) % 4]; el('circle', { cx: p[0], cy: p[1], r: 9, fill: CRS.b, 'pointer-events': 'none' }, svg); }
    if (tries >= 3) { const m = helpG(svg); if (side) { for (const j of [(item.i + 1) % 4, (item.i + 3) % 4]) badge(m, R.sides[j].mid[0], R.sides[j].mid[1], labelText('plyAdjShort'), css('--think')); } else for (const j of [(item.i + 1) % 4, (item.i + 3) % 4]) thinkRing(m, R.P[j], 16); }   /* الحلّ المشترك: ما يلتقي بالضلع أو يشاركه رأساً مُعلَّم، فالباقي هو المقابل */
    const q = tries >= 3 ? (side ? 'gen.poly.together.oppS' : 'gen.poly.together.oppA') : item.q;
    if (item.ask === 'adjN' || item.ask === 'oppN') { await S(q); const np = numberPick([0, 1, 2, 3].filter(n => n !== (item.want === 2 ? 0 : 3)), item.want); return { ans: await np.p, ctx: { svg, R } }; }
    say(...lineOf(q), { free: true });
    const T = side ? R.sides.map((g, j) => ({ g, k: j, label: labelText('plySide') + ' ' + DG(j + 1) })).filter(t => t.k !== item.i) : R.verts.map((g, j) => ({ g, k: j, label: labelText('plyVertex') + ' ' + DG(j + 1) })).filter(t => t.k !== item.i);
    const k = await tapOne(T, { ok: item.want, pad: 40 }); hush(); polyHl(R, side ? 'side' : 'vtx', k); return { ans: k, ctx: { svg, R } }; },
  judge(item, k) { return [].concat(item.want).includes(k) ? { ok: true } : { ok: false, err: 'quadAdjOpp' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item) { await S(item.ask === 'oppAng' ? 'gen.poly.hint.oppA' : 'gen.poly.hint.oppS'); }, async together() {},
  async reveal(item, r) { const R = r.ctx.R; if (item.ask === 'oppAng') thinkRing(r.ctx.svg, R.P[item.want], 16); else if (item.ask === 'oppSide' || item.ask === 'adjSide') [].concat(item.want).forEach(j => polyHl(R, 'side', j, css('--think'))); await S('gen.poly.reveal.' + item.ask); },
  praise: () => 'praiseLook', twin(item) { return item.twin || null; },
};
/* ================= ⑥ ما اسم هذا الرباعي؟ (C154–C156): pick ثلاثة أسماء؛ والاسم الأعمّ الصحيح مقبول مع «وله اسم أخصّ» (D241). marks أو أداتا القياس ================= */
const quadTrue = pr => pr.n === 3 ? ['tri'] : QTRUE[pr.quad] || [];
ITEM.quadName = {
  make(spec) { const pr = polyProps(POLYS[spec.k]), want = pr.n === 3 ? 'tri' : pr.quad; /*T*/if (TESTHOOK && !spec.pick.includes(want)) testBug('quadName: الاسم الصحيح ليس بين الخيارات ' + spec.k);/*/T*/ return { ...spec, want, ok: quadTrue(pr), tag: 'quad-name-' + want }; },
  async ask(item, mode, tries) { const svg = plyStage(), R = plyDraw(svg, item, { marks: item.marks || (tries >= 3 ? true : false) }), T = item.marks ? null : plyTools(svg, R, { ang: true });
    if (item.seam) seamAt(svg, R, item.seam, PLY_C, item.rot || 0, item.s || 1);
    if (tries >= 3) { await S('gen.poly.together.quad'); if (T) { await T.show('len'); await T.show('ang'); } } else await S(item.q);
    const k = await choosePick(item.pick.map(o => plyOpt('q', o)), item.ok); if (T) T.off(); return { ans: k, ctx: { svg, R } }; },
  judge(item, k) { return item.ok.includes(k) ? { ok: true } : { ok: false, err: PLY_ERR.quad(item.want, k) }; },
  async onOk(item, r) { SFX.good(); if (r.ans !== item.want) await S('gen.poly.exact.' + item.want); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.poly.hint.quad'); }, async together() {},
  async reveal(item, r) { polyMarks(r.ctx.R.g, r.ctx.R, true); await S('gen.poly.q.' + item.want); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};
/* ================= ⑦ أسئلة الفحص الثلاثة (C154، C155): ask = par (كم زوجاً متوازياً) | right (كم زاوية قائمة) ================= */
ITEM.quadCheck = { ...numItem,
  make(spec) { const pr = polyProps(POLYS[spec.k]), want = spec.ask === 'par' ? pr.pars : pr.right; return { ...spec, want, nums: spec.ask === 'par' ? [0, 1, 2] : nearNums(want, 4, 0), tag: 'quad-check-' + spec.ask }; },
  async ask(item, mode, tries) { const svg = plyStage(), R = plyDraw(svg, item), T = item.ask === 'right' ? plyTools(svg, R, { len: false, ang: true }) : null;
    if (tries >= 3) { await S('gen.poly.together.' + item.ask); if (T) await T.show('ang'); else polyMarks(R.g, R, ['par']); } else await S(item.q);
    const np = numberPick(item.nums, item.want); const k = await np.p; if (T) T.off(); return { ans: k, ctx: { svg, R } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: item.ask === 'par' ? 'quadParCount' : 'quadRightCount' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item) { await S('gen.poly.hint.' + item.ask); }, async together() {},
  async reveal(item, r) { polyMarks(r.ctx.R.g, r.ctx.R, [item.ask === 'par' ? 'par' : 'right']); await S('gen.poly.reveal.' + item.ask, { noGap: true }); await S(numw(item.want), { num: true }); },
  praise: () => 'praiseLook', twin(item) { return item.twin || null; },
};
/* ================= ⑧ من أنا؟ (C154، C155): لغز بالخصائص، وثلاثة أشكال بعلاماتها؛ والجواب ما يحقّق اللغز (واحد فقط) ================= */
const RIDDLE = { rhom: pr => pr.allEqL && pr.right === 0, rect: pr => pr.right === 4 && !pr.allEqL, square: pr => pr.right === 4 && pr.allEqL, para: pr => pr.pars === 2 && pr.right === 0 && !pr.allEqL, trap: pr => pr.pars === 1, kite: pr => pr.quad === 'kite' };
ITEM.quadRiddle = {
  make(spec) { const ok = spec.figs.map((k, i) => RIDDLE[spec.is](polyProps(POLYS[k])) ? i : -1).filter(i => i >= 0); /*T*/if (TESTHOOK && ok.length !== 1) testBug('quadRiddle: اللغز يحقّقه ' + ok.length + ' أشكال');/*/T*/ return { ...spec, want: ok[0], tag: 'quad-riddle-' + spec.is }; },
  async ask(item, mode, tries) { const svg = newStage(232, { oasis: false, ground: 0 }), X = [292, 180, 68], Rs = item.figs.map((k, i) => { el('rect', { x: X[i] - 52, y: 40, width: 104, height: 150, rx: 14, fill: GEO.paper, stroke: css('--line'), 'stroke-width': 2 }, svg); return polyAt(svg, k, [X[i], 115], { s: .52, marks: true, dots: false, rot: (item.rots || [])[i] || 0 }); });
    if (tries >= 3) { const m = helpG(svg); Rs.forEach((R, i) => { const t = el('text', { x: X[i], y: 212, 'text-anchor': 'middle', 'font-size': 13, fill: css('--think') }, m); t.textContent = labelText('ply.q.' + R.pr.quad); }); }   /* الحلّ المشترك: اسم كل شكل تحته */
    say(...lineOf(tries >= 3 ? 'gen.poly.together.riddle' : item.q), { free: true });
    const k = await tapOne(Rs.map((R, i) => ({ g: R.g, k: i, label: labelText('plyShape') + ' ' + DG(i + 1) })), { ok: item.want, pad: 30 }); hush(); return { ans: k, ctx: { svg, Rs } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'quadRiddle' }; },
  onOk(item, r) { SFX.good(); okRing(r.ctx.svg, r.ctx.Rs[r.ans].g, 4); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.poly.hint.riddle'); }, async together() {},
  async reveal(item, r) { okRing(r.ctx.svg, r.ctx.Rs[item.want].g, 4); await S('gen.poly.q.' + polyProps(POLYS[item.figs[item.want]]).quad); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};
/* ================= ⑨ ارسم قطراً (C157، إنتاج): يلمس رأساً ثم رأساً لا يجاوره ================= */
ITEM.diagDraw = {
  make(spec) { const n = POLYS[spec.k].p.length; return { ...spec, n, tag: 'diag-draw' }; },
  async ask(item, mode, tries) { const svg = plyStage(), R = plyDraw(svg, item, { C: [180, 118] }), n = item.n, V = (ex = []) => R.verts.map((g, i) => ({ g, k: i, label: labelText('plyVertex') + ' ' + DG(i + 1) })).filter(t => !ex.includes(t.k));
    if (tries >= 3) { const m = helpG(svg); polyHl(R, 'vtx', 0, css('--think')); for (let j = 2; j < n - 1; j++) thinkRing(m, R.P[j], 16); }   /* الحلّ المشترك: البداية من رأس محدّد، والرؤوس التي لا تجاوره محاطة */
    say(...lineOf(tries >= 3 ? 'gen.poly.together.diag' : item.q), { free: true });
    const a = tries >= 3 ? 0 : await tapOne(V(), { ok: [...Array(n).keys()], pad: 40 }); hush(); polyHl(R, 'vtx', a); const adj = [(a + 1) % n, (a + n - 1) % n], far = [...Array(n).keys()].filter(j => j !== a && !adj.includes(j));
    if (tries < 3) await S('gen.poly.diagTo');
    const b = await tapOne(V([a]), { ok: far, pad: 40 }); hush(); polyHl(R, 'vtx', b); geoLine(svg, R.P[a][0], R.P[a][1], R.P[b][0], R.P[b][1], { color: far.includes(b) ? PLY.hl : css('--chaos'), w: 3.6, dash: far.includes(b) ? null : '6 5' });
    return { ans: { a, b }, ctx: { svg, R } }; },
  judge(item, r) { const d = Math.abs(r.a - r.b); return d !== 1 && d !== item.n - 1 ? { ok: true } : { ok: false, err: 'diagSide' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.poly.hint.diag'); }, async together() {},
  async reveal(item, r) { const R = r.ctx.R, a = r.ans.a, b = (a + 2) % item.n; geoLine(r.ctx.svg, R.P[a][0], R.P[a][1], R.P[b][0], R.P[b][1], { color: css('--think'), w: 3.6 }); await S('gen.poly.reveal.diag'); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};
/* ================= ⑩ كم قطراً؟ (C157): العدّ بعد رسمها واحداً واحداً في الحلّ المشترك ================= */
const diagsOf = n => { const D = []; for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) if (!(i === 0 && j === n - 1)) D.push([i, j]); return D; };
ITEM.diagCount = { ...numItem,
  make(spec) { const n = POLYS[spec.k].p.length, w = diagsOf(n).length; return { ...spec, want: w, nums: nearNums(w, 12, 0), tag: 'diag-count' }; },
  async ask(item, mode, tries) { const svg = plyStage(), R = plyDraw(svg, item, { C: [180, 118] });
    if (tries >= 3) { await S('gen.poly.together.diagN'); const m = helpG(svg); for (const [i, [a, b]] of diagsOf(R.n).entries()) { geoLine(m, R.P[a][0], R.P[a][1], R.P[b][0], R.P[b][1], { color: css('--think'), w: 2.6 }); badge(m, (R.P[a][0] + R.P[b][0]) / 2 + (i % 2 ? 10 : -10), (R.P[a][1] + R.P[b][1]) / 2, i + 1, css('--think')); SFX.tick(); await S(numw(i + 1), { noGap: true, num: true }); } }
    else await S(item.q);
    const np = numberPick(item.nums, item.want); return { ans: await np.p, ctx: { svg, R } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'diagCount' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.poly.hint.diagN'); }, async together() {},
  async reveal(item, r) { const R = r.ctx.R; for (const [a, b] of diagsOf(R.n)) geoLine(r.ctx.svg, R.P[a][0], R.P[a][1], R.P[b][0], R.P[b][1], { color: css('--think'), w: 2.6 }); await S('gen.poly.reveal.count', { noGap: true }); await S(numw(item.want), { num: true }); },
  praise: () => 'praiseCount', twin(item) { return item.twin || null; },
};
/* ================= ⑪ أين مكانه في شجرة العائلة؟ (C158): أخصّ مكان، والمكان الأعمّ الصحيح مقبول مع «وله مكان أخصّ» ================= */
const FAM = { para: [276, 52], trap: [168, 52], kite: [60, 52], rect: [300, 128], rhom: [196, 128], square: [248, 196] };
const FAM_UP = { rect: 'para', rhom: 'para', square: ['rect', 'rhom'] };
function famTreeAt(parent, o = {}) { const g = el('g', {}, parent), box = {}; for (const [a, b] of [['para', 'rect'], ['para', 'rhom'], ['rect', 'square'], ['rhom', 'square']]) geoLine(g, FAM[a][0], FAM[a][1] + 22, FAM[b][0], FAM[b][1] - 22, { color: css('--line'), w: 2.4 });
  for (const [k, [x, y]] of Object.entries(FAM)) { const b = el('g', { 'data-fam': k }, g); el('rect', { x: x - 48, y: y - 22, width: 96, height: 44, rx: 10, fill: o.fill && o.fill[k] ? '#e3f3ea' : '#fff', stroke: css('--line'), 'stroke-width': 2 }, b); const t = el('text', { x, y: y + 5, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: GEO.ink, 'pointer-events': 'none' }, b); t.textContent = labelText('ply.q.' + k); box[k] = b; }
  return { g, box }; }
ITEM.famSlot = {
  make(spec) { const pr = polyProps(POLYS[spec.k]); return { ...spec, want: pr.quad, ok: QTRUE[pr.quad].filter(k => FAM[k]), tag: 'fam-slot-' + pr.quad }; },
  async ask(item, mode, tries) { const svg = newStage(296, { oasis: false, ground: 0 }); el('rect', { x: 20, y: 222, width: 120, height: 68, rx: 12, fill: GEO.paper, stroke: css('--line'), 'stroke-width': 2 }, svg); const R = polyAt(svg, item.k, [80, 256], { s: .42, marks: true, dots: false, rot: item.rot || 0 }), F = famTreeAt(svg);
    if (tries >= 3) { const m = helpG(svg); for (const k of item.ok) thinkRing(m, FAM[k], 30); }   /* الحلّ المشترك: كل مكان تصحّ فيه خصائصه محاط، والأخصّ أدناها */
    say(...lineOf(tries >= 3 ? 'gen.poly.together.fam' : item.q), { free: true });
    const k = await tapOne(Object.keys(FAM).map(f => ({ g: F.box[f], k: f, label: labelText('ply.q.' + f) })), { ok: item.ok, pad: 56 }); hush(); return { ans: k, ctx: { svg, F, R } }; },
  judge(item, k) { return item.ok.includes(k) ? { ok: true } : { ok: false, err: 'famSlot' }; },
  async onOk(item, r) { SFX.good(); okRing(r.ctx.svg, r.ctx.F.box[r.ans], 3); if (r.ans !== item.want) await S('gen.poly.exactPlace.' + item.want); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.poly.hint.fam'); }, async together() {},
  async reveal(item, r) { okRing(r.ctx.svg, r.ctx.F.box[item.want], 3); await S('gen.poly.q.' + item.want); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};
/* ================= ⑫ ما اسم المضلع بعدد أضلاعه؟ (C159): pick ثلاثة أعداد ================= */
ITEM.polyName = {
  make(spec) { const pr = polyProps(POLYS[spec.k]); /*T*/if (TESTHOOK && !spec.pick.includes(pr.n)) testBug('polyName: العدد الصحيح ليس بين الخيارات');/*/T*/ return { ...spec, want: pr.n, tag: 'poly-name-' + pr.n }; },
  async ask(item, mode, tries) { const svg = plyStage(), R = plyDraw(svg, item, { C: [180, 118] }); let aid = null;
    if (tries >= 3) { await S('gen.poly.together.name'); aid = helpG(svg); await badgeCount(aid, R.sides.map(sg => ({ x: sg.mid[0], y: sg.mid[1] })), css('--think')); } else await S(item.q);
    const k = await choosePick(item.pick.map(n => plyOpt('n', String(n))), String(item.want)); return { ans: +k, ctx: { svg, R, aid } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'polyNameN' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.poly.hint.name'); }, async together() {},
  async reveal(item) { await S('gen.poly.n.' + item.want); },
  praise: () => 'praiseCount', twin(item) { return item.twin || null; },
};
/* ================= ⑬ منتظم أم غير منتظم؟ ولماذا؟ (C160): أداتا القياس؛ والسبب الصحيح ما لم يتساوَ (وإن لم يتساوَ الاثنان قُبل أيّهما) ================= */
ITEM.regularQ = {
  make(spec) { const pr = polyProps(POLYS[spec.k]), ok = pr.regular ? ['reg'] : [!pr.allEqL && 'nL', !pr.allEqA && 'nA'].filter(Boolean); return { ...spec, ok, tag: 'reg-' + (pr.regular ? 'reg' : ok.join('')) }; },
  async ask(item, mode, tries) { const svg = plyStage(), R = plyDraw(svg, item), T = plyTools(svg, R, { ang: true });
    if (tries >= 3) { await S('gen.poly.together.reg'); await T.show('len'); await T.show('ang'); } else await S(item.q);
    const k = await choosePick(['reg', 'nL', 'nA'].map(x => plyOpt('reg', x)), item.ok); T.off(); return { ans: k, ctx: { svg, R } }; },
  judge(item, k) { if (item.ok.includes(k)) return { ok: true }; return { ok: false, err: k === 'reg' ? (item.ok.includes('nA') && !item.ok.includes('nL') ? 'regAngles' : 'regSides') : 'regReason' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.poly.hint.reg'); }, async together() {},
  async reveal(item, r) { await S('gen.poly.reveal.reg.' + item.ok[0]); },
  praise: () => 'praiseMeasure', twin(item) { return item.twin || null; },
};
/* ================= ⑭ الرأس المنبعج (C161، مدخل بصري لا اختبار): ask = vtx (يلمس الرأس فيُرسم قوس الزاوية المنعكسة) | pick (أيّ الأشكال الثلاثة منبعج؟) ================= */
ITEM.concaveTap = {
  make(spec) { if (spec.figs) { const ok = spec.figs.map((k, i) => polyProps(POLYS[k]).concave ? i : -1).filter(i => i >= 0); /*T*/if (TESTHOOK && ok.length !== 1) testBug('concaveTap: المنبعج ليس واحداً');/*/T*/ return { ...spec, want: ok[0], tag: 'concave-pick' }; }
    const pr = polyProps(POLYS[spec.k]), w = pr.A.findIndex(a => a > 180.5); return { ...spec, want: w, tag: 'concave-vtx' }; },
  async ask(item, mode, tries) { const svg = item.figs ? newStage(232, { oasis: false, ground: 0 }) : plyStage();
    if (item.figs) { const X = [292, 180, 68], Rs = item.figs.map((k, i) => { el('rect', { x: X[i] - 52, y: 40, width: 104, height: 150, rx: 14, fill: GEO.paper, stroke: css('--line'), 'stroke-width': 2 }, svg); return polyAt(svg, k, [X[i], 115], { s: .52, dots: false }); });
      if (tries >= 3) { const m = helpG(svg), R = Rs[item.want]; vertLabel(m, R, R.pr.A.findIndex(a => a > 180.5)); }
      say(...lineOf(tries >= 3 ? 'gen.poly.together.concave' : item.q), { free: true }); const k = await tapOne(Rs.map((R, i) => ({ g: R.g, k: i, label: labelText('plyShape') + ' ' + DG(i + 1) })), { ok: item.want, pad: 30 }); hush(); return { ans: k, ctx: { svg, Rs } }; }
    const R = plyDraw(svg, item, { C: [180, 118] }); if (tries >= 3) thinkRing(helpG(svg), R.P[item.want], 20);
    say(...lineOf(tries >= 3 ? 'gen.poly.together.concaveV' : item.q), { free: true });
    const k = await tapOne(R.verts.map((g, i) => ({ g, k: i, label: labelText('plyVertex') + ' ' + DG(i + 1) })), { ok: item.want, pad: 40 }); hush(); return { ans: k, ctx: { svg, R } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'concaveVtx' }; },
  onOk(item, r) { SFX.good(); if (r.ctx.R) vertLabel(r.ctx.svg, r.ctx.R, item.want); else okRing(r.ctx.svg, r.ctx.Rs[r.ans].g, 4); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.poly.hint.concave'); }, async together() {},
  async reveal(item, r) { if (r.ctx.R) vertLabel(r.ctx.svg, r.ctx.R, item.want); else okRing(r.ctx.svg, r.ctx.Rs[item.want].g, 4); await S('gen.poly.reveal.concave'); },
  praise: () => 'praiseLook', twin(item) { return item.twin || null; },
};
/* ================= ⑮ كم قطعة؟ (C163): شكل مقصوص بخطوط متقطعة. cuts: أزواج رؤوس، أو 'c' للمركز ================= */
ITEM.partsCount = { ...numItem,
  make(spec) { return { ...spec, want: spec.parts, nums: nearNums(spec.parts, 10, 1), tag: 'parts-count' }; },
  async ask(item, mode, tries) { const svg = plyStage(), R = plyDraw(svg, item, { C: [180, 118], dots: false }), pt = x => x === 'c' ? R.cen : R.P[x];
    for (const [a, b] of item.cuts) { const A = pt(a), B = pt(b); geoLine(svg, A[0], A[1], B[0], B[1], { color: PLY.cut, w: 2.6, dash: '7 5' }); }
    if (tries >= 3) { await S('gen.poly.together.parts'); await badgeCount(helpG(svg), item.at.map(([x, y]) => ({ x: R.cen[0] + x, y: R.cen[1] + y })), css('--think')); } else await S(item.q);
    const np = numberPick(item.nums, item.want); return { ans: await np.p, ctx: { svg, R } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'partsCount' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.poly.hint.parts'); }, async together() {},
  async reveal(item) { await S('gen.poly.reveal.count', { noGap: true }); await S(numw(item.want), { num: true }); },
  praise: () => 'praiseCount', twin(item) { return item.twin || null; },
};
/* ================= ⑯ ارسم مضلعاً على ورق المربعات (C159، C160، إنتاج): يلمس الطفل نقاط الشبكة واحدة واحدة ويُغلق بلمس الأولى؛ لمس آخر نقطة يمحوها ================= */
const PGRID = { c: 38, cols: 7, rows: 4, x0: 47, y0: 32 }, pgP = (r, u) => [PGRID.x0 + r * PGRID.c, PGRID.y0 + u * PGRID.c];
function polyCheck(pts, n) { if (pts.length < 3) return { ok: false, err: 'polyDrawOpen' }; const P = pts.map(([r, u]) => pgP(r, u)), m = P.length;
  const keep = P.filter((p, i) => { const a = P[(i + m - 1) % m], b = P[(i + 1) % m]; return Math.abs((p[0] - a[0]) * (b[1] - p[1]) - (p[1] - a[1]) * (b[0] - p[0])) > 1; });   /* نقطة على استقامة جارتيها ليست رأساً */
  const pr = polyProps({ p: keep }); if (!pr.poly) return { ok: false, err: 'polyDrawCross' }; if (keep.length !== n) return { ok: false, err: 'polyDrawCount', n: keep.length }; return { ok: true, pr }; }
ITEM.polyDraw = {
  make(spec) { return { ...spec, tag: 'poly-draw-' + spec.n }; },
  async ask(item, mode, tries) { const svg = newStage(232, { oasis: false, ground: 0 }), g = el('g', {}, svg); el('rect', { x: 26, y: 14, width: 308, height: 172, rx: 12, fill: GEO.paper, stroke: css('--line'), 'stroke-width': 2 }, g);
    for (let r = 0; r <= PGRID.cols; r++) for (let u = 0; u <= PGRID.rows; u++) { const [x, y] = pgP(r, u); el('circle', { cx: x, cy: y, r: 3, fill: '#9fb4c0' }, g); }
    const lay = el('g', { 'pointer-events': 'none' }, svg); let pts = [], closed = false, done = false;
    const draw = () => { lay.innerHTML = ''; const P = pts.map(([r, u]) => pgP(r, u)); if (closed && P.length >= 3) el('polygon', { points: polyStr(P), fill: PLY.fill, opacity: .8 }, lay); for (let i = 1; i < P.length; i++) geoLine(lay, P[i - 1][0], P[i - 1][1], P[i][0], P[i][1], { color: PLY.edge, w: 3.6 }); if (closed && P.length >= 3) geoLine(lay, P[P.length - 1][0], P[P.length - 1][1], P[0][0], P[0][1], { color: PLY.edge, w: 3.6 }); P.forEach((p, i) => el('circle', { cx: p[0], cy: p[1], r: i ? 6 : 8, fill: i ? PLY.edge : css('--compass'), stroke: '#fff', 'stroke-width': 2 }, lay)); /*T*/window.__polyDraw = { pts: pts.slice(), closed };/*/T*/ };
    const add = (r, u) => { if (closed) { if (pts.length && pts[0][0] === r && pts[0][1] === u) { closed = false; SFX.tick(); draw(); } return; }
      const L = pts[pts.length - 1]; if (L && L[0] === r && L[1] === u) { pts.pop(); SFX.tick(); draw(); return; }   /* لمس آخر نقطة يمحوها */
      if (pts.length >= 3 && pts[0][0] === r && pts[0][1] === u) { closed = true; SFX.good(); draw(); return; }
      if (pts.some(p => p[0] === r && p[1] === u)) { SFX.soft(); return; } pts.push([r, u]); SFX.tick(); draw(); };
    const snap = q => [Math.max(0, Math.min(PGRID.cols, Math.round((q[0] - PGRID.x0) / PGRID.c))), Math.max(0, Math.min(PGRID.rows, Math.round((q[1] - PGRID.y0) / PGRID.c)))];
    const input = fingerInput(svg, { map: e => { const q = svgPoint(svg, e); return [q.x, q.y]; }, down(q) { if (q[1] > PGRID.y0 + PGRID.rows * PGRID.c + 20) return false; add(...snap(q)); return false; }, move() { return false; }, up() {} });
    const kg = el('g', { role: 'grid', 'aria-label': labelText('plyGrid') }, svg); for (let u = 0; u <= PGRID.rows; u++) { const row = el('g', { role: 'row' }, kg); for (let r = 0; r <= PGRID.cols; r++) { const [x, y] = pgP(r, u), b = el('g', { role: 'gridcell', tabindex: 0, 'aria-label': `${DG(r + 1)}، ${DG(u + 1)}` }, row); el('circle', { cx: x, cy: y, r: 8, fill: 'transparent', 'pointer-events': 'none' }, b); b.onkeydown = e => { if (isActKey(e)) { e.preventDefault(); add(r, u); } }; } }
    if (tries >= 3) { const m = helpG(svg), ex = item.n === 6 ? [[1, 1], [3, 0], [5, 1], [5, 3], [3, 4], [1, 3]] : item.n === 5 ? [[1, 3], [2, 1], [4, 0], [6, 2], [4, 4]] : [[1, 1], [5, 1], [6, 3], [2, 3]]; ex.forEach(([r, u], i) => { const [x, y] = pgP(r, u); thinkRing(m, [x, y], 11); }); }   /* الحلّ المشترك: رؤوس مقترحة محاطة، والوصل للطفل */
    const askQ = async () => { await S(tries >= 3 ? 'gen.poly.together.draw' : item.q); }; askQ(); REPLAY_HOOK = () => askQ(); REPLAY_HOOK.live = () => !done && svg.isConnected;
    /*T*/window.__polyDrawAt = (r, u) => { const m = svg.getScreenCTM(), [x, y] = pgP(r, u); return { x: m.a * x + m.e, y: m.d * y + m.f }; }; window.__polyDrawWant = item.n === 6 ? [[1, 1], [3, 0], [5, 1], [5, 3], [3, 4], [1, 3], [1, 1]] : item.n === 5 ? [[1, 3], [2, 1], [4, 0], [6, 2], [4, 4], [1, 3]] : [[1, 1], [5, 1], [6, 3], [2, 3], [1, 1]];/*/T*/
    AUTO({ kind: 'polyDraw', ok: () => { pts = []; closed = false; for (const [r, u] of window.__polyDrawWant || []) add(r, u); rulDoneBtn().click(); }, wrong: () => { pts = []; closed = false; for (const [r, u] of [[1, 1], [5, 1], [3, 4], [1, 1]]) add(r, u); rulDoneBtn().click(); } });
    await rulDone(() => { done = true; REPLAY_HOOK = null; input.off(); kg.remove(); }); return { ans: { pts: pts.slice(), closed }, ctx: { svg, lay } }; },
  judge(item, a) { if (!a.closed) return { ok: false, err: 'polyDrawOpen' }; const c = polyCheck(a.pts, item.n); return c.ok ? { ok: true } : { ok: false, err: c.err }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const c = r.ans.closed ? polyCheck(r.ans.pts, item.n) : { err: 'polyDrawOpen' }; await S('gen.poly.hint.draw.' + (c.err || 'polyDrawCount')); }, async together() {},
  async reveal(item, r) { const lay = r.ctx.lay; lay.innerHTML = ''; const ex = window.__polyDrawWant || [], P = ex.slice(0, -1).map(([a, b]) => pgP(a, b)); el('polygon', { points: polyStr(P), fill: PLY.fill, stroke: css('--think'), 'stroke-width': 3.6 }, lay); await S('gen.poly.reveal.draw'); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};
/* ================= ⑰ كم شكلاً مختلفاً من n مربعات متجاورة ضلعاً بضلع؟ (C163، تحدٍّ): المقلوب والمدوَّر شكل واحد ================= */
const MINO = { 3: [[[0, 0], [1, 0], [2, 0]], [[0, 0], [1, 0], [0, 1]]], 4: [[[0, 0], [1, 0], [2, 0], [3, 0]], [[0, 0], [1, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [2, 0], [1, 1]], [[0, 0], [1, 0], [1, 1], [2, 1]], [[0, 0], [1, 0], [2, 0], [0, 1]]] };
function minoAt(parent, cells, x, y, c = 22, col = '#6c7fa8') { const g = el('g', { transform: `translate(${x} ${y})` }, parent); for (const [a, b] of cells) el('rect', { x: a * c, y: b * c, width: c, height: c, fill: col, stroke: '#fff', 'stroke-width': 2 }, g); return g; }
ITEM.polyMino = { ...numItem,
  make(spec) { const w = MINO[spec.n].length; return { ...spec, want: w, nums: nearNums(w, 8, 1), tag: 'mino-' + spec.n }; },
  async ask(item, mode, tries) { const svg = plyStage(); for (let i = 0; i < item.n; i++) el('rect', { x: 180 - item.n * 20 + i * 40 + 5, y: 46, width: 30, height: 30, rx: 3, fill: '#6c7fa8', stroke: '#fff', 'stroke-width': 2 }, svg);   /* المربعات منفصلة: كيف تُلصق؟ */
    if (tries >= 3) { await S('gen.poly.together.mino'); const m = helpG(svg), w = item.n === 3 ? 150 : 62, c = item.n === 3 ? 20 : 13; for (const [i, cells] of MINO[item.n].entries()) { minoAt(m, cells, 36 + i * w, 120, c, css('--think')); badge(m, 30 + i * w, 112, i + 1, css('--think')); SFX.tick(); await S(numw(i + 1), { noGap: true, num: true }); } }   /* الحلّ المشترك: الأشكال المختلفة مرسومة ومعدودة */
    else await S(item.q);
    const np = numberPick(item.nums, item.want); return { ans: await np.p, ctx: { svg } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: k > item.want ? 'minoTurned' : 'minoMissed' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.poly.hint.mino'); }, async together() {},
  async reveal(item, r) { const m = helpG(r.ctx.svg); MINO[item.n].forEach((cells, i) => minoAt(m, cells, 36 + i * (item.n === 3 ? 150 : 62), 120, item.n === 3 ? 20 : 13, css('--think'))); await S(item.n === 3 ? 'gen.poly.reveal.mino3' : 'gen.poly.reveal.mino4'); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};

/* ---------- مشاهد S2-U4 ---------- */
const plyHot = (svg, x, y, w, h) => { const g = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg); el('rect', { x, y, width: w, height: h, rx: 10, fill: '#fff', opacity: .01 }, g); return g; };
const fade = g => anim(g, [{ opacity: 1 }, { opacity: .12 }], { duration: 400, fill: 'forwards' });
/* شروط المضلع الثلاثة بالفرز: ستة أشكال، ولكل شرط يلمس الطفل ما يخالفه فيبهت؛ ويبقى المضلعان. lines: [مقدمة، مغلق؟، مستقيمة؟، لا تتقاطع؟، ختام] */
SCENES.polyRules = async c => { const svg = plyStage(), L = c.lines, keys = c.keys || ['tEq2', 'nCircle', 'nOpen', 'nStar', 'r5', 'nCurve2'], X = [282, 180, 78], Y = [72, 166];
  const Rs = keys.map((k, i) => ({ k, R: polyAt(svg, k, [X[i % 3], Y[Math.floor(i / 3)]], { s: .5, dots: false }), why: polyProps(POLYS[k]).why || 'ok' }));
  await S(L[0]); for (const [j, cond] of ['open', 'curve', 'cross'].entries()) { let left = Rs.filter(x => x.why === cond && !x.gone); S(L[j + 1], { free: true }); let n = 0;
    while (left.length) { const live = Rs.filter(x => !x.gone), k = await tapOne(live.map(x => ({ g: x.R.g, k: x.k, label: labelText('plyShape') })), { ok: left.map(x => x.k), pad: 30 }); hush(); const hit = Rs.find(x => x.k === k);
      logAttempt({ scene: c.s || 'explore', tag: 'polyRules', ok: hit.why === cond, firstTry: n === 0 }); n++;
      if (hit.why === cond) { hit.gone = true; fade(hit.R.g); SFX.tick(); } else { SFX.soft(); await S(hit.why === 'ok' ? 'gen.poly.rulesKeep' : 'gen.poly.rulesLater'); } left = Rs.filter(x => x.why === cond && !x.gone); } }
  Rs.filter(x => !x.gone).forEach(x => okRing(svg, x.R.g, 4)); SFX.good(); await S(L[4]); };
/* أجزاء المضلع: ضلع ثم رأس، ثم تُعدّ الأضلاع والرؤوس والزوايا فتتساوى. lines: [المس ضلعاً، هذا ضلع، المس رأساً، هذا رأس، وعند كل رأس زاوية، العدد واحد] */
SCENES.polyParts = async c => { const svg = plyStage(), L = c.lines, R = polyAt(svg, c.k || 'i5h', [180, 118], {});
  S(L[0], { free: true }); const s = await tapOne(R.sides.map((g, i) => ({ g, k: i, label: labelText('plySide') })), { ok: [...R.sides.keys()], pad: 36 }); hush(); polyHl(R, 'side', s); await S(L[1]);
  S(L[2], { free: true }); const v = await tapOne(R.verts.map((g, i) => ({ g, k: i, label: labelText('plyVertex') })), { ok: [...R.verts.keys()], pad: 40 }); hush(); polyHl(R, 'vtx', v); await S(L[3]);
  const m = el('g', { 'pointer-events': 'none' }, svg); for (let i = 0; i < R.n; i++) vertLabel(m, R, i); m.querySelectorAll('text').forEach(t => t.parentNode.remove()); await S(L[4]);
  const b1 = el('g', { 'pointer-events': 'none' }, svg); await badgeCount(b1, R.sides.map(sg => ({ x: sg.mid[0], y: sg.mid[1] })), css('--compass')); b1.remove(); await badgeCount(el('g', { 'pointer-events': 'none' }, svg), R.P.map(p => ({ x: p[0], y: p[1] })), css('--think'));
  logAttempt({ scene: c.s || 'explore', tag: 'polyParts', ok: true }); await S(L[5]); };
/* المثلثات بأضلاعها: ثلاثة مثلثات، يلمس الطفل كلاً منها فتُكتب أطواله ويُسمّى. lines: [مقدمة، ختام] */
SCENES.triMeasure = async c => { const svg = newStage(232, { oasis: false, ground: 0 }), L = c.lines, X = [292, 180, 68], K = c.keys || ['tEq2', 'tIsoA2', 'tScaA2'], by = c.by || 'side';
  const Rs = K.map((k, i) => { el('rect', { x: X[i] - 54, y: 22, width: 108, height: 196, rx: 14, fill: GEO.paper, stroke: css('--line'), 'stroke-width': 2 }, svg); return polyAt(svg, k, [X[i], 110], { s: .6, dots: false }); });
  await S(L[0]); for (const [i, R] of Rs.entries()) { await tapOne([{ g: R.g, k: i, label: labelText('plyShape') + ' ' + DG(i + 1) }], { ok: i, pad: 30, pulse: true }); SFX.tick();
    if (by === 'side') { for (let j = 0; j < 3; j++) { const sl = sideLabel(svg, R, j); if (sl) sl.setAttribute('transform', `translate(${(R.sides[j].mid[0] - R.cen[0]) * -.25} ${(R.sides[j].mid[1] - R.cen[1]) * -.25})`); } polyMarks(R.g, R, ['eq']); }
    else { for (let j = 0; j < 3; j++) vertLabel(svg, R, j); }
    const t = el('text', { x: X[i], y: 205, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: GEO.ink }, svg); t.textContent = labelText('ply.' + (by === 'side' ? 'ts.' + R.pr.side : 'ta.' + R.pr.ang)); await S('gen.poly.' + (by === 'side' ? 'ts.' + R.pr.side : 'ta.' + R.pr.ang) + '.def'); }
  logAttempt({ scene: c.s || 'explore', tag: 'triMeasure', ok: true }); await S(L[1]); };
/* لغز: هل يوجد مثلث بزاويتين قائمتين؟ قاعدة، وعند طرفيها ضلعان قائمان يطولان ولا يلتقيان. lines: [السؤال، بعد الامتداد، ختام] */
SCENES.twoRight = async c => { const svg = plyStage(), L = c.lines, A = [110, 190], B = [250, 190]; geoLine(svg, A[0], A[1], B[0], B[1], { color: PLY.edge, w: 4 }); [A, B].forEach(p => ptAt(svg, p[0], p[1]));
  const l1 = geoLine(svg, A[0], A[1], A[0], A[1] - 40, { color: CRS.a, w: 4 }), l2 = geoLine(svg, B[0], B[1], B[0], B[1] - 40, { color: CRS.b, w: 4 }); perpMarkAt(svg, A, 0, 90); perpMarkAt(svg, B, 90, 180);
  await S(L[0]); const k = await choosePick([['yes', labelText('plyMeet'), '<i></i>', 'gen.poly.meetYes'], ['no', labelText('plyNoMeet'), '<i></i>', 'gen.poly.meetNo']], null);
  await symTween(900, t => { l1.setAttribute('y2', A[1] - 40 - 130 * t); l2.setAttribute('y2', B[1] - 40 - 130 * t); }); geoArrow(svg, A[0], 22, -90, CRS.a, 10); geoArrow(svg, B[0], 22, -90, CRS.b, 10);
  logAttempt({ scene: c.s || 'explore', tag: 'twoRight', ok: k === 'no' }); await S(L[1]); await S(L[2]); };
/* المتجاورة والمتقابلة: مستطيل أب ج د؛ يلمس الطفل الضلع أب، ثم ضلعين يلتقيان به، ثم الباقي. lines: [المس أب، المس ضلعاً يلتقي به، والآخر، هذان متجاوران له، المس الباقي، متقابلان، والزوايا كذلك] */
SCENES.adjOppShow = async c => { const svg = plyStage(), L = c.lines, R = polyAt(svg, c.k || 'qRect', [180, 118], { names: ['a', 'b', 'j', 'd'] }), T = (ks) => R.sides.map((g, i) => ({ g, k: i, label: labelText('plySide') + ' ' + DG(i + 1) })).filter(t => ks.includes(t.k));
  S(L[0], { free: true }); await tapOne(T([0]), { ok: 0, pad: 36 }); hush(); polyHl(R, 'side', 0, CRS.b);
  const adj = [1, 3]; S(L[1], { free: true }); let n = 0, got = [];
  while (got.length < 2) { const k = await tapOne(T([1, 2, 3].filter(j => !got.includes(j))), { ok: adj.filter(j => !got.includes(j)), pad: 36 }); hush(); const ok = adj.includes(k); logAttempt({ scene: c.s || 'explore', tag: 'adjOpp', ok, firstTry: n === 0 }); n++;
    if (ok) { got.push(k); polyHl(R, 'side', k, CRS.a); SFX.tick(); if (got.length === 1) await S(L[2]); } else { SFX.soft(); await S('gen.poly.adjNo'); } }
  await S(L[3]); S(L[4], { free: true }); await tapOne(T([2]), { ok: 2, pad: 36 }); hush(); polyHl(R, 'side', 2, PLY.hl); await S(L[5]);
  for (const [i, col] of [[0, CRS.b], [2, CRS.b], [1, CRS.a], [3, CRS.a]]) { el('circle', { cx: R.P[i][0], cy: R.P[i][1], r: 10, fill: col, 'pointer-events': 'none' }, svg); await sleep(FAST ? 10 : 220); }
  await S(L[6]); };
/* أسئلة الفحص الثلاثة على شكل: يلمس الطفل الأدوات، فتظهر علامات التوازي ثم التساوي ثم القوائم، وتُقال. c.k، lines: [مقدمة، توازٍ، تساوٍ، زوايا، ختام] */
SCENES.quadChecks = async c => { const svg = plyStage(), L = c.lines, R = polyAt(svg, c.k, [196, 118], { rot: c.rot || 0 }); await S(L[0]);
  for (const [j, w] of ['par', 'eq', 'right'].entries()) { const hot = plyHot(svg, 26, 20, 308, 192); S(L[j + 1], { free: true }); await tapOne([{ g: hot, k: w, label: labelText('plyCheck.' + w) }], { ok: w, pad: false, pulse: false }); hush(); hot.remove(); polyMarks(R.g, R, [w]); if (w === 'eq') for (let i = 0; i < R.n; i++) sideLabel(svg, R, i); SFX.tick(); await sleep(FAST ? 10 : 500); }
  logAttempt({ scene: c.s || 'explore', tag: 'quadChecks', ok: true }); await S(L[4]); };
/* المربع يدور: يميل ربع ربع دورة، والعلامات معه لا تتغيّر. lines: [السؤال، بعد الدوران] */
SCENES.squareTilt = async c => { const svg = plyStage(), L = c.lines, holder = el('g', {}, svg); let R = polyAt(holder, c.k || 'qSq', [180, 118], { marks: true });
  const hot = plyHot(svg, 26, 20, 308, 192); S(L[0], { free: true }); await tapOne([{ g: hot, k: 't', label: labelText('turnIt') }], { ok: 't', pad: false }); hush(); hot.remove();
  await symTween(900, t => { holder.innerHTML = ''; R = polyAt(holder, c.k || 'qSq', [180, 118], { rot: 45 * t, marks: true }); }); SFX.tick(); logAttempt({ scene: c.s || 'explore', tag: 'squareTilt', ok: true }); await S(L[1]); };
/* صانع الرباعيات (لعبة د4): أعواد مستطيل (أو مربع)، يُميله الطفل بالزرّين فيصير متوازي أضلاع (أو معيّناً)؛ الأطوال باقية والقوائم تزول. ثم يسمّيه.
   c.from: rect | square، lines: [الدعوة، بعد الإمالة، السؤال، ختام] */
SCENES.quadMaker = async c => { const svg = plyStage(), L = c.lines, sq = c.from === 'square', W = sq ? 100 : 150, H = sq ? 100 : 80, len = H, holder = el('g', {}, svg); let sh = 0;
  const draw = () => { holder.innerHTML = ''; const dx = len * Math.sin(sh * Math.PI / 180), dy = len * Math.cos(sh * Math.PI / 180), C = [180, 118], P = [[-W / 2 + dx / 2, -dy / 2], [W / 2 + dx / 2, -dy / 2], [W / 2 - dx / 2, dy / 2], [-W / 2 - dx / 2, dy / 2]]; const R = polyAt(holder, { p: P }, C, { marks: true }); for (let i = 0; i < 4; i++) sideLabel(holder, R, i); return R; };
  let R = draw(); S(L[0], { free: true }); let n = 0; const nudge = rulNudges(svg, 254, s => { sh = Math.max(0, Math.min(40, sh + s * 10)); R = draw(); n++; SFX.tick(); }, ['plyTiltMore', 'plyTiltLess']);
  AUTO({ kind: 'plyTilt', ok: () => { sh = 30; R = draw(); rulDoneBtn().click(); } }); await rulDone(() => nudge.forEach(b => b.remove())); hush();
  if (!sh) { sh = 30; await symTween(500, t => { sh = 30 * t; R = draw(); }); } await S(L[1]);
  const opts = sq ? ['square', 'rhom', 'rect'] : ['rect', 'para', 'square'], okK = QTRUE[sq ? 'rhom' : 'para'];
  await S(L[2]); let t = 0; while (true) { const k = await choosePick(opts.map(o => plyOpt('q', o)), okK), ok = okK.includes(k); logAttempt({ scene: c.s || 'game', tag: 'quadMaker', ok, firstTry: t === 0 }); t++; if (ok) { SFX.good(); break; } SFX.soft(); await S('gen.poly.makerNo'); }
  await S(L[3]); };
/* القطر: يلمس الطفل رأسين متقابلين فيُرسم القطر، ثم الآخر؛ ثم يُقاس القطران. c.k، lines: [المس رأسين، هذا قطر، والآخر، كم قطراً، الطولان] */
SCENES.diagShow = async c => { const svg = plyStage(), L = c.lines, R = polyAt(svg, c.k || 'qRect', [180, 118], { names: ['a', 'b', 'j', 'd'] }), V = ex => R.verts.map((g, i) => ({ g, k: i, label: labelText('plyVertex') + ' ' + DG(i + 1) })).filter(t => !ex.includes(t.k));
  const D = [];
  for (const [j, [a, b]] of [[0, 2], [1, 3]].entries()) { S(L[j ? 2 : 0], { free: true }); await tapOne(V([]), { ok: a, pad: 40, bad: b }); hush(); polyHl(R, 'vtx', a); await tapOne(V([a]), { ok: b, pad: 40 }); hush(); polyHl(R, 'vtx', b);
    D.push(geoLine(svg, R.P[a][0], R.P[a][1], R.P[b][0], R.P[b][1], { color: j ? CRS.a : CRS.b, w: 3.6 })); SFX.tick(); if (!j) await S(L[1]); }
  await S(L[3]); if (L[4]) { for (const [a, b] of [[0, 2], [1, 3]]) { const l = Math.hypot(R.P[b][0] - R.P[a][0], R.P[b][1] - R.P[a][1]), m = [(R.P[a][0] * .62 + R.P[b][0] * .38), (R.P[a][1] * .62 + R.P[b][1] * .38)], g = el('g', { 'pointer-events': 'none' }, svg); el('rect', { x: m[0] - 26, y: m[1] - 14, width: 52, height: 21, rx: 6, fill: '#fff', stroke: css('--compass') }, g); const t = el('text', { x: m[0], y: m[1] + 2, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: css('--compass') }, g); t.textContent = String(cmOf(l)).replace('.', '٫') + ' ' + labelText('rulCm'); await sleep(FAST ? 10 : 400); } await S(L[4]); }
  logAttempt({ scene: c.s || 'explore', tag: 'diagShow', ok: true }); };
/* شجرة العائلة تُبنى: كل شكل يُلمس فيذهب إلى مكانه، ثم «هل المربع مستطيل؟» بفحص الخصائص. lines: [مقدمة، (لكل شكل جملة)…، السؤال، الفحص، ختام] */
SCENES.famBuild = async c => { const svg = newStage(296, { oasis: false, ground: 0 }), L = c.lines, F = famTreeAt(svg); Object.values(F.box).forEach(b => b.setAttribute('opacity', .25)); await S(L[0]);
  const order = ['para', 'rect', 'rhom', 'square', 'trap', 'kite'], K = { para: 'qPara', rect: 'qRect', rhom: 'qRhom2', square: 'qSq', trap: 'qTrap', kite: 'qKite' };
  for (const [i, f] of order.entries()) { el('rect', { x: 20, y: 222, width: 120, height: 68, rx: 12, fill: GEO.paper, stroke: css('--line'), 'stroke-width': 2 }, svg); const R = polyAt(svg, K[f], [80, 256], { s: .42, marks: true, dots: false });
    await tapOne([{ g: R.g, k: f, label: labelText('plyShape') }], { ok: f, pad: 30, pulse: true }); SFX.tick(); R.g.remove(); F.box[f].setAttribute('opacity', 1); okRing(svg, F.box[f], 3); await S(L[1 + i]); }
  await S(L[7]); for (const k of ['par', 'eq', 'right']) { const t = el('text', { x: 300, y: 236 + ['par', 'eq', 'right'].indexOf(k) * 18, 'text-anchor': 'middle', 'font-size': 12, fill: css('--think') }, svg); t.textContent = labelText('plyCheck.' + k); await sleep(FAST ? 10 : 300); }
  logAttempt({ scene: c.s || 'explore', tag: 'famBuild', ok: true }); await S(L[8]); await S(L[9]); };
/* أسماء المضلعات: يلمس الطفل الشكل فتُعدّ أضلاعه ويُسمّى. c.keys، lines: [مقدمة، ختام] */
SCENES.polyNames = async c => { const L = c.lines; await S(L[0]); for (const k of c.keys || ['r5', 'r6', 'r8']) { const svg = plyStage(), R = polyAt(svg, k, [180, 118], {}), hot = plyHot(svg, 26, 20, 308, 192);
    await tapOne([{ g: hot, k, label: labelText('plyShape') }], { ok: k, pad: false }); hot.remove(); const b = el('g', { 'pointer-events': 'none' }, svg); await badgeCount(b, R.sides.map(sg => ({ x: sg.mid[0], y: sg.mid[1] })), css('--compass')); await S('gen.poly.n.' + R.n); }
  logAttempt({ scene: c.s || 'explore', tag: 'polyNames', ok: true }); await S(L[1]); };
/* المنتظم: ثلاثة أشكال تُقاس أضلاعها وزواياها. c.keys، lines: [مقدمة، (لكل شكل جملة)…، ختام] */
SCENES.regularShow = async c => { const L = c.lines, K = c.keys || ['qSq', 'qRect', 'qRhom']; await S(L[0]);
  for (const [i, k] of K.entries()) { const svg = plyStage(), R = polyAt(svg, k, [180, 118], {}), T = plyTools(svg, R, { ang: true }); await T.show('len'); await T.show('ang'); T.off(); await S(L[1 + i]); }
  logAttempt({ scene: c.s || 'explore', tag: 'regularShow', ok: true }); await S(L[K.length + 1]); };
/* المنبعج: يلمس الطفل الرأس المنبعج فيُرسم قوس زاويته الداخلية بنفسجياً، وقياسها أكبر من نصف دورة. lines: [مقدمة، المس الرأس، منعكسة، وما زال مضلعاً] */
SCENES.concaveShow = async c => { const svg = plyStage(), L = c.lines, R = polyAt(svg, c.k || 'c5', [180, 118], {}), w = R.pr.A.findIndex(a => a > 180.5); await S(L[0]);
  S(L[1], { free: true }); let n = 0; while (true) { const k = await tapOne(R.verts.map((g, i) => ({ g, k: i, label: labelText('plyVertex') + ' ' + DG(i + 1) })), { ok: w, pad: 40 }); hush(); logAttempt({ scene: c.s || 'explore', tag: 'concaveShow', ok: k === w, firstTry: n === 0 }); n++; if (k === w) break; SFX.soft(); await S('gen.poly.concaveNo'); }
  vertLabel(svg, R, w, PLY.rx); SFX.good(); await S(L[2]); await S(L[3]); };
/* خلية النحل (لعبة د6): سداسيات منتظمة تُوضع في أماكنها فلا تترك فراغاً؛ ثم خماسيات تترك فراغاً. lines: [الدعوة، بلا فراغ، الخماسيات، ختام] */
SCENES.honeycomb = async c => { const svg = plyStage(), L = c.lines, r = 30, w = r * Math.sqrt(3), C0 = [180, 118], slots = [[0, 0], [w, 0], [-w, 0], [w / 2, -1.5 * r], [-w / 2, -1.5 * r], [w / 2, 1.5 * r], [-w / 2, 1.5 * r]].map(([x, y]) => [C0[0] + x, C0[1] + y]);
  const hex = (C, col, op = 1) => { const g = el('g', {}, svg); el('polygon', { points: polyStr(polyReg(6, r, -90).map(([x, y]) => [C[0] + x, C[1] + y])), fill: col, stroke: '#fff', 'stroke-width': 2.5, opacity: op }, g); return g; };
  const shadows = slots.map(C => hex(C, '#cfdde6', .6)); shadows[0].remove(); hex(slots[0], '#f2b84b'); S(L[0], { free: true }); const left = new Set([1, 2, 3, 4, 5, 6]);
  while (left.size) { const k = await tapOne([...left].map(i => ({ g: shadows[i], k: i, label: labelText('plyHex') })), { ok: [...left], pad: 30 }); if (left.size === 6) hush(); left.delete(k); shadows[k].remove(); hex(slots[k], '#f2b84b'); SFX.tick(); }
  logAttempt({ scene: c.s || 'game', tag: 'honeycomb', ok: true }); SFX.good(); await S(L[1]);
  const s2 = plyStage(), p5 = polyReg(5, 34); for (const [x, y, a] of [[130, 118, 0], [200, 106, 36]]) el('polygon', { points: polyStr(polyXf(p5, [x, y], a)), fill: '#9fc6a8', stroke: '#fff', 'stroke-width': 2.5 }, s2); thinkRing(s2, [166, 140], 12); await S(L[2]); await S(L[3]); };
/* فوضى تقصّ المستطيل بقطره: «ضاع المستطيل!»، والطفل يعيد المثلثين. lines: [فوضى، الدعوة، ختام] */
SCENES.cutRect = async c => { const svg = plyStage(), L = c.lines, P = [[110, 70], [250, 70], [250, 166], [110, 166]], t1 = el('polygon', { points: polyStr([P[0], P[1], P[2]]), fill: '#f2b84b', stroke: '#fff', 'stroke-width': 2.5 }, svg), t2 = el('polygon', { points: polyStr([P[0], P[2], P[3]]), fill: '#e8a33d', stroke: '#fff', 'stroke-width': 2.5 }, svg);
  const fz = chaosAt(svg, 318, 40, .3); await chaosGiggle(fz); const cut = geoLine(svg, P[0][0], P[0][1], P[2][0], P[2][1], { color: PLY.cut, w: 3, dash: '7 5' }); await sleep(FAST ? 10 : 400); cut.remove();
  const g1 = el('g', {}, svg), g2 = el('g', {}, svg); g1.appendChild(t1); g2.appendChild(t2); const away = [[40, -22, 8], [-42, 26, -10]], put = (g, [x, y, a], t) => g.setAttribute('transform', `translate(${x * t} ${y * t}) rotate(${a * t} 180 118)`); await symTween(500, t => { put(g1, away[0], t); put(g2, away[1], t); });
  await S(L[0]); S(L[1], { free: true }); for (const [i, g] of [g1, g2].entries()) { await tapOne([{ g, k: 'g', label: labelText('plyPiece') }], { ok: 'g', pad: 30, pulse: true }); if (!i) hush(); await symTween(400, t => put(g, away[i], 1 - t)); SFX.tick(); }
  hush(); geoLine(svg, P[0][0], P[0][1], P[2][0], P[2][1], { color: PLY.cut, w: 2.4, dash: '7 5' }); logAttempt({ scene: c.s || 'hook', tag: 'cutRect', ok: true }); SFX.good(); await S(L[2]); };
/* التركيب: مثلثان قائمان متطابقان؛ يلمس الطفل طريقة لصق فيظهر الشكل الناتج ويُسمّى. lines: [مقدمة، ختام] */
const COMPOSE = { rect: { k: 'cRect', seam: [1, 3] }, para: { k: 'cPara', seam: [1, 3] }, kite: { k: 'cKite', seam: [1, 3] }, tri: { k: 'cTri', seam: [[-30, 0], [70, 0]] } };
/* خطّ اللصق: طرفاه رأسان (رقمان) أو نقطتان بإحداثيات الشكل */
function seamAt(svg, R, seam, C, rot = 0, s = 1) { const pt = x => typeof x === 'number' ? R.P[x] : polyXf([x], C, rot, s)[0], A = pt(seam[0]), B = pt(seam[1]); return geoLine(svg, A[0], A[1], B[0], B[1], { color: PLY.cut, w: 2.6, dash: '7 5' }); }
/* مثلثان قائمان متطابقان (ضلعا القائمة 100 و60) يُلصقان بضلعين متساويين: على الوتر مستطيلاً أو طائرة ورقية، وعلى الضلع الطويل متوازي أضلاع أو مثلثاً متساوي الساقين */
Object.assign(POLYS, { cRect: { p: [[-50, -30], [50, -30], [50, 30], [-50, 30]] }, cPara: { p: [[-50, 60], [-50, 0], [50, -60], [50, 0]] }, cKite: { p: [[-50, -44], [50, -44], [2.94, 44.24], [-50, 16]] }, cTri: { p: [[-30, -60], [70, 0], [-30, 60]] } });
SCENES.composeShow = async c => { const L = c.lines; await S(L[0]); for (const f of c.order || ['rect', 'para', 'kite']) { const svg = plyStage(), C = COMPOSE[f], R = polyAt(svg, C.k, [180, 118], { dots: false }); seamAt(svg, R, C.seam, [180, 118]);
    const hot = plyHot(svg, 26, 20, 308, 192); await tapOne([{ g: hot, k: f, label: labelText('plyShape') }], { ok: f, pad: false, pulse: false }); hot.remove(); polyMarks(R.g, R, true); SFX.tick(); await S('gen.poly.comp.' + f); }
  logAttempt({ scene: c.s || 'explore', tag: 'composeShow', ok: true }); await S(L[1]); };
/* ثلاثة مربعات: يلمس الطفل موضعاً للمربع الثالث بجانب اثنين متجاورين، فيظهر الشكل في صندوق «مستقيم» أو «زاوية». lines: [الدعوة، الأشكال اثنان] */
SCENES.trominoes = async c => { const svg = plyStage(), L = c.lines, cc = 34, O = [146, 70], bins = { I: [], L: [] }; minoAt(svg, [[0, 0], [1, 0]], O[0], O[1], cc);
  const spots = [[-1, 0, 'I'], [2, 0, 'I'], [0, -1, 'L'], [1, -1, 'L'], [0, 1, 'L'], [1, 1, 'L']], gs = spots.map(([a, b]) => { const g = el('g', {}, svg); el('rect', { x: O[0] + a * cc + 3, y: O[1] + b * cc + 3, width: cc - 6, height: cc - 6, rx: 4, fill: 'none', stroke: css('--think'), 'stroke-width': 2, 'stroke-dasharray': '4 3' }, g); return g; });
  const box = (k, x) => { el('rect', { x: x - 60, y: 150, width: 120, height: 60, rx: 10, fill: '#fff', stroke: css('--line'), 'stroke-width': 2 }, svg); }; box('I', 260); box('L', 100);
  S(L[0], { free: true }); const left = new Set(gs.keys()); while (left.size) { const k = await tapOne([...left].map(i => ({ g: gs[i], k: i, label: labelText('plySpot') })), { ok: [...left], pad: 36 }); if (left.size === 6) hush(); left.delete(k); gs[k].remove(); const [a, b, t] = spots[k];
    const tmp = minoAt(svg, [[a, b]], O[0], O[1], cc, '#f2b84b'); await sleep(FAST ? 10 : 300); tmp.remove(); bins[t].push(k); const n = bins[t].length - 1; minoAt(svg, t === 'I' ? [[0, 0], [1, 0], [2, 0]] : [[0, 0], [1, 0], [0, 1]], (t === 'I' ? 216 : 74) + (n % 3) * 4, 160 + (n % 3) * 3, 11, '#6c7fa8'); SFX.tick(); }
  logAttempt({ scene: c.s || 'explore', tag: 'trominoes', ok: true }); await S(L[1]); };
/* مدينة المضلعات (مشروع د7): صورة فيها نافذة وباب وبلاطة ولافتة وطائرة ورقية؛ يختار الطفل ثلاثة، ولكلٍّ يسمّيه بعدد أضلاعه ثم يحكم: منتظم أم لا. lines: [المقدمة، دعوة الاختيار، بعد كل شيء، ختام] */
const CITY_POLY = { window: { k: 'qSq', at: [292, 70], s: .5 }, door: { k: 'qRect2', at: [196, 80], s: .45 }, tile: { k: 'r6', at: [92, 74], s: .5 }, sign: { k: 'r8', at: [270, 176], s: .48 }, kite: { k: 'qKite', at: [130, 176], s: .48 } };
SCENES.polyCity = async c => { const L = c.lines, chosen = [];
  const city = () => { const svg = newStage(250, { oasis: false, ground: 0 }); el('rect', { x: 14, y: 10, width: 332, height: 230, rx: 14, fill: '#e3ecd9', stroke: css('--line'), 'stroke-width': 2 }, svg); const G = {};
    for (const [k, o] of Object.entries(CITY_POLY)) { const R = polyAt(svg, o.k, o.at, { s: o.s, dots: false, fill: { window: '#cfe6f5', door: '#c9a27a', tile: '#f2b84b', sign: '#e06a5a', kite: '#7db3e0' }[k] }); if (k === 'kite') geoLine(R.g, R.P[2][0], R.P[2][1], R.P[2][0] - 10, R.P[2][1] + 30, { color: GEO.ink, w: 1.6 }); if (chosen.includes(k)) R.g.setAttribute('opacity', .35); G[k] = R.g; } return { svg, G }; };
  { city(); await S(L[0]); }
  for (let i = 0; i < 3; i++) { const { G } = city(), left = Object.keys(CITY_POLY).filter(k => !chosen.includes(k)); S(L[1], { free: true });
    const k = await tapOne(left.map(x => ({ g: G[x], k: x, label: labelText('plyCity.' + x) })), { ok: left, pad: 30, pulse: false }); hush(); chosen.push(k); SFX.tick(); const pk = CITY_POLY[k].k, n = POLYS[pk].p.length;
    for (const [def, spec, tag] of [[ITEM.polyName, { k: pk, pick: [n - 1, n, n + 1].filter(x => x >= 3).concat(n === 3 ? [5] : []), q: 'gen.poly.cityName' }, 'cityName'], [ITEM.regularQ, { k: pk, q: 'gen.poly.cityReg' }, 'cityReg']]) { const it = def.make(spec); let t = 0;
      while (true) { const r = await def.ask(it, 'explore', t >= 2 ? 3 : 0), ok = def.judge(it, r.ans).ok; document.querySelectorAll('#stage .choices').forEach(b => b.remove()); logAttempt({ scene: c.s || 'game', tag, ok, firstTry: t === 0 }); t++; if (ok) { if (def.onOk) await def.onOk(it, r); break; } SFX.soft(); await S('gen.ang.again'); } }
    await S(L[2]); }
  { city(); SFX.good(); logAttempt({ scene: c.s || 'game', tag: 'polyCity', ok: true }); await S(L[3]); } };
/* استدعاء */
SCENES.recallPoly = async c => { const svg = plyStage(), R = polyAt(svg, c.k || 'r5', [180, 118], { marks: c.marks, names: c.nm, rot: c.rot || 0 }); if (c.measure) { for (let i = 0; i < R.n; i++) sideLabel(svg, R, i); } if (c.angles) for (let i = 0; i < R.n; i++) vertLabel(svg, R, i); await sleep(300); await S(c.lines); };
SCENES.recallFam = async c => { const svg = newStage(296, { oasis: false, ground: 0 }); famTreeAt(svg); await sleep(300); await S(c.lines); };
WRAP_ART.polyArt = svg => { const g = el('g', {}, svg); [['tEq2', 90, 150, .7], ['qSq2', 180, 150, .7], ['r6', 270, 150, .6]].forEach(([k, x, y, s]) => polyAt(g, k, [x, y], { s, dots: false, fill: '#f2d38a' })); anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200, fill: 'both' }); palmAt(svg, 330, 250, .7); palmAt(svg, 30, 250, .8); };
WRAP_ART.famArt = svg => { const g = el('g', { transform: 'translate(0 20)' }, svg); famTreeAt(g); anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200, fill: 'both' }); };
WRAP_ART.hiveArt = svg => { const g = el('g', {}, svg); for (const [x, y] of [[180, 140], [232, 140], [128, 140], [206, 95], [154, 95], [206, 185], [154, 185]]) el('polygon', { points: polyStr(polyReg(6, 30, -90).map(([a, b]) => [x + a, y + b])), fill: '#f2b84b', stroke: '#fff', 'stroke-width': 2.5 }, g); anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200, fill: 'both' }); palmAt(svg, 330, 250, .7); palmAt(svg, 30, 250, .8); };
