/* =====================================================================
   أدوات خيط العدد في م1 (D222): المكعبات والأبراج، وصناديق البريد، وبطاقات الأرقام وتتبّعها، والنقاط، والأصابع
   ===================================================================== */
const CUBE = { lemon: '#c9dd3a', white: '#f4f1e8', plain: '#9cc53b', big: '#9cc53b' };
/* مكعب صغير بإسقاط ثابت (للأبراج): يعيد المجموعة، ومركزه عند (x, y) */
function cubeAt(parent, x, y, size = 30, color = CUBE.plain) { const g = el('g', { transform: `translate(${x} ${y})` }, parent);
  drawBox(g, { w: size, h: size, d: size * .7, yaw: 18, pitch: 16, color, edge: '#ffffff' }); return g; }
/* برج من n مكعبات قاعدته عند baseY؛ colors اختياري لكل مكعب */
function towerAt(parent, x, baseY, n, opt = {}) { const size = opt.size || 30, step = size * (opt.k || 1.02); const g = el('g', {}, parent); const cubes = [];
  for (let i = 0; i < n; i++) cubes.push(cubeAt(g, x, baseY - size * .62 - i * step, size, (opt.colors && opt.colors[i]) || opt.color || CUBE.plain));
  return { g, cubes, top: baseY - n * step, x, size, step, baseY }; }
/* صندوق بريد فيه رسائل (N003): يعيد المجموعة ومكان البطاقة */
function mailboxAt(parent, x, y, n, opt = {}) { const g = el('g', { transform: `translate(${x} ${y})` }, parent);
  el('rect', { x: -44, y: -50, width: 88, height: 74, rx: 12, fill: opt.color || '#5c9bb0', stroke: '#fff', 'stroke-width': 4, filter: 'url(#pp)' }, g);
  el('rect', { x: -36, y: -40, width: 72, height: 50, rx: 8, fill: '#fffdf6' }, g);              // نافذة نرى منها الرسائل
  el('rect', { x: -6, y: 24, width: 12, height: 40, fill: MAT.woodDk }, g);
  const letters = [];
  for (let i = 0; i < n; i++) { const col = i % 5, row = Math.floor(i / 5); const lx = -26 + col * 13, ly = -30 + row * 20;
    const lg = el('g', { transform: `translate(${lx} ${ly})` }, g); el('rect', { x: -6, y: -7, width: 12, height: 14, rx: 2, fill: '#fff', stroke: '#c98f55', 'stroke-width': 1.5 }, lg);
    el('path', { d: 'M-6 -7 L0 0 L6 -7', fill: 'none', stroke: '#c98f55', 'stroke-width': 1.3 }, lg); letters.push(lg); }
  const hook = el('g', { transform: 'translate(0 -66)' }, g); el('circle', { r: 4, fill: MAT.woodDk }, hook);
  return { g, letters, hook, x, y, n }; }
/* بطاقة رقم: الرقم بالكتابة التي اختارها الطفل (والمشرقية وحدها حتى نهاية درس الجسر، D229) */
const CARD_INK = '#1b3440';                               // البطاقة ورقة فاتحة في الوضعين، فحبرها داكن ثابت (لا --ink الذي يفتح ليلاً)
function digitCard(parent, x, y, n, opt = {}) { const s = opt.size || 1; const g = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, parent);
  el('rect', { x: -26, y: -32, width: 52, height: 64, rx: 10, fill: opt.fill || '#fffdf6', stroke: opt.stroke || css('--compass'), 'stroke-width': 3.5, filter: 'url(#pp)' }, g);
  const t = el('text', { y: 16, 'text-anchor': 'middle', 'font-size': 44, 'font-weight': 800, fill: opt.fill ? css('--ink') : CARD_INK, 'font-family': css('--f') }, g); t.textContent = DG(n); g.dataset.n = n; return g; }
/* نقاط كوجه النرد (اللمحة السريعة حتى 5) */
const DICE = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
function diceAt(parent, x, y, n, opt = {}) { const g = el('g', { transform: `translate(${x} ${y})` }, parent); const sp = opt.sp || 34;
  el('rect', { x: -sp * 1.75, y: -sp * 1.75, width: sp * 3.5, height: sp * 3.5, rx: 18, fill: '#fffdf6', stroke: css('--line'), 'stroke-width': 3 }, g);
  (DICE[n] || []).forEach(([u, v]) => el('circle', { cx: u * sp, cy: v * sp, r: sp * .36, fill: opt.color || css('--compass') }, g)); return g; }
