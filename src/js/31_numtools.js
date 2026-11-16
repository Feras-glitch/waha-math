/* =====================================================================
   أدوات خيط العدد في م1 (D222): المكعبات والأبراج، وصناديق البريد، وبطاقات الأرقام وتتبّعها، والنقاط، والأصابع
   ===================================================================== */
const CUBE = { lemon: '#c9dd3a', white: '#f4f1e8', plain: '#9cc53b', big: '#9cc53b' }, CUBE_EDGE_W = '#a39b88';
/* مكعب صغير بإسقاط ثابت (للأبراج): يعيد المجموعة، ومركزه عند (x, y) */
function cubeAt(parent, x, y, size = 30, color = CUBE.plain) { const g = el('g', { transform: `translate(${x} ${y})` }, parent);
  drawBox(g, { w: size, h: size, d: size * .7, yaw: 18, pitch: 16, color, edge: color === CUBE.white ? CUBE_EDGE_W : '#ffffff' }); return g; }   /* المكعب الأبيض بحدٍّ رماديّ: الأبيض على السماء الفاتحة كان باهتاً (الألعاب، 15 نوفمبر) */
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
  const g = el('g', { role: 'button', tabindex: 0, 'aria-label': plain(G(labelText('countTower'))), 'data-tapcount': n }, svg); g.style.cursor = 'pointer';   /* عدد اللمسات للمس الحقيقي (realtap_run) */
  el('rect', { x: T.x - w / 2, y: T.top - 12, width: w, height: T.baseY - T.top + 16, fill: 'transparent', 'pointer-events': 'all' }, g);
  AUTO({ kind: 'tapCount', ok: async () => { for (let i = k; i < n; i++) { g.dispatchEvent(new MouseEvent('click', { bubbles: true })); await new Promise(r => setTimeout(r, 40)); } } });
  const off = pulse(T.cubes);
  return gate(new Promise(res => { const act = () => { if (k >= n) return; off(); k++; SFX.tick(); buzz(20);
      badge(marks, T.x + T.size * .9, T.baseY - T.size * .62 - (k - 1) * T.step, k, opt.color);
      if (!SET.muted && !FAST) say(...lineOf(numw(k)), { num: true, noGap: true, free: true });
      if (k === n) { AUTO_CLEAR(); g.remove(); res(n); } };
    g.onclick = act; g.onkeydown = e => { if (actKey(e)) act(); }; }));
}
/* جملة عددية تُكتب بالكتابة المختارة: «٤ + ٣ = ٧». واتجاهها يتبع الكتابة (D251): من اليمين مع الأرقام المشرقية كما في الكتب المشرقية
   فتُقرأ كما تُنطق، ومن اليسار مع الغربية. والصوت واحد. (طريق الأعداد وشبكة المئة من اليسار دائماً، D229 (6).) */
const NUM_DIR = () => SET.digits === 'west' ? 'ltr' : 'rtl';
function sentenceText(a, op, b, c) { return `${DG(a)} ${op === '+' ? '+' : '−'} ${DG(b)} = ${c == null ? '؟' : DG(c)}`; }
/* السطر بترتيب عرضه (D251، D229 (6)): الرموز من اليمين مع المشرقية ومن اليسار مع الغربية، وكل عدد برقميه كما يُكتب (العشرات على اليسار في الكتابتين).
   فيُرسم من اليسار بلا إعادة ترتيب (ltr مع bidi-override) والرموز مقلوبة الترتيب للمشرقية. لا يُرسم من اليمين بـ bidi-override: هذا يقلب رقمي العدد نفسه
   فيصير ١٣ «٣١» وهو خطأ فوضى في درس العشرة بعينه (الفحص المستقل A لبوابة S1-U4، حاجب: «٨ + ٥ = ٣١» في اكتشاف الدرس 7) */
