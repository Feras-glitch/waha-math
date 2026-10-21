/* =====================================================================
   الأدوات العامة
   ===================================================================== */
/* ① تتبّع الحافة: يجد الطفل الرؤوس بإصبعه، ثم (اختياراً) يلمس الأضلاع ليعدّها */
async function traceTool(svg, shapes, opt = {}) {
  const trail = el('g', {}, svg), marks = el('g', {}, svg);
  const state = shapes.map(s => ({ s, found: new Set(), buckets: new Set(), done: false }));
  const NUM = [['gen.num.01', 'وَاحِد'], ['gen.num.02', 'اثْنَان'], ['gen.num.03', 'ثَلَاثَة'], ['gen.num.04', 'أَرْبَعَة']];
  shapes.forEach(s => { s.g = shapeAt(svg, s, s.x, s.y); if (s.caption) s.cap = label(svg, s.x, s.capY || 280, ''); });
  svg.appendChild(trail); svg.appendChild(marks);
  const worldPoly = s => shapeGeom(s).poly.map(([px, py]) => { const a = (s.rot || 0) * Math.PI / 180; return [s.x + px * Math.cos(a) - py * Math.sin(a), s.y + px * Math.sin(a) + py * Math.cos(a)]; });
  function distSeg(p, a, b) { const vx = b[0] - a[0], vy = b[1] - a[1]; const t = Math.max(0, Math.min(1, ((p.x - a[0]) * vx + (p.y - a[1]) * vy) / (vx * vx + vy * vy))); return Math.hypot(p.x - a[0] - t * vx, p.y - a[1] - t * vy); }
  let resolveAll; const allDone = new Promise(r => resolveAll = r);
  function check() { if (state.every(st => st.done)) resolveAll(); }
  function touch(p) {
    state.forEach(st => { const s = st.s; if (st.done) return;
      if (s.type === 'circle') { const r = shapeGeom(s).r; if (Math.abs(Math.hypot(p.x - s.x, p.y - s.y) - r) < 22) { el('circle', { cx: p.x, cy: p.y, r: 4.5, fill: '#fff', stroke: css('--ink'), 'stroke-opacity': .25 }, trail);
          st.buckets.add(Math.floor(((Math.atan2(p.y - s.y, p.x - s.x) * 180 / Math.PI) + 360) % 360 / 10)); if (s.cap) s.cap.textContent = 'لَا رُؤُوسَ';
          if (st.buckets.size >= 27) { st.done = true; SFX.good(); check(); } } return; }
      const P = worldPoly(s); let onEdge = false; for (let k = 0; k < P.length; k++) if (distSeg(p, P[k], P[(k + 1) % P.length]) < 18) onEdge = true;
      if (!onEdge) return; el('circle', { cx: p.x, cy: p.y, r: 4.5, fill: '#fff', stroke: css('--ink'), 'stroke-opacity': .25 }, trail);
      P.forEach((c, k) => { if (!st.found.has(k) && Math.hypot(p.x - c[0], p.y - c[1]) < 20) { st.found.add(k); SFX.tick(); buzz(30); badge(marks, c[0], c[1], st.found.size);
        if (s.cap) s.cap.textContent = 'رُؤُوس: ' + DG(st.found.size); if (!MUTED && !FAST) say('compass', ...NUM[st.found.size - 1], { num: true, noGap: true, free: true });
        if (st.found.size === P.length) { st.done = true; check(); } } }); });
  }
  let down = false;
  svg.addEventListener('pointerdown', e => { down = true; svg.setPointerCapture(e.pointerId); touch(svgPoint(svg, e)); });
  svg.addEventListener('pointermove', e => { if (down) touch(svgPoint(svg, e)); });
  svg.addEventListener('pointerup', () => { down = false; });
  async function demo() { for (const st of state) { const s = st.s; if (s.type === 'circle') { const r = shapeGeom(s).r; for (let a = 0; a <= 360; a += 8) { const q = a * Math.PI / 180; touch({ x: s.x + r * Math.cos(q), y: s.y + r * Math.sin(q) }); await sleep(18); } }
      else { const P = worldPoly(s); const path = [...P, P[0]]; for (let k = 0; k < P.length; k++) for (let t = 0; t <= 1; t += .1) { touch({ x: path[k][0] + (path[k + 1][0] - path[k][0]) * t, y: path[k][1] + (path[k + 1][1] - path[k][1]) * t }); await sleep(25); } } } }
  armIdle(async () => { await say('compass', 'gen.demo.01', '{شَاهِدْ|شَاهِدِي} إِصْبَعِي أَوَّلًا.'); demo(); });
  await allDone; disarmIdle();
  // عدّ الأضلاع باللمس (من الدرس الثاني، حين يدخل مصطلح «ضلع»)
  if (opt.sides) {
    const s = shapes.find(x => x.type !== 'circle'); const P = worldPoly(s); const counted = new Set();
    await say('compass', ...opt.sidesIntro);
    const sideG = el('g', {}, svg);
    const longest = Math.max(...P.map((c, k) => Math.hypot(P[(k + 1) % P.length][0] - c[0], P[(k + 1) % P.length][1] - c[1])));
    await new Promise(res => P.forEach((c, k) => { const d = P[(k + 1) % P.length]; const len = Math.hypot(d[0] - c[0], d[1] - c[1]);
      const col = opt.pairColors ? (len > longest * .8 ? css('--rect') : css('--square')) : css('--rect');
      const hit = el('line', { x1: c[0], y1: c[1], x2: d[0], y2: d[1], stroke: 'transparent', 'stroke-width': 34, 'stroke-linecap': 'round', style: 'cursor:pointer', tabindex: 0, role: 'button', 'aria-label': 'ضلع' }, sideG);
      const act = () => { if (counted.has(k)) return; counted.add(k); SFX.pop(); el('line', { x1: c[0], y1: c[1], x2: d[0], y2: d[1], stroke: col, 'stroke-width': 9, 'stroke-linecap': 'round' }, marks);
        badge(marks, (c[0] + d[0]) / 2, (c[1] + d[1]) / 2, counted.size, css('--triangle')); if (s.cap) s.cap.textContent = 'أَضْلَاع: ' + DG(counted.size);
        logAttempt({ scene: 'explore', tag: 'side', ok: true }); if (counted.size === P.length) res(); };
      hit.addEventListener('click', act); hit.addEventListener('keydown', e => { if (e.key === 'Enter') act(); }); }));
  }
}

