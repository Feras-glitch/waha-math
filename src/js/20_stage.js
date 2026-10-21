/* =====================================================================
   الرسم: قصاصات ورقية، وأشياء من البيت، وشخصيات، وأفق المدينة
   ===================================================================== */
const ICON = {
  play: '<svg viewBox="0 0 24 24"><path d="M16 5v14L5 12z" fill="currentColor"/></svg>',
  sound: '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8a5 5 0 010 8M18.5 5.5a8.5 8.5 0 010 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  mute: '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  gallery: '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="13" r="3.6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 6l1.6-2.4h4.8L16 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  map: '<svg viewBox="0 0 24 24"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 4v14M15 6v14" stroke="currentColor" stroke-width="2"/></svg>',
};
/* تعريفات مشتركة لكل لوحة: ظل ورقي حاد، ولمعة علوية، وسماء */
function defs() {
  const g = $('#gdefs');
  g.innerHTML = `<defs><filter id="pp" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="4" stdDeviation="0.6" flood-color="#1b3440" flood-opacity=".22"/></filter>
    <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${css('--sky-top')}"/><stop offset="1" stop-color="${css('--sky-bot')}"/></linearGradient>
    <radialGradient id="ballG" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#ffd2c4"/><stop offset=".6" stop-color="#ee7a5f"/><stop offset="1" stop-color="#b54a33"/></radialGradient>
    <pattern id="weave" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="${css('--basket')}"/><path d="M0 5h10M5 0v10" stroke="${css('--basket-dk')}" stroke-width="2" opacity=".55"/></pattern>
    <linearGradient id="leg" x1="0" x2="1"><stop offset="0" stop-color="#e7edf0"/><stop offset="1" stop-color="#9eabb2"/></linearGradient>
    <radialGradient id="hd" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#4f8fcb"/><stop offset="1" stop-color="#1f5f99"/></radialGradient>
    <radialGradient id="st" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#f27b6b"/><stop offset="1" stop-color="#c23a2e"/></radialGradient></defs>`;
}
/* سماء وغيوم وأفق خافت خلف المشهد */
function backdrop(svg, H, opt = {}) {
  el('rect', { x: 0, y: 0, width: 360, height: H, fill: 'url(#skyG)' }, svg);
  for (const [x, y, s] of [[60, 34, 1], [270, 22, .8], [190, 58, .6]]) { const c = el('g', { transform: `translate(${x} ${y}) scale(${s})`, opacity: .9 }, svg);
    el('rect', { x: -30, y: -8, width: 60, height: 18, rx: 9, fill: '#ffffff' }, c); el('circle', { cx: -6, cy: -10, r: 12, fill: '#ffffff' }, c); el('circle', { cx: 12, cy: -6, r: 9, fill: '#ffffff' }, c); }
  if (opt.city !== false) skyline(svg, { y: H - (opt.ground ?? 26), h: opt.cityH ?? 70, n: opt.n ?? 9, opacity: opt.cityOpacity ?? .35 });
  if (opt.ground !== 0) el('rect', { x: 0, y: H - (opt.ground ?? 26), width: 360, height: opt.ground ?? 26, fill: css('--ground') }, svg);
}
/* أفق الواحة: مبانٍ من الأشكال (مستطيل، ومربع بسقف مثلث، وقبة دائرية) */
const BUILD = [
  { t: 'tower', x: 8, w: 40, h: 86, c: '#7cc4b8' }, { t: 'house', x: 52, w: 46, h: 44, c: '#f4a38e' }, { t: 'dome', x: 102, w: 52, h: 58, c: '#b9a3d8' },
  { t: 'tower', x: 158, w: 34, h: 100, c: '#f6cf7e' }, { t: 'house', x: 196, w: 50, h: 50, c: '#7cc4b8' }, { t: 'tower', x: 250, w: 38, h: 76, c: '#f4a38e' },
  { t: 'dome', x: 292, w: 60, h: 64, c: '#f6cf7e' }, { t: 'house', x: 20, w: 0, h: 0, c: '' }];
