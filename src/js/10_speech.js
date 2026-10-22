/* ---------- الصوت ---------- */
const CLIPS = {};
let currentAudio = null, lastLine = null;
/* الصوت العربي يُحفظ عند voiceschanged: على أندرويد تكون القائمة فارغة عند أول نداء */
let VOICE = null;
function pickVoice() { try { const v = speechSynthesis.getVoices(); VOICE = v.find(x => /^ar[-_](EG|SA)/i.test(x.lang)) || v.find(x => /^ar/i.test(x.lang)) || null; } catch (e) { VOICE = null; } }
try { pickVoice(); speechSynthesis.addEventListener('voiceschanged', pickVoice); } catch (e) {}
/* زمن القراءة الصامتة (صوت مكتوم أو لا صوت عربي): مريح لطفل يتابع النص */
const readTime = t => FAST ? 40 : Math.max(1800, plain(t).length * 95) * (SET.slow ? 1.35 : 1);
const GAP = () => FAST ? 0 : (SET.slow ? 750 : 350);       // وقفة قصيرة بين جملة وأخرى (أطول في القراءة الأبطأ، D205)

/* طابور الكلام: جملة واحدة في كل لحظة، ولا تبدأ جملة قبل أن تنتهي سابقتها فعلاً.
   ينتهي الكلام بحدث النهاية الحقيقي، ومعه مراقبة لحالة القارئ ومهلة أمان طويلة لا تُستعمل إلا إذا تعطّل الجهاز.
   لا يقطع جملةً إلا: الخروج، أو الكتم، أو «hush» عند الإجابة، أو زرّ «أعد الجملة» (يبدؤها من أولها). */
