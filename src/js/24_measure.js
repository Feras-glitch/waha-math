/* =====================================================================
   رسوم «قارِن وقِس» (S1-U4): ما يُقارَن طوله (شريط، وقلم، وشريطة تلتوي، ودودة، وعود)، وأشياء البيت التي تُقاس،
   والوحدات (مشبك، ومكعب، وشبر)، والميزان ذو الكفّتين وما يوضع فيه، ولوحة المقاول (D001)، وعمود العشرة والمنفردات (N010)، وإطار العشرة (N011، N012).
   قاعدة الاتجاه: خط البداية على اليمين والطول يمتدّ يساراً، كمقارنة «ضلع على ضلع» في S1-U1 د3، والعدّ يبدأ من اليمين (D232)؛
   والوحدات تُرصف من بداية الشيء متلاصقةً بلا فراغ ولا تداخل (التدقيق H11)، إلا ما يُسأل عن خطئه؛
   وعمود العشرة على اليسار والمنفردات على اليمين، كرقم العشرات ورقم الآحاد في العدد المكتوب (المواصفة د5).
   كل شيء يُرسم بإحداثياته المحلية من بدايته: الطرف الأيمن عند 0 والطرف الأيسر عند −الطول، فيُزاح بـ translate وحده
   ===================================================================== */
const MS_X = 318;                 /* خط البداية */
const MU = 28;                    /* طول المشبك: عشرة تملأ 280 */
/* طول كل وحدة: المكعب أطول من المشبك، فالشيء نفسه أقلّ مكعبات (العلاقة العكسية بين الوحدة وعددها، فابل B) */
const UNIT_U = { clip: 28, cube: 42 };
/* خط البداية: شريط لاصق ونقط، واسمه تحته */
/* واسمه داخل المسرح: إن لم يتّسع تحته قصُر الخط (الفحص المستقل B لبوابة S1-U4: قُصّ الاسم من الأسفل على الشاشات العريضة) */
function startLineAt(svg, y1, y2, opt = {}) { const x = opt.x ?? MS_X; const g = el('g', { 'pointer-events': 'none', 'data-start': x }, svg);
  const H = (svg.ownerSVGElement || svg).viewBox.baseVal.height || 300; if (opt.label !== false && y2 + 18 > H - 10) y2 = H - 28;   /* والكسرات تحت السطر تبقى داخل المسرح */
  el('rect', { x: x - 4, y: y1, width: 8, height: y2 - y1, rx: 3, fill: '#fff4cf', stroke: '#c9a072', 'stroke-width': 1.5 }, g);
  el('line', { x1: x, y1, x2: x, y2, stroke: '#1b3440', 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: .55 }, g);
  if (opt.label !== false) label(g, Math.min(x, 318), Math.min(y2 + 18, H - 10), labelText('startLine'), 14, css('--muted'));
  return g; }

/* ---------- ما يُقارَن طوله ---------- */
/* طول الخطّ المتموّج: سعته A ودوراته k وعرضه w (يُحسب بالتقسيم، ويُحلّ عكسياً بالتنصيف فيبقى طوله الحقيقي len مهما التوى) */
const waveLen = (A, k, w) => { let L = 0, py = 0; const N = 80; for (let i = 1; i <= N; i++) { const x = w * i / N, y = A * Math.sin(2 * Math.PI * k * i / N); L += Math.hypot(w / N, y - py); py = y; } return L; };
/* ويبدأ بمدخل أفقي (WAVE_IN) فلا يتجاوز حدُّه خطَّ البداية (الفحص المستقل G2 (8): ميل الموجة عند بدايتها نحو 2.3 فتجاوز الحدّ الملوّن الخطَّ بنحو 6 وحدات، فبدا الملتوي
   قد بدأ قبل الخط في درسٍ يعلّم محاذاة البدايات). العرض w يشمل المدخل، والطول الحقيقي len كما هو */
const WAVE_IN = 8;
const waveW = (len, A, k) => { if (!A) return len; const L = len - WAVE_IN; let lo = L * .15, hi = L; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (waveLen(A, k, m) > L) hi = m; else lo = m; } return (lo + hi) / 2 + WAVE_IN; };
const wavePath = (w, A, k) => { if (!A) return `M0 0 L${(-w).toFixed(1)} 0`; let d = `M0 0 L${-WAVE_IN} 0`; const N = 60, W = w - WAVE_IN;
  for (let i = 1; i <= N; i++) d += ` L${(-WAVE_IN - W * i / N).toFixed(1)} ${(A * Math.sin(2 * Math.PI * k * i / N)).toFixed(1)}`; return d; };
/* شيء طوله len يبدأ عند x0 (طرفه الأيمن) على الارتفاع y. kind: strip (شريط ورقي)، pencil (قلم)، ribbon (شريط قد يلتوي)، worm (دودة)، stick (عود)
   يعيد {g, len, kind, x0, y, end (الطرف الأيسر الآن), setX, straighten, wavy} */
