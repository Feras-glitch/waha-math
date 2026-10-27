# -*- coding: utf-8 -*-
"""
validate_bank.py — فاحص بنك الأسئلة الشامل (القرار D247، مراجعة فابل E §7)

الاستعمال:
    python3 -I validate_bank.py <bank.json> [--registry <REGISTRY.xlsx>] [--tag <out.json>] [--details <file.md>]

- يطبع جدولاً موجزاً (القاعدة ← عدد المخالفات) ويكتب ملف تفاصيل بجانب البنك:
  <bank>.validate_details.md (أو المسار المعطى بـ --details).
- يُنهي بالرمز 1 إذا خالف البنكُ قاعدةً من القواعد السبع الصلبة (H1–H7)، وإلا بالرمز 0.
- --tag <out.json>: يكتب نسخة من البنك بعد إضافة حقلَي `cog` و`level` حيث ينقصان (بالاستدلال الموثَّق أدناه)
  ولا يغيّر شيئاً آخر. في وضع الفحص العادي يُستدَلّ الحقلان في الذاكرة فقط (للقاعدة H6) ويُنبَّه إلى نقصهما في S18.

القواعد (E_bank §7) — صلبة توقف البناء:
 H1 بنية البند: id بنمط C\\d{3}-\\d{2} يطابق مفهومه؛ q وhint غير فارغين؛ steps ≥ 2؛ choice بمشتّتين على الأقل
    ولا خيار مكرر ولا صحيح بين المشتّتات؛ num بـ ans عددي وtol من {0، 0.05، 0.1}.
 H2 لا تشابه نصي ≥ 0.85 بين متني بندين في المفهوم نفسه (بعد التطبيع)، ولا ≥ 0.9 عبر مفهومين.
 H3 لا يزيد عدد البنود التي تشترك في الجواب نفسه (مطبَّعاً) داخل المفهوم على اثنين.
 H4 التلميح لا يحوي نص الجواب الصحيح (مطبَّعاً، بحدود الكلمات) ولا قيمة ans (بحدود الرقم).
 H5 محظورات المرحلة (تُفحص في q وcorrect وwrongs وhint وsteps):
    م1: حروف لاتينية، أرقام عشرية، «سم/سنتيمتر» (المسطرة تُدرَّس في م2: C182)، مجسّمات خارج D33
        (هرم، منشور، موشور، متوازي المستطيلات)، «الوحدة غير المعيارية»، الرموز ▲■●○◆★▼.
    م2: عشري، كسر أكبر من 1، «إحداثي»، «≅»، حروف لاتينية، «مقياس رسم».
    م3: عدد سالب، مقياس رسم غير 1 سم : 3 م (D110)، الرمز π (D95: يُكتب 3.14 بالكلمات).
    م4: حروف لاتينية خارج الأقواس (D190: الرمز اللاتيني بين قوسين عند أول ظهور فقط).
    يُستثنى البند الذي يحمل `charter_exception: "Dxxx"`.
 H6 كل مفهوم فيه بند R واحد على الأقل، وبندان A/S مستقلان على الأقل (لا يتشابهان ≥ 0.8 ولا يشتركان في الجواب).
    (لمفاهيم تحديد المستوى 4 بنود: يُفحص عند تمرير --placement <ملف معرّفات>، وإلا يُحصى في التفاصيل فقط.)
 H7 مفاهيم البنك ⊆ مفاهيم السجل (ورقة «المفاهيم»)، وكل مفهوم هندسي في السجل (معرّف C) موجود في البنك.
    (معرّفات N/F/D في السجل — مسارات الحساب والكسور والبيانات — لا بنود لها بعد، فتُحصى في التفاصيل ولا توقف البناء.)

تحذيرية (تُسجَّل وتُراجَع):
 S8  len(correct) > 1.25 × max(len(wrongs)) أو < 0.75 × min(len(wrongs)).
 S9  «لأن» أو رقم أو «؛» في الصحيح وحده دون أيّ مشتّت.
 S10 «دائماً/فقط/أبداً/كل» في المشتّتات: على مستوى المفهوم، إذا كان ≥ 3 خيارات تحمل مطلقاً وكانت نسبة المشتّتات منها > 60%.
 S11 نسبة الأجوبة التي تبدأ بـ«لا» في أسئلة «هل…؟» على مستوى المرحلة خارج 40–60%.
 S12 مشتّت يحوي كلمة من القائمة السوداء (لون/ملوّن/أحمر/أخضر/أزرق/أجمل/أسرع/أسهل/سحري/خفيف/ثقيل/بقلم/كل يوم)،
     ما لم تكن الكلمة نفسها في متن السؤال (أنماط الألوان وبنود المقارنة التي موضوعها اللون أو الثقل).
 S13 متن ينتهي بـ«؟» دون أداة استفهام (مبتور).
 S14 متن يحيل إلى شكل («أمامك»، «في الشكل»، «في الرسم») بلا svg.
 S15 حمل الكلمات في المتن فوق حدّ المرحلة (م1 15، م2 25، م3 30، م4 35).
 S16 kind «فهم» مع متن قصير (≤ 9 كلمات) يطابق ^(ما اسم|كم ضلعاً|كم رأساً|ما رمز|أيّ رمز).
 S17 أحمر وأخضر معاً في بند واحد.
 S18 اتساق الوسوم: `source` دون `enrich` أو العكس؛ وغياب `cog` أو `level` (صار `level` حقلاً عاماً منذ D247، فلا يُشترط معه enrich).
 S19 بند عددي يسأل عن مقدارين («كم … وكم …»).
 S20 تمييز العدد: بعد 3–10 يُنتظر الجمع، وبعد 11–99 المفرد المنصوب (متراً)؛ يُنبَّه إلى «\\d+ (ملّيمتر|سنتيمتر|متر|لتر|درجة)» بلا جمع ولا نصب.

استدلال المستوى المعرفي `cog` (محافظ؛ البنود الملتبسة تُدرَج في التفاصيل لمراجعة بشرية):
 S (استدلال/تعليل) إذا احتوى المتن أحد أنماط: لماذا، لِمَ، ما رأيك، المحقّ/محقّة، ما الخطأ/خطؤها، ما الصواب، صحيح أم خطأ،
   هل هذه العبارة، دائماً أم أحياناً أم أبداً، كيف نصحّح، كيف نكتشف/نتحقق/نتأكد، هل يمكن/يجوز/يجب/يكفي، علّل/فسّر، برهن؛
   أو كان سؤال «هل…؟» وجوابه الصحيح يحمل تعليلاً («لأن» أو «؛» أو «بل»).
 R (تعرّف/استدعاء) إذا كان kind «تعرّف» ولم يطابق S ولم يكن عددياً بعمليتين حسابيتين فأكثر في الحل (× ÷ + −)
   (تطبيق صيغة بعملية واحدة يُعدّ استدعاءً للصيغة)؛
   أو كان kind «فهم» بمتن ≤ 9 كلمات يطابق ^(ما اسم|كم ضلعاً|كم رأساً|كم وجهاً|كم محور|ما رمز|أيّ رمز|ما وحدة|أيّ وحدة|ماذا يعني|ما معنى|بأي أداة|أيّ أداة)؛
   أو كان عددياً من نوع «فهم» بمتن ≤ 9 كلمات وبلا عملية حسابية في الحل (عدّ أو حقيقة).
 A (تطبيق) ما عدا ذلك.
 ملتبس (يُدرَج للمراجعة): «تعرّف» طابق S؛ «فهم» طابق R؛ عددي «فهم» قصير بلا عملية (وُسم R)؛ سؤال «هل» بلا تعليل في جوابه (وُسم A)؛ عددي «فهم» طويل بلا عملية حسابية (وُسم A).
استدلال الصعوبة `level` حيث تنقص: R ← 🟢؛ S ← 🟠؛ A ← 🟡، وتصير 🟠 إذا كان الحل ≥ 3 خطوات أو فيه عمليتان حسابيتان فأكثر.
"""
import json, re, sys, os, difflib, collections

