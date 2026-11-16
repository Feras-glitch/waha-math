/* أدوات الاستوديو بلا مكتبات خارجية: zip (قراءة وكتابة)، وWAV، وOgg Opus بـ WebCodecs، وIndexedDB، وبصمة النص.
   مواصفة الاستوديو، الأقسام 2 و6. */
'use strict';

/* ---------- CRC32 (zip) ---------- */
const CRC_T = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(u8) { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = CRC_T[(c ^ u8[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
const TE = new TextEncoder(), TD = new TextDecoder();

/* zip مخزَّن (بلا ضغط: الصوت مضغوط أصلاً)، بأسماء UTF-8 */
function makeZip(entries) {
  const parts = [], central = []; let off = 0;
  const dt = new Date(), dosT = (dt.getHours() << 11) | (dt.getMinutes() << 5) | (dt.getSeconds() >> 1), dosD = ((dt.getFullYear() - 1980) << 9) | ((dt.getMonth() + 1) << 5) | dt.getDate();
  for (const e of entries) {
    const name = TE.encode(e.name), data = e.data instanceof Uint8Array ? e.data : TE.encode(e.data), crc = crc32(data);
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
    h.setUint16(10, dosT, true); h.setUint16(12, dosD, true); h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true);
    h.setUint16(26, name.length, true); h.setUint16(28, 0, true);
    parts.push(new Uint8Array(h.buffer), name, data);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true);
    c.setUint16(12, dosT, true); c.setUint16(14, dosD, true); c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true);
    c.setUint16(28, name.length, true); c.setUint32(42, off, true);
    central.push(new Uint8Array(c.buffer), name);
    off += 30 + name.length + data.length;
  }
  const csize = central.reduce((s, p) => s + p.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, entries.length, true); end.setUint16(10, entries.length, true); end.setUint32(12, csize, true); end.setUint32(16, off, true);
  return concatU8([...parts, ...central, new Uint8Array(end.buffer)]);
}
function concatU8(arr) { const n = arr.reduce((s, a) => s + a.length, 0), o = new Uint8Array(n); let p = 0; for (const a of arr) { o.set(a, p); p += a.length; } return o; }

/* قراءة zip: مخزَّن أو deflate (DecompressionStream). يعيد Map اسم ← Uint8Array */
async function readZip(u8) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength); let e = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 66000); i--) if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; }
  if (e < 0) throw new Error('ليس ملف zip');
  const n = dv.getUint16(e + 10, true); let p = dv.getUint32(e + 16, true); const out = new Map();
  for (let k = 0; k < n; k++) {
    if (dv.getUint32(p, true) !== 0x02014b50) throw new Error('zip تالف');
    const method = dv.getUint16(p + 10, true), csz = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true);
    const name = TD.decode(u8.subarray(p + 46, p + 46 + nl)); p += 46 + nl + xl + cl;
    const ds = lo + 30 + dv.getUint16(lo + 26, true) + dv.getUint16(lo + 28, true), raw = u8.subarray(ds, ds + csz);
    if (method === 0) out.set(name, raw);
    else if (method === 8) out.set(name, new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer()));
    else throw new Error('ضغط غير مدعوم في ' + name);
  }
  return out;
}

/* ---------- WAV (16 بت، أحادي) ---------- */
function wavBytes(i16, sr) {
  const b = new DataView(new ArrayBuffer(44 + i16.length * 2)); const w = (o, s) => { for (let i = 0; i < 4; i++) b.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); b.setUint32(4, 36 + i16.length * 2, true); w(8, 'WAVE'); w(12, 'fmt '); b.setUint32(16, 16, true); b.setUint16(20, 1, true); b.setUint16(22, 1, true);
  b.setUint32(24, sr, true); b.setUint32(28, sr * 2, true); b.setUint16(32, 2, true); b.setUint16(34, 16, true); w(36, 'data'); b.setUint32(40, i16.length * 2, true);
  for (let i = 0; i < i16.length; i++) b.setInt16(44 + i * 2, i16[i], true);
  return new Uint8Array(b.buffer);
}
const toF32 = i16 => { const f = new Float32Array(i16.length); for (let i = 0; i < i16.length; i++) f[i] = i16[i] / 32768; return f; };
const toI16 = f => { const o = new Int16Array(f.length); for (let i = 0; i < f.length; i++) { const v = Math.max(-1, Math.min(1, f[i])); o[i] = v < 0 ? v * 32768 : v * 32767; } return o; };

