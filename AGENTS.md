# 旅行日志（our-footprints）— 接手须知

嘉怡和政兴的公开旅行日志。静态单页，GitHub Pages。

- 仓库：https://github.com/jayzneray/our-footprints
- 正式站：https://jayzneray.github.io/our-footprints/
- 正式首页对应提交：`3063b8a315ac4ccfe09b3402a8b9f2e48c774d23`
- 正式 `index.html` sha256：`259e127bc1bfa6103d2d3923b0df4c615a73b9b1d6ac098c245007162d72ec77`

更完整的路径、数据位置和已测/未测见 [HANDOFF.md](HANDOFF.md)。

## 源码与生成物

可编辑源码是 `src/`，**不是** 根目录 `index.html`。

| 路径（仓库相对） | 角色 |
|---|---|
| `src/app1.js` … `src/app5.js`、`src/style.css`、`src/body.html` | 唯一 UI 源码（对应上述正式 index） |
| `build.py` | 唯一构建入口，把源码和已批准短文案打进 `index.html` |
| `index.html` | **生成物**。改完源码后重新 build，不要手改这份大文件 |
| `public/data/trips.json`、`public/data/places.json` | 运行时行程 / 地点 / 照片索引 |
| `data/trips-story.json` | 运行时加载的行程正文、路线、按天日记 |
| `data/trips-brief.kimi.json` | 已批准首页短句，build 时写入 JS 里的 `BRIEF` |
| `public/photos/`、`public/v9/`、`public/lib/`、`public/fonts/` | 已公开的照片、地图、库、字体 |
| `preview/` | 旧预览快照，不是正式站，不要当源码改 |

已废弃：`real_v92.py`（以及各种一次性 `photos_v92*.py`）。不要运行，也不要再从它们生成数据。

## 日常怎么改

在仓库根目录：

```bash
python3 build.py
node tools/serve.js          # 默认 http://127.0.0.1:8809/ ，站点根即本仓库。这是 Node 脚本，不要用 python3 跑。
```

改界面或样式：编辑 `src/`，再 `python3 build.py`。
改行程结构、国家、照片归属：编辑 `public/data/trips.json`、`public/data/places.json`（必要时改 `data/trips-story.json` 的已发布字段）。
改首页一句话 / 已批准标题：编辑 `data/trips-brief.kimi.json` 再 build。威尔士 `2025-wales` 的 `line` 必须整句保留，build 不会裁切这一条。
照片目录和 webp 变体已在 `public/photos/`，不要把私人原图提交进仓库，也不要把原图发给模型。

可选环境变量：`USE_BRIEF=0` 不打入短句；`USE_CAPTIONS=1` 会打入字幕草稿——**默认不要开**，未批准文案不得上线。`SITE_ROOT`、`OUT` 仅在源码目录与站点目录暂时分开时使用。

新增中文如果出现缺字，才需要可选脚本 `python3 tools/font-subset.py`（依赖 fonttools / 本机 Noto Serif CJK，会改 `src/style.css` 的 unicode-range 并重写 `public/v9/fonts/serif-sc*.woff2`），然后再 build。没有缺字就不要重跑字体。仓库里旧的 `tools/build-font-subset.py` 输出的是另一套 `public/fonts/noto-serif-sc-500-subset.woff`，当前页面不用它。

## 硬约束（不要“顺便改掉”）

- **人物只有三句文案**：`嘉怡一个人` / `兴兴一个人` / `兴兴嘉怡一起`。`trips.json` 的 `who` 字段（`jy` `zx` `tg` `sis` `fam` `friend` `mom` `zxbiz` `zxwork`）只映射到这三句，不要新增第四种说法。
- **首页行程倒序**：先按 `start` 从新到旧，最后才是 `uk-years`、`china-diary`。
- **转机不算游览**：`legs` 里的出发 / 中转 / 到达 / 回家只画在地图上，不计入 `cityCount`、不当成游览城市。莫斯科、雅加达保持现有去程/回程标注，不要改成“返程游览”或去掉中转。
- **国家用完整轮廓**：详情页 / 国家页用 `public/v9/detail-hi.topo.json`，不要改回过度简化的层。
- **伊比利亚 `2024-iberia-may`**：26 张图，巴塞罗那 7、托萨德马尔 7、里斯本 12；目录是 `iberia-t56-barcelona` / `iberia-t56-tossa` / `iberia-t56-lisbon`。旧目录 `iberia24` 即使还在 `public/photos/` 里也已不再引用，不要用回去。
- **首尔**：清楚地点标记 + 真实汉江 / OSM；不要画回密集路网线团。机场独立展示，真实航班腿保留。仁川机场不算市内游览点。
- **阿加迪尔转折段**原文必须是：`2024 年 12 月 22 日，我们的第一次出行。`（在 `src/app3.js`，不是 brief 里那句）。
- `data/trips-story.json` 里 `draft: true` 的日子不要展示（详情页已过滤）。不要把字幕/故事草稿打进正式 build。
- 竖图封面不要强裁成横幅（`trip.pt`、`.cover.split`）。苏格兰两张首页卡（`2024-scotland-dec-zx`、`2024-highlands-zx`）是「标题和照片在上、宽地图在下」，照片不是窄条。改这两卡或通用 `.trip.pt.l-b` 时先看 `HANDOFF.md` 里的 CSS 特异性说明，否则地图会再次变成 0 高。

## 先不要做的事

- 不要只改生成后的 `index.html` 就当交稿。
- 不要重构站点、不要扩大功能范围，除非用户明确要求。
- 不要把 `preview/` 和正式根目录搞混。
- 不要提交私人原片、凭证、缓存、QA 截图包。
