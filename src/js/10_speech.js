/* ---------- الصوت ---------- */
const CLIPS = {};
let currentAudio = null, lastLine = null;
/* الصوت العربي يُحفظ عند voiceschanged: على أندرويد تكون القائمة فارغة عند أول نداء */
let VOICE = null;
/* NO_TTS (مراجعة الخصم X-02، X-04، X-11): لا نطق يعمل في هذا الجهاز الآن، فتُقرأ الجمل صامتةً بزمن قراءتها من أول جملة لا بعد إخفاق كل واحدة.
   'novoice': أصوات الجهاز معروفة وليس فيها عربي (فلا يقرأ صوتٌ إنجليزي نصاً عربياً)؛ ويعود النطق إن ظهر صوت عربي.
   'fail': المحرّك أخفق قبل أن يبدأ (synthesis-failed وأمثاله)، أو لم يبدأ مرتين متتاليتين، أو أعلن جسر أندرويد أنه بلا صوت عربي */
let NO_TTS = false, TTS_MISS = 0;
function pickVoice() { try { const v = speechSynthesis.getVoices(); VOICE = v.find(x => /^ar[-_](EG|SA)/i.test(x.lang)) || v.find(x => /^ar/i.test(x.lang)) || null;
    if (VOICE && NO_TTS === 'novoice') NO_TTS = false; else if (!VOICE && v.length && !NO_TTS) NO_TTS = 'novoice'; } catch (e) { VOICE = null; } }
function ttsBridgeDown() { try { const B = window.AndroidBridge; return !!(B && B.ttsState && B.ttsState() === 2); } catch (e) { return false; } }
/* حال الصوت للكبار (المراجعة بعين جديدة، 13 نوفمبر 2026): الطفل في م1 لا يقرأ، فجهازٌ بلا صوت عربي يُنبَّه إليه الكبار في الخريطة نفسها، لا في اللوحة وحدها.
   'ok' صوت عربي أو حزمة صوت تامّة؛ 'none' لا صوت عربي (أو جسر أندرويد بلا عربية)؛ 'wait' لم تصل قائمة الأصوات بعد */
function voiceState() { try { if (VPACK.n && VPACK.n >= voiceIds().size * .95) return 'ok'; } catch (e) {}
  if (window.AndroidBridge && window.AndroidBridge.ttsState) { let s = 0; try { s = window.AndroidBridge.ttsState(); } catch (e) {} return s === 1 ? 'ok' : s === 2 ? 'none' : 'wait'; }
  if (VOICE) return 'ok'; if (NO_TTS) return 'none'; return 'wait'; }
try { pickVoice(); speechSynthesis.addEventListener('voiceschanged', () => { pickVoice(); if (typeof voiceNote === 'function') voiceNote(); }); } catch (e) {}
/* زمن القراءة الصامتة (صوت مكتوم أو لا صوت عربي): مريح لطفل يتابع النص */
const readTime = t => FAST ? 40 : Math.max(1500, plain(t).length * 95) * ({ slow: 1.35, normal: 1, fast: .75 })[SPD()];
const GAP = () => FAST ? 0 : ({ slow: 750, normal: 350, fast: 180 })[SPD()];       // وقفة قصيرة بين جملة وأخرى (أطول في القراءة الأبطأ، D205)

/* طابور الكلام: جملة واحدة في كل لحظة، ولا تبدأ جملة قبل أن تنتهي سابقتها فعلاً.
   ينتهي الكلام بحدث النهاية الحقيقي، ومعه مراقبة لحالة القارئ ومهلة أمان طويلة لا تُستعمل إلا إذا تعطّل الجهاز.
   لا يقطع جملةً إلا: الخروج، أو الكتم، أو «hush» عند الإجابة، أو زرّ «أعد الجملة» (يبدؤها من أولها). */
