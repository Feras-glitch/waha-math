/* =====================================================================
   «مراجعة اليوم» (المبدأ 14، D182، D237، D240، D248): من مخزون المراجعة المحجوز لكل درس حان موعده،
   مخلوطاً بين الوحدات، ومعه الجداول اليومية: اللمحة السريعة (بعد S1-U1 د4)، والطلاقة وقصص الواحة (بعد S1-U2 د5).
   أول لقاء بكل جدول يعرضه فرجار نموذجاً. والنجوم للمراجعة والإتقان (D239)
   ===================================================================== */
const STREAMS = [
  { id: 'glance', after: 'm1.u1.d4', model: 'gen.stream.glance.model', items: () => [{ t: 'glance', n: R(2, 5) }] },
  { id: 'fluency', after: 'm1.u2.d5', model: 'gen.stream.fluency.model', items: () => { const op = rand() < .6 ? '+' : '-'; if (op === '+') { const a = R(1, 4); return [{ t: 'fact', op, a, b: R(1, 5 - a) }]; } const a = R(2, 5); return [{ t: 'fact', op, a, b: R(1, a - 1) }]; } },
  { id: 'story', after: 'm1.u2.d5', model: 'gen.stream.story.model', items: () => [pick(GEN.stories)] },
];
const streamOpen = s => !!(PROG[s.after] || {}).done || !!PROG.unlockAll;
function reviewDue() { return UNITS.flatMap(u => u.lessons).map(id => LDATA[id]).filter(L => L.review && L.review.length && srsDue(PROG.srs[L.id])); }
function streamsDue() { const today = dayStart(Date.now()); return STREAMS.filter(s => streamOpen(s) && (PROG.streams[s.id] || {}).day !== today); }
const reviewWaiting = () => reviewDue().length + streamsDue().length > 0;
/* البند التالي من المخزون المحجوز بالتناوب، فلا يتكرّر البند نفسه */
function nextReviewItem(L) { const r = PROG.srs[L.id]; const k = (r.k || 0) % L.review.length; r.k = k + 1; return L.review[k]; }
async function runReview() {
  if (TAB_LOST) { showTabLost(); return; }
  const due = shuffle(reviewDue()).slice(0, 3); const streams = streamsDue();
  if (!due.length && !streams.length) return showHome();
  for (let i = 1; i < due.length; i++) if (due[i].unit === due[i - 1].unit && i + 1 < due.length && due[i + 1].unit !== due[i].unit) [due[i], due[i + 1]] = [due[i + 1], due[i]];   // تداخل الوحدات ما أمكن
  CUR = null; FLOW++; reseed((KID || 'k0') + '|review|' + dayStart(Date.now())); show('lesson'); lockGo(); colorIx = 0; streak = 0; SCENE_NOW = 'review'; /*T*/window.__scene = 'review:intro';/*/T*/
  const total = due.length + streams.length; setSteps(total + 1); setStep(0);
  { const svg = newStage(300, { oasisOpacity: .3 }); due.forEach((L, i) => { const g = el('g', { transform: `translate(${250 - i * 70} 120) scale(1.1)` }, svg); g.innerHTML = stopIconInner(L); }); }
  await S('gen.review.intro'); await nextBtn(labelText('letsGo'));
  const res = {}; let step = 1, allOk = true;
  for (const L of due) { CUR = L; setStep(step++); SCENE_NOW = 'review:' + L.id; /*T*/window.__scene = 'review:' + L.id;/*/T*/
    const r = await runItem(nextReviewItem(L), 'review', { scene: 'review' }); res[L.id] = r.firstTry; allOk = allOk && r.firstTry; await sleep(400); }
  CUR = null;
  for (const s of streams) { setStep(step++); SCENE_NOW = 'stream:' + s.id; /*T*/window.__scene = 'review:stream:' + s.id;/*/T*/ const st = PROG.streams[s.id] = isObj(PROG.streams[s.id]) ? PROG.streams[s.id] : {};
    if (!st.seen) { await streamModel(s); st.seen = true; saveProg(); await nextBtn(); }       // أول لقاء: فرجار يحلّ نموذجاً
    for (const it of s.items()) { const r = await runItem(it, 'review', { scene: 'stream:' + s.id }); allOk = allOk && r.firstTry; st.n = (st.n || 0) + 1; st.ok = (st.ok || 0) + (r.firstTry ? 1 : 0); }
    st.day = dayStart(Date.now()); saveProg(); await sleep(400); }
  for (const [id, ok] of Object.entries(res)) srsUpdate(id, ok); saveProg();
  setStep(total + 1); SCENE_NOW = 'review:end'; /*T*/window.__scene = 'review:end';/*/T*/ newStage(300, { oasisOpacity: .9 });
  if (allOk) { SFX.win(); starBurst(); await S('gen.review.done'); } else await S('gen.review.later');
  await nextBtn(labelText('toMap')); showHome();
}
/* نموذج فرجار لأول لقاء بالجدول (D248: أول قصة يحلّها فرجار، وبعدها يحلّها الطفل) */
async function streamModel(s) {
  if (s.id === 'glance') { const svg = newStage(250, { oasis: false, ground: 0 }); const d = diceAt(svg, 180, 118, 3); await S(s.model); await sleep(900); d.remove(); await S('gen.stream.glance.model2'); return; }
  if (s.id === 'fluency') { const svg = newStage(250, { oasis: false, ground: 0 }); handAtN(svg, 250, 110, 2, 1.3); handAtN(svg, 110, 110, 1, 1.3); sentenceAt(svg, 180, 214, 2, '+', 1, 3); await S(s.model); await readSentence(2, '+', 1, 3); return; }
  const svg = newStage(260, { oasis: false, ground: 14 }); await S(s.model); const T = towerAt(svg, 180, 240, 3, { size: 24, color: CUBE.lemon }); await sleep(500); towerAt(svg, 180, 240 - 3 * T.step, 2, { size: 24, color: CUBE.white });
  sentenceAt(svg, 180, 40, 3, '+', 2, 5); await readSentence(3, '+', 2, 5); await S('gen.stream.story.model2');
}

