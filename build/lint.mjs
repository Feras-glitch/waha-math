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
  for (const u of content.units) { if (u.workshop) for (const p of u.workshop.puzzles) if (!LINES.has(p.name)) errors.push(`${u.id}: اسم لغز بلا جملة ${p.name}`);
    for (const [, lid] of u.hunt) if (!lessons[lid]) errors.push(`${u.id}: الصيد يشير إلى درس غير موجود ${lid}`); }
  for (const [name, ids] of Object.entries(content.gen.banks || {})) { if (!ids.length) errors.push('بنك فارغ: ' + name); for (const id of ids) if (!LINES.has(id)) errors.push(`بنك ${name}: جملة غير موجودة ${id}`); }
  for (const m of code.matchAll(/bank\('(\w+)'\)|praise: \(\) => '(\w+)'/g)) { const b = m[1] || m[2]; if (!(content.gen.banks || {})[b]) errors.push('بنك غير موجود: ' + b); }
  for (const L of Object.values(lessons)) if (L.sort && L.sort.praise && !(content.gen.banks || {})[L.sort.praise]) errors.push(`${L.id}: بنك المدح ${L.sort.praise} غير موجود`);
  for (const s of content.gen.stories || []) if (!LINES.has(s.line)) errors.push('قصة بلا جملة: ' + s.line);
  // 4ب) كل عدد يُقال كلمةً له جملة (gen.numw.00–10)، في البنود وفي المشاهد: الأعداد المعطاة، والجواب، وبديل جملة الطرح (الجمع يُقرأ أيضاً)، والبرج الأكثر بواحد (الفحص المستقل الرابع)
  const NUMK = ['n', 'a', 'b', 'k', 'target', 'start', 'ref', 'took', 'left', 'goal'];
  const derived = v => { const o = [];
    if (['join', 'story', 'fact', 'sentence'].includes(v.t) && v.a != null && v.b != null) o.push(['المجموع', v.a + v.b]);
    if (['remove', 'fact', 'sentence', 'story'].includes(v.t) && v.op !== '+' && v.a != null && v.b != null) o.push(['الفرق', v.a - v.b]);
    if (v.t === 'unknownStart') o.push(['البداية', v.took + v.left]);
    if (v.t === 'split' && v.n != null && v.k != null) o.push(['الجزء الآخر', v.n - v.k]);
    if (v.t === 'buildTower' && v.want === 'more') o.push(['الأكثر بواحد', v.ref + 1]);
    if (v.t === 'same' && v.add) o.push(['بعد الإضافة', v.n + v.add]);
    if (v.scene === 'takeHook') o.push(['الباقي', v.a - v.b]);
    return o; };
  const walkNum = (v, where) => { if (Array.isArray(v)) return v.forEach(x => walkNum(x, where)); if (!v || typeof v !== 'object') return;
    if (typeof v.t === 'string' || typeof v.scene === 'string') {
      for (const k of NUMK) if (typeof v[k] === 'number' && (v[k] < 0 || v[k] > 10)) errors.push(`${where}: ${v.t || v.scene}.${k} = ${v[k]} خارج 0–10، ولا كلمة له`);
      for (const [nm, x] of derived(v)) if (x < 0 || x > 10) errors.push(`${where}: ${v.t || v.scene} ${nm} = ${x} خارج 0–10، يُقرأ ولا كلمة له`); }
    for (const [k, x] of Object.entries(v)) if (!['lines', 'labels'].includes(k)) walkNum(x, where); };
  for (const L of Object.values(lessons)) walkNum(L, L.id);
  // 4ج) في بند التعليل لا يكون الصحيح أطول الأسباب بفرق ظاهر (الفحص المستقل الثالث، ن3): طوله بلا تشكيل ≤ 1.2 × أطول المشتّتين
  const bare = t => String(t || '').replace(/\{([^|{}]*)\|[^{}]*\}/g, '$1').replace(/[\u064B-\u0652\u0670]/g, '').replace(/\s+/g, ' ').trim().length;
  const walkWhy = (v, where, L) => { if (Array.isArray(v)) return v.forEach(x => walkWhy(x, where, L)); if (!v || typeof v !== 'object') return;
    if (v.t === 'reason' && Array.isArray(v.opts)) { const txt = id => (L.lines && L.lines[id]) || (content.gen.lines || {})[id] || ''; const ok = v.opts.filter(o => o.ok).map(o => bare(txt(o.id))), bad = v.opts.filter(o => !o.ok).map(o => bare(txt(o.id)));
      if (ok.length && bad.length && Math.max(...ok) > 1.2 * Math.max(...bad)) errors.push(`${where}: في بند التعليل «${v.q}» الصحيح ${Math.max(...ok)} حرفاً وأطول المشتّتين ${Math.max(...bad)}: الطول قرينة`); }
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
