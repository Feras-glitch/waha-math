/* =====================================================================
   النسخة الاحتياطية للتقدّم (D246): يحفظ الكبير ملفاً فيه أطفال الجهاز وتقدّمهم وسجلّهم وإعداداتهم وتصميماتهم،
   ويستعيده على هذا الجهاز أو غيره. الصور (المعرض والكاميرا) وحزمة الصوت تبقى في الجهاز ولا تدخل الملف.
   الاستعادة بعد فحص كل مفتاح ونوعه، وتأكيد بخطوتين، ونسخة مما كان على الجهاز قبلها (hp_before_restore)
   ===================================================================== */
const BACKUP_KEY = /^hp_(?:kids|kid|digits|muted|(?:prog|log|session|settings|designs):[A-Za-z0-9_-]{1,24})$/;
const BACKUP_OK = {   /* نوع كل مفتاح كما يقرؤه التخزين (01_store.js) */
  kids: v => Array.isArray(v) && v.every(kidOk), kid: v => typeof v === 'string', digits: v => v === 'east' || v === 'west', muted: v => typeof v === 'boolean',
  prog: isObj, log: v => isObj(v) && Array.isArray(v.attempts), session: v => isObj(v) && typeof v.n === 'number', settings: isObj, designs: v => Array.isArray(v) };
const backupKind = k => k.replace(/^hp_/, '').split(':')[0];
function backupData() { const data = {};
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (BACKUP_KEY.test(k)) data[k] = localStorage.getItem(k); } } catch (e) {}
  return { app: 'waha-math', kind: 'backup', v: 1, schema: SCHEMA, t: Date.now(), data }; }
function backupSave() { const d = backupData(), day = new Date(d.t).toISOString().slice(0, 10);
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(d)], { type: 'application/json' }));
  a.download = 'واحة_الرياضيات_نسخة_' + day + '.json'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  /*T*/window.__backup = d;/*/T*/ return d; }
/* يعيد {ok, kids:[{name, done}], keys} أو {ok:false, why} — لا يكتب شيئاً */
function backupCheck(text) {
  let d; try { d = JSON.parse(text); } catch (e) { return { ok: false, why: 'notJson' }; }
  if (!isObj(d) || d.app !== 'waha-math' || d.kind !== 'backup' || d.v !== 1 || !isObj(d.data)) return { ok: false, why: 'notOurs' };
  const keys = Object.keys(d.data); if (!keys.length) return { ok: false, why: 'empty' };
  for (const k of keys) { if (!BACKUP_KEY.test(k) || typeof d.data[k] !== 'string') return { ok: false, why: 'badKey' };
    let v; try { v = JSON.parse(d.data[k]); } catch (e) { return { ok: false, why: 'badValue' }; }
    if (!BACKUP_OK[backupKind(k)](v)) return { ok: false, why: 'badValue' }; }
  if (!('hp_kids' in d.data)) return { ok: false, why: 'noKids' };
  const kids = JSON.parse(d.data.hp_kids).map(k => { const p = d.data['hp_prog:' + k.id] ? JSON.parse(d.data['hp_prog:' + k.id]) : {};
    return { name: typeof k.name === 'string' ? k.name.slice(0, 24) : '', done: Object.keys(p).filter(id => isObj(p[id]) && p[id].done).length }; });
  return { ok: true, kids, keys, d }; }
function backupApply(chk) {
  try { localStorage.setItem('hp_before_restore', JSON.stringify(backupData())); } catch (e) {}
  const old = []; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (BACKUP_KEY.test(k)) old.push(k); } } catch (e) {}
  old.forEach(k => store.del(k)); let ok = true;
  for (const k of chk.keys) try { localStorage.setItem(k, chk.d.data[k]); } catch (e) { ok = false; }
  return ok; }
