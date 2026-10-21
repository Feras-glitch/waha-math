/* =====================================================================
   محرّك دروس واحة الرياضيات — نموذج الوحدة الأولى (D179، D180، D181، D182)
   ===================================================================== */
const NS = 'http://www.w3.org/2000/svg';
const $ = s => document.querySelector(s);
const FAST = location.hash === '#fast';
const TESTHOOK = FAST || location.hash === '#test';      // خطافات الفحص الآلي (لا تغيّر السلوك)                 // وضع الفحص الآلي: يقصّر الانتظار فقط
/* مسار الدرس: الخروج إلى الخريطة يجمّد المسار القديم عند أول انتظار، فلا يتكلّم ولا يرسم فوق الدرس الجديد */
let FLOW = 0;
const gate = p => { const f = FLOW; return p.then(v => f === FLOW ? v : new Promise(() => {})); };
const sleep = ms => gate(new Promise(r => setTimeout(r, FAST ? ms * 0.05 : ms)));
const store = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
                set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
function el(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function svgPoint(svg, ev) { const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); }
const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/* ---------- الطالب والخطاب ---------- */
/* أطفال الجهاز (D200): قائمة أطفال، ولكل طفل تقدّمه وسجلّه وإعداداته ومعرضه بمفاتيح خاصة به (hp_prog:معرّف). الملف الواحد القديم يُنقل تلقائياً */
const KIDS = store.get('hp_kids', null) || (() => { const p = store.get('hp_profile', null); if (!p) return [];
  const id = 'k1'; for (const [a, b] of [['hp_prog', 'hp_prog:k1'], ['hp_u1_prog', 'hp_prog:k1'], ['hp_log', 'hp_log:k1'], ['hp_u1_log', 'hp_log:k1'], ['hp_session', 'hp_session:k1'], ['hp_settings', 'hp_settings:k1']])
    try { const v = localStorage.getItem(a); if (v != null && localStorage.getItem(b) == null) localStorage.setItem(b, v); } catch (e) {}
  const k = [{ id, name: p.name, gender: p.gender, photo: p.photo || '' }]; store.set('hp_kids', k); store.set('hp_kid', id); return k; })();
let KID = store.get('hp_kid', null); if (!KIDS.find(k => k.id === KID)) KID = KIDS[0] ? KIDS[0].id : null;
const kk = key => key + ':' + (KID || 'k0');
let PROFILE = KIDS.find(k => k.id === KID) || null;    // {id, name, gender:'m'|'f', photo}
const GEN_RX = /\{([^|{}]*)\|([^|{}]*)\}/g;             // كل جملة تحمل صيغتيها {مذكر|مؤنث}
function G(t) { return String(t).replace(/\{name\}/g, PROFILE ? PROFILE.name : '').replace(GEN_RX, (m, a, b) => (PROFILE && PROFILE.gender === 'f') ? b : a); }
function gSuffix(t) { GEN_RX.lastIndex = 0; return GEN_RX.test(t) ? (PROFILE && PROFILE.gender === 'f' ? '_f' : '_m') : ''; }

/* ---------- الأرقام: شرقية (١٢٣) أو غربية (123) باختيار الطالب ---------- */
let DIGITS = store.get('hp_digits', 'east');
const DG = n => DIGITS === 'east' ? String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]) : String(n);

/* ---------- التقدّم والسجل ---------- */
const PROG = store.get(kk('hp_prog'), null) || {};      // معرّف الدرس ← {done, mastered, score, at}؛ و«badge:الوحدة»
if (PROG.badge) { PROG['badge:m1.u1'] = true; delete PROG.badge; }          // نقل شارة النسخة السابقة
const saveProg = () => store.set(kk('hp_prog'), PROG); saveProg();
/* المراجعة المتباعدة (D182، المبدأ 14): بعد الإتقان 1 ثم 3 ثم 7 ثم 21 يوماً؛ والخطأ يعيد الدرس إلى أول الجدول */
const SRS_DAYS = [1, 3, 7, 21], DAY = 864e5;
if (!PROG.srs || typeof PROG.srs !== 'object') PROG.srs = {};
function srsStart(id) { if (!PROG.srs[id]) { PROG.srs[id] = { step: 0, due: Date.now() + SRS_DAYS[0] * DAY }; saveProg(); } }
function srsUpdate(id, ok) { const r = PROG.srs[id] || { step: 0 };
  if (ok) { r.step++; r.due = r.step >= SRS_DAYS.length ? null : Date.now() + SRS_DAYS[r.step] * DAY; } else { r.step = 0; r.due = Date.now() + SRS_DAYS[0] * DAY; }
  r.last = Date.now(); PROG.srs[id] = r; }
const LOG = store.get(kk('hp_log'), null) || { attempts: [] };
function logAttempt(a) { LOG.attempts.push({ t: Date.now(), lesson: CUR ? CUR.id : '', ...a }); if (LOG.attempts.length > 600) LOG.attempts.shift(); store.set(kk('hp_log'), LOG); }
let CUR = null;                                          // الدرس الجاري
/* حدود الجلسة (المبدأ 11): درسان افتراضياً ثم استراحة؛ والكبير يضبط الحدّ. المراجعة القصيرة لا تُحسب درساً */
const SET = Object.assign({ sessionMax: 2, slow: false }, store.get('hp_settings', {}), store.get(kk('hp_settings'), {}));   // لكل طفل؛ hp_settings العامة قيمة أولية
const saveSet = () => store.set(kk('hp_settings'), SET);
let SESSION = store.get(kk('hp_session'), { n: 0, t: 0 });
const SESSION_GAP = 30 * 60 * 1000;                      // نصف ساعة بلا دروس تبدأ جلسة جديدة
function sessionNow() { if (Date.now() - (SESSION.t || 0) > SESSION_GAP) SESSION = { n: 0, t: 0 }; return SESSION; }
function countLesson() { sessionNow(); SESSION.n++; SESSION.t = Date.now(); store.set(kk('hp_session'), SESSION); }
function needBreak() { sessionNow(); return SET.sessionMax > 0 && SESSION.n >= SET.sessionMax; }