# ---------- أدوات التطبيع ----------
DIG = str.maketrans('٠١٢٣٤٥٦٧٨٩', '0123456789')
def nk(s):
    s = re.sub(r'[ً-ْـ]', '', str(s)).translate(DIG)
    s = s.replace('أ', 'ا').replace('إ', 'ا').replace('آ', 'ا').replace('ى', 'ي').replace('ة', 'ه')
    return re.sub(r'\s+', ' ', re.sub(r'[؟?.,،:؛!«»"()\-–—]', ' ', s)).strip()
def words(s): return [w for w in re.split(r'[\s،,:؛.؟?!«»()"]+', str(s)) if w]
STAGE_OVERRIDE = {}   # يُملأ من السجل عند تحميله (مرحلة السجل تغلب بادئة المعرّف، مثل C126 وC161 → 3)
def stage(cid):
    if cid in STAGE_OVERRIDE: return STAGE_OVERRIDE[cid]
    return {'0': 1, '1': 2, '2': 2, '3': 3, '4': 4}.get(cid[1], 0)
def ans_key(x): return nk(x['correct']) if x['type'] == 'choice' else nk(repr(x['ans']) if isinstance(x['ans'], float) and not float(x['ans']).is_integer() else str(int(x['ans'])) if isinstance(x['ans'], (int, float)) else x['ans'])
def texts(x): return [x.get('q', ''), x.get('correct', '') or ''] + list(x.get('wrongs') or []) + [x.get('hint', '')] + list(x.get('steps') or [])

