/* =====================================================================
   الورشة (D198-2) وألغاز الظلال (D197، D202، D245): محطة مكانية إلزامية في المسار قبل درس التحدّي،
   ولا تُحسب في الحمل. القطعة تُسحب أو تُلمس ثم يُلمس ظلّها (بديل النقر، D246). والبناء الحرّ بعد الشارة.
   ===================================================================== */
const ROTSYM = { circle: 1, square: 90, rect: 180, triangle: 360, sphere: 1, cube: 90, cylinder: 360, cone: 360, plank: 180 };
/* لوح خشبي طوله L (أفقيّاً، ومركزه عند 0): قطعة «ألغاز الألواح» */
function plankAt(parent, L) { el('rect', { x: -L / 2, y: -13, width: L, height: 26, rx: 5, fill: MAT.wood, stroke: '#fff', 'stroke-width': 2.5 }, parent);
  for (let x = -L / 2 + 14; x < L / 2 - 8; x += 26) el('path', { d: `M${x} -5 q6 5 12 0`, fill: 'none', stroke: MAT.woodDk, 'stroke-width': 1.5, opacity: .6 }, parent);
  el('circle', { cx: -L / 2 + 7, cy: 0, r: 2, fill: MAT.woodDk }, parent); el('circle', { cx: L / 2 - 7, cy: 0, r: 2, fill: MAT.woodDk }, parent); }   // الدوران بمضاعفات زاوية التماثل لا يغيّر الشكل
const rotOk = (k, a, b) => { const s = ROTSYM[k]; if (!s || s === 1) return true; return (((a - b) % s) + s) % s === 0; };
function wsDraw(parent, p, x, y, k) { const g = el('g', { transform: `translate(${x} ${y}) scale(${k})` }, parent); const inner = el('g', { transform: `rotate(${p.rot || 0})` }, g);
  if (SOLIDC[p.k]) solidAt(inner, { solid: p.k, size: p.size, pose: p.pose }, 0, 0);
  else if (p.k === 'plank') plankAt(inner, p.size);   /* ألغاز الألواح (S1-U4): اللوح بطوله، والظلّ يقبل اللوح بطوله نفسه */
  else shapeAt(inner, { type: p.k, size: p.size, w: p.w, h: p.h, color: css(IDC[p.k]) }, 0, 0);
  g.inner = inner; return g; }
const WS_ICON = { puzzle: '<svg viewBox="0 0 40 24" width="40" height="24"><polygon points="20,2 34,12 6,12" fill="currentColor" opacity=".35"/><rect x="9" y="12" width="22" height="11" fill="currentColor" opacity=".35"/><rect x="9" y="12" width="22" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 2"/></svg>',
  free: '<svg viewBox="0 0 40 24" width="40" height="24"><circle cx="11" cy="15" r="7" fill="currentColor"/><rect x="19" y="4" width="14" height="14" fill="currentColor" opacity=".6"/></svg>' };
function wsButtons(btns) { const bar = document.createElement('div'); bar.className = 'choices icons wsbar'; $('#stage').appendChild(bar);
  btns.forEach(([id, lbl, ic, fn]) => { const b = document.createElement('button'); b.className = 'pick'; b.id = id; b.innerHTML = ic.replace('<svg', '<svg width="30" height="30"') + `<span>${esc(G(labelText(lbl)))}</span>`; b.setAttribute('aria-label', plain(G(labelText(lbl)))); b.onclick = fn; bar.appendChild(b); }); return bar; }
/* موضع زرّ «دوّري»: وسط المسرح أعلاه، ثم أدنى فأدنى حتى لا يغطّي ظلاً ولا قطعة ولا علامتي الباب والنافذة (الفحص المستقل C2 لبوابة S1-U4: في «غرفة الأطفال»
   غطّى الزرّ أعلى ظلّ المربّع وأخذ لمسة حافّته؛ وB: غطّى النافذة). يُحسب بعد الرسم على الشاشة نفسها */
