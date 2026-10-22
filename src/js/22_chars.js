/* =====================================================================
   الشخصيات: فرجار، وفوضى (بجسد على المسرح، M9)، والمضيفون، وصور الأطفال، والسلال، وحجر النبع
   ===================================================================== */
function compassSVG() {
  return `<svg viewBox="0 0 100 112" aria-hidden="true">
  <path d="M44 52 L26 104" stroke="url(#leg)" stroke-width="8" stroke-linecap="round"/><path d="M26 104 l-3 7" stroke="#6b7b83" stroke-width="3" stroke-linecap="round"/>
  <path d="M56 52 L74 102" stroke="url(#leg)" stroke-width="8" stroke-linecap="round"/><path d="M70 96 l10 -3 l2 8 l-8 4 z" fill="#f6cf7e" stroke="#c98f55" stroke-width="1.5"/><path d="M76 106 l6 -2 l-1 6z" fill="#1b3440"/>
  <circle cx="50" cy="52" r="6" fill="#9eabb2"/>
  <circle cx="50" cy="30" r="27" fill="url(#hd)"/>
  <g class="blink"><ellipse cx="40" cy="28" rx="5.2" ry="6.2" fill="#fff"/><ellipse cx="60" cy="28" rx="5.2" ry="6.2" fill="#fff"/><circle cx="41" cy="29" r="2.8" fill="#10283b"/><circle cx="61" cy="29" r="2.8" fill="#10283b"/><circle cx="42" cy="27.5" r="1" fill="#fff"/><circle cx="62" cy="27.5" r="1" fill="#fff"/></g>
  <circle cx="40" cy="28" r="9" fill="none" stroke="#f6cf7e" stroke-width="2"/><circle cx="60" cy="28" r="9" fill="none" stroke="#f6cf7e" stroke-width="2"/><path d="M49 27 h2" stroke="#f6cf7e" stroke-width="2"/>
  <path d="M33 17 q6 -4 12 -1 M55 16 q6 -3 12 1" stroke="#0f2d48" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <ellipse cx="33" cy="40" rx="5" ry="3" fill="#ff9d8a" opacity=".55"/><ellipse cx="67" cy="40" rx="5" ry="3" fill="#ff9d8a" opacity=".55"/>
  <path d="M41 42 q9 8 18 0" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/></svg>`;
}
const CHAOS_BODY = `<path d="M8 40 q-6 6 0 12 M92 36 q6 8 0 14" stroke="#d9483b" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>
  <path d="M50 6 L61 34 L92 33 L67 52 L77 84 L50 66 L22 86 L32 53 L7 35 L39 34 Z" fill="url(#st)" stroke="#9e2c22" stroke-width="2.5" stroke-linejoin="round"/>
  <g class="blink"><ellipse cx="40" cy="46" rx="5.5" ry="6.5" fill="#fff"/><ellipse cx="60" cy="45" rx="5.5" ry="5" fill="#fff"/><circle cx="41.5" cy="47" r="3" fill="#2a0e0a"/><circle cx="61.5" cy="46" r="3" fill="#2a0e0a"/><circle cx="42.5" cy="45.5" r="1" fill="#fff"/></g>
  <path d="M33 36 q7 -4 13 0" stroke="#5a1710" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M55 35 q7 -6 13 -1" stroke="#5a1710" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M38 57 q12 12 25 0 q-12 4 -25 0z" fill="#fff" stroke="#5a1710" stroke-width="2"/><path d="M47 62 q4 6 8 0" fill="#ff8fa0"/>
  <path d="M50 6 q-4 -6 2 -6" stroke="#9e2c22" stroke-width="2" fill="none"/>`;
function chaosSVG() { return `<svg viewBox="0 0 100 112" aria-hidden="true">${CHAOS_BODY}</svg>`; }
const CHAR = { compass: compassSVG, chaos: chaosSVG };
/* فوضى على المسرح: تظهر وهي تفعل (D236)، وتختبئ وتضحك حين يُكشف ما فعلت */
const CHAOS_SPOT = { x: 320, y: 40, r: 60 };   /* موضع فوضى فوق النقاط المبعثرة، ونصف قطر لا تقع فيه نقطة (layoutPts) */
function chaosAt(parent, x, y, s = .6) { const g = el('g', { transform: `translate(${x} ${y})`, class: 'chaosbody', 'aria-hidden': 'true' }, parent);
  const b = el('g', { transform: `scale(${s}) translate(-50 -56)` }, g); b.innerHTML = CHAOS_BODY; return g; }
function chaosGiggle(g) { if (!g) return; SFX.chaos(); const t = g.getAttribute('transform'); return anim(g, [{ transform: t + ' rotate(0)' }, { transform: t + ' rotate(-10)' }, { transform: t + ' rotate(8)' }, { transform: t + ' rotate(0)' }], { duration: 700 }).done; }
function compassAt(parent, x, y, s = .6) { const g = el('g', { transform: `translate(${x} ${y})`, 'aria-hidden': 'true' }, parent); const t = document.createElement('div'); t.innerHTML = compassSVG();
  const b = el('g', { transform: `scale(${s}) translate(-50 -56)` }, g); b.innerHTML = t.firstChild.innerHTML; return g; }

