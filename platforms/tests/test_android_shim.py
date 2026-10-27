# فحص جسر أندرويد (platforms/android/shim.js) في كروميوم بجسرٍ مُحاكى، على صفحة نسخة أندرويد نفسها (out/android-www/index.html):
#   النطق يمرّ بمحرك الجهاز بطابور ويُكمل الدرس؛ ولا صوت عربي ← الجملة تُقرأ صامتةً بزمنها ثم يمضي الدرس؛ وcancel يوقف بلا إنهاء مبكر؛
#   وحفظ النسخة الاحتياطية يصل إلى نافذة الحفظ؛ والطباعة؛ وزر الرجوع؛ وبلا جسر لا يتغيّر شيء.
# الاستعمال: python3 platforms/tests/test_android_shim.py [مجلد الإخراج=out]
import asyncio, base64, json, os, sys
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'out'))
PAGE = 'file://' + os.path.join(OUT, 'android-www', 'index.html')

# جسرٌ مُحاكى بسلوك محرك النطق في أندرويد: QUEUE_ADD (جملة بعد جملة)، وstop يوقف الحالية بحدث onStop (خطأ) ويُسقط الباقي
FAKE = """(mode) => {
  const log = window.__bridgeLog = { speak: [], cancel: 0, save: [], print: 0 };
  let q = [], cur = null, timer = null;
  const ev = (t, id) => window.__ttsEvent && window.__ttsEvent(t, id);
  const next = () => { if (cur || !q.length) return; cur = q.shift(); const c = cur;
    timer = setTimeout(() => { ev('start', c.id); timer = setTimeout(() => { cur = null; ev('end', c.id); next(); }, 40 + c.text.length * 4); }, 30); };
  window.AndroidBridge = {
    ttsState: () => mode === 'novoice' ? 2 : 1,
    speak(id, text, rate, pitch) { log.speak.push({ id, text, rate, pitch });
      if (mode === 'novoice') { setTimeout(() => ev('error', id), 5); return; }
      q.push({ id, text }); next(); },
    cancel() { log.cancel++; clearTimeout(timer); const c = cur; cur = null; q = []; if (c) setTimeout(() => ev('error', c.id), 5); },
    saveFile(name, mime, b64) { log.save.push({ name, mime, b64 }); },
    printPage() { log.print++; }
  };
}"""

checks = []
def check(ok, msg):
    checks.append(ok); print(('OK  ' if ok else 'FAIL'), msg, flush=True)


