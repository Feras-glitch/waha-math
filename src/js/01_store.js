/* =====================================================================
   التخزين (D246): قراءة بتحقق النوع، ونسخة من التالف، وإشارة فشل الكتابة، وقفل التبويب
   ===================================================================== */
const SCHEMA = 3;                                        // 3: دروس الوحدتين بعد D248، والإعدادات والأرقام لكل طفل
const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
const STORE_ISSUES = { corrupt: [], repaired: [], writeFail: false, migrated: null, restore: null };
/* ---------- قفل التبويب (الفحص الخصم A06): تبويبان مفتوحان لا يكتب أحدهما فوق الآخر ----------
   التبويب الأحدث يأخذ القفل عند فتحه، والأقدم يفقده فلا يكتب بعدها شيئاً من أيّ شاشة حتى يضغط «هنا» فيعيد القراءة.
   والحارس في طبقة الكتابة نفسها: كل كتابة تسأل عن صاحب القفل، وتقارن المفتاح بآخر ما قرأه هذا التبويب أو كتبه
   فلا يكتب فوق ما كتبه غيره ولو فاته إشعار التبويب الآخر (تبويب عُلّق ثم عاد بعد انتهاء القفل) */
const TAB = Math.random().toString(36).slice(2, 10);   // rng-ok: معرّف التبويب لا يدخل في عشوائية الدروس
let TAB_LOST = false, onTabLost = () => {};
const TAB_TXS = new Set();                               // معاملات الكتابة الجارية أو المنتظرة في IndexedDB (ownTx)
function tabLose() { if (TAB_LOST) return; TAB_LOST = true; TAB_TXS.forEach(tx => { try { tx.abort(); } catch (e) {} }); try { onTabLost(); } catch (e) {} }
/* معاملة كتابة في IndexedDB بملكية التبويب (الفحص المستقل WM102-R2-02: معاملةٌ أُنشئت والتبويب مالك قد تنتظر خلف معاملةٍ أخرى قبل أن تبدأ،
   فسؤال القفل قبل إنشائها لا يغطي انتظارها، فكانت صورةٌ تُكتب بعد أن أخذ تبويبٌ آخر القفل). ثلاثة حرّاس:
   1) تُسجَّل في TAB_TXS فيلغيها tabLose وهي منتظرة أو جارية؛ 2) أول طلبٍ فيها لا يكتب، ويجري حين تبدأ المعاملة فعلاً، فيُسأل القفل هناك قبل أي كتابة؛
   3) ويُسأل بعد آخر طلبٍ للكتابة، فإن فُقد أُلغيت قبل أن تلتزم. نقطة الالتزام: لا طلب بعد هذا السؤال، فما كُتب كُتب والتبويب مالك.
   write(os, last): تُصدر طلبات الكتابة وتسلّم آخرها إلى last (أو null إن لم يكن ما يُكتب). تعيد 'ok' التزمت، و'tab' أُلغيت لفقد القفل فلم يُكتب شيء، و'fail' لسببٍ آخر */
function ownTx(db, name, write) { return new Promise(res => { let tx, end = false, lost = false;
  const fin = v => { if (end) return; end = true; TAB_TXS.delete(tx); res(v); };
  const chk = () => { if (store.mine(null)) return true; lost = true; try { tx.abort(); } catch (e) {} return false; };
  try { tx = db.transaction(name, 'readwrite'); } catch (e) { res('fail'); return; }
  TAB_TXS.add(tx); tx.oncomplete = () => fin('ok'); tx.onerror = tx.onabort = () => fin(lost || TAB_LOST ? 'tab' : 'fail');
  try { const os = tx.objectStore(name), go = os.count();
    go.onsuccess = () => { if (!chk()) return;
      try { write(os, r => { if (r) r.onsuccess = () => chk(); else chk(); }); } catch (e) { try { tx.abort(); } catch (x) {} } }; }
  catch (e) { try { tx.abort(); } catch (x) {} fin('fail'); } }); }
