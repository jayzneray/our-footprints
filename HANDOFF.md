# 旅行日志交接说明

本文件说明如何在本仓库里直接修改旅行日志，而不必手改生成后的 `index.html`，也不依赖某台机器上的绝对路径。

- 仓库：https://github.com/jayzneray/our-footprints
- 正式站：https://jayzneray.github.io/our-footprints/
- 当前正式首页提交：`3063b8a315ac4ccfe09b3402a8b9f2e48c774d23`（2026-11-24 约 11:25 Asia/Shanghai 上线）
- 正式 `index.html` sha256：`259e127bc1bfa6103d2d3923b0df4c615a73b9b1d6ac098c245007162d72ec77`（221593 字节）

规则摘要见 [AGENTS.md](AGENTS.md)。

## 1. 已测与未测

已测：

- 桌面键盘：进入首页首卡 → 返回 → 再进入；灯箱开关与左右键。
- 桌面视觉复验（即正式 259e127）：「去见她之前」地图在 1320×743 已画出国家轮廓、格拉斯哥—爱丁堡路线和地名；双列大照片；高地行程 7 段路线正常。
- 正式 Pages 已 success；2026-11-24 11:28（Asia/Shanghai）线上浏览器抽检通过，26 张主图 HTTP 200。

未测：

- **390 宽手机视口因当时工具限制未验**，不能标通过。此前有过「手机上首尔预览图 OSM 署名疑似贴边」的怀疑，同样未确认。

## 2. 仓库里什么是源码、什么是生成物

所有日常路径都是**仓库相对路径**。克隆后在仓库根目录操作即可。

```
our-footprints/                 ← 仓库根 = 站点根（GitHub Pages）
  AGENTS.md
  HANDOFF.md
  build.py                      ← 相对路径构建，不依赖本机绝对路径
  src/
    app1.js  app2.js  app3.js  app4.js  app5.js
    style.css  body.html        ← 与正式 index 259e127 对应的可编辑源码
  index.html                    ← 生成物（正式首页）。改 src 后再 build，不要手改
  data/
    trips-brief.kimi.json       ← 已批准首页短句，build 时写入 BRIEF
    trips-story.json            ← 运行时 fetch 的行程正文 / 路线 / 按天日记
  public/                       ← 已公开资源：照片、地图、库、字体
    data/trips.json
    data/places.json
    data/world-countries.json
    data/china-provinces.json
    photos/<地点id>/*-{无后缀,480,960,1600}.webp
    v9/world.topo.json
    v9/detail-countries.topo.json
    v9/detail-hi.topo.json
    v9/seoul-osm.geo.json
    v9/fonts/serif-sc.woff2 等
    lib/d3-lite.min.js
    lib/topojson-client.min.js
  tools/
    serve.js                    ← 本地预览（Node）
    font-subset.py              ← 可选，缺字时才用
    build-font-subset.py        ← 旧脚本，当前页面不用它的输出
  preview/                      ← 旧预览，不要当正式源
```

运行时页面里的资源路径也相对站点根，例如 `public/data/trips.json`、`public/photos/...`、`data/trips-story.json`（故事文件在仓库根 `data/`，不在 `public/data/`）。

## 3. 构建、本地预览、发布

在仓库根目录：

```bash
python3 build.py
# 生成 ./index.html
# 默认读取 ./src/ 、 ./data/trips-brief.kimi.json
# 并打开 ./public/data/places.json（当前 build 会读它，但结果不写入 HTML；缺文件会失败）
```

只想核对“源码是否仍能重建正式首页”、又不覆盖根目录 `index.html` 时：

```bash
OUT=/tmp/our-footprints-rebuild-index.html python3 build.py
sha256sum /tmp/our-footprints-rebuild-index.html index.html
# OUT 必须写在命令前面（环境变量）。写在 python3 后面会被当成参数并忽略，还会覆盖根目录 index.html。
# 源码与 brief 未改时，两者都应是
# 259e127bc1bfa6103d2d3923b0df4c615a73b9b1d6ac098c245007162d72ec77
```

可选环境变量：

- `USE_BRIEF=0`：不把短句打进 `BRIEF`。
- `USE_CAPTIONS=1`：把 `data/photo-captions.draft.json` 打进灯箱。默认关闭，未批准不要开。仓库里默认没有这份草稿。
- `SITE_ROOT`：含有 `public/data/places.json` 的站点根。源码目录和站点目录暂时分开时才需要。
- `OUT`：输出 HTML 路径，默认是 `build.py` 所在目录下的 `index.html`。

威尔士 `2025-wales` 的 `line` 按批准原文整句写入，不会被 20 字裁切；其他过长的 `line` 会在逗号/句号处裁切（构建时会打印 `clipped`）。

本地预览（`tools/serve.js` 是 Node 脚本，不是 Python）：

```bash
node tools/serve.js
# http://127.0.0.1:8809/
# 默认站点根 = tools/ 的上一级（仓库根）。可用 PORT、ROOT 或 SITE_ROOT 覆盖。
# 文本会 gzip，Cache-Control: no-store，避免改完还看到旧页。
```