function skyline(svg, { y, h = 70, n = 7, opacity = 1, scale = 1 }) {
  const g = el('g', { opacity, transform: `translate(0 ${y}) scale(1 ${h / 100})` }, svg);
  BUILD.slice(0, n).forEach(b => { if (!b.w) return;
    if (b.t === 'tower') { el('rect', { x: b.x, y: -b.h, width: b.w, height: b.h, fill: b.c }, g);
      for (let r = 1; r < b.h / 18; r++) for (let k = 0; k < 2; k++) el('rect', { x: b.x + 7 + k * (b.w - 21), y: -b.h + r * 16, width: 7, height: 8, fill: '#ffffff', opacity: .75 }, g); }
    if (b.t === 'house') { el('rect', { x: b.x, y: -b.h, width: b.w, height: b.h, fill: b.c }, g); el('polygon', { points: `${b.x - 4},${-b.h} ${b.x + b.w / 2},${-b.h - b.w * .55} ${b.x + b.w + 4},${-b.h}`, fill: '#8e6bbf', opacity: .85 }, g);
      el('rect', { x: b.x + b.w / 2 - 7, y: -18, width: 14, height: 18, fill: '#ffffff', opacity: .75 }, g); }
    if (b.t === 'dome') { el('rect', { x: b.x, y: -b.h, width: b.w, height: b.h, fill: b.c }, g); el('path', { d: `M${b.x + 6} ${-b.h} a${b.w / 2 - 6} ${b.w / 2 - 6} 0 0 1 ${b.w - 12} 0z`, fill: '#ee7a5f', opacity: .8 }, g);
      el('rect', { x: b.x + b.w / 2 - 6, y: -b.h + 14, width: 12, height: 14, rx: 6, fill: '#ffffff', opacity: .75 }, g); } });
  return g;
}
/* ألوان المسائل محايدة: لا يُصنَّف الشكل بلونه (قاعدة التصميم في مواصفة المحرّك) */
const NEUTRAL = ['#6c7fa8', '#b07a57', '#7e9a4e', '#b8607a', '#5c9bb0', '#8c8c6e'];
let colorIx = 0; const nextColor = () => NEUTRAL[(colorIx++) % NEUTRAL.length];
const IDC = { circle: '--circle', square: '--square', triangle: '--triangle', rect: '--rect' };