const store = {
  seen: {},                                               // آخر نصّ قرأه هذا التبويب أو كتبه لكل مفتاح
  raw(k) { try { const v = localStorage.getItem(k); this.seen[k] = v; return v; } catch (e) { return null; } },
  /* يعيد القيمة إن اجتازت الفحص، وإلا ينسخ القيمة التالفة إلى hp_corrupt:المفتاح:الزمن ويعيد الافتراضية */
  read(k, def, ok) { const raw = this.raw(k); if (raw == null) return def;
    let v; try { v = JSON.parse(raw); } catch (e) { this.corrupt(k, raw); return def; }
    if (ok && !ok(v)) { this.corrupt(k, raw); return def; } return v; },
  /* بقاعدة متداخلة (V_*): ما خالفها في داخله يُسقط وحده، وتُحفظ نسخة التالف، ويُكتب السليم مكانه (الفحص الخصم A05) */
  fix(k, def, rule) { const raw = this.raw(k); if (raw == null) return def;
    let v; try { v = JSON.parse(raw); } catch (e) { this.corrupt(k, raw); return def; }
    const bad = [], r = rule(v, bad, k); if (r === NO) { this.corrupt(k, raw); return def; }
    if (bad.length) { this.corrupt(k, raw); STORE_ISSUES.repaired.push(k); this.set(k, r); } return r; },
  get(k, def) { return this.read(k, def); },
  /* هل يكتب هذا التبويب؟ صاحب القفل غيره، أو تغيّر المفتاح منذ آخر قراءة له: يفقد القفل ولا يكتب */
  mine(k) { if (TAB_LOST) return false;
    const o = tabOwner(); if (o && o !== TAB) { tabLose(); return false; } if (!o) tabClaim();
    if (k != null && Object.prototype.hasOwnProperty.call(this.seen, k)) { let cur; try { cur = localStorage.getItem(k); } catch (e) { cur = this.seen[k]; } if (cur !== this.seen[k]) { tabLose(); return false; } }
    return true; },
  set(k, v) { if (k !== 'hp_lock' && !this.mine(k)) return false; const t = JSON.stringify(v);
    try { localStorage.setItem(k, t); this.seen[k] = t; return true; } catch (e) { if (!STORE_ISSUES.writeFail) { STORE_ISSUES.writeFail = true; try { onStoreIssue(); } catch (x) {} } return false; } },
  /* يعيد true إن زال المفتاح فعلاً (الفحص المستقل WM101-R1-01: كان يبتلع الإخفاق ويعيد true فيُعلَن حذف ما بقي) */
  del(k) { if (!this.mine(k)) return false; try { localStorage.removeItem(k); if (localStorage.getItem(k) !== null) throw 0; this.seen[k] = null; return true; }
    catch (e) { return false; } },                        // ومستدعيه يقول ما لم يُحذف (لا تنبيه «حفظ التقدّم» العام)
  corrupt(k, raw) { STORE_ISSUES.corrupt.push(k); try { localStorage.setItem('hp_corrupt:' + k + ':' + Date.now(), String(raw).slice(0, 20000)); } catch (e) {} },
};
let onStoreIssue = () => {};                              // تعيّنه لوحة الكبار (شريط تنبيه)
function tabClaim() { store.set('hp_lock', { tab: TAB, t: Date.now() }); TAB_LOST = false; }
function tabOwner() { const l = store.read('hp_lock', null, isObj); return l && typeof l.t === 'number' && Date.now() - l.t < 15000 ? l.tab : null; }
tabClaim();                                               // قبل أيّ قراءة أو كتابة: التبويب الذي يُفتح الآن صاحب القفل
setInterval(() => { const o = tabOwner(); if (!o || o === TAB) { if (!TAB_LOST) tabClaim(); } }, 5000);
window.addEventListener('storage', e => { if (e.key === 'hp_lock') { const o = tabOwner(); if (o && o !== TAB) tabLose(); } });

