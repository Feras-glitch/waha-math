/* =====================================================================
   مشاهد «قارِن وقِس» (S1-U4): الإشعال (فوضى تفعل ولا تقول، D236؛ وفرجار في د6)، والاكتشاف، والألعاب، ومشاهد «صحّح لفوضى».
   كل مشهد يقرأ جمله من بيانات مرحلته (c.lines)، ويسجّل كل لمسة (logAttempt)، وكل انتظار له حلّ آلي (AUTO).
   ===================================================================== */
/* توقّع بلا حكم: يلمس الطفل ما يظنّه، ويُسجَّل، ثم يرى (الإشعال) */
async function predictTap(targets, q) { say(...lineOf(q), { free: true }); const k = await tapOne(targets, { ok: null, pad: 64 }); hush(); SFX.tick(); return k; }
/* حلقة «حاول مرة أخرى» لانتظار له جواب واحد في الاكتشاف: يعيد اللمس حتى الصواب، وبعد خطأين يُرى الجواب */
async function tapUntil(targets, ok, wrongLine, tag, opt = {}) { let tries = 0;
  while (true) { const k = await tapOne(targets, { ok, pad: opt.pad || 64 }); tries++; logAttempt({ scene: opt.scene || 'explore', tag, ok: k === ok, firstTry: tries === 1 });
    if (k === ok) { SFX.good(); return tries; } SFX.soft(); if (wrongLine) await S(wrongLine); if (tries >= 2 && opt.show) await opt.show(); } }
/* «كم؟» في المشهد حتى الصواب: الخيارات تُزال قبل خيارات المحاولة التالية وبعد الصواب، فلا تتراكم صفوفها تحت المسرح فتضغطه
   (الدرس 140: في «مصنع الأعمدة» تراكمت صفوف المحطات الثلاث فصار المسرح نصف حجمه). make: الخيارات؛ wrong(a): جملة الخطأ؛ err(a): وسمه في السجلّ */
async function numUntil(make, ok, opt = {}) { let t = 0, np = null;
  while (true) { if (np) np.box.remove(); np = numberPick(make(), ok, t ? {} : { intro: opt.intro }); const a = await np.p; t++;
    logAttempt({ scene: opt.scene || 'explore', tag: opt.tag, ok: a === ok, firstTry: t === 1, ...(a !== ok && opt.err ? { err: opt.err(a) } : {}) });
    if (a === ok) { SFX.good(); await sleep(FAST ? 20 : 350); np.box.remove(); return t; } SFX.soft(); if (opt.wrong) await S(opt.wrong(a)); } }

/* ---------- الدرس 1: أطول وأقصر ---------- */
/* الإشعال: قلما فرجار وفوضى على المكتب؛ تدفع فوضى قلمها (الأقصر) إلى الأمام فتبدو نهايته أبعد، ثم «من الأطول؟» توقّعاً */
SCENES.pencilHook = async c => { const svg = newStage(260, { oasis: false, ground: 0 }); el('rect', { x: -360, y: 150, width: 1080, height: 110, fill: MAT.wood, opacity: .35 }, svg);
  const fz = chaosAt(svg, 330, 176, .38); const cp = compassAt(svg, 330, 70, .38);
  const A = lenAt(svg, { kind: 'pencil', len: c.lens[0], color: NEUTRAL[3] }, 300, 78), B = lenAt(svg, { kind: 'pencil', len: c.lens[1], color: '#c0564a' }, 300, 184);
  /* التوقّع أولاً، ثم تدفع فوضى قلمها إلى الأمام (المواصفة؛ الفحص المستقل A لبوابة S1-U4: كان الدفع قبل التوقّع) */
  const k = await predictTap([{ g: A.g, k: 'compass', label: labelText('pencilCompass') }, { g: B.g, k: 'chaos', label: labelText('pencilChaos') }], c.lines[0]);
  logAttempt({ scene: 'hook', tag: 'predictLen', ok: k === (c.lens[0] > c.lens[1] ? 'compass' : 'chaos') });
  await chaosGiggle(fz); await alignTo(B, 300 - (c.push || 70), 1100); SFX.chaos(); await S(c.lines.slice(1)); };
/* الاكتشاف: يحاذي الطفل الشريطين عند خط البداية ثم يحكم؛ ثم يتحرّك شريطٌ ولا يتغيّر طوله (حفظ الطول، فابل B) */
SCENES.alignExplore = async c => { const svg = newStage(270, { oasis: false, ground: 0 }); startLineAt(svg, 30, 236);
  const A = lenAt(svg, { kind: 'strip', len: c.lens[0], color: NEUTRAL[0] }, MS_X, 86), B = lenAt(svg, { kind: 'strip', len: c.lens[1], color: NEUTRAL[3] }, MS_X - c.shift, 170);
  const T = [{ o: B, label: labelText('stripMove') }];
  say(...lineOf(c.lines[0]), { free: true }); if (firstTime('alignStrip')) await ghostHand(svg, [[MS_X - c.shift - 40, 170], [MS_X - 30, 170]], 900);
  await gate(new Promise(res => { const dz = dragAlign(svg, T, { onAlign: () => { dz.off(); AUTO_CLEAR(); res(); } }); alignBar(dz, { read: false });
    AUTO({ kind: 'align', ok: () => T[0].align() }); armIdle(async () => { await S(c.lines[1], { aside: true }); await T[0].align(); }); }));
  /* وبعد انتهاء الانتظار يُزال الصفّ المخفيّ (يُخفى وسطه فلا يقفز الرسم تحت الإصبع، الفحص المستقل B)، ثم مهلة قبل الانتظار التالي (الفحص المستقل C2: بقي فصغُر المسرح) */
  disarmIdle(); document.querySelectorAll('#stage .choices').forEach(b => b.remove()); hush(); logAttempt({ scene: 'explore', tag: 'align', ok: true }); await sleep(250);
  say(...lineOf(c.lines[2]), { free: true });
  const longer = c.lens[0] > c.lens[1] ? 'A' : 'B';
  await tapUntil([{ g: A.g, k: 'A', label: labelText('stripTop') }, { g: B.g, k: 'B', label: labelText('stripBottom') }], longer, c.lines[3], 'compareAligned', { show: async () => { const m = endLines(svg, [{ o: A }, { o: B }]); await sleep(1500); m.remove(); } }); hush();
  await S(c.lines[4]);
  /* حفظ الطول: نحرّك الشريط ثم نعيده؛ «هل تغيّر طوله؟» */
  say(...lineOf(c.lines[5]), { free: true }); await alignTo(B, MS_X - 90, 900); await sleep(300);
  const k = await choosePick([['same', labelText('lenSame'), PICKICON.same, 'gen.opt.lenSame'], ['changed', labelText('lenChanged'), PICKICON.changed, 'gen.opt.lenChanged']], 'same'); logAttempt({ scene: 'explore', tag: 'conserve', ok: k === 'same' });
  await alignTo(B, MS_X, 700); await S(k === 'same' ? c.lines[6] : c.lines[7]); };
/* لعبة «سباق الديدان»: في كل جولة ديدان تزحف إلى أماكن مختلفة؛ يحاذي الطفل أذيالها عند خط البداية ثم يلمس الأطول أو الأقصر */
SCENES.wormRace = async c => { if (c.intro) await S(c.intro);
  for (const [i, rd] of c.rounds.entries()) { const svg = newStage(270, { oasis: false, ground: 0 }); el('rect', { x: -360, y: 0, width: 1080, height: 270, fill: '#c9b48a', opacity: .25 }, svg); startLineAt(svg, 24, 250);
    const ys = LEN_ROWS(rd.lens.length); const cols = ['#e98aa0', '#d9a441', '#9cb86a', '#8ab6d6'];
    const T = rd.lens.map((len, j) => ({ o: lenAt(svg, { kind: 'worm', len, color: cols[j] }, 380 + j * 30, ys[j]), k: j, label: labelText('wormOne') }));
    await Promise.all(T.map((t, j) => tween(1000 + j * 200, q => t.o.setX(380 + j * 30 + (MS_X - rd.shift[j] - 380 - j * 30) * easeIO(q)))));
    const dz = dragAlign(svg, T); const ab = alignBar(dz, { read: i === 0 }); const want = lenWant(rd.lens, rd.ask);
    say(...lineOf(rd.q), { free: true }); if (i === 0) ab.read([lineOf(rd.q)]);
    let tries = 0; while (true) { const k = await tapOne(T.map(t => ({ g: t.o.g, k: t.k, label: t.label })), { ok: want, pad: 56 }); hush(); tries++;
      const aligned = T.every(t => Math.abs(t.o.x0 - MS_X) < .5); logAttempt({ scene: 'game', tag: 'worm' + i, ok: k === want, firstTry: tries === 1, err: k === want ? null : (aligned ? 'lenWrong' : 'fromEnd') });
      if (k === want) break; SFX.soft(); await S(aligned ? 'gen.err.lenWrong.01' : 'gen.err.fromEnd.01'); if (tries >= 2) { await dz.all(); const m = endLines(svg, T); await sleep(1200); m.remove(); } }
    /* الفائزة تجري ورأسها داخل المسرح، ثم الحلقة حولها حيث وقفت (الفحص المستقل E2: كانت الحلقة على الذيل وفراغ، والرأس خارج الحافّة) */
    dz.off(); ab.bar.remove(); SFX.good(); const run = Math.max(0, Math.min(120, MS_X - rd.lens[want] - 16));
    await tween(900, q => T[want].o.setX(MS_X - q * run)); okRing(svg, T[want].o.g); await S(rd.ok || 'gen.worm.win'); }
  if (c.after) await S(c.after); };
