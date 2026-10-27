# فحص APK على جهاز أندرويد افتراضي (يشغّله build-all.yml بـ android-emulator-runner على هاتف وتابلت):
# يُثبَّت التطبيق ويُفتح، ثم يُسار فيه كالطفل عبر أدوات المطوّر في WebView (نسخة الفحص debuggable وحدها):
# الترحيب، وملف الطفل، والشاشة الرئيسية، وأول درس، وزر الرجوع الحقيقي (غطاء الخروج ثم «نبقى»)؛ مع لقطات شاشة.
# الاستعمال: python3 platforms/tests/android_device_check.py <apk> <مجلد اللقطات>
import json, os, subprocess, sys, time, urllib.request
import websocket

APK, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
PKG = 'com.waha.math'


def adb(*a, check=True):
    return subprocess.run(['adb', *a], capture_output=True, text=True, check=check).stdout


def shot(name):
    png = subprocess.run(['adb', 'exec-out', 'screencap', '-p'], capture_output=True, check=True).stdout
    open(os.path.join(OUT, name + '.png'), 'wb').write(png)


res, n = {}, [0]
adb('install', '-r', APK)
res['installed'] = PKG in adb('shell', 'pm', 'list', 'packages', PKG)
adb('shell', 'am', 'start', '-W', '-n', PKG + '/.MainActivity')

sock = None
for _ in range(90):
    pid = adb('shell', 'pidof', PKG, check=False).strip()
    lines = [l.split()[-1].lstrip('@') for l in adb('shell', 'cat', '/proc/net/unix').splitlines() if 'webview_devtools_remote' in l]
    sock = next((s for s in lines if pid and s.endswith('_' + pid)), lines[0] if lines else None)
    if sock:
        break
    time.sleep(1)
assert sock, 'لا منفذ لأدوات المطوّر في WebView'
adb('forward', 'tcp:9222', 'localabstract:' + sock)
page = None
for _ in range(90):
    try:
        page = next((t for t in json.load(urllib.request.urlopen('http://127.0.0.1:9222/json')) if t.get('type') == 'page' and 'index.html' in t.get('url', '')), None)
    except Exception:
        page = None
    if page:
        break
    time.sleep(1)
assert page, 'لم تُفتح صفحة التطبيق'
ws = websocket.create_connection(page['webSocketDebuggerUrl'], suppress_origin=True, timeout=60)


def ev(expr):
    n[0] += 1
    ws.send(json.dumps({'id': n[0], 'method': 'Runtime.evaluate', 'params': {'expression': expr, 'awaitPromise': True, 'returnByValue': True}}))
    while True:
        m = json.loads(ws.recv())
        if m.get('id') == n[0]:
            return m.get('result', {}).get('result', {}).get('value')


def wait(expr, sec=40):
    for _ in range(sec * 4):
        if ev(expr):
            return True
        time.sleep(0.25)
    return False


ev("window.__errs = []; addEventListener('error', e => __errs.push(String(e.message))); addEventListener('unhandledrejection', e => __errs.push(String(e.reason))); 1")
res['start'] = wait("!!document.getElementById('startBtn') && !document.getElementById('startCover').hidden")
res['url'] = ev('location.href')
res['shim'] = ev("typeof window.__ttsEvent === 'function' && typeof window.__androidBack === 'function'")
time.sleep(1); shot('01_start')
ev("document.getElementById('startBtn').click(); 1"); time.sleep(1)
ev("document.querySelector('.av[data-av=\"f3\"]').click(); document.getElementById('pSave').click(); 1")
res['home'] = wait("!document.getElementById('home').hidden && document.querySelectorAll('.stop[data-lesson]').length >= 27")
time.sleep(1); shot('02_home')
ev("document.querySelector('.stop.now').click(); 1")
res['bag'] = wait("[...document.querySelectorAll('.choices .pick')].map(b => b.dataset.k).join() === 'mat,screen'")
ev("[...document.querySelectorAll('.choices .pick')].find(x => x.dataset.k === 'screen').click(); 1")
res['scene'] = wait("!!document.querySelector('#stage svg [role=button]') && document.getElementById('say').textContent.length > 10")
time.sleep(2); shot('03_lesson')
res['tts'] = ev("AndroidBridge.ttsState()")   # 1 صوت عربي، 2 لا صوت (تُقرأ الجمل صامتة)، 0 يُجهَّز
res['voice'] = ev("speechSynthesis.getVoices().map(v => v.voiceURI).join()")
adb('shell', 'input', 'keyevent', 'KEYCODE_BACK')
res['back_cover'] = wait("!document.getElementById('exitCover').hidden", 10)
time.sleep(1); shot('04_back')
adb('shell', 'input', 'keyevent', 'KEYCODE_BACK')
res['back_stay'] = wait("document.getElementById('exitCover').hidden && !document.getElementById('lesson').hidden", 10)
res['size'] = ev("[innerWidth, innerHeight, devicePixelRatio]")
res['errors'] = ev('__errs')
print(json.dumps(res, ensure_ascii=False, indent=1))
need = ['installed', 'start', 'shim', 'home', 'bag', 'scene', 'back_cover', 'back_stay']
bad = [k for k in need if not res.get(k)] + (['errors'] if res.get('errors') else [])
print('::notice::محرك النطق في الجهاز الافتراضي: %s' % {0: 'يُجهَّز', 1: 'صوت عربي', 2: 'لا صوت عربي (تُقرأ الجمل صامتة)'}.get(res.get('tts'), res.get('tts')))
print(('::error::أخفق: ' + ', '.join(bad)) if bad else '::notice::التطبيق يعمل على الجهاز الافتراضي')
sys.exit(1 if bad else 0)
