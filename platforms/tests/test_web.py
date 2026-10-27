# فحص نسخة الويب (out/site) كما تُنشر على GitHub Pages تحت مسار فرعي (/waha-math/):
#   الصفحة تفتح بلا أخطاء، وملف التثبيت صالح وأيقوناته موجودة، وعامل الخدمة يعمل، ثم بلا إنترنت تفتح الصفحة من الذاكرة
#   ويُكمل الطفل منها، وعامل الخدمة لا يحذف ذاكرة تطبيق آخر على العنوان نفسه.
# الاستعمال: python3 platforms/tests/test_web.py [مجلد الإخراج=out]
import asyncio, functools, http.server, json, os, shutil, sys, tempfile, threading
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'out'))
checks = []
def check(ok, msg):
    checks.append(ok); print(('OK  ' if ok else 'FAIL'), msg, flush=True)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


async def main():
    tmp = tempfile.mkdtemp(); shutil.copytree(os.path.join(OUT, 'site'), os.path.join(tmp, 'waha-math'))
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=tmp))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/waha-math/' % srv.server_address[1]
    man = json.load(open(os.path.join(OUT, 'site', 'manifest.webmanifest'), encoding='utf-8'))
    check(man['start_url'] == './' and man['scope'] == './' and all(os.path.exists(os.path.join(OUT, 'site', i['src'])) for i in man['icons']), 'ملف التثبيت: البداية والمجال نسبيّان، والأيقونات موجودة')
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(**p.devices['Pixel 5']); pg = await ctx.new_page()
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(base); await pg.wait_for_timeout(500)
        await pg.evaluate("caches.open('waha-app-other').then(c => c.put('/x', new Response('x')))")   # ذاكرة تطبيق آخر على العنوان نفسه
        ready = await pg.evaluate("async () => { const r = await navigator.serviceWorker.ready; return !!r.active && r.scope; }")
        check(bool(ready) and ready.endswith('/waha-math/'), 'عامل الخدمة يعمل على مجال التطبيق وحده (%s)' % ready)
        await pg.reload(); await pg.wait_for_timeout(800)
        keys = await pg.evaluate("caches.keys()")
        check(any(k.startswith('waha-math-') for k in keys) and 'waha-app-other' in keys, 'ذاكرة التطبيق محفوظة، وذاكرة غيره باقية %s' % keys)
        await pg.click('#startBtn'); await pg.wait_for_timeout(500)
        await pg.click('.av[data-av="f3"]'); await pg.click('#pSave'); await pg.wait_for_timeout(700)
        check(await pg.evaluate("!document.getElementById('home').hidden"), 'الطفل يصل إلى الشاشة الرئيسية على الويب')
        await ctx.set_offline(True)
        await pg.reload(); await pg.wait_for_timeout(1200)
        st = await pg.evaluate("() => ({ home: !document.getElementById('home').hidden, kids: !!localStorage.getItem('hp_kids'), title: document.title })")
        check(st['home'] and st['kids'], 'بلا إنترنت: الصفحة تفتح من الذاكرة بتقدّم الطفل %s' % st)
        await pg.click('.stop.now'); await pg.wait_for_timeout(1500)
        check(await pg.evaluate("[...document.querySelectorAll('.choices .pick')].map(b => b.dataset.k).join() === 'mat,screen'"), 'بلا إنترنت: الدرس الأول يبدأ')
        check(not errs, 'لا أخطاء في الصفحة %s' % errs[:3])
        await b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('FAILS:', checks.count(False)); sys.exit(1 if False in checks else 0)

asyncio.run(main())
