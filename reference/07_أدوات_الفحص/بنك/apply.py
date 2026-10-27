import json, sys, importlib.util, re
src, corr_path, out, log = sys.argv[1:5]
spec=importlib.util.spec_from_file_location('c',corr_path); m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
bank=json.load(open(src,encoding='utf-8'))
L=['# سجل تصحيحات البنك (%s)\n'%corr_path.split('/')[-1], '| # | المفهوم | المعرّف | العملية | السؤال قبل | السؤال بعد | المرجع | السبب |','|---|---|---|---|---|---|---|---|']
def nextid(cid):
    n=max([int(x['id'].split('-')[1]) for x in bank[cid]]+[0])+1; return f'{cid}-{n:02d}'
def check(d):
    if d['type']=='choice':
        assert d['correct'] not in d['wrongs'], d['q']
        assert len(set(d['wrongs']))==len(d['wrongs']), d['q']
        assert len(d['wrongs'])>=1
    else: assert isinstance(d['ans'],(int,float))
    assert d['q'].strip() and isinstance(d['steps'],list)
for i,c in enumerate(m.C,1):
    cid=c['cid']; op=c['op']; data=dict(c['data'])
    if op=='add' and cid not in bank: bank[cid]=[]   # مفهوم جديد (منذ الميثاق 1.51)
    if op=='add':
        d={'id':nextid(cid),'kind':data.pop('kind'),'type':data.pop('type'),'q':data.pop('q'),'hint':'','steps':[]}
        d.update(data); check(d); bank[cid].append(d)
        L.append(f"| {i} | {cid} | {d['id']} | إضافة | — | {d['q']} | {c['ref']} | {c['why']} |"); continue
    k_only=data.pop('_kind',None)
    hits=[x for x in bank[cid] if c['match'] in x['q'] and (k_only is None or x['kind']==k_only)]
    assert len(hits)==1, (cid, c['match'], len(hits))
    x=hits[0]; before=x['q']
    if op=='delete':
        bank[cid].remove(x); L.append(f"| {i} | {cid} | {x['id']} | حذف | {before} | — | {c['ref']} | {c['why']} |"); continue
    if op=='move':
        to=data.pop('to'); bank[cid].remove(x); x.update(data); x['id']=nextid(to); check(x); bank[to].append(x)
        L.append(f"| {i} | {cid} → {to} | {x['id']} | نقل | {before} | {x['q']} | {c['ref']} | {c['why']} |"); continue
    x.update(data)
    if x['type']=='num': x.pop('correct',None); x.pop('wrongs',None)
    else: x.pop('ans',None); x.pop('tol',None)
    check(x)
    L.append(f"| {i} | {cid} | {x['id']} | تعديل ({'، '.join(data.keys())}) | {before} | {x['q']} | {c['ref']} | {c['why']} |")
bank={k:bank[k] for k in sorted(bank,key=lambda c:int(c[1:]))}
json.dump(bank,open(out,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
# فحوص بعد التطبيق
def qk(s): return re.sub(r'\s+',' ',re.sub(r'[؟?.,،:؛!«»"()\-–—]',' ',re.sub(r'[ً-ْـ]','',s))).strip()
short=[(c,sum(1 for x in v if x['kind']=='فهم')) for c,v in bank.items() if sum(1 for x in v if x['kind']=='فهم')<3]
dups=[(c,k) for c,v in bank.items() for k in set(qk(x['q']) for x in v) if sum(1 for x in v if qk(x['q'])==k)>1]
L.append(f"\n**بعد التطبيق:** {sum(len(v) for v in bank.values())} بنداً في {len(bank)} مفهوماً. مفاهيم بأقل من 3 أسئلة فهم: {short or 'لا شيء'}. تكرار في المعنى (النص المطبَّع): {len(dups)} حالة.")
if hasattr(m,'WHY'): L.append('\n## نصوص «لماذا؟» المصحَّحة\n'+'\n'.join(f'- **{k}:** {v}' for k,v in m.WHY.items()))
open(log,'w',encoding='utf-8').write('\n'.join(L)+'\n')
print('applied',len(m.C),'items',sum(len(v) for v in bank.values()),'short',short,'dups',len(dups))
for d in dups[:40]: print(' dup',d)
