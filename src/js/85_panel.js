/* =====================================================================
   لوحة الكبار (المبدأ 12، D238، D240): حقيبة الدرس القادم، وبطاقات الحكم للكبير، وخريطة الإتقان،
   وبطاقات الحوار ومهام البيت، والمراجعة المتباعدة، والإعدادات. بلا رموز داخلية ولا درجات أمام الطفل (D233)
   ===================================================================== */
const allLessons = () => UNITS.flatMap(U => U.lessons);
function nextLessonId() { for (const [ui, U] of UNITS.entries()) { if (!unitOpen(ui)) break; for (const [i, id] of U.lessons.entries()) if (!(PROG[id] || {}).done && lessonOpen(U, i)) return id; } return null; }
const conceptName = (L, C) => (L.concepts || {})[C] || '';
function statusPill(L) { const p = PROG[L.id] || {};
  const redo = isObj(PROG.redo) && PROG.redo[L.id] ? ' <span class="pill think">يُعاد: خطآن متتاليان في المراجعة</span>' : '';
  /* D252: إتقان مسار الشاشة «مدخل» عند الكبار حتى يُعاد الدرس بالأشياء الحقيقية، والنجمة للطفل كما هي */
  if (p.mastered) return (p.entry ? '<span class="pill think">أتقنه على الشاشة، مدخل</span> <span class="muted">يصير تأسيساً حين يُعاد بالأشياء</span>' : '<span class="pill good">متقن</span>') + redo;
  if (p.resume) return '<span class="pill">توقّف في منتصفه</span>';
  if (!p.done) return '—';
  const def = Object.entries(p.cs || {}).filter(([C, c]) => isObj(c) && c.deferred && !c.mastered && !adultSays(L, C)).map(([C]) => conceptName(L, C)).filter(Boolean);
  return redo.slice(1) + `${redo ? ' ' : ''}<span class="pill">أُنجز</span>${p.entry ? ' <span class="pill think">مدخل: بالشاشة وحدها</span>' : ''}${def.length ? ` <span class="pill think">مؤجَّل إلى المراجعة: ${esc(def.join('، '))}</span>` : ''}${L.test && p.score != null ? ` <span class="pill">${DG(p.score)} من ${DG(p.of)}</span>` : ''}`; }
/* حكم الكبير (المبدأ 12، D240؛ الفحص الخصم A01 وA02): من أجوبته الصريحة وحدها، بطول أسئلة البطاقة («نعم» في كلها)،
   ويُشتقّ من الأجوبة الحاضرة كلما عُرض، فـ«ليس بعد» بعد «نعم» يلغيه. وهو مصدرٌ مستقلّ لا يكتب إتقان التطبيق (cs.mastered) ولا يمحوه */
const adultAnswers = L => { const n = L.adultCard.qs.length, a = isObj(PROG.adult) && Array.isArray(PROG.adult[L.id]) ? PROG.adult[L.id] : [];
  return Array.from({ length: n }, (_, i) => a[i] === true ? true : a[i] === false ? false : null); };
const adultSays = (L, C) => !!(L && L.adultCard && L.adultCard.concept === C && adultAnswers(L).every(x => x === true));
/* ترحيل ما كتبه الحكم القديم في المفهوم نفسه (mastered وbyAdult معاً): يبقى إتقان التطبيق بدليله (عتبة فحصه) لا بالحكم */
(function adultMigrate() { let ch = false;
  for (const L of Object.values(LDATA)) { const C = L.adultCard && L.adultCard.concept; const c = C && isObj(PROG[L.id]) && isObj(PROG[L.id].cs) ? PROG[L.id].cs[C] : null;
    if (!isObj(c) || !('byAdult' in c)) continue; ch = true;
    const entry = ((L.mastery && L.mastery.entryOnly) || []).includes(C), app = !entry && isInt(c.ok) && isInt(c.of) && c.of > 0 && c.ok >= msNeed(c.of);
    if (c.byAdult && !app) { delete c.mastered; if (!entry) c.deferred = true; } delete c.byAdult; }
  if (ch) saveProg(); })();
