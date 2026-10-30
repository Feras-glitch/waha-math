/* =====================================================================
   أطفال الجهاز (D200)، وأول تشغيل بلا قراءة (D246)، والمعرض وصيد الكاميرا (D201)
   ===================================================================== */
/* غطاء بنصّ ظاهر يطابق المسموع (المبدأ 13): الأغطية تحجب فقاعة المرشد، فتحمل فقاعتها */
function cover(id, html) { const c = $('#' + id); c.innerHTML = html; delete c.dataset.ask; c.hidden = false; return c; }   /* وسؤاله المحفوظ (يُعاد عند ظهور الصفحة) يُمحى إذا أُعيد بناؤه */
function coverSay(box, id) { box.dataset.ask = id; const p = box.querySelector('.coversay'); const [who, , text] = lineOf(id); if (p) p.textContent = G(text); return say(who, id, text, { cover: box }); }
const coverHead = () => `<div class="talk"><div class="who">${compassSVG()}</div><div class="bubble"><span class="coversay" aria-live="polite"></span></div></div>`;

/* أول تشغيل: زرّ تشغيل كبير بلا كلمات (يفتح الصوت)، ثم يختار الطفل صورته وهو يسمع، والاسم اختياري يكتبه الكبير */
let draft = null;
function openProfile(isNew) {
  const fresh = !!isNew || !PROFILE; draft = fresh ? { name: '', avatar: '', gender: null, photo: '' } : { ...PROFILE };
  const c = cover('profileCover', `<div class="profile">${coverHead()}
    <div class="avatars" id="avList" role="group" aria-label="${esc(labelText('pickAvatar'))}"></div>
    <details class="adult"${fresh ? '' : ' open'}><summary>${esc(labelText('adultName'))}</summary>
      <input type="text" id="pName" maxlength="24" autocomplete="off" aria-label="${esc(labelText('nameField'))}">
      <div class="photo-row"><span class="round" id="photoPrev"></span><label class="pick" for="pPhoto">${esc(labelText('photoOpt'))}</label><input type="file" id="pPhoto" accept="image/*" hidden></div></details>
    <button class="go big" id="pSave" disabled aria-label="${esc(labelText('done'))}">${ICON.check}</button></div>`);
  $('#pName').value = draft.name || '';
  const list = $('#avList'); const mark = () => { list.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.av === draft.avatar)); $('#pSave').disabled = !draft.avatar;
    const pv = $('#photoPrev'); pv.innerHTML = ''; pv.appendChild(avatarNode(draft.avatar ? draft : { gender: 'm', photo: draft.photo })); };
  Object.keys(AVATARS).forEach(k => { const b = document.createElement('button'); b.className = 'av'; b.dataset.av = k; b.innerHTML = kidSVG(AVATARS[k].g, k); b.setAttribute('aria-label', labelText('avatar') + ' ' + DG(Object.keys(AVATARS).indexOf(k) + 1));
    b.onclick = () => { draft.avatar = k; draft.gender = AVATARS[k].g; mark(); SFX.tick(); PROFILE_TMP(draft); coverSay(c, 'gen.first.picked'); }; list.appendChild(b); });
  $('#pPhoto').onchange = e => { const f = e.target.files && e.target.files[0]; if (!f) return; const rd = new FileReader();
    rd.onload = () => { const img = new Image(); img.onload = () => { const Z = 160, cv = document.createElement('canvas'); cv.width = cv.height = Z; const x = cv.getContext('2d'); const k = Math.max(Z / img.width, Z / img.height);
      x.drawImage(img, (Z - img.width * k) / 2, (Z - img.height * k) / 2, img.width * k, img.height * k); draft.photo = cv.toDataURL('image/jpeg', .8); mark(); }; img.src = rd.result; }; rd.readAsDataURL(f); };
  $('#pSave').onclick = () => { if (!draft.avatar) return; hush();
    draft.name = $('#pName').value.replace(/[<>"'&`]/g, '').replace(/\s+/g, ' ').trim().slice(0, 24);
    const rec = { name: draft.name, gender: draft.gender, photo: draft.photo || '', avatar: draft.avatar };
    if (fresh) { const id = 'k' + Date.now().toString(36); KIDS.push({ id, ...rec }); store.set('hp_kids', KIDS); store.set('hp_kid', id);
      if (KID) { location.reload(); return; }                // طفل ثانٍ: نعيد التحميل لتُقرأ مفاتيحه هو
      KID = id; PROFILE = KIDS[KIDS.length - 1]; saveProg(); saveSet(); }
    else { Object.assign(PROFILE, rec); store.set('hp_kids', KIDS); }
    $('#profileCover').hidden = true; SFX.good(); showHome(); };
  mark(); coverSay(c, fresh ? 'gen.first.hello' : 'gen.first.edit');
}
/* صيغة الخطاب أثناء الاختيار تتبع الصورة المختارة قبل الحفظ */
function PROFILE_TMP(d) { if (!PROFILE || !KIDS.includes(PROFILE)) PROFILE = { id: '', name: d.name || '', gender: d.gender, avatar: d.avatar, photo: d.photo || '' }; }
/* شاشة البداية الأولى: زرّ تشغيل كبير يفتح الصوت قبل أي كلام (المتصفحات لا تنطق قبل لمسة) */
function firstRun() { const c = cover('startCover', `<div class="startbox"><div class="who big">${compassSVG()}</div><button class="go huge" id="startBtn" aria-label="${esc(labelText('start'))}">${ICON.play}</button></div>`);
  $('#startBtn').onclick = () => { try { speechSynthesis.getVoices(); } catch (e) {} SFX.tick(); c.hidden = true; openProfile(true); }; }

/* اختيار الطفل عند الدخول: الصور وحدها تكفي */
function openKids(first) {
  const c = cover('kidsCover', `<div class="breakbox">${coverHead()}<div class="kids" id="kidList"></div>
    <button class="more" id="kidNew">${esc(labelText('adultAddKid'))}</button>${first ? '' : `<button class="more" id="kidEdit">${esc(G(labelText('editMe')))}</button>`}</div>`);
  /*T*/window.__scene = 'kids';/*/T*/
  KIDS.forEach(k => { const b = document.createElement('button'); b.className = 'kid'; b.dataset.kid = k.id; b.setAttribute('aria-pressed', k.id === KID); b.setAttribute('aria-label', k.name || labelText('avatar'));
    const av = document.createElement('span'); av.className = 'round'; av.appendChild(avatarNode(k)); b.appendChild(av);
    if (k.name) { const n = document.createElement('span'); n.textContent = k.name; b.appendChild(n); }
    b.onclick = () => { SFX.tick(); hush(); if (k.id === KID) { c.hidden = true; showHome(); return; } store.set('hp_kid', k.id); location.reload(); }; $('#kidList').appendChild(b); });
  $('#kidNew').onclick = () => { hush(); adultGate(() => { $('#panel').hidden = true; c.hidden = true; openProfile(true); }, () => {}); };
  if (!first) $('#kidEdit').onclick = () => { hush(); c.hidden = true; openProfile(false); };
  coverSay(c, 'gen.kids.who');
}

/* ---------- المعرض وصيد الأشكال بالكاميرا: الصور على الجهاز فقط ---------- */
const IDB = { db: null, mem: [], failed: false, none: false,
  /* retry: الحذف يعيد محاولة الفتح بعد إخفاقٍ سابق، فيكتمل حين يعود الوصول (الفحص المستقل WM101-R1-03) */
  open(retry) { if (this.db || (this.failed && !retry)) return Promise.resolve(this.db);
    if (typeof indexedDB === 'undefined') { this.failed = this.none = true; return Promise.resolve(null); }   // لا مخزن صور في هذا المتصفح أصلاً
    return new Promise(res => { try { const r = indexedDB.open('hp_gallery', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('photos', { keyPath: 'id' });
      r.onsuccess = () => { this.db = r.result; this.failed = false; res(this.db); }; r.onerror = () => { this.failed = true; res(null); }; } catch (e) { this.failed = true; res(null); } }); },
  /* القفل يُسأل قبل الانتظار وبعده (الفحص المستقل WM101-R1-02: صورةٌ بدأ حفظها قبل أن يأخذ تبويبٌ آخر القفل كانت تُكتب بعده):
     'ok' حُفظت، و'mem' بقيت في الذاكرة لهذه الجلسة، و'tab' لم تُحفظ لأن التبويب فقد القفل */
  async put(o) { if (!store.mine(null)) return 'tab'; const db = await this.open(); if (!store.mine(null)) return 'tab';
    if (!db) { this.mem.push(o); return 'mem'; }
    return new Promise(res => { try { const tx = db.transaction('photos', 'readwrite'); tx.objectStore('photos').put(o); tx.oncomplete = () => res('ok'); tx.onerror = () => { this.mem.push(o); res('mem'); }; } catch (e) { this.mem.push(o); res('mem'); } }); },
  async all() { const db = await this.open(); const mine = x => x.kid === KID;
    if (!db) return this.mem.filter(mine);
    return new Promise(res => { try { const r = db.transaction('photos').objectStore('photos').getAll(); r.onsuccess = () => res(r.result.filter(mine).concat(this.mem.filter(mine))); r.onerror = () => res(this.mem.filter(mine)); } catch (e) { res(this.mem.filter(mine)); } }); },
  /* صور طفلٍ بعينه كلها (الفحص الخصم A08، والمستقل WM101-R1-02 وR1-03): 'ok' إن اكتمل حذفها أو لم يكن مخزن صور في المتصفح أصلاً،
     و'tab' إن فقد التبويب القفل قبل الفتح أو بعده أو قبل الحذف داخل المعاملة (فتُلغى)، و'fail' إن تعذّر الفتح أو أخفقت المعاملة:
     قاعدةٌ لا يُوصل إليها ليست قاعدةً بلا صور، وصور الذاكرة لا تُمحى إلا بعد اكتمال الحذف */
  async dropKid(id) { if (!store.mine(null)) return 'tab'; const db = await this.open(true); if (!store.mine(null)) return 'tab';
    const done = () => { this.mem = this.mem.filter(x => x.kid !== id); return 'ok'; };
    if (!db) return this.none ? done() : 'fail';
    return new Promise(res => { let out = 'fail'; try { const tx = db.transaction('photos', 'readwrite'), os = tx.objectStore('photos'); const r = os.getAll();
      r.onsuccess = () => { if (!store.mine(null)) { out = 'tab'; try { tx.abort(); } catch (x) {} return; }
        try { r.result.filter(x => x.kid === id).forEach(x => os.delete(x.id)); } catch (e) { try { tx.abort(); } catch (x) {} } };
      tx.oncomplete = () => res(done()); tx.onerror = tx.onabort = () => res(out); } catch (e) { res('fail'); } }); },
};
const designsKey = () => kk('hp_designs');
/* التصميمات بقاعدتها (الفحص الخصم A05): تصميمٌ تالف يُسقط وحده، فلا يعطّل المعرض ولا التقرير */
const designsGet = () => store.fix(designsKey(), [], V_DESIGNS);
/* حذف الطفل عمليةٌ واحدة تُستأنف (الفحص الخصم A08، والمستقل WM101-R1-01 وR1-02 وR1-03): يُكتب «حذفٌ لم يكتمل» (hp_kid_del) أولاً،
   ثم صوره، ثم مفاتيحه (التقدّم والسجل والجلسة والإعدادات والتصميمات، ونسخ الترحيل والتالف)، ثم ما يخصّه في نسخة ما قبل الاستعادة، ثم القائمة.
   كل خطوة يُتحقَّق منها، ولا يُرفع الطفل من KIDS في الذاكرة إلا بعد حفظ القائمة بدونه، فالذاكرة كالتخزين دائماً.
   فإن أخفقت خطوة وقف وبقي السجلّ: الطفل في القائمة، واللوحة تقول إن حذفه لم يكتمل وتعرض إكماله، ويُستأنف عند الفتح.
   يعيد { ok: true } أو { ok: false, why: 'tab' | 'mark' | 'photos' | 'keys' | 'rescue' | 'list' } */
const KID_DEL = 'hp_kid_del';
const kidDelPending = () => { const m = store.read(KID_DEL, null, isObj); return m && typeof m.id === 'string' && KID_ID.test(m.id) ? m.id : null; };
async function kidDelete(id) {
  if (!store.mine(null)) return { ok: false, why: 'tab' };
  if (kidDelPending() !== id && !store.set(KID_DEL, { id, t: Date.now() })) return { ok: false, why: 'mark' };
  const ph = await IDB.dropKid(id); if (ph !== 'ok') return { ok: false, why: ph === 'tab' ? 'tab' : 'photos' };
  if (!store.mine(null)) return { ok: false, why: 'tab' };
  const own = new RegExp('^hp_(?:(?:prog|log|session|settings|designs):' + id + '|prog_bak:' + id + ':v\\d+|corrupt:hp_\\w+:' + id + ':\\d+)$');
  const ks = []; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (own.test(k)) ks.push(k); } } catch (e) { return { ok: false, why: 'keys' }; }
  if (ks.map(k => store.del(k)).includes(false)) return { ok: false, why: 'keys' };
  let d = null; try { d = JSON.parse(store.raw('hp_before_restore')); } catch (e) {}
  if (isObj(d) && isObj(d.data)) { let ch = false; for (const k of Object.keys(d.data)) if (k.endsWith(':' + id)) { delete d.data[k]; ch = true; }
    if (typeof d.data.hp_kids === 'string') { try { const l = JSON.parse(d.data.hp_kids); if (Array.isArray(l) && l.some(k => isObj(k) && k.id === id)) { d.data.hp_kids = JSON.stringify(l.filter(k => !isObj(k) || k.id !== id)); ch = true; } } catch (e) {} }
    if (ch && !store.set('hp_before_restore', d)) return { ok: false, why: 'rescue' }; }   // عبر store.set لا مباشرة: بحارس القفل ككل كتابة
  const rest = KIDS.filter(k => k.id !== id);
  if (rest.length !== KIDS.length) { if (!store.set('hp_kids', rest)) return { ok: false, why: 'list' }; KIDS.splice(KIDS.findIndex(k => k.id === id), 1); }
  store.del(KID_DEL); return { ok: true };   // وإن بقي السجلّ بعد اكتمال الحذف فاستئنافه عند الفتح يجد كل شيء محذوفاً فيمحوه
}
/* عند الفتح لا يُستأنف الحذف وحده: تبويبٌ يُفتح أثناء حذفٍ في تبويبٍ آخر كان يكمله، فتعود عمليةٌ أُلغيت بفقد القفل (الفحص المستقل WM101-R1-02).
   فالحذف الذي لم يكتمل يُكمَل بضغطة الكبير في اللوحة وحدها؛ والطفل المختار لا يُحذف: يُلغى سجلّه ويُقال ذلك */