# ---------- استدلال cog / level ----------
S_PAT = re.compile(r'لماذا|لِمَ|\bلمَ\b|ما رأيك|المحقّ|محقّ|محقة|محقّة|ما الخطأ|خطؤ|خطأها|ما الصواب|صحيح أم خطأ|صحيحة أم خاطئة|هل هذه العبارة|هل العبارة|دائماً أم أحياناً|كيف نصحّح|كيف نصحح|كيف نكتشف|كيف تكتشف|كيف نتحقق|كيف نتأكد|هل يمكن|هل يجوز|هل يجب|هل يكفي|علّل|فسّر|برهن|ما السبب|أيّ تعليل|ما الذي يثبت|ما الدليل')
R_PAT = re.compile(r'^(ما اسم|كم ضلعاً|كم رأساً|كم وجهاً|كم محور|ما رمز|أيّ رمز|أي رمز|ما وحدة|أيّ وحدة|أي وحدة|ماذا يعني|ما معنى|بأي أداة|بأيّ أداة|أيّ أداة|أي أداة)')
OPS = re.compile(r'[×÷+−]|\b\d+\s*[-]\s*\d+')
def infer_cog(x):
    """يعيد (cog, سبب_الالتباس أو None)."""
    q = x.get('q', ''); cor = x.get('correct', '') or ''
    hal = re.match(r'^(و|ف)?هل\b', q.strip()) or ' هل ' in q
    reasoned = any(k in cor for k in ('لأن', '؛', ' بل ', 'لأنه', 'لأنها'))
    if S_PAT.search(q) or (hal and x['type'] == 'choice' and reasoned):
        return 'S', ('تعرّف وُسم S' if x.get('kind') == 'تعرّف' else None)
    nops = len(OPS.findall(' '.join(x.get('steps') or [])))
    if x.get('kind') == 'تعرّف':
        if x['type'] == 'num' and nops >= 2: return 'A', None          # حساب من خطوتين فأكثر: تطبيق لا استدعاء
        return 'R', None
    if len(words(q)) <= 9 and R_PAT.match(q.strip()):
        return 'R', 'فهم وُسم R (متن استدعائي)'
    if x['type'] == 'num' and not nops and len(words(q)) <= 9:
        return 'R', 'عددي «فهم» قصير بلا عملية حسابية (وُسم R)'
    if hal and x['type'] == 'choice': return 'A', 'سؤال «هل» بلا تعليل في جوابه (A أم R؟)'
    if x['type'] == 'num' and not nops: return 'A', 'عددي بلا عملية حسابية في الحل (A أم R؟)'
    return 'A', None
def infer_level(x, cog):
    if x.get('level') in ('🟢', '🟡', '🟠'): return x['level']
    if cog == 'R': return '🟢'
    if cog == 'S': return '🟠'
    nops = len(OPS.findall(' '.join(x.get('steps') or [])))
    return '🟠' if (len(x.get('steps') or []) >= 3 or nops >= 2) else '🟡'