/* يد بأصابع مرفوعة (الطلاقة حتى 5، N007) */
function handAtN(parent, x, y, n, s = 1) { const g = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, parent);
  el('path', { d: 'M-26 10 Q-28 40 0 44 Q28 40 26 10 Z', fill: '#f1c9a5', stroke: '#c98f55', 'stroke-width': 2 }, g);
  const F = [[-22, -2, -30], [-11, -14, -10], [0, -18, 0], [11, -14, 10], [24, 4, 40]];
  g.tips = []; g.fingers = [];   /* أطراف الأصابع المرفوعة بإحداثيات المسرح: للتلميح (إضاءة) والعدّ المشترك */
  F.forEach(([fx, fy, a], i) => { const up = i < n; const f = el('g', { transform: `translate(${fx} ${fy + 14}) rotate(${a * .4})` }, g);
    const fr = el('rect', { x: -5, y: up ? -26 : -6, width: 10, height: up ? 30 : 10, rx: 5, fill: '#f1c9a5', stroke: '#c98f55', 'stroke-width': 2 }, f);
    if (up) { g.fingers.push(fr); const q = (a * .4) * Math.PI / 180; g.tips.push({ x: x + (fx + Math.sin(q) * 22) * s, y: y + (fy + 14 - Math.cos(q) * 22) * s }); } });
  return g; }
/* عدّ رسائل الصندوق باللمس: الرسائل في نافذته صغيرة متلاصقة (12 وحدة)، فتخرج إلى صفّين متباعدين بحجم يلمسه إصبع الطفل
   (هدف ≥ 56)، ويعدّها، ثم تعود إلى الصندوق. cy: منتصف الصفّين */
async function mailSpread(svg, mb, cy, opt = {}) {
  const n = mb.letters.length; if (!n) return; const pts = layoutPts(n, 'row', 180, cy, 62);
  const home = mb.letters.map(l => { const t = l.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/); return { x: mb.x + +t[1], y: mb.y + +t[2] }; });
  const big = pts.map((p, i) => { const g = el('g', { transform: `translate(${p.x} ${p.y}) scale(2.2)` }, svg);
    el('rect', { x: -6, y: -7, width: 12, height: 14, rx: 2, fill: '#fff', stroke: '#c98f55', 'stroke-width': 1.2 }, g); el('path', { d: 'M-6 -7 L0 0 L6 -7', fill: 'none', stroke: '#c98f55', 'stroke-width': 1 }, g); return g; });
  mb.letters.forEach(l => l.setAttribute('opacity', 0));
  await Promise.all(big.map((g, i) => anim(g, [{ transform: `translate(${home[i].x}px,${home[i].y}px) scale(1)` }, { transform: `translate(${pts[i].x}px,${pts[i].y}px) scale(2.2)` }], { duration: 600, delay: i * 40, fill: 'both', easing: 'ease-out' }).done));
  await countTouch(svg, pts.map((p, i) => ({ ...p, g: big[i] })), { halo: 24, by: -30, pad: 60, ...opt });
  svg.querySelectorAll('g[pointer-events=none]').forEach(m => m.remove());
  await Promise.all(big.map((g, i) => anim(g, [{ transform: `translate(${pts[i].x}px,${pts[i].y}px) scale(2.2)` }, { transform: `translate(${home[i].x}px,${home[i].y}px) scale(1)` }], { duration: 500, delay: i * 30, fill: 'forwards', easing: 'ease-in' }).done));
  big.forEach(g => g.remove()); mb.letters.forEach(l => l.removeAttribute('opacity'));
}
/* عدّ برج باللمس: مكعبات البرج أصغر من إصبع الطفل، فالبرج كله هدف واحد، وكل لمسة تضيء المكعب التالي من الأسفل وتنطق عدده،
   فيبقى لكل مكعب لمسة واحدة وعدد واحد (N001) */