let KID_DEL_STATE = null;   // null، أو { id, why } لم يكتمل، أو { id, cancelled: true }
function kidDelCheck() { const id = kidDelPending(); if (id && id === KID && store.del(KID_DEL)) KID_DEL_STATE = { id, cancelled: true }; }
function designSVG(d, w = 150) { const s = el('svg', { viewBox: '0 0 360 250', width: w, 'aria-hidden': 'true' }); el('rect', { width: 360, height: 250, fill: css('--sky-bot') }, s);
  d.pieces.forEach(p => wsDraw(s, p, p.x, p.y, 1)); return s.outerHTML; }
async function openGallery() {
  hush(); /*T*/window.__scene = 'gallery';/*/T*/
  const open = HUNT.filter(([k, l]) => (PROG[l] || {}).done);
  const photos = (await IDB.all()).filter(p => typeof p.data === 'string' && PHOTO_RX.test(p.data)).sort((a, b) => b.t - a.t); const designs = designsGet();
  const c = cover('galCover', `<div class="gallery"><div class="ghead"><button class="round ico" id="galClose" aria-label="${esc(labelText('back'))}">${ICON.map}</button><b>${esc(G(labelText('myGallery')))}</b></div>${coverHead()}
    <div class="huntgrid" id="huntGrid"></div><input type="file" id="huntIn" accept="image/*" capture="environment" hidden>
    <div class="gitems">${photos.map(p => `<figure><img src="${p.data}" alt=""><figcaption>${esc(BIN_NAMES[p.k] || '')}</figcaption></figure>`).join('')}
      ${designs.map(d => `<figure class="design">${designSVG(d)}<figcaption>${esc(G(labelText('myDesign')))}</figcaption></figure>`).join('')}</div></div>`);
  let want = null;
  open.forEach(([k]) => { const b = document.createElement('button'); b.className = 'bin'; b.dataset.hunt = k; b.innerHTML = basketSVG(k) + `<span>${esc(BIN_NAMES[k])}</span>`; b.setAttribute('aria-label', plain(BIN_NAMES[k]));
    b.onclick = () => { SFX.tick(); want = k; hush(); coverSay(c, 'gen.hunt.' + k); $('#huntIn').value = ''; $('#huntIn').click(); }; $('#huntGrid').appendChild(b); });
  $('#huntIn').onchange = e => { const f = e.target.files && e.target.files[0]; if (!f || !want) return; hush(); const rd = new FileReader();   /* عاد بصورة: لا تُعاد التعليمة التي قطعتها الكاميرا (الفحص المستقل J2 (7)) */
    rd.onload = () => { const img = new Image(); img.onload = async () => { const Z = 360, k = Math.min(1, Z / Math.max(img.width, img.height)); const cv = document.createElement('canvas');
      cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k); cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      const sv = await IDB.put({ id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), kid: KID, k: want, t: Date.now(), data: cv.toDataURL('image/jpeg', .72) });   // rng-ok: معرّف الصورة
      if (sv === 'tab') return;   /* فقد التبويب القفل أثناء الحفظ: لم تُحفظ، فلا احتفال ولا «حُفظت» (الفحص المستقل WM101-R1-02) */
      logAttempt({ scene: 'hunt', tag: want, ok: true }); SFX.win(); confetti(); await coverSay(c, 'gen.hunt.saved'); openGallery(); }; img.src = rd.result; }; rd.readAsDataURL(f); };
  $('#galClose').onclick = () => { hush(); c.hidden = true; showHome(); };
  coverSay(c, open.length ? 'gen.gallery.intro' : 'gen.gallery.empty');
}