let speechChain = Promise.resolve(), speechGen = 0, speaking = false, queued = 0, currentFinish = null, pendingNum = null;
const inLine = new Map();                                 // جمل تُقال الآن أو تنتظر: لا تتكرر الجملة نفسها إن كرّر الطفل اللمس (المفتاح ← صاحبه)
function speechBusy() { return speaking || queued > 0; }
function hush() { speechGen++; inLine.clear(); try { speechSynthesis.cancel(); } catch (e) {} if (currentAudio) { currentAudio.pause(); currentAudio = null; } if (currentFinish) currentFinish(); }   /* ما قُطع لا يحجز مفتاحه: «أعد الجملة» بعده مباشرة يبدؤها من أولها */
const stopVoice = hush;
document.addEventListener('visibilitychange', () => { if (document.hidden) hush(); });   // الشاشة أُطفئت أو بُدّل التطبيق
function say(who, id, text, opt = {}) {
  const key = (id.startsWith('gen.') ? '' : (CUR ? CUR.id + '.' : '')) + id;
  if (opt.ifIdle && speechBusy()) return Promise.resolve();
  if (inLine.has(key)) return opt.free ? Promise.resolve() : gate(Promise.resolve());
  const gen = speechGen, item = { skip: false }; inLine.set(key, item);
  if (opt.num) { if (pendingNum) pendingNum.skip = true; pendingNum = item; }     // العدّ: يكفي آخر رقم ينتظر
  queued++;
  const p = speechChain.then(async () => {
    queued--; if (pendingNum === item) pendingNum = null;
    try { if (gen !== speechGen || item.skip) return;
      await speakNow(who, id, text, opt);
      if (gen === speechGen && !opt.noGap) await new Promise(r => setTimeout(r, GAP()));
    } finally { if (inLine.get(key) === item) inLine.delete(key); }   /* لا يمحو مفتاح جملة جديدة بالمعرّف نفسه بعد hush */
  });
  speechChain = p.catch(() => {});
  return opt.free ? p : gate(p);
}
function speakNow(who, id, text, opt = {}) {
  /* keep: خيار يُقرأ بعد السؤال، لا يصير «آخر جملة» ولا يغيّر نصّ الفقاعة (readChoices).
     num: عدد أو ترتيب يُقال وهو يعدّ أو يلمس، وaside: جملة جانبية (عرض المساعدة): لا تصير «آخر جملة»، فـ«أعد» يعيد السؤال (الفحص المستقل B: كان يعيد آخر رقم أو «هل نفكّر معاً؟»)؛
     والعدد لا يمحو السؤال من الفقاعة أيضاً، والجملة الجانبية تظهر فيها */
  if (!opt.keep && !opt.num && !opt.aside) lastLine = { who, id, text, lesson: CUR ? CUR.id : null, hideText: !!opt.hideText };
  if (opt.onStart) try { opt.onStart(); } catch (e) {}
  const raw = text; text = G(text);
  const bubble = opt.cover ? opt.cover.querySelector('.coversay') : $('#say');
  if (!opt.cover) { $('#who').innerHTML = CHAR[who](); $('#bubble').classList.toggle('chaos', who === 'chaos'); $('#bubble').classList.toggle('hidetext', !!opt.hideText); }
  if (bubble && !opt.keep && !opt.num) bubble.textContent = opt.hideText ? '؟' : opt.append && bubble.textContent ? bubble.textContent + ' ' + text : text;   /* append: تتمة السؤال (العدد بعد «حتى يصير:») تُضاف إلى نصّه */
  if (!opt.cover && !opt.keep && !opt.num) { const sy = $('#say'); if (sy) { sy.scrollTop = 0; bubbleMore(); } }
  const talk = $('#talk'); talk.classList.add('speaking');
  const full = (id.startsWith('gen.') ? id : (CUR ? CUR.id : 'm1.u1') + '.' + id) + gSuffix(raw);
  /*T*/if (TESTHOOK) { (window.__clips = window.__clips || []).push(full); (window.__voiceSrc = window.__voiceSrc || []).push([full, CLIPS[full] ? 'human' : 'device']); }/*/T*/   // للفحص: مطابقة الجمل المنطوقة مع جدول التسجيل، ومصدر كل جملة (حزمة الصوت أو صوت الجهاز)
  return new Promise(resolve => {
    speaking = true; let done = false, poll = null, safety = null, silent = null;
    const finish = () => { if (done) return; done = true; clearInterval(poll); clearTimeout(safety); clearTimeout(silent); speaking = false; currentFinish = null; talk.classList.remove('speaking');
      if (!opt.cover && !opt.keep && !opt.num) { const sy = $('#say'); if (sy && sy.scrollHeight > sy.clientHeight + 8) try { sy.scrollTo({ top: sy.scrollHeight, behavior: RM ? 'auto' : 'smooth' }); } catch (e) { sy.scrollTop = sy.scrollHeight; } }   /* آخر الجملة (المطلوب غالباً) يبقى ظاهراً */
      resolve(); };
    currentFinish = finish;
    const readSilently = () => { clearTimeout(safety); clearInterval(poll); silent = setTimeout(finish, readTime(text)); };
    if (SET.muted) { readSilently(); return; }
    if (CLIPS[full]) {                                     // تسجيل بشري: ننتظر نهايته الفعلية
      const a = currentAudio = new Audio(CLIPS[full]); if (SET.slow) { a.playbackRate = .85; a.preservesPitch = true; }
      a.onended = finish; a.onerror = readSilently;
      a.onloadedmetadata = () => { clearTimeout(safety); if (isFinite(a.duration)) safety = setTimeout(finish, a.duration * 1000 / a.playbackRate + 2500); };
      safety = setTimeout(finish, 30000);
      a.play().catch(readSilently); return;
    }
    let synth; try { synth = window.speechSynthesis; } catch (e) {}
    if (!synth || FAST) { readSilently(); return; }
    // القارئ الآلي: نقسّم إلى جمل قصيرة (كروم يقطع الكلام الطويل)، وننتظر نهاية آخرها
    const parts = text.replace(/([.!؟?:،…])\s+/g, '$1\u0000').split('\u0000').filter(x => x.trim());
    if (!VOICE) pickVoice(); const v = VOICE; let started = false, ended = 0;
    parts.forEach(t => { const u = new SpeechSynthesisUtterance(t); u.lang = v ? v.lang : 'ar-SA'; if (v) u.voice = v; u.rate = SET.slow ? 0.72 : 0.9; u.pitch = who === 'chaos' ? 1.3 : 1;
      u.onstart = () => { started = true; }; u.onend = () => { if (++ended === parts.length) finish(); }; u.onerror = () => { if (++ended === parts.length) finish(); };
      synth.speak(u); });
    let quiet = 0;   // مراقبة: بعض الأجهزة لا تُطلق حدث النهاية
    poll = setInterval(() => { const busy = synth.speaking || synth.pending; if (busy) { started = true; quiet = 0; } else if (started && ++quiet >= 2) finish(); }, 250);
    setTimeout(() => { if (!started && !done) { try { synth.cancel(); } catch (e) {} readSilently(); } }, 3000);   // لا صوت عربي أو حظر: زمن القراءة
    safety = setTimeout(finish, Math.max(12000, plain(text).length * 260));
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
function tone(seq) { if (SET.muted) return; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); let t = AC.currentTime;
  for (const [f, d] of seq) { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'triangle'; o.frequency.value = f;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.16, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d + .02); t += d * .8; } } catch (e) {} }
const SFX = { tick: () => tone([[880, .1]]), good: () => tone([[660, .13], [990, .2]]), soft: () => tone([[330, .25]]), pop: () => tone([[520, .08], [780, .1]]),
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
    box.appendChild(c); setTimeout(() => c.remove(), 2300); }
}