/* ---------- التحقق المتداخل (الفحص الخصم A03، A05): قاعدة واحدة لكل نوع مفتاح ----------
   تعيد القاعدة نسخة سليمة، وتضيف إلى bad موضع كل ما خالفها (حقلٌ مجهول، أو نوعٌ، أو مدى). يقرأ بها التخزين عند الفتح فيُصلح ما فسد
   (store.fix)، وتفحص بها النسخة الاحتياطية فتُرفض إن خالفت في شيء قبل أيّ كتابة (86_backup.js) */
const NO = { bad: true };
const isNum = v => typeof v === 'number' && Number.isFinite(v);
const isT = v => isNum(v) && Math.abs(v) <= 8.64e15;     // زمنٌ يقبله Date
const isInt = (v, lo = 0, hi = 1e9) => Number.isInteger(v) && v >= lo && v <= hi;
const isBool = v => typeof v === 'boolean';
const KID_ID = /^[A-Za-z0-9_-]{1,24}$/, LESSON_ID = /^m\d{1,2}\.u\d{1,2}\.d\d{1,2}$/, UNIT_ID = /^m\d{1,2}\.u\d{1,2}$/, CONCEPT_ID = /^[A-Z]\d{3}$/;
const PHOTO_RX = /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/, AVATAR_RX = /^[mf][1-9]$/;
const Pr = pred => (v, bad, at) => pred(v) ? v : (bad.push(at), NO);
const vRec = (spec, req = []) => (o, bad, at) => { if (!isObj(o) || req.some(k => !(k in o))) { bad.push(at); return NO; } const out = {};
  for (const [k, v] of Object.entries(o)) { const f = Object.prototype.hasOwnProperty.call(spec, k) ? spec[k] : null; if (!f) { bad.push(at + '.' + k); continue; }
    const r = f(v, bad, at + '.' + k); if (r !== NO) out[k] = r; }
  if (req.some(k => !(k in out))) { bad.push(at); return NO; } return out; };   /* والحقل اللازم الذي سقط يُسقط سجلّه كله */
const vMap = (rx, f) => (o, bad, at) => { if (!isObj(o)) { bad.push(at); return NO; } const out = {};
  for (const [k, v] of Object.entries(o)) { if (!rx.test(k)) { bad.push(at + '.' + k); continue; } const r = f(v, bad, at + '.' + k); if (r !== NO) out[k] = r; } return out; };
const vArr = (f, max) => (a, bad, at) => { if (!Array.isArray(a)) { bad.push(at); return NO; } if (a.length > max) bad.push(at + '.length');
  const out = []; a.slice(-max).forEach((v, i) => { const r = f(v, bad, at + '[' + i + ']'); if (r !== NO) out.push(r); }); return out; };
const int0 = Pr(v => isInt(v)), bool = Pr(isBool), time = Pr(isT);
const SRS_DAYS = [1, 3, 7, 21];                           // المراجعة المتباعدة (المبدأ 14): بعد الإتقان 1 ثم 3 ثم 7 ثم 21 يوماً
const V_STEP = { step: Pr(v => isInt(v, 0, SRS_DAYS.length)), due: Pr(v => v === null || isT(v)), last: time };
const V_SRS1 = vRec({ ...V_STEP, k: int0, k2: int0 }, ['step']);                       // جدول الدرس الواحد قبل الفحص الخصم A07 (يُرحَّل عند الفتح، 70_review.js)
const V_SRS2 = vRec({ cs: vMap(CONCEPT_ID, vRec(V_STEP, ['step', 'due'])), k: vMap(CONCEPT_ID, int0), k2: int0 }, ['cs']);   // جدول لكل مفهوم
const V_SRS = (v, bad, at) => (isObj(v) && 'cs' in v ? V_SRS2 : V_SRS1)(v, bad, at);
const V_CS = vRec({ ok: int0, of: int0, round: Pr(v => isInt(v, 0, 9)), at: time, mastered: bool, deferred: bool, entry: bool, appOk: bool, byAdult: bool });
const V_LESSON = vRec({ done: bool, mastered: bool, deferred: bool, entry: bool, at: time, path: Pr(v => v === 'mat' || v === 'screen'), resume: vRec({ stage: Pr(v => isInt(v, 0, 99)), t: time }, ['stage']),
  runs: int0, chose: Pr(v => v === 'normal' || v === 'challenge'), cs: vMap(CONCEPT_ID, V_CS), face: Pr(v => v === 'easy' || v === 'ok' || v === 'hard'),
  score: Pr(v => v === null || isInt(v)), of: Pr(v => v === null || isInt(v)) });