/* ② السلال: يعرض شيئاً واحداً، ويعيد اختيار الطفل (لمس السلة أو سحب الشيء إليها) */
function askSort(item, bins) {
  const svg = newStage(330, { city: false, ground: 0 });
  window.__item = item; window.__n = (window.__n || 0) + 1;
  let g;
  if (item.riddle) {                                   // متجر المجسّمات: مظلّة ورفّ، والطلب يُسمَع
    for (let i = 0; i < 9; i++) el('path', { d: `M${i * 40} 0 h40 v34 q-20 14 -40 0z`, fill: i % 2 ? '#fffdf6' : '#ee7a5f' }, svg);
    const shopper = el('g', { transform: 'translate(180 120)' }, svg); shopper.innerHTML = kidSVG(Math.random() < .5 ? 'm' : 'f').replace('<svg', '<svg x="-46" y="-46" width="92" height="92"');
    const bub = el('g', { transform: 'translate(250 70)' }, svg); el('path', { d: 'M-30 -22 h60 a10 10 0 0 1 10 10 v24 a10 10 0 0 1 -10 10 h-34 l-12 12 l2 -12 h-16 a10 10 0 0 1 -10 -10 v-24 a10 10 0 0 1 10 -10z', fill: '#fff', stroke: css('--line'), 'stroke-width': 2 }, bub);
    el('text', { y: 10, 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: css('--compass'), 'font-family': css('--f') }, bub).textContent = '؟';
    g = el('g', {}, svg); bins = item.opts;
  } else { g = thingAt(svg, item, 180, 104); if (item.label) label(svg, 180, 194, item.label, 18, css('--muted')); }
  const box = document.createElement('div'); box.className = 'bins' + (item.riddle ? ' shelf' : ''); box.style.setProperty('--n', bins.length);
  bins.forEach(k => { const b = document.createElement('button'); b.className = 'bin'; b.dataset.k = k; b.innerHTML = (item.riddle ? solidIcon(k).replace('width="46" height="46"', 'width="92" height="92"') : basketSVG(k)) + `<span>${BIN_NAMES[k]}</span>`; b.setAttribute('aria-label', 'سلّة ' + plain(BIN_NAMES[k])); box.appendChild(b); });
  $('#stage').appendChild(box);
  return new Promise(res => {
    let settled = false; const pick = k => { if (settled) return; settled = true; res({ bin: k, binsEl: box, g, svg }); };
    box.querySelectorAll('.bin').forEach(b => b.onclick = () => pick(b.dataset.k));
    let drag = null; g.style.cursor = 'grab';
    g.addEventListener('pointerdown', e => { drag = { sx: e.clientX, sy: e.clientY }; g.setPointerCapture(e.pointerId); });
    g.addEventListener('pointermove', e => { if (!drag) return; const ctm = svg.getScreenCTM();
      g.setAttribute('transform', `translate(${180 + (e.clientX - drag.sx) / ctm.a} ${104 + (e.clientY - drag.sy) / ctm.d}) rotate(${item.rot || 0})`);
      box.querySelectorAll('.bin').forEach(b => { const r = b.getBoundingClientRect(); b.classList.toggle('hot', e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom); }); });
    g.addEventListener('pointerup', () => { if (!drag) return; drag = null; const hot = box.querySelector('.bin.hot'); box.querySelectorAll('.bin').forEach(b => b.classList.remove('hot'));
      if (hot) pick(hot.dataset.k); else g.setAttribute('transform', `translate(180 104) rotate(${item.rot || 0})`); });
  });
}
const PRAISE = [['gen.correct.01', '{أَحْسَنْتَ|أَحْسَنْتِ}! {عَدَدْتَ|عَدَدْتِ} {كَمُهَنْدِسٍ حَقِيقِيٍّ|كَمُهَنْدِسَةٍ حَقِيقِيَّةٍ}.'], ['gen.correct.02', 'تَمَامًا!'],
  ['gen.correct.03', 'رَائِعٌ! {نَظَرْتَ|نَظَرْتِ} إِلَى الحَوَافِّ جَيِّدًا.'], ['gen.correct.04', 'صَحِيحٌ!'], ['gen.correct.05', 'بِالضَّبْطِ!'], ['gen.correct.06', 'عَيْنُ {مُهَنْدِسٍ|مُهَنْدِسَةٍ}!']];
