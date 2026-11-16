# الأصوات المضمّنة (D274): من مستودع أصوات (مصنوع للفحص، أو الحقيقي في WAHA_VOICE_REPO) إلى نسخة الويب، ثم في المتصفح:
#  ① لا يدخل إلا المعتمد الذي يطابق نصه الحالي (معتمدٌ، وغير معتمد، ونصٌّ تغيّر، وتسجيلٌ أحدث من المعتمد)
#  ② التطبيق يقول بها (CLIPS ← voice/…) ويشغّلها فعلاً، ولوحة الكبار تعدّها
#  ③ المستورد من لوحة الكبار يتقدّم عليها، وحذفه يعيدها
#  ④ بلا إنترنت بعد أول فتح: الصفحة والأصوات من ذاكرة عامل الخدمة
#  ⑤ الملف المفرد (بلا مجلد voice/) يعمل بصوت الجهاز بلا خطأ
# الاستعمال: node build/build.mjs && python3 test/voice_bundle_run.py
import asyncio, functools, hashlib, http.server, json, os, shutil, subprocess, sys, tempfile, threading, zipfile
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..'); TONE = os.path.join(HERE, 'fixtures', 'tone.mp3')
bugs = []
def check(ok, what, *more):
  print(('ok   ' if ok else 'FAIL ') + what, *more, flush=True)
  if not ok: bugs.append(what)

def th(m, f): return hashlib.sha1((m + '\n' + (f or '')).encode('utf-8')).hexdigest()[:12]

def fake_repo(d):
  rows = {r[4]: r for r in json.load(open(os.path.join(ROOT, 'dist', 'script_m1.json'), encoding='utf-8'))['rows']}
  fh = lambda rid: th(rows[rid][5], None if rows[rid][6] == '(النص نفسه)' else rows[rid][6])
  F = {'gen.numw.03': fh('gen.numw.03'), 'm1.u1.d1.hook.02_m': fh('m1.u1.d1.hook.02'), 'gen.numw.04': fh('gen.numw.04'),
       'gen.numw.05': 'ffffffffffff', 'gen.numw.06': fh('gen.numw.06')}
  os.makedirs(os.path.join(d, 'voice'))
  for f in F: shutil.copy(TONE, os.path.join(d, 'voice', f + '.mp3'))
  state = {f: {'hash': h, 'at': '2026-11-16T10:00:00Z'} for f, h in F.items()}; state['gen.numw.06']['at'] = '2026-11-16T11:00:00Z'
  appr = {f: {'hash': h, 'at': '2026-11-16T10:00:00Z'} for f, h in F.items() if f != 'gen.numw.04'}   # 04 غير معتمد، و05 نصه تغيّر، و06 تسجيلٌ أحدث من المعتمد
  json.dump({'senders': {}, 'files': state}, open(os.path.join(d, 'state.json'), 'w'), ensure_ascii=False)
  json.dump(appr, open(os.path.join(d, 'approved.json'), 'w'), ensure_ascii=False)
  return {'gen.numw.03', 'm1.u1.d1.hook.02_m'}