const visualLine = toks => (NUM_DIR() === 'rtl' ? [...toks].reverse() : toks).join(' ');
const sentenceToks = (a, op, b, c) => [DG(a), op === '+' ? '+' : '−', DG(b), '=', c == null ? '؟' : DG(c)];
function sentenceAt(parent, x, y, a, op, b, c, opt = {}) { const g = el('g', { transform: `translate(${x} ${y})` }, parent);
  if (opt.box !== false) el('rect', { x: -96, y: -30, width: 192, height: 52, rx: 14, fill: '#fffdf6', stroke: css('--line'), 'stroke-width': 3 }, g);
  const t = el('text', { y: 8, 'text-anchor': 'middle', 'font-size': 34, 'font-weight': 800, fill: opt.box === false ? css('--ink') : CARD_INK, 'font-family': css('--f'), direction: 'ltr', 'unicode-bidi': 'bidi-override', 'data-sent': 1 }, g); t.textContent = visualLine(sentenceToks(a, op, b, c)); t.setAttribute('aria-label', sentenceText(a, op, b, c)); return g; }
/* قراءة الجملة بالكلمات: «أَرْبَعَة» «زَائِد» «ثَلَاثَة» «يُسَاوِي» «سَبْعَة» */
/* والجملة جملٌ قصيرة تُكتب في الفقاعة متتابعة (append)، فتظهر الجملة كلها لا آخر كلمة؛ وsentenceLines تعطيها لـ readChoices وخطّاف «أعد الجملة» */
function sentenceLines(a, op, b, c) { const L = [[...lineOf(numw(a)), { noGap: true }], [...lineOf(op === '+' ? 'gen.op.plus' : 'gen.op.minus'), { noGap: true, append: true }], [...lineOf(numw2(b)), { noGap: true, append: true }]];
  if (c != null) L.push([...lineOf('gen.op.eq'), { noGap: true, append: true }], [...lineOf(numw2(c)), { append: true }]); return L; }
async function readSentence(a, op, b, c) { for (const [w, id, t, o] of sentenceLines(a, op, b, c)) await say(w, id, t, o); }

/* ---------- تتبّع الأرقام (N003): نموذج خطّ اليد، والنقطة الخضراء، والاتجاه ----------
   النماذج في صندوق 100×140، وكل رقم ضربة واحدة أو ضربات (مصفوفة نقاط لكل ضربة)، والنقطة الأولى بدايتها.
   المشرقية بحسب كتب الصف الأول: «سلاح التلميذ» (مصر، نشاط «تتبّع واكتب»: الأسهم المرقّمة)، و«طريقة تدريس الأعداد من 1-9 للصف الأول الأساسي»
   (أ. عبد الرحمن خليفة، من فريق تأليف المنهاج الفلسطيني)؛ وقرار فراس في ٩. فيها: ٥ من أعلى يميناً مع عقارب الساعة، و٨ من أسفل اليسار،
   و٩ ضربة واحدة: من أسفل الرأس يساراً، ثم صعوداً مع عقارب الساعة حتى تُغلق الرأس عند البداية، ثم الساق إلى أسفل.
   والاتجاه مفروض (قرار فراس): البدء من النقطة الخضراء، والسير مع الأسهم؛ ومن خالف نُبّه بلطف وعُرضت عليه الطريقة. */
