# يدمج بنود الإثراء مع حكم المراجع المستقل: ok يبقى، fix تُطبَّق حقوله، reject يُستبعد
import sys, json, importlib.util
def load(path, name):
    spec = importlib.util.spec_from_file_location('m', path); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return getattr(m, name)
slice_ = sys.argv[1]
C = load(f'/home/claude/enrich/add_{slice_}.py', 'C')
V = load(f'/home/claude/enrich/verify_{slice_}.py', 'V')
missing = [i for i in range(len(C)) if i not in V]
assert not missing, ('verdicts missing for', missing)
out, log = [], []
ALLOWED = {'q', 'correct', 'wrongs', 'ans', 'tol', 'hint', 'steps', 'source', 'level', 'type', 'kind', 'svg', 'qf'}
for i, c in enumerate(C):
    v = V[i]; verdict = v.get('verdict')
    if verdict == 'reject':
        log.append((i, c['cid'], 'مستبعد', v.get('issues', ''), c['data'].get('q', ''))); continue
    d = dict(c['data'])
    if verdict == 'fix':
        fx = v.get('fixed') or {}
        bad = set(fx) - ALLOWED
        assert not bad, (i, bad)
        d.update(fx)
        if d.get('type') == 'num': d.pop('correct', None); d.pop('wrongs', None)
        else: d.pop('ans', None); d.pop('tol', None)
        log.append((i, c['cid'], 'مصحَّح: ' + '، '.join(fx), v.get('issues', ''), d.get('q', '')))
    d['enrich'] = True
    out.append(dict(cid=c['cid'], match=None, op='add', data=d, ref=c.get('ref', 'إثراء'), why=c.get('why', '')))
src = 'C = ' + json.dumps(out, ensure_ascii=False, indent=1).replace('null', 'None').replace('true', 'True').replace('false', 'False') + '\n'
open(f'/home/claude/enrich/final_{slice_}.py', 'w', encoding='utf-8').write(src)
L = [f'# سجل التحقق المستقل: الشريحة {slice_}\n', f'- البنود المقدَّمة: {len(C)} · المقبولة: {len(out)} · المصحَّحة: {sum(1 for x in log if x[2].startswith("مصحَّح"))} · المستبعدة: {sum(1 for x in log if x[2] == "مستبعد")}\n',
     '| # | المفهوم | الحكم | السبب | السؤال |', '|---|---|---|---|---|']
L += [f'| {i} | {cid} | {k} | {str(why).replace("|", "/")} | {q} |' for i, cid, k, why, q in log]
open(f'/home/claude/enrich/verify_log_{slice_}.md', 'w', encoding='utf-8').write('\n'.join(L) + '\n')
print(slice_, 'in', len(C), 'out', len(out), 'fixed', sum(1 for x in log if x[2].startswith('مصحَّح')), 'rejected', sum(1 for x in log if x[2] == 'مستبعد'))
