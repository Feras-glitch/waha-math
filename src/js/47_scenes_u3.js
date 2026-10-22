/* =====================================================================
   مشاهد «أين أنا؟» (S1-U3): الإشعال (فوضى تفعل ولا تقول، D236)، والاكتشاف، والألعاب، ومشاهد «صحّح لفوضى» (chaos.kind = 'scene').
   كل مشهد يقرأ جمله من بيانات مرحلته (c.lines أو مفاتيح مسمّاة)، ويسجّل كل لمسة (logAttempt)، وكل انتظار له حلّ آلي (AUTO).
   ===================================================================== */
/* زرّ «أبقى مكاني» في «فرجار يقول» */
const STAY_ICON = '<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true"><path d="M12 22 V10 a3 3 0 0 1 6 0 V20 M18 18 V7 a3 3 0 0 1 6 0 V19 M24 18 V9 a3 3 0 0 1 6 0 V24 Q30 36 19 36 Q11 36 9 29 L6 22 a3 3 0 0 1 5 -3 L12 22" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/></svg>';
/* ---------- الدرس 1 ---------- */
/* «فرجار يقول» (الإشعال): الأمر الذي يبدأ بـ«فرجار يقول» يُنفَّذ، والأمر بلا العبارة يبقى الطفل معه مكانه.
   rounds: [{say, want: 'on'|'in'|'under'|'beside'|null}]؛ والدمية تبقى حيث وضعها الطفل */
SCENES.simonSays = async c => { const svg = newStage(300, null); const P = posPic(svg, { ref: 'chest' }); const tr = trayAt(svg); let cur = 'tray';
  let doll = placeThingAt(svg, 'doll', tr.x, tr.y, { scale: .75 }); if (c.intro) await S(c.intro);
  for (const [i, rd] of c.rounds.entries()) { const keys = Object.keys(P.spots).filter(k => posKey(k) !== posKey(cur));
    const spots = keys.map(k => ({ k, x: P.spots[k].x, y: bodyY(P.spots[k], 'doll') }));
    const okKeys = rd.want ? keys.filter(k => posKey(k) === rd.want) : [];
    const box = document.createElement('div'); box.className = 'choices icons'; $('#stage').appendChild(box); const stay = document.createElement('button'); stay.className = 'pick'; stay.dataset.k = 'stay';
    stay.innerHTML = STAY_ICON + `<span>${esc(G(labelText('stayPut')))}</span>`; stay.setAttribute('aria-label', plain(G(labelText('stayPut')))); box.appendChild(stay);
    say(...lineOf(rd.say), { free: true });
    const pick = spotPick(svg, doll, null, spots, okKeys, { label: THING_LABEL('doll') });
    const stayed = new Promise(res => stay.onclick = () => res('stay'));
    /*T*/if (TESTHOOK) stay.dataset.ok = !rd.want;/*/T*/
    if (!rd.want) AUTO({ kind: 'tap', ok: () => stay.click(), wrong: () => svg.querySelector('[data-spot]').dispatchEvent(new MouseEvent('click', { bubbles: true })) });
    const k = await gate(Promise.race([pick, stayed])); pick.cancel(); hush(); box.remove(); AUTO_CLEAR();
    const ok = rd.want ? (k !== 'stay' && posKey(k) === rd.want) : k === 'stay'; logAttempt({ scene: 'hook', tag: 'simon' + i, ok });
    if (k !== 'stay') { doll.remove(); P.placed = P.placed.filter(t => t.k !== 'doll'); doll = P.put('doll', k); cur = k; }
    if (ok) SFX.good();
    else if (rd.want && k !== 'stay') { SFX.soft(); await S(c.wrongLine); const right = keys.find(q => posKey(q) === rd.want);   /* وضعها في مكان آخر: نُريه المكان المطلوب (الفحص المستقل A) */
      doll.remove(); P.placed = P.placed.filter(t => t.k !== 'doll'); doll = P.put('doll', right); cur = right; await P.glow(right, 1200); }
    else { SFX.soft(); await S(rd.want ? c.stayedLine : c.movedLine); } }
  await S(c.after); };
/* «هل يُغلق الغطاء عليه؟»: الكرة داخل الصندوق فيُغلق عليها، وفوقه فلا يُغلق؛ و«بجانب» على الأرض نفسها */
SCENES.lidCheck = async c => { const svg = newStage(300, null); const P = posPic(svg, { ref: 'chest' }); const C = P.C;
  let ball = P.put('ball', 'in'); say(...lineOf(c.lines[0]), { free: true });
  await tapOne([{ g: C.g, k: 'lid', label: labelText('lid') }], { ok: 'lid' }); hush(); SFX.pop(); C.setLid(false); ball.style.visibility = 'hidden'; logAttempt({ scene: 'explore', tag: 'lidIn', ok: true }); await S(c.lines[1]);
  ball.remove(); C.setLid(false); ball = P.put('ball', 'on'); say(...lineOf(c.lines[2]), { free: true });
  await tapOne([{ g: C.g, k: 'lid', label: labelText('lid') }], { ok: 'lid' }); hush(); SFX.soft(); const t = ball.getAttribute('transform');
  await anim(ball, [{ transform: t }, { transform: t.replace(/translate\(([-\d.]+) ([-\d.]+)\)/, (m, x, y) => `translate(${x} ${+y - 10})`) }, { transform: t }], { duration: 500 }).done; logAttempt({ scene: 'explore', tag: 'lidOn', ok: true }); await S(c.lines[3]);
  const cat = P.put('cat', 'besideL'); const fl = el('line', { x1: 20, y1: 286, x2: 340, y2: 286, stroke: css('--compass'), 'stroke-width': 5, 'stroke-dasharray': '10 7', 'pointer-events': 'none' }, svg);
  say(...lineOf(c.lines[4]), { free: true }); await tapOne([{ g: cat, k: 'cat', label: THING_LABEL('cat') }], { ok: 'cat' }); hush(); anim(fl, [{ opacity: .2 }, { opacity: 1 }], { duration: 500, iterations: 4, direction: 'alternate' }); logAttempt({ scene: 'explore', tag: 'beside', ok: true });
  await S(c.lines[5]); };
