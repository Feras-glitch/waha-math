/* =====================================================================
   مولّدات الأشكال والأشياء
   ===================================================================== */
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const MK = {
  circle: () => ({ type: 'circle', kind: 'circle', size: R(110, 136), color: nextColor(), tag: 'circle' }),
  plate: () => ({ type: 'circle', kind: 'circle', size: 132, color: nextColor(), object: 'plate', label: 'طَبَق', tag: 'circle' }),
  clock: () => ({ type: 'circle', kind: 'circle', size: 128, color: nextColor(), object: 'clock', label: 'سَاعَة', tag: 'circle' }),
  wheel: () => ({ type: 'circle', kind: 'circle', size: 124, color: '#4a5a62', object: 'wheel', label: 'عَجَلَة', tag: 'circle' }),
  oval: () => ({ type: 'oval', kind: 'other', size: 156, rot: Math.random() < .5 ? 0 : 90, color: nextColor(), tag: 'oval' }),
  squareUp: () => ({ type: 'square', kind: 'square', size: 120, rot: 0, color: nextColor(), tag: 'squareUp' }),
  squareRot: (rot) => ({ type: 'square', kind: 'square', size: R(96, 124), rot: rot ?? R(25, 55), color: nextColor(), tag: 'squareRot' }),
  tile: () => ({ type: 'square', kind: 'square', size: 104, rot: 45, color: nextColor(), object: 'tile', label: 'بَلَاطَة', tag: 'squareRot' }),
  napkin: () => ({ type: 'square', kind: 'square', size: 112, rot: 20, color: nextColor(), object: 'napkin', label: 'مِنْدِيل', tag: 'squareRot' }),
  window4: () => ({ type: 'square', kind: 'square', size: 116, rot: 0, color: '#8a6d4e', object: 'window', label: 'شُبَّاك', tag: 'squareUp' }),
  triUp: () => ({ type: 'triangle', kind: 'triangle', size: 130, rot: 0, color: nextColor(), tag: 'triUp' }),
  triFlip: () => ({ type: 'triangle', kind: 'triangle', size: 126, rot: 180, color: nextColor(), tag: 'triFlip' }),
  triThin: () => ({ type: 'triangle', kind: 'triangle', w: 70, h: 150, rot: R(-20, 20), color: nextColor(), tag: 'triThin' }),
  triWide: () => ({ type: 'triangle', kind: 'triangle', w: 170, h: 80, apex: .5, rot: 0, color: nextColor(), tag: 'triThin' }),
  sign: () => ({ type: 'triangle', kind: 'triangle', size: 130, rot: 0, color: '#d9483b', object: 'sign', label: 'لَافِتَة', tag: 'triUp' }),
  cheese: () => ({ type: 'triangle', kind: 'triangle', w: 140, h: 100, apex: -1, rot: 0, color: '#f2c14e', object: 'cheese', label: 'قِطْعَةُ جُبْنٍ', tag: 'triThin' }),
  curvedTri: () => ({ type: 'curvedTri', kind: 'other', size: 130, rot: 0, color: nextColor(), tag: 'curvedTri' }),
  openTri: () => ({ type: 'openTri', kind: 'other', size: 130, rot: 0, color: nextColor(), tag: 'openTri' }),
  rectH: () => ({ type: 'rect', kind: 'rect', w: R(160, 190), h: R(80, 96), rot: 0, color: nextColor(), tag: 'rectH' }),
  rectV: () => ({ type: 'rect', kind: 'rect', w: R(80, 92), h: R(150, 170), rot: 0, color: nextColor(), tag: 'rectV' }),
  rectRot: () => ({ type: 'rect', kind: 'rect', w: 170, h: 84, rot: R(25, 40), color: nextColor(), tag: 'rectRot' }),
  door: () => ({ type: 'rect', kind: 'rect', w: 88, h: 160, rot: 0, color: '#9c6837', object: 'door', label: 'بَاب', tag: 'rectV' }),
  envelope: () => ({ type: 'rect', kind: 'rect', w: 170, h: 104, rot: R(-12, 12), color: nextColor(), object: 'envelope', label: 'ظَرْف', tag: 'rectRot' }),
};
Object.assign(MAKER, MK);

