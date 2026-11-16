#!/usr/bin/env python3
# أداة الاستلام لـ«استوديو الواحة» (docs/مواصفة_استوديو_الواحة.md، القسم 7).
# تقرأ حزم العودة (*.wahareturn) من المعلّقين، وتفحصها، وتوحّد مستوى الصوت، وتحوّلها MP3، وتُخرج حزمة صوت يستوردها تطبيق الأطفال.
#
#   node build/build.mjs                                  (أولاً: الجدول الحالي dist/script_m1.json)
#   python3 tools/studio_import.py دفعة1.wahareturn دفعة2.wahareturn … [--out out/studio] [--flag المعرّف=ملاحظة …]
#
# الإخراج في --out (يتراكم بين التشغيلات):
#   voice/<الملف>.mp3       آخر تسجيل مقبول لكل ملف (الدفعة الأحدث تغلب)
#   حزمة_الصوت.zip          كل ما يطابق نصه الحالي، تستوردها لوحة الكبار في تطبيق الأطفال (D246)
#   redo.json               ما يجب إعادته: نصّ تغيّر بعد التسجيل، ومقطع تجاوز حده، وما علّمه المنسّق بـ --flag
#                           (يُعطى لـ: node build/studio.mjs pack … --redo out/studio/redo.json)
#   تقرير.md                ما وصل، والدفعات الناقصة، وما ينقص لكل درس
#   state.json              الدفعات المستلمة لكل مرسل، والبصمة التي سُجّل عليها كل ملف
import hashlib, json, os, re, shutil, struct, subprocess, sys, tempfile, zipfile, math, datetime
from array import array

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGET_LUFS = -16.0    # الدليل، القسم 7: −16 LUFS متكامل، موحّداً بين كل المعلّقين
PEAK = -1.5            # سقف ذروة العيّنات dBFS: هامش نصف ديسيبل تحت −1 dBTP، فالذروة الحقيقية بعد MP3 تبقى دونه في الغالب
PAD_MIN, PAD_MAX = 0.10, 0.20

def args():
  a = sys.argv[1:]; out = os.path.join(ROOT, 'out', 'studio'); flags = {}; files = []
  i = 0
  while i < len(a):
    if a[i] == '--out': out = a[i + 1]; i += 2
    elif a[i] == '--flag': k, _, v = a[i + 1].partition('='); flags[k.strip()] = v.strip() or 'علّمها المنسّق للإعادة'; i += 2
    else: files.append(a[i]); i += 1
  return files, out, flags

def text_hash(m, f): return hashlib.sha1((m + '\n' + (f or '')).encode('utf-8')).hexdigest()[:12]
MAX_SEC = {'m1': 8, 'm2': 10, 'm3': 12, 'm4': 15}

def current():
  p = os.path.join(ROOT, 'dist', 'script_m1.json')
  if not os.path.exists(p): sys.exit('لا dist/script_m1.json: شغّل node build/build.mjs أولاً')
  rows = {}
  for r in json.load(open(p, encoding='utf-8'))['rows']:
    f = None if r[6] == '(النص نفسه)' else r[6]; rid = r[4]; lesson = '.'.join(rid.split('.')[:3]) if rid.startswith('m1.') else None
    rows[rid] = {'m': r[5], 'f': f, 'hash': text_hash(r[5], f), 'files': [rid + '_m', rid + '_f'] if f is not None else [rid], 'lesson': lesson, 'label': r[1],
                 'max': MAX_SEC.get((lesson or 'm1')[:2], 8)}
  return rows

def ff(*a, inp=None):
  r = subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', *a], input=inp, capture_output=True)
  if r.returncode: raise RuntimeError(r.stderr.decode('utf-8', 'replace')[-300:])
  return r.stdout

def decode(path):   # إلى 48 kHz أحادي float32
  return array('f', ff('-i', path, '-ac', '1', '-ar', '48000', '-f', 'f32le', '-'))

def lufs_of(y):
  """الجهارة المتكاملة (ebur128). المقطع القصير يُكرَّر حتى 3 ثوانٍ على الأقل، فيُقاس كما يُقاس الكلام المتصل (وتكراره لا يغيّر جهارته)"""
  rep = max(1, math.ceil(3 * 48000 / max(1, len(y))))
  r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-f', 'f32le', '-ar', '48000', '-ac', '1', '-i', '-', '-af', 'ebur128', '-f', 'null', '-'], input=(y * rep).tobytes(), capture_output=True)
  m = re.findall(r'I:\s+(-?[\d.]+) LUFS', r.stderr.decode('utf-8', 'replace')); return float(m[-1]) if m else None

