/* البداية */
defs(); renderDigits();
{ const f = el('svg', { viewBox: '0 0 360 120', preserveAspectRatio: 'xMidYMax slice' }); skyline(f, { y: 108, h: 100, n: 7, opacity: 1 }); el('rect', { x: 0, y: 106, width: 360, height: 14, fill: css('--ground') }, f); $('#cityfloor').appendChild(f); } try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', defs); } catch (e) {}
renderMute();
if (!PROFILE) openProfile(true); else if (KIDS.length > 1) { showHome(); openKids(true); } else showHome();