/* نقاط الأشكال (مركزها 0،0) */
function shapeGeom(s) {
  const S = s.size || 110;
  switch (s.type) {
    case 'square': return { poly: [[-S / 2, -S / 2], [S / 2, -S / 2], [S / 2, S / 2], [-S / 2, S / 2]] };
    case 'rect': { const w = s.w || S * 1.5, h = s.h || S * .8; return { poly: [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]] }; }
    case 'triangle': { const w = s.w || S, h = s.h || S * .9, ax = s.apex ?? 0; return { poly: [[ax * w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]] }; }
    case 'circle': return { r: S / 2 };
    case 'oval': return { rx: S / 2, ry: S / 3.1 };
    default: return {};
  }
}
const polyStr = p => p.map(q => q.join(',')).join(' ');
/* قصاصة ورقية: ظل، ولون، وحافة بيضاء، ولمعة */
const flatPlain = s => !!s.plain || (CUR && unitOf(CUR) === 'm1.u2');   // D191: في مشهد يجمع المسطّح والمجسّم يُرسم المسطّح بلا ظل ولا لمعة
function paper(parent, s) {
  const plainF = flatPlain(s); const g = el('g', plainF ? {} : { filter: 'url(#pp)' }, parent); const geo = shapeGeom(s); const c = s.color; const edge = s.edge === false ? 'none' : '#ffffff';
  const add = (fill, stroke) => {
    if (s.type === 'circle') return el('circle', { cx: 0, cy: 0, r: geo.r, fill, stroke, 'stroke-width': 4 }, g);
    if (s.type === 'oval') return el('ellipse', { cx: 0, cy: 0, rx: geo.rx, ry: geo.ry, fill, stroke, 'stroke-width': 4 }, g);
    if (s.type === 'curvedTri') { const S = s.size || 110; return el('path', { d: `M0 ${-S * .45} Q${S * .55} ${-S * .05} ${S / 2} ${S * .45} L${-S / 2} ${S * .45} Z`, fill, stroke, 'stroke-width': 4, 'stroke-linejoin': 'round' }, g); }
    if (s.type === 'openTri') { const S = s.size || 110; return el('path', { d: `M-8 ${-S * .4} L${-S / 2} ${S * .45} L${S / 2} ${S * .45} L8 ${-S * .4}`, fill: 'none', stroke: c, 'stroke-width': 12, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g); }
    return el('polygon', { points: polyStr(geo.poly), fill, stroke, 'stroke-width': 4, 'stroke-linejoin': 'round' }, g);
  };
  add(c, edge); if (s.type !== 'openTri' && !plainF) add('url(#shine)', 'none');
  decorate(g, s);
  return g;
}
/* أشياء من البيت فوق القصاصة */
function decorate(g, s) {
  const S = s.size || 110, o = s.object; if (!o) return;
  const W = '#ffffff';
  if (o === 'plate') { el('circle', { r: S / 2 - 13, fill: 'none', stroke: W, 'stroke-opacity': .7, 'stroke-width': 3 }, g); el('circle', { r: S / 2 - 22, fill: W, 'fill-opacity': .18 }, g); }
  if (o === 'clock') { el('circle', { r: S / 2 - 9, fill: '#fffdf6' }, g); for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; el('line', { x1: Math.cos(a) * (S / 2 - 16), y1: Math.sin(a) * (S / 2 - 16), x2: Math.cos(a) * (S / 2 - (k % 3 ? 20 : 24)), y2: Math.sin(a) * (S / 2 - (k % 3 ? 20 : 24)), stroke: '#33454c', 'stroke-width': k % 3 ? 2 : 3.5 }, g); }
    el('line', { x1: 0, y1: 0, x2: 0, y2: -S / 2 + 26, stroke: '#1b3440', 'stroke-width': 4.5, 'stroke-linecap': 'round' }, g); el('line', { x1: 0, y1: 0, x2: S / 4.5, y2: 4, stroke: '#1b3440', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g); el('circle', { r: 4, fill: '#d9483b' }, g); }
  if (o === 'wheel') { el('circle', { r: S / 2 - 10, fill: '#3b4a52' }, g); el('circle', { r: S / 2 - 22, fill: '#c9d2d6' }, g); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; el('line', { x1: 0, y1: 0, x2: Math.cos(a) * (S / 2 - 22), y2: Math.sin(a) * (S / 2 - 22), stroke: '#3b4a52', 'stroke-width': 4 }, g); } el('circle', { r: 7, fill: '#3b4a52' }, g); }
  if (o === 'tile') { const h = S / 2 - 10; el('rect', { x: -h, y: -h, width: 2 * h, height: 2 * h, fill: 'none', stroke: W, 'stroke-opacity': .55, 'stroke-width': 3 }, g); el('polygon', { points: `0,${-h + 8} ${h - 8},0 0,${h - 8} ${-h + 8},0`, fill: W, 'fill-opacity': .25 }, g); }
  if (o === 'napkin') { const h = S / 2 - 9; el('rect', { x: -h, y: -h, width: 2 * h, height: 2 * h, fill: 'none', stroke: W, 'stroke-width': 2.5, 'stroke-dasharray': '6 5' }, g); }
  if (o === 'window') { const geo = shapeGeom(s); const [a, , c2] = [geo.poly[0], 0, geo.poly[2]]; const w = c2[0] - a[0], h = c2[1] - a[1];
    el('rect', { x: a[0] + 9, y: a[1] + 9, width: w - 18, height: h - 18, fill: '#d9f0f7' }, g); el('line', { x1: 0, y1: a[1] + 9, x2: 0, y2: c2[1] - 9, stroke: W, 'stroke-width': 6 }, g); el('line', { x1: a[0] + 9, y1: 0, x2: c2[0] - 9, y2: 0, stroke: W, 'stroke-width': 6 }, g); }
  if (o === 'door') { const geo = shapeGeom(s); const a = geo.poly[0], c2 = geo.poly[2]; const w = c2[0] - a[0], h = c2[1] - a[1];
    el('rect', { x: a[0] + 10, y: a[1] + 10, width: w - 20, height: h * .38, rx: 3, fill: W, 'fill-opacity': .22 }, g); el('rect', { x: a[0] + 10, y: a[1] + h * .52, width: w - 20, height: h * .38, rx: 3, fill: W, 'fill-opacity': .22 }, g);
    el('circle', { cx: c2[0] - 14, cy: 4, r: 5, fill: '#f6cf7e', stroke: '#9c6837', 'stroke-width': 1.5 }, g); }
  if (o === 'envelope') { const geo = shapeGeom(s); const a = geo.poly[0], c2 = geo.poly[2]; el('polyline', { points: `${a[0] + 4},${a[1] + 4} 0,${(a[1] + c2[1]) / 2 + 6} ${c2[0] - 4},${a[1] + 4}`, fill: 'none', stroke: W, 'stroke-width': 3.5, 'stroke-linejoin': 'round' }, g); }
  if (o === 'sign') { const geo = shapeGeom(s); const p = geo.poly; el('polygon', { points: polyStr(p.map(([x, y]) => [x * .72, y * .72 + 6])), fill: '#fffdf6' }, g); el('rect', { x: -4, y: -10, width: 8, height: 26, rx: 3, fill: '#1b3440' }, g); el('circle', { cx: 0, cy: 26, r: 4.5, fill: '#1b3440' }, g); }
  if (o === 'cheese') { for (const [x, y, r] of [[-14, 18, 7], [12, 26, 5], [2, 4, 5], [22, 10, 4]]) el('circle', { cx: x, cy: y, r, fill: '#000', 'fill-opacity': .14 }, g); }
}
function shapeAt(parent, s, x, y) { const g = el('g', { transform: `translate(${x} ${y}) rotate(${s.rot || 0})` }, parent); paper(g, s); return g; }
/* كرة مجسّمة (ليست دائرة) */
function ballAt(parent, x, y, r) { const g = el('g', { transform: `translate(${x} ${y})` }, parent); el('ellipse', { cx: 0, cy: r + 4, rx: r * .8, ry: 6, fill: '#000', opacity: .15 }, g); el('circle', { r, fill: 'url(#ballG)' }, g);
  el('path', { d: `M${-r} 0 Q0 ${r * .5} ${r} 0`, fill: 'none', stroke: '#fff', 'stroke-opacity': .7, 'stroke-width': 3 }, g); el('path', { d: `M0 ${-r} Q${r * .45} 0 0 ${r}`, fill: 'none', stroke: '#fff', 'stroke-opacity': .7, 'stroke-width': 3 }, g); return g; }


/* =====================================================================
   المجسّمات (الوحدة الثانية): تُرسم مجسّمةً حقاً — أوجه مظلّلة وظلّ على الأرض —
   أما الأشكال المسطّحة فتبقى قصاصات ورقية بلا سُمك كما في الوحدة الأولى.
   ===================================================================== */
