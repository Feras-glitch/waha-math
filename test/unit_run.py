import asyncio, json, re, sys, os
from playwright.async_api import async_playwright
U1FILE = os.environ.get('U1FILE', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dist', 'واحة_الرياضيات.dev.html')); AUD = os.environ.get('AUDIT_DIR', '/home/claude/engine/test/out'); os.makedirs(AUD, exist_ok=True)
IDS_JSON = os.environ.get('IDS_JSON', '/home/claude/audit/script_u1.xlsx.ids.json')
SEED = os.environ.get('SEED')   # عشوائية مثبّتة لمقارنة بناءين: SEED=1 sh test/run_all.sh …
async def _seed(ctx):
    if SEED: await ctx.add_init_script("(() => { let s = %d; Math.random = () => { s = (s * 1103515245 + 12345) %% 2147483648; return s / 2147483648; }; })();" % int(SEED))
    return ctx
GENDER = sys.argv[1] if len(sys.argv) > 1 else 'f'
FAIL_MASTERY = len(sys.argv) > 2 and sys.argv[2] == 'failmastery'   # D233: يخفق في فحص الإتقان دورتين فيُؤجَّل
NAME = 'سلمى' if GENDER == 'f' else 'يوسف'
URL = 'file://' + U1FILE + '#fast'
SHOT = AUD + f'/u1_{GENDER}_'
FAIL_TEST_FIRST = GENDER == 'm'      # الولد يرسب في التحدي أول مرة ليُفحص مسار الإعادة

STATE = """() => { const q = s => document.querySelector(s); const vis = s => { const e = q(s); return e && !e.hidden; };
  return { scene: window.__scene || '', home: vis('#home'), lesson: vis('#lesson'), go: !!(q('#go') && !q('#go').disabled), goText: q('#go') ? q('#go').innerText : '',
    bins: !!q('.bins .bin') && !q('.bin.ok') && !q('.bin.no'), rawbins: !!q('.bins .bin'), n: window.__n || 0, kind: window.__item && window.__item.kind, tag: window.__item && window.__item.tag,
    picks: [...document.querySelectorAll('.choices .pick:not([data-done])')].length, sides: document.querySelectorAll('#stage line[role=button]').length,
    test: window.__test ? window.__test.ans : null, say: q('#say') ? q('#say').textContent : '' }; }"""

async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); ctx = await b.new_context(**p.devices['Pixel 5']); pg = await (await _seed(ctx)).new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append('console:' + m.text) if m.type == 'error' else None)
    await pg.goto(URL); await pg.wait_for_timeout(700)
    await pg.evaluate("localStorage.setItem('hp_settings', JSON.stringify({sessionMax: 0}))"); await pg.reload(); await pg.wait_for_timeout(700)   # المسار الكامل بلا حدّ جلسة (الحدّ يُفحص في session_run.py)
    await pg.screenshot(path=SHOT + '00_profile.png')
    await pg.fill('#pName', NAME); await pg.click('#gF' if GENDER == 'f' else '#gM')
    await pg.set_input_files('#pPhoto', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fixtures', 'kid.png')); await pg.wait_for_timeout(400)
    await pg.click('#pSave'); await pg.wait_for_timeout(300)
    await pg.evaluate("""()=>{window.__said=[]; new MutationObserver(()=>{const t=document.getElementById('say').textContent; if(window.__said[window.__said.length-1]!==t) window.__said.push(t)}).observe(document.getElementById('say'),{childList:true,characterData:true,subtree:true});}""")
    await pg.screenshot(path=SHOT + '01_home.png')
    if GENDER == 'm':
      await pg.click('#digBtn'); await pg.wait_for_timeout(200); await pg.screenshot(path=SHOT + '01_home_western.png')
    shots = set(); lessons_run = 0; test_fails = 0
    def once(key):
      if key in shots: return False
      shots.add(key); return True
    for li in range(14):
      st = await pg.evaluate(STATE)
      full = await pg.evaluate("(document.querySelector('.stop.now')||{dataset:{}}).dataset.lesson || null")
      if not full: break
      await pg.click(f'.stop[data-lesson="{full}"]'); await pg.wait_for_timeout(300); lessons_run += 1
      lid = full.replace('m1.', '').replace('.', ''); clicked = set(); wrong_done = False; last_n = -1; last_test = -1; hook_ix = 0; idle = 0
      for step in range(3000):
        st = await pg.evaluate(STATE); sc = st['scene'].split(':')[-1]
        if st['home']: break
        acted = False
        if once(f'{lid}_{sc}'): await pg.wait_for_timeout(250); await pg.screenshot(path=SHOT + f'{lid}_{sc}.png')
        if sc == 'hook' and not st['go']:
          btns = await pg.evaluate("[...document.querySelectorAll('#stage svg [role=button]')].length")
          if btns and step % 6 == 0:
            ix = (btns - 1 - hook_ix) % btns; hook_ix += 1
            await pg.evaluate(f"document.querySelectorAll('#stage svg [role=button]')[{ix}].dispatchEvent(new MouseEvent('click',{{bubbles:true}}))"); acted = True
        if sc == 'explore' and not st['go']:
          if st['sides']:
            await pg.evaluate("document.querySelectorAll('#stage line[role=button]').forEach(l=>l.dispatchEvent(new MouseEvent('click',{bubbles:true})))"); acted = True
          if await pg.evaluate("!!document.querySelector('[data-t=longer]')") and 'أَيُّهُمَا أَطْوَلُ' in st['say'] and once(f'{lessons_run}{lid}longer'):
            await pg.evaluate("document.querySelector('[data-t=longer]').dispatchEvent(new MouseEvent('click',{bubbles:true}))"); acted = True
          if await pg.evaluate("!!document.querySelector('[data-slot]')"):
            for k in ['triangle', 'square', 'rect', 'circle']:
              if k == 'rect' and once(lid + 'slotwrong'):   # خطأ مقصود في التركيب
                await pg.evaluate("document.querySelector('[role=button][data-k=rect]').dispatchEvent(new MouseEvent('click',{bubbles:true}));document.querySelector('[data-slot=circle]').dispatchEvent(new MouseEvent('click',{bubbles:true}))"); await pg.wait_for_timeout(400)
              await pg.evaluate(f"document.querySelector('[role=button][data-k={k}]').dispatchEvent(new MouseEvent('click',{{bubbles:true}}));document.querySelector('[data-slot={k}]').dispatchEvent(new MouseEvent('click',{{bubbles:true}}))"); await pg.wait_for_timeout(120)
            acted = True
        if FAIL_MASTERY and sc == 'mastery' and lid == 'u1d1' and st['rawbins'] and st['n'] != last_n and (await pg.evaluate("window.__sortScene||''")).startswith('mastery'):
          kind = st['kind']; bins = await pg.evaluate("[...document.querySelectorAll('.bins .bin')].map(b=>b.dataset.k)")
          wb = next(x for x in bins if x != kind); await pg.click(f'.bin[data-k="{wb}"]'); last_n = st['n']; acted = True
        elif st['bins'] and st['n'] != last_n:
          kind = st['kind']; bins = await pg.evaluate("[...document.querySelectorAll('.bins .bin')].map(b=>b.dataset.k)")
          if False:
            pass
          elif sc == 'practice' and not wrong_done:
            wb = next(x for x in bins if x != kind); wrong_done = True
            await pg.click(f'.bin[data-k="{wb}"]'); await pg.wait_for_timeout(300); await pg.screenshot(path=SHOT + f'{lid}_feedback.png')
            await pg.wait_for_function("document.querySelectorAll('.bin.no').length===0", timeout=15000)
          else:
            await pg.click(f'.bin[data-k="{kind}"]'); last_n = st['n']
          acted = True
        if sc == 'chaos' and not st['go'] and not st['picks'] and once(f'{lessons_run}{lid}chaosfind'):
          await pg.wait_for_timeout(200); await pg.evaluate("(()=>{const gs=[...document.querySelectorAll('#stage svg g[role=button]')]; gs[window.__chaosIx].dispatchEvent(new MouseEvent('click',{bubbles:true}))})()"); acted = True
        if st['picks'] and sc == 'chaos':
          await pg.wait_for_timeout(200); await pg.screenshot(path=SHOT + f'{lid}_chaos_why.png')
          await pg.evaluate("(()=>{const b=document.querySelector('.choices .pick[data-ok=true]'); b.dataset.done=1; b.click(); document.querySelectorAll('.choices .pick').forEach(x=>x.dataset.done=1)})()"); acted = True
        if sc == 'test' and st['test'] is not None and st['n'] != last_test and not await pg.evaluate("!!(window.__test && window.__test.text)"):
          last_test = st['n']; ans = st['test']
          if FAIL_TEST_FIRST and test_fails < 2: ans = (ans + 1) % 3; test_fails += 1
          if once(lid + 'testshot'): await pg.screenshot(path=SHOT + f'{lid}_test_q.png')
          await pg.evaluate(f"document.querySelectorAll('#stage svg g[role=button]')[{ans}].dispatchEvent(new MouseEvent('click',{{bubbles:true}}))"); acted = True
        # الوحدة الثانية: أزرار التوقّع، والأكياس، والوجوه، والدحرجة، والبناء، وأسئلة «لماذا؟»
        if await pg.evaluate("!!document.querySelector('.choices.icons .pick[data-ok=true]') && !document.querySelector('.choices.icons[data-done]')"):
          await pg.wait_for_timeout(150); await pg.evaluate("document.querySelector('.choices.icons .pick[data-ok=true]').click()"); acted = True
        if sc == 'hook' and await pg.evaluate("!!document.querySelector('[data-t=bag]') && !document.querySelector('.choices')"):
          await pg.evaluate("(()=>{const b=[...document.querySelectorAll('[data-t=bag]')].find(x=>x.style.opacity!=='0.55'); if(b) b.dispatchEvent(new MouseEvent('click',{bubbles:true}))})()"); acted = True
        if await pg.evaluate("[...document.querySelectorAll('[data-t=face]')].some(f=>f.getAttribute('stroke-width')!=='5')"):
          await pg.evaluate("(()=>{const f=[...document.querySelectorAll('[data-t=face]')].find(f=>f.getAttribute('stroke-width')!=='5'); f.dispatchEvent(new MouseEvent('click',{bubbles:true}))})()"); acted = True
        if await pg.evaluate("!!document.querySelector('[data-t=roll]')"):
          await pg.evaluate("document.querySelector('[data-t=roll]').dispatchEvent(new MouseEvent('click',{bubbles:true}))"); acted = True
        if sc == 'build' and await pg.evaluate("!!document.querySelector('[data-t=build]')"):
          await pg.evaluate("document.querySelector('[data-t=build]').dispatchEvent(new MouseEvent('click',{bubbles:true}))"); await pg.wait_for_timeout(120); acted = True
        if sc == 'test' and st['test'] is not None and await pg.evaluate("!!(window.__test && window.__test.text) && !!document.querySelector('.choices .pick[data-ok]') && !document.querySelector('.choices .pick.ok,.choices .pick.no')") and st['n'] != last_test:
          last_test = st['n']; await pg.evaluate("document.querySelector('.choices .pick[data-ok=true]').click()"); acted = True
        if await pg.evaluate("!!document.querySelector('[data-part][data-ok=true]')"):   # مشهد المسجد: خطأ مقصود أول مرة ثم الصواب
          if once(f'{lessons_run}{lid}archwrong'): await pg.evaluate("document.querySelector('[data-part][data-ok=false]').dispatchEvent(new MouseEvent('click',{bubbles:true}))")
          else: await pg.evaluate("document.querySelector('[data-part][data-ok=true]').dispatchEvent(new MouseEvent('click',{bubbles:true}))")
          await pg.wait_for_timeout(150); acted = True
        if await pg.evaluate("!document.getElementById('helpBtn').hidden"):
          await pg.click('#helpBtn'); acted = True
        if st['go']:
          if sc in ('wrap',) or 'خَرِيطَةُ' in st['goText']:
            if once(f'{lid}_end{lessons_run}'): await pg.wait_for_timeout(900); await pg.screenshot(path=SHOT + f'{lid}_end{lessons_run}.png')
          await pg.click('#go'); acted = True
        await pg.wait_for_timeout(60 if acted else 120)
        idle = 0 if acted else idle + 1
        if idle > 400: print('STUCK', lid, st); await pg.screenshot(path=SHOT + f'{lid}_STUCK.png'); break
      else: print('loop limit', lid)
      prog = await pg.evaluate("JSON.parse(localStorage.getItem('hp_prog:'+JSON.parse(localStorage.getItem('hp_kid'))))")
      print('after', full, (prog or {}).get(full))
    await pg.screenshot(path=SHOT + '99_home_end.png')
    await pg.click('#adultBtn'); await pg.wait_for_timeout(300); await pg.screenshot(path=SHOT + '99_gate.png')
    await pg.fill('#gateIn', str(await pg.evaluate('window.__gateAns'))); await pg.click('#gateForm button'); await pg.wait_for_timeout(300); await pg.screenshot(path=SHOT + '99_panel.png', full_page=True)
    clips = set(await pg.evaluate("window.__clips||[]")); ids = set(json.load(open(IDS_JSON)))
    print('clips spoken', len(clips), '| missing from script table', sorted(clips - ids))
    json.dump(sorted(clips), open(SHOT + 'clips.json', 'w', encoding='utf-8'), ensure_ascii=False)   # قائمة الجمل المنطوقة للمقارنة بين بناءين
    said = await pg.evaluate("window.__said")
    log = await pg.evaluate("JSON.parse(localStorage.getItem('hp_log:'+JSON.parse(localStorage.getItem('hp_kid'))))")
    errsN = {}
    for a in log['attempts']:
      if a.get('err'): errsN[a['err']] = errsN.get(a['err'], 0) + 1
    print('lessons run', lessons_run, '| attempts', len(log['attempts']), '| errs', errsN)
    print('lines', len(said), '| unresolved', [t for t in said if '{' in t or '|' in t])
    if GENDER == 'f': bad = [t for t in said if re.search(r'(تَ|كَ)[!.،؟ ]|حَاوِلْ |اِلْمَسْهَا|مُهَنْدِسُ!|أَنْتَ ', t)]
    else: bad = [t for t in said if re.search(r'(تِ|كِ)[!.،؟ ]|يهَا|مُهَنْدِسَةُ|أَنْتِ ', t)]
    print('gender candidates', bad[:12])
    print('overflow', await pg.evaluate("document.scrollingElement.scrollWidth>innerWidth"), '| errors', errs)
    await b.close()
asyncio.run(main())
