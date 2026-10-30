/* البداية */
/* الخطّان مضمّنان (D256) ولا يُحمَّلان إلا حين يُستعملان: نطلبهما من البداية، فتُقاس أسماء السلال (labelFit) بخط القراءة نفسه لا ببديله */
try { ['400 20px "Waha Naskh"', '700 20px "Waha Naskh"', '800 20px "Baloo Bhaijaan 2"'].forEach(f => document.fonts.load(f).catch(() => {})); } catch (e) {}
defs(); renderMute(); tabClaim();
VPACK.load().catch(() => {});   /* حزمة الصوت المحفوظة (D181): ما سُجّل يُقال بها، والباقي بصوت الجهاز */
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { defs(); if (!$('#home').hidden) showHome(); }); } catch (e) {}
kidDelCheck();   /* حذف طفلٍ لم يكتمل: لا يُستأنف وحده، ويُلغى إن كان هو المختار (الفحص المستقل WM101-R1-01، R1-02) */
if (!PROFILE) firstRun(); else if (KIDS.length > 1) { showHome(); openKids(true); } else showHome();