/* «صحّح لفوضى» (الدرس 1): طُلب منها أن تضع الكرة داخل الصندوق فوضعتها فوقه. يجدها الطفل، ثم يضعها داخله بيده */
SCENES.chaosLid = async c => { const svg = newStage(300, null); const P = posPic(svg, { ref: 'chest', open: false }); const tr = trayAt(svg, 60, 86);
  const teddy = P.put('teddy', 'under'); let ball = P.put('ball', 'on'); const fz = chaosAt(svg, 300, 60, .42); await chaosGiggle(fz); await S(c.find);
  let tries = 0; while (true) { const k = await tapOne([{ g: ball, k: 'ball', label: THING_LABEL('ball') }, { g: teddy, k: 'teddy', label: THING_LABEL('teddy') }], { ok: 'ball', pad: 64 }); tries++;
    logAttempt({ scene: 'chaos', tag: 'find', ok: k === 'ball', firstTry: tries === 1 }); if (k === 'ball') break; SFX.soft(); await S('gen.chaos.no'); }
  SFX.good(); fz.remove(); ball.remove(); P.placed = P.placed.filter(t => t.k !== 'ball'); C_open(P); const th = placeThingAt(svg, 'ball', tr.x, tr.y, { scale: .75 });
  await S(c.fix); tries = 0;
  while (true) { const keys = ['on', 'in', 'besideL']; const k = await spotPick(svg, th, null, keys.map(q => ({ k: q, x: P.spots[q].x, y: bodyY(P.spots[q], 'ball') })), ['in'], { label: THING_LABEL('ball') }); tries++;
    logAttempt({ scene: 'chaos', tag: 'fix', ok: k === 'in', firstTry: tries === 1 }); if (k === 'in') break; SFX.soft(); await S('gen.err.posInOn.01'); }
  th.remove(); P.put('ball', 'in'); SFX.good(); await sleep(300); P.C.setLid(false); P.placed.filter(t => t.k === 'ball').forEach(t => t.g.style.visibility = 'hidden'); await S(c.after); };
const C_open = P => P.C.setLid(true);

/* ---------- الدرس 2 ---------- */
/* فوضى في أول الطابور وعليها شارة «الأخير» (الإشعال): يلمس الطفل من يستحقّها، فتنتقل إليه */
SCENES.queueBadge = async c => { const svg = newStage(QH, { oasis: false, ground: 0 }); const R = rowPic(svg, { kind: 'queue', members: ['chaos', ...c.members] });
  let b = ordBadgeAt(svg, R.members[0].x, QY - 76, 'last'); await chaosGiggle(R.members[0].g); say(...lineOf(c.lines[0]), { free: true });
  const last = R.members.length - 1; let tries = 0;
  while (true) { const k = await tapOne(R.members.map(M => ({ g: M.g, k: M.k, label: labelText('dollQ') })), { ok: last, pad: 56 }); hush(); tries++;
    logAttempt({ scene: 'hook', tag: 'lastBadge', ok: k === last, firstTry: tries === 1 }); if (k === last) break; SFX.soft(); await S(c.lines[1]); }
  SFX.good(); await anim(b, [{ transform: `translate(${R.members[0].x}px,${QY - 76}px)` }, { transform: `translate(${R.members[last].x}px,${QY - 100}px)` }], { duration: 800, fill: 'forwards', easing: 'ease-in-out' }).done;
  await S(c.lines.slice(2)); };
/* تبديل دميتين: الدمية الواحدة تكون أمام ثم خلف */
SCENES.queueSwap = async c => { const svg = newStage(QH, { oasis: false, ground: 0 }); const R = rowPic(svg, { kind: 'queue', members: c.members }); await S(c.lines[0]);
  const [i, j] = c.pair; say(...lineOf(c.lines[1]), { free: true });
  await tapOne([{ g: R.members[i].g, k: 'a', label: labelText('dollQ') }], { ok: 'a', pad: 60 }); hush(); SFX.tick();
  const A = R.members[i], B = R.members[j]; const ta = A.g.getAttribute('transform'), tb = B.g.getAttribute('transform');
  await Promise.all([anim(A.g, [{ transform: ta }, { transform: tb }], { duration: 800, fill: 'forwards' }).done, anim(B.g, [{ transform: tb }, { transform: ta }], { duration: 800, fill: 'forwards' }).done]);
  A.g.setAttribute('transform', tb); B.g.setAttribute('transform', ta); logAttempt({ scene: 'explore', tag: 'swap', ok: true }); await S(c.lines.slice(2)); };
/* عربات القطار (N008): يلمس الطفل العربات من المقدّمة واحدةً واحدة، وتُقال كل عربة بترتيبها؛ ثم «ثلاث» و«الثالثة» */
SCENES.trainOrdinals = async c => { const svg = newStage(TH, { oasis: false, ground: 0 }); const R = rowPic(svg, { kind: 'train', n: c.n || 10, things: c.things || {} }); const m = el('g', { 'pointer-events': 'none' }, R.S.g);
  await S(c.lines[0]);
  for (let i = 0; i < R.members.length; i++) { await rowShow(R, i); let tries = 0;
    while (true) { const k = await tapOne(R.members.map(M => ({ g: M.g, k: M.k, label: labelText('car') })), { ok: i, pad: 60, pulse: i === 0 }); tries++;
      if (k === i) break; SFX.soft(); logAttempt({ scene: 'explore', tag: 'ordOrder', ok: false, firstTry: tries === 1 }); await S('gen.ord.fromFront'); }
    SFX.tick(); badge(m, R.members[i].x, R.members[i].y - 70, i + 1); await S('gen.ord.f.' + String(i + 1).padStart(2, '0'), { noGap: true, num: true }); }
  logAttempt({ scene: 'explore', tag: 'ordinals', ok: true }); m.remove(); await R.S.setOff(R.S.max);
  /* «ثلاث» تخبرنا كم، و«الثالثة» تخبرنا أين */
  await S(c.lines[1]); const paint = el('g', { 'pointer-events': 'none' }, R.S.g); for (const i of [0, 1, 2]) el('rect', { x: R.members[i].x - 28, y: R.members[i].y - 34, width: 56, height: 24, rx: 4, fill: '#f2b33d' }, paint);
  await S(c.lines[2]); paint.remove(); const M = R.members[2]; el('circle', { cx: M.x, cy: M.y - 24, r: 34, fill: 'none', stroke: css('--good'), 'stroke-width': 5, 'pointer-events': 'none' }, R.S.g); await S(c.lines[3]); };
