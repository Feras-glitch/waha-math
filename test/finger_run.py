# الإصبع الموحّد (D273، src/js/29_finger.js): تتبّع الحافة بإصبعٍ «مهمل» حقيقي (أحداث مؤشّر من المتصفح، لا استدعاءات):
# يقطع الزوايا، ويرتجف حول الحافة، ويسرع بنقاط قليلة، ويرفع إصبعه ويستأنف، ويسير في الاتجاهين، وعلى المربع المدار.
# المطلوب: الرؤوس تُعدّ كلها وأرقامها متتالية بترتيب الدوران، والخط على الحافة نفسها، ولمسُ الرؤوس وحده لا يعدّها.
# الاستعمال: node build/build.mjs --dev && python3 test/finger_run.py
import asyncio, math, os, random, sys
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); FILE = os.path.join(HERE, '..', 'dist', 'واحة_الرياضيات.dev.html')
OUT = os.path.join(HERE, 'out', 'finger'); os.makedirs(OUT, exist_ok=True)
bugs = []
def bug(*a): bugs.append(' '.join(map(str, a))); print('  ✗', *a, flush=True)

SETUP = """(shapes) => { document.querySelectorAll('.screen').forEach(x => x.hidden = x.id !== 'lesson'); document.querySelectorAll('.cover').forEach(x => x.hidden = true);
  const svg = newStage(300); window.__svg = svg; window.__done = false;
  traceTool(svg, shapes).then(() => { window.__done = true; });
  window.__geo = shapes.map(s => s.type === 'circle' ? { c: [s.x, s.y], r: shapeGeom(s).r } : { P: worldPoly(s) });
  window.__cl = (x, y) => { const m = svg.getScreenCTM(); return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]; }; return true; }"""
STATE = """() => ({ done: window.__done,
  badges: [...window.__svg.querySelectorAll('[data-badge]')].map(b => { const t = b.getAttribute('transform').match(/translate\\(([-\\d.]+)[ ,]+([-\\d.]+)/); return [b.textContent.trim(), +t[1], +t[2]]; }),
  ink: [...window.__svg.querySelectorAll('path[stroke-linecap=round][opacity="0.85"]')].map(p => p.getAttribute('d')).join(' ') })"""

def perim(P, cut, n_side, noise, rnd, reverse=False):
  """مسار إصبع حول مضلّع: يقطع كل زاوية بمقدار cut، ويرتجف noise، وn_side نقطة لكل ضلع"""
  P = P[::-1] if reverse else P; pts = []; m = len(P)
  for k in range(m + 1):
    a, b = P[k % m], P[(k + 1) % m]; L = math.hypot(b[0] - a[0], b[1] - a[1]); ux, uy = (b[0] - a[0]) / L, (b[1] - a[1]) / L
    for i in range(n_side):
      t = cut + (L - 2 * cut) * i / max(1, n_side - 1); x, y = a[0] + ux * t, a[1] + uy * t
      pts.append([x + rnd.uniform(-noise, noise), y + rnd.uniform(-noise, noise)])
  return pts

def circ(c, r, n, noise, rnd, turns=1.05):
  return [[c[0] + (r + rnd.uniform(-noise, noise)) * math.cos(-math.pi / 2 + 2 * math.pi * turns * i / n), c[1] + (r + rnd.uniform(-noise, noise)) * math.sin(-math.pi / 2 + 2 * math.pi * turns * i / n)] for i in range(n + 1)]

async def stroke(pg, pts, steps=2):
  cl = [await pg.evaluate('([x, y]) => __cl(x, y)', p) for p in pts]
  await pg.mouse.move(*cl[0]); await pg.mouse.down()
  for q in cl[1:]: await pg.mouse.move(*q, steps=steps)
  await pg.mouse.up(); await pg.wait_for_timeout(120)

def on_edge(geo, x, y):
  if 'r' in geo: return abs(math.hypot(x - geo['c'][0], y - geo['c'][1]) - geo['r'])
  P = geo['P']; best = 1e9
  for k in range(len(P)):
    a, b = P[k], P[(k + 1) % len(P)]; vx, vy = b[0] - a[0], b[1] - a[1]; t = max(0, min(1, ((x - a[0]) * vx + (y - a[1]) * vy) / (vx * vx + vy * vy)))
    best = min(best, math.hypot(x - a[0] - t * vx, y - a[1] - t * vy))
  return best

