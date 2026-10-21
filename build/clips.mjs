// يجمع كل جملة منطوقة (المعرّف الكامل، النص، المتكلم، الدرس) من المحتوى وحده (D246، D249: لا جمل منطوقة في JS):
//   gen.json ← lines (gen.*)، وerrors.json ← q لكل وسم (gen.err.*)، وكل درس ← lines (المعرّف الكامل = معرّف الدرس + '.' + المعرّف القصير)
export const GEN_RX = /\{([^|{}]*)\|([^|{}]*)\}/g;
const val = v => Array.isArray(v) ? { who: v[0], text: v[1] } : { who: 'compass', text: v };
export function clipsFromContent(content) {
  const out = [];
  for (const [id, v] of Object.entries(content.gen.lines || {})) out.push({ full: id, id, ...val(v), lesson: null, path: 'gen' });
  for (const [tag, e] of Object.entries(content.errors || {})) for (const [id, t] of Object.entries(e.q || {})) out.push({ full: id, id, who: 'compass', text: t, lesson: null, path: 'errors.' + tag });
  for (const u of content.units) for (const l of u.lessons) for (const [id, v] of Object.entries(l.lines || {})) out.push({ full: l.id + '.' + id, id, ...val(v), lesson: l.id, path: l.id + '.lines' });
  return out;
}
/* يعيد {clips, problems}: كل جملة مرة واحدة، ومعرّف واحد لا يحمل نصّين */
export function collectClips(content) {
  const clips = new Map(), problems = [];
  for (const r of clipsFromContent(content)) {
    if (!r.full.startsWith('gen.') && !r.lesson) { problems.push(['جملة خارج الدروس بلا gen.', r.full, r.text, r.path]); continue; }
    if (r.who !== 'compass' && r.who !== 'chaos') problems.push(['متكلم غير معروف', r.full, r.who]);
    if (/\{name\}/.test(r.text)) problems.push(['اسم الطالب في جملة منطوقة (لا يُسجَّل)', r.full, r.text]);
    if (clips.has(r.full) && clips.get(r.full).text !== r.text) problems.push(['معرّف واحد لنصّين مختلفين', r.full, clips.get(r.full).text + ' ⟂ ' + r.text]);
    if (!clips.has(r.full)) clips.set(r.full, { full: r.full, who: r.who, text: r.text, lesson: r.lesson || 'عام' });
  }
  return { clips: [...clips.values()], problems };
}
export const gendered = t => { GEN_RX.lastIndex = 0; return GEN_RX.test(t); };
export const form = (t, i) => t.replace(GEN_RX, (m, a, b) => i ? b : a);
/* معرّفات الملفات الصوتية: المعرّف، أو _m و_f للجملة ذات الصيغتين */
export const fileIds = clips => { const s = new Set(); for (const c of clips) { if (gendered(c.text)) { s.add(c.full + '_m'); s.add(c.full + '_f'); } else s.add(c.full); } return [...s].sort(); };
