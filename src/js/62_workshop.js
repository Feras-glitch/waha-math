/* ---------- الورشة بعد كل وحدة (D198-2) وألغاز الظلال (D197، D202) ---------- */
const ROTSYM = { circle: 1, square: 90, rect: 180, triangle: 360 };       // الدوران بمضاعفات زاوية التماثل لا يغيّر الشكل
const rotOk = (k, a, b) => { const s = ROTSYM[k]; if (!s || s === 1) return true; return (((a - b) % s) + s) % s === 0; };
function wsDraw(parent, p, x, y, k) { const g = el('g', { transform: `translate(${x} ${y}) scale(${k})` }, parent); const inner = el('g', { transform: `rotate(${p.rot || 0})` }, g);
  if (SOLIDC[p.k]) solidAt(inner, { solid: p.k, size: p.size, pose: p.pose }, 0, 0);
  else shapeAt(inner, { type: p.k, size: p.size, w: p.w, h: p.h, color: css(IDC[p.k]) }, 0, 0);
  g.inner = inner; return g; }
const WS = {
  'm1.u1': { pieces: [{ k: 'circle', size: 70 }, { k: 'square', size: 70 }, { k: 'triangle', size: 76, w: 76, h: 66 }, { k: 'rect', size: 70, w: 96, h: 50 }],
    puzzles: [
      { id: 'house', name: ['gen.ws.p.house', 'لُغْزُ البَيْتِ'], slots: [{ k: 'square', x: 180, y: 160, size: 92 }, { k: 'triangle', x: 180, y: 82, size: 112, w: 112, h: 64 }], extra: { k: 'circle', size: 60 } },
      { id: 'tree', name: ['gen.ws.p.tree', 'لُغْزُ الشَّجَرَةِ'], slots: [{ k: 'rect', x: 180, y: 190, size: 64, w: 64, h: 28, rot: 90 }, { k: 'circle', x: 180, y: 108, size: 100 }], extra: { k: 'triangle', size: 60, w: 60, h: 52 } },
      { id: 'fish', name: ['gen.ws.p.fish', 'لُغْزُ السَّمَكَةِ'], slots: [{ k: 'circle', x: 205, y: 140, size: 92 }, { k: 'triangle', x: 132, y: 140, size: 60, w: 60, h: 52, rot: 90 }], extra: { k: 'square', size: 56 } },
      { id: 'rocket', name: ['gen.ws.p.rocket', 'لُغْزُ الصَّارُوخِ'], slots: [{ k: 'rect', x: 180, y: 152, size: 120, w: 120, h: 50, rot: 90 }, { k: 'triangle', x: 180, y: 70, size: 50, w: 50, h: 44 },
        { k: 'triangle', x: 136, y: 194, size: 38, w: 38, h: 40 }, { k: 'triangle', x: 224, y: 194, size: 38, w: 38, h: 40 }], extra: { k: 'circle', size: 50 } },
      { id: 'train', name: ['gen.ws.p.train', 'لُغْزُ القِطَارِ'], slots: [{ k: 'rect', x: 128, y: 140, size: 92, w: 92, h: 52 }, { k: 'rect', x: 232, y: 140, size: 92, w: 92, h: 52 },
        { k: 'circle', x: 104, y: 182, size: 32 }, { k: 'circle', x: 152, y: 182, size: 32 }, { k: 'circle', x: 208, y: 182, size: 32 }, { k: 'circle', x: 256, y: 182, size: 32 }], extra: { k: 'triangle', size: 50, w: 50, h: 44 } },
    ] },
  'm1.u2': { pieces: [{ k: 'cube', size: 70 }, { k: 'sphere', size: 70 }, { k: 'cylinder', size: 70 }, { k: 'cone', size: 70 }],
    puzzles: [
      { id: 'ice', name: ['gen.ws.p.ice', 'لُغْزُ البُوظَةِ'], slots: [{ k: 'cone', x: 180, y: 178, size: 104, pose: 'tipdown' }, { k: 'sphere', x: 180, y: 112, size: 84 }], extra: { k: 'cube', size: 60 } },
      { id: 'rocket2', name: ['gen.ws.p.rocket', 'لُغْزُ الصَّارُوخِ'], slots: [{ k: 'cylinder', x: 180, y: 168, size: 104 }, { k: 'cone', x: 180, y: 86, size: 84 }], extra: { k: 'sphere', size: 60 } },
      { id: 'snow', name: ['gen.ws.p.snow', 'لُغْزُ رَجُلِ الثَّلْجِ'], slots: [{ k: 'sphere', x: 180, y: 178, size: 112 }, { k: 'sphere', x: 180, y: 104, size: 76 }, { k: 'cone', x: 180, y: 58, size: 52 }], extra: { k: 'cube', size: 56 } },
      { id: 'castle', name: ['gen.ws.p.castle', 'لُغْزُ القَلْعَةِ'], slots: [{ k: 'cube', x: 120, y: 186, size: 84 }, { k: 'cube', x: 240, y: 186, size: 84 }, { k: 'cylinder', x: 180, y: 176, size: 96 },
        { k: 'cone', x: 180, y: 108, size: 70 }], extra: { k: 'sphere', size: 56 } },
    ] },
};
const WS_INTRO = ['compass', 'gen.ws.intro', 'أَهْلًا فِي {وَرْشَتِكَ|وَرْشَتِكِ}! {اِخْتَرْ|اِخْتَارِي}: أَلْغَازُ الظِّلَالِ، أَوْ بِنَاءٌ حُرٌّ.'];
const WS_PUZ = ['compass', 'gen.ws.puzzle', '{اِسْحَبْ|اِسْحَبِي} كُلَّ قِطْعَةٍ إِلَى ظِلِّهَا. قِطْعَةٌ وَاحِدَةٌ لَا مَكَانَ لَهَا!'];
const WS_TURN = ['compass', 'gen.ws.turn', 'الشَّكْلُ صَحِيحٌ، لَكِنَّهُ يَحْتَاجُ دَوَرَانًا. {اِلْمَسْهُ|اِلْمَسِيهِ}، ثُمَّ {اِلْمَسْ|اِلْمَسِي} زِرَّ التَّدْوِيرِ.'];
const WS_NO = ['compass', 'gen.ws.no', 'هَذِهِ القِطْعَةُ لَا تُشْبِهُ هَذَا الظِّلَّ.'];
const WS_HINT = ['compass', 'gen.ws.hint', '{اُنْظُرْ|اُنْظُرِي} إِلَى الظِّلِّ المُضِيءِ: أَيُّ قِطْعَةٍ تُشْبِهُهُ؟'];
const WS_SOLVED = ['compass', 'gen.ws.solved', '{أَكْمَلْتَ|أَكْمَلْتِ} اللُّغْزَ! كُلُّ قِطْعَةٍ فِي ظِلِّهَا.'];
const WS_ALL = ['compass', 'gen.ws.all', '{حَلَلْتَ|حَلَلْتِ} كُلَّ الأَلْغَازِ! {جَرِّبِ|جَرِّبِي} البِنَاءَ الحُرَّ.'];
const WS_FREE = ['compass', 'gen.ws.free', '{اِلْمَسْ|اِلْمَسِي} قِطْعَةً فَتَظْهَرُ، ثُمَّ {اِسْحَبْهَا|اِسْحَبِيهَا}. {اِبْنِ|اِبْنِي} مَا {تُحِبُّ|تُحِبِّينَ}!'];
const WS_SAVED = ['compass', 'gen.ws.saved', 'حَفِظْتُ {تَصْمِيمَكَ|تَصْمِيمَكِ} فِي المَعْرِضِ!'];
const WS_ICON = { puzzle: '<svg viewBox="0 0 40 24" width="40" height="24"><polygon points="20,2 34,12 6,12" fill="currentColor" opacity=".35"/><rect x="9" y="12" width="22" height="11" fill="currentColor" opacity=".35"/><rect x="9" y="12" width="22" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 2"/></svg>',
  free: '<svg viewBox="0 0 40 24" width="40" height="24"><circle cx="11" cy="15" r="7" fill="currentColor"/><rect x="19" y="4" width="14" height="14" fill="currentColor" opacity=".6"/></svg>' };
