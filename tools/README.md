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