let speechChain = Promise.resolve(), speechGen = 0, speaking = false, queued = 0, currentFinish = null, pendingNum = null, NOW_ITEM = null, LASTQ = null;
const inLine = new Map();                                 // جمل تُقال الآن أو تنتظر: لا تتكرر الجملة نفسها إن كرّر الطفل اللمس (المفتاح ← صاحبه)
function speechBusy() { return speaking || queued > 0; }
function cutNow() { try { speechSynthesis.cancel(); } catch (e) {} if (currentAudio) { currentAudio.pause(); currentAudio = null; } if (currentFinish) currentFinish(); }   /* يقطع الجملة الجارية وحدها */
function hush() { speechGen++; inLine.clear(); PEND_INTRO = null; SKIPPING = false; cutNow(); }   /* ما قُطع لا يحجز مفتاحه: «أعد الجملة» بعده مباشرة يبدؤها من أولها */
/* غطاء الخروج يوقف الدرس ولا يُنهي جملته (الفحص المستقل F2 (1)(ب) و(3): كان hush() فيمضي الدرس تحت الغطاء، ويضيع سؤال الحلّ المشترك في التعدّي):
   الجملة الجارية تُقطع وتبقى في مكانها من الطابور ومعها ما بعدها، وكل انتظار بالبوابة (gate) ينتظر؛ و«نبقى» (resumeLesson) تعيدها من أولها ثم يمضي الطابور،
   و«الخريطة» مسارٌ جديد (show) يُسقطها. وجملة الغطاء نفسه تُقال خارج الطابور الموقوف */
/* ويوقف معه الحركة والمؤقّتات (الفحص المستقل G2 (4)): حركات الصفحة كلها تقف وتمضي بعد «نبقى»، وpsleep وtween في النواة لا تعدّ زمن الإيقاف */
function pauseLesson() { if (PAUSED) return; let r; const p = new Promise(x => { r = x; }); PAUSED = { p, resolve: r, gen: speechGen, cut: !!(NOW_ITEM && speaking), held: false, anims: [], t: performance.now() };
  if (PAUSED.cut) NOW_ITEM.cut = true; cutNow();
  try { document.documentElement.classList.add('lpause'); PAUSED.anims = document.getAnimations().filter(a => a.playState === 'running' && !cssOwned(a)); PAUSED.anims.forEach(a => a.pause()); } catch (e) {}
  SLEEPERS.forEach(s => s.stop()); }
/* يعيد true إن كان في الطابور ما يُقال (الجملة المقطوعة أو التالية)، فلا يُعاد غيره */
/* والحركة التي أُلغيت أثناء الإيقاف (وهج الفانوس ونبض الأهداف تُسقطها أول لمسة) لا تُبعث: play() على الملغاة يشغّلها بلا صنفها فلا يوقفها شيء (الفحص المستقل H2 (3)).
   وحركات CSS لا يوقفها الكود أصلاً بل الأنماط (html.lpause): حركة CSS أوقفها الكود ثم بعثها تصير في كروميوم لا تقف بإزالة صنفها، فتبقى يتيمةً بعد أول لمسة
   (الفحصان المستقلان I2 (1) وJ2 (1): الغطاء بالمفتاح ثم اللمس، وإطفاء الشاشة ثم اللمس). فتبقى ملكيتها لصنفها: ما أُزيل صنفه تحت الإيقاف يزول، وما بقي يمضي؛
   والقصاصات تُخفى تحت الإيقاف فلا تقف فوق الغطاء */
const cssOwned = a => (window.CSSAnimation && a instanceof CSSAnimation) || (window.CSSTransition && a instanceof CSSTransition);
function resumeLesson() { const P = PAUSED; if (!P) return false; PAUSE_MS += performance.now() - P.t; PAUSED = null; document.documentElement.classList.remove('lpause'); P.anims.forEach(a => { try { if (a.playState === 'paused') a.play(); } catch (e) {} }); SLEEPERS.forEach(s => s.go()); P.resolve();
  return (P.cut || P.held) && P.gen === speechGen; }
/* العودة بعد الإيقاف (غطاء الخروج، وإطفاء الشاشة): ما على الشاشة بخطّاف إعادة (البطاقات المسموعة، والخيارات المقروءة، وحلّ التعدّي) يُعاد بتمهيده وبنوده كلها،
   فلا يُستأنف من البطاقة المقطوعة بلا سؤالها ولا تمهيد فوضى (الفحص المستقل G2 (1)؛ D236)؛ وإلا تُعاد الجملة المقطوعة من أولها ويمضي الطابور، وإن لم يكن ما يُقال فآخر جملة */
