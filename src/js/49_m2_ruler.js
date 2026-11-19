/* =====================================================================
   S2-U0 «أدواتي الأولى: المسطرة» (المرحلة 2، نوفمبر 2026)
   C180 الحاجة إلى وحدة ثابتة · C181 السنتيمتر والمليمتر وقراءة المسطرة · C182 القياس بمحاذاة الصفر ·
   C183 القياس من غير الصفر (الفرق) · C184 رسم خط بطول معلوم · C185 قياس المنحني بالخيط.
   المسطرة مرقّمة بالأرقام الغربية دائماً كالمسطرة الحقيقية (D229 (4))، والعدد على الخط لا على البلاطة (D222).
   الأطوال بالمليمتر عدداً صحيحاً في البيانات (cm، mm) فلا كسور عشرية تُقرأ.
   ===================================================================== */
const RUL = { body: '#f6e3a1', edge: '#c9a54a', ink: '#3b3a36', thing: '#3d7cc0', chaos: '#c8392d', hl: '#2f9d6b' };
const RUL_H = 46;
/* المسطرة: o = { x: موضع أول تدريجة ظاهرة، y: حافتها العليا، pxcm، from، to (سم)، mm: تُرسم المليمترات، broken: طرفها الأيمن مكسور عند from، lead: هامش قبل الصفر }
   المسطرة تُقرأ من اليسار إلى اليمين كالمسطرة الحقيقية */
