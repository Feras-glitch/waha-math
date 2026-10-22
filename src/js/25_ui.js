/* =====================================================================
   واجهة الدرس: الزرّ الكبير، وشريط المراحل، والمسرح، والفانوس، والخيارات المسموعة
   ===================================================================== */
const go = $('#go'), help = $('#helpBtn');
/* الزرّ الكبير يُخفى حين لا فعل له (M2)، ولا يبقى معطّلاً بعنوان مضلِّل */
function setGo(label, onClick) { go.innerHTML = `<span>${esc(G(label))}</span>${ICON.play}`; go.onclick = onClick; go.disabled = false; go.classList.remove('idle'); }
function lockGo() { go.disabled = true; go.onclick = null; go.classList.add('idle'); }
function nextBtn(lbl) { AUTO({ kind: 'go', ok: () => go.click() }); return gate(new Promise(res => setGo(lbl || label('next'), () => { lockGo(); hush(); AUTO_CLEAR(); res(); }))); }
/* شريط المراحل بعدد مراحل الدرس الفعلي */
function setSteps(n) { const s = $('#steps'); s.innerHTML = ''; s.style.setProperty('--n', n); for (let i = 0; i < n; i++) s.appendChild(document.createElement('i')); s.hidden = !n; }
function setStep(i) { [...$('#steps').children].forEach((d, k) => { d.className = k < i ? 'done' : (k === i ? 'now' : ''); }); }
let STAGE_RO = null;   /* إن تغيّر حجم المسرح (فقاعة أطول، أو شاشة قصيرة، أو تدوير) أُعيد حساب مناطق اللمس بالبكسل الفعلي */
function newStage(H = 300, bg = {}, aria) { const st = $('#stage'); st.innerHTML = ''; const svg = el('svg', { viewBox: `0 0 360 ${H}`, preserveAspectRatio: 'xMidYMid meet', role: 'img', 'aria-label': aria || (CUR ? plain(CUR.title || '') : '') }); st.appendChild(svg);
  try { if (STAGE_RO) STAGE_RO.disconnect(); STAGE_RO = new ResizeObserver(() => refreshPads(svg)); STAGE_RO.observe(svg); } catch (e) {} if (bg !== null) backdrop(svg, H, bg); return svg; }
function label(svgOrKey, x, y, text, size = 19, color) {
  if (typeof svgOrKey === 'string') return labelText(svgOrKey);
  const t = el('text', { x, y, 'text-anchor': 'middle', 'font-size': size, 'font-weight': 800, fill: color || css('--ink'), 'font-family': css('--f'), 'paint-order': 'stroke', stroke: css('--paper'), 'stroke-width': 5 }, svgOrKey); t.textContent = G(text); return t; }
/* تسمية تُطوى سطرين إن زادت على العرض المتاح، فلا تُقصّ عند حافة المسرح */
function labelFit(svg, x, y, text, size, color, maxW) { if (!text) return null; const t = label(svg, x, y, text, size, color); try { if (t.getComputedTextLength() <= maxW) return t;
  const w = G(text).split(' '); if (w.length < 2) { t.setAttribute('font-size', size * maxW / t.getComputedTextLength()); return t; } const mid = Math.ceil(w.length / 2); t.textContent = '';
  [w.slice(0, mid).join(' '), w.slice(mid).join(' ')].forEach((s, i) => { const sp = el('tspan', { x, dy: i ? size * 1.15 : -size * .2 }, t); sp.textContent = s; }); } catch (e) {} return t; }
function labelText(k) { const D = CUR ? LDATA[CUR.id] : null; return (D && D.labels && D.labels[k]) || LABELS.ui[k] || k; }
/* شارة العدّ: لون النص يُختار بحسب الخلفية (T10) */
function badge(parent, x, y, n, col) { const bg = col || css('--compass'); const m = el('g', { transform: `translate(${x} ${y})`, 'pointer-events': 'none' }, parent);
  el('circle', { r: 15, fill: bg, stroke: '#fff', 'stroke-width': 3 }, m);
  if (digitsShown()) { const t = el('text', { y: 6, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: onColor(bg), 'font-family': css('--f') }, m); t.textContent = DG(n); }
  else el('circle', { r: 4.5, fill: onColor(bg) }, m);   /* قبل «أرقام الواحة» لا رقم مكتوباً: الشارة نقطة، والعدد مسموع */
  anim(m, [{ transform: `translate(${x}px,${y}px) scale(.2)` }, { transform: `translate(${x}px,${y}px) scale(1)` }], { duration: 260, easing: 'cubic-bezier(.3,1.6,.6,1)' }); return m; }
