/* =====================================================================
   مهمة البيت بإدخال (D221، D244؛ S2-U0): يقدّر الطفل طول ثلاثة أشياء ثم يقيسها بالمسطرة، ويمدّ خيطاً حول كوب ويفرده.
   في الدرس التالي يسأل فرجار: «هل قستَ؟»، فيُدخل الطفل تقديره وقياسه (سم وملم) بزرّين، ويرى الشريطين متجاورين.
   لا صواب ولا خطأ: القياس تمّ خارج الشاشة. والمحفوظ في PROG.home[الوحدة] = { at، items: [{ est، cm، mm }]، cup، again: { cm، mm } }، ويُعرض في لوحة الكبار.
   ===================================================================== */
/* عدّاد بزرّين (− و+) تحت المسرح: spec = [{ key، min، max، val، unit: تسمية الوحدة }]. يعيد القيم عند «تمّ» */
function stepperAsk(spec, o = {}) { const box = document.createElement('div'); box.className = 'choices steppers' + (spec.length > 2 ? ' many' : ''); $('#stage').appendChild(box); const V = {}, shows = []; let touched = false;   /* o.auto: { ok، wrong } قيمٌ يضعها سائق الفحص قبل «تمّ»؛ وstep: مقدار الزيادة (1) */   /* الأعداد بأرقام المسطرة؛ وtouched: هل غيّر الطفل شيئاً قبل «تمّ» */
  for (const s of spec) { V[s.key] = s.val; const w = document.createElement('div'); w.className = 'stp'; const mk = (d, lab) => { const b = document.createElement('button'); b.className = 'pick stpb'; b.textContent = d < 0 ? '−' : '+'; b.setAttribute('aria-label', plain(labelText(lab)) + ' ' + plain(labelText(s.unit)));
      b.onclick = () => { touched = true; V[s.key] = Math.max(s.min, Math.min(s.max, V[s.key] + d * (s.step || 1))); show(); SFX.tick(); }; return b; };
    const out = document.createElement('span'); out.className = 'stpv'; out.setAttribute('aria-live', 'polite'); const show = () => { out.innerHTML = `<b dir="ltr">${V[s.key]}</b><small>${esc(G(labelText(s.unit)))}</small>`; out.dataset.v = V[s.key]; if (o.onChange) o.onChange(V); };
    w.appendChild(mk(-1, 'stepLess')); w.appendChild(out); w.appendChild(mk(1, 'stepMore')); shows.push([s.key, show]);   /* الأقلّ يساراً والأكثر يميناً، كاتجاه طريق الأعداد والمسطرة */ box.appendChild(w); show(); }
  const d = doneBtn(); let fin = false; const put = vals => { if (vals) { Object.assign(V, vals); touched = true; shows.forEach(([, f]) => f()); } }; AUTO({ kind: o.kind || 'homeNum', ok: () => { put(o.auto && o.auto.ok); d.b.click(); }, wrong: () => { put(o.auto && o.auto.wrong); d.b.click(); } });
  return gate(new Promise(res => d.b.onclick = () => { if (fin) return; fin = true; AUTO_CLEAR(); hush(); box.remove(); d.bar.remove(); res({ ...V, touched }); })); }
/* شريطا التقدير والقياس على مسطرة 0–30 */
function homeBars(svg, it) { const k = 10, x0 = 30, g = el('g', {}, svg), R = rulerAt(g, { x: x0, y: 150, pxcm: k, from: 0, to: 30, mm: false, lead: 6 });
  for (const v of Object.keys(R.labels)) if (v % 5) R.labels[v].setAttribute('opacity', 0);
  /* فوق كل شريط اسمه وعدده (بأرقام المسطرة)، فلا يُبحث عن التسمية بعيداً عنه */
  const bar = (y, len, col, key, txt) => { el('rect', { x: x0, y, width: Math.max(2, len * k), height: 16, rx: 4, fill: col, opacity: .9 }, g); const e = el('text', { x: x0, y: y - 6, 'text-anchor': 'end', 'font-size': 14, 'font-weight': 700, fill: css('--ink'), direction: 'rtl' }, g); e.textContent = labelText(key) + ': ' + txt; };
  bar(74, it.est, css('--think'), 'homeEst', it.est + ' ' + labelText('rulCm')); bar(120, it.cm + it.mm / 10, css('--compass'), 'homeMeas', it.cm + ' ' + labelText('rulCm') + (it.mm ? ' ' + labelText('homeAnd') + ' ' + it.mm + ' ' + labelText('rulMm') : '')); return g; }