function resumeBack() { if (REPLAY_HOOK && REPLAY_HOOK.live && REPLAY_HOOK.live()) { hush(); resumeLesson(); replayLine(); return; } if (!resumeLesson()) replayLine(); }
const stopVoice = hush;
/* الشاشة أُطفئت أو بُدّل التطبيق: الدرس يقف كما تحت الغطاء، ويعود حين تظهر (الفحص المستقل G2 (5): كان hush() وحده فيمضي الدرس والشاشة مطفأة) */
/* وكل ما في #lesson الظاهر، بدرسٍ أو بغيره (الورشة وجداول «مراجعة اليوم» بلا CUR: الفحص المستقل H2 (2)، كانت تتكلّم والشاشة مطفأة)؛ وسؤال الغطاء يُقطع ويُعاد عند
   الظهور، ولا يُستأنف الدرس والغطاء مفتوح («نبقى» تستأنفه) */
/* وكل غطاء لا غطاء الخروج وحده (الفحص المستقل I2 (2)(3)): غطاء التبويب الآخر فوق الدرس لا يُستأنف الدرس تحته، وسؤال كل غطاء («نكمل؟» والاستراحة والأطفال…) يُقطع
   بالإخفاء ويُعاد عند الظهور (coverSay يحفظه في الغطاء) */
/* وغطاءٌ خارج الدرس أو الخريطة، والطابور غير موقوف: الجملة الجارية تُقطع وتبقى في مكانها، ولا تبدأ جملة حتى تظهر الصفحة، ثم تُعاد المقطوعة من أولها ويمضي ما بعدها
   (كان hush() فيمضي تسلسل الغطاء والصفحة مخفية: «أرقامي» تعدّ الأرقام والشاشة مطفأة، ثم يُعاد سؤاله في غير موضعه) */
let HELD = 0;   /* جملٌ تنتظر ظهور الصفحة */
const shownP = () => new Promise(r => { const f = () => { if (!document.hidden) { document.removeEventListener('visibilitychange', f); r(); } }; document.addEventListener('visibilitychange', f); });
let VIS_PAUSE = false, VIS_COVER = null;
const openCover = () => [...document.querySelectorAll('.cover, #panel')].reverse().find(c => !c.hidden) || null;   /* الأعلى: الأغطية بطبقة واحدة فآخرها في الصفحة أعلاها، وبوابة الكبار فوقها (الفحص المستقل J2 (2)) */
document.addEventListener('visibilitychange', () => { const cov = openCover(), live = !$('#lesson').hidden;
  if (document.hidden) { if (live && !PAUSED && !cov) { pauseLesson(); VIS_PAUSE = true; } else if (PAUSED) { cutNow(); if (cov) VIS_COVER = cov; } else { if (NOW_ITEM && speaking) NOW_ITEM.cut = true; cutNow(); if (cov) VIS_COVER = cov; } }
  else { if (VIS_PAUSE) { VIS_PAUSE = false; if (PAUSED && !openCover()) resumeBack(); }
    if (VIS_COVER) { const c = VIS_COVER; VIS_COVER = null; if (!c.hidden && c.dataset.ask && (PAUSED || !HELD)) coverSay(c, c.dataset.ask); } } });   /* وسؤال الغطاء يُعاد إن لم تنتظر جملةٌ ظهورَ الصفحة (تُعاد المقطوعة ويمضي تسلسل الغطاء من موضعه) */
/* الصورة قبل الصوت (D270، قرار فراس، 16 نوفمبر 2026): مقدّمةُ مشهدٍ لم يُرسم بعد لا تُقرأ فوق ما قبله. introOnStage يؤجّلها حتى يُرسم المشهد (newStage)،
   أو حتى أول جملةٍ بعدها إن لم يرسم المشهد لوحاً جديداً؛ وبعد كل لوح جديد وقفةٌ قصيرة (STAGE_SETTLE) تستقرّ فيها العين على الصورة قبل أول جملة */
let PEND_INTRO = null, STAGE_T = -1e9; const STAGE_SETTLE = 320;
/* «تخطَّ» (D270): يقطع الجملة الجارية، وما بعدها حتى ينتظر الدرسُ فعلَ الطفل يُكتب في الفقاعة بلا صوت ولا انتظار (SKIPPING، يُلغيه AUTO عند كل انتظار
   لفعله، وhush عند الإجابة). ولا يمسّ جملة غطاء. وIN_ITEM: نحن داخل بند (سؤاله وتلميحه وتنبيهه)، فوضع «الأسئلة فقط» يُسمعها ويكتب الشرح */