/* ---------- Ogg Opus بـ WebCodecs ---------- */
const OGG_T = (() => { const t = new Uint32Array(256); for (let i = 0; i < 256; i++) { let r = i << 24; for (let k = 0; k < 8; k++) r = r & 0x80000000 ? (r << 1) ^ 0x04c11db7 : r << 1; t[i] = r >>> 0; } return t; })();
function oggCrc(u8) { let c = 0; for (let i = 0; i < u8.length; i++) c = ((c << 8) ^ OGG_T[((c >>> 24) ^ u8[i]) & 0xFF]) >>> 0; return c >>> 0; }
function oggPage(packets, granule, serial, seq, flags) {
  const lace = []; for (const p of packets) { let n = p.length; while (n >= 255) { lace.push(255); n -= 255; } lace.push(n); }
  const h = new Uint8Array(27 + lace.length), dv = new DataView(h.buffer);
  h.set(TE.encode('OggS'), 0); h[4] = 0; h[5] = flags; dv.setUint32(6, granule % 4294967296, true); dv.setUint32(10, Math.floor(granule / 4294967296), true);
  dv.setUint32(14, serial, true); dv.setUint32(18, seq, true); dv.setUint32(22, 0, true); h[26] = lace.length; h.set(lace, 27);
  const page = concatU8([h, ...packets]); new DataView(page.buffer).setUint32(22, oggCrc(page), true); return page;
}
const OPUS_SR = 48000, PRESKIP = 312;
async function opusSupported() {
  try { return typeof AudioEncoder !== 'undefined' && (await AudioEncoder.isConfigSupported({ codec: 'opus', sampleRate: OPUS_SR, numberOfChannels: 1, bitrate: 64000 })).supported; } catch (e) { return false; }
}
async function resample(f32, sr, to) {
  if (sr === to) return f32;
  const ctx = new OfflineAudioContext(1, Math.ceil(f32.length * to / sr), to), buf = ctx.createBuffer(1, f32.length, sr); buf.copyToChannel(f32, 0);
  const s = ctx.createBufferSource(); s.buffer = buf; s.connect(ctx.destination); s.start(); return (await ctx.startRendering()).getChannelData(0);
}
async function encodeOpus(i16, sr, bitrate) {
  const pcm = await resample(toF32(i16), sr, OPUS_SR); const packets = [];
  let err = null; const enc = new AudioEncoder({ output: ch => { const d = new Uint8Array(ch.byteLength); ch.copyTo(d); packets.push(d); }, error: e => { err = e; } });
  enc.configure({ codec: 'opus', sampleRate: OPUS_SR, numberOfChannels: 1, bitrate: bitrate || 64000 });
  const tail = new Float32Array(pcm.length + PRESKIP + 960); tail.set(pcm, 0);   /* حشو صامت يُخرج آخر إطار كاملاً */
  const step = 4800;
  for (let i = 0; i < tail.length; i += step) { const s = tail.subarray(i, Math.min(tail.length, i + step));
    enc.encode(new AudioData({ format: 'f32', sampleRate: OPUS_SR, numberOfFrames: s.length, numberOfChannels: 1, timestamp: Math.round(i * 1e6 / OPUS_SR), data: s })); }
  await enc.flush(); enc.close(); if (err) throw err;
  const serial = (Math.random() * 0xFFFFFFFF) >>> 0;   // rng-ok: رقم تسلسل Ogg لا يدخل في محتوى
  const head = new Uint8Array(19), hv = new DataView(head.buffer); head.set(TE.encode('OpusHead'), 0); head[8] = 1; head[9] = 1; hv.setUint16(10, PRESKIP, true); hv.setUint32(12, OPUS_SR, true);
  const vendor = TE.encode('waha-studio'), tags = new Uint8Array(8 + 4 + vendor.length + 4), tv = new DataView(tags.buffer); tags.set(TE.encode('OpusTags'), 0); tv.setUint32(8, vendor.length, true); tags.set(vendor, 12);
  const pages = [oggPage([head], 0, serial, 0, 2), oggPage([tags], 0, serial, 1, 0)];
  const total = pcm.length + PRESKIP; let g = PRESKIP, seq = 2;
  for (let i = 0; i < packets.length; i += 25) { const grp = packets.slice(i, i + 25); g += grp.length * 960; const last = i + 25 >= packets.length;
    pages.push(oggPage(grp, last ? total : Math.min(g, total), serial, seq++, last ? 4 : 0)); }
  return concatU8(pages);
}

/* ---------- IndexedDB ---------- */
const DB = (() => { let dbp = null;
  const open = () => dbp || (dbp = new Promise((res, rej) => { const r = indexedDB.open('waha-studio', 1);
    r.onupgradeneeded = () => { const d = r.result; for (const s of ['kv', 'takes', 'batches']) if (!d.objectStoreNames.contains(s)) d.createObjectStore(s); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }));
  const tx = async (store, mode, fn) => { const d = await open(); return new Promise((res, rej) => { const t = d.transaction(store, mode), s = t.objectStore(store); let out; const q = fn(s);
    if (q) q.onsuccess = () => { out = q.result; }; t.oncomplete = () => res(out); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); }); };
  return { get: (s, k) => tx(s, 'readonly', st => st.get(k)), put: (s, k, v) => tx(s, 'readwrite', st => st.put(v, k)), del: (s, k) => tx(s, 'readwrite', st => st.delete(k)),
    all: (s) => tx(s, 'readonly', st => st.getAll()), keys: (s) => tx(s, 'readonly', st => st.getAllKeys()) }; })();