/* ---------- الاستراحة بعد حدّ الجلسة (المبدأ 11): حركة هادئة نصف دقيقة، ثم حال «راحة» على الخريطة ---------- */
function breakScene(next) { hush(); /*T*/window.__scene = 'break';/*/T*/
  const c = cover('breakCover', `<div class="breakbox">${coverHead()}<svg class="restart" viewBox="0 0 360 160" aria-hidden="true"></svg>
    <button class="go big" id="restBtn" aria-label="${esc(G(labelText('restNow')))}">${ICON.moon}<span>${esc(G(labelText('restNow')))}</span></button><button class="more" id="moreBtn">${esc(labelText('adultMore'))}</button></div>`);
  const sv = c.querySelector('.restart'); backdrop(sv, 160, { oasisOpacity: 1 }); const p1 = palmAt(sv, 90, 150, .9), p2 = palmAt(sv, 280, 150, .8); springAt(sv, 180, 140, 1, { stones: UNITS.filter(u => PROG['badge:' + u.id]).length, total: 6, level: .5 });
  [p1, p2].forEach((p, i) => anim(p, [{ transform: p.getAttribute('transform').replace(/translate\(([-\d.]+) ([-\d.]+)\)/, 'translate($1px,$2px)') + ' rotate(-2deg)' }, { transform: p.getAttribute('transform').replace(/translate\(([-\d.]+) ([-\d.]+)\)/, 'translate($1px,$2px)') + ' rotate(2deg)' }], { duration: 3000 + i * 400, iterations: 10, direction: 'alternate', easing: 'ease-in-out' }));
  coverSay(c, 'gen.session.break');
  $('#restBtn').onclick = () => { hush(); c.hidden = true; SFX.tick(); showHome(); };
  $('#moreBtn').onclick = () => { hush(); adultGate(() => { $('#panel').hidden = true; c.hidden = true; SESSION.n = Math.max(0, SET.sessionMax - 1); store.set(kk('hp_session'), SESSION); next(); }, () => {}); };
}

