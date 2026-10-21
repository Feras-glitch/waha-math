#!/bin/sh
# مجموعة الفحص الكاملة للمحرّك v2 (بعد مراجعة الوحدتين، D216). من مجلد المشروع: sh test/run_all.sh [مجلد النتائج=test/out/all]
# تبني النسختين، ثم تشغّل: الفحص الدخاني لنسخة الأطفال، والمسارات خارج الدرس (الخروج والاستئناف، والاستراحة والبوابة، و«أرقامي»، والمعرض، واللوحة، والليلي)،
# ثم السائق الآلي على الدروس الاثني عشر بخمسة أنماط ومساري الحقيبة والجنسين. كل ملف نتائج ينتهي بسطور errors / LOG.errors / FAILS / small targets / NOT in script.
cd "$(dirname "$0")/.." || exit 1
O="${1:-test/out/all}"; mkdir -p "$O"
node build/build.mjs > "$O/build_prod.txt" 2>&1 || { echo "فشل البناء الإنتاجي"; cat "$O/build_prod.txt"; exit 1; }
node build/build.mjs --dev > "$O/build_dev.txt" 2>&1 || { echo "فشل بناء الفحص"; exit 1; }
python3 test/smoke_prod.py                         > "$O/smoke_prod.txt" 2>&1
python3 test/flows_run.py                          > "$O/flows.txt" 2>&1
SHOTS=1 python3 test/auto_run.py ok screen f       > "$O/auto_ok_screen_f.txt" 2>&1
SHOTS=0 python3 test/auto_run.py ok mat m          > "$O/auto_ok_mat_m.txt" 2>&1
SHOTS=0 python3 test/auto_run.py mixed screen m    > "$O/auto_mixed_screen_m.txt" 2>&1
SHOTS=0 python3 test/auto_run.py deep mat f        > "$O/auto_deep_mat_f.txt" 2>&1
SHOTS=0 python3 test/auto_run.py failmastery screen f > "$O/auto_failmastery_screen_f.txt" 2>&1
SHOTS=0 python3 test/auto_run.py failtest mat m    > "$O/auto_failtest_mat_m.txt" 2>&1
echo done > "$O/DONE"