let praiseIx = 0;
/* جمل التحدي العامة (كل الوحدات) */
const TEST_INTRO = ['compass', 'gen.test.intro', 'الآنَ ثَمَانِيَةُ أَسْئِلَةٍ. {اِسْمَعِ|اِسْمَعِي} السُّؤَالَ، ثُمَّ {اِلْمَسِ|اِلْمَسِي} الجَوَابَ.'];
const TEST_SCORE = { 7: ['gen.test.score.7', 'رَائِعٌ! {أَجَبْتَ|أَجَبْتِ} عَنْ أَسْئِلَةِ الوَحْدَةِ'], 8: ['gen.test.score.8', 'مُمْتَازٌ! {أَجَبْتَ|أَجَبْتِ} عَنْ كُلِّ أَسْئِلَةِ الوَحْدَةِ!'] };
/* D233: لا أرقام أمام الطفل؛ الدرجة في لوحة الكبار فقط */
const TEST_AGAIN_LOW = ['gen.test.again.low', 'قَرِيبٌ! نُرَاجِعُ دَرْسًا وَاحِدًا مَعًا، ثُمَّ نَعُودُ إِلَى التَّحَدِّي.'];
const TEST_AGAIN_NEAR = ['gen.test.again.near', 'قَرِيبٌ جِدًّا! نُرَاجِعُ دَرْسًا وَاحِدًا مَعًا، ثُمَّ نَعُودُ.'];
const SOLVE = { circle: ['gen.solve.circle', 'هَيَّا نَحُلُّهَا مَعًا: هَذِهِ دَائِرَةٌ.'], square: ['gen.solve.square', 'هَيَّا نَحُلُّهَا مَعًا: هَذَا مُرَبَّعٌ.'],
  triangle: ['gen.solve.triangle', 'هَيَّا نَحُلُّهَا مَعًا: هَذَا مُثَلَّثٌ.'], rect: ['gen.solve.rect', 'هَيَّا نَحُلُّهَا مَعًا: هَذَا مُسْتَطِيلٌ.'], other: ['gen.solve.other', 'هَيَّا نَحُلُّهَا مَعًا: مَكَانُهُ سَلَّةُ «غَيْرُ ذَلِكَ».'],
  cube: ['gen.solve.cube', 'هَيَّا نَحُلُّهَا مَعًا: هَذَا مُكَعَّبٌ.'], sphere: ['gen.solve.sphere', 'هَيَّا نَحُلُّهَا مَعًا: هَذِهِ كُرَةٌ.'], cylinder: ['gen.solve.cylinder', 'هَيَّا نَحُلُّهَا مَعًا: هَذِهِ أُسْطُوَانَةٌ.'],
  cone: ['gen.solve.cone', 'هَيَّا نَحُلُّهَا مَعًا: هَذَا مَخْرُوطٌ.'], flat: ['gen.solve.flat', 'هَيَّا نَحُلُّهَا مَعًا: هَذَا مُسَطَّحٌ.'], solid: ['gen.solve.solid', 'هَيَّا نَحُلُّهَا مَعًا: هَذَا مُجَسَّمٌ.'] };