/* c: unit (الوحدة صاحبة المهمة)، n (عدد الأشياء، 3)، cup (يُسأل عن خيط الكوب)، again (سؤال المراجعة: شيء واحد يُقاس من جديد)، lines: [خطّاف العودة] */
SCENES.homeMeasure = async c => { const unit = c.unit, n = c.n || 3, H = PROG.home = isObj(PROG.home) ? PROG.home : {}, [back] = c.lines; let rec = H[unit];
  /* again: سؤال «بعد أسبوع» (شيء واحد يُقاس من جديد، وأين وُضع الصفر). يُسأل متى مضت سبعة أيام على إدخال المهمة، في أول درس يحمله بعدها؛
     ومن لم يُدخل المهمة بعدُ («ليس بعد») يُسأل عنها هي من جديد في الموضع نفسه */
  const stage0 = () => { const v = newStage(230, { oasis: false, ground: 0 }); rulerAt(v, { x: 60, y: 96, pxcm: 30, from: 0, to: 8, mm: false }).g.setAttribute('transform', 'rotate(-6 180 110)'); return v; };
  let again = !!c.again && !!rec; if (again) { let due = !rec.again && Date.now() - rec.at >= 6.5 * 864e5; /*T*/if (TESTHOOK && window.__homeDue !== false && !rec.again) due = true;/*/T*/ if (!due) { if (back && !c.quiet) { stage0(); await S(back); } return; } }
  if (!again && rec) { if (back && !c.quiet) { stage0(); await S(back); } return; }   /* أُدخلت من قبل: خطّاف العودة وحده */
  stage0();
  await S(again ? 'gen.home.askAgain' : 'gen.home.ask'); const cp = cardPick([{ id: 'gen.home.yes', k: 'yes', ok: true }, { id: 'gen.home.no', k: 'no' }], { keepOrder: true, intro: again ? 'gen.home.askAgain' : 'gen.home.ask' }), pick = await cp.p; cp.done(); cp.box.remove();
  if (pick.k === 'no') { logAttempt({ scene: c.s || 'hook', tag: 'homeLater', ok: true }); await S('gen.home.later'); if (back && !c.quiet) await S(back); return; }
  if (again) { const svg = newStage(230, { oasis: false, ground: 0 }); rulerAt(svg, { x: 30, y: 96, pxcm: 30, from: 0, to: 10, mm: false }); S('gen.home.measQ', { free: true }); const v = await stepperAsk([{ key: 'cm', min: 0, max: 30, val: 10, unit: 'rulCm' }, { key: 'mm', min: 0, max: 9, val: 0, unit: 'rulMm' }]);
    if (v.cm || !v.mm) await sayLen(v.cm, 'cm', { append: false, ...(v.mm ? { noGap: true } : {}) }); if (v.mm) { if (v.cm) await S('gen.rul.and', { noGap: true, append: true }); await sayLen(v.mm, 'mm', v.cm ? {} : { append: false }); }   /* بلا «صفر سنتيمترات» */
    await S('gen.home.zeroQ'); const zp = cardPick([{ id: 'gen.home.zeroA', k: 'start', ok: true }, { id: 'gen.home.zeroB', k: 'edge' }], { intro: 'gen.home.zeroQ' }), z = await zp.p; zp.done(); zp.box.remove();
    rec.again = { cm: v.cm, mm: v.mm, zero: z.k }; saveProg(); logAttempt({ scene: c.s || 'hook', tag: 'homeAgain', ok: z.k === 'start' }); await S('gen.home.zeroSay'); if (back && !c.quiet) await S(back); return; }
  const items = [];
  for (let i = 0; i < n; i++) { let svg = newStage(230, { oasis: false, ground: 0 }); badge(el('g', {}, svg), 180, 60, String(i + 1)); rulerAt(svg, { x: 30, y: 110, pxcm: 30, from: 0, to: 10, mm: false });
    S(i ? 'gen.home.estQ2' : 'gen.home.estQ', { free: true }); const e = await stepperAsk([{ key: 'est', min: 1, max: 30, val: 10, unit: 'rulCm' }]);
    S(i ? 'gen.home.measQ2' : 'gen.home.measQ', { free: true }); const m = await stepperAsk([{ key: 'cm', min: 0, max: 30, val: e.est, unit: 'rulCm' }, { key: 'mm', min: 0, max: 9, val: 0, unit: 'rulMm' }]);
    const it = { est: e.est, cm: m.cm, mm: m.mm }; items.push(it); svg = newStage(230, { oasis: false, ground: 0 }); homeBars(svg, it); SFX.pop();
    await S('gen.home.cmp'); if (m.touched) await S(Math.abs(it.est * 10 - (it.cm * 10 + it.mm)) <= 10 ? 'gen.home.close' : 'gen.home.far'); }   /* من لم يغيّر عدد القياس لا يُقال له «التقدير قريب»: العددان متطابقان لأنه لم يُدخل قياساً */
  rec = H[unit] = { at: Date.now(), items };
  if (c.cup) { const svg = newStage(230, { oasis: false, ground: 0 }), R = rulerAt(svg, { x: 30, y: 176, pxcm: 10, from: 0, to: 30, mm: false, lead: 6 }); for (const v of Object.keys(R.labels)) if (v % 5) R.labels[v].setAttribute('opacity', 0); el('ellipse', { cx: 180, cy: 84, rx: 46, ry: 16, fill: 'none', stroke: '#8a6a4a', 'stroke-width': 4.5 }, svg); el('path', { d: 'M134 84 L142 150 H218 L226 84', fill: '#dfeef4', stroke: '#9fb9c4', 'stroke-width': 2.5 }, svg);
    S('gen.home.cupQ', { free: true }); const v = await stepperAsk([{ key: 'cup', min: 1, max: 40, val: 20, unit: 'rulCm' }]); rec.cup = v.cup; }
  saveProg(); logAttempt({ scene: c.s || 'hook', tag: 'homeMeasure', ok: true }); SFX.good(); await S('gen.home.thanks'); if (back && !c.quiet) await S(back); };
