/* =====================================================================
   S2-U6 «المسطرة السحرية» (المرحلة 2، نوفمبر 2026)
   د1 شريط القياس، والمتر والكيلومتر (C186)، واختيار الوحدة (C187) · د2 التحويل (C188) والأطوال المركّبة ومقارنتها (C189)
   د3 جمع الأطوال وطرحها بإعادة التجميع، والتحقق بالتقريب لأقرب متر (C190) · د4 «قياس مدينتي»: التقدير بمراجع شخصية (C187، منقول من د1 بقرار D248)، والمشروع
   الطول قيمة [n، الوحدة]: mm | cm | m | km، أو [سم، 'mc'] طولاً مركّباً «2 م 35 سم» (وفي الجمع [م، سم] بلا تطبيع: «3 م 120 سم»).
   كل طول يُكتب بأرقام المسطرة ويُقال بجملته (gen.len.*)، والجمل مولَّدة لكل قيمة في المحتوى، فلا عدد يُقال من غير جملته.
   ===================================================================== */
const LENC = { tape: '#e8c24a', tapeEd: '#a67c1e', bar: '#3d7cc0', bar2: '#e07b39', ok: '#2f9d6b', ink: '#33454c', soft: '#9fb4c0' };
const LEN_U = ['mm', 'cm', 'm', 'km'], LEN_MM = { mm: 1, cm: 10, m: 1000, km: 1000000 }, LEN_LB = { mm: 'rulMm', cm: 'rulCm', m: 'lenM', km: 'lenKm' };
/* القيمة بالمليمتر، ونصّها، وجملتها */
const lenMM = v => v[1] === 'mc' ? v[0] * 10 : v[1] === 'pair' ? (v[0][0] * 100 + v[0][1]) * 10 : v[0] * LEN_MM[v[1]];
const mcTxt = (m, c) => (m ? `${m} ${labelText('lenM')}` : '') + (m && c ? ' ' : '') + (c || !m ? `${c} ${labelText('rulCm')}` : '');
const lenTxt = v => v[1] === 'mc' ? mcTxt(Math.floor(v[0] / 100), v[0] % 100) : v[1] === 'pair' ? mcTxt(v[0][0], v[0][1]) : `${v[0]} ${labelText(LEN_LB[v[1]])}`;
const lenLn = v => v[1] === 'mc' ? `gen.len.mc.${Math.floor(v[0] / 100)}.${v[0] % 100}` : v[1] === 'pair' ? `gen.len.mc.${v[0][0]}.${v[0][1]}` : `gen.len.${v[1]}.${v[0]}`;
const lenKey = v => v[1] === 'pair' ? v[0].join('_') : String(v[0]) + v[1];
/* بطاقة طول على المسرح: نصّه بأرقام المسطرة */
function lenCard(parent, x, y, v, o = {}) { const g = el('g', { transform: `translate(${x} ${y})`, 'data-len': lenKey(v) }, parent), w = o.w || 132, h = o.h || 56;
  el('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 14, fill: o.fill || '#fffdf6', stroke: o.stroke || css('--line'), 'stroke-width': 2.5 }, g);
  const t = el('text', { x: 0, y: 8, 'text-anchor': 'middle', 'font-size': o.fs || 22, 'font-weight': 800, fill: LENC.ink, direction: 'rtl' }, g); t.textContent = lenTxt(v); return g; }
/* ---------- شريط القياس: يُقرأ كالمسطرة، وعلامة المتر عند 100 ---------- */
function tapeAt(parent, o) { const { x, y, to } = o, k = o.pxcm, g = el('g', { 'data-tape': 1 }, parent), H = 34, X = v => x + v * k, step = o.label || (k >= 2.4 ? 10 : 20);
  el('rect', { x: x - 30, y: y - 8, width: 32, height: H + 16, rx: 8, fill: '#c9a03a', stroke: LENC.tapeEd, 'stroke-width': 2 }, g);   /* علبة الشريط */
  el('rect', { x, y, width: to * k + 6, height: H, fill: LENC.tape, stroke: LENC.tapeEd, 'stroke-width': 1.5 }, g);
  for (let v = 0; v <= to; v++) { const big = v % 10 === 0, mid = v % 5 === 0; if (!mid && k < 2.4) continue; el('line', { x1: X(v), y1: y, x2: X(v), y2: y + (big ? 14 : mid ? 9 : 5), stroke: LENC.ink, 'stroke-width': big ? 1.8 : 1 }, g);
    if (v % step === 0) { const t = el('text', { x: X(v), y: y + 28, 'text-anchor': 'middle', 'font-size': v >= 100 ? 11 : 12, 'font-weight': 700, fill: v === 100 ? '#c8392d' : LENC.ink, direction: 'ltr' }, g); t.textContent = String(v); } }
  if (to >= 100) { el('rect', { x: X(100) - 1.5, y: y - 6, width: 3, height: H + 12, fill: '#c8392d' }, g); }
  return { g, X, k, y, H }; }
/* أشياء تُقاس: رسم بسيط في صندوق 120×120 حول المركز */
const LEN_TH = {
  ant: { u: 'mm', draw: g => { for (const [cx, r] of [[-22, 9], [0, 11], [24, 14]]) el('ellipse', { cx, cy: 0, rx: r, ry: r * .75, fill: '#3b2a1f' }, g); for (const s of [-1, 1]) for (const dx of [-8, 2, 12]) el('line', { x1: dx, y1: 0, x2: dx + 6, y2: s * 22, stroke: '#3b2a1f', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g); } },
  coin: { u: 'mm', draw: g => { el('ellipse', { cx: 0, cy: 4, rx: 40, ry: 12, fill: '#b98a2a' }, g); el('ellipse', { cx: 0, cy: -2, rx: 40, ry: 12, fill: '#e2b33c', stroke: '#b98a2a', 'stroke-width': 2 }, g); } },
  pencil: { u: 'cm', draw: g => rulThingAt(g, 'pencil', -50, 50, 6) },
  book: { u: 'cm', draw: g => { el('rect', { x: -34, y: -44, width: 68, height: 88, rx: 4, fill: '#3d7cc0', stroke: '#2a5f94', 'stroke-width': 2 }, g); el('rect', { x: -24, y: -30, width: 48, height: 14, rx: 3, fill: '#fff', opacity: .8 }, g); } },
  eraser: { u: 'cm', draw: g => { el('rect', { x: -26, y: -14, width: 52, height: 28, rx: 6, fill: '#ee8a8a' }, g); el('rect', { x: 4, y: -14, width: 22, height: 28, rx: 4, fill: '#7fb6d9' }, g); } },
  door: { u: 'm', draw: g => { el('rect', { x: -28, y: -54, width: 56, height: 108, rx: 3, fill: '#b9794e', stroke: '#8a5a3a', 'stroke-width': 2.5 }, g); el('circle', { cx: 16, cy: 6, r: 4, fill: '#f2d38a' }, g); } },
  room: { u: 'm', draw: g => { el('path', { d: 'M-52 34 L-52 -20 L0 -46 L52 -20 L52 34 Z', fill: '#f6e7c8', stroke: '#b9794e', 'stroke-width': 2.5 }, g); el('rect', { x: -12, y: 4, width: 24, height: 30, fill: '#8a6a4a' }, g); el('rect', { x: -40, y: -8, width: 18, height: 16, fill: '#bfe0f2', stroke: '#8a6a4a', 'stroke-width': 1.5 }, g); } },
  bus: { u: 'm', draw: g => { el('rect', { x: -56, y: -26, width: 112, height: 44, rx: 8, fill: '#f2b33d', stroke: '#b9862a', 'stroke-width': 2 }, g); for (let i = 0; i < 4; i++) el('rect', { x: -48 + i * 24, y: -18, width: 18, height: 14, rx: 2, fill: '#dff0fb' }, g); for (const cx of [-34, 34]) el('circle', { cx, cy: 20, r: 9, fill: '#33454c' }, g); } },
  road: { u: 'km', draw: g => { el('path', { d: 'M-56 40 C-20 20 20 0 56 -40', fill: 'none', stroke: '#8a6a4a', 'stroke-width': 10, 'stroke-linecap': 'round' }, g); el('path', { d: 'M-56 40 C-20 20 20 0 56 -40', fill: 'none', stroke: '#fff', 'stroke-width': 2, 'stroke-dasharray': '6 6' }, g); for (const [cx, cy] of [[-50, 26], [50, -28]]) { el('rect', { x: cx - 10, y: cy - 22, width: 20, height: 18, fill: '#f6e7c8', stroke: '#b9794e', 'stroke-width': 1.5 }, g); el('path', { d: `M${cx - 12} ${cy - 22} L${cx} ${cy - 32} L${cx + 12} ${cy - 22} Z`, fill: '#c8392d' }, g); } } },
  race: { u: 'km', draw: g => { el('ellipse', { cx: 0, cy: 0, rx: 54, ry: 30, fill: 'none', stroke: '#c8392d', 'stroke-width': 9 }, g); el('ellipse', { cx: 0, cy: 0, rx: 54, ry: 30, fill: 'none', stroke: '#fff', 'stroke-width': 1.5, 'stroke-dasharray': '5 5' }, g); el('rect', { x: -4, y: 22, width: 8, height: 16, fill: '#33454c' }, g); } },
  finger: { u: 'cm', draw: g => { el('rect', { x: -10, y: -44, width: 20, height: 82, rx: 10, fill: '#e9b98c', stroke: '#c48f62', 'stroke-width': 2 }, g); el('rect', { x: -7, y: -40, width: 14, height: 14, rx: 5, fill: '#f6dcc4' }, g); } },
  seed: { u: 'mm', draw: g => { el('ellipse', { cx: 0, cy: 0, rx: 16, ry: 10, fill: '#8a5a3a', transform: 'rotate(-20)' }, g); el('path', { d: 'M-6 -2 Q0 -8 8 -2', fill: 'none', stroke: '#f2d38a', 'stroke-width': 2 }, g); } },
  phone: { u: 'cm', draw: g => { el('rect', { x: -22, y: -42, width: 44, height: 84, rx: 8, fill: '#33454c' }, g); el('rect', { x: -17, y: -34, width: 34, height: 64, rx: 3, fill: '#bfe0f2' }, g); } },
  nail: { u: 'cm', draw: g => rulThingAt(g, 'nail', -40, 40, 6) },
  bed: { u: 'm', draw: g => { el('rect', { x: -56, y: -6, width: 112, height: 26, rx: 4, fill: '#7fb6d9', stroke: '#3d7cc0', 'stroke-width': 2 }, g); el('rect', { x: -56, y: -30, width: 10, height: 56, rx: 3, fill: '#b9794e' }, g); el('rect', { x: -44, y: -14, width: 26, height: 10, rx: 4, fill: '#fff' }, g); for (const x of [-52, 48]) el('rect', { x, y: 20, width: 6, height: 12, fill: '#8a5a3a' }, g); } },
  car: { u: 'm', draw: g => { el('path', { d: 'M-54 14 V0 Q-54 -8 -44 -10 L-34 -28 H14 L28 -10 L46 -6 Q54 -4 54 4 V14 Z', fill: '#e07b39', stroke: '#b05a20', 'stroke-width': 2 }, g); el('path', { d: 'M-28 -24 H10 L20 -10 H-36 Z', fill: '#dff0fb' }, g); for (const cx of [-32, 32]) el('circle', { cx, cy: 16, r: 10, fill: '#33454c' }, g); } },
  tree: { u: 'm', draw: g => { el('rect', { x: -7, y: 6, width: 14, height: 46, fill: '#8a5a3a' }, g); el('circle', { cx: 0, cy: -16, r: 34, fill: '#4f9a6a' }, g); } },
  river: { u: 'km', draw: g => { el('path', { d: 'M-56 -40 C-20 -20 -40 10 0 16 C40 22 20 44 56 50', fill: 'none', stroke: '#3d7cc0', 'stroke-width': 14, 'stroke-linecap': 'round' }, g); for (const [x, y] of [[-40, 30], [36, -24]]) el('circle', { cx: x, cy: y, r: 12, fill: '#4f9a6a' }, g); } },
  trip: { u: 'km', draw: g => { el('path', { d: 'M-56 30 H56', stroke: '#8a6a4a', 'stroke-width': 8, 'stroke-linecap': 'round' }, g); el('rect', { x: -26, y: -4, width: 52, height: 24, rx: 6, fill: '#3d7cc0' }, g); el('rect', { x: -20, y: 0, width: 16, height: 10, fill: '#dff0fb' }, g); for (const cx of [-14, 14]) el('circle', { cx, cy: 22, r: 7, fill: '#33454c' }, g); el('path', { d: 'M40 -40 V30 M40 -40 H58 V-24 H40', fill: '#c8392d', stroke: '#33454c', 'stroke-width': 2 }, g); } },
  table: { u: 'm', draw: g => { el('rect', { x: -54, y: -18, width: 108, height: 10, rx: 2, fill: '#b9794e' }, g); for (const x of [-46, 40]) el('rect', { x, y: -8, width: 6, height: 46, fill: '#8a5a3a' }, g); } },
};
const lenThing = (parent, k, x, y, s = 1) => { const g = el('g', { transform: `translate(${x} ${y}) scale(${s})`, 'data-thing': k, 'pointer-events': 'none' }, parent); LEN_TH[k].draw(g); return g; };
const lenStage = (H = 232) => { const svg = newStage(H, { oasis: false, ground: 0 }); plyFrame(svg, H - 28); return svg; };
/* خيارات أطوال مسموعة: [مفتاح، نصّ، رمز، جملة] */
const lenOpts = vals => vals.map(v => [lenKey(v), lenTxt(v), '<i></i>', lenLn(v)]);

/* ================= ① أيّ وحدة أنسب؟ (C187): thing ================= */
ITEM.unitPick = {
  make(spec) { return { ...spec, want: LEN_TH[spec.thing].u, tag: 'unit-pick-' + LEN_TH[spec.thing].u }; },
  async ask(item, mode, tries) { const svg = lenStage(220); lenThing(svg, item.thing, 180, 104, 1.2); const t = el('text', { x: 180, y: 182, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: LENC.ink }, svg); t.textContent = labelText('len.th.' + item.thing);
    if (tries >= 3) { await S('gen.len.together.unit'); const m = helpG(svg); LEN_U.forEach((u, i) => { const tt = el('text', { x: 300 - i * 80, y: 40, 'text-anchor': 'middle', 'font-size': 14, fill: css('--think') }, m); tt.textContent = labelText('len.ex.' + u); }); }
    else { await S(item.q, { noGap: true }); await S('gen.len.th.' + item.thing, { append: true }); }
    const k = await choosePick(LEN_U.map(u => [u, labelText(LEN_LB[u]), '<i></i>', 'gen.len.u.' + u]), item.want); return { ans: k, ctx: { svg } }; },
  judge(item, k) { if (k === item.want) return { ok: true }; return { ok: false, err: LEN_U.indexOf(k) > LEN_U.indexOf(item.want) ? 'unitBig' : 'unitSmall' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.len.hint.unit'); }, async together() {},
  async reveal(item) { await S('gen.len.reveal.unit.' + item.want); },
  praise: () => 'praiseMeasure', twin(item) { return item.twin || null; },
};

/* ================= ② اقرأ شريط القياس (C186): len بالسنتيمتر (مضاعف 5)، thing، ch خيارات بالسنتيمتر؛ وm: الجواب بالمتر والسنتيمتر ================= */
ITEM.tapeRead = {
  make(spec) { const want = spec.m ? lenKey([spec.len, 'mc']) : lenKey([spec.len, 'cm']); return { ...spec, want, tag: 'tape-read' + (spec.m ? '-mc' : '') }; },
  draw(item, svg) { const to = item.len <= 110 ? 120 : 220, k = to === 120 ? 2.5 : 1.38, x0 = 40, T = tapeAt(svg, { x: x0, y: 132, to, pxcm: k, label: to === 120 ? 10 : 20 }), X2 = T.X(item.len);
    const th = el('g', {}, svg); el('rect', { x: x0, y: 84, width: X2 - x0, height: 34, rx: 4, fill: item.thing === 'table' ? '#b9794e' : '#3d7cc0', opacity: .9 }, th); el('line', { x1: X2, y1: 78, x2: X2, y2: 168, stroke: '#c8392d', 'stroke-width': 2.4, 'stroke-dasharray': '4 3' }, th);
    const t = el('text', { x: x0 + (X2 - x0) / 2, y: 106, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: '#fff' }, th); t.textContent = labelText('len.th.' + (item.thing || 'table')); return { T, X2 }; },
  async ask(item, mode, tries) { const svg = lenStage(220), D = this.draw(item, svg);
    if (tries >= 3) { const m = helpG(svg), base = Math.floor(item.len / 10) * 10; await S('gen.len.together.tape'); thinkRing(m, [D.T.X(base), D.T.y + 22], 14); if (item.len % 10) el('path', { d: `M${D.T.X(base)} ${D.T.y - 4} Q${(D.T.X(base) + D.X2) / 2} ${D.T.y - 22} ${D.X2} ${D.T.y - 4}`, fill: 'none', stroke: css('--think'), 'stroke-width': 2.6 }, m); }
    else await S(item.q);
    const vals = item.ch.map(n => item.m ? [n, 'mc'] : [n, 'cm']), k = await choosePick(lenOpts(vals), item.want); return { ans: k, ctx: { svg, D } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: item.m ? 'mcSplit' : 'tapeOff' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const m = helpG(r.ctx.svg); thinkRing(m, [r.ctx.D.X2, r.ctx.D.T.y + 8], 12); await S('gen.len.hint.tape'); await sleep(500); m.remove(); }, async together() {},
  async reveal(item, r) { const m = helpG(r.ctx.svg); thinkRing(m, [r.ctx.D.X2, r.ctx.D.T.y + 8], 12); await S('gen.len.reveal.tape', { noGap: true }); await S(lenLn(item.m ? [item.len, 'mc'] : [item.len, 'cm']), { append: true }); },
  praise: () => 'praiseMeasure', twin(item) { return item.twin || null; },
};

/* ================= ③ حوّل (C188): v طول، to الوحدة المطلوبة، ch أعداد بالوحدة المطلوبة ================= */
const lenConv = (v, to) => lenMM(v) / LEN_MM[to];
function convEq(svg, item, y = 100) { const g = el('g', {}, svg); lenCard(g, 260, y, item.v, { w: 140 }); const eq = el('text', { x: 180, y: y + 10, 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: LENC.ink }, g); eq.textContent = '=';
  const q = el('g', { transform: `translate(98 ${y})` }, g); el('rect', { x: -66, y: -28, width: 132, height: 56, rx: 14, fill: '#fff', stroke: css('--think'), 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }, q); const t = el('text', { x: 0, y: 8, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: css('--think'), direction: 'rtl' }, q); t.textContent = '؟ ' + labelText(LEN_LB[item.to]); return { g, q, t }; }
/* بطاقة القاعدة للحلّ المشترك: «1 م = 100 سم» */
function convRule(svg, from, to, y = 182) { const big = LEN_MM[from] > LEN_MM[to] ? from : to, small = big === from ? to : from, f = LEN_MM[big] / LEN_MM[small], m = helpG(svg); const t = el('text', { x: 180, y, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: css('--think'), direction: 'rtl' }, m); t.textContent = `1 ${labelText(LEN_LB[big])} = ${f} ${labelText(LEN_LB[small])}`; return { m, f, big, small }; }
ITEM.convFill = {
  make(spec) { const w = lenConv(spec.v, spec.to); /*T*/if (TESTHOOK && (!spec.ch.includes(w) || w % 1)) testBug('convFill: الجواب ليس بين الخيارات ' + w);/*/T*/ return { ...spec, want: lenKey([w, spec.to]), wn: w, tag: 'conv-fill-' + spec.v[1] + '-' + spec.to }; },
  async ask(item, mode, tries) { const svg = lenStage(220), E = convEq(svg, item);
    if (tries >= 3) { convRule(svg, item.v[1], item.to); await S('gen.len.together.conv'); } else { await S(item.q, { noGap: true }); await S(lenLn(item.v), { append: true }); }
    const k = await choosePick(lenOpts(item.ch.map(n => [n, item.to])), item.want); return { ans: k, ctx: { svg, E } }; },
  judge(item, k) { if (k === item.want) return { ok: true }; const n = parseFloat(k), up = LEN_MM[item.v[1]] > LEN_MM[item.to]; return { ok: false, err: up ? (n < item.v[0] ? 'convDir' : 'convFactor') : (n > item.v[0] ? 'convDir' : 'convFactor') }; },
  onOk(item, r) { SFX.good(); r.ctx.E.t.textContent = lenTxt([item.wn, item.to]); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const R2 = convRule(r.ctx.svg, item.v[1], item.to); await S(LEN_MM[item.v[1]] > LEN_MM[item.to] ? 'gen.len.hint.convMul' : 'gen.len.hint.convDiv'); await sleep(600); R2.m.remove(); }, async together() {},
  async reveal(item, r) { r.ctx.E.t.textContent = lenTxt([item.wn, item.to]); await S('gen.len.reveal.conv', { noGap: true }); await S(lenLn([item.wn, item.to]), { append: true }); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};

/* ================= ④ محوّل فرجار (C188، إنتاج): v، to. يختار الطفل العملية (× أو ÷) ثم العدد (10، 100، 1000)، فتخرج الآلة الطول ================= */
const CONV_F = [10, 100, 1000];
ITEM.convMachine = {
  make(spec) { const a = LEN_MM[spec.v[1]], b = LEN_MM[spec.to], op = a > b ? 'mul' : 'div', f = a > b ? a / b : b / a; /*T*/if (TESTHOOK && !CONV_F.includes(f)) testBug('convMachine: العامل ليس 10 ولا 100 ولا 1000');/*/T*/ return { ...spec, want: op + f, op, f, tag: 'conv-machine' }; },
  async ask(item, mode, tries) { const svg = newStage(250, { oasis: false, ground: 0 }), g = el('g', {}, svg);
    el('rect', { x: 128, y: 60, width: 104, height: 92, rx: 16, fill: '#6c7fa8', stroke: '#4a5a80', 'stroke-width': 3 }, g); el('circle', { cx: 180, cy: 80, r: 9, fill: '#f2b33d' }, g); const disp = el('text', { x: 180, y: 128, 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, fill: '#fff' }, g); disp.textContent = '؟';
    lenCard(g, 298, 106, item.v, { w: 110, fs: 19 }); const outC = el('g', { transform: 'translate(62 106)' }, g); el('rect', { x: -55, y: -28, width: 110, height: 56, rx: 14, fill: '#fff', stroke: css('--think'), 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }, outC); const outT = el('text', { x: 0, y: 8, 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 800, fill: css('--think'), direction: 'rtl' }, outC); outT.textContent = '؟ ' + labelText(LEN_LB[item.to]);
    for (const [x1, x2] of [[243, 236], [124, 118]]) geoArrow(g, x2, 106, 180, LENC.ink, 9);
    if (tries >= 3) convRule(svg, item.v[1], item.to, 196);
    await S(tries >= 3 ? 'gen.len.together.machine' : item.q);
    const op = await choosePick([['mul', '×', '<i></i>', 'gen.len.op.mul'], ['div', '÷', '<i></i>', 'gen.len.op.div']], item.op); disp.textContent = op === 'mul' ? '×' : '÷'; SFX.tick();
    await S('gen.len.byWhat'); const f = await choosePick(CONV_F.map(n => [String(n), String(n), '<i></i>', 'gen.len.f.' + n]), String(item.f)); disp.textContent = (op === 'mul' ? '×' : '÷') + ' ' + f;
    const out = op === 'mul' ? item.v[0] * +f : item.v[0] / +f; outT.textContent = (out % 1 ? '…' : String(out)) + ' ' + labelText(LEN_LB[item.to]);
    return { ans: op + f, ctx: { svg, outT } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: k.startsWith(item.op) ? 'convFactor' : 'convDir' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item) { await S(item.op === 'mul' ? 'gen.len.hint.convMul' : 'gen.len.hint.convDiv'); }, async together() {},
  async reveal(item, r) { const out = item.op === 'mul' ? item.v[0] * item.f : item.v[0] / item.f; r.ctx.outT.textContent = out + ' ' + labelText(LEN_LB[item.to]); await S(item.op === 'mul' ? 'gen.len.reveal.mul' : 'gen.len.reveal.div', { noGap: true }); await S('gen.len.f.' + item.f, { append: true }); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};

/* ================= ⑤ الطول المركّب (C189): cm، dir: toMC («235 سم = 2 م 35 سم») أو toCM؛ ch بالسنتيمتر (وفي toMC أزواج [م، سم]) ================= */
ITEM.mcConv = {
  make(spec) { const want = spec.dir === 'toMC' ? [Math.floor(spec.cm / 100), spec.cm % 100].join('_') : lenKey([spec.cm, 'cm']); return { ...spec, want, tag: 'mc-' + spec.dir }; },
  async ask(item, mode, tries) { const svg = lenStage(220), from = item.dir === 'toMC' ? [item.cm, 'cm'] : [item.cm, 'mc'], g = el('g', {}, svg); lenCard(g, 252, 100, from, { w: 156 }); const eq = el('text', { x: 162, y: 110, 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: LENC.ink }, g); eq.textContent = '=';
    const q = el('g', { transform: 'translate(86 100)' }, g); el('rect', { x: -62, y: -28, width: 124, height: 56, rx: 14, fill: '#fff', stroke: css('--think'), 'stroke-width': 2.5, 'stroke-dasharray': '6 4' }, q); const qt = el('text', { x: 0, y: 9, 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, fill: css('--think') }, q); qt.textContent = '؟';
    if (tries >= 3) { const m = helpG(svg), t = el('text', { x: 180, y: 182, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: css('--think'), direction: 'rtl' }, m); t.textContent = `100 ${labelText('rulCm')} = 1 ${labelText('lenM')}`; await S('gen.len.together.mc'); }
    else { await S(item.q, { noGap: true }); await S(lenLn(from), { append: true }); }
    const vals = item.dir === 'toMC' ? item.ch.map(p => [p, 'pair']) : item.ch.map(n => [n, 'cm']); const k = await choosePick(lenOpts(vals), item.want); return { ans: k, ctx: { svg, qt } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'mcSplit' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.len.hint.mc'); }, async together() {},
  async reveal(item, r) { const v = item.dir === 'toMC' ? [item.cm, 'mc'] : [item.cm, 'cm']; r.ctx.qt.textContent = lenTxt(v); r.ctx.qt.setAttribute('font-size', 18); await S('gen.len.reveal.conv', { noGap: true }); await S(lenLn(v), { append: true }); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};

/* ================= ⑥ أيّهما أطول؟ (C189): a وb بوحدتين؛ وإن تساويا فالجواب «متساويان». بعد الجواب: شريطان بوحدة واحدة ================= */
function lenBars(svg, vals, y0 = 168, o = {}) { const mx = Math.max(...vals.map(lenMM)), g = el('g', { 'pointer-events': 'none' }, svg), W = o.W || 250;
  vals.forEach((v, i) => { const w = lenMM(v) / mx * W, y = y0 + i * 26; el('rect', { x: 330 - w, y, width: w, height: 18, rx: 4, fill: i ? LENC.bar2 : LENC.bar }, g); }); return g; }
ITEM.lenCompare = {
  make(spec) { const a = lenMM(spec.a), b = lenMM(spec.b); return { ...spec, want: a === b ? 'eq' : a > b ? 'a' : 'b', tag: 'len-compare' }; },
  async ask(item, mode, tries) { const svg = lenStage(232); lenCard(svg, 262, 96, item.a, { w: 140 }); lenCard(svg, 98, 96, item.b, { w: 140, stroke: LENC.bar2 });
    if (tries >= 3) { const m = helpG(svg), u = LEN_MM[item.a[1] === 'mc' ? 'cm' : item.a[1]] < LEN_MM[item.b[1] === 'mc' ? 'cm' : item.b[1]] ? (item.a[1] === 'mc' ? 'cm' : item.a[1]) : (item.b[1] === 'mc' ? 'cm' : item.b[1]); [item.a, item.b].forEach((v, i) => { const t = el('text', { x: i ? 98 : 262, y: 150, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: css('--think'), direction: 'rtl' }, m); t.textContent = '= ' + (lenMM(v) / LEN_MM[u]) + ' ' + labelText(LEN_LB[u]); }); await S('gen.len.together.cmp'); }
    else await S(item.q);
    const k = await choosePick([['a', lenTxt(item.a), '<i></i>', lenLn(item.a)], ['b', lenTxt(item.b), '<i></i>', lenLn(item.b)], ['eq', labelText('lenEq'), '<i></i>', 'gen.len.eq']], item.want); return { ans: k, ctx: { svg } }; },
  judge(item, k) { if (k === item.want) return { ok: true }; const big = item.a[0] > item.b[0] ? 'a' : item.b[0] > item.a[0] ? 'b' : 'eq'; return { ok: false, err: k === big ? 'cmpDigits' : 'cmpOff' }; },
  async onOk(item, r) { SFX.good(); lenBars(r.ctx.svg, [item.a, item.b], 150); await sleep(400); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.len.hint.cmp'); }, async together() {},
  async reveal(item, r) { lenBars(r.ctx.svg, [item.a, item.b], 150); await S('gen.len.reveal.cmp.' + item.want); },
  praise: () => 'praiseCompare', twin(item) { return item.twin || null; },
};

/* ================= ⑦ رتّب من الأقصر إلى الأطول (C189، إنتاج): vals أربعة. يلمس الطفل البطاقات بالترتيب فتُرقَّم ================= */
const ORD_XY = [[262, 62], [98, 62], [262, 150], [98, 150]];   /* بطاقات 70 وحدة: 56 بكسلاً على أضيق شاشة (0.8 بكسل للوحدة؛ الفحص على iPhone SE) */
ITEM.lenOrder = {
  make(spec) { const order = spec.vals.map((v, i) => i).sort((i, j) => lenMM(spec.vals[i]) - lenMM(spec.vals[j])); return { ...spec, want: order.join(','), tag: 'len-order' }; },
  async ask(item, mode, tries) { const svg = lenStage(222), cards = item.vals.map((v, i) => { const g = lenCard(svg, ORD_XY[i][0], ORD_XY[i][1], v, { w: 146, h: 70 }); g.setAttribute('role', 'button'); g.setAttribute('tabindex', 0); g.setAttribute('aria-label', plain(lenTxt(v))); g.style.cursor = 'pointer'; return g; }), picked = [], badges = el('g', { 'pointer-events': 'none' }, svg);
    if (tries >= 3) { const m = helpG(svg), u = item.vals.some(v => v[1] === 'mm') ? 'mm' : 'cm'; item.vals.forEach((v, i) => { const t = el('text', { x: ORD_XY[i][0], y: ORD_XY[i][1] + 44, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: css('--think'), direction: 'rtl' }, m); t.textContent = '= ' + (lenMM(v) / LEN_MM[u]) + ' ' + labelText(LEN_LB[u]); }); await S('gen.len.together.order'); }
    else await S(item.q);
    /*T*/window.__ordWant = item.want.split(',').map(Number); window.__ordAt = i => { const r = cards[i].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };/*/T*/
    await gate(new Promise(res => { const pick = i => { if (picked.includes(i) || picked.length >= cards.length) return; picked.push(i); SFX.tick(); badge(badges, ORD_XY[i][0] + 66, ORD_XY[i][1] - 26, picked.length, css('--compass')); cards[i].querySelector('rect').setAttribute('fill', '#eef6fb'); if (picked.length === cards.length) { AUTO_CLEAR(); res(); } };
      cards.forEach((g, i) => { g.onclick = () => pick(i); g.onkeydown = e => { if (isActKey(e)) { e.preventDefault(); pick(i); } }; });
      AUTO({ kind: 'lenOrder', ok: () => item.want.split(',').forEach(i => pick(+i)), wrong: () => [...item.want.split(',')].reverse().forEach(i => pick(+i)) }); }));
    cards.forEach(g => { g.onclick = null; g.onkeydown = null; g.removeAttribute('role'); }); return { ans: picked.join(','), ctx: { svg, badges, cards } }; },
  judge(item, k) { if (k === item.want) return { ok: true }; const byNum = item.vals.map((v, i) => i).sort((i, j) => item.vals[i][0] - item.vals[j][0]).join(','); return { ok: false, err: k === byNum ? 'orderDigits' : 'orderOff' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.len.hint.order'); }, async together() {},
  async reveal(item, r) { r.ctx.badges.innerHTML = ''; item.want.split(',').forEach((i, n) => badge(r.ctx.badges, ORD_XY[+i][0] + 66, ORD_XY[+i][1] - 26, n + 1, LENC.ok)); await S('gen.len.reveal.order'); },
  praise: () => 'praiseOrder', twin(item) { return item.twin || null; },
};

/* ================= ⑧ اجمع واطرح (C190): a وb [م، سم]، op + أو −، ch أزواج [م، سم] (منها غير المطبَّع: «3 م 120 سم»)؛ story: رسم بدل الجدول ================= */
const mcNorm = cm => [Math.floor(cm / 100), cm % 100];
function calcTable(svg, item, y0 = 40) { const g = el('g', {}, svg), X = { m: 236, cm: 150 },   /* الأمتار يميناً كما تُقرأ «2 م 40 سم» */ rowY = i => y0 + 30 + i * 38;
  el('rect', { x: 92, y: y0 - 8, width: 200, height: 150, rx: 12, fill: GEO.paper, stroke: css('--line'), 'stroke-width': 2 }, g);
  for (const [k, x] of Object.entries(X)) { const t = el('text', { x, y: y0 + 12, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: k === 'm' ? LENC.bar : LENC.bar2 }, g); t.textContent = labelText(k === 'm' ? 'lenM' : 'rulCm'); }
  const cell = (i, k, v) => { const t = el('text', { x: X[k], y: rowY(i) + 10, 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 800, fill: LENC.ink, direction: 'ltr' }, g); t.textContent = String(v); return t; };
  cell(0, 'm', item.a[0]); cell(0, 'cm', item.a[1]); cell(1, 'm', item.b[0]); cell(1, 'cm', item.b[1]);
  const op = el('text', { x: 108, y: rowY(1) + 10, 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, fill: LENC.ink }, g); op.textContent = item.op === '-' ? '−' : '+';
  geoLine(g, 100, rowY(1) + 24, 284, rowY(1) + 24, { color: LENC.ink, w: 2.5 }); const r1 = cell(2, 'm', '؟'), r2 = cell(2, 'cm', '؟'); return { g, r1, r2, cell, rowY, X }; }
ITEM.lenCalc = {
  make(spec) { const A = spec.a[0] * 100 + spec.a[1], B = spec.b[0] * 100 + spec.b[1], w = spec.op === '-' ? A - B : A + B, want = mcNorm(w).join('_'); /*T*/if (TESTHOOK && !spec.ch.some(p => p.join('_') === want)) testBug('lenCalc: الجواب ليس بين الخيارات');/*/T*/ return { ...spec, want, w, tag: 'len-calc-' + (spec.op === '-' ? 'sub' : 'add') }; },
  async ask(item, mode, tries) { const svg = newStage(212, { oasis: false, ground: 0 }), T = calcTable(svg, item, 30);
    if (tries >= 3) { await S(item.op === '-' ? 'gen.len.together.sub' : 'gen.len.together.add'); const m = helpG(svg), t = el('text', { x: 316, y: 120, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: css('--think'), direction: 'rtl' }, m); t.textContent = `100 ${labelText('rulCm')}`; const t2 = el('text', { x: 316, y: 140, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: css('--think'), direction: 'rtl' }, m); t2.textContent = `= 1 ${labelText('lenM')}`; }
    else await S(item.q);
    const k = await choosePick(lenOpts(item.ch.map(p => [p, 'pair'])), item.want); return { ans: k, ctx: { svg, T } }; },
  judge(item, k) { if (k === item.want) return { ok: true }; const [m, c] = k.split('_').map(Number); if (c >= 100 && m * 100 + c === item.w) return { ok: false, err: 'noRegroup' }; if (item.op === '-') return { ok: false, err: 'subBorrow' }; return { ok: false, err: m * 100 + c === item.w - 100 ? 'lostCarry' : 'calcOff' }; },
  onOk(item, r) { SFX.good(); const [m, c] = mcNorm(item.w); r.ctx.T.r1.textContent = String(m); r.ctx.T.r2.textContent = String(c); }, onWrong() { SFX.soft(); },
  async hint2(item) { await S(item.op === '-' ? 'gen.len.hint.sub' : 'gen.len.hint.add'); }, async together() {},
  async reveal(item, r) { const [m, c] = mcNorm(item.w); r.ctx.T.r1.textContent = String(m); r.ctx.T.r2.textContent = String(c); await S('gen.len.reveal.calc', { noGap: true }); await S(lenLn([[m, c], 'pair']), { append: true }); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};

/* ================= ⑨ قرّب لأقرب متر (C190): v [م، سم]، ch أمتار. 50 سم فأكثر: المتر التالي ================= */
ITEM.lenRound = {
  make(spec) { const w = spec.v[0] + (spec.v[1] >= 50 ? 1 : 0); return { ...spec, want: lenKey([w, 'm']), w, tag: 'len-round' }; },
  async ask(item, mode, tries) { const svg = newStage(210, { oasis: false, ground: 0 }), m0 = Math.max(0, item.v[0] - 1), k = 100, x0 = 50, X = cm => x0 + (cm - m0 * 100) / 100 * k, g = el('g', {}, svg);
    geoLine(g, x0 - 10, 130, x0 + 2.6 * k + 10, 130, { color: LENC.ink, w: 3 }); for (let i = 0; i <= 2; i++) { const x = X((m0 + i) * 100); geoLine(g, x, 120, x, 140, { color: LENC.ink, w: 3 }); const t = el('text', { x, y: 166, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: LENC.ink, direction: 'rtl' }, g); t.textContent = `${m0 + i} ${labelText('lenM')}`; geoLine(g, x + k / 2, 125, x + k / 2, 135, { color: LENC.soft, w: 2 }); }
    const cm = item.v[0] * 100 + item.v[1], px = X(cm); el('circle', { cx: px, cy: 130, r: 8, fill: '#c8392d' }, g); lenCard(g, px, 76, [[item.v[0], item.v[1]], 'pair'], { w: 128, h: 46, fs: 18 });
    if (tries >= 3) { const m = helpG(svg); for (const i of [0, 1, 2]) { const x = X((m0 + i) * 100); if (Math.abs(x - px) <= k) el('path', { d: `M${px} 142 Q${(px + x) / 2} 160 ${x} 142`, fill: 'none', stroke: css('--think'), 'stroke-width': 2.6 }, m); } await S('gen.len.together.round'); }
    else await S(item.q);
    const k2 = await choosePick(lenOpts(item.ch.map(n => [n, 'm'])), item.want); return { ans: k2, ctx: { svg } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'roundOff' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.len.hint.round'); }, async together() {},
  async reveal(item) { await S('gen.len.reveal.round', { noGap: true }); await S(lenLn([item.w, 'm']), { append: true }); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};

/* ================= ⑩ بنّاء السور (C190، إنتاج): fence طول السور بالسنتيمتر، pieces قطع بالسنتيمتر؛ يلمس الطفل القطع (لمسة ثانية تعيدها)، والمجموع مكتوب ================= */
const FENCE_XY = i => [300 - (i % 3) * 120, 172 + Math.floor(i / 3) * 78];   /* بطاقات 70 وحدة بينها ثمانٍ (أضيق شاشة) */
ITEM.fenceBuild = {
  make(spec) { const n = spec.pieces.length, goal = spec.fence; let ok = null; for (let m = 1; m < 1 << n; m++) { let s = 0; for (let i = 0; i < n; i++) if (m >> i & 1) s += spec.pieces[i]; if (s === goal) { ok = m; break; } } /*T*/if (TESTHOOK && ok == null) testBug('fenceBuild: لا قطع مجموعها الهدف');/*/T*/ return { ...spec, goal, okMask: ok, want: goal, tag: 'fence-build' }; },
  async ask(item, mode, tries) { const svg = newStage(290, { oasis: false, ground: 0 }), on = new Set(), g = el('g', {}, svg), W = 280, x0 = 40, k = W / item.goal;
    el('rect', { x: x0, y: 70, width: W, height: 22, rx: 4, fill: 'none', stroke: LENC.ink, 'stroke-width': 2, 'stroke-dasharray': '6 4' }, g); const gl = el('text', { x: 180, y: 56, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: LENC.ink, direction: 'rtl' }, g); gl.textContent = labelText('lenGoal') + ' ' + lenTxt([item.goal, 'mc']);
    const built = el('g', {}, g), tot = el('text', { x: 180, y: 122, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: LENC.bar, direction: 'rtl' }, g);
    const redraw = () => { built.innerHTML = ''; let x = x0 + W, s = 0; [...on].sort((a, b) => a - b).forEach(i => { const w = item.pieces[i] * k; s += item.pieces[i]; el('rect', { x: Math.max(x - w, x0 - 40), y: 72, width: w, height: 18, fill: i % 2 ? '#b9794e' : '#d39a66', stroke: '#8a5a3a', 'stroke-width': 1.5 }, built); x -= w; }); tot.textContent = labelText('lenSum') + ' ' + lenTxt([s, 'mc']); tot.setAttribute('fill', s > item.goal ? '#c8392d' : LENC.bar); /*T*/window.__fenceSum = s;/*/T*/ return s; };
    const P = item.pieces.map((c, i) => { const [x, y] = FENCE_XY(i), pg = lenCard(svg, x, y, [c, 'mc'], { w: 112, h: 70, fs: 16 }); pg.setAttribute('role', 'button'); pg.setAttribute('tabindex', 0); pg.setAttribute('aria-label', plain(lenTxt([c, 'mc']))); pg.style.cursor = 'pointer';
      const tog = () => { if (on.has(i)) on.delete(i); else on.add(i); pg.querySelector('rect').setAttribute('fill', on.has(i) ? '#f2d38a' : '#fffdf6'); SFX.tick(); redraw(); }; pg.onclick = tog; pg.onkeydown = e => { if (isActKey(e)) { e.preventDefault(); tog(); } }; return { pg, tog }; });
    redraw(); if (tries >= 3) { const i0 = item.pieces.findIndex((c, i) => item.okMask >> i & 1); P[i0].tog(); await S('gen.len.together.fence'); } else await S(item.q);
    /*T*/window.__fenceAt = i => { const r = P[i].pg.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }; window.__fenceWant = item.pieces.map((c, i) => i).filter(i => item.okMask >> i & 1);/*/T*/
    AUTO({ kind: 'fence', ok: () => { item.pieces.forEach((c, i) => { if (!!(item.okMask >> i & 1) !== on.has(i)) P[i].tog(); }); rulDoneBtn().click(); }, wrong: () => { item.pieces.forEach((c, i) => { if (!on.has(i)) P[i].tog(); }); rulDoneBtn().click(); } });
    await rulDone(() => P.forEach(p => { p.pg.onclick = null; p.pg.onkeydown = null; p.pg.removeAttribute('role'); }));
    return { ans: redraw(), ctx: { svg, redraw } }; },
  judge(item, s) { return s === item.goal ? { ok: true } : { ok: false, err: s > item.goal ? 'fenceOver' : 'fenceShort' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.len.hint.fence'); }, async together() {},
  async reveal(item) { await S('gen.len.reveal.fence'); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};

/* ================= ⑪ قدّر (C187، د4): thing، ch أطوال؛ الجواب أقربها إلى طوله الحقيقي (real بالسنتيمتر). المراجع الشخصية في الحلّ المشترك ================= */
ITEM.estPick = {
  make(spec) { const best = spec.ch.map(v => [v, Math.abs(Math.log(lenMM(v) / (spec.real * 10)))]).sort((a, b) => a[1] - b[1])[0][0]; return { ...spec, want: lenKey(best), tag: 'est-pick' }; },
  async ask(item, mode, tries) { const svg = lenStage(220); lenThing(svg, item.thing, 196, 104, 1.2); const t = el('text', { x: 196, y: 186, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: LENC.ink }, svg); t.textContent = labelText('len.th.' + item.thing);
    if (tries >= 3) { const m = helpG(svg); lenThing(m, item.ref || 'finger', 62, 104, .7); const tt = el('text', { x: 62, y: 166, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: css('--think'), direction: 'rtl' }, m); tt.textContent = labelText('len.ref.' + (item.ref || 'finger')); await S('gen.len.together.est'); await S('gen.len.ref.' + (item.ref || 'finger'), { append: true }); }
    else { await S(item.q, { noGap: true }); await S('gen.len.th.' + item.thing, { append: true }); }
    const k = await choosePick(lenOpts(item.ch), item.want); return { ans: k, ctx: { svg } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'estFar' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item) { await S('gen.len.hint.est'); await S('gen.len.ref.' + (item.ref || 'finger'), { append: true }); }, async together() {},
  async reveal(item) { await S('gen.len.reveal.est', { noGap: true }); await S(lenLn([item.real, 'cm']), { append: true }); },
  praise: () => 'praiseMeasure', twin(item) { return item.twin || null; },
};

/* ================= ⑫ صمّم مضمار كيلومتر (C186، C190، إبداع): n مقاطع بأطوال مختلفة بالمتر مجموعها 1000 م ================= */
ITEM.trackDesign = {
  make(spec) { return { ...spec, want: 1000, tag: 'track-design' }; },
  async ask(item, mode, tries) { const n = item.n || 4, svg = newStage(60 + n * 64, { oasis: false, ground: 0 }), g = el('g', {}, svg);   /* العدّادات في المسرح: صفّ لكل مقطع، وزرّا − و+ بلمسة 48 */
    const V = (tries >= 3 ? (n === 3 ? [500, 300, 150] : [400, 300, 200, 50]) : Array(n).fill(250)).slice(0, n);
    el('rect', { x: 20, y: 6, width: 320, height: 46, rx: 23, fill: 'none', stroke: '#c8392d', 'stroke-width': 6 }, g); const sumT = el('text', { x: 180, y: 36, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, direction: 'rtl' }, g);
    const vt = [], upd = () => { const tot = V.reduce((a, b) => a + b, 0); sumT.textContent = `${labelText('lenSum')} ${tot} ${labelText('lenM')} / 1000 ${labelText('lenM')}`; sumT.setAttribute('fill', tot === 1000 ? LENC.ok : '#c8392d'); V.forEach((v, i) => vt[i].textContent = `${v} ${labelText('lenM')}`); /*T*/window.__track = V.slice();/*/T*/ };
    const btns = [];
    for (let i = 0; i < n; i++) { const y = 88 + i * 64; el('rect', { x: 110, y: y - 22, width: 140, height: 44, rx: 10, fill: [LENC.bar, LENC.bar2, '#4f9a6a', '#8e6bbf'][i], opacity: .15 }, g); vt.push(el('text', { x: 180, y: y + 8, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: LENC.ink, direction: 'rtl' }, g));
      for (const [d, x, lab] of [[-50, 72, 'stepLess'], [50, 288, 'stepMore']]) { const b = el('g', { role: 'button', tabindex: 0, 'aria-label': plain(labelText(lab)) + ' ' + DG(i + 1), style: 'cursor:pointer', 'data-step': i + ':' + d }, g); el('circle', { cx: x, cy: y, r: 24, fill: '#eef6fb', stroke: css('--compass'), 'stroke-width': 2.5 }, b); const t = el('text', { x, y: y + 9, 'text-anchor': 'middle', 'font-size': 28, 'font-weight': 800, fill: css('--compass'), 'pointer-events': 'none' }, b); t.textContent = d < 0 ? '−' : '+';
        hitPad(b, 64); const go = () => { V[i] = Math.max(50, Math.min(900, V[i] + d)); SFX.tick(); upd(); }; b.onclick = go; b.onkeydown = e => { if (isActKey(e)) { e.preventDefault(); go(); } }; btns.push(b); } }
    upd(); await S(tries >= 3 ? 'gen.len.together.track' : item.q);
    AUTO({ kind: 'track', ok: () => { (n === 3 ? [500, 300, 200] : [400, 300, 200, 100]).forEach((v, i) => V[i] = v); upd(); rulDoneBtn().click(); }, wrong: () => { V.fill(300); upd(); rulDoneBtn().click(); } });
    await rulDone(() => btns.forEach(b => { b.onclick = null; b.onkeydown = null; b.removeAttribute('role'); }));
    return { ans: V.join(','), ctx: { svg } }; },
  judge(item, k) { const s = k.split(',').map(Number), sum = s.reduce((a, b) => a + b, 0); if (sum !== 1000) return { ok: false, err: 'trackSum' }; if (new Set(s).size !== s.length) return { ok: false, err: 'trackSame' }; return { ok: true }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.len.hint.track'); }, async together() {},
  async reveal() { await S('gen.len.reveal.track'); },
  praise: () => 'praiseNewWay', twin(item) { return item.twin || null; },
};

/* ================= المشاهد ================= */
/* شريط القياس: يمتدّ من علبته حتى المتر، وعلامة المتر عند 100 سم */
SCENES.tapeIntro = async c => { const L = c.lines; let svg = lenStage(220); const T = tapeAt(svg, { x: 40, y: 110, to: 110, pxcm: 2.6, label: 10 }), cover = el('rect', { x: 42, y: 100, width: 300, height: 56, fill: GEO.paper }, svg);
  await S(L[0]); await axTween(1200, t => cover.setAttribute('x', 42 + 290 * t)); cover.remove(); SFX.tick(); const m = helpG(svg); thinkRing(m, [T.X(100), T.y + 22], 16); await S(L[1]);
  svg = lenStage(220); const T2 = tapeAt(svg, { x: 40, y: 140, to: 120, pxcm: 2.5, label: 10 }); el('rect', { x: 40, y: 84, width: T2.X(85) - 40, height: 40, rx: 4, fill: '#b9794e' }, svg); const tt = el('text', { x: (40 + T2.X(85)) / 2, y: 110, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: '#fff' }, svg); tt.textContent = labelText('len.th.doorW');
  el('line', { x1: T2.X(85), y1: 80, x2: T2.X(85), y2: 176, stroke: '#c8392d', 'stroke-width': 2.4, 'stroke-dasharray': '4 3' }, svg); await S(L[2]); };
/* الكيلومتر: عشر خطوات من مئة متر حتى البوابة، ودقائق المشي */
SCENES.kmWalk = async c => { const L = c.lines, svg = lenStage(230), y = 128, x0 = 330, k = 28; el('rect', { x: 34, y: y - 4, width: 300, height: 8, rx: 4, fill: '#d9c7a4' }, svg);
  el('path', { d: `M${x0 - 6} ${y - 30} L${x0 + 6} ${y - 30} L${x0 + 6} ${y - 6} L${x0 - 6} ${y - 6} Z`, fill: '#3d7cc0' }, svg); el('path', { d: `M${x0 - 10 * k - 14} ${y - 6} V${y - 40} H${x0 - 10 * k + 14} V${y - 6}`, fill: 'none', stroke: '#8a6a4a', 'stroke-width': 5 }, svg);
  await S(L[0]); const g = el('g', {}, svg); for (let i = 1; i <= 10; i++) { const x = x0 - i * k; el('circle', { cx: x, cy: y, r: 5, fill: '#c8392d' }, g); if (i % 5 === 0) { const t = el('text', { x, y: y + 30, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: LENC.ink, direction: 'ltr' }, g); t.textContent = String(i * 100); } SFX.tick(); await sleep(FAST ? 10 : 160); }
  await S(L[1]); if (L[2]) await S(L[2]); };
/* جدول اختيار الوحدة: أربعة أشياء ووحداتها */
SCENES.unitTable = async c => { const L = c.lines, svg = lenStage(240), rows = c.pics || ['ant', 'pencil', 'door', 'road']; await S(L[0]);
  for (const [i, k] of rows.entries()) { const x = 300 - i * 80; lenThing(svg, k, x, 84, .5); const t = el('text', { x, y: 150, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: LENC.bar }, svg); t.textContent = labelText(LEN_LB[LEN_TH[k].u]); SFX.tick(); await S('gen.len.u.' + LEN_TH[k].u); }
  if (L[1]) await S(L[1]); };
/* جدول التحويل: م وسم وملم، يملؤه الطفل صفاً صفاً بالمشاهدة */
SCENES.convTable = async c => { const L = c.lines, svg = lenStage(232), X = { m: 270, cm: 180, mm: 90 }, y0 = 50; await S(L[0]);
  for (const [k, x] of Object.entries(X)) { const t = el('text', { x, y: y0, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: LENC.bar }, svg); t.textContent = labelText(LEN_LB[k]); }
  for (let r = 1; r <= 3; r++) { for (const [k, f] of [['m', 1], ['cm', 100], ['mm', 1000]]) { const t = el('text', { x: X[k], y: y0 + r * 44, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: LENC.ink, direction: 'ltr' }, svg); t.textContent = String(r * f); } SFX.tick(); await sleep(FAST ? 10 : 400); }
  await S(L[1]); if (L[2]) await S(L[2]); };
/* الطول المركّب: شريط 235 سم يُقسم إلى مترين و35 سم */
SCENES.mcSplit = async c => { const L = c.lines, svg = lenStage(220), cm = c.cm || 235, k = 1.2, x0 = 40, g = el('g', {}, svg); el('rect', { x: x0, y: 80, width: cm * k, height: 30, rx: 4, fill: LENC.bar }, g); lenCard(svg, 180, 46, [cm, 'cm'], { w: 140, h: 44, fs: 18 }); await S(L[0]);
  for (let i = 0; i < Math.floor(cm / 100); i++) { el('rect', { x: x0 + i * 100 * k, y: 120, width: 100 * k - 3, height: 24, rx: 4, fill: '#f2d38a', stroke: '#b9862a', 'stroke-width': 1.5 }, g); const t = el('text', { x: x0 + (i + .5) * 100 * k, y: 137, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: LENC.ink, direction: 'rtl' }, g); t.textContent = `1 ${labelText('lenM')}`; SFX.tick(); await sleep(FAST ? 10 : 400); }
  const r = cm % 100; if (r) { el('rect', { x: x0 + Math.floor(cm / 100) * 100 * k, y: 120, width: r * k, height: 24, rx: 4, fill: '#cfe6f5', stroke: LENC.bar, 'stroke-width': 1.5 }, g); }
  lenCard(svg, 180, 180, [cm, 'mc'], { w: 160, h: 44, fs: 18 }); await S(L[1]); if (L[2]) await S(L[2]); };
/* المقارنة بعد التحويل: 2 م و150 سم */
SCENES.cmpShow = async c => { const L = c.lines, svg = lenStage(232), a = c.a || [2, 'm'], b = c.b || [150, 'cm']; lenCard(svg, 262, 70, a); lenCard(svg, 98, 70, b, { stroke: LENC.bar2 }); await S(L[0]);
  const t = el('text', { x: 262, y: 124, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: css('--think'), direction: 'rtl' }, svg); t.textContent = '= ' + lenMM(a) / 10 + ' ' + labelText('rulCm'); await S(L[1]); lenBars(svg, [a, b], 150); await S(L[2]); };
/* الجمع بإعادة التجميع: 2 م 40 سم + 1 م 80 سم */
SCENES.addWorked = async c => { const L = c.lines, item = { a: c.a || [2, 40], b: c.b || [1, 80], op: c.op || '+' }, svg = newStage(212, { oasis: false, ground: 0 }), T = calcTable(svg, item, 30);
  const A = item.a[0] * 100 + item.a[1], B = item.b[0] * 100 + item.b[1];
  if (item.op === '+') { await S(L[0]); const sc = item.a[1] + item.b[1]; T.r2.textContent = String(sc); T.r1.textContent = String(item.a[0] + item.b[0]); SFX.tick(); await S(L[1]); if (sc >= 100) { await axTween(600, t => T.r2.setAttribute('opacity', 1 - .7 * t)); T.r2.textContent = String(sc - 100); T.r2.setAttribute('opacity', 1); T.r1.textContent = String(item.a[0] + item.b[0] + 1); T.r1.setAttribute('fill', LENC.ok); SFX.pop(); } await S(L[2]); }
  else { await S(L[0]); const m = helpG(svg), t = el('text', { x: 316, y: 92, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: css('--think'), direction: 'ltr' }, m); t.textContent = `${A} − ${B}`; await S(L[1]); const [mm, cc] = mcNorm(A - B); T.r1.textContent = String(mm); T.r2.textContent = String(cc); SFX.tick(); await S(L[2]); } };
/* التحقق بالتقريب لأقرب متر */
SCENES.roundShow = async c => { const L = c.lines, it = ITEM.lenRound.make({ v: c.v || [2, 40], ch: [2, 3] }), svg = newStage(210, { oasis: false, ground: 0 }), x0 = 50, k = 100, m0 = it.v[0] - 1, X = cm => x0 + (cm - m0 * 100) / 100 * k;
  geoLine(svg, x0 - 10, 130, x0 + 2.6 * k + 10, 130, { color: LENC.ink, w: 3 }); for (let i = 0; i <= 2; i++) { const x = X((m0 + i) * 100); geoLine(svg, x, 120, x, 140, { color: LENC.ink, w: 3 }); const t = el('text', { x, y: 166, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: LENC.ink, direction: 'rtl' }, svg); t.textContent = `${m0 + i} ${labelText('lenM')}`; geoLine(svg, x + k / 2, 125, x + k / 2, 135, { color: LENC.soft, w: 2 }); }
  const px = X(it.v[0] * 100 + it.v[1]); el('circle', { cx: px, cy: 130, r: 8, fill: '#c8392d' }, svg); lenCard(svg, px, 76, [[it.v[0], it.v[1]], 'pair'], { w: 128, h: 46, fs: 18 }); await S(L[0]);
  const near = X(it.w * 100); el('path', { d: `M${px} 142 Q${(px + near) / 2} 162 ${near} 142`, fill: 'none', stroke: LENC.ok, 'stroke-width': 3 }, svg); SFX.tick(); await S(L[1]); if (L[2]) await S(L[2]); };
/* المراجع الشخصية: الإصبع والقلم والباب */
SCENES.refsShow = async c => { const L = c.lines; await S(L[0]); for (const [i, k] of (c.refs || ['finger', 'pencil', 'door']).entries()) { const svg = lenStage(220); lenThing(svg, k, 180, 104, 1.1); const t = el('text', { x: 180, y: 190, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: LENC.bar, direction: 'rtl' }, svg); t.textContent = labelText('len.ref.' + k); await S('gen.len.ref.' + k); } if (L[1]) await S(L[1]); };
/* مخطط الغرفة: جدران بأطوالها (دون مقياس) */
SCENES.roomPlan = async c => { const L = c.lines, svg = lenStage(240), W = c.w || [4, 20], H = c.h || [3, 50], g = el('g', {}, svg); el('rect', { x: 80, y: 52, width: 200, height: 136, fill: '#fffdf6', stroke: LENC.ink, 'stroke-width': 6 }, g); el('rect', { x: 150, y: 184, width: 40, height: 8, fill: '#fffdf6' }, g); await S(L[0]);
  for (const [v, x, y] of [[W, 180, 40], [H, 316, 124], [W, 180, 220], [H, 44, 124]]) { lenCard(g, x, y, [v, 'pair'], { w: 104, h: 30, fs: 14 }); SFX.tick(); await sleep(FAST ? 10 : 300); } await S(L[1]); if (L[2]) await S(L[2]); };
/* التذكّر */
SCENES.recallTape = async c => { const svg = lenStage(220); ITEM.tapeRead.draw({ len: c.len || 75, thing: c.thing || 'table' }, svg); await S(c.lines[0]); };
SCENES.recallConv = async c => { const svg = lenStage(220); convEq(svg, { v: c.v || [2, 'm'], to: c.to || 'cm' }); convRule(svg, (c.v || [2, 'm'])[1], c.to || 'cm', 182); await S(c.lines[0]); };
SCENES.recallCalc = async c => { const svg = newStage(212, { oasis: false, ground: 0 }), item = { a: c.a || [1, 60], b: c.b || [1, 50], op: c.op || '+' }, T = calcTable(svg, item, 30), A = item.a[0] * 100 + item.a[1], B = item.b[0] * 100 + item.b[1], [m, cc] = mcNorm(item.op === '-' ? A - B : A + B); T.r1.textContent = String(m); T.r2.textContent = String(cc); await S(c.lines[0]); };
SCENES.recallUnit = async c => { const svg = lenStage(220); (c.pics || ['ant', 'pencil', 'door', 'road']).forEach((k, i) => { const x = 300 - i * 80; lenThing(svg, k, x, 84, .5); const t = el('text', { x, y: 150, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: LENC.bar }, svg); t.textContent = labelText(LEN_LB[LEN_TH[k].u]); }); await S(c.lines[0]); };
WRAP_ART.lenArt = svg => { const g = el('g', {}, svg); tapeAt(g, { x: 70, y: 120, to: 100, pxcm: 2.2, label: 20 }); anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200, fill: 'both' }); palmAt(svg, 326, 250, .8); palmAt(svg, 34, 250, .9); };