const SOLIDC = { cube: '#9cc53b', sphere: '#ee86ad', cylinder: '#b27c50', cone: '#9aa8b2' };   // ألوان الرفاق (مواصفة S1-U2): ليموني، وردي، بني، فضي
let UID = 0; const uid = p => p + (++UID);
function mix(hex, to, k) { const n = parseInt(hex.slice(1), 16); const t = to === 'w' ? 255 : 0;
  const ch = sh => Math.round(((n >> sh) & 255) * (1 - k) + t * k); return '#' + ((1 << 24) + (ch(16) << 16) + (ch(8) << 8) + ch(0)).toString(16).slice(1); }
function grad(parent, kind, stops, attrs = {}) { const d = el('defs', {}, parent); const id = uid('g'); const g = el(kind, { id, ...attrs }, d); stops.forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, g)); return `url(#${id})`; }
const shadowAt = (g, y, rx) => el('ellipse', { cx: 0, cy: y, rx, ry: Math.max(5, rx * .16), fill: '#1b3440', opacity: .16 }, g);

/* صندوق ثلاثي الأبعاد بإسقاط حقيقي: دوران أفقي (yaw) وميل (pitch) ولفّ (roll)، وتظليل حسب الضوء */
function boxProject(w, h, d, yaw, pitch, roll = 0) {
  const r = a => a * Math.PI / 180; const [cy, sy, cp, sp, cr, sr] = [Math.cos(r(yaw)), Math.sin(r(yaw)), Math.cos(r(pitch)), Math.sin(r(pitch)), Math.cos(r(roll)), Math.sin(r(roll))];
  const rot = ([x, y, z]) => { let X = x * cr - y * sr, Y = x * sr + y * cr, Z = z;            // لفّ حول محور النظر
    const X1 = X * cy + Z * sy, Z1 = -X * sy + Z * cy; X = X1; Z = Z1;                        // دوران أفقي
    const Y2 = Y * cp - Z * sp, Z2 = Y * sp + Z * cp; return [X, Y2, Z2]; };                  // ميل نحو الناظر
  const hw = w / 2, hh = h / 2, hd = d / 2;
  const V = [[-hw, -hh, -hd], [hw, -hh, -hd], [hw, hh, -hd], [-hw, hh, -hd], [-hw, -hh, hd], [hw, -hh, hd], [hw, hh, hd], [-hw, hh, hd]].map(rot);
  const F = [{ k: 'front', i: [7, 6, 5, 4], n: [0, 0, 1] }, { k: 'back', i: [2, 3, 0, 1], n: [0, 0, -1] }, { k: 'top', i: [3, 2, 6, 7], n: [0, 1, 0] },
    { k: 'bottom', i: [4, 5, 1, 0], n: [0, -1, 0] }, { k: 'right', i: [6, 2, 1, 5], n: [1, 0, 0] }, { k: 'left', i: [3, 7, 4, 0], n: [-1, 0, 0] }];
  const L = [-.45, .75, .5], Ln = Math.hypot(...L);
  return { V: V.map(([x, y, z]) => [x, -y, z]), faces: F.map(f => { const n = rot(f.n); return { ...f, vis: n[2] > 1e-3, light: (n[0] * L[0] + n[1] * L[1] + n[2] * L[2]) / Ln }; }) };
}
function drawBox(g, { w, h, d, yaw = 28, pitch = 22, roll = 0, color, edge = '#ffffff', deco }) {
  const B = boxProject(w, h, d, yaw, pitch, roll);
  const ys = B.V.map(v => v[1]); const bottom = Math.max(...ys);
  B.faces.filter(f => f.vis).forEach(f => { const pts = f.i.map(i => B.V[i]);
    const c = f.light > 0 ? mix(color, 'w', f.light * .38) : mix(color, 'b', -f.light * .35);
    el('polygon', { points: pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' '), fill: c, stroke: edge, 'stroke-width': 3, 'stroke-linejoin': 'round', 'data-face': f.k }, g);
    if (deco) deco(g, f.k, (u, v) => { const [a, b, , dd] = pts; return [a[0] + u * (b[0] - a[0]) + v * (dd[0] - a[0]), a[1] + u * (b[1] - a[1]) + v * (dd[1] - a[1])]; }); });
  return { bottom, B };
}
const PIPS = { front: [[.25, .25], [.75, .25], [.5, .5], [.25, .75], [.75, .75]], top: [[.5, .5]], right: [[.25, .25], [.5, .5], [.75, .75]], left: [[.25, .25], [.75, .25], [.25, .75], [.75, .75]],
  back: [[.25, .25], [.75, .75]], bottom: [[.25, .25], [.75, .25], [.25, .5], [.75, .5], [.25, .75], [.75, .75]] };
function pipDeco(g, face, at) { (PIPS[face] || []).forEach(([u, v]) => { const pts = []; for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5; pts.push(at(u + .09 * Math.cos(a), v + .09 * Math.sin(a))); }
  el('polygon', { points: pts.map(p => p.join(',')).join(' '), fill: '#2b3a42' }, g); }); }
function ribbonDeco(g, face, at) { if (face === 'bottom' || face === 'back') return; [[[.45, 0], [.55, 0], [.55, 1], [.45, 1]], [[0, .45], [1, .45], [1, .55], [0, .55]]].forEach(q =>
  el('polygon', { points: q.map(([u, v]) => at(u, v).join(',')).join(' '), fill: '#f6cf7e' }, g)); }

