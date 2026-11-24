#!/usr/bin/env python3
"""Bake src/ + approved briefs into a single index.html.

Paths are relative to this file (the repository root once integrated).
They do not depend on /workspace/v9-scratch.

Optional env:
  SITE_ROOT  Directory that contains public/data/places.json.
             Defaults to the directory of this script (repo root).
  OUT        Output HTML path. Defaults to <script dir>/index.html.
  USE_BRIEF  Default 1: bake data/trips-brief.kimi.json. Set 0 to leave BRIEF=null.
  USE_CAPTIONS  Default off. Do not enable unless captions are approved.
                Looks for data/photo-captions.draft.json next to this script.
"""
import os, json

ROOT = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.abspath(os.environ.get('SITE_ROOT', ROOT))
S = os.path.join(ROOT, 'src') + os.sep
OUT = os.environ.get('OUT', os.path.join(ROOT, 'index.html'))

css = open(S + 'style.css').read()
js = ''.join(open(S + f).read() + '\n' for f in ['app1.js', 'app2.js', 'app3.js', 'app4.js', 'app5.js'])

# v9.2f: the approved copy (data/trips-brief.kimi.json) is on by default. USE_BRIEF=0 builds with the old summaries.
def _clip(t, n=20):
    t = str(t).strip()
    if len(t) <= n:
        return t
    cut = max(t.rfind(c, 0, n + 1) for c in '，、。；')
    return t[:cut] if cut >= 6 else t[:n]

if os.environ.get('USE_BRIEF', '1') != '0':
    _b = json.load(open(os.path.join(ROOT, 'data', 'trips-brief.kimi.json')))
    _m = {}
    for e in _b['trips']:
        r = {}
        if e.get('line'):
            r['line'] = str(e['line']).strip() if e['id'] in ('2025-wales',) else _clip(e['line'])  # 2025-wales: approved word for word, never clipped
        if e.get('title'):
            r['title'] = str(e['title']).strip()
        if r:
            _m[e['id']] = r
        if e.get('line') and r.get('line') != str(e['line']).strip():
            print('clipped', e['id'], '->', r['line'])
    assert 'BRIEF=null,' in js
    js = js.replace('BRIEF=null,', 'BRIEF=' + json.dumps(_m, ensure_ascii=False) + ',', 1)
    print('brief on:', len(_m), 'trips')

# photo captions are drafts until approved: USE_CAPTIONS=1 python3 build.py bakes data/photo-captions.draft.json into the lightbox line. Off by default.
if os.environ.get('USE_CAPTIONS') == '1':
    _c = {k: v['caption'] for k, v in json.load(open(os.path.join(ROOT, 'data', 'photo-captions.draft.json')))['captions'].items()}
    assert 'CAPS=null,' in js
    js = js.replace('CAPS=null,', 'CAPS=' + json.dumps(_c, ensure_ascii=False) + ',', 1)
    print('captions on:', len(_c))

body = open(S + 'body.html').read()
_pl = json.load(open(os.path.join(SITE, 'public', 'data', 'places.json')))
preload = ''  # v9.2c: the first screen is a wall of small tiles + the globe; no single hero image to preload
html = f'''<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>旅行日志</title>
<meta name="description" content="兴兴嘉怡一起的旅行日志：走过的城市和路线。">
<meta name="theme-color" content="#12100E">
<meta property="og:title" content="旅行日志">
<meta property="og:description" content="Somewhere between here and everywhere.">
<meta property="og:image" content="public/og-cover.jpg">
<link rel="icon" href="public/favicon.svg" type="image/svg+xml">
<link rel="icon" href="public/favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="public/apple-touch-icon.png">
{preload}
<link rel="preload" href="public/v9/world.topo.json" as="fetch" crossorigin>
<style>
{css}
</style>
</head>
<body>
{body}
<script src="public/lib/d3-lite.min.js"></script>
<script src="public/lib/topojson-client.min.js"></script>
<script>
{js}
</script>
</body>
</html>
'''
os.makedirs(os.path.dirname(os.path.abspath(OUT)) or '.', exist_ok=True)
open(OUT, 'w').write(html)
print(len(html))
print('wrote', OUT)