let SKIPPING = false, IN_ITEM = 0, SKIP_AT = 0;
/* «السابق» (D271، قرار فراس): جمل الشاشة الجارية (منذ آخر لوح جديد) بما فيها ما تُخطّي، ولمس «السابق» يعيد الجملة التي قبل المعروضة، ثم التي قبلها،
   بصوتها ونصّها وتلوين كلماتها. لا تدخلها جملة مخفيّة النص (بطاقات فوضى) ولا الأعداد ولا الخيارات المقروءة. ولا رجوع إلى سؤالٍ أُجيب: الحكم والتقدّم كما هما */
let HIST = [], BACK_I = null;
function backLine() { if (speechBusy() || HIST.length < 2) return; BACK_I = BACK_I == null ? HIST.length - 2 : Math.max(0, BACK_I - 1); const [w, id, t] = HIST[BACK_I]; say(w, id, t, { free: true, back: true }); }
function skipNow() { if (!speechBusy() && !PEND_INTRO) return; SKIPPING = true; SKIP_AT = Date.now(); flushIntro(); cutNow();
  try { if (CUR) { const P = progOf(CUR.id); P.skips = (P.skips || 0) + 1; saveProg(); } } catch (e) {} }
function flushIntro() { if (!PEND_INTRO) return; const x = PEND_INTRO; PEND_INTRO = null; for (const id of [].concat(x)) if (id) say(...lineOf(id), { free: true, intro: true }); }
function introOnStage(x) { if (x) PEND_INTRO = x; }
function say(who, id, text, opt = {}) {
  if (PEND_INTRO && !opt.intro && !opt.cover) flushIntro();
  const key = (id.startsWith('gen.') ? '' : (CUR ? CUR.id + '.' : '')) + id;
  if (opt.ifIdle && speechBusy()) return Promise.resolve();
  if (opt.cover && PAUSED) { if (document.hidden) { VIS_COVER = opt.cover; return Promise.resolve(); } return speakNow(who, id, text, opt); }   /* سؤال غطاء الخروج والدرس موقوف: لا ينتظر الطابور ولا البوابة؛ والصفحة مخفية: يُسأل عند ظهورها */
  if (inLine.has(key)) return opt.free ? Promise.resolve() : gate(Promise.resolve());
  const gen = speechGen, item = { skip: false }; inLine.set(key, item); if (!opt.keep && !opt.num && !opt.aside) LASTQ = [who, id, text];   /* آخر جملة دخلت الطابور (سؤال الخيارات المقروءة) */
  if (opt.num) { if (pendingNum) pendingNum.skip = true; pendingNum = item; }     // العدّ: يكفي آخر رقم ينتظر
  queued++; if (typeof updateSkip === 'function') updateSkip();
  const p = speechChain.then(async () => {
    queued--; if (pendingNum === item) pendingNum = null;
    try { for (;;) { for (;;) { if (PAUSED && !opt.cover) { PAUSED.held = true; await PAUSED.p; } else if (document.hidden) { HELD++; try { await shownP(); } finally { HELD--; } } else break; }   /* ولا تبدأ جملةٌ والصفحة مخفية (غطاءٌ خارج الدرس أو الخريطة) */
        if (gen !== speechGen || item.skip) return;
        if (!FAST && !opt.cover && !SKIPPING) { const w = STAGE_T + STAGE_SETTLE - performance.now(); if (w > 0) await psleep(w); if (gen !== speechGen || item.skip) return; }   /* الصورة قبل الصوت */
        item.cut = false; NOW_ITEM = item; await speakNow(who, id, text, opt); if (NOW_ITEM === item) NOW_ITEM = null;
        if (!item.cut) break; }   /* قطعها غطاء الخروج: تُعاد من أولها بعد «نبقى» */
      if (gen === speechGen && !opt.noGap && !SKIPPING) await psleep(GAP());   /* والفاصل يقف مع الدرس: انتهى تحت الغطاء فمضت قراءة البطاقات إلى التالية ونغمتها (الفحص المستقل H2 (4أ)) */
    } finally { if (NOW_ITEM === item) NOW_ITEM = null; if (inLine.get(key) === item) inLine.delete(key); }   /* لا يمحو مفتاح جملة جديدة بالمعرّف نفسه بعد hush */
  });
  speechChain = p.catch(() => {});
  return opt.free ? p : gate(p);
}
/* تلوين الكلمة المقروءة (D270): الجملة كلماتٌ في الفقاعة (span.w)، ونصّها كما هو (textContent لا يتغيّر). والتوقيت تقديرٌ بطول الكلمة ووقفات الترقيم
   على زمن الجملة: مدّة التسجيل، أو تقدير سرعة صوت الجهاز وتصحّحه أحداث الحدود (onboundary) حيث يُطلقها، أو زمن القراءة الصامتة. وكلمةٌ تسمّي شيئاً
   في المشهد (aria-label يبدأ بها) يتوهّج الشيء معها (التمييز) */
