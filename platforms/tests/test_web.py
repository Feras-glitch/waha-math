# فحص نسخة الويب (out/site) كما تُنشر على GitHub Pages تحت مسار فرعي (/waha-math/):
#   الصفحة تفتح بلا أخطاء، وملف التثبيت صالح وأيقوناته موجودة، وعامل الخدمة يعمل، ثم بلا إنترنت تفتح الصفحة من الذاكرة
#   ويُكمل الطفل منها، وعامل الخدمة لا يحذف ذاكرة تطبيق آخر على العنوان نفسه.
#   ومراجعة الخصم (C-03، C-15): اتصالٌ معلّق لا يترك الطفل أمام شاشة فارغة (المحفوظة خلال ثلاث ثوانٍ)، وصفحة دخول واي فاي
#   بنصّ 200 لا تحلّ محلّ التطبيق المحفوظ ولا يراها الطفل، وتحديثٌ حقيقي يُحفظ (ضابط).
# الاستعمال: python3 platforms/tests/test_web.py [مجلد الإخراج=out]
import asyncio, functools, http.server, json, os, shutil, sys, tempfile, threading
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'out'))
checks = []
def check(ok, msg):
    checks.append(ok); print(('OK  ' if ok else 'FAIL'), msg, flush=True)


MODE = {'m': 'normal'}   # normal | hang | portal | update
SEEN = set()
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def end_headers(self):   # كل طلبٍ يبلغ الخادم (لا ذاكرة HTTP بحسب تاريخ الملف)، فكلّ حالة تقيس ما تدّعيه
        self.send_header('Cache-Control', 'no-cache'); super().end_headers()
    def do_GET(self):
        page = self.path.rstrip('/').endswith('/waha-math') or self.path.endswith('/index.html') or self.path.endswith('/waha-math/')
        if MODE['m'] == 'hang' and page:
            SEEN.add('hang-page'); import time; time.sleep(7); return super().do_GET()   # أطول من المهلة، وينتهي قبل الحالة التالية (كروم يُصفّ طلبات العنوان نفسه خلف المعلّق)
        if MODE['m'] == 'portal' and page: SEEN.add('portal-page')   # والطلب وصل الخادم فعلاً (لا مهلةٌ خلف طلبٍ معلّق)
        if MODE['m'] == 'portal':
            b = '<!doctype html><html><body><h1>Welcome to Hotel WiFi. Please log in.</h1></body></html>'.encode()
            self.send_response(200); self.send_header('Content-Type', 'text/html'); self.send_header('Content-Length', str(len(b))); self.end_headers(); self.wfile.write(b); return
        if MODE['m'] == 'update' and page:
            t = open(os.path.join(self.directory, 'waha-math', 'index.html'), encoding='utf-8').read().rstrip() + '\n<!-- update-mark -->\n'; t = t.encode()
            self.send_response(200); self.send_header('Content-Type', 'text/html; charset=utf-8'); self.send_header('Content-Length', str(len(t))); self.end_headers(); self.wfile.write(t); return
        return super().do_GET()


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
        await ctx.set_offline(False)
        CACHED = "async () => { const r = await caches.match('./index.html'); return r ? (await r.text()) : ''; }"
        APP = "() => !!document.getElementById('home') && !document.body.textContent.includes('Hotel WiFi')"
        # C-03: اتصالٌ معلّق: المحفوظة خلال ثلاث ثوانٍ
        MODE['m'] = 'hang'; SEEN.clear(); t0 = asyncio.get_event_loop().time()
        try: await pg.goto(base, wait_until='domcontentloaded', timeout=8000); ok = await pg.evaluate(APP)
        except Exception as e: ok = False
        dt = asyncio.get_event_loop().time() - t0
        check(ok and dt < 4.5 and 'hang-page' in SEEN, 'C-03 اتصالٌ معلّق: يفتح التطبيق المحفوظ خلال ثلاث ثوانٍ تقريباً، لا شاشة فارغة (%.1f ث)' % dt)
        MODE['m'] = 'normal'; await pg.wait_for_timeout(7000)
        # C-15: صفحة دخول واي فاي بنصّ 200: لا يراها الطفل مكان التطبيق، ولا تُحفظ
        MODE['m'] = 'portal'; SEEN.clear()
        try: await pg.goto(base, wait_until='domcontentloaded', timeout=8000); await pg.wait_for_timeout(600); ok = await pg.evaluate(APP)
        except Exception: ok = False
        MODE['m'] = 'normal'; await pg.wait_for_timeout(300); cached = await pg.evaluate(CACHED)
        check(ok and 'portal-page' in SEEN and 'const CONTENT = ' in cached and 'Hotel WiFi' not in cached, 'C-15 صفحة دخول واي فاي بنصّ 200: يفتح التطبيق المحفوظ، ولا تحلّ الصفحة الغريبة محلّه في الذاكرة')
        # ضابط: تحديثٌ حقيقي من الشبكة يصل ويُحفظ
        MODE['m'] = 'update'; await pg.goto(base); await pg.wait_for_timeout(4000); MODE['m'] = 'normal'; cached = await pg.evaluate(CACHED)
        check('update-mark' in cached and await pg.evaluate(APP), 'ضابط: تحديثٌ حقيقي من الشبكة يُعرض ويُحفظ')
        check(not errs, 'لا أخطاء في الصفحة %s' % errs[:3])
        await b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('FAILS:', checks.count(False)); sys.exit(1 if False in checks else 0)

asyncio.run(main())