function rulerAt(parent, o) { const { x, y, pxcm, from = 0, to, mm = pxcm >= 50, broken = false } = o, lead = broken ? 0 : (o.lead ?? 12), W = (to - from) * pxcm, g = el('g', { 'data-ruler': from }, parent);
  const X = v => x + (v - from) * pxcm, left = x - lead, right = x + W + 10;
  const d = broken ? `M${left} ${y} l5 8 l-6 7 l6 8 l-5 8 l6 8 l-6 ${RUL_H - 39} H${right} V${y} Z` : `M${left} ${y} H${right} V${y + RUL_H} H${left} Z`;
  el('path', { d, fill: RUL.body, stroke: RUL.edge, 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
  const ticks = {}, labels = {};
  for (let m = from * 10; m <= to * 10; m++) { const cm = m % 10 === 0, half = m % 5 === 0; if (!cm && !mm) continue;
    ticks[m] = el('line', { x1: X(m / 10), y1: y, x2: X(m / 10), y2: y + (cm ? 17 : half ? 12 : 8), stroke: RUL.ink, 'stroke-width': cm ? 2 : 1.2 }, g);
    if (cm) labels[m / 10] = el('text', { x: X(m / 10), y: y + 34, 'text-anchor': 'middle', 'font-size': Math.min(17, Math.max(12, pxcm * .5)), 'font-weight': 700, fill: RUL.ink, 'font-family': 'var(--font-read)', direction: 'ltr' }, g); if (cm) labels[m / 10].textContent = String(m / 10); }
  return { g, X, y, from, to, pxcm, ticks, labels, left, right, broken,
    mark(v, col = RUL.hl) { const t = ticks[Math.round(v * 10)]; if (t) { t.setAttribute('stroke', col); t.setAttribute('stroke-width', 3.2); t.setAttribute('y2', y + 20); } const l = labels[v]; if (l) l.setAttribute('fill', col); },
    move(dx) { g.setAttribute('transform', `translate(${dx} 0)`); } }; }
/* عدسة على موضع v: مقطع من المسطرة مكبّراً (pxcm = 110) في إطار فوقها، فتُرى المليمترات (العدسة للنظر لا للمس) */
function rulerLens(svg, R, v, o = {}) { const w = 250, h = 96, cx = Math.max(w / 2 + 6, Math.min(354 - w / 2, o.cx ?? R.X(v))), y0 = o.y ?? R.y - h - 78, k = 110, c0 = Math.floor(v) - (v - Math.floor(v) < .25 ? .6 : .35), id = 'rlens' + (++SYM_ID), g = el('g', { 'pointer-events': 'none', 'data-lens': 1 }, svg);
  el('rect', { x: cx - w / 2, y: y0, width: w, height: h, rx: 16, fill: '#fffdf6', stroke: css('--compass'), 'stroke-width': 3 }, g);
  el('clipPath', { id }, g).appendChild(el('rect', { x: cx - w / 2 + 3, y: y0 + 3, width: w - 6, height: h - 6, rx: 13 }));
  const f0 = Math.floor(c0), zf = Math.max(R.from, f0), zt = Math.min(R.to, f0 + 4);   /* العدسة لا تُري تدريجات قبل أول المسطرة ولا بعد آخرها */
  const inner = el('g', { 'clip-path': `url(#${id})` }, g), yr = y0 + 42, Z = rulerAt(inner, { x: cx - w / 2 - (c0 - f0) * k + (zf - f0) * k, y: yr, pxcm: k, from: zf, to: zt, mm: true, lead: zf === R.from && !R.broken ? 12 : 0 });
  if (o.thing) rulThingAt(inner, o.thing, Z.X(v) - 400, Z.X(v), yr - 2, o.color);
  const xv = Math.max(cx - w / 2 + 10, Math.min(cx + w / 2 - 10, Z.X(v)));   /* الخط المنقّط يصل الموضع على المسطرة بالموضع نفسه داخل العدسة */
  el('line', { x1: R.X(v), y1: R.y - 4, x2: xv, y2: y0 + h, stroke: css('--compass'), 'stroke-width': 2, 'stroke-dasharray': '4 4' }, g);
  if (o.mark) { el('line', { x1: Z.X(v), y1: yr - 24, x2: Z.X(v), y2: yr + 2, stroke: o.mark, 'stroke-width': 2.4 }, inner); el('circle', { cx: Z.X(v), cy: yr - 26, r: 6, fill: o.mark, stroke: '#fff', 'stroke-width': 2 }, inner); }   /* mark: علامة النقطة المسحوبة داخل العدسة (نقطة المنتصف) */
  return { g, Z, yr, remove() { g.remove(); } }; }
/* الشيء المقيس: يمتدّ من x1 إلى x2 تماماً، وأسفله عند y */
function rulThingAt(parent, kind, x1, x2, y, color) { const g = el('g', { 'data-thing': kind }, parent), w = x2 - x1, c = color || RUL.thing;
  if (kind === 'pencil') { el('rect', { x: x1, y: y - 12, width: Math.max(0, w - 16), height: 12, fill: '#f2b33d', stroke: '#b9862a', 'stroke-width': 1.2 }, g); el('rect', { x: x1, y: y - 12, width: Math.min(9, w / 4), height: 12, fill: '#e58f8f' }, g); el('path', { d: `M${x2 - 16} ${y - 12} L${x2} ${y - 6} L${x2 - 16} ${y} Z`, fill: '#ecd3a8', stroke: '#b9862a', 'stroke-width': 1 }, g); el('path', { d: `M${x2 - 5} ${y - 8} L${x2} ${y - 6} L${x2 - 5} ${y - 4} Z`, fill: '#3b3a36' }, g); }
  else if (kind === 'nail') { el('rect', { x: x1, y: y - 13, width: 5, height: 13, rx: 1.5, fill: '#7d8a92' }, g); el('path', { d: `M${x1 + 4} ${y - 9} H${x2 - 9} L${x2} ${y - 6.5} L${x2 - 9} ${y - 4} H${x1 + 4} Z`, fill: '#a9b4bb', stroke: '#7d8a92', 'stroke-width': 1 }, g); }
  else if (kind === 'crayon') { el('rect', { x: x1, y: y - 13, width: Math.max(0, w - 12), height: 13, rx: 2, fill: c }, g); el('rect', { x: x1 + w * .25, y: y - 13, width: w * .3, height: 13, fill: '#fff', opacity: .55 }, g); el('path', { d: `M${x2 - 12} ${y - 12} L${x2} ${y - 6.5} L${x2 - 12} ${y - 1} Z`, fill: c }, g); }
  else if (kind === 'leaf') { el('path', { d: `M${x1} ${y - 7} Q${x1 + w / 2} ${y - 24} ${x2} ${y - 7} Q${x1 + w / 2} ${y + 8} ${x1} ${y - 7} Z`, fill: '#5fa35a', stroke: '#3d7a3f', 'stroke-width': 1.2 }, g); el('line', { x1, y1: y - 7, x2, y2: y - 7, stroke: '#3d7a3f', 'stroke-width': 1 }, g); }
  else if (kind === 'key') { el('circle', { cx: x1 + 9, cy: y - 9, r: 9, fill: 'none', stroke: '#b9862a', 'stroke-width': 4 }, g); el('path', { d: `M${x1 + 18} ${y - 11} H${x2} V${y - 2} H${x2 - 5} V${y - 7} H${x2 - 11} V${y - 2} H${x2 - 16} V${y - 7} H${x1 + 18} Z`, fill: '#d9a441' }, g); }
  else if (kind === 'seg' || Array.isArray(kind)) { const nm = Array.isArray(kind) ? kind : ['a', 'b']; geoObj(g, 'seg', [x1, y - 8], [x2, y - 8], { names: nm, labP: [0, -10], labQ: [0, -10] }); }   /* قطعة مستقيمة مسمّاة (S2-U1): kind = ['a', 'b'] */
  else el('rect', { x: x1, y: y - 12, width: w, height: 12, rx: 2, fill: c, stroke: '#0003', 'stroke-width': 1 }, g);   /* strip */
  return g; }
/* عدد ووحدته منطوقين: «خمسة سنتيمترات»، «سنتيمتر واحد»، «سنتيمتران»، «اثنا عشر سنتيمتراً» */
/* المقاطع تُلحَق بنصّ الفقاعة (append) ولا تحلّ محلّه: السؤال المركّب «ارسم خطاً طوله: أربعة سنتيمترات» يبقى مكتوباً كله لمن كتم الصوت */
async function sayLen(n, u = 'cm', opt = {}) { opt = { append: true, ...opt }; if (n === 1) return S(`gen.rul.${u}.one`, opt); if (n === 2) return S(`gen.rul.${u}.two`, opt); await S(numw(n), { noGap: true, append: opt.append }); return S(`gen.rul.${u}.${n <= 10 ? 'few' : 'many'}`, opt); }
/* قفزات العدّ بين تدريجتين: قوس فوق كل مسافة وعددها يُنطق؛ step بالسنتيمتر (1) أو بالمليمتر (.1) */
async function rulerHops(svg, R, a, b, o = {}) { const m = helpG(svg), step = o.step || 1, n = Math.round((b - a) / step), yy = o.y ?? R.y - 2; for (let i = 0; i < n; i++) { const x1 = R.X(a + i * step), x2 = R.X(a + (i + 1) * step), h = Math.min(20, (x2 - x1) * .7);
    el('path', { d: `M${x1} ${yy} Q${(x1 + x2) / 2} ${yy - h * 1.6} ${x2} ${yy}`, fill: 'none', stroke: o.color || css('--compass'), 'stroke-width': 2.6, 'stroke-linecap': 'round' }, m); SFX.tick(); if (o.silent) await sleep(o.ms || 160); else await S(numw(i + 1), { noGap: true, num: true }); } return m; }
const rulNear = (w, ...alts) => { const out = [w]; for (const a of [...alts, w + 1, w - 1, w + 2, w + 3]) if (out.length < 3 && a >= 0 && !out.includes(a)) out.push(a); return out; };

/* ================= ① اقرأ الطول على المسطرة (C181 من الصفر؛ C183 من غير الصفر أو بمسطرة مكسورة)
   b نهاية الشيء، a بدايته (0)، brk: المسطرة مكسورة وتبدأ من brk، thing نوع الشيء ================= */
ITEM.rulerRead = { ...numItem,
  make(spec) { const a = spec.a || 0, w = spec.b - a, from = spec.brk || 0; return { ...spec, a, from, want: w, nums: a ? rulNear(w, spec.b, w + 1) : rulNear(w, w + 1, w - 1), tag: a ? (spec.brk ? 'ruler-broken' : 'ruler-diff') : 'ruler-read' }; },
  draw(item, svg, tries) { const to = Math.max(item.from + 10, item.b + 1), R = rulerAt(svg, { x: 30, y: 128, pxcm: 300 / (to - item.from), from: item.from, to, mm: false, broken: !!item.brk }); rulThingAt(svg, item.thing || 'pencil', R.X(item.a), R.X(item.b), 126, item.color);
    for (const v of [item.a, item.b]) el('line', { x1: R.X(v), y1: 96, x2: R.X(v), y2: 128, stroke: css('--compass'), 'stroke-width': 1.6, 'stroke-dasharray': '3 3', 'pointer-events': 'none' }, svg); return R; },
  async ask(item, mode, tries) { const svg = newStage(214, { oasis: false, ground: 0 }), R = this.draw(item, svg, tries); let hops = null;
    if (tries >= 3) { await S('gen.rul.together.read'); hops = await rulerHops(svg, R, item.a, item.b, { silent: true }); }   /* الحلّ المشترك: القفزات مرسومة، والعدّ للطفل */
    else await S(item.q); const np = numberPick(shuffle(item.nums), item.want, { digits: true, west: true }); return { ans: await np.p, ctx: { svg, np, R, hops } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: item.a && k === item.b ? 'rulerEnd' : k === item.want + 1 ? 'rulerLines' : 'rulerWrong' }; },
  async hint2(item, r) { const m = await rulerHops(r.ctx.svg, r.ctx.R, item.a, item.b, { silent: true, ms: 260 }); await sleep(700); m.remove(); }, async together() {},
  async reveal(item, r) { if (!r.ctx.hops) await rulerHops(r.ctx.svg, r.ctx.R, item.a, item.b); await sayLen(item.want); },
  praise: () => 'praiseMeasure', twin(item) { return item.twin || null; },
};

/* ================= ② كم مليمتراً في n سنتيمتر؟ (C181) ================= */
ITEM.mmIn = { ...numItem,
  make(spec) { const w = spec.n * 10; return { ...spec, want: w, nums: rulNear(w, spec.n, spec.n === 1 ? 20 : w - 10, w + 10), tag: 'mm-in' }; },
  async ask(item, mode, tries) { const svg = newStage(190, { oasis: false, ground: 0 }), n = item.n, R = rulerAt(svg, { x: 34, y: 96, pxcm: Math.min(100, 292 / n), from: 0, to: n, mm: true }); el('rect', { x: R.X(0), y: 78, width: R.X(n) - R.X(0), height: 12, rx: 3, fill: css('--compass'), opacity: .85 }, svg); let hops = null;
    if (tries >= 3) { await S('gen.rul.together.mm'); hops = await rulerHops(svg, R, 0, 1, { step: .1, silent: true, ms: 120, y: 76 }); } else await S(item.q);
    const np = numberPick(shuffle(item.nums), item.want, { digits: true, west: true }); return { ans: await np.p, ctx: { svg, np, R, hops } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: k === item.n ? 'mmAsCm' : 'mmWrong' }; },
  async hint2(item, r) { const m = await rulerHops(r.ctx.svg, r.ctx.R, 0, 1, { step: .1, silent: true, ms: 150, y: 76 }); await sleep(600); m.remove(); }, async together() {},
  async reveal(item, r) { await S('gen.rul.reveal.mm'); await sayLen(item.want, 'mm'); },
  praise: () => 'praiseMeasure', twin(item) { return item.twin || null; },
};

/* ================= ③ أيّ أداة قياسها ثابت للجميع؟ (C180): pics ثلاث، ask: fixed (الثابتة الوحيدة) أو not (غير الثابتة الوحيدة) ================= */
const TOOL_FIXED = { ruler: true, tape: true, cmStrip: true, span: false, step: false, arm: false };
function toolPicAt(parent, kind, x, y) { const g = el('g', { transform: `translate(${x} ${y})`, 'data-tool': kind }, parent); el('rect', { x: -48, y: -52, width: 96, height: 104, rx: 16, fill: '#fffdf6', stroke: css('--line'), 'stroke-width': 2.5 }, g);
  if (kind === 'ruler') rulerAt(g, { x: -34, y: -18, pxcm: 17, from: 0, to: 4, mm: false, lead: 4 }).g.setAttribute('transform', 'rotate(-18)');
  else if (kind === 'tape') { el('rect', { x: -30, y: -26, width: 44, height: 44, rx: 9, fill: '#e2b33c', stroke: '#a67c1e', 'stroke-width': 2 }, g); el('circle', { cx: -8, cy: -4, r: 9, fill: '#fff8', stroke: '#a67c1e', 'stroke-width': 2 }, g); el('rect', { x: 14, y: 6, width: 26, height: 11, fill: '#fdf6d8', stroke: '#a67c1e', 'stroke-width': 1.5 }, g); for (let i = 0; i < 4; i++) el('line', { x1: 19 + i * 6, y1: 6, x2: 19 + i * 6, y2: 11, stroke: RUL.ink, 'stroke-width': 1.2 }, g); }
  else if (kind === 'cmStrip') { for (let i = 0; i < 5; i++) el('rect', { x: -38 + i * 15, y: -8, width: 15, height: 15, fill: i % 2 ? '#e9dcc3' : '#f3ead6', stroke: '#b9a57e', 'stroke-width': 1.2 }, g); }
  else if (kind === 'span') handSpanAt(g, 30, 30, 60);
  else if (kind === 'step') { for (const [dx, dy, r] of [[-16, 10, -12], [14, -12, 10]]) { const f = el('g', { transform: `translate(${dx} ${dy}) rotate(${r})` }, g); el('ellipse', { rx: 11, ry: 18, fill: '#8a5a3a' }, f); el('ellipse', { cy: 14, rx: 8, ry: 6, fill: '#6d4429' }, f); } }
  else if (kind === 'arm') { el('path', { d: 'M-36 12 Q-10 -2 14 -10 L22 -22 L30 -18 L26 -6 L34 -8 L34 0 L20 8 Q-8 22 -34 26 Z', fill: '#e9b98c', stroke: '#c48f62', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, g); el('path', { d: 'M-36 10 L-18 4 L-14 20 L-34 28 Z', fill: '#3d7cc0' }, g); }
  return g; }
ITEM.toolFixed = {
  make(spec) { const want = spec.pics.findIndex(k => (spec.ask === 'not') !== TOOL_FIXED[k]); return { ...spec, want, tag: 'tool-fixed-' + (spec.ask || 'fixed') }; },
  async ask(item, mode, tries) { const svg = newStage(200, { oasis: false, ground: 0 }), G = item.pics.map((k, i) => toolPicAt(svg, k, SYM_X3[i], 100));
    if (tries >= 3) item.pics.forEach((k, i) => { if (!TOOL_FIXED[k]) { const m = helpG(svg); el('text', { x: SYM_X3[i], y: 182, 'text-anchor': 'middle', 'font-size': 15, fill: css('--think') }, m).textContent = labelText('rulVaries'); } });   /* الحلّ المشترك: ما يختلف من شخص لآخر معلَّم، والاختيار له */
    say(...lineOf(tries >= 3 ? 'gen.rul.together.tool' : item.q), { free: true });
    const k = await tapOne(G.map((g, i) => ({ g, k: i, label: labelText('rulTool.' + item.pics[i]) })), { ok: item.want, pad: 100 }); hush(); return { ans: k, ctx: { svg, G } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: item.ask === 'not' ? 'toolNot' : 'toolFixedWrong' }; },
  onOk(item, r) { SFX.good(); okRing(r.ctx.svg, r.ctx.G[r.ans], 2); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { await S('gen.rul.hint.tool'); }, async together() {},
  async reveal(item, r) { okRing(r.ctx.svg, r.ctx.G[item.want], 2); await S(item.ask === 'not' ? 'gen.rul.reveal.toolNot' : 'gen.rul.reveal.tool'); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};

/* صورة بند التعليل: مسطرة وشيء من a إلى b (reasonPic، النوع ruler) */
function rulerReasonPic(g, P) { const it = ITEM.rulerRead.make({ b: P.b, a: P.a || 0, brk: P.brk, thing: P.thing || 'nail' }); ITEM.rulerRead.draw(it, g); }
/* ---------- مشاهد الدرس 1 ---------- */
/* الإشعال: فوضى وفرجار يقيسان الطاولة نفسها بشبريهما (جدولا S1-U4)، فيختلف العددان. c.a أشبار فرجار، c.b أشبار فوضى، lines: [دعوة، بعد] */
SCENES.spanClash = async c => { const svg = newStage(300, { oasis: false, ground: 0 }), [l1, l2] = c.lines; spanTables(svg, c.a, c.b);
  await S(l1); logAttempt({ scene: 'hook', tag: 'spanClash', ok: true }); await S(l2); };
/* أرقام المسطرة (D229 (4)): قبل أول مسطرة يرى الطفل الأعداد من الصفر إلى العشرة بأرقامه التي يعرفها، وتحت كل عدد كتابته بأرقام المسطرة؛
   يلمس البطاقات فتُقرأ واحدة واحدة. ومن كانت أرقامه هي أرقام المسطرة لا يحتاج المشهد فيُتخطّى. lines: [الدعوة، ختام] */
SCENES.digitPairs = async c => { if (DG(5) === '5') return; const svg = newStage(200, { oasis: false, ground: 0 }), [l1, l2] = c.lines, n = 11, w = 31, x0 = 180 - n * w / 2, row = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg), C = [];
  for (let i = 0; i < n; i++) { const x = x0 + i * w + w / 2, g = el('g', {}, row), r = el('rect', { x: x - w / 2 + 2, y: 44, width: w - 4, height: 112, rx: 8, fill: '#fffdf6', stroke: css('--line'), 'stroke-width': 2 }, g); el('rect', { x: x - w / 2 + 2, y: 104, width: w - 4, height: 52, rx: 8, fill: RUL.body, stroke: RUL.edge, 'stroke-width': 1.5 }, g);
    const t1 = el('text', { x, y: 84, 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 700, fill: css('--ink'), 'pointer-events': 'none' }, g); t1.textContent = DG(i);
    const t2 = el('text', { x, y: 138, 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 700, fill: RUL.ink, 'font-family': 'var(--font-read)', direction: 'ltr', 'pointer-events': 'none' }, g); t2.textContent = String(i); C.push(r); }
  await answerWhile(l1, () => tapOne([{ g: row, k: 'r', label: labelText('rulDigits') }], { ok: 'r', pad: 60, pulse: true }));
  for (let i = 0; i < n; i++) { C[i].setAttribute('stroke', css('--compass')); C[i].setAttribute('stroke-width', 4); SFX.tick(); await S(numw(i), { noGap: true, num: true }); C[i].setAttribute('stroke', css('--line')); C[i].setAttribute('stroke-width', 2); }
  logAttempt({ scene: c.s || 'explore', tag: 'digitPairs', ok: true }); await S(l2); };
/* من البلاطة إلى الخط (D222): بلاطات طريق الأعداد سنتيمتراً سنتيمتراً، والعدد في وسط البلاطة؛ يلمسها الطفل فتلتصق وتنتقل الأعداد إلى الخطوط ويظهر الصفر.
   lines: [دعوة اللمس، بعد الانتقال، دعوة لمس الصفر، ختام] */
SCENES.tileRuler = async c => { const svg = newStage(230, { oasis: false, ground: 0 }), n = c.n || 6, k = 300 / n, x0 = 30, y = 96, [l1, l2, l3, l4] = c.lines, row = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg), T = [];
  for (let i = 0; i < n; i++) { const g = el('g', {}, row); el('rect', { x: x0 + i * k + 3, y, width: k - 6, height: k - 6, rx: 7, fill: i % 2 ? '#e9dcc3' : '#dccaa6', stroke: '#fff', 'stroke-width': 2.5 }, g); const t = el('text', { x: x0 + i * k + k / 2, y: y + k / 2 + 5, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 700, fill: RUL.ink, direction: 'ltr' }, svg); t.textContent = DG(i + 1); t.setAttribute('pointer-events', 'none'); T.push({ g, t }); }   /* على البلاطة بأرقام الطفل، وعلى الخط بأرقام المسطرة (D229 (4)) */
  await answerWhile(l1, () => tapOne([{ g: row, k: 'r', label: labelText('rulTiles') }], { ok: 'r', pad: 60 }));
  T.forEach(({ g }, i) => { const r = g.firstChild; r.setAttribute('x', x0 + i * k); r.setAttribute('width', k); r.setAttribute('rx', 0); r.setAttribute('stroke', '#b9a57e'); r.setAttribute('stroke-width', 1.5); }); SFX.pop(); await sleep(500);
  for (const [i, { t }] of T.entries()) { t.textContent = String(i + 1); await symTween(260, u => { t.setAttribute('x', x0 + i * k + k / 2 + u * k / 2); t.setAttribute('y', y + k / 2 + 5 + u * (k / 2 + 22)); }); el('line', { x1: x0 + (i + 1) * k, y1: y + k - 6, x2: x0 + (i + 1) * k, y2: y + k + 12, stroke: RUL.ink, 'stroke-width': 2 }, svg); SFX.tick(); }
  await S(l2); el('line', { x1: x0, y1: y + k - 6, x2: x0, y2: y + k + 12, stroke: RUL.hl, 'stroke-width': 3 }, svg);
  const z = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg); el('circle', { cx: x0, cy: y + k + 22, r: 15, fill: '#fffdf6', stroke: RUL.hl, 'stroke-width': 2.5 }, z); const zt = el('text', { x: x0, y: y + k + 28, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 700, fill: RUL.hl, direction: 'ltr' }, z); zt.textContent = '0';
  await answerWhile(l3, () => tapOne([{ g: z, k: 'z', label: labelText('rulZero') }], { ok: 'z', pad: 60, pulse: true })); SFX.good(); logAttempt({ scene: c.s || 'explore', tag: 'tileRuler', ok: true }); await S(l4); };
/* المليمتر: مسطرة 0–3، يلمس الطفل ما بين 0 و1 فتكبر، ثم يلمس المسافات العشر واحدة واحدة (التالية تنبض). lines: [دعوة التكبير، دعوة العدّ، ختام] */
SCENES.mmZoom = async c => { let svg = newStage(220, { oasis: false, ground: 0 }), R = rulerAt(svg, { x: 40, y: 100, pxcm: 93, from: 0, to: 3, mm: true }); const [l1, l2, l3] = c.lines;
  const hot = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg); el('rect', { x: R.X(0), y: 92, width: R.X(1) - R.X(0), height: 62, rx: 8, fill: css('--compass'), opacity: .18, stroke: css('--compass'), 'stroke-width': 2.5 }, hot);
  await answerWhile(l1, () => tapOne([{ g: hot, k: 'h', label: labelText('rulGap') }], { ok: 'h', pad: 60, pulse: true }));
  svg = newStage(220, { oasis: false, ground: 0 }); R = rulerAt(svg, { x: 36, y: 100, pxcm: 288, from: 0, to: 1, mm: true }); const m = helpG(svg); S(l2, { free: true });
  for (let i = 0; i < 10; i++) { const g = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg), x1 = R.X(i / 10), x2 = R.X((i + 1) / 10); el('rect', { x: x1 + 1.5, y: 70, width: x2 - x1 - 3, height: 28, rx: 5, fill: css('--compass'), opacity: .25 }, g);
    await tapOne([{ g, k: i, label: labelText('rulGap') + ' ' + DG(i + 1) }], { ok: i, pad: 60, pulse: true }); if (i === 0) hush(); g.firstChild.setAttribute('opacity', .9); g.removeAttribute('role'); g.removeAttribute('tabindex'); g.style.cursor = ''; g.setAttribute('pointer-events', 'none'); SFX.tick(); await S(numw(i + 1), { noGap: true, num: true }); }
  logAttempt({ scene: c.s || 'explore', tag: 'mmZoom', ok: true }); SFX.good(); await S(l3); };