function wsBarFit(bar, svg, room) { const st = $('#stage').getBoundingClientRect(), av = [...svg.querySelectorAll('[data-shadow], [data-ws], [data-wsmark]')].map(g => g.getBoundingClientRect()).filter(r => r.width);
  const hit = () => { const b = bar.getBoundingClientRect(); return av.some(r => b.right > r.left && b.left < r.right && b.bottom > r.top && b.top < r.bottom); };
  const at = c => { bar.classList.remove('mid', 'end'); if (c) bar.classList.add(c); };   /* الغرفة: وسط الجدار أولاً (بين الباب والنافذة)؛ وغيرها: ركنه المعتاد أولاً */
  for (let t = 8; t + bar.offsetHeight < st.height; t += 6) { bar.style.top = t + 'px'; for (const c of room ? ['mid', '', 'end'] : ['', 'end', 'mid']) { at(c); if (!hit()) return [t, c]; } }
  bar.style.top = ''; at(room ? 'mid' : ''); return null; }
const wsSolved = uid => (PROG.ws || {})[uid] || 0;
/* ألغاز الغرفة من الأعلى (S1-U3) لها اسمها في القائمة والمحطة والكلام، لا «ألغاز الظلال» (الفحص المستقل B) */
const wsRoom = uid => !!(WS[uid] && WS[uid].puzzles.some(p => p.frame === 'room'));
/* وألغاز الألواح (S1-U4) كذلك باسمها */
const wsPlank = uid => !!(WS[uid] && WS[uid].puzzles.some(p => p.frame === 'plank'));
const wsWord = (uid, base) => base + (wsRoom(uid) ? 'Room' : wsPlank(uid) ? 'Plank' : '');
async function runWorkshop(U) {
  if (TAB_LOST) { showTabLost(); return; }
  CUR = null; FLOW++; reseed((KID || 'k0') + '|ws|' + U.id + '|' + Date.now()); show('lesson'); lockGo(); setSteps(0); SCENE_NOW = 'ws'; /*T*/window.__scene = 'ws:menu';/*/T*/ const W = WS[U.id];
  const freeOpen = !!PROG['badge:' + U.id] || !!PROG.unlockAll;
  const svg = newStage(250, { oasisOpacity: .3 }); (HOSTS[U.id] || []).forEach((k, i) => hostAt(svg, k, 290 - i * 72, 150, 62));
  let mode = 'puzzle';
  if (freeOpen) { say(...lineOf(wsWord(U.id, 'gen.ws.intro')), { free: true }); mode = await choosePick([['puzzle', labelText(wsWord(U.id, 'wsPuzzles')), WS_ICON.puzzle], ['free', labelText('wsFree'), WS_ICON.free]], null); hush(); }
  else await S(wsSolved(U.id) ? wsWord(U.id, 'gen.ws.again') : wsWord(U.id, 'gen.ws.first'));
  if (mode === 'free') return wsFree(U);
  PROG.ws = isObj(PROG.ws) ? PROG.ws : {}; let i = wsSolved(U.id) % W.puzzles.length;
  setSteps(W.puzzles.length);
  for (let n = 0; n < W.puzzles.length; n++, i = (i + 1) % W.puzzles.length) { setStep(i); await wsPuzzle(U, W.puzzles[i], i);
    PROG.ws[U.id] = Math.max(wsSolved(U.id), i + 1); saveProg();
    if (!freeOpen && n === 0) { await S('gen.ws.openNext'); break; }          // المحطة الإلزامية: لغز واحد يكفي لفتح الدرس التالي، والبقية متى شاء
    if (n + 1 < W.puzzles.length) { const more = await wsMore(); if (!more) break; } }
  await nextBtn(labelText('toMap')); showHome();
}
async function wsMore() { say(...lineOf('gen.ws.more'), { free: true }); const k = await choosePick([['more', labelText('wsNext'), WS_ICON.puzzle], ['map', labelText('toMap'), ICON.map.replace('<svg', '<svg width="40" height="28"')]], null); hush(); return k === 'more'; }
/* لغز ظلال: القطع على الرفّ مصغّرة وبزاوية 0؛ الظل يقبل القطعة إذا طابق نوعها وحجمها وزاويتها (حتى التماثل) */
function wsPuzzle(U, P, ix) {
  /*T*/window.__scene = 'ws:' + P.id;/*/T*/ SCENE_NOW = 'ws:' + P.id;
  const svg = newStage(330, { oasis: false, ground: 0 }); el('rect', { x: -360, y: 236, width: 1080, height: 94, fill: css('--paper'), opacity: .95 }, svg);
  if (P.frame === 'room') wsRoomFrame(svg, P);   /* ألغاز الغرفة من الأعلى (S1-U3): جدران الغرفة وعلامتا الباب والنافذة، والظلال قطع الخريطة */
  const shadows = el('g', {}, svg), layer = el('g', {}, svg);
  /* الظلّ أسود على ورق فاتح، وفاتح على ورق الوضع الداكن (الفحص المستقل B: الأسود على الداكن تباينه 1.1:1)؛ والشفافية تبلغ نحو 3:1 */
  const slots = P.slots.map(s => { const g = wsDraw(shadows, s, s.x, s.y, 1); const dk = wsDark(); g.style.filter = dk ? 'brightness(0) invert(1)' : 'brightness(0)'; g.style.opacity = g.dataset.op = dk ? '.36' : '.22'; g.setAttribute('role', 'button'); g.setAttribute('aria-label', labelText('shadow')); hitPad(g, 76); return { ...s, g, filled: false }; });
  const items = shuffle([...P.slots.map(s => ({ ...s, rot: 0, need: s.rot || 0 })), { ...P.extra, rot: 0, extra: true }]);
  const n = items.length, gap = 340 / n; const planks = items.every(p => p.k === 'plank');
  /* الألواح على الرفّ في صفّين من ثلاثة، بمقياس واحد يحفظ نسب أطوالها (المقارنة بالنظر ثم بالتجربة) */
  const TK = planks ? Math.min(.55, 100 / Math.max(...items.map(p => p.size))) : Math.min(.72, 64 / Math.max(...items.map(p => Math.max(p.w || p.size, p.size))));
  let sel = null, warnedTurn = false, done = 0;
  const pieces = items.map((p, i) => { const home = planks ? { x: 350 - (i % 3 + .5) * 113, y: 258 + Math.floor(i / 3) * 44 } : { x: 350 - gap * (i + .5), y: 284 };
    const g = wsDraw(layer, p, home.x, home.y, TK); const pc = { p, g, home, x: home.x, y: home.y, placed: false }; g.style.cursor = 'grab'; g.setAttribute('role', 'button'); g.setAttribute('tabindex', 0); g.setAttribute('aria-label', plain(BIN_NAMES[p.k] || (p.k === 'plank' ? labelText('plank') : ''))); hitPad(g, 76, 64); g.dataset.ws = p.k; g.dataset.size = p.size; if (p.extra) g.dataset.extra = 1; return pc; });
  const setPos = (pc, x, y, k) => { pc.x = x; pc.y = y; pc.g.setAttribute('transform', `translate(${x} ${y}) scale(${k})`); };
  /* والألواح على الرفّ أفقية دائماً بمقياس واحد يحفظ نسب أطوالها، وتُدار حين توضع في ظلّها القائم: لا زرّ تدوير للألواح (الفحص المستقل C1 لبوابة S1-U4:
     تدويرها على الرفّ كان يصغّرها إلى طول واحد فتُمحى المقارنة، وزرّ «دوّري» يغطّيها؛ وطولها لا يتغيّر حين تُدار، كحفظ الطول في الدرس 1) */
  const toShelf = pc => setPos(pc, pc.home.x, pc.home.y, TK);
  const select = pc => { pieces.forEach(q => q.g.classList.remove('wssel')); sel = pc; if (pc) pc.g.classList.add('wssel'); };
  const rotate = pc => { if (!pc || pc.placed) { if (!pc) S('gen.ws.pickFirst', { ifIdle: true, free: true }); return; } pc.p.rot = ((pc.p.rot || 0) + 90) % 360; pc.g.inner.setAttribute('transform', `rotate(${pc.p.rot})`); if (pc.x === pc.home.x && pc.y === pc.home.y) toShelf(pc); SFX.tick(); };
  let resolve; const doneP = gate(new Promise(r => resolve = r));
  const tryDrop = (pc, x, y, slot) => {
    const near = slot || slots.filter(s => !s.filled && Math.hypot(s.x - x, s.y - y) < 50).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
    if (near && !near.filled && near.k === pc.p.k && near.size === pc.p.size && planks && !rotOk(pc.p.k, pc.p.rot || 0, near.rot || 0)) { pc.p.rot = near.rot || 0; pc.g.inner.setAttribute('transform', `rotate(${pc.p.rot})`); }
    if (near && !near.filled && near.k === pc.p.k && near.size === pc.p.size && rotOk(pc.p.k, pc.p.rot || 0, near.rot || 0)) {
      near.filled = true; pc.placed = true; setPos(pc, near.x, near.y, 1); near.g.style.opacity = '0'; select(null); SFX.pop(); done++;
      /* الموضوع لم يعد هدفاً، ولا ظلّه: منطقة لمسه كبرت بمقياسه فغطّت الظلال الباقية، فذهبت لمستها إليه (الفحص المستقل B لبوابة S1-U4، حاجب: تعطّل بديل اللمس، D246) */
      untarget([pc.g, near.g]); pc.g.style.pointerEvents = 'none'; near.g.style.pointerEvents = 'none'; near.g.dataset.filled = 1; pc.g.dataset.placed = 1;
      logAttempt({ scene: 'ws', tag: P.id + ':' + pc.p.k, ok: true });
      if (done === slots.length) { disarmIdle(); hush(); if (rotBar) rotBar.remove(); SFX.win(); confetti(); S('gen.ws.solved').then(() => resolve()); }
      return true; }
    toShelf(pc);
    if (near && near.k === pc.p.k && near.size === pc.p.size) { logAttempt({ scene: 'ws', tag: P.id + ':turn', ok: false, err: 'wsTurn' }); select(pc); if (!warnedTurn) { warnedTurn = true; S('gen.ws.turn'); } else SFX.soft(); }
    else if (near) { logAttempt({ scene: 'ws', tag: P.id + ':kind', ok: false, err: 'wsKind' }); SFX.soft(); S('gen.ws.no', { ifIdle: true }); }
    return false; };
  /* واللمسة على الرفّ للقطعة المرسومة تحت الإصبع (tapRoute)، لا لمنطقة لمس جارتها فوقها (السائق بنقاط الحواف: حافة المستطيل في لغز القطار ذهبت إلى الدائرة) */
  const liveP = () => pieces.filter(q => !q.placed).map(q => ({ g: q.g, pc: q }));
  pieces.forEach(pc => { let drag = null; const me = { g: pc.g, pc };
    const down = e => { if (pc.placed) return; drag = { sx: e.clientX, sy: e.clientY, moved: false }; try { pc.g.setPointerCapture(e.pointerId); } catch (x) {} resetIdle(); };
    pc.g.__down = down; pc.g.__route = (x, y) => tapRoute(liveP(), x, y, me).g;
    pc.g.addEventListener('pointerdown', e => { if (!e.__routed && e.clientX != null) { const r = tapRoute(liveP(), e.clientX, e.clientY, me).pc; if (r !== pc && !r.placed) { e.__routed = true; return r.g.__down(e); } } down(e); });
    pc.g.addEventListener('pointermove', e => { if (!drag) return; const ctm = svg.getScreenCTM(); const dx = (e.clientX - drag.sx) / ctm.a, dy = (e.clientY - drag.sy) / ctm.d;
      if (Math.hypot(dx, dy) > 6) drag.moved = true; if (drag.moved) setPos(pc, pc.home.x + dx, pc.home.y + dy, 1); });
    const up = () => { if (!drag) return; const moved = drag.moved; drag = null; if (!moved) { toShelf(pc); select(pc); SFX.tick(); return; } tryDrop(pc, pc.x, pc.y); };
    pc.g.addEventListener('pointerup', up); pc.g.addEventListener('pointercancel', () => { drag = null; toShelf(pc); });
    pc.g.addEventListener('keydown', e => { if (actKey(e) && !pc.placed) { select(pc); SFX.tick(); } }); pc.g.dataset.keys = 1; });
  /* بديل النقر: المس القطعة ثم المس ظلّها؛ واللمسة للظلّ المرسوم تحت الإصبع بين الظلال الباقية (D255؛ الفحص المستقل B لبوابة S1-U4: لمسة الظلّ الأعلى في الطوف ملأت الأوسط) */
  const liveS = () => slots.filter(q => !q.filled).map(q => ({ g: q.g, s: q }));
  const onShadow = s => { if (s.filled) return; if (!sel) { S('gen.ws.pickFirst', { ifIdle: true, free: true }); return; } tryDrop(sel, s.x, s.y, s); };
  slots.forEach(s => { s.g.style.cursor = 'pointer'; s.g.dataset.shadow = s.k; s.g.dataset.size = s.size; s.g.dataset.rot = s.rot || 0; const me = { g: s.g, s };
    s.g.__route = (x, y) => tapRoute(liveS(), x, y, me).g; s.g.onclick = e => onShadow((e && e.clientX ? tapRoute(liveS(), e.clientX, e.clientY, me) : me).s); });
  /* زرّ التدوير حين يحتاجه اللغز فقط؛ وفي الغرفة وسط الجدار بين علامتي الباب والنافذة (الفحص المستقل B: غطّى النافذة)؛ وفي الألواح في الخانة الفارغة من الرفّ (الفحص المستقل B لبوابة S1-U4: غطّى الظلّ الأيمن) */
  let rotBar = null; if (!planks && P.slots.some(q => q.rot)) { rotBar = wsButtons([['wsRot', 'turnIt', ICON.rotate, () => rotate(sel)]]); wsBarFit(rotBar, svg, P.frame === 'room'); }   // زر التدوير حين يحتاجه اللغز فقط؛ وفي الغرفة وسط الجدار بين علامتي الباب والنافذة (الفحص المستقل B: غطّى النافذة)
  /* والتلميح من شفافية الظلّ نفسه إلى ضعفها تقريباً، ليلاً ونهاراً (الفحص المستقل E2: ليلاً كان من .36 إلى .45 فلا يُرى) */
  armIdle(async () => { const s = slots.find(q => !q.filled); if (!s) return; const b = +s.g.dataset.op || .22, t = Math.min(.85, b * 2 + .1);   /* الأساس من سمته لا من نمطه: الثبات مع تقليل الحركة يغيّر النمط مدّته (الفحص المستقل G2 (7)) */ anim(s.g, [{ opacity: b }, { opacity: t }, { opacity: b }], { duration: 900, iterations: 3 }); await S('gen.ws.hint'); });
  AUTO({ kind: 'ws', ok: async () => {           // للفحص: يحلّ اللغز بالمنطق نفسه (يجرّب أولاً القطعة الغريبة، ثم قطعة تحتاج دوراناً بلا دوران)
    const ex = pieces.find(q => q.p.extra), s0 = slots.find(s => !s.filled); if (ex && s0) tryDrop(ex, s0.x, s0.y);
    for (const s of slots) { const pc = pieces.find(q => !q.placed && !q.p.extra && q.p.k === s.k && q.p.size === s.size); if (!pc) continue;
      if ((s.rot || 0) && !rotOk(pc.p.k, pc.p.rot, s.rot)) { tryDrop(pc, s.x, s.y); while (!rotOk(pc.p.k, pc.p.rot, s.rot)) rotate(pc); }
      tryDrop(pc, s.x, s.y); await new Promise(r => setTimeout(r, 30)); } } });
  (async () => { await S('gen.ws.puzzle'); await S(P.name); })();
  return doneP.then(() => AUTO_CLEAR());
}
/* هل الورق داكن؟ (الوضع الداكن من النظام أو من الإعداد) */
function wsDark() { const h = css('--paper').replace('#', ''); if (!/^[0-9a-f]{6}$/i.test(h)) return false; const n = i => parseInt(h.slice(i, i + 2), 16); return n(0) * .3 + n(2) * .59 + n(4) * .11 < 110; }
function wsRoomFrame(svg, P) { const x0 = 24, y0 = 18, W = 312, H = 206;
  el('rect', { x: x0, y: y0, width: W, height: H, rx: 6, fill: css('--paper'), stroke: css('--ink'), 'stroke-width': 4 }, svg);
  const dx = P.door === 'L' ? x0 + 34 : x0 + W - 34, wx = P.door === 'L' ? x0 + W - 56 : x0 + 56;
  el('rect', { x: dx - 20, y: y0 - 4, width: 40, height: 8, fill: css('--paper') }, svg); el('path', { d: `M${dx - 20} ${y0} q20 26 40 0`, fill: 'none', stroke: MAT.wood, 'stroke-width': 3, 'data-wsmark': 'door' }, svg);
  el('rect', { x: wx - 26, y: y0 - 4, width: 52, height: 8, fill: '#d9f0f7', stroke: css('--ink'), 'stroke-width': 2, 'data-wsmark': 'window' }, svg); }
