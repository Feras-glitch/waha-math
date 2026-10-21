/* =====================================================================
   الرسم: الواحة (D230)، والقصاصات الورقية، وأشياء البيت
   ===================================================================== */
const ICON = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 5v14L5 12z" fill="currentColor"/></svg>',       // يشير إلى اليسار: «التالي» في العربية (D232)
  sound: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8a5 5 0 010 8M18.5 5.5a8.5 8.5 0 010 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  mute: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  replay: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M17 7a6 6 0 1 1-1.5 9.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M17 3v4.5h-4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  gallery: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="13" r="3.6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 6l1.6-2.4h4.8L16 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  map: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 4v14M15 6v14" stroke="currentColor" stroke-width="2"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  cross: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3a8 8 0 1 0 6 13A7 7 0 0 1 15 3z" fill="currentColor"/></svg>',
  rotate: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12a7 7 0 1 1-2.1-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M18 3v4.5h-4.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3 7 7 .6-5.3 4.6L18.4 22 12 18l-6.4 4 1.7-7.8L2 9.6 9 9z" fill="currentColor"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  minus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3.2" fill="currentColor"/></svg>',
  /* فانوس المساعدة (M3): شكل مختلف عن فرجار المتكلّم */
  lantern: '<svg viewBox="0 0 48 60" aria-hidden="true"><path d="M18 8h12M24 2v6" stroke="#9c6837" stroke-width="3" stroke-linecap="round"/><path d="M14 14h20l-3 6H17z" fill="#c98f55"/><path d="M17 20h14l3 24H14z" fill="#ffe08a" stroke="#c98f55" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 26c4 5 4 9 0 12c-4-3-4-7 0-12z" fill="#f2a33a"/><path d="M12 44h24l-3 6H15z" fill="#c98f55"/></svg>',
};
/* تعريفات مشتركة لكل لوحة: ظل ورقي حاد، ولمعة علوية، وسماء */
function defs() {
  const g = $('#gdefs');
  g.innerHTML = `<defs><filter id="pp" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="4" stdDeviation="0.6" flood-color="#1b3440" flood-opacity=".22"/></filter>
    <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${css('--sky-top')}"/><stop offset="1" stop-color="${css('--sky-bot')}"/></linearGradient>
    <linearGradient id="waterG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${css('--water-hi')}"/><stop offset="1" stop-color="${css('--water')}"/></linearGradient>
    <pattern id="weave" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="${css('--basket')}"/><path d="M0 5h10M5 0v10" stroke="${css('--basket-dk')}" stroke-width="2" opacity=".55"/></pattern>
    <linearGradient id="leg" x1="0" x2="1"><stop offset="0" stop-color="#e7edf0"/><stop offset="1" stop-color="#9eabb2"/></linearGradient>
    <radialGradient id="hd" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#4f8fcb"/><stop offset="1" stop-color="#1f5f99"/></radialGradient>
    <radialGradient id="st" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#f27b6b"/><stop offset="1" stop-color="#c23a2e"/></radialGradient></defs>`;
}

