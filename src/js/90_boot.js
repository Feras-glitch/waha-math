/* البداية */
defs(); renderMute(); tabClaim();
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { defs(); if (!$('#home').hidden) showHome(); }); } catch (e) {}
if (!PROFILE) firstRun(); else if (KIDS.length > 1) { showHome(); openKids(true); } else showHome();