/* الدببة في الطابور بأعدادها الترتيبية المذكّرة (N008، المواصفة: «ونقول للدمى: الأول، الثاني…»؛ الفحص المستقل A): يلمس الطفل الدببة من المقدّمة،
   أي من الأقرب إلى الدكّان، ويُقال كلٌّ بترتيبه؛ ثم جملة تجمع المذكّر والمؤنّث */
SCENES.queueOrdinals = async c => { const svg = newStage(QH, { oasis: false, ground: 0 }); const R = rowPic(svg, { kind: 'queue', members: c.members }); const m = el('g', { 'pointer-events': 'none' }, svg);
  await S(c.lines[0]);
  for (let i = 0; i < R.members.length; i++) { let tries = 0;
    while (true) { const k = await tapOne(R.members.map(M => ({ g: M.g, k: M.k, label: labelText('dollQ') })), { ok: i, pad: 56, pulse: i === 0 }); tries++;
      if (k === i) break; SFX.soft(); logAttempt({ scene: 'explore', tag: 'ordOrderQ', ok: false, firstTry: tries === 1 }); await S('gen.ord.fromShop'); }
    SFX.tick(); badge(m, R.members[i].x, R.members[i].y - 118, i + 1); await S('gen.ord.m.' + String(i + 1).padStart(2, '0'), { noGap: true, num: true }); }
  logAttempt({ scene: 'explore', tag: 'ordinalsQ', ok: true }); await S(c.lines.slice(1)); };
/* «صحّح لفوضى» (الدرس 2): علّقت فوضى شارة «الأولى» على آخر عربة. يجدها الطفل، ثم يلمس العربة التي تستحقّها فتنتقل إليها */
SCENES.chaosTrainBadge = async c => { const svg = newStage(TH, { oasis: false, ground: 0 }); const R = rowPic(svg, { kind: 'train', n: c.n || 6, things: c.things || {} }); const n = R.members.length;
  await R.S.setOff(0, false); const b = ordBadgeAt(R.S.g, R.members[n - 1].x, R.members[n - 1].y - 66, 'first'); const fz = chaosAt(svg, 60, 50, .42); await chaosGiggle(fz); await S(c.find);
  let tries = 0; while (true) { const k = await tapOne(R.members.map(M => ({ g: M.g, k: M.k, label: labelText('car') })), { ok: n - 1, pad: 60 }); tries++;
    logAttempt({ scene: 'chaos', tag: 'find', ok: k === n - 1, firstTry: tries === 1 }); if (k === n - 1) break; SFX.soft(); await S('gen.chaos.notThis'); }
  /* ثم يتحرّك القطار إلى مقدّمته فتُرى القاطرة (الفحص المستقل B: بقي على ذيله، والقاطرة والعربة الأولى خارج النافذة) */
  SFX.good(); fz.remove(); await R.S.setOff(R.S.max); await S(c.fix); tries = 0;
  while (true) { const k = await tapOne(R.members.map(M => ({ g: M.g, k: M.k, label: labelText('car') })), { ok: 0, pad: 60 }); tries++;
    logAttempt({ scene: 'chaos', tag: 'fix', ok: k === 0, firstTry: tries === 1 }); if (k === 0) break; SFX.soft(); await S('gen.ord.fromFront'); }
  SFX.good(); await rowShow(R, 0); b.setAttribute('transform', `translate(${R.members[0].x} ${R.members[0].y - 66})`); anim(b, [{ opacity: 0 }, { opacity: 1 }], 500); await S(c.after); };

/* ---------- الدرس 3 ---------- */
/* فوضى من ظهرها والشريط على يدها اليسرى (الإشعال): يلمس الطفل يدها اليمنى فينتقل الشريط إليها */
SCENES.ribbonHook = async c => { const svg = newStage(300, null); roomBg(svg, 300, 200); let F = chaosBackAt(svg, 180, 238, { ribbon: 'L', raise: 'L', s: 1.6 });   /* قدماها فوق حافة المسرح (الفحص المستقل B: قُصّتا في Pixel 5) */
  anim(F.g, [{ opacity: 0 }, { opacity: 1 }], 500); SFX.chaos(); say(...lineOf(c.lines[0]), { free: true }); let tries = 0;
  while (true) { const tg = ['R', 'L'].map(s => { const g = el('g', { transform: `translate(${F[s].x} ${F[s].y})` }, svg); el('circle', { r: 26, fill: 'transparent' }, g); return { g, k: s, label: labelText('hand') }; });
    const k = await tapOne(tg, { ok: 'R', pad: 64 }); hush(); tg.forEach(t => t.g.remove()); tries++;
    logAttempt({ scene: 'hook', tag: 'ribbon', ok: k === 'R', firstTry: tries === 1 }); if (k === 'R') break; SFX.soft(); await S(c.lines[1]); }
  SFX.good(); F.g.remove(); F = chaosBackAt(svg, 180, 238, { ribbon: 'R', raise: 'R', s: 1.6 }); await S(c.lines.slice(2)); };
