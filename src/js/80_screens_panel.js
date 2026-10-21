/* =====================================================================
   الشاشات: الملف، والخريطة
   ===================================================================== */
function show(id) { for (const s of ['#home', '#lesson']) $(s).hidden = s !== '#' + id; if (id === 'home') stopVoice(); }
function stopIcon(L) { const s = el('svg', { viewBox: '0 0 72 56' });
  if (L.icon[0] === 'crystal') { el('polygon', { points: '36,4 54,22 46,52 26,52 18,22', fill: '#9fd4ea', stroke: '#fff', 'stroke-width': 3, filter: 'url(#pp)' }, s); return s.outerHTML; }
  if (SOLIDC[L.icon[0]] || L.icon[0] === 'flat') { L.icon.forEach((k, i) => { const x = 36 + (i - (L.icon.length - 1) / 2) * 28; thingAt(s, k === 'flat' ? { type: 'square', size: 26, color: css('--square'), plain: true } : { solid: k, size: 44 }, x, 28); }); return s.outerHTML; }
  L.icon.forEach((k, i) => { const x = 36 + (i - (L.icon.length - 1) / 2) * 24; shapeAt(s, { type: k, size: 28, w: k === 'rect' ? 36 : k === 'triangle' ? 32 : undefined, h: k === 'rect' ? 22 : k === 'triangle' ? 28 : undefined, color: css(IDC[k]) }, x, 28); }); return s.outerHTML; }