function adultCardHTML(L) { const A = L.adultCard; const saved = adultAnswers(L);
  return `<div class="talkcard"><b>${esc(plain(L.title))}: ${esc(A.title)}</b><p class="muted">${esc(A.how)}</p>${A.qs.map((q, i) => `<div class="aq"><span>${DG(i + 1)}. ${esc(q)}</span><span class="seg">
    <button class="pick" data-ac="${esc(L.id)}" data-i="${i}" data-v="1" aria-pressed="${saved[i] === true}">نعم</button><button class="pick" data-ac="${esc(L.id)}" data-i="${i}" data-v="0" aria-pressed="${saved[i] === false}">ليس بعد</button></span></div>`).join('')}
    ${A.concept && adultSays(L, A.concept) ? '<span class="pill good">متقن بحكم الكبير</span>' : ''}</div>`; }
/* حالة المفهوم في خريطة الإتقان: إتقان التطبيق وحكم الكبير مصدران، والعرض منهما */
function conceptPill(L, C) { const c = ((PROG[L.id] || {}).cs || {})[C] || {}, adult = adultSays(L, C);
  if (c.mastered) return (PROG[L.id] || {}).entry && !adult ? '<span class="pill think">أتقنه على الشاشة، مدخل</span>' : '<span class="pill good">متقن</span>';
  if (adult) return '<span class="pill good">متقن بحكم الكبير</span>';
  return c.entry ? '<span class="pill think">مدخل: يحكم الكبير</span>' : c.deferred ? '<span class="pill think">مؤجَّل إلى المراجعة</span>' : (L.mastery && L.mastery.concepts[C]) ? '—' : '<span class="pill">مدخل</span>'; }
/* حذفٌ لم يكتمل يُقال بسببه، ويُعرض إكماله بضغطة (الفحص المستقل WM101-R1-01، R1-03): الطفل باقٍ في القائمة كما في التخزين حتى يكتمل */
const KID_DEL_WHY = { mark: 'تعذّر بدء الحذف، فلم يُحذف شيء', photos: 'تعذّر الوصول إلى صوره على هذا الجهاز، فلم يكتمل حذفه',
  keys: 'تعذّر حذف بعض بياناته (المساحة ممتلئة أو التصفّح الخاص)، فلم يكتمل حذفه', rescue: 'تعذّر حذفه من نسخة ما قبل الاستعادة، فلم يكتمل حذفه',
  list: 'تعذّر حفظ قائمة الأطفال بدونه، فلم يكتمل حذفه' };
/* حذفٌ واحد في كل مرة (WM102-R2-01): ما دام حذف طفلٍ في القائمة لم يكتمل أو جارياً، لا تُعرض أزرار حذف غيره (وkidDelete يرفضه أيضاً) */
const kidDelBusy = () => { const p = KID_DEL_RUN || kidDelPending(); return !!p && KIDS.some(k => k.id === p); };
function kidDelNote() { const st = KID_DEL_STATE, id = st ? st.id : kidDelPending(); if (!id) return '';
  const k = KIDS.find(x => x.id === id), nm = esc((k && k.name) || 'الطفل');
  if (st && st.cancelled) return `<p class="muted" id="kidDelNote">أُلغي حذف ${nm} الذي لم يكتمل لأنه اختير بعده، وقد يكون حُذف بعض بياناته قبل ذلك.</p>`;
  if (!k || k.id === KID) return '';
  return `<p class="muted" id="kidDelNote">${(st && KID_DEL_WHY[st.why]) || 'حذف ' + nm + ' لم يكتمل'}: يبقى ${nm} في القائمة حتى يكتمل، ولا يُحذف طفلٌ آخر قبله. ولإلغاء حذفه اختاروه من قائمة الأطفال.</p><div class="seg"><button class="pick" data-del="${esc(id)}" data-sure="1">أكملوا حذف ${nm}</button></div>`; }