/* حركات الجسم مع الطفل المرسوم من ظهره (مسار «معي»؛ وعلى الشاشة يشاهد ويقلّد، ولا يحكم التطبيق، فالدرس «مدخل» في مسار الشاشة):
   moves: [{say, raise:'R'|'L'|null, cross:true}] */
SCENES.bodyMoves = async c => { const svg = newStage(300, null); roomBg(svg, 300, 200); let K = kidBackAt(svg, 180, 286, { ribbon: 'R', s: 1.08 }); const mat = PATH_MAT();
  /* على الشاشة (D238، الفحص المستقل A): لا يُطلب ما لا يتحقق منه التطبيق، فيشاهد الطفل الحركة بجملتها (show) بلا «تمّ» ولا تسجيل، ولا حركة التقاطع */
  for (const mv of c.moves) { if (!mat && !mv.show) continue; K.g.remove(); K = kidBackAt(svg, 180, 286, { ribbon: 'R', raise: mv.raise || null, s: 1.08 });
    if (mv.cross) { const h = K.hand('R'); const e = el('ellipse', { cx: 180 - 24 * 1.08, cy: 286 - 132 * 1.08, rx: 8, ry: 12, fill: 'none', stroke: css('--compass'), 'stroke-width': 4, 'pointer-events': 'none' }, svg);
      const arm = el('path', { d: `M${180 + 26 * 1.08} ${286 - 96 * 1.08} Q180 ${286 - 170 * 1.08} ${180 - 22 * 1.08} ${286 - 138 * 1.08}`, stroke: css('--compass'), 'stroke-width': 5, 'stroke-dasharray': '7 6', fill: 'none', 'pointer-events': 'none' }, svg);
      setTimeout(() => { e.remove(); arm.remove(); }, FAST ? 30 : 5000); }
    if (!mat) { await S(mv.show); continue; }
    await S(mv.say); const d = doneBtn(); AUTO({ kind: 'material', ok: () => d.b.click() }); await gate(new Promise(r => d.b.onclick = () => { AUTO_CLEAR(); hush(); d.bar.remove(); r(); }));
    logAttempt({ scene: 'explore', tag: 'move:' + (mv.raise || (mv.cross ? 'cross' : 'none')), ok: true }); }
  if (c.after) await S(c.after); };
/* الروبوت أول مرة: يلمس الطفل الأمر المطلوب فيُنفَّذ أمامه («تقدّم» ينقل، و«انعطف» يدير في المكان). steps: [{say, k}] */
SCENES.robotIntro = async c => { const svg = newStage(300, { oasis: false, ground: 0 }); const RB = rbBoard(svg, { c: 2, r: 3, dir: 0 }); let st = { c: 2, r: 3, dir: 0 };
  const box = document.createElement('div'); box.className = 'choices icons rbbar three'; $('#stage').appendChild(box);
  const btn = {}; for (const [k, lbl] of [['F', 'rbF'], ['R', 'rbR'], ['L', 'rbL']]) { const b = document.createElement('button'); b.className = 'pick rb'; b.dataset.k = k; b.innerHTML = RB_ICON[k] + `<span>${esc(G(labelText(lbl)))}</span>`; b.setAttribute('aria-label', plain(G(labelText(lbl)))); box.appendChild(b); btn[k] = b; }
  if (c.intro) await S(c.intro);
  for (const step of c.steps) { say(...lineOf(step.say), { free: true }); let tries = 0;
    AUTO({ kind: 'tap', ok: () => btn[step.k].click(), wrong: () => btn[step.k === 'F' ? 'R' : 'F'].click() }); /*T*/if (TESTHOOK) Object.entries(btn).forEach(([kk, b]) => b.dataset.ok = kk === step.k);/*/T*/
    while (true) { const k = await gate(new Promise(res => Object.entries(btn).forEach(([kk, b]) => b.onclick = () => res(kk)))); tries++;
      if (k === step.k) break; SFX.soft(); logAttempt({ scene: 'explore', tag: 'rbIntro', ok: false, firstTry: tries === 1 }); await S('gen.rb.which'); }
    AUTO_CLEAR(); hush(); Object.values(btn).forEach(b => b.onclick = null); st = await RB.run([step.k], st); logAttempt({ scene: 'explore', tag: 'rb:' + step.k, ok: true }); if (step.after) await S(step.after); }
  box.remove(); if (c.after) await S(c.after); };
/* «صحّح لفوضى» (الدرس 3): قالت فوضى للروبوت «انعطف يميناً» فمشى خطوة إلى اليمين. يلمس الطفل الروبوت فيعود، ثم يلمس «انعطف يميناً» فيدور في مكانه */
SCENES.chaosTurn = async c => { const svg = newStage(300, { oasis: false, ground: 0 }); const start = { c: 2, r: 3, dir: 0 }; const RB = rbBoard(svg, start); const p0 = RB.B.at(2, 3);
  const ghost = robotTopAt(svg, p0.x, p0.y, { s: 1 }); ghost.style.opacity = '.25'; RB.show({ c: 3, r: 3, dir: 0 }); const fz = chaosAt(svg, 330, 40, .4); await chaosGiggle(fz); await S(c.find);
  let tries = 0;
  while (true) { const p = RB.B.at(3, 3); const t = el('g', { transform: `translate(${p.x} ${p.y})` }, svg); el('circle', { r: 28, fill: 'transparent' }, t); const tg = el('g', { transform: `translate(${p0.x} ${p0.y})` }, svg); el('circle', { r: 28, fill: 'transparent' }, tg);
    const k = await tapOne([{ g: t, k: 'bot', label: labelText('robot') }, { g: tg, k: 'start', label: labelText('spot') }], { ok: 'bot', pad: 60 }); t.remove(); tg.remove(); tries++;
    logAttempt({ scene: 'chaos', tag: 'find', ok: k === 'bot', firstTry: tries === 1 }); if (k === 'bot') break; SFX.soft(); await S('gen.chaos.notThis'); }
  SFX.good(); fz.remove(); ghost.remove(); RB.show(start); await S(c.fix);
  const box = document.createElement('div'); box.className = 'choices icons rbbar three'; $('#stage').appendChild(box); const btn = {};
  for (const [k, lbl] of [['F', 'rbF'], ['R', 'rbR'], ['L', 'rbL']]) { const b = document.createElement('button'); b.className = 'pick rb'; b.dataset.k = k; b.innerHTML = RB_ICON[k] + `<span>${esc(G(labelText(lbl)))}</span>`; b.setAttribute('aria-label', plain(G(labelText(lbl)))); box.appendChild(b); btn[k] = b; }
  AUTO({ kind: 'tap', ok: () => btn.R.click(), wrong: () => btn.F.click() }); /*T*/if (TESTHOOK) Object.entries(btn).forEach(([kk, b]) => b.dataset.ok = kk === 'R');/*/T*/ tries = 0;
  while (true) { const k = await gate(new Promise(res => Object.entries(btn).forEach(([kk, b]) => b.onclick = () => res(kk)))); tries++;
    logAttempt({ scene: 'chaos', tag: 'fix', ok: k === 'R', firstTry: tries === 1 }); if (k === 'R') break; SFX.soft(); await S('gen.err.rbTurnMove.01'); }
  AUTO_CLEAR(); box.remove(); await RB.run(['R']); SFX.good(); await S(c.after); };

