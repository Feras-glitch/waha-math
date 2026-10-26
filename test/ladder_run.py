# الحلّ المشترك يبقى أمام الطفل حين يجيب (D257(5)(و)، الفحص المستقل C): في كل بند يُشغَّل بالمساعدة (التمرين وألعابه والعلاج) يخطئ الطفل ثلاث مرات،
# ثم يُراقَب المسرح من الحكم الثالث حتى انتظار فعل الطفل في المحاولة الرابعة: كل ما رُسم في هذه المدة (الحلّ المشترك ومسرح المحاولة الرابعة)
# يجب أن يبقى على الشاشة حين ينتظر التطبيق الطفل. فما رُسم على مسرح المحاولة السابقة ثم ذهب بمسرح جديد (عدّ القطار ثم قطار نظيف)، أو رُسم ثم مُحي
# قبل اللمس ولم يُرسم مكانه مثله (سهم اليد اليمنى، وعدّ يُمحى)، يُعدّ هنا ويُخفق. (والحلّ الذي هو كلام، أو حركة لما على المسرح، لا يضيف شيئاً يُمحى؛
# وفي الأنواع التي حلّها رسمٌ (HELP_DRAWN) يجب أن يكون الرسم المعلَّم data-help على المسرح.)
# python3 test/ladder_run.py   (FILE=نسخة فحص أخرى، ONLY=m1.u3.d2,… دروس بعينها)
import asyncio, os, sys
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
FILE = os.environ.get('FILE', os.path.join(HERE, '..', 'dist', 'واحة_الرياضيات.dev.html'))
ONLY = [x for x in os.environ.get('ONLY', '').split(',') if x]
FAILS = []
def check(ok, what): print(('ok   ' if ok else 'FAIL ') + what); (None if ok else FAILS.append(what))
LIST = """(only) => { const out = []; for (const id of UNITS.flatMap(u => u.lessons)) { if (only.length && !only.includes(id)) continue; const L = LDATA[id], P = L.practice || {}, M = L.mastery || {};
  const add = (it, k) => { if (it && typeof it.t === 'string') out.push([id, k, it]); };
  (P.normal || []).forEach((it, i) => add(it, 'pr' + i)); (P.challenge || []).forEach((it, i) => add(it, 'prc' + i));
  for (const [c, a] of Object.entries(M.remedial || {})) a.forEach((it, i) => add(it, 'rm.' + c + i));
  L.flow.forEach((s, j) => { if (s.scene === 'items' && ['practice', 'remedial'].includes(s.mode)) (s.items || []).forEach((it, i) => add(it, 'fl' + j + '.' + i)); }); }
  /* وبنود من صنع الفحص لمسارات في الكود لا يبلغها محتوى اليوم (الفحص المستقل E: شارات «٥ − ١» على أربع أصابع متجاورة تراكبت، ولا بند بمساعدة في المحتوى بها) */
  for (const [id, k, it] of [['m1.u2.d5', 'synth.fact5-1', { t: 'fact', op: '-', a: 5, b: 1 }], ['m1.u2.d5', 'synth.fact4+1', { t: 'fact', op: '+', a: 4, b: 1 }]]) if (!only.length || only.includes(id)) out.push([id, k, it]);
  window.__LAD = out; return out.map(([id, k, it], n) => [id, k, itemType(it), n, !!(it.row && (it.row.kind === 'train' || it.ask === 'ord')), it.side || null, it.t === 'makeTen' ? (it.ask === 'moved' ? 10 - it.a : null) : it.n ?? null, it.ask || null]); }"""
START = """(n) => { const [id, k, it] = window.__LAD[n]; hush(); CUR = LDATA[id]; FLOW++; show('lesson'); SCENE_NOW = 'ladder:' + id; window.__res = null; window.__fails = 0;
  if (window.__mo) window.__mo.disconnect(); window.__added = []; window.__mark = 1e15;
  /* أزمنة ما يُقال وأزمنة التجربة (pushTest)، لترتيب «شاهد التجربة» قبل التجربة (الفحص المستقل E) */
  window.__clips = window.__clips || []; if (!window.__clips.__t) { const op = window.__clips.push.bind(window.__clips); window.__clips.push = (...a) => { (window.__clipT = window.__clipT || []).push([a[0], performance.now()]); return op(...a); }; window.__clips.__t = 1; }
  if (!window.__ptw && typeof pushTest === 'function') { const op = pushTest; window.pushTest = async (...a) => { (window.__ptT = window.__ptT || []).push(performance.now()); return op(...a); }; window.__ptw = 1; }
  if (!window.__la) { window.__la = logAttempt; logAttempt = a => { const r = window.__la(a); if (a && a.ok === false && a.scene === 'ladder') { window.__fails++;
      if (window.__fails === 3) { window.__added = []; window.__mark = performance.now(); window.__mo = new MutationObserver(ms => { for (const m of ms) for (const nd of m.addedNodes) if (nd.nodeType === 1) window.__added.push([nd, m.target]); });
        window.__mo.observe(document.querySelector('#stage'), { childList: true, subtree: true }); } } return r; }; }
  runItem(JSON.parse(JSON.stringify(it)), 'practice', { scene: 'ladder' }).then(r => { window.__res = { ok: r.ok }; }, e => { window.__res = { err: String(e && e.message || e) }; }); }"""