/* المثال المحلول: شيء من الصفر إلى b؛ تُعدّ المسافات قفزاً ويُقال الطول. lines: [قبل، بعد] */
SCENES.rulerWorked = async c => { const svg = newStage(214, { oasis: false, ground: 0 }), it = ITEM.rulerRead.make({ b: c.b, a: c.a || 0, brk: c.brk, thing: c.thing }), R = ITEM.rulerRead.draw(it, svg), [l1, l2] = c.lines; let fz = null;
  if (c.says != null) { fz = chaosAt(svg, 324, 40, .34); badge(el('g', { 'pointer-events': 'none' }, svg), 282, 44, String(c.says), css('--chaos')); await chaosGiggle(fz); }   /* فوضى قرأت عدد النهاية */
  await S(l1); if (fz) fz.remove(); R.mark(it.a); await rulerHops(svg, R, it.a, it.b); R.mark(it.b); await sayLen(it.want); await S(l2); };
/* «صحّح لفوضى»: فوضى قرأت طولاً خاطئاً (C.says)؛ يختار الطفل الطول الصحيح. C: b، a، brk، thing، find، after */
SCENES.chaosRuler = async C => { const svg = newStage(214, { oasis: false, ground: 0 }), it = ITEM.rulerRead.make({ b: C.b, a: C.a || 0, brk: C.brk, thing: C.thing }), R = ITEM.rulerRead.draw(it, svg), fz = chaosAt(svg, 324, 40, .34); await chaosGiggle(fz); let tries = 0;
  if (C.says != null) { const m = el('g', { 'pointer-events': 'none' }, svg); badge(m, 282, 44, String(C.says), css('--chaos')); }
  while (true) { await S(C.find); const np = numberPick(shuffle(rulNear(it.want, C.says)), it.want, { digits: true, west: true }), k = await np.p; tries++; np.box && np.box.remove(); logAttempt({ scene: 'chaos', tag: 'find', ok: k === it.want, firstTry: tries === 1 }); if (k === it.want) break; SFX.soft(); await S('gen.pat.chaosNo'); if (tries >= 2) { const h = await rulerHops(svg, R, it.a, it.b, { silent: true, ms: 220 }); await sleep(500); h.remove(); } }
  SFX.good(); fz.remove(); await rulerHops(svg, R, it.a, it.b, { silent: true, ms: 120 }); await sayLen(it.want); if (C.after) await S(C.after); };
