# يفحص مفتاح التوقيع قبل البناء، ويقول بوضوح ما الخطأ إن وُجد، بلا طباعة أي سرّ (سجلّ التشغيل عامّ في مستودعٍ عام):
# هل يُفتح المخزن بكلمة سرّه كما هي، أو بعد حذف المسافات والأسطر الزائدة حولها؟ وهل فيه الاسم المستعار المطلوب؟
# الاستعمال: python3 platforms/tests/check_key.py <ملف المفتاح>   (والأسرار في البيئة: WAHA_KEYSTORE_PASSWORD وWAHA_KEY_ALIAS وWAHA_KEY_PASSWORD)
import os, subprocess, sys

ks = sys.argv[1]
pw = os.environ.get('WAHA_KEYSTORE_PASSWORD', '')
kp = os.environ.get('WAHA_KEY_PASSWORD', '')
alias = os.environ.get('WAHA_KEY_ALIAS', '')


def keytool(*a, **env):
    r = subprocess.run(['keytool', *a], env={**os.environ, **env}, capture_output=True, text=True)
    return r.returncode, (r.stdout + r.stderr)


facts = []
rc, out = keytool('-list', '-keystore', ks, '-storepass:env', 'KP', KP=pw.strip())
if rc != 0:
    low = out.lower()
    size = os.path.getsize(ks)
    if 'password' not in low:
        why = 'ملف المفتاح (%d بايت) ليس مخزناً صالحاً: WAHA_KEYSTORE_BASE64 ليس كل محتوى keystore-base64.txt' % size
    else:
        # أيّ سرٍّ آخر يفتح المخزن؟ (تبادلٌ بين الأسرار عند اللصق) — بلا طباعة قيمة
        other = [n for n, v in (('WAHA_KEY_PASSWORD', kp), ('WAHA_KEY_ALIAS', alias)) if v.strip() and keytool('-list', '-keystore', ks, '-storepass:env', 'KP', KP=v.strip())[0] == 0]
        why = ('كلمة سرّ المخزن في WAHA_KEYSTORE_PASSWORD غير صحيحة، والصحيحة هي قيمة %s: انسخوها إليه' % other[0]) if other else \
              ('ملف المفتاح (%d بايت) لا يُفتح بأيّ كلمة سرّ في الأسرار: إمّا WAHA_KEYSTORE_PASSWORD ليست محتوى password.txt، أو WAHA_KEYSTORE_BASE64 من ملف مفتاحٍ آخر. '
               'أعيدوا لصق الاثنين من ملفّي «مفتاح التوقيع» نفسه' % size)
    print('::error title=مفتاح التوقيع::%s.' % why)
    sys.exit(1)
names = [l.split(',')[0].strip() for l in out.splitlines() if 'PrivateKeyEntry' in l]
if pw != pw.strip():
    facts.append('في WAHA_KEYSTORE_PASSWORD مسافة أو سطر زائد حولها (تُحذف عند البناء)')
if alias.strip() not in names:
    print('::error title=مفتاح التوقيع::المخزن يُفتح، لكن الاسم المستعار في WAHA_KEY_ALIAS ليس فيه. الأسماء فيه: %s' % ', '.join(names))
    sys.exit(1)
# كلمة سرّ المفتاح نفسه: توقيع ملفٍ تجريبي بها
import tempfile, zipfile
jar = os.path.join(tempfile.mkdtemp(), 't.jar')
with zipfile.ZipFile(jar, 'w') as z:
    z.writestr('t.txt', 'waha')
r = subprocess.run(['jarsigner', '-keystore', ks, '-storepass:env', 'KP', '-keypass:env', 'KK', jar, alias.strip()],
                   env={**os.environ, 'KP': pw.strip(), 'KK': kp.strip()}, capture_output=True, text=True)
if r.returncode != 0:
    print('::error title=مفتاح التوقيع::المخزن يُفتح، لكن WAHA_KEY_PASSWORD لا يفتح المفتاح «%s». في مفتاح العائلة هي كلمة سرّ المخزن نفسها (password.txt).' % alias.strip())
    sys.exit(1)
print('::notice title=مفتاح التوقيع::المخزن يُفتح، والمفتاح «%s» فيه ويوقّع%s' % (alias.strip(), ('؛ ' + '؛ '.join(facts)) if facts else ''))
