/* =====================================================================
   كتالوج المشاهد (D246، D249): كل مشهد في مسار الدرس اسمٌ من هذا الكتالوج تشير إليه البيانات
   (content/m1/uN/dN.json ← flow)، ويقرأ جمله بمعرّفاتها من بيانات الدرس. والمرجع المكتوب في docs/SCENES.md.
   ===================================================================== */
const SCENES = {};
/* ---------- عامّة ---------- */
/* بنود داخل الاكتشاف أو اللعبة: {items:[...], mode:'explore'|'practice', intro} */
SCENES.items = async c => { if (c.intro) await S(c.intro); for (const it of c.items) await runItem(it, c.mode || 'explore', { scene: c.stage || 'explore' }); if (c.after) await S(c.after); };
/* مسار المواد (D238): يظهر في مسار «معي» وحده؛ صورة الأشياء وتعليمة وزرّ «تمّ» */
SCENES.material = async c => {
  if (!PATH_MAT()) return; MAT_AVOID = new Set(c.avoid || []); const svg = newStage(260, { oasis: false, ground: 0 });   /* أعداد مسائلها لا تكون مشتّتاً في الشاشة التي تخدمها (H1 (10أ)) */
  (c.show || []).forEach((r, i, a) => fitThing(svg, make(r), 300 - i * (240 / Math.max(1, a.length - 1 || 1)), 120, 96));
  if (c.icon) { const g = el('g', { transform: 'translate(180 120)' }, svg); g.innerHTML = PICKICON.mat.replace('<svg', '<svg x="-60" y="-42" width="120" height="84"'); }
  await S(c.prompt); const d = doneBtn(); AUTO({ kind: 'material', ok: () => d.b.click() });
  await gate(new Promise(r => d.b.onclick = () => { AUTO_CLEAR(); hush(); d.bar.remove(); r(); })); logAttempt({ scene: 'material', tag: c.prompt, ok: true }); if (c.after) await S(c.after); };
/* أسطر فقط (مع خلفية اختيارية) */
SCENES.lines = async c => { if (c.stage !== false) newStage(c.h || 260, c.bg || {}); await S(c.lines); };

/* ---------- لغة الخطوات للأمثلة المحلولة والتذكّر (M5: لمسات مُنتِجة بدل «التالي» كلما أمكن) ---------- */
SCENES.steps = async c => {
  const svg = c.svg || newStage(c.h || 300, c.bg || {}); const st = { svg, objs: {} };
  for (const [i, step] of c.steps.entries()) { for (const op of [].concat(step)) await stepOp(st, op); if (i < c.steps.length - 1 && !c.auto) await nextBtn(); }
  return st;
};
function objOf(st, id) { return st.objs[id]; }
async function stepOp(st, op) {
  const svg = st.svg;
  if (op.clear) { svg.innerHTML = ''; backdrop(svg, +svg.getAttribute('viewBox').split(' ')[3], op.bg || {}); st.objs = {}; }
  if (op.show) { const s = make(op.show); const [x, y] = op.at; const g = thingAt(svg, { ...s, label: null }, x, y); g.__s = { ...s, x, y }; g.__x = x; g.__y = y;
    if (op.k) g.setAttribute('transform', g.getAttribute('transform') + ` scale(${op.k})`); if (op.fade) anim(g, [{ opacity: 0 }, { opacity: 1 }], 600); if (op.label) label(svg, x, y + (op.ly || 92), labelText(op.label), 16); st.objs[op.id || 'a'] = g; }
  if (op.label && !op.show) label(svg, op.at[0], op.at[1], labelText(op.label), op.size || 17);
  if (op.chaosIn) { st.chaos = chaosAt(svg, op.chaosIn[0], op.chaosIn[1], op.k || .5); await chaosGiggle(st.chaos); }
  if (op.chaosOut && st.chaos) { await anim(st.chaos, [{ opacity: 1 }, { opacity: 0 }], 400).done; st.chaos.remove(); st.chaos = null; }
  if (op.swap) { const g = objOf(st, op.swap); const s = make(op.to); const ng = thingAt(svg, { ...s, label: null }, g.__x, g.__y); ng.__s = { ...s, x: g.__x, y: g.__y }; ng.__x = g.__x; ng.__y = g.__y; g.remove(); st.objs[op.swap] = ng;
    await anim(ng, [{ transform: `translate(${ng.__x}px,${ng.__y}px) rotate(${op.from || -24}deg)` }, { transform: `translate(${ng.__x}px,${ng.__y}px) rotate(0deg)` }], { duration: 900, easing: 'ease-out' }).done; }
  if (op.rotate) { const g = objOf(st, op.rotate); const from = g.__s.rot || 0; const to = op.to; g.__s.rot = to;
    await anim(g, [{ transform: `translate(${g.__x}px,${g.__y}px) rotate(${from}deg)` }, { transform: `translate(${g.__x}px,${g.__y}px) rotate(${to}deg)` }], { duration: op.ms || 1200, fill: 'forwards', easing: 'ease-in-out' }).done; }
  if (op.move) { const g = objOf(st, op.move); const [x, y] = op.to; const sc = op.scale || 1;
    await anim(g, [{ transform: `translate(${g.__x}px,${g.__y}px) rotate(${g.__s.rot || 0}deg)` }, { transform: `translate(${x}px,${y}px) rotate(${g.__s.rot || 0}deg) scale(${sc})` }], { duration: op.ms || 900, fill: 'forwards', easing: 'ease-in-out' }).done; g.__x = x; g.__y = y; }
  if (op.badges) { const g = objOf(st, op.badges); const s = g.__s; const P = worldPoly(s); const m = el('g', { 'pointer-events': 'none' }, svg); st.marks = m;
    const pts = op.what === 'sides' ? P.map((a, i) => { const b = P[(i + 1) % P.length]; return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }) : P;
    for (const [i, [x, y]] of pts.entries()) { badge(m, x, y, i + 1, op.color ? css(op.color) : undefined); SFX.tick(); await S(numw(i + 1), { noGap: true, num: true }); await sleep(220); } }
  if (op.unmark && st.marks) { st.marks.remove(); st.marks = null; }
  if (op.count) { const g = objOf(st, op.count); const P = worldPoly(g.__s); const pts = op.what === 'sides' ? P.map((a, i) => { const b = P[(i + 1) % P.length]; return { x: (a[0] + b[0]) / 2, y: (a[1] + b[1]) / 2 }; }) : P.map(([x, y]) => ({ x, y }));
    if (op.prompt) say(...lineOf(op.prompt), { free: true }); await countTouch(svg, pts, { halo: 20, by: -26, pad: 56 }); hush(); svg.querySelectorAll('g[pointer-events=none]').forEach(m => { if (m !== st.marks) m.remove(); }); }
  if (op.sayAlong) st.along = S(op.sayAlong);
  if (op.tap) { await tapPart(st, op); }
  if (op.orbit) { const g = objOf(st, op.orbit); const r = (g.__s.size || 140) / 2; const dot = el('circle', { r: 9, fill: css('--compass'), stroke: '#fff', 'stroke-width': 3 }, svg);
    await tween(1800, t => { const a = t * 2 * Math.PI; dot.setAttribute('cx', g.__x + r * Math.cos(a)); dot.setAttribute('cy', g.__y + r * Math.sin(a)); }); }
  if (op.strip) { const g = objOf(st, op.strip); const s = g.__s; const w = s.w, h = s.h; const c1 = el('rect', { x: g.__x - w / 2, y: g.__y - h / 2 - 4, width: w, height: 8, rx: 4, fill: css('--compass') }, svg);
    await anim(c1, [{ transform: 'translateY(0)' }, { transform: `translateY(${h}px)` }, { transform: `translateY(${h}px)` }, { transform: 'translateY(0)' }], { duration: 2200, fill: 'forwards' }).done; }
  if (op.corners) { const g = objOf(st, op.corners); await VIS.corner({ ...g.__s, x: g.__x, y: g.__y }, { svg, g }); }
  if (op.mail) { const [x, y, n] = op.mail; const m = mailboxAt(svg, x, y, n); m.__x = x; m.__y = y; st.objs[op.id || 'mail'] = m; }
  if (op.card) { const [x, y, n, k] = op.card; digitCard(svg, x, y, n, { size: k || 1 }); }
  if (op.ring) { const [x, y, rx, ry] = op.ring; const r = el('ellipse', { cx: x, cy: y, rx, ry, fill: 'none', stroke: css('--compass'), 'stroke-width': 4, 'stroke-dasharray': '7 5' }, svg); anim(r, [{ opacity: 0 }, { opacity: 1 }], 400); }
  if (op.countMail) { const m = objOf(st, op.countMail);   /* الرسائل متلاصقة في النافذة: تومض كل رسالة حين تُعدّ، ثم شارة واحدة بالعدد كله (لا شارات متراكبة) */
    for (const [i, l] of m.letters.entries()) { anim(l, [{ opacity: 1 }, { opacity: .25 }, { opacity: 1 }], { duration: FAST ? 20 : 420 }); SFX.tick(); await S(numw(i + 1), { noGap: true, num: true }); }
    if (m.letters.length) badge(svg, m.__x + 46, m.__y - 52, m.letters.length); }
  if (op.qmarks) for (const [x, y] of op.qmarks) { const c = el('g', { transform: `translate(${x} ${y})` }, svg); el('circle', { r: 17, fill: css('--think') }, c); el('text', { y: 7, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: '#fff', 'font-family': css('--f') }, c).textContent = '؟'; }
  if (op.ticks) for (const [x, y, v] of op.ticks) el('line', v ? { x1: x - 8, y1: y, x2: x + 8, y2: y, stroke: css('--ink'), 'stroke-width': 3 } : { x1: x, y1: y - 8, x2: x, y2: y + 8, stroke: css('--ink'), 'stroke-width': 3 }, svg);
  if (op.edgeTurn) await edgeTurn(svg);
  if (op.towers) { st.towers = op.towers.map(([n, x, colorKey, size]) => towerAt(svg, x, op.base || 250, n, { size: size || 26, color: CUBE[colorKey || 'plain'] })); }
  if (op.towers2) for (const [n, x, colorKey, from] of op.towers2) { const T = st.towers.find(t => t.x === x) || st.towers[0]; const add = towerAt(svg, x, T.baseY - from * T.step, n, { size: T.size, color: CUBE[colorKey || 'white'] });
    await anim(add.g, [{ transform: 'translate(-90px,0px)' }, { transform: 'translate(0px,0px)' }], { duration: 700, easing: 'cubic-bezier(.3,1.2,.6,1)' }).done; await badgeCount(svg, zig(add.cubes.map((c, i) => ({ x: x + T.size * .9, y: T.baseY - T.size * .62 - (from + i) * T.step }))), css('--square'), from + 1); }
  if (op.coverTop) { const [ti, k] = op.coverTop; const T = st.towers[ti]; const n = T.cubes.length; el('rect', { x: T.x - T.size * .8, y: T.baseY - n * T.step - 4, width: T.size * 1.6, height: k * T.step + 4, rx: 8, fill: '#c98f55', opacity: .92 }, svg); }
  if (op.pair) await pairLines(svg, st.towers[0], st.towers[1], 800);
  if (op.countTower != null) { const T = st.towers[op.countTower]; await badgeCount(svg, zig(T.cubes.map((c, i) => ({ x: T.x + T.size * .9, y: T.baseY - T.size * .62 - i * T.step }))), css('--compass')); }
  if (op.sentence) { const [a, o, b, cc] = op.sentence; sentenceAt(svg, op.at ? op.at[0] : 180, op.at ? op.at[1] : 40, a, o, b, cc); if (!op.quiet) await readSentence(a, o, b, cc); }
  if (op.wait) await sleep(op.wait);
  if (op.waitSay && st.along) { await st.along; st.along = null; }
  if (op.say) await S(op.say);
}
/* لمسة مُنتِجة في المثال المحلول: المس الرأس الرابع، أو الحافة المنحنية، أو الفتحة */
async function tapPart(st, op) { const g = objOf(st, op.tap); const s = g.__s; let targets;
  if (op.what === 'vertex') { const P = worldPoly(s); const i = (op.index ?? P.length - 1); const [x, y] = P[i]; const h = el('g', { transform: `translate(${x} ${y})` }, st.svg); el('circle', { r: 34, fill: 'transparent' }, h); targets = [{ g: h, k: 'v', label: labelText('vertex') }]; }   // 68 وحدة: يبقى فوق 56 بكسل حتى إن صغُر المسرح
  else { const h = el('g', { transform: `translate(${g.__x + (op.dx || 0)} ${g.__y + (op.dy || 0)})` }, st.svg); el('circle', { r: 34, fill: 'transparent' }, h); targets = [{ g: h, k: 'p', label: labelText(op.what) }]; }
  if (op.prompt) say(...lineOf(op.prompt), { free: true }); await tapOne(targets, { ok: targets[0].k }); hush(); SFX.good(); logAttempt({ scene: 'worked', tag: 'tap-' + op.what, ok: true }); }