/* التذكّر: مسطرة وشيء وقفزات العدّ */
SCENES.recallRuler = async c => { const svg = newStage(214, { oasis: false, ground: 0 }), it = ITEM.rulerRead.make({ b: c.b || 4, a: c.a || 0, brk: c.brk, thing: c.thing || 'crayon' }), R = ITEM.rulerRead.draw(it, svg); await sleep(300); await rulerHops(svg, R, it.a, it.b, { silent: true }); await S(c.lines); };
SCENES.recallTools = async c => { const svg = newStage(200, { oasis: false, ground: 0 }); (c.pics || ['ruler', 'span', 'tape']).forEach((k, i) => toolPicAt(svg, k, SYM_X3[i], 100)); await sleep(300); await S(c.lines); };
WRAP_ART.rulerPath = svg => { const R = rulerAt(svg, { x: 60, y: 150, pxcm: 30, from: 0, to: 8, mm: false }); R.g.setAttribute('transform', 'rotate(-8 180 170)'); anim(R.g, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200, fill: 'both' }); palmAt(svg, 322, 250, .8); palmAt(svg, 40, 250, .9); };

/* =====================================================================
   الدرسان 2 و3: محاذاة الصفر (C182)، وأقرب سنتيمتر وأقرب مليمتر، والمسطرة المكسورة (C183)، والرسم بطول معلوم (C184)، والخيط (C185)
   ===================================================================== */