/* «صحّح لفوضى»: علّمت فوضى بنجمة الشريط الذي نهايته أبعد، وبدايته متأخرة عن الخط؛ يجده الطفل، ثم يحاذي وينقل النجمة إلى الأطول */
function starMark(svg, x, y) { const g = el('g', { transform: `translate(${x} ${y})`, 'pointer-events': 'none' }, svg); el('path', { d: 'M0 -14 L4 -4 L15 -4 L6 3 L9 14 L0 7 L-9 14 L-6 3 L-15 -4 L-4 -4 Z', fill: '#f2b33d', stroke: '#c98f55', 'stroke-width': 1.5 }, g); return g; }
SCENES.chaosEnds = async c => { const svg = newStage(270, { oasis: false, ground: 0 }); startLineAt(svg, 30, 236);
  const A = lenAt(svg, { kind: 'strip', len: c.lens[0], color: NEUTRAL[0] }, MS_X, 96), B = lenAt(svg, { kind: 'strip', len: c.lens[1], color: NEUTRAL[3] }, MS_X - c.shift, 170);
  const star = starMark(svg, B.end() - 18, 170); const fz = chaosAt(svg, 40, 40, .4); await chaosGiggle(fz); await S(c.find);
  let tries = 0; while (true) { const k = await tapOne([{ g: A.g, k: 'A', label: labelText('stripTop') }, { g: B.g, k: 'B', label: labelText('stripBottom') }], { ok: 'B', pad: 56 }); tries++;
    logAttempt({ scene: 'chaos', tag: 'find', ok: k === 'B', firstTry: tries === 1 }); if (k === 'B') break; SFX.soft(); await S('gen.chaos.no'); }
  SFX.good(); fz.remove(); await S(c.fix);
  const T = [{ o: B, label: labelText('stripMove') }];
  await gate(new Promise(res => { const dz = dragAlign(svg, T, { onAlign: () => { dz.off(); AUTO_CLEAR(); res(); } }); alignBar(dz, { read: false }); AUTO({ kind: 'align', ok: () => T[0].align() }); }));
  document.querySelectorAll('#stage .choices').forEach(b => b.remove()); await sleep(250); star.setAttribute('transform', `translate(${B.end() - 18} 170)`);
  await S(c.ask); const longer = c.lens[0] > c.lens[1] ? 'A' : 'B';
  await tapUntil([{ g: A.g, k: 'A', label: labelText('stripTop') }, { g: B.g, k: 'B', label: labelText('stripBottom') }], longer, 'gen.err.lenWrong.01', 'chaosFix', { scene: 'chaos' });
  const L = longer === 'A' ? A : B; await anim(star, [{ transform: star.getAttribute('transform') }, { transform: `translate(${L.end() - 18}px,${L.y}px)` }], { duration: 700, fill: 'forwards' }).done; if (c.after) await S(c.after); };

/* ---------- الدرس 2: أكبر وأصغر، أثقل وأخف ---------- */
/* الإشعال: فوضى ترفع الكرة الكبيرة بإصبع وتعجز عن الحجر الصغير؛ «أيّهما أثقل؟» توقّعاً */
SCENES.ballStoneHook = async c => { const svg = newStage(280, { oasis: false, ground: 14 }); const ball = weighAt(svg, 'beachBall', 250, 266, 1.2), stone = weighAt(svg, 'stone', 100, 266, 1);
  const fz = chaosAt(svg, 250, 150, .42); await chaosGiggle(fz);
  /* التوقّع أولاً، ثم ترفع فوضى الكرة بسهولة ولا ترفع الحجر (المواصفة؛ الفحص المستقل A لبوابة S1-U4: كان الدليل قبل التوقّع)؛
     ومع تقليل الحركة صورتان ثابتتان: الكرة مرفوعة لحظة، ثم الحجر وعلامات الجهد (الفحص المستقل B: لم يُرَ شيء والجملة تقول «رفعت») */
  const k = await predictTap([{ g: ball, k: 'beachBall', label: labelText('w.beachBall') }, { g: stone, k: 'stone', label: labelText('w.stone') }], c.lines[0]);
  logAttempt({ scene: 'hook', tag: 'predictWeight', ok: k === 'stone' });
  if (RM) { ball.setAttribute('transform', 'translate(250 206) scale(1.2)'); await sleep(1100); ball.setAttribute('transform', 'translate(250 266) scale(1.2)'); fz.setAttribute('transform', 'translate(110 210)');
    const ef = el('g', { 'pointer-events': 'none' }, svg); for (const [x1, y1, x2, y2] of [[78, 236, 70, 224], [100, 228, 100, 214], [122, 236, 130, 224]]) el('line', { x1, y1, x2, y2, stroke: css('--chaos'), 'stroke-width': 3, 'stroke-linecap': 'round' }, ef);
    await sleep(1100); ef.remove(); await chaosGiggle(fz); }
  else {
  await anim(ball, [{ transform: 'translate(250px,266px) scale(1.2)' }, { transform: 'translate(250px,206px) scale(1.2)' }, { transform: 'translate(250px,266px) scale(1.2)' }, { transform: 'translate(250px,226px) scale(1.2)' }, { transform: 'translate(250px,266px) scale(1.2)' }], { duration: 1400 }).done;
  await anim(fz, [{ transform: 'translate(250px,150px)' }, { transform: 'translate(110px,210px)' }], { duration: 800, fill: 'forwards' }).done; fz.setAttribute('transform', 'translate(110 210)');
  await anim(stone, [{ transform: 'translate(100px,266px)' }, { transform: 'translate(97px,266px) rotate(-4deg)' }, { transform: 'translate(103px,266px) rotate(4deg)' }, { transform: 'translate(100px,266px)' }], { duration: 400, iterations: 3 }).done; await chaosGiggle(fz);
  }
  await S(c.lines.slice(1)); };
/* الاكتشاف (ب): الطفل يضع الشيئين في الكفّتين فيميل الميزان، ويلمس الأثقل؛ ثم زوج «الأكبر ليس دائماً الأثقل» */
SCENES.balanceLab = async c => { for (const [i, pr] of c.pairs.entries()) { const svg = newStage(290, { oasis: false, ground: 14 }); const B = balanceAt(svg, 180, 276);
    const P = weighShelf(svg, pr);
    say(...lineOf(c.lines[i * 3]), { free: true });
    await gate(shelfPut(B, P));
    await B.to(tiltOf(B.pans.R.k, B.pans.L.k), 1300); say(...lineOf(c.lines[i * 3 + 1]), { free: true });
    const h = heavier(pr[0], pr[1]); await tapUntil(['R', 'L'].map(s => ({ g: B.pans[s].bowl, k: B.pans[s].k, label: labelText('w.' + B.pans[s].k) })), h, 'gen.err.panUp.01', 'weighLab' + i); hush();
    await S(c.lines[i * 3 + 2]); }
  if (c.after) await S(c.after); };
/* لعبة «ميزان الحديقة»: يتوقّع الطفل الأثقل، ثم يضعهما الميزان ويُرى */
SCENES.gardenBalance = async c => { if (c.intro) await S(c.intro); let hits = 0;
  for (const [i, pr] of c.rounds.entries()) { const svg = newStage(290, { oasis: false, ground: 14 }); el('rect', { x: -360, y: 0, width: 1080, height: 276, fill: '#cfe0c3', opacity: .35 }, svg); const B = balanceAt(svg, 180, 276);
    const P = weighShelf(svg, pr);
    const k = await predictTap(P.map(p => ({ g: p.g, k: p.k, label: labelText('w.' + p.k) })), i === 0 ? c.q : 'gen.garden.again' + WEIGH_G(pr[0], pr[1]));   /* «وَهَاتَانِ» لشيئين مؤنثين (الفحص المستقل E1 (6)) */
    const h = heavier(pr[0], pr[1]); logAttempt({ scene: 'game', tag: 'garden' + i, ok: k === h, firstTry: true }); if (k === h) hits++;
    P.forEach(p => p.g.remove()); P.shelf.remove(); B.put('R', pr[0]); B.put('L', pr[1]); await B.to(tiltOf(pr[0], pr[1]), 1300);
    okRing(svg, B.pans[B.pans.R.k === h ? 'R' : 'L'].bowl, 4); await S(k === h ? 'gen.garden.right' : 'gen.garden.scale'); await sleep(400); }
  await S(c.after); };
