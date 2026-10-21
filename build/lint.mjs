// فحوص المحتوى (D246): تُشغَّل قبل كل بناء وتوقفه عند أي مخالفة.
//  1) كل معرّف جملة له نصّ غير فارغ، وكل إشارة GEN.lines.* وW('why.*') في JS تجد نصّها
//  2) كل صيغة مخاطبة {مذكر|مؤنث} طرفاها غير فارغين، ولا أقواس ناقصة
//  3) لا معرّف واحد لنصّين مختلفين
//  4) كل وسم خطأ يعيده errorOf أو يُسجَّل بـ err: له مدخل في سجلّ الأخطاء (تفسيرٌ لما يعيده errorOf، واسمٌ على الأقل لما يُسجَّل فقط)
//  5) مراجع البيانات: المولّدات بالاسم، ومعرّفات المدح والمهمة والتفسير
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectClips, clipsFromContent, GEN_RX } from './clips.mjs';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export function lint(content, js) {
  const errors = [], warn = [];
  const { clips, problems } = collectClips(content, js);
  for (const p of problems) errors.push(p.join(' | '));
  // 1) نصوص فارغة
  for (const c of clips) if (!c.text.trim()) errors.push('نصّ فارغ: ' + c.full);
  for (const m of js.matchAll(/say\('(?:compass|chaos)', '([a-z][\w.]*)', '([^']*)'/g)) if (!m[2].trim()) errors.push('say بلا نصّ: ' + m[1]);
  for (const m of js.matchAll(/GEN\.lines\.(\w+)/g)) if (!content.gen.lines[m[1]]) errors.push('GEN.lines.' + m[1] + ' غير موجود في gen.json');
  for (const m of js.matchAll(/\.\.\.(TEST_INTRO|TEST_AGAIN_LOW|TEST_AGAIN_NEAR|MS_AGAIN|MS_LATER|KIDS_WHO|GAL_INTRO|GAL_EMPTY|HUNT_SAVED|WS_\w+|REVIEW_\w+|SESSION_BREAK)\b/g)) if (!content.gen[m[1]]) errors.push(m[1] + ' غير موجود في gen.json');
  // W('why.x') داخل منطقة كل درس
  const marks = [...js.matchAll(/\/\* -+ \[(m\d\.u\d\.d\d)\]/g)].map(m => [m.index, m[1]]);
  const region = pos => { let cur = null; for (const [p, id] of marks) if (pos >= p) cur = id; return cur; };
  const lessons = {}; for (const u of content.units) for (const l of u.lessons) lessons[l.id] = l;
  for (const m of js.matchAll(/\bW\('([\w.]+)'\)/g)) { const L = lessons[region(m.index)]; if (!L || !L.sort || !L.sort.reasons[m[1]]) errors.push(`W('${m[1]}') بلا نصّ في ${region(m.index)}`); }
  // 2) صيغ المخاطبة
  const texts = [...clips.map(c => [c.full, c.text]), ...Object.values(lessons).filter(l => l.talk).map(l => [l.id + '.talk', l.talk])];
  for (const [id, t] of texts) {
    for (const m of t.matchAll(GEN_RX)) if (!m[1].trim() || !m[2].trim()) errors.push(`صيغة مخاطبة ناقصة في ${id}: ${m[0]}`);
    const bare = t.replace(GEN_RX, '').replace(/\{name\}/g, ''); if (/[{}|]/.test(bare)) errors.push(`أقواس أو شرطة شاردة في ${id}: ${t}`);
  }
  // 3) التكرار: داخل collectClips (معرّف واحد لنصّين) وهنا تكرار المعرّف نفسه داخل ملف الدرس
  for (const L of Object.values(lessons)) { const seen = new Map(); for (const c of clipsFromContent({ gen: {}, errors: {}, units: [{ id: 'x', hunt: [], lessons: [L] }] })) {
    if (seen.has(c.id) && seen.get(c.id) !== c.text) errors.push(`معرّف مكرّر بنصّين في ${L.id}: ${c.id}`); seen.set(c.id, c.text); } }
  // 4) سجلّ الأخطاء
  const ERR = content.errors;
  for (const [tag, e] of Object.entries(ERR)) { if (!e.label) errors.push('وسم بلا اسم للكبار: ' + tag); if (e.explain) for (const [id, t] of Object.entries(e.explain)) { if (!id.startsWith('gen.err.')) errors.push('معرّف تفسير لا يبدأ بـ gen.err.: ' + id); if (!t.trim()) errors.push('تفسير فارغ: ' + id); } }
  for (const L of Object.values(lessons)) if (L.sort) {
    const table = {};
    for (const e of L.sort.errors) { const [tag, id] = Array.isArray(e) ? e : [e, ERR[e] && ERR[e].explain ? Object.keys(ERR[e].explain)[0] : null];
      if (!ERR[tag]) errors.push(`${L.id}: وسم ${tag} ليس في errors.json`); else if (!ERR[tag].explain || !ERR[tag].explain[id]) errors.push(`${L.id}: لا تفسير ${id} للوسم ${tag}`);
      else if (!Array.isArray(e) && Object.keys(ERR[tag].explain).length > 1) errors.push(`${L.id}: الوسم ${tag} له عدة تفسيرات؛ حدّد المعرّف [tag, id]`); table[tag] = true; }
    // ما يعيده errorOf في JS لهذا الدرس
    const a = js.indexOf(`lesson('${L.id}'`); const b = js.indexOf('\n})));', a); const body = js.slice(a, b);
    const eo = body.match(/errorOf\(item, bin\) \{([\s\S]*?)\},\n/); if (!eo) errors.push(`${L.id}: لا errorOf`);
    else for (const m of eo[1].matchAll(/(?:return|\?|:) '(\w+)'/g)) if (!table[m[1]]) errors.push(`${L.id}: errorOf يعيد '${m[1]}' وليس في جدول أخطاء الدرس`);
  }
  for (const m of js.matchAll(/\berr: '(\w+)'/g)) if (!ERR[m[1]]) errors.push(`logAttempt يسجّل err '${m[1]}' وليس في errors.json`);
  const usedTags = new Set([...js.matchAll(/(?:return|\?|:) '(\w+)'|err: (?:[^,'{}]*: )?'(\w+)'/g)].map(m => m[1] || m[2]));
  for (const tag of Object.keys(ERR)) if (!usedTags.has(tag)) warn.push('وسم في السجلّ لا يستعمله الكود: ' + tag);
  // 5) مراجع البيانات
  const makers = new Set(); for (const m of js.matchAll(/^const (MK|MK2) = \{\n([\s\S]*?)\n\};/gm)) for (const k of m[2].matchAll(/^\s{2}(\w+): /gm)) makers.add(k[1]);
  for (const L of Object.values(lessons)) { if (L.riddles) for (const k of Object.keys(L.riddles)) makers.add(k); }
  const refOk = r => Array.isArray(r) ? makers.has(r[0]) : typeof r === 'string' ? makers.has(r) : (r && typeof r === 'object');
  for (const L of Object.values(lessons)) {
    if (L.sort) { for (const r of [...L.sort.practice, ...L.sort.sets.flat(), ...L.sort.remedial]) if (!refOk(r)) errors.push(`${L.id}: مولّد غير معروف ${JSON.stringify(r)}`);
      if (L.sort.praise && !content.gen[L.sort.praise]) errors.push(`${L.id}: praise ${L.sort.praise} غير موجود`);
      if (L.sort.sets.some(s => s.length !== 3)) errors.push(`${L.id}: كل مجموعة إتقان ثلاثة أشكال`); }
    if (L.test) for (const Q of L.test.items) { if (Q.opts) for (const r of Q.opts) if (!refOk(r)) errors.push(`${L.id}: خيار تحدٍّ غير معروف ${JSON.stringify(r)}`); if (Q.show && !refOk(Q.show)) errors.push(`${L.id}: show غير معروف`);
      if (!L.test.lessonOf[Q.id]) errors.push(`${L.id}: السؤال ${Q.id} بلا درس في lessonOf`); }
    if (L.test) for (const lid of Object.values(L.test.lessonOf)) if (!L.test.review[lid]) errors.push(`${L.id}: لا جملة مراجعة للدرس ${lid}`);
    if (L.homeTask && !(L.wrapLines || []).some(w => w[1] === L.homeTask)) errors.push(`${L.id}: homeTask ${L.homeTask} ليس في wrapLines`);
    if (L.chaos && L.chaos.placed.filter(p => p.wrong).length !== 1) errors.push(`${L.id}: مشهد فوضى يحتاج خطأً واحداً بالضبط`);
    if (L.chaos && L.chaos.reasons.filter(r => r.ok).length !== 1) errors.push(`${L.id}: سبب صحيح واحد بالضبط`);
  }
  const gendered = clips.filter(c => { GEN_RX.lastIndex = 0; return GEN_RX.test(c.text); }).length;
  const summary = `فحص المحتوى: ${clips.length} جملة (${gendered} بصيغتين)، ${Object.keys(ERR).length} وسم خطأ، ${Object.keys(lessons).length} دروس — ${errors.length} مخالفة، ${warn.length} تنبيه`;
  return { errors, warn, summary };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { loadContent } = await import('./build.mjs');
  const js = readdirSync(join(ROOT, 'src', 'js')).filter(f => f.endsWith('.js')).sort().map(f => readFileSync(join(ROOT, 'src', 'js', f), 'utf8')).join('');
  const r = lint(loadContent(), js);
  console.log(r.summary); for (const w of r.warn) console.log('  تنبيه:', w); for (const e of r.errors) console.log('  مخالفة:', e);
  process.exit(r.errors.length ? 1 : 0);
}
