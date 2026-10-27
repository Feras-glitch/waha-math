/* جسر أندرويد لواحة الرياضيات: يُحقن في أول <head> في نسخة APK وحدها (platforms/make_platforms.py)، ولا يفعل شيئاً
   خارجها (حين لا يوجد AndroidBridge). يوفّر ما لا يوفّره WebView: النطق بمحرك الجهاز، وحفظ ملف النسخة الاحتياطية،
   والطباعة، وزر الرجوع. ولا يغيّر شيئاً في كود التطبيق نفسه. */
(function () {
  var B = window.AndroidBridge;
  if (!B) return;

  function define(obj, name, value) {
    try { Object.defineProperty(obj, name, { value: value, configurable: true, writable: true }); }
    catch (e) { try { obj[name] = value; } catch (e2) {} }
  }
  function fire(u, h, ev) { if (u && typeof u[h] === 'function') { try { u[h](ev); } catch (e) {} } }

  /* ---------- النطق: speechSynthesis كما في المتصفح، بمحرك النطق في أندرويد ----------
     - الجمل تنتظر دورها (التطبيق يقسّم الجملة الطويلة أجزاءً وينتظر نهاية آخرها).
     - cancel يوقف الكل بلا أحداث: التطبيق ينهي جملته بنفسه بعد cancel (cutNow وكتم الصوت)، ومهلة «لم تبدأ» تنادي
       cancel ثم القراءة الصامتة، فلو أُطلق onerror فوراً لانتهت الجملة قبل زمن قراءتها.
     - خطأٌ قبل أن تبدأ الجملة (لا محرك نطق أو لا صوت عربي) لا يُعلَن: فلا تبدأ الجملة، والتطبيق يقرؤها صامتةً
       بزمن القراءة بعد ثلاث ثوانٍ، كما يفعل في متصفحٍ بلا صوت عربي (src/js/10_speech.js). */
  var nextId = 1, live = {};
  function Utterance(text) {
    this.text = text === undefined ? '' : String(text);
    this.lang = ''; this.rate = 1; this.pitch = 1; this.volume = 1; this.voice = null;
    this.onstart = this.onend = this.onerror = this.onboundary = this.onpause = this.onresume = this.onmark = null;
  }
  var voices = [{ name: 'Android', lang: 'ar-SA', default: true, localService: true, voiceURI: 'android-tts' }];
  var synth = {
    onvoiceschanged: null,
    pending: false,
    paused: false,
    get speaking() { for (var k in live) return true; return false; },
    speak: function (u) {
      var id = String(nextId++);
      live[id] = { u: u, started: false };
      try { B.speak(id, String(u.text || ''), +u.rate || 1, +u.pitch || 1); } catch (e) { delete live[id]; }
    },
    cancel: function () {
      live = {};
      try { B.cancel(); } catch (e) {}
    },
    pause: function () {}, resume: function () {},
    getVoices: function () { return voices; },
    addEventListener: function () {}, removeEventListener: function () {}
  };
  window.__ttsEvent = function (type, id) {
    var r = live[id];
    if (!r) return;
    if (type === 'start') { r.started = true; fire(r.u, 'onstart', { type: 'start' }); return; }
    delete live[id];
    if (type === 'end') fire(r.u, 'onend', { type: 'end' });
    else if (r.started) fire(r.u, 'onerror', { type: 'error', error: 'interrupted' });
  };
  define(window, 'SpeechSynthesisUtterance', Utterance);
  define(window, 'speechSynthesis', synth);

  /* ---------- حفظ ملف (النسخة الاحتياطية في لوحة الكبار): نافذة الحفظ في أندرويد بدل التنزيل ---------- */
  function toBase64(blob) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () { var s = String(fr.result); resolve(s.slice(s.indexOf(',') + 1)); };
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
  }
  var origClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    var a = this, href = a.href || '';
    if (a.hasAttribute('download') && (href.indexOf('blob:') === 0 || href.indexOf('data:') === 0)) {
      var name = a.getAttribute('download') || 'file';
      fetch(href).then(function (r) { return r.blob(); })
        .then(function (blob) { return toBase64(blob).then(function (b64) { B.saveFile(name, blob.type || 'application/octet-stream', b64); }); })
        .catch(function () {});
      return;
    }
    return origClick.apply(this, arguments);
  };

  /* ---------- الطباعة (تقرير الأسبوع): طباعة أندرويد للصفحة الظاهرة ---------- */
  define(window, 'print', function () { try { B.printPage(); } catch (e) {} });

  /* ---------- زر الرجوع: ما يفعله الطفل بالأزرار نفسها ----------
     في غطاءٍ أو لوحة: زرّ رجوعه («نبقى» في غطاء الخروج، و«رجوع» في اللوحة والمعرض والتقرير)، وإلا بقي الغطاء حتى يختار
     الطفل (الترحيب، والاستراحة، و«نكمل؟»). وفي الدرس: زرّ الخريطة، فيفتح غطاء الخروج ويقف الدرس. وفي الشاشة الرئيسية: 0،
     فيُصغَّر التطبيق ولا يُغلق. */
  var BACK = ['exStay', 'galClose', 'repBack', 'gateBack', 'closePanel', 'bkNo', 'dDone'];
  function seen(el) { return !!el && !el.hidden && el.getClientRects().length > 0; }
  window.__androidBack = function () {
    var layers = [].slice.call(document.querySelectorAll('.cover, #panel')).filter(function (c) { return !c.hidden; });
    var top = layers[layers.length - 1];
    if (top) {
      for (var i = 0; i < BACK.length; i++) { var b = top.querySelector('#' + BACK[i]); if (seen(b)) { b.click(); return 1; } }
      return 1;
    }
    var L = document.getElementById('lesson'), m = document.getElementById('mapBtn');
    if (L && !L.hidden && seen(m)) { m.click(); return 1; }
    return 0;
  };
})();
