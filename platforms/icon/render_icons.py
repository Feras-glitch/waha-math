# يرسم أيقونات التطبيق من icon.svg (مرة واحدة، والنتائج في المستودع): PNG للويب، وICO لويندوز
# python3 platforms/icon/render_icons.py   (يحتاج playwright وPillow)
import asyncio, os, io
from playwright.async_api import async_playwright
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
SVG = open(os.path.join(HERE, 'icon.svg'), encoding='utf-8').read()
async def png(pg, size):
    await pg.set_viewport_size({'width': size, 'height': size})
    await pg.set_content(f"<body style='margin:0'>{SVG.replace('<svg ', f'<svg width=\"{size}\" height=\"{size}\" ', 1)}</body>")
    return await pg.screenshot(omit_background=True, clip={'x': 0, 'y': 0, 'width': size, 'height': size})
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        for s in (512, 192, 180, 48, 32):
            open(os.path.join(HERE, f'icon-{s}.png'), 'wb').write(await png(pg, s))
        big = Image.open(io.BytesIO(await png(pg, 256))).convert('RGBA')
        big.save(os.path.join(HERE, 'icon.ico'), sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
        await b.close()
asyncio.run(main())
print('ok')
