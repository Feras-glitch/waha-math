# حزمة الصوت البشري والنسخة الاحتياطية (D181، D246). يخرج بـ 1 مع أي إخفاق.
#   الصوت: zip (مضغوط ومخزّن) وملف صوتي منفرد، بأسماء معرّفات حقيقية (جملة بصيغتين، وجملة عامة، وجملة درس) واسم لا يطابق جملة؛
#          تُعدّ المستوردة والمهملة، وتبقى بعد إعادة الفتح، ويُقال بها ما سُجّل (والباقي بصوت الجهاز)، ثم تُحذف فيعود صوت الجهاز.
#   النسخة: حفظ ملف فيه أطفال الجهاز وتقدّمهم، ثم تغيير التقدّم، ثم الاستعادة بتأكيد بخطوتين فيعود التقدّم كما كان، وتُحفظ نسخة مما كان قبلها؛
#          وتُرفض ملفات ليست نسخة، أو فيها مفتاح غريب، أو قيمة تالفة، دون أن يتغيّر شيء؛ واسم طفل فيه وسم HTML يُعرض نصّاً.
import asyncio, os, sys, json, io, zipfile, wave, struct, tempfile
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
FILE = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, '..', 'dist', 'واحة_الرياضيات.dev.html'))
TMP = tempfile.mkdtemp(prefix='bkv_'); FAILS = []
def check(name, cond, info=''):
  print(('ok   ' if cond else 'FAIL ') + name + (('  ' + str(info)) if info else ''));
  if not cond: FAILS.append(name)