/* ---------- الوحدة 1 ---------- */
/* سباق العربتين (فوضى تفعل): توقّع باللمس ثم الحركة */
SCENES.cartsRace = async c => {
  const svg = newStage(300, { oasisOpacity: .3 }); el('rect', { x: -360, y: 136, width: 1080, height: 8, fill: css('--line') }, svg);
  const cart = (y, wheel, lbl) => { const g = el('g', { transform: `translate(250 ${y})` }, svg);
    const body = el('g', { filter: 'url(#pp)' }, g); el('rect', { x: -56, y: -50, width: 112, height: 44, rx: 12, fill: MAT.wood, stroke: '#fff', 'stroke-width': 4 }, body); el('rect', { x: -56, y: -50, width: 112, height: 44, rx: 12, fill: 'url(#shine)' }, body);
    el('line', { x1: 40, y1: -50, x2: 40, y2: -86, stroke: MAT.woodDk, 'stroke-width': 3 }, g); el('polygon', { points: '40,-86 66,-78 40,-70', fill: MAT.red }, g);
    const ws = []; for (const wx of [-32, 32]) { const w = el('g', { transform: `translate(${wx} 0)` }, g); w.dataset.wx = wx;
      if (wheel === 'circle') { el('circle', { r: 17, fill: css('--circle'), stroke: '#fff', 'stroke-width': 3 }, w); el('line', { x1: -10, y1: 0, x2: 10, y2: 0, stroke: '#fff', 'stroke-width': 2 }, w); }
      else el('rect', { x: -16, y: -16, width: 32, height: 32, fill: css('--square'), stroke: '#fff', 'stroke-width': 3 }, w);
      el('circle', { r: 3.5, fill: '#1b3440' }, w); ws.push(w); }
    return { g, ws, k: wheel, label: lbl }; };
  const top = cart(118, 'circle', labelText('cartRound')), bot = cart(250, 'square', labelText('cartSquare'));
  const fz = chaosAt(svg, 330, 196, .42); await chaosGiggle(fz);
  const choiceP = tapOne([top, bot], { ok: 'circle' }); let early = false; choiceP.then(() => early = true);
  await S(c.lines[0]); if (!early) await S(c.lines[1]);
  const choice = await choiceP; logAttempt({ scene: 'hook', tag: 'predict', ok: choice === 'circle' }); SFX.tick();
  await S(choice === 'circle' ? c.lines[2] : c.lines[3]); fz.remove();
  anim(top.g, [{ transform: 'translate(250px,118px)' }, { transform: 'translate(70px,118px)' }], { duration: 3200, fill: 'forwards', easing: 'linear' });
  top.ws.forEach(w => anim(w, [{ transform: `translate(${w.dataset.wx}px,0px) rotate(0deg)` }, { transform: `translate(${w.dataset.wx}px,0px) rotate(-720deg)` }], { duration: 3200, fill: 'forwards' }));
  const hops = []; for (let k = 0; k <= 8; k++) hops.push({ transform: `translate(${250 - k * 10}px, ${250 - (k % 2 ? 12 : 0)}px) rotate(${k % 2 ? -4 : 0}deg)` });
  sleep(900).then(() => SFX.soft());   /* بالبوابة: تقف مع الدرس ولا تُدقّ بعد الخروج على الخريطة (الفحص المستقل I2 (4)) */ await anim(bot.g, hops, { duration: 3200, fill: 'forwards', easing: 'steps(8, end)' }).done;
  await S(c.lines.slice(4));
};
/* تتبّع الحافة: {shapes:[{type,size,color:'--circle',x,y,caption}], sides, pairColors, intro, sidesIntro, after} */
SCENES.trace = async c => { const svg = newStage(300, { oasisOpacity: .25 });
  const shapes = c.shapes.map(s => make(s));
  const P = traceTool(svg, shapes, { sides: c.sides, pairColors: c.pairColors, sidesIntro: c.sidesIntro }); await S(c.intro); await P; await S(c.after); };
/* السقف (فوضى تفعل): تجرّب المربع فتبقى فراغات، والطفل يختار القطعة المناسبة */
SCENES.roofFit = async c => {
  const svg = newStage(300, { oasisOpacity: .25 });
  const house = el('g', { filter: 'url(#pp)' }, svg); el('rect', { x: 120, y: 150, width: 120, height: 104, fill: '#e9c99a', stroke: '#fff', 'stroke-width': 4 }, house); el('rect', { x: 166, y: 204, width: 28, height: 50, fill: MAT.woodDk }, house);
  el('polygon', { points: '112,150 180,82 248,150', fill: 'none', stroke: css('--ink'), 'stroke-width': 3, 'stroke-dasharray': '9 7', opacity: .55 }, svg);
  const tri = shapeAt(svg, { type: 'triangle', w: 136, h: 68, color: css('--triangle') }, 72, 52); const sq = shapeAt(svg, { type: 'square', size: 64, color: css('--square') }, 292, 52);
  const fz = chaosAt(svg, 300, 150, .4);
  await anim(sq, [{ transform: 'translate(292px,52px)' }, { transform: 'translate(180px,118px)' }, { transform: 'translate(180px,118px) rotate(8deg)' }, { transform: 'translate(292px,52px)' }], { duration: 1800 }).done; SFX.soft(); await chaosGiggle(fz);
  await S(c.lines[0]);
  const choice = await tapOne([{ g: tri, k: 'triangle', label: labelText('pieceTri') }, { g: sq, k: 'square', label: labelText('pieceSq') }], { ok: 'triangle' }); logAttempt({ scene: 'hook', tag: 'predict', ok: choice === 'triangle' });
  if (choice === 'square') { await anim(sq, [{ transform: 'translate(292px,52px)' }, { transform: 'translate(180px,118px)' }, { transform: 'translate(292px,52px)' }], { duration: 1400 }).done; SFX.soft(); await S(c.lines[1]);
    await tapOne([{ g: tri, k: 'triangle', label: labelText('pieceTri') }], { ok: 'triangle' }); }
  SFX.good(); fz.remove(); await anim(tri, [{ transform: 'translate(72px,52px)' }, { transform: 'translate(180px,116px)' }], { duration: 900, fill: 'forwards', easing: 'cubic-bezier(.3,1.4,.6,1)' }).done;
  await S(c.lines.slice(2));
};
/* فرجار يعدّ رؤوس المربع نموذجاً، ثم الطفل يعدّ، ثم «كم؟» (N001) */
SCENES.countModel = async c => { const svg = newStage(270, { oasisOpacity: .2 }); const s = { type: 'square', size: 140, color: css('--square'), x: 180, y: 130 }; shapeAt(svg, s, 180, 130); const P = worldPoly(s);
  await S(c.lines[0]); const m = await badgeCount(svg, P.map(([x, y]) => ({ x, y }))); await S(c.lines[1]); await sleep(300); m.remove(); };
