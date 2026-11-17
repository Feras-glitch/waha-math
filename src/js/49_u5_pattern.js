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
  if (opt.ribbon) { const xa = X(n - 1) - step / 2 - 2, xb = xR + step / 2 + 2, h = size / 2 + 9;   /* شريط الزينة */
    el('path', { d: `M${xa} ${y - h} H${xb} l-9 ${h} l9 ${h} H${xa} l9 ${-h} Z`, fill: '#fff3d6', stroke: '#e6b85c', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g); }
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
    const row = patRowAt(svg, item.seq, { slots: item.k, y: 96, ribbon: item.ribbon }); if (help) patLoops(helpG(svg), row, item.unit.length);
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

/* =====================================================================
   الدرس 2 «أنماط أطول» (C026، وC018 في موضعه الثاني): وحدة من ثلاثة عناصر، وإحاطة الوحدة بحلقة، وقراءة النمط بالأصوات.
   ===================================================================== */
/* حلقة واحدة حول العناصر من a إلى b */
function patLoopAt(parent, row, a, b, opt = {}) { const pad = 5, xL = row.X(b) - row.size / 2 - pad, xRr = row.X(a) + row.size / 2 + pad;
  return el('rect', { x: xL, y: row.y - row.size / 2 - pad - 2, width: xRr - xL, height: row.size + 2 * pad + 4, rx: 14, fill: 'none', stroke: opt.color || css('--compass'), 'stroke-width': 3.4, 'stroke-dasharray': opt.dash ? '7 5' : null, 'pointer-events': 'none', 'data-loop': opt.k ?? 0 }, parent); }
/* قراءة الإيقاع وحدةً وحدة: وقفة بعد كل u عنصراً، فيُسمع أين تنتهي الوحدة */
async function patSweepUnits(row, u) { for (const e of row.els) { patSound(e.t);
    await anim(e.g, [{ transform: `translate(${e.x}px,${e.y}px) scale(1)` }, { transform: `translate(${e.x}px,${e.y - 9}px) scale(1.16)` }, { transform: `translate(${e.x}px,${e.y}px) scale(1)` }], { duration: 280 }).done.catch(() => {});
    await sleep((e.i + 1) % u ? 60 : 520); } }

/* ================= ④ أحط الوحدة المتكررة بحلقة (C018): يلمس الطفل آخر عنصر في الوحدة، فتُرسم الحلقة من أول الصفّ إليه ================= */
ITEM.patUnit = {
  make(spec) { return { ...spec, seq: patSeq(spec.unit, spec.n), want: spec.unit.length - 1, tag: 'pat-unit-u' + spec.unit.length }; },
  async ask(item, mode, tries) { const svg = newStage(230, { oasis: false, ground: 0 }), help = tries >= 3, u = item.unit.length;
    const row = patRowAt(svg, item.seq, { y: 112 }), m = helpG(svg); if (help) patLoopAt(m, row, u, 2 * u - 1, { dash: true, k: 1 });   /* الحلّ المشترك: الوحدة في مرّتها الثانية */
    say(...lineOf(help ? 'gen.pat.together.unit' : item.q), { free: true });
    const k = await tapOne(row.els.map(e => ({ g: e.g, k: e.i, label: patLabel(e.t) })), { ok: item.want, pad: 56, pulse: false }); hush();
    const lp = patLoopAt(m, row, 0, k, { k: 0 }); SFX.tick(); await anim(lp, [{ opacity: 0 }, { opacity: 1 }], { duration: 220 }).done.catch(() => {}); await sleep(260);
    return { ans: k, ctx: { svg, row, m } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: k < item.want ? 'patUnitShort' : 'patUnitLong' }; },
  async onOk(item, r) { SFX.good(); const { row, m } = r.ctx, u = item.unit.length; for (let a = u; a + u <= item.n; a += u) { SFX.tick(); await anim(patLoopAt(m, row, a, a + u - 1, { k: a / u }), [{ opacity: 0 }, { opacity: 1 }], { duration: 240 }).done.catch(() => {}); await sleep(140); } },
  onWrong() { SFX.soft(); },
  async hint2(item, r) { r.ctx.m.replaceChildren(); await patSweepUnits(r.ctx.row, item.unit.length); }, async together() {},
  async reveal(item, r) { const { svg, row, m } = r.ctx; m.replaceChildren(); patLoops(m, row, item.unit.length); okRing(svg, row.els[item.want].g, 4); await S('gen.pat.reveal.unit'); },
  praise: () => 'praisePattern', twin(item) { return item.twin || null; },
};

/* ================= ⑤ اقرأ النمط بالأصوات (C026): لكل لون صوت (map)، ويلمس الطفل الصوت لكل عنصر بالترتيب؛ ويقف عند أول خطأ ================= */
function patPlayStage(seq, map, help) { const svg = newStage(300, { oasis: false, ground: 0 }), row = patRowAt(svg, seq, { y: 70 });
  /* المفتاح: كل لون وصوته */
  const keys = [...new Set(seq)], kx = i => 180 + (keys.length - 1) * 52 - i * 104;
  keys.forEach((t, i) => { const g = el('g', { transform: `translate(${kx(i)} 168)`, 'data-key': t }, svg); el('rect', { x: -44, y: -19, width: 88, height: 38, rx: 19, fill: '#fffdf6', 'fill-opacity': .9, stroke: css('--line'), 'stroke-width': 2 }, g);
    patTokAt(g, t, 22, 0, 24); patTokAt(g, map[t], -22, 2, 26); const eq = el('text', { y: 6, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: css('--muted'), 'font-family': css('--f') }, g); eq.textContent = '='; });
  if (help) row.els.forEach(e => patTokAt(helpG(svg), map[e.t], e.x, e.y + row.size / 2 + 15, Math.min(22, row.step - 14)));
  const btn = { clap: patTokAt(svg, 'clap', 252, 236, 78), drum: patTokAt(svg, 'drum', 108, 242, 78) }, at = { clap: [252, 236], drum: [108, 242] };
  const mark = el('path', { d: 'M-8 0 L8 0 L0 -11 Z', fill: css('--compass'), opacity: 0 }, svg);
  const point = i => { const e = row.els[i]; mark.setAttribute('opacity', e ? 1 : 0); if (e) mark.setAttribute('transform', `translate(${e.x} ${e.y + row.size / 2 + (help ? 40 : 16)})`); };
  const hit = t => { patSound(t); const [x, y] = at[t]; anim(btn[t], [{ transform: `translate(${x}px,${y}px) scale(1)` }, { transform: `translate(${x}px,${y}px) scale(1.14)` }, { transform: `translate(${x}px,${y}px) scale(1)` }], { duration: 220 }); };
  const bump = i => { const e = row.els[i]; anim(e.g, [{ transform: `translate(${e.x}px,${e.y}px) scale(1)` }, { transform: `translate(${e.x}px,${e.y - 8}px) scale(1.14)` }, { transform: `translate(${e.x}px,${e.y}px) scale(1)` }], { duration: 240 }); };
  const targets = [{ g: btn.clap, k: 'clap', label: labelText('clap') }, { g: btn.drum, k: 'drum', label: labelText('drum') }];
  return { svg, row, btn, point, hit, bump, targets }; }
async function patPlayDemo(st, seq, map, n = seq.length) { for (let i = 0; i < n; i++) { st.point(i); st.bump(i); st.hit(map[seq[i]]); await sleep(430); } st.point(-1); }
ITEM.patPlay = {
  make(spec) { const seq = patSeq(spec.unit, spec.n); return { ...spec, seq, want: seq.map(t => spec.map[t]), tag: 'pat-play-u' + spec.unit.length }; },
  async ask(item, mode, tries) { const help = tries >= 3, st = patPlayStage(item.seq, item.map, help), picks = [];
    say(...lineOf(help ? 'gen.pat.together.play' : item.q), { free: true });
    for (let i = 0; i < item.n; i++) { st.point(i); const t = await tapOne(st.targets, { ok: item.want[i], pad: 96, pulse: false, kind: i ? 'tap' + (i + 1) : 'tap' }); if (i === 0) hush();
      st.hit(t); picks.push(t); if (t !== item.want[i]) break; st.bump(i); }
    await sleep(260); return { ans: picks, ctx: st }; },
  judge(item, a) { return a.length === item.want.length && a.every((t, i) => t === item.want[i]) ? { ok: true } : { ok: false, err: 'patPlayWrong' }; },
  onOk(item, r) { SFX.good(); r.ctx.point(-1); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { await patPlayDemo(r.ctx, item.seq, item.map, item.unit.length); }, async together() {},
  async reveal(item, r) { await patPlayDemo(r.ctx, item.seq, item.map); await S('gen.pat.reveal.play'); },
  praise: () => 'praisePattern', twin(item) { return item.twin || null; },
};

/* ---------- مشاهد الدرس 2 ---------- */
/* الإشعال: فوضى تكمل السلسلة بخرزة خطأ وتجزم؛ والطفل يضع ما يراه هو، بلا حكم، ثم تُظهر الحلقات الجواب */
SCENES.chaosGuess = async c => {
  const svg = newStage(280, { oasis: false, ground: 0 }), [l1, l2, l3, l4] = c.lines, seq = patSeq(c.unit, c.n), row = patRowAt(svg, seq, { slots: 1, y: 96 }), sl = row.slots[0], want = c.unit[c.n % c.unit.length];
  const fz = chaosAt(svg, 44, 40, .38); await S(l1); await chaosGiggle(fz);
  const ghost = patDrop(row, c.guess, sl, svg); ghost.setAttribute('opacity', .55); sl.g.setAttribute('opacity', .35); patSound(c.guess); await S(l2);
  const pool = [...new Set(c.unit)], tn = pool.length, tx = i => 180 + (tn - 1) * 48 - i * 96; el('rect', { x: 180 - tn * 48 - 6, y: 172, width: tn * 96 + 12, height: 84, rx: 22, fill: '#fffdf6', 'fill-opacity': .92, stroke: css('--line'), 'stroke-width': 2.5 }, svg);
  const tray = pool.map((t, i) => ({ g: patTokAt(svg, t, tx(i), 214, 52), k: t, label: patLabel(t) }));
  const k = await answerWhile(l3, () => tapOne(tray, { ok: want, pad: 84 })); logAttempt({ scene: 'hook', tag: 'chaosGuess', ok: k === want });
  ghost.remove(); fz.remove(); sl.g.setAttribute('opacity', 0); patDrop(row, want, sl, svg); patSound(want); await sleep(400);
  await patLoopsIn(helpG(svg), { ...row, els: [...row.els, { ...sl, t: want }], slots: [] }, c.unit.length); await S(l4);
};
/* الاكتشاف: يقرأ الطفل الصفّ لمساً، ثم يحيط الوحدة بحلقة (يلمس آخر عنصر فيها)؛ والحلقة الخطأ تُرى ثم تُمحى بسؤال */
SCENES.patCircle = async c => {
  const svg = newStage(250, { oasis: false, ground: 0 }), seq = patSeq(c.unit, c.n), row = patRowAt(svg, seq, { y: 112 }), u = c.unit.length, m = helpG(svg);
  say(...lineOf(c.intro), { free: true });
  for (const e of row.els) { await tapOne([{ g: e.g, k: e.i, label: patLabel(e.t) }], { ok: e.i, pad: 56 }); if (e.i === 0) hush(); patSound(e.t); buzz(20);
    anim(e.g, [{ transform: `translate(${e.x}px,${e.y}px) scale(1)` }, { transform: `translate(${e.x}px,${e.y - 9}px) scale(1.16)` }, { transform: `translate(${e.x}px,${e.y}px) scale(1)` }], { duration: 300 });
    say(...lineOf(patName(e.t)), { num: true, noGap: true, free: true }); }
  await sleep(500); hush(); S(c.ask, { free: true }); let tries = 0;
  while (true) { const k = await tapOne(row.els.map(e => ({ g: e.g, k: e.i, label: patLabel(e.t) })), { ok: u - 1, pad: 56, pulse: false }); hush(); tries++;
    const lp = patLoopAt(m, row, 0, k); SFX.tick(); await sleep(350); logAttempt({ scene: 'explore', tag: 'patCircle', ok: k === u - 1, firstTry: tries === 1 }); if (k === u - 1) break;
    SFX.soft(); await S(c.retry); lp.remove(); if (tries >= 2) await patSweepUnits(row, u); }
  SFX.good(); for (let a = u; a + u <= c.n; a += u) { SFX.tick(); patLoopAt(m, row, a, a + u - 1, { k: a / u }); await sleep(320); }
  await S(c.after);
};
/* الاكتشاف: لكل لون صوت. فرجار يقرأ الوحدة الأولى بالأصوات، ثم يقرأ الطفل الصفّ كله؛ واللمسة الخطأ لا تتقدّم */
SCENES.patSoundLab = async c => {
  const seq = patSeq(c.unit, c.n), st = patPlayStage(seq, c.map, false), [l1, l2, l3] = c.lines;
  await S(l1); await patPlayDemo(st, seq, c.map, c.unit.length); S(l2, { free: true }); let slips = 0;
  for (let i = 0; i < c.n; i++) { st.point(i); while (true) { const t = await tapOne(st.targets, { ok: c.map[seq[i]], pad: 96, pulse: false }); if (i === 0) hush(); st.hit(t); if (t === c.map[seq[i]]) break; slips++; SFX.soft(); } st.bump(i); }
  st.point(-1); logAttempt({ scene: 'explore', tag: 'patSound', ok: true, firstTry: slips === 0 }); SFX.good(); await sleep(400); await S(l3);
};
/* «صحّح لفوضى»: فوضى أحاطت كل عنصرين بحلقة، فحلقاتها لا تتشابه؛ يلمس الطفل آخر عنصر في الوحدة الصحيحة */
SCENES.chaosLoops = async C => {
  const svg = newStage(240, { oasis: false, ground: 0 }), row = patRowAt(svg, patSeq(C.unit, C.n), { y: 132 }), u = C.unit.length, m = helpG(svg);
  for (let a = 0; a < C.n; a += C.wrongU) patLoopAt(m, row, a, Math.min(C.n - 1, a + C.wrongU - 1), { color: css('--chaos'), dash: true, k: a / C.wrongU });
  const fz = chaosAt(svg, 44, 46, .4); await chaosGiggle(fz); S(C.find, { free: true }); let tries = 0;
  while (true) { const k = await tapOne(row.els.map(e => ({ g: e.g, k: e.i, label: patLabel(e.t) })), { ok: u - 1, pad: 56, pulse: false }); tries++;
    logAttempt({ scene: 'chaos', tag: 'find', ok: k === u - 1, firstTry: tries === 1 }); if (k === u - 1) break; hush(); SFX.soft(); await S('gen.chaos.no'); if (tries === 2) await patSweepUnits(row, u); }
  hush(); SFX.good(); fz.remove(); m.replaceChildren(); await patLoopsIn(m, row, u); if (C.after) await S(C.after);
};
/* قطعة الواحة: شريط زينة من رايات، نمطه من ثلاث */
WRAP_ART.bunting = svg => { const cols = [css(IDC.triangle), css(IDC.circle), css(IDC.circle)], n = 9;
  el('path', { d: 'M30 96 Q180 170 330 96', fill: 'none', stroke: '#8a6a4a', 'stroke-width': 3 }, svg);
  for (let i = 0; i < n; i++) { const u = (i + .5) / n, x = 330 - 300 * u, y = 96 + 148 * u * (1 - u), g = el('g', { transform: `translate(${x} ${y})` }, svg);
    el('path', { d: 'M-13 0 H13 L0 30 Z', fill: cols[i % 3], stroke: '#fff', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
    anim(g, [{ opacity: 0, transform: `translate(${x}px,${y - 30}px)` }, { opacity: 1, transform: `translate(${x}px,${y}px)` }], { duration: 360, delay: 200 + i * 110, fill: 'both', easing: 'cubic-bezier(.3,1.4,.6,1)' }); }
  palmAt(svg, 336, 250, .8); palmAt(svg, 24, 250, .9); };

/* =====================================================================
   الدرس 3 «أنماط في كل مكان» (C020، ومدخل N013): صور الأنماط في المحيط، وابتكار نمط، والعدّ بالاثنين وحدةً وحدة.
   ===================================================================== */
/* صور المحيط في مربع 104×78 مركزه (0،0). pat: فيها وحدة تتكرر، وunit مستطيل وحدتها [x، y، w، h] */
const PAT_PIC = {
  tiles: { pat: true, unit: [10, -30, 40, 20], draw(g) { for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) el('rect', { x: 30 - c * 20, y: -30 + r * 20, width: 20, height: 20, fill: (r + c) % 2 ? '#f4efe2' : '#3d7cc0', stroke: '#fff', 'stroke-width': 1.5 }, g); } },
  cloth: { pat: true, unit: [20, -30, 30, 60], draw(g) { const C = ['#d9483b', '#f6e7c8', '#f6e7c8']; for (let i = 0; i < 9; i++) el('rect', { x: 40 - i * 10, y: -30, width: 10, height: 60, fill: C[i % 3] }, g);
    el('rect', { x: -40, y: -30, width: 90, height: 60, fill: 'none', stroke: '#fff', 'stroke-width': 2.5, rx: 3 }, g); for (let i = 0; i < 9; i++) el('path', { d: `M${45 - i * 10} 30 v7`, stroke: '#b9794e', 'stroke-width': 2, 'stroke-linecap': 'round' }, g); } },
  fence: { pat: true, unit: [18, -34, 30, 66], draw(g) { el('rect', { x: -46, y: -4, width: 92, height: 7, fill: '#8a6a4a' }, g); el('rect', { x: -46, y: 16, width: 92, height: 7, fill: '#8a6a4a' }, g);
    for (let i = 0; i < 6; i++) { const x = 34 - i * 15, top = i % 2 ? -14 : -30; el('path', { d: `M${x} 30 V${top + 8} L${x + 5.5} ${top} L${x + 11} ${top + 8} V30 Z`, fill: '#c9a072', stroke: '#fff', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, g); } } },
  leaves: { pat: false, near: true, draw(g) { el('path', { d: 'M44 24 Q0 6 -44 -8', fill: 'none', stroke: '#8a6a4a', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g);
    for (const [x, y, s, a] of [[30, 16, 1.1, -70], [14, 4, .8, 80], [-2, 4, 1.25, -60], [-20, -10, .9, 95], [-34, -8, 1.05, -50]]) el('path', { d: 'M0 0 Q9 -12 0 -24 Q-9 -12 0 0 Z', fill: '#4f9a6a', stroke: '#fff', 'stroke-width': 1.5, transform: `translate(${x} ${y}) rotate(${a}) scale(${s})` }, g); } },
  toys: { pat: false, draw(g) { el('circle', { cx: 26, cy: -12, r: 13, fill: '#d9483b', stroke: '#fff', 'stroke-width': 2 }, g); el('rect', { x: -40, y: -30, width: 22, height: 22, rx: 3, fill: '#3d7cc0', stroke: '#fff', 'stroke-width': 2 }, g);
    el('path', { d: 'M-6 6 l5 11 12 1 -9 8 3 12 -11 -6 -11 6 3 -12 -9 -8 12 -1 Z', fill: '#f2b33d', stroke: '#fff', 'stroke-width': 2, 'stroke-linejoin': 'round' }, g); el('circle', { cx: 34, cy: 22, r: 8, fill: 'none', stroke: '#4f9a6a', 'stroke-width': 5 }, g); el('path', { d: 'M-44 30 l10 -16 10 16 Z', fill: '#8e6bbf', stroke: '#fff', 'stroke-width': 2 }, g); } },
  stones: { pat: false, draw(g) { for (const [x, y, rx, ry] of [[30, -16, 13, 9], [2, -24, 7, 6], [-30, -8, 16, 11], [18, 16, 9, 8], [-8, 8, 12, 7], [-36, 24, 7, 5], [40, 28, 5, 4]]) el('ellipse', { cx: x, cy: y, rx, ry, fill: '#a9a59c', stroke: '#fff', 'stroke-width': 2 }, g); } },
  dots: { pat: false, draw(g) { el('rect', { x: -45, y: -30, width: 90, height: 60, rx: 3, fill: '#f6e7c8', stroke: '#fff', 'stroke-width': 2.5 }, g);
    for (const [x, y, r, c] of [[30, -14, 6, '#d9483b'], [8, 12, 4, '#3d7cc0'], [-12, -18, 8, '#3d7cc0'], [-30, 6, 5, '#d9483b'], [22, 18, 3, '#4f9a6a'], [-4, -2, 3, '#d9483b'], [-34, -20, 4, '#4f9a6a'], [-20, 20, 6, '#3d7cc0'], [38, 2, 4, '#4f9a6a']]) el('circle', { cx: x, cy: y, r, fill: c }, g); } },
};
function patPicAt(parent, kind, x, y, k = 1) { const o = el('g', { transform: `translate(${x} ${y})`, 'data-pic': kind }, parent), g = el('g', { transform: `scale(${k})` }, o);
  el('rect', { x: -56, y: -43, width: 112, height: 86, rx: 14, fill: '#fffdf6', 'fill-opacity': .94, stroke: css('--line'), 'stroke-width': 2.5 / k }, g); PAT_PIC[kind].draw(g); return o; }
function patPicUnit(parent, kind, x, y, k = 1) { const u = PAT_PIC[kind].unit; if (!u) return null;
  return el('rect', { x: x + u[0] * k - 3, y: y + u[1] * k - 3, width: u[2] * k + 6, height: u[3] * k + 6, rx: 8, fill: 'none', stroke: css('--compass'), 'stroke-width': 3.4, 'pointer-events': 'none', 'data-loop': kind }, parent); }

/* ================= ⑥ أين النمط؟ (C020): ثلاث صور من المحيط، واحدة منها فيها نمط (ask: pat) أو واحدة بلا نمط (ask: none) ================= */
ITEM.patWhere = {
  make(spec) { const isP = k => PAT_PIC[k].pat, want = spec.pics.findIndex(k => (spec.ask === 'none') !== isP(k)); return { ...spec, want, tag: 'pat-where-' + (spec.ask || 'pat') }; },
  async ask(item, mode, tries) { const svg = newStage(270, { oasis: false, ground: 0 }), X = [276, 180, 84], Y = [96, 186, 96], help = tries >= 3;
    const P = item.pics.map((k, i) => patPicAt(svg, k, X[i], Y[i], .86)); if (help) item.pics.forEach((k, i) => patPicUnit(helpG(svg), k, X[i], Y[i], .86));
    say(...lineOf(help ? 'gen.pat.together.where' : item.q), { free: true });
    const k = await tapOne(P.map((g, i) => ({ g, k: i, label: labelText('patPic.' + item.pics[i]) })), { ok: item.want, pad: false }); hush(); return { ans: k, ctx: { svg, P } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'patWhereWrong' }; },
  onOk(item, r) { SFX.good(); okRing(r.ctx.svg, r.ctx.P[r.ans], 2); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const m = helpG(r.ctx.svg), X = [276, 180, 84], Y = [96, 186, 96]; for (const [i, k] of item.pics.entries()) { const u = patPicUnit(m, k, X[i], Y[i], .86); if (u) { SFX.tick(); await anim(u, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 }).done.catch(() => {}); await sleep(500); } } }, async together() {},
  async reveal(item, r) { okRing(r.ctx.svg, r.ctx.P[item.want], 2); await S('gen.pat.reveal.where'); },
  praise: () => 'praisePattern', twin(item) { return item.twin || null; },
};

/* ================= ⑦ اصنع نمطاً (C020): pool العناصر، n أماكن (6)، u طول الوحدة المطلوب إن طُلب ================= */
const patPeriod = seq => { for (let p = 1; p * 2 <= seq.length; p++) if (seq.every((t, i) => t === seq[i % p])) return p; return 0; };
const patExample = item => patSeq(item.u === 3 ? (item.pool.length >= 3 ? item.pool.slice(0, 3) : [item.pool[0], item.pool[1], item.pool[1]]) : item.pool.slice(0, 2), item.n);
ITEM.patMake = {
  make(spec) { return { ...spec, n: spec.n || 6, tag: 'pat-make' + (spec.u || '') }; },
  async ask(item, mode, tries) { const svg = newStage(280, { oasis: false, ground: 0 }), help = tries >= 3, ex = patExample(item), pre = help ? ex.slice(0, item.u || 2) : [];
    const row = patRowAt(svg, pre, { slots: item.n - pre.length, y: 96, string: patIsBead(item.pool) }); if (help) patLoopAt(helpG(svg), row, 0, pre.length - 1);
    const tn = item.pool.length, tx = i => 180 + (tn - 1) * 48 - i * 96; el('rect', { x: 180 - tn * 48 - 6, y: 172, width: tn * 96 + 12, height: 84, rx: 22, fill: '#fffdf6', 'fill-opacity': .92, stroke: css('--line'), 'stroke-width': 2.5 }, svg);
    const tray = item.pool.map((t, i) => ({ g: patTokAt(svg, t, tx(i), 214, 52), k: t, label: patLabel(t) }));
    say(...lineOf(help ? 'gen.pat.together.make' : item.q), { free: true }); const seq = [...pre];
    for (const [s, sl] of row.slots.entries()) { sl.g.classList.add('pulse');   /* bad: للسائق الآلي، خطؤه العنصر نفسه في كل مكان (لا نمط) */
      const t = await tapOne(tray, { ok: ex[sl.i], bad: item.pool[0], pad: 84, pulse: false, kind: s ? 'tap' + (s + 1) : 'tap' }); sl.g.classList.remove('pulse'); if (s === 0) hush();
      seq.push(t); sl.g.setAttribute('opacity', 0); row.els.push({ g: patDrop(row, t, sl, svg), x: sl.x, y: sl.y, t, i: sl.i }); patSound(t); await sleep(200); }
    row.slots = []; return { ans: seq, ctx: { svg, row } }; },
  judge(item, a) { const p = patPeriod(a); return p === 1 ? { ok: false, err: 'patMakeSame' } : !p ? { ok: false, err: 'patMakeNone' } : item.u && p !== item.u ? { ok: false, err: 'patMakeUnit' } : { ok: true }; },
  async onOk(item, r) { SFX.good(); await patLoopsIn(helpG(r.ctx.svg), r.ctx.row, patPeriod(r.ans)); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { await patSweep(r.ctx.row); }, async together() {},
  async reveal(item) { const svg = newStage(230, { oasis: false, ground: 0 }), row = patRowAt(svg, patExample(item), { y: 112 }); await patLoopsIn(helpG(svg), row, item.u || 2); await S('gen.pat.reveal.make'); },
  praise: () => 'praisePattern', twin(item) { return item.twin || null; },
};

/* ---------- العدّ بالاثنين: الأزواج ---------- */
function pairAt(parent, kind, x, y) { const g = el('g', { transform: `translate(${x} ${y})`, 'data-pair': kind }, parent);
  el('rect', { x: -29, y: -24, width: 58, height: 48, rx: 12, fill: '#fffdf6', 'fill-opacity': .8, stroke: css('--line'), 'stroke-width': 2 }, g);
  if (kind === 'beads') { patTokAt(g, 'bR', 13, 0, 22); patTokAt(g, 'bB', -13, 0, 22); }
  else for (const dx of [13, -13]) el('path', { d: 'M-6 -17 H6 V2 Q6 6 10 8 Q15 11 13 15 Q11 18 2 17 Q-6 16 -6 8 Z', fill: kind === 'shoes' ? '#7e9a4e' : '#5c9bb0', stroke: '#fff', 'stroke-width': 2, 'stroke-linejoin': 'round', transform: `translate(${dx} 0)` }, g);
  if (kind !== 'beads') for (const dx of [13, -13]) el('path', { d: `M${dx - 6} -11 H${dx + 6}`, stroke: '#fff', 'stroke-width': 2.5 }, g);
  return g; }
function pairsAt(svg, kind, k, cy = 118) { const rows = k > 5 ? 2 : 1, out = [];
  for (let i = 0; i < k; i++) { const r = Math.floor(i / 5), inRow = r === rows - 1 ? k - r * 5 : 5, c = i % 5, x = 180 + (inRow - 1) * 33 - c * 66, y = cy + (r - (rows - 1) / 2) * 84; out.push({ g: pairAt(svg, kind, x, y), x, y, i }); } return out; }
const pairBadge = (m, p) => badge(m, p.x, p.y + 36, 2 * (p.i + 1));

/* ================= ⑧ كم واحداً؟ عُدّ بالاثنين (N013): pairs أزواج (2–10) ================= */
ITEM.skipCount = { ...numItem,
  make(spec) { const w = 2 * spec.pairs; return { ...spec, want: w, nums: [w, spec.pairs, w + 2 <= 20 ? w + 2 : w - 2], tag: 'skip-count' }; },
  async ask(item, mode, tries) { const svg = newStage(250, { oasis: false, ground: 0 }), P = pairsAt(svg, item.kind || 'socks', item.pairs, 112), help = tries >= 3;
    if (help) { const m = helpG(svg); P.slice(0, -1).forEach(p => pairBadge(m, p)); }
    await S(help ? 'gen.skip.together' : item.q); const np = numberPick(shuffle(item.nums), item.want); const ans = await np.p; return { ans, ctx: { svg, np, P } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: k === item.pairs ? 'skipPairs' : 'skipWrong' }; },
  async hint2(item, r) { const m = helpG(r.ctx.svg); for (const p of r.ctx.P) { pairBadge(m, p); SFX.tick(); await S(numw(2 * (p.i + 1)), { noGap: true, num: true }); } },
  async together() {}, async reveal(item, r) { const m = helpG(r.ctx.svg); m.replaceChildren(); r.ctx.P.forEach(p => pairBadge(m, p)); await S(numw(item.want), { num: true }); },
  twin(item) { return item.twin || null; },
};

/* ================= ⑨ اقفز بلاطتين بلاطتين (N013): من a إلى b على طريق الأعداد ================= */
ITEM.skipHop = {
  make(spec) { return { ...spec, seq: Array.from({ length: (spec.b - spec.a) / 2 }, (_, i) => spec.a + 2 * (i + 1)), tag: 'skip-hop' }; },
  async ask(item, mode, tries) { const R = roadStage(item, { at: item.a }), path = [item.a]; let busy = false;
    const ahead = m => R.S.show(R.S.tileX(m) - 29, R.S.tileX(Math.min(R.S.tiles.length - 1, m + 2)) + 29);
    const go = async m => { busy = true; SFX.tick(); await R.tok.leap(m); path.push(m); say(...lineOf(numw(m)), { free: true, num: true }); await ahead(m); busy = false; };
    if (tries >= 3) { await S('gen.skip.togetherHop'); for (const m of item.seq.slice(0, -1)) { await go(m); await sleep(350); } } else await ahead(item.a);
    say(...lineOf(item.q), { free: true });
    const targets = R.S.tiles.map(t => ({ g: t.g, n: t.n }));
    targets.forEach(t => { t.g.style.cursor = 'pointer'; t.g.setAttribute('role', 'button'); t.g.setAttribute('aria-label', plain(T(numw(t.n)))); hitPad(t.g, 56);
      t.g.onclick = () => { if (R.S.dragged || busy) return; if (t.n === R.tok.n) { say(...lineOf(numw(t.n)), { free: true, num: true }); return; } go(t.n); }; }); routeClicks(targets.map(t => t.g));
    const d = doneBtn(), left = () => item.seq.filter(m => !path.includes(m)), click = async L => { for (const m of L) { R.S.tiles[m].g.dispatchEvent(new MouseEvent('click', { bubbles: true })); await new Promise(r => setTimeout(r, 30)); while (busy) await new Promise(r => setTimeout(r, 20)); } d.b.click(); };
    /*T*/window.__road = { seq: left(), done: true };/*/T*/
    AUTO({ kind: 'road', ok: () => click(left()), wrong: () => click([R.tok.n + 1]) });
    let fin = false; await gate(new Promise(res => d.b.onclick = async () => { if (fin) return; fin = true; while (busy) await new Promise(r => setTimeout(r, 30)); AUTO_CLEAR(); hush(); d.bar.remove(); res(); }));
    targets.forEach(t => { t.g.onclick = null; delete t.g.__route; t.g.removeAttribute('role'); t.g.style.cursor = ''; t.g.querySelectorAll(':scope > rect.hit').forEach(h => h.remove()); });
    return { ans: path, ctx: R }; },
  judge(item, path) { const st = path.slice(1).map((m, i) => m - path[i]), fin = path[path.length - 1];
    if (st.some(s => Math.abs(s) === 1)) return { ok: false, err: 'skipOne' }; if (st.length && st.every(s => s === 2)) return fin === item.b ? { ok: true } : { ok: false, err: 'skipStop' }; return { ok: false, err: st.length ? 'skipWrong' : 'skipStop' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const R = r.ctx; R.tok.place(item.a); for (const m of item.seq.slice(0, 2)) { await R.tok.leap(m); await S(numw(m), { noGap: true, num: true }); } },
  async together() {},
  async reveal(item, r) { const R = r.ctx; R.tok.place(item.a); for (const m of item.seq) { await R.tok.leap(m); await S(numw(m), { noGap: true, num: true }); } await S('gen.skip.reveal'); },
  praise: () => 'praiseCount', twin(item) { return item.twin || null; },
};

/* ---------- مشاهد الدرس 3 ---------- */
/* الإشعال: فوضى تقول «لا أنماط في بيتنا!»؛ يلمس الطفل أشياء البيت واحداً واحداً فتظهر وحدة كلٍّ منها وتُقال. بلا حكم */
SCENES.patHunt = async c => {
  const svg = newStage(290, { oasis: false, ground: 0 }), [l1, l2, l3] = c.lines, X = [268, 92, 268, 92], Y = [92, 92, 206, 206], m = helpG(svg);
  const P = c.pics.map((k, i) => ({ g: patPicAt(svg, k, X[i], Y[i], 1.05), k, i })), fz = chaosAt(svg, 180, 148, .34);
  await chaosGiggle(fz); await S(l1); S(l2, { free: true }); let left = [...P], first = true;
  while (left.length) { const i = await tapOne(left.map(p => ({ g: p.g, k: p.i, label: labelText('patPic.' + p.k) })), { ok: left[0].i, pad: false }); if (first) { hush(); first = false; }
    const p = P[i]; left = left.filter(q => q !== p); patPicUnit(m, p.k, X[i], Y[i], 1.05); SFX.tick(); p.g.setAttribute('opacity', .96); await S(c.say[p.k]); }
  logAttempt({ scene: 'hook', tag: 'patHunt', ok: true }); fz.remove(); await S(l3);
};
/* الاكتشاف: خرز بوحدة من اثنتين، يلمس الطفل الوحدات واحدة واحدة فتُعدّ بالاثنين، ثم يختار العدد التالي (بلا حكم) */
SCENES.skipBeads = async c => {
  const svg = newStage(250, { oasis: false, ground: 0 }), [l1, l2, l3, l4] = c.lines, row = patRowAt(svg, patSeq(['bR', 'bB'], 10), { y: 96 }), m = helpG(svg);
  patLoops(m, row, 2); await S(l1); S(l2, { free: true });
  for (let k = 0; k < 5; k++) { const a = row.els[2 * k], b = row.els[2 * k + 1], g = el('g', {}, svg); el('rect', { x: b.x - row.size / 2 - 3, y: row.y - row.size / 2 - 4, width: a.x - b.x + row.size + 6, height: row.size + 8, fill: 'transparent' }, g);
    await tapOne([{ g, k, label: labelText('patUnitG') }], { ok: k, pad: 56 }); if (k === 0) hush(); g.remove(); badge(m, b.x, row.y + row.size / 2 + 22, 2 * (k + 1)); SFX.tick(); patSound('bR'); await S(numw(2 * (k + 1)), { noGap: true, num: true }); }
  logAttempt({ scene: 'explore', tag: 'skipBeads', ok: true }); await S(l3);
  await S(l4); const np = numberPick(shuffle([12, 11, 14]), 12); const k = await np.p; logAttempt({ scene: 'explore', tag: 'skipNext', ok: k === 12 }); np.box && np.box.remove(); await S(numw(12), { num: true });
};
/* المثال المحلول: نعدّ الأزواج بالاثنين، والزوج الأخير يلمسه الطفل */
SCENES.skipWorked = async c => {
  const svg = newStage(250, { oasis: false, ground: 0 }), [l1, l2, l3] = c.lines, P = pairsAt(svg, c.kind || 'socks', c.pairs, 112), m = helpG(svg);
  await S(l1); for (const p of P.slice(0, -1)) { pairBadge(m, p); SFX.tick(); await S(numw(2 * (p.i + 1)), { noGap: true, num: true }); await sleep(200); }
  const last = P[P.length - 1]; await answerWhile(l2, () => tapOne([{ g: last.g, k: 'p', label: labelText('patPair') }], { ok: 'p', pad: 64 }));
  pairBadge(m, last); SFX.good(); await S(numw(2 * c.pairs), { noGap: true, num: true }); await sleep(400); await S(l3);
};
/* «صحّح لفوضى»: فوضى عدّت الأزواج لا الجوارب */
SCENES.chaosPairs = async C => {
  const svg = newStage(250, { oasis: false, ground: 0 }), P = pairsAt(svg, C.kind2 || "socks", C.pairs, 112), m = helpG(svg), w = 2 * C.pairs;
  const fz = chaosAt(svg, 40, 40, .38); await chaosGiggle(fz); let tries = 0;
  while (true) { await S(C.find); const np = numberPick(shuffle([w, C.pairs, w - 2]), w), k = await np.p; tries++; np.box && np.box.remove();
    logAttempt({ scene: 'chaos', tag: 'find', ok: k === w, firstTry: tries === 1 }); if (k === w) break; SFX.soft(); await S('gen.chaos.no');
    if (tries >= 2) { m.replaceChildren(); for (const p of P) { pairBadge(m, p); SFX.tick(); await S(numw(2 * (p.i + 1)), { noGap: true, num: true }); } } }
  SFX.good(); fz.remove(); m.replaceChildren(); P.forEach(p => pairBadge(m, p)); if (C.after) await S(C.after);
};
SCENES.recallSkip = async c => { const svg = newStage(250, { oasis: false, ground: 0 }), P = pairsAt(svg, 'beads', c.pairs || 3, 112), m = helpG(svg); for (const p of P) { pairBadge(m, p); SFX.tick(); await sleep(350); } await S(c.lines); };
/* قطعة الواحة: بلاط بنمطه */
WRAP_ART.tilePath = svg => { for (let r = 0; r < 2; r++) for (let c = 0; c < 9; c++) { const x = 306 - c * 34, y = 212 + r * 34, g = el('rect', { x, y, width: 34, height: 34, fill: (r + c) % 2 ? '#f4efe2' : '#3d7cc0', stroke: '#fff', 'stroke-width': 2 }, svg);
    anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 260, delay: 150 + (c * 2 + r) * 70, fill: 'both' }); } palmAt(svg, 326, 196, .7); palmAt(svg, 30, 196, .8); };