/* مهمة بيت S2-U1: خيط مشدود بين نقطتين: طول القطعة، ثم طولا الجزأين بعد طيّه نصفين. c: unit، lines: [خطّاف العودة].
   المحفوظ بالبنية نفسها: items = [القطعة، الجزء الأول، الجزء الثاني] (وest = 0) */
SCENES.homeSeg = async c => { const unit = c.unit, H = PROG.home = isObj(PROG.home) ? PROG.home : {}, [back] = c.lines; const svg0 = newStage(230, { oasis: false, ground: 0 }); geoObj(svg0, 'seg', [70, 120], [290, 120], { names: ['a', 'b'], labP: [0, -14], labQ: [0, -14] }); ptAt(svg0, 180, 120, 'm', { r: 6, color: css('--chaos'), lab: [0, -14] });
  if (H[unit]) { if (back) await S(back); return; }
  await S('gen.home.askSeg'); const cp = cardPick([{ id: 'gen.home.yes', k: 'yes', ok: true }, { id: 'gen.home.no', k: 'no' }], { keepOrder: true, intro: 'gen.home.askSeg' }), pick = await cp.p; cp.done(); cp.box.remove();
  if (pick.k === 'no') { logAttempt({ scene: c.s || 'hook', tag: 'homeLater', ok: true }); await S('gen.home.later'); if (back) await S(back); return; }
  const ask = async (q, val) => { S(q, { free: true }); const v = await stepperAsk([{ key: 'cm', min: 0, max: 99, val, unit: 'rulCm' }, { key: 'mm', min: 0, max: 9, val: 0, unit: 'rulMm' }]); return { est: 0, cm: v.cm, mm: v.mm }; };
  const whole = await ask('gen.home.segQ', 20), p1 = await ask('gen.home.part1Q', Math.round(whole.cm / 2)), p2 = await ask('gen.home.part2Q', p1.cm); H[unit] = { at: Date.now(), items: [whole, p1, p2].map(({ est, cm, mm }) => ({ est, cm, mm })) }; saveProg();
  const mm = x => x.cm * 10 + x.mm; logAttempt({ scene: c.s || 'hook', tag: 'homeSeg', ok: true }); SFX.good(); await S(Math.abs(mm(p1) - mm(p2)) <= 2 ? 'gen.home.segEq' : 'gen.home.segNe'); await S('gen.home.thanks'); if (back) await S(back); };