STATE = """() => { const a = window.__auto; const go = document.querySelector('#go');
  return { res: window.__res, auto: a ? { n: a.n, kind: a.kind, wrong: !!a.wrong } : null, twin: !!window.__itemTwin, fails: window.__fails || 0,
    go: !!go && !go.disabled && !go.hidden && !go.classList.contains('idle') }; }"""
GONE = r"""() => { if (window.__mo) window.__mo.disconnect(); const A = window.__added || [], par = new Map(A);
  /* ما ذهب من رسم المحاولة الرابعة قبل أن يجيب الطفل: رسمٌ على مسرح المحاولة السابقة ذهب بمسرح جديد (أعلى ما فوقه لم يُرسم في هذه المدة، أو أبوه لم يعد في الصفحة)،
     أو رسمٌ مُحي من مسرح هذه المحاولة ولم يُرسم مكانه مثله. أما ما يُعاد رسمه مكانه (نقاط القفزات، والروبوت في كل خطوة، والبرج العائد) فليس مساعدة تُمحى،
     وما يذهب بقصدٍ خطوةً من المهمة أو الحركة يُعلَّم data-step */
  const root = e => { let r = e; while (r.parentNode) r = r.parentNode; return r; };
  const sig = e => e.tagName + '|' + [...e.attributes].map(a => a.name).filter(n => n !== 'style').sort().join(',');
  const fresh = new Set(A.filter(([e]) => e.isConnected).map(([e]) => e));
  const gone = A.filter(([e]) => !e.isConnected).filter(([e]) => { const r = root(e); if ((r.dataset && r.dataset.step) || (e.closest && e.closest('[data-step]'))) return false;
    if (!par.has(r)) return true; const p = par.get(r); if (!p.isConnected) return true;
    return ![...p.children].some(c => fresh.has(c) && sig(c) === sig(r)); });
  const name = e => e.tagName.toLowerCase() + (e.getAttribute('class') ? '.' + e.getAttribute('class') : '');
  /* وفي اليمين واليسار: هالة الحلّ المشترك على اليد اليمنى للطفل المرسوم، كما تقول جملته (الفحص المستقل D: الهالة على اليسرى لم تُخفق الفحص) */
  const halo = document.querySelector('#stage [data-help] circle'), hand = document.querySelector('#stage [data-kid] [data-hand="R"]'); let onR = null;
  if (halo && hand) { const c = e => { const r = e.getBoundingClientRect(); return [(r.left + r.right) / 2, (r.top + r.bottom) / 2]; }, [x1, y1] = c(halo), [x2, y2] = c(hand); onR = Math.hypot(x1 - x2, y1 - y2) < 10; }
  /* وما في اليد فوق الهالة (الهالة تحته فلا تغطّيه)، وشارات العدّ لا تتراكب، وما قيل منذ الحكم الثالث وأين قيل «شاهد التجربة» من التجربة (الفحص المستقل E) */
  const svg = document.querySelector('#stage svg'), kidG = svg && svg.querySelector('[data-kid]'), hg = svg && svg.querySelector('[data-help]');
  const held = kidG ? [...svg.querySelectorAll('[data-thing]')].filter(g => !kidG.contains(g)) : []; const under = hg && held.length ? held.every(t => !!(hg.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING)) : null;
  const cs = [...document.querySelectorAll('#stage [data-help] circle[r="15"]')].map(c => { const r = c.getBoundingClientRect(); return [(r.left + r.right) / 2, (r.top + r.bottom) / 2, r.width / 2]; }); let lap = 0;
  for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) if (Math.hypot(cs[i][0] - cs[j][0], cs[i][1] - cs[j][1]) < cs[i][2] + cs[j][2] + 2) lap++;   /* تتلامس بحدّها الأبيض (الفحص المستقل B لبوابة S1-U4: الحدّ 0.8 سمح بتراكب 4–7 وحدات) */
  /* وشارة الحلّ المشترك لا تغطّي كلمة مرسومة («عشرة» تحت الإطار؛ الفحص المستقل B لبوابة S1-U4) */
  const words = [...document.querySelectorAll('#stage svg text')].filter(t => t.textContent.trim() && !t.parentNode.querySelector(':scope > circle[r="15"]')).map(t => t.getBoundingClientRect()).filter(b => b.width);
  let cover = 0; for (const [x, y, r] of cs) for (const b of words) if (x + r > b.left + 2 && x - r < b.right - 2 && y + r > b.top + 2 && y - r < b.bottom - 2) cover++;
  const said = (window.__clipT || []).filter(([, t]) => t >= window.__mark), pt = (window.__ptT || []).filter(t => t >= window.__mark);
  const tog = said.find(([c]) => /^gen\.prop\.together/.test(c)); const order = tog ? (pt.length ? tog[1] <= pt[0] : null) : null;
  return [gone.length, A.length, [...new Set(gone.map(([e]) => name(e)))].slice(0, 6), !!document.querySelector('#stage [data-help]'), onR, under, lap, said.map(([c]) => c), order, cs.length, cover]; }"""
