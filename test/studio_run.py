# فحص «استوديو الواحة» في متصفح آلي بميكروفون مزيّف (مواصفة الاستوديو، القسم 9):
# الاتفاق ← الدور ← فحص الغرفة ← استيراد الحزمة التجريبية ← تسجيل جمل (ومنها ذات صيغتين) ← «شاهد المشهد» ← إرسال الدفعة
# ← أداة الاستلام على الدفعة ← حزمة الصوت يستوردها تطبيق الأطفال فتُسمع الجمل بالتسجيل لا بصوت الجهاز.
# الاستعمال: node build/build.mjs --dev && node build/studio.mjs && python3 test/studio_run.py
import asyncio, http.server, json, math, os, struct, subprocess, sys, tempfile, threading, wave, zipfile, functools
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..'); DIST = os.path.join(ROOT, 'dist')
OUT = os.path.join(HERE, 'out', 'studio'); os.makedirs(OUT, exist_ok=True)
PACK = os.path.join(DIST, 'packs', 'تجريبي-فرجار-الوحدة1-الدرس1.wahawork')
bugs = []
def bug(*a): bugs.append(' '.join(map(str, a))); print('  ✗', *a, flush=True)

def fake_voice(path):   # «كلام» مزيّف: 1.2 ث نغمات متغيّرة ثم 0.9 ث صمت، يدور بلا نهاية في الميكروفون المزيّف
  sr = 48000; fr = []
  for i in range(int(sr * 2.1)):
    t = i / sr; v = 0.0
    if t < 1.2: env = math.sin(math.pi * t / 1.2) ** .5; v = env * (0.25 * math.sin(2 * math.pi * (180 + 40 * math.sin(6 * t)) * t) + 0.1 * math.sin(2 * math.pi * 540 * t))
    fr.append(struct.pack('<h', int(max(-1, min(1, v)) * 32767)))
  with wave.open(path, 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(b''.join(fr))

def serve(root):
  h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=root); h.log_message = lambda *a, **k: None
  s = http.server.ThreadingHTTPServer(('127.0.0.1', 0), h); threading.Thread(target=s.serve_forever, daemon=True).start(); return s