function wsButtons(btns) { const bar = document.createElement('div'); bar.className = 'wsbar'; $('#stage').appendChild(bar);
  btns.forEach(([id, label, fn]) => { const b = document.createElement('button'); b.className = 'pick'; b.id = id; b.textContent = G(label); b.onclick = fn; bar.appendChild(b); }); return bar; }
async function runWorkshop(U) {
  CUR = null; show('lesson'); setStep(0); setGo('هَيَّا', null, false); window.__scene = 'ws:menu'; const W = WS[U.id];
  const svg = newStage(250, { cityOpacity: .3 }); (HOSTS[U.id] || []).forEach((k, i) => hostAt(svg, k, 290 - i * 72, 150, 62));
  say(...WS_INTRO);
  const mode = await choosePick([['puzzle', 'أَلْغَازُ الظِّلَالِ', WS_ICON.puzzle], ['free', 'بِنَاءٌ حُرٌّ', WS_ICON.free]], null);
  if (mode === 'free') return wsFree(U);
  PROG.ws = PROG.ws || {}; let i = PROG.ws[U.id] || 0;
  if (i >= W.puzzles.length) { await say(...WS_ALL); i = 0; }
  for (; i < W.puzzles.length; i++) { await wsPuzzle(U, W.puzzles[i], i);
    PROG.ws[U.id] = Math.max(PROG.ws[U.id] || 0, i + 1); saveProg();
    if (i + 1 < W.puzzles.length) await nextBtn('اللُّغْزُ التَّالِي'); }
  await say(...WS_ALL); await nextBtn('خَرِيطَةُ الوَحْدَةِ'); showHome();
}
/* لغز ظلال: القطع في الرفّ مصغّرة وبزاوية 0؛ الظل يقبل القطعة إذا طابق نوعها وزاويتها (حتى التماثل) */
function wsPuzzle(U, P, ix) {
  window.__scene = 'ws:' + P.id; setStep(Math.min(5, ix + 1));
  const svg = newStage(330, { city: false, ground: 0 }); el('rect', { x: 0, y: 236, width: 360, height: 94, fill: css('--paper'), opacity: .95 }, svg);
  const shadows = el('g', {}, svg), layer = el('g', {}, svg);
  const slots = P.slots.map(s => { const g = wsDraw(shadows, s, s.x, s.y, 1); g.style.filter = 'brightness(0)'; g.style.opacity = '.18'; return { ...s, g, filled: false }; });
  const items = shuffle([...P.slots.map(s => ({ ...s, rot: 0, need: s.rot || 0 })), { ...P.extra, rot: 0, extra: true }]);
  const n = items.length, gap = 340 / n; const TK = Math.min(.62, 60 / Math.max(...items.map(p => Math.max(p.w || p.size, p.size))));
  let sel = null, warnedTurn = false, done = 0;
  const pieces = items.map((p, i) => { const home = { x: 350 - gap * (i + .5), y: 284 };
    const g = wsDraw(layer, p, home.x, home.y, TK); const pc = { p, g, home, x: home.x, y: home.y, placed: false }; g.style.cursor = 'grab'; g.setAttribute('role', 'button'); g.dataset.ws = p.k; return pc; });
  const setPos = (pc, x, y, k) => { pc.x = x; pc.y = y; pc.g.setAttribute('transform', `translate(${x} ${y}) scale(${k})`); };
  const select = pc => { pieces.forEach(q => q.g.classList.remove('wssel')); sel = pc; if (pc) pc.g.classList.add('wssel'); };
  const rotate = pc => { if (!pc || pc.placed) return; pc.p.rot = ((pc.p.rot || 0) + 90) % 360; pc.g.inner.setAttribute('transform', `rotate(${pc.p.rot})`); SFX.tick(); };
  let resolve; const doneP = gate(new Promise(r => resolve = r));
  const tryDrop = (pc, x, y) => {
    const near = slots.filter(s => !s.filled && Math.hypot(s.x - x, s.y - y) < 46).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
    if (near && near.k === pc.p.k && near.size === pc.p.size && rotOk(pc.p.k, pc.p.rot || 0, near.rot || 0)) {
      near.filled = true; pc.placed = true; setPos(pc, near.x, near.y, 1); near.g.style.opacity = '0'; pc.g.style.cursor = 'default'; select(null); SFX.pop(); done++;
      logAttempt({ scene: 'ws', tag: P.id + ':' + pc.p.k, ok: true });
      if (done === slots.length) { disarmIdle(); hush(); SFX.win(); confetti(); say(...WS_SOLVED).then(() => resolve()); }
      return true; }
    setPos(pc, pc.home.x, pc.home.y, TK);
    if (near && near.k === pc.p.k && near.size === pc.p.size) { logAttempt({ scene: 'ws', tag: P.id + ':turn', ok: false, err: 'wsTurn' }); select(pc); if (!warnedTurn) { warnedTurn = true; say(...WS_TURN); } else SFX.soft(); }
    else if (near) { logAttempt({ scene: 'ws', tag: P.id + ':kind', ok: false, err: 'wsKind' }); SFX.soft(); say(...WS_NO, { ifIdle: true }); }
    return false; };
  pieces.forEach(pc => { let drag = null;
    pc.g.addEventListener('pointerdown', e => { if (pc.placed) return; drag = { sx: e.clientX, sy: e.clientY, moved: false }; pc.g.setPointerCapture(e.pointerId); resetIdle(); });
    pc.g.addEventListener('pointermove', e => { if (!drag) return; const ctm = svg.getScreenCTM(); const dx = (e.clientX - drag.sx) / ctm.a, dy = (e.clientY - drag.sy) / ctm.d;
      if (Math.hypot(dx, dy) > 6) drag.moved = true; if (drag.moved) setPos(pc, pc.home.x + dx + (pc.x - pc.home.x) * 0, pc.home.y + dy, 1); });
    pc.g.addEventListener('pointerup', () => { if (!drag) return; const moved = drag.moved; drag = null; if (!moved) { setPos(pc, pc.home.x, pc.home.y, TK); select(pc); SFX.tick(); return; } tryDrop(pc, pc.x, pc.y); }); });
  if (P.slots.some(q => q.rot)) wsButtons([['wsRot', '↻ دَوِّرْ', () => rotate(sel)]]);   // زر التدوير حين يحتاجه اللغز فقط
  armIdle(async () => { const s = slots.find(q => !q.filled); if (!s) return; s.g.animate([{ opacity: .18 }, { opacity: .45 }, { opacity: .18 }], { duration: 900, iterations: 3 }); await say(...WS_HINT); });
  if (TESTHOOK) window.__wsSolve = async () => {           // للفحص: يحلّ اللغز بالمنطق نفسه (يجرّب أولاً قطعة تحتاج دوراناً بلا دوران، ثم قطعة غريبة)
    const ex = pieces.find(q => q.p.extra), s0 = slots.find(s => !s.filled); if (ex && s0) tryDrop(ex, s0.x, s0.y);
    for (const s of slots) { const pc = pieces.find(q => !q.placed && !q.p.extra && q.p.k === s.k && q.p.size === s.size); if (!pc) continue;
      if ((s.rot || 0) && !rotOk(pc.p.k, pc.p.rot, s.rot)) { tryDrop(pc, s.x, s.y); while (!rotOk(pc.p.k, pc.p.rot, s.rot)) rotate(pc); }
      tryDrop(pc, s.x, s.y); await new Promise(r => setTimeout(r, 30)); } };
  say(...WS_PUZ, {}); say('compass', ...P.name);
  return doneP;
}
async function wsFree(U) {
  window.__scene = 'ws:free'; setStep(1); const W = WS[U.id];
  const svg = newStage(330, { city: false, ground: 0 }); el('rect', { x: 0, y: 248, width: 360, height: 82, fill: css('--paper'), opacity: .95 }, svg);
  const layer = el('g', {}, svg); const placed = []; let sel = null;
  const select = pc => { placed.forEach(q => q.g.classList.remove('wssel')); sel = pc; if (pc) pc.g.classList.add('wssel'); };
  const spawn = p => { const pc = { p: { ...p, rot: 0 }, x: 180 + R(-30, 30), y: 130 + R(-20, 20) }; pc.g = wsDraw(layer, pc.p, pc.x, pc.y, 1); pc.g.style.cursor = 'grab'; placed.push(pc); select(pc); SFX.pop();
    let drag = null;
    pc.g.addEventListener('pointerdown', e => { drag = { sx: e.clientX, sy: e.clientY, x0: pc.x, y0: pc.y, moved: false }; pc.g.setPointerCapture(e.pointerId); select(pc); });
    pc.g.addEventListener('pointermove', e => { if (!drag) return; const ctm = svg.getScreenCTM(); const dx = (e.clientX - drag.sx) / ctm.a, dy = (e.clientY - drag.sy) / ctm.d; if (Math.hypot(dx, dy) > 4) drag.moved = true;
      pc.x = Math.max(20, Math.min(340, drag.x0 + dx)); pc.y = Math.max(20, Math.min(232, drag.y0 + dy)); pc.g.setAttribute('transform', `translate(${pc.x} ${pc.y}) scale(1)`); });
    pc.g.addEventListener('pointerup', () => { drag = null; }); return pc; };
  W.pieces.forEach((p, i) => { const x = 315 - i * 90; const g = wsDraw(svg, p, x, 289, .6); g.style.cursor = 'pointer'; g.setAttribute('role', 'button'); g.dataset.wsSpawn = p.k; g.onclick = () => spawn(p); });
  wsButtons([...(W.pieces.some(q => !SOLIDC[q.k]) ? [['wsRot', '↻ دَوِّرْ', () => { if (!sel || SOLIDC[sel.p.k]) return; sel.p.rot = (sel.p.rot + 45) % 360; sel.g.inner.setAttribute('transform', `rotate(${sel.p.rot})`); SFX.tick(); }]] : []),
    ['wsDel', '✕ اِحْذِفْ', () => { if (!sel) return; sel.g.remove(); placed.splice(placed.indexOf(sel), 1); select(null); SFX.soft(); }],
    ['wsSave', '★ اِحْفَظْ', async () => { if (!placed.length) return; const list = store.get(designsKey(), []); list.unshift({ t: Date.now(), unit: U.id, pieces: placed.map(q => ({ ...q.p, x: Math.round(q.x), y: Math.round(q.y) })) });
      store.set(designsKey(), list.slice(0, 30)); logAttempt({ scene: 'ws', tag: 'save', ok: true }); SFX.win(); confetti(); await say(...WS_SAVED); }]]);
  await say(...WS_FREE);
  await nextBtn('خَرِيطَةُ الوَحْدَةِ'); showHome();
}