function fillBubble(b, text, sep) { if (sep == null) b.textContent = ''; else b.appendChild(document.createTextNode(sep)); const out = [];
  for (const part of String(text).split(/(\s+)/)) { if (!part) continue; if (/^\s+$/.test(part)) { b.appendChild(document.createTextNode(part)); continue; } const s = document.createElement('span'); s.className = 'w'; s.textContent = part; b.appendChild(s); out.push(s); }
  return out; }
const NAMED_SKIP = new Set(['الذي', 'التي', 'هذا', 'هذه', 'هناك', 'الآن', 'كل', 'على', 'إلى', 'مثل']);
function hiliter(words) { const W = words.map(w => plain(w.textContent).length + 1 + (/[.!؟?:،…]$/.test(w.textContent) ? 5 : 0)); const tot = W.reduce((a, b) => a + b, 0) || 1;
  const at = []; let c = 0; for (const w of W) { at.push(c / tot); c += w; }   /* بداية كل كلمة كنسبة من الزمن */
  let t0 = 0, dur = 0, raf = 0, cur = -1, off = 0; const chars = []; { let k = 0; for (const w of words) { chars.push(k); k += w.textContent.length + 1; } }
  const named = w => { const k = plain(w.textContent).replace(/[.!؟?:،…«»]/g, '').replace(/^(و|ف|ب|ل|ك)?(ال)?/, ''); if (k.length < 3 || NAMED_SKIP.has(plain(w.textContent))) return;
    const st = $('#stage'); if (!st) return; for (const e of st.querySelectorAll('[aria-label]')) { const l = plain(e.getAttribute('aria-label')).replace(/^(ال)/, ''); if (l.startsWith(k)) { e.classList.add('named'); setTimeout(() => e.classList.remove('named'), 1100); break; } } };
  const set = i => { if (i === cur || i >= words.length) return; if (cur >= 0 && words[cur]) words[cur].classList.remove('on'); cur = i; if (i >= 0) { words[i].classList.add('on'); try { named(words[i]); const sy = words[i].closest('#say'); if (sy && sy.scrollHeight > sy.clientHeight + 4) { const r = words[i].getBoundingClientRect(), q = sy.getBoundingClientRect(); if (r.bottom > q.bottom || r.top < q.top) sy.scrollTop += r.top - q.top - 2; } } catch (e) {} } };   /* الجملة الطويلة: نافذة الفقاعة تتبع القراءة سطراً سطراً */
  const tick = () => { if (!dur) return; const f = (performance.now() - t0) / dur + off; let i = 0; while (i + 1 < at.length && at[i + 1] <= f) i++; set(i); if (f < 1) raf = requestAnimationFrame(tick); };
  return { start(ms) { if (!words.length) return; dur = Math.max(300, ms); t0 = performance.now(); off = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); },
    sync(ci) { if (!dur) return; let i = 0; while (i + 1 < chars.length && chars[i + 1] <= ci) i++; off = at[i] - (performance.now() - t0) / dur; set(i); },
    stop() { cancelAnimationFrame(raf); dur = 0; if (cur >= 0 && words[cur]) words[cur].classList.remove('on'); cur = -1; } }; }