/* فوضى تعدّ رأساً مرتين (تفعل ولا تقول): يظهر على عدّادها خمسة، ويجد الطفل الرأس المعدود مرتين */
SCENES.chaosDouble = async c => { const svg = newStage(280, { oasisOpacity: .2 }); const s = { type: 'square', size: 140, color: css('--square'), x: 180, y: 140 }; shapeAt(svg, s, 180, 140); const P = worldPoly(s);
  const fz = chaosAt(svg, 320, 46, .45); const m = el('g', { 'pointer-events': 'none' }, svg); const order = [0, 1, 2, 2, 3];
  for (const [i, k] of order.entries()) { const [x, y] = P[k]; badge(m, x + (i === 3 ? 22 : 0), y + (i === 3 ? 18 : 0), i + 1, css('--chaos')); SFX.tick(); await sleep(520); }
  const sign = el('g', { transform: 'translate(320 100)' }, svg); el('rect', { x: -26, y: -22, width: 52, height: 44, rx: 10, fill: '#fff', stroke: css('--chaos'), 'stroke-width': 3 }, sign); for (let i = 0; i < 4; i++) el('line', { x1: -15 + i * 9, y1: -13, x2: -15 + i * 9, y2: 13, stroke: css('--chaos'), 'stroke-width': 4, 'stroke-linecap': 'round' }, sign);   /* عدّادها علامات عدّ لا رقم (قبل «أرقام الواحة») */
  el('line', { x1: -20, y1: 10, x2: 20, y2: -10, stroke: css('--chaos'), 'stroke-width': 4, 'stroke-linecap': 'round' }, sign);
  await chaosGiggle(fz); await S(c.lines[0]);
  const targets = P.map(([x, y], k) => { const h = el('g', { transform: `translate(${x} ${y})` }, svg); el('circle', { r: 30, fill: 'transparent' }, h); return { g: h, k, label: labelText('vertex') }; });
  let ok = false; while (!ok) { const k = await tapOne(targets, { ok: 2 }); ok = k === 2; logAttempt({ scene: 'explore', tag: 'findDouble', ok }); if (!ok) { SFX.soft(); await S(c.lines[1]); } }
  SFX.good(); m.remove(); sign.remove(); await S(c.lines[2]);
  await countTouch(svg, P.map(([x, y]) => ({ x, y })), { halo: 20 }); await S(c.lines[3]); fz.remove(); };
/* «بيت الأشكال» (لعبة الدرس 2، تعرّف فقط): المس القطعة ثم مكانها */
SCENES.houseMatch = async c => {
  const svg = newStage(330, { oasisOpacity: .15 });
  /* القطع الموضوعة في طبقة تحت الأماكن الفارغة، الأكبر تحت الأصغر، ولا تأخذ لمساً: الجدار الموضوع لا يغطّي مكان النافذة ولا يبتلع لمسه (D255) */
  const placedL = el('g', {}, svg);
  const slots = c.slots.map(sl => ({ ...sl, filled: false })); const slotG = slots.map(sl =>   /* نسخة لكل تشغيل: «filled» لا يبقى في بيانات الدرس فيتعطّل اللعب في المرة الثانية */ { const g = el('g', { transform: `translate(${sl.x} ${sl.y})` }, svg); const geo = shapeGeom(sl.s);
    const d = sl.s.type === 'circle' ? el('circle', { r: geo.r }, g) : el('polygon', { points: polyStr(geo.poly) }, g); d.setAttribute('fill', '#ffffff'); d.setAttribute('fill-opacity', .5); d.setAttribute('stroke', css('--ink')); d.setAttribute('stroke-width', 3); d.setAttribute('stroke-dasharray', '8 6'); d.setAttribute('opacity', .6); return g; });
  const tray = el('g', {}, svg); el('rect', { x: -360, y: 256, width: 1080, height: 74, fill: css('--paper'), opacity: .92 }, tray);
  const shown = shuffle(c.pieces).map((p, i, a) => { const x = 360 - (i + .5) * (360 / a.length); const sc = p.sc || .5; const g = shapeAt(svg, p.s, x, 293); g.setAttribute('transform', `translate(${x} 293) scale(${sc})`);
    g.setAttribute('role', 'button'); g.setAttribute('tabindex', 0); g.setAttribute('aria-label', plain(BIN_NAMES[p.k] || '')); g.style.cursor = 'pointer'; hitPad(g, 76); g.dataset.k = p.k; g.dataset.id = p.id || p.k; return { ...p, g, x, sc }; });
  await S(c.lines[0]); let sel = null, placed = 0;
  /* وضع الفحص: قطعة واحدة في كل انتظار، فيُفحص اللمس (TAPS) بعد كل وضع، والجدار أولاً (الترتيب الذي كان يوقف اللعبة) */
  const auto = () => AUTO({ kind: 'house', ok: async () => { const p = shown.filter(q => !q.done).sort((a, b) => shapeArea(b.s) - shapeArea(a.s))[0]; if (!p) return; p.g.dispatchEvent(new MouseEvent('click', { bubbles: true })); const i = slots.findIndex(s => (s.id || s.k) === (p.id || p.k) && !s.filled); slotG[i].dispatchEvent(new MouseEvent('click', { bubbles: true })); } });
  auto();
  await gate(new Promise(res => {
    shown.forEach(p => { const act = () => { if (p.done) return; sel = p; shown.forEach(q => q.g.style.opacity = q === p || q.done ? 1 : .55); SFX.tick(); }; p.g.onclick = act; p.g.onkeydown = e => { if (actKey(e)) act(); }; });
    /* المكان الملموس: أصغر مكان فارغ يقع اللمس داخل رسمه (النافذة داخل الجدار)، وإلا صاحب منطقة اللمس (D255: منطقة النافذة الواسعة لا تأخذ لمس الجدار) */
    const target = (i, e) => { const p = e && isFinite(e.clientX) && e.clientX ? svgPoint(svg, e) : null; if (!p) return i;
      const hit = slots.map((sl, j) => j).filter(j => !slots[j].filled && insideShape(slots[j].s, p.x - slots[j].x, p.y - slots[j].y)).sort((a, b) => shapeArea(slots[a].s) - shapeArea(slots[b].s)); return hit.length ? hit[0] : i; };
    slotG.forEach((g, i0) => { g.style.cursor = 'pointer'; g.setAttribute('role', 'button'); g.setAttribute('tabindex', 0); g.setAttribute('aria-label', plain(labelText('houseSlot'))); g.dataset.slot = slots[i0].id || slots[i0].k; hitPad(g, 76); g.__route = (x, y) => slotG[target(i0, { clientX: x, clientY: y })];
      g.onkeydown = e => { if (actKey(e)) g.onclick(); };
      g.onclick = async e => { const i = target(i0, e); if (!sel) { await S('gen.house.pick'); return; }
      const sl = slots[i];
      if ((sl.id || sl.k) === (sel.id || sel.k) && !sl.filled) { sl.filled = true; sel.done = true; placed++; SFX.good(); logAttempt({ scene: 'game', tag: 'house-' + sel.k, ok: true });
        const pg = sel.g; pg.onclick = null; pg.onkeydown = null; ['role', 'tabindex', 'aria-label'].forEach(a => pg.removeAttribute(a)); pg.style.cursor = ''; pg.style.pointerEvents = 'none'; pg.querySelectorAll(':scope > rect.hit').forEach(h => h.remove());
        slotG[i].style.display = 'none'; const area = shapeArea(sel.s); pg.dataset.area = area;
        const mv = anim(pg, [{ transform: `translate(${sel.x}px,293px) scale(${sel.sc})` }, { transform: `translate(${sl.x}px,${sl.y}px) scale(1)` }], { duration: 500, fill: 'forwards', easing: 'cubic-bezier(.3,1.4,.6,1)' }); sel = null; shown.forEach(q => q.g.style.opacity = 1);
        mv.done.then(() => { pg.setAttribute('transform', `translate(${sl.x} ${sl.y}) scale(1)`); try { mv.cancel(); } catch (x) {} placedL.insertBefore(pg, [...placedL.children].find(q => +q.dataset.area < area) || null); });   /* بعد الحركة إلى طبقتها */
        if (placed === slots.length) res(); else auto(); }
      else { SFX.soft(); logAttempt({ scene: 'game', tag: 'house-' + sel.k, ok: false, err: 'slot' }); await S('gen.house.slot.' + sl.k); } }; });
  }));
  AUTO_CLEAR(); slotG.forEach(g => { g.onclick = null; g.onkeydown = null; }); shown.forEach(p => { p.g.onclick = null; }); confetti(16); await S(c.lines[1]);
};
/* الزرافة والبابان (فوضى تفعل: بنت باباً مربعاً قصيراً) */
SCENES.giraffeDoors = async c => {
  const svg = newStage(300, { oasisOpacity: .25 });
  const door = (x, w, h) => { const g = el('g', { transform: `translate(${x} 266)` }, svg);
    el('rect', { x: -w / 2 - 10, y: -h - 10, width: w + 20, height: h + 10, fill: '#cfd8dc', stroke: '#fff', 'stroke-width': 3, filter: 'url(#pp)' }, g); el('rect', { x: -w / 2, y: -h, width: w, height: h, fill: MAT.woodDk }, g); el('circle', { cx: w / 2 - 10, cy: -h / 2, r: 4, fill: '#f6cf7e' }, g); return g; };
  const sqd = door(90, 80, 80), rcd = door(262, 70, 180);
  const giraffe = el('g', { transform: 'translate(180 268)' }, svg);
  giraffe.innerHTML = `<g><rect x="-22" y="-56" width="44" height="34" rx="12" fill="#f6cf7e" stroke="#c98f55" stroke-width="2"/><rect x="6" y="-150" width="14" height="100" rx="7" fill="#f6cf7e" stroke="#c98f55" stroke-width="2"/>
    <ellipse cx="18" cy="-158" rx="17" ry="11" fill="#f6cf7e" stroke="#c98f55" stroke-width="2"/><circle cx="24" cy="-161" r="2.5" fill="#1b3440"/><path d="M10 -168 l-2 -10 M18 -169 l1 -10" stroke="#9c6837" stroke-width="3" stroke-linecap="round"/>
    <circle cx="-8" cy="-42" r="4" fill="#c98f55"/><circle cx="8" cy="-36" r="3.5" fill="#c98f55"/><circle cx="12" cy="-110" r="3" fill="#c98f55"/><circle cx="14" cy="-80" r="3" fill="#c98f55"/>
    <path d="M-16 -22v22M-6 -22v22M8 -22v22M18 -22v22" stroke="#c98f55" stroke-width="5" stroke-linecap="round"/></g>`;
  const fz = chaosAt(svg, 40, 120, .4); await chaosGiggle(fz);
  const choiceP = tapOne([{ g: sqd, k: 'square', label: labelText('doorSq') }, { g: rcd, k: 'rect', label: labelText('doorTall') }], { ok: 'rect' }); let early = false; choiceP.then(() => early = true);
  await S(c.lines[0]); if (!early) await S(c.lines[1]);
  const choice = await choiceP; logAttempt({ scene: 'hook', tag: 'predict', ok: choice === 'rect' }); SFX.tick();
  if (choice === 'square') { await anim(giraffe, [{ transform: 'translate(180px,268px)' }, { transform: 'translate(118px,268px)' }, { transform: 'translate(124px,268px) rotate(-6deg)' }, { transform: 'translate(180px,268px)' }], { duration: 1800 }).done; SFX.soft(); await S(c.lines[2]); }
  SFX.good(); await anim(giraffe, [{ transform: 'translate(180px,268px)' }, { transform: 'translate(262px,268px)' }, { transform: 'translate(262px,268px) scale(.01)' }], { duration: 1800, fill: 'forwards' }).done;
  fz.remove(); await S(c.lines.slice(3));
};
/* محاذاة عودين من بداية مشتركة ثم الحكم (C014) */
SCENES.compareAlign = async c => {
  const svg = newStage(300, { oasisOpacity: .15 });
  el('line', { x1: 300, y1: 40, x2: 300, y2: 250, stroke: css('--ink'), 'stroke-width': 3, 'stroke-dasharray': '6 6', opacity: .5 }, svg); label(svg, 300, 274, labelText('startLine'), 15);
  const stick = (y, len, x0, col) => { const g = el('g', { transform: `translate(${x0} ${y})` }, svg); el('rect', { x: -len, y: -22, width: len, height: 44, rx: 22, fill: col, stroke: '#fff', 'stroke-width': 3, filter: 'url(#pp)' }, g);
    el('circle', { cx: -14, cy: 0, r: 7, fill: '#fff', opacity: .6 }, g); return g; };
  const A = stick(90, 200, 300, MAT.wood), B = stick(180, 170, 260, '#7f9fb0');   // ألوان مادّية لا ألوان الهوية (M7)
  B.style.cursor = 'grab'; hitPad(B, 64, 64); B.setAttribute('tabindex', 0); B.setAttribute('role', 'button'); B.setAttribute('aria-label', plain(G(labelText('stickDrag'))));
  B.dataset.align = 'no'; B.dataset.alignX = 300;   /* كما في dragAlign: ما يُحاذى وخطّه، للمس الحقيقي وفحص بديل السحب (realtap_run، D246) */
  await S(c.lines[0]); if (firstTime('align')) await ghostHand(svg, [[160, 180], [200, 180]], 900);
  await gate(new Promise(res => { let d = null, x = 260, x0 = 260; const snap = () => { if (d === 'done') return; d = 'done'; B.setAttribute('transform', 'translate(300 180)'); B.dataset.align = 'yes'; SFX.good(); AUTO_CLEAR(); res(); };
    AUTO({ kind: 'align', ok: snap });
    B.addEventListener('pointerdown', e => { if (d === 'done') return; d = e.clientX; x0 = x; try { B.setPointerCapture(e.pointerId); } catch (x) {} });
    B.addEventListener('pointermove', e => { if (d == null || d === 'done') return; const ctm = svg.getScreenCTM(); x = Math.max(200, Math.min(320, x0 + (e.clientX - d) / ctm.a)); B.setAttribute('transform', `translate(${x} 180)`); });
    const up = () => { if (d === 'done') return; d = null; if (Math.abs(x - 300) < 18) snap(); }; B.addEventListener('pointerup', up); B.addEventListener('pointercancel', () => { d = null; });
    B.addEventListener('click', () => { if (d !== 'done' && Math.abs(x - 300) >= 18) { anim(B, [{ transform: `translate(${x}px,180px)` }, { transform: 'translate(300px,180px)' }], 500).done.then(snap); } });   // بديل النقر (D246)
    B.addEventListener('keydown', e => { if (actKey(e)) snap(); }); B.dataset.keys = 1;
    armIdle(async () => { await S(c.lines[1]); await anim(B, [{ transform: 'translate(260px,180px)' }, { transform: 'translate(300px,180px)' }], 700).done; snap(); }); }));
  disarmIdle(); await S(c.lines[2]);
  let tries = 0; while (true) { const k = await tapOne([{ g: A, k: 'A', label: labelText('stickA') }, { g: B, k: 'B', label: labelText('stickB') }], { ok: 'A', pad: 64 }); tries++;
    logAttempt({ scene: 'explore', tag: 'compare', ok: k === 'A', firstTry: tries === 1 }); if (k === 'A') { SFX.good(); break; } SFX.soft(); await S(c.lines[3]); }
  await S(c.lines[4]);
};
/* فوضى بعثرت الأشياء (إشعال الدرس 4) */
SCENES.scatterHook = async c => { const svg = newStage(300, { oasisOpacity: .2 });
  const things = c.things.map(([ref, x, y, k], i) => { const s = make(ref); const g = shapeAt(svg, { ...s, label: null }, x, y); g.setAttribute('transform', `translate(${x} ${y}) rotate(${(s.rot || 0) + (i % 2 ? 14 : -12)}) scale(${k})`); return g; });
  const fz = chaosAt(svg, 320, 250, .45); await chaosGiggle(fz); await S(c.lines); };
