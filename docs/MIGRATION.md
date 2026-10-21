# خارطة الانتقال: ما بقي كوداً في الدروس، وكتالوج المشاهد المقترح

الحالة بعد الخطوتين 1–3 (D246): كل ما كان **جدولاً في ثوب كود** صار بيانات في `content/`، وبقي في JS ما يرسم ويحرّك ويتفاعل.
هذه الوثيقة تحصر الباقي درساً درساً، وتقترح كتالوج المشاهد الذي يحوّله إلى بيانات في الخطوة التالية (**لم يُنفَّذ بعد**).

## 1. ما صار بيانات (مرجع سريع)

| كان في JS | صار في |
|---|---|
| `PRAISE`, `PRAISE2`, `TEST_*`, `SOLVE`, `MS_*`, `NUM`, جمل الورشة والمعرض والمراجعة والاستراحة، والجمل العامة المكتوبة داخل الأدوات (`gen.hint.look`, `gen.chaos.*`…) | `content/strings/gen.json` |
| `BIN_NAMES` | `content/strings/labels.json` |
| `ERR` في كل درس + `ERRN` في لوحة الكبار | `content/errors.json` (سجلّ واحد: `label` + `explain`) |
| `UNITS`, `HOSTS`, `HUNT`, `WS` | `content/m1/uN/unit.json` |
| `title/icon`, `sort.bins/intro/practice/sets/remedial/msOk/praise`، نصوص `reason()`، `chaos`, `wrapLines`, مهمة البيت، `TALK`، `TEST/TEST2` مع `lessonOf/review/badgeLine/winLine/badgeName`، طلبات المتجر `RID` | `content/m1/uN/dN.json` |

الربط في `src/js/05_content.js`: `lesson(id, W => ({…}))` يدمج بيانات الدرس مع جزئه الإجرائي، و`mkRef` يحلّ أسماء المولّدات، و`errTable` يبني جدول الأخطاء من السجلّ.

## 2. ما بقي إجرائياً في كل درس

الأعمدة: ما تفعله الدالة، وأي نصوص ما زالت مكتوبة داخلها (تظهر في جدول التسجيل من JS لا من JSON).

### الوحدة 1 — صيّادو الأشكال (`src/js/50_lessons_u1.js`)

| الدرس | `hook` | `explore` | `worked` | `wrap` / أخرى | نصوص داخل JS |
|---|---|---|---|---|---|
| d1 الدائرة والمربع | سباق عربتين (عجلات دائرية/مربعة): توقّع باللمس ثم حركة السباق | `traceTool` على دائرة ومربع | 5 خطوات: عدّ الرؤوس بشارات، تدوير 45°، إعادة العدّ، أحجام وألوان، نقطة تدور على الدائرة | نافورة وبلاط؛ `recall` يُعدّل مربعاً مدوّراً؛ `showErr` يُعدّل/يرسم دائرة منقّطة | `hook.01–06`, `exp.01/03/04/05`, `wk.01–07`, `ms.recall` |
| d2 المثلث | سقف البيت: قطعتان، محاولة خاطئة تتأرجح ثم الصحيحة | `traceTool` مثلث + عدّ الأضلاع (`sides`) | 5: عدّ الأضلاع، قلب 180°، إعادة العدّ، أشكال متنوعة، أمثلة مضادة (منحنٍ/مفتوح) بعلامة ✕ | ثلاثة بيوت؛ `recall` يقلب مثلثاً | `hook.01–05`, `exp.01/sides/03`, `wk.01–07`, `ms.recall` |
| d3 المستطيل | بابان وزرافة: توقّع ثم مرور الزرافة | (أ) محاذاة عودين بالسحب ثم اختيار الأطول، (ب) `traceTool` مستطيل بألوان الأزواج | 4: مقارنة الضلعين بشريط، تدوير 90°، جملة، مستطيل مقابل مربع بعلامات التساوي | عمارة؛ `recall` شكلان ثابتان | `hook.01–05`, `exp.a1/a.demo/a2/a.no/a3/b1/sides/b3`, `wk.01–05`, `ms.recall` |
| d4 صيد الأشكال | أشياء مبعثرة (6 مولّدات) | تركيب بيت: قطع في صينية وأماكن منقّطة، لمس القطعة ثم المكان، تفسير لكل مكان (`SLOT`) | 3: مثلثان ← مربع، مربعان ← مستطيل، طبق مقابل كرة | حديقة الأشكال؛ `recall` أربعة أشكال | `hook.01–03`, `exp.01/pick/slot.*/03`, `wk.01–05`, `ms.recall` |
| d5 مراجعة وتحدٍّ | بلّورة تتأرجح | بطاقات مراجعة أربعة أشكال مع جملة لكل شكل | — | `badgeArt1` رسم الشارة | `hook.01–02`, `rv.circle/square/triangle/rect` |