const V_PROG_TOP = { schema: Pr(v => v === SCHEMA), srs: vMap(LESSON_ID, V_SRS), ws: vMap(UNIT_ID, int0),
  streams: vMap(/^[a-z]{1,16}$/, vRec({ seen: bool, n: int0, ok: int0, day: time })), adult: vMap(LESSON_ID, vArr(Pr(v => v === true || v === false || v === null), 12)),
  redo: vMap(LESSON_ID, time), review: Pr(v => typeof v === 'string' && LESSON_ID.test(v)), unlockAll: bool };
function V_PROG(o, bad, at) { if (!isObj(o)) { bad.push(at); return NO; } const out = {};
  for (const [k, v] of Object.entries(o)) { const f = Object.prototype.hasOwnProperty.call(V_PROG_TOP, k) ? V_PROG_TOP[k] : LESSON_ID.test(k) ? V_LESSON : /^badge:/.test(k) && UNIT_ID.test(k.slice(6)) ? bool : null;
    if (!f) { bad.push(at + '.' + k); continue; } const r = f(v, bad, at + '.' + k); if (r !== NO) out[k] = r; } return out; }
const str = Pr(v => typeof v === 'string'), optStr = Pr(v => v == null || typeof v === 'string');
/* المحاولة حقولها كثيرة بحسب البند: يُفحص ما تقرؤه اللوحة والتقرير، والباقي قيمٌ بسيطة أو قوائمها */
const V_ATTEMPT = (o, bad, at) => { if (!isObj(o) || !isT(o.t) || ['scene', 'lesson', 'err', 'tag', 'type'].some(k => o[k] != null && typeof o[k] !== 'string') || ['ms', 'score', 'of'].some(k => o[k] != null && !isNum(o[k]))) { bad.push(at); return NO; } return o; };
const V_LOG = vRec({ attempts: vArr(V_ATTEMPT, 800), errors: vArr(vRec({ t: time, msg: str, scene: str }, ['t', 'msg']), 30), faces: vArr(vRec({ t: time, lesson: str, k: str }, ['lesson']), 120) }, ['attempts']);
const V_SESSION = vRec({ n: int0, t: time }, ['n']);
const V_SETTINGS = vRec({ sessionMax: Pr(v => isInt(v, 0, 9)), slow: bool, digits: Pr(v => v === 'east' || v === 'west'), muted: bool, seen: vMap(/^[\w.:-]{1,40}$/, Pr(v => v === 0 || v === 1 || isBool(v))) });
/* قطعة التصميم: نوعها من أنواع الورشة (يُعرف عند فتح المعرض؛ وقبل ذلك اسمٌ بحروف لاتينية) */
const pieceKind = v => typeof v === 'string' && (typeof SOLIDC !== 'undefined' && typeof IDC !== 'undefined' ? (v === 'plank' || Object.prototype.hasOwnProperty.call(SOLIDC, v) || Object.prototype.hasOwnProperty.call(IDC, v)) : /^[a-z]{2,16}$/i.test(v));
const coord = Pr(v => isNum(v) && Math.abs(v) <= 2000), dim = Pr(v => isNum(v) && v > 0 && v <= 400);
const V_PIECE = vRec({ k: Pr(pieceKind), x: coord, y: coord, size: dim, w: dim, h: dim, rot: Pr(v => isNum(v) && Math.abs(v) <= 3600), sc: dim, pose: Pr(v => typeof v === 'string' && /^[a-z]{1,16}$/i.test(v)) }, ['k', 'x', 'y']);
const V_DESIGNS = vArr(vRec({ t: time, unit: Pr(v => typeof v === 'string' && UNIT_ID.test(v)), pieces: (a, bad, at) => { const r = vArr(V_PIECE, 60)(a, bad, at); if (r !== NO && !r.length) { bad.push(at); return NO; } return r; } }, ['t', 'pieces']), 30);
/* الطفل (D200): المعرّف بصيغة مفاتيح التخزين (فلا يحمل علامة تخرج إلى الصفحة)، والصورة صورةٌ مضمّنة لا عنوان شبكة، والشكل من الأشكال */
const kidOk = k => isObj(k) && typeof k.id === 'string' && KID_ID.test(k.id) && (k.gender === 'm' || k.gender === 'f') && ['name', 'photo', 'avatar'].every(f => k[f] == null || typeof k[f] === 'string');
const kidStrict = k => kidOk(k) && (!k.photo || (PHOTO_RX.test(k.photo) && k.photo.length <= 300000)) && (!k.avatar || AVATAR_RX.test(k.avatar)) && (k.name == null || k.name.length <= 200);
const cleanName = n => typeof n === 'string' ? n.replace(/[<>"'&`]/g, '').replace(/\s+/g, ' ').trim().slice(0, 24) : '';   /* كما يحفظه ملف الطفل (60_kids.js) */
const cleanKid = k => ({ id: k.id, name: cleanName(k.name), gender: k.gender, photo: typeof k.photo === 'string' && PHOTO_RX.test(k.photo) && k.photo.length <= 300000 ? k.photo : '', avatar: typeof k.avatar === 'string' && AVATAR_RX.test(k.avatar) ? k.avatar : '' });
const V_KIDS = (a, bad, at) => { if (!Array.isArray(a)) { bad.push(at); return NO; } const ids = new Set(), out = [];
  a.forEach((k, i) => { if (!kidStrict(k) || ids.has(k.id)) { bad.push(at + '[' + i + ']'); return; } ids.add(k.id); out.push(cleanKid(k)); }); return out; };

/* ---------- استعادة لم تكتمل (الفحص الخصم A04): سِجلّها يبقى من حفظ نسخة ما كان حتى تكتمل، فإن انقطعت أُرجع ما كان كاملاً عند الفتح ---------- */
const BACKUP_KEY = /^hp_(?:kids|kid|digits|muted|(?:prog|log|session|settings|designs):[A-Za-z0-9_-]{1,24})$/;
const RESTORE_LOG = 'hp_restore_pending';
const backupKeysNow = () => { const ks = []; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (BACKUP_KEY.test(k)) ks.push(k); } } catch (e) {} return ks; };
(function restoreRecover() { let j; try { j = localStorage.getItem(RESTORE_LOG); } catch (e) { return; } if (j == null) return;
  let d = null; try { d = JSON.parse(localStorage.getItem('hp_before_restore')); } catch (e) {}
  if (!isObj(d) || !isObj(d.data)) { try { localStorage.removeItem(RESTORE_LOG); } catch (e) {} STORE_ISSUES.restore = 'lost'; return; }
  try { backupKeysNow().forEach(k => localStorage.removeItem(k));
    for (const [k, v] of Object.entries(d.data)) if (BACKUP_KEY.test(k) && typeof v === 'string') localStorage.setItem(k, v);
    localStorage.removeItem(RESTORE_LOG); STORE_ISSUES.restore = 'undone'; } catch (e) { STORE_ISSUES.restore = 'failed'; } })();

