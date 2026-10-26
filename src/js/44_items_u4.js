/* =====================================================================
   بنود «قارِن وقِس» (S1-U4): الطول والترتيب والحجم والثقل (C014، C015، C024، C025)، والقياس بوحدة (C016، C017)،
   ولوحة المقاول (D001)، والعشرة والآحاد (N010)، وأصدقاء العشرة وتكوينها (N011، N012).
   المقارنة نسبية دائماً: «أيّهما أطول؟» لا «أطول» وحدها (التدقيق H11)، والثقل بميزان ذي كفّتين لا بالنظر.
   والحلّ المشترك يُرسم في ask عند tries >= 3 معلَّماً data-help (D257(5)(و))، والتوأم من بيانات البند (المبدأ 5)
   ===================================================================== */
/* الجملة بضمير الشيء (الفحص المستقل A لبوابة S1-U4: «طولُه» و«نهايتِه» للملعقة والجزرة، و«الكبرى… المسيها» للصناديق): الصناديق مذكّرة، والدوائر والكرات مؤنثة */
const SIZE_G = item => item.kind === 'box' ? '.m' : '';
const MEAS_PRAISE = item => item && (item.t === 'sizePick' || item.by === 'size') ? 'praiseSize' : 'praiseMeasure';   /* والأحجام بمدحها (الفحص المستقل A) */
const helpG = svg => el('g', { 'pointer-events': 'none', 'data-help': 1 }, svg);
const s2n = a => [...a].sort((x, y) => x - y).join(',');
/* زرّ واحد أو أزرار تحت المسرح (افرد، أضف، أبعد…): [k, التسمية، الأيقونة، جملة الخيار]، ويُقرأ ما له جملة بعد السؤال (D254 (2)) */
function toolBar(btns, opt = {}) { const bar = document.createElement('div'); bar.className = 'choices icons build' + (btns.length === 4 ? ' four' : '') + (opt.cls ? ' ' + opt.cls : ''); $('#stage').appendChild(bar);
  const out = {}; for (const [k, lbl, ic, line] of btns) { const b = document.createElement('button'); b.className = 'pick'; b.dataset.k = k; b.innerHTML = (ic || '') + `<span>${esc(G(labelText(lbl)))}</span>`; b.setAttribute('aria-label', plain(G(labelText(lbl)))); if (line) b.dataset.line = line; bar.appendChild(b); out[k] = b; }
  const read = intro => readChoices(Object.values(out).filter(b => b.dataset.line).map(b => ({ line: lineOf(b.dataset.line), el: b })), { intro, host: bar });
  return { bar, b: out, read }; }
const TOOL_IC = {
  wave: '<svg viewBox="0 0 40 28" width="40" height="28" aria-hidden="true"><path d="M4 18 q6 -12 12 0 t12 0 t12 0" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".45"/><path d="M4 22 H36" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></svg>',
  clip: '<svg viewBox="0 0 40 28" width="40" height="28" aria-hidden="true"><path d="M34 9 H10 a5 5 0 0 0 0 10 H30 a3 3 0 0 0 0 -6 H14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  cube: '<svg viewBox="0 0 40 28" width="40" height="28" aria-hidden="true"><rect x="12" y="8" width="16" height="16" fill="currentColor" opacity=".8"/><path d="M12 8 l4 -4 h16 l-4 4 M28 8 l4 -4 v16 l-4 4" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  rod: '<svg viewBox="0 0 40 28" width="40" height="28" aria-hidden="true"><rect x="16" y="1" width="9" height="26" fill="currentColor" opacity=".8"/><path d="M16 9.5 h9 M16 18 h9" stroke="#fff" stroke-width="1.5"/></svg>',
  align: '<svg viewBox="0 0 40 28" width="40" height="28" aria-hidden="true"><path d="M34 3 V25" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="3 3"/><rect x="8" y="5" width="24" height="7" rx="2" fill="currentColor"/><rect x="16" y="16" width="16" height="7" rx="2" fill="currentColor" opacity=".7"/></svg>',
  minus: '<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path d="M5 12h14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  done: '<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};
