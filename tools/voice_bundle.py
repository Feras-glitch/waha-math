#!/usr/bin/env python3
# الأصوات المضمّنة (D274): من مستودع الأصوات الخاص (waha-math/voice) إلى مجلد voice/ بجانب صفحة كل نسخة.
# يدخل التطبيقَ ما اعتمده المنسّق (approved.json، يكتبه tools/studio_import.py --approve) ونصُّه الحالي هو الذي سُجّل عليه
# (بصمة state.json تطابق الجدول dist/script_m1.json)، والتسجيل المعتمد هو نفسه الأخير (at). وما سواه يقرؤه صوت الجهاز.
#
#   python3 tools/voice_bundle.py مستودع_الأصوات مجلد_نسخة [مجلد_نسخة …]
#   (وplatforms/make_platforms.py يستدعيه وحده إن وُجد مستودع الأصوات في voice-repo/ أو في WAHA_VOICE_REPO)
import hashlib, json, os, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def text_hash(m, f): return hashlib.sha1((m + '\n' + (f or '')).encode('utf-8')).hexdigest()[:12]

def current_files():
  """كل ملف صوتي يطلبه الجدول الحالي: المعرّف ← (البصمة، اسم الدرس)"""
  rows = json.load(open(os.path.join(ROOT, 'dist', 'script_m1.json'), encoding='utf-8'))['rows']; out = {}
  for r in rows:
    f = None if r[6] == '(النص نفسه)' else r[6]; h = text_hash(r[5], f)
    for fid in ([r[4] + '_m', r[4] + '_f'] if f is not None else [r[4]]): out[fid] = (h, r[1])
  return out

def select(repo):
  """يعيد (الملفات المختارة {المعرّف: المسار}، الإحصاء)"""
  st_p, ap_p = os.path.join(repo, 'state.json'), os.path.join(repo, 'approved.json')
  state = json.load(open(st_p, encoding='utf-8'))['files'] if os.path.exists(st_p) else {}
  appr = json.load(open(ap_p, encoding='utf-8')) if os.path.exists(ap_p) else {}
  cur = current_files(); chosen = {}; stale = unapproved = 0
  for fid, v in state.items():
    if fid not in cur: continue
    mp3 = os.path.join(repo, 'voice', fid + '.mp3')
    if not os.path.exists(mp3): continue
    if v.get('hash') != cur[fid][0]: stale += 1; continue
    a = appr.get(fid)
    if not a or a.get('at') != v.get('at') or a.get('hash') != v.get('hash'): unapproved += 1; continue
    chosen[fid] = mp3
  per = {}
  for fid, (h, label) in cur.items():
    d = per.setdefault(label, [0, 0]); d[1] += 1; d[0] += fid in chosen
  return chosen, {'total': len(cur), 'in': len(chosen), 'stale': stale, 'unapproved': unapproved, 'per': per}

def write(dest, chosen):
  vd = os.path.join(dest, 'voice'); shutil.rmtree(vd, ignore_errors=True); os.makedirs(vd)
  files = {}
  for fid, src in sorted(chosen.items()): shutil.copy2(src, os.path.join(vd, fid + '.mp3')); files[fid] = fid + '.mp3'
  js = 'window.WAHA_VOICE = ' + json.dumps({'v': 1, 'files': files}, ensure_ascii=False, separators=(',', ':')) + ';\n'
  open(os.path.join(vd, 'index.js'), 'w', encoding='utf-8').write(js)
  return sum(os.path.getsize(os.path.join(vd, f)) for f in os.listdir(vd))

def bundle(repo, dests, quiet=False):
  chosen, s = select(repo); size = 0
  for d in dests: size = write(d, chosen)
  lines = ['الأصوات المضمّنة: %d من %d ملفاً (%.1f ميغابايت)، وتنتظر الاعتماد %d، ونصّها تغيّر بعد تسجيلها %d.' % (s['in'], s['total'], size / 1048576, s['unapproved'], s['stale'])]
  if not quiet: print(lines[0])
  summ = os.environ.get('GITHUB_STEP_SUMMARY')
  if summ:
    with open(summ, 'a', encoding='utf-8') as f:
      f.write('### ' + lines[0] + '\n\n| الدرس | مضمّن | المطلوب |\n|---|---|---|\n')
      for k, v in sorted(s['per'].items()): f.write('| %s | %d | %d |\n' % (k, v[0], v[1]))
  return s

if __name__ == '__main__':
  if len(sys.argv) < 3: sys.exit('الاستعمال: python3 tools/voice_bundle.py مستودع_الأصوات مجلد_نسخة [مجلد_نسخة …]')
  bundle(sys.argv[1], sys.argv[2:])
