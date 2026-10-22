// فحوص المحتوى (D246، D240): تُشغَّل قبل كل بناء وتوقفه عند أي مخالفة.
//  1) الجمل: نصّ غير فارغ، وصيغتا المخاطبة كاملتان، ولا أرقام مكتوبة في جملة منطوقة (العدد كلمةً، D229)، ولا معرّف بنصّين
//  2) JS: لا جملة منطوقة مكتوبة في الكود، ولا Math.random إلا بعلامة rng-ok، وكل gen.* وكل تسمية وكل وسم خطأ في الكود موجود في المحتوى
//  3) الدروس: كل معرّف جملة في بيانات الدرس موجود، وكل مولّد وكل نوع بند وكل مشهد معروف، ومراحل المسار مكتملة البيانات
//  4) D240: ما يُقيَّم لم يُعرض ولم يُحلّ في الدرس (build/d240.mjs)، ولكل مفهوم ثلاثة بنود منها إنتاج أو تعليل، ومشهد فوضى بخطأ واحد؛ وD239: اختيار في كل درس
//  5) D232: رأس HTML كامل ولا تحميل من الشبكة إلا رابط الخط غير الحاجب
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectClips, GEN_RX } from './clips.mjs';
import { d240, makerSigs } from './d240.mjs';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(p, 'utf8');
const AR = /[؀-ۿ]/;
const SKIP = new Set(['lines', 'labels', 'concepts', 'talk', 'title', 'adultCard', 'id', 'unit', 'icon', 'riddles']);
const REF_ONE = ['mk', 'show', 'shape'], REF_MANY = ['objs', 'opts', 'shapes', 'objects', 'things', 'items'];
const STAGES = new Set(['hook', 'explore', 'worked', 'practice', 'game', 'chaos', 'mastery', 'test', 'wrap']);