/* =====================================================================
   مهمة البيت بأعداد (S2-U2 فما بعدها، D221، D244): يُدخل الطفل أعداد مهمته (عدد، أو قياس بالسنتيمتر، أو اختيار)، ويُقال له ما تعنيه بلا حكم على البيت.
   c: unit، art (رسم المسرح: corner | clock | shapes)، fields: [{ key، q، min، max، val، unit } أو { key، q، pick: [[k، تسمية، جملة]…] }]، say (تعليق بعد الإدخال)،
   again: الحقول نفسها لسؤال «بعد سبعة أيام» (يُسأل في أول درس يحمله بعد مرورها، وquiet بلا خطّاف)، lines: [خطّاف العودة].
   المحفوظ: PROG.home[الوحدة] = { at، items: []، n: { مفتاح: عدد }، an: { مفتاح: عدد } } (الاختيار برقم موضعه)
   ===================================================================== */
function homeArt(svg, art) { const g = el('g', { 'pointer-events': 'none' }, svg);
  if (art === 'clock') { el('circle', { cx: 180, cy: 112, r: 80, fill: '#fffdf6', stroke: GEO.ink, 'stroke-width': 4 }, g); for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; geoLine(g, 180 + Math.cos(a) * 68, 112 + Math.sin(a) * 68, 180 + Math.cos(a) * (k % 3 ? 62 : 56), 112 + Math.sin(a) * (k % 3 ? 62 : 56), { color: GEO.ink, w: k % 3 ? 2 : 3.5 }); } }
  else if (art === 'corner') { el('rect', { x: 70, y: 40, width: 220, height: 150, rx: 6, fill: '#efe6d6', stroke: css('--line'), 'stroke-width': 2 }, g); for (let x = 70; x <= 290; x += 44) geoLine(g, x, 40, x, 190, { color: '#c9b79c', w: 2 }); paperCornerAt(g, [70, 190], 0, 60); }
  else if (art === 'fold') { el('rect', { x: 110, y: 46, width: 140, height: 140, fill: '#fffdf6', stroke: css('--line'), 'stroke-width': 2.5 }, g); geoLine(g, 180, 40, 180, 192, { color: '#c8392d', w: 3, dash: '8 6' }); geoLine(g, 104, 116, 256, 116, { color: '#c8392d', w: 3, dash: '8 6' }); }   /* S2-U6: مهمة المحاور */
  else if (art === 'tile') { el('rect', { x: 120, y: 56, width: 120, height: 120, fill: '#e6d3b3', stroke: '#b9794e', 'stroke-width': 3 }, g); el('rect', { x: 150, y: 86, width: 60, height: 60, transform: 'rotate(45 180 116)', fill: '#3d7cc0', opacity: .7 }, g); }
  else if (art === 'tape') { tapeAt(g, { x: 50, y: 92, to: 100, pxcm: 2.6, label: 10 }); }   /* S2-U6: شريط القياس */
  else if (art === 'window') { el('rect', { x: 110, y: 36, width: 140, height: 152, rx: 4, fill: '#dff0fb', stroke: '#8a6a4a', 'stroke-width': 6 }, g); geoLine(g, 180, 36, 180, 188, { color: '#8a6a4a', w: 5 }); geoLine(g, 110, 112, 250, 112, { color: '#8a6a4a', w: 5 }); }   /* S2-U5: نافذة الغرفة */
  else if (art === 'shapes') { [['tScaR', 100, 110, .6], ['cRect', 250, 110, .7]].forEach(([k, x, y, s]) => polyAt(g, k, [x, y], { s, dots: false, fill: '#f2d38a' })); }
  return g; }
/* ساعة بعقربين: الصغير عند h والكبير عند الثانية عشرة، وقوس الزاوية الصغرى بينهما */
function homeClock(svg, h) { const g = el('g', { 'pointer-events': 'none' }, svg), C = [180, 112], a = 90 - h * 30, P = angP(C, a, 46), Q = angP(C, 90, 66); geoLine(g, C[0], C[1], Q[0], Q[1], { color: GEO.ink, w: 4 }); geoLine(g, C[0], C[1], P[0], P[1], { color: '#b0552f', w: 6 });
  const d = ((h % 12) * 30), sm = d > 180 ? 360 - d : d; if (sm) el('path', { d: d > 180 ? angArc(C, 24, 90, 90 + sm) : angArc(C, 24, 90 - sm, 90), fill: 'none', stroke: ANG.arc, 'stroke-width': 3.2 }, g); return sm; }
