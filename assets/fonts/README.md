# الخطّان المضمّنان (D232، D256)

تكتب هذا المجلد الأداة `tools/fonts/make_fonts.py` من ملفات Google Fonts الرسمية؛ لا يُحرَّر يدوياً.

| الملف | الخط | الدور | المصدر والترخيص |
|---|---|---|---|
| `WahaNaskh-Regular.woff`، `WahaNaskh-Bold.woff` | Waha Naskh (مقتطع من Scheherazade New) | القراءة (`--f`) | SIL Global، OFL 1.1 (`OFL_scheherazadenew.txt`). الاسم «Scheherazade» محجوز، فالمقتطَع باسم آخر |
| `BalooBhaijaan2.woff` | Baloo Bhaijaan 2، متغيّر الوزن 400–800 | العناوين والأزرار الكبيرة (`--fd`) | The Baloo 2 Project Authors (Ek Type)، OFL 1.1 (`OFL_baloobhaijaan2.txt`) |

و`fonts.json` يصف كل وجه والحروف التي يغطّيها، ويقرؤه البناء ليضمّن الخطوط ويفحص بها المحتوى.
