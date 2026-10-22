/* =====================================================================
   مسار الدرس (D238، D239، D240، D246): حقيبة الدرس، والمراحل من بيانات الدرس (flow)، والتمرين باختيار الطفل،
   وفحص الإتقان لكل مفهوم بدورتين ثم تأجيل، والخروج الآمن بالاستئناف، و«كيف كان؟» في الختام
   ===================================================================== */
const PATH_MAT = () => !!(CUR && (PROG[CUR.id] || {}).path === 'mat');
const lessonOf = id => LDATA[id];
const lessonsOf = uid => (UNITS.find(u => u.id === uid) || { lessons: [] }).lessons;
function show(id) { for (const s of ['#home', '#lesson']) $(s).hidden = s !== '#' + id; for (const c of ['#exitCover']) $(c).hidden = true; if (id === 'home') { stopVoice(); REPLAY_HOOK = null; lastLine = null; } }   /* لا تُعاد في درس آخر جملةُ درس غادره الطفل (ومنها جملة فوضى) */
const progOf = id => (PROG[id] = isObj(PROG[id]) ? PROG[id] : {});

/* حقيبة الدرس (D238): هل الأشياء معك؟ «معي» أو «على الشاشة». المسار على الشاشة يوسم الدرس «مدخل» */
async function bagStage(L) {
  const P = progOf(L.id); const B = L.bag;
  if (!B || B.screenOnly) { P.path = 'screen'; saveProg(); return; }
  const svg = newStage(250, { oasisOpacity: .2 });
  B.items.forEach((r, i, a) => { const x = a.length === 1 ? 180 : 300 - i * (240 / (a.length - 1)); bagIcon(svg, r, x, 104); });
  say(...lineOf(B.ask), { free: true });
  const k = await choosePick([['mat', labelText('withMe'), PICKICON.mat], ['screen', labelText('onScreen'), PICKICON.screen]], null); hush();
  P.path = k; saveProg(); logAttempt({ scene: 'bag', tag: k, ok: true });
  await S(k === 'mat' ? 'gen.bag.mat' : 'gen.bag.screen');
}

