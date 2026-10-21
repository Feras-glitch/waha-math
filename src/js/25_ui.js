/* =====================================================================
   واجهة الدرس
   ===================================================================== */
const go = $('#go'), help = $('#helpBtn');
function setGo(label, onClick, enabled = true) { go.innerHTML = `<span>${G(label)}</span>${ICON.play}`; go.onclick = onClick; go.disabled = !enabled; }
function lockGo() { go.disabled = true; go.onclick = null; }
function nextBtn(label = 'التَّالِي') { return gate(new Promise(res => setGo(label, () => { lockGo(); hush(); res(); }))); }
function setStep(i) { [...$('#steps').children].forEach((d, k) => { d.className = k < i ? 'done' : (k === i ? 'now' : ''); }); }
function newStage(H = 300, bg = {}) { const st = $('#stage'); st.innerHTML = ''; const svg = el('svg', { viewBox: `0 0 360 ${H}`, preserveAspectRatio: 'xMidYMid meet', role: 'img' }); st.appendChild(svg); if (bg !== null) backdrop(svg, H, bg); return svg; }
function label(svg, x, y, text, size = 19, color) { const t = el('text', { x, y, 'text-anchor': 'middle', 'font-size': size, 'font-weight': 800, fill: color || css('--ink'), 'font-family': css('--f'), 'paint-order': 'stroke', stroke: css('--paper'), 'stroke-width': 5 }, svg); t.textContent = text; return t; }
function badge(parent, x, y, n, col) { const m = el('g', { transform: `translate(${x} ${y})` }, parent); el('circle', { r: 14, fill: col || css('--compass'), stroke: '#fff', 'stroke-width': 3 }, m);
  const t = el('text', { y: 6, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: '#fff', 'font-family': css('--f') }, m); t.textContent = DG(n);
  m.animate([{ transform: `translate(${x}px,${y}px) scale(.2)` }, { transform: `translate(${x}px,${y}px) scale(1)` }], { duration: 260, easing: 'cubic-bezier(.3,1.6,.6,1)' }); return m; }
function renderMute() { for (const id of ['#muteBtn', '#muteBtn2']) $(id).innerHTML = MUTED ? ICON.mute : ICON.sound; }
for (const id of ['#muteBtn', '#muteBtn2']) $(id).onclick = () => { MUTED = !MUTED; store.set('hp_muted', MUTED);
  if (MUTED) { try { speechSynthesis.cancel(); } catch (e) {} if (currentAudio) { currentAudio.pause(); currentAudio = null; } if (currentFinish) currentFinish(); }   // الكتم لا يُسقط الجمل التالية: تُعرض مكتوبةً بزمن القراءة
  renderMute(); };
$('#replay').innerHTML = ICON.sound; $('#replay').onclick = () => { if (lastLine) say(lastLine.who, lastLine.id, lastLine.text, { ifIdle: true, free: true }); };
$('#mapBtn').innerHTML = ICON.map; $('#mapBtn').onclick = () => { FLOW++; stopVoice(); disarmIdle(); location.hash = FAST ? '#fast' : ''; showHome(); };
help.innerHTML = compassSVG();
/* مبادرة المرشد بعد 20 ثانية بلا تفاعل */
let idleTimer = null, idleHandler = null;
function armIdle(h) { idleHandler = h; resetIdle(); }
function resetIdle() { clearTimeout(idleTimer); help.hidden = true; if (!idleHandler) return;
  idleTimer = setTimeout(async () => { if (speechBusy()) { resetIdle(); return; } help.hidden = false; help.onclick = () => { help.hidden = true; clearTimeout(idleTimer); const h = idleHandler; if (h) Promise.resolve(h()).then(() => { if (idleHandler === h) resetIdle(); }); }; await say('compass', ...GEN.lines.hintOffer, { ifIdle: true, free: true }); }, FAST ? 1500 : 20000); }
function disarmIdle() { idleHandler = null; clearTimeout(idleTimer); help.hidden = true; }
document.addEventListener('pointerdown', e => { if (idleHandler && !help.contains(e.target)) resetIdle(); }, true);   // لمسة زر المساعدة نفسه لا تلغيه

