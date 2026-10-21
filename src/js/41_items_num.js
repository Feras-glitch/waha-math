/* =====================================================================
   بنود خيط العدد في م1 (N001–N007، D222): العدّ، والثبات، والإخراج، واللمحة، والأرقام، والمقارنة، والتفكيك، والجمع والطرح، والطلاقة
   ===================================================================== */
/* مواضع n شيئاً: صفّ، أو دائرة، أو مبعثرة (بعشوائية الدرس) */
function layoutPts(n, layout, cx = 180, cy = 118, sp = 58) {
  if (layout === 'circle') { const r = Math.max(56, n * 12); return Array.from({ length: n }, (_, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return { x: cx + r * Math.cos(a), y: cy + r * .78 * Math.sin(a) }; }); }
  if (layout === 'scatter') { const pts = []; let guard = 0; while (pts.length < n && guard++ < 600) { const p = { x: R(40, 320), y: R(cy - 82, cy + 82) }; if (pts.every(q => Math.hypot(q.x - p.x, q.y - p.y) > 54)) pts.push(p); } return pts; }
  const per = n > 5 ? Math.ceil(n / 2) : n; const rows = Math.ceil(n / per);
  return Array.from({ length: n }, (_, i) => { const r = Math.floor(i / per), c = i % per; const w = Math.min(per, n - r * per); return { x: cx + ((w - 1) / 2 - c) * sp, y: cy + (r - (rows - 1) / 2) * sp * 1.1 }; });   // من اليمين إلى اليسار
}
const numBtn = (r, n) => r.ctx.np && r.ctx.np.btns.find(b => +b.dataset.k === n);
const markNum = (r, n, cls) => { const b = numBtn(r, n); if (b) b.classList.add(cls); };
const numItem = { onOk(item, r) { SFX.good(); markNum(r, r.ans, 'ok'); }, onWrong(item, r) { SFX.soft(); markNum(r, r.ans, 'no'); }, mark(item, r) { markNum(r, item.want, 'ok'); }, praise: () => 'praiseCount' };
async function badgeCount(svg, pts, col, from = 1) { const m = el('g', { 'pointer-events': 'none' }, svg); for (const [i, p] of pts.entries()) { badge(m, p.x, p.y, from + i, col); SFX.tick(); await S(numw(from + i), { noGap: true, num: true }); } return m; }

/* ① العدّ (N001): يلمس كل شيء مرة، ثم يختار «كم» من كلمات مسموعة */
ITEM.count = { ...numItem,
  make(spec) { const it = { ...spec, tag: spec.tag || ('count-' + (spec.what || spec.layout || 'row')) }; it.shapeObj = spec.shape ? make(spec.shape) : null; it.objMade = spec.objs ? spec.objs : null;
    it.want = it.shapeObj ? (it.shapeObj.type === 'triangle' ? 3 : 4) : spec.n; return it; },
  async ask(item, mode, tries) {
    const svg = newStage(250, { oasis: false, ground: 0 }); let pts;
    if (item.shapeObj) { const s = { ...item.shapeObj, x: 180, y: 122 }; shapeAt(svg, s, 180, 122); const P = worldPoly(s);
      pts = item.what === 'sides' ? P.map((a, i) => { const b = P[(i + 1) % P.length]; return { x: (a[0] + b[0]) / 2, y: (a[1] + b[1]) / 2 }; }) : P.map(([x, y]) => ({ x, y })); }
    else { pts = layoutPts(item.n, item.layout || 'row', 180, 122); const proto = make(item.objs); pts.forEach(p => { p.g = thingAt(svg, { ...proto, size: item.size || 48, label: null, rot: proto.rot }, p.x, p.y); }); }
    if (tries >= 3) { await S('gen.count.together'); await badgeCount(svg, pts.map(p => ({ x: p.x, y: p.y - 26 }))); }       // الحل المشترك: نعدّ معاً، والطفل يختار «كم»
    else { await S(item.prompt || (item.what === 'sides' ? 'gen.count.sides' : item.what === 'vertices' ? 'gen.count.vertices' : 'gen.count.touch')); await countTouch(svg, pts, { halo: item.shapeObj ? 20 : 28, by: -28 }); }
    await S(item.how || 'gen.count.how'); const np = numberPick(nearNums(item.want), item.want); return { ans: await np.p, ctx: { svg, pts, np } }; },
  judge(item, ans) { return ans === item.want ? { ok: true } : { ok: false, err: 'lastNumber' }; },
  async hint2(item, r) { await badgeCount(r.ctx.svg, r.ctx.pts.map(p => ({ x: p.x, y: p.y + 26 })), css('--square')); await sleep(400); },
  async together() {},
  async reveal(item, r) { markNum(r, item.want, 'ok'); await S(numw(item.want)); },
  twin(item) { return item.spec.n ? { ...item.spec, n: Math.max(3, Math.min(10, item.spec.n + (rand() < .5 ? -1 : 1))), layout: item.spec.layout === 'row' ? 'scatter' : 'row' } : { ...item.spec, shape: item.spec.shape }; },
};