/* مجسّم في مكانه: s = {solid, size, pose, color, object, yaw, pitch, roll} */
function solidAt(parent, s, x, y) {
  const g = el('g', { transform: `translate(${x} ${y}) rotate(${s.rot || 0})` }, parent); const S = s.size || 110; const c = s.color || SOLIDC[s.solid];
  const body = el('g', {}, g);
  if (s.solid === 'cube') {
    const e = S * .58; const poses = { face: [22, 18, 0], turned: [45, 28, 0], tilt: [30, 20, 28], low: [12, 12, 0] }; const [yaw, pitch, roll] = poses[s.pose || 'face'];
    const tmp = el('g', {}); const { bottom } = drawBox(tmp, { w: e, h: e, d: e, yaw: s.yaw ?? yaw, pitch: s.pitch ?? pitch, roll: s.roll ?? roll, color: c,
      deco: s.object === 'die' ? pipDeco : s.object === 'gift' ? ribbonDeco : null });
    shadowAt(body, bottom + 4, e * .62); [...tmp.childNodes].forEach(n => body.appendChild(n));
    if (s.object === 'ice') el('path', { d: `M${-e * .22} ${-e * .1} l${e * .14} ${-e * .1}`, stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: .8 }, body);
  }
  if (s.solid === 'sphere') {
    const r = S * .42; shadowAt(body, r + 4, r * .85);
    const fill = grad(body, 'radialGradient', [[0, mix(c, 'w', .6)], [.5, c], [1, mix(c, 'b', .38)]], { cx: .36, cy: .3, r: .8 });
    el('circle', { r, fill, stroke: '#ffffff', 'stroke-width': 3, 'data-face': 'curved' }, body);
    if (s.object === 'ball') { el('polygon', { points: '0,-12 11,-4 7,9 -7,9 -11,-4', fill: '#2b3a42', transform: `scale(${r / 40})` }, body);
      for (const a of [-90, -18, 54, 126, 198]) { const q = a * Math.PI / 180; el('line', { x1: Math.cos(q) * r * .3, y1: Math.sin(q) * r * .3, x2: Math.cos(q) * r * .92, y2: Math.sin(q) * r * .92, stroke: '#2b3a42', 'stroke-width': 2.5 }, body); } }
    if (s.object === 'orange') { for (let k = 0; k < 14; k++) el('circle', { cx: (Math.sin(k * 7.3) * .6) * r, cy: (Math.cos(k * 3.1) * .6) * r, r: 1.6, fill: '#000', opacity: .12 }, body);
      el('path', { d: `M0 ${-r} q8 -14 22 -10 q-8 12 -22 10z`, fill: '#5d9b3a' }, body); }
    if (s.object === 'marble') el('path', { d: `M${-r * .6} ${r * .2} q${r * .5} ${-r * .9} ${r * 1.1} ${-r * .3}`, stroke: '#ffffff', 'stroke-width': 5, fill: 'none', opacity: .7 }, body);
    el('ellipse', { cx: -r * .38, cy: -r * .42, rx: r * .2, ry: r * .12, fill: '#fff', opacity: .65, transform: `rotate(-30 ${-r * .38} ${-r * .42})` }, body);
  }
  if (s.solid === 'cylinder') {
    const thin = s.object === 'candle'; const w = S * (thin ? .3 : .56), h = S * (thin ? .8 : .66), ry = w * .2;
    const fill = grad(body, 'linearGradient', [[0, mix(c, 'b', .28)], [.35, mix(c, 'w', .28)], [.65, c], [1, mix(c, 'b', .4)]]);
    const cyl = el('g', {}, body);
    if (s.pose === 'end') {                       // مضطجعة ونرى وجهها الدائري (للدحرجة في المنظر الجانبي)
      const R = S * .36, dep = S * .3; shadowAt(body, R + 4, R + dep * .4);
      const ox = dep, oy = -dep * .45, on = Math.hypot(ox, oy), nx = -oy / on * R, ny = ox / on * R;   // جسم يمتد من الوجه الأمامي إلى الخلفي
      el('circle', { cx: ox, cy: oy, r: R, fill: mix(c, 'b', .3), stroke: '#fff', 'stroke-width': 3 }, cyl);
      el('polygon', { points: `${nx},${ny} ${ox + nx},${oy + ny} ${ox - nx},${oy - ny} ${-nx},${-ny}`, fill: mix(c, 'b', .18) }, cyl);
      el('circle', { r: R, fill: mix(c, 'w', .25), stroke: '#fff', 'stroke-width': 3 }, cyl);
      el('line', { x1: -R * .7, y1: 0, x2: R * .7, y2: 0, stroke: mix(c, 'b', .3), 'stroke-width': 3, 'stroke-linecap': 'round', class: 'spoke' }, cyl);
    } else {
      el('path', { d: `M${-w / 2} ${-h / 2} L${-w / 2} ${h / 2} A${w / 2} ${ry} 0 0 0 ${w / 2} ${h / 2} L${w / 2} ${-h / 2} Z`, fill, stroke: '#fff', 'stroke-width': 3, 'stroke-linejoin': 'round' }, cyl);
      el('ellipse', { cx: 0, cy: -h / 2, rx: w / 2, ry, fill: s.object === 'drum' ? '#f7ecd2' : mix(c, 'w', .32), stroke: '#fff', 'stroke-width': 3, 'data-face': 'top' }, cyl);
      if (s.object === 'drum') { let d = ''; for (let k = 0; k <= 6; k++) { const x0 = -w / 2 + k * w / 6; d += `${k ? 'L' : 'M'}${x0} ${k % 2 ? h / 2 - 4 : -h / 2 + 6}`; } el('path', { d, stroke: '#fff', 'stroke-width': 2.5, fill: 'none' }, cyl);
        el('rect', { x: -w / 2, y: h / 2 - 8, width: w, height: 6, fill: '#f6cf7e', opacity: .9 }, cyl); }
      if (s.object === 'tube') for (let k = -2; k <= 2; k++) el('line', { x1: -w / 2, y1: k * h / 5 + h / 10, x2: w / 2, y2: k * h / 5 - h / 10, stroke: mix(c, 'b', .3), 'stroke-width': 2, opacity: .7 }, cyl);
      if (s.object === 'candle') { el('line', { x1: 0, y1: -h / 2 - ry, x2: 0, y2: -h / 2 - ry - 8, stroke: '#2b3a42', 'stroke-width': 2 }, cyl);
        el('path', { d: `M0 ${-h / 2 - ry - 26} q9 12 0 18 q-9 -6 0 -18z`, fill: '#f6b73c' }, cyl); }
      if (s.pose === 'lying') { cyl.setAttribute('transform', 'rotate(90)'); shadowAt(body, w / 2 + 4, h / 2 + ry); body.insertBefore(body.lastChild, body.firstChild); }
      else { shadowAt(body, h / 2 + ry + 2, w * .6); body.insertBefore(body.lastChild, body.firstChild); }
    }
  }
  if (s.solid === 'cone') {
    const w = S * .62, h = S * .74, ry = w * .2;
    const fill = grad(body, 'linearGradient', [[0, mix(c, 'b', .25)], [.4, mix(c, 'w', .3)], [.7, c], [1, mix(c, 'b', .38)]]);
    const cn = el('g', {}, body);
    el('path', { d: `M0 ${-h / 2} L${w / 2} ${h / 2} A${w / 2} ${ry} 0 0 1 ${-w / 2} ${h / 2} Z`, fill, stroke: '#fff', 'stroke-width': 3, 'stroke-linejoin': 'round' }, cn);
    if (s.object === 'hat') { [[-.12, .1], [.12, .25], [-.2, .38], [.05, .45], [.22, .1]].forEach(([u, v]) => el('circle', { cx: u * w, cy: v * h, r: 4.5, fill: '#fff', opacity: .85 }, cn));
      el('circle', { cx: 0, cy: -h / 2 - 7, r: 9, fill: '#f6cf7e', stroke: '#fff', 'stroke-width': 2 }, cn); }
    if (s.object === 'waffle') { const cp = uid('cp'); const d = el('defs', {}, cn); const clip = el('clipPath', { id: cp }, d); el('path', { d: `M0 ${-h / 2} L${w / 2} ${h / 2} A${w / 2} ${ry} 0 0 1 ${-w / 2} ${h / 2} Z` }, clip);
      const lg = el('g', { 'clip-path': `url(#${cp})` }, cn); for (let k = -6; k <= 6; k++) { el('line', { x1: k * 12 - 60, y1: -h, x2: k * 12 + 60, y2: h, stroke: '#9c6837', 'stroke-width': 2 }, lg); el('line', { x1: k * 12 + 60, y1: -h, x2: k * 12 - 60, y2: h, stroke: '#9c6837', 'stroke-width': 2 }, lg); } }
    if (s.pose === 'lying' || s.pose === 'tipdown') el('ellipse', { cx: 0, cy: h / 2, rx: w / 2, ry, fill: mix(c, 'w', .2), stroke: '#fff', 'stroke-width': 3, 'data-face': 'base' }, cn);   // القاعدة الدائرية تظهر حين ينام أو يُقلب
    if (s.pose === 'lying') {                     // نائم على جانبه: الضلع المائل على الأرض والرأس إلى اليسار
      const th = -Math.atan2(h, -w / 2) * 180 / Math.PI; cn.setAttribute('transform', `rotate(${th})`);
      const q = th * Math.PI / 180, rotp = ([px, py]) => [px * Math.cos(q) - py * Math.sin(q), px * Math.sin(q) + py * Math.cos(q)];
      const tip = rotp([0, -h / 2]), base = rotp([-w / 2, h / 2]); const mx = (tip[0] + base[0]) / 2;
      cn.setAttribute('transform', `translate(${-mx} ${-tip[1] - h * .18}) rotate(${th})`); shadowAt(body, h * -.18 + 3, Math.abs(base[0] - tip[0]) / 2 + 6); body.insertBefore(body.lastChild, body.firstChild);
    } else if (s.pose === 'tipdown') { cn.setAttribute('transform', 'rotate(180)'); }
    else { shadowAt(body, h / 2 + ry + 2, w * .62); body.insertBefore(body.lastChild, body.firstChild); }
  }
  return g;
}
/* ورقة عليها شكل مرسوم (ليست مجسّماً) */
function sheetAt(parent, s, x, y) { const g = el('g', { transform: `translate(${x} ${y}) rotate(${s.rot ?? -4})` }, parent); const q = el('g', { transform: `scale(${s.k || 1})` }, g);
  el('rect', { x: -58, y: -46, width: 116, height: 92, rx: 4, fill: '#fffdf6', stroke: '#d9d2c3', 'stroke-width': 2, ...(flatPlain(s) ? {} : { filter: 'url(#pp)' }) }, q);
  el('path', { d: 'M58 30 l-16 16 l0 -16z', fill: '#e8e1d2' }, q);
  if (s.draw === 'circle') el('circle', { r: 28, fill: 'none', stroke: s.color || '#d9483b', 'stroke-width': 4 }, q);
  if (s.draw === 'square') el('rect', { x: -26, y: -26, width: 52, height: 52, fill: 'none', stroke: s.color || '#2a9d8f', 'stroke-width': 4 }, q);
  return g; }