async function wsFree(U) {
  /*T*/window.__scene = 'ws:free';/*/T*/ SCENE_NOW = 'ws:free'; setSteps(0); const W = WS[U.id];
  const svg = newStage(330, { oasis: false, ground: 0 }); el('rect', { x: -360, y: 248, width: 1080, height: 82, fill: css('--paper'), opacity: .95 }, svg);
  const layer = el('g', {}, svg); const placed = []; let sel = null;
  const select = pc => { placed.forEach(q => q.g.classList.remove('wssel')); sel = pc; if (pc) pc.g.classList.add('wssel'); };
  const spawn = p => { const pc = { p: { ...p, rot: 0 }, x: 180 + R(-30, 30), y: 130 + R(-20, 20) }; pc.g = wsDraw(layer, pc.p, pc.x, pc.y, 1); pc.g.style.cursor = 'grab'; hitPad(pc.g, 64, 64); /* هدف السحب 64 (D246) */ placed.push(pc); select(pc); SFX.pop();
    let drag = null;
    pc.g.addEventListener('pointerdown', e => { drag = { sx: e.clientX, sy: e.clientY, x0: pc.x, y0: pc.y }; try { pc.g.setPointerCapture(e.pointerId); } catch (x) {} select(pc); });
    pc.g.addEventListener('pointermove', e => { if (!drag) return; const ctm = svg.getScreenCTM(); const dx = (e.clientX - drag.sx) / ctm.a, dy = (e.clientY - drag.sy) / ctm.d;
      pc.x = Math.max(20, Math.min(340, drag.x0 + dx)); pc.y = Math.max(20, Math.min(232, drag.y0 + dy)); pc.g.setAttribute('transform', `translate(${pc.x} ${pc.y}) scale(1)`); });
    const up = () => { drag = null; }; pc.g.addEventListener('pointerup', up); pc.g.addEventListener('pointercancel', up); return pc; };
  W.pieces.forEach((p, i) => { const x = 315 - i * 90; const g = wsDraw(svg, p, x, 289, .62); g.style.cursor = 'pointer'; g.setAttribute('role', 'button'); g.setAttribute('aria-label', plain(BIN_NAMES[p.k] || (p.k === 'plank' ? labelText('plank') : ''))); hitPad(g, 84); g.dataset.wsSpawn = p.k; g.onclick = () => spawn(p); });
  wsButtons([...(W.pieces.some(q => !SOLIDC[q.k]) ? [['wsRot', 'turnIt', ICON.rotate, () => { if (!sel || SOLIDC[sel.p.k]) return; sel.p.rot = (sel.p.rot + 45) % 360; sel.g.inner.setAttribute('transform', `rotate(${sel.p.rot})`); SFX.tick(); }]] : []),
    ['wsDel', 'remove', ICON.trash, () => { if (!sel) return; sel.g.remove(); placed.splice(placed.indexOf(sel), 1); select(null); SFX.soft(); }],
    ['wsSave', 'save', ICON.star, async () => { if (!placed.length) return; const list = store.get(designsKey(), []); list.unshift({ t: Date.now(), unit: U.id, pieces: placed.map(q => ({ ...q.p, x: Math.round(q.x), y: Math.round(q.y) })) });
      store.set(designsKey(), list.slice(0, 30)); logAttempt({ scene: 'ws', tag: 'save', ok: true }); SFX.win(); confetti(); await S('gen.ws.saved'); }]]);
  await S(U.id === 'm1.u2' ? 'gen.ws.freeOasis' : 'gen.ws.free');
  await nextBtn(labelText('toMap')); showHome();
}
