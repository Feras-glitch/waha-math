/* global PROG, saveProg, showHome, startLesson */
/* سائق «شاهد المشهد» (مواصفة الاستوديو، القسم 5): يُحقن في نسخة الفحص من المحرّك (#fast&seed=…)، ويمضي في درس واحد
   بإجابات آلية حتى تُنطق جملة بعينها، ثم يقف فيبقى المشهد على الشاشة.
   والملف نفسه يستعمله test/studio_where.py ليبني خريطة «أين تُقال كل جملة»، فما يجده الفحص يجده الاستوديو بالسياسة نفسها.
   السياسات: ok كل جواب صحيح؛ mixed أول مرة لكل نوع بند في التمرين والاكتشاف خطأ؛ deep أربعة أخطاء لكل بند تمرين (يبلغ الكشف والتوأم)؛
   mat كـ ok في مسار «معي» (الأشياء الحقيقية) بدل الشاشة. والبذرة (seed في عنوان الصفحة) تغيّر اختيار البنود من مخازنها. */
(function () {
  'use strict';
  const KID = 'kstudio';
  /* قبل تحميل المحرّك: طفل ثابت المعرّف، فعشوائية الدرس (reseed بمعرّف الطفل والدرس) واحدة في كل تشغيل */
  function prime(gender) {
    for (const k of Object.keys(localStorage)) if (k.startsWith('hp_')) localStorage.removeItem(k);
    localStorage.setItem('hp_settings', JSON.stringify({ sessionMax: 0 })); localStorage.setItem('hp_muted', 'true');
    localStorage.setItem('hp_kids', JSON.stringify([{ id: KID, name: 'استوديو', gender: gender === 'm' ? 'm' : 'f', photo: '', avatar: gender === 'm' ? 'm2' : 'f3' }]));
    localStorage.setItem('hp_kid', JSON.stringify(KID));
  }
  const vis = s => { const e = document.querySelector(s); return !!e && !e.hidden; };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  /* يشغّل الدرس lesson بالسياسة policy حتى تُنطق target (أو حتى ينتهي الدرس إن لم تُعطَ). onClip(id) لكل جملة تُنطق.
     يعيد {found, clips, ended, steps} */
  async function run(lesson, policy, target, opt) {
    opt = opt || {};
    const maxMs = opt.maxMs || 240000, t0 = Date.now(); let seen = 0, last = -1, steps = 0, idle = 0;
    const types = new Set(), deep = new Map();
    PROG.unlockAll = true; saveProg(); showHome(); await sleep(150);
    startLesson(lesson); await sleep(150);
    /* الجملة ذات الصيغتين تُنطق باسم ملفها (…_m أو …_f) */
    const isT = x => x === target || x === target + '_m' || x === target + '_f';
    /* الجملة المطلوبة تُلتقط لحظة نطقها (onTarget)، قبل أن يمضي الوضع السريع إلى ما بعدها */
    const arr = []; let hit = false; arr.push = function (...v) { const r = Array.prototype.push.apply(this, v); if (target && !hit && v.some(isT)) { hit = true; if (opt.onTarget) try { opt.onTarget(); } catch (e) {} } return r; };
    window.__clips = arr; const clips = () => window.__clips || [];
    for (;;) {
      const c = clips();
      for (; seen < c.length; seen++) { if (opt.onClip) opt.onClip(c[seen]); if (target && isT(c[seen])) return { found: true, clips: c.slice(), ended: false, steps }; }
      if (Date.now() - t0 > maxMs) return { found: false, clips: c.slice(), ended: false, steps, timeout: true };
      if (vis('#home') && ![...document.querySelectorAll('.cover')].some(x => !x.hidden)) return { found: false, clips: c.slice(), ended: true, steps };
      if (vis('#crashCover')) return { found: false, clips: c.slice(), ended: true, steps, crash: true };
      if (vis('#exitCover')) { document.querySelector('#rsGo').click(); await sleep(40); continue; }
      const a = window.__auto;
      if (a && a.n !== last) {
        last = a.n; steps++; idle = 0;
        const sc = window.__scene || '', mode = window.__itemMode || '', it = window.__item, itype = it ? it.itype : '';
        if (sc.endsWith(':bag') || (a.kind === 'pick' && sc.indexOf('bag') >= 0)) {
          const b = [...document.querySelectorAll('.choices .pick')]; (b.find(x => x.dataset.k === (policy === 'mat' ? 'mat' : 'screen')) || b[0]).click();
        } else {
          let wrong = false;
          if (policy === 'mixed' && (mode === 'practice' || mode === 'explore') && itype && !types.has(itype)) { types.add(itype); wrong = true; }
          else if (policy === 'deep' && mode === 'practice' && itype && !window.__itemTwin) {
            const k = sc + '|' + (it.q || it.story || '') + '|' + a.kind, n = deep.get(k) || 0;
            if (n < 4) { deep.set(k, n + 1); wrong = true; }
          }
          (wrong && a.wrong ? a.wrong : a.ok)();
        }
        await sleep(40); continue;
      }
      const go = document.querySelector('#go');
      if (go && !go.disabled && !go.classList.contains('idle')) { go.click(); idle = 0; await sleep(30); continue; }
      if (++idle > 600) return { found: false, clips: c.slice(), ended: false, steps, stuck: true };
      await sleep(50);
    }
  }
  window.__studioDriver = { prime, run, KID };
})();
