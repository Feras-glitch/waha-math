# فحص الفحوص (الدرس 98): كل فحص جديد يجب أن يخفق على الخطأ القديم. تُصنع نسخة فيها الخطأ («طفرة»)، ويُشغَّل الفحص عليها
# فيجب أن يخفق وأن تذكر رسالته الخطأ المقصود؛ وعلى الأصل يجب أن ينجح (فلا يُحسب إخفاقٌ لسبب آخر نجاحاً للطفرة).
#   1) فحص المحتوى (build/lint.mjs ومعه D240): في نسخة من المشروع تُغيَّر بيانات درس، ويُشغَّل الفحص فيها.
#      قواعد S1-U3: مشهد فوضى موجود، ووسوم الأخطاء في البيانات (err وerrs) موجودة، ولا عدد فوق العشرة قبل طريق الأعداد، ولا قطار أطول من
#      الأعداد الترتيبية المسموعة، ومسألة الاختبار لم تُحلّ في الإتقان (حقيقة البند الترتيبي ord|n|k: والقطار كالعدّ يُحجز بين التقييمات وحدها،
#      لأن الاكتشاف يعدّ عرباته كلها)، والمراجعة محجوزة في الوحدة بمسألتها.
#   2) فحوص المتصفح على نسخة الفحص المبنية: يُبدَّل نصّ واحد فيها، ويُشغَّل الفحص بملفها:
#      حزمة الصوت والنسخة الاحتياطية (backup_voice_run)، واللمس الحقيقي لما خرج من نافذة القطار (realtap_run)،
#      واللمس السريع على الطريق (quicktap_run)، و«أعد الجملة» بعد فعل الطفل (replay_run، القسم 8).
#      وقواعد التوأم وجملة حلّ كل موضع (الفحص المستقل B) في فحص المحتوى.
# وأول تشغيل له كشف ثلاث طفرات نجت فأُصلحت الفحوص: «تبقى الحزمة بعد إعادة الفتح» لم يكن يعيد الفتح (الانتقال إلى العنوان نفسه بوسمه)،
# وطول القطار داخل row لا يبلغه فحص الأعداد، وطفرة «حُلّت في التمرين» كانت تفترض قاعدةً غير القاعدة المكتوبة (الترتيب يُحجز بين التقييمات).
# python3 test/mutants_run.py   (بعد البناء؛ يخرج بـ 1 إن نجت طفرة أو أخفق الأصل)
import json, os, shutil, subprocess, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
DEV = os.path.join(ROOT, 'dist', 'واحة_الرياضيات.dev.html')
FAILS = []
def check(ok, what):
  print(('ok   ' if ok else 'FAIL ') + what); (None if ok else FAILS.append(what))

# ---------- 1) المحتوى ----------
def lesson(rel):
  return lambda root: os.path.join(root, 'content', 'm1', 'u3', rel)
def edit(root, rel, fn):
  p = lesson(rel)(root); d = json.load(open(p, encoding='utf-8')); fn(d)
  json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
def set_(path, v):   # path: مفاتيح وفهارس
  def fn(d):
    x = d
    for k in path[:-1]: x = x[k]
    assert path[-1] in x if isinstance(x, dict) else path[-1] < len(x), path
    x[path[-1]] = v
  return fn
