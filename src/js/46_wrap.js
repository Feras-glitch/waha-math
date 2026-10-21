/* =====================================================================
   الختام: قطعة تُضاف إلى الواحة، وجملة «صحّح لفوضى» الصحيحة، ومهمة البيت، ثم «كيف كان؟» بثلاثة وجوه (D239)
   ===================================================================== */
const WRAP_ART = {
  squares(svg) { for (let i = 0; i < 9; i++) { const r = el('rect', { x: 64 + i * 26, y: 236, width: 22, height: 22, rx: 2, fill: css('--square'), stroke: '#fff', 'stroke-width': 2, opacity: 0 }, svg);
      anim(r, [{ opacity: 0, transform: 'translateY(-16px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 380, delay: 150 + i * 80, fill: 'forwards' }); }
    const f = el('g', { transform: 'translate(180 176)' }, svg); el('circle', { r: 58, fill: css('--circle'), stroke: '#fff', 'stroke-width': 4, filter: 'url(#pp)' }, f); el('circle', { r: 40, fill: 'url(#waterG)' }, f);
    const jet = el('path', { d: 'M0 -6 Q-14 -50 -30 -24 M0 -6 Q14 -50 30 -24 M0 -6 L0 -56', stroke: css('--water-hi'), 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, f);
    anim(jet, [{ opacity: .6 }, { opacity: 1 }], { duration: 700, iterations: Infinity, direction: 'alternate' });
    anim(f, [{ transform: 'translate(180px,176px) scale(0)' }, { transform: 'translate(180px,176px) scale(1.08)' }, { transform: 'translate(180px,176px) scale(1)' }], { duration: 900, delay: 700, fill: 'both', easing: 'ease-out' }); },
  houses(svg) { for (const [i, x] of [70, 180, 290].entries()) { const h = el('g', { transform: `translate(${x} 240)`, opacity: 0 }, svg);
      el('rect', { x: -34, y: -60, width: 68, height: 60, fill: ['#e9c99a', '#cfe0c3', '#f1dcb0'][i], stroke: '#fff', 'stroke-width': 3, filter: 'url(#pp)' }, h); el('rect', { x: -8, y: -26, width: 16, height: 26, fill: MAT.woodDk }, h);
      el('polygon', { points: '-42,-60 0,-104 42,-60', fill: css('--triangle'), stroke: '#fff', 'stroke-width': 3, filter: 'url(#pp)' }, h);
      anim(h, [{ opacity: 0, transform: `translate(${x}px,270px)` }, { opacity: 1, transform: `translate(${x}px,240px)` }], { duration: 600, delay: 300 + i * 350, fill: 'forwards', easing: 'cubic-bezier(.3,1.4,.6,1)' }); } },
  gate(svg) { const b = el('g', { transform: 'translate(180 266)', opacity: 0 }, svg);
    el('rect', { x: -90, y: -170, width: 180, height: 170, fill: '#e9c99a', stroke: '#fff', 'stroke-width': 4, filter: 'url(#pp)' }, b);
    for (const [x, y] of [[-66, -150], [-14, -150], [38, -150], [-66, -96], [38, -96]]) el('rect', { x, y, width: 28, height: 40, fill: '#d9f0f7', stroke: '#fff', 'stroke-width': 3 }, b);
    el('rect', { x: -18, y: -110, width: 36, height: 110, fill: css('--rect'), stroke: '#fff', 'stroke-width': 3 }, b);
    anim(b, [{ opacity: 0, transform: 'translate(180px,300px)' }, { opacity: 1, transform: 'translate(180px,266px)' }], { duration: 800, delay: 300, fill: 'forwards', easing: 'cubic-bezier(.3,1.4,.6,1)' }); },
  garden(svg) { [['circle', 70, 200], ['triangle', 140, 190], ['square', 220, 200], ['rect', 290, 205]].forEach(([k, x, y], i) => { const g = shapeAt(svg, { type: k, size: 54, w: k === 'rect' ? 70 : k === 'triangle' ? 60 : undefined, h: k === 'rect' ? 40 : k === 'triangle' ? 56 : undefined, color: css(IDC[k]) }, x, y);
      anim(g, [{ opacity: 0, transform: `translate(${x}px,${y - 60}px)` }, { opacity: 1, transform: `translate(${x}px,${y}px)` }], { duration: 500, delay: 250 + i * 220, fill: 'both', easing: 'cubic-bezier(.3,1.4,.6,1)' }); }); palmAt(svg, 330, 250, .8); palmAt(svg, 30, 250, .7); },
  mailboxes(svg) { [[290, 2], [180, 5], [70, 0]].forEach(([x, n], i) => { const g = mailboxAt(svg, x, 190, n).g; anim(g, [{ opacity: 0, transform: `translate(${x}px,230px)` }, { opacity: 1, transform: `translate(${x}px,190px)` }], { duration: 500, delay: 200 + i * 250, fill: 'both' }); digitCard(svg, x, 110, n, { size: .7 }); }); },
  robot(svg) { const g = el('g', { transform: 'translate(180 160)' }, svg); shapeAt(g, { type: 'square', size: 70, color: css('--square') }, 0, -40); shapeAt(g, { type: 'rect', w: 90, h: 60, color: css('--rect') }, 0, 26);
    shapeAt(g, { type: 'circle', size: 18, color: '#fff' }, -14, -46); shapeAt(g, { type: 'circle', size: 18, color: '#fff' }, 14, -46); shapeAt(g, { type: 'triangle', w: 30, h: 26, color: css('--triangle') }, 0, -88);
    anim(g, [{ transform: 'translate(180px,200px) scale(.6)', opacity: 0 }, { transform: 'translate(180px,160px) scale(1)', opacity: 1 }], { duration: 800, fill: 'both', easing: 'cubic-bezier(.3,1.4,.6,1)' }); },
  cubes(svg) { for (const [i, [x, y]] of [[150, 236], [190, 236], [230, 236], [170, 196], [210, 196], [190, 156]].entries()) { const g = el('g', {}, svg); drawBox(g, { w: 34, h: 34, d: 34, yaw: 22, pitch: 18, color: [SOLIDC.cube, '#cfe0c3', '#f1dcb0'][i % 3] });
      g.setAttribute('transform', `translate(${x} ${y - 18})`); anim(g, [{ opacity: 0, transform: `translate(${x}px,${y - 60}px)` }, { opacity: 1, transform: `translate(${x}px,${y - 18}px)` }], { duration: 380, delay: 200 + i * 140, fill: 'both', easing: 'cubic-bezier(.3,1.4,.6,1)' }); }
    const b = thingAt(svg, { solid: 'sphere', object: 'ball', size: 50, color: '#f3f3f3' }, 70, 230); anim(b, [{ transform: 'translate(-30px,230px)' }, { transform: 'translate(80px,230px)' }], { duration: 1200, delay: 1100, fill: 'both', easing: 'ease-out' }); },
  tower(svg) { const t = el('g', { transform: 'translate(180 0)' }, svg);
    thingAt(t, { solid: 'cylinder', size: 150, color: '#c9a072' }, 0, 156); thingAt(t, { solid: 'cone', size: 128, color: SOLIDC.cone }, 0, 66);
    anim(t, [{ transform: 'translate(180px,300px)', opacity: 0 }, { transform: 'translate(180px,0px)', opacity: 1 }], { duration: 900, delay: 250, fill: 'both', easing: 'cubic-bezier(.3,1.3,.6,1)' }); },
  towers(svg) { [[290, 4], [220, 6], [150, 5], [80, 7]].forEach(([x, n], i) => { const T = towerAt(svg, x, 262, n, { size: 22, color: i % 2 ? CUBE.white : CUBE.lemon }); anim(T.g, [{ opacity: 0, transform: 'translateY(30px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 500, delay: 200 + i * 220, fill: 'both' }); }); },
  mosque(svg) { const g = el('g', { transform: 'translate(0 20) scale(1)' }, svg); mosqueAt(g); anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 900, fill: 'both' }); },
  bridge(svg) { const g = el('g', {}, svg); for (let i = 0; i < 8; i++) { const T = towerAt(g, 330 - i * 40, 262, 1 + (i % 4), { size: 22, color: i % 2 ? CUBE.white : CUBE.lemon }); anim(T.g, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 150 + i * 120, fill: 'both' }); }
    sentenceAt(svg, 180, 60, 4, '+', 3, 7); },
  faces(svg) { const g = el('g', { transform: 'translate(120 160)' }, svg); drawBox(g, { w: 90, h: 90, d: 90, yaw: 32, pitch: 24, color: SOLIDC.cube }); const b = el('g', { transform: 'translate(260 170)' }, svg); drawBox(b, { w: 110, h: 64, d: 60, yaw: 32, pitch: 24, color: BOXC, deco: teaDeco }); },
};
/* «كيف كان؟» (D239): ثلاثة وجوه بلا صواب ولا خطأ، تُحفظ للكبار */
const FACE_ICON = {
  easy: '<svg viewBox="0 0 40 40" width="44" height="44" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="#f6cf7e" stroke="#c98f55" stroke-width="2"/><circle cx="14" cy="16" r="2.4" fill="#1b3440"/><circle cx="26" cy="16" r="2.4" fill="#1b3440"/><path d="M12 24 q8 8 16 0" stroke="#1b3440" stroke-width="2.6" fill="none" stroke-linecap="round"/></svg>',
  ok: '<svg viewBox="0 0 40 40" width="44" height="44" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="#f6cf7e" stroke="#c98f55" stroke-width="2"/><circle cx="14" cy="16" r="2.4" fill="#1b3440"/><circle cx="26" cy="16" r="2.4" fill="#1b3440"/><path d="M13 26 h14" stroke="#1b3440" stroke-width="2.6" stroke-linecap="round"/></svg>',
  hard: '<svg viewBox="0 0 40 40" width="44" height="44" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="#f6cf7e" stroke="#c98f55" stroke-width="2"/><circle cx="14" cy="16" r="2.4" fill="#1b3440"/><circle cx="26" cy="16" r="2.4" fill="#1b3440"/><path d="M13 28 q7 -7 14 0" stroke="#1b3440" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M29 10 q3 4 0 7" stroke="#6aa9d6" stroke-width="2.4" fill="none"/></svg>',
};
async function facesAsk(L) {
  say(...lineOf('gen.faces.ask'), { free: true });
  const k = await choosePick([['easy', labelText('faceEasy'), FACE_ICON.easy], ['ok', labelText('faceOk'), FACE_ICON.ok], ['hard', labelText('faceHard'), FACE_ICON.hard]], null, { cls: 'faces' }); hush();
  LOG.faces.push({ t: Date.now(), lesson: L.id, k }); if (LOG.faces.length > 120) LOG.faces.shift(); store.set(kk('hp_log'), LOG); progOf(L.id).face = k; saveProg();
  await S('gen.faces.' + k);
}
async function wrapStage(L) {
  const W = L.wrap; const P = progOf(L.id);
  const svg = newStage(300, { oasisOpacity: .9 }); if (W.art && WRAP_ART[W.art]) WRAP_ART[W.art](svg); SFX.win();
  if (L.chaos && !L.test) await S(L.chaos.right);                 // جملة الختام: الصحيحة من «صحّح لفوضى» (D236)
  await S(L.test && !P.mastered ? (W.notYet || []) : W.lines);
  if (W.home) await S(W.home);                                    // مهمة البيت (D221)
  await facesAsk(L);
}
