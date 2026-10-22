// D240 «صلاحية التقييم» في فحص المحتوى: ما يُقيَّم (الإتقان والمراجعة المحجوزة والبند المشتبك واختبار الوحدة) لا يكون شيئاً
// رآه الطفل أو حلّه في الدرس نفسه (أو في درس البند المشتبك أو بند الاختبار).
// يُقارَن «موضوع» البند (ما يحكم عليه الطفل) بثلاث طرق:
//  1) بالاسم: مولّد التقييم لا يظهر في أي موضع من الدرس (مثال محلول، واكتشاف، وإشعال، وتمرين ولعبة، وفوضى، وتذكّر وعلاج، وتوأم).
//  2) بالهيئة في المهمة نفسها: نوع الشكل أو المجسّم، والوضع، والشيء، والدوران، والنسبة؛ فمربع مائل عُدّت رؤوسه في «صحّح لفوضى»
//     لا يُعاد مربعاً مائلاً تُعدّ رؤوسه في الإتقان. والمهام: تصنيف، وعدّ، ووجوه، ودفع.
//  3) بالنصّ: بند تقييم يطابق بنداً عُرض (بعد حذف مفاتيح الصياغة كالسؤال والتعليل).
// والحقيبة ومشهد المواد خارج ذلك: صور أشياء البيت الحقيقية التي يمسكها الطفل، فرؤيتها في التقييم انتقال من الشيء إلى صورته.
// ومولّدات العدّ الصغيرة (…S) مستثناة لأنها وحدات عدّ لا أشكال تُحكم. واستثناء بند بعينه يُكتب في البند نفسه: x240 = السبب، فيظهر تنبيهاً.
// وفوق ذلك (D240 «لكل مفهوم بند تعرّف وبند إنتاج أو تعليل»): لكل مفهوم يتقنه التطبيق بند إنتاج أو تعليل واحد على الأقل، ولكل مفهوم
// «تأسيس» في الدرس فحص إتقان (إلا «المدخل»)، ولكل درس اختيار حقيقي للطفل (D239).

const PROD = new Set(['reason', 'connect', 'completeRect', 'vertices', 'count', 'produce', 'fill', 'trace', 'buildTower', 'splitMake', 'buildTo', 'faceTap',
  'split', 'join', 'remove', 'eqPair', 'unknownStart', 'fact', 'story']);
const TASK = { sort: 'cls', pick: 'cls', pickAll: 'cls', paint: 'cls', yesno: 'cls', reason: 'cls', count: 'cnt', vertices: 'cnt', faceTap: 'face', property: 'push' };
const FMT = new Set(['how', 'q', 'line', 'prompt', 'why', 'err', 'errs', 'names', 'tag', 'x240', 'c']);   // مفاتيح الصياغة لا الجوهر

const num = s => { const m = String(s).match(/^R\((-?[\d.]+),\s*(-?[\d.]+)\)$/); if (m) { const a = +m[1], b = +m[2]; return Math.max(Math.abs(a), Math.abs(b)) < 20 ? 0 : (a + b) / 2; } return s !== '' && s != null && isFinite(+s) ? +s : null; };
function rotClass(base, r) {
  if (r == null) return '0'; if (r === 'var') return 'var';
  if (['circle', 'sphere'].includes(base)) return '0';
  if (['rect', 'oval'].includes(base)) r = ((r % 180) + 180) % 180;   /* المستطيل والبيضاوي يتطابقان بنصف دورة: 180° هي 0° */
  let a = ((r % 360) + 540) % 360 - 180; if (['square', 'cube'].includes(base)) a = ((a % 90) + 135) % 90 - 45;
  const A = Math.abs(a); return A < 20 ? '0' : Math.abs(A - 180) < 20 ? '180' : Math.abs(A - 90) < 20 ? '90' : 'tilt';
}
function aspect(w, h, r) { if (w == null || h == null) return 'even'; let q = w / h; if (r != null && r !== 'var' && Math.abs(Math.abs((((r % 180) + 180) % 180) - 90)) < 20) q = 1 / q; return q > 1.25 ? 'wide' : q < .8 ? 'tall' : 'even'; }
const sigOf = (base, pose, object, rot, w, h) => { if (base === 'oval' && w == null) { w = 1.55; h = 1; }   /* البيضاوي نائم بطبعه، فالدوران يجعله واقفاً */
  const rc = rotClass(base, rot); const asp = aspect(w, h, rot);
  return [base, pose || '', object || '', ['rect', 'oval', 'quad'].includes(base) && rc === '90' ? '0' : rc, asp].join('|'); };

