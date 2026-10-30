# السائق الآلي للمحرّك v2: يقرأ window.__auto (كل انتظار لفعل الطفل يسجّل حلّه الصحيح وخطأً مقصوداً) ويضغط «التالي».
# الاستعمال: python3 test/auto_run.py [ok|mixed|deep|deepall|remedialdeep|failmastery|failtest|failreview|replay] [mat|screen] [f|m] [عدد الدروس]
#   ok: كل جواب صحيح · mixed: أول مرة لكل نوع بند يخطئ ثم يصيب (يمرّ بالتلميح الثلاثي) · failmastery: يخطئ في كل بنود الإتقان (التأجيل بعد دورتين)
#   failreview: خطآن متتاليان في بند المراجعة نفسه (الأول والثاني الفوري) فيُعاد الدرس (المبدأ 14)
#   deep: أربعة أخطاء لكل نوع في التمرين · deepall: أربعة أخطاء في كل بند بمساعدة (التمرين واللعب) فيبلغ الكشف ثم توأمه، وCHAL=1 لفرع «التحدّي» ·
#   remedialdeep: يخفق الإتقان فيُشغَّل العلاج، وبنوده بأربعة أخطاء ثم التوأم («twins missing»: بند بلغ الكشف ولا توأم له في درسه) · failtest: ثلاثة أخطاء في اختبار الوحدة ثم المراجعة والإعادة · replay: المسار كله ثم كل درس مرة ثانية في الجلسة نفسها
import asyncio, json, os, sys, time
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
FILE = os.environ.get('FILE', os.path.join(HERE, '..', 'dist', 'واحة_الرياضيات.dev.html'))
OUT = os.environ.get('OUT', os.path.join(HERE, 'out', 'auto')); os.makedirs(OUT, exist_ok=True)
MODE = sys.argv[1] if len(sys.argv) > 1 else 'ok'; PATH = sys.argv[2] if len(sys.argv) > 2 else 'screen'; GENDER = sys.argv[3] if len(sys.argv) > 3 else 'f'
MAXL = int(sys.argv[4]) if len(sys.argv) > 4 else 99; SEED = os.environ.get('SEED', '7'); SHOTS = os.environ.get('SHOTS', '1') == '1'
URL = 'file://' + os.path.abspath(FILE) + '#fast&seed=' + SEED
STATE = """() => { const q = s => document.querySelector(s); const vis = s => { const e = q(s); return !!e && !e.hidden; };
  const a = window.__auto; return { scene: window.__scene || '', home: vis('#home'), lesson: vis('#lesson'), covers: [...document.querySelectorAll('.cover')].filter(c => !c.hidden).map(c => c.id),
    go: !!(q('#go') && !q('#go').disabled && !q('#go').classList.contains('idle')), auto: a ? { kind: a.kind, n: a.n, scene: a.scene } : null, mode: window.__itemMode || '', itype: window.__item ? window.__item.itype : '',
    say: q('#say') ? q('#say').textContent : '', crash: (q('#crashCover') && !q('#crashCover').hidden), q: window.__item ? String(window.__item.q || window.__item.story || (() => { try { return JSON.stringify(window.__item.spec); } catch (e) { return ''; } })()) : '',   /* هويّة البند: بلا q (قصة) بقصته أو ببياناته، فلا يتشارك بندان عدّاد deepall (بوابة S1-U4: بند القصة في التحدّي لم يبلغ كشفه ولا توأمه) */ twin: !!window.__itemTwin }; }"""
SMALL = """() => { const out = []; for (const e of document.querySelectorAll('button, [role=button], input, svg g[style*="grab"], svg rect.route')) {   /* وما يُسحب: 64 (D250)؛ والمكدّس يُقاس بمنطقة توجيهه (route) */ const r = e.getBoundingClientRect(); if (!r.width || !r.height || e.closest('[hidden]') || e.dataset.routed) continue;
  if (getComputedStyle(e).visibility === 'hidden' || +getComputedStyle(e).opacity < .5) continue;   
  if (e instanceof SVGElement && getComputedStyle(e).cursor !== 'grab' && !e.onclick) continue;   /* عنصر SVG لم يصر هدفاً بعد (لا فعل له الآن) */   /* ما يختفي بعد الجواب (حركة خروج) ليس هدفاً */
  const need = (e.closest('#panel') || e.id === 'adultBtn') ? 44 : getComputedStyle(e).cursor === 'grab' ? 64 : 56; const m = Math.min(r.width, r.height);
  if (m < need - 0.5) out.push([e.id || (e.getAttribute('class') || e.tagName), Math.round(r.width), Math.round(r.height), need]); } return out; }"""
NONAME = """() => [...document.querySelectorAll('button, [role=button]')].filter(e => { const r = e.getBoundingClientRect(); return r.width && !e.closest('[hidden]') && getComputedStyle(e).visibility !== 'hidden' && !e.disabled && (e.tagName === 'BUTTON' || e.onclick) && !(e.getAttribute('aria-label') || '').trim() && !(e.textContent || '').trim(); }).map(e => e.id || e.getAttribute('class') || e.tagName)"""   # لكل هدف اسم مسموع لقارئ الشاشة
# D255: مركز كل هدف يذهب إليه هو. «سُرق» إن أخذ اللمسَ هدفٌ آخر (إلا قطعة متماثلة في مكانها، data-twin)، و«حُجب» إن وقع على شيء ليس هدفاً، و«وُجّه خطأ» إن وجّهته منطقة مشتركة (route) إلى غيره
# والأهداف الباهتة (الظلال بشفافية .22) أهدافٌ كغيرها، وتُلمس في مركز رسمها وقرب حوافّه الأربع حيث الرسم نفسه تحت الإصبع (الفحص المستقل B لبوابة S1-U4:
# كان الفحص يستبعد ما شفافيته دون .5 ويلمس المراكز وحدها، فلم يرَ منطقة ظلٍّ تغطّي الظلّ فوقه، ولا منطقة شريط تغطّي ثلث الشريط فوقه)
TAPS = """() => { const svg = document.querySelector('#stage svg'); if (!svg) return []; const tg = [...svg.querySelectorAll('[role=button]')].filter(g => (g.onclick || g.__route || getComputedStyle(g).cursor === 'grab') && !g.closest('[hidden]') && +getComputedStyle(g).opacity > .1 && getComputedStyle(g).pointerEvents !== 'none');
  const owner = e => { while (e && e !== svg) { if (tg.includes(e)) return e; e = e.parentNode; } return null; }; const name = g => g.dataset.slot || g.getAttribute('aria-label') || g.tagName; const out = [];
  for (const g of tg) { let r = null; if (g.tagName === 'line') { const b = g.getBoundingClientRect(); r = { l: b.left, t: b.top, r: b.right, b: b.bottom }; }   /* هدف هو خطّ (ضلع): منتصفه */
    for (const c of g.querySelectorAll('circle,ellipse,rect,polygon,path,line,polyline,text')) { if (c.matches('rect.hit')) continue; const f = c.getAttribute('fill'), s = c.getAttribute('stroke'); if ((f === 'transparent' || f === 'none') && (!s || s === 'none')) continue;
      const b = c.getBoundingClientRect(); if (!b.width && !b.height) continue; r = r ? { l: Math.min(r.l, b.left), t: Math.min(r.t, b.top), r: Math.max(r.r, b.right), b: Math.max(r.b, b.bottom) } : { l: b.left, t: b.top, r: b.right, b: b.bottom }; }
    if (!r) continue; const cx = (r.l + r.r) / 2, cy = (r.t + r.b) / 2, w = r.r - r.l, h = r.b - r.t;
    /* نقطة الحافّة تُفحص حيث يرى الطفل هذا الهدف نفسه أعلى ما هو مرسوم: أول عنصر مرسوم (لا منطقة لمس ولا شفاف) في المسرح تحت الإصبع منه */
    const onBody = (x, y) => { const e = document.elementsFromPoint(x, y).find(e => e instanceof SVGElement && svg.contains(e) && e !== svg && !blankEl(e)); return !!e && (e === g || g.contains(e)); };
    const pts = [[cx, cy, 'centre'], ...(w > 16 && h > 16 ? [[cx, r.t + 4, 'top'], [cx, r.b - 4, 'bottom'], [r.l + 4, cy, 'left'], [r.r - 4, cy, 'right']] : [])];
    for (const [x, y, where] of pts) { if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue; if (where !== 'centre' && !onBody(x, y)) continue; const e = document.elementFromPoint(x, y); if (!e) continue; const at = where === 'centre' ? '' : ' (' + where + ')';
      if (e.__route) { if (e.__route(x, y) !== g) out.push(['routed-wrong' + at, name(g)]); continue; }
      const o = owner(e); if (o === g) continue;
      if (o) { if (o.__route && o.__route(x, y) === g) continue; if (!(g.dataset.twin && g.dataset.twin === o.dataset.twin && name(g) === name(o))) out.push(['stolen' + at, name(g), name(o)]); }
      else if (where === 'centre' && (svg.contains(e) || e === svg)) out.push(['blocked', name(g), (e.getAttribute('class') || e.tagName)]); } }
  return out; }"""
