# travel-site-v6 (preview build, not published)

- `index.html`: single-file site (hash routes `#/`, `#/china`, `#/trip/<id>`); only local assets (`public/lib/d3.min.js`, fonts, photos, data).
- Story data: `data/trips-story.json` (written by Kimi Bot). Optional. Without it, trips show photos only. Supported shapes per trip: `route|cities` stops `{city,lat,lng,days:[..],arrive_by|transport,note}`, `days|itinerary` `{day,date,city,title,text|note,weather,stay,photos?}`, `moments` `{city,lat,lng,season,text}` (uk-years), `visits[].text` (edinburgh, matched by `start`; no photos are attached to visits). `draft` flags are ignored in the UI.
- Day photos: `day.photos` if given, else that city's place photos split across its days, else round-robin. Each photo appears exactly once.
- Music: `public/audio/manifest.json` → `bgm-main.mp3` (public domain, see docs/CREDITS.md). preload none; loads on first toggle press; 2s fade-in to 0.25 (0.16 in trip detail); pauses when the tab is hidden.
- Test hook: `?story=<path>` overrides the story file.
- Local preview: `cd /workspace/travel-site-v6 && python3 -m http.server 8806`.
