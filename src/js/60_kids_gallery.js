/* =====================================================================
   الميثاق 1.52: أطفال الجهاز، والمعرض وصيد الكاميرا، والورشة وألغاز الظلال، وإشارات المشرف، والتقرير الأسبوعي
   ===================================================================== */
/* نص ظاهر يطابق المسموع (المبدأ 13) في الأغطية التي تحجب فقاعة المرشد */
function coverSay(box, line) { const p = box.querySelector('.coversay'); if (p) p.textContent = G(line[2]); return say(...line); }

/* ---------- أطفال الجهاز (D200) ---------- */
const KIDS_WHO = ['compass', 'gen.kids.who', 'مَنْ يَتَعَلَّمُ الآنَ؟'];
function openKids(first) {
  const c = $('#kidsCover'); window.__scene = 'kids';
  c.innerHTML = `<div class="breakbox"><div class="who">${compassSVG()}</div><p class="coversay"></p><div class="kids" id="kidList"></div>
    <button class="more" id="kidNew">للكبار: إضافة طفل</button>${first ? '' : `<button class="more" id="kidEdit">${G('تَعْدِيلُ مَلَفِّي')}</button>`}</div>`;
  const list = $('#kidList');
  KIDS.forEach(k => { const b = document.createElement('button'); b.className = 'kid'; b.dataset.kid = k.id; b.setAttribute('aria-pressed', k.id === KID);
    const av = document.createElement('span'); av.className = 'round'; av.appendChild(avatarNode(k)); b.appendChild(av);
    const n = document.createElement('span'); n.textContent = k.name; b.appendChild(n);
    b.onclick = () => { SFX.tick(); hush(); if (k.id === KID) { c.hidden = true; showHome(); return; } store.set('hp_kid', k.id); location.reload(); };
    list.appendChild(b); });
  $('#kidNew').onclick = () => { hush(); adultGate(() => { $('#panel').hidden = true; c.hidden = true; openProfile(true); }, () => {}); };
  if (!first) $('#kidEdit').onclick = () => { hush(); c.hidden = true; openProfile(false); };
  c.hidden = false; coverSay(c, KIDS_WHO);
}

