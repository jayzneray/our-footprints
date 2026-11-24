# tools

## build-font-subset.py：重新生成中文字体子集

页面标题和地名用的字体 `TravelSerif` 是 Noto Serif SC 的子集（字重 500），只包含网站实际用到的字，
文件在 `public/fonts/noto-serif-sc-500-subset.woff`。改了 `places.json`、`trips.json` 或页面文案后，新字可能缺字，跑一次脚本即可。

1. 安装依赖：`pip install fonttools`
2. 下载源字体（只需一次，SIL Open Font License 1.1）：
   `curl -L -o /tmp/NotoSerifSC.ttf "https://github.com/google/fonts/raw/main/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf"`
3. 在 `travel-site` 目录下运行：
   `python3 tools/build-font-subset.py --source /tmp/NotoSerifSC.ttf`

脚本会打印收集到的字数、输出文件大小，以及源字体里没有的字符（一般是 emoji，这些由系统字体显示）。
可选参数：`--weight 600` 换字重，`--out 路径` 改输出位置。

## serve.js：本地预览

这是 Node 脚本，不是 Python。在仓库根目录运行：

```bash
node tools/serve.js
```

默认 http://127.0.0.1:8809/ ，站点根为仓库根。可用环境变量 `PORT`、`ROOT` 或 `SITE_ROOT` 覆盖。不要用 `python3 tools/serve.js`。

## font-subset.py：当前页面用的思源宋体子集（可选）

当前站点实际使用的是 `public/v9/fonts/serif-sc.woff2` 与 `serif-sc-ext.woff2`，unicode-range 写在 `src/style.css`。只有新增中文出现缺字时才需要运行。没有缺字就不要重跑。

依赖：`fonttools`（`pyftsubset`），以及本机 Noto Serif CJK（默认 `/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc`，可用环境变量 `NOTO_TTC` 覆盖）。

```bash
python3 tools/font-subset.py
```

会改 `src/style.css` 并重写上述 woff2。上面的 `build-font-subset.py` 输出的是旧文件 `public/fonts/noto-serif-sc-500-subset.woff`，当前页面不用那一套。