/* ---------- بوابة الكبار (المبدأ 12): سؤال ضرب لا يجيبه طفل م1، والخطأ يؤخّر المحاولة التالية ---------- */
let gateUntil = 0, gateWait = 0;
function adultGate(then, onBack) {
  if (Date.now() < gateUntil) return then();
  const a = R(6, 9), b = R(6, 9); /*T*/if (TESTHOOK) window.__gateAns = a * b;/*/T*/
  const P = $('#panel'); P.innerHTML = `<div class="wrap gate"><h2>للكبار</h2><p>هذه الصفحة للكبار. للمتابعة اكتبوا ناتج:</p><p class="gq"><bdo dir="${NUM_DIR()}">${DG(a)} × ${DG(b)} = ؟</bdo></p>
    <form id="gateForm"><input id="gateIn" inputmode="numeric" autocomplete="off" aria-label="الناتج"><button class="go" type="submit" id="gateGo">متابعة</button></form><p id="gateMsg" class="msg" role="status"></p><button class="pick" id="gateBack">رجوع</button></div>`;
  P.hidden = false; setTimeout(() => { try { $('#gateIn').focus(); } catch (e) {} }, 50);
  $('#gateBack').onclick = () => { P.hidden = true; if (onBack) onBack(); };
  $('#gateForm').onsubmit = e => { e.preventDefault(); if (Date.now() < gateWait) return; const v = fmt.parse($('#gateIn').value);
    if (v === a * b) { gateUntil = Date.now() + 10 * 60 * 1000; then(); return; }
    gateWait = Date.now() + (FAST ? 50 : 3000); $('#gateMsg').textContent = 'الناتج غير صحيح. انتظروا لحظة ثم حاولوا من جديد.'; $('#gateGo').disabled = true;
    setTimeout(() => adultGate(then, onBack), FAST ? 60 : 3000); };
}

/* ---------- إشارات للمشرف (D203): يخمّن، وعالق، ومتوقف ---------- */
const nw = (n, one, two, few, many) => n === 0 ? `لا ${few}` : n === 1 ? one : n === 2 ? two : n >= 3 && n <= 10 ? `${DG(n)} ${few}` : `${DG(n)} ${many}`;
const isAssess = a => /^(practice|mastery|test|review|stream)/.test(a.scene || '');
function signals() { const A = LOG.attempts, out = [];
  const last = A.filter(a => a.ms != null && isAssess(a)).slice(-20);
  const quick = last.filter(a => a.ms < 2000 && !a.ok).length;
  if (quick >= 3) out.push(['يخمّن', G(`{أجاب|أجابت} ${nw(quick, 'مرة واحدة', 'مرتين', 'مرات', 'مرة')} في أقل من ثانيتين {وأخطأ|وأخطأت}. {شجّعوه|شجّعوها} على أن {يسمع|تسمع} السؤال كاملاً {وينظر|وتنظر} قبل أن {يلمس|تلمس}.`)]);
  const byL = {}; A.filter(a => /^(practice|mastery|review|remedial)/.test(a.scene || '')).forEach(a => (byL[a.lesson] = byL[a.lesson] || []).push(a));
  Object.entries(byL).forEach(([id, arr]) => { const t = arr.slice(-3); const L = LDATA[id];
    if (t.length === 3 && t.every(a => !a.ok) && L) out.push(['عالق', G(`ثلاثة أخطاء متتالية في «${plain(L.title)}». اجلسوا {معه|معها} في الدرس التالي، واستعملوا بطاقة الحوار.`)]); });
  const lastT = A.length ? A[A.length - 1].t : null; const gap = lastT ? daysBetween(lastT, Date.now()) : 0;
  if (lastT && gap > 5) out.push(['متوقف', `لا نشاط منذ ${nw(gap, 'يوم واحد', 'يومين', 'أيام', 'يوماً')}. جلسة قصيرة أو «مراجعة اليوم» تكفي للعودة.`]);
  return out; }