/* ---------- الواحة (D230): كثبان ونخيل ونبع جافّ يمتلئ ---------- */
function dunes(svg, H, opacity = 1) {
  const g = el('g', { opacity }, svg);
  el('path', { d: `M0 ${H - 46} Q70 ${H - 78} 150 ${H - 52} T300 ${H - 60} T360 ${H - 50} V${H} H0z`, fill: css('--dune2') }, g);
  el('path', { d: `M0 ${H - 30} Q90 ${H - 56} 190 ${H - 34} T360 ${H - 38} V${H} H0z`, fill: css('--dune1') }, g);
  return g;
}
/* نخلة: خضراء حيّة، أو ذابلة قبل أن يصلها الماء */
function palmAt(parent, x, y, s = 1, alive = true) {
  const g = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, parent);
  el('path', { d: 'M0 0 Q-4 -30 4 -62', stroke: css('--trunk'), 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, g);
  for (let k = 0; k < 4; k++) el('path', { d: `M${-3 + k * .7} ${-10 - k * 13} l7 -3`, stroke: css('--trunk-dk'), 'stroke-width': 2, 'stroke-linecap': 'round' }, g);
  const leaf = alive ? css('--palm') : css('--palm-dry');
  const fronds = alive ? [[-38, -54], [-30, -76], [0, -84], [30, -76], [40, -54]] : [[-34, -40], [-26, -50], [24, -50], [34, -40]];
  for (const [fx, fy] of fronds) el('path', { d: `M4 -62 Q${(fx + 4) / 2} ${fy - 14} ${fx} ${fy} Q${(fx + 4) / 2} ${fy - 4} 4 -62z`, fill: leaf }, g);
  if (alive) for (const dx of [-3, 4, 9]) el('circle', { cx: dx, cy: -58, r: 3.2, fill: '#b5651d' }, g);
  return g;
}
/* النبع: حلقة حجارة؛ stones = الحجارة الموضوعة، وlevel = منسوب الماء من 0 إلى 1 */
function springAt(parent, x, y, s = 1, { stones = 0, total = 6, level = 0 } = {}) {
  const g = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, parent);
  el('ellipse', { cx: 0, cy: 0, rx: 46, ry: 16, fill: css('--sand-dk') }, g);
  if (level > 0) el('ellipse', { cx: 0, cy: 2 - level * 3, rx: 38 * (.55 + .45 * level), ry: 11 * (.55 + .45 * level), fill: 'url(#waterG)' }, g);
  else for (const d of ['M-20 -2 l8 4 l6 -3', 'M6 3 l7 -4 l9 3']) el('path', { d, stroke: css('--sand-crack'), 'stroke-width': 1.6, fill: 'none' }, g);
  for (let i = 0; i < total; i++) { const a = Math.PI * (1 + i / (total - 1)); const sx = Math.cos(a) * 48, sy = Math.sin(a) * 17 - 2;
    el('ellipse', { cx: sx, cy: sy, rx: 11, ry: 7, fill: i < stones ? css('--stone') : 'none', stroke: i < stones ? css('--stone-dk') : css('--sand-crack'), 'stroke-width': 2, 'stroke-dasharray': i < stones ? null : '4 3' }, g); }
  if (level > 0) { const sp = el('path', { d: 'M0 -6 q-6 -16 0 -26 q6 10 0 26z', fill: css('--water-hi'), opacity: .85 }, g);
    anim(sp, [{ transform: 'scale(1,.7)' }, { transform: 'scale(1,1.1)' }], { duration: 900, iterations: Infinity, direction: 'alternate' }); }
  return g;
}
/* سماء وغيوم وكثبان ونخيل خافت خلف المشهد (أفق واحد، لا ثلاثة) */
function backdrop(svg, H, opt = {}) {
  el('rect', { x: -360, y: 0, width: 1080, height: H, fill: 'url(#skyG)' }, svg);          // أعرض من الإطار: إن صغُر المسرح ليتّسع للأزرار ظهرت السماء على الجانبين لا فراغ
  for (const [x, y, s] of [[60, 34, 1], [270, 22, .8], [190, 58, .6]]) { const c = el('g', { transform: `translate(${x} ${y}) scale(${s})`, opacity: .9 }, svg);
    el('rect', { x: -30, y: -8, width: 60, height: 18, rx: 9, fill: css('--cloud') }, c); el('circle', { cx: -6, cy: -10, r: 12, fill: css('--cloud') }, c); el('circle', { cx: 12, cy: -6, r: 9, fill: css('--cloud') }, c); }
  const ground = opt.ground ?? 26;
  if (opt.oasis !== false) { const o = opt.oasisOpacity ?? .4; dunes(svg, H - ground + 30, o); palmAt(svg, 30, H - ground + 2, .7, true).setAttribute('opacity', o); palmAt(svg, 336, H - ground + 4, .6, true).setAttribute('opacity', o); }
  if (ground) el('rect', { x: -360, y: H - ground, width: 1080, height: ground, fill: css('--ground') }, svg);
}

/* ألوان المسائل محايدة: لا يُصنَّف الشكل بلونه (قاعدة التصميم في مواصفة المحرّك) */
const NEUTRAL = ['#6c7fa8', '#b07a57', '#7e9a4e', '#b8607a', '#5c9bb0', '#8c8c6e'];
let colorIx = 0; const nextColor = () => NEUTRAL[(colorIx++) % NEUTRAL.length];
const IDC = { circle: '--circle', square: '--square', triangle: '--triangle', rect: '--rect' };
/* ألوان مادّية لأشياء البيت (M7): خشب، وورق، ومعدن؛ لا ألوان الشخصيات */
const MAT = { wood: '#a9774a', woodDk: '#7a5232', paper: '#f3eadb', metal: '#8d9aa3', cloth: '#5c9bb0', clay: '#c98f55', red: '#c0564a' };