/* ---------- الدرس 4 ---------- */
/* خريطة فوضى (الإشعال): وضعت السرير على علامة الباب؛ يقارن الطفل بالغرفة وينقل القطعة إلى مكانها */
SCENES.mapChaosHook = async c => { const svg = newStage(320, { oasis: false, ground: 0 }); const lay = c.lay; const Rm = roomSideAt(svg, lay, { y0: 0, H: 150 });
  const others = { ...lay, items: lay.items.filter(i => i.k !== 'bed') }; const M = roomMapAt(svg, others, { y0: 168, H: 140, x0: 18, W: 252 });
  const bed = lay.items.find(i => i.k === 'bed'); let piece = mapPieceAt(svg, 'bed', M.door.x, M.door.y + 18); const fz = chaosAt(svg, 330, 200, .38); await chaosGiggle(fz); fz.remove();
  say(...lineOf(c.lines[0]), { free: true }); const cands = [[bed.col, bed.row], ...c.cands].map(([col, row], i) => ({ k: 'c' + i, col, row, x: M.colX(col), y: M.rowY(row) }));
  let tries = 0; while (true) { const k = await spotPick(svg, piece, null, cands, ['c0'], { label: labelText('mapPiece') }); tries++;
    logAttempt({ scene: 'hook', tag: 'mapBed', ok: k === 'c0', firstTry: tries === 1 }); piece.remove(); const q = cands.find(x => x.k === k); piece = mapPieceAt(svg, 'bed', q.x, q.y);
    if (k === 'c0') break; SFX.soft(); await S(c.lines[1]); piece.remove(); piece = mapPieceAt(svg, 'bed', M.door.x, M.door.y + 18); }
  SFX.good(); await S(c.lines.slice(2)); };
/* نظرة الطائر: يلمس الطفل كل شيء في الغرفة فتظهر قطعته في الخريطة تحته، في الموضع نفسه */
SCENES.birdView = async c => { const svg = newStage(320, { oasis: false, ground: 0 }); const lay = c.lay; const Rm = roomSideAt(svg, lay, { y0: 0, H: 150 }); const M = roomMapAt(svg, lay, { y0: 168, H: 140, pieces: false });
  await S(c.lines[0]);
  for (const [i, it] of lay.items.entries()) { const g = Rm.items[it.id || it.k]; say(...lineOf(c.say[it.k]), { free: true });
    await tapOne([{ g, k: it.k, label: labelText('th.' + it.k) }], { ok: it.k, pad: 64 }); hush(); SFX.pop();
    const p = mapPieceAt(M.g, it.k, M.colX(it.col), M.rowY(it.row)); await anim(p, [{ opacity: 0, transform: `translate(${ROOM_COLX[it.col]}px,${it.row === 'back' ? Rm.fy : 120}px) scale(.4)` }, { opacity: 1, transform: `translate(${M.colX(it.col)}px,${M.rowY(it.row)}px) scale(1)` }], { duration: 800, fill: 'forwards', easing: 'ease-out' }).done;
    await S(c.named[it.k]); logAttempt({ scene: 'explore', tag: 'bird:' + it.k, ok: true }); }
  await S(c.lines.slice(1)); };
/* «صحّح لفوضى» (الدرس 4): رسمت فوضى الطاولة في الخريطة كما تُرى من الجانب. يجدها الطفل، ثم يختار قطعتها كما يراها الطائر */
SCENES.chaosSideDraw = async c => { const svg = newStage(320, { oasis: false, ground: 0 }); const lay = c.lay; roomSideAt(svg, lay, { y0: 0, H: 150 });
  const M = roomMapAt(svg, { ...lay, items: lay.items.filter(i => i.k !== 'table') }, { y0: 168, H: 140 }); const T = lay.items.find(i => i.k === 'table');
  const side = tableAt(svg, M.colX(T.col), M.rowY(T.row) + 22, { w: 64, h: 40 }).g; const fz = chaosAt(svg, 330, 196, .38); await chaosGiggle(fz); await S(c.find);
  const others = Object.entries(M.pieces).map(([k, g]) => ({ g, k, label: labelText('mapPiece') })); let tries = 0;
  while (true) { const k = await tapOne([{ g: side, k: 'side', label: labelText('mapPiece') }, ...others], { ok: 'side', pad: 56 }); tries++;
    logAttempt({ scene: 'chaos', tag: 'find', ok: k === 'side', firstTry: tries === 1 }); if (k === 'side') break; SFX.soft(); await S('gen.chaos.no'); }
  /* الخياران على لوح فوق صورة الغرفة، لا داخلها (الفحص المستقل B: بدا الخياران قطعتين في الغرفة)، وجهتاهما عشوائية */
  SFX.good(); fz.remove(); await S(c.fix); const panel = el('g', {}, svg);
  el('rect', { x: 16, y: 8, width: 328, height: 146, rx: 18, fill: css('--paper'), stroke: css('--ink'), 'stroke-opacity': .3, 'stroke-width': 3 }, panel);
  const [x1, x2] = rand() < .5 ? [250, 110] : [110, 250]; const opt1 = mapPieceAt(panel, 'table', x1, 80), opt2 = tableAt(panel, x2, 118, { w: 64, h: 40 }).g; tries = 0;
  while (true) { const k = await tapOne([{ g: opt1, k: 'top', label: labelText('mapPiece') }, { g: opt2, k: 'sideB', label: labelText('mapPiece') }], { ok: 'top', pad: 64 }); tries++;
    logAttempt({ scene: 'chaos', tag: 'fix', ok: k === 'top', firstTry: tries === 1 }); if (k === 'top') break; SFX.soft(); await S('gen.err.mapSide.01'); }
  SFX.good(); side.remove(); panel.remove(); mapPieceAt(svg, 'table', M.colX(T.col), M.rowY(T.row)); await S(c.after); };

