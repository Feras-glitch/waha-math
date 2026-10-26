// بناء «واحة الرياضيات»: يدمج src/ وcontent/ في ملف واحد يعمل دون اتصال (D246).
//   node build/build.mjs          ← dist/واحة_الرياضيات.html (نسخة الأطفال: بلا خطافات فحص ولا وضع #fast)
//   node build/build.mjs --dev    ← dist/واحة_الرياضيات.dev.html (نسخة الفحص: تبقي TESTHOOK و#fast و#test لأدوات test/)
//   خطوات كل بناء: فحص المحتوى (lint) → حقن CONTENT → تضمين الخطّين من assets/fonts/ (D256) → جدول التسجيل dist/script_m1.xlsx
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lint } from './lint.mjs';
import { matNums } from './d240.mjs';
import { loadContent, readModules } from './content.mjs';
import { writeScript } from './script.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src'), DIST = join(ROOT, 'dist'), CONTENT_DIR = join(ROOT, 'content');
const FONTS = join(ROOT, 'assets', 'fonts');
const read = p => readFileSync(p, 'utf8');
const json = p => JSON.parse(read(p));

/* يجمع content/ في كائن واحد: {gen, labels, errors, units: [{...unit.json, lessons: [d1.json, …]}]} */

// خطافات الفحص محاطة في المصدر بعلامتي T (تعليق فتح «/*T*/» وتعليق إغلاق «/*/T*/»): البناء الإنتاجي يحذفها كلها، وبناء --dev يحذف العلامتين فقط
const T_RX = /\/\*T\*\/([\s\S]*?)\/\*\/T\*\//g;
export function stripHooks(js, dev) {
  if (dev) return js.replace(T_RX, '$1');
  js = js.replace(T_RX, '');
  js = js.replace(/^const TESTHOOK = +false;.*\n/m, '');                                // كل استعمالاته داخل خطافات حُذفت، فيُحذف تعريفه
  js = js.replace(/FAST \? ([\d.]+) : ([\d.]+)/g, '$2');                                  // مدد الحركة: نبقي القيمة الحقيقية فقط
  js = js.replace("location.hash = FAST ? '#fast' : '';", "location.hash = '';");
  const left = js.match(/window\.__\w+|TESTHOOK|#fast|#test|__gateAns|dataset\.ok|data-ok/g);
  if (left) throw new Error('بقايا خطافات فحص في النسخة الإنتاجية: ' + [...new Set(left)].join(', '));
  return js;
}
/* الخطّان (D232، D256): يُضمَّنان دائماً من assets/fonts/ كـ @font-face بصيغة data:، بلا شبكة. يكتبهما tools/fonts/make_fonts.py مقتطَعَين
   (خط القراءة Waha Naskh من Scheherazade New، وخط العناوين Baloo Bhaijaan 2)، ويصف fonts.json الأوجه والحروف التي يغطّيها كل وجه.
   ويوقف البناءَ حرفٌ عربي أو لاتيني في المحتوى أو الكود لا يغطّيه خط القراءة، فلا يظهر للطفل بخط بديل */
const TEXT_RANGES = [[0x20, 0x7E], [0xA0, 0xFF], [0x600, 0x6FF], [0x750, 0x77F], [0x8A0, 0x8FF], [0xFB50, 0xFDFF], [0xFE70, 0xFEFE], [0x2010, 0x2027]];
const FORMAT_CHARS = c => (c >= 0x200B && c <= 0x200F) || (c >= 0x2066 && c <= 0x2069) || c === 0xAD;
export function embedFonts(head, texts) {
  const manPath = join(FONTS, 'fonts.json');
  if (!existsSync(manPath)) throw new Error('assets/fonts/fonts.json غير موجود: شغّل tools/fonts/make_fonts.py (D256)');
  const faces = json(manPath).faces;
  const css = faces.map(f => {
    const p = join(FONTS, f.file); if (!existsSync(p)) throw new Error('ملف الخط غير موجود: assets/fonts/' + f.file + ' (tools/fonts/make_fonts.py)');
    return `@font-face { font-family: "${f.family}"; font-style: normal; font-weight: ${f.weight}; font-display: block; src: url(data:font/${f.format};base64,${readFileSync(p).toString('base64')}) format("${f.format}"); }\n`;
  }).join('');
  const read = faces.filter(f => f.role === 'read'); const cov = new Set();
  for (const f of read) for (const [a, b] of f.covers) for (let c = a; c <= b; c++) cov.add(c);
  const bad = new Map();
  for (const t of texts) for (const ch of t) { const c = ch.codePointAt(0);
    if (TEXT_RANGES.some(([a, b]) => c >= a && c <= b) && !FORMAT_CHARS(c) && !cov.has(c)) bad.set(ch, (bad.get(ch) || 0) + 1); }
  if (bad.size) throw new Error('حروف لا يغطّيها خط القراءة (D256): ' + [...bad].map(([ch, n]) => `U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')} «${ch}» ×${n}`).join('، ') + ' — أضفها إلى RANGES في tools/fonts/make_fonts.py');
  return { head: head.replace('<style>\n', '<style>\n' + css), faces };
}

export function build({ dev = false } = {}) {
  const content = loadContent(); const modules = readModules();
  const L = lint(content, modules); if (L.errors.length) { console.error(L.summary); for (const e of L.errors) console.error('  مخالفة:', e); throw new Error('أوقف البناءَ فحصُ المحتوى'); }
  /* «معي» بأعداد مسائلها (mat.avoid): لا تكون مشتّتاً مولَّداً في أسئلة الشاشة التي تخدمها (الفحص المستقل H1 (10أ)؛ nearNums وoptsWith وteenOpts) */
  for (const u of content.units) for (const Ls of u.lessons) for (const st of Ls.flow || []) if (st && st.mat && Array.isArray(st.mat.facts)) st.mat.avoid = [...matNums(st.mat.facts).nums].filter(n => n !== 10).sort((a, b) => a - b);
  const body = read(join(SRC, 'body.html')), tail = read(join(SRC, 'tail.html'));
  const font = embedFonts(read(join(SRC, 'head.html')).replace('@@STYLES@@', read(join(SRC, 'styles.css'))), [JSON.stringify(content), modules, body, tail]);
  const js = stripHooks(modules, dev);
  const html = font.head + body + '<script>\n\'use strict\';\nconst CONTENT = ' + JSON.stringify(content) + ';\n' + js + '</script>\n' + tail;
  return { html, content, modules, lint: L, fonts: font.faces };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dev = process.argv.includes('--dev');
  mkdirSync(DIST, { recursive: true });
  const r = build({ dev });
  const out = join(DIST, dev ? 'واحة_الرياضيات.dev.html' : 'واحة_الرياضيات.html');
  writeFileSync(out, r.html);
  console.log(r.lint.summary); for (const w of r.lint.warn) console.log('  تنبيه:', w);
  console.log('الخط:', r.fonts.map(f => `${f.family} ${f.weight} (${f.file})`).join('، '), '— مضمّنة (D256)');
  const s = writeScript(r.content, r.modules, DIST);
  console.log(`جدول التسجيل: ${s.nclips} جملة، ${s.nfiles} ملفاً صوتياً${s.xlsx ? ' → dist/script_m1.xlsx' : ' (json فقط)'}`); for (const p of s.problems) console.log('  مشكلة:', ...p);
  console.log('كُتب', out, Math.round(r.html.length / 1024), 'KB', dev ? '(نسخة الفحص --dev)' : '(نسخة الأطفال)');
}