/* زرّا التحريك الدقيق يمين المسرح ويساره (بلوحة المفاتيح وباللمس)، كزرّي المرآة في S1-U6. step(s): s = −1 يساراً، +1 يميناً */
function rulNudges(svg, y, step, labels = ['rulLeft', 'rulRight'], o = {}) { return [-1, 1].map(s => { const b = el('g', { role: 'button', tabindex: 0, 'aria-label': plain(G(labelText(labels[s < 0 ? 0 : 1]))), style: 'cursor:pointer' }, svg), cx = 180 + s * 140;
    el('circle', { cx, cy: y, r: 36, fill: '#fffdf6', stroke: css('--compass'), 'stroke-width': 3 }, b); el('path', { d: o.vert ? `M${cx - 11} ${y + s * 5} l11 ${-s * 11} l11 ${s * 11}` : `M${cx - s * 5} ${y - 10} l${s * 11} 10 l${-s * 11} 10`, fill: 'none', stroke: css('--compass'), 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, b);   /* vert: سهما الأعلى والأسفل لحركة رأسية */
    const go = (e, k = 1) => { if (e) e.stopPropagation(); for (let i = 0; i < k; i++) step(s); SFX.tick(); }; b.onclick = e => go(e); b.onpointerdown = e => e.stopPropagation();
    b.onkeydown = e => { if (isActKey(e)) { e.preventDefault(); go(); } else if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); go(null, 10); } }; return b; }); }   /* بلوحة المفاتيح: مفتاح الفعل خطوة، والسهم الأعلى عشر خطوات (سنتيمتر في الرسم) فلا يحتاج الرسم إلى عشرات الضغطات */
async function rulDone(clean) { const d = doneBtn(); let fin = false; await gate(new Promise(res => d.b.onclick = () => { if (fin) return; fin = true; AUTO_CLEAR(); hush(); clean(); d.bar.remove(); res(); })); }
const rulDoneBtn = () => document.querySelector('#stage .pick.done');

