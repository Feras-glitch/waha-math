// فحوص المحتوى (D246، D240): تُشغَّل قبل كل بناء وتوقفه عند أي مخالفة.
//  1) الجمل: نصّ غير فارغ، وصيغتا المخاطبة كاملتان، ولا أرقام مكتوبة في جملة منطوقة (العدد كلمةً، D229)، ولا معرّف بنصّين
//  2) JS: لا جملة منطوقة مكتوبة في الكود، ولا Math.random إلا بعلامة rng-ok، وكل gen.* وكل تسمية وكل وسم خطأ في الكود موجود في المحتوى
//  3) الدروس: كل معرّف جملة في بيانات الدرس موجود، وكل مولّد وكل نوع بند وكل مشهد معروف، ومراحل المسار مكتملة البيانات
//  4) D240: ما يُقيَّم لم يُعرض ولم يُحلّ في الدرس (build/d240.mjs)، ولكل مفهوم ثلاثة بنود منها إنتاج أو تعليل، ومشهد فوضى بخطأ واحد؛ وD239: اختيار في كل درس
//  5) D232: رأس HTML كامل ولا تحميل من الشبكة إلا رابط الخط غير الحاجب
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectClips, GEN_RX } from './clips.mjs';
import { d240, makerSigs, matNums } from './d240.mjs';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(p, 'utf8');
const AR = /[؀-ۿ]/;
const SKIP = new Set(['lines', 'labels', 'concepts', 'talk', 'title', 'adultCard', 'id', 'unit', 'icon', 'riddles']);
const REF_ONE = ['mk', 'show', 'shape'], REF_MANY = ['objs', 'opts', 'shapes', 'objects', 'things', 'items'];
const STAGES = new Set(['hook', 'explore', 'worked', 'practice', 'game', 'chaos', 'mastery', 'test', 'wrap']);