不要用 `file://` 打开：页面要 fetch JSON。不要用 `python3 tools/serve.js`。

发布：静态文件，GitHub Pages 发布仓库根目录。正式根首页是 `index.html`；`preview/` 是另一份旧预览，不要和正式站搞混。

改完源码后的典型顺序：`python3 build.py` → 本地 `node tools/serve.js` 做桌面（和手机，若你能测）检查 → 再提交 `src/` 与新的 `index.html`（以及你确实改过的 `public/data` 或照片）。

## 4. 模块职责

`build.py` 按顺序拼接 `app1.js` … `app5.js`（每个文件后面加一个换行），再和 `style.css`、`body.html` 打进单文件 HTML。它们共享一个 IIFE 作用域，函数名会互相调用。

| 文件 | 职责 |
|---|---|
| `src/body.html` | 壳：顶栏、目录、`<main id="view">`、灯箱 DOM、音乐按钮 |
| `src/style.css` | 全部样式。苏格兰首页卡例外规则在文件末尾 |
| `src/app1.js` | 工具函数、人物映射、封面 `LEAD`/`SECOND`、照片国家/地点覆盖、数据合并 `build()`、首页倒序 `SEQ`、首尔 POI、统计 |
| `src/app2.js` | 平面地图引擎 `FlatMap`（国家轮廓、路线、点、标签） |
| `src/app3.js` | 首页：年份章节、行程卡、足迹总览、阿加迪尔转折段、国家列表；照片 `srcset`（长边 480/960/1600）；`legRoutes` / `legStops`（转机画在图上但不算城） |
| `src/app4.js` | 行程详情、按天照片、详情地图、首尔 OSM 与转机说明、灯箱缩略图接线 |
| `src/app5.js` | 路由（`#/`、`#/trip/<id>`、`#/country/<国>`、首页锚点）、灯箱、背景音乐、键盘、启动时加载 JSON |

启动加载（见 `app5.js`）：

- `public/data/trips.json`
- `public/data/places.json`
- `data/trips-story.json`（可用 `?story=` 覆盖；失败则当空故事）
- `public/v9/world.topo.json`

行程记录由 `trips.json` 的骨架 + `trips-story.json` 的路线/按天正文 + build 打入的 `BRIEF` 合并而成。照片列表来自 `trips.json` 的 `places` 去 `places.json` 取图，并加上 `public/` 前缀。

## 5. 数据与照片约定

- **人物三值**：展示文案只有「嘉怡一个人 / 兴兴一个人 / 兴兴嘉怡一起」。映射在 `src/app1.js` 的 `WHO` 与 `lineCls`。
- **26 段行程**，首页倒序（`start` 新→旧），`uk-years` 与 `china`（运行时 id 为 `china-diary`）放在最后。
- **伊比利亚 `2024-iberia-may`**：地点 `iberia-t56-barcelona`（西班牙，7）、`iberia-t56-tossa`（西班牙·托萨德马尔，7）、`iberia-t56-lisbon`（葡萄牙，12）。按本人文件夹顺序，不要猜城市。旧 `iberia24` 活动引用应为 0。
- **转机 / 中转**：写在 `trips.json` 的 `legs`。角色为出发、中转、到达、回家等。只用于画去程回程虚线，不计入游览城市。莫斯科、雅加达保持这一结构。首尔的仁川机场是独立腿，不算市内点。
- **封面键**：`LEAD` / `SECOND` 在 `app1.js`，值为 `目录/编号`（无 `.webp`），例如伊比利亚主图 `iberia-t56-lisbon/01`。
- 混合相册目录 `thailand`、`malaysia`、`honeymoon` 的国家/地点以 `PHOTO_META` 为准，不要只看文件夹名。
- 故事里 `draft: true` 的日子不渲染。缺字重建字体时也不应收录这些草稿。
- `places.json` 里的 `src` 形如 `photos/<id>/01.webp`，页面会再加 `public/`。变体是同目录下按长边 480/960/1600 的文件，逻辑在 `app3.js`。

## 6. CSS：不要再踩的坑（短记）

苏格兰两张首页卡（`2024-scotland-dec-zx`「去见她之前」、`2024-highlands-zx`）要「标题+大照片在上、宽地图在下」，照片不能是约 120px 的窄条。

通用规则 `.trip.pt.l-b .vis { grid-column: ... }` 特异性是 (0,4,0)。只写 `.trip[data-id="…"] .vis { grid-area: vis }` 打不过它，「去见她之前」是竖图 + `l-b`，地图曾被挤到卡片右侧，高度变成 0。现有修补是：

```css
.trip.pt.l-b[data-id="2024-scotland-dec-zx"] .info,
.trip.pt.l-b[data-id="2024-scotland-dec-zx"] .vis {
  grid-area: /* info 或 vis */;
  grid-column: 1 / -1;
}
```

高地卡是 `l-d`，本来就赢了，不必把那组选择器“合并简化”掉。以后加行程专属排版，先对比 `.trip.pt.l-a` / `.trip.pt.l-b` 的特异性。

竖图封面用 `trip.pt` 和详情 `.cover.split`：桌面左右分栏，不要把竖图裁成横幅。
