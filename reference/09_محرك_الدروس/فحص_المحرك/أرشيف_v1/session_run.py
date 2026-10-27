import asyncio, json, time
from playwright.async_api import async_playwright
import os
URL = 'file://' + os.environ.get('U1FILE', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '05b_نسخة_الفحص_dev.html')) + '#fast'   # D249
OUT='/home/claude/audit/s151_'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); ctx=await b.new_context(**p.devices['Pixel 5']); pg=await ctx.new_page(); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console', lambda m: errs.append('console:'+m.text) if m.type=='error' else None)
    await pg.goto(URL); await pg.wait_for_timeout(300)
    now=int(time.time()*1000); D=86400000
    prog={'m1.u1.d1':{'done':True,'mastered':True},'m1.u1.d2':{'done':True,'mastered':True},'m1.u1.d3':{'done':True,'mastered':True},'m1.u1.d4':{'done':True,'mastered':True},
          'm1.u1.d5':{'done':True,'mastered':True,'score':8,'of':8},'badge:m1.u1':True,'m1.u2.d1':{'done':True,'mastered':True},
          'srs':{'m1.u1.d1':{'step':0,'due':now-1000},'m1.u1.d3':{'step':1,'due':now-1000},'m1.u2.d1':{'step':2,'due':now-1000},'m1.u1.d2':{'step':0,'due':now+3*D}}}
    await pg.evaluate("""([prog, now])=>{localStorage.setItem('hp_profile', JSON.stringify({name:'سلمى',gender:'f',photo:''})); localStorage.setItem('hp_prog', JSON.stringify(prog));
       localStorage.setItem('hp_session', JSON.stringify({n:2,t:now})); localStorage.removeItem('hp_settings');}""",[prog,now])
    await pg.reload(); await pg.wait_for_timeout(600)
    await pg.screenshot(path=OUT+'01_home_review.png')
    rv=await pg.evaluate("!!document.querySelector('.stop.review.now')"); print('review stop shown & now:',rv)
    hosts=await pg.evaluate("document.querySelectorAll('.unithead .hosts svg').length"); print('unit hosts:',hosts)
    # 1) الاستراحة: الدرس التالي بعد درسين
    await pg.click('.stop[data-lesson="m1.u2.d2"]'); await pg.wait_for_timeout(400)
    print('break shown:', await pg.evaluate("!document.getElementById('breakCover').hidden"), '| scene', await pg.evaluate("window.__scene"))
    await pg.screenshot(path=OUT+'02_break.png')
    await pg.click('#restBtn'); await pg.wait_for_timeout(200)
    print('break closed, home:', await pg.evaluate("document.getElementById('breakCover').hidden && !document.getElementById('home').hidden"))
    # 2) المراجعة مسموحة أثناء الاستراحة
    await pg.click('.stop.review'); await pg.wait_for_timeout(300)
    await pg.screenshot(path=OUT+'03_review_intro.png')
    await pg.click('#go'); answered=[]; last=-1
    for step in range(600):
      sc=await pg.evaluate("window.__scene"); 
      if sc=='home' : break
      st=await pg.evaluate("""()=>({n:window.__n||0, kind: window.__item&&window.__item.kind, bins:!!document.querySelector('.bins .bin')&&!document.querySelector('.bin.ok')&&!document.querySelector('.bin.no'), go: !document.getElementById('go').disabled, riddle: !!(window.__item&&window.__item.riddle)})""")
      if st['bins'] and st['n']!=last:
        last=st['n']; wrong = len(answered)==1    # السؤال الثاني خطأ مقصود
        bins=await pg.evaluate("[...document.querySelectorAll('.bins .bin')].map(b=>b.dataset.k)")
        k = next(x for x in bins if x!=st['kind']) if wrong else st['kind']
        answered.append((sc,k==st['kind'])); 
        if len(answered)==2: await pg.screenshot(path=OUT+'04_review_q.png')
        await pg.click(f'.bin[data-k="{k}"]')
      elif st['go']:
        if sc=='review:end': await pg.screenshot(path=OUT+'05_review_end.png')
        await pg.click('#go')
      await pg.wait_for_timeout(80)
    srs=await pg.evaluate("JSON.parse(localStorage.getItem('hp_prog:'+JSON.parse(localStorage.getItem('hp_kid')))).srs"); print('answered',answered); print('srs after', json.dumps(srs))
    print('review stop gone:', not await pg.evaluate("!!document.querySelector('.stop.review')"))
    # 3) درس إضافي بإذن الكبير
    await pg.click('.stop[data-lesson="m1.u2.d2"]'); await pg.wait_for_timeout(300)
    await pg.click('#moreBtn'); await pg.wait_for_timeout(200)
    await pg.fill('#gateIn','5'); await pg.click('#gateForm button'); await pg.wait_for_timeout(200)
    print('wrong gate stays:', await pg.evaluate("!document.getElementById('panel').hidden && !!document.getElementById('gateIn')"))
    await pg.screenshot(path=OUT+'06_gate.png')
    ans=await pg.evaluate("window.__gateAns"); await pg.fill('#gateIn', ''.join('٠١٢٣٤٥٦٧٨٩'[int(d)] for d in str(ans))); await pg.click('#gateForm button'); await pg.wait_for_timeout(500)
    print('lesson started after gate:', await pg.evaluate("window.__scene"))
    await pg.wait_for_timeout(300)
    # 4) D191: مسطّح بلا ظل في الوحدة الثانية
    flt=await pg.evaluate("[...document.querySelectorAll('#stage [filter]')].map(e=>e.getAttribute('filter'))"); print('filters in u2 stage:', flt)
    await pg.click('#mapBtn'); await pg.wait_for_timeout(200)
    # 5) لوحة الكبار (البوابة مفتوحة 10 دقائق بعد الإجابة)
    await pg.click('#adultBtn'); await pg.wait_for_timeout(300)
    print('panel direct (gate remembered):', await pg.evaluate("!!document.getElementById('segMax')"))
    await pg.screenshot(path=OUT+'07_panel.png', full_page=True)
    await pg.click('#segMax [data-n="3"]'); await pg.wait_for_timeout(200)
    print('setting saved:', await pg.evaluate("localStorage.getItem('hp_settings:'+JSON.parse(localStorage.getItem('hp_kid')))"))
    el=await pg.query_selector('#panel'); 
    txt=await pg.evaluate("document.getElementById('panel').innerText"); print('talk cards:', txt.count('اسألوا')+txt.count('ارسموا')+txt.count('قفوا')+txt.count('في المطبخ')+txt.count('دحرجوا'))
    await pg.click('#closePanel')
    # 6) الوضع الليلي للخريطة
    await pg.emulate_media(color_scheme='dark'); await pg.evaluate("showHome()"); await pg.wait_for_timeout(300); await pg.screenshot(path=OUT+'08_home_dark.png')
    print('errors', errs); await b.close()
asyncio.run(main())
