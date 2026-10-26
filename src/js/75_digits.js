/* =====================================================================
   «أرقامي» (D229): بعد S1-U1 د5 يختار الطفل ١٢٣ أو 123 في كل ما يراه، والافتراضي المشرقي، والصوت واحد.
   أول تبديل إلى 123: بطاقة تعارف مسموعة (١ ← 1 … ٩ ← 9) ثم لعبة مطابقة قصيرة. أداة تبديل لا مفهوم في المسار
   ===================================================================== */
const EAST = d => '٠١٢٣٤٥٦٧٨٩'[d];
function renderDigits() { const b = $('#digBtn'); if (!b) return; b.hidden = !digitsKnown(); b.textContent = SET.digits === 'east' ? '١٢٣' : '123'; b.setAttribute('aria-label', labelText('myDigits')); }
$('#digBtn').onclick = async () => { if (!digitsKnown()) return; SFX.tick();
  if (SET.digits === 'east' && !SET.seen.westIntro) { await westIntro(); return; }
  SET.digits = SET.digits === 'east' ? 'west' : 'east'; saveSet(); renderDigits(); showHome(); };
async function westIntro() {
  const c = cover('digitsCover', `<div class="breakbox digits">${coverHead()}<div class="pairs" id="dPairs" dir="ltr"></div><div class="dmatch" id="dMatch"></div><button class="go big" id="dDone" hidden aria-label="${esc(labelText('done'))}">${ICON.check}</button></div>`);
  /*T*/window.__scene = 'digits';/*/T*/ const box = $('#dPairs');
  for (let d = 1; d <= 9; d++) { const p = document.createElement('div'); p.className = 'pair'; p.innerHTML = `<b class="e">${EAST(d)}</b><span aria-hidden="true">←</span><b class="w">${d}</b>`; box.appendChild(p); }
  await coverSay(c, 'gen.digits.intro');
  for (const [i, p] of [...box.children].entries()) { p.classList.add('on'); await say(...lineOf(numw(i + 1)), { cover: c, noGap: true }); p.classList.remove('on'); }
  await coverSay(c, 'gen.digits.match');
  /* لعبة مطابقة قصيرة: يظهر رقم مشرقي، ويلمس الطفل نظيره الغربي من ثلاثة */
  const m = $('#dMatch'); box.hidden = true;
  for (const d of shuffle([2, 5, 7, 8, 6]).slice(0, 4)) {
    m.innerHTML = `<b class="ask">${EAST(d)}</b><div class="opts"></div>`; const opts = shuffle([d, ...shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9].filter(x => x !== d && !(d === 6 && x === 9))).slice(0, 2)]);
    let res; const p = new Promise(r => res = r);
    opts.forEach(o => { const b = document.createElement('button'); b.className = 'pick num'; b.innerHTML = `<b>${o}</b>`; b.setAttribute('aria-label', plain(T(numw(o)))); /*T*/if (TESTHOOK) b.dataset.ok = o === d;/*/T*/
      b.onclick = async () => { if (o === d) { b.classList.add('ok'); SFX.good(); logAttempt({ scene: 'digits', tag: 'match' + d, ok: true }); await sleep(400); res(); } else { b.classList.add('no'); SFX.soft(); logAttempt({ scene: 'digits', tag: 'match' + d, ok: false, err: 'digitOther' }); say(...lineOf(numw(d)), { cover: c }); } };
      m.querySelector('.opts').appendChild(b); });
    c.dataset.ask = numw(d); say(...lineOf(numw(d)), { cover: c }); await p; }   /* وبعد إطفاء الشاشة يُعاد الرقم المطلوب لا تمهيد اللعبة (الفحص المستقل J2 (7)) */
  m.innerHTML = ''; SET.seen.westIntro = 1; SET.digits = 'west'; saveSet(); renderDigits();
  await coverSay(c, 'gen.digits.done'); $('#dDone').hidden = false; $('#dDone').onclick = () => { hush(); c.hidden = true; showHome(); };
}
