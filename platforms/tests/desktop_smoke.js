/* فحص نسخة ويندوز بعد بنائها: يتصل بالتطبيق المبني نفسه (WahaMath.exe --remote-debugging-port=9333) ويسير كما يسير الطفل:
   الترحيب، ثم ملف الطفل، ثم الشاشة الرئيسية بدروسها، ثم أول درس على الشاشة. ويطبع أصوات النطق في الجهاز (للعلم: الصوت العربي
   يأتي من إعدادات ويندوز، وجهاز البناء بلا صوت عربي غالباً، والتطبيق يقرأ الجمل صامتةً حينئذ).
   الاستعمال: node platforms/tests/desktop_smoke.js */
const { chromium } = require('playwright');
(async () => {
  let b;
  for (let i = 0; i < 40 && !b; i++) { try { b = await chromium.connectOverCDP('http://127.0.0.1:9333'); } catch (e) { await new Promise(r => setTimeout(r, 1000)); } }
  if (!b) { console.log('::error::نسخة ويندوز لم تفتح'); process.exit(1); }
  let p = null;
  for (let i = 0; i < 20 && !p; i++) { p = b.contexts().flatMap(c => c.pages()).find(x => x.url().endsWith('index.html')) || null; if (!p) await new Promise(r => setTimeout(r, 500)); }
  const ok = {}, errs = [];
  if (!p) { console.log('::error::لا صفحة للتطبيق'); process.exit(1); }
  p.on('pageerror', e => errs.push(String(e)));
  try {
    await p.waitForSelector('#startBtn', { timeout: 30000 });
    ok.file = await p.evaluate(() => location.protocol === 'file:');
    await p.click('#startBtn'); await p.waitForTimeout(600);
    await p.click('.av[data-av="f3"]'); await p.click('#pSave'); await p.waitForTimeout(900);
    ok.home = await p.evaluate(() => !document.getElementById('home').hidden && document.querySelectorAll('.stop[data-lesson]').length >= 27);
    await p.click('.stop.now'); await p.waitForTimeout(2500);
    ok.bag = await p.evaluate(() => [...document.querySelectorAll('.choices .pick')].map(x => x.dataset.k).join() === 'mat,screen');
    await p.evaluate(() => [...document.querySelectorAll('.choices .pick')].find(x => x.dataset.k === 'screen').click()); await p.waitForTimeout(5000);
    ok.scene = await p.evaluate(() => !!document.querySelector('#stage svg [role=button]') && document.getElementById('say').textContent.length > 10);
    ok.fonts = await p.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/"/g, '')).includes('Waha Naskh'));
    ok.noErrors = errs.length === 0;
    const voices = await p.evaluate(() => new Promise(res => { let v = speechSynthesis.getVoices(); if (v.length) return res(v); speechSynthesis.onvoiceschanged = () => res(speechSynthesis.getVoices()); setTimeout(() => res(speechSynthesis.getVoices()), 3000); })
      .then(v => v.map(x => x.name + ' (' + x.lang + ')')));
    const ar = voices.filter(v => /\(ar/i.test(v));
    console.log('::notice::أصوات النطق في جهاز البناء: ' + (voices.join('، ') || 'لا شيء') + (ar.length ? '' : ' — ولا صوت عربي فيه، فتُقرأ الجمل صامتة'));
  } catch (e) { ok.run = false; console.log('::error::' + String(e).split('\n')[0]); }
  console.log(JSON.stringify(ok), errs.slice(0, 3));
  const pass = Object.values(ok).every(Boolean) && Object.keys(ok).length >= 6;
  console.log(pass ? '::notice::نسخة ويندوز تعمل: الترحيب وملف الطفل والشاشة الرئيسية وأول درس' : '::error::نسخة ويندوز لا تعمل: ' + JSON.stringify(ok));
  await b.close().catch(() => {});
  process.exit(pass ? 0 : 1);
})();
