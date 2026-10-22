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
  const def = Object.entries(p.cs || {}).filter(([, c]) => c.deferred && !c.mastered).map(([C]) => conceptName(L, C)).filter(Boolean);
  return redo.slice(1) + `${redo ? ' ' : ''}<span class="pill">أُنجز</span>${p.entry ? ' <span class="pill think">مدخل: بالشاشة وحدها</span>' : ''}${def.length ? ` <span class="pill think">مؤجَّل إلى المراجعة: ${esc(def.join('، '))}</span>` : ''}${L.test && p.score != null ? ` <span class="pill">${DG(p.score)} من ${DG(p.of)}</span>` : ''}`; }
function adultCardHTML(L) { const A = L.adultCard; const saved = (PROG.adult || {})[L.id] || [];
  return `<div class="talkcard"><b>${esc(plain(L.title))}: ${esc(A.title)}</b><p class="muted">${esc(A.how)}</p>${A.qs.map((q, i) => `<div class="aq"><span>${DG(i + 1)}. ${esc(q)}</span><span class="seg">
    <button class="pick" data-ac="${L.id}" data-i="${i}" data-v="1" aria-pressed="${saved[i] === true}">نعم</button><button class="pick" data-ac="${L.id}" data-i="${i}" data-v="0" aria-pressed="${saved[i] === false}">ليس بعد</button></span></div>`).join('')}
    ${saved.length === A.qs.length && saved.every(Boolean) ? '<span class="pill good">متقن بحكم الكبير</span>' : ''}</div>`; }