# ما يُسحب في المسرح (g بمؤشّر السحب) ولا رسم مرئياً فيه: منطقة سحب حول لا شيء (كانت في لغز المتجر منطقة سحب فارغة في زاوية المسرح؛ الفحص المستقل الخامس).
# (أهداف اللمس الشفافة فوق رسم ليس هدفاً، كنقاط العدّ ورفّ «أين أكثر؟»، مقصودة فلا تُعدّ هنا)
EMPTY = """() => { const svg = document.querySelector('#stage svg'); if (!svg) return []; const clear = v => !v || v === 'none' || v === 'transparent' || /^rgba\\(.*,\\s*0\\)$/.test(v);
  const seen = e => { if (e.matches('rect.hit')) return false; const cs = getComputedStyle(e); return +cs.opacity !== 0 && !((clear(cs.fill) || +cs.fillOpacity === 0) && (clear(cs.stroke) || +cs.strokeOpacity === 0 || parseFloat(cs.strokeWidth) === 0)); };
  return [...svg.querySelectorAll('g[style*="grab"]')].filter(g => !g.closest('[hidden]') && +getComputedStyle(g).opacity >= .5)
    .filter(g => ![...g.querySelectorAll('circle,ellipse,rect,polygon,path,line,polyline,text,image')].some(e => { if (!seen(e)) return false; try { const k = e.getBBox(); return k.width || k.height; } catch (x) { return true; } }))   /* بإطار الرسم نفسه، لا بحجمه على الشاشة أثناء حركة الدخول */
    .map(g => g.getAttribute('aria-label') || g.dataset.k || g.getAttribute('class') || 'g'); }"""