function renderMute() { for (const id of ['#muteBtn', '#muteBtn2']) { const b = $(id); if (b) { b.innerHTML = SET.muted ? ICON.mute : ICON.sound; b.setAttribute('aria-pressed', SET.muted); } } }
for (const id of ['#muteBtn', '#muteBtn2']) $(id).onclick = () => { SET.muted = !SET.muted; saveSet();
  if (SET.muted) { try { speechSynthesis.cancel(); } catch (e) {} if (currentAudio) { currentAudio.pause(); currentAudio = null; } if (currentFinish) currentFinish(); }   // الكتم لا يُسقط الجمل التالية: تُعرض مكتوبةً بزمن القراءة
  renderMute(); };
$('#replay').innerHTML = ICON.replay; $('#replay').onclick = () => replayLine();
$('#mapBtn').innerHTML = ICON.map;
help.innerHTML = ICON.lantern;

/* ---------- خطافات الفحص الآلي: كل انتظار لفعل الطفل يسجّل حلّه الصحيح وخطأً مقصوداً (تُحذف من نسخة الأطفال) ---------- */
function AUTO(d) { /*T*/if (TESTHOOK) { window.__autoN = (window.__autoN || 0) + 1; window.__auto = { ...d, n: window.__autoN, scene: SCENE_NOW }; }/*/T*/ }
function AUTO_CLEAR() { /*T*/if (TESTHOOK) window.__auto = null;/*/T*/ }

/* ---------- الفانوس (M3، M4): ظاهر في كل لحظة تفاعل، ويتوهّج بعد الخمول، ولمسه يعطي المساعدة فوراً ---------- */
let idleTimer = null, idleHandler = null;
function armIdle(h, opt = {}) { idleHandler = h; help.hidden = false; help.classList.remove('glow');
  help.onclick = () => { help.classList.remove('glow'); clearTimeout(idleTimer); const f = idleHandler; if (f) Promise.resolve(f()).then(() => { if (idleHandler === f) resetIdle(opt); }); };
  resetIdle(opt); }
function resetIdle(opt = {}) { clearTimeout(idleTimer); if (!idleHandler) return;
  const wait = FAST ? 1500 : (opt.first ? 10000 : 20000);   // T9: أقصر في أول لقاء بالأداة
  idleTimer = setTimeout(async () => { if (speechBusy()) { resetIdle(opt); return; } help.classList.add('glow'); await S('gen.hintOffer.01', { ifIdle: true, free: true, aside: true }); }, wait); }
function disarmIdle() { idleHandler = null; clearTimeout(idleTimer); help.hidden = true; help.classList.remove('glow'); }
document.addEventListener('pointerdown', e => { if (idleHandler && !help.contains(e.target)) { help.classList.remove('glow'); resetIdle(); } }, true);
/* أول لقاء بأداة (M4): عرض تلقائي قصير، ثم يبدأ الطفل. يُحفظ لكل طفل */
function firstTime(tool) { if (SET.seen[tool]) return false; SET.seen[tool] = 1; saveSet(); return true; }
/* نبض خفيف على ما يُلمس حتى أول لمسة (M4) */
function pulse(nodes) { const list = [].concat(nodes).filter(Boolean); list.forEach(n => n.classList.add('pulse'));
  const off = () => { list.forEach(n => n.classList.remove('pulse')); document.removeEventListener('pointerdown', off, true); };
  document.addEventListener('pointerdown', off, true); return off; }
