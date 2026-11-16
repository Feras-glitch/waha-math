# خريطة «أين تُقال كل جملة» لـ«شاهد المشهد» في الاستوديو (مواصفة الاستوديو، القسم 5).
# يشغّل كل درس بسائق الاستوديو نفسه (studio/driver.js) بثلاث سياسات (ok ثم mixed ثم deep)، ويكتب لكل جملة الدرسَ والسياسة
# اللذين يبلغانها أولاً، والدروسَ التي تُقال فيها. ثم يعيد بلوغ عيّنة من الجمل كما سيفعل الاستوديو، فيتحقق أن الخريطة تُعاد.
# الاستعمال: python3 test/studio_where.py [الإخراج=dist/studio_where.json]   (بعد node build/build.mjs --dev)
import asyncio, json, os, sys, time
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..')
FILE = os.path.join(ROOT, 'dist', 'واحة_الرياضيات.dev.html')
URL0 = 'file://' + os.path.abspath(FILE) + '#fast&seed='
# الجولات: (السياسة، البذرة). وكل جولة تبلغ جملاً لم تبلغها ما قبلها (مخازن البنود عشوائية بالبذرة). STUDIO_SEEDS يغيّر البذور
SEEDS = [x for x in os.environ.get('STUDIO_SEEDS', '7,8,9').split(',') if x]
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'dist', 'studio_where.json')
DRV = open(os.path.join(ROOT, 'studio', 'driver.js'), encoding='utf-8').read()
POLICIES = ['ok', 'mixed', 'deep', 'mat']
ROUNDS = [(p, s) for s in SEEDS for p in POLICIES if p != 'mat' or s == SEEDS[0]]

async def fresh(pg, seed):
  URL = URL0 + seed
  await pg.goto(URL); await pg.add_script_tag(content=DRV); await pg.evaluate("__studioDriver.prime('f')")
  await pg.goto('about:blank'); await pg.goto(URL); await pg.wait_for_timeout(400); await pg.add_script_tag(content=DRV)

async def main():
  ids = {r[4] for r in json.load(open(os.path.join(ROOT, 'dist', 'script_m1.json'), encoding='utf-8'))['rows']}
  async with async_playwright() as p:
    b = await p.chromium.launch(); pg = await (await b.new_context(**p.devices['Pixel 5'])).new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    await fresh(pg, SEEDS[0]); lessons = await pg.evaluate("() => UNITS.flatMap(u => u.lessons)")
    first, where, bad = {}, {}, []
    for pol, seed in ROUNDS:
      await fresh(pg, seed)
      for L in lessons:
        t = time.time(); r = await pg.evaluate("([l, p]) => __studioDriver.run(l, p, null)", [L, pol])
        if not r.get('ended') or r.get('crash'): bad.append([L, pol, seed, {k: v for k, v in r.items() if k != 'clips'}])
        for c in r['clips']:
          if c not in ids and c[-2:] in ('_m', '_f') and c[:-2] in ids: c = c[:-2]   # الجملة ذات الصيغتين تُنطق باسم ملفها (…_m)، ومعرّفها في الجدول بلا لاحقة: كانت تسقط من الخريطة ومن حزم الدروس
          if c not in ids: continue
          first.setdefault(c, [L, pol, seed]); where.setdefault(c, [])
          if L not in where[c]: where[c].append(L)
        print('..', pol, seed, L, round(time.time() - t, 1), len(set(r['clips'])), len(first), flush=True)
        await fresh(pg, seed)
    # إعادة البلوغ: عيّنة من كل سياسة، كما سيفعل الاستوديو (السائق يقف عند الجملة)
    sample = [c for rd in ROUNDS for c in [k for k, v in first.items() if (v[1], v[2]) == rd][:3]]
    miss = []
    for c in sample:
      L, pol, seed = first[c]; await fresh(pg, seed); r = await pg.evaluate("([l, p, t]) => __studioDriver.run(l, p, t)", [L, pol, c])
      say = await pg.evaluate("() => document.querySelector('#say') ? document.querySelector('#say').textContent : ''")
      if not r['found']: miss.append([c, L, pol, seed, say[:40]])
    await b.close()
  json.dump({'rounds': ROUNDS, 'first': first, 'where': where}, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
  reached = len(first); print('جمل الجدول: %d، بلغها السائق: %d، لم يبلغها: %d' % (len(ids), reached, len(ids) - reached))
  print('دروس لم تنتهِ:', len(bad)); [print(' ', *x) for x in bad[:20]]
  print('إعادة البلوغ: %d من %d' % (len(sample) - len(miss), len(sample))); [print('  لم تُبلغ:', *x) for x in miss]
  print('أخطاء الصفحة:', len(errs)); [print(' ', e[:300]) for e in errs[:10]]
  # بعض الجمل يتعلّق بلوغها بتوقيت الوضع السريع (جولات الألعاب، ترتيب بطاقتي فوضى)، فلا تُعاد كل مرة: الاستوديو يعرضها حينئذٍ نصّياً ويقول ذلك.
  # والحدّ أربعة أخماس العيّنة: دونه انكسرت الخريطة لا التوقيت
  return int(bool(bad or errs or len(miss) * 5 > len(sample)))
sys.exit(asyncio.run(main()))