/* ================= ④ ضع الصفر عند بداية الشيء (C182، إنتاج): len طول الشيء (سم)، start: edge (حافة المسطرة عند البداية) أو one (الواحد عند البداية) ================= */
ITEM.rulerAlign = {
  make(spec) { return { ...spec, start: spec.start || 'edge', tag: 'ruler-align' }; },
  async ask(item, mode, tries) { const svg = newStage(250, { oasis: false, ground: 0 }), k = 24, xs = 64, y = 112, lead = 16; rulThingAt(svg, item.thing || 'pencil', xs, xs + item.len * k, y - 2, item.color);
    el('line', { x1: xs, y1: 70, x2: xs, y2: y + RUL_H + 8, stroke: css('--compass'), 'stroke-width': 1.8, 'stroke-dasharray': '4 4', 'pointer-events': 'none' }, svg);
    const R = rulerAt(svg, { x: xs, y, pxcm: k, from: 0, to: 10, mm: false, lead }); let off = item.start === 'one' ? 1 : -lead / k;   /* off: العدد الذي تحت بداية الشيء (0 = محاذاة الصفر) */
    const set = v => { off = Math.max(-1.4, Math.min(2.2, Math.round(v * 10) / 10)); if (Math.abs(off) < .05) off = 0; R.move(-off * k); R.g.setAttribute('data-off', off); /*T*/window.__rulOff = off;/*/T*/ }; set(off);
    if (tries >= 3) R.mark(0);   /* الحلّ المشترك: الصفر ملوّن، والتحريك للطفل */
    say(...lineOf(tries >= 3 ? 'gen.rul.together.align' : item.q), { free: true }); let grab = null;
    const input = fingerInput(svg, { map: e => { const q = svgPoint(svg, e); return [q.x, q.y]; }, down(q) { if (q[1] < y - 30 || q[1] > y + RUL_H + 26) return false; grab = q[0] + off * k; }, move(q) { set((grab - q[0]) / k); }, up() {} });
    /*T*/window.__rulAt = () => { const m = svg.getScreenCTM(); return { x: m.a * 200 + m.e, y: m.d * (y + 24) + m.f, k: m.a * k }; };/*/T*/
    const nudge = rulNudges(svg, 208, s => set(off - s * .1)); AUTO({ kind: 'rulAlign', ok: () => { set(0); rulDoneBtn().click(); }, wrong: () => { set(item.start === 'one' ? 1 : -lead / k); rulDoneBtn().click(); } });
    await rulDone(() => { input.off(); nudge.forEach(b => b.remove()); }); return { ans: off, ctx: { svg, R, set, k } }; },
  judge(item, off) { return Math.abs(off) <= .1 ? { ok: true } : { ok: false, err: off < -.3 ? 'alignEdge' : Math.abs(off - 1) <= .15 ? 'alignOne' : 'alignOff' }; },
  onOk(item, r) { SFX.good(); r.ctx.set(0); r.ctx.R.mark(0); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { r.ctx.R.mark(0); await sleep(900); }, async together() {},
  async reveal(item, r) { const a = r.ans; await symTween(700, t => r.ctx.set(a * (1 - t))); r.ctx.R.mark(0); await S('gen.rul.reveal.align'); },
  praise: () => 'praiseMeasure', twin(item) { return item.twin || null; },
};

/* ================= ⑤ اقرأ بالسنتيمتر والمليمتر (C181، C182): شيء من الصفر إلى cm سم وmm ملم، وعدسة على نهايته.
   ask: mm (كم مليمتراً بعد آخر سنتيمتر كامل)، cm (كم سنتيمتراً كاملاً)، near (لأقرب سنتيمتر) ================= */
ITEM.rulerMm = { ...numItem,
  make(spec) { const { cm, mm } = spec, ask = spec.ask || 'mm', want = ask === 'mm' ? mm : ask === 'cm' ? cm : (mm < 5 ? cm : cm + 1);
    return { ...spec, ask, want, nums: ask === 'mm' ? rulNear(mm, cm, mm + 1, mm - 1) : ask === 'cm' ? rulNear(cm, cm + 1, mm, cm - 1) : rulNear(want, mm < 5 ? cm + 1 : cm, cm - 1), tag: 'ruler-' + ask }; },
  draw(item, svg) { const v = item.cm + item.mm / 10, R = rulerAt(svg, { x: 30, y: 196, pxcm: 30, from: 0, to: 10, mm: false }); rulThingAt(svg, item.thing || 'pencil', R.X(0), R.X(v), 194, item.color); const Ln = rulerLens(svg, R, v, { y: 24, thing: item.thing || 'pencil', color: item.color }); return { R, Ln, v }; },
  async ask(item, mode, tries) { const svg = newStage(260, { oasis: false, ground: 0 }), D = this.draw(item, svg); let hops = null;
    if (tries >= 3) { await S('gen.rul.together.mmRead'); hops = this.hops(item, svg, D); } else await S(item.q);
    const np = numberPick(shuffle(item.nums), item.want, { digits: true, west: true }); return { ans: await np.p, ctx: { svg, np, D, hops } }; },
  hops(item, svg, D) { const m = helpG(svg), Z = D.Ln.Z; for (let i = 0; i < item.mm; i++) { const x1 = Z.X(item.cm + i / 10), x2 = Z.X(item.cm + (i + 1) / 10); el('path', { d: `M${x1} ${D.Ln.yr - 16} Q${(x1 + x2) / 2} ${D.Ln.yr - 30} ${x2} ${D.Ln.yr - 16}`, fill: 'none', stroke: css('--compass'), 'stroke-width': 2.4 }, m); } Z.mark(item.cm); return m; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: item.ask === 'mm' && k === item.cm ? 'mmAsCm' : item.ask === 'near' ? 'nearWrong' : 'mmReadWrong' }; },
  async hint2(item, r) { const m = this.hops(item, r.ctx.svg, r.ctx.D); await sleep(1300); m.remove(); }, async together() {},
  async reveal(item, r) { if (!r.ctx.hops) this.hops(item, r.ctx.svg, r.ctx.D); await sayLen(item.cm, 'cm', { noGap: true }); await S('gen.rul.and', { noGap: true, append: true }); await sayLen(item.mm, 'mm'); if (item.ask === 'near') { await S('gen.rul.reveal.near'); await sayLen(item.want); } },
  praise: () => 'praiseMeasure', twin(item) { return item.twin || null; },
};

