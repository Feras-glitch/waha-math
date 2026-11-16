# تتبّع الأرقام (قرار فراس، 16 نوفمبر 2026): الاتجاه مفروض، والحبر متصل.
# لكل رقم مشرقي وغربي، بالفأرة الحقيقية (أحداث pointer كما في المتصفح):
#   1) السير الصحيح على الضربات بترتيبها بحركة كثيفة → ok
#   2) السير الصحيح بقفزات واسعة (كل 24 وحدة، الإصبع السريع) → ok، والحبر خطٌّ متصل واحد لكل ضربة (لا دوائر متفرّقة)
#   3) البدء من آخر الضربة الأولى والسير عكسها → traceDir (حين يختلف طرفاها)
#   4) البدء من وسط الضربة الأولى → startDot
#   5) ٥ المشرقي من النقطة الخضراء عكس عقارب الساعة → traceDir
#   6) خربشة بعيدة عن الخط → لا يُحكم بشيء
# python3 test/trace_run.py   (FILE=نسخة فحص أخرى)
import asyncio, os, sys
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
FILE = os.environ.get('FILE', os.path.join(HERE, '..', 'dist', 'واحة_الرياضيات.dev.html'))
FAILS = []
def check(ok, what): print(('ok   ' if ok else 'FAIL ') + what); (None if ok else FAILS.append(what))

SETUP = """([n, west]) => { document.querySelectorAll('[id$=Cover]').forEach(c => c.hidden = true); hush(); FLOW++; show('lesson'); window.__r = null; const svg = newStage(270, { oasis: false, ground: 0 });
  const tr = digitTrace(svg, n, 180, 136, 1.55, { noAuto: true, sk: west ? DIGIT_SK_W : null }); tr.p.then(r => window.__r = r); window.__tr = tr;
  const g = tr.g, m = g.getScreenCTM(); const scr = (x, y) => { const p = svg.createSVGPoint(); p.x = x; p.y = y; const q = p.matrixTransform(m); return [q.x, q.y]; };
  const SK = (west ? DIGIT_SK_W : DIGIT_SK)[n];
  return SK.map(P => { if (P.length < 2) return [scr(P[0][0], P[0][1])]; const path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); path.setAttribute('d', smoothPath(P)); g.appendChild(path);
    const L = path.getTotalLength(), out = []; for (let s = 0; s <= L; s += 3) { const q = path.getPointAtLength(s); out.push(scr(q.x, q.y)); } const e = path.getPointAtLength(L); out.push(scr(e.x, e.y)); path.remove(); return out; }); }"""
INK = "() => { const g = window.__tr.g; const ink = g.lastElementChild; return { paths: ink.querySelectorAll('path').length, circles: ink.querySelectorAll('circle').length }; }"

async def stroke(page, pts, every=1):
  await page.mouse.move(*pts[0]); await page.mouse.down()
  for q in pts[1::every] + [pts[-1]]: await page.mouse.move(*q)
  await page.mouse.up()

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); page = await b.new_page(viewport={'width': 412, 'height': 842})
    errs = []; page.on('pageerror', lambda e: errs.append(str(e)))
    await page.goto('file://' + FILE); await page.wait_for_timeout(800)
    for west in (False, True):
      for n in range(10):
        name = ('W' if west else 'E') + str(n)
        S = await page.evaluate(SETUP, [n, west])
        for s in S: await stroke(page, s)
        r = await page.evaluate('window.__r'); check(r == {'ok': True, 'err': None}, f'{name} السير الصحيح الكثيف: {r}')
        S = await page.evaluate(SETUP, [n, west])
        for s in S: await stroke(page, s, every=8)
        r = await page.evaluate('window.__r'); ink = await page.evaluate(INK)
        check(r == {'ok': True, 'err': None}, f'{name} السير الصحيح بقفزات (الإصبع السريع): {r}')
        check(ink['circles'] == 0 and ink['paths'] == len(S), f'{name} الحبر خطٌّ متصل لكل ضربة: {ink}')
        if len(S[0]) > 1:
          s0 = S[0]; closed = abs(s0[0][0] - s0[-1][0]) + abs(s0[0][1] - s0[-1][1]) < 30
          if not closed:
            S = await page.evaluate(SETUP, [n, west]); await stroke(page, S[0][::-1])
            r = await page.evaluate('window.__r'); check(r == {'ok': False, 'err': 'traceDir'}, f'{name} البدء من آخر الخط والسير عكسه: {r}')
          S = await page.evaluate(SETUP, [n, west]); m = len(S[0]) // 2; await stroke(page, S[0][m:])
          r = await page.evaluate('window.__r'); atStart = ((S[0][m][0] - S[0][0][0]) ** 2 + (S[0][m][1] - S[0][0][1]) ** 2) ** .5 < 24 * 1.55 + 2   # وسط ٩ عند بدايته: يُحكم بالاتجاه
          check(r == {'ok': False, 'err': 'startDot'} or (atStart and r == {'ok': False, 'err': 'traceDir'}), f'{name} البدء من الوسط: {r}')
        S = await page.evaluate(SETUP, [n, west]); x0, y0 = S[0][0]
        await stroke(page, [[x0 + 150, y0 + 20 + i * 4] for i in range(30)])
        r = await page.evaluate('window.__r'); check(r is None or r.get('ok') is False, f'{name} خربشة بعيدة لا تُحسب: {r}')
    S = await page.evaluate(SETUP, [5, False]); s0 = S[0]; await stroke(page, [s0[0]] + s0[::-1][1:])
    r = await page.evaluate('window.__r'); check(r == {'ok': False, 'err': 'traceDir'}, f'E5 من النقطة الخضراء عكس عقارب الساعة: {r}')
    check(not errs, f'لا أخطاء في الصفحة: {errs[:3]}')
    await b.close()
  print('FAILS:', len(FAILS))
  sys.exit(1 if FAILS else 0)
asyncio.run(main())
