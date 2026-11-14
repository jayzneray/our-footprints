# travel-site-v9（本地预览版，未发布）

- `index.html`：单文件站点（路由 `#/`、`#/trip/<id>`、`#/trip/<id>/<第几天>`、`#/china`）。源码分块在 `/workspace/v9-scratch/src/`，`python3 /workspace/v9-scratch/build.py` 合成 index.html。
- 数据：`public/data/trips.json`、`places.json`（同 v6）；`data/trips-story.json`（Kimi 的故事数据 + v9 补丁）；`data/trips-extra.json`（每天吃了什么）。
- 新资源：`public/v9/detail-countries.topo.json`（Natural Earth 1:10m 国界，公有领域，裁剪到欧洲/北非与东亚东南亚，TopoJSON 量化，390KB；去过的国家简化容差 0.008°，其余 0.03°；中国轮廓沿用 v6 的 ECharts 版本；生成脚本 docs/clip2.py）、`public/lib/topojson-client.min.js`（ISC），`public/v9/fonts/`（思源宋体 Noto Serif CJK SC 子集、Cormorant Garamond，均为 SIL OFL 1.1）。
- 改了文字后要重新生成字体子集：`bash /workspace/v9-scratch/font.sh`，否则新字会用系统字体显示。
- Kimi 更新 `trips-story.json` 后：先覆盖，再跑 `python3 docs/patch_story_v9.py data/trips-story.json`。
- 本地预览：`cd /workspace/travel-site-v9 && python3 -m http.server 8809`。
