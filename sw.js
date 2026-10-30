/* عامل خدمة «واحة الرياضيات» على الويب: يحفظ التطبيق (ملف واحد وأيقوناته) ليعمل بلا إنترنت بعد أول فتح.
   الصفحة من الشبكة أولاً (فيصل كل تحديث حين يتصل الجهاز)، ومن الذاكرة إن انقطع الاتصال.
   ويحذف ذاكرته هو وحدها (waha-math-*): على عنوان github.io نفسه تطبيقات أخرى للعائلة. */
const CACHE = 'waha-math-1.0.1-7928923c53';
const FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-180.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('waha-math-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  const page = r.mode === 'navigate' || /\/(index\.html)?$/.test(new URL(r.url).pathname);
  if (page) {
    e.respondWith(fetch(r).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); }
      return res;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(hit => hit || fetch(r)));
});
