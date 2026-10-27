import asyncio,sys
from playwright.async_api import async_playwright
async def dump(path):
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page()
        await pg.goto('file://'+path); await pg.wait_for_timeout(400)
        r=await pg.evaluate("()=>{const o={};for(const c of Object.keys(CB)){o[c]=CB[c].map(f=>{const it=f();return itemKind(it)+'|'+it.q})}return o}")
        await b.close(); return r
a=asyncio.run(dump(sys.argv[1])); b=asyncio.run(dump(sys.argv[2]))
bad=[c for c in a if set(a[c])!=set(b[c])]
print('concepts',len(a),'set-differs',len(bad),bad[:10])
for c in bad[:5]: print(c, set(a[c])-set(b[c]))
print('total items', sum(len(v) for v in a.values()), sum(len(v) for v in b.values()))
lost=[]
for c in a:
    qa={x.split('|',1)[1] for x in a[c]}; qb={x.split('|',1)[1] for x in b[c]}
    for q in qa-qb: lost.append((c,q[:60]))
print('question texts fully lost (no kind left):', lost)