function towerTapCount(svg, T, opt = {}) {
  const n = T.cubes.length, w = Math.max(96, T.size * 2.4); let k = 0; const marks = el('g', { 'pointer-events': 'none' }, svg);
  const g = el('g', { role: 'button', tabindex: 0, 'aria-label': plain(G(labelText('countTower'))) }, svg); g.style.cursor = 'pointer';
  el('rect', { x: T.x - w / 2, y: T.top - 12, width: w, height: T.baseY - T.top + 16, fill: 'transparent', 'pointer-events': 'all' }, g);
  AUTO({ kind: 'tapCount', ok: async () => { for (let i = k; i < n; i++) { g.dispatchEvent(new MouseEvent('click', { bubbles: true })); await new Promise(r => setTimeout(r, 40)); } } });
  const off = pulse(T.cubes);
  return gate(new Promise(res => { const act = () => { if (k >= n) return; off(); k++; SFX.tick(); buzz(20);
      badge(marks, T.x + T.size * .9, T.baseY - T.size * .62 - (k - 1) * T.step, k, opt.color);
      if (!SET.muted && !FAST) say(...lineOf(numw(k)), { num: true, noGap: true, free: true });
      if (k === n) { AUTO_CLEAR(); g.remove(); res(n); } };
    g.onclick = act; g.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') act(); }; }));
}
/* جملة عددية تُكتب بالكتابة المختارة: «٤ + ٣ = ٧». واتجاهها يتبع الكتابة (D251): من اليمين مع الأرقام المشرقية كما في الكتب المشرقية
   فتُقرأ كما تُنطق، ومن اليسار مع الغربية. والصوت واحد. (طريق الأعداد وشبكة المئة من اليسار دائماً، D229 (6).) */
const NUM_DIR = () => SET.digits === 'west' ? 'ltr' : 'rtl';
function sentenceText(a, op, b, c) { return `${DG(a)} ${op === '+' ? '+' : '−'} ${DG(b)} = ${c == null ? '؟' : DG(c)}`; }
function sentenceAt(parent, x, y, a, op, b, c, opt = {}) { const g = el('g', { transform: `translate(${x} ${y})` }, parent);
  if (opt.box !== false) el('rect', { x: -96, y: -30, width: 192, height: 52, rx: 14, fill: '#fffdf6', stroke: css('--line'), 'stroke-width': 3 }, g);
  const t = el('text', { y: 8, 'text-anchor': 'middle', 'font-size': 34, 'font-weight': 800, fill: opt.box === false ? css('--ink') : CARD_INK, 'font-family': css('--f'), direction: NUM_DIR(), 'unicode-bidi': 'bidi-override' }, g); t.textContent = sentenceText(a, op, b, c); return g; }
/* قراءة الجملة بالكلمات: «أَرْبَعَة» «زَائِد» «ثَلَاثَة» «يُسَاوِي» «سَبْعَة» */
/* والجملة جملٌ قصيرة تُكتب في الفقاعة متتابعة (append)، فتظهر الجملة كلها لا آخر كلمة؛ وsentenceLines تعطيها لـ readChoices وخطّاف «أعد الجملة» */
function sentenceLines(a, op, b, c) { const L = [[...lineOf(numw(a)), { noGap: true }], [...lineOf(op === '+' ? 'gen.op.plus' : 'gen.op.minus'), { noGap: true, append: true }], [...lineOf(numw2(b)), { noGap: true, append: true }]];
  if (c != null) L.push([...lineOf('gen.op.eq'), { noGap: true, append: true }], [...lineOf(numw2(c)), { append: true }]); return L; }
async function readSentence(a, op, b, c) { for (const [w, id, t, o] of sentenceLines(a, op, b, c)) await say(w, id, t, o); }

/* ---------- تتبّع الأرقام المشرقية (N003): نموذج خطّ اليد، والنقطة الخضراء، وفحص بالتغطية ----------
   النماذج مرسومة يدوياً على أشكال الخطوط المعيارية (صندوق 100×140). البدء من الأعلى، ومن اليمين حين يكون للرقم طرفان علويّان.
   ويُقبل البدء من أيّ طرفَي الخط، لأن اتجاه ٧ و٨ يختلف بين المدارس؛ وتُراجع النماذج مع اختصاصي اللغة قبل الإنتاج. */
const DIGIT_SK = {
  0: [[50, 70]], 1: [[45, 15], [52, 70], [55, 128]],
  2: [[82, 15], [79, 33], [66, 45], [52, 43], [42, 30], [38, 16], [43, 70], [48, 128]],
  3: [[88, 15], [86, 32], [78, 41], [70, 34], [66, 18], [62, 33], [52, 41], [43, 32], [38, 16], [43, 70], [48, 128]],
  4: [[80, 16], [60, 13], [44, 22], [40, 36], [50, 47], [60, 52], [46, 58], [33, 76], [33, 104], [45, 123], [64, 128], [82, 120]],
  5: [[50, 14], [34, 42], [26, 86], [32, 118], [50, 128], [68, 118], [74, 86], [66, 42], [50, 14]],
  6: [[22, 16], [46, 21], [70, 16], [74, 40], [78, 90], [84, 128]],
  7: [[86, 14], [52, 128], [16, 14]], 8: [[86, 128], [50, 14], [14, 128]],
  9: [[64, 30], [52, 14], [34, 18], [26, 36], [34, 52], [50, 58], [66, 54], [68, 40], [70, 90], [76, 128]],
};
/* منحنى ناعم يمرّ بالنقاط (كاتمول-روم) */
function smoothPath(P) { if (P.length < 2) return ''; let d = `M${P[0][0]} ${P[0][1]}`;
  for (let i = 0; i < P.length - 1; i++) { const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`; } return d; }
/* أداة التتبّع: تعيد {ok, err} — err: startDot (بدأ بعيداً عن طرف الخط) أو short (لم يُكمل) */
function digitTrace(svg, n, x, y, k = 1.6, opt = {}) {
  const g = el('g', { transform: `translate(${x - 50 * k} ${y - 70 * k}) scale(${k})` }, svg); const P = DIGIT_SK[n];
  el('rect', { x: -8, y: -6, width: 116, height: 152, rx: 14, fill: '#fffdf6', stroke: css('--line'), 'stroke-width': 2 }, g);
  let path = null, samples;
  if (P.length > 1) { path = el('path', { d: smoothPath(P), fill: 'none', stroke: css('--line'), 'stroke-width': 18, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    el('path', { d: smoothPath(P), fill: 'none', stroke: css('--muted'), 'stroke-width': 2, 'stroke-dasharray': '4 6', 'stroke-linecap': 'round' }, g);
    const L = path.getTotalLength(); samples = []; for (let s = 0; s <= L; s += 6) { const q = path.getPointAtLength(s); samples.push([q.x, q.y]); }
    const a0 = path.getPointAtLength(0), a1 = path.getPointAtLength(Math.min(14, L)); const ang = Math.atan2(a1.y - a0.y, a1.x - a0.x) * 180 / Math.PI;
    const ar = el('g', { transform: `translate(${a0.x} ${a0.y}) rotate(${ang})` }, g); el('path', { d: 'M14 0 l-8 -6 M14 0 l-8 6', stroke: css('--good'), 'stroke-width': 3, 'stroke-linecap': 'round' }, ar);
  } else { el('circle', { cx: 50, cy: 70, r: 9, fill: css('--line') }, g); samples = [[50, 70]]; }
  const start = el('circle', { cx: P[0][0], cy: P[0][1], r: 8, fill: css('--good'), stroke: '#fff', 'stroke-width': 2.5 }, g);
  const ink = el('g', { 'pointer-events': 'none' }, g); const hit = new Set(); let first = null, strokes = 0, done = false;
  const ends = P.length > 1 ? [P[0], P[P.length - 1]] : [P[0]];
  const local = ev => { const p = svgPoint(svg, ev); return [(p.x - (x - 50 * k)) / k, (p.y - (y - 70 * k)) / k]; };
  const mark = q => { el('circle', { cx: q[0], cy: q[1], r: 6.5, fill: css('--compass'), opacity: .75 }, ink); samples.forEach((s, i) => { if (Math.hypot(s[0] - q[0], s[1] - q[1]) < 16) hit.add(i); }); };
  let down = false, res;
  const p = new Promise(r => res = r);
  const finish = () => { if (done) return; const cov = hit.size / samples.length; const nearEnd = first && ends.some(e => Math.hypot(e[0] - first[0], e[1] - first[1]) < 24);
    if (cov >= .85) { done = true; AUTO_CLEAR(); res({ ok: nearEnd, err: nearEnd ? null : 'startDot' }); } };
  const onDown = ev => { if (done) return; down = true; try { svg.setPointerCapture(ev.pointerId); } catch (e) {} const q = local(ev); if (!first) first = q; strokes++; mark(q); finish(); };
  const onMove = ev => { if (!down || done) return; mark(local(ev)); finish(); };
  const onUp = () => { if (!down) return; down = false; if (!done && strokes >= 1 && hit.size / samples.length < .85 && opt.onShort) opt.onShort(hit.size / samples.length); };
  svg.addEventListener('pointerdown', onDown); svg.addEventListener('pointermove', onMove); svg.addEventListener('pointerup', onUp); svg.addEventListener('pointercancel', onUp);
  const demo = async (fromWrong) => { const L = path ? path.getTotalLength() : 0;
    if (fromWrong) { const q = path ? path.getPointAtLength(L / 2) : null; first = q ? [q.x, q.y] : [50, 140]; } else if (!first) first = P[0];   /* الخطأ: البدء من وسط الرقم، بعيداً عن طرفيه أياً كان الرقم */
    if (!path) { mark([50, 70]); finish(); return; } for (let s = 0; s <= L; s += 4) { const q = path.getPointAtLength(s); mark([q.x, q.y]); } finish(); };
  AUTO({ kind: 'trace', ok: () => demo(false), wrong: () => demo(true) });
  return { g, p, ghost: async () => { const pts = P.length > 1 ? Array.from({ length: 12 }, (_, i) => { const q = path.getPointAtLength(path.getTotalLength() * i / 11); return [x - 50 * k + q.x * k, y - 70 * k + q.y * k]; }) : [[x, y], [x, y]]; await ghostHand(svg, pts, 1500); },
    reset: () => { ink.innerHTML = ''; hit.clear(); first = null; strokes = 0; done = false; } };
}
