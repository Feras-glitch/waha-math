# فحص الميثاق على ملفات الوحدات (D234، D243): يُشغَّل قبل أي اعتماد
# python3 -I charter_lint.py [مجلد الوحدات]
import re, sys, os, glob
root = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '03_المناهج_والوحدات')
RULES = [
    # (الاسم، النمط، الاستثناء إن وُجد)
    ('D234 رقم عتبة في ملف وحدة (يحيل إلى المبدأ 3 ولا يكرّره)', r'\b80\s*%|\b85\s*%', r'المبدأ 3|D234|الرقم الواحد'),
    ('D233 مؤقّت ضاغط', r'تتسارع|كلما خمّن مبكراً|قبل انتهاء الوقت|\b\d+ ثانية', r'صامت|للمشرف|المؤقّت اختياري|D233'),
    ('D241 نفي شمول', r'لا نسمّي المربع مستطيلاً|ليس مستطيلاً|لا يُسمّى متساوي الساقين|المربع ليس مستطيل', r'D241|عُكس'),
    ('D243 إحالة إلى برهان غائب', r'يُبرهَن في U\d|البرهان في U\d', r'D242'),
    ('D235 منهج حساب خارجي', r'منسَّق مع منهج الحساب|منهج الحساب', r'D235|D208'),
]
bad = 0
for p in sorted(glob.glob(os.path.join(root, '*.md'))):
    s = open(p, encoding='utf-8').read()
    for i, line in enumerate(s.split('\n'), 1):
        for name, pat, exc in RULES:
            if re.search(pat, line) and not (exc and re.search(exc, line)):
                bad += 1; print(f'{os.path.basename(p)}:{i}: {name}: {line.strip()[:120]}')
print('violations', bad)
sys.exit(1 if bad else 0)
