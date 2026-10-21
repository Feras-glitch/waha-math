/* =====================================================================
   الوحدة الثانية: عالم المجسّمات (S1-U2، المواصفة 1.1)
   أمثلتها المجسّمات الأربعة فقط (D33)، والوجوه تُلمس ولا تُعدّ (العدّ الرسمي في م3، C318).
   ===================================================================== */
const MK2 = {
  cube: () => ({ solid: 'cube', kind: 'cube', size: R(108, 124), color: nextColor(), tag: 'cube' }),
  cubeTurned: () => ({ solid: 'cube', kind: 'cube', pose: 'turned', size: 116, color: nextColor(), tag: 'cubeTurned' }),
  cubeTilt: () => ({ solid: 'cube', kind: 'cube', pose: 'tilt', size: 112, color: nextColor(), tag: 'cubeTurned' }),
  die: () => ({ solid: 'cube', kind: 'cube', object: 'die', size: 112, color: '#f3eee2', label: 'نَرْد', tag: 'cube' }),
  ice: () => ({ solid: 'cube', kind: 'cube', object: 'ice', pose: 'turned', size: 104, color: '#a8dcef', label: 'مُكَعَّبُ ثَلْجٍ', tag: 'cubeTurned' }),
  gift: () => ({ solid: 'cube', kind: 'cube', object: 'gift', size: 112, color: '#5c9bb0', label: 'هَدِيَّة', tag: 'cube' }),
  sphere: () => ({ solid: 'sphere', kind: 'sphere', size: R(110, 124), color: nextColor(), tag: 'sphere' }),
  ball: () => ({ solid: 'sphere', kind: 'sphere', object: 'ball', size: 118, color: '#f3f3f3', label: 'كُرَةُ قَدَمٍ', tag: 'sphere' }),
  marble: () => ({ solid: 'sphere', kind: 'sphere', object: 'marble', size: 84, color: '#5c9bb0', label: 'كُرَةٌ زُجَاجِيَّةٌ', tag: 'sphere' }),
  cyl: () => ({ solid: 'cylinder', kind: 'cylinder', size: 120, color: nextColor(), tag: 'cylinder' }),
  cylLying: () => ({ solid: 'cylinder', kind: 'cylinder', pose: 'lying', size: 120, color: nextColor(), tag: 'cylLying' }),
  drum: () => ({ solid: 'cylinder', kind: 'cylinder', object: 'drum', size: 118, color: '#d9483b', label: 'طَبْلَة', tag: 'cylinder' }),
  tube: () => ({ solid: 'cylinder', kind: 'cylinder', object: 'tube', pose: 'lying', size: 124, color: '#c9a072', label: 'أُنْبُوبٌ مِنْ كَرْتُونٍ', tag: 'cylLying' }),
  candle: () => ({ solid: 'cylinder', kind: 'cylinder', object: 'candle', size: 120, color: '#f1e3c6', label: 'شَمْعَة', tag: 'cylinder' }),
  cone: () => ({ solid: 'cone', kind: 'cone', size: 122, color: nextColor(), tag: 'cone' }),
  coneLying: () => ({ solid: 'cone', kind: 'cone', pose: 'lying', size: 124, color: nextColor(), tag: 'coneTurned' }),
  hat: () => ({ solid: 'cone', kind: 'cone', object: 'hat', size: 120, color: '#8e6bbf', label: 'قُبَّعَةُ حَفْلَةٍ', tag: 'cone' }),
  waffle: () => ({ solid: 'cone', kind: 'cone', object: 'waffle', pose: 'tipdown', size: 118, color: '#e0b070', label: 'قِمْعُ البُوظَةِ', tag: 'coneTurned' }),
  flatSquare: () => ({ type: 'square', kind: 'flat', size: 110, color: nextColor(), label: 'مُرَبَّعٌ مِنْ وَرَقٍ', tag: 'flatSquare' }),
  flatCircle: () => ({ type: 'circle', kind: 'flat', size: 112, color: nextColor(), label: 'دَائِرَةٌ مِنْ وَرَقٍ', tag: 'flatCircle' }),
  flatTri: () => ({ type: 'triangle', kind: 'flat', size: 118, color: nextColor(), label: 'مُثَلَّثٌ مِنْ وَرَقٍ', tag: 'flatTri' }),
  sheetCircle: () => ({ sheet: true, draw: 'circle', kind: 'flat', label: 'دَائِرَةٌ مَرْسُومَةٌ', tag: 'sheet' }),
};
const solidIcon = k => `<svg viewBox="-42 -46 84 84" width="46" height="46" aria-hidden="true">${thingMarkup({ solid: k, size: 70 }, 0, 0, 1)}</svg>`;