/* «صحّح لفوضى»: علّقت فوضى وسام «الأثقل» على الكرة الكبيرة؛ يجدها الطفل، ثم يجرّب بالميزان وينقل الوسام */
function medalAt(svg, x, y) { const g = el('g', { transform: `translate(${x} ${y})`, 'pointer-events': 'none' }, svg); el('path', { d: 'M-8 -30 L0 -14 L8 -30', fill: 'none', stroke: '#c94f3d', 'stroke-width': 5 }, g); el('circle', { cx: 0, cy: -6, r: 11, fill: '#f2b33d', stroke: '#c98f55', 'stroke-width': 2 }, g); return g; }
SCENES.chaosHeavyBadge = async c => { const svg = newStage(290, { oasis: false, ground: 14 }); const big = weighAt(svg, c.big, 260, 276, 1), small = weighAt(svg, c.small, 100, 276, 1);
  const md = medalAt(svg, 260, 276 + big.getBBox().y - 4); const fz = chaosAt(svg, 40, 50, .4); await chaosGiggle(fz); await S(c.find);
  let tries = 0; while (true) { const k = await tapOne([{ g: big, k: 'big', label: labelText('w.' + c.big) }, { g: small, k: 'small', label: labelText('w.' + c.small) }], { ok: 'big', pad: 64 }); tries++;
    logAttempt({ scene: 'chaos', tag: 'find', ok: k === 'big', firstTry: tries === 1 }); if (k === 'big') break; SFX.soft(); await S('gen.chaos.no'); }
  SFX.good(); fz.remove(); big.remove(); small.remove(); md.remove(); const B = balanceAt(svg, 180, 276);
  const P = weighShelf(svg, [c.big, c.small]); say(...lineOf(c.fix), { free: true });
  await gate(shelfPut(B, P));
  await B.to(tiltOf(c.big, c.small), 1300); await S(c.ask);
  await tapUntil(['R', 'L'].map(s => ({ g: B.pans[s].bowl, k: B.pans[s].k, label: labelText('w.' + B.pans[s].k) })), c.small, 'gen.err.panUp.01', 'chaosFix', { scene: 'chaos' });
  const S0 = B.pans.R.k === c.small ? B.pans.R : B.pans.L; medalAt(S0.bowl, 0, -4).setAttribute('transform', 'translate(0 -40)'); if (c.after) await S(c.after); };

/* ---------- الدرس 3: أقيس بالمكعبات والمشابك والأشبار ---------- */
/* علامات عدّ فوضى (لا رقم مكتوب قبل N003؛ وفي فوضى علامات دائماً) */
function tallyAt(svg, x, y, n) { const g = el('g', { 'pointer-events': 'none' }, svg); el('rect', { x: x - 34, y: y - 20, width: 68, height: 40, rx: 8, fill: '#fffdf6', stroke: css('--chaos'), 'stroke-width': 2.5 }, g);
  for (let i = 0; i < n; i++) { const cx = x + 22 - (i % 5) * 9 - Math.floor(i / 5) * 4; el('line', { x1: cx, y1: y - 11 + Math.floor(i / 5) * 0, x2: cx, y2: y + 11, stroke: css('--chaos'), 'stroke-width': 3, 'stroke-linecap': 'round' }, g); } return g; }
