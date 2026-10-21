/* ---------- إشارات للمشرف (D203): يخمّن، وعالق، ومتوقف ---------- */
/* العدد مع معدوده: ١ درس، ٢ درسان، ٣–١٠ دروس، ١١+ درساً */
const nw = (n, one, two, few, many) => n === 0 ? `لا ${few}` : n === 1 ? one : n === 2 ? two : n >= 3 && n <= 10 ? `${DG(n)} ${few}` : `${DG(n)} ${many}`;   // صفر: «لا دروس»، و١١+ بالمفرد المنصوب
function signals() { const A = LOG.attempts, out = [];
  const last = A.filter(a => a.ms != null && /^(practice|mastery|test|review)/.test(a.scene || '')).slice(-20);
  const quick = last.filter(a => a.ms < 2000 && !a.ok).length;
  if (quick >= 3) out.push(['يخمّن', G(`{أجاب|أجابت} ${DG(quick)} مرات في أقل من ثانيتين {وأخطأ|وأخطأت}. {شجّعوه|شجّعوها} على أن {يسمع|تسمع} السؤال كاملاً {وينظر|وتنظر} قبل أن {يلمس|تلمس}.`)]);
  const byL = {}; A.filter(a => /^(practice|mastery|review)/.test(a.scene || '')).forEach(a => (byL[a.lesson] = byL[a.lesson] || []).push(a));
  Object.entries(byL).forEach(([id, arr]) => { const t = arr.slice(-3); const L = LESSONS.find(x => x.id === id);
    if (t.length === 3 && t.every(a => !a.ok) && L) out.push(['عالق', G(`ثلاثة أخطاء متتالية في «${plain(L.title)}». اجلسوا {معه|معها} في الدرس التالي، واستعملوا بطاقة الحوار.`)]); });
  const lastT = A.length ? A[A.length - 1].t : null;
  if (lastT && Date.now() - lastT > 5 * DAY) out.push(['متوقف', `لا نشاط منذ ${DG(Math.floor((Date.now() - lastT) / DAY))} أيام. جلسة قصيرة أو «مراجعة اليوم» تكفي للعودة.`]);
  return out; }

