/* =====================================================================
   S1-U5 الدرسان 4 و5 (درسا الجسر): شبكة المئة (N014) والعدّ بالقفز بالخمسة والعشرة (N013).
   · الشبكة 10 × 10، والترقيم من اليسار إلى اليمين كطريق الأعداد (D229): 1 أعلى اليسار، وعمود العشرات هو الأيمن.
   · اللمس (D275): عشرة أعمدة في عرض الهاتف تجعل البلاطة 34 وحدة، دون حدّ الهدف (56، D250). فالشبكة سطح لمس واحد بوحدة الإصبع (29_finger):
     البلاطة التي تحت الإصبع تكبر في عدسة فوقه بعددها، والإصبع ينزلق حتى يبلغ ما يريد، والاختيار برفعه. ولوحة المفاتيح: التنقّل بين البلاطات ثم مفتاح الفعل.
     استثناءٌ مكتوب لهذه الأداة وحدها: الشبكة كلها تبقى أمام الطفل، فيرى الأعمدة الملوّنة، وهي مقصود الدرس.
   ===================================================================== */
const GRID = { c: 34, x0: 10, y0: 14, paint: '#f2b33d', paint2: '#5fb6a8', done: '#bfe3d0' };
function hundredAt(svg, opt = {}) { const g = el('g', { 'data-grid': 1 }, svg), C = GRID.c, cells = [];
  el('rect', { x: GRID.x0 - 4, y: GRID.y0 - 4, width: C * 10 + 8, height: C * 10 + 8, rx: 10, fill: '#fffdf6', stroke: css('--line'), 'stroke-width': 2.5 }, g);
  for (let n = 1; n <= 100; n++) { const col = (n - 1) % 10, row = Math.floor((n - 1) / 10), x = GRID.x0 + col * C, y = GRID.y0 + row * C, cg = el('g', { 'data-n': n }, g);
    const r = el('rect', { x: x + 1, y: y + 1, width: C - 2, height: C - 2, rx: 6, fill: (row + col) % 2 ? '#f3ead6' : '#e9dcc3', stroke: '#fff', 'stroke-width': 1 }, cg);
    const t = el('text', { x: x + C / 2, y: y + C / 2 + 5.5, 'text-anchor': 'middle', 'font-size': n === 100 ? 12.5 : 15, 'font-weight': 800, fill: '#33454c', 'font-family': css('--f'), direction: 'ltr', 'pointer-events': 'none' }, cg); t.textContent = DG(n);
    cells[n] = { n, g: cg, r, t, x: x + C / 2, y: y + C / 2, base: r.getAttribute('fill') }; }
  const H = { g, svg, cells,
    paint(n, col = GRID.paint) { cells[n].r.setAttribute('fill', col); cells[n].g.dataset.on = 1; },
    clear(n) { cells[n].r.setAttribute('fill', cells[n].base); delete cells[n].g.dataset.on; },
    hide(n) { const c = cells[n]; c.t.setAttribute('opacity', 0); c.r.setAttribute('fill', '#fffdf6'); c.r.setAttribute('stroke', css('--compass')); c.r.setAttribute('stroke-width', 2.5); c.r.setAttribute('stroke-dasharray', '5 4'); c.g.dataset.hid = 1;
      const q = el('text', { x: c.x, y: c.y + 6, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: css('--compass'), 'font-family': css('--f'), 'pointer-events': 'none', 'data-q': 1 }, c.g); q.textContent = '؟'; },
    show(n) { const c = cells[n]; c.t.setAttribute('opacity', 1); c.r.setAttribute('stroke', '#fff'); c.r.setAttribute('stroke-width', 1); c.r.removeAttribute('stroke-dasharray'); delete c.g.dataset.hid; const q = c.g.querySelector('[data-q]'); if (q) q.remove(); },
    ring(n, col) { const c = cells[n]; return el('rect', { x: c.x - C / 2 - 1, y: c.y - C / 2 - 1, width: C + 2, height: C + 2, rx: 8, fill: 'none', stroke: col || css('--compass'), 'stroke-width': 3.6, 'pointer-events': 'none', 'data-ring': n }, g); },
    band(row) { return el('rect', { x: GRID.x0 - 2, y: GRID.y0 + row * C - 1, width: C * 10 + 4, height: C + 2, rx: 8, fill: css('--compass'), 'fill-opacity': .13, stroke: css('--compass'), 'stroke-width': 2.4, 'pointer-events': 'none', 'data-band': row }, g); },
    pop(n) { const c = cells[n]; anim(c.g, [{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 300 }); c.g.style.transformOrigin = `${c.x}px ${c.y}px`; c.g.style.transformBox = 'view-box'; },
    at(x, y) { const col = Math.max(0, Math.min(9, Math.floor((x - GRID.x0) / C))), row = Math.max(0, Math.min(9, Math.floor((y - GRID.y0) / C))); return row * 10 + col + 1; } };
  return H; }
const gridStage = () => newStage(GRID.c * 10 + 2 * GRID.y0, { oasis: false, ground: 0 });
/* اختيار بلاطة: الإصبع ينزلق والعدسة فوقه، والاختيار برفعه. opt: ok (للسائق)، bad، kind، only (بلاطات يُسمح بها وحدها، وغيرها لا تُختار) */
function gridPick(H, opt = {}) { const svg = H.svg, C = GRID.c; let cur = 0, ring = null, done = false;
  /* العدسة واحدة للشبكة، تبقى في المسرح وتُخفى بين لمسة ولمسة (لا يُمحى شيء حين يجيب الطفل) */
  if (!H.lens) { H.lens = el('g', { 'pointer-events': 'none', opacity: 0, 'data-lens': 1 }, svg); el('rect', { x: -32, y: -32, width: 64, height: 64, rx: 14, fill: '#fffdf6', stroke: css('--compass'), 'stroke-width': 4 }, H.lens);
    el('text', { y: 12, 'text-anchor': 'middle', 'font-size': 32, 'font-weight': 800, fill: '#22343b', 'font-family': css('--f'), direction: 'ltr' }, H.lens); }
  const lens = H.lens, lt = lens.querySelector('text'); svg.appendChild(lens);
  const focus = n => { if (n === cur) return; cur = n; if (ring) ring.remove(); const c = H.cells[n]; ring = H.ring(n); lt.textContent = c.g.dataset.hid ? '؟' : DG(n); lt.setAttribute('font-size', n === 100 ? 25 : 32);
    const ly = c.y - 62 < 34 ? c.y + 62 : c.y - 62, lx = Math.max(36, Math.min(324, c.x)); lens.setAttribute('transform', `translate(${lx} ${ly})`); lens.setAttribute('opacity', 1); SFX.tick(); /*T*/window.__gridCur = n;/*/T*/ };
  const blur = () => { cur = 0; if (ring) ring.remove(); ring = null; lens.setAttribute('opacity', 0); };
  return gate(new Promise(res => { let input = null;
    const fin = n => { if (done) return; done = true; /*T*/window.__gridPicked = n;/*/T*/ AUTO_CLEAR(); if (input) input.off(); for (let n = 1; n <= 100; n++) { const cg = H.cells[n].g; cg.removeAttribute('tabindex'); cg.onfocus = null; cg.onkeydown = null; } blur(); res(n); };
    input = fingerInput(svg, { map: e => { const q = svgPoint(svg, e); return [q.x, q.y]; },
      down(q) { if (q[1] < GRID.y0 - 12 || q[1] > GRID.y0 + C * 10 + 12) return false; focus(H.at(q[0], q[1])); }, move(q) { focus(H.at(q[0], q[1])); },
      up(cancelled) { const n = cur; if (cancelled || !n) { blur(); return; } fin(n); } });
    /* لوحة المفاتيح: كل بلاطة تُبلغ بمفتاح التنقّل فتكبر في العدسة، ومفتاح الفعل يختارها */
    for (let n = 1; n <= 100; n++) { const cg = H.cells[n].g; cg.setAttribute('tabindex', 0); cg.setAttribute('aria-label', plain(T(numw(n)))); cg.onfocus = () => focus(n); cg.onkeydown = e => { if (isActKey(e)) { e.preventDefault(); fin(n); } }; }
    const xy = n => { const c = H.cells[n], m = svg.getScreenCTM(); return { x: m.a * c.x + m.e, y: m.d * c.y + m.f, n }; };
    /*T*/window.__grid = () => opt.ok != null ? xy(opt.ok) : null;/*/T*/
    AUTO({ kind: opt.kind || 'grid', ok: () => fin(opt.ok != null ? opt.ok : 1), wrong: () => fin(opt.bad != null ? opt.bad : (opt.ok % 10 ? opt.ok + 1 : opt.ok - 1)) }); })); }
const gridSayN = n => say(...lineOf(numw(n)), { free: true, num: true });

/* ================= ① المس العدد على الشبكة (N014): n. show: العدد مكتوب على بلاطة (لعبة «البلاطة المفقودة»، وholes المخفيات) ================= */
ITEM.gridTap = {
  make(spec) { return { ...spec, want: spec.n, tag: spec.holes ? 'grid-place' : 'grid-tap' }; },
  async ask(item, mode, tries) { const svg = gridStage(), H = hundredAt(svg), help = tries >= 3; (item.holes || []).forEach(n => H.hide(n));
    if (help) H.band(Math.floor((item.n - 1) / 10));
    await S(help ? 'gen.grid.together.tap' : item.q); if (!item.holes) await S(numw(item.n), { num: true });
    if (item.holes) { const far = p => Math.min(...item.holes.map(n => Math.hypot(H.cells[n].x - p[0], H.cells[n].y - p[1]))), tileAt = [[62, 66], [298, 66], [62, 302], [298, 302]].sort((a, b) => far(b) - far(a))[0];   /* البلاطة في الركن الأبعد عن الأماكن الفارغة */
      const tile = el('g', { 'pointer-events': 'none', transform: `translate(${tileAt[0]} ${tileAt[1]})` }, svg); el('rect', { x: -30, y: -30, width: 60, height: 60, rx: 12, fill: GRID.paint, stroke: '#fff', 'stroke-width': 4 }, tile);
      const t = el('text', { y: 11, 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: '#22343b', 'font-family': css('--f'), direction: 'ltr' }, tile); t.textContent = DG(item.n); }
    const bad = item.holes ? item.holes.find(n => n !== item.n) : null; const k = await gridPick(H, { ok: item.n, bad }); if (k !== item.n && !NEUTRAL_ANS) H.ring(k, css('--chaos')); return { ans: k, ctx: { svg, H } }; },
  judge(item, k) { if (k === item.n) return { ok: true }; const sw = (item.n % 10) * 10 + Math.floor(item.n / 10);
    return { ok: false, err: item.holes ? 'gridPlaceWrong' : k === sw && item.n < 100 ? 'gridSwap' : k % 10 === item.n % 10 ? 'gridRow' : 'gridWrong' }; },
  onOk(item, r) { SFX.good(); const H = r.ctx.H; if (item.holes) H.show(item.n); H.paint(item.n, GRID.done); H.pop(item.n); gridSayN(item.n); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const b = r.ctx.H.band(Math.floor((item.n - 1) / 10)); await anim(b, [{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }, { opacity: 1 }], { duration: 900 }).done.catch(() => {}); await sleep(500); }, async together() {},
  async reveal(item, r) { const H = r.ctx.H; if (item.holes) H.show(item.n); H.paint(item.n, GRID.done); H.pop(item.n); await S(numw(item.n), { num: true }); },
  praise: () => 'praiseCount', twin(item) { return item.twin || null; },
};

/* ================= ② ما العدد التالي؟ أو السابق (N014): n ملوّنة، ويلمس الطفل n + dir ================= */
ITEM.gridNext = {
  make(spec) { const dir = spec.dir || 1; return { ...spec, dir, want: spec.n + dir, tag: 'grid-next' + (dir < 0 ? '-back' : '') }; },
  async ask(item, mode, tries) { const svg = gridStage(), H = hundredAt(svg), help = tries >= 3; H.paint(item.n);
    if (help) H.band(Math.floor((item.want - 1) / 10));
    await S(help ? 'gen.grid.together.next' : item.q); const k = await gridPick(H, { ok: item.want, bad: item.n + 10 <= 100 ? item.n + 10 : item.n - 10 }); if (k !== item.want && !NEUTRAL_ANS) H.ring(k, css('--chaos')); return { ans: k, ctx: { svg, H } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: Math.abs(k - item.n) === 10 ? 'gridNextCol' : 'gridNextWrong' }; },
  onOk(item, r) { SFX.good(); r.ctx.H.paint(item.want, GRID.done); r.ctx.H.pop(item.want); gridSayN(item.want); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const H = r.ctx.H, a = Math.max(1, item.n - 2); for (let n = a; n <= item.n; n++) { H.pop(n); await S(numw(n), { noGap: true, num: true }); } }, async together() {},
  async reveal(item, r) { r.ctx.H.paint(item.want, GRID.done); r.ctx.H.pop(item.want); await S(numw(item.want), { num: true }); },
  praise: () => 'praiseCount', twin(item) { return item.twin || null; },
};

/* ================= ③ البلاطة المخفية (N014): n مخفية، والجواب من ثلاثة أعداد (جارها في الصف وجارها في العمود) ================= */
ITEM.gridHidden = { ...numItem,
  make(spec) { const n = spec.n; return { ...spec, want: n, nums: [n, n + 10 <= 100 ? n + 10 : n - 10, n % 10 === 1 ? n + 1 : n - 1], tag: 'grid-hidden' }; },
  async ask(item, mode, tries) { const SH = 236, k = 1.8, svg = newStage(SH, { oasis: false, ground: 0 }), H = hundredAt(svg), c = H.cells[item.n], cl = (v, a, b) => Math.max(a, Math.min(b, v)); H.hide(item.n); H.ring(item.n);
    { const cp = el('clipPath', { id: 'gridWin' }, svg); el('rect', { x: 0, y: 0, width: 360, height: SH }, cp); const w = el('g', { 'clip-path': 'url(#gridWin)' }, svg); w.appendChild(H.g); }   /* نافذة مكبّرة حول البلاطة: ما خرج منها مقصوص */
    H.g.setAttribute('transform', `translate(${cl(180 - c.x * k, 354 - 354 * k, 6 - 6 * k)} ${cl(SH / 2 - c.y * k, SH - 8 - 358 * k, 8 - 10 * k)}) scale(${k})`);
    if (tries >= 3) { H.band(Math.floor((item.n - 1) / 10)); for (let n = item.n % 10 || 10; n <= 100; n += 10) if (n !== item.n) H.paint(n, GRID.paint2); }
    await S(tries >= 3 ? 'gen.grid.together.hidden' : item.q); const np = numberPick(shuffle(item.nums), item.want); return { ans: await np.p, ctx: { svg, np, H } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: Math.abs(k - item.n) === 10 ? 'gridHidRow' : 'gridHidCol' }; },
  async hint2(item, r) { const H = r.ctx.H, row = Math.floor((item.n - 1) / 10) * 10; for (let n = Math.max(row + 1, item.n - 2); n <= Math.min(row + 10, item.n + 1); n++) if (n !== item.n) { H.pop(n); await S(numw(n), { noGap: true, num: true }); } },
  async together() {}, async reveal(item, r) { r.ctx.H.show(item.n); r.ctx.H.paint(item.n, GRID.done); await S(numw(item.n), { num: true }); },
  twin(item) { return item.twin || null; },
};

/* ================= ④ عُدّ على الشبكة (N014 بالواحد، وN013 بالخمسة والعشرة): من a، كل مرة step، إلى b. from: ما لُوّن قبل البدء ================= */
const gridSeqOf = s => { const out = []; for (let n = s.a + s.step; n <= s.b; n += s.step) out.push(n); return out; };
ITEM.gridSeq = {
  make(spec) { const step = spec.step || 1, it = { ...spec, step }; it.seq = gridSeqOf(it); it.pre = spec.from || (spec.a >= 1 ? [spec.a] : []); it.tag = 'grid-seq' + step; return it; },
  async ask(item, mode, tries) { const svg = gridStage(), H = hundredAt(svg), help = tries >= 3, col = item.step === 10 ? GRID.paint2 : GRID.paint; item.pre.forEach(n => H.paint(n, col));
    const todo = help ? item.seq.slice(-1) : item.seq; if (help) item.seq.slice(0, -1).forEach(n => H.paint(n, col));
    if (item.mark !== false) H.ring(item.b, css('--muted')).setAttribute('stroke-dasharray', '5 4');   /* البلاطة المحاطة: إلى أين نعدّ */
    await S(help ? 'gen.grid.together.seq' : item.q); const got = [];
    for (const [i, n] of todo.entries()) { const k = await gridPick(H, { ok: n, bad: item.step === 1 ? Math.min(100, n + 1) : n + 1 > 100 ? n - 1 : n + 1, kind: i ? 'grid' + (i + 1) : 'grid' }); got.push(k);
      /* في الإتقان والاختبار لا إشارة صواب ولا خطأ (A-01): كل ما يُلمس يُلوَّن ويُنطق، ولا يقف التسلسل عند الخطأ */
      if (k !== n && !NEUTRAL_ANS) { H.ring(k, css('--chaos')); break; } H.paint(k, col); H.pop(k); gridSayN(k); }
    await sleep(300); return { ans: { got, todo }, ctx: { svg, H, todo, col } }; },
  /* الجواب: ما لُمس، وما كان مطلوباً لمسه (في الحلّ المشترك آخر التسلسل وحده) */
  judge(item, a) { return a.got.length === a.todo.length && a.got.every((k, i) => k === a.todo[i]) ? { ok: true } : { ok: false, err: item.step === 1 ? 'gridSeqSkip' : 'gridSeqStep' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const H = r.ctx.H; let n = item.pre.length ? item.pre[item.pre.length - 1] : item.a; for (let j = 0; j < 2 && j < item.seq.length; j++) { for (let s = 1; s <= item.step; s++) { H.pop(Math.min(100, n + s)); SFX.tick(); await sleep(item.step === 1 ? 250 : 170); } n += item.step; await S(numw(n), { noGap: true, num: true }); } },
  async together() {},
  async reveal(item, r) { const H = r.ctx.H; for (const n of item.seq) { H.paint(n, r.ctx.col); H.pop(n); await S(numw(n), { noGap: true, num: true }); } await S('gen.grid.reveal.seq'); },
  praise: () => 'praiseCount', twin(item) { return item.twin || null; },
};

/* ---------- مشاهد الدرس 4 ---------- */
/* الإشعال: فوضى تقول إن المئة لا تُعدّ؛ تظهر الشبكة صفّاً صفّاً، ويلمس الطفل ثلاث بلاطات يختارها فيسمع أعدادها. بلا حكم */
SCENES.gridHook = async c => {
  const svg = gridStage(), H = hundredAt(svg), [l1, l2, l3] = c.lines; for (let n = 1; n <= 100; n++) H.cells[n].g.setAttribute('opacity', 0);
  const fz = chaosAt(svg, 180, 170, .6); await chaosGiggle(fz); await S(l1); fz.remove();
  for (let r = 0; r < 10; r++) { for (let n = r * 10 + 1; n <= r * 10 + 10; n++) H.cells[n].g.setAttribute('opacity', 1); SFX.tick(); await sleep(140); }
  S(l2, { free: true }); for (const [i, ok] of [7, 45, 100].entries()) { const k = await gridPick(H, { ok }); if (i === 0) hush(); H.paint(k, GRID.done); H.pop(k); await S(numw(k), { num: true }); }
  logAttempt({ scene: 'hook', tag: 'gridFree', ok: true }); await S(l3);
};
/* الاكتشاف: يلمس الطفل بلاطات تسلسلٍ واحدة واحدة (والتالية تنبض)، فتُلوَّن وتُنطق، ويظهر النمط بعينه. c: seq أو a/step/b، وcolor */
SCENES.gridGuide = async c => {
  const svg = gridStage(), H = hundredAt(svg), seq = c.seq || [c.a, ...gridSeqOf(c)], col = c.color === 2 ? GRID.paint2 : GRID.paint; (c.keep || []).forEach(n => H.paint(n, GRID.paint));
  S(c.intro, { free: true }); let slips = 0, first = true;
  for (const n of seq) { const rg = H.ring(n); rg.classList.add('pulse');
    while (true) { const k = await gridPick(H, { ok: n }); if (first) { hush(); first = false; } if (k === n) break; slips++; SFX.soft(); }
    rg.remove(); H.paint(n, col); H.pop(n); await S(numw(n), { noGap: true, num: true }); }
  logAttempt({ scene: 'explore', tag: 'gridGuide', ok: true, firstTry: slips === 0 }); SFX.good(); await sleep(300); await S(c.after);
};
/* المثال المحلول: نعدّ من a فنبلغ آخر الصف، والعدد التالي في أول الصف الذي تحته: يلمسه الطفل */
SCENES.gridWorked = async c => {
  const svg = gridStage(), H = hundredAt(svg), [l1, l2, l3] = c.lines, end = Math.ceil(c.a / 10) * 10; H.paint(c.a);
  await S(l1); for (let n = c.a + 1; n <= end; n++) { H.paint(n); H.pop(n); await S(numw(n), { noGap: true, num: true }); }
  S(l2, { free: true }); const rg = H.ring(end + 1); rg.classList.add('pulse'); let first = true;
  while (true) { const k = await gridPick(H, { ok: end + 1 }); if (first) { hush(); first = false; } if (k === end + 1) break; SFX.soft(); }
  rg.remove(); SFX.good(); for (let n = end + 1; n <= c.b; n++) { H.paint(n); H.pop(n); await S(numw(n), { noGap: true, num: true }); }
  await S(l3);
};
/* «صحّح لفوضى»: ما لُوّن قبلها (from)، وبلاطتها الخطأ بلونها (wrongN إن وُجدت)، ويلمس الطفل الصحيحة (want) */
SCENES.chaosGrid = async C => {
  const svg = gridStage(), H = hundredAt(svg); (C.from || []).forEach(n => H.paint(n)); if (C.wrongN) H.paint(C.wrongN, css('--chaos'));
  const fz = chaosAt(svg, C.want > 50 ? 300 : 300, C.want > 50 ? 60 : 300, .4); await chaosGiggle(fz); S(C.find, { free: true }); let tries = 0;
  while (true) { const k = await gridPick(H, { ok: C.want, bad: C.wrongN || C.want + 10 }); tries++; logAttempt({ scene: 'chaos', tag: 'find', ok: k === C.want, firstTry: tries === 1 }); if (k === C.want) break;
    hush(); SFX.soft(); await S('gen.chaos.no'); if (tries === 2) { const b = H.band(Math.floor((C.want - 1) / 10)); await sleep(900); b.remove(); } }
  hush(); SFX.good(); fz.remove(); if (C.wrongN) H.clear(C.wrongN); H.paint(C.want); H.pop(C.want); await S(numw(C.want), { num: true }); if (C.after) await S(C.after);
};
SCENES.recallGrid = async c => { const svg = gridStage(), H = hundredAt(svg); for (const n of c.paint || []) { H.paint(n, c.color === 2 ? GRID.paint2 : GRID.paint); } await sleep(300); await S(c.lines); };

/* ---------- الدرس 5: الأيدي بالخمسة ---------- */
SCENES.handsHook = async c => {
  const svg = newStage(260, { oasis: false, ground: 0 }), [l1, l2, l3] = c.lines, n = c.hands || 4, X = i => 180 + (n - 1) * 41 - i * 82, m = helpG(svg);
  const Hd = Array.from({ length: n }, (_, i) => ({ g: handAtN(svg, X(i), 110, 5, .9), x: X(i), i }));
  await S(l1); S(l2, { free: true });
  for (const h of Hd) { await tapOne([{ g: h.g, k: h.i, label: labelText('patHand') }], { ok: h.i, pad: 70 }); if (h.i === 0) hush(); badge(m, h.x, 176, 5 * (h.i + 1)); SFX.tick(); await S(numw(5 * (h.i + 1)), { noGap: true, num: true }); }
  logAttempt({ scene: 'hook', tag: 'hands', ok: true }); await S(l3);
};
WRAP_ART.gridRug = svg => { const C = 17, x0 = 95, y0 = 70; for (let n = 1; n <= 100; n++) { const col = (n - 1) % 10, row = Math.floor((n - 1) / 10);
    const g = el('rect', { x: x0 + col * C, y: y0 + row * C, width: C, height: C, rx: 3, fill: n % 10 === 0 ? GRID.paint2 : n % 5 === 0 ? GRID.paint : (row + col) % 2 ? '#f3ead6' : '#e9dcc3', stroke: '#fff', 'stroke-width': 1 }, svg);
    anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 150 + row * 110 + col * 12, fill: 'both' }); } palmAt(svg, 316, 250, .8); palmAt(svg, 44, 250, .9); };
