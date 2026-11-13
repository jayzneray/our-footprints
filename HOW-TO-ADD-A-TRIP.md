# 怎么加一段新旅行（大约 5 分钟）

网站的内容全部来自两个文件，页面会自己从里面生成，不用改 `index.html`：

- `public/data/places.json`：地点（一个城市或一个地方），包括坐标和照片。
- `public/data/trips.json`：旅行（一段行程），引用上面的地点。

## 第 1 步：放照片

1. 新建文件夹 `public/photos/<地点id>/`，地点 id 用小写英文和连字符，例如 `kyoto`、`fuzhou-jx`。
2. 照片命名为 `01.webp`、`02.webp`……（长边不超过 2000 像素），每张配一张缩略图 `01-thumb.webp`、`02-thumb.webp`……（长边 480 像素，保持原比例，不要裁成方形）。
3. 不想手动转换：把原图（jpg/png）放进一个文件夹，在 `build_photos.py` 顶部的 `PLACES` 列表里加一行，改好 `SRC` 路径，然后运行：

   ```bash
   python3 build_photos.py
   ```

   它会生成上面的大图和缩略图，并重写 `places.json`。注意它会按 `PLACES` 列表重建整个 `places.json`，如果你手动给地点加过 `memory`、`date`，或给照片加过 `focusY`、`titleBelow`、`visit`，运行后要补回去；只加一两个地点时，手动转换图片、手写 JSON 更稳妥。

## 第 2 步：在 places.json 里加地点

在 `"places": [ ... ]` 里加一项（逗号别漏）：

```json
{
  "id": "kyoto",
  "name": "京都",
  "country": "日本",
  "scope": "world",
  "lat": 35.0116,
  "lng": 135.7681,
  "cover": "photos/kyoto/01-thumb.webp",
  "photos": [
    { "src": "photos/kyoto/01.webp", "thumb": "photos/kyoto/01-thumb.webp", "w": 1500, "h": 2000 },
    { "src": "photos/kyoto/02.webp", "thumb": "photos/kyoto/02-thumb.webp", "w": 2000, "h": 1500 }
  ],
  "date": null,
  "memory": ""
}
```

- `country` 用中文国名，要和 `world-countries.json` 里的名字一致（例如「英国」「意大利」「日本」），这样地图上那个国家才会点亮。
- 国内的地点写 `"scope": "china"`，再加一个 `"province": "山东"`（省名不带「省」字）。
- `w`、`h` 是大图的宽高（像素），用来按原比例排版，不知道时可以省略，页面按 4:5 处理。
- 每段旅行日记顶部的大封面默认用这段旅行第一个地点的第一张照片，会裁成横幅（桌面高度为屏幕的 52%）。想换一张，就在 `trips.json` 这段旅行里加 `"cover": "photos/morocco/07.webp"`（填那张照片的 `src`）。尽量选人在画面中间偏右、四周有景的照片。
- `"focusY"`（0 表示保留顶部，1 表示保留底部，默认 0.3）只用来决定封面裁哪一段，不要为了躲标题去调它。
- 标题区是封面底部 120px。如果这一条会压到脸、手或身体，给那张照片加 `"titleBelow": true`，标题会移到封面下面左对齐，不再叠在图上。
- 像「爱丁堡，一去再去」这种有多次 `visits` 的旅行，只有照片本身带拍摄日期时才给它加 `"visit": 1`（第几次，从 1 开始）。没有拍摄日期的照片只出现在「全部」里，不要先猜是哪一次。加了之后，行程里那一次会变成可点的一行，点了只看那次的照片，再点一次或点「全部」恢复。没有照片标记的那一次只显示日期和备注，不能点。
- 坐标可以在地图软件里右键复制（纬度在前）。

## 第 3 步：在 trips.json 里加旅行

在 `"trips": [ ... ]` 里加一项：

```json
{
  "id": "2026-kyoto-autumn",
  "title": "京都的秋天",
  "start": "2026-11-01",
  "end": "2026-11-06",
  "nights": 5,
  "countries": ["日本"],
  "places": ["kyoto", "osaka"],
  "kind": "trip",
  "year": 2026,
  "memory": "（可选）一两句回忆。",
  "stops": [
    { "place": "osaka", "start": "2026-11-01", "end": "2026-11-02",
      "transport": { "mode": "flight", "note": "上海 → 大阪" } },
    { "place": "kyoto", "start": "2026-11-02", "end": "2026-11-06",
      "note": "（可选）这一站的小记。",
      "transport": { "mode": "train", "note": "JR 新快速" } }
  ]
}
```

字段说明：

| 字段 | 必填 | 说明 |
|---|---|---|
| `id` | 是 | 唯一，英文小写，建议「年份-地点」 |
| `title` | 是 | 显示的标题 |
| `start` / `end` | 建议 | `YYYY-MM-DD`；长期的可以只写年份 `"2024"` |
| `nights` | 否 | 几晚 |
| `countries` | 是 | 中文国名数组，决定地图点亮哪些国家 |
| `places` | 否 | 地点 id 数组，决定显示哪些照片；没照片可以写 `[]` |
| `kind` | 是 | `trip` 普通旅行；`long` 长期居住；`collection` 合集（不按日期） |
| `year` | 普通旅行必填 | 决定放在哪个年份分组；`long` 和 `collection` 写 `null` |
| `memory` | 否 | 回忆文字 |
| `stops` | 否 | 按顺序的行程站。不写时按 `places` 的顺序当作行程 |
| `stops[].transport` | 否 | 怎么到达这一站：`mode` 可选 `flight` 飞机、`train` 火车、`car` 自驾、`bus` 巴士、`ferry` 渡轮、`walk` 步行；`note` 可选。没写就不显示交通 |
| `stops[].note` | 否 | 这一站的小记 |
| `visits` | 否 | 同一个地方去了多次时用：`[{ "start": "...", "end": "...", "note": "..." }]` |
| `subtitle` | 否 | 长期条目的副标题，比如「去了 4 次」 |

没写的可选字段页面会自动跳过，不会显示空白或「undefined」。天数、地方数、大约公里数（按各站坐标直线距离相加）都由页面自动算。

## 第 4 步：补字体（有新汉字时）

标题用的宋体是精简过的字体子集，新地名、新标题里如果有没用过的字，会显示成系统字体。运行一次：

```bash
python3 tools/build-font-subset.py --source /tmp/nss.ttf
```

`/tmp/nss.ttf` 不在的话，按 `tools/README.md` 下载 Noto Serif SC 源字体，把 `--source` 换成下载的文件路径。

## 第 5 步：本地预览

在 `travel-site` 目录下运行：

```bash
python3 -m http.server 8799
```

浏览器打开 <http://localhost:8799/>，检查：

- 左边「旅行」里出现了新卡片，年份对不对；
- 点开后右边地图缩放到那个国家，城市和路线对不对；
- 「地点」「相册」里能看到新照片，竖图没有被裁掉。

检查 JSON 有没有写错（多逗号、少引号），可以运行：

```bash
python3 -c "import json;json.load(open('public/data/trips.json'));json.load(open('public/data/places.json'));print('OK')"
```

确认没问题后再提交和发布。