async def case(pg, name, shapes, strokes_fn, expect_done=True, expect_badges=None, shot=False):
  await pg.evaluate(SETUP, shapes); await pg.wait_for_timeout(1700)   # يدُ العرض الأولى (firstTime) تمرّ قبل الإصبع
  geo = await pg.evaluate('() => __geo')
  for pts in strokes_fn(geo): await stroke(pg, pts)
  await pg.wait_for_timeout(300); st = await pg.evaluate(STATE)
  b = st['badges']; nums = [x[0] for x in b]   # بترتيب ظهورها (ترتيب العدّ)
  ok = True
  if expect_done is not None and st['done'] != expect_done: bug(name, 'الإكمال', st['done'], 'والمتوقع', expect_done); ok = False
  if expect_badges is not None and len(b) != expect_badges: bug(name, 'عدد الرؤوس المعدودة', len(b), 'والمتوقع', expect_badges, nums); ok = False
  # الأرقام متتالية بترتيب الدوران: كل رأس تالٍ جارُ الذي قبله، وفي الاتجاه نفسه
  poly = next((g['P'] for g in geo if 'P' in g), None)
  if poly and len(b) >= 3:
    idx = [min(range(len(poly)), key=lambda k: math.hypot(poly[k][0] - x, poly[k][1] - y)) for _, x, y in b]; m = len(poly)
    steps_ = {(idx[i + 1] - idx[i]) % m for i in range(len(idx) - 1)}
    if not (steps_ == {1} or steps_ == {m - 1}): bug(name, 'الأرقام ليست بترتيب الدوران', list(zip(nums, idx))); ok = False
  # الخط على الحافة: كل نقطة فيه على حافّة أحد الأشكال (±1.5)
  coords = [float(v) for v in st['ink'].replace('M', ' ').replace('L', ' ').replace('l0 0', ' ').split()]
  far = max((min(on_edge(g, coords[i], coords[i + 1]) for g in geo) for i in range(0, len(coords) - 1, 2)), default=0)
  if far > 1.5: bug(name, 'الخط بعيد عن الحافة', round(far, 1)); ok = False
  if shot: await pg.screenshot(path=os.path.join(OUT, name + '.png'))
  print(('  ✓ ' if ok else '  … ') + name, '| أُكمل:', st['done'], '| الرؤوس:', nums, '| أبعد نقطة خط عن الحافة:', round(far, 2), flush=True)

async def main():
  rnd = random.Random(7)
  async with async_playwright() as p:
    b = await p.chromium.launch(); pg = await (await b.new_context(**p.devices['Pixel 5'])).new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.goto('file://' + os.path.abspath(FILE) + '#seed=7'); await pg.wait_for_timeout(600)
    SQ = [{'type': 'square', 'kind': 'square', 'size': 124, 'x': 180, 'y': 140}]
    await case(pg, 'مربع_قاطع_الزوايا', SQ, lambda g: [perim(g[0]['P'], 22, 4, 9, rnd)], True, 4, shot=True)
    await case(pg, 'مربع_عكس_الاتجاه_سريع', SQ, lambda g: [perim(g[0]['P'], 26, 3, 11, rnd, reverse=True)], True, 4)
    await case(pg, 'مربع_رفع_واستئناف', SQ, lambda g: (lambda path: [path[:7], path[6:]])(perim(g[0]['P'], 18, 5, 8, rnd)), True, 4)
    await case(pg, 'لمس_الرؤوس_وحده_لا_يعدّ', SQ, lambda g: [[v, [v[0] + 1, v[1] + 1]] for v in g[0]['P']], False, 0)
    await case(pg, 'قفز_بين_الرؤوس_بلا_حافة', SQ, lambda g: [[g[0]['P'][0], [180, 140], g[0]['P'][2]]], False, 0)
    ROT = [{'type': 'square', 'kind': 'square', 'size': 124, 'rot': 45, 'x': 180, 'y': 140}]
    await case(pg, 'مربع_مدار', ROT, lambda g: [perim(g[0]['P'], 24, 4, 9, rnd)], True, 4, shot=True)
    await case(pg, 'مستطيل', [{'type': 'rect', 'kind': 'rect', 'w': 170, 'h': 96, 'x': 180, 'y': 140}], lambda g: [perim(g[0]['P'], 20, 4, 9, rnd)], True, 4)
    await case(pg, 'مثلث', [{'type': 'triangle', 'kind': 'triangle', 'w': 150, 'h': 130, 'x': 180, 'y': 145}], lambda g: [perim(g[0]['P'], 20, 4, 8, rnd)], True, 3)
    await case(pg, 'دائرة_مرتجفة', [{'type': 'circle', 'kind': 'circle', 'size': 124, 'x': 180, 'y': 140}], lambda g: [circ(g[0]['c'], g[0]['r'], 20, 12, rnd)], True, 0, shot=True)
    await case(pg, 'دائرة_نصفها_فقط', [{'type': 'circle', 'kind': 'circle', 'size': 124, 'x': 180, 'y': 140}], lambda g: [circ(g[0]['c'], g[0]['r'], 12, 8, rnd, turns=.5)], False, 0)
    TWO = [{'type': 'circle', 'kind': 'circle', 'size': 124, 'x': 92, 'y': 140}, {'type': 'square', 'kind': 'square', 'size': 124, 'x': 268, 'y': 140}]
    await case(pg, 'درس1_الدائرة_ثم_المربع', TWO, lambda g: [circ(g[0]['c'], g[0]['r'], 22, 10, rnd), perim(g[1]['P'], 22, 4, 9, rnd)], True, 4, shot=True)
    await b.close()
  print('أخطاء الصفحة:', len(errs)); [print(' ', e[:300]) for e in errs[:5]]
  if errs: bugs.append('أخطاء الصفحة')
  print('الخلاصة:', 'نجح' if not bugs else 'أخفق: ' + ' | '.join(bugs)); return int(bool(bugs))
sys.exit(asyncio.run(main()))
