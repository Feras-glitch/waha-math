# (1) to_data: raw → bank.json (مصدر البيانات الوحيد)   (2) inject: bank.json → app.html (يستبدل كل كتل CB)
import json, sys, re
sys.path.insert(0,'/home/claude/bank'); from scan import bank_statements
def to_data(raw_path, out_path):
    raw=json.load(open(raw_path,encoding='utf-8'))
    bank={}
    for cid in sorted(raw['live']):
        seen=set(); items=[]
        for x in raw['live'][cid]:
            key=(x['kind'],x['q'])
            if key in seen: continue
            seen.add(key)
            d={'id':'','kind':x['kind'],'type':x['type'],'q':x['q']}
            if x['type']=='choice': d['correct']=x['correct']; d['wrongs']=x['wrongs']
            else: d['ans']=x['ans']; d['tol']=x['tol'] or 0
            d['hint']=x['hint']; d['steps']=x['steps']
            if x.get('svg'): d['svg']=x['svg']
            items.append(d)
        for i,d in enumerate(items,1): d['id']=f'{cid}-{i:02d}'
        bank[cid]=items
    json.dump(bank,open(out_path,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
    return bank
def svg_map(raw_path):
    raw=json.load(open(raw_path,encoding='utf-8')); return raw
BUILDER = r"""// ===== بنك الأسئلة: مصدر بيانات واحد (يُولَّد من 06_بنك_الأسئلة/bank.json، لا يُحرَّر هنا يدوياً) =====
// لكل مفهوم قائمة بنود؛ كل بند: id، kind (تعرّف/فهم)، type (choice/num)، q، correct+wrongs أو ans+tol، hint، steps، svg اختياري.
const BANK = __BANK__;
const CB = {};
Object.keys(BANK).forEach(cid => {
  CB[cid] = BANK[cid].map(d => () => {
    const base = d.type === 'choice'
      ? Q_C(d.q, d.correct, d.wrongs.slice(), d.hint, d.steps.slice())
      : Q_N(d.q, d.ans, d.tol, d.hint, d.steps.slice());
    const it = { ...base, kind: d.kind, bid: d.id };
    if (d.svg) it.svg = d.svg;
    return it;
  });
});"""
def inject(app_in, bank_path, app_out, svgs):
    s=open(app_in,encoding='utf-8').read()
    bank=json.load(open(bank_path,encoding='utf-8'))
    m=re.search(r'^const BANK = (\{.*?\});?$', s, re.M)
    if m:   # التطبيق مبني على BANK أصلاً (منذ 9.5): نستبدل كتلة البيانات وحدها
        s=s[:m.start(1)]+json.dumps(bank,ensure_ascii=False,separators=(',',':'))+s[m.end(1):]
        open(app_out,'w',encoding='utf-8').write(s); return
    st=bank_statements(s)
    first=st[0]; assert first[2]=='const'
    code=BUILDER.replace('__BANK__', json.dumps(bank,ensure_ascii=False,separators=(',',':')))
    # احذف من الآخر للأول حتى لا تتغير المواضع
    for a,b,k in reversed(st):
        s=s[:a]+(code if k=='const' else '/* (كتلة بنك أسئلة نُقلت إلى BANK) */')+s[b:]
    open(app_out,'w',encoding='utf-8').write(s)
if __name__=='__main__':
    cmd=sys.argv[1]
    if cmd=='to_data': to_data(sys.argv[2],sys.argv[3])
    else: inject(sys.argv[2],sys.argv[3],sys.argv[4],None)
