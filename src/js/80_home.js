/* =====================================================================
   الخريطة: الواحة ونبعها (D230)، ومسار الدروس بالأحياء، ومحطة الورشة الإلزامية قبل التحدّي (D245)،
   و«مراجعة اليوم»، والاستئناف بعد الخروج الآمن (D246)، وحال الراحة بعد حدّ الجلسة
   ===================================================================== */
const ST_ICON = {
  lock: c => `<svg class="st" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2" fill="${c}"/><path d="M8 10V7a4 4 0 018 0v3" stroke="${c}" stroke-width="2" fill="none"/></svg>`,
  star: () => `<svg class="st" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3 7 7 .6-5.3 4.6L18.4 22 12 18l-6.4 4 1.7-7.8L2 9.6 9 9z" fill="#f2b33d" stroke="#c98f55"/></svg>`,
  done: c => `<svg class="st" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="${c}"/><path d="M7 12l3.5 3.5L17 9" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>`,
  moon: c => `<svg class="st" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3a8 8 0 1 0 6 13A9 9 0 0 1 15 3z" fill="${c}"/></svg>`,
};
/* أيقونة المحطة (72×56): أشكال الدرس أو مجسّماته، أو رمزه الخاص */
function stopIconInner(L) { const s = el('svg', { viewBox: '0 0 72 56' }); const ic = L.icon || [];
  const special = { stone: () => { const g = el('g', { transform: 'translate(36 30) scale(.32)' }, s); stoneArt(g, L.unit, 0, 0); },
    mail: () => { mailboxAt(s, 36, 34, 3).g.setAttribute('transform', 'translate(36 34) scale(.42)'); digitCard(s, 58, 16, 3, { size: .36 }); },
    towers: () => { towerAt(s, 26, 52, 4, { size: 10, color: CUBE.lemon }); towerAt(s, 48, 52, 6, { size: 10, color: CUBE.white }); },
    plus: () => { towerAt(s, 22, 52, 3, { size: 10, color: CUBE.lemon }); towerAt(s, 50, 52, 2, { size: 10, color: CUBE.white }); el('path', { d: 'M30 30h12M36 24v12', stroke: css('--compass'), 'stroke-width': 4, 'stroke-linecap': 'round' }, s); },
    hunt: () => { [['circle', 18], ['triangle', 36], ['rect', 54]].forEach(([k, x]) => shapeAt(s, { type: k, size: 20, w: k === 'rect' ? 24 : k === 'triangle' ? 22 : undefined, h: k === 'rect' ? 14 : k === 'triangle' ? 20 : undefined, color: css(IDC[k]) }, x, 28)); },
    flat: () => { shapeAt(s, { type: 'square', size: 24, color: css('--square') }, 22, 28); thingAt(s, { solid: 'cube', size: 36 }, 50, 28); } };
  if (special[ic[0]]) special[ic[0]]();
  else ic.forEach((k, i) => { const x = 36 + (i - (ic.length - 1) / 2) * (SOLIDC[k] ? 28 : 24);
    if (SOLIDC[k]) thingAt(s, { solid: k, size: 44 }, x, 28); else shapeAt(s, { type: k, size: 28, w: k === 'rect' ? 36 : k === 'triangle' ? 32 : undefined, h: k === 'rect' ? 22 : k === 'triangle' ? 28 : undefined, color: css(IDC[k]) }, x, 28); });
  return s.innerHTML; }
const stopIcon = L => `<svg viewBox="0 0 72 56" aria-hidden="true">${stopIconInner(L)}</svg>`;
const unitOpen = ui => ui === 0 || !!PROG['badge:' + UNITS[ui - 1].id] || !!PROG.unlockAll;
const isTestLesson = id => !!LDATA[id].test;
function lessonOpen(U, i) { const ids = U.lessons; if (PROG.unlockAll) return true; if (i > 0 && !(PROG[ids[i - 1]] || {}).done) return false;
  if (isTestLesson(ids[i]) && WS[U.id] && wsSolved(U.id) < 1) return false; return true; }
const wsOpen = U => PROG.unlockAll || !!PROG['badge:' + U.id] || !!(PROG[U.lessons[U.lessons.length - 2]] || {}).done;