/* ---------- أطفال الجهاز (D200) ---------- */
const KIDS = (() => {
  const list = store.read('hp_kids', null, v => Array.isArray(v));
  if (list) { const ids = new Set(), out = []; for (const k of list) if (kidOk(k) && !ids.has(k.id)) { ids.add(k.id); out.push(cleanKid(k)); }
    if (out.length !== list.length) { store.corrupt('hp_kids', JSON.stringify(list)); STORE_ISSUES.repaired.push('hp_kids'); }   /* طفلٌ معرّفه أو جنسه تالف، أو مكرّر: يُسقط وتُحفظ نسخته */
    if (JSON.stringify(out) !== JSON.stringify(list)) store.set('hp_kids', out);
    return out; }
  const p = store.read('hp_profile', null, kidOkLegacy); if (!p) return [];          // الملف الواحد القديم يُنقل إلى k1
  const id = 'k1';
  for (const [a, b] of [['hp_prog', 'hp_prog:k1'], ['hp_u1_prog', 'hp_prog:k1'], ['hp_log', 'hp_log:k1'], ['hp_u1_log', 'hp_log:k1'], ['hp_session', 'hp_session:k1'], ['hp_settings', 'hp_settings:k1']])
    if (store.raw(a) != null && store.raw(b) == null) try { localStorage.setItem(b, store.raw(a)); } catch (e) {}
  const k = [cleanKid({ id, name: p.name, gender: p.gender, photo: p.photo || '' })]; store.set('hp_kids', k); store.set('hp_kid', id); return k;
})();
function kidOkLegacy(v) { return isObj(v) && (v.gender === 'm' || v.gender === 'f'); }
let KID = store.read('hp_kid', null, v => typeof v === 'string'); if (!KIDS.find(k => k.id === KID)) KID = KIDS[0] ? KIDS[0].id : null;
const kk = key => key + ':' + (KID || 'k0');
let PROFILE = KIDS.find(k => k.id === KID) || null;    // {id, name, gender:'m'|'f', photo, avatar}
const GEN_RX = /\{([^|{}]*)\|([^|{}]*)\}/g;             // كل جملة تحمل صيغتيها {مذكر|مؤنث}
function G(t) { return String(t).replace(/\{name\}/g, PROFILE ? PROFILE.name : '').replace(GEN_RX, (m, a, b) => (PROFILE && PROFILE.gender === 'f') ? b : a); }
function gSuffix(t) { GEN_RX.lastIndex = 0; return GEN_RX.test(t) ? (PROFILE && PROFILE.gender === 'f' ? '_f' : '_m') : ''; }

