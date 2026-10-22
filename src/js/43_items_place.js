/* =====================================================================
   بنود «أين أنا؟» (S1-U3، المواصفة 1.4): المواضع (C010)، والترتيب في الصفّ (N008)، واليمين واليسار (C011)،
   والروبوت (C013)، والخريطة (C012)، وطريق الأعداد (N009).
   لكل مفهوم نوعان: تعرّف (where، linePick، lrPick، robotWatch، mapFind، roadPick) وإنتاج (place، lineTap، lrTap، robot، mapPut، roadHop) (D240).
   والطفل في الصور من ظهره دائماً، والشريط على يده اليمنى، فيمينه في جهة يمين من ينظر إليه (قاعدة الصور).
   ===================================================================== */
const posKey = k => (k === 'besideR' || k === 'besideL') ? 'beside' : k;
const THING_H = { teddy: 72, doll: 68, ball: 40, cat: 52, car: 36, book: 16, bird: 40 };   /* ارتفاع كل شيء بلا تحجيم */
const THING_LABEL = k => labelText('th.' + k);
/* أخطاء المواضع: الوسم من الزوج (المطلوب، المختار) */
function posErr(w, g) { const p = new Set([w, g]), has = (a, b) => p.has(a) && p.has(b);
  if (/^g\d+$/.test(w)) { const a = +w.slice(1), b = +String(g).slice(1); return Math.abs(a - b) === 1 && a > 0 && b > 0 ? { ok: false, err: 'posBetween' } : { ok: false, err: 'posFrontBack' }; }   /* فراغات الطابور: g0 أمام الأول */
  if (has('in', 'on')) return { ok: false, err: 'posInOn' }; if (has('on', 'under')) return { ok: false, err: 'posOnUnder' };
  if (w === 'beside' || g === 'beside') return { ok: false, err: 'posBeside' };
  if (['inC', 'inS', 'both', 'none'].includes(w)) return { ok: false, err: 'posInOut' };
  if (has('front', 'behind')) return { ok: false, err: 'posFrontBack' }; if (w === 'between' || g === 'between') return { ok: false, err: 'posBetween' };
  return { ok: false, err: 'posWord' }; }

/* ---------- صورة الموضع: المرجع (صندوق، طاولة، شجرة، منطقتان) ومواضعه، وما يوضع فيها ---------- */
function posPic(svg, pic) { const P = { svg, pic, spots: {}, placed: [], marks: el('g', { 'pointer-events': 'none' }) };
  if (pic.ref === 'queue') { const n = pic.members.length, pitch = n > 2 ? 80 : 108, x0 = 280; shopAt(svg, 344, QY); el('rect', { x: -360, y: QY, width: 1080, height: 60, fill: css('--ground'), opacity: .55 }, svg);
    pic.members.forEach((c, i) => dollSideAt(svg, x0 - pitch * (i + .5), QY, c, { s: QS }));
    for (let i = 0; i <= n; i++) P.spots['g' + i] = { x: x0 - pitch * i, y: QY, s: QS, ry: QY - 50, gap: true };
    P.region = k => { const sp = P.spots[k]; return el('rect', { x: sp.x - 30, y: QY - 104, width: 60, height: 108, rx: 10 }); }; }
  else if (pic.ref === 'regions') { const R = regionsAt(svg, { cx: 140, cy: 140, r: 82, sx: 244, sy: 140, s: 132 }); P.R = R;   /* التداخل 44 وحدة: مكان «داخل الاثنين» واضح */
    P.spots = { inC: { x: 96, y: 140, s: 1 }, both: { x: 200, y: 140, s: 1 }, inS: { x: 280, y: 140, s: 1 }, none: { x: 56, y: 262, s: 1 } };
    P.region = k => k === 'inC' || k === 'both' ? el('circle', { cx: R.circle.cx, cy: R.circle.cy, r: R.circle.r }) : k === 'inS' ? el('rect', { x: R.square.sx - 66, y: R.square.sy - 66, width: 132, height: 132 }) : el('rect', { x: 10, y: 234, width: 340, height: 60, rx: 12 }); }
  else { (pic.ref === 'tree' ? yardBg : roomBg)(svg, 300, 196);
    if (pic.ref === 'chair') { chairAt(svg, 180, 284, { s: 1.6 });   /* الكرسي: مرجع لا يُتمرَّن عليه في الدرس، فتقيس به التقييماتُ نقلَ الكلمة إلى شيء جديد */
      P.spots = { on: { x: 172, y: 188, s: .8 }, under: { x: 178, y: 284, s: .72 }, besideR: { x: 56, y: 284, s: .9 }, besideL: { x: 304, y: 284, s: .9 } };
      P.region = k => k === 'on' ? el('rect', { x: 112, y: 120, width: 120, height: 70, rx: 10 }) : k === 'under' ? el('rect', { x: 140, y: 212, width: 76, height: 74, rx: 8 }) : el('rect', { x: k === 'besideL' ? 268 : 20, y: 216, width: 72, height: 72, rx: 10 }); }
    else if (pic.ref === 'chest') { const C = chestAt(svg, 180, 284, { open: pic.open !== false }); P.C = C; P.spots = { ...C.spots };
      P.spots.on = { ...P.spots.on, ry: P.spots.on.y - 36 }; P.spots.in = { ...P.spots.in, ry: C.top + 32 }; P.spots.under = { ...P.spots.under, ry: 262 }; P.spots.besideR = { ...P.spots.besideR, ry: 258 }; P.spots.besideL = { ...P.spots.besideL, ry: 258 };
      P.region = k => k === 'on' ? el('rect', { x: 110, y: 72, width: 152, height: 74, rx: 10 }) : k === 'in' ? el('rect', { x: 120, y: 154, width: 134, height: 66, rx: 8 }) : k === 'under' ? el('rect', { x: 132, y: 226, width: 96, height: 60, rx: 8 }) : el('rect', { x: k === 'besideL' ? 252 : 52, y: 220, width: 72, height: 68, rx: 10 }); }
    else if (pic.ref === 'table') { const T = tableAt(svg, 180, 284, { w: 176, h: 96 }); P.T = T;
      P.spots = { on: { x: 180, y: 188, s: .85 }, under: { x: 180, y: 284, s: .8 }, besideR: { x: 50, y: 284, s: .9 }, besideL: { x: 310, y: 284, s: .9 } };
      P.region = k => k === 'on' ? el('rect', { x: 120, y: 118, width: 120, height: 70, rx: 10 }) : k === 'under' ? el('rect', { x: 120, y: 214, width: 120, height: 72, rx: 8 }) : el('rect', { x: k === 'besideL' ? 274 : 14, y: 216, width: 72, height: 72, rx: 10 }); }
    else if (pic.ref === 'tree') { treeAt(svg, 180, 284, { s: 1.05 });
      P.spots = { on: { x: 180, y: 128, s: .8 }, besideR: { x: 96, y: 284, s: .9 }, besideL: { x: 264, y: 284, s: .9 }, far: { x: 330, y: 214, s: .55 } };
      P.region = k => k === 'on' ? el('rect', { x: 140, y: 60, width: 80, height: 70, rx: 10 }) : el('rect', { x: k === 'besideL' ? 228 : 60, y: 222, width: 72, height: 66, rx: 10 }); } }
  svg.appendChild(P.marks);
  P.put = (k, at) => { const sp = P.spots[at]; let g;
    if (k === 'star') g = starAt(svg, sp.x, sp.y, {});
    else if (DOLL_COLORS[k]) g = dollSideAt(svg, sp.x, sp.y, k, { s: sp.s });
    else if (at === 'in' && P.C) { P.C.setLid(true); g = placeThingAt(P.C.mid, k, sp.x - P.C.x, P.C.top - P.C.y + .45 * (THING_H[k] || 50) * sp.s, { scale: sp.s }); }   /* يطلّ نحو نصفه فوق الجدار الأمامي */
    else { if (at === 'on' && P.C) P.C.setLid(false); g = placeThingAt(svg, k, sp.x, sp.y, { scale: sp.s }); }
    if (P.marks.parentNode) svg.appendChild(P.marks); P.placed.push({ k, at, g }); return g; };
  P.glow = async (at, ms = 1600) => { const r = P.region(at); r.setAttribute('fill', css('--compass')); r.setAttribute('fill-opacity', .16); r.setAttribute('stroke', css('--compass')); r.setAttribute('stroke-width', 4); r.setAttribute('stroke-dasharray', '8 6'); P.marks.appendChild(r);
    await anim(r, [{ opacity: 0 }, { opacity: 1 }, { opacity: 1 }, { opacity: 0 }], { duration: ms }).done; r.remove(); };
  for (const [k, at] of pic.put || []) P.put(k, at);
  return P; }
/* موضع الحلقة: ry إن حُدّد (حلقات الصندوق متباعدة 64 على الأقل، D255)، وإلا مركز جسم الشيء فوق مرساه */
const bodyY = (sp, k) => sp.ry != null ? sp.ry : k === 'star' ? sp.y : sp.y - 28 * (sp.s || 1);

/* ---------- ضع الشيء في موضعه: يُسحب إلى حلقة، أو تُلمس الحلقة فيذهب إليها (بديل السحب، D246) ----------
   spots: [{k, x, y (مركز الحلقة)}]؛ يعيد مفتاح الحلقة. ولا تُعلن الحلقة موضعها (اسمها «مكان»)، فلا يُعرف الجواب من قارئ الشاشة */