/* حلقة الصواب حول هدف (الإطار المرئي لرسمه) */
function okRing(svg, g, pad = 8) { try { const b = g.getBBox(), m = g.getCTM(), r = svg.getCTM().inverse().multiply(m); const p = (x, y) => { const q = svg.createSVGPoint(); q.x = x; q.y = y; return q.matrixTransform(r); };
  /* والحلقة داخل المسرح (الفحص المستقل D2 لبوابة S1-U4 (10): حلقة «شبر مَن أطول؟» قُصّت من أعلاه): تُقصّر عند حدّه بنصف عرض خطّها */
  const a = p(b.x, b.y), c = p(b.x + b.width, b.y + b.height), V = svg.viewBox.baseVal, x0 = Math.max(2, Math.min(a.x, c.x) - pad), y0 = Math.max(2, Math.min(a.y, c.y) - pad);
  const x1 = Math.min(V.width - 2, Math.max(a.x, c.x) + pad), y1 = Math.min(V.height - 2, Math.max(a.y, c.y) + pad);
  return el('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, rx: 12, fill: 'none', stroke: css('--good'), 'stroke-width': 4, 'pointer-events': 'none', 'data-ring': 1 }, svg); } catch (e) { return null; } }

/* صورة بند التعليل في «قارن وقس» (ITEM.reason بـ pic): تُرسم بمقاسها ثم تُصغَّر لتسع المسرح القصير */
function reasonPic(svg, P) { const g = el('g', {}, svg);
  if (P.kind === 'len2') { startLineAt(g, 40, 230); P.lens.forEach((len, i) => lenAt(g, { kind: 'strip', len, color: NEUTRAL[i ? 3 : 0] }, MS_X - ((P.shift || [])[i] || 0), 96 + i * 74)); }
  else if (P.kind === 'weigh') { const B = balanceAt(g, 180, 270); B.put('R', P.a); B.put('L', P.b); B.set(tiltOf(P.a, P.b)); }
  else if (P.kind === 'units') { const it = { obj: P.obj || 'book', unit: P.unit || 'clip', n: P.n, bad: P.bad }; measPanel(g, it, 100, P.bad ? 'bad' : 'ok'); }
  else if (P.kind === 'span') spanTables(g, P.a, P.b);
  const bb = g.getBBox(), k = Math.min(1, 340 / bb.width, 186 / bb.height); g.setAttribute('transform', `translate(${180 - (bb.x + bb.width / 2) * k} ${100 - (bb.y + bb.height / 2) * k}) scale(${k})`); return g; }

/* ================= ① أيّهما أطول؟ أيّهما أقصر؟ (C014) ================= */
/* lens: أطوال الأشياء؛ shift: كم تتأخّر بداية كل شيء عن خط البداية (0 = محاذٍ)؛ wavy: أرقام ما يلتوي؛ ask: long | short */
/* ألوان الأشياء بترتيبها إن لم يكن للبند colors (ويقرؤه 4ب11 من هنا) */
const LEN_DEF = [NEUTRAL[0], NEUTRAL[3], NEUTRAL[2], NEUTRAL[5], NEUTRAL[4]];
const LEN_ROWS = n => n === 2 ? [96, 176] : n === 3 ? [74, 140, 206] : n === 4 ? [60, 112, 164, 216] : [50, 94, 138, 182, 226];
function lenRow(svg, item, opt = {}) { const ys = LEN_ROWS(item.lens.length); startLineAt(svg, 24, 250);
  return item.lens.map((len, i) => { const sh = opt.aligned ? 0 : ((item.shift || [])[i] || 0); const wavy = !opt.straight && (item.wavy || []).includes(i);
    const o = lenAt(svg, { kind: item.kind || 'strip', thing: (item.house || [])[i], len, color: (item.colors || LEN_DEF)[i], wavy, amp: item.amp, cycles: item.cycles }, MS_X - sh, ys[i]); return { o, k: i, label: labelText('lenOne') }; }); }
const lenWant = (lens, ask) => { const v = ask === 'short' ? Math.min(...lens) : Math.max(...lens); return lens.indexOf(v); };
/* الخطوط عند نهاية كل شيء بعد المحاذاة: هنا نقارن (الحلّ المشترك وحركة الأداة) */
function endLines(svg, T, cls) { const m = cls === 'help' ? helpG(svg) : el('g', { 'pointer-events': 'none' }, svg); T.forEach(t => el('line', { x1: t.o.end(), y1: 22, x2: t.o.end(), y2: 252, stroke: css('--compass'), 'stroke-width': 2.5, 'stroke-dasharray': '4 5' }, m)); return m; }
ITEM.lenPick = {
  make(spec) { return { ...spec, tag: 'len-' + (spec.ask || 'long') + ((spec.shift || []).some(Boolean) ? '-shift' : '') + ((spec.wavy || []).length ? '-wavy' : ''), want: lenWant(spec.lens, spec.ask || 'long') }; },
  async ask(item, mode, tries) { const svg = newStage(270, { oasis: false, ground: 0 }); const help = tries >= 3;
    const T = lenRow(svg, item, { aligned: help, straight: help }); if (help) endLines(svg, T, 'help');
    let tb = null; if (T.some(t => t.o.wavy())) { tb = toolBar([['wave', 'straightenIt', TOOL_IC.wave, 'gen.opt.straightenIt']]); tb.b.wave.onclick = async () => { barGone(tb.bar); hush(); SFX.tick(); await Promise.all(T.filter(t => t.o.wavy()).map(t => t.o.straighten())); logAttempt({ scene: 'explore', tag: 'straighten', ok: true }); }; }
    const dz = help ? null : dragAlign(svg, T); const help1 = ['practice', 'remedial', 'explore'].includes(mode);
    const ab = dz && T.some(t => Math.abs(t.o.x0 - MS_X) > .5) ? alignBar(dz, { read: help1 }) : null;
    const q = help ? 'gen.len.together.' + (item.ask || 'long') : item.q; say(...lineOf(q), { free: true }); if (tb && help1) tb.read([lineOf(q)]); else if (ab && help1) ab.read([lineOf(item.q)]);
    const k = await tapOne(T.map(t => ({ g: t.o.g, k: t.k, label: t.label })), { ok: item.want, pad: 56 }); hush(); if (dz) dz.off(); if (tb) tb.bar.remove(); if (ab) ab.bar.remove();
    item._st = T.map(t => ({ x0: t.o.x0, end: t.o.end(), wavy: t.o.wavy() })); return { ans: k, ctx: { svg, T } }; },
  judge(item, k) { if (k === item.want) return { ok: true }; const st = item._st || [], c = st[k] || {};
    const aligned = st.every(s => Math.abs(s.x0 - MS_X) < .5), ends = st.map(s => s.end);
    if (!aligned && (item.ask || 'long') === 'long' && c.end === Math.min(...ends)) return { ok: false, err: 'fromEnd' };
    if (!aligned && item.ask === 'short' && c.end === Math.max(...ends)) return { ok: false, err: 'fromEnd' };
    /* والملتوي بما فعله الطفل (الفحص المستقل G1 (8)): لمس ملتوياً في «أطول؟»، أو مستقيماً في «أقصر؟» والجواب ملتوٍ: يظنّ الملتوي أطول (wavyLong)؛ ولمس ملتوياً في
       «أقصر؟»، أو مستقيماً في «أطول؟» والجواب ملتوٍ: حكم بما يُرى فظنّه أقصر (wavyShort). كان من لمس الملتوي الأقصر في «أطول؟» يُوسم «يظن الملتوي أقصر» وقد اختاره
       أطول (وقبلها الفحصان المستقلان F1 (4) وF2 (2)) */
    { const kw = !!c.wavy, aw = !!(st[item.want] && st[item.want].wavy); if (kw || aw) return { ok: false, err: kw === ((item.ask || 'long') === 'long') ? 'wavyLong' : 'wavyShort' }; }
    /* وأيّ خطأ والبدايات غير محاذاة سؤاله المحاذاة (الفحص المستقل D1 لبوابة S1-U4: «أين نهاية كل واحد؟ وأيّها أبعد عن خط البداية؟» يقود
       في البنود غير المحاذاة إلى الأبعد نهاية، وهو غير الجواب بـ 4ب8) */
    if (!aligned) return { ok: false, err: 'fromEnd' };
    return { ok: false, err: 'lenWrong' }; },
  onOk(item, r) { SFX.good(); okRing(r.ctx.svg, r.ctx.T[r.ans].o.g); }, onWrong() { SFX.soft(); },
  mark(item, r) { okRing(r.ctx.svg, r.ctx.T[item.want].o.g); },
  /* حركة الأداة: تُفرد الملتوية، وتنزلق الأشياء إلى خط البداية، ثم خطوط عند النهايات */
  async hint2(item, r) { const T = r.ctx.T; await Promise.all(T.filter(t => t.o.wavy()).map(t => t.o.straighten(700))); await Promise.all(T.map(t => alignTo(t.o, MS_X, 600))); const m = endLines(r.ctx.svg, T); await sleep(1500); m.remove(); },
  async together() {},   /* في ask عند المحاولة الرابعة: الأشياء على خط واحد وخطوط عند نهاياتها */
  async reveal(item, r) { const T = r.ctx.T; await Promise.all(T.filter(t => t.o.wavy()).map(t => t.o.straighten(500))); await Promise.all(T.map(t => alignTo(t.o, MS_X, 400))); ITEM.lenPick.mark(item, r); await S('gen.len.reveal.' + (item.ask || 'long')); },
  praise: MEAS_PRAISE, twin(item) { return item.twin || null; },
};

/* ================= ② رتّب (C015): من الأقصر إلى الأطول، أو من الأصغر إلى الأكبر ================= */
/* by: len (أشياء أفقية، قد لا تبدأ من خط واحد) | size (دوائر أو كرات على أرض واحدة)؛ vals: الأطوال أو أنصاف الأقطار؛ dir: up (الأصغر أولاً) | down */
const SIZE_FLOOR = 196;
function sizeRow(svg, item) { const n = item.vals.length, sp = 330 / n; el('line', { x1: 14, y1: SIZE_FLOOR, x2: 346, y2: SIZE_FLOOR, stroke: css('--line'), 'stroke-width': 3 }, svg);
  return item.vals.map((r, i) => { const x = 345 - (i + .5) * sp; const g = sizeThingAt(svg, item.kind || 'circle', r, x, SIZE_FLOOR - r, (item.colors || [])[i] || NEUTRAL[1]); return { g, k: i, x, r, o: { g }, label: labelText('sizeOne') }; }); }
ITEM.orderBy = {
  make(spec) { const idx = spec.vals.map((v, i) => i).sort((a, b) => spec.vals[a] - spec.vals[b]); if (spec.dir === 'down') idx.reverse(); return { ...spec, tag: 'order-' + (spec.by || 'len'), want: idx.join(',') }; },
  async ask(item, mode, tries) { const svg = newStage(270, { oasis: false, ground: 0 }); const by = item.by || 'len';
    const T = by === 'len' ? lenRow(svg, { ...item, lens: item.vals }) : sizeRow(svg, item);
    const seq = []; const marks = el('g', { 'pointer-events': 'none' }, svg); const want = item.want.split(',').map(Number);
    const badgeAt = t => by === 'len' ? [MS_X + 24, t.o.y] : [t.x, SIZE_FLOOR - 2 * t.r - 20];
    const redraw = () => { marks.innerHTML = ''; marks.dataset.seq = seq.join(','); seq.forEach((k, j) => { const [x, y] = badgeAt(T[k]); const b = badge(marks, x, y, j + 1); if (j < pre) b.dataset.help = 1; }); };
    /* الحلّ المشترك (المستوى 3): أوّلها في مكانه، ويُكمل الطفل الباقي */
    const pre = tries >= 3 ? (want.length <= 3 ? 1 : want.length - 2) : 0; for (let j = 0; j < pre; j++) seq.push(want[j]);
    if (tries >= 3 && by === 'len') { T.forEach(t => t.o.setX(MS_X)); }
    redraw(); const dz = by === 'len' && tries < 3 ? dragAlign(svg, T) : null; const needAl = dz && T.some(t => Math.abs(t.o.x0 - MS_X) > .5);
    /* «حاذِ البدايات» و«تمّ» في صفّ واحد تحت المسرح (صفّان كانا يضغطانه: الدرس 140)؛ و«تمّ» يظهر حين تُرتَّب كلها */
    const tb = toolBar([...(needAl ? [['align', 'alignStarts', TOOL_IC.align, ['practice', 'remedial'].includes(mode) ? 'gen.opt.alignStarts' : null]] : []), ['done', 'done', TOOL_IC.done]]);
    if (needAl) tb.b.align.onclick = async () => { tb.b.align.style.visibility = 'hidden'; hush(); SFX.tick(); await dz.all(); logAttempt({ scene: 'explore', tag: 'alignBtn', ok: true }); };
    const d = { bar: tb.bar, b: tb.b.done }; d.b.style.visibility = 'hidden';
    say(...lineOf(tries >= 3 ? 'gen.order.together' : item.q), { free: true });
    const tap = k => { const j = seq.indexOf(k); if (j >= 0) { if (j < pre) return; seq.splice(j); } else seq.push(k); SFX.pop(); redraw(); d.b.style.visibility = seq.length === T.length ? 'visible' : 'hidden'; };
    /* اللمسة للشيء المرسوم تحت الإصبع (D255؛ الفحص المستقل B لبوابة S1-U4: لمسة على جسم الشريط الثاني وضعت «١» على الثالث)، ولا لمس بعد الجواب (كانت تغيّر شارات المسرح السابق) */
    let answered = false; const TG = T.map(t => ({ g: t.o.g, t }));
    T.forEach((t, i) => { const g = t.o.g; g.style.cursor = 'pointer'; g.setAttribute('role', 'button'); g.setAttribute('tabindex', 0); g.setAttribute('aria-label', plain(G(t.label))); hitPad(g, 56); g.dataset.order = 1; g.__route = (x, y) => tapRoute(TG, x, y, TG[i]).g;
      g.dataset.keys = 1; g.addEventListener('click', e => { if (answered || T.some(x => x.dragAt && Date.now() - x.dragAt < 400)) return; const r = e && e.clientX ? tapRoute(TG, e.clientX, e.clientY, TG[i]) : TG[i]; hush(); tap(r.t.k); }); g.addEventListener('keydown', e => { if (!answered && actKey(e)) tap(t.k); }); });
    AUTO({ kind: 'order', ok: () => { seq.splice(pre); want.slice(pre).forEach(k => seq.push(k)); redraw(); d.b.click(); }, wrong: () => { seq.splice(pre); [...want.slice(pre)].reverse().forEach(k => seq.push(k)); redraw(); d.b.click(); } });
    const ans = await gate(new Promise(res => d.b.onclick = () => { if (seq.length < T.length) return; AUTO_CLEAR(); hush(); d.bar.remove(); res(seq.join(',')); }));
    answered = true; if (dz) dz.off(); untarget(T.map(t => t.o.g));
    item._st = T.map(t => t.o.end ? { x0: t.o.x0, end: t.o.end() } : {}); return { ans, ctx: { svg, T, marks } }; },
  judge(item, ans) { if (ans === item.want) return { ok: true }; const a = ans.split(',').map(Number), w = item.want.split(',').map(Number);
    if (a.join() === [...w].reverse().join()) return { ok: false, err: 'orderReverse' };
    const st = item._st || []; if ((item.by || 'len') === 'len' && st.length && !st.every(s => Math.abs(s.x0 - MS_X) < .5)) { const byEnd = a.map(k => st[k].end); if (byEnd.every((e, j) => !j || (item.dir === 'down' ? e <= byEnd[j - 1] : e >= byEnd[j - 1]))) return { ok: false, err: 'fromEnd' }; }
    return { ok: false, err: 'orderSkip' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  /* حركة الأداة: الأشياء إلى خط البداية (الطول)، أو خطّ أفقي عند أعلى كل دائرة (الحجم): نقارن اثنين اثنين */
  async hint2(item, r) { const T = r.ctx.T; if ((item.by || 'len') === 'len') { await Promise.all(T.map(t => alignTo(t.o, MS_X, 600))); const m = endLines(r.ctx.svg, T); await sleep(1400); m.remove(); }
    else { const m = el('g', { 'pointer-events': 'none' }, r.ctx.svg); T.forEach(t => el('line', { x1: 14, y1: SIZE_FLOOR - 2 * t.r, x2: 346, y2: SIZE_FLOOR - 2 * t.r, stroke: css('--compass'), 'stroke-width': 2.5, 'stroke-dasharray': '4 5' }, m)); await sleep(1600); m.remove(); } },
  async together() {},
  /* الكشف: تنتقل الأشياء إلى ترتيبها */
  async reveal(item, r) { const T = r.ctx.T, w = item.want.split(',').map(Number); r.ctx.marks.innerHTML = '';
    if ((item.by || 'len') === 'len') { const ys = LEN_ROWS(T.length); await Promise.all(w.map((k, j) => { const o = T[k].o, y0 = o.y; o.setX(MS_X); return tween(600, t => { o.y = y0 + (ys[j] - y0) * easeIO(t); o.setX(MS_X); }); })); w.forEach((k, j) => badge(r.ctx.marks, MS_X + 24, ys[j], j + 1)); }
    else w.forEach((k, j) => badge(r.ctx.marks, T[k].x, SIZE_FLOOR - 2 * T[k].r - 20, j + 1));
    await S('gen.order.reveal.' + (item.by || 'len') + '.' + (item.dir === 'down' ? 'down' : 'up')); },
  praise: MEAS_PRAISE, twin(item) { return item.twin || null; },
};

/* ================= ③ أيّها أكبر؟ أيّها أصغر؟ (C024): على أرض واحدة، بلون واحد ================= */
ITEM.sizePick = {
  make(spec) { const v = spec.ask === 'small' ? Math.min(...spec.vals) : Math.max(...spec.vals); return { ...spec, tag: 'size-' + (spec.ask || 'big'), want: spec.vals.indexOf(v) }; },
  async ask(item, mode, tries) { const svg = newStage(250, { oasis: false, ground: 0 }); const T = sizeRow(svg, { ...item, colors: item.colors || item.vals.map(() => NEUTRAL[item.color ?? 1]) });
    if (tries >= 3) { const m = helpG(svg); T.forEach(t => el('line', { x1: 14, y1: SIZE_FLOOR - 2 * t.r, x2: 346, y2: SIZE_FLOOR - 2 * t.r, stroke: css('--compass'), 'stroke-width': 2.5, 'stroke-dasharray': '4 5' }, m)); }
    say(...lineOf(tries >= 3 ? 'gen.size.together.' + (item.ask || 'big') + SIZE_G(item) : item.q), { free: true });
    const k = await tapOne(T.map(t => ({ g: t.g, k: t.k, label: t.label })), { ok: item.want, pad: 56 }); hush(); return { ans: k, ctx: { svg, T } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'sizeWrong' }; },
  onOk(item, r) { SFX.good(); okRing(r.ctx.svg, r.ctx.T[r.ans].g); }, onWrong() { SFX.soft(); }, mark(item, r) { okRing(r.ctx.svg, r.ctx.T[item.want].g); },
  async hint2(item, r) { await ITEM.orderBy.hint2({ by: 'size' }, r); }, async together() {},
  async reveal(item, r) { ITEM.sizePick.mark(item, r); await S('gen.size.reveal.' + (item.ask || 'big') + SIZE_G(item)); },
  praise: MEAS_PRAISE, twin(item) { return item.twin || null; },
};

/* ================= ④ الميزان ذو الكفّتين (C025، H11) ================= */
/* إطار حول كفّة الشيء المطلوب وسهم بجانبها: إلى الأسفل لما نزلت (الأثقل)، وإلى الأعلى لما ارتفعت (الأخفّ) */
function weighMark(svg, m, B, k, down) { const P = B.pans[B.pans.R.k === k ? 'R' : 'L']; const o = okRing(svg, P.bowl, 6); if (o) { o.setAttribute('stroke', css('--compass')); o.setAttribute('stroke-dasharray', '6 5'); m.appendChild(o); }
  const x = P.x + (P.side === 'R' ? -70 : 70), y = P.y - 30; el('path', { d: down ? `M${x} ${y - 16} v34 m-10 -12 l10 12 l10 -12` : `M${x} ${y + 18} v-34 m-10 12 l10 -12 l10 12`, fill: 'none', stroke: css('--compass'), 'stroke-width': 4, 'stroke-linecap': 'round' }, m); }
/* a وb شيئان؛ mode: read (الميزان مائل وهما فيه) | test (يضعهما الطفل في الكفّتين ثم يحكم: إنتاج) | pic (صورتان: يتوقّع، والميزان يُريه في المساعدة)
   ask: heavy | light. الكفّة اليمنى لـ a واليسرى لـ b */
const heavier = (a, b) => (WEIGH[a].w > WEIGH[b].w ? a : b);
ITEM.balance = {
  make(spec) { const h = heavier(spec.a, spec.b), l = h === spec.a ? spec.b : spec.a; return { ...spec, tag: 'weigh-' + (spec.mode || 'read'), want: (spec.ask || 'heavy') === 'heavy' ? h : l }; },
  async ask(item, mode, tries) { const svg = newStage(290, { oasis: false, ground: 14 }); const m = item.mode || 'read';
    const showBal = m !== 'pic' || tries >= 1;   /* «توقّع ثم جرّب» (H11، المواصفة د2 ت4): التوقّع من الصورة مرة واحدة، ثم يبقى الميزان أمام الطفل */
    let B = null, T;
    if (showBal) { B = balanceAt(svg, 180, 276);
      if (m === 'test' && tries < 2) { /* يضع الطفل الشيئين في الكفّتين: يلمس الشيء فيذهب إلى كفّة فارغة */
        const P = weighShelf(svg, [item.a, item.b]);
        say(...lineOf(item.q), { free: true });   /* جملة البند أمرٌ بالوضع تُقال قبله، والسؤال بعد الميل (الفحص المستقل C1 لبوابة S1-U4: كانت «ضعي… أيّهما أخفّ؟» تُقال بعد الوضع والميل؛ 4ب13) */
        await gate(shelfPut(B, P));
        logAttempt({ scene: 'explore', tag: 'weighPut', ok: true }); await B.to(tiltOf(B.pans.R.k, B.pans.L.k), 1100); }
      else { B.put('R', item.a); B.put('L', item.b); B.set(tiltOf(item.a, item.b)); }
      T = ['R', 'L'].map(s => ({ g: B.pans[s].bowl, k: B.pans[s].k, label: labelText('w.' + B.pans[s].k) })); }
    else { T = [{ k: item.a, x: 260 }, { k: item.b, x: 100 }].map(p => ({ g: weighAt(svg, p.k, p.x, 230, 1.1), k: p.k, label: labelText('w.' + p.k) })); el('rect', { x: 20, y: 230, width: 320, height: 10, rx: 4, fill: MAT.wood, 'data-shelf': 1 }, svg); }
    if (tries >= 3 && B) { const h = helpG(svg); weighMark(svg, h, B, item.want, (item.ask || 'heavy') === 'heavy'); }
    /* «ضع»: جملة البند قيلت قبل الوضع؛ ومن الصورة بعد محاولة: الميزان أمامه فلا «توقّع» (الفحص المستقل C1 لبوابة S1-U4) */
    say(...lineOf(tries >= 3 ? 'gen.weigh.together' : m === 'test' || (m === 'pic' && B) ? 'gen.weigh.ask.' + (item.ask || 'heavy') + WEIGH_G(item.a, item.b) : item.q), { free: true });
    let k = await tapOne(T, { ok: item.want, pad: 64 }); hush();
    /* التوقّع من الصورة لا يُحكم: يُسجَّل، ثم «نتحقّق بالميزان» فيوضع الشيئان فيه ويميل، ويُحكم على قراءة الميزان (المواصفة د2 ت4؛ الفحص المستقل A لبوابة S1-U4:
       كان التوقّع يُحكم خطأً بصوت الخطأ وسؤاله ولا ميزان على الشاشة) */
    if (!B) { logAttempt({ scene: SCENE_NOW || mode, tag: 'weigh-predict', ok: k === item.want }); item._pred = k; SFX.tick(); T.forEach(t => t.g.remove()); svg.querySelectorAll('[data-shelf]').forEach(x => x.remove()); B = balanceAt(svg, 180, 276);   /* ورفّ الصورة يذهب مع الصورة (الفحص المستقل C1: بقي تحت الميزان) */ B.put('R', item.a); B.put('L', item.b); B.set(0);
      await S('gen.weigh.check'); await B.to(tiltOf(item.a, item.b), FAST ? 30 : 1000); T = ['R', 'L'].map(s => ({ g: B.pans[s].bowl, k: B.pans[s].k, label: labelText('w.' + B.pans[s].k) }));
      say(...lineOf('gen.weigh.read' + WEIGH_G(item.a, item.b)), { free: true }); k = await tapOne(T, { ok: item.want, pad: 64 }); hush(); }
    item._big = WEIGH[k] && WEIGH[k].big; return { ans: k, ctx: { svg, B, T } }; },
  judge(item, k) { if (k === item.want) return { ok: true }; const other = k === item.a ? item.b : item.a;
    if ((item.ask || 'heavy') === 'heavy' && WEIGH[k].big && !WEIGH[other].big) return { ok: false, err: 'bigHeavy' };
    /* والتوقّع من الصورة لا يُحكم (يُحكم على قراءة الميزان بعده)، فالخطأ قراءة الكفّة: «الأثقل» بالمرتفعة، و«الأخفّ» بالنازلة (الفحص المستقل A لبوابة S1-U4:
       سؤال «أيّ الكفّتين أقرب إلى الأرض؟» في «أيّهما أخفّ؟» كان يدلّ على الجواب الخاطئ) */
    return { ok: false, err: (item.ask || 'heavy') === 'heavy' ? 'panUp' : 'panDown' }; },
  /* والميزان أمام الطفل دائماً حين يُحكم: التوقّع من الصورة يتبعه الميزان في ask نفسها (H11)، فلا ميزان يُرسم هنا (كان يُرسم بعد التوقّع الصحيح، ثم صار ميتاً) */
  onOk(item, r) { SFX.good(); const t = r.ctx.T.find(x => x.k === r.ans); if (t) okRing(r.ctx.svg, t.g, 4); }, onWrong() { SFX.soft(); },
  mark(item, r) { const t = r.ctx.T.find(x => x.k === item.want); if (t) okRing(r.ctx.svg, t.g, 4); },
  /* حركة الأداة: الشيئان في الكفّتين، والميزان يميل (أو يتأرجح ثم يستقرّ إن كان فيهما) */
  async hint2(item, r) { const B = r.ctx.B;
    B.put('R', item.a); B.put('L', item.b); B.set(0); await sleep(300); await B.to(tiltOf(item.a, item.b), 1200); await sleep(700); },
  async together() {},
  async reveal(item, r) { if (r.ctx.B) { r.ctx.B.set(0); await r.ctx.B.to(tiltOf(item.a, item.b), 700); } ITEM.balance.mark(item, r); await S('gen.weigh.reveal.' + ((item.ask || 'heavy') === 'heavy' ? 'heavy' : 'light') + WEIGH_G(item.want)); },
  /* و«لم يخدعك الحجم!» لزوجٍ أكبرُه أخفّ وحده (الفحص المستقل D1 لبوابة S1-U4 (15))، ولمن لم يخدعه: فمن توقّع من الصورة خطأً ثم قرأ الميزان صحيحاً
     خدعه الحجم وصحّحه الميزان، فمدحه مدح القراءة (الفحص المستقل E2: كان يسمع «لم يخدعك الحجم!») */
  praise: item => { const A = WEIGH[item.a] || {}, B = WEIGH[item.b] || {}; if ((item.mode || 'read') === 'pic' && item._pred !== item.want) return 'praiseWeigh';
    return A.big !== B.big && (A.big ? A.g < B.g : B.g < A.g) ? 'praiseWeighTrap' : 'praiseWeigh'; }, twin(item) { return item.twin || null; },
};

/* ================= ⑤ كم مشبكاً طوله؟ (C016): الوحدات متلاصقة من بداية الشيء (H11)، يعدّها الطفل بلمسات ثم يختار العدد ================= */
const UNIT_Y = 156;
ITEM.unitCount = { ...numItem,
  make(spec) { return { ...spec, tag: 'meas-' + spec.unit, want: spec.n }; },
  async ask(item, mode, tries) { const svg = newStage(250, { oasis: false, ground: 0 }); const L = item.n * UNIT_U[item.unit];
    houseAt(svg, item.obj, L, MS_X, 100); startMark(svg, MS_X, 100, 50); const U = unitRow(svg, item.unit, item.n, MS_X, UNIT_Y);
    /* الحلّ المشترك يقف قبل آخر قطعة، فيعدّها الطفل ويختار (D240؛ الفحص المستقل A لبوابة S1-U4: كان يعدّ حتى الجواب ثم يسأل «كم؟») */
    if (tries >= 3) { await S('gen.meas.together' + HOUSE_G(item.obj)); (await unitBadges(svg, U.slice(0, -1))).dataset.help = 1; }
    else { say(...lineOf(item.q), { free: true }); await rowTapCount(svg, U, { label: 'countUnits' }); hush(); }
    const q = item.how || ('gen.meas.how.' + item.unit + HOUSE_G(item.obj)); await S(q); const np = numberPick(nearNums(item.n, 20, 1), item.n, { intro: [lineOf(q)] }); return { ans: await np.p, ctx: { svg, U, np } }; },
  judge(item, ans) { return ans === item.n ? { ok: true } : { ok: false, err: 'lastNumber' }; },
  async hint2(item, r) { await unitBadges(r.ctx.svg, r.ctx.U, { color: css('--square') }); await sleep(400); },
  async together() {}, async reveal(item, r) { markNum(r, item.n, 'ok'); await S(numw(item.n)); },
  twin(item) { return item.twin || null; },
};
/* ================= ⑥ قِس بنفسك (C016، إنتاج): يضع الطفل المشابك واحداً بعد واحد من بداية الشيء حتى نهايته ================= */
ITEM.unitLay = {
  make(spec) { return { ...spec, tag: 'lay-' + spec.unit, want: spec.n }; },
  async ask(item, mode, tries) { const svg = newStage(250, { oasis: false, ground: 0 }); const u = UNIT_U[item.unit], L = item.n * u; houseAt(svg, item.obj, L, MS_X, 100); startMark(svg, MS_X, 100, 50);
    const rowG = el('g', {}, svg); let laid = 0; const pre = tries >= 3 ? item.n - 1 : 0; const MAXL = Math.floor((MS_X - 14) / u);
    const draw = () => { rowG.innerHTML = ''; const a = el('g', pre ? { 'data-help': 1 } : {}, rowG); unitRow(a, item.unit, Math.min(laid, pre), MS_X, UNIT_Y); if (laid > pre) unitRow(rowG, item.unit, laid - pre, MS_X - pre * u, UNIT_Y); };
    laid = pre; draw();
    const add = item.unit === 'cube' ? 'gen.opt.addCube' : 'gen.opt.addClip', rem = item.unit === 'cube' ? 'gen.opt.removeCube' : 'gen.opt.removeClip';
    const tb = toolBar([['plus', 'addUnit', item.unit === 'cube' ? TOOL_IC.cube : TOOL_IC.clip, add], ['minus', 'removeCube', TOOL_IC.minus, rem], ['done', 'done', TOOL_IC.done]]);
    const q = tries >= 3 ? 'gen.lay.together.' + item.unit + HOUSE_G(item.obj) : item.q; await S(q); if (!tries) tb.read([lineOf(q)]); else readChoices([], { intro: [lineOf(q)], host: tb.bar });
    tb.b.plus.onclick = () => { if (laid >= MAXL) return; laid++; draw(); SFX.pop(); hush(); }; tb.b.minus.onclick = () => { if (laid <= pre) return; laid--; draw(); SFX.soft(); hush(); };
    AUTO({ kind: 'lay', ok: () => { laid = item.n; draw(); tb.b.done.click(); }, wrong: () => { laid = item.n + 1 <= MAXL ? item.n + 1 : item.n - 1; draw(); tb.b.done.click(); } });
    const ans = await gate(new Promise(res => tb.b.done.onclick = () => { if (!laid) return; AUTO_CLEAR(); hush(); tb.bar.remove(); res(laid); }));
    return { ans, ctx: { svg, rowG } }; },
  judge(item, n) { return n === item.n ? { ok: true } : { ok: false, err: n > item.n ? 'layOver' : 'layShort' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  /* حركة الأداة: خطّ عند نهاية الشيء يمتدّ إلى صفّ الوحدات: إلى هنا نضع */
  async hint2(item, r) { const x = MS_X - item.n * UNIT_U[item.unit]; const l = el('line', { x1: x, y1: 70, x2: x, y2: UNIT_Y + 26, stroke: css('--compass'), 'stroke-width': 3, 'stroke-dasharray': '5 5', 'pointer-events': 'none' }, r.ctx.svg);
    await anim(l, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, iterations: 3, direction: 'alternate' }).done; await sleep(900); l.remove(); },
  async together() {},
  async reveal(item, r) { r.ctx.rowG.innerHTML = ''; const U = unitRow(r.ctx.rowG, item.unit, item.n, MS_X, UNIT_Y); await unitBadges(r.ctx.svg, U); await S('gen.lay.reveal' + HOUSE_G(item.obj)); await S(numw(item.n), { append: true }); },
  praise: () => 'praiseUnits', twin(item) { return item.twin || null; },
};
/* ================= ⑦ أيّ القياسين صحيح؟ (C016، C017): قياس صحيح وقياس فيه الخطأ (فراغات، أو بداية من غير بداية الشيء، أو وحدات مختلفة) ================= */
/* bad: gap | start | mix؛ top: ok | bad (أيّهما في الأعلى). وما يُرسم بخطئه هنا وحده وفي مشاهد فوضى (H11: المشابك متلاصقة في غير ذلك) */
function measPanel(svg, item, y, kind) { const u = UNIT_U[item.unit], L = item.n * u, g = el('g', { 'data-panel': kind }, svg); houseAt(g, item.obj, L, MS_X, y); startMark(g, MS_X, y, 40);
  let U; const uy = y + 42;
  if (kind === 'ok') U = unitRow(g, item.unit, item.n, MS_X, uy);
  /* والقياس الخاطئ يبلغ نهاية الشيء، فخطؤه واحد (الفحص المستقل A لبوابة S1-U4: الفراغات كانت تقف قبل النهاية، فالخطأ خطآن) */
  else if (item.bad === 'gap') { const c = gapCount(L, u); U = unitRow(g, item.unit, c, MS_X, uy, { gap: (L - c * u) / (c - 1) }); }
  else if (item.bad === 'start') U = unitRow(g, item.unit, item.n - 2, MS_X, uy, { from: 2 * u });
  else { const sz = mixSizes(item.n, u); U = unitRow(g, item.unit, sz.length, MS_X, uy, { sizes: sz }); }
  return { g, U, y, kind }; }
/* عدد المشابك المتباعدة (فراغ 10 على الأقل) التي تمتدّ من بداية الشيء إلى نهايته */
const gapCount = (L, u) => Math.max(2, Math.floor((L + 10) / (u + 10)));
/* وحدات مختلفة الحجم تبلغ نهاية الشيء تماماً: وحدتان كبيرتان (مرة ونصف) أو أربع، والباقي بالحجم الصحيح، والكبيرة في المواضع الفردية */
function mixSizes(n, u) { const k = n >= 8 ? 4 : 2, m = n - 1.5 * k, B = Math.round(u * 1.5), out = []; let b = k, s = m;
  for (let i = 0; b + s > 0; i++) { if (b && (i % 2 || !s)) { out.push(B); b--; } else { out.push(u); s--; } } return out; }
ITEM.unitCheck = {
  make(spec) { return { ...spec, tag: 'ucheck-' + spec.bad, want: 'ok' }; },
  async ask(item, mode, tries) { const svg = newStage(300, { oasis: false, ground: 0 }); const top = item.top || 'ok';
    const P = [measPanel(svg, item, 64, top), measPanel(svg, item, 194, top === 'ok' ? 'bad' : 'ok')];
    if (tries >= 3) { const h = helpG(svg); faultMarks(h, item, P.find(p => p.kind === 'bad')); }
    say(...lineOf(tries >= 3 ? 'gen.ucheck.together' : item.q), { free: true });
    const k = await tapOne(P.map(p => ({ g: p.g, k: p.kind, label: labelText('measPanel') })), { ok: 'ok', pad: 64 }); hush(); return { ans: k, ctx: { svg, P } }; },
  judge(item, k) { return k === 'ok' ? { ok: true } : { ok: false, err: { gap: 'gapOk', start: 'startOk', mix: 'mixOk' }[item.bad] || 'gapOk' }; },
  onOk(item, r) { SFX.good(); okRing(r.ctx.svg, r.ctx.P.find(p => p.kind === 'ok').g, 4); }, onWrong() { SFX.soft(); },
  mark(item, r) { okRing(r.ctx.svg, r.ctx.P.find(p => p.kind === 'ok').g, 4); },
  async hint2(item, r) { const m = el('g', { 'pointer-events': 'none' }, r.ctx.svg); faultMarks(m, item, r.ctx.P.find(p => p.kind === 'bad')); await anim(m, [{ opacity: .2 }, { opacity: 1 }], { duration: 500, iterations: 4, direction: 'alternate' }).done; await sleep(600); m.remove(); },
  async together() {},
  async reveal(item, r) { ITEM.unitCheck.mark(item, r); await S('gen.ucheck.reveal.' + item.bad); },
  praise: item => 'praiseCheck' + { gap: 'Gap', start: 'Start', mix: 'Mix' }[item.bad], twin(item) { return item.twin || null; },
};
/* علامات الخطأ في القياس الخاطئ: الفراغات حلقات، والبداية سهم، والوحدات المختلفة إطار حول الكبيرة */
function faultMarks(m, item, p) { const U = p.U;
  if (item.bad === 'gap') for (let i = 1; i < U.length; i++) el('circle', { cx: (U[i - 1].left + U[i].right) / 2, cy: U[i].y, r: 9, fill: 'none', stroke: css('--chaos'), 'stroke-width': 3 }, m);
  else if (item.bad === 'start') { el('rect', { x: U[0].right, y: U[0].y - 12, width: MS_X - U[0].right, height: 24, rx: 4, fill: css('--chaos'), opacity: .25 }, m); el('line', { x1: MS_X, y1: p.y - 24, x2: MS_X, y2: U[0].y + 18, stroke: css('--chaos'), 'stroke-width': 3, 'stroke-dasharray': '4 4' }, m); }
  else U.filter(q => q.u > UNIT_U[item.unit]).forEach(u => el('rect', { x: u.left - 2, y: u.y - Math.min(u.u, 30) / 2 - 8, width: u.u + 4, height: Math.min(u.u, 30) + 10, rx: 4, fill: 'none', stroke: css('--chaos'), 'stroke-width': 3 }, m)); }

/* ================= ⑧ شبر مَن أطول؟ (C017، فابل B: العلاقة العكسية) ================= */
/* a أشبار فرجار وb أشبار فوضى للطاولة نفسها؛ ask: longer (شبر مَن أطول؟) | more (مَن عدّ أشباراً أكثر؟) */
const SPAN_L = 280;
/* لوحة الشبرين: شبرٌ من كلٍّ منهما يبدآن من خطٍّ واحد، في الزاوية العليا بعيداً عن اليدين والأقواس */
const SPAN_PX = 196;
function spanPanel(m, R) { el('rect', { x: SPAN_PX - 168, y: 2, width: 182, height: 46, rx: 10, fill: css('--paper'), stroke: css('--line'), 'stroke-width': 2 }, m);
  R.forEach((r, i) => el('rect', { x: SPAN_PX - r.s, y: 10 + i * 18, width: r.s, height: 12, rx: 3, fill: r.col }, m)); el('line', { x1: SPAN_PX, y1: 6, x2: SPAN_PX, y2: 44, stroke: css('--ink'), 'stroke-width': 2 }, m); }   /* بلون الحبر: يُرى على ورق الوضع الداكن (الفحص المستقل B لبوابة S1-U4: 1:1) */
function spanTables(svg, a, b) { const rows = [{ who: 'compass', n: a, y: 128, col: '#3d7cc0' }, { who: 'chaos', n: b, y: 268, col: '#c8392d' }];
  return rows.map(r => { const s = SPAN_L / r.n; tableAt(svg, MS_X - SPAN_L / 2, r.y, { w: SPAN_L, h: 60 }); const top = r.y - 60;
    const arcs = spanArcs(svg, r.n, s, MS_X, top, r.col); const hand = el('g', { 'data-who': r.who }, svg); handSpanAt(hand, MS_X, top, s, r.col);
    const who = el('g', {}, hand); (r.who === 'compass' ? compassAt : chaosAt)(who, MS_X + 20, top - 46, .34); return { ...r, s, arcs, g: hand, top }; }); }
ITEM.spanPick = {
  make(spec) { const ask = spec.ask || 'longer'; const fewer = spec.a < spec.b ? 'compass' : 'chaos', more = fewer === 'compass' ? 'chaos' : 'compass'; return { ...spec, tag: 'span-' + ask, want: ask === 'longer' ? fewer : more }; },
  async ask(item, mode, tries) { const svg = newStage(300, { oasis: false, ground: 0 }); const R = spanTables(svg, item.a, item.b);
    if (tries >= 3) spanPanel(helpG(svg), R);
    say(...lineOf(tries >= 3 ? 'gen.span.together.' + (item.ask || 'longer') : item.q), { free: true });
    const k = await tapOne(R.map(r => ({ g: r.g, k: r.who, label: labelText(r.who === 'compass' ? 'spanCompass' : 'spanChaos') })), { ok: item.want, pad: 64 }); hush(); return { ans: k, ctx: { svg, R } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: (item.ask || 'longer') === 'longer' ? 'moreLonger' : 'spanWrong' }; },
  onOk(item, r) { SFX.good(); okRing(r.ctx.svg, r.ctx.R.find(x => x.who === r.ans).g, 4); }, onWrong() { SFX.soft(); },
  mark(item, r) { okRing(r.ctx.svg, r.ctx.R.find(x => x.who === item.want).g, 4); },
  /* حركة الأداة: شبر من كلٍّ منهما على خطّ واحد فوق الطاولتين */
  async hint2(item, r) { const m = el('g', { 'pointer-events': 'none' }, r.ctx.svg); spanPanel(m, r.ctx.R); anim(m, [{ opacity: 0 }, { opacity: 1 }], { duration: 500 }); await sleep(2000); m.remove(); },
  async together() {}, async reveal(item, r) { ITEM.spanPick.mark(item, r); await S('gen.span.reveal.' + (item.a < item.b ? 'compass' : 'chaos')); },
  praise: () => 'praiseSpan', twin(item) { return item.twin || null; },
};

/* ================= ⑨ سلّة الشبر (D001، الخطوة 1): يحاذي الطفل الشبر ببداية الشيء ثم يختار سلّته من ثلاث ================= */
const SPAN_S = 112;   /* الشبر الافتراضي */
function spanTool(svg, x0, y, S = SPAN_S) { const g = el('g', { transform: `translate(${x0} ${y})`, 'data-spantool': 1 }, svg);
  el('rect', { x: -S, y: -10, width: S, height: 20, rx: 4, fill: '#3d7cc0', 'fill-opacity': .22, stroke: '#3d7cc0', 'stroke-width': 2, 'stroke-dasharray': '6 4' }, g); handSpanAt(g, 0, -10, S, '#3d7cc0');
  const o = { g, x0, y, w: S, len: S, end: () => o.x0 - S, setX: x => { o.x0 = x; g.setAttribute('transform', `translate(${x} ${y})`); }, wavy: () => false }; return o; }
const spanCat = (L, S = SPAN_S) => L < S * .85 ? 'short' : L > S * 1.15 ? 'long' : 'same';
const CAT_LINES = { short: 'gen.opt.catShort', same: 'gen.opt.catSame', long: 'gen.opt.catLong' };
const CAT_OPTS = () => ['short', 'same', 'long'].map(k => [k, labelText('cat.' + k), `<svg viewBox="-34 -36 68 64" width="52" height="48" aria-hidden="true">${(() => { const t = el('svg', {}); catIconAt(t, k, 0, 0, 1); return t.innerHTML; })()}</svg>`, CAT_LINES[k]]);
ITEM.spanSort = {
  make(spec) { return { ...spec, tag: 'ssort', want: spanCat(spec.len) }; },
  async ask(item, mode, tries) { const svg = newStage(250, { oasis: false, ground: 0 }); startLineAt(svg, 30, 222);
    const th = houseAt(svg, item.obj, item.len, MS_X, 176); const sp = spanTool(svg, tries >= 3 ? MS_X : MS_X - (item.shift ?? 60), 92);
    if (tries >= 3) { const h = helpG(svg); el('line', { x1: sp.end(), y1: 60, x2: sp.end(), y2: 200, stroke: css('--compass'), 'stroke-width': 2.5, 'stroke-dasharray': '4 5' }, h); }
    const dz = tries >= 3 ? null : dragAlign(svg, [{ o: sp, label: labelText('spanTool') }], { tap: true });
    say(...lineOf(tries >= 3 ? 'gen.ssort.together' : item.q), { free: true });
    const k = await choosePick(CAT_OPTS(), item.want); if (dz) dz.off(); item._al = Math.abs(sp.x0 - MS_X) < .5; item._end = sp.end(); return { ans: k, ctx: { svg, sp, th } }; },
  /* والشبر غير محاذٍ: كل خطأ سؤاله المحاذاة (ssortAlign: «هَلْ يَبْدَأُ الشِّبْرُ وَالشَّيْءُ مِنْ خَطٍّ وَاحِدٍ؟»؛ الفحص المستقل F1 (9): كان fromEnd وسؤاله لأشياء كثيرة)، لا «أين نهاية الشيء؟ وأين نهاية الشبر؟» التي تقود إلى الحكم بالنهاية (الفحص المستقل E1 (8): كان لما وافق النهاية وحده) */
  judge(item, k) { if (k === item.want) return { ok: true }; return { ok: false, err: item._al ? 'ssortWrong' : 'ssortAlign' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { await alignTo(r.ctx.sp, MS_X, 700); const l = el('line', { x1: r.ctx.sp.end(), y1: 60, x2: r.ctx.sp.end(), y2: 200, stroke: css('--compass'), 'stroke-width': 2.5, 'stroke-dasharray': '4 5', 'pointer-events': 'none' }, r.ctx.svg); await sleep(1500); l.remove(); },
  async together() {}, async reveal(item) { await S('gen.ssort.reveal.' + item.want + HOUSE_G(item.obj)); },
  praise: () => 'praiseSpanSort', twin(item) { return item.twin || null; },
};

/* ================= ⑨ب الشبر يقارن شيئين لم يتجاورا (التعدّي) تمريناً وتقييماً ================= */
/* الفحص المستقل A لبوابة S1-U4: كان التعدّي مرة واحدة في اكتشاف اللوحة (transTap)، بلا تمرين ولا تقييم. شيئان من سلّتين مختلفتين، a يميناً وb يساراً،
   كلٌّ في بطاقة سلّته برسمٍ بالطول نفسه (رمزٌ في السلّة لا قياس، فلا يدلّ الرسم على الأطول) كما في المشهد؛ la وlb طولاهما في الدرس (منهما السلّتان، 4ب9)؛
   ask: longer | shorter. والحلّ المشترك يصل الشبر بالسلّتين ويحيط برمز سلّة الجواب، وجملته تقول ما في السلّتين، والاستنتاج للطفل */
const TRANS_X = [266, 94];
/* رمز الشبر في التعدّي: يدٌ في دائرة لا تُقاس، فلا يُقارَن برسمَي الشيئين (وهما بطول واحد عمداً)؛ الفحص المستقل C1 لبوابة S1-U4: كان الشبر بطوله
   الحقيقي فوق رسمين أقصر منه، وأحدهما في سلّة «أطول من الشبر» */
function spanBadge(svg, x, y) { const g = el('g', { transform: `translate(${x} ${y})`, 'data-spanbadge': 1, 'pointer-events': 'none' }, svg);
  el('circle', { r: 30, fill: css('--paper'), stroke: '#3d7cc0', 'stroke-width': 3 }, g); handSpanAt(el('g', { transform: 'scale(.5)' }, g), 30, 36, 60, '#3d7cc0');
  const o = { g, x, y, moveTo: async (x2, y2, ms = 600) => { const x0 = o.x, y0 = o.y; await tween(FAST ? 20 : ms, t => { const e = easeIO(t); g.setAttribute('transform', `translate(${x0 + (x2 - x0) * e} ${y0 + (y2 - y0) * e})`); });
    o.x = x2; o.y = y2; g.setAttribute('transform', `translate(${x2} ${y2})`); } }; return o; }
function transCards(svg, item) { return [[item.a, item.la], [item.b, item.lb]].map(([k, L], i) => { const x = TRANS_X[i], g = el('g', { 'data-trans': k }, svg);
  el('rect', { x: x - 72, y: 104, width: 144, height: 132, rx: 14, fill: css('--paper'), stroke: css('--basket-dk'), 'stroke-width': 2.5 }, g);
  catIconAt(g, spanCat(L), x, 142, .9); houseAt(g, k, 84, x + 42, 208); return { g, k, x, cat: spanCat(L), label: labelText('h.' + k) }; }); }
const transRing = (m, x) => el('circle', { cx: x, cy: 140, r: 32, fill: 'none', stroke: css('--compass'), 'stroke-width': 3, 'pointer-events': 'none' }, m);
ITEM.transPick = {
  /* الجواب من الطولين لا من اسم السلّة (الفحص المستقل C2 لبوابة S1-U4: كان «الأطول» ما سلّته «أطول»، فزوج (بطوله، أقصر) يعطي الخطأ)، وsame: الجواب في سلّة «بطول الشبر» */
  /* والحلّ والكشف بزوج السلّتين (الفحص المستقل D1 لبوابة S1-U4): «بطوله» مع «أطول» أو «أقصر»، أو «أطول» مع «أقصر»؛ وvsSame: الجواب في «أطول» أو «أقصر» وصاحبه «بطوله» */
  make(spec) { const ask = spec.ask || 'longer', want = (ask === 'longer') === (spec.la > spec.lb) ? spec.a : spec.b, ca = spanCat(spec.la), cb = spanCat(spec.lb), cw = want === spec.a ? ca : cb, co = want === spec.a ? cb : ca;
    return { ...spec, ask, tag: 'trans-' + ask, want, same: cw === 'same', vsSame: co === 'same' }; },
  async ask(item, mode, tries) { const svg = newStage(250, { oasis: false, ground: 0 }); const sp = spanBadge(svg, 180, 62); const T = transCards(svg, item);
    /* الحلّ المشترك: الشبر موصول بالسلّتين، ثم حلقةٌ على رمز سلّة اليمين بجملتها («فِي هَذِهِ السَّلَّةِ…»)، ثم على سلّة اليسار بجملتها، بهذا الترتيب دائماً لا بالجواب،
       ثم السؤال؛ فيقرأ الطفل الرمزين ويستنتج (الفحص المستقل D1 لبوابة S1-U4: كانت الحلقة على سلّة الجواب وحدها فدلّت عليه؛ والفحص المستقل E1 (11): صارت الحلقتان معاً
       بجملةٍ بترتيب الزوج لا الشاشة، لا تصل الوصف برمز سلّته، فكان الحلّ أضعف من حركة الأداة) */
    let answered = false, hook = null;
    if (tries >= 3) { const h = helpG(svg), R = [], basket = (i, t) => S((i ? 'gen.trans.basket2.' : 'gen.trans.basket.') + t.cat, { free: true });
      T.forEach(t => el('line', { x1: 180 + (t.x > 180 ? 24 : -24), y1: 80, x2: t.x, y2: 108, stroke: css('--compass'), 'stroke-width': 2.5, 'stroke-dasharray': '4 5' }, h));
      for (const [i, t] of T.entries()) { R.push(transRing(h, t.x)); await gate(basket(i, t)); }
      /* و«أعد الجملة» عند سؤال الحلّ يعيد الحلّ كله: كل سلّة بوميض حلقتها وجملتها، ثم السؤال (الفحص المستقل F2 (1)(أ): كان يعيد «فَأَيُّهُمَا أَقْصَرُ؟» وحدها) */
      /* والحلقة الأخرى تخفت ما دامت جملة هذه السلّة تُقال، فترتبط كل حلقة بجملتها ومع تقليل الحركة أيضاً (الفحص المستقل G2 (6أ): الوميض الرتيب يقفز إلى نهايته فلا يُرى) */
      const flow = FLOW; let hrun = 0; hook = REPLAY_HOOK = async () => { const g0 = speechGen, me = ++hrun, lit = i => { if (me === hrun) R.forEach((r, j) => { r.style.opacity = i == null || j === i ? '' : '.2'; }); };   /* إعادةٌ قطعتها أخرى لا تمسّ حلقاتها */
        for (const [i, t] of T.entries()) { if (answered || speechGen !== g0) return lit(null); lit(i); await basket(i, t); }
        lit(null); if (!answered && speechGen === g0) say(...lineOf('gen.trans.pick.' + item.ask), { free: true }); };
      hook.live = () => !answered && flow === FLOW && svg.isConnected; }
    say(...lineOf(tries >= 3 ? 'gen.trans.pick.' + item.ask : item.q), { free: true });
    const k = await tapOne(T, { ok: item.want, pad: 76 }); answered = true; if (hook && REPLAY_HOOK === hook) REPLAY_HOOK = null; hush(); return { ans: k, ctx: { svg, T, sp } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: item.ask === 'shorter' ? 'transWrongS' : 'transWrong' }; },
  onOk(item, r) { SFX.good(); okRing(r.ctx.svg, r.ctx.T.find(t => t.k === r.ans).g, 4); }, onWrong() { SFX.soft(); },
  mark(item, r) { okRing(r.ctx.svg, r.ctx.T.find(t => t.k === item.want).g, 4); },
  /* حركة الأداة: رمز الشبر يزور السلّتين واحدةً بعد واحدة، وتومض حول رمز كلٍّ حلقة، ثم يعود */
  async hint2(item, r) { const { svg, T, sp } = r.ctx;
    for (const t of T) { await sp.moveTo(t.x, 70); const f = transRing(svg, t.x); await anim(f, [{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }], { duration: 900 }).done; f.remove(); }
    await sp.moveTo(180, 62); },
  async together() {}, async reveal(item, r) { ITEM.transPick.mark(item, r); await S('gen.trans.reveal.' + item.ask + (item.same ? '.same' : item.vsSame ? '.vsSame' : '')); },
  praise: () => 'praiseTrans', twin(item) { return item.twin || null; },
};

/* ================= ⑩ اللوحة (D001): أيّ عمود أطول؟ كم في …؟ كم أكثر؟ كم كلها؟ ================= */
/* cats: رموز الفئات؛ counts: أعداد الأشياء؛ ask: most | least | count (cat) | more (a، b) | total */
/* شارة العدّ بجانب المربّع بالتناوب يميناً ويساراً، لا فوقه: الشارة أعلى من المربّع فكانت شارتان متتاليتان تتراكبان وتغطّيان المربعات (الفحص المستقل B لبوابة S1-U4) */
const besideCell = (c, j) => ({ x: +c.r.getAttribute('x') + c.sz / 2 + (j % 2 ? -1 : 1) * (c.sz / 2 + 16), y: c.y + c.sz / 2 });
ITEM.barRead = { ...numItem,
  make(spec) { const c = spec.counts, ask = spec.ask; let want;
    if (ask === 'most' || ask === 'least') { const v = ask === 'most' ? Math.max(...c) : Math.min(...c); want = spec.cats[c.indexOf(v)]; }
    else if (ask === 'count') want = c[spec.cats.indexOf(spec.cat)];
    else if (ask === 'more') want = c[spec.cats.indexOf(spec.a)] - c[spec.cats.indexOf(spec.b)];
    else want = c.reduce((s, x) => s + x, 0);
    return { ...spec, tag: 'bar-' + ask, want }; },
  async ask(item, mode, tries) { const svg = newStage(270, { oasis: false, ground: 0 }); const Bd = barBoardAt(svg, item.cats, item.counts, { baseY: 196 });
    const col = k => Bd.cols[item.cats.indexOf(k)];
    if (tries >= 3) { const h = helpG(svg);
      if (item.ask === 'most' || item.ask === 'least') Bd.cols.forEach(c => el('line', { x1: 20, y1: c.top(), x2: 340, y2: c.top(), stroke: css('--compass'), 'stroke-width': 2.5, 'stroke-dasharray': '4 5' }, h));
      else if (item.ask === 'more') { const A = col(item.a), B = col(item.b); B.cells.forEach((c, j) => el('line', { x1: A.x - 13, y1: A.cells[j].y + 12, x2: B.x + 13, y2: c.y + 12, stroke: css('--compass'), 'stroke-width': 2.5, 'stroke-dasharray': '4 4' }, h)); }
      else { const cells = item.ask === 'count' ? col(item.cat).cells : Bd.cols.flatMap(c => c.cells); cells.slice(0, -1).forEach((c, j) => { const p = besideCell(c, j); badge(h, p.x, p.y, j + 1); }); } }
    const q = tries >= 3 ? 'gen.bar.together.' + item.ask : item.q;
    if (item.ask === 'most' || item.ask === 'least') { say(...lineOf(q), { free: true });
      const k = await tapOne(Bd.cols.map(c => ({ g: c.g, k: c.k, label: labelText('barCol') })), { ok: item.want, pad: 76 }); hush(); return { ans: k, ctx: { svg, Bd } }; }
    await S(q); const np = numberPick(nearNums(item.want, 10), item.want, { intro: [lineOf(q)] }); return { ans: await np.p, ctx: { svg, Bd, np } }; },
  judge(item, k) { if (k === item.want) return { ok: true };
    if (item.ask === 'more' && k === item.counts[item.cats.indexOf(item.a)]) return { ok: false, err: 'moreDiff' };
    if (item.ask === 'more') return { ok: false, err: 'moreWrong' };   /* وأيّ خطأ آخر في «كم زاد؟» سؤاله المقابلة لا «أيّ عمود أعلى؟» (الفحص المستقل D1 لبوابة S1-U4) */
    if (item.ask === 'total') return { ok: false, err: 'totalPart' };
    if (item.ask === 'count') return { ok: false, err: 'barColCount' };
    return { ok: false, err: 'barWrong' }; },
  onOk(item, r) { if (r.ctx.np) markNum(r, r.ans, 'ok'); SFX.good(); }, onWrong(item, r) { if (r.ctx.np) markNum(r, r.ans, 'no'); SFX.soft(); },
  mark(item, r) { if (r.ctx.np) markNum(r, item.want, 'ok'); else { const c = r.ctx.Bd.cols.find(c => c.k === item.want); if (c) okRing(r.ctx.svg, c.g, 6); } },
  async hint2(item, r) { const Bd = r.ctx.Bd, svg = r.ctx.svg; const col = k => Bd.cols[item.cats.indexOf(k)];
    if (item.ask === 'most' || item.ask === 'least') { const m = el('g', { 'pointer-events': 'none' }, svg); Bd.cols.forEach(c => el('line', { x1: 20, y1: c.top(), x2: 340, y2: c.top(), stroke: css('--compass'), 'stroke-width': 2, 'stroke-dasharray': '4 5' }, m)); await sleep(1600); m.remove(); return; }
    if (item.ask === 'more') { await pairCols(svg, col(item.a), col(item.b)); return; }
    const cells = item.ask === 'count' ? col(item.cat).cells : Bd.cols.flatMap(c => c.cells); await badgeCount(svg, cells.map(besideCell), css('--rect')); await sleep(400); },
  async together() {},
  async reveal(item, r) { ITEM.barRead.mark(item, r); if (r.ctx.np) await S(numw(item.want)); else await S('gen.bar.reveal.' + item.ask); },
  praise: () => 'praiseBoard', twin(item) { return item.twin || null; },
};
/* مقابلة مربعات عمودين واحداً بواحد، والزائد في حلقات (N004 استدعاء) */
async function pairCols(svg, A, B) { const m = el('g', { 'pointer-events': 'none' }, svg); const n = Math.min(A.cells.length, B.cells.length);
  for (let j = 0; j < n; j++) { el('line', { x1: A.x - 13, y1: A.cells[j].y + 12, x2: B.x + 13, y2: B.cells[j].y + 12, stroke: css('--compass'), 'stroke-width': 2.5, 'stroke-dasharray': '4 4' }, m); SFX.tick(); await sleep(260); }
  const T = A.cells.length > B.cells.length ? A : B; for (let j = n; j < T.cells.length; j++) el('circle', { cx: T.x, cy: T.cells[j].y + 12, r: 17, fill: 'none', stroke: css('--think'), 'stroke-width': 3.5 }, m);
  await sleep(1400); m.remove(); }
/* ================= ⑪ ابنِ اللوحة (D001، إنتاج): مربع في العمود لكل شيء في سلّته، والأعمدة من خط واحد ================= */
/* cats وcounts: السلال وما فيها (يُرسم في الأعلى)؛ يلمس الطفل العمود فيضيف مربعاً، و«أبعد» يزيل آخر مربع، ثم «تمّ» */
function basketsRow(svg, cats, counts, y = 60) { const n = cats.length, gap = 96, x0 = 180 + (n - 1) * gap / 2;
  return cats.map((k, i) => { const x = x0 - i * gap; const g = el('g', {}, svg); el('rect', { x: x - 44, y: y - 34, width: 88, height: 70, rx: 12, fill: css('--paper'), stroke: css('--basket-dk'), 'stroke-width': 2.5 }, g);
    catIconAt(g, k, x, y - 10, .62); const th = []; for (let j = 0; j < counts[i]; j++) { const tx = x + 30 - (j % 5) * 15, ty = y + 18 + Math.floor(j / 5) * 12; th.push(el('circle', { cx: tx, cy: ty, r: 5.5, fill: css('--square'), stroke: '#fff', 'stroke-width': 1.5 }, g)); }
    return { k, x, g, th }; }); }
ITEM.barBuild = {
  make(spec) { return { ...spec, tag: 'barBuild', want: spec.counts.join(',') }; },
  async ask(item, mode, tries) { const svg = newStage(300, { oasis: false, ground: 0 }); basketsRow(svg, item.cats, item.counts, 54);
    const Bd = barBoardAt(svg, item.cats, item.cats.map(() => 0), { baseY: 250, cell: 20, iconS: .55 }); Bd.g.querySelectorAll('[data-cat]').forEach(e => e.setAttribute('transform', e.getAttribute('transform').replace(/translate\(([-\d.]+) ([-\d.]+)\)/, (m, x, y) => `translate(${x} ${+y - 8})`)));
    const pre = tries >= 3 ? item.counts.map(c => Math.max(0, c - 1)) : item.counts.map(() => 0); if (tries >= 3) Bd.cols.forEach((c, i) => { for (let j = 0; j < pre[i]; j++) c.add().dataset.help = 1; });
    const added = []; const hist = [];
    Bd.cols.forEach((c, i) => { const hit = el('rect', { x: c.x - 40, y: 96, width: 80, height: 154, fill: 'transparent', 'pointer-events': 'all' }, c.g); c.g.style.cursor = 'pointer'; c.g.setAttribute('role', 'button'); c.g.setAttribute('tabindex', 0); c.g.setAttribute('aria-label', plain(G(labelText('barCol')))); c.g.dataset.col = c.k;
      const act = () => { if (c.cells.length >= 7) return; c.add(); hist.push(i); SFX.pop(); hush(); if (!SET.muted && !FAST) say(...lineOf(numw(c.cells.length)), { num: true, noGap: true, free: true }); };
      c.g.onclick = act; c.g.onkeydown = e => { if (actKey(e)) act(); }; });
    const tb = toolBar([['minus', 'removeSquare', TOOL_IC.minus, 'gen.opt.removeSquare'], ['done', 'done', TOOL_IC.done]]);
    tb.b.minus.onclick = () => { const i = hist.pop(); if (i == null) return; Bd.cols[i].pop(); SFX.soft(); };
    const q = tries >= 3 ? 'gen.barb.together' : item.q; await S(q); if (!tries) tb.read([lineOf(q)]); else readChoices([], { intro: [lineOf(q)], host: tb.bar });
    AUTO({ kind: 'barBuild', ok: () => { Bd.cols.forEach((c, i) => { while (c.cells.length < item.counts[i]) c.add(); while (c.cells.length > item.counts[i]) c.pop(); }); tb.b.done.click(); },
      wrong: () => { Bd.cols.forEach((c, i) => { while (c.cells.length < item.counts[i] + (i === 0 ? 1 : 0)) c.add(); }); tb.b.done.click(); } });
    const ans = await gate(new Promise(res => tb.b.done.onclick = () => { if (!Bd.cols.some(c => c.cells.length)) return; AUTO_CLEAR(); hush(); tb.bar.remove(); res(Bd.cols.map(c => c.cells.length).join(',')); }));
    Bd.cols.forEach(c => { c.g.onclick = null; c.g.style.cursor = ''; }); return { ans, ctx: { svg, Bd } }; },
  judge(item, a) { return a === item.want ? { ok: true } : { ok: false, err: 'barCount' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const Bd = r.ctx.Bd; for (const [i, c] of Bd.cols.entries()) { const got = c.cells.length, want = item.counts[i]; if (got !== want) { okRing(r.ctx.svg, c.g, 2); await S(numw(want), { num: true }); } } await sleep(600); },
  async together() {}, async reveal(item, r) { r.ctx.Bd.cols.forEach((c, i) => { while (c.cells.length < item.counts[i]) c.add(); while (c.cells.length > item.counts[i]) c.pop(); }); await S('gen.barb.reveal'); },
  praise: () => 'praiseBoard', twin(item) { return item.twin || null; },
};

/* ================= ⑫ العشرة والآحاد (N010) ================= */
const teenErr = (n, k) => (n > 10 && k === Math.floor(n / 10) + n % 10) ? 'rodAsOne' : 'teenCount';
/* خيارات «كم مكعباً؟»: العدد وجاره، ومن عدّ العمود مكعباً واحداً */
const teenOpts = n => { const s = new Set([n]); if (n > 10 && n % 10 && avoidOk(Math.floor(n / 10) + n % 10)) s.add(Math.floor(n / 10) + n % 10); for (const d of [...shuffle([1, -1]), ...shuffle([2, -2])]) { if (s.size >= 3) break; if (n + d >= 1 && n + d <= 20 && avoidOk(n + d)) s.add(n + d); } return shuffle([...fillOpts(s, n, 1, 20)]); };
const ROD_OBJ = { s: 22, y: 44 };   /* الشيء المقيس بالمكعبات الصغيرة فوق «العمود والمنفردات» */
ITEM.rodCount = { ...numItem,
  make(spec) { return { ...spec, tag: 'teen-count', want: spec.n }; },
  /* obj: «قسنا الكتاب بالمكعبات ثم ضممناها» (تمرين المواصفة 6 في الدرس 5): الشيء وصفّ مكعباته من بدايته، وتحتهما المكعبات نفسها عموداً ومنفردات
     (الفحص المستقل A لبوابة S1-U4: كانت الجملة تذكر الكتاب ولا كتاب في الصورة) */
  async ask(item, mode, tries) { const svg = newStage(250, { oasis: false, ground: 0 }); const B = item.obj ? ROD_OBJ : null;
    /* وصفّ القياس باهتٌ أثراً لما ضُمّ، فلا يُرى المكعبات مرتين بحجمين ويُعدّ العمود والمنفردات وحدها (الفحص المستقل C1 لبوابة S1-U4: 22 مكعباً) */
    if (B) { houseAt(svg, item.obj, item.n * B.s, MS_X, B.y); startMark(svg, MS_X, B.y, 40); const row = el('g', { opacity: .3, 'data-row': 'was' }, svg); for (let i = 0; i < item.n; i++) oneAt(row, MS_X - (i + .5) * B.s, B.y + 32, { c: B.s - 2 }); }
    const T = teenAt(svg, item.n, B ? { baseY: 238, compact: true, rodX: 150, onesX: 214 } : { baseY: 210 });
    if (tries >= 3) { const h = helpG(svg); T.rods.forEach((r, i) => { const c = B ? digitCard(h, r.x - 40, 172, 10, { size: .6 }) : digitCard(h, r.x, 40, 10, { size: .6 }); }); T.ones.slice(0, -1).forEach((o, j) => badge(h, B ? o.x + 34 + (j % 2) * 30 : o.x, B ? o.y : o.y - 22 - (j % 2) * 24, Math.floor(item.n / 10) * 10 + j + 1)); }   /* متناوبة فلا تتراكب (المنفردات متلاصقة) */
    const q = tries >= 3 ? 'gen.teen.together' + (item.n === 11 ? '.one' : '') : item.q; await S(q); const np = numberPick(teenOpts(item.n), item.n, { intro: [lineOf(q)] }); return { ans: await np.p, ctx: { svg, T, np } }; },   /* وللعدد 11 جملته (D2) */
  judge(item, k) { return k === item.n ? { ok: true } : { ok: false, err: teenErr(item.n, k) }; },
  /* حركة الأداة: يُفكّ العمود ويُعدّ (عشرة)، ثم المنفردات بعده */
  async hint2(item, r) { await teenUnpack(r.ctx.svg, r.ctx.T); },
  async together() {}, async reveal(item, r) { markNum(r, item.n, 'ok'); await S(numw(item.n)); },
  praise: () => 'praiseTen', twin(item) { return item.twin || null; },
};
/* يُفكّ العمود: تُعدّ مكعباته عشرة، ثم يُعدّ ما بعده من المنفردات (الخطأ: «يعدّ عمود العشرة مكعباً واحداً») */
async function teenUnpack(svg, T) { const m = el('g', { 'pointer-events': 'none' }, svg); let n = 0;
  for (const r of T.rods) for (let i = 0; i < 10; i++) { n++; const y = 210 - (i + .5) * TEN_C; el('circle', { cx: r.x + 18, cy: y, r: 4, fill: css('--compass') }, m); SFX.tick(); await S(numw(n), { noGap: true, num: true }); }
  for (const [j, o] of T.ones.entries()) { n++; badge(m, o.x, o.y - 22 - (j % 2) * 24, n, css('--square')); SFX.tick(); await S(numw(n), { noGap: true, num: true }); }
  await sleep(500); m.remove(); }
/* ابنِ العدد بعمود ومنفردات (إنتاج): «أضف عموداً»، «أضف مكعباً»، «أبعد»، «تمّ» */
ITEM.rodBuild = {
  make(spec) { return { ...spec, tag: 'teen-build', want: spec.n }; },
  async ask(item, mode, tries) { const svg = newStage(270, { oasis: false, ground: 0 }); digitCard(svg, 316, 44, item.n, { size: .9 });
    const pre = tries >= 3 ? { t: Math.floor(item.n / 10), o: Math.max(0, item.n % 10 - 1) } : { t: 0, o: 0 }; if (tries >= 3 && item.n % 10 === 0) pre.t = Math.max(0, pre.t - 1);
    let t = pre.t, o = pre.o; const hist = []; let G0 = null; const draw = () => { if (G0) G0.g.remove(); G0 = teenAt(svg, t * 10 + o, { baseY: 236, onesX: 300, tens: t, ones: o }); if (tries >= 3) G0.g.dataset.help = 1; }; draw();
    const tb = toolBar([['rod', 'addRod', TOOL_IC.rod, 'gen.opt.addRod'], ['one', 'addOne', TOOL_IC.cube, 'gen.opt.addCube'], ['minus', 'removeCube', TOOL_IC.minus, 'gen.opt.removeLast'], ['done', 'done', TOOL_IC.done]]);
    /* المكعب العاشر يبقى منفرداً كما وضعه الطفل (فيُسأل عن «لا عمود» إن بنى العدد كله منفردات)، والحدّ يُسمع لا يسكت */
    tb.b.rod.onclick = () => { if (t >= 2) { SFX.soft(); return; } t++; hist.push('t'); draw(); SFX.pop(); hush(); }; tb.b.one.onclick = () => { if (o >= 19) { SFX.soft(); return; } o++; hist.push('o'); draw(); SFX.pop(); hush(); };
    tb.b.minus.onclick = () => { const h = hist.pop(); if (!h) return; if (h === 't') t--; else o--; draw(); SFX.soft(); };
    const q = tries >= 3 ? 'gen.teen.buildTogether' : item.q; await S(q); await say(...lineOf(numw(item.n)), { append: true }); const intro = [lineOf(q), [...lineOf(numw(item.n)), { append: true }]]; if (!tries) tb.read(intro); else readChoices([], { intro, host: tb.bar });
    AUTO({ kind: 'rods', ok: () => { t = Math.floor(item.n / 10); o = item.n % 10; draw(); tb.b.done.click(); }, wrong: () => { t = 0; o = Math.min(10, item.n % 10 + 1); draw(); tb.b.done.click(); } });
    const ans = await gate(new Promise(res => tb.b.done.onclick = () => { if (!t && !o) return; AUTO_CLEAR(); hush(); tb.bar.remove(); res(t * 100 + o); }));
    return { ans, ctx: { svg, built: () => G0 } }; },
  judge(item, a) { const t = Math.floor(a / 100), o = a % 100, n = t * 10 + o; if (t === Math.floor(item.n / 10) && o === item.n % 10) return { ok: true }; if (n === item.n) return { ok: false, err: 'noRod' }; return { ok: false, err: n > item.n ? 'tooMany' : 'tooFew' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item) { await S('gen.teen.split'); await S(numw(item.n), { append: true }); },
  /* الكشف مكان بناء الطفل لا فوقه: يُزال بناؤه أولاً، فيُرى العدد الذي يُقال (الفحص المستقل B لبوابة S1-U4) */
  async together() {}, async reveal(item, r) { const B = r.ctx.built && r.ctx.built(); if (B) B.g.remove(); teenAt(r.ctx.svg, item.n, { baseY: 236, onesX: 300 }).g.dataset.reveal = 1; await S('gen.teen.reveal'); await S(numw(item.n), { append: true }); },
  praise: () => 'praiseTen', twin(item) { return item.twin || null; },
};
/* صِل البناء ببطاقته: dir = card (بناء واحد وثلاث بطاقات) | build (بطاقة واحدة وثلاثة بناءات) */
ITEM.rodMatch = {
  make(spec) { return { ...spec, tag: 'teen-match-' + (spec.dir || 'card'), want: spec.n }; },
  async ask(item, mode, tries) { const svg = newStage(290, { oasis: false, ground: 0 }); let T, targets;
    if ((item.dir || 'card') === 'card') { T = teenAt(svg, item.n, { baseY: 170 }); targets = cardRow(svg, item.opts, 236); }
    else { digitCard(svg, 180, 44, item.n, { size: .9 }); targets = item.opts.map((n, i) => { const x = 300 - i * 120; const g = el('g', { 'data-k': n }, svg); teenAt(g, n, { baseY: 266, rodX: x - 30, onesX: x + 6, compact: true }); return { g, k: n, x, label: labelText('teenBuild') }; }); }
    if (tries >= 3) { const h = helpG(svg); if (T) { T.rods.forEach(r => digitCard(h, r.x, 40, 10, { size: .6 })); } else targets.forEach(t => { const tt = Math.floor(t.k / 10); for (let i = 0; i < tt; i++) el('text', { x: t.x - 30 + i * 18, y: 120, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: css('--compass'), 'font-family': css('--f') }, h).textContent = DG(10); }); }
    say(...lineOf(tries >= 3 ? 'gen.teen.matchTogether' : item.q), { free: true });
    const k = await tapOne(targets, { ok: item.n, pad: 84 }); hush(); return { ans: k, ctx: { svg, targets, T } }; },
  judge(item, k) { return k === item.n ? { ok: true } : { ok: false, err: 'teenRead' }; },
  onOk(item, r) { SFX.good(); const t = r.ctx.targets.find(x => x.k === r.ans); okRing(r.ctx.svg, t.g, 4); }, onWrong() { SFX.soft(); },
  mark(item, r) { const t = r.ctx.targets.find(x => x.k === item.n); okRing(r.ctx.svg, t.g, 4); },
  async hint2(item, r) { if (r.ctx.T) await teenUnpack(r.ctx.svg, r.ctx.T); else await S('gen.teen.split'); },
  async together() {}, async reveal(item, r) { ITEM.rodMatch.mark(item, r); await S(numw(item.n)); },
  praise: () => 'praiseTen', twin(item) { return item.twin || null; },
};
/* أيّهما أكثر؟ عددان بين 11 و20 ببنائهما وبطاقتيهما: العمودان متساويان، فنقارن المنفردات */
ITEM.teenCmp = {
  make(spec) { return { ...spec, tag: 'teen-cmp', want: (spec.ask || 'more') === 'more' ? Math.max(spec.a, spec.b) : Math.min(spec.a, spec.b) }; },
  async ask(item, mode, tries) { const svg = newStage(290, { oasis: false, ground: 0 }); const P = [[item.a, 270], [item.b, 90]].map(([n, x]) => { const g = el('g', { 'data-k': n }, svg); digitCard(g, x, 44, n, { size: .85 });
      const t = teenAt(g, n, { baseY: 266, rodX: x - 34, onesX: x + 2, compact: true }); return { g, k: n, x, t, label: labelText('teenBuild') }; });
    if (tries >= 3) { const h = helpG(svg); el('line', { x1: P[0].x - 34, y1: 140, x2: P[1].x - 34, y2: 140, stroke: css('--compass'), 'stroke-width': 2.5, 'stroke-dasharray': '4 4' }, h); }
    say(...lineOf(tries >= 3 ? 'gen.teen.cmpTogether' : item.q), { free: true });
    const k = await tapOne(P, { ok: item.want, pad: 84 }); hush(); return { ans: k, ctx: { svg, P } }; },
  judge(item, k) { return k === item.want ? { ok: true } : { ok: false, err: 'teenCmp' }; },
  onOk(item, r) { SFX.good(); okRing(r.ctx.svg, r.ctx.P.find(p => p.k === r.ans).g, 4); }, onWrong() { SFX.soft(); },
  mark(item, r) { okRing(r.ctx.svg, r.ctx.P.find(p => p.k === item.want).g, 4); },
  async hint2(item, r) { const [A, B] = r.ctx.P; const m = el('g', { 'pointer-events': 'none' }, r.ctx.svg); el('line', { x1: A.x - 34, y1: 140, x2: B.x - 34, y2: 140, stroke: css('--compass'), 'stroke-width': 3, 'stroke-dasharray': '4 4' }, m);
    await sleep(800); const big = A.k > B.k ? A : B, small = big === A ? B : A; big.t.ones.slice(small.t.ones.length).forEach(o => el('circle', { cx: o.x, cy: o.y, r: 11, fill: 'none', stroke: css('--think'), 'stroke-width': 3.5 }, m)); await sleep(1500); m.remove(); },
  async together() {}, async reveal(item, r) { ITEM.teenCmp.mark(item, r); await S(numw(item.want)); }, praise: () => 'praiseTen', twin(item) { return item.twin || null; },
};
/* تتبّع العدد برقمين: رقم العشرات أولاً على اليسار، ثم الآحاد على اليمين (الخطأ: يكتب 13 «31» لأنه يسمع الثلاثة أولاً) */
const TT_X = [100, 260];
ITEM.teenTrace = {
  make(spec) { return { ...spec, tag: 'teen-trace', want: 'ok' }; },
  async ask(item, mode, tries) { const svg = newStage(290, { oasis: false, ground: 0 }); const t = String(Math.floor(item.n / 10)), o = String(item.n % 10); const sk = SET.digits === 'west' ? DIGIT_SK_W : DIGIT_SK;
    let first = null; /* لوحان متباعدان لا تتراكب منطقتا لمسهما (الفحص المستقل B لبوابة S1-U4: تراكبتا 19 وحدة، فلمسة الشريط المشترك تُحسب للّوحين) */
    const L = digitTrace(svg, +t, TT_X[0], 140, 1.12, { sk, noAuto: true, onFirst: () => { if (!first) first = 'L'; } }), Rr = digitTrace(svg, +o, TT_X[1], 140, 1.12, { sk, noAuto: true, onFirst: () => { if (!first) first = 'R'; } });
    L.g.dataset.place = 'tens'; Rr.g.dataset.place = 'ones';
    if (tries >= 3) { const h = helpG(svg); el('path', { d: `M${TT_X[0]} 18 v24 m-9 -10 l9 10 l9 -10`, fill: 'none', stroke: css('--good'), 'stroke-width': 4, 'stroke-linecap': 'round' }, h); }
    if (tries >= 2 || (tries === 0 && firstTime('teenTrace'))) await L.ghost();
    say(...lineOf(tries >= 3 ? 'gen.teen.traceTogether' : item.q), { free: true }); await say(...lineOf(numw(item.n)), { append: true, free: true });
    AUTO({ kind: 'trace2', ok: async () => { first = first || 'L'; L.demo(false); await new Promise(r => setTimeout(r, 30)); Rr.demo(false); }, wrong: async () => { first = 'R'; Rr.demo(false); await new Promise(r => setTimeout(r, 30)); L.demo(false); } });
    const [a, b] = await gate(Promise.all([L.p, Rr.p])); AUTO_CLEAR(); hush();
    return { ans: first === 'R' ? 'onesFirst' : !a.ok ? a.err : !b.ok ? b.err : 'ok', ctx: { svg, L, Rr } }; },
  judge(item, a) { return a === 'ok' ? { ok: true } : { ok: false, err: a }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { await r.ctx.L.ghost(); }, async together() {}, async reveal(item, r) { await r.ctx.L.ghost(); await r.ctx.Rr.ghost(); await S(numw(item.n)); },
  praise: () => 'praiseWrite', twin(item) { return item.twin || null; },
};

/* ================= ⑬ أصدقاء العشرة (N011) ================= */
/* كم يحتاج n ليصير عشرة؟ (الفراغات في الإطار) */
ITEM.frameNeed = { ...numItem,
  make(spec) { return { ...spec, tag: 'friend', want: 10 - spec.n }; },
  async ask(item, mode, tries) { const svg = newStage(230, { oasis: false, ground: 0 }); const F = frameAt(svg, 180, 104); F.fill(item.n, CUBE.lemon);
    if (tries >= 3) { const h = helpG(svg); for (let i = item.n; i < 10; i++) { const p = F.pos(i); el('circle', { cx: p.x, cy: p.y, r: F.c * .38, fill: 'none', stroke: css('--compass'), 'stroke-width': 3, 'stroke-dasharray': '4 4' }, h); } }
    if (tries >= 3) await S('gen.friend.together'); const intro = [lineOf(item.q || 'gen.friend.ask'), [...lineOf(numw(item.n)), { append: true }], [...lineOf('gen.friend.ten'), { append: true }]]; for (const l of intro) await say(l[0], l[1], l[2], l[3] || {});
    const np = numberPick(optsWith(10 - item.n, [item.n], 10), 10 - item.n, { intro }); return { ans: await np.p, ctx: { svg, F, np } }; },
  judge(item, k) { return k === 10 - item.n ? { ok: true } : { ok: false, err: k === item.n ? 'friendCounted' : 'friendWrong' }; },
  async hint2(item, r) { const F = r.ctx.F; for (let i = item.n; i < 10; i++) { const p = F.pos(i); const c = el('circle', { cx: p.x, cy: p.y, r: F.c * .4, fill: css('--compass'), opacity: .35, 'pointer-events': 'none' }, r.ctx.svg); SFX.tick(); await sleep(FAST ? 20 : 380); } await sleep(500); },
  async together() {}, async reveal(item, r) { markNum(r, 10 - item.n, 'ok'); r.ctx.F.fill(10 - item.n, COUNTER2, item.n); await readSentence(item.n, '+', 10 - item.n, 10); },
  praise: () => 'praiseFriend', twin(item) { return item.twin || null; },
};
/* لوّن في الإطار صديقين للعشرة (إنتاج): أيّ تقسيم لم يُرَ */
ITEM.framePaint = {
  make(spec) { return { ...spec, tag: 'framePaint', want: 'new' }; },
  async ask(item, mode, tries) { const svg = newStage(250, { oasis: false, ground: 0 }); const F = frameAt(svg, 180, 96, { cell: 70 }); const on = new Set();   /* كل مربع هدف لمس (D255): 70 وحدة فهو 56 بكسلاً على أضيق شاشة (320)، والمربعات متلاصقة فلا منطقة تزيد عليها */
    const seen = el('g', {}, svg); (item.avoid || []).forEach((p, j) => { const f = frameAt(seen, 300 - j * 120, 212, { cell: 18 }); f.fill(p[0], CUBE.lemon); f.fill(p[1], COUNTER2, p[0]); });
    const firstNew = [1, 2, 3, 4, 5].find(k => !(item.avoid || []).some(p => Math.min(...p) === k)) || 1;
    /* الحلّ المشترك (المستوى 3): نلوّن معه أول تقسيمٍ جديد إلا مربعاً (وواحدٌ إن كان التقسيم واحداً وتسعة)، فتبقى مربعاتنا مرسومة مقفلة */
    const pre = tries >= 3 ? Math.max(1, firstNew - 1) : 0;
    const paint = () => { for (let i = 0; i < 10; i++) { F.take(i); const k = F.put(i, on.has(i) ? CUBE.lemon : COUNTER2); if (i < pre) k.dataset.help = 1; } };
    for (let i = 0; i < pre; i++) on.add(i); paint();
    const hits = Array.from({ length: 10 }, (_, i) => { const p = F.pos(i); const g = el('g', { transform: `translate(${p.x} ${p.y})`, 'data-cell': i, role: 'button', tabindex: 0, 'aria-label': plain(labelText('frameCell')) }, svg); el('rect', { x: -F.c / 2, y: -F.c / 2, width: F.c, height: F.c, fill: 'transparent', 'pointer-events': 'all' }, g); g.style.cursor = 'pointer';
      const act = () => { if (i < pre) return; if (on.has(i)) on.delete(i); else on.add(i); paint(); SFX.pop(); hush(); }; g.onclick = act; g.onkeydown = e => { if (actKey(e)) act(); }; return g; });
    await S(tries >= 3 ? 'gen.fpaint.together' : item.q); const d = doneBtn();
    AUTO({ kind: 'framePaint', ok: () => { on.clear(); for (let i = 0; i < Math.max(firstNew, pre); i++) on.add(i); paint(); d.b.click(); }, wrong: () => { on.clear(); const p = (item.avoid || [[3, 7]])[0]; for (let i = 0; i < Math.max(Math.min(...p), pre); i++) on.add(i); paint(); d.b.click(); } });
    const ans = await gate(new Promise(res => d.b.onclick = () => { AUTO_CLEAR(); hush(); d.bar.remove(); res(on.size); })); hits.forEach(g => g.remove()); return { ans, ctx: { svg, F } }; },
  judge(item, k) { if (k === 0 || k === 10) return { ok: false, err: 'twoParts' }; return (item.avoid || []).some(p => Math.min(...p) === Math.min(k, 10 - k)) ? { ok: false, err: 'sameSplit' } : { ok: true }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2() { await S('gen.fpaint.seen'); }, async together() {}, async reveal() { await S('gen.fpaint.reveal'); },
  praise: () => 'praiseNewWay', twin(item) { return item.twin || null; }, reason() { return null; },
};
/* لمحة الإطار: يظهر لحظة ثم يُغطّى، و«كم؟» من الصفّين دون عدّ (خمسة وشيء) */
ITEM.frameGlance = { ...numItem,
  make(spec) { return { ...spec, tag: 'fglance', want: spec.n }; },
  async ask(item, mode, tries) { const svg = newStage(230, { oasis: false, ground: 0 }); const F = frameAt(svg, 180, 104); F.fill(item.n, CUBE.lemon);
    if (tries >= 3) { await S('gen.fglance.together'); const h = helpG(svg); el('path', { d: `M${F.cx + 112} 76 h-224`, stroke: css('--compass'), 'stroke-width': 3 }, h); label(h, 180, 40, labelText('fiveRow'), 15, css('--compass')); }
    let eye = null; if (tries < 3) { await S('gen.fglance.look'); await gate(psleep(FAST ? 150 : 1400));   /* مدّة اللمحة تقف مع الدرس (الفحص المستقل G2 (4)) */ const cover = el('rect', { x: 60, y: 46, width: 240, height: 116, rx: 16, fill: css('--paper'), stroke: css('--line'), 'stroke-width': 3 }, svg);
      eye = glanceEye(svg, cover, 180, 104, mode, 'fglance'); }
    await S('gen.fglance.ask'); const np = numberPick(nearNums(item.n, 10, 1), item.n); const ans = await np.p; if (eye) eye.off(); return { ans, ctx: { svg, F, np } }; },
  judge(item, k) { return k === item.n ? { ok: true } : { ok: false, err: 'frameGlance' }; },
  async hint2(item, r) { const F = frameAt(r.ctx.svg, 180, 104); F.fill(item.n, CUBE.lemon); await sleep(FAST ? 100 : 1600); F.g.remove(); },
  async together() {}, async reveal(item) { await S(numw(item.n)); }, praise: () => 'praiseGlance', twin(item) { return item.twin || null; },
};

/* ================= ⑭ نكوّن العشرة أولاً (N012) ================= */
/* a في الإطار، وb خارجه؛ يلمس الطفل ما في الخارج فيدخل الإطار حتى يمتلئ، ثم: ask = total (كم صار؟) | moved (كم أخذت لتكمل العشرة؟). story: جملة القصة */
const OUT_Y = 196;
/* خيارات ثلاثة: الجواب، وخطأٌ شائع بعينه إن كان غيره (العشرة وحدها، أو ما أُخذ كله…)، وجارٌ للجواب */
const optsWith = (n, errs = [], max = 20) => { const s = new Set([n]); for (const e of errs) if (s.size < 2 && e !== n && e >= 0 && e <= max && avoidOk(e)) s.add(e); for (const d of [...shuffle([1, -1, 2]), ...shuffle([-2, 3])]) { if (s.size >= 3) break; if (n + d >= 1 && n + d <= max && avoidOk(n + d)) s.add(n + d); } return shuffle([...fillOpts(s, n, 1, max)]); };
ITEM.makeTen = { ...numItem,
  make(spec) { return { ...spec, tag: 'makeTen-' + (spec.ask || 'total') + (spec.story ? '-story' : ''), want: (spec.ask || 'total') === 'moved' ? 10 - spec.a : spec.a + spec.b }; },
  async ask(item, mode, tries) { const svg = newStage(250, { oasis: false, ground: 0 }); const F = frameAt(svg, 180, 84); F.fill(item.a, CUBE.lemon);
    const need = 10 - item.a; const out = Array.from({ length: item.b }, (_, i) => ({ i, x: 300 - i * 36, y: OUT_Y, g: null, inF: false })); out.forEach(o => { o.g = counterAt(svg, o.x, o.y, F.c * .38, COUNTER2); });
    const move = o => { if (o.inF) return false; const j = F.firstEmpty(); if (j < 0) { SFX.soft(); return false; } o.inF = true; o.g.remove(); F.put(j, COUNTER2); SFX.pop(); return true; };
    if (item.story) await S(item.story);
    /* الحلّ المشترك: ننقل ما يكمل العشرة، ثم نعدّ ما خارجها بعد العشرة (كم صارت؟)، أو نعدّ ما نقلناه (كم أخذت؟)، ونقف قبل آخرها (الفحص المستقل A لبوابة S1-U4: في «كم أخذت؟» كان يعدّ ما بقي خارجها) */
    if (tries >= 3) { out.slice(0, need).forEach(move); const h = helpG(svg); label(h, 180, 156, labelText('tenWord'), 17, css('--compass'));
      if ((item.ask || 'total') === 'moved') for (let j = 0; j < need - 1; j++) { const p = F.pos(item.a + j); badge(h, p.x, p.y, j + 1); }
      else out.slice(need, -1).forEach((o, j) => badge(h, o.x, o.y + 32, 11 + j)); }   /* الشارات تحت القطع: فوقها كانت تغطّي كلمة «عشرة» (الفحص المستقل B لبوابة S1-U4) */
    else { say(...lineOf('gen.makeTen.fill'), { free: true });
      await gate(new Promise(res => { let moved = 0; out.forEach(o => { o.g.style.cursor = 'pointer'; o.g.setAttribute('role', 'button'); o.g.setAttribute('tabindex', 0); o.g.setAttribute('aria-label', plain(labelText('counterOne'))); hitPad(o.g, 56); o.g.dataset.move = 1; o.g.dataset.twin = 'out';   /* القطع خارج الإطار سواء: أيّها لُمس دخل */
          const act = () => { if (moved >= need) return; if (move(o)) { moved++; hush(); if (moved === need) { AUTO_CLEAR(); setTimeout(res, FAST ? 30 : 400); } } }; o.g.onclick = act; o.g.onkeydown = e => { if (actKey(e)) act(); }; });
        AUTO({ kind: 'frameMove', ok: () => { out.filter(o => !o.inF).slice(0, need - F.count() + item.a).forEach(o => o.g.dispatchEvent(new MouseEvent('click', { bubbles: true }))); } }); }));
      untarget(out.map(o => o.g)); logAttempt({ scene: 'explore', tag: 'makeTen-fill', ok: true }); await S('gen.makeTen.full'); }
    const q = (item.ask || 'total') === 'moved' ? (tries >= 3 ? 'gen.makeTen.togetherMoved' : item.q) : (tries >= 3 ? 'gen.makeTen.together' : 'gen.makeTen.ask'); await S(q);
    const np = numberPick((item.ask || 'total') === 'moved' ? optsWith(need, [item.b]) : optsWith(item.a + item.b, [10]), item.want, { intro: [...(item.story ? [lineOf(item.story)] : []), lineOf(q)] }); return { ans: await np.p, ctx: { svg, F, out, np } }; },
  judge(item, k) { if (k === item.want) return { ok: true }; if ((item.ask || 'total') === 'moved') return { ok: false, err: k === item.b ? 'movedAll' : 'movedWrong' }; return { ok: false, err: k === 10 ? 'tenOnly' : 'tenJoin' }; },
  /* حركة الأداة: «عشرة» على الإطار الممتلئ، ثم نعدّ ما بقي خارجه بعدها؛ وفي «كم أخذت؟» تومض القطع التي دخلت الإطار من الخارج، بلا عدّ */
  async hint2(item, r) { const m = el('g', { 'pointer-events': 'none' }, r.ctx.svg);
    if ((item.ask || 'total') === 'moved') { const F = r.ctx.F; for (let i = item.a; i < 10; i++) { const p = F.pos(i); el('circle', { cx: p.x, cy: p.y, r: F.c * .44, fill: 'none', stroke: css('--compass'), 'stroke-width': 4 }, m); }
      await S('gen.makeTen.hintMoved'); await anim(m, [{ opacity: .15 }, { opacity: 1 }], { duration: 450, iterations: 4, direction: 'alternate' }).done; await sleep(400); m.remove(); return; }
    label(m, 180, 156, labelText('tenWord'), 17, css('--compass')); await S(numw(10)); const rest = r.ctx.out.filter(o => !o.inF);
    for (const [j, o] of rest.entries()) { badge(m, o.x, o.y + 32, 11 + j, css('--square')); SFX.tick(); await S(numw(11 + j), { noGap: true, num: true }); } await sleep(500); m.remove(); },
  async together() {},
  async reveal(item, r) { markNum(r, item.want, 'ok'); if ((item.ask || 'total') === 'moved') await S(numw(item.want)); else { await readSentence(item.a, '+', item.b, item.a + item.b); } },
  praise: () => 'praiseTen', twin(item) { return item.twin || null; },
};
/* الطرح بالرجوع إلى العشرة: إطار ممتلئ وما بعده خارجه (a)، يُبعد الطفل b قطعة باللمس، ثم «كم بقي؟» */
ITEM.backTen = { ...numItem,
  make(spec) { return { ...spec, tag: 'backTen' + (spec.story ? '-story' : ''), want: spec.a - spec.b }; },
  async ask(item, mode, tries) { const svg = newStage(250, { oasis: false, ground: 0 }); const F = frameAt(svg, 180, 84); F.fill(10, CUBE.lemon); const r0 = item.a - 10;
    const out = Array.from({ length: r0 }, (_, i) => ({ x: 300 - i * 36, y: OUT_Y })); out.forEach(o => { o.g = counterAt(svg, o.x, o.y, F.c * .38, CUBE.lemon); });
    let taken = 0; const cross = g => { const p = g.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/); const c = el('g', { 'pointer-events': 'none', 'data-cross': 1 }, svg); el('path', { d: `M${+p[1] - 12} ${+p[2] - 12} l24 24 M${+p[1] + 12} ${+p[2] - 12} l-24 24`, stroke: css('--chaos'), 'stroke-width': 4, 'stroke-linecap': 'round' }, c); g.setAttribute('opacity', .35); return c; };
    if (item.story) await S(item.story);
    if (tries >= 3) { const h = helpG(svg); out.forEach(o => { o.done = true; h.appendChild(cross(o.g)); }); taken = r0; label(h, 180, 156, labelText('tenWord'), 17, css('--compass')); }
    const all = [...out.map(o => ({ g: o.g, o })), ...F.slots.map((g, i) => ({ g, i })).reverse()];
    /* وبعد الحلّ المشترك (ما خارج الإطار مشطوب) يُطلب الباقي من الإطار بعدده (الفحص المستقل D1 لبوابة S1-U4: كان «أبعد خمسة، ابدأ بالتي خارج الإطار» ولا شيء خارجه) */
    if (tries >= 3) await S('gen.backTen.together'); const left = item.b - (tries >= 3 ? r0 : 0);
    /* والواحدة والاثنتان بلفظهما: «أَبْعِدْ قِطْعَةً وَاحِدَةً» لا «قِطَعًا عَدَدُهَا وَاحِد» (الفحص المستقل E1 (7): الباقي واحد في توأمي 17−8 و13−4) */
    const takeN = n => n === 1 ? [lineOf('gen.backTen.takeOne')] : n === 2 ? [lineOf('gen.backTen.takeTwo')] : [lineOf('gen.backTen.take'), [...lineOf(numw(n)), { append: true }]];
    const intro = item.q ? [lineOf(item.q)] : tries >= 3 ? (left > 0 ? [...takeN(left), [...lineOf('gen.backTen.fromFrame'), { append: true }]] : [])
      : [...takeN(item.b), [...lineOf('gen.backTen.first'), { append: true }]];
    for (const l of intro) await say(l[0], l[1], l[2], l[3] || {});
    await gate(new Promise(res => { all.forEach(t => { if (t.o && t.o.done) return; t.g.style.cursor = 'pointer'; t.g.setAttribute('role', 'button'); t.g.setAttribute('tabindex', 0); t.g.setAttribute('aria-label', plain(labelText('counterOne'))); hitPad(t.g, 52); t.g.dataset.take = 1; t.g.dataset.twin = t.o ? 'out' : 'in';   /* ما خارج الإطار سواء، وما فيه سواء */
        const act = () => { if (t.done || taken >= item.b) return; t.done = true; cross(t.g); taken++; SFX.soft(); hush(); if (taken === item.b) { AUTO_CLEAR(); setTimeout(res, FAST ? 30 : 400); } }; t.g.onclick = act; t.g.onkeydown = e => { if (actKey(e)) act(); }; });
      if (taken >= item.b) res(); AUTO({ kind: 'frameTake', ok: () => { all.filter(t => !t.done && !(t.o && t.o.done)).slice(0, item.b - taken).forEach(t => t.g.dispatchEvent(new MouseEvent('click', { bubbles: true }))); } }); }));
    untarget(all.map(t => t.g)); await S('gen.backTen.ask'); const np = numberPick(nearNums(item.a - item.b, 10), item.a - item.b, { intro: [lineOf('gen.backTen.ask')] }); return { ans: await np.p, ctx: { svg, F, out, np } }; },
  judge(item, k) { return k === item.a - item.b ? { ok: true } : { ok: false, err: 'subTeen' }; },
  /* حركة الأداة: نُبعد ما خارج الإطار أولاً فنرجع إلى العشرة، ثم ما بقي من الإطار */
  async hint2(item, r) { const m = el('g', { 'pointer-events': 'none' }, r.ctx.svg); const r0 = item.a - 10; const F = r.ctx.F;
    for (const o of r.ctx.out) { el('circle', { cx: o.x, cy: o.y, r: 18, fill: 'none', stroke: css('--chaos'), 'stroke-width': 3.5 }, m); SFX.tick(); await sleep(FAST ? 20 : 350); }
    label(m, 180, 156, labelText('tenWord'), 17, css('--compass')); await S(numw(10)); for (let j = 0; j < item.b - r0; j++) { const p = F.pos(9 - j); el('circle', { cx: p.x, cy: p.y, r: 18, fill: 'none', stroke: css('--chaos'), 'stroke-width': 3.5 }, m); SFX.tick(); await sleep(FAST ? 20 : 350); } await sleep(700); m.remove(); },
  async together() {}, async reveal(item, r) { markNum(r, item.want, 'ok'); await readSentence(item.a, '-', item.b, item.want); },
  praise: () => 'praiseTen', twin(item) { return item.twin || null; },
};
