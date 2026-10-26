/* =====================================================================
   محرّك دروس واحة الرياضيات — النواة (D179، D246)
   ثوابت وأدوات عامة لا تعرف شيئاً عن الدروس: الحركة، والعشوائية، والتهريب، والأرقام.
   ===================================================================== */
const NS = 'http://www.w3.org/2000/svg';
const $ = s => document.querySelector(s);
/* وضع الفحص: يُحذف كله من نسخة الأطفال (ما بين علامتي T يُحذف عند البناء، فيبقى false) */
const FAST = /*T*/location.hash.includes('fast') ||/*/T*/ false;
const TESTHOOK = /*T*/FAST || location.hash.includes('test') ||/*/T*/ false;
/* تقليل الحركة (D246، الوصولية): كل مدّة حركة تمرّ بـ dur() */
let RM = false; try { const mq = matchMedia('(prefers-reduced-motion: reduce)'); RM = mq.matches; mq.addEventListener('change', e => { RM = e.matches; }); } catch (e) {}
const dur = ms => RM ? 1 : FAST ? Math.max(1, Math.round(ms * 0.05)) : ms;

/* مسار الدرس: الخروج إلى الخريطة يجمّد المسار القديم عند أول انتظار، فلا يتكلّم ولا يرسم فوق ما بعده */
let FLOW = 0, PAUSED = null, PAUSE_MS = 0;
/* ساعة الدرس: الزمن بلا الإيقاف كله (الغطاء وإطفاء الشاشة)، فلا تقفز حركة tween إلى آخرها بعد العودة والصفحة مخفيةٌ لا تنادي rAF (الفحص المستقل H2 (1)) */
const lclock = () => performance.now() - PAUSE_MS - (PAUSED && PAUSED.t != null ? performance.now() - PAUSED.t : 0);
/* وغطاء الخروج يوقف المسار (الفحص المستقل F2 (3)): كل انتظارٍ بالبوابة ينتهي وهو مفتوح ينتظر «نبقى» (pauseLesson في الصوت) */
const gate = p => { const f = FLOW, go = v => f !== FLOW ? new Promise(() => {}) : PAUSED ? PAUSED.p.then(() => go(v)) : v; return Promise.resolve(p).then(go); };
/* مفتاح الفعل: Enter أو المسافة (مواصفة المحرّك 8؛ الفحص المستقل C2 لبوابة S1-U4: أهداف بمفتاحها الخاص كانت تقبل Enter وحده)، ولا تمرّر المسافة الصفحة */
const isActKey = e => e.key === 'Enter' || e.key === ' ', actKey = e => isActKey(e) && (e.preventDefault(), true);   /* والسؤال وحده بلا منع (المستمع العامّ) */
/* والمؤقّت يقف مع الدرس (الفحص المستقل G2 (4): اللمحة وثبات تقليل الحركة ومهل العرض كانت تمضي تحت غطاء الخروج، فيعود الطفل والإطار مغطّى): psleep لا يعدّ زمن الإيقاف */
const SLEEPERS = new Set();
/*T*/let STALE = 0;/*/T*/   /* في نسخة الفحص: مهلةٌ بدأت في شاشةٍ تُركت (FLOW تغيّر) ثم انتهت، فما يُسمع في أوّل ما بعدها خللٌ (الفحص المستقل J2 (8): صيغ قاعدة lint تُحصى ولا تُغلق) */
function psleep(ms) { /*T*/const f0 = FLOW;/*/T*/ return new Promise(res => { let left = ms, t0 = 0, id = null; const s = {
    stop() { if (id == null) return; clearTimeout(id); id = null; left -= performance.now() - t0; },
    go() { if (id != null) return; t0 = performance.now(); id = setTimeout(() => { id = null; SLEEPERS.delete(s); /*T*/const st = TESTHOOK && FLOW !== f0; if (st) STALE++;/*/T*/ res(); /*T*/if (st) Promise.resolve().then(() => STALE--);/*/T*/ }   /* بعد res: ما ينتظرها يجري قبل أن يُنقص */, Math.max(0, left)); } };
  SLEEPERS.add(s); if (!PAUSED) s.go(); }); }
