// بناء «واحة الرياضيات»: يدمج src/ وcontent/ في ملف واحد يعمل دون اتصال (D246).
//   node build/build.mjs          ← dist/واحة_الرياضيات.html (نسخة الأطفال: بلا خطافات فحص ولا وضع #fast)
//   node build/build.mjs --dev    ← dist/واحة_الرياضيات.dev.html (نسخة الفحص: تبقي TESTHOOK و#fast و#test لأدوات test/)
//   خطوات كل بناء: فحص المحتوى (lint) → حقن CONTENT → تضمين الخط إن وُجد assets/fonts/BalooBhaijaan2.woff2 → جدول التسجيل dist/script_m1.xlsx
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lint } from './lint.mjs';
import { loadContent, readModules } from './content.mjs';
import { writeScript } from './script.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src'), DIST = join(ROOT, 'dist'), CONTENT_DIR = join(ROOT, 'content');
const FONT = join(ROOT, 'assets', 'fonts', 'BalooBhaijaan2.woff2');
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
/* الخط: إن وُجد الملف المضمّن (OFL) نحقنه كـ @font-face بصيغة data: ونحذف روابط Google؛ وإلا نُبقي الرابط غير الحاجب كما هو */
export function embedFont(head) {
  if (!existsSync(FONT)) return { head, embedded: false };
  const b64 = readFileSync(FONT).toString('base64');
  const face = `@font-face { font-family: "Baloo Bhaijaan 2"; font-style: normal; font-weight: 500 800; font-display: swap; src: url(data:font/woff2;base64,${b64}) format("woff2"); }\n`;
  head = head.replace(/<link rel="preconnect" href="https:\/\/fonts\.g[^>]*>\n/g, '').replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>\n/, '');
  head = head.replace('<!-- الخط: يُضمَّن ملف Baloo Bhaijaan 2 (OFL) في خطوة البناء عند توفّره (D232)؛ حتى ذلك الحين رابط غير حاجب وبدائل نظام عربية -->', '<!-- الخط Baloo Bhaijaan 2 (OFL) مضمّن في الملف (D232) -->');
  head = head.replace('<style>\n', '<style>\n' + face);
  return { head, embedded: true };
}

export function build({ dev = false } = {}) {
  const content = loadContent(); const modules = readModules();
  const L = lint(content, modules); if (L.errors.length) { console.error(L.summary); for (const e of L.errors) console.error('  مخالفة:', e); throw new Error('أوقف البناءَ فحصُ المحتوى'); }
  const font = embedFont(read(join(SRC, 'head.html')).replace('@@STYLES@@', read(join(SRC, 'styles.css'))));
  const body = read(join(SRC, 'body.html')), tail = read(join(SRC, 'tail.html'));
  const js = stripHooks(modules, dev);
  const html = font.head + body + '<script>\n\'use strict\';\nconst CONTENT = ' + JSON.stringify(content) + ';\n' + js + '</script>\n' + tail;
  return { html, content, modules, lint: L, fontEmbedded: font.embedded };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dev = process.argv.includes('--dev');
  mkdirSync(DIST, { recursive: true });
  const r = build({ dev });
  const out = join(DIST, dev ? 'واحة_الرياضيات.dev.html' : 'واحة_الرياضيات.html');
  writeFileSync(out, r.html);
  console.log(r.lint.summary); for (const w of r.lint.warn) console.log('  تنبيه:', w);
  console.log('الخط:', r.fontEmbedded ? 'مضمّن من assets/fonts/BalooBhaijaan2.woff2' : 'غير مضمّن (رابط غير حاجب) — ضع الملف في assets/fonts/ ليُضمَّن');
  const s = writeScript(r.content, r.modules, DIST);
  console.log(`جدول التسجيل: ${s.nclips} جملة، ${s.nfiles} ملفاً صوتياً${s.xlsx ? ' → dist/script_m1.xlsx' : ' (json فقط)'}`); for (const p of s.problems) console.log('  مشكلة:', ...p);
  console.log('كُتب', out, Math.round(r.html.length / 1024), 'KB', dev ? '(نسخة الفحص --dev)' : '(نسخة الأطفال)');
}