/* الإشعال: فوضى تضع ثلاثة مشابك بينها فراغات على القلم، وعلاماتها ثلاث */
SCENES.gapsHook = async c => { const svg = newStage(250, { oasis: false, ground: 0 }); const L = c.n * MU; const pen = lenAt(svg, { kind: 'pencil', len: L, color: NEUTRAL[3] }, MS_X, 100);
  const fz = chaosAt(svg, 300, 40, .38); await chaosGiggle(fz); const U = unitRow(svg, 'clip', c.gaps, MS_X, UNIT_Y, { gap: (L - c.gaps * MU) / Math.max(1, c.gaps - 1) });
  for (const u of U) { u.g.setAttribute('opacity', 0); await anim(u.g, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards' }).done; SFX.pop(); }
  tallyAt(svg, 60, 40, c.gaps); await chaosGiggle(fz);
  say(...lineOf(c.lines[0]), { free: true }); const k = await choosePick([['yes', labelText('yes'), PICKICON.yes, 'gen.opt.yes'], ['no', labelText('no'), PICKICON.no, 'gen.opt.no']], null);
  logAttempt({ scene: 'hook', tag: 'gapsPredict', ok: k === 'no' }); await S(c.lines.slice(1)); };
/* الاكتشاف (أ): يضع الطفل المشابك من بداية القلم بلا فراغ حتى نهايته، ثم يعدّها؛ ثم المكعبات (أطول، فعددها أقل) */
SCENES.clipLay = async c => { for (const [i, unit] of ['clip', 'cube'].entries()) { const svg = newStage(250, { oasis: false, ground: 0 }); const u = UNIT_U[unit], n = c.n[i], L = c.len;
    lenAt(svg, { kind: 'pencil', len: L, color: NEUTRAL[3] }, MS_X, 100); startMark(svg, MS_X, 100, 50); const rowG = el('g', {}, svg); let laid = 0;
    const draw = () => { rowG.innerHTML = ''; unitRow(rowG, unit, laid, MS_X, UNIT_Y); };
    const tb = toolBar([['plus', 'addUnit', unit === 'cube' ? TOOL_IC.cube : TOOL_IC.clip, unit === 'cube' ? 'gen.opt.addCube' : 'gen.opt.addClip']]);
    await S(c.lines[i * 4]); tb.read([lineOf(c.lines[i * 4])]);
    await gate(new Promise(res => { tb.b.plus.onclick = () => { if (laid >= n) return; laid++; draw(); SFX.pop(); hush(); if (laid === n) { AUTO_CLEAR(); res(); } }; AUTO({ kind: 'layAll', ok: () => { while (laid < n) tb.b.plus.click(); } }); }));
    tb.bar.remove(); logAttempt({ scene: 'explore', tag: 'lay-' + unit, ok: true }); await S(c.lines[i * 4 + 1]);
    const U = unitRow(el('g', {}, svg), unit, n, MS_X, UNIT_Y); rowG.remove(); await rowTapCount(svg, U, { label: 'countUnits' });
    await S(c.lines[i * 4 + 2]); await numUntil(() => nearNums(n, 10, 1), n, { tag: 'count-' + unit, wrong: () => 'gen.err.lastNumber.01' });
    await S(c.lines[i * 4 + 3]); }
  if (c.after) await S(c.after); };
/* الاكتشاف (ب): فوضى وفرجار يقيسان الطاولة نفسها بشبريهما: ستة وخمسة؛ «شبر مَن أطول؟» (C017، المعنى الثاني) */
SCENES.spansTable = async c => { const svg = newStage(300, { oasis: false, ground: 0 }); const rows = [{ who: 'chaos', n: c.b, y: 128, col: '#c8392d' }, { who: 'compass', n: c.a, y: 268, col: '#3d7cc0' }];
  const R = rows.map(r => { const s = SPAN_L / r.n; tableAt(svg, MS_X - SPAN_L / 2, r.y, { w: SPAN_L, h: 60 }); const top = r.y - 60; const wg = el('g', {}, svg); (r.who === 'compass' ? compassAt : chaosAt)(wg, MS_X + 20, top - 46, .34); return { ...r, s, top, wg }; });
  for (const [i, r] of R.entries()) { await S(c.lines[i]); const hand = el('g', {}, svg); let k = 0;
    for (let j = 0; j < r.n; j++) { hand.innerHTML = ''; handSpanAt(hand, MS_X - j * r.s, r.top, r.s, r.col); spanArcs(svg, 1, r.s, MS_X - j * r.s, r.top, r.col); k++; SFX.tick(); await S(numw(k), { noGap: true, num: true }); await sleep(250); }
    hand.innerHTML = ''; r.hand = el('g', { 'data-who': r.who }, svg); handSpanAt(r.hand, MS_X, r.top, r.s, r.col); r.hand.appendChild(r.wg); }
  say(...lineOf(c.lines[2]), { free: true }); const want = c.a < c.b ? 'compass' : 'chaos';
  await tapUntil(R.map(r => ({ g: r.hand, k: r.who, label: labelText(r.who === 'compass' ? 'spanCompass' : 'spanChaos') })), want, c.lines[3], 'spanLonger', { show: async () => { const m = el('g', { 'pointer-events': 'none' }, svg); spanPanel(m, R); await sleep(1600); m.remove(); } }); hush();
  await S(c.lines.slice(4)); };
/* «صحّح لفوضى»: قاست فوضى القلم بمشابك تبدأ من وسطه؛ يجد الطفل البداية الفارغة، فيحاذي الصفّ ويعدّ */
SCENES.chaosStartMid = async c => { const svg = newStage(250, { oasis: false, ground: 0 }); const L = c.n * MU; lenAt(svg, { kind: 'pencil', len: L, color: NEUTRAL[3] }, MS_X, 100); startMark(svg, MS_X, 100, 50);
  const row = el('g', {}, svg); unitRow(row, 'clip', c.n - c.from, MS_X - c.from * MU, UNIT_Y); const fz = chaosAt(svg, 40, 40, .4); await chaosGiggle(fz); tallyAt(svg, 300, 40, c.n - c.from); await S(c.find);
  const gapG = el('g', {}, svg); el('rect', { x: MS_X - c.from * MU, y: UNIT_Y - 16, width: c.from * MU, height: 32, fill: 'transparent', 'pointer-events': 'all' }, gapG);
  let tries = 0; while (true) { const k = await tapOne([{ g: gapG, k: 'gap', label: labelText('emptyStart') }, { g: row, k: 'row', label: labelText('clipsRow') }], { ok: 'gap', pad: 56 }); tries++;
    logAttempt({ scene: 'chaos', tag: 'find', ok: k === 'gap', firstTry: tries === 1 }); if (k === 'gap') break; SFX.soft(); await S('gen.chaos.no'); }
  SFX.good(); fz.remove(); gapG.remove(); el('rect', { x: MS_X - c.from * MU, y: UNIT_Y - 14, width: c.from * MU, height: 28, rx: 4, fill: css('--chaos'), opacity: .2, 'pointer-events': 'none' }, svg);
  await S(c.fix); const tb = toolBar([['plus', 'addUnit', TOOL_IC.clip, 'gen.opt.addClip']]); tb.read([lineOf(c.fix)]); let laid = 0; const add = el('g', {}, svg);
  await gate(new Promise(res => { tb.b.plus.onclick = () => { if (laid >= c.from) return; laid++; add.innerHTML = ''; unitRow(add, 'clip', laid, MS_X, UNIT_Y); SFX.pop(); hush(); if (laid === c.from) { AUTO_CLEAR(); res(); } }; AUTO({ kind: 'layAll', ok: () => { while (laid < c.from) tb.b.plus.click(); } }); }));
  tb.bar.remove(); row.remove(); add.remove(); const U = unitRow(svg, 'clip', c.n, MS_X, UNIT_Y); await S(c.count); await rowTapCount(svg, U, { label: 'countUnits' }); if (c.after) await S(c.after); };

/* ---------- الدرس 4: مقاول القياسات ---------- */
/* الإشعال: فوضى تقيس الطاولة بمكعبات كبيرة وصغيرة معاً، وعلاماتها ثمانٍ؛ «هل كل المكعبات متساوية؟» */
SCENES.mixedHook = async c => { const svg = newStage(260, { oasis: false, ground: 0 }); const L = 280; tableAt(svg, MS_X - L / 2, 210, { w: L, h: 70 });
  const sizes = []; let s = 0; for (let i = 0; s < L - 2; i++) { const u = i % 3 === 1 ? 52 : 28; if (s + u > L + 2) break; sizes.push(u); s += u; }
  const fz = chaosAt(svg, 320, 50, .38); await chaosGiggle(fz); const U = unitRow(svg, 'cube', sizes.length, MS_X, 140 - 26, { sizes });
  for (const u of U) { u.g.setAttribute('opacity', 0); await anim(u.g, [{ opacity: 0 }, { opacity: 1 }], { duration: 220, fill: 'forwards' }).done; SFX.pop(); } tallyAt(svg, 60, 40, sizes.length); await chaosGiggle(fz);
  say(...lineOf(c.lines[0]), { free: true }); const k = await choosePick([['yes', labelText('yes'), PICKICON.yes, 'gen.opt.yes'], ['no', labelText('no'), PICKICON.no, 'gen.opt.no']], null);
  logAttempt({ scene: 'hook', tag: 'mixPredict', ok: k === 'no' }); await S(c.lines.slice(1)); };
/* لوحة المقاول (D001، مقطع مدمج): لكل شيء يحاذي الطفل الشبر ببدايته ويختار سلّته، ثم يبني عموداً من مربعات لكل سلّة، ثم يقرأ اللوحة */
SCENES.contractorBoard = async c => { const got = { short: 0, same: 0, long: 0 }; await S(c.lines[0]);
  for (const [i, [k, len]] of c.house.entries()) { const svg = newStage(250, { oasis: false, ground: 0 }); startLineAt(svg, 30, 222); houseAt(svg, k, len, MS_X, 176); const sp = spanTool(svg, MS_X - 50 - (i % 3) * 20, 92);
    const dz = dragAlign(svg, [{ o: sp, label: labelText('spanTool') }], { tap: true }); if (i === 0) say(...lineOf(c.lines[1]), { free: true }); else say(...lineOf('gen.board.next'), { free: true });
    const want = spanCat(len); let t = 0; while (true) { const ans = await choosePick(CAT_OPTS(), want); t++; logAttempt({ scene: 'explore', tag: 'ssort' + i, ok: ans === want, firstTry: t === 1 }); if (ans === want) break;
      SFX.soft(); await S(Math.abs(sp.x0 - MS_X) < .5 ? 'gen.err.ssortWrong.01' : 'gen.err.ssortAlign.01'); await dz.all(); }
    dz.off(); got[want]++; SFX.good(); await sleep(250); }
  if (c.trans) await transTap(c);
  /* الأعمدة: مربع لكل شيء، من خط واحد */
  const cats = ['short', 'same', 'long'], counts = cats.map(k => got[k]); const svg = newStage(300, { oasis: false, ground: 0 }); basketsRow(svg, cats, counts, 54);
  const Bd = barBoardAt(svg, cats, [0, 0, 0], { baseY: 250, cell: 20, iconS: .55 }); await S(c.lines[2]);
  for (const [i, col] of Bd.cols.entries()) { for (let j = 0; j < counts[i]; j++) { col.add(); SFX.pop(); await S(numw(j + 1), { noGap: true, num: true }); } await sleep(300); }
  /* القراءة: أيّ عمود أطول؟ ثم «كم أكثر؟» بالمقابلة، ثم «كم قسنا كلها؟» */
  say(...lineOf(c.lines[3]), { free: true }); const most = cats[counts.indexOf(Math.max(...counts))];
  await tapUntil(Bd.cols.map(cc => ({ g: cc.g, k: cc.k, label: labelText('barCol') })), most, 'gen.err.barWrong.01', 'boardMost', { pad: 76 }); hush();
  await S(c.lines[4]); const hi = Bd.cols[counts.indexOf(Math.max(...counts))], lo = Bd.cols[counts.indexOf(Math.min(...counts))]; await pairCols(svg, hi, lo);
  await S(c.lines[5]); const more = hi.cells.length - lo.cells.length; await numUntil(() => nearNums(more, 10), more, { tag: 'boardMore', wrong: () => 'gen.err.moreDiff.01' });
  await S(c.lines[6]); const tot = counts.reduce((a, b) => a + b, 0); await numUntil(() => nearNums(tot, 10), tot, { tag: 'boardTotal', wrong: () => 'gen.err.totalPart.01' });
  await S(c.lines.slice(7)); };
/* الشبر يقارن شيئين لم يتجاورا (التعدّي، مراجعة فابل B): شيئان من سلّتين مختلفتين، كلٌّ في سلّته برسمٍ صغير بالحجم نفسه (رمزٌ في السلّة لا قياس،
   فلا يدلّ الرسم على الأطول)، والشبر فوقهما؛ «أيّهما أطول؟» يُعرف من السلّتين، ثم الجملة: أطول من الشبر، والشبر أطول من الآخر. وبعد خطأين حلقةٌ على الأطول */
/* الأطول في التعدّي على اللوحة من الطولين كالبند (الفحص المستقل D1: كان باسم السلّة)، ويفحصه TRANSW (الفحص المستقل E1 (14)) */
const transLong = c => { const L = Object.fromEntries(c.house), [a, b] = c.trans.pair; return ITEM.transPick.make({ a, la: L[a], b, lb: L[b], ask: 'longer' }).want; };
async function transTap(c) { const L = Object.fromEntries(c.house), [a, b] = c.trans.pair, long = transLong(c); const svg = newStage(250, { oasis: false, ground: 0 });
  spanBadge(svg, 180, 62);   /* رمز الشبر لا الشبر بطوله فوق رسمين بطول واحد (الفحص المستقل C1 لبوابة S1-U4)؛ وداخل المسرح (الفحص المستقل B: قُصّت اليد عند y=46) */
  const T = [[a, 266], [b, 94]].map(([k, x]) => { const g = el('g', { 'data-trans': k }, svg); el('rect', { x: x - 72, y: 104, width: 144, height: 132, rx: 14, fill: css('--paper'), stroke: css('--basket-dk'), 'stroke-width': 2.5 }, g);
    catIconAt(g, spanCat(L[k]), x, 142, .9); houseAt(g, k, 84, x + 42, 208); return { g, k, label: labelText('h.' + k) }; });
  say(...lineOf(c.trans.lines[0]), { free: true });
  await tapUntil(T, long, 'gen.err.transWrong.01', 'transTap', { pad: 76, show: async () => okRing(svg, T.find(t => t.k === long).g, 4) }); hush();
  await S(c.trans.lines.slice(1)); }
/* «صحّح لفوضى»: رسمت فوضى مربعات عمودٍ أكبر فبدا أطول وفيه أشياء أقل؛ يجده الطفل فيصغّرها، ثم يعيد الحكم */
SCENES.chaosBars = async c => { const svg = newStage(300, { oasis: false, ground: 0 }); basketsRow(svg, c.cats, c.counts, 54); const big = c.big;
  const Bd = barBoardAt(svg, c.cats, c.counts, { baseY: 250, cell: 20, iconS: .55, sizes: c.cats.map((k, i) => i === big ? Array(c.counts[i]).fill(34) : null) });
  const fz = chaosAt(svg, 40, 40, .4); await chaosGiggle(fz); await S(c.find);
  let tries = 0; while (true) { const k = await tapOne(Bd.cols.map((cc, i) => ({ g: cc.g, k: i, label: labelText('barCol') })), { ok: big, pad: 76 }); tries++;
    logAttempt({ scene: 'chaos', tag: 'find', ok: k === big, firstTry: tries === 1 }); if (k === big) break; SFX.soft(); await S('gen.chaos.no'); }
  SFX.good(); fz.remove(); await S(c.fix);
  const fix = toolBar([['fix', 'sameSquares', TOOL_IC.cube, 'gen.opt.sameSquares']]); fix.read([lineOf(c.fix)]);
  await gate(new Promise(res => { fix.b.fix.onclick = () => { AUTO_CLEAR(); fix.bar.remove(); hush(); res(); }; AUTO({ kind: 'tap', ok: () => fix.b.fix.click() }); }));
  const col = Bd.cols[big]; const n = col.cells.length; while (col.cells.length) col.pop(); col.sizes = null; for (let j = 0; j < n; j++) { col.add(); await sleep(120); } SFX.good();
  await S(c.ask); const most = c.counts.indexOf(Math.max(...c.counts)); await tapUntil(Bd.cols.map((cc, i) => ({ g: cc.g, k: i, label: labelText('barCol') })), most, 'gen.err.barWrong.01', 'chaosFix', { scene: 'chaos', pad: 76 }); if (c.after) await S(c.after); };

/* ---------- الدرس 5: عشرة وآحاد (N010) ---------- */
/* الإشعال: فوضى ترصف مكعبات منفردة على السجادة وتعلّم بعلامات، ثم تتبعثر العلامات فتضيع */
SCENES.rugHook = async c => { const svg = newStage(260, { oasis: false, ground: 0 }); houseAt(svg, 'rug', 300, 330, 200); const fz = chaosAt(svg, 330, 60, .38); await chaosGiggle(fz);
  const cubes = []; for (let i = 0; i < c.n; i++) { const g = oneAt(svg, 318 - i * 22, 186, { c: 18 }); cubes.push(g); SFX.pop(); await sleep(FAST ? 10 : 160); }
  const t = tallyAt(svg, 60, 40, Math.min(10, c.n)); await sleep(400); await anim(t, [{ transform: 'rotate(0deg)', opacity: 1 }, { transform: 'translate(20px,60px) rotate(30deg)', opacity: 0 }], { duration: 900, fill: 'forwards' }).done;
  for (const [x, y] of [[90, 60], [120, 40], [150, 70]]) { const q = el('g', { transform: `translate(${x} ${y})`, 'pointer-events': 'none' }, svg); el('circle', { r: 14, fill: css('--think') }, q); el('text', { y: 6, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: '#fff', 'font-family': css('--f') }, q).textContent = '؟'; }
  await chaosGiggle(fz); await S(c.lines); };
/* الاكتشاف: يلمس الطفل المكعبات فتدخل عمود العشرة واحداً واحداً، فيُغلق عند العشرة؛ وما بقي منفرد. «عشرة وثلاثة: ثلاثة عشر» */
SCENES.rodMaker = async c => { const svg = newStage(270, { oasis: false, ground: 0 }); const n = c.n; const slot = el('g', {}, svg);
  el('rect', { x: 96 - TEN_C / 2 - 5, y: 236 - 10 * TEN_C - 3, width: TEN_C + 10, height: 10 * TEN_C + 6, rx: 4, fill: 'none', stroke: css('--line'), 'stroke-width': 2.5, 'stroke-dasharray': '5 4' }, slot);
  /* المكعبات المنفردة في شبكة عشوائية على اليمين، بعيدة عن مكان العمود (لكل مكعب لمسة 52 على الأقل) */
  const cells = shuffle(Array.from({ length: 20 }, (_, i) => ({ x: 318 - (i % 5) * 38 + R(-5, 5), y: 52 + Math.floor(i / 5) * 46 + R(-5, 5) }))).slice(0, n); const pile = cells.map(p => ({ ...p, g: oneAt(svg, p.x, p.y, { c: 20 }) }));
  say(...lineOf(c.lines[0]), { free: true }); let k = 0; const inRod = el('g', {}, svg);
  await gate(new Promise(res => { const act = p => { if (p.done || k >= 10) return; p.done = true; hush(); p.g.remove(); el('rect', { x: 96 - TEN_C / 2 - 2, y: 236 - (k + 1) * TEN_C, width: TEN_C + 4, height: TEN_C, fill: CUBE.lemon, stroke: '#fff', 'stroke-width': 1.4 }, inRod); k++; SFX.pop();
      if (!SET.muted && !FAST) say(...lineOf(numw(k)), { num: true, noGap: true, free: true }); if (k === 10) { AUTO_CLEAR(); setTimeout(res, FAST ? 30 : 500); } };
    pile.forEach(p => { p.g.style.cursor = 'pointer'; p.g.setAttribute('role', 'button'); p.g.setAttribute('aria-label', plain(labelText('cubeOne'))); hitPad(p.g, 52); p.g.dataset.rodin = 1; p.g.dataset.twin = 'cube'; p.g.onclick = () => act(p); keyOn(p.g, () => act(p)); });
    AUTO({ kind: 'rodFill', ok: () => pile.filter(p => !p.done).slice(0, 10 - k).forEach(p => p.g.dispatchEvent(new MouseEvent('click', { bubbles: true }))) }); }));
  inRod.remove(); slot.remove(); rodAt(svg, 96, 236); SFX.good(); pile.filter(p => !p.done).forEach(p => p.g.style.cursor = ''); logAttempt({ scene: 'explore', tag: 'rodFill', ok: true });
  await S(c.lines[1]); const rest = pile.filter(p => !p.done); await Promise.all(rest.map((p, j) => { const x = 306 - (j % 5) * 26, y = 222 - Math.floor(j / 5) * 26; const t0 = p.g.getAttribute('transform'); return anim(p.g, [{ transform: t0 }, { transform: `translate(${x}px,${y}px)` }], { duration: 600, fill: 'forwards' }).done; }));
  await S(c.lines[2]); await numUntil(() => teenOpts(n), n, { intro: [lineOf(c.lines[2])], tag: 'rodCount', err: a => teenErr(n, a), wrong: a => teenErr(n, a) === 'rodAsOne' ? 'gen.err.rodAsOne.01' : 'gen.err.teenCount.01' });
  /* كل جملة على صورتها (الدرس 130؛ الفحص المستقل A لبوابة S1-U4): «عشرة وثلاثة» و«كل عدد بعد العشرة: عمود ومنفردات» على بناء العدد، و«والعشرون؟ عمودان» على العشرين */
  await S(c.lines[3]); await S(c.lines[5]);
  const s2 = newStage(270, { oasis: false, ground: 0 }); for (const [i, m] of c.show.entries()) { s2.innerHTML = ''; backdrop(s2, 270, { oasis: false, ground: 0 }); teenAt(s2, m, { baseY: 236 }); digitCard(s2, 180, 50, m, { size: .9 }); await S(m === 20 ? c.lines[4] : numw(m)); await sleep(600); }
  /* وعلى طريق الأعداد (N009 استدعاء، المواصفة د5 (3)): نقف عند العشرة ونقفز بالآحاد، فنسمع أعدادها حتى العدد الذي بنيناه */
  if (c.road) { const s3 = newStage(270, { oasis: false, ground: 0 }); el('rect', { x: -360, y: 196, width: 1080, height: 80, fill: css('--floor'), opacity: .55 }, s3);
    /* يقفز الطفل بنفسه: يلمس البلاطة التالية فيقفز إليها ويسمع عددها، حتى العدد الذي بناه (المواصفة «يقف على العشرة ويقفز»؛ الفحص المستقل A لبوابة S1-U4: كان القفز يجري وحده) */
    const R = roadAt(s3, { y: 170, at: 10, btnY: 236 }), kid = roadToken(R, 'kid', 10); await S(c.road[0]);
    for (let m = 11; m <= n; m++) { await R.show(R.tileX(m) - 29, R.tileX(m + 1) + 29); if (c.roadIdle) armIdle(() => S(c.roadIdle, { aside: true }));   /* وتذكيرٌ عند السكوت (الفحص المستقل C2) */
      await tapOne([{ g: R.tiles[m].g, k: m, label: T(numw(m)) }], { ok: m, pad: 56 }); disarmIdle(); hush();
      await kid.hop(m, async q => { await S(numw(q), { num: true, noGap: true }); }); }
    untarget(R.tiles.map(t => t.g)); await S(c.road.slice(1)); } };
/* كتابة العدد برقمين: رقم العشرات على اليسار (العمود)، ورقم الآحاد على اليمين (المنفردات)، بالكتابة التي اختارها الطفل */
SCENES.teenWrite = async c => { const svg = newStage(290, { oasis: false, ground: 0 }); const n = c.n, T = teenAt(svg, n, { baseY: 270, rodX: 110, onesX: 300 });
  const card = el('g', { transform: 'translate(180 56)' }, svg); el('rect', { x: -70, y: -40, width: 140, height: 80, rx: 14, fill: '#fffdf6', stroke: css('--compass'), 'stroke-width': 3.5 }, card);
  /* الرقمان في مجموعتين (هدفا لمس)، رقم العشرات على اليسار في الكتابتين (D229 (6)) */
  const tD = el('g', {}, card), oD = el('g', {}, card); el('text', { x: -26, y: 22, 'text-anchor': 'middle', 'font-size': 60, 'font-weight': 800, fill: CARD_INK, 'font-family': css('--f') }, tD).textContent = DG(Math.floor(n / 10));
  el('text', { x: 26, y: 22, 'text-anchor': 'middle', 'font-size': 60, 'font-weight': 800, fill: CARD_INK, 'font-family': css('--f') }, oD).textContent = DG(n % 10);
  tD.setAttribute('opacity', 0); oD.setAttribute('opacity', 0);
  await S(c.lines[0]); anim(tD, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, fill: 'forwards' }); el('path', { d: 'M154 96 Q130 130 116 132', fill: 'none', stroke: css('--compass'), 'stroke-width': 3.5, 'stroke-dasharray': '5 4' }, svg); await S(c.lines[1]);
  anim(oD, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, fill: 'forwards' }); el('path', { d: 'M206 96 Q250 150 274 234', fill: 'none', stroke: css('--square'), 'stroke-width': 3.5, 'stroke-dasharray': '5 4' }, svg); await S(c.lines[2]);
  /* «أيّ رقم نكتبه على اليسار؟»: يلمس الطفل رقم العشرات */
  say(...lineOf(c.lines[3]), { free: true }); await tapUntil([{ g: tD, k: 't', label: labelText('tensDigit') }, { g: oD, k: 'o', label: labelText('onesDigit') }], 't', 'gen.err.tensMeaning.01', 'tensLeft', { pad: 64 }); hush();
  await S(c.lines.slice(4)); };