const sleep = ms => gate(psleep(FAST ? ms * 0.05 : ms));
/* ومهلةٌ تقف مع الدرس وتُلغى (مهلة الفانوس: كانت setTimeout فتعدّ زمن الإيقاف، فيأتي «هل نفكّر معاً؟» بعد الجملة المعادة مباشرة؛ الفحص المستقل H2 (4ج)) */
function ptimeout(fn, ms) { let left = ms, t0 = 0, id = null; const s = { stop() { if (id == null) return; clearTimeout(id); id = null; left -= performance.now() - t0; },
    go() { if (id != null) return; t0 = performance.now(); id = setTimeout(() => { id = null; SLEEPERS.delete(s); fn(); }, Math.max(0, left)); }, cancel() { if (id != null) clearTimeout(id); id = null; SLEEPERS.delete(s); } };
  SLEEPERS.add(s); if (!PAUSED) s.go(); return s; }
/* غلاف الحركة الواحد: يحترم تقليل الحركة ووضع الفحص، ويعيد كائن الحركة ومعه وعد .done مغلَّف بـ gate */
/* قيمة transform بصيغة سمة SVG («translate(330 196) rotate(8)») ليست قيمة CSS صالحة، فتُسقطها الحركة ويقفز الشيء من الزاوية:
   نحوّلها هنا مرة واحدة لكل حركة، فلا يتكرّر الخطأ في مشهد جديد */
const cssT = t => typeof t !== 'string' ? t : t
  .replace(/translate\(\s*(-?[\d.]+(?:e-?\d+)?)(?:[\s,]+(-?[\d.]+(?:e-?\d+)?))?\s*\)/g, (m, x, y) => `translate(${x}px,${y || 0}px)`)
  .replace(/rotate\(\s*(-?[\d.]+(?:e-?\d+)?)\s*\)/g, 'rotate($1deg)').replace(/skew([XY])\(\s*(-?[\d.]+)\s*\)/g, 'skew$1($2deg)');