function openPanel() {
  const A = LOG.attempts; const errs = {}; A.filter(a => a.err && ERRN[a.err] && a.scene !== 'ws').forEach(a => errs[a.err] = (errs[a.err] || 0) + 1);
  const firsts = A.filter(a => a.firstTry !== undefined && isAssess(a)); const fOk = firsts.filter(a => a.firstTry && a.ok).length;
  const nid = nextLessonId(), NL = nid ? LDATA[nid] : null;
  const done = allLessons().filter(id => (PROG[id] || {}).done).map(id => LDATA[id]);
  const faces = LOG.faces.slice(-6).map(f => `${plain(LDATA[f.lesson] ? LDATA[f.lesson].title : '')}: ${{ easy: 'سهل', ok: 'مناسب', hard: 'صعب' }[f.k] || ''}`);
  $('#panel').innerHTML = `<div class="wrap">
    <div><h2>للكبار${PROFILE && PROFILE.name ? ': ' + esc(PROFILE.name) : ''}</h2><p class="muted">ما جرى في الدروس. البيانات على هذا الجهاز فقط.</p></div>
    <div class="card warn" id="storeWarn"${STORE_ISSUES.writeFail || STORE_ISSUES.corrupt.length || STORE_ISSUES.migrated ? '' : ' hidden'}><b>تنبيه التخزين:</b> ${STORE_ISSUES.writeFail ? 'تعذّر حفظ التقدّم الأخير (المساحة ممتلئة أو التصفّح الخاص). ' : ''}${STORE_ISSUES.corrupt.length ? 'وُجدت بيانات تالفة فحُفظت نسخة منها وبدأت القيم من جديد: ' + esc(STORE_ISSUES.corrupt.join('، ')) + '. ' : ''}${STORE_ISSUES.migrated ? 'تغيّرت بنية دروس الوحدتين (ستة دروس لكلٍّ منهما)، فبدأ التقدّم من جديد، وحُفظ التقدّم القديم كاملاً في الجهاز (hp_prog_bak).' : ''}</div>
    <div class="card"><b>قبل الدرس القادم: حقيبة الدرس</b>${NL ? `<p><b>${esc(plain(NL.title))}</b>${NL.bag && !NL.bag.screenOnly ? `: ${esc(NL.bag.adult)}` : ': لا يحتاج أشياء من البيت.'}</p>
      <p class="muted">أحضروها وابقوا قريبين واسمعوا، ولا تشرحوا: التطبيق يشرح. ${NL.bag && NL.bag.screenPath ? esc(NL.bag.screenPath) : ''}</p>` : '<p>أُنجزت الدروس المتاحة.</p>'}</div>
    <div class="card"><table><thead><tr><th>الدرس</th><th>الحالة</th></tr></thead><tbody>${UNITS.map(U => `<tr class="uh"><td colspan="2">${esc(plain(U.title))}${PROG['badge:' + U.id] ? ' <span class="pill good">الشارة</span>' : ''}</td></tr>` + U.lessons.map(id => { const L = LDATA[id];
      return `<tr><td>${esc(plain(L.title))}</td><td>${statusPill(L)}</td></tr>`; }).join('')).join('')}</tbody></table>
      <p><b>الصواب من المحاولة الأولى:</b> ${DG(fOk)} من ${DG(firsts.filter(a => a.firstTry != null).length)}</p></div>
    <details class="card"><summary><b>خريطة الإتقان</b> (لكل فكرة في الدروس المنجزة)</summary><table><tbody>${done.map(L => Object.entries(L.concepts || {}).map(([C, name]) => { const c = ((PROG[L.id] || {}).cs || {})[C] || {};
      const st = c.mastered ? ((PROG[L.id] || {}).entry && !c.byAdult ? '<span class="pill think">أتقنه على الشاشة، مدخل</span>' : '<span class="pill good">متقن</span>') : c.entry ? '<span class="pill think">مدخل: يحكم الكبير</span>' : c.deferred ? '<span class="pill think">مؤجَّل إلى المراجعة</span>' : (L.mastery && L.mastery.concepts[C]) ? '—' : '<span class="pill">مدخل</span>';
      return `<tr><td>${esc(name)}</td><td>${st}</td></tr>`; }).join('')).join('') || '<tr><td>تظهر بعد أول درس.</td></tr>'}</tbody></table></details>
    ${done.some(L => L.adultCard) ? `<div class="card"><b>بطاقات يحكم بها الكبير</b> (ما لا يُتعلَّم من الشاشة):${done.filter(L => L.adultCard).map(adultCardHTML).join('')}</div>` : ''}
    <div class="card"><b>بطاقات الحوار ومهام البيت</b> (بعد كل درس أُنجز):${done.filter(L => TALK[L.id]).map(L => `<div class="talkcard"><b>${esc(plain(L.title))}</b><br>${esc(G(TALK[L.id]))}${homeTask(L.id) ? `<br><span class="muted">مهمة البيت: ${esc(homeTask(L.id))}</span>` : ''}</div>`).join('') || '<br>تظهر هنا بعد أول درس.'}</div>
    <details class="card"><summary><b>المراجعة المتباعدة</b> (بعد يوم ثم ٣ ثم ٧ ثم ٢١ يوماً، والخطأ يرجعها خطوة واحدة)</summary>${Object.keys(PROG.srs).length ? `<table><thead><tr><th>الدرس</th><th>المرحلة</th><th>الموعد</th></tr></thead><tbody>${Object.entries(PROG.srs).map(([id, r]) => { const L = LDATA[id]; if (!L) return ''; const d = r.due ? daysBetween(Date.now(), r.due) : null;
      return `<tr><td>${esc(plain(L.title))}</td><td>${DG(Math.min(r.step, 4))} من ${DG(4)}</td><td>${r.due == null ? '<span class="pill good">ثابت</span>' : d <= 0 ? '<span class="pill think">اليوم</span>' : 'بعد ' + nw(d, 'يوم واحد', 'يومين', 'أيام', 'يوماً')}</td></tr>`; }).join('')}</tbody></table>` : '<p>تبدأ بعد أول درس.</p>'}
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
      <div class="seg">${KIDS.map(k => `<span class="pill${k.id === KID ? ' good' : ''}">${esc(k.name || 'بلا اسم')}</span>${k.id === KID ? '' : `<button class="pick" data-del="${k.id}">حذف ${esc(k.name || 'الطفل')}</button>`}`).join(' ')}<button class="pick" id="addKid">إضافة طفل</button><button class="pick" id="editProfile">تعديل الاسم والصورة</button></div></div>
    <details class="card"><summary><b>للتجربة والدعم</b></summary>
      <p>أصوات مسجّلة: ملفات صوتية اسم كل منها معرّف الجملة، مثل <code>m1.u1.d2.hook.01.mp3</code> أو <code>…_f.mp3</code> للصيغة المؤنثة.</p><input type="file" id="clipIn" accept="audio/*" multiple><p id="clipMsg" class="muted"></p>
      <div class="seg"><button class="pick" id="unlockAll">${PROG.unlockAll ? 'إعادة قفل الدروس' : 'فتح كل الدروس للتجربة'}</button><button class="pick" id="resetAll">بدء كل الدروس من جديد</button></div>
      ${LOG.errors.length ? `<p><b>سجلّ الأعطال</b> (يُرسل عند البلاغ):</p><pre class="errlog" dir="ltr">${esc(LOG.errors.slice(-8).map(e => new Date(e.t).toISOString().slice(0, 16) + ' ' + e.scene + '\n' + e.msg.split('\n').slice(0, 3).join('\n')).join('\n\n'))}</pre>` : ''}</details>
    <div class="row"><button class="go" id="closePanel">رجوع</button></div></div>`;
  $('#panel').hidden = false; $('#panel').scrollTop = 0;
  $('#closePanel').onclick = () => { $('#panel').hidden = true; showHome(); };
  $('#editProfile').onclick = () => { $('#panel').hidden = true; openProfile(false); };
  $('#addKid').onclick = () => { $('#panel').hidden = true; openProfile(true); };
  $('#panel').querySelectorAll('[data-del]').forEach(b => b.onclick = () => { if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = 'متأكد؟ يُحذف تقدّمه كله'; return; }
    const id = b.dataset.del; for (const key of ['hp_prog', 'hp_log', 'hp_session', 'hp_settings', 'hp_designs']) store.del(key + ':' + id);
    KIDS.splice(KIDS.findIndex(k => k.id === id), 1); store.set('hp_kids', KIDS); openPanel(); });
  $('#panel').querySelectorAll('[data-ac]').forEach(b => b.onclick = () => { PROG.adult = isObj(PROG.adult) ? PROG.adult : {}; const a = PROG.adult[b.dataset.ac] = PROG.adult[b.dataset.ac] || [];
    a[+b.dataset.i] = b.dataset.v === '1'; const L = LDATA[b.dataset.ac]; const C = L.adultCard.concept;
    if (C && a.length === L.adultCard.qs.length && a.every(Boolean)) { const cs = progOf(L.id).cs = progOf(L.id).cs || {}; cs[C] = { ...(cs[C] || {}), mastered: true, byAdult: true }; }
    saveProg(); openPanel(); });
  $('#repBtn').onclick = () => weeklyReport();
  $('#slowBtn').onclick = () => { SET.slow = !SET.slow; saveSet(); openPanel(); };
  $('#segMax').querySelectorAll('.pick').forEach(b => b.onclick = () => { SET.sessionMax = +b.dataset.n; saveSet(); openPanel(); });
  $('#unlockAll').onclick = () => { if (PROG.unlockAll) delete PROG.unlockAll; else PROG.unlockAll = true; saveProg(); $('#panel').hidden = true; showHome(); };
  $('#resetAll').onclick = () => { if ($('#resetAll').dataset.sure !== '1') { $('#resetAll').dataset.sure = '1'; $('#resetAll').textContent = 'متأكد؟ يُمحى التقدّم كله لهذا الطفل'; return; }
    for (const k of Object.keys(PROG)) delete PROG[k]; PROG.schema = SCHEMA; PROG.srs = {}; PROG.ws = {}; PROG.streams = {}; SESSION = { n: 0, t: 0 }; store.set(kk('hp_session'), SESSION); saveProg(); LOG.attempts = []; LOG.faces = []; store.set(kk('hp_log'), LOG); store.set(designsKey(), []); IDB.clear(); $('#panel').hidden = true; showHome(); };
  $('#clipIn').onchange = e => { let n = 0; for (const f of e.target.files) { CLIPS[f.name.replace(/\.(mp3|m4a|wav|ogg)$/i, '')] = URL.createObjectURL(f); n++; } $('#clipMsg').textContent = 'أُضيف ' + DG(n) + ' ملفاً.'; };
}
$('#adultBtn').onclick = () => { stopVoice(); adultGate(openPanel, () => {}); };            // الزرّ في الخريطة وحدها، فلا يقطع درساً