function speakNow(who, id, text, opt = {}) {
  /* keep: خيار يُقرأ بعد السؤال، لا يصير «آخر جملة» ولا يغيّر نصّ الفقاعة (readChoices).
     num: عدد أو ترتيب يُقال وهو يعدّ أو يلمس، وaside: جملة جانبية (عرض المساعدة): لا تصير «آخر جملة»، فـ«أعد» يعيد السؤال (الفحص المستقل B: كان يعيد آخر رقم أو «هل نفكّر معاً؟»)؛
     والعدد لا يمحو السؤال من الفقاعة أيضاً، والجملة الجانبية تظهر فيها */
  if (!opt.keep && !opt.num && !opt.aside && !opt.hideText && !opt.cover && !opt.back) { HIST.push([who, id, text]); if (HIST.length > 40) HIST.shift(); BACK_I = null; }
  if (!opt.keep && !opt.num && !opt.aside) lastLine = { who, id, text, lesson: CUR ? CUR.id : null, hideText: !!opt.hideText };
  if (opt.onStart) try { opt.onStart(); } catch (e) {}
  const raw = text; text = G(text);
  const bubble = opt.cover ? opt.cover.querySelector('.coversay') : $('#say');
  if (!opt.cover) { $('#who').innerHTML = CHAR[who](); $('#bubble').classList.toggle('chaos', who === 'chaos'); $('#bubble').classList.toggle('hidetext', !!opt.hideText); }
  let words = [];   /* كلمات الجملة في الفقاعة، يتلوّن منها ما يُقرأ الآن (D270) */
  if (bubble && !opt.keep && !opt.num) { if (opt.hideText) bubble.textContent = '؟'; else words = fillBubble(bubble, text, opt.append && bubble.textContent ? (opt.sep || ' ') : null); }   /* append: تتمة السؤال (العدد بعد «حتى يصير:») تُضاف إلى نصّه؛ وsep فاصلها إن بدأت جملة جديدة */
  if (!opt.cover && !opt.keep && !opt.num) { const sy = $('#say'); if (sy) { sy.scrollTop = 0; bubbleMore(); } }
  const talk = $('#talk'); talk.classList.add('speaking');
  const full = (id.startsWith('gen.') ? id : (CUR ? CUR.id : 'm1.u1') + '.' + id) + gSuffix(raw);
  /*T*/if (TESTHOOK) { const cv = openCover(); if (document.hidden) testBug('جملةٌ تبدأ والصفحة مخفية: ' + full); if (cv && !opt.cover) testBug('جملةٌ لغير الغطاء الظاهر (' + cv.id + '): ' + full); if (STALE) testBug('جملةٌ بعد مهلةٍ من شاشةٍ تُركت: ' + full); }/*/T*/   /* حارس التشغيل (الفحص المستقل J2 (8)) */
  /*T*/if (TESTHOOK) { (window.__clips = window.__clips || []).push(full); (window.__voiceSrc = window.__voiceSrc || []).push([full, CLIPS[full] ? 'human' : 'device']); (window.__clipT = window.__clipT || []).push([full, 's', performance.now(), !$('#exitCover').hidden]); }/*/T*/   // للفحص: مطابقة الجمل المنطوقة مع جدول التسجيل، ومصدر كل جملة (حزمة الصوت أو صوت الجهاز)
  return new Promise(resolve => {
    speaking = true; updateSkip(); let done = false, poll = null, safety = null, silent = null; const HL = hiliter(words);
    const finish = () => { if (done) return; done = true; HL.stop(); clearInterval(poll); clearTimeout(safety); clearTimeout(silent); speaking = false; currentFinish = null; talk.classList.remove('speaking'); updateSkip();
      /*T*/if (TESTHOOK) (window.__clipT = window.__clipT || []).push([full, 'e', performance.now(), !$('#exitCover').hidden]);/*/T*/
      if (!opt.cover && !opt.keep && !opt.num) { const sy = $('#say'); if (sy && sy.scrollHeight > sy.clientHeight + 8) try { sy.scrollTo({ top: sy.scrollHeight, behavior: RM ? 'auto' : 'smooth' }); } catch (e) { sy.scrollTop = sy.scrollHeight; } }   /* آخر الجملة (المطلوب غالباً) يبقى ظاهراً */
      resolve(); };
    currentFinish = finish;
    let quietRead = false;
    const readSilently = () => { if (done || quietRead) return; quietRead = true; if (opt.onSilent && !FAST) try { opt.onSilent(); } catch (e) {} clearTimeout(safety); clearInterval(poll); silent = setTimeout(finish, readTime(text)); HL.start(readTime(text) * .85); };
    if (SKIPPING && !opt.cover) { if (opt.onSilent) try { opt.onSilent(); } catch (e) {} finish(); return; }   /* تُخطّيت: مكتوبةٌ في الفقاعة، ولا تُنتظر */
    if (SET.muted || READ.mode === 'none' || (READ.mode === 'questions' && !IN_ITEM && !opt.cover && !opt.question)) { readSilently(); return; }   /* question: سؤالٌ خارج البنود (بطاقات فوضى) يُسمع في «الأسئلة فقط» */
    let synth; try { synth = window.speechSynthesis; } catch (e) {}
    /* بصوت الجهاز؛ وما لا يعمل فيه النطق يُقرأ صامتاً بزمن قراءته */
    const viaDevice = () => {
      if (done) return; clearTimeout(safety);
      if (!synth || FAST || NO_TTS || ttsBridgeDown()) { if (ttsBridgeDown()) NO_TTS = 'fail'; readSilently(); return; }
      // القارئ الآلي: نقسّم إلى جمل قصيرة (كروم يقطع الكلام الطويل)، وننتظر نهاية آخرها
      const parts = text.replace(/([.!؟?:،…])\s+/g, '$1\u0000').split('\u0000').filter(x => x.trim());
      if (!VOICE) pickVoice(); if (NO_TTS) { readSilently(); return; }
      const v = VOICE; let started = false, ended = 0;
      /* بعد أن تبدأ: سقفٌ بطول النص لمحرّك لا يُطلق حدث النهاية ويبقى «يتكلّم» (X-05)، بدل 260 م.ث للحرف */
      const begin = () => { if (started) return; started = true; HL.start(plain(text).length * ({ slow: 105, normal: 82, fast: 66 })[SPD()]); TTS_MISS = 0; clearTimeout(safety); safety = setTimeout(() => { try { synth.cancel(); } catch (e) {} finish(); }, plain(text).length * (SET.slow ? 165 : 130) + 2000); };
      parts.forEach(t => { const u = new SpeechSynthesisUtterance(t); u.lang = v ? v.lang : 'ar-SA'; if (v) u.voice = v; u.rate = ({ slow: .72, normal: .9, fast: 1.12 })[SPD()]; u.pitch = who === 'chaos' ? 1.3 : 1;
        const base = text.indexOf(t); u.onstart = begin; u.onend = () => { if (++ended === parts.length) finish(); }; u.onboundary = e => { if (e && e.name !== 'sentence' && base >= 0) HL.sync(base + (e.charIndex || 0)); };
        /* إخفاقٌ قبل أن تبدأ (لا صوت يعمل): الجملة تُقرأ صامتةً بزمن قراءتها، وكذلك ما بعدها في الجلسة (X-02: كان الإخفاق يُعدّ نهايةً فتومض الجمل) */
        u.onerror = e => { const er = e && e.error; if (!started && !done && er !== 'interrupted' && er !== 'canceled') { NO_TTS = 'fail'; try { synth.cancel(); } catch (x) {} readSilently(); return; }
          if (++ended === parts.length) finish(); };
        synth.speak(u); });
      let quiet = 0;   // مراقبة: بعض الأجهزة لا تُطلق حدث النهاية
      poll = setInterval(() => { const busy = synth.speaking || synth.pending; if (busy) { begin(); quiet = 0; } else if (started && ++quiet >= 2) finish(); }, 250);
      setTimeout(() => { if (!started && !done && !quietRead) { try { synth.cancel(); } catch (e) {} if (++TTS_MISS >= 2) NO_TTS = 'fail'; readSilently(); } }, 3000);   // لم تبدأ: زمن القراءة، ومرتان متتاليتان: صامتاً بعدها
      safety = setTimeout(finish, Math.max(12000, plain(text).length * 260)); };
    if (CLIPS[full]) {                                     // تسجيل بشري: ننتظر نهايته الفعلية
      const a = currentAudio = new Audio(CLIPS[full]); if (SPD() !== 'normal') { a.playbackRate = SPD() === 'slow' ? .85 : 1.18; a.preservesPitch = true; }
      let fell = false; const fall = () => { if (fell || done) return; fell = true; try { a.pause(); } catch (e) {} viaDevice(); };   // تسجيل تالف: صوت الجهاز لا الصمت (C-17)
      a.onended = finish; a.onerror = fall; a.onplaying = () => { if (isFinite(a.duration)) HL.start(a.duration * 1000 / a.playbackRate); };
      a.onloadedmetadata = () => { clearTimeout(safety); if (isFinite(a.duration)) safety = setTimeout(finish, a.duration * 1000 / a.playbackRate + 2500); };
      safety = setTimeout(finish, 30000);
      a.play().catch(fall); return;
    }
    viaDevice();
  });
}
/* هل بقي من نصّ الفقاعة ما لا يُرى؟ (الشاشة القصيرة: ثلاثة أسطر تُمرَّر) */
function bubbleMore() { const sy = $('#say'), b = $('#bubble'); if (!sy || !b) return; requestAnimationFrame(() => b.classList.toggle('saymore', sy.scrollHeight > sy.clientHeight + 8 && sy.scrollTop + sy.clientHeight < sy.scrollHeight - 8)); }   /* «saymore» لا «more»: ‎.more‎ صنف زرّ في الأنماط */
{ const on = () => { const sy = $('#say'); if (sy) sy.addEventListener('scroll', bubbleMore, { passive: true }); }; if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', on); else on(); }
/* «أعد الجملة» (M16): تقطع الجارية وتبدؤها من أولها، مع وميض الفقاعة */
function replayLine(cover) {
  if (REPLAY_HOOK && !REPLAY_HOOK.live()) REPLAY_HOOK = null;   /* خطّاف بطاقات غادرها الطفل لا يُعاد */
  if (!cover && REPLAY_HOOK) { hush(); REPLAY_HOOK(); return; }   /* مشهد يعيد قراءته بنفسه (البطاقتان المسموعتان، D236) */
  if (!lastLine) return; const L = lastLine; hush();
  const b = cover ? cover.querySelector('.coversay') : $('#bubble'); if (b) anim(b, [{ opacity: .4 }, { opacity: 1 }], 300);
  const keep = CUR; if (L.lesson && (!CUR || CUR.id !== L.lesson)) CUR = { id: L.lesson };
  say(L.who, L.id, L.text, { free: true, cover, hideText: L.hideText }); CUR = keep;   /* المخفي يبقى مخفياً */
}

/* ---------- أصوات قصيرة واحتفال ---------- */
let AC = null;
function tone(seq) { /*T*/if (TESTHOOK) { if (document.hidden) testBug('نغمةٌ والصفحة مخفية'); if (STALE) testBug('نغمةٌ بعد مهلةٍ من شاشةٍ تُركت'); }/*/T*/ if (SET.muted) return; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); let t = AC.currentTime;
  for (const [f, d] of seq) { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'triangle'; o.frequency.value = f;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.16, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d + .02); t += d * .8; } } catch (e) {} }