/* ================= ⑥ ارسم خطاً بطول معلوم (C184، إنتاج): cm ومعه mm (0). يسحب الطفل طرف الخط على المسطرة، وزرّان يحرّكانه مليمتراً مليمتراً ================= */
ITEM.drawLen = {
  make(spec) { return { ...spec, mm: spec.mm || 0, want: spec.cm * 10 + (spec.mm || 0), tag: 'draw-len' + (spec.mm ? '-mm' : '') }; },
  async ask(item, mode, tries) { const svg = newStage(300, { oasis: false, ground: 0 }), y = 152, R = rulerAt(svg, { x: 30, y, pxcm: 30, from: 0, to: 10, mm: false }); let v = item.start ?? 10, Ln = null;
    const line = el('line', { x1: R.X(0), y1: y - 10, x2: R.X(v / 10), y2: y - 10, stroke: RUL.ink, 'stroke-width': 4, 'stroke-linecap': 'round' }, svg), tip = el('g', { 'pointer-events': 'none' }, svg);
    el('circle', { r: 13, fill: css('--compass'), stroke: '#fff', 'stroke-width': 3 }, tip); el('path', { d: 'M-5 0 h10 M0 -5 v10', stroke: '#fff', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, tip);
    el('circle', { cx: R.X(0), cy: y - 10, r: 4.5, fill: RUL.ink }, svg);
    if (tries >= 3) { R.mark(item.cm); if (item.mm) { const g = helpG(svg); el('line', { x1: R.X(item.want / 10), y1: y - 30, x2: R.X(item.want / 10), y2: y, stroke: RUL.hl, 'stroke-width': 2, 'stroke-dasharray': '4 3' }, g); } }   /* الحلّ المشترك: موضع النهاية معلَّم، والسحب للطفل */
    const set = n => { v = Math.max(5, Math.min(100, Math.round(n))); const x = R.X(v / 10); line.setAttribute('x2', x); tip.setAttribute('transform', `translate(${x} ${y - 10})`); if (Ln) Ln.remove(); Ln = rulerLens(svg, R, v / 10, { y: 8, cx: 180 }); el('line', { x1: Ln.Z.X(v / 10 - 3), y1: Ln.yr - 8, x2: Ln.Z.X(v / 10), y2: Ln.yr - 8, stroke: RUL.ink, 'stroke-width': 5, 'stroke-linecap': 'round', 'clip-path': Ln.g.children[2].getAttribute('clip-path') }, Ln.g); /*T*/window.__drawV = v;/*/T*/ }; set(v);
    /* الطول المطلوب مكتوب على المسرح ومنطوق: «ارسم خطاً طوله» ثم العدد ووحدته (والسؤال يُعاد بزرّ الإعادة) */
    { const g = el('g', { 'pointer-events': 'none' }, svg); const t = el('text', { x: 180, y: 262, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 700, fill: RUL.ink }, g); t.textContent = item.cm + ' ' + labelText('rulCm') + (item.mm ? '  ' + item.mm + ' ' + labelText('rulMm') : ''); }
    let done = false; const askQ = async () => { await S(tries >= 3 ? 'gen.rul.together.draw' : (item.q || 'gen.rul.drawQ'), { noGap: true }); await sayLen(item.cm, 'cm', item.mm ? { noGap: true } : {}); if (item.mm) { await S('gen.rul.and', { noGap: true, append: true }); await sayLen(item.mm, 'mm'); } };
    askQ(); REPLAY_HOOK = () => askQ(); REPLAY_HOOK.live = () => !done && svg.isConnected;
    const input = fingerInput(svg, { map: e => { const q = svgPoint(svg, e); return [q.x, q.y]; }, down(q) { if (q[1] < y - 50 || q[1] > y + RUL_H + 6) return false; set((q[0] - R.X(0)) / 3); }, move(q) { set((q[0] - R.X(0)) / 3); }, up() {} });
    /*T*/window.__drawWant = item.want; window.__drawAt = n => { const m = svg.getScreenCTM(); return { x: m.a * R.X(n / 10) + m.e, y: m.d * (y - 10) + m.f }; };/*/T*/
    const nudge = rulNudges(svg, 254, s => set(v + s), ['rulShorter', 'rulLonger']); AUTO({ kind: 'rulDraw', ok: () => { set(item.want); rulDoneBtn().click(); }, wrong: () => { set(item.mm ? item.cm * 10 : item.want + 10 > 100 ? item.want - 10 : item.want + 10); rulDoneBtn().click(); } });
    await rulDone(() => { done = true; REPLAY_HOOK = null; input.off(); nudge.forEach(b => b.remove()); }); return { ans: v, ctx: { svg, R, set } }; },
  judge(item, v) { return Math.abs(v - item.want) <= 1 ? { ok: true } : { ok: false, err: item.mm && Math.abs(v - item.cm * 10) <= 1 ? 'drawNoMm' : 'drawOff' }; },
  onOk(item, r) { SFX.good(); r.ctx.set(item.want); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { r.ctx.R.mark(item.cm); await sleep(900); }, async together() {},
  async reveal(item, r) { const a = r.ans; await symTween(700, t => r.ctx.set(a + (item.want - a) * t)); r.ctx.set(item.want); await sayLen(item.cm, 'cm', item.mm ? { noGap: true } : {}); if (item.mm) { await S('gen.rul.and', { noGap: true, append: true }); await sayLen(item.mm, 'mm'); } },
  praise: () => 'praiseMeasure', twin(item) { return item.twin || null; },
};

/* ---------- الخيط على المنحني: موجة طول قوسها len سم وامتدادها الأفقي span سم؛ fold(t) يفردها (t = 1 مستقيمة على المسطرة) ---------- */
function stringAt(svg, R, len, span, yc) { const p = el('path', { fill: 'none', stroke: '#8a6a4a', 'stroke-width': 4.5, 'stroke-linecap': 'round' }, svg), L = len * R.pxcm, x0 = R.X(0), N = 3;
  const path = (W, A) => { let d = `M${x0} ${yc}`; for (let i = 0; i < N; i++) { const w = W / N, xa = x0 + i * w, s = i % 2 ? 1 : -1; d += ` C${xa + w * .35} ${yc + s * A} ${xa + w * .65} ${yc + s * A} ${xa + w} ${yc}`; } return d; };
  const ampFor = W => { let lo = 0, hi = 140; for (let i = 0; i < 16; i++) { const A = (lo + hi) / 2; p.setAttribute('d', path(W, A)); if (p.getTotalLength() < L) lo = A; else hi = A; } return (lo + hi) / 2; };
  const W0 = span * R.pxcm, A0 = ampFor(W0); p.setAttribute('d', path(W0, A0));
  return { p, W0, async fold(ms = 1200) { const y1 = R.y - 5; await symTween(ms, t => { const W = W0 + (L - W0) * t, A = t >= 1 ? 0 : ampFor(W); p.setAttribute('d', path(W, A)); p.setAttribute('transform', `translate(0 ${(y1 - yc) * t})`); }); },
    back() { p.setAttribute('d', path(W0, A0)); p.removeAttribute('transform'); } }; }
/* ================= ⑦ طول الطريق المنحني بالخيط (C185): len طول الخيط، span المسافة المستقيمة بين طرفيه ================= */
ITEM.stringRead = { ...numItem,
  make(spec) { return { ...spec, want: spec.len, nums: rulNear(spec.len, spec.span, spec.len + 1), tag: 'string-read' }; },
  async ask(item, mode, tries) { const svg = newStage(250, { oasis: false, ground: 0 }), R = rulerAt(svg, { x: 30, y: 176, pxcm: 30, from: 0, to: 10, mm: false }), St = stringAt(svg, R, item.len, item.span, 84);
    const hot = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg); el('rect', { x: 26, y: 30, width: St.W0 + 8, height: 108, rx: 12, fill: '#fff', opacity: .01 }, hot);
    say(...lineOf(tries >= 3 ? 'gen.rul.together.string' : item.q), { free: true }); await tapOne([{ g: hot, k: 's', label: labelText('rulString') }], { ok: 's', pad: 60 }); hush(); hot.remove(); await St.fold(tries >= 3 ? 1800 : 1100); let hops = null;
    if (tries >= 3) hops = await rulerHops(svg, R, 0, item.len, { silent: true, y: R.y - 10 });
    const np = numberPick(shuffle(item.nums), item.want, { digits: true, west: true }); return { ans: await np.p, ctx: { svg, np, R, St, hops } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: k === item.span ? 'curveStraight' : 'rulerWrong' }; },
  async hint2(item, r) { r.ctx.St.back(); await sleep(500); await r.ctx.St.fold(1900); await sleep(600); }, async together() {},   /* المستوى 2: الفرد ببطء، بلا تلوين عدد الجواب */
  async reveal(item, r) { r.ctx.R.mark(item.len); await sayLen(item.want); },
  praise: () => 'praiseMeasure', twin(item) { return item.twin || null; },
};

/* ---------- مشاهد الدرسين 2 و3 ---------- */
/* فوضى وضعت حافة المسطرة (أو الواحد) عند بداية القلم؛ يحرّك الطفل المسطرة حتى الصفر. c: len، start، lines: [قول فوضى، الدعوة، بعد] */
SCENES.alignShow = async c => { const [l1, l2, l3] = c.lines, it = ITEM.rulerAlign.make({ len: c.len, start: c.start, thing: c.thing, q: l2 }); let first = true;
  while (true) { const p = ITEM.rulerAlign.ask(it, 'explore', first ? 0 : 1); if (first) { const fz = chaosAt($('#stage svg'), 326, 36, .32); chaosGiggle(fz); hush(); await S(l1); S(l2, { free: true }); } const r = await p; const ok = ITEM.rulerAlign.judge(it, r.ans).ok; logAttempt({ scene: c.s || 'hook', tag: 'alignShow', ok, firstTry: first }); first = false; if (ok) { ITEM.rulerAlign.onOk(it, r); break; } SFX.soft(); await S('gen.rul.alignAgain'); }
  await sayLen(c.len); await S(l3); };
/* القراءة بالمليمتر: يلمس الطفل نهاية الشيء فتظهر العدسة، ثم تُعدّ المليمترات قفزاً. c: cm، mm، thing، lines: [دعوة اللمس، بعد العدّ، أقرب سنتيمتر] */
SCENES.mmRead = async c => { const svg = newStage(260, { oasis: false, ground: 0 }), v = c.cm + c.mm / 10, [l1, l2, l3] = c.lines, R = rulerAt(svg, { x: 30, y: 196, pxcm: 30, from: 0, to: 10, mm: false }), th = rulThingAt(svg, c.thing || 'pencil', R.X(0), R.X(v), 194);
  const hot = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg); el('circle', { cx: R.X(v), cy: 188, r: 26, fill: css('--compass'), opacity: .2, stroke: css('--compass'), 'stroke-width': 2.5 }, hot);
  await answerWhile(l1, () => tapOne([{ g: hot, k: 'h', label: labelText('rulEnd') }], { ok: 'h', pad: 60, pulse: true })); hot.remove(); const Ln = rulerLens(svg, R, v, { y: 24, thing: c.thing || 'pencil' }), Z = Ln.Z, m = helpG(svg); SFX.pop(); await sleep(400);
  R.mark(c.cm); Z.mark(c.cm); await sayLen(c.cm); for (let i = 0; i < c.mm; i++) { const x1 = Z.X(c.cm + i / 10), x2 = Z.X(c.cm + (i + 1) / 10); el('path', { d: `M${x1} ${Ln.yr - 16} Q${(x1 + x2) / 2} ${Ln.yr - 30} ${x2} ${Ln.yr - 16}`, fill: 'none', stroke: css('--compass'), 'stroke-width': 2.4 }, m); SFX.tick(); await S(numw(i + 1), { noGap: true, num: true }); }
  logAttempt({ scene: c.s || 'explore', tag: 'mmRead', ok: true }); await S(l2); await sleep(300); await S(l3); await sayLen(c.mm < 5 ? c.cm : c.cm + 1); };
