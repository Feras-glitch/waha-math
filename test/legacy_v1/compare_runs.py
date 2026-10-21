# يلخّص نتائج run_all.sh لمجلدين (المرجع والبناء) في جدول واحد للمقارنة.
# الاستعمال: python3 test/compare_runs.py test/out/baseline_proto test/out/dev
import os, re, sys
A, B = sys.argv[1], sys.argv[2]
KEYS = [('unit_f', r'^(clips spoken.*|lessons run.*|lines \d+ \| unresolved.*|overflow.*)$'), ('unit_m', r'^(clips spoken.*|lessons run.*|lines \d+ \| unresolved.*|overflow.*)$'),
        ('unit_f_failmastery', r'^(after m1\.u1\.d1.*|clips spoken.*|lessons run.*|lines \d+ \| unresolved.*|overflow.*|loop limit.*|STUCK.*)$'),
        ('session', r'^(review stop.*|unit hosts.*|break .*|answered.*|wrong gate.*|lesson started.*|filters.*|panel direct.*|setting saved.*|talk cards.*|errors.*)$'),
        ('ws', r'^(migration.*|workshop stops.*|ws solved.*|designs \d+|hunt kinds.*|photos.*|signals.*|slow .*|clips.*|after add.*|current.*|youssef.*|back to.*|errors.*)$'),
        ('tts_f', r'^(clips spoken.*|lessons run.*|lines \d+ \| unresolved.*|overflow.*|TTS utterances.*|\s+CUT.*|.*Traceback.*)$')]
def norm(l): return re.sub(r"'at': \d+", "'at': T", re.sub(r'\d{13}', 'T', l))
rows = []
for f, rx in KEYS:
  la = [norm(l) for l in open(os.path.join(A, f + '.txt'), encoding='utf-8').read().split('\n') if re.match(rx, l)] if os.path.exists(os.path.join(A, f + '.txt')) else ['(لا ملف)']
  lb = [norm(l) for l in open(os.path.join(B, f + '.txt'), encoding='utf-8').read().split('\n') if re.match(rx, l)] if os.path.exists(os.path.join(B, f + '.txt')) else ['(لا ملف)']
  for i in range(max(len(la), len(lb))):
    a = la[i] if i < len(la) else '—'; b = lb[i] if i < len(lb) else '—'
    rows.append((f, a, b, '✓' if a == b else '✗'))
print('| الأداة | المرجع (proto) | البناء | = |'); print('|---|---|---|---|')
for f, a, b, ok in rows: print(f'| {f} | {a[:160]} | {b[:160] if ok == "✗" else "(نفسه)"} | {ok} |')
print('\nمتطابق:', sum(r[3] == '✓' for r in rows), 'من', len(rows))
