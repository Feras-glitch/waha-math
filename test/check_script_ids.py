# يتأكد أن مجموعة معرّفات جدول التسجيل التي يولّدها البناء (dist/script_m1.xlsx.ids.json) تساوي ما ينتجه extract_script.py الأصلي على ملف مرجعي.
# الاستعمال: python3 test/check_script_ids.py [ملف مرجعي=/home/claude/proto/unit1.html]
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
ref = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/proto/unit1.html'
out = os.path.join(HERE, 'out', 'script_ref.xlsx'); os.makedirs(os.path.dirname(out), exist_ok=True)
subprocess.run([sys.executable, os.path.join(HERE, 'extract_script.py'), ref, out], check=True)
a = set(json.load(open(out + '.ids.json', encoding='utf-8'))); b = set(json.load(open(os.path.join(ROOT, 'dist', 'script_m1.xlsx.ids.json'), encoding='utf-8')))
print('المرجع:', len(a), '| البناء:', len(b), '| ناقص من البناء:', sorted(a - b), '| زائد في البناء:', sorted(b - a))
sys.exit(0 if a == b else 1)
