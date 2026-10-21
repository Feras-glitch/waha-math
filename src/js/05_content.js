/* =====================================================================
   المحتوى (D246): النصوص والبيانات في content/*.json تُحقن عند البناء في CONTENT، وهنا تُربط بأسماء المحرّك.
   لا يُكتب نصّ منطوق في JS إلا ما بقي إجرائياً في hook/explore/worked (انظر docs/MIGRATION.md).
   ===================================================================== */
const GEN = CONTENT.gen, ERRORS = CONTENT.errors;
const { PRAISE, PRAISE2, TEST_INTRO, TEST_SCORE, TEST_AGAIN_LOW, TEST_AGAIN_NEAR, SOLVE, MS_AGAIN, MS_LATER, NUM, KIDS_WHO, HUNT_LINE, GAL_INTRO, GAL_EMPTY, HUNT_SAVED,
  WS_INTRO, WS_PUZ, WS_TURN, WS_NO, WS_HINT, WS_SOLVED, WS_ALL, WS_FREE, WS_SAVED, REVIEW_INTRO, REVIEW_DONE, REVIEW_LATER, SESSION_BREAK } = GEN;
const BIN_NAMES = CONTENT.labels.BIN_NAMES;
const ERRN = {}; for (const [tag, e] of Object.entries(ERRORS)) ERRN[tag] = e.label;       // اسم الخطأ كما يراه الكبار (سجلّ الأخطاء الواحد)
const UNITS = CONTENT.units.map(u => ({ id: u.id, title: u.title, sub: u.sub }));
const HOSTS = {}, WS = {}, HUNT = [], TALK = {}, LDATA = {};
for (const u of CONTENT.units) { HOSTS[u.id] = u.hosts; if (u.workshop) WS[u.id] = u.workshop; HUNT.push(...u.hunt);
  for (const l of u.lessons) { LDATA[l.id] = l; if (l.talk) TALK[l.id] = l.talk; } }
/* المولّدات (MK وMK2 وRID) تُسجَّل هنا باسمها، فتشير إليها البيانات بالاسم: "plate"، أو ["squareRot", 45]، أو مواصفة كاملة {solid: ...} تمرّ بـ T2 */
const MAKER = {};
const mkRef = r => Array.isArray(r) ? () => MAKER[r[0]](...r.slice(1)) : typeof r === 'string' ? () => MAKER[r]() : () => T2(r);
/* جدول تفسير الأخطاء للدرس من السجلّ الواحد: الوسم وحده إن كان له تفسير واحد، أو [الوسم، معرّف التفسير] */
function errTable(list) { const t = {}; for (const e of list) { const [tag, id] = Array.isArray(e) ? e : [e, Object.keys(ERRORS[e].explain)[0]]; t[tag] = [id, ERRORS[tag].explain[id]]; } return t; }
const neutralRef = c => typeof c === 'string' && c.startsWith('$neutral.') ? NEUTRAL[+c.slice(9)] : c;   // "$neutral.3" ← لون محايد من NEUTRAL
/* يدمج بيانات الدرس (JSON) مع جزئه الإجرائي. يُستدعى: lesson(id, W => ({ hook, explore, worked, sort: {errorOf, …}, wrap }))
   وW(id) يعيد [المعرّف، نصّ سبب الصواب] من بيانات الدرس */
function lesson(id, make) {
  const D = LDATA[id]; const W = wid => [wid, D.sort.reasons[wid]]; const proc = typeof make === 'function' ? make(W, D) : make;
  const L = { id, title: D.title, icon: D.icon, ...proc };
  if (D.sort) { const S = D.sort;
    L.sort = { bins: S.bins, intro: S.intro, practice: S.practice.map(mkRef), sets: S.sets.map(set => set.map(mkRef)), remedial: S.remedial.map(mkRef), ERR: errTable(S.errors), msOk: S.msOk, ...proc.sort };
    if (S.praise) L.sort.praise = GEN[S.praise]; }
  if (D.chaos) L.chaos = { ...D.chaos, placed: D.chaos.placed.map(p => { const s = { ...p.s }; if (s.color) s.color = neutralRef(s.color); return { ...p, s }; }) };
  if (D.wrapLines) L.wrapLines = D.wrapLines;
  if (D.homeTask) L.homeTask = D.homeTask;
  if (D.test) L.test = { ...D.test, items: D.test.items.map(Q => { const q = { ...Q }; if (Q.opts) q.opts = () => Q.opts.map(r => mkRef(r)()); if (Q.show) q.show = mkRef(Q.show); return q; }), ...proc.test };
  return L;
}