/* D194: شخصيات الأشكال مضيفات للوحدات */
function hostFace(g, y, k) { const f = el('g', { transform: `translate(0 ${y}) scale(${k})` }, g); const e = el('g', { class: 'blink' }, f);
  for (const x of [-8, 8]) { el('ellipse', { cx: x, cy: 0, rx: 4.6, ry: 5.4, fill: '#fff' }, e); el('circle', { cx: x + .8, cy: 1, r: 2.5, fill: '#1b3440' }, e); }
  el('path', { d: 'M-6 9 q6 6 12 0', fill: 'none', stroke: '#1b3440', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, f); return f; }
function hostAt(parent, k, x, y, size) { const g = el('g', { transform: `translate(${x} ${y})` }, parent);
  if (SOLIDC[k]) { solidAt(g, { solid: k, size }, 0, 0); hostFace(g, { cube: size * .1, sphere: -size * .02, cylinder: size * .08, cone: size * .14 }[k], size / 80); }
  else { shapeAt(g, { type: k, size, w: k === 'rect' ? size * 1.25 : undefined, h: k === 'rect' ? size * .78 : undefined, color: css(IDC[k]), plain: true }, 0, 0); hostFace(g, k === 'triangle' ? size * .14 : 0, size / 80); }
  return g; }
function hostsSVG(uid) { const s = el('svg', { viewBox: '0 0 200 92', 'aria-hidden': 'true' }); (HOSTS[uid] || []).forEach((k, i) => hostAt(s, k, 176 - i * 50, 50, 54)); return s.outerHTML; }

/* صور الأطفال (H7): يختار الطفل صورة بلا قراءة. لكل جنس أربع صور (لون البشرة والشعر، وغطاء رأس لإحدى البنات) */
const AVATARS = {
  m1: { g: 'm', skin: '#f1c9a5', hair: '#3d2a1e', bg: '#dcecf5' }, m2: { g: 'm', skin: '#c8956b', hair: '#1e1611', bg: '#e3f1dc' },
  m3: { g: 'm', skin: '#8d5a3b', hair: '#140f0c', bg: '#fbe9c8', cap: '#2a9d8f' }, m4: { g: 'm', skin: '#e9b98f', hair: '#7a4a2a', bg: '#efe3f7' },
  f1: { g: 'f', skin: '#f1c9a5', hair: '#5b3a29', bg: '#fde3d9', clip: '#ee7a5f' }, f2: { g: 'f', skin: '#c8956b', hair: '#1e1611', bg: '#e3f1dc', clip: '#8e6bbf' },
  f3: { g: 'f', skin: '#e9b98f', hair: '#2b1c14', bg: '#dcecf5', scarf: '#5c9bb0' }, f4: { g: 'f', skin: '#8d5a3b', hair: '#140f0c', bg: '#fbe9c8', clip: '#f2b33d' },
};
function kidSVG(g, v) {
  const A = AVATARS[v] || AVATARS[g === 'f' ? 'f1' : 'm1'];
  const hair = A.g === 'f' ? `<path d="M14 42 Q14 10 40 10 Q66 10 66 42 L66 64 Q60 50 58 38 Q40 30 22 38 Q20 50 14 64 Z" fill="${A.hair}"/>` : `<path d="M17 36 Q18 12 40 12 Q62 12 63 36 Q52 24 40 26 Q28 24 17 36 Z" fill="${A.hair}"/>`;
  const scarf = A.scarf ? `<path d="M12 50 Q10 10 40 9 Q70 10 68 50 Q68 70 40 74 Q12 70 12 50 Z" fill="${A.scarf}"/><path d="M22 46 Q22 24 40 23 Q58 24 58 46" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>` : '';
  const cap = A.cap ? `<path d="M17 34 Q20 12 40 12 Q60 12 63 34 Z" fill="${A.cap}"/><rect x="38" y="31" width="34" height="6" rx="3" fill="${A.cap}"/>` : '';
  return `<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="38" fill="${A.bg}"/>${scarf || hair}<circle cx="40" cy="43" r="${A.scarf ? 19 : 22}" fill="${A.skin}"/>${cap}
    <circle cx="32" cy="42" r="2.6" fill="#2b2b2b"/><circle cx="48" cy="42" r="2.6" fill="#2b2b2b"/><path d="M33 51 q7 6 14 0" fill="none" stroke="#9b4b3a" stroke-width="2.5" stroke-linecap="round"/>
    ${A.clip ? `<circle cx="62" cy="26" r="6" fill="${A.clip}"/>` : ''}</svg>`;
}
function avatarNode(pr) { if (pr && pr.photo) { const img = new Image(); img.src = pr.photo; img.alt = ''; return img; } const d = document.createElement('span'); d.innerHTML = kidSVG(pr ? pr.gender : 'm', pr && pr.avatar); return d.firstChild; }

/* سلة خوص عليها رمز السلة؛ وسلّة «غير ذلك» بعلامة استفهام لا بعلامة خطأ (M8) */
function basketSVG(icon) {
  return `<svg viewBox="0 0 110 96" aria-hidden="true">
  <path d="M10 34 L100 34 L90 90 Q55 96 20 90 Z" fill="url(#weave)" stroke="${css('--basket-dk')}" stroke-width="2.5" stroke-linejoin="round"/>
  <rect x="6" y="28" width="98" height="12" rx="6" fill="${css('--basket-dk')}"/><path d="M22 30 Q55 -6 88 30" fill="none" stroke="${css('--basket-dk')}" stroke-width="5" stroke-linecap="round"/>
  <rect x="33" y="46" width="44" height="36" rx="8" fill="#fffdf8" stroke="${css('--basket-dk')}" stroke-width="1.5"/>${binIcon(icon)}
  <g class="lid"><rect x="4" y="22" width="102" height="14" rx="7" fill="${css('--basket-dk')}"/><rect x="46" y="14" width="18" height="10" rx="4" fill="${css('--basket-dk')}"/></g></svg>`;
}
function binIcon(k) {
  if (SOLIDC[k]) return thingMarkup({ solid: k, size: 42, pose: k === 'cylinder' ? 'up' : 'face' }, 55, 66, 1);
  if (k === 'solid') return thingMarkup({ solid: 'cube', size: 40, color: SOLIDC.cube }, 55, 66, 1);
  if (k === 'flat') return thingMarkup({ type: 'square', size: 22, color: css('--square') }, 55, 64, 1);
  if (k === 'other') return `<text x="55" y="75" text-anchor="middle" font-size="30" font-weight="800" fill="${css('--muted')}" font-family="${css('--f')}">؟</text>`;
  const c = css(IDC[k]);
  if (k === 'circle') return `<circle cx="55" cy="64" r="12" fill="${c}"/>`;
  if (k === 'square') return `<rect x="43" y="52" width="24" height="24" fill="${c}"/>`;
  if (k === 'triangle') return `<polygon points="55,51 68,76 42,76" fill="${c}"/>`;
  if (k === 'rect') return `<rect x="39" y="56" width="32" height="17" fill="${c}"/>`;
  return '';
}
/* حجر النبع (D230، D236): شارة الوحدة حجرٌ تضعه فوضى بيديها في النبع */
function stoneArt(svg, unit, x = 180, y = 150) {
  const b = el('g', { transform: `translate(${x} ${y})` }, svg);
  el('ellipse', { cx: 0, cy: 54, rx: 70, ry: 10, fill: '#1b3440', opacity: .15 }, b);
  el('path', { d: 'M-70 10 Q-74 -40 -30 -56 Q10 -70 46 -50 Q78 -28 70 14 Q62 52 0 54 Q-62 52 -70 10z', fill: css('--stone'), stroke: '#fff', 'stroke-width': 5, filter: 'url(#pp)' }, b);
  el('path', { d: 'M-46 -30 Q-20 -46 10 -44', stroke: '#fff', 'stroke-opacity': .5, 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, b);
  if (unit === 'm1.u3') {   /* حجر «أين أنا؟»: خريطة صغيرة بقطعها الثلاث، وسهم إلى الكنز */
    el('rect', { x: -40, y: -30, width: 80, height: 62, rx: 5, fill: '#fffdf6', stroke: '#1b3440', 'stroke-width': 3 }, b);
    shapeAt(b, { type: 'rect', w: 30, h: 18, color: css('--rect') }, 18, -14); shapeAt(b, { type: 'circle', size: 22, color: css('--circle') }, -18, 14); shapeAt(b, { type: 'square', size: 18, color: css('--square') }, 20, 16);
    el('path', { d: 'M-30 -18 Q-10 -6 4 8', fill: 'none', stroke: '#c94f3d', 'stroke-width': 3, 'stroke-dasharray': '5 4' }, b); }
  const ks = unit === 'm1.u2' ? ['cube', 'sphere', 'cylinder', 'cone'] : unit === 'm1.u3' ? [] : ['circle', 'square', 'triangle', 'rect'];
  ks.forEach((k, i) => { const px = (i % 2 ? 22 : -22), py = i < 2 ? -12 : 24;
    if (SOLIDC[k]) thingAt(b, { solid: k, size: 34 }, px, py);
    else shapeAt(b, { type: k, size: 28, w: k === 'rect' ? 34 : k === 'triangle' ? 32 : undefined, h: k === 'rect' ? 20 : k === 'triangle' ? 28 : undefined, color: css(IDC[k]) }, px, py); });
  const drop = el('path', { d: 'M0 -84 q-12 18 0 26 q12 -8 0 -26z', fill: css('--water') }, b);
  anim(drop, [{ opacity: .4 }, { opacity: 1 }], { duration: 800, iterations: Infinity, direction: 'alternate' });
  return b;
}
