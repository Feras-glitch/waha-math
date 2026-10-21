/* =====================================================================
   أدوات الوحدة الثانية (المجسّمات)
   ===================================================================== */
const FLOOR = 236;
/* ضع شيئاً بحيث تلامس قاعدته خطّ الأرض */
function placeOnFloor(parent, s, x, floor = FLOOR) { const g = thingAt(parent, s, x, 0); const bb = g.getBBox();
  const y = floor - (bb.y + bb.height) + 4; g.setAttribute('transform', `translate(${x} ${y}) rotate(${s.rot || 0})`); g.__x = x; g.__y = y; return g; }
function floorLine(svg, y = FLOOR) { el('rect', { x: 0, y, width: 360, height: 300 - y + 60, fill: css('--ground'), opacity: .55 }, svg); el('line', { x1: 0, y1: y, x2: 360, y2: y, stroke: css('--ink'), 'stroke-opacity': .25, 'stroke-width': 3 }, svg); }
/* أزرار اختيار بأيقونة وكلمة؛ السؤال نفسه يُقال بصوت المرشد. يعيد مفتاح الخيار */
const PICKICON = {
  roll: '<svg viewBox="0 0 40 24" width="40" height="24"><path d="M4 18 Q20 -2 36 18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M30 12 l6 6 l-8 2" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  stay: '<svg viewBox="0 0 40 24" width="40" height="24"><rect x="12" y="4" width="16" height="16" rx="2" fill="currentColor"/><line x1="4" y1="21" x2="36" y2="21" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  straight: '<svg viewBox="0 0 40 24" width="40" height="24"><line x1="4" y1="12" x2="32" y2="12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M27 6 l7 6 l-7 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  around: '<svg viewBox="0 0 40 24" width="40" height="24"><path d="M28 6 A9 9 0 1 0 29 16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M24 3 l5 3 l-4 4" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  square: '<svg viewBox="0 0 40 24" width="40" height="24"><rect x="11" y="2" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3"/></svg>',
  circle: '<svg viewBox="0 0 40 24" width="40" height="24"><circle cx="20" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3"/></svg>',
  dot: '<svg viewBox="0 0 40 24" width="40" height="24"><circle cx="20" cy="12" r="3.5" fill="currentColor"/></svg>',
};
function choosePick(options, okKey) {
  const box = document.createElement('div'); box.className = 'choices icons'; $('#stage').appendChild(box);
  return gate(new Promise(res => options.forEach(([k, t, ic]) => { const b = document.createElement('button'); b.className = 'pick'; b.innerHTML = (ic || PICKICON[k] || '') + `<span>${G(t)}</span>`; b.dataset.k = k;
    /*T*/if (TESTHOOK) b.dataset.ok = k === okKey;/*/T*/ box.appendChild(b);
    b.onclick = () => { if (box.dataset.done) return; box.dataset.done = 1; hush(); b.classList.add(k === okKey ? 'ok' : 'no'); SFX.tick(); res(k); }; }))).then(k => { setTimeout(() => box.remove(), FAST ? 30 : 900); return k; });
}
/* يد صغيرة تدفع الشيء من اليسار */
function handAt(svg, x, y) { const h = el('g', { transform: `translate(${x} ${y})` }, svg);
  el('path', { d: 'M-34 -8 h22 a8 8 0 0 1 0 16 h-22 z', fill: '#f1c9a5', stroke: '#c98f55', 'stroke-width': 2 }, h); el('rect', { x: -52, y: -11, width: 20, height: 22, rx: 6, fill: '#5c9bb0' }, h); return h; }
