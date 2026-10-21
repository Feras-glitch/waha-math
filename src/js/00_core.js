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
let FLOW = 0;
const gate = p => { const f = FLOW; return Promise.resolve(p).then(v => f === FLOW ? v : new Promise(() => {})); };
const sleep = ms => gate(new Promise(r => setTimeout(r, FAST ? ms * 0.05 : ms)));
/* غلاف الحركة الواحد: يحترم تقليل الحركة ووضع الفحص، ويعيد كائن الحركة ومعه وعد .done مغلَّف بـ gate */
/* قيمة transform بصيغة سمة SVG («translate(330 196) rotate(8)») ليست قيمة CSS صالحة، فتُسقطها الحركة ويقفز الشيء من الزاوية:
   نحوّلها هنا مرة واحدة لكل حركة، فلا يتكرّر الخطأ في مشهد جديد */
const cssT = t => typeof t !== 'string' ? t : t
  .replace(/translate\(\s*(-?[\d.]+(?:e-?\d+)?)(?:[\s,]+(-?[\d.]+(?:e-?\d+)?))?\s*\)/g, (m, x, y) => `translate(${x}px,${y || 0}px)`)
  .replace(/rotate\(\s*(-?[\d.]+(?:e-?\d+)?)\s*\)/g, 'rotate($1deg)').replace(/skew([XY])\(\s*(-?[\d.]+)\s*\)/g, 'skew$1($2deg)');
function anim(node, frames, opts = {}) {
  if (Array.isArray(frames)) frames = frames.map(f => f && f.transform ? { ...f, transform: cssT(f.transform) } : f);
  const o = typeof opts === 'number' ? { duration: opts } : { ...opts };
  o.duration = dur(o.duration ?? 400); if (o.delay) o.delay = dur(o.delay);
  if (RM || FAST) { if (o.iterations === Infinity) o.iterations = 1; }
  let a = null; try { a = node.animate(frames, o); } catch (e) {}
  const p = new Promise(r => { if (!a) return r(); a.onfinish = () => r(a); a.oncancel = () => r(a); });
  const ret = a || {}; ret.done = gate(p); return ret;
}
/* حلقة رسم بزمن: step(t) من 0 إلى 1. مع تقليل الحركة تقفز إلى النهاية */
function tween(ms, step) {
  const D = dur(ms);
  return gate(new Promise(r => { if (D <= 1) { step(1); r(); return; } const t0 = performance.now();
    const f = () => { const t = Math.min(1, (performance.now() - t0) / D); step(t); if (t < 1) requestAnimationFrame(f); else r(); }; requestAnimationFrame(f); }));
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
