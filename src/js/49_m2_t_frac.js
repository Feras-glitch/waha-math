/* =====================================================================
   S2-U8 «كعكة الهندسة» (المرحلة 2، نوفمبر 2026): الكسور بالتمثيل البصري وحده (المؤجَّل: العمليات على الكسور، والأكبر من الواحد، والتكافؤ المجرّد)
   د1 الأجزاء المتساوية وأسماؤها (C220) · د2 البسط والمقام (C221) والوحدوي والواحد الصحيح (C222) · د3 النصف بأشكال كثيرة والكلّ المرجعي (C223)
   د4 الكسر على القطعة المستقيمة (C224) · د5 الكسور المتكافئة (C225) · د6 المقارنة: المقام نفسه، والبسط نفسه، والمرجع النصف (C226)
   د7 المقارنة بالتكافؤ على شريط الاثني عشر والترتيب (C226، منقولان من د6 لأنه فوق السقف بخمس أفكار، D248)
   د8 الكسر من مجموعة (C227) ومشروع «كعكة الحفلة» · د9 مخبز فوضى: المراجعة والاختبار (14)
   الكسر [a، b]: a البسط وb المقام، ويُكتب بسطاً فوق خطّ فوق مقام. ما يُلمس 70 وحدة على الأقل (56 بكسلاً على أضيق شاشة)، فالتلوين على دائرة أو شبكة لا على شريط رفيع.
   ===================================================================== */
const FRC = { cake: '#fff3df', edge: '#7a4a2a', shade: '#e9894a', shade2: '#c8392d', cream: '#f7d9a8', grid: '#e8d5b8', line: '#3d6b8c', ink: '#33454c', ok: '#2f9d6b' };
/* الكسر مكتوباً: البسط فوق خطّ فوق المقام */
function fracText(parent, x, y, [a, b], o = {}) { const g = el('g', { 'pointer-events': 'none', 'data-frac': a + '/' + b }, parent), fs = o.fs || 22, col = o.color || FRC.ink, w = Math.max(String(a).length, String(b).length) * fs * .62 + 10;
  const t1 = el('text', { x, y: y - 5, 'text-anchor': 'middle', 'font-size': fs, 'font-weight': 800, fill: col, direction: 'ltr' }, g); t1.textContent = String(a);
  geoLine(g, x - w / 2, y + 2, x + w / 2, y + 2, { color: col, w: 2.4 });
  const t2 = el('text', { x, y: y + fs + 4, 'text-anchor': 'middle', 'font-size': fs, 'font-weight': 800, fill: col, direction: 'ltr' }, g); t2.textContent = String(b); return g; }
const fracIcon = f => `<svg viewBox="0 0 40 48" width="34" height="42" aria-hidden="true"><text x="20" y="19" text-anchor="middle" font-size="18" font-weight="800" fill="${FRC.ink}">${f[0]}</text><line x1="7" y1="24" x2="33" y2="24" stroke="${FRC.ink}" stroke-width="2.4"/><text x="20" y="43" text-anchor="middle" font-size="18" font-weight="800" fill="${FRC.ink}">${f[1]}</text></svg>`;
const frKey = f => f[0] + '_' + f[1], frVal = f => f[0] / f[1], frLine = f => `gen.fr.n.${f[0]}.${f[1]}`;
const frOpt = f => [frKey(f), labelText('fr.' + f[0] + '.' + f[1]), fracIcon(f), frLine(f)];
async function sayFrac(f, opt = {}) { return S(frLine(f), { append: true, ...opt }); }
/* ---------- الأشكال المقسّمة ----------
   k: bar (شريط) | circle (دائرة بقطاعات) | grid (شبكة cols×rows) | cake (مستطيل كعكة بشرائح رأسية)
   n عدد الأجزاء، وparts (اختياري) أنصبة غير متساوية مجموعها 1، وshade أرقام الأجزاء الملوّنة، وrot لدوران الدائرة */
function fracShape(parent, spec, C = [180, 116], o = {}) { const g = el('g', { 'data-fshape': spec.k }, parent), n = spec.n, parts = spec.parts || Array(n).fill(1 / n), P = [], sh = new Set(spec.shade || []), fill = i => sh.has(i) ? (o.shade || FRC.shade) : (o.fill || FRC.cake);
  if (spec.k === 'circle') { const R = o.r || spec.r || 74; let a0 = (spec.rot || 0) - 90;
    parts.forEach((p, i) => { const a1 = a0 + p * 360, A = a => [C[0] + R * Math.cos(a * Math.PI / 180), C[1] + R * Math.sin(a * Math.PI / 180)], s = A(a0), e = A(a1), big = p > .5 ? 1 : 0, pg = el('g', { 'data-part': i }, g);
      const path = p >= .999 ? el('circle', { cx: C[0], cy: C[1], r: R, fill: fill(i), stroke: FRC.edge, 'stroke-width': 3 }, pg) : el('path', { d: `M${C[0]} ${C[1]} L${s[0]} ${s[1]} A${R} ${R} 0 ${big} 1 ${e[0]} ${e[1]} Z`, fill: fill(i), stroke: FRC.edge, 'stroke-width': 3, 'stroke-linejoin': 'round' }, pg);
      const mid = A((a0 + a1) / 2); pg.c = [C[0] + (mid[0] - C[0]) * .58, C[1] + (mid[1] - C[1]) * .58]; pg.shape = path; P.push(pg); a0 = a1; }); }
  else if (spec.k === 'grid') { const cols = spec.cols, rows = spec.rows, c = o.c || spec.c || Math.min(72, 288 / cols, (o.h || 200) / rows), x0 = C[0] - cols * c / 2, y0 = C[1] - rows * c / 2;
    for (let i = 0; i < cols * rows; i++) { const r = Math.floor(i / cols), q = i % cols, pg = el('g', { 'data-part': i }, g); pg.shape = el('rect', { x: x0 + q * c, y: y0 + r * c, width: c, height: c, fill: (spec.colors && spec.colors[i]) || fill(i), stroke: FRC.edge, 'stroke-width': 2 }, pg); pg.c = [x0 + (q + .5) * c, y0 + (r + .5) * c]; P.push(pg); }
    el('rect', { x: x0, y: y0, width: cols * c, height: rows * c, fill: 'none', stroke: FRC.edge, 'stroke-width': 3.4, 'pointer-events': 'none' }, g); g.box = [x0, y0, cols * c, rows * c]; g.c = c; }
  else { const W = o.w || spec.w || (spec.k === 'cake' ? 260 : 280), H = o.h || spec.h || (spec.k === 'cake' ? 110 : 46), x0 = C[0] - W / 2, y0 = C[1] - H / 2; let x = x0 + W;   /* من اليمين: الجزء الأول أوّل ما يُقرأ */
    if (spec.k === 'cake') el('rect', { x: x0 - 6, y: y0 + H - 4, width: W + 12, height: 12, rx: 6, fill: '#d9c3a0', 'pointer-events': 'none' }, g);
    parts.forEach((p, i) => { const w = p * W, pg = el('g', { 'data-part': i }, g); pg.shape = el('rect', { x: x - w, y: y0, width: w, height: H, fill: fill(i), stroke: FRC.edge, 'stroke-width': 2.6 }, pg); pg.c = [x - w / 2, y0 + H / 2]; P.push(pg); x -= w; });
    if (spec.k === 'cake') el('path', { d: `M${x0} ${y0 + 6} q ${W / 8} -14 ${W / 4} 0 t ${W / 4} 0 t ${W / 4} 0 t ${W / 4} 0`, fill: 'none', stroke: FRC.cream, 'stroke-width': 7, 'stroke-linecap': 'round', 'pointer-events': 'none' }, g);
    g.box = [x0, y0, W, H]; }
  g.P = P; g.shadeSet = (i, on) => { const p = P[i]; if (p) p.shape.setAttribute('fill', on ? (o.shade || FRC.shade) : (o.fill || FRC.cake)); }; return g; }