# ---------- القواعد ----------
HARD = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7']
NAMES = {'H1': 'بنية البند', 'H2': 'تشابه نصي (≥0.85 داخل المفهوم / ≥0.9 عبره)', 'H3': 'أكثر من بندين بالجواب نفسه في المفهوم',
         'H4': 'التلميح يحوي الجواب', 'H5': 'محظورات المرحلة', 'H6': 'تغطية R وA/S لكل مفهوم', 'H7': 'تطابق السجل والبنك',
         'S8': 'طول الصحيح خارج 0.75–1.25', 'S9': '«لأن»/رقم/«؛» في الصحيح وحده', 'S10': 'مطلقات في المشتّتات (مستوى المفهوم)',
         'S11': 'انحياز «لا» في أسئلة «هل» (مستوى المرحلة)', 'S12': 'مشتّت من القائمة السوداء', 'S13': 'متن مبتور بلا أداة استفهام',
         'S14': 'إحالة إلى شكل بلا svg', 'S15': 'حمل الكلمات فوق حدّ المرحلة', 'S16': 'kind «فهم» بمتن استدعائي', 'S17': 'أحمر وأخضر معاً',
         'S18': 'اتساق الوسوم (enrich/source/cog/level)', 'S19': 'بند عددي بمقدارين', 'S20': 'تمييز العدد'}
ABS = ['دائماً', 'دائما', 'فقط', 'أبداً', 'أبدا', 'كل ']
BLACK = ['لون', 'ملوّن', 'ملون', 'أحمر', 'أخضر', 'أزرق', 'أجمل', 'أسرع', 'أسهل', 'سحري', 'خفيف', 'ثقيل', 'بقلم', 'كل يوم']
INTERROG = set('ما ماذا لماذا لِمَ لمَ كم أيّ أي أيّهما أيهما أيّها أيها أيّهم هل كيف متى أين من بم بماذا فيم علام أكمل اختر احسب أوجد عدّ رتّب قارن صف سمّ'.split())
def has_interrog(q):
    for w in words(q):
        w0 = w.strip('ـ')
        cands = {w0}
        if w0[:1] in 'وف': cands.add(w0[1:])
        for c in list(cands):
            if c[:1] in 'بلك': cands.add(c[1:])
            if c.startswith('بـ') or c.startswith('لـ'): cands.add(c[2:])
        if cands & INTERROG: return True
    return False
LIMIT = {1: 15, 2: 25, 3: 30, 4: 35}
LATIN = re.compile(r'[A-Za-z]')
def strip_parens(t): return re.sub(r'\([^)]*\)', '', t)

def check_stage(cid, x):
    st = stage(cid); out = []
    if x.get('charter_exception'): return out
    T = texts(x); allt = ' '.join(T).translate(DIG)
    if st == 1:
        if LATIN.search(allt): out.append('حروف لاتينية (م1)')
        if re.search(r'\d[.٫]\d', allt): out.append('عدد عشري (م1)')
        if re.search(r'(^|[\s(])سم($|[\s).،:²³])|سنتيمتر', allt): out.append('«سم» قبل درس المسطرة (م1)')
        if re.search(r'(^|[\s،,.(«])(ال)?(هرم|منشور|موشور|متوازي المستطيلات)(ات|ان|ين|اً|ا)?($|[\s،,.؟)»])', allt): out.append('مجسّم خارج D33 (م1)')
        if 'الوحدة غير المعيارية' in allt or 'وحدة غير معيارية' in allt: out.append('«الوحدة غير المعيارية» (م1)')
        if re.search(r'[▲■●○◆★▼△□◇🔴🔵🟢🟡🟠🟣⬛⬜]', allt): out.append('رموز شكلية لا تُقرأ صوتياً (م1، D30)')
    elif st == 2:
        if re.search(r'\d[.٫]\d', allt): out.append('عدد عشري (م2)')
        for a, b in re.findall(r'(\d+)\s*/\s*(\d+)', allt):
            if int(b) and int(a) > int(b): out.append(f'كسر أكبر من 1: {a}/{b} (م2، D27)'); break
        if 'إحداثي' in allt or 'الإحداثي' in allt: out.append('«إحداثي» (م2)')
        if '≅' in allt: out.append('≅ (م2)')
        if LATIN.search(allt): out.append('حروف لاتينية (م2)')
        if re.search(r'مقياس (رسم|الرسم)', allt): out.append('مقياس رسم (م2)')
    elif st == 3:
        if re.search(r'(^|[\s(،,])[−-]\d', allt) or (x['type'] == 'num' and isinstance(x.get('ans'), (int, float)) and x['ans'] < 0): out.append('عدد سالب (م3، D83)')
        for m in re.finditer(r'1\s*سم\s*:\s*(\d+)\s*م\b', allt):
            if m.group(1) != '3': out.append(f'مقياس {m.group(0)} غير 1 سم : 3 م (D110)')
        if re.search(r'(\d+)\s*م\s*:\s*1\s*سم', allt): out.append('مقياس مكتوب معكوساً (D110)')
        if 'π' in allt: out.append('الرمز π (م3، D95)')
    elif st == 4:
        if LATIN.search(strip_parens(allt)): out.append('حروف لاتينية خارج الأقواس (م4، D190)')
    return out

