/* =====================================================================
   S1-U6 «نصفان متطابقان» (C021، C022، C023، F001، N015): الطيّ، وخط التماثل، والمرآة، وإكمال النصف على الشبكة.
   · كل شكل يُرسم في مربع من −50 إلى 50 حول (0،0). lines: زوايا خطوط تماثله (90 رأسي، 0 أفقي)، أو 'all' للدائرة. near: تماثله تقريبي (الطبيعة).
   · الطيّ: الشكل مرسوم مرتين، كلٌّ مقصوص إلى جانب من خط الطيّ؛ والنصف المتحرّك ينعكس على الخط حتى يقع على أخيه، ويُرى شفّافاً:
     ما انطبق غاب تحته، وما لم ينطبق ظهر. فالحكم للعين لا للجملة (الطيّ هو الحكم، خطأ الوحدة الشائع).
   · سلّم المساعدة (D240): سؤال، ثم طيّة تُرى ثم تُفتح، ثم الحلّ المشترك (الأشكال مطوية والاختيار للطفل).
   ===================================================================== */
const SYMC = { coral: '#ee7f6a', teal: '#3fa796', amber: '#f2b33d', violet: '#8e6bbf', leaf: '#4f9a6a', blue: '#3d7cc0', wood: '#b9794e', cream: '#f6e7c8', ink: '#33454c' };
const symP = (g, d, fill, extra) => el('path', { d, fill, stroke: '#fff', 'stroke-width': 2.5, 'stroke-linejoin': 'round', ...(extra || {}) }, g);
const SYM = {
  heart: { lines: [90], draw: g => symP(g, 'M0 38 C-52 4 -46 -40 -22 -40 C-8 -40 0 -30 0 -22 C0 -30 8 -40 22 -40 C46 -40 52 4 0 38 Z', SYMC.coral) },
  circle: { lines: 'all', draw: g => el('circle', { r: 40, fill: css(IDC.circle), stroke: '#fff', 'stroke-width': 2.5 }, g) },
  square: { lines: [90, 0, 45, 135], draw: g => el('rect', { x: -36, y: -36, width: 72, height: 72, fill: css(IDC.square), stroke: '#fff', 'stroke-width': 2.5 }, g) },
  rect: { lines: [90, 0], draw: g => el('rect', { x: -46, y: -28, width: 92, height: 56, fill: css(IDC.rect), stroke: '#fff', 'stroke-width': 2.5 }, g) },
  tri: { lines: [90], draw: g => symP(g, 'M0 -40 L42 34 L-42 34 Z', css(IDC.triangle)) },
  scalene: { lines: [], draw: g => symP(g, 'M-44 34 L46 34 L-18 -40 Z', css(IDC.triangle)) },
  star: { lines: [90], draw: g => symP(g, 'M0 -44 L11 -14 L43 -14 L17 5 L27 36 L0 17 L-27 36 L-17 5 L-43 -14 L-11 -14 Z', SYMC.amber) },
  blob: { lines: [], draw: g => symP(g, 'M-38 -8 C-40 -40 -4 -44 6 -26 C22 -42 46 -26 38 -2 C52 18 26 42 4 30 C-10 46 -44 30 -38 -8 Z', SYMC.blue) },
  butterfly: { lines: [90], draw: g => { for (const s of [1, -1]) { symP(g, `M${s * 3} -6 C${s * 14} -44 ${s * 48} -42 ${s * 44} -10 C${s * 42} 2 ${s * 20} 4 ${s * 3} 2 Z`, SYMC.violet); symP(g, `M${s * 3} 4 C${s * 22} 6 ${s * 40} 16 ${s * 32} 34 C${s * 22} 44 ${s * 8} 30 ${s * 3} 12 Z`, SYMC.coral); el('circle', { cx: s * 28, cy: -20, r: 6, fill: SYMC.amber }, g); }
      el('rect', { x: -3.5, y: -26, width: 7, height: 56, rx: 3.5, fill: SYMC.ink }, g); } },
  tree: { lines: [90], draw: g => { el('rect', { x: -7, y: 14, width: 14, height: 28, fill: SYMC.wood, stroke: '#fff', 'stroke-width': 2 }, g); symP(g, 'M0 -44 L34 18 L-34 18 Z', SYMC.leaf); } },
  house: { lines: [90], draw: g => { el('rect', { x: -32, y: -6, width: 64, height: 46, fill: SYMC.cream, stroke: '#fff', 'stroke-width': 2.5 }, g); symP(g, 'M0 -42 L42 -6 L-42 -6 Z', SYMC.coral); el('rect', { x: -8, y: 14, width: 16, height: 26, fill: SYMC.wood }, g); } },
  flag: { lines: [], draw: g => { el('rect', { x: -30, y: -42, width: 6, height: 84, rx: 3, fill: SYMC.wood }, g); symP(g, 'M-24 -40 L38 -22 L-24 -4 Z', SYMC.teal); } },
  cup: { lines: [], draw: g => { symP(g, 'M-34 -26 H22 L16 34 H-28 Z', SYMC.teal); el('path', { d: 'M20 -14 C46 -14 46 18 18 16', fill: 'none', stroke: SYMC.teal, 'stroke-width': 8, 'stroke-linecap': 'round' }, g); } },
  key: { lines: [], draw: g => { el('circle', { cx: -24, cy: 0, r: 17, fill: 'none', stroke: SYMC.amber, 'stroke-width': 9 }, g); el('path', { d: 'M-8 0 H42 M24 0 V16 M36 0 V12', fill: 'none', stroke: SYMC.amber, 'stroke-width': 8, 'stroke-linecap': 'round' }, g); } },
  carSide: { lines: [], draw: g => { symP(g, 'M-46 16 V0 Q-44 -6 -30 -8 L-18 -26 H14 L30 -8 Q46 -6 46 4 V16 Z', SYMC.coral); symP(g, 'M-13 -21 H10 L22 -8 H-22 Z', '#cfe9f2'); for (const x of [-26, 26]) { el('circle', { cx: x, cy: 18, r: 11, fill: SYMC.ink }, g); el('circle', { cx: x, cy: 18, r: 4.5, fill: '#fff' }, g); } el('rect', { x: 38, y: -2, width: 8, height: 6, rx: 2, fill: SYMC.amber }, g); } },
  carFront: { lines: [90], draw: g => { symP(g, 'M-40 22 V-2 Q-40 -8 -32 -10 L-24 -32 H24 L32 -10 Q40 -8 40 -2 V22 Z', SYMC.coral); symP(g, 'M-20 -27 H20 L26 -11 H-26 Z', '#cfe9f2'); for (const s of [1, -1]) { el('circle', { cx: s * 27, cy: 4, r: 6, fill: SYMC.amber, stroke: '#fff', 'stroke-width': 1.5 }, g); el('rect', { x: s * 30 - 7, y: 20, width: 14, height: 16, rx: 3, fill: SYMC.ink }, g); } el('rect', { x: -14, y: 6, width: 28, height: 8, rx: 2, fill: SYMC.ink }, g); } },
  face: { lines: [90], draw: g => { el('circle', { r: 38, fill: '#f2c79c', stroke: '#fff', 'stroke-width': 2.5 }, g); for (const s of [1, -1]) { el('circle', { cx: s * 14, cy: -8, r: 4.5, fill: SYMC.ink }, g); el('path', { d: `M${s * 7} -20 Q${s * 14} -25 ${s * 21} -20`, fill: 'none', stroke: SYMC.ink, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g); } el('path', { d: 'M-14 12 Q0 24 14 12', fill: 'none', stroke: SYMC.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }, g); el('path', { d: 'M-36 -12 Q-30 -44 0 -42 Q30 -44 36 -12 Q20 -30 0 -28 Q-20 -30 -36 -12 Z', fill: '#6b4a35' }, g); } },
  crown: { lines: [90], draw: g => symP(g, 'M-40 34 V-22 L-20 4 L0 -36 L20 4 L40 -22 V34 Z', SYMC.amber) },
  bell: { lines: [90], draw: g => { symP(g, 'M0 -40 C22 -40 26 -8 28 12 L38 26 H-38 L-28 12 C-26 -8 -22 -40 0 -40 Z', SYMC.amber); el('circle', { cy: 34, r: 7, fill: SYMC.wood, stroke: '#fff', 'stroke-width': 2 }, g); } },
  rocket: { lines: [90], draw: g => { symP(g, 'M0 -44 C18 -26 18 6 14 26 H-14 C-18 6 -18 -26 0 -44 Z', '#e9eef0'); for (const s of [1, -1]) symP(g, `M${s * 14} 6 L${s * 32} 34 L${s * 14} 26 Z`, SYMC.coral); el('circle', { cy: -10, r: 8, fill: SYMC.blue, stroke: '#fff', 'stroke-width': 2 }, g); } },
  arrow: { lines: [90], draw: g => symP(g, 'M0 -44 L34 -6 H14 V40 H-14 V-6 H-34 Z', SYMC.teal) },
  drop: { lines: [90], draw: g => symP(g, 'M0 -44 C12 -18 32 0 32 16 C32 34 18 44 0 44 C-18 44 -32 34 -32 16 C-32 0 -12 -18 0 -44 Z', SYMC.blue) },
  kite: { lines: [90], draw: g => { symP(g, 'M0 -44 L30 -8 L0 42 L-30 -8 Z', SYMC.amber); el('path', { d: 'M-30 -8 H30', stroke: '#fff', 'stroke-width': 2 }, g); } },
  /* ورقة شجر من الطبيعة: نصفاها متشابهان غير متطابقين (near) */
  leaf: { lines: [], near: true, draw: g => { symP(g, 'M0 -44 C34 -26 30 16 0 44 C-22 22 -30 -6 -22 -22 C-16 -32 -8 -40 0 -44 Z', SYMC.leaf); el('path', { d: 'M0 -40 V42 M0 -14 L14 -24 M0 4 L16 -6 M0 -8 L-12 -18 M0 12 L-13 4', fill: 'none', stroke: '#fff', 'stroke-width': 2, 'stroke-linecap': 'round', opacity: .8 }, g); } },
  bread: { lines: [90, 0], draw: g => { el('ellipse', { rx: 46, ry: 30, fill: '#d9a05b', stroke: '#fff', 'stroke-width': 2.5 }, g); el('ellipse', { rx: 34, ry: 19, fill: '#e8bd80' }, g); } },
  orange: { lines: 'all', draw: g => { el('circle', { r: 38, fill: '#f29a3d', stroke: '#fff', 'stroke-width': 2.5 }, g); el('circle', { r: 28, fill: '#f8b866' }, g); } },
};
const symHas = (kind, ang, rot = 0) => { const L = SYM[kind].lines; return L === 'all' || L.some(a => ((a - rot - ang) % 180 + 180) % 180 === 0); };   /* rotate(rot) في SVG مع عقارب الساعة: الخط a يصير a − rot */
let SYM_ID = 0;
/* تدرّج يحترم السرعة: يدعو fn بقيمٍ من 0 إلى 1 */
async function symTween(ms, fn) { const N = 14; for (let i = 0; i <= N; i++) { fn(i / N); if (i < N) await sleep(ms / N); } }
function symAt(parent, kind, x, y, k = 1, rot = 0) { const g = el('g', { transform: `translate(${x} ${y}) scale(${k}) rotate(${rot})`, 'data-sym': kind }, parent); SYM[kind].draw(g); return g; }
/* شكل قابل للطيّ عند خط يمرّ بمركزه بزاوية ang (90 رأسي). يعيد { g, fold(), open(), match، line } */
function symFoldAt(parent, kind, x, y, k = 1, ang = 90, rot = 0, opt = {}) {
  const id = 'symc' + (++SYM_ID), g = el('g', { transform: `translate(${x} ${y}) scale(${k})`, 'data-fold': kind }, parent), phi = 90 - ang;   /* دوران SVG (مع عقارب الساعة) الذي يحمل الرأسي إلى خط زاويته ang */
  for (const [s, x0] of [['a', 0], ['b', -200]]) { const cp = el('clipPath', { id: id + s }, g); el('rect', { x: x0, y: -200, width: 200, height: 400, transform: `rotate(${phi})` }, cp); }
  const A = el('g', { 'clip-path': `url(#${id}a)` }, g), Bw = el('g', {}, g), B = el('g', { 'clip-path': `url(#${id}b)` }, Bw);
  for (const h of [A, B]) SYM[kind].draw(el('g', { transform: `rotate(${rot})` }, h));
  const line = el('line', { x1: -62 * Math.cos(ang * Math.PI / 180), y1: 62 * Math.sin(ang * Math.PI / 180), x2: 62 * Math.cos(ang * Math.PI / 180), y2: -62 * Math.sin(ang * Math.PI / 180), stroke: opt.lineColor || css('--compass'), 'stroke-width': 3 / k + 1.4, 'stroke-dasharray': '7 5', 'stroke-linecap': 'round', 'pointer-events': 'none', opacity: opt.line === false ? 0 : 1 }, g);
  const set = s => Bw.setAttribute('transform', `rotate(${phi}) scale(${s} 1) rotate(${-phi})`);   /* انعكاس على الخط: s من 1 إلى −1 */
  let folded = false;
  return { g, line, kind, match: symHas(kind, ang, rot),
    async fold(ms = 700) { if (folded) return; folded = true; SFX.tick(); await symTween(ms, t => { set(1 - 2 * t); Bw.setAttribute('opacity', 1 - .4 * t); }); },
    async open(ms = 500) { if (!folded) return; folded = false; await symTween(ms, t => { set(-1 + 2 * t); Bw.setAttribute('opacity', .6 + .4 * t); }); },
    flat() { folded = true; set(-1); Bw.setAttribute('opacity', .6); } };
}
const symYesNo = want => choosePick([['yes', labelText('symYes')], ['no', labelText('symNo')]], want);

/* ================= ① اطوِ: هل ينطبق النصفان؟ (C021): shape، ang زاوية خط الطيّ، rot دوران الشكل ================= */
ITEM.foldJudge = {
  make(spec) { const ang = spec.ang ?? 90; return { ...spec, ang, want: symHas(spec.sym, ang, spec.rot || 0) ? 'yes' : 'no', tag: 'fold-judge' }; },
  async ask(item, mode, tries) { const svg = newStage(250, { oasis: false, ground: 0 }), F = symFoldAt(svg, item.sym, 180, 124, 1.9, item.ang, item.rot || 0);
    say(...lineOf(tries >= 3 ? 'gen.sym.together.fold' : item.q), { free: true });
    await tapOne([{ g: F.g, k: 'f', label: labelText('symFold') }], { ok: 'f', pad: 64 }); hush(); await F.fold(tries >= 3 ? 1400 : 700);
    const k = await symYesNo(item.want); return { ans: k, ctx: { svg, F } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'foldJudgeWrong' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { await r.ctx.F.open(); await sleep(300); await r.ctx.F.fold(1500); await sleep(500); }, async together() {},
  async reveal(item) { await S(item.want === 'yes' ? 'gen.sym.reveal.yes' : 'gen.sym.reveal.no'); },
  praise: () => 'praiseSym', twin(item) { return item.twin || null; },
};

/* ================= ② أيّ شكل يُطوى نصفين متطابقين؟ (C021): pics ثلاثة، ask: yes (المتماثل الوحيد) أو no (غير المتماثل الوحيد) ================= */
const SYM_X3 = [286, 180, 74];
ITEM.symPick = {
  make(spec) { const isS = k => symHas(k, 90), want = spec.pics.findIndex(k => (spec.ask === 'no') !== isS(k)); return { ...spec, want, tag: 'sym-pick-' + (spec.ask || 'yes') }; },
  async ask(item, mode, tries) { const svg = newStage(230, { oasis: false, ground: 0 }), F = item.pics.map((k, i) => symFoldAt(svg, k, SYM_X3[i], 112, .98, 90, 0, { line: tries >= 3 }));
    if (tries >= 3) F.forEach(f => f.flat());   /* الحلّ المشترك: الأشكال مطوية أمامه، والاختيار له */
    say(...lineOf(tries >= 3 ? 'gen.sym.together.pick' : item.q), { free: true });
    const k = await tapOne(F.map((f, i) => ({ g: f.g, k: i, label: labelText('sym.' + item.pics[i]) })), { ok: item.want, pad: 100 }); hush(); return { ans: k, ctx: { svg, F } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: item.ask === 'no' ? 'symPickNo' : 'symPickWrong' }; },
  async onOk(item, r) { SFX.good(); const f = r.ctx.F[r.ans]; okRing(r.ctx.svg, f.g, 2); if (item.ask !== 'no') { f.line.setAttribute('opacity', 1); await f.fold(); } }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const f = r.ctx.F[r.ans]; f.line.setAttribute('opacity', 1); await f.fold(1200); await sleep(700); await f.open(); f.line.setAttribute('opacity', 0); }, async together() {},
  async reveal(item, r) { okRing(r.ctx.svg, r.ctx.F[item.want].g, 2); await S('gen.sym.reveal.pick'); },
  praise: () => 'praiseSym', twin(item) { return item.twin || null; },
};

/* ---------- قطعتان من شكل قُصّ عند x = off (0 منتصفه) ---------- */
function symCutAt(parent, kind, x, y, k, off, gap = 7) { const id = 'symk' + (++SYM_ID), g = el('g', { transform: `translate(${x} ${y}) scale(${k})`, 'data-cut': off }, parent), P = [];
  for (const [s, x0, dx] of [['l', -200, -gap], ['r', off, gap]]) { const cp = el('clipPath', { id: id + s }, g); el('rect', { x: s === 'l' ? -200 : off, y: -100, width: s === 'l' ? 200 + off : 200, height: 200 }, cp);
    const w = el('g', { transform: `translate(${dx} 0)` }, g), h = el('g', { 'clip-path': `url(#${id}${s})` }, w); SYM[kind].draw(h); P.push(w); }
  return { g, L: P[0], R: P[1], off, gap,
    /* القطعة اليسرى تُقلب على اليمنى: إن كانتا نصفين غابت تحتها */
    async lay(ms = 800) { SFX.tick(); await symTween(ms, t => { P[0].setAttribute('transform', `translate(${-gap + (2 * gap + 2 * off) * t} 0) translate(${0} 0) scale(${1 - 2 * t} 1)`); P[0].setAttribute('opacity', 1 - .4 * t); }); },
    async back(ms = 500) { await symTween(ms, t => { P[0].setAttribute('transform', `translate(${gap + 2 * off - (2 * gap + 2 * off) * t} 0) scale(${-1 + 2 * t} 1)`); P[0].setAttribute('opacity', .6 + .4 * t); }); },
    flat() { P[0].setAttribute('transform', `translate(${gap + 2 * off} 0) scale(-1 1)`); P[0].setAttribute('opacity', .6); } }; }

/* ================= ③ أيّ الصورتين قُسمت نصفين؟ (F001): shape، offs إزاحتا القصّ (0 للنصفين)، ask: half (الافتراضي) أو not ================= */
ITEM.halfPick = {
  make(spec) { const want = spec.offs.findIndex(o => (spec.ask === 'not') !== (o === 0)); return { ...spec, want, tag: 'half-pick' + (spec.ask === 'not' ? '-not' : '') }; },
  async ask(item, mode, tries) { const svg = newStage(230, { oasis: false, ground: 0 }), X = [268, 92], C = item.offs.map((o, i) => { el('rect', { x: X[i] - 82, y: 34, width: 164, height: 156, rx: 18, fill: '#fffdf6', 'fill-opacity': .9, stroke: css('--line'), 'stroke-width': 2.5 }, svg); return symCutAt(svg, item.sym, X[i], 112, 1.45, o); });
    if (tries >= 3) C.forEach(c => c.flat());
    say(...lineOf(tries >= 3 ? 'gen.sym.together.half' : item.q), { free: true });
    const k = await tapOne(C.map((c, i) => ({ g: c.g, k: i, label: labelText(i ? 'symPicL' : 'symPicR') })), { ok: item.want, pad: 150 }); hush(); return { ans: k, ctx: { svg, C } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'halfWrong' }; },
  onOk(item, r) { SFX.good(); okRing(r.ctx.svg, r.ctx.C[r.ans].g, 2); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const c = r.ctx.C[r.ans]; await c.lay(1200); await sleep(700); await c.back(); }, async together() {},
  async reveal(item, r) { okRing(r.ctx.svg, r.ctx.C[item.want].g, 2); await S('gen.sym.reveal.half'); },
  praise: () => 'praiseSym', twin(item) { return item.twin || null; },
};

/* ---------- خطوط مرشّحة على شكل، لكلٍّ مقبض في طرفه الأعلى ---------- */
const SYM_KNOB = ['#3d7cc0', '#d9483b', '#4f9a6a'];
function symLinesAt(svg, cx, cy, k, cands) {   /* cands: [{ang} أو {off}] */
  return cands.map((c, i) => { const g = el('g', { 'data-cand': i }, svg), col = SYM_KNOB[i]; let x1, y1, x2, y2;
    if (c.off != null) { x1 = x2 = cx + c.off * k; y1 = cy - 62 * k; y2 = cy + 54 * k; } else { const a = c.ang * Math.PI / 180, r = 62 * k; x1 = cx + r * Math.cos(a); y1 = cy - r * Math.sin(a); x2 = cx - r * Math.cos(a); y2 = cy + r * Math.sin(a); if (y1 > y2) [x1, y1, x2, y2] = [x2, y2, x1, y1]; }
    el('line', { x1, y1, x2, y2, stroke: col, 'stroke-width': 3.4, 'stroke-dasharray': '8 6', 'stroke-linecap': 'round' }, g); el('circle', { cx: x1, cy: y1, r: 13, fill: col, stroke: '#fff', 'stroke-width': 3 }, g);
    const t = el('text', { x: x1, y: y1 + 5.5, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: '#fff', 'font-family': css('--f'), 'pointer-events': 'none' }, g); t.textContent = DG(i + 1); return { g, i, c, x1, y1 }; }); }

/* ================= ④ أين نقصّ ليكون نصفان؟ (F001، إنتاج): shape، offs ثلاث إزاحات فيها 0 ================= */
ITEM.halfCut = {
  make(spec) { return { ...spec, want: spec.offs.indexOf(0), tag: 'half-cut' }; },
  async ask(item, mode, tries) { const svg = newStage(260, { oasis: false, ground: 0 }), k = 2.1, cx = 180, cy = 150, sh = symAt(svg, item.sym, cx, cy, k), L = symLinesAt(svg, cx, cy, k, item.offs.map(off => ({ off })));
    if (tries >= 3) { const m = helpG(svg); L.forEach(l => { const o = l.c.off, wl = 46 + o, wr = 46 - o;   /* الحلّ المشترك: شريطان تحت كل خط بطول قطعتيه */
        el('rect', { x: l.x1 - 2 - wl * .42, y: 242, width: wl * .42, height: 7, rx: 3, fill: SYM_KNOB[l.i] }, m); el('rect', { x: l.x1 + 2, y: 242, width: wr * .42, height: 7, rx: 3, fill: SYM_KNOB[l.i], opacity: .55 }, m); }); }
    say(...lineOf(tries >= 3 ? 'gen.sym.together.cut' : item.q), { free: true });
    const i = await tapOne(L.map(l => ({ g: l.g, k: l.i, label: labelText('symLineN') + ' ' + DG(l.i + 1) })), { ok: item.want, pad: 56 }); hush(); return { ans: i, ctx: { svg, sh, L, k, cx, cy } }; },
  judge(item, i) { return i === item.want ? { ok: true } : { ok: false, err: 'halfCutWrong' }; },
  async onOk(item, r) { SFX.good(); const { svg, sh, L, k, cx, cy } = r.ctx; sh.remove(); L.forEach(l => l.g.remove()); const c = symCutAt(svg, item.sym, cx, cy, k, 0, 2); await c.lay(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const { svg, sh, L, k, cx, cy } = r.ctx, o = item.offs[r.ans]; sh.setAttribute('opacity', 0); const c = symCutAt(svg, item.sym, cx, cy, k, o, 2); await c.lay(1200); await sleep(700); c.g.remove(); sh.setAttribute('opacity', 1); }, async together() {},
  async reveal(item, r) { okRing(r.ctx.svg, r.ctx.L[item.want].g, 4); await S('gen.sym.reveal.cut'); },
  praise: () => 'praiseSym', twin(item) { return item.twin || null; },
};

/* ================= ⑤ ورقة مطوية قُصّ منها نصف شكل: ما الذي يظهر حين نفتحها؟ (C021): half، opts ثلاثة ================= */
ITEM.unfoldPick = {
  make(spec) { return { ...spec, want: spec.pool.indexOf(spec.half), tag: 'unfold-pick' }; },
  async ask(item, mode, tries) { const svg = newStage(290, { oasis: false, ground: 0 }), id = 'symu' + (++SYM_ID), g = el('g', { transform: 'translate(180 92) scale(1.5)' }, svg);
    el('rect', { x: 0, y: -52, width: 56, height: 104, fill: '#fffdf6', stroke: css('--line'), 'stroke-width': 2 }, g);   /* الورقة المطوية: نصفها الأيمن، وحافة الطيّ إلى اليسار */
    const cp = el('clipPath', { id }, g); el('rect', { x: 0, y: -100, width: 200, height: 200 }, cp); const hw = el('g', {}, g), hh = el('g', { 'clip-path': `url(#${id})` }, hw); SYM[item.half].draw(hh);
    const lw = el('g', { transform: 'scale(-1 1)', opacity: 0 }, g), lp = el('rect', { x: 0, y: -52, width: 56, height: 104, fill: '#fffdf6', stroke: css('--line'), 'stroke-width': 2 }, lw), lh = el('g', { 'clip-path': `url(#${id})` }, lw); SYM[item.half].draw(lh);
    el('line', { x1: 0, y1: -56, x2: 0, y2: 56, stroke: css('--compass'), 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    if (tries >= 3) { lw.setAttribute('opacity', .28); }   /* الحلّ المشترك: طيف النصف الآخر */
    const O = item.pool.map((k, i) => { const og = el('g', {}, svg); el('rect', { x: SYM_X3[i] - 48, y: 190, width: 96, height: 90, rx: 16, fill: '#fffdf6', 'fill-opacity': .92, stroke: css('--line'), 'stroke-width': 2.5 }, og); symAt(og, k, SYM_X3[i], 235, .78); return { g: og, k: i, label: labelText('sym.' + k) }; });
    say(...lineOf(tries >= 3 ? 'gen.sym.together.unfold' : item.q), { free: true });
    const k = await tapOne(O, { ok: item.want, pad: false }); hush(); return { ans: k, ctx: { svg, lw, O } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'unfoldWrong' }; },
  async onOk(item, r) { SFX.good(); okRing(r.ctx.svg, r.ctx.O[r.ans].g, 2); const lw = r.ctx.lw; lw.setAttribute('opacity', 1); await symTween(700, t => lw.setAttribute('transform', `scale(${1 - 2 * t} 1)`)); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const lw = r.ctx.lw; lw.setAttribute('opacity', 1); await symTween(700, t => lw.setAttribute('transform', `scale(${1 - .5 * t} 1)`)); await sleep(600); await symTween(400, t => lw.setAttribute('transform', `scale(${.5 + .5 * t} 1)`)); lw.setAttribute('opacity', 0); lw.setAttribute('transform', 'scale(-1 1)'); },
  async together() {}, async reveal(item, r) { const lw = r.ctx.lw; lw.setAttribute('opacity', 1); await symTween(700, t => lw.setAttribute('transform', `scale(${1 - 2 * t} 1)`)); okRing(r.ctx.svg, r.ctx.O[item.want].g, 2); await S('gen.sym.reveal.unfold'); },
  praise: () => 'praiseSym', twin(item) { return item.twin || null; },
};

/* ================= ⑥ أيّ الخطوط خط تماثل؟ (C022): shape، angs زوايا الخطوط المرشّحة (واحد منها صحيح)، rot ================= */
ITEM.symLine = {
  make(spec) { const ok = spec.angs.map(a => symHas(spec.sym, a, spec.rot || 0)); return { ...spec, want: ok.indexOf(true), tag: 'sym-line' }; },
  async ask(item, mode, tries) { const svg = newStage(270, { oasis: false, ground: 0 }), k = 1.9, cx = 180, cy = 150, sh = symAt(svg, item.sym, cx, cy, k, item.rot || 0), L = symLinesAt(svg, cx, cy, k, item.angs.map(ang => ({ ang })));
    let live = L; if (tries >= 3 && L.length > 2) { const drop = L.find(l => l.i !== item.want); drop.g.setAttribute('opacity', .22); live = L.filter(l => l !== drop); }   /* الحلّ المشترك: خط خطأ يُبعد، ويبقى الاختيار بين اثنين */
    say(...lineOf(tries >= 3 ? 'gen.sym.together.line' : item.q), { free: true });
    const i = await tapOne(live.map(l => ({ g: l.g, k: l.i, label: labelText('symLineN') + ' ' + DG(l.i + 1) })), { ok: item.want, pad: 56 }); hush(); return { ans: i, ctx: { svg, sh, L, k, cx, cy } }; },
  judge(item, i) { return i === item.want ? { ok: true } : { ok: false, err: 'symLineWrong' }; },
  async show(item, r, i, ms, keep) { const { svg, sh, L, k, cx, cy } = r.ctx; sh.setAttribute('opacity', 0); L.forEach(l => l.g.setAttribute('opacity', l.i === i ? 1 : .15)); const F = symFoldAt(svg, item.sym, cx, cy, k, item.angs[i], item.rot || 0, { line: false }); svg.insertBefore(F.g, L[0].g);
    await F.fold(ms); await sleep(700); if (!keep) { F.g.remove(); sh.setAttribute('opacity', 1); L.forEach(l => l.g.setAttribute('opacity', 1)); } },
  async onOk(item, r) { SFX.good(); await ITEM.symLine.show(item, r, item.want, 700, true); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { await ITEM.symLine.show(item, r, r.ans, 1300, false); }, async together() {},
  async reveal(item, r) { await ITEM.symLine.show(item, r, item.want, 900, true); await S('gen.sym.reveal.line'); },
  praise: () => 'praiseSym', twin(item) { return item.twin || null; },
};

/* ================= مشاهد الدرس 1 ================= */
/* شكل يطويه الطفل بلمسة، ثم جملة بحسب ما رأى. c: { shape، ang، rot، chaos (جملة فوضى قبل الطيّ)، lines: [دعوة، بعد] } */
SCENES.foldShow = async c => {
  const svg = newStage(250, { oasis: false, ground: 0 }), F = symFoldAt(svg, c.sym, 180, 124, 1.9, c.ang ?? 90, c.rot || 0), [l1, l2] = c.lines; let fz = null;
  if (c.chaos) { fz = chaosAt(svg, 52, 52, .42); await chaosGiggle(fz); await S(c.chaos); }
  await answerWhile(l1, () => tapOne([{ g: F.g, k: 'f', label: labelText('symFold') }], { ok: 'f', pad: 64 })); await F.fold(900); logAttempt({ scene: c.s || 'hook', tag: 'foldShow', ok: true });
  if (fz) fz.remove(); await sleep(400); await S(l2);
};
/* معمل الطيّ: أشكال يطويها الطفل واحداً واحداً، ولكلٍّ جملته. c: { things: [{ shape، ang، rot، line }]، intro، after } */
SCENES.foldLab = async c => {
  const svg = newStage(250, { oasis: false, ground: 0 }), n = c.things.length, X = i => 180 + (n - 1) * 56 - i * 112, k = n > 3 ? .86 : 1;
  const F = c.things.map((t, i) => symFoldAt(svg, t.sym, n > 3 ? [270, 90, 270, 90][i] : X(i), n > 3 ? [72, 72, 186, 186][i] : 124, k, t.ang ?? 90, t.rot || 0));
  S(c.intro, { free: true }); let first = true;
  for (const [i, f] of F.entries()) { f.g.classList.add('pulse'); await tapOne([{ g: f.g, k: i, label: labelText('sym.' + c.things[i].sym) }], { ok: i, pad: 96, pulse: false }); f.g.classList.remove('pulse'); if (first) { hush(); first = false; }
    await f.fold(900); await S(c.things[i].line); }
  logAttempt({ scene: 'explore', tag: 'foldLab', ok: true }); if (c.after) await S(c.after);
};
/* النصف (F001): القلب يُقصّ عند خط طيّه، فالقطعتان نصفان؛ ثم يعودان معاً فيعود الكلّ. c.lines: [قصّ، اسم النصف، ضمّ، الكلّ] */
SCENES.halfScene = async c => {
  const svg = newStage(270, { oasis: false, ground: 0 }), [l1, l2, l3, l4] = c.lines, kind = c.sym || 'heart', cx = 180, cy = 150, k = 1.9;
  const sh = symAt(svg, kind, cx, cy, k), L = symLinesAt(svg, cx, cy, k, [{ off: 0 }]);
  await answerWhile(l1, () => tapOne([{ g: L[0].g, k: 0, label: labelText('symCut') }], { ok: 0, pad: 64 })); SFX.tick(); sh.remove(); L[0].g.remove();
  const C = symCutAt(svg, kind, cx, cy, k, 0, 16); C.L.setAttribute('transform', ''); C.R.setAttribute('transform', ''); await symTween(500, t => { C.L.setAttribute('transform', `translate(${-16 * t} 0)`); C.R.setAttribute('transform', `translate(${16 * t} 0)`); });
  await S(l2); await C.lay(1000); await sleep(600); await symTween(500, t => { C.L.setAttribute('transform', `translate(${16 - 32 * t} 0) scale(${-1 + 2 * t} 1)`); C.L.setAttribute('opacity', .6 + .4 * t); });
  await answerWhile(l3, () => tapOne([{ g: C.L, k: 'l', label: labelText('symHalf') }, { g: C.R, k: 'r', label: labelText('symHalf') }], { ok: ['l', 'r'], pad: 64 }));
  await symTween(500, t => { C.L.setAttribute('transform', `translate(${-16 + 16 * t} 0)`); C.R.setAttribute('transform', `translate(${16 - 16 * t} 0)`); }); SFX.good(); logAttempt({ scene: 'explore', tag: 'half', ok: true }); await S(l4);
};
/* «صحّح لفوضى»: قطعتان كبيرة وصغيرة تسمّيهما فوضى نصفين؛ يضع الطفل إحداهما على الأخرى فيرى، ثم يحكم */
SCENES.chaosHalf = async C => {
  const svg = newStage(250, { oasis: false, ground: 0 }), c = symCutAt(svg, C.sym || 'rect', 180, 130, 2, C.off || 20, 10), fz = chaosAt(svg, 46, 46, .4); await chaosGiggle(fz);
  S(C.find, { free: true }); await tapOne([{ g: c.L, k: 'l', label: labelText('symPiece') }, { g: c.R, k: 'r', label: labelText('symPiece') }], { ok: ['l', 'r'], pad: 64 }); hush(); await c.lay(1100);
  let tries = 0; while (true) { await S(C.ask); const k = await symYesNo('no'); tries++; logAttempt({ scene: 'chaos', tag: 'find', ok: k === 'no', firstTry: tries === 1 }); document.querySelectorAll('#stage .choices').forEach(b => b.remove()); if (k === 'no') break; SFX.soft(); await c.back(); await c.lay(1500); }
  SFX.good(); fz.remove(); if (C.after) await S(C.after);
};
/* التذكّر: شكل يُطوى أمامه */
SCENES.recallMir = async c => { const svg = newStage(300, { oasis: false, ground: 0 }), M = mirGridAt(svg); c.cells.forEach(([r, cc]) => M.paint(r, cc, MIR.given)); await sleep(300); for (const [r, cc] of c.cells) { M.paint(r, 5 - cc, MIR.mine); SFX.tick(); await sleep(160); } await S(c.lines); };
SCENES.recallSym = async c => { const svg = newStage(230, { oasis: false, ground: 0 }), F = symFoldAt(svg, c.sym || 'heart', 180, 116, 1.7, c.ang ?? 90); await sleep(300); await F.fold(900); await S(c.lines); };
/* قطعة الواحة: قلوب ورقية */
WRAP_ART.paperHearts = svg => { [[110, 130, 1.1], [180, 96, 1.5], [252, 132, 1.1]].forEach(([x, y, k], i) => { const g = symAt(svg, 'heart', x, y, k); el('line', { x1: 0, y1: -44, x2: 0, y2: 42, stroke: '#fff', 'stroke-width': 2, 'stroke-dasharray': '5 4' }, g);
    anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 200 + i * 220, fill: 'both' }); }); palmAt(svg, 326, 250, .8); palmAt(svg, 34, 250, .9); };

/* =====================================================================
   الدروس 2–4: خط التماثل والمرآة (C022)، وإكمال النصف على الشبكة (C023)، والضعف (N015)، وصيد التماثل.
   ===================================================================== */
SYM_KNOB.push('#8e6bbf');
/* ================= ⑦ المرآة (C022، إنتاج): يحرّك الطفل المرآة حتى يُرى الشكل كاملاً. sym، start إزاحة البدء عن الوسط ================= */
ITEM.mirrorSlide = {
  make(spec) { return { ...spec, start: spec.start ?? -46, tag: 'mirror-slide' }; },
  async ask(item, mode, tries) { const svg = newStage(270, { oasis: false, ground: 0 }), id = 'symm' + (++SYM_ID), cx = 180, cy = 128, k = 1.9; let m = cx + item.start;
    if (tries >= 3) symAt(helpG(svg), item.sym, cx, cy, k).setAttribute('opacity', .2);   /* الحلّ المشترك: طيف الشكل الكامل، والمرآة للطفل */
    const cp = el('clipPath', { id }, svg), cr = el('rect', { x: 0, y: 0, width: m, height: 270 }, cp), mk = () => { const w = el('g', { 'clip-path': `url(#${id})` }, svg); symAt(w, item.sym, cx, cy, k); return w; };
    mk(); const refl = el('g', {}, svg); refl.appendChild(mk()); refl.setAttribute('opacity', .88);
    const bar = el('g', {}, svg); el('rect', { x: -4, y: 14, width: 8, height: 226, rx: 4, fill: '#bfe6f2', stroke: css('--compass'), 'stroke-width': 2.5 }, bar); el('circle', { cy: 244, r: 17, fill: css('--compass'), stroke: '#fff', 'stroke-width': 3 }, bar);
    el('path', { d: 'M-8 244 l-6 0 m0 0 l4 -4 m-4 4 l4 4 M8 244 l6 0 m0 0 l-4 -4 m4 4 l-4 4', stroke: '#fff', 'stroke-width': 2.4, 'stroke-linecap': 'round', fill: 'none' }, bar);
    const set = x => { m = Math.max(84, Math.min(276, x)); cr.setAttribute('width', m); refl.setAttribute('transform', `translate(${2 * m} 0) scale(-1 1)`); bar.setAttribute('transform', `translate(${m} 0)`); /*T*/window.__mirror = m;/*/T*/ }; set(m);
    say(...lineOf(tries >= 3 ? 'gen.sym.together.mirror' : item.q), { free: true });
    const input = fingerInput(svg, { map: e => { const q = svgPoint(svg, e); return [q.x, q.y]; }, down(q) { set(q[0]); }, move(q) { set(q[0]); }, up() {} });
    const d = doneBtn(); AUTO({ kind: 'mirror', ok: () => { set(cx); d.b.click(); }, wrong: () => { set(cx + 42); d.b.click(); } });
    let fin = false; await gate(new Promise(res => d.b.onclick = () => { if (fin) return; fin = true; AUTO_CLEAR(); hush(); input.off(); d.bar.remove(); res(); }));
    return { ans: Math.round(m - cx), ctx: { svg, set, cx, cy, k } }; },
  judge(item, dx) { return Math.abs(dx) <= 8 ? { ok: true } : { ok: false, err: 'mirrorOff' }; },
  onOk(item, r) { SFX.good(); r.ctx.set(r.ctx.cx); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const { svg, cx, cy, k } = r.ctx, g = symAt(helpG(svg), item.sym, cx, cy, k); await anim(g, [{ opacity: 0 }, { opacity: .3 }, { opacity: .3 }, { opacity: 0 }], { duration: 1800 }).done.catch(() => {}); g.remove(); }, async together() {},
  async reveal(item, r) { const { set, cx } = r.ctx, a = cx + r.ans; await symTween(700, t => set(a + (cx - a) * t)); await S('gen.sym.reveal.mirror'); },
  praise: () => 'praiseSym', twin(item) { return item.twin || null; },
};

/* ---------- شبكة التماثل: 6 أعمدة (3 يسار الخط و3 يمينه)، والخط شريط ملوّن في وسطها ---------- */
function mirGridAt(svg, opt = {}) { const C = opt.cell || 56, rows = opt.rows || 5, x0 = 180 - 3 * C, y0 = opt.y0 ?? 10, g = el('g', { 'data-mirgrid': 1 }, svg), cells = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < 6; c++) { const cg = el('g', { 'data-rc': r + ',' + c }, g), rc = el('rect', { x: x0 + c * C, y: y0 + r * C, width: C, height: C, rx: C * .14, fill: '#fffdf6', stroke: '#d9cfb8', 'stroke-width': 1.5 }, cg); cells.push({ r, c, g: cg, rc, on: false, x: x0 + c * C + C / 2, y: y0 + r * C + C / 2 }); }
  el('rect', { x: 177, y: y0 - 6, width: 6, height: rows * C + 12, rx: 3, fill: css('--compass'), 'pointer-events': 'none' }, g);
  const at = (r, c) => cells[r * 6 + c], paint = (r, c, col) => { const k = at(r, c); k.rc.setAttribute('fill', col || '#fffdf6'); k.on = !!col; k.col = col; };
  return { g, cells, at, paint, C, rows, mirror: (r, c) => [r, 5 - c] }; }
const MIR = { given: '#ee7f6a', mine: '#3fa796' };
const mirKey = L => L.map(([r, c]) => r * 6 + c).sort((a, b) => a - b).join(',');
/* ================= ⑧ أكمل النصف المقابل (C023، إنتاج): cells خانات النصف المعطى [صف، عمود] (أعمدته 0–2، أو 3–5 إن كان المعطى يميناً) ================= */
ITEM.gridMirror = {
  make(spec) { const want = spec.cells.map(([r, c]) => [r, 5 - c]); return { ...spec, want, tag: 'grid-mirror' + (spec.cells[0][1] > 2 ? '-r' : '') }; },
  async ask(item, mode, tries) { const svg = newStage(300, { oasis: false, ground: 0 }), M = mirGridAt(svg), left = item.cells[0][1] <= 2, mine = c => left ? c > 2 : c <= 2;
    item.cells.forEach(([r, c]) => M.paint(r, c, MIR.given));
    const lastRow = Math.max(...item.want.map(w => w[0])), pre = tries >= 3 ? item.want.filter(w => w[0] !== lastRow) : []; pre.forEach(([r, c]) => M.paint(r, c, MIR.mine));   /* الحلّ المشترك: كل الصفوف إلا الأخير */
    say(...lineOf(tries >= 3 ? 'gen.sym.together.grid' : item.q), { free: true }); let first = true;
    const T = M.cells.filter(k => mine(k.c)); T.forEach(k => { k.g.style.cursor = 'pointer'; k.g.setAttribute('role', 'button'); k.g.setAttribute('tabindex', 0); k.g.setAttribute('aria-label', labelText('mirCell'));
      const tog = () => { if (first) { hush(); first = false; } SFX.tick(); M.paint(k.r, k.c, k.on ? null : MIR.mine); buzz(15); }; k.g.onclick = tog; k.g.onkeydown = e => { if (isActKey(e)) { e.preventDefault(); tog(); } }; });
    const d = doneBtn(), put = L => { T.forEach(k => M.paint(k.r, k.c, null)); L.forEach(([r, c]) => M.paint(r, c, MIR.mine)); d.b.click(); };
    /*T*/window.__mirWant = item.want.filter(w => !pre.some(p => p[0] === w[0] && p[1] === w[1])).map(([r, c]) => { const k = M.at(r, c), m = svg.getScreenCTM(); return { x: m.a * k.x + m.e, y: m.d * k.y + m.f }; });/*/T*/
    AUTO({ kind: 'mirgrid', ok: () => put(item.want), wrong: () => put(item.cells.map(([r, c]) => [r, left ? c + 3 : c - 3])) });
    let fin = false; await gate(new Promise(res => d.b.onclick = () => { if (fin) return; fin = true; AUTO_CLEAR(); hush(); d.bar.remove(); res(); }));
    T.forEach(k => { k.g.onclick = null; k.g.onkeydown = null; k.g.removeAttribute('role'); k.g.removeAttribute('tabindex'); k.g.style.cursor = ''; });
    return { ans: T.filter(k => k.on).map(k => [k.r, k.c]), ctx: { svg, M, T } }; },
  judge(item, a) { if (mirKey(a) === mirKey(item.want)) return { ok: true }; const left = item.cells[0][1] <= 2, copy = item.cells.map(([r, c]) => [r, left ? c + 3 : c - 3]);
    return { ok: false, err: mirKey(a) === mirKey(copy) ? 'mirCopy' : a.length !== item.want.length ? 'mirCount' : 'mirWrong' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  /* التلميح: خانة معطاة وما يقابلها تومضان معاً (البعد نفسه عن الخط)، في الصف الأول وحده */
  async hint2(item, r) { const M = r.ctx.M, r0 = Math.min(...item.cells.map(c => c[0])); for (const [rr, c] of item.cells.filter(c => c[0] === r0)) { const a = M.at(rr, c), b = M.at(rr, 5 - c), rg = [a, b].map(k => el('rect', { x: k.x - M.C / 2 + 2, y: k.y - M.C / 2 + 2, width: M.C - 4, height: M.C - 4, rx: 8, fill: 'none', stroke: css('--compass'), 'stroke-width': 4, 'pointer-events': 'none' }, helpG(r.ctx.svg))); SFX.tick(); await sleep(900); rg.forEach(x => x.remove()); } },
  async together() {},
  async reveal(item, r) { const { M, T } = r.ctx; T.forEach(k => M.paint(k.r, k.c, null)); for (const [rr, c] of item.want) { M.paint(rr, c, MIR.mine); SFX.tick(); await sleep(160); } await S('gen.sym.reveal.grid'); },
  praise: () => 'praiseSym', twin(item) { return item.twin || null; },
};

/* ---------- الضعف: n خانة على يسار الخط (خانتان في كل صف ملاصقتان له) ---------- */
const dblCells = n => Array.from({ length: n }, (_, i) => [Math.floor(i / 2), 2 - (i % 2)]);
function dblGridAt(svg, n, opt = {}) { const M = mirGridAt(svg, { cell: opt.cell || 38, rows: 5, y0: opt.y0 ?? 12 }); dblCells(n).forEach(([r, c]) => M.paint(r, c, MIR.given)); return M; }
async function dblFill(M, n, ms = 130) { for (const [r, c] of dblCells(n)) { M.paint(r, 5 - c, MIR.mine); SFX.tick(); await sleep(ms); } }
/* ================= ⑨ كم في الشكل كله بعد إكماله؟ (N015): n خانات النصف (2–10) ================= */
ITEM.doubleOf = { ...numItem,
  make(spec) { const n = spec.n, w = 2 * n; return { ...spec, want: w, nums: [w, n + 1, n === 3 ? w + 2 : w - 2], tag: 'double' }; },
  async ask(item, mode, tries) { const svg = newStage(216, { oasis: false, ground: 0 }), M = dblGridAt(svg, item.n); if (tries >= 3) dblCells(item.n).forEach(([r, c]) => M.paint(r, 5 - c, MIR.mine));   /* الحلّ المشترك: النصف المقابل مرسوم، والعدّ للطفل */
    await S(tries >= 3 ? 'gen.sym.together.double' : item.q); const np = numberPick(shuffle(item.nums), item.want); return { ans: await np.p, ctx: { svg, np, M } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: k === item.n + 1 ? 'dblPlusOne' : 'dblWrong' }; },
  async hint2(item, r) { await dblFill(r.ctx.M, item.n, 220); await sleep(500); dblCells(item.n).forEach(([rr, c]) => r.ctx.M.paint(rr, 5 - c, null)); },
  async together() {}, async reveal(item, r) { dblCells(item.n).forEach(([rr, c]) => r.ctx.M.paint(rr, 5 - c, MIR.mine)); await S(numw(item.want), { num: true }); },
  twin(item) { return item.twin || null; },
};

/* ---------- مشاهد الدروس 2–4 ---------- */
/* كل طرق طيّ الشكل: يلمس الطفل مقبض كل خط فيُطوى ويُفتح، وشارة تعدّ ما انطبق. c: { sym، angs، lines: [دعوة، بعد] } */
SCENES.foldWays = async c => {
  const svg = newStage(280, { oasis: false, ground: 0 }), k = 1.9, cx = 180, cy = 156, [l1, l2] = c.lines, L = symLinesAt(svg, cx, cy, k, c.angs.map(ang => ({ ang }))), sh = symAt(svg, c.sym, cx, cy, k); svg.insertBefore(sh, L[0].g);
  S(l1, { free: true }); let left = [...L], n = 0, first = true;
  while (left.length) { const i = await tapOne(left.map(l => ({ g: l.g, k: l.i, label: labelText('symLineN') + ' ' + DG(l.i + 1) })), { ok: left[0].i, pad: 56 }); if (first) { hush(); first = false; } const l = L[i]; left = left.filter(x => x !== l);
    sh.setAttribute('opacity', 0); const F = symFoldAt(svg, c.sym, cx, cy, k, c.angs[i], 0, { line: false }); svg.insertBefore(F.g, L[0].g); await F.fold(800); await sleep(500);
    if (F.match) { n++; SFX.good(); l.g.querySelector('circle').setAttribute('r', 16); badge(helpG(svg), 34, 34, n); } else { SFX.soft(); l.g.setAttribute('opacity', .3); }
    await F.open(350); F.g.remove(); sh.setAttribute('opacity', 1); }
  logAttempt({ scene: 'explore', tag: 'foldWays', ok: true }); await S(l2);
};
/* المثال المحلول: خطّان مرشّحان؛ فرجار يطوي عند الأول فلا ينطبقان، والطفل يلمس الآخر. c: { sym، angs: [خطأ، صحيح]، lines: [3] } */
SCENES.lineWorked = async c => {
  const svg = newStage(270, { oasis: false, ground: 0 }), k = 1.9, cx = 180, cy = 150, [l1, l2, l3] = c.lines, L = symLinesAt(svg, cx, cy, k, c.angs.map(ang => ({ ang }))), sh = symAt(svg, c.sym, cx, cy, k); svg.insertBefore(sh, L[0].g);
  const fold = async (i, keep) => { sh.setAttribute('opacity', 0); const F = symFoldAt(svg, c.sym, cx, cy, k, c.angs[i], 0, { line: false }); svg.insertBefore(F.g, L[0].g); await F.fold(900); await sleep(500); if (!keep) { await F.open(350); F.g.remove(); sh.setAttribute('opacity', 1); } };
  await S(l1); await fold(0); L[0].g.setAttribute('opacity', .3);
  await answerWhile(l2, () => tapOne([{ g: L[1].g, k: 1, label: labelText('symLineN') + ' ' + DG(2) }], { ok: 1, pad: 56 })); await fold(1, true); SFX.good(); await S(l3);
};
/* «صحّح لفوضى» بالطيّ: شكل وخطّ فوضى؛ يطويه الطفل ثم يحكم: هل ينطبق النصفان؟ (الجواب لا) */
SCENES.chaosFold = async C => {
  const svg = newStage(250, { oasis: false, ground: 0 }), F = symFoldAt(svg, C.sym, 180, 128, 1.9, C.ang ?? 90, 0, { lineColor: css('--chaos') }), fz = chaosAt(svg, 46, 46, .4); await chaosGiggle(fz);
  S(C.find, { free: true }); await tapOne([{ g: F.g, k: 'f', label: labelText('symFold') }], { ok: 'f', pad: 64 }); hush(); await F.fold(1000);
  let tries = 0; while (true) { await S(C.ask); const k = await symYesNo('no'); tries++; logAttempt({ scene: 'chaos', tag: 'find', ok: k === 'no', firstTry: tries === 1 }); document.querySelectorAll('#stage .choices').forEach(b => b.remove()); if (k === 'no') break; SFX.soft(); await F.open(); await F.fold(1600); }
  SFX.good(); fz.remove(); if (C.after) await S(C.after);
};
/* الإكمال الموجَّه على الشبكة: لكل خانة معطاة تنبض مقابلتها فيلمسها الطفل. c: { cells، lines: [دعوة، بعد…] } */
SCENES.gridLab = async c => {
  const svg = newStage(300, { oasis: false, ground: 0 }), M = mirGridAt(svg), [l1, ...rest] = c.lines; c.cells.forEach(([r, cc]) => M.paint(r, cc, MIR.given)); S(l1, { free: true }); let first = true, slips = 0;
  for (const [r, cc] of c.cells) { const a = M.at(r, cc), b = M.at(r, 5 - cc), mk = k => el('rect', { x: k.x - M.C / 2 + 2, y: k.y - M.C / 2 + 2, width: M.C - 4, height: M.C - 4, rx: 8, fill: 'none', stroke: css('--compass'), 'stroke-width': 4, 'pointer-events': 'none' }, svg), ra = mk(a), rb = mk(b); rb.classList.add('pulse');
    await tapOne([{ g: b.g, k: 'c', label: labelText('mirCell') }], { ok: 'c', pad: false, pulse: false }); if (first) { hush(); first = false; } M.paint(r, 5 - cc, MIR.mine); SFX.tick(); ra.remove(); rb.remove(); }
  logAttempt({ scene: 'explore', tag: 'gridLab', ok: true, firstTry: slips === 0 }); SFX.good(); await sleep(300); await S(rest);
};
/* الضعف في المرآة: لكل عدد في ns يُرسم نصفه ثم يظهر مقابله، وجملته. c: { ns، lines } */
SCENES.doubleShow = async c => { for (const [i, n] of c.ns.entries()) { const svg = newStage(216, { oasis: false, ground: 0 }), M = dblGridAt(svg, n); await sleep(400); await dblFill(M, n, 200); SFX.good(); await S(c.lines[i]); await sleep(300); } };
/* المثال المحلول: صندوق بيض بصفّين؛ الصف الأول يُعدّ، والطفل يلمس الثاني فيكمل العدّ. c: { n، lines: [3] } */
SCENES.doubleWorked = async c => {
  const svg = newStage(230, { oasis: false, ground: 0 }), n = c.n || 6, [l1, l2, l3] = c.lines, X = i => 180 + (n - 1) * 25 - i * 50, row = y => { const g = el('g', {}, svg), E = []; el('rect', { x: X(n - 1) - 32, y: y - 34, width: (n - 1) * 50 + 64, height: 68, rx: 18, fill: '#e9dcc3', stroke: '#fff', 'stroke-width': 2.5 }, g);
    for (let i = 0; i < n; i++) E.push(el('ellipse', { cx: X(i), cy: y, rx: 17, ry: 22, fill: '#fffdf6', stroke: '#d9cfb8', 'stroke-width': 2 }, g)); return { g, E }; }, A = row(70), B = row(156), m = helpG(svg);
  const count = async (R, from) => { for (const [i, e] of R.E.entries()) { e.setAttribute('fill', '#f6cf7e'); SFX.tick(); await S(numw(from + i + 1), { noGap: true, num: true }); } };
  await S(l1); await count(A, 0); await answerWhile(l2, () => tapOne([{ g: B.g, k: 'b', label: labelText('symRow2') }], { ok: 'b', pad: false })); await count(B, n); badge(m, 180, 208, 2 * n); SFX.good(); await S(l3);
};
/* إشعال الدرس 3: فوضى نسخت الجناح بالاتجاه نفسه؛ يلمس الطفل المرآة فيظهر المقابل الصحيح. c: { cells، lines: [فوضى، دعوة، بعد] } */
SCENES.chaosWing = async c => {
  const svg = newStage(300, { oasis: false, ground: 0 }), M = mirGridAt(svg), [l1, l2, l3] = c.lines; c.cells.forEach(([r, cc]) => { M.paint(r, cc, MIR.given); M.paint(r, cc + 3, css('--chaos')); });
  const fz = chaosAt(svg, 318, 30, .3); await chaosGiggle(fz); await S(l1); const knob = el('g', {}, svg); el('circle', { cx: 180, cy: 150, r: 20, fill: css('--compass'), stroke: '#fff', 'stroke-width': 3 }, knob); el('path', { d: 'M172 150 h-7 m0 0 l4 -4 m-4 4 l4 4 M188 150 h7 m0 0 l-4 -4 m4 4 l-4 4', stroke: '#fff', 'stroke-width': 2.4, 'stroke-linecap': 'round', fill: 'none' }, knob);
  await answerWhile(l2, () => tapOne([{ g: knob, k: 'm', label: labelText('symMirror') }], { ok: 'm', pad: 64 })); knob.remove(); fz.remove();
  for (const [r, cc] of c.cells) M.paint(r, cc + 3, null); await sleep(250); for (const [r, cc] of c.cells) { M.paint(r, 5 - cc, MIR.mine); SFX.tick(); await sleep(140); } logAttempt({ scene: 'hook', tag: 'chaosWing', ok: true }); SFX.good(); await S(l3);
};
/* «صحّح لفوضى» في الضعف: n على اليسار وخانة واحدة لفوضى على اليمين */
SCENES.chaosDouble = async C => {
  const svg = newStage(216, { oasis: false, ground: 0 }), n = C.n, M = dblGridAt(svg, n), fz = chaosAt(svg, 324, 34, .3); M.paint(0, 3, css('--chaos')); await chaosGiggle(fz); let tries = 0;
  while (true) { await S(C.find); const np = numberPick(shuffle([2 * n, n + 1, 2 * n - 2]), 2 * n), k = await np.p; tries++; np.box && np.box.remove(); logAttempt({ scene: 'chaos', tag: 'find', ok: k === 2 * n, firstTry: tries === 1 }); if (k === 2 * n) break; SFX.soft(); await S('gen.pat.chaosNo'); if (tries >= 2) { M.paint(0, 3, null); await dblFill(M, n, 220); } }
  SFX.good(); fz.remove(); M.paint(0, 3, null); dblCells(n).forEach(([r, c]) => M.paint(r, 5 - c, MIR.mine)); if (C.after) await S(C.after);
};
/* فنّان الطلاء المطوي: يلمس الطفل النصف الأيسر من الورقة فتقع بقع الطلاء، ثم تُطوى فتُطبع في النصف الآخر. c.lines: [دعوة، بعد] */
SCENES.paintFold = async c => {
  const svg = newStage(280, { oasis: false, ground: 0 }), [l1, l2] = c.lines, COL = ['#d9483b', '#3d7cc0', '#f2b33d', '#4f9a6a', '#8e6bbf'], blobs = [];
  el('rect', { x: 40, y: 20, width: 280, height: 200, rx: 6, fill: '#fffdf6', stroke: '#d9cfb8', 'stroke-width': 2.5 }, svg); el('line', { x1: 180, y1: 20, x2: 180, y2: 220, stroke: css('--compass'), 'stroke-width': 3, 'stroke-dasharray': '7 5' }, svg); const L = el('g', {}, svg), Rg = el('g', { opacity: 0 }, svg);
  const add = (x, y) => { if (x < 52 || x > 170 || y < 32 || y > 208 || blobs.length >= 12) return; const col = COL[blobs.length % COL.length], r = 11 + (blobs.length * 7) % 9; el('circle', { cx: x, cy: y, r, fill: col, opacity: .9 }, L); el('circle', { cx: 360 - x, cy: y, r, fill: col, opacity: .9 }, Rg); blobs.push([x, y]); SFX.pop(); buzz(15); };
  S(l1, { free: true }); const input = fingerInput(svg, { map: e => { const q = svgPoint(svg, e); return [q.x, q.y]; }, down(q) { add(q[0], q[1]); return false; }, move() {}, up() {} });
  const d = doneBtn(); AUTO({ kind: 'paint', ok: () => { [[90, 70], [130, 120], [100, 170]].forEach(p => add(...p)); d.b.click(); }, wrong: null });
  let fin = false; await gate(new Promise(res => d.b.onclick = () => { if (fin || !blobs.length) return; fin = true; AUTO_CLEAR(); hush(); input.off(); d.bar.remove(); res(); }));
  const cover = el('rect', { x: 40, y: 20, width: 140, height: 200, fill: '#f3ead6', stroke: '#d9cfb8', 'stroke-width': 2, opacity: 0 }, svg); cover.setAttribute('opacity', 1);
  await symTween(600, t => { cover.setAttribute('x', 40 + 140 * t); L.setAttribute('opacity', 1 - t); }); await sleep(400); Rg.setAttribute('opacity', 1); await symTween(600, t => { cover.setAttribute('x', 180 - 140 * t); cover.setAttribute('opacity', 1 - t); L.setAttribute('opacity', t); });
  cover.remove(); SFX.good(); logAttempt({ scene: 'explore', tag: 'paintFold', ok: true }); await S(l2);
};
WRAP_ART.butterflies = svg => { [[100, 120, 1], [190, 90, 1.3], [270, 140, .9]].forEach(([x, y, k], i) => { const g = symAt(svg, 'butterfly', x, y, k, [-12, 0, 10][i]); anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 200 + i * 220, fill: 'both' }); }); palmAt(svg, 326, 250, .8); palmAt(svg, 34, 250, .9); };
WRAP_ART.mirrorGate = svg => { el('rect', { x: 176, y: 40, width: 8, height: 190, rx: 4, fill: '#bfe6f2', stroke: css('--compass'), 'stroke-width': 2.5 }, svg); for (const s of [1, -1]) { symAt(svg, 'tree', 180 + s * 70, 150, 1.2); symAt(svg, 'star', 180 + s * 110, 70, .5); } palmAt(svg, 334, 250, .7); palmAt(svg, 26, 250, .7); };
