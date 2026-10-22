# جمل في جدول التسجيل لم تُنطق في أي تشغيل للسائق الآلي (تقرير لا يوقف الفحص).
# python3 test/unspoken.py <مجلد ملفات clips/*.json التي يكتبها auto_run.py حين يُعطى CLIPS_OUT>
# الجملة غير المنطوقة إمّا مسار نادر لا يبلغه السائق (سؤال خطأ لوسم بعينه، أو صيغة مدح من بنك)، وإمّا جملة لا يستعملها الكود فتُحذف قبل التسجيل.
import json, os, sys, glob, collections, re
HERE = os.path.dirname(os.path.abspath(__file__))
d = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'out', 'all', 'clips')
ids = json.load(open(os.path.join(HERE, '..', 'dist', 'script_m1.xlsx.ids.json')))
spoken = set()
for f in glob.glob(os.path.join(d, '*.json')): spoken |= set(json.load(open(f)))
base = lambda i: re.sub(r'_[mf]$', '', i)
lines = sorted({base(i) for i in ids}); said = {base(i) for i in spoken}
never = [l for l in lines if l not in said]
fam = collections.Counter(re.sub(r'\.[^.]+$', '', l) for l in never)
print('runs: %d · lines: %d · spoken in some run: %d · never spoken: %d' % (len(glob.glob(os.path.join(d, '*.json'))), len(lines), len(lines) - len(never), len(never)))
for k, n in sorted(fam.items(), key=lambda x: (-x[1], x[0])): print('  %-40s %d' % (k, n))
print('--- القائمة'); [print(' ', l) for l in never]
