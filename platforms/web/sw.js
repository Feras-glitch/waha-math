/* عامل خدمة «واحة الرياضيات» على الويب: يحفظ التطبيق (ملف واحد وأيقوناته) ليعمل بلا إنترنت بعد أول فتح.
   الصفحة من الشبكة أولاً (فيصل كل تحديث حين يتصل الجهاز)، ومن الذاكرة إن انقطع الاتصال أو أبطأ (C-03).
   ويحذف ذاكرته هو وحدها (waha-math-*): على عنوان github.io نفسه تطبيقات أخرى للعائلة. */
const CACHE = 'waha-math-@@BUILD@@';
const FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-180.png'];
const MARK = 'const CONTENT = ', WAIT = 2500;   // علامة التطبيق في نصّ صفحته، ومهلة الشبكة للصفحة
/* والتثبيت كذلك: الصفحة لا تُحفظ إلا وهي التطبيق نفسه، وإلا لا يُثبَّت عامل الخدمة (C-15) */
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(async c => { for (const f of FILES) { const res = await fetch(f, { cache: 'reload' }); if (!res.ok) throw new Error(f);
    if (f === './' || f === './index.html') { const t = await res.clone().text(); if (!t.includes(MARK)) throw new Error('not the app: ' + f); } await c.put(f, res); } })
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('waha-math-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
/* الصفحة: الشبكة أولاً ما دامت تجيب خلال ثانيتين ونصف، وإلا فالمحفوظة فوراً وتُحدَّث في الخلفية (مراجعة الخصم C-03: اتصالٌ معلّق
   أو بطيء كان يترك الطفل أمام شاشة فارغة 20–35 ثانية). ولا يُحفظ إلا التطبيق نفسه (علامته في نصّه)، فصفحة دخول واي فاي
   أو خطأٌ بنصّ 200 لا تحلّ محلّه (C-15) */
const html = t => new Response(t, { headers: { 'content-type': 'text/html; charset=utf-8' } });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  const page = r.mode === 'navigate' || /\/(index\.html)?$/.test(new URL(r.url).pathname);
  if (page) {
    const net = fetch(r).then(async res => {
      const t = res.ok && /text\/html/i.test(res.headers.get('content-type') || '') ? await res.text() : null;
      const app = t != null && t.includes(MARK);
      if (app) { const c = await caches.open(CACHE); await c.put('./index.html', html(t)); }
      return { app, res: t != null ? new Response(t, { status: res.status, statusText: res.statusText, headers: res.headers }) : res }; });
    e.waitUntil(net.catch(() => {}));
    e.respondWith(caches.match('./index.html').then(hit => {
      if (!hit) return net.then(x => x.res, () => Response.error());
      const late = new Promise(ok => setTimeout(() => ok(hit), WAIT));
      return Promise.race([net.then(x => x.app ? x.res : hit, () => hit), late]); }));
    return;
  }
  e.respondWith(caches.match(r).then(hit => hit || fetch(r)));
});