/* الصيد والتصنيف في أربع سلال (C005)، ثم «كم في كل سلّة؟» */
SCENES.huntSort = async c => {
  const svg = newStage(344, { oasis: false, ground: 0 }); const bins = c.bins; const binX = k => 360 - (bins.indexOf(k) + .5) * 90;   /* 344: أسماء السلال (y = 325) داخل المسرح (clipped texts) */
  bins.forEach(k => { const g = el('g', { transform: `translate(${binX(k) - 40} 242) scale(.73)` }, svg); g.innerHTML = basketSVG(k).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, ''); label(svg, binX(k), 325, plain(BIN_NAMES[k]), 14); });
  const objs = c.objects.map((ref, i) => { const s = make(ref); const p = { x: 360 - (i % 4 + .5) * 90, y: 60 + Math.floor(i / 4) * 92 }; const g = fitAt(svg, { ...s, label: null }, p.x, p.y, 72); return { s, g, p }; });   // مربع ثابت لكل شيء: الظرف والمستطيل الكبيران لا يغطّيان جيرانهما
  await S(c.lines[0]); const inBin = {}; bins.forEach(k => inBin[k] = []);
  for (const o of objs) { const g = o.g; g.classList.add('pulse'); hitPad(g, 76); g.style.cursor = 'pointer'; }
  let sel = null; const binHit = bins.map(k => { const h = el('rect', { x: binX(k) - 44, y: 240, width: 88, height: 80, fill: 'transparent', style: 'cursor:pointer', role: 'button', 'aria-label': plain(BIN_NAMES[k]) }, svg); return { k, h }; });
  AUTO({ kind: 'hunt', ok: async () => { for (const o of objs) { if (o.done) continue; o.g.dispatchEvent(new MouseEvent('click', { bubbles: true })); binHit.find(b => b.k === o.s.kind).h.dispatchEvent(new MouseEvent('click', { bubbles: true })); await new Promise(r => setTimeout(r, 50)); } } });
  await gate(new Promise(res => {
    objs.forEach(o => o.g.onclick = () => { if (o.done) return; sel = o; objs.forEach(q => q.g.style.opacity = q === o || q.done ? 1 : .5); SFX.tick(); });
    binHit.forEach(b => b.h.onclick = async () => { if (!sel) { await S('gen.house.pick'); return; } const o = sel; const ok = o.s.kind === b.k || ((c.accept || {})[o.s.kind] || []).includes(b.k);
      logAttempt({ scene: 'explore', tag: 'hunt-' + o.s.tag, bin: b.k, ok, err: ok ? null : (o.s.rot ? 'rotated' : 'byShape') });
      if (!ok) { SFX.soft(); await S(o.s.rot ? 'gen.hunt.rotated' : 'gen.hunt.look'); return; }
      o.done = true; sel = null; objs.forEach(q => q.g.style.opacity = 1); SFX.good(); const i = inBin[b.k].length; inBin[b.k].push(o);
      const to = { x: binX(b.k) + (i ? 14 : -14), y: 262 - i * 6 }; o.g.classList.remove('pulse');
      await anim(o.g, [{ transform: `translate(${o.p.x}px,${o.p.y}px)` }, { transform: `translate(${to.x}px,${to.y}px) scale(.45)` }], { duration: 500, fill: 'forwards' }).done; o.to = to;
      if (objs.every(q => q.done)) res(); }); }));
  AUTO_CLEAR(); await S(c.lines[1]); return { svg, inBin };
};
/* فوضى تبعثر الدوائر (تفعل): «هل صارت أكثر؟»، فيعدّ الطفل في الترتيبين (N002) */
SCENES.spread = async c => { const svg = newStage(260, { oasis: false, ground: 0 }); const proto = make(c.mk || 'circleS'); const n = c.n || 5;
  const row = layoutPts(n, 'row', 180, 120); const gs = row.map(p => thingAt(svg, { ...proto, size: 46 }, p.x, p.y));
  await S(c.lines[0]); await countTouch(svg, row.map((p, i) => ({ ...p, g: gs[i] })), { halo: 26, by: -28 }); await S(c.lines[1]);
  svg.querySelectorAll('g[pointer-events=none]').forEach(m => m.remove());
  const fz = chaosAt(svg, CHAOS_SPOT.x, CHAOS_SPOT.y, .45); await chaosGiggle(fz); const sc = layoutPts(n, 'scatter', 180, 120, 58, CHAOS_SPOT);
  await Promise.all(gs.map((g, i) => anim(g, [{ transform: `translate(${row[i].x}px,${row[i].y}px)` }, { transform: `translate(${sc[i].x}px,${sc[i].y}px)` }], { duration: 900, fill: 'forwards' }).done));
  await S(c.lines[2]); await countTouch(svg, sc.map((p, i) => ({ ...p, g: gs[i] })), { halo: 26, by: -28 }); fz.remove(); await S(c.lines[3]);
  for (const lay of ['circle', 'row']) { const to = layoutPts(n, lay, 180, 120); await Promise.all(gs.map((g, i) => anim(g, [{}, { transform: `translate(${to[i].x}px,${to[i].y}px)` }], { duration: 800, fill: 'forwards' }).done)); await sleep(300); }
  await S(c.lines[4]); };