function openPanel() {
  const A = LOG.attempts; const errs = {}; A.filter(a => a.err && ERRN[a.err] && a.scene !== 'ws').forEach(a => errs[a.err] = (errs[a.err] || 0) + 1);
  const firsts = A.filter(a => a.firstTry !== undefined && isAssess(a)); const fOk = firsts.filter(a => a.firstTry && a.ok).length;
  const nid = nextLessonId(), NL = nid ? LDATA[nid] : null;
  const done = allLessons().filter(id => (PROG[id] || {}).done).map(id => LDATA[id]);
  const faces = LOG.faces.slice(-6).map(f => `${plain(LDATA[f.lesson] ? LDATA[f.lesson].title : '')}: ${{ easy: 'سهل', ok: 'مناسب', hard: 'صعب' }[f.k] || ''}`);
  $('#panel').innerHTML = `<div class="wrap">
    <div><h2>للكبار${PROFILE && PROFILE.name ? ': ' + esc(PROFILE.name) : ''}</h2><p class="muted">ما جرى في الدروس. البيانات على هذا الجهاز فقط.</p></div>
    <div class="card warn" id="storeWarn"${STORE_ISSUES.writeFail || STORE_ISSUES.corrupt.length || STORE_ISSUES.repaired.length || STORE_ISSUES.migrated || STORE_ISSUES.restore ? '' : ' hidden'}><b>تنبيه التخزين:</b> ${STORE_ISSUES.writeFail ? 'تعذّر حفظ التقدّم الأخير (المساحة ممتلئة أو التصفّح الخاص). ' : ''}${STORE_ISSUES.corrupt.length ? 'وُجدت بيانات تالفة فحُفظت نسخة منها وبدأت القيم من جديد: ' + esc(STORE_ISSUES.corrupt.join('، ')) + '. ' : ''}${STORE_ISSUES.repaired.length ? 'وفي بعض البيانات أجزاءٌ تالفة فأُسقطت وحدها وبقي الباقي، وحُفظت نسخة منها كما كانت: ' + esc(STORE_ISSUES.repaired.join('، ')) + '. ' : ''}${STORE_ISSUES.migrated ? 'تغيّرت بنية دروس الوحدتين (ستة دروس لكلٍّ منهما)، فبدأ التقدّم من جديد، وحُفظ التقدّم القديم كاملاً في الجهاز (hp_prog_bak). ' : ''}${{ undone: 'لم تكتمل استعادة نسخةٍ سابقة (أُغلق التطبيق في أثنائها)، فأُرجع ما كان على الجهاز قبلها كاملاً.', failed: 'لم تكتمل استعادة نسخةٍ سابقة، وتعذّر إرجاع ما كان؛ وهو محفوظ في الجهاز (hp_before_restore). أعيدوا الاستعادة أو أبلغوا الدعم.', lost: 'لم تكتمل استعادة نسخةٍ سابقة، ولم توجد نسخة مما كان قبلها.' }[STORE_ISSUES.restore] || ''}</div>
    <div class="card"><b>قبل الدرس القادم: حقيبة الدرس</b>${NL ? `<p><b>${esc(plain(NL.title))}</b>${NL.bag && !NL.bag.screenOnly ? `: ${esc(NL.bag.adult)}` : ': لا يحتاج أشياء من البيت.'}</p>
      <p class="muted">أحضروها وابقوا قريبين واسمعوا، ولا تشرحوا: التطبيق يشرح. ${NL.bag && NL.bag.screenPath ? esc(NL.bag.screenPath) : ''}</p>` : '<p>أُنجزت الدروس المتاحة.</p>'}</div>
    <div class="card"><table><thead><tr><th>الدرس</th><th>الحالة</th></tr></thead><tbody>${UNITS.map(U => `<tr class="uh"><td colspan="2">${esc(plain(U.title))}${PROG['badge:' + U.id] ? ' <span class="pill good">الشارة</span>' : ''}</td></tr>` + U.lessons.map(id => { const L = LDATA[id];
      return `<tr><td>${esc(plain(L.title))}</td><td>${statusPill(L)}</td></tr>`; }).join('')).join('')}</tbody></table>
      <p><b>الصواب من المحاولة الأولى:</b> ${DG(fOk)} من ${DG(firsts.filter(a => a.firstTry != null).length)}</p></div>
    <details class="card"><summary><b>خريطة الإتقان</b> (لكل فكرة في الدروس المنجزة)</summary><table><tbody>${done.map(L => Object.entries(L.concepts || {}).map(([C, name]) => { const st = conceptPill(L, C);
      return `<tr><td>${esc(name)}</td><td>${st}</td></tr>`; }).join('')).join('') || '<tr><td>تظهر بعد أول درس.</td></tr>'}</tbody></table></details>
    ${done.some(L => L.adultCard) ? `<div class="card"><b>بطاقات يحكم بها الكبير</b> (ما لا يُتعلَّم من الشاشة):${done.filter(L => L.adultCard).map(adultCardHTML).join('')}</div>` : ''}
    <div class="card"><b>بطاقات الحوار ومهام البيت</b> (بعد كل درس أُنجز):${done.filter(L => TALK[L.id]).map(L => `<div class="talkcard"><b>${esc(plain(L.title))}</b><br>${esc(G(TALK[L.id]))}${homeTask(L.id) ? `<br><span class="muted">مهمة البيت: ${esc(homeTask(L.id))}</span>` : ''}</div>`).join('') || '<br>تظهر هنا بعد أول درس.'}</div>
    <details class="card"><summary><b>المراجعة المتباعدة</b> (لكل فكرة: بعد يوم ثم ٣ ثم ٧ ثم ٢١ يوماً، والخطأ يرجعها وحدها خطوة واحدة)</summary>${Object.keys(PROG.srs).length ? `<table><thead><tr><th>الفكرة</th><th>المرحلة</th><th>الموعد</th></tr></thead><tbody>${Object.entries(PROG.srs).map(([id, r]) => { const L = LDATA[id]; if (!L || !isObj(r) || !isObj(r.cs)) return '';
      return `<tr class="uh"><td colspan="3">${esc(plain(L.title))}</td></tr>` + Object.entries(r.cs).map(([C, x]) => { const d = x.due ? daysBetween(Date.now(), x.due) : null;
        return `<tr><td>${esc(conceptName(L, C))}</td><td>${DG(Math.min(x.step, 4))} من ${DG(4)}</td><td>${x.due == null ? '<span class="pill good">ثابت</span>' : d <= 0 ? '<span class="pill think">اليوم</span>' : 'بعد ' + nw(d, 'يوم واحد', 'يومين', 'أيام', 'يوماً')}</td></tr>`; }).join(''); }).join('')}</tbody></table>` : '<p>تبدأ بعد أول درس.</p>'}
      ${Object.entries(PROG.streams).filter(([, s]) => s.n).map(([k, s]) => `<p>${{ glance: 'اللمحة السريعة', fluency: 'أصابعي الخمس', story: 'قصص الواحة' }[k] || k}: ${DG(s.ok || 0)} من ${DG(s.n)} من المحاولة الأولى</p>`).join('')}</details>
    <div class="card"><b>إشارات</b> (من آخر المحاولات):<br>${signals().map(([t, x]) => `<span class="pill think">${t}</span> ${esc(x)}`).join('<br>') || 'لا شيء يدعو للقلق.'}
      ${faces.length ? `<p class="muted">«كيف كان؟»: ${esc(faces.join(' · '))}</p>` : ''}
      <div class="seg"><button class="pick" id="repBtn">تقرير الأسبوع للطباعة</button></div></div>
    <details class="card"><summary><b>الأخطاء الشائعة التي ظهرت</b></summary>${Object.keys(errs).length ? Object.entries(errs).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${esc(ERRN[k])}: ${DG(n)}`).join('<br>') : 'لا شيء بعد'}</details>
    <div class="card"><b>حدّ الجلسة:</b> عدد الدروس قبل أن يقترح فرجار استراحة («مراجعة اليوم» لا تُحسب).
      <div class="seg" id="segMax">${[1, 2, 3, 0].map(n => `<button class="pick" data-n="${n}" aria-pressed="${SET.sessionMax === n}">${n ? nw(n, 'درس واحد', 'درسان', 'دروس', 'درساً') : 'بلا حدّ'}</button>`).join('')}</div>
      <p class="muted">في هذه الجلسة: ${nw(sessionNow().n, 'درس واحد', 'درسان', 'دروس', 'درساً')}.</p>
      <div class="seg"><button class="pick" id="slowBtn" aria-pressed="${!!SET.slow}">قراءة أبطأ: ${SET.slow ? 'تعمل' : 'متوقفة'}</button></div></div>
    <div class="card"><b>أطفال هذا الجهاز</b> (لكل طفل تقدّمه ومعرضه وإعداداته، ويختار صورته عند الدخول):
      <div class="seg">${KIDS.map(k => `<span class="pill${k.id === KID ? ' good' : ''}">${esc(k.name || 'بلا اسم')}</span>${k.id === KID || kidDelBusy() ? '' : `<button class="pick" data-del="${esc(k.id)}">حذف ${esc(k.name || 'الطفل')}</button>`}`).join(' ')}<button class="pick" id="addKid">إضافة طفل</button><button class="pick" id="editProfile">تعديل الاسم والصورة</button></div>${kidDelNote()}</div>
    <div class="card"><b>الصوت:</b> <span id="vpStat">${vpStatText()}</span>
      <p class="muted">حزمة الصوت ملف zip (أو ملفات صوتية) اسم كل تسجيل فيه معرّف جملته في جدول التسجيل، مثل <code dir="ltr">m1.u1.d2.hook.01.mp3</code>، و<code dir="ltr">…_f.mp3</code> للصيغة المؤنثة. تُستورد مرة واحدة وتبقى في هذا الجهاز، وما لم يُسجَّل يقرؤه صوت الجهاز (D181).</p>
      <div class="seg"><button class="pick" id="vpPick">استيراد حزمة الصوت</button><button class="pick" id="vpDel"${VPACK.n ? '' : ' hidden'}>حذف الحزمة</button></div><input type="file" id="vpIn" accept=".zip,audio/*" multiple hidden><p id="vpMsg" class="muted" aria-live="polite"></p></div>
    <div class="card"><b>نسخة احتياطية:</b> ملف فيه أطفال هذا الجهاز وتقدّمهم وإعداداتهم وتصميماتهم، يُحفظ أو يُنقل إلى جهاز آخر. الصور وحزمة الصوت لا تدخل الملف.
      <div class="seg"><button class="pick" id="bkSave">حفظ نسخة في ملف</button><button class="pick" id="bkPick">استعادة نسخة</button></div><input type="file" id="bkIn" accept=".json,application/json" hidden><div id="bkMsg" aria-live="polite"></div></div>
    <details class="card"><summary><b>للتجربة والدعم</b></summary>
      <div class="seg"><button class="pick" id="unlockAll">${PROG.unlockAll ? 'إعادة قفل الدروس' : 'فتح كل الدروس للتجربة'}</button><button class="pick" id="resetAll">بدء كل الدروس من جديد</button></div>
      ${LOG.errors.length ? `<p><b>سجلّ الأعطال</b> (يُرسل عند البلاغ):</p><pre class="errlog" dir="ltr">${esc(LOG.errors.slice(-8).map(e => new Date(e.t).toISOString().slice(0, 16) + ' ' + e.scene + '\n' + e.msg.split('\n').slice(0, 3).join('\n')).join('\n\n'))}</pre>` : ''}</details>
    <div class="row"><button class="go" id="closePanel">رجوع</button></div></div>`;
  $('#panel').hidden = false; $('#panel').scrollTop = 0;
  $('#closePanel').onclick = () => { $('#panel').hidden = true; showHome(); };
  $('#editProfile').onclick = () => { $('#panel').hidden = true; openProfile(false); };
  $('#addKid').onclick = () => { $('#panel').hidden = true; openProfile(true); };
  /* حذف الطفل (الفحص الخصم A08): صوره أولاً، فإن تعذّر حذفها لا يُحذف شيء ولا يُعلَن حذف؛ ثم مفاتيحه ونسخه */
  $('#panel').querySelectorAll('[data-del]').forEach(b => b.onclick = async () => { if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = 'متأكد؟ يُحذف تقدّمه وصوره كلها'; return; }
    const id = b.dataset.del; if (!store.mine(null)) return; b.disabled = true;
    const r = await kidDelete(id); if (r.why === 'tab') return;   /* فقد التبويب القفل: غطاؤه ظاهر، ولا أثر في الواجهة لعمليةٍ أُلغيت */
    if (r.why !== 'busy') KID_DEL_STATE = r.ok ? null : { id, why: r.why }; openPanel(); });   /* 'busy': حذفٌ آخر لم يكتمل، وحاله وسببه كما هما */
  $('#panel').querySelectorAll('[data-ac]').forEach(b => b.onclick = () => { const L = LDATA[b.dataset.ac]; if (!L || !L.adultCard) return;
    const a = adultAnswers(L); a[+b.dataset.i] = b.dataset.v === '1'; PROG.adult = isObj(PROG.adult) ? PROG.adult : {}; PROG.adult[L.id] = a;
    if (saveProg()) openPanel(); });
  $('#repBtn').onclick = () => weeklyReport();
  $('#slowBtn').onclick = () => { SET.slow = !SET.slow; saveSet(); openPanel(); };
  $('#segMax').querySelectorAll('.pick').forEach(b => b.onclick = () => { SET.sessionMax = +b.dataset.n; saveSet(); openPanel(); });
  $('#unlockAll').onclick = () => { if (PROG.unlockAll) delete PROG.unlockAll; else PROG.unlockAll = true; saveProg(); $('#panel').hidden = true; showHome(); };
  $('#resetAll').onclick = () => { if ($('#resetAll').dataset.sure !== '1') { $('#resetAll').dataset.sure = '1'; $('#resetAll').textContent = 'متأكد؟ يُمحى التقدّم كله لهذا الطفل'; return; }
    for (const k of Object.keys(PROG)) delete PROG[k]; PROG.schema = SCHEMA; PROG.srs = {}; PROG.ws = {}; PROG.streams = {}; SESSION = { n: 0, t: 0 }; store.set(kk('hp_session'), SESSION); saveProg(); LOG.attempts = []; LOG.faces = []; store.set(kk('hp_log'), LOG); store.set(designsKey(), []); IDB.clear(); $('#panel').hidden = true; showHome(); };
  /* حزمة الصوت (D181) */
  $('#vpPick').onclick = () => $('#vpIn').click();
  $('#vpIn').onchange = async e => { const files = [...e.target.files]; e.target.value = ''; if (!files.length) return; const m = $('#vpMsg'); m.textContent = 'يستورد…';
    try { const r = await VPACK.importFiles(files, n => { m.textContent = 'يستورد… ' + DG(n); });
      m.textContent = (r.imported ? `استُورد ${nw(r.imported, 'تسجيل واحد', 'تسجيلان', 'تسجيلات', 'تسجيلاً')}، فصارت الحزمة ${DG(r.have)} من ${DG(r.total)}.` : 'لم يُستورد أي تسجيل.') + (r.unknown.length === 1 ? ` وأُهمل ملف واحد لا يطابق اسمه جملة في الدروس: ${r.unknown[0]}.` : r.unknown.length ? ` وأُهمل ${nw(r.unknown.length, 'ملف واحد', 'ملفان', 'ملفات', 'ملفاً')} لا تطابق أسماؤها جملاً في الدروس، أوّلها ${r.unknown[0]}.` : '') + (r.have < r.total ? ' وما لم يُسجَّل بعد يقرؤه صوت الجهاز.' : '');
      $('#vpStat').textContent = vpStatText(); $('#vpDel').hidden = !VPACK.n;
    } catch (err) { m.textContent = { notZip: 'هذا ليس ملف zip.', badZip: 'ملف zip تالف.', noInflate: 'هذا المتصفح لا يفتح ملفات zip المضغوطة؛ اختر الملفات الصوتية نفسها.', noStore: 'تعذّر الحفظ في الجهاز (التصفّح الخاص؟).', tab: 'توقّف الاستيراد لأن التطبيق فُتح في نافذة أخرى؛ ما استُورد قبلها باقٍ.' }[err && err.message] || 'تعذّر الاستيراد.'; } };
  $('#vpDel').onclick = async () => { const b = $('#vpDel'); if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = 'متأكد؟ يعود صوت الجهاز'; return; }
    if (b.disabled) return; b.disabled = true; let r; try { r = await VPACK.clear(); } catch (e) { r = 'fail'; } b.disabled = false; b.dataset.sure = ''; b.textContent = 'حذف الحزمة';
    if (r !== 'ok') { $('#vpMsg').textContent = r === 'tab' ? 'لم تُحذف الحزمة لأن التطبيق فُتح في نافذة أخرى.' : 'تعذّر حذف الحزمة من الجهاز، فبقيت كما هي. جرّبوا مرة أخرى.'; return; }   // لا يُعلن الحذف قبل التزامه (WM102-R3-01)
    $('#vpStat').textContent = vpStatText(); b.hidden = true; $('#vpMsg').textContent = 'حُذفت الحزمة.'; };
  /* النسخة الاحتياطية (D246) */
  $('#bkSave').onclick = () => { backupSave(); $('#bkMsg').textContent = 'حُفظ الملف في التنزيلات.'; };
  $('#bkPick').onclick = () => $('#bkIn').click();
  $('#bkIn').onchange = async e => { const f = e.target.files[0]; e.target.value = ''; if (!f) return; const box = $('#bkMsg'); let chk;
    try { chk = backupCheck(await f.text()); } catch (x) { chk = { ok: false, why: 'notJson' }; }
    if (!chk.ok) { box.textContent = { notJson: 'هذا ليس ملف نسخة من واحة الرياضيات.', notOurs: 'هذا ليس ملف نسخة من واحة الرياضيات.', empty: 'ملف النسخة فارغ.', noKids: 'ملف النسخة بلا أطفال.', badKey: 'في الملف بيانات لا يعرفها التطبيق، فلم يُستعمل.', badValue: 'ملف النسخة تالف، فلم يُستعمل.', oldVersion: 'هذه النسخة من إصدارٍ آخر للتطبيق بغير بنية دروسه الحالية، فلم تُستعمل.' }[chk.why] || 'ملف النسخة تالف، فلم يُستعمل.'; return; }
    box.innerHTML = `<p>في النسخة: ${chk.kids.map(k => esc(k.name || 'بلا اسم') + ' (' + (k.done ? 'أنجز ' + nw(k.done, 'درساً واحداً', 'درسين', 'دروس', 'درساً') : 'لم يبدأ') + ')').join('، ')}.</p>
      <p class="muted">الاستعادة تضع ما في النسخة مكان أطفال هذا الجهاز وتقدّمهم، وتُحفظ قبلها نسخة مما على الجهاز الآن. الصور وحزمة الصوت لا تتغيّر.</p><div class="seg"><button class="pick" id="bkGo">استعادة</button><button class="pick" id="bkNo">إلغاء</button></div>`;
    $('#bkGo').onclick = () => { const g = $('#bkGo'); if (g.dataset.sure !== '1') { g.dataset.sure = '1'; g.textContent = 'متأكد؟ يُستبدل ما على هذا الجهاز'; return; }
      const r = backupApply(chk); if (r.why === 'tab') return;
      box.textContent = r.ok ? 'استُعيدت النسخة. يُعاد فتح التطبيق…' : { rescue: 'لم تُستعَد النسخة: تعذّر أولاً حفظ نسخةٍ مما على الجهاز (المساحة ممتلئة؟)، فلم يتغيّر شيء.',
        space: 'لم تُستعَد النسخة: تعذّرت كتابة بياناتها (المساحة ممتلئة؟)، فبقي ما على الجهاز كما كان.', partial: 'لم تُستعَد النسخة، وتعذّر إرجاع ما كان في الحال؛ يُعاد فتح التطبيق ليُرجعه من نسخته المحفوظة.' }[r.why];
      if (r.ok || r.why === 'partial') setTimeout(() => location.reload(), r.ok ? 700 : 2500); };
    $('#bkNo').onclick = () => { box.textContent = ''; }; };
}
const vpStatText = () => VPACK.n ? `حزمة الصوت: ${DG(VPACK.n)} من ${DG(voiceIds().size)} تسجيلاً` : 'صوت الجهاز (لا حزمة مستوردة)';
$('#adultBtn').onclick = () => { stopVoice(); adultGate(openPanel, () => {}); };            // الزرّ في الخريطة وحدها، فلا يقطع درساً