/* ---------- بصمة النص: أول 12 من sha1 لنص الولد وسطر ونص البنت (أو لا شيء). تحسبها build/studio.mjs وtools/studio_import.py كذلك ---------- */
async function textHash(m, f) { const d = await crypto.subtle.digest('SHA-1', TE.encode(m + '\n' + (f || ''))); return [...new Uint8Array(d)].map(x => x.toString(16).padStart(2, '0')).join('').slice(0, 12); }

/* ---------- تحليل التسجيل: القص والفحوص (مواصفة الاستوديو، القسم 4) ---------- */
const DB_OF = v => 20 * Math.log10(Math.max(1e-9, v));
function analyze(f32, sr, maxSec) {
  const W = Math.round(sr / 100), nF = Math.floor(f32.length / W), fr = new Float32Array(nF); let peak = 0, clip = 0;
  for (let i = 0; i < f32.length; i++) { const a = Math.abs(f32[i]); if (a > peak) peak = a; if (a > 0.985) clip++; }
  for (let k = 0; k < nF; k++) { let s = 0; for (let i = k * W; i < (k + 1) * W; i++) s += f32[i] * f32[i]; fr[k] = DB_OF(Math.sqrt(s / W)); }
  const sorted = Array.from(fr).sort((a, b) => a - b), noise = nF ? sorted[Math.floor(nF * 0.1)] : -90;
  const thr = Math.max(noise + 12, -50); let a = -1, b = -1; for (let k = 0; k < nF; k++) if (fr[k] > thr) { if (a < 0) a = k; b = k; }
  const res = { noise: Math.round(noise), checks: [] };
  if (a < 0 || b - a < 15) { res.checks.push('empty'); res.trim = f32.subarray(0, 0); res.dur = 0; return res; }
  const pad = Math.round(sr * 0.15), s0 = Math.max(0, a * W - pad), s1 = Math.min(f32.length, (b + 1) * W + pad);
  res.trim = f32.slice(s0, s1); res.dur = Math.round(res.trim.length / sr * 100) / 100;
  let ss = 0, sn = 0; for (let k = a; k <= b; k++) if (fr[k] > thr) { ss += Math.pow(10, fr[k] / 10); sn++; }
  res.level = Math.round(10 * Math.log10(ss / sn)); res.peak = Math.round(DB_OF(peak) * 10) / 10;
  if (clip > 3) res.checks.push('clip');
  if (res.level < -32) res.checks.push('low');
  if (noise > -50) res.checks.push('noisy');
  if (maxSec && res.dur > maxSec + 0.3) res.checks.push('long');
  for (let i = s0; i < Math.min(a * W, s0 + pad); i++) if (Math.abs(f32[i]) > 0.3) { res.checks.push('click'); break; }
  return res;
}
const CHECK_TXT = { empty: 'لم يُسمع كلام. اقترب من الهاتف وأعِد.', clip: 'الصوت مرتفع حتى التشوّه. ابتعد قليلاً عن الهاتف.', low: 'الصوت منخفض. اقترب من الهاتف أو ارفع صوتك قليلاً.',
  noisy: 'في الغرفة ضجيج. أطفئ المروحة أو المكيّف إن استطعت.', long: 'المقطع أطول من الحد. جرّب إيقاعاً أسرع قليلاً.', click: 'نقرة في البداية. انتظر لحظة بعد اللمس قبل أن تتكلم.' };

/* ---------- فرق صيغتي الولد والبنت: الكلمات المختلفة (LCS على الكلمات) ---------- */
function diffWords(a, b) {
  const A = a.split(/\s+/), B = b.split(/\s+/), n = A.length, m = B.length, L = Array.from({ length: n + 1 }, () => new Int16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const ka = new Set(), kb = new Set(); let i = 0, j = 0;
  while (i < n && j < m) { if (A[i] === B[j]) { i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) ka.add(i++); else kb.add(j++); }
  while (i < n) ka.add(i++); while (j < m) kb.add(j++);
  return [A.map((w, k) => [w, ka.has(k)]), B.map((w, k) => [w, kb.has(k)])];
}

if (typeof module !== 'undefined') module.exports = { crc32, makeZip, readZip, wavBytes, analyze, diffWords, toI16, toF32, oggCrc };