def wav_bytes(ms=120):
  b = io.BytesIO(); w = wave.open(b, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(8000)
  w.writeframes(struct.pack('<' + 'h' * (8 * ms), *([0] * (8 * ms)))); w.close(); return b.getvalue()
async def boot(pg):   # فتح حقيقي: الانتقال إلى العنوان نفسه بالوسم نفسه لا يعيد تحميل الصفحة، فكان «تبقى بعد إعادة الفتح» لا يعيد الفتح (طفرة mutants_run)
  await pg.goto('about:blank'); await pg.goto('file://' + FILE + '#fast&seed=3'); await pg.wait_for_timeout(500)
  assert await pg.evaluate("() => performance.getEntriesByType('navigation')[0].type") == 'navigate'
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); ctx = await b.new_context(accept_downloads=True, **p.devices['Pixel 5']); pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    await boot(pg)
    await pg.evaluate("localStorage.setItem('hp_settings', JSON.stringify({sessionMax: 0}))")
    await pg.click('#startBtn'); await pg.click('.av[data-av="f3"]'); await pg.wait_for_timeout(150)
    await pg.click('#pSave'); await pg.wait_for_timeout(300)
    await pg.evaluate("() => { KIDS[0].name = 'سلمى'; store.set('hp_kids', KIDS); }")
    # ---------- الصوت ----------
    ids = await pg.evaluate("() => [...voiceIds()]")
    two = next(i for i in ids if i.endswith('_f')); base = two[:-2]; gen1 = next(i for i in ids if i.startswith('gen.') and not i.endswith(('_m', '_f')))
    les = next(i for i in ids if i.startswith('m1.') and not i.endswith(('_m', '_f')))
    z = os.path.join(TMP, 'pack.zip')
    with zipfile.ZipFile(z, 'w') as zf:
      zf.writestr(zipfile.ZipInfo('pack/' + base + '_m.wav'), wav_bytes(), compress_type=zipfile.ZIP_DEFLATED)
      zf.writestr(zipfile.ZipInfo('pack/' + two + '.wav'), wav_bytes(), compress_type=zipfile.ZIP_STORED)
      zf.writestr(zipfile.ZipInfo(gen1 + '.mp3'), wav_bytes(), compress_type=zipfile.ZIP_DEFLATED)
      zf.writestr(zipfile.ZipInfo('m1.u9.d9.nothing.01.mp3'), wav_bytes(), compress_type=zipfile.ZIP_DEFLATED)
      zf.writestr(zipfile.ZipInfo('readme.txt'), 'hello', compress_type=zipfile.ZIP_DEFLATED)
    loose = os.path.join(TMP, les + '.wav'); open(loose, 'wb').write(wav_bytes())
    await pg.evaluate("() => openPanel()"); await pg.wait_for_timeout(200)
    check('voice: status before import says device voice', 'صوت الجهاز' in await pg.text_content('#vpStat'))
    await pg.set_input_files('#vpIn', [z, loose]); await pg.wait_for_function("() => /استُورد|لم يُستورد|تعذّر/.test(document.querySelector('#vpMsg').textContent)", timeout=15000)
    msg = await pg.text_content('#vpMsg'); n = await pg.evaluate("() => VPACK.n")
    check('voice: four recordings imported (zip deflate + stored + loose file)', n == 4, (n, msg))
    check('voice: two unmatched names reported, none stored', 'أُهمل ملفان لا تطابق أسماؤها' in msg, msg)
    await boot(pg)
    try: await pg.wait_for_function("() => VPACK.n > 0", timeout=5000)
    except Exception: pass   # لم تُحمَّل: يُسجَّل إخفاقاً لا عطلاً
    check('voice: pack survives reopening', await pg.evaluate("() => VPACK.n") == 4)
    src = await pg.evaluate("""async ([gen1, les, base]) => { window.__voiceSrc = []; const txt = v => Array.isArray(v) ? v[1] : v;
      await say('compass', gen1, txt(CONTENT.gen.lines[gen1]) || 'x', { free: true });
      const L = CONTENT.units.flatMap(u => u.lessons).find(l => les.startsWith(l.id + '.')); CUR = L; const sid = les.slice(L.id.length + 1);
      await say('compass', sid, txt(L.lines[sid]), { free: true });
      const other = Object.keys(CONTENT.gen.lines).find(k => k !== gen1 && !/\\{/.test(txt(CONTENT.gen.lines[k])));
      await say('compass', other, txt(CONTENT.gen.lines[other]), { free: true }); CUR = null; return window.__voiceSrc; }""", [gen1, les, base])
    check('voice: recorded lines play from the pack, others from the device', [s[1] for s in src] == ['human', 'human', 'device'], src)
    await pg.evaluate("() => openPanel()"); await pg.click('#vpDel'); await pg.click('#vpDel'); await pg.wait_for_timeout(300)
    check('voice: pack deleted', await pg.evaluate("() => VPACK.n") == 0)
    await boot(pg); await pg.wait_for_timeout(400)
    check('voice: deleted pack stays deleted', await pg.evaluate("() => VPACK.n") == 0)
    bad = os.path.join(TMP, 'bad.zip'); open(bad, 'wb').write(b'not a zip at all')
    await pg.evaluate("() => openPanel()"); await pg.set_input_files('#vpIn', [bad]); await pg.wait_for_timeout(500)
    check('voice: broken zip reported', 'ليس ملف zip' in await pg.text_content('#vpMsg'), await pg.text_content('#vpMsg'))
    # ---------- النسخة الاحتياطية ----------
    await pg.evaluate("() => { const L = UNITS[0].lessons; for (const id of L.slice(0, 3)) { progOf(id).done = true; } saveProg(); }")
    async with pg.expect_download() as dl: await pg.click('#bkSave')
    d = await dl.value; path = os.path.join(TMP, 'backup.json'); await d.save_as(path); bk = json.load(open(path, encoding='utf-8'))
    check('backup: file downloaded with a dated name', d.suggested_filename.startswith('واحة_الرياضيات_نسخة_') and d.suggested_filename.endswith('.json'), d.suggested_filename)
    kid = await pg.evaluate("() => KID")
    check('backup: file holds the children and their progress', 'hp_kids' in bk['data'] and ('hp_prog:' + kid) in bk['data'] and bk['app'] == 'waha-math', list(bk['data'])[:6])
    check('backup: no lock, corrupt copies or gallery in the file', not any(k.startswith(('hp_lock', 'hp_corrupt', 'hp_prog_bak')) for k in bk['data']))
    await pg.evaluate("() => { for (const k of Object.keys(PROG)) delete PROG[k]; PROG.schema = SCHEMA; PROG.srs = {}; PROG.ws = {}; PROG.streams = {}; saveProg(); }")
    async def try_restore(obj, name):
      f = os.path.join(TMP, name); open(f, 'w', encoding='utf-8').write(obj if isinstance(obj, str) else json.dumps(obj, ensure_ascii=False))
      await pg.evaluate("() => openPanel()"); await pg.set_input_files('#bkIn', [f]); await pg.wait_for_timeout(300); return await pg.inner_html('#bkMsg')
    before = await pg.evaluate("() => JSON.stringify(Object.keys(localStorage).sort())")
    for nm, obj in [('notjson.json', 'hello'), ('other.json', {'app': 'x', 'kind': 'backup', 'v': 1, 'data': {}}),
                    ('evilkey.json', {**bk, 'data': {**bk['data'], 'hp_lock': '{}'}}), ('badval.json', {**bk, 'data': {**bk['data'], 'hp_prog:' + kid: '[1,2]'}})]:
      h = await try_restore(obj, nm)
      check('backup: rejected ' + nm, 'bkGo' not in h and h.strip() != '', h[:80])
    check('backup: rejected files changed nothing', await pg.evaluate("() => JSON.stringify(Object.keys(localStorage).sort())") == before)
    evil = json.loads(json.dumps(bk)); kids = json.loads(evil['data']['hp_kids']); kids[0]['name'] = '<img src=x onerror="window.__x=1">'; evil['data']['hp_kids'] = json.dumps(kids, ensure_ascii=False)
    h = await try_restore(evil, 'evilname.json'); await pg.wait_for_timeout(300)
    check('backup: a name with markup is shown as text', await pg.evaluate("() => window.__x === undefined") and '&lt;img' in h, h[:120])
    h = await try_restore(bk, 'good.json')
    check('backup: summary names the child and the lessons done', 'سلمى' in h and 'أنجز' in h, h[:160])
    await pg.click('#bkGo')
    check('backup: first press only asks to confirm', await pg.evaluate("() => !Object.values(PROG).some(v => v && v.done)"))
    async with pg.expect_navigation(): await pg.click('#bkGo')
    await pg.wait_for_timeout(600)
    n_done = await pg.evaluate("() => UNITS[0].lessons.filter(id => (PROG[id] || {}).done).length")
    check('backup: progress restored after reopening', n_done == 3, n_done)
    check('backup: a copy of what was on the device was kept', await pg.evaluate("() => !!localStorage.getItem('hp_before_restore')"))
    check('no page errors', not errs, errs[:3])
    await b.close()
  print('FAILS:', len(FAILS)); sys.exit(1 if FAILS else 0)
asyncio.run(main())