def test_item(d, i): return next(q for q in d['test']['items'] if q['id'] == i)['item']
CONTENT = [
  ('مشهد فوضى غير معروف', 'd2.json', set_(['chaos', 'scene'], 'chaosTrainBadgeX'), 'مشهد فوضى غير معروف «chaosTrainBadgeX»'),
  ('وسم خطأ err في خيار غير موجود', 'd7.json', lambda d: test_item(d, 't8')['opts'][1].__setitem__('err', 'mapRouteX'), 'وسم خطأ في البيانات غير موجود في errors.json «mapRouteX»'),
  ('وسم خطأ errs في لغز الطابور غير موجود', 'd2.json', set_(['practice', 'challenge', 0, 'errs', '1'], 'posFrontBackX'), '«posFrontBackX»'),
  ('عدد فوق العشرة قبل طريق الأعداد', 'd2.json', set_(['practice', 'normal', 2, 'k'], 12), '.k = 12 خارج 0–10'),
  ('قطار أطول من الأعداد الترتيبية المسموعة', 'd2.json', set_(['practice', 'normal', 2, 'row', 'n'], 12), 'قطار من 12 عربة'),
  ('مسألة الاختبار في الإتقان (العربة السادسة من عشر، بشكل آخر)', 'd2.json',
   lambda d: d['mastery']['concepts']['N008'][0].update(k=6, row={'kind': 'train', 'n': 10, 'things': {'2': 'cat'}}), 'المسألة نفسها (ord|tap|6)'),
  ('مسألة المراجعة تُحلّ في درس آخر من الوحدة', 'd6.json', lambda d: d['mastery']['mixed']['item'].update(a=17, b=13), 'المراجعة محجوزة في الوحدة'),
  # الموضع بلا الشيء (الفحص المستقل A للبوابة): «الدب فوق الطاولة» في الإتقان بعد «القطة فوق الطاولة» في التمرين مسألة واحدة
  ('مسألة الموضع نفسها بشيء آخر', 'd1.json', lambda d: d['mastery']['concepts']['C010'][0]['pic'].update(at='on'), 'المسألة نفسها (pos|where|table|on)'),
  ('خانة كنز الخريطة فيها قطعة', 'd4.json', lambda d: d['mastery']['concepts']['C012'][0]['mark'].update(cell=[2, 'front']), 'فيها قطعة'),
  ('خانة كنز الخريطة خلف طاولة قريبة منا', 'd4.json', lambda d: d['mastery']['concepts']['C012'][0]['mark'].update(cell=[2, 'back']), 'فيحجبها'),
  # التوأم (الفحص المستقل B): لكل بند يُشغَّل بالمساعدة توأم، مسألته غير مسألة أصله، ولا توأم له، ولا توأم في تقييم
  ('بند تمرين بلا توأم', 'd1.json', lambda d: d['practice']['normal'][0].pop('twin'), 'يُشغَّل بالمساعدة بلا توأم'),
  ('توأم مسألته مسألة أصله', 'd3.json', lambda d: d['practice']['normal'][0].__setitem__('twin', {k: v for k, v in d['practice']['normal'][0].items() if k != 'twin'}), 'مسألته مسألة أصله'),
  ('توأم له توأم', 'd5.json', lambda d: d['practice']['normal'][0]['twin'].__setitem__('twin', dict(d['practice']['normal'][0]['twin'])), 'له توأم، والتوأم يُشغَّل مرة واحدة'),
  ('توأم في بند إتقان لا يُشغَّل', 'd1.json', lambda d: d['mastery']['concepts']['C010'][0].__setitem__('twin', dict(d['practice']['normal'][0]['twin'])), 'وله توأم لا يُشغَّل'),
  # وكل موضع يُطلب له جملة حلّه (الفحص المستقل B: فراغ الطابور g1 بلا جملة فتوقّف الدرس)
  ('فراغ طابور خارج الطابور', 'd2.json', lambda d: next(s for s in d['flow'] if s.get('s') == 'game')['items'][2].update(at='g5'), 'ليس من g0 إلى g2'),
  ('موضع بلا جملة حلّ', 'd1.json', lambda d: d['practice']['normal'][0]['pic'].update(at='near'), 'جملة غير موجودة gen.solve.pos.near'),
]
CODE = [
  ('نوع بند يُسقط توأمه', 'src/js/43_items_place.js', "praise: () => 'praiseRoute', reason(item) { return item.why || null; }, twin(item) { return item.twin || null; },",
   "praise: () => 'praiseRoute', reason(item) { return item.why || null; }, twin: () => null,", 'نوع البند routePick بلا توأم'),
]
def lint(root):
  r = subprocess.run(['node', 'build/lint.mjs'], cwd=root, capture_output=True, text=True); return r.returncode, r.stdout + r.stderr

tmp = tempfile.mkdtemp(prefix='mut_')
try:
  root = os.path.join(tmp, 'engine')
  shutil.copytree(ROOT, root, ignore=shutil.ignore_patterns('dist', 'out', '.git', '__pycache__', 'node_modules'))
  rc, out = lint(root); check(rc == 0, 'الأصل: فحص المحتوى بلا مخالفة')
  for name, rel, fn, want in CONTENT:
    p = lesson(rel)(root); keep = open(p, encoding='utf-8').read()
    edit(root, rel, fn); rc, out = lint(root); open(p, 'w', encoding='utf-8').write(keep)
    hit = [l.strip() for l in out.splitlines() if want in l]
    check(rc == 1 and bool(hit), 'طفرة المحتوى «%s»: أخفق الفحص بالرسالة المقصودة %s' % (name, (hit or out.splitlines()[-3:])[:1]))
  # وطفرات في الكود يقرؤها فحص المحتوى: نوع بند بلا توأم (كان «twin: () => null» في ثمانية أنواع، الفحص المستقل B)
  for name, rel, old, new, want in CODE:
    p = os.path.join(root, rel); keep = open(p, encoding='utf-8').read()
    if keep.count(old) != 1: check(False, 'طفرة الكود «%s»: النصّ يظهر %d مرة' % (name, keep.count(old))); continue
    open(p, 'w', encoding='utf-8').write(keep.replace(old, new)); rc, out = lint(root); open(p, 'w', encoding='utf-8').write(keep)
    hit = [l.strip() for l in out.splitlines() if want in l]
    check(rc == 1 and bool(hit), 'طفرة الكود «%s»: أخفق الفحص بالرسالة المقصودة %s' % (name, (hit or out.splitlines()[-3:])[:1]))