/* ---------- الدرسان 5 و6: طريق الأعداد ---------- */
/* فوضى عند ثمانية تريد الكنز عند أحد عشر، فترجع إلى الواحد لتعدّ (الإشعال، تفعل ولا تقول)؛ ثم يعدّ الطفل من ثمانية */
SCENES.roadChaosHook = async c => { const svg = newStage(270, { oasis: false, ground: 0 }); el('rect', { x: -360, y: 196, width: 1080, height: 80, fill: css('--floor'), opacity: .55 }, svg);
  const S0 = roadAt(svg, { y: 170, at: c.a, btnY: 236 }); const tx = S0.tileX(c.b); const tr = treasureAt(S0.g, tx, 140, .7); const fz = roadToken(S0, 'chaos', c.a);
  await S(c.lines[0]); SFX.chaos(); await fz.hop(1); await sleep(300);
  await S(c.lines[1]); fz.g.remove(); await S0.setOff(Math.max(0, S0.tileX(c.a) - 29 * 3), false);
  const kid = roadToken(S0, 'kid', c.a); const R = { svg, S: S0, tok: kid }; say(...lineOf(c.lines[2]), { free: true });
  const r = await roadHops(R, { a: c.a, b: c.b }, 'explore'); const ok = roadErr({ a: c.a, b: c.b }, r.path).ok; logAttempt({ scene: 'hook', tag: 'roadFrom', ok });
  if (!ok) { kid.place(c.a); await kid.hop(c.b, n => S(numw(n), { noGap: true, num: true })); } SFX.good(); await S(c.lines.slice(3)); };
/* البلاطات بعد العشرة: يلمسها الطفل واحدةً واحدة فتنطق أسماءها (لا قراءة فوق العشرة، D229) */
SCENES.roadListen = async c => { const svg = newStage(270, { oasis: false, ground: 0 }); el('rect', { x: -360, y: 196, width: 1080, height: 80, fill: css('--floor'), opacity: .55 }, svg);
  const S0 = roadAt(svg, { y: 170, at: c.from || 10, btnY: 236 }); await S(c.lines[0]); const heard = new Set(); const want = c.count || 5;
  const tiles = S0.tiles.filter(t => t.n > 10); tiles.forEach(t => { t.g.style.cursor = 'pointer'; t.g.setAttribute('role', 'button'); t.g.setAttribute('aria-label', plain(T(numw(t.n)))); hitPad(t.g, 56); });
  /*T*/window.__road = { seq: tiles.slice(0, want).map(t => t.n), done: false };/*/T*/
  AUTO({ kind: 'road', ok: async () => { for (const t of tiles.slice(0, want)) { await S0.show(S0.tileX(t.n) - 29, S0.tileX(t.n) + 29); t.g.dispatchEvent(new MouseEvent('click', { bubbles: true })); await new Promise(r => setTimeout(r, 30)); } } });
  await gate(new Promise(res => tiles.forEach(t => t.g.onclick = () => { if (S0.dragged) return; SFX.tick(); say(...lineOf(numw(t.n)), { free: true, num: true }); heard.add(t.n);
    el('rect', { x: -25, y: -25, width: 50, height: 50, rx: 10, fill: css('--compass'), 'fill-opacity': .15, 'pointer-events': 'none' }, t.g); if (heard.size >= want) res(); })));
  AUTO_CLEAR(); tiles.forEach(t => { t.g.onclick = null; t.g.removeAttribute('role'); t.g.style.cursor = ''; t.g.querySelectorAll(':scope > rect.hit').forEach(h => h.remove()); });
  logAttempt({ scene: 'explore', tag: 'roadListen', ok: true }); await S(c.lines.slice(1)); };
/* «عدّ مع فوضى» (لعبة الدرس 5): تقفز فوضى بلاطةً بلاطة، ويختار الطفل في كل قفزة العدد من بطاقتين مسموعتين */
SCENES.roadCountChaos = async c => { const svg = newStage(270, { oasis: false, ground: 0 }); el('rect', { x: -360, y: 196, width: 1080, height: 80, fill: css('--floor'), opacity: .55 }, svg);
  const legs = c.legs || [[c.from, c.to]];   /* أشواط: إلى الأمام ثم إلى الخلف (المواصفة: «إلى الأمام أو إلى الخلف») */
  const S0 = roadAt(svg, { y: 170, at: legs[0][0], btnY: 236 }); const fz = roadToken(S0, 'chaos', legs[0][0]); await S(c.lines[0]);
  for (const [from, to] of legs) { if (fz.n !== from) { await S0.show(S0.tileX(from) - 29, S0.tileX(from) + 29); await fz.leap(from); await S(numw(from), { num: true }); } const dir = Math.sign(to - from);
  for (let n = from + dir; n !== to + dir; n += dir) { await fz.hop(n); const alt = n + dir; let tries = 0;
    while (true) { if (tries === 0) say(...lineOf(c.lines[1]), { free: true }); const cp = cardPick([{ id: numw(n), k: 'w', ok: true, hide: true }, { id: numw(alt), k: 'a', ok: false, hide: true }], { intro: c.lines[1], keepQ: true }); const pk = await cp.p; cp.done(); cp.box.remove(); tries++;
      logAttempt({ scene: 'game', tag: 'countChaos', ok: pk.k === 'w', firstTry: tries === 1 }); if (pk.k === 'w') break; SFX.soft(); await S(numw(n - dir), { num: true }); }
    SFX.good(); await S(numw(n), { num: true }); } }
  await S(c.lines.slice(2)); };
