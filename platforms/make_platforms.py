# يجهّز ملفات النسخ الثلاث من ناتج البناء نفسه (dist/واحة_الرياضيات.html، نسخة الأطفال بلا خطافات الفحص)، ولا يغيّر كود التطبيق:
#   out/site/             نسخة الويب (GitHub Pages): الصفحة + ملف التثبيت (manifest) + عامل خدمة يحفظها للعمل بلا إنترنت + الأيقونات
#   out/android-www/      صفحة نسخة أندرويد: الصفحة نفسها وفي أول <head> جسر أندرويد (platforms/android/shim.js)
#   out/desktop-app/      صفحة نسخة ويندوز (Electron): الصفحة كما هي، ومعها أيقونة النافذة
# الاستعمال من جذر المستودع: python3 platforms/make_platforms.py [مجلد الإخراج=out]
import hashlib, os, re, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'platforms')
OUT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'out'))
SRC = os.path.join(ROOT, 'dist', 'واحة_الرياضيات.html')


def read(p):
    return open(p, encoding='utf-8').read()


def write(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8').write(s)


def version():
    m = re.search(r'versionName "([^"]+)"', read(os.path.join(P, 'android', 'app', 'build.gradle')))
    assert m, 'versionName'
    return m.group(1)


def once(s, a, b):
    assert s.count(a) == 1, ('ليس مرة واحدة', a, s.count(a))
    return s.replace(a, b)


html = read(SRC)
assert '<head>\n' in html and html.count('</head>') == 1
assert 'TESTHOOK' not in html, 'نسخة الفحص لا تُوزَّع: المصدر نسخة الأطفال'
V = version()
H = hashlib.sha256(html.encode('utf-8')).hexdigest()[:10]

# ---------- الويب ----------
site = os.path.join(OUT, 'site')
shutil.rmtree(site, ignore_errors=True)
head = ('<link rel="manifest" href="manifest.webmanifest">\n'
        '<meta name="theme-color" content="#F6D58E">\n'
        '<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">\n'
        '<link rel="apple-touch-icon" href="icons/icon-180.png">\n'
        '<meta name="mobile-web-app-capable" content="yes">\n'
        '<meta name="apple-mobile-web-app-capable" content="yes">\n'
        '<meta name="apple-mobile-web-app-title" content="واحة الرياضيات">\n'
        '<script>/* نسخة الويب: تعمل بلا إنترنت بعد أول فتح، وتطلب من المتصفح ألّا يحذف تقدّم الأطفال */'
        "if('serviceWorker' in navigator)addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){});});"
        "try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist();}catch(e){}</script>\n")
write(os.path.join(site, 'index.html'), once(html, '</head>', head + '</head>'))
write(os.path.join(site, 'sw.js'), once(read(os.path.join(P, 'web', 'sw.js')), '@@BUILD@@', V + '-' + H))
shutil.copy2(os.path.join(P, 'web', 'manifest.webmanifest'), os.path.join(site, 'manifest.webmanifest'))
os.makedirs(os.path.join(site, 'icons'))
for n in ('icon-512.png', 'icon-192.png', 'icon-180.png'):
    shutil.copy2(os.path.join(P, 'icon', n), os.path.join(site, 'icons', n))
open(os.path.join(site, '.nojekyll'), 'w').close()

# ---------- أندرويد ----------
www = os.path.join(OUT, 'android-www')
shutil.rmtree(www, ignore_errors=True)
shim = read(os.path.join(P, 'android', 'shim.js'))
assert '</script' not in shim
write(os.path.join(www, 'index.html'), once(html, '<head>\n', '<head>\n<script>\n' + shim + '</script>\n'))

# ---------- ويندوز ----------
desk = os.path.join(OUT, 'desktop-app')
shutil.rmtree(desk, ignore_errors=True)
write(os.path.join(desk, 'index.html'), html)
shutil.copy2(os.path.join(P, 'icon', 'icon-512.png'), os.path.join(desk, 'icon.png'))

print('النسخة', V, '· الصفحة', H, '·', OUT)
