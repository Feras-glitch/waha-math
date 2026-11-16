/* =====================================================================
   الإصبع الموحّد (D273): طريقة واحدة لكل تمرين يمرّ فيه الإصبع أو يسحب، فلا يُعاد الخطأ نفسه في كل تمرين.
   ① fingerInput: إصبعٌ واحد يُتابَع (الثاني يُهمل)، والتقاطه، والنقاط المجمّعة (getCoalescedEvents)، وملء الفجوة بين نقطتين
      بنقاط متقاربة، فلا ينقطع الخط ولا يقفز التقدّم مهما أسرع الإصبع؛ والإلغاء (pointercancel) كالرفع.
   ② pathSamples / polySamples: المسار عيّناتٍ متساوية البعد على طوله، ومواضع الرؤوس فيها.
   ③ edgeFollower: تتبّع حافّة شكلٍ مغلق (المضلّع والدائرة): الإصبع يُسقَط على أقرب نقطة من الحافة قرب موضعه الحالي، فيتقدّم
      على المحيط متصلاً في أيّ اتجاه، ويُرسم الخطّ على الحافة نفسها لا تحت الإصبع؛ والرأس يُعدّ حين يتجاوزه المسار (ولو قطع
      الإصبع الزاوية)، فتتوالى الأرقام بترتيب الدوران؛ ولمسُ الرأس وحده لا يعدّه. ورفع الإصبع والاستئناف من أيّ نقطة على الحافة جائز.
   ④ dragInput: السحب بإصبعٍ واحد، بعتبة حركة تفرّقه عن اللمس، وإحداثيات المسرح.
   ===================================================================== */
const D2P = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

function fingerInput(target, opt) {   /* opt: map(ev)→[x,y]، down(q, ev)→false يرفض، move(q)→false يوقف حتى الرفع، up(cancelled)، step (3) */
  const step = opt.step || 3; let id = null, last = null, halt = false;
  const feed = q => { const from = last || q, L = D2P(from, q), m = Math.max(1, Math.ceil(L / step));
    for (let i = 1; i <= m; i++) { if (halt) return; const r = [from[0] + (q[0] - from[0]) * i / m, from[1] + (q[1] - from[1]) * i / m]; if (opt.move(r) === false) { halt = true; return; } }
    last = q; };
  const onDown = ev => { if (id !== null) return;   /* إصبعٌ ثانٍ أثناء الأول: يُهمل */
    const q = opt.map(ev); if (opt.down && opt.down(q, ev) === false) return;
    id = ev.pointerId; last = q; halt = false; try { target.setPointerCapture(ev.pointerId); } catch (e) {} };
  const onMove = ev => { if (ev.pointerId !== id || halt) return; const evs = ev.getCoalescedEvents ? ev.getCoalescedEvents() : [];
    for (const e of (evs.length ? evs : [ev])) { if (halt || id === null) break; feed(opt.map(e)); } };
  const onUp = ev => { if (ev.pointerId !== id) return; id = null; last = null; halt = false; try { target.releasePointerCapture(ev.pointerId); } catch (e) {} if (opt.up) opt.up(ev.type === 'pointercancel'); };
  const ac = new AbortController(), on = { signal: ac.signal };
  target.addEventListener('pointerdown', onDown, on); target.addEventListener('pointermove', onMove, on); target.addEventListener('pointerup', onUp, on); target.addEventListener('pointercancel', onUp, on);
  return { off: () => { ac.abort(); id = null; }, active: () => id !== null,
    /* للفحص والعرض: مسارٌ مصنوع يمرّ بالطريق نفسه الذي يمرّ به الإصبع (لا طريقاً جانبياً) */
    sim: (pts) => { if (!pts.length) return; const q0 = pts[0]; if (opt.down && opt.down(q0, null) === false) return; last = q0; halt = false; for (const q of pts.slice(1)) { if (halt) break; feed(q); } last = null; halt = false; if (opt.up) opt.up(false); } };
}

/* عيّنات كل every وحدة على مسار SVG */
function pathSamples(pathEl, every = 4) { const L = pathEl.getTotalLength(), smp = []; for (let s = 0; s <= L; s += every) { const q = pathEl.getPointAtLength(s); smp.push([q.x, q.y]); }
  if (L % every) { const q = pathEl.getPointAtLength(L); smp.push([q.x, q.y]); } return smp; }
/* عيّنات مضلّع (مغلق أو مفتوح) كل every وحدة، ورؤوسه عيّناتٌ بعينها */
function polySamples(P, closed = true, every = 4) { const smp = [], vtx = []; const n = closed ? P.length : P.length - 1;
  for (let k = 0; k < n; k++) { const a = P[k], b = P[(k + 1) % P.length]; vtx.push(smp.length); const L = D2P(a, b), m = Math.max(1, Math.round(L / every));
    for (let i = 0; i < m; i++) smp.push([a[0] + (b[0] - a[0]) * i / m, a[1] + (b[1] - a[1]) * i / m]); }
  if (!closed) { vtx.push(smp.length); smp.push(P[P.length - 1]); } return { smp, vtx }; }