### الوحدة 2 — عالم المجسّمات (`src/js/52_lessons_u2.js`، أدواتها في `51_scenes_u2.js`)

| الدرس | `hook` | `explore` | `worked` | `wrap` / أخرى | نصوص داخل JS |
|---|---|---|---|---|---|
| d1 المكعب والكرة | كيسان (`bagAt`) بمحتوى عشوائي: لمس، جملة الإحساس (`FEEL`)، اختيار بأيقونة، كشف | `pushLab` (كرة/مكعب) ثم `faceTouch` مكعب وكرة | 5: مكعب، إمالة، ورق مقابل مكعب، ورق مقابل كرة، كرة قدم وبرتقالة | ملعب (مكعبات وكرة)؛ `recall` | `hook.*`, `exp.push.*`, `exp.solid/face/face.after/sphere.touch/sphere.after`, `wk.01–06`, `ms.recall` |
| d2 الأسطوانة والمخروط | مخروط على الأرض: توقّع مستقيم/يدور، منظر علوي `rollTop` | أسطوانة نائمة تُلمس فتتدحرج، `pushLab` (واقفة/نائمة)، `faceTouch` وجها الأسطوانة (قلب) وقاعدة المخروط | 3: طبلة، إنامة، قبعة وقمع | خزّان ماء؛ `recall` | `hook.01–05`, `exp.cyl.*`, `exp.push.*`, `exp.cone.*`, `wk.01–04`, `ms.recall` |
| d3 مسطّح أم مجسّم | ورقة مرسومة: توقّع ثم `pushTest` | أربع جولات ختم (`stampTest`) بتوقّع | 2: `edgeTurn`، ثلاثي مسطّح/مجسّم | `build`: `towerBuilder` + عدّ + `mosqueScene`؛ برج في الختام؛ `recall` = `edgeTurn`؛ `kindOf` دالة | `hook.01–04`, `exp.stamp.*`, `wk.01–03`, `build.*`, `arch.*`, `ms.recall` |
| d4 مراجعة وتحدٍّ | مجسّمات تطفو | بطاقات مراجعة + `rv.flat` | — | `badgeArt2` | `hook.01–02`, `rv.*` |

### دوال التمرين التي ما زالت كوداً (قابلة للتحويل إلى جداول)

- `errorOf(item, bin)`: كلها شروط على `item.tag` / `item.kind` / `bin` ← قاعدة بيانات `when: {tag?, kind?, bin?} → tag` بالترتيب.
- `reason(item)`: شروط مماثلة ← `reasons: [{when, id}]` (النصوص صارت بيانات بالفعل).
- `twin(item)`: جدول `tag → maker` مع افتراضي ← بيانات مباشرة.
- `showErr`: ثلاثة أفعال فقط (`straighten`، دائرة منقّطة، لا شيء) ← `visual: straighten | dashedCircle` في `errors.json` (كما اقترح المراجع).
- `kindOf` (d3 فقط): `solid || ball → solid else flat` ← `kindOf: "solidOrFlat"` مسمّى.
- `recall`: مشهد قصير من نوعين (شكل يُعدَّل + جملة، أو شكلان ثابتان + جملة، أو `edgeTurn`) ← يدخل الكتالوج.

## 3. كتالوج المشاهد المقترح (للخطوة التالية — غير منفَّذ)

المبدأ: كل `hook/explore/worked/wrap/recall` يصير **قائمة خطوات** على مشهد من الكتالوج، وما لا يدخل الكتالوج (المسجد، البرج) يبقى كوداً في `src/scenes/` ويُستدعى **بالاسم** من البيانات.

### 3.1 الخطوات (مشتركة لكل المشاهد)