const frStage = (H = 240) => { const svg = newStage(H, { oasis: false, ground: 0 }); plyFrame(svg, H - 28); return svg; };
/* خيارات كسور: الصحيح ومشتّتات الأخطاء الشائعة، ثم ما يكمل ثلاثة */
function frOpts(want, errs = []) { const out = [want], has = f => out.some(g => g[0] === f[0] && g[1] === f[1]);
  const okD = d => [2, 3, 4, 5, 6, 8, 10, 12].includes(d);   /* مقامات الوحدة وحدها (لا سبع ولا تسع ولا واحد في المشتّتات) */
  for (const f of errs) if (f && f[0] > 0 && f[0] <= 10 && okD(f[1]) && !has(f) && out.length < 3) out.push(f);
  for (const f of [[want[0] + 1, want[1]], [want[0], want[1] + 1], [Math.max(1, want[0] - 1), want[1]], [want[0], Math.max(2, want[1] - 1)], [want[0], want[1] + 2], [want[0] + 2, want[1]]]) if (out.length < 3 && !has(f) && okD(f[1]) && f[0] <= f[1] + 1 && !(f[0] === 2 && f[1] === 10)) out.push(f);   /* «عشران» يلتبس بالعشرة (4ب17) */
  return shuffle(out); }
const frAsk = (opts, want) => choosePick(opts.map(frOpt), frKey(want));
const frParse = k => k.split('_').map(Number);
/* بند اختيار عام: draw يرسم، opts الخيارات، errOf الخطأ */
const frItem = d => ({
  make(spec) { const it = { ...spec, ...d.make(spec) }; return it; },
  async ask(item, mode, tries) { const svg = frStage(d.H || 240), ctx = d.draw(svg, item, tries) || {}; ctx.svg = svg;
    if (tries >= 3) { await S(d.tLine); if (d.together) await d.together(item, ctx); } else await S(item.q, { noGap: !!d.sayQ }); if (d.sayQ && tries < 3) await d.sayQ(item);
    const k = await (d.pick ? d.pick(item) : frAsk(d.opts(item), item.want)); return { ans: k, ctx }; },
  judge(item, k) { const w = Array.isArray(item.want) ? frKey(item.want) : item.want; return k === w ? { ok: true } : { ok: false, err: d.errOf(item, k) }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { await S(d.hint); }, async together() {},
  async reveal(item, r) { if (d.show) await d.show(item, r.ctx); await S(typeof d.rLine === 'function' ? d.rLine(item) : d.rLine, { noGap: !!d.rSay }); if (d.rSay) await d.rSay(item); },
  praise: () => d.praise || 'praiseThink', twin(item) { return item.twin || null; } });
/* الأجزاء تُعدّ: شارة على كل جزء (الكلّ أو الملوّن) */
async function frCountParts(svg, Sh, idx, col) { const m = helpG(svg); let n = 0; for (const i of idx) { n++; const p = Sh.P[i]; badge(m, p.c[0], p.c[1], n, col || css('--think')); SFX.tick(); await S(numw(n), { noGap: true, num: true }); } return m; }

/* ================= ① أيّ الأشكال أجزاؤه متساوية؟ (C220): figs ثلاثة أشكال، وواحد منها فقط متساوي الأجزاء ================= */
ITEM.fracEqual = {
  make(spec) { const ok = spec.figs.findIndex(f => !f.parts); /*T*/if (TESTHOOK && spec.figs.filter(f => !f.parts).length !== 1) testBug('fracEqual: شكل واحد متساوي الأجزاء');/*/T*/ return { ...spec, want: ok, tag: 'frac-equal' }; },
  async ask(item, mode, tries) { const svg = frStage(232), X = [292, 180, 68], T = item.figs.map((f, i) => { const g = el('g', {}, svg); el('rect', { x: X[i] - 54, y: 34, width: 108, height: 164, rx: 14, fill: '#fffdf6', stroke: css('--line'), 'stroke-width': 2 }, g);
      fracShape(g, f, [X[i], 116], { r: 44, w: 90, h: f.k === 'bar' ? 40 : 70, c: 30 }); return { g, k: i, label: labelText('frFig' + (i + 1)) }; });
    if (tries >= 3) { const m = helpG(svg); item.figs.forEach((f, i) => { const t = el('text', { x: X[i], y: 216, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: css('--think') }, m); t.textContent = labelText(f.parts ? 'frUneq' : 'frEq'); }); await S('gen.fr.together.equal'); } else await S(item.q);
    const k = await tapOne(T, { ok: item.want, pad: 76 }); return { ans: k, ctx: { svg } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'unequalParts' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.fr.hint.equal'); }, async together() {},
  async reveal() { await S('gen.fr.reveal.equal'); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};
/* ================= ② هل القطع متساوية؟ (C220): fig شكل واحد ================= */
ITEM.fairCut = frItem({ tLine: 'gen.fr.together.fair', hint: 'gen.fr.hint.fair', rLine: it => 'gen.fr.reveal.fair.' + it.want,
  make: s => ({ want: s.fig.parts ? 'no' : 'yes', tag: 'fair-cut' }),
  draw(svg, item) { return { Sh: fracShape(svg, item.fig, [180, 118], { r: 80, h: item.fig.k === 'bar' ? 50 : undefined }) }; },
  async together(item, ctx) { const m = helpG(ctx.svg); /* نصف شفّاف لأول جزء فوق كل جزء: المطابقة بالعين */ ctx.Sh.P.forEach((p, i) => { const t = el('text', { x: p.c[0], y: p.c[1] + 6, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: css('--think'), direction: 'ltr' }, m); t.textContent = item.fig.parts ? Math.round(item.fig.parts[i] * 100) / 100 === Math.round(item.fig.parts[0] * 100) / 100 ? '=' : '≠' : '='; }); },
  pick: item => choosePick([['yes', labelText('frYes'), '<i></i>', 'gen.fr.yes'], ['no', labelText('frNo'), '<i></i>', 'gen.fr.no']], item.want),
  errOf: it => it.want === 'yes' ? 'equalMissed' : 'unequalParts' });
/* ================= ③ ما اسم الجزء؟ (C220): fig بأجزاء متساوية وجزء ملوّن، والجواب نصف أو ثلث أو ربع ================= */
ITEM.partName = frItem({ tLine: 'gen.fr.together.name', hint: 'gen.fr.hint.name', rLine: 'gen.fr.reveal.name', rSay: it => sayFrac([1, it.fig.n]),
  make: s => ({ want: 'n' + s.fig.n, tag: 'part-name' }),
  draw(svg, item) { return { Sh: fracShape(svg, { ...item.fig, shade: [0] }, [180, 118], { r: 80 }) }; },
  async together(item, ctx) { await frCountParts(ctx.svg, ctx.Sh, ctx.Sh.P.map((p, i) => i)); },
  pick: item => choosePick([2, 3, 4].map(n => ['n' + n, labelText('fr.1.' + n), fracIcon([1, n]), frLine([1, n])]), item.want),
  errOf: (it, k) => +k.slice(1) === it.fig.n - 1 || +k.slice(1) === it.fig.n + 1 ? 'nameCount' : 'nameOff' });
/* ================= ④ اكتب الكسر الملوّن (C221): fig وshade ================= */
ITEM.fracRead = frItem({ tLine: 'gen.fr.together.read', hint: 'gen.fr.hint.read', rLine: 'gen.fr.reveal.read', rSay: it => sayFrac(it.want),
  make: s => { const a = s.fig.shade.length, b = s.fig.n; return { want: [a, b], tag: 'frac-read' }; },
  opts: it => frOpts(it.want, [[it.want[1], it.want[0]], it.want[1] > it.want[0] ? [it.want[0], it.want[1] - it.want[0]] : null]),
  draw(svg, item) { return { Sh: fracShape(svg, item.fig, [180, 116], { r: 80 }) }; },
  async together(item, ctx) { await S('gen.fr.allParts'); await frCountParts(ctx.svg, ctx.Sh, ctx.Sh.P.map((p, i) => i), css('--compass')); },
  errOf: (it, k) => { const [a, b] = frParse(k); return a === it.want[1] && b === it.want[0] ? 'fracFlip' : b === it.want[1] - it.want[0] && a === it.want[0] ? 'fracVsRest' : 'fracOff'; } });
/* ================= ⑤ لوّن الكسر (C221، إنتاج): fig بلا تلوين، وf الكسر المطلوب ================= */
ITEM.fracColor = {
  make(spec) { return { ...spec, want: spec.f[0], tag: 'frac-color-' + spec.fig.k }; },
  async ask(item, mode, tries) { const svg = frStage(262), Sh = fracShape(svg, { ...item.fig, shade: [] }, [180, 128], { r: 104, c: 72 }), on = new Set();
    fracText(svg, 324, 46, item.f, { fs: 20 });
    if (tries >= 3) { const m = helpG(svg); Sh.P.forEach((p, i) => { if (i < item.f[0]) el('circle', { cx: p.c[0], cy: p.c[1], r: 7, fill: 'none', stroke: css('--think'), 'stroke-width': 3 }, m); }); await S('gen.fr.together.color', { noGap: true }); } else await S(item.q, { noGap: true });
    await sayFrac(item.f);
    const tog = i => { if (on.has(i)) on.delete(i); else on.add(i); Sh.shadeSet(i, on.has(i)); SFX.tick(); /*T*/window.__frOn = [...on];/*/T*/ };
    Sh.P.forEach((p, i) => { p.setAttribute('role', 'button'); p.setAttribute('tabindex', 0); p.setAttribute('aria-label', plain(labelText('frPart')) + ' ' + DG(i + 1)); p.style.cursor = 'pointer'; p.onclick = () => tog(i); p.onkeydown = e => { if (isActKey(e)) { e.preventDefault(); tog(i); } }; });
    /*T*/window.__frPartAt = i => { const r = Sh.P[i].shape.getBoundingClientRect(), m = svg.getScreenCTM(), c = Sh.P[i].c; return { x: m.a * c[0] + m.e, y: m.d * c[1] + m.f }; }; window.__frWant = item.f[0];/*/T*/
    AUTO({ kind: 'frColor', ok: () => { while (on.size > item.f[0]) tog([...on][0]); for (let i = 0; on.size < item.f[0]; i++) if (!on.has(i)) tog(i); rulDoneBtn().click(); }, wrong: () => { for (let i = 0; i < item.fig.n - item.f[0] && on.size < item.fig.n - item.f[0]; i++) if (!on.has(i)) tog(i); if (on.size === item.f[0]) tog(on.size); rulDoneBtn().click(); } });
    await rulDone(() => Sh.P.forEach(p => { p.onclick = null; p.onkeydown = null; p.removeAttribute('role'); }));
    return { ans: on.size, ctx: { svg, Sh, on } }; },
  judge(item, n) { return n === item.f[0] ? { ok: true } : { ok: false, err: n === item.fig.n - item.f[0] ? 'colorRest' : 'colorOff' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.fr.hint.color'); }, async together() {},
  async reveal(item, r) { r.ctx.Sh.P.forEach((p, i) => r.ctx.Sh.shadeSet(i, i < item.f[0])); await S('gen.fr.reveal.color', { noGap: true }); await sayFrac(item.f); },
  praise: () => 'praiseNewWay', twin(item) { return item.twin || null; },
};
/* ================= ⑥ من اسمه إلى رمزه (C221): f يُقال ويُكتب اسمه ================= */
ITEM.fracName = frItem({ tLine: 'gen.fr.together.nameF', hint: 'gen.fr.hint.nameF', rLine: 'gen.fr.reveal.nameF', sayQ: it => sayFrac(it.f), rSay: it => sayFrac(it.f),
  make: s => ({ want: s.f, tag: 'frac-name' }),
  opts: it => frOpts(it.f, [[it.f[1], it.f[0]]]),
  draw(svg, item, tries) { const t = el('text', { x: 180, y: 110, 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: FRC.ink }, svg); t.textContent = labelText('fr.' + item.f[0] + '.' + item.f[1]);
    if (tries >= 3) { const m = helpG(svg), t2 = el('text', { x: 180, y: 160, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: css('--think') }, m); t2.textContent = labelText('frDenIs') + ' ' + item.f[1] + ' · ' + labelText('frNumIs') + ' ' + item.f[0]; } return {}; },
  errOf: (it, k) => { const [a, b] = frParse(k); return a === it.f[1] && b === it.f[0] ? 'fracFlip' : 'fracOff'; } });
/* ================= ⑦ الوحدوي والواحد الصحيح (C222): ask: unit | whole | notUnit، opts الكسور ================= */
ITEM.unitFrac = frItem({ tLine: 'gen.fr.together.unit', hint: 'gen.fr.hint.unit', rLine: it => 'gen.fr.reveal.unit.' + it.ask, rSay: it => sayFrac(it.want),
  make: s => { const w = s.opts.find(f => s.ask === 'whole' ? f[0] === f[1] : s.ask === 'unit' ? f[0] === 1 : f[0] !== 1 && f[0] !== f[1]); /*T*/if (TESTHOOK && s.opts.filter(f => s.ask === 'whole' ? f[0] === f[1] : s.ask === 'unit' ? f[0] === 1 : f[0] !== 1 && f[0] !== f[1]).length !== 1) testBug('unitFrac: جواب واحد');/*/T*/ return { want: w, tag: 'unit-frac-' + s.ask }; },
  opts: it => shuffle(it.opts),
  draw(svg, item, tries) { const X = [292, 180, 68]; item.opts.forEach((f, i) => { fracShape(svg, { k: 'circle', n: f[1], shade: [...Array(f[0]).keys()] }, [X[i], 108], { r: 46 }); if (tries >= 3) fracText(helpG(svg), X[i], 184, f, { fs: 18, color: css('--think') }); }); return {}; },
  errOf: (it, k) => it.ask === 'whole' ? 'wholeMissed' : 'unitMissed' });
/* ================= ⑧ هل الجزآن نصفان؟ (C223): rows على الشبكة، a وb للقسمين ================= */
const halfCells = rows => { let a = 0, b = 0; rows.forEach(r => [...r].forEach(ch => { if (ch === 'a') a++; else if (ch === 'b') b++; })); return [a, b]; };
function halfGridAt(parent, rows, C = [180, 116], o = {}) { const H = rows.length, W = rows[0].length, c = o.c || Math.min(40, 260 / W, 170 / H), x0 = C[0] - W * c / 2, y0 = C[1] - H * c / 2, g = el('g', { 'pointer-events': 'none' }, parent);
  rows.forEach((r, y) => [...r].forEach((ch, x) => el('rect', { x: x0 + x * c, y: y0 + y * c, width: c, height: c, fill: ch === 'a' ? '#f2b98a' : ch === 'b' ? '#bfe0b5' : '#fff', stroke: '#c9b79c', 'stroke-width': 1.4 }, g)));
  el('rect', { x: x0, y: y0, width: W * c, height: H * c, fill: 'none', stroke: FRC.edge, 'stroke-width': 3 }, g); g.cells = (ch) => { const out = []; rows.forEach((r, y) => [...r].forEach((cc, x) => { if (cc === ch) out.push([x0 + (x + .5) * c, y0 + (y + .5) * c]); })); return out; }; return g; }
ITEM.halfGrid = frItem({ tLine: 'gen.fr.together.half', hint: 'gen.fr.hint.half', rLine: it => 'gen.fr.reveal.half.' + it.want,
  make: s => { const [a, b] = halfCells(s.rows); return { want: a === b ? 'yes' : 'no', na: a, nb: b, tag: 'half-grid' }; },
  draw(svg, item) { return { G: halfGridAt(svg, item.rows) }; },
  async together(item, ctx) { const m = helpG(ctx.svg); for (const [ch, col] of [['a', '#b35a1f'], ['b', '#2f7d4a']]) { const P = ctx.G.cells(ch); P.forEach(([x, y], i) => { const t = el('text', { x, y: y + 5, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, fill: col, direction: 'ltr' }, m); t.textContent = String(i + 1); }); SFX.tick(); await S(numw(P.length), { num: true }); } },
  pick: item => choosePick([['yes', labelText('frYes'), '<i></i>', 'gen.fr.yes'], ['no', labelText('frNo'), '<i></i>', 'gen.fr.no']], item.want),
  errOf: it => it.want === 'yes' ? 'halfShape' : 'halfCount' });
/* ================= ⑨ لوّن الكسر على الشبكة (C223، C227، إنتاج): cols، rows، f — أيّ مربعات بالعدد الصحيح ================= */
ITEM.cellColor = {
  make(spec) { const N = spec.cols * spec.rows, want = N * spec.f[0] / spec.f[1]; /*T*/if (TESTHOOK && want % 1) testBug('cellColor: الكسر لا يقسم الشبكة');/*/T*/ return { ...spec, N, want, tag: 'cell-color' }; },
  async ask(item, mode, tries) { const c = Math.min(72, 280 / item.cols), H = Math.max(270, item.rows * c + 76), svg = frStage(H), Sh = fracShape(svg, { k: 'grid', cols: item.cols, rows: item.rows, shade: [] }, [172, 38 + item.rows * c / 2 + 10], { c }), on = new Set();   /* مربع 70 وحدة فأكثر: 56 بكسلاً على أضيق شاشة، والمسرح يطول بالصفوف */
    fracText(svg, 330, 44, item.f, { fs: 20 });
    if (tries >= 3) { const m = helpG(svg), per = item.N / item.f[1], [x0, y0, W, Hh] = Sh.box; /* الشبكة مقسومة أجزاءً بعدد المقام: خطوط متقطعة */ for (let j = 1; j < item.f[1]; j++) { const k = j * per; if (k % item.cols === 0) { const yy = y0 + (k / item.cols) * Sh.c; geoLine(m, x0, yy, x0 + W, yy, { color: css('--think'), w: 4, dash: '8 5' }); } else if (item.cols % item.f[1] === 0) { const xx = x0 + W - j * (W / item.f[1]); geoLine(m, xx, y0, xx, y0 + Hh, { color: css('--think'), w: 4, dash: '8 5' }); } } await S('gen.fr.together.cells', { noGap: true }); }
    else await S(item.q, { noGap: true });
    await sayFrac(item.f);
    const tog = i => { if (on.has(i)) on.delete(i); else on.add(i); Sh.shadeSet(i, on.has(i)); SFX.tick(); /*T*/window.__frOn = [...on];/*/T*/ };
    Sh.P.forEach((p, i) => { p.setAttribute('role', 'button'); p.setAttribute('tabindex', 0); p.setAttribute('aria-label', plain(labelText('frSquare')) + ' ' + DG(i + 1)); p.style.cursor = 'pointer'; p.onclick = () => tog(i); p.onkeydown = e => { if (isActKey(e)) { e.preventDefault(); tog(i); } }; });
    /*T*/window.__frPartAt = i => { const m = svg.getScreenCTM(), c = Sh.P[i].c; return { x: m.a * c[0] + m.e, y: m.d * c[1] + m.f }; }; window.__frWant = item.want;/*/T*/
    AUTO({ kind: 'frColor', ok: () => { for (let i = 0; on.size < item.want; i++) if (!on.has(i)) tog(i); rulDoneBtn().click(); }, wrong: () => { for (let i = 0; on.size < item.f[0]; i++) if (!on.has(i)) tog(i); if (on.size === item.want) tog(item.N - 1); rulDoneBtn().click(); } });
    await rulDone(() => Sh.P.forEach(p => { p.onclick = null; p.onkeydown = null; p.removeAttribute('role'); }));
    return { ans: on.size, ctx: { svg, Sh, on } }; },
  judge(item, n) { return n === item.want ? { ok: true } : { ok: false, err: n === item.f[0] ? 'cellsNumerator' : 'cellsOff' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.fr.hint.cells'); }, async together() {},
  async reveal(item, r) { r.ctx.Sh.P.forEach((p, i) => r.ctx.Sh.shadeSet(i, i < item.want)); await S('gen.fr.reveal.cells', { noGap: true }); await S(numw(item.want), { num: true, append: true }); },
  praise: () => 'praiseNewWay', twin(item) { return item.twin || null; },
};
/* ================= ⑩ الكلّ المرجعي (C223): big وsmall كعكتان، وf كسر واحد منهما ================= */
ITEM.wholeRef = frItem({ tLine: 'gen.fr.together.whole', hint: 'gen.fr.hint.whole', rLine: 'gen.fr.reveal.whole',
  make: s => ({ want: 'big', tag: 'whole-ref' }),
  draw(svg, item) { const n = item.f[1], sh = [...Array(item.f[0]).keys()]; fracShape(svg, { k: 'circle', n, shade: sh }, [262, 112], { r: 74 }); fracShape(svg, { k: 'circle', n, shade: sh }, [92, 126], { r: 40 });
    [[262, 'frBig'], [92, 'frSmall']].forEach(([x, k]) => { const t = el('text', { x, y: 214, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: FRC.ink }, svg); t.textContent = labelText(k); }); return {}; },
  async together(item, ctx) { const m = helpG(ctx.svg); el('circle', { cx: 262, cy: 112, r: 80, fill: 'none', stroke: css('--think'), 'stroke-width': 3, 'stroke-dasharray': '6 5' }, m); el('circle', { cx: 92, cy: 126, r: 46, fill: 'none', stroke: css('--think'), 'stroke-width': 3, 'stroke-dasharray': '6 5' }, m); },
  pick: item => choosePick([['big', labelText('frOfBig'), '<i></i>', 'gen.fr.ofBig'], ['small', labelText('frOfSmall'), '<i></i>', 'gen.fr.ofSmall'], ['eq', labelText('frSame'), '<i></i>', 'gen.fr.same']], item.want),
  errOf: (it, k) => k === 'eq' ? 'wholeIgnored' : 'wholeOff' });
/* ================= ⑪ الكسر على القطعة (C224): b أجزاء، والسهم عند a ================= */
const FL = { x0: 50, x1: 310, y: 130 };
function fracLine(parent, b, o = {}) { const g = el('g', { 'pointer-events': 'none' }, parent), X = i => FL.x0 + (FL.x1 - FL.x0) * i / b;
  el('rect', { x: FL.x0, y: FL.y - 10, width: FL.x1 - FL.x0, height: 20, rx: 4, fill: '#f7ead2', stroke: FRC.edge, 'stroke-width': 2 }, g);
  for (let i = 0; i <= b; i++) { geoLine(g, X(i), FL.y - 18, X(i), FL.y + 18, { color: FRC.edge, w: i === 0 || i === b ? 3.4 : 2.4 }); }
  [[0, '0'], [b, '1']].forEach(([i, s]) => { const t = el('text', { x: X(i), y: FL.y + 44, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: FRC.ink }, g); t.textContent = s; });
  g.X = X; return g; }
const fracArrow = (parent, x, col = FRC.shade2) => { const g = el('g', { 'pointer-events': 'none' }, parent); el('path', { d: `M${x} ${FL.y - 22} l-10 -18 h20 Z`, fill: col }, g); el('rect', { x: x - 3, y: FL.y - 62, width: 6, height: 24, fill: col }, g); return g; };
async function frHops(svg, Ln, a, b) { const m = helpG(svg); for (let i = 0; i < a; i++) { const x1 = Ln.X(i), x2 = Ln.X(i + 1); el('path', { d: `M${x1} ${FL.y - 12} Q${(x1 + x2) / 2} ${FL.y - 46} ${x2} ${FL.y - 12}`, fill: 'none', stroke: css('--compass'), 'stroke-width': 3 }, m); badge(m, (x1 + x2) / 2, FL.y - 50, i + 1, css('--compass')); SFX.tick(); await S(numw(i + 1), { noGap: true, num: true }); } return m; }
ITEM.lineRead = frItem({ tLine: 'gen.fr.together.line', hint: 'gen.fr.hint.line', rLine: 'gen.fr.reveal.line', rSay: it => sayFrac(it.want), H: 232,
  make: s => ({ want: [s.a, s.b], tag: 'line-read' }),
  opts: it => frOpts(it.want, [it.a + 1 <= it.b ? [it.a + 1, it.b] : null, [2, 3, 4, 5, 6, 8, 10, 12].includes(it.b + 1) ? [it.a, it.b + 1] : null]),
  draw(svg, item) { const Ln = fracLine(svg, item.b); fracArrow(svg, Ln.X(item.a)); return { Ln }; },
  async together(item, ctx) { await frHops(ctx.svg, ctx.Ln, item.a, item.b); },
  errOf: (it, k) => { const [a, b] = frParse(k); return b === it.b && a === it.a + 1 ? 'countMarks' : b === it.b + 1 ? 'countMarksDen' : 'fracOff'; } });
/* ================= ⑫ ضع الكسر على القطعة (C224، إنتاج): a وb ================= */
ITEM.linePlace = {
  make(spec) { return { ...spec, want: spec.a, tag: 'line-place' }; },
  async ask(item, mode, tries) { const svg = frStage(232), Ln = fracLine(svg, item.b); let cur = null, arrow = null; fracText(svg, 324, 48, [item.a, item.b], { fs: 20 });
    const set = i => { cur = Math.max(0, Math.min(item.b, i)); if (arrow) arrow.remove(); arrow = fracArrow(svg, Ln.X(cur), FRC.line); SFX.tick(); /*T*/window.__lpCur = cur;/*/T*/ };
    if (tries >= 3) await frHops(svg, Ln, item.a - 1, item.b);
    await S(tries >= 3 ? 'gen.fr.together.place' : item.q, { noGap: true }); await sayFrac([item.a, item.b]);
    const input = fingerInput(svg, { map: e => { const p = svgPoint(svg, e); return [p.x, p.y]; }, down(q) { if (q[1] < FL.y - 70 || q[1] > FL.y + 60) return false; set(Math.round((q[0] - FL.x0) / (FL.x1 - FL.x0) * item.b)); return false; }, move() {}, up() {} });
    const kg = el('g', { role: 'group', 'aria-label': labelText('frLine') }, svg); for (let i = 0; i <= item.b; i++) { const b = el('g', { role: 'button', tabindex: 0, 'aria-label': `${DG(i)} / ${DG(item.b)}` }, kg); el('circle', { cx: Ln.X(i), cy: FL.y, r: 8, fill: 'transparent', 'pointer-events': 'none' }, b); b.onkeydown = e => { if (isActKey(e)) { e.preventDefault(); set(i); } }; }
    /*T*/window.__lpAt = i => { const m = svg.getScreenCTM(), x = Ln.X(i); return { x: m.a * x + m.e, y: m.d * FL.y + m.f }; }; window.__lpWant = item.a;/*/T*/
    AUTO({ kind: 'linePlace', ok: () => { set(item.a); rulDoneBtn().click(); }, wrong: () => { set(item.a - 1); rulDoneBtn().click(); } });
    await rulDone(() => { input.off(); kg.remove(); }); return { ans: cur, ctx: { svg, Ln, set } }; },
  judge(item, i) { return i === item.a ? { ok: true } : { ok: false, err: i === item.a - 1 ? 'countMarks' : i === item.a + 1 ? 'fromOne' : 'placeOff' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.fr.hint.place'); }, async together() {},
  async reveal(item, r) { r.ctx.set(item.a); await S('gen.fr.reveal.place', { noGap: true }); await sayFrac([item.a, item.b]); },
  praise: () => 'praiseMeasure', twin(item) { return item.twin || null; },
};
/* ================= ⑬ الشريطان المتكافئان (C225): f ملوّن على شريط، وm أجزاء الشريط الثاني؛ كم جزءاً منه؟ ================= */
function frStrips(svg, rows, o = {}) { const W = o.w || 260, H = o.h || 34, gap = o.gap || 16, y0 = o.y0 || 50, cx = o.cx || 200, out = []; rows.forEach(([n, sh], j) => { const S0 = fracShape(svg, { k: 'bar', n, shade: [...Array(sh).keys()] }, [cx, y0 + j * (H + gap) + H / 2], { w: W, h: H }); out.push(S0); }); return out; }   /* الكسر مكتوب يساراً عند x≈40، والأشرطة من 70 إلى 330 */
ITEM.eqvFill = {
  make(spec) { const want = spec.f[0] * spec.m / spec.f[1]; /*T*/if (TESTHOOK && want % 1) testBug('eqvFill: لا كسر مكافئ');/*/T*/ return { ...spec, want, tag: 'eqv-fill' }; },
  async ask(item, mode, tries) { const svg = frStage(232), [A, B] = frStrips(svg, [[item.f[1], item.f[0]], [item.m, 0]], { y0: 60, h: 40, gap: 30, cx: 204, w: 250 });
    fracText(svg, 40, 70, item.f, { fs: 16 }); const q = el('text', { x: 40, y: 150, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: css('--think') }, svg); q.textContent = '؟/' + item.m;
    if (tries >= 3) { const m = helpG(svg), x = A.box[0] + A.box[2] * (1 - item.f[0] / item.f[1]); geoLine(m, x, 52, x, 200, { color: css('--think'), w: 3, dash: '7 5' }); await S('gen.fr.together.eqv'); } else { await S(item.q, { noGap: true }); await sayFrac(item.f); }
    const add = item.f[0] + item.m - item.f[1], np = numberPick(shuffle([...fillOpts(new Set([item.want].concat(add >= 1 && add <= item.m && add !== item.want ? [add] : [])), item.want, 1, item.m)].slice(0, 3)), item.want, { west: true }); return { ans: await np.p, ctx: { svg, B, np } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: k === item.f[0] + (item.m - item.f[1]) ? 'addSame' : k === item.f[0] ? 'eqvSameNum' : 'eqvOff' }; },
  onOk: numItem.onOk, onWrong: numItem.onWrong,
  async hint2() { await S('gen.fr.hint.eqv'); }, async together() {},
  async reveal(item, r) { for (let i = 0; i < item.want; i++) r.ctx.B.shadeSet(i, true); await S('gen.fr.reveal.eqv', { noGap: true }); await sayFrac([item.want, item.m]); },
  praise: () => 'praiseThink', twin(item) { return item.twin || null; },
};
/* ================= ⑭ أيّ الكسور يساوي هذا؟ (C225): f، وopts ثلاثة كسور واحد منها مكافئ ================= */
ITEM.eqvPick = frItem({ tLine: 'gen.fr.together.eqvP', hint: 'gen.fr.hint.eqvP', rLine: 'gen.fr.reveal.eqvP', rSay: it => sayFrac(it.want), sayQ: it => sayFrac(it.f),
  make: s => { const w = s.opts.find(g => g[0] * s.f[1] === g[1] * s.f[0]); /*T*/if (TESTHOOK && s.opts.filter(g => g[0] * s.f[1] === g[1] * s.f[0]).length !== 1) testBug('eqvPick: مكافئ واحد');/*/T*/ return { want: w, tag: 'eqv-pick' }; },
  opts: it => shuffle(it.opts),
  draw(svg, item, tries) { fracShape(svg, { k: 'bar', n: item.f[1], shade: [...Array(item.f[0]).keys()] }, [196, 70], { w: 260, h: 40 }); fracText(svg, 40, 66, item.f, { fs: 16 });
    if (tries >= 3) { const m = helpG(svg); item.opts.forEach((g, j) => { fracShape(m, { k: 'bar', n: g[1], shade: [...Array(g[0]).keys()] }, [196, 122 + j * 34], { w: 260, h: 24 }); fracText(m, 40, 120 + j * 34, g, { fs: 11 }); }); } return {}; },
  errOf: (it, k) => { const [a, b] = frParse(k); return a - it.f[0] === b - it.f[1] ? 'addSame' : 'eqvOff'; } });
/* ================= ⑮ أيّهما أكبر؟ (C226): a وb كسران على شريطين متطابقين ================= */
ITEM.fracCmp = frItem({ tLine: 'gen.fr.together.cmp', hint: 'gen.fr.hint.cmp', rLine: it => 'gen.fr.reveal.cmp.' + it.want, H: 236,
  make: s => { const d = s.a[0] * s.b[1] - s.b[0] * s.a[1]; return { want: d === 0 ? 'eq' : d > 0 ? 'a' : 'b', tag: 'frac-cmp' + (s.a[1] === s.b[1] ? '-den' : s.a[0] === s.b[0] ? '-num' : '') }; },
  draw(svg, item, tries) { frStrips(svg, [[item.a[1], item.a[0]], [item.b[1], item.b[0]]], { y0: 54, h: 42, gap: 38, w: 250, cx: 204 });
    [[item.a, 75], [item.b, 155]].forEach(([f, y]) => fracText(svg, 46, y, f, { fs: 17 }));
    if (tries >= 3) { const m = helpG(svg); [[item.a, 54], [item.b, 134]].forEach(([f, y]) => { const x = 79 + 250 * (1 - f[0] / f[1]); geoLine(m, x, y - 6, x, y + 48, { color: css('--think'), w: 4 }); }); } return {}; },
  pick: item => choosePick([['a', labelText('frFirstF'), '<i></i>', 'gen.fr.firstF'], ['b', labelText('frSecondF'), '<i></i>', 'gen.fr.secondF'], ['eq', labelText('frEqual'), '<i></i>', 'gen.fr.equal']], item.want),
  errOf: (it, k) => it.a[0] === it.b[0] && k !== 'eq' ? 'biggerDen' : it.a[1] === it.b[1] ? 'frCmpOff' : k === 'eq' ? 'cmpEqWrong' : 'numOnly' });
/* ================= ⑯ أكبر من النصف أم أصغر؟ (C226): f ================= */
ITEM.halfBench = frItem({ tLine: 'gen.fr.together.bench', hint: 'gen.fr.hint.bench', rLine: it => 'gen.fr.reveal.bench.' + it.want, sayQ: it => sayFrac(it.f),
  make: s => { const d = 2 * s.f[0] - s.f[1]; return { want: d === 0 ? 'eq' : d > 0 ? 'more' : 'less', tag: 'half-bench' }; },
  draw(svg, item, tries) { fracText(svg, 180, 92, item.f, { fs: 34 }); if (tries >= 3) { const m = helpG(svg), S0 = fracShape(m, { k: 'bar', n: item.f[1], shade: [...Array(item.f[0]).keys()] }, [180, 176], { w: 260, h: 34 }); geoLine(m, 180, 150, 180, 202, { color: css('--think'), w: 4, dash: '6 4' }); } return {}; },
  pick: item => choosePick([['more', labelText('frMoreHalf'), '<i></i>', 'gen.fr.moreHalf'], ['less', labelText('frLessHalf'), '<i></i>', 'gen.fr.lessHalf'], ['eq', labelText('frIsHalf'), '<i></i>', 'gen.fr.isHalf']], item.want),
  errOf: (it, k) => 'benchOff' });
/* ================= ⑰ رتّب الكسور (C226، د7، إنتاج): fs ثلاثة أو أربعة كسور؛ يلمسها الطفل من الأصغر ================= */
const FO_XY = [[262, 84], [98, 84], [262, 194], [98, 194]];   /* أربع بطاقات: مربع اثنين في اثنين، وشريط كل بطاقة تحتها مباشرة */
ITEM.fracOrder = {
  make(spec) { const ord = spec.fs.map((f, i) => i).sort((i, j) => frVal(spec.fs[i]) - frVal(spec.fs[j])); return { ...spec, want: ord.join(','), tag: 'frac-order' }; },
  async ask(item, mode, tries) { const svg = frStage(item.fs.length === 3 ? 250 : 296), XY = item.fs.length === 3 ? [[276, 110], [180, 110], [84, 110]] : FO_XY, picked = [], badges = el('g', { 'pointer-events': 'none' }, svg);
    const cards = item.fs.map((f, i) => { const g = el('g', { role: 'button', tabindex: 0, 'aria-label': plain(labelText('fr.' + f[0] + '.' + f[1])), style: 'cursor:pointer' }, svg); el('rect', { x: XY[i][0] - 42, y: XY[i][1] - 44, width: 84, height: 88, rx: 14, fill: '#fffdf6', stroke: css('--line'), 'stroke-width': 2.5 }, g); fracText(g, XY[i][0], XY[i][1] - 2, f, { fs: 24 }); return g; });
    if (tries >= 3) { const m = helpG(svg); item.fs.forEach((f, i) => fracShape(m, { k: 'bar', n: f[1], shade: [...Array(f[0]).keys()] }, [XY[i][0], XY[i][1] + 54], { w: 76, h: 14 })); await S('gen.fr.together.order'); } else await S(item.q);
    /*T*/window.__foWant = item.want.split(',').map(Number); window.__foAt = i => { const r = cards[i].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };/*/T*/
    await gate(new Promise(res => { const pick = i => { if (picked.includes(i) || picked.length >= cards.length) return; picked.push(i); SFX.tick(); badge(badges, XY[i][0] + 38, XY[i][1] - 40, picked.length, css('--compass')); cards[i].querySelector('rect').setAttribute('fill', '#eef6fb'); if (picked.length === cards.length) { AUTO_CLEAR(); res(); } };
      cards.forEach((g, i) => { g.onclick = () => pick(i); g.onkeydown = e => { if (isActKey(e)) { e.preventDefault(); pick(i); } }; });
      AUTO({ kind: 'frOrder', ok: () => item.want.split(',').forEach(i => pick(+i)), wrong: () => [...item.want.split(',')].reverse().forEach(i => pick(+i)) }); }));
    cards.forEach(g => { g.onclick = null; g.onkeydown = null; g.removeAttribute('role'); }); return { ans: picked.join(','), ctx: { svg } }; },
  judge(item, k) { if (k === item.want) return { ok: true }; const byDen = item.fs.map((f, i) => i).sort((i, j) => item.fs[i][1] - item.fs[j][1]).join(','); return { ok: false, err: k === byDen ? 'biggerDen' : 'frOrderOff' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.fr.hint.order'); }, async together() {},
  async reveal() { await S('gen.fr.reveal.order'); },
  praise: () => 'praiseCompare', twin(item) { return item.twin || null; },
};
/* ================= ⑱ الكسر من مجموعة (C227): n أشياء (what: cookie | date | button)، وf ================= */
function frThing(parent, what, x, y, s = 1) { const g = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, parent);
  if (what === 'date') { el('ellipse', { cx: 0, cy: 0, rx: 11, ry: 17, fill: '#7a3f1d', transform: 'rotate(20)' }, g); el('ellipse', { cx: -3, cy: -6, rx: 3, ry: 6, fill: '#a8653a', transform: 'rotate(20)' }, g); }
  else if (what === 'button') { el('circle', { r: 15, fill: '#3d7cc0', stroke: '#2a5f94', 'stroke-width': 2 }, g); for (const [dx, dy] of [[-4, -4], [4, -4], [-4, 4], [4, 4]]) el('circle', { cx: dx, cy: dy, r: 2.2, fill: '#fff' }, g); }
  else { el('circle', { r: 17, fill: '#e2b26a', stroke: '#b9862a', 'stroke-width': 2 }, g); for (const [dx, dy] of [[-6, -5], [5, -7], [7, 4], [-4, 7], [0, 0]]) el('circle', { cx: dx, cy: dy, r: 2.6, fill: '#5a3a1a' }, g); }
  return g; }
/* المجموعة مصفوفة بمجموعات التوزيع: كل مجموعة صفّ متصل (per = n / b)، والمجموعات في عمود أو عمودين؛ فإطار كل مجموعة حول صفّه وحده */
function setLay(n, b, sp = 56, maxW = 300) { const per = n / b, gc = Math.max(1, Math.min(b, Math.floor((maxW + 24) / (per * sp + 24)))), gr = Math.ceil(b / gc), W = gc * per * sp + (gc - 1) * 24; return { per, gc, gr, W, H: gr * sp, at: (cx, cy) => [...Array(n).keys()].map(i => { const g = Math.floor(i / per), j = i % per, bx = g % gc, by = Math.floor(g / gc); return [cx + W / 2 - (bx * (per * sp + 24) + (j + .5) * sp), cy - gr * sp / 2 + (by + .5) * sp]; }) }; }
const setXY = (n, cx = 180, cy = 118, sp = 72, vy = sp * .8) => { const cols = n <= 4 ? n : n <= 8 ? 4 : n <= 12 ? (n % 4 === 0 ? 4 : n % 3 === 0 ? 3 : 4) : 5, rows = Math.ceil(n / cols); return [...Array(n).keys()].map(i => [cx + ((cols - 1) / 2 - i % cols) * sp, cy + (Math.floor(i / cols) - (rows - 1) / 2) * vy]); };
ITEM.setFrac = {
  make(spec) { const want = spec.n * spec.f[0] / spec.f[1]; /*T*/if (TESTHOOK && want % 1) testBug('setFrac: لا يقسم');/*/T*/ return { ...spec, want, tag: 'set-frac' }; },
  async ask(item, mode, tries) { const Ly = setLay(item.n, item.f[1], 50), svg = frStage(Math.max(240, Ly.H + 70)), P = Ly.at(170, 36 + Ly.H / 2), G = P.map(([x, y]) => frThing(svg, item.what || 'cookie', x, y, .9));
    fracText(svg, 326, 44, item.f, { fs: 18 });
    if (tries >= 3) { await S('gen.fr.together.set'); await frGroups(svg, G, item.n / item.f[1], item.f[0]); } else { await S(item.q, { noGap: true }); await sayFrac(item.f); }
    const np = numberPick(nearNums(item.want, item.n, 1), item.want, { west: true }); return { ans: await np.p, ctx: { svg, G, np } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: k === item.f[1] ? 'setDen' : k === item.n / item.f[1] && item.f[0] > 1 ? 'setOneGroup' : 'setOff' }; },
  onOk: numItem.onOk, onWrong: numItem.onWrong,
  async hint2() { await S('gen.fr.hint.set'); }, async together() {},
  async reveal(item, r) { await frGroups(r.ctx.svg, r.ctx.G, item.n / item.f[1], item.f[0]); await S('gen.fr.reveal.set', { noGap: true }); await S(numw(item.want), { num: true, append: true }); },
  praise: () => 'praiseCount', twin(item) { return item.twin || null; },
};
/* التوزيع: كل «per» أشياء مجموعة بإطار بلون، وأول a مجموعات مظلّلة */
async function frGroups(svg, G, per, a) { const m = helpG(svg), cols = ['#e9894a', '#3d7cc0', '#2f9d6b', '#9b59b6', '#c8392d', '#b9862a']; for (let k = 0; k * per < G.length; k++) { const grp = G.slice(k * per, (k + 1) * per), bb = grp.map(g => g.getBBox ? (() => { const t = g.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/); return [+t[1], +t[2]]; })() : [0, 0]);
    const xs = bb.map(p => p[0]), ys = bb.map(p => p[1]); el('rect', { x: Math.min(...xs) - 24, y: Math.min(...ys) - 22, width: Math.max(...xs) - Math.min(...xs) + 48, height: Math.max(...ys) - Math.min(...ys) + 44, rx: 14, fill: k < a ? cols[k % 6] : 'none', 'fill-opacity': k < a ? .22 : 0, stroke: cols[k % 6], 'stroke-width': 3 }, m); SFX.tick(); await sleep(FAST ? 10 : 260); } return m; }
/* ================= ⑲ لوّن كسراً من مجموعة (C227، إنتاج): n وf — يلمس الطفل الأشياء ================= */
ITEM.setColor = {
  make(spec) { const want = spec.n * spec.f[0] / spec.f[1]; return { ...spec, want, tag: 'set-color' }; },
  async ask(item, mode, tries) { const Ly = setLay(item.n, item.f[1], 72, 312), svg = frStage(Math.max(250, Ly.H + 92)), P = Ly.at(172, 60 + Ly.H / 2), on = new Set();   /* الأشياء متباعدة 72 أفقياً ورأسياً: هدف 56 بكسلاً بلا تراكب، ومرتّبة بمجموعات التوزيع */
    fracText(svg, 332, 34, item.f, { fs: 17 });
    const G = P.map(([x, y], i) => { const g = el('g', { role: 'button', tabindex: 0, 'aria-label': plain(labelText('frThing.' + (item.what || 'cookie'))) + ' ' + DG(i + 1), style: 'cursor:pointer' }, svg); el('circle', { cx: x, cy: y, r: 30, fill: '#fff', stroke: '#e6d6bb', 'stroke-width': 2 }, g); frThing(g, item.what || 'cookie', x, y, 1); g.ring = el('circle', { cx: x, cy: y, r: 30, fill: 'none', stroke: FRC.shade2, 'stroke-width': 0 }, g); hitPad(g, 72); return g; });
    if (tries >= 3) { await S('gen.fr.together.setC', { noGap: true }); await frGroups(svg, G.map((g, i) => { const t = el('g', { transform: `translate(${P[i][0]} ${P[i][1]})` }); return t; }), item.n / item.f[1], 0); } else await S(item.q, { noGap: true });
    await sayFrac(item.f);
    const tog = i => { if (on.has(i)) on.delete(i); else on.add(i); G[i].ring.setAttribute('stroke-width', on.has(i) ? 6 : 0); G[i].querySelector('circle').setAttribute('fill', on.has(i) ? '#fde3cf' : '#fff'); SFX.tick(); /*T*/window.__frOn = [...on];/*/T*/ };
    G.forEach((g, i) => { g.onclick = () => tog(i); g.onkeydown = e => { if (isActKey(e)) { e.preventDefault(); tog(i); } }; });
    /*T*/window.__frPartAt = i => { const m = svg.getScreenCTM(), [x, y] = P[i]; return { x: m.a * x + m.e, y: m.d * y + m.f }; }; window.__frWant = item.want;/*/T*/
    AUTO({ kind: 'frColor', ok: () => { for (let i = 0; on.size < item.want; i++) if (!on.has(i)) tog(i); rulDoneBtn().click(); }, wrong: () => { for (let i = 0; on.size < item.f[0]; i++) if (!on.has(i)) tog(i); if (on.size === item.want) tog(item.n - 1); rulDoneBtn().click(); } });
    await rulDone(() => G.forEach(g => { g.onclick = null; g.onkeydown = null; g.removeAttribute('role'); }));
    return { ans: on.size, ctx: { svg, G } }; },
  judge(item, n) { return n === item.want ? { ok: true } : { ok: false, err: n === item.f[0] ? 'setNumerator' : 'setOff' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.fr.hint.setC'); }, async together() {},
  async reveal(item, r) { await S('gen.fr.reveal.set', { noGap: true }); await S(numw(item.want), { num: true, append: true }); },
  praise: () => 'praiseNewWay', twin(item) { return item.twin || null; },
};

/* ================= المشاهد ================= */
/* الإشعال: فوضى تقطع الكعكة قطعاً مختلفة وتقول «هذا ربع!» */
SCENES.chaosCake = async c => { const L = c.lines, svg = frStage(232); const Sh = fracShape(svg, { k: 'circle', n: 4, parts: [.4, .3, .2, .1] }, [190, 116], { r: 84 }); const fz = chaosAt(svg, 54, 60, .4); chaosGiggle(fz); await S(L[0]); Sh.shadeSet(3, true); await S(L[1]); if (L[2]) await S(L[2]); };
/* الطيّ: شريط يُطوى نصفين ثم أربعة، وينطبق الجزآن */
SCENES.frFoldStrip = async c => { const L = c.lines, svg = frStage(240); const A = fracShape(svg, { k: 'bar', n: 1 }, [180, 66], { w: 280, h: 40 }); await S(L[0]);
  const B = fracShape(svg, { k: 'bar', n: 2 }, [180, 126], { w: 280, h: 40 }); SFX.tick(); await sleep(FAST ? 10 : 500); B.shadeSet(0, true); await S(L[1]);
  const C4 = fracShape(svg, { k: 'bar', n: 4 }, [180, 186], { w: 280, h: 40 }); SFX.tick(); C4.shadeSet(0, true); if (L[2]) await S(L[2]); };
/* أسماء الأجزاء: نصف وثلث وربع، والأجزاء كلها واحد صحيح */
SCENES.partNames = async c => { const L = c.lines, svg = frStage(240), X = [292, 180, 68]; for (const [i, n] of [2, 3, 4].entries()) { fracShape(svg, { k: 'circle', n, shade: [0] }, [X[i], 104], { r: 48 }); const t = el('text', { x: X[i], y: 188, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: FRC.ink }, svg); t.textContent = labelText('fr.1.' + n); SFX.tick(); await sleep(FAST ? 10 : 400); } await S(L[0]); if (L[1]) { const s2 = frStage(240), Sh = fracShape(s2, { k: 'circle', n: 4 }, [180, 116], { r: 84 }); for (let i = 0; i < 4; i++) { Sh.shadeSet(i, true); SFX.tick(); await sleep(FAST ? 10 : 300); } await S(L[1]); } };
/* قراءة الكسر: كعكة بثمانية أجزاء أُكل منها ثلاثة */
SCENES.readFrac = async c => { const L = c.lines, svg = frStage(240), n = c.n || 8, a = c.a || 3, Sh = fracShape(svg, { k: 'circle', n }, [130, 120], { r: 84 }); await S(L[0]); for (let i = 0; i < a; i++) { Sh.shadeSet(i, true); SFX.tick(); await sleep(FAST ? 10 : 260); }
  fracText(svg, 294, 112, [a, n], { fs: 38 }); const lab = (y, k) => { const t = el('text', { x: 294, y, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: css('--compass') }, svg); t.textContent = labelText(k); }; lab(54, 'frNum'); lab(194, 'frDen'); await S(L[1]); if (L[2]) await S(L[2]); };
/* الواحد الصحيح: 4/4 */
SCENES.unitWhole = async c => { const L = c.lines, svg = frStage(232), Sh = fracShape(svg, { k: 'bar', n: c.n || 4 }, [180, 90], { w: 280, h: 46 }); await S(L[0]); for (let i = 0; i < (c.n || 4); i++) { Sh.shadeSet(i, true); SFX.tick(); await sleep(FAST ? 10 : 280); } fracText(svg, 150, 160, [c.n || 4, c.n || 4], { fs: 28 }); const t = el('text', { x: 222, y: 172, 'text-anchor': 'middle', 'font-size': 28, 'font-weight': 800, fill: FRC.ok, direction: 'ltr' }, svg); t.textContent = '= 1'; await S(L[1]); };
/* النصف بأشكال: أربع طرق لقسمة مربع الشبكة */
SCENES.halfWays = async c => { const L = c.lines, svg = frStage(250), ways = c.ways || [['aabb', 'aabb', 'aabb', 'aabb'], ['aaaa', 'aaaa', 'bbbb', 'bbbb'], ['abbb', 'aabb', 'aabb', 'aaab'], ['aaab', 'aabb', 'aabb', 'abbb']], XY = [[268, 76], [92, 76], [268, 176], [92, 176]];
  await S(L[0]); for (const [i, w] of ways.entries()) { halfGridAt(svg, w, XY[i], { c: 18 }); SFX.tick(); await sleep(FAST ? 10 : 450); } await S(L[1]); if (L[2]) await S(L[2]); };
/* الكلّ المرجعي: نصف الكبيرة ونصف الصغيرة */
SCENES.bigSmall = async c => { const L = c.lines, svg = frStage(232); fracShape(svg, { k: 'circle', n: 2, shade: [0] }, [262, 112], { r: 76 }); fracShape(svg, { k: 'circle', n: 2, shade: [0] }, [92, 128], { r: 40 }); await S(L[0]); if (L[1]) await S(L[1]); };
/* القطعة من 0 إلى 1: الأرباع على شريط 12 */
SCENES.lineIntro = async c => { const L = c.lines, svg = frStage(232), b = c.b || 4, Ln = fracLine(svg, b); await S(L[0]); await frHops(svg, Ln, b, b); await S(L[1]); if (L[2]) await S(L[2]); };
/* عدّ المسافات لا العلامات */
SCENES.spacesNotMarks = async c => { const L = c.lines, svg = frStage(232), b = c.b || 4, Ln = fracLine(svg, b), m = helpG(svg); for (let i = 0; i <= b; i++) { badge(m, Ln.X(i), FL.y + 74, i + 1, '#b0552f'); SFX.tick(); await sleep(FAST ? 10 : 200); } await S(L[0]); m.remove(); await frHops(svg, Ln, 1, b); fracArrow(svg, Ln.X(1)); await S(L[1]); };
/* التكافؤ بالطي: 1/2 = 2/4 = 4/8 */
SCENES.foldEqv = async c => { const L = c.lines, svg = frStage(250), rows = c.rows || [[2, 1], [4, 2], [8, 4]]; await S(L[0]); const St = []; for (const [j, r] of rows.entries()) { St.push(...frStrips(svg, [r], { y0: 46 + j * 62, h: 40 })); fracText(svg, 34, 60 + j * 62, [r[1], r[0]], { fs: 14 }); SFX.tick(); await sleep(FAST ? 10 : 500); } const m = helpG(svg); geoLine(m, 200, 36, 200, 214, { color: css('--think'), w: 3, dash: '7 5' }); await S(L[1]); if (L[2]) await S(L[2]); };
/* على الشبكة: 2/3 = 4/6 */
SCENES.gridEqv = async c => { const L = c.lines, svg = frStage(240); const A = fracShape(svg, { k: 'grid', cols: 3, rows: 1, shade: [0, 1] }, [180, 80], { c: 64 }); await S(L[0]); const B = fracShape(svg, { k: 'grid', cols: 3, rows: 2, shade: [0, 1, 3, 4] }, [180, 166], { c: 40 }); SFX.tick(); await S(L[1]); };
/* المقام نفسه والبسط نفسه والمرجع النصف */
SCENES.frCmpShow = async c => { const L = c.lines, svg = frStage(240), pairs = c.pairs || [[[3, 8], [5, 8]]]; for (const [i, [a, b]] of pairs.entries()) { const s2 = i ? frStage(240) : svg; frStrips(s2, [[a[1], a[0]], [b[1], b[0]]], { y0: 60, h: 42, gap: 36, w: 250, cx: 204 }); fracText(s2, 46, 80, a, { fs: 17 }); fracText(s2, 46, 158, b, { fs: 17 }); if (c.half) { const m = helpG(s2); geoLine(m, 204, 48, 204, 200, { color: css('--think'), w: 3, dash: '7 5' }); } await S(L[i]); } if (L[pairs.length]) await S(L[pairs.length]); };
/* جدار الاثني عشر: 2/3 = 8/12 و3/4 = 9/12 */
SCENES.wall12 = async c => { const L = c.lines, svg = frStage(260); const rows = [[3, 2], [12, 8], [4, 3], [12, 9]]; await S(L[0]); for (const [j, r] of rows.entries()) { frStrips(svg, [r], { y0: 36 + j * 50, h: 34 }); fracText(svg, 36, 50 + j * 50, [r[1], r[0]], { fs: 13 }); SFX.tick(); await sleep(FAST ? 10 : 380); } await S(L[1]); if (L[2]) await S(L[2]); };
/* التوزيع: 12 بسكويتة في 4 مجموعات */
SCENES.cookieShare = async c => { const L = c.lines, n = c.n || 12, Ly = setLay(n, c.b || 4, 50), svg = frStage(Math.max(240, Ly.H + 70)), P = Ly.at(180, 36 + Ly.H / 2), G = P.map(([x, y]) => frThing(svg, c.what || 'cookie', x, y, .9)); await S(L[0]); await frGroups(svg, G, n / (c.b || 4), c.a || 1); await S(L[1]); if (L[2]) await S(L[2]); };
/* المشروع: كعكة الحفلة 4×4 بثماني قطع */
SCENES.partyCake = async c => { const L = c.lines, svg = frStage(262), colors = Array(16).fill(null); const fl = c.fl || { choc: 4, straw: 2 }; let k = 0; for (const [f, col] of [['choc', '#7a4a2a'], ['straw', '#f08ba0']]) for (let j = 0; j < fl[f]; j++, k++) { colors[2 * k] = col; colors[2 * k + 1] = col; }
  for (let i = 0; i < 16; i++) if (!colors[i]) colors[i] = '#fbf3d5';
  const Sh = fracShape(svg, { k: 'grid', cols: 4, rows: 4, colors }, [180, 128], { c: 52 }); /* القطع أزواج متجاورة: خطّ أسمك بين القطع */ const m = el('g', { 'pointer-events': 'none' }, svg), [x0, y0] = Sh.box; for (let r = 0; r < 4; r++) for (let q = 1; q < 4; q += 2) geoLine(m, x0 + (q + 1) * 52, y0 + r * 52, x0 + (q + 1) * 52, y0 + (r + 1) * 52, { color: FRC.edge, w: 4 });
  for (const l of L) await S(l); };
SCENES.recallFrac = async c => { const svg = frStage(232); if (c.fig) fracShape(svg, c.fig, [180, 116], { r: 80 }); if (c.f) fracText(svg, 320, 60, c.f, { fs: 22 }); if (c.line) { const Ln = fracLine(svg, c.line[1]); fracArrow(svg, Ln.X(c.line[0])); } await S(c.lines[0]); };
WRAP_ART.fracArt = svg => { const Sh = fracShape(svg, { k: 'circle', n: 8, shade: [0, 1, 2] }, [180, 140], { r: 90 }); anim(Sh, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 200, fill: 'both' }); palmAt(svg, 330, 250, .8); palmAt(svg, 30, 250, .9); };
