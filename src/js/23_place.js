/* =====================================================================
   رسوم «أين أنا؟» (S1-U3): ما تُوصف مواضعه، والطفل والروبوت من الظهر، والقطار، والغرفة وخريطتها، وطريق الأعداد.
   قاعدة الرسم (H10): لكل صورة موضع واحد غير ملتبس، والأشياء مميَّزة الرسم، و«الأمام» يحجب «الخلف».
   كل شيء صغير يُرسم ومرساه منتصف قاعدته (يقف على السطح عند y)، فيُوضع «فوق» أو «تحت» أو «بجانب» بمرساه
   ===================================================================== */
const PL_EDGE = '#ffffff';
/* خلفية الغرفة: جدار وأرض خشبية، والأرض تبدأ عند floorY (المشاهد التي في البيت بدل الواحة) */
function roomBg(svg, H, floorY) {
  el('rect', { x: -360, y: 0, width: 1080, height: floorY, fill: css('--wall') }, svg); el('rect', { x: -360, y: floorY - 10, width: 1080, height: 10, fill: css('--wall2') }, svg);
  el('rect', { x: -360, y: floorY, width: 1080, height: H - floorY, fill: css('--floor') }, svg);
  for (let i = -8; i < 20; i++) el('line', { x1: i * 46, y1: floorY, x2: i * 46 - 20, y2: H, stroke: css('--floor2'), 'stroke-width': 2 }, svg); }
/* الطاولة من الجانب: سطح وأرجل، والمرسى منتصف ما بين الرجلين على الأرض. تعيد سطحها وما تحتها */
function tableAt(parent, x, y, { w = 170, h = 92, color = MAT.wood } = {}) {
  const g = el('g', { transform: `translate(${x} ${y})` }, parent);
  el('ellipse', { cx: 0, cy: 2, rx: w * .52, ry: 6, fill: '#000', 'fill-opacity': .08 }, g);
  for (const s of [-1, 1]) el('rect', { x: s * (w / 2 - 22) - 7, y: -h + 10, width: 14, height: h - 10, rx: 4, fill: mix(color, 'b', .18), stroke: PL_EDGE, 'stroke-width': 3 }, g);
  el('rect', { x: -w / 2, y: -h, width: w, height: 18, rx: 6, fill: color, stroke: PL_EDGE, 'stroke-width': 3.5 }, g);
  el('rect', { x: -w / 2 + 8, y: -h + 4, width: w - 16, height: 4, rx: 2, fill: '#fff', 'fill-opacity': .25 }, g);
  return { g, x, y, w, h, top: { x, y: y - h }, under: { x, y } }; }
/* الكرسي من الجانب: مقعد وظهر، والمرسى على الأرض (s للتكبير: مرجعٌ للمواضع في الدرس 1) */
function chairAt(parent, x, y, { color = '#5c9bb0', s = 1 } = {}) {
  const g = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, parent);
  for (const dx of [-26, 26]) el('rect', { x: dx - 5, y: -52, width: 10, height: 52, rx: 3, fill: mix(color, 'b', .2), stroke: PL_EDGE, 'stroke-width': 2.5 }, g);
  el('rect', { x: 18, y: -112, width: 12, height: 64, rx: 4, fill: color, stroke: PL_EDGE, 'stroke-width': 3 }, g);
  el('rect', { x: -36, y: -60, width: 72, height: 14, rx: 5, fill: color, stroke: PL_EDGE, 'stroke-width': 3 }, g);
  return { g, x, y, top: { x: x - 4 * s, y: y - 60 * s } }; }
/* فناء: سماء وأرض رملية (الشجرة لا تنبت في أرض الغرفة) */
function yardBg(svg, H, floorY) { el('rect', { x: -360, y: 0, width: 1080, height: floorY, fill: css('--sky-bot') }, svg);
  el('rect', { x: -360, y: floorY, width: 1080, height: H - floorY, fill: css('--ground') }, svg); el('rect', { x: -360, y: floorY, width: 1080, height: 6, fill: css('--sand-dk'), opacity: .5 }, svg); }
/* صندوق مفتوح بغطاء: طبقات (الخلف، والداخل حيث يوضع ما «داخله»، والجدار الأمامي) فيظهر الشيء داخله يطلّ من فوق الجدار */
function openBoxAt(parent, x, y, { w = 130, h = 62, color = '#c9a072', lid = true } = {}) {
  const g = el('g', { transform: `translate(${x} ${y})` }, parent); const d = 22;
  el('ellipse', { cx: 0, cy: 2, rx: w * .55, ry: 6, fill: '#000', 'fill-opacity': .08 }, g);
  const back = el('g', {}, g);
  if (lid) el('polygon', { points: `${-w / 2},${-h - d} ${w / 2},${-h - d} ${w / 2 - 10},${-h - d - 46} ${-w / 2 + 10},${-h - d - 46}`, fill: mix(color, 'w', .12), stroke: PL_EDGE, 'stroke-width': 3, 'stroke-linejoin': 'round' }, back);
  el('polygon', { points: `${-w / 2},${-h} ${-w / 2 + 14},${-h - d} ${w / 2 + 14},${-h - d} ${w / 2},${-h}`, fill: mix(color, 'b', .45), stroke: PL_EDGE, 'stroke-width': 3, 'stroke-linejoin': 'round' }, back);
  el('polygon', { points: `${w / 2},${-h} ${w / 2 + 14},${-h - d} ${w / 2 + 14},${-d} ${w / 2},0`, fill: mix(color, 'b', .25), stroke: PL_EDGE, 'stroke-width': 3, 'stroke-linejoin': 'round' }, back);
  const mid = el('g', {}, g);
  const front = el('g', {}, g);
  el('rect', { x: -w / 2, y: -h, width: w, height: h, rx: 3, fill: color, stroke: PL_EDGE, 'stroke-width': 3.5 }, front);
  el('path', { d: `M${-w / 2 + 12} ${-h + 16} H${w / 2 - 12}`, stroke: '#fff', 'stroke-opacity': .3, 'stroke-width': 4, 'stroke-linecap': 'round' }, front);
  return { g, x, y, w, h, back, mid, front, top: { x: x + 7, y: y - h - d / 2 }, inside: { x: 7, y: -h + 18 } }; }   /* inside: داخل الطبقة mid، فيطلّ الشيء من فوق الجدار */