/* يد شبح تعرض الحركة (M4) */
async function ghostHand(svg, path, ms = 1200) {
  const h = el('g', { 'pointer-events': 'none', opacity: .85 }, svg);
  el('path', { d: 'M0 0 l-6 -20 q-1 -5 4 -5 q4 0 5 5 l2 9 l1 -14 q1 -5 5 -5 q4 0 4 5 l0 14 l2 -10 q1 -4 5 -4 q4 1 3 5 l-1 12 q3 -5 6 -4 q4 2 2 6 l-6 14 q-4 8 -14 8 q-9 0 -12 -6 z', fill: '#fff', stroke: '#1b3440', 'stroke-width': 2, 'stroke-linejoin': 'round' }, h);
  const [x0, y0] = path[0]; h.setAttribute('transform', `translate(${x0} ${y0})`);
  await tween(ms, t => { const k = t * (path.length - 1); const i = Math.min(path.length - 2, Math.floor(k)), f = k - i; const [ax, ay] = path[i], [bx, by] = path[i + 1] || path[i];
    h.setAttribute('transform', `translate(${ax + (bx - ax) * f} ${ay + (by - ay) * f})`); });
  await sleep(250); h.remove();
}

/* ---------- اختيار بأيقونة وكلمة (الكلام يقوله المرشد) ----------
   options: [k، النص، الأيقونة، جملة اسمه]؛ إن كان لكل خيار جملة قُرئت الخيارات بعد السؤال وهي تُضاء (المبدأ 8: الطفل قد لا يقرأ) */
function choosePick(options, okKey, opt = {}) {
  const box = document.createElement('div'); box.className = 'choices icons' + (opt.cls ? ' ' + opt.cls : ''); (opt.host || $('#stage')).appendChild(box);
  const btns = options.map(([k, t, ic]) => { const b = document.createElement('button'); b.className = 'pick'; b.innerHTML = (ic || PICKICON[k] || '') + `<span>${esc(G(t))}</span>`; b.dataset.k = k; b.setAttribute('aria-label', plain(G(t)));
    /*T*/if (TESTHOOK) b.dataset.ok = okKey == null ? '' : (Array.isArray(okKey) ? okKey.includes(k) : k === okKey);/*/T*/ box.appendChild(b); return b; });
  AUTO({ kind: 'pick', ok: () => (btns.find(b => okKey == null || (Array.isArray(okKey) ? okKey.includes(b.dataset.k) : b.dataset.k === okKey)) || btns[0]).click(), wrong: () => (btns.find(b => okKey != null && !(Array.isArray(okKey) ? okKey.includes(b.dataset.k) : b.dataset.k === okKey)) || btns[0]).click() });
  const r = gate(new Promise(res => btns.forEach(b => b.onclick = () => { if (box.dataset.done) return; box.dataset.done = 1; AUTO_CLEAR(); hush();
    b.classList.add(okKey == null || (Array.isArray(okKey) ? okKey.includes(b.dataset.k) : b.dataset.k === okKey) ? 'ok' : 'no'); SFX.tick(); res(b.dataset.k); })))
    .then(k => { setTimeout(() => box.remove(), FAST ? 30 : 700); return k; });
  if (options.every(o => o[3])) readChoices(options.map((o, i) => ({ line: lineOf(o[3]), el: btns[i] })), { host: box });
  return r;
}
/* بطاقات مسموعة: يقرأ المرشد كل بطاقة وهو يضيئها، ويمكن الإجابة قبل انتهاء القراءة (م1: الطفل قد لا يقرأ).
   والبطاقة المخفية (hide) بلا نصّ: رمز سماع واحد على كل البطاقات المخفية فلا تتميّز بالنظر (D236)، ويُكشف نصّ الصحيحة بعد الاختيار (reveal).
   و«أعد الجملة» أثناءها يعيد قراءة البطاقات كلها بالترتيب، كلٌّ بتمهيده، لا آخر جملة وحدها */
