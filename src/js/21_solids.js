/* =====================================================================
   المجسّمات (الوحدة الثانية): تُرسم بأوجهها المرئية وظلّ على الأرض. والشاشة مسطّحة،
   فلا يُعلَّم التمييز بالظلّ (D238): يقول فرجار «هذه صورة مجسّم»، والتمييز الحقيقي بالأيدي.
   ===================================================================== */
const SOLIDC = { cube: '#9cc53b', sphere: '#ee86ad', cylinder: '#b27c50', cone: '#9aa8b2' };   // ألوان الرفاق (مواصفة S1-U2): ليموني، وردي، بني، فضي
const BOXC = '#c9a072';                                  // العلبة: كرتون (ليست من ألوان الرفاق)
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

function teaDeco(g, face, at) { if (face !== 'front' && face !== 'right') return; el('polygon', { points: [[0, .38], [1, .38], [1, .62], [0, .62]].map(([u, v]) => at(u, v).join(',')).join(' '), fill: '#f6cf7e', opacity: .9 }, g); }
/* مجسّم في مكانه: s = {solid, size, pose, color, object, yaw, pitch, roll} */
function solidAt(parent, s, x, y) { s = tok(s);
  const g = el('g', { transform: `translate(${x} ${y}) rotate(${s.rot || 0})` }, parent); const S = s.size || 110; const c = s.color || SOLIDC[s.solid] || BOXC;
  const body = el('g', {}, g);
  if (s.solid === 'cube') {
    const e = S * .58; const poses = { face: [22, 18, 0], turned: [45, 28, 0], tilt: [30, 20, 28], low: [12, 12, 0] }; const [yaw, pitch, roll] = poses[s.pose || 'face'];
    const tmp = el('g', {}); const { bottom } = drawBox(tmp, { w: e, h: e, d: e, yaw: s.yaw ?? yaw, pitch: s.pitch ?? pitch, roll: s.roll ?? roll, color: c,
      deco: s.object === 'die' ? pipDeco : s.object === 'gift' ? ribbonDeco : null });
    shadowAt(body, bottom + 4, e * .62); [...tmp.childNodes].forEach(n => body.appendChild(n));
    if (s.object === 'ice') el('path', { d: `M${-e * .22} ${-e * .1} l${e * .14} ${-e * .1}`, stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: .8 }, body);
  }
  if (s.solid === 'box') {                         // العلبة (C319 أمثلةً، D245): أوجهها ليست كلها مربعات
    const poses = { face: [24, 18, 0], turned: [48, 26, 0], tilt: [30, 20, 24], tall: [22, 16, 0] }; const [yaw, pitch, roll] = poses[s.pose || 'face'];
    const tall = s.pose === 'tall'; const w = S * (tall ? .42 : .72), h = S * (tall ? .74 : .44), d = S * .4;
    const tmp = el('g', {}); const { bottom } = drawBox(tmp, { w, h, d, yaw: s.yaw ?? yaw, pitch: s.pitch ?? pitch, roll: s.roll ?? roll, color: c, deco: s.object === 'tea' ? teaDeco : null });
    shadowAt(body, bottom + 4, Math.max(w, d) * .62); [...tmp.childNodes].forEach(n => body.appendChild(n));
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
    const thin = s.object === 'candle'; const w = S * (thin ? .3 : .56), h = S * (thin ? .8 : .66), ry = w * (s.ry || .2);   // s.ry: نظرة أعلى حين يُلمس الوجه
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
    const w = S * .62, h = S * .74, ry = w * (s.ry || .2);
    const fill = grad(body, 'linearGradient', [[0, mix(c, 'b', .25)], [.4, mix(c, 'w', .3)], [.7, c], [1, mix(c, 'b', .38)]]);
    const cn = el('g', {}, body);
    el('path', { d: `M0 ${-h / 2} L${w / 2} ${h / 2} A${w / 2} ${ry} 0 0 1 ${-w / 2} ${h / 2} Z`, fill, stroke: '#fff', 'stroke-width': 3, 'stroke-linejoin': 'round' }, cn);
    if (s.object === 'hat') { [[-.12, .1], [.12, .25], [-.2, .38], [.05, .45], [.22, .1]].forEach(([u, v]) => el('circle', { cx: u * w, cy: v * h, r: 4.5, fill: '#fff', opacity: .85 }, cn));
      el('circle', { cx: 0, cy: -h / 2 - 7, r: 9, fill: '#f6cf7e', stroke: '#fff', 'stroke-width': 2 }, cn); }
    if (s.object === 'waffle') {                    // نقش البسكويت نمطُ تعبئة داخل حدود المخروط، فلا يكبر صندوقه فيصغر الرسم (getBBox يتجاهل القصّ)
      const pid = uid('wf'); const pt = el('pattern', { id: pid, patternUnits: 'userSpaceOnUse', width: 12, height: 12, patternTransform: 'rotate(45)' }, el('defs', {}, cn));
      el('path', { d: 'M0 0 H12 M0 0 V12', stroke: '#9c6837', 'stroke-width': 2.4 }, pt);
      el('path', { d: `M0 ${-h / 2} L${w / 2} ${h / 2} A${w / 2} ${ry} 0 0 1 ${-w / 2} ${h / 2} Z`, fill: `url(#${pid})`, 'pointer-events': 'none' }, cn); }
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
