// بناء «استوديو الواحة» وحزم العمل (docs/مواصفة_استوديو_الواحة.md).
//   node build/studio.mjs                      ← dist/studio/index.html (التطبيق) وحزم العمل الافتراضية في dist/packs/
//   node build/studio.mjs pack [خيارات]        ← حزمة عمل واحدة بنطاق محدد:
//       --char compass|chaos      الشخصية (فرجار أو فوضى)؛ بلا --char: الشخصيتان
//       --lessons m1.u1.d1,m1.u1.d2   دروس النطاق (بلا --lessons: كل الدروس)
//       --gen                     ومعها الجمل العامة التي تُقال في هذه الدروس (خريطة dist/studio_where.json)
//       --redo ملف.json           جمل مطلوب إعادتها: {"المعرّف": "ملاحظة المنسّق", …} (من tools/studio_import.py --redo أو يدوياً)
//       --label "الوحدة 1، الدرس 1"   --who "الاسم"   --out مسار.wahawork
// المحرّك في الحزمة هو نسخة الفحص (--dev): فيها السائق الآلي لـ«شاهد المشهد»، ولا تصل إلى الأطفال (القسم 5).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { build, embedFonts } from './build.mjs';
import { scriptRows } from './script.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..'), DIST = join(ROOT, 'dist'), ST = join(ROOT, 'studio');
const require = createRequire(import.meta.url); const { makeZip } = require(join(ST, 'lib.js'));
const read = p => readFileSync(p, 'utf8');
export const WHO_ID = { 'فِرجار': 'compass', 'فوضى': 'chaos' };
export const textHash = (m, f) => createHash('sha1').update(m + '\n' + (f || '')).digest('hex').slice(0, 12);
const MAX_SEC = { m1: 8, m2: 10, m3: 12, m4: 15 };   // دليل الإنتاج الصوتي، القسم 4
const plainWords = t => t.replace(/[ً-ْٰ«»؟?!.،,:؛]/g, ' ').trim().split(/\s+/).filter(Boolean);

export function studioVersion() {
  const g = join(ROOT, 'platforms', 'android-studio', 'app', 'build.gradle');
  const m = existsSync(g) && read(g).match(/versionName "([^"]+)"/); return m ? m[1] : '0.0.0';
}
function commit() { try { return execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim(); } catch (e) { return ''; } }

/* صفوف البيان من جدول التسجيل نفسه (build/script.mjs)، فلا يختلف الاستوديو عن الجدول في جملة */
export function manifestRows(content) {
  const S = scriptRows(content, ''), wherePath = join(DIST, 'studio_where.json');
  const W = existsSync(wherePath) ? JSON.parse(read(wherePath)) : { first: {}, where: {} };
  const rows = []; let prevBy = new Map(); const errWhy = {};
  for (const [, e] of Object.entries(content.errors || {})) for (const id of Object.keys(e.q || {})) errWhy[id] = e.label || null;
  for (const r of S.rows) {
    const [, lessonLabel, scene, who, id, m, f0, , , note] = r; const f = f0 === '(النص نفسه)' ? null : f0;
    const lesson = id.startsWith('m1.') ? id.split('.').slice(0, 3).join('.') : null;
    const prev = lesson ? prevBy.get(lesson) || null : null; if (lesson) prevBy.set(lesson, id);
    rows.push({ id, who: WHO_ID[who] || who, lesson, lessonLabel: lesson ? lessonLabel : null, scene, m, f, note, max: MAX_SEC[(lesson || 'm1').slice(0, 2)] || 8, prev,
      hash: textHash(m, f), short: plainWords(m).length <= 2, at: W.first[id] ? [W.first[id][0], W.first[id][1], String(W.first[id][2] || '7')] : null, in: W.where[id] || [], why: errWhy[id] || null });
  }
  /* جملة لا يبلغها السائق (بند من مخزن لم يُختر، أو مسار نادر): «شاهد المشهد» يُري جملةً شقيقة يبلغها، من الدرس نفسه
     ومشهده نفسه (pr، ms، ts…)، ويقول ذلك صراحةً */
  const fam = r => r.lesson ? r.lesson + '|' + r.id.split('.')[3] : null, reach = new Map();
  for (const r of rows) if (r.at && fam(r) && !reach.has(fam(r))) reach.set(fam(r), r);
  for (const r of rows) if (!r.at && fam(r) && reach.has(fam(r))) { const s = reach.get(fam(r)); r.at = s.at; r.near = s.id; }
  return rows;
}