/* صناديق البريد (فوضى بعثرت البطاقات) */
SCENES.mailHook = async c => { const svg = newStage(290, { oasisOpacity: .2 }); [[290, 2], [180, 5], [70, 0]].forEach(([x, n]) => mailboxAt(svg, x, 170, n));
  const cards = [[60, 50, 5, -20], [150, 40, 0, 14], [260, 60, 2, -8]].map(([x, y, n, r]) => { const g = digitCard(svg, x, y, n, { size: .8 }); g.setAttribute('transform', g.getAttribute('transform') + ` rotate(${r})`); return g; });
  const fz = chaosAt(svg, 330, 40, .4); await chaosGiggle(fz); await S(c.lines); };
/* اكتشاف صناديق البريد: يعدّ الرسائل ويعلّق البطاقة، والصندوق الفارغ صفر (N003) */
SCENES.mailExplore = async c => {
  for (const [i, box] of c.boxes.entries()) { const svg = newStage(300, { oasis: false, ground: 0 }); const mb = mailboxAt(svg, 180, 110, box.n);
    if (box.n) { await S(box.count); await mailSpread(svg, mb, 226); } else await S(box.count);
    const cards = cardRow(svg, box.opts, 240); await S(box.ask);
    let tries = 0; while (true) { const k = await tapOne(cards, { ok: box.n, pad: 84 }); tries++; logAttempt({ scene: 'explore', tag: 'hang-' + box.n, ok: k === box.n, firstTry: tries === 1 });
      if (k === box.n) { SFX.good(); const cd = cards.find(x => x.k === k); await anim(cd.g, [{ transform: cd.g.getAttribute('transform') }, { transform: `translate(180px,40px) scale(.9)` }], { duration: 600, fill: 'forwards' }).done; break; }
      SFX.soft(); await S(box.n === 0 ? 'gen.match.emptyHint' : 'gen.count.again'); }
    await S(box.after); if (i < c.boxes.length - 1) await nextBtn(); }
};
/* بطاقات الأرقام ٠–١٠: المس البطاقة لتسمع اسمها، ثم يقرؤها فرجار كلها */
SCENES.digitCards = async c => { const svg = newStage(270, { oasis: false, ground: 0 }); const cards = [];
  for (let n = 0; n <= 10; n++) { const r = n <= 5 ? 0 : 1, col = n <= 5 ? n : n - 6; const x = 330 - col * 58 - (r ? 29 : 0), y = 70 + r * 110; const g = digitCard(svg, x, y, n, { size: .9 }); cards.push({ g, k: n, label: T(numw(n)) }); }
  await S(c.lines[0]); for (const cd of cards) { anim(cd.g, [{ opacity: .4 }, { opacity: 1 }], 300); await S(numw(cd.k), { noGap: true }); }
  cards.forEach(cd => { cd.g.style.cursor = 'pointer'; hitPad(cd.g, 58); cd.g.setAttribute('role', 'button'); cd.g.setAttribute('aria-label', plain(cd.label)); cd.g.onclick = () => { SFX.tick(); say(...lineOf(numw(cd.k)), { free: true }); }; });
  await S(c.lines[1]); };
/* أول تتبّع لرقم مع عرض اليد الشبح (N003) */
SCENES.traceIntro = async c => { await S(c.lines[0]); for (const n of c.digits) await runItem({ t: 'trace', n }, 'explore'); await S(c.lines[1]); };
/* روبوت الأشكال (مدخل C163، الدرس 6): يركّب بحرّية من الأشكال الأربعة، ثم يعدّ ما استعمل */
SCENES.robot = async c => {
  const svg = newStage(330, { oasis: false, ground: 0 }); el('rect', { x: -360, y: 256, width: 1080, height: 74, fill: css('--paper'), opacity: .95 }, svg);
  const layer = el('g', {}, svg); const used = []; const K = ['circle', 'square', 'triangle', 'rect'];
  const spec = k => ({ type: k, size: 54, w: k === 'rect' ? 70 : k === 'triangle' ? 60 : undefined, h: k === 'rect' ? 40 : k === 'triangle' ? 54 : undefined, color: css(IDC[k]) });
  K.forEach((k, i) => { const x = 315 - i * 90; const g = shapeAt(svg, spec(k), x, 293); g.setAttribute('transform', `translate(${x} 293) scale(.8)`); g.setAttribute('role', 'button'); g.setAttribute('aria-label', plain(BIN_NAMES[k])); g.style.cursor = 'pointer'; hitPad(g, 88);
    g.onclick = () => { if (used.length >= 12) return; const p = { k, x: 180 + R(-60, 60), y: 130 + R(-60, 60) }; const pg = shapeAt(layer, spec(k), p.x, p.y); pg.setAttribute('role', 'button'); pg.setAttribute('aria-label', plain(BIN_NAMES[k])); hitPad(pg, 64, 64); /* هدف السحب 64 (D246) */ p.g = pg; used.push(p); SFX.pop(); makeDraggable(svg, pg, p); }; });
  await S(c.lines[0]); const d = doneBtn();
  AUTO({ kind: 'robot', ok: () => { K.forEach(k => svg.querySelector(`[aria-label="${plain(BIN_NAMES[k])}"]`).dispatchEvent(new MouseEvent('click', { bubbles: true }))); svg.querySelector(`[aria-label="${plain(BIN_NAMES.circle)}"]`).dispatchEvent(new MouseEvent('click', { bubbles: true })); d.b.click(); } });
  await gate(new Promise(r => d.b.onclick = () => { if (used.length < 3) { S(c.lines[1]); return; } AUTO_CLEAR(); hush(); d.bar.remove(); r(); }));
  /* انتهى البناء: الصينية لا تضيف قطعاً، والقطع لا تُسحب ولا تحجب نقاط العدّ (مناطقها تُزال، وتُضاف لما يُعدّ وحده) */
  svg.querySelectorAll('[role=button]').forEach(g => { g.onclick = null; g.removeAttribute('role'); g.removeAttribute('tabindex'); g.style.cursor = ''; g.querySelectorAll(':scope > rect.hit').forEach(h => h.remove()); });
  used.forEach(p => { p.locked = true; p.g.style.cursor = ''; });
  logAttempt({ scene: 'explore', tag: 'robot', ok: true, n: used.length });
  const save = designsGet(); save.unshift({ t: Date.now(), unit: 'm1.u1', pieces: used.map(p => ({ k: p.k, size: 54, w: spec(p.k).w, h: spec(p.k).h, rot: 0, x: Math.round(p.x), y: Math.round(p.y) })) }); store.set(designsKey(), save.slice(0, 30));
  for (const k of shuffle(K.filter(k => used.some(p => p.k === k))).slice(0, 2)) { const n = used.filter(p => p.k === k).length; const pts = used.filter(p => p.k === k).map(p => ({ x: p.x, y: p.y, g: p.g }));
    used.forEach(q => q.g.style.pointerEvents = q.k === k ? '' : 'none');   /* قطعة من نوع آخر فوقها لا تحجب لمسها */
    await S('gen.robot.count.' + k); await countTouch(svg, pts, { halo: 26 }); await S('gen.count.how');
    let tries = 0; while (true) { const np = numberPick(nearNums(n), n); const a = await np.p; tries++; logAttempt({ scene: 'explore', tag: 'robotCount', ok: a === n, firstTry: tries === 1 }); np.box.remove(); if (a === n) { SFX.good(); break; } SFX.soft(); await S('gen.count.again'); }
    svg.querySelectorAll('g[pointer-events=none]').forEach(m => m.remove()); }
  await S(c.lines[2]); };
function makeDraggable(svg, g, p) { let d = null; g.style.cursor = 'grab';
  g.addEventListener('pointerdown', e => { if (p.locked) return; d = { sx: e.clientX, sy: e.clientY, x0: p.x, y0: p.y }; try { g.setPointerCapture(e.pointerId); } catch (x) {} });
  g.addEventListener('pointermove', e => { if (!d) return; const ctm = svg.getScreenCTM(); p.x = Math.max(20, Math.min(340, d.x0 + (e.clientX - d.sx) / ctm.a)); p.y = Math.max(20, Math.min(240, d.y0 + (e.clientY - d.sy) / ctm.d)); g.setAttribute('transform', `translate(${p.x} ${p.y})`); });
  const up = () => { d = null; }; g.addEventListener('pointerup', up); g.addEventListener('pointercancel', up); }
/* بطاقات التذكّر في درس المراجعة: {cards:[[شكل أو مجسّم، معرّف الجملة]]} */
SCENES.reviewCards = async c => { const svg = newStage(300, { oasisOpacity: .15 });
  for (const [i, [k, id]] of c.cards.entries()) { const x = 315 - i * 90; const s = SOLIDC[k] ? { solid: k, size: 76 } : { type: k, size: 64, w: k === 'rect' ? 78 : k === 'triangle' ? 70 : undefined, h: k === 'rect' ? 44 : k === 'triangle' ? 64 : undefined, color: css(IDC[k]) };
    const g = thingAt(svg, s, x, 140); anim(g, [{ transform: `translate(${x}px,140px) scale(.3)` }, { transform: `translate(${x}px,140px) scale(1.15)` }, { transform: `translate(${x}px,140px) scale(1)` }], { duration: 500, fill: 'both' }); await S(id); }
  if (c.after) await S(c.after); };