/* ---------- التقرير الأسبوعي للأهل (D204): صفحة واحدة تُطبع ---------- */
async function weeklyReport() {
  const now = Date.now(), w0 = now - 7 * DAY, w1 = now - 14 * DAY; const A = LOG.attempts; const esc = s => String(s).replace(/[<>&"']/g, '');
  const score = (from, to) => { const f = A.filter(a => a.t >= from && a.t < to && a.firstTry !== undefined && /^(practice|mastery|test|review)/.test(a.scene || '') && a.firstTry); return [f.filter(a => a.ok).length, f.length]; };
  const [ok1, n1] = score(w0, now + 1), [ok0, n0] = score(w1, w0); const pct = (a, b) => b ? Math.round(a / b * 100) : null;
  const doneW = LESSONS.filter(L => (PROG[L.id] || {}).at >= w0);
  const errs = {}; A.filter(a => a.t >= w0 && a.err && ERRN[a.err] && a.scene !== 'ws').forEach(a => errs[a.err] = (errs[a.err] || 0) + 1);   // محاولات الورشة استكشاف لا تُعدّ أخطاء
  const photos = (await IDB.all()).filter(p => p.t >= w0).length; const designs = store.get(designsKey(), []).filter(d => d.t >= w0).length;
  const lastL = LESSONS.filter(L => (PROG[L.id] || {}).done).sort((a, b) => ((PROG[b.id] || {}).at || 0) - ((PROG[a.id] || {}).at || 0))[0];
  const due = reviewDue().length; const strong = Object.values(PROG.srs).filter(r => r.due == null).length;
  const d = t => new Date(t).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' });
  const p1 = pct(ok1, n1), p0 = pct(ok0, n0);
  $('#panel').innerHTML = `<div class="wrap report" id="report"><div class="noprint" style="display:flex;gap:10px;flex-wrap:wrap"><button class="go" id="repPrint" style="flex:1;min-width:140px">طباعة</button><button class="pick" id="repBack" style="min-height:44px;min-width:120px">رجوع</button></div>
    <div class="card"><h2>تقرير الأسبوع: ${PROFILE ? esc(PROFILE.name) : ''}</h2><p style="margin:0;color:var(--muted)">من ${d(w0)} إلى ${d(now)} · واحة الرياضيات، المرحلة الأولى</p></div>
    <div class="card"><b>ما أُنجز:</b> ${doneW.length ? doneW.map(L => `${plain(L.title)}${(PROG[L.id] || {}).mastered ? ' (متقن)' : ''}`).join('، ') : 'لا دروس جديدة هذا الأسبوع'}.
      <br><b>الصواب من المحاولة الأولى:</b> ${p1 == null ? 'لا محاولات هذا الأسبوع' : DG(p1) + '٪ (' + DG(ok1) + ' من ' + DG(n1) + ')'}${p0 == null || p1 == null ? '' : ' · الأسبوع السابق ' + DG(p0) + '٪'}
      <br><b>المراجعة المتباعدة:</b> ${nw(strong, 'درس واحد', 'درسان', 'دروس', 'درساً')} ${strong === 1 ? 'ثابت' : strong === 2 ? 'ثابتان' : 'ثابتة'}، و${nw(due, 'درس واحد', 'درسان', 'دروس', 'درساً')} ${due === 1 ? 'ينتظر' : due === 2 ? 'ينتظران' : 'تنتظر'} المراجعة اليوم.
      <br><b>الورشة:</b> ${Object.entries(PROG.ws || {}).map(([u, n]) => `${plain(UNITS.find(x => x.id === u).title)}: ${DG(n)} من ${DG(WS[u].puzzles.length)} ألغاز`).join('، ') || 'لم تُفتح بعد'}.
      <br><b>المعرض:</b> ${nw(photos, 'صورة صيد واحدة', 'صورتا صيد', 'صور صيد', 'صورة صيد')}، و${nw(designs, 'تصميم واحد', 'تصميمان', 'تصاميم', 'تصميماً')} في الورشة هذا الأسبوع.</div>
    <div class="card"><b>أخطاء تكرّرت:</b><br>${Object.keys(errs).length ? Object.entries(errs).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, n]) => `${ERRN[k]}: ${DG(n)}`).join('<br>') : 'لا شيء يُذكر'}</div>
    <div class="card"><b>إشارات:</b><br>${signals().map(([t, x]) => `<span class="pill think">${t}</span> ${x}`).join('<br>') || 'لا شيء يدعو للقلق.'}</div>
    <div class="card"><b>سؤال الحوار لهذا الأسبوع:</b><br>${lastL && TALK[lastL.id] ? esc(G(TALK[lastL.id])) : 'يظهر بعد أول درس.'}${lastL && homeTask(lastL) ? `<br><span style="color:var(--muted)">${esc(homeTask(lastL))}</span>` : ''}</div></div>`;
  $('#panel').hidden = false; $('#panel').scrollTop = 0;
  $('#repPrint').onclick = () => { try { window.print(); } catch (e) {} };
  $('#repBack').onclick = () => openPanel();
}


/* مراجعة اليوم: سؤال من كل درس حان موعده، من دروس ووحدات مختلفة مخلوطة (المبدأ 14) */
const REVIEW_INTRO = ['compass', 'gen.review.intro', 'مُرَاجَعَةٌ قَصِيرَةٌ! أَسْئِلَةٌ مِنْ دُرُوسٍ {دَرَسْتَهَا|دَرَسْتِهَا} قَبْلَ أَيَّامٍ.'];
const REVIEW_DONE = ['compass', 'gen.review.done', '{أَحْسَنْتَ|أَحْسَنْتِ}! {تَذَكَّرْتَ|تَذَكَّرْتِ} كُلَّ شَيْءٍ، وَالمُرَاجَعَةُ القَادِمَةُ بَعْدَ أَيَّامٍ أَكْثَرَ.'];
const REVIEW_LATER = ['compass', 'gen.review.later', 'جَيِّدٌ! مَا {أَخْطَأْتَ|أَخْطَأْتِ} فِيهِ نُرَاجِعُهُ غَدًا مَرَّةً أُخْرَى.'];
function reviewDue() { const now = Date.now(); return LESSONS.filter(L => L.sort && L.sort.sets && PROG.srs[L.id] && PROG.srs[L.id].due && PROG.srs[L.id].due <= now); }
async function runReview() {
  const due = shuffle(reviewDue()).slice(0, 4); if (!due.length) return showHome();
  const qs = due.slice(); while (qs.length < 3) qs.push(due[qs.length % due.length]);   // ثلاثة أسئلة على الأقل
  for (let i = 1; i < qs.length; i++) if (unitOf(qs[i]) === unitOf(qs[i - 1]) && i + 1 < qs.length && unitOf(qs[i + 1]) !== unitOf(qs[i])) [qs[i], qs[i + 1]] = [qs[i + 1], qs[i]];   // تداخل الوحدات ما أمكن
  CUR = null; show('lesson'); setStep(0); setGo('هَيَّا', null, false); colorIx = 0; window.__scene = 'review:intro';
  { const svg = newStage(300, { cityOpacity: .3 }); qs.forEach((L, i) => { const sv = new DOMParser().parseFromString(stopIcon(L), 'image/svg+xml').documentElement;
      const g = el('g', { transform: `translate(${250 - i * 70} 120) scale(1.1)` }, svg); [...sv.childNodes].forEach(n => g.appendChild(document.importNode(n, true))); }); }
  await say(...REVIEW_INTRO); await nextBtn('هَيَّا');
  const res = {};
  for (const [i, L] of qs.entries()) { CUR = L; setStep(1 + Math.min(5, i)); window.__scene = 'review:' + L.id;
    const pool = L.sort.sets.flat(); const r = await sortItem(pool[Math.floor(Math.random() * pool.length)], L.sort, 'review', false);
    if (!r.firstTry) { await say('compass', ...SOLVE[r.item.kind]); await say('compass', ...L.sort.reason(r.item)); }
    res[L.id] = (res[L.id] ?? true) && r.firstTry; await sleep(400); }
  for (const [id, ok] of Object.entries(res)) srsUpdate(id, ok); saveProg();
  CUR = null; setStep(7); window.__scene = 'review:end'; newStage(300, { cityOpacity: .9 });
  if (Object.values(res).every(Boolean)) { SFX.win(); confetti(); await say(...REVIEW_DONE); } else await say(...REVIEW_LATER);
  await nextBtn('خَرِيطَةُ الوَحْدَةِ'); showHome();
}
/* الاستراحة بعد حدّ الجلسة (المبدأ 11): يقترحها فرجار، والمتابعة بإذن الكبير */
const SESSION_BREAK = ['compass', 'gen.session.break', 'عَمَلٌ رَائِعٌ! حَانَ وَقْتُ الاسْتِرَاحَةِ: {اِشْرَبْ|اِشْرَبِي} مَاءً، {وَتَحَرَّكْ|وَتَحَرَّكِي} قَلِيلًا، ثُمَّ نَعُودُ.'];
function breakScene(L) { const c = $('#breakCover'); window.__scene = 'break';
  c.innerHTML = `<div class="breakbox"><div class="who">${compassSVG()}</div><p>${G(SESSION_BREAK[2])}</p><button class="go" id="restBtn">${G('سَأَسْتَرِيحُ الآنَ')}</button><button class="more" id="moreBtn">للكبار: درس إضافي الآن</button></div>`;
  c.hidden = false; say(...SESSION_BREAK);
  $('#restBtn').onclick = () => { hush(); c.hidden = true; SFX.tick(); showHome(); };
  $('#moreBtn').onclick = () => { hush(); adultGate(() => { $('#panel').hidden = true; c.hidden = true; SESSION.n = Math.max(0, SET.sessionMax - 1); store.set(kk('hp_session'), SESSION); runLesson(L); }, () => {}); };
}
/* بوابة الكبار (المبدأ 12): سؤال ضرب لا يجيبه طفل م1 */
let gateUntil = 0;
function adultGate(then, onBack) {
  if (Date.now() < gateUntil) return then();
  const a = R(6, 9), b = R(6, 9); if (TESTHOOK) window.__gateAns = a * b;
  const P = $('#panel'); P.innerHTML = `<div class="wrap gate"><h2>للكبار</h2><p style="margin:0">هذه الصفحة للكبار. للمتابعة اكتبوا ناتج:</p><p class="gq">${DG(a)} × ${DG(b)} = ؟</p>
    <form id="gateForm" style="display:grid;gap:10px"><input id="gateIn" inputmode="numeric" autocomplete="off" aria-label="الناتج"><button class="go" type="submit">متابعة</button></form><p id="gateMsg" style="color:var(--think);min-height:1.6em;margin:0"></p><button class="pick" id="gateBack" style="min-height:44px">رجوع</button></div>`;
  P.hidden = false; setTimeout(() => { try { $('#gateIn').focus(); } catch (e) {} }, 50);
  $('#gateBack').onclick = () => { P.hidden = true; if (onBack) onBack(); };
  $('#gateForm').onsubmit = e => { e.preventDefault(); const v = parseInt($('#gateIn').value.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\D/g, ''), 10);
    if (v === a * b) { gateUntil = Date.now() + 10 * 60 * 1000; then(); } else adultGate(then, onBack); };
}
/* بطاقة حوار للأهل بعد كل درس (D198): سؤال يفتح حديثاً عن الدرس، ومهمة البيت كما قالتها فوضى */
const TALK = {
  'm1.u1.d1': 'اسألوا {name}: «أرِني شيئاً دائرياً وشيئاً مربعاً في الغرفة. كيف {عرفتَ|عرفتِ} الفرق؟» الجواب المنتظر: الحافة المنحنية، أو عدّ الرؤوس الأربعة.',
  'm1.u1.d2': 'ارسموا معاً مثلثاً مقلوباً، واسألوا: «هل ما زال مثلثاً؟ لماذا؟» الجواب المنتظر: له ثلاثة أضلاع وثلاثة رؤوس مهما دار.',
  'm1.u1.d3': 'قفوا أمام باب ونافذة، واسألوا: «أيّهما مستطيل؟ وما الفرق بين المستطيل والمربع؟»',
  'm1.u1.d4': 'في المطبخ: «كم شكلاً {تجد|تجدين} من كل نوع؟» واطلبوا أن يعدّ الأضلاع بإصبعه.',
  'm1.u1.d5': 'اسألوا: «ما أصعب سؤال في التحدي؟ ولماذا؟» واستمعوا دون تصحيح.',
  'm1.u2.d1': 'دحرجوا معاً كرة وعلبة مكعبة على الأرض، واسألوا: «أيّهما يتدحرج؟ ولماذا يقف الآخر؟»',
  'm1.u2.d2': 'اسألوا: «أين {ترى|ترين} أسطوانة في البيت؟ وأين {ترى|ترين} مخروطاً؟» وجرّبوا دحرجة كوب ورقي.',
  'm1.u2.d3': 'ارسموا حول علبة على ورقة، واسألوا: «ماذا ظهر على الورقة؟ هل الرسم مجسّم أم مسطّح؟»',
  'm1.u2.d4': 'ابنوا برجاً من أشياء البيت، واسألوا: «ماذا {وضعتَ|وضعتِ} في الأسفل؟ ولماذا لا نضع الكرة هناك؟»',
};
const homeTask = L => { const w = (L.wrapLines || []).find(x => /مُهِمَّةُ البَيْتِ/.test(x[2])); return w ? plain(G(w[2])) : ''; };

