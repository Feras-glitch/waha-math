// تحميل المحتوى (content/) — وحدة مستقلة كي يستعملها build.mjs وlint.mjs بلا استيراد دائري
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SRC = join(ROOT, 'src'), CONTENT_DIR = join(ROOT, 'content');
export const read = p => readFileSync(p, 'utf8');
export const json = p => JSON.parse(read(p));
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
export const readModules = () => readdirSync(join(SRC, 'js')).filter(f => f.endsWith('.js')).sort().map(f => read(join(SRC, 'js', f))).join('');
