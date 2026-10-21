// بناء «واحة الرياضيات»: يدمج src/ في ملف واحد يعمل دون اتصال.
// الاستعمال: node build/build.mjs            ← dist/واحة_الرياضيات.html
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src'), DIST = join(ROOT, 'dist');
const read = p => readFileSync(p, 'utf8');

export function build() {
  const head = read(join(SRC, 'head.html')).replace('@@STYLES@@', read(join(SRC, 'styles.css')));
  const body = read(join(SRC, 'body.html'));
  const tail = read(join(SRC, 'tail.html'));
  const modules = readdirSync(join(SRC, 'js')).filter(f => f.endsWith('.js')).sort();
  const js = modules.map(f => read(join(SRC, 'js', f))).join('');
  return head + body + '<script>\n\'use strict\';\n' + js + '</script>\n' + tail;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  mkdirSync(DIST, { recursive: true });
  const out = join(DIST, 'واحة_الرياضيات.html');
  const html = build();
  writeFileSync(out, html);
  console.log('كُتب', out, html.length, 'حرفاً');
}
