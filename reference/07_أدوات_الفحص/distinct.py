import asyncio,sys,json
from playwright.async_api import async_playwright
async def main(path):
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page()
        await pg.goto('file://'+path); await pg.wait_for_timeout(500)
        r=await pg.evaluate("""()=>{const out={};for(const c of Object.keys(CB)){const k={};
          const seen={};
          for(const f of CB[c]){for(let t=0;t<3;t++){const it=f();const kk=itemKind(it);(seen[kk]=seen[kk]||new Set()).add(it.q);}}
          out[c]={};for(const kk in seen) out[c][kk]=seen[kk].size;}return out}""")
        await b.close(); return r
a=asyncio.run(main('/home/claude/work/app_before_clean.html'))
b=asyncio.run(main('/home/claude/work/app.html'))
json.dump({'a':a,'b':b},open('/tmp/dist.json','w'),ensure_ascii=False)
for c in a:
    if a[c].get('فهم',0)!=b[c].get('فهم',0) or a[c].get('تعرّف',0)!=b[c].get('تعرّف',0):
        print(c,'before',a[c],'after',b[c])