export function makePack(rows, engineHtml, opt = {}) {
  let rs = rows.filter(r => !opt.char || r.who === opt.char);
  if (opt.lessons) { const L = new Set(opt.lessons); rs = rs.filter(r => (r.lesson && L.has(r.lesson)) || (!r.lesson && opt.gen && r.in.some(x => L.has(x)))); }
  const redo = opt.redo || {};
  rs = rs.map(r => { const o = { ...r }; delete o.in; if (redo[r.id]) o.redo = redo[r.id]; return o; });
  const id = createHash('sha1').update(JSON.stringify([opt.char, opt.lessons, rs.map(r => r.id + r.hash + (r.redo || ''))])).digest('hex').slice(0, 8);
  const manifest = { v: 1, kind: 'wahawork', id, made: new Date().toISOString(), commit: commit(), minStudio: 1,
    who: { name: opt.who || null, role: 'voice', char: opt.char || null }, scope: { label: opt.label || 'كل الجمل', lessons: opt.lessons || null, gen: !!opt.gen }, rows: rs };
  return { manifest, zip: makeZip([{ name: 'manifest.json', data: JSON.stringify(manifest) }, { name: 'engine.html', data: engineHtml }]) };
}

export function studioHtml() {
  const tpl = read(join(ST, 'studio.html')), lib = read(join(ST, 'lib.js')), app = read(join(ST, 'app.js')), drv = read(join(ST, 'driver.js'));
  const head = tpl.slice(0, tpl.indexOf('</head>') + 7), rest = tpl.slice(tpl.indexOf('</head>') + 7);
  const font = embedFonts(head, [rest, app]);
  const js = s => { if (/<\/script/i.test(s)) throw new Error('«</script» في كود الاستوديو'); return s; };
  const ver = studioVersion();
  return font.head + rest.replace('@@LIB@@', js(lib)).replace('@@DRIVER_JSON@@', 'const DRIVER_SRC = ' + JSON.stringify(drv).replace(/</g, '\\u003c') + ';\nconst STUDIO_VERSION = ' + JSON.stringify(ver) + ';').replace('@@APP@@', js(app));
}

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const b = build({ dev: true }), rows = manifestRows(b.content);
  mkdirSync(join(DIST, 'studio'), { recursive: true }); mkdirSync(join(DIST, 'packs'), { recursive: true });
  const write = (name, p) => { writeFileSync(name, p.zip); console.log('حزمة:', name.replace(ROOT + '/', ''), p.manifest.rows.length, 'جملة،', Math.round(p.zip.length / 1024), 'KB'); };
  if (process.argv[2] === 'pack') {
    const lessons = arg('--lessons') ? arg('--lessons').split(',').filter(Boolean) : null, redoP = arg('--redo');
    const p = makePack(rows, b.html, { char: arg('--char'), lessons, gen: process.argv.includes('--gen'), redo: redoP ? JSON.parse(read(redoP)) : null, label: arg('--label'), who: arg('--who') });
    write(arg('--out', join(DIST, 'packs', 'حزمة-' + p.manifest.id + '.wahawork')), p);
  } else {
    const html = studioHtml(); writeFileSync(join(DIST, 'studio', 'index.html'), html); console.log('الاستوديو:', 'dist/studio/index.html', Math.round(html.length / 1024), 'KB، النسخة', studioVersion());
    const reached = rows.filter(r => r.at).length; console.log('شاهد المشهد: ' + reached + ' من ' + rows.length + ' جملة' + (existsSync(join(DIST, 'studio_where.json')) ? '' : ' (لا خريطة: شغّل test/studio_where.py)'));
    write(join(DIST, 'packs', 'تجريبي-فرجار-الوحدة1-الدرس1.wahawork'), makePack(rows, b.html, { char: 'compass', lessons: ['m1.u1.d1'], gen: true, label: 'درس تجريبي: الوحدة 1، الدرس 1' }));
    write(join(DIST, 'packs', 'فرجار-كل-الجمل.wahawork'), makePack(rows, b.html, { char: 'compass', label: 'فرجار: كل الجمل' }));
    write(join(DIST, 'packs', 'فوضى-كل-الجمل.wahawork'), makePack(rows, b.html, { char: 'chaos', label: 'فوضى: كل الجمل' }));
  }
}