function lenAt(parent, s, x0, y) { const len = s.len, col = s.color || NEUTRAL[0]; const g = el('g', { transform: `translate(${x0} ${y})`, 'data-len': len }, parent); const body = el('g', {}, g);
  const o = { g, len, kind: s.kind || 'strip', x0, y, A: s.wavy ? (s.amp || 16) : 0, k: s.cycles || Math.max(1.5, len / 80) };   /* دوراتٌ بالطول: بدوراتٍ ثابتة كان الملتوي القصير كتلةً تتراكب أمواجها ويتجاوز طرفها خط البداية (الفحص المستقل F2 (2ج)) */
  const draw = () => { body.innerHTML = ''; const k = o.kind;
    if (s.thing && HOUSE_DRAW[s.thing]) { o.w = len; HOUSE_DRAW[s.thing](body, len); return; }   /* شيء من البيت (مشروع المقاول: نرتّب ما قسناه) */
    if (k === 'ribbon' || (o.A && k !== 'worm')) { const w = waveW(len, o.A, o.k); o.w = w; const d = wavePath(w, o.A, o.k);
      el('path', { d, fill: 'none', stroke: '#ffffff', 'stroke-width': 19, 'stroke-linejoin': 'round' }, body); el('path', { d, fill: 'none', stroke: col, 'stroke-width': 14, 'stroke-linejoin': 'round' }, body);
      el('path', { d, fill: 'none', stroke: '#ffffff', 'stroke-opacity': .35, 'stroke-width': 3, 'stroke-dasharray': '2 9', 'stroke-linejoin': 'round' }, body); return; }
    o.w = len;
    if (k === 'pencil') { const L = len; el('polygon', { points: `${-L + 22},-10 ${-L + 22},10 ${-L},0`, fill: '#e8c69a', stroke: '#fff', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, body);
      el('polygon', { points: `${-L + 8},-3.6 ${-L + 8},3.6 ${-L},0`, fill: '#33454c' }, body);
      el('rect', { x: -L + 22, y: -10, width: L - 38, height: 20, fill: col, stroke: '#fff', 'stroke-width': 2.5 }, body); el('rect', { x: -L + 22, y: -10, width: L - 38, height: 6, fill: '#fff', 'fill-opacity': .22 }, body);
      el('rect', { x: -16, y: -10, width: 7, height: 20, fill: '#b8c2c8', stroke: '#fff', 'stroke-width': 2 }, body); el('rect', { x: -9, y: -10, width: 9, height: 20, rx: 3, fill: '#e3788a', stroke: '#fff', 'stroke-width': 2 }, body); return; }   /* الممحاة أعمق قليلاً: بداية القلم تُرى نهاراً كجسمه (الفحص المستقل C2) */
    if (k === 'worm') { const L = len, d = `M-11 0 C${-L * .3} ${-9} ${-L * .6} 9 ${-L + 11} 0`;
      el('path', { d, fill: 'none', stroke: '#ffffff', 'stroke-width': 25, 'stroke-linecap': 'round' }, body); el('path', { d, fill: 'none', stroke: col, 'stroke-width': 20, 'stroke-linecap': 'round' }, body);
      for (let i = 1; i < Math.floor(L / 16); i++) { const t = i * 16 / L, x = -11 - (L - 22) * t, yy = Math.sin(t * Math.PI * 2) * -4.5; el('path', { d: `M${x} ${yy - 8} q-3 8 0 16`, fill: 'none', stroke: mix(col, 'b', .25), 'stroke-width': 1.6, opacity: .7 }, body); }
      el('circle', { cx: -L + 8, cy: -3, r: 2.6, fill: '#1b3440' }, body); el('circle', { cx: -L + 7.4, cy: -3.8, r: .9, fill: '#fff' }, body); el('path', { d: `M${-L + 6} 4 q3 2 6 0`, fill: 'none', stroke: '#1b3440', 'stroke-width': 1.4, 'stroke-linecap': 'round' }, body); return; }
    if (k === 'stick') { el('rect', { x: -len, y: -8, width: len, height: 16, rx: 8, fill: col, stroke: '#fff', 'stroke-width': 2.5 }, body); el('path', { d: `M${-len + 12} -2 H-12`, stroke: '#fff', 'stroke-opacity': .3, 'stroke-width': 2 }, body); return; }
    el('rect', { x: -len, y: -12, width: len, height: 24, rx: 3, fill: col, stroke: '#fff', 'stroke-width': 3, filter: 'url(#pp)' }, body); el('rect', { x: -len + 4, y: -9, width: len - 8, height: 5, rx: 2, fill: '#fff', 'fill-opacity': .25 }, body); };
  draw();
  o.end = () => o.x0 - o.w;
  o.setX = x => { o.x0 = x; g.setAttribute('transform', `translate(${x} ${o.y})`); };
  /* الإفراد: الطول الحقيقي لا يتغيّر، والطرف الأيسر يبتعد حتى يبلغ len (حفظ الطول، فابل B) */
  o.straighten = async (ms = 900) => { const A0 = o.A; if (!A0) return; await tween(ms, t => { o.A = A0 * (1 - easeIO(t)); draw(); }); o.A = 0; o.kind = o.kind === 'ribbon' && !s.keepRibbon ? 'ribbon' : o.kind; draw(); };
  o.wavy = () => !!o.A;
  return o; }
/* يحرّك الشيء إلى خط البداية (حركة الأداة) */
async function alignTo(o, x = MS_X, ms = 700) { const x0 = o.x0; if (Math.abs(x0 - x) < .5) return; await tween(ms, t => o.setX(x0 + (x - x0) * easeIO(t))); o.setX(x); }

/* ---------- أشياء البيت التي تُقاس (أفقية، تبدأ عند 0 وتمتدّ إلى −L) ---------- */
const HOUSE_DRAW = {
  book(g, L) { el('rect', { x: -L, y: -16, width: L, height: 32, rx: 3, fill: '#4a6f94', stroke: '#fff', 'stroke-width': 2.5 }, g); el('rect', { x: -L + 4, y: -11, width: L - 8, height: 22, fill: '#f3eadb' }, g);
    for (let i = 0; i < 3; i++) el('line', { x1: -L + 6, y1: -6 + i * 6, x2: -6, y2: -6 + i * 6, stroke: '#d9cbb0', 'stroke-width': 1.2 }, g); el('rect', { x: -L, y: -16, width: L, height: 5, rx: 2, fill: '#3b5a7a' }, g); },
  crayon(g, L) { el('polygon', { points: `${-L + 14},-8 ${-L + 14},8 ${-L},0`, fill: '#c0564a', stroke: '#fff', 'stroke-width': 2 }, g); el('rect', { x: -L + 14, y: -8, width: L - 14, height: 16, rx: 3, fill: '#c0564a', stroke: '#fff', 'stroke-width': 2 }, g);
    el('rect', { x: -L + 26, y: -8, width: Math.max(10, L - 46), height: 16, fill: '#f3eadb', opacity: .8 }, g); },
  spoon(g, L) { el('ellipse', { cx: -L + 14, cy: 0, rx: 14, ry: 10, fill: '#b8c2c8', stroke: '#fff', 'stroke-width': 2 }, g); el('rect', { x: -L + 26, y: -3.5, width: L - 26, height: 7, rx: 3.5, fill: '#b8c2c8', stroke: '#fff', 'stroke-width': 2 }, g); },
  key(g, L) { el('circle', { cx: -10, cy: 0, r: 10, fill: 'none', stroke: '#c9a03a', 'stroke-width': 6 }, g); el('rect', { x: -L, y: -3.5, width: L - 18, height: 7, fill: '#c9a03a' }, g);
    el('rect', { x: -L, y: 3, width: 5, height: 7, fill: '#c9a03a' }, g); el('rect', { x: -L + 9, y: 3, width: 5, height: 6, fill: '#c9a03a' }, g); },
  shoe(g, L) { el('path', { d: `M0 10 H${-L + 10} Q${-L} 10 ${-L} 2 Q${-L} -6 ${-L + 16} -8 L${-L * .45} -12 L${-L * .3} -22 H-4 Q0 -22 0 -14 Z`, fill: '#7e9a4e', stroke: '#fff', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
    el('rect', { x: -L, y: 6, width: L, height: 6, rx: 3, fill: '#33454c' }, g); },
  comb(g, L) { el('rect', { x: -L, y: -12, width: L, height: 9, rx: 3, fill: '#b8607a', stroke: '#fff', 'stroke-width': 2 }, g); for (let x = -L + 4; x < -3; x += 6) el('rect', { x, y: -4, width: 3, height: 13, fill: '#b8607a' }, g); },
  carrot(g, L) { el('path', { d: `M0 -9 Q${-L * .2} -10 ${-L} 0 Q${-L * .2} 10 0 9 Z`, fill: '#e98a3a', stroke: '#fff', 'stroke-width': 2 }, g);
    for (const a of [-20, 0, 20]) el('path', { d: `M0 0 q10 ${a * .4} 16 ${a * .7}`, fill: 'none', stroke: '#7e9a4e', 'stroke-width': 3.5, 'stroke-linecap': 'round', transform: 'translate(-4 0)' }, g); },
  brush(g, L) { el('rect', { x: -L, y: -6, width: L * .62, height: 12, rx: 6, fill: '#a9774a', stroke: '#fff', 'stroke-width': 2 }, g); el('rect', { x: -L * .38 - 4, y: -7, width: 8, height: 14, fill: '#b8c2c8' }, g);
    el('path', { d: `M${-L * .38 + 4} -8 Q0 -4 0 0 Q0 4 ${-L * .38 + 4} 8 Z`, fill: '#33454c', stroke: '#fff', 'stroke-width': 2, 'stroke-linejoin': 'round' }, g); },   /* برأسها حدٌّ أبيض: بدايتها تُرى ليلاً (الفحص المستقل C2) */
  toyCar(g, L) { el('path', { d: `M0 4 V-6 Q0 -10 -6 -10 H${-L * .32} L${-L * .45} -22 H${-L * .78} L${-L * .9} -10 H${-L + 4} Q${-L} -10 ${-L} -5 V4 Z`, fill: '#c0564a', stroke: '#fff', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
    el('path', { d: `M${-L * .48} -19 H${-L * .76} L${-L * .85} -11 H${-L * .4} Z`, fill: '#d9f0f7' }, g); for (const x of [-L * .22, -L * .78]) { el('circle', { cx: x, cy: 6, r: 7, fill: '#33454c', stroke: '#fff', 'stroke-width': 2 }, g); el('circle', { cx: x, cy: 6, r: 2.5, fill: '#b8c2c8' }, g); } },
  /* أشياء أُضيفت لبوابة S1-U4 (الفحص المستقل A): لكل شيء طول واحد في الدرس، فاحتاجت لوحة المقاول وتقييم القياس أشياء أخرى لا تُقاس قبله */
  fork(g, L) { const h = L * .62; el('rect', { x: -h, y: -3.5, width: h, height: 7, rx: 3.5, fill: '#b8c2c8', stroke: '#fff', 'stroke-width': 2 }, g); el('rect', { x: -L * .78, y: -9, width: L * .78 - h + 4, height: 18, rx: 4, fill: '#b8c2c8', stroke: '#fff', 'stroke-width': 2 }, g);
    for (const y of [-7.5, -2.5, 2.5, 7.5]) el('rect', { x: -L, y: y - 1.6, width: L * .24, height: 3.2, rx: 1.6, fill: '#b8c2c8' }, g); },
  candle(g, L) { el('rect', { x: -L + 8, y: -9, width: L - 8, height: 18, rx: 3, fill: '#f3d9a4', stroke: '#fff', 'stroke-width': 2 }, g); el('rect', { x: -L + 8, y: -9, width: 7, height: 18, fill: '#e9c27c' }, g);
    el('line', { x1: -L + 9, y1: 0, x2: -L, y2: 0, stroke: '#fff', 'stroke-width': 6, 'stroke-linecap': 'butt' }, g); el('line', { x1: -L + 9, y1: 0, x2: -L, y2: 0, stroke: '#33454c', 'stroke-width': 3, 'stroke-linecap': 'butt' }, g); },   /* والفتيل بهالة بيضاء: نهايتها تُرى ليلاً */
  cucumber(g, L) { el('rect', { x: -L, y: -11, width: L, height: 22, rx: 11, fill: '#5f8f3e', stroke: '#fff', 'stroke-width': 2 }, g);
    for (let x = -L + 18; x < -12; x += 22) el('circle', { cx: x, cy: (x / 22) % 2 ? -4 : 4, r: 1.8, fill: '#a8c98a' }, g); el('rect', { x: -6, y: -3, width: 6, height: 6, rx: 2, fill: '#7e9a4e' }, g); },
  sock(g, L) { el('path', { d: `M0 -11 H${-L + 12} Q${-L} -11 ${-L} 1 Q${-L} 13 ${-L + 12} 13 H${-L * .42} Q${-L * .3} 13 ${-L * .3} 4 V-1 H0 Z`, fill: '#5c9bb0', stroke: '#fff', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
    el('path', { d: `M${-L + 16} -9.8 H${-L + 12} Q${-L + 1.2} -9.8 ${-L + 1.2} 1 Q${-L + 1.2} 11.8 ${-L + 12} 11.8 H${-L + 16} Z`, fill: '#f3eadb' }, g);   /* مقدّمة الجورب */
    for (const x of [-8, -15]) el('line', { x1: x, y1: -10, x2: x, y2: -2, stroke: '#f3eadb', 'stroke-width': 3 }, g); },
  /* أشياء جدول الوحدة الجديدة (الفحص المستقل C1 لبوابة S1-U4: لكل شيء طول واحد في الوحدة، فاحتاجت البنود أشياء أكثر): الطول من -L إلى 0 */
  /* والقلم في بنود القياس قلم مشاهد القياس نفسه (lenAt بنوعه ولونه) */
  pencil(g, L) { lenAt(g, { kind: 'pencil', len: L, color: NEUTRAL[3] }, 0, 0); },
  bottle(g, L) { const b = L * .66; el('rect', { x: -b, y: -15, width: b, height: 30, rx: 9, fill: '#8fc9cf', stroke: '#fff', 'stroke-width': 2.5 }, g);
    el('path', { d: `M${-b + 1} -11 L${-L + 20} -6 L${-L + 20} 6 L${-b + 1} 11 Z`, fill: '#8fc9cf', stroke: '#fff', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
    el('rect', { x: -L, y: -8, width: 20, height: 16, rx: 3, fill: '#2f6f8f', stroke: '#fff', 'stroke-width': 2 }, g); el('rect', { x: -b + 10, y: -8, width: b * .55, height: 16, rx: 4, fill: '#fff', opacity: .55 }, g); },
  ladle(g, L) { el('rect', { x: -L + 40, y: -5, width: L - 40, height: 10, rx: 5, fill: '#a3aeb6', stroke: '#fff', 'stroke-width': 2 }, g);
    el('path', { d: `M${-L} -5 A22 22 0 0 0 ${-L + 44} -5 Z`, fill: '#a3aeb6', stroke: '#fff', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g); el('circle', { cx: -9, cy: 0, r: 2.6, fill: '#fff' }, g); },
  /* مظلّة مطويّة بغلافها وشريطيها (الفحص المستقل D1 لبوابة S1-U4 (14): كانت مظلّةً مفتوحة الشكل طويلة بطول الكتاب، لا بنسب البيت) */
  umbrella(g, L) { const h = 46; el('rect', { x: -L, y: -13, width: L - h + 6, height: 26, rx: 12, fill: '#c8392d', stroke: '#fff', 'stroke-width': 2.5 }, g);
    for (const f of [.28, .6]) el('rect', { x: -L + (L - h) * f, y: -13, width: 10, height: 26, fill: '#8e241c' }, g);
    el('circle', { cx: -L + (L - h) * .6 + 5, cy: 0, r: 3, fill: '#f3d9a4' }, g);
    el('rect', { x: -h, y: -8, width: h, height: 16, rx: 7, fill: '#5b4636', stroke: '#fff', 'stroke-width': 2.5 }, g); },   /* والمقبض بهالة بيضاء: بدايتها تُرى ليلاً */
  banana(g, L) { el('path', { d: `M0 -3 Q${-L / 2} 28 ${-L} -8 Q${-L / 2} 4 0 -13 Z`, fill: '#f2cf4a', stroke: '#fff', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
    el('rect', { x: -6, y: -9, width: 6, height: 7, rx: 2, fill: '#6b5a2e' }, g); el('circle', { cx: -L + 2, cy: -6, r: 2.5, fill: '#6b5a2e' }, g); },
  ruler0(g, L) { el('rect', { x: -L, y: -9, width: L, height: 18, rx: 3, fill: '#f6cf7e', stroke: '#fff', 'stroke-width': 2 }, g); },
  table(g, L) { tableAt(g, -L / 2, 0, { w: L, h: 70 }); },
  rug(g, L) { el('rect', { x: -L, y: -10, width: L, height: 20, rx: 3, fill: '#b8607a', stroke: '#fff', 'stroke-width': 2.5 }, g); el('rect', { x: -L + 6, y: -6, width: L - 12, height: 12, fill: 'none', stroke: '#f6cf7e', 'stroke-width': 2, 'stroke-dasharray': '6 4' }, g);
    for (const x of [-L, 0]) for (let j = -8; j <= 8; j += 4) el('line', { x1: x, y1: j, x2: x + (x ? 6 : -6), y2: j, stroke: '#e9dcc0', 'stroke-width': 1.6 }, g); },
};
/* أشياء البيت المؤنثة، فتُقال جملها بضميرها («طولُها»، «نهايتِها») */
const HOUSE_F = new Set(['spoon', 'carrot', 'brush', 'toyCar', 'fork', 'candle', 'cucumber', 'bottle', 'ladle', 'umbrella', 'banana']), HOUSE_G = k => HOUSE_F.has(k) ? '.f' : '';
/* الشيء المرسوم من بدايته عند (x0، y)، ومعه بيانات بدايته ونهايته للقياس */
function houseAt(parent, k, L, x0, y) { const g = el('g', { transform: `translate(${x0} ${y})`, 'data-thing': k, 'data-len': L }, parent); (HOUSE_DRAW[k] || HOUSE_DRAW.ruler0)(g, L); return { g, k, len: L, x0, y, end: x0 - L }; }
/* علامة البداية على الشيء نفسه (الخطأ الشائع: «يبدأ من غير بداية الشيء») */
function startMark(svg, x, y, h = 30) { const g = el('g', { 'pointer-events': 'none' }, svg); el('line', { x1: x, y1: y - h / 2, x2: x, y2: y + h / 2, stroke: css('--good'), 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
  el('path', { d: `M${x} ${y - h / 2 - 2} l-8 -10 h16 z`, fill: css('--good') }, g); return g; }

/* ---------- الوحدات ---------- */
const CLIPC = ['#2a7fb8', '#d94f8a', '#2e9a6a', '#e2a12a', '#7d5bc0'];   /* مشابك بلاستيكية ملساء الأطراف (سلامة المواصفة)، بألوان مختلفة والحجم واحد */
/* مشبك طوله u، طرفه الأيمن عند x (فالمشابك المتلاصقة: x، x−u، x−2u…) */
function clipAt(parent, x, y, u = MU, color = CLIPC[0]) { const g = el('g', { transform: `translate(${x} ${y})`, 'data-unit': 'clip' }, parent);
  const r = 5.4, w = u - 2;
  el('path', { d: `M-1 -${r} H${-w + r} A${r} ${r} 0 0 0 ${-w + r} ${r} H-${r + 1} A${r - 1.6} ${r - 1.6} 0 0 0 -${r + 1} ${-r + 3.2} H${-w + r + 4.5} A${r - 3.6} ${r - 3.6} 0 0 0 ${-w + r + 4.5} ${r - 4}`, fill: 'none', stroke: '#fff', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
  el('path', { d: `M-1 -${r} H${-w + r} A${r} ${r} 0 0 0 ${-w + r} ${r} H-${r + 1} A${r - 1.6} ${r - 1.6} 0 0 0 -${r + 1} ${-r + 3.2} H${-w + r + 4.5} A${r - 3.6} ${r - 3.6} 0 0 0 ${-w + r + 4.5} ${r - 4}`, fill: 'none', stroke: color, 'stroke-width': 2.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
  return g; }
/* مكعب وحدة مسطّح الرسم (وجه أمامي وسطح علوي): المتلاصقة تتلامس وجوهها، فيُرى أن لا فراغ */
function unitCubeAt(parent, x, y, u = MU, color = CUBE.lemon) { const g = el('g', { transform: `translate(${x} ${y})`, 'data-unit': 'cube' }, parent); const d = u * .24;
  el('polygon', { points: `${-u},${-u / 2} 0,${-u / 2} ${-d},${-u / 2 - d} ${-u - d},${-u / 2 - d}`, fill: mix(color, 'w', .3), stroke: '#fff', 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, g);
  el('rect', { x: -u, y: -u / 2, width: u, height: u, fill: color, stroke: '#fff', 'stroke-width': 1.8 }, g); return g; }
/* صفّ وحدات متلاصقة من x0 يساراً: n وحدات (و gap فراغ بين كل وحدتين، و from بداية غير بداية الشيء، و sizes لوحدات مختلفة: مشاهد الخطأ وحدها) */
function unitRow(parent, unit, n, x0, y, opt = {}) { const out = []; let x = x0 - (opt.from || 0); const u = opt.u || UNIT_U[unit] || MU;
  for (let i = 0; i < n; i++) { const ui = opt.sizes ? opt.sizes[i] : u; const g = unit === 'cube' ? unitCubeAt(parent, x, y, ui, opt.color || (i % 2 ? CUBE.white : CUBE.lemon)) : clipAt(parent, x, y, ui, CLIPC[i % CLIPC.length]);
    out.push({ g, x: x - ui / 2, y, right: x, left: x - ui, u: ui }); x -= ui + (opt.gap || 0); }
  return out; }

/* ---------- الشبر (C017: أيدينا مختلفة) ---------- */
/* يد مفتوحة من الإبهام إلى الخنصر بعرض s، طرف الإبهام عند (x، y) وتمتدّ يساراً؛ sleeve لون الكمّ يميّز صاحبها */
function handSpanAt(parent, x, y, s, sleeve = '#3d7cc0') { const g = el('g', { transform: `translate(${x} ${y})`, 'data-span': s }, parent);
  const skin = '#f1c9a5', edge = '#c98f55', cx = -s / 2, py = -30, rx = Math.max(11, s * .2);
  /* اليد مفتوحة نازلة إلى السطح: طرف الإبهام عند البداية (0، 0) وطرف الخنصر عند (−s، 0)، والأصابع الوسطى منثنية فوق السطح */
  const F = [[cx + rx * .8, py + 6, -2, -3], [cx - rx * .8, py + 6, -s + 2, -3], [cx + rx * .35, py + 10, cx + rx * .45, py + 24], [cx, py + 11, cx, py + 26], [cx - rx * .35, py + 10, cx - rx * .45, py + 24]];
  for (const [x1, y1, x2, y2] of F) el('line', { x1, y1, x2, y2, stroke: edge, 'stroke-width': 11, 'stroke-linecap': 'round' }, g);
  el('rect', { x: cx - 10, y: py - 40, width: 20, height: 30, rx: 6, fill: sleeve, stroke: '#fff', 'stroke-width': 2 }, g);
  el('ellipse', { cx, cy: py, rx, ry: 14, fill: skin, stroke: edge, 'stroke-width': 2 }, g);
  for (const [x1, y1, x2, y2] of F) el('line', { x1, y1, x2, y2, stroke: skin, 'stroke-width': 7.5, 'stroke-linecap': 'round' }, g);
  return g; }
/* أشبار متتابعة فوق سطح من x0 يساراً: أقواس من الإبهام إلى الخنصر */
function spanArcs(parent, n, s, x0, y, col = '#3d7cc0') { const out = []; for (let i = 0; i < n; i++) { const a = x0 - i * s, b = a - s;
    const p = el('path', { d: `M${a} ${y} Q${(a + b) / 2} ${y - s * .55} ${b} ${y}`, fill: 'none', stroke: col, 'stroke-width': 3.5, 'stroke-dasharray': '6 4', 'stroke-linecap': 'round' }, parent);
    out.push({ g: p, x: (a + b) / 2, y: y - s * .3, a, b }); } return out; }

/* ---------- الميزان ذو الكفّتين (C025، H11) ---------- */
/* x، y: منتصف القاعدة على الأرض. tilt من −1 (اليسرى أنزل) إلى 1 (اليمنى أنزل)؛ والكفّتان أفقيتان دائماً، وما فيهما يتحرّك معهما */
const BAL = { arm: 100, post: 130, hang: 80, deg: 13 };   /* الخيوط أطول فلا يخترق الكبيرُ الذراعَ في الكفّة المرتفعة (الفحص المستقل B لبوابة S1-U4) */
function balanceAt(parent, x, y, opt = {}) { const a = opt.arm || BAL.arm, h = opt.post || BAL.post, hang = BAL.hang;
  const g = el('g', { 'data-balance': 1 }, parent); const px = x, py = y - h;
  el('ellipse', { cx: x, cy: y + 2, rx: 70, ry: 7, fill: '#000', 'fill-opacity': .08 }, g);
  el('path', { d: `M${x - 56} ${y} L${x - 30} ${y - 22} H${x + 30} L${x + 56} ${y} Z`, fill: MAT.wood, stroke: '#fff', 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
  el('rect', { x: x - 7, y: py, width: 14, height: h - 20, rx: 4, fill: MAT.woodDk, stroke: '#fff', 'stroke-width': 2.5 }, g);
  const beam = el('g', {}, g); el('rect', { x: px - a - 6, y: py - 6, width: 2 * a + 12, height: 12, rx: 6, fill: '#c9a03a', stroke: '#fff', 'stroke-width': 2.5 }, beam);
  const needle = el('path', { d: `M${px - 4} ${py} L${px} ${py - 34} L${px + 4} ${py} Z`, fill: '#c94f3d' }, beam);
  el('circle', { cx: px, cy: py, r: 8, fill: '#b8c2c8', stroke: '#fff', 'stroke-width': 2.5 }, g);
  const mkPan = side => { const p = el('g', {}, g); const str = el('path', { d: '', fill: 'none', stroke: '#8d7a62', 'stroke-width': 2.2 }, p);
    const bowl = el('g', {}, p); el('path', { d: 'M-48 0 Q0 26 48 0 Z', fill: '#d9b46a', stroke: '#fff', 'stroke-width': 3, 'stroke-linejoin': 'round' }, bowl); el('ellipse', { cx: 0, cy: 0, rx: 48, ry: 5, fill: '#e9c98a', stroke: '#fff', 'stroke-width': 2 }, bowl);
    const on = el('g', {}, bowl); return { side, g: p, str, bowl, on }; };
  const pans = { R: mkPan('R'), L: mkPan('L') }; let tilt = 0;
  const place = () => { const th = tilt * BAL.deg * Math.PI / 180; beam.setAttribute('transform', `rotate(${tilt * BAL.deg} ${px} ${py})`);
    for (const [side, sg] of [['R', 1], ['L', -1]]) { const P = pans[side], ex = px + sg * a * Math.cos(th), ey = py + sg * a * Math.sin(th), cy = ey + hang;
      P.str.setAttribute('d', `M${ex} ${ey} L${ex - 40} ${cy} M${ex} ${ey} L${ex + 40} ${cy}`); P.bowl.setAttribute('transform', `translate(${ex} ${cy})`); P.x = ex; P.y = cy; } };
  place();
  const B = { g, pans, px, py, get tilt() { return tilt; },
    set(t) { tilt = Math.max(-1, Math.min(1, t)); place(); },
    async to(t, ms = 900) { const t0 = tilt; await tween(ms, q => { tilt = t0 + (t - t0) * easeIO(q); place(); }); tilt = t; place(); },
    /* الشيء k في الكفّة side (يرسمه weighAt على سطحها) */
    put(side, k, opt2 = {}) { const P = pans[side]; P.on.innerHTML = ''; P.k = k; if (k) weighAt(P.on, k, 0, 0, opt2.s || .82); return P; },
    clear(side) { pans[side].on.innerHTML = ''; pans[side].k = null; } };
  return B; }
/* ميل الميزان من ثقلَي الشيئين: الأثقل ينزل (لا مقدار، بل جهة: الصورة تخبر أيّهما أثقل لا بكم) */
const tiltOf = (kR, kL) => { const a = WEIGH[kR] ? WEIGH[kR].w : 0, b = WEIGH[kL] ? WEIGH[kL].w : 0; return a === b ? 0 : a > b ? 1 : -1; };
/* ما يوزن: w الثقل (نسبي)، big هل هو كبير الحجم في الصورة؛ والرسم مرساه منتصف قاعدته */
/* w ترتيب الثقل، وg الثقل الحقيقي التقريبي بالغرام: w بترتيب g (يفحصه build/lint.mjs 4ب4؛ D253 (6)، الفحص المستقل A لبوابة S1-U4: كانت الوسادة أخفّ
   من التفاحة والمكعب الخشبي لتخدم المثال، والطفل يزن أشياء حقيقية في «معي»). والكبير الخفيف حقاً: البالون وكرة الشاطئ المنفوخة */
const WEIGH = {
  feather: { w: 1, big: false, g: .5 }, leaf: { w: 1, big: false, g: 1 }, flower: { w: 1, big: false, g: 2 }, balloon: { w: 2, big: true, g: 3 }, sponge: { w: 2, big: true, g: 20 }, cube: { w: 3, big: false, g: 30 }, toyCar: { w: 4, big: false, g: 100 },
  beachBall: { w: 5, big: true, g: 150 }, apple: { w: 6, big: false, g: 180 }, stone: { w: 7, big: false, g: 250 }, book: { w: 8, big: false, g: 500 }, pillow: { w: 9, big: true, g: 700 }, pumpkin: { w: 12, big: true, g: 3000 }, watermelon: { w: 14, big: true, g: 5000 },
};
/* وما اسمه مؤنث مما يوزن (الفحص المستقل D1 لبوابة S1-U4: «أيّهما أخفّ؟ المسيهِ» لليقطينة والريشة، و«هذا هو الأخفّ: كفّته» للتفاحة): جمل الميزان العامة
   بلاحقة .f، بضمير الشيئين إن كانا مؤنثين، وبضمير الجواب في الكشف؛ ويفحصه 4ب15 بتسميات w.* */
const WEIGH_F = new Set(['feather', 'leaf', 'flower', 'beachBall', 'pillow', 'sponge', 'apple', 'toyCar', 'pumpkin', 'watermelon']), WEIGH_G = (...ks) => ks.every(k => WEIGH_F.has(k)) ? '.f' : '';
const WEIGH_DRAW = {
  feather(g) { el('path', { d: 'M-34 -4 Q-6 -26 34 -18 Q6 -2 -34 -4 Z', fill: '#f4f1e8', stroke: '#b8c2c8', 'stroke-width': 2 }, g); el('path', { d: 'M-38 -2 Q0 -14 34 -18', fill: 'none', stroke: '#8d9aa3', 'stroke-width': 2 }, g); },
  leaf(g) { el('path', { d: 'M-26 -6 Q0 -30 26 -8 Q0 6 -26 -6 Z', fill: '#7e9a4e', stroke: '#fff', 'stroke-width': 2 }, g); el('path', { d: 'M-24 -6 Q0 -14 24 -8', fill: 'none', stroke: '#5d7a35', 'stroke-width': 1.6 }, g); },
  flower(g) { el('path', { d: 'M0 0 V-22', stroke: '#5d7a35', 'stroke-width': 3 }, g); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; el('circle', { cx: Math.cos(a) * 8, cy: -30 + Math.sin(a) * 8, r: 6, fill: '#f29ba8', stroke: '#fff', 'stroke-width': 1.5 }, g); } el('circle', { cx: 0, cy: -30, r: 5, fill: '#f2b33d' }, g); },
  balloon(g) { el('path', { d: 'M0 0 q-4 -8 0 -16', fill: 'none', stroke: '#8d9aa3', 'stroke-width': 1.6 }, g); el('ellipse', { cx: 0, cy: -50, rx: 30, ry: 36, fill: '#e9483f', stroke: '#fff', 'stroke-width': 3 }, g);
    el('path', { d: 'M-4 -14 l4 -2 l4 2 z', fill: '#c0392b' }, g); el('ellipse', { cx: -10, cy: -62, rx: 7, ry: 11, fill: '#fff', 'fill-opacity': .35 }, g); },
  beachBall(g) { const r = 34, cy = -r; ['#e9483f', '#fffdf6', '#2a9fd6', '#fffdf6', '#f2b33d', '#fffdf6'].forEach((c, i) => { const a0 = (i * 60 - 90) * Math.PI / 180, a1 = ((i + 1) * 60 - 90) * Math.PI / 180;
      el('path', { d: `M0 ${cy} L${(r * Math.cos(a0)).toFixed(1)} ${(cy + r * Math.sin(a0)).toFixed(1)} A${r} ${r} 0 0 1 ${(r * Math.cos(a1)).toFixed(1)} ${(cy + r * Math.sin(a1)).toFixed(1)} Z`, fill: c }, g); });
    el('circle', { cx: 0, cy, r, fill: 'none', stroke: '#fff', 'stroke-width': 3 }, g); el('circle', { cx: 0, cy, r: 6, fill: '#fff', stroke: '#ddd' }, g); el('ellipse', { cx: -12, cy: cy - 14, rx: 8, ry: 5, fill: '#fff', 'fill-opacity': .45 }, g); },
  /* إسفنجة مطبخ كبيرة: كبيرة خفيفة حقاً (نحو 20 غ) */
  sponge(g) { el('rect', { x: -38, y: -40, width: 76, height: 40, rx: 8, fill: '#f2d24a', stroke: '#fff', 'stroke-width': 3 }, g); el('rect', { x: -38, y: -40, width: 76, height: 11, rx: 6, fill: '#5d9a4e' }, g);
    for (const [x, y, r] of [[-24, -16, 3], [-8, -10, 2.5], [10, -18, 3.2], [24, -9, 2.4], [-2, -21, 2]]) el('circle', { cx: x, cy: y, r, fill: '#d9b52e' }, g); },
  pillow(g) { el('path', { d: 'M-40 0 Q-46 -18 -40 -36 Q0 -42 40 -36 Q46 -18 40 0 Q0 6 -40 0 Z', fill: '#5c9bb0', stroke: '#fff', 'stroke-width': 3 }, g); el('circle', { cx: 0, cy: -18, r: 3.5, fill: '#fff', 'fill-opacity': .7 }, g); },
  cube(g) { drawBox(el('g', { transform: 'translate(0 -16)' }, g), { w: 28, h: 28, d: 22, yaw: 20, pitch: 16, color: MAT.wood }); },
  apple(g) { el('path', { d: 'M0 -2 Q-20 0 -20 -18 Q-20 -36 -4 -32 Q0 -30 4 -32 Q20 -36 20 -18 Q20 0 0 -2 Z', fill: '#c0392b', stroke: '#fff', 'stroke-width': 2.5 }, g); el('path', { d: 'M0 -32 q1 -8 5 -10', fill: 'none', stroke: '#6b4a2b', 'stroke-width': 2.5 }, g); el('path', { d: 'M3 -38 q8 -6 12 0 q-6 4 -12 0z', fill: '#7e9a4e' }, g); },
  toyCar(g) { const c = el('g', { transform: 'translate(24 -8)' }, g); HOUSE_DRAW.toyCar(c, 48); },
  book(g) { el('rect', { x: -32, y: -22, width: 64, height: 22, rx: 3, fill: '#4a6f94', stroke: '#fff', 'stroke-width': 2.5 }, g); el('rect', { x: -28, y: -16, width: 56, height: 10, fill: '#f3eadb' }, g); },
  stone(g) { el('path', { d: 'M-17 0 Q-20 -14 -6 -19 Q8 -22 16 -12 Q21 -3 14 0 Z', fill: '#8d9aa3', stroke: '#fff', 'stroke-width': 2.5 }, g); el('path', { d: 'M-8 -14 q6 -3 12 0', fill: 'none', stroke: '#fff', 'stroke-opacity': .45, 'stroke-width': 2 }, g); },
  pumpkin(g) { for (const [dx, rx] of [[-16, 18], [16, 18], [0, 20]]) el('ellipse', { cx: dx, cy: -24, rx, ry: 24, fill: '#e98a3a', stroke: '#fff', 'stroke-width': 2.5 }, g); el('path', { d: 'M0 -46 q2 -10 8 -12', fill: 'none', stroke: '#5d7a35', 'stroke-width': 4, 'stroke-linecap': 'round' }, g); },
  watermelon(g) { el('ellipse', { cx: 0, cy: -26, rx: 40, ry: 26, fill: '#3f7a3a', stroke: '#fff', 'stroke-width': 3 }, g); for (const dx of [-24, -8, 8, 24]) el('path', { d: `M${dx} -50 Q${dx * 1.15} -26 ${dx} -2`, fill: 'none', stroke: '#9ccf6a', 'stroke-width': 3 }, g); },
};
/* ما ينتظر أن يوضع في الميزان: على رفٍّ فوق الذراع، لا على الأرض تحت الكفّتين (الفحص المستقل C2 لبوابة S1-U4: بعد إطالة الخيوط ركبت الكفّتان كرة الشاطئ والبالون
   على الأرض قبل وضعهما). الأول يميناً كالكفّة اليمنى. ks: [a, b] → [{k, x, g}] */
function weighShelf(svg, ks) { const shelf = el('rect', { x: 70, y: 86, width: 220, height: 8, rx: 4, fill: MAT.wood, stroke: '#fff', 'stroke-width': 2, 'data-wshelf': 1 }, svg);
  const P = ks.map((k, i) => { const x = i ? 120 : 240; return { k, x, g: weighAt(svg, k, x, 86, .8) }; }); P.shelf = shelf; return P; }
/* يضع الطفل ما على الرفّ في الكفّتين (البند والمشاهد بدالّة واحدة): يلمس الشيء أو يضغط مفتاحه فيذهب إلى كفّة فارغة، والرفّ يُزال حين يفرغ
   (الفحص المستقل D1 لبوابة S1-U4: بقي الرفّ فارغاً فوق الميزان بعد الوضع، في البند والمختبر و«صحّح لفوضى») */
function shelfPut(B, P) { return new Promise(res => { let n = 0;
  const put = p => { if (p.done) return; p.done = true; hush(); p.g.remove(); B.put(!B.pans.R.k ? 'R' : 'L', p.k); SFX.pop(); if (++n === P.length) { if (P.shelf) P.shelf.remove(); AUTO_CLEAR(); res(); } };
  P.forEach(p => { p.g.style.cursor = 'pointer'; p.g.setAttribute('role', 'button'); p.g.setAttribute('aria-label', plain(G(labelText('w.' + p.k)))); p.g.dataset.put = 1; hitPad(p.g, 64); p.g.onclick = () => put(p); keyOn(p.g, () => put(p)); });
  AUTO({ kind: 'weighPut', ok: () => P.forEach(p => put(p)) }); }); }
function weighAt(parent, k, x, y, s = 1) { const g = el('g', { transform: `translate(${x} ${y}) scale(${s})`, 'data-weigh': k }, parent); (WEIGH_DRAW[k] || WEIGH_DRAW.cube)(g); return g; }

/* ---------- الأحجام (C024): كرات ودوائر بلون واحد، فلا يدلّ اللون على الحجم ---------- */
function sizeThingAt(parent, k, r, x, y, color = NEUTRAL[1]) { const g = el('g', { transform: `translate(${x} ${y})`, 'data-size': r }, parent);
  if (k === 'ball') { el('circle', { r, fill: color, stroke: '#fff', 'stroke-width': 3, filter: 'url(#pp)' }, g); el('path', { d: `M${-r} 0 Q0 ${r * .45} ${r} 0`, fill: 'none', stroke: '#fff', 'stroke-opacity': .7, 'stroke-width': 2.5 }, g);
    el('ellipse', { cx: -r * .35, cy: -r * .4, rx: r * .22, ry: r * .14, fill: '#fff', 'fill-opacity': .4 }, g); }
  else if (k === 'box') { drawBox(el('g', {}, g), { w: r * 1.5, h: r * 1.5, d: r * 1.1, yaw: 24, pitch: 18, color }); }
  else el('circle', { r, fill: color, stroke: '#fff', 'stroke-width': 3, filter: 'url(#pp)' }, g);
  return g; }

/* ---------- لوحة المقاول (D001): أعمدة من مربعات متساوية تبدأ من خط واحد، لكل فئة عمود ---------- */
/* رموز الفئات: سلال الشبر الثلاث (أقصر منه، وبطوله تقريباً، وأطول منه)، وأشياء الحديقة */
function catIconAt(parent, k, x, y, s = 1) { const g = el('g', { transform: `translate(${x} ${y}) scale(${s})`, 'data-cat': k }, parent);
  if (k === 'short' || k === 'same' || k === 'long') { const L = { short: 22, same: 36, long: 50 }[k];
    el('rect', { x: -28, y: -26, width: 56, height: 46, rx: 8, fill: '#fffdf6', stroke: css('--basket-dk'), 'stroke-width': 2 }, g);
    el('path', { d: 'M18 -14 Q0 -24 -18 -14', fill: 'none', stroke: '#3d7cc0', 'stroke-width': 2.5, 'stroke-dasharray': '4 3' }, g);   /* الشبر قوساً */
    el('line', { x1: 18, y1: -10, x2: 18, y2: 12, stroke: '#1b3440', 'stroke-width': 1.5, 'stroke-dasharray': '3 3', opacity: .5 }, g); el('line', { x1: -18, y1: -10, x2: -18, y2: 12, stroke: '#3d7cc0', 'stroke-width': 1.5, opacity: .6 }, g);
    el('rect', { x: 18 - L, y: 0, width: L, height: 9, rx: 2, fill: '#c9a072', stroke: '#fff', 'stroke-width': 1.5 }, g); }
  else if (WEIGH_DRAW[k]) { const w = el('g', { transform: 'translate(0 18) scale(.8)' }, g); WEIGH_DRAW[k](w); }
  else if (IDC[k]) shapeAt(g, { type: k, size: 26, w: k === 'rect' ? 32 : undefined, h: k === 'rect' ? 18 : undefined, color: css(IDC[k]) }, 0, 0);
  return g; }
/* اللوحة: الفئات من اليمين إلى اليسار، والمربعات من الخط إلى الأعلى. يعيد {cols: [{x, cells, add(), top}], baseY, cell} */
function barBoardAt(svg, cats, counts, opt = {}) { const baseY = opt.baseY ?? 200, cell = opt.cell ?? 26, gap = opt.gap ?? 96, n = cats.length, x0 = opt.x0 ?? 180 + (n - 1) * gap / 2;
  const g = el('g', { 'data-board': 1 }, svg);
  el('line', { x1: x0 + gap / 2, y1: baseY, x2: x0 - (n - .5) * gap, y2: baseY, stroke: css('--ink'), 'stroke-width': 3, 'stroke-linecap': 'round' }, g);   /* بلون الحبر فيُرى في الوضع الداكن (الفحص المستقل B لبوابة S1-U4: 1.18:1)؛ الخط الواحد الذي تبدأ منه الأعمدة */
  const cols = cats.map((k, i) => { const x = x0 - i * gap; const cg = el('g', { 'data-col': k }, g); const col = { k, x, g: cg, cells: [], sizes: opt.sizes ? opt.sizes[i] : null, lift: opt.lifts ? opt.lifts[i] : 0 };
    col.add = (o = {}) => { const j = col.cells.length; const sz = (col.sizes && col.sizes[j]) || cell; const yTop = baseY - (col.lift || 0) - col.cells.reduce((s, c) => s + c.sz, 0) - sz;
      const r = el('rect', { x: x - sz / 2, y: yTop, width: sz, height: sz, rx: 3, fill: o.color || opt.color || css('--square'), stroke: '#fff', 'stroke-width': 2.5 }, cg); col.cells.push({ r, sz, y: yTop }); return r; };
    col.pop = () => { const c = col.cells.pop(); if (c) c.r.remove(); };
    col.top = () => baseY - (col.lift || 0) - col.cells.reduce((s, c) => s + c.sz, 0);
    for (let j = 0; j < (counts[i] || 0); j++) col.add(); catIconAt(g, k, x, baseY + 34, opt.iconS || .9); return col; });
  return { g, cols, baseY, cell, gap }; }

/* ---------- عمود العشرة والمنفردات (N010) ---------- */
const TEN_C = 13;   /* مكعب صغير في عمود العشرة */
/* عمود من عشرة مكعبات ثابت (مربوط بشريطين)، قاعدته عند baseY ومحوره x */
function rodAt(parent, x, baseY, opt = {}) { const c = opt.c || TEN_C; const g = el('g', { 'data-rod': 1 }, parent);
  for (let i = 0; i < 10; i++) { const y = baseY - (i + 1) * c; el('rect', { x: x - c / 2 - 2, y, width: c + 4, height: c, fill: opt.color || CUBE.lemon, stroke: '#fff', 'stroke-width': 1.4 }, g); }
  for (const f of [.3, .7]) el('rect', { x: x - c / 2 - 4, y: baseY - 10 * c * f - 2, width: c + 8, height: 4, rx: 2, fill: '#c94f3d' }, g);
  return g; }
function oneAt(parent, x, y, opt = {}) { const c = opt.c || TEN_C + 5; const g = el('g', { 'data-one': 1, transform: `translate(${x} ${y})` }, parent);
  el('rect', { x: -c / 2, y: -c / 2, width: c, height: c, rx: 2, fill: opt.color || CUBE.lemon, stroke: '#fff', 'stroke-width': 1.8 }, g); return g; }
/* العدد n عموداً ومنفردات: الأعمدة على اليسار والمنفردات على اليمين، في صفّين من خمسة (كإطار العشرة)؛
   وcompact (ثلاثة بناءات في المسرح): الأعمدة متلاصقة، والمنفردات في عمودين من خمسة على يمينها */
/* opt.tens وopt.ones: البناء كما بناه الطفل (عشرة مكعبات منفردة تبقى منفردة، لا تُرسم عموداً؛ الفحص المستقل B لبوابة S1-U4) */
function teenAt(svg, n, opt = {}) { const baseY = opt.baseY ?? 220, tens = opt.tens ?? Math.floor(n / 10), ones = opt.ones ?? n % 10; const g = el('g', { 'data-teen': n }, svg); const rx = opt.rodX ?? 96, ox = opt.onesX ?? 306;
  if (opt.compact) { const c = 15; const rods = Array.from({ length: tens }, (_, i) => ({ g: rodAt(g, rx + i * 18, baseY, { c: 12 }), x: rx + i * 18 }));
    const onesL = Array.from({ length: ones }, (_, i) => { const x = ox + (i < 5 ? 18 : 0), y = baseY - c / 2 - 1 - (i % 5) * (c + 2); return { g: oneAt(g, x, y, { c }), x, y }; }); return { g, rods, ones: onesL, tens, n }; }
  const rods = Array.from({ length: tens }, (_, i) => ({ g: rodAt(g, rx + i * 34, baseY), x: rx + i * 34 }));
  const sp = opt.sp ?? 26, onesL = Array.from({ length: ones }, (_, i) => { const x = ox - (i % 5) * sp, y = baseY - 14 - Math.floor(i / 5) * sp; return { g: oneAt(g, x, y), x, y }; });
  return { g, rods, ones: onesL, tens, n }; }

/* ---------- إطار العشرة (N011، N012): صفّان في كل صفّ خمسة، يُملأ من اليمين والصفّ الأعلى أولاً ---------- */
const FRAME = { cell: 44 };
function frameAt(parent, cx, cy, opt = {}) { const c = opt.cell || FRAME.cell, w = 5 * c, h = 2 * c; const g = el('g', { 'data-frame': 1 }, parent);
  el('rect', { x: cx - w / 2 - 4, y: cy - h / 2 - 4, width: w + 8, height: h + 8, rx: 8, fill: '#fffdf6', stroke: '#1b3440', 'stroke-width': 3 }, g);
  for (let i = 1; i < 5; i++) el('line', { x1: cx - w / 2 + i * c, y1: cy - h / 2, x2: cx - w / 2 + i * c, y2: cy + h / 2, stroke: '#1b3440', 'stroke-width': 2 }, g);
  el('line', { x1: cx - w / 2, y1: cy, x2: cx + w / 2, y2: cy, stroke: '#1b3440', 'stroke-width': 2 }, g);
  const pos = i => ({ x: cx + w / 2 - (i % 5 + .5) * c, y: cy - h / 2 + (Math.floor(i / 5) + .5) * c });
  const F = { g, cx, cy, c, pos, slots: Array(10).fill(null), count: () => F.slots.filter(Boolean).length,
    put(i, color = CUBE.lemon) { if (F.slots[i]) return F.slots[i]; const p = pos(i); const k = counterAt(g, p.x, p.y, c * .38, color); F.slots[i] = k; return k; },
    fill(n, color, from = 0) { for (let i = from; i < from + n && i < 10; i++) F.put(i, typeof color === 'function' ? color(i) : color); return F; },
    take(i) { const k = F.slots[i]; if (k) { k.remove(); F.slots[i] = null; } },
    firstEmpty: () => F.slots.findIndex(s => !s), lastFull: () => { for (let i = 9; i >= 0; i--) if (F.slots[i]) return i; return -1; } };
  return F; }
const COUNTER2 = '#5c9bb0';   /* لون العدد الثاني في الإطار */
function counterAt(parent, x, y, r, color = CUBE.lemon) { const g = el('g', { transform: `translate(${x} ${y})`, 'data-counter': 1 }, parent);
  el('circle', { r, fill: color, stroke: '#fff', 'stroke-width': 2.5 }, g); el('circle', { cx: -r * .3, cy: -r * .3, r: r * .28, fill: '#fff', 'fill-opacity': .35 }, g); return g; }

/* ---------- العدّ بلمسات متتابعة على هدف واحد (وحدات أصغر من الإصبع: المشابك والأشبار والمكعبات المتلاصقة) ----------
   كل لمسة تضيء الوحدة التالية من البداية (اليمين) وتنطق عددها، فلكل وحدة لمسة واحدة وعدد واحد (N001)، كعدّ البرج */
function rowTapCount(svg, units, opt = {}) { const n = units.length; let k = 0; const marks = el('g', { 'pointer-events': 'none' }, svg);
  const xs = units.map(u => u.x), ys = units.map(u => u.y); const pad = 30;
  const box = { x: Math.min(...xs) - MU / 2 - 8, y: Math.min(...ys) - pad, w: Math.max(...xs) - Math.min(...xs) + MU + 16, h: Math.max(...ys) - Math.min(...ys) + 2 * pad };
  const g = el('g', { role: 'button', tabindex: 0, 'aria-label': plain(G(labelText(opt.label || 'countUnits'))), 'data-tapcount': n }, svg); g.style.cursor = 'pointer';
  el('rect', { x: box.x, y: box.y, width: box.w, height: box.h, fill: 'transparent', 'pointer-events': 'all' }, g); hitPad(g, 0, 56);   /* 56 بكسلاً على أضيق شاشة (كان 48) */
  AUTO({ kind: 'tapCount', ok: async () => { for (let i = k; i < n; i++) { g.dispatchEvent(new MouseEvent('click', { bubbles: true })); await new Promise(r => setTimeout(r, 40)); } } });
  const off = pulse(units.map(u => u.g));
  return gate(new Promise(res => { const act = () => { if (k >= n) return; off(); const u = units[k]; k++; SFX.tick(); buzz(20);
      el('rect', { x: u.x - (u.u || MU) / 2, y: u.y - (u.h || MU) / 2, width: u.u || MU, height: u.h || MU, rx: 4, fill: css('--rect'), opacity: .3 }, marks);
      badge(marks, u.x, u.y - (opt.by ?? -30) - (k % 2 ? 0 : (opt.alt ?? -20)), k, opt.color);
      if (!SET.muted && !FAST) say(...lineOf(numw(k)), { num: true, noGap: true, free: true });
      if (k === n) { AUTO_CLEAR(); g.remove(); res(n); } };
    g.onclick = act; g.onkeydown = e => { if (actKey(e)) act(); }; }));
}
/* شارات العدّ فوق وحدات متلاصقة (الحلّ المشترك وحركة الأداة): تتناوب ارتفاعاتها فلا تتراكب */
/* شارات العدّ تحت صفّ الوحدات (فوقه الشيء المقاس، فكانت تغطّيه)، متناوبة الارتفاع فلا تتراكب؛ by وalt بالسالب تحت الصفّ */
async function unitBadges(svg, units, opt = {}) { const pts = units.map((u, i) => ({ x: u.x, y: u.y - (opt.by ?? -30) - (i % 2 ? (opt.alt ?? -20) : 0) })); return badgeCount(svg, pts, opt.color); }

/* ---------- السحب الأفقي إلى خط البداية (C014، H11): يُسحب الشيء بالإصبع أو يُلمس فيذهب إليه (بديل النقر، D246) ----------
   things: [{o (من lenAt)}]؛ onAlign(o) حين يستقرّ شيء على الخط. لا يُحكم بالسحب: الطفل يحاذي ثم يلمس جوابه */
function dragAlign(svg, things, opt = {}) { const snap = opt.snap ?? 16, X = opt.x ?? MS_X; const offs = [];
  things.forEach(t => { const o = t.o; const g = o.g; g.style.cursor = 'grab'; g.setAttribute('role', 'button'); g.setAttribute('tabindex', 0); g.dataset.align = Math.abs(o.x0 - X) < .5 ? 'yes' : 'no'; g.dataset.alignX = X;   /* خط المحاذاة للمس الحقيقي (realtap_run) */
    if (t.label) g.setAttribute('aria-label', plain(G(t.label))); hitPad(g, 64, 64);
    let d = null;
    const settle = () => { if (Math.abs(o.x0 - X) < snap) { o.setX(X); g.dataset.align = 'yes'; SFX.pop(); if (opt.onAlign) opt.onAlign(o); } else g.dataset.align = 'no'; };
    /* السحب يبدأ بالشيء المرسوم تحت الإصبع، لا بصاحب منطقة اللمس العليا (D255؛ الفحص المستقل B لبوابة S1-U4: سحبٌ على جسم الشريط الثاني حرّك الثالث) */
    const down = e => { if (opt.locked && opt.locked()) return;
      if (!e.__routed && things.length > 1 && e.clientX != null) { const r = tapRoute(things.map(x => ({ g: x.o.g, x })), e.clientX, e.clientY, { g, x: t }).x; if (r !== t && r.__down) { e.__routed = true; return r.__down(e); } }
      d = { sx: e.clientX, x0: o.x0, moved: false }; try { g.setPointerCapture(e.pointerId); } catch (x) {} }; t.__down = down;
    const move = e => { if (!d) return; const m = svg.getScreenCTM(); const dx = (e.clientX - d.sx) / m.a; if (Math.abs(dx) > 4) d.moved = true; if (d.moved) o.setX(Math.max(o.w + 12, Math.min(X + 30, d.x0 + dx))); };
    /* opt.tap: لمسة بلا سحب تحاذيه (بديل السحب، D246) حيث لمس الشيء ليس جواباً (الشبر)؛ وفي «أيّهما أطول؟» اللمس جواب فالبديل زرّ «حاذِ البدايات» */
    const up = () => { if (!d) return; const moved = d.moved; d = null; if (moved) { settle(); t.dragged = true; t.dragAt = Date.now(); } else if (opt.tap) { t.align(); SFX.tick(); logAttempt({ scene: 'explore', tag: 'alignTap', ok: true }); } };
    /* النقرة التي يطلقها المتصفح بعد سحبٍ بالفأرة ليست جواباً: تُكبت قبل أن تبلغ لمس الجواب */
    g.addEventListener('click', e => { if (things.some(x => x.dragAt && Date.now() - x.dragAt < 400)) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
    g.addEventListener('pointerdown', down); g.addEventListener('pointermove', move); g.addEventListener('pointerup', up); g.addEventListener('pointercancel', () => { d = null; });
    const key = e => { if (opt.tap && actKey(e)) t.align(); }; g.addEventListener('keydown', key); if (opt.tap) g.dataset.keys = 1;   /* مفتاحه الخاص (فلا يلمسه المفتاح العامّ أيضاً، kbdStage) */
    /* بعد off لا يُسحب: يُزال وسم المحاذاة فلا يحسبه الفحص شيئاً يُسحب بلا بديل (كان يبقى «no» تحت جملة المدح بعد بند الطول) */
    offs.push(() => { g.removeEventListener('pointerdown', down); g.removeEventListener('pointermove', move); g.removeEventListener('pointerup', up); g.removeEventListener('keydown', key); g.style.cursor = ''; delete g.dataset.align; delete g.dataset.alignX; if (opt.tap) delete g.dataset.keys; });
    t.align = async () => { await alignTo(o, X, 500); g.dataset.align = 'yes'; if (opt.onAlign) opt.onAlign(o); }; });
  const all = async () => { await Promise.all(things.map(t => t.align())); };
  return { off: () => offs.forEach(f => f()), all }; }
/* «حاذِ البدايات»: بديل السحب (D246) لمن لا يسحب، زرٌّ تحت المسرح؛ ويُقرأ في التمرين وحده (في التقييم أداةٌ لا خيار) */
/* زرّ أدّى عمله وسط الانتظار يُخفى ولا يُزال: إزالته تكبّر المسرح فيقفز الرسم تحت إصبع الطفل (الفحص المستقل B لبوابة S1-U4: لمسة الأطول بعد «حاذِ» سُجّلت على غيره) */
function barGone(bar) { bar.style.visibility = 'hidden'; bar.querySelectorAll('button').forEach(b => { b.disabled = true; b.onclick = null; }); }
function alignBar(dz, opt = {}) { const tb = toolBar([['align', 'alignStarts', TOOL_IC.align, opt.read ? 'gen.opt.alignStarts' : null]]); tb.b.align.onclick = async () => { barGone(tb.bar); hush(); SFX.tick(); await dz.all(); logAttempt({ scene: 'explore', tag: 'alignBtn', ok: true }); }; return tb; }
