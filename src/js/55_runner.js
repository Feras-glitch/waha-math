/* =====================================================================
   مشغّل الدرس
   ===================================================================== */
async function runLesson(L) {
  CUR = L; show('lesson'); setStep(0); setGo('هَيَّا', null, false); colorIx = 0;
  const sc = n => window.__scene = L.id + ':' + n;
  sc('hook'); await L.hook(); await nextBtn('هَيَّا');
  setStep(1); sc('explore'); await L.explore(); await nextBtn();
  if (L.test) { await runTest(L); return; }
  setStep(2); sc('worked'); { const svg = newStage(300, { cityOpacity: .2 }); const st = {}; for (let i = 0; i < L.worked.length; i++) { await L.worked[i](svg, st); if (i < L.worked.length - 1) await nextBtn(); } }
  await nextBtn('{حَاوِلْ أَنْتَ|حَاوِلِي أَنْتِ}');
  setStep(3); sc('practice'); await say('compass', ...L.sort.intro); for (const make of L.sort.practice) await sortItem(make, L.sort, 'practice'); await nextBtn();
  setStep(4); sc('chaos'); await chaosScene(L.chaos); await nextBtn();
  setStep(5); sc('mastery'); await masteryScene(L.sort); await nextBtn();
  if (L.build) { setStep(6); sc('build'); await L.build(); await nextBtn(); }
  setStep(6); sc('wrap'); await wrapScene(L.wrap, L.wrapLines); setStep(7);
  PROG[L.id] = { ...(PROG[L.id] || {}), done: true, at: Date.now() }; if (PROG.review === L.id) delete PROG.review; saveProg(); countLesson();
  await nextBtn('خَرِيطَةُ الوَحْدَةِ'); showHome();
}
/* اختبار الوحدة: ثمانية أسئلة شفوية بصرية، من المحاولة الأولى؛ 7 من 8 = 85% (D178) */
/* يرسم شيئاً داخل مربع ثابت مهما كان حجمه الأصلي */
function fitThing(parent, s, x, y, box) {
  const w = el('g', {}, parent); const g = thingAt(w, s, 0, 0); const bb = w.getBBox();
  const k = Math.min(1.1, box / Math.max(bb.width, bb.height, 1));
  w.setAttribute('transform', `translate(${x - (bb.x + bb.width / 2) * k} ${y - (bb.y + bb.height / 2) * k}) scale(${k})`); return w; }
async function runTest(L) {
  const T = L.test;
  setStep(2); window.__test = null; window.__scene = L.id + ':test'; await say(...TEST_INTRO);
  let score = 0; const wrong = [];
  for (const [i, Q] of shuffle(T.items).entries()) { setStep(2 + Math.floor(i / 2)); window.__n = (window.__n || 0) + 1; const t0 = Date.now();
    let pickedOk;
    if (Q.choices) {                                   // سؤال «لماذا؟» بصورة وخيارات يقرؤها المرشد
      const svg = newStage(250, { city: false, ground: 0 }); fitThing(svg, Q.show(), 180, 110, 150);
      const box = document.createElement('div'); box.className = 'choices'; $('#stage').appendChild(box);
      const opts = shuffle(Q.choices); window.__test = { ans: opts.findIndex(o => o.ok), text: true };
      let answered = false;
      const pickP = gate(new Promise(res => opts.forEach(o => { const b = document.createElement('button'); b.className = 'pick'; b.textContent = G(o.t); b.dataset.id = o.id; if (TESTHOOK) b.dataset.ok = o.ok; box.appendChild(b);
        b.onclick = () => { if (answered) return; answered = true; hush(); b.classList.add(o.ok ? 'ok' : 'no'); res(o.ok); }; })));
      (async () => { await say('compass', ...Q.q); for (const b of [...box.children]) { if (answered) break; b.classList.add('reading'); const o = opts.find(r => r.id === b.dataset.id); await say('compass', o.id, o.t); b.classList.remove('reading'); } })();
      pickedOk = await pickP;
      if (!pickedOk) [...box.children].find(b => opts.find(o => o.id === b.dataset.id).ok).classList.add('ok');
    } else {
      const opts = Q.opts(); const order = shuffle([0, 1, 2]);
      const svg = newStage(250, { city: false, ground: 0 }); window.__test = { ans: order.indexOf(Q.ans) };
      const gs = order.map((oi, pos) => { const x = 300 - pos * 120; const g = fitThing(svg, opts[oi], x, 120, 100);
        g.style.cursor = 'pointer'; g.setAttribute('role', 'button'); g.setAttribute('tabindex', 0); return { g, oi, x }; });
      say('compass', ...Q.q);
      const pickedOi = await gate(new Promise(res => gs.forEach(({ g, oi }) => { g.onclick = () => res(oi); g.onkeydown = e => { if (e.key === 'Enter') res(oi); }; }))); hush();   // الإجابة تُنهي قراءة السؤال
      pickedOk = pickedOi === Q.ans;
      const right = gs.find(x => x.oi === Q.ans); el('circle', { cx: right.x, cy: 120, r: 64, fill: 'none', stroke: css('--good'), 'stroke-width': 5 }, svg);
    }
    logAttempt({ scene: 'test', tag: Q.id, ok: pickedOk, firstTry: true, ms: Date.now() - t0 }); if (pickedOk) { score++; SFX.good(); } else { SFX.soft(); wrong.push(Q); }
    await sleep(900);
  }
  PROG[L.id] = { ...(PROG[L.id] || {}), score, of: 8 }; saveProg();
  setStep(6);
  if (score >= 7) {
    PROG[L.id].done = true; PROG[L.id].at = Date.now(); PROG[L.id].mastered = true; PROG['badge:' + unitOf(L)] = true; saveProg();
    await wrapScene(async svg => { const b = T.art(svg);
        b.animate([{ transform: 'translate(150px,160px) scale(0) rotate(-90deg)' }, { transform: 'translate(150px,160px) scale(1.1) rotate(8deg)' }, { transform: 'translate(150px,160px) scale(1) rotate(0)' }], { duration: 1000, fill: 'both', easing: 'ease-out' }); },
      [['compass', ...TEST_SCORE[score]], T.badgeLine, T.winLine]);
  } else {
    PROG[L.id].done = true; PROG[L.id].at = Date.now(); saveProg();
    const cnt = {}; wrong.forEach(t => cnt[T.lessonOf[t.id]] = (cnt[T.lessonOf[t.id]] || 0) + 1);
    const weakId = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0][0]; const weakL = LESSONS.find(x => x.id === weakId);
    PROG.review = weakId; saveProg();
    const svg = newStage(250); const sv = new DOMParser().parseFromString(stopIcon(weakL), 'image/svg+xml').documentElement;
    const g = el('g', { transform: 'translate(108 50) scale(2)' }, svg); [...sv.childNodes].forEach(n => g.appendChild(document.importNode(n, true)));
    label(svg, 180, 200, plain(weakL.title), 22);
    await say('compass', ...(score >= 5 ? TEST_AGAIN_NEAR : TEST_AGAIN_LOW)); await say('compass', ...T.review[weakId]);
    logAttempt({ scene: 'test', tag: 'weak', ok: false, review: weakId, wrongIds: wrong.map(t => t.id) });
  }
  countLesson();
  await nextBtn('خَرِيطَةُ الوَحْدَةِ'); showHome();
}