const MS_AGAIN = ['gen.ms.again', 'لِنَعُدْ إِلَى الفِكْرَةِ مَعًا، ثُمَّ نُحَاوِلُ مَرَّةً أُخْرَى.'];
const MS_LATER = ['gen.ms.later', 'أَحْسَنْتَ المُحَاوَلَةَ! سَنَعُودُ إِلَى هَذِهِ الفِكْرَةِ فِي مُرَاجَعَةِ اليَوْمِ. هَيَّا نُكْمِلُ.'];
/* سؤال سلال كامل: محاولة أولى ← تفسير خاص بالخطأ ← محاولة ثانية ← حل مشترك ← مسألة توأم */
async function sortItem(make, cfg, scene, allowHelp = true) {
  const item = make(); let tries = 0; window.__sortScene = scene;   // TESTHOOK
  if (cfg.kindOf) item.kind = cfg.kindOf(item);
  if (!item.riddle && !cfg.bins.includes(item.kind)) item.kind = 'other';   // شكل لا سلّة له في هذا الدرس يذهب إلى «غير ذلك»
  while (true) {
    if (allowHelp) armIdle(async () => { await say('compass', 'gen.hint.look', '{لَاحِظِ|لَاحِظِي} الأَضْلَاعَ وَالرُّؤُوسَ.'); });
    const askP = askSort(item, cfg.bins); if (item.riddle) say('compass', ...item.riddle); const t0 = Date.now();
    const { bin, binsEl, g, svg } = await askP; disarmIdle(); if (item.riddle) hush();
    const err = item.kind === bin ? null : (cfg.errorOf(item, bin) || 'generic'); tries++;
    logAttempt({ scene, tag: item.tag, bin, ok: !err, firstTry: tries === 1, err, ms: Date.now() - t0 });
    const binEl = binsEl.querySelector(`[data-k="${bin}"]`);
    if (!err) { binEl.classList.add('ok'); SFX.good(); g.animate([{ opacity: 1 }, { opacity: 0, transform: 'translate(180px,250px) scale(.25)' }], { duration: 450, fill: 'forwards' });
      const PR = cfg.praise || PRAISE; const p = PR[praiseIx++ % PR.length]; await say('compass', p[0], p[1]); await say('compass', ...cfg.reason(item)); return { firstTry: tries === 1, item }; }
    binEl.classList.add('no'); SFX.soft();
    if (!allowHelp) { await say('compass', 'gen.ms.noted', 'حَسَنًا.'); return { firstTry: false, item }; }
    if (tries === 1) { const [eid, et] = cfg.ERR[err] || cfg.ERR.generic; if (cfg.showErr) cfg.showErr(err, item, g, svg); await say('compass', eid, et); await sleep(500); continue; }
    binsEl.querySelector(`[data-k="${item.kind}"]`).classList.add('ok');
    await say('compass', ...SOLVE[item.kind]); await say('compass', ...cfg.reason(item));
    await say('compass', 'gen.twin.01', 'وَالآنَ شَكْلٌ يُشْبِهُهُ، {جَرِّبْهُ بِنَفْسِكَ|جَرِّبِيهِ بِنَفْسِكِ}.');
    await sortItem(cfg.twin(item), cfg, scene + '-twin', true); return { firstTry: false };
  }
}
/* دوران مؤقت لشكل مدوَّر أو مقلوب: نعيده إلى وضعه المألوف ثم نرجعه */
async function straighten(g, item) { const r = item.rot || 0; if (!r) return;
  g.animate([{ transform: `translate(180px,104px) rotate(${r}deg)` }, { transform: 'translate(180px,104px) rotate(0deg)' }, { transform: 'translate(180px,104px) rotate(0deg)' }, { transform: `translate(180px,104px) rotate(${r}deg)` }], { duration: 2600, easing: 'ease-in-out' }); }

