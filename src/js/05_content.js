/* =====================================================================
   المحتوى (D246، D249): كل نصّ منطوق في content/*.json، ويُحقن عند البناء في CONTENT.
   لا تُكتب في JS جملة منطوقة: المشاهد تشير إلى الجمل بمعرّفاتها (lines في ملف الدرس، أو gen.* في gen.json).
   ===================================================================== */
const GEN = CONTENT.gen, ERRORS = CONTENT.errors, LABELS = CONTENT.labels;
const GL = GEN.lines;                                    // gen.* ← نصّ أو [المتكلم، نصّ]
for (const e of Object.values(ERRORS)) if (isObj(e.q)) Object.assign(GL, e.q);   // أسئلة المستوى الأول تُكتب مع وسمها في errors.json
const BIN_NAMES = LABELS.bins;
const ERRN = {}; for (const [tag, e] of Object.entries(ERRORS)) ERRN[tag] = e.label;      // اسم الخطأ كما يراه الكبار
const UNITS = [], LDATA = {}, TALK = {};
for (const u of CONTENT.units) { UNITS.push({ ...u, lessons: u.lessons.map(l => l.id) });
  for (const l of u.lessons) { LDATA[l.id] = { ...l, unit: u.id }; if (l.talk) TALK[l.id] = l.talk; } }
const HOSTS = {}, WS = {}, HUNT = []; for (const u of UNITS) { HOSTS[u.id] = u.hosts; if (u.workshop) WS[u.id] = u.workshop; HUNT.push(...u.hunt); }
const unitOf = L => (typeof L === 'string' ? L : L.id).split('.').slice(0, 2).join('.');

/* الجملة بمعرّفها: [المتكلم، المعرّف، النص]. المعرّف القصير يُبحث عنه في جمل الدرس الجاري */
function lineOf(id, L) {
  const D = L ? (L.lines ? L : LDATA[L.id]) : (CUR ? LDATA[CUR.id] : null);
  const v = id.startsWith('gen.') ? GL[id] : (D && D.lines ? D.lines[id] : undefined);
  if (v == null) throw new Error('جملة غير موجودة: ' + id + (D ? ' في ' + D.id : ''));
  const [who, text] = Array.isArray(v) ? v : ['compass', v]; return [who, id, text];
}
/* اسم الشيء المكتوب تحت صورته يُقال أيضاً (المبدأ 8): gen.obj.<المفتاح>، والمفتاح من مطابقة النص مع labels.obj */
const OBJ_KEY = {}; for (const [k, v] of Object.entries(LABELS.obj || {})) OBJ_KEY[v] = k;
const objClip = s => { const k = s && s.label && OBJ_KEY[s.label]; return k && GL['gen.obj.' + k] ? 'gen.obj.' + k : null; };
const hasLine = (id, L) => { try { lineOf(id, L); return true; } catch (e) { return false; } };
/* S('hook.01') يقول جملة الدرس الجاري؛ S(['a','b']) يقولها بالتتابع */
async function S(id, opt) { if (Array.isArray(id)) { for (const x of id) await S(x, opt); return; } if (!id) return; return say(...lineOf(id), opt); }
const T = id => G(lineOf(id)[2]);                       // النص المعروض لجملة (للأزرار والبطاقات)

/* بنوك التنويع (M6): لا تتكرّر الصيغة نفسها مرتين متتاليتين */
const BANK_LAST = {};
function bank(name) { const b = GEN.banks[name]; if (!b || !b.length) return null; let id = pick(b); if (b.length > 1) while (id === BANK_LAST[name]) id = pick(b); BANK_LAST[name] = id; return id; }
const numw = n => 'gen.numw.' + String(n).padStart(2, '0');           // العدد كلمةً: «خَمْسَة»
const numw2 = n => GL['gen.numw2.' + String(n).padStart(2, '0')] ? 'gen.numw2.' + String(n).padStart(2, '0') : numw(n);   // بعد «ناقص» و«يساوي»: «اثْنَيْن»

/* المولّدات تُسجَّل باسمها، فتشير إليها البيانات: "plate"، أو ["squareRot", 45]، أو مواصفة كاملة {solid: ...} */
const MAKER = {};
function make(ref) {
  if (Array.isArray(ref)) { const f = MAKER[ref[0]]; if (!f) throw new Error('مولّد غير معروف ' + ref[0]); return f(...ref.slice(1)); }
  if (typeof ref === 'string') { const f = MAKER[ref]; if (!f) throw new Error('مولّد غير معروف ' + ref); return f(); }
  const c = ref.color == null ? null : String(ref.color);
  const color = !c ? (ref.solid || ref.type ? nextColor() : undefined) : c.startsWith('$neutral.') ? NEUTRAL[+c.slice(9)] : c.startsWith('$id.') ? css(IDC[c.slice(4)]) : c.startsWith('$solid.') ? SOLIDC[c.slice(7)] : c.startsWith('$mat.') ? MAT[c.slice(5)] : c;
  return { ...ref, color };
}