/* هيئة كل مولّد من سطر تعريفه في MK وMK2 (تُقرأ من الكود نفسه، فلا قائمة ثانية تتقادم) */
export function makerSigs(code) {
  const out = {};
  for (const m of code.matchAll(/^const (MK|MK2) = \{\n([\s\S]*?)\n\};/gm)) for (const line of m[2].split('\n')) {
    const k = line.match(/^\s{2}(\w+): \(([^)]*)\) => \(\{(.*)\}\),?/); if (!k) continue; const body = k[3];
    const g = rx => { const x = body.match(rx); return x ? x[1] : null; };
    const base = g(/\b(?:solid|type): '(\w+)'/) || (g(/\bdraw: '(\w+)'/) ? 'sheet-' + g(/\bdraw: '(\w+)'/) : '?');
    let rot = g(/\brot: ((?:[^,(){}]|\([^)]*\))+)/); const argRot = rot && /\?\?/.test(rot) && k[2].trim();
    if (rot) rot = argRot ? 'arg:' + (num(rot.split('??')[1].trim()) ?? 'var') : (num(rot.trim()) ?? 'var');
    const w = num((g(/\bw: (R\([^)]*\)|[\d.]+)/) || '').trim()), h = num((g(/\bh: (R\([^)]*\)|[\d.]+)/) || '').trim());
    const col = g(/\bcolor: '(#[0-9a-fA-F]{6})'/) || (g(/\bcolor: MAT\.(\w+)/) ? 'MAT.' + g(/\bcolor: MAT\.(\w+)/) : null);
    out[k[1]] = { base, pose: g(/\bpose: '(\w+)'/), object: g(/\bobject: '(\w+)'/), kind: g(/\bkind: '(\w+)'/), color: col, rot, w, h };
  }
  return out;
}

/* CIEDE2000 بين لونين سداسيين (D253 (3)): ما يُصنَّف لا يقترب لونه من لون سلّته الصحيحة (ΔE ≥ 12)، فلا يُحلّ بمطابقة اللون */
function lab(hex) { const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v > .04045 ? ((v + .055) / 1.055) ** 2.4 : v / 12.92);
  const X = (c[0] * .4124 + c[1] * .3576 + c[2] * .1805) / .95047, Y = c[0] * .2126 + c[1] * .7152 + c[2] * .0722, Z = (c[0] * .0193 + c[1] * .1192 + c[2] * .9505) / 1.08883;
  const f = t => t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116; return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))]; }
export function dE2000(h1, h2) { const [L1, a1, b1] = lab(h1), [L2, a2, b2] = lab(h2), r = Math.PI / 180;
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cm = (C1 + C2) / 2, G = .5 * (1 - Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)));
  const A1 = a1 * (1 + G), A2 = a2 * (1 + G), c1 = Math.hypot(A1, b1), c2 = Math.hypot(A2, b2); const hh = (b, a) => { const h = Math.atan2(b, a) / r; return h < 0 ? h + 360 : h; };
  const h1_ = hh(b1, A1), h2_ = hh(b2, A2), dL = L2 - L1, dC = c2 - c1; let dh = h2_ - h1_; if (c1 * c2 === 0) dh = 0; else if (dh > 180) dh -= 360; else if (dh < -180) dh += 360;
  const dH = 2 * Math.sqrt(c1 * c2) * Math.sin(dh / 2 * r), Lm = (L1 + L2) / 2, cm = (c1 + c2) / 2; let hm = h1_ + h2_; if (c1 * c2 !== 0) hm = Math.abs(h1_ - h2_) > 180 ? (hm < 360 ? hm + 360 : hm - 360) / 2 : hm / 2;
  const T = 1 - .17 * Math.cos((hm - 30) * r) + .24 * Math.cos(2 * hm * r) + .32 * Math.cos((3 * hm + 6) * r) - .2 * Math.cos((4 * hm - 63) * r);
  const SL = 1 + .015 * (Lm - 50) ** 2 / Math.sqrt(20 + (Lm - 50) ** 2), SC = 1 + .045 * cm, SH = 1 + .015 * cm * T, RT = -2 * Math.sqrt(cm ** 7 / (cm ** 7 + 25 ** 7)) * Math.sin(60 * Math.exp(-(((hm - 275) / 25) ** 2)) * r);
  return Math.sqrt((dL / SL) ** 2 + (dC / SC) ** 2 + (dH / SH) ** 2 + RT * (dC / SC) * (dH / SH)); }

