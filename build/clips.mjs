// يجمع كل جملة منطوقة (معرّف + نص + شخصية + درس) من مصدرين:
//  1) بيانات content/*.json (المحقونة في CONTENT)، 2) ما بقي من نصوص داخل JS (hook/explore/worked…) بالأنماط نفسها التي كان يستعملها extract_script.py
const ID = /^[a-z]\w*\.[\w.]*$/, AR = /[؀-ۿ]/;
export const GEN_RX = /\{([^|{}]*)\|([^|{}]*)\}/g;
const isId = s => typeof s === 'string' && ID.test(s);
const isText = s => typeof s === 'string' && AR.test(s);

/* يمشي على أي بنية JSON ويلتقط: [id, text]، و[who, id, text]، و{id, t}، وخرائط {id: text} */
function walk(node, lessonId, out, path) {
  if (Array.isArray(node)) {
    if (node.length === 2 && isId(node[0]) && isText(node[1])) { out.push({ id: node[0], who: 'compass', text: node[1], lesson: lessonId, path }); return; }
    if (node.length === 3 && (node[0] === 'compass' || node[0] === 'chaos') && isId(node[1]) && isText(node[2])) { out.push({ id: node[1], who: node[0], text: node[2], lesson: lessonId, path }); return; }
    node.forEach((x, i) => walk(x, lessonId, out, path + '[' + i + ']')); return;
  }
  if (node && typeof node === 'object') {
    if (isId(node.id) && isText(node.t)) { out.push({ id: node.id, who: 'compass', text: node.t, lesson: lessonId, path }); return; }
    for (const [k, v] of Object.entries(node)) { if (isId(k) && isText(v)) out.push({ id: k, who: 'compass', text: v, lesson: lessonId, path: path + '.' + k }); else walk(v, lessonId, out, path + '.' + k); }
  }
}
export function clipsFromContent(content) {
  const out = [];
  walk(content.gen, null, out, 'gen'); walk(content.errors, null, out, 'errors');
  for (const u of content.units) { walk({ workshop: u.workshop }, null, out, u.id + '/unit'); for (const l of u.lessons) walk({ ...l, talk: undefined }, l.id, out, l.id); }
  return out;
}
/* نصوص JS: المناطق تُحدَّد بعلامات الدروس /* ---- [m1.u1.d1] … وتنتهي عند «مشغّل الدرس» */
export function clipsFromJs(js) {
  const marks = [...js.matchAll(/\/\* -+ \[(m\d\.u\d\.d\d)\]/g)].map(m => [m.index, m[1]]); const end = js.indexOf('مشغّل الدرس');
  const region = pos => { if (pos > end) return null; let cur = null; for (const [p, id] of marks) if (pos >= p) cur = id; return cur; };
  const out = []; const add = (pos, who, id, text) => out.push({ id, who, text, lesson: region(pos), pos, path: 'js@' + pos });
  for (const m of js.matchAll(/say\('(compass|chaos)', '([a-z][\w.]*)', '([^']*)'(?:\)|, \{)/g)) add(m.index, m[1], m[2], m[3]);
  for (const m of js.matchAll(/\['(compass|chaos)', '([a-z][\w.]*)', '([^']*)'\]/g)) add(m.index, m[1], m[2], m[3]);
  for (const m of js.matchAll(/\['([a-z]\w*\.[\w.]*)', '([^']*)'\]/g)) if (AR.test(m[2])) add(m.index, 'compass', m[1], m[2]);
  for (const m of js.matchAll(/id: '([a-z]\w*\.[\w.]*)', t: '([^']*)'/g)) add(m.index, 'compass', m[1], m[2]);
  return out;
}
/* يوحّد المصدرين في جدول: full = gen.* كما هو، وإلا الدرس + '.' + المعرّف. يعيد {clips, problems} */
export function collectClips(content, js) {
  const rows = [...clipsFromContent(content), ...clipsFromJs(js)]; const clips = new Map(), problems = [];
  for (const r of rows) {
    let full; if (r.id.startsWith('gen.')) full = r.id; else if (r.lesson) full = r.lesson + '.' + r.id; else { problems.push(['جملة خارج الدروس بلا gen.', r.id, r.text, r.path]); continue; }
    if (/\{name\}/.test(r.text)) problems.push(['اسم الطالب في جملة منطوقة (لا يُسجَّل)', full, r.text]);
    if (clips.has(full) && clips.get(full).text !== r.text) problems.push(['معرّف واحد لنصّين مختلفين', full, clips.get(full).text + ' ⟂ ' + r.text]);
    if (!clips.has(full)) clips.set(full, { full, who: r.who, text: r.text, lesson: r.id.startsWith('gen.') ? 'عام' : r.lesson });
  }
  return { clips: [...clips.values()], problems };
}
export const gendered = t => { GEN_RX.lastIndex = 0; return GEN_RX.test(t); };
export const form = (t, i) => t.replace(GEN_RX, (m, a, b) => i ? b : a);
/* مجموعة معرّفات الملفات الصوتية كما ينتجها extract_script.py: المعرّف، أو _m و_f للجملة ذات الصيغتين */
export const fileIds = clips => { const s = new Set(); for (const c of clips) { if (gendered(c.text)) { s.add(c.full + '_m'); s.add(c.full + '_f'); } else s.add(c.full); } return [...s].sort(); };
