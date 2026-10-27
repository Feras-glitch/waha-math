import re, sys
from collections import defaultdict
SRC, DST = sys.argv[1], sys.argv[2]
PREFIX = sys.argv[3] if len(sys.argv) > 3 else ''
s = open(SRC, encoding='utf-8').read()
FAHM_RX = re.compile(r'(لماذا|كيف|هل|ما الخطأ|أي العبارتين|أيّ العبارتين|أيّ العبارات|أي العبارات|صحيح أم خطأ|صحيح أو خطأ|يكفي|يمكن|الفرق|اكتشف|أثبت|تفسّر|تفسر|إذا|قارن|تبرّر|برّر|استنتج|تحقّق|أيّهما|أيهما)')
cb_start = s.find('const CB = {')
last = max(m.start() for m in re.finditer(r'Object\.assign\(CB', s))
cb_end = s.find('});', last) + 3
def q_literal(pos):
    m = re.compile(r"Q_[A-Z0-9]+\(\s*").match(s, pos)
    if not m: return None
    i = m.end(); ch = s[i]
    if ch not in "'\"": return None
    j = i + 1
    while s[j] != ch: j += 2 if s[j] == '\\' else 1
    return s[i+1:j]
ARROW = re.compile(r'\(\)\s*=>')
def item_bounds(qpos):
    starts = [m.start() for m in ARROW.finditer(s, cb_start, qpos)]
    if not starts: return None
    st = starts[-1]
    if len(ARROW.findall(s[st+2:qpos])) > 0: return None
    d = 0; k = st
    while k < len(s):
        c = s[k]
        if c in "'\"":
            q = c; k += 1
            while s[k] != q: k += 2 if s[k] == '\\' else 1
            k += 1; continue
        if c in '([{': d += 1
        elif c in ')]}':
            if d == 0: return st, k
            d -= 1
        elif c == ',' and d == 0: return st, k + 1
        k += 1
    return None
def concept_at(pos):
    ms = list(re.finditer(r'(?m)^\s*(C\d{3})\s*:', s[cb_start:pos]))
    return ms[-1].group(1) if ms else None
items = []  # (cid, pos, q, kind, a, b)
for m in re.finditer(r"Q_[A-Z0-9]+\(\s*['\"]", s[cb_start:cb_end]):
    pos = cb_start + m.start()
    q = q_literal(pos)
    if q is None: continue
    cid = concept_at(pos)
    if not cid or not cid.startswith(PREFIX): continue
    b = item_bounds(pos)
    if not b: continue
    wrapper = s[b[0]:pos]
    if re.search(r'(?<![A-Za-z])_[A-Z][A-Z0-9]*\(', wrapper):
        kind = 'فهم'
    else:
        kind = 'فهم' if FAHM_RX.search(q) else 'تعرّف'
    items.append((cid, pos, q, kind, b[0], b[1]))
# count per concept, original
orig = defaultdict(lambda: defaultdict(int))
for cid, pos, q, kind, a, b in items: orig[cid][kind] += 1
need = {'فهم': 3, 'تعرّف': 1}
cur = {c: dict(v) for c, v in orig.items()}
groups = defaultdict(list)
for it in items: groups[(it[0], it[2])].append(it)
remove = []
for (cid, q), L in groups.items():
    if len(L) < 2 or cid in ('C158',): continue
    fahm = [x for x in L if x[3] == 'فهم']
    keep = fahm[0] if fahm else L[0]
    for x in L:
        if x is keep: continue
        remove.append(x)
keepset = set(id(g[0]) for g in groups.values() if g)
keep_ranges = []
for (cid_, q_), L_ in groups.items():
    fahm_ = [x for x in L_ if x[3] == 'فهم']
    kk = fahm_[0] if fahm_ else L_[0]
    keep_ranges.append((kk[4], kk[5]))
remove.sort(key=lambda x: x[4], reverse=True)
applied = []
for x in remove:
    a, b = x[4], x[5]
    if any(not (b <= ka or a >= kb) for ka, kb in keep_ranges): 
        print('skip overlap with keep', x[0], x[2][:30]); continue
    if any(not (b <= ra or a >= rb) for ra, rb in applied):
        print('skip overlap with removal', x[0], x[2][:30]); continue
    applied.append((a, b))
    s = s[:a] + s[b:]
print('removed', len(remove))
open(DST, 'w', encoding='utf-8').write(s)