/* لعبة «مصنع الأعمدة»: تنزل المكعبات على الحزام إلى العمود، وكلما اكتمل عمود من عشرة أُغلق وأُرسل؛ وعند كل محطة «كم الآن؟» */
SCENES.rodFactory = async c => { if (c.intro) await S(c.intro); const svg = newStage(270, { oasis: false, ground: 0 }); el('rect', { x: 150, y: 236, width: 220, height: 12, rx: 6, fill: '#8d7a62' }, svg);
  const shipped = el('g', {}, svg); let rods = 0, cur = 0, total = 0; const curG = el('g', {}, svg); const loose = el('g', {}, svg);
  const drawCur = () => { curG.innerHTML = ''; for (let i = 0; i < cur; i++) el('rect', { x: 200 - TEN_C / 2 - 2, y: 230 - (i + 1) * TEN_C, width: TEN_C + 4, height: TEN_C, fill: CUBE.lemon, stroke: '#fff', 'stroke-width': 1.4 }, curG); };
  for (const [i, stop] of c.stops.entries()) {
    while (total < stop) { const g = oneAt(loose, 360, 236 - 9, { c: 18 }); await anim(g, [{ transform: 'translate(360px,227px)' }, { transform: 'translate(206px,227px)' }], { duration: FAST ? 20 : 380, fill: 'forwards' }).done; g.remove();
      cur++; total++; drawCur(); SFX.tick(); if (cur === 10) { SFX.good(); await sleep(250); cur = 0; drawCur(); rodAt(shipped, 60 + rods * 34, 236); rods++; } }
    const q = i === 0 ? c.q : 'gen.factory.again'; say(...lineOf(q), { free: true });
    await numUntil(() => teenOpts(total), total, { intro: [lineOf(q)], scene: 'game', tag: 'factory' + i, err: a => teenErr(total, a), wrong: a => teenErr(total, a) === 'rodAsOne' ? 'gen.err.rodAsOne.01' : 'gen.err.teenCount.01' });
    await S(numw(total)); }
  if (c.after) await S(c.after); };
