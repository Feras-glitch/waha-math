/* =====================================================================
   الأدوات التفاعلية: كل انتظار لفعل الطفل يمرّ هنا، وكل أداة تسجّل حلّها للفحص الآلي (AUTO)
   ===================================================================== */
/* لمس واحد من عدّة: targets = [{g, k}] → المفتاح. يضيف منطقة لمس (D255) واسماً لقارئ الشاشة، ويزيل عند الجواب ما أضافه من مناطق (فالسؤال التالي على الأشياء نفسها لا يكدّسها) */
function tapOne(targets, opt = {}) { const mine = [];
  targets.forEach(t => { t.g.style.cursor = 'pointer'; t.g.setAttribute('role', 'button'); t.g.setAttribute('tabindex', 0); if (t.label) t.g.setAttribute('aria-label', plain(G(t.label)));
    if (opt.pad !== false) { const had = t.g.querySelector(':scope > rect.hit'); const r = hitPad(t.g, opt.pad || 76); if (r && !had) mine.push(r); }
    /*T*/if (TESTHOOK) t.g.dataset.ok = opt.ok == null ? '' : [].concat(opt.ok).includes(t.k);/*/T*/ });
  const okT = targets.find(t => opt.ok != null && [].concat(opt.ok).includes(t.k)) || targets[0], badT = targets.find(t => !(opt.ok != null && [].concat(opt.ok).includes(t.k)));
  AUTO({ kind: 'tap', ok: () => okT.g.dispatchEvent(new MouseEvent('click', { bubbles: true })), wrong: () => (badT || okT).g.dispatchEvent(new MouseEvent('click', { bubbles: true })) });
  const off = opt.pulse === false ? () => {} : pulse(targets.map(t => t.g));
  return gate(new Promise(res => { const act = t => { off(); AUTO_CLEAR(); targets.forEach(x => { x.g.onclick = null; x.g.onkeydown = null; }); mine.forEach(r => r.remove()); res(t.k); };
    targets.forEach(t => { t.g.__route = (x, y) => tapRoute(targets, x, y, t).g;   /* D255: اللمسة لما يراه الطفل تحت إصبعه، لا لمنطقة لمس شيء رُسم بعده */
      t.g.onclick = e => act(e && e.clientX ? tapRoute(targets, e.clientX, e.clientY, t) : t); t.g.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') act(t); }; }); }));
}
/* لمن اللمسة بين أهداف «لمس واحد» (D255): لأعلى رسمٍ مرئي لهدفٍ تحت الإصبع؛ فإن لم تقع إلا على مناطق لمس شفافة (rect.hit، أو شكل لا يُرى: بلا لون ولا حدّ أو شفافيته صفر)
   فلأقرب هدفٍ رسمُه إلى موضعها (البعد إلى إطار الرسم، ثم إلى مركزه). وشيء مرئي ليس هدفاً يحجب ما تحته. (و«لمس الكل» يوجّه بأقرب مركز ويفضّل ما لم يُعدّ بعد) */
const blankEl = e => { if (e.matches('rect.hit')) return true; const cs = getComputedStyle(e), clear = v => !v || v === 'none' || /^rgba\(.*,\s*0\)$/.test(v) || v === 'transparent';
  if (+cs.opacity === 0) return true; return (clear(cs.fill) || +cs.fillOpacity === 0) && (clear(cs.stroke) || +cs.strokeOpacity === 0 || parseFloat(cs.strokeWidth) === 0); };
function drawnBox(g) { let r = null; for (const e of [g, ...g.querySelectorAll('*')]) { if (!(e instanceof SVGGeometryElement || e instanceof SVGTextElement) || blankEl(e)) continue;
    const b = e.getBoundingClientRect(); if (!b.width && !b.height) continue; r = r ? { l: Math.min(r.l, b.left), t: Math.min(r.t, b.top), r: Math.max(r.r, b.right), b: Math.max(r.b, b.bottom) } : { l: b.left, t: b.top, r: b.right, b: b.bottom }; } return r; }
function tapRoute(targets, x, y, t0) { const own = e => { for (let n = e; n && n !== document; n = n.parentNode) { const t = targets.find(t => t.g === n); if (t) return t; } return null; }; const pads = [];   /* أعمق هدف يحوي العنصر */
  for (const e of document.elementsFromPoint(x, y)) { const t = own(e); if (!t) { if (e instanceof SVGElement && e.closest('#stage') && e.tagName !== 'svg' && !blankEl(e)) break; continue; } if (!blankEl(e)) return t; if (!pads.includes(t)) pads.push(t); }
  if (pads.length < 2) return pads[0] || t0;
  let best = pads[0], d = Infinity; for (const t of pads) { const r = drawnBox(t.g); if (!r) continue; const dd = Math.hypot(Math.max(r.l - x, 0, x - r.r), Math.max(r.t - y, 0, y - r.b)) + Math.hypot(x - (r.l + r.r) / 2, y - (r.t + r.b) / 2) / 1000;
    if (dd < d) { d = dd; best = t; } } return best; }
/* لمس الكل: كل لمسة على عنصر لم يُلمس بعد تستدعي onTouch(t, i) وتنتهي حين تُلمس كلها */
function tapAll(targets, onTouch, opt = {}) {
  const done = new Set();
  targets.forEach(t => { t.g.style.cursor = 'pointer'; t.g.setAttribute('role', 'button'); t.g.setAttribute('tabindex', 0); if (t.label) t.g.setAttribute('aria-label', plain(G(t.label))); if (opt.pad !== false) hitPad(t.g, opt.pad || 70); });
  AUTO({ kind: 'tapAll', ok: async () => { for (const t of targets) { if (!done.has(t)) { t.g.dispatchEvent(new MouseEvent('click', { bubbles: true })); await new Promise(r => setTimeout(r, 40)); } } } });
  const off = opt.pulse === false ? () => {} : pulse(targets.map(t => t.g));
  /* إن تراكبت مناطق اللمس فاللمسة لأقرب هدف إلى موضعها، لا لصاحب المنطقة العليا (D255). والمرشّحون من يقع اللمس فعلاً على رسمه أو منطقته
     (elementsFromPoint، بسُمك الخطّ وهيئة الشكل، لا بإطاره: إطار القاعدة الأفقية بارتفاع صفر)، والبعد إلى القطعة المستقيمة للخطّ وإلى المركز لغيره */
  const owner = e => targets.find(t => t.g === e || t.g.contains(e));
  const dist = (t, x, y) => { const g = t.g;
    if (g instanceof SVGLineElement) { const m = g.getScreenCTM(); const P = (a, b) => { const p = g.ownerSVGElement.createSVGPoint(); p.x = +g.getAttribute(a); p.y = +g.getAttribute(b); return p.matrixTransform(m); };
      const a = P('x1', 'y1'), b = P('x2', 'y2'), vx = b.x - a.x, vy = b.y - a.y, k = Math.max(0, Math.min(1, ((x - a.x) * vx + (y - a.y) * vy) / (vx * vx + vy * vy || 1))); return Math.hypot(x - a.x - k * vx, y - a.y - k * vy); }
    const h = g.querySelector(':scope > rect.hit'); const r = (h || g).getBoundingClientRect(); return Math.hypot(x - r.left - r.width / 2, y - r.top - r.height / 2); };
  /* وبين هدفين متراكبين تقريباً (قطعتان فوق بعضهما) يُفضَّل الذي لم يُلمس بعد، فلا يبقى أحدهما بلا عدّ */
  const nearest = (x, y, t0) => { const cand = new Set(); for (const e of document.elementsFromPoint(x, y)) { const t = owner(e); if (t) cand.add(t); } if (!cand.size) return t0;
    let best = t0, d = Infinity; for (const t of cand) { const dd = dist(t, x, y) + (done.has(t) ? 24 : 0); if (dd < d) { d = dd; best = t; } } return best; };
  return gate(new Promise(res => targets.forEach((t0, i0) => { const act = async t => { const i = targets.indexOf(t); if (done.has(t)) { if (opt.onAgain) opt.onAgain(t); return; } done.add(t); off(); if (onTouch) await onTouch(t, done.size, i);
      if (done.size === targets.length) { AUTO_CLEAR(); targets.forEach(x => { x.g.onclick = null; x.g.onkeydown = null; x.g.removeAttribute('role'); x.g.removeAttribute('tabindex'); x.g.style.cursor = ''; x.g.querySelectorAll(':scope > rect.hit').forEach(h => h.remove()); }); res(done.size); } };   /* انتهى العدّ: النقاط لم تعد أهدافاً، فلا تبقى أزراراً بلا عمل */
    t0.g.__route = (x, y) => nearest(x, y, t0).g;
    t0.g.onclick = e => act(e && e.clientX ? nearest(e.clientX, e.clientY, t0) : t0); t0.g.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') act(t0); }; })));
}

/* ① تتبّع الحافة: يجد الطفل الرؤوس بإصبعه (العدّ من الأعلى على اليمين، D232)، ثم يلمس الأضلاع ليعدّها */
async function traceTool(svg, shapes, opt = {}) {
  const trail = el('g', {}, svg), marks = el('g', {}, svg);
  const state = shapes.map(s => ({ s, found: new Set(), buckets: new Set(), done: false }));
  shapes.forEach(s => { s.g = shapeAt(svg, s, s.x, s.y); if (s.caption) s.cap = label(svg, s.x, s.capY || 280, ''); });
  svg.appendChild(trail); svg.appendChild(marks);
  function distSeg(p, a, b) { const vx = b[0] - a[0], vy = b[1] - a[1]; const t = Math.max(0, Math.min(1, ((p.x - a[0]) * vx + (p.y - a[1]) * vy) / (vx * vx + vy * vy))); return Math.hypot(p.x - a[0] - t * vx, p.y - a[1] - t * vy); }
  let resolveAll; const allDone = gate(new Promise(r => resolveAll = r));
  const check = () => { if (state.every(st => st.done)) resolveAll(); };
  function touch(p) {
    state.forEach(st => { const s = st.s; if (st.done) return;
      if (s.type === 'circle') { const r = shapeGeom(s).r; if (Math.abs(Math.hypot(p.x - s.x, p.y - s.y) - r) < 24) { el('circle', { cx: p.x, cy: p.y, r: 4.5, fill: '#fff', stroke: css('--ink'), 'stroke-opacity': .25 }, trail);
          st.buckets.add(Math.floor(((Math.atan2(p.y - s.y, p.x - s.x) * 180 / Math.PI) + 360) % 360 / 10)); if (s.cap) s.cap.textContent = G(labelText('noVertices'));
          if (st.buckets.size >= 27) { st.done = true; SFX.good(); check(); } } return; }
      const P = worldPoly(s); let onEdge = false; for (let k = 0; k < P.length; k++) if (distSeg(p, P[k], P[(k + 1) % P.length]) < 20) onEdge = true;
      if (!onEdge) return; el('circle', { cx: p.x, cy: p.y, r: 4.5, fill: '#fff', stroke: css('--ink'), 'stroke-opacity': .25 }, trail);
      P.forEach((c, k) => { if (!st.found.has(k) && Math.hypot(p.x - c[0], p.y - c[1]) < 22) { st.found.add(k); SFX.tick(); buzz(30); badge(marks, c[0], c[1], st.found.size);
        if (s.cap) s.cap.textContent = G(labelText('vertices')) + ' ' + (digitsShown() ? DG(st.found.size) : tallyText(st.found.size)); if (!SET.muted && !FAST) say(...lineOf(numw(st.found.size)), { num: true, noGap: true, free: true });
        if (st.found.size === P.length) { st.done = true; check(); } } }); });
  }
  let down = false; const ac = new AbortController(), on = { signal: ac.signal };   /* تُزال المستمعات بعد التتبّع: التقاط المؤشّر كان يأخذ نقرة الفأرة من الأضلاع بعده */
  svg.addEventListener('pointerdown', e => { down = true; try { svg.setPointerCapture(e.pointerId); } catch (x) {} touch(svgPoint(svg, e)); }, on);
  svg.addEventListener('pointermove', e => { if (down) touch(svgPoint(svg, e)); }, on);
  const up = e => { down = false; try { svg.releasePointerCapture(e.pointerId); } catch (x) {} }; svg.addEventListener('pointerup', up, on); svg.addEventListener('pointercancel', up, on);
  async function demo(speed = 1) { for (const st of state) { const s = st.s; if (st.done) continue; if (s.type === 'circle') { const r = shapeGeom(s).r; for (let a = 0; a <= 360; a += 8) { const q = a * Math.PI / 180; touch({ x: s.x + r * Math.cos(q), y: s.y + r * Math.sin(q) }); await sleep(18 * speed); } }
      else { const P = worldPoly(s); const path = [...P, P[0]]; for (let k = 0; k < P.length; k++) for (let t = 0; t <= 1; t += .1) { touch({ x: path[k][0] + (path[k + 1][0] - path[k][0]) * t, y: path[k][1] + (path[k + 1][1] - path[k][1]) * t }); await sleep(25 * speed); } } } }
  AUTO({ kind: 'trace', ok: () => demo(.05) });
  if (firstTime('trace')) { const s = shapes.find(x => x.type !== 'circle') || shapes[0]; const P = s.type === 'circle' ? [[s.x + 60, s.y], [s.x, s.y + 60]] : worldPoly(s).slice(0, 2);
    await ghostHand(svg, P.map(([x, y]) => [x, y]), 1100); }
  armIdle(async () => { await S('gen.demo.01'); await demo(); }, { first: !SET.seen.traceIdle });
  await allDone; ac.abort(); down = false; disarmIdle(); AUTO_CLEAR(); SET.seen.traceIdle = 1;
  // عدّ الأضلاع باللمس (من الدرس الثاني، حين يدخل مصطلح «ضلع»): الأضلاع ظاهرة بخطّ منقّط خافت (M4)
  if (opt.sides) {
    const s = shapes.find(x => x.type !== 'circle'); const P = worldPoly(s); const counted = new Set();
    await S(opt.sidesIntro);
    const sideG = el('g', {}, svg);
    const longest = Math.max(...P.map((c, k) => Math.hypot(P[(k + 1) % P.length][0] - c[0], P[(k + 1) % P.length][1] - c[1])));
    const lines = P.map((c, k) => { const d = P[(k + 1) % P.length]; const len = Math.hypot(d[0] - c[0], d[1] - c[1]);
      el('line', { x1: c[0], y1: c[1], x2: d[0], y2: d[1], stroke: css('--ink'), 'stroke-opacity': .35, 'stroke-width': 3, 'stroke-dasharray': '6 6', 'pointer-events': 'none' }, sideG);
      const hit = el('line', { x1: c[0], y1: c[1], x2: d[0], y2: d[1], stroke: 'transparent', 'stroke-width': 46, 'stroke-linecap': 'round', style: 'cursor:pointer', tabindex: 0, role: 'button', 'aria-label': labelText('side') }, sideG);
      return { g: hit, c, d, len }; });
    await tapAll(lines, async (t) => { const col = opt.pairColors ? (t.len > longest * .8 ? css('--rect') : css('--square')) : css('--rect');
      SFX.pop(); el('line', { x1: t.c[0], y1: t.c[1], x2: t.d[0], y2: t.d[1], stroke: col, 'stroke-width': 9, 'stroke-linecap': 'round', 'pointer-events': 'none' }, marks);
      counted.add(t); badge(marks, (t.c[0] + t.d[0]) / 2, (t.c[1] + t.d[1]) / 2, counted.size, css('--triangle'));
      if (s.cap) s.cap.textContent = G(labelText('sides')) + ' ' + (digitsShown() ? DG(counted.size) : tallyText(counted.size));
      if (!SET.muted && !FAST) say(...lineOf(numw(counted.size)), { num: true, noGap: true, free: true });
      logAttempt({ scene: 'explore', tag: 'side', ok: true }); }, { pad: false });
  }
}

/* ② العدّ باللمس (N001): كل شيء يُلمس مرة واحدة، فيضيء ويُقال عدده؛ وآخر عدد هو «كم» */
async function countTouch(svg, pts, opt = {}) {   // pts: [{x, y, g?}] — g عنصر الشيء إن وُجد
  const marks = el('g', { 'pointer-events': 'none' }, svg); let n = 0;
  const targets = pts.map(p => { const g = p.g || el('g', { transform: `translate(${p.x} ${p.y})` }, svg); if (!p.g) el('circle', { r: 24, fill: 'transparent' }, g); g.dataset.twin = 'count'; return { g, p, label: p.label || opt.label || labelText('countPoint') }; });   /* اسم مسموع لكل نقطة عدّ؛ ونقاط العدّ متماثلة (أيّها لُمس يُعدّ واحداً) */
  await tapAll(targets, async (t) => { n++; SFX.tick(); buzz(20); const { x, y } = t.p;
    el('circle', { cx: x, cy: y, r: opt.halo || 30, fill: css('--rect'), opacity: .28 }, marks); badge(marks, x + (opt.bx ?? 0), y + (opt.by ?? -(opt.halo || 30)), n, opt.color);
    if (!SET.muted && !FAST) say(...lineOf(numw(n)), { num: true, noGap: true, free: true }); if (opt.onCount) opt.onCount(n); },
    { pad: opt.pad ?? 70, onAgain: opt.onAgain });
  return n;
}

/* ③ السلال: يعرض شيئاً واحداً، ويعيد اختيار الطفل (لمس السلة أو سحب الشيء إليها) */
function askSort(item, bins, opt = {}) {
  const svg = newStage(330, { oasis: false, ground: 0 });
  /*T*/window.__item = item; window.__n = (window.__n || 0) + 1;/*/T*/
  let g;
  if (item.riddle) {                                   // متجر المجسّمات: مظلّة ورفّ، والطلب يُسمَع
    for (let i = 0; i < 9; i++) el('path', { d: `M${i * 40} 0 h40 v34 q-20 14 -40 0z`, fill: i % 2 ? '#fffdf6' : MAT.red }, svg);
    const shopper = el('g', { transform: 'translate(180 120)' }, svg); shopper.innerHTML = kidSVG(item.shopper || 'm', item.av).replace('<svg', '<svg x="-46" y="-46" width="92" height="92"');
    const bub = el('g', { transform: 'translate(250 70)' }, svg); el('path', { d: 'M-30 -22 h60 a10 10 0 0 1 10 10 v24 a10 10 0 0 1 -10 10 h-34 l-12 12 l2 -12 h-16 a10 10 0 0 1 -10 -10 v-24 a10 10 0 0 1 10 -10z', fill: '#fff', stroke: css('--line'), 'stroke-width': 2 }, bub);
    el('text', { y: 10, 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: css('--compass'), 'font-family': css('--f') }, bub).textContent = '؟';
    g = el('g', {}, svg); bins = item.opts;
  } else { g = thingAt(svg, item, 180, 104); if (item.label) label(svg, 180, 194, item.label, 18, css('--muted')); }
  const box = document.createElement('div'); box.className = 'bins' + (item.riddle ? ' shelf' : ''); box.style.setProperty('--n', bins.length);
  bins.forEach(k => { const b = document.createElement('button'); b.className = 'bin'; b.dataset.k = k; b.innerHTML = (item.riddle ? solidIcon(k).replace('width="46" height="46"', 'width="92" height="92"') : basketSVG(k)) + `<span>${esc(BIN_NAMES[k])}</span>`; b.setAttribute('aria-label', plain(labelText('basket')) + ' ' + plain(BIN_NAMES[k])); box.appendChild(b); });
  $('#stage').appendChild(box);
  if (opt.readBins) readBins(box, opt.intro);   /* في المراجعة والاختبار: أسماء السلال مسموعة (لا تمرين قبلها يسمّيها)، و«أعد الجملة» يعيد السؤال ثم السلال */
  return new Promise(res => {
    let settled = false; const pick = k => { if (settled) return; settled = true; box.dataset.done = 1; AUTO_CLEAR(); res({ bin: k, binsEl: box, g, svg }); };
    box.querySelectorAll('.bin').forEach(b => b.onclick = () => pick(b.dataset.k));
    const okBins = [item.kind, ...((item.accept) || [])];
    AUTO({ kind: 'sort', ok: () => box.querySelector(`.bin[data-k="${okBins.find(k => bins.includes(k)) || bins[0]}"]`).click(), wrong: () => box.querySelector(`.bin:not([data-k="${item.kind}"])${(item.accept || []).map(k => `:not([data-k="${k}"])`).join('')}`).click() });
    if (item.riddle) return;   /* لغز المتجر لا شيء فيه يُسحب: الجواب لمس الرفّ (كانت منطقة سحب فارغة في زاوية المسرح) */
    let drag = null; g.style.cursor = 'grab'; hitPad(g, 64, 64);   /* ما يُسحب: 64 بكسلاً على الأقل (D250) */
    g.addEventListener('pointerdown', e => { drag = { sx: e.clientX, sy: e.clientY }; try { g.setPointerCapture(e.pointerId); } catch (x) {} });
    g.addEventListener('pointermove', e => { if (!drag) return; const ctm = svg.getScreenCTM();
      g.setAttribute('transform', `translate(${180 + (e.clientX - drag.sx) / ctm.a} ${104 + (e.clientY - drag.sy) / ctm.d}) rotate(${item.rot || 0})`);
      box.querySelectorAll('.bin').forEach(b => { const r = b.getBoundingClientRect(); b.classList.toggle('hot', e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom); }); });
    const drop = () => { if (!drag) return; drag = null; const hot = box.querySelector('.bin.hot'); box.querySelectorAll('.bin').forEach(b => b.classList.remove('hot'));
      if (hot) pick(hot.dataset.k); else g.setAttribute('transform', `translate(180 104) rotate(${item.rot || 0})`); };
    g.addEventListener('pointerup', drop); g.addEventListener('pointercancel', () => { drag = null; g.setAttribute('transform', `translate(180 104) rotate(${item.rot || 0})`); });
  });
}

/* أسماء السلال بالترتيب، وتُضاء السلّة التي يُقال اسمها (D254)؛ والكلام يتوقف حين يجيب الطفل */
function readBins(box, intro) { readChoices([...box.querySelectorAll('.bin')].filter(b => GL['gen.bin.' + b.dataset.k]).map(b => ({ line: lineOf('gen.bin.' + b.dataset.k), el: b })), { intro, host: box, noGap: true }); }
/* ④ أدوات المجسّمات (الوحدة 2) */
const FLOOR = 236;
function placeOnFloor(parent, s, x, floor = FLOOR) { const g = thingAt(parent, s, x, 0); const bb = g.getBBox();
  const y = floor - (bb.y + bb.height) + 4; g.setAttribute('transform', `translate(${x} ${y}) rotate(${s.rot || 0})`); g.__x = x; g.__y = y; return g; }
function floorLine(svg, y = FLOOR) { el('rect', { x: 0, y, width: 360, height: 300 - y + 60, fill: css('--ground'), opacity: .55 }, svg); el('line', { x1: 0, y1: y, x2: 360, y2: y, stroke: css('--ink'), 'stroke-opacity': .25, 'stroke-width': 3 }, svg); }
const PICKICON = {
  roll: '<svg viewBox="0 0 40 24" width="40" height="24"><path d="M4 18 Q20 -2 36 18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M30 12 l6 6 l-8 2" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  stay: '<svg viewBox="0 0 40 24" width="40" height="24"><rect x="12" y="4" width="16" height="16" rx="2" fill="currentColor"/><line x1="4" y1="21" x2="36" y2="21" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  straight: '<svg viewBox="0 0 40 24" width="40" height="24"><line x1="36" y1="12" x2="8" y2="12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M13 6 l-7 6 l7 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  around: '<svg viewBox="0 0 40 24" width="40" height="24"><path d="M28 6 A9 9 0 1 0 29 16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M24 3 l5 3 l-4 4" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  square: '<svg viewBox="0 0 40 24" width="40" height="24"><rect x="11" y="2" width="20" height="20" fill="none" stroke="currentColor" stroke-width="3"/></svg>',
  circle: '<svg viewBox="0 0 40 24" width="40" height="24"><circle cx="20" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3"/></svg>',
  dot: '<svg viewBox="0 0 40 24" width="40" height="24"><circle cx="20" cy="12" r="3.5" fill="currentColor"/></svg>',
  yes: ICON.check.replace('<svg', '<svg width="40" height="28"'), no: ICON.cross.replace('<svg', '<svg width="40" height="28"'),
  same: '<svg viewBox="0 0 40 24" width="40" height="24"><path d="M8 8h24M8 16h24" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></svg>',
  changed: '<svg viewBox="0 0 40 24" width="40" height="24"><path d="M8 8h24M8 16h24" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><path d="M26 3L14 21" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></svg>',
  normal: '<svg viewBox="0 0 40 28" width="40" height="28"><path d="M20 26V12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M20 14c-8 0-12-5-12-11 7 0 12 4 12 11zM20 12c0-6 4-10 11-10 0 6-4 10-11 10z" fill="currentColor"/></svg>',
  challenge: '<svg viewBox="0 0 40 28" width="40" height="28"><path d="M2 26 L14 8 L21 18 L27 10 L38 26 Z" fill="currentColor"/><path d="M14 8 l3 5 l-5 0z" fill="#fff"/></svg>',
  mat: '<svg viewBox="0 0 40 28" width="40" height="28"><path d="M6 12h28l-3 14H9z" fill="currentColor"/><path d="M14 12V8a6 6 0 0 1 12 0v4" fill="none" stroke="currentColor" stroke-width="3"/></svg>',
  screen: '<svg viewBox="0 0 40 28" width="40" height="28"><rect x="9" y="2" width="22" height="24" rx="4" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="20" cy="22" r="1.8" fill="currentColor"/></svg>',
};
const solidIcon = k => `<svg viewBox="-42 -46 84 84" width="46" height="46" aria-hidden="true">${thingMarkup({ solid: k, size: 70 }, 0, 0, 1)}</svg>`;
/* يد صغيرة تدفع الشيء من اليسار */
function handAt(svg, x, y) { const h = el('g', { transform: `translate(${x} ${y})` }, svg);
  el('path', { d: 'M-34 -8 h22 a8 8 0 0 1 0 16 h-22 z', fill: '#f1c9a5', stroke: '#c98f55', 'stroke-width': 2 }, h); el('rect', { x: -52, y: -11, width: 20, height: 22, rx: 6, fill: '#5c9bb0' }, h); return h; }
/* تجربة الدفع: ‏roll يتدحرج بعيداً، tip ينقلب مرة ويقف، stay يبقى مكانه */
async function pushTest(svg, s, behave, x0 = 110) {
  const g = placeOnFloor(svg, s, x0); const bb = g.getBBox(); const left = x0 + bb.x, y0 = g.__y;
  const hand = handAt(svg, left - 70, FLOOR - bb.height * .45);
  await anim(hand, [{ transform: `translate(${left - 70}px,${FLOOR - bb.height * .45}px)` }, { transform: `translate(${left - 2}px,${FLOOR - bb.height * .45}px)` }], { duration: 700, fill: 'forwards', easing: 'ease-in' }).done;
  SFX.pop();
  if (behave === 'roll') {
    const dist = 330 - x0 - bb.width / 2;
    for (let k = 0; k < 3; k++) el('line', { x1: -30 - bb.width / 2, y1: -14 - k * 14 + bb.y + bb.height, x2: -14 - bb.width / 2, y2: -14 - k * 14 + bb.y + bb.height, stroke: css('--ink'), 'stroke-opacity': .25, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    const sp = g.querySelector('.spoke'); if (sp) anim(sp, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(540deg)' }], { duration: 1600, fill: 'forwards', easing: 'ease-out' });
    await anim(g, [{ transform: `translate(${x0}px,${y0}px)` }, { transform: `translate(${x0 + dist}px,${y0}px)` }], { duration: 1600, fill: 'forwards', easing: 'cubic-bezier(.2,.7,.4,1)' }).done;
  } else if (behave === 'tip') {
    const px = bb.x + bb.width - 4, py = bb.y + bb.height - 8; const fr = [];
    for (let a = 0; a <= 90; a += 10) fr.push({ transform: `translate(${x0}px,${y0}px) translate(${px}px,${py}px) rotate(${a}deg) translate(${-px}px,${-py}px)` });
    await anim(g, fr, { duration: 650, fill: 'forwards', easing: 'ease-in' }).done;
    SFX.soft(); g.remove(); const g2 = placeOnFloor(svg, { ...s }, x0 + bb.width * .9);
    anim(g2, [{ transform: `translate(${g2.__x}px,${g2.__y - 4}px)` }, { transform: `translate(${g2.__x}px,${g2.__y}px)` }], 160);
  } else {
    await anim(g, [{ transform: `translate(${x0}px,${y0}px)` }, { transform: `translate(${x0 + 8}px,${y0}px) rotate(3deg)` }, { transform: `translate(${x0 + 8}px,${y0}px) rotate(-2deg)` }, { transform: `translate(${x0 + 8}px,${y0}px)` }], { duration: 700, fill: 'forwards' }).done;
  }
  anim(hand, [{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' });
  await sleep(300);
}
/* المس الوجوه: كل وجه مسطّح يُلمس بالكف فيضيء؛ أو السطح المنحني فيُقال إنه بلا وجه */
async function faceTouch(svg, s, x, y, cfg) {
  const g = thingAt(svg, s, x, y);
  const faces = [...g.querySelectorAll('[data-face]')].filter(f => cfg.faces.includes(f.dataset.face));
  const need = cfg.need || faces.length;
  const targets = faces.map(f => ({ g: f, label: labelText('face') }));
  let n = 0;
  await new Promise(res => { tapAll(targets.slice(0, faces.length), async (t) => { n++; SFX.pop(); buzz(25); const f = t.g;
      const bb = f.getBBox(); const palm = el('g', { transform: `translate(${bb.x + bb.width / 2} ${bb.y + bb.height / 2})`, 'pointer-events': 'none' }, g);
      el('path', { d: 'M-9 8 q-3 -10 0 -18 q2 -4 4 0 l1 8 l1 -12 q2 -4 4 0 l0 12 l1 -10 q2 -4 4 0 l0 12 q4 -6 6 -2 q-2 10 -10 16 z', fill: '#ffe9a8', stroke: '#c98f55', 'stroke-width': 1.5 }, palm);
      anim(palm, [{ transform: `translate(${bb.x + bb.width / 2}px,${bb.y + bb.height / 2}px) scale(.2)` }, { transform: `translate(${bb.x + bb.width / 2}px,${bb.y + bb.height / 2}px) scale(1)` }], { duration: 240, easing: 'cubic-bezier(.3,1.6,.6,1)' });
      f.setAttribute('stroke', '#f6cf7e'); f.setAttribute('stroke-width', 5);
      logAttempt({ scene: 'explore', tag: 'face-' + (s.solid || 'x'), ok: true });
      if (cfg.onTouch) await cfg.onTouch(n, g); if (n >= need) res(); }, { pad: false }); });
  AUTO_CLEAR(); return g;
}
/* منظر من الأعلى: الأسطوانة النائمة تتدحرج مستقيمة، والمخروط النائم يدور حول رأسه */
function topView(svg) { el('rect', { x: -360, y: 0, width: 1080, height: 300, fill: css('--top-a') }, svg);
  for (let i = 0; i < 9; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2) el('rect', { x: i * 40, y: j * 40, width: 40, height: 40, fill: css('--top-b') }, svg);
  const eye = el('g', { transform: 'translate(330 26)' }, svg); el('ellipse', { rx: 16, ry: 10, fill: '#fff', stroke: css('--ink'), 'stroke-width': 2 }, eye); el('circle', { r: 5, fill: css('--compass') }, eye); }
function cylTop(svg, x, y, color) { const g = el('g', { transform: `translate(${x} ${y})` }, svg);
  const f = grad(g, 'linearGradient', [[0, mix(color, 'b', .3)], [.4, mix(color, 'w', .3)], [1, mix(color, 'b', .35)]], { x1: 0, y1: 0, x2: 0, y2: 1 });
  el('rect', { x: -70, y: -26, width: 140, height: 52, rx: 4, fill: f, stroke: '#fff', 'stroke-width': 3 }, g);
  const st = el('g', { class: 'stripes' }, g); for (let k = -3; k <= 3; k++) el('line', { x1: -66, y1: k * 9, x2: 66, y2: k * 9, stroke: '#fff', 'stroke-opacity': .25, 'stroke-width': 2 }, st); return g; }
function coneTop(svg, px, py, color) { const g = el('g', { transform: `translate(${px} ${py})` }, svg);
  const f = grad(g, 'linearGradient', [[0, mix(color, 'b', .3)], [.45, mix(color, 'w', .3)], [1, mix(color, 'b', .35)]], { x1: 0, y1: 0, x2: 0, y2: 1 });
  el('path', { d: 'M0 0 L120 -34 A8 34 0 0 1 120 34 Z', fill: f, stroke: '#fff', 'stroke-width': 3, 'stroke-linejoin': 'round' }, g); el('circle', { r: 5, fill: css('--chaos') }, g); return g; }
async function rollTop(svg, which) {
  if (which === 'cylinder') {
    const g = cylTop(svg, 180, 70, SOLIDC.cylinder); const trail = el('g', {}, svg); svg.appendChild(g);
    await tween(2200, t => { const y = 70 + 170 * t; g.setAttribute('transform', `translate(180 ${y})`); g.querySelector('.stripes').setAttribute('transform', `translate(0 ${((y * 1.5) % 9) - 4})`);
      if (Math.round(y) % 12 < 3) el('circle', { cx: 180, cy: y, r: 3, fill: css('--compass'), opacity: .55 }, trail); });
  } else {
    const g = coneTop(svg, 180, 150, SOLIDC.cone); const trail = el('g', {}, svg); svg.appendChild(g);
    await tween(3200, t => { const a = 360 * t; g.setAttribute('transform', `translate(180 150) rotate(${a})`); const q = a * Math.PI / 180; el('circle', { cx: 180 + 120 * Math.cos(q), cy: 150 + 120 * Math.sin(q), r: 3, fill: css('--chaos'), opacity: .5 }, trail); });
  }
}
/* خِتامة الوجه: ينزل المجسّم على الحبر ثم على الورقة، ثم تُرفع الورقة لنرى البصمة */
async function stampTest(svg, s, print) {
  el('rect', { x: 26, y: 214, width: 92, height: 22, rx: 6, fill: '#5d4b8a' }, svg); el('rect', { x: 32, y: 210, width: 80, height: 8, rx: 4, fill: '#8e6bbf' }, svg);
  const paperG = el('g', { transform: 'translate(250 230)' }, svg); el('polygon', { points: '-80,0 80,0 64,-16 -64,-16', fill: '#fffdf6', stroke: '#d9d2c3', 'stroke-width': 2 }, paperG);
  const g = placeOnFloor(svg, s, 72, 170); const x0 = 72, y0 = g.__y;
  const mv = (from, to, d = 600) => anim(g, [{ transform: `translate(${from[0]}px,${from[1]}px)` }, { transform: `translate(${to[0]}px,${to[1]}px)` }], { duration: d, fill: 'forwards', easing: 'ease-in-out' }).done;
  await mv([x0, y0], [x0, y0 + 44]); SFX.soft(); await mv([x0, y0 + 44], [x0, y0 - 20]); await mv([x0, y0 - 20], [250, y0 - 20], 780);
  await mv([250, y0 - 20], [250, y0 + 54]); SFX.pop(); buzz(40); await mv([250, y0 + 54], [250, y0 - 30]);
  anim(g, [{ opacity: 1 }, { opacity: .25 }], { duration: 300, fill: 'forwards' });
  const card = el('g', { transform: 'translate(250 150)' }, svg); el('rect', { x: -70, y: -60, width: 140, height: 120, rx: 6, fill: '#fffdf6', stroke: '#d9d2c3', 'stroke-width': 2, filter: 'url(#pp)' }, card);
  const ink = '#6e55a8';
  if (print === 'square') el('rect', { x: -32, y: -32, width: 64, height: 64, fill: ink, opacity: .85 }, card);
  if (print === 'rect') el('rect', { x: -44, y: -24, width: 88, height: 48, fill: ink, opacity: .85 }, card);
  if (print === 'circle') el('circle', { r: 34, fill: ink, opacity: .85 }, card);
  if (print === 'dot') el('circle', { r: 5, fill: ink, opacity: .85 }, card);
  await anim(card, [{ transform: 'translate(250px,226px) scale(1,.06)' }, { transform: 'translate(250px,150px) scale(1,1)' }], { duration: 700, fill: 'forwards', easing: 'cubic-bezier(.3,1.3,.6,1)' }).done;
}
/* المسطّح والمجسّم يدوران معاً: الورقة تصير خطاً، والمكعب يبقى كتلة */
async function edgeTurn(svg, x1 = 100, x2 = 262) {
  const a = el('g', { transform: `translate(${x1} 140)` }, svg), b = el('g', { transform: `translate(${x2} 140)` }, svg);
  const draw = yaw => { a.innerHTML = ''; b.innerHTML = '';
    drawBox(a, { w: 96, h: 96, d: 2.5, yaw, pitch: 6, color: css('--square') }); drawBox(b, { w: 76, h: 76, d: 76, yaw, pitch: 12, color: SOLIDC.cube }); };
  await tween(2600, t => draw(4 + 84 * easeIO(t)));
}
/* دوران مؤقت لشكل مدوَّر أو مقلوب: نعيده إلى وضعه المألوف ثم نرجعه */
function straighten(g, item, x = 180, y = 104) { const r = item.rot || 0; if (!r) return Promise.resolve();
  return anim(g, [{ transform: `translate(${x}px,${y}px) rotate(${r}deg)` }, { transform: `translate(${x}px,${y}px) rotate(0deg)` }, { transform: `translate(${x}px,${y}px) rotate(0deg)` }, { transform: `translate(${x}px,${y}px) rotate(${r}deg)` }], { duration: 2600, easing: 'ease-in-out' }).done; }