# الأنواع التي حلّها المشترك رسمٌ يُعلَّم data-help في الكود: يجب أن يكون على المسرح في المحاولة الرابعة (الفحص المستقل D: حذفُه كله لم يُخفق الفحص)؛
# و«المس العربة» في القطار وترتيب الطابور وحدهما من lineTap (مواضع الطابور حلّها كلام)
HELP_DRAWN = {'lrTap', 'lrPick', 'linePick', 'lineTap', 'mapFind', 'mapPut', 'routePick', 'fact', 'unknownStart', 'same',
              # S1-U4: كلها حلّها رسم (خطوط عند النهايات، وشارات الترتيب الأولى، والسهم إلى الكفّة الأنزل، والعدّ، والوحدات الموضوعة، وعلامات الخطأ، والشبران، والمربعات، والعمود، والإطار)
              'lenPick', 'orderBy', 'sizePick', 'balance', 'unitCount', 'unitLay', 'unitCheck', 'spanPick', 'spanSort', 'transPick', 'barRead', 'barBuild', 'rodCount', 'rodBuild', 'rodMatch',
              'teenCmp', 'teenTrace', 'frameNeed', 'framePaint', 'frameGlance', 'makeTen', 'backTen'}
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(); ctx = await b.new_context(**p.devices['Pixel 5']); pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.goto('file://' + os.path.abspath(FILE) + '#fast&seed=7'); await pg.wait_for_timeout(300)
    await pg.evaluate("""() => { localStorage.clear(); localStorage.setItem('hp_kids', JSON.stringify([{ id: 'k1', name: 'سلمى', gender: 'f' }])); localStorage.setItem('hp_kid', JSON.stringify('k1'));
      localStorage.setItem('hp_settings:k1', JSON.stringify({ sessionMax: 0, muted: true })); localStorage.setItem('hp_prog:k1', JSON.stringify({ schema: 3, unlockAll: true })); }""")
    await pg.reload(); await pg.wait_for_timeout(500)
    items = await pg.evaluate(LIST, ONLY); per = {}; n_run = 0; drawn = {}; onright = {}
    lrsaid = []; unders = []; laps = []; orders = []; counted = []; covers = []
    for lid, key, typ, n, rowhelp, side, ans, ask in items:
      e0 = len(errs); await pg.evaluate(START, n); last = -1; fourth = None; res = None
      for _ in range(1500):
        st = await pg.evaluate(STATE)
        if len(errs) > e0: break
        if st['res']: res = st['res']; break
        a = st['auto']
        if a and a['n'] != last:
          last = a['n']
          if not st['twin'] and st['fails'] == 3 and fourth is None: fourth = await pg.evaluate(GONE)   # انتظار المحاولة الرابعة: ما رُسم منذ الحكم الثالث
          h = 'wrong' if not st['twin'] and a['wrong'] and st['fails'] < 3 else 'ok'
          await pg.evaluate("(h) => { const a = window.__auto; if (a) (h === 'wrong' && a.wrong ? a.wrong : a.ok)(); }", h); continue
        if st['go']: await pg.click('#go'); continue
        await pg.wait_for_timeout(25)
      tag = '%s %s (%s)' % (lid, key, typ)
      if len(errs) > e0 or not res or res.get('err'): check(False, '%s: %s' % (tag, (errs[e0:e0 + 1] or [res and res.get('err') or 'لم ينتهِ البند'])[0][:160])); continue
      n_run += 1
      if fourth is None: continue   # بند بلا خطأ مقصود (لا يبلغ المحاولة الرابعة)
      per.setdefault(typ, []).append((fourth, tag))
      if typ in HELP_DRAWN and (typ != 'lineTap' or rowhelp): drawn.setdefault(typ, []).append((fourth[3], tag))
      if typ in ('lrTap', 'lrPick'):
        onright.setdefault(typ, []).append((fourth[4], tag)); want = 'gen.lr.togetherL' if side == 'L' else 'gen.lr.together'
        lrsaid.append((any(c == want or c.startswith(want + '_') for c in fourth[7]), tag, side))
        if fourth[5] is not None: unders.append((fourth[5], tag))
      if fourth[6]: laps.append((fourth[6], tag))
      if fourth[10]: covers.append((fourth[10], tag))
      if typ == 'property': orders.append((fourth[8], tag))
      # والحلّ المشترك في «كم مكعباً طوله؟» يعدّ القطع إلا آخرها، فيعدّها الطفل (D240؛ الفحص المستقل A لبوابة S1-U4: كان يعدّ حتى الجواب ثم يسأل)
      if typ == 'unitCount' or (typ == 'makeTen' and ask == 'moved'): counted.append((fourth[9], ans, tag))   # و«كم قطعة أخذت؟» يعدّ ما نُقل إلا آخره
    await b.close()
    for typ, L in sorted(per.items()):
      bad = [(g, t) for g, t in L if g[0]]
      check(not bad, '%s: ما رُسم للمحاولة الرابعة باقٍ حين يجيب الطفل (%d بنداً%s)' % (typ, len(L), '' if not bad else '؛ مُحي: ' + '; '.join('%s: %d من %d %s' % (t, g[0], g[1], g[2]) for g, t in bad[:3])))
    for typ, L in sorted(drawn.items()):
      miss = [t for h, t in L if not h]
      check(not miss, '%s: في المحاولة الرابعة حلٌّ مشترك مرسوم (data-help) في كل بنوده (%d%s)' % (typ, len(L), '' if not miss else '؛ بلا حلّ: ' + ', '.join(miss[:3])))
    for typ, L in sorted(onright.items()):
      off = [t for h, t in L if h is not True]
      check(not off, '%s: هالة الحلّ المشترك على اليد اليمنى للطفل المرسوم (%d%s)' % (typ, len(L), '' if not off else '؛ في غيرها: ' + ', '.join(off[:3])))
    bad = [(t, sd) for ok, t, sd in lrsaid if not ok]
    check((bool(lrsaid) or ONLY) and not bad, 'اليمين واليسار: جملة الحلّ المشترك لجهة المطلوب («واليسرى في الجهة الأخرى» حين تُطلب اليسرى) (%d%s)' % (len(lrsaid), '' if not bad else '؛ بغيرها: ' + ', '.join('%s (%s)' % b2 for b2 in bad[:3])))
    badu = [t for u, t in unders if not u]
    check((bool(unders) or ONLY) and not badu, 'ما في اليد فوق هالة الحلّ المشترك لا تحتها (%d%s)' % (len(unders), '' if not badu else '؛ الهالة فوقه: ' + ', '.join(badu[:3])))
    check(not laps, 'شارات الحلّ المشترك لا تتراكب%s' % ('' if not laps else ': ' + ', '.join('%s (%d)' % (t, l) for l, t in laps[:4])))
    check(not covers, 'شارات الحلّ المشترك لا تغطّي كلمة مرسومة%s' % ('' if not covers else ': ' + ', '.join('%s (%d)' % (t, l) for l, t in covers[:4])))
    badc = [(c, a, t) for c, a, t in counted if c != a - 1]
    check((bool(counted) or ONLY) and not badc, '«كم مشبكاً/مكعباً طوله؟» و«كم قطعة أخذت؟»: الحلّ المشترك يعدّ القطع إلا آخرها (%d%s)' % (len(counted), '' if not badc else '؛ ' + ', '.join('%s: %d شارة والجواب %d' % (t, c, a) for c, a, t in badc[:3])))
    bado = [t for o, t in orders if o is not True]
    check((bool(orders) or ONLY) and not bado, '«شاهد التجربة» تُقال قبل التجربة في المحاولة الرابعة (%d%s)' % (len(orders), '' if not bado else '؛ بعدها أو بلا تجربة: ' + ', '.join(bado[:3])))
    check(n_run == len(items), 'كل بنود المساعدة (%d) انتهت بلا خطأ' % len(items))
  print('FAILS:', len(FAILS)); sys.exit(1 if FAILS else 0)
asyncio.run(main())