async def main():
  tmp = tempfile.mkdtemp(); repo = os.environ.get('WAHA_VOICE_REPO')
  if repo: expect = None
  else: repo = os.path.join(tmp, 'voice'); expect = fake_repo(repo)
  out = os.path.join(tmp, 'out')
  r = subprocess.run([sys.executable, os.path.join(ROOT, 'platforms', 'make_platforms.py'), out], env={**os.environ, 'WAHA_VOICE_REPO': repo}, capture_output=True, text=True)
  print(r.stdout.strip()); check(r.returncode == 0, 'بناء النسخ مع الأصوات', r.stderr[-300:])
  site = os.path.join(out, 'site'); idx = open(os.path.join(site, 'voice', 'index.js'), encoding='utf-8').read()
  files = json.loads(idx[idx.index('=') + 1:].strip().rstrip(';'))['files']
  if expect is not None: check(set(files) == expect, '① لا يدخل إلا المعتمد الذي يطابق نصه وتسجيله', sorted(files))
  for d in ('android-www', 'desktop-app'): check(os.path.exists(os.path.join(out, d, 'voice', 'index.js')), 'الأصوات في ' + d)
  h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=site); h.log_message = lambda *a, **k: None
  srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), h); threading.Thread(target=srv.serve_forever, daemon=True).start(); base = 'http://127.0.0.1:%d/' % srv.server_address[1]
  one = sorted(files)[0]
  async with async_playwright() as p:
    b = await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required']); ctx = await b.new_context(**p.devices['Pixel 5']); pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.goto(base + 'index.html'); await pg.wait_for_function('() => typeof VBUNDLE !== "undefined" && VBUNDLE.files', timeout=15000); await pg.wait_for_timeout(500)
    n = await pg.evaluate('() => VBUNDLE.n'); src = await pg.evaluate('(id) => CLIPS[id]', one)
    check(n == len(files), '② التطبيق يعرف الأصوات المضمّنة', n, len(files)); check(src == 'voice/' + files[one], '② الجملة تُقال بالملف المضمّن', src)
    dur = await pg.evaluate('''(u) => new Promise(r => { const a = new Audio(u); a.onloadedmetadata = () => r(a.duration); a.onerror = () => r(-1); setTimeout(() => r(-2), 8000); })''', src)
    check(dur > 0, '② الملف يُشغَّل', dur)
    await pg.evaluate('() => openPanel()'); await pg.wait_for_timeout(200); st = await pg.text_content('#vpStat')
    check('في التطبيق' in st, '② لوحة الكبار تعدّ المضمّنة', st)
    # ③ المستورد يتقدّم، وحذفه يعيد المضمّن
    zp = os.path.join(tmp, 'p.zip')
    with zipfile.ZipFile(zp, 'w') as z: z.write(TONE, one + '.mp3')
    await pg.set_input_files('#vpIn', zp); await pg.wait_for_function("() => /استُورد/.test(document.querySelector('#vpMsg').textContent)", timeout=20000)
    src2 = await pg.evaluate('(id) => CLIPS[id]', one); check(str(src2).startswith('blob:'), '③ المستورد يتقدّم على المضمّن', src2)
    r3 = await pg.evaluate('() => VPACK.clear()'); src3 = await pg.evaluate('(id) => CLIPS[id]', one)
    check(r3 == 'ok' and src3 == 'voice/' + files[one], '③ حذف المستورد يعيد المضمّن', r3, src3)
    # ④ بلا إنترنت
    try: await pg.wait_for_function('() => navigator.serviceWorker && navigator.serviceWorker.controller', timeout=20000)
    except Exception: pass
    await pg.reload(); await pg.wait_for_timeout(800); await ctx.set_offline(True); await pg.reload(); await pg.wait_for_timeout(1500)
    ok_off = await pg.evaluate('''(u) => fetch(u).then(r => r.ok && r.headers.get('content-type') !== null).catch(() => false)''', 'voice/' + files[one])
    n_off = await pg.evaluate('() => typeof VBUNDLE !== "undefined" ? VBUNDLE.n : -1')
    check(ok_off and n_off == len(files), '④ الأصوات بلا إنترنت من ذاكرة عامل الخدمة', ok_off, n_off)
    await ctx.set_offline(False)
    # ⑤ الملف المفرد بلا مجلد voice/
    pg2 = await ctx.new_page(); e2 = []; pg2.on('pageerror', lambda e: e2.append(str(e)))
    await pg2.goto('file://' + os.path.abspath(os.path.join(ROOT, 'dist', 'واحة_الرياضيات.html'))); await pg2.wait_for_timeout(1200)
    check(await pg2.evaluate('() => VBUNDLE.n') == 0 and not e2, '⑤ الملف المفرد بصوت الجهاز بلا خطأ', e2[:2])
    await b.close()
  srv.shutdown(); check(not errs, 'لا أخطاء في الصفحة', errs[:3])
  print('FAILS:', len(bugs)); return int(bool(bugs))
sys.exit(asyncio.run(main()))