```yaml
- say:  {who: compass|chaos, id: hook.01, text: "…"}        # أو قائمة
- ask:  {id: hook.02, text: "…", choices: [a, b], log: predict, ok: a}   # لمس عناصر المشهد أو أزرار choosePick
- play: <اسم حركة يعرّفها المشهد>                           # مثل race, fit, pass, rotate:45, flip, stand
- wait: <حدث يعرّفه المشهد>                                  # مثل allFound, placed, touched:5, aligned
- badges: {points: corners|sides|[[x,y]…], color: --triangle}  # عدّ بشارات متتابعة
- next: {label: "…"}                                         # زر التالي داخل الخطوات (worked)
```

### 3.2 أنواع المشاهد

| النوع | يغطّي اليوم | خصائصه |
|---|---|---|
| `predictPick` | d1 سباق العربات، d2 السقف، d3 الزرافة، u2d2/u2d3 توقّع بأزرار | `objects: [{kind, label, at}]` أو `buttons`، `ok`, `reveal: <حركة>`، جمل الصواب/الخطأ |
| `trace` | d1, d2, d3(ب) | `shapes`, `sides: bool`, `pairColors`, `sidesIntro` |
| `compareAlign` | d3(أ) | عودان، سحب للمحاذاة، اختيار الأطول |
| `compose` | d4 | `slots`, `pieces`, تفسير لكل مكان |
| `showcase` | معظم خطوات `worked` و`recall` | `things: [{spec, x, y, label}]`, `marks: ticks|x`, `anim: fadeIn|slideTo` + جملة |
| `transform` | تدوير/قلب/إمالة/إنامة في `worked` و`recall` و`showErr` | `thing`, `op: rotate:45|flip|tilt|lie|stand`, `then: recount` |
| `overlayCompare` | d3 wk.01 | شريط يُطابق ضلعاً على آخر |
| `orbitDot` | d1 wk.07 | نقطة تدور على حافة |
| `scatter` | d4 hook, u2d4 hook, d5 hook | أشياء متناثرة أو تطفو |
| `reviewCards` | d5/u2d4 explore | `cards: [{spec, id, text}]` |
| `bagFeel` | u2d1 hook | `contents`, جمل الإحساس، اختيار بأيقونة |
| `pushLab` | u2d1, u2d2 | `rounds: [{spec, behave, ok, options, ask, after}]` (بياناتها جاهزة في الكود) |
| `faceTouch` | u2d1, u2d2 | `spec`, `faces`, `need`, `flip` |
| `topRoll` | u2d2 | `which: cone|cylinder`, `tapToRoll` |
| `stampLab` | u2d3 explore | `rounds: [{spec, print, ask, after}]` |
| `edgeTurn` | u2d3 wk.01 و`recall` | بلا خصائص |
| `tower` | u2d3 build | `goal`, جمل الكرة والمخروط، سؤال العدّ |
| `wrapBuild` | كل `wrap` | `pieces: [{spec|primitive, at, delay, anim}]` + `lines` (موجودة) |
| `badgeArt` | d5/u2d4 | `shapes`, `caption` |
| **مخصّص بالاسم** | `mosque` (u2d3)، وما يستجدّ | `scene: mosque` ← `src/scenes/mosque.js` |

التقدير: المشاهد المخصّصة في م1 ستكون 1 من ~45 مشهداً (< 5%)، والهدف أن تبقى أقل من 20% في م2–م4.

### 3.3 ترتيب التنفيذ المقترح

1. `errorOf/reason/twin/showErr/kindOf` ← جداول (أصغر خطوة، وتُفحص بـ `compare_structs.py`).
2. `recall` و`worked` ← `showcase`/`transform`/`badges` (أكثر الخطوات تكراراً).
3. `wrap` ← `wrapBuild`.
4. `explore` ← `trace`/`compose`/`pushLab`/`faceTouch`/`stampLab`.
5. `hook` ← `predictPick`/`bagFeel`/`scatter`.
6. عندها يصير ملف الدرس بيانات كاملة، ويُنقل مشهد المسجد إلى `src/scenes/`، **ثم** تُنقل الوحدة 3.

كل خطوة تُقبل بشرطين: `node build/build.mjs` يمرّ بلا مخالفة، و`test/run_all.sh` على نسخة `--dev` يعطي النتائج نفسها (الدروس التسعة، الجمل المنطوقة، الأخطاء المسجّلة).