/* «صحّح لفوضى» (الدرس 5): عدّت إلى الخلف وقفزت عن بلاطة. يلمس الطفل البلاطة المتروكة، ثم يعدّ إلى الخلف بيده */
SCENES.chaosSkipBack = async c => { const svg = newStage(270, { oasis: false, ground: 0 }); el('rect', { x: -360, y: 196, width: 1080, height: 80, fill: css('--floor'), opacity: .55 }, svg);
  const S0 = roadAt(svg, { y: 170, at: c.b, btnY: 236 }); const fz = roadToken(S0, 'chaos', c.a); await S0.show(S0.tileX(c.b) - 29, S0.tileX(c.a) + 29);
  /* آثار فوضى على البلاطات التي وقفت عليها، بلا عدّ مسموع (الفحص المستقل A: كان صوت فرجار يقول عدّها الخاطئ) */
  const step = n => el('circle', { cx: 0, cy: ROAD_TILE / 2 - 9, r: 6, fill: css('--chaos'), stroke: '#fff', 'stroke-width': 2, 'pointer-events': 'none' }, S0.tiles[n].g);
  for (const n of c.said) { if (n !== fz.n) await fz.leap(n); step(n); SFX.pop(); await sleep(420); } SFX.chaos(); await S(c.find); let tries = 0;
  while (true) { const k = await tapOne(S0.tiles.filter(t => t.n >= c.b - 1 && t.n <= c.a + 1).map(t => ({ g: t.g, k: t.n, label: T(numw(t.n)) })), { ok: c.skip, pad: 56 }); tries++;
    logAttempt({ scene: 'chaos', tag: 'find', ok: k === c.skip, firstTry: tries === 1 }); if (k === c.skip) break; SFX.soft(); await S('gen.chaos.notThis'); }
  SFX.good(); await S(numw(c.skip), { num: true }); fz.g.remove(); await S(c.fix); const kid = roadToken(S0, 'kid', c.a); tries = 0;
  while (true) { const r = await roadHops({ svg, S: S0, tok: kid }, { a: c.a, b: c.b }, 'explore'); const ok = roadErr({ a: c.a, b: c.b }, r.path).ok; tries++;
    logAttempt({ scene: 'chaos', tag: 'fix', ok, firstTry: tries === 1 }); if (ok) break; SFX.soft(); await S('gen.err.roadSkip.01'); kid.place(c.a); }
  SFX.good(); await S(c.after); };
/* فوضى عند ثمانية تريد التقدّم ثلاثاً، فتعدّ بلاطتها قفزةً أولى (الإشعال، تفعل ولا تقول)؛ ثم يقفز الطفل ثلاثاً */
SCENES.jumpChaosHook = async c => { const svg = newStage(270, { oasis: false, ground: 0 }); el('rect', { x: -360, y: 196, width: 1080, height: 80, fill: css('--floor'), opacity: .55 }, svg);
  const S0 = roadAt(svg, { y: 170, at: c.a, btnY: 236 }); const fz = roadToken(S0, 'chaos', c.a); await S(c.lines[0]);
  const dots = el('g', { 'pointer-events': 'none' }, svg); const dot = i => el('circle', { cx: 30 + i * 24, cy: 26, r: 9, fill: css('--chaos') }, dots);
  dot(0); SFX.chaos(); await anim(fz.g, [{ transform: `translate(${S0.tileX(c.a)}px,${S0.y}px)` }, { transform: `translate(${S0.tileX(c.a)}px,${S0.y - 30}px)` }, { transform: `translate(${S0.tileX(c.a)}px,${S0.y}px)` }], { duration: 420 }).done;
  for (let i = 1; i < c.n; i++) { await fz.hop(c.a + i); dot(i); } await sleep(400); await S(c.lines[1]); dots.remove(); fz.g.remove();
  const kid = roadToken(S0, 'kid', c.a); say(...lineOf(c.lines[2]), { free: true }); const r = await roadHops({ svg, S: S0, tok: kid }, { a: c.a, n: c.n, dir: 1 }, 'explore');
  const ok = roadErr({ a: c.a, n: c.n, dir: 1 }, r.path).ok; logAttempt({ scene: 'hook', tag: 'jumpOwn', ok }); if (!ok) { kid.place(c.a); await kid.hop(c.a + c.n, n => S(numw(n), { noGap: true, num: true })); }
  SFX.good(); await S(c.lines.slice(3)); };