export function lint(content, js) {
  const errors = [], warn = [];
  const { clips, problems } = collectClips(content); for (const p of problems) errors.push(p.join(' | '));
  const LINES = new Map(clips.map(c => [c.full, c]));
  // 1) الجمل
  for (const c of clips) {
    if (!String(c.text).trim()) errors.push('نصّ فارغ: ' + c.full);
    for (const m of c.text.matchAll(GEN_RX)) if (!m[1].trim() || !m[2].trim()) errors.push(`صيغة مخاطبة ناقصة في ${c.full}: ${m[0]}`);
    const bare = c.text.replace(GEN_RX, ''); if (/[{}|]/.test(bare)) errors.push(`أقواس أو شرطة شاردة في ${c.full}: ${c.text}`);
    if (/[0-9٠-٩]/.test(c.text)) errors.push(`أرقام مكتوبة في جملة منطوقة (العدد كلمةً): ${c.full}`);
    const words = c.text.replace(GEN_RX, '$1').split(/\s+/).filter(Boolean).length; if (words > 30) warn.push(`جملة طويلة (${words} كلمة) لطفل في السادسة: ${c.full}`);
  }
  // 2) JS
  const code = js.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1');
  for (const m of code.matchAll(/\b(?:say|S)\(\s*(?:'(?:compass|chaos)'\s*,\s*'[^']*'\s*,\s*)?'([^']*)'/g)) if (AR.test(m[1])) errors.push('جملة منطوقة مكتوبة في الكود: ' + m[1].slice(0, 40));
  js.split('\n').forEach((l, i) => { if (/Math\.random\(/.test(l) && !/rng-ok/.test(l)) errors.push('Math.random بلا علامة rng-ok في السطر ' + (i + 1)); });
  // تعليق سطر بعده كود في السطر نفسه يبتلع الكود صامتاً (وقع مرتين في بوابة هـ): التعليق داخل السطر يُكتب بين علامتي التعليق الكتلي
  const SWALLOW = /\b(await|const|let|return|if|else)\b\s|\w\([^)]*\);|\};|\)\s*;\s*\w/;
  const swallowIn = (txt, name) => txt.split('\n').forEach((l, i) => { const m = l.match(/\s\/\/\s(.*)$/); if (m && SWALLOW.test(m[1])) errors.push('كود بعد تعليق السطر (يُبتلع) في ' + name + ' السطر ' + (i + 1) + ': ' + m[1].slice(0, 50)); });
  swallowIn(js, 'src/js'); for (const f of readdirSync(join(ROOT, 'build')).filter(f => f.endsWith('.mjs'))) swallowIn(read(join(ROOT, 'build', f)), 'build/' + f);
  const genKeys = [...LINES.keys()].filter(k => k.startsWith('gen.'));
  for (const m of code.matchAll(/'(gen\.[\w.]*)'/g)) { const id = m[1];
    if (id.endsWith('.')) { if (!genKeys.some(k => k.startsWith(id))) errors.push('بادئة جملة بلا جمل في المحتوى: ' + id); }
    else if (!LINES.has(id)) errors.push('جملة غير موجودة في المحتوى: ' + id); }
  const lessons = {}; for (const u of content.units) for (const l of u.lessons) lessons[l.id] = { ...l, unit: u.id };
  const labelKeys = new Set([...Object.keys(content.labels.ui || {}), ...Object.values(lessons).flatMap(l => Object.keys(l.labels || {}))]);
  for (const m of code.matchAll(/\blabel(?:Text)?\('([\w.]+)'\)/g)) if (!labelKeys.has(m[1])) errors.push('تسمية غير موجودة في labels: ' + m[1]);
  const ERR = content.errors;
  for (const m of code.matchAll(/\berr: '(\w+)'/g)) if (!ERR[m[1]]) errors.push(`الكود يسجّل err '${m[1]}' وليس في errors.json`);
  for (const m of code.matchAll(/err: [^,;]*\? '(\w+)' : '(\w+)'/g)) for (const t of [m[1], m[2]]) if (!ERR[t]) errors.push(`الكود يسجّل err '${t}' وليس في errors.json`);
  for (const [tag, e] of Object.entries(ERR)) { if (!e.label) errors.push('وسم بلا اسم للكبار: ' + tag);
    for (const [id, t] of Object.entries(e.q || {})) { if (!id.startsWith('gen.err.' + tag + '.')) errors.push('معرّف سؤال الخطأ لا يتبع gen.err.<الوسم>: ' + id); if (!/[؟?]/.test(t)) warn.push(`السؤال الأول للخطأ ليس سؤالاً (D240): ${id}`); }
    if (e.vis && !new RegExp('\\b' + e.vis + ': ').test(code)) errors.push(`حركة الأداة ${e.vis} للوسم ${tag} غير معرّفة في VIS`); }
  const ITEMS = new Set([...code.matchAll(/^ITEM\.(\w+) = /gm)].map(m => m[1]));
  const SCENES = new Set([...code.matchAll(/^SCENES\.(\w+) = /gm)].map(m => m[1]));
  const VIS = new Set([...code.matchAll(/^\s{2}(\w+): (?:async )?\(/gm)].map(m => m[1]));
  const MAKERS = new Set(); for (const m of code.matchAll(/^const (MK|MK2) = \{\n([\s\S]*?)\n\};/gm)) for (const k of m[2].matchAll(/^\s{2}(\w+): /gm)) MAKERS.add(k[1]);
  for (const l of Object.values(lessons)) for (const k of Object.keys(l.riddles || {})) { if (MAKERS.has(k)) errors.push('اسم لغز يكرّر مولّداً: ' + k); MAKERS.add(k); }
  const isMaker = r => typeof r === 'string' ? MAKERS.has(r) : Array.isArray(r) ? MAKERS.has(r[0]) : !!r && typeof r === 'object';
  // 3) الدروس
  const lineOk = (L, id) => id.startsWith('gen.') ? LINES.has(id) : LINES.has(L.id + '.' + id);
  for (const L of Object.values(lessons)) {
    const bad = new Set(); let LL = L;
    const walk = (v, path, key) => {
      if (typeof v === 'string') {
        if (/^[a-z][\w]*(\.[\w]+)+$/.test(v) && !/^m\d+\.u\d+(\.d\d+)?$/.test(v) && !/^\$/.test(v) && !lineOk(LL, v)) bad.add(`${L.id}: جملة غير موجودة «${v}» في ${path}`);
        if (REF_ONE.includes(key) && !/\./.test(v) && !isMaker(v)) bad.add(`${L.id}: مولّد غير معروف «${v}» في ${path}`);
        return; }
      if (Array.isArray(v)) { if (REF_MANY.includes(key)) v.forEach((x, i) => { if ((typeof x === 'string' && !/\./.test(x)) || (Array.isArray(x) && typeof x[0] === 'string' && !/\./.test(x[0]))) { if (!isMaker(x)) bad.add(`${L.id}: مولّد غير معروف ${JSON.stringify(x)} في ${path}[${i}]`); } });
        v.forEach((x, i) => walk(x, path + '[' + i + ']', key)); return; }
      if (v && typeof v === 'object') {
        if (typeof v.t === 'string' && !ITEMS.has(v.t)) bad.add(`${L.id}: نوع بند غير معروف «${v.t}» في ${path}`);
        if (v.t === 'sort' && v.mk === undefined) bad.add(`${L.id}: بند فرز بلا mk في ${path}`);
        if (v.t === 'splitMake' && new Set((v.avoid || []).map(p => Math.min(...p))).size >= Math.floor(v.n / 2) + 1) bad.add(`${L.id}: بند «لوّن بطريقة جديدة» بلا طريقة جديدة ممكنة في ${path}`);
        if (Array.isArray(v.mk) || (typeof v.mk === 'string' && !isMaker(v.mk))) { if (!isMaker(v.mk)) bad.add(`${L.id}: مولّد غير معروف ${JSON.stringify(v.mk)} في ${path}`); }
        for (const [k, x] of Object.entries(v)) if (!(path === '' && SKIP.has(k)) && !(k === 'bag' && false)) walk(x, path + '.' + k, k);
      }
    };
    const { bag, ...rest } = L; const mixed = rest.mastery && rest.mastery.mixed; if (mixed) rest.mastery = { ...rest.mastery, mixed: undefined }; walk(rest, '', null);
    if (mixed && lessons[mixed.lesson]) { const M = lessons[mixed.lesson]; LL = M; walk(mixed.item, '.mastery.mixed(' + M.id + ')', null); LL = L; }   /* البند المشتبك يُحكم بإعدادات درسه وجمله */
    if (bag) { walk({ ask: bag.ask }, '.bag', null); (bag.items || []).forEach((r, i) => { if (typeof r === 'string' && !isMaker(r)) bad.add(`${L.id}: مولّد غير معروف في الحقيبة ${r}`); if (r && r.label && !(L.labels || {})[r.label] && !content.labels.ui[r.label]) bad.add(`${L.id}: تسمية حقيبة غير موجودة ${r.label}`); }); }
    for (const b of bad) errors.push(b);
    // المسار
    if (!Array.isArray(L.flow) || !L.flow.length) { errors.push(`${L.id}: لا مسار flow`); continue; }
    for (const [i, st] of L.flow.entries()) {
      if (!STAGES.has(st.s)) errors.push(`${L.id}: مرحلة غير معروفة «${st.s}» (${i})`);
      if (st.scene && !SCENES.has(st.scene)) errors.push(`${L.id}: مشهد غير معروف «${st.scene}»`);
      if (!st.scene && ['hook', 'explore', 'worked', 'game'].includes(st.s) && !st.items) errors.push(`${L.id}: مرحلة ${st.s} بلا مشهد`);
      if (st.s === 'practice' && !(L.practice && L.practice.normal && L.practice.normal.length)) errors.push(`${L.id}: مرحلة التمرين بلا practice.normal`);
      if (st.s === 'chaos' && !(L.chaos && L.chaos.right && L.chaos.wrong)) errors.push(`${L.id}: مرحلة فوضى بلا جملتين`);
      if (st.s === 'chaos' && L.chaos && L.chaos.kind === 'scene' && !SCENES.has(L.chaos.scene)) errors.push(`${L.id}: مشهد فوضى غير معروف «${L.chaos.scene}»`);
      if (st.s === 'mastery' && !(L.mastery && L.mastery.concepts)) errors.push(`${L.id}: مرحلة الإتقان بلا مفاهيم`);
      if (st.s === 'test' && !(L.test && L.test.items && L.test.items.length >= 8)) errors.push(`${L.id}: اختبار الوحدة أقل من ثمانية بنود`);
      if (st.s === 'wrap' && !(L.wrap && L.wrap.lines)) errors.push(`${L.id}: الختام بلا جمل`);
    }
    if (L.flow[L.flow.length - 1].s !== 'wrap') errors.push(`${L.id}: آخر مرحلة ليست الختام`);
    if (L.flow.some(s => s.s === 'practice') && !L.flow.some(s => s.s === 'mastery' || s.s === 'test')) errors.push(`${L.id}: تمرين بلا فحص إتقان ولا اختبار`);
    // 4) D240
    if (L.chaos && L.chaos.kind === 'bins' && L.chaos.placed.filter(p => p.wrong).length !== 1) errors.push(`${L.id}: مشهد فوضى يحتاج خطأً واحداً بالضبط`);
    if (L.chaos && L.chaos.wrong && LINES.get(L.id + '.' + L.chaos.wrong) && LINES.get(L.id + '.' + L.chaos.wrong).who !== 'chaos') errors.push(`${L.id}: جملة فوضى الخاطئة بغير صوت فوضى`);
    if (L.mastery) { for (const [C, items] of Object.entries(L.mastery.concepts)) { if (!(L.concepts || {})[C]) errors.push(`${L.id}: مفهوم ${C} في الإتقان بلا اسم في concepts`); if (items.length < 3) errors.push(`${L.id}: مفهوم ${C} بأقل من ثلاثة بنود`); }
      if (L.mastery.mixed && !lessons[L.mastery.mixed.lesson]) errors.push(`${L.id}: البند المشتبك يشير إلى درس غير موجود`); }
    if (!L.test && !(L.review && L.review.length)) warn.push(`${L.id}: لا مخزون مراجعة محجوز`);
    if (L.test) for (const q of L.test.items) { if (!lessons[q.of] || lessons[q.of].unit !== L.unit) errors.push(`${L.id}: البند ${q.id} يشير إلى درس خارج الوحدة: ${q.of}`); }
  }
  { const r = d240(lessons, code + '\n' + read(join(ROOT, 'src', 'styles.css')), MAKERS);   /* والأنماط لألوان الهوية (D253 (3)) */ errors.push(...r.errors); warn.push(...r.notes); }   /* D240 وD239: build/d240.mjs */
  /* أسماء الأشياء المنطوقة وتعليل «لا سلّة لنوعه»: كل جملة منها يبلغها المحتوى، وكل ما يبلغه المحتوى له جملته (فلا تسجيل لا يُسمع، ولا اسم يسكت) */
  { const objOf = {}, kindOf = {}; for (const m of code.matchAll(/^\s{2}(\w+): \([^)]*\) => \(\{(.*)\}\),?/gm)) { const o = m[2].match(/label: objLabel\('(\w+)'\)/), k = m[2].match(/\bkind: '(\w+)'/); if (o) objOf[m[1]] = o[1]; if (k) kindOf[m[1]] = k[1]; }
    const needObj = new Set(), needKind = new Set(); const nm = r => typeof r === 'string' ? r : Array.isArray(r) ? r[0] : null;
    const walk = v => { if (Array.isArray(v)) return v.forEach(walk); if (!v || typeof v !== 'object') return;
      if (v.t === 'sort' || v.t === 'property') { const n = nm(v.mk); if (n && objOf[n]) needObj.add(objOf[n]); if (v.t === 'sort' && v.bins && n && kindOf[n] && !v.bins.includes(kindOf[n]) && kindOf[n] !== 'other' && !v.kindOf) needKind.add(kindOf[n]); }
      if (v.t === 'pickAll' && v.names) for (const r of v.objs || []) { const n = nm(r); if (n && objOf[n]) needObj.add(objOf[n]); }
      for (const [k, x] of Object.entries(v)) if (k !== 'lines') walk(x); };
    for (const L of Object.values(lessons)) walk(L);
    const genIds = Object.keys(content.gen.lines || {});
    for (const k of needObj) if (!LINES.has('gen.obj.' + k)) errors.push(`اسم الشيء «${k}» يُنطق ولا جملة له: gen.obj.${k}`);
    for (const id of genIds.filter(i => i.startsWith('gen.obj.'))) if (!needObj.has(id.slice(8))) errors.push(`جملة لا يبلغها المحتوى (تسجيل لا يُسمع): ${id}`);
    for (const k of needKind) if (!LINES.has('gen.why.notHere.' + k)) errors.push(`تعليل «لا سلّة لنوعه» بلا جملة: gen.why.notHere.${k}`);
    for (const id of genIds.filter(i => i.startsWith('gen.why.notHere.'))) if (!needKind.has(id.slice(16))) errors.push(`جملة لا يبلغها المحتوى (تسجيل لا يُسمع): ${id}`);
    /* والخيارات المقروءة: ما يسمّيه الكود صراحةً، وخيارات كيس اللمس، وأوعية التلوين، ويتدحرج/يقف في مختبر الدفع (بصيغتيه) */
    const needOpt = new Set(['rolls', 'stays', 'rollsF', 'staysF']); for (const m of code.matchAll(/'gen\.opt\.([\w.]*\w)'/g)) needOpt.add(m[1]);   /* لا البادئة 'gen.opt.paint.' */
    const walkO = v => { if (Array.isArray(v)) return v.forEach(walkO); if (!v || typeof v !== 'object') return; if (v.scene === 'feelBox') (v.opts || []).forEach(o => needOpt.add(o)); if (v.t === 'paint') (v.pots || []).forEach(k => needOpt.add('paint.' + k));
      for (const [k, x] of Object.entries(v)) if (k !== 'lines') walkO(x); };
    for (const L of Object.values(lessons)) walkO(L);
    for (const k of needOpt) if (!LINES.has('gen.opt.' + k)) errors.push(`خيار يُقرأ بلا جملة: gen.opt.${k}`);
    for (const id of genIds.filter(i => i.startsWith('gen.opt.'))) if (!needOpt.has(id.slice(8))) errors.push(`جملة لا يبلغها المحتوى (تسجيل لا يُسمع): ${id}`); }
  /* كل جملة في الدرس يستعملها شيء (في بياناته، أو في بند مشتبك يُشغَّل بجمله): الجملة الزائدة تكلّف تسجيلاً بلا فائدة */
  { const used = {}; const grab = (v, out, top) => { if (typeof v === 'string') out.add(v); else if (Array.isArray(v)) v.forEach(x => grab(x, out)); else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (!(top && ['lines', 'labels', 'talk', 'adultCard'].includes(k))) grab(x, out); };
    for (const L of Object.values(lessons)) { used[L.id] = used[L.id] || new Set(); grab(L, used[L.id], true); const mx = L.mastery && L.mastery.mixed; if (mx && lessons[mx.lesson]) { used[mx.lesson] = used[mx.lesson] || new Set(); grab(mx.item, used[mx.lesson]); } }
    for (const L of Object.values(lessons)) for (const id of Object.keys(L.lines || {})) if (!used[L.id].has(id)) errors.push(`${L.id}: جملة لا يستعملها شيء «${id}»`); }
  /* وسوم الأخطاء في بيانات الدروس (err وerrs في البنود والخيارات) موجودة في errors.json، كما في الكود: وسم غير مسجَّل يُسجَّل في السجل بلا اسم للكبار ولا سؤال */
  { const walkE = (v, where) => { if (Array.isArray(v)) return v.forEach(x => walkE(x, where)); if (!v || typeof v !== 'object') return;
      if (typeof v.err === 'string' && !ERR[v.err]) errors.push(`${where}: وسم خطأ في البيانات غير موجود في errors.json «${v.err}»`);
      if (v.errs && typeof v.errs === 'object' && !Array.isArray(v.errs)) for (const t of Object.values(v.errs)) if (typeof t === 'string' && !ERR[t]) errors.push(`${where}: وسم خطأ في البيانات غير موجود في errors.json «${t}»`);
      for (const [k, x] of Object.entries(v)) if (!['lines', 'labels', 'sort'].includes(k)) walkE(x, where); };
    for (const L of Object.values(lessons)) { walkE(L, L.id); for (const r of (L.sort && L.sort.errors) || []) if (r.err && !ERR[r.err]) errors.push(`${L.id}: وسم خطأ في قواعد الفرز غير موجود «${r.err}»`); } }
  for (const u of content.units) { if (u.workshop) for (const p of u.workshop.puzzles) if (!LINES.has(p.name)) errors.push(`${u.id}: اسم لغز بلا جملة ${p.name}`);
    for (const [, lid] of u.hunt) if (!lessons[lid]) errors.push(`${u.id}: الصيد يشير إلى درس غير موجود ${lid}`); }
  for (const [name, ids] of Object.entries(content.gen.banks || {})) { if (!ids.length) errors.push('بنك فارغ: ' + name); for (const id of ids) if (!LINES.has(id)) errors.push(`بنك ${name}: جملة غير موجودة ${id}`); }
  for (const m of code.matchAll(/bank\('(\w+)'\)|praise: \(\) => '(\w+)'/g)) { const b = m[1] || m[2]; if (!(content.gen.banks || {})[b]) errors.push('بنك غير موجود: ' + b); }
  for (const L of Object.values(lessons)) if (L.sort && L.sort.praise && !(content.gen.banks || {})[L.sort.praise]) errors.push(`${L.id}: بنك المدح ${L.sort.praise} غير موجود`);
  for (const s of content.gen.stories || []) if (!LINES.has(s.line)) errors.push('قصة بلا جملة: ' + s.line);
  // 4ب) كل عدد يُقال كلمةً له جملة (gen.numw.NN)، في البنود وفي المشاهد: الأعداد المعطاة، والجواب، وبديل جملة الطرح (الجمع يُقرأ أيضاً)، والبرج الأكثر بواحد (الفحص المستقل الرابع)
  //     والأعداد فوق العشرة لا تُقال إلا من درس طريق الأعداد (N009، S1-U3 د5) فصاعداً؛ وحدّها ما له كلمة في gen.numw (حتى 20)
  const NUMK = ['n', 'a', 'b', 'k', 'target', 'start', 'ref', 'took', 'left', 'goal', 'from', 'to'];
  const ORDER = content.units.flatMap(u => u.lessons.map(l => l.id)), BIG_FROM = ORDER.indexOf('m1.u3.d5');
  const ORD_MAX = Math.max(0, ...[...LINES.keys()].filter(k => /^gen\.ord\.f\.\d+$/.test(k)).map(k => +k.slice(10)));
  const maxN = id => (BIG_FROM >= 0 && ORDER.indexOf(id) >= BIG_FROM) ? Math.max(...[...LINES.keys()].filter(k => /^gen\.numw\.\d+$/.test(k)).map(k => +k.slice(9))) : 10;
  const derived = v => { const o = [];
    if (['join', 'story', 'fact', 'sentence'].includes(v.t) && v.a != null && v.b != null) o.push(['المجموع', v.a + v.b]);
    if (['remove', 'fact', 'sentence', 'story'].includes(v.t) && v.op !== '+' && v.a != null && v.b != null) o.push(['الفرق', v.a - v.b]);
    if (v.t === 'unknownStart') o.push(['البداية', v.took + v.left]);
    if (v.t === 'split' && v.n != null && v.k != null) o.push(['الجزء الآخر', v.n - v.k]);
    if (v.t === 'buildTower' && v.want === 'more') o.push(['الأكثر بواحد', v.ref + 1]);
    if (v.t === 'same' && v.add) o.push(['بعد الإضافة', v.n + v.add]);
    if (v.scene === 'takeHook') o.push(['الباقي', v.a - v.b]);
    if (v.t === 'roadHop' && v.n != null) o.push(['الوصول', v.a + (v.dir || 1) * v.n]);
    if (v.t === 'roadPick') o.push(['الجواب', v.ask === 'land' ? v.n + (v.dir || 1) * v.k : v.ask === 'hops' ? v.b - v.n : v.n + (['next', 'more'].includes(v.ask) ? 1 : -1)]);
    if (v.scene === 'jumpChaosHook' || v.scene === 'chaosSubForward') o.push(['الوصول', v.a + (v.scene === 'chaosSubForward' ? -1 : 1) * v.n]);
    return o; };
  const walkNum = (v, where, top) => { if (Array.isArray(v)) return v.forEach(x => walkNum(x, where, top)); if (!v || typeof v !== 'object') return;
    if (typeof v.t === 'string' || typeof v.scene === 'string') { const mx = maxN(top);
      for (const k of NUMK) if (typeof v[k] === 'number' && (v[k] < 0 || v[k] > mx)) errors.push(`${where}: ${v.t || v.scene}.${k} = ${v[k]} خارج 0–${mx}` + (mx < 20 ? '، ولا كلمة له قبل طريق الأعداد' : '، ولا كلمة له'));
      for (const [nm, x] of derived(v)) if (x < 0 || x > mx) errors.push(`${where}: ${v.t || v.scene} ${nm} = ${x} خارج 0–${mx}، يُقرأ ولا كلمة له`);
      for (const k of ['said', 'rolls', 'chaos']) if (Array.isArray(v[k])) for (const x of v[k]) if (typeof x === 'number' && (x < 0 || x > mx)) errors.push(`${where}: ${v.t || v.scene}.${k} فيه ${x} خارج 0–${mx}`);
      if (Array.isArray(v.legs)) for (const x of v.legs.flat()) if (typeof x !== 'number' || x < 0 || x > mx) errors.push(`${where}: ${v.t || v.scene}.legs فيه ${x} خارج 0–${mx}`);
      /* القطار (N008، S1-U3): طوله داخل row فلا يبلغه الفحص أعلاه (طفرة mutants_run)؛ والعربات تُعدّ بأعداد ترتيبية مسموعة (gen.ord.f.NN) فلا يزيد القطار عليها،
         ولا تكون العربة المطلوبة ولا خيارات «أيّ عربة؟» خارجه */
      const train = (v.t === 'lineTap' || v.t === 'linePick') && v.row && v.row.kind === 'train' ? (v.row.n ?? 10) : (v.scene === 'trainOrdinals' || v.scene === 'chaosTrainBadge') ? (v.n ?? (v.scene === 'trainOrdinals' ? 10 : 6)) : null;
      if (train != null) { if (train > Math.min(ORD_MAX, mx) || train < 1) errors.push(`${where}: ${v.t || v.scene}: قطار من ${train} عربة، والأعداد الترتيبية المسموعة حتى ${ORD_MAX}`);
        if (v.t && typeof v.k === 'number' && (v.k < 1 || v.k > train)) errors.push(`${where}: ${v.t}: العربة ${v.k} خارج قطار من ${train}`);
        if (v.t === 'linePick') for (const o of v.opts || []) if (typeof o !== 'number' || o < 1 || o > train) errors.push(`${where}: linePick: الخيار ${o} خارج قطار من ${train}`); } }
    for (const [k, x] of Object.entries(v)) if (!['lines', 'labels'].includes(k)) walkNum(x, where, top); };
  for (const L of Object.values(lessons)) walkNum(L, L.id, L.id);
  // 4ب2) «أين هو في الخريطة؟» (S1-U3): الشيء على الأرض في خانة فارغة، أو فوق قطعة موجودة، أو تحت طاولة قريبة منا (فيُرى ما تحتها)
  const walkMap = (v, where) => { if (Array.isArray(v)) return v.forEach(x => walkMap(x, where)); if (!v || typeof v !== 'object') return;
    if (v.t === 'mapFind') { const m = v.mark || {}, items = (v.lay && v.lay.items) || [], key = i => i.col + ',' + i.row;
      if (m.cell) { if (items.some(i => key(i) === m.cell.join(','))) errors.push(`${where}: mapFind «${v.q}»: الخانة ${m.cell} فيها قطعة، والشيء «على الأرض» يكون في خانة فارغة`);
        /* وفي الصورة من الجانب يحجب السرير أو الطاولة القريبان منا ما خلفهما في عمودهما، فيبدو الشيء فوقهما أو تحتهما (لقطة الإتقان ms.1) */
        if (m.cell[1] === 'back' && items.some(i => i.col === m.cell[0] && i.row === 'front' && i.k !== 'rug')) errors.push(`${where}: mapFind «${v.q}»: الخانة ${m.cell} خلف ${items.find(i => i.col === m.cell[0] && i.row === 'front').k} قريب منا فيحجبها`); }
      else { const it = items.find(i => (i.id || i.k) === m.on); if (!it) errors.push(`${where}: mapFind «${v.q}»: لا قطعة «${m.on}» في الغرفة`);
        else if (m.rel === 'under' && (it.k !== 'table' || it.row !== 'front')) errors.push(`${where}: mapFind «${v.q}»: «تحت» لطاولة قريبة منا وحدها (ما تحت غيرها لا يُرى)`); }
      if (new Set(items.map(key)).size !== items.length) errors.push(`${where}: mapFind «${v.q}»: قطعتان في خانة واحدة`); }
    for (const [k, x] of Object.entries(v)) if (!['lines', 'labels'].includes(k)) walkMap(x, where); };
  for (const L of Object.values(lessons)) walkMap(L, L.id);
  // 4ب3) التوأم (الفحص المستقل B، المبدأ 5): كل بند يُشغَّل بالمساعدة (التمرين، والعلاج، ومراحل البنود بوضع التمرين أو العلاج) من نوعٍ توأمُه في بياناته
  //      (دالة twin في الكود تعيد item.twin) له توأم؛ ولا توأم للتوأم (يُشغَّل مرة واحدة)، ولا توأم في بند لا يُشغَّل توأمه (التقييم والاكتشاف)
  { const TWIN_DATA = new Set(), starts = [...code.matchAll(/^ITEM\.(\w+) = \{/gm)];
    starts.forEach((m, i) => { const body = code.slice(m.index, i + 1 < starts.length ? starts[i + 1].index : undefined); if (/twin\(item\) \{ return item\.twin \|\| null; \}/.test(body)) TWIN_DATA.add(m[1]);
      /* ولكل نوع بند توأم (من الكود أو من بياناته): «twin: () => null» كان يُسقط التوأم صامتاً في ثمانية أنواع (الفحص المستقل B) */
      if (!/\btwin[(:]/.test(body) || /twin: \(\) => null/.test(body)) errors.push(`نوع البند ${m[1]} بلا توأم: twin من الكود أو twin(item) { return item.twin || null; } مع توأم في البيانات (المبدأ 5)`); });
    if (!TWIN_DATA.size) errors.push('فحص التوأم: لم يُعثر على نوع بند توأمه في بياناته (تغيّرت صيغة twin في الكود؟)');
    const items = (L, help) => { const st = L.flow.filter(s => s.scene === 'items'); const P = L.practice || {}, M = L.mastery || {};
      return help ? [...(P.normal || []), ...(P.challenge || []), ...Object.values(M.remedial || {}).flat(), ...st.filter(s => ['practice', 'remedial'].includes(s.mode)).flatMap(s => s.items || [])]
        : [...Object.values(M.concepts || {}).flat(), ...(M.mixed ? [M.mixed.item] : []), ...(L.review || []), ...((L.test && L.test.items) || []).map(q => q.item), ...st.filter(s => !['practice', 'remedial'].includes(s.mode)).flatMap(s => s.items || [])]; };
    for (const L of Object.values(lessons)) {
      for (const it of items(L, true)) if (TWIN_DATA.has(it.t)) { if (!it.twin || typeof it.twin !== 'object' || typeof it.twin.t !== 'string') errors.push(`${L.id}: البند «${it.q}» (${it.t}) يُشغَّل بالمساعدة بلا توأم (المبدأ 5، الفحص المستقل B)`);
        else if (it.twin.twin) errors.push(`${L.id}: توأم البند «${it.q}» له توأم، والتوأم يُشغَّل مرة واحدة`); }
      for (const it of items(L, false)) if (it && it.twin) errors.push(`${L.id}: البند «${it.q}» في تقييم أو اكتشاف وله توأم لا يُشغَّل`); } }
  // 4ب4) كل موضع يُطلب له جملة حلّه (المستوى 3) وكلمته (الكشف): وفراغات الطابور g0…gN كلمتها أمام وبين وخلف (الفحص المستقل B: «gen.solve.pos.g1» غير موجودة فتوقّف الدرس)
  { const pkw = a => /^beside/.test(a || '') ? 'beside' : a;
    const walkP = (v, where) => { if (Array.isArray(v)) return v.forEach(x => walkP(x, where)); if (!v || typeof v !== 'object') return;
      if (v.t === 'place') { let w = pkw(v.at);
        if (v.ref === 'queue') { const n = (v.members || []).length, m = /^g(\d+)$/.exec(v.at || ''); if (!m || +m[1] > n) errors.push(`${where}: place «${v.q}»: فراغ الطابور «${v.at}» ليس من g0 إلى g${n}`); w = !m ? null : +m[1] === 0 ? 'front' : +m[1] === n ? 'behind' : 'between'; }
        if (w && !LINES.has('gen.solve.pos.' + w)) errors.push(`${where}: place «${v.q}»: لا جملة حلّ لموضعه gen.solve.pos.${w}`); }
      if (v.t === 'where') { const w = pkw(v.want || (v.pic && v.pic.at));
        for (const id of ['gen.solve.pos.' + w, 'gen.pos.' + w, ...(v.ask === 'thing' ? [] : (v.words || []).map(o => 'gen.pos.' + o))]) if (!LINES.has(id)) errors.push(`${where}: where «${v.q}»: جملة غير موجودة ${id}`); }
      for (const [k, x] of Object.entries(v)) if (!['lines', 'labels'].includes(k)) walkP(x, where); };
    for (const L of Object.values(lessons)) walkP(L, L.id); }
  // 4ج) في بند التعليل لا يكون الصحيح أطول الأسباب بفرق ظاهر (الفحص المستقل الثالث، ن3): طوله بلا تشكيل ≤ 1.2 × أطول المشتّتين؛
  //     وكذلك بطاقتا «أيّ أمر نفّذ الروبوت؟» و«أيّ وصف يناسب الطريق؟» (S1-U3): نصّهما ظاهر كأسباب التعليل، فلا يدلّ الطول على الصحيحة
  const bare = t => String(t || '').replace(/\{([^|{}]*)\|[^{}]*\}/g, '$1').replace(/[\u064B-\u0652\u0670]/g, '').replace(/\s+/g, ' ').trim().length;
  const walkWhy = (v, where, L) => { if (Array.isArray(v)) return v.forEach(x => walkWhy(x, where, L)); if (!v || typeof v !== 'object') return;
    if (['reason', 'robotWatch', 'routePick'].includes(v.t) && Array.isArray(v.opts)) { const txt = id => (L.lines && L.lines[id]) || (content.gen.lines || {})[id] || ''; const ok = v.opts.filter(o => o.ok).map(o => bare(txt(o.id))), bad = v.opts.filter(o => !o.ok).map(o => bare(txt(o.id)));
      if (ok.length && bad.length && Math.max(...ok) > 1.2 * Math.max(...bad)) errors.push(`${where}: في بند ${v.t === 'reason' ? 'التعليل' : 'البطاقتين'} «${v.q}» الصحيح ${Math.max(...ok)} حرفاً وأطول المشتّتين ${Math.max(...bad)}: الطول قرينة`); }
    for (const [k, x] of Object.entries(v)) if (!['lines', 'labels'].includes(k)) walkWhy(x, where, L); };
  for (const L of Object.values(lessons)) walkWhy(L, L.id, L);
  // 4د) «ابحث في الغرفة» (D255): الغرفة تسع ستة أشياء في صفّين مبعثرين، وتُختار من قائمة أطول منها، ولكل نوع يُسأل عنه شيء في القائمة
  const MSIG = makerSigs(code); const walkRoom = (v, where) => { if (Array.isArray(v)) return v.forEach(x => walkRoom(x, where)); if (!v || typeof v !== 'object') return;
    if (v.scene === 'roomHunt') { const n = v.n || 6, th = v.things || [], kinds = new Set(th.map(r => (MSIG[r] || {}).kind).filter(Boolean));
      if (n > 6) errors.push(`${where}: roomHunt.n = ${n}، والغرفة تسع ستة أشياء (D255)`);
      if (th.length < n) errors.push(`${where}: roomHunt فيه ${th.length} أشياء و n = ${n}`);
      for (const r of th) if (!MSIG[r] || !MSIG[r].kind) errors.push(`${where}: roomHunt شيء «${r}» ليس مولّداً له نوع`);
      for (const rd of v.rounds || []) if (!kinds.has(rd.k)) errors.push(`${where}: roomHunt يسأل عن «${rd.k}» ولا شيء من نوعه في أشياء الغرفة`); }
    for (const [k, x] of Object.entries(v)) if (!['lines', 'labels'].includes(k)) walkRoom(x, where); };
  for (const L of Object.values(lessons)) walkRoom(L, L.id);
  // 5) D232
  const head = read(join(ROOT, 'src', 'head.html'));
  for (const need of ['<!doctype html>', 'lang="ar"', 'dir="rtl"', 'charset="utf-8"', 'name="viewport"']) if (!head.includes(need)) errors.push(`الرأس ينقصه ${need} (D232)`);
  const net = head.match(/https?:\/\/[^"'\s)]+/g) || [];                                // ولا الخط: مضمّن من assets/fonts/ (D256)
  if (net.length) errors.push('الرأس يحمّل من الشبكة: ' + net.join(', '));
  const gendered = clips.filter(c => { GEN_RX.lastIndex = 0; return GEN_RX.test(c.text); }).length;
  const summary = `فحص المحتوى: ${clips.length} جملة (${gendered} بصيغتين)، ${Object.keys(ERR).length} وسم خطأ، ${Object.keys(lessons).length} درساً، ${ITEMS.size} نوع بند، ${SCENES.size} مشهداً — ${errors.length} مخالفة، ${warn.length} تنبيه`;
  return { errors, warn, summary };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { loadContent, readModules } = await import('./content.mjs');
  const r = lint(loadContent(), readModules());
  console.log(r.summary); for (const w of r.warn) console.log('  تنبيه:', w); for (const e of r.errors) console.log('  مخالفة:', e);
  process.exit(r.errors.length ? 1 : 0);
}