/* «صحّح لفوضى»: كتبت فوضى «ثلاثة عشر» هكذا: 31؛ يبني فرجار ما كتبت فإذا هو ثلاثة أعمدة ومكعب (نرى البناء ولا نسمّي عدده: الأعداد فوق العشرين في S1-U5 د4) */
SCENES.chaos31 = async c => { const svg = newStage(290, { oasis: false, ground: 0 }); const n = c.n, w = (n % 10) * 10 + Math.floor(n / 10);
  const card = digitCard(svg, 270, 54, w, { size: 1, stroke: css('--chaos') }); const fz = chaosAt(svg, 330, 130, .38); await chaosGiggle(fz); await S(c.find);
  /* كل بطاقة فوق بنائها، والبناءان في جهتين بالقرعة (الفحص المستقل B لبوابة S1-U4: البطاقتان كانتا تُخلطان فوق بناءين ثابتين، فكانت «١٣» فوق ثلاثة أعمدة) */
  const X0 = shuffle([56, 214]), build = (m, x0) => { const g = el('g', { 'data-build': m }, svg), t = Math.floor(m / 10), o = m % 10; for (let i = 0; i < t; i++) rodAt(g, x0 + i * 24, 270, { c: 12 });
    for (let i = 0; i < o; i++) oneAt(g, x0 + t * 24 + 18 + (i % 3) * 20, 260 - Math.floor(i / 3) * 18, { c: 15 }); return x0 + (t * 24 + 18 + Math.min(o, 3) * 20) / 2 - 6; };
  const cp = compassAt(svg, 30, 110, .34); const cw = build(w, X0[0]); await S(c.see); const cn = build(n, X0[1]); await S(c.see2);
  fz.remove(); card.remove(); const cards = [[w, cw], [n, cn]].map(([m, x]) => { const g = digitCard(svg, x, 56, m, { size: .9 }); g.dataset.card = m; return { g, k: m, label: labelText('cardOne') }; });
  say(...lineOf(c.ask), { free: true }); await tapUntil(cards, n, 'gen.err.onesFirst.01', 'chaosFix', { scene: 'chaos', pad: 84 }); hush(); cards.filter(x => x.k !== n).forEach(x => x.g.remove()); if (c.after) await S(c.after); };

/* ---------- الدرس 6: أصدقاء العشرة (N011) ---------- */
/* الإشعال (فرجار): عشرة أصابع مرفوعة، ثم يضمّ سبعة: «كم بقي مفتوحاً؟» */
SCENES.fingersHook = async c => { const svg = newStage(250, { oasis: false, ground: 0 }); const cp = compassAt(svg, 330, 50, .36);
  let H = [handAtN(svg, 250, 120, 5, 1.4), handAtN(svg, 110, 120, 5, 1.4)]; await S(c.lines[0]); await sleep(300);
  H.forEach(h => h.remove()); H = [handAtN(svg, 250, 120, Math.max(0, 5 - c.fold), 1.4), handAtN(svg, 110, 120, 5 - Math.max(0, c.fold - 5), 1.4)]; SFX.pop();   /* يضمّ أصابع اليمنى أولاً ثم اليسرى */
  await S(c.lines[1]); const want = 10 - c.fold; await numUntil(() => nearNums(want, 10), want, { intro: [lineOf(c.lines[1])], scene: 'hook', tag: 'fingers', wrong: () => 'gen.err.friendFingers.01' });
  await S(c.lines.slice(2)); };
