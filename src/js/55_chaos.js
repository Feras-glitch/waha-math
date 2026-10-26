/* =====================================================================
   «صحّح لفوضى» (D236): فوضى فعلت شيئاً في غير مكانه، فيجده الطفل ويتحقّق بيده،
   ثم بطاقتان مسموعتان: الصحيحة، والخاطئة تسبقها النغمة الثابتة و«فوضى تظنّ…» ولا تُعرض نصاً.
   يختار الطفل الصحيحة فيعيدها فرجار، وتكون جملة الختام (فالصحيحة تُسمع ثلاثة أضعاف الخاطئة).
   البيانات: chaos = {kind:'bins'|'flag'|'card'|'scene', ...، right, wrong}؛ و'scene' يسمّي مشهد «صحّح لفوضى» من الكتالوج (S1-U3)
   ===================================================================== */
async function chaosStage(C) {
  if (C.kind === 'scene') { const f = SCENES[C.scene]; if (!f) throw new Error('مشهد فوضى غير معروف: ' + C.scene); await f(C, CUR); }
  else if (C.kind === 'flag') await chaosFlag(C); else if (C.kind === 'card') await chaosCard(C); else await chaosBins(C);
  await chaosCards(C);
}
/* السلال: أشياء في سلالها وواحد في غير سلّته */
async function chaosBins(C) {
  const svg = newStage(330, { oasis: false, ground: 0 }); const n = C.bins.length; const bx = i => 360 - (i + .5) * (360 / n);
  C.bins.forEach((k, i) => { const g = el('g', { transform: `translate(${bx(i) - 40} 236) scale(.73)` }, svg); g.innerHTML = basketSVG(k).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, ''); label(svg, bx(i), 322, plain(BIN_NAMES[k]), 14); });
  const flatSolid = !!(CUR && CUR.sort && CUR.sort.kindOf) || C.bins.some(b => SOLID_BINS.includes(b));   /* D238: بلا ظلّ في كل فرز فيه مجسّمات، فلا تُعرف الورقة بغياب ظلّها */
  const items = C.placed.map((p, j) => { const s = { ...make(p.mk), ...(flatSolid ? { noShadow: true } : {}) }; const i = C.bins.indexOf(p.bin); const same = C.placed.slice(0, j).filter(q => q.bin === p.bin).length;
    const x = bx(i), y = 196 - same * 70; const g = fitThing(svg, { ...s, label: null }, x, y, 62); return { g, s, x, y, wrong: !!p.wrong, p }; });
  const fz = chaosAt(svg, 40, 50, .42); await chaosGiggle(fz);
  for (const k of C.bins) if (GL['gen.bin.' + k]) await S('gen.bin.' + k, { noGap: true });   /* أسماء السلال قبل البحث (D254) */
  await S(C.find || 'gen.chaos.find');
  let tries = 0; while (true) { const k = await tapOne(items.map((it, i) => ({ g: it.g, k: i, label: plain(it.s.label || labelText('shapeOne')) })), { ok: items.findIndex(it => it.wrong) });   /* لا اسم النوع: المربع في «غير ذلك» لا يُعلَن «مربعاً» (D254 (3)) */ tries++;
    const it = items[k]; logAttempt({ scene: 'chaos', tag: 'find', ok: it.wrong, firstTry: tries === 1 });
    if (it.wrong) break; SFX.soft(); await S('gen.chaos.no'); }
  SFX.good(); hush(); fz.remove(); const W = items.find(it => it.wrong);
  /* يتحقّق الطفل بيده: يعدّ الرؤوس أو الأضلاع، أو يدير الورقة، أو يلمس الوجوه */
  const stage = newStage(260, { oasis: false, ground: 0 }); const s = { ...W.s, label: null }; if (C.check === 'faces') Object.assign(s, { size: Math.max(faceSize(stage, 160), s.size || 0), ry: .34 });   /* وجوه يلمسها الإصبع (≥ 56) */
  const g = thingAt(stage, s, 180, 104);
  await S(C.foundLine || 'gen.chaos.found');
  if (C.check === 'countVertices' || C.check === 'countSides') { const P = worldPoly({ ...s, x: 180, y: 104 });
    const pts = C.check === 'countSides' ? P.map((a, i) => { const b = P[(i + 1) % P.length]; return { x: (a[0] + b[0]) / 2, y: (a[1] + b[1]) / 2 }; }) : P.map(([x, y]) => ({ x, y }));
    await countTouch(stage, pts, { halo: 20, by: -26, pad: 56 }); }
  else if (C.check === 'faces') { const fs = [...g.querySelectorAll('[data-face]')].filter(f => f.dataset.face !== 'curved');
    if (fs.length) await tapAll(fs.map(f => ({ g: f, label: labelText('face') })), async t => { SFX.pop(); t.g.setAttribute('stroke', '#f6cf7e'); t.g.setAttribute('stroke-width', 6); }, { pad: false }); }
  else if (VIS[C.check]) { await tapOne([{ g, k: 'g', label: labelText('lookAt') }], { ok: 'g' }); await VIS[C.check](s, { svg: stage, g }); }
  if (C.after) await S(C.after);
}
/* العلم على البرج الأعلى (الوحدة 2، الدرس 3): يقابل ويعدّ وينقل العلم */
async function chaosFlag(C) {
  const svg = newStage(290, { oasisOpacity: .15, ground: 14 }); const A = towerAt(svg, 250, 262, C.a, { size: C.sa || 44, color: CUBE.plain }), B = towerAt(svg, 110, 262, C.b, { size: C.sb || 22, color: CUBE.plain });
  const flag = el('g', {}, svg); el('line', { x1: 0, y1: 0, x2: 0, y2: -46, stroke: MAT.woodDk, 'stroke-width': 4 }, flag); el('path', { d: 'M0 -46 l34 9 l-34 9z', fill: css('--chaos') }, flag);
  const at = T => `translate(${T.x} ${T.top - 4})`; flag.setAttribute('transform', at(A));
  const fz = chaosAt(svg, 330, 60, .42); await chaosGiggle(fz); await S(C.find); fz.remove();
  await pairLines(svg, A, B, 300);
  let tries = 0; while (true) { const k = await tapOne([{ g: A.g, k: 'a', label: labelText('towerR') }, { g: B.g, k: 'b', label: labelText('towerL') }], { ok: C.a > C.b ? 'a' : 'b', pad: 76 }); tries++;
    const ok = (k === 'a') === (C.a > C.b); logAttempt({ scene: 'chaos', tag: 'flag', ok, firstTry: tries === 1 }); if (ok) break; SFX.soft(); await S('gen.chaos.countFirst'); }
  SFX.good(); const T = C.a > C.b ? A : B; await anim(flag, [{ transform: flag.getAttribute('transform').replace(/translate\(([-\d.]+) ([-\d.]+)\)/, 'translate($1px,$2px)') }, { transform: `translate(${T.x}px,${T.top - 4}px)` }], { duration: 700, fill: 'forwards' }).done;
  if (C.after) await S(C.after);
}
/* البطاقة على غير صندوقها أو برجها: يعدّ الطفل ويختار البطاقة الصحيحة */
async function chaosCard(C) {
  const svg = newStage(300, { oasisOpacity: .15, ground: C.tower ? 14 : 0 }); let pts;
  /* والبرج يساراً وبطاقات الاختيار يمينه (الفحص المستقل D2 لبوابة S1-U4 (8): كانت البطاقة الوسطى على أسفل البرج وشارته «١») */
  const TX = 84, SX = C.tower ? TX + 76 : 180, SY = C.tower ? 120 : 42;
  if (C.tower) pts = towerAt(svg, TX, 262, C.n, { size: 28, color: CUBE.lemon });
  else pts = mailboxAt(svg, 180, 128, C.n);   /* أعلى قليلاً: تنتشر الرسائل تحته للعدّ */
  const card = digitCard(svg, SX, SY, C.shown, { size: .9, stroke: css('--chaos') });
  const fz = chaosAt(svg, 40, 60, .42); await chaosGiggle(fz); await S(C.find); fz.remove();
  if (C.tower) await towerTapCount(svg, pts); else await mailSpread(svg, pts, 250);
  const opts = shuffle([C.n, C.shown, ...(C.extra != null ? [C.extra] : [])]); const cards = opts.map((n, i) => ({ g: digitCard(svg, C.tower ? 324 - i * (150 / Math.max(1, opts.length - 1)) : 300 - i * (240 / Math.max(1, opts.length - 1)), 250, n, { size: .95 }), k: n, label: T(numw(n)) }));
  await S(C.ask || 'gen.chaos.whichCard');
  let tries = 0; while (true) { const k = await tapOne(cards, { ok: C.n, pad: 84 }); tries++; logAttempt({ scene: 'chaos', tag: 'card', ok: k === C.n, firstTry: tries === 1 }); if (k === C.n) break; SFX.soft(); await S('gen.count.again'); }
  SFX.good(); card.remove(); digitCard(svg, SX, SY, C.n, { size: .9 }); if (C.after) await S(C.after);
}
/* البطاقتان المسموعتان: الخاطئة بلا نصّ، تسبقها النغمة الثابتة و«فوضى تظنّ…» */
async function chaosCards(C) {
  const svg = newStage(220, { oasisOpacity: .2 }); compassAt(svg, 250, 110, .8); chaosAt(svg, 110, 110, .5);
  await S('gen.chaos.cards');
  for (let round = 0; round < 3; round++) {
    /* البطاقتان متماثلتان بلا نصّ (D236): لا تُعرف الصحيحة بالنظر، والخاطئة تسبقها النغمة و«فوضى تظنّ…»؛ ويُكشف نصّ الصحيحة بعد اختيارها */
    const cp = cardPick([{ id: C.right, k: 'r', ok: true, hide: true }, { id: C.wrong, k: 'w', ok: false, hide: true, pre: async () => { SFX.chaos(); await S('gen.chaos.thinks', { free: true }); } }]);
    const pickd = await cp.p; cp.done(); const ok = pickd.k === 'r'; logAttempt({ scene: 'chaos', tag: 'cards', ok, firstTry: round === 0 });
    cp.btns.find(b => b.dataset.k === pickd.k).classList.add(ok ? 'ok' : 'no'); if (ok) cp.reveal('r');
    await sleep(500); cp.box.remove();
    if (ok) break; SFX.soft(); await S(round < 1 ? 'gen.chaos.listenAgain' : 'gen.chaos.together');
  }
  SFX.good(); await S('gen.chaos.right'); await S(C.right);
}
