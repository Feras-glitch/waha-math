#!/bin/sh
# مجموعة الفحص الكاملة للمحرّك v2 (بعد مراجعة الوحدتين، D216). من مجلد المشروع: sh test/run_all.sh [مجلد النتائج=test/out/all]
# تبني النسختين، ثم تشغّل: الفحص الدخاني لنسخة الأطفال، والمسارات خارج الدرس (الخروج والاستئناف، والاستراحة والبوابة، و«أرقامي»، والمعرض، واللوحة، والليلي، والأغطية على 320×568)،
# ووسوم أخطاء الفرز، و«أعد الجملة» (replay_run)، واللمس الحقيقي بالإصبع والفأرة (realtap_run)، وتخطيط الأشياء المبعثرة (layout_run)، وحزمة الصوت والنسخة الاحتياطية (backup_voice_run)، وفحص الفحوص بالطفرات (mutants_run، الدرس 98)، ثم السائق الآلي على الدروس التسعة عشر والورش الثلاث بسبعة أنماط ومساري الحقيبة والجنسين، والوضع الليلي، وشاشتين قصيرتين (360×640 و320×568)،
# ثم تقرير الجمل غير المنطوقة. كل ملف نتائج ينتهي بسطور errors / LOG.errors / FAILS / small targets / unnamed targets / tap conflicts / chaos leaks / font fallbacks (D256) / NOT in script.
# ولكل فحص حدّ زمني (timeout: نصف ساعة، والطفرات ساعة ونصف): الفحص الذي يتجمّد إخفاقٌ تراه الخلاصة لا توقّفٌ للمجموعة (بوابة S1-U4، الدرس 173).
# وتُشغَّل على ثلاثة أجزاء متتابعة حين يحدّ المشغّل زمن المهمة الواحدة (ساعتان؛ والمجموعة كلها نحو ساعتين ونصف منذ S1-U4):
#   PART=a (البناءان والفحوص المنفردة) ثم PART=m (المحتوى ونصف طفرات المتصفح) ثم PART=n (نصفها الثاني) ثم PART=b (أنماط السائق الأولى) ثم PART=c (deepall وremedialdeep والخلاصة)، بمجلد النتائج نفسه؛ وبلا PART كلها.
cd "$(dirname "$0")/.." || exit 1
O="${1:-test/out/all}"; P="${PART:-all}"; mkdir -p "$O/clips"
in_part() { [ "$P" = all ] || [ "$P" = "$1" ]; }
if in_part a; then
rm -f "$O/FAILED" "$O/DONE" "$O/SUMMARY.txt" "$O"/auto_*.txt "$O"/clips/*.json "$O/mutants.txt" "$O/mutants2.txt"
node build/build.mjs > "$O/build_prod.txt" 2>&1 || { echo "فشل البناء الإنتاجي"; cat "$O/build_prod.txt"; exit 1; }
node build/build.mjs --dev > "$O/build_dev.txt" 2>&1 || { echo "فشل بناء الفحص"; exit 1; }
timeout 1800 python3 test/smoke_prod.py                         > "$O/smoke_prod.txt" 2>&1    || echo smoke_prod >> "$O/FAILED"
timeout 1800 python3 test/flows_run.py                          > "$O/flows.txt" 2>&1         || echo flows >> "$O/FAILED"
timeout 1800 python3 test/sort_errors.py                        > "$O/sort_errors.txt" 2>&1   || echo sort_errors >> "$O/FAILED"   # D253 (4)
timeout 1800 python3 test/replay_run.py                         > "$O/replay.txt" 2>&1        || echo replay >> "$O/FAILED"   # «أعد الجملة»: بعد الخروج، وأثناء الجملة، وأثناء البطاقتين، وفي التعليل
timeout 1800 python3 test/realtap_run.py 'iPhone SE' 'Galaxy S5' 'Pixel 5' > "$O/realtap.txt" 2>&1 || echo realtap >> "$O/FAILED"   # اللمس الحقيقي بالإصبع في مركز كل هدف (D255)
MOUSE=1 timeout 1800 python3 test/realtap_run.py 'Pixel 5'      > "$O/realtap_mouse.txt" 2>&1 || echo realtap_mouse >> "$O/FAILED" # وبالفأرة
timeout 2700 python3 test/ws_tap_run.py 'iPhone SE' 'Pixel 5' 'Galaxy S5' > "$O/ws_tap.txt" 2>&1       || echo ws_tap >> "$O/FAILED"   # ألغاز الورشة باللمس: القطعة ثم ظلّها، بالترتيبين (الفحص المستقل B لبوابة S1-U4، D246)
timeout 1800 python3 test/layout_run.py                         > "$O/layout.txt" 2>&1        || echo layout >> "$O/FAILED"   # الأشياء المبعثرة: لا تراكب، ومركز كل شيء له، و«لمس واحد» لما تحت الإصبع (D255)
timeout 1800 python3 test/backup_voice_run.py                   > "$O/backup_voice.txt" 2>&1  || echo backup_voice >> "$O/FAILED"   # حزمة الصوت والنسخة الاحتياطية (D181، D246)
timeout 1800 python3 test/quicktap_run.py                       > "$O/quicktap.txt" 2>&1      || echo quicktap >> "$O/FAILED"   # اللمس السريع على طريق الأعداد (الفحص المستقل B)
timeout 1800 python3 test/items_run.py                          > "$O/items.txt" 2>&1         || echo items >> "$O/FAILED"   # كل بند يُقيَّم أو يُراجَع صحيحاً وخطأً، والطرق المرسومة (الفحص المستقل C)
timeout 1800 python3 test/ladder_run.py                         > "$O/ladder.txt" 2>&1        || echo ladder >> "$O/FAILED"   # الحلّ المشترك باقٍ في المحاولة الرابعة (D257(5)(و))
fi
if in_part m; then   # الطفرات على جزأين (بوابة S1-U4 بعد E: تجاوزت كلها ساعة ونصفاً): المحتوى والمولّد والكود ونصف طفرات المتصفح، ثم نصفها الثاني
[ -f "$O/FAILED" ] && sed -i '/^mutants$/d' "$O/FAILED"
MUT_PART=1 timeout 7000 python3 test/mutants_run.py             > "$O/mutants.txt" 2>&1       || echo mutants >> "$O/FAILED"   # كل فحص جديد يخفق على الخطأ القديم (الدرس 98)
fi
if in_part n; then
[ -f "$O/FAILED" ] && sed -i '/^mutants2$/d' "$O/FAILED"
MUT_PART=2 timeout 7000 python3 test/mutants_run.py             > "$O/mutants2.txt" 2>&1      || echo mutants2 >> "$O/FAILED"
fi
if in_part b; then
SHOTS=1 CLIPS_OUT="$O/clips/auto_ok_screen_f.json" timeout 1800 python3 test/auto_run.py ok screen f       > "$O/auto_ok_screen_f.txt" 2>&1
SHOTS=0 CLIPS_OUT="$O/clips/auto_ok_mat_m.json" timeout 1800 python3 test/auto_run.py ok mat m          > "$O/auto_ok_mat_m.txt" 2>&1
SHOTS=0 CLIPS_OUT="$O/clips/auto_mixed_screen_m.json" timeout 1800 python3 test/auto_run.py mixed screen m    > "$O/auto_mixed_screen_m.txt" 2>&1
SHOTS=0 CLIPS_OUT="$O/clips/auto_deep_mat_f.json" timeout 1800 python3 test/auto_run.py deep mat f        > "$O/auto_deep_mat_f.txt" 2>&1
SHOTS=0 CLIPS_OUT="$O/clips/auto_failmastery_screen_f.json" timeout 1800 python3 test/auto_run.py failmastery screen f > "$O/auto_failmastery_screen_f.txt" 2>&1
SHOTS=0 CLIPS_OUT="$O/clips/auto_failtest_mat_m.json" timeout 1800 python3 test/auto_run.py failtest mat m    > "$O/auto_failtest_mat_m.txt" 2>&1
SHOTS=0 CLIPS_OUT="$O/clips/auto_replay_screen_f.json" timeout 1800 python3 test/auto_run.py replay screen f   > "$O/auto_replay_screen_f.txt" 2>&1
SHOTS=0 CLIPS_OUT="$O/clips/auto_failreview_screen_m.json" timeout 1800 python3 test/auto_run.py failreview screen m > "$O/auto_failreview_screen_m.txt" 2>&1   # المبدأ 14
SHOTS=0 DARK=1 CLIPS_OUT="$O/clips/auto_dark_ok_mat_f.json" timeout 1800 python3 test/auto_run.py ok mat f   > "$O/auto_dark_ok_mat_f.txt" 2>&1            # الوضع الليلي
SHOTS=0 DEVICE='Galaxy S5' CLIPS_OUT="$O/clips/auto_s5_mixed_screen_m.json" timeout 1800 python3 test/auto_run.py mixed screen m > "$O/auto_s5_mixed_screen_m.txt" 2>&1   # 360×640
SHOTS=0 DEVICE='iPhone SE' CLIPS_OUT="$O/clips/auto_se_ok_screen_f.json" timeout 1800 python3 test/auto_run.py ok screen f > "$O/auto_se_ok_screen_f.txt" 2>&1        # 320×568، أضيق شاشة
fi
if in_part c; then
SHOTS=0 CLIPS_OUT="$O/clips/auto_deepall_screen_f.json" timeout 1800 python3 test/auto_run.py deepall screen f > "$O/auto_deepall_screen_f.txt" 2>&1   # كل بند بمساعدة حتى الكشف، ثم توأمه (الفحص المستقل B)
SHOTS=0 CHAL=1 CLIPS_OUT="$O/clips/auto_deepall_chal_mat_m.json" timeout 1800 python3 test/auto_run.py deepall mat m > "$O/auto_deepall_chal_mat_m.txt" 2>&1   # وفرع «التحدّي»
SHOTS=0 CLIPS_OUT="$O/clips/auto_remedialdeep_screen_m.json" timeout 1800 python3 test/auto_run.py remedialdeep screen m > "$O/auto_remedialdeep_screen_m.txt" 2>&1   # وبنود العلاج
SHOTS=0 DEVICE='iPhone SE' SEED=23 ONLY='m1.u3.d5,ws:m1.u3' CLIPS_OUT="$O/clips/auto_se_remedialdeep_d5ws.json" timeout 1800 python3 test/auto_run.py remedialdeep screen m > "$O/auto_se_remedialdeep_d5ws.txt" 2>&1   # أهداف اللمس حين تظهر الخيارات تحت المسرح على أضيق شاشة (الفحصان المستقلان C وD)
timeout 1800 python3 test/unspoken.py "$O/clips" > "$O/unspoken.txt" 2>&1   # جمل في جدول التسجيل لم تُنطق في أي تشغيل (تقرير لا يوقف)
# الخلاصة (الفحص المستقل الخامس: المجموعة كانت تتجاهل رموز الخروج): كل فحص يخرج بـ 1 مع الإخفاق يُسجَّل في FAILED، وعدّادات السائق الآلي كلها صفر
# (ومنها الدروس المتوقّفة والتي لم تنتهِ، وإلا «assessment misses» في أنماط الإخفاق المقصود)؛ فتُكتب SUMMARY.txt وتخرج المجموعة بـ 1 إن أخفق شيء
python3 - "$O" > "$O/SUMMARY.txt" <<'PY'
import sys, os, re, glob
O = sys.argv[1]; bad = [l.strip() for l in open(os.path.join(O, 'FAILED'))] if os.path.exists(os.path.join(O, 'FAILED')) else []
for f in sorted(glob.glob(os.path.join(O, 'auto_*.txt'))):
  t = open(f).read(); name = os.path.basename(f)
  for k in ['errors', 'LOG.errors', 'small targets', 'unnamed targets', 'tap conflicts', 'chaos leaks', 'font fallbacks', 'NOT in script', 'blocked lessons', 'lessons not done', 'empty drags', 'squeezed stages', 'twins missing', 'clipped texts', 'covered badges', 'keyless targets', 'mat distractors'] + ([] if re.search(r'_(fail[a-z]*|remedialdeep)_', name) else ['assessment misses']):   # النمط كلمة بين شرطتين في اسم الملف أينما كانت (auto_se_remedialdeep_…: كان الفحص يطلبها من أوله وحده)
    v = re.findall(r'(?:^|; )' + re.escape(k) + r': (\d+)', t, re.M)
    if not v: bad.append(f'{name}: {k} مفقود')
    elif any(int(x) for x in v): bad.append(f'{name}: {k} = {v}')
for m in ['mutants.txt', 'mutants2.txt']:   # وجزءا الطفرات تمّا (لا جزء مفقود ولا مقطوع)
  t = open(os.path.join(O, m)).read() if os.path.exists(os.path.join(O, m)) else ''
  if not re.search(r'^FAILS: 0$', t, re.M): bad.append(f'{m}: لم يتمّ أو أخفق')
u = os.path.join(O, 'unspoken.txt'); t = open(u).read() if os.path.exists(u) else ''; v = re.findall(r'^twin lines never spoken: (\d+)', t, re.M)   # كل توأم بلغه السائق (بوابة S1-U4)
if not v: bad.append('unspoken.txt: twin lines never spoken مفقود')
elif int(v[0]): bad.append(f'unspoken.txt: twin lines never spoken = {v[0]}')
print('FAILED:' if bad else 'كل الفحوص سليمة'); [print(' ', b) for b in bad]; sys.exit(1 if bad else 0)
PY
rc=$?
echo done > "$O/DONE"
exit $rc
fi