def load_registry(path):
    try:
        import openpyxl
    except Exception:
        return None, 'openpyxl غير متاح'
    if not path or not os.path.exists(path): return None, f'ملف السجل غير موجود: {path}'
    wb = openpyxl.load_workbook(path, read_only=True); ws = wb['المفاهيم']
    rows = list(ws.iter_rows(values_only=True)); reg = {}
    for r in rows[1:]:
        if r and r[0]: reg[str(r[0]).strip()] = {'name': r[1], 'stage': r[2], 'status': r[3]}
    return reg, None

def validate(bank, registry=None, placement=None):
    V = collections.defaultdict(list)   # rule -> list of (where, msg)
    STAGE_OVERRIDE.clear()
    if registry:
        for cid, r in registry.items():
            try:
                st = int(str(r.get('stage')).strip().lstrip('م'))
                if cid.startswith('C') and st in (1, 2, 3, 4) and st != {'0': 1, '1': 2, '2': 2, '3': 3, '4': 4}.get(cid[1], 0): STAGE_OVERRIDE[cid] = st
            except Exception: pass
    items = [(cid, x) for cid, v in bank.items() for x in v]
    cog = {}; lvl = {}; amb = []
    for cid, x in items:
        c, why = infer_cog(x) if x.get('cog') not in ('R', 'A', 'S') else (x['cog'], None)
        cog[x['id']] = c; lvl[x['id']] = infer_level(x, c)
        if why and x.get('cog') not in ('R', 'A', 'S'): amb.append((x['id'], c, why, x['q']))
    # H1
    for cid, x in items:
        iid = x.get('id', '?'); P = []
        if not re.fullmatch(r'C\d{3}-\d{2}', str(iid)) or iid[:4] != cid: P.append('معرّف غير سليم')
        if not str(x.get('q', '')).strip(): P.append('متن فارغ')
        if not str(x.get('hint', '')).strip(): P.append('تلميح فارغ')
        st = x.get('steps')
        if not isinstance(st, list) or len([s for s in st if str(s).strip()]) < 2: P.append(f'خطوات الحل {len(st) if isinstance(st, list) else 0} (< 2)')
        if x.get('kind') not in ('تعرّف', 'فهم'): P.append('kind غير معروف')
        if x.get('type') == 'choice':
            cor = x.get('correct'); wr = x.get('wrongs') or []
            if not cor: P.append('لا جواب صحيح')
            if len(wr) < 2: P.append(f'مشتّتات {len(wr)} (< 2)')
            opts = [nk(o) for o in [cor] + list(wr) if o]
            if len(set(opts)) < len(opts): P.append('خيار مكرر أو الصحيح بين المشتّتات')
        elif x.get('type') == 'num':
            if not isinstance(x.get('ans'), (int, float)) or isinstance(x.get('ans'), bool): P.append('ans ليس عدداً')
            if x.get('tol') not in (0, 0.05, 0.1): P.append(f'tol={x.get("tol")} ليس من {{0، 0.05، 0.1}}')
        else: P.append('type غير معروف')
        for p in P: V['H1'].append((iid, p))
    # H2 (ومعها تشابه ≥0.8 داخل المفهوم لأجل H6)
    N = {x['id']: nk(x['q']) for _, x in items}; ids = [x['id'] for _, x in items]
    sim80 = collections.defaultdict(set)
    for i in range(len(ids)):
        a = ids[i]; na = N[a]
        for j in range(i + 1, len(ids)):
            b = ids[j]; nb = N[b]; same = a[:4] == b[:4]
            if abs(len(na) - len(nb)) > 0.3 * max(len(na), len(nb), 1): continue
            sm = difflib.SequenceMatcher(None, na, nb)
            if sm.real_quick_ratio() < 0.8 or sm.quick_ratio() < 0.8: continue
            r = sm.ratio()
            if same and r >= 0.8: sim80[a].add(b); sim80[b].add(a)
            if (same and r >= 0.85) or (not same and r >= 0.9): V['H2'].append((f'{a} ~ {b}', f'{r:.2f} {"داخل المفهوم" if same else "عبر المفاهيم"}'))
    # H3
    for cid, v in bank.items():
        cnt = collections.defaultdict(list)
        for x in v: cnt[ans_key(x)].append(x['id'])
        for k, l in cnt.items():
            if len(l) > 2: V['H3'].append((cid, f'«{k}» في {len(l)} بنود: {"، ".join(l)}'))
    # H4
    for cid, x in items:
        h = ' ' + nk(x.get('hint', '')) + ' '
        if x['type'] == 'choice':
            c = nk(x.get('correct', ''))
            if c and (' ' + c + ' ') in h: V['H4'].append((x['id'], f'التلميح يحوي «{x["correct"]}»'))
        else:
            a = x.get('ans')
            if isinstance(a, (int, float)):
                s = str(int(a)) if float(a).is_integer() else str(a)
                if re.search(r'(?<![\d.])' + re.escape(s) + r'(?![\d.])', str(x.get('hint', '')).translate(DIG)): V['H4'].append((x['id'], f'التلميح يحوي الجواب {s}'))
    # H5
    for cid, x in items:
        for p in check_stage(cid, x): V['H5'].append((x['id'], p))
    # H6
    few4 = []
    for cid, v in bank.items():
        R = [x for x in v if cog[x['id']] == 'R']; AS = [x for x in v if cog[x['id']] != 'R']
        # أكبر مجموعة مستقلة (جشعة): لا تشابه ≥0.8 ولا جواب مشترك
        indep = []; seen_ans = set()
        for x in AS:
            if ans_key(x) in seen_ans: continue
            if any(y['id'] in sim80[x['id']] for y in indep): continue
            indep.append(x); seen_ans.add(ans_key(x))
        if not R: V['H6'].append((cid, 'لا بند تعرّف (R)'))
        if len(indep) < 2: V['H6'].append((cid, f'بنود A/S مستقلة: {len(indep)} (< 2)'))
        if placement and cid in placement and len(indep) < 4: V['H6'].append((cid, f'مفهوم تحديد مستوى ببنود A/S مستقلة {len(indep)} (< 4)'))
        if len(indep) < 4: few4.append((cid, len(indep)))
    # H7
    reg_note = None
    if registry:
        for cid in bank:
            if cid not in registry: V['H7'].append((cid, 'مفهوم في البنك ليس في السجل'))
        for cid in registry:
            if cid.startswith('C') and cid not in bank: V['H7'].append((cid, 'مفهوم هندسي في السجل بلا بنود'))
        reg_note = [cid for cid in registry if not cid.startswith('C') and cid not in bank]
    # S8, S9, S12, S17 (على مستوى البند)
    for cid, x in items:
        if x['type'] == 'choice':
            cor = x['correct']; wr = list(x['wrongs'])
            if wr:
                if len(cor) > 1.25 * max(len(w) for w in wr): V['S8'].append((x['id'], f'الصحيح أطول: {len(cor)} مقابل {max(len(w) for w in wr)}'))
                elif len(cor) < 0.75 * min(len(w) for w in wr): V['S8'].append((x['id'], f'الصحيح أقصر: {len(cor)} مقابل {min(len(w) for w in wr)}'))
            for name, test in (('لأن', lambda t: 'لأن' in t), ('رقم', lambda t: bool(re.search(r'\d', t.translate(DIG)))), ('؛', lambda t: '؛' in t)):
                if test(cor) and not any(test(w) for w in wr): V['S9'].append((x['id'], f'«{name}» في الصحيح وحده'))
            for w in wr:
                hits = [k for k in BLACK if k in w and k not in x['q']]
                if hits: V['S12'].append((x['id'], f'«{w}» ({"، ".join(hits)})'))
        allt = ' '.join(texts(x))
        if 'أحمر' in allt and 'أخضر' in allt: V['S17'].append((x['id'], 'أحمر وأخضر معاً'))
    # S10 (مستوى المفهوم)
    for cid, v in bank.items():
        aw = ac = 0
        for x in v:
            if x['type'] != 'choice': continue
            aw += sum(1 for w in x['wrongs'] if any(a in w for a in ABS)); ac += 1 if any(a in x['correct'] for a in ABS) else 0
        if aw + ac >= 3 and aw / (aw + ac) > 0.6: V['S10'].append((cid, f'مطلقات: {aw} في المشتّتات مقابل {ac} في الصحيح'))
    # S11 (مستوى المرحلة)
    hal = collections.defaultdict(lambda: [0, 0])
    for cid, x in items:
        if x['type'] == 'choice' and re.match(r'^(و|ف)?هل\b', x['q'].strip()):
            hal[stage(cid)][0] += 1
            if re.match(r'^لا\b', x['correct'].strip()): hal[stage(cid)][1] += 1
    for st, (n, no) in sorted(hal.items()):
        if n >= 5 and not (0.4 <= no / n <= 0.6): V['S11'].append((f'م{st}', f'أسئلة «هل»: {n}، جوابها «لا…»: {no} ({100 * no // n}%)'))
    # S13–S16, S18–S20
    for cid, x in items:
        q = x['q'].strip(); st = stage(cid)
        if q.endswith('؟') and not has_interrog(q): V['S13'].append((x['id'], q[:60]))
        if re.search(r'في الشكل المرسوم|في الرسم|الشكل المجاور|الشكل المرسوم|المرسوم أدناه|أمامك (شكل|زاوية|رسم|مثلث|دائرة|مربع)|في الشكل[،:؟ ]', q) and not x.get('svg'): V['S14'].append((x['id'], q[:60]))
        if st in LIMIT and len(words(q)) > LIMIT[st]: V['S15'].append((x['id'], f'{len(words(q))} كلمة (الحدّ {LIMIT[st]})'))
        if x.get('kind') == 'فهم' and len(words(q)) <= 9 and re.match(r'^(ما اسم|كم ضلعاً|كم رأساً|ما رمز|أيّ رمز|أي رمز)', q): V['S16'].append((x['id'], q[:60]))
        if ('source' in x) != bool(x.get('enrich')): V['S18'].append((x['id'], 'source دون enrich' if 'source' in x else 'enrich دون source'))
        if x.get('cog') not in ('R', 'A', 'S'): V['S18'].append((x['id'], 'بلا cog'))
        if x.get('level') not in ('🟢', '🟡', '🟠'): V['S18'].append((x['id'], 'بلا level'))
        if x['type'] == 'num' and re.search(r'كم[^؟]*\bوكم\b', q): V['S19'].append((x['id'], q[:60]))
        for m in re.finditer(r'(\d+)\s+(ملّيمتر|مليمتر|سنتيمتر|متر|لتر|درجة)(?![اًةيو])', ' '.join(texts(x)).translate(DIG)):
            n = int(m.group(1)) % 100 if int(m.group(1)) >= 100 and int(m.group(1)) % 100 else int(m.group(1))
            if int(m.group(1)) >= 100 and int(m.group(1)) % 100 == 0: continue
            if 3 <= n <= 99: V['S20'].append((x['id'], m.group(0))); break
    return V, cog, lvl, amb, few4, reg_note