/* ③ صحّح لفوضى: سلال مملوءة فيها شيء واحد في غير مكانه، ثم اختيار السبب */
async function chaosScene(cfg) {
  const svg = newStage(366, { city: false, ground: 0 });
  const cols = cfg.bins.map((k, i) => ({ k, x: 360 - (i + .5) * (360 / cfg.bins.length) }));
  cols.forEach(c => { const g = el('g', { transform: `translate(${c.x - 40} 266) scale(.73)` }, svg); g.innerHTML = basketSVG(c.k).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, ''); label(svg, c.x, 356, plain(BIN_NAMES[c.k]), 15); });
  window.__chaosIx = cfg.placed.findIndex(p => p.wrong);
  const groups = cfg.placed.map(p => { const x = cols.find(c => c.k === p.bin).x; const g = p.s.ball ? ballAt(svg, x, p.y, 32) : thingAt(svg, p.s, x, p.y); g.style.cursor = 'pointer'; g.setAttribute('tabindex', 0); g.setAttribute('role', 'button'); return { p, g, x }; });
  let tries = 0;
  const foundP = new Promise(res => groups.forEach(({ p, g, x }) => { const act = async () => { tries++;
      if (p.wrong) { SFX.good(); logAttempt({ scene: 'chaos', tag: 'findWrong', ok: true, firstTry: tries === 1 });
        const to = cfg.fixTo ? cols.find(c => c.k === cfg.fixTo) : null;
        g.animate([{ transform: `translate(${x}px,${p.y}px) rotate(${p.s.rot || 0}deg)` }, { transform: to ? `translate(${to.x}px,238px) rotate(0deg) scale(.7)` : `translate(${x}px,-60px) rotate(0deg)` }], { duration: 1100, fill: 'forwards', easing: 'ease-in-out' }); res(); }
      else { SFX.soft(); logAttempt({ scene: 'chaos', tag: 'findWrong', ok: false, firstTry: tries === 1 }); await say('compass', 'gen.chaos.no', 'هَذَا فِي مَكَانِهِ. {اِبْحَثْ|اِبْحَثِي} عَنْ غَيْرِهِ.'); } };
    g.onclick = act; g.onkeydown = e => { if (e.key === 'Enter') act(); }; }));
  let found = false; foundP.then(() => { found = true; });
  await say(...cfg.boast);
  if (!found) await say('compass', 'gen.chaos.find', 'هُنَاكَ شَيْءٌ فِي غَيْرِ مَكَانِهِ. {اِلْمَسْهُ|اِلْمَسِيهِ}.');
  if (!found) armIdle(async () => { await say(...cfg.hint); });
  await foundP; disarmIdle(); groups.forEach(({ g }) => g.onclick = null); await sleep(1100);
  await say('compass', 'gen.chaos.why', '{وَجَدْتَهُ|وَجَدْتِهِ}! لِمَاذَا أَخْطَأَتْ فَوْضَى؟');
  const box = document.createElement('div'); box.className = 'choices'; $('#stage').appendChild(box);
  let answered = false;
  const whyP = new Promise(res => shuffle(cfg.reasons).forEach(o => { const b = document.createElement('button'); b.className = 'pick'; b.textContent = G(o.t); b.dataset.id = o.id; if (TESTHOOK) b.dataset.ok = o.ok; box.appendChild(b);
    b.onclick = async () => { logAttempt({ scene: 'chaos', tag: 'why', ok: o.ok }); if (o.ok) { answered = true; hush(); b.classList.add('ok'); SFX.good(); res(); } else { hush(); b.classList.add('no'); SFX.soft(); await say(...cfg.whyNo); } }; }));
  // الطفل في السادسة قد لا يقرأ: يقرأ المرشد كل خيار وهو يضيئه، ويمكن الإجابة قبل انتهاء القراءة
  for (const b of [...box.children]) { if (answered) break; b.classList.add('reading'); const o = cfg.reasons.find(r => r.id === b.dataset.id); await say('compass', o.id, o.t); b.classList.remove('reading'); }
  await whyP;
  await say(...cfg.thanks);
}