/* «سباق الطريق» (لعبة الدرس 6): نرد من 1 إلى 3؛ يتوقّع الطفل أين يصل من بطاقتين مسموعتين ثم يقفز، وفوضى تقفز بعده */
SCENES.roadRace = async c => { const svg = newStage(270, { oasis: false, ground: 0 }); el('rect', { x: -360, y: 196, width: 1080, height: 80, fill: css('--floor'), opacity: .55 }, svg);
  const S0 = roadAt(svg, { y: 170, at: c.start || 0, btnY: 236 }); const fz = roadToken(S0, 'chaos', c.start || 0, { dx: -14 }), kid = roadToken(S0, 'kid', c.start || 0, { dx: 10 });
  await S(c.lines[0]); const rolls = c.rolls || [2, 3, 1];
  for (const [i, k] of rolls.entries()) { const die = diceAt(svg, 300, 58, k, { sp: 14 }); SFX.pop(); await S(numw(k), { num: true });
    const want = kid.n + k, alt = kid.n + k - 1; let tries = 0;
    while (true) { if (tries === 0) say(...lineOf(c.lines[1]), { free: true }); const cp = cardPick([{ id: numw(want), k: 'w', ok: true, hide: true }, { id: numw(alt), k: 'a', ok: false, hide: true }], { intro: c.lines[1], keepQ: true }); const pk = await cp.p; cp.done(); cp.box.remove(); tries++;
      logAttempt({ scene: 'game', tag: 'racePredict', ok: pk.k === 'w', firstTry: tries === 1 }); if (pk.k === 'w') { SFX.good(); break; } SFX.soft(); await S('gen.err.roadOwnTile.01'); }
    await kid.hop(want, n => S(numw(n), { noGap: true, num: true })); die.remove();
    const fk = c.chaos ? c.chaos[i] : 2; const d2 = diceAt(svg, 60, 58, fk, { sp: 14 }); await fz.hop(fz.n + fk); d2.remove(); }
  await S(c.lines.slice(2)); };
/* «صحّح لفوضى» (الدرس 6): قيل لها «ارجعي» عدداً من القفزات (c.n) فقفزت إلى الأمام. يلمسها الطفل، ثم يقفز إلى الخلف بيده */
SCENES.chaosSubForward = async c => { const svg = newStage(270, { oasis: false, ground: 0 }); el('rect', { x: -360, y: 196, width: 1080, height: 80, fill: css('--floor'), opacity: .55 }, svg);
  const S0 = roadAt(svg, { y: 170, at: c.a - c.n, btnY: 236 }); const fz = roadToken(S0, 'chaos', c.a); await S0.show(S0.tileX(c.a - c.n) - 29, S0.tileX(c.a + c.n) + 29);
  const mark = el('rect', { x: -27, y: -27, width: 54, height: 54, rx: 11, fill: 'none', stroke: css('--chaos'), 'stroke-width': 4, 'stroke-dasharray': '6 5', 'pointer-events': 'none' }, S0.tiles[c.a].g);
  SFX.chaos(); await fz.hop(c.a + c.n); await S(c.find); let tries = 0;
  while (true) { const k = await tapOne(S0.tiles.filter(t => t.n >= c.a - c.n && t.n <= c.a + c.n).map(t => ({ g: t.g, k: t.n, label: T(numw(t.n)) })), { ok: c.a + c.n, pad: 56 }); tries++;
    logAttempt({ scene: 'chaos', tag: 'find', ok: k === c.a + c.n, firstTry: tries === 1 }); if (k === c.a + c.n) break; SFX.soft(); await S('gen.chaos.notThis'); }
  SFX.good(); fz.g.remove(); await S(c.fix); const kid = roadToken(S0, 'kid', c.a); tries = 0;
  while (true) { const r = await roadHops({ svg, S: S0, tok: kid }, { a: c.a, n: c.n, dir: -1 }, 'explore'); const ok = roadErr({ a: c.a, n: c.n, dir: -1 }, r.path).ok; tries++;
    logAttempt({ scene: 'chaos', tag: 'fix', ok, firstTry: tries === 1 }); if (ok) break; SFX.soft(); await S('gen.err.roadDir.01'); kid.place(c.a); }
  mark.remove(); SFX.good(); await S(c.after); };

/* ---------- التذكّر بصورة (الإتقان، الدورة الثانية): {scene:'recallPic', pic:{kind, ...}, lines} ----------
   kind: pos (مرجع وأشياء)، train (عدّ العربات من المقدّمة حتى k)، queue، lr (الطفل يرفع يده اليمنى)، robot (برنامج يُنفَّذ)، map (خطوط الإرشاد)، road (قفزات من a بعدد n) */
SCENES.recallPic = async c => { const P = c.pic; let svg;
  if (P.kind === 'pos') { svg = newStage(300, null); posPic(svg, P); await S(c.lines); return; }
  if (P.kind === 'train' || P.kind === 'queue') { svg = newStage(P.kind === 'queue' ? QH : TH, { oasis: false, ground: 0 }); const R = rowPic(svg, P.kind === 'train' ? { kind: 'train', n: P.n || 6, things: P.things || {} } : { kind: 'queue', members: P.members });
    if (P.kind === 'train') { say(...lineOf(c.lines[0]), { free: true }); const m = await rowCount(R, P.k || 3, 'f'); await S(c.lines.slice(1)); m.remove(); } else await S(c.lines); return; }
  if (P.kind === 'lr') { svg = newStage(300, null); roomBg(svg, 300, 200); kidBackAt(svg, 180, 286, { ribbon: 'R', raise: 'R', s: 1.08 }); await S(c.lines); return; }
  if (P.kind === 'robot') { svg = newStage(300, { oasis: false, ground: 0 }); const RB = rbBoard(svg, { c: 2, r: 3, dir: 0 }); say(...lineOf(c.lines[0]), { free: true }); await RB.run(P.prog); await S(c.lines.slice(1)); return; }
  if (P.kind === 'map') { svg = newStage(320, { oasis: false, ground: 0 }); const Rm = roomSideAt(svg, P.lay, { y0: 0, H: 150 }); const M = roomMapAt(svg, P.lay, { y0: 168, H: 140 });
    say(...lineOf(c.lines[0]), { free: true }); for (const it of P.lay.items) await mapGuide(svg, Rm, M, it, 1300); await S(c.lines.slice(1)); return; }
  if (P.kind === 'road') { const R = roadStage({ a: P.a }, { at: P.a }); say(...lineOf(c.lines[0]), { free: true }); await R.tok.hop(P.a + P.n, n => S(numw(n), { noGap: true, num: true })); await S(c.lines.slice(1)); return; } };