/* الأشياء الصغيرة التي تُوضع: لكل منها رسم مميَّز، ومرساه منتصف قاعدته، وحجمه نحو 54 */
const PLACE_THINGS = {
  teddy(g, c = '#b07a4a') { const dk = mix(c, 'b', .25);
    el('ellipse', { cx: 0, cy: -20, rx: 18, ry: 20, fill: c, stroke: PL_EDGE, 'stroke-width': 3 }, g);
    for (const s of [-1, 1]) { el('ellipse', { cx: s * 12, cy: -4, rx: 8, ry: 6, fill: dk, stroke: PL_EDGE, 'stroke-width': 2.5 }, g); el('ellipse', { cx: s * 19, cy: -26, rx: 6, ry: 9, fill: dk, stroke: PL_EDGE, 'stroke-width': 2.5 }, g); el('circle', { cx: s * 11, cy: -62, r: 7, fill: c, stroke: PL_EDGE, 'stroke-width': 2.5 }, g); }
    el('circle', { cx: 0, cy: -50, r: 15, fill: c, stroke: PL_EDGE, 'stroke-width': 3 }, g); el('ellipse', { cx: 0, cy: -45, rx: 7, ry: 5, fill: mix(c, 'w', .45) }, g);
    el('circle', { cx: -5, cy: -53, r: 2, fill: '#2b2b2b' }, g); el('circle', { cx: 5, cy: -53, r: 2, fill: '#2b2b2b' }, g); el('circle', { cx: 0, cy: -46, r: 2.2, fill: '#2b2b2b' }, g);
    el('ellipse', { cx: 0, cy: -20, rx: 9, ry: 10, fill: mix(c, 'w', .35) }, g); },
  doll(g, c = '#ee7a5f') {
    el('path', { d: 'M-18 0 L-12 -36 L12 -36 L18 0 Z', fill: c, stroke: PL_EDGE, 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
    el('rect', { x: -4, y: -42, width: 8, height: 8, fill: '#f1c9a5' }, g);
    el('circle', { cx: 0, cy: -52, r: 13, fill: '#f1c9a5', stroke: PL_EDGE, 'stroke-width': 3 }, g);
    el('path', { d: 'M-14 -50 Q-15 -68 0 -68 Q15 -68 14 -50 Q12 -58 0 -60 Q-12 -58 -14 -50 Z', fill: '#5b3a29' }, g);
    for (const s of [-1, 1]) el('path', { d: `M${s * 13} -55 q${s * 6} 8 ${s * 3} 20`, fill: 'none', stroke: '#5b3a29', 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
    el('circle', { cx: -4.5, cy: -52, r: 1.8, fill: '#2b2b2b' }, g); el('circle', { cx: 4.5, cy: -52, r: 1.8, fill: '#2b2b2b' }, g); el('path', { d: 'M-4 -46 q4 3 8 0', fill: 'none', stroke: '#9b4b3a', 'stroke-width': 1.8 }, g); },
  ball(g, c = '#e9483f') { el('circle', { cx: 0, cy: -20, r: 20, fill: c, stroke: PL_EDGE, 'stroke-width': 3 }, g);
    el('path', { d: 'M-20 -20 Q0 -8 20 -20', fill: 'none', stroke: '#fff', 'stroke-width': 3 }, g); el('path', { d: 'M0 -40 Q-10 -20 0 0', fill: 'none', stroke: '#fff', 'stroke-width': 3 }, g); el('circle', { cx: -7, cy: -28, r: 5, fill: '#fff', 'fill-opacity': .35 }, g); },
  cat(g, c = '#8c8c6e') { const dk = mix(c, 'b', .25);
    el('path', { d: 'M18 -10 q20 -4 16 -30', fill: 'none', stroke: c, 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
    el('ellipse', { cx: 2, cy: -16, rx: 20, ry: 16, fill: c, stroke: PL_EDGE, 'stroke-width': 3 }, g);
    el('circle', { cx: -12, cy: -38, r: 13, fill: c, stroke: PL_EDGE, 'stroke-width': 3 }, g);
    el('polygon', { points: '-23,-44 -22,-58 -13,-49', fill: dk, stroke: PL_EDGE, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g); el('polygon', { points: '-9,-49 -2,-58 -1,-44', fill: dk, stroke: PL_EDGE, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
    el('circle', { cx: -16, cy: -39, r: 2, fill: '#2b2b2b' }, g); el('circle', { cx: -8, cy: -39, r: 2, fill: '#2b2b2b' }, g); el('path', { d: 'M-14 -33 l2 2 l2 -2', fill: 'none', stroke: '#2b2b2b', 'stroke-width': 1.6 }, g);
    for (const dx of [-10, 10]) el('rect', { x: dx - 4, y: -6, width: 8, height: 7, rx: 3, fill: dk }, g); },
  car(g, c = '#4a6f94') { el('path', { d: 'M-26 -10 L-26 -22 L-14 -24 L-6 -36 L12 -36 L20 -24 L28 -22 L28 -10 Z', fill: c, stroke: PL_EDGE, 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
    el('polygon', { points: '-4,-32 10,-32 15,-25 -9,-25', fill: '#d9f0f7' }, g);
    for (const dx of [-14, 16]) { el('circle', { cx: dx, cy: -9, r: 8, fill: '#33454c', stroke: PL_EDGE, 'stroke-width': 2.5 }, g); el('circle', { cx: dx, cy: -9, r: 3, fill: '#c9d2d6' }, g); } },
  bird(g, c = '#5c9bb0') { el('ellipse', { cx: 0, cy: -16, rx: 17, ry: 13, fill: c, stroke: PL_EDGE, 'stroke-width': 3 }, g); el('circle', { cx: 12, cy: -30, r: 9, fill: c, stroke: PL_EDGE, 'stroke-width': 2.5 }, g);
    el('polygon', { points: '20,-32 30,-29 20,-26', fill: '#f2b33d' }, g); el('circle', { cx: 14, cy: -32, r: 1.8, fill: '#2b2b2b' }, g); el('path', { d: 'M-16 -18 L-30 -24 L-26 -12 Z', fill: mix(c, 'b', .25), stroke: PL_EDGE, 'stroke-width': 2 }, g);
    el('path', { d: 'M-4 -20 Q4 -8 10 -18', fill: 'none', stroke: mix(c, 'b', .3), 'stroke-width': 3 }, g); for (const dx of [-4, 4]) el('path', { d: `M${dx} -4 v4`, stroke: '#c98f55', 'stroke-width': 2.5 }, g); },
  book(g, c = '#7e9a4e') { el('rect', { x: -22, y: -16, width: 44, height: 16, rx: 3, fill: c, stroke: PL_EDGE, 'stroke-width': 3 }, g); el('rect', { x: -18, y: -12, width: 36, height: 3, fill: '#fff', 'fill-opacity': .6 }, g); el('rect', { x: -18, y: -6, width: 36, height: 3, fill: '#fff', 'fill-opacity': .6 }, g); },
};
function placeThingAt(parent, k, x, y, { color, scale = 1 } = {}) { const g = el('g', { transform: `translate(${x} ${y})${scale !== 1 ? ` scale(${scale})` : ''}` }, parent); const inner = el('g', {}, g); PLACE_THINGS[k](inner, color); g.dataset.thing = k; return g; }
/* الشجرة: جذع وتاج، والمرسى أسفل الجذع */
function treeAt(parent, x, y, { s = 1 } = {}) { const g = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, parent);
  el('rect', { x: -9, y: -70, width: 18, height: 70, rx: 5, fill: MAT.wood, stroke: PL_EDGE, 'stroke-width': 3 }, g);
  for (const [cx, cy, r] of [[-20, -86, 26], [20, -86, 26], [0, -110, 30]]) el('circle', { cx, cy, r, fill: '#7e9a4e', stroke: PL_EDGE, 'stroke-width': 3 }, g);
  return { g, x, y }; }
/* الطفل من ظهره (قاعدة الصور): شعر الطفل نفسه ولون بشرته من صورته، وشريط على اليد اليمنى (اليمين في الصورة يمين الطفل). raise: اليد المرفوعة */
function kidBackAt(parent, x, y, { ribbon = 'R', raise = null, shirt = '#7e9a4e', s = 1 } = {}) {
  const A = AVATARS[(PROFILE && PROFILE.avatar) || ''] || AVATARS[PROFILE && PROFILE.gender === 'f' ? 'f1' : 'm1'];
  const g = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, parent); const skin = A.skin;
  for (const dx of [-12, 12]) el('rect', { x: dx - 7, y: -46, width: 14, height: 46, rx: 6, fill: '#33454c', stroke: PL_EDGE, 'stroke-width': 2.5 }, g);
  const arm = side => { const up = raise === side, sx = side === 'R' ? 1 : -1, a = el('g', {}, g);
    el('path', { d: up ? `M${sx * 24} -96 L${sx * 34} -150` : `M${sx * 26} -94 L${sx * 34} -48`, stroke: shirt, 'stroke-width': 15, 'stroke-linecap': 'round' }, a);
    const hx = up ? sx * 35 : sx * 35, hy = up ? -156 : -42; el('circle', { cx: hx, cy: hy, r: 8, fill: skin, stroke: PL_EDGE, 'stroke-width': 2.5 }, a);
    if (ribbon === side) el('rect', { x: hx - 9, y: hy + (up ? 5 : -15), width: 18, height: 8, rx: 3, fill: '#f2b33d', stroke: PL_EDGE, 'stroke-width': 2, class: 'ribbon' }, a);
    return a; };
  arm('L'); arm('R');
  el('path', { d: 'M-26 -100 Q-28 -46 -24 -42 L24 -42 Q28 -46 26 -100 Q0 -112 -26 -100 Z', fill: shirt, stroke: PL_EDGE, 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
  el('rect', { x: -6, y: -116, width: 12, height: 12, fill: skin }, g);
  const hair = A.scarf || A.hair;
  el('circle', { cx: 0, cy: -132, r: 22, fill: skin, stroke: PL_EDGE, 'stroke-width': 3 }, g);
  el('path', { d: A.g === 'f' && !A.scarf ? 'M-23 -132 Q-24 -158 0 -158 Q24 -158 23 -132 Q24 -104 14 -100 Q0 -96 -14 -100 Q-24 -104 -23 -132 Z' : A.scarf ? 'M-25 -130 Q-26 -160 0 -160 Q26 -160 25 -130 Q26 -100 0 -98 Q-26 -100 -25 -130 Z' : 'M-22 -132 Q-23 -157 0 -157 Q23 -157 22 -132 Q20 -118 0 -116 Q-20 -118 -22 -132 Z', fill: hair, stroke: PL_EDGE, 'stroke-width': 2.5 }, g);
  if (!A.scarf) for (const s2 of [-1, 1]) el('ellipse', { cx: s2 * 22, cy: -130, rx: 4, ry: 7, fill: skin }, g);
  return { g, x, y, hand: side => ({ x: x + (side === 'R' ? 35 : -35) * s, y: y + (raise === side ? -156 : -42) * s }) }; }
/* ---------- شريط أطول من المسرح (القطار، وطريق الأعداد): نافذة تُرى، وزرّان وسحب بالإصبع للتنقّل، بخطوات كاملة ----------
   ما خرج من النافذة يُخفى ولا يُلمس (visibility)، فلا يُلمس شيء لا يراه الطفل. وزرّ الجهة لا يظهر إلا إن كان فيها شيء.
   الإحداثيات: x في المحتوى، وoff أول ما يُرى في النافذة؛ ما يُرى على المسرح عند x0 + (x − off) */
function panStrip(svg, { x0 = 0, w = 360, y0, y1, contentW, step = 64, off = 0, btnY } = {}) {
  const cid = uid('pan'); const d = el('defs', {}, svg); const cp = el('clipPath', { id: cid }, d); el('rect', { x: x0, y: y0, width: w, height: y1 - y0 }, cp);
  const win = el('g', { 'clip-path': `url(#${cid})` }, svg), inner = el('g', {}, win);
  const S = { win, g: inner, x0, w, step, off: 0, max: Math.max(0, contentW - w), items: [], btn: {}, onMove: null, dragged: false };
  S.at = x => x0 + x - S.off;
  S.visible = (a, b = a) => a >= S.off - .5 && b <= S.off + w + .5;
  S.update = () => { inner.setAttribute('transform', `translate(${x0 - S.off} 0)`);
    for (const it of S.items) it.el.style.visibility = S.visible(it.a, it.b) ? '' : 'hidden';
    for (const [k, b] of Object.entries(S.btn)) b.style.visibility = (k === 'back' ? S.off > 0 : S.off < S.max) ? '' : 'hidden';
    if (S.onMove) S.onMove(); };
  /* أثناء الحركة يظهر كل شيء (والقصّ يحدّ النافذة) فيرى الطفل القطار ينزلق وعرباته تدخل تباعاً، لا قفزةً تظهر بعدها العربات دفعة؛ وبعدها يُخفى ما خرج كله أو بعضه */
  S.showAll = () => { for (const it of S.items) it.el.style.visibility = ''; };
  S.setOff = async (o, animate = true) => { o = Math.max(0, Math.min(S.max, Math.round(o / step) * step)); if (o === S.off) { S.update(); return; }
    const from = S.off; S.off = o; if (animate && !RM) { S.showAll(); await anim(inner, [{ transform: `translate(${x0 - from}px,0px)` }, { transform: `translate(${x0 - o}px,0px)` }], { duration: 380, easing: 'ease-in-out' }).done; } S.update(); };
  S.show = (a, b = a) => { if (S.visible(a, b)) return Promise.resolve(); return S.setOff(a < S.off ? a - step * .5 : b - w + step * .5); };
  S.track = (elx, a, b = a) => { S.items.push({ el: elx, a, b }); };
  /* الزرّان: «back» نحو بداية المحتوى (x أصغر)، و«fwd» نحو نهايته */
  const mk = (k, x, flip) => { const b = el('g', { transform: `translate(${x} ${btnY ?? y1 + 30})`, role: 'button', tabindex: 0, 'data-panbtn': k, 'aria-label': plain(labelText(k === 'back' ? 'panBack' : 'panFwd')), style: 'cursor:pointer' }, svg);
    el('circle', { r: 24, fill: css('--paper'), stroke: css('--line'), 'stroke-width': 3 }, b); el('path', { d: flip ? 'M8 -10 L-6 0 L8 10' : 'M-8 -10 L6 0 L-8 10', fill: 'none', stroke: css('--ink'), 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, b);
    hitPad(b, 64); const go = () => { SFX.tick(); S.setOff(S.off + (k === 'back' ? -1 : 1) * (Math.floor(w / step) - 1) * step); };
    b.onclick = go; b.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') go(); }; S.btn[k] = b; };
  mk('back', x0 + 30, true); mk('fwd', x0 + w - 30, false);
  /* السحب بالإصبع: أكثر من 10 بكسلات حركة = سحب، فلا تُعدّ اللمسة لمساً لما تحتها */
  let p0 = null;
  win.addEventListener('pointerdown', e => { p0 = { x: e.clientX, off: S.off, id: e.pointerId }; S.dragged = false; });
  win.addEventListener('pointermove', e => { if (!p0 || e.pointerId !== p0.id) return; const k = svg.getScreenCTM().a, dx = (e.clientX - p0.x) / k;
    if (!S.dragged && Math.abs(dx) < 10 / k) return; if (!S.dragged) { S.dragged = true; S.showAll(); try { win.setPointerCapture(e.pointerId); } catch (x) {} }
    S.off = Math.max(0, Math.min(S.max, p0.off - dx)); inner.setAttribute('transform', `translate(${x0 - S.off} 0)`); });
  const up = () => { if (!p0) return; p0 = null; if (S.dragged) S.setOff(S.off, true); };
  win.addEventListener('pointerup', up); win.addEventListener('pointercancel', up);
  win.addEventListener('click', e => { if (S.dragged) { e.stopPropagation(); e.preventDefault(); S.dragged = false; } }, true);
  S.setOff(off, false); return S; }

/* ---------- القطار: القاطرة تتّجه إلى اليمين، والعربات خلفها إلى اليسار؛ العربة k (1 = الأولى بعد القاطرة) ---------- */
const CAR_COLORS = ['#e9b14f', '#5c9bb0', '#b8607a', '#7e9a4e', '#8c8c6e', '#4a6f94'];
function locoAt(parent, x, y) { const g = el('g', { transform: `translate(${x} ${y})` }, parent), c = '#c94f3d';
  el('rect', { x: -40, y: -58, width: 30, height: 40, rx: 4, fill: c, stroke: PL_EDGE, 'stroke-width': 3 }, g); el('rect', { x: -35, y: -52, width: 20, height: 14, rx: 3, fill: '#d9f0f7' }, g);
  el('rect', { x: -12, y: -40, width: 50, height: 22, rx: 10, fill: c, stroke: PL_EDGE, 'stroke-width': 3 }, g); el('rect', { x: 18, y: -58, width: 10, height: 20, rx: 2, fill: '#33454c', stroke: PL_EDGE, 'stroke-width': 2.5 }, g);
  el('circle', { cx: 32, cy: -29, r: 4, fill: '#f2d36b' }, g);
  for (const dx of [-26, 2, 26]) { el('circle', { cx: dx, cy: -10, r: 10, fill: '#33454c', stroke: PL_EDGE, 'stroke-width': 2.5 }, g); el('circle', { cx: dx, cy: -10, r: 3.5, fill: '#c9d2d6' }, g); }
  return g; }
function carAt(parent, x, y, k, { w = 56, color } = {}) { const g = el('g', { transform: `translate(${x} ${y})` }, parent);
  const back = el('g', {}, g), mid = el('g', {}, g), front = el('g', {}, g); const c = color || CAR_COLORS[(k - 1) % CAR_COLORS.length];
  el('rect', { x: -w / 2, y: -40, width: w, height: 8, rx: 2, fill: mix(c, 'b', .35) }, back);
  el('rect', { x: -w / 2, y: -34, width: w, height: 24, rx: 4, fill: c, stroke: PL_EDGE, 'stroke-width': 3 }, front);
  for (const dx of [-w / 2 + 12, w / 2 - 12]) { el('circle', { cx: dx, cy: -8, r: 8, fill: '#33454c', stroke: PL_EDGE, 'stroke-width': 2.5 }, front); el('circle', { cx: dx, cy: -8, r: 2.8, fill: '#c9d2d6' }, front); }
  el('rect', { x: w / 2, y: -20, width: 8, height: 4, fill: '#33454c' }, front);   /* الوصلة نحو العربة التي أمامها */
  return { g, k, back, mid, front, x }; }

/* ---------- طريق الأعداد (N009، D229 (6)): من اليسار إلى اليمين، البداية 0 ثم البلاطات 1–20 بالأرقام التي اختارها الطفل ---------- */
const ROAD_PITCH = 58, ROAD_TILE = 50;
function roadAt(svg, { y = 200, last = 20, at = 0, x0 = 0, w = 360, btnY } = {}) {
  const contentW = (last + 1) * ROAD_PITCH + 16; const S = panStrip(svg, { x0, w, y0: y - 120, y1: y + 40, contentW, step: ROAD_PITCH, btnY: btnY ?? y + 66 });
  el('rect', { x: 0, y: y + 22, width: contentW, height: 8, rx: 4, fill: css('--floor2'), 'fill-opacity': .7 }, S.g);
  const tiles = [];
  for (let n = 0; n <= last; n++) { const cx = 8 + n * ROAD_PITCH + ROAD_PITCH / 2; const g = el('g', { transform: `translate(${cx} ${y})` }, S.g);
    if (n === 0) { el('circle', { cx: 0, cy: 0, r: ROAD_TILE / 2 - 2, fill: css('--paper'), stroke: css('--ink'), 'stroke-width': 3, 'stroke-dasharray': '6 5' }, g); el('path', { d: 'M-4 -10 V-44 L16 -36 L-4 -28', fill: '#c94f3d', stroke: PL_EDGE, 'stroke-width': 2 }, g); }
    else { el('rect', { x: -ROAD_TILE / 2, y: -ROAD_TILE / 2, width: ROAD_TILE, height: ROAD_TILE, rx: 10, fill: n % 2 ? '#e9dcc3' : '#dccaa8', stroke: PL_EDGE, 'stroke-width': 3.5 }, g); }
    /* البلاطات بلونين ثابتين، فرقمها بحبر داكن ثابت لا بحبر الوضع الداكن الفاتح (الفحص المستقل B: تباين 1.2:1)، والصفر على دائرة الورق بحبر الوضع */
    const t = el('text', { x: 0, y: 9, 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, fill: n === 0 ? css('--ink') : '#33454c', 'font-family': css('--f'), direction: 'ltr' }, g); t.textContent = DG(n);
    S.track(g, cx - ROAD_PITCH / 2, cx + ROAD_PITCH / 2); g.dataset.n = n; tiles.push({ n, g, cx, y }); }
  S.tileX = n => 8 + n * ROAD_PITCH + ROAD_PITCH / 2; S.tiles = tiles; S.y = y;
  S.setOff(Math.max(0, S.tileX(at) - ROAD_PITCH * 1.5), false); return S; }
/* قطعة تقف على البلاطة: وجه الطفل (صورته الرمزية) أو فوضى فوق قاعدة صغيرة، والقفز قوس من بلاطة إلى بلاطة (يحترم تقليل الحركة) */
function roadToken(S, who, n, { dx = 0 } = {}) { const g = el('g', { 'pointer-events': 'none', class: 'roadtoken' }, S.g);
  el('ellipse', { cx: 0, cy: -20, rx: 15, ry: 5, fill: '#000', 'fill-opacity': .18 }, g); el('path', { d: 'M-9 -20 L0 -40 L9 -20 Z', fill: who === 'chaos' ? '#d9483b' : css('--ink'), stroke: PL_EDGE, 'stroke-width': 2 }, g);
  if (who === 'chaos') chaosAt(g, 0, -64, .44);
  else { const f = el('g', { transform: 'translate(-22 -86)' }, g); f.innerHTML = kidSVG(PROFILE ? PROFILE.gender : 'm', PROFILE && PROFILE.avatar).replace('<svg', '<svg width="44" height="44"'); }
  const T = { g, n, who };
  T.place = m => { T.n = m; g.setAttribute('transform', `translate(${S.tileX(m) + dx} ${S.y})`); };
  /* قفزة واحدة من بلاطة إلى أخرى (بلا المرور بما بينهما): فوضى حين تترك بلاطة */
  T.leap = async m => { const a = S.tileX(T.n) + dx, b = S.tileX(m) + dx; await S.show(Math.min(a, b) - ROAD_PITCH / 2, Math.max(a, b) + ROAD_PITCH / 2);
    if (!RM && !FAST) await anim(g, [{ transform: `translate(${a}px,${S.y}px)` }, { transform: `translate(${(a + b) / 2}px,${S.y - 48}px)`, offset: .5 }, { transform: `translate(${b}px,${S.y}px)` }], { duration: 520, easing: 'ease-in-out' }).done; T.place(m); };
  /* يقفز بلاطة بلاطة حتى m، والطريق يتحرّك ليبقى ما يُقفز إليه في النافذة؛ onLand بعد كل بلاطة (يقول العدد) */
  T.hop = async (m, onLand) => { const step = m > T.n ? 1 : -1;
    while (T.n !== m) { const a = S.tileX(T.n) + dx, b = S.tileX(T.n + step) + dx; await S.show(Math.min(a, b) - ROAD_PITCH / 2, Math.max(a, b) + ROAD_PITCH / 2);
      if (!RM && !FAST) await anim(g, [{ transform: `translate(${a}px,${S.y}px)` }, { transform: `translate(${(a + b) / 2}px,${S.y - 34}px)`, offset: .5 }, { transform: `translate(${b}px,${S.y}px)` }], { duration: 420, easing: 'ease-in-out' }).done;
      T.place(T.n + step); if (onLand) await onLand(T.n); } };
  T.place(n); return T; }

/* ---------- صندوق الألعاب على أرجل، بغطاء (الدرس 1): «فوق» على الغطاء المغلق، و«داخل» في الصندوق والغطاء مفتوح، و«تحت» بين الأرجل على الأرض، و«بجانب» على الأرض نفسها ----------
   المرسى منتصف ما بين الرجلين على الأرض. spots بإحداثيات الأب: لكل موضع نقطة يقف عليها الشيء (مرساه)، ومقياس يناسب المكان */
function chestAt(parent, x, y, { w = 132, h = 60, legs = 62, color = '#c9a072', open = true } = {}) {
  const g = el('g', { transform: `translate(${x} ${y})` }, parent); const d = 22, top = -legs - h;
  el('ellipse', { cx: 0, cy: 2, rx: w * .56, ry: 6, fill: '#000', 'fill-opacity': .08 }, g);
  for (const s of [-1, 1]) el('rect', { x: s * (w / 2 - 14) - 6, y: -legs - 2, width: 12, height: legs + 2, rx: 4, fill: mix(color, 'b', .3), stroke: PL_EDGE, 'stroke-width': 2.5 }, g);
  const back = el('g', {}, g), mid = el('g', {}, g), front = el('g', {}, g), lidG = el('g', {}, g);
  const lidOpen = el('polygon', { points: `${-w / 2 + 14},${top - d} ${w / 2 + 14},${top - d} ${w / 2 + 4},${top - d - 50} ${-w / 2 + 4},${top - d - 50}`, fill: mix(color, 'w', .12), stroke: PL_EDGE, 'stroke-width': 3, 'stroke-linejoin': 'round' }, back);
  el('polygon', { points: `${-w / 2},${top} ${-w / 2 + 14},${top - d} ${w / 2 + 14},${top - d} ${w / 2},${top}`, fill: mix(color, 'b', .45), stroke: PL_EDGE, 'stroke-width': 3, 'stroke-linejoin': 'round' }, back);
  el('polygon', { points: `${w / 2},${top} ${w / 2 + 14},${top - d} ${w / 2 + 14},${-legs - d} ${w / 2},${-legs}`, fill: mix(color, 'b', .25), stroke: PL_EDGE, 'stroke-width': 3, 'stroke-linejoin': 'round' }, back);
  el('rect', { x: -w / 2, y: top, width: w, height: h, rx: 3, fill: color, stroke: PL_EDGE, 'stroke-width': 3.5 }, front);
  el('path', { d: `M${-w / 2 + 12} ${top + 16} H${w / 2 - 12}`, stroke: '#fff', 'stroke-opacity': .3, 'stroke-width': 4, 'stroke-linecap': 'round' }, front);
  const lidShut = el('polygon', { points: `${-w / 2 - 4},${top + 2} ${-w / 2 + 12},${top - d - 2} ${w / 2 + 18},${top - d - 2} ${w / 2 + 4},${top + 2}`, fill: mix(color, 'w', .12), stroke: PL_EDGE, 'stroke-width': 3, 'stroke-linejoin': 'round' }, lidG);
  const C = { g, x, y, w, h, legs, back, mid, front, lid: lidG, isOpen: open, top: y + top };
  C.setLid = o => { C.isOpen = o; lidOpen.style.display = o ? '' : 'none'; lidShut.style.display = o ? 'none' : ''; };
  C.setLid(open);
  C.spots = { on: { x: x + 6, y: y + top - d / 2, s: .8 }, in: { x: x + 7, y: y + top + 20, s: .8, layer: 'mid' }, under: { x, y, s: .72 }, besideR: { x: x - w / 2 - 54, y, s: .9 }, besideL: { x: x + w / 2 + 54, y, s: .9 } };
  return C; }
/* منطقتان مسطّحتان متداخلتان (داخل/خارج، الدرس 1): دائرة مرجانية ومربع أخضر مزرق، بلون الهوية لأنهما ليستا ما يُصنَّف */
function regionsAt(svg, { cx = 140, cy = 150, r = 70, sx = 236, sy = 150, s = 120 } = {}) {
  const g = el('g', {}, svg);
  el('rect', { x: sx - s / 2, y: sy - s / 2, width: s, height: s, fill: css('--square'), 'fill-opacity': .22, stroke: css('--square'), 'stroke-width': 5 }, g);
  el('circle', { cx, cy, r, fill: css('--circle'), 'fill-opacity': .22, stroke: css('--circle'), 'stroke-width': 5 }, g);
  const R = { g, circle: { cx, cy, r }, square: { sx, sy, s } };
  R.inCircle = (x, y) => Math.hypot(x - cx, y - cy) < r; R.inSquare = (x, y) => Math.abs(x - sx) < s / 2 && Math.abs(y - sy) < s / 2;
  return R; }
/* نجمة صغيرة (ما يوضع داخل المناطق) ومرساها وسطها */
function starAt(parent, x, y, { s = 1, color = '#f2d36b' } = {}) { const g = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, parent);
  el('path', { d: 'M0 -22 L6.5 -7 L22 -6 L10 4 L14 20 L0 11 L-14 20 L-10 4 L-22 -6 L-6.5 -7 Z', fill: color, stroke: '#9a6a12', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g); return g; }

/* ---------- الطابور (الدرس 2): دببة من الجانب بقمصان ملوّنة، تتّجه إلى اليمين نحو الدكّان؛ «الأمام» جهة الدكّان ----------
   (الدبّ مذكّر: «الأول… الأخير»، و«الأحمر» و«الأزرق»، كما في المواصفة) */
const DOLL_COLORS = { red: '#d9483b', blue: '#4a6f94', green: '#5f8f3e', yellow: '#e9b14f', purple: '#8e6bbf' };
function dollSideAt(parent, x, y, col, { s = 1 } = {}) { const g = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, parent); const c = DOLL_COLORS[col] || col, fur = '#b07a4a', dk = '#8a5a33';
  el('ellipse', { cx: 0, cy: 2, rx: 20, ry: 4, fill: '#000', 'fill-opacity': .1 }, g);
  for (const dx of [-8, 8]) el('ellipse', { cx: dx, cy: -6, rx: 8, ry: 7, fill: dk, stroke: PL_EDGE, 'stroke-width': 2.5 }, g);
  el('ellipse', { cx: 0, cy: -30, rx: 19, ry: 22, fill: c, stroke: PL_EDGE, 'stroke-width': 3 }, g);   /* القميص */
  el('ellipse', { cx: 12, cy: -32, rx: 6, ry: 9, fill: fur, stroke: PL_EDGE, 'stroke-width': 2.5, transform: 'rotate(-30 12 -32)' }, g);   /* الذراع إلى الأمام */
  el('circle', { cx: 0, cy: -66, r: 17, fill: fur, stroke: PL_EDGE, 'stroke-width': 3 }, g);
  el('circle', { cx: -9, cy: -81, r: 6.5, fill: fur, stroke: PL_EDGE, 'stroke-width': 2.5 }, g);   /* الأذن إلى الخلف */
  el('ellipse', { cx: 15, cy: -62, rx: 8, ry: 6, fill: mix(fur, 'w', .45), stroke: PL_EDGE, 'stroke-width': 2 }, g); el('circle', { cx: 21, cy: -63, r: 2.6, fill: '#2b2b2b' }, g);   /* الخطم إلى اليمين */
  el('circle', { cx: 6, cy: -70, r: 2.3, fill: '#2b2b2b' }, g);
  return g; }
function shopAt(parent, x, y) { const g = el('g', { transform: `translate(${x} ${y})` }, parent);
  el('rect', { x: -30, y: -96, width: 60, height: 96, fill: '#f1dcb0', stroke: PL_EDGE, 'stroke-width': 3 }, g);
  for (let i = 0; i < 4; i++) el('path', { d: `M${-34 + i * 17} -96 h17 v14 q-8.5 8 -17 0z`, fill: i % 2 ? '#fffdf6' : '#c0564a' }, g);
  el('rect', { x: -20, y: -60, width: 40, height: 60, rx: 3, fill: MAT.woodDk }, g); el('circle', { cx: 12, cy: -30, r: 3, fill: '#f2d36b' }, g); return g; }
/* شارة (الأول أو الأخير): وردة ذهبية للأول، وراية حمراء للأخير؛ تُعلَّق فوق رأس صاحبها */
function ordBadgeAt(parent, x, y, kind) { const g = el('g', { transform: `translate(${x} ${y})`, class: 'ordbadge', 'pointer-events': 'none' }, parent);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -18, stroke: '#7a5232', 'stroke-width': 2.5 }, g);
  if (kind === 'first') { for (let i = 0; i < 8; i++) el('ellipse', { cx: 0, cy: -34, rx: 6, ry: 14, fill: '#f2b33d', stroke: '#c98f55', 'stroke-width': 1.5, transform: `rotate(${i * 45} 0 -34)` }, g); el('circle', { cx: 0, cy: -34, r: 9, fill: '#fff4cf', stroke: '#c98f55', 'stroke-width': 2 }, g); }
  else { el('path', { d: 'M0 -46 H28 L20 -37 L28 -28 H0 Z', fill: '#c94f3d', stroke: '#fff', 'stroke-width': 2, 'stroke-linejoin': 'round' }, g); el('line', { x1: 0, y1: -48, x2: 0, y2: -18, stroke: '#7a5232', 'stroke-width': 3 }, g); }
  return g; }

/* ---------- فوضى من ظهرها (الدرس 3): نجمة بلا وجه، وذراعاها طرفا النجمة؛ والشريط على يدها ---------- */
function chaosBackAt(parent, x, y, { ribbon = 'L', raise = 'L', s = 1 } = {}) { const g = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, parent);
  el('path', { d: 'M0 -56 L12 -26 L-12 -26 Z M-12 -26 L-30 30 L0 12 L30 30 L12 -26', fill: '#e95f4f', stroke: '#9e2c22', 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
  el('path', { d: 'M-14 -26 L14 -26 L22 4 L0 16 L-22 4 Z', fill: '#e95f4f', stroke: 'none' }, g);
  el('path', { d: 'M0 -56 q-4 -8 3 -9', stroke: '#9e2c22', 'stroke-width': 2.5, fill: 'none' }, g);
  const arm = side => { const sx = side === 'R' ? 1 : -1, up = raise === side; const a = el('g', {}, g);
    const tip = up ? [sx * 40, -52] : [sx * 46, -18];
    el('path', { d: `M${sx * 12} -24 L${tip[0]} ${tip[1]} L${sx * 18} -4 Z`, fill: '#e95f4f', stroke: '#9e2c22', 'stroke-width': 3, 'stroke-linejoin': 'round' }, a);
    if (ribbon === side) el('rect', { x: tip[0] - sx * 10 - 8, y: tip[1] + (up ? 8 : -2), width: 16, height: 8, rx: 3, fill: '#f2b33d', stroke: '#fff', 'stroke-width': 2, transform: `rotate(${sx * (up ? -40 : 20)} ${tip[0] - sx * 10} ${tip[1] + (up ? 12 : 2)})` }, a);
    return { g: a, x: x + tip[0] * s, y: y + tip[1] * s }; };
  const L = arm('L'), R = arm('R'); return { g, L, R }; }

/* ---------- الروبوت من الأعلى ومن خلفه (الدرس 3): يتّجه إلى الأعلى أولاً، فيمينه يمين الطفل؛ وعلى ذراعه اليمنى الشريط ----------
   dir: 0 أعلى، 1 يمين، 2 أسفل، 3 يسار (دوران باتجاه عقارب الساعة) */
function robotTopAt(parent, x, y, { dir = 0, s = 1, ribbon = true } = {}) { const g = el('g', { transform: `translate(${x} ${y}) rotate(${dir * 90}) scale(${s})` }, parent);
  el('ellipse', { cx: 0, cy: 4, rx: 24, ry: 22, fill: '#000', 'fill-opacity': .12 }, g);
  for (const sx of [-1, 1]) { el('rect', { x: sx * 22 - 6, y: -12, width: 12, height: 26, rx: 5, fill: '#8d9aa3', stroke: '#fff', 'stroke-width': 2 }, g);
    if (ribbon && sx === 1) el('rect', { x: sx * 22 - 7, y: -2, width: 14, height: 7, rx: 2, fill: '#f2b33d', stroke: '#fff', 'stroke-width': 1.5 }, g); }
  el('rect', { x: -18, y: -16, width: 36, height: 34, rx: 9, fill: '#5c9bb0', stroke: '#fff', 'stroke-width': 3 }, g);
  el('rect', { x: -10, y: -6, width: 20, height: 16, rx: 3, fill: '#3f7d91' }, g);   /* لوحة الظهر */
  el('path', { d: 'M-12 -16 Q0 -34 12 -16 Z', fill: '#c9d2d6', stroke: '#fff', 'stroke-width': 2.5 }, g);   /* الرأس إلى الأمام */
  el('circle', { cx: 0, cy: -30, r: 3.5, fill: '#f2d36b' }, g);
  return g; }
/* لوحة الأرضية: مربعات، والروبوت يمشي عليها خانة خانة */
function boardAt(svg, { cols = 5, rows = 4, cell = 58, x0, y0 = 16 } = {}) { x0 = x0 ?? (360 - cols * cell) / 2; const g = el('g', {}, svg);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) el('rect', { x: x0 + c * cell + 2, y: y0 + r * cell + 2, width: cell - 4, height: cell - 4, rx: 8, fill: (r + c) % 2 ? '#e9dcc3' : '#dccaa8', stroke: '#fff', 'stroke-width': 2 }, g);
  return { g, cols, rows, cell, x0, y0, at: (c, r) => ({ x: x0 + (c + .5) * cell, y: y0 + (r + .5) * cell }) }; }

/* ---------- الغرفة من الجانب، ثم خريطتها من الأعلى (الدرس 4) ----------
   layout = {door:'R'|'L', win:'R'|'L' (جهة الصورة: R يمينها)، items:[{k:'bed'|'rug'|'table', col:0|1|2, row:'back'|'front'}]}؛ الأعمدة من اليمين (0) إلى اليسار (2) كاتجاه القراءة.
   الجدار الخلفي في الصورة هو الحافة العليا في الخريطة، فاليمين واليسار واحد في الاثنين، و«الخلف» أعلى الخريطة */
const ROOM_COLX = [270, 180, 90];
const MAP_PIECE = { bed: { k: 'rect', w: 64, h: 38 }, rug: { k: 'circle', size: 46 }, table: { k: 'square', size: 38 } };
function bedSideAt(parent, x, y, s = 1) { const g = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, parent);
  for (const dx of [-40, 40]) el('rect', { x: dx - 4, y: -14, width: 8, height: 14, fill: MAT.woodDk }, g);
  el('rect', { x: -48, y: -30, width: 96, height: 18, rx: 4, fill: '#e9dcc3', stroke: PL_EDGE, 'stroke-width': 3 }, g);
  el('rect', { x: -48, y: -34, width: 64, height: 10, rx: 4, fill: '#f2b33d', stroke: PL_EDGE, 'stroke-width': 2.5 }, g);   /* الغطاء */
  el('rect', { x: 36, y: -58, width: 14, height: 58, rx: 4, fill: MAT.wood, stroke: PL_EDGE, 'stroke-width': 3 }, g);
  el('ellipse', { cx: 26, cy: -36, rx: 12, ry: 7, fill: '#fffdf6', stroke: PL_EDGE, 'stroke-width': 2 }, g); return g; }
function rugSideAt(parent, x, y, s = 1) { const g = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, parent);
  el('ellipse', { cx: 0, cy: -4, rx: 52, ry: 9, fill: '#ee7a5f', stroke: PL_EDGE, 'stroke-width': 3 }, g); el('ellipse', { cx: 0, cy: -4, rx: 32, ry: 5, fill: 'none', stroke: '#fff', 'stroke-opacity': .6, 'stroke-width': 2 }, g); return g; }
/* شيء صغير في الغرفة المرسومة من الجانب، في موضعه بعلاقته (الفحص المستقل A، H10): على الأرض في خانة فارغة (cell)، أو فوق الشيء
   على سطحه، أو تحت الطاولة بين رجليها؛ والمرسى منتصف قاعدته، والحجم بعمق الصفّ */
function roomMarkAt(svg, Rm, lay, mark) { const back = r => r === 'back'; let x, y, s, row;
  if (mark.cell) { const [col, r] = mark.cell; row = r; x = ROOM_COLX[col]; y = back(r) ? Rm.fy + 10 : Rm.H - 6; }
  else { const it = lay.items.find(i => (i.id || i.k) === mark.on); row = it.row; const sc = back(it.row) ? .72 : .95; x = ROOM_COLX[it.col]; y = back(it.row) ? Rm.fy + 10 : Rm.H - 6;
    if (mark.rel === 'on') y -= it.k === 'bed' ? 34 * sc : it.k === 'table' ? 62 * sc : 4 * sc; }
  s = back(row) ? .62 : .8; y += Rm.y0;
  return mark.k === 'treasure' ? treasureAt(svg, x, y, s * (mark.rel === 'under' ? .7 : 1)) : placeThingAt(svg, mark.k, x, y, { scale: s * .62 * (mark.rel === 'under' ? .75 : 1) }); }
function roomSideAt(svg, lay, { y0 = 0, H = 150 } = {}) { const g = el('g', { transform: `translate(0 ${y0})` }, svg); const fy = H * .62;
  el('rect', { x: 0, y: 0, width: 360, height: fy, fill: css('--wall') }, g); el('rect', { x: 0, y: fy, width: 360, height: H - fy, fill: css('--floor') }, g); el('rect', { x: 0, y: fy - 6, width: 360, height: 6, fill: css('--wall2') }, g);
  const dx = lay.door === 'R' ? 316 : 44, wx = lay.win === 'R' ? 300 : 60; const door = el('g', { transform: `translate(${dx} ${fy})` }, g);
  el('rect', { x: -22, y: -76, width: 44, height: 76, rx: 3, fill: MAT.wood, stroke: PL_EDGE, 'stroke-width': 3 }, door); el('circle', { cx: lay.door === 'R' ? -12 : 12, cy: -38, r: 3, fill: '#f2d36b' }, door);
  const win = el('g', { transform: `translate(${wx} ${fy - 58})` }, g); el('rect', { x: -26, y: -20, width: 52, height: 36, rx: 3, fill: '#d9f0f7', stroke: PL_EDGE, 'stroke-width': 3 }, win); el('path', { d: 'M0 -20 V16 M-26 -2 H26', stroke: '#fff', 'stroke-width': 2.5 }, win);
  if (lay.door === lay.win) win.setAttribute('transform', `translate(180 ${fy - 58})`);
  const out = {};
  for (const it of [...lay.items].sort((a, b) => (a.row === 'back' ? 0 : 1) - (b.row === 'back' ? 0 : 1))) {
    const x = ROOM_COLX[it.col], back = it.row === 'back', y = back ? fy + 10 : H - 6, s = back ? .72 : .95;
    out[it.id || it.k] = it.k === 'bed' ? bedSideAt(g, x, y, s) : it.k === 'rug' ? rugSideAt(g, x, y, s) : tableAt(g, x, y, { w: 110 * s, h: 62 * s }).g; }
  return { g, fy, items: out, H, y0 }; }
/* الخريطة: مستطيل الغرفة، والباب والنافذة علامتان على الحافة العليا، والقطع بأشكالها وألوانها الثابتة */
function roomMapAt(svg, lay, { y0 = 160, H = 130, x0 = 40, W = 280, pieces = true } = {}) { const g = el('g', {}, svg);
  el('rect', { x: x0, y: y0, width: W, height: H, rx: 6, fill: css('--paper'), stroke: css('--ink'), 'stroke-width': 4 }, g);
  const ex = c => x0 + W * (ROOM_COLX[c] - 30) / 300;   /* عمود الصورة ← عمود الخريطة */
  const doorX = lay.door === 'R' ? x0 + W - 26 : x0 + 26, winX = lay.door === lay.win ? x0 + W / 2 : (lay.win === 'R' ? x0 + W - 40 : x0 + 40);
  el('rect', { x: doorX - 18, y: y0 - 4, width: 36, height: 8, fill: css('--paper') }, g); el('path', { d: `M${doorX - 18} ${y0} q18 22 36 0`, fill: 'none', stroke: MAT.wood, 'stroke-width': 3 }, g);
  el('rect', { x: winX - 22, y: y0 - 4, width: 44, height: 8, fill: '#d9f0f7', stroke: css('--ink'), 'stroke-width': 2 }, g);
  const M = { g, x0, y0, W, H, colX: ex, rowY: row => row === 'back' ? y0 + H * .28 : y0 + H * .75, door: { x: doorX, y: y0 + 12 }, pieces: {} };   /* الصفّان متباعدان 66 وحدة: حلقتا «ضع» لا تتداخلان (D255) */
  if (pieces) for (const it of lay.items) M.pieces[it.id || it.k] = mapPieceAt(g, it.k, M.colX(it.col), M.rowY(it.row));
  return M; }
function mapPieceAt(parent, k, x, y) { const P = MAP_PIECE[k];
  const g = shapeAt(parent, { type: P.k, size: P.size, w: P.w, h: P.h, color: css(IDC[P.k]) }, x, y); g.dataset.piece = k; return g; }