/* الاكتشاف: يضع الطفل سبع قطع في الإطار فيرى الفراغات ثلاثاً؛ ثم الأصدقاء كلهم، واليدان إطار عشرة */
SCENES.frameFriends = async c => { const svg = newStage(270, { oasis: false, ground: 0 }); const F = frameAt(svg, 180, 96); let k = 0;
  const tb = toolBar([['put', 'putCounter', '<svg viewBox="0 0 40 28" width="40" height="28" aria-hidden="true"><circle cx="20" cy="14" r="10" fill="currentColor"/></svg>', 'gen.opt.putCounter']]); await S(c.lines[0]); tb.read([lineOf(c.lines[0])]);
  await gate(new Promise(res => { tb.b.put.onclick = () => { if (k >= c.n) return; F.put(k, CUBE.lemon); k++; SFX.pop(); hush(); if (!SET.muted && !FAST) say(...lineOf(numw(k)), { num: true, noGap: true, free: true }); if (k === c.n) { AUTO_CLEAR(); setTimeout(res, FAST ? 30 : 400); } }; AUTO({ kind: 'frameFill', ok: () => { while (k < c.n) tb.b.put.click(); } }); }));
  tb.bar.remove(); logAttempt({ scene: 'explore', tag: 'frameFill', ok: true });
  say(...lineOf(c.lines[1]), { free: true }); const want = 10 - c.n;
  await numUntil(() => optsWith(want, [c.n], 10), want, { intro: [lineOf(c.lines[1])], tag: 'frameEmpty', wrong: a => a === c.n ? 'gen.err.friendCounted.01' : 'gen.err.friendWrong.01' });
  F.fill(want, COUNTER2, c.n); await S(c.lines[2]);
  /* الأصدقاء كلهم: واحد وتسعة … خمسة وخمسة */
  const s2 = newStage(270, { oasis: false, ground: 0 }); for (let a = 1; a <= 5; a++) { const f = frameAt(s2, 180, 60, { cell: 30 }); f.fill(a, CUBE.lemon); f.fill(10 - a, COUNTER2, a); await readSentence(a, '+', 10 - a, 10); f.g.remove(); }
  await S(c.lines[3]); handAtN(s2, 250, 150, 5, 1.4); handAtN(s2, 110, 150, 5, 1.4); await S(c.lines.slice(4)); };
/* لعبة «أكمل الإطار»: ثلاثة إطارات تمرّ، والبطاقة تُظهر عدداً؛ يلمس الطفل الإطار الذي يكتمل بهذا العدد */
SCENES.completeFrame = async c => { if (c.intro) await S(c.intro);
  for (const [i, rd] of c.rounds.entries()) { const svg = newStage(290, { oasis: false, ground: 0 }); digitCard(svg, 180, 44, rd.need, { size: .9 });
    const Fs = rd.frames.map((m, j) => { const g = el('g', { 'data-k': m }, svg); const f = frameAt(g, 180, 116 + j * 62, { cell: 26 }); f.fill(m, CUBE.lemon); return { g, k: m, label: labelText('frameOne') }; });
    await Promise.all(Fs.map((f, j) => anim(f.g, [{ transform: 'translateX(-360px)' }, { transform: 'translateX(0)' }], { duration: 700 + j * 150, easing: 'ease-out' }).done));
    say(...lineOf(i === 0 ? c.q : 'gen.cframe.again'), { free: true }); await say(...lineOf(numw(rd.need)), { append: true, free: true });
    const want = 10 - rd.need; let t = 0; while (true) { const k = await tapOne(Fs, { ok: want, pad: 64 }); hush(); t++; logAttempt({ scene: 'game', tag: 'cframe' + i, ok: k === want, firstTry: t === 1, err: k === want ? null : 'friendWrong' }); if (k === want) break; SFX.soft(); await S('gen.err.friendWrong.01'); }
    SFX.good(); const f = Fs.find(x => x.k === want); okRing(svg, f.g, 4); await sleep(500); }
  if (c.after) await S(c.after); };
/* «صحّح لفوضى»: وضعت فوضى أربعاً مع سبع في الإطار، فبقيت قطعة فوق حافّته لا مكان لها؛ يجدها الطفل ويبعدها */
SCENES.chaosFrame = async c => { const svg = newStage(250, { oasis: false, ground: 0 }); const F = frameAt(svg, 180, 104); F.fill(c.a, CUBE.lemon); F.fill(10 - c.a, COUNTER2, c.a);
  const over = el('g', {}, svg); counterAt(over, F.cx - 132, F.cy - 56, F.c * .38, COUNTER2); const fz = chaosAt(svg, 330, 40, .4); await chaosGiggle(fz); await S(c.find);
  let tries = 0; while (true) { const k = await tapOne([{ g: over, k: 'over', label: labelText('counterOne') }, { g: F.g, k: 'frame', label: labelText('frameOne') }], { ok: 'over', pad: 56 }); tries++;
    logAttempt({ scene: 'chaos', tag: 'find', ok: k === 'over', firstTry: tries === 1 }); if (k === 'over') break; SFX.soft(); await S('gen.chaos.no'); }
  SFX.good(); fz.remove(); await anim(over, [{ opacity: 1 }, { opacity: 0, transform: 'translate(-40px,60px)' }], { duration: 600, fill: 'forwards' }).done; over.remove(); await S(c.fix);
  await readSentence(c.a, '+', 10 - c.a, 10); if (c.after) await S(c.after); };

/* ---------- الدرس 7: نكوّن العشرة أولاً (N012) ---------- */
/* الإشعال: فوضى تعدّ الثمانية ثم الخمسة من الواحد، بعلامات بطيئة، وتقفز عن واحد فتضيع */
SCENES.countAllHook = async c => { const svg = newStage(250, { oasis: false, ground: 0 }); const A = Array.from({ length: c.a }, (_, i) => counterAt(svg, 330 - i * 34, 70, 14, CUBE.lemon)), B = Array.from({ length: c.b }, (_, i) => counterAt(svg, 330 - i * 34, 130, 14, COUNTER2));
  const fz = chaosAt(svg, 50, 200, .4); await chaosGiggle(fz); const marks = el('g', { 'pointer-events': 'none' }, svg); const all = [...A, ...B]; let n = 0;
  for (const [i, g] of all.entries()) { if (i === c.skip) continue; n++; const p = g.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/); el('line', { x1: +p[1] - 6, y1: +p[2] - 22, x2: +p[1] + 6, y2: +p[2] - 30, stroke: css('--chaos'), 'stroke-width': 3, 'stroke-linecap': 'round' }, marks); SFX.tick(); await sleep(FAST ? 10 : 260); }
  await chaosGiggle(fz); await S(c.lines); };
/* الاكتشاف: 8 + 5 بالإطار (يُكمل الطفل العشرة)، ثم الجملة وعمود العشرة؛ ثم 13 − 5 بالرجوع إلى العشرة؛ ثم قصة */
SCENES.makeTenLab = async c => { await runItem({ t: 'makeTen', a: c.a, b: c.b, ask: 'total' }, 'explore', { scene: 'explore' });
  const svg = newStage(250, { oasis: false, ground: 0 }); sentenceAt(svg, 180, 50, c.a, '+', c.b, c.a + c.b); teenAt(svg, c.a + c.b, { baseY: 236 }); await S(c.lines[0]); await readSentence(c.a, '+', c.b, c.a + c.b); await S(c.lines[1]);
  await S(c.lines[2]); await runItem({ t: 'backTen', a: c.a + c.b, b: c.b, q: c.subQ }, 'explore', { scene: 'explore' }); await S(c.lines.slice(3)); };
/* لعبة «حافلة الواحة»: حافلة بعشرة مقاعد (صفّان من خمسة)، فيها ركّاب، وعند المحطة آخرون؛ يُركبهم الطفل حتى تمتلئ، ثم «كم راكباً كلهم؟» */
function busAt(svg, cx, cy) { const g = el('g', {}, svg); el('rect', { x: cx - 150, y: cy - 66, width: 300, height: 132, rx: 22, fill: '#f2b33d', stroke: '#fff', 'stroke-width': 4, filter: 'url(#pp)' }, g);
  el('rect', { x: cx + 118, y: cy - 50, width: 24, height: 60, rx: 6, fill: '#d9f0f7' }, g); for (const x of [cx - 100, cx + 100]) { el('circle', { cx: x, cy: cy + 66, r: 18, fill: '#33454c', stroke: '#fff', 'stroke-width': 3 }, g); el('circle', { cx: x, cy: cy + 66, r: 6, fill: '#b8c2c8' }, g); } return g; }
