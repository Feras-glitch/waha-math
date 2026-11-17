/* =====================================================================
   S1-U5 «الأنماط السحرية» (C018، C019، C026، C020): صفّ النمط وأدواته، وبنوده، ومشاهده.
   · العنصر (token): شكل بلون هويته (tri مثلث بنفسجي، cir دائرة مرجانية، sq مربع أخضر مزرق)، أو خرزة بلون حرّ (bR، bB، bY، bG)،
     أو صوت (clap تصفيق، drum دقّ).
   · الصفّ يُقرأ من اليمين إلى اليسار كالكتابة العربية، وسهمٌ صغير فوق أوله يُري من أين نبدأ. (طريق الأعداد والمسطرة من اليسار: D229،
     وذاك للأعداد وحدها.)
   · سلّم المساعدة (D240): السؤال من errors.json، ثم حركة الأداة «قراءة الإيقاع» (كل عنصر ينبض بنغمته، فيُسمع انكسار النمط)،
     ثم الحلّ المشترك: حلقات حول الوحدات المتكررة تُرسم في ask عند tries >= 3، والخطوة الأخيرة للطفل.
   ===================================================================== */
const PAT = {
  tri: { shape: { type: 'triangle', w: 1, h: .9 }, idc: 'triangle', tone: 523 }, cir: { shape: { type: 'circle' }, idc: 'circle', tone: 784 }, sq: { shape: { type: 'square' }, idc: 'square', tone: 659 },
  bR: { bead: '#d9483b', tone: 523 }, bB: { bead: '#3d7cc0', tone: 784 }, bY: { bead: '#f2b33d', tone: 659 }, bG: { bead: '#4f9a6a', tone: 880 },
  clap: { tone: 0 }, drum: { tone: 0 } };
const patName = t => 'gen.pat.n.' + t;
const patSeq = (unit, n) => Array.from({ length: n }, (_, i) => unit[i % unit.length]);
const patIsBead = seq => seq.some(t => PAT[t] && PAT[t].bead);

/* صوتا الإشعال: تصفيق (ضجيج قصير حادّ) ودقّ (نغمة منخفضة تهبط)، بلا ملفات */
function patNoise(dur, freq) { if (SET.muted) return; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const n = Math.floor(AC.sampleRate * dur), b = AC.createBuffer(1, n, AC.sampleRate), ch = b.getChannelData(0);
  for (let i = 0; i < n; i++) ch[i] = (drand() * 2 - 1) * Math.pow(1 - i / n, 3);
  const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); s.buffer = b; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = .9; g.gain.value = .5; s.connect(f).connect(g).connect(AC.destination); s.start(); } catch (e) {} }
SFX.clap = () => { patNoise(.09, 1700); setTimeout(() => patNoise(.06, 2300), 14); };
SFX.drum = () => { if (SET.muted) return; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine';
  o.frequency.setValueAtTime(170, t); o.frequency.exponentialRampToValueAtTime(70, t + .22); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.5, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + .28);
  o.connect(g).connect(AC.destination); o.start(t); o.stop(t + .3); } catch (e) {} };
const patSound = t => { if (t === 'clap') SFX.clap(); else if (t === 'drum') SFX.drum(); else tone([[PAT[t].tone, .16]]); };