/* ---------- الإعدادات لكل طفل: حدّ الجلسة، والقراءة الأبطأ، والأرقام (D229)، والصوت ---------- */
const SET = Object.assign({ sessionMax: 2, slow: false, digits: store.read('hp_digits', 'east', v => v === 'east' || v === 'west'), muted: store.read('hp_muted', false, v => typeof v === 'boolean'), seen: {} },
  /*T*/store.read('hp_settings', {}, isObj),/*/T*/ store.fix(kk('hp_settings'), {}, V_SETTINGS));
if (SET.digits !== 'west') SET.digits = 'east'; if (!isObj(SET.seen)) SET.seen = {};
const saveSet = () => store.set(kk('hp_settings'), SET);
/* الأرقام: شرقية (١٢٣) أو غربية (123) باختيار الطالب، والكلام كلمات دائماً */
const DG = n => SET.digits === 'east' ? String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]) : String(n);
const fmt = {
  num: DG,
  date: t => { try { return new Intl.DateTimeFormat(SET.digits === 'west' ? 'ar-EG-u-nu-latn' : 'ar-EG-u-nu-arab', { day: 'numeric', month: 'long' }).format(new Date(t)); } catch (e) { return new Date(t).toLocaleDateString(); } },
  /* يقبل ٠-٩ و۰-۹ (لوحات أندرويد الفارسية) و0-9 */
  parse: s => parseInt(String(s).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/\D/g, ''), 10),
};

/* ---------- التقدّم ---------- */
/* PROG[درس] = {done, mastered, deferred, at, path:'mat'|'screen', resume, runs, cs:{مفهوم:{ok,of,mastered,deferred,round}}, face, score, of}
   و«badge:الوحدة»، وsrs، وws، وreview، وunlockAll، وstreams */
