/* استوديو الواحة، المرحلة 1: المعلّق، والسياق الحي، والتصدير (docs/مواصفة_استوديو_الواحة.md).
   الحالة كلها في هذا الجهاز: localStorage لمن هو، وIndexedDB لحزمة العمل والتسجيلات والدفعات. لا شبكة. */
/* global DRIVER_SRC, STUDIO_VERSION, makeZip, readZip, wavBytes, analyze, CHECK_TXT, diffWords, toI16, toF32, encodeOpus, opusSupported, DB, textHash */
'use strict';
const $ = s => document.querySelector(s);
const WHO = { compass: 'فرجار', chaos: 'فوضى' };
const ROLES = [['voice', 'معلّق صوتي', 'يسجّل جمل شخصية واحدة'], ['lang', 'مراجع لغوي', ''], ['sci', 'مراجع علمي أو تربوي', ''], ['sharia', 'مراجع شرعي', ''], ['teacher', 'معلم', ''], ['parent', 'وليّ أمر', '']];
const GOAL = 50;
const ME_KEY = 'st_me';
let ME = (() => { try { return JSON.parse(localStorage.getItem(ME_KEY)) || {}; } catch (e) { return {}; } })();
const saveMe = () => localStorage.setItem(ME_KEY, JSON.stringify(ME));
let PACK = null, TAKES = new Map(), TAB = 'all', QUEUE = [], QI = 0, FORM = 0;

function toast(t, ms) { const d = document.createElement('div'); d.className = 'toast'; d.setAttribute('role', 'status'); d.textContent = t; document.body.append(d); setTimeout(() => d.remove(), ms || 3200); }
function show(id) { for (const s of document.querySelectorAll('.scr')) s.hidden = s.id !== id && !s.closest('.ov'); window.scrollTo(0, 0); }
const el = (tag, props, ...kids) => { const e = document.createElement(tag); if (props) for (const [k, v] of Object.entries(props)) { if (k === 'class') e.className = v; else if (k.startsWith('on')) e[k] = v; else if (k === 'text') e.textContent = v; else e.setAttribute(k, v); } for (const c of kids) if (c != null) e.append(c); return e; };

/* ---------- الملفات: كل جملة ملف، أو ملفان (_m و_f) للجملة ذات الصيغتين ---------- */
const filesOf = r => r.f != null ? [r.id + '_m', r.id + '_f'] : [r.id];
const textOf = (r, k) => k === 1 && r.f != null ? r.f : r.m;
function fileState(r, fid) { const t = TAKES.get(fid); if (!t) return 'none'; if (t.hash !== r.hash) return 'redo'; if (r.redo && t.t < PACK.importedAt) return 'redo'; return 'done'; }
function rowState(r) { const s = filesOf(r).map(f => fileState(r, f)); if (s.every(x => x === 'done')) return 'done'; if (s.some(x => x === 'redo')) return 'redo'; if (s.some(x => x === 'done')) return 'half'; return 'none'; }
const lessonName = r => r.lessonLabel || 'جمل عامة';

/* ---------- الإقلاع ---------- */
async function boot() {
  PACK = await DB.get('kv', 'pack') || null;
  for (const t of await DB.all('takes')) TAKES.set(t.fileId, t);
  if (!ME.agreedAt) return agreeScreen();
  if (!ME.role) return roleScreen();
  if (!ME.room) return micScreen();
  home();
}