/* صور حقيبة الدرس: مولّد بالاسم، أو رمز بسيط لما ليس شكلاً (أعواد، أغطية، رمل…) واسمه من labels الدرس */
function bagIcon(svg, r, x, y) {
  const lbl = r.label ? labelText(r.label) : ''; const g = el('g', { transform: `translate(${x} ${y})` }, svg);
  const I = { bag: () => { const b = bagAt(g, 0, 0); b.setAttribute('transform', 'scale(.62)'); },
    sticks: () => { for (const [dx, a] of [[-14, -18], [0, 0], [14, 18]]) el('rect', { x: -4, y: -44, width: 8, height: 88, rx: 4, fill: MAT.wood, transform: `translate(${dx} 0) rotate(${a})` }, g); el('circle', { cx: 26, cy: 30, r: 12, fill: '#d98c6a' }, g); },
    caps: () => { for (let i = 0; i < 5; i++) el('circle', { cx: -32 + i * 16, cy: (i % 2) * 14 - 6, r: 9, fill: ['#5c9bb0', '#d9483b', '#f2b33d', '#7e9a4e', '#6c7fa8'][i], stroke: '#fff', 'stroke-width': 2 }, g); },
    sand: () => { el('rect', { x: -52, y: -26, width: 104, height: 52, rx: 10, fill: '#c9a072' }, g); el('rect', { x: -44, y: -18, width: 88, height: 36, rx: 6, fill: '#ead9b2' }, g); },
    tape: () => { el('rect', { x: -54, y: -10, width: 108, height: 20, rx: 4, fill: '#fff4cf', stroke: '#c9a072', 'stroke-width': 2 }, g); },
    paper: () => { el('rect', { x: -32, y: -42, width: 64, height: 84, rx: 4, fill: '#ffffff', stroke: css('--line'), 'stroke-width': 3 }, g); for (let i = 0; i < 4; i++) el('line', { x1: -22, y1: -24 + i * 14, x2: 22, y2: -24 + i * 14, stroke: '#a9cbe0', 'stroke-width': 2 }, g); },
    tray: () => { el('rect', { x: -56, y: -30, width: 112, height: 60, rx: 12, fill: '#c9a072', stroke: '#fff', 'stroke-width': 3 }, g); },
    mail: () => { mailboxAt(g, 0, 10, 2).g.setAttribute('transform', 'translate(0 10) scale(.7)'); },
    cubes: () => { towerAt(g, -16, 40, 4, { size: 18, color: CUBE.lemon }); towerAt(g, 16, 40, 3, { size: 18, color: CUBE.white }); },
    cut: () => { shapeAt(g, { type: 'circle', size: 30, color: css('--circle') }, -26, -10); shapeAt(g, { type: 'square', size: 28, color: css('--square') }, 10, -14); shapeAt(g, { type: 'triangle', size: 30, color: css('--triangle') }, -8, 22); shapeAt(g, { type: 'rect', w: 34, h: 18, color: css('--rect') }, 28, 20); },
    hat: () => thingAt(g, { solid: 'cone', size: 80, color: '#6c7fa8' }, 0, 0), tube: () => thingAt(g, { solid: 'cylinder', size: 76, color: '#c9a072' }, 0, 0), box: () => thingAt(g, { solid: 'box', size: 84, color: BOXC }, 0, 0),
    stickers: () => { for (let i = 0; i < 4; i++) el('rect', { x: -30 + (i % 2) * 30, y: -24 + Math.floor(i / 2) * 26, width: 24, height: 20, rx: 3, fill: '#f6cf7e', stroke: '#c98f55', 'stroke-width': 2, transform: `rotate(${i * 7 - 10})` }, g); } };
  if (typeof r === 'object' && r.icon && I[r.icon]) I[r.icon]();
  else { const s = make(typeof r === 'object' && r.mk ? r.mk : r); fitThing(g, { ...s, label: null }, 0, 0, 84); if (!lbl) labelFit(svg, x, y + 72, s.label || BIN_NAMES[s.kind] || '', 15, css('--muted'), 112); }   /* اسم كل شيء في الحقيبة، حتى المكعب */
  if (lbl) labelFit(svg, x, y + 72, lbl, 15, css('--muted'), 112); }

async function runLesson(id, opt = {}) {
  if (TAB_LOST) { showTabLost(); return; }
  const L = LDATA[id]; CUR = L; FLOW++; colorIx = 0; streak = 0; const P = progOf(id);
  const resumeAt = opt.resume && P.resume ? Math.min(P.resume.stage, L.flow.length - 1) : 0;
  if (!opt.resume) { P.runs = (P.runs || 0) + 1; }
  reseed((KID || 'k0') + '|' + id + '|' + (P.runs || 1) + (opt.resume ? '|r' + resumeAt : '')); saveProg();
  show('lesson'); lockGo(); setSteps(L.flow.length); SCENE_NOW = 'bag'; /*T*/window.__scene = id + ':bag';/*/T*/
  if (!opt.resume) await bagStage(L);
  for (let i = resumeAt; i < L.flow.length; i++) {
    const st = L.flow[i]; setStep(i); SCENE_NOW = st.s + (st.scene ? ':' + st.scene : ''); /*T*/window.__scene = id + ':' + SCENE_NOW;/*/T*/
    P.resume = { stage: i, t: Date.now() }; saveProg();
    await runStage(L, st);
    if (st.s === 'test' && !P.mastered) { await nextBtn(); await facesAsk(L); break; }   // لم يبلغ العتبة: نشاط علاجي ومراجعة الدرس الأضعف، بلا ختام الشارة
    if (i < L.flow.length - 1 && st.s !== 'wrap') await nextBtn(labelText(L.flow[i + 1].s === 'practice' ? 'tryYou' : i === 0 ? 'letsGo' : 'next'));
  }
  setStep(L.flow.length);
  P.done = true; P.at = Date.now(); delete P.resume; if (P.path === 'screen' && !(L.bag && L.bag.screenOnly)) P.entry = true; else if (P.path === 'mat') P.entry = false;
  if (L.review && L.review.length) srsStart(id);
  if (PROG.review === id && P.done) delete PROG.review;
  if (isObj(PROG.redo) && PROG.redo[id]) delete PROG.redo[id];   /* أُعيد الدرس بعد خطأين في المراجعة */
  saveProg(); countLesson();
  await nextBtn(labelText('toMap')); showHome();
}
async function runStage(L, st) {
  if (st.mat) await SCENES.material(st.mat);                              // مسار «معي»: الأشياء الحقيقية قبل الشاشة (D238)
  if (st.scene) { const f = SCENES[st.scene]; if (!f) throw new Error('مشهد غير معروف: ' + st.scene); await f(st, L); return; }
  if (st.s === 'practice') return practiceStage(L, st);
  if (st.s === 'chaos') return chaosStage(L.chaos);
  if (st.s === 'mastery') return masteryStage(L);
  if (st.s === 'test') return testStage(L);
  if (st.s === 'wrap') return wrapStage(L);
  if (st.items) return SCENES.items(st);
  throw new Error('مرحلة بلا مشهد: ' + st.s);
}