const PROG = (() => { const P = store.read(kk('hp_prog'), null, isObj) || {};
  /* تقدّم من بنية دروس أقدم (النسختان 1 و2 قبل D248) لا يُقرأ بمعرّفات الدروس الجديدة: d4 في الوحدة 2 صار درساً آخر.
     فتُحفظ نسخته كاملة في hp_prog_bak:الطفل:vالإصدار، ويبدأ التقدّم من جديد، ويُعلَم الكبير في لوحته */
  if (Object.keys(P).length && P.schema !== SCHEMA) { const old = P.schema || 1;
    try { localStorage.setItem('hp_prog_bak:' + (KID || 'k0') + ':v' + old, JSON.stringify(P)); } catch (e) {}
    STORE_ISSUES.migrated = old; for (const k of Object.keys(P)) delete P[k]; P.schema = SCHEMA; store.set(kk('hp_prog'), P); return P; }
  /* وفي البنية الحالية: ما خالف القاعدة في داخله يُسقط وحده (الفحص الخصم A05: جدول مراجعة بقيمة null كان يعطّل لوحة الكبار) */
  const bad = [], F = V_PROG(P, bad, kk('hp_prog')); if (bad.length) { store.corrupt(kk('hp_prog'), JSON.stringify(P)); STORE_ISSUES.repaired.push(kk('hp_prog')); store.set(kk('hp_prog'), F); }
  F.schema = SCHEMA; return F; })();
if (!isObj(PROG.srs)) PROG.srs = {}; if (!isObj(PROG.ws)) PROG.ws = {}; if (!isObj(PROG.streams)) PROG.streams = {};
const saveProg = () => store.set(kk('hp_prog'), PROG);
/* المراجعة المتباعدة لكل مفهوم (المبدأ 14، D237، الفحص الخصم A07): srsStart وsrsUpdate وجدولها في 70_review.js */
const srsDue = r => r && r.due != null && r.due <= Date.now();

/* ---------- السجل: المحاولات، والأخطاء البرمجية، ووجوه «كيف كان؟» ---------- */
const LOG = store.fix(kk('hp_log'), null, V_LOG) || { attempts: [] };
if (!Array.isArray(LOG.errors)) LOG.errors = []; if (!Array.isArray(LOG.faces)) LOG.faces = [];
let CUR = null, SCENE_NOW = '';                          // الدرس الجاري واسم المشهد الجاري (للسجل وللفحص)
function logAttempt(a) { LOG.attempts.push({ t: Date.now(), lesson: CUR ? CUR.id : '', seed: SEED_NOW, ...a }); if (LOG.attempts.length > 800) LOG.attempts.splice(0, LOG.attempts.length - 800); store.set(kk('hp_log'), LOG); }

/* ---------- الجلسة (المبدأ 11) ---------- */
let SESSION = store.fix(kk('hp_session'), { n: 0, t: 0 }, V_SESSION);
const SESSION_GAP = 30 * 60 * 1000;                      // نصف ساعة بلا دروس تبدأ جلسة جديدة
function sessionNow() { if (Date.now() - (SESSION.t || 0) > SESSION_GAP) SESSION = { n: 0, t: 0 }; return SESSION; }
function countLesson() { sessionNow(); SESSION.n++; SESSION.t = Date.now(); store.set(kk('hp_session'), SESSION); }
function needBreak() { sessionNow(); return SET.sessionMax > 0 && SESSION.n >= SET.sessionMax; }

/* ---------- ماسك الأخطاء العام: لا شاشة بيضاء، ورسالة وعودة إلى الخريطة ---------- */
let onCrash = () => {};
function recordCrash(err) { try { LOG.errors.push({ t: Date.now(), msg: String(err && (err.stack || err.message) || err).slice(0, 600), scene: (CUR ? CUR.id : '') + ':' + SCENE_NOW }); if (LOG.errors.length > 30) LOG.errors.shift(); store.set(kk('hp_log'), LOG); } catch (e) {} try { onCrash(err); } catch (e) {} }
/*T*/function testBug(msg) { try { LOG.errors.push({ t: Date.now(), msg: String(msg).slice(0, 600), scene: (CUR ? CUR.id : '') + ':' + SCENE_NOW }); store.set(kk('hp_log'), LOG); } catch (e) {} }/*/T*/   /* خللٌ تراه نسخة الفحص وحدها، بلا شاشة عطل */
window.addEventListener('error', e => recordCrash(e.error || e.message));
window.addEventListener('unhandledrejection', e => recordCrash(e.reason));
