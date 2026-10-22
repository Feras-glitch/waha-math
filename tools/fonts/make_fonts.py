# يُعِدّ خطَّي الواحة المضمَّنين (D232، D256) من ملفات Google Fonts الرسمية (ترخيص OFL 1.1):
#   python3 tools/fonts/make_fonts.py <مجلد ofl في نسخة من github.com/google/fonts>
#   (يكفي منه ofl/scheherazadenew/ وofl/baloobhaijaan2/؛ مثلاً: git clone --depth 1 --filter=blob:none --sparse … ثم git sparse-checkout set ofl/scheherazadenew ofl/baloobhaijaan2)
# الناتج في assets/fonts/: الخطوط المقتطَعة بصيغة woff، وfonts.json (الأوجه والحروف المغطّاة، يقرؤه البناء ويفحص به المحتوى)، ونصّا الترخيص.
# - خط القراءة: Scheherazade New (SIL Global) بوزنين 400 و700. اسمه محجوز في ترخيصه (Reserved Font Name: «Scheherazade» و«SIL»)،
#   والاقتطاع تعديل في نظر الترخيص، فيُسمّى المقتطَع «Waha Naskh» في الخط نفسه وفي CSS، ويبقى فيه نصّ الحقوق والترخيص (OFL، البندان 2 و3).
# - خط العناوين: Baloo Bhaijaan 2 (Ek Type) متغيّر الوزن 400–800، بلا اسم محجوز، فيبقى اسمه.
# الحروف: اللاتينية الأساسية، والعربية كاملة (U+0600–06FF، ليُكتب أي اسم يدخله الكبير)، وعلامات الترقيم المستعملة. مع كل خصائص التشكيل (GSUB/GPOS).
import json, os, sys, shutil
from fontTools import subset
from fontTools.ttLib import TTFont

OFL = sys.argv[1] if len(sys.argv) > 1 else sys.exit('الاستعمال: python3 tools/fonts/make_fonts.py <مجلد ofl>')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'assets', 'fonts')
RANGES = [(0x20, 0x7E), (0xA0, 0xA0), (0xAB, 0xAB), (0xB7, 0xB7), (0xBB, 0xBB), (0xD7, 0xD7), (0xF7, 0xF7), (0x600, 0x6FF),
          (0x200B, 0x200F), (0x2010, 0x2027), (0x2066, 0x2069), (0x2190, 0x2192), (0x2212, 0x2212), (0x25CB, 0x25CC), (0x25CF, 0x25CF)]   # ·، والأسهم في بطاقة الأرقام، و○● في نقاط الورشة
WANT = sorted({c for a, b in RANGES for c in range(a, b + 1)})

FACES = [
  dict(src='scheherazadenew/ScheherazadeNew-Regular.ttf', family='Waha Naskh', weight='400', style='Regular', file='WahaNaskh-Regular.woff', rename=True, lic='scheherazadenew/OFL.txt', role='read'),
  dict(src='scheherazadenew/ScheherazadeNew-Bold.ttf',    family='Waha Naskh', weight='700', style='Bold',    file='WahaNaskh-Bold.woff',    rename=True, lic='scheherazadenew/OFL.txt', role='read'),
  dict(src='baloobhaijaan2/BalooBhaijaan2[wght].ttf',     family='Baloo Bhaijaan 2', weight='400 800', style=None, file='BalooBhaijaan2.woff', rename=False, lic='baloobhaijaan2/OFL.txt', role='display'),
]

def rename(font, family, style):
  # الاسم الأساسي فقط يتغيّر (OFL البند 3)؛ تبقى الحقوق (0) والترخيص (13، 14)، ونذكر الأصل في الوصف (10)
  n = font['name']; full = f'{family} {style}' if style != 'Regular' else family; ps = family.replace(' ', '') + '-' + style
  for rec in list(n.names):
    if rec.nameID in (1, 4, 16, 17, 21, 22) or rec.nameID == 3 or rec.nameID == 6: n.removeNames(nameID=rec.nameID)
  for pid, eid, lid in ((3, 1, 0x409), (1, 0, 0)):
    n.setName(family, 1, pid, eid, lid); n.setName(style, 2, pid, eid, lid); n.setName(f'{ps};waha-subset', 3, pid, eid, lid)
    n.setName(full, 4, pid, eid, lid); n.setName(ps, 6, pid, eid, lid)
    n.setName('Subset of Scheherazade New by SIL Global (Arabic and Latin basics only), renamed under OFL 1.1 section 3 for embedding in the Waha Math app.', 10, pid, eid, lid)

def covered(font):
  cmap = font.getBestCmap(); return [c for c in WANT if c in cmap]

def ranges(cps):
  out = []; 
  for c in cps:
    if out and out[-1][1] == c - 1: out[-1][1] = c
    else: out.append([c, c])
  return out

os.makedirs(OUT, exist_ok=True); manifest = []
for f in FACES:
  font = TTFont(os.path.join(OFL, f['src']))
  opts = subset.Options(); opts.layout_features = ['*']; opts.name_IDs = ['*']; opts.name_languages = ['*']; opts.notdef_outline = True
  opts.glyph_names = False; opts.hinting = False; opts.flavor = 'woff'; opts.drop_tables += ['DSIG']
  s = subset.Subsetter(options=opts); s.populate(unicodes=WANT); s.subset(font)
  if f['rename']: rename(font, f['family'], f['style'])
  cps = covered(font); path = os.path.join(OUT, f['file']); font.flavor = 'woff'; font.save(path)
  missing = [c for c in WANT if c not in cps and not (0x200B <= c <= 0x200F or 0x2066 <= c <= 0x2069)]
  manifest.append(dict(family=f['family'], weight=f['weight'], file=f['file'], format='woff', role=f['role'], source='Google Fonts ofl/' + f['src'], license='OFL-1.1',
                       covers=ranges(cps), glyphs=len(font.getGlyphOrder())))
  shutil.copy(os.path.join(OFL, f['lic']), os.path.join(OUT, 'OFL_' + f['src'].split('/')[0] + '.txt'))
  print(f"{f['file']}: {os.path.getsize(path)//1024} KB، {len(font.getGlyphOrder())} حرفاً رسومياً، يغطّي {len(cps)} من {len(WANT)}", ('ناقص: ' + ' '.join('U+%04X' % c for c in missing[:20])) if missing else '')
json.dump(dict(note='يكتبه tools/fonts/make_fonts.py؛ لا يُعدَّل باليد', faces=manifest), open(os.path.join(OUT, 'fonts.json'), 'w'), ensure_ascii=False, indent=1)