function showHome() {
  show('home'); CUR = null; window.__scene = 'home';
  $('#helloName').textContent = PROFILE ? G('أَهْلًا يَا {name}!') : '';
  const me = $('#meBtn'); me.innerHTML = ''; me.appendChild(avatarNode(PROFILE)); $('#galBtn').innerHTML = ICON.gallery;
  const nDone = LESSONS.filter(L => PROG[L.id] && PROG[L.id].done).length;
  const b = el('svg', { viewBox: '0 0 360 150' }); backdrop(b, 150, { n: 2 + nDone, cityOpacity: 1, cityH: 82, ground: 22 });
  UNITS.filter(U => PROG['badge:' + U.id]).forEach((U, i) => { const c = el('g', { transform: `translate(${320 - i * 40} 40)` }, b); el('polygon', { points: '0,-22 15,-6 9,20 -9,20 -15,-6', fill: ['#9fd4ea', '#cfe6a0'][i % 2], stroke: '#fff', 'stroke-width': 3, filter: 'url(#pp)' }, c); });
  $('#cityBanner').innerHTML = b.outerHTML;
  const path = $('#path'); path.innerHTML = '';
  let nowSet = false;
  const due = reviewDue();
  if (due.length) { const rb = document.createElement('button'); rb.className = 'stop review now'; nowSet = true; rb.dataset.review = '1';
    rb.innerHTML = `<svg viewBox="0 0 72 56" aria-hidden="true"><circle cx="36" cy="28" r="22" fill="${css('--paper')}" stroke="${css('--compass')}" stroke-width="4"/><path d="M36 14v14l10 6" stroke="${css('--compass')}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M14 12l6 6M58 12l-6 6" stroke="${css('--rect')}" stroke-width="4" stroke-linecap="round"/></svg>`
      + `<span>${G('مُرَاجَعَةُ اليَوْمِ')}<small>${G('أَسْئِلَةٌ قَصِيرَةٌ مِنْ دُرُوسٍ {دَرَسْتَهَا|دَرَسْتِهَا}')}</small></span><svg class="st" viewBox="0 0 24 24"><path d="M12 2l3 7 7 .6-5.3 4.6L18.4 22 12 18l-6.4 4 1.7-7.8L2 9.6 9 9z" fill="#f2b33d" stroke="#c98f55"/></svg>`;
    rb.onclick = () => { SFX.tick(); runReview(); }; path.appendChild(rb); }
  UNITS.forEach((U, ui) => { const list = LESSONS.filter(L => unitOf(L) === U.id); const uOpen = unitOpen(ui);
    const head = document.createElement('div'); head.className = 'unithead' + (uOpen ? '' : ' locked');
    const badgeSvg = PROG['badge:' + U.id] ? `<svg class="ub" viewBox="0 0 24 24"><polygon points="12,2 20,9 17,22 7,22 4,9" fill="#9fd4ea" stroke="#fff" stroke-width="1.5"/></svg>` : uOpen ? '' : `<svg class="ub" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2" fill="${css('--muted')}"/><path d="M8 10V7a4 4 0 018 0v3" stroke="${css('--muted')}" stroke-width="2" fill="none"/></svg>`;
    head.innerHTML = `<span class="hosts">${hostsSVG(U.id)}</span><span style="flex:1">${U.title}<small>${U.sub}${uOpen ? '' : ' · تُفتح بعد شارة الوحدة السابقة'}</small></span>${badgeSvg}`; path.appendChild(head);
    list.forEach((L, i) => { const p = PROG[L.id] || {}; const unlocked = uOpen && (i === 0 || PROG.unlockAll || (PROG[list[i - 1].id] || {}).done);
    const btn = document.createElement('button'); btn.className = 'stop'; btn.setAttribute('aria-disabled', !unlocked); btn.dataset.lesson = L.id;
    const want = PROG.review ? PROG.review === L.id : (!p.done || (L.test && !p.mastered));
    if (unlocked && want && !nowSet) { btn.classList.add('now'); nowSet = true; }
    const st = p.mastered ? `<svg class="st" viewBox="0 0 24 24"><path d="M12 2l3 7 7 .6-5.3 4.6L18.4 22 12 18l-6.4 4 1.7-7.8L2 9.6 9 9z" fill="#f2b33d" stroke="#c98f55"/></svg>` : p.done ? `<svg class="st" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="${css('--good')}"/><path d="M7 12l3.5 3.5L17 9" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>` : unlocked ? '' : `<svg class="st" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2" fill="${css('--muted')}"/><path d="M8 10V7a4 4 0 018 0v3" stroke="${css('--muted')}" stroke-width="2" fill="none"/></svg>`;
    const sub = PROG.review === L.id ? '{رَاجِعْهُ ثُمَّ عُدْ|رَاجِعِيهِ ثُمَّ عُودِي} لِلتَّحَدِّي' : L.test && p.done && !p.mastered ? '{حَاوِلْ|حَاوِلِي} مِنْ جَدِيدٍ' : 'الدَّرْسُ ' + DG(i + 1);
    btn.innerHTML = stopIcon(L) + `<span>${L.title}<small>${G(sub)}</small></span>` + st;
    btn.onclick = () => { if (!unlocked) { SFX.soft(); return; } SFX.tick(); if (needBreak()) { breakScene(L); return; } runLesson(L); };
    path.appendChild(btn); });
    if (WS[U.id]) { const wOpen = !!PROG['badge:' + U.id] || !!PROG.unlockAll; const wb = document.createElement('button'); wb.className = 'stop ws'; wb.dataset.workshop = U.id; wb.setAttribute('aria-disabled', !wOpen);
      const solved = (PROG.ws || {})[U.id] || 0, total = WS[U.id].puzzles.length;
      wb.innerHTML = `<svg viewBox="0 0 72 56" aria-hidden="true">${hostsSVG(U.id).replace(/^<svg[^>]*>/, '<g transform="translate(-14 -10) scale(.5)">').replace(/<\/svg>$/, '</g>')}<path d="M8 50 h56" stroke="${css('--basket-dk')}" stroke-width="4" stroke-linecap="round"/></svg>`
        + `<span>${G('الوَرْشَةُ')}<small>${wOpen ? G('أَلْغَازُ الظِّلَالِ: ') + DG(solved) + ' / ' + DG(total) : G('تُفْتَحُ بَعْدَ التَّحَدِّي')}</small></span>`
        + (wOpen ? '' : `<svg class="st" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2" fill="${css('--muted')}"/><path d="M8 10V7a4 4 0 018 0v3" stroke="${css('--muted')}" stroke-width="2" fill="none"/></svg>`);
      wb.onclick = () => { if (!wOpen) { SFX.soft(); return; } SFX.tick(); runWorkshop(U); }; path.appendChild(wb); } });
  const nowBtn = path.querySelector('.stop.now'); if (nowBtn && !FAST) setTimeout(() => nowBtn.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 300);
}
function unitOpen(ui) { return ui === 0 || !!PROG['badge:' + UNITS[ui - 1].id] || !!PROG.unlockAll; }
/* ملف الطالب */
let draft = { name: '', gender: null, photo: '' }, draftNew = false;
function openProfile(isNew) {
  draftNew = !!isNew || !PROFILE; draft = draftNew ? { name: '', gender: null, photo: '' } : { ...PROFILE };
  $('#pName').value = draft.name || '';
  $('#gM').innerHTML = kidSVG('m') + '<span>وَلَدٌ</span>'; $('#gF').innerHTML = kidSVG('f') + '<span>بِنْتٌ</span>';
  const mark = () => { $('#gM').setAttribute('aria-pressed', draft.gender === 'm'); $('#gF').setAttribute('aria-pressed', draft.gender === 'f'); const pv = $('#photoPrev'); pv.innerHTML = ''; pv.appendChild(avatarNode(draft.gender ? draft : { gender: 'm', photo: draft.photo })); };
  $('#gM').onclick = () => { draft.gender = 'm'; mark(); SFX.tick(); }; $('#gF').onclick = () => { draft.gender = 'f'; mark(); SFX.tick(); };
  $('#pPhoto').onchange = e => { const f = e.target.files && e.target.files[0]; if (!f) return; const rd = new FileReader();
    rd.onload = () => { const img = new Image(); img.onload = () => { const S = 160, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'); const k = Math.max(S / img.width, S / img.height);
      x.drawImage(img, (S - img.width * k) / 2, (S - img.height * k) / 2, img.width * k, img.height * k); draft.photo = c.toDataURL('image/jpeg', .8); mark(); }; img.src = rd.result; }; rd.readAsDataURL(f); };
  mark(); $('#pMsg').textContent = ''; $('#profileCover').hidden = false;
}
$('#pName').addEventListener('input', () => { $('#pMsg').textContent = ''; });
$('#profileForm').addEventListener('submit', e => { e.preventDefault();
  draft.name = $('#pName').value.replace(/[<>"'&`]/g, '').replace(/\s+/g, ' ').trim().slice(0, 24);
  if (!draft.name) { $('#pMsg').textContent = 'اكتب الاسم أولاً.'; $('#pName').focus(); return; }
  if (!draft.gender) { $('#pMsg').textContent = 'اختر: ولد أو بنت.'; return; }
  const rec = { name: draft.name, gender: draft.gender, photo: draft.photo || '' };
  if (draftNew) { const id = 'k' + Date.now().toString(36); KIDS.push({ id, ...rec }); store.set('hp_kids', KIDS); store.set('hp_kid', id);
    if (KID) { location.reload(); return; }              // طفل ثانٍ: نعيد التحميل لتُقرأ مفاتيحه هو
    KID = id; PROFILE = KIDS[KIDS.length - 1]; saveProg(); saveSet(); }
  else { Object.assign(PROFILE, rec); store.set('hp_kids', KIDS); }
  $('#profileCover').hidden = true; try { speechSynthesis.getVoices(); } catch (e) {} showHome(); });
function renderDigits() { $('#digBtn').textContent = DIGITS === 'east' ? '١٢٣' : '123'; }
$('#digBtn').onclick = () => { DIGITS = DIGITS === 'east' ? 'west' : 'east'; store.set('hp_digits', DIGITS); SFX.tick(); renderDigits(); showHome(); };
$('#meBtn').onclick = () => { stopVoice(); openKids(false); };
$('#galBtn').onclick = () => { SFX.tick(); openGallery(); };

/* لوحة الكبار */
function openPanel() {
  const A = LOG.attempts; const errs = {}; A.filter(a => a.err && ERRN[a.err] && a.scene !== 'ws').forEach(a => errs[a.err] = (errs[a.err] || 0) + 1);
  const firsts = A.filter(a => a.firstTry !== undefined && /^(practice|mastery|test)/.test(a.scene || '')); const fOk = firsts.filter(a => a.firstTry && a.ok).length, fN = firsts.filter(a => a.firstTry).length;
  const esc = s => String(s).replace(/[<>&"']/g, '');
  $('#panel').innerHTML = `<div class="wrap"><div><h2>للكبار${PROFILE ? ': ' + esc(PROFILE.name) : ''}</h2><p style="color:var(--muted);margin:0">ما جرى في الدروس. البيانات على هذا الجهاز فقط.</p></div>
    <div class="card"><table><thead><tr><th>الوحدة</th><th>الدرس</th><th>الحالة</th><th>الإتقان</th></tr></thead><tbody>${LESSONS.map(L => { const p = PROG[L.id] || {};
      return `<tr><td>${plain(UNITS.find(U => U.id === unitOf(L)).title)}</td><td>${plain(L.title)}</td><td>${p.done ? 'أُنجز' : '—'}</td><td>${p.mastered ? '<span class="pill good">متقن</span>' : p.deferred ? `<span class="pill think">مؤجَّل إلى المراجعة (${DG(p.score)} من ${DG(p.of || 3)})</span>` : p.score != null ? `<span class="pill think">${DG(p.score)} من ${DG(p.of || 3)}</span>` : '—'}</td></tr>`; }).join('')}</tbody></table>
      <p style="margin:8px 0 0"><b>الصواب من المحاولة الأولى:</b> ${DG(fOk)} من ${DG(fN)}${UNITS.filter(U => PROG['badge:' + U.id]).map(U => ` · <span class="pill good">شارة ${plain(U.title)}</span>`).join('')}</p></div>
    <div class="card"><b>الأخطاء الشائعة التي ظهرت:</b><br>${Object.keys(errs).length ? Object.entries(errs).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${ERRN[k]}: ${DG(n)}`).join('<br>') : 'لا شيء بعد'}</div>
    <div class="card"><b>بطاقات الحوار ومهام البيت</b> (بعد كل درس أُنجز، D198):${LESSONS.filter(L => (PROG[L.id] || {}).done && TALK[L.id]).map(L => `<div class="talkcard"><b>${plain(L.title)}</b><br>${esc(G(TALK[L.id]))}${homeTask(L) ? `<br><span style="color:var(--muted)">مهمة البيت: ${esc(homeTask(L).replace(/^مهمة البيت: ?/, ''))}</span>` : ''}</div>`).join('') || '<br>تظهر هنا بعد أول درس.'}</div>
    <div class="card"><b>المراجعة المتباعدة</b> (بعد ١ و٣ و٧ و٢١ يوماً من الإتقان، والخطأ يعيدها إلى البداية):${Object.keys(PROG.srs).length ? `<table><thead><tr><th>الدرس</th><th>المرحلة</th><th>الموعد</th></tr></thead><tbody>${Object.entries(PROG.srs).map(([id, r]) => { const L = LESSONS.find(x => x.id === id); if (!L) return ''; const d = r.due ? Math.ceil((r.due - Date.now()) / DAY) : null;
      return `<tr><td>${plain(L.title)}</td><td>${DG(Math.min(r.step, 4))} من ${DG(4)}</td><td>${r.due == null ? '<span class="pill good">ثابت</span>' : d <= 0 ? '<span class="pill think">اليوم</span>' : 'بعد ' + DG(d) + (d === 1 ? ' يوم' : ' أيام')}</td></tr>`; }).join('')}</tbody></table>` : '<br>تبدأ بعد أول درس متقن.'}</div>
    <div class="card"><b>حدّ الجلسة:</b> عدد الدروس قبل أن يقترح فرجار استراحة (المراجعة القصيرة لا تُحسب). الدرس نحو ١٥–٢٠ دقيقة.
      <div class="seg" id="segMax">${[1, 2, 3, 0].map(n => `<button class="pick" data-n="${n}" aria-pressed="${SET.sessionMax === n}">${n ? DG(n) + (n === 1 ? ' درس' : ' دروس') : 'بلا حدّ'}</button>`).join('')}</div>
      <p style="margin:6px 0 0;color:var(--muted)">في هذه الجلسة: ${DG(sessionNow().n)} ${sessionNow().n === 1 ? 'درس' : 'دروس'}.</p></div>
    <div class="card"><b>الطالب:</b> ${PROFILE ? (PROFILE.gender === 'f' ? 'بنت' : 'ولد') : '—'} · الخطاب يتبع هذا الاختيار. <button class="pick" id="editProfile" style="min-height:44px;margin-top:6px">تعديل الاسم والجنس والصورة</button>
      <div style="margin-top:10px"><b>أطفال هذا الجهاز</b> (لكل طفل تقدّمه ومعرضه، ويختار الطفل صورته عند الدخول):</div>
      <div class="seg">${KIDS.map(k => `<span class="pill${k.id === KID ? ' good' : ''}">${esc(k.name)}</span>${k.id === KID ? '' : `<button class="pick" data-del="${k.id}">حذف ${esc(k.name)}</button>`}`).join(' ')}<button class="pick" id="addKid">إضافة طفل</button></div></div>
    <div class="card"><b>إشارات</b> (من آخر المحاولات):<br>${signals().map(([t, x]) => `<span class="pill think">${t}</span> ${x}`).join('<br>') || 'لا شيء يدعو للقلق.'}
      <div class="seg"><button class="pick" id="repBtn">تقرير الأسبوع للطباعة</button><button class="pick" id="slowBtn" aria-pressed="${!!SET.slow}">قراءة أبطأ: ${SET.slow ? 'تعمل' : 'متوقفة'}</button></div></div>
    <div class="card"><b>أصوات مسجّلة للتجربة:</b> ملفات MP3 اسم كل منها معرّف الجملة، مثل <code>m1.u1.d2.hook.01.mp3</code> أو <code>…_f.mp3</code> للصيغة المؤنثة.<br><input type="file" id="clipIn" accept="audio/*" multiple><div id="clipMsg" style="color:var(--muted)"></div></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="go" id="closePanel" style="flex:1;min-width:140px">رجوع</button><button class="pick" id="unlockAll" style="min-width:140px">${PROG.unlockAll ? 'إعادة قفل الدروس' : 'فتح كل الدروس للتجربة'}</button><button class="pick" id="resetAll" style="min-width:140px">بدء كل الدروس من جديد</button></div></div>`;
  $('#panel').hidden = false;
  $('#closePanel').onclick = () => { $('#panel').hidden = true; };
  $('#editProfile').onclick = () => { $('#panel').hidden = true; openProfile(false); };
  $('#addKid').onclick = () => { $('#panel').hidden = true; openProfile(true); };
  $('#panel').querySelectorAll('[data-del]').forEach(b => b.onclick = () => { if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = 'متأكد؟ يُحذف تقدّمه كله'; return; }
    const id = b.dataset.del; for (const key of ['hp_prog', 'hp_log', 'hp_session', 'hp_settings', 'hp_designs']) { try { localStorage.removeItem(key + ':' + id); } catch (e) {} }
    KIDS.splice(KIDS.findIndex(k => k.id === id), 1); store.set('hp_kids', KIDS); openPanel(); });
  $('#repBtn').onclick = () => weeklyReport();
  $('#slowBtn').onclick = () => { SET.slow = !SET.slow; saveSet(); openPanel(); };
  $('#segMax').querySelectorAll('.pick').forEach(b => b.onclick = () => { SET.sessionMax = +b.dataset.n; saveSet(); openPanel(); });
  $('#unlockAll').onclick = () => { if (PROG.unlockAll) delete PROG.unlockAll; else PROG.unlockAll = true; saveProg(); $('#panel').hidden = true; showHome(); };
  $('#resetAll').onclick = () => { for (const k of Object.keys(PROG)) delete PROG[k]; PROG.srs = {}; SESSION = { n: 0, t: 0 }; store.set(kk('hp_session'), SESSION); saveProg(); LOG.attempts = []; store.set(kk('hp_log'), LOG); store.set(designsKey(), []); IDB.clear(); $('#panel').hidden = true; showHome(); };
  $('#clipIn').onchange = e => { let n = 0; for (const f of e.target.files) { CLIPS[f.name.replace(/\.(mp3|m4a|wav|ogg)$/i, '')] = URL.createObjectURL(f); n++; } $('#clipMsg').textContent = 'أُضيف ' + DG(n) + ' ملفاً.'; };
}
$('#adultBtn').onclick = () => { stopVoice(); adultGate(openPanel); };