# مسرحٌ مضغوط: جملة طويلة أو أزرار تحت المسرح تصغّر الرسم فتتقارب أهدافه وتصغر (حدث في S1-U4: رتّب أربعة أشرطة بجملة من خمسة أسطر وزرّ المحاذاة، فصار المسرح نصف حجمه
# وأشرطته على 25 نقطة بعضها من بعض، فسرقت منطقة لمسٍ لمسة جارتها؛ وصفوف «كم؟» تراكمت تحت المسرح). مقياس الرسم إلى مقياس عرضه (preserveAspectRatio meet): أقل من 0.75 مضغوط
# (أصغر ما في الدروس الأخرى 0.76: مسرح تتبّع الرقم في S1-U1 د3، وأحجامه كبيرة)
# وحدّان (بوابة S1-U4 على أضيق شاشة): 0.75 لمسرحٍ فيه أهداف لمس (تتقارب فتسرق بعضها)، و0.6 لمسرحٍ يُرى ولا يُلمس (الأزرار تحته: الروبوت 0.75 على 320×568، وكان التعليل 0.52 تحت ثلاث بطاقات فصُغّرت البطاقات)
# وكل هدف حيّ يُبلغ بلوحة المفاتيح (tabindex)، كما يُلمس (الفحص المستقل B لبوابة S1-U4: أهداف بلا لوحة مفاتيح في أربعة مشاهد، وعين اللمحة)
# هدف يُلمس ولا يبلغه المفتاح: بلا tabindex (kbdStage يعطيه لكل هدف)؛ وأن المفتاح يلمسه حقاً يفحصه Enter الحقيقي أدناه (KEYOK)
KEYLESS = """() => { const s = document.querySelector('#stage svg'); if (!s) return []; return [...s.querySelectorAll('[role=button]')].filter(g => (g.onclick || g.__route) && !g.closest('[hidden]') && getComputedStyle(g).pointerEvents !== 'none' && g.getAttribute('tabindex') == null).map(g => g.getAttribute('aria-label') || g.tagName); }"""
# ولوحة المفاتيح بالمفتاح الحقيقي (الفحص المستقل C2 لبوابة S1-U4: كان العدّاد يعدّ ما بلا مفتاح بشرطٍ لا يصدق أبداً، فنجت طفرة حذف اللمس من مستمع Enter العامّ):
# في كل انتظار ثانٍ يُجاب بالصواب، يُشغَّل حلّه الآلي واللمسُ فيه موقوف، فإن كان لمسةً واحدة على هدف في المسرح أخذ الهدفُ التركيز وضُغط Enter الحقيقي
# وانتُظر أن ينتهي الانتظار (فيُفحص المفتاح الخاص والمستمع العامّ كلاهما)؛ وما سوى ذلك تُعاد لمساته الموقوفة كما كانت
KEY_DELAY = int(os.environ.get("KEY_DELAY", "0"))   # م.ث قبل مفتاح الفعل في الحلّ المتتابع، لإعادة إنتاج سباقه
KEYOK = """() => { const a = window.__auto; window.__keyAsync = false; if (!a || !a.ok) return 0; const cap = [], D = EventTarget.prototype.dispatchEvent, C = HTMLElement.prototype.click, LOOP = {}; let r;
  /* حلٌّ آلي يلمس حتى يتغيّر شيء («while (laid < n) plus.click()») يدور بلا نهاية واللمس موقوف فيتجمّد الصفحة (بوابة S1-U4): بعد أربعين لمسة يُقطع ويُشغَّل الحلّ كما هو */
  const grab = (el, how) => { cap.push([el, how]); if (cap.length > 40) throw LOOP; };
  EventTarget.prototype.dispatchEvent = function (ev) { if (ev && ev.type === 'click') { grab(this, 'e'); return true; } return D.call(this, ev); };
  HTMLElement.prototype.click = function () { grab(this, 'c'); };
  try { r = a.ok(); } catch (x) { if (x !== LOOP) throw x; EventTarget.prototype.dispatchEvent = D; HTMLElement.prototype.click = C; a.ok(); return 0; } finally { EventTarget.prototype.dispatchEvent = D; HTMLElement.prototype.click = C; }
  const replay = () => cap.forEach(([e, how]) => how === 'c' ? e.click() : e.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  const e = cap.length === 1 && cap[0][0]; if (!e || !(e instanceof SVGElement) || !e.closest('#stage') || e.getAttribute('role') !== 'button') { replay(); return 0; }
  /* والحلّ المتتابع (async: يلمس الأول ثم ينتظر ويلمس ما بعده وحده، كطريق الأعداد والعدّ باللمس والوجوه) يمضي بعد 30 م.ث فأكثر بلمساتٍ حقيقية،
     فما يتغيّر بعدها ليس من مفتاحٍ يُضغط: يُعلَّم، فيُضغط مفتاح الفعل فوراً كما قبل J2 بلا المفاتيح الأخرى (بوابة S1-U4 بعد J: سبق الحلّ المفاتيح الأخرى
     في طريق الأعداد، وظهر بلا أي مفتاح؛ ولا انتظار هنا ولا ذهاب وإياب زائد، فيبقى مفتاح الفعل قبل لمسته الثانية كما كان) */
  window.__keyAsync = !!(r && typeof r.then === 'function'); window.__keyEl = e;
  /* وفي المتتابع: هل جاءت أول لمسةٍ بعد هذا قبل أيّ مفتاح؟ فإن جاءت فالحلّ سبق المفتاح (المهلة 30 م.ث تبدأ من هنا لا من ضغط المفتاح، فتسبقه حين يبطؤ الجهاز)،
     وما سُجّل بعدها خطأُ السائق لا خطأ المفتاح: يُعدّ باسمه ولا يُحكم به (الدرس 263؛ ظهر مرة في «replay screen f» بعد الفحص الخصم) */
  window.__race = null;
  if (window.__keyAsync) { let kd = false; document.addEventListener('keydown', () => { kd = true; }, { capture: true, once: true });
    document.addEventListener('click', () => { if (window.__race === null) window.__race = !kd; }, { capture: true, once: true }); }
  e.focus(); return document.activeElement === e ? 1 : -1; }"""
# وأعداد «معي» لا تكون خياراً غير الجواب في أسئلة الشاشة التي تخدمها (الفحص المستقل H1 (10أ): قالت «أربعة عشر» ثم سُئل الطفل عن ثلاثة عشر وخياراه 14 و4)،
# مولَّدةً كانت أو مشتّتاً مشخِّصاً (فالمشخِّص يُعرف بخطئه لا بذاكرة «معي»). والمتوقَّع يُحسب من بيانات الدروس بـ matNums نفسها في d240 (لا من MAT_AVOID في
# الصفحة)، للخطوة التي فيها «معي» وما يمضي بعدها: فيُرى البناء إن لم يكتب mat.avoid، والمسار إن أبقى الأعداد بعد شاشتها أو أفرغها قبل نهايتها
MATAV = """() => { const P = CUR && (PROG[CUR.id] || {}), b = [...document.querySelectorAll('.choices.nums .pick.num')].filter(x => !x.closest('[hidden]') && !x.closest('[data-done]'));
  if (!P || !b.length) return null; return { id: CUR.id, i: (P.resume || {}).stage, mat: PATH_MAT(), avoid: MAT_AVOID ? [...MAT_AVOID].sort((x, y) => x - y) : null,
    all: b.map(x => +x.dataset.k), ok: b.filter(x => x.dataset.ok === 'true').map(x => +x.dataset.k) }; }"""
MATEXP_JS = """import { matNums } from './build/d240.mjs'; import fs from 'fs'; const out = {};
for (const u of fs.readdirSync('content/m1')) for (const f of fs.readdirSync('content/m1/' + u)) { if (!/^d\\d+\\.json$/.test(f)) continue; const L = JSON.parse(fs.readFileSync('content/m1/' + u + '/' + f, 'utf8'));
  (L.flow || []).forEach((st, i) => { if (!st || !st.mat || !Array.isArray(st.mat.facts)) return; const N = [...matNums(st.mat.facts).nums].filter(n => n !== 10).sort((a, b) => a - b);
    const S = [i]; for (let j = i; L.flow[j] && L.flow[j].auto && j + 1 < L.flow.length; j++) S.push(j + 1); for (const j of S) (out[L.id] = out[L.id] || {})[j] = N; }); }
console.log(JSON.stringify(out));"""
TRACE = os.environ.get('TRACE')   # كل فعلٍ للسائق سطراً (لتتبّع انتظارٍ لا ينتهي)
# والهدف خارج نافذة الشريط المتحرّك (عربة القطار، بلاطة الطريق) مخفيّ لا يأخذ التركيز، كما يجب: فيحرّك السائق الشريط بزرّيه بلوحة المفاتيح أولاً
# كما يفعل الطفل، ثم يضغط Enter على الهدف (المجموعة كاملة بعد الفحص المستقل C2: العربة الجواب خارج النافذة في ثلاثة بنود من S1-U3)
KEYFOCUS = """() => { const e = window.__keyEl; if (!e) return false; e.focus(); return document.activeElement === e; }"""
PANKEY = """(k) => { const b = document.querySelector('#stage [data-panbtn=' + k + ']'); if (!b || getComputedStyle(b).visibility === 'hidden') return false; b.focus(); return document.activeElement === b; }"""
KEYGO = """() => { const e = window.__keyEl; window.__keyEl = null; if (e) e.dispatchEvent(new MouseEvent('click', { bubbles: true })); }"""
# والكلام المرسوم داخل المسرح: نصٌّ يخرج من إطار الرسم يُقصّ (الفحص المستقل B لبوابة S1-U4: «خطّ البداية» قُصّ من الأسفل على الشاشات العريضة)
CLIPT = """() => { const s = document.querySelector('#stage svg'); if (!s) return []; const R = s.getBoundingClientRect(); if (!R.width) return [];
  return [...s.querySelectorAll('text')].filter(t => t.textContent.trim() && !t.closest('[hidden]') && !t.closest('[clip-path]') && getComputedStyle(t).visibility !== 'hidden' && +getComputedStyle(t).opacity > .05).map(t => [t, t.getBoundingClientRect()])
    .filter(([t, b]) => { if (!b.width) return false; const fs = parseFloat(getComputedStyle(t).fontSize) * (s.getScreenCTM() ? s.getScreenCTM().a : 1);   /* إطار الخطّ أعلى من الحروف (الحركات): يُتسامح بثلثه أعلى وربعه أسفل */
    return b.left < R.left - 2 || b.right > R.right + 2 || b.top < R.top - .35 * fs || b.bottom > R.bottom + .25 * fs; }).map(([t, b]) => t.textContent.trim().slice(0, 24))
    /* وحلقة الجواب (okRing) داخل المسرح كلها (الفحص المستقل D2 لبوابة S1-U4 (10)) */
    .concat([...s.querySelectorAll('[data-ring]')].filter(g => { const b = g.getBoundingClientRect(); return b.width && (b.left < R.left - 1 || b.right > R.right + 1 || b.top < R.top - 1 || b.bottom > R.bottom + 1); }).map(() => 'حلقة الجواب')); }"""