/* لافتة الواحة: النبع بحجارة الشارات، وجدول لكل حيّ أُتقن، ونخيل يخضرّ */
function oasisBanner() { const n = UNITS.filter(U => PROG['badge:' + U.id]).length;
  const b = el('svg', { viewBox: '0 0 360 150', 'aria-hidden': 'true' }); backdrop(b, 150, { oasis: false, ground: 30 }); dunes(b, 140, 1);
  [[40, 132, .8], [96, 140, .7], [262, 138, .75], [322, 132, .85]].forEach(([x, y, s], i) => palmAt(b, x, y, s, i < 2 + n * 2 || i === 0));
  UNITS.forEach((U, i) => { if (!PROG['badge:' + U.id]) return; const dir = i % 2 ? 1 : -1; const p = el('path', { d: `M180 132 Q${180 + dir * 50} 140 ${180 + dir * (90 + i * 20)} 146`, stroke: 'url(#waterG)', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, b);
    anim(p, [{ strokeDasharray: '4 200' }, { strokeDasharray: '200 0' }], { duration: 1600, fill: 'forwards' }); });
  springAt(b, 180, 128, 1, { stones: n, total: 6, level: n / 6 }); return b.outerHTML; }

function showHome() {
  show('home'); CUR = null; FLOW++; disarmIdle(); SCENE_NOW = 'home'; /*T*/window.__scene = 'home';/*/T*/
  $('#helloName').textContent = PROFILE && PROFILE.name ? G(labelText('hello')).replace('{name}', PROFILE.name) : '';
  const me = $('#meBtn'); me.innerHTML = ''; me.appendChild(avatarNode(PROFILE)); $('#galBtn').innerHTML = ICON.gallery; renderDigits(); renderMute();
  $('#oasisBanner').innerHTML = oasisBanner();
  const path = $('#path'); path.innerHTML = ''; let nowSet = false; const resting = needBreak();
  if (reviewWaiting()) { const rb = document.createElement('button'); rb.className = 'stop review now'; nowSet = true; rb.dataset.review = '1';
    rb.innerHTML = `<svg viewBox="0 0 72 56" aria-hidden="true"><circle cx="36" cy="28" r="22" fill="${css('--paper')}" stroke="${css('--compass')}" stroke-width="4"/><path d="M36 14v14l10 6" stroke="${css('--compass')}" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`
      + `<span>${esc(G(labelText('reviewToday')))}<small>${esc(G(labelText('reviewSub')))}</small></span>${ST_ICON.star()}`;
    rb.onclick = () => { SFX.tick(); runReview(); }; path.appendChild(rb); }
  UNITS.forEach((U, ui) => { const uOpen = unitOpen(ui);
    const head = document.createElement('div'); head.className = 'unithead' + (uOpen ? '' : ' locked');
    head.innerHTML = `<span class="hosts">${hostsSVG(U.id)}</span><span class="ut">${esc(U.title)}<small>${esc(U.district || U.sub)}${uOpen ? '' : ' · ' + esc(labelText('unitLocked'))}</small></span>${PROG['badge:' + U.id] ? `<svg class="ub" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 14 q9 -8 18 0 q-9 8 -18 0z" fill="url(#waterG)"/></svg>` : uOpen ? '' : ST_ICON.lock(css('--muted'))}`;
    path.appendChild(head);
    U.lessons.forEach((id, i) => { const L = LDATA[id], p = PROG[id] || {}; const open = uOpen && lessonOpen(U, i);
      if (WS[U.id] && isTestLesson(id)) path.appendChild(wsStop(U, uOpen));
      const btn = document.createElement('button'); btn.className = 'stop'; btn.setAttribute('aria-disabled', !open); btn.dataset.lesson = id;
      const want = PROG.review ? PROG.review === id : (!p.done || (L.test && !p.mastered));
      if (open && want && !nowSet) { btn.classList.add('now'); nowSet = true; }
      const st = !open ? ST_ICON.lock(css('--muted')) : resting && !p.done ? ST_ICON.moon(css('--muted')) : p.mastered ? ST_ICON.star() : p.done ? ST_ICON.done(css('--good')) : '';
      const sub = p.resume ? labelText('resumeHere') : PROG.review === id ? labelText('reviewThis') : L.test && p.done && !p.mastered ? labelText('tryAgain') : labelText('lessonN').replace('{n}', DG(i + 1));
      const tag = p.entry ? `<em class="tag">${esc(labelText('entry'))}</em>` : '';
      btn.innerHTML = stopIcon(L) + `<span>${esc(L.title)}${tag}<small>${esc(G(sub))}</small></span>` + st; btn.setAttribute('aria-label', plain(L.title));
      btn.onclick = () => { if (!open) { SFX.soft(); return; } SFX.tick(); startLesson(id); };
      path.appendChild(btn); }); });
  const nowBtn = path.querySelector('.stop.now'); if (nowBtn && !FAST) setTimeout(() => { try { nowBtn.scrollIntoView({ block: 'nearest', behavior: RM ? 'auto' : 'smooth' }); } catch (e) {} }, 300);
}
function wsStop(U, uOpen) { const open = uOpen && wsOpen(U); const solved = wsSolved(U.id), total = WS[U.id].puzzles.length;
  const wb = document.createElement('button'); wb.className = 'stop ws' + (open && solved < 1 ? ' must' : ''); wb.dataset.workshop = U.id; wb.setAttribute('aria-disabled', !open);
  wb.innerHTML = `<svg viewBox="0 0 72 56" aria-hidden="true">${hostsSVG(U.id).replace(/^<svg[^>]*>/, '<g transform="translate(-14 -10) scale(.5)">').replace(/<\/svg>$/, '</g>')}<path d="M8 50 h56" stroke="${css('--basket-dk')}" stroke-width="4" stroke-linecap="round"/></svg>`
    + `<span>${esc(G(labelText('workshop')))}<small>${esc(G(labelText('wsShadows')))} ${DG(solved)} / ${DG(total)}</small></span>` + (open ? (solved ? ST_ICON.done(css('--good')) : '') : ST_ICON.lock(css('--muted')));
  wb.onclick = () => { if (!open) { SFX.soft(); return; } SFX.tick(); runWorkshop(U); }; return wb; }
/* بدء الدرس: الراحة أولاً إن بلغت الجلسة حدّها، ثم سؤال الاستئناف إن خرج الطفل في منتصفه */
function startLesson(id) {
  const go = () => { const p = PROG[id] || {}; if (p.resume) resumeAsk(id); else runLesson(id); };
  if (needBreak()) { breakScene(go); return; } go(); }
function resumeAsk(id) { const c = cover('exitCover', `<div class="breakbox">${coverHead()}<div class="choices icons big">
    <button class="pick" id="rsGo">${ICON.play.replace('<svg', '<svg width="40" height="40"')}<span>${esc(G(labelText('resumeGo')))}</span></button>
    <button class="pick" id="rsNew">${ICON.replay.replace('<svg', '<svg width="40" height="40"')}<span>${esc(G(labelText('fromStart')))}</span></button></div></div>`);
  coverSay(c, 'gen.resume.ask');
  $('#rsGo').onclick = () => { hush(); c.hidden = true; runLesson(id, { resume: true }); };
  $('#rsNew').onclick = () => { hush(); c.hidden = true; delete (PROG[id] || {}).resume; saveProg(); runLesson(id); }; }
/* الخروج الآمن من الدرس (D246): يُحفظ المكان، ويُسأل الطفل بالصوت */
$('#mapBtn').onclick = () => { if (!CUR) { FLOW++; hush(); showHome(); return; } SFX.tick(); hush();
  const c = cover('exitCover', `<div class="breakbox">${coverHead()}<div class="choices icons big">
    <button class="pick" id="exStay">${ICON.play.replace('<svg', '<svg width="40" height="40"')}<span>${esc(G(labelText('stay')))}</span></button>
    <button class="pick" id="exLeave">${ICON.map.replace('<svg', '<svg width="40" height="40"')}<span>${esc(G(labelText('toMap')))}</span></button></div></div>`);
  coverSay(c, 'gen.exit.ask');
  $('#exStay').onclick = () => { hush(); c.hidden = true; replayLine(); };
  $('#exLeave').onclick = () => { hush(); c.hidden = true; logAttempt({ scene: 'exit', tag: SCENE_NOW, ok: true }); showHome(); }; };
$('#meBtn').onclick = () => { stopVoice(); openKids(false); };
$('#galBtn').onclick = () => { SFX.tick(); openGallery(); };

/* تبويبان مفتوحان: لا يمحو أحدهما عمل الآخر */
function showTabLost() { FLOW++; hush(); const c = cover('tabCover', `<div class="breakbox"><p class="big">${esc(labelText('tabLost'))}</p><button class="go" id="tabHere">${esc(labelText('tabHere'))}</button></div>`);
  $('#tabHere').onclick = () => { tabClaim(); location.reload(); }; }
onTabLost = () => { if (CUR) showTabLost(); };
/* ماسك الأخطاء: لا شاشة بيضاء، ورسالة مسموعة وعودة إلى الخريطة */
let crashShown = false;
onCrash = err => { if (crashShown) return; crashShown = true; FLOW++; try { hush(); } catch (e) {}
  const c = cover('crashCover', `<div class="breakbox">${coverHead()}<button class="go big" id="crashOk" aria-label="${esc(labelText('toMap'))}">${ICON.map}</button></div>`);
  try { coverSay(c, 'gen.crash'); } catch (e) {}
  $('#crashOk').onclick = () => { crashShown = false; c.hidden = true; try { showHome(); } catch (e) { location.reload(); } }; };
onStoreIssue = () => { const b = $('#storeWarn'); if (b) b.hidden = false; };
