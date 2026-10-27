# فحص آلي لبنود الإثراء قبل الدمج: البنية، والجواب الواحد، وكشف الجواب، والتكرار، وقيود المراحل
import json, re, sys, importlib.util, difflib
bank = json.load(open('/home/claude/enrich/bank.json', encoding='utf-8'))
def load(path):
    spec = importlib.util.spec_from_file_location('m', path); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m.C
def nk(s):
    s = re.sub(r'[ً-ْـ]', '', str(s)); s = s.replace('أ', 'ا').replace('إ', 'ا').replace('آ', 'ا').replace('ى', 'ي').replace('ة', 'ه')
    return re.sub(r'\s+', ' ', re.sub(r'[؟?.,،:؛!«»"()\-–—]', ' ', s)).strip()
DIG = str.maketrans('٠١٢٣٤٥٦٧٨٩', '0123456789')
def nums(t): return [float(x) for x in re.findall(r'\d+(?:\.\d+)?', str(t).translate(DIG).replace('٫', '.'))]
def stage(cid): return {'0': 1, '1': 2, '2': 2, '3': 3, '4': 4}[cid[1]]
ABS = ['دائماً', 'دائما', 'أبداً', 'أبدا', 'فقط', 'مستحيل', 'كل ']
def check(c):
    P = []; d = c['data']; cid = c['cid']; st = stage(cid)
    if c['op'] != 'add': P.append(('خطأ', 'العملية ليست add'))
    if cid not in bank: P.append(('خطأ', 'مفهوم غير موجود'))
    for k in ['kind', 'type', 'q', 'hint', 'steps', 'source']:
        if k not in d or d[k] in (None, '', []): P.append(('خطأ', f'حقل ناقص: {k}'))
    if d.get('kind') != 'فهم': P.append(('تنبيه', 'النوع ليس فهم'))
    steps = d.get('steps') or []
    if len(steps) < 2: P.append(('خطأ', 'الحل النموذجي أقل من خطوتين'))
    if d.get('type') == 'choice':
        cor = d.get('correct'); wr = d.get('wrongs') or []
        if not cor or len(wr) < 1: P.append(('خطأ', 'خيارات ناقصة'))
        if cor in wr: P.append(('خطأ', 'الصحيح بين الخاطئة'))
        if len(set(map(nk, wr + [cor]))) < len(wr) + 1: P.append(('خطأ', 'خيارات متطابقة'))
        if len(wr) < 2: P.append(('تنبيه', 'خياران فقط'))
        if wr and len(cor) > 1.5 * max(len(w) for w in wr): P.append(('تنبيه', 'الصحيح أطول بوضوح'))
        if any(a in w for w in wr for a in ABS) and not any(a in cor for a in ABS): P.append(('تنبيه', 'كلمة مطلقة في المشتّتات وحدها'))
        if nk(cor) and nk(cor) in nk(d.get('hint', '')): P.append(('تنبيه', 'التلميح يحوي الجواب'))
    elif d.get('type') == 'num':
        if not isinstance(d.get('ans'), (int, float)): P.append(('خطأ', 'الإجابة الرقمية ليست عدداً'))
    else: P.append(('خطأ', 'نوع غير معروف'))
    allt = ' '.join([d.get('q', ''), d.get('correct', '') or '', ' '.join(d.get('wrongs') or []), ' '.join(steps)])
    if st == 1 and any(n > 10 for n in nums(d.get('q', '') + ' ' + (d.get('correct') or '') + ' ' + ' '.join(d.get('wrongs') or []))): P.append(('تنبيه', 'م1: عدد أكبر من 10'))
    if st == 2 and re.search(r'\d[.٫]\d', allt.translate(DIG)): P.append(('خطأ', 'م2: عدد عشري (D25، D51)'))
    if st == 2 and re.search(r'\(\s*\d+\s*[،,]\s*\d+\s*\)', allt.translate(DIG)): P.append(('تنبيه', 'م2: زوج مرتب (مكانه م3)'))
    if st == 3 and (re.search(r'[−\-]\s?\d', d.get('q', '').translate(DIG)) or (d.get('type') == 'num' and d.get('ans', 0) < 0)): P.append(('خطأ', 'م3: عدد سالب (D83، D89)'))
    if st == 2 and 'متساوي الساقين' in allt: P.append(('تنبيه', 'م2: متساوي الساقين (قرار معلّق)'))
    # التكرار مع البنك وبين البنود الجديدة
    q = nk(d.get('q', ''))
    best = max([(difflib.SequenceMatcher(None, q, nk(x['q'])).ratio(), x['id']) for x in bank.get(cid, [])] or [(0, '')])
    if best[0] > 0.8: P.append(('خطأ', f'يشبه بنداً موجوداً {best[1]} ({best[0]:.2f})'))
    elif best[0] > 0.65: P.append(('تنبيه', f'قريب من {best[1]} ({best[0]:.2f})'))
    return P
if __name__ == '__main__':
    tot = {'خطأ': 0, 'تنبيه': 0}; rows = []
    for path in sys.argv[1:]:
        C = load(path); seen = {}
        for i, c in enumerate(C):
            P = check(c)
            k = (c['cid'], nk(c['data'].get('q', '')))
            if k in seen: P.append(('خطأ', f'مكرر داخل الملف مع البند {seen[k]}'))
            seen[k] = i
            for sev, msg in P: tot[sev] += 1; rows.append((path.split('/')[-1], i, c['cid'], sev, msg, c['data'].get('q', '')[:70]))
        per = {}
        for c in C: per[c['cid']] = per.get(c['cid'], 0) + 1
        mine = sorted({k for k in bank if any(k.startswith(p) for p in {c['cid'][:2] for c in C})})
        print(f"{path.split('/')[-1]}: {len(C)} بنداً، مفاهيم مغطاة {len(per)}، أقل من 2: {[k for k in per if per[k] < 2]}")
    for r in rows: print(' | '.join(map(str, r)))
    print('المجموع', tot)
