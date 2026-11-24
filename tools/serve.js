// Static server for local preview. Gzip text like GitHub Pages. Cache-Control: no-store.
// ROOT defaults to the repository root (parent of tools/). Override with ROOT=... or SITE_ROOT=...
const http = require('http'), fs = require('fs'), path = require('path'), zlib = require('zlib');
const ROOT = path.resolve(process.env.ROOT || process.env.SITE_ROOT || path.join(__dirname, '..'));
const PORT = +process.env.PORT || 8809;
const T = {'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2','.woff':'font/woff','.mp3':'audio/mpeg','.md':'text/plain; charset=utf-8'};
http.createServer((q, r) => {
  let u = decodeURIComponent(q.url.split('?')[0]);
  u = u.replace(/^\/__qa\/[A-Za-z0-9_-]+(?=\/)/, '');
  if (u.endsWith('/')) u += 'index.html';
  const f = path.join(ROOT, path.normalize(u));
  if (!f.startsWith(ROOT)) { r.writeHead(403); return r.end(); }
  fs.stat(f, (e, st) => {
    if (e || !st.isFile()) { r.writeHead(404, {'content-type':'text/html'}); return r.end('404'); }
    const ext = path.extname(f), ty = T[ext] || 'application/octet-stream';
    const gz = /html|javascript|css|json|svg|plain/.test(ty) && /gzip/.test(q.headers['accept-encoding'] || '');
    const h = {'content-type': ty, 'cache-control': 'no-store, no-cache, must-revalidate', 'pragma': 'no-cache', 'expires': '0'};
    if (ext === '.mp3' && q.headers.range) {
      const m = /bytes=(\d*)-(\d*)/.exec(q.headers.range);
      const s = +m[1] || 0, e2 = m[2] ? +m[2] : st.size - 1;
      h['content-range'] = `bytes ${s}-${e2}/${st.size}`;
      h['accept-ranges'] = 'bytes';
      h['content-length'] = e2 - s + 1;
      r.writeHead(206, h);
      return fs.createReadStream(f, {start: s, end: e2}).pipe(r);
    }
    if (gz) {
      h['content-encoding'] = 'gzip';
      r.writeHead(200, h);
      fs.createReadStream(f).pipe(zlib.createGzip({level: 6})).pipe(r);
    } else {
      h['content-length'] = st.size;
      if (ext === '.mp3') h['accept-ranges'] = 'bytes';
      r.writeHead(200, h);
      fs.createReadStream(f).pipe(r);
    }
  });
}).listen(PORT, () => console.log('serving', PORT, 'root', ROOT));