/* أي شيء في المسرح: شكل ورقي، أو مجسّم، أو ورقة مرسوم عليها، أو الكرة القديمة */
function thingAt(parent, s, x, y) { if (s.ball) return ballAt(parent, x, y, s.r || 56); if (s.solid) return solidAt(parent, s, x, y); if (s.sheet) return sheetAt(parent, s, x, y); return shapeAt(parent, s, x, y); }
function thingMarkup(s, x, y, k) { const tmp = el('g', {}); const g = thingAt(tmp, s, 0, 0); g.setAttribute('transform', `translate(${x} ${y}) scale(${k}) ${g.getAttribute('transform').replace(/translate\([^)]*\)/, '')}`); return g.outerHTML; }

/* الشخصيات */
function compassSVG() {
  return `<svg viewBox="0 0 100 112" aria-hidden="true">
  <path d="M44 52 L26 104" stroke="url(#leg)" stroke-width="8" stroke-linecap="round"/><path d="M26 104 l-3 7" stroke="#6b7b83" stroke-width="3" stroke-linecap="round"/>
  <path d="M56 52 L74 102" stroke="url(#leg)" stroke-width="8" stroke-linecap="round"/><path d="M70 96 l10 -3 l2 8 l-8 4 z" fill="#f6cf7e" stroke="#c98f55" stroke-width="1.5"/><path d="M76 106 l6 -2 l-1 6z" fill="#1b3440"/>
  <circle cx="50" cy="52" r="6" fill="#9eabb2"/>
  <circle cx="50" cy="30" r="27" fill="url(#hd)"/>
  <g class="blink"><ellipse cx="40" cy="28" rx="5.2" ry="6.2" fill="#fff"/><ellipse cx="60" cy="28" rx="5.2" ry="6.2" fill="#fff"/><circle cx="41" cy="29" r="2.8" fill="#10283b"/><circle cx="61" cy="29" r="2.8" fill="#10283b"/><circle cx="42" cy="27.5" r="1" fill="#fff"/><circle cx="62" cy="27.5" r="1" fill="#fff"/></g>
  <circle cx="40" cy="28" r="9" fill="none" stroke="#f6cf7e" stroke-width="2"/><circle cx="60" cy="28" r="9" fill="none" stroke="#f6cf7e" stroke-width="2"/><path d="M49 27 h2" stroke="#f6cf7e" stroke-width="2"/>
  <path d="M33 17 q6 -4 12 -1 M55 16 q6 -3 12 1" stroke="#0f2d48" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <ellipse cx="33" cy="40" rx="5" ry="3" fill="#ff9d8a" opacity=".55"/><ellipse cx="67" cy="40" rx="5" ry="3" fill="#ff9d8a" opacity=".55"/>
  <path d="M41 42 q9 8 18 0" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/></svg>`;
}
function chaosSVG() {
  return `<svg viewBox="0 0 100 112" aria-hidden="true">
  <path d="M8 40 q-6 6 0 12 M92 36 q6 8 0 14" stroke="#d9483b" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>
  <path d="M50 6 L61 34 L92 33 L67 52 L77 84 L50 66 L22 86 L32 53 L7 35 L39 34 Z" fill="url(#st)" stroke="#9e2c22" stroke-width="2.5" stroke-linejoin="round"/>
  <g class="blink"><ellipse cx="40" cy="46" rx="5.5" ry="6.5" fill="#fff"/><ellipse cx="60" cy="45" rx="5.5" ry="5" fill="#fff"/><circle cx="41.5" cy="47" r="3" fill="#2a0e0a"/><circle cx="61.5" cy="46" r="3" fill="#2a0e0a"/><circle cx="42.5" cy="45.5" r="1" fill="#fff"/></g>
  <path d="M33 36 q7 -4 13 0" stroke="#5a1710" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M55 35 q7 -6 13 -1" stroke="#5a1710" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M38 57 q12 12 25 0 q-12 4 -25 0z" fill="#fff" stroke="#5a1710" stroke-width="2"/><path d="M47 62 q4 6 8 0" fill="#ff8fa0"/>
  <path d="M50 6 q-4 -6 2 -6" stroke="#9e2c22" stroke-width="2" fill="none"/></svg>`;
}
const CHAR = { compass: compassSVG, chaos: chaosSVG };
/* D194: شخصيات الأشكال مضيفات للوحدات: الأشكال الأربعة لـ«صيّادو الأشكال»، ورفاق المجسّمات لـ«عالم المجسّمات» */
function hostFace(g, y, k) { const f = el('g', { transform: `translate(0 ${y}) scale(${k})` }, g); const e = el('g', { class: 'blink' }, f);
  for (const x of [-8, 8]) { el('ellipse', { cx: x, cy: 0, rx: 4.6, ry: 5.4, fill: '#fff' }, e); el('circle', { cx: x + .8, cy: 1, r: 2.5, fill: '#1b3440' }, e); }
  el('path', { d: 'M-6 9 q6 6 12 0', fill: 'none', stroke: '#1b3440', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, f); return f; }
function hostAt(parent, k, x, y, size) { const g = el('g', { transform: `translate(${x} ${y})` }, parent);
  if (SOLIDC[k]) { solidAt(g, { solid: k, size }, 0, 0); hostFace(g, { cube: size * .1, sphere: -size * .02, cylinder: size * .08, cone: size * .14 }[k], size / 80); }
  else { shapeAt(g, { type: k, size, w: k === 'rect' ? size * 1.25 : undefined, h: k === 'rect' ? size * .78 : undefined, color: css(IDC[k]), plain: true }, 0, 0); hostFace(g, k === 'triangle' ? size * .14 : 0, size / 80); }
  return g; }
function hostsSVG(uid) { const s = el('svg', { viewBox: '0 0 200 92', 'aria-hidden': 'true' }); (HOSTS[uid] || []).forEach((k, i) => hostAt(s, k, 176 - i * 50, 50, 54)); return s.outerHTML; }
function kidSVG(g) {
  const hair = g === 'f' ? '<path d="M14 42 Q14 10 40 10 Q66 10 66 42 L66 64 Q60 50 58 38 Q40 30 22 38 Q20 50 14 64 Z" fill="#5b3a29"/>' : '<path d="M17 36 Q18 12 40 12 Q62 12 63 36 Q52 24 40 26 Q28 24 17 36 Z" fill="#3d2a1e"/>';
  return `<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="38" fill="${g === 'f' ? '#fde3d9' : '#dcecf5'}"/>${hair}<circle cx="40" cy="43" r="22" fill="#f1c9a5"/>
    <circle cx="32" cy="42" r="2.6" fill="#2b2b2b"/><circle cx="48" cy="42" r="2.6" fill="#2b2b2b"/><path d="M33 51 q7 6 14 0" fill="none" stroke="#9b4b3a" stroke-width="2.5" stroke-linecap="round"/>
    ${g === 'f' ? '<circle cx="62" cy="26" r="6" fill="#ee7a5f"/>' : ''}</svg>`;
}
function avatarNode(pr) { if (pr && pr.photo) { const img = new Image(); img.src = pr.photo; img.alt = ''; return img; } const d = document.createElement('span'); d.innerHTML = kidSVG(pr ? pr.gender : 'm'); return d.firstChild; }
/* سلة خوص عليها رمز السلة */
function basketSVG(icon) {
  return `<svg viewBox="0 0 110 96" aria-hidden="true">
  <path d="M10 34 L100 34 L90 90 Q55 96 20 90 Z" fill="url(#weave)" stroke="${css('--basket-dk')}" stroke-width="2.5" stroke-linejoin="round"/>
  <rect x="6" y="28" width="98" height="12" rx="6" fill="${css('--basket-dk')}"/><path d="M22 30 Q55 -6 88 30" fill="none" stroke="${css('--basket-dk')}" stroke-width="5" stroke-linecap="round"/>
  <rect x="33" y="46" width="44" height="36" rx="8" fill="#fffdf8" stroke="${css('--basket-dk')}" stroke-width="1.5"/>${binIcon(icon)}</svg>`;
}
function binIcon(k) {
  if (SOLIDC[k]) return thingMarkup({ solid: k, size: 42, pose: k === 'cylinder' ? 'up' : 'face' }, 55, 66, 1);
  if (k === 'solid') return thingMarkup({ solid: 'cube', size: 40, color: SOLIDC.cube }, 55, 66, 1);
  if (k === 'flat') return thingMarkup({ type: 'square', size: 22, color: css('--square') }, 55, 64, 1);
  const c = k === 'other' ? css('--muted') : css(IDC[k]);
  if (k === 'circle') return `<circle cx="55" cy="64" r="12" fill="${c}"/>`;
  if (k === 'square') return `<rect x="43" y="52" width="24" height="24" fill="${c}"/>`;
  if (k === 'triangle') return `<polygon points="55,51 68,76 42,76" fill="${c}"/>`;
  if (k === 'rect') return `<rect x="39" y="56" width="32" height="17" fill="${c}"/>`;
  return `<path d="M46 55l18 18M64 55L46 73" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`;
}

