# يشغّل أمراً في البناء الآلي ويحفظ مخرجاته، فإن أخفق أظهر أهمّ سطوره «ملاحظاتِ خطأ» (annotations) في صفحة التشغيل،
# لأن سجلّ التشغيل الكامل لا يصل إليه من يتابع البناء من خارج GitHub أحياناً.
# الاستعمال: python3 platforms/tests/ci_run.py "<عنوان>" <الأمر…>
import re, subprocess, sys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

title, cmd = sys.argv[1], sys.argv[2:]
p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, shell=(len(cmd) == 1))
out = p.stdout.decode('utf-8', 'replace')
sys.stdout.write(out); sys.stdout.flush()
if p.returncode == 0:
    sys.exit(0)


def esc(s):
    return s.replace('%', '%25').replace('\r', '').replace('\n', '%0A')


lines = out.splitlines()
KEY = re.compile(r'(error[:\s]|ERROR|FAILURE|What went wrong|Exception|FAIL |Traceback|AAPT|cannot find symbol|not found|exit code)', re.I)
hits, seen = [], set()
for i, l in enumerate(lines):
    if KEY.search(l):
        a, b = max(0, i - 2), min(len(lines), i + 8)
        if any(k in seen for k in range(a, b)):
            continue
        seen.update(range(a, b))
        hits.append('\n'.join(lines[a:b]))
for h in hits[:8]:
    print('::error title=%s::%s' % (esc(title), esc(h[:3500])))
print('::error title=%s (آخر السجل)::%s' % (esc(title), esc('\n'.join(lines[-40:])[-3500:])))
sys.exit(p.returncode)