/* ---------- المعرض وصيد الأشكال بالكاميرا (D198-1، D201): الصور على الجهاز فقط ---------- */
const IDB = { db: null, mem: [],
  open() { if (this.db || this.failed) return Promise.resolve(this.db);
    return new Promise(res => { try { const r = indexedDB.open('hp_gallery', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('photos', { keyPath: 'id' });
      r.onsuccess = () => { this.db = r.result; res(this.db); }; r.onerror = () => { this.failed = true; res(null); }; } catch (e) { this.failed = true; res(null); } }); },
  async put(o) { const db = await this.open(); if (!db) { this.mem.push(o); return; }
    return new Promise(res => { try { const tx = db.transaction('photos', 'readwrite'); tx.objectStore('photos').put(o); tx.oncomplete = () => res(); tx.onerror = () => { this.mem.push(o); res(); }; } catch (e) { this.mem.push(o); res(); } }); },
  async all() { const db = await this.open(); const mine = x => x.kid === KID;
    if (!db) return this.mem.filter(mine);
    return new Promise(res => { try { const r = db.transaction('photos').objectStore('photos').getAll(); r.onsuccess = () => res(r.result.filter(mine).concat(this.mem.filter(mine))); r.onerror = () => res(this.mem.filter(mine)); } catch (e) { res(this.mem.filter(mine)); } }); },
  async clear() { const db = await this.open(); this.mem = this.mem.filter(x => x.kid !== KID); if (!db) return;
    const list = await this.all(); return new Promise(res => { try { const tx = db.transaction('photos', 'readwrite'); list.forEach(x => tx.objectStore('photos').delete(x.id)); tx.oncomplete = () => res(); tx.onerror = () => res(); } catch (e) { res(); } }); },
};
/* ما يُصاد: كل شكل بعد الدرس الذي يعلّمه */
const HUNT = [['circle', 'm1.u1.d1'], ['square', 'm1.u1.d1'], ['triangle', 'm1.u1.d2'], ['rect', 'm1.u1.d3'], ['cube', 'm1.u2.d1'], ['sphere', 'm1.u2.d1'], ['cylinder', 'm1.u2.d2'], ['cone', 'm1.u2.d2']];
const HUNT_LINE = {
  circle: ['gen.hunt.circle', 'شَيْءٌ دَائِرِيٌّ: {اِبْحَثْ|اِبْحَثِي} عَنْهُ {وَصَوِّرْهُ|وَصَوِّرِيهِ}.'], square: ['gen.hunt.square', 'شَيْءٌ مُرَبَّعٌ: {اِبْحَثْ|اِبْحَثِي} عَنْهُ {وَصَوِّرْهُ|وَصَوِّرِيهِ}.'],
  triangle: ['gen.hunt.triangle', 'شَيْءٌ مُثَلَّثٌ: {اِبْحَثْ|اِبْحَثِي} عَنْهُ {وَصَوِّرْهُ|وَصَوِّرِيهِ}.'], rect: ['gen.hunt.rect', 'شَيْءٌ مُسْتَطِيلٌ: {اِبْحَثْ|اِبْحَثِي} عَنْهُ {وَصَوِّرْهُ|وَصَوِّرِيهِ}.'],
  cube: ['gen.hunt.cube', 'شَيْءٌ يُشْبِهُ المُكَعَّبَ: {اِبْحَثْ|اِبْحَثِي} عَنْهُ {وَصَوِّرْهُ|وَصَوِّرِيهِ}.'], sphere: ['gen.hunt.sphere', 'شَيْءٌ يُشْبِهُ الكُرَةَ: {اِبْحَثْ|اِبْحَثِي} عَنْهُ {وَصَوِّرْهُ|وَصَوِّرِيهِ}.'],
  cylinder: ['gen.hunt.cylinder', 'شَيْءٌ يُشْبِهُ الأُسْطُوَانَةَ: {اِبْحَثْ|اِبْحَثِي} عَنْهُ {وَصَوِّرْهُ|وَصَوِّرِيهِ}.'], cone: ['gen.hunt.cone', 'شَيْءٌ يُشْبِهُ المَخْرُوطَ: {اِبْحَثْ|اِبْحَثِي} عَنْهُ {وَصَوِّرْهُ|وَصَوِّرِيهِ}.'] };
const GAL_INTRO = ['compass', 'gen.gallery.intro', 'هَذَا {مَعْرِضُكَ|مَعْرِضُكِ}: صُوَرُ {صَيْدِكَ|صَيْدِكِ} وَتَصَامِيمُ {وَرْشَتِكَ|وَرْشَتِكِ}. {اِلْمَسْ|اِلْمَسِي} شَكْلًا لِتَصِيدَهُ بِالكَامِيرَا.'];
const GAL_EMPTY = ['compass', 'gen.gallery.empty', 'بَعْدَ أَوَّلِ دَرْسٍ {تَسْتَطِيعُ|تَسْتَطِيعِينَ} أَنْ {تَصِيدَ|تَصِيدِي} الأَشْكَالَ بِالكَامِيرَا.'];
const HUNT_SAVED = ['compass', 'gen.hunt.saved', '{صِدْتَهُ|صِدْتِهِ}! الصُّورَةُ فِي {مَعْرِضِكَ|مَعْرِضِكِ}.'];
const designsKey = () => kk('hp_designs');
function designSVG(d, w = 150) { const s = el('svg', { viewBox: '0 0 360 250', width: w, 'aria-hidden': 'true' }); el('rect', { width: 360, height: 250, fill: css('--sky-bot') }, s);
  d.pieces.forEach(p => wsDraw(s, p, p.x, p.y, 1)); return s.outerHTML; }
async function openGallery() {
  const c = $('#galCover'); window.__scene = 'gallery'; hush();
  const open = HUNT.filter(([k, l]) => (PROG[l] || {}).done);
  const photos = (await IDB.all()).sort((a, b) => b.t - a.t); const designs = store.get(designsKey(), []);
  c.innerHTML = `<div class="gallery"><div class="ghead"><button class="round ico" id="galClose" aria-label="رجوع">${ICON.map}</button><b>${G('مَعْرِضِي')}</b></div>
    <div class="talk"><div class="who">${compassSVG()}</div><div class="bubble"><span class="coversay"></span></div></div>
    <div class="huntgrid" id="huntGrid"></div><input type="file" id="huntIn" accept="image/*" capture="environment" hidden>
    <div class="gitems">${photos.map(p => `<figure><img src="${p.data}" alt=""><figcaption>${BIN_NAMES[p.k]}</figcaption></figure>`).join('')}
      ${designs.map(d => `<figure class="design">${designSVG(d)}<figcaption>${G('تَصْمِيمِي')}</figcaption></figure>`).join('')}</div></div>`;
  const grid = $('#huntGrid'); let want = null;
  open.forEach(([k]) => { const b = document.createElement('button'); b.className = 'bin'; b.dataset.hunt = k; b.innerHTML = basketSVG(k) + `<span>${BIN_NAMES[k]}</span>`;
    b.onclick = () => { SFX.tick(); want = k; hush(); coverSay(c, ['compass', ...HUNT_LINE[k]]); $('#huntIn').value = ''; $('#huntIn').click(); }; grid.appendChild(b); });
  $('#huntIn').onchange = e => { const f = e.target.files && e.target.files[0]; if (!f || !want) return; const rd = new FileReader();
    rd.onload = () => { const img = new Image(); img.onload = async () => { const S = 360, k = Math.min(1, S / Math.max(img.width, img.height)); const cv = document.createElement('canvas');
      cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k); cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      await IDB.put({ id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), kid: KID, k: want, t: Date.now(), data: cv.toDataURL('image/jpeg', .72) });
      logAttempt({ scene: 'hunt', tag: want, ok: true }); SFX.win(); confetti(); await coverSay(c, HUNT_SAVED); openGallery(); }; img.src = rd.result; }; rd.readAsDataURL(f); };
  $('#galClose').onclick = () => { hush(); c.hidden = true; showHome(); };
  c.hidden = false; coverSay(c, open.length ? GAL_INTRO : GAL_EMPTY);
}

