/* البداية */
/* الخطّان مضمّنان (D256) ولا يُحمَّلان إلا حين يُستعملان: نطلبهما من البداية، فتُقاس أسماء السلال (labelFit) بخط القراءة نفسه لا ببديله */
try { ['400 20px "Waha Naskh"', '700 20px "Waha Naskh"', '800 20px "Baloo Bhaijaan 2"'].forEach(f => document.fonts.load(f).catch(() => {})); } catch (e) {}
defs(); renderMute(); tabClaim();
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { defs(); if (!$('#home').hidden) showHome(); }); } catch (e) {}
if (!PROFILE) firstRun(); else if (KIDS.length > 1) { showHome(); openKids(true); } else showHome();