const DIGIT_SK = {
  0: [[[50, 70]]], 1: [[[45, 15], [52, 70], [55, 128]]],
  2: [[[82, 15], [79, 33], [66, 45], [52, 43], [42, 30], [38, 16], [43, 70], [48, 128]]],
  3: [[[88, 15], [86, 32], [78, 41], [70, 34], [66, 18], [62, 33], [52, 41], [43, 32], [38, 16], [43, 70], [48, 128]]],
  4: [[[80, 16], [60, 13], [44, 22], [40, 36], [50, 47], [60, 52], [46, 58], [33, 76], [33, 104], [45, 123], [64, 128], [82, 120]]],
  5: [[[50, 14], [66, 42], [74, 86], [68, 118], [50, 128], [32, 118], [26, 86], [34, 42], [50, 14]]],
  6: [[[22, 16], [46, 21], [70, 16], [74, 40], [78, 90], [84, 128]]],
  7: [[[86, 14], [52, 128], [16, 14]]], 8: [[[14, 128], [50, 14], [86, 128]]],
  9: [[[64, 50], [48, 57], [32, 50], [26, 35], [32, 20], [47, 14], [61, 20], [67, 35], [66, 52], [69, 90], [75, 128]]],
};
/* الأرقام الغربية (D229: يختارها الطفل بعد درس الأرقام) بطريقة كتب المدارس: ٤ و٥ ضربتان، و٨ من أعلى اليمين، و٩ الرأس ثم الساق */
const DIGIT_SK_W = {
  0: [[[50, 14], [28, 30], [22, 70], [28, 110], [50, 128], [72, 110], [78, 70], [72, 30], [50, 14]]], 1: [[[50, 14], [50, 128]]],
  2: [[[24, 40], [36, 18], [56, 12], [74, 24], [76, 46], [62, 72], [24, 126], [80, 126]]],
  3: [[[26, 24], [48, 12], [70, 22], [72, 44], [50, 64], [74, 82], [76, 108], [54, 128], [26, 118]]],
  4: [[[56, 14], [20, 88], [84, 88]], [[64, 40], [64, 128]]],
  5: [[[30, 14], [27, 62], [52, 54], [74, 70], [76, 102], [58, 126], [26, 120]], [[30, 14], [76, 14]]],
  6: [[[72, 18], [48, 14], [28, 40], [22, 80], [30, 114], [52, 128], [74, 110], [74, 84], [54, 68], [30, 76], [22, 92]]], 7: [[[20, 14], [80, 14], [42, 128]]],
  8: [[[72, 26], [52, 13], [30, 24], [32, 46], [52, 64], [74, 84], [72, 112], [50, 128], [28, 112], [28, 86], [50, 66], [70, 48], [74, 30]]],
  9: [[[74, 30], [56, 13], [34, 18], [24, 40], [36, 62], [58, 62], [74, 46]], [[74, 22], [72, 128]]],
};
/* منحنى ناعم يمرّ بالنقاط (كاتمول-روم) */
function smoothPath(P) { if (P.length < 2) return ''; let d = `M${P[0][0]} ${P[0][1]}`;
  for (let i = 0; i < P.length - 1; i++) { const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`; } return d; }
/* أداة التتبّع: تعيد {ok, err} — err: startDot (بدأ بعيداً عن النقطة الخضراء) أو traceDir (سار عكس الأسهم).
   الحبر خطٌّ متصل يتبع الإصبع (تُملأ الفجوات بين نقاط اللمس، ومنها النقاط المجمّعة getCoalescedEvents)، فلا ينقطع مهما أسرع الإصبع.
   والتقدّم على النموذج بترتيبه: لا يتقدّم إلا إلى ما أمامه قريباً، فلا يُحسب الرقم بالمرور عليه كيفما اتّفق. ورفع الإصبع والعودة من حيث وقف جائز. */
function digitTrace(svg, n, x, y, k = 1.6, opt = {}) {   /* opt.sk: نماذج الأرقام (الغربية)، opt.noAuto: خطّاف الفحص لمن يجمع لوحين، opt.onFirst: أول لمسة على هذا اللوح */
  const g = el('g', { transform: `translate(${x - 50 * k} ${y - 70 * k}) scale(${k})` }, svg); const SK = (opt.sk || DIGIT_SK)[n];
  el('rect', { x: -8, y: -6, width: 116, height: 152, rx: 14, fill: '#fffdf6', stroke: css('--line'), 'stroke-width': 2 }, g);
  const R = 17, AHEAD = 7, BACK = 26;   /* التسامح حول الخط، ونافذة الاستئناف والرجوع (عيّنات كل 4 وحدات)، ومسافة السير المعاكس قبل التنبيه؛ والتقدّم عيّنتان على الأكثر لكل 3 وحدات من الإصبع، فلا يسبق الإصبعَ إلى فرعٍ يعود على الخط */
  const strokes = SK.map(P => { if (P.length < 2) { el('circle', { cx: P[0][0], cy: P[0][1], r: 9, fill: css('--line') }, g); return { P, path: null, smp: [P[0]] }; }
    const d = smoothPath(P); const path = el('path', { d, fill: 'none', stroke: css('--line'), 'stroke-width': 18, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    el('path', { d, fill: 'none', stroke: css('--muted'), 'stroke-width': 2, 'stroke-dasharray': '4 6', 'stroke-linecap': 'round' }, g);
    const L = path.getTotalLength(), smp = []; for (let s = 0; s <= L; s += 4) { const q = path.getPointAtLength(s); smp.push([q.x, q.y]); } if (L % 4) { const q = path.getPointAtLength(L); smp.push([q.x, q.y]); }
    for (let s = 22; s < L - 10; s += 30) { const a = path.getPointAtLength(s), b = path.getPointAtLength(Math.min(L, s + 3)); const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;   /* أسهم الاتجاه على الخط */
      el('path', { d: 'M3 0 l-6 -4.5 M3 0 l-6 4.5', transform: `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) rotate(${ang.toFixed(0)})`, fill: 'none', stroke: css('--good'), 'stroke-width': 2.4, 'stroke-linecap': 'round' }, g); }
    return { P, path, smp }; });
  strokes.forEach((S0, i) => { const c = el('g', { 'data-start': i + 1 }, g); el('circle', { cx: S0.P[0][0], cy: S0.P[0][1], r: 8, fill: css('--good'), stroke: '#fff', 'stroke-width': 2.5 }, c);
    if (strokes.length > 1) { const t = el('text', { x: S0.P[0][0], y: S0.P[0][1] + 3.5, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 800, fill: '#fff' }, c); t.textContent = DG(i + 1); } });
  const ink = el('g', { 'pointer-events': 'none' }, g);
  let si = 0, pi = 0, done = false, first = null, down = false, bad = null, badRun = 0, back = 0, last = null, line = null, pts = '', res;
  const p = new Promise(r => res = r);
  const D2 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const local = ev => { const q = svgPoint(svg, ev); return [(q.x - (x - 50 * k)) / k, (q.y - (y - 70 * k)) / k]; };
  const finish = r => { if (done) return; done = true; down = false; AUTO_CLEAR(); res(r); };
  const startLine = q => { line = el('path', { d: '', fill: 'none', stroke: css('--compass'), 'stroke-width': 11, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: .8 }, ink); pts = `M${q[0].toFixed(1)} ${q[1].toFixed(1)}`; line.setAttribute('d', pts + ' l0 0'); };
  const addInk = q => { pts += ` L${q[0].toFixed(1)} ${q[1].toFixed(1)}`; line.setAttribute('d', pts); };
  const advance = q => {   /* يتقدّم إلى أبعد عيّنة قريبة أمامه؛ والسير قرب ما خلفه بعيداً عمّا أمامه سيرٌ معاكس */
    const smp = strokes[si].smp; let hit = -1;
    let best = R; for (let j = Math.max(0, pi - 1); j < Math.min(smp.length, pi + 3); j++) { const d = D2(smp[j], q); if (d < best - .5) { best = d; hit = j; } }   /* الأقرب لا الأبعد: حيث يعود الخط على نفسه (٢، ٣) لا يقفز التقدّم إلى الفرع التالي */
    if (hit < 0) { best = R * .8; for (let j = pi + 3; j < Math.min(smp.length, pi + 3 * AHEAD); j++) { const d = D2(smp[j], q); if (d < best) { best = d; hit = j; } } }   /* إصبعٌ سريعٌ قطع رأس زاويةٍ يعود فيها الخط على نفسه (٢، ٣): يُلحق به إلى الفرع الذي هو عليه */
    if (hit >= 0) { pi = Math.max(pi, hit + 1); back = 0; }   /* الإسقاط على الخط يشمل العيّنة التي وقف عندها، فلا يسبق التقدّمُ الإصبع */
    else if ((pi > 3 && smp.slice(0, Math.max(0, pi - 6)).some(s => D2(s, q) < R * .8)) || smp.slice(pi + AHEAD + 6).some(s => D2(s, q) < R * .8)) back++;   /* رجوعٌ إلى ما خلفه، أو قفزٌ إلى آخر الخط: عكسُ الدائرة (٥) */
    if (pi >= smp.length - 1) { si++; pi = 0; if (si >= strokes.length) finish({ ok: true, err: null }); else { down = false; } } };
  const step = q => {   /* نقطة واحدة من الإصبع، والفجوة بينها وبين السابقة تُملأ بنقاط كل 3 وحدات */
    const from = last || q; const L = D2(from, q), m = Math.max(1, Math.ceil(L / 3));
    for (let i = 1; i <= m; i++) { const r = [from[0] + (q[0] - from[0]) * i / m, from[1] + (q[1] - from[1]) * i / m]; addInk(r);
      if (bad) { badRun += L / m; if (badRun > 14) return finish({ ok: false, err: bad }); }
      else { advance(r); if (done || !down) break; if (back * 3 > BACK) return finish({ ok: false, err: 'traceDir' }); } }
    last = q; };
  const begin = q => {   /* لمسة جديدة: من البداية، أو من حيث وقف بعد رفع الإصبع */
    const S0 = strokes[si], smp = S0.smp; startLine(q); last = q; bad = null; badRun = 0; back = 0;
    if (smp.length === 1) { if (D2(smp[0], q) < R + 4) { si++; if (si >= strokes.length) finish({ ok: true, err: null }); } else bad = 'startDot'; return; }
    const resume = pi > 0 && smp.slice(Math.max(0, pi - 4), pi + AHEAD).some(s => D2(s, q) < R + 4);
    if (pi === 0 && D2(smp[0], q) < 24) { pi = 1; return; }
    if (resume) return;
    const end = smp[smp.length - 1]; bad = pi === 0 && D2(end, q) < 24 && D2(smp[0], end) > 30 ? 'traceDir' : 'startDot'; };
  const inBox = ev => { const q = local(ev); return q[0] > -12 && q[0] < 112 && q[1] > -10 && q[1] < 150; };
  const onDown = ev => { if (done || (opt.sk && !inBox(ev))) return; if (opt.onFirst && !first) opt.onFirst(); down = true; try { svg.setPointerCapture(ev.pointerId); } catch (e) {} const q = local(ev); if (!first) first = q; begin(q); };
  const onMove = ev => { if (!down || done) return; const evs = ev.getCoalescedEvents ? ev.getCoalescedEvents() : []; for (const e of (evs.length ? evs : [ev])) { if (!down || done) break; step(local(e)); } };
  const onUp = () => { if (!down) return; down = false; if (done) return;
    if (bad) { if (badRun <= 14) { ink.lastChild && ink.lastChild.remove(); bad = null; } return; }   /* لمسةٌ عابرة خارج البداية تُمحى ولا تُحسب */
    if (si < strokes.length && opt.onShort) opt.onShort(); };
  svg.addEventListener('pointerdown', onDown); svg.addEventListener('pointermove', onMove); svg.addEventListener('pointerup', onUp); svg.addEventListener('pointercancel', onUp);
  const toBox = q => [x - 50 * k + q[0] * k, y - 70 * k + q[1] * k];
  const demo = async (fromWrong) => {   /* خطّاف الفحص: الخطأ بدءٌ من وسط الضربة الأولى؛ والصواب السير على الضربات بترتيبها */
    if (fromWrong) { const S0 = strokes[0]; const m = S0.smp.length > 1 ? S0.smp[Math.floor(S0.smp.length / 2)] : [50, 140]; first = first || m; down = true; begin(m); for (let i = 1; i <= 8 && !done; i++) step([m[0] + i * 2, m[1] + i * 2]); down = false; if (!done) finish({ ok: false, err: 'startDot' }); return; }
    for (const S0 of strokes) { if (done) break; if (!first) first = S0.smp[0]; down = true; begin(S0.smp[0]); for (const q of S0.smp) { if (done || !down) break; step(q); } down = false; } };
  if (!opt.noAuto) AUTO({ kind: 'trace', ok: () => demo(false), wrong: () => demo(true) });
  return { g, p, demo,
    ghost: async () => { for (const S0 of strokes) { const pts = S0.path ? Array.from({ length: 16 }, (_, i) => { const q = S0.path.getPointAtLength(S0.path.getTotalLength() * i / 15); return toBox([q.x, q.y]); }) : [toBox(S0.P[0]), toBox(S0.P[0])]; await ghostHand(svg, pts, S0.path ? 1600 : 600); } },
    reset: () => { ink.innerHTML = ''; si = 0; pi = 0; first = null; done = false; bad = null; } };
}
