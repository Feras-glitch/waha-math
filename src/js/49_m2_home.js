/* =====================================================================
   مهمة البيت بإدخال (D221، D244؛ S2-U0): يقدّر الطفل طول ثلاثة أشياء ثم يقيسها بالمسطرة، ويمدّ خيطاً حول كوب ويفرده.
   في الدرس التالي يسأل فرجار: «هل قستَ؟»، فيُدخل الطفل تقديره وقياسه (سم وملم) بزرّين، ويرى الشريطين متجاورين.
   لا صواب ولا خطأ: القياس تمّ خارج الشاشة. والمحفوظ في PROG.home[الوحدة] = { at، items: [{ est، cm، mm }]، cup، again: { cm، mm } }، ويُعرض في لوحة الكبار.
   ===================================================================== */
/* عدّاد بزرّين (− و+) تحت المسرح: spec = [{ key، min، max، val، unit: تسمية الوحدة }]. يعيد القيم عند «تمّ» */
function stepperAsk(spec) { const box = document.createElement('div'); box.className = 'choices steppers'; $('#stage').appendChild(box); const V = {};
  for (const s of spec) { V[s.key] = s.val; const w = document.createElement('div'); w.className = 'stp'; const mk = (d, lab) => { const b = document.createElement('button'); b.className = 'pick stpb'; b.textContent = d < 0 ? '−' : '+'; b.setAttribute('aria-label', plain(labelText(lab)) + ' ' + plain(labelText(s.unit)));
      b.onclick = () => { V[s.key] = Math.max(s.min, Math.min(s.max, V[s.key] + d)); show(); SFX.tick(); }; return b; };
    const out = document.createElement('span'); out.className = 'stpv'; out.setAttribute('aria-live', 'polite'); const show = () => { out.innerHTML = `<b>${DG(V[s.key])}</b><small>${esc(G(labelText(s.unit)))}</small>`; out.dataset.v = V[s.key]; };
    w.appendChild(mk(1, 'stepMore')); w.appendChild(out); w.appendChild(mk(-1, 'stepLess')); box.appendChild(w); show(); }
  const d = doneBtn(); let fin = false; AUTO({ kind: 'homeNum', ok: () => d.b.click(), wrong: () => d.b.click() });
  return gate(new Promise(res => d.b.onclick = () => { if (fin) return; fin = true; AUTO_CLEAR(); hush(); box.remove(); d.bar.remove(); res(V); })); }
/* شريطا التقدير والقياس على مسطرة 0–30 */
function homeBars(svg, it, i) { const k = 10, x0 = 30, y = 60 + i * 0, g = el('g', {}, svg), R = rulerAt(g, { x: x0, y: 150, pxcm: k, from: 0, to: 30, mm: false, lead: 6 });
  for (const v of Object.keys(R.labels)) if (v % 5) R.labels[v].setAttribute('opacity', 0);
  el('rect', { x: x0, y: 86, width: Math.max(2, it.est * k), height: 18, rx: 4, fill: css('--think'), opacity: .85 }, g); el('rect', { x: x0, y: 118, width: Math.max(2, (it.cm + it.mm / 10) * k), height: 18, rx: 4, fill: css('--compass') }, g);
  const t = (y1, key) => { const e = el('text', { x: 352, y: y1, 'text-anchor': 'start', 'font-size': 14, fill: css('--ink'), direction: 'rtl' }, g); e.textContent = labelText(key); }; t(78, 'homeEst'); t(214, 'homeMeas'); return g; }
