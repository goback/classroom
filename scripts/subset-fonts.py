#!/usr/bin/env python3
"""Build small local web fonts from the app's licensed Pretendard sources.
Requires fonttools and brotli. Usage: python3 scripts/subset-fonts.py APP_FONT_DIR
"""
import shutil
import sys
from pathlib import Path
from fontTools import subset

root = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1])
output = root / 'fonts'
output.mkdir(exist_ok=True)
text = ''.join((root / name).read_text() for name in ['index.html', 'page.mjs'])
text += ''.join(chr(code) for code in range(32, 127))
for weight in ['Regular', 'SemiBold', 'Bold']:
    options = subset.Options()
    options.flavor = 'woff2'
    font = subset.load_font(str(source / f'Pretendard-{weight}.otf'), options)
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(text=text)
    subsetter.subset(font)
    destination = output / f'Pretendard-{weight}.woff2'
    subset.save_font(font, str(destination), options)
    print(f'{destination.name}: {destination.stat().st_size} bytes')
shutil.copyfile(source / 'OFL.txt', output / 'OFL.txt')
