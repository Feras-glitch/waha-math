// بناء «واحة الرياضيات»: يدمج src/ في ملف واحد يعمل دون اتصال.
// الاستعمال: node build/build.mjs            ← dist/واحة_الرياضيات.html
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src'), DIST = join(ROOT, 'dist'), CONTENT_DIR = join(ROOT, 'content');
const read = p => readFileSync(p, 'utf8');
const json = p => JSON.parse(read(p));

/* يجمع content/ في كائن واحد: {gen, labels, errors, units: [{...unit.json, lessons: [d1.json, …]}]} */
export function loadContent() {
  const units = [];
  for (const m of readdirSync(CONTENT_DIR).filter(d => /^m\d+$/.test(d)).sort())
    for (const u of readdirSync(join(CONTENT_DIR, m)).filter(d => /^u\d+$/.test(d)).sort()) {
      const dir = join(CONTENT_DIR, m, u); const unit = json(join(dir, 'unit.json'));
      unit.lessons = readdirSync(dir).filter(f => /^d\d+\.json$/.test(f)).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1))).map(f => json(join(dir, f)));
      units.push(unit);
    }
  return { gen: json(join(CONTENT_DIR, 'strings', 'gen.json')), labels: json(join(CONTENT_DIR, 'strings', 'labels.json')), errors: json(join(CONTENT_DIR, 'errors.json')), units };
}

export function build() {
  const head = read(join(SRC, 'head.html')).replace('@@STYLES@@', read(join(SRC, 'styles.css')));
  const body = read(join(SRC, 'body.html'));
  const tail = read(join(SRC, 'tail.html'));
  const modules = readdirSync(join(SRC, 'js')).filter(f => f.endsWith('.js')).sort();
  const js = modules.map(f => read(join(SRC, 'js', f))).join('');
  const content = 'const CONTENT = ' + JSON.stringify(loadContent()) + ';\n';
  return head + body + '<script>\n\'use strict\';\n' + content + js + '</script>\n' + tail;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  mkdirSync(DIST, { recursive: true });
  const out = join(DIST, 'واحة_الرياضيات.html');
  const html = build();
  writeFileSync(out, html);
  console.log('كُتب', out, html.length, 'حرفاً');
}