/* c: unit (الوحدة صاحبة المهمة)، n (عدد الأشياء، 3)، cup (يُسأل عن خيط الكوب)، again (سؤال المراجعة: شيء واحد يُقاس من جديد)، lines: [خطّاف العودة] */
SCENES.homeMeasure = async c => { const unit = c.unit, n = c.n || 3, H = PROG.home = isObj(PROG.home) ? PROG.home : {}, [back] = c.lines; let rec = H[unit];
  const svg0 = newStage(230, { oasis: false, ground: 0 }); rulerAt(svg0, { x: 60, y: 96, pxcm: 30, from: 0, to: 8, mm: false }).g.setAttribute('transform', 'rotate(-6 180 110)');
  if (c.again ? (rec && rec.again) : rec) { if (back) await S(back); return; }   /* أُدخلت من قبل: خطّاف العودة وحده */
  if (c.again && !rec) { if (back) await S(back); return; }   /* سؤال المراجعة لمن أدخل المهمة أولاً */
  await S(c.again ? 'gen.home.askAgain' : 'gen.home.ask'); const cp = cardPick([{ id: 'gen.home.yes', k: 'yes', ok: true }, { id: 'gen.home.no', k: 'no' }], { keepOrder: true, intro: c.again ? 'gen.home.askAgain' : 'gen.home.ask' }), pick = await cp.p; cp.done(); cp.box.remove();
  if (pick.k === 'no') { logAttempt({ scene: c.s || 'hook', tag: 'homeLater', ok: true }); await S('gen.home.later'); if (back) await S(back); return; }
  if (c.again) { const svg = newStage(230, { oasis: false, ground: 0 }); rulerAt(svg, { x: 30, y: 96, pxcm: 30, from: 0, to: 10, mm: false }); S('gen.home.measQ', { free: true }); const v = await stepperAsk([{ key: 'cm', min: 0, max: 30, val: 10, unit: 'rulCm' }, { key: 'mm', min: 0, max: 9, val: 0, unit: 'rulMm' }]);
    rec.again = { cm: v.cm, mm: v.mm }; saveProg(); logAttempt({ scene: c.s || 'hook', tag: 'homeAgain', ok: true }); await sayLen(v.cm, 'cm', v.mm ? { noGap: true } : {}); if (v.mm) { await S('gen.rul.and', { noGap: true }); await sayLen(v.mm, 'mm'); } if (back) await S(back); return; }
  const items = [];
  for (let i = 0; i < n; i++) { let svg = newStage(230, { oasis: false, ground: 0 }); badge(el('g', {}, svg), 180, 60, i + 1); rulerAt(svg, { x: 30, y: 110, pxcm: 30, from: 0, to: 10, mm: false });
    S(i ? 'gen.home.estQ2' : 'gen.home.estQ', { free: true }); const e = await stepperAsk([{ key: 'est', min: 1, max: 30, val: 10, unit: 'rulCm' }]);
    S(i ? 'gen.home.measQ2' : 'gen.home.measQ', { free: true }); const m = await stepperAsk([{ key: 'cm', min: 0, max: 30, val: e.est, unit: 'rulCm' }, { key: 'mm', min: 0, max: 9, val: 0, unit: 'rulMm' }]);
    const it = { est: e.est, cm: m.cm, mm: m.mm }; items.push(it); svg = newStage(230, { oasis: false, ground: 0 }); homeBars(svg, it, i); SFX.pop();
    await S('gen.home.cmp'); await S(Math.abs(it.est * 10 - (it.cm * 10 + it.mm)) <= 10 ? 'gen.home.close' : 'gen.home.far'); }
  rec = H[unit] = { at: Date.now(), items };
  if (c.cup) { const svg = newStage(230, { oasis: false, ground: 0 }), R = rulerAt(svg, { x: 30, y: 176, pxcm: 10, from: 0, to: 30, mm: false, lead: 6 }); for (const v of Object.keys(R.labels)) if (v % 5) R.labels[v].setAttribute('opacity', 0); el('ellipse', { cx: 180, cy: 84, rx: 46, ry: 16, fill: 'none', stroke: '#8a6a4a', 'stroke-width': 4.5 }, svg); el('path', { d: 'M134 84 L142 150 H218 L226 84', fill: '#dfeef4', stroke: '#9fb9c4', 'stroke-width': 2.5 }, svg);
    S('gen.home.cupQ', { free: true }); const v = await stepperAsk([{ key: 'cup', min: 1, max: 40, val: 20, unit: 'rulCm' }]); rec.cup = v.cup; }
  saveProg(); logAttempt({ scene: c.s || 'hook', tag: 'homeMeasure', ok: true }); SFX.good(); await S('gen.home.thanks'); if (back) await S(back); };
/* مهمة بيت S2-U1: خيط مشدود بين نقطتين: طول القطعة، ثم طولا الجزأين بعد طيّه نصفين. c: unit، lines: [خطّاف العودة].
   المحفوظ بالبنية نفسها: items = [القطعة، الجزء الأول، الجزء الثاني] (وest = 0) */
SCENES.homeSeg = async c => { const unit = c.unit, H = PROG.home = isObj(PROG.home) ? PROG.home : {}, [back] = c.lines; const svg0 = newStage(230, { oasis: false, ground: 0 }); geoObj(svg0, 'seg', [70, 120], [290, 120], { names: ['a', 'b'], labP: [0, -14], labQ: [0, -14] }); ptAt(svg0, 180, 120, 'm', { r: 6, color: css('--chaos'), lab: [0, -14] });
  if (H[unit]) { if (back) await S(back); return; }
  await S('gen.home.askSeg'); const cp = cardPick([{ id: 'gen.home.yes', k: 'yes', ok: true }, { id: 'gen.home.no', k: 'no' }], { keepOrder: true, intro: 'gen.home.askSeg' }), pick = await cp.p; cp.done(); cp.box.remove();
  if (pick.k === 'no') { logAttempt({ scene: c.s || 'hook', tag: 'homeLater', ok: true }); await S('gen.home.later'); if (back) await S(back); return; }
  const ask = async (q, val) => { S(q, { free: true }); const v = await stepperAsk([{ key: 'cm', min: 0, max: 99, val, unit: 'rulCm' }, { key: 'mm', min: 0, max: 9, val: 0, unit: 'rulMm' }]); return { est: 0, cm: v.cm, mm: v.mm }; };
  const whole = await ask('gen.home.segQ', 20), p1 = await ask('gen.home.part1Q', Math.round(whole.cm / 2)), p2 = await ask('gen.home.part2Q', p1.cm); H[unit] = { at: Date.now(), items: [whole, p1, p2] }; saveProg();
  const mm = x => x.cm * 10 + x.mm; logAttempt({ scene: c.s || 'hook', tag: 'homeSeg', ok: true }); SFX.good(); await S(Math.abs(mm(p1) - mm(p2)) <= 2 ? 'gen.home.segEq' : 'gen.home.segNe'); await S('gen.home.thanks'); if (back) await S(back); };