/* ---------- التقرير الأسبوعي للأهل (D204، D240: لا اتجاه بأقل من 20 بنداً) ---------- */
async function weeklyReport() {
  const now = Date.now(), w0 = now - 7 * DAY, w1 = now - 14 * DAY; const A = LOG.attempts;
  const score = (from, to) => { const f = A.filter(a => a.t >= from && a.t < to && a.firstTry !== undefined && isAssess(a) && a.firstTry !== null); return [f.filter(a => a.ok && a.firstTry).length, f.length]; };
  const [ok1, n1] = score(w0, now + 1), [ok0, n0] = score(w1, w0); const pct = (a, b) => b ? Math.round(a / b * 100) : null;
  const all = UNITS.flatMap(u => u.lessons); const doneW = all.filter(id => (PROG[id] || {}).at >= w0);
  const errs = {}; A.filter(a => a.t >= w0 && a.err && ERRN[a.err] && a.scene !== 'ws').forEach(a => errs[a.err] = (errs[a.err] || 0) + 1);
  const photos = (await IDB.all()).filter(p => p.t >= w0).length; const designs = store.get(designsKey(), []).filter(d => d.t >= w0).length;
  const lastId = all.filter(id => (PROG[id] || {}).done).sort((a, b) => ((PROG[b] || {}).at || 0) - ((PROG[a] || {}).at || 0))[0];
  const due = reviewDue().length; const strong = Object.values(PROG.srs).filter(r => r.due == null).length;
  const p1 = pct(ok1, n1), p0 = pct(ok0, n0); const trend = n1 >= 20 && n0 >= 20;
  $('#panel').innerHTML = `<div class="wrap report" id="report"><div class="noprint row"><button class="go" id="repPrint">طباعة</button><button class="pick" id="repBack">رجوع</button></div>
    <div class="card"><h2>تقرير الأسبوع: ${PROFILE ? esc(PROFILE.name || '') : ''}</h2><p class="muted">من ${fmt.date(w0)} إلى ${fmt.date(now)} · واحة الرياضيات، المرحلة الأولى</p></div>
    <div class="card"><b>ما أُنجز:</b> ${doneW.length ? doneW.map(id => `${plain(LDATA[id].title)}${(PROG[id] || {}).mastered ? ' (متقن)' : (PROG[id] || {}).entry ? ' (مدخل)' : ''}`).join('، ') : 'لا دروس جديدة هذا الأسبوع'}.
      <br><b>الصواب من المحاولة الأولى:</b> ${p1 == null ? 'لا محاولات هذا الأسبوع' : DG(p1) + '٪ (' + DG(ok1) + ' من ' + DG(n1) + ')'}${trend ? ' · الأسبوع السابق ' + DG(p0) + '٪' : n1 && n1 < 20 ? ' · لا نعرض اتجاهاً قبل عشرين بنداً' : ''}
      <br><b>المراجعة المتباعدة:</b> ${nw(strong, 'درس واحد', 'درسان', 'دروس', 'درساً')} ${strong === 1 ? 'ثابت' : strong === 2 ? 'ثابتان' : 'ثابتة'}، و${nw(due, 'درس واحد', 'درسان', 'دروس', 'درساً')} ${due === 1 ? 'ينتظر' : due === 2 ? 'ينتظران' : 'تنتظر'} المراجعة اليوم.
      <br><b>الورشة:</b> ${Object.entries(PROG.ws || {}).filter(([u]) => WS[u]).map(([u, n]) => `${plain(UNITS.find(x => x.id === u).title)}: ${DG(n)} من ${DG(WS[u].puzzles.length)} ألغاز`).join('، ') || 'لم تُفتح بعد'}.
      <br><b>المعرض:</b> ${nw(photos, 'صورة صيد واحدة', 'صورتا صيد', 'صور صيد', 'صورة صيد')}، و${nw(designs, 'تصميم واحد', 'تصميمان', 'تصاميم', 'تصميماً')} هذا الأسبوع.</div>
    <div class="card"><b>أخطاء تكرّرت:</b><br>${Object.keys(errs).length ? Object.entries(errs).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, n]) => `${esc(ERRN[k])}: ${DG(n)}`).join('<br>') : 'لا شيء يُذكر'}</div>
    <div class="card"><b>إشارات:</b><br>${signals().map(([t, x]) => `<span class="pill think">${t}</span> ${esc(x)}`).join('<br>') || 'لا شيء يدعو للقلق.'}</div>
    <div class="card"><b>سؤال الحوار لهذا الأسبوع:</b><br>${lastId && TALK[lastId] ? esc(G(TALK[lastId])) : 'يظهر بعد أول درس.'}${lastId && homeTask(lastId) ? `<br><span class="muted">${esc(homeTask(lastId))}</span>` : ''}</div></div>`;
  $('#panel').hidden = false; $('#panel').scrollTop = 0;
  $('#repPrint').onclick = () => { try { window.print(); } catch (e) {} };
  $('#repBack').onclick = () => openPanel();
}
/* مهمة البيت كما قالها المرشد في الختام (D221) */
const homeTask = id => { const L = LDATA[id]; return L && L.wrap && L.wrap.home ? plain(G(lineOf(L.wrap.home, L)[2])) : ''; };