/* كيس المفاجآت: يلمس الطفل دون أن يرى */
function bagAt(svg, x, y) { const g = el('g', { transform: `translate(${x} ${y})`, role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg);
  el('path', { d: 'M-58 60 Q-70 -10 -30 -40 L30 -40 Q70 -10 58 60 Q0 74 -58 60 Z', fill: '#c98f55', stroke: '#fff', 'stroke-width': 4, filter: 'url(#pp)' }, g);
  el('path', { d: 'M-30 -40 Q0 -54 30 -40 L24 -52 Q0 -62 -24 -52 Z', fill: '#9c6837' }, g); el('path', { d: 'M-26 -44 Q0 -34 26 -44', stroke: '#f6cf7e', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, g);
  el('path', { d: 'M-40 20 q20 -14 40 0 t40 0', stroke: '#9c6837', 'stroke-width': 2, fill: 'none', opacity: .5 }, g); el('text', { y: 30, 'text-anchor': 'middle', 'font-size': 44, 'font-weight': 800, fill: '#fff', opacity: .9, 'font-family': css('--f') }, g).textContent = '؟';
  return g; }

/* ---------------- [m1.u2.d1] الدرس 1: المكعب والكرة (C006، C009) ---------------- */
LESSONS.push(lesson('m1.u2.d1', W => ({
  async hook() {
    const svg = newStage(300, { cityOpacity: .2 });
    const inA = Math.random() < .5 ? 'sphere' : 'cube'; const content = { a: inA, b: inA === 'sphere' ? 'cube' : 'sphere' };
    const POS = { a: [270, 150], b: [90, 150] }; const A = bagAt(svg, ...POS.a), B = bagAt(svg, ...POS.b); A.dataset.t = 'bag'; B.dataset.t = 'bag';
    const FEEL = { sphere: ['hook.feel.sphere', 'أَصَابِعِي تَشْعُرُ بِسَطْحٍ مُنْحَنٍ نَاعِمٍ فِي كُلِّ مَكَانٍ، بِلَا رُؤُوسٍ.'],
      cube: ['hook.feel.cube', 'أَصَابِعِي تَشْعُرُ بِسُطُوحٍ مُسَطَّحَةٍ، وَبِرُؤُوسٍ مُدَبَّبَةٍ.'] };
    await lines([['chaos', 'hook.01', 'خَبَّأْتُ فِي كِيسٍ كُرَةً، وَفِي الكِيسِ الآخَرِ مُكَعَّبًا. لَنْ {تَعْرِفَ|تَعْرِفِي} أَيْنَ هُمَا!'],
      ['compass', 'hook.02', 'بَلْ نَعْرِفُ بِاللَّمْسِ! {اِلْمَسْ|اِلْمَسِي} كِيسًا، وَ{أَدْخِلْ|أَدْخِلِي} {يَدَكَ|يَدَكِ} فِيهِ دُونَ أَنْ {تَنْظُرَ|تَنْظُرِي}.']]);
    const done = new Set();
    while (done.size < 2) {
      const which = await gate(new Promise(res => { [[A, 'a'], [B, 'b']].forEach(([g, k]) => { g.onclick = () => { if (!done.has(k)) res(k); }; g.onkeydown = e => { if (e.key === 'Enter' && !done.has(k)) res(k); }; }); }));
      const bag = which === 'a' ? A : B; const solid = content[which]; SFX.tick();
      const [bx, by] = POS[which];
      bag.animate([{ transform: `translate(${bx}px,${by}px) scale(1)` }, { transform: `translate(${bx}px,${by}px) scale(1.06,.94)` }], { duration: 300, iterations: 4, direction: 'alternate' });
      await say('compass', ...FEEL[solid]);
      await say('compass', 'hook.ask', 'مَا الَّذِي فِي هَذَا الكِيسِ؟');
      const k = await choosePick([['cube', 'مُكَعَّب', solidIcon('cube')], ['sphere', 'كُرَة', solidIcon('sphere')]], solid);
      logAttempt({ scene: 'hook', tag: 'feel-' + solid, ok: k === solid });
      const o = thingAt(svg, { solid, size: 92 }, bx, by - 30); o.animate([{ transform: `translate(${bx}px,${by + 10}px) scale(.3)`, opacity: 0 }, { transform: `translate(${bx}px,${by - 96}px) scale(1)`, opacity: 1 }], { duration: FAST ? 40 : 700, fill: 'forwards', easing: 'cubic-bezier(.3,1.4,.6,1)' });
      SFX.good(); await say('compass', ...(solid === 'sphere' ? ['hook.is.sphere', 'إِنَّهَا الكُرَةُ!'] : ['hook.is.cube', 'إِنَّهُ المُكَعَّبُ!']));
      done.add(which); bag.style.opacity = .55;
    }
    await lines([['compass', 'hook.03', 'عَرَفْنَاهُمَا بِأَصَابِعِنَا: سَطْحٌ مُنْحَنٍ، أَوْ سُطُوحٌ مُسَطَّحَةٌ وَرُؤُوسٌ.'], ['chaos', 'hook.04', 'حَسَنًا! وَمَاذَا يَفْعَلَانِ إِذَا دَفَعْنَاهُمَا؟']]);
  },
  async explore() {
    await pushLab([
      { s: { solid: 'sphere', size: 92 }, behave: 'roll', ok: 'roll', options: [['roll', 'تَتَدَحْرَجُ'], ['stay', 'تَبْقَى']],
        ask: ['exp.push.sphere', 'سَنَدْفَعُ الكُرَةَ. هَلْ تَتَدَحْرَجُ أَمْ تَبْقَى مَكَانَهَا؟ {تَوَقَّعْ|تَوَقَّعِي}.'], after: ['exp.push.sphere.after', 'تَدَحْرَجَتِ الكُرَةُ بَعِيدًا! وَتَتَدَحْرَجُ فِي كُلِّ اتِّجَاهٍ.'] },
      { s: { solid: 'cube', size: 96 }, behave: 'tip', ok: 'stay', options: [['roll', 'يَتَدَحْرَجُ'], ['stay', 'يَبْقَى']],
        ask: ['exp.push.cube', 'وَالآنَ المُكَعَّبُ. هَلْ يَتَدَحْرَجُ مِثْلَ الكُرَةِ؟ {تَوَقَّعْ|تَوَقَّعِي}.'], after: ['exp.push.cube.after', 'انْقَلَبَ المُكَعَّبُ مَرَّةً وَاحِدَةً، ثُمَّ وَقَفَ ثَابِتًا. لَا يَتَدَحْرَجُ.'] },
    ]);
    // كلمتان جديدتان: مجسّم، ووجه (دون عدّ)
    const svg = newStage(300, { cityOpacity: .15 });
    await say('compass', 'exp.solid', 'الكُرَةُ وَالمُكَعَّبُ مُجَسَّمَانِ: كُلٌّ مِنْهُمَا يَمْلَأُ كَفَّنَا، وَلَهُ سُمْكٌ.');
    say('compass', 'exp.face', 'السَّطْحُ المُسَطَّحُ مِنَ المُجَسَّمِ اسْمُهُ: وَجْهٌ. {اِلْمَسْ|اِلْمَسِي} وُجُوهَ المُكَعَّبِ {بِكَفِّكَ|بِكَفِّكِ}.');
    await faceTouch(svg, { solid: 'cube', size: 150, pose: 'turned' }, 180, 132, { faces: ['front', 'top', 'right', 'left', 'back'] });
    hush(); SFX.good(); await say('compass', 'exp.face.after', 'كُلُّ وُجُوهِ المُكَعَّبِ مُسَطَّحَةٌ، نَلْمَسُهَا بِكَفِّنَا.');
    const svg2 = newStage(300, { cityOpacity: .15 });
    say('compass', 'exp.sphere.touch', 'وَالكُرَةُ؟ {اِلْمَسْهَا|اِلْمَسِيهَا}.');
    await faceTouch(svg2, { solid: 'sphere', size: 150 }, 180, 140, { faces: ['curved'], need: 1 });
    hush(); await say('compass', 'exp.sphere.after', 'سَطْحُ الكُرَةِ مُنْحَنٍ كُلُّهُ: لَيْسَ لَهَا وَجْهٌ مُسَطَّحٌ.');
  },
  worked: [
    async (svg, st) => { st.c = thingAt(svg, { solid: 'cube', size: 130, color: SOLIDC.cube }, 180, 140); await say('compass', 'wk.01', 'هَذَا مُكَعَّبٌ: وُجُوهُهُ مُسَطَّحَةٌ، وَيَقِفُ ثَابِتًا.'); },
    async (svg, st) => { await say('chaos', 'wk.02', 'سَأُمِيلُهُ عَلَى أَحَدِ رُؤُوسِهِ… هَا! صَارَ شَيْئًا آخَرَ!');
      st.c.remove(); st.c = thingAt(svg, { solid: 'cube', size: 130, pose: 'tilt', color: SOLIDC.cube }, 180, 140);
      st.c.animate([{ transform: 'translate(180px,140px) rotate(-28deg)' }, { transform: 'translate(180px,140px) rotate(0deg)' }], { duration: FAST ? 40 : 900, easing: 'ease-out' }); await sleep(900);
      await say('compass', 'wk.03', 'مَا زَالَتْ وُجُوهُهُ مُسَطَّحَةً: مَا زَالَ مُكَعَّبًا!'); },
    async (svg) => { svg.innerHTML = ''; backdrop(svg, 300, { cityOpacity: .15 });
      thingAt(svg, { type: 'square', size: 100, color: css('--square') }, 92, 130); thingAt(svg, { solid: 'cube', size: 120, color: SOLIDC.cube }, 268, 130);
      label(svg, 92, 232, 'مُرَبَّعٌ مِنْ وَرَقٍ', 16); label(svg, 268, 232, 'مُكَعَّب', 16);
      await say('compass', 'wk.04', 'المُرَبَّعُ الوَرَقِيُّ رَقِيقٌ بِلَا سُمْكٍ. أَمَّا المُكَعَّبُ فَيَمْلَأُ الكَفَّ.'); },
    async (svg) => { svg.innerHTML = ''; backdrop(svg, 300, { cityOpacity: .15 });
      thingAt(svg, { type: 'circle', size: 104, color: css('--circle') }, 92, 130); thingAt(svg, { solid: 'sphere', size: 120, color: SOLIDC.sphere }, 268, 130);
      label(svg, 92, 232, 'دَائِرَةٌ مِنْ وَرَقٍ', 16); label(svg, 268, 232, 'كُرَة', 16);
      await say('compass', 'wk.05', 'وَالدَّائِرَةُ الوَرَقِيَّةُ رَقِيقَةٌ بِلَا سُمْكٍ. أَمَّا الكُرَةُ فَتَمْلَأُ الكَفَّ.'); },
    async (svg) => { svg.innerHTML = ''; backdrop(svg, 300, { cityOpacity: .15 });
      thingAt(svg, MK2.ball(), 100, 130); thingAt(svg, { solid: 'sphere', object: 'orange', size: 112, color: '#f39a2c' }, 262, 130);
      label(svg, 100, 232, 'كُرَةُ قَدَمٍ', 16); label(svg, 262, 232, 'بُرْتُقَالَة', 16);
      await say('compass', 'wk.06', 'البُرْتُقَالَةُ شَبِيهَةٌ بِالكُرَةِ: تَتَدَحْرَجُ، لَكِنَّهَا لَيْسَتْ كُرَةً تَامَّةً.'); },
  ],
  sort: {
    errorOf(item, bin) { if (item.tag === 'flatSquare' && bin === 'cube') return 'flatAsCube'; if (item.tag === 'flatCircle' && bin === 'sphere') return 'flatAsSphere';
      if (item.kind === 'cube' && bin === 'sphere') return 'cubeNotRoll'; if (item.kind === 'cube') return item.tag === 'cubeTurned' ? 'cubeTurned' : 'cubeNotRoll';
      if (item.kind === 'sphere') return 'sphereNoFace'; if (item.solid) return 'newSolid'; return 'generic'; },
    reason(item) { if (item.kind === 'cube') return item.tag === 'cubeTurned' ? W('why.cubeTurned') : W('why.cube');
      if (item.kind === 'sphere') return W('why.sphere');
      return item.solid ? W('why.newSolid') : W('why.flat'); },
    twin(item) { return { cube: MK2.cubeTilt, cubeTurned: MK2.cubeTurned, sphere: MK2.marble, flatSquare: MK2.flatSquare, flatCircle: MK2.flatCircle }[item.tag] || MK2.cyl; },
    async recall() { const svg = newStage(300); thingAt(svg, { solid: 'cube', size: 120, pose: 'tilt', color: SOLIDC.cube }, 100, 140); thingAt(svg, { solid: 'sphere', size: 120, color: SOLIDC.sphere }, 262, 140);
      await say('compass', 'ms.recall', 'المُكَعَّبُ وُجُوهُهُ مُسَطَّحَةٌ وَيَقِفُ، مَهْمَا أَدَرْنَاهُ. وَالكُرَةُ سَطْحُهَا مُنْحَنٍ وَتَتَدَحْرَجُ. وَالوَرَقُ رَقِيقٌ بِلَا سُمْكٍ.'); },
  },
  async wrap(svg) { for (const [i, [x, y]] of [[150, 236], [190, 236], [230, 236], [170, 196], [210, 196], [190, 156]].entries()) { const g = el('g', {}, svg); drawBox(g, { w: 34, h: 34, d: 34, yaw: 22, pitch: 18, color: [SOLIDC.cube, '#7cc4b8', '#f6cf7e'][i % 3] });
      g.setAttribute('transform', `translate(${x} ${y - 18})`); g.animate([{ opacity: 0, transform: `translate(${x}px,${y - 60}px)` }, { opacity: 1, transform: `translate(${x}px,${y - 18}px)` }], { duration: 380, delay: 200 + i * 140, fill: 'both', easing: 'cubic-bezier(.3,1.4,.6,1)' }); }
    const b = thingAt(svg, { solid: 'sphere', object: 'ball', size: 50, color: '#f3f3f3' }, 70, 230);
    b.animate([{ transform: 'translate(-30px,230px)' }, { transform: 'translate(80px,230px)' }], { duration: 1200, delay: 1100, fill: 'both', easing: 'ease-out' }); },
})));

/* ---------------- [m1.u2.d2] الدرس 2: الأسطوانة والمخروط (C007) ---------------- */
/* طلبات زبائن المتجر: بياناتها في d2.json (riddles)، وكل طلب مولّد يعيد نسخة جديدة */
const RID = {}; for (const [k, r] of Object.entries(LDATA['m1.u2.d2'].riddles)) RID[k] = () => ({ ...r });
Object.assign(MAKER, MK2, RID);
LESSONS.push(lesson('m1.u2.d2', W => ({
  async hook() {
    const svg = newStage(300, { city: false }); floorLine(svg); placeOnFloor(svg, { solid: 'cone', size: 120 }, 180);
    await say('chaos', 'hook.01', 'هَذَا المَخْرُوطُ يَقِفُ مِثْلَ المُكَعَّبِ، وَإِذَا دَحْرَجْتُهُ تَدَحْرَجَ فِي خَطٍّ مُسْتَقِيمٍ، مِثْلَ الكُرَةِ!');
    say('compass', 'hook.02', 'هَلْ يَتَدَحْرَجُ المَخْرُوطُ فِي خَطٍّ مُسْتَقِيمٍ، أَمْ يَدُورُ؟ {تَوَقَّعْ|تَوَقَّعِي}.');
    const k = await choosePick([['straight', 'فِي خَطٍّ مُسْتَقِيمٍ'], ['around', 'يَدُورُ']], 'around'); logAttempt({ scene: 'hook', tag: 'predict', ok: k === 'around' });
    await say('compass', 'hook.03', 'نُنِيمُهُ عَلَى جَانِبِهِ وَنَنْظُرُ مِنْ فَوْقُ.');
    const top = newStage(300, null); topView(top); await rollTop(top, 'cone');
    await lines([['compass', 'hook.04', 'دَارَ حَوْلَ رَأْسِهِ! رَأْسُهُ يَبْقَى فِي مَكَانِهِ، وَقَاعِدَتُهُ تَدُورُ حَوْلَهُ.'], ['chaos', 'hook.05', 'أُوه! إِذَنْ مَنْ يَتَدَحْرَجُ فِي خَطٍّ مُسْتَقِيمٍ؟']]);
  },
  async explore() {
    const top = newStage(300, null); topView(top); const c = cylTop(top, 180, 70, SOLIDC.cylinder); c.style.cursor = 'pointer'; c.setAttribute('role', 'button'); c.setAttribute('tabindex', 0); c.dataset.t = 'roll';
    say('compass', 'exp.cyl.tap', 'هَذِهِ أُسْطُوَانَةٌ نَائِمَةٌ، نَنْظُرُ إِلَيْهَا مِنْ فَوْقُ. {اِلْمَسْهَا|اِلْمَسِيهَا} لِنُدَحْرِجَهَا.');
    await gate(new Promise(r => { c.onclick = r; c.onkeydown = e => { if (e.key === 'Enter') r(); }; })); hush(); c.remove(); await rollTop(top, 'cylinder');
    await say('compass', 'exp.cyl.after', 'تَدَحْرَجَتِ الأُسْطُوَانَةُ فِي خَطٍّ مُسْتَقِيمٍ.');
    await pushLab([
      { s: { solid: 'cylinder', size: 110 }, behave: 'stay', ok: 'stay', options: [['roll', 'تَتَدَحْرَجُ'], ['stay', 'تَبْقَى']],
        ask: ['exp.push.cyl', 'وَإِذَا كَانَتِ الأُسْطُوَانَةُ وَاقِفَةً، هَلْ تَتَدَحْرَجُ إِذَا دَفَعْنَاهَا؟'], after: ['exp.push.cyl.after', 'بَقِيَتْ وَاقِفَةً عَلَى وَجْهِهَا الدَّائِرِيِّ المُسَطَّحِ.'] },
      { s: { solid: 'cylinder', pose: 'end', size: 104 }, behave: 'roll', ok: 'roll', options: [['roll', 'تَتَدَحْرَجُ'], ['stay', 'تَبْقَى']],
        ask: ['exp.push.cylEnd', 'وَإِذَا نَامَتْ عَلَى جَانِبِهَا؟'], after: ['exp.push.cylEnd.after', 'تَدَحْرَجَتْ عَلَى سَطْحِهَا المُنْحَنِي. الأُسْطُوَانَةُ تَقِفُ، وَتَتَدَحْرَجُ.'] },
    ]);
    const svg = newStage(300, { cityOpacity: .15 });
    say('compass', 'exp.cyl.face', '{اِلْمَسْ|اِلْمَسِي} الوَجْهَ المُسَطَّحَ لِلْأُسْطُوَانَةِ.');
    let g = await faceTouch(svg, { solid: 'cylinder', size: 150 }, 180, 140, { faces: ['top'], need: 1 }); hush();
    await say('compass', 'exp.cyl.flip', 'نَقْلِبُهَا… وَهُنَاكَ وَجْهٌ آخَرُ. {اِلْمَسْهُ|اِلْمَسِيهِ}.');
    g.animate([{ transform: 'translate(180px,140px) rotate(0deg)' }, { transform: 'translate(180px,140px) rotate(180deg)' }], { duration: FAST ? 40 : 800 }); await sleep(820); g.remove();
    await faceTouch(svg, { solid: 'cylinder', size: 150, color: mix(SOLIDC.cylinder, 'w', .08) }, 180, 140, { faces: ['top'], need: 1 });
    await say('compass', 'exp.cyl.faces.after', 'لِلْأُسْطُوَانَةِ وَجْهَانِ دَائِرِيَّانِ مُسَطَّحَانِ، وَبَيْنَهُمَا سَطْحٌ مُنْحَنٍ تَتَدَحْرَجُ عَلَيْهِ.');
    const svg2 = newStage(300, { cityOpacity: .15 });
    say('compass', 'exp.cone.face', 'وَالمَخْرُوطُ؟ قَلَبْنَاهُ لِنَرَى قَاعِدَتَهُ. {اِلْمَسْ|اِلْمَسِي} وَجْهَهُ المُسَطَّحَ.');
    await faceTouch(svg2, { solid: 'cone', pose: 'tipdown', size: 150 }, 180, 140, { faces: ['base'], need: 1 }); hush();
    await say('compass', 'exp.cone.after', 'لِلْمَخْرُوطِ وَجْهٌ دَائِرِيٌّ وَاحِدٌ، وَرَأْسٌ مُدَبَّبٌ.');
  },
  worked: [
    async (svg, st) => { st.d = thingAt(svg, MK2.drum(), 180, 140); await say('compass', 'wk.01', 'هَذِهِ طَبْلَةٌ: وَجْهَانِ دَائِرِيَّانِ مُسَطَّحَانِ، وَسَطْحٌ مُنْحَنٍ. إِنَّهَا أُسْطُوَانَةٌ.'); },
    async (svg, st) => { await say('chaos', 'wk.02', 'سَأُنِيمُهَا… لَمْ تَعُدْ أُسْطُوَانَةً!'); st.d.remove(); st.d = thingAt(svg, { ...MK2.drum(), pose: 'lying' }, 180, 150);
      st.d.animate([{ transform: 'translate(180px,150px) rotate(-90deg)' }, { transform: 'translate(180px,150px) rotate(0deg)' }], { duration: FAST ? 40 : 800, easing: 'ease-out' }); await sleep(820);
      await say('compass', 'wk.03', 'مَا زَالَ لَهَا الوَجْهَانِ الدَّائِرِيَّانِ: أُسْطُوَانَةٌ نَائِمَةٌ.'); },
    async (svg) => { svg.innerHTML = ''; backdrop(svg, 300, { cityOpacity: .15 }); thingAt(svg, MK2.hat(), 100, 140); thingAt(svg, MK2.waffle(), 262, 130);
      label(svg, 100, 232, 'قُبَّعَةُ حَفْلَةٍ', 16); label(svg, 262, 232, 'قِمْعُ البُوظَةِ', 16);
      await say('compass', 'wk.04', 'قُبَّعَةُ الحَفْلَةِ وَقِمْعُ البُوظَةِ مَخْرُوطَانِ: رَأْسٌ مُدَبَّبٌ وَقَاعِدَةٌ دَائِرِيَّةٌ، حَتَّى لَوْ كَانَ الرَّأْسُ إِلَى الأَسْفَلِ.'); },
  ],
  sort: {
    errorOf(item, bin) { if (item.riddle) return 'riddle'; if (item.kind === 'cylinder' && bin === 'cone') return 'cylAsCone'; if (item.kind === 'cone' && bin === 'cylinder') return 'coneAsCyl';
      if (item.kind === 'cylinder') return item.tag === 'cylLying' ? 'lyingCyl' : 'cylOther'; if (item.kind === 'cone') return 'coneTurned'; return 'otherSolid'; },
    reason(item) { if (item.kind === 'cylinder') return item.tag === 'cylLying' ? W('why.cylLying') : W('why.cyl');
      if (item.kind === 'cone') return W('why.cone');
      if (item.kind === 'sphere') return W('why.sphere2');
      return W('why.other2'); },
    twin(item) { if (item.riddle) return item.kind === 'cone' ? RID.r5 : item.kind === 'sphere' ? RID.r3 : RID.r4; return { cylinder: MK2.candle, cylLying: MK2.tube, cone: MK2.hat, coneTurned: MK2.waffle }[item.tag] || MK2.coneLying; },
    async recall() { const svg = newStage(300); thingAt(svg, { solid: 'cylinder', pose: 'lying', size: 120 }, 100, 150); thingAt(svg, { solid: 'cone', size: 120 }, 262, 140);
      await say('compass', 'ms.recall', 'الأُسْطُوَانَةُ لَهَا وَجْهَانِ دَائِرِيَّانِ، وَاقِفَةً أَوْ نَائِمَةً. وَالمَخْرُوطُ لَهُ رَأْسٌ مُدَبَّبٌ وَقَاعِدَةٌ دَائِرِيَّةٌ.'); },
  },
  async wrap(svg) { const t = el('g', { transform: 'translate(180 0)' }, svg);
    for (const x of [-34, 34]) el('rect', { x: x - 4, y: 170, width: 8, height: 66, fill: '#7d8b92' }, t); el('line', { x1: -34, y1: 200, x2: 34, y2: 230, stroke: '#7d8b92', 'stroke-width': 4 }, t); el('line', { x1: 34, y1: 200, x2: -34, y2: 230, stroke: '#7d8b92', 'stroke-width': 4 }, t);
    thingAt(t, { solid: 'cylinder', size: 150, color: '#5c9bb0' }, 0, 136); thingAt(t, { solid: 'cone', size: 128, color: SOLIDC.cone }, 0, 52);
    t.animate([{ transform: 'translate(180px,300px)', opacity: 0 }, { transform: 'translate(180px,0px)', opacity: 1 }], { duration: 900, delay: 250, fill: 'both', easing: 'cubic-bezier(.3,1.3,.6,1)' }); },
})));

/* ---------------- [m1.u2.d3] الدرس 3: مسطّح أم مجسّم؟ وبنّاء المجسّمات (C008) ---------------- */
/* ---------- مسجد من المجسّمات (S1-U2 1.2، D196 و D206): القبة تشبه نصف الكرة، والمئذنة أسطوانة فوقها مخروط ---------- */
function mosqueAt(svg) { const g = el('g', {}, svg); floorLine(svg, 236);
  const body = thingAt(g, { solid: 'cube', size: 150, color: '#e9dcc3' }, 140, 180); body.dataset.part = 'cube';
  const dome = el('g', { transform: 'translate(132 104)' }, g); const df = grad(dome, 'radialGradient', [[0, '#ffe3ef'], [.55, SOLIDC.sphere], [1, mix(SOLIDC.sphere, 'b', .35)]], { cx: .38, cy: .3, r: .9 });
  el('path', { d: 'M-46 0 A46 46 0 0 1 46 0 Z', fill: df, stroke: '#fff', 'stroke-width': 3 }, dome); el('line', { x1: 0, y1: -46, x2: 0, y2: -62, stroke: '#c98f55', 'stroke-width': 3 }, dome); el('circle', { cx: 0, cy: -66, r: 4, fill: '#f2b33d' }, dome); dome.dataset.part = 'dome';
  const mn = el('g', { transform: 'translate(272 0)' }, g); const w = 34, h = 150, top = 92, ry = 6;
  const cf = grad(mn, 'linearGradient', [[0, mix(SOLIDC.cylinder, 'b', .28)], [.35, mix(SOLIDC.cylinder, 'w', .3)], [.65, SOLIDC.cylinder], [1, mix(SOLIDC.cylinder, 'b', .4)]]);
  const cyl = el('g', {}, mn); el('path', { d: `M${-w / 2} ${top} L${-w / 2} ${top + h - 6} A${w / 2} ${ry} 0 0 0 ${w / 2} ${top + h - 6} L${w / 2} ${top} Z`, fill: cf, stroke: '#fff', 'stroke-width': 3 }, cyl);
  el('ellipse', { cx: 0, cy: top, rx: w / 2, ry, fill: mix(SOLIDC.cylinder, 'w', .32), stroke: '#fff', 'stroke-width': 3 }, cyl); el('rect', { x: -w / 2 - 6, y: top + 34, width: w + 12, height: 8, rx: 3, fill: '#e9dcc3', stroke: '#fff', 'stroke-width': 2 }, cyl); cyl.dataset.part = 'cylinder';
  const cn = el('g', {}, mn); const kf = grad(cn, 'linearGradient', [[0, mix(SOLIDC.cone, 'b', .25)], [.4, mix(SOLIDC.cone, 'w', .3)], [.7, SOLIDC.cone], [1, mix(SOLIDC.cone, 'b', .38)]]);
  el('path', { d: `M0 ${top - 54} L${w / 2 + 4} ${top} A${w / 2 + 4} ${ry} 0 0 1 ${-w / 2 - 4} ${top} Z`, fill: kf, stroke: '#fff', 'stroke-width': 3 }, cn); cn.dataset.part = 'cone';
  return { cube: body, dome, cylinder: cyl, cone: cn };
}
async function mosqueScene() {
  const svg = newStage(300, { cityOpacity: .25 }); const parts = mosqueAt(svg);
  await say('compass', 'arch.01', '{اُنْظُرْ|اُنْظُرِي}: هَذَا مَسْجِدٌ فِي مَدِينَتِنَا، وَهُوَ مَبْنِيٌّ مِنَ المُجَسَّمَاتِ!');
  for (const [k, ask, ok] of [['cylinder', ['arch.02', 'جِسْمُ المِئْذَنَةِ طَوِيلٌ مُسْتَدِيرٌ. {اِلْمَسِ|اِلْمَسِي} الأُسْطُوَانَةَ.'], ['arch.02ok', 'نَعَمْ! جِسْمُ المِئْذَنَةِ أُسْطُوَانَةٌ طَوِيلَةٌ.']],
      ['cone', ['arch.03', 'وَفَوْقَ المِئْذَنَةِ رَأْسٌ مُدَبَّبٌ. {اِلْمَسِ|اِلْمَسِي} المَخْرُوطَ.'], ['arch.03ok', 'نَعَمْ! رَأْسُ المِئْذَنَةِ مَخْرُوطٌ.']],
      ['cube', ['arch.04', 'وَالمَبْنَى الكَبِيرُ؟ {اِلْمَسِ|اِلْمَسِي} المُكَعَّبَ.'], ['arch.04ok', 'نَعَمْ! المَبْنَى يُشْبِهُ مُكَعَّبًا كَبِيرًا.']]]) {
    let first = true;
    while (true) { say('compass', ...ask);
      const hit = await gate(new Promise(res => Object.entries(parts).forEach(([pk, g]) => { g.style.cursor = 'pointer'; g.setAttribute('role', 'button'); /*T*/if (TESTHOOK) g.dataset.ok = pk === k;/*/T*/ g.onclick = () => res(pk); })));
      hush(); logAttempt({ scene: 'build', tag: 'arch-' + k, ok: hit === k, firstTry: first, err: hit === k ? null : 'archPart' });
      if (hit === k) { SFX.good(); parts[k].animate([{ opacity: 1 }, { opacity: .55 }, { opacity: 1 }], { duration: 600 }); await say('compass', ...ok); break; }
      SFX.soft(); first = false; await say('compass', 'arch.no', 'لَيْسَ هَذَا. {اُنْظُرْ|اُنْظُرِي} إِلَى شَكْلِهِ جَيِّدًا.'); }
  }
  Object.values(parts).forEach(g => { g.onclick = null; g.style.cursor = ''; g.removeAttribute('role'); /*T*/if (TESTHOOK) delete g.dataset.ok;/*/T*/ });
  parts.dome.animate([{ transform: 'translate(132px,104px) scale(1)' }, { transform: 'translate(132px,104px) scale(1.12)' }, { transform: 'translate(132px,104px) scale(1)' }], { duration: 900, iterations: 2 });
  await say('compass', 'arch.05', 'وَالقُبَّةُ الكَبِيرَةُ تُشْبِهُ نِصْفَ الكُرَةِ، كَأَنَّنَا قَطَعْنَا الكُرَةَ وَوَضَعْنَاهَا عَلَى السَّقْفِ.');
}
LESSONS.push(lesson('m1.u2.d3', W => ({
  async hook() {
    const svg = newStage(300, { city: false }); floorLine(svg); const pv = placeOnFloor(svg, { sheet: true, draw: 'circle', rot: 0 }, 140);
    await say('chaos', 'hook.01', 'رَسَمْتُ كُرَتِي عَلَى وَرَقَةٍ! سَأَلْعَبُ بِهَا الآنَ.');
    say('compass', 'hook.02', 'إِذَا دَفَعْنَا الوَرَقَةَ، هَلْ تَتَدَحْرَجُ الدَّائِرَةُ المَرْسُومَةُ؟ {تَوَقَّعْ|تَوَقَّعِي}.');
    const k = await choosePick([['roll', 'تَتَدَحْرَجُ'], ['stay', 'لَا تَتَدَحْرَجُ']], 'stay'); logAttempt({ scene: 'hook', tag: 'predict', ok: k === 'stay' });
    pv.remove();
    await pushTest(svg, { sheet: true, draw: 'circle', rot: 0 }, 'stay', 140);
    await lines([['compass', 'hook.03', 'انْزَلَقَتِ الوَرَقَةُ قَلِيلًا، وَلَمْ تَتَدَحْرَجْ: الدَّائِرَةُ مَرْسُومَةٌ عَلَى الوَرَقِ، لَيْسَتْ كُرَةً.'], ['chaos', 'hook.04', 'أُوه… أَيْنَ كُرَتِي إِذَنْ؟']]);
  },
  async explore() {
    const PR = [['square', 'مُرَبَّع'], ['circle', 'دَائِرَة'], ['dot', 'نُقْطَةٌ صَغِيرَةٌ']];
    const rounds = [
      { s: { solid: 'cube', size: 84 }, print: 'square', ask: ['exp.stamp.cube', 'نَضَعُ وَجْهَ المُكَعَّبِ عَلَى الحِبْرِ ثُمَّ عَلَى الوَرَقَةِ. مَا شَكْلُ البَصْمَةِ؟ {تَوَقَّعْ|تَوَقَّعِي}.'], after: ['exp.stamp.cube.after', 'مُرَبَّعٌ! وَجْهُ المُكَعَّبِ يَتْرُكُ بَصْمَةً مُرَبَّعَةً.'] },
      { s: { solid: 'cylinder', size: 92 }, print: 'circle', ask: ['exp.stamp.cyl', 'وَالأُسْطُوَانَةُ عَلَى وَجْهِهَا؟'], after: ['exp.stamp.cyl.after', 'دَائِرَةٌ! وَجْهُ الأُسْطُوَانَةِ دَائِرِيٌّ.'] },
      { s: { solid: 'cone', size: 92 }, print: 'circle', ask: ['exp.stamp.cone', 'وَالمَخْرُوطُ عَلَى قَاعِدَتِهِ؟'], after: ['exp.stamp.cone.after', 'دَائِرَةٌ أَيْضًا! قَاعِدَةُ المَخْرُوطِ دَائِرِيَّةٌ.'] },
      { s: { solid: 'sphere', size: 80 }, print: 'dot', ask: ['exp.stamp.sphere', 'وَالكُرَةُ؟'], after: ['exp.stamp.sphere.after', 'نُقْطَةٌ صَغِيرَةٌ فَقَطْ: لَيْسَ لِلْكُرَةِ وَجْهٌ مُسَطَّحٌ يَتْرُكُ بَصْمَةً.'] },
    ];
    for (const R of rounds) { const svg = newStage(300, { city: false }); floorLine(svg, 236);
      const pv = placeOnFloor(svg, R.s, 72, 170); say('compass', ...R.ask);
      const k = await choosePick(PR, R.print); logAttempt({ scene: 'explore', tag: 'stamp-' + R.s.solid, ok: k === R.print }); pv.remove();
      await stampTest(svg, R.s, R.print); await say('compass', ...R.after); }
    await say('compass', 'exp.stamp.rule', 'الوُجُوهُ المُسَطَّحَةُ لِلْمُجَسَّمِ تَتْرُكُ بَصْمَةً مُسَطَّحَةً: مُرَبَّعًا أَوْ دَائِرَةً.');
  },
  worked: [
    async (svg) => { svg.innerHTML = ''; backdrop(svg, 300, { cityOpacity: .12 }); el('g', {}, svg);
      await say('compass', 'wk.01', '{شَاهِدْ|شَاهِدِي}: نُدِيرُ المُرَبَّعَ الوَرَقِيَّ وَالمُكَعَّبَ مَعًا.'); await edgeTurn(svg);
      await say('compass', 'wk.02', 'المُرَبَّعُ الوَرَقِيُّ صَارَ خَطًّا رَقِيقًا: لَيْسَ لَهُ سُمْكٌ. وَالمُكَعَّبُ بَقِيَ كُتْلَةً تَمْلَأُ الكَفَّ.'); },
    async (svg) => { svg.innerHTML = ''; backdrop(svg, 300, { cityOpacity: .12 });
      thingAt(svg, { type: 'circle', size: 92, color: css('--circle') }, 70, 120); thingAt(svg, { sheet: true, draw: 'square' }, 180, 120); thingAt(svg, { solid: 'cylinder', size: 110 }, 292, 120);
      label(svg, 70, 216, 'مُسَطَّح', 17); label(svg, 180, 216, 'مُسَطَّح', 17); label(svg, 292, 216, 'مُجَسَّم', 17);
      await say('compass', 'wk.03', 'المُسَطَّحُ نَرْسُمُهُ وَنَقُصُّهُ مِنَ الوَرَقِ، رَقِيقٌ بِلَا سُمْكٍ. وَالمُجَسَّمُ يَمْلَأُ كَفَّنَا، وَلَهُ سُمْكٌ.'); },
  ],
  sort: {
    kindOf: item => (item.solid || item.ball) ? 'solid' : 'flat',
    errorOf(item, bin) { if (item.kind === 'flat') return item.sheet ? 'drawnFlat' : 'flatAsSolid'; return 'solidAsFlat'; },
    reason(item) { return item.kind === 'solid' ? W('why.solid') : item.sheet ? W('why.drawn') : W('why.flat3'); },
    twin(item) { return item.kind === 'solid' ? MK2.ball : item.sheet ? MK2.sheetCircle : MK2.flatSquare; },
    async recall() { const svg = newStage(300); await edgeTurn(svg);
      await say('compass', 'ms.recall', 'المُسَطَّحُ يَصِيرُ خَطًّا رَقِيقًا إِذَا أَدَرْنَاهُ، وَالمُجَسَّمُ يَبْقَى كُتْلَةً تَمْلَأُ الكَفَّ.'); },
  },
  async build() {
    const svg = newStage(300, { city: false });
    say('compass', 'build.01', 'هَيَّا نَبْنِي بُرْجًا مِنَ المُجَسَّمَاتِ! {اِلْمَسْ|اِلْمَسِي} مُجَسَّمًا فَيَنْزِلُ فَوْقَ البُرْجِ. نُرِيدُ خَمْسَةَ طَوَابِقَ.');
    const stack = await towerBuilder(svg, { goal: 5,
      sphereLine: ['build.sphere', 'تَدَحْرَجَتِ الكُرَةُ، فَسَقَطَ مَا فَوْقَهَا! الكُرَةُ لَا تَصْلُحُ تَحْتَ شَيْءٍ.'],
      coneLine: ['build.cone', 'رَأْسُ المَخْرُوطِ مُدَبَّبٌ، لَا يَقِفُ عَلَيْهِ شَيْءٌ. المَخْرُوطُ يَصْلُحُ سَقْفًا فِي الأَعْلَى.'] });
    hush(); SFX.good(); await say('compass', 'build.ok', 'بُرْجٌ ثَابِتٌ!');
    say('compass', 'build.count', '{عُدَّ|عُدِّي}: كَمْ مُجَسَّمًا فِي {بُرْجِكَ|بُرْجِكِ}؟');
    const k = await choosePick([['4', DG(4)], ['5', DG(5)], ['6', DG(6)]], '5'); logAttempt({ scene: 'build', tag: 'count', ok: k === '5' });
    if (k !== '5') { await say('compass', 'build.countTogether', 'هَيَّا نَعُدُّ مَعًا.'); for (const [i, p] of stack.entries()) { badge(svg, 230, p.y - 8, i + 1); SFX.tick(); await say('compass', ...NUM[i], { noGap: true }); } }
    await say('compass', 'build.five', 'خَمْسَةُ مُجَسَّمَاتٍ!');
    await nextBtn(); await mosqueScene();   // عمارة المدينة: القبة والمئذنة (S1-U2 1.2)
  },
  async wrap(svg) { const t = el('g', {}, svg); let y = 244;
    for (const [k, sz] of [['cube', 70], ['cylinder', 64], ['cube', 62], ['cylinder', 56], ['cone', 66]]) { const g = thingAt(t, { solid: k, size: sz, color: SOLIDC[k] }, 180, 0); const bb = g.getBBox(); const yy = y - (bb.y + bb.height) + 4; g.setAttribute('transform', `translate(180 ${yy})`); y = yy + bb.y + 10; }
    t.animate([{ transform: 'translate(0px,260px)' }, { transform: 'translate(0px,0px)' }], { duration: 1000, delay: 250, fill: 'both', easing: 'cubic-bezier(.3,1.3,.6,1)' }); },
})));

/* ---------------- [m1.u2.d4] الدرس 4: مراجعة وتحدٍّ (D30، D178) ---------------- */
const T2 = c => ({ ...c, color: NEUTRAL[(colorIx++) % NEUTRAL.length] });
function badgeArt2(svg) { const b = el('g', { transform: 'translate(150 160)' }, svg);
  el('circle', { r: 70, fill: '#cfe6c9', stroke: '#fff', 'stroke-width': 5, filter: 'url(#pp)' }, b); el('circle', { r: 54, fill: '#eef8e8' }, b);
  [['cube', -22, -14], ['sphere', 22, -14], ['cylinder', -22, 24], ['cone', 22, 22]].forEach(([k, x, y]) => thingAt(b, { solid: k, size: 34 }, x, y));
  label(svg, 150, 258, 'شَارَةُ بَانِي العَالَمِ', 17); return b; }
LESSONS.push(lesson('m1.u2.d4', W => ({
  test: { art: badgeArt2 },
  async hook() {
    const svg = newStage(300, { cityOpacity: .3 });
    [['cube', 90, 120, -20], ['sphere', 250, 90, 0], ['cylinder', 180, 190, 30], ['cone', 290, 200, -40]].forEach(([k, x, y, r]) => { const g = thingAt(svg, { solid: k, size: 70 }, x, y);
      g.animate([{ transform: `translate(${x}px,${y}px) rotate(${r}deg)` }, { transform: `translate(${x}px,${y - 10}px) rotate(${-r}deg)` }], { duration: 1200, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' }); });
    await lines([['chaos', 'hook.01', 'خَلَطْتُ مُجَسَّمَاتِ المَدِينَةِ كُلَّهَا! مَنْ يُجِيبُ عَنْ ثَمَانِيَةِ أَسْئِلَةٍ يَرْبَحُ شَارَةَ بَانِي العَالَمِ.'],
      ['compass', 'hook.02', '{لَا تَقْلَقْ|لَا تَقْلَقِي}! هَيَّا نَتَذَكَّرُ أَوَّلًا.']]);
  },
  async explore() {
    const svg = newStage(300, { cityOpacity: .15 });
    const cards = [['cube', ['rv.cube', 'المُكَعَّبُ: وُجُوهُهُ مُسَطَّحَةٌ، وَيَقِفُ ثَابِتًا.']], ['sphere', ['rv.sphere', 'الكُرَةُ: سَطْحُهَا مُنْحَنٍ، وَتَتَدَحْرَجُ فِي كُلِّ اتِّجَاهٍ.']],
      ['cylinder', ['rv.cylinder', 'الأُسْطُوَانَةُ: وَجْهَانِ دَائِرِيَّانِ، تَقِفُ وَتَتَدَحْرَجُ فِي خَطٍّ مُسْتَقِيمٍ.']], ['cone', ['rv.cone', 'المَخْرُوطُ: رَأْسٌ مُدَبَّبٌ وَقَاعِدَةٌ دَائِرِيَّةٌ.']]];
    for (const [i, [k, [id, t]]] of cards.entries()) { const x = 315 - i * 90; const g = thingAt(svg, { solid: k, size: 80 }, x, 130);
      g.animate([{ transform: `translate(${x}px,130px) scale(.3)` }, { transform: `translate(${x}px,130px) scale(1.12)` }, { transform: `translate(${x}px,130px) scale(1)` }], { duration: 500, fill: 'both' }); await say('compass', id, t); }
    await say('compass', 'rv.flat', 'وَالمُسَطَّحُ نَرْسُمُهُ وَنَقُصُّهُ مِنَ الوَرَقِ، أَمَّا المُجَسَّمُ فَيَمْلَأُ الكَفَّ.');
  },
  worked: [],
})));