# ولا يغطّي هدفٌ شارةَ عدٍّ تحته (الفحص المستقل D2 لبوابة S1-U4 (8): بطاقة الاختيار الوسطى على أسفل البرج وشارته «١» في فوضى S1-U2 د5): هدفٌ مرسوم بعد
# الشارة ولا يحويها يغطّي ربعها أو أكثر
COVERB = """() => { const s = document.querySelector('#stage svg'); if (!s) return []; const vis = e => !e.closest('[hidden]') && +getComputedStyle(e).opacity >= .5 && getComputedStyle(e).visibility !== 'hidden';
  const B = [...s.querySelectorAll('[data-badge]')].filter(vis), T = [...s.querySelectorAll('[role=button]')].filter(vis), out = [];
  /* وما يُرسم من الهدف وحده: منطقة لمسٍ شفّافة (خطّ شفّاف عريض، rect.hit) لا تغطّي شيئاً */
  const no = c => !c || c === 'none' || c === 'transparent' || /rgba\\([^)]*,\\s*0\\)$/.test(c);
  const painted = e => { if (e.matches('rect.hit') || e.closest('rect.hit')) return false; const cs = getComputedStyle(e); if (+cs.opacity < .05) return false;
    return (!no(cs.fill) && +cs.fillOpacity > .05 && !/^(line|polyline|g|svg|text)$/i.test(e.tagName)) || (!no(cs.stroke) && parseFloat(cs.strokeWidth) > 0 && +cs.strokeOpacity > .05) || /^(text|image)$/i.test(e.tagName); };
  const box = g => { let r = null; for (const e of [g, ...g.querySelectorAll('*')]) { if (/^(g|svg|title|desc)$/i.test(e.tagName) || !painted(e)) continue; const b = e.getBoundingClientRect(); if (!b.width && !b.height) continue;
      r = r ? { left: Math.min(r.left, b.left), top: Math.min(r.top, b.top), right: Math.max(r.right, b.right), bottom: Math.max(r.bottom, b.bottom) } : { left: b.left, top: b.top, right: b.right, bottom: b.bottom }; } return r; };
  for (const b of B) { const r = b.getBoundingClientRect(); if (!r.width) continue; for (const g of T) { if (g.contains(b) || !(b.compareDocumentPosition(g) & Node.DOCUMENT_POSITION_FOLLOWING)) continue;
      const q = box(g); if (!q) continue; const w = Math.min(r.right, q.right) - Math.max(r.left, q.left), h = Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top);
      if (w > 0 && h > 0 && w * h >= .25 * r.width * r.height) out.push((g.getAttribute('aria-label') || g.tagName).slice(0, 24) + ' على شارة «' + (b.textContent || '•') + '»'); } }
  return out; }"""
SQUEEZE = """() => { const s = document.querySelector('#stage svg'); if (!s) return null; const r = s.getBoundingClientRect(), vb = s.viewBox.baseVal; if (!vb || !vb.width || !r.width) return null;
  const live = [...s.querySelectorAll('[role=button]')].some(g => (g.onclick || getComputedStyle(g).cursor === 'grab') && !g.closest('[hidden]') && +getComputedStyle(g).opacity >= .5);
  const k = s.getScreenCTM().a, kw = r.width / vb.width; return k / kw < (live ? .75 : .6) ? [Math.round(100 * k / kw), Math.round(r.width), Math.round(r.height), (document.querySelector('#say') || {}).textContent.length, live ? 'targets' : 'view'] : null; }"""
CARDS = """() => { const c = [...document.querySelectorAll('.choices.cards .card')]; if (!c.length) return null;   /* بطاقتا فوضى: كلتاهما مخفية النص، ومتماثلتان بالنظر (D254 (1)) */
  if (!c.every(b => b.classList.contains('hidden-text'))) return 'card text visible'; return [...new Set(c.map(b => b.innerHTML))].length > 1 ? 'cards differ' : null; }"""
WATCH = """() => { window.__shown = []; const s = document.querySelector('#say'), b = document.querySelector('#bubble'); if (window.__obs) window.__obs.disconnect();   /* كل نصّ تظهره الفقاعة أثناء الإعادة */
  window.__obs = new MutationObserver(() => window.__shown.push([s.textContent, b.classList.contains('hidetext')])); window.__obs.observe(s, { childList: true, characterData: true, subtree: true }); }"""
LEAKED = """() => { const L = CUR && LDATA[CUR.id]; const w = L && L.chaos && L.chaos.wrong; if (!w) return null; const t = G(lineOf(w, L)[2]); if (window.__obs) window.__obs.disconnect();
  const x = (window.__shown || []).find(([s, h]) => !h && s === t); return x ? x[0] : null; }"""
# D256: كل حرف يقرؤه الطفل في الدرس (الفقاعة، والخيارات، والسلال، ونصوص الرسم) يرسمه المتصفح فعلاً بخط القراءة، لا ببديل من خطوط النظام
READ_FONT = 'Waha Naskh'; READ_SEL = '#say, .choices .pick, .bin, #stage svg text'
async def font_fallbacks(cdp):
  root = (await cdp.send('DOM.getDocument', {'depth': -1}))['root']['nodeId']; out = []
  for i in (await cdp.send('DOM.querySelectorAll', {'nodeId': root, 'selector': READ_SEL}))['nodeIds']:
    try: fs = (await cdp.send('CSS.getPlatformFontsForNode', {'nodeId': i}))['fonts']
    except Exception: continue
    other = [f['familyName'] for f in fs if f['familyName'] != READ_FONT]
    if other: out.append((tuple(other), (await cdp.send('DOM.getOuterHTML', {'nodeId': i}))['outerHTML'][:90]))
  return out