function spotPick(svg, thing, home, spots, okKeys, opt = {}) {
  const rings = spots.map(s => { const g = el('g', { transform: `translate(${s.x} ${s.y})`, role: 'button', tabindex: 0, 'aria-label': plain(labelText('spot')), style: 'cursor:pointer', 'data-spot': s.k }, opt.layer || svg);
    el('circle', { r: 30, fill: '#fff', 'fill-opacity': .25, stroke: css('--compass'), 'stroke-width': 3, 'stroke-dasharray': '7 6' }, g); hitPad(g, 64, 56);
    /*T*/if (TESTHOOK) g.dataset.ok = [].concat(okKeys).includes(s.k);/*/T*/ return { ...s, g }; });
  if (opt.strong) { const r = rings.find(q => [].concat(okKeys).includes(q.k)); if (r) { r.g.querySelector('circle').setAttribute('stroke-width', 6); anim(r.g, [{ opacity: .5 }, { opacity: 1 }], { duration: 600, iterations: 4, direction: 'alternate' }); } }
  svg.appendChild(thing); thing.style.cursor = 'grab'; thing.setAttribute('role', 'button'); thing.setAttribute('aria-label', plain(opt.label || labelText('thing'))); hitPad(thing, 64, 64);
  const okR = rings.find(r => [].concat(okKeys).includes(r.k)) || rings[0], badR = rings.find(r => r !== okR && ![].concat(okKeys).includes(r.k)) || okR;
  AUTO({ kind: 'place', ok: () => okR.g.dispatchEvent(new MouseEvent('click', { bubbles: true })), wrong: () => badR.g.dispatchEvent(new MouseEvent('click', { bubbles: true })) });
  const off = pulse(rings.map(r => r.g)); let done = false, cleanup = null;
  const p = gate(new Promise(res => {
    cleanup = () => { done = true; off(); rings.forEach(q => q.g.remove()); thing.style.cursor = ''; thing.removeAttribute('role'); thing.querySelectorAll(':scope > rect.hit').forEach(h => h.remove()); };
    const finish = r => { if (done) return; cleanup(); AUTO_CLEAR(); hush(); SFX.tick(); res(r.k); };
    rings.forEach(r => { r.g.onclick = () => finish(r); r.g.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') finish(r); }; });
    let d = null; const base = thing.getAttribute('transform') || '';
    thing.addEventListener('pointerdown', e => { if (done) return; d = { sx: e.clientX, sy: e.clientY }; try { thing.setPointerCapture(e.pointerId); } catch (x) {} });
    thing.addEventListener('pointermove', e => { if (!d) return; const m = svg.getScreenCTM(); thing.setAttribute('transform', `translate(${(e.clientX - d.sx) / m.a} ${(e.clientY - d.sy) / m.d}) ` + base); });
    const up = e => { if (!d || done) { d = null; return; } const p = svgPoint(svg, e); d = null; const near = rings.map(r => ({ r, dd: Math.hypot(r.x - p.x, r.y - p.y) })).sort((a, b) => a.dd - b.dd)[0];
      thing.setAttribute('transform', base); if (near && near.dd < 58) finish(near.r); };
    thing.addEventListener('pointerup', up); thing.addEventListener('pointercancel', () => { d = null; thing.setAttribute('transform', base); }); }));
  p.cancel = () => { if (!done) cleanup(); }; return p; }   /* إلغاء الانتظار (زرّ آخر أجاب): لا تبقى الحلقات ولا سحب الشيء */
/* رفّ صغير في أعلى المسرح يقف عليه ما سيوضع */
function trayAt(svg, x = 300, y = 86) { el('rect', { x: x - 40, y, width: 80, height: 10, rx: 4, fill: MAT.wood, stroke: PL_EDGE, 'stroke-width': 2.5 }, svg); return { x, y }; }

/* ================= أين هو؟ (تعرّف C010): كلمة الموضع من خيارات مسموعة، أو لمس الشيء الذي في الموضع ================= */
ITEM.where = {
  make(spec) { return { ...spec, tag: 'where', want: spec.want || posKey(spec.pic.at) }; },
  async ask(item) { const svg = newStage(300, null); const pic = item.ask === 'thing' ? item.pic : { ...item.pic, put: [[item.pic.thing, item.pic.at], ...(item.pic.put || [])] }; const P = posPic(svg, pic);
    if (item.ask === 'thing') { say(...lineOf(item.q), { free: true });
      /* ما في داخل الصندوق يطلّ نصفه فوق جداره الأمامي: اللمس على الجدار يبلغه (الفحص المستقل D: كانت لمسة وسط الكرة تقع على الجدار فلا يحدث شيء) */
      if (P.C) P.C.front.setAttribute('pointer-events', 'none');
      const k = await tapOne(P.placed.map(t => ({ g: t.g, k: posKey(t.at), label: THING_LABEL(t.k) })), { ok: item.want, pad: 64 }); hush(); return { ans: k, ctx: { svg, P } }; }
    say(...lineOf(item.q), { free: true });
    const k = await choosePick(item.words.map(o => [o, T('gen.pos.' + o), '', 'gen.pos.' + o]), item.want); hush(); return { ans: k, ctx: { svg, P } }; },
  judge(item, k) { return k === item.want ? { ok: true } : posErr(item.want, k); },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { await r.ctx.P.glow(item.ask === 'thing' ? (Object.keys(r.ctx.P.spots).find(s => posKey(s) === item.want)) : item.pic.at); },
  async together(item) { await S('gen.solve.pos.' + item.want); },
  async reveal(item, r) { await r.ctx.P.glow(item.ask === 'thing' ? (Object.keys(r.ctx.P.spots).find(s => posKey(s) === item.want)) : item.pic.at, 1200); await S('gen.pos.' + item.want); },
  mark(item, r) { r.ctx.P.glow(item.ask === 'thing' ? (Object.keys(r.ctx.P.spots).find(s => posKey(s) === item.want)) : item.pic.at, 900); },
  praise: () => 'praisePlace', reason(item) { return item.why || null; }, twin(item) { return item.twin || null; },
};
/* ================= ضع الشيء في موضعه (إنتاج C010) ================= */
/* كلمة الموضع المطلوب: فراغات الطابور مفاتيحها g0…gN، فأمامَ الأول، وخلفَ الأخير، وبين اثنين لما بينهما (الفحص المستقل B: «gen.solve.pos.g1» غير موجودة) */
const placeWord = item => item.word || (item.ref === 'queue' ? (item.want === 'g0' ? 'front' : item.want === 'g' + item.members.length ? 'behind' : 'between') : posKey(item.want));   /* word: كلمة السؤال نفسه («في آخر الطابور» ← الأخير) */
ITEM.place = {
  make(spec) { return { ...spec, tag: 'place', want: spec.at }; },
  async ask(item, mode, tries) { const svg = item.ref === 'queue' ? newStage(QH, { oasis: false, ground: 0 }) : newStage(300, null); const P = posPic(svg, { ref: item.ref, put: item.put || [], open: true, members: item.members });
    /* والرفّ في المنطقتين فوق زاوية المربع لا عليها (الفحص المستقل B: بدأت النجمة على زاويته) */
    const tr = item.ref === 'queue' ? trayAt(svg, 60, 76) : item.ref === 'regions' ? trayAt(svg, 316, 44) : trayAt(svg); const home = { x: tr.x, y: tr.y, s: item.thing === 'star' ? 1 : .75 };
    const th = item.thing === 'star' ? starAt(svg, home.x, home.y - 24, {}) : DOLL_COLORS[item.thing] ? dollSideAt(svg, home.x, home.y, item.thing, { s: .7 }) : placeThingAt(svg, item.thing, home.x, home.y, { scale: home.s });
    const keys = item.spots || Object.keys(P.spots).filter(k => k !== 'far');
    const spots = keys.map(k => ({ k, x: P.spots[k].x, y: bodyY(P.spots[k], item.thing) }));
    if (tries >= 3) await S('gen.solve.pos.' + placeWord(item));
    say(...lineOf(item.q), { free: true });
    const okKeys = keys.filter(k => posKey(k) === item.want);
    const k = await spotPick(svg, th, home, spots, okKeys, { label: THING_LABEL(item.thing), strong: tries >= 3 });
    th.remove(); P.put(item.thing, k); return { ans: posKey(k), ctx: { svg, P, at: k } }; },
  judge(item, k) { return k === item.want ? { ok: true } : posErr(item.want, k); },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { await r.ctx.P.glow(Object.keys(r.ctx.P.spots).find(s => posKey(s) === item.want)); },
  async together() {},
  async reveal(item, r) { const P = r.ctx.P; P.placed.forEach(t => t.g.remove()); P.placed.length = 0; for (const [k, at] of item.put || []) P.put(k, at); P.put(item.thing, Object.keys(P.spots).find(s => posKey(s) === item.want)); SFX.pop();
    /* الكشف يقول كلمة الموضع (الفحص المستقل B: كان صامتاً)، ومنطقتا الدائرة والمربع بجملة حلّهما */
    const w = placeWord(item); await S(hasLine('gen.pos.' + w) ? 'gen.pos.' + w : 'gen.reveal.pos.' + w); await sleep(500); },
  mark(item, r) { r.ctx.P.glow(Object.keys(r.ctx.P.spots).find(s => posKey(s) === item.want), 900); },
  praise: () => 'praisePlace', reason(item) { return item.why || null; }, twin(item) { return item.twin || null; },
};

/* ================= الصفّ: الطابور إلى الدكّان، والقطار (N008، C010) =================
   row = {kind:'queue', members:[لون…] (الأول أولاً، الأقرب إلى الدكّان)} أو {kind:'train', n, things:{رقم العربة: شيء}}.
   الفهرس من المقدّمة: 0 الأول. والقطار أطول من المسرح فيُحرَّك (panStrip)، ويبدأ عند القاطرة */
const QH = 240, QY = 206, QS = 1.18, TH = 240, TY = 176;   /* مسرح الطابور والقطار: أقصر، فالدببة والعربات أكبر على الشاشة */
const ROW_OFF = new WeakMap();
function rowPic(svg, row, opt = {}) { const R = { row, members: [] };
  if (row.kind === 'queue') { const n = row.members.length, pitch = n > 4 ? 58 : 68; shopAt(svg, 340, QY);
    el('rect', { x: -360, y: QY, width: 1080, height: 60, fill: css('--ground'), opacity: .55 }, svg);
    row.members.forEach((c, i) => { const x = 280 - i * pitch; const g = c === 'chaos' ? chaosAt(svg, x, QY - 46, .62) : dollSideAt(svg, x, QY, c, { s: QS }); R.members.push({ g, x, y: QY, k: i, c }); });
    R.front = el('g', {}, svg); R.at = i => R.members[i]; return R; }
  const n = row.n || 10, pitch = 64, contentW = 80 + n * pitch + 24, w = 360; const H = +svg.getAttribute('viewBox').split(' ')[3], y = opt.y || TY;
  const S = panStrip(svg, { x0: 0, w, y0: y - 120, y1: y + 14, contentW, step: pitch, off: contentW - w, btnY: y + 38 }); R.S = S;
  el('rect', { x: 0, y: y, width: contentW, height: 6, fill: '#8d7a62' }, S.g); const ex = contentW - 50; R.loco = locoAt(S.g, ex, y);
  /* ألوان العربات تبدأ من لون عشوائي لكل قطار (ثابت للبند في محاولاته): لو ثبت لون كل ترتيب (السادسة زرقاء دائماً) لتذكّر الطفل اللون لا العدّ من المقدّمة */
  if (!ROW_OFF.has(row)) ROW_OFF.set(row, Math.floor(rand() * CAR_COLORS.length)); const off = ROW_OFF.get(row);
  for (let k = 1; k <= n; k++) { const x = ex - 48 - (k - .5) * pitch + 4; const c = carAt(S.g, x, y, k, { color: CAR_COLORS[(k - 1 + off) % CAR_COLORS.length] }); const th = (row.things || {})[k];
    if (th) placeThingAt(c.mid, th, 0, -26, { scale: .62 }); S.track(c.g, x - 30, x + 30); c.g.dataset.car = k - 1; R.members.push({ g: c.g, x, y, k: k - 1, car: c }); }
  S.update(); R.at = i => R.members[i]; R.H = H; return R; }
/* يُظهر العضو في نافذة القطار (إن كان خارجها) */
const rowShow = (R, i) => R.S ? R.S.show(R.members[i].x - 30, R.members[i].x + 30) : Promise.resolve();
function lineWant(item) { const n = item.row.kind === 'queue' ? item.row.members.length : (item.row.n || 10);
  switch (item.ask) { case 'first': return 0; case 'last': return n - 1; case 'front': return item.ref - 1; case 'behind': return item.ref + 1;
    case 'between': return (item.a + item.b) / 2; case 'ord': case 'which': case 'kamAyn': return item.k - 1; default: return item.ans; } }
function lineErr(item, got) { const n = item.row.kind === 'queue' ? item.row.members.length : (item.row.n || 10), w = item.want;
  if (item.ask === 'riddle') return { ok: false, err: (item.errs || {})[got] || 'posWord' };
  if (item.ask === 'first' || item.ask === 'last') return got === n - 1 - w ? { ok: false, err: item.ask === 'first' ? 'ordFirstLast' : 'ordLastFirst' } : { ok: false, err: 'ordWrong' };
  if (item.row.kind === 'queue' && item.ask === 'ord' && got === n - 1 - w) return { ok: false, err: 'posFrontBack' };   /* عدّ الطابور من آخره: لم يرَ اتجاهه */
  if (item.ask === 'front' || item.ask === 'behind') return got === 2 * item.ref - w ? { ok: false, err: 'posFrontBack' } : { ok: false, err: 'posWord' };
  if (item.ask === 'between') return Math.abs(got - w) === 1 ? { ok: false, err: 'posBetween' } : { ok: false, err: 'posWord' };
  if (got === n - 1 - w) return { ok: false, err: 'ordFromBack' };
  if (Math.abs(got - w) === 1) return { ok: false, err: 'ordOff' };
  return { ok: false, err: 'ordWrong' }; }
/* عدّ مع الطفل من المقدّمة حتى قبل المطلوب (المستوى 3)، أو كله (الكشف) */
async function rowCount(R, upto, g = 'f') { const m = el('g', { 'pointer-events': 'none' }, R.S ? R.S.g : R.members[0].g.ownerSVGElement);
  for (let i = 0; i < upto; i++) { await rowShow(R, i); const M = R.members[i]; badge(m, M.x, M.y - (R.S ? 70 : 118), i + 1, css('--compass')); SFX.tick(); await S('gen.ord.' + g + '.' + String(i + 1).padStart(2, '0'), { num: true, noGap: true }); await sleep(120); }
  return m; }
/* المقدّمة: القاطرة أو الدكّان تومض، وسهم باتجاه السير */
/* keep (الحلّ المشترك): السهم يبقى حين يجيب الطفل */
async function rowFront(R, keep = false) { const svg = R.members[0].g.ownerSVGElement; if (R.S) await R.S.setOff(R.S.max);
  const x = R.S ? R.S.at(R.members[0].x + 52) : 320, y = R.S ? 92 : 132; const a = el('g', { transform: `translate(${x} ${y})`, 'pointer-events': 'none' }, svg);
  el('path', { d: 'M-46 0 H20 M6 -14 L22 0 L6 14', fill: 'none', stroke: css('--compass'), 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, a);
  if (keep) { await anim(a, [{ opacity: 0 }, { opacity: 1 }], { duration: 600, fill: 'forwards' }).done; return a; }
  await anim(a, [{ opacity: 0 }, { opacity: 1 }, { opacity: 1 }, { opacity: 0 }], { duration: 1700 }).done; a.remove(); }
/* ================= المس العضو (إنتاج N008، ومواضع الطابور) ================= */
ITEM.lineTap = {
  make(spec) { const it = { ...spec, tag: 'line:' + spec.ask }; it.want = lineWant(it); return it; },
  async ask(item, mode, tries) { const svg = newStage(item.row.kind === 'queue' ? QH : TH, { oasis: false, ground: 0 }); const R = rowPic(svg, item.row);
    if (item.badge) for (const [i, kind] of item.badge) ordBadgeAt(R.S ? R.S.g : svg, R.members[i].x, R.members[i].y - (R.S ? 66 : 124), kind);
    /* «ضع الكرة في العربة الرابعة» (لعبة الدرس 2): الكرة على رفّ فوق القطار، وتقع في العربة حين يلمسها الطفل */
    let dropG = null; if (item.drop) { const tr = trayAt(svg, 54, 44); dropG = placeThingAt(svg, item.drop, tr.x, tr.y, { scale: .7 }); }
    const ordG = item.row.kind === 'queue' ? 'm' : (item.g || 'f');   /* الدببة: الأول… العاشر؛ والعربات: الأولى… العاشرة */
    let mk = null; if (tries >= 3) { if (item.row.kind === 'train' || item.ask === 'ord') { mk = item.want > 0 ? await rowCount(R, Math.min(item.want, 9), ordG) : await rowFront(R, true); mk.dataset.help = 1; } else await S('gen.solve.pos.' + (['front', 'behind', 'between', 'first', 'last'].includes(item.ask) ? item.ask : 'riddle')); }
    let painted = null;
    if (item.ask === 'kamAyn') { painted = await paintN(svg, R, item); }
    say(...lineOf(item.ask === 'kamAyn' ? item.q2 : item.q), { free: true });
    const k = await tapOne(R.members.map(M => ({ g: M.g, k: M.k, label: item.row.kind === 'train' ? labelText('car') : labelText('dollQ') })), { ok: item.want, pad: 60 }); hush();
    if (mk) mk.remove(); return { ans: { k, painted }, ctx: { svg, R, dropG } }; },
  judge(item, a) { if (item.ask === 'kamAyn' && a.painted.length !== item.k) return { ok: false, err: 'ordKamCount' };
    if (a.k === item.want) return { ok: true };
    if (item.ask === 'kamAyn' && a.k === Math.max(...a.painted)) return { ok: false, err: 'ordKamAyn' };   /* «الثالثة» آخرُ ما لوّن، لا الثالثة من المقدّمة */
    return lineErr(item, a.k); },
  onOk(item, r) { SFX.good(); const M = r.ctx.R.members[r.ans.k]; if (item.drop && M.car) { if (r.ctx.dropG) r.ctx.dropG.remove(); placeThingAt(M.car.mid, item.drop, 0, -26, { scale: .62 }); }
    el('circle', { cx: M.x, cy: M.y - (r.ctx.R.S ? 24 : 58), r: 36, fill: 'none', stroke: css('--good'), 'stroke-width': 5, 'pointer-events': 'none' }, r.ctx.R.S ? r.ctx.R.S.g : r.ctx.svg); },
  onWrong() { SFX.soft(); },
  async hint2(item, r) { await rowFront(r.ctx.R); },
  async together() {},
  async reveal(item, r) { const R = r.ctx.R; if ((R.S || item.ask === 'ord') && item.want < 10) { const m = await rowCount(R, item.want + 1, R.S ? (item.g || 'f') : 'm'); await sleep(500); m.remove(); } await rowShow(R, item.want); ITEM.lineTap.mark(item, r);
    /* ومواضع الطابور تُقال مع الكشف بجملة معناها (الفحص المستقل B: كان صامتاً)، بلا «أكمل الآن» (الفحص المستقل C) */
    if (item.row.kind === 'queue' && item.ask !== 'ord') await S('gen.reveal.pos.' + item.ask); else await sleep(700); },
  mark(item, r) { const R = r.ctx.R, M = R.members[item.want]; el('circle', { cx: M.x, cy: M.y - (R.S ? 24 : 58), r: 36, fill: 'none', stroke: css('--good'), 'stroke-width': 5, 'pointer-events': 'none' }, R.S ? R.S.g : r.ctx.svg); },
  /* مواضع الطابور (أمام وخلف وبين، والأول والأخير، واللغز) تُمدح بالمكان، والعدّ الترتيبي بالترتيب (الفحص المستقل C: «عددتَ من المقدّمة!» بعد «من بين…؟») */
  praise: item => item.row.kind === 'queue' && item.ask !== 'ord' ? 'praisePlace' : 'praiseOrder', reason(item) { return item.why || null; }, twin(item) { return item.twin || null; },
};
/* «لوّن ثلاث عربات»: يلمس الطفل العربات فتتلوّن (ولمسة ثانية تمحو)، ثم «تمّ» */
async function paintN(svg, R, item) { const set = new Set(); say(...lineOf(item.q), { free: true });
  const marks = new Map(); const tog = M => { if (set.has(M.k)) { set.delete(M.k); marks.get(M.k).remove(); } else { set.add(M.k); const p = el('rect', { x: M.x - 28, y: M.y - 34, width: 56, height: 24, rx: 4, fill: '#f2b33d', 'pointer-events': 'none' }, R.S.g); marks.set(M.k, p); } SFX.pop(); };
  R.members.forEach(M => { M.g.style.cursor = 'pointer'; M.g.setAttribute('role', 'button'); M.g.setAttribute('aria-label', plain(labelText('car'))); hitPad(M.g, 60); M.g.onclick = () => tog(M); });
  const d = doneBtn(); AUTO({ kind: 'paint', ok: () => { for (let i = item.k - 1; i >= 0; i--) if (!set.has(i)) tog(R.members[i]); d.b.click(); }, wrong: () => { if (!set.size) { tog(R.members[0]); tog(R.members[1]); } d.b.click(); } });
  await gate(new Promise(res => d.b.onclick = () => { AUTO_CLEAR(); hush(); d.bar.remove(); res(); }));
  R.members.forEach(M => { M.g.onclick = null; }); return [...set].sort((a, b) => a - b); }
/* ================= أيّ عربة؟ (تعرّف N008): العدد الترتيبي من خيارات مسموعة ================= */
ITEM.linePick = {
  make(spec) { const it = { ...spec, tag: 'line:which' }; it.want = spec.k; return it; },
  async ask(item, mode, tries) { const svg = newStage(TH, { oasis: false, ground: 0 }); const R = rowPic(svg, item.row);   /* يبدأ عند القاطرة: يعدّ الطفل من المقدّمة ويحرّك القطار بنفسه */
    const g = item.g || 'f', id = n => 'gen.ord.' + g + '.' + String(n).padStart(2, '0');
    /* الحلّ المشترك (المستوى 3): نعدّ معاً من المقدّمة حتى قبل المطلوب على قطار هذه المحاولة، فتبقى الأعداد أمام الطفل حين يختار
       (الفحص المستقل C: كان العدّ على القطار السابق ثم يُمحى ويُرسم قطار نظيف قبل السؤال، D257(5)(و)) */
    if (tries >= 3) (item.k > 1 ? await rowCount(R, item.k - 1, g) : await rowFront(R, true)).dataset.help = 1;   /* والأولى: سهم المقدّمة يبقى (الفحص المستقل D: كان لا شيء) */
    say(...lineOf(item.q), { free: true }); const k = await choosePick(item.opts.map(n => ['o' + n, T(id(n)), '', id(n)]), 'o' + item.k); hush(); return { ans: +k.slice(1), ctx: { svg, R } }; },
  judge(item, k) { const n = item.row.n || 10; return k === item.k ? { ok: true } : (k === n + 1 - item.k ? { ok: false, err: 'ordFromBack' } : Math.abs(k - item.k) === 1 ? { ok: false, err: 'ordOff' } : { ok: false, err: 'ordWrong' }); },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { await rowFront(r.ctx.R); },
  async together() {},   /* في ask عند المحاولة الرابعة (tries >= 3) */
  async reveal(item, r) { const m = await rowCount(r.ctx.R, item.k, item.g || 'f'); await sleep(500); m.remove(); },
  mark() {}, praise: () => 'praiseOrder', reason(item) { return item.why || null; }, twin(item) { return item.twin || null; },
};

/* ================= اليمين واليسار (C011): الطفل من ظهره، والشريط على يده اليمنى (يُخفى في الفحص، ويظهر تلميحاً) ================= */
function lrPic(svg, item) { roomBg(svg, 300, 200); const K = kidBackAt(svg, 180, 286, { ribbon: item.ribbon === false ? null : 'R', raise: item.raise || null, s: 1.08 });
  const out = { K, things: {} };
  /* ما في اليد مرفوع عن الأرض، واليد فوق أعلاه تمسكه (الفحص المستقل C: كان يُرسم على الأرض بجانب الرجلين، فلا يُرى في اليد) */
  for (const [side, th] of Object.entries(item.hold || {})) { const h = K.hand(side), H0 = THING_H[th] || 50, sc = Math.min(.9, Math.max(.5, 40 / H0)), H = H0 * sc;   /* بحجم اليد: نحو 40 وحدة، والصغير (الكتاب) لا يصغر */
    out.things[side] = placeThingAt(svg, th, h.x + (side === 'R' ? 8 : -8), h.y + H * .7, { scale: sc }); }
  if (item.hold) { svg.appendChild(K.g); K.g.setAttribute('pointer-events', 'none'); }   /* واللمس على اليد يبلغ ما تمسكه */
  if (item.thing) { const x = item.side === 'R' ? 290 : 70; out.things[item.side] = placeThingAt(svg, item.thing, x, 286, { scale: .9 }); }
  return out; }
const showRibbon = async (svg, K) => { const h = K.hand('R'); const r = el('rect', { x: h.x - 11, y: h.y - 18, width: 22, height: 10, rx: 3, fill: '#f2b33d', stroke: '#fff', 'stroke-width': 2, 'pointer-events': 'none' }, svg);
  await anim(r, [{ opacity: 0 }, { opacity: 1 }, { opacity: .4 }, { opacity: 1 }], { duration: 1400 }).done; return r; };
/* الحلّ المشترك في اليمين واليسار (المستوى 3): هالة حول يد الطفل اليمنى وسهم إليها من خارجه، والجملة عن اليمنى أياً كان المطلوب،
   فيدلّ السهم والجملة على اليد نفسها، والخطوة الأخيرة للطفل؛ ويبقيان أمامه حين يجيب (D257(5)(و)). وكان السهم يشير إلى الجهة المطلوبة
   والجملة تقول «اليمنى» في كل بند، ثم يُمحى قبل أن يلمس الطفل (الفحص المستقل C) */
async function lrTogether(svg, C, side) { const K = C.K, h = K.hand('R'), c = css('--compass'); const g = el('g', { 'pointer-events': 'none', 'data-help': 1 }, svg);
  const held = Object.values(C.things || {})[0]; if (held && held.parentNode === svg) svg.insertBefore(g, held);   /* تحت ما في اليد، فلا تغطّي الهالةُ الكتاب (الفحص المستقل D) */
  el('circle', { cx: h.x, cy: h.y, r: 20, fill: 'none', stroke: c, 'stroke-width': 5 }, g);
  el('path', { d: `M${h.x + 58} ${h.y - 58} L${h.x + 22} ${h.y - 22} M${h.x + 22} ${h.y - 42} V${h.y - 22} H${h.x + 42}`, fill: 'none', stroke: c, 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
  await S(side === 'L' ? 'gen.lr.togetherL' : 'gen.lr.together'); await anim(g, [{ opacity: 1 }, { opacity: .35 }, { opacity: 1 }], { duration: 900 }).done; return g; }
ITEM.lrTap = {
  make(spec) { return { ...spec, tag: 'lr:' + (spec.ask || 'hand'), want: spec.side }; },
  async ask(item, mode, tries) { const svg = newStage(300, null); const C = lrPic(svg, item);
    if (tries >= 3) await lrTogether(svg, C, item.side);
    say(...lineOf(item.q), { free: true });
    const tg = item.ask === 'hold' ? ['R', 'L'].map(s => ({ g: C.things[s], k: s, label: THING_LABEL(item.hold[s]) }))
      : ['R', 'L'].map(s => { const h = C.K.hand(s); const g = el('g', { transform: `translate(${h.x} ${h.y})` }, svg); el('circle', { r: 22, fill: 'transparent' }, g); return { g, k: s, label: labelText('hand') }; });
    const k = await tapOne(tg, { ok: item.side, pad: 64 }); hush(); return { ans: k, ctx: { svg, C } }; },
  judge(item, k) { return k === item.side ? { ok: true } : { ok: false, err: 'lrSwap' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const m = await showRibbon(r.ctx.svg, r.ctx.C.K); await sleep(500); m.remove(); },
  async together() {},
  async reveal(item, r) { ITEM.lrTap.mark(item, r); await S(item.side === 'R' ? 'gen.lr.isRight' : 'gen.lr.isLeft'); },
  mark(item, r) { const h = r.ctx.C.K.hand(item.side); el('circle', { cx: h.x, cy: h.y, r: 30, fill: 'none', stroke: css('--good'), 'stroke-width': 5, 'pointer-events': 'none' }, r.ctx.svg); },
  praise: () => 'praisePlace', reason(item) { return item.why || null; }, twin(item) { return item.twin || null; },
};
/* الشيء على يمين الطفل أم يساره؟ (تعرّف C011) */
ITEM.lrPick = {
  make(spec) { return { ...spec, tag: 'lr:side', want: spec.side }; },
  async ask(item, mode, tries) { const svg = newStage(300, null); const C = lrPic(svg, item); if (tries >= 3) await lrTogether(svg, C, item.side); say(...lineOf(item.q), { free: true });
    const k = await choosePick([['R', T('gen.pos.right'), '', 'gen.pos.right'], ['L', T('gen.pos.left'), '', 'gen.pos.left']], item.side); hush(); return { ans: k, ctx: { svg, C } }; },
  judge(item, k) { return k === item.side ? { ok: true } : { ok: false, err: 'lrSwap' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const m = await showRibbon(r.ctx.svg, r.ctx.C.K); await sleep(500); m.remove(); },
  async together() {},   /* في ask عند المحاولة الرابعة (tries >= 3) */
  async reveal(item) { await S(item.side === 'R' ? 'gen.pos.right' : 'gen.pos.left'); },
  mark() {}, praise: () => 'praisePlace', reason(item) { return item.why || null; }, twin(item) { return item.twin || null; },
};

/* ================= الروبوت (C013): يُرى من خلفه أولاً؛ «تقدّم» ينقله خانة، و«انعطف» يديره في مكانه ربع دورة ================= */
const RB_STEP = [[0, -1], [1, 0], [0, 1], [-1, 0]];
function rbRun(prog, st = { c: 2, r: 3, dir: 0 }) { let { c, r, dir } = st; const path = [{ c, r, dir }];
  for (const t of prog) { if (t === 'F') { c += RB_STEP[dir][0]; r += RB_STEP[dir][1]; } else if (t === 'R') dir = (dir + 1) % 4; else if (t === 'L') dir = (dir + 3) % 4; path.push({ c, r, dir }); }
  return { c, r, dir, path }; }
const RB_ICON = { F: '<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true"><path d="M20 34 V8 M9 18 L20 6 L31 18" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  R: '<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true"><path d="M12 32 V20 Q12 10 24 10 H30 M24 3 L31 10 L24 17" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  L: '<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true"><path d="M28 32 V20 Q28 10 16 10 H10 M16 3 L9 10 L16 17" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  X: '<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true"><path d="M34 12 H16 L6 20 L16 28 H34 Z M20 16 L28 24 M28 16 L20 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/></svg>',
  G: '<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true"><path d="M13 8 L32 20 L13 32 Z" fill="currentColor"/></svg>' };
/* لوحة وروبوت: يعيد {B, bot, show(state), run(prog)} */
function rbBoard(svg, start, opt = {}) { const B = boardAt(svg, { cols: 5, rows: 4, cell: 54, y0: opt.y0 ?? 58 }); let st = { ...start };
  /* الهدف نجمة، أو كنز حين يقول الأمر «إلى الكنز» (star.k، الفحص المستقل B: قال «الكنز» والهدف نجمة) */
  if (opt.star) { const p = B.at(opt.star.c, opt.star.r); if (opt.star.k === 'treasure') treasureAt(svg, p.x, p.y + 12, .55); else starAt(svg, p.x, p.y, { s: .8 }); }
  const holder = el('g', {}, svg); let bot = null;
  const show = s => { st = { ...s }; holder.innerHTML = ''; const p = B.at(s.c, s.r); bot = robotTopAt(holder, p.x, p.y, { dir: s.dir, s: 1 }); };
  show(start);
  let runId = 0;   /* تشغيل جديد يوقف القديم (إعادة الحركة مع «أعد الجملة» ثم التلميح) */
  const run = async (prog, from = start) => { const me = ++runId; let s = { ...from }; show(s);
    for (const t of prog) { if (me !== runId) return s; const n = rbRun([t], s); const a = B.at(s.c, s.r), b = B.at(n.c, n.r);
      if (n.c < 0 || n.r < 0 || n.c >= B.cols || n.r >= B.rows) { SFX.soft(); await anim(bot, [{ transform: `translate(${a.x}px,${a.y}px) rotate(${s.dir * 90}deg)` }, { transform: `translate(${a.x + (b.x - a.x) * .25}px,${a.y + (b.y - a.y) * .25}px) rotate(${s.dir * 90}deg)` }, { transform: `translate(${a.x}px,${a.y}px) rotate(${s.dir * 90}deg)` }], { duration: 500 }).done; continue; }
      const to = t === 'L' ? s.dir * 90 - 90 : t === 'R' ? s.dir * 90 + 90 : s.dir * 90;
      await anim(bot, [{ transform: `translate(${a.x}px,${a.y}px) rotate(${s.dir * 90}deg)` }, { transform: `translate(${b.x}px,${b.y}px) rotate(${to}deg)` }], { duration: t === 'F' ? 520 : 600, easing: 'ease-in-out', fill: 'forwards' }).done;
      if (me !== runId) return s; s = { c: n.c, r: n.r, dir: n.dir }; show(s); SFX.tick(); await sleep(120); }
    return s; };
  return { B, show, run, get state() { return st; } }; }
/* شريط الأوامر: يبني الطفل البرنامج (حتى 4 أوامر) ثم «انطلق» */
function progBuilder(svg, max, pre = []) { const prog = [...pre]; const slots = el('g', {}, svg);
  const draw = () => { slots.innerHTML = ''; for (let i = 0; i < max; i++) { const x = 300 - i * 62; const g = el('g', { transform: `translate(${x} 26)` }, slots);
      /* الخانة الفارغة على ورق نصف شفاف بحدّ أوضح، فتُرى فوق الغيوم (الفحص المستقل B) */
      el('rect', { x: -26, y: -20, width: 52, height: 40, rx: 8, fill: css('--paper'), 'fill-opacity': prog[i] ? 1 : .6, stroke: prog[i] ? css('--line') : css('--muted'), 'stroke-width': 3, 'stroke-dasharray': prog[i] ? null : '5 4' }, g);
      if (prog[i]) { const t = el('g', { transform: 'translate(-17 -17) scale(.85)', color: css('--compass') }, g); t.innerHTML = RB_ICON[prog[i]].replace(/<\/?svg[^>]*>/g, ''); } } };
  draw();
  const box = document.createElement('div'); box.className = 'choices icons rbbar'; $('#stage').appendChild(box);
  const mk = (k, lbl, line) => { const b = document.createElement('button'); b.className = 'pick rb'; b.dataset.k = k; b.innerHTML = RB_ICON[k] + `<span>${esc(G(labelText(lbl)))}</span>`; b.setAttribute('aria-label', plain(G(labelText(lbl)))); box.appendChild(b); return b; };
  const bF = mk('F', 'rbF'), bR = mk('R', 'rbR'), bL = mk('L', 'rbL'), bX = mk('X', 'rbX'), bG = mk('G', 'rbGo');
  for (const [b, k] of [[bF, 'F'], [bR, 'R'], [bL, 'L']]) b.onclick = () => { if (prog.length >= max) { SFX.soft(); return; } prog.push(k); SFX.tick(); draw(); say(...lineOf('gen.rb.' + k), { free: true, ifIdle: true, keep: true }); };
  bX.onclick = () => { if (prog.length > pre.length) { prog.pop(); SFX.soft(); draw(); } };
  return { prog, box, go: bG, press: k => ({ F: bF, R: bR, L: bL, X: bX, G: bG })[k].click() }; }
function rbErr(want, got) { const f = p => p.filter(t => t === 'F').length, turns = p => p.filter(t => t !== 'F').join('');
  if (f(want) !== f(got)) return { ok: false, err: 'rbSteps' };
  if (turns(want).length === turns(got).length && turns(want) !== turns(got)) return { ok: false, err: 'rbTurnSide' };
  if (turns(want) === turns(got)) return { ok: false, err: 'rbOrder' };
  return { ok: false, err: 'rbWrong' }; }
ITEM.robot = {
  make(spec) { const start = spec.start || { c: 2, r: 3, dir: 0 }; return { ...spec, start, tag: 'robot', goal: rbRun(spec.prog, start) }; },
  async ask(item, mode, tries) { const svg = newStage(300, { oasis: false, ground: 0 }); const RB = rbBoard(svg, item.start, { star: item.star });
    const pre = tries >= 3 ? item.prog.slice(0, -1) : []; if (pre.length) await S('gen.rb.together');
    const PB = progBuilder(svg, Math.max(3, item.prog.length + 1), pre);
    say(...lineOf(item.q), { free: true });
    AUTO({ kind: 'prog', ok: () => { while (PB.prog.length > pre.length) PB.press('X'); item.prog.slice(pre.length).forEach(k => PB.press(k)); PB.press('G'); },
      wrong: () => { while (PB.prog.length > pre.length) PB.press('X'); item.prog.slice(pre.length).map(k => k === 'R' ? 'L' : k === 'L' ? 'R' : k).forEach(k => PB.press(k)); if (!item.prog.some(k => k !== 'F')) PB.press('F'); PB.press('G'); } });
    await gate(new Promise(res => PB.go.onclick = () => { if (!PB.prog.length) { SFX.soft(); return; } AUTO_CLEAR(); hush(); PB.box.remove(); res(); }));
    const prog = [...PB.prog]; await RB.run(prog); return { ans: prog, ctx: { svg, RB } }; },
  judge(item, prog) { const g = rbRun(prog, item.start), w = item.goal; return g.c === w.c && g.r === w.r && g.dir === w.dir ? { ok: true } : rbErr(item.prog, prog); },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const RB = r.ctx.RB; RB.show(item.start); await S(item.q); const p = RB.B.at(item.start.c, item.start.r); const m = el('circle', { cx: p.x + 22, cy: p.y, r: 14, fill: 'none', stroke: '#f2b33d', 'stroke-width': 5, 'pointer-events': 'none' }, r.ctx.svg);
    await anim(m, [{ opacity: 0 }, { opacity: 1 }, { opacity: .3 }, { opacity: 1 }], { duration: 1400 }).done; m.remove(); },
  async together() {},
  async reveal(item, r) { await r.ctx.RB.run(item.prog); },
  mark() {}, praise: () => 'praiseRobot', reason(item) { return item.why || null; }, twin(item) { return item.twin || null; },
};
/* ما الأمر الذي اتّبعه الروبوت؟ (تعرّف C013): يشاهد الطفل الروبوت ثم يختار من بطاقتين مسموعتين */
const RB_WATCH = { rbTurnSide: 'gen.rb.watchSide' };   /* لكل خطأ في بند بمساعدة جملته (يفحصه lint)؛ وبنود الإتقان والمراجعة لا حلّ مشترك فيها */
ITEM.robotWatch = {
  make(spec) { const start = spec.start || { c: 2, r: 3, dir: 0 }; return { ...spec, start, tag: 'robotWatch' }; },
  async ask(item, mode, tries) { const svg = newStage(300, { oasis: false, ground: 0 }); const RB = rbBoard(svg, item.start, { y0: 40 }); await S(item.q);
    /* الحلّ المشترك (المستوى 3) بحسب الخطأ نفسه: جهة الدوران، أو ترتيب الأوامر، أو المشي والدوران (الفحص المستقل C: كان يسأل «هل مشى أم دار؟»
       وخطأ البنود كلها جهة الدوران)، ثم يتحرّك الروبوت أمام الطفل */
    if (tries >= 3 && RB_WATCH[item.lastErr]) await S(RB_WATCH[item.lastErr]);
    await RB.run(item.prog); await sleep(300);
    /* و«أعد الجملة» يعيد السؤال وحركة الروبوت معه ثم البطاقتين (الفحص المستقل C: في الإتقان والمراجعة كان يتحرّك مرة واحدة) */
    const cp = cardPick(item.opts.map((o, i) => ({ id: o.id, k: 'c' + i, ok: !!o.ok })), { intro: item.q, replayPre: () => RB.run(item.prog) }); const pk = await cp.p; cp.done(); cp.box.remove();
    return { ans: pk.k, ctx: { svg, RB, pk } }; },
  judge(item, k) { const o = item.opts[+k.slice(1)]; return o.ok ? { ok: true } : { ok: false, err: o.err || 'rbWrong' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { await r.ctx.RB.run(item.prog); },
  async together(item, r, err) { item.lastErr = err; },   /* يُقال في ask عند المحاولة الرابعة */
  async reveal(item) { await S(item.opts.find(o => o.ok).id); },
  mark() {}, praise: () => 'praiseRobot', reason(item) { return item.why || null; }, twin(item) { return item.twin || null; },
};

/* ================= الخريطة (C012): الغرفة من الجانب، وخريطتها من الأعلى تحتها ================= */
function mapErr(lay, want, got) { const W = lay.items.find(i => (i.id || i.k) === want.id) || want, Gt = got;
  if (Gt.k && W.k && Gt.k !== W.k) return { ok: false, err: 'mapPiece' };
  if (Gt.col === 2 - W.col && Gt.row === W.row) return { ok: false, err: 'mapMirror' };
  if (Gt.col === W.col && Gt.row !== W.row) return { ok: false, err: 'mapRow' };
  return { ok: false, err: 'mapWrong' }; }
/* خطّ إرشاد من الشيء في الصورة إلى عموده في الخريطة */
/* keep: الخطّ يبقى خافتاً أمام الطفل حين يجيب (الحلّ المشترك، D257(5)(و)) */
async function mapGuide(svg, Rm, M, it, ms = 1600, keep = false) { const x1 = ROOM_COLX[it.col], x2 = M.colX(it.col), y2 = M.rowY(it.row);
  const l = el('path', { d: `M${x1} ${Rm.y0 + (it.row === 'back' ? Rm.fy : Rm.H - 20)} L${x2} ${y2}`, stroke: css('--compass'), 'stroke-width': 4, 'stroke-dasharray': '8 6', fill: 'none', 'pointer-events': 'none' }, svg);
  if (keep) { l.dataset.help = 1; await anim(l, [{ opacity: 0 }, { opacity: 1 }, { opacity: 1 }, { opacity: .55 }], { duration: ms, fill: 'forwards' }).done; return l; }
  await anim(l, [{ opacity: 0 }, { opacity: 1 }, { opacity: 1 }, { opacity: 0 }], { duration: ms }).done; l.remove(); }
/* «أين هو في الخريطة؟» (الفحص المستقل A للبوابة: كان الجواب قطعةً يُعرف شكلها من اسمها، فلا تُقرأ الخريطة):
   شيء مرسوم في الغرفة (كنز أو قطة) لا يُسمّى مكانه، في خانة فارغة (mark.cell) أو فوق شيء أو تحته (mark.on، mark.rel)؛ ويلمس الطفل خانته في الخريطة
   من ستّ خانات: القطع الثلاث، وحلقات منقّطة للخانات الفارغة. فالجواب خانة تُنقل من الغرفة إلى الخريطة، لا قطعة تُعرف من لونها */
const MAP_CELLS = [0, 1, 2].flatMap(col => ['back', 'front'].map(row => ({ col, row })));
const cellKey = c => c.col + ',' + c.row;
ITEM.mapFind = {
  make(spec) { const m = spec.mark || {}; const on = m.on && spec.lay.items.find(i => (i.id || i.k) === m.on);
    const W = m.cell ? { col: m.cell[0], row: m.cell[1] } : { col: on.col, row: on.row }; return { ...spec, tag: 'map:find', W, want: cellKey(W) }; },
  async ask(item, mode, tries) { const svg = newStage(320, { oasis: false, ground: 0 }); const Rm = roomSideAt(svg, item.lay, { y0: 0, H: 150 }); const mk = roomMarkAt(svg, Rm, item.lay, item.mark);
    const M = roomMapAt(svg, item.lay, { y0: 168, H: 140 }); const at = {}; for (const it of item.lay.items) at[cellKey(it)] = M.pieces[it.id || it.k];
    const targets = MAP_CELLS.map(c => { let g = at[cellKey(c)];
      if (!g) { g = el('g', { transform: `translate(${M.colX(c.col)} ${M.rowY(c.row)})` }, svg); el('circle', { r: 24, fill: '#fff', 'fill-opacity': .3, stroke: css('--compass'), 'stroke-width': 3, 'stroke-dasharray': '7 6' }, g); }
      return { g, k: cellKey(c), label: labelText('spot') }; });
    /* الحلّ المشترك (المستوى 3) على مسرح هذه المحاولة: الخطّ من الشيء في الغرفة إلى خانته، ويبقى خافتاً حين يلمس الطفل (الفحص المستقل C، D257(5)(و)) */
    if (tries >= 3) { await S('gen.map.together'); await mapGuide(svg, Rm, M, item.W, 2200, true); }
    say(...lineOf(item.q), { free: true }); const k = await tapOne(targets, { ok: item.want, pad: 60 }); hush();
    return { ans: k, ctx: { svg, Rm, M, mk } }; },
  judge(item, k) { if (k === item.want) return { ok: true }; const [c, row] = k.split(','), col = +c, W = item.W;
    if (col === 2 - W.col && row === W.row) return { ok: false, err: 'mapMirror' }; if (col === W.col && row !== W.row) return { ok: false, err: 'mapRow' }; return { ok: false, err: 'mapWrong' }; },
  onOk(item, r) { SFX.good(); ITEM.mapFind.mark(item, r); }, onWrong() { SFX.soft(); },
  /* التلميح الثاني: خطّ من شيء آخر في الغرفة إلى قطعته، فيرى الطفل كيف تنتقل الأماكن؛ والحلّ المشترك: الخطّ من الشيء المطلوب نفسه */
  /* والشيء الآخر ليس الخانة التي لمسها الطفل للتوّ (الفحص المستقل B: كان الخطّ إليها فيبدو تأكيداً لخطئه)، والشيء المطلوب يومض في الغرفة أولاً */
  async hint2(item, r) { const I = item.lay.items, d = I.find(i => i.col !== item.W.col && cellKey(i) !== r.ans) || I.find(i => cellKey(i) !== r.ans && cellKey(i) !== item.want) || I[0];
    if (r.ctx.mk) await anim(r.ctx.mk, [{ filter: 'none' }, { filter: 'drop-shadow(0 0 7px #f2b33d)' }, { filter: 'none' }], { duration: 1200 }).done;
    await mapGuide(r.ctx.svg, r.ctx.Rm, r.ctx.M, d); },
  async together() {},   /* في ask عند المحاولة الرابعة (tries >= 3) */
  async reveal(item, r) { ITEM.mapFind.mark(item, r); await mapGuide(r.ctx.svg, r.ctx.Rm, r.ctx.M, item.W, 1200); },
  mark(item, r) { const M = r.ctx.M; el('circle', { cx: M.colX(item.W.col), cy: M.rowY(item.W.row), r: 40, fill: 'none', stroke: css('--good'), 'stroke-width': 5, 'pointer-events': 'none' }, r.ctx.svg); },
  praise: () => 'praisePlace', reason(item) { return item.why || null; }, twin(item) { return item.twin || null; },
};
/* ضع القطعة في مكانها على الخريطة (إنتاج C012): أماكن مرشّحة منقّطة، والطفل يسحب القطعة أو يلمس المكان */
ITEM.mapPut = {
  make(spec) { const W = spec.lay.items.find(i => (i.id || i.k) === spec.want); return { ...spec, tag: 'map:put', W }; },
  async ask(item, mode, tries) { const svg = newStage(320, { oasis: false, ground: 0 }); const Rm = roomSideAt(svg, item.lay, { y0: 0, H: 150 });
    const M = roomMapAt(svg, { ...item.lay, items: item.lay.items.filter(i => (i.id || i.k) !== item.want) }, { y0: 168, H: 140, x0: 18, W: 252 });
    if (tries >= 3) { await S('gen.map.together'); await mapGuide(svg, Rm, M, item.W, 2200, true); }
    const cands = item.cands.map(([col, row], i) => ({ k: 'c' + i, col, row, x: M.colX(col), y: M.rowY(row) }));
    el('rect', { x: 284, y: 214, width: 70, height: 10, rx: 4, fill: MAT.wood }, svg); const th = mapPieceAt(svg, item.W.k, 319, 190); th.setAttribute('transform', 'translate(319 190) scale(.85)');
    say(...lineOf(item.q), { free: true }); const okK = cands.find(c => c.col === item.W.col && c.row === item.W.row).k;
    const k = await spotPick(svg, th, { x: 319, y: 190 }, cands, [okK], { label: labelText('mapPiece'), strong: tries >= 3 });
    const c = cands.find(q => q.k === k); th.remove(); mapPieceAt(svg, item.W.k, c.x, c.y); return { ans: { col: c.col, row: c.row }, ctx: { svg, Rm, M } }; },
  judge(item, a) { return a.col === item.W.col && a.row === item.W.row ? { ok: true } : mapErr(item.lay, { ...item.W, id: item.want }, { ...a, k: item.W.k }); },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const d = item.lay.items.find(i => (i.id || i.k) !== item.want); await mapGuide(r.ctx.svg, r.ctx.Rm, r.ctx.M, d); },
  async together() {},
  async reveal(item, r) { const M = r.ctx.M; mapPieceAt(r.ctx.svg, item.W.k, M.colX(item.W.col), M.rowY(item.W.row)); await mapGuide(r.ctx.svg, r.ctx.Rm, M, item.W, 1200); },
  mark(item, r) { const M = r.ctx.M; el('circle', { cx: M.colX(item.W.col), cy: M.rowY(item.W.row), r: 40, fill: 'none', stroke: css('--good'), 'stroke-width': 5, 'pointer-events': 'none' }, r.ctx.svg); },
  praise: () => 'praisePlace', reason(item) { return item.why || null; }, twin(item) { return item.twin || null; },
};
/* صندوق كنز صغير (المرسى منتصف قاعدته) */
function treasureAt(parent, x, y, s = .8) { const g = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, parent);
  el('rect', { x: -20, y: -26, width: 40, height: 26, rx: 4, fill: '#a9774a', stroke: '#fff', 'stroke-width': 2.5 }, g); el('path', { d: 'M-20 -26 Q0 -44 20 -26 Z', fill: '#c98f55', stroke: '#fff', 'stroke-width': 2.5 }, g);
  el('rect', { x: -4, y: -20, width: 8, height: 10, rx: 2, fill: '#f2d36b' }, g); return g; }
/* يمشي الطفل على الطريق نقطةً نقطة، ويتوهّج ما يصل إليه من القطع (stop: يقف عنده قليلاً) */
/* keep (الحلّ المشترك): يبقى على كل شيء مرّ به رقمُ ترتيبه، فيرى الطفل ما نمرّ به أولاً وما بعده حين يختار الوصف */
async function routeWalk(ctx, item, stop, keep = false) { const { kid, pts, M, svg } = ctx; if (!kid || !pts) return; const at = p => `translate(${p.x}px,${p.y + 20}px)`; let n = 0;
  for (let i = 1; i < pts.length; i++) { await anim(kid, [{ transform: at(pts[i - 1]) }, { transform: at(pts[i]) }], { duration: 520, easing: 'ease-in-out' }).done; kid.setAttribute('transform', `translate(${pts[i].x} ${pts[i].y + 20})`);
    const id = (item.path || []).find(id => { const it = item.lay.items.find(q => (q.id || q.k) === id); return Math.abs(M.colX(it.col) - pts[i].x) < 3 && Math.abs(M.rowY(it.row) - pts[i].y) < 3; });
    if (id) { const g = M.pieces[id]; SFX.tick(); if (keep && svg) badge(el('g', { 'pointer-events': 'none', 'data-help': 1 }, svg), pts[i].x + 26, pts[i].y - 26, ++n, css('--compass'));
      if (g) await anim(g, [{ opacity: 1 }, { opacity: .35 }, { opacity: 1 }], { duration: stop ? 900 : 500 }).done; } }
  await sleep(500); kid.setAttribute('transform', `translate(${pts[0].x} ${pts[0].y + 20})`); }
/* أيّ وصف يوصل من الباب إلى السرير؟ (البند المفتوح في الاختبار: على الشاشة يختار الطفل من وصفين مسموعين) */
ITEM.routePick = {
  make(spec) { return { ...spec, tag: 'map:route' }; },
  async ask(item, mode, tries) { const svg = newStage(260, { oasis: false, ground: 0 }); const M = roomMapAt(svg, item.lay, { y0: 40, H: 190 });
    /* الطريق المرسوم: من الباب نزولاً إلى صفّ الشيء الأول، ثم أفقياً إليه، وهكذا (خطوط مستقيمة لا تقطع ما ليس عليه) */
    const pts = [{ x: M.door.x, y: M.door.y - 4 }]; let prev = pts[0];
    for (const id of item.path || []) { const it = item.lay.items.find(i => (i.id || i.k) === id); const q = { x: M.colX(it.col), y: M.rowY(it.row), id };
      if (Math.abs(prev.x - q.x) > 4 && Math.abs(prev.y - q.y) > 4) pts.push(prev === pts[0] ? { x: prev.x, y: q.y } : { x: q.x, y: prev.y }); pts.push(q); prev = q; }
    /* data-stops: الشيء عند كل نقطة من الخط (والفارغ منعطف)، يقرؤه فحص الطريق: كل قطعة من الخط تمسّ ما بين طرفيها وحده (الفحص المستقل D) */
    el('path', { d: 'M' + pts.map(p => p.x + ' ' + p.y).join(' L'), 'data-stops': pts.map(p => p.id || '').join(','), fill: 'none', stroke: '#c94f3d', 'stroke-width': 5, 'stroke-dasharray': '9 7', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'pointer-events': 'none' }, svg);
    const kid = el('g', { transform: `translate(${M.door.x} ${M.door.y + 20})` }, svg); kid.innerHTML = kidSVG(PROFILE ? PROFILE.gender : 'm', PROFILE && PROFILE.avatar).replace('<svg', '<svg x="-20" y="-20" width="40" height="40"');
    /* الحلّ المشترك (المستوى 3) على مسرح هذه المحاولة: نمشي الطريق معاً ونقف عند كل شيء، ويبقى رقم ترتيبه عليه حين يختار الطفل (D257(5)(و)) */
    if (tries >= 3) { await S('gen.map.routeTogether'); await routeWalk({ svg, M, pts, kid }, item, true, true); }
    await S(item.q); const cp = cardPick(item.opts.map((o, i) => ({ id: o.id, k: 'c' + i, ok: !!o.ok })), { intro: item.q }); const pk = await cp.p; cp.done(); cp.box.remove(); return { ans: pk.k, ctx: { svg, M, pts, kid } }; },
  judge(item, k) { const o = item.opts[+k.slice(1)]; return o.ok ? { ok: true } : { ok: false, err: o.err || 'mapRoute' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  /* التلميح الثاني: الطفل يمشي على الطريق المرسوم من الباب؛ والحلّ المشترك: يمشي ويقف عند كل شيء يمرّ به فيتوهّج (الفحص المستقل A: كان بلا تلميح) */
  async hint2(item, r) { await routeWalk(r.ctx, item, false); }, async together() {},   /* في ask عند المحاولة الرابعة */
  async reveal(item) { await S(item.opts.find(o => o.ok).id); }, mark() {},
  praise: () => 'praiseRoute', reason(item) { return item.why || null; }, twin(item) { return item.twin || null; },
};

/* ================= طريق الأعداد (N009): من اليسار إلى اليمين، والبلاطة تنطق عددها حين تُلمس ================= */
/* سهم الجهة فوق رأس الطفل على البلاطة (الفحص المستقل B: كان تحت صورته فلا يُرى) */
const roadArrow = (g, dir) => el('path', { d: dir > 0 ? 'M-16 -104 H16 M5 -114 L16 -104 L5 -94' : 'M16 -104 H-16 M-5 -114 L-16 -104 L-5 -94', stroke: css('--compass'), 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'pointer-events': 'none' }, g);
function roadStage(item, opt = {}) { const svg = newStage(270, { oasis: false, ground: 0 }); el('rect', { x: -360, y: 196, width: 1080, height: 80, fill: css('--floor'), opacity: .55 }, svg);
  const S = roadAt(svg, { y: 170, last: item.last || 20, at: opt.at ?? item.a ?? item.n ?? 0, btnY: 236 }); const tok = roadToken(S, opt.who || 'kid', opt.at ?? item.a ?? item.n ?? 0); return { svg, S, tok }; }
/* قفز الطفل: يلمس البلاطات فيقفز إليها (وتُنطق)، ثم «تمّ» */
async function roadHops(R, item, mode, pre = []) { const path = [R.tok.n]; const hops = el('g', { 'pointer-events': 'none' }, R.svg); const help = mode === 'practice' || mode === 'explore' || mode === 'remedial';
  const showHops = () => { hops.innerHTML = ''; if (!help || item.b != null) return; for (let i = 0; i < path.length - 1; i++) el('circle', { cx: 30 + i * 24, cy: 26, r: 9, fill: css('--compass') }, hops); };
  for (const m of pre) { await R.tok.hop(m, n => S(numw(n), { noGap: true, num: true })); path.push(m); showHops(); }
  /* اللمسات السريعة أثناء قفزة تنتظر دورها بالترتيب (الفحص المستقل B: كانت تُسقط، فيُحكم على العدّ الصحيح «قفز عن بلاطة») */
  let busy = false; const pend = []; const last = () => pend.length ? pend[pend.length - 1] : R.tok.n;
  /* ويتحرّك الطريق ليُرى ما لُمس والبلاطة التالية في جهة السير، فيلمسها الطفل دون أن يحرّكه بيده (في العدّ إلى الخلف كانت التالية مخفية) */
  const hopTo = async to => { busy = true; SFX.tick(); const dir = Math.sign(to - R.tok.n), tx = R.S.tileX(to), nx = Math.max(0, Math.min(R.S.tiles.length - 1, to + dir));
    await R.S.show(Math.min(tx, R.S.tileX(nx)) - 29, Math.max(tx, R.S.tileX(nx)) + 29); const a = R.S.tileX(R.tok.n), b = tx;
    if (!RM && !FAST) await anim(R.tok.g, [{ transform: `translate(${a}px,${R.S.y}px)` }, { transform: `translate(${(a + b) / 2}px,${R.S.y - 34}px)`, offset: .5 }, { transform: `translate(${b}px,${R.S.y}px)` }], { duration: 380, easing: 'ease-in-out' }).done;
    R.tok.place(to); path.push(to); showHops(); say(...lineOf(numw(to)), { free: true, num: true });
    if (pend.length) return hopTo(pend.shift()); busy = false; };
  const targets = R.S.tiles.map(t => ({ g: t.g, n: t.n }));
  targets.forEach(t => { t.g.style.cursor = 'pointer'; t.g.setAttribute('role', 'button'); t.g.setAttribute('aria-label', plain(T(numw(t.n)))); hitPad(t.g, 56);
    t.g.onclick = () => { if (R.S.dragged) return; if (t.n === last()) { if (!busy) say(...lineOf(numw(t.n)), { free: true, num: true }); return; }
      if (busy) { if (pend.length < 6) pend.push(t.n); return; } hopTo(t.n); }; });
  const d = doneBtn(); const want = item.b != null ? item.b : item.a + (item.dir || 1) * item.n;
  const seq = item.b != null ? Array.from({ length: Math.abs(item.b - item.a) }, (_, i) => item.a + Math.sign(item.b - item.a) * (i + 1)) : Array.from({ length: item.n }, (_, i) => item.a + (item.dir || 1) * (i + 1));
  const wrongSeq = seq.slice(0, -1);   /* يقف قبل الهدف بخطوة (أو يعدّ بلاطته قفزة) */
  /*T*/window.__road = { seq: seq.filter(m => !path.slice(1).includes(m)), done: true };/*/T*/   /* للمس الحقيقي في الفحص: البلاطات الباقية، ثم «تمّ» */
  AUTO({ kind: 'road', ok: async () => { for (const m of seq.filter(m => !path.slice(1).includes(m))) { R.S.tiles[m].g.dispatchEvent(new MouseEvent('click', { bubbles: true })); await new Promise(r => setTimeout(r, 30)); while (busy) await new Promise(r => setTimeout(r, 20)); } d.b.click(); },
    wrong: async () => { for (const m of wrongSeq) { R.S.tiles[m].g.dispatchEvent(new MouseEvent('click', { bubbles: true })); await new Promise(r => setTimeout(r, 30)); while (busy) await new Promise(r => setTimeout(r, 20)); } d.b.click(); } });
  /* و«تمّ» أثناء القفز تنتظر انتهاء ما لُمس قبلها */
  let fin = false; await gate(new Promise(res => d.b.onclick = async () => { if (fin) return; fin = true; while (busy) await new Promise(r => setTimeout(r, 30)); AUTO_CLEAR(); hush(); d.bar.remove(); res(); }));
  targets.forEach(t => { t.g.onclick = null; t.g.removeAttribute('role'); t.g.style.cursor = ''; t.g.querySelectorAll(':scope > rect.hit').forEach(h => h.remove()); }); hops.remove();
  return { path, want }; }
function roadErr(item, path) { const a = item.a, fin = path[path.length - 1];
  if (item.b != null) { const dir = Math.sign(item.b - a);
    if (path.length > 1 && a > 2 && path[1] <= 1) return { ok: false, err: 'roadRestart' };
    for (let i = 1; i < path.length; i++) { const st = path[i] - path[i - 1]; if (st === -dir && i === 1) return { ok: false, err: 'roadDir' }; if (Math.abs(st) > 1) return { ok: false, err: 'roadSkip' }; }
    return fin === item.b ? { ok: true } : { ok: false, err: 'roadStop' }; }
  const dir = item.dir || 1, want = a + dir * item.n; if (fin === want) return { ok: true };
  if (fin === a + dir * (item.n - 1)) return { ok: false, err: 'roadOwnTile' }; if (dir < 0 && fin > a) return { ok: false, err: 'roadDir' }; return { ok: false, err: 'roadHops' }; }
/* ================= قف واقفز / عدّ حتى… (إنتاج N009) ================= */
ITEM.roadHop = {
  make(spec) { return { ...spec, tag: spec.b != null ? 'road:walk' : 'road:jump' }; },
  async ask(item, mode, tries) { const R = roadStage(item, { at: item.a }); const want = item.b != null ? item.b : item.a + (item.dir || 1) * item.n;
    let pre = []; if (tries >= 3) { await S('gen.road.together'); const seq = item.b != null ? Array.from({ length: Math.abs(item.b - item.a) }, (_, i) => item.a + Math.sign(item.b - item.a) * (i + 1)) : Array.from({ length: item.n }, (_, i) => item.a + (item.dir || 1) * (i + 1)); pre = seq.slice(0, -1); }
    say(...lineOf(item.q), { free: true }); const r = await roadHops(R, item, mode, pre); return { ans: r.path, ctx: { ...R, want } }; },
  judge(item, path) { return roadErr(item, path); },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const R = r.ctx; R.tok.place(item.a); await R.S.show(R.S.tileX(item.a) - 29, R.S.tileX(item.a) + 29);
    const nx = item.a + (item.b != null ? Math.sign(item.b - item.a) : (item.dir || 1)); const t = R.S.tiles[nx];
    el('rect', { x: -27, y: -27, width: 54, height: 54, rx: 11, fill: 'none', stroke: css('--compass'), 'stroke-width': 5, 'pointer-events': 'none' }, t.g); await S(numw(nx), { num: true }); await sleep(600); },
  async together() {},
  async reveal(item, r) { const R = r.ctx; R.tok.place(item.a); await R.tok.hop(r.ctx.want, n => S(numw(n), { noGap: true, num: true })); },
  mark() {}, praise: () => 'praiseRoad', reason(item) { return item.why || null; }, twin(item) { return item.twin || null; },
};
/* ================= ما بعده؟ ما قبله؟ أين أصل؟ (تعرّف N009): بطاقتان مسموعتان، فلا يُقرأ عدد فوق العشرة (D229) ================= */
/* بطاقة الخطأ في «أين نصل؟» البلاطة قبل الأخيرة (عدّ بلاطته)، وفي «بعد/قبل/يزيد/ينقص» الجهة الأخرى؛ فإن خرجت عن الطريق
   (ينقص واحداً عن عشرين: واحد وعشرون، ولا بلاطة له ولا كلمة، فتوقّف الدرس في الفحص المستقل C) فالعدد نفسه: لم يخطُ */
const roadAlt = item => { if (item.alt != null) return item.alt; if (item.ask === 'land') return item.n + (item.dir || 1) * (item.k - 1);
  const o = item.n - item.d; return o >= 0 && o <= (item.last || 20) ? o : item.n; };
ITEM.roadPick = {
  make(spec) { const d = spec.ask === 'next' || spec.ask === 'more' ? 1 : spec.ask === 'prev' || spec.ask === 'less' ? -1 : 0;
    const want = spec.ask === 'land' ? spec.n + (spec.dir || 1) * spec.k : spec.ask === 'hops' ? spec.b - spec.n : spec.n + d; return { ...spec, tag: 'road:' + spec.ask, want, d }; },
  async ask(item, mode, tries) { const R = roadStage(item, { at: item.n });
    /* الحلّ المشترك (المستوى 3) على طريق هذه المحاولة، فيبقى أمام الطفل حين يختار (الفحص المستقل B: كان يقول «انظر إلى السهم» ولا سهم):
       «أين نصل؟» نقفز معاً كل القفزات إلا الأخيرة؛ و«كم قفزة؟» نقفز معاً بنقطة عند كل قفزة فيعدّها؛ و«بعد/قبل/يزيد/ينقص» سهم الجهة فوق الطفل */
    if (tries >= 3) { const dir = item.ask === 'land' || item.ask === 'hops' ? (item.dir || 1) : item.d;
      if (item.ask === 'land' && item.k > 1) { await S('gen.road.landTogether'); await R.tok.hop(item.n + dir * (item.k - 1), n => S(numw(n), { noGap: true, num: true })); }
      else if (item.ask === 'hops') { const dots = el('g', { 'pointer-events': 'none' }, R.svg); let i = 0; await R.tok.hop(item.b, async () => { el('circle', { cx: 30 + i++ * 24, cy: 26, r: 9, fill: css('--compass') }, dots); SFX.tick(); await sleep(150); }); await S('gen.road.hopsLook'); }
      else { roadArrow(R.S.tiles[item.n].g, dir); await S('gen.road.look'); } }
    say(...lineOf(item.q), { free: true });
    if (item.ask === 'hops') { const np = numberPick(nearNums(item.want, 10), item.want); const k = await np.p; np.box.remove(); return { ans: k, ctx: R }; }
    const alt = roadAlt(item);
    const cp = cardPick([{ id: numw(item.want), k: 'w', ok: true, hide: true }, { id: numw(alt), k: 'a', ok: false, hide: true }], { intro: item.q, keepQ: true }); const pk = await cp.p; cp.done(); cp.box.remove();
    return { ans: pk.k === 'w' ? item.want : alt, ctx: R }; },
  judge(item, k) { if (k === item.want) return { ok: true }; if (item.ask === 'land') return k === item.n + (item.dir || 1) * (item.k - 1) ? { ok: false, err: 'roadOwnTile' } : (k - item.n) * (item.dir || 1) < 0 ? { ok: false, err: 'roadDir' } : { ok: false, err: 'roadHops' };
    if (item.ask === 'hops') return { ok: false, err: 'roadHopsCount' }; return { ok: false, err: k === item.n ? 'roadOwnTile' : 'roadNext' }; },
  onOk() { SFX.good(); }, onWrong() { SFX.soft(); },
  async hint2(item, r) { const t = r.ctx.S.tiles[item.n]; const m = el('rect', { x: -27, y: -27, width: 54, height: 54, rx: 11, fill: 'none', stroke: css('--compass'), 'stroke-width': 5, 'pointer-events': 'none' }, t.g); await S(numw(item.n), { num: true });
    const a = roadArrow(t.g, item.ask === 'land' || item.ask === 'hops' ? (item.dir || 1) : item.d); await sleep(1400); m.remove(); a.remove(); },
  async together() {},   /* في ask عند المحاولة الرابعة (tries >= 3) */
  async reveal(item, r) { if (item.ask === 'hops') { await r.ctx.tok.hop(item.b, n => S(numw(n), { noGap: true, num: true })); return; } r.ctx.tok.place(item.n); await r.ctx.tok.hop(item.want, n => S(numw(n), { noGap: true, num: true })); },
  mark() {}, praise: () => 'praiseRoad', reason(item) { return item.why || null; }, twin(item) { return item.twin || null; },
};