def main():
    args = sys.argv[1:]
    if not args or args[0].startswith('-'):
        print(__doc__); sys.exit(2)
    bank_path = args[0]; opts = {}
    i = 1
    while i < len(args):
        if args[i] in ('--registry', '--tag', '--details', '--placement') and i + 1 < len(args): opts[args[i]] = args[i + 1]; i += 2
        else: i += 1
    bank = json.load(open(bank_path, encoding='utf-8'))
    here = os.path.dirname(os.path.abspath(__file__))
    reg_path = opts.get('--registry') or os.path.normpath(os.path.join(here, '..', '..', '04_السجلات', 'REGISTRY_v2_سجل_المفاهيم_الحي.xlsx'))
    registry, reg_err = load_registry(reg_path)
    placement = None
    if opts.get('--placement'):
        placement = set(l.strip() for l in open(opts['--placement'], encoding='utf-8') if l.strip())
    V, cog, lvl, amb, few4, reg_note = validate(bank, registry, placement)
    if opts.get('--tag'):
        for cid, v in bank.items():
            for x in v:
                x.setdefault('cog', cog[x['id']]); x.setdefault('level', lvl[x['id']])
        json.dump(bank, open(opts['--tag'], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print('كُتبت نسخة موسومة:', opts['--tag'])
    n_items = sum(len(v) for v in bank.values())
    rows = [(r, NAMES[r], len(V.get(r, []))) for r in NAMES]
    hard_total = sum(len(V.get(r, [])) for r in HARD)
    w = max(len(n) for _, n, _ in rows)
    print(f'بنك: {bank_path} — {len(bank)} مفهوماً، {n_items} بنداً')
    print('| القاعدة | الوصف | العدد |'); print('|---|---|---|')
    for r, n, c in rows: print(f'| {r} | {n} | {c} |')
    print(f'\nمجموع المخالفات الصلبة: {hard_total} — ' + ('✅ نجاح' if hard_total == 0 else '❌ فشل'))
    cogc = collections.Counter(cog.values()); lvlc = collections.Counter(lvl.values())
    print(f'المستوى المعرفي: R {cogc["R"]} · A {cogc["A"]} · S {cogc["S"]} | الصعوبة: 🟢 {lvlc["🟢"]} · 🟡 {lvlc["🟡"]} · 🟠 {lvlc["🟠"]} | ملتبسة: {len(amb)}')
    if reg_err: print('تنبيه H7:', reg_err)
    details = opts.get('--details') or (bank_path + '.validate_details.md')
    L = [f'# تفاصيل فحص البنك — {os.path.basename(bank_path)}', '', f'{len(bank)} مفهوماً، {n_items} بنداً. مجموع المخالفات الصلبة: {hard_total}.', '',
         '| القاعدة | الوصف | العدد |', '|---|---|---|'] + [f'| {r} | {n} | {c} |' for r, n, c in rows] + ['']
    for r in NAMES:
        if V.get(r):
            L += [f'## {r} — {NAMES[r]} ({len(V[r])})', '', '| الموضع | التفصيل |', '|---|---|'] + [f'| {a} | {str(b).replace("|", "¦")} |' for a, b in V[r]] + ['']
    L += [f'## المستوى المعرفي والصعوبة', '', f'R {cogc["R"]} · A {cogc["A"]} · S {cogc["S"]} — 🟢 {lvlc["🟢"]} · 🟡 {lvlc["🟡"]} · 🟠 {lvlc["🟠"]}', '']
    if amb:
        L += [f'### بنود ملتبسة الوسم تحتاج مراجعة بشرية ({len(amb)})', '', '| المعرّف | الوسم المقترح | سبب الالتباس | المتن |', '|---|---|---|---|'] + [f'| {i} | {c} | {w} | {q[:80].replace("|", "¦")} |' for i, c, w, q in amb] + ['']
    L += [f'### مفاهيم ببنود A/S مستقلة أقل من 4 ({len(few4)})', '', '، '.join(f'{c} ({n})' for c, n in few4), '']
    if reg_note: L += [f'### معرّفات في السجل بلا بنود بعد (غير هندسية، لا توقف البناء): {len(reg_note)}', '', '، '.join(reg_note), '']
    if reg_err: L += [f'تنبيه H7: {reg_err}', '']
    open(details, 'w', encoding='utf-8').write('\n'.join(L))
    print('التفاصيل:', details)
    sys.exit(1 if hard_total else 0)

if __name__ == '__main__':
    main()