/* ---------- رسم العنصر ---------- */
function patTokAt(parent, t, x, y, size = 40) {
  const g = el('g', { transform: `translate(${x} ${y})`, 'data-tok': t }, parent), P = PAT[t];
  if (P.shape) { const s = P.shape; shapeAt(g, { type: s.type, size, w: s.w ? size * s.w * 1.06 : undefined, h: s.h ? size * s.h * 1.06 : undefined, color: css(IDC[P.idc]) }, 0, s.type === 'triangle' ? size * .04 : 0); }
  else if (P.bead) { const r = size / 2;
    el('ellipse', { cx: 0, cy: r * .92, rx: r * .8, ry: r * .16, fill: '#1b3440', opacity: .13 }, g);
    el('circle', { r, fill: P.bead, stroke: '#fff', 'stroke-width': Math.max(2, size * .07) }, g);
    el('path', { d: `M${-r * .62} ${r * .1} A${r * .66} ${r * .66} 0 0 0 ${r * .1} ${r * .62}`, fill: 'none', stroke: '#1b3440', 'stroke-opacity': .16, 'stroke-width': r * .2, 'stroke-linecap': 'round' }, g);
    el('ellipse', { cx: -r * .3, cy: -r * .36, rx: r * .3, ry: r * .19, fill: '#fff', opacity: .6, transform: `rotate(-32 ${-r * .3} ${-r * .36})` }, g); }
  else if (t === 'clap') { const k = size / 60, h = el('g', { transform: `scale(${k})` }, g);   /* كفّان متقابلتان */
    for (const s of [-1, 1]) { const a = el('g', { transform: `scale(${s} 1) rotate(-14)` }, h);
      el('path', { d: 'M4 26 Q-2 6 2 -14 Q3 -27 9 -27 Q14 -27 15 -14 L16 -2 Q24 -8 27 -3 Q29 1 22 9 Q18 20 14 27 Z', fill: '#f2c79c', stroke: '#b9794e', 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, a); }
    for (const [x1, y1, x2, y2] of [[0, -34, 0, -42], [-13, -30, -18, -37], [13, -30, 18, -37]]) el('line', { x1, y1, x2, y2, stroke: '#e0993a', 'stroke-width': 3, 'stroke-linecap': 'round' }, h); }
  else if (t === 'drum') { const k = size / 60, h = el('g', { transform: `scale(${k})` }, g);   /* طبلة وعصوان */
    el('path', { d: 'M-24 -6 V16 A24 9 0 0 0 24 16 V-6', fill: '#c8643f', stroke: '#fff', 'stroke-width': 2.5 }, h);
    for (const x of [-16, -5, 6, 17]) el('path', { d: `M${x} 3 l5 16`, stroke: '#f6cf7e', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, h);
    el('ellipse', { cx: 0, cy: -6, rx: 24, ry: 9, fill: '#f8ecd2', stroke: '#fff', 'stroke-width': 2.5 }, h);
    for (const s of [-1, 1]) { el('line', { x1: s * 6, y1: -12, x2: s * 24, y2: -34, stroke: MAT.woodDk, 'stroke-width': 3.6, 'stroke-linecap': 'round' }, h); el('circle', { cx: s * 6, cy: -12, r: 3.6, fill: MAT.woodDk }, h); } }
  return g;
}
/* مكان فارغ: مربع منقّط وعلامة سؤال */
function patSlotAt(parent, x, y, size) { const g = el('g', { transform: `translate(${x} ${y})`, 'data-slot': 1 }, parent), r = size / 2 + 3;
  el('rect', { x: -r, y: -r, width: 2 * r, height: 2 * r, rx: 10, fill: '#fffdf6', 'fill-opacity': .75, stroke: css('--compass'), 'stroke-width': 2.6, 'stroke-dasharray': '6 5' }, g);
  const q = el('text', { y: size * .2, 'text-anchor': 'middle', 'font-size': size * .56, 'font-weight': 800, fill: css('--compass'), 'font-family': css('--f'), opacity: .75 }, g); q.textContent = '؟'; return g; }

/* صفّ النمط: seq عناصره من اليمين إلى اليسار، وبعدها slots أماكن فارغة. يعيد {g, els:[{g,x,y,t,i}], slots:[{g,x,y,i}], step, size, y} */
function patRowAt(svg, seq, opt = {}) {
  const n = seq.length + (opt.slots || 0), y = opt.y ?? 100, step = opt.step || Math.min(56, 280 / Math.max(1, n - 1)), size = opt.size || Math.min(46, step - 8);
  const xR = (opt.cx ?? 180) + (n - 1) * step / 2, g = el('g', { 'data-pat': seq.join(',') }, opt.parent || svg), X = i => xR - i * step;
  if (opt.card) el('rect', { x: X(n - 1) - step / 2 - 4, y: y - size / 2 - 18, width: (n - 1) * step + step + 8, height: size + 36, rx: 16, fill: '#fffdf6', 'fill-opacity': .9, stroke: css('--line'), 'stroke-width': 2.5 }, g);
  if (opt.string ?? patIsBead(seq)) {   /* خيط السلسلة، وعقدة عند أوله */
    el('path', { d: `M${xR + size / 2 + 9} ${y} H${X(n - 1) - size / 2 - 9}`, stroke: '#8a6a4a', 'stroke-width': 3, 'stroke-linecap': 'round', fill: 'none' }, g); el('circle', { cx: xR + size / 2 + 9, cy: y, r: 4.5, fill: '#8a6a4a' }, g); }
  if (opt.arrow !== false) { const ax = xR, ay = y - size / 2 - (opt.card ? 6 : 12);   /* من هنا نبدأ القراءة */
    el('path', { d: `M${ax + 9} ${ay - 9} H${ax - 9} M${ax - 3} ${ay - 15} L${ax - 10} ${ay - 9} L${ax - 3} ${ay - 3}`, fill: 'none', stroke: css('--muted'), 'stroke-width': 2.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'data-start': 1 }, g); }
  const els = seq.map((t, i) => ({ g: patTokAt(g, t, X(i), y, size), x: X(i), y, t, i }));
  const slots = Array.from({ length: opt.slots || 0 }, (_, k) => { const i = seq.length + k; return { g: patSlotAt(g, X(i), y, size), x: X(i), y, i }; });
  return { g, els, slots, step, size, y, X, svg };
}
/* حلقات الوحدات: حلقة حول كل u عنصراً متتالياً (والأماكن الفارغة تُحسب)؛ والناقصة منقّطة. bad: رقم حلقة تُلوَّن تنبيهاً (المثال المحلول) */
function patLoops(parent, row, u, opt = {}) { const n = row.els.length + row.slots.length, out = [], pad = 5;
  for (let a = 0; a < n; a += u) { const b = Math.min(n - 1, a + u - 1), part = b - a + 1 < u || b >= row.els.length, k = a / u;
    const xL = row.X(b) - row.size / 2 - pad, xRr = row.X(a) + row.size / 2 + pad;
    out.push(el('rect', { x: xL, y: row.y - row.size / 2 - pad - 2, width: xRr - xL, height: row.size + 2 * pad + 4, rx: 14, fill: 'none', stroke: k === opt.bad ? css('--chaos') : css('--compass'), 'stroke-width': 3.4,
      'stroke-dasharray': part || k === opt.bad ? '7 5' : null, 'pointer-events': 'none', 'data-loop': k }, parent)); }
  return out; }
async function patLoopsIn(parent, row, u, opt) { const L = patLoops(parent, row, u, opt); for (const r of L) { r.setAttribute('opacity', 0); }
  for (const r of L) { SFX.tick(); r.setAttribute('opacity', 1); await anim(r, [{ opacity: 0 }, { opacity: 1 }], { duration: 260 }).done; await sleep(180); } return L; }
/* قراءة الإيقاع: كل عنصر ينبض بنغمته. names: يُقال اسمه (في المثال المحلول) */
async function patSweep(row, opt = {}) { for (const e of row.els) { patSound(e.t);
    const a = anim(e.g, [{ transform: `translate(${e.x}px,${e.y}px) scale(1)` }, { transform: `translate(${e.x}px,${e.y - 9}px) scale(1.16)` }, { transform: `translate(${e.x}px,${e.y}px) scale(1)` }], { duration: 300 });
    if (opt.names) await S(patName(e.t), { noGap: true, num: true }); else await sleep(opt.gap || 330); await a.done.catch(() => {}); } }
/* عنصر يُوضع في مكانه بقفزة صغيرة */
function patDrop(row, t, at, parent) { const g = patTokAt(parent || row.g, t, at.x, at.y, row.size);
  anim(g, [{ transform: `translate(${at.x}px,${at.y - 26}px) scale(.7)`, opacity: .4 }, { transform: `translate(${at.x}px,${at.y}px) scale(1.12)`, opacity: 1 }, { transform: `translate(${at.x}px,${at.y}px) scale(1)`, opacity: 1 }], { duration: 320 }); return g; }
const patLabel = t => T(patName(t));

/* ================= ① ما التالي؟ وأكمل النمط (C019): unit، n عناصر ظاهرة، slots أماكن (1–3)، pool خيارات الصينية ================= */
ITEM.patNext = {
  make(spec) { const seq = patSeq(spec.unit, spec.n), k = spec.slots || 1, want = Array.from({ length: k }, (_, i) => spec.unit[(spec.n + i) % spec.unit.length]);
    return { ...spec, seq, k, want, tray: shuffle(spec.pool || [...new Set(spec.unit)]), tag: 'pat-next' + k + '-u' + spec.unit.length }; },
  async ask(item, mode, tries) { const svg = newStage(280, { oasis: false, ground: 0 }), help = tries >= 3;
    const row = patRowAt(svg, item.seq, { slots: item.k, y: 96 }); if (help) patLoops(helpG(svg), row, item.unit.length);
    /* الصينية: الخيارات كبيرة تحت الصفّ */
    const tn = item.tray.length, tx = i => 180 + (tn - 1) * 48 - i * 96; el('rect', { x: 180 - tn * 48 - 6, y: 172, width: tn * 96 + 12, height: 84, rx: 22, fill: '#fffdf6', 'fill-opacity': .92, stroke: css('--line'), 'stroke-width': 2.5 }, svg);
    const tray = item.tray.map((t, i) => ({ g: patTokAt(svg, t, tx(i), 214, 52), k: t, label: patLabel(t) }));
    say(...lineOf(help ? 'gen.pat.together.next' : item.q), { free: true }); const picks = [];
    for (let s = 0; s < item.k; s++) { const sl = row.slots[s]; sl.g.classList.add('pulse');
      const t = await tapOne(tray, { ok: item.want[s], pad: 84, pulse: false, kind: s ? 'tap' + (s + 1) : 'tap' })   /* kind: للسائق الآلي، كل مكان خطوة */; sl.g.classList.remove('pulse'); if (s === 0) hush();
      picks.push(t); sl.g.setAttribute('opacity', 0); patDrop(row, t, sl, svg); patSound(t); await sleep(260); }
    return { ans: picks, ctx: { svg, row } }; },
  judge(item, a) { if (a.length === item.want.length && a.every((t, i) => t === item.want[i])) return { ok: true };
    const last = item.seq[item.seq.length - 1]; return { ok: false, err: a[0] === last && item.want[0] !== last ? 'patRepeat' : 'patWrong' }; },
  onOk(item, r) { SFX.good(); for (const s of r.ctx.row.slots) okRing(r.ctx.svg, s.g, 2); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { await patSweep(r.ctx.row); }, async together() {},
  async reveal(item, r) { const { svg, row } = r.ctx; const m = helpG(svg); patLoops(m, row, item.unit.length);
    row.slots.forEach((s, i) => { el('rect', { x: s.x - row.size / 2 - 2, y: s.y - row.size / 2 - 2, width: row.size + 4, height: row.size + 4, rx: 8, fill: css('--paper') }, m); patDrop(row, item.want[i], s, m); });
    await S('gen.pat.reveal.next'); },
  praise: () => 'praisePattern', twin(item) { return item.twin || null; },
};

/* ================= ② أين الخطأ؟ (C019): unit، n، bad رقم العنصر الخطأ (من 0)، badTok ما وُضع مكانه ================= */
const patBroken = spec => { const seq = patSeq(spec.unit, spec.n); seq[spec.bad] = spec.badTok; return seq; };
function patSwap(row, i, t) { const e = row.els[i]; e.g.remove(); e.g = patDrop(row, t, e); e.t = t; return e.g; }
ITEM.patFix = {
  make(spec) { return { ...spec, seq: patBroken(spec), want: spec.bad, right: spec.unit[spec.bad % spec.unit.length], tag: 'pat-fix-u' + spec.unit.length }; },
  async ask(item, mode, tries) { const svg = newStage(230, { oasis: false, ground: 0 }), help = tries >= 3;
    const row = patRowAt(svg, item.seq, { y: 112 }); if (help) patLoops(helpG(svg), row, item.unit.length);
    say(...lineOf(help ? 'gen.pat.together.fix' : item.q), { free: true });
    const k = await tapOne(row.els.map(e => ({ g: e.g, k: e.i, label: patLabel(e.t) })), { ok: item.want, pad: 56, pulse: false }); hush(); return { ans: k, ctx: { svg, row } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'patFixWrong' }; },
  async onOk(item, r) { SFX.good(); const g = patSwap(r.ctx.row, item.want, item.right); await sleep(340); okRing(r.ctx.svg, g, 4); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { await patSweep(r.ctx.row); }, async together() {},
  async reveal(item, r) { const { svg, row } = r.ctx; patLoops(helpG(svg), row, item.unit.length); okRing(svg, row.els[item.want].g, 4); await sleep(500); patSwap(row, item.want, item.right); await S('gen.pat.reveal.fix'); },
  praise: () => 'praisePattern', twin(item) { return item.twin || null; },
};

/* ================= ③ أيّ الصفّين نمط؟ (C018): rows صفّان، كلٌّ {unit، n} نمط أو {seq} ليس نمطاً ================= */
ITEM.patIs = {
  make(spec) { const rows = spec.rows.map(r => r.seq ? { seq: r.seq, pat: false } : { seq: patSeq(r.unit, r.n), pat: true, u: r.unit.length }); return { ...spec, R: rows, want: rows.findIndex(r => r.pat), tag: 'pat-is' }; },
  async ask(item, mode, tries) { const svg = newStage(280, { oasis: false, ground: 0 }), help = tries >= 3, u = item.R[item.want].u;
    const rows = item.R.map((r, i) => patRowAt(svg, r.seq, { y: 78 + i * 128, card: true, step: 50, size: 40 })); if (help) rows.forEach(row => patLoops(helpG(svg), row, u));
    say(...lineOf(help ? 'gen.pat.together.is' : item.q), { free: true });
    const k = await tapOne(rows.map((row, i) => ({ g: row.g, k: i, label: labelText(i ? 'patRow2' : 'patRow1') })), { ok: item.want, pad: false }); hush(); return { ans: k, ctx: { svg, rows } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'patIsWrong' }; },
  onOk(item, r) { SFX.good(); okRing(r.ctx.svg, r.ctx.rows[r.ans].g, 2); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { for (const row of r.ctx.rows) { await patSweep(row, { gap: 280 }); await sleep(380); } }, async together() {},
  async reveal(item, r) { const { svg, rows } = r.ctx; patLoops(helpG(svg), rows[item.want], item.R[item.want].u); okRing(svg, rows[item.want].g, 2); await S('gen.pat.reveal.is'); },
  praise: () => 'praisePattern', twin(item) { return item.twin || null; },
};

/* ================= المشاهد ================= */
/* الإشعال: إيقاع تصفيق ودقّ، ثم «ما الذي يأتي بعده؟» بلا حكم (إشعال لا تقييم)، ثم يكتمل الإيقاع أمامه */
SCENES.rhythmHook = async c => {
  const svg = newStage(280, { oasisOpacity: .2 }); const [l1, l2, l3] = c.lines;
  const big = { clap: patTokAt(svg, 'clap', 232, 196, 92), drum: patTokAt(svg, 'drum', 112, 204, 92) }, at = { clap: [232, 196], drum: [112, 204] };
  el('rect', { x: 14, y: 30, width: 332, height: 64, rx: 18, fill: '#fffdf6', 'fill-opacity': .9, stroke: css('--line'), 'stroke-width': 2.5 }, svg);
  let n = 0; const beat = async t => { const [x, y] = at[t]; patSound(t); patTokAt(svg, t, 318 - n * 40, 64, 34); n++;
    await anim(big[t], [{ transform: `translate(${x}px,${y}px) scale(1)` }, { transform: `translate(${x}px,${y}px) scale(1.18)` }, { transform: `translate(${x}px,${y}px) scale(1)` }], { duration: 260 }).done.catch(() => {}); await sleep(300); };
  await S(l1); for (const t of ['clap', 'drum', 'clap', 'drum']) await beat(t);
  const k = await answerWhile(l2, () => tapOne([{ g: big.clap, k: 'clap', label: labelText('clap') }, { g: big.drum, k: 'drum', label: labelText('drum') }], { ok: 'clap', pad: 96 }));
  logAttempt({ scene: 'hook', tag: 'rhythm', ok: k === 'clap' });
  for (const t of ['clap', 'drum', 'clap', 'drum']) await beat(t);
  await S(l3);
};
/* الاكتشاف: يلمس الطفل كل عنصر من أول الصفّ فيُسمع اسمه، ثم تُحاط الوحدات بحلقات. c: {unit, n, intro, after:[…]} */
SCENES.patRead = async c => {
  const svg = newStage(250, { oasis: false, ground: 0 }), seq = patSeq(c.unit, c.n), row = patRowAt(svg, seq, { y: 112 });
  say(...lineOf(c.intro), { free: true });
  for (const e of row.els) { await tapOne([{ g: e.g, k: e.i, label: patLabel(e.t) }], { ok: e.i, pad: 56 }); if (e.i === 0) hush(); patSound(e.t); buzz(20);
    anim(e.g, [{ transform: `translate(${e.x}px,${e.y}px) scale(1)` }, { transform: `translate(${e.x}px,${e.y - 9}px) scale(1.16)` }, { transform: `translate(${e.x}px,${e.y}px) scale(1)` }], { duration: 300 });
    say(...lineOf(patName(e.t)), { num: true, noGap: true, free: true }); }
  logAttempt({ scene: 'explore', tag: 'patRead', ok: true }); await sleep(500); hush();
  await patLoopsIn(helpG(svg), row, c.unit.length); await S(c.after);
};
/* المثال المحلول: (أ) ما التالي؟ نقرأ، ونحيط الوحدات، والحلقة الأخيرة ناقصة فيكملها الطفل بلمسة. (ب) صفّ فيه خطأ: الحلقة التي لا تشبه أخواتها */
SCENES.patWorked = async c => {
  const L = c.lines, A = c.a, B = c.b;
  { const svg = newStage(230, { oasis: false, ground: 0 }), row = patRowAt(svg, patSeq(A.unit, A.n), { slots: 1, y: 112 }), sl = row.slots[0], want = A.unit[A.n % A.unit.length];
    await S(L[0]); await patSweep(row, { names: true }); await patLoopsIn(helpG(svg), row, A.unit.length); await S(L[1]);
    await answerWhile(L[2], () => tapOne([{ g: sl.g, k: 's', label: labelText('patSlot') }], { ok: 's', pad: 64 }));
    sl.g.setAttribute('opacity', 0); patDrop(row, want, sl, svg); patSound(want); SFX.good(); await S(patName(want), { noGap: true, num: true }); await sleep(700); }
  { const svg = newStage(230, { oasis: false, ground: 0 }), seq = patBroken(B), row = patRowAt(svg, seq, { y: 112 });
    await S(L[3]); await patSweep(row); await patLoopsIn(helpG(svg), row, B.unit.length, { bad: Math.floor(B.bad / B.unit.length) });
    S(L[4], { free: true });
    while (true) { const k = await tapOne(row.els.map(e => ({ g: e.g, k: e.i, label: patLabel(e.t) })), { ok: B.bad, pad: 56, pulse: false }); if (k === B.bad) break; SFX.soft(); }
    hush(); SFX.good(); patSwap(row, B.bad, B.unit[B.bad % B.unit.length]); svg.querySelectorAll('[data-loop]').forEach(r => { r.setAttribute('stroke', css('--compass')); r.removeAttribute('stroke-dasharray'); });
    await sleep(400); await S(L[5]); }
};
/* «صحّح لفوضى»: سلسلة فيها خرزة بلون فوضى المفضّل تكسر النمط؛ يجدها الطفل فتُستبدل */
SCENES.chaosPattern = async C => {
  const svg = newStage(240, { oasis: false, ground: 0 }), row = patRowAt(svg, patBroken(C), { y: 132 });
  const fz = chaosAt(svg, 44, 46, .4); await chaosGiggle(fz); S(C.find, { free: true }); let tries = 0;
  while (true) { const k = await tapOne(row.els.map(e => ({ g: e.g, k: e.i, label: patLabel(e.t) })), { ok: C.bad, pad: 56, pulse: false }); tries++;
    logAttempt({ scene: 'chaos', tag: 'find', ok: k === C.bad, firstTry: tries === 1 }); if (k === C.bad) break; hush(); SFX.soft(); await S('gen.chaos.no'); if (tries === 2) await patSweep(row); }
  hush(); SFX.good(); fz.remove(); const g = patSwap(row, C.bad, C.unit[C.bad % C.unit.length]); await sleep(340); okRing(svg, g, 4);
  await patLoopsIn(helpG(svg), row, C.unit.length); if (C.after) await S(C.after);
};
/* التذكّر قبل البنود العلاجية: الصفّ بحلقاته */
SCENES.recallPat = async c => { const P = c.pic, svg = newStage(220, { oasis: false, ground: 0 }), row = patRowAt(svg, patSeq(P.unit, P.n), { y: 112, slots: P.slots || 0 });
  await patLoopsIn(helpG(svg), row, P.unit.length); await S(c.lines); };

/* قطعة الواحة: عقد الخرز */
WRAP_ART.beads = svg => { const seq = patSeq(['bR', 'bB'], 11);
  el('path', { d: 'M40 150 Q180 300 320 150', fill: 'none', stroke: '#8a6a4a', 'stroke-width': 3 }, svg);
  seq.forEach((t, i) => { const u = (i + .5) / seq.length, x = 320 - 280 * u, y = 150 + 300 * u * (1 - u), g = patTokAt(svg, t, x, y, 26);
    anim(g, [{ opacity: 0, transform: `translate(${x}px,${y - 40}px)` }, { opacity: 1, transform: `translate(${x}px,${y}px)` }], { duration: 380, delay: 200 + i * 120, fill: 'both', easing: 'cubic-bezier(.3,1.4,.6,1)' }); });
  palmAt(svg, 330, 250, .7); palmAt(svg, 30, 250, .8); };