const HOLDS = new WeakMap();
function anim(node, frames, opts = {}) {
  if (Array.isArray(frames)) frames = frames.map(f => f && f.transform ? { ...f, transform: cssT(f.transform) } : f);
  const o = typeof opts === 'number' ? { duration: opts } : { ...opts };
  /* ومع تقليل الحركة لا يمحو الوميضُ ما يُري: ظهورٌ عابر (شفافية تعلو ثم تنزل) يُرسم ثابتاً بأعلاه مدّته ثم يعود (الفحص المستقل C2 لبوابة S1-U4:
     حلقة حركة الأداة في التعدّي والوهج في «أين؟» كانا 1 م.ث فلا يُريان، فتسقط الدرجة الثانية من سلّم المساعدة) */
  const op = Array.isArray(frames) && frames.length > 1 && frames.every(f => f && Object.keys(f).every(k => k === 'opacity' || k === 'offset')) ? frames.map(f => +f.opacity) : null;
  const endOp = op && (/alternate/.test(o.direction || '') && o.iterations > 1 && o.iterations % 2 === 0 ? op[0] : op[op.length - 1]);   /* «ذهاباً وإياباً» بعدد زوجي ينتهي بأوّله */
  /* (الفحص المستقل D2 لبوابة S1-U4): وهو ما يعلو ثم ينزل وحده، فالخفوت (1←0) يقفز إلى نهايته ولا يبقى ظاهراً 600 م.ث (خروج فوضى، واليد)؛ وتعود بعده
     شفافية العقدة المضمّنة كما كانت، لا '' (ظلّ الورشة الملمَّح إليه .22 صار معتماً) */
  /* (الفحص المستقل E2): والعابر كل حركة شفافية غير رتيبة، لا ما يعلو ثم ينزل وحده: حلقة الروبوت تبدأ من الصفر وتنتهي بأعلاها ثم تُزال، والرسالة وهي تُعدّ
     تخفت ثم تعود؛ فيُرسم ثابتاً بأبعد قيمة عن أوّله مدّته. والرتيب (ظهورٌ أو خفوت) يقفز إلى نهايته */
  const seq = op && (/alternate/.test(o.direction || '') && o.iterations > 1 ? [...op, ...op.slice(0, -1).reverse()] : op);
  const mono = seq && (seq.every((v, i) => !i || v >= seq[i - 1]) || seq.every((v, i) => !i || v <= seq[i - 1]));
  const holdMs = () => FAST ? 300 : Math.max(600, (o.duration ?? 400) * (o.iterations > 1 ? o.iterations : 1)), keepEnd = o.fill === 'forwards' || o.fill === 'both';
  /* ولا تُعاد الشفافية القديمة إن تغيّرت أثناء المهلة (الفحص المستقل F2 (8): الظلّ الملمَّح إليه يُملأ أثناء التلميح فيعود إلى .22 تحت القطعة) */
  /* وثباتان متداخلان على العقدة والخاصية نفسيهما يعيدان أصلها لا قيمة الثبات الأول (الفحص المستقل G2 (7): ثلاث لمسات للفانوس تركت الظلّ .54): الأصل محفوظ لكل عقدة،
     ويعيده آخرُ ثباتٍ ينتهي، والمهلة تقف مع الدرس */
  /* وبمدّتين مختلفتين (الفحص المستقل H2 (5): القصير بعد الطويل وينتهي قبله تركها بقيمته، 0.9 بدل 0.22): الثبات يقارن بآخر قيمة وضعها ثباتٌ (cur) لا بقيمته هو،
     وإن غيّر الكود الخاصية بين ثباتين صارت قيمته الأصلَ الذي يُعاد */
  const holdFor = (k, hold, end) => { const H = HOLDS.get(node) || {}; HOLDS.set(node, H); let h = H[k];
    if (!h) h = H[k] = { orig: node.style[k], n: 0, cur: null }; else if (node.style[k] !== h.cur) h.orig = node.style[k];
    h.n++; node.style[k] = hold; h.cur = node.style[k];
    const p = psleep(holdMs()).then(() => { if (--h.n) return; delete H[k]; if (node.style[k] === h.cur) node.style[k] = keepEnd ? end : h.orig; }); return { done: gate(p), cancel() {} }; };
  if (RM && op && !mono) return holdFor('opacity', seq.reduce((a, v) => Math.abs(v - seq[0]) > Math.abs(a - seq[0]) ? v : a, seq[0]), endOp);
  /* (الفحص المستقل F2 (4)): والوهج (filter) والحركة ذهاباً وإياباً (transform) عابرةٌ كذلك: حركة الأداة «الحواف» و«رفيع» و«يتدحرج» و«مدبّب» ووهج «أين؟»
     كانت تقفز مع تقليل الحركة إلى آخرها، وهو أوّلها، فلا تُرى. فحركة خاصية واحدة تعود إلى أوّلها تُرسم ثابتةً بأبعد إطار عن أوّلها مدّتها ثم تعود */
  const ks = Array.isArray(frames) && frames.length > 1 ? [...new Set(frames.flatMap(f => Object.keys(f || {}).filter(k => !['offset', 'easing', 'composite'].includes(k))))] : [], P1 = ks.length === 1 && ks[0] !== 'opacity' ? ks[0] : null;
  if (RM && P1 && frames.every(f => f && f[P1] != null)) { const V = frames.map(f => String(f[P1])), end = /alternate/.test(o.direction || '') && o.iterations > 1 && o.iterations % 2 === 0 ? V[0] : V[V.length - 1];
    if (end === V[0] && V.some(v => v !== V[0])) { const N = v => (v.match(/-?\d*\.?\d+/g) || []).map(Number), n0 = N(V[0]), far = v => { const n = N(v); return n.length !== n0.length ? 1e9 : n.reduce((a, x, i) => a + Math.abs(x - n0[i]), 0); };
      return holdFor(P1, V.reduce((a, v) => far(v) > far(a) ? v : a, V[0]), end); } }
  o.duration = dur(o.duration ?? 400); if (o.delay) o.delay = dur(o.delay);
  if (RM || FAST) { if (o.iterations === Infinity) o.iterations = 1; }
  let a = null; try { a = node.animate(frames, o); } catch (e) {}
  /* وفي نسخة الفحص: خفوتٌ إلى الصفر بلا fill تبقى عقدته موصولة بعد نهايته يعود ظاهراً، فيُسجَّل في سجلّ الأعطال (الفحص المستقل F2 (6): نجت من قاعدة lint إطاراتٌ في متغيّر) */
  /* (والدرس موقوف أو تبدّل مساره منذ بدء الحركة لا يُحكم: الإزالة بعد .done المغلَّف بالبوابة، والخروج يترك العقدة في درسٍ مخفيّ — الفحص المستقل G2 (11)) */
  /*T*/if (TESTHOOK && a && Array.isArray(frames) && frames.length && frames[frames.length - 1] && +frames[frames.length - 1].opacity === 0 && frames[frames.length - 1].opacity != null && o.fill !== 'forwards' && o.fill !== 'both' && !/alternate/.test(o.direction || '')) { const f0 = FLOW;
    a.addEventListener('finish', () => setTimeout(() => { if (!PAUSED && FLOW === f0 && node.isConnected && +getComputedStyle(node).opacity > 0) testBug('anim: خفوتٌ إلى الصفر بلا fill وعقدته باقية (' + (node.getAttribute && (node.getAttribute('class') || node.nodeName)) + ')'); }, 0)); }/*/T*/
  const p = new Promise(r => { if (!a) return r(); a.onfinish = () => r(a); a.oncancel = () => r(a); });
  const ret = a || {}; ret.done = gate(p); return ret;
}
/* حلقة رسم بزمن: step(t) من 0 إلى 1. مع تقليل الحركة تقفز إلى النهاية */
function tween(ms, step) {
  const D = dur(ms);
  return gate(new Promise(r => { if (D <= 1) { step(1); r(); return; } const t0 = lclock();
    /* ويقف مع الدرس: زمن الإيقاف لا يُعدّ، فلا ينزلق الشيء تحت الغطاء (الفحص المستقل G2 (4): حركة الأداة في pr.3 مضت تحت الغطاء فلم يرَ الطفل الانزلاق)، ولا بعد إطفاء
       الشاشة: الزمن بساعة الدرس لا بما بين إطارين، فالإطار الأول بعد الظهور لا يحسب زمن الإخفاء (H2 (1)) */
    const f = () => { if (PAUSED) { PAUSED.p.then(() => requestAnimationFrame(f)); return; }
      const t = Math.min(1, (lclock() - t0) / D); step(t); if (t < 1) requestAnimationFrame(f); else r(); }; requestAnimationFrame(f); }));
}
const easeIO = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