const SFX = { tick: () => tone([[880, .1]]), good: () => tone([[660, .13], [990, .2]]), soft: () => NEUTRAL_ANS ? tone([[880, .1]]) : tone([[330, .25]]),   /* في الإتقان نغمة الخطأ هي النقرة (مراجعة الخصم A-01: لمس جسم الشكل بدل رؤوسه كان يُسمع الخطأ) */ pop: () => tone([[520, .08], [780, .1]]),
              win: () => tone([[523, .13], [659, .13], [784, .13], [1046, .3]]),
              chaos: () => tone([[740, .09], [622, .09], [740, .09], [494, .22]]) };   // النغمة الثابتة قبل «فوضى تظنّ…» (D236)
function buzz(ms) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} }
function confetti(n = 28) {
  if (RM) return;                                          // تقليل الحركة: لا قصاصات متساقطة
  const box = $('#confetti'); const cols = [css('--circle'), css('--square'), css('--triangle'), css('--rect')];
  for (let i = 0; i < n; i++) { const c = document.createElement('i'); const k = i % 4, col = cols[k];
    c.style.left = (drand() * 100) + 'vw'; c.style.setProperty('--dx', (drand() * 120 - 60) + 'px'); c.style.setProperty('--r', (drand() * 720 - 360) + 'deg');
    c.style.animationDelay = (drand() * .35) + 's';
    c.innerHTML = `<svg viewBox="0 0 16 16" width="16" height="16">${k === 0 ? `<circle cx="8" cy="8" r="7" fill="${col}"/>` : k === 1 ? `<rect x="1" y="1" width="14" height="14" fill="${col}"/>` : k === 2 ? `<polygon points="8,1 15,15 1,15" fill="${col}"/>` : `<rect x="0" y="4" width="16" height="9" fill="${col}"/>`}</svg>`;
    box.appendChild(c); psleep(2300).then(() => c.remove()); }   /* يقف مع الدرس: يعود الطفل من الغطاء والقصاصات تسقط (الفحص المستقل I2 (5)) */
}
