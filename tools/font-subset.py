#!/usr/bin/env python3
"""Rebuild CJK font subsets and unicode-range in src/style.css.

Mechanical path conversion of the previous box-absolute font.py.
Run from anywhere: paths are relative to the repository root (parent of tools/).

Requires: fonttools (pyftsubset), and
  /usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc
"""
import json, os, re, subprocess, sys

ROOT = os.path.abspath(os.environ.get('SITE_ROOT') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
SRC_CSS = os.path.join(ROOT, 'src', 'style.css')
FONT = os.environ.get('NOTO_TTC', '/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc')

t = open(os.path.join(ROOT, 'index.html')).read()
for f in ['data/trips-extra.json', 'public/data/trips.json', 'public/data/places.json']:
    fp = os.path.join(ROOT, f)
    if os.path.isfile(fp):
        t += open(fp).read()
    else:
        print('skip missing', f, file=sys.stderr)

# city-map labels must be in the subset even when they are not in published day copy
t += '狎鸥亭圣水光化门西村三清林荫道汝矣岛弘大延南仁川机场岛山明洞景福宫南山塔仁寺洞广藏市场汉江'

# only published (non-draft) day copy is rendered; do not pull in hidden draft itineraries
_st_path = os.path.join(ROOT, 'data', 'trips-story.json')
if os.path.isfile(_st_path):
    _st = json.load(open(_st_path))
    for _s in _st.get('trips') or []:
        for _d in (_s.get('days') or _s.get('itinerary') or []):
            if _d.get('draft'):
                continue
            t += (_d.get('title') or '') + (_d.get('text') or _d.get('note') or '') + (_d.get('stay') or '') + (_d.get('city') or '')

P = set('，。、；：？！“”‘’《》（）—…·「」『』')
core = set(ch for ch in t if ord(ch) > 0x2e80) | P
m = ''
for f in ['public/v9/detail-countries.topo.json', 'public/v9/world.topo.json']:
    d = json.load(open(os.path.join(ROOT, f)))
    for v in d['objects'].values():
        m += ''.join(g.get('properties', {}).get('name', '') for g in v['geometries'])
m += ''.join(f['properties']['name'] for f in json.load(open(os.path.join(ROOT, 'public/data/china-provinces.json')))['features'])
ext = set(ch for ch in m if ord(ch) > 0x2e80) - core
LAT = ' abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,-:/°%'
out_dir = os.path.join(ROOT, 'public', 'v9', 'fonts')
os.makedirs(out_dir, exist_ok=True)
for n, s in (('core', ''.join(sorted(core)) + LAT), ('ext', ''.join(sorted(ext)))):
    open('/tmp/%s.txt' % n, 'w').write(s)
    out = os.path.join(out_dir, 'serif-sc%s.woff2' % ('' if n == 'core' else '-ext'))
    subprocess.check_call([
        'pyftsubset', FONT, '--font-number=2', '--text-file=/tmp/%s.txt' % n,
        '--flavor=woff2', '--layout-features=palt', '--no-hinting', '--name-IDs=',
        '--output-file=' + out,
    ])

def rng(s):
    cps = sorted(set(ord(c) for c in s if c.strip()))
    out = []
    i = 0
    while i < len(cps):
        j = i
        while j + 1 < len(cps) and cps[j + 1] == cps[j] + 1:
            j += 1
        out.append('U+%X' % cps[i] if i == j else 'U+%X-%X' % (cps[i], cps[j]))
        i = j + 1
    return ','.join(out)

s = open(SRC_CSS).read()
s = re.sub(
    r"(serif-sc\.woff2'\) format\('woff2'\);font-weight:400 600;font-display:swap;unicode-range:)[^}]*",
    lambda m: m.group(1) + rng(''.join(sorted(core)) + LAT),
    s,
)
s = re.sub(
    r"(serif-sc-ext\.woff2'\) format\('woff2'\);font-weight:400 600;font-display:swap;unicode-range:)[^}]*",
    lambda m: m.group(1) + rng(''.join(ext)),
    s,
)
open(SRC_CSS, 'w').write(s)
print(len(core), len(ext))
print('updated', SRC_CSS)
