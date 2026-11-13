#!/usr/bin/env python3
"""重新生成页面用的中文衬线字体子集 public/fonts/noto-serif-sc-500-subset.woff

用法（在 travel-site 目录下）：
    python3 tools/build-font-subset.py --source /path/to/NotoSerifSC[wght].ttf

依赖：pip install fonttools
源字体：Noto Serif SC 可变字体（SIL Open Font License 1.1），下载地址
    https://github.com/google/fonts/raw/main/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf

脚本会收集 public/data/places.json、public/data/trips.json 里所有字符串用到的字，
再加上 index.html 里的全部文字（页面固定文案）和基本 ASCII，
把可变字体固定在字重 500，只保留这些字，输出 woff。
每次改了地点、旅行或页面文案后跑一次即可。
"""
import argparse, json, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA_FILES = [ROOT / 'public/data/places.json', ROOT / 'public/data/trips.json']
PAGE_FILES = [ROOT / 'index.html']
OUT = ROOT / 'public/fonts/noto-serif-sc-500-subset.woff'

def strings_in(obj):
    if isinstance(obj, str):
        yield obj
    elif isinstance(obj, dict):
        for k, v in obj.items():
            yield k
            yield from strings_in(v)
    elif isinstance(obj, list):
        for v in obj:
            yield from strings_in(v)

def collect_chars():
    chars = set(chr(c) for c in range(0x20, 0x7F))  # 基本 ASCII
    chars |= set('，。、：；！？「」『』（）《》—…·・')   # 常用中文标点
    for f in DATA_FILES:
        for s in strings_in(json.loads(f.read_text(encoding='utf-8'))):
            chars |= set(s)
    for f in PAGE_FILES:
        chars |= set(f.read_text(encoding='utf-8'))
    return {c for c in chars if c.isprintable()}

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--source', required=True, help='NotoSerifSC[wght].ttf 的路径')
    ap.add_argument('--weight', type=float, default=500, help='固定字重，默认 500')
    ap.add_argument('--out', default=str(OUT), help='输出路径，默认 public/fonts/noto-serif-sc-500-subset.woff')
    a = ap.parse_args()
    try:
        from fontTools.ttLib import TTFont
        from fontTools.varLib import instancer
        from fontTools import subset
    except ImportError:
        sys.exit('缺少 fonttools，请先运行：pip install fonttools')

    chars = collect_chars()
    font = TTFont(a.source)
    if 'fvar' in font:
        font = instancer.instantiateVariableFont(font, {'wght': a.weight})
    opts = subset.Options()
    opts.flavor = 'woff'
    opts.layout_features = ['*']
    opts.name_IDs = ['*']
    opts.notdef_outline = True
    sub = subset.Subsetter(opts)
    sub.populate(text=''.join(sorted(chars)))
    sub.subset(font)
    cmap = font.getBestCmap()
    missing = sorted(c for c in chars if ord(c) > 0x7F and ord(c) not in cmap and not c.isspace())
    out = pathlib.Path(a.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    font.flavor = 'woff'
    font.save(str(out))
    print(f'收集 {len(chars)} 个字符，写入 {out.relative_to(ROOT) if out.is_relative_to(ROOT) else out}（{out.stat().st_size/1024:.1f} KB）')
    if missing:
        print(f'源字体里没有的字（会用系统字体显示，多为 emoji 或特殊符号）：{"".join(missing[:80])}')

if __name__ == '__main__':
    main()