/* تجربة الدفع: ‏roll يتدحرج بعيداً، tip ينقلب مرة ويقف، stay يبقى مكانه */
async function pushTest(svg, s, behave, x0 = 110) {
  const g = placeOnFloor(svg, s, x0); const bb = g.getBBox(); const left = x0 + bb.x, y0 = g.__y;
  const hand = handAt(svg, left - 70, FLOOR - bb.height * .45);
  await new Promise(r => { hand.animate([{ transform: `translate(${left - 70}px,${FLOOR - bb.height * .45}px)` }, { transform: `translate(${left - 2}px,${FLOOR - bb.height * .45}px)` }], { duration: FAST ? 40 : 700, fill: 'forwards', easing: 'ease-in' }).onfinish = r; });
  SFX.pop();
  const D = FAST ? 60 : 1600;
  if (behave === 'roll') {
    const dist = 330 - x0 - bb.width / 2; const spin = el('g', {}); // خطوط حركة
    for (let k = 0; k < 3; k++) el('line', { x1: x0 - 30, y1: FLOOR - 14 - k * 14, x2: x0 - 14, y2: FLOOR - 14 - k * 14, stroke: css('--ink'), 'stroke-opacity': .25, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    const sp = g.querySelector('.spoke'); if (sp) sp.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(540deg)' }], { duration: D, fill: 'forwards', easing: 'ease-out' });
    await new Promise(r => { g.animate([{ transform: `translate(${x0}px,${y0}px)` }, { transform: `translate(${x0 + dist}px,${y0}px)` }], { duration: D, fill: 'forwards', easing: 'cubic-bezier(.2,.7,.4,1)' }).onfinish = r; });
  } else if (behave === 'tip') {
    const px = bb.x + bb.width - 4, py = bb.y + bb.height - 8; const fr = [];
    for (let a = 0; a <= 90; a += 10) fr.push({ transform: `translate(${x0}px,${y0}px) translate(${px}px,${py}px) rotate(${a}deg) translate(${-px}px,${-py}px)` });
    await new Promise(r => { g.animate(fr, { duration: FAST ? 40 : 650, fill: 'forwards', easing: 'ease-in' }).onfinish = r; });
    SFX.soft(); g.remove(); const g2 = placeOnFloor(svg, { ...s, yaw: (s.yaw ?? 22) + 0 }, x0 + bb.width * .9);
    g2.animate([{ transform: `translate(${g2.__x}px,${g2.__y - 4}px)` }, { transform: `translate(${g2.__x}px,${g2.__y}px)` }], { duration: 160 });
  } else {
    await new Promise(r => { g.animate([{ transform: `translate(${x0}px,${y0}px)` }, { transform: `translate(${x0 + 8}px,${y0}px) rotate(3deg)` }, { transform: `translate(${x0 + 8}px,${y0}px) rotate(-2deg)` }, { transform: `translate(${x0 + 8}px,${y0}px)` }], { duration: FAST ? 40 : 700, fill: 'forwards' }).onfinish = r; });
  }
  hand.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' });
  await sleep(300);
}
/* مختبر الدفع: توقّع ثم تجربة، لكل مجسّم */
async function pushLab(rounds) {
  for (const R of rounds) {
    const svg = newStage(300, { city: false }); floorLine(svg);
    const pv = placeOnFloor(svg, R.s, 110);
    say('compass', ...R.ask);
    const k = await choosePick(R.options, R.ok); logAttempt({ scene: 'explore', tag: 'predict-' + R.s.solid, ok: k === R.ok });
    pv.remove();
    await pushTest(svg, R.s, R.behave);
    await say('compass', ...R.after);
  }
}
/* المس الوجوه: كل وجه مسطّح يُلمس بالكف فيضيء؛ أو السطح المنحني فيُقال إنه بلا وجه */
async function faceTouch(svg, s, x, y, cfg) {
  const g = thingAt(svg, s, x, y);
  const faces = [...g.querySelectorAll('[data-face]')].filter(f => cfg.faces.includes(f.dataset.face));
  const touched = new Set(); /*T*/window.__faces = faces.length;/*/T*/
  await new Promise(res => faces.forEach(f => { f.style.cursor = 'pointer'; f.setAttribute('role', 'button'); f.setAttribute('tabindex', 0); f.setAttribute('data-t', 'face');
    const act = async () => { if (touched.has(f)) return; touched.add(f); SFX.pop(); buzz(25);
      const bb = f.getBBox(); const palm = el('g', { transform: `translate(${bb.x + bb.width / 2} ${bb.y + bb.height / 2})`, 'pointer-events': 'none' }, g);
      el('path', { d: 'M-9 8 q-3 -10 0 -18 q2 -4 4 0 l1 8 l1 -12 q2 -4 4 0 l0 12 l1 -10 q2 -4 4 0 l0 12 q4 -6 6 -2 q-2 10 -10 16 z', fill: '#ffe9a8', stroke: '#c98f55', 'stroke-width': 1.5 }, palm);
      palm.animate([{ transform: `translate(${bb.x + bb.width / 2}px,${bb.y + bb.height / 2}px) scale(.2)` }, { transform: `translate(${bb.x + bb.width / 2}px,${bb.y + bb.height / 2}px) scale(1)` }], { duration: 240, easing: 'cubic-bezier(.3,1.6,.6,1)' });
      f.setAttribute('stroke', '#f6cf7e'); f.setAttribute('stroke-width', 5);
      logAttempt({ scene: 'explore', tag: 'face-' + s.solid, ok: true });
      if (cfg.onTouch) await cfg.onTouch(touched.size, g);
      if (touched.size >= (cfg.need || faces.length)) res(); };
    f.addEventListener('click', act); f.addEventListener('keydown', e => { if (e.key === 'Enter') act(); }); }));
  return g;
}
/* منظر من الأعلى: الأسطوانة النائمة تتدحرج مستقيمة، والمخروط النائم يدور حول رأسه */
function topView(svg) { el('rect', { x: 0, y: 0, width: 360, height: 300, fill: '#e9f1e4' }, svg);
  for (let i = 0; i < 9; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2) el('rect', { x: i * 40, y: j * 40, width: 40, height: 40, fill: '#dde9d6' }, svg);
  const eye = el('g', { transform: 'translate(330 26)' }, svg); el('ellipse', { rx: 16, ry: 10, fill: '#fff', stroke: css('--ink'), 'stroke-width': 2 }, eye); el('circle', { r: 5, fill: css('--compass') }, eye); }
function cylTop(svg, x, y, color) { const g = el('g', { transform: `translate(${x} ${y})` }, svg);
  const f = grad(g, 'linearGradient', [[0, mix(color, 'b', .3)], [.4, mix(color, 'w', .3)], [1, mix(color, 'b', .35)]], { x1: 0, y1: 0, x2: 0, y2: 1 });
  el('rect', { x: -70, y: -26, width: 140, height: 52, rx: 4, fill: f, stroke: '#fff', 'stroke-width': 3 }, g);
  const st = el('g', { class: 'stripes' }, g); for (let k = -3; k <= 3; k++) el('line', { x1: -66, y1: k * 9, x2: 66, y2: k * 9, stroke: '#fff', 'stroke-opacity': .25, 'stroke-width': 2 }, st); return g; }
function coneTop(svg, px, py, color) { const g = el('g', { transform: `translate(${px} ${py})` }, svg);   // الرأس عند نقطة الدوران
  const f = grad(g, 'linearGradient', [[0, mix(color, 'b', .3)], [.45, mix(color, 'w', .3)], [1, mix(color, 'b', .35)]], { x1: 0, y1: 0, x2: 0, y2: 1 });
  el('path', { d: 'M0 0 L120 -34 A8 34 0 0 1 120 34 Z', fill: f, stroke: '#fff', 'stroke-width': 3, 'stroke-linejoin': 'round' }, g); el('circle', { r: 5, fill: css('--chaos') }, g); return g; }
async function rollTop(svg, which) {
  if (which === 'cylinder') {
    const g = cylTop(svg, 180, 70, SOLIDC.cylinder); const trail = el('g', {}, svg); svg.appendChild(g);
    const D = FAST ? 60 : 2200; const t0 = performance.now();
    await new Promise(r => { const step = () => { const t = Math.min(1, (performance.now() - t0) / D); const y = 70 + 170 * t;
      g.setAttribute('transform', `translate(180 ${y})`); g.querySelector('.stripes').setAttribute('transform', `translate(0 ${((y * 1.5) % 9) - 4})`);
      if (Math.round(y) % 12 < 3) el('circle', { cx: 180, cy: y, r: 3, fill: css('--compass'), opacity: .55 }, trail);
      if (t < 1) requestAnimationFrame(step); else r(); }; requestAnimationFrame(step); });
  } else {
    const g = coneTop(svg, 180, 150, SOLIDC.cone); const trail = el('g', {}, svg); svg.appendChild(g);
    const D = FAST ? 60 : 3200; const t0 = performance.now();
    await new Promise(r => { const step = () => { const t = Math.min(1, (performance.now() - t0) / D); const a = 360 * t;
      g.setAttribute('transform', `translate(180 150) rotate(${a})`); const q = a * Math.PI / 180; el('circle', { cx: 180 + 120 * Math.cos(q), cy: 150 + 120 * Math.sin(q), r: 3, fill: css('--chaos'), opacity: .5 }, trail);
      if (t < 1) requestAnimationFrame(step); else r(); }; requestAnimationFrame(step); });
  }
}
/* خِتامة الوجه: ينزل المجسّم على الحبر ثم على الورقة، ثم تُرفع الورقة لنرى البصمة */
async function stampTest(svg, s, print) {
  el('rect', { x: 26, y: 214, width: 92, height: 22, rx: 6, fill: '#5d4b8a' }, svg); el('rect', { x: 32, y: 210, width: 80, height: 8, rx: 4, fill: '#8e6bbf' }, svg);
  const paper = el('g', { transform: 'translate(250 230)' }, svg); el('polygon', { points: '-80,0 80,0 64,-16 -64,-16', fill: '#fffdf6', stroke: '#d9d2c3', 'stroke-width': 2 }, paper);
  const g = placeOnFloor(svg, s, 72, 170); const x0 = 72, y0 = g.__y;
  const D = FAST ? 30 : 600;
  const mv = (from, to, d = D) => new Promise(r => { g.animate([{ transform: `translate(${from[0]}px,${from[1]}px)` }, { transform: `translate(${to[0]}px,${to[1]}px)` }], { duration: d, fill: 'forwards', easing: 'ease-in-out' }).onfinish = r; });
  await mv([x0, y0], [x0, y0 + 44]); SFX.soft(); await mv([x0, y0 + 44], [x0, y0 - 20]); await mv([x0, y0 - 20], [250, y0 - 20], D * 1.3);
  await mv([250, y0 - 20], [250, y0 + 54]); SFX.pop(); buzz(40); await mv([250, y0 + 54], [250, y0 - 30]);
  g.animate([{ opacity: 1 }, { opacity: .25 }], { duration: 300, fill: 'forwards' });
  // الورقة تُرفع فنراها من الأمام
  const card = el('g', { transform: 'translate(250 150)' }, svg); el('rect', { x: -70, y: -60, width: 140, height: 120, rx: 6, fill: '#fffdf6', stroke: '#d9d2c3', 'stroke-width': 2, filter: 'url(#pp)' }, card);
  const ink = '#6e55a8';
  if (print === 'square') el('rect', { x: -32, y: -32, width: 64, height: 64, fill: ink, opacity: .85 }, card);
  if (print === 'circle') el('circle', { r: 34, fill: ink, opacity: .85 }, card);
  if (print === 'dot') el('circle', { r: 5, fill: ink, opacity: .85 }, card);
  await new Promise(r => { card.animate([{ transform: 'translate(250px,226px) scale(1,.06)' }, { transform: 'translate(250px,150px) scale(1,1)' }], { duration: FAST ? 40 : 700, fill: 'forwards', easing: 'cubic-bezier(.3,1.3,.6,1)' }).onfinish = r; });
}
/* المسطّح والمجسّم يدوران معاً: الورقة تصير خطاً، والمكعب يبقى كتلة */
async function edgeTurn(svg) {
  const a = el('g', { transform: 'translate(100 140)' }, svg), b = el('g', { transform: 'translate(262 140)' }, svg);
  const D = FAST ? 80 : 2600; const t0 = performance.now();
  const draw = yaw => { a.innerHTML = ''; b.innerHTML = '';
    drawBox(a, { w: 96, h: 96, d: 2.5, yaw, pitch: 6, color: css('--square') }); drawBox(b, { w: 76, h: 76, d: 76, yaw, pitch: 12, color: SOLIDC.cube }); };
  await new Promise(r => { const step = () => { const t = Math.min(1, (performance.now() - t0) / D); const e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    draw(4 + 84 * e); if (t < 1) requestAnimationFrame(step); else r(); }; requestAnimationFrame(step); });
}
/* بنّاء البرج: الكرة تتدحرج من تحت ما فوقها، ورأس المخروط لا يحمل شيئاً */
async function towerBuilder(svg, cfg) {
  floorLine(svg, 214);
  const stack = []; const base = el('g', {}, svg); const tray = el('g', {}, svg);
  el('rect', { x: 0, y: 246, width: 360, height: 60, fill: css('--paper'), opacity: .92 }, tray);
  const kinds = ['cube', 'cylinder', 'cone', 'sphere']; let warnedSphere = false, warnedCone = false, busy = false;
  const height = k => k === 'cube' ? 38 : k === 'cylinder' ? 44 : k === 'cone' ? 46 : 38;
  const topY = () => 214 - stack.reduce((h, p) => h + p.h, 0);
  await new Promise(res => kinds.forEach((k, i) => { const x = 315 - i * 90; const g = thingAt(tray, { solid: k, size: 52, color: SOLIDC[k] }, x, 276);
    g.style.cursor = 'pointer'; g.setAttribute('role', 'button'); g.setAttribute('tabindex', 0); g.dataset.solid = k; g.dataset.t = k === 'cube' ? 'build' : '';
    const act = async () => { if (busy) return; busy = true; SFX.tick();
      const top = stack[stack.length - 1]; const h = height(k);
      const piece = thingAt(base, { solid: k, size: 58, color: SOLIDC[k] }, 180, 0); const bb = piece.getBBox(); const yEnd = topY() - (bb.y + bb.height) + 3;
      await new Promise(r => { piece.animate([{ transform: `translate(180px,-40px)` }, { transform: `translate(180px,${yEnd}px)` }], { duration: FAST ? 30 : 450, fill: 'forwards', easing: 'cubic-bezier(.4,0,.8,1)' }).onfinish = r; });
      if (top && top.k === 'sphere') { SFX.soft(); logAttempt({ scene: 'build', tag: 'onSphere', ok: false, err: 'sphereBase' });
        top.g.animate([{ transform: top.g.style.transform || `translate(180px,${top.y}px)` }, { transform: `translate(420px,${top.y + 10}px) rotate(400deg)` }], { duration: FAST ? 30 : 900, fill: 'forwards' });
        await new Promise(r => { piece.animate([{ transform: `translate(180px,${yEnd}px)` }, { transform: `translate(120px,${214 - 30}px) rotate(-70deg)` }, { transform: `translate(110px,${214 - 30}px) rotate(-80deg)`, opacity: 0 }], { duration: FAST ? 30 : 900, fill: 'forwards' }).onfinish = r; });
        piece.remove(); top.g.remove(); stack.pop();
        if (!warnedSphere) { warnedSphere = true; await say('compass', ...cfg.sphereLine); } busy = false; return; }
      if (top && top.k === 'cone') { SFX.soft(); logAttempt({ scene: 'build', tag: 'onCone', ok: false, err: 'coneTop' });
        await new Promise(r => { piece.animate([{ transform: `translate(180px,${yEnd}px)` }, { transform: `translate(250px,${214 - 30}px) rotate(80deg)`, opacity: 0 }], { duration: FAST ? 30 : 800, fill: 'forwards' }).onfinish = r; });
        piece.remove(); if (!warnedCone) { warnedCone = true; await say('compass', ...cfg.coneLine); } busy = false; return; }
      piece.style.transform = `translate(180px,${yEnd}px)`; stack.push({ k, g: piece, h: bb.height - 10, y: yEnd }); SFX.pop();
      logAttempt({ scene: 'build', tag: 'place-' + k, ok: true });
      if (stack.length >= cfg.goal) { [...tray.querySelectorAll('[role=button]')].forEach(n => n.onclick = null); res(); }
      busy = false; };
    g.onclick = act; g.onkeydown = e => { if (e.key === 'Enter') act(); }; }));
  return stack;
}

