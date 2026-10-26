/* =====================================================================
   بنود الإنتاج والتعليل للأشكال والمجسّمات (D240: لكل مفهوم بند تعرّف وبند إنتاج أو تعليل)
   ===================================================================== */
/* المس رؤوس الشكل (إنتاج الوصف، C001/C004): لمسة خارج الرؤوس تُعدّ خطأً */
ITEM.vertices = {
  make(spec) { return { ...spec, tag: 'vertices', s: make(spec.shape), want: 'all' }; },
  async ask(item, mode, tries) { const svg = newStage(260, { oasis: false, ground: 0 }); const s = { ...item.s, x: 180, y: 130 }; const g = shapeAt(svg, s, 180, 130); const P = worldPoly(s);
    if (tries >= 2) P.forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 16, fill: 'none', stroke: css('--compass'), 'stroke-width': 3, 'stroke-dasharray': '4 4', 'pointer-events': 'none' }, svg));
    await S(tries >= 3 ? 'gen.vertices.together' : 'gen.vertices.ask');
    const marks = el('g', { 'pointer-events': 'none' }, svg); let missed = false, res; const p = new Promise(r => res = r);
    g.style.cursor = 'pointer'; g.onclick = () => { if (missed) return; missed = true; SFX.soft(); AUTO_CLEAR(); res('miss'); };
    const tg = P.map(([x, y]) => { const h = el('g', { transform: `translate(${x} ${y})` }, svg); el('circle', { r: 30, fill: 'transparent' }, h); return { g: h, p: { x, y }, label: labelText('vertex') }; });
    let n = 0; tapAll(tg, async t => { n++; SFX.tick(); badge(marks, t.p.x, t.p.y, n); if (!SET.muted && !FAST) say(...lineOf(numw(n)), { num: true, noGap: true, free: true }); if (n === P.length) res('all'); }, { pad: 64 });   /* منطقة لمس حول كل رأس (≥ 56 بكسلاً) */
    AUTO({ kind: 'vertices', ok: () => tg.forEach(t => t.g.dispatchEvent(new MouseEvent('click', { bubbles: true }))), wrong: () => g.dispatchEvent(new MouseEvent('click', { bubbles: true })) });
    const ans = await gate(p); AUTO_CLEAR(); return { ans, ctx: { svg, g, P } }; },
  judge(item, a) { return a === 'all' ? { ok: true } : { ok: false, err: 'notVertex' }; },
  onOk() { SFX.good(); }, onWrong() {},
  async hint2(item, r) { await VIS.edges(null, r.ctx); }, async together() {}, async reveal(item, r) { await badgeCount(r.ctx.svg, r.ctx.P.map(([x, y]) => ({ x, y }))); },
  praise: () => 'praiseLook', twin(item) { return { ...item.spec }; }, reason(item) { return item.why || null; },
};
/* صِل النقاط الثلاث حتى يُغلق المثلث (إنتاج C002) */
ITEM.connect = {
  make(spec) { return { ...spec, tag: 'connect', want: 'closed', dots: spec.dots || [[180, 50], [92, 200], [276, 196]] }; },
  async ask(item, mode, tries) { const svg = newStage(250, { oasis: false, ground: 0 }); const lines = el('g', {}, svg); const D = item.dots; const seq = [];
    const draw = () => { lines.innerHTML = ''; for (let i = 1; i < seq.length; i++) el('line', { x1: D[seq[i - 1]][0], y1: D[seq[i - 1]][1], x2: D[seq[i]][0], y2: D[seq[i]][1], stroke: css('--triangle'), 'stroke-width': 8, 'stroke-linecap': 'round' }, lines); };
    if (tries >= 3) { seq.push(0, 1, 2); draw(); }
    const dots = D.map(([x, y], i) => { const g = el('g', { transform: `translate(${x} ${y})` }, svg); el('circle', { r: 13, fill: css('--compass'), stroke: '#fff', 'stroke-width': 3 }, g); el('circle', { r: 34, fill: 'transparent' }, g); g.style.cursor = 'pointer'; g.setAttribute('role', 'button'); g.setAttribute('aria-label', labelText('dot')); hitPad(g, 68); return g; });
    if (tries >= 2) el('line', { x1: D[2][0], y1: D[2][1], x2: D[0][0], y2: D[0][1], stroke: css('--think'), 'stroke-width': 4, 'stroke-dasharray': '6 6', 'pointer-events': 'none' }, svg);
    await S(tries >= 3 ? 'gen.connect.together' : 'gen.connect.ask'); const d = doneBtn(); let res; const p = new Promise(r => res = r);
    dots.forEach((g, i) => g.onclick = () => { const last = seq[seq.length - 1]; if (last === i) return; if (seq.length >= 3 && i === seq[0]) { seq.push(i); draw(); SFX.good(); res('closed'); return; } if (seq.includes(i)) return; seq.push(i); draw(); SFX.pop(); });
    d.b.onclick = () => { if (seq.length < 2) return; res(seq.length >= 4 && seq[seq.length - 1] === seq[0] ? 'closed' : 'open'); };
    AUTO({ kind: 'connect', ok: () => { [0, 1, 2, 0].forEach(i => dots[i].dispatchEvent(new MouseEvent('click', { bubbles: true }))); }, wrong: () => { [0, 1, 2].forEach(i => dots[i].dispatchEvent(new MouseEvent('click', { bubbles: true }))); d.b.click(); } });
    const ans = await gate(p); AUTO_CLEAR(); hush(); d.bar.remove(); return { ans, ctx: { svg } }; },
  judge(item, a) { return a === 'closed' ? { ok: true } : { ok: false, err: 'openShape' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); }, async hint2() {}, async together() {}, async reveal() { await S('gen.connect.reveal'); },
  praise: () => 'praiseLook', twin(item) { return { ...item.spec, dots: [[200, 46], [70, 170], [300, 210]] }; },
};
/* أكمل المستطيل على شبكة النقاط: اختر الركن الرابع (إنتاج C003) */
ITEM.completeRect = {
  make(spec) { return { ...spec, tag: 'completeRect', want: spec.ans.join(',') }; },
  async ask(item, mode, tries) { const svg = newStage(260, { oasis: false, ground: 0 }); const gx = i => 300 - i * 52, gy = j => 40 + j * 52;
    for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) el('circle', { cx: gx(i), cy: gy(j), r: 4, fill: css('--muted') }, svg);
    const C = item.corners; const path = C.map(([i, j]) => `${gx(i)},${gy(j)}`).join(' ');
    el('polyline', { points: path, fill: 'none', stroke: css('--rect'), 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
    const cand = (item.cand || []).map(([i, j]) => { const g = el('g', { transform: `translate(${gx(i)} ${gy(j)})` }, svg); el('circle', { r: 11, fill: css('--paper'), stroke: css('--compass'), 'stroke-width': 3 }, g); return { g, k: i + ',' + j, label: labelText('dot') }; });
    await S(tries >= 3 ? 'gen.rect.together' : 'gen.rect.ask'); const k = await tapOne(cand, { ok: item.want, pad: 70 });
    const [i, j] = k.split(',').map(Number); el('polyline', { points: `${gx(C[2][0])},${gy(C[2][1])} ${gx(i)},${gy(j)} ${gx(C[0][0])},${gy(C[0][1])}`, fill: 'none', stroke: css('--rect'), 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-dasharray': k === item.want ? null : '8 6' }, svg);
    return { ans: k, ctx: { svg, quad: [...C, [i, j]].map(([a, b]) => [gx(a), gy(b)]) } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'notRight' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const q = r.ctx.quad; const m = el('g', {}, r.ctx.svg);
    for (const [k, p] of q.entries()) { const a = q[(k + 3) % 4], b = q[(k + 1) % 4]; const u = [a[0] - p[0], a[1] - p[1]], v = [b[0] - p[0], b[1] - p[1]]; const lu = Math.hypot(...u), lv = Math.hypot(...v);
      const right = Math.abs((u[0] * v[0] + u[1] * v[1]) / (lu * lv)) < .08; const s = 18; const q1 = [p[0] + u[0] / lu * s, p[1] + u[1] / lu * s], q2 = [p[0] + v[0] / lv * s, p[1] + v[1] / lv * s];
      el('path', { d: `M${q1[0]} ${q1[1]} L${q1[0] + v[0] / lv * s} ${q1[1] + v[1] / lv * s} L${q2[0]} ${q2[1]}`, fill: 'none', stroke: right ? css('--good') : css('--think'), 'stroke-width': 4 }, m); await sleep(400); }
    await sleep(1000); },
  async together() {}, async reveal() { await S('gen.rect.reveal'); }, praise: () => 'praiseLook', twin(item) { return { ...item.spec }; },
};
/* نعم أم لا على صورة (مثال مضاد: «هل للكرة وجه مسطّح؟») */
ITEM.yesno = {
  make(spec) { return { ...spec, tag: spec.tag || 'yesno', it: make(spec.show), want: spec.ans ? 'yes' : 'no' }; },
  async ask(item) { const svg = newStage(230, { oasis: false, ground: 0 }); const g = fitThing(svg, item.it, 180, 112, 150); await S(item.q);
    const k = await choosePick([['yes', labelText('yes'), PICKICON.yes, 'gen.opt.yes'], ['no', labelText('no'), PICKICON.no, 'gen.opt.no']], item.want); return { ans: k, ctx: { svg, g } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: item.err || 'generic' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { await (VIS[item.vis] || VIS.edges)(item.it, r.ctx); }, async together(item) { if (item.solve) await S(item.solve); }, async reveal(item) { if (item.why) await S(item.why); },
  praise: () => 'praiseThink', reason(item) { return null; }, twin(item) { return item.twin || null; },
};
/* توقّع الدفع (تعليل بالخاصية، C009) */
ITEM.property = {
  make(spec) { const it = make(spec.mk); return { ...spec, it, tag: 'prop-' + (it.tag || it.solid), want: spec.want || (it.solid === 'sphere' || (it.solid === 'cylinder' && it.pose === 'lying') ? 'roll' : 'stay') }; },
  async ask(item, mode, tries) { const svg = newStage(280, { oasis: false, ground: 0 }); floorLine(svg);   /* 280: تسمية الشيء (y = 262) داخل المسرح (كانت تُقصّ بحدّه على Pixel 5: clipped texts) */
    /* من المحاولة الثالثة تُعاد التجربة: الدفع يرسم الشيء نفسه (لا يُرسم ثم يُمحى) */
    const g = tries >= 2 ? null : placeOnFloor(svg, { ...item.it, size: Math.min(item.it.size || 110, 100), label: null }, 120);
    if (item.it.label) label(svg, 120, 262, item.it.label, 16, css('--muted'));
    /* «شاهد التجربة مرة أخرى، ثم اختر» قبل التجربة لا بعدها (الفحص المستقل D) */
    if (tries >= 3) await S('gen.prop.together');
    if (tries >= 2) await pushTest(svg, { ...item.it, size: Math.min(item.it.size || 110, 100), label: null }, item.want === 'roll' ? 'roll' : (item.it.solid === 'cube' || item.it.solid === 'box' ? 'tip' : 'stay'));
    const nm = objClip(item.it); if (nm) await S(nm);   /* اسم الشيء المكتوب تحته يُقال (المبدأ 8) */
    await S('gen.prop.ask');
    const k = await choosePick([['roll', labelText('rolls'), PICKICON.roll, 'gen.opt.rolls'], ['stay', labelText('stays'), PICKICON.stay, 'gen.opt.stays']], item.want); return { ans: k, ctx: { svg, g } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: item.want === 'roll' ? 'rollMissed' : 'cubeNotRoll' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); }, async hint2() {}, async together() {},
  async reveal(item) { await S(item.want === 'roll' ? 'gen.prop.rolls' : 'gen.prop.stays'); }, praise: () => 'praiseThink', reason(item) { return item.why || null; }, twin(item) { return item.twin || null; },
};
/* المس الوجه المسطّح (إنتاج C009: الوجوه) — لمس السطح المنحني خطأ */
ITEM.faceTap = {
  make(spec) { return { ...spec, it: make(spec.mk), tag: 'faceTap', want: 'face' }; },
  async ask(item, mode, tries) { const svg = newStage(260, { oasis: false, ground: 0 }); const g = thingAt(svg, { ...item.it, size: faceSize(svg, 160), ry: .34, label: null }, 180, 130);   /* القاعدة الدائرية ≥ 56 بكسل ليلمسها الإصبع */
    const faces = [...g.querySelectorAll('[data-face]')].filter(f => f.dataset.face !== 'curved'); const curved = [...g.querySelectorAll('path, circle')].filter(n => !n.dataset.face && n.closest('g') && !faces.includes(n));
    if (tries >= 2) faces.forEach(f => { f.setAttribute('stroke', css('--compass')); f.setAttribute('stroke-width', 5); f.setAttribute('stroke-dasharray', '6 5'); });
    await S(tries >= 3 ? 'gen.face.together' : (item.prompt || 'gen.face.ask')); let res; const p = new Promise(r => res = r);
    curved.forEach(n => { n.style.cursor = 'pointer'; n.onclick = e => { e.stopPropagation(); res('curved'); }; });
    faces.forEach(f => { f.style.cursor = 'pointer'; f.setAttribute('role', 'button'); f.setAttribute('aria-label', labelText('face')); f.onclick = e => { e.stopPropagation(); f.setAttribute('stroke', '#f6cf7e'); f.setAttribute('stroke-width', 6); res('face'); }; });
    AUTO({ kind: 'faceTap', ok: () => faces[0].dispatchEvent(new MouseEvent('click', { bubbles: true })), wrong: () => (curved[0] || faces[0]).dispatchEvent(new MouseEvent('click', { bubbles: true })) });
    const ans = await gate(p); AUTO_CLEAR(); hush(); return { ans, ctx: { svg, g } }; },
  judge(item, a) { return a === 'face' ? { ok: true } : { ok: false, err: 'curvedNotFace' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); }, async hint2() {}, async together() {}, async reveal() { await S('gen.face.reveal'); },
  praise: () => 'praiseLook', reason(item) { return item.why || null; }, twin(item) { return { ...item.spec }; },
};
/* ما شكل البصمة؟ (تعليل C008/C009) */
ITEM.stamp = {
  make(spec) { const it = make(spec.mk); return { ...spec, it, tag: 'stamp-' + it.solid, want: spec.print }; },
  async ask(item, mode, tries) { const svg = newStage(260, { oasis: false, ground: 0 }); floorLine(svg, 236);
    if (tries >= 3) await S('gen.stamp.together');   /* «شاهد الختم مرة أخرى» قبل الختم لا بعده */
    if (tries >= 2) await stampTest(svg, { ...item.it, size: 84, label: null }, item.print); else placeOnFloor(svg, { ...item.it, size: 92, label: null }, 120, 236);
    await S('gen.stamp.ask');
    const opts = [['square', labelText('printSquare'), 'gen.opt.printSquare'], ['circle', labelText('printCircle'), 'gen.opt.printCircle'], ['dot', labelText('printDot'), 'gen.opt.printDot']]; if (item.print === 'rect') opts.splice(1, 0, ['rect', labelText('printRect'), 'gen.opt.printRect']);
    const k = await choosePick(opts.map(([a, b, c]) => [a, b, PICKICON[a] || PICKICON.square, c]), item.print); return { ans: k, ctx: { svg } }; },
  judge(item, k) { return k === item.print ? { ok: true } : { ok: false, err: 'stampWrong' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); }, async hint2() {}, async together() {}, async reveal() { await S('gen.stamp.reveal'); },
  praise: () => 'praiseThink', reason(item) { return item.why || null; }, twin(item) { return item.twin || null; },
};
/* المس كل ما هو كذا (تعرّف بأوضاع مختلفة): يلمس الطفل الأشياء ثم «تمّ». want: نوع أو أنواع، أو rolls: true */
const isTarget = (item, s) => item.rolls ? (s.solid === 'sphere' || (s.solid === 'cylinder' && s.pose === 'lying')) : [].concat(item.want).includes(s.kind);
ITEM.pickAll = {
  make(spec) { const objs = noShadowIfMixed(spec.objs.map(r => make(r))); return { ...spec, objs, tag: spec.tag || 'pickAll', targets: objs.map((s, i) => isTarget(spec, s) ? i : -1).filter(i => i >= 0) }; },
  async ask(item, mode, tries) { const svg = newStage(270, { oasis: false, ground: 0 }); const n = item.objs.length; const cols = n > 4 ? 3 : n; const order = item.order || (item.order = shuffle(item.objs.map((_, i) => i)));
    const sel = new Set(); const marks = el('g', { 'pointer-events': 'none' }, svg);
    const cells = order.map((oi, pos) => { const c = pos % cols, r = Math.floor(pos / cols); const x = 360 - (c + .5) * (360 / cols), y = n > cols ? 70 + r * 120 : 120;
      const g = fitThing(svg, { ...item.objs[oi], label: null }, x, y, 92); if (item.objs[oi].label && item.names) label(svg, x, y + 58, item.objs[oi].label, 14, css('--muted')); return { g, oi, x, y }; });
    const redraw = () => { marks.innerHTML = ''; sel.forEach(oi => { const c = cells.find(q => q.oi === oi); el('circle', { cx: c.x, cy: c.y, r: 54, fill: 'none', stroke: css('--compass'), 'stroke-width': 5 }, marks); el('circle', { cx: c.x + 38, cy: c.y - 38, r: 13, fill: css('--compass') }, marks);
      el('path', { d: `M${c.x + 31} ${c.y - 38} l5 5 l9 -10`, stroke: '#fff', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, marks); }); };
    if (tries >= 3) { item.targets.slice(0, -1).forEach(i => sel.add(i)); redraw(); }
    cells.forEach(c => { c.g.style.cursor = 'pointer'; c.g.setAttribute('role', 'button'); c.g.setAttribute('tabindex', 0); c.g.setAttribute('aria-label', plain(item.objs[c.oi].label || labelText('shapeOne')));   /* لا اسم النوع المطلوب (D254 (3)) */ hitPad(c.g, 96);
      /*T*/if (TESTHOOK) c.g.dataset.ok = item.targets.includes(c.oi);/*/T*/
      c.g.onclick = () => { if (sel.has(c.oi)) sel.delete(c.oi); else { sel.add(c.oi); const nm = item.names && objClip(item.objs[c.oi]); if (nm) say(...lineOf(nm), { free: true, ifIdle: true }); } SFX.tick(); redraw(); }; });
    await S(tries >= 3 ? 'gen.pickAll.together' : item.q); const d = doneBtn();
    AUTO({ kind: 'pickAll', ok: () => { sel.clear(); item.targets.forEach(i => sel.add(i)); d.b.click(); }, wrong: () => { sel.clear(); item.targets.slice(1).forEach(i => sel.add(i)); d.b.click(); } });
    const ans = await gate(new Promise(res => d.b.onclick = () => { if (!sel.size) return; AUTO_CLEAR(); hush(); d.bar.remove(); res([...sel].sort()); })); return { ans, ctx: { svg, cells, marks } }; },
  judge(item, ans) { const want = item.targets.slice().sort(); if (ans.join() === want.join()) return { ok: true };
    const miss = want.find(i => !ans.includes(i)), extra = ans.find(i => !want.includes(i)); const e = item.errs || {};
    if (miss != null) { const s = item.objs[miss]; item._bad = miss; return { ok: false, err: e[s.tag] || e.miss || 'generic' }; }
    const s = item.objs[extra]; item._bad = extra; return { ok: false, err: e[s.tag] || e.extra || 'generic' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const c = r.ctx.cells.find(q => q.oi === item._bad); if (c) await VIS.edges(null, { g: c.g, svg: r.ctx.svg }); },
  async together() {}, mark(item, r) { item.targets.forEach(i => { const c = r.ctx.cells.find(q => q.oi === i); el('circle', { cx: c.x, cy: c.y, r: 54, fill: 'none', stroke: css('--good'), 'stroke-width': 5 }, r.ctx.svg); }); },
  async reveal(item, r) { ITEM.pickAll.mark(item, r); await sleep(800); }, praise: () => 'praiseLook', reason(item) { return item.why || null; }, twin(item) { return { ...item.spec }; },
};
/* لوّن الأشكال (الدرس 1): اختر وعاء اللون ثم المس الشكل. الألوان ألوان الهوية (D41) */
ITEM.paint = {
  make(spec) { const objs = spec.shapes.map(r => make(r)); return { ...spec, objs, tag: 'paint', want: objs.map(s => s.kind).join() }; },
  async ask(item, mode, tries) { const svg = newStage(250, { oasis: false, ground: 0 }); const n = item.objs.length; const fill = {};
    const cells = item.objs.map((s, i) => { const x = 360 - (i + .5) * (360 / n), y = 110; const g = fitThing(svg, { ...s, color: '#ffffff', label: null }, x, y, 78); g.querySelectorAll('polygon,circle,ellipse,rect,path').forEach(p => { if (p.getAttribute('fill') === '#ffffff') p.setAttribute('data-paint', 1); }); return { g, i, x, y }; });
    const paintCell = (c, k) => { fill[c.i] = k; c.g.querySelectorAll('[data-paint]').forEach(p => p.setAttribute('fill', css(IDC[k]))); };
    if (tries >= 3) item.objs.slice(0, -1).forEach((s, i) => paintCell(cells[i], s.kind));
    let pot = null; const box = document.createElement('div'); box.className = 'choices icons pots'; $('#stage').appendChild(box);
    const pots = item.pots.map(k => { const b = document.createElement('button'); b.className = 'pick pot'; b.dataset.k = k; b.style.setProperty('--pot', css(IDC[k])); b.innerHTML = `<svg viewBox="0 0 40 28" width="44" height="30" aria-hidden="true"><path d="M6 8h28l-3 18H9z" fill="${css(IDC[k])}" stroke="#fff" stroke-width="2"/></svg><span>${esc(G(labelText('paint.' + k)))}</span>`; b.setAttribute('aria-label', plain(G(labelText('paint.' + k)))); b.setAttribute('aria-pressed', 'false');
      b.onclick = () => { pot = k; pots.forEach(q => q.setAttribute('aria-pressed', q === b)); SFX.tick(); say(...lineOf('gen.opt.paint.' + k), { free: true, ifIdle: true }); }; box.appendChild(b); return b; });   /* الوعاء ينطق لونه */
    await S(tries >= 3 ? 'gen.paint.together' : item.q);
    let res; const p = new Promise(r => res = r);
    cells.forEach(c => { c.g.style.cursor = 'pointer'; c.g.setAttribute('role', 'button'); c.g.setAttribute('aria-label', plain(labelText('shapeOne'))); hitPad(c.g, 84); c.g.onclick = () => { if (!pot) { S('gen.paint.pot', { ifIdle: true, free: true }); return; } paintCell(c, pot); SFX.pop(); if (Object.keys(fill).length === n) res(); }; });
    AUTO({ kind: 'paint', ok: () => { cells.forEach(c => paintCell(c, item.objs[c.i].kind)); res(); }, wrong: () => { cells.forEach((c, j) => paintCell(c, j === 0 ? item.pots.find(k => k !== item.objs[0].kind) : item.objs[c.i].kind)); res(); } });
    await gate(p); AUTO_CLEAR(); hush(); box.remove(); return { ans: item.objs.map((_, i) => fill[i]).join(), ctx: { svg, cells } }; },
  judge(item, ans) { if (ans === item.want) return { ok: true }; const got = ans.split(','); const i = item.objs.findIndex((s, j) => s.kind !== got[j]); item._bad = i; const s = item.objs[i]; return { ok: false, err: (item.errs || {})[s.tag] || (s.kind === 'square' ? 'countCorners' : 'curvedEdge') }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const c = r.ctx.cells[item._bad]; if (c) await VIS.edges(null, { g: c.g, svg: r.ctx.svg }); }, async together() {},
  async reveal(item, r) { r.ctx.cells.forEach(c => c.g.querySelectorAll('[data-paint]').forEach(p => p.setAttribute('fill', css(IDC[item.objs[c.i].kind])))); await sleep(800); }, praise: () => 'praiseLook', twin(item) { return { ...item.spec }; },
};
/* التعليل (D238، D240): «لماذا هذا مثلث؟» يختار الطفل سبباً من ثلاثة مسموعة. opts: [{id, ok}] */
ITEM.reason = {   /* show: مولّد الشيء، أو pic: صورة من رسوم «قارن وقس» (reasonPic، S1-U4) */
  make(spec) { return { ...spec, it: spec.show ? make(spec.show) : null, tag: spec.tag || 'reason', want: 'ok' }; },
  async ask(item) { const svg = newStage(200, { oasis: false, ground: 0 }); if (item.pic) reasonPic(svg, item.pic); else fitThing(svg, { ...item.it, label: null }, 180, 100, 140); await S(item.q);
    const cp = cardPick(item.opts.map((o, i) => ({ id: o.id, k: 'o' + i, ok: !!o.ok })), { intro: item.q });   /* «أعد الجملة» يعيد السؤال ثم الأسباب */
    const c = await cp.p; cp.done(); return { ans: c.ok ? 'ok' : c.k, ctx: { svg, cp, c } }; },
  judge(item, a) { return a === 'ok' ? { ok: true } : { ok: false, err: item.err || 'generic' }; },
  onOk(item, r) { SFX.good(); r.ctx.cp.btns.find(b => b.dataset.k === r.ctx.c.k).classList.add('ok'); },
  onWrong(item, r) { SFX.soft(); r.ctx.cp.btns.find(b => b.dataset.k === r.ctx.c.k).classList.add('no'); },
  mark(item, r) { const i = item.opts.findIndex(o => o.ok); const b = r.ctx.cp.btns.find(x => x.dataset.k === 'o' + i); if (b) b.classList.add('ok'); },
  async hint2(item, r) { await VIS.edges(null, { g: r.ctx.svg.lastChild, svg: r.ctx.svg }); }, async together() {},
  async reveal(item, r) { ITEM.reason.mark(item, r); await S(item.opts.find(o => o.ok).id); }, praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};
