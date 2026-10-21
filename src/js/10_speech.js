/* ---------- الصوت ---------- */
let MUTED = store.get('hp_muted', false);
const CLIPS = {};
let currentAudio = null, lastLine = null;
function voiceAr() { try { const v = speechSynthesis.getVoices(); return v.find(x => /^ar[-_](EG|SA)/i.test(x.lang)) || v.find(x => /^ar/i.test(x.lang)) || null; } catch (e) { return null; } }
const plain = t => t.replace(/[ً-ْ]/g, '');
/* زمن القراءة الصامتة (صوت مكتوم أو لا صوت عربي في الجهاز): مريح لطفل يتابع النص */
const readTime = t => FAST ? 40 : Math.max(1800, plain(t).length * 95) * (SET.slow ? 1.35 : 1);
const GAP = () => FAST ? 0 : (SET.slow ? 750 : 350);       // وقفة قصيرة بين جملة وأخرى (أطول في القراءة الأبطأ، D205)

/* طابور الكلام: جملة واحدة في كل لحظة، ولا تبدأ جملة قبل أن تنتهي سابقتها فعلاً.
   ينتهي الكلام بحدث النهاية الحقيقي (نهاية التسجيل أو نهاية القارئ الآلي)، ومعه مراقبة لحالة القارئ،
   ومهلة أمان طويلة لا تُستعمل إلا إذا تعطّل الجهاز. لا يقطع أي جملةٍ إلا: زرّ الخريطة، أو الكتم، أو «hush» عند الإجابة. */
let speechChain = Promise.resolve(), speechGen = 0, speaking = false, queued = 0, currentFinish = null, pendingNum = null;
const inLine = new Set();                                 // جمل تُقال الآن أو تنتظر: لا تتكرر الجملة نفسها إن كرّر الطفل اللمس
function speechBusy() { return speaking || queued > 0; }
function hush() {                                          // يوقف الجملة الجارية ويُسقط المنتظِرة (الوعود تُحلّ فوراً)
  speechGen++; try { speechSynthesis.cancel(); } catch (e) {}
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  if (currentFinish) currentFinish();
}
function stopVoice() { hush(); }
function say(who, id, text, opt = {}) {
  if (opt.ifIdle && speechBusy()) return Promise.resolve();
  if (inLine.has(id)) return Promise.resolve();
  inLine.add(id);
  const gen = speechGen, item = { skip: false };
  if (opt.num) { if (pendingNum) pendingNum.skip = true; pendingNum = item; }     // العدّ: يكفي آخر رقم ينتظر
  queued++;
  const p = speechChain.then(async () => {
    queued--; if (pendingNum === item) pendingNum = null;
    try { if (gen !== speechGen || item.skip) return;
      await speakNow(who, id, text);
      if (gen === speechGen && !opt.noGap) await new Promise(r => setTimeout(r, GAP()));
    } finally { inLine.delete(id); }
  });
  speechChain = p.catch(() => {});
  return opt.free ? p : gate(p);
}
function speakNow(who, id, text) {
  lastLine = { who, id, text };
  const raw = text; text = G(text);
  $('#who').innerHTML = CHAR[who]();
  $('#say').textContent = text;
  $('#bubble').classList.toggle('chaos', who === 'chaos');
  const talk = $('#talk'); talk.classList.add('speaking');
  const full = (id.startsWith('gen.') ? id : (CUR ? CUR.id : 'm1.u1') + '.' + id) + gSuffix(raw);
  /*T*/if (TESTHOOK) (window.__clips = window.__clips || []).push(full);/*/T*/   // للفحص: مطابقة الجمل المنطوقة مع جدول التسجيل
  return new Promise(resolve => {
    speaking = true; let done = false, poll = null, safety = null, silent = null;
    const finish = () => { if (done) return; done = true; clearInterval(poll); clearTimeout(safety); clearTimeout(silent); speaking = false; currentFinish = null; talk.classList.remove('speaking'); resolve(); };
    currentFinish = finish;
    const readSilently = () => { clearTimeout(safety); clearInterval(poll); silent = setTimeout(finish, readTime(text)); };
    if (MUTED) { readSilently(); return; }
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
    const v = voiceAr(); let started = false, ended = 0;
    parts.forEach(t => { const u = new SpeechSynthesisUtterance(t); u.lang = v ? v.lang : 'ar-SA'; if (v) u.voice = v; u.rate = SET.slow ? 0.72 : 0.9; u.pitch = who === 'chaos' ? 1.3 : 1;
      u.onstart = () => { started = true; }; u.onend = () => { if (++ended === parts.length) finish(); }; u.onerror = () => { if (++ended === parts.length) finish(); };
      synth.speak(u); });
    // مراقبة: بعض الأجهزة لا تُطلق حدث النهاية. إن بدأ الكلام ثم سكت القارئ تماماً، انتهت الجملة
    let quiet = 0;
    poll = setInterval(() => { const busy = synth.speaking || synth.pending; if (busy) { started = true; quiet = 0; } else if (started && ++quiet >= 2) finish(); }, 250);
    // إن لم يبدأ القارئ خلال ثلاث ثوانٍ (لا صوت عربي أو حظر من المتصفح) نعطي الطفل زمن القراءة
    setTimeout(() => { if (!started && !done) { try { synth.cancel(); } catch (e) {} readSilently(); } }, 3000);
    safety = setTimeout(finish, Math.max(12000, plain(text).length * 260));    // أمان أخير فقط
  });
}
async function lines(arr) { for (const [who, id, text] of arr) await say(who, id, text); }

/* ---------- أصوات قصيرة واحتفال ---------- */
let AC = null;
function tone(seq) { if (MUTED) return; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); let t = AC.currentTime;
  for (const [f, d] of seq) { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'triangle'; o.frequency.value = f;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.16, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d + .02); t += d * .8; } } catch (e) {} }
const SFX = { tick: () => tone([[880, .1]]), good: () => tone([[660, .13], [990, .2]]), soft: () => tone([[330, .25]]), pop: () => tone([[520, .08], [780, .1]]),
              win: () => tone([[523, .13], [659, .13], [784, .13], [1046, .3]]) };
function buzz(ms) { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} }
function confetti(n = 28) {
  const box = $('#confetti'); const cols = [css('--circle'), css('--square'), css('--triangle'), css('--rect')];
  for (let i = 0; i < n; i++) { const c = document.createElement('i'); const k = i % 4, col = cols[k];
    c.style.left = (Math.random() * 100) + 'vw'; c.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px'); c.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
    c.style.animationDelay = (Math.random() * .35) + 's';
    c.innerHTML = `<svg viewBox="0 0 16 16" width="16" height="16">${k === 0 ? `<circle cx="8" cy="8" r="7" fill="${col}"/>` : k === 1 ? `<rect x="1" y="1" width="14" height="14" fill="${col}"/>` : k === 2 ? `<polygon points="8,1 15,15 1,15" fill="${col}"/>` : `<rect x="0" y="4" width="16" height="9" fill="${col}"/>`}</svg>`;
    box.appendChild(c); setTimeout(() => c.remove(), 2300); }
}