/* التمرين: اختيار حقيقي للطفل (D239) بين «تمرين عادي» و«تحدٍّ»، ومخزونه غير مخزون الإتقان والمراجعة (D240) */
async function practiceStage(L, st) {
  const P = L.practice; const svg = newStage(250, { oasisOpacity: .25 }); compassAt(svg, 180, 120, .9);
  let k = 'normal';
  if (P.challenge && P.challenge.length) { say(...lineOf('gen.choice.ask'), { free: true });
    k = await choosePick([['normal', labelText('normal'), PICKICON.normal], ['challenge', labelText('challenge'), PICKICON.challenge]], null); hush(); logAttempt({ scene: 'choice', tag: k, ok: true }); }
  await S(P.intro || 'gen.practice.intro');
  for (const it of P[k]) await runItem(it, 'practice', { scene: 'practice' });
}

/* فحص الإتقان (D240، D233): لكل مفهوم بنوده من مولّد غير مولّد التمرين، من المحاولة الأولى بلا مساعدة.
   العتبة 3 من 3 أو 4 من 5، ودورتان على الأكثر: بينهما تذكّر وبنود علاجية بمساعدة، ثم تأجيل معلَّم إلى المراجعة.
   «المدخل» (entryOnly) يُعرض ولا يُتقَن على الشاشة (C008: يحكم الكبير ببطاقته) */
const msNeed = n => n >= 5 ? n - 1 : n;
async function masteryStage(L) {
  const M = L.mastery; const P = progOf(L.id); P.cs = isObj(P.cs) ? P.cs : {};
  newStage(250, { oasisOpacity: .2 }); await S(M.intro || 'gen.ms.intro');
  for (const [C, items] of Object.entries(M.concepts)) {
    const cs = P.cs[C] = isObj(P.cs[C]) ? P.cs[C] : {}; const entry = (M.entryOnly || []).includes(C);
    let passed = false, ok = 0, round = 0;
    for (round = 1; round <= 2; round++) {
      ok = 0; for (const it of items) { const r = await runItem(it, 'mastery', { scene: 'mastery:' + C }); if (r.firstTry) ok++; }
      if (ok >= msNeed(items.length)) { passed = true; break; }
      if (round === 1) { await S('gen.ms.again');
        if (M.recall && M.recall[C]) await SCENES.steps(M.recall[C]);
        for (const it of (M.remedial && M.remedial[C]) || []) await runItem(it, 'remedial', { scene: 'remedial:' + C });
        await S('gen.ms.round2'); }
    }
    Object.assign(cs, { ok, of: items.length, round: Math.min(round, 2), at: Date.now() });
    if (entry) { cs.entry = true; cs.appOk = passed; }
    else if (passed) { cs.mastered = true; cs.deferred = false; }
    else { cs.deferred = !cs.mastered; await S('gen.ms.later'); }
    saveProg();
  }
  if (M.mixed) { const prev = CUR; CUR = LDATA[M.mixed.lesson]; let r; try { r = await runItem(M.mixed.item, 'mastery', { scene: 'mastery:mixed' }); } finally { CUR = prev; } if (!r.firstTry && PROG.srs[M.mixed.lesson]) { srsUpdate(M.mixed.lesson, false); PROG.srs[M.mixed.lesson].due = addDays(Date.now(), 1); } }   // البند المشتبك يُحكم بإعدادات درسه
  const real = Object.keys(M.concepts).filter(C => !(M.entryOnly || []).includes(C));
  P.mastered = real.every(C => P.cs[C].mastered); P.deferred = real.some(C => P.cs[C].deferred && !P.cs[C].mastered); saveProg();
  if (P.mastered) { SFX.win(); starBurst(); await S(M.ok || 'gen.ms.ok'); }
}
/* نجمة الإتقان (D239: النجوم للإتقان والمراجعة لا لكل تمرين) */
function starBurst() { const svg = $('#stage svg'); if (!svg) return; const g = el('g', { transform: 'translate(180 110)', 'pointer-events': 'none' }, svg);
  el('path', { d: 'M0 -46 L13 -14 L46 -12 L20 9 L28 42 L0 24 L-28 42 L-20 9 L-46 -12 L-13 -14 Z', fill: '#f2b33d', stroke: '#fff', 'stroke-width': 4 }, g);
  anim(g, [{ transform: 'translate(180px,110px) scale(0) rotate(-60deg)' }, { transform: 'translate(180px,110px) scale(1.15) rotate(8deg)' }, { transform: 'translate(180px,110px) scale(1) rotate(0)' }], { duration: 800, fill: 'forwards', easing: 'ease-out' }); confetti(18); }