const EAR = '<svg viewBox="0 0 40 28" width="44" height="30" aria-hidden="true"><path d="M8 11h6l7-6v18l-7-6H8z" fill="currentColor"/><path d="M26 9a7 7 0 0 1 0 10M30 5a12 12 0 0 1 0 18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>';
let REPLAY_HOOK = null;
function cardPick(cards, opt = {}) {   // cards: [{id(line), k, ok, icon, hide, pre}]؛ opt.intro: معرّف السؤال، يُعاد قبل البطاقات عند «أعد الجملة»
  const box = document.createElement('div'); box.className = 'choices cards'; (opt.host || $('#stage')).appendChild(box);
  const list = opt.keepOrder ? cards : shuffle(cards);
  const btns = list.map(c => { const b = document.createElement('button'); b.className = 'pick card' + (c.hide ? ' hidden-text' : ''); b.dataset.k = c.k;
    b.innerHTML = (c.icon || '') + (c.hide ? `<span class="q">${EAR}</span>` : `<span>${esc(T(c.id))}</span>`); b.setAttribute('aria-label', c.hide ? plain(labelText('listenCard')) : plain(T(c.id)));
    /*T*/if (TESTHOOK) b.dataset.ok = !!c.ok;/*/T*/ box.appendChild(b); return b; });
  let answered = false, run = 0;
  AUTO({ kind: 'card', ok: () => btns.find(b => list[btns.indexOf(b)].ok).click(), wrong: () => (btns.find(b => !list[btns.indexOf(b)].ok) || btns[0]).click() });
  const p = gate(new Promise(res => btns.forEach((b, i) => b.onclick = () => { if (box.dataset.done) return; answered = true; REPLAY_HOOK = null; AUTO_CLEAR(); hush(); btns.forEach(x => x.classList.remove('reading')); res(list[i]); })));
  const lines = list.map(c => lineOf(c.id)), intro = opt.intro ? lineOf(opt.intro) : null, flow = FLOW;   /* النصوص من درسها وقت الإنشاء، لا من الدرس الجاري وقت اللمس */
  const readAll = async withIntro => { const me = ++run; btns.forEach(x => x.classList.remove('reading'));
    if (withIntro && intro) { await say(...intro, { free: true }); if (answered || me !== run) return; }
    for (const [i, b] of btns.entries()) { if (answered || me !== run) break; b.classList.add('reading'); const c = list[i]; if (c.pre) await c.pre(); if (answered || me !== run) break;
      await say(...lines[i], { hideText: c.hide && !opt.keepQ, keep: !!opt.keepQ, free: true }); b.classList.remove('reading'); } };   /* keepQ: بطاقات الأعداد المسموعة تُقرأ والسؤال باقٍ في الفقاعة (S1-U3) */
  /* الخطّاف حيّ ما دامت البطاقات على الشاشة في المسار نفسه: الخروج إلى الخريطة أو مسرح جديد يُسقطه (الدرس الآخر لا يسمع بطاقات هذا) */
  REPLAY_HOOK = () => readAll(true); REPLAY_HOOK.live = () => !answered && !box.dataset.done && flow === FLOW && box.isConnected;
  readAll(false);
  return { box, btns, p, list, done: () => { box.dataset.done = 1; REPLAY_HOOK = null; },
    reveal: k => { const i = list.findIndex(c => c.k === k); if (i >= 0) { btns[i].innerHTML = `<span>${esc(T(list[i].id))}</span>`; btns[i].classList.remove('hidden-text'); btns[i].setAttribute('aria-label', plain(T(list[i].id))); } } };
}
/* الخيارات المقروءة بعد السؤال (D254 (3)): يضيء كل خيار حين يُقرأ، ولا يصير «آخر جملة» ولا يغيّر نصّ الفقاعة، فيبقى السؤال ظاهراً؛
   و«أعد الجملة» ما دامت الخيارات على الشاشة يعيد السؤال ثم الخيارات (D254 (5))، لا اسم آخر خيار وحده (فهو أحياناً الجواب وأحياناً الخطأ).
   items: [{line, el}]؛ opt.intro: جمل السؤال، وإلا آخر جملة قيلت قبل أول خيار؛ opt.host: ما يزول بزوال الخيارات أو يُعلَّم done عند الجواب */