SCENES.tenBus = async c => { if (c.intro) await S(c.intro);
  for (const [i, rd] of c.rounds.entries()) { const svg = newStage(270, { oasis: false, ground: 0 }); busAt(svg, 170, 96); const F = frameAt(svg, 160, 90, { cell: 40 }); F.fill(rd.a, CUBE.lemon);
    const need = 10 - rd.a; const out = Array.from({ length: rd.b }, (_, j) => ({ x: 330 - j * 30, y: 222 })); out.forEach(o => { o.g = counterAt(svg, o.x, o.y, 13, COUNTER2); });
    say(...lineOf(i === 0 ? c.q : 'gen.bus.again'), { free: true }); let moved = 0;
    await gate(new Promise(res => { out.forEach(o => { o.g.style.cursor = 'pointer'; o.g.setAttribute('role', 'button'); o.g.setAttribute('aria-label', plain(labelText('counterOne'))); hitPad(o.g, 52); o.g.dataset.move = 1; o.g.dataset.twin = 'out';
        o.g.onclick = () => { if (o.inF || moved >= need) return; o.inF = true; o.g.remove(); F.put(F.firstEmpty(), COUNTER2); moved++; SFX.pop(); hush(); if (moved === need) { AUTO_CLEAR(); setTimeout(res, FAST ? 30 : 400); } }; keyOn(o.g, () => o.g.onclick()); });
      AUTO({ kind: 'frameMove', ok: () => out.filter(o => !o.inF).slice(0, need - moved).forEach(o => o.g.dispatchEvent(new MouseEvent('click', { bubbles: true }))) }); }));
    untarget(out.map(o => o.g)); await S('gen.bus.full'); const want = rd.a + rd.b; await S('gen.bus.ask');
    await numUntil(() => optsWith(want, [10]), want, { intro: [lineOf('gen.bus.ask')], scene: 'game', tag: 'bus' + i, err: a => a === 10 ? 'tenOnly' : 'tenJoinBus', wrong: a => a === 10 ? 'gen.err.tenOnly.01' : 'gen.err.tenJoinBus.01' });
    await readSentence(rd.a, '+', rd.b, want); }
  if (c.after) await S(c.after); };
/* «صحّح لفوضى»: الإطار فيه ثمانية وفراغان، فأخذت فوضى من الخمسة ثلاثاً، فبقيت قطعة فوق الإطار؛ يعيدها الطفل إلى الخارج */
SCENES.chaosTakeMore = async c => { const svg = newStage(250, { oasis: false, ground: 0 }); const F = frameAt(svg, 180, 84); F.fill(c.a, CUBE.lemon); F.fill(10 - c.a, COUNTER2, c.a);
  const rest = c.b - (10 - c.a) - 1; const out = Array.from({ length: rest }, (_, j) => counterAt(svg, 300 - j * 36, OUT_Y, F.c * .38, COUNTER2));
  const over = el('g', {}, svg); counterAt(over, F.cx + 4, F.cy - 58, F.c * .38, COUNTER2); const fz = chaosAt(svg, 40, 40, .4); await chaosGiggle(fz); await S(c.find);
  let tries = 0; while (true) { const k = await tapOne([{ g: over, k: 'over', label: labelText('counterOne') }, { g: F.g, k: 'frame', label: labelText('frameOne') }], { ok: 'over', pad: 56 }); tries++;
    logAttempt({ scene: 'chaos', tag: 'find', ok: k === 'over', firstTry: tries === 1 }); if (k === 'over') break; SFX.soft(); await S('gen.chaos.no'); }
  SFX.good(); fz.remove(); await anim(over, [{ transform: 'translate(0px,0px)' }, { transform: `translate(${300 - rest * 36 - F.cx - 4}px,${OUT_Y - F.cy + 58}px)` }], { duration: 700, fill: 'forwards' }).done; await S(c.fix);
  await S('gen.makeTen.ask'); const want = c.a + c.b;
  await numUntil(() => optsWith(want, [10]), want, { intro: [lineOf('gen.makeTen.ask')], scene: 'chaos', tag: 'chaosFix', wrong: a => a === 10 ? 'gen.err.tenOnly.01' : 'gen.err.tenJoin.01' });
  if (c.after) await S(c.after); };

/* ---------- المحطة: «سباق القياس» ---------- */
/* الإبداع «شريط الوحدات» (D248: من الدرس 4 إلى المراجعة): يصنع الطفل شريطاً من مربعات متساوية بلا أرقام، ويلوّنها كما يشاء، ثم يقيس به قلماً */
SCENES.unitStrip = async c => { const svg = newStage(260, { oasis: false, ground: 0 }); const u = 28; let n = 0; const strip = el('g', {}, svg); const cols = [CUBE.lemon, '#5c9bb0', '#ee9a7e'];
  /* المربّع يُلوَّن بلمسه قبل «تمّ»: هدفٌ بمنطقة 56 واسمٍ، واللمسة للمربّع المرسوم تحت الإصبع بين جيرانه (الفحص المستقل B لبوابة S1-U4: 22 بكسلاً بلا دور، والدعوة إلى التلوين بعد أن تعطّل) */
  const sq = []; let open = true; const draw = () => { strip.innerHTML = ''; const TG = []; sq.forEach((cIx, i) => { const g = el('g', { 'data-sq': i }, strip); el('rect', { x: MS_X - (i + 1) * u, y: 60, width: u, height: u, fill: cols[cIx], stroke: '#fff', 'stroke-width': 2 }, g); TG.push({ g, i }); });
    if (!open) return; TG.forEach(t => { const g = t.g; g.style.cursor = 'pointer'; g.setAttribute('role', 'button'); g.setAttribute('tabindex', 0); g.setAttribute('aria-label', plain(G(labelText('stripSquare')))); hitPad(g, 56);
      const act = r => { sq[r.i] = (sq[r.i] + 1) % cols.length; SFX.tick(); hush(); draw(); }; g.__route = (x, y) => tapRoute(TG, x, y, t).g; g.onclick = e => act(e && e.clientX ? tapRoute(TG, e.clientX, e.clientY, t) : t); g.onkeydown = e => { if (actKey(e)) act(t); }; }); };
  const tb = toolBar([['plus', 'addSquare', '<svg viewBox="0 0 40 28" width="40" height="28" aria-hidden="true"><rect x="12" y="6" width="16" height="16" fill="currentColor"/></svg>', 'gen.opt.addSquare'], ['done', 'done', TOOL_IC.done]]);
  await S(c.lines[0]); tb.read([lineOf(c.lines[0])]);
  await gate(new Promise(res => { tb.b.plus.onclick = () => { if (sq.length >= 9) return; sq.push(sq.length % 2); draw(); SFX.pop(); hush(); }; tb.b.done.onclick = () => { if (sq.length < 6) { S('gen.strip.more', { ifIdle: true, free: true }); return; } AUTO_CLEAR(); open = false; draw(); tb.bar.remove(); res(); };
    AUTO({ kind: 'strip', ok: () => { while (sq.length < 8) sq.push(sq.length % 2); draw(); tb.b.done.click(); } }); }));
  logAttempt({ scene: 'explore', tag: 'unitStrip', ok: true });
  await S(c.lines[1]); const L = c.n * u; lenAt(svg, { kind: 'pencil', len: L, color: NEUTRAL[3] }, MS_X, 150); startMark(svg, MS_X, 150, 44);
  await anim(strip, [{ transform: 'translate(0px,0px)' }, { transform: 'translate(0px,58px)' }], { duration: 800, fill: 'forwards' }).done;
  const U = sq.slice(0, c.n).map((_, i) => ({ g: strip.children[i], x: MS_X - (i + .5) * u, y: 132, u })); await rowTapCount(svg, U, { label: 'countUnits', by: 30, alt: 20 });   /* الشريط فوق القلم: الشارات فوقه */
  await S(c.lines[2]); await numUntil(() => nearNums(c.n, 10, 1), c.n, { tag: 'stripMeasure', wrong: () => 'gen.err.lastNumber.01' });
  await S(c.lines.slice(3)); };

/* ---------- التذكّر بصورة في الدورة الثانية من الإتقان (S1-U4) ---------- */
/* pic.kind: len (شريطان على خط واحد وخطّان عند نهايتيهما) | weigh (ميزان مائل) | meas (مشابك متلاصقة من البداية) | span (طاولتان وشبران) | board | teen | frame */
SCENES.recallU4 = async (c) => { const P = c.pic || {}; const svg = newStage(270, { oasis: false, ground: 0 });
  if (P.kind === 'len') { startLineAt(svg, 30, 236); const T = P.lens.map((len, i) => ({ o: lenAt(svg, { kind: 'strip', len, color: NEUTRAL[i ? 3 : 0] }, MS_X, 96 + i * 74) })); endLines(svg, T); }
  else if (P.kind === 'size') { sizeRow(svg, { vals: P.vals, kind: P.k || 'circle' }); }
  else if (P.kind === 'weigh') { const B = balanceAt(svg, 180, 260); B.put('R', P.a); B.put('L', P.b); B.set(tiltOf(P.a, P.b)); }
  else if (P.kind === 'meas') { const u = UNIT_U[P.unit || 'clip']; lenAt(svg, { kind: 'pencil', len: P.n * u, color: NEUTRAL[3] }, MS_X, 100); startMark(svg, MS_X, 100, 50); unitRow(svg, P.unit || 'clip', P.n, MS_X, UNIT_Y); }
  else if (P.kind === 'span') { spanTables(svg, P.a, P.b); }
  else if (P.kind === 'board') { barBoardAt(svg, P.cats, P.counts, { baseY: 196 }); }
  else if (P.kind === 'teen') { teenAt(svg, P.n, { baseY: 236 }); digitCard(svg, 180, 50, P.n, { size: .9 }); }
  else if (P.kind === 'frame') { const F = frameAt(svg, 180, 104); F.fill(P.a, CUBE.lemon); F.fill(P.b || 0, COUNTER2, P.a); }
  await S(c.lines); };