def process(src, dst):
  """يعيد (المدة، المستوى قبل، الكسب، LUFS بعد أو None)"""
  x = decode(src); sr = 48000; W = sr // 100; n = len(x) // W
  if n < 5: raise RuntimeError('مقطع فارغ')
  fr = []
  for k in range(n):
    s = 0.0
    for v in x[k * W:(k + 1) * W]: s += v * v
    fr.append(10 * math.log10(max(s / W, 1e-18)))
  noise = sorted(fr)[int(n * 0.1)]; thr = max(noise + 12, -50)
  sp = [k for k in range(n) if fr[k] > thr]
  if not sp: raise RuntimeError('لا كلام في المقطع')
  a, b = sp[0], sp[-1]
  lvl = 10 * math.log10(sum(10 ** (fr[k] / 10) for k in sp) / len(sp))
  # الصمت في الطرفين بين 100 و200 م.ث
  s0 = max(0, a * W - int(sr * PAD_MAX)); s1 = min(len(x), (b + 1) * W + int(sr * PAD_MAX))
  y = x[s0:s1]; lead = a * W - s0; trail = s1 - (b + 1) * W
  pre = array('f', [0.0]) * max(0, int(sr * PAD_MIN) - lead); post = array('f', [0.0]) * max(0, int(sr * PAD_MIN) - trail)
  y = pre + y + post
  peak = max(abs(v) for v in y) or 1e-9; L0 = lufs_of(y)
  gain = (TARGET_LUFS - L0) if L0 is not None and L0 > -70 else (-20.0 - lvl); gain = min(gain, PEAK - 20 * math.log10(peak))
  g = 10 ** (gain / 20)
  y = array('f', (v * g for v in y))
  ff('-f', 'f32le', '-ar', '48000', '-ac', '1', '-i', '-', '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '64k', dst, inp=y.tobytes())
  return round(len(y) / sr, 2), round(lvl, 1), round(gain, 1), lufs_of(decode(dst))

def main():
  files, out, flags = args()
  if not files and not flags: sys.exit(__doc__ or 'الاستعمال: python3 tools/studio_import.py دفعة.wahareturn …')
  rows = current(); byfile = {f: rid for rid, r in rows.items() for f in r['files']}
  os.makedirs(os.path.join(out, 'voice'), exist_ok=True)
  stp = os.path.join(out, 'state.json')
  state = json.load(open(stp, encoding='utf-8')) if os.path.exists(stp) else {'senders': {}, 'files': {}}
  log = {'batches': [], 'new': [], 'stale': [], 'unknown': [], 'long': [], 'checks': [], 'errors': [], 'lufs': []}
  for path in files:
    try: z = zipfile.ZipFile(path)
    except Exception as e: log['errors'].append([os.path.basename(path), 'ليس zip: %s' % e]); continue
    try: ret = json.loads(z.read('returns.json').decode('utf-8'))
    except Exception as e: log['errors'].append([os.path.basename(path), 'لا returns.json: %s' % e]); continue
    if ret.get('kind') != 'wahareturn': log['errors'].append([os.path.basename(path), 'ليست حزمة عودة']); continue
    snd = ret.get('sender') or {}; key = '%s|%s' % (snd.get('name'), snd.get('char')); seq = ret.get('seq')
    S = state['senders'].setdefault(key, {'seqs': [], 'agreedAt': snd.get('agreedAt'), 'guardian': snd.get('guardian'), 'credit': snd.get('credit')})
    dup = seq in S['seqs'] and not ret.get('all')
    if seq not in S['seqs']: S['seqs'].append(seq); S['seqs'].sort()
    log['batches'].append([snd.get('name'), snd.get('char'), seq, len(ret.get('items', [])), 'مكرّرة (لا يضر)' if dup else 'جديدة'])
    with tempfile.TemporaryDirectory() as td:
      for it in ret.get('items', []):
        fid = re.sub(r'\.(ogg|wav|opus|webm|m4a|mp3)$', '', it.get('file', ''))
        if not re.fullmatch(r'[\w.\-]+', fid) or fid not in byfile: log['unknown'].append([seq, it.get('file')]); continue
        rid = byfile[fid]; R = rows[rid]
        if it.get('hash') != R['hash']: log['stale'].append([fid, 'تغيّر النص بعد التسجيل']); continue
        old = state['files'].get(fid)
        if old and old.get('hash') == R['hash'] and old.get('at', '') >= it.get('at', ''): continue   # عندنا هذا التسجيل أو أحدث منه (دفعة مكرّرة)
        src = os.path.join(td, 'in'); open(src, 'wb').write(z.read(it['file']))
        try: dur, lvl, gain, lufs = process(src, os.path.join(out, 'voice', fid + '.mp3'))
        except Exception as e: log['errors'].append([fid, str(e)[:120]]); continue
        state['files'][fid] = {'hash': R['hash'], 'at': it.get('at'), 'by': snd.get('name'), 'seq': seq, 'dur': dur, 'level': lvl, 'gain': gain, 'lufs': lufs}
        log['new'].append(fid)
        if lufs is not None: log['lufs'].append(lufs)
        if dur > R['max'] + 0.5: log['long'].append([fid, dur, R['max']])
        if it.get('checks'): log['checks'].append([fid, ','.join(it['checks'])])
  # ما في الأرشيف ونصه تغيّر منذ تسجيله
  for fid, v in state['files'].items():
    rid = byfile.get(fid)
    if rid and v['hash'] != rows[rid]['hash'] and [fid, 'تغيّر النص بعد التسجيل'] not in log['stale']: log['stale'].append([fid, 'تغيّر النص بعد التسجيل'])
  json.dump(state, open(stp, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
  # حزمة الصوت: ما يطابق نصه الحالي فقط
  valid = sorted(f for f, v in state['files'].items() if f in byfile and v['hash'] == rows[byfile[f]]['hash'] and os.path.exists(os.path.join(out, 'voice', f + '.mp3')))
  pk = os.path.join(out, 'حزمة_الصوت.zip')
  with zipfile.ZipFile(pk + '.tmp', 'w', zipfile.ZIP_STORED) as zo:
    for f in valid: zo.write(os.path.join(out, 'voice', f + '.mp3'), f + '.mp3')
  os.replace(pk + '.tmp', pk)
  # المطلوب إعادته (بالمعرّف، كما يقرؤه build/studio.mjs pack --redo)
  redo = {}
  for fid, why in log['stale']: redo[byfile.get(fid, fid)] = why
  for fid, d, mx in log['long']: redo[byfile[fid]] = 'أطول من الحد (%s ث والحد %s)' % (d, mx)
  for rid, why in flags.items():
    if rid in rows: redo[rid] = why
    else: log['errors'].append([rid, '--flag لمعرّف غير موجود'])
  json.dump(redo, open(os.path.join(out, 'redo.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
  # الدفعات الناقصة لكل مرسل
  gaps = []
  for k, S in state['senders'].items():
    if S['seqs']:
      miss = [n for n in range(1, max(S['seqs']) + 1) if n not in S['seqs']]
      if miss: gaps.append([k.replace('|', ' / '), miss])
  # التقرير
  allfiles = {f: rid for f, rid in byfile.items()}; per = {}
  for f, rid in allfiles.items():
    L = rows[rid]['label']; d = per.setdefault(L, [0, 0]); d[1] += 1; d[0] += f in valid
  t = ['# تقرير استلام الاستوديو (%s)' % datetime.date.today().isoformat(), '',
       '- الدفعات في هذا التشغيل: %d، والملفات الجديدة: %d.' % (len(log['batches']), len(log['new'])),
       '- في حزمة الصوت الآن: **%d من %d** ملفاً.' % (len(valid), len(allfiles))]
  low = [f for f in log['new'] if state['files'][f]['lufs'] is not None and state['files'][f]['lufs'] < TARGET_LUFS - 2]
  if log['lufs']: t.append('- المستوى بعد التوحيد: متوسط %.1f LUFS، من %.1f إلى %.1f.' % (sum(log['lufs']) / len(log['lufs']), min(log['lufs']), max(log['lufs'])))
  sec = lambda h, xs, fmt: t.extend(['', '## ' + h, ''] + [fmt(x) for x in xs] if xs else [])
  sec('أخفض من −18 LUFS (ذروة عالية منعت رفع المستوى؛ تُسمع في التطبيق)', low, lambda x: '- `%s`: %.1f LUFS' % (x, state['files'][x]['lufs']))
  sec('الدفعات', log['batches'], lambda x: '- %s (%s) الدفعة %s: %d تسجيلاً، %s.' % (x[0], x[1], x[2], x[3], x[4]))
  sec('دفعات ناقصة', gaps, lambda x: '- %s: لم تصل الدفعات %s. اطلب إعادة إرسالها من «الإعدادات ← دفعات سابقة».' % (x[0], '، '.join(map(str, x[1]))))
  sec('مطلوب إعادتها', sorted(redo.items()), lambda x: '- `%s`: %s' % x)
  sec('تنبيهات المعلّق عند التسجيل', log['checks'], lambda x: '- `%s`: %s' % tuple(x))
  sec('أسماء لا تطابق الجدول (لم تُحفظ)', log['unknown'], lambda x: '- الدفعة %s: `%s`' % tuple(x))
  sec('أخطاء', log['errors'], lambda x: '- %s: %s' % tuple(x))
  t += ['', '## التقدم لكل درس', '', '| الدرس | مسجّل | المطلوب |', '|---|---|---|'] + ['| %s | %d | %d |' % (k, v[0], v[1]) for k, v in sorted(per.items())]
  open(os.path.join(out, 'تقرير.md'), 'w', encoding='utf-8').write('\n'.join(t) + '\n')
  print('\n'.join(t[:6])); print('التقرير:', os.path.join(out, 'تقرير.md')); print('حزمة الصوت:', pk, len(valid), 'ملفاً')
  return 1 if log['errors'] or log['unknown'] else 0

if __name__ == '__main__': sys.exit(main())