/* ④ فحص الإتقان (D182): ثلاثة جديدة بلا مساعدة، من المحاولة الأولى؛ وإلا فمسار علاجي ثم إعادة */
async function masteryScene(cfg) {
  for (let round = 1; round <= 2; round++) {
    await say('compass', 'gen.ms.intro', 'ثَلَاثَةُ أَشْكَالٍ جَدِيدَةٍ، بِلَا مُسَاعَدَةٍ. {خُذْ وَقْتَكَ|خُذِي وَقْتَكِ}.');
    let score = 0; for (const make of cfg.sets[(round - 1) % cfg.sets.length]) { const r = await sortItem(make, cfg, 'mastery' + round, false); if (r.firstTry) score++; }
    PROG[CUR.id] = { ...(PROG[CUR.id] || {}), score, round }; saveProg();
    if (score === 3) { SFX.win(); confetti(); await say('compass', ...cfg.msOk); PROG[CUR.id].mastered = true; saveProg(); srsStart(CUR.id); return; }
    if (round === 2) break;
    await say('compass', ...MS_AGAIN);
    await cfg.recall(); for (const make of cfg.remedial) await sortItem(make, cfg, 'remedial', true);
    await nextBtn('{أَعِدِ|أَعِيدِي} الفَحْصَ');
  }
  /* D233: بعد دورتين يُؤجَّل الفحص إلى مراجعة اليوم ويُعلَّم للكبير، ولا يُحبَس الطفل */
  PROG[CUR.id].deferred = true; saveProg(); srsStart(CUR.id);
  logAttempt({ scene: 'mastery', tag: 'deferred', ok: false });
  await say('compass', ...MS_LATER);
}

/* ⑤ الختام: قطعة جديدة في المدينة */
async function wrapScene(build, linesArr) {
  const svg = newStage(300, { cityOpacity: .9, n: 7, cityH: 64, ground: 34 });
  await build(svg);
  const me = el('g', { transform: 'translate(318 58)' }, svg); el('circle', { r: 30, fill: css('--paper'), stroke: css('--compass'), 'stroke-width': 3 }, me);
  const fo = el('foreignObject', { x: -26, y: -26, width: 52, height: 52 }, me); const ph = avatarNode(PROFILE); ph.setAttribute('style', 'width:52px;height:52px;border-radius:50%;object-fit:cover;display:block'); fo.appendChild(ph);
  label(svg, 318, 108, G('{المُهَنْدِسُ|المُهَنْدِسَةُ} {name}'), 14);
  if (CUR) (HOSTS[unitOf(CUR)] || []).forEach((k, i) => { const x = 34 + i * 46, y = 56 + (i % 2) * 6; const h = hostAt(svg, k, x, y, 40);   // المضيفون يحتفلون مع الطفل (D194)
    h.animate([{ transform: `translate(${x}px,${y}px)` }, { transform: `translate(${x}px,${y - 14}px)` }, { transform: `translate(${x}px,${y}px)` }], { duration: 520, delay: 300 + i * 140, iterations: 3, easing: 'ease-out' }); });
  SFX.win(); confetti(36); await lines(linesArr);
}

