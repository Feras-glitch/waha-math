#!/bin/sh
# يشغّل كل أدوات الفحص على ملف واحد: sh test/run_all.sh <ملف html> <مجلد النتائج>
F="$1"; O="$2"; mkdir -p "$O"; cd "$(dirname "$0")"
export U1FILE="$F" AUDIT_DIR="$O"
python3 unit_run.py f            > "$O/unit_f.txt" 2>&1
python3 unit_run.py m            > "$O/unit_m.txt" 2>&1
python3 unit_run.py f failmastery > "$O/unit_f_failmastery.txt" 2>&1
python3 session_run.py           > "$O/session.txt" 2>&1
python3 ws_run.py                > "$O/ws.txt" 2>&1
python3 tts_run.py f             > "$O/tts_f.txt" 2>&1
echo done > "$O/DONE"