finally:
  shutil.rmtree(tmp, ignore_errors=True)

# ---------- 2) المتصفح ----------
RUNTIME = [
  ('حزمة الصوت لا تُحمَّل عند الفتح', 'VPACK.load().catch(() => {});', '', ['test/backup_voice_run.py', '{F}'], {}, 'FAIL voice: pack survives reopening'),
  ('zip المضغوط لا يُفكّ', 'else if (method === 8)', 'else if (method === 88)', ['test/backup_voice_run.py', '{F}'], {}, 'FAIL voice: four recordings imported'),
  ('النسخة تُقبل بلا فحص نوع القيمة', "if (!BACKUP_OK[backupKind(k)](v)) return { ok: false, why: 'badValue' };", '', ['test/backup_voice_run.py', '{F}'], {}, 'FAIL backup: rejected badval.json'),
  ('اسم الطفل في ملخّص النسخة بلا تهريب', "chk.kids.map(k => esc(k.name || 'بلا اسم')", "chk.kids.map(k => (k.name || 'بلا اسم')", ['test/backup_voice_run.py', '{F}'], {}, 'FAIL backup: a name with markup'),
  ('زرّا تحريك القطار لا يعملان', 'b.onclick = go;', 'b.onclick = null;', ['test/realtap_run.py', 'Pixel 5'], {'ONLY': 'm1.u3.d2'}, "('Pixel 5', 'm1.u3.d2:"),
  # الفحص المستقل B: اللمسة السريعة أثناء القفزة تُسقط، والطريق لا يكشف البلاطة التالية، و«أعد الجملة» يعيد العدد أو عرض المساعدة أو سؤال الخروج
  ('اللمسة أثناء القفزة تُسقط', 'if (busy) { if (pend.length < 6) pend.push(t.n); return; }', 'if (busy) return;', ['test/quicktap_run.py'], {}, 'FAIL Pixel 5: pr.1'),
  ('الطريق لا يكشف البلاطة التالية', 'nx = Math.max(0, Math.min(R.S.tiles.length - 1, to + dir));', 'nx = to;', ['test/quicktap_run.py'], {}, 'FAIL Pixel 5: البلاطة'),
  ('العدد يصير «آخر جملة»', 'if (!opt.keep && !opt.num && !opt.aside) lastLine', 'if (!opt.keep && !opt.aside) lastLine', ['test/replay_run.py'], {'SECTION': '8'}, 'FAIL لمس بلاطة'),
  ('عرض المساعدة يصير «آخر جملة»', "'gen.hintOffer.01', { ifIdle: true, free: true, aside: true }", "'gen.hintOffer.01', { ifIdle: true, free: true }", ['test/replay_run.py'], {'SECTION': '8'}, 'FAIL عرض المساعدة'),
  ('«نبقى» يعيد سؤال الخروج', 'lastLine = prev; replayLine();', 'replayLine();', ['test/replay_run.py'], {'SECTION': '8'}, 'FAIL «نبقى»'),
  ('لا علامة لبقية الفقاعة', "b.classList.toggle('saymore',", "b.classList.toggle('saymoreX',", ['test/replay_run.py'], {'SECTION': '8'}, 'FAIL iPhone SE: جملة أطول'),
]
def run(args, env, f):
  e = dict(os.environ, **env, FILE=f); r = subprocess.run(['python3'] + [a.replace('{F}', f) for a in args], cwd=ROOT, capture_output=True, text=True, env=e, timeout=1800)
  return r.returncode, r.stdout + r.stderr
src = open(DEV, encoding='utf-8').read(); tmpd = tempfile.mkdtemp(prefix='mutf_')
try:
  for args, env in dict.fromkeys((tuple(x[3]), tuple(sorted(x[4].items()))) for x in RUNTIME):   # كل فحص مرة على الأصل
    rc, out = run(list(args), dict(env), DEV); check(rc == 0, 'الأصل: %s %s ينجح %s' % (args[0], dict(env), out.strip().splitlines()[-1:]))
  for name, old, new, args, env, want in RUNTIME:
    n = src.count(old); f = os.path.join(tmpd, 'mut.dev.html')
    if n != 1: check(False, 'طفرة «%s»: النصّ يظهر %d مرة في نسخة الفحص (يجب مرة واحدة)' % (name, n)); continue
    open(f, 'w', encoding='utf-8').write(src.replace(old, new)); rc, out = run(args, env, f)
    hit = [l.strip() for l in out.splitlines() if want in l]
    check(rc == 1 and bool(hit), 'طفرة «%s»: أخفق %s بالرسالة المقصودة %s' % (name, args[0], (hit or out.strip().splitlines()[-2:])[:1]))
finally:
  shutil.rmtree(tmpd, ignore_errors=True)
print('FAILS:', len(FAILS)); sys.exit(1 if FAILS else 0)