async def main():
  wav = os.path.join(OUT, 'fake_voice.wav'); fake_voice(wav)
  srv = serve(DIST); base = 'http://127.0.0.1:%d/' % srv.server_address[1]
  async with async_playwright() as p:
    b = await p.chromium.launch(args=['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--use-file-for-fake-audio-capture=' + wav, '--autoplay-policy=no-user-gesture-required'])
    ctx = await b.new_context(**p.devices['Pixel 5'], accept_downloads=True); await ctx.grant_permissions(['microphone'], origin=base.rstrip('/'))
    pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append('console: ' + m.text))
    await pg.goto(base + 'studio/index.html'); await pg.wait_for_timeout(400)
    # الاتفاق
    if await pg.is_disabled('#aGo') is False: bug('«متابعة» مفعّل قبل الموافقة')
    await pg.fill('#aName', 'معلق الفحص'); await pg.check('#aOk'); await pg.click('#aGo')
    await pg.click('#roles button >> nth=0')
    # فحص الغرفة: صمت 5 ث ثم جملة
    await pg.click('#micGo'); await pg.wait_for_timeout(5600); await pg.click('#micGo'); await pg.wait_for_timeout(2600); await pg.click('#micGo'); await pg.wait_for_timeout(300)
    v = await pg.text_content('#micVerdict'); print('فحص الغرفة:', v)
    if not v: bug('فحص الغرفة بلا حكم')
    await pg.click('#micGo'); await pg.wait_for_timeout(300)
    await pg.screenshot(path=OUT + '/01_home_empty.png')
    # الاستيراد
    await pg.set_input_files('#fileIn', PACK); await pg.wait_for_timeout(800)
    n = await pg.eval_on_selector_all('#list .item', 'e => e.length'); print('جمل الحزمة في القائمة:', n, await pg.evaluate("() => [...document.querySelectorAll('.toast')].map(t => t.textContent)"), errs[:3])
    if n < 20: bug('القائمة قصيرة بعد الاستيراد', n)
    await pg.screenshot(path=OUT + '/02_home_pack.png')
    m = json.loads(zipfile.ZipFile(PACK).read('manifest.json')); rows = m['rows']
    gi = next(i for i, r in enumerate(rows) if r['f'] is not None)
    # تسجيل: أول ثلاث جمل، وأول جملة بصيغتين (صيغتان)
    async def record_line(i, forms):
      await pg.click('#sHome .tab[data-t=all]'); await pg.wait_for_timeout(100); await pg.click('#list .item >> nth=%d' % i); await pg.wait_for_timeout(200)
      for k in range(forms):
        await pg.click('#recBtn'); await pg.wait_for_timeout(2900); await pg.click('#recBtn'); await pg.wait_for_timeout(500)
        if await pg.is_hidden('#review'): await pg.screenshot(path=OUT + '/err_rec.png'); bug('لا مراجعة بعد التسجيل', rows[i]['id'], await pg.text_content('#recTime'), await pg.text_content('#recBtn'), errs[:3]); return
        chk = await pg.text_content('#checks')
        if 'لم يُسمع' in chk: bug('التسجيل فارغ', rows[i]['id'], chk); return
        if k == 0 and forms == 2 and not await pg.eval_on_selector('#lText', 'e => !!e.querySelector(".d")'): bug('لا تلوين لكلمات الصيغة', rows[i]['id'])
        await pg.click('#okBtn'); await pg.wait_for_timeout(250)
      await pg.click('#lBack'); await pg.wait_for_timeout(200)
    for i in (0, 1, 2): await record_line(i, 2 if rows[i]['f'] is not None else 1)
    if gi > 2: await record_line(gi, 2)
    nt = await pg.evaluate("() => DB.all('takes').then(t => t.length)"); want = sum(2 if rows[i]['f'] is not None else 1 for i in {0, 1, 2, gi}); print('التسجيلات المحفوظة:', nt, 'المتوقع', want)
    if nt != want: bug('عدد التسجيلات', nt, want)
    await pg.click('#list .item >> nth=0'); await pg.wait_for_timeout(300); await pg.screenshot(path=OUT + '/03_line.png')
    # «شاهد المشهد» لجملة في الخريطة
    ci = next((i for i, r in enumerate(rows) if r.get('at') and r['lesson'] and i > 3), None)
    if ci is None: bug('لا جملة بخريطة سياق في الحزمة')
    else:
      await pg.click('#lBack'); await pg.click('#list .item >> nth=%d' % ci); await pg.click('#lCtx')
      try: await pg.wait_for_selector('#ctxShow:not([hidden])', timeout=150000)
      except Exception: bug('«شاهد المشهد» لم يظهر', rows[ci]['id'], await pg.text_content('#ctxMsg'))
      else:
        fr = pg.frame_locator('#ctxShow'); say = await fr.locator('#say').text_content(); stage = await fr.locator('#stage svg').count()
        print('المشهد:', rows[ci]['id'], '| الفقاعة:', say[:50], '| رسم:', stage)
        if not stage: bug('اللقطة بلا مسرح', rows[ci]['id'])
        await pg.screenshot(path=OUT + '/04_context.png')
      await pg.click('#ctxClose'); await pg.click('#lBack')
    # وجملة لا يبلغها السائق: لقطة جملة شقيقة من مشهدها، ويُقال ذلك
    ni = next((i for i, r in enumerate(rows) if r.get('near')), None)
    if ni is not None:
      await pg.click('#list .item >> nth=%d' % ni); await pg.click('#lCtx')
      try: await pg.wait_for_selector('#ctxShow:not([hidden])', timeout=150000)
      except Exception: bug('«شاهد المشهد» للشقيقة لم يظهر', rows[ni]['id'], await pg.text_content('#ctxMsg'))
      else:
        m2 = await pg.text_content('#ctxMsg'); print('الشقيقة:', rows[ni]['id'], '←', rows[ni]['near'], '|', m2[:60])
        if 'شقيقة' not in m2: bug('لم يُقل إن المشهد لجملة شقيقة')
      await pg.click('#ctxClose'); await pg.click('#lBack')
    # الإرسال
    await pg.wait_for_selector('#unsent:not([hidden])')
    async with pg.expect_download(timeout=60000) as dl: await pg.click('#sendBtn')
    d = await dl.value; ret = os.path.join(OUT, d.suggested_filename); await d.save_as(ret); print('الدفعة:', d.suggested_filename, os.path.getsize(ret), 'بايت')
    z = zipfile.ZipFile(ret); rj = json.loads(z.read('returns.json')); exts = {x['file'].rsplit('.', 1)[1] for x in rj['items']}
    print('في الدفعة:', len(rj['items']), 'ملفاً بصيغة', exts, '· التسلسل', rj['seq'])
    if len(rj['items']) != want: bug('ملفات الدفعة', len(rj['items']), want)
    if exts != {'ogg'}: bug('الدفعة ليست Opus', exts)
    if not rj['sender'].get('agreedAt'): bug('لا موافقة في الدفعة')
    if not await pg.is_hidden('#unsent'): bug('ما زال «لم تُرسل» بعد الإرسال')
    # إعادة التشغيل: كل شيء باقٍ
    await pg.reload(); await pg.wait_for_timeout(600)
    if await pg.is_hidden('#sHome') or await pg.eval_on_selector_all('#list .dot.done', 'e => e.length') < 3: bug('ضاع العمل بعد إعادة الفتح')
    # دفعة ثانية فارغة لا تُرسل، والدفعة السابقة تُعاد من الإعدادات
    await b.close()
  # أداة الاستلام
  with tempfile.TemporaryDirectory() as td:
    r = subprocess.run([sys.executable, os.path.join(ROOT, 'tools', 'studio_import.py'), ret, ret, '--out', td], capture_output=True, text=True); print(r.stdout)
    if r.returncode: bug('أداة الاستلام', r.returncode, r.stderr[-400:])
    vz = zipfile.ZipFile(os.path.join(td, 'حزمة_الصوت.zip')); names = vz.namelist(); print('حزمة الصوت:', len(names), names[:4])
    if len(names) != want: bug('ملفات حزمة الصوت', len(names), want)
    rep = open(os.path.join(td, 'تقرير.md'), encoding='utf-8').read()
    if 'مكرّرة' not in rep: bug('الدفعة المكرّرة لم تُعرف')
    for nm in names[:2]:
      pr = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_name,channels,sample_rate,bit_rate', '-of', 'json', os.path.join(td, 'voice', nm)], capture_output=True, text=True)
      st = json.loads(pr.stdout)['streams'][0]; print(' ', nm, st)
      if st['codec_name'] != 'mp3' or st['channels'] != 1: bug('صيغة الناتج', nm, st)
    vp = os.path.join(OUT, 'حزمة_الصوت.zip'); import shutil; shutil.copy(os.path.join(td, 'حزمة_الصوت.zip'), vp)
  # تطبيق الأطفال يستورد الحزمة (لوحة الكبار ← حزمة الصوت)
  async with async_playwright() as p:
    b = await p.chromium.launch(); pg = await (await b.new_context(**p.devices['Pixel 5'])).new_page()
    await pg.goto('file://' + os.path.abspath(os.path.join(DIST, 'واحة_الرياضيات.dev.html')) + '#fast&seed=7'); await pg.wait_for_timeout(500)
    await pg.evaluate("() => openPanel()"); await pg.wait_for_timeout(200)
    await pg.set_input_files('#vpIn', vp); await pg.wait_for_function("() => /استُورد|لم يُستورد|تعذّر/.test(document.querySelector('#vpMsg').textContent)", timeout=30000)
    got = await pg.evaluate("() => VPACK.n"); print('تطبيق الأطفال:', await pg.text_content('#vpMsg'), '· المقاطع', got)
    if got != want: bug('تطبيق الأطفال لم يستورد الحزمة كلها', got, want)
    await b.close()
  srv.shutdown()
  print('أخطاء الصفحة:', len(errs)); [print(' ', e[:300]) for e in errs[:10]]
  if errs: bugs.append('أخطاء الصفحة')
  print('الخلاصة:', 'نجح' if not bugs else 'أخفق: ' + ' | '.join(bugs))
  return int(bool(bugs))
sys.exit(asyncio.run(main()))
