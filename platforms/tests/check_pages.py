# صفحة التطبيق داخل كل حزمة هي الصفحة المفحوصة (dist/واحة_الرياضيات.html) بايتاً بايتاً، أو هي مع التغيير المسموح وحده:
#   ويندوز: الصفحة نفسها بلا تغيير (من app/index.html داخل resources/app.asar).
#   أندرويد: الصفحة وفي أول <head> جسر أندرويد (platforms/android/shim.js)، كما يكتبها make_platforms.py.
#   الويب: الصفحة وقبل </head> البيان والأيقونات، كما يكتبها make_platforms.py.
# نشأ بعد أن وجد التحقق المستقل من الإصدار 1.0.2 صفحة ويندوز بنهايات CRLF، مختلفة البصمة عن المفحوصة: لا يُكتفى بأن البناء نجح.
# الاستعمال:
#   python3 platforms/tests/check_pages.py asar <app.asar>         (ويندوز)
#   python3 platforms/tests/check_pages.py apk <waha-math.apk> <out>  (أندرويد؛ out = ناتج make_platforms.py)
#   python3 platforms/tests/check_pages.py web <waha-math-web.zip> <out>
# يطبع «page-<منصة> <sha256>» ويخرج بـ 1 إن خالفت الصفحة.
import hashlib, json, os, struct, sys, zipfile
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
SRC = open(os.path.join(ROOT, 'dist', 'واحة_الرياضيات.html'), 'rb').read()


def asar_file(path, name):
    # صيغة asar: أربعة أعداد (4، طول رأس pickle، طول الرأس ناقص 4، طول JSON) ثم JSON ثم البيانات بعد 8 + طول الرأس
    a = open(path, 'rb').read()
    n, = struct.unpack_from('<I', a, 4); ln, = struct.unpack_from('<I', a, 12)
    node = json.loads(a[16:16 + ln])
    for part in name.split('/'):
        node = node['files'][part]
    start = 8 + n + int(node['offset'])
    return a[start:start + node['size']]


def main():
    kind, pkg = sys.argv[1], sys.argv[2]
    if kind == 'asar':
        page, want = asar_file(pkg, 'app/index.html'), SRC
    else:
        out = sys.argv[3]
        inner = {'apk': 'assets/www/index.html', 'web': 'index.html'}[kind]
        page = zipfile.ZipFile(pkg).read(inner)
        want = open(os.path.join(out, {'apk': 'android-www', 'web': 'site'}[kind], 'index.html'), 'rb').read()
        # والمرجع نفسه: الصفحة المفحوصة مع التغيير المسموح وحده
        if kind == 'apk':
            shim = open(os.path.join(ROOT, 'platforms', 'android', 'shim.js'), 'rb').read()
            ref = SRC.replace(b'<head>\n', b'<head>\n<script>\n' + shim + b'</script>\n', 1)
        else:
            i, j = want.index(b'</head>'), SRC.index(b'</head>')
            ref = want if (want[:j] == SRC[:j] and want[i:] == SRC[j:]) else None
        if want != ref:
            print('FAIL page-%s: ناتج make_platforms.py ليس الصفحة المفحوصة مع التغيير المسموح وحده' % kind); sys.exit(1)
    h = hashlib.sha256(page).hexdigest()
    if page != want:
        crlf = page.count(b'\r\n')
        print('FAIL page-%s %s: الصفحة في الحزمة تخالف المتوقَّع (%d بايت مقابل %d، وفيها %d نهاية CRLF)' % ({'asar': 'windows', 'apk': 'android', 'web': 'web'}[kind], h, len(page), len(want), crlf)); sys.exit(1)
    print('page-%s %s' % ({'asar': 'windows', 'apk': 'android', 'web': 'web'}[kind], h))


main()