/* اختبار الوحدة (المبدأ 3: العتبة 85%، فالمطلوب ceil(0.85 × عدد البنود)): من المحاولة الأولى بلا مساعدة، ولا درجة تُقال للطفل (D233) */
const testNeed = n => Math.ceil(n * 0.85);
async function testStage(L) {
  const T = L.test; const P = progOf(L.id); newStage(250, { oasisOpacity: .3 });
  await S(T.intro || 'gen.test.intro');
  const order = T.keepOrder ? T.items : shuffle(T.items); let ok = 0; const wrong = [];
  for (const q of order) { const r = await runItem(q.item, 'test', { scene: 'test' }); if (r.ok) ok++; else wrong.push(q); await sleep(700); }
  P.score = ok; P.of = order.length; P.at = Date.now(); saveProg();
  logAttempt({ scene: 'test', tag: 'result', ok: ok >= testNeed(order.length), score: ok, of: order.length, wrongIds: wrong.map(q => q.id) });
  if (ok >= testNeed(order.length)) { P.mastered = true; PROG['badge:' + L.unit] = true; saveProg(); await stoneScene(L); return; }
  const cnt = {}; wrong.forEach(q => cnt[q.of] = (cnt[q.of] || 0) + 1);
  const weak = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0][0]; PROG.review = weak; saveProg();
  const svg = newStage(250, { oasisOpacity: .2 }); const sv = el('g', { transform: 'translate(108 40) scale(2)' }, svg); sv.innerHTML = stopIconInner(LDATA[weak]);
  label(svg, 180, 200, plain(LDATA[weak].title), 22);
  await S('gen.test.again'); await S(T.remedial || 'gen.test.remedial');
}
/* فوضى تضع حجر النبع في مكانه (قوس فوضى، D236)، فيجري الماء في جدول الحيّ (D230) */
async function stoneScene(L) {
  const U = UNITS.find(u => u.id === L.unit); const placed = UNITS.filter(u => PROG['badge:' + u.id]).length;
  const svg = newStage(300, { oasisOpacity: .4 }); const sp = springAt(svg, 180, 240, 1.3, { stones: placed - 1, total: 6, level: (placed - 1) / 6 });
  const fz = chaosAt(svg, 290, 120, .55); const st = el('g', { transform: 'translate(270 150) scale(.32)' }, svg); stoneArt(st, L.unit, 0, 0);
  await S(L.test.stoneLine); await anim(st, [{ transform: 'translate(270px,150px) scale(.32)' }, { transform: 'translate(180px,236px) scale(.24)' }], { duration: 1200, fill: 'forwards', easing: 'cubic-bezier(.3,1.2,.6,1)' }).done;
  SFX.win(); confetti(); sp.remove(); springAt(svg, 180, 240, 1.3, { stones: placed, total: 6, level: placed / 6 });
  await S(L.test.winLines);
}