export function d240(lessons, code, MAKERS) {
  const errors = [], notes = [];
  const MS = makerSigs(code);
  const isSmall = n => /S$/.test(n) && MAKERS.has(n);
  /* مرجع (اسم، أو [اسم، وسيط]، أو مواصفة مضمَّنة) ← { name, sig } */
  const ref = r => {
    if (typeof r === 'string') { if (!MAKERS.has(r)) return null; const d = MS[r]; return { name: r, sig: d ? sigOf(d.base, d.pose, d.object, d.rot && String(d.rot).startsWith('arg:') ? (num(String(d.rot).slice(4)) ?? 'var') : d.rot, d.w, d.h) : null }; }
    if (Array.isArray(r) && typeof r[0] === 'string') { const x = ref(r[0]); if (!x) return null; const d = MS[r[0]];
      if (d && d.rot && String(d.rot).startsWith('arg:') && isFinite(+r[1])) x.sig = sigOf(d.base, d.pose, d.object, +r[1], d.w, d.h); return x; }
    if (r && typeof r === 'object' && (r.solid || r.type || r.sheet)) return { name: null, sig: sigOf(r.solid || r.type || ('sheet-' + r.draw), r.pose, r.object, r.rot ?? null, r.w ?? null, r.h ?? null) };
    return null;
  };
  /* موضوع بند التقييم: ما يحكم عليه الطفل. وفي «نعم أم لا» و«لماذا» الصورة سياق والحكم على السؤال، فيُقارَن البند كله بنصّه */
  const subjects = it => {
    const t = it.t; const L = [];
    if (['sort', 'faceTap', 'property', 'same', 'produce', 'groups'].includes(t)) L.push(it.mk);
    else if (t === 'pick' && Array.isArray(it.opts) && it.ans != null) L.push(it.opts[it.ans]);
    else if (t === 'pickAll') L.push(...(it.objs || []));
    else if (t === 'paint') L.push(...(it.shapes || []));
    else if (t === 'count' || t === 'vertices') L.push(it.shape ?? it.objs);
    return L.map(ref).filter(x => x && !(x.name && isSmall(x.name)));
  };
  const norm = it => JSON.stringify(Object.fromEntries(Object.entries(it).filter(([k]) => !FMT.has(k)).sort(([a], [b]) => a < b ? -1 : 1)));
  /* الحقيقة العددية: المسألة نفسها بأعدادها وجوابها، وإن اختلف العرض (غطاء، رفّان، حجم المكعبات) أو نوع البند (D253 (1)، الفحص المستقل الثالث):
     الضمّ «4 ومعه 3» والجملة «4 + 3» والقصة «4 + 3» مسألة جمع واحدة (add|3,4)، و«7 أُخذ منها 2» والجملة «7 − 2» مسألة طرح واحدة (sub|7|2)،
     وتفكيك 6 إلى 4 و2 (الرفّان، والزوج المتساوي) مسألة واحدة (part|6|2,4)، والمقارنة بين عددين واحدة أياً كان الترتيب والسؤال.
     فلا يتكرّر الجواب نفسه بالأعداد نفسها بين ما عُرض وما يُقيَّم. أما الشيء الحقيقي تمثيلاً للشكل المجرّد فمسموح (انتقال مقصود في م1).
     والأرقام (مطابقة، ولمس، وتتبّع، وملء، وإخراج) بنوعها وعددها: الأرقام عشرة كلها تُعلَّم في الدرس، فالسؤال نفسه هو المكرّر لا الرقم.
     والعدّ (count) بعدده بين التقييمات وحدها (الإتقان والمراجعة والاختبار): عدُّ أشياء أخرى في الاكتشاف أداءٌ جديد للعدّ، أما الجواب نفسه في تقييمين فيمرّ بالتذكّر */
  const s2 = (a, b) => [a, b].sort((x, y) => x - y).join(',');
  const opFact = (op, a, b) => op === '+' ? `add|${s2(a, b)}` : (op === '-' || op === '−') ? `sub|${a}|${b}` : null;
  const fact = it => { const t = it.t;
    if (t === 'split') return `part|${it.n}|${s2(it.k, it.n - it.k)}`;
    if (t === 'eqPair') return `part|${it.n}|${s2(...(it.parts || []))}`;
    if (t === 'compare' || t === 'cmpDigits') return `${t}|${s2(it.a, it.b)}`;
    if (t === 'join') return `add|${s2(it.a, it.b)}`;
    if (t === 'remove') return `sub|${it.a}|${it.b}`;
    if (t === 'fact' || t === 'sentence' || t === 'story') return opFact(it.op, it.a, it.b) || `${t}|${it.op}|${it.a}|${it.b}`;
    if (t === 'buildTo') return `buildTo|${it.target}|${it.start}`;
    if (t === 'unknownStart') return `unknownStart|${it.took}|${it.left}`;
    if (t === 'buildTower') return `buildTower|${it.ref}|${it.want || 'same'}`;
    if (t === 'count' && it.objs && it.n != null) return `count|${it.n}`;   /* عدّ أشياء (لا رؤوس شكل: تلك خاصيته) */
    if (t === 'same') return `same|${it.n}|${it.add || 0}`;
    if (t === 'fill') return `fill|${it.n}`;
    if (t === 'digitMatch' || t === 'digitPick' || t === 'trace' || t === 'produce') return `${t}|${it.n}`;   /* «المس ٠» أو «ضع 7» بالعدد نفسه سؤال واحد */
    return null; };
  /* وما يعرضه المشهد بجوابه من مسائل عددية (الفحص المستقل الثالث): لكل مشهد عددي سطر هنا، ولخطوات المثال المحلول STEP_FACTS */
  const SCENE_FACTS = {
    shelvesWalk: s => Array.from({ length: Math.max(0, s.n - 1) }, (_, i) => `part|${s.n}|${s2(i + 1, s.n - i - 1)}`),
    mailExplore: s => (s.boxes || []).map(b => `digitMatch|${b.n}`),
    takeHook: s => [`sub|${s.a}|${s.b}`],
    towersPredict: s => [`compare|${s2(s.a || 4, s.b || 6)}`],
    spread: s => [`same|${s.n || 5}|0`],
    towerBuild: s => [`buildTo|${s.goal}|0`],
    traceIntro: s => (s.digits || []).map(d => `trace|${d}`),   /* تتبّع الرقمين في الاكتشاف (الفحص المستقل الرابع) */
  };
  const STEP_FACTS = grp => { const out = []; const T = [];
    for (const s of grp) { if (!s || typeof s !== 'object') continue;
      if (Array.isArray(s.sentence)) { const [a, op, b] = s.sentence; const f = opFact(op, a, b); if (f) out.push(f); }
      if (Array.isArray(s.towers)) T.push(...s.towers.map(x => x[0]));
      if (Array.isArray(s.towers2)) for (const [k, , , base] of s.towers2) if (base != null) out.push(`add|${s2(base, k)}`);
      if (Array.isArray(s.card)) out.push(`digitMatch|${s.card[2]}`); }
    if (grp.some(s => s && s.pair) && T.length >= 2) out.push(`compare|${s2(T[0], T[1])}`);
    return out; };
  /* ما يرسمه المشهد بنفسه (لا من بياناته) من أشياء لها مولّد: عجلات العربتين في الإشعال، وبابا الزرافة. لكل مشهد في الكود سطر هنا (ولو فارغاً)، فلا يُضاف مشهد يرسم شيئاً دون أن يراه الفحص */
  const SCENE_DRAWS = { cartsRace: [['wheel', 'cls']], giraffeDoors: [['door', 'cls']] };
  const SCENE_NONE = ['items', 'material', 'lines', 'steps', 'trace', 'roofFit', 'countModel', 'chaosDouble', 'houseMatch', 'compareAlign', 'scatterHook', 'huntSort', 'spread', 'mailHook', 'mailExplore', 'digitCards', 'traceIntro', 'robot', 'reviewCards', 'stoneHook',
    'bagFeel', 'pushLab', 'poses', 'faceLab', 'coneRoll', 'cylRoll', 'towersPredict', 'paperPush', 'stampLab', 'towerBuild', 'mosque', 'takeHook', 'facesCount', 'roomHunt', 'feelBox', 'shelvesWalk'];
  for (const m of code.matchAll(/^SCENES\.(\w+) = /gm)) if (!SCENE_DRAWS[m[1]] && !SCENE_NONE.includes(m[1])) errors.push(`المشهد ${m[1]} غير مسجَّل في SCENE_DRAWS أو SCENE_NONE في build/d240.mjs: هل يرسم شيئاً له مولّد؟ (D253 (1))`);
  /* ما رآه الطفل أو حلّه في درس: أسماء، وهيئات لكل مهمة، ونصوص البنود */
  const SKIPK = new Set(['lines', 'labels', 'talk', 'adultCard', 'bag', 'mat', 'concepts', 'riddles', 'title', 'icon', 'id', 'unit']);
  const MKKEYS = new Set(['mk', 'show', 'shape', 'objs', 'opts', 'shapes', 'objects', 'things', 'items']);
  function shownOf(L, withRecall, solved = {}) {
    const names = new Map(), sigs = { cls: new Map(), cnt: new Map(), face: new Map(), push: new Map() }, items = new Map(), facts = new Map();
    let nameOK = true;   /* ما حُلّ في تقييم سابق يُقارَن بهيئته في المهمة وبنصّه وبمسألته، لا باسم مولّده: الشيء نفسه في مهمة أخرى سؤال آخر */
    const put = (r, tasks, where) => { const x = ref(r); if (!x) return; if (nameOK && x.name && !isSmall(x.name)) names.set(x.name, where); if (x.sig) for (const t of tasks) if (!sigs[t].has(x.sig)) sigs[t].set(x.sig, where); };
    const ALL = ['cls', 'cnt', 'face', 'push'];
    /* مهمة الطفل في كل مشهد: ما عُدّت رؤوسه غير ما لُمست وجوهه غير ما دُفع */
    const SCENE_T = { faceLab: ['face', 'cls'], facesCount: ['face', 'cls'], stampLab: ['face', 'cls'], pushLab: ['push', 'cls'], towerBuild: ['push', 'cls'],
      trace: ['cnt', 'cls'], countModel: ['cnt', 'cls'], chaosDouble: ['cnt', 'cls'], spread: ['cnt', 'cls'], steps: ['cls', 'cnt'] };
    const CHAOS_T = { countVertices: 'cnt', countSides: 'cnt', faces: 'face' };
    const visit = (v, where, tasks, key) => {
      if (typeof v === 'string') { if (MKKEYS.has(key)) put(v, tasks, where); return; }
      if (Array.isArray(v)) { if (MKKEYS.has(key) && typeof v[0] === 'string' && MAKERS.has(v[0])) put(v, tasks, where); v.forEach(x => visit(x, where, tasks, key)); return; }
      if (!v || typeof v !== 'object') return;
      if (v.solid || v.type || v.sheet) put(v, tasks, where);
      let T = tasks;
      if (typeof v.t === 'string') { items.set(norm(v), where); const f = fact(v); if (f && !facts.has(f) && !(nameOK && f.startsWith('count|'))) facts.set(f, where); T = [TASK[v.t] || 'cls']; for (const s of subjects(v)) { if (nameOK && s.name) names.set(s.name, where); if (s.sig) sigs[T[0]].set(s.sig, where); } }
      if (typeof v.scene === 'string') { T = SCENE_T[v.scene] || ['cls']; for (const [m, ts] of SCENE_DRAWS[v.scene] || []) put(m, [ts], where + ' (يرسمه المشهد)');
        const addF = f => { if (f && !facts.has(f)) facts.set(f, where + ' (يعرضه المشهد)'); };
        if (SCENE_FACTS[v.scene]) SCENE_FACTS[v.scene](v).forEach(addF);
        if (v.scene === 'steps' && Array.isArray(v.steps)) v.steps.forEach(g => STEP_FACTS(Array.isArray(g) ? g : [g]).forEach(addF)); }
      for (const [k, x] of Object.entries(v)) if (!SKIPK.has(k)) visit(x, where, T, k);
    };
    L.flow.forEach((st, i) => { if (!['mastery', 'test'].includes(st.s)) visit(st, `${st.s}${st.scene ? ':' + st.scene : ''} (${i})`, ALL, null); });
    if (L.practice) visit(L.practice, 'التمرين', ['cls'], null);
    if (L.chaos) visit(L.chaos, 'فوضى', ['cls', ...(CHAOS_T[L.chaos.check] ? [CHAOS_T[L.chaos.check]] : [])], null);
    if (L.mastery) { if (withRecall) visit(L.mastery.recall || {}, 'التذكّر', ['cls', 'cnt'], null); visit(L.mastery.remedial || {}, 'العلاج', ['cls'], null); }
    if (L.sort && L.sort.twins) visit(L.sort.twins, 'التوأم', ['cls'], null);
    /* وما حلّه الطفل في التقييم نفسه: الإتقان قبل المراجعة، والإتقان والمراجعة قبل البند المشتبك والاختبار */
    nameOK = false;
    if (solved.mastery && L.mastery) visit(L.mastery.concepts, 'الإتقان', ['cls'], null);
    if (solved.review && L.review) visit(L.review, solved.reviewLabel || 'المراجعة', ['cls'], null);
    return { names, sigs, items, facts };
  }
  /* التذكّر يأتي بعد الدورة الأولى من الإتقان، فلا يُحسب «معروضاً» قبلها؛ ويُحسب للمراجعة والبند المشتبك والاختبار */
  const SH = {}, SHM = {}, SHR = {}, SHA = {};
  for (const L of Object.values(lessons)) { SHM[L.id] = shownOf(L, false); SHR[L.id] = shownOf(L, true, { mastery: true }); SHA[L.id] = shownOf(L, true, { mastery: true, review: true }); }
  /* stage: 'mastery' (قبل التذكّر)، و'review' (بعد الإتقان)، و'after' (البند المشتبك والاختبار: بعد الإتقان والمراجعة) */
  function check(L, it, where, against, stage) {
    const t = TASK[it.t] || 'cls'; const out = [];
    for (const S of against) { const sh = (stage === 'mastery' ? SHM : stage === 'review' ? SHR : SHA)[S.id]; const tag = S.id === L.id ? '' : ` من ${S.id}`;
      for (const s of subjects(it)) {
        if (s.name && sh.names.has(s.name)) out.push(`المولّد «${s.name}» في ${where} ظهر في ${sh.names.get(s.name)}${tag}`);
        else if (s.sig && sh.sigs[t].has(s.sig)) out.push(`${where}: هيئة «${s.name || s.sig}» نفسها في المهمة نفسها في ${sh.sigs[t].get(s.sig)}${tag}`);
      }
      if (sh.items.has(norm(it))) out.push(`${where}: البند نفسه في ${sh.items.get(norm(it))}${tag}`);
      else if (fact(it) && sh.facts.has(fact(it))) out.push(`${where}: المسألة العددية نفسها (${fact(it)}) في ${sh.facts.get(fact(it))}${tag}`);
    }
    for (const o of out) (it.x240 ? notes : errors).push(`${L.id}: ${o}${it.x240 ? ' — مستثنى: ' + it.x240 : ''} (D240)`);
  }
  for (const L of Object.values(lessons)) {
    const M = L.mastery;
    if (M) { for (const [C, items] of Object.entries(M.concepts)) items.forEach((it, i) => check(L, it, `إتقان ${C}[${i}]`, [L], 'mastery'));
      if (M.mixed && lessons[M.mixed.lesson]) check(L, M.mixed.item, 'البند المشتبك', [lessons[M.mixed.lesson]], 'after'); }
    (L.review || []).forEach((it, i) => check(L, it, `المراجعة[${i}]`, [L], 'review'));
    if (L.test) { /* وبنود الوحدة المشتبكة حُلّت قبل الاختبار أيضاً، وإن كانت من درس آخر */
      const mx = { id: L.unit + ':mixed', flow: [], review: Object.values(lessons).filter(x => x.unit === L.unit && x.mastery && x.mastery.mixed).map(x => x.mastery.mixed.item) };
      SHA[mx.id] = shownOf(mx, true, { review: true, reviewLabel: 'بند مشتبك' });
      /* وبند الاختبار يُقارَن بدروس الوحدة كلها لا بدرسه وحده (الفحص المستقل الرابع: الظرف جواب t3 بعد أن فُرز في تمرين الدرس 4) */
      for (const q of L.test.items) if (lessons[q.of]) check(L, q.item, `الاختبار ${q.id}`, [...Object.values(lessons).filter(x => x.unit === L.unit), mx], 'after'); }
    // لكل مفهوم يتقنه التطبيق بند إنتاج أو تعليل
    if (M) for (const [C, items] of Object.entries(M.concepts)) if (!(M.entryOnly || []).includes(C) && !items.some(it => PROD.has(it.t))) errors.push(`${L.id}: المفهوم ${C} بلا بند إنتاج أو تعليل في الإتقان (D240)`);
    // كل مفهوم «تأسيس» في الدرس له فحص إتقان
    for (const [C, name] of Object.entries(L.concepts || {})) if (!/مدخل/.test(name) && !L.test && !(M && M.concepts[C])) errors.push(`${L.id}: المفهوم ${C} تأسيسٌ بلا فحص إتقان (D240)`);
    // D41: ما يُصنَّف لا يُرسم بلون الهوية (لون الرفيق أو الشكل)، وإلا حُلّت السلّة بمطابقة اللون
    const idColor = s => s && typeof s === 'object' && typeof s.color === 'string' && /^\$(solid|id)\./.test(s.color);
    for (const p of (L.chaos && L.chaos.placed) || []) if (idColor(p.mk)) errors.push(`${L.id}: شيء في «صحّح لفوضى» بلون الهوية ${p.mk.color} (D41)`);
    const clsVisit = (v, where) => { if (Array.isArray(v)) return v.forEach(x => clsVisit(x, where)); if (!v || typeof v !== 'object') return;
      if (v.t === 'sort' && idColor(v.mk)) errors.push(`${L.id}: بند فرز بلون الهوية في ${where} (D41)`);
      if ((v.t === 'pick' || v.t === 'pickAll') && (v.opts || v.objs || []).some(idColor)) errors.push(`${L.id}: خيار بلون الهوية في ${where} (D41)`);
      for (const [k, x] of Object.entries(v)) if (!['lines', 'labels'].includes(k)) clsVisit(x, where); };
    clsVisit([L.practice, L.mastery && L.mastery.concepts, L.mastery && L.mastery.remedial, L.review, L.test, L.flow, L.sort && L.sort.twins], 'البنود');
    // D253 (1): مخزون المراجعة محجوز في الوحدة كلها: مولّد بند المراجعة لا يظهر في درس آخر من وحدته (ولا في توأم ولا في اختبار)، فلا يُحلّ أو يُقال جوابه بين موعدَي مراجعته
    /* بالشيء لا باسم المولّد (الفحص المستقل الثالث): الظرف المائل والظرف شيء واحد بمولّدين، والشيء نفسه في مهمة أخرى سؤال آخر فيُفحص بنوع المجسّم أو الشكل مع الشيء */
    for (const [i, it] of (L.review || []).entries()) for (const s of subjects(it)) { if (!s.name) continue; const obj = MS[s.name] && MS[s.name].object; const base = MS[s.name] && MS[s.name].base;
      const same = n => n === s.name || (obj && MS[n] && MS[n].object === obj && MS[n].base === base);
      for (const O of Object.values(lessons)) { if (O.unit !== L.unit || O.id === L.id) continue;   /* في درسه نفسه يكفي فحص الهيئة في المهمة (التقييم بعد الإتقان) */ const where = usesMaker(O, same, O.id === L.id ? it : null); if (where) errors.push(`${L.id}: مولّد المراجعة[${i}] «${s.name}» (${obj ? 'الشيء ' + obj : 'بالاسم'}) يظهر في ${O.id === L.id ? 'درسه' : O.id}: ${where} (D253 (1)، المراجعة محجوزة في الوحدة)`); } }
    // المبدأ 14: كل بند مراجعة يسمّي مفهومه، ولكل مفهوم يُراجَع بندان على الأقل، فيكون البند الثاني الفوري بعد الخطأ من المفهوم نفسه
    if (L.review && L.review.length) { const per = {};
      L.review.forEach((it, i) => { if (!it.c || !(L.concepts || {})[it.c]) errors.push(`${L.id}: بند المراجعة[${i}] بلا مفهوم من مفاهيم الدرس (c) (المبدأ 14)`); else per[it.c] = (per[it.c] || 0) + 1; });
      for (const [C, n] of Object.entries(per)) if (n < 2) errors.push(`${L.id}: المفهوم ${C} له بند مراجعة واحد، فلا بند ثانٍ فورياً منه بعد الخطأ (المبدأ 14)`); }
    // D239: اختيار حقيقي في كل درس
    if (!(L.practice && L.practice.challenge && L.practice.challenge.length && L.flow.some(s => s.s === 'practice'))) errors.push(`${L.id}: لا اختيار «تمرين عادي أم تحدٍّ» في الدرس (D239)`);
  }
  /* D253 (3) بالألوان الحرفية: كل مولّد له شيء ولون ثابت (لا من الألوان المحايدة) يبتعد عن لون هوية نوعه ΔE2000 ≥ 12؛ ألوان الهوية من الكود نفسه */
  { const ID = {}; for (const m of code.matchAll(/--(circle|square|triangle|rect): (#[0-9a-fA-F]{6})/g)) ID[m[1]] ??= m[2];
    const sc = code.match(/const SOLIDC = \{([^}]*)\}/); if (sc) for (const m of sc[1].matchAll(/(\w+): '(#[0-9a-fA-F]{6})'/g)) ID[m[1]] = m[2];
    const MATC = {}; const mt = code.match(/const MAT = \{([^}]*)\}/); if (mt) for (const m of mt[1].matchAll(/(\w+): '(#[0-9a-fA-F]{6})'/g)) MATC[m[1]] = m[2];
    for (const [name, d] of Object.entries(MS)) { if (!d.color || !d.kind || !ID[d.kind]) continue; const hex = d.color.startsWith('MAT.') ? MATC[d.color.slice(4)] : d.color; if (!hex) continue;
      const e = dE2000(hex, ID[d.kind]); if (e < 12) errors.push(`المولّد «${name}» لونه ${hex} على ΔE ${e.toFixed(1)} من لون هوية سلّته (${d.kind} ${ID[d.kind]})، فيُحلّ بمطابقة اللون (D253 (3)، D41)`); } }
  /* هل يظهر المولّد (أو شقيقه بالشيء نفسه) في الدرس، في أي موضع غير بند المراجعة نفسه؟ يعيد أول موضع في مفاتيح الأشياء وفيما ترسمه المشاهد (الجمل لا تُفحص) */
  function usesMaker(O, same, self) { let at = null; if (typeof same === 'string') { const n0 = same; same = n => n === n0; }
    const walk = (v, path, key) => { if (at) return; if (v === self) return;
      if (typeof v === 'string') { if (MKKEYS.has(key) && same(v)) at = path; return; }
      if (Array.isArray(v)) { if (MKKEYS.has(key) && typeof v[0] === 'string' && same(v[0])) { at = path; return; } v.forEach((x, i) => walk(x, path + '[' + i + ']', key)); return; }
      if (!v || typeof v !== 'object') return; if (typeof v.scene === 'string') for (const [m] of SCENE_DRAWS[v.scene] || []) if (same(m)) { at = path + ' (يرسمه المشهد)'; return; }
      for (const [k, x] of Object.entries(v)) if (!['lines', 'labels', 'talk', 'adultCard', 'bag', 'riddles'].includes(k) && !(path === '' && k === 'concepts')) walk(x, path + '.' + k, k); };   /* concepts في رأس الدرس أسماء، وفي الإتقان بنود */
    walk(O, '', null); return at; }
  /* أداة للمؤلّف: D240_DUMP=m1.u1.d2 node build/lint.mjs يطبع ما رآه الطفل وحلّه في الدرس (أسماء وهيئات لكل مهمة)، لاختيار بند جديد */
  if (typeof process !== 'undefined' && process.env.D240_DUMP) for (const id of process.env.D240_DUMP.split(',')) if (SHA[id])
    console.error(id, JSON.stringify({ names: [...SHA[id].names.keys()], ...Object.fromEntries(Object.entries(SHA[id].sigs).map(([t, m]) => [t, [...m.keys()]])), facts: [...SHA[id].facts.keys()] }));
  return { errors, notes };
}