async def to_lesson(pg):
    await pg.goto(PAGE); await pg.wait_for_timeout(500)
    await pg.click('#startBtn'); await pg.wait_for_timeout(500)
    await pg.click('.av[data-av="f3"]'); await pg.click('#pSave'); await pg.wait_for_timeout(700)
    await pg.click('.stop.now'); await pg.wait_for_timeout(1500)
    await pg.evaluate("() => [...document.querySelectorAll('.choices .pick')].find(x => x.dataset.k === 'screen').click()")


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # 1) النطق بالجسر: الدرس يتكلّم ويمضي باللمس
        ctx = await b.new_context(**p.devices['Pixel 5']); await ctx.add_init_script(f'({FAKE})("voice")')
        pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await to_lesson(pg); await pg.wait_for_timeout(4000)
        st = await pg.evaluate("() => ({ shim: typeof window.__ttsEvent === 'function' && speechSynthesis.getVoices()[0].voiceURI === 'android-tts', n: __bridgeLog.speak.length, ar: __bridgeLog.speak.every(s => /[\\u0600-\\u06FF]/.test(s.text)), rates: [...new Set(__bridgeLog.speak.map(s => s.rate))], say: document.getElementById('say').textContent })")
        check(st['shim'], 'الجسر حلّ محلّ speechSynthesis (صوت android-tts)')
        check(st['n'] >= 2 and st['ar'], 'جمل الدرس تُرسل إلى محرك النطق بالعربية (%d جملة)' % st['n'])
        check(st['rates'] == [0.9], 'سرعة القراءة العادية 0.9 كما في المتصفح %s' % st['rates'])
        before = st['say']
        await pg.evaluate("document.querySelector('#stage svg [role=button]').dispatchEvent(new MouseEvent('click', {bubbles: true}))"); await pg.wait_for_timeout(6000)
        after = await pg.evaluate("document.getElementById('say').textContent")
        check(after != before, 'الدرس يمضي بعد اللمس والكلام بالجسر')
        # الطابور: جملة بثلاثة أجزاء تُرسل ثلاثة طلبات، وتنتهي الجملة بنهاية آخرها
        q = await pg.evaluate("""async () => { const n0 = __bridgeLog.speak.length; hush(); const t0 = performance.now();
          const pr = say('compass', 'gen.review.intro', 'جملةٌ أولى قصيرة. وجملةٌ ثانية بعدها. وثالثة.', { free: true });
          await pr; const parts = __bridgeLog.speak.slice(n0).map(x => x.text); return { sent: parts.length, parts, ms: Math.round(performance.now() - t0), busy: speechBusy() }; }""")
        check(q['sent'] == 3 and not q['busy'], 'جملة بثلاثة أجزاء: ثلاثة طلبات في الطابور، وتنتهي بنهاية آخرها %s' % q)
        # زر الرجوع
        bk = await pg.evaluate("""async () => { const w = ms => new Promise(r => setTimeout(r, ms)); const r = [];
          r.push(window.__androidBack()); await w(400); r.push(!document.getElementById('exitCover').hidden);
          r.push(window.__androidBack()); await w(400); r.push(document.getElementById('exitCover').hidden && !document.getElementById('lesson').hidden);
          return r; }""")
        check(bk == [1, True, 1, True], 'الرجوع في الدرس يفتح غطاء الخروج، ثم «نبقى» %s' % bk)
        # حفظ النسخة الاحتياطية والطباعة
        sv = await pg.evaluate("async () => { backupSave(); await new Promise(r => setTimeout(r, 600)); window.print(); return { save: __bridgeLog.save.map(s => ({ name: s.name, mime: s.mime, b64: s.b64 })), print: __bridgeLog.print }; }")
        ok = len(sv['save']) == 1 and sv['save'][0]['name'].endswith('.json')
        d = json.loads(base64.b64decode(sv['save'][0]['b64']).decode('utf-8')) if ok else {}
        check(ok and d.get('app') == 'waha-math' and 'hp_kids' in d.get('data', {}), 'حفظ النسخة الاحتياطية يصل إلى نافذة الحفظ بملفها كاملاً (%s)' % (sv['save'][0]['name'] if ok else sv))
        check(sv['print'] == 1, 'الطباعة تصل إلى طباعة أندرويد')
        await pg.evaluate("() => show('home')"); await pg.wait_for_timeout(300)
        check(await pg.evaluate("window.__androidBack()") == 0, 'الرجوع في الشاشة الرئيسية يترك التطبيق لأندرويد (يُصغَّر)')
        check(not errs, 'لا أخطاء في الصفحة %s' % errs[:3])
        await ctx.close()

        # 2) لا صوت عربي: الجملة لا «تنتهي» فوراً، بل تُقرأ صامتةً بزمنها، ثم يمضي الدرس
        ctx = await b.new_context(**p.devices['Pixel 5']); await ctx.add_init_script(f'({FAKE})("novoice")')
        pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await to_lesson(pg); await pg.wait_for_timeout(500)
        nv = await pg.evaluate("""async () => { hush(); const t0 = performance.now(); const text = 'هذه جملةٌ تُقرأ صامتةً حين لا يوجد صوتٌ عربي في الجهاز.';
          await say('compass', 'gen.review.intro', text, { free: true }); return { ms: performance.now() - t0, need: 3000 + Math.max(1800, plain(text).length * 95) }; }""")
        check(nv['ms'] >= nv['need'] - 300, 'بلا صوت عربي: الجملة تبقى زمن قراءتها (%d م.ث، والمطلوب نحو %d)' % (nv['ms'], nv['need']))
        check(not errs, 'لا أخطاء في الصفحة بلا صوت %s' % errs[:3])
        await ctx.close()

        # 3) بلا جسر (المتصفح العادي): الجسر لا يفعل شيئاً
        ctx = await b.new_context(**p.devices['Pixel 5']); pg = await ctx.new_page()
        await pg.goto(PAGE); await pg.wait_for_timeout(500)
        nb = await pg.evaluate("() => ({ ev: typeof window.__ttsEvent, back: typeof window.__androidBack, native: Object.prototype.toString.call(window.speechSynthesis) })")
        check(nb['ev'] == 'undefined' and nb['back'] == 'undefined' and nb['native'] == '[object SpeechSynthesis]', 'بلا AndroidBridge لا يتغيّر شيء %s' % nb)
        await b.close()
    print('FAILS:', checks.count(False)); sys.exit(1 if False in checks else 0)

asyncio.run(main())