function circleSamples(cx, cy, r, every = 4) { const n = Math.max(24, Math.round(2 * Math.PI * r / every)), smp = []; for (let i = 0; i < n; i++) { const a = i / n * 2 * Math.PI - Math.PI / 2; smp.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return { smp, vtx: [] }; }

/* تتبّع حافّة شكلٍ مغلق. smp عيّنات المحيط، vtx أرقام عيّنات الرؤوس.
   opt: R (التسامح حول الحافة)، W (نافذة البحث حول الموضع الحالي بالعيّنات)، inkParent وink (لون الخط وعرضه)، onVertex(k, n)، cover (نسبة الإكمال) */
function edgeFollower(smp, vtx, opt = {}) {
  const N = smp.length, R = opt.R || 28, W = opt.W || 9, covered = new Uint8Array(N), counted = new Set(); let cur = -1, nCov = 0, inkPath = null, inkD = '';
  const ring = i => ((i % N) + N) % N;
  const cover = i => { i = ring(i); if (!covered[i]) { covered[i] = 1; nCov++; } };
  const inkTo = (i, move) => { if (!opt.inkParent) return; const [x, y] = smp[ring(i)];
    if (move || !inkPath) { inkPath = el('path', { d: '', fill: 'none', stroke: opt.ink || css('--compass'), 'stroke-width': opt.inkW || 9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: .85, 'pointer-events': 'none' }, opt.inkParent); inkD = `M${x.toFixed(1)} ${y.toFixed(1)}`; }
    else inkD += ` L${x.toFixed(1)} ${y.toFixed(1)}`; inkPath.setAttribute('d', inkD + (move ? ' l0 0' : '')); };
  /* الرأس يُعدّ حين يُغطّى ما قبله وما بعده (مرّ المسار به)، لا حين يُلمس وحده */
  const checkVtx = () => { for (const v of vtx) { if (counted.has(v)) continue; let ok = true; for (const d of [-2, -1, 0, 1, 2]) if (!covered[ring(v + d)]) { ok = false; break; } if (ok) { counted.add(v); if (opt.onVertex) opt.onVertex(vtx.indexOf(v), counted.size); } } };
  const nearest = (q, from, to, lim) => { let best = lim, hit = null; for (let j = from; j <= to; j++) { const d = D2P(smp[ring(j)], q); if (d < best) { best = d; hit = j; } } return hit; };
  const api = {
    down(q) { const j = nearest(q, 0, N - 1, R); if (j === null) return false; cur = ring(j); cover(cur); inkTo(cur, true); return true; },
    move(q) { if (cur < 0) return true;
      let j = nearest(q, cur - W, cur + W, R);
      if (j === null) j = nearest(q, cur - 3 * W, cur + 3 * W, R * .8);   /* إصبعٌ سريعٌ قطع الزاوية: يُلحق به على الضلع الذي هو عليه */
      if (j === null) return true;   /* الإصبع بعيد عن الحافة: لا تقدّم ولا خط، ويُكمل حين يعود قربها */
      const s = j > cur ? 1 : -1; for (let i = cur; i !== j; i += s) { cover(i + s); inkTo(i + s); }
      cur = ring(j); checkVtx(); return !api.done(); },
    up() { cur = -1; inkPath = null; },
    done: () => counted.size >= vtx.length && nCov >= N * (opt.cover || .85),
    progress: () => nCov / N, counted: () => counted.size,
    clearInk() { inkPath = null; } };
  return api;
}

/* السحب بإصبعٍ واحد. opt: start(ev, p)→false يرفض، move(dx, dy, p, ev) بوحدات المسرح منذ البداية، end(moved, p, ev)، cancel(p)، threshold بالبكسل (6) */
function dragInput(svg, g, opt) {
  let d = null; const th = opt.threshold ?? 6;
  const ac = new AbortController(), on = { signal: ac.signal };
  const down = ev => { if (d) return; const p = svgPoint(svg, ev); if (opt.start && opt.start(ev, p) === false) return; d = { id: ev.pointerId, sx: ev.clientX, sy: ev.clientY, p0: p, moved: false };
    try { g.setPointerCapture(ev.pointerId); } catch (e) {} };
  const move = ev => { if (!d || ev.pointerId !== d.id) return; const m = svg.getScreenCTM(); const dx = (ev.clientX - d.sx) / m.a, dy = (ev.clientY - d.sy) / m.d;
    if (!d.moved && Math.hypot(ev.clientX - d.sx, ev.clientY - d.sy) < th) return; d.moved = true; if (opt.move) opt.move(dx, dy, svgPoint(svg, ev), ev); };
  const up = ev => { if (!d || ev.pointerId !== d.id) return; const r = d; d = null; try { g.releasePointerCapture(ev.pointerId); } catch (e) {}
    if (ev.type === 'pointercancel') { if (opt.cancel) opt.cancel(r.p0); else if (opt.end) opt.end(false, r.p0, ev); return; }
    if (opt.end) opt.end(r.moved, svgPoint(svg, ev), ev); };
  g.addEventListener('pointerdown', down, on); g.addEventListener('pointermove', move, on); g.addEventListener('pointerup', up, on); g.addEventListener('pointercancel', up, on);
  return { off: () => { ac.abort(); d = null; }, down, active: () => !!d };
}
