// جدول التسجيل الصوتي: يُولَّد من المحتوى نفسه الذي يُبنى منه التطبيق (نقل extract_script.py إلى خطوة البناء).
// يكتب dist/script_m1.json (الصفوف) وdist/script_m1.xlsx.ids.json (معرّفات الملفات) ثم يستدعي build/script_xlsx.py لكتابة dist/script_m1.xlsx (openpyxl).
import { writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { collectClips, fileIds, gendered, form } from './clips.mjs';
const HERE = dirname(fileURLToPath(import.meta.url));

const SCENE = [['hook', 'إشعال'], ['exp', 'اكتشاف'], ['wk', 'مثال محلول'], ['pr', 'تمرين'], ['why', 'تمرين: سبب الصواب'], ['gen.correct', 'تمرين: مدح'], ['gen.err', 'تمرين: تفسير الخطأ'],
  ['gen.solve', 'تمرين: حل مشترك'], ['gen.twin', 'تمرين: مسألة توأم'], ['gen.hint', 'مساعدة'], ['gen.demo', 'مساعدة'], ['gen.num', 'عدّ'], ['chaos', 'صحّح لفوضى'], ['gen.chaos', 'صحّح لفوضى'],
  ['ms', 'فحص الإتقان'], ['gen.ms', 'فحص الإتقان'], ['wrap', 'ختام'], ['rv', 'مراجعة'], ['test', 'التحدي'], ['ts', 'التحدي'], ['gen.hintOffer', 'مساعدة']];
const NOTE = { 'إشعال': 'تشويق ودهشة، إيقاع حيّ', 'اكتشاف': 'دعوة هادئة للتجربة، مهل', 'مثال محلول': 'شرح واضح بطيء، وقفة عند كل عدّ',
  'تمرين': 'تشجيع', 'تمرين: مدح': 'فرح صادق قصير', 'تمرين: سبب الصواب': 'تأكيد هادئ للفكرة', 'تمرين: تفسير الخطأ': 'لطيف غير ناقد؛ «لنفكّر معاً» بنبرة شراكة',
  'تمرين: حل مشترك': 'دافئ، بلا خيبة', 'تمرين: مسألة توأم': 'تحفيز', 'مساعدة': 'همس ودود', 'عدّ': 'عدّ واضح منغّم', 'صحّح لفوضى': 'فوضى: مشاكسة مرحة بلا عدوانية؛ فرجار: فضول',
  'فحص الإتقان': 'جِدّ لطيف بلا ضغط', 'ختام': 'احتفال وفخر', 'مراجعة': 'تذكير واضح', 'التحدي': 'سؤال واضح محايد، بلا تلميح بالنبرة' };
const WHO = { compass: 'فِرجار', chaos: 'فوضى' };
function scene(full) { const tail = full.startsWith('m1.') ? full.split('.').slice(3).join('.') : full; let best = '', lab = '؟';
  for (const [k, v] of SCENE) if (tail.startsWith(k) && k.length > best.length) { best = k; lab = v; } return lab; }

export function scriptRows(content, js) {
  const { clips, problems } = collectClips(content, js);
  const order = new Map(clips.map((c, i) => [c.full, i]));
  const out = clips.slice().sort((a, b) => (a.lesson === 'عام') - (b.lesson === 'عام') || (a.lesson < b.lesson ? -1 : a.lesson > b.lesson ? 1 : 0) || order.get(a.full) - order.get(b.full));
  let nfiles = 0; const rows = out.map((c, i) => { const two = gendered(c.text); nfiles += two ? 2 : 1; const sc = scene(c.full);
    return [i + 1, c.lesson !== 'عام' ? c.lesson.replace('m1.u', 'الوحدة ').replace('.d', '، الدرس ') : 'عام (كل الدروس)', sc, WHO[c.who], c.full, form(c.text, 0), two ? form(c.text, 1) : '(النص نفسه)',
      c.full + (two ? '_m' : '') + '.mp3', two ? c.full + '_f.mp3' : '(الملف نفسه)', NOTE[sc] || '', '', '']; });
  const summary = {}; for (const c of out) { const k = c.lesson + '|' + WHO[c.who]; summary[k] = (summary[k] || 0) + 1; }
  return { rows, ids: fileIds(out), nclips: out.length, nfiles, summary: Object.entries(summary).sort().map(([k, n]) => [...k.split('|'), n]), problems };
}

export function writeScript(content, js, dist, name = 'script_m1') {
  const r = scriptRows(content, js);
  const jsonPath = join(dist, name + '.json'); writeFileSync(jsonPath, JSON.stringify({ rows: r.rows, summary: r.summary, nclips: r.nclips, nfiles: r.nfiles }, null, 1));
  writeFileSync(join(dist, name + '.xlsx.ids.json'), JSON.stringify(r.ids, null, 0));
  let xlsx = false; const py = spawnSync('python3', ['-I', join(HERE, 'script_xlsx.py'), jsonPath, join(dist, name + '.xlsx')], { encoding: 'utf8' });
  if (py.status === 0 && existsSync(join(dist, name + '.xlsx'))) xlsx = true; else console.warn('تعذّر إنشاء xlsx (python3/openpyxl غير متاح؟):', (py.stderr || '').split('\n').slice(-2).join(' '));
  return { ...r, xlsx };
}
