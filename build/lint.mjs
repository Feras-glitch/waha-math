// فحوص المحتوى (D246، D240): تُشغَّل قبل كل بناء وتوقفه عند أي مخالفة.
//  1) الجمل: نصّ غير فارغ، وصيغتا المخاطبة كاملتان، ولا أرقام مكتوبة في جملة منطوقة (العدد كلمةً، D229)، ولا معرّف بنصّين
//  2) JS: لا جملة منطوقة مكتوبة في الكود، ولا Math.random إلا بعلامة rng-ok، وكل gen.* وكل تسمية وكل وسم خطأ في الكود موجود في المحتوى
//  3) الدروس: كل معرّف جملة في بيانات الدرس موجود، وكل مولّد وكل نوع بند وكل مشهد معروف، ومراحل المسار مكتملة البيانات
//  4) D240: مولّدات الإتقان والمراجعة غير مولّدات التمرين في الدرس نفسه، ولكل مفهوم ثلاثة بنود على الأقل، ومشهد فوضى بخطأ واحد
//  5) D232: رأس HTML كامل ولا تحميل من الشبكة إلا رابط الخط غير الحاجب
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectClips, GEN_RX } from './clips.mjs';
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
  js.split('\n').forEach((l, i) => { const m = l.match(/\s\/\/\s(.*)$/); if (m && SWALLOW.test(m[1])) errors.push('كود بعد تعليق السطر (يُبتلع) في السطر ' + (i + 1) + ': ' + m[1].slice(0, 50)); });
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
    if (mixed && lessons[mixed.lesson]) { const M = lessons[mixed.lesson]; LL = M; walk(mixed.item, '.mastery.mixed(' + M.id + ')', null); LL = L; }   // البند المشتبك يُحكم بإعدادات درسه وجمله if (bag) { walk({ ask: bag.ask }, '.bag', null); (bag.items || []).forEach((r, i) => { if (typeof r === 'string' && !isMaker(r)) bad.add(`${L.id}: مولّد غير معروف في الحقيبة ${r}`); if (r && r.label && !(L.labels || {})[r.label] && !content.labels.ui[r.label]) bad.add(`${L.id}: تسمية حقيبة غير موجودة ${r.label}`); }); }
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
    if (L.flow.some(s => s.s === 'practice') && !L.flow.some(s => s.s === 'mastery')) errors.push(`${L.id}: تمرين بلا فحص إتقان`);
    // 4) D240
    if (L.chaos && L.chaos.kind === 'bins' && L.chaos.placed.filter(p => p.wrong).length !== 1) errors.push(`${L.id}: مشهد فوضى يحتاج خطأً واحداً بالضبط`);
    if (L.chaos && L.chaos.wrong && LINES.get(L.id + '.' + L.chaos.wrong) && LINES.get(L.id + '.' + L.chaos.wrong).who !== 'chaos') errors.push(`${L.id}: جملة فوضى الخاطئة بغير صوت فوضى`);
    if (L.mastery) { for (const [C, items] of Object.entries(L.mastery.concepts)) { if (!(L.concepts || {})[C]) errors.push(`${L.id}: مفهوم ${C} في الإتقان بلا اسم في concepts`); if (items.length < 3) errors.push(`${L.id}: مفهوم ${C} بأقل من ثلاثة بنود`); }
      if (L.mastery.mixed && !lessons[L.mastery.mixed.lesson]) errors.push(`${L.id}: البند المشتبك يشير إلى درس غير موجود`); }
    const makersIn = list => { const s = new Set(); const add = r => { if (typeof r === 'string') s.add(r); else if (Array.isArray(r) && typeof r[0] === 'string') s.add(r[0]); };
      const visit = v => { if (Array.isArray(v)) return v.forEach(visit); if (v && typeof v === 'object') { for (const k of REF_ONE) if (v[k] !== undefined) add(v[k]); for (const k of ['objs', 'opts', 'shapes']) if (Array.isArray(v[k])) v[k].forEach(add); if (typeof v.objs === 'string') add(v.objs); } };
      visit(list); return s; };
    const prac = makersIn([...(L.practice ? [...L.practice.normal, ...(L.practice.challenge || [])] : []), ...L.flow.filter(s => s.s === 'game' && s.items).flatMap(s => s.items)]);
    const assess = makersIn([...(L.mastery ? Object.values(L.mastery.concepts).flat() : []), ...(L.review || [])]);
    for (const m of assess) if (prac.has(m) && MAKERS.has(m) && !/S$/.test(m)) errors.push(`${L.id}: المولّد «${m}» في التمرين وفي الإتقان أو المراجعة (D240)`);
    const pj = new Set((L.practice ? [...L.practice.normal, ...(L.practice.challenge || [])] : []).map(x => JSON.stringify(x)));
    for (const x of [...(L.mastery ? Object.values(L.mastery.concepts).flat() : []), ...(L.review || [])]) if (pj.has(JSON.stringify(x))) errors.push(`${L.id}: بند مطابق بين التمرين والإتقان أو المراجعة: ${JSON.stringify(x)}`);
    if (!L.test && !(L.review && L.review.length)) warn.push(`${L.id}: لا مخزون مراجعة محجوز`);
    if (L.test) for (const q of L.test.items) { if (!lessons[q.of] || lessons[q.of].unit !== L.unit) errors.push(`${L.id}: البند ${q.id} يشير إلى درس خارج الوحدة: ${q.of}`); }
  }
  for (const u of content.units) { if (u.workshop) for (const p of u.workshop.puzzles) if (!LINES.has(p.name)) errors.push(`${u.id}: اسم لغز بلا جملة ${p.name}`);
    for (const [, lid] of u.hunt) if (!lessons[lid]) errors.push(`${u.id}: الصيد يشير إلى درس غير موجود ${lid}`); }
  for (const [name, ids] of Object.entries(content.gen.banks || {})) { if (!ids.length) errors.push('بنك فارغ: ' + name); for (const id of ids) if (!LINES.has(id)) errors.push(`بنك ${name}: جملة غير موجودة ${id}`); }
  for (const m of code.matchAll(/bank\('(\w+)'\)|praise: \(\) => '(\w+)'/g)) { const b = m[1] || m[2]; if (!(content.gen.banks || {})[b]) errors.push('بنك غير موجود: ' + b); }
  for (const L of Object.values(lessons)) if (L.sort && L.sort.praise && !(content.gen.banks || {})[L.sort.praise]) errors.push(`${L.id}: بنك المدح ${L.sort.praise} غير موجود`);
  for (const s of content.gen.stories || []) if (!LINES.has(s.line)) errors.push('قصة بلا جملة: ' + s.line);
  // 5) D232
  const head = read(join(ROOT, 'src', 'head.html'));
  for (const need of ['<!doctype html>', 'lang="ar"', 'dir="rtl"', 'charset="utf-8"', 'name="viewport"']) if (!head.includes(need)) errors.push(`الرأس ينقصه ${need} (D232)`);
  const net = (head.match(/https?:\/\/[^"'\s)]+/g) || []).filter(u => !/fonts\.(googleapis|gstatic)\.com/.test(u));
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
