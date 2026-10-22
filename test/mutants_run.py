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
#   3) وقواعد الفحص المستقل C: الساكن قبل همزة الوصل، وجملة علاج الاختبار، وتوازن «فوق أم تحت؟»، وجملة الكشف، وحلّ «أيّ أمر اتّبع؟» بخطئه، وأسئلة المواد،
#      ومسألة الخريطة بخانتها، وجِدّة التوأم، والحلّ المشترك على مسرح محاولته (فحص المحتوى)؛ وفي المتصفح: كل بند يُقيَّم (items_run)، والحلّ المشترك
#      باقٍ في المحاولة الرابعة (ladder_run)، والطريق المرسوم لا يقطع قطعة (items_run).
#   4) وقواعد الفحص المستقل D: موضع الجواب في كل خيارات ثابتة الترتيب وفي المسار الرئيس للدرس، وجملة علاج تسمّي درساً بلا علامتي تنصيص، والتوأم لا يعيد
#      مسألة لعبة أو بند مساعدة في درسه، والكرسي للتقييم وحده، وحلقات «ضع في الخريطة»، و`together` بمعامل باسم آخر، وحلّ روبوت لا يبلغه بند (فحص المحتوى)؛
#      وفي المتصفح: الحلّ المشترك المرسوم موجود (لا باقٍ فقط)، وهالة اليد اليمنى عليها، وما في اليد مرفوع، والطريق لا يمرّ بقطعة منه قبل دورها،
#      و«أعد الجملة» يعيد حركة الروبوت.
#   5) وقواعد الفحص المستقل E: علاج «بقي كما هو» بقاءٌ خالص، والتوائم بمسار الطفل وتختلف فيه، وخطأ الجهة بانعطافة واحدة، وجملة حلّ «نعم/لا» وكلمة «آخر الطابور»،
#      و«ضع في الخريطة» بخانة الجواب، و`together` بمعامل مفكّك؛ وفي المتصفح: جملة اليسار، والهالة تحت ما في اليد، وشارات الأصابع، و«شاهد التجربة» قبلها،
#      والنجمة لا تبدأ في المطلوب، والمُضاف لا يلامس شيئاً، وزمن مناطق اللمس، وجدار الصندوق يمتصّ اللمس.
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
  # الفحص المستقل C للبوابة (الملف بمسار نسبي إلى content/m1/u3: الجمل العامة ووسوم الأخطاء ودروس الوحدات الأخرى)
  ('ساكن قبل همزة وصل', '../../strings/gen.json', lambda d: d['lines'].__setitem__('gen.solve.pos.on', gtext(d['lines']['gen.solve.pos.on']).replace('{أَكْمِلِ|', '{أَكْمِلْ|')), 'ساكن قبل همزة وصل في gen.solve.pos.on'),
  ('جملة علاج الاختبار لا تُحيل إلى الدرس الظاهر', 'd7.json', lambda d: d['lines'].__setitem__('ts.rem', 'نَلْعَبُ بِالحَرَكَةِ وَالأَغَانِي، ثُمَّ نُعِيدُ «غُرْفَةَ الدُّمَى» وَ«طَابُورَ القِطَارِ».'), 'لا تُحيل إلى «هذا الدرس»'),
  ('جملة علاج الاختبار تسمّي درساً', '../u1/d6.json', lambda d: d['lines'].__setitem__('ts.rem', 'نُعِيدُ «صَيْدَ الأَشْكَالِ» مَعَ الكِبَارِ بِأَشْيَاءَ مِنَ البَيْتِ، ثُمَّ نُرَاجِعُ هَذَا الدَّرْسَ.'), 'تسمّي الدرس «صيد الأشكال»'),
  ('«أين هو؟» جوابه أول الكلمتين في بنود المساعدة', 'd1.json', lambda d: (d['practice']['normal'][0].__setitem__('words', ['on', 'under']), d['lines'].__setitem__('pr.1', 'القِطَّةُ فَوْقَ الطَّاوِلَةِ، أَمْ تَحْتَهَا؟'),
     d['practice']['challenge'][0].__setitem__('words', ['in', 'on']), d['lines'].__setitem__('pr.c1', 'الدُّبُّ دَاخِلَ الصُّنْدُوقِ، أَمْ فَوْقَهُ؟'),
     d['practice']['normal'][0]['twin'].__setitem__('words', ['on', 'beside']), d['lines'].__setitem__('tw.on3', 'العُصْفُورُ فَوْقَ الشَّجَرَةِ، أَمْ بِجَانِبِهَا؟')), 'بالمساعدة: الجواب في الموضع 1'),
  # والمسار الرئيس للدرس (الفحص المستقل D، ص5: جواب د1 الكلمة الثانية في التمرين العادي والإتقان كلها)
  ('«أين هو؟» جوابه في الموضع نفسه في المسار الرئيس', 'd1.json', lambda d: (d['mastery']['concepts']['C010'][0].__setitem__('words', ['on', 'under']), d['lines'].__setitem__('ms.1', 'الدُّبُّ فَوْقَ الطَّاوِلَةِ، أَمْ تَحْتَهَا؟')), 'في كل بنود التمرين العادي والإتقان'),
  ('الخياران بغير ترتيب السؤال', 'd1.json', lambda d: d['practice']['normal'][0].__setitem__('words', ['on', 'under']), 'الخيارات تُقرأ بغير ترتيبها'),
  ('لا جملة كشف لموضع الطابور', '../../strings/gen.json', lambda d: d['lines'].pop('gen.reveal.pos.front'), 'جملة غير موجودة gen.reveal.pos.front'),
  ('حلّ «أيّ أمر اتّبع؟» لا يعرف الخطأ', 'd3.json', lambda d: d['practice']['challenge'][3]['opts'][1].__setitem__('err', 'rbSteps'), 'لا حلّ مشترك لخطئه «rbSteps»'),
  ('أسئلة الوسم كلها للمواد', '../../errors.json', lambda d: d['lrSwap'].__setitem__('mat', list(d['lrSwap']['q'])), 'لا سؤال له على الشاشة'),
  ('خانة المراجعة خانةُ الاكتشاف', 'd4.json', lambda d: d['review'][0]['mark'].__setitem__('cell', [2, 'front']), 'المسألة نفسها (map|find|2,front|floor)'),
  ('الصندوق مفتوح ومغلق معاً', 'd1.json', lambda d: d['flow'][3]['items'][1]['twin']['pic']['put'][1].__setitem__(1, 'on'), 'الصندوق فيه شيء «داخل» وشيء «فوق» معاً'),
  # الفحص المستقل D للبوابة
  ('جملة العلاج تسمّي درساً بلا علامتي تنصيص', 'd7.json', lambda d: d['lines'].__setitem__('ts.rem', 'نَمْشِي مَعَ الكِبَارِ عَلَى طَرِيقِ الأَعْدَادِ، ثُمَّ نُرَاجِعُ هَذَا الدَّرْسَ.'), 'تسمّي الدرس «طريق الأعداد»'),
  ('التوأم يعيد مسألة اللعبة', 'd3.json', lambda d: d['practice']['normal'][2]['twin'].__setitem__('prog', ['F', 'R', 'F']), 'يعيد مسألة game'),
  ('التوأم يعيد مسألة لعبة بمشهدها', 'd5.json', lambda d: d['practice']['normal'][2]['twin'].__setitem__('n', 15), 'يعيد مسألة game:roadCountChaos'),
  # الفحص المستقل E: علاج «بقي/تغيّر» كله بزيادة يمدح الخطأ الذي يعالجه
  ('علاج «بقي كما هو» كله بزيادة', '../u1/d4.json', lambda d: d['mastery']['remedial']['N002'][0].__setitem__('add', 1), 'كلها بزيادة'),
  ('توأما بندين في مسار واحد مسألة واحدة', 'd3.json', lambda d: next(x for x in d['practice']['normal'] if x['q'] == 'pr.3').__setitem__('twin', dict(next(x for st in d['flow'] if st.get('scene') == 'items' and st.get('mode') == 'practice' for x in st['items'] if x['q'] == 'gm.1')['twin'])), 'مسألة واحدة'),
  ('«أيّ أمر اتّبع؟» بخطأ الجهة وانعطافتين', 'd3.json', lambda d: d['practice']['challenge'][3]['twin'].__setitem__('prog', ['L', 'F', 'R']), 'لانعطافة واحدة'),
  ('«نعم/لا» بمساعدة بلا جملة حلّ', '../u2/d2.json', lambda d: next(x for x in d['practice']['normal'] if x.get('t') == 'yesno').pop('solve'), 'بلا جملة حلّ (solve)'),
  ('«في آخر الطابور» وكلمة حلّه «خلف»', 'd2.json', lambda d: next(x for x in d['practice']['normal'] if x.get('twin', {}).get('q') == 'tw.last')['twin'].pop('word'), "word 'last'"),
  ('الكرسي في توأم', 'd1.json', lambda d: d['practice']['normal'][0]['twin']['pic'].__setitem__('ref', 'chair'), 'الكرسي مرجع للتقييم وحده'),
  ('«في أيّ عربة؟» جوابه الزرّ الأوسط', 'd2.json', lambda d: (d['practice']['normal'][3].__setitem__('opts', [3, 4, 5]), d['mastery']['concepts']['N008'][1].__setitem__('opts', [6, 7, 8])), '«في أيّ عربة؟» كلها: الجواب في الموضع 2'),
  ('«ضع» في المراجعة جوابه حلقة جواب الإتقان', 'd4.json', lambda d: d['review'][1].update(lay=d['mastery']['concepts']['C012'][1]['lay'], want=d['mastery']['concepts']['C012'][1]['want']), 'حلقة جوابه (1,front)'),
  ('«بقي كما هو» جواب كل بنود الثبات', '../u1/d4.json', lambda d: d['practice']['challenge'][4].pop('add'), '«بقي كما هو/تغيّر» كلها'),
  ('التوأم يعيد مسألة الإشعال', 'd6.json', lambda d: d['practice']['challenge'][2]['twin'].update(n=8, b=11), 'يعيد مسألة hook:jumpChaosHook'),
  # S1-U4: القياس بشيئه ووحدته وعدده مسألة واحدة عدّاً ووضعاً وحكماً (الدرس 138)، والعدد المكتوب فوق العشرة من درسه، وسجلّات الرسم، والمقارنة الممكنة
  ('قياس الإتقان هو قياس التمرين بالوضع', '../u4/d3.json', lambda d: d['mastery']['concepts']['C016'][0].update(n=3), 'المسألة نفسها (meas|clip|3|key)'),
  ('عدد فوق العشرة مكتوب قبل درسه', '../u4/d4.json', lambda d: d['review'].append({'t': 'rodCount', 'q': 'pr.2', 'n': 13, 'c': 'D001'}), 'عدد فوق العشرة مكتوب قبل درس العشرة'),
  ('شيء يُقاس بلا رسم', '../u4/d3.json', lambda d: d['practice']['normal'][0].update(obj='pencil'), '«pencil» لا رسم له في HOUSE_DRAW'),
  ('ميزان بثقلين متساويين', '../u4/d2.json', lambda d: d['practice']['normal'][2].update(a='feather', b='leaf'), 'بثقل واحد'),
  ('دوائر أكبر من أماكنها', '../u4/d2.json', lambda d: d['practice']['normal'][1].update(vals=[22, 42, 14, 30]), 'أكبر من مكانه'),
  ('شريط يخرج من المسرح', '../u4/d1.json', lambda d: d['practice']['normal'][0].update(shift=[0, 200]), 'يخرج من المسرح'),
  ('مجموع تكوين العشرة فوق العشرين', '../u4/d7.json', lambda d: d['mastery']['concepts']['N012'][0].update(a=9, b=12), 'المجموع = 21'),
  ('طول على حدّ سلّتين', '../u4/d4.json', lambda d: d['practice']['normal'][0].update(len=96), 'على حدّ سلّتين'),
  ('عمودان أطول معاً', '../u4/d4.json', lambda d: d['practice']['normal'][1].update(counts=[5, 5, 2]), 'عمودان أطول معاً'),
  ('التعدّي بشيئين من سلّة واحدة', '../u4/d4.json', lambda d: d['flow'][2]['trans'].update(pair=['book', 'shoe']), 'يلزم شيء أطول من الشبر وشيء أقصر منه'),
  # وموضع الجواب في أنواع S1-U4 (امتداد الدرس 131): الأكثر في اليسار دائماً، والأطول أو الأقصر في الصفّ الأعلى في كل المسار الرئيس
  ('«أيّهما أكثر؟» والأكثر في اليسار دائماً', '../u4/d5.json', lambda d: [d['practice']['normal'][3].update(a=14, b=18), d['review'][1].update(a=12, b=16)], '«أيّهما أكثر؟» كلها: الجواب في الموضع 2'),
  ('الجواب في الصفّ الأعلى في كل المسار الرئيس', '../u4/d1.json', lambda d: [d['practice']['normal'][0].update(lens=[212, 176]), d['mastery']['concepts']['C014'][1].update(lens=[132, 172], shift=[64, 0])], 'في كل بنود التمرين العادي والإتقان'),
]
def gtext(v): return v[1] if isinstance(v, list) else v
CODE = [
  ('نوع بند يُسقط توأمه', 'src/js/43_items_place.js', "praise: () => 'praiseRoute', reason(item) { return item.why || null; }, twin(item) { return item.twin || null; },",
   "praise: () => 'praiseRoute', reason(item) { return item.why || null; }, twin: () => null,", 'نوع البند routePick بلا توأم'),
  # الفحص المستقل C: عدّ «أيّ عربة؟» على المسرح السابق ثم يُمحى، والكشف يقول «أكمل الآن»
  ('الحلّ المشترك على مسرح المحاولة السابقة (بمعامل باسم آخر)', 'src/js/43_items_place.js',
   "  async together() {},   /* في ask عند المحاولة الرابعة (tries >= 3) */\n  async reveal(item, r) { const m = await rowCount(r.ctx.R, item.k, item.g || 'f');",
   "  async together(item, q) { const m = await rowCount(q.ctx.R, item.k - 1, item.g || 'f'); await sleep(400); m.remove(); },\n  async reveal(item, r) { const m = await rowCount(r.ctx.R, item.k, item.g || 'f');", 'يرسم على مسرح المحاولة السابقة'),
  ('الحلّ المشترك على مسرح المحاولة السابقة (بمعامل مفكّك)', 'src/js/43_items_place.js',
   "  async together() {},   /* في ask عند المحاولة الرابعة (tries >= 3) */\n  async reveal(item, r) { const m = await rowCount(r.ctx.R, item.k, item.g || 'f');",
   "  async together(item, { ctx }) { const m = await rowCount(ctx.R, item.k - 1, item.g || 'f'); await sleep(400); m.remove(); },\n  async reveal(item, r) { const m = await rowCount(r.ctx.R, item.k, item.g || 'f');", 'يرسم على مسرح المحاولة السابقة'),
  ('جملة حلّ «أيّ أمر اتّبع؟» لخطأ لا يبلغه بند بمساعدة', 'src/js/43_items_place.js', "const RB_WATCH = { rbTurnSide: 'gen.rb.watchSide' };", "const RB_WATCH = { rbTurnSide: 'gen.rb.watchSide', rbOrder: 'gen.rb.watchSide' };", 'لا يبلغه بند بمساعدة'),
  # S1-U4 (الدرس 139): دالة لوحة المقاول باسم دالة لوحة الروبوت أبطلتها صامتاً فانهار S1-U3 د3
  ('دالة معرَّفة مرتين', 'src/js/24_measure.js', 'function barBoardAt(svg, cats, counts, opt = {}) {', 'function boardAt(svg, cats, counts, opt = {}) {', 'الدالة boardAt معرَّفة مرتين'),
  ('الكشف يقول «أكمل الآن»', 'src/js/43_items_place.js', "await S('gen.reveal.pos.' + item.ask); else await sleep(700); },", "await S('gen.solve.pos.' + item.ask); else await sleep(700); },", 'الكشف يقول جملة حلّ'),
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

# ---------- 2) المتصفح ----------   (CONTENT_ONLY=1: فحص المحتوى وطفراته وحدها، للتكرار السريع)
if os.environ.get('CONTENT_ONLY'): print('FAILS:', len(FAILS)); sys.exit(1 if FAILS else 0)
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
  # الفحص المستقل C: بطاقة «ينقص واحداً عن عشرين» واحد وعشرون (يتوقّف الدرس)، والحلّ المشترك يُمحى قبل الجواب، وطريق التوأم يقطع السرير
  ('بطاقة الطريق خارج الطريق', 'return o >= 0 && o <= (item.last || 20) ? o : item.n; };', 'return o; };', ['test/items_run.py'], {'ONLY': 'm1.u3.d6'}, 'gen.numw.21'),
  ('عدّ «أيّ عربة؟» يُمحى قبل أن يختار الطفل', 'if (tries >= 3) (item.k > 1 ? await rowCount(R, item.k - 1, g) : await rowFront(R, true)).dataset.help = 1;', 'if (tries >= 3) (item.k > 1 ? await rowCount(R, item.k - 1, g) : await rowFront(R, true)).remove();', ['test/ladder_run.py'], {'ONLY': 'm1.u3.d2'}, 'FAIL linePick'),
  ('لا حلّ مشترك أصلاً في «أيّ عربة؟»', 'if (tries >= 3) (item.k > 1 ? await rowCount(R, item.k - 1, g) : await rowFront(R, true)).dataset.help = 1;', '', ['test/ladder_run.py'], {'ONLY': 'm1.u3.d2'}, 'FAIL linePick'),
  ('ما في اليد على الأرض', "placeThingAt(svg, th, h.x + (side === 'R' ? 8 : -8), h.y + H * .7, { scale: sc });", "placeThingAt(svg, th, h.x, h.y + 24 + H0 * .3, { scale: .8 });", ['test/items_run.py'], {'ONLY': 'm1.u3.d4'}, 'على الأرض'),
  ('«أعد الجملة» لا يعيد حركة الروبوت', "{ intro: item.q, replayPre: () => RB.run(item.prog) }", "{ intro: item.q }", ['test/replay_run.py'], {'SECTION': '8'}, 'FAIL «أعد الجملة» في «أيّ أمر اتّبع'),
  ('سهم اليد اليمنى يُمحى قبل اللمس', "{ duration: 900 }).done; return g; }", "{ duration: 900 }).done; g.remove(); return g; }", ['test/ladder_run.py'], {'ONLY': 'm1.u3.d3'}, 'FAIL lrTap'),
  # الفحص المستقل D: هالة الحلّ المشترك على اليد الأخرى، والطريق يمرّ بقطعة منه قبل دورها (كان المنعطف داخلها فتُعفى)
  ('هالة الحلّ المشترك على اليد اليسرى', "const K = C.K, h = K.hand('R'), c = css('--compass');", "const K = C.K, h = K.hand('L'), c = css('--compass');", ['test/ladder_run.py'], {'ONLY': 'm1.u3.d3'}, 'FAIL lrTap: هالة'),
  ('الطريق يمرّ بقطعة منه قبل دورها', '"path":["bed","rug"]', '"path":["rug","bed"]', ['test/items_run.py'], {'ONLY': 'm1.u3.d7'}, 'قبل دوره'),
  # الفحص المستقل E: المُضاف في «بقي كما هو» يلامس شيئاً، و«خارج الاثنين» تبدأ النجمة خارجهما
  ('المُضاف يستقرّ عند ارتفاع ثابت', "const q = free.length ? free[R(0, free.length - 1)] : { x: 180 + R(-30, 30), y: 210 };", "const q = { x: 180 + R(-30, 30), y: 210 };", ['test/items_run.py'], {'ONLY': 'm1.u1.d4'}, 'شيئان يتلامسان'),
  ('«خارج الاثنين» والنجمة على الرفّ', "const tr = in0 ? { x: 140, y: 116 } :", "const tr = in0 ? trayAt(svg, 316, 44) :", ['test/items_run.py'], {'ONLY': 'm1.u3.d1'}, 'النجمة تبدأ في المنطقة المطلوبة'),
  ('مناطق اللمس تُحسب واحدةً واحدة', "const refreshPads = svg => { try { const rs = [...svg.querySelectorAll('rect.hit')]; if (!rs.length) return;",
   "const refreshPads = svg => { svg.querySelectorAll('rect.hit').forEach(sizePad); }; const refreshPads_ = svg => { try { const rs = [...svg.querySelectorAll('rect.hit')]; if (!rs.length) return;", ['test/items_run.py'], {'ONLY': 'm1.u1.d4'}, 'FAIL حساب مناطق اللمس'),
  ('جملة الحلّ المشترك عن اليمنى وإن طُلبت اليسرى', "await S(side === 'L' ? 'gen.lr.togetherL' : 'gen.lr.together');", "await S('gen.lr.together');", ['test/ladder_run.py'], {'ONLY': 'm1.u3.d3'}, 'FAIL اليمين واليسار'),
  ('الهالة فوق ما في اليد', "if (held && held.parentNode === svg) svg.insertBefore(g, held);", "", ['test/ladder_run.py'], {'ONLY': 'm1.u3.d3'}, 'FAIL ما في اليد فوق'),
  ('شارات الأصابع بارتفاع واحد', "y: t.y - (i % 2) * 30", "y: t.y", ['test/ladder_run.py'], {'ONLY': 'm1.u2.d5'}, 'FAIL شارات'),
  ('«شاهد التجربة» بعد التجربة', "if (tries >= 3) await S('gen.prop.together');\n    if (tries >= 2) await pushTest(svg, { ...item.it, size: Math.min(item.it.size || 110, 100), label: null }, item.want === 'roll' ? 'roll' : (item.it.solid === 'cube' || item.it.solid === 'box' ? 'tip' : 'stay'));", "if (tries >= 2) await pushTest(svg, { ...item.it, size: Math.min(item.it.size || 110, 100), label: null }, item.want === 'roll' ? 'roll' : (item.it.solid === 'cube' || item.it.solid === 'box' ? 'tip' : 'stay'));\n    if (tries >= 3) await S('gen.prop.together');", ['test/ladder_run.py'], {'ONLY': 'm1.u2.d1'}, 'FAIL «شاهد التجربة»'),
  ('جدار الصندوق بلا سطح يمتصّ اللمس', "if (P.C) { const fb = P.C.front.getBBox();", "if (false) { const fb = P.C.front.getBBox();", ['test/items_run.py'], {'ONLY': 'm1.u1.d4'}, 'FAIL لمسة على حافة جدار الصندوق'),
  # S1-U4: صفوف «كم؟» تتراكم فتضغط المسرح (الدرس 140)، والمكعبات المتماثلة تتنازع اللمس، ويد الحركة تُحسب رسماً يُمحى، ولا حلّ مرسوم في «لوّن صديقين»، ولا بديل لمس لسحب الشبر (D246)
  ('صفوف «كم؟» تتراكم تحت المسرح', 'if (a === ok) { SFX.good(); await sleep(FAST ? 20 : 350); np.box.remove(); return t; }', 'if (a === ok) { SFX.good(); return t; }',
   ['test/auto_run.py', 'ok', 'screen', 'f'], {'ONLY': 'm1.u4.d5', 'STRICT': '1', 'SHOTS': '0', 'OUT': 'test/out/mut_auto'}, 'rodFactory'),
  ('مكعبات الكومة تتنازع اللمس', "p.g.dataset.rodin = 1; p.g.dataset.twin = 'cube';", "p.g.dataset.rodin = 1;", ['test/auto_run.py', 'ok', 'screen', 'f'], {'ONLY': 'm1.u4.d5', 'STRICT': '1', 'SHOTS': '0', 'OUT': 'test/out/mut_auto'}, 'rodMaker num stolen'),
  ('يد الحركة رسمٌ يُمحى', "{ 'pointer-events': 'none', opacity: .85, 'data-step': 1 }", "{ 'pointer-events': 'none', opacity: .85 }", ['test/ladder_run.py'], {'ONLY': 'm1.u4.d5'}, 'FAIL teenTrace'),
  ('لا حلّ مرسوم في «لوّن صديقين»', 'if (i < pre) k.dataset.help = 1;', '', ['test/ladder_run.py'], {'ONLY': 'm1.u4.d6'}, 'FAIL framePaint'),
  ('سحب الشبر بلا بديل لمس', "else if (opt.tap) { t.align(); SFX.tick();", "else if (false) { t.align(); SFX.tick();", ['test/realtap_run.py', 'Pixel 5'], {'ONLY': 'm1.u4.d4'}, 'D246'),
  # والتوقّع الصحيح من الصورة بلا ميزان بعده (H11)، وبرج العدّ بلا عدد لمساته فلا يلمسه الفحص بالإصبع (كان يفترض صفّ الوحدات فتوقّف عند برج S1-U2)
  ('التوقّع من الصورة لا يُجرَّب', "if (!r.ctx.B) { r.ctx.T.forEach(t => t.g.remove()); const B = balanceAt(r.ctx.svg, 180, 276);", "if (false) { r.ctx.T.forEach(t => t.g.remove()); const B = balanceAt(r.ctx.svg, 180, 276);",
   ['test/items_run.py'], {'ONLY': 'm1.u4.d2'}, 'لا ميزان فيه الشيئان'),
  ('عود «قارن الطولين» بلا بديل لمس', "B.addEventListener('click', () => { if (d !== 'done' && Math.abs(x - 300) >= 18)", "B.addEventListener('click', () => { if (false && d !== 'done' && Math.abs(x - 300) >= 18)", ['test/realtap_run.py', 'Pixel 5'], {'ONLY': 'm1.u1.d3'}, 'D246'),
  # وعلى أضيق شاشة (320×568): البطاقات الثلاث تضغط مسرح التعليل، وصفّ المشابك ومربعات الإطار أصغر من الإصبع (بوابة S1-U4)
  ('بطاقات التعليل بحجمها على أضيق شاشة', ".choices.cards .card { font-size: 16px; line-height: 1.45; padding: 4px 8px; }", "", ['test/auto_run.py', 'ok', 'screen', 'f'], {'ONLY': 'm1.u4.d8', 'STRICT': '1', 'SHOTS': '0', 'DEVICE': 'iPhone SE', 'OUT': 'test/out/mut_auto'}, 'ts.8'),
  ('صفّ العدّ بلا منطقة 56', "hitPad(g, 0, 56);   /* 56 بكسلاً", "/* 56 بكسلاً", ['test/auto_run.py', 'ok', 'screen', 'f'], {'ONLY': 'm1.u4.d3', 'STRICT': '1', 'SHOTS': '0', 'DEVICE': 'iPhone SE', 'OUT': 'test/out/mut_auto'}, 'clipLay'),
  ('مربعات «لوّن صديقين» أصغر من الإصبع', "frameAt(svg, 180, 96, { cell: 70 })", "frameAt(svg, 180, 96, { cell: 58 })", ['test/auto_run.py', 'ok', 'screen', 'f'], {'ONLY': 'm1.u4.d6', 'STRICT': '1', 'SHOTS': '0', 'DEVICE': 'iPhone SE', 'OUT': 'test/out/mut_auto'}, 'm1.u4.d6:practice'),
  ("برج العدّ بلا عدد لمساته", "plain(G(labelText('countTower'))), 'data-tapcount': n }", "plain(G(labelText('countTower'))) }", ['test/realtap_run.py', 'Pixel 5'], {'ONLY': 'm1.u2.d5'}, 'tapCount: target not found'),
  ('طريق التوأم يقطع السرير', '{"k":"table","col":0,"row":"back"},{"k":"rug","col":2,"row":"front"},{"k":"bed","col":1,"row":"front"}',
   '{"k":"table","col":0,"row":"back"},{"k":"rug","col":2,"row":"front"},{"k":"bed","col":1,"row":"back"}', ['test/items_run.py'], {'ONLY': 'm1.u3.d7'}, 'يقطع bed'),
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