/* حجر النبع في يد فوضى (إشعال درس التحدّي، قوس فوضى D236) */
SCENES.stoneHook = async c => { const svg = newStage(300, { oasisOpacity: .3 }); springAt(svg, 180, 250, 1.2, { stones: c.placed || 0, total: 6, level: (c.placed || 0) / 6 });
  const fz = chaosAt(svg, 250, 120, .6); const st = el('g', { transform: 'translate(190 140) scale(.35)' }, svg); stoneArt(st, unitOf(CUR), 0, 0);
  anim(st, [{ transform: 'translate(190px,140px) scale(.35) rotate(-6deg)' }, { transform: 'translate(190px,132px) scale(.35) rotate(6deg)' }], { duration: 1200, iterations: Infinity, direction: 'alternate' });
  await S(c.lines); };

/* ---------- الوحدة 2 ---------- */
/* كيس المفاجآت (فوضى تفعل: خبّأت الكرة والمكعب): يلمس الطفل الكيس، ويصف فرجار ما تحسّه الأصابع، ويختار الطفل */
function bagAt(svg, x, y) { const g = el('g', { transform: `translate(${x} ${y})` }, svg);
  el('path', { d: 'M-58 60 Q-70 -10 -30 -40 L30 -40 Q70 -10 58 60 Q0 74 -58 60 Z', fill: '#c98f55', stroke: '#fff', 'stroke-width': 4, filter: 'url(#pp)' }, g);
  el('path', { d: 'M-30 -40 Q0 -54 30 -40 L24 -52 Q0 -62 -24 -52 Z', fill: MAT.woodDk }, g); el('path', { d: 'M-26 -44 Q0 -34 26 -44', stroke: '#f6cf7e', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, g);
  el('text', { y: 30, 'text-anchor': 'middle', 'font-size': 44, 'font-weight': 800, fill: '#fff', opacity: .9, 'font-family': css('--f') }, g).textContent = '؟'; return g; }
SCENES.bagFeel = async c => {
  const svg = newStage(300, { oasisOpacity: .2 }); const inA = rand() < .5 ? 'sphere' : 'cube'; const content = { a: inA, b: inA === 'sphere' ? 'cube' : 'sphere' };
  const POS = { a: [270, 150], b: [90, 150] }; const bags = { a: bagAt(svg, ...POS.a), b: bagAt(svg, ...POS.b) };
  const fz = chaosAt(svg, 180, 60, .42); await chaosGiggle(fz); await S(c.lines[0]); fz.remove();
  const done = new Set();
  while (done.size < 2) {
    const left = ['a', 'b'].filter(k => !done.has(k)); const which = await tapOne(left.map(k => ({ g: bags[k], k, label: labelText('bag') })), { ok: left });
    const solid = content[which]; const [bx, by] = POS[which]; SFX.tick();
    anim(bags[which], [{ transform: `translate(${bx}px,${by}px) scale(1)` }, { transform: `translate(${bx}px,${by}px) scale(1.06,.94)` }], { duration: 300, iterations: 4, direction: 'alternate' });
    await S(c.feel[solid]); await S(c.ask);
    const k = await choosePick([['cube', BIN_NAMES.cube, solidIcon('cube'), 'gen.opt.cube'], ['sphere', BIN_NAMES.sphere, solidIcon('sphere'), 'gen.opt.sphere']], solid);
    logAttempt({ scene: 'hook', tag: 'feel-' + solid, ok: k === solid });
    const o = thingAt(svg, { solid, size: 92 }, bx, by - 30); anim(o, [{ transform: `translate(${bx}px,${by + 10}px) scale(.3)`, opacity: 0 }, { transform: `translate(${bx}px,${by - 96}px) scale(1)`, opacity: 1 }], { duration: 700, fill: 'forwards', easing: 'cubic-bezier(.3,1.4,.6,1)' });
    SFX.good(); await S(c.is[solid]); done.add(which); bags[which].style.opacity = .55; }
  await S(c.after);
};
/* مختبر الدفع: توقّع ثم تجربة. rounds: [{mk, behave:'roll'|'tip'|'stay', ok, ask, after}] */
SCENES.pushLab = async c => {
  for (const r of c.rounds) { const svg = newStage(300, { oasis: false }); floorLine(svg); const s = { ...make(r.mk), label: null }; const pv = placeOnFloor(svg, s, 110);
    say(...lineOf(r.ask), { free: true });
    const R = r.k === 'f' ? ['rollsF', 'staysF'] : ['rolls', 'stays'];
    const k = await choosePick([['roll', labelText(R[0]), PICKICON.roll, 'gen.opt.' + R[0]], ['stay', labelText(R[1]), PICKICON.stay, 'gen.opt.' + R[1]]], r.ok);
    logAttempt({ scene: 'explore', tag: 'predict-' + (s.solid || 'x'), ok: k === r.ok }); pv.remove(); await pushTest(svg, s, r.behave); await S(r.after); if (r.next !== false && r !== c.rounds[c.rounds.length - 1]) await nextBtn(); }
};
/* المكعب بأوضاع مختلفة (بالصورة) فيبقى مكعباً، ثم كلمة «مجسّم» */
SCENES.poses = async c => { const svg = newStage(280, { oasisOpacity: .15 }); const list = c.show.map(r => make(r));
  list.forEach((s, i, a) => { const x = 300 - i * (240 / Math.max(1, a.length - 1)); const g = fitThing(svg, { ...s, label: null }, x, 130, 104); anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: i * 300, fill: 'both' }); });
  await S(c.lines); };
/* لمس الوجوه (كلمة «وجه»، الدرس 2): {rounds:[{mk, faces:[...], need, ask, after, flip}]} */
SCENES.faceLab = async c => {
  for (const r of c.rounds) { const svg = newStage(300, { oasisOpacity: .15 }); const s = { ...make(r.mk), size: faceSize(svg, 150), ry: .34, label: null };
    say(...lineOf(r.ask), { free: true }); let g = await faceTouch(svg, s, 180, 140, { faces: r.faces, need: r.need }); hush();
    if (r.flip) { await S(r.flip); await anim(g, [{ transform: 'translate(180px,140px) rotate(0deg)' }, { transform: 'translate(180px,140px) rotate(180deg)' }], 800).done; g.remove();
      g = await faceTouch(svg, { ...s, color: mix(s.color || SOLIDC[s.solid], 'w', .08) }, 180, 140, { faces: r.faces, need: 1 }); }
    SFX.good(); await S(r.after); if (r !== c.rounds[c.rounds.length - 1]) await nextBtn(); }
};
/* فوضى تُنيم المخروط وتدفعه (فوضى تفعل): توقّع، ثم المنظر من الأعلى */
SCENES.coneRoll = async c => {
  const svg = newStage(300, { oasis: false }); floorLine(svg); const g = placeOnFloor(svg, { solid: 'cone', pose: 'lying', size: 120 }, 180);
  const fz = chaosAt(svg, 60, 160, .42); await chaosGiggle(fz); await anim(fz, [{ transform: fz.getAttribute('transform') }, { transform: 'translate(96px,160px) scale(.42)' }], 500).done;
  say(...lineOf(c.lines[0]), { free: true });
  const k = await choosePick([['straight', labelText('straight'), PICKICON.straight], ['around', labelText('around'), PICKICON.around]], 'around'); logAttempt({ scene: 'hook', tag: 'predict', ok: k === 'around' });
  await S(c.lines[1]); const top = newStage(300, null); topView(top); await rollTop(top, 'cone'); await S(c.lines.slice(2)); };
/* الأسطوانة النائمة تتدحرج مستقيمة (من الأعلى): يلمسها الطفل فتتدحرج */
SCENES.cylRoll = async c => { const top = newStage(300, null); topView(top); const g = cylTop(top, 180, 70, SOLIDC.cylinder);
  say(...lineOf(c.lines[0]), { free: true }); await tapOne([{ g, k: 'c', label: plain(BIN_NAMES.cylinder) }], { ok: 'c' }); hush(); g.remove(); await rollTop(top, 'cylinder'); await S(c.lines[1]); };
/* برجا فوضى (توقّع، الدرس 3): أربعة مكعبات كبيرة أعلى، وستة صغيرة */
SCENES.towersPredict = async c => { const svg = newStage(290, { oasisOpacity: .2, ground: 14 }); const A = towerAt(svg, 250, 262, c.a || 4, { size: 46, color: CUBE.plain }), B = towerAt(svg, 110, 262, c.b || 6, { size: 22, color: CUBE.plain });
  const fz = chaosAt(svg, 330, 60, .42); await chaosGiggle(fz); say(...lineOf(c.lines[0]), { free: true });
  const k = await tapOne([{ g: A.g, k: 'a', label: labelText('towerR') }, { g: B.g, k: 'b', label: labelText('towerL') }], { ok: 'b', pad: 76 }); hush();
  logAttempt({ scene: 'hook', tag: 'predict', ok: k === 'b' }); SFX.tick(); await S(c.lines.slice(1)); };
/* الورقة المرسومة تُدفع فتنزلق (فوضى تفعل، الدرس 4) */
SCENES.paperPush = async c => { const svg = newStage(300, { oasis: false }); floorLine(svg); const s = { sheet: true, draw: 'circle', rot: 0 }; const pv = placeOnFloor(svg, s, 140);
  const fz = chaosAt(svg, 300, 120, .42); await chaosGiggle(fz); say(...lineOf(c.lines[0]), { free: true });
  const k = await choosePick([['roll', labelText('rollsF'), PICKICON.roll, 'gen.opt.rollsF'], ['stay', labelText('notRollF'), PICKICON.stay, 'gen.opt.notRollF']], 'stay'); logAttempt({ scene: 'hook', tag: 'predict', ok: k === 'stay' });
  pv.remove(); fz.remove(); await pushTest(svg, s, 'stay', 140); await S(c.lines.slice(1)); };