const KAF_OK = new Set(['ذلك', 'ذاك', 'هناك', 'تلك', 'أولئك', 'مشابك', 'مشبك', 'سمك', 'سلك', 'تفكيك']); const TA_OK = new Set(['تحت', 'بيت', 'وقت', 'صوت', 'اخت', 'بنت']);   /* أسماء إشارة وكلمات كافها من أصلها (4ب7 العامة) */
export function lint(content, js) {
  const errors = [], warn = [];
  /* كلمةٌ آخرها «كَ» خارج الصيغتين (4ب7 العامة): في الجمل والتسميات، والكلمة كل ما بين غير الحروف العربية وحركاتها (الفحص المستقل E2: نجت «قَلَمَكَ…» وتسميةٌ «صَدِيقِكَ») */
  /* و«ـكِ» خارج الصيغتين صيغة البنت وحدها، والكاف الأخيرة بلا حركة في كلمة مشكولة لا يُعرف لمن هي (الفحص المستقل E1 (13): نجت «شِبْرِك» و«شِبْرِكِ») */
  const kafCheck = (t, where) => { for (const w of String(t).replace(GEN_RX, ' ').split(/[^\u0621-\u064A\u064B-\u0652\u0640]+/)) {
      const m = /كَ[ّْ]?$/.test(w) ? 'بصيغة الولد وحدها (آخرها «كَ»' : /كِّ?$/.test(w) ? 'بصيغة البنت وحدها (آخرها «كِ»' : /ك$/.test(w) && /[\u064B-\u0652]/.test(w) ? 'كافها الأخيرة بلا حركة (لا يُعرف لمن هي' : '';
      if (!m) continue; const b0 = w.replace(/[\u064B-\u0652]/g, '').replace(/^[وف]?(?:[بلك](?=ال|ذ|ت))?(?:ال)?/, '');
      if (!KAF_OK.has(b0)) errors.push(`«${w}» ${m} خارج الصيغتين) في ${where}: {…كَ|…كِ}، أو اسمٌ كافُه من أصله يُضاف إلى KAF_OK`); }
    /* والماضي للمخاطَب «ـْتَ» (ومعه ضمير) خارج الصيغتين صيغة الولد وحدها (الفحص المستقل E1: نجت «رَأَيْتَهُ»)، إلا اسماً تاؤه من أصله («تَحْتَ») */
    /* وكذلك «ـْتِ» للبنت وحدها (الفحص المستقل F1 (8): لم تُفحص «قِسْتِهِ» ولا «أَنْتِ»، و«أَنْتَ» تمسكها الأولى) */
    for (const w of String(t).replace(GEN_RX, ' ').split(/[^\u0621-\u064A\u064B-\u0652\u0640]+/)) { const g = /ْتَ(?:هُ|هَا|هُمَا|هُمْ|نِي|نَا)?$/.test(w) ? 'الولد' : /ْتِ(?:هِ|هُ|هَا|هِمَا|هُمَا|هِمْ|هُمْ|نِي|نَا|يهِ|يهَا)?$/.test(w) ? 'البنت' : ''; if (!g) continue;
      const b0 = w.replace(/(?:هُ|هِ|هَا|هُمَا|هِمَا|هُمْ|هِمْ|نِي|نَا|يهِ|يهَا)$/, '').replace(/[\u064B-\u0652]/g, '').replace(/^[وف]?(?:[بلك](?=ال))?(?:ال)?/, '');
      if (!TA_OK.has(b0)) errors.push(`«${w}» بصيغة ${g} وحدها (ماضٍ للمخاطَب «ـْ${g === 'الولد' ? 'تَ' : 'تِ'}» أو ضميره خارج الصيغتين) في ${where}: {…تَ|…تِ}، أو اسمٌ تاؤه من أصله يُضاف إلى TA_OK`); } };
  /* وهمزة الوصل في أمر الثلاثي بحركة عين مضارعه: «اُرْسُمْ» و«اُحْكُمْ» (يَرْسُمُ، يَحْكُمُ)، و«اِلْمِسْ» (يَلْمِسُ ويَلْمُسُ؛ «يَلْمَسُ» لا تعرفه المعاجم). كانت «اِرْسُمْ» و«اِحْكُمْ»
     و«اِلْمَسْ» (ونَلْمَسُ ويَلْمَسُ) في نحو ألف جملة ولم يرها فحص. فكل كلمة تبدأ بهمزة وصل بعدها ساكن ثم حرف متحرّك تُقارَن بجدول WASL المراجَع بالمعجم (الحرفان
     ← حركة الثاني المسموحة، و* لاسمٍ يُعرب)، وهمزتها مضمومة إن كانت عينه مضمومة ومكسورة إن لم تكن؛ وما ليس في الجدول يُضاف بعد مراجعة المعجم */
  /* (والجدول كان بحرفي الكلمة الأوّلين، فنجت «اِكْتَبْ» و«اِنْقَلْ» و«اِخْتِرْ» (كت ونق وخت بحركتين لكلمتين)، و«اُسْمُعِ» و«اُبْنُ» (سم وبن للاسم بلا فحص)، ولا جدول
     للمضارع فنجت «تَكْبَرُ»: الفحصان المستقلان F1 (6)(7) وF2 (7).) فالجدول الآن بأطول بادئةٍ من هيكل الكلمة (أربعة أحرف على الأقل أو الكلمة كلها) في build/vowels.json،
     لكلمات همزة الوصل وللمضارع بنونه أو يائه أو تائه، و* لاسمٍ يُعرب (وهمزته مكسورة) */
  const VOW = JSON.parse(read(join(ROOT, 'build', 'vowels.json'))), VB = w => w.replace(/[\u064B-\u0652\u0640]/g, '');
  /* والاسم (*) بهيكله كاملاً أو بلواحق الإعراب والتثنية والجمع والضمير وحدها: «تحت» لـ«تَحْتَهُ»، لا لـ«تَحْتَرِقُ» (الفحص المستقل G1 (5): كان «*» القصير بادئةً
     لكلمة أطول ليست في الجدول، فنجت «اِسْمُحْ» و«نَبْعَدُ» و«تَحْتُرِقُ»). والمصدر بألفه بعد عينه (اِبْتِدَاء، اِنْتِهَاء، اِخْتِلَاف: الحرف الخامس ألف في كلمة من ستة
     فأكثر) يُطلب له مفتاح بخمسة أحرف على الأقل، فلا يجمعه مفتاحٌ واحد بفعله (نجت «اِبْتِدِئْ» تحت «ابتد: ِ» المأخوذ من «ابْتِدَاءً») */
  const VSUF = /^(?:ا|ان|ين|ون|ات|ي)?(?:ه|ها|هما|هم|هن|ك|كما|كم|كن|نا|ي)?$/, USED = { wasl: new Set(), pres: new Set(), af: new Set() };
  const vkey = (T, b, min = 4) => { let k = null; for (let n = 2; n <= b.length; n++) { const x = b.slice(0, n); if (Object.prototype.hasOwnProperty.call(T, x) && (T[x] === '*' ? VSUF.test(b.slice(n)) : n >= Math.min(min, b.length))) k = x; } return k; };
  const DEFECT = new Set(['اِبْنِ', 'أَمْلِ', 'اِمْشِ', 'حَاذِ', 'اِحْكِ', 'أَعْطِ', 'اِرْمِ', 'أَبْقِ']);   /* أمرٌ معتلّ الآخر: كسرته من بنائه لا لالتقاء الساكنين (بَنَى، أَمْلَى، مَشَى، حَاذَى، حَكَى، أَعْطَى، رَمَى، أَبْقَى) */
  const waslCheck = (t, where) => { const n0 = errors.length; for (const f of ['$1', '$2']) { const x = String(t).replace(GEN_RX, f);
      /* والكلمة بعد «ال» و«بِـ» و«كَـ» و«لِلْـ» كذلك (الفحص المستقل H1 (7أ): نجت «الأَطْوُلُ» و«الأَشْرَطَةَ» و«بِأَشْبُارِكَ»، ولم يُرَ «الاسْتِرَاحَة»)؛ والمصدر بألفه بعد
         عينه: اِفْتِعَال وانْفِعَال (الحرف الخامس) واسْتِفْعَال (السادس) بمفتاح يبلغ ألفه (H1 (7ج): نجت «اِسْتَعْمَالُ») */
      for (const m of x.matchAll(/(?<![\u0621-\u064A\u064B-\u0652])(?:[وف]َ?)?(?:(?:[بكل][َِ]?)?الِ?|لِلْ?|[بكل][َِ])?(ا([ُِ]?)([\u0621-\u064A])ْ([\u0621-\u064A])([َُِ])[\u0621-\u064A\u064B-\u0652\u0640]*)/g)) {   /* و«الِـ» بكسرة اللام و«لِـ» قبل همزة الوصل (الفحص المستقل I1 (6أ): نجت «الِاثْنُيْنِ» و«لِاسْتَرَاحَةٍ») */
        const [, w, h, c1, c2, v] = m, b = VB(w), mn = b.length >= 6 && b[4] === 'ا' ? 5 : b.length >= 7 && b.startsWith('است') && b[5] === 'ا' ? 6 : 4, k = vkey(VOW.wasl, b, mn), ok = k && VOW.wasl[k]; USED.wasl.add(k);
        if (!k) errors.push(`«${w}» في ${where}: كلمة بهمزة وصل ليست في جدول الحركة (build/vowels.json، wasl): تُراجَع حركتها في المعجم ثم تُضاف`);
        else if (ok !== '*' && !ok.includes(v)) errors.push(`«${w}» في ${where}: حركة «${c2}» غير ما في المعجم (${k}: ${c1}ْ${c2}${ok})`);
        else if (h && (h === 'ُ') !== (ok === 'ُ')) errors.push(`«${w}» في ${where}: همزة الوصل ${h === 'ُ' ? 'مضمومة وعينه غير مضمومة' : 'مكسورة وعينه مضمومة'} (اُفْعُلْ، اِفْعَلْ، اِفْعِلْ، والاسم بكسرها)`); }
      /* والمضارع بعد «لِ» و«فَلْ» كذلك (الفحص المستقل G1 (5): نجت «لِنَنْقِلَ» وأُمسكت «نَنْقِلُ») */
      for (const m of x.matchAll(/(?<![\u0621-\u064A\u064B-\u0652])(?:[وف]َ)?(?:لِ|لْ|لَ)?(?:سَ)?([نيت]َ([\u0621-\u064A])ْ([\u0621-\u064A])([َُِ])[\u0621-\u064A\u064B-\u0652\u0640]*)/g)) {
        const [, w, c1, c2, v] = m, b = VB(w), k = vkey(VOW.pres, b), ok = k && VOW.pres[k]; USED.pres.add(k);
        if (!k) errors.push(`«${w}» في ${where}: كلمة بوزن المضارع ليست في جدول الحركة (build/vowels.json، pres): تُراجَع حركة عينها في المعجم ثم تُضاف (والاسم بهذا الوزن، «نَجْمَانِ»، بـ«*»، ولا يُعفيه ذلك من عدّ المثنّى)`);
        else if (ok !== '*' && !ok.includes(v)) errors.push(`«${w}» في ${where}: حركة عين المضارع «${c2}» غير ما في المعجم (${k}: ${c1}ْ${c2}${ok})`); }
      /* ومضارع المتكلّم «أَفْعُلُ» بجدول المضارع نفسه (بنونه أو يائه أو تائه)، وما يشبهه وليس مضارعاً (أَفْعَلُ التفضيل واللون، وأَفْعَال وأَفْعِلَة الجمع، وأَفْعَلَ وأَفْعِلْ
         الرباعي، وأَنْتَ وأَيْنَ…) بجدول af وحركته؛ وما ليس في أحدهما لا يمرّ (الفحص المستقل G1 (5): نجت «سَأَدْفُعُهُمَا»). وفعلُ «سَأَلَ» ماضياً ليس «سَ» المستقبل */
      for (const m of x.matchAll(/(?<![\u0621-\u064A\u064B-\u0652])(?:(?:[وف]َ)?(?:لِ|لْ|لَ)?(?:سَ)?|(?:[وف]َ?)?(?:(?:[بكل][َِ]?)?ال|لِلْ?|[بك][َِ])?)(أَ([\u0621-\u064A])ْ([\u0621-\u064A])([َُِ])[\u0621-\u064A\u064B-\u0652\u0640]*)/g)) {
        if (/^(?:[وف]َ)?سَأَلْ(?:تَ|تِ|تُ|نَا|تُمْ|تُمَا|تُنَّ|نَ)/.test(m[0])) continue;
        const [, w, c1, c2, v] = m, b = VB(w), ka = vkey(VOW.af, b), kp = ka || /^(?:[وف]َ?)?(?:[بكل][َِ]?)?ال|^لِل/.test(m[0]) ? null : ['ن', 'ي', 'ت'].map(p => vkey(VOW.pres, p + b.slice(1))).find(Boolean); let ok = ka ? VOW.af[ka] : kp && VOW.pres[kp];
        if (ka) USED.af.add(ka); if (kp) USED.pres.add(kp);
        /* وفعل الرباعي واسم التفضيل بهيكل واحد (أَبْعِدْ وأَبْعَدَ وأَبْعَدُ): «IV» عينه مكسورة في الأمر (صيغة البنت منه بياء في زوجه) ومفتوحة في غيره (H1 (7ب): كان
           المفتاح يقبل الحركتين، فنجت «أَبْعِدْنَا» و«أَكْمِلْنَا») */
        /* وIVp: رباعيّ له مجرّدٌ شائع، فما لامُه مضمومة غير متبوعة بواو مضارعُ المتكلّم من المجرّد بحركة pres («أَدْخُلُ»، «أَخْرُجُ»)، وما سواه رباعيّ (الفحص المستقل
           J1 (6أ): كان IV وحده، فرُفض «أَدْخُلُ» برسالةٍ تقترح الفتح، وقُبل «أَدْخَلُ» الذي تقترحه) */
        if (ok === 'IVp') { const r3 = w.slice(6); if (r3[1] === '\u064F' && r3[2] !== 'و') { const kq = ['ن', 'ي', 'ت'].map(p => vkey(VOW.pres, p + b.slice(1))).find(Boolean); if (kq) USED.pres.add(kq); ok = kq ? VOW.pres[kq] : ''; } else ok = 'IV'; }
        if (ok === 'IV') { const pr = [...String(t).matchAll(/\{([^|{}]*)\|([^|{}]*)\}/g)].find(p => p[1].split(/\s+/).includes(w) || p[2].split(/\s+/).includes(w));
          /* صيغة البنت من الأمر هيكلُه وياءٌ ثم لاحقته نفسها («أَدْخِلِي»، «أَوْصِلِيهِمَا»، «أَبْعِدِينَا»)، والكلمتان متقابلتان بموضعهما في الزوج أيّاً كانت الكلمة منهما (الفحص
             المستقل I1 (6ج): كانت كلُّ صيغةٍ آخرها «ـِي» أمراً بأربعة ضمائر، فرُفض «أَوْصِلِيهِمَا» وكان «أَخْبَرْتِنِي» سيُقبل أمراً) */
          let M = '', F = ''; if (pr) { const A = pr[1].split(/\s+/), Bw = pr[2].split(/\s+/), i1 = A.indexOf(w); if (i1 >= 0) { M = w; F = Bw[i1] || ''; } else { F = w; M = A[Bw.indexOf(w)] || ''; } }
          const sb = x => String(x).replace(/[«»"()،.؟!:,؛\u064B-\u0652\u0640]/g, ''), Mb = sb(M), Fb = sb(F), impF = ['', 'ه', 'ها', 'هما', 'هم', 'هن', 'نا', 'ني'].some(sf => Mb.endsWith(sf) && Fb === Mb.slice(0, Mb.length - sf.length) + 'ي' + sf);
          const bare = w.replace(/[\u064B-\u0652\u0640]/g, ''), endImp = bare.length === 4 && /[ِْ]?$/.test(w) && !/[َُ]$/.test(w) && !/^(?:[وف]َ?)?(?:[بكل][َِ]?)?ال|^لِل/.test(m[0]);
          ok = (pr && impF) || (!pr && endImp && /^«|«[^»]*$/.test(String(t).slice(0, String(t).indexOf(w)))) ? 'ِ' : 'َ'; }   /* والأمر اسماً بين علامتي تنصيص («أَكْمِلِ الإِطَارَ») */
        if (!ka && !kp) errors.push(`«${w}» في ${where}: كلمة بوزن «أَفْعَلُ» ليست في جدول الحركة (build/vowels.json: af لغير المضارع، وpres لمضارع المتكلّم بنونه): تُراجَع في المعجم ثم تُضاف`);
        else if (ok !== '*' && !ok.includes(v)) errors.push(`«${w}» في ${where}: حركة «${c2}» غير ما في المعجم (${ka || kp}: ${c1}ْ${c2}${ok})`); } }
    for (const m of String(t).matchAll(/[أنيت]َلْمَسُ?\S*/g)) errors.push(`«${m[0]}» في ${where}: مضارع «لَمَسَ» يَلْمِسُ ويَلْمُسُ («يَلْمَسُ» لا تعرفه المعاجم)`);
    const mine = errors.splice(n0); errors.push(...new Set(mine)); };   /* والكلمة في الصيغتين تُذكر مرة */
  for (const [k, v] of Object.entries((content.labels && content.labels.ui) || {})) { kafCheck(v, 'التسمية ' + k); waslCheck(v, 'التسمية ' + k); }
  for (const u of content.units) for (const l of u.lessons) for (const [k, v] of Object.entries(l.labels || {})) { kafCheck(v, `${l.id}: التسمية ${k}`); waslCheck(v, `${l.id}: التسمية ${k}`); }
  /* وعناوين الدروس والوحدات تُرى مشكولة (كان مفتاح «أوجه» من عنوان درسٍ لا يفحصه شيء) */
  for (const u of content.units) { if (u.title) { kafCheck(u.title, `${u.id}: العنوان`); waslCheck(u.title, `${u.id}: العنوان`); } for (const l of u.lessons) if (l.title) { kafCheck(l.title, `${l.id}: العنوان`); waslCheck(l.title, `${l.id}: العنوان`); } }
  const { clips, problems } = collectClips(content); for (const p of problems) errors.push(p.join(' | '));
  const LINES = new Map(clips.map(c => [c.full, c]));
  // 1) الجمل
  for (const c of clips) {
    if (!String(c.text).trim()) errors.push('نصّ فارغ: ' + c.full);
    for (const m of c.text.matchAll(GEN_RX)) if (!m[1].trim() || !m[2].trim()) errors.push(`صيغة مخاطبة ناقصة في ${c.full}: ${m[0]}`);
    const bare = c.text.replace(GEN_RX, ''); if (/[{}|]/.test(bare)) errors.push(`أقواس أو شرطة شاردة في ${c.full}: ${c.text}`);
    if (/[0-9٠-٩]/.test(c.text)) errors.push(`أرقام مكتوبة في جملة منطوقة (العدد كلمةً): ${c.full}`);
    // الساكن آخر الكلمة قبل همزة الوصل يُحرَّك (الفحص المستقل C، ن-ث1): «أَكْمِلْ الآنَ» صوابها «أَكْمِلِ الآنَ»، و«مِنْ الـ» صوابها «مِنَ الـ»؛ في الصيغتين
    for (const f of ['$1', '$2']) { const m = c.text.replace(GEN_RX, f).match(/\S*[^\sْ]ْ\s+ا\S*/); if (m) errors.push(`ساكن قبل همزة وصل في ${c.full}: ${m[0]}`); }
    /* وعكسه: الكسرة لالتقاء الساكنين لا تكون إلا قبل همزة وصل (بعد الفحص المستقل F: «ضَعِ كُلَّ شَيْءٍ» و«اِلْمِسِ وَجْهًا» و«اِسْمَعِ مَا» في 22 جملة منذ S1-U2):
       أمرٌ بصيغتين آخر صيغة الولد منه كسرة وصيغة البنت بياء (ضَعِ|ضَعِي، قِسِ|قِيسِي) لا تليه كلمةٌ تبدأ بهمزة وصل، فصوابه السكون (ضَعْ|ضَعِي)، إلا أمراً معتلّ الآخر حُذفت علّته (DEFECT).
       والأجوف كالصحيح (الفحص المستقل G1 (4): «قِسِ قَلَمَ» و«اِخْتَرِ سَلَّتَهُ» نجتا لأن صيغة البنت فيهما ليست صيغة الولد بياء)، وما بعده علامة ترقيم أو آخر الجملة كالكلمة */
    /* وكل كلمة من الزوج إن كان بكلمات (H1 (8): نجت «{أَدْخِلِ يَدَكَ|…}» و«{قِفِ وَانْظُرْ|…}»): كلمةُ الولد بكسرة وكلمةُ البنت المقابلة بياء، وما بعدها الكلمةُ التالية في الزوج
       أو بعده (والكلمة بعلامة ترقيمها؛ وقبل الترقيم كآخر الجملة) */
    for (const m of c.text.matchAll(/\{([^|{}]+)\|([^|{}]+)\}/g)) { const rest = c.text.slice(m.index + m[0].length), after = (rest.match(/^\s*«?(\S*)/) || ['', ''])[1];
      const MW = m[1].trim().split(/\s+/), FW = m[2].trim().split(/\s+/);
      MW.forEach((M0, i) => { const M = M0.replace(/[«»"()،.؟!:,؛]+$/, ''), F = (FW.length === MW.length ? FW[i] : FW[FW.length - 1]).replace(/[«»"()،.؟!:,؛]+$/, ''), punct = M !== M0;
        const nx = punct ? '' : i + 1 < MW.length ? MW[i + 1].replace(/^«/, '') : after;
        if (M.endsWith('\u0650') && F.endsWith('ي') && !DEFECT.has(M) && !/^\{?ا/.test(nx)) errors.push(`كسرة لالتقاء الساكنين ولا همزة وصل بعدها في ${c.full}: «${M} ${nx || '(آخر الجملة)'}» (صوابها «${M.slice(0, -1)}ْ»، أو أمرٌ معتلّ الآخر يُضاف إلى DEFECT)`); }); }
    const words = c.text.replace(GEN_RX, '$1').split(/\s+/).filter(Boolean).length; if (words > 30) warn.push(`جملة طويلة (${words} كلمة) لطفل في السادسة: ${c.full}`);
    /* وكلمةٌ آخرها «كَ» خارج الصيغتين ضميرُ المخاطب بصيغة الولد وحدها (الفحص المستقل D2 لبوابة S1-U4 (1): «شِبْرِكَ» في جملة «معي»، ولم تكن بصيغتين في جملة أخرى
       فلم تعرفها 4ب7)، إلا اسمَ إشارة أو كلمةً كافُها من أصلها؛ وما يُضاف إلى هذه القائمة يُضاف عن قصد */
    kafCheck(c.text, c.full); waslCheck(c.text, c.full);
  }
  // 2) JS
  const code = js.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1');
  for (const m of code.matchAll(/\b(?:say|S)\(\s*(?:'(?:compass|chaos)'\s*,\s*'[^']*'\s*,\s*)?'([^']*)'/g)) if (AR.test(m[1])) errors.push('جملة منطوقة مكتوبة في الكود: ' + m[1].slice(0, 40));
  js.split('\n').forEach((l, i) => { if (/Math\.random\(/.test(l) && !/rng-ok/.test(l)) errors.push('Math.random بلا علامة rng-ok في السطر ' + (i + 1)); });
  /* والخفوت إلى الصفر يبقى أو يُزال (الفحص المستقل D2 لبوابة S1-U4 (7): فوضى في إشعال S1-U2 د5 خفتت بلا fill فعادت ظاهرة «واختبأت بهما!»): anim(x, […, { opacity: 0 }], …)
     بـ fill: 'forwards' (أو 'both')، أو x.remove() بعده في السطر نفسه */
  /* (الفحص المستقل E2): بأيّ مسافات، وبمفاتيح أخرى في الإطار الأخير، وبـ 0.0 */
  code.split('\n').forEach((l, i) => { for (const m of l.matchAll(/anim\(([\w.$\[\]]+),\s*\[[^\]]*\{[^{}]*?\bopacity:\s*0(?:\.0+)?\s*(?:,[^{}]*)?\}\s*\]([^;]*)/g)) { const n = m[1], rest = l.slice(m.index + m[0].length - m[2].length);
      if (!/fill: '(?:forwards|both)'/.test(m[2]) && !rest.includes(n + '.remove()')) errors.push(`خفوتٌ إلى الصفر يعود بعده ظاهراً في السطر ${i + 1} من الكود (${n}): fill: 'forwards' أو ${n}.remove() بعده`); } });
  /* والتسمية ذات الصيغتين تمرّ بـ G() (الفحص المستقل C2 لبوابة S1-U4: «اسْحَبْهُ» في تسمية العود كانت بصيغة الولد وحدها، وبصيغتين تُقرأ بأقواسها لو لم تمرّ بـ G) */
  for (const m of js.matchAll(/(?:setAttribute\('aria-label', |esc\(|textContent = )labelText\('([\w.]+)'\)/g)) {   /* ما يُكتب في الصفحة مباشرة (والأدوات كـ tapOne تمرّره بـ G) */ const v = ((content.labels && content.labels.ui) || {})[m[1]]; if (v && /\{[^}]*\|/.test(String(v))) errors.push(`التسمية «${m[1]}» بصيغتين تُستعمل في الكود بلا G(): ${m[0]}`); }
  /* ومفتاح الفعل Enter أو المسافة بـ actKey (مواصفة المحرّك 8؛ الفحص المستقل C2 لبوابة S1-U4: قطع الورشة و«رتّب» وعود «قارن» وسلّة الشبر تقبل Enter وحده) */
  /* (الفحص المستقل D2 لبوابة S1-U4 (3): نجت «== 'Enter'» و«!== 'Enter'» في المستمع العامّ وactKey لـ Enter وحده): كل مقارنة بمفتاح Enter أو المسافة في isActKey وحدها،
     وisActKey فيها الاثنان */
  /* (الفحص المستقل F2 (5): نجت «const { key } = e» و«['Enter'].includes(e.key)» و«/^Enter$/.test(e.key)» و«e['key']» و«e.key.toLowerCase() === 'enter'»، فكل صيغة
     تُحصى لا تُغلق): خارج سطر isActKey لا يُذكر Enter ولا NumpadEnter ولا Space(bar) في الكود (بلا تعليقاته)، ولا يُقرأ key ولا code ولا keyCode ولا which بأيّ صيغة، إلا key
     حدث التخزين (storage) والدالّة localStorage.key() */
  /* (الفحص المستقل G2 (10): استُثني سطر isActKey كله فمرّ ما يُلحق به («enterOnly = e => e.key === 'Enter'»)، ونجت «({ keyCode }) =>» و«({ key: k }) =>» والتفكيك على
     أسطر وReflect.get وcharCode وkeyIdentifier وe[KC] وfor (const { keyCode: c } of [e])، ومُنع كودٌ مشروع: «space-between» و«white-space» و«err.code» و«{ code } = d»
     و«it.key» و«enter» في نصّ): يُستثنى نصّ تعريف isActKey بعينه؛ ولا يُذكر Enter ولا NumpadEnter ولا Space(bar) نصّاً كاملاً أو في تعبير نمطي، ولا keyCode ولا
     charCode ولا keyIdentifier ولا which بأيّ صيغة؛ ولا يُقرأ key ولا code من حدث مستمعٍ للمفاتيح (keydown وkeyup وkeypress، مكتوباً في موضعه أو معرَّفاً باسمه): خاصيةً،
     أو بقوسين، أو تفكيكاً في معامله أو في جسمه، أو بـ Reflect.get. ويبقى KEYOK في التشغيل الحارسَ الأول */
  /* (الفحص المستقل H2 (7): نجت 16 صيغة من 17 ومُنع خمسة أكواد مشروعة): تعريف isActKey يُطابَق حتى فاصلته (كان بادئةً فمرّ «… || e.key === ' ' && false»)؛ والتعبير النمطي
     يُرى بعد السهم و«return» وأي عامل؛ وما بين ${} في نصّ القالب كودٌ يُفحص؛ وحدث مستمع المفاتيح لا يُستعمل إلا في actKey(P) وisActKey(P) وP.target وP.repeat
     وP.preventDefault() وP.stopPropagation() وP.stopImmediatePropagation()، فلا يُمرَّر إلى دالة أخرى (isEnter(e) خارج المستمع)، ولا يُسمّى باسم آخر، ولا يُفكَّك، ولا
     معامل بقية ولا arguments؛ ونوع حدث addEventListener نصٌّ صريح، ومستمع المفاتيح بصيغةٍ تُقرأ (لا bind). و«Enter» و«NumpadEnter» و«Space(bar)» بحروفها في نصٍّ أو تعبير
     نمطي ممنوعة، لا «enter» و«space» كلمتين (صنف CSS، وpointerenter)، و«which» تُمنع قراءةً من الحدث وحده (q.which و{ which: 1 } مشروعان) */
  { const bare = code.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:\\'"`])\/\/[^\n]*/g, '$1');
    const DEF = "const isActKey = e => e.key === 'Enter' || e.key === ' ',", nDef = bare.split(DEF).length - 1;
    if (nDef !== 1) errors.push(`isActKey (بصيغتها «${DEF}» ${nDef} مرة، حتى فاصلتها) لا يقبل Enter والمسافة كليهما، أو عُرِّفت بغيرها أو أُلحق بها شرط (المطلوب مرة)`);
    const src = bare.split(DEF).join(' '.repeat(DEF.length)), at = i => src.slice(0, i).split('\n').length;
    /* النصوص فارغة بطولها، فتبقى المواضع؛ وفي نصّ القالب يبقى ما بين ${} */
    const blankTpl = t => { let out = '`', k = 1; while (k < t.length - 1) { if (t[k] === '\\') { out += '  '; k += 2; continue; } if (t[k] === '$' && t[k + 1] === '{') { let d = 0, q = k + 1; for (; q < t.length; q++) { if (t[q] === '{') d++; else if (t[q] === '}' && --d === 0) break; } out += t.slice(k, q + 1); k = q + 1; continue; } out += t[k] === '\n' ? '\n' : ' '; k++; } return out + '`'; };
    const ns = src.replace(/`(?:\\[\s\S]|\$\{(?:[^{}]|\{[^{}]*\})*\}|[^\\`])*`|(['"])(?:\\.|(?!\1)[^\\\n])*\1/g, m => m[0] === '`' ? blankTpl(m) : m[0] + ' '.repeat(m.length - 2) + m[0]);
    const bad = (i, why) => errors.push(`مفتاح Enter وحده في السطر ${at(i)} من الكود (${why}): actKey(e) أو isActKey(e) (Enter أو المسافة)، ولا يُقرأ المفتاح بغيرهما: ${src.slice(Math.max(0, i - 24), i + 64).replace(/\s+/g, ' ').trim()}`);
    for (const m of src.matchAll(/(['"`])((?:\\.|(?!\1)[^\\\n])*)\1/g)) { if (/^(?:Numpad)?Enter$|^Space(?:bar)?$/.test(m[2])) bad(m.index, 'اسم المفتاح نصّاً'); if (/^(?:keyCode|charCode|keyIdentifier)$/.test(m[2])) bad(m.index, 'خاصية المفتاح نصّاً'); }
    for (const m of ns.matchAll(/(?:^|[=(,:\[!&|?{};+\-*%<>~^]|\b(?:return|typeof|case|in|of)\b)\s*\/((?:\\.|\[(?:\\.|[^\]\\\n])*\]|[^/\\\n\[*])(?:\\.|\[(?:\\.|[^\]\\\n])*\]|[^/\\\n\[])*)\/[gimsuy]*/gm)) { const rx = src.slice(m.index, m.index + m[0].length);
      if (/\b(?:Numpad)?Enter\b|\bSpace(?:bar)?\b/.test(rx)) bad(m.index, 'اسم المفتاح في تعبير نمطي'); }
    for (const m of ns.matchAll(/\b(?:keyCode|charCode|keyIdentifier)\b/g)) bad(m.index, 'خاصية مفتاح');
    /* مستمعات المفاتيح: الدالة في موضعها (سهم أو function)، أو باسمها المعرَّف في الكود؛ ومعاملها الأول الحدث */
    const close = (i, o, c) => { let d = 0; for (let j = i; j < ns.length; j++) { if (ns[j] === o) d++; else if (ns[j] === c && --d === 0) return j; } return ns.length; };
    const fnAt = (i, depth) => { const s = ns.slice(i); let m;
      if ((m = s.match(/^\s*(?:async\s+)?function\b[^(]*\(/))) { const p0 = i + m[0].length - 1, p1 = close(p0, '(', ')'), b0 = ns.indexOf('{', p1); return { params: ns.slice(p0 + 1, p1), b: [b0, close(b0, '{', '}')] }; }
      if ((m = s.match(/^\s*(?:async\s*)?(\((?:[^()]|\([^()]*\))*\)|[A-Za-z_$][\w$]*)\s*=>\s*/))) { const p = m[1].replace(/^\(|\)$/g, ''), b0 = i + m[0].length;
        if (ns[b0] === '{') return { params: p, b: [b0, close(b0, '{', '}')] }; let d = 0, j = b0; for (; j < ns.length; j++) { const ch = ns[j]; if ('([{'.includes(ch)) d++; else if (')]}'.includes(ch)) { if (!d) break; d--; } else if (!d && (ch === ',' || ch === ';' || ch === '\n')) break; }
        return { params: p, b: [b0, j] }; }
      /* وباسمها: أقرب تعريفٍ قبل التسجيل (الاسم نفسه معرَّف في مواضع أخرى من الكود المجموع) */
      if (depth < 1 && (m = s.match(/^\s*([A-Za-z_$][\w$]*)\s*[),;]/)) && m[1] !== 'null') { const nm = m[1].replace(/\$/g, '\\$');
        const D = [...ns.matchAll(new RegExp(`function\\s+${nm}\\s*(?=\\()|(?:const|let|var)\\s+${nm}\\s*=\\s*|[,;{]\\s*${nm}\\s*=\\s*(?=[(\\w$])`, 'g'))], d = D.filter(x => x.index < i).pop() || D[0];
        if (d) return fnAt(d.index + (d[0].startsWith('function') ? 0 : d[0].length), depth + 1); }
      return null; };
    for (const m of ns.matchAll(/\baddEventListener\(\s*(?![\s'"`])/g)) bad(m.index, 'نوع الحدث ليس نصّاً صريحاً في addEventListener');
    /* (الفحص المستقل I2 (6): نجت 10 صيغ من 18): نوع الحدث نصٌّ كامل لا يُجمع («'key' + 'down'»)، ولا addEventListener ولا onkey… بقوسين أو مفتاحاً في كائن أو نصّاً
       (Object.assign وsetAttribute)، ولا الحدث العام (window.event وevent في مستمع بلا معامل) ولا defaultView */
    for (const m of src.matchAll(/\baddEventListener\(\s*(?=['"`])/g)) if (!/^addEventListener\(\s*(['"`])[\w-]*\1\s*[,)]/.test(src.slice(m.index))) bad(m.index, 'نوع الحدث ليس نصّاً كاملاً في addEventListener');
    for (const m of src.matchAll(/\[\s*(['"`])(?:addEventListener|onkey(?:down|up|press))\1\s*\]/g)) bad(m.index, 'addEventListener أو onkey… بقوسين');
    for (const m of src.matchAll(/(['"`])onkey(?:down|up|press)\1/g)) bad(m.index, 'onkey… نصّاً');
    for (const m of ns.matchAll(/[{,]\s*onkey(?:down|up|press)\s*:/g)) bad(m.index, 'onkey… مفتاحاً في كائن');
    for (const m of ns.matchAll(/\b(?:window|self|globalThis|top|parent|frames)\s*\.\s*event\b|\.\s*defaultView\b/g)) bad(m.index, 'الحدث العامّ (window.event) أو defaultView');
    /* (الفحص المستقل J2 (8): نجت call وbind وReflect.apply، و'on' + …، و`onkey${…}`، و??= ، وwindow['event']) */
    for (const m of ns.matchAll(/\baddEventListener\s*\.\s*(?:call|apply|bind)\b|\bReflect\s*\.\s*apply\b/g)) bad(m.index, 'addEventListener بغير استدعائه المباشر');
    for (const m of src.matchAll(/\[\s*(['"`])on\1\s*\+|`onkey|\bonkey(?:down|up|press)\s*(?:\?\?|\|\||&&)=/g)) bad(m.index, 'onkey… محسوباً أو بإسنادٍ شرطي');
    for (const m of src.matchAll(/\b(?:window|self|globalThis|top|parent|frames)\s*\[\s*(['"`])event\1\s*\]/g)) bad(m.index, 'الحدث العامّ (window.event) أو defaultView');
    const H = []; for (const m of src.matchAll(/addEventListener\(\s*['"`]key(?:down|up|press)['"`]\s*,|\bonkey(?:down|up|press)\s*=(?!=)/g)) { const f = fnAt(m.index + m[0].length, 0);
      if (f) H.push([m.index, f]); else if (!/^\s*null\b/.test(ns.slice(m.index + m[0].length))) bad(m.index, 'مستمع مفاتيح بصيغة لا تُقرأ (bind أو تعبير)'); }
    const OK = P => new RegExp(`\\b(?:isActKey|actKey)\\(\\s*${P}\\s*\\)|\\b${P}\\s*\\.\\s*(?:target|currentTarget|repeat|shiftKey|ctrlKey|altKey|metaKey|isComposing)\\b|\\b${P}\\s*\\.\\s*(?:preventDefault|stopPropagation|stopImmediatePropagation)\\s*\\(\\s*\\)`, 'g');
    /* ومفتاحٌ غير مفتاحي الفعل يُقارَن باسمه نصّاً (Escape وTab والأسهم…): كودٌ مشروع كان يُمنع (إغلاق الغطاء بـ Escape، الفحص المستقل I2 (6)) */
    /* وبالمساواة وحدها: «e.key !== 'Tab'» يجعل كل مفتاحٍ غيره فعلاً، ومنها Enter وحده (الفحص المستقل J2 (8)) */
    const KEYLIT = P => new RegExp(`\\b${P}\\s*\\.\\s*key\\s*===?\\s*(['"])(?:Escape|Tab|Arrow(?:Left|Right|Up|Down)|Home|End|PageUp|PageDown)\\1|(['"])(?:Escape|Tab|Arrow(?:Left|Right|Up|Down)|Home|End|PageUp|PageDown)\\2\\s*===?\\s*${P}\\s*\\.\\s*key\\b`, 'g');
    for (const [i0, f] of H) { const prm = f.params.trim(), body = ns.slice(f.b[0], f.b[1]), bodySrc = src.slice(f.b[0], f.b[1]), rel = j => f.b[0] + j;
      if (prm && !/^[A-Za-z_$][\w$]*$/.test(prm)) { bad(i0, 'معامل مستمع المفاتيح ليس اسماً واحداً (تفكيك أو بقية أو معاملٌ ثانٍ)'); continue; }
      if (/\barguments\b/.test(body)) bad(rel(body.search(/\barguments\b/)), 'arguments في مستمع المفاتيح');
      const P = prm || null; if (P !== 'event') for (const m of body.matchAll(/(?<![\w$.])event(?![\w$])/g)) bad(rel(m.index), 'الحدث العامّ event في مستمع المفاتيح');
      if (!P) continue; const p = P.replace(/\$/g, '\\$');
      let masked = body.replace(OK(p), m => ' '.repeat(m.length)); for (const m of bodySrc.matchAll(KEYLIT(p))) masked = masked.slice(0, m.index) + ' '.repeat(m[0].length) + masked.slice(m.index + m[0].length);
      for (const m of masked.matchAll(new RegExp(`(?<![\\w$.])${p}(?![\\w$])`, 'g'))) bad(rel(m.index), 'الحدث في مستمع المفاتيح بغير actKey(e) وisActKey(e) وtarget وrepeat وpreventDefault وstopPropagation'); }
    if (!H.length) errors.push('فحص المفتاح: لم يُعثر على مستمع مفاتيح في الكود');
    if (!/\bactKey = e => isActKey\(e\) &&/.test(code)) errors.push('actKey ليس مبنيّاً على isActKey(e)'); }
  /* الدالة المعرَّفة مرتين في الكود المجموع تُبطل الأولى صامتاً (S1-U4، الدرس 139: boardAt للوحة المقاول أبطل لوحة الروبوت فانهار S1-U3 د3) */
  { const seen = new Map(); for (const m of code.matchAll(/^(?:async\s+)?function\s+(\w+)\s*\(/gm)) { const ln = code.slice(0, m.index).split('\n').length;
      if (seen.has(m[1])) errors.push(`الدالة ${m[1]} معرَّفة مرتين في الكود (السطران ${seen.get(m[1])} و${ln})، فالثانية تُبطل الأولى صامتاً`); else seen.set(m[1], ln); } }
  /* وما يُسمع بعد مهلةٍ يُنتظر بالبوابة (sleep) لا بـ psleep وحده: psleep يمضي بعد الخروج (show يستأنف المؤقّتات الموقوفة)، فدُقّت نغمة سباق العربتين على الخريطة
     (الفحص المستقل I2 (4)). والمرئيّ بعد psleep على مسرحٍ زال لا أثر له */
  /* بكل صيغة: ‎.then‎ بسهمٍ أو بدالة أو باسم الدالة (إلى آخر عبارتها)، و‎await psleep(…)‎ وما بعده في كتلته؛ وpsleep داخل gate(…) بالبوابة */
  const scopeEnd = (t, k, toBlock) => { let d = 0; for (let j = k; j < t.length; j++) { const c = t[j]; if ('({['.includes(c)) d++; else if (')}]'.includes(c)) { if (--d < 0) return j; } else if (c === ';' && d === 0 && !toBlock) return j; } return t.length; };
  { const T = code.split('\n').map(ln => ln.replace(/\/\*.*?\*\//g, '').replace(/\/\/.*$/, '')).join('\n'); let k = -1;   /* و‎await‎ إلى آخر كتلته وإن تعدّت السطر */
    for (const mm of T.matchAll(/\bpsleep\s*\(/g)) { k = mm.index; const pre = T.slice(Math.max(0, k - 40), k); if (/\bgate\(\s*$/.test(pre) || /\bfunction\s+$/.test(pre)) continue;
      const seg = T.slice(k, scopeEnd(T, k, /\bawait\s+$/.test(pre)));
      if (/\b(?:SFX|say|tone|S|speakNow|coverSay|buzz|replayLine)\b\s*(?:\.\s*\w+\s*|\[[^\]]*\]\s*)?[(),]/.test(seg)) errors.push(`ما يُسمع بعد psleep بلا البوابة (السطر ${T.slice(0, k).split('\n').length} من الكود المجموع): يُدقّ بعد الخروج؛ sleep(…) يقف مع الدرس ويسقط بالخروج: ${seg.slice(0, 90).replace(/\s+/g, ' ')}`); } }
  // تعليق سطر بعده كود في السطر نفسه يبتلع الكود صامتاً (وقع مرتين في بوابة هـ): التعليق داخل السطر يُكتب بين علامتي التعليق الكتلي
  const SWALLOW = /\b(await|const|let|return|if|else)\b\s|\w\([^)]*\);|\};|\)\s*;\s*\w/;
  const swallowIn = (txt, name) => txt.split('\n').forEach((l, i) => { const m = l.match(/\s\/\/\s(.*)$/); if (m && SWALLOW.test(m[1])) errors.push('كود بعد تعليق السطر (يُبتلع) في ' + name + ' السطر ' + (i + 1) + ': ' + m[1].slice(0, 50)); });
  swallowIn(js, 'src/js'); for (const f of readdirSync(join(ROOT, 'build')).filter(f => f.endsWith('.mjs'))) swallowIn(read(join(ROOT, 'build', f)), 'build/' + f);
  const genKeys = [...LINES.keys()].filter(k => k.startsWith('gen.'));
  for (const m of code.matchAll(/'(gen\.[\w.]*)'/g)) { const id = m[1];
    if (id.endsWith('.')) { if (!genKeys.some(k => k.startsWith(id))) errors.push('بادئة جملة بلا جمل في المحتوى: ' + id); }
    else if (!LINES.has(id)) errors.push('جملة غير موجودة في المحتوى: ' + id); }
  const lessons = {}; for (const u of content.units) for (const l of u.lessons) lessons[l.id] = { ...l, unit: u.id };
  const labelKeys = new Set([...Object.keys(content.labels.ui || {}), ...Object.values(lessons).flatMap(l => Object.keys(l.labels || {}))]);
  for (const m of code.matchAll(/\blabel(?:Text)?\('([\w.]+)'\)/g)) if (!labelKeys.has(m[1])) errors.push('تسمية غير موجودة في labels: ' + m[1]);
  const ERR = content.errors;
  for (const m of code.matchAll(/\berr: '(\w+)'/g)) if (!ERR[m[1]]) errors.push(`الكود يسجّل err '${m[1]}' وليس في errors.json`);
  for (const m of code.matchAll(/err: [^,;]*\? '(\w+)' : '(\w+)'/g)) for (const t of [m[1], m[2]]) if (!ERR[t]) errors.push(`الكود يسجّل err '${t}' وليس في errors.json`);
  for (const [tag, e] of Object.entries(ERR)) { if (!e.label) errors.push('وسم بلا اسم للكبار: ' + tag);
    for (const [id, t] of Object.entries(e.q || {})) { if (!id.startsWith('gen.err.' + tag + '.')) errors.push('معرّف سؤال الخطأ لا يتبع gen.err.<الوسم>: ' + id); if (!/[؟?]/.test(t)) warn.push(`السؤال الأول للخطأ ليس سؤالاً (D240): ${id}`); }
    if (e.vis && !new RegExp('\\b' + e.vis + ': ').test(code)) errors.push(`حركة الأداة ${e.vis} للوسم ${tag} غير معرّفة في VIS`);
    if (e.mat) { for (const id of e.mat) if (!(e.q || {})[id]) errors.push(`الوسم ${tag}: سؤال المواد ${id} ليس من أسئلته`); if (!Object.keys(e.q || {}).some(id => !e.mat.includes(id))) errors.push(`الوسم ${tag}: لا سؤال له على الشاشة (كل أسئلته للمواد)`); } }
  const ITEMS = new Set([...code.matchAll(/^ITEM\.(\w+) = /gm)].map(m => m[1]));
  const SCENES = new Set([...code.matchAll(/^SCENES\.(\w+) = /gm)].map(m => m[1]));
  const VIS = new Set([...code.matchAll(/^\s{2}(\w+): (?:async )?\(/gm)].map(m => m[1]));
  const MAKERS = new Set(); for (const m of code.matchAll(/^const (MK|MK2) = \{\n([\s\S]*?)\n\};/gm)) for (const k of m[2].matchAll(/^\s{2}(\w+): /gm)) MAKERS.add(k[1]);
  for (const l of Object.values(lessons)) for (const k of Object.keys(l.riddles || {})) { if (MAKERS.has(k)) errors.push('اسم لغز يكرّر مولّداً: ' + k); MAKERS.add(k); }
  const isMaker = r => typeof r === 'string' ? MAKERS.has(r) : Array.isArray(r) ? MAKERS.has(r[0]) : !!r && typeof r === 'object';
  // 3) الدروس
  const lineOk = (L, id) => id.startsWith('gen.') ? LINES.has(id) : LINES.has(L.id + '.' + id);
  for (const L of Object.values(lessons)) {
    const bad = new Set(); let LL = L;
    const walk = (v, path, key) => {
      if (typeof v === 'string') {
        if (/^[a-z][\w]*(\.[\w]+)+$/.test(v) && !/^m\d+\.u\d+(\.d\d+)?$/.test(v) && !/^\$/.test(v) && !lineOk(LL, v)) bad.add(`${L.id}: جملة غير موجودة «${v}» في ${path}`);
        if (REF_ONE.includes(key) && !/\./.test(v) && !isMaker(v)) bad.add(`${L.id}: مولّد غير معروف «${v}» في ${path}`);
        return; }
      if (Array.isArray(v)) { if (REF_MANY.includes(key)) v.forEach((x, i) => { if ((typeof x === 'string' && !/\./.test(x)) || (Array.isArray(x) && typeof x[0] === 'string' && !/\./.test(x[0]))) { if (!isMaker(x)) bad.add(`${L.id}: مولّد غير معروف ${JSON.stringify(x)} في ${path}[${i}]`); } });
        v.forEach((x, i) => walk(x, path + '[' + i + ']', key)); return; }
      if (v && typeof v === 'object') {
        if (typeof v.t === 'string' && !ITEMS.has(v.t)) bad.add(`${L.id}: نوع بند غير معروف «${v.t}» في ${path}`);
        if (v.t === 'sort' && v.mk === undefined) bad.add(`${L.id}: بند فرز بلا mk في ${path}`);
        if (v.t === 'splitMake' && new Set((v.avoid || []).map(p => Math.min(...p))).size >= Math.floor(v.n / 2) + 1) bad.add(`${L.id}: بند «لوّن بطريقة جديدة» بلا طريقة جديدة ممكنة في ${path}`);
        if (Array.isArray(v.mk) || (typeof v.mk === 'string' && !isMaker(v.mk))) { if (!isMaker(v.mk)) bad.add(`${L.id}: مولّد غير معروف ${JSON.stringify(v.mk)} في ${path}`); }
        for (const [k, x] of Object.entries(v)) if (!(path === '' && SKIP.has(k)) && !(k === 'bag' && false)) walk(x, path + '.' + k, k);
      }
    };
    const { bag, ...rest } = L; const mixed = rest.mastery && rest.mastery.mixed; if (mixed) rest.mastery = { ...rest.mastery, mixed: undefined }; walk(rest, '', null);
    if (mixed && lessons[mixed.lesson]) { const M = lessons[mixed.lesson]; LL = M; walk(mixed.item, '.mastery.mixed(' + M.id + ')', null); LL = L; }   /* البند المشتبك يُحكم بإعدادات درسه وجمله */
    if (bag) { walk({ ask: bag.ask }, '.bag', null); (bag.items || []).forEach((r, i) => { if (typeof r === 'string' && !isMaker(r)) bad.add(`${L.id}: مولّد غير معروف في الحقيبة ${r}`); if (r && r.label && !(L.labels || {})[r.label] && !content.labels.ui[r.label]) bad.add(`${L.id}: تسمية حقيبة غير موجودة ${r.label}`); }); }
    for (const b of bad) errors.push(b);
    // المسار
    if (!Array.isArray(L.flow) || !L.flow.length) { errors.push(`${L.id}: لا مسار flow`); continue; }
    for (const [i, st] of L.flow.entries()) {
      if (!STAGES.has(st.s)) errors.push(`${L.id}: مرحلة غير معروفة «${st.s}» (${i})`);
      if (st.scene && !SCENES.has(st.scene)) errors.push(`${L.id}: مشهد غير معروف «${st.scene}»`);
      if (!st.scene && ['hook', 'explore', 'worked', 'game'].includes(st.s) && !st.items) errors.push(`${L.id}: مرحلة ${st.s} بلا مشهد`);
      if (st.s === 'practice' && !(L.practice && L.practice.normal && L.practice.normal.length)) errors.push(`${L.id}: مرحلة التمرين بلا practice.normal`);
      if (st.s === 'chaos' && !(L.chaos && L.chaos.right && L.chaos.wrong)) errors.push(`${L.id}: مرحلة فوضى بلا جملتين`);
      if (st.s === 'chaos' && L.chaos && L.chaos.kind === 'scene' && !SCENES.has(L.chaos.scene)) errors.push(`${L.id}: مشهد فوضى غير معروف «${L.chaos.scene}»`);
      if (st.s === 'mastery' && !(L.mastery && L.mastery.concepts)) errors.push(`${L.id}: مرحلة الإتقان بلا مفاهيم`);
      if (st.s === 'test' && !(L.test && L.test.items && L.test.items.length >= 8)) errors.push(`${L.id}: اختبار الوحدة أقل من ثمانية بنود`);
      if (st.s === 'wrap' && !(L.wrap && L.wrap.lines)) errors.push(`${L.id}: الختام بلا جمل`);
    }
    if (L.flow[L.flow.length - 1].s !== 'wrap') errors.push(`${L.id}: آخر مرحلة ليست الختام`);
    if (L.flow.some(s => s.s === 'practice') && !L.flow.some(s => s.s === 'mastery' || s.s === 'test')) errors.push(`${L.id}: تمرين بلا فحص إتقان ولا اختبار`);
    // 4) D240
    if (L.chaos && L.chaos.kind === 'bins' && L.chaos.placed.filter(p => p.wrong).length !== 1) errors.push(`${L.id}: مشهد فوضى يحتاج خطأً واحداً بالضبط`);
    if (L.chaos && L.chaos.wrong && LINES.get(L.id + '.' + L.chaos.wrong) && LINES.get(L.id + '.' + L.chaos.wrong).who !== 'chaos') errors.push(`${L.id}: جملة فوضى الخاطئة بغير صوت فوضى`);
    if (L.mastery) { for (const [C, items] of Object.entries(L.mastery.concepts)) { if (!(L.concepts || {})[C]) errors.push(`${L.id}: مفهوم ${C} في الإتقان بلا اسم في concepts`); if (items.length < 3) errors.push(`${L.id}: مفهوم ${C} بأقل من ثلاثة بنود`); }
      if (L.mastery.mixed && !lessons[L.mastery.mixed.lesson]) errors.push(`${L.id}: البند المشتبك يشير إلى درس غير موجود`);
      /* وخطؤه يرجع في جدول المراجعة مفهوماً من مخزون درسه (الفحص الخصم A07): concept منها، أو لا مخزون لدرسه */
      else if (L.mastery.mixed) { const O = lessons[L.mastery.mixed.lesson], cs = new Set((O.review || []).map(x => x.c)), c = L.mastery.mixed.concept;
        if (cs.size && !cs.has(c)) errors.push(`${L.id}: البند المشتبك بلا مفهوم من مخزون مراجعة ${O.id} (concept: ${c === undefined ? 'غائب' : c}، والمفاهيم ${[...cs].join(' ')})`);
        if (!cs.size && c !== undefined) errors.push(`${L.id}: البند المشتبك بمفهوم ${c} ودرسه ${O.id} بلا مخزون مراجعة`); } }
    if (!L.test && !(L.review && L.review.length)) warn.push(`${L.id}: لا مخزون مراجعة محجوز`);
    if (L.test) for (const q of L.test.items) { if (!lessons[q.of] || lessons[q.of].unit !== L.unit) errors.push(`${L.id}: البند ${q.id} يشير إلى درس خارج الوحدة: ${q.of}`); }
    // جملة العلاج بعد الاختبار تُقال والشاشة تعرض أضعف درس (الفحص المستقل C، ن-ك4): تُحيل إلى «هذا الدرس»، ولا تسمّي درساً من الوحدة
    if (L.test) { const id = L.test.remedial || 'gen.test.remedial', c = LINES.get(id.startsWith('gen.') ? id : L.id + '.' + id), bare = s => s.replace(/[ً-ْ]/g, '');
      if (!c) errors.push(`${L.id}: جملة العلاج ${id} غير موجودة`);
      else { const t = bare(c.text.replace(GEN_RX, '$1'));
        if (L.test.remedial && !t.includes('هذا الدرس')) errors.push(`${L.id}: جملة العلاج ${id} لا تُحيل إلى «هذا الدرس» الظاهر على الشاشة`);
        for (const o of Object.values(lessons).filter(o => o.unit === L.unit)) { const tt = bare(String(o.title || '')); if (tt && t.includes(tt)) errors.push(`${L.id}: جملة العلاج ${id} تسمّي الدرس «${tt}» (${o.id})، والشاشة تعرض أضعف درس`); } } }
  }
  { const r = d240(lessons, code + '\n' + read(join(ROOT, 'src', 'styles.css')), MAKERS);   /* والأنماط لألوان الهوية (D253 (3)) */ errors.push(...r.errors); warn.push(...r.notes); }   /* D240 وD239: build/d240.mjs */
  /* أسماء الأشياء المنطوقة وتعليل «لا سلّة لنوعه»: كل جملة منها يبلغها المحتوى، وكل ما يبلغه المحتوى له جملته (فلا تسجيل لا يُسمع، ولا اسم يسكت) */
  { const objOf = {}, kindOf = {}; for (const m of code.matchAll(/^\s{2}(\w+): \([^)]*\) => \(\{(.*)\}\),?/gm)) { const o = m[2].match(/label: objLabel\('(\w+)'\)/), k = m[2].match(/\bkind: '(\w+)'/); if (o) objOf[m[1]] = o[1]; if (k) kindOf[m[1]] = k[1]; }
    const needObj = new Set(), needKind = new Set(); const nm = r => typeof r === 'string' ? r : Array.isArray(r) ? r[0] : null;
    const walk = v => { if (Array.isArray(v)) return v.forEach(walk); if (!v || typeof v !== 'object') return;
      if (v.t === 'sort' || v.t === 'property') { const n = nm(v.mk); if (n && objOf[n]) needObj.add(objOf[n]); if (v.t === 'sort' && v.bins && n && kindOf[n] && !v.bins.includes(kindOf[n]) && kindOf[n] !== 'other' && !v.kindOf) needKind.add(kindOf[n]); }
      if (v.t === 'pickAll' && v.names) for (const r of v.objs || []) { const n = nm(r); if (n && objOf[n]) needObj.add(objOf[n]); }
      for (const [k, x] of Object.entries(v)) if (k !== 'lines') walk(x); };
    for (const L of Object.values(lessons)) walk(L);
    const genIds = Object.keys(content.gen.lines || {});
    for (const k of needObj) if (!LINES.has('gen.obj.' + k)) errors.push(`اسم الشيء «${k}» يُنطق ولا جملة له: gen.obj.${k}`);
    for (const id of genIds.filter(i => i.startsWith('gen.obj.'))) if (!needObj.has(id.slice(8))) errors.push(`جملة لا يبلغها المحتوى (تسجيل لا يُسمع): ${id}`);
    for (const k of needKind) if (!LINES.has('gen.why.notHere.' + k)) errors.push(`تعليل «لا سلّة لنوعه» بلا جملة: gen.why.notHere.${k}`);
    for (const id of genIds.filter(i => i.startsWith('gen.why.notHere.'))) if (!needKind.has(id.slice(16))) errors.push(`جملة لا يبلغها المحتوى (تسجيل لا يُسمع): ${id}`);
    /* والخيارات المقروءة: ما يسمّيه الكود صراحةً، وخيارات كيس اللمس، وأوعية التلوين، ويتدحرج/يقف في مختبر الدفع (بصيغتيه) */
    const needOpt = new Set(['rolls', 'stays', 'rollsF', 'staysF']); for (const m of code.matchAll(/'gen\.opt\.([\w.]*\w)'/g)) needOpt.add(m[1]);   /* لا البادئة 'gen.opt.paint.' */
    const walkO = v => { if (Array.isArray(v)) return v.forEach(walkO); if (!v || typeof v !== 'object') return; if (v.scene === 'feelBox') (v.opts || []).forEach(o => needOpt.add(o)); if (v.t === 'paint') (v.pots || []).forEach(k => needOpt.add('paint.' + k));
      for (const [k, x] of Object.entries(v)) if (k !== 'lines') walkO(x); };
    for (const L of Object.values(lessons)) walkO(L);
    for (const k of needOpt) if (!LINES.has('gen.opt.' + k)) errors.push(`خيار يُقرأ بلا جملة: gen.opt.${k}`);
    for (const id of genIds.filter(i => i.startsWith('gen.opt.'))) if (!needOpt.has(id.slice(8))) errors.push(`جملة لا يبلغها المحتوى (تسجيل لا يُسمع): ${id}`); }
  /* كل جملة في الدرس يستعملها شيء (في بياناته، أو في بند مشتبك يُشغَّل بجمله): الجملة الزائدة تكلّف تسجيلاً بلا فائدة */
  { const used = {}; const grab = (v, out, top) => { if (typeof v === 'string') out.add(v); else if (Array.isArray(v)) v.forEach(x => grab(x, out)); else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (!(top && ['lines', 'labels', 'talk', 'adultCard'].includes(k))) grab(x, out); };
    for (const L of Object.values(lessons)) { used[L.id] = used[L.id] || new Set(); grab(L, used[L.id], true); const mx = L.mastery && L.mastery.mixed; if (mx && lessons[mx.lesson]) { used[mx.lesson] = used[mx.lesson] || new Set(); grab(mx.item, used[mx.lesson]); } }
    for (const L of Object.values(lessons)) for (const id of Object.keys(L.lines || {})) if (!used[L.id].has(id)) errors.push(`${L.id}: جملة لا يستعملها شيء «${id}»`); }
  /* وسوم الأخطاء في بيانات الدروس (err وerrs في البنود والخيارات) موجودة في errors.json، كما في الكود: وسم غير مسجَّل يُسجَّل في السجل بلا اسم للكبار ولا سؤال */
  { const walkE = (v, where) => { if (Array.isArray(v)) return v.forEach(x => walkE(x, where)); if (!v || typeof v !== 'object') return;
      if (typeof v.err === 'string' && !ERR[v.err]) errors.push(`${where}: وسم خطأ في البيانات غير موجود في errors.json «${v.err}»`);
      if (v.errs && typeof v.errs === 'object' && !Array.isArray(v.errs)) for (const t of Object.values(v.errs)) if (typeof t === 'string' && !ERR[t]) errors.push(`${where}: وسم خطأ في البيانات غير موجود في errors.json «${t}»`);
      for (const [k, x] of Object.entries(v)) if (!['lines', 'labels', 'sort'].includes(k)) walkE(x, where); };
    for (const L of Object.values(lessons)) { walkE(L, L.id); for (const r of (L.sort && L.sort.errors) || []) if (r.err && !ERR[r.err]) errors.push(`${L.id}: وسم خطأ في قواعد الفرز غير موجود «${r.err}»`); } }
  for (const u of content.units) { if (u.workshop) for (const p of u.workshop.puzzles) if (!LINES.has(p.name)) errors.push(`${u.id}: اسم لغز بلا جملة ${p.name}`);
    for (const [, lid] of u.hunt) if (!lessons[lid]) errors.push(`${u.id}: الصيد يشير إلى درس غير موجود ${lid}`); }
  for (const [name, ids] of Object.entries(content.gen.banks || {})) { if (!ids.length) errors.push('بنك فارغ: ' + name); for (const id of ids) if (!LINES.has(id)) errors.push(`بنك ${name}: جملة غير موجودة ${id}`); }
  for (const m of code.matchAll(/bank\('(\w+)'\)|praise: \(\) => '(\w+)'/g)) { const b = m[1] || m[2]; if (!(content.gen.banks || {})[b]) errors.push('بنك غير موجود: ' + b); }
  /* وكل اسم بنك مدح في الكود، لا ما بعد praise: وحده (الفحص المستقل D1 لبوابة S1-U4 (15): MEAS_PRAISE وبنكاه لم يُفحصا، فنجت طفرة اسم البنك وسقط المدح صامتاً
     إلى «تمامًا!»)؛ والبادئة الموصولة بجدول (praiseCheck + {…}) تفحصها القاعدة التالية */
  /* (الفحص المستقل E2): بأيّ علامة تنصيص، والاسم الموصول بغير جدولٍ مفحوص («'praiseWeigh' + 'Trap'») مخالفة */
  for (const m of code.matchAll(/(['"`])(praise[A-Z]\w*)\1(\s*\+\s*(.))?/g)) { if (m[3] && m[4] !== '{') errors.push(`اسم بنك مدح موصول بغير جدول: ${m[2]} + …`);
    else if (!m[3] && !(content.gen.banks || {})[m[2]]) errors.push('بنك غير موجود: ' + m[2]); }
  /* والمدح بحسب البند (praiseCheck + نوع الخطأ في «أيّ القياسين صحيح؟»): كل بنك من البادئة وقيم الجدول */
  for (const m of code.matchAll(/praise: item => '(\w+)' \+ \{([^}]*)\}/g)) for (const v of m[2].matchAll(/: '(\w+)'/g)) if (!(content.gen.banks || {})[m[1] + v[1]]) errors.push('بنك غير موجود: ' + m[1] + v[1]);
  for (const L of Object.values(lessons)) if (L.sort && L.sort.praise && !(content.gen.banks || {})[L.sort.praise]) errors.push(`${L.id}: بنك المدح ${L.sort.praise} غير موجود`);
  for (const s of content.gen.stories || []) if (!LINES.has(s.line)) errors.push('قصة بلا جملة: ' + s.line);
  // 4ب) كل عدد يُقال كلمةً له جملة (gen.numw.NN)، في البنود وفي المشاهد: الأعداد المعطاة، والجواب، وبديل جملة الطرح (الجمع يُقرأ أيضاً)، والبرج الأكثر بواحد (الفحص المستقل الرابع)
  //     والأعداد فوق العشرة لا تُقال إلا من درس طريق الأعداد (N009، S1-U3 د5) فصاعداً؛ وحدّها ما له كلمة في gen.numw (حتى 20)
  const NUMK = ['n', 'a', 'b', 'k', 'target', 'start', 'ref', 'took', 'left', 'goal', 'from', 'to'];
  const ORDER = content.units.flatMap(u => u.lessons.map(l => l.id)), BIG_FROM = ORDER.indexOf('m1.u3.d5');
  const ORD_MAX = Math.max(0, ...[...LINES.keys()].filter(k => /^gen\.ord\.f\.\d+$/.test(k)).map(k => +k.slice(10)));
  const maxN = id => (BIG_FROM >= 0 && ORDER.indexOf(id) >= BIG_FROM) ? Math.max(...[...LINES.keys()].filter(k => /^gen\.numw\.\d+$/.test(k)).map(k => +k.slice(9))) : 10;
  const derived = v => { const o = [];
    if (['join', 'story', 'fact', 'sentence'].includes(v.t) && v.a != null && v.b != null) o.push(['المجموع', v.a + v.b]);
    if (['remove', 'fact', 'sentence', 'story'].includes(v.t) && v.op !== '+' && v.a != null && v.b != null) o.push(['الفرق', v.a - v.b]);
    if (v.t === 'unknownStart') o.push(['البداية', v.took + v.left]);
    if (v.t === 'split' && v.n != null && v.k != null) o.push(['الجزء الآخر', v.n - v.k]);
    if (v.t === 'buildTower' && v.want === 'more') o.push(['الأكثر بواحد', v.ref + 1]);
    if (v.t === 'same' && v.add) o.push(['بعد الإضافة', v.n + v.add]);
    if (v.scene === 'takeHook') o.push(['الباقي', v.a - v.b]);
    if (v.t === 'roadHop' && v.n != null) o.push(['الوصول', v.a + (v.dir || 1) * v.n]);
    if (v.t === 'roadPick') o.push(['الجواب', v.ask === 'land' ? v.n + (v.dir || 1) * v.k : v.ask === 'hops' ? v.b - v.n : v.n + (['next', 'more'].includes(v.ask) ? 1 : -1)]);
    if (v.scene === 'jumpChaosHook' || v.scene === 'chaosSubForward') o.push(['الوصول', v.a + (v.scene === 'chaosSubForward' ? -1 : 1) * v.n]);
    if (v.t === 'makeTen') o.push(['المجموع', v.a + v.b], ['صديق العشرة', 10 - v.a]); if (v.t === 'backTen') o.push(['الباقي', v.a - v.b], ['ما بعد العشرة', v.a - 10]);   /* S1-U4 */
    if (v.t === 'frameNeed' || v.t === 'frameGlance') o.push(['الإطار', 10 - v.n]); if (v.scene === 'tenBus') for (const r of v.rounds || []) o.push(['المجموع', r.a + r.b]);
    return o; };
  const walkNum = (v, where, top) => { if (Array.isArray(v)) return v.forEach(x => walkNum(x, where, top)); if (!v || typeof v !== 'object') return;
    if (typeof v.t === 'string' || typeof v.scene === 'string') { const mx = maxN(top);
      for (const k of NUMK) if (typeof v[k] === 'number' && (v[k] < 0 || v[k] > mx)) errors.push(`${where}: ${v.t || v.scene}.${k} = ${v[k]} خارج 0–${mx}` + (mx < 20 ? '، ولا كلمة له قبل طريق الأعداد' : '، ولا كلمة له'));
      for (const [nm, x] of derived(v)) if (x < 0 || x > mx) errors.push(`${where}: ${v.t || v.scene} ${nm} = ${x} خارج 0–${mx}، يُقرأ ولا كلمة له`);
      for (const k of ['said', 'rolls', 'chaos']) if (Array.isArray(v[k])) for (const x of v[k]) if (typeof x === 'number' && (x < 0 || x > mx)) errors.push(`${where}: ${v.t || v.scene}.${k} فيه ${x} خارج 0–${mx}`);
      if (Array.isArray(v.legs)) for (const x of v.legs.flat()) if (typeof x !== 'number' || x < 0 || x > mx) errors.push(`${where}: ${v.t || v.scene}.legs فيه ${x} خارج 0–${mx}`);
      /* القطار (N008، S1-U3): طوله داخل row فلا يبلغه الفحص أعلاه (طفرة mutants_run)؛ والعربات تُعدّ بأعداد ترتيبية مسموعة (gen.ord.f.NN) فلا يزيد القطار عليها،
         ولا تكون العربة المطلوبة ولا خيارات «أيّ عربة؟» خارجه */
      const train = (v.t === 'lineTap' || v.t === 'linePick') && v.row && v.row.kind === 'train' ? (v.row.n ?? 10) : (v.scene === 'trainOrdinals' || v.scene === 'chaosTrainBadge') ? (v.n ?? (v.scene === 'trainOrdinals' ? 10 : 6)) : null;
      if (train != null) { if (train > Math.min(ORD_MAX, mx) || train < 1) errors.push(`${where}: ${v.t || v.scene}: قطار من ${train} عربة، والأعداد الترتيبية المسموعة حتى ${ORD_MAX}`);
        if (v.t && typeof v.k === 'number' && (v.k < 1 || v.k > train)) errors.push(`${where}: ${v.t}: العربة ${v.k} خارج قطار من ${train}`);
        if (v.t === 'linePick') for (const o of v.opts || []) if (typeof o !== 'number' || o < 1 || o > train) errors.push(`${where}: linePick: الخيار ${o} خارج قطار من ${train}`); } }
    for (const [k, x] of Object.entries(v)) if (!['lines', 'labels'].includes(k)) walkNum(x, where, top); };
  for (const L of Object.values(lessons)) walkNum(L, L.id, L.id);
  // 4ب2) «أين هو في الخريطة؟» (S1-U3): الشيء على الأرض في خانة فارغة، أو فوق قطعة موجودة، أو تحت طاولة قريبة منا (فيُرى ما تحتها)
  const walkMap = (v, where) => { if (Array.isArray(v)) return v.forEach(x => walkMap(x, where)); if (!v || typeof v !== 'object') return;
    if (v.t === 'mapFind') { const m = v.mark || {}, items = (v.lay && v.lay.items) || [], key = i => i.col + ',' + i.row;
      if (m.cell) { if (items.some(i => key(i) === m.cell.join(','))) errors.push(`${where}: mapFind «${v.q}»: الخانة ${m.cell} فيها قطعة، والشيء «على الأرض» يكون في خانة فارغة`);
        /* وفي الصورة من الجانب يحجب السرير أو الطاولة القريبان منا ما خلفهما في عمودهما، فيبدو الشيء فوقهما أو تحتهما (لقطة الإتقان ms.1) */
        if (m.cell[1] === 'back' && items.some(i => i.col === m.cell[0] && i.row === 'front' && i.k !== 'rug')) errors.push(`${where}: mapFind «${v.q}»: الخانة ${m.cell} خلف ${items.find(i => i.col === m.cell[0] && i.row === 'front').k} قريب منا فيحجبها`); }
      else { const it = items.find(i => (i.id || i.k) === m.on); if (!it) errors.push(`${where}: mapFind «${v.q}»: لا قطعة «${m.on}» في الغرفة`);
        else if (m.rel === 'under' && (it.k !== 'table' || it.row !== 'front')) errors.push(`${where}: mapFind «${v.q}»: «تحت» لطاولة قريبة منا وحدها (ما تحت غيرها لا يُرى)`); }
      if (new Set(items.map(key)).size !== items.length) errors.push(`${where}: mapFind «${v.q}»: قطعتان في خانة واحدة`); }
    for (const [k, x] of Object.entries(v)) if (!['lines', 'labels'].includes(k)) walkMap(x, where); };
  for (const L of Object.values(lessons)) walkMap(L, L.id);
  // 4ب4) «قارن وقس» (S1-U4): ما يرسمه البند موجود في سجلّات الرسم، والمقارنة ممكنة (أطوال مختلفة، وثقلان مختلفان)، والشيء داخل المسرح، والعدد المكتوب فوق العشرة من درسه
  { const block = name => { const i = code.indexOf('const ' + name + ' = {'); if (i < 0) return ''; let d = 0, j = code.indexOf('{', i);
      for (let k = j; k < code.length; k++) { if (code[k] === '{') d++; else if (code[k] === '}' && !--d) return code.slice(j, k + 1); } return ''; };
    const HOUSE = new Set([...block('HOUSE_DRAW').matchAll(/^\s{2}(\w+)\(g, L\)/gm)].map(m => m[1])), WGT = Object.fromEntries([...block('WEIGH').matchAll(/(\w+): \{ w: (\d+)/g)].map(m => [m[1], +m[2]]));
    const UU = Object.fromEntries([...(code.match(/const UNIT_U = \{([^}]*)\}/) || ['', ''])[1].matchAll(/(\w+): (\d+)/g)].map(m => [m[1], +m[2]]));
    /* والثقل بترتيب الثقل الحقيقي (g بالغرام): لا يُرتَّب شيء فوق ما هو أثقل منه في الحقيقة (D253 (6)؛ الفحص المستقل A لبوابة S1-U4: الوسادة كانت أخفّ من التفاحة) */
    const GR = Object.fromEntries([...block('WEIGH').matchAll(/(\w+): \{ w: (\d+), big: \w+, g: ([\d.]+) \}/g)].map(m => [m[1], +m[3]]));
    if (Object.keys(GR).length !== Object.keys(WGT).length) errors.push(`فحص S1-U4: لكل ما يوزن ثقله الحقيقي g بالغرام في WEIGH (${Object.keys(WGT).filter(k => !(k in GR)).join('، ')})`);
    for (const a of Object.keys(GR)) for (const b of Object.keys(GR)) if (GR[a] < GR[b] && WGT[a] > WGT[b]) errors.push(`WEIGH: «${a}» (${GR[a]} غ) أخفّ في الحقيقة من «${b}» (${GR[b]} غ) وثقله في التطبيق أكبر (D253 (6))`);
    const SPS = +((code.match(/const SPAN_S = (\d+)/) || [])[1] || 112), MSX = +((code.match(/const MS_X = (\d+)/) || [])[1] || 318);
    const IDK = Object.keys(Object.fromEntries([...(code.match(/const IDC = \{([^}]*)\}/) || ['', ''])[1].matchAll(/(\w+):/g)].map(m => [m[1], 1])));
    const fsrc = re => { const m = code.match(re); return m ? m[0] : null; }, ms_ = fsrc(/function mixSizes\(n, u\) \{[\s\S]*?\n?[^\n]*return out; \}/), gc_ = fsrc(/const gapCount = \(L, u\) => [^;]+;/);
    const MIXF = ms_ ? new Function(ms_ + '; return mixSizes;')() : null, GAPF = gc_ ? new Function(gc_ + '; return gapCount;')() : null;
    const LEN_K = new Set(['strip', 'pencil', 'ribbon', 'worm', 'stick']), SIZE_K = new Set(['circle', 'ball', 'box']), CAT_K = new Set(['short', 'same', 'long', ...Object.keys(WGT), ...IDK]);
    if (!HOUSE.size || !Object.keys(WGT).length || !Object.keys(UU).length) errors.push('فحص S1-U4: لم يُعثر على سجلّات الرسم (HOUSE_DRAW أو WEIGH أو UNIT_U) في الكود');
    const TEEN_FROM = ORDER.indexOf('m1.u4.d5'), TEEN_T = new Set(['rodCount', 'rodBuild', 'rodMatch', 'teenCmp', 'teenTrace']), TEEN_S = new Set(['rodMaker', 'teenWrite', 'rodFactory', 'chaos31']);
    const HF4 = new Set([...((code.match(/const HOUSE_F = new Set\(\[([^\]]*)\]\)/) || ['', ''])[1]).matchAll(/'(\w+)'/g)].map(m => m[1]));
    if (!HF4.size) errors.push('فحص S1-U4: لم يُعثر على HOUSE_F في الكود (ضمير لمس التعدّي)');
    const walkU4 = (v, where, top) => { if (Array.isArray(v)) return v.forEach(x => walkU4(x, where, top)); if (!v || typeof v !== 'object') return; const t = v.t, sc = v.scene, nm = t || sc;
      /* العدد فوق العشرة مكتوباً (البطاقات والبناء والتتبّع) من درس العشرة والآحاد فصاعداً (N010، D229): قبله يُسمع ولا يُكتب */
      if ((TEEN_T.has(t) || TEEN_S.has(sc) || (sc === 'recallU4' && v.pic && v.pic.kind === 'teen')) && TEEN_FROM >= 0 && ORDER.indexOf(top) < TEEN_FROM) errors.push(`${where}: ${nm}: عدد فوق العشرة مكتوب قبل درس العشرة والآحاد (m1.u4.d5)`);
      if (t === 'rodMatch') for (const o of v.opts || []) if (typeof o !== 'number' || o < 0 || o > 20) errors.push(`${where}: rodMatch: الخيار ${o} خارج 0–20`);
      if (t === 'rodMatch' && !(v.opts || []).includes(v.n)) errors.push(`${where}: rodMatch: الجواب ${v.n} ليس في الخيارات`);
      /* الأشياء من سجلّات الرسم: شيء البيت يُقاس، وما يوزن، وما يُرتَّب بحجمه، وفئات اللوحة */
      for (const o of [v.obj, ...(t === 'transPick' ? [v.a, v.b] : []), ...(t === 'orderBy' || t === 'lenPick' ? v.house || [] : []), ...(sc === 'contractorBoard' ? (v.house || []).map(h => h[0]) : [])]) if (o != null && !HOUSE.has(o)) errors.push(`${where}: ${nm}: الشيء «${o}» لا رسم له في HOUSE_DRAW`);
      if (t === 'balance' || (sc === 'recallU4' && v.pic && v.pic.kind === 'weigh')) { const P = t ? v : v.pic; for (const k of [P.a, P.b]) if (!(k in WGT)) errors.push(`${where}: ${nm}: «${k}» ليس في WEIGH`);
        if (P.a in WGT && P.b in WGT && WGT[P.a] === WGT[P.b]) errors.push(`${where}: ${nm}: «${P.a}» و«${P.b}» بثقل واحد، فلا يميل الميزان ولا أثقل`); }
      for (const pr of (sc === 'balanceLab' ? v.pairs : sc === 'gardenBalance' ? v.rounds : []) || []) { for (const k of pr) if (!(k in WGT)) errors.push(`${where}: ${sc}: «${k}» ليس في WEIGH`); if (WGT[pr[0]] === WGT[pr[1]]) errors.push(`${where}: ${sc}: «${pr[0]}» و«${pr[1]}» بثقل واحد`); }
      /* والزوج يوزن بفرقٍ واضح في الحقيقة (مرة ونصف على الأقل بالغرام): ما يقرب ثقلاه يميل في البيت إلى أيّهما (D253 (6)) */
      for (const pr of t === 'balance' ? [[v.a, v.b]] : sc === 'balanceLab' ? v.pairs || [] : sc === 'gardenBalance' ? v.rounds || [] : sc === 'chaosHeavyBadge' ? [[v.big, v.small]] : (sc === 'recallU4' && v.pic && v.pic.kind === 'weigh') || (t === 'reason' && v.pic && v.pic.kind === 'weigh') ? [[v.pic.a, v.pic.b]] : [])
        if (GR[pr[0]] && GR[pr[1]] && Math.max(GR[pr[0]], GR[pr[1]]) / Math.min(GR[pr[0]], GR[pr[1]]) < 1.5) errors.push(`${where}: ${nm}: «${pr[0]}» (${GR[pr[0]]} غ) و«${pr[1]}» (${GR[pr[1]]} غ) متقاربان في الحقيقة، فقد يميل الميزان الحقيقي إلى أيّهما`);
      if (sc === 'chaosHeavyBadge' && !(WGT[v.big] < WGT[v.small])) errors.push(`${where}: chaosHeavyBadge: الكبير «${v.big}» ليس أخفّ من الصغير «${v.small}» (الخطأ المقصود: الأكبر أثقل)`);
      if ((t === 'lenPick' || (t === 'orderBy' && (v.by || 'len') === 'len')) && v.kind && !LEN_K.has(v.kind)) errors.push(`${where}: ${t}: نوع الطول «${v.kind}» غير معروف`);
      if ((t === 'sizePick' || (t === 'orderBy' && v.by === 'size')) && v.kind && !SIZE_K.has(v.kind)) errors.push(`${where}: ${t}: نوع الحجم «${v.kind}» غير معروف`);
      if (t === 'barRead' || t === 'barBuild' || sc === 'chaosBars') { for (const k of v.cats || []) if (!CAT_K.has(k)) errors.push(`${where}: ${nm}: الفئة «${k}» لا رمز لها`);
        if ((v.cats || []).length !== (v.counts || []).length) errors.push(`${where}: ${nm}: الفئات والأعداد بطولين مختلفين`);
        if (t === 'barRead' && ['most', 'least'].includes(v.ask)) { const m = (v.ask === 'most' ? Math.max : Math.min)(...v.counts); if (v.counts.filter(x => x === m).length > 1) errors.push(`${where}: barRead: عمودان ${v.ask === 'most' ? 'أطول' : 'أقصر'} معاً، فلا جواب واحد`); }
        if (t === 'barRead' && v.ask === 'more' && !(v.counts[v.cats.indexOf(v.a)] > v.counts[v.cats.indexOf(v.b)])) errors.push(`${where}: barRead: «كم زاد ${v.a} على ${v.b}؟» والأول ليس أكثر`); }
      /* المقارنة ممكنة: أطوال وأحجام مختلفة، والأشياء داخل المسرح (البداية على MS_X والشيء يمتدّ يساراً) */
      const vals = t === 'lenPick' ? v.lens : t === 'orderBy' || t === 'sizePick' ? v.vals : null;
      if (vals) { if (new Set(vals).size !== vals.length) errors.push(`${where}: ${t}: قيمتان متساويتان (${vals}) فلا ترتيب ولا أطول واحد`);
        const near = [...vals].sort((a, b) => a - b).find((x, i, a) => i && x - a[i - 1] < (t === 'sizePick' || v.by === 'size' ? 4 : 14)); if (near != null) errors.push(`${where}: ${t}: قيمتان متقاربتان (${vals}) لا يميّزهما الطفل بعينه`);
        if (t !== 'sizePick' && v.by !== 'size') vals.forEach((L, i) => { const sh = (v.shift || [])[i] || 0; if (MSX - sh - L < 8) errors.push(`${where}: ${t}: الشيء ${i} (${L} بإزاحة ${sh}) يخرج من المسرح`); });
        else { const n = vals.length, R = 330 / n / 2; for (const r of vals) if (r > R - 1) errors.push(`${where}: ${t}: نصف القطر ${r} أكبر من مكانه (${Math.floor(R - 1)}) فتتراكب الأشياء`); } }
      if (['unitCount', 'unitLay', 'unitCheck'].includes(t)) { if (!(v.unit in UU)) errors.push(`${where}: ${t}: الوحدة «${v.unit}» ليست في UNIT_U`); else if (v.n * UU[v.unit] > MSX - 12) errors.push(`${where}: ${t}: ${v.n} × ${UU[v.unit]} يخرج من المسرح`); }
      /* والقياس الخاطئ يبلغ نهاية الشيء فخطؤه واحد (بدالّتي الكود نفسيهما): المختلطة تبلغها تماماً، والمتباعدة مشبكان على الأقل بفراغ 10 على الأقل، والبداية من الوسط تترك مشبكين على الأقل */
      if (t === 'unitCheck' && v.unit in UU) { const u = UU[v.unit], L = v.n * u;
        if (v.bad === 'mix') { if (!MIXF) errors.push('فحص 4ب4: لم يُعثر على mixSizes في الكود'); else { const z = MIXF(v.n, u), s = z.reduce((a, b) => a + b, 0); if (Math.abs(s - L) > 1 || !z.some(x => x !== u) || z.some(x => !(x > 0))) errors.push(`${where}: unitCheck mix: الوحدات المختلفة لا تبلغ نهاية الشيء أو كلها بالحجم نفسه (${z} = ${s} من ${L})، فالخطأ خطآن أو لا خطأ`); } }
        if (v.bad === 'gap') { if (!GAPF) errors.push('فحص 4ب4: لم يُعثر على gapCount في الكود'); else { const c = GAPF(L, u); if (c < 2 || (L - c * u) / (c - 1) < 10 || c >= v.n) errors.push(`${where}: unitCheck gap: ${c} وحدات بفراغ ${((L - c * u) / (c - 1)).toFixed(1)} على ${L}: لا فراغ واضح أو العدد كالصحيح`); } }
        if (v.bad === 'start' && v.n - 2 < 2) errors.push(`${where}: unitCheck start: ${v.n} أقصر من أن يبدأ من الوسط ويبقى مشبكان`); }
      /* سلّة الشبر: لا يكون الطول على حدّ سلّتين (يُرى بعين الطفل) */
      for (const L of t === 'spanSort' ? [v.len] : sc === 'contractorBoard' ? (v.house || []).map(h => h[1]) : []) for (const b of [SPS * .85, SPS * 1.15]) if (Math.abs(L - b) < 6) errors.push(`${where}: ${nm}: الطول ${L} على حدّ سلّتين (${Math.round(b)})`);
      /* التعدّي في لوحة المقاول (مراجعة فابل B): الشيئان من أشياء اللوحة، أحدهما أطول من الشبر والآخر أقصر منه، فالشبر بينهما ويُستنتج الأطول بلا تجاور؛ ولكلٍّ اسمٌ للمس */
      if (sc === 'contractorBoard' && v.trans) { const H = Object.fromEntries(v.house || []), [a, b] = v.trans.pair || [], cat = L => L < SPS * .85 ? 'short' : L > SPS * 1.15 ? 'long' : 'same';
        if (!(a in H) || !(b in H) || a === b) errors.push(`${where}: contractorBoard: التعدّي بشيئين ليسا من أشياء اللوحة (${a}، ${b})`);
        else if ([cat(H[a]), cat(H[b])].sort().join() !== 'long,short') errors.push(`${where}: contractorBoard: التعدّي بـ«${a}» (${cat(H[a])}) و«${b}» (${cat(H[b])}): يلزم شيء أطول من الشبر وشيء أقصر منه`);
        for (const k of [a, b]) if (!content.labels.ui['h.' + k]) errors.push(`${where}: contractorBoard: لا اسم للشيء «${k}» (h.${k})`);
        if (!(v.trans.lines || []).length) errors.push(`${where}: contractorBoard: التعدّي بلا جملة سؤال`); }
      /* والتعدّي تمريناً وتقييماً (الفحص المستقل A لبوابة S1-U4: كان مرة في الاكتشاف وحدها): بالقاعدة نفسها، ولا طول على حدّ سلّتين، ولكلٍّ اسم */
      if (t === 'transPick') { const cat = L => L < SPS * .85 ? 'short' : L > SPS * 1.15 ? 'long' : 'same';
        /* سلّتان مختلفتان: (أطول، أقصر)، أو (بطوله، أقصر)، أو (أطول، بطوله) — الفحص المستقل C2 لبوابة S1-U4 */
        if (v.a === v.b || cat(v.la) === cat(v.lb)) errors.push(`${where}: transPick «${v.q}»: «${v.a}» (${cat(v.la)}) و«${v.b}» (${cat(v.lb)}): يلزم شيئان من سلّتين مختلفتين`);
        for (const L of [v.la, v.lb]) for (const b of [SPS * .85, SPS * 1.15]) if (Math.abs(L - b) < 6) errors.push(`${where}: transPick: الطول ${L} على حدّ سلّتين (${Math.round(b)})`);
        if (!['longer', 'shorter'].includes(v.ask || 'longer')) errors.push(`${where}: transPick: السؤال «${v.ask}» غير معروف (longer أو shorter)`);
        for (const k of [v.a, v.b]) if (!content.labels.ui['h.' + k]) errors.push(`${where}: transPick: لا اسم للشيء «${k}» (h.${k})`);
        /* وضمير اللمس في جملته بجنس شيئيه معاً (HOUSE_F)، كجمل الميزان: «اِلْمِسْهَا» إن كانا مؤنثين، و«اِلْمِسْهُ» إن لم يكونا. فلا يدلّ الضمير على الجواب
           (الفحص المستقل G1 (2): كان بجنس الجواب، فـ«اِلْمِسْهَا» بين المشط والفرشاة تقول «الفرشاة» قبل أن يقارن الطفل) */
        { const both = HF4.has(v.a) && HF4.has(v.b), c = LINES.get(String(v.q).startsWith('gen.') ? v.q : top + '.' + v.q), tx = c ? c.text : '', fem = /اِلْمِسْهَا/.test(tx), mas = /اِلْمِسْهُ/.test(tx);
          if (fem === mas) errors.push(`${where}: transPick «${v.q}»: في جملته ${fem ? 'ضميرا لمسٍ' : 'لا ضمير لمسٍ'} («اِلْمِسْهُ» أو «اِلْمِسْهَا»)`);
          else if (fem !== both) errors.push(`${where}: transPick «${v.q}»: «${fem ? 'اِلْمِسْهَا' : 'اِلْمِسْهُ'}» وشيئاه «${v.a}» و«${v.b}» ${both ? 'مؤنثان' : 'ليسا مؤنثين'}، فالضمير يدلّ على الجواب أو يخالف جنسيهما (HOUSE_F)`); } }
      for (const [k, x] of Object.entries(v)) if (!['lines', 'labels'].includes(k)) walkU4(x, where, top); };
    for (const L of Object.values(lessons)) walkU4(L, L.id, L.id); }
  // 4ب3) التوأم (الفحص المستقل B، المبدأ 5): كل بند يُشغَّل بالمساعدة (التمرين، والعلاج، ومراحل البنود بوضع التمرين أو العلاج) من نوعٍ توأمُه في بياناته
  //      (دالة twin في الكود تعيد item.twin) له توأم؛ ولا توأم للتوأم (يُشغَّل مرة واحدة)، ولا توأم في بند لا يُشغَّل توأمه (التقييم والاكتشاف)
  { const TWIN_DATA = new Set(), starts = [...code.matchAll(/^ITEM\.(\w+) = \{/gm)];
    starts.forEach((m, i) => { const body = code.slice(m.index, i + 1 < starts.length ? starts[i + 1].index : undefined); if (/twin\(item\) \{ return item\.twin \|\| null; \}/.test(body)) TWIN_DATA.add(m[1]);
      /* ولكل نوع بند توأم (من الكود أو من بياناته): «twin: () => null» كان يُسقط التوأم صامتاً في ثمانية أنواع (الفحص المستقل B) */
      if (!/\btwin[(:]/.test(body) || /twin: \(\) => null/.test(body)) errors.push(`نوع البند ${m[1]} بلا توأم: twin من الكود أو twin(item) { return item.twin || null; } مع توأم في البيانات (المبدأ 5)`); });
    if (!TWIN_DATA.size) errors.push('فحص التوأم: لم يُعثر على نوع بند توأمه في بياناته (تغيّرت صيغة twin في الكود؟)');
    /* الحلّ المشترك يُرسم في المحاولة التي يخدمها (D257(5)(و)، الفحص المستقل C: عدّ القطار ثم يُمحى ويُرسم قطار نظيف، وسهم اليمين يُمحى قبل اللمس):
       together لا يرسم على مسرح المحاولة السابقة r.ctx، فالمسرح يُرسم من جديد في ask التالية */
    starts.forEach((m, i) => { const body = code.slice(m.index, i + 1 < starts.length ? starts[i + 1].index : undefined), t = body.search(/(?:async )?together\(/);
      if (t < 0) return; const rest = body.slice(t), e = rest.search(/\n {2}(?:async )?\w+[(:]|, (?:async )?(?:reveal|mark|praise|twin|reason|hint2)\b/), tb = e < 0 ? rest : rest.slice(0, e);
      const pm = tb.match(/together\(\s*\w+\s*,\s*(\w+)/), rn = pm ? pm[1] : null;   /* باسم المعامل الثاني أيّاً كان (الفحص المستقل D: q.ctx لم يُرَ) */
      const dz = /together\(\s*\w+\s*,\s*\{[^}]*\bctx\b/.test(tb);   /* وبمعامل مفكّك together(item, { ctx }) (الفحص المستقل E) */
      if (dz || rn && (new RegExp('\\b' + rn + '\\.ctx\\b').test(tb) || new RegExp('\\{[^}]*\\bctx\\b[^}]*\\} = ' + rn + '\\b').test(tb))) errors.push(`نوع البند ${m[1]}: الحلّ المشترك (together) يرسم على مسرح المحاولة السابقة r.ctx، فيُمحى قبل أن يجيب الطفل (D257(5)(و))`); });
    /* الكشف لا يطلب من الطفل فعلاً (الفحص المستقل C، ن-ك5): جمل الحلّ gen.solve.* تنتهي بـ«أكمل/اختر الآن»، فلا تُقال في reveal */
    starts.forEach((m, i) => { const body = code.slice(m.index, i + 1 < starts.length ? starts[i + 1].index : undefined), r = body.search(/\n {2}async reveal\(|\n {2}reveal\(| async reveal\(/);
      if (r < 0) return; const rest = body.slice(r + 1), e = rest.search(/\n {2}(?:async )?\w+[(:]|, (?:async )?(?:mark|praise|twin|reason)\b/), rv = e < 0 ? rest : rest.slice(0, e);
      if (/'gen\.solve\./.test(rv)) errors.push(`نوع البند ${m[1]}: الكشف يقول جملة حلّ gen.solve.* («أكمل الآن») والجواب ظاهر`); });
    const items = (L, help) => { const st = L.flow.filter(s => s.scene === 'items'); const P = L.practice || {}, M = L.mastery || {};
      return help ? [...(P.normal || []), ...(P.challenge || []), ...Object.values(M.remedial || {}).flat(), ...st.filter(s => ['practice', 'remedial'].includes(s.mode)).flatMap(s => s.items || [])]
        : [...Object.values(M.concepts || {}).flat(), ...(M.mixed ? [M.mixed.item] : []), ...(L.review || []), ...((L.test && L.test.items) || []).map(q => q.item), ...st.filter(s => !['practice', 'remedial'].includes(s.mode)).flatMap(s => s.items || [])]; };
    for (const L of Object.values(lessons)) {
      for (const it of items(L, true)) if (TWIN_DATA.has(it.t)) { if (!it.twin || typeof it.twin !== 'object' || typeof it.twin.t !== 'string') errors.push(`${L.id}: البند «${it.q}» (${it.t}) يُشغَّل بالمساعدة بلا توأم (المبدأ 5، الفحص المستقل B)`);
        else if (it.twin.twin) errors.push(`${L.id}: توأم البند «${it.q}» له توأم، والتوأم يُشغَّل مرة واحدة`); }
      for (const it of items(L, false)) if (it && it.twin) errors.push(`${L.id}: البند «${it.q}» في تقييم أو اكتشاف وله توأم لا يُشغَّل`); } }
  // 4ب18) كل موضع يُطلب له جملة حلّه (كان «4ب4» في S1-U3، وأخذت S1-U4 الرقم نفسه) (المستوى 3) وكلمته (الكشف): وفراغات الطابور g0…gN كلمتها أمام وبين وخلف (الفحص المستقل B: «gen.solve.pos.g1» غير موجودة فتوقّف الدرس)
  { const pkw = a => /^beside/.test(a || '') ? 'beside' : a;
    const walkP = (v, where) => { if (Array.isArray(v)) return v.forEach(x => walkP(x, where)); if (!v || typeof v !== 'object') return;
      if (v.t === 'place') { let w = pkw(v.at);
        if (v.ref === 'queue') { const n = (v.members || []).length, m = /^g(\d+)$/.exec(v.at || ''); if (!m || +m[1] > n) errors.push(`${where}: place «${v.q}»: فراغ الطابور «${v.at}» ليس من g0 إلى g${n}`); w = !m ? null : +m[1] === 0 ? 'front' : +m[1] === n ? 'behind' : 'between'; }
        if (v.word) w = v.word;
        if (w && !LINES.has('gen.solve.pos.' + w)) errors.push(`${where}: place «${v.q}»: لا جملة حلّ لموضعه gen.solve.pos.${w}`);
        if (w && !LINES.has('gen.pos.' + w) && !LINES.has('gen.reveal.pos.' + w)) errors.push(`${where}: place «${v.q}»: لا كلمة لموضعه في الكشف (gen.pos.${w} أو gen.reveal.pos.${w})`); }
      /* الصندوق إمّا مفتوح (ما في داخله يُرى) أو مغلق (ما فوق غطائه): فلا يجتمع «داخل» و«فوق» في صورة واحدة (وُجد في توأم «ما الذي داخل الصندوق؟»: الدب فوقه أغلقه فاختفت الكرة) */
      if ((v.t === 'where' || v.t === 'place') && v.pic && v.pic.ref === 'chest') { const at = [...(v.pic.put || []).map(p => p[1]), v.pic.at].filter(Boolean); if (at.includes('in') && at.includes('on')) errors.push(`${where}: ${v.t} «${v.q}»: الصندوق فيه شيء «داخل» وشيء «فوق» معاً، والغطاء المغلق يخفي ما في داخله`); }
      if (v.t === 'lineTap' && v.row && v.row.kind === 'queue' && v.ask !== 'ord') { const s3 = ['front', 'behind', 'between', 'first', 'last'].includes(v.ask) ? v.ask : 'riddle';
        for (const id of ['gen.solve.pos.' + s3, 'gen.reveal.pos.' + v.ask]) if (!LINES.has(id)) errors.push(`${where}: lineTap «${v.q}» في الطابور: جملة غير موجودة ${id}`); }
      if (v.t === 'where') { const w = pkw(v.want || (v.pic && v.pic.at));
        for (const id of ['gen.solve.pos.' + w, 'gen.pos.' + w, ...(v.ask === 'thing' ? [] : (v.words || []).map(o => 'gen.pos.' + o))]) if (!LINES.has(id)) errors.push(`${where}: where «${v.q}»: جملة غير موجودة ${id}`); }
      for (const [k, x] of Object.entries(v)) if (!['lines', 'labels'].includes(k)) walkP(x, where); };
    for (const L of Object.values(lessons)) walkP(L, L.id); }
  // 4ب5) موضع الجواب لا يدلّ عليه (الفحص المستقل C، ن-ك1؛ والفحص المستقل D، ك2): الخيارات بترتيب ثابت («فوق أم تحت؟»، و«في أيّ عربة؟»، و«على يمينه أم
  //      يساره؟»، و«نعم/لا»، و«بقي كما هو/تغيّر») لا يكون جوابها في الموضع نفسه في أكثر من ثلثي بنود النوع في الوحدة، ولا في بنود المساعدة وحدها؛
  //      ولا في كل بنود المسار الرئيس للدرس (التمرين العادي والإتقان) إن كانت ثلاثة فأكثر. و«فوق أم تحت؟» يُقرأ خياراه بترتيبهما في السؤال
  //      (كان جواب «فوق أم تحت؟» أول الكلمتين في بنود المساعدة السبعة كلها، وجواب «في أيّ عربة؟» الزرّ الأوسط في الإتقان والتمرين)
  { const ROOTW = { on: 'فوق', under: 'تحت', in: 'داخل', out: 'خارج', beside: 'بجانب' }, bare = s => s.replace(/[ً-ْ]/g, ''), pkw = a => /^beside/.test(a || '') ? 'beside' : a;
    const NAME = { where: '«أين هو؟»', linePick: '«في أيّ عربة؟»', lrPick: '«على يمينه أم يساره؟»', yesno: '«نعم/لا»', same: '«بقي كما هو/تغيّر»',
      /* S1-U4: الأشياء والخيارات في أماكن ثابتة من البيانات (الصفوف من الأعلى، والدوائر والبطاقات من اليمين، وكفّتا الميزان، والشبران، واللوحتان، وسلال الشبر) */
      lenPick: '«أيّها أطول/أقصر؟»', sizePick: '«أيّها أكبر/أصغر؟»', balance: '«أيّهما أثقل/أخف؟»', teenCmp: '«أيّهما أكثر؟»', rodMatch: '«المس بطاقته/بناءه»',
      spanPick: '«شبر مَن…؟»', unitCheck: '«أيّ القياسين صحيح؟»', spanSort: 'سلّة الشبر', barRead: '«أيّ عمود أطول/أقصر؟»', transPick: '«أيّهما أطول/أقصر؟» بالشبر (التعدّي)',
      /* S1-U2: البرجان والبطاقتان يميناً ويساراً (الفحص المستقل I1 (3ج): «أكثر ← اليسار، أقلّ ← اليمين» أصابت التمرين العادي في د3، و«المس اليمين» مراجعته) */
      compare: '«أيّهما أكثر/أقلّ؟» بالبرجين', cmpDigits: '«أيّ العددين أكبر؟»' };
    const WG = (() => { const i = code.indexOf('const WEIGH = {'); return i < 0 ? {} : Object.fromEntries([...code.slice(i, i + 3000).matchAll(/(\w+): \{ w: (\d+)/g)].map(m => [m[1], +m[2]])); })();
    const SPS5 = +((code.match(/const SPAN_S = (\d+)/) || [])[1] || 112), ext = (a, f) => a.indexOf(f(...a));
    const ansIdx = v => v.t === 'where' && v.ask !== 'thing' && Array.isArray(v.words) ? v.words.indexOf(pkw(v.want || v.pic.at)) : v.t === 'linePick' ? (v.opts || []).indexOf(v.k)
      : v.t === 'lrPick' ? (v.side === 'R' ? 0 : 1) : v.t === 'yesno' ? (v.ans ? 0 : 1) : v.t === 'same' ? (v.add ? 1 : 0)
      : v.t === 'lenPick' ? ext(v.lens, v.ask === 'short' ? Math.min : Math.max) : v.t === 'sizePick' ? ext(v.vals, v.ask === 'small' ? Math.min : Math.max)
      : v.t === 'balance' && (v.mode || 'read') !== 'test' ? ((WG[v.a] > WG[v.b]) === ((v.ask || 'heavy') === 'heavy') ? 0 : 1)
      : v.t === 'teenCmp' ? ((v.a > v.b) === ((v.ask || 'more') === 'more') ? 0 : 1) : v.t === 'rodMatch' ? (v.opts || []).indexOf(v.n)
      : v.t === 'spanPick' ? ((v.a < v.b) === ((v.ask || 'longer') === 'longer') ? 0 : 1) : v.t === 'unitCheck' ? ((v.top || 'ok') === 'ok' ? 0 : 1)
      : v.t === 'transPick' ? ((v.la > v.lb) === ((v.ask || 'longer') === 'longer') ? 0 : 1)
      : v.t === 'compare' ? (v.a === v.b ? null : (v.a > v.b) === (v.ask !== 'less') ? 0 : 1) : v.t === 'cmpDigits' ? (v.a > v.b ? 0 : 1)
      : v.t === 'spanSort' ? (v.len < SPS5 * .85 ? 0 : v.len > SPS5 * 1.15 ? 2 : 1) : v.t === 'barRead' && ['most', 'least'].includes(v.ask) ? ext(v.counts, v.ask === 'most' ? Math.max : Math.min) : null;
    /* ومراجعة مفهومٍ في إتقانه السؤالان المتعاكسان لنوعٍ («أطول؟» و«أقصر؟»، «أكبر؟» و«أصغر؟»…) فيها السؤالان إن كان فيها ذلك النوع: «مراجعة اليوم» تعرض بنود المفهوم
       بالتناوب، فمراجعةٌ بسؤالٍ واحد يصيبها من يعكس الكلمة أو يتجاهلها (الفحص المستقل J1 (5): مراجعتا C014 وC025 بسؤالٍ واحد، ومثلهما C024) */
    { const OPP = { lenPick: ['long', 'short', 'long'], sizePick: ['big', 'small', 'big'], balance: ['heavy', 'light', 'heavy'], transPick: ['longer', 'shorter', 'longer'], teenCmp: ['more', 'less', 'more'], compare: ['more', 'less', 'more'], barRead: ['most', 'least', null] };
      const askOf = v => v.ask || OPP[v.t][2];
      const AW = { long: 'أطول', short: 'أقصر', big: 'أكبر', small: 'أصغر', heavy: 'أثقل', light: 'أخفّ', longer: 'أطول', shorter: 'أقصر', more: 'أكثر', less: 'أقلّ', most: 'الأكثر', least: 'الأقلّ' };
      for (const L of Object.values(lessons)) { const M = L.mastery || {};
        for (const [C, items] of Object.entries(M.concepts || {})) for (const t of Object.keys(OPP)) { const mq = new Set(items.filter(v => v && v.t === t).map(askOf));
          if (!(mq.has(OPP[t][0]) && mq.has(OPP[t][1]))) continue; const rv = (L.review || []).filter(v => v && v.c === C && v.t === t); if (!rv.length) continue;
          const rq = new Set(rv.map(askOf)); if (!(rq.has(OPP[t][0]) && rq.has(OPP[t][1]))) errors.push(`${L.id}: مراجعة ${C} في ${NAME[t]} بسؤال «${[...rq].map(q => AW[q] || q).join('، ')}؟» وحده (${rv.map(v => '«' + v.q + '»').join('، ')})، وفي إتقانه السؤالان: يصيبها من يعكس الكلمة (4ب5)`); } } }
    /* والتوأم بعد الكشف ليس جوابه في موضع جواب أصله، لكل نوعٍ له موضع جواب (الفحص المستقل J1 (4): توأما pr.2 وpr.c4 في د8، وتوأما pr.1 وpr.c1 في S1-U3 د1؛ وكانت
       القاعدة للطول (4ب11، ومعه اللون) وللتعدّي وحدهما، وما ثبت في نوعٍ يُطبَّق على أخواته: الدرس 242) */
    for (const L of Object.values(lessons)) { const tw5 = x => { if (Array.isArray(x)) return x.forEach(tw5); if (!x || typeof x !== 'object') return; const T = x.twin;
        if (T && typeof x.t === 'string' && T.t === x.t && !['lenPick', 'transPick'].includes(x.t)) { const a = ansIdx(x), b = ansIdx(T); if (a != null && a >= 0 && a === b) errors.push(`${L.id}: توأم «${x.q}» (${NAME[x.t] || x.t}) جوابه في الموضع ${a + 1} كأصله، وقد كُشف للتوّ (4ب5)`); }
        for (const [k, y] of Object.entries(x)) if (!['twin', 'lines', 'labels'].includes(k) && y && typeof y === 'object') tw5(y); };
      tw5([L.flow, L.practice, L.mastery, L.review, L.test, L.twins]); }
    /* ومواضع النوع بعدد خياراته (الثاني من اثنين أسفلهما، والثاني من ثلاثة أوسطها) */
    /* والميزان بطريقته: التوقّع من الصورة (الشيئان على الأرض) غير قراءة الكفّتين */
    const kindOf = v => ['lenPick', 'sizePick', 'rodMatch'].includes(v.t) ? v.t + '#' + (v.lens || v.vals || v.opts || []).length + ' خيارات' : v.t === 'balance' ? v.t + '#' + ((v.mode || 'read') === 'pic' ? 'من الصورة' : 'بالميزان') : v.t === 'spanPick' ? v.t + '#' + ((v.ask || 'longer') === 'longer' ? 'أطول' : 'عدّ أكثر') : v.t;
    const kName = k => { const [t, sub] = k.split('#'); return NAME[t] + (sub ? ' (' + sub + ')' : ''); };
    const lists = (L, help) => { const st = L.flow.filter(s => s.scene === 'items'); const P = L.practice || {}, M = L.mastery || {};
      const base = help ? [...(P.normal || []), ...(P.challenge || []), ...Object.values(M.remedial || {}).flat(), ...st.filter(s => ['practice', 'remedial'].includes(s.mode)).flatMap(s => s.items || [])]
        : [...Object.values(M.concepts || {}).flat(), ...(M.mixed ? [M.mixed.item] : []), ...(L.review || []), ...((L.test && L.test.items) || []).map(q => q.item), ...st.filter(s => !['practice', 'remedial'].includes(s.mode)).flatMap(s => s.items || [])];
      return help ? [...base, ...base.map(it => it && it.twin).filter(Boolean)] : base; };
    const per = {}, add = (k, i) => { const c = per[k] = per[k] || {}; c[i] = (c[i] || 0) + 1; };
    /* ولكل خطأ في «أيّ أمر اتّبع الروبوت؟» يُشغَّل بالمساعدة حلٌّ مشترك بجملته (RB_WATCH، الفحص المستقل C، ن-ث3)، ولا يُسجَّل حلٌّ لخطأ لا يبلغه بند بمساعدة (D) */
    const RBW = new Set([...((code.match(/const RB_WATCH = \{([^}]*)\}/) || [])[1] || '').matchAll(/(\w+):/g)].map(m => m[1])), rbUsed = new Set();
    for (const L of Object.values(lessons)) for (const v of lists(L, true)) if (v && v.t === 'robotWatch') for (const o of v.opts || []) if (!o.ok) { rbUsed.add(o.err || 'rbWrong'); if (!RBW.has(o.err || 'rbWrong')) errors.push(`${L.id}: robotWatch «${v.q}»: لا حلّ مشترك لخطئه «${o.err || 'rbWrong'}» في RB_WATCH (الحلّ بحسب الخطأ نفسه)`); }
    for (const e of RBW) if (!rbUsed.has(e)) errors.push(`RB_WATCH: الخطأ «${e}» لا يبلغه بند بمساعدة، فجملته تُسجَّل ولا تُقال`);
    /* وحلّ خطأ الجهة («هل دار إلى جهة الشريط؟») وسؤاله لانعطافة واحدة: فبرنامج بندٍ بطاقته الخاطئة rbTurnSide فيه انعطافة واحدة (الفحص المستقل E: توأم بانعطافتين) */
    { const rw = (v, L) => { if (Array.isArray(v)) return v.forEach(x => rw(x, L)); if (!v || typeof v !== 'object') return;
        if (v.t === 'robotWatch' && (v.opts || []).some(o => o.err === 'rbTurnSide') && (v.prog || []).filter(c => c === 'L' || c === 'R').length !== 1) errors.push(`${L.id}: robotWatch «${v.q}» (${(v.prog || []).join('')}): خطأ الجهة وحلّه لانعطافة واحدة، وفي البرنامج ${(v.prog || []).filter(c => c === 'L' || c === 'R').length}`);
        for (const [k, x] of Object.entries(v)) if (!['lines', 'labels'].includes(k)) rw(x, L); };
      for (const L of Object.values(lessons)) rw(L, L); }
    /* الكرسي مرجعٌ للتقييم وحده (D257 (1)، الفحص المستقل A): يقيس نقل الكلمة إلى شيء لم يُتمرَّن عليه، فلا يظهر في تمرين ولا لعبة ولا توأم ولا علاج ولا اكتشاف (الفحص المستقل D) */
    for (const L of Object.values(lessons)) for (const v of [...lists(L, true), ...L.flow.filter(s => s.scene === 'items' && !['practice', 'remedial'].includes(s.mode)).flatMap(s => s.items || [])])
      if (v && (v.ref === 'chair' || (v.pic && v.pic.ref === 'chair'))) errors.push(`${L.id}: ${v.t} «${v.q}»: الكرسي مرجع للتقييم وحده، وهنا يُعرض قبله`);
    for (const L of Object.values(lessons)) { for (const help of [true, false]) for (const v of lists(L, help)) { if (!v || typeof v.t !== 'string') continue; const i = ansIdx(v); if (i == null) continue;
        if (i < 0) { errors.push(`${L.id}: ${v.t} «${v.q}»: الجواب ليس بين الخيارات`); continue; }
        if (v.t === 'where') { const c = LINES.get(v.q.startsWith('gen.') ? v.q : L.id + '.' + v.q); if (c) { const t = bare(c.text.replace(GEN_RX, '$1')), at = v.words.map(w => ROOTW[w] ? t.indexOf(ROOTW[w]) : -1);
          if (at.some(x => x < 0)) errors.push(`${L.id}: where «${v.q}»: السؤال لا يسمّي الخيارات كلها ${JSON.stringify(v.words)}`);
          else if (at.some((x, k) => k && x < at[k - 1])) errors.push(`${L.id}: where «${v.q}»: الخيارات تُقرأ بغير ترتيبها في السؤال ${JSON.stringify(v.words)}`); } }
        add(L.unit + '|' + kindOf(v) + '|كلها', i); if (help) add(L.unit + '|' + kindOf(v) + '|بالمساعدة', i); }
      const main = [...((L.practice || {}).normal || []), ...Object.values((L.mastery || {}).concepts || {}).flat()];
      for (const t of new Set(main.filter(v => v && NAME[v.t]).map(kindOf))) { const ix = main.filter(v => v && kindOf(v) === t).map(ansIdx).filter(i => i != null && i >= 0); if (ix.length >= 3 && new Set(ix).size === 1) errors.push(`${L.id}: ${kName(t)}: الجواب في الموضع ${ix[0] + 1} في كل بنود التمرين العادي والإتقان (${ix.length})`); } }
    /* ولا يجيب مساراً أو تقييماً كله موضعُ الجواب، ولا موضعُ صاحب الصفة (الأطول، والأثقل، والأكبر، والأكثر) فيما له خياران: قاعدة «الأطول في السلّة اليمنى» تقرن السؤال
       بالجهة («أطول ← اليمين، أقصر ← اليسار»)، ولا يراها عدُّ الموضع وحده (الفحص المستقل H1 (5): التحدّي والمراجعة والتوائم في التعدّي، والأثقل في الكفّة اليمنى في تقييم
       الدرس 2، والقياس الصحيح في اللوحة العليا في تقييم الدرس 3). المسارات: التمرين العادي، والتحدّي، وإتقان كل مفهوم، وتقييم الدرس، وتقييم الوحدة؛ والحدّ الكلّ لما دون أربعة، والنصف (بجبر الكسر) لما فوقها */
    /* (الفحص المستقل I1 (3)): وموضع الجواب وحده لكل نوع في كل مسار (لا صاحب الصفة وحده)، والميزان بكفّته أياً كان نمطه (الصورة والقراءة صنفان في عدّ الوحدة
       وحده)، وصاحب الشبر الأطول هو صاحب أقلّ الأشبار عدداً (كان يُسمّى صاحب الأقصر فتقول الرسالة موضعاً مقلوباً)؛ و«المس اليمين» تعبر الأنواع: ما فيه شيئان يميناً
       ويساراً (الدوائر والميزان وبطاقات العدد والسلّتان والبرجان) يُعدّ أيضاً معاً إن اختلفت أنواعه في المسار (مراجعة S1-U2 د3: بطاقتان وبرجان، والجواب يمين في الاثنين)؛
       وما فيه شيئان أعلى وأسفل (الشريطان، والشبران: الفرجار أعلى والفوضى أسفل، واللوحتان) عائلةٌ أخرى تُقاس كذلك (الفحص المستقل J1 (3): كان الشبران في عائلة اليمين
       واليسار، فموضعهما الأول «الأعلى» يُعدّ مع «اليمين» ولا قاعدة طفلٍ تجمعهما) */
    { const own = v => v.t === 'transPick' ? (v.la > v.lb ? 0 : 1) : v.t === 'balance' && (v.mode || 'read') !== 'test' ? (WG[v.a] > WG[v.b] ? 0 : 1) : v.t === 'spanPick' ? (v.a < v.b ? 0 : 1)
        : v.t === 'teenCmp' ? (v.a > v.b ? 0 : 1) : v.t === 'lenPick' && v.lens.length === 2 ? (v.lens[0] > v.lens[1] ? 0 : 1) : v.t === 'sizePick' && v.vals.length === 2 ? (v.vals[0] > v.vals[1] ? 0 : 1)
        : v.t === 'compare' ? (v.a === v.b ? null : v.a > v.b ? 0 : 1) : v.t === 'cmpDigits' ? (v.a > v.b ? 0 : 1) : null;
      const OWNN = { transPick: 'الأطول', balance: 'الأثقل', spanPick: 'صاحب الشبر الأطول', teenCmp: 'الأكثر', lenPick: 'الأطول', sizePick: 'الأكبر', compare: 'الأكثر', cmpDigits: 'الأكبر', H2: 'صاحب الصفة', TB: 'صاحب الصفة' };
      const H2K = new Set(['sizePick', 'balance', 'teenCmp', 'transPick', 'compare', 'cmpDigits']), TBK = new Set(['lenPick', 'spanPick', 'unitCheck']), sideKey = v => v.t === 'balance' ? 'balance' : kindOf(v);
      const nmOf = v => v.q || (v.t + '(' + ['a', 'b', 'n', 'ask'].filter(k => v[k] != null).map(k => v[k]).join('،') + ')');
      /* والبند الواحد في مسارين من تقييم الدرس (الإتقان والمراجعة) يُعدّ مرة: بياناته لا اسمه (pr.4 في د3 بندان مختلفان بجملة واحدة) */
      const ident = v => JSON.stringify(Object.fromEntries(Object.entries(v || {}).filter(([k]) => !['twin', 'c', 'lines'].includes(k)).sort()));
      const side = (scope, list0, where) => { const by = new Map(), put = (kk, x, v) => { if (!by.has(kk)) by.set(kk, []); by.get(kk).push([x, nmOf(v), v.t]); };
        const list = list0.filter((v, i) => list0.findIndex(w => ident(w) === ident(v)) === i);
        for (const v of list) { if (!v || typeof v.t !== 'string' || !NAME[v.t]) continue; const k = sideKey(v), o = own(v), i = ansIdx(v);
          if (o != null) put(k + '|own', o, v); if (i != null && i >= 0) put(k + '|ans', i, v);
          if (H2K.has(v.t) && (v.t !== 'sizePick' || (v.vals || []).length === 2)) { if (o != null) put('H2|own', o, v); if (i != null && i >= 0) put('H2|ans', i, v); }
          if (TBK.has(v.t) && (v.t !== 'lenPick' || v.lens.length === 2)) { if (o != null) put('TB|own', o, v); if (i != null && i >= 0) put('TB|ans', i, v); } }
        for (const [kk, xs] of by) { const [k, w] = kk.split('|'); if ((k === 'H2' || k === 'TB') && new Set(xs.map(x => x[2])).size < 2) continue;   /* نوعٌ واحد: عدّه بنوعه */
          const n = xs.length, pos = [...new Set(xs.map(x => x[0]))], c = pos.map(q => xs.filter(x => x[0] === q).length), m = Math.max(...c), top = pos[c.indexOf(m)];
          if (n >= 2 && (n < 4 ? m === n : m > Math.ceil(n / 2))) errors.push(`${where}: ${k === 'H2' ? 'الشيئان يميناً ويساراً (' + [...new Set(xs.map(x => x[2]))].join('، ') + ')' : k === 'TB' ? 'الشيئان أعلى وأسفل (' + [...new Set(xs.map(x => x[2]))].join('، ') + ')' : k === 'balance' ? NAME.balance : kName(k)} في ${scope}: ${w === 'own' ? OWNN[k.split('#')[0]] + ' في الموضع ' + (top + 1) : 'الجواب في الموضع ' + (top + 1)} في ${m} من ${n} (${xs.map(x => '«' + x[1] + '»').join('، ')})، فيكفي الطفلَ موضعُه (4ب5)`); } };
      const UA = new Map();
      for (const L of Object.values(lessons)) { const P = L.practice || {}, M = L.mastery || {};
        const A = [...Object.values(M.concepts || {}).flat(), ...(M.mixed ? [M.mixed.item] : []), ...(L.review || []), ...((L.test && L.test.items) || []).map(q => q.item)];
        side('التمرين العادي', P.normal || [], L.id); side('التحدّي', P.challenge || [], L.id); side('تقييم الدرس', A, L.id);
        for (const [C, items] of Object.entries(M.concepts || {})) side('إتقان ' + C, items, L.id);
        /* ومراجعة كل مفهوم مسارٌ («مراجعة اليوم» تعرض بنداً منها، وبعد الخطأ الآخر: الفحص المستقل I1 (2)) */
        { const RV = new Map(); for (const v of L.review || []) if (v && v.c) { if (!RV.has(v.c)) RV.set(v.c, []); RV.get(v.c).push(v); } for (const [C, items] of RV) side('مراجعة ' + C, items, L.id); }
        if (!UA.has(L.unit)) UA.set(L.unit, []); UA.get(L.unit).push(...A); }
      for (const [u, A] of UA) side('تقييم الوحدة', A, u); }
    for (const [k, c] of Object.entries(per)) { const n = Object.values(c).reduce((a, b) => a + b, 0), [u, tk, nm] = k.split('|'), [top, m] = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
      if (n >= 3 && m > 2 * n / 3) errors.push(`${u}: ${kName(tk)} ${nm}: الجواب في الموضع ${+top + 1} في ${m} من ${n}، فيكفي الطفلَ موضعُه (المطلوب ثلثا البنود على الأكثر)`); } }
  // 4ب7) صيغتا الولد والبنت (المبدأ 9): كلمةٌ يُخاطَب بها الطفل بصيغتين في جملةٍ ما (فعل أمر أو ضمير) لا تأتي بصيغة الولد وحدها في جملة أخرى
  //      (الفحص المستقل A لبوابة S1-U4: «رَتِّبِ» بالمذكّر وحده في ثماني عشرة جملة، فتسمع البنت «رَتِّبِ… الَّتِي قِسْتِهَا»). الكلمة بلا علامات الترقيم وبلا حركة آخرها
  //      (فـ«رَتِّبْ» و«رَتِّبِ» قبل همزة الوصل كلمة واحدة)، والمذكّر منها ما ليس في صيغة البنت من الزوج نفسه
  //      والمقصود الأمر: فلا يُعدّ ما أوّله ت أو ي أو ن (المضارع: «تَقِفُ» للغائبة كالمخاطب) ولا الاسم المعرّف أو المبدوء بميم ولا ما آخره ضمير الغائب،
  //      ولا ما بين علامتي تنصيص (اسم لعبة أو زرّ أو أمرٌ يُعرَّف: «أَكْمِلِ الإِطَارَ»، «ارْجِعْ»)
  //      وما لا يختلف فيه الزوج إلا بحركة الآخر يُقارَن بحركته: «أَنْتَ/أَنْتِ» و«إِصْبَعِكَ/إِصْبَعِكِ» و«قِسْتَ/قِسْتِ» (الفحص المستقل C1 لبوابة S1-U4: «وَأَنْتَ تَعُدُّ»
  //      و«وَأَنْتَ تُدِيرُهُ» و«بِإِصْبَعِكَ» بصيغة الولد وحدها، والقاعدة تحذف حركة الآخر فلا تفرّقها)، بالواو والفاء والباء واللام قبله. وما آخره ضمير الغائب يُعفى
  //      إلا أمرٌ صيغةُ البنت منه بياءٍ قبل الضمير («اِسْحَبْهُ/اِسْحَبِيهِ»)، فلا يُعفى إلا الاسم («يَدِهِ» للروبوت) والمضارع للغائبة
  { const bare = w => w.replace(/[\u064B-\u0652]/g, ''), punct = w => w.replace(/[«»"()،.؟!:,؛]/g, '').replace(/^ا[\u064E-\u0650]/, 'ا'), base = w => w.replace(/[\u064B-\u0652]+$/, ''), norm = w => base(punct(w)), marks = new Map(), vmarks = new Map();   /* وهمزة الوصل بحركتها وبلا حركة سواء («اِخْتَرْ» و«اخْتَرْ») */
    /* والأمر الذي يشبه المستثنى («اِلْمِسْهُ» يبدأ بـ«ال»، و«مَرِّرْ» بالميم) لا يُستثنى: صيغة البنت منه في الزوج نفسه بياءٍ في آخره أو قبل ضميره */
    const PRON = /(ه|ها|هم)$/, femImp = (b, fb) => fb.has(b + 'ي') || (PRON.test(b) && fb.has(b.replace(PRON, 'ي$1')));
    /* والمضارع المخاطب بزوجه («تَظُنُّهُ/تَظُنِّينَهُ»، «تَعُدُّ/تَعُدِّينَ»): ما أوّله ت يُعدّ إن كانت صيغة البنت منه في الزوج نفسه بـ«ين» (الفحص المستقل D1 لبوابة S1-U4:
       نجت «تَظُنُّهُ» بلا زوج، والمضارع مُعفى كله لأن «تَقِفُ» للغائبة كالمخاطب) */
    const femPres = (b, fb) => PRON.test(b) && fb.has(b.replace(PRON, 'ين$1'));   /* بضمير المفعول وحده: «تَصِلُ» و«تَقُولُ» و«تَقِفُ» بلا ضمير للغائبة أيضاً («أين تصل نهايتها؟») */
    const order = (n, fb) => { const b = bare(n); if (/^ت/.test(b)) return femPres(b, fb); return !/^[ين]/.test(b) && (!(/^م/.test(b) || /^ال/.test(b) || PRON.test(b)) || femImp(b, fb)); };   /* وما أوّله ت أو ي أو ن يُستثنى كله: «تَوَقَّفْ» أمرٌ و«تَوَقَّفَ» ماضٍ لغائب */
    /* والتسميات أيضاً (يقرؤها قارئ الشاشة ويُرى بعضها): «اخْتَرْ صُورَتَكَ» كانت بصيغة الولد وحدها (الفحص المستقل C2 لبوابة S1-U4) */
    const pre = w => [w, w.replace(/^[وف]َ/, ''), w.replace(/^(?:[وف]َ)?[بل]ِ/, '')];
    const T7 = [...clips, ...Object.entries((content.labels && content.labels.ui) || {}).map(([k, v]) => ({ full: 'التسمية ' + k, text: Array.isArray(v) ? v.join(' ') : v }))];
    for (const c of T7) for (const m of String(c.text).matchAll(GEN_RX)) { const F = m[2].split(/\s+/).map(punct).filter(Boolean), fw = new Set(F.map(base)), fb = new Set(F.map(bare)), fF = new Set(F), fB = new Map(F.map(w => [base(w), w]));
      for (const w0 of m[1].split(/\s+/)) { const w = punct(w0), n = base(w); if (!n) continue;
        if (order(n, fb) && !fw.has(n) && !marks.has(n)) marks.set(n, c.full);
        if (!fF.has(w) && fB.has(n) && fB.get(n) !== w && /[\u064B-\u0652]$/.test(w)) for (const x of (/ك$/.test(bare(w)) ? pre(w) : [w])) if (bare(x).length > 2 && !vmarks.has(x)) vmarks.set(x, c.full); } }   /* وضمير المخاطب «ك» بلا حرف العطف والجرّ أيضاً («بِشِبْرِكَ» ← «شِبْرِكَ»، الفحص المستقل D1؛ لا الفعل: «فَتَحْتَ» ليست «تَحْتَ») */
    for (const c of T7) { const t = String(c.text).replace(GEN_RX, ' ').replace(/«[^»]*»/g, ' '); for (const w of t.split(/\s+/)) { const n = norm(w); if (!n) continue;
      if (marks.has(n)) { errors.push(`${c.full}: «${w}» بصيغة الولد وحدها، وهي بصيغتين في ${marks.get(n)} (المبدأ 9)`); continue; }
      const v = pre(punct(w)).find(x => vmarks.has(x)); if (v) errors.push(`${c.full}: «${w}» بصيغة الولد وحدها (بحركة آخره)، وهي بصيغتين في ${vmarks.get(v)} (المبدأ 9)`); } } }
  // 4ب8) في التقييم: «رتّب» ببدايات غير محاذاة لا يُرتَّب بالنهايات (ترتيب النهايات غير الترتيب الصحيح)، وصورة التعليل لا يصدق فيها سببٌ خاطئ (الفحص المستقل A
  //      لبوابة S1-U4: في t1 كان الأطول هو الأبعد نهاية فنجح من يحكم بالنهاية). وبنود «أيّها أطول/أقصر؟» المُزاحة في 4ب11 (الحكم بالنهاية لا يصيب أكثر من النصف)
  { const MSX8 = +((code.match(/const MS_X = (\d+)/) || [])[1] || 318);
    for (const L of Object.values(lessons)) { const M = L.mastery || {}; const A = [...Object.values(M.concepts || {}).flat(), ...(M.mixed ? [M.mixed.item] : []), ...(L.review || []), ...((L.test && L.test.items) || []).map(q => q.item)];
      for (const v of A) { if (!v || (v.t !== 'reason' && (!Array.isArray(v.shift) || !v.shift.some(Boolean) || (v.wavy || []).length))) continue; const sh = i => (v.shift || [])[i] || 0;
        /* وبنود «أيّها أطول/أقصر؟» المُزاحة تفحصها 4ب11 بالبداية والنهاية معاً (الفحص المستقل E1 لبوابة S1-U4): «كل بند في التقييم أقصره أبعد نهاية» فرضت
           موضع البداية في البنود الثنائية («المحاذي هو الأطول») والنهاية الوسطى في الثلاثية، فأجابت قاعدتان بالموضع التقييمَ كلّه */
        /* وصورة التعليل «كيف نعرف أيّهما أطول؟» تنقض الأسباب الخاطئة: الأطول ليس الأعلى في الصورة ولا الأبعد نهاية (الفحص المستقل A لبوابة S1-U4: كانت بطاقة «الأعلى هو الأطول» صحيحة لما يُرى) */
        if (v.t === 'reason' && v.pic && v.pic.kind === 'len2') { const P = v.pic, ps = i => (P.shift || [])[i] || 0, ends = P.lens.map((l, i) => MSX8 - ps(i) - l), lg = P.lens.indexOf(Math.max(...P.lens));
          if (lg === 0 || lg === ends.indexOf(Math.min(...ends))) errors.push(`${L.id}: تعليل «${v.q}» (${P.lens}، إزاحة ${P.shift || []}): الأطول ${lg === 0 ? 'هو الأعلى في الصورة' : 'هو الأبعد نهاية'}، فسببٌ خاطئ يصدق في الصورة`); }
        if (v.t === 'orderBy' && (v.by || 'len') === 'len') { const ix = v.vals.map((_, i) => i), ends = v.vals.map((l, i) => MSX8 - sh(i) - l); const a = [...ix].sort((i, j) => v.vals[i] - v.vals[j]).join(), b = [...ix].sort((i, j) => ends[j] - ends[i]).join();
          if (a === b) errors.push(`${L.id}: orderBy «${v.q}» (${v.vals}، إزاحة ${v.shift}): ترتيب النهايات هو الترتيب الصحيح، فلا يميّز المحاذاة`); } } }
    /* وعلاج مفهومٍ في إتقانه «رتّب» بالطول لا يُرتَّب بالنهايات: «رتّب» في أصوله لا يُرتَّب بها كذلك، فلا يصيبه بخطئه من أخفق الإتقان بترتيب النهايات (الفحص المستقل J1 (1):
       rm.2 محاذٍ فرتّبه من يرتّب بالنهاية، وهو الخطأ الذي يُخفق به ms.4؛ وكانت قاعدة العلاج لـ«أيّها أطول/أقصر؟» وحده). والتوائم بقاعدة التوأم في 4ب11 */
    const endOrd = v => { const ix = v.vals.map((_, i) => i), sh = i => (v.shift || [])[i] || 0; return [...ix].sort((i, j) => v.vals[i] - v.vals[j]).join() === [...ix].sort((i, j) => (sh(i) + v.vals[i]) - (sh(j) + v.vals[j])).join(); };
    const isOB = v => v && v.t === 'orderBy' && (v.by || 'len') === 'len';
    for (const L of Object.values(lessons)) { const M = L.mastery || {};
      for (const [C, items] of Object.entries(M.remedial || {})) { if (!((M.concepts || {})[C] || []).some(v => isOB(v) && !endOrd(v))) continue;
        for (const v of (Array.isArray(items) ? items : [items]).filter(isOB)) if (endOrd(v)) errors.push(`${L.id}: بند العلاج «${v.q}» في ${C} (${v.vals}، إزاحة ${v.shift || '—'}) يُرتَّب بالنهايات، وفي إتقان ${C} «رتّب» لا يُرتَّب بها، فيصيبه بخطئه من أُرسل إليه (4ب8)`); } } }
  // 4ب11) ولا تجيب الطولَ قاعدةٌ بموضعٍ يُرى بلا مقارنة (الفحوص المستقلة C1 وD1 وE1 وF1 وG1 لبوابة S1-U4). للجواب في بند «أيّها أطول/أقصر؟» أربع رتب: بين البدايات
  //      (الأقرب إلى الخط/الأوسط/الأبعد) وبين النهايات، وهاتان للمُزاح وحده، وصفّه (الأعلى/الأوسط/الأسفل) ولونه (بفهرسه: الثاني من اثنين أسفلهما والثاني من ثلاثة أوسطها
  //      ولونهما واحد، فاللون غير الصفّ)، وهاتان لكل بند. والقواعد الطبيعية (صنفٌ واحد لكل البنود: «اللاصق بالخط»، «الأعلى»، «الورديّ»…، والحكم بالنهاية وعكسه) تُقاس
  //      بثلاث سياسات للتساوي (بالقسمة، وبترجيح الأعلى، وبترجيح الأسفل)، وتُفحص كلها لا أعلاها نسبةً وحده:
  //      (أ) أنجح صنف لكل (عدد الأشياء، السؤال) لا يصيب أكثر من نصف بنود الوحدة المُزاحة (التمرين والتوائم والعلاج واللعب والتقييم)؛ (ب) والقواعد الطبيعية وما يُتعلَّم
  //      من الوحدة (أنجح أصنافها) لا تصيب أكثر من نصف تقييمها، ولا كلَّ تقييم درسٍ فيه بندان؛ (ج) والقواعد الطبيعية لا تصيب أكثر من نصف المسار العادي لدرس (الاكتشاف
  //      واللعب والتمرين العادي والإتقان)، ولا نصفَ التمرين العادي مع الإتقان بلا اللعب، ولا نصفَ التحدّي مع الإتقان (بلا توائم، والكلَّ حدٌّ لما دون أربعة)، ولا كلَّ بنود
  //      مفهوم في الإتقان؛ وفي كل مسار تمرين بندٌ مُزاح يخطئ فيه الحكم بالنهاية، والبند المشتبك لا يُحلّ بالنهاية. (كانت: 4ب8 «الأقصر أبعد نهاية في التقييم»؛ ثم البداية
  //      والنهاية لكل مجموعة على الوحدة كلها، فأجاب «اللاصق بالخط» ستة من سبعة في المسار العادي للدرس 1 ومنها بندا الإتقان، و«الصفّ» خمسة من سبعة في التقييم، F1 (1)؛
  //      ثم كان «الصفّ» يُعدّ لوناً، والتساوي يُقسَم وحده، والجولات تخفي التمرين والإتقان، فأصاب «الورديّ» إتقان C014 كله وأصاب الحكمُ بالنهاية بترجيح الأعلى التمرينَ
  //      العادي والإتقانَ أربعةً من أربعة، G1 (1))
  { const shifted = v => v && Array.isArray(v.lens) && Array.isArray(v.shift) && v.shift.some(Boolean) && !(v.wavy || []).length;
    const rk = (vals, want) => { const lo = Math.min(...vals), hi = Math.max(...vals), x = vals[want], t = vals.filter(y => y === x).length, R = [];
      if (x === lo) R.push('min'); if (x === hi) R.push('max'); if (x !== lo && x !== hi) R.push('mid'); return R.map(r => [r, 1 / t]); };
    /* لون الشيء بفهرسه في lenRow (أو بـ colors من NEUTRAL)، ولون الدودة بفهرسها في «سباق الديدان»: «المس الورديّ» قاعدةٌ بالفهرس لا بالصفّ (الفحص المستقل G1 (1)).
       وcolors تفصل اللون عن الصفّ: بلونٍ ثابت لكل فهرس كانت «المس الثاني» (الورديّ) و«الأعلى في الاثنين والأوسط في الثلاثة» والصفوف تتداخل حتى لا يتّسع لها
       المسار العادي للدرس 1 بأيّ ترتيب (الحلّ الدقيق بعد H1)؛ فاللون بقيمته من NEUTRAL، والقيمة غير المعروفة مخالفة */
    const isLen = v => v && Array.isArray(v.lens) && (v.t === 'lenPick' || v.round), wantOf = v => { const lg = (v.ask || 'long') === 'long'; return v.lens.indexOf((lg ? Math.max : Math.min)(...v.lens)); };
    const NEU = (() => { const m = code.match(/const NEUTRAL = \[([^\]]*)\]/); return m ? [...m[1].matchAll(/'(#[0-9a-f]{6})'/gi)].map(x => x[1].toLowerCase()) : []; })();
    if (NEU.length < 5) errors.push('فحص 4ب11: لم يُعثر على ألوان NEUTRAL في الكود');
    /* وترتيب الألوان الافتراضي يُقرأ من الكود (LEN_DEF في lenRow) لا يُنسخ (الفحص المستقل I1 (4ج): نجت طفرة تغيّره) */
    const DEFC = (() => { const m = code.match(/const LEN_DEF = \[(.*?)\];/); return m ? [...m[1].matchAll(/NEUTRAL\[(\d+)\]/g)].map(x => 'N' + x[1]) : []; })();
    if (DEFC.length < 5) errors.push('فحص 4ب11: لم يُعثر على ترتيب الألوان LEN_DEF في الكود');
    if (!/\(item\.colors \|\| LEN_DEF\)\[i\]/.test(code)) errors.push('فحص 4ب11: lenRow لا يأخذ ألوانه الافتراضية من LEN_DEF، فلا يرى الفحص ما يُرسم');
    const colorOf = (v, i) => v.round ? 'W' + i : (Array.isArray(v.colors) ? 'N' + NEU.indexOf(String(v.colors[i]).toLowerCase()) : DEFC[i]);
    for (const L of Object.values(lessons)) { const cw = x => { if (Array.isArray(x)) return x.forEach(cw); if (!x || typeof x !== 'object') return;
        if (x.t === 'lenPick' && x.colors !== undefined) { const C = Array.isArray(x.colors) ? x.colors.map(c => NEU.indexOf(String(c).toLowerCase())) : [];
          if (!Array.isArray(x.colors) || x.colors.length !== x.lens.length || C.some(k => k < 0) || new Set(C).size !== C.length) errors.push(`${L.id}: «${x.q}»: colors ${JSON.stringify(x.colors)} ليست ${x.lens.length} ألواناً مختلفة من NEUTRAL (4ب11)`); }
        for (const [k, y] of Object.entries(x)) if (k !== 'lines' && y && typeof y === 'object') cw(y); }; cw(L); }
    const feats = v => { const want = wantOf(v), S = v.lens.map((_, i) => (v.shift || [])[i] || 0), E = v.lens.map((l, i) => S[i] + l), F = new Map();
      for (const [r, w] of rk(S, want)) F.set('بداية:' + r, (F.get('بداية:' + r) || 0) + w); for (const [r, w] of rk(E, want)) F.set('نهاية:' + r, (F.get('نهاية:' + r) || 0) + w);
      F.set('صفّ:' + (want === 0 ? 'أعلى' : want === v.lens.length - 1 ? 'أسفل' : 'أوسط'), 1); F.set('لون:' + colorOf(v, want), 1); return [v.lens.length + '|' + (v.ask || 'long'), F]; };
    /* القواعد الطبيعية: بالصفّ وباللون لكل بنود الطول (المحاذية والمُزاحة والملتوية)، وبالبداية والنهاية والحكم بالنهاية وعكسه للمُزاحة وحدها؛ ولكلٍّ ثلاث سياسات
       للتساوي (بالقسمة، وبترجيح الأعلى، وبترجيح الأسفل)، فلا تخفي القسمةُ قاعدةً تصيب بترجيح (الفحص المستقل G1 (1): الحكم بالنهاية 3.5 من 4 بالقسمة و4 من 4 بالترجيح) */
    const pick = (v, r) => { const n = v.lens.length, I = v.lens.map((_, i) => i);
      if (r.startsWith('صفّ:')) return r === 'صفّ:أعلى' ? [0] : r === 'صفّ:أسفل' ? [n - 1] : I.slice(1, -1);
      if (r.startsWith('لون:')) return I.filter(i => 'لون:' + colorOf(v, i) === r);
      if (!shifted(v)) return null;
      const S = I.map(i => v.shift[i] || 0), E = I.map(i => S[i] + v.lens[i]), lg = (v.ask || 'long') === 'long';
      if (r === 'الحكم بالنهاية' || r === 'عكس الحكم بالنهاية') { const x = ((r === 'الحكم بالنهاية') === lg ? Math.max : Math.min)(...E); return I.filter(i => E[i] === x); }
      const X = r.startsWith('بداية:') ? S : E, k = r.split(':')[1], lo = Math.min(...X), hi = Math.max(...X);
      return I.filter(i => k === 'min' ? X[i] === lo : k === 'max' ? X[i] === hi : X[i] !== lo && X[i] !== hi); };
    const POL = [['بالقسمة', (P, w) => P.includes(w) ? 1 / P.length : 0], ['بترجيح الأعلى', (P, w) => P.length && Math.min(...P) === w ? 1 : 0], ['بترجيح الأسفل', (P, w) => P.length && Math.max(...P) === w ? 1 : 0]];
    /* وقواعد بعدد الأشياء (الفحص المستقل H1 (1): قاعدتا E1 وF1 أجابتا إتقان C014 كله ولا يقيسهما إلا الوحدة كلها): المسمّاة في ملف الوحدة والفحوص (شيئان: المحاذي، ثلاثة:
       صاحب النهاية الوسطى؛ شيئان: الأعلى، ثلاثة: الأوسط)، وما تعلّمه الوحدة لكل عدد أشياء (أنجح صنفٍ للعدد في بنود الوحدة المُزاحة قبل التقييم، أياً كان السؤال: LEARN)؛
       وتُقاس في كل مسار وإتقان وعلاج وتقييم كالقواعد الطبيعية. ففي إتقانٍ بندٌ واحد لكل عدد لا يُجاب كله بما تعلّمه الطفل */
    const NAMED = [['شيئان: المحاذي، ثلاثة: صاحب النهاية الوسطى', { 2: 'بداية:min', 3: 'نهاية:mid' }], ['شيئان: الأعلى، ثلاثة: الأوسط', { 2: 'صفّ:أعلى', 3: 'صفّ:أوسط' }]];
    let LEARN = new Map(), LEARNQ = new Map();
    const gq = v => v.lens.length + '|' + (v.ask || 'long');
    const natAll = (list, lq) => { const C = new Set(); for (const v of list) v.lens.forEach((_, i) => C.add('لون:' + colorOf(v, i))); const out = [];
      for (const r of ['صفّ:أعلى', 'صفّ:أوسط', 'صفّ:أسفل', ...C, 'بداية:min', 'بداية:mid', 'بداية:max', 'نهاية:min', 'نهاية:mid', 'نهاية:max', 'الحكم بالنهاية', 'عكس الحكم بالنهاية'])
        for (const [pn, pf] of POL) { let sc = 0, cnt = 0; for (const v of list) { const P = pick(v, r); if (!P) continue; cnt++; sc += pf(P, wantOf(v)); } if (cnt) out.push([`${r} ${pn}`, sc, cnt]); }
      /* (وأنجح زوجٍ بالسؤال، صنفٌ لـ«أطول؟» وآخر لـ«أقصر؟» يُختاران على البنود نفسها، لا يُقاس: ليس قاعدةً يأتي بها الطفل، فهو يُختار بعد رؤية البنود. وفي بندين
         بسؤالين يصيبهما زوجٌ ما أيّاً كان جواباهما، فحدّ «دون الكلّ» في إتقان C014 واختبار د8 لا يُبلغ إلا بحذف أحد السؤالين. ووجد الحلّ الدقيق حدَّه غير ممكنٍ مع قيود
         الوحدة في تقييمها وفي المسار العادي لـ د1، وممكناً في التحدّي بكلفة 1393 إن غُيّرت الألوان. فيُقاس بدله ما يأتي به الطفل: القواعد الطبيعية (ومنها الحكم بالنهاية
         وعكسه، وهما بالسؤال)، وما تعلّمه الوحدة لكل عدد أشياء (LEARN) ولكل عدد وسؤال (LEARNQ، في الأبواب)، وما يتعلّمه في مساره من بنود سؤالٍ واحد إن كانت أربعة فأكثر.
         الفحص المستقل J1 (2)؛ وكان تعليل I1 (4ب) هنا «يجاوز النصف حتماً» خطأً: الحدّ ⌈k/2⌉ + ⌈(n−k)/2⌉ يصحّ لصفةٍ بقيمتين وحدها) */
      /* وما تعلّمه الوحدة بكل صنفٍ تعادل في القمّة، لا بأوّلها ترتيباً (الفحص المستقل I1 (4أ)) */
      const LC = [[...LEARN].reduce((acc, [n, cs]) => acc.flatMap(o => cs.map(c => ({ ...o, [n]: c }))), [{}])].flat().filter(o => Object.keys(o).length);
      const perN = [...NAMED, ...LC.map(o => ['ما تعلّمه الوحدة لكل عدد (' + Object.entries(o).map(([n, c]) => n + ': ' + c).join('، ') + ')', o])];
      for (const [nm, R] of perN) for (const [pn, pf] of POL) { let sc = 0, cnt = 0; for (const v of list) { const r = R[v.lens.length]; if (!r) continue; const P = pick(v, r); if (!P) continue; cnt++; sc += pf(P, wantOf(v)); }
        if (cnt) out.push([`${nm} ${pn}`, sc, cnt]); }
      /* وفي الأبواب وحدها (الإتقان والعلاج والمراجعة والتقييم): ما تعلّمه الوحدة لكل عدد أشياء وسؤال (LEARNQ)، بكل متعادلاته. لا في المسارات: هي ما يُحسب منه، فيصيبها
         بالبناء (الفحص المستقل J1 (2)) */
      if (lq) { const gs = [...new Set(list.map(gq))].filter(g => LEARNQ.has(g)); const LQ = gs.reduce((acc, g) => acc.flatMap(o => LEARNQ.get(g).map(c => ({ ...o, [g]: c }))), [{}]).filter(o => Object.keys(o).length);
        for (const o of LQ) { const nm = 'ما تعلّمه الوحدة لكل عدد وسؤال (' + Object.entries(o).map(([g, c]) => g.replace('|long', ' «أطول؟»').replace('|short', ' «أقصر؟»') + ': ' + c).join('، ') + ')';
          for (const [pn, pf] of POL) { let sc = 0, cnt = 0; for (const v of list) { const r = o[gq(v)]; if (!r) continue; const P = pick(v, r); if (!P) continue; cnt++; sc += pf(P, wantOf(v)); } if (cnt) out.push([`${nm} ${pn}`, sc, cnt]); } } }
      return out; };
    /* النصف حدٌّ لما فيه أربعة بنود تنطبق عليها القاعدة فأكثر، والكلّ حدٌّ لما فيه اثنان أو ثلاثة */
    const over = (sc, cnt, half) => half && cnt >= 4 ? sc * 2 > cnt + 1e-9 : cnt >= 2 && sc > cnt - 1e-9;
    const natCheck = (list, half, say, lq) => { const seen = new Set(); for (const [r, sc, cnt] of natAll(list, lq).sort((a, b) => b[1] / b[2] - a[1] / a[2])) { const base = r.replace(/ (بالقسمة|بترجيح الأعلى|بترجيح الأسفل)$/, '');
        if (!seen.has(base) && over(sc, cnt, half)) { seen.add(base); errors.push(say(r, sc, cnt)); } } };
    const qs = list => list.map(v => '«' + v.q + '»').join('، ');
    const units = new Map(), assess = new Map();
    /* LEARN: لكل وحدة ولكل عدد أشياء أنجحُ صنفٍ في بنودها المُزاحة التي يتعلّم منها الطفل قبل التقييم (الاكتشاف واللعب والتمرين وتوائمه)، أياً كان السؤال */
    const LEARNS = new Map(), LEARNQS = new Map();
    { const T = new Map(); for (const L of Object.values(lessons)) { const u = (L.id.match(/^(m\d+\.u\d+)\./) || [])[1]; if (!u) continue; if (!T.has(u)) T.set(u, []);
        const w = x => { if (Array.isArray(x)) return x.forEach(w); if (!x || typeof x !== 'object') return; if (x.t === 'lenPick' && shifted(x)) T.get(u).push(x);
          if (x.scene === 'wormRace') (x.rounds || []).forEach(r => shifted(r) && T.get(u).push({ ...r, round: true })); for (const [k, y] of Object.entries(x)) if (y && typeof y === 'object' && k !== 'lines') w(y); };
        w([L.flow, L.practice]); }
      for (const [u, list] of T) { const byN = new Map(); for (const v of list) { const n = v.lens.length, [, F] = feats(v); if (!byN.has(n)) byN.set(n, new Map()); const m = byN.get(n); for (const [c, x] of F) m.set(c, (m.get(c) || 0) + x); }
        const M = new Map(); for (const [n, m] of byN) { const best = Math.max(...m.values()); M.set(n, [...m.keys()].filter(c => Math.abs(m.get(c) - best) < 1e-9).sort()); } LEARNS.set(u, M);
        /* و LEARNQ: مثله لكل عدد أشياء وسؤال (الفحص المستقل J1 (2)) */
        const byG = new Map(); for (const v of list) { const [g, F] = feats(v); if (!byG.has(g)) byG.set(g, new Map()); const m = byG.get(g); for (const [c, x] of F) m.set(c, (m.get(c) || 0) + x); }
        const MQ = new Map(); for (const [g, m] of byG) { const best = Math.max(...m.values()); MQ.set(g, [...m.keys()].filter(c => Math.abs(m.get(c) - best) < 1e-9).sort()); } LEARNQS.set(u, MQ); } }
    for (const L of Object.values(lessons)) { const u = (L.id.match(/^(m\d+\.u\d+)\./) || [])[1]; if (!u) continue; if (!units.has(u)) { units.set(u, []); assess.set(u, []); } const all = units.get(u); LEARN = LEARNS.get(u) || new Map(); LEARNQ = LEARNQS.get(u) || new Map();
      const walk = v => { if (Array.isArray(v)) return v.forEach(walk); if (!v || typeof v !== 'object') return;
        if (v.t === 'lenPick' && shifted(v)) all.push(v);
        if (v.scene === 'wormRace') (v.rounds || []).forEach(r => shifted(r) && all.push({ ...r, round: true }));
        for (const x of Object.values(v)) if (x && typeof x === 'object') walk(x); };
      walk([L.flow, L.practice, L.mastery && { c: L.mastery.concepts, r: L.mastery.remedial }, L.review, L.test]);
      const M = L.mastery || {}, A = [...Object.values(M.concepts || {}).flat(), ...(M.mixed ? [M.mixed.item] : []), ...(L.review || []), ...((L.test && L.test.items) || []).map(q => q.item)].filter(isLen);
      if (M.mixed && M.mixed.item && M.mixed.item.t === 'lenPick' && shifted(M.mixed.item)) { all.push(M.mixed.item);
        const [, F] = feats(M.mixed.item); if ((F.get((M.mixed.item.ask || 'long') === 'long' ? 'نهاية:max' : 'نهاية:min') || 0) > 1e-9) errors.push(`${L.id}: البند المشتبك «${M.mixed.item.q}» يُحلّ بالنهاية بلا محاذاة، وهو وحده لمفهومه في هذا الإتقان (F1 (10)، 4ب11)`); }
      assess.get(u).push([L, A]);
      /* (ج) مسارات الدرس بلا توائم: الرئيس (الاكتشاف واللعب والتمرين العادي والإتقان)، والتمرين العادي مع الإتقان بلا جولات اللعب (كانت جولات «سباق الديدان» الثلاث
         تخطئ فيها قاعدة النهاية فتخفي أنها تصيب التمرين والإتقان: الفحص المستقل G1 (1))، والتحدّي مع الإتقان؛ وكل مفهوم في الإتقان */
      const lenOf = v => { const P = []; const w = x => { if (Array.isArray(x)) return x.forEach(w); if (!x || typeof x !== 'object') return; if (x.t === 'lenPick') P.push(x);
          if (x.scene === 'wormRace') (x.rounds || []).forEach(r => P.push({ ...r, round: true })); for (const [k, y] of Object.entries(x)) if (k !== 'twin' && y && typeof y === 'object') w(y); }; w(v); return P; };
      const MC = Object.values(M.concepts || {});
      for (const [nm, P] of [['المسار العادي', lenOf([L.flow, (L.practice || {}).normal, MC])], ['التمرين العادي والإتقان', lenOf([(L.practice || {}).normal, MC])], ['التحدّي والإتقان', lenOf([(L.practice || {}).challenge, MC])]]) {
        if (P.length >= 2) natCheck(P, true, (r, sc, cnt) => `${L.id}: قاعدة «${r}» تصيب ${+sc.toFixed(2)} من ${cnt} بنود الطول ${cnt < P.length ? 'المُزاحة ' : ''}في ${nm} (${qs(P)})، والحدّ ${cnt >= 4 ? 'النصف' : 'دون الكلّ'} (4ب11)`);
        /* وبنود كل سؤالٍ في المسار مسارٌ لمن ينتبه إلى السؤال إن كانت أربعة فأكثر: لا تصيب أكثرَ من نصفها قاعدة، فلا يتعلّم في مساره «أطول ← الأسفل، أقصر ← الأعلى» وأمثالها.
           ودون الأربعة لا تُقاس: ما يصيب بندين أو ثلاثة بسؤالٍ واحد مصادفةُ صنفٍ لا نمطٌ يتعلّمه، ولا يصيبها كلَّها قاعدةٌ يأتي بها الطفل إلا ما يُقاس على المسار كله
           (الفحص المستقل J1 (2)) */
        for (const q of ['long', 'short']) { const Pq = P.filter(v => (v.ask || 'long') === q), seen = new Set(); if (Pq.length < 4) continue;
          for (const [r, sc, cnt] of natAll(Pq).sort((a, b) => b[1] / b[2] - a[1] / a[2])) { const base = r.replace(/ (بالقسمة|بترجيح الأعلى|بترجيح الأسفل)$/, '');
            if (cnt >= 4 && !seen.has(base) && sc * 2 > cnt + 1e-9) { seen.add(base); errors.push(`${L.id}: قاعدة «${r}» تصيب ${+sc.toFixed(2)} من ${cnt} بنود الطول ${cnt < Pq.length ? 'المُزاحة ' : ''}بسؤال «${q === 'long' ? 'أطول' : 'أقصر'}؟» في ${nm} (${qs(Pq)})، والحدّ النصف (4ب11)`); } } } }
      for (const [C, items] of Object.entries(M.concepts || {})) { const Q = items.filter(isLen); if (Q.length >= 2) natCheck(Q, false, r => `${L.id}: قاعدة «${r}» تصيب بنود الطول في إتقان ${C} كلها (${qs(Q)})، فيُتقنه من لا يقارن (4ب11)`, true); }
      /* والعلاج: ما يراه الطفل فيه أولاً أصولُه (التوأم بعد الحلّ المشترك أو الكشف): فلا يجيب أصلاً الحكمُ بالنهاية، ولا المحاذي، ولا القاعدتان المسمّاتان، ولا ما تعلّمه
         الوحدة لعدد أشيائه، والتساوي حلٌّ (الفحص المستقل I1 (1): كان العلاج مساراً بتوائمه، فكفاه توأمٌ تخطئ فيه النهاية وrm.1 يُحلّ بالنهاية وبالمحاذي؛ وفي بندٍ بشيئين
         لا تحلّه النهاية تحلّه البداية، فلا يُطلب «لا قاعدة تصيب الكلّ» على الأصل وتوأمه)؛ وفي أصولٍ اثنين فأكثر لا تصيبها كلَّها قاعدة. والتوائم بقواعد التوأم */
      for (const [C, items] of Object.entries(M.remedial || {})) { const Q = (Array.isArray(items) ? items : [items]).filter(isLen);
        if (Q.length >= 2) natCheck(Q, false, r => `${L.id}: قاعدة «${r}» تصيب أصول بنود الطول في علاج ${C} كلها (${qs(Q)})، فيصيبه من لا يقارن (4ب11)`, true);
        for (const v of Q) { const n = v.lens.length, w = wantOf(v), bad = [];
          const R = [...(shifted(v) ? [['الحكم بالنهاية', 'الحكم بالنهاية'], ['المحاذي', 'بداية:min']] : []), ...NAMED.map(([nm, X]) => [nm, X[n]]), ...((LEARN.get(n) || []).map(c => ['ما تعلّمه الوحدة لـ' + n + ' (' + c + ')', c])),
            ...((LEARNQ.get(gq(v)) || []).map(c => ['ما تعلّمه الوحدة لـ' + n + ' بسؤال «' + ((v.ask || 'long') === 'long' ? 'أطول' : 'أقصر') + '؟» (' + c + ')', c]))];
          for (const [nm, r] of R) { if (!r) continue; const P = pick(v, r); if (P && P.includes(w)) bad.push(nm); }
          if (bad.length) errors.push(`${L.id}: بند العلاج «${v.q}» في ${C} (${v.lens}، إزاحة ${v.shift || '—'}) يجيبه ${bad.join('، ')}، فيصيبه بخطئه من أُرسل إليه (4ب11)`); } }
      /* ومراجعة كل مفهوم مسارٌ: «مراجعة اليوم» تعرض بنداً منها، وبعد الخطأ آخر من المفهوم، فلا تصيبها كلَّها قاعدةٌ لا تقارن (الفحص المستقل I1 (2): بندا مراجعة C014 يجيبهما
         الأعلى والمحاذي والأقرب نهاية والأزرق) */
      { const RV = new Map(); for (const v of L.review || []) if (isLen(v)) { const c = v.c || '?'; if (!RV.has(c)) RV.set(c, []); RV.get(c).push(v); }
        for (const [C, Q] of RV) if (Q.length >= 2) natCheck(Q, false, r => `${L.id}: قاعدة «${r}» تصيب بنود الطول في مراجعة ${C} كلها (${qs(Q)})، فيُراجعه من لا يقارن (4ب11)`, true); }
      /* وفي كل مسار تمرين فيه بنود مُزاحة بندٌ يخطئ فيه الحكم بالنهاية، فلا يتعلّم الطفل في تمرينه أن النهاية الأبعد هي الأطول (الفحص المستقل G1 (1): بندا التمرين العادي
         المُزاحان كانا يُحلّان بالنهاية، والإتقان وحده يكشفها) */
      /* والتساوي في النهاية لا يُعدّ خطأً للنهاية: بأيّ وجهٍ رجّح الطفل بين نهايتين متساويتين قد يصيب (الفحص المستقل H1 (4): pr.3 بنهايتين 190 و190 والجواب الأعلى) */
      const byEnd1 = v => { const S = v.lens.map((_, i) => (v.shift || [])[i] || 0), E = v.lens.map((l, i) => S[i] + l), x = ((v.ask || 'long') === 'long' ? Math.max : Math.min)(...E); return E[wantOf(v)] === x; };
      for (const p of ['normal', 'challenge']) { const Q = ((L.practice || {})[p] || []).filter(v => v && v.t === 'lenPick' && shifted(v)); if (Q.length && Q.every(byEnd1)) errors.push(`${L.id}: بنود الطول المُزاحة في التمرين ${p === 'normal' ? 'العادي' : 'التحدّي'} (${qs(Q)}) كلها تُحلّ بالنهاية بلا محاذاة؛ يلزم بندٌ نهايةُ جوابه ليست الأبعد (أو الأقرب لـ«أقصر؟») (4ب11)`); } }
    /* والرتبة تُرى: بدايتان أو نهايتان إمّا متساويتان وإمّا بينهما 12 وحدة على الأقل (الفحص المستقل E1: نهاية الجواب 178 ونهاية الأطول 176 في ts.2، «أبعد» بوحدتين لا تراها العين) */
    for (const all of units.values()) for (const v of all) { const S = v.lens.map((_, i) => (v.shift || [])[i] || 0), E = v.lens.map((l, i) => S[i] + l);
      for (const [nm, X] of [['البدايات', S], ['النهايات', E]]) { const d = X.flatMap((a, i) => X.slice(i + 1).map(b => Math.abs(a - b))).filter(x => x > 0 && x < 12);
        if (d.length) errors.push(`«${v.q}» (${v.lens}، إزاحة ${v.shift}): ${nm} ${X} فيها فرق ${d[0]} وحدة، لا تساوٍ ولا فرق يُرى (12 على الأقل) (4ب11)`); } }
    for (const [u, all] of units) { if (!all.length) continue; LEARN = LEARNS.get(u) || new Map(); LEARNQ = LEARNQS.get(u) || new Map(); const G = new Map(); for (const v of all) { const [g, F] = feats(v); if (!G.has(g)) G.set(g, new Map()); const m = G.get(g); for (const [c, w] of F) m.set(c, (m.get(c) || 0) + w); }
      const best = new Map([...G].map(([g, m]) => [g, Math.max(...m.values())])), dom = new Map([...G].map(([g, m]) => [g, [...m.keys()].filter(c => Math.abs((m.get(c) || 0) - best.get(g)) < 1e-9)]));
      const tot = [...best.values()].reduce((a, b) => a + b, 0), desc = [...G].map(([g, m]) => `${g}: ${dom.get(g).join('/')} ${(+best.get(g).toFixed(2))}`).join('؛ ');
      if (tot * 2 > all.length + 1e-9) errors.push(`${u}: أنجح قاعدة بموضع البداية أو النهاية أو الصفّ أو اللون (لكل عدد أشياء وسؤال) تصيب ${+tot.toFixed(2)} من ${all.length} بنود الطول المُزاحة (لا تزيد على النصف): ${desc} (4ب11)`);
      const worst = list => { const H = new Map(); for (const v of list.filter(shifted)) { const [g, F] = feats(v); if (!H.has(g)) H.set(g, []); H.get(g).push(F); }
        let t = 0; for (const [g, Fs] of H) t += Math.max(0, ...(dom.get(g) || []).map(c => Fs.reduce((a, F) => a + (F.get(c) || 0), 0))); return t; };
      const AA = assess.get(u).flatMap(([, A]) => A), AS = AA.filter(shifted), wa = worst(AA);
      if (AS.length && wa * 2 > AS.length + 1e-9) errors.push(`${u}: ما تتعلّمه الوحدة من أنجح قواعدها بالموضع (${desc}) يصيب ${+wa.toFixed(2)} من ${AS.length} بنود الطول المُزاحة في تقييمها (لا تزيد على النصف) (4ب11)`);
      for (const [L, A] of assess.get(u)) { const As = A.filter(shifted); if (As.length >= 2 && worst(As) > As.length - 1e-9) errors.push(`${L.id}: ما تتعلّمه الوحدة من أنجح قواعدها بالموضع يصيب بنود الطول المُزاحة في تقييم الدرس كلها (${qs(As)}) (4ب11)`); }
      /* والقواعد الطبيعية في التقييم، ومنها الحكم بالنهاية (الخطأ الذي تعلّمه الوحدة: الأطول أبعدها نهاية، والأقصر أقربها) وعكسه، واللون والصفّ */
      if (AA.length) natCheck(AA, true, (r, sc, cnt) => `${u}: قاعدة «${r}» تصيب ${+sc.toFixed(2)} من ${cnt} بنود الطول ${cnt < AA.length ? 'المُزاحة ' : ''}في تقييم الوحدة (لا تزيد على النصف) (4ب11)`, true);
      for (const [L, A] of assess.get(u)) if (A.length >= 2) natCheck(A, false, r => `${L.id}: قاعدة «${r}» تصيب بنود الطول في تقييم الدرس كلها (${qs(A)}) (4ب11)`, true); }
    /* والتوأم بعد الكشف ليس في موضع جواب أصله (ولا بتسلسله في «رتّب»)، ولا يُحلّ بالنهاية إن كان أصله لا يُحلّ بها (الفحص المستقل E1: توأما pr.3 وpr.4 بالجواب في الموضع واللون
       اللذين حُلِّق حولهما للتوّ، وتوأمان صارا يُحلّان بأقرب نهاية) */
    const ans = v => { const lg = (v.ask || 'long') === 'long'; return v.lens.indexOf((lg ? Math.max : Math.min)(...v.lens)); };
    const byEnd = v => { const lg = (v.ask || 'long') === 'long', S = v.lens.map((_, i) => (v.shift || [])[i] || 0), E = v.lens.map((l, i) => S[i] + l), x = (lg ? Math.max : Math.min)(...E); return E[ans(v)] === x; };   /* والتساوي يُعدّ حلّاً بالنهاية (H1 (4)) */
    const seq = v => { const ix = v.vals.map((_, i) => i); return ix.sort((i, j) => (v.dir === 'down' ? v.vals[j] - v.vals[i] : v.vals[i] - v.vals[j])).join(); };
    const ordEnd = v => { const ix = v.vals.map((_, i) => i), sh = i => (v.shift || [])[i] || 0; return [...ix].sort((i, j) => v.vals[i] - v.vals[j]).join() === [...ix].sort((i, j) => (sh(i) + v.vals[i]) - (sh(j) + v.vals[j])).join(); };
    const tw = (L, v) => { if (Array.isArray(v)) return v.forEach(x => tw(L, x)); if (!v || typeof v !== 'object') return; const T = v.twin;
      if (T && v.t === 'lenPick' && T.t === 'lenPick') { if (ans(T) === ans(v)) errors.push(`${L.id}: توأم «${v.q}» جوابه في الموضع ${ans(v) + 1} كأصله، وقد كُشف للتوّ (4ب11)`);
        if (colorOf(T, ans(T)) === colorOf(v, ans(v))) errors.push(`${L.id}: توأم «${v.q}» جوابه بلون جواب أصله (${colorOf(v, ans(v))})، وقد كُشف للتوّ (4ب11)`);
        if (shifted(v) && !byEnd(v) && shifted(T) && byEnd(T)) errors.push(`${L.id}: توأم «${v.q}» يُحلّ بالنهاية وأصله لا يُحلّ بها (${T.lens}، إزاحة ${T.shift}) (4ب11)`); }
      if (T && v.t === 'orderBy' && T.t === 'orderBy' && seq(T) === seq(v)) errors.push(`${L.id}: توأم «${v.q}» يُرتَّب بتسلسل لمس أصله (${seq(v)}) (4ب11)`);
      /* ولا يُرتَّب التوأم بالنهايات إن كان أصله لا يُرتَّب بها، كتوأم «أيّها أطول؟» (الفحص المستقل J1 (1): توأم rm.2) */
      if (T && v.t === 'orderBy' && T.t === 'orderBy' && (v.by || 'len') === 'len' && !ordEnd(v) && ordEnd(T)) errors.push(`${L.id}: توأم «${v.q}» يُرتَّب بالنهايات وأصله لا يُرتَّب بها (${T.vals}، إزاحة ${T.shift || '—'}) (4ب11)`);
      for (const [k, x] of Object.entries(v)) if (k !== 'twin' && x && typeof x === 'object') tw(L, x); };
    for (const L of Object.values(lessons)) tw(L, [L.flow, L.practice, L.mastery, L.review, L.test, L.twins]);
    /* والملتوي (الفحوص المستقلة E1 (16) وF1 (4) وF2 (2)): في كل مسار (التمرين العادي، والتحدّي، والتقييم؛ الأصول بلا توائم) فيه بنود ملتوية لا تصيبها كلَّها
       «الملتوي هو الأطول» (في «أطول؟» يُلمس ملتوٍ، وفي «أقصر؟» مستقيم) ولا «الملتوي أقصر» (عكسها، وهو الحكم بما يُرى)؛ وبين ملتويين يُقسَم. كانت الأولى تصيب البنود
       الأربعة كلها، ثم صار الملتوي أقصرَ الشريطين في بندٍ فأصابته الثانية */
    /* ومن يرى الملتوي أطول من كل مستقيم يقارن الملتويين بينهما بالنظر، ومن يحكم بما يُرى يقارن المستقيمين كذلك: فالقاعدة تصيب البند إن كان جوابه أطولَ مجموعتها (أو أقصرها)،
       بلا قسمة بين ملتويين (الفحص المستقل G1 (8): بالقسمة عُدّت «الملتوي أطول» 1.5 من 2 وهي تصيب البندين) */
    const wv = (v, wavyPick) => { const W = v.wavy || [], N = v.lens.map((_, i) => i).filter(i => !W.includes(i)), lg = (v.ask || 'long') === 'long', want = v.lens.indexOf((lg ? Math.max : Math.min)(...v.lens));
      const pool = (lg === wavyPick) ? W : N; if (!pool.includes(want)) return 0; const ext = (lg ? Math.max : Math.min)(...pool.map(i => v.lens[i])); return v.lens[want] === ext ? 1 : 0; };
    for (const L of Object.values(lessons)) { const M = L.mastery || {};
      const paths = [['التمرين العادي', (L.practice || {}).normal || []], ['التحدّي', (L.practice || {}).challenge || []],
        ['التقييم', [...Object.values(M.concepts || {}).flat(), ...(M.mixed ? [M.mixed.item] : []), ...(L.review || []), ...((L.test && L.test.items) || []).map(q => q.item)]]];
      for (const [nm, list] of paths) { const W = list.filter(v => v && v.t === 'lenPick' && (v.wavy || []).length); if (!W.length) continue;
        /* و«المس الملتوي» و«المس المستقيم» أياً كان السؤال، وبين ملتويين بعرضهما المرسوم (يزيد بالطول، فهو كالطول): الفحص المستقل H1 (3): صار الجواب ملتوياً في البنود الأربعة */
        const pickOne = (v, wavyPick) => { const Wv = v.wavy || [], pool = v.lens.map((_, i) => i).filter(i => Wv.includes(i) === wavyPick), lg = (v.ask || 'long') === 'long', want = v.lens.indexOf((lg ? Math.max : Math.min)(...v.lens));
          if (!pool.includes(want)) return 0; return v.lens[want] === (lg ? Math.max : Math.min)(...pool.map(i => v.lens[i])) ? 1 : 0; };
        for (const [rule, f] of [['الملتوي هو الأطول', v => wv(v, true)], ['الملتوي أقصر (الحكم بما يُرى)', v => wv(v, false)], ['المس الملتوي (وبين ملتويين بعرضه)', v => pickOne(v, true)], ['المس المستقيم', v => pickOne(v, false)]]) { const sc = W.reduce((a, v) => a + f(v), 0);
          if (sc > W.length - 1e-9) errors.push(`${L.id}: ${nm}: «${rule}» تصيب البنود الملتوية كلها (${W.map(v => '«' + v.q + '»').join('، ')})، فلا يُفرد الطفل الشريط (4ب11)`); } } } }
  // 4ب12) الخطأ الشائع «الأكبر أثقل» يقع فيه الطفل في الإتقان (الفحص المستقل C1 لبوابة S1-U4، الدرس 152): لما صُحّحت الأوزان صارت الوسادة الكبيرة أثقل من
  //      السيارة في بند «ضع في الميزان»، فلم يبقَ في الإتقان بند يسجّل bigHeavy، والخطأ في بطاقة التعليل وحدها. ففي إتقان كل مفهوم فيه بند ميزان بند «أيّهما أثقل؟»
  //      كبيرُه أخفّ من صغيره
  { const wb = (code.match(/const WEIGH = \{([\s\S]*?)\n\};/) || ['', ''])[1], W12 = Object.fromEntries([...wb.matchAll(/(\w+): \{ w: (\d+), big: (\w+)/g)].map(m => [m[1], { w: +m[2], big: m[3] === 'true' }]));
    if (!Object.keys(W12).length) errors.push('فحص 4ب12: لم يُعثر على WEIGH في الكود');
    for (const L of Object.values(lessons)) for (const [C, items] of Object.entries((L.mastery && L.mastery.concepts) || {})) { const B = items.filter(v => v && v.t === 'balance'); if (!B.length) continue;
      const trap = v => (v.ask || 'heavy') === 'heavy' && W12[v.a] && W12[v.b] && W12[v.a].big !== W12[v.b].big && (W12[v.a].big ? W12[v.a].w < W12[v.b].w : W12[v.b].w < W12[v.a].w);
      if (!B.some(trap)) errors.push(`${L.id}: إتقان ${C} فيه بند ميزان ولا بند «أيّهما أثقل؟» كبيرُه أخفّ من صغيره (${B.map(v => v.a + '/' + v.b).join('، ')})، فلا يقع الطفل في «الأكبر أثقل» ولا يُسجَّل`); } }
  // 4ب13) ما يُقال في الميزان يطابق ما يُرى حين يُقال (الدرس 130؛ الفحص المستقل C1 لبوابة S1-U4): في «ضع في الميزان» تُقال جملة البند قبل الوضع فهي أمرٌ بالوضع
  //      لا سؤال («أيّهما أثقل؟» بعد الميل بجملته العامة)، وكانت «ضعي… أيّهما أخفّ؟» تُقال بعد الوضع والميل؛ وبعد التوقّع من الصورة يُسأل «أيّهما أثقل؟» (gen.weigh.read)
  { const walk = (L, v) => { if (Array.isArray(v)) return v.forEach(x => walk(L, x)); if (!v || typeof v !== 'object') return;
      if (v.t === 'balance') { const q = String((L.lines || {})[v.q] || '');
        if ((v.mode || 'read') === 'test' && (/أيهما/.test(q.replace(/[\u064B-\u0652]/g, '')) || !/المِيزَانِ/.test(q))) errors.push(`${L.id}: ميزان «ضع» «${v.q}»: جملته تُقال قبل الوضع، فهي أمرٌ بوضع الشيئين في الميزان بلا سؤال («${q.slice(0, 60)}»)`);
        if ((v.mode || 'read') === 'pic' && (v.ask || 'heavy') !== 'heavy') errors.push(`${L.id}: ميزان من الصورة «${v.q}» بـ«أيّهما أخفّ؟» وجملة القراءة بعد التوقّع «أيّهما أثقل؟» (gen.weigh.read)`);
        if ((v.mode || 'read') === 'pic' && !/تَوَقَّع/.test(q)) errors.push(`${L.id}: ميزان من الصورة «${v.q}»: جملته لا تقول «توقّع» والطفل يتوقّع ولا ميزان أمامه («${q.slice(0, 60)}»)`); }
      for (const x of Object.values(v)) if (x && typeof x === 'object') walk(L, x); };
    for (const L of Object.values(lessons)) walk(L, [L.flow, L.practice, L.mastery, L.review, L.test]); }
  // 4ب14) التعدّي لا يُجاب بقاعدةٍ لا تقارن (الفحوص المستقلة C2 وD1 وE1 لبوابة S1-U4). ثلاث قواعد: (1) مطابقة كلمة السؤال باسم السلّة أو رمزها («أطول؟» ← سلّة «أطول»)،
  //      وتخطئ حين الجواب في سلّة «بطول الشبر»؛ (2) لمس صاحب ≈ («بطوله»)، وتخطئ حين الجواب في «أطول/أقصر» وصاحبه «بطوله»؛ (3) الأولى حين تسمّي الجملة السلّتين
  //      والثانية حين لا تسمّيهما. ففي كل مسار تمرين فيه التعدّي، وفي تقييم كل درس فيه (الإتقان والمراجعة والمشتبك والاختبار)، بندٌ تخطئ فيه كلٌّ من الثلاث، فلا يكفي
  //      التقييمَ بندٌ واحد. (كانت: جواب التعدّي في التقييم في «بطول الشبر» دائماً فيصيبه لمس صاحب ≈، وبند المسار الذي يسمّي سلّتيه جوابه «أطول»، C2 ثم D1 ثم E1)
  { const SPS14 = +((code.match(/const SPAN_S = (\d+)/) || [])[1] || 112), cat = L => L < SPS14 * .85 ? 'short' : L > SPS14 * 1.15 ? 'long' : 'same';
    const lg = v => ((v.ask || 'longer') === 'longer') === (v.la > v.lb), ansCat = v => cat(lg(v) ? v.la : v.lb), othCat = v => cat(lg(v) ? v.lb : v.la), TP = v => v && v.t === 'transPick';
    const d1 = v => ansCat(v) === 'same', d2 = v => ansCat(v) !== 'same' && othCat(v) === 'same', pair = v => [cat(v.la), cat(v.lb)].sort().join();
    const trap = v => d1(v) ? 'same' : d2(v) ? 'vsSame' : 'none', idx = v => lg(v) ? 0 : 1;   /* lg: الجواب أولهما (a) */
    for (const L of Object.values(lessons)) { const M = L.mastery || {}, named = v => /سَلَّةِ «/.test(String((L.lines || {})[v.q] || ''));
      const H = [['مطابقة كلمة السؤال باسم السلّة', d1, 'جوابه في سلّة «بطول الشبر»'], ['لمس صاحب «بطوله»', d2, 'جوابه في «أطول» أو «أقصر» وصاحبه «بطوله»'],
        ['مطابقة الكلمة حين تُسمّى السلّة ولمس صاحب «بطوله» حين لا تُسمّى', v => named(v) ? d1(v) : d2(v), 'يسمّي سلّتيه وجوابه «بطوله»، أو لا يسمّيهما وجوابه «أطول/أقصر» وصاحبه «بطوله»'],
        ['الظنُّ أنّ ما «بطوله» هو الأقصر', v => pair(v) === 'same,short', 'من شيءٍ «بطوله» وآخر «أقصر»'],   /* الفحص المستقل F1 (2): كانت أزواج المسار العادي والمراجعة كلها (أطول، بطوله) */
        ['الظنُّ أنّ ما «بطوله» هو الأطول', v => pair(v) === 'long,same', 'من شيءٍ «بطوله» وآخر «أطول»']];
      const A = [...Object.values(M.concepts || {}).flat(), ...(M.mixed ? [M.mixed.item] : []), ...(L.review || []), ...((L.test && L.test.items) || []).map(q => q.item)].filter(TP);
      const PP = ['normal', 'challenge'].map(p => ['مسار التمرين ' + p, ((L.practice || {})[p] || []).filter(TP)]);
      if (!A.length && !PP.some(([, P]) => P.length)) continue;
      for (const [nm, S] of [...(A.length ? [['تقييم الدرس', A]] : []), ...PP]) { for (const [h, f, need] of H) if (!S.some(f))
          errors.push(`${L.id}: ${nm} (${S.map(v => '«' + v.q + '»').join('، ') || 'بلا بند تعدٍّ'}): يصيبه كلَّه ${h}؛ يلزم بندٌ ${need} (4ب14)`);
        /* والسؤال نفسه في البنود كلها يُحفظ ولا يُسمع (الفحص المستقل G1 (7): كان المسار العادي والمراجعة «أقصر؟» كلها، والتحدّي «أطول؟» كله): فيه «أطول؟» و«أقصر؟» معاً */
        const asks = new Set(S.map(v => v.ask || 'longer')); if (S.length && asks.size < 2) errors.push(`${L.id}: ${nm} (${S.map(v => '«' + v.q + '»').join('، ')}): سؤاله «${asks.has('shorter') ? 'أقصر' : 'أطول'}؟» في بنوده كلها؛ يلزم «أطول؟» و«أقصر؟» معاً (4ب14)`); }
      /* وتوأم التعدّي يحفظ فخّ أصله (الفحص المستقل F1 (5): ثلاثة توائم من أربعة تصيبها قاعدة يخطئ بها أصلها): جوابه «بطوله» كأصله أو «أطول/أقصر» وصاحبه «بطوله»
         كأصله، ويسمّي سلّتيه إن سمّاهما أصله، وجوابه في الموضع الآخر. (ولا يُطلب منه زوج سلّتي أصله: فالتوأم بالفخّ والزوج والموضع الآخر صورةُ المراجعة) */
      const TW = [...['normal', 'challenge'].flatMap(p => (L.practice || {})[p] || []), ...Object.values(M.remedial || {}).flat()].filter(v => TP(v) && TP(v.twin));
      for (const v of TW) { const w = v.twin;
        if (trap(w) !== trap(v)) errors.push(`${L.id}: توأم التعدّي «${w.q}» فخّه «${trap(w)}» وفخّ أصله «${v.q}» «${trap(v)}» (4ب14)`);
        if (named(w) !== named(v)) errors.push(`${L.id}: توأم التعدّي «${w.q}» ${named(w) ? 'يسمّي سلّتيه وأصله' : 'لا يسمّي سلّتيه وأصله يسمّيهما'} «${v.q}»${named(w) ? ' لا يسمّيهما' : ''} (4ب14)`);
        if (idx(w) === idx(v)) errors.push(`${L.id}: توأم التعدّي «${w.q}» جوابه في موضع جواب أصله «${v.q}» (${idx(v) ? 'يساراً' : 'يميناً'}) (4ب14)`); } } }
  // 4ب15) جنس الشيء المسمّى (HOUSE_F) كجنس اسمه (الفحص المستقل C1 لبوابة S1-U4: جمل الشيء العامة بضميره، «نهايتُه» للملعقة): اسمٌ آخر كلمته الأولى تاء مربوطة مؤنث
  { const hf = (code.match(/const HOUSE_F = new Set\(\[([^\]]*)\]\)/) || ['', ''])[1], HF = new Set([...hf.matchAll(/'(\w+)'/g)].map(m => m[1]));
    if (!HF.size) errors.push('فحص 4ب15: لم يُعثر على HOUSE_F في الكود');
    for (const [k, v] of Object.entries((content.labels && content.labels.ui) || {})) { if (!/^h\./.test(k)) continue; const o = k.slice(2), w = String(v).split(/\s+/)[0].replace(/[\u064B-\u0652]/g, ''), fem = /ة$/.test(w);
      if (fem !== HF.has(o)) errors.push(`HOUSE_F: «${o}» (${v}) ${fem ? 'مؤنث وليس فيها' : 'مذكر وفيها'}، فتُقال جمله العامة بضمير غير ضميره`); }
    /* وما يوزن (الفحص المستقل D1 لبوابة S1-U4): جنس WEIGH_F كاسمه في تسميات w.*، وضمير جملة كل بند ميزان (وتوأمه) كجنس شيئيه: «المسها» و«كلّ واحدة»
       إن كانا مؤنثين، و«المسه» و«كلّ واحد» إن لم يكونا */
    const wfs = (code.match(/const WEIGH_F = new Set\(\[([^\]]*)\]\)/) || ['', ''])[1], WF = new Set([...wfs.matchAll(/'(\w+)'/g)].map(m => m[1]));
    if (!WF.size) errors.push('فحص 4ب15: لم يُعثر على WEIGH_F في الكود');
    for (const [k, v] of Object.entries((content.labels && content.labels.ui) || {})) { if (!/^w\./.test(k)) continue; const o = k.slice(2), w = String(v).split(/\s+/)[0].replace(/[\u064B-\u0652]/g, ''), fem = /ة$/.test(w);
      if (fem !== WF.has(o)) errors.push(`WEIGH_F: «${o}» (${v}) ${fem ? 'مؤنث وليس فيها' : 'مذكر وفيها'}، فتُقال جمل الميزان العامة بضمير غير ضميره`); }
    const bareW = t => String(t).replace(/[\u064B-\u0652]/g, '');
    const walkW = (L, v) => { if (Array.isArray(v)) return v.forEach(x => walkW(L, x)); if (!v || typeof v !== 'object') return;
      if (v.lesson && v.item && lessons[v.lesson]) return walkW(lessons[v.lesson], v.item);   /* البند المشتبك بجمل درسه الأصلي */
      if (v.t === 'balance' && v.q && WF.size) { const q = bareW((L.lines || {})[v.q] || ''), both = WF.has(v.a) && WF.has(v.b), m = v.mode || 'read';
        const ok = m === 'test' ? (both ? /كل واحدة/.test(q) : /كل واحد(?!ة)/.test(q)) : (both ? /المسي?ها/.test(q) : /المسي?ه(?!ا)/.test(q) && !/المسي?ها/.test(q));
        if (!ok) errors.push(`${L.id}: ميزان «${v.q}» (${v.a}، ${v.b}): ضمير جملته غير جنس شيئيه (${both ? 'مؤنثان' : 'ليسا مؤنثين'})`); }
      for (const x of Object.values(v)) if (x && typeof x === 'object') walkW(L, x); };
    for (const L of Object.values(lessons)) walkW(L, [L.flow, L.practice, L.mastery, L.review, L.test]); }
  // 4ب16) ما في حقيبة الدرس يُستعمل في «معي» (الفحص المستقل C1 لبوابة S1-U4: المكعبات في الدرس 3، وورقة المربعات في 4، وبطاقات الأرقام في 5، لا تذكرها جملة):
  //      لكل شيء في الحقيبة اسمُه الرئيس في جملة «معي» من جمل الدرس (تعليمة المادة، وحركات الجسد في مسار «معي»)، في الوحدات كلها. والفحص المستقل D1 لبوابة S1-U4:
  //      كانت تكفي أيّ كلمة من التسمية بأوّل حروفها، فأعفت «ثلاث علب» بـ«ثلاثة»، و«شريط من ورق» بـ«ورقة»، و«ستة مكعبات» بـ«المكعب» (مفرد شيء آخر)، وتُخطّى ما لا تسمية
  //      له في الدرس (المنديل من صانعه). فالاسم الرئيس أوّل كلمة في كل معطوف ليست عدداً (وما بعد «من» و«ذو» وصفٌ، و«أو» بديلٌ يكفي أحدهما)، ويطابقه في «معي» الاسم
  //      نفسه بعدده (بأداة وحرف جرّ أو عطف، وبضمير متّصل)، والتسمية من مصادرها كلها: تسمية الدرس، والتسميات العامة، واسم الشيء من صانعه، واسم نوعه؛ وإن غابت فمخالفة
  { const N = t => String(t).replace(/[ً-ْـ]/g, '').replace(/[{}|]/g, ' ').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي');
    const NUMW = new Set(['ثلاث', 'ثلاثة', 'عشر', 'عشرة', 'اربع', 'اربعة', 'خمس', 'خمسة', 'ست', 'ستة', 'سبع', 'سبعة', 'ثماني', 'ثمانية', 'تسع', 'تسعة', 'اثنان', 'اثنتان']);
    /* والتاء المربوطة غير هاء الضمير (الفحص المستقل E1 (12أ): كانت ة→ه فطابق «العلبة» جمعَها «علب» بلاحقة «ه»، و«قطعة» «قطع») */
    const SUF = ['', 'ا', 'ه', 'ها', 'هما', 'هم', 'ك', 'كم', 'ي', 'نا', 'ين', 'ان', 'يه', 'يها', 'يك'], H = w => w;
    /* والمفرد في الحقيبة يذكره جمعه (الفحص المستقل E1 (12ج): «الدُّمَى» لشيء الحقيبة «دمية» كانت مخالفة): جمع المؤنث السالم، وجموع التكسير المستعملة هنا */
    const PL = { 'دمية': ['دمي'], 'علبة': ['علب'], 'قطعة': ['قطع'], 'ورقة': ['اوراق'], 'صندوق': ['صناديق'], 'كتاب': ['كتب'], 'قلم': ['اقلام'], 'غطاء': ['اغطية'], 'طبق': ['اطباق'],
      'ظرف': ['ظروف'], 'منديل': ['مناديل'], 'شريط': ['اشرطة'], 'كوب': ['اكواب'], 'ملعقة': ['ملاعق'], 'مشبك': ['مشابك'], 'حجر': ['احجار'], 'عود': ['اعواد'], 'دب': ['دببة'], 'لعبة': ['العاب'],
      'شيء': ['اشياء'], 'بلاطة': ['بلاط'], 'اصبع': ['اصابع'], 'قصاصة': ['قصاصات'], 'كرة': ['كرات'] };
    const cands = w => { const R = new Set(); for (const a of [w, w.replace(/^[وف](?=...)/, '')]) for (const b of [a, a.replace(/^(?:بال|كال|لل|ال)(?=..)/, ''), a.replace(/^[بلك](?=...)/, '')]) R.add(H(b)); return [...R]; };
    const nouns = lab => { const T = N(lab).split(/[\s،,]+/).filter(Boolean), alts = [[]]; let cur = null, stop = false;
      T.forEach((w, i) => { if (w === 'او') { alts.push([]); cur = null; stop = false; return; } if (w === 'من' || w === 'ذو' || w === 'ذات') { stop = true; return; }
        if (i > 0 && /^و/.test(w) && w.length > 3 && !/(?:ي|يه|ية)$/.test(w)) { cur = null; stop = false; w = w.slice(1); }   /* «ورق» و«ورقية» وصفٌ لا معطوف */
        if (stop || cur) return; const b = w.replace(/^ال/, ''); if (NUMW.has(b) || /^(?:اكثر|اقل)$/.test(b)) return; cur = b; alts[alts.length - 1].push(b); });   /* و«أو أكثر» وصفٌ لا بديل (E1 (12ب)) */
      return alts.filter(a => a.length); };
    /* «مكعبات» لا يطابقها «المكعب»؛ وجمع المؤنث يطابقه مفرده بتائه («بطاقتها»)، والمثنّى («قلمان») مفردُه */
    const hit = (n, mw) => { const K = [[n, SUF]]; if (/ة$/.test(n)) K.push([n.slice(0, -1), SUF.map(x => 'ت' + x).concat(['ة'])]);
      if (/ات$/.test(n)) K.push([n.slice(0, -2), ['ة', ...SUF.map(x => 'ت' + x)]]); if (/ان$/.test(n) && n.length > 4) K.push([n.slice(0, -2), SUF]);
      for (const p of [...(PL[n] || []), ...(/ة$/.test(n) ? [n.slice(0, -1) + 'ات'] : [])]) K.push([p, SUF]);
      const W = cands(mw); return K.some(([k, S]) => S.some(x => W.includes(H(k + x)))); };
    const ui = (content.labels && content.labels.ui) || {}, LO = (content.labels && content.labels.obj) || {}, LB = (content.labels && content.labels.bins) || {}, MK = {};
    for (const m of code.matchAll(/^\s*(\w+): \(\) => \(\{([^\n]*)/gm)) { const o = (m[2].match(/object: '(\w+)'/) || [])[1], k = (m[2].match(/kind: '(\w+)'/) || [])[1]; if (!(m[1] in MK)) MK[m[1]] = { o, k }; }
    if (Object.keys(MK).length < 20) errors.push('فحص 4ب16: لم يُعثر على الصانعات في الكود');
    for (const L of Object.values(lessons)) { if (!L.bag || !Array.isArray(L.bag.items)) continue;
      const ml = []; for (const st of L.flow || []) { if (st && st.mat && st.mat.prompt) ml.push(st.mat.prompt); if (st && st.scene === 'bodyMoves') for (const mv of st.moves || []) if (mv.say) ml.push(mv.say); }
      const mw = ml.flatMap(k => N((L.lines || {})[k] || '').split(/[^ء-ي]+/).filter(Boolean));
      /* وما يطلبه سؤال الحقيبة تذكره «معي» (الفحص المستقل D1 لبوابة S1-U4 (13): سؤال الدرس 3 يطلب كتاباً لا يُستعمل): كل معطوف بعد «معك» حتى «؟» */
      { const ask = N((L.lines || {})[L.bag.ask] || ''), q = ask.indexOf('؟'), body = q < 0 ? '' : ask.slice(0, q), at = body.lastIndexOf('معك');
        if (at < 0) errors.push(`${L.id}: سؤال الحقيبة «${L.bag.ask}» بلا «معك… ؟» (4ب16)`);
        else body.slice(at + 3).split('،').map(x => x.trim()).filter(Boolean).forEach((part, i) => { const P = i ? part.replace(/^و(?=..)/, '') : part, A = nouns(P);
          if (A.length && !A.some(a => a.every(n => mw.some(w => hit(n, w))))) errors.push(`${L.id}: سؤال الحقيبة يطلب «${P}» ولا تذكره جملة «معي» (4ب16)`); }); }
      for (const it of L.bag.items) { const o = typeof it === 'object' ? it : { mk: it }, m = MK[o.mk || ''] || {};
        const t = o.label ? ((L.labels || {})[o.label] || ui[o.label] || '') : (LO[m.o] || LB[m.k] || '');
        if (!String(t).trim()) { errors.push(`${L.id}: شيء في الحقيبة (${JSON.stringify(it)}) بلا تسمية تُعرف، فلا يُفحص أن «معي» تذكره (4ب16)`); continue; }
        const A = nouns(t); if (!A.length) { errors.push(`${L.id}: «${N(t)}» في الحقيبة بلا اسم يُعرف (4ب16)`); continue; }
        if (!A.some(a => a.every(n => mw.some(w => hit(n, w))))) errors.push(`${L.id}: «${N(t).trim()}» في الحقيبة ولا تذكر جملة «معي» ${A.map(a => a.filter(n => A.length > 1 || !mw.some(w => hit(n, w))).map(n => '«' + n + '»').join(' و')).join(' أو ')} (4ب16)`); } } }
  // 4ب18) «معي» لا تقول أعداد شاشتها (D258 (4)(ج)؛ الفحص المستقل F1 (3): ست جمل قالت أعداد الشاشة التي تخدمها، وواحدة خلاصتها بنصّها، وأُصلح في E1 موضعٌ لا النمط):
  //      كل عدد في جملة «معي» (تعليمتها وما بعدها، بالكلمة: «سبعة» و«الثالثة» و«ثلاثة عشر») ليس من أعداد الخطوة التي تخدمها، ولا ما بعدها ما دامت الخطوة عرضاً
  //      يمضي وحده (auto): أعداد بياناتها (بلا الأطوال والمواضع والفهارس والخيارات) وأعداد جملها كلها. والعشرة اسم الإطار والعمود وحدّ العدّ، والواحد في
  //      «واحداً بعد واحد» و«عمودٍ واحد» و«الأوّل» بدءُ العدّ، فلا يُعدّان؛ وما يُستثنى يُستثنى بسببه في MAT_SAME
  { const B = t => String(t).replace(GEN_RX, '$1').replace(/[\u064B-\u0652\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي');
    const CARD = new Map(Object.entries({ 'واحد': 1, 'واحدة': 1, 'اثنان': 2, 'اثنين': 2, 'اثنتان': 2, 'اثنتين': 2, 'ثلاث': 3, 'ثلاثة': 3, 'اربع': 4, 'اربعة': 4, 'خمس': 5, 'خمسة': 5,
      'ست': 6, 'ستة': 6, 'سبع': 7, 'سبعة': 7, 'ثماني': 8, 'ثمان': 8, 'ثمانية': 8, 'تسع': 9, 'تسعة': 9, 'عشر': 10, 'عشرة': 10, 'عشرون': 20, 'عشرين': 20 }));
    const ORD = new Map(Object.entries({ 'اول': 1, 'اولي': 1, 'ثاني': 2, 'ثانية': 2, 'ثالث': 3, 'ثالثة': 3, 'رابع': 4, 'رابعة': 4, 'خامس': 5, 'خامسة': 5, 'سادس': 6, 'سادسة': 6,
      'سابع': 7, 'سابعة': 7, 'ثامن': 8, 'ثامنة': 8, 'تاسع': 9, 'تاسعة': 9, 'عاشر': 10, 'عاشرة': 10 }));
    /* والعدد بسوابقه («وَ» و«فَ» ثم «بِ» و«لِ» و«كَ»، و«ال») ولواحقه (الضمير: «ثَلَاثَتَهَا» عددُها ثلاثة) — الفحص المستقل G1 (6): نجت «لِثَمَانِي» و«كَثَمَانِي» و«ثَلَاثَتَهَا» */
    const num = w => { const S = new Set([w]); for (const r of [/^[وف](?=..)/, /^[بلك](?=..)/, /^[وف][بلك](?=..)/]) S.add(w.replace(r, ''));
      for (const a of [...S]) S.add(a.replace(/^(?:ال|لل)(?=..)/, ''));
      for (const a of [...S]) { S.add(a.replace(/ا$/, '')); const p = a.replace(/(?:هما|هم|هن|ها|ه|كما|كم|نا)$/, ''); if (p !== a && p.length >= 2) { S.add(p); S.add(p.replace(/ت$/, 'ة')); } }
      for (const c of S) { if (CARD.has(c)) return [CARD.get(c), 'c']; if (ORD.has(c)) return [ORD.get(c), 'o']; } return null; };
    /* والمثنّى النكرة عددٌ: «رِسَالَتَيْنِ» اثنتان (الفحص المستقل H1 (6ب): حُذفت مسألة «ضع رسالتين» فلم يُرَ)، لا المعرّف («القَلَمَيْنِ» إشارةٌ إلى الشيئين) ولا «بَيْن»؛
       ويُعدّ في جملتي «معي» وحدهما (dual)، فلا يصير مثنّى الشاشة عدداً */
    const DUAL = /^(?!ال)(?!اث)[ء-ي\u064B-\u0652\u0640]*(?:\u064E\u064A\u0652\u0646\u0650?|\u062A\u064E\u0627\u0646\u0650?)$/;
    /* والمرفوع المذكّر «ـَانِ» (الفحص المستقل I1 (5): نجت «قَلَمَانِ»): لا يُفرَّق شكلاً عن المفرد المضاف («مَكَانِ الشَّيْءِ») ولا عن الفعل («يَتَسَاوَيَانِ»)، فيُعدّ إلا
       مفرداً معروفاً آخره «ان»، أو ما بعده معرَّف (إضافة)، أو فعلاً مضارعاً من قائمة DUAL_V (لا بشكل أوّله: الفحص المستقل J1 (6ب): نجت «تِمْسَاحَانِ» ولم تُعدّ «نَجْمَانِ»
       و«يَوْمَانِ» لأن أوّلها ت أو ن). وفعلٌ مثنّى ليس في القائمة يُعدّ 2، فيظهر خطأً يُضاف به إليها */
    const DUALM = /^(?!ال)(?!اث)[ء-ي\u064B-\u0652\u0640]+\u064E\u0627\u0646\u0650?$/;
    const SING_AN = new Set(['مكان', 'ميزان', 'زمان', 'انسان', 'لسان', 'بستان', 'فنجان', 'حيوان', 'عنوان', 'جيران', 'اسنان', 'الوان', 'رمان', 'دكان', 'مهرجان', 'سلطان', 'ميدان', 'فستان', 'ثعبان', 'بركان', 'دخان']);
    const DUAL_V = new Set(['يتساويان', 'تتساويان']);
    const nums = (t, dual = false) => { const V = String(t).replace(GEN_RX, '$1').match(/[ء-ي\u064B-\u0652\u0640]+/g) || [], W = V.map(w => B(w)), out = [];
      /* و«لِلْـ» معرَّفٌ كـ«الـ» (لـ + الـ): كان يُنزع منه «لِـ» وحده فيبقى «لْقَلَمَيْنِ» فيُعدّ؛ و«لِلّـ» بالشدّة كذلك (الحرف الشمسيّ: «لِلُّعْبَتَيْنِ»، الفحص المستقل J1 (6ب)) */
      const strip = w => { const v = w.replace(/^[وف]\u064E?/, ''); return /^لِ?ل(?:ْ|[\u064E\u064F\u0650]?\u0651[\u064E\u064F\u0650]?)?(?=[ء-ي])/.test(v) && /^لل/.test(B(v)) ? 'ال' + v : v.replace(/^[بلك]\u0650(?=[ء-ي])/, ''); };   /* والسابقة بكسرتها، لا حرف الكلمة («لَيْمُونَتَيْنِ») */
      if (dual) V.forEach((w, i) => { const x = strip(w), b = B(x); if ((DUAL.test(x) || (DUALM.test(x) && !SING_AN.has(b) && !DUAL_V.has(b) && !(i + 1 < V.length && /^ال/.test(W[i + 1])))) && W[i] !== 'بين') out.push(2); });
      for (let i = 0; i < W.length; i++) { const a = num(W[i]), b = i + 1 < W.length ? num(W[i + 1]) : null, x = W[i].replace(/^[وف](?=..)/, '');
        if (b && b[0] === 10 && /^(?:احد|احدي)$/.test(x)) { out.push(11); i++; continue; }
        if (b && b[0] === 10 && /^(?:اثنا|اثني|اثنتا|اثنتي)$/.test(x)) { out.push(12); i++; continue; }
        if (a && b && b[0] === 10 && a[0] < 10 && a[1] === 'c') { out.push(a[0] + 10); i++; continue; }
        if (a) out.push(a[0]); } return out; };
    const SK = new Set(['at', 'x', 'y', 'size', 'w', 'h', 'r', 'cx', 'cy', 'pad', 'scale', 'base', 'shift', 'lens', 'len', 'la', 'lb', 'push', 'stamp', 'avoid', 'vals', 'opts', 'pair', 'house', 'ref', 'rot', 'mat', 'lines', 'labels']);
    const dnums = (v, out, k) => { if (typeof v === 'boolean' || v == null) return out; if (typeof v === 'number') { if (Number.isInteger(v)) out.add(v); return out; }
      if (Array.isArray(v)) { if (k === 'towers') v.forEach(t => Array.isArray(t) && dnums(t[0], out)); else if (k === 'mail' || k === 'card') dnums(v[2], out); else v.forEach(x => dnums(x, out)); return out; }
      if (typeof v === 'object') for (const [kk, x] of Object.entries(v)) if (!SK.has(kk)) dnums(x, out, kk); return out; };
    const lids = (v, out) => { if (typeof v === 'string') out.add(v); else if (Array.isArray(v)) v.forEach(x => lids(x, out)); else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (k !== 'mat') lids(x, out); return out; };
    /* المستثنى بسببه: المكعبات الستّة في حقيبة S1-U2 د4 تُفكَّك باليد طريقتين، والشاشة بعدها تمشي طرق الستّة كلها بلا سؤال، فلا جواب يُقال قبلها */
    const MAT_SAME = { 'm1.u2.d4|mat.03': [6] }, usedSame = new Set();
    /* وعددٌ في «معي» ليس مسألة: المجموعات الأربع في فرز أشكال البيت (S1-U1 د4) عددُ السلال لا جوابٌ، والقصاصات الثلاث في خريطة S1-U3 د4 أشياءُ الغرفة */
    const MAT_FREE = { 'm1.u1.d4|mat.01': [4], 'm1.u3.d4|mat.01': [3] }, usedFree = new Set();
    for (const L of Object.values(lessons)) (L.flow || []).forEach((st, i) => { if (!st || !st.mat) return;
      for (const mk of [st.mat.prompt, st.mat.after].filter(Boolean)) { const M = new Set(nums((L.lines || {})[mk] || '', true)); M.delete(10); M.delete(1); if (!M.size) continue;
        const S = [i]; for (let j = i; L.flow[j] && L.flow[j].auto && j + 1 < L.flow.length; j++) S.push(j + 1);
        const scr = new Set(); for (const j of S) { dnums(L.flow[j], scr); for (const id of lids(L.flow[j], new Set())) if (L.lines && L.lines[id] && id !== mk) nums(L.lines[id]).forEach(n => scr.add(n)); }
        const ok = MAT_SAME[L.id + '|' + mk] || [], hitN = [...M].filter(n => scr.has(n) && !ok.includes(n)); ok.forEach(n => scr.has(n) && M.has(n) && usedSame.add(L.id + '|' + mk));
        if (hitN.length) errors.push(`${L.id}: جملة «معي» ${mk} تقول ${hitN.join('، ')} من أعداد الشاشة التي تخدمها (${S.map(j => L.flow[j].scene || L.flow[j].s).join('، ')}) (4ب18)`); }
      /* ومسألة «معي» نفسها بمفتاح d240 في mat.facts (الفحص المستقل G1 (3): اختيرت أعداد غير أعداد الشاشة فصارت مسائل التقييم: 16 في إتقان د5، و7 و7 في
         اختبار الوحدة، و3 و4 في اختبار S1-U2، وتتبّع 2 في مراجعة S1-U1 د5، وd240 يتخطّى mat). فكل «معي» فيها عدد أو «كَمْ» تعلن مسائلها (أو [] إن لم تكن مسألة)،
         وكل عدد في جملتيها من أعداد مسألة معلنة (الجمع بحاصله، والطرح بباقيه، والعشرة والآحاد بآحاده، وصديق العشرة بصاحبه)، أو مستثنى بسببه في MAT_FREE.
         ويعدّ d240 المسائل المعلنة معروضةً في الدرس، فلا يكون شيء منها مسألة تقييم في الدرس ولا في اختبار الوحدة */
      const T = [st.mat.prompt, st.mat.after].filter(Boolean).map(mk => (L.lines || {})[mk] || '').join(' ');
      const MM = new Set(nums(T, true)); MM.delete(10); MM.delete(1); const free = MAT_FREE[L.id + '|' + st.mat.prompt] || [];
      free.forEach(n => MM.has(n) && usedFree.add(L.id + '|' + st.mat.prompt)); free.forEach(n => MM.delete(n));
      if (!('facts' in st.mat)) { if (MM.size || /كَمْ/.test(T)) errors.push(`${L.id}: «معي» ${st.mat.prompt} ${MM.size ? 'فيها ' + [...MM].join('، ') : 'تسأل «كَمْ»'} بلا mat.facts: مسائلها مواصفاتُ بنود ({ of: نوع البند، ... })، أو [] إن لم تكن مسألة (4ب18)`); return; }
      if (!Array.isArray(st.mat.facts)) { errors.push(`${L.id}: «معي» ${st.mat.prompt}: mat.facts ليست قائمة (4ب18)`); return; }
      /* والمسألة مواصفةُ بندٍ يعطي مفتاحها d240 نفسه (factOf)، لا نصٌّ يُقبل ببادئته (الفحص المستقل H1 (6أ): مرّ «teen|16» ومفتاح d240 «teen|read|16») */
      const { nums: FN, res: RES, bad: BAD } = matNums(st.mat.facts.filter(sp => !(sp && typeof sp === 'object' && typeof sp.of === 'string' && !ITEMS.has(sp.of))));
      for (const sp of [...BAD, ...st.mat.facts.filter(sp => sp && typeof sp === 'object' && typeof sp.of === 'string' && !ITEMS.has(sp.of))])
        errors.push(`${L.id}: «معي» ${st.mat.prompt}: ${JSON.stringify(sp)} ليست مواصفة بندٍ لها مسألة في d240 ({ of: نوع البند، وحقوله }) (4ب18)`);
      /* وأعدادها ليست خيارات مكتوبة في بيانات الشاشة التي تخدمها (opts)؛ والمولَّدة حول الجواب تتجنّبها في الكود بـ mat.avoid (H1 (10أ)) */
      { const OPT = new Set(), og = v => { if (Array.isArray(v)) return v.forEach(og); if (!v || typeof v !== 'object') return; for (const [k, x] of Object.entries(v)) { if (k === 'opts' && Array.isArray(x)) x.forEach(n => Number.isInteger(n) && OPT.add(n)); else if (k !== 'mat' && x && typeof x === 'object') og(x); } };
        const SS = [i]; for (let j = i; L.flow[j] && L.flow[j].auto && j + 1 < L.flow.length; j++) SS.push(j + 1); SS.forEach(j => og(L.flow[j]));
        const hit = [...FN].filter(n => n !== 10 && OPT.has(n)); if (hit.length) errors.push(`${L.id}: «معي» ${st.mat.prompt}: ${hit.join('، ')} من مسائلها خيارٌ مكتوب في الشاشة التي تخدمها (4ب18)`); }
      const un = [...MM].filter(n => !FN.has(n)); if (un.length) errors.push(`${L.id}: «معي» ${st.mat.prompt} تقول ${un.join('، ')} ولا مسألة ${un.length > 1 ? 'لها' : 'له'} في mat.facts (${JSON.stringify(st.mat.facts)}) (4ب18)`);
      /* و«معي» التي تطلب عدّاً أو حساباً («كَمْ…؟»، «عُدَّ…») تقول جوابه في جملتيها، فيسمع الطفل ما وجده بيديه (الفحص المستقل G1 9(ج)، ثم H1 (10ب): أُصلح في د5 وحده) */
      if (/كَمْ|عُدَّ|عُدِّي/.test(T)) for (const [f, r] of RES) if (!new Set(nums(T, true)).has(r)) errors.push(`${L.id}: «معي» ${st.mat.prompt} تطلب العدّ ولا تقول جواب ${f} (${r}) في جملتيها (4ب18)`); });
    for (const k of Object.keys(MAT_SAME)) if (!usedSame.has(k)) errors.push(`MAT_SAME: «${k}» لا يُستعمل (يُحذف، 4ب18)`);
    for (const k of Object.keys(MAT_FREE)) if (!usedFree.has(k)) errors.push(`MAT_FREE: «${k}» لا يُستعمل (يُحذف، 4ب18)`); }
  // 4ب17) لكل شيء اسمٌ واحد (الفحص المستقل C1 لبوابة S1-U4 (18): «الشريطتين» لما سُمّي شريطاً، فأُصلح في موضعه وبقي النمط في زرّ «افرد الشريطة»
  //      وسؤال خطأ الملتوي «الشريطة… نهايتها» والبنود تقول «شريطان، أحدهما ملتوٍ»، الدرس 113): اسم الشيء المسمّى (h.* وw.* وأشياء الحقيبة وأنواع الطول)
  //      لا يأتي في جملةٍ بصيغة جنسه الآخر (شريط/شريطة، ومثنّاها ومضافها). وما يتّفق رسمه وهو كلمة أخرى مستثنى بعينه (كتاب/كتابة، طريق/طريقة، قطع/قطعة…)
  { const bare17 = t => String(t).replace(/[ً-ْٰ]/g, '').replace(/[{}|]/g, ' ');
    const first = v => ((bare17(Array.isArray(v) ? v[0] : v).match(/[ء-ي]+/g) || [])[0] || '').replace(/^ال/, '');
    const UI = (content.labels && content.labels.ui) || {}, names = new Set(['شريط', 'قلم', 'دودة']);   /* أنواع الطول في lenAt: strip وribbon شريط، وpencil قلم، وworm دودة */
    for (const [k, v] of Object.entries(UI)) if (/^[hw]\./.test(k)) names.add(first(v));
    for (const L of Object.values(lessons)) for (const it of ((L.bag && L.bag.items) || [])) if (it && it.label) names.add(first((L.labels || {})[it.label] || UI[it.label] || ''));
    const OTHER = new Set(['كتابة', 'كتابتين', 'طريقة', 'قطعة', 'قطعتين', 'قطعتان', 'ورق', 'علب', 'كف', 'مربعة', 'مسطحة', 'بقية', 'عشر', 'عشرين', 'ثلاث', 'ثلاثة', 'ست', 'ستة']);   /* كلمات أخرى، لا صيغة للشيء (و«قطعة» ومثنّاها مفرد «قطع»: «أَبْعِدْ قِطْعَتَيْنِ») */
    const variants = new Map();
    for (const n of names) { if (n.length < 3) continue; const V = /ة$/.test(n) ? [n.slice(0, -1), n.slice(0, -1) + 'ان', n.slice(0, -1) + 'ين'] : [n + 'ة', n + 'تان', n + 'تين', n + 'تي', n + 'تا'];
      for (const v of V) if (v.length > 2 && !OTHER.has(v) && !names.has(v)) variants.set(v, n); }
    if (!variants.has('شريطة')) errors.push('فحص 4ب17: لا اسم «شريط» بين الأسماء');
    for (const c of clips) for (const t of [].concat(c.text)) for (const w0 of (bare17(t).match(/[ء-ي]+/g) || [])) {
      const w = [w0, w0.replace(/^[وفبلك]/, ''), w0.replace(/^[وفبلك]?(?:ال|لل)/, '')].find(x => variants.has(x));
      if (w) errors.push(`${c.full}: «${w0}» والشيء اسمه «${variants.get(w)}» في غيرها (4ب17: لكل شيء اسم واحد)`); } }
  // 4ب10) «سبعةٌ وثلاثةٌ عشرةٌ» تُسمع «… ثلاثة عشر» (الفحص المستقل A لبوابة S1-U4): عدد آحاد يليه «عَشَرَةٌ» بلا فاصل (والعدد المركّب المؤنث «عَشْرَةَ» بسكون الشين صحيح)
  { const NUMW = '(?:وَاحِدٌ|اثْنَانِ|ثَلَاثَةٌ|أَرْبَعَةٌ|خَمْسَةٌ|سِتَّةٌ|سَبْعَةٌ|ثَمَانِيَةٌ|تِسْعَةٌ)', rx = new RegExp(NUMW + '\\s+(?:وَ)?عَشَرَةٌ');
    for (const c of clips) for (const t of [].concat(c.text)) if (rx.test(String(t))) errors.push(`${c.full}: «${String(t).match(rx)[0]}» تُسمع عدداً مركّباً: يُفصل بفاصلة («… ثَلَاثَةٌ، مَعًا عَشَرَةٌ»)`); }
  // 4ب9) لكل شيء مسمّى طول واحد في الدرس، في بنوده كلها وتوائمه ومشاهده (الفحص المستقل A لبوابة S1-U4: المفتاح ثلاثة مشابك ثم أربعة ثم خمسة في الدرس 3،
  //      والملعقة في اللوحة «بطول الشبر» بعد أن كانت ستة مشابك والمشط أربعة، فانقلب ترتيبهما؛ وهذا ينقض حفظ الطول وثبات القياس بالوحدة نفسها).
  //      والقلم في مشاهد القياس قلمٌ واحد كذلك. ورسم التعدّي في اللوحة أيقونتان بطول واحد عمداً (لا يُقارَن بالنظر)، فليس طولاً للشيء
  { const UU9 = Object.fromEntries([...(code.match(/const UNIT_U = \{([^}]*)\}/) || ['', ''])[1].matchAll(/(\w+): (\d+)/g)].map(m => [m[1], +m[2]])), MU9 = +((code.match(/const MU = (\d+)/) || [])[1] || 28);
    if (!Object.keys(UU9).length) errors.push('فحص 4ب9: لم يُعثر على UNIT_U في الكود');
    const PEN = 'pencil';
    /* وفي الوحدة كلها لا في الدرس وحده (الفحص المستقل C1 لبوابة S1-U4: الحذاء «أطول من الشبر» في الدرس 4 و«أقصر» في المحطة، والكتاب 140 ثم 196 ثم 178)؛
       والقلم في مشاهد القياس هو القلم في بنودها. وقياس الشيء بمكعبات العشرة الصغيرة في الدرس 5 (rodCount) بمقياس آخر فلا يدخل */
    const seen = new Map(), U4 = Object.values(lessons).filter(L => /^m1\.u4\./.test(L.id));
    for (const L of U4) {
      const add = (o, len, where) => { if (o == null || !(len > 0)) return; if (!seen.has(o)) seen.set(o, new Map()); const m = seen.get(o); if (!m.has(len)) m.set(len, where); };
      const walk = (v, where) => { if (Array.isArray(v)) return v.forEach(x => walk(x, where)); if (!v || typeof v !== 'object') return; const t = v.t, sc = v.scene, w = where + (v.q ? ' «' + v.q + '»' : sc ? ':' + sc : '');
        if (['unitCount', 'unitLay', 'unitCheck'].includes(t)) add(v.obj, v.n * UU9[v.unit], w);
        if (t === 'spanSort') add(v.obj, v.len, w);
        if (t === 'transPick') { add(v.a, v.la, w); add(v.b, v.lb, w); }
        if ((t === 'orderBy' || t === 'lenPick') && Array.isArray(v.house)) v.house.forEach((o, i) => add(o, (v.vals || v.lens || [])[i], w));
        if (t === 'reason' && v.pic && v.pic.kind === 'units') add(v.pic.obj || 'book', v.pic.n * UU9[v.pic.unit || 'clip'], w);
        if (sc === 'contractorBoard') for (const [o, len] of v.house || []) add(o, len, w);
        if (sc === 'gapsHook' || sc === 'chaosStartMid' || sc === 'unitStrip') add(PEN, v.n * MU9, w);
        if (sc === 'clipLay') add(PEN, v.len, w);
        if (sc === 'recallU4' && v.pic && v.pic.kind === 'meas') add(PEN, v.pic.n * UU9[v.pic.unit || 'clip'], w);
        for (const [k, x] of Object.entries(v)) if (!['lines', 'labels'].includes(k)) walk(x, k === 'twin' ? where + ' (توأم)' : where); };
      walk(L, L.id); }
    for (const [o, m] of seen) if (m.size > 1) errors.push(`m1.u4: «${o}» بأطوال مختلفة في الوحدة: ${[...m].map(([len, w]) => len + ' في ' + w).join('، و')} (لكل شيء طول واحد في الوحدة، الفحصان المستقلان A وC1 لبوابة S1-U4)`); }
  // 4ب6) علاج «بقي كما هو/تغيّر» فيه بقاءٌ خالص (الفحص المستقل E): الخطأ الذي يعالجه «البعثرة تزيد» (N002)، فلو كانت بنوده كلها بزيادة لكان «تغيّر»
  //      صواباً دائماً، ولمُدح الطفل على الخطأ الذي يُعالَج (كانت زيادةٌ لتوازن موضع الجواب قد وُضعت في بند العلاج الوحيد)
  for (const L of Object.values(lessons)) for (const [c, a] of Object.entries((L.mastery || {}).remedial || {})) { const s = (a || []).filter(v => v && v.t === 'same');
    if (s.length && s.every(v => v.add)) errors.push(`${L.id}: علاج ${c}: بنود «بقي كما هو/تغيّر» كلها بزيادة، فـ«تغيّر» صواب دائماً ولا يُعالَج خطأ البعثرة`); }
  // 4ب19) حلٌّ مشترك له مادة (كان «4ب7» في S1-U3، وأخذت صيغتا الولد والبنت الرقم نفسه) (الفحص المستقل D وE): «نعم/لا» حلّه جملته solve، فبند بمساعدة بلا solve محاولته الرابعة كالأولى (هل يتدحرج المخروط؟)؛
  //      و«ضع الدب في الطابور» جملة حلّه من كلمته، فإن سمّى السؤال «آخر الطابور» أو «أول الطابور» فكلمته last أو first لا «خلف» و«أمام»
  { const bare = s => s.replace(/[ً-ْ]/g, '');
    for (const L of Object.values(lessons)) { const st = L.flow.filter(s => s.scene === 'items' && ['practice', 'remedial'].includes(s.mode)); const P = L.practice || {}, M = L.mastery || {};
      const base = [...(P.normal || []), ...(P.challenge || []), ...Object.values(M.remedial || {}).flat(), ...st.flatMap(s => s.items || [])];
      for (const v of [...base, ...base.map(x => x && x.twin).filter(Boolean)]) { if (!v || typeof v.t !== 'string') continue;
        if (v.t === 'yesno' && !v.solve) errors.push(`${L.id}: yesno «${v.q}» بمساعدة بلا جملة حلّ (solve): محاولته الرابعة كالأولى`);
        if (v.t === 'place' && v.ref === 'queue') { const c = LINES.get(v.q.startsWith('gen.') ? v.q : L.id + '.' + v.q); const t = c ? bare(c.text) : '';
          for (const [w, k] of [['آخر', 'last'], ['أول', 'first']]) if (t.includes(w + ' الطابور') && v.word !== k) errors.push(`${L.id}: «${v.q}» يسمّي «${w} الطابور» وكلمة حلّه ${v.word || 'من الفراغ'}: word '${k}'`); } } } }
  // 4ج) في بند التعليل لا يكون الصحيح أطول الأسباب بفرق ظاهر (الفحص المستقل الثالث، ن3): طوله بلا تشكيل ≤ 1.2 × أطول المشتّتين؛
  //     وكذلك بطاقتا «أيّ أمر نفّذ الروبوت؟» و«أيّ وصف يناسب الطريق؟» (S1-U3): نصّهما ظاهر كأسباب التعليل، فلا يدلّ الطول على الصحيحة
  const bare = t => String(t || '').replace(/\{([^|{}]*)\|[^{}]*\}/g, '$1').replace(/[\u064B-\u0652\u0670]/g, '').replace(/\s+/g, ' ').trim().length;
  const walkWhy = (v, where, L) => { if (Array.isArray(v)) return v.forEach(x => walkWhy(x, where, L)); if (!v || typeof v !== 'object') return;
    if (['reason', 'robotWatch', 'routePick'].includes(v.t) && Array.isArray(v.opts)) { const txt = id => (L.lines && L.lines[id]) || (content.gen.lines || {})[id] || ''; const ok = v.opts.filter(o => o.ok).map(o => bare(txt(o.id))), bad = v.opts.filter(o => !o.ok).map(o => bare(txt(o.id)));
      if (ok.length && bad.length && Math.max(...ok) > 1.2 * Math.max(...bad)) errors.push(`${where}: في بند ${v.t === 'reason' ? 'التعليل' : 'البطاقتين'} «${v.q}» الصحيح ${Math.max(...ok)} حرفاً وأطول المشتّتين ${Math.max(...bad)}: الطول قرينة`); }
    for (const [k, x] of Object.entries(v)) if (!['lines', 'labels'].includes(k)) walkWhy(x, where, L); };
  for (const L of Object.values(lessons)) walkWhy(L, L.id, L);
  // 4د) «ابحث في الغرفة» (D255): الغرفة تسع ستة أشياء في صفّين مبعثرين، وتُختار من قائمة أطول منها، ولكل نوع يُسأل عنه شيء في القائمة
  const MSIG = makerSigs(code); const walkRoom = (v, where) => { if (Array.isArray(v)) return v.forEach(x => walkRoom(x, where)); if (!v || typeof v !== 'object') return;
    if (v.scene === 'roomHunt') { const n = v.n || 6, th = v.things || [], kinds = new Set(th.map(r => (MSIG[r] || {}).kind).filter(Boolean));
      if (n > 6) errors.push(`${where}: roomHunt.n = ${n}، والغرفة تسع ستة أشياء (D255)`);
      if (th.length < n) errors.push(`${where}: roomHunt فيه ${th.length} أشياء و n = ${n}`);
      for (const r of th) if (!MSIG[r] || !MSIG[r].kind) errors.push(`${where}: roomHunt شيء «${r}» ليس مولّداً له نوع`);
      for (const rd of v.rounds || []) if (!kinds.has(rd.k)) errors.push(`${where}: roomHunt يسأل عن «${rd.k}» ولا شيء من نوعه في أشياء الغرفة`); }
    for (const [k, x] of Object.entries(v)) if (!['lines', 'labels'].includes(k)) walkRoom(x, where); };
  for (const L of Object.values(lessons)) walkRoom(L, L.id);
  // 5) D232
  const head = read(join(ROOT, 'src', 'head.html'));
  for (const need of ['<!doctype html>', 'lang="ar"', 'dir="rtl"', 'charset="utf-8"', 'name="viewport"']) if (!head.includes(need)) errors.push(`الرأس ينقصه ${need} (D232)`);
  const net = head.match(/https?:\/\/[^"'\s)]+/g) || [];                                // ولا الخط: مضمّن من assets/fonts/ (D256)
  if (net.length) errors.push('الرأس يحمّل من الشبكة: ' + net.join(', '));
  const gendered = clips.filter(c => { GEN_RX.lastIndex = 0; return GEN_RX.test(c.text); }).length;
  /* ومفتاحٌ في جدول الحركة لا تبلغه كلمة يُحذف (H1 (7د): بقيت «ابتد» و«املأ» و«املئ» بعد تغيّر الجمل)، فلا يُراجَع ما لا يُستعمل ولا يقبل ما لم يُكتب */
  for (const T of ['wasl', 'pres', 'af']) for (const k of Object.keys(VOW[T] || {})) if (!USED[T].has(k)) errors.push(`build/vowels.json: المفتاح «${k}» في ${T} لا تبلغه كلمة في المحتوى (يُحذف)`);
  const summary = `فحص المحتوى: ${clips.length} جملة (${gendered} بصيغتين)، ${Object.keys(ERR).length} وسم خطأ، ${Object.keys(lessons).length} درساً، ${ITEMS.size} نوع بند، ${SCENES.size} مشهداً — ${errors.length} مخالفة، ${warn.length} تنبيه`;
  return { errors, warn, summary };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { loadContent, readModules } = await import('./content.mjs');
  const r = lint(loadContent(), readModules());
  console.log(r.summary); for (const w of r.warn) console.log('  تنبيه:', w); for (const e of r.errors) console.log('  مخالفة:', e);
  process.exit(r.errors.length ? 1 : 0);
}
