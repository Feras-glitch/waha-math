/* =====================================================================
   حزمة الصوت البشري (D181، D246): تسجيلات أسماؤها معرّفات جدول التسجيل (dist/script_m1.xlsx)، تُستورد مرة واحدة
   ملفَّ zip أو ملفاتٍ صوتية، وتُحفظ في الجهاز (IndexedDB)، فيُقال بها كل ما سُجّل، وصوت الجهاز احتياطٌ لما لم يُسجَّل.
   المعرّف: معرّف الجملة الكامل (m1.u1.d2.hook.01 أو gen.…)، و_m و_f للجملة ذات الصيغتين، ثم الامتداد
   ===================================================================== */
const VOICE_EXT = { mp3: 'audio/mpeg', m4a: 'audio/mp4', aac: 'audio/aac', ogg: 'audio/ogg', oga: 'audio/ogg', opus: 'audio/ogg', wav: 'audio/wav', webm: 'audio/webm' };
const VOICE_NAME = /^((?:m\d+\.u\d+\.d\d+|gen)\.[A-Za-z0-9_.]+?)\.([A-Za-z0-9]+)$/;
/* المعرّفات التي يطلبها التطبيق، من المحتوى نفسه (كما يكتبها build/clips.mjs في جدول التسجيل) */
function voiceIds() { const ids = new Set(), twin = t => { GEN_RX.lastIndex = 0; return GEN_RX.test(String(t)); };
  const add = (full, t) => { if (twin(t)) { ids.add(full + '_m'); ids.add(full + '_f'); } else ids.add(full); };
  const txt = v => Array.isArray(v) ? v[1] : v;
  for (const [id, v] of Object.entries(CONTENT.gen.lines || {})) add(id, txt(v));
  for (const e of Object.values(CONTENT.errors || {})) for (const [id, t] of Object.entries(e.q || {})) add(id, t);
  for (const U of CONTENT.units) for (const L of U.lessons) for (const [id, v] of Object.entries(L.lines || {})) add(L.id + '.' + id, txt(v));
  return ids; }
const VPACK = { db: null, failed: false, n: 0,
  open() { if (this.db || this.failed) return Promise.resolve(this.db);
    return new Promise(res => { try { const r = indexedDB.open('hp_voice', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('clips', { keyPath: 'id' });
      r.onsuccess = () => { this.db = r.result; res(this.db); }; r.onerror = () => { this.failed = true; res(null); }; } catch (e) { this.failed = true; res(null); } }); },
  /* عند البداية: كل تسجيل محفوظ يصير رابطاً في CLIPS (الملف نفسه يبقى في التخزين حتى يُشغَّل) */
  async load() { const db = await this.open(); if (!db) return 0;
    const all = await new Promise(res => { try { const r = db.transaction('clips').objectStore('clips').getAll(); r.onsuccess = () => res(r.result || []); r.onerror = () => res([]); } catch (e) { res([]); } });
    const want = voiceIds(); this.n = 0;
    for (const c of all) if (c && want.has(c.id) && c.blob) { if (CLIPS[c.id]) URL.revokeObjectURL(CLIPS[c.id]); CLIPS[c.id] = URL.createObjectURL(c.blob); this.n++; }
    return this.n; },
  /* يستورد ملفات (zip أو صوت): ما يطابق اسمه معرّفاً يُحفظ، وما لا يطابق يُعدّ ولا يُحفظ */
  async importFiles(files, progress = () => {}) { const want = voiceIds(), got = [], unknown = [];
    const take = (name, blob) => { const base = String(name).split(/[\\/]/).pop(); const m = base.match(VOICE_NAME);
      if (!m || !VOICE_EXT[m[2].toLowerCase()] || !want.has(m[1])) { if (base && !base.startsWith('.')) unknown.push(base); return; }
      got.push({ id: m[1], blob: blob.type ? blob : new Blob([blob], { type: VOICE_EXT[m[2].toLowerCase()] }) }); };
    for (const f of files) {
      if (/\.zip$/i.test(f.name)) { for (const e of await unzipFiles(f)) take(e.name, e.blob); }
      else take(f.name, f); progress(got.length); }
    const db = await this.open(); if (!db) throw new Error('noStore');
    for (let i = 0; i < got.length; i += 100) {   /* دفعات: لا معاملة واحدة ضخمة على جهاز ضعيف */
      if (!store.mine(null)) throw new Error('tab');   /* قبل كل دفعة: تبويبٌ فقد القفل أثناء الاستيراد لا يكتب بعده (الفحص المستقل WM101-R1-02) */
      const r = await ownTx(db, 'clips', (os, last) => last(got.slice(i, i + 100).map(c => os.put(c)).pop() || null));   // والدفعة المنتظرة لا تكتب بعد فقد القفل (WM102-R2-02)
      if (r !== 'ok') throw new Error(r === 'tab' ? 'tab' : 'abort');
      progress(i + 100); }
    const n = await this.load(); return { imported: new Set(got.map(c => c.id)).size, unknown, total: want.size, have: n }; },
  /* يعيد false إن فقد التبويب القفل قبل الحذف أو أثناءه (فتبقى الحزمة كما هي، في القاعدة والذاكرة)؛ والتسجيلات في الذاكرة تُمحى بعد التزام الحذف لا قبله */
  async clear() { if (!store.mine(null)) return false; const db = await this.open(); if (!store.mine(null)) return false;
    const drop = () => { for (const k of Object.keys(CLIPS)) { URL.revokeObjectURL(CLIPS[k]); delete CLIPS[k]; } this.n = 0; return true; };
    if (!db) return drop();
    const r = await ownTx(db, 'clips', (os, last) => last(os.clear())); return r === 'tab' ? false : drop(); },
};
/* قارئ zip صغير بلا مكتبة: الدليل المركزي، والملفات المخزّنة (0) والمضغوطة (8) بـ DecompressionStream('deflate-raw') */
async function unzipFiles(file) {
  const b = new Uint8Array(await file.arrayBuffer()), dv = new DataView(b.buffer, b.byteOffset, b.byteLength), out = [];
  let eo = -1; for (let i = b.length - 22; i >= Math.max(0, b.length - 65557); i--) if (dv.getUint32(i, true) === 0x06054b50) { eo = i; break; }
  if (eo < 0) throw new Error('notZip');
  const count = dv.getUint16(eo + 10, true); let p = dv.getUint32(eo + 16, true); const dec = new TextDecoder();
  for (let k = 0; k < count; k++) {
    if (p + 46 > b.length || dv.getUint32(p, true) !== 0x02014b50) throw new Error('badZip');
    const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true), nlen = dv.getUint16(p + 28, true), xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true);
    const name = dec.decode(b.subarray(p + 46, p + 46 + nlen)); p += 46 + nlen + xlen + clen;
    if (name.endsWith('/') || dv.getUint32(lo, true) !== 0x04034b50) continue;
    const start = lo + 30 + dv.getUint16(lo + 26, true) + dv.getUint16(lo + 28, true), data = b.subarray(start, start + csize);
    let blob;
    if (method === 0) blob = new Blob([data]);
    else if (method === 8) { if (typeof DecompressionStream === 'undefined') throw new Error('noInflate'); blob = await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).blob(); }
    else continue;
    out.push({ name, blob }); }
  return out; }