/* ---------- 1) الاتفاق ---------- */
function agreeScreen() {
  show('sAgree');
  const upd = () => { $('#aGuardWrap').hidden = !$('#aMinor').checked;
    $('#aGo').disabled = !($('#aOk').checked && $('#aName').value.trim().length >= 2 && (!$('#aMinor').checked || $('#aGuard').value.trim().length >= 2)); };
  for (const id of ['#aName', '#aGuard']) $(id).oninput = upd; for (const id of ['#aOk', '#aMinor']) $(id).onchange = upd;
  $('#aName').value = ME.name || ''; upd();
  $('#aGo').onclick = () => { ME.name = clean($('#aName').value); ME.credit = $('#aCredit').checked; ME.guardian = $('#aMinor').checked ? clean($('#aGuard').value) : '';
    ME.agreedAt = new Date().toISOString(); ME.agreeVersion = 1; saveMe(); boot(); };
}
const clean = s => s.replace(/[<>"'&`\\/:*?|]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);

/* ---------- 2) الدور ---------- */
function roleScreen() {
  show('sRole'); const box = $('#roles'); box.textContent = '';
  for (const [k, name, sub] of ROLES) {
    const b = el('button', { type: 'button' }, name, el('small', { text: k === 'voice' ? sub : 'في المرحلة الثانية' }));
    if (k !== 'voice') b.disabled = true;
    b.onclick = () => { ME.role = k; saveMe(); boot(); }; box.append(b);
  }
}

/* ---------- التسجيل: ميكروفون واحد يبقى مفتوحاً، وعامل صوت يجمع العينات ويقيس المستوى ---------- */
const REC = { ctx: null, node: null, stream: null, chunks: null, onLevel: null, on: false };
const WORKLET = `class R extends AudioWorkletProcessor { process(i) { const c = i[0] && i[0][0]; if (c) this.port.postMessage(c.slice(0)); return true; } } registerProcessor('rec', R);`;
async function micOpen() {
  if (REC.ctx) { if (REC.ctx.state === 'suspended') await REC.ctx.resume(); return; }
  REC.stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
  REC.ctx = new AudioContext({ sampleRate: 48000 });
  await REC.ctx.audioWorklet.addModule(URL.createObjectURL(new Blob([WORKLET], { type: 'text/javascript' })));
  const src = REC.ctx.createMediaStreamSource(REC.stream); REC.node = new AudioWorkletNode(REC.ctx, 'rec');
  REC.node.port.onmessage = e => { const d = e.data; if (REC.on) REC.chunks.push(d);
    if (REC.onLevel) { let s = 0; for (let i = 0; i < d.length; i++) s += d[i] * d[i]; REC.onLevel(Math.sqrt(s / d.length)); } };
  const mute = REC.ctx.createGain(); mute.gain.value = 0; src.connect(REC.node); REC.node.connect(mute); mute.connect(REC.ctx.destination);
}
function recStart() { REC.chunks = []; REC.on = true; }
function recStop() { REC.on = false; const n = REC.chunks.reduce((s, c) => s + c.length, 0), f = new Float32Array(n); let p = 0; for (const c of REC.chunks) { f.set(c, p); p += c.length; } REC.chunks = null; return { f32: f, sr: REC.ctx.sampleRate }; }
const meterTo = sel => v => { $(sel).style.width = Math.min(100, Math.max(0, (20 * Math.log10(Math.max(v, 1e-6)) + 60) / 60 * 100)) + '%'; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function micOrSay() { try { await micOpen(); return true; } catch (e) { toast('لم يُسمح بالميكروفون. اسمح للتطبيق به من إعدادات الهاتف ثم أعد المحاولة.', 6000); return false; } }

/* ---------- 3) فحص الغرفة ---------- */
function micScreen(back) {
  show('sMic'); $('#micVerdict').textContent = ''; $('#micLine').hidden = true; $('#micStep').textContent = 'أولاً نسمع الغرفة وهي هادئة. المس «ابدأ» واصمت خمس ثوانٍ.'; $('#micGo').textContent = 'ابدأ'; $('#micGo').disabled = false;
  let step = 0, noise = null;
  $('#micSkip').onclick = () => { ME.room = ME.room || { skipped: true, at: new Date().toISOString() }; saveMe(); back ? home() : boot(); };
  $('#micGo').onclick = async () => {
    if (step === 2) { back ? home() : boot(); return; }
    if (!await micOrSay()) return; REC.onLevel = meterTo('#micMeter'); $('#micGo').disabled = true;
    if (step === 0) { $('#micStep').textContent = 'اصمت… نسمع الغرفة.'; recStart(); await sleep(5000); const r = recStop(); noise = analyze(r.f32, r.sr).noise;
      step = 1; $('#micStep').textContent = 'والآن اقرأ هذه الجملة بصوتك العادي، ثم المس «انتهيت».'; $('#micLine').hidden = false; $('#micGo').textContent = 'سجّل'; $('#micGo').disabled = false; return; }
    if (step === 1 && !REC.on) { recStart(); $('#micGo').textContent = 'انتهيت'; $('#micGo').disabled = false; return; }
    const r = recStop(), a = analyze(r.f32, r.sr), v = [];
    if (noise > -50) v.push('في الغرفة ضجيج (' + noise + ' dB). أطفئ المروحة أو المكيّف، أو جرّب غرفة أصغر بستائر.');
    if (a.checks.includes('empty')) v.push('لم يُسمع كلام. اقترب من الهاتف وأعد الفحص.');
    else { if (a.checks.includes('clip')) v.push('الصوت مرتفع حتى التشوّه. ابتعد قليلاً.'); if (a.checks.includes('low')) v.push('الصوت منخفض. اقترب من الهاتف.'); }
    $('#micVerdict').textContent = v.length ? v.join(' ') : 'الغرفة والميكروفون مناسبان. يمكنك البدء.';
    ME.room = { noise, level: a.level, ok: !v.length, at: new Date().toISOString() }; saveMe(); REC.onLevel = null;
    step = 2; $('#micGo').textContent = v.length ? 'تابع على أي حال' : 'تابع'; $('#micGo').disabled = false;
    const again = el('button', { class: 'quiet', type: 'button', text: 'أعد الفحص', onclick: () => { again.remove(); micScreen(back); } }); if (v.length) $('#micGo').after(again);
  };
}

/* ---------- الاستيراد ---------- */
function pickFile() { const f = $('#fileIn'); f.value = ''; f.click(); }
$('#fileIn').onchange = () => { const f = $('#fileIn'); if (f.files && f.files[0]) importPack(f.files[0]); };
async function importPack(file) {
  try {
    const z = await readZip(new Uint8Array(await file.arrayBuffer())); const mj = z.get('manifest.json'), eng = z.get('engine.html');
    if (!mj) throw new Error('ليست حزمة عمل (لا manifest.json)');
    const m = JSON.parse(new TextDecoder().decode(mj)); if (m.kind !== 'wahawork' || !Array.isArray(m.rows)) throw new Error('ليست حزمة عمل');
    if (m.minStudio && m.minStudio > STUDIO_VERSION_N) throw new Error('هذه الحزمة تحتاج نسخة أحدث من الاستوديو');
    for (const r of m.rows) { const h = await textHash(r.m, r.f); if (h !== r.hash) throw new Error('الحزمة تالفة: بصمة نص لا تطابق (' + r.id + ')'); }
    if (m.who && m.who.char && ME.char && m.who.char !== ME.char && !confirm('هذه الحزمة لشخصية «' + WHO[m.who.char] + '»، وأنت تسجّل «' + WHO[ME.char] + '». أتستوردها؟')) return;
    m.importedAt = Date.now(); if (m.who && m.who.char) ME.char = m.who.char; saveMe();
    await DB.put('kv', 'pack', m); if (eng) await DB.put('kv', 'engine', new TextDecoder().decode(eng)); else await DB.del('kv', 'engine');
    PACK = m; toast('استُوردت الحزمة: ' + m.rows.length + ' جملة'); closeOv('#more'); home();
  } catch (e) { toast('تعذّر الاستيراد: ' + e.message, 6000); }
}
const STUDIO_VERSION_N = 1;
/* أندرويد: حزمة فُتحت من واتساب أو مدير الملفات («افتح بـ») */
window.__openPack = (name, b64) => {
  if (!b64) { toast('تعذّر فتح الملف ' + name, 5000); return; }
  const bin = atob(b64), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  if (!ME.agreedAt || !ME.role) { toast('أكمل الاتفاق والدور أولاً، ثم افتح الحزمة مرة أخرى.', 5000); return; }
  importPack(new Blob([u8]));
};

/* ---------- 4) الرئيسية ---------- */
const today = () => new Date().toISOString().slice(0, 10);
function home() {
  show('sHome'); $('#hWho').textContent = (ME.name || '') + ' · ' + (ROLES.find(r => r[0] === ME.role) || ['', ''])[1] + (ME.char ? ' · ' + WHO[ME.char] : '');
  $('#hMore').onclick = openMore; $('#hImport').onclick = pickFile;
  $('#hNoPack').hidden = !!PACK; $('#hPack').hidden = !PACK; if (!PACK) return;
  const rows = PACK.rows, nf = rows.reduce((s, r) => s + filesOf(r).length, 0), done = rows.reduce((s, r) => s + filesOf(r).filter(f => fileState(r, f) === 'done').length, 0);
  $('#pLabel').textContent = PACK.scope && PACK.scope.label || 'حزمة العمل'; $('#pCount').textContent = done + ' من ' + nf + ' ملفاً'; $('#pBar').style.width = (nf ? done / nf * 100 : 0) + '%';
  const t = [...TAKES.values()].filter(x => x.day === today()).length;
  $('#pGoal').textContent = 'اليوم: ' + t + ' تسجيلاً، والهدف نحو ' + GOAL + ' (درس واحد تقريباً). ' + (t >= GOAL ? 'أحسنت، بلغت هدف اليوم.' : '');
  const un = unsent().length; $('#unsent').hidden = !un; $('#unsentT').textContent = 'لديك ' + un + ' تسجيلاً لم تُرسل.'; $('#sendBtn').onclick = () => sendBatch(false);
  for (const b of document.querySelectorAll('.tab')) { b.classList.toggle('on', b.dataset.t === TAB); b.onclick = () => { TAB = b.dataset.t; home(); }; }
  renderList();
}
function listRows() {
  const rs = PACK.rows;
  if (TAB === 'short') return rs.filter(r => r.short);
  if (TAB === 'redo') return rs.filter(r => rowState(r) === 'redo' || (r.redo && rowState(r) !== 'done'));
  return rs;
}
function renderList() {
  const box = $('#list'); box.textContent = ''; const rs = listRows(); let cur = null, head = null, cnt = [0, 0];
  if (!rs.length) { box.append(el('p', { class: 'muted', text: TAB === 'redo' ? 'لا شيء مطلوب إعادته الآن.' : 'لا جمل هنا.' })); return; }
  const flush = () => { if (head) head.lastChild.textContent = cnt[0] + '/' + cnt[1]; };
  rs.forEach((r, i) => {
    const ln = TAB === 'short' ? 'كلمات قصيرة' : lessonName(r);
    if (ln !== cur) { flush(); cur = ln; cnt = [0, 0]; head = el('div', { class: 'lesson' }, el('span', { text: ln }), el('span')); box.append(head); }
    const st = rowState(r); cnt[1]++; if (st === 'done') cnt[0]++;
    box.append(el('button', { class: 'item', type: 'button', onclick: () => openLine(rs, i) }, el('span', { class: 'dot ' + st }), el('span', { class: 't', text: r.m })));
  }); flush();
}

/* ---------- 5) الجملة ---------- */
function openLine(rows, i, form) {
  QUEUE = rows; QI = i; const r = rows[i];
  FORM = form != null ? form : (r.f != null && fileState(r, r.id + '_m') === 'done' && fileState(r, r.id + '_f') !== 'done' ? 1 : 0);
  show('sLine'); $('#review').hidden = true; $('#recBtn').disabled = false; $('#recBtn').textContent = 'سجّل'; $('#recBtn').classList.remove('on');
  $('#recTime').textContent = 'المس «سجّل»، وانتظر لحظة، ثم اقرأ. والمس مرة أخرى حين تنتهي.'; $('#recMeter').style.width = '0';
  $('#lPos').textContent = (i + 1) + ' / ' + rows.length; $('#lWhere').textContent = lessonName(r) + ' · ' + (r.scene || '');
  $('#lWho').textContent = WHO[r.who] || r.who; $('#lWho').className = 'who ' + (r.who === 'chaos' ? 'chaos' : '');
  $('#lForm').textContent = r.f != null ? (FORM ? 'صيغة البنت (2 من 2)' : 'صيغة الولد (1 من 2)') : '';
  const box = $('#lText'); box.textContent = '';
  if (r.f != null) { const d = diffWords(r.m, r.f)[FORM]; d.forEach(([w, ch], k) => { if (k) box.append(' '); box.append(ch ? el('span', { class: 'd', text: w }) : w); }); } else box.textContent = r.m;
  $('#lNote').textContent = 'الأداء: ' + (r.note || '—') + (r.max ? ' · الحد ' + r.max + ' ثوانٍ' : '');
  if (r.why) $('#lNote').textContent += ' · تُقال بعد خطأ: ' + r.why;
  $('#lRedo').hidden = !r.redo; $('#lRedo').textContent = r.redo ? 'مطلوب إعادتها: ' + r.redo : '';
  $('#lBack').onclick = () => home(); $('#lPrev').onclick = () => playPrev(r); $('#lCtx').onclick = () => openCtx(r);
  $('#recBtn').onclick = () => recToggle(r);
  const t = TAKES.get(filesOf(r)[FORM]); if (t && fileState(r, t.fileId) === 'done') showReview(r, { trim: toF32(new Int16Array(t.pcm)), sr: t.sr, checks: t.checks, dur: t.dur }, true);
}
let LAST = null;
async function recToggle(r) {
  if (!REC.on) {
    if (!await micOrSay()) return; stopAudio(); $('#review').hidden = true; REC.onLevel = meterTo('#recMeter');
    $('#recBtn').disabled = true; $('#recBtn').textContent = 'استعد'; await sleep(450); recStart(); $('#recBtn').disabled = false; $('#recBtn').textContent = 'إيقاف'; $('#recBtn').classList.add('on');
    const t0 = Date.now(), lim = (r.max || 8) * 2 + 4;
    const tick = () => { if (!REC.on) return; const s = (Date.now() - t0) / 1000; $('#recTime').textContent = s.toFixed(1) + ' ث' + (r.max && s > r.max ? ' (أطول من ' + r.max + ')' : ''); if (s > lim) recToggle(r); else setTimeout(tick, 100); }; tick();
    return;
  }
  const raw = recStop(); REC.onLevel = null; $('#recBtn').classList.remove('on'); $('#recBtn').textContent = 'سجّل';
  const a = analyze(raw.f32, raw.sr, r.max); LAST = { r, a, sr: raw.sr, form: FORM }; showReview(r, { trim: a.trim, sr: raw.sr, checks: a.checks, dur: a.dur }, false);
}
function showReview(r, a, saved) {
  $('#review').hidden = false; drawWave(a.trim); const ul = $('#checks'); ul.textContent = '';
  if (a.checks.length) for (const c of a.checks) ul.append(el('li', { text: CHECK_TXT[c] || c })); else ul.append(el('li', { class: 'ok', text: 'التسجيل سليم (' + a.dur + ' ث).' + (saved ? ' محفوظ.' : '') }));
  $('#playBtn').onclick = () => playF32(a.trim, a.sr);
  $('#againBtn').onclick = () => { $('#review').hidden = true; recToggle(r); };
  $('#okBtn').disabled = a.checks.includes('empty'); $('#okBtn').textContent = saved ? 'التالي' : 'اقبل وانتقل';
  $('#okBtn').onclick = async () => { if (!saved) await acceptTake(); next(); };
  if (!saved) playF32(a.trim, a.sr);
}
async function acceptTake() {
  const { r, a, sr, form } = LAST, fid = filesOf(r)[form], old = TAKES.get(fid);
  const t = { fileId: fid, rowId: r.id, form, hash: r.hash, sr, pcm: toI16(a.trim).buffer, dur: a.dur, checks: a.checks, level: a.level, noise: a.noise, t: Date.now(), day: today(), takes: (old ? old.takes : 0) + 1, sent: null, pack: PACK.id };
  await DB.put('takes', fid, t); TAKES.set(fid, t); LAST = null;
}
function next() { const r = QUEUE[QI]; if (r.f != null && FORM === 0) return openLine(QUEUE, QI, 1); if (QI + 1 < QUEUE.length) return openLine(QUEUE, QI + 1, 0); toast('انتهت القائمة. أحسنت!'); home(); }
function drawWave(f) { const c = $('#wave'), g = c.getContext('2d'), W = c.width, H = c.height; g.clearRect(0, 0, W, H); g.fillStyle = '#1f5f99'; const step = Math.max(1, Math.floor(f.length / W));
  for (let x = 0; x < W; x++) { let m = 0; for (let i = x * step; i < Math.min(f.length, (x + 1) * step); i++) m = Math.max(m, Math.abs(f[i])); const h = Math.max(1, m * H); g.fillRect(x, (H - h) / 2, 1, h); } }
let AUD = null;
function stopAudio() { if (AUD) { try { AUD.stop(); } catch (e) {} AUD = null; } if (window.speechSynthesis) speechSynthesis.cancel(); if (window.AndroidBridge && AndroidBridge.cancel) AndroidBridge.cancel(); }
async function playF32(f, sr) { stopAudio(); const ctx = REC.ctx || (REC.ctx2 = REC.ctx2 || new AudioContext()); if (ctx.state === 'suspended') await ctx.resume();
  const b = ctx.createBuffer(1, Math.max(1, f.length), sr); b.copyToChannel(f.length ? f : new Float32Array(1), 0); const s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(); AUD = s; }
function speak(text) { stopAudio();
  if (window.AndroidBridge && AndroidBridge.speak) { AndroidBridge.speak('st' + Date.now(), text, 0.9, 1); return; }
  if (window.speechSynthesis) { const u = new SpeechSynthesisUtterance(text); u.lang = 'ar'; u.rate = 0.9; speechSynthesis.speak(u); } else toast(text); }
function playPrev(r) {
  const p = r.prev && PACK.rows.find(x => x.id === r.prev); if (!p) { toast('هذه أول جملة في مشهدها.'); return; }
  const fid = filesOf(p)[p.f != null ? FORM : 0], t = TAKES.get(fid);
  if (t) playF32(toF32(new Int16Array(t.pcm)), t.sr); else speak(textOf(p, FORM));
  toast('قبلها: ' + textOf(p, FORM), 5000);
}

/* ---------- السياق الحي «شاهد المشهد» (القسم 5) ---------- */
let CTX_RUN = null;
function closeOv(sel) { $(sel).hidden = true; if (sel === '#ctx') { if (CTX_RUN) { CTX_RUN.remove(); CTX_RUN = null; } $('#ctxShow').srcdoc = ''; } }
async function openCtx(r) {
  const ov = $('#ctx'); ov.hidden = false; $('#ctxShow').hidden = true; $('#ctxSay').hidden = true; $('#ctxClose').onclick = () => closeOv('#ctx');
  const msg = $('#ctxMsg'), prev = r.prev && PACK.rows.find(x => x.id === r.prev), nxt = PACK.rows[PACK.rows.indexOf(r) + 1];
  const textCtx = () => { msg.textContent = ''; msg.append(el('p', { text: 'تُقال في: ' + lessonName(r) + ' · ' + (r.scene || '') + (r.why ? ' · بعد خطأ: ' + r.why : '') }));
    if (prev) msg.append(el('p', { class: 'muted', text: 'قبلها: ' + textOf(prev, FORM) })); msg.append(el('p', { text: 'الجملة: ' + textOf(r, FORM) }));
    if (nxt && nxt.lesson === r.lesson) msg.append(el('p', { class: 'muted', text: 'بعدها في الجدول: ' + textOf(nxt, FORM) })); };
  const engine = await DB.get('kv', 'engine');
  if (!r.at || !engine) { textCtx(); msg.prepend(el('p', { class: 'muted', text: !engine ? 'هذه الحزمة بلا نسخة من الدرس، فالسياق نصّي فقط.' : 'هذه الجملة تأتي في مسار لا يبلغه العرض الآلي (خطأ بعينه، أو مراجعة، أو ورشة)، فالسياق نصّي فقط.' })); return; }
  msg.textContent = 'يجري فتح الدرس والوصول إلى المشهد… قد يستغرق دقيقة.';
  const [lesson, policy, seed] = r.at, url = URL.createObjectURL(new Blob([engine], { type: 'text/html' })) + '#fast&seed=' + seed;
  const fr = el('iframe', { class: 'hidden-run', title: 'تشغيل' }); CTX_RUN = fr; document.body.append(fr);
  const loaded = () => new Promise(res => { fr.onload = () => res(); });
  const inject = () => { const d = fr.contentDocument, s = d.createElement('script'); s.textContent = DRIVER_SRC; d.body.append(s); };
  try {
    fr.src = url; await loaded(); if (CTX_RUN !== fr) return; inject(); fr.contentWindow.__studioDriver.prime(FORM ? 'f' : 'm');
    fr.contentWindow.location.reload(); await loaded(); if (CTX_RUN !== fr) return; await sleep(300); inject();
    let snap = null; const w = fr.contentWindow;
    const take = () => { const c = w.document.documentElement.cloneNode(true); c.querySelectorAll('script').forEach(s => s.remove()); snap = '<!DOCTYPE html>' + c.outerHTML; };
    const target = r.near || r.id, near = r.near && PACK.rows.find(x => x.id === r.near);
    const res = await w.__studioDriver.run(lesson, policy, target, { onTarget: take, maxMs: 120000 });
    if (CTX_RUN !== fr) return; fr.remove(); CTX_RUN = null;
    if (!res.found || !snap) { textCtx(); msg.prepend(el('p', { class: 'muted', text: 'لم يبلغ العرض الآلي الجملة هذه المرة، فالسياق نصّي.' })); return; }
    msg.textContent = ''; msg.append(el('span', { class: 'muted', text: lessonName(r) + ' · ' + (r.scene || '') + (r.near ? '. لا يبلغ العرض الآلي جملتك نفسها (تأتي في بند آخر أو بعد فعل بعينه)، فهذه لحظة جملة شقيقة لها من المشهد نفسه:' : '. هذه لحظة قول الجملة:') }));
    const sh = $('#ctxShow'); sh.srcdoc = snap; sh.hidden = false;
    const say = $('#ctxSay'); say.textContent = '';
    if (near) say.append(el('div', { class: 'muted', text: 'الشقيقة على الشاشة: ' + textOf(near, FORM) })); else if (prev) say.append(el('div', { class: 'muted', text: 'قبلها: ' + textOf(prev, FORM) }));
    say.append(el('div', { text: 'جملتك: ' + textOf(r, FORM) })); say.hidden = false;
  } catch (e) { if (CTX_RUN === fr) { fr.remove(); CTX_RUN = null; } textCtx(); msg.prepend(el('p', { class: 'muted', text: 'تعذّر فتح الدرس (' + e.message + ')، فالسياق نصّي.' })); }
}

/* ---------- 6) التصدير: دفعة بعد كل جلسة، مرقّمة باسم المرسل ---------- */
const unsent = () => [...TAKES.values()].filter(t => t.sent == null && PACK && PACK.rows.some(r => r.id === t.rowId && r.hash === t.hash));
async function sendBatch(all) {
  const list = all ? [...TAKES.values()] : unsent(); if (!list.length) { toast('لا تسجيلات جديدة لإرسالها.'); return; }
  const btn = $('#sendBtn'); btn.disabled = true; toast('يجري تجهيز الدفعة…', 2000);
  try {
    const opus = await opusSupported(), ext = opus ? '.ogg' : '.wav', entries = [], items = [];
    for (const t of list) { const pcm = new Int16Array(t.pcm), data = opus ? await encodeOpus(pcm, t.sr, 64000) : wavBytes(pcm, t.sr);
      entries.push({ name: t.fileId + ext, data }); items.push({ file: t.fileId + ext, id: t.rowId, form: t.form, hash: t.hash, takes: t.takes, dur: t.dur, checks: t.checks, level: t.level, noise: t.noise, at: new Date(t.t).toISOString() }); }
    const seq = (ME.seq || 0) + 1, name = (ME.name || 'معلق').replace(/\s+/g, '_') + '-' + (WHO[ME.char] || 'صوت') + '-' + String(seq).padStart(4, '0') + '.wahareturn';
    const ret = { v: 1, kind: 'wahareturn', studio: STUDIO_VERSION, made: new Date().toISOString(), seq, all: !!all,
      sender: { name: ME.name, role: ME.role, char: ME.char || null, credit: !!ME.credit, guardian: ME.guardian || null, agreedAt: ME.agreedAt, agreeVersion: ME.agreeVersion }, room: ME.room || null,
      pack: PACK ? { id: PACK.id, commit: PACK.commit, label: PACK.scope && PACK.scope.label } : null, items };
    const zip = makeZip([{ name: 'returns.json', data: JSON.stringify(ret, null, 1) }, ...entries]);
    await DB.put('batches', seq, { seq, name, n: items.length, at: ret.made, bytes: zip });
    for (const k of await DB.keys('batches')) if (k <= seq - 5) await DB.del('batches', k);   /* آخر خمس دفعات للإعادة */
    for (const t of list) { if (t.sent == null) t.sent = seq; await DB.put('takes', t.fileId, t); }
    ME.seq = seq; saveMe(); await share(name, zip); home();
  } catch (e) { toast('تعذّر تجهيز الدفعة: ' + e.message, 6000); } finally { btn.disabled = false; }
}
function b64(u8) { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); }
async function share(name, u8) {
  if (window.AndroidBridge && AndroidBridge.shareFile) { AndroidBridge.shareFile(name, 'application/zip', b64(u8)); return; }
  const a = el('a', { href: URL.createObjectURL(new Blob([u8], { type: 'application/zip' })), download: name }); document.body.append(a); a.click(); a.remove();
  window.__lastShare = { name, size: u8.length };
}
async function saveFile(name, u8) { if (window.AndroidBridge && AndroidBridge.saveFile) { AndroidBridge.saveFile(name, 'application/zip', b64(u8)); return; } return share(name, u8); }

/* ---------- الإعدادات ---------- */
async function openMore() {
  const ov = $('#more'); ov.hidden = false; $('#moreClose').onclick = () => closeOv('#more');
  $('#mImport').onclick = pickFile; $('#mMic').onclick = () => { closeOv('#more'); micScreen(true); }; $('#mAll').onclick = () => { closeOv('#more'); sendBatch(true); };
  const bb = $('#mBatches'); bb.textContent = ''; const bs = (await DB.all('batches')).sort((a, b) => b.seq - a.seq);
  if (!bs.length) bb.textContent = 'لا دفعات بعد.';
  for (const b of bs) bb.append(el('button', { class: 'wide quiet', type: 'button', text: 'أعد إرسال الدفعة ' + b.seq + ' (' + b.n + ' تسجيلاً)', onclick: () => share(b.name, b.bytes) }));
  const wv = $('#mWav'); wv.textContent = ''; const by = new Map();
  for (const t of TAKES.values()) { const r = PACK && PACK.rows.find(x => x.id === t.rowId); const k = r ? lessonName(r) : 'أخرى'; if (!by.has(k)) by.set(k, []); by.get(k).push(t); }
  if (!by.size) wv.textContent = 'لا تسجيلات بعد.';
  for (const [k, ts] of by) wv.append(el('button', { class: 'wide quiet', type: 'button', text: k + ' (' + ts.length + ')', onclick: () => saveFile('أصل-' + k.replace(/[\s،]+/g, '_') + '.zip', makeZip(ts.map(t => ({ name: t.fileId + '.wav', data: wavBytes(new Int16Array(t.pcm), t.sr) })))) }));
  $('#mAbout').textContent = 'النسخة ' + STUDIO_VERSION + (PACK ? ' · الحزمة ' + PACK.id + ' من ' + (PACK.commit || '').slice(0, 7) : '') + ' · ' + (ME.name || '') + ' وافق على الاتفاق ' + (ME.agreedAt || '').slice(0, 10);
}

/* زر الرجوع في أندرويد */
window.__androidBack = () => {
  if (!$('#ctx').hidden) { closeOv('#ctx'); return 1; } if (!$('#more').hidden) { closeOv('#more'); return 1; }
  if (!$('#sLine').hidden) { home(); return 1; } if (!$('#sHome').hidden && unsent().length) { toast('لديك ' + unsent().length + ' تسجيلاً لم تُرسل. المس «أرسل» قبل أن تغلق.', 4000); }
  return 0;
};
document.addEventListener('visibilitychange', () => { if (document.hidden && REC.on) { REC.on = false; REC.chunks = []; $('#recBtn').classList.remove('on'); $('#recBtn').textContent = 'سجّل'; } });
boot();