/* بصمة الوجه (C008): توقّع شكل البصمة ثم الختم */
SCENES.stampLab = async c => {
  const PR = [['square', labelText('printSquare'), PICKICON.square, 'gen.opt.printSquare'], ['circle', labelText('printCircle'), PICKICON.circle, 'gen.opt.printCircle'], ['dot', labelText('printDot'), PICKICON.dot, 'gen.opt.printDot']];
  for (const r of c.rounds) { const svg = newStage(300, { oasis: false }); floorLine(svg, 236); const s = { ...make(r.mk), size: 88, label: null }; const pv = placeOnFloor(svg, s, 72, 170);
    say(...lineOf(r.ask), { free: true }); const k = await choosePick(PR, r.print); logAttempt({ scene: 'explore', tag: 'stamp-' + s.solid, ok: k === r.print }); pv.remove();
    await stampTest(svg, s, r.print); await S(r.after); if (r !== c.rounds[c.rounds.length - 1]) await nextBtn(); }
  if (c.rule) await S(c.rule);
};
/* بنّاء البرج: الكرة تتدحرج من تحت ما فوقها، ورأس المخروط لا يحمل شيئاً؛ ثم «كم مجسّماً في البرج؟» */
SCENES.towerBuild = async c => {
  const svg = newStage(300, { oasis: false }); floorLine(svg, 214);
  const stack = []; const base = el('g', {}, svg); const tray = el('g', {}, svg); el('rect', { x: -360, y: 246, width: 1080, height: 60, fill: css('--paper'), opacity: .92 }, tray);
  const kinds = ['cube', 'cylinder', 'cone', 'sphere']; let warned = {}, busy = false;
  /* البرج كله داخل المسرح: القطعة تصغر حين يطول البرج (فحص النصوص المقصوصة بعد الفحص المستقل B لبوابة S1-U4: شارة «٥» والقطعة الخامسة خارج المسرح) */
  const PS = Math.min(58, Math.floor(190 / (c.goal || 4) / .82));
  const topY = () => 214 - stack.reduce((h, p) => h + p.h, 0);
  say(...lineOf(c.lines[0]), { free: true });
  const buttons = kinds.map((k, i) => { const x = 315 - i * 90; const g = thingAt(tray, { solid: k, size: 52, color: SOLIDC[k] }, x, 276); g.style.cursor = 'pointer'; g.setAttribute('role', 'button'); g.setAttribute('tabindex', 0); g.setAttribute('aria-label', plain(BIN_NAMES[k])); hitPad(g, 80); g.dataset.solid = k; return g; });
  AUTO({ kind: 'towerBuild', ok: async () => { for (let i = 0; i < c.goal; i++) { buttons[0].dispatchEvent(new MouseEvent('click', { bubbles: true })); await new Promise(r => setTimeout(r, 120)); } } });
  await gate(new Promise(res => buttons.forEach(g => { const k = g.dataset.solid; const act = async () => { if (busy || stack.length >= c.goal) return; busy = true; hush(); SFX.tick();
      const top = stack[stack.length - 1]; const piece = thingAt(base, { solid: k, size: PS, color: SOLIDC[k] }, 180, 0); const bb = piece.getBBox(); const yEnd = topY() - (bb.y + bb.height) + 3;
      await anim(piece, [{ transform: 'translate(180px,-40px)' }, { transform: `translate(180px,${yEnd}px)` }], { duration: 450, fill: 'forwards', easing: 'cubic-bezier(.4,0,.8,1)' }).done;
      if (top && top.k === 'sphere') { SFX.soft(); logAttempt({ scene: 'build', tag: 'onSphere', ok: false, err: 'sphereBase' });
        anim(top.g, [{ transform: `translate(180px,${top.y}px)` }, { transform: `translate(420px,${top.y + 10}px) rotate(400deg)` }], { duration: 900, fill: 'forwards' });
        await anim(piece, [{ transform: `translate(180px,${yEnd}px)` }, { transform: `translate(120px,184px) rotate(-70deg)` }, { transform: `translate(110px,184px) rotate(-80deg)`, opacity: 0 }], { duration: 900, fill: 'forwards' }).done;
        piece.remove(); top.g.remove(); stack.pop(); if (!warned.s) { warned.s = 1; await S(c.sphereLine); } busy = false; return; }
      if (top && top.k === 'cone') { SFX.soft(); logAttempt({ scene: 'build', tag: 'onCone', ok: false, err: 'coneTop' });
        await anim(piece, [{ transform: `translate(180px,${yEnd}px)` }, { transform: `translate(250px,184px) rotate(80deg)`, opacity: 0 }], { duration: 800, fill: 'forwards' }).done;
        piece.remove(); if (!warned.c) { warned.c = 1; await S(c.coneLine); } busy = false; return; }
      piece.style.transform = `translate(180px,${yEnd}px)`; stack.push({ k, g: piece, h: bb.height - 10 * PS / 58, y: yEnd }); SFX.pop(); logAttempt({ scene: 'build', tag: 'place-' + k, ok: true });
      busy = false; if (stack.length >= c.goal) { AUTO_CLEAR(); res(); } };
    g.onclick = act; g.onkeydown = e => { if (actKey(e)) act(); }; })));
  hush(); SFX.good(); await S(c.lines[1]);
  await S(c.lines[2]); await countTouch(svg, stack.map(p => ({ x: 236, y: p.y - 6, g: p.g })), { halo: 16, by: 0, pad: 56 });   /* المجسّمات نفسها أهداف العدّ */
  await S('gen.count.how'); let tries = 0;
  while (true) { const np = numberPick(nearNums(stack.length), stack.length); const a = await np.p; tries++; logAttempt({ scene: 'build', tag: 'count', ok: a === stack.length, firstTry: tries === 1 }); np.box.remove(); if (a === stack.length) { SFX.good(); break; } SFX.soft(); await S('gen.count.again'); }
  await S(c.lines[3]);
};
/* مجسّمات في واحتنا: الجامع (D196): المئذنة أسطوانة فوقها مخروط، والقبة تشبه نصف الكرة */
function mosqueAt(svg) { const g = el('g', {}, svg); floorLine(svg, 236);
  const body = thingAt(g, { solid: 'cube', size: 150, color: '#e9dcc3' }, 140, 180);
  const dome = el('g', { transform: 'translate(132 104)' }, g); const df = grad(dome, 'radialGradient', [[0, '#ffe3ef'], [.55, SOLIDC.sphere], [1, mix(SOLIDC.sphere, 'b', .35)]], { cx: .38, cy: .3, r: .9 });
  el('path', { d: 'M-46 0 A46 46 0 0 1 46 0 Z', fill: df, stroke: '#fff', 'stroke-width': 3 }, dome); el('line', { x1: 0, y1: -46, x2: 0, y2: -62, stroke: '#c98f55', 'stroke-width': 3 }, dome); el('circle', { cx: 0, cy: -66, r: 4, fill: '#f2b33d' }, dome);
  const mn = el('g', { transform: 'translate(272 0)' }, g); const w = 48, h = 150, top = 92, ry = 8;   /* مئذنة أعرض: جسمها ورأسها هدفان يلمسهما الإصبع (≥ 56) */
  const cf = grad(mn, 'linearGradient', [[0, mix(SOLIDC.cylinder, 'b', .28)], [.35, mix(SOLIDC.cylinder, 'w', .3)], [.65, SOLIDC.cylinder], [1, mix(SOLIDC.cylinder, 'b', .4)]]);
  const cyl = el('g', {}, mn); el('path', { d: `M${-w / 2} ${top} L${-w / 2} ${top + h - 6} A${w / 2} ${ry} 0 0 0 ${w / 2} ${top + h - 6} L${w / 2} ${top} Z`, fill: cf, stroke: '#fff', 'stroke-width': 3 }, cyl);
  el('ellipse', { cx: 0, cy: top, rx: w / 2, ry, fill: mix(SOLIDC.cylinder, 'w', .32), stroke: '#fff', 'stroke-width': 3 }, cyl); el('rect', { x: -w / 2 - 6, y: top + 34, width: w + 12, height: 8, rx: 3, fill: '#e9dcc3', stroke: '#fff', 'stroke-width': 2 }, cyl);
  const cn = el('g', {}, mn); const kf = grad(cn, 'linearGradient', [[0, mix(SOLIDC.cone, 'b', .25)], [.4, mix(SOLIDC.cone, 'w', .3)], [.7, SOLIDC.cone], [1, mix(SOLIDC.cone, 'b', .38)]]);
  el('path', { d: `M0 ${top - 54} L${w / 2 + 4} ${top} A${w / 2 + 4} ${ry} 0 0 1 ${-w / 2 - 4} ${top} Z`, fill: kf, stroke: '#fff', 'stroke-width': 3 }, cn);
  return { cube: body, dome, cylinder: cyl, cone: cn }; }
SCENES.mosque = async c => {
  const svg = newStage(300, { oasisOpacity: .25 }); const parts = mosqueAt(svg); await S(c.lines[0]);
  for (const [k, ask, ok] of c.finds) { let first = true;
    while (true) { say(...lineOf(ask), { free: true });
      for (const pk of ['cylinder', 'cone']) if (!parts[pk].querySelector('rect.hit')) hitPad(parts[pk], 0);   /* المئذنة ورأسها نحيلان: منطقة لمس بقدر 56 بكسلاً فقط، فلا تغطّي المبنى */
      const hit = await tapOne(Object.entries(parts).filter(([pk]) => pk !== 'dome').map(([pk, g]) => ({ g, k: pk, label: labelText('part') })), { ok: k, pad: false }); hush();
      logAttempt({ scene: 'explore', tag: 'arch-' + k, ok: hit === k, firstTry: first, err: hit === k ? null : 'archPart' });
      if (hit === k) { SFX.good(); anim(parts[k], [{ opacity: 1 }, { opacity: .55 }, { opacity: 1 }], 600); await S(ok); break; }
      SFX.soft(); first = false; await S('gen.arch.no'); } }
  anim(parts.dome, [{ transform: 'translate(132px,104px) scale(1)' }, { transform: 'translate(132px,104px) scale(1.12)' }, { transform: 'translate(132px,104px) scale(1)' }], { duration: 900, iterations: 2 });
  await S(c.lines[1]); };
