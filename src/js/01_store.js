/* =====================================================================
   التخزين (D246): قراءة بتحقق النوع، ونسخة من التالف، وإشارة فشل الكتابة، وقفل التبويب
   ===================================================================== */
const SCHEMA = 3;                                        // 3: دروس الوحدتين بعد D248، والإعدادات والأرقام لكل طفل
const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
const STORE_ISSUES = { corrupt: [], writeFail: false, migrated: null };
const store = {
  raw(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  /* يعيد القيمة إن اجتازت الفحص، وإلا ينسخ القيمة التالفة إلى hp_corrupt:المفتاح:الزمن ويعيد الافتراضية */
  read(k, def, ok) { const raw = this.raw(k); if (raw == null) return def;
    let v; try { v = JSON.parse(raw); } catch (e) { this.corrupt(k, raw); return def; }
    if (ok && !ok(v)) { this.corrupt(k, raw); return def; } return v; },
  get(k, def) { return this.read(k, def); },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { if (!STORE_ISSUES.writeFail) { STORE_ISSUES.writeFail = true; try { onStoreIssue(); } catch (x) {} } return false; } },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  corrupt(k, raw) { STORE_ISSUES.corrupt.push(k); try { localStorage.setItem('hp_corrupt:' + k + ':' + Date.now(), String(raw).slice(0, 20000)); } catch (e) {} },
};
let onStoreIssue = () => {};                              // تعيّنه لوحة الكبار (شريط تنبيه)

/* ---------- أطفال الجهاز (D200) ---------- */
const kidOk = k => isObj(k) && typeof k.id === 'string' && (k.gender === 'm' || k.gender === 'f');
const cleanKid = k => ({ id: k.id, name: typeof k.name === 'string' ? k.name.slice(0, 24) : '', gender: k.gender, photo: typeof k.photo === 'string' ? k.photo : '', avatar: typeof k.avatar === 'string' ? k.avatar : '' });
const KIDS = (() => {
  const list = store.read('hp_kids', null, v => Array.isArray(v));
  if (list) return list.filter(kidOk).map(cleanKid);
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
  /*T*/store.read('hp_settings', {}, isObj),/*/T*/ store.read(kk('hp_settings'), {}, isObj));
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
    STORE_ISSUES.migrated = old; for (const k of Object.keys(P)) delete P[k]; P.schema = SCHEMA; store.set(kk('hp_prog'), P); }
  P.schema = SCHEMA; return P; })();
if (!isObj(PROG.srs)) PROG.srs = {}; if (!isObj(PROG.ws)) PROG.ws = {}; if (!isObj(PROG.streams)) PROG.streams = {};
const saveProg = () => store.set(kk('hp_prog'), PROG);
/* المراجعة المتباعدة (المبدأ 14، D182، D237): بعد الإتقان 1 ثم 3 ثم 7 ثم 21 يوماً، بالأيام المحلية؛ والخطأ يرجع خطوة واحدة */
const SRS_DAYS = [1, 3, 7, 21];
function srsStart(id) { if (!PROG.srs[id]) { PROG.srs[id] = { step: 0, due: addDays(Date.now(), SRS_DAYS[0]) }; saveProg(); } }
function srsUpdate(id, ok) { const r = PROG.srs[id] || { step: 0 }; const now = Date.now();
  if (ok) { r.step++; r.due = r.step >= SRS_DAYS.length ? null : addDays(now, SRS_DAYS[r.step]); }
  else { r.step = Math.max(0, r.step - 1); r.due = addDays(now, SRS_DAYS[r.step]); }
  r.last = now; PROG.srs[id] = r; }
const srsDue = r => r && r.due != null && r.due <= Date.now();

/* ---------- السجل: المحاولات، والأخطاء البرمجية، ووجوه «كيف كان؟» ---------- */
const LOG = store.read(kk('hp_log'), null, v => isObj(v) && Array.isArray(v.attempts)) || { attempts: [] };
if (!Array.isArray(LOG.errors)) LOG.errors = []; if (!Array.isArray(LOG.faces)) LOG.faces = [];
let CUR = null, SCENE_NOW = '';                          // الدرس الجاري واسم المشهد الجاري (للسجل وللفحص)
function logAttempt(a) { LOG.attempts.push({ t: Date.now(), lesson: CUR ? CUR.id : '', seed: SEED_NOW, ...a }); if (LOG.attempts.length > 800) LOG.attempts.splice(0, LOG.attempts.length - 800); store.set(kk('hp_log'), LOG); }

/* ---------- الجلسة (المبدأ 11) ---------- */
let SESSION = store.read(kk('hp_session'), { n: 0, t: 0 }, v => isObj(v) && typeof v.n === 'number');
const SESSION_GAP = 30 * 60 * 1000;                      // نصف ساعة بلا دروس تبدأ جلسة جديدة
function sessionNow() { if (Date.now() - (SESSION.t || 0) > SESSION_GAP) SESSION = { n: 0, t: 0 }; return SESSION; }
function countLesson() { sessionNow(); SESSION.n++; SESSION.t = Date.now(); store.set(kk('hp_session'), SESSION); }
function needBreak() { sessionNow(); return SET.sessionMax > 0 && SESSION.n >= SET.sessionMax; }

/* ---------- قفل التبويب: تبويبان مفتوحان لا يمحو أحدهما عمل الآخر ---------- */
const TAB = Math.random().toString(36).slice(2, 10);   // rng-ok: معرّف التبويب لا يدخل في عشوائية الدروس
let TAB_LOST = false, onTabLost = () => {};
function tabClaim() { store.set('hp_lock', { tab: TAB, t: Date.now() }); TAB_LOST = false; }
function tabOwner() { const l = store.read('hp_lock', null, isObj); return l && Date.now() - l.t < 15000 ? l.tab : null; }
setInterval(() => { const o = tabOwner(); if (!o || o === TAB) { if (!TAB_LOST) tabClaim(); } }, 5000);
window.addEventListener('storage', e => { if (e.key === 'hp_lock') { const o = tabOwner(); if (o && o !== TAB && !TAB_LOST) { TAB_LOST = true; onTabLost(); } } });

/* ---------- ماسك الأخطاء العام: لا شاشة بيضاء، ورسالة وعودة إلى الخريطة ---------- */
let onCrash = () => {};
function recordCrash(err) { try { LOG.errors.push({ t: Date.now(), msg: String(err && (err.stack || err.message) || err).slice(0, 600), scene: (CUR ? CUR.id : '') + ':' + SCENE_NOW }); if (LOG.errors.length > 30) LOG.errors.shift(); store.set(kk('hp_log'), LOG); } catch (e) {} try { onCrash(err); } catch (e) {} }
window.addEventListener('error', e => recordCrash(e.error || e.message));
window.addEventListener('unhandledrejection', e => recordCrash(e.reason));
