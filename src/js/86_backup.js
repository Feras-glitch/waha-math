/* =====================================================================
   النسخة الاحتياطية للتقدّم (D246): يحفظ الكبير ملفاً فيه أطفال الجهاز وتقدّمهم وسجلّهم وإعداداتهم وتصميماتهم،
   ويستعيده على هذا الجهاز أو غيره. الصور (المعرض والكاميرا) وحزمة الصوت تبقى في الجهاز ولا تدخل الملف.
   الاستعادة بعد فحص كل مفتاح ونوعه، وتأكيد بخطوتين، ونسخة مما كان على الجهاز قبلها (hp_before_restore)
   ===================================================================== */
/* نوع كل مفتاح بقاعدته المتداخلة نفسها التي يُقرأ بها التخزين (01_store.js، الفحص الخصم A05) */
const BACKUP_RULE = { kids: V_KIDS, kid: Pr(v => typeof v === 'string' && KID_ID.test(v)), digits: Pr(v => v === 'east' || v === 'west'), muted: bool,
  prog: V_PROG, log: V_LOG, session: V_SESSION, settings: V_SETTINGS, designs: V_DESIGNS };
const backupKind = k => k.replace(/^hp_/, '').split(':')[0];
function backupData() { const data = {};
  try { for (const k of backupKeysNow()) data[k] = localStorage.getItem(k); } catch (e) {}
  return { app: 'waha-math', kind: 'backup', v: 1, schema: SCHEMA, t: Date.now(), data }; }
function backupSave() { const d = backupData(), day = new Date(d.t).toISOString().slice(0, 10);
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(d)], { type: 'application/json' }));
  a.download = 'واحة_الرياضيات_نسخة_' + day + '.json'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  /*T*/window.__backup = d;/*/T*/ return d; }
/* يعيد {ok, kids:[{name, done}], keys} أو {ok:false, why} — لا يكتب شيئاً. وكل مفتاح بقاعدته كاملة، والأطفال بمعرّفات صالحة لا تتكرّر،
   والطفل النشط منهم، وتقدّم كل طفل ببنية الدروس الحالية (ما كان أقدم يُرفض بسببه لا يُرحَّل صامتاً) */
function backupCheck(text) {
  let d; try { d = JSON.parse(text); } catch (e) { return { ok: false, why: 'notJson' }; }
  if (!isObj(d) || d.app !== 'waha-math' || d.kind !== 'backup' || d.v !== 1 || !isObj(d.data)) return { ok: false, why: 'notOurs' };
  if ('schema' in d && d.schema !== SCHEMA) return { ok: false, why: 'oldVersion' };
  const keys = Object.keys(d.data); if (!keys.length) return { ok: false, why: 'empty' };
  const val = {};
  for (const k of keys) { if (!BACKUP_KEY.test(k) || typeof d.data[k] !== 'string') return { ok: false, why: 'badKey' };
    let v; try { v = JSON.parse(d.data[k]); } catch (e) { return { ok: false, why: 'badValue' }; }
    if (backupKind(k) === 'prog' && isObj(v) && v.schema !== SCHEMA) return { ok: false, why: 'oldVersion' };
    const bad = []; const r = BACKUP_RULE[backupKind(k)](v, bad, k); if (r === NO || bad.length) return { ok: false, why: 'badValue', at: bad[0] || k };
    val[k] = r; }
  if (!('hp_kids' in d.data) || !val.hp_kids.length) return { ok: false, why: 'noKids' };
  if ('hp_kid' in val && !val.hp_kids.some(k => k.id === val.hp_kid)) return { ok: false, why: 'badValue', at: 'hp_kid' };
  const kids = val.hp_kids.map(k => { const p = val['hp_prog:' + k.id] || {};
    return { name: k.name, done: Object.keys(p).filter(id => isObj(p[id]) && p[id].done).length }; });
  const data = { ...d.data, hp_kids: JSON.stringify(val.hp_kids) };   // الأطفال بصيغتهم المنظّفة
  return { ok: true, kids, keys, d: { ...d, data } }; }
/* الاستعادة معاملة (الفحص الخصم A04): تُحفظ نسخة ما كان أولاً ويُتحقَّق منها، وإلا لا يتغيّر شيء؛ ثم سِجلّ «استعادة لم تكتمل»؛
   ثم تُكتب البيانات ويُتحقَّق من كل مفتاح؛ فإن أخفق شيء أُرجع ما كان من الذاكرة. والسِّجلّ يُمحى بعد التمام وحده، فإن انقطعت
   أُرجع ما كان عند الفتح (01_store.js). يعيد {ok} أو {ok:false, why: tab|rescue|space|partial} */
function backupApply(chk) {
  if (!store.mine(null)) return { ok: false, why: 'tab' };
  const old = {}; for (const k of backupKeysNow()) try { old[k] = localStorage.getItem(k); } catch (e) {}
  const rescue = JSON.stringify(backupData());
  try { localStorage.setItem('hp_before_restore', rescue); if (localStorage.getItem('hp_before_restore') !== rescue) throw new Error('rescue');
    localStorage.setItem(RESTORE_LOG, JSON.stringify({ t: Date.now() })); } catch (e) { return { ok: false, why: 'rescue' }; }
  const data = chk.d.data; let ok = true;
  try { for (const k of Object.keys(old)) if (!(k in data)) { localStorage.removeItem(k); if (localStorage.getItem(k) !== null) throw new Error(k); }
    for (const k of chk.keys) { localStorage.setItem(k, data[k]); if (localStorage.getItem(k) !== data[k]) throw new Error(k); }
    localStorage.removeItem(RESTORE_LOG); if (localStorage.getItem(RESTORE_LOG) !== null) throw new Error('log'); } catch (e) { ok = false; }
  if (ok) return { ok: true };
  try { for (const k of chk.keys) if (!(k in old)) localStorage.removeItem(k);
    for (const [k, v] of Object.entries(old)) { localStorage.setItem(k, v); if (localStorage.getItem(k) !== v) throw new Error(k); }
    for (const k of backupKeysNow()) if (!(k in old)) throw new Error(k);
    localStorage.removeItem(RESTORE_LOG); if (localStorage.getItem(RESTORE_LOG) !== null) throw new Error('log'); } catch (e) { return { ok: false, why: 'partial' }; }
  return { ok: false, why: 'space' }; }