function readChoices(items, opt = {}) {
  let intro = opt.intro || null, run = 0; const flow = FLOW, host = opt.host;
  const dead = () => flow !== FLOW || !!(host && (!host.isConnected || host.dataset.done));
  const readAll = async withIntro => { const me = ++run, g0 = speechGen; const stop = () => me !== run || speechGen !== g0 || dead();   /* لمسة تُسكت القراءة (hush) توقف ما بقي منها */
    items.forEach(it => it.el && it.el.classList.remove('reading'));
    if (withIntro && intro) for (const l of intro) { await say(l[0], l[1], l[2], { free: true, ...(l[3] || {}) }); if (stop()) return; }   /* l[3]: خيارات الجملة (append) */
    for (const it of items) { if (stop()) break; const seq = it.lines || [it.line];   /* الخيار جملة واحدة، أو جمل متتابعة (بطاقة جملة عددية) */
      for (const [j, l] of seq.entries()) { await say(l[0], l[1], l[2], { free: true, keep: true, noGap: j < seq.length - 1 || opt.noGap, onStart: j ? undefined : () => { if (!intro && lastLine) intro = [[lastLine.who, lastLine.id, lastLine.text]]; items.forEach(x => x.el && x.el.classList.remove('reading')); if (it.el) it.el.classList.add('reading'); } });
        if (stop()) break; }
      if (it.el) it.el.classList.remove('reading'); } };
  REPLAY_HOOK = () => readAll(true); REPLAY_HOOK.live = () => !dead();
  readAll(false);
}
/* اختيار عدد: الكلمة مسموعة دائماً، والرقم مكتوب بعد أن يتعلّمه الطفل (D229) */
const digitsKnown = () => !!(PROG['m1.u1.d5'] || {}).done || !!PROG.unlockAll;
/* الأرقام المكتوبة في الرسم (الشارات والعدّادات): من درس «أرقام الواحة» نفسه فصاعداً (N003)، وقبله نقاط وعلامات عدّ */
const LESSON_SEQ = () => UNITS.flatMap(u => u.lessons);
const digitsShown = () => digitsKnown() || (!!CUR && LESSON_SEQ().indexOf(CUR.id) >= LESSON_SEQ().indexOf('m1.u1.d5'));
const tallyText = n => '•'.repeat(n);
function numberPick(nums, ok, opt = {}) {
  const box = document.createElement('div'); box.className = 'choices nums'; (opt.host || $('#stage')).appendChild(box);
  const showDigits = opt.digits ?? digitsKnown();
  const btns = nums.map(n => { const b = document.createElement('button'); b.className = 'pick num'; b.dataset.k = n;
    b.innerHTML = (showDigits ? `<b>${DG(n)}</b>` : '') + `<span>${esc(T(numw(n)))}</span>`; b.setAttribute('aria-label', plain(T(numw(n))));
    /*T*/if (TESTHOOK) b.dataset.ok = n === ok;/*/T*/ box.appendChild(b); return b; });
  let answered = false;
  AUTO({ kind: 'num', ok: () => btns.find(b => +b.dataset.k === ok).click(), wrong: () => (btns.find(b => +b.dataset.k !== ok) || btns[0]).click() });
  const p = gate(new Promise(res => btns.forEach(b => b.onclick = () => { if (box.dataset.done) return; box.dataset.done = 1; answered = true; AUTO_CLEAR(); hush(); SFX.tick(); res(+b.dataset.k); })));
  if (opt.read !== false) readChoices(btns.map(b => ({ line: lineOf(numw(+b.dataset.k)), el: b })), { intro: opt.intro, host: box, noGap: true });   /* الأعداد خيارات: لا تحلّ محلّ السؤال، و«أعد الجملة» يعيد السؤال ثم الأعداد */
  return { box, btns, p };
}
/* خيارات عددية حول الجواب: ثلاثة أعداد متجاورة غير سالبة، مخلوطة */
function nearNums(n, max = 10) { const set = new Set([n]); for (const d of shuffle([-1, 1, -2, 2])) { if (set.size >= 3) break; const v = n + d; if (v >= 0 && v <= max) set.add(v); } return shuffle([...set]); }
/* زرّ «تمّ» على المسرح للمهام المفتوحة (الإخراج والبناء) */
function doneBtn(onClick) { const b = document.createElement('button'); b.className = 'pick done'; b.innerHTML = ICON.check + `<span>${esc(G(labelText('done')))}</span>`; b.setAttribute('aria-label', plain(labelText('done')));
  const bar = document.createElement('div'); bar.className = 'choices donebar'; bar.appendChild(b); $('#stage').appendChild(bar); b.onclick = onClick; return { bar, b }; }