/* بطاقة القياس: ثلاث خطوات تُعرض واحدة واحدة. c: len، lines: [الصفر عند البداية، العدد عند النهاية، العدد والوحدة معاً] */
SCENES.cardSteps = async c => { const svg = newStage(250, { oasis: false, ground: 0 }), k = 24, xs = 64, y = 112, [l1, l2, l3] = c.lines; rulThingAt(svg, c.thing || 'crayon', xs, xs + c.len * k, y - 2);
  const R = rulerAt(svg, { x: xs, y, pxcm: k, from: 0, to: 10, mm: false, lead: 16 }); R.move(16); await sleep(500); await symTween(700, t => R.move(16 * (1 - t))); R.mark(0); SFX.tick(); await S(l1);
  R.mark(c.len); el('line', { x1: xs + c.len * k, y1: 76, x2: xs + c.len * k, y2: y, stroke: RUL.hl, 'stroke-width': 2, 'stroke-dasharray': '4 3' }, svg); SFX.tick(); await S(l2);
  const b = el('g', {}, svg); el('rect', { x: 120, y: 186, width: 120, height: 46, rx: 14, fill: '#fffdf6', stroke: RUL.hl, 'stroke-width': 3 }, b); const t = el('text', { x: 180, y: 217, 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 700, fill: RUL.ink }, b); t.textContent = c.len + ' ' + labelText('rulCm'); SFX.good(); await sayLen(c.len); await S(l3); };
/* الرسم بطول معلوم مع فرجار: يسحب الطفل طرف الخط حتى الطول المطلوب. c: cm، mm، lines: [الدعوة، بعد] */
SCENES.drawShow = async c => { const [l1, l2] = c.lines, it = ITEM.drawLen.make({ cm: c.cm, mm: c.mm, q: l1, start: c.start }); let n = 0;
  while (true) { const r = await ITEM.drawLen.ask(it, 'explore', n >= 2 ? 3 : 0), ok = ITEM.drawLen.judge(it, r.ans).ok; logAttempt({ scene: c.s || 'explore', tag: 'drawShow', ok, firstTry: n === 0 }); n++; if (ok) { ITEM.drawLen.onOk(it, r); break; } SFX.soft(); await S('gen.rul.drawAgain'); }
  await sayLen(c.cm, 'cm', c.mm ? { noGap: true } : {}); if (c.mm) { await S('gen.rul.and', { noGap: true, append: true }); await sayLen(c.mm, 'mm'); } await S(l2); };
/* الخيط: طريق منحنٍ، يلمسه الطفل فيُفرد على المسطرة. c: len، span، lines: [الدعوة، بعد] */
SCENES.stringShow = async c => { const svg = newStage(250, { oasis: false, ground: 0 }), R = rulerAt(svg, { x: 30, y: 176, pxcm: 30, from: 0, to: 10, mm: false }), St = stringAt(svg, R, c.len, c.span, 84), [l1, l2] = c.lines;
  const hot = el('g', { role: 'button', tabindex: 0, style: 'cursor:pointer' }, svg); el('rect', { x: 26, y: 30, width: St.W0 + 8, height: 108, rx: 12, fill: '#fff', opacity: .01 }, hot);
  await answerWhile(l1, () => tapOne([{ g: hot, k: 's', label: labelText('rulString') }], { ok: 's', pad: 60 })); hot.remove(); await St.fold(1500); R.mark(c.len); logAttempt({ scene: c.s || 'explore', tag: 'stringShow', ok: true }); await sayLen(c.len); await S(l2); };
SCENES.recallAlign = async c => { const svg = newStage(250, { oasis: false, ground: 0 }), k = 24, xs = 64, y = 112; rulThingAt(svg, 'crayon', xs, xs + (c.len || 5) * k, y - 2); const R = rulerAt(svg, { x: xs, y, pxcm: k, from: 0, to: 10, mm: false, lead: 16 }); R.move(16); await sleep(400); await symTween(700, t => R.move(16 * (1 - t))); R.mark(0); await S(c.lines); };
SCENES.recallMm = async c => { const svg = newStage(260, { oasis: false, ground: 0 }), it = ITEM.rulerMm.make({ cm: c.cm || 3, mm: c.mm || 6, thing: 'crayon' }), D = ITEM.rulerMm.draw(it, svg); await sleep(300); ITEM.rulerMm.hops(it, svg, D); await S(c.lines); };
SCENES.recallDraw = async c => { const svg = newStage(250, { oasis: false, ground: 0 }), y = 150, R = rulerAt(svg, { x: 30, y, pxcm: 30, from: 0, to: 10, mm: false }), line = el('line', { x1: R.X(0), y1: y - 10, x2: R.X(0), y2: y - 10, stroke: RUL.ink, 'stroke-width': 4, 'stroke-linecap': 'round' }, svg); R.mark(0); await sleep(300); await symTween(900, t => line.setAttribute('x2', R.X((c.cm || 6) * t))); R.mark(c.cm || 6); await S(c.lines); };
SCENES.recallString = async c => { const svg = newStage(250, { oasis: false, ground: 0 }), R = rulerAt(svg, { x: 30, y: 176, pxcm: 30, from: 0, to: 10, mm: false }), St = stringAt(svg, R, c.len || 7, c.span || 5, 84); await sleep(400); await St.fold(1200); R.mark(c.len || 7); await S(c.lines); };
WRAP_ART.rulerCard = svg => { const g = el('g', {}, svg); el('rect', { x: 96, y: 60, width: 168, height: 132, rx: 16, fill: '#fffdf6', stroke: css('--compass'), 'stroke-width': 4 }, g); rulerAt(g, { x: 116, y: 132, pxcm: 20, from: 0, to: 6, mm: false, lead: 6 }); rulThingAt(g, 'pencil', 116, 216, 130); anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200, fill: 'both' }); palmAt(svg, 322, 250, .8); palmAt(svg, 40, 250, .9); };
WRAP_ART.rulerRoad = svg => { const R = rulerAt(svg, { x: 60, y: 176, pxcm: 30, from: 0, to: 8, mm: false }); const St = stringAt(svg, R, 7, 5.4, 110); anim(R.g, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200, fill: 'both' }); palmAt(svg, 322, 250, .8); palmAt(svg, 40, 250, .9); };