/* فوضى تأخذ مكعبين من البرج وتختبئ بهما (إشعال الدرس 5): توقّع «كم بقي؟» */
SCENES.takeHook = async c => { const svg = newStage(270, { oasisOpacity: .2, ground: 14 }); const T = towerAt(svg, 180, 250, c.a, { size: 26, color: CUBE.lemon }); const fz = chaosAt(svg, 310, 90, .45);
  await sleep(500); await chaosGiggle(fz); const top = T.cubes.slice(c.a - c.b);
  await Promise.all(top.map((cb, i) => anim(cb, [{ transform: cb.getAttribute('transform') }, { transform: `translate(${300 - i * 12}px,${110 + i * 6}px) scale(.6)` }], { duration: 800, fill: 'forwards', delay: i * 100 }).done));
  await anim(fz, [{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' }).done; fz.remove(); top.forEach(cb => cb.remove());   /* وتختبئ فوضى معهما (الفحص المستقل D2: كانت تعود بعد الخفوت) */
  await S(c.lines[0]); const np = numberPick(nearNums(c.a - c.b), c.a - c.b); const k = await np.p; np.box.remove(); logAttempt({ scene: 'hook', tag: 'predict', ok: k === c.a - c.b }); await S(c.lines[1]); };
/* عدّ الأوجه (مدخل C318، D245): يدير المكعب ويلصق قصاصة على كل وجه يلمسه، فلا يُعدّ وجه مرتين */
SCENES.facesCount = async c => {
  for (const r of c.rounds) {
    const svg = newStage(300, { oasisOpacity: .12 }); const stuck = new Set(); let view = 0; const K = Math.max(1, Math.min(1.3, .95 / pxPerUnit(svg)));   /* الشاشة الضيقة: يكبر المجسّم فلا يقلّ وجه عن 56 بكسلاً */
    const holder = el('g', { transform: `translate(180 140) scale(${K})` }, svg);
    const isBox = r.solid === 'box'; const dims = isBox ? { w: 150, h: 92, d: 104 } : { w: 112, h: 112, d: 112 }; const col = isBox ? BOXC : SOLIDC.cube;
    const VIEWS = [{ yaw: 40, pitch: 34 }, { yaw: 220, pitch: -34 }];   /* ميل أكبر: الوجه العلوي ≥ 56 بكسل ليلمسه الإصبع */
    const marks = el('g', { 'pointer-events': 'none' }, svg); const marksAt = {};
    const draw = () => { holder.innerHTML = ''; const { B } = drawBox(holder, { ...dims, ...VIEWS[view], color: col, deco: isBox ? teaDeco : null });
      marks.innerHTML = ''; holder.querySelectorAll('[data-face]').forEach(f => { const k = f.dataset.face; const pts = f.getAttribute('points').split(' ').map(p => p.split(',').map(Number)); const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length * K + 180, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length * K + 140;
        marksAt[k] = [cx, cy]; f.style.cursor = 'pointer'; f.setAttribute('role', 'button'); f.setAttribute('aria-label', labelText('face'));
        if (stuck.has(k)) { const n = [...stuck].indexOf(k) + 1; const s = el('g', { transform: `translate(${cx} ${cy})` }, marks); el('rect', { x: -15, y: -12, width: 30, height: 24, rx: 4, fill: '#f6cf7e', stroke: '#c98f55', 'stroke-width': 2, transform: 'rotate(-8)' }, s); }
        f.onclick = () => { if (stuck.has(k)) { SFX.soft(); S('gen.faces.already', { ifIdle: true, free: true }); return; } stuck.add(k); SFX.pop(); buzz(25); logAttempt({ scene: 'explore', tag: 'face-' + r.solid, ok: true }); draw(); if (stuck.size === 6) done(); }; }); };
    let done; const all = gate(new Promise(res => done = res)); draw();
    const bar = document.createElement('div'); bar.className = 'choices icons'; $('#stage').appendChild(bar); const turn = document.createElement('button'); turn.className = 'pick'; turn.innerHTML = ICON.rotate.replace('<svg', '<svg width="34" height="34"') + `<span>${esc(G(labelText('turnIt')))}</span>`; bar.appendChild(turn);
    turn.onclick = async () => { SFX.tick(); await anim(holder, [{ transform: `translate(180px,140px) scale(${K},${K})` }, { transform: `translate(180px,140px) scale(${.05 * K},${K})` }], 260).done; view = 1 - view; draw(); anim(holder, [{ transform: `translate(180px,140px) scale(${.05 * K},${K})` }, { transform: `translate(180px,140px) scale(${K},${K})` }], 260); };
    AUTO({ kind: 'faces', ok: async () => { for (const v of [0, 1]) { if (view !== v) { view = v; draw(); } for (const f of [...holder.querySelectorAll('[data-face]')]) if (!stuck.has(f.dataset.face)) { f.dispatchEvent(new MouseEvent('click', { bubbles: true })); await new Promise(q => setTimeout(q, 30)); } } } });
    say(...lineOf(r.ask), { free: true }); armIdle(async () => { await S('gen.faces.turn'); anim(turn, [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 500, iterations: 2 }); });
    await all; AUTO_CLEAR(); disarmIdle(); hush(); bar.remove(); SFX.good();
    await S(r.count); const pts = [...stuck].map(k => marksAt[k] || [180, 140]); view = 0; draw();
    for (let i = 0; i < 6; i++) { badge(marks, 330 - i * 54, 270, i + 1, css('--compass')); SFX.tick(); await S(numw(i + 1), { noGap: true, num: true }); }
    await S(r.after); if (r !== c.rounds[c.rounds.length - 1]) await nextBtn(); }
};
/* «صائد المجسّمات» و«سباق الأشكال»: غرفة مزدحمة، ويجد الطفل ما يطلبه فرجار. النجمة للإتقان لا للسرعة */
/* أشياء الغرفة: ستة في صفّين مبعثرين، فلا يغطّي شيءٌ شيئاً ولا تبلغ منطقة لمسه رسمَ جاره (D255)؛ وإن غاب النوع المسؤول عنه حلّ شيءٌ منه في موضع عشوائي */
function roomThings(svg, c, k) { const n = c.n || 6; if (n > 6) throw new Error('roomHunt: الغرفة تسع ستة أشياء'); const things = shuffle(c.things).slice(0, n);
  if (k != null && !things.some(ref => make(ref).kind === k)) things[R(0, n - 1)] = c.things.find(ref => make(ref).kind === k);
  const pts = layoutPts(n, 'rows', 180, 150, 130);
  return things.map((ref, i) => { const s = make(ref); const g = fitThing(svg, { ...s, label: null }, pts[i].x, pts[i].y, 70); return { g, k: s.kind, label: plain(s.label || labelText('shapeOne')) }; }); }   /* اسم الشيء أو «شكل»، لا اسم النوع الذي يُسأل عنه (D254 (3)) */
SCENES.roomHunt = async c => {
  for (const [ri, r] of c.rounds.entries()) { const svg = newStage(300, { oasisOpacity: .1 }); const targets = roomThings(svg, c, r.k);
    let tries = 0; while (true) { say(...lineOf(r.ask), { free: true }); const k = await tapOne(targets, { ok: r.k }); hush(); tries++; logAttempt({ scene: 'game', tag: 'hunt-' + r.k, ok: k === r.k, firstTry: tries === 1 });
      if (k === r.k) { SFX.good(); break; } SFX.soft(); await S(bank('look') || 'gen.hint2.01'); }
    if (ri < c.rounds.length - 1) await sleep(500); }
  if (c.after) await S(c.after);
};
/* صندوق اللمس (لعبة الدرس 1، الوحدة 2): وصف مسموع ثم اختيار المجسّم */
SCENES.feelBox = async c => {
  for (const r of c.rounds) { const svg = newStage(260, { oasisOpacity: .15 }); bagAt(svg, 180, 120);
    let tries = 0; while (true) { say(...lineOf(r.line), { free: true });
      const k = await choosePick(c.opts.map(o => [o, BIN_NAMES[o], solidIcon(o), 'gen.opt.' + o]), r.ok); hush(); tries++; logAttempt({ scene: 'game', tag: 'feel-' + r.ok, ok: k === r.ok, firstTry: tries === 1 });
      if (k === r.ok) { SFX.good(); const o = thingAt(svg, { solid: r.ok, size: 84 }, 180, 70); anim(o, [{ opacity: 0, transform: 'translate(180px,110px) scale(.3)' }, { opacity: 1, transform: 'translate(180px,46px) scale(1)' }], { duration: 600, fill: 'forwards' }); await sleep(700); break; }
      SFX.soft(); await S('gen.feel.again'); } }
  if (c.after) await S(c.after);
};
/* الرفّان (N005): ستة مكعبات، وفي كل لمسة ينتقل مكعب واحد من الرفّ الأيسر إلى الأيمن، حتى يفرغ الأيسر */
SCENES.shelvesWalk = async c => {
  const n = c.n || 6; const svg = newStage(270, { oasis: false, ground: 0 }); const rx = 268, lx = 92;
  for (const x of [rx, lx]) el('rect', { x: x - 80, y: 196, width: 160, height: 12, rx: 4, fill: MAT.wood }, svg);
  const cnt = el('g', {}, svg); let right = 0; const layer = el('g', {}, svg);
  const draw = () => { layer.innerHTML = ''; cnt.innerHTML = '';
    for (let i = 0; i < right; i++) cubeAt(layer, rx + 60 - (i % 5) * 30, 180 - Math.floor(i / 5) * 30, 26, CUBE.lemon);
    for (let i = 0; i < n - right; i++) cubeAt(layer, lx + 60 - (i % 5) * 30, 180 - Math.floor(i / 5) * 30, 26, CUBE.white);
    badge(cnt, rx, 236, right, css('--compass')); badge(cnt, lx, 236, n - right, css('--compass')); };
  draw(); await S(c.lines[0]);
  const hit = el('rect', { x: lx - 86, y: 110, width: 172, height: 110, fill: 'transparent', style: 'cursor:pointer', role: 'button', 'aria-label': labelText('leftShelf') }, svg);
  while (right < n) { await tapOne([{ g: hit, k: 'l' }], { ok: 'l', pad: false }); right++; SFX.pop(); draw(); logAttempt({ scene: 'explore', tag: 'shelf', ok: true });
    await S(numw(right), { noGap: true }); await S(numw(n - right)); }
  await S(c.lines[1]);
};