/* ② الثبات (N002): يعدّها، ثم يتغيّر ترتيبها (وقد يُضاف واحد)، فيُسأل: هل تغيّر العدد؟ */
ITEM.same = {
  make(spec) { return { ...spec, tag: spec.add ? 'sameAdd' : 'same', want: spec.add ? 'changed' : 'same' }; },
  async ask(item, mode, tries) {
    const svg = newStage(250, { oasis: false, ground: 0 }); const proto = make(item.mk);
    const from = layoutPts(item.n, item.from || 'row', 180, 118); const gs = from.map(p => thingAt(svg, { ...proto, size: 44, label: null }, p.x, p.y));
    if (tries === 0) { await S('gen.same.count'); await countTouch(svg, from.map((p, i) => ({ ...p, g: gs[i] })), { halo: 26, by: -28 }); }
    else await badgeCount(svg, from.map(p => ({ x: p.x, y: p.y - 26 })));
    await sleep(400); const fz = mode === 'practice' && tries === 0 ? chaosAt(svg, 320, 40, .45) : null; if (fz) await chaosGiggle(fz);
    const to = layoutPts(item.n, item.to || 'scatter', 180, 118);
    svg.querySelectorAll('g[pointer-events=none]').forEach(m => m.remove());
    await Promise.all(gs.map((g, i) => anim(g, [{ transform: `translate(${from[i].x}px,${from[i].y}px)` }, { transform: `translate(${to[i].x}px,${to[i].y}px)` }], { duration: 900, fill: 'forwards', easing: 'ease-in-out' }).done));
    if (item.add) { const p = layoutPts(1, 'row', item.add > 0 ? 330 : 30, 40)[0]; const extra = thingAt(svg, { ...proto, size: 44, label: null }, p.x, p.y); const q = { x: 180 + R(-30, 30), y: 210 };
      await anim(extra, [{ transform: `translate(${p.x}px,${p.y}px)` }, { transform: `translate(${q.x}px,${q.y}px)` }], { duration: 900, fill: 'forwards' }).done; item._extra = q; }
    item._to = to; await S('gen.same.ask');
    const k = await choosePick([['same', labelText('same'), PICKICON.same], ['changed', labelText('changed'), PICKICON.changed]], item.want); return { ans: k, ctx: { svg, to } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: item.add ? 'missedAdd' : 'spreadMore' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const pts = [...r.ctx.to, ...(item._extra ? [item._extra] : [])]; await badgeCount(r.ctx.svg, pts.map(p => ({ x: p.x, y: p.y - 26 })), css('--square')); await sleep(400); },
  async together() { await S('gen.same.together'); },
  async reveal(item) { await S(item.add ? 'gen.same.changed' : 'gen.same.same'); },
  praise: () => 'praiseCount', twin(item) { return { ...item.spec, to: item.spec.to === 'circle' ? 'scatter' : 'circle' }; },
};

/* ③ الإخراج (N002): «ضع في السلّة بعدد…» من كومة أكبر، ويقف عند العدد */
function pileBasket(svg, proto, pile, prefill = 0) {
  const basket = el('g', { transform: 'translate(180 210)' }, svg); basket.innerHTML = basketSVG('other').replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '').replace(/<text[\s\S]*?<\/text>/, '');
  basket.setAttribute('transform', 'translate(125 158) scale(1)'); const inside = [];
  const slots = layoutPts(pile, 'row', 180, 64, 44); const pieces = slots.map((p, i) => ({ g: thingAt(svg, { ...proto, size: 36, label: null }, p.x, p.y), home: p, inB: false, i }));
  const bpos = i => ({ x: 155 + (i % 5) * -12 + 24, y: 214 - Math.floor(i / 5) * 12 - (i % 2) * 4 });
  const place = (pc, on) => { pc.inB = on; if (on) inside.push(pc); else inside.splice(inside.indexOf(pc), 1);
    inside.forEach((q, j) => { const b = bpos(j); q.g.setAttribute('transform', `translate(${b.x} ${b.y}) scale(.8)`); }); if (!on) pc.g.setAttribute('transform', `translate(${pc.home.x} ${pc.home.y})`); };
  for (let i = 0; i < prefill; i++) place(pieces[i], true);
  return { pieces, inside, place, count: () => inside.length };
}
ITEM.produce = {
  make(spec) { return { ...spec, tag: 'produce', want: spec.n }; },
  async ask(item, mode, tries) {
    const svg = newStage(270, { oasis: false, ground: 0 }); const proto = make(item.mk); const pb = pileBasket(svg, proto, item.pile || item.n + 3, tries >= 3 ? item.n : 0);
    if (tries >= 3) { await S('gen.produce.together'); } else { await S('gen.produce.ask'); await S(numw(item.n)); }
    pb.pieces.forEach(pc => { pc.g.style.cursor = 'pointer'; pc.g.setAttribute('role', 'button'); hitPad(pc.g, 56); pc.g.onclick = () => { pb.place(pc, !pc.inB); SFX.pop(); if (pc.inB && !SET.muted && !FAST) say(...lineOf(numw(pb.count())), { num: true, noGap: true, free: true }); }; });
    const d = doneBtn(); AUTO({ kind: 'produce', ok: () => { while (pb.count() < item.n) pb.place(pb.pieces.find(q => !q.inB), true); while (pb.count() > item.n) pb.place(pb.inside[pb.inside.length - 1], false); d.b.click(); },
      wrong: () => { while (pb.count() < Math.min(item.n + 2, pb.pieces.length)) pb.place(pb.pieces.find(q => !q.inB), true); d.b.click(); } });
    const ans = await gate(new Promise(res => d.b.onclick = () => { if (!pb.count()) return; AUTO_CLEAR(); hush(); d.bar.remove(); res(pb.count()); }));
    return { ans, ctx: { svg, pb } }; },
  judge(item, n) { return n === item.n ? { ok: true } : { ok: false, err: n > item.n ? 'tooMany' : 'tooFew' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { await badgeCount(r.ctx.svg, r.ctx.pb.inside.map(q => { const t = q.g.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/); return { x: +t[1], y: +t[2] - 22 }; }), css('--square')); await sleep(400); },
  async together() {}, async reveal(item) { await S('gen.produce.reveal'); await S(numw(item.n)); },
  praise: () => 'praiseCount', twin(item) { return { ...item.spec, n: Math.max(3, Math.min(8, item.spec.n + (rand() < .5 ? -1 : 1))) }; },
};

/* ④ اللمحة السريعة حتى 5 (تنتقل إلى «مراجعة اليوم»، D248): تُرى ثم تُخفى، والجواب بلا زمن (D233) */
ITEM.glance = { ...numItem,
  make(spec) { return { ...spec, tag: 'glance', want: spec.n }; },
  async ask(item, mode, tries) {
    const svg = newStage(250, { oasis: false, ground: 0 }); const show = () => { const d = diceAt(svg, 180, 118, item.n); return d; };
    if (tries >= 3) { const d = show(); await S('gen.glance.together'); await badgeCount(svg, DICE[item.n].map(([u, v]) => ({ x: 180 + u * 34, y: 118 + v * 34 }))); }
    else { await S('gen.glance.look'); const d = show(); await new Promise(r => setTimeout(r, FAST ? 150 : 1400)); const cover = el('rect', { x: 110, y: 48, width: 140, height: 140, rx: 18, fill: css('--paper'), stroke: css('--line'), 'stroke-width': 3 }, svg);
      const again = el('g', { transform: 'translate(180 118)' }, svg); again.innerHTML = ICON.eye.replace('<svg', '<svg x="-22" y="-22" width="44" height="44"'); again.style.cursor = 'pointer'; again.setAttribute('role', 'button'); again.setAttribute('aria-label', labelText('lookAgain')); hitPad(again, 80);
      again.onclick = async () => { cover.style.display = 'none'; again.style.display = 'none'; logAttempt({ scene: 'review', tag: 'glance-peek', ok: true }); await new Promise(r => setTimeout(r, FAST ? 150 : 1400)); cover.style.display = ''; again.style.display = ''; }; }
    await S('gen.glance.ask'); const np = numberPick(nearNums(item.n, 6).filter(x => x > 0), item.n); return { ans: await np.p, ctx: { svg, np } }; },
  judge(item, ans) { return ans === item.n ? { ok: true } : { ok: false, err: 'glance' }; },
  async hint2(item, r) { const d = diceAt(r.ctx.svg, 180, 118, item.n); await sleep(FAST ? 100 : 1600); d.remove(); },
  async together() {}, async reveal(item) { await S(numw(item.n)); }, twin(item) { return { ...item.spec, n: item.spec.n === 5 ? 4 : item.spec.n + 1 }; },
};

/* ⑤ الأرقام (N003، D229): بطاقات، وصناديق بريد، وتعبئة، وتتبّع */
const CONFUSE = [[2, 3, 'digit23'], [7, 8, 'digit78'], [6, 2, 'digit62']];
const digitErr = (want, got) => { for (const [a, b, e] of CONFUSE) if ((want === a && got === b) || (want === b && got === a)) return e; return want === 0 ? 'zeroNotNumber' : 'digitOther'; };
function cardRow(svg, nums, y = 210) { const sp = 300 / Math.max(1, nums.length); return nums.map((n, i) => ({ g: digitCard(svg, 330 - sp / 2 - i * sp, y, n, { size: 1.15 }), k: n, x: 330 - sp / 2 - i * sp, label: T(numw(n)) })); }   // من اليمين إلى اليسار
ITEM.digitPick = {
  make(spec) { return { ...spec, tag: 'digitPick', want: spec.n, opts: spec.opts || shuffle([spec.n, ...shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(x => x !== spec.n)).slice(0, 2)]) }; },
  async ask(item, mode, tries) { const svg = newStage(270, { oasis: false, ground: 0 }); const cards = cardRow(svg, shuffle(item.opts), 130);
    if (tries >= 3) { const mb = mailboxAt(svg, 180, 230, item.n); await S('gen.digit.together'); await badgeCount(svg, mb.letters.map(l => { const t = l.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/); return { x: 180 + +t[1], y: 230 + +t[2] - 14 }; })); }
    await S('gen.digit.touch'); await S(numw(item.n)); const k = await tapOne(cards, { ok: item.n, pad: 84 }); return { ans: k, ctx: { svg, cards } }; },
  judge(item, k) { return k === item.n ? { ok: true } : { ok: false, err: digitErr(item.n, k) }; },
  onOk(item, r) { SFX.good(); const c = r.ctx.cards.find(c => c.k === r.ans); el('circle', { cx: c.x, cy: 130, r: 46, fill: 'none', stroke: css('--good'), 'stroke-width': 5 }, r.ctx.svg); },
  onWrong() { SFX.soft(); }, mark(item, r) { const c = r.ctx.cards.find(c => c.k === item.n); el('circle', { cx: c.x, cy: 130, r: 46, fill: 'none', stroke: css('--good'), 'stroke-width': 5 }, r.ctx.svg); },
  async hint2(item, r) { for (const c of r.ctx.cards) { const d = diceAt(r.ctx.svg, c.x, 220, Math.min(c.k, 6), { sp: 9 }); if (c.k > 6) { d.remove(); const t = towerAt(r.ctx.svg, c.x, 262, c.k, { size: 9 }); } } await sleep(1800); },
  async together(item) { await S('gen.digit.countFirst'); },
  async reveal(item, r) { ITEM.digitPick.mark(item, r); await S(numw(item.n)); }, praise: () => 'praiseLook', twin(item) { return { t: 'digitPick', n: item.n, opts: item.opts }; },
};
ITEM.digitMatch = {
  make(spec) { return { ...spec, tag: 'digitMatch', want: spec.n, opts: spec.opts || shuffle([spec.n, ...shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(x => x !== spec.n && Math.abs(x - spec.n) <= 3)).slice(0, 2)]) }; },
  async ask(item, mode, tries) { const svg = newStage(290, { oasis: false, ground: 0 }); const mb = mailboxAt(svg, 180, 92, item.n);
    const tg = mb.letters.map(l => ({ g: l, p: (() => { const t = l.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/); return { x: 180 + +t[1], y: 92 + +t[2] }; })() }));
    let n = 0; const marks = el('g', { 'pointer-events': 'none' }, svg);
    tg.forEach(t => { t.g.style.cursor = 'pointer'; t.g.onclick = () => { if (t.done) return; t.done = true; n++; el('circle', { cx: t.p.x, cy: t.p.y, r: 9, fill: css('--rect'), opacity: .5 }, marks); if (!SET.muted && !FAST) say(...lineOf(numw(n)), { num: true, noGap: true, free: true }); }; });
    if (tries >= 3 && item.n) { await S('gen.count.together'); await badgeCount(svg, tg.map(t => ({ x: t.p.x, y: t.p.y - 14 }))); }
    const cards = cardRow(svg, item.opts, 236); await S(item.n === 0 ? 'gen.match.empty' : 'gen.match.ask');
    const k = await tapOne(cards, { ok: item.n, pad: 84 }); return { ans: k, ctx: { svg, cards, tg } }; },
  judge(item, k) { return k === item.n ? { ok: true } : { ok: false, err: item.n === 0 ? 'zeroNotNumber' : (Math.abs(k - item.n) === 1 ? 'miscount' : digitErr(item.n, k)) }; },
  onOk(item, r) { SFX.good(); const c = r.ctx.cards.find(c => c.k === r.ans); el('circle', { cx: c.x, cy: 236, r: 44, fill: 'none', stroke: css('--good'), 'stroke-width': 5 }, r.ctx.svg); },
  onWrong() { SFX.soft(); }, mark(item, r) { const c = r.ctx.cards.find(c => c.k === item.n); el('circle', { cx: c.x, cy: 236, r: 44, fill: 'none', stroke: css('--good'), 'stroke-width': 5 }, r.ctx.svg); },
  async hint2(item, r) { if (!item.n) { await S('gen.match.emptyHint'); return; } await badgeCount(r.ctx.svg, r.ctx.tg.map(t => ({ x: t.p.x, y: t.p.y - 14 })), css('--square')); },
  async together() {}, async reveal(item, r) { ITEM.digitMatch.mark(item, r); await S(numw(item.n)); }, praise: () => 'praiseCount', twin(item) { return { t: 'digitMatch', n: Math.max(0, Math.min(10, item.n + (rand() < .5 ? -1 : 1))) }; },
};
ITEM.fill = {
  make(spec) { return { ...spec, tag: 'fill', want: spec.n }; },
  async ask(item, mode, tries) { const svg = newStage(290, { oasis: false, ground: 0 }); const mb = mailboxAt(svg, 250, 104, 0); digitCard(svg, 250, 30, item.n, { size: .8 });
    const pile = layoutPts(10, 'row', 92, 104, 34); const inside = []; const pcs = pile.map((p, i) => { const g = el('g', { transform: `translate(${p.x} ${p.y})` }, svg); el('rect', { x: -12, y: -9, width: 24, height: 18, rx: 3, fill: '#fff', stroke: '#c98f55', 'stroke-width': 2 }, g); el('path', { d: 'M-12 -9 L0 1 L12 -9', fill: 'none', stroke: '#c98f55', 'stroke-width': 2 }, g); return { g, p, inB: false }; });
    const slot = j => ({ x: 250 - 26 + (j % 5) * 13, y: 104 - 30 + Math.floor(j / 5) * 20 });
    const place = (pc, on) => { pc.inB = on; if (on) inside.push(pc); else inside.splice(inside.indexOf(pc), 1); inside.forEach((q, j) => { const s = slot(j); q.g.setAttribute('transform', `translate(${s.x} ${s.y}) scale(.55)`); }); if (!on) pc.g.setAttribute('transform', `translate(${pc.p.x} ${pc.p.y})`); };
    if (tries >= 3) { await S('gen.fill.together'); for (let i = 0; i < item.n; i++) { place(pcs[i], true); await S(numw(i + 1), { noGap: true, num: true }); } }
    else { await S('gen.fill.ask'); }
    pcs.forEach(pc => { pc.g.style.cursor = 'pointer'; pc.g.setAttribute('role', 'button'); hitPad(pc.g, 56); pc.g.onclick = () => { place(pc, !pc.inB); SFX.pop(); if (pc.inB && !SET.muted && !FAST) say(...lineOf(numw(inside.length)), { num: true, noGap: true, free: true }); }; });
    const d = doneBtn(); AUTO({ kind: 'fill', ok: () => { while (inside.length < item.n) place(pcs.find(q => !q.inB), true); while (inside.length > item.n) place(inside[inside.length - 1], false); d.b.click(); }, wrong: () => { while (inside.length < item.n + 1) place(pcs.find(q => !q.inB), true); d.b.click(); } });
    const ans = await gate(new Promise(res => d.b.onclick = () => { AUTO_CLEAR(); hush(); d.bar.remove(); res(inside.length); }));
    return { ans, ctx: { svg, inside, slot } }; },
  judge(item, n) { return n === item.n ? { ok: true } : { ok: false, err: n > item.n ? 'tooMany' : 'tooFew' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { await badgeCount(r.ctx.svg, r.ctx.inside.map((q, j) => { const s = r.ctx.slot(j); return { x: s.x, y: s.y - 12 }; }), css('--square')); },
  async together() {}, async reveal(item) { await S('gen.produce.reveal'); await S(numw(item.n)); }, praise: () => 'praiseCount', twin(item) { return { t: 'fill', n: Math.max(1, Math.min(9, item.n + (rand() < .5 ? -1 : 1))) }; },
};
ITEM.trace = {
  make(spec) { return { ...spec, tag: 'trace' + spec.n, want: 'ok' }; },
  async ask(item, mode, tries) { const svg = newStage(270, { oasis: false, ground: 0 }); const tr = digitTrace(svg, item.n, 180, 136, 1.55, { onShort: () => S('gen.trace.more', { ifIdle: true, free: true }) });
    if (tries === 0 && firstTime('digitTrace')) await tr.ghost(); if (tries >= 2) await tr.ghost();
    await S(tries >= 3 ? 'gen.trace.together' : 'gen.trace.ask'); const r = await tr.p; return { ans: r.ok ? 'ok' : r.err, ctx: { svg, tr } }; },
  judge(item, a) { return a === 'ok' ? { ok: true } : { ok: false, err: a }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2() {}, async together() {}, async reveal(item, r) { await r.ctx.tr.ghost(); }, praise: () => 'praiseLook', twin(item) { return { t: 'trace', n: item.n }; },
};

/* ⑥ المقارنة (N004): برجان (وقد يختلف حجم المكعبات)، أو بطاقتا رقمين */
function towerPair(svg, a, b, sa = 30, sb = 30, base = 200) { const A = towerAt(svg, 250, base, a, { size: sa, color: CUBE.plain }), B = towerAt(svg, 110, base, b, { size: sb, color: CUBE.plain }); return { A, B }; }
function eqButton(svg, x, y) { const g = el('g', { transform: `translate(${x} ${y})` }, svg); el('rect', { x: -40, y: -26, width: 80, height: 52, rx: 16, fill: css('--paper'), stroke: css('--compass'), 'stroke-width': 3 }, g);
  el('path', { d: 'M-16 -7h32M-16 7h32', stroke: css('--compass'), 'stroke-width': 5, 'stroke-linecap': 'round' }, g); return g; }
async function pairLines(svg, A, B, show = 1600) { const m = el('g', { 'pointer-events': 'none' }, svg); const n = Math.min(A.cubes.length, B.cubes.length);
  const yc = (T, i) => T.baseY - T.size * .62 - i * T.step;
  for (let i = 0; i < n; i++) { el('line', { x1: A.x - A.size * .6, y1: yc(A, i), x2: B.x + B.size * .6, y2: yc(B, i), stroke: css('--compass'), 'stroke-width': 3, 'stroke-dasharray': '5 4' }, m); SFX.tick(); await sleep(260); }
  const T = A.cubes.length > B.cubes.length ? A : B; for (let i = n; i < T.cubes.length; i++) el('circle', { cx: T.x, cy: yc(T, i), r: T.size * .7, fill: 'none', stroke: css('--think'), 'stroke-width': 4 }, m);
  await sleep(show); return m; }
ITEM.compare = {
  make(spec) { const it = { ...spec, tag: spec.sa !== spec.sb ? 'compareSize' : 'compare' }; const more = spec.ask !== 'less';
    it.want = spec.a === spec.b ? 'eq' : ((spec.a > spec.b) === more ? 'a' : 'b'); return it; },
  async ask(item, mode, tries) { const svg = newStage(270, { oasis: false, ground: 14 }); const { A, B } = towerPair(svg, item.a, item.b, item.sa || 26, item.sb || 26, 240);
    const eq = eqButton(svg, 180, 60); if (tries >= 3) { await S('gen.cmp.together'); await pairLines(svg, A, B, 600); }
    await S(item.ask === 'less' ? 'gen.cmp.less' : 'gen.cmp.more');
    const k = await tapOne([{ g: A.g, k: 'a', label: labelText('towerR') }, { g: B.g, k: 'b', label: labelText('towerL') }, { g: eq, k: 'eq', label: labelText('equal') }], { ok: item.want, pad: 76 });
    return { ans: k, ctx: { svg, A, B } }; },
  judge(item, k) { if (k === item.want) return { ok: true }; const taller = (item.a * (item.sa || 26)) > (item.b * (item.sb || 26)) ? 'a' : 'b';
    return { ok: false, err: item.want === 'eq' ? 'notEqual' : (item.sa !== item.sb && k === taller ? 'taller' : 'compare') }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { await pairLines(r.ctx.svg, r.ctx.A, r.ctx.B); },
  async together() {}, async reveal(item, r) { await pairLines(r.ctx.svg, r.ctx.A, r.ctx.B, 400); await S(item.want === 'eq' ? 'gen.cmp.equalNow' : 'gen.cmp.extra'); },
  praise: () => 'praiseCompare', twin(item) { return { ...item.spec, a: item.spec.b, b: item.spec.a, sa: item.spec.sb, sb: item.spec.sa }; },
};
ITEM.cmpDigits = {
  make(spec) { return { ...spec, tag: 'cmpDigits', want: Math.max(spec.a, spec.b) }; },
  async ask(item, mode, tries) { const svg = newStage(270, { oasis: false, ground: 0 }); const cards = [{ g: digitCard(svg, 250, 90, item.a, { size: 1.4 }), k: item.a, x: 250 }, { g: digitCard(svg, 110, 90, item.b, { size: 1.4 }), k: item.b, x: 110 }];
    if (tries >= 2) { towerAt(svg, 250, 262, item.a, { size: 14 }); towerAt(svg, 110, 262, item.b, { size: 14 }); }
    await S(tries >= 3 ? 'gen.cmpd.together' : 'gen.cmpd.ask'); const k = await tapOne(cards, { ok: item.want, pad: 96 }); return { ans: k, ctx: { svg, cards } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'smallerDigit' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.cmpd.towers'); }, async together() {}, async reveal(item) { await S(numw(item.want)); }, praise: () => 'praiseCompare', twin(item) { return { ...item.spec, a: item.spec.b, b: item.spec.a }; },
};
/* بناء برج: يساوي برج فرجار أو أكثر منه (إنتاج N004)، أو حتى عدد مطلوب (N006) */
async function buildPanel(svg, start, x = 110, base = 240, opt = {}) { let n = start; let T = towerAt(svg, x, base, n, { size: 26, color: opt.color || CUBE.lemon });
  const redraw = () => { T.g.remove(); T = towerAt(svg, x, base, n, { size: 26, color: opt.color || CUBE.lemon }); };
  const bar = document.createElement('div'); bar.className = 'choices icons build'; $('#stage').appendChild(bar);
  const mk = (k, ic, lbl, f) => { const b = document.createElement('button'); b.className = 'pick'; b.dataset.k = k; b.innerHTML = ic + `<span>${esc(G(labelText(lbl)))}</span>`; b.onclick = f; bar.appendChild(b); return b; };
  mk('plus', ICON.plus.replace('<svg', '<svg width="34" height="34"'), 'addCube', () => { if (n >= 10) return; n++; redraw(); SFX.pop(); if (!SET.muted && !FAST) say(...lineOf(numw(n)), { num: true, noGap: true, free: true }); });
  mk('minus', ICON.minus.replace('<svg', '<svg width="34" height="34"'), 'removeCube', () => { if (n <= 0) return; n--; redraw(); SFX.soft(); });
  const done = mk('done', ICON.check.replace('<svg', '<svg width="34" height="34"'), 'done', null);
  return { get n() { return n; }, set n(v) { n = v; redraw(); }, bar, done, tower: () => T }; }
ITEM.buildTower = {
  make(spec) { return { ...spec, tag: 'build-' + (spec.want || 'equal') }; },
  async ask(item, mode, tries) { const svg = newStage(270, { oasis: false, ground: 14 }); const ref = towerAt(svg, 250, 240, item.ref, { size: 26 }); const bp = await buildPanel(svg, tries >= 3 ? item.ref - 1 : 0);
    await S(tries >= 3 ? 'gen.build.together' : (item.want === 'more' ? 'gen.build.more' : 'gen.build.equal'));
    const target = item.want === 'more' ? item.ref + 1 : item.ref;
    AUTO({ kind: 'build', ok: () => { bp.n = target; bp.done.click(); }, wrong: () => { bp.n = Math.max(0, item.ref - 2); bp.done.click(); } });
    const ans = await gate(new Promise(res => bp.done.onclick = () => { AUTO_CLEAR(); hush(); bp.bar.remove(); res(bp.n); })); return { ans, ctx: { svg, ref, T: bp.tower() } }; },
  judge(item, n) { return (item.want === 'more' ? n > item.ref : n === item.ref) ? { ok: true } : { ok: false, err: item.want === 'more' ? 'notMore' : 'notEqual' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { await pairLines(r.ctx.svg, r.ctx.ref, r.ctx.T); }, async together() {}, async reveal(item) { await S('gen.build.reveal'); await S(numw(item.ref)); },
  praise: () => 'praiseCompare', twin(item) { return { ...item.spec, ref: Math.max(2, Math.min(8, item.spec.ref + 1)) }; },
};

/* ⑦ التفكيك (N005): برج بلونين، أو رفّان أحدهما مغطّى؛ وإنتاج طريقة جديدة */
ITEM.split = { ...numItem,
  make(spec) { return { ...spec, tag: spec.shelves ? 'shelves' : (spec.cover ? 'splitCover' : 'split'), want: spec.n - spec.k }; },
  async ask(item, mode, tries) { const svg = newStage(250, { oasis: false, ground: 14 }); let T, cover = null;
    if (item.shelves) { for (const y of [120, 220]) el('rect', { x: 20, y, width: 320, height: 10, rx: 4, fill: MAT.wood }, svg);
      T = { x: 250, cubes: Array.from({ length: item.k }, (_, i) => cubeAt(svg, 300 - i * 34, 104, 26, CUBE.lemon)) };
      const other = Array.from({ length: item.n - item.k }, (_, i) => cubeAt(svg, 300 - i * 34, 204, 26, CUBE.white)); T.white = other;
      cover = el('rect', { x: 20, y: 150, width: 320, height: 66, rx: 12, fill: '#c98f55', opacity: tries >= 2 ? .25 : .96 }, svg); el('text', { x: 180, y: 196, 'text-anchor': 'middle', 'font-size': 40, 'font-weight': 800, fill: '#fff', 'font-family': css('--f') }, svg).textContent = '؟'; }
    else { const colors = Array.from({ length: item.n }, (_, i) => i < item.k ? CUBE.lemon : CUBE.white); T = towerAt(svg, 180, 236, item.n, { size: 30, colors });
      if (item.cover) { cover = el('rect', { x: 140, y: T.top - 4, width: 80, height: (item.n - item.k) * T.step + 6, rx: 10, fill: '#c98f55', opacity: tries >= 2 ? .25 : .96 }, svg); } }
    if (tries >= 3) { await S('gen.split.together'); }
    if (item.shelves) { await S('gen.shelves.ask'); await S(numw(item.n)); } else if (item.cover) { await S('gen.split.cover'); await S(numw(item.n)); } else await S('gen.split.white');
    const np = numberPick(nearNums(item.n - item.k), item.n - item.k); return { ans: await np.p, ctx: { svg, T, np, cover } }; },
  judge(item, ans) { return ans === item.n - item.k ? { ok: true } : { ok: false, err: 'partWhole' }; },
  async hint2(item, r) { if (r.ctx.cover) r.ctx.cover.setAttribute('opacity', .2); await sleep(1400); },
  async together() {}, async reveal(item, r) { markNum(r, item.want, 'ok'); await S(numw(item.want)); },
  twin(item) { const k = Math.max(0, Math.min(item.spec.n, item.spec.k + (rand() < .5 ? -1 : 1))); return { ...item.spec, k }; },
};
ITEM.splitMake = {
  make(spec) { return { ...spec, tag: 'splitMake', want: 'new' }; },
  async ask(item, mode, tries) { const svg = newStage(260, { oasis: false, ground: 14 }); const lemon = new Set(); const colors = () => Array.from({ length: item.n }, (_, i) => lemon.has(i) ? CUBE.lemon : CUBE.white);
    let T = towerAt(svg, 180, 240, item.n, { size: 32, colors: colors() });
    const seen = el('g', {}, svg); (item.avoid || []).forEach((p, j) => towerAt(seen, 40 + j * 34, 240, item.n, { size: 13, colors: Array.from({ length: item.n }, (_, i) => i < p[0] ? CUBE.lemon : CUBE.white) }));
    const bind = () => T.cubes.forEach((c, i) => { c.style.cursor = 'pointer'; c.setAttribute('role', 'button'); hitPad(c, 64); c.onclick = () => { if (lemon.has(i)) lemon.delete(i); else lemon.add(i); T.g.remove(); T = towerAt(svg, 180, 240, item.n, { size: 32, colors: colors() }); bind(); SFX.pop(); }; });
    bind(); await S(tries >= 3 ? 'gen.splitMake.together' : 'gen.splitMake.ask');
    const d = doneBtn(); const firstNew = [...Array(item.n + 1).keys()].find(k => !(item.avoid || []).some(p => Math.min(...p) === Math.min(k, item.n - k)));
    AUTO({ kind: 'splitMake', ok: () => { lemon.clear(); for (let i = 0; i < firstNew; i++) lemon.add(i); d.b.click(); }, wrong: () => { lemon.clear(); const p = (item.avoid || [[0]])[0]; for (let i = 0; i < p[0]; i++) lemon.add(i); d.b.click(); } });
    const ans = await gate(new Promise(res => d.b.onclick = () => { AUTO_CLEAR(); hush(); d.bar.remove(); res(lemon.size); })); return { ans, ctx: { svg } }; },
  judge(item, k) { const lo = Math.min(k, item.n - k); return (item.avoid || []).some(p => Math.min(...p) === lo) ? { ok: false, err: 'sameSplit' } : { ok: true }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.splitMake.seen'); }, async together() {}, async reveal() { await S('gen.splitMake.reveal'); }, praise: () => 'praiseThink', twin(item) { return { ...item.spec }; },
  reason(item) { return null; },
};

/* ⑧ الجمع ضمّاً والطرح إبعاداً (N006) */
ITEM.join = { ...numItem,
  make(spec) { return { ...spec, tag: 'join', want: spec.a + spec.b }; },
  async ask(item, mode, tries) { const svg = newStage(260, { oasis: false, ground: 14 }); const A = towerAt(svg, 180, 240, item.a, { size: 24, color: CUBE.lemon }); const Bx = 60;
    const B = towerAt(svg, Bx, 240, item.b, { size: 24, color: CUBE.white });
    await S('gen.join.tap'); await tapOne([{ g: B.g, k: 'b', label: labelText('addCube') }], { ok: 'b', pad: 76 });
    await anim(B.g, [{ transform: 'translate(0px,0px)' }, { transform: `translate(${180 - Bx}px,${-(item.a) * A.step}px)` }], { duration: 800, fill: 'forwards', easing: 'cubic-bezier(.3,1.2,.6,1)' }).done;
    if (tries >= 3) { await S('gen.join.together'); await badgeCount(svg, Array.from({ length: item.b }, (_, i) => ({ x: 214, y: A.baseY - A.size * .62 - (item.a + i) * A.step })), css('--square'), item.a + 1); }
    await S('gen.join.ask'); const np = numberPick(nearNums(item.a + item.b), item.a + item.b); return { ans: await np.p, ctx: { svg, A, np } }; },
  judge(item, ans) { return ans === item.a + item.b ? { ok: true } : { ok: false, err: 'joinCount' }; },
  async hint2(item, r) { await S(numw(item.a), { noGap: true }); await badgeCount(r.ctx.svg, Array.from({ length: item.b }, (_, i) => ({ x: 214, y: r.ctx.A.baseY - r.ctx.A.size * .62 - (item.a + i) * r.ctx.A.step })), css('--square'), item.a + 1); },
  async together() {}, async reveal(item, r) { markNum(r, item.want, 'ok'); await readSentence(item.a, '+', item.b, item.want); },
  twin(item) { return { ...item.spec, b: Math.max(1, item.spec.b + (rand() < .5 ? -1 : 1)) }; },
};
ITEM.remove = { ...numItem,
  make(spec) { return { ...spec, tag: 'remove', want: spec.a - spec.b }; },
  async ask(item, mode, tries) { const svg = newStage(260, { oasis: false, ground: 14 }); const T = towerAt(svg, 180, 240, item.a, { size: 24, color: CUBE.lemon });
    const fz = mode === 'practice' && tries === 0 ? chaosAt(svg, 300, 60, .45) : null;
    const top = T.cubes.slice(item.a - item.b); if (fz) await chaosGiggle(fz);
    await Promise.all(top.map((c, i) => anim(c, [{ transform: c.getAttribute('transform') }, { transform: `translate(${300 - i * 10}px,${70 + i * 6}px) scale(.6)`, opacity: .9 }], { duration: 800, fill: 'forwards', delay: i * 80 }).done));
    const bag = el('path', { d: 'M270 48 q30 -14 60 0 l-6 40 q-24 10 -48 0z', fill: '#c98f55' }, svg);
    if (tries >= 3) { await S('gen.remove.together'); await badgeCount(svg, T.cubes.slice(0, item.a - item.b).map((c, i) => ({ x: 214, y: T.baseY - T.size * .62 - i * T.step })), css('--square')); }
    await S('gen.remove.ask'); const np = numberPick(nearNums(item.a - item.b), item.a - item.b); return { ans: await np.p, ctx: { svg, T, np } }; },
  judge(item, ans) { return ans === item.a - item.b ? { ok: true } : { ok: false, err: ans === item.b ? 'countedRemoved' : 'removeCount' }; },
  async hint2(item, r) { await badgeCount(r.ctx.svg, r.ctx.T.cubes.slice(0, item.a - item.b).map((c, i) => ({ x: 214, y: r.ctx.T.baseY - r.ctx.T.size * .62 - i * r.ctx.T.step })), css('--square')); },
  async together() {}, async reveal(item, r) { markNum(r, item.want, 'ok'); await readSentence(item.a, '-', item.b, item.want); },
  twin(item) { return { ...item.spec, b: Math.max(1, Math.min(item.spec.a - 1, item.spec.b + (rand() < .5 ? -1 : 1))) }; },
};
/* اختيار الجملة العددية لصورة (ضمّ أو إبعاد) من بطاقتين تُقرآن */
ITEM.sentence = {
  make(spec) { const c = spec.op === '+' ? spec.a + spec.b : spec.a - spec.b; return { ...spec, tag: 'sentence', want: spec.op, c }; },
  async ask(item, mode, tries) { const svg = newStage(220, { oasis: false, ground: 14 }); const A = towerAt(svg, 180, 200, item.a, { size: 20, color: CUBE.lemon });
    if (item.op === '+') { const B = towerAt(svg, 70, 200, item.b, { size: 20, color: CUBE.white }); el('path', { d: 'M100 120 q30 -30 50 0', fill: 'none', stroke: css('--compass'), 'stroke-width': 4, 'marker-end': '' }, svg); }
    else { A.cubes.slice(item.a - item.b).forEach(c => c.setAttribute('opacity', .3)); el('path', { d: 'M230 80 q40 -10 60 20', fill: 'none', stroke: css('--think'), 'stroke-width': 4 }, svg); }
    await S(tries >= 3 ? 'gen.sentence.together' : 'gen.sentence.ask');
    const plus = { a: item.a, b: item.b, c: item.a + item.b }, minus = { a: item.a, b: item.b, c: item.a - item.b };
    const box = document.createElement('div'); box.className = 'choices cards sentences'; $('#stage').appendChild(box);
    const opts = shuffle([['+', plus], ['-', minus]]); let answered = false;
    const btns = opts.map(([op, v]) => { const b = document.createElement('button'); b.className = 'pick card'; b.dataset.k = op; b.innerHTML = `<span class="sent" dir="ltr">${esc(sentenceText(v.a, op, v.b, v.c))}</span>`; b.setAttribute('aria-label', sentenceText(v.a, op, v.b, v.c)); /*T*/if (TESTHOOK) b.dataset.ok = op === item.op;/*/T*/ box.appendChild(b); return b; });
    AUTO({ kind: 'sentence', ok: () => btns.find(b => b.dataset.k === item.op).click(), wrong: () => btns.find(b => b.dataset.k !== item.op).click() });
    const p = gate(new Promise(res => btns.forEach(b => b.onclick = () => { if (answered) return; answered = true; AUTO_CLEAR(); hush(); res(b.dataset.k); })));
    (async () => { for (const [i, b] of btns.entries()) { if (answered) break; b.classList.add('reading'); const [op, v] = opts[i]; await readSentence(v.a, op, v.b, v.c); b.classList.remove('reading'); } })();
    const k = await p; return { ans: k, ctx: { svg, btns } }; },
  judge(item, k) { return k === item.op ? { ok: true } : { ok: false, err: 'opConfuse' }; },
  onOk(item, r) { SFX.good(); r.ctx.btns.find(b => b.dataset.k === r.ans).classList.add('ok'); }, onWrong(item, r) { SFX.soft(); r.ctx.btns.find(b => b.dataset.k === r.ans).classList.add('no'); },
  mark(item, r) { r.ctx.btns.find(b => b.dataset.k === item.op).classList.add('ok'); },
  async hint2(item) { await S(item.op === '+' ? 'gen.sentence.joined' : 'gen.sentence.removed'); }, async together() {},
  async reveal(item, r) { ITEM.sentence.mark(item, r); await readSentence(item.a, item.op, item.b, item.c); }, praise: () => 'praiseThink', twin(item) { return { ...item.spec, op: item.spec.op === '+' ? '-' : '+' }; },
};
/* «=» تعني: ما على الجانبين متساوٍ */
ITEM.eqPair = {
  make(spec) { return { ...spec, tag: 'eqPair', want: spec.n === spec.parts[0] + spec.parts[1] ? 'yes' : 'no' }; },
  async ask(item, mode, tries) { const svg = newStage(260, { oasis: false, ground: 14 }); const L = towerAt(svg, 90, 240, item.n, { size: 22, color: CUBE.lemon });
    const colors = Array.from({ length: item.parts[0] + item.parts[1] }, (_, i) => i < item.parts[0] ? CUBE.lemon : CUBE.white); const Rt = towerAt(svg, 270, 240, colors.length, { size: 22, colors });
    const t = el('text', { x: 180, y: 160, 'text-anchor': 'middle', 'font-size': 56, 'font-weight': 800, fill: css('--compass'), 'font-family': css('--f') }, svg); t.textContent = '=';
    el('text', { x: 90, y: 34, 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: css('--ink'), 'font-family': css('--f') }, svg).textContent = DG(item.n);
    el('text', { x: 270, y: 34, 'text-anchor': 'middle', 'font-size': 30, 'font-weight': 800, fill: css('--ink'), 'font-family': css('--f'), direction: 'ltr', 'unicode-bidi': 'bidi-override' }, svg).textContent = `${DG(item.parts[0])} + ${DG(item.parts[1])}`;
    if (tries >= 3) { await S('gen.eq.together'); await pairLines(svg, Rt, L, 500); }
    await S('gen.eq.ask'); const k = await choosePick([['yes', labelText('yes'), PICKICON.yes], ['no', labelText('no'), PICKICON.no]], item.want); return { ans: k, ctx: { svg, L, Rt } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'eqMeaning' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { await pairLines(r.ctx.svg, r.ctx.Rt, r.ctx.L); }, async together() {}, async reveal(item) { await S(item.want === 'yes' ? 'gen.eq.yes' : 'gen.eq.no'); },
  praise: () => 'praiseCompare', twin(item) { return { ...item.spec, parts: [item.spec.parts[0], item.spec.parts[1] + (item.want === 'yes' ? 1 : -1)] }; },
};
ITEM.buildTo = {
  make(spec) { return { ...spec, tag: 'buildTo', want: spec.target }; },
  async ask(item, mode, tries) { const svg = newStage(270, { oasis: false, ground: 14 }); digitCard(svg, 260, 70, item.target, { size: 1.1 }); const bp = await buildPanel(svg, tries >= 3 ? item.target - 1 : item.start, 140);
    await S(tries >= 3 ? 'gen.buildTo.together' : 'gen.buildTo.ask'); if (tries < 3) await S(numw(item.target));
    AUTO({ kind: 'buildTo', ok: () => { bp.n = item.target; bp.done.click(); }, wrong: () => { bp.n = item.target + 1; bp.done.click(); } });
    const ans = await gate(new Promise(res => bp.done.onclick = () => { AUTO_CLEAR(); hush(); bp.bar.remove(); res(bp.n); })); return { ans, ctx: { svg, T: bp.tower() } }; },
  judge(item, n) { return n === item.target ? { ok: true } : { ok: false, err: n > item.target ? 'tooMany' : 'tooFew' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { await badgeCount(r.ctx.svg, r.ctx.T.cubes.map((c, i) => ({ x: 176, y: r.ctx.T.baseY - r.ctx.T.size * .62 - i * r.ctx.T.step })), css('--square')); },
  async together() {}, async reveal(item) { await S('gen.build.reveal'); await S(numw(item.target)); }, praise: () => 'praiseCount', twin(item) { return { ...item.spec, target: Math.max(2, Math.min(10, item.spec.target + 1)) }; },
};
/* المجهول في أول الجملة (مدخل غير مُختبَر، في «التحدّي» وحده) */
ITEM.unknownStart = { ...numItem,
  make(spec) { return { ...spec, tag: 'unknownStart', want: spec.took + spec.left }; },
  async ask(item, mode, tries) { const svg = newStage(250, { oasis: false, ground: 14 }); towerAt(svg, 180, 230, item.left, { size: 24, color: CUBE.lemon }); const fz = chaosAt(svg, 300, 70, .45);
    if (tries >= 2) { towerAt(svg, 300, 150, item.took, { size: 18, color: CUBE.lemon }); }
    await S(item.line); const np = numberPick(nearNums(item.want), item.want); return { ans: await np.p, ctx: { svg, np } }; },
  judge(item, ans) { return ans === item.want ? { ok: true } : { ok: false, err: 'unknownStart' }; },
  async hint2() { await S('gen.unknown.return'); }, async together() {}, async reveal(item, r) { markNum(r, item.want, 'ok'); await S(numw(item.want)); }, twin: () => null,
};
/* ⑨ الطلاقة حتى 5 (N007): «أصابعي الخمس» بلا عدّاد ضاغط */
ITEM.fact = { ...numItem,
  make(spec) { return { ...spec, tag: 'fact', want: spec.op === '+' ? spec.a + spec.b : spec.a - spec.b }; },
  async ask(item, mode, tries) { const svg = newStage(250, { oasis: false, ground: 0 });
    if (item.op === '+') { handAtN(svg, 250, 110, item.a, 1.3); handAtN(svg, 110, 110, item.b, 1.3); } else { handAtN(svg, 180, 110, item.a, 1.4); }
    sentenceAt(svg, 180, 214, item.a, item.op, item.b, null);
    await readSentence(item.a, item.op, item.b); await S('gen.fact.ask'); const np = numberPick(nearNums(item.want, 5), item.want); return { ans: await np.p, ctx: { svg, np } }; },
  judge(item, ans) { return ans === item.want ? { ok: true } : { ok: false, err: 'factWrong' }; },
  async hint2(item) { await S('gen.fact.fingers'); }, async together() {}, async reveal(item, r) { markNum(r, item.want, 'ok'); await readSentence(item.a, item.op, item.b, item.want); }, twin: () => null,
};
/* ⑩ قصص الواحة (مراجعة اليوم): القصة مسموعة، ويمثّلها الطفل بالمكعبات، ثم «كم؟» والجملة العددية */
ITEM.story = { ...numItem,
  make(spec) { return { ...spec, tag: 'story', want: spec.op === '+' ? spec.a + spec.b : spec.a - spec.b }; },
  async ask(item, mode, tries) { const svg = newStage(260, { oasis: false, ground: 14 });
    await S(item.line); const bp = await buildPanel(svg, item.a, 180); await S(item.op === '+' ? 'gen.story.add' : 'gen.story.remove');
    AUTO({ kind: 'story', ok: () => { bp.n = item.want; bp.done.click(); } });
    await gate(new Promise(res => bp.done.onclick = () => { AUTO_CLEAR(); hush(); bp.bar.remove(); res(); }));
    await S('gen.story.ask'); const np = numberPick(nearNums(item.want), item.want); return { ans: await np.p, ctx: { svg, np, T: bp.tower() } }; },
  judge(item, ans) { return ans === item.want ? { ok: true } : { ok: false, err: item.op === '+' ? 'joinCount' : 'removeCount' }; },
  async onOk(item, r) { SFX.good(); markNum(r, r.ans, 'ok'); sentenceAt(r.ctx.svg, 180, 40, item.a, item.op, item.b, item.want); await readSentence(item.a, item.op, item.b, item.want); },
  async hint2(item) { await S(item.op === '+' ? 'gen.story.hintAdd' : 'gen.story.hintRemove'); }, async together() {},
  async reveal(item, r) { markNum(r, item.want, 'ok'); sentenceAt(r.ctx.svg, 180, 40, item.a, item.op, item.b, item.want); await readSentence(item.a, item.op, item.b, item.want); }, twin: () => null,
};
/* مجموعتان، إحداهما متباعدة (N002): أيّهما أكثر؟ أم متساويتان؟ */
ITEM.groups = {
  make(spec) { return { ...spec, tag: 'groups', want: spec.a === spec.b ? 'eq' : (spec.a > spec.b ? 'a' : 'b') }; },
  async ask(item, mode, tries) { const svg = newStage(270, { oasis: false, ground: 0 }); const proto = make(item.mk);
    const rowA = layoutPts(item.a, 'row', 180, 70, item.spread === 'b' ? 44 : 64), rowB = layoutPts(item.b, 'row', 180, 170, item.spread === 'b' ? 64 : 40);
    const gA = el('g', {}, svg), gB = el('g', {}, svg); rowA.forEach(p => thingAt(gA, { ...proto, size: 34, label: null }, p.x, p.y)); rowB.forEach(p => thingAt(gB, { ...proto, size: 34, label: null }, p.x, p.y));
    hitPad(gA, 80); hitPad(gB, 80); const eq = eqButton(svg, 180, 236);
    if (tries >= 3) { await S('gen.cmp.together'); await badgeCount(svg, rowA.map(p => ({ x: p.x, y: p.y - 26 }))); await badgeCount(svg, rowB.map(p => ({ x: p.x, y: p.y - 26 })), css('--square')); }
    await S('gen.groups.ask'); const k = await tapOne([{ g: gA, k: 'a', label: labelText('groupTop') }, { g: gB, k: 'b', label: labelText('groupBottom') }, { g: eq, k: 'eq', label: labelText('equal') }], { ok: item.want, pad: 76 });
    return { ans: k, ctx: { svg, rowA, rowB } }; },
  judge(item, k) { if (k === item.want) return { ok: true }; const spreadK = item.spread === 'b' ? 'b' : 'a'; return { ok: false, err: k === spreadK ? 'spreadMore' : 'compare' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const m = el('g', { 'pointer-events': 'none' }, r.ctx.svg); const n = Math.min(item.a, item.b);
    for (let i = 0; i < n; i++) { el('line', { x1: r.ctx.rowA[i].x, y1: r.ctx.rowA[i].y + 18, x2: r.ctx.rowB[i].x, y2: r.ctx.rowB[i].y - 18, stroke: css('--compass'), 'stroke-width': 3, 'stroke-dasharray': '5 4' }, m); SFX.tick(); await sleep(260); }
    await sleep(1400); m.remove(); },
  async together() {}, async reveal(item) { await S(item.want === 'eq' ? 'gen.cmp.equalNow' : 'gen.cmp.extra'); }, praise: () => 'praiseCompare', twin(item) { return { ...item.spec, spread: item.spec.spread === 'b' ? 'a' : 'b' }; },
};