/* العشوائية ببذرة (D246): كل درس يبدأ ببذرة من الطفل والدرس ورقم المرور، فيُعاد المسار نفسه عند البلاغ؛ وفي الفحص #seed=N */
function hash32(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
let SEED_BASE = 0; /*T*/{ const m = location.hash.match(/seed=(\d+)/); if (m) SEED_BASE = +m[1]; }/*/T*/
let SEED_NOW = 1, rand = mulberry32(1);
function reseed(key) { SEED_NOW = (hash32(String(key)) ^ SEED_BASE) >>> 0; rand = mulberry32(SEED_NOW); return SEED_NOW; }
reseed('boot:' + Date.now());
const drand = mulberry32(hash32('زينة'));               // عشوائية الزينة (القصاصات): منفصلة كي لا تغيّر مسار الدرس
const R = (a, b) => a + Math.floor(rand() * (b - a + 1));
const pick = a => a[Math.floor(rand() * a.length)];
const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/* SVG وDOM */
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
function el(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function svgPoint(svg, ev) { const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); }
/* تهريب حقيقي (لا حذف): «أحمد & سارة» يبقى كما هو */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const plain = t => String(t).replace(/[ً-ْٰ]/g, '');
/* لون نصّ مقروء فوق خلفية (T10): أبيض فوق الداكن وحبر فوق الفاتح */
function onColor(hex) { const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim()); if (!m) return '#ffffff'; const n = parseInt(m[1], 16);
  const ch = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
  const L = .2126 * ch((n >> 16) & 255) + .7152 * ch((n >> 8) & 255) + .0722 * ch(n & 255); return L > .36 ? '#1b3440' : '#ffffff'; }

/* الأيام المحلية (D246: حدود الأيام في المراجعة المتباعدة): الموعد منتصف ليل اليوم المستحق */
const DAY = 864e5;
const dayStart = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const addDays = (t, n) => { const d = new Date(dayStart(t)); d.setDate(d.getDate() + n); return d.getTime(); };
const daysBetween = (a, b) => Math.round((dayStart(b) - dayStart(a)) / DAY);
