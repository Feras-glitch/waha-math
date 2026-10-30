# فحص APK على جهاز أندرويد افتراضي (يشغّله build-all.yml بـ android-emulator-runner على هاتف وتابلت):
# يُثبَّت التطبيق ويُفتح، ثم يُسار فيه كالطفل عبر أدوات المطوّر في WebView (نسخة الفحص debuggable وحدها):
# الترحيب، وملف الطفل، والشاشة الرئيسية، وأول درس، وزر الرجوع الحقيقي (غطاء الخروج ثم «نبقى»)؛ مع لقطات شاشة.
# الاستعمال: python3 platforms/tests/android_device_check.py <apk> <مجلد اللقطات>
import json, os, subprocess, sys, time, traceback, urllib.request
import websocket

APK, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
PKG = 'com.waha.math'


def adb(*a, check=True):
    p = subprocess.run(['adb', *a], capture_output=True, text=True)
    if check and p.returncode:
        raise RuntimeError('adb %s ← %d: %s' % (' '.join(a), p.returncode, (p.stderr or p.stdout).strip()[-800:]))
    return p.stdout


def shot(name):
    png = subprocess.run(['adb', 'exec-out', 'screencap', '-p'], capture_output=True, check=True).stdout
    open(os.path.join(OUT, name + '.png'), 'wb').write(png)


res, n = {}, [0]
ws = None


def esc(s):
    return s.replace('%', '%25').replace('\r', '').replace('\n', '%0A')


def logcat():
    # سجلّ الجهاز يُحفظ مع اللقطات دائماً، ويُعرض منه ما يخصّ WebView والتطبيق إن أخفق الفحص
    try:
        log = subprocess.run(['adb', 'logcat', '-d', '-t', '1500'], capture_output=True, text=True, timeout=60).stdout
    except Exception as e:
        return 'لا سجلّ: %s' % e
    open(os.path.join(OUT, 'logcat.txt'), 'w', encoding='utf-8').write(log)
    keep = [l for l in log.splitlines() if any(k in l for k in ('chromium', 'cr_', 'WebView', 'AndroidRuntime', 'FATAL', 'com.waha.math', 'ActivityManager: Process', 'ANR'))]
    return '\n'.join(keep[-60:])


def meminfo():
    # ذاكرة الجهاز المتاحة وحمله: تابلت الفحص توقّف كله بعد بدء الدرس (حتى adb) في ثلاثة تشغيلات، وشيفرة التطبيق لم تتغيّر بينها وبين تشغيلٍ نجح؛
    # فتُسجَّل الذاكرة والحمل كل خمس ثوانٍ لتظهر مع «ما تمّ» إن أخفق: نفادٌ في الجهاز الافتراضي أم توقّفٌ في التطبيق
    try:
        t = subprocess.run(['adb', 'shell', 'cat /proc/meminfo /proc/loadavg'], capture_output=True, text=True, timeout=20).stdout
        d = {l.split(':')[0]: l.split()[1] for l in t.splitlines() if ':' in l and len(l.split()) > 1}
        return '%d/%dMB load %s' % (int(d['MemAvailable']) // 1024, int(d['MemTotal']) // 1024, t.strip().splitlines()[-1].split()[0])
    except Exception as e:
        return 'لا: %s' % str(e)[:60]


def sampler():
    t0 = time.time()
    while True:
        res.setdefault('mem', []).append('%ds %s' % (time.time() - t0, meminfo()))
        res['mem'] = res['mem'][-24:]
        time.sleep(5)


def main():
    global ws
    import threading
    threading.Thread(target=sampler, daemon=True).start()
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
    print(json.dumps({k: v for k, v in res.items() if k != 'mem'}, ensure_ascii=False, indent=1))
    need = ['installed', 'start', 'shim', 'home', 'bag', 'scene', 'back_cover', 'back_stay']
    bad = [k for k in need if not res.get(k)] + (['errors'] if res.get('errors') else [])
    print('::notice::محرك النطق في الجهاز الافتراضي: %s' % {0: 'يُجهَّز', 1: 'صوت عربي', 2: 'لا صوت عربي (تُقرأ الجمل صامتة)'}.get(res.get('tts'), res.get('tts')))
    print(('::error::أخفق: ' + ', '.join(bad)) if bad else '::notice::التطبيق يعمل على الجهاز الافتراضي')
    return 1 if bad else 0


# أيّ استثناء (منفذ لا يظهر، مهلة، …) يظهر «ملاحظةَ خطأ» في صفحة التشغيل بموضعه وبما تمّ قبله، لأن السجلّ الكامل لا يُقرأ من خارج GitHub
try:
    rc = main()
except Exception:
    print(traceback.format_exc())
    print('::error title=فحص الجهاز::%s' % esc(traceback.format_exc()[-2500:] + '\nما تمّ: ' + json.dumps({k: v for k, v in res.items() if k != 'mem'}, ensure_ascii=False)[:1000]))
    rc = 1
print('::%s title=ذاكرة الجهاز وحمله::%s' % ('error' if rc else 'notice', esc('\n'.join(res.get('mem', [])))))   # والناجح أيضاً: يُقارَن به
try:
    tail = logcat()
    if rc:
        print('::error title=سجلّ الجهاز::%s' % esc(tail[-3500:] or '(فارغ)'))
    if ws:
        ws.close()
except Exception:
    pass
sys.exit(rc)

