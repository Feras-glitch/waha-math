/* =====================================================================
   الدروس
   ===================================================================== */
const unitOf = L => L.id.split('.').slice(0, 2).join('.');
const LESSONS = [];

/* ---------------- [m1.u1.d1] الدرس 1: الدائرة والمربع ---------------- */
LESSONS.push(lesson('m1.u1.d1', W => ({
  async hook() {
    const svg = newStage(300, { cityOpacity: .3 });
    el('rect', { x: 0, y: 136, width: 360, height: 8, fill: css('--line') }, svg);
    const cart = (y, wheel, lbl) => { const g = el('g', { transform: `translate(250 ${y})`, tabindex: 0, role: 'button', 'aria-label': lbl, style: 'cursor:pointer' }, svg);
      const body = el('g', { filter: 'url(#pp)' }, g); el('rect', { x: -56, y: -50, width: 112, height: 44, rx: 12, fill: '#f2b33d', stroke: '#fff', 'stroke-width': 4 }, body); el('rect', { x: -56, y: -50, width: 112, height: 44, rx: 12, fill: 'url(#shine)' }, body);
      el('line', { x1: 40, y1: -50, x2: 40, y2: -86, stroke: '#9c6837', 'stroke-width': 3 }, g); el('polygon', { points: '40,-86 66,-78 40,-70', fill: '#d9483b' }, g);
      const ws = []; for (const wx of [-32, 32]) { const w = el('g', { transform: `translate(${wx} 0)` }, g); w.dataset.wx = wx;
        if (wheel === 'circle') { el('circle', { r: 17, fill: css('--circle'), stroke: '#fff', 'stroke-width': 3 }, w); el('line', { x1: -10, y1: 0, x2: 10, y2: 0, stroke: '#fff', 'stroke-width': 2 }, w); }
        else { el('rect', { x: -16, y: -16, width: 32, height: 32, fill: css('--square'), stroke: '#fff', 'stroke-width': 3 }, w); }
        el('circle', { r: 3.5, fill: '#1b3440' }, w); ws.push(w); }
      return { g, ws }; };
    const top = cart(118, 'circle', 'العربة ذات العجلات الدائرية'), bot = cart(250, 'square', 'العربة ذات العجلات المربعة');
    const choiceP = new Promise(res => { top.g.onclick = () => res('circle'); bot.g.onclick = () => res('square');
      top.g.onkeydown = e => { if (e.key === 'Enter') res('circle'); }; bot.g.onkeydown = e => { if (e.key === 'Enter') res('square'); }; });
    let early = false; choiceP.then(() => early = true);
    await say('chaos', 'hook.01', 'هِيهِي! صَنَعْتُ عَرَبَتَيْنِ: عَجَلَاتُ الأُولَى دَوَائِرُ، وَعَجَلَاتُ الثَّانِيَةِ مُرَبَّعَاتٌ!');
    if (!early) await say('compass', 'hook.02', 'هَيَّا نَتَوَقَّعْ: أَيُّ عَرَبَةٍ سَتَسِيرُ بِسُهُولَةٍ؟ {اِلْمَسْهَا|اِلْمَسِيهَا}.');
    const choice = await choiceP; top.g.onclick = bot.g.onclick = null; logAttempt({ scene: 'hook', tag: 'predict', ok: choice === 'circle' }); SFX.tick();
    await say('compass', ...(choice === 'circle' ? ['hook.03a', 'تَوَقُّعٌ جَمِيلٌ! هَيَّا نُشَاهِدْ.'] : ['hook.03b', 'هَيَّا نُشَاهِدْ مَا يَحْدُثُ.']));
    const dur = FAST ? 200 : 3200;
    top.g.animate([{ transform: 'translate(250px,118px)' }, { transform: 'translate(70px,118px)' }], { duration: dur, fill: 'forwards', easing: 'linear' });
    top.ws.forEach(w => w.animate([{ transform: `translate(${w.dataset.wx}px,0px) rotate(0deg)` }, { transform: `translate(${w.dataset.wx}px,0px) rotate(-720deg)` }], { duration: dur, fill: 'forwards' }));
    const hops = []; for (let k = 0; k <= 8; k++) hops.push({ transform: `translate(${250 - k * 10}px, ${250 - (k % 2 ? 12 : 0)}px) rotate(${k % 2 ? -4 : 0}deg)` });
    bot.g.animate(hops, { duration: dur, fill: 'forwards', easing: 'steps(8, end)' });
    setTimeout(() => SFX.soft(), FAST ? 50 : 900); await sleep(dur + 200);
    await lines([['compass', 'hook.04', 'العَرَبَةُ ذَاتُ العَجَلَاتِ الدَّائِرِيَّةِ سَارَتْ بِسُهُولَةٍ، وَالأُخْرَى تَعَثَّرَتْ.'],
      ['chaos', 'hook.05', 'أُوه! لِمَاذَا تَتَعَثَّرُ عَرَبَتِي؟'], ['compass', 'hook.06', 'هَذَا مَا سَنَكْتَشِفُهُ الآنَ بِأَصَابِعِنَا.']]);
  },
  async explore() {
    const svg = newStage(300, { cityOpacity: .25 });
    const P = traceTool(svg, [{ type: 'circle', size: 124, color: css('--circle'), x: 92, y: 140, caption: true, capY: 252 }, { type: 'square', size: 124, color: css('--square'), x: 268, y: 140, caption: true, capY: 252 }]);
    await say('compass', 'exp.01', '{مَرِّرْ إِصْبَعَكَ|مَرِّرِي إِصْبَعَكِ} عَلَى حَافَّةِ كُلِّ شَكْلٍ، دَوْرَةً كَامِلَةً. أَيْنَ يَتَوَقَّفُ الإِصْبَعُ؟');
    await P;
    await lines([['compass', 'exp.03', 'عَلَى الدَّائِرَةِ مَرَّ الإِصْبَعُ بِسُهُولَةٍ: حَافَّتُهَا مُنْحَنِيَةٌ، وَلَا رُؤُوسَ لَهَا.'],
      ['compass', 'exp.04', 'وَعَلَى المُرَبَّعِ تَوَقَّفَ أَرْبَعَ مَرَّاتٍ. النُّقْطَةُ الَّتِي يَتَوَقَّفُ عِنْدَهَا الإِصْبَعُ اسْمُهَا: رَأْسٌ. لِلْمُرَبَّعِ أَرْبَعَةُ رُؤُوسٍ، وَحَوَافُّهُ مُسْتَقِيمَةٌ.'], ['chaos', 'exp.05', 'آه! لِذَلِكَ تَعَثَّرَتْ عَرَبَتِي عِنْدَ الرُّؤُوسِ!']]);
  },
  worked: [
    async (svg, st) => { st.sq = shapeAt(svg, { type: 'square', size: 124, color: css('--square') }, 180, 140); await say('compass', 'wk.01', 'هَذَا مُرَبَّعٌ. نَعُدُّ رُؤُوسَهُ مَعًا…');
      st.m = el('g', {}, svg); for (const [k, [x, y]] of [[-62, -62], [62, -62], [62, 62], [-62, 62]].entries()) { badge(st.m, 180 + x, 140 + y, k + 1); SFX.tick(); await sleep(520); }
      await say('compass', 'wk.02', 'أَرْبَعَةُ رُؤُوسٍ، وَحَوَافُّهُ مُسْتَقِيمَةٌ.'); },
    async (svg, st) => { st.m.remove(); await say('chaos', 'wk.03', 'سَأُدَوِّرُهُ… هَا! صَارَ شَكْلًا آخَرَ!');
      st.sq.animate([{ transform: 'translate(180px,140px) rotate(0deg)' }, { transform: 'translate(180px,140px) rotate(45deg)' }], { duration: FAST ? 50 : 1200, fill: 'forwards', easing: 'ease-in-out' }); await sleep(1300); },
    async (svg, st) => { await say('compass', 'wk.04', 'هَيَّا نَعُدُّ مِنْ جَدِيدٍ.'); st.m = el('g', {}, svg);
      for (const [k, [x, y]] of [[0, -88], [88, 0], [0, 88], [-88, 0]].entries()) { badge(st.m, 180 + x, 140 + y, k + 1); SFX.tick(); await sleep(520); }
      await say('compass', 'wk.05', 'مَا زَالَ لَهُ أَرْبَعَةُ رُؤُوسٍ، وَحَوَافُّهُ مُسْتَقِيمَةٌ. فَهُوَ مَا زَالَ مُرَبَّعًا!'); },
    async (svg, st) => { st.m.remove(); st.sq.animate([{ transform: 'translate(180px,140px) rotate(45deg)' }, { transform: 'translate(64px,140px) rotate(45deg) scale(.5)' }], { duration: 700, fill: 'forwards' });
      const a = shapeAt(svg, { type: 'square', size: 64, rot: 15, color: NEUTRAL[0] }, 180, 140), b = shapeAt(svg, { type: 'square', size: 96, color: NEUTRAL[1] }, 290, 140);
      [a, b].forEach(x => x.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600 }));
      await say('compass', 'wk.06', 'وَالمُرَبَّعُ يَكُونُ صَغِيرًا أَوْ كَبِيرًا، مُدَوَّرًا أَوْ مُسْتَقِيمًا، وَبِأَيِّ لَوْنٍ.'); },
    async (svg) => { svg.innerHTML = ''; backdrop(svg, 300, { cityOpacity: .25 }); shapeAt(svg, { type: 'circle', size: 140, color: css('--circle') }, 180, 140);
      const dot = el('circle', { cx: 250, cy: 140, r: 9, fill: css('--compass'), stroke: '#fff', 'stroke-width': 3 }, svg);
      const sp = say('compass', 'wk.07', 'وَالدَّائِرَةُ؟ حَافَّتُهَا مُنْحَنِيَةٌ كُلُّهَا، وَلَا رُؤُوسَ لَهَا، مَهْمَا دَوَّرْنَاهَا.');
      for (let a = 0; a <= 360; a += 4) { const r = a * Math.PI / 180; dot.setAttribute('cx', 180 + 70 * Math.cos(r)); dot.setAttribute('cy', 140 + 70 * Math.sin(r)); await sleep(18); } await sp; },
  ],
  sort: {
    errorOf(item, bin) { if (item.tag === 'squareRot') return 'rotatedSquare'; if (item.tag === 'oval' && bin === 'circle') return 'ovalAsCircle'; if (item.kind === 'circle') return 'curvedEdge'; if (item.kind === 'square') return 'countCorners'; return 'generic'; },
    showErr(err, item, g, svg) { if (err === 'rotatedSquare') straighten(g, item); if (err === 'ovalAsCircle') { const c = el('circle', { cx: 180, cy: 104, r: item.size / 2, fill: 'none', stroke: css('--circle'), 'stroke-width': 4, 'stroke-dasharray': '8 6' }, svg); c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400 }); } },
    reason(item) { if (item.kind === 'square') return item.rot ? W('why.sqRot') : W('why.sq');
      if (item.kind === 'circle') return W('why.c'); return item.tag === 'oval' ? W('why.oval') : W('why.tri'); },
    twin(item) { return { squareRot: () => MK.squareRot(), squareUp: () => MK.squareRot(), circle: MK.circle, oval: MK.oval }[item.tag] || MK.circle; },
    async recall() { const svg = newStage(300); const g = shapeAt(svg, { type: 'square', size: 124, rot: 40, color: css('--square') }, 180, 140);
      g.animate([{ transform: 'translate(180px,140px) rotate(40deg)' }, { transform: 'translate(180px,140px) rotate(0deg)' }], { duration: 1200, fill: 'forwards' });
      await say('compass', 'ms.recall', 'المُرَبَّعُ المُدَوَّرُ مَا زَالَ مُرَبَّعًا: أَرْبَعَةُ رُؤُوسٍ. وَالدَّائِرَةُ مُتَسَاوِيَةٌ مِنْ كُلِّ الجِهَاتِ بِلَا رُؤُوسٍ.'); },
  },
  async wrap(svg) { for (let i = 0; i < 9; i++) { const r = el('rect', { x: 64 + i * 26, y: 236, width: 22, height: 22, rx: 2, fill: css('--square'), stroke: '#fff', 'stroke-width': 2, opacity: 0 }, svg);
      r.animate([{ opacity: 0, transform: 'translateY(-16px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 380, delay: 150 + i * 80, fill: 'forwards' }); }
    const f = el('g', { transform: 'translate(180 176)' }, svg); el('circle', { r: 58, fill: css('--circle'), stroke: '#fff', 'stroke-width': 4, filter: 'url(#pp)' }, f); el('circle', { r: 40, fill: '#9fd4ea' }, f);
    const jet = el('path', { d: 'M0 -6 Q-14 -50 -30 -24 M0 -6 Q14 -50 30 -24 M0 -6 L0 -56', stroke: '#9fd4ea', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, f);
    jet.animate([{ opacity: .6 }, { opacity: 1 }], { duration: 700, iterations: Infinity, direction: 'alternate' });
    f.animate([{ transform: 'translate(180px,176px) scale(0)' }, { transform: 'translate(180px,176px) scale(1.08)' }, { transform: 'translate(180px,176px) scale(1)' }], { duration: 900, delay: 700, fill: 'both', easing: 'ease-out' }); },
})));

/* ---------------- [m1.u1.d2] الدرس 2: المثلث (يدخل مصطلح «ضلع») ---------------- */
LESSONS.push(lesson('m1.u1.d2', W => ({
  async hook() {
    const svg = newStage(300, { cityOpacity: .25 });
    const house = el('g', { filter: 'url(#pp)' }, svg); el('rect', { x: 120, y: 150, width: 120, height: 104, fill: '#f4a38e', stroke: '#fff', 'stroke-width': 4 }, house); el('rect', { x: 166, y: 204, width: 28, height: 50, fill: '#9c6837' }, house);
    el('polygon', { points: '112,150 180,82 248,150', fill: 'none', stroke: css('--ink'), 'stroke-width': 3, 'stroke-dasharray': '9 7', opacity: .55 }, svg);
    const tri = shapeAt(svg, { type: 'triangle', w: 136, h: 68, color: css('--triangle') }, 72, 52); const sq = shapeAt(svg, { type: 'square', size: 64, color: css('--square') }, 292, 52);
    [[tri, 'triangle', 'قطعة مثلثة'], [sq, 'square', 'قطعة مربعة']].forEach(([g, k, l]) => { g.setAttribute('role', 'button'); g.setAttribute('tabindex', 0); g.setAttribute('aria-label', l); g.style.cursor = 'pointer'; g.dataset.k = k; });
    const pickP = () => new Promise(res => { tri.onclick = () => res('triangle'); sq.onclick = () => res('square'); });
    let p = pickP(); let early = false; p.then(() => early = true);
    await say('chaos', 'hook.01', 'سَأَضَعُ هَذَا المُرَبَّعَ سَقْفًا لِلْبَيْتِ! أَلَيْسَ جَمِيلًا؟');
    if (!early) await say('compass', 'hook.02', 'أَيُّ قِطْعَةٍ تُنَاسِبُ مَكَانَ السَّقْفِ؟ {اِلْمَسْهَا|اِلْمَسِيهَا}.');
    let choice = await p; logAttempt({ scene: 'hook', tag: 'predict', ok: choice === 'triangle' });
    if (choice === 'square') { sq.animate([{ transform: 'translate(292px,52px)' }, { transform: 'translate(180px,118px)' }, { transform: 'translate(180px,118px) rotate(8deg)' }, { transform: 'translate(292px,52px)' }], { duration: FAST ? 80 : 1600 }); SFX.soft();
      await say('compass', 'hook.03b', 'المُرَبَّعُ لَا يُنَاسِبُ هَذَا المَكَانَ، تَبْقَى فَرَاغَاتٌ. هَيَّا نُجَرِّبُ الأُخْرَى.'); await new Promise(res => tri.onclick = () => res()); }
    tri.onclick = sq.onclick = null; SFX.good();
    tri.animate([{ transform: 'translate(72px,52px)' }, { transform: 'translate(180px,116px)' }], { duration: FAST ? 80 : 900, fill: 'forwards', easing: 'cubic-bezier(.3,1.4,.6,1)' }); await sleep(950);
    await lines([['compass', 'hook.04', 'تَمَامًا! السَّقْفُ مُثَلَّثٌ.'], ['compass', 'hook.05', 'مَا الَّذِي يَجْعَلُ المُثَلَّثَ مُخْتَلِفًا؟ هَيَّا نَكْتَشِفُ.']]);
  },
  async explore() {
    const svg = newStage(300, { cityOpacity: .2 });
    const P = traceTool(svg, [{ type: 'triangle', w: 190, h: 170, color: css('--triangle'), x: 180, y: 140, caption: true, capY: 272 }],
      { sides: true, sidesIntro: ['exp.sides', 'ثَلَاثَةُ رُؤُوسٍ! وَالحَافَّةُ المُسْتَقِيمَةُ بَيْنَ رَأْسَيْنِ اسْمُهَا: ضِلْعٌ. {اِلْمَسْ|اِلْمَسِي} كُلَّ ضِلْعٍ لِنَعُدَّهَا.'] });
    await say('compass', 'exp.01', '{مَرِّرْ إِصْبَعَكَ|مَرِّرِي إِصْبَعَكِ} عَلَى حَافَّةِ المُثَلَّثِ. أَيْنَ يَتَوَقَّفُ الإِصْبَعُ؟');
    await P;
    await say('compass', 'exp.03', 'لِلْمُثَلَّثِ ثَلَاثَةُ أَضْلَاعٍ مُسْتَقِيمَةٍ، وَثَلَاثَةُ رُؤُوسٍ.');
  },
  worked: [
    async (svg, st) => { st.t = shapeAt(svg, { type: 'triangle', w: 170, h: 150, color: css('--triangle') }, 180, 140); await say('compass', 'wk.01', 'هَذَا مُثَلَّثٌ: نَعُدُّ أَضْلَاعَهُ…');
      st.m = el('g', {}, svg); for (const [k, [x, y]] of [[42, -2], [0, 75], [-42, -2]].entries()) { badge(st.m, 180 + x, 140 + y, k + 1, css('--triangle')); SFX.tick(); await sleep(520); }
      await say('compass', 'wk.02', 'ثَلَاثَةُ أَضْلَاعٍ، وَثَلَاثَةُ رُؤُوسٍ.'); },
    async (svg, st) => { st.m.remove(); await say('chaos', 'wk.03', 'سَأَقْلِبُهُ… هَا! لَمْ يَعُدْ مُثَلَّثًا!');
      st.t.animate([{ transform: 'translate(180px,140px) rotate(0deg)' }, { transform: 'translate(180px,140px) rotate(180deg)' }], { duration: FAST ? 50 : 1200, fill: 'forwards', easing: 'ease-in-out' }); await sleep(1300); },
    async (svg, st) => { await say('compass', 'wk.04', 'هَيَّا نَعُدُّ: وَاحِدٌ، اثْنَانِ، ثَلَاثَةٌ.'); st.m = el('g', {}, svg);
      for (const [k, [x, y]] of [[-42, 2], [0, -75], [42, 2]].entries()) { badge(st.m, 180 + x, 140 + y, k + 1, css('--triangle')); SFX.tick(); await sleep(520); }
      await say('compass', 'wk.05', 'ثَلَاثَةُ أَضْلَاعٍ وَثَلَاثَةُ رُؤُوسٍ: مَا زَالَ مُثَلَّثًا!'); },
    async (svg, st) => { st.m.remove(); st.t.animate([{ transform: 'translate(180px,140px) rotate(180deg)' }, { transform: 'translate(60px,140px) rotate(180deg) scale(.5)' }], { duration: 700, fill: 'forwards' });
      const a = shapeAt(svg, { type: 'triangle', w: 60, h: 150, color: NEUTRAL[0], rot: 10 }, 170, 140), b = shapeAt(svg, { type: 'triangle', w: 120, h: 70, apex: -1, color: NEUTRAL[1] }, 285, 150);
      [a, b].forEach(x => x.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600 }));
      await say('compass', 'wk.06', 'وَالمُثَلَّثُ يَكُونُ طَوِيلًا رَفِيعًا أَوْ عَرِيضًا، كَبِيرًا أَوْ صَغِيرًا.'); },
    async (svg) => { svg.innerHTML = ''; backdrop(svg, 300, { cityOpacity: .2 });
      shapeAt(svg, { type: 'curvedTri', size: 120, color: NEUTRAL[2] }, 95, 130); shapeAt(svg, { type: 'openTri', size: 120, color: NEUTRAL[3] }, 265, 130);
      for (const x of [95, 265]) { const c = el('g', { transform: `translate(${x} 228)` }, svg); el('circle', { r: 16, fill: css('--think') }, c); el('path', { d: 'M-7 -7l14 14M7 -7l-14 14', stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round' }, c); }
      await say('compass', 'wk.07', '{اِنْتَبِهْ|اِنْتَبِهِي}: إِذَا انْحَنَتْ إِحْدَى الحَوَافِّ، أَوْ كَانَ الشَّكْلُ مَفْتُوحًا، فَلَيْسَ مُثَلَّثًا.'); },
  ],
  sort: {
    errorOf(item, bin) { if (item.tag === 'triFlip') return 'flipped'; if (item.tag === 'triThin') return 'thin'; if (item.tag === 'curvedTri') return 'curved'; if (item.tag === 'openTri') return 'open'; if (item.kind === 'square') return 'fourCorners'; return 'generic'; },
    showErr(err, item, g) { if (err === 'flipped' || err === 'thin') straighten(g, item); },
    reason(item) { if (item.kind === 'triangle') return W('why.t'); if (item.kind === 'square') return W('why.sq');
      return item.tag === 'open' || item.tag === 'openTri' ? W('why.open') : W('why.curved'); },
    twin(item) { return { triFlip: MK.triFlip, triThin: MK.triWide, curvedTri: MK.curvedTri, openTri: MK.openTri, triUp: MK.triFlip }[item.tag] || MK.triFlip; },
    async recall() { const svg = newStage(300); const g = shapeAt(svg, { type: 'triangle', w: 170, h: 150, rot: 180, color: css('--triangle') }, 180, 140);
      g.animate([{ transform: 'translate(180px,140px) rotate(180deg)' }, { transform: 'translate(180px,140px) rotate(0deg)' }], { duration: 1200, fill: 'forwards' });
      await say('compass', 'ms.recall', 'المُثَلَّثُ المَقْلُوبُ مَا زَالَ مُثَلَّثًا: ثَلَاثَةُ أَضْلَاعٍ مُسْتَقِيمَةٍ. وَالشَّكْلُ المَفْتُوحُ أَوِ المُنْحَنِي لَيْسَ مُثَلَّثًا.'); },
  },
  async wrap(svg) { for (const [i, x] of [70, 180, 290].entries()) { const h = el('g', { transform: `translate(${x} 240)`, opacity: 0 }, svg);
      el('rect', { x: -34, y: -60, width: 68, height: 60, fill: ['#f4a38e', '#7cc4b8', '#f6cf7e'][i], stroke: '#fff', 'stroke-width': 3, filter: 'url(#pp)' }, h); el('rect', { x: -8, y: -26, width: 16, height: 26, fill: '#9c6837' }, h);
      el('polygon', { points: '-42,-60 0,-104 42,-60', fill: css('--triangle'), stroke: '#fff', 'stroke-width': 3, filter: 'url(#pp)' }, h);
      h.animate([{ opacity: 0, transform: `translate(${x}px,270px)` }, { opacity: 1, transform: `translate(${x}px,240px)` }], { duration: 600, delay: 300 + i * 350, fill: 'forwards', easing: 'cubic-bezier(.3,1.4,.6,1)' }); } },
})));

/* ---------------- [m1.u1.d3] الدرس 3: المستطيل (ومقارنة الأطوال من بداية مشتركة C014) ---------------- */
LESSONS.push(lesson('m1.u1.d3', W => ({
  async hook() {
    const svg = newStage(300, { cityOpacity: .25 });
    const door = (x, w, h, lbl) => { const g = el('g', { transform: `translate(${x} 266)`, tabindex: 0, role: 'button', 'aria-label': lbl, style: 'cursor:pointer' }, svg);
      el('rect', { x: -w / 2 - 10, y: -h - 10, width: w + 20, height: h + 10, fill: '#cfd8dc', stroke: '#fff', 'stroke-width': 3, filter: 'url(#pp)' }, g); el('rect', { x: -w / 2, y: -h, width: w, height: h, fill: '#9c6837' }, g); el('circle', { cx: w / 2 - 10, cy: -h / 2, r: 4, fill: '#f6cf7e' }, g); return g; };
    const sqd = door(90, 80, 80, 'الباب المربع'), rcd = door(262, 70, 180, 'الباب الطويل');
    const giraffe = el('g', { transform: 'translate(180 268)' }, svg);
    giraffe.innerHTML = `<g><rect x="-22" y="-56" width="44" height="34" rx="12" fill="#f6cf7e" stroke="#c98f55" stroke-width="2"/><rect x="6" y="-150" width="14" height="100" rx="7" fill="#f6cf7e" stroke="#c98f55" stroke-width="2"/>
      <ellipse cx="18" cy="-158" rx="17" ry="11" fill="#f6cf7e" stroke="#c98f55" stroke-width="2"/><circle cx="24" cy="-161" r="2.5" fill="#1b3440"/><path d="M10 -168 l-2 -10 M18 -169 l1 -10" stroke="#9c6837" stroke-width="3" stroke-linecap="round"/>
      <circle cx="-8" cy="-42" r="4" fill="#c98f55"/><circle cx="8" cy="-36" r="3.5" fill="#c98f55"/><circle cx="12" cy="-110" r="3" fill="#c98f55"/><circle cx="14" cy="-80" r="3" fill="#c98f55"/>
      <path d="M-16 -22v22M-6 -22v22M8 -22v22M18 -22v22" stroke="#c98f55" stroke-width="5" stroke-linecap="round"/></g>`;
    const choiceP = new Promise(res => { sqd.onclick = () => res('square'); rcd.onclick = () => res('rect'); });
    let early = false; choiceP.then(() => early = true);
    await say('chaos', 'hook.01', 'بَنَيْتُ لِلْمَدِينَةِ بَابًا مُرَبَّعًا جَمِيلًا!');
    if (!early) await say('compass', 'hook.02', 'جَاءَتِ الزَّرَافَةُ تَزُورُنَا. مِنْ أَيِّ بَابٍ تَدْخُلُ؟ {اِلْمَسْهُ|اِلْمَسِيهِ}.');
    const choice = await choiceP; logAttempt({ scene: 'hook', tag: 'predict', ok: choice === 'rect' }); SFX.tick();
    if (choice === 'square') { giraffe.animate([{ transform: 'translate(180px,268px)' }, { transform: 'translate(118px,268px)' }, { transform: 'translate(124px,268px) rotate(-6deg)' }, { transform: 'translate(180px,268px)' }], { duration: FAST ? 80 : 1800 }); SFX.soft();
      await say('compass', 'hook.03b', 'رَأْسُهَا لَا يَمُرُّ! البَابُ المُرَبَّعُ قَصِيرٌ. وَالآخَرُ؟'); await sleep(400); }
    giraffe.animate([{ transform: 'translate(180px,268px)' }, { transform: 'translate(262px,268px)' }, { transform: 'translate(262px,268px) scale(.01)' }], { duration: FAST ? 80 : 1800, fill: 'forwards' }); SFX.good(); await sleep(1900);
    await lines([['compass', 'hook.04', 'البَابُ الطَّوِيلُ مُسْتَطِيلٌ: لَهُ ضِلْعَانِ طَوِيلَانِ وَضِلْعَانِ قَصِيرَانِ.'], ['chaos', 'hook.05', 'وَكَيْفَ نَعْرِفُ الطَّوِيلَ مِنَ القَصِيرِ؟']]);
  },
  async explore() {
    // (أ) مقارنة طولين: نحاذي البدايتين أولاً
    const svg = newStage(300, { cityOpacity: .15 });
    el('line', { x1: 300, y1: 40, x2: 300, y2: 250, stroke: css('--ink'), 'stroke-width': 3, 'stroke-dasharray': '6 6', opacity: .5 }, svg); label(svg, 300, 274, 'خَطُّ البِدَايَةِ', 15);
    const stick = (y, len, x0, col) => { const g = el('g', { transform: `translate(${x0} ${y})` }, svg); el('rect', { x: -len, y: -12, width: len, height: 24, rx: 12, fill: col, stroke: '#fff', 'stroke-width': 3, filter: 'url(#pp)' }, g); return g; };
    const A = stick(90, 200, 300, css('--rect')); const B = stick(180, 170, 260, css('--square'));   // الأزرق أقصر لكنه يبدو أبعد لأنه بدأ بعد الخط
    B.style.cursor = 'grab'; B.setAttribute('tabindex', 0); B.setAttribute('role', 'button'); B.setAttribute('aria-label', 'العود الأخضر: اسحبه إلى خط البداية');
    await say('compass', 'exp.a1', 'أَيُّ العُودَيْنِ أَطْوَلُ؟ قَبْلَ أَنْ نُقَارِنَ، {اِسْحَبِ|اِسْحَبِي} العُودَ الأَخْضَرَ حَتَّى يَبْدَأَ مِنَ الخَطِّ نَفْسِهِ.');
    await new Promise(res => { let d = null, x = 260; const snap = () => { B.setAttribute('transform', 'translate(300 180)'); SFX.good(); res(); };
      B.addEventListener('pointerdown', e => { d = e.clientX; B.setPointerCapture(e.pointerId); });
      B.addEventListener('pointermove', e => { if (d == null) return; const ctm = svg.getScreenCTM(); x = Math.max(200, Math.min(320, 260 + (e.clientX - d) / ctm.a)); B.setAttribute('transform', `translate(${x} 180)`); });
      B.addEventListener('pointerup', () => { d = null; if (Math.abs(x - 300) < 16) snap(); });
      B.addEventListener('keydown', e => { if (e.key === 'Enter') snap(); });
      armIdle(async () => { await say('compass', 'exp.a.demo', 'هَكَذَا: نَضَعُ بِدَايَتَهُ عَلَى الخَطِّ.'); B.animate([{ transform: 'translate(260px,180px)' }, { transform: 'translate(300px,180px)' }], { duration: 700 }); setTimeout(snap, 720); }); });
    disarmIdle();
    await say('compass', 'exp.a2', 'الآنَ البِدَايَتَانِ مَعًا. أَيُّهُمَا أَطْوَلُ؟ {اِلْمَسْهُ|اِلْمَسِيهِ}.');
    let tries = 0; await new Promise(res => { const act = async (ok) => { tries++; logAttempt({ scene: 'explore', tag: 'compare', ok, firstTry: tries === 1 }); if (ok) { SFX.good(); res(); } else { SFX.soft(); await say('compass', 'exp.a.no', 'لِنُفَكِّرْ مَعًا: {اُنْظُرْ|اُنْظُرِي} إِلَى النِّهَايَتَيْنِ، أَيُّهُمَا يَصِلُ أَبْعَدَ؟'); } };
      A.dataset.t = 'longer'; A.style.cursor = 'pointer'; A.onclick = () => act(true); B.onclick = () => act(false); });
    await say('compass', 'exp.a3', 'البُرْتُقَالِيُّ أَطْوَلُ. لَوْ لَمْ نُحَاذِ البِدَايَتَيْنِ لَخُدِعْنَا!');
    // (ب) تتبّع المستطيل وعدّ أضلاعه: طويلان وقصيران
    const svg2 = newStage(300, { cityOpacity: .15 });
    const P = traceTool(svg2, [{ type: 'rect', w: 230, h: 120, color: css('--rect'), x: 180, y: 140, caption: true, capY: 262 }],
      { sides: true, pairColors: true, sidesIntro: ['exp.sides', 'أَرْبَعَةُ رُؤُوسٍ! {اِلْمَسْ|اِلْمَسِي} كُلَّ ضِلْعٍ، وَ{لَاحِظِ|لَاحِظِي} الطَّوِيلَ وَالقَصِيرَ.'] });
    await say('compass', 'exp.b1', '{مَرِّرْ إِصْبَعَكَ|مَرِّرِي إِصْبَعَكِ} عَلَى حَافَّةِ المُسْتَطِيلِ، وَ{عُدَّ|عُدِّي} الرُّؤُوسَ.');
    await P;
    await say('compass', 'exp.b3', 'لِلْمُسْتَطِيلِ أَرْبَعَةُ أَضْلَاعٍ: ضِلْعَانِ طَوِيلَانِ مُتَقَابِلَانِ، وَضِلْعَانِ قَصِيرَانِ مُتَقَابِلَانِ.');
  },
  worked: [
    async (svg, st) => { st.r = shapeAt(svg, { type: 'rect', w: 220, h: 110, color: css('--rect') }, 180, 130); await say('compass', 'wk.01', 'نُقَارِنُ الضِّلْعَيْنِ الطَّوِيلَيْنِ: نَضَعُ أَحَدَهُمَا عَلَى الآخَرِ…');
      const c1 = el('rect', { x: 70, y: 71, width: 220, height: 8, rx: 4, fill: css('--compass') }, svg); c1.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(110px)' }, { transform: 'translateY(110px)' }, { transform: 'translateY(0)' }], { duration: FAST ? 60 : 2200, fill: 'forwards' }); await sleep(2300);
      await say('compass', 'wk.02', 'مُتَسَاوِيَانِ! وَالقَصِيرَانِ مُتَسَاوِيَانِ أَيْضًا.'); },
    async (svg, st) => { await say('chaos', 'wk.03', 'سَأُوقِفُهُ… صَارَ عَمُودًا، لَيْسَ مُسْتَطِيلًا!');
      st.r.animate([{ transform: 'translate(180px,130px) rotate(0deg)' }, { transform: 'translate(180px,140px) rotate(90deg)' }], { duration: FAST ? 50 : 1200, fill: 'forwards', easing: 'ease-in-out' }); await sleep(1300); },
    async () => { await say('compass', 'wk.04', 'مَا زَالَ لَهُ ضِلْعَانِ طَوِيلَانِ وَضِلْعَانِ قَصِيرَانِ: مُسْتَطِيلٌ وَاقِفٌ، مِثْلُ البَابِ!'); },
    async (svg) => { svg.innerHTML = ''; backdrop(svg, 300, { cityOpacity: .15 });
      shapeAt(svg, { type: 'rect', w: 150, h: 80, color: css('--rect') }, 100, 130); shapeAt(svg, { type: 'square', size: 110, color: css('--square') }, 272, 130);
      for (const [x, y] of [[100, 85], [100, 175]]) el('line', { x1: x - 10, y1: y - 6, x2: x + 10, y2: y + 6, stroke: css('--ink'), 'stroke-width': 3 }, svg);
      for (const [x, y, v] of [[272, 70, 0], [272, 190, 0], [212, 130, 1], [332, 130, 1]]) el('line', v ? { x1: x - 8, y1: y, x2: x + 8, y2: y, stroke: css('--ink'), 'stroke-width': 3 } : { x1: x, y1: y - 8, x2: x, y2: y + 8, stroke: css('--ink'), 'stroke-width': 3 }, svg);
      label(svg, 100, 230, 'مُسْتَطِيل'); label(svg, 272, 230, 'مُرَبَّع');
      await say('compass', 'wk.05', 'وَالمُرَبَّعُ؟ أَضْلَاعُهُ الأَرْبَعَةُ كُلُّهَا بِالطُّولِ نَفْسِهِ، فَنُسَمِّيهِ مُرَبَّعًا، لَا مُسْتَطِيلًا.'); },
  ],
  sort: {
    errorOf(item, bin) { if (item.kind === 'square' && bin === 'rect') return 'squareAsRect'; if (item.kind === 'rect' && bin === 'square') return 'rectAsSquare'; if (item.kind === 'rect') return item.rot ? 'rotatedRect' : 'standingRect'; if (item.kind === 'square') return 'equalSides'; return 'generic'; },
    showErr(err, item, g) { if (err === 'rotatedRect') straighten(g, item); },
    reason(item) { if (item.kind === 'rect') return W('why.r'); if (item.kind === 'square') return W('why.sq'); return W('why.o'); },
    twin(item) { return item.kind === 'square' ? () => MK.squareRot() : item.kind === 'rect' ? MK.rectRot : MK.curvedTri; },
    async recall() { const svg = newStage(300); shapeAt(svg, { type: 'rect', w: 90, h: 170, color: css('--rect') }, 110, 140); shapeAt(svg, { type: 'square', size: 120, color: css('--square') }, 260, 140);
      await say('compass', 'ms.recall', 'المُسْتَطِيلُ لَهُ ضِلْعَانِ طَوِيلَانِ وَضِلْعَانِ قَصِيرَانِ، وَاقِفًا أَوْ نَائِمًا. وَالمُرَبَّعُ أَضْلَاعُهُ كُلُّهَا مُتَسَاوِيَةٌ.'); },
  },
  async wrap(svg) { const b = el('g', { transform: 'translate(180 266)', opacity: 0 }, svg);
      el('rect', { x: -90, y: -170, width: 180, height: 170, fill: '#7cc4b8', stroke: '#fff', 'stroke-width': 4, filter: 'url(#pp)' }, b);
      for (const [x, y] of [[-66, -150], [-14, -150], [38, -150], [-66, -96], [38, -96]]) el('rect', { x, y, width: 28, height: 40, fill: '#d9f0f7', stroke: '#fff', 'stroke-width': 3 }, b);
      el('rect', { x: -18, y: -70, width: 36, height: 70, fill: '#9c6837', stroke: '#fff', 'stroke-width': 3 }, b);
      b.animate([{ opacity: 0, transform: 'translate(180px,300px)' }, { opacity: 1, transform: 'translate(180px,266px)' }], { duration: 800, delay: 300, fill: 'forwards', easing: 'cubic-bezier(.3,1.4,.6,1)' }); },
})));

/* ---------------- [m1.u1.d4] الدرس 4: صيد الأشكال وتركيبها (C005، مدخل C163) ---------------- */
LESSONS.push(lesson('m1.u1.d4', W => ({
  async hook() {
    const svg = newStage(300, { cityOpacity: .2 });
    const things = [[MK.plate(), 60, 90, .55], [MK.door(), 150, 190, .55], [MK.sign(), 255, 90, .55], [MK.tile(), 300, 210, .55], [MK.clock(), 70, 215, .5], [MK.envelope(), 200, 92, .5]];
    things.forEach(([s, x, y, k], i) => { const g = shapeAt(svg, s, x, y); g.setAttribute('transform', `translate(${x} ${y}) rotate(${(s.rot || 0) + (i % 2 ? 14 : -12)}) scale(${k})`); });
    await lines([['chaos', 'hook.01', 'بَعْثَرْتُ أَشْيَاءَ البَيْتِ كُلَّهَا! مَنْ يُرَتِّبُهَا؟'],
      ['compass', 'hook.02', 'نَحْنُ صَيَّادُو الأَشْكَالِ! نَنْظُرُ إِلَى شَكْلِ كُلِّ شَيْءٍ، لَا إِلَى لَوْنِهِ وَلَا إِلَى اسْمِهِ.'],
      ['compass', 'hook.03', 'لَكِنْ أَوَّلًا: هَيَّا نَبْنِي بَيْتًا مِنَ الأَشْكَالِ.']]);
  },
  async explore() {
    // مركّب الأشكال: صورة بيت فيها أماكن فارغة، والطفل يضع كل قطعة في مكانها
    const svg = newStage(330, { cityOpacity: .15 });
    const slots = [{ k: 'square', x: 180, y: 182, s: { type: 'square', size: 120 } }, { k: 'triangle', x: 180, y: 92, s: { type: 'triangle', w: 150, h: 66 } },
      { k: 'rect', x: 180, y: 214, s: { type: 'rect', w: 34, h: 56 } }, { k: 'circle', x: 300, y: 54, s: { type: 'circle', size: 52 } }];
    const slotG = slots.map(sl => { const g = el('g', { transform: `translate(${sl.x} ${sl.y})` }, svg); const geo = shapeGeom(sl.s);
      const d = sl.s.type === 'circle' ? el('circle', { r: geo.r }, g) : el('polygon', { points: polyStr(geo.poly) }, g); d.setAttribute('fill', '#ffffff'); d.setAttribute('fill-opacity', .5); d.setAttribute('stroke', css('--ink')); d.setAttribute('stroke-width', 3); d.setAttribute('stroke-dasharray', '8 6'); d.setAttribute('opacity', .6); return g; });
    const pieces = [{ k: 'circle', s: { type: 'circle', size: 52, color: '#f6cf7e' }, x: 52 }, { k: 'rect', s: { type: 'rect', w: 34, h: 56, color: '#9c6837' }, x: 122 }, { k: 'triangle', s: { type: 'triangle', w: 150, h: 66, color: css('--triangle') }, x: 220 },
      { k: 'square', s: { type: 'square', size: 120, color: '#f4a38e' }, x: 314 }];
    const tray = el('g', {}, svg); el('rect', { x: 0, y: 262, width: 360, height: 68, fill: css('--paper'), opacity: .9 }, tray);
    const shown = shuffle(pieces).map((p, i) => { const sc = p.k === 'square' ? .42 : p.k === 'triangle' ? .45 : .8; const x = 45 + i * 90;
      const g = shapeAt(svg, p.s, x, 296); g.setAttribute('transform', `translate(${x} 296) scale(${sc})`); g.style.cursor = 'pointer'; g.setAttribute('role', 'button'); g.setAttribute('tabindex', 0); g.dataset.k = p.k; return { ...p, g, x, sc }; });
    await say('compass', 'exp.01', '{اِلْمَسْ|اِلْمَسِي} قِطْعَةً، ثُمَّ {اِلْمَسْ|اِلْمَسِي} مَكَانَهَا فِي الصُّورَةِ.');
    let sel = null, placed = 0, tries = 0;
    await new Promise(res => {
      shown.forEach(p => { const act = () => { if (p.done) return; sel = p; shown.forEach(q => q.g.style.opacity = q === p || q.done ? 1 : .55); SFX.tick(); }; p.g.onclick = act; p.g.onkeydown = e => { if (e.key === 'Enter') act(); }; });
      slotG.forEach((g, i) => { g.style.cursor = 'pointer'; g.dataset.slot = slots[i].k; g.onclick = async () => { if (!sel) { await say('compass', 'exp.pick', '{اِخْتَرْ|اِخْتَارِي} قِطْعَةً أَوَّلًا.'); return; }
        tries++; const sl = slots[i];
        if (sl.k === sel.k && !sl.filled) { sl.filled = true; sel.done = true; placed++; SFX.good(); logAttempt({ scene: 'explore', tag: 'compose-' + sel.k, ok: true });
          sel.g.animate([{ transform: `translate(${sel.x}px,296px) scale(${sel.sc})` }, { transform: `translate(${sl.x}px,${sl.y}px) scale(1)` }], { duration: FAST ? 40 : 500, fill: 'forwards', easing: 'cubic-bezier(.3,1.4,.6,1)' }); sel = null; shown.forEach(q => q.g.style.opacity = 1);
          if (placed === 4) res(); }
        else { SFX.soft(); logAttempt({ scene: 'explore', tag: 'compose-' + sel.k, ok: false, err: 'slot' }); const SLOT = { square: ['exp.slot.square', 'لِنُفَكِّرْ مَعًا: هَذَا المَكَانُ يَحْتَاجُ شَكْلًا لَهُ أَرْبَعَةُ أَضْلَاعٍ مُتَسَاوِيَةٍ.'], triangle: ['exp.slot.triangle', 'لِنُفَكِّرْ مَعًا: هَذَا المَكَانُ يَحْتَاجُ شَكْلًا لَهُ ثَلَاثَةُ أَضْلَاعٍ.'],
            rect: ['exp.slot.rect', 'لِنُفَكِّرْ مَعًا: هَذَا المَكَانُ يَحْتَاجُ شَكْلًا لَهُ ضِلْعَانِ طَوِيلَانِ وَضِلْعَانِ قَصِيرَانِ.'], circle: ['exp.slot.circle', 'لِنُفَكِّرْ مَعًا: هَذَا المَكَانُ يَحْتَاجُ شَكْلًا لَهُ حَافَّةٌ مُنْحَنِيَةٌ بِلَا رُؤُوسٍ.'] };
          await say('compass', ...SLOT[sl.k]); } }; });
    });
    slotG.forEach(g => { g.onclick = null; g.style.cursor = ''; }); shown.forEach(p => { p.g.onclick = null; });   // البيت اكتمل: لا لمسات إضافية
    confetti(16); await say('compass', 'exp.03', 'بَيْتٌ كَامِلٌ مِنْ أَرْبَعَةِ أَشْكَالٍ!');
  },
  worked: [
    async (svg, st) => { await say('compass', 'wk.01', 'وَالأَشْكَالُ تَصْنَعُ أَشْكَالًا! {شَاهِدْ|شَاهِدِي}: مُثَلَّثَانِ…');
      const a = el('polygon', { points: '-50,-50 50,50 -50,50', fill: css('--triangle'), stroke: '#fff', 'stroke-width': 4, filter: 'url(#pp)', transform: 'translate(110 140)' }, svg);
      const b = el('polygon', { points: '-50,-50 50,-50 50,50', fill: NEUTRAL[1], stroke: '#fff', 'stroke-width': 4, filter: 'url(#pp)', transform: 'translate(250 140)' }, svg);
      b.animate([{ transform: 'translate(250px,140px)' }, { transform: 'translate(110px,140px)' }], { duration: FAST ? 50 : 1300, fill: 'forwards', easing: 'ease-in-out' }); await sleep(1400); st.ab = [a, b];
      await say('compass', 'wk.02', 'مُثَلَّثَانِ مَعًا يَصْنَعَانِ مُرَبَّعًا: أَرْبَعَةُ أَضْلَاعٍ مُتَسَاوِيَةٍ!'); },
    async (svg, st) => { st.ab.forEach(x => x.remove()); await say('compass', 'wk.03', 'وَمُرَبَّعَانِ مُتَجَاوِرَانِ…');
      shapeAt(svg, { type: 'square', size: 96, color: css('--square') }, 132, 140); const s2 = shapeAt(svg, { type: 'square', size: 96, color: NEUTRAL[0] }, 300, 140);
      s2.animate([{ transform: 'translate(300px,140px)' }, { transform: 'translate(228px,140px)' }], { duration: FAST ? 50 : 1200, fill: 'forwards', easing: 'ease-in-out' }); await sleep(1300);
      await say('compass', 'wk.04', 'يَصْنَعَانِ مُسْتَطِيلًا: ضِلْعَانِ طَوِيلَانِ وَضِلْعَانِ قَصِيرَانِ!'); },
    async (svg) => { svg.innerHTML = ''; backdrop(svg, 300, { cityOpacity: .15 }); shapeAt(svg, MK.plate(), 100, 130); ballAt(svg, 260, 130, 58);
      await say('compass', 'wk.05', 'وَصَيَّادُ الأَشْكَالِ يَنْتَبِهُ: الطَّبَقُ مُسَطَّحٌ دَائِرِيٌّ، أَمَّا الكُرَةُ فَنُمْسِكُهَا مِنْ كُلِّ الجِهَاتِ؛ لَيْسَتْ دَائِرَةً.'); },
  ],
  sort: {
    errorOf(item, bin) { if (item.kind === 'square' && bin === 'rect') return 'squareAsRect'; if (item.kind === 'rect' && bin === 'square') return 'rectAsSquare'; if (item.rot && item.kind !== 'circle') return 'rotated'; return 'byShape'; },
    showErr(err, item, g) { if (err === 'rotated') straighten(g, item); },
    reason(item) { return { circle: W('why.c'), square: W('why.sq'), triangle: W('why.t'), rect: W('why.r') }[item.kind]; },
    twin(item) { return { circle: MK.clock, square: MK.napkin, triangle: MK.cheese, rect: MK.envelope }[item.kind]; },
    async recall() { const svg = newStage(300); [['circle', 60], ['square', 140], ['triangle', 220], ['rect', 305]].forEach(([k, x]) => shapeAt(svg, { type: k, size: 64, w: k === 'rect' ? 80 : k === 'triangle' ? 70 : undefined, h: k === 'rect' ? 44 : k === 'triangle' ? 64 : undefined, color: css(IDC[k]) }, x, 140));
      await say('compass', 'ms.recall', 'الدَّائِرَةُ بِلَا رُؤُوسٍ، وَالمُثَلَّثُ ثَلَاثَةُ أَضْلَاعٍ، وَالمُرَبَّعُ أَرْبَعَةٌ مُتَسَاوِيَةٌ، وَالمُسْتَطِيلُ طَوِيلَانِ وَقَصِيرَانِ.'); },
  },
  async wrap(svg) { const items = [['circle', 70, 200], ['triangle', 140, 190], ['square', 220, 200], ['rect', 290, 205]];
      items.forEach(([k, x, y], i) => { const g = shapeAt(svg, { type: k, size: 54, w: k === 'rect' ? 70 : k === 'triangle' ? 60 : undefined, h: k === 'rect' ? 40 : k === 'triangle' ? 56 : undefined, color: css(IDC[k]) }, x, y);
        g.animate([{ opacity: 0, transform: `translate(${x}px,${y - 60}px)` }, { opacity: 1, transform: `translate(${x}px,${y}px)` }], { duration: 500, delay: 250 + i * 220, fill: 'both', easing: 'cubic-bezier(.3,1.4,.6,1)' }); });
      label(svg, 180, 262, 'حَدِيقَةُ الأَشْكَالِ', 17); },
})));

/* ---------------- [m1.u1.d5] الدرس 5: مراجعة واختبار الوحدة (D30: شفوي بصري من 8 أسئلة؛ D178: 85%) ---------------- */
function badgeArt1(svg) { const b = el('g', { transform: 'translate(150 160)' }, svg);
  el('circle', { r: 70, fill: '#f6cf7e', stroke: '#fff', 'stroke-width': 5, filter: 'url(#pp)' }, b); el('circle', { r: 54, fill: '#ffe9a8' }, b);
  [['circle', -20, -14], ['square', 20, -14], ['triangle', -20, 22], ['rect', 20, 22]].forEach(([k, x, y]) => shapeAt(b, { type: k, size: 28, w: k === 'rect' ? 34 : k === 'triangle' ? 32 : undefined, h: k === 'rect' ? 20 : k === 'triangle' ? 28 : undefined, color: css(IDC[k]) }, x, y));
  label(svg, 150, 258, 'شَارَةُ صَيَّادِ الأَشْكَالِ', 17); return b; }
LESSONS.push(lesson('m1.u1.d5', W => ({
  test: { art: badgeArt1 },
  async hook() {
    const svg = newStage(300, { cityOpacity: .3 });
    const cr = el('g', { transform: 'translate(180 130)' }, svg); el('polygon', { points: '0,-60 40,-14 22,56 -22,56 -40,-14', fill: '#9fd4ea', stroke: '#fff', 'stroke-width': 4, filter: 'url(#pp)' }, cr);
    el('polygon', { points: '0,-60 12,-14 0,56 -12,-14', fill: '#ffffff', opacity: .45 }, cr); cr.animate([{ transform: 'translate(180px,130px) rotate(-6deg)' }, { transform: 'translate(180px,120px) rotate(6deg)' }], { duration: 1400, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
    await lines([['chaos', 'hook.01', 'خَبَّأْتُ قِطْعَةَ بِلَّوْرَةِ المَدِينَةِ! لَنْ أُعِيدَهَا إِلَّا لِمَنْ يُجِيبُ عَنْ ثَمَانِيَةِ أَسْئِلَةٍ.'],
      ['compass', 'hook.02', '{لَا تَقْلَقْ|لَا تَقْلَقِي}! هَيَّا نَتَذَكَّرُ أَوَّلًا.']]);
  },
  async explore() {
    const svg = newStage(300, { cityOpacity: .15 });
    const cards = [['circle', ['rv.circle', 'الدَّائِرَةُ: حَافَّةٌ مُنْحَنِيَةٌ، بِلَا رُؤُوسٍ.']], ['square', ['rv.square', 'المُرَبَّعُ: أَرْبَعَةُ أَضْلَاعٍ مُتَسَاوِيَةٍ.']], ['triangle', ['rv.triangle', 'المُثَلَّثُ: ثَلَاثَةُ أَضْلَاعٍ مُسْتَقِيمَةٍ.']], ['rect', ['rv.rect', 'المُسْتَطِيلُ: ضِلْعَانِ طَوِيلَانِ وَضِلْعَانِ قَصِيرَانِ.']]];
    for (const [i, [k, [id, t]]] of cards.entries()) { const x = 315 - i * 90; const g = shapeAt(svg, { type: k, size: 64, w: k === 'rect' ? 78 : k === 'triangle' ? 70 : undefined, h: k === 'rect' ? 44 : k === 'triangle' ? 64 : undefined, color: css(IDC[k]) }, x, 140);
      g.animate([{ transform: `translate(${x}px,140px) scale(.3)` }, { transform: `translate(${x}px,140px) scale(1.15)` }, { transform: `translate(${x}px,140px) scale(1)` }], { duration: 500, fill: 'both' }); await say('compass', id, t); }
  },
  worked: [],
})));