const HOME_SAY = {
  par: async (r, v) => S(Math.abs(v.d1 - v.d2) <= 1 ? 'gen.home.parEq' : 'gen.home.parNe'),
  parAgain: async (r, v) => S(r.n && Math.abs(v.d3 - r.n.d1) <= 1 ? 'gen.home.par3Eq' : 'gen.home.par3Ne'),
  clock: async (r, v) => { const svg = newStage(230, { oasis: false, ground: 0 }); homeArt(svg, 'clock'); const sm = homeClock(svg, v.hour); await S(sm === 90 ? 'gen.home.clockRight' : 'gen.home.clockNot'); if (sm !== 90) { const s2 = newStage(230, { oasis: false, ground: 0 }); homeArt(s2, 'clock'); homeClock(s2, 3); await S('gen.home.clockThree'); } },
  cut: async (r, v) => S(v.shapes >= 3 ? 'gen.home.cutMany' : 'gen.home.cutFew'),   /* S2-U4: أشكال من مثلثين */
  axes: async () => S('gen.home.axesSay'),   /* S2-U5 */
  tape: async (r, v) => S([1, 2, 3].every(i => Math.abs(v['e' + i] - v['m' + i]) <= 20) ? 'gen.home.tapeClose' : 'gen.home.tapeFar'),   /* S2-U6: التقدير قريب حتى عشرين سنتيمتراً */
  roomAgain: async (r, v) => S(v.rt === v.rm * 100 + v.rc ? 'gen.home.roomOk' : 'gen.home.roomNo'),
  tileAgain: async (r, v) => S(v.tile === 4 ? 'gen.home.tileOk' : 'gen.home.tileNo'),
  winAgain: async (r, v) => S(v.sides === v.verts ? 'gen.home.winEq' : 'gen.home.winNe'),
  clockAgain: async (r, v) => { const svg = newStage(230, { oasis: false, ground: 0 }); homeArt(svg, 'clock'); homeClock(svg, 6); await S(v.kind === 2 ? 'gen.home.sixOk' : 'gen.home.sixNo'); await S(v.q === 1 ? 'gen.home.quarterOk' : 'gen.home.quarterNo'); },
};
SCENES.homeNums = async c => { const unit = c.unit, H = PROG.home = isObj(PROG.home) ? PROG.home : {}, [back] = c.lines || []; let rec = H[unit];
  const stage0 = () => { const v = newStage(230, { oasis: false, ground: 0 }); homeArt(v, c.art); return v; };
  const again = !!c.again && !!rec; if (again) { let due = !rec.an && Date.now() - rec.at >= 6.5 * 864e5; /*T*/if (TESTHOOK && window.__homeDue !== false && !rec.an) due = true;/*/T*/ if (!due) { if (back && !c.quiet) { stage0(); await S(back); } return; } }
  else if (c.again) return;   /* سؤال المراجعة لمهمة لم تُدخل بعد: لا شيء هنا (تُسأل في درسها) */
  if (!again && rec) { if (back && !c.quiet) { stage0(); await S(back); } return; }
  stage0(); const askId = again ? c.askAgain || 'gen.home.askAgain' : c.ask || 'gen.home.ask'; await S(askId); const cp = cardPick([{ id: 'gen.home.did', k: 'yes', ok: true }, { id: 'gen.home.no', k: 'no' }], { keepOrder: true, intro: askId }), pick = await cp.p; cp.done(); cp.box.remove();
  if (pick.k === 'no') { logAttempt({ scene: c.s || 'hook', tag: 'homeLater', ok: true }); await S('gen.home.later'); if (back && !c.quiet) await S(back); return; }
  const vals = {}; for (const f of again ? c.again : c.fields) { stage0(); if (f.pick) { await S(f.q); const k = await choosePick(f.pick.map(([k2, line]) => [k2, T(line), '<i></i>', line]), null); vals[f.key] = f.pick.findIndex(x => x[0] === k); }
    else { S(f.q, { free: true }); const v = await stepperAsk([{ key: f.key, min: f.min ?? 0, max: f.max ?? 99, val: f.val ?? 1, unit: f.unit || 'rulCm', step: f.step || 1 }]); vals[f.key] = v[f.key]; } }
  if (again) rec.an = vals; else rec = H[unit] = { at: Date.now(), items: [], n: vals }; saveProg();
  logAttempt({ scene: c.s || 'hook', tag: again ? 'homeAgain' : 'homeNums', ok: true }); SFX.good(); const say = again ? c.sayAgain : c.say; if (say && HOME_SAY[say]) await HOME_SAY[say](rec, vals);
  await S('gen.home.saved'); if (back && !c.quiet) await S(back); };