/* نقاط الأشكال (مركزها 0،0) */
function shapeGeom(s) {
  const S = s.size || 110;
  switch (s.type) {
    case 'square': return { poly: [[-S / 2, -S / 2], [S / 2, -S / 2], [S / 2, S / 2], [-S / 2, S / 2]] };
    case 'rect': { const w = s.w || S * 1.5, h = s.h || S * .8; return { poly: [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]] }; }
    case 'triangle': { const w = s.w || S, h = s.h || S * .9, ax = s.apex ?? 0; return { poly: [[ax * w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]] }; }
    case 'quad': { const w = s.w || S * 1.4, h = s.h || S * .8, k = s.skew ?? .28; return { poly: [[-w / 2 + w * k, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]] }; }   // رباعي بركن غير قائم (شبه منحرف قائم، بلا اسم في م1)
    case 'circle': return { r: S / 2 };
    case 'oval': return { rx: S / 2, ry: S / 3.1 };
    default: return {};
  }
}
const polyStr = p => p.map(q => q.map(v => +(+v).toFixed(1)).join(',')).join(' ');
/* رؤوس الشكل في إحداثيات المسرح، مرتّبة من الأعلى على اليمين (D232: العدّ يبدأ من اليمين) */
function worldPoly(s) { const P = shapeGeom(s).poly; if (!P) return []; const a = (s.rot || 0) * Math.PI / 180;
  const W = P.map(([px, py]) => [s.x + px * Math.cos(a) - py * Math.sin(a), s.y + px * Math.sin(a) + py * Math.cos(a)]);
  const start = W.reduce((b, p, i) => (p[1] < W[b][1] - 4 || (Math.abs(p[1] - W[b][1]) <= 4 && p[0] > W[b][0])) ? i : b, 0);
  const cw = W.map((_, i) => W[(start + i) % W.length]);   // الأشكال مخزّنة باتجاه عقارب الساعة على الشاشة
  return [cw[0], ...cw.slice(1).reverse()];                 // فنسير عكسها: من الأعلى على اليمين نحو اليسار، كاتجاه القراءة
}
/* قصاصة ورقية: ظل، ولون، وحافة بيضاء، ولمعة (D238: لا قاعدة «المسطّح بلا ظل»؛ كل الأشكال قصاصات) */
function paper(parent, s) {
  const g = el('g', s.plain ? {} : { filter: 'url(#pp)' }, parent); const geo = shapeGeom(s); const c = s.color; const edge = s.edge === false ? 'none' : '#ffffff';
  const add = (fill, stroke) => {
    if (s.type === 'circle') return el('circle', { cx: 0, cy: 0, r: geo.r, fill, stroke, 'stroke-width': 4 }, g);
    if (s.type === 'oval') return el('ellipse', { cx: 0, cy: 0, rx: geo.rx, ry: geo.ry, fill, stroke, 'stroke-width': 4 }, g);
    if (s.type === 'curvedTri') { const S = s.size || 110; return el('path', { d: `M0 ${-S * .45} Q${S * .55} ${-S * .05} ${S / 2} ${S * .45} L${-S / 2} ${S * .45} Z`, fill, stroke, 'stroke-width': 4, 'stroke-linejoin': 'round' }, g); }
    if (s.type === 'openTri') { const S = s.size || 110; return el('path', { d: `M-8 ${-S * .4} L${-S / 2} ${S * .45} L${S / 2} ${S * .45} L8 ${-S * .4}`, fill: 'none', stroke: c, 'stroke-width': 12, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g); }
    if (s.type === 'openRect') { const w = s.w || 160, h = s.h || 90; return el('path', { d: `M${-w / 2 + 26} ${-h / 2} H${w / 2} V${h / 2} H${-w / 2} V${-h / 2 + 18}`, fill: 'none', stroke: c, 'stroke-width': 12, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g); }
    return el('polygon', { points: polyStr(geo.poly), fill, stroke, 'stroke-width': 4, 'stroke-linejoin': 'round' }, g);
  };
  add(c, edge); if (!/^open/.test(s.type) && !s.plain) add('url(#shine)', 'none');
  decorate(g, s);
  return g;
}
/* أشياء من البيت فوق القصاصة */
function decorate(g, s) {
  const S = s.size || 110, o = s.object; if (!o) return;
  const W = '#ffffff';
  if (o === 'plate') { el('circle', { r: S / 2 - 13, fill: 'none', stroke: W, 'stroke-opacity': .7, 'stroke-width': 3 }, g); el('circle', { r: S / 2 - 22, fill: W, 'fill-opacity': .18 }, g); }
  if (o === 'clock') { el('circle', { r: S / 2 - 9, fill: '#fffdf6' }, g); for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; el('line', { x1: Math.cos(a) * (S / 2 - 16), y1: Math.sin(a) * (S / 2 - 16), x2: Math.cos(a) * (S / 2 - (k % 3 ? 20 : 24)), y2: Math.sin(a) * (S / 2 - (k % 3 ? 20 : 24)), stroke: '#33454c', 'stroke-width': k % 3 ? 2 : 3.5 }, g); }
    el('line', { x1: 0, y1: 0, x2: 0, y2: -S / 2 + 26, stroke: '#1b3440', 'stroke-width': 4.5, 'stroke-linecap': 'round' }, g); el('line', { x1: 0, y1: 0, x2: S / 4.5, y2: 4, stroke: '#1b3440', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g); el('circle', { r: 4, fill: '#1b3440' }, g); }
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
  if (o === 'letter') { const geo = shapeGeom(s); const a = geo.poly[0], c2 = geo.poly[2]; el('polyline', { points: `${a[0] + 3},${a[1] + 3} 0,${(a[1] + c2[1]) / 2 + 2} ${c2[0] - 3},${a[1] + 3}`, fill: 'none', stroke: '#c98f55', 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, g); }
}
/* لون المحتوى الرمزي ($id.triangle …) يُحلّ عند الرسم أينما جاء الشكل، لا في كل مشهد على حدة */
const tok = s => (s && typeof s.color === 'string' && s.color[0] === '$') ? make(s) : s;
function shapeAt(parent, s, x, y) { s = tok(s); const g = el('g', { transform: `translate(${x} ${y}) rotate(${s.rot || 0})` }, parent); paper(g, s); return g; }
/* ورقة عليها شكل مرسوم (ليست مجسّماً) */
function sheetAt(parent, s, x, y) { s = tok(s); const g = el('g', { transform: `translate(${x} ${y}) rotate(${s.rot ?? -4})` }, parent); const q = el('g', { transform: `scale(${s.k || 1})` }, g);
  el('rect', { x: -58, y: -46, width: 116, height: 92, rx: 4, fill: '#fffdf6', stroke: '#d9d2c3', 'stroke-width': 2, filter: 'url(#pp)' }, q);
  el('path', { d: 'M58 30 l-16 16 l0 -16z', fill: '#e8e1d2' }, q);
  if (s.draw === 'circle') el('circle', { r: 28, fill: 'none', stroke: s.color || MAT.red, 'stroke-width': 4 }, q);
  if (s.draw === 'square') el('rect', { x: -26, y: -26, width: 52, height: 52, fill: 'none', stroke: s.color || '#3d7a8c', 'stroke-width': 4 }, q);
  return g; }
/* أي شيء في المسرح: شكل ورقي، أو مجسّم، أو ورقة مرسوم عليها */
function thingAt(parent, s, x, y) { if (s.solid) return solidAt(parent, s, x, y); if (s.sheet) return sheetAt(parent, s, x, y); return shapeAt(parent, s, x, y); }
function thingMarkup(s, x, y, k) { const tmp = el('g', {}); const g = thingAt(tmp, s, 0, 0); g.setAttribute('transform', `translate(${x} ${y}) scale(${k}) ${g.getAttribute('transform').replace(/translate\([^)]*\)/, '')}`); return g.outerHTML; }
/* شيء داخل مربع ثابت، ومجموعته الخارجية مُزاحة إلى (x، y) فقط، فتصلح للتحريك بـ translate دون أن يضيع التحجيم */
function fitAt(parent, s, x, y, box) { const o = el('g', { transform: `translate(${x} ${y})` }, parent); fitThing(o, s, 0, 0, box); return o; }
/* يرسم شيئاً داخل مربع ثابت مهما كان حجمه الأصلي */
function fitThing(parent, s, x, y, box) {
  const w = el('g', {}, parent); const g = thingAt(w, s, 0, 0); const bb = w.getBBox();
  const k = Math.min(1.1, box / Math.max(bb.width, bb.height, 1));
  w.setAttribute('transform', `translate(${x - (bb.x + bb.width / 2) * k} ${y - (bb.y + bb.height / 2) * k}) scale(${k})`); return w; }
/* منطقة لمس شفافة حول عنصر صغير (H6: ≥ 64 بكسل للمس) */
/* منطقة لمس لا تقل عن minSize بوحدات المسرح (≈ بكسل عند عرض 360)، مهما كان تحجيم المجموعة نفسها أو آبائها داخل الرسم */
const scaleIn = g => { try { const m = g.getCTM(), r = g.ownerSVGElement && g.ownerSVGElement.getCTM(); const k = m && r ? Math.hypot(m.a, m.b) / Math.hypot(r.a, r.b) : 1; return k > 0 && isFinite(k) ? k : 1; } catch (e) { return 1; } };
function hitPad(g, minSize = 76) { try { const bb = g.getBBox(); const k = scaleIn(g); const w = Math.max(bb.width + 12 / k, minSize / k), h = Math.max(bb.height + 12 / k, minSize / k);
  const r = el('rect', { x: bb.x + bb.width / 2 - w / 2, y: bb.y + bb.height / 2 - h / 2, width: w, height: h, fill: 'transparent', 'pointer-events': 'all', class: 'hit' }); g.insertBefore(r, g.firstChild); return r; } catch (e) { return null; } }