MATEXP = json.loads(__import__('subprocess').run(['node', '--input-type=module', '-e', MATEXP_JS], cwd=os.path.join(HERE, '..'), capture_output=True, text=True, check=True).stdout)
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); ctx = await b.new_context(**p.devices[os.environ.get('DEVICE', 'Pixel 5')],   # DEVICE: جهاز آخر (الشاشة القصيرة: iPhone SE، Galaxy S5)
                                      color_scheme='dark' if os.environ.get('DARK') == '1' else 'light'); pg = await ctx.new_page(); errs = []   # DARK=1: الوضع الليلي
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e) + ' | ' + ' <- '.join(l.strip().split(' (')[0].replace('at ', '') + ':' + l.rsplit(':', 2)[-2] for l in (e.stack or '').split('\n')[1:9]))); pg.on('console', lambda m: errs.append('console: ' + m.text) if (m.type == 'error' and 'ERR_TUNNEL' not in m.text and 'ERR_NAME' not in m.text) or (m.type == 'warning' and 'keyframe' in m.text.lower()) else None)   # الخط من الشبكة يفشل في البيئة المغلقة فلا يُعدّ
    cdp = await ctx.new_cdp_session(pg); await cdp.send('DOM.enable'); await cdp.send('CSS.enable'); fontfb = {}
    await pg.goto(URL); await pg.wait_for_timeout(500)
    await pg.evaluate("localStorage.setItem('hp_settings', JSON.stringify({sessionMax: 0}))"); await pg.reload(); await pg.wait_for_timeout(500)
    if SHOTS: await pg.screenshot(path=OUT + '/00_start.png')
    await pg.click('#startBtn'); await pg.wait_for_timeout(300)
    if SHOTS: await pg.screenshot(path=OUT + '/01_profile.png')
    await pg.click('.av[data-av="%s"]' % ('f3' if GENDER == 'f' else 'm2')); await pg.wait_for_timeout(200); await pg.click('#pSave'); await pg.wait_for_timeout(400)
    if SHOTS: await pg.screenshot(path=OUT + '/02_home.png')
    if os.environ.get('CHAL') == '1': await pg.evaluate("() => { const cp = choosePick; window.choosePick = choosePick = (opts, ok) => (opts.length === 2 && opts[1][0] === 'challenge') ? Promise.resolve('challenge') : cp(opts, ok); }")   # CHAL=1: «تحدٍّ» بدل التمرين العادي
    ONLY = [x for x in os.environ.get('ONLY', '').split(',') if x]   # ONLY=m1.u3.d1,ws:m1.u3,…: هذه الدروس والورش وحدها بالترتيب (والدروس كلها مفتوحة)
    ONLY_SET = {x for x in ONLY if not x.startswith('ws:')}
    tw_seen = {}; prev_twin = False
    if ONLY: await pg.evaluate("() => { PROG.unlockAll = true; saveProg(); showHome(); }"); await pg.wait_for_timeout(300)
    matd = {}; matq = [0]; small = {}; noname = {}; empty = {}; squeeze = {}; clipt = {}; coverb = {}; keyless = {}; knon = [0]; kasync = [0]; krace = [0]; kpress = [0]; kspace = [0]; kpan = [0]; taps = {}; leaks = []; failed_rev = {}; redo_seen = set(); replay_q = None; crashes = 0; seen_types = set(); deep = {}; failed_test = {}; shots = set(); report = []; lessons = 0
    visits = 0   # MAXL يعدّ الدروس وحدها (لا المراجعة ولا الورشة)، وسقف الزيارات كلها 200 حارس من حلقة
    while lessons < MAXL and visits < 200:
      if os.environ.get('ONLY'):
        if not ONLY: break
        nx = ONLY.pop(0); target = ['ws', nx[3:]] if nx.startswith('ws:') else ['lesson', nx]
      else: target = await pg.evaluate("""() => { const n = document.querySelector('.stop.now'); if (n) return n.dataset.lesson ? ['lesson', n.dataset.lesson] : n.dataset.review ? ['review', 'review'] : null;
        const w = document.querySelector('.stop.ws.must[aria-disabled=false]'); if (w) return ['ws', w.dataset.workshop]; return null; }""")
      if MODE == 'failreview' and not target is None and await pg.evaluate("() => Object.values(PROG.srs).some(r => Object.values(r.cs || {}).some(x => x.due != null && x.due > Date.now()))"):   # المراجعة تحين فوراً (لا ننتظر يوماً)
        await pg.evaluate("() => { Object.values(PROG.srs).forEach(r => Object.values(r.cs || {}).forEach(x => { if (x.due != null) x.due = Date.now() - 1; })); saveProg(); showHome(); }"); await pg.wait_for_timeout(200); continue
      if not target and MODE == 'replay' and replay_q is None:   # بعد المسار كله: يُعاد كل درس مرة في الجلسة نفسها (كشف حالة تبقى من التشغيل الأول)
        replay_q = await pg.evaluate("() => UNITS.flatMap(u => u.lessons)")
      if not target and replay_q: target = ['lesson', replay_q.pop(0)]
      if not target: break
      kind, tid = target
      if MODE == 'failreview': redo_seen.update(await pg.evaluate("() => Object.keys(PROG.redo || {})"))
      sel = '.stop[data-lesson="%s"]' % tid if kind == 'lesson' else '.stop.review' if kind == 'review' else '.stop.ws[data-workshop="%s"]' % tid
      await pg.evaluate("(s) => { const e = document.querySelector(s); if (e) e.scrollIntoView(); }", sel)   # محطة بعيدة في الخريطة (ONLY)
      await pg.click(sel); await pg.wait_for_timeout(200); lessons += kind == 'lesson'; visits += 1; t0 = time.time(); last_n = -1; idle = 0; steps = 0; stuck = False; acts = []
      while True:
        st = await pg.evaluate(STATE); steps += 1
        if st['twin'] and not prev_twin: tw_seen[tid] = tw_seen.get(tid, 0) + 1   # بداية بند توأم (يُعدّ هنا لا من السجلّ: السجلّ يحفظ آخر 800 محاولة)
        prev_twin = st['twin']
        if st['crash']: report.append([tid, 'CRASH', st['scene']]); await pg.screenshot(path=OUT + '/crash_%s.png' % tid.replace('.', '_')); await pg.click('#crashOk'); crashes += 1; break
        if st['home'] and not st['covers']: break
        sc = st['scene']
        if len(acts) > 900: stuck = True; report.append([tid, 'LOOP', sc, st['say'][:60], st['auto']]); await pg.screenshot(path=OUT + '/loop_%s.png' % tid.replace('.', '_')); break   # حلقة بلا نهاية: أفعال كثيرة في درس واحد
        if sc not in shots:
          shots.add(sc); await pg.wait_for_timeout(120)
          if SHOTS: await pg.screenshot(path=OUT + '/s_' + sc.replace(':', '__').replace('.', '_') + '.png')
          sm = await pg.evaluate(SMALL)                 # أهداف اللمس: 56 للطفل (D246)، و44 لرابط الكبار وما في اللوحة
          for x in sm: small.setdefault(tuple(x[:1]), (sc, x))
        if 'exitCover' in st['covers']: await pg.click('#rsGo'); continue
        a = st['auto']
        if a and a['n'] != last_n:
          for x in await pg.evaluate(SMALL): small.setdefault(tuple(x[:1]) + (a['kind'],), (sc, x))   # كل انتظار لفعل الطفل: أهدافه الآن
          for x in await pg.evaluate(NONAME): noname.setdefault((x, a['kind']), sc)
          for x in await pg.evaluate(EMPTY): empty.setdefault((sc, a['kind'], x), 0)
          for x in await pg.evaluate(CLIPT): clipt.setdefault((sc, a['kind'], x), 0)
          for x in await pg.evaluate(COVERB): coverb.setdefault((sc, a['kind'], x), 0)
          for x in await pg.evaluate(KEYLESS): keyless.setdefault((sc, a['kind'], x), 0)   # لوحة المفاتيح لكل هدف في الوحدات كلها (مواصفة المحرّك 8؛ كان للوحدة الرابعة ثم صار عامّاً بـ kbdStage)
          if a['kind'] == 'num':
            mv = await pg.evaluate(MATAV)
            if mv:
              exp = (MATEXP.get(mv['id'], {}).get(str(mv['i'])) or None) if mv['mat'] else None; have = mv['avoid'] or None
              if exp: matq[0] += 1
              if exp != have: matd.setdefault((tid, sc, 'MAT_AVOID %s والمتوقَّع %s' % (have, exp)), 0)
              hit = [k for k in mv['all'] if exp and k in exp and k not in mv['ok']]
              if hit: matd.setdefault((tid, sc, 'الخيارات %s، وأعداد «معي» %s: %s' % (mv['all'], exp, hit)), 0)
              if exp and len(mv['all']) < 3: matd.setdefault((tid, sc, 'الخيارات %s أقلّ من ثلاثة بعد تجنّب أعداد «معي» %s' % (mv['all'], exp)), 0)   # الفحص المستقل I2 (7)
          sq = await pg.evaluate(SQUEEZE)
          if sq: squeeze.setdefault((sc, a['kind'], st['q']), sq)
          for x in await pg.evaluate(TAPS): taps.setdefault((sc, a['kind']) + tuple(x), 0); taps[(sc, a['kind']) + tuple(x)] += 1
          for fam, html in await font_fallbacks(cdp): fontfb.setdefault((fam, html), sc)
          last_n = a['n']; how = 'ok'
          if sc.endswith(':bag') or (a['kind'] == 'pick' and 'bag' in sc): how = 'bag'
          elif MODE == 'mixed' and st['mode'] in ('practice', 'explore') and st['itype'] and st['itype'] not in seen_types: seen_types.add(st['itype']); how = 'wrong'
          elif MODE == 'deep' and st['mode'] == 'practice' and st['itype'] and deep.get(st['itype'], 0) < 4: deep[st['itype']] = deep.get(st['itype'], 0) + 1; how = 'wrong'
          elif MODE == 'deepall' and st['mode'] == 'practice' and st['itype'] and not st['twin'] and deep.get((tid, st['scene'], st['q'], a['kind']), 0) < 4: deep[(tid, st['scene'], st['q'], a['kind'])] = deep.get((tid, st['scene'], st['q'], a['kind']), 0) + 1; how = 'wrong'   # كل بند بمساعدة: الدرجات الأربع والكشف ثم التوأم (صحيحاً)
          elif MODE == 'remedialdeep' and st['mode'] == 'mastery': how = 'wrong'   # الإتقان يخفق فيُشغَّل العلاج، وبنوده بالدرجات الأربع ثم التوأم
          elif MODE == 'remedialdeep' and st['mode'] == 'remedial' and st['itype'] and not st['twin'] and deep.get((tid, st['scene'], st['q'], a['kind']), 0) < 4: deep[(tid, st['scene'], st['q'], a['kind'])] = deep.get((tid, st['scene'], st['q'], a['kind']), 0) + 1; how = 'wrong'
          elif MODE == 'failtest' and st['mode'] == 'test' and failed_test.setdefault(sc.split(':')[0], 0) < 3: failed_test[sc.split(':')[0]] += 1; how = 'wrong'
          elif MODE == 'failmastery' and st['mode'] == 'mastery': how = 'wrong'
          elif MODE == 'failreview' and st['mode'] == 'review':   # المبدأ 14: خطأ في بند ثم في البند الثاني ← إعادة الدرس (بالبنود لا بالانتظارات، فالبند ذو الخطوات الكثيرة خطأ واحد)
            aid = await pg.evaluate("() => { const it = window.__item; if (!it) return null; if (!it.__aid) it.__aid = (window.__aidN = (window.__aidN || 0) + 1); return it.__aid; }")
            fr = failed_rev.setdefault(sc.split(':')[0] + ':' + (await pg.evaluate("() => (CUR && CUR.id) || ''")), set())
            if aid in fr: how = 'wrong'
            elif aid is not None and len(fr) < 2: fr.add(aid); how = 'wrong'
          if a['kind'] == 'card' and sc.endswith(':chaos'):   # D236: «أعد الجملة» أثناء البطاقتين لا يكشف جملة فوضى نصاً، والبطاقتان مخفيتان ومتماثلتان بالنظر
            cv = await pg.evaluate(CARDS)
            if cv: leaks.append((sc, cv))
            await pg.wait_for_timeout(300)              # «أعد الجملة» والخاطئة آخر ما قيل، أياً كان ترتيب البطاقتين (الدرس 98: هكذا ظهر الخطأ القديم)
            await pg.evaluate("() => { const L = CUR && LDATA[CUR.id]; if (L && L.chaos && L.chaos.wrong) { const [who, id, text] = lineOf(L.chaos.wrong, L); lastLine = { who, id, text, lesson: CUR.id, hideText: true }; } }")
            await pg.evaluate(WATCH); await pg.click('#replay'); await pg.wait_for_timeout(30); await pg.click('#replay')   # ثم مرة ثانية تقطع الأولى، وتُراقَب الفقاعة طوال القراءة
            for _ in range(40):
              if not await pg.evaluate("() => speechBusy()"): break
              await pg.wait_for_timeout(25)
            lk = await pg.evaluate(LEAKED)
            if lk: leaks.append((sc, lk))
          ko = await pg.evaluate(KEYOK) if how == 'ok' and a['n'] % 2 == 0 else None
          if ko == -1 and await pg.evaluate("() => !!document.querySelector('#stage [data-panbtn]')"):
            for k in ('fwd', 'back'):
              for _ in range(8):
                if not await pg.evaluate(PANKEY, k): break
                await pg.keyboard.press('Enter'); kpan[0] += 1; await pg.wait_for_timeout(500)
                if await pg.evaluate(KEYFOCUS): ko = 1; break
              if ko == 1: break
          if ko == 1:
            # والمسافة في نصف الضغطات، ثم ما سُجّل بعد المفتاح جوابٌ صحيح (الفحص المستقل D2 لبوابة S1-U4 (3، 4): لا مسافة في أي فحص، وطفرة «المفتاح يلمس الهدف التالي»
            # نجت لأن الانتظار انتهى بلمسةٍ خاطئة)
            key = 'Space' if kpress[0] % 2 else 'Enter'; na, asy = await pg.evaluate("() => { window.__actG = undefined; return [LOG.attempts.length, !!window.__keyAsync]; }")
            # ومفتاحٌ غير مفتاحي الفعل لا يفعل شيئاً: حرفٌ وEscape وTab، ثم يعود التركيز إلى الهدف (الفحص المستقل J2 (8): صيغ قراءة المفتاح في lint تُحصى ولا تُغلق،
            # و«!==» جعلت كل مفتاحٍ غير المذكور مفتاحَ فعل؛ فالحارس في التشغيل يرى ما فعله المفتاح أياً كانت صيغته)
            moved = None; kasync[0] += asy
            for nk in (() if asy else ('KeyA', 'Escape', 'Tab')):
              await pg.keyboard.press(nk); await pg.wait_for_timeout(80); knon[0] += 1
              if await pg.evaluate("([n, k]) => !window.__auto || window.__auto.n !== n || LOG.attempts.length !== k", [a['n'], na]): moved = nk; break
            if moved: keyless.setdefault((sc, a['kind'], moved + ' (غير مفتاح الفعل) فعل شيئاً'), 0); acts.append((sc, a['kind'], how)); idle = 0; await pg.wait_for_timeout(40); continue
            if not asy and not await pg.evaluate(KEYFOCUS): keyless.setdefault((sc, a['kind'], 'لا يعود إليه التركيز بعد Tab'), 0); await pg.evaluate(KEYGO); acts.append((sc, a['kind'], how)); idle = 0; await pg.wait_for_timeout(40); continue
            if asy and KEY_DELAY: await pg.wait_for_timeout(KEY_DELAY)   # لإعادة إنتاج السباق عمداً (KEY_DELAY=100)
            await pg.keyboard.press(key); kdone = False; kpress[0] += 1; kspace[0] += key == 'Space'
            for _ in range(60):
              if await pg.evaluate("(n) => !window.__auto || window.__auto.n !== n", a['n']): kdone = True; break
              await pg.wait_for_timeout(25)
            if not kdone: keyless.setdefault((sc, a['kind'], key + ' لا يجيب: ' + (await pg.evaluate("() => window.__keyEl && (window.__keyEl.getAttribute('aria-label') || window.__keyEl.tagName)") or '')), 0); await pg.evaluate(KEYGO)
            else:
              # ما اختاره المفتاح: في «المس واحداً» (tapOne) الهدفُ نفسه الذي يلمسه الحلّ (والتوقّع لا جواب له، فلا يُحكم بما سُجّل)؛ وفي غيره لا خطأ يُسجَّل بعده
              same = await pg.evaluate("() => window.__actG === undefined ? null : window.__actG === window.__keyEl")
              if same is False: keyless.setdefault((sc, a['kind'], key + ' لمس غير هدفه'), 0)
              elif same is None:
                wr = await pg.evaluate("(n) => LOG.attempts.slice(n).filter(x => x.ok === false).map(x => x.scene + ':' + (x.tag || ''))", na)
                if wr and asy and await pg.evaluate("() => window.__race === true"): krace[0] += 1   # سبق الحلُّ المتتابع المفتاح: لا حكم على المفتاح
                elif wr: keyless.setdefault((sc, a['kind'], key + ' لمس غير الحلّ: ' + ','.join(wr)[:60]), 0)
          elif ko == -1: keyless.setdefault((sc, a['kind'], 'لا يأخذ التركيز'), 0); await pg.evaluate(KEYGO)
          elif ko == 0: pass                              # حلّه الآلي شُغّل (ولمساته الموقوفة أُعيدت)
          elif how == 'bag': await pg.evaluate("""(p) => { const b = [...document.querySelectorAll('.choices .pick')]; (b.find(x => x.dataset.k === p) || b[0]).click(); }""", PATH)
          else: await pg.evaluate("(h) => { const a = window.__auto; if (a) (h === 'wrong' && a.wrong ? a.wrong : a.ok)(); }", how)
          acts.append((sc, a['kind'], how)); idle = 0
          if TRACE: print('  >', tid, sc, a['kind'], a['n'], how, ko, flush=True)
          await pg.wait_for_timeout(40); continue
        if st['go']: await pg.click('#go'); idle = 0; await pg.wait_for_timeout(30); continue
        idle += 1; await pg.wait_for_timeout(50)
        if idle > 300: stuck = True; report.append([tid, 'STUCK', sc, st['say'][:60], st['auto']]); await pg.screenshot(path=OUT + '/stuck_%s.png' % tid.replace('.', '_')); break
      prog = await pg.evaluate("(id) => { const k = Object.keys(localStorage).find(k => k.startsWith('hp_prog:')); const P = JSON.parse(localStorage.getItem(k) || '{}'); return P[id] || null; }", tid)
      report.append([tid, 'done' if not stuck else 'stuck', round(time.time() - t0, 1), 'acts=%d' % len(acts), json.dumps({k: prog.get(k) for k in ('done', 'mastered', 'deferred', 'entry', 'path', 'score', 'of')} if prog else None, ensure_ascii=False)])
      print('..', *report[-1], flush=True)              # تقدّم مرئي أثناء التشغيل الطويل
      if stuck or crashes > 2: break
    errlog = await pg.evaluate("() => { const k = Object.keys(localStorage).find(k => k.startsWith('hp_log:')); const L = JSON.parse(localStorage.getItem(k) || '{}'); return (L.errors || []).map(e => e.scene + ' ' + e.msg.split('file:').map((x,i)=>i? x.slice(x.indexOf('.html:')+6):x).join('@').slice(0, 900)); }")
    bad = await pg.evaluate("() => { const k = Object.keys(localStorage).find(k => k.startsWith('hp_log:')); const L = JSON.parse(localStorage.getItem(k) || '{}'); return (L.attempts || []).filter(a => a.ok === false && /^(mastery|test|review)/.test(a.scene || '')).map(a => [a.lesson, a.scene, a.type, a.tag, JSON.stringify(a.ans), a.err]); }")
    print('unnamed targets:', len(noname)); [print(' ', k, v) for k, v in list(noname.items())[:20]]
    print('tap conflicts:', len(taps)); [print(' ', v, *k) for k, v in list(taps.items())[:20]]
    if MODE == 'failreview': print('redo lessons (two review errors):', sorted(redo_seen), 'still pending:', await pg.evaluate("() => Object.keys(PROG.redo || {})"))
    print('chaos leaks:', len(leaks)); [print(' ', *x) for x in leaks[:10]]
    print('font fallbacks:', len(fontfb)); [print(' ', v, *k) for k, v in list(fontfb.items())[:20]]
    print('assessment misses:', len(bad)); [print(' ', *x) for x in bad[:40]]
    # التوأم (الفحص المستقل B، المبدأ 5): في deepall وremedialdeep لكل بند بلغ الكشف (أربعة أخطاء) توأمٌ يُحلّ من أول محاولة، في درسه
    want = {}
    for key in {k[:3] for k, n in deep.items() if isinstance(k, tuple) and n >= 4}: want[key[0]] = want.get(key[0], 0) + 1   # البند بمرحلتين (لوّن ثم المس) يُعدّ مرة
    missing = sum(max(0, n - tw_seen.get(t, 0)) for t, n in want.items()) if MODE in ('deepall', 'remedialdeep') else 0
    print('twins: %d twin items in %d lessons; items revealed: %d' % (sum(tw_seen.values()), len(tw_seen), sum(want.values())))
    print('twins missing:', missing); [print(' ', t, 'revealed', n, 'twins', tw_seen.get(t, 0)) for t, n in want.items() if n > tw_seen.get(t, 0)]
    clips = set(await pg.evaluate("() => window.__clips || []"))
    ids = set(json.load(open(os.path.join(HERE, '..', 'dist', 'script_m1.xlsx.ids.json'))))
    miss = sorted(clips - ids)                       # كل جملة منطوقة لها سطر في جدول التسجيل (القسم 12 من الميثاق)
    print('clips spoken: %d unique, %d of %d recording ids; NOT in script: %d' % (len(clips), len(clips & ids), len(ids), len(miss))); [print('  ', m) for m in miss[:20]]
    all_ids = await pg.evaluate("() => UNITS.flatMap(u => u.lessons)")   # كل درس انتهى، ولا درس توقّف أو دار في حلقة أو انهار (الفحص المستقل الخامس، ج1)
    blocked = [r for r in report if r[1] in ('CRASH', 'LOOP', 'STUCK', 'stuck')]; not_done = [i for i in all_ids if (not ONLY_SET or i in ONLY_SET) and not any(r[0] == i and r[1] == 'done' for r in report)]
    if os.environ.get('CLIPS_OUT'): json.dump(sorted(clips), open(os.environ['CLIPS_OUT'], 'w'))   # تجمعها test/unspoken.py: جمل لم تُنطق في أي تشغيل
    # وما كتبه المسار كله يجتاز قواعد التخزين المتداخلة (الفحص الخصم A05): نسخته الاحتياطية تُقبل، وفتحه من جديد لا يُسقط شيئاً
    VALID = "() => { const c = backupCheck(JSON.stringify(backupData())); const bad = []; for (const k of backupKeysNow()) { const v = JSON.parse(localStorage.getItem(k)); const b = []; BACKUP_RULE[backupKind(k)](v, b, k); bad.push(...b); } return { ok: !!c.ok, why: c.why || null, at: c.at || null, bad: bad.slice(0, 8), repaired: STORE_ISSUES.repaired }; }"
    sv1 = await pg.evaluate(VALID); await pg.goto('about:blank'); await pg.goto(URL); await pg.wait_for_timeout(600); sv2 = await pg.evaluate(VALID)
    store_bad = [x for x in (sv1, sv2) if not x['ok'] or x['bad'] or x['repaired']]
    await pg.screenshot(path=OUT + '/99_home.png'); await b.close()
    for r in report: print(*r)
    print('storage invalid:', len(store_bad)); [print(' ', json.dumps(x, ensure_ascii=False)[:400]) for x in store_bad]
    print('errors:', len(errs)); [print(' ', e[:400]) for e in errs[:30]]
    print('LOG.errors:', len(errlog)); [print(' ', e) for e in errlog[:20]]
    print('small targets:', len(small)); [print(' ', *v) for v in list(small.values())[:30]]
    print('empty drags:', len(empty)); [print(' ', *k) for k in list(empty)[:20]]
    print('squeezed stages:', len(squeeze)); [print(' ', *k, v) for k, v in list(squeeze.items())[:30]]
    print('clipped texts:', len(clipt)); [print(' ', *k) for k in list(clipt)[:20]]
    print('covered badges:', len(coverb)); [print(' ', *k) for k in list(coverb)[:20]]
    if lessons and not kpress[0]: keyless.setdefault(('-', 'tap', 'لم يُضغط Enter حقيقي على أي هدف'), 0)   # فلا ينجح العدّاد فارغاً
    if lessons and kpress[0] > 1 and not kspace[0]: keyless.setdefault(('-', 'tap', 'لم تُضغط المسافة على أي هدف'), 0)
    if lessons and kpress[0] and not knon[0]: keyless.setdefault(('-', 'tap', 'لم يُضغط مفتاحٌ غير مفتاح الفعل على أي هدف'), 0)
    print('keyless targets:', len(keyless), '(مفتاح حقيقي على %d هدفاً، منها %d بالمسافة، وعلى زرّي الشريط %d مرة، ومفتاحٌ غير مفتاح الفعل %d مرة، وهدفٌ حلُّه متتابع بمفتاح الفعل وحده %d مرة، سبقه حلُّه فيها %d)' % (kpress[0], kspace[0], kpan[0], knon[0], kasync[0], krace[0])); [print(' ', *k) for k in list(keyless)[:60]]
    if PATH == 'mat' and lessons > 3 and not matq[0]: matd.setdefault(('-', '-', 'لم يُرَ سؤال عددي بعد «معي»'), 0)
    print('mat distractors:', len(matd), '(أسئلة عددية بعد «معي»: %d)' % matq[0]); [print('  «معي»:', *k) for k in list(matd)[:20]]
    print('blocked lessons:', len(blocked)); [print(' ', *r) for r in blocked[:20]]
    print('lessons not done:', len(not_done) if MAXL >= len(all_ids) else 0, not_done if MAXL >= len(all_ids) else '(MAXL)')
    # STRICT=1 (لفحص الفحوص، الدرس 98): يخرج بـ 1 إن كان في العدّادات شيء، كما تحكم خلاصة المجموعة
    # والعدّادان الجديدان والتوائم المفقودة كما في الخلاصة (طفرة «تسمية الشيء تحت المسرح» نجت لأن STRICT لم يعدّ النصوص المقصوصة)
    # وأخطاء التقييم في نمط «ok» (كل جواب صحيح فيه): خطأٌ هنا لمسةٌ ذهبت إلى غير هدفها (الفحص المستقل D2 لبوابة S1-U4 (4))
    return int(bool(errs or errlog or small or empty or squeeze or blocked or taps or noname or leaks or fontfb or miss or clipt or coverb or keyless or missing or matd or (bad and MODE == 'ok')))
rc = asyncio.run(main())
if os.environ.get('STRICT') == '1': sys.exit(rc or 0)
