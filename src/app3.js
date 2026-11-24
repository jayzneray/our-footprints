/* ---------- image helper ---------- */
function vsrc(p,w){return p.src.replace(/\.webp$/,'-'+w+'.webp')}
// variants are sized by LONG edge (480/960/1600); the srcset w descriptor is the real pixel width of each file
function vw(p,e){var L=Math.max(p.w||e,p.h||e),s=Math.min(1,e/L);return Math.round((p.w||e)*s)}
function img(p,o){o=o||{};if(!p)return '';var fy=p.fy!=null?p.fy:0.5;
 var ss=[480,960,1600].map(function(e){return vsrc(p,e)+' '+vw(p,e)+'w'}).join(', '),sz=o.sizes||'(max-width:860px) 88vw, 40vw',def=vsrc(p,o.big?1600:960);
 var keyPrefix=(p.key||'').split('/')[0];var isIberia=keyPrefix.indexOf('iberia-t56-')===0;
 var alt=isIberia?(p.place||p.country||''):(MIXED_FOLDERS.indexOf(keyPrefix)>-1)?(p.place||p.country||''):(o.alt||p.place||'');
 return '<div class="ph'+(o.lift?' lift':'')+(o.cls?' '+o.cls:'')+'" style="background-color:'+(p.bg||'#1b1814')+';'+(o.style||'')+'" data-k="'+esc(p.key)+'"'+(o.attrs||'')+'><img alt="'+esc(alt)+'" '+(o.eager?'fetchpriority="high" ':'loading="lazy" ')+'decoding="async"'+(p.w&&p.h?' width="'+p.w+'" height="'+p.h+'"':'')+' src="'+def+'" srcset="'+ss+'" sizes="'+sz+'" style="object-position:50% '+(fy*100).toFixed(0)+'%"></div>'}
document.addEventListener('load',function(e){var t=e.target;if(t&&t.tagName==='IMG')t.classList.add('ld')},true);
function markLoaded(r){$$('img',r).forEach(function(i){if(i.complete&&i.naturalWidth)i.classList.add('ld')})}
function chars(s,d0){return s.split('').map(function(c,i){return '<span style="animation-delay:'+((d0||0.5)+i*0.11).toFixed(2)+'s">'+esc(c)+'</span>'}).join('')}
var ARROW=icon('arrow');

/* ---------- home ---------- */
var OV=[]; // 单元 A：当前总览就是 #globe 首屏本身
// 2025 copy written by Jayzen; used exactly as written
var CHAP_TAG={'2025':'7 段旅行 · 我和你'};
var CHAP={'2024':'巴黎、冰岛、伊比利亚、瑞士、曼谷。十月认识，年底在摩洛哥见面。','2025':'两个人的第一个整年。欧洲走了一大圈，我走过你的路，多了一辆车，一家店，年底爸妈和弟弟来了英国，超级幸福的一年。','2026':'一月首尔。六月出差、蜜月、又出差。八月雅加达。十一月和妈妈再去首尔。'};
var homeMaps=[],ovMap=null,homeIO=[],globeCtl=null,routeGen=0;
function chapCount(list){var c={};list.forEach(function(t){c[t.lc]=(c[t.lc]||0)+1});var s=list.length+' 段旅行';if(c.tg===list.length)s+=' · 兴兴嘉怡一起';return s}
var HERO_TILES=['wales2/04','highlands/04','highlands/02','cornwall-zx/03','vatican/02','cornwall24/01','highlands/06','wales2/03','morocco/07','highlands/05','honeymoon/09','scotland-dec/06'];
function heroImg(p){return img(p,{eager:true,alt:'摩洛哥的海边',sizes:p.h>p.w?'(max-width:860px) 100vw, 56vw':'100vw',big:true})}
function renderHome(view){
 var h='',hero=ALLPH.filter(function(p){return p.key==='morocco/03'})[0]||ALLPH[0];
 var realT=SEQ.filter(function(t){return t.kind==='trip'});
 var y0=realT.reduce(function(m,t){var y=(t.start||'').slice(0,4);return y&&(!m||y<m)?y:m},''),y1=realT.reduce(function(m,t){var y=(t.start||'').slice(0,4);return y&&(!m||y>m)?y:m},'');
 var yr=(y0||'2024')+' — '+(y1||'2026');
 var MOS=HERO_TILES.map(function(k){return ALLPH.filter(function(p){return p.key===k})[0]}).filter(Boolean);
 var nc=isMob()?3:6,cols=[];for(var c=0;c<nc;c++)cols.push(MOS.filter(function(p,k){return k%nc===c}).slice(0,2));
 h+='<section class="hero hero-m" id="globe"><div class="mosaic" aria-hidden="true">'+cols.map(function(col,c){return '<div class="mc mc'+c+'">'+col.map(function(p){return img(p,{eager:true,alt:'',sizes:isMob()?'34vw':'17vw'})}).join('')+'</div>'}).join('')+'</div>'+
  '<div class="hglobe"><div class="gl-canvas" id="gl"></div></div><div class="gscrub" id="gscrub"></div>'+
  '<div class="cap"><div class="eyebrow latin">'+yr+'</div><h1>'+chars('旅行日志',.45)+'</h1><div class="en latin">Somewhere between here and everywhere</div></div>'+
  '<div class="gl-card" id="glcard" aria-live="polite"></div>'+
  '<div class="ghint">拖动地球，点一条线</div><a class="cue" href="#y2026" data-scroll="y2026">往下<i></i></a></section>';
 // chapters
 var real=SEQ.filter(function(t){return t.kind==='trip'}),years={};real.forEach(function(t){(years[t.year]=years[t.year]||[]).push(t)});
 var n=0,lay=['l-a','l-c','l-b','l-d'],li=0,mapFlip=false,metDone=false;
 Object.keys(years).sort().reverse().forEach(function(y){
  h+='<section class="chap'+(y==='2026'?' chap-latest':'')+'" id="y'+y+'"><div class="wrap">'+(y==='2026'?'':'<div class="chap-h"><h2 class="yr latin rv">'+y+'</h2><div class="txt rv d2"><div class="c">'+(CHAP_TAG[y]||chapCount(years[y]))+'</div>'+(CHAP[y]?'<p>'+esc(CHAP[y])+'</p>':'')+'</div></div>');
  var list=years[y].slice().sort(function(a,b){return a.start>b.start?-1:a.start<b.start?1:0}),k=0;
  while(k<list.length){var t=list[k];
   if(t.id==='2024-morocco'){h+='</div></section>'+turnHTML()+'<section class="chap" style="padding-top:0"><div class="wrap">'}
   if(t.start<MET&&(k===0||list[k-1].start>=MET)){h+=metHTML()}
   // group consecutive photo-less trips (except the honeymoon) into a compact grid; do not cross the Agadir turn or the 我们认识了 divider
   var grp=[];while(k<list.length){var g=list[k];if(g.cover||g.id==='2026-sea-honeymoon'||g.id==='2024-morocco')break;if(grp.length&&((grp[0].start>=MET)!==(g.start>=MET)))break;grp.push(g);k++}
   if(grp.length>1){h+='<div class="mini-grid">'+grp.map(function(g){n++;return miniCard(g,n)}).join('')+'</div>';continue}
   if(grp.length===1){k--}
   n++;var L;if(!t.cover){L='l-map'+(mapFlip?' flip':'');mapFlip=!mapFlip}else{L=lay[li%lay.length];li++}
   h+=tripCard(t,n,L);k++}
  h+='</div></section>'});
 h+=againHTML();
 h+=archiveHTML();
 h+='<section class="ending"><div class="rule"></div><h2 class="rv">下一站，未完待续</h2><p class="rv d1">'+yr+'，还在路上</p><button class="rand rv d2" data-rand>'+icon('shuffle')+'随便翻到某一天</button>'+footHTML()+'</section>';
 view.innerHTML=h;markLoaded(view);
 setupHome(view);
}
function metHTML(){return '<div class="met rv" id="met"><span class="ln"></span><span class="tx"><b class="latin">2024.10.13</b>我们认识了</span><span class="ln"></span></div>'}
function cornwallNote(t){return (t.id==='2024-cornwall'&&BYID['2024-cornwall-zx'])?'<div class="note2">同一片海，相隔两周。那时还不认识。</div>':''}
function miniCard(t,n){var cm=companion(t),rt=routeText(t);
 return '<article class="trip l-mini" data-id="'+t.id+'"><a class="vis rv" href="#/trip/'+t.id+'"><div class="maparts" data-map="art" data-id="'+t.id+'"></div><div class="tag">'+engMonth(t)+'</div></a>'+
  '<div class="info rv d1"><div class="no latin">'+p2(n)+'</div><h3><a href="#/trip/'+t.id+'">'+esc(t.title)+'</a></h3>'+
  '<div class="meta"><b>'+fmtRange(t.start,t.end)+'</b> · '+t.dayCount+' 天'+(t.cityCount?' · '+t.cityCount+' 座城':'')+'</div>'+
  (t.summary?'<p class="sum">'+esc(t.summary)+'</p>':'')+
  (rt.length>1?'<div class="rt">'+rt.map(function(c){return '<span>'+esc(c)+'</span>'}).join(t.unordered?'<span class="dotsep"> · </span>':'<span class="ar"></span>')+'</div>':'')+cornwallNote(t)+
  (cm?'<div class="who '+cm.cls+'"><i></i>'+cm.txt+'</div>':'')+'</div></article>'}
function turnHTML(){var p=ALLPH.filter(function(x){return x.key==='morocco/02'})[0];
 return '<section class="turn" id="turn">'+img(p,{alt:'摩洛哥',sizes:'100vw',big:true})+'<div class="t"><div class="k rv">December 2024 · Agadir</div><h2 class="rv d1">阿加迪尔</h2><p class="rv d2">2024 年 12 月 22 日，我们的第一次出行。</p></div></section>'}
function againHTML(){
 var E=BYID['edinburgh-again'],U=BYID['uk-years'],C=BYID['china-diary'];
 function card(href,ph,k,ttl,n,p,ticks,d){return '<a class="ag rv'+(d||'')+'" href="'+href+'">'+img(ph,{alt:ttl,sizes:'(max-width:860px) 88vw, 30vw'})+'<div class="k">'+k+'</div><h4>'+esc(ttl)+'</h4><div class="n">'+n+'</div><p>'+p+'</p>'+(ticks?'<div class="ticks">'+ticks+'</div>':'')+'<div class="go">打开看看'+ARROW+'</div></a>'}
 var h='<section class="again" id="again"><div class="wrap"><div class="sec-k rv">常去的地方 · Again</div><h2 class="sec-t rv d1">有些地方，不止去一次</h2><div class="again-grid">';
 if(E){var vs=E.visits||[];h+=card('#/trip/edinburgh-again',E.cover,'Edinburgh','爱丁堡',vs.length+' 次','陪妹妹，陪爸妈和弟弟；兴兴也自己来过两次。<span class="note2">八月她来，九月他来，那时还不认识。</span>',vs.map(function(v){return '<span class="'+lineCls(v.who)+'">'+v.start.slice(0,7).replace('-','.')+'</span>'}).join(''))}
 if(U)h+=card('#/trip/uk-years',U.cover,'London · Exeter','在英国的日子',(U.moments||[]).length+' 个片段','伦敦和埃克塞特，下课、买菜、赶车的日常。','',' d1');
 if(C)h+=card('#/trip/china-diary',C.cover,'China',esc(C.title),'',esc(C.summary),'',' d2');
 return h+'</div></div></section>'}
/* ---------- countries ---------- */
function countryTilePhoto(g,c){if(c==='泰国')return null;var ph=null;(g.trips||[]).forEach(function(t){if(!ph&&t&&t.cover&&t.cover.country===c)ph=t.cover});if(!ph){var phs=g.ph||[];ph=phs.filter(function(p){return p.country===c&&p.w>p.h})[0]||phs.filter(function(p){return p.country===c})[0]||null}return ph}
function countryIndex(){
 var by={},order=[];function add(c,t){if(!by[c]){by[c]={c:c,ph:[],trips:[],cities:[],years:{}};order.push(c)}var g=by[c];if(t&&g.trips.indexOf(t)<0){g.trips.push(t);var y=(t.start||'').slice(0,4);if(/^\d{4}$/.test(y))g.years[y]=1;if(t.visits)t.visits.forEach(function(v){g.years[v.start.slice(0,4)]=1})}}
 SEQ.forEach(function(t){
  t.stops.forEach(function(s){var c=s.country||(t.id==='china-diary'?'中国':(t.countries.length===1?t.countries[0]:''));if(!c)return;add(c,t);if(by[c].cities.indexOf(s.city)<0)by[c].cities.push(s.city)});
  t.countries.forEach(function(c){add(c,t)});
  t.photos.forEach(function(p){var c=p.country;if(!c)return;add(c,t);if(by[c].ph.indexOf(p)<0)by[c].ph.push(p)})});
 LOOSE.forEach(function(p){var c=p.country;if(!c)return;add(c,null);if(by[c].ph.indexOf(p)<0)by[c].ph.push(p)});
 if(by['中国'])by['中国'].trips=by['中国'].trips.filter(function(t){return t.id!=='china-diary'}).concat(BYID['china-diary']?[BYID['china-diary']]:[]);
 return {by:by,order:order}}
function yearsTxt(g){var y=Object.keys(g.years).sort();if(!y.length)return '';return y.length>2?y[0]+' — '+y[y.length-1]:y.join(' · ')}
function archiveHTML(){var X=countryIndex();
 return '<section class="arch" id="archive"><div class="wrap"><div class="sec-k rv">按国家看 · Countries</div><h2 class="sec-t rv d1">'+X.order.length+' 个国家，'+ALLPH.length+' 张照片</h2><div class="ctiles">'+
  X.order.map(function(c,i){var g=X.by[c],ph=countryTilePhoto(g,c);
   return '<a class="ctile rv'+(i%3?' d'+(i%3):'')+'" href="#/country/'+encodeURIComponent(c)+'">'+(ph?img(ph,{alt:c,sizes:'(max-width:860px) 50vw, 25vw'}):'<div class="ph cmap" data-cmap="'+esc(c)+'"></div>')+
    '<div class="ci"><b>'+esc(c)+'</b><small class="latin">'+(COUNTRY_EN[c]||'')+'</small><span>'+g.trips.length+' 段 · '+esc(yearsTxt(g))+'</span></div></a>'}).join('')+
  '</div></div></section>'}
function countryFeature(name){
  var wf = (name === '俄罗斯' || name === '中国') ? WORLD.features.filter(function(x){ return x.properties.name === name; })[0] : null;
  return wf || DETAIL.features.filter(function(x){ return x.properties.name === name; })[0] || WORLD.features.filter(function(x){ return x.properties.name === name; })[0];
}
function countryProjection(f){
  var rotate = (f && f.properties && f.properties.name === '俄罗斯') ? [-100, 0] : [0, 0];
  return d3.geoMercator().rotate(rotate);
}
function CountryOutline(el, name, opts){
  opts = opts || {};
  this.el = el;
  this.name = name;
  this.pad = opts.pad != null ? opts.pad : 0.16;
  this.map = null;
  this._render();
}
CountryOutline.prototype._render = function(){
  var el = this.el;
  var W = el.clientWidth || 300, H = el.clientHeight || 300;
  var f = countryFeature(this.name);
  if(!f){ el.innerHTML = ''; return; }
  var proj = countryProjection(f);
  var path = d3.geoPath(proj);
  var padW = W * this.pad, padH = H * this.pad;
  proj.fitExtent([[padW, padH], [W - padW, H - padH]], f);
  path = d3.geoPath(proj);
  var d = path(f);
  var X = countryIndex().by[this.name];
  var dots = '';
  (X ? X.cities : []).forEach(function(city){
    var s = null;
    SEQ.forEach(function(t){ t.stops.forEach(function(x){ if(x.city === city && !s) s = x; }); });
    if(s){ var q = proj([s.lng, s.lat]); if(q) dots += '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="2.6"/>'; }
  });
  el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true"><path class="cmap-path" d="' + d + '"/><g class="cmap-dots">' + dots + '</g></svg>';
  this.map = { name: this.name, f: f, projection: proj, bounds: path.bounds(f), path: d, viewport: [W, H] };
  el.__countryMap = this.map;
};
CountryOutline.prototype.resize = function(){
  this._render();
};
CountryOutline.prototype.destroy = function(){
  if(this.el.__countryMap && this.el.__countryMap === this.map){
    this.el.innerHTML = '';
    this.el.__countryMap = null;
    this.map = null;
  }
};
function drawCountryOutlines(root){
 var els=$$('[data-cmap]',root);
 if(!els.length)return;
 loadDetailHi().then(function(){
   els.forEach(function(el){
     if(!document.body.contains(el))return;
     var c=el.getAttribute('data-cmap');
     if(!c)return;
     new CountryOutline(el, c, {pad:0.16});
   });
 });
}
function tripCard(t,n,L){
 var cm=companion(t),rt=routeText(t),first=t.start.split('-');
 var vis;
 if(L.indexOf('l-map')===0){vis='<div class="vis rv"><a class="main ph" href="#/trip/'+t.id+'" style="display:block"><div class="maparts" data-map="art" data-id="'+t.id+'"></div><div class="tag">'+engMonth(t)+'</div></a></div>'}
 else vis='<div class="vis rv"><a class="main ph big" href="#/trip/'+t.id+'" style="display:block" aria-label="'+esc(t.title)+'"><div class="maparts rmap-l" data-map="big" data-id="'+t.id+'"><div class="rc">'+(t.unordered?'到访城市':'路线')+'</div></div></a></div>';
 return '<article class="trip '+L+(t.portrait?' pt':' ls')+'" data-id="'+t.id+'">'+vis+
  '<div class="info rv d1"><div class="no latin">'+p2(n)+'</div><h3><a href="#/trip/'+t.id+'">'+esc(t.title)+'</a></h3>'+
  '<div class="meta"><b>'+fmtRange(t.start,t.end)+'</b> · '+t.dayCount+' 天'+(t.nights?' '+t.nights+' 晚':'')+(t.cityCount?' · '+t.cityCount+' 座城':'')+'</div>'+
  (t.summary?'<p class="sum">'+esc(t.summary)+'</p>':'')+
  (L.indexOf('l-map')===0&&t.highlights.length?'<div class="hls">'+t.highlights.slice(0,4).map(function(h){return '<span>'+esc(h)+'</span>'}).join('')+'</div>':'')+
  (L.indexOf('l-map')===0?(rt.length>1?'<div class="rt">'+rt.map(function(c){return '<span>'+esc(c)+'</span>'}).join(t.unordered?'<span class="dotsep"> · </span>':'<span class="ar"></span>')+'</div>':'')+cornwallNote(t):cornwallNote(t)+rboxHTML(t))+
  (cm?'<div class="who '+cm.cls+'"><i></i>'+cm.txt+'</div><br>':'')+
  '<a class="open" href="#/trip/'+t.id+'">打开这趟旅行'+ARROW+'</a></div></article>'}
// the list's route view, in the old day page's manner: a big gold numeral, a small-caps row, thin rules, city chips that steer the map
function rboxHTML(t){var seen={},chips=[];t.stops.forEach(function(s,i){if(s.area||seen[s.city])return;seen[s.city]=1;chips.push('<button type="button" class="chip" data-si="'+i+'">'+esc(s.city)+'</button>')});
 var n=t.nights||t.dayCount;return '<div class="rbox"><div class="rinfo">'+(n?'<div class="dn latin">'+p2(n)+'</div><div class="dl">'+(t.nights?'nights':'days')+'</div>':'')+'<div class="dd">'+fmtRange(t.start,t.end)+'</div>'+(chips.length?'<div class="chips">'+chips.join('')+'</div>':'')+'</div>'+
 '<a class="rthumb" href="#/trip/'+t.id+'" tabindex="-1">'+thumbs(t,'rth')+'</a>'+'</div>'}
function footHTML(){return '<div class="foot"><div>旅行日志 · 兴兴嘉怡一起</div><div>背景音乐：Erik Satie《Gymnopédie No. 1》，Robin Alciatore 演奏；Chopin《降 E 大调夜曲 Op. 9 No. 2》，Frank Lévy 演奏。均为公有领域录音，来自 <a href="https://musopen.org/" target="_blank" rel="noopener">Musopen</a> / <a href="https://commons.wikimedia.org/" target="_blank" rel="noopener">Wikimedia Commons</a>。</div></div>'}

function setupHome(view){
 reveal(view);
 // count up
 var sEl=$('.stats',view);if(sEl){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;io.disconnect();$$('[data-count]',sEl).forEach(function(n,i){countUp(n,+n.getAttribute('data-count'),1800+i*120)})})},{threshold:.4});io.observe(sEl);homeIO.push(io)}
 // overview
 var ovEl=$('#ovmap',view);if(ovEl){var ovIO=new IntersectionObserver(function(es){if(es[0].isIntersecting){ovIO.disconnect();setupOverview(view)}},{rootMargin:'100% 0px'});ovIO.observe(ovEl);homeIO.push(ovIO)}
 setupGlobe(view);
 var arIO=new IntersectionObserver(function(es){if(es[0].isIntersecting){arIO.disconnect();drawCountryOutlines(view)}},{rootMargin:'600px 0px'});var arEl=$('#archive',view);if(arEl){arIO.observe(arEl);homeIO.push(arIO)}
 // trip route maps (lazy)
 // trip route maps: created on approach, destroyed when more than ~1.5 screens away
 var lazy=new IntersectionObserver(function(es){es.forEach(function(e){var el=e.target;if(e.isIntersecting){el._want=1;if(!el._map&&!el._pend)makeTripMap(el)}else{el._want=0;if(el._map)dropTripMap(el)}})},{rootMargin:'150% 0px'});
 $$('[data-map]',view).forEach(function(m){lazy.observe(m)});homeIO.push(lazy);
 // activation by scroll
 var act=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)activateTrip(e.target)})},{rootMargin:'-42% 0px -42% 0px'});
 $$('.trip',view).forEach(function(t){act.observe(t);t.addEventListener('mouseenter',function(){activateTrip(t)})});
 // city chips: the map follows the chip under the pointer (or focus), and goes back to the whole route on leave
 $$('.rbox',view).forEach(function(b){var tr=b.closest('.trip'),el=$('[data-map="big"]',tr),outT=0;function m(){return el&&el._map}
  function on(c){clearTimeout(outT);var M=m();if(!M)return;activateTrip(tr);var t=BYID[tr.getAttribute('data-id')],si=+c.getAttribute('data-si'),pts=tripPts(t),near=[pts[si]];if(si>0)near.push(pts[si-1]);if(si<pts.length-1)near.push(pts[si+1]);
   $$('.chip',b).forEach(function(x){x.classList.toggle('on',x===c)});M.setActive(si);M.view(near,{pad:.26,minSpan:isSeoulCity(t)?0.2:Math.max(1.4,routeSpan(near)),dur:800})}
  function off(){outT=setTimeout(function(){var M=m();$$('.chip',b).forEach(function(x){x.classList.remove('on')});if(!M)return;var t=M.trip;M.setActive(-1);M.view(isSeoulCity(t)?mapPts(t):tripPts(t),{pad:.24,minSpan:tripMinSpan(t),dur:800})},220)}
  $$('.chip',b).forEach(function(c){c.addEventListener('mouseenter',function(){on(c)});c.addEventListener('focus',function(){on(c)});c.addEventListener('click',function(){on(c)});c.addEventListener('mouseleave',off);c.addEventListener('blur',off)})});homeIO.push(act);
 $$('[data-lb="country"]',view).forEach(function(el){el.addEventListener('click',function(){var c=el.getAttribute('data-c');var list=[];SEQ.forEach(function(t){t.photos.forEach(function(p){if(p.country===c)list.push({p:p,a:t.title,b:p.place})})});openLB(list,+el.getAttribute('data-i'))})});
 $$('.trip .ph.lift',view).forEach(function(el){el.addEventListener('mousemove',cursorLight)});
}
function cursorLight(e){var el=this,r=el._r;if(!r){r=el._r=el.getBoundingClientRect();window.addEventListener('scroll',function(){el._r=null},{once:true,passive:true});el.addEventListener('mouseleave',function(){el._r=null},{once:true})}this.style.setProperty('--mx',(e.clientX-r.left)+'px');this.style.setProperty('--my',(e.clientY-r.top)+'px')}
function countUp(el,to,dur){if(RM){el.textContent=fmtNum(to);return}var t0=performance.now();function f(now){var t=Math.min(1,(now-t0)/dur),v=to*(1-Math.pow(1-t,4));el.textContent=fmtNum(v);if(t<1)requestAnimationFrame(f)}requestAnimationFrame(f)}
function reveal(root){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.01});$$('.rv',root).forEach(function(el){io.observe(el)});homeIO.push(io)}
function tripRoutes(t,cls){if(t.unordered)return [];var segs=[];for(var i=1;i<t.stops.length;i++){segs.push({pts:[[t.stops[i-1].lng,t.stops[i-1].lat],[t.stops[i].lng,t.stops[i].lat]],cls:cls})}return segs}
// legs getting there and home (e.g. Abu Dhabi → Bangkok): faint dashes, endpoints marked 出发 / 中转 / 回家, not counted as places
function legRoutes(t){return (t.legs||[]).map(function(l){return {pts:l.map(function(p){return [p.lng,p.lat]}),cls:'leg',bend:.1}})}
function legStops(t){var o=[],own={},by={};t.stops.forEach(function(s){own[s.city]=1});
 var seoul=isSeoulCity(t),pois=seoul?seoulPois(t):[];
 (t.legs||[]).forEach(function(l){l.forEach(function(p){if(own[p.city])return;
  var key=p.city;if(seoul){var near=pois.filter(function(x){return Math.abs(x.lng-p.lng)<0.0001&&Math.abs(x.lat-p.lat)<0.0001});if(near.length)return;key='__leg_'+p.lng.toFixed(4)+'_'+p.lat.toFixed(4);}
  var e=by[key];if(!e){e=by[key]={city:p.city,lat:p.lat,lng:p.lng,cls:'leg',roles:[]};o.push(e)}
  if(p.role&&e.roles.indexOf(p.role)<0)e.roles.push(p.role)})});
 o.forEach(function(e){if(e.roles.length)e.city+=' · '+e.roles.join('、')});return o}
// the same three small photos everywhere on home: cover, the chosen second shot, then the next landscape one (480 variants, lazy)
function smallSet(t){var o=[];function add(p){if(p&&o.indexOf(p)<0&&o.length<3)o.push(p)}add(t.cover);add(t.second);(t.photos||[]).forEach(function(p){if(p.w>p.h)add(p)});(t.photos||[]).forEach(add);return o}
function thumbs(t,cls){var s=smallSet(t);return s.length?'<span class="'+cls+'">'+s.map(function(p){return img(p,{alt:'',sizes:'120px'})}).join('')+'</span>':''}
function tripPts(t){return t.stops.map(function(s){return [s.lng,s.lat]})}
function tripMinSpan(t){if(isSeoulCity(t))return cityMinSpan(t);if(t.stops[0]&&t.stops[0].area)return 9;var p=mapPts(t),sp=routeSpan(p);return t.cityCount<2?Math.max(2,sp):Math.max(1.2,sp*1.05)}
function whenMapBoxReady(el,fn){
 if(el.clientWidth>1&&el.clientHeight>1){fn();return}
 var done=0,n=0;
 function go(){if(done||!el.isConnected)return;if(el.clientWidth>1&&el.clientHeight>1){done=1;if(el._ro){el._ro.disconnect();el._ro=null}fn()}}
 if(typeof ResizeObserver!=='undefined'){el._ro=new ResizeObserver(go);el._ro.observe(el);var host=el.closest('.vis');if(host&&host!==el)el._ro.observe(host)}
 var iv=setInterval(function(){if(done||++n>40){clearInterval(iv);if(!done){done=1;if(el._ro){el._ro.disconnect();el._ro=null}fn()}}else go()},50);
}
function makeTripMap(el){
 var t=BYID[el.getAttribute('data-id')];if(!t||!t.stops.length)return;
 var art=el.getAttribute('data-map')==='art',big=el.getAttribute('data-map')==='big',city=isSeoulCity(t);
 var pts=mapPts(t),rb=bboxOf(pts),base=grow(rb,city?1.45:(art?2.2:2.4),city?cityMinSpan(t):(art?Math.max(3,routeSpan(pts)):Math.max(2.2,routeSpan(pts)*.35)));
 var hl={};tripCountries(t).forEach(function(c){hl[c]=1});
 el._pend=1;(city?Promise.all([loadDetail(),loadSeoulOSM()]):loadDetail()).then(function(){el._pend=0;if(!el._want||!el.isConnected)return;
  whenMapBoxReady(el,function(){if(!el._want||!el.isConnected||el._map)return;
  var m=new FlatMap(el,{base:base,highlight:hl,overlay:null,cityDiagram:city,cityOSM:city?SEOUL_OSM:null,kmax:city?80:30,lblSize:art||big?15:12,ctyAreaMin:art?2600:2400,seaK:art?1.0:1.6,dotR:art||big?4:3,pulse:false,ghost:art,ctxCities:false,countryLabels:!city});
  if(city)addOSMCredit(el);
  var rs=city?[]:legRoutes(t).concat(tripRoutes(t,t.lc||'tg'));if(!city&&t.id==='2024-cornwall'&&BYID['2024-cornwall-zx'])rs=rs.concat(tripRoutes(BYID['2024-cornwall-zx'],'zx ghost2'));
  var stops=city?seoulPois(t).filter(function(s){return s.city!=='仁川机场'}):t.stops.filter(function(s){return !s.area}).map(function(s){return {city:s.city,lat:s.lat,lng:s.lng}}).concat(legStops(t));
  m.setRoutes(rs,stops);
  m.trip=t;m.art=art;m.wide=base;
  if(city){addSeoulTransit(el,t)}
  m.view((art||city)?pts:[base[0],base[1]],(art||city)?{pad:.2,minSpan:city?cityMinSpan(t):Math.max(2.2,routeSpan(pts)),instant:true}:{pad:0,instant:true});
  if(!art){m.opt.lblSet={}}
  el._map=m;homeMaps.push(m);
  m._el=el;if(el.closest('.trip.act'))mapOnIdle(m);
 })});}
function dropTripMap(el){if(el._ro){el._ro.disconnect();el._ro=null}var m=el._map;if(!m)return;el._map=null;var i=homeMaps.indexOf(m);if(i>=0)homeMaps.splice(i,1);m.destroy()}
var actTrip=null;
// a route map zooms in and draws its line only once the page stops scrolling: animating big canvases mid-scroll cost ~6fps on desktop
var mapIdleT=0;function mapOnIdle(m){if(!document.documentElement.classList.contains('scr')){mapOn(m);return}m._pendOn=1;clearTimeout(mapIdleT);mapIdleT=setTimeout(function chk(){if(document.documentElement.classList.contains('scr')){mapIdleT=setTimeout(chk,120);return}homeMaps.forEach(function(x){if(x._pendOn){x._pendOn=0;if(actTrip&&x._el&&actTrip.contains(x._el))mapOn(x)}})},180)}
function activateTrip(tr){if(actTrip===tr)return;if(actTrip){actTrip.classList.remove('act');$$('[data-map]',actTrip).forEach(function(e){if(e._map){e._map._pendOn=0;mapOff(e._map)}})}actTrip=tr;tr.classList.add('act');$$('[data-map]',tr).forEach(function(e){if(e._map)mapOnIdle(e._map)})}
function mapOn(m){var t=m.trip,pts=mapPts(t);m.opt.lblSet=null;m.view(pts,{pad:m.art?.2:.24,minSpan:tripMinSpan(t),dur:1300});var n=m.segP.length;for(var i=0;i<n;i++)m.animateSeg(i,1,Math.max(450,900/n),700+i*Math.max(380,800/n));m.setActive(-1)}
function mapOff(m){if(m.art)return;var q=document.documentElement.classList.contains('scr');m.opt.lblSet={};m.view([m.wide[0],m.wide[1]],{pad:0,dur:900,instant:q});for(var i=0;i<m.segP.length;i++)m.animateSeg(i,0,q?0:400,0)}

function setupOverview(view){
 var el=$('#ovmap',view);if(!el)return;
 var routes=[],stops=[],cityStep={};
 SEQ.filter(function(t){return t.kind==='trip'}).forEach(function(t){if(!t.unordered){routes.push({pts:tripPts(t),cls:t.lc,bend:.18,id:t.id,step:0});}t.stops.forEach(function(st){if(st.area)return;cityStep[st.city]=0;stops.push({city:st.city,lat:st.lat,lng:st.lng,cls:t.lc})})});
 var G=BYID['2024-scotland-dec-zx'],M=BYID['2024-morocco'];if(G&&M&&G.stops.length&&M.stops.length){var gl=G.stops[G.stops.length-1],ag=M.stops[0];routes.push({pts:[[gl.lng,gl.lat],[ag.lng,ag.lat]],cls:'zx',bend:.22,id:'bridge-zx',step:0});routes.push({pts:[[-2.5879,51.4545],[ag.lng,ag.lat]],cls:'solo',bend:-.2,id:'bridge-jy',step:0})}
 ['edinburgh-again','uk-years'].forEach(function(id){var t=BYID[id];if(t)t.stops.forEach(function(st){stops.push({city:st.city,lat:st.lat,lng:st.lng,cls:'tg'});cityStep[st.city]=0})});
 var all=stops.map(function(s){return [s.lng,s.lat]});var base=grow(bboxOf(all),1.15,0);
 function build(){ovMap=new FlatMap(el,{base:base,useWorld:true,highlight:allVisited(),kmax:12,lblSize:13,ctyAreaMin:5200,seaK:2.2,seaLabels:!isMob(),dotR:3,progress:false,pulse:false,countryLabels:true});
  ovMap.setRoutes(routes,stops);ovMap.opt.dotSet={};ovMap.opt.lblSet={};ovMap.view(all,{pad:padOv(),instant:true});ovStep(0,true)}
 build();loadDetail().then(function(){if(ovMap){ovMap.drawLand();ovMap.applyT()}});
 var cur=-1;el.__ov=function(){return {cur:cur,T:ovMap&&ovMap.T,moving:ovMap&&ovMap.moving}}; // test hook
 function padOv(){return isMob()?[.13,.07,.42,.07]:[.2,.07,.16,.4]}
 function ovStep(i,instant){if(i===cur)return;cur=i;var s=OV[i];$('#ovyear').textContent=s.yr||'';
  $$('.ov-step',view).forEach(function(x){x.classList.toggle('on',+x.getAttribute('data-i')===i)});
  var ds={},ls={};Object.keys(cityStep).forEach(function(c){if(cityStep[c]<=i)ds[c]=1;if(cityStep[c]===i)ls[c]=1});ovMap.opt.dotSet=ds;ovMap.opt.lblSet=s.all?{}:ls;
  var pts=[];s.ids.forEach(function(id){pts=pts.concat(tripPts(BYID[id]))});if(s.all||!pts.length)pts=all;
  ovMap.view(pts,{pad:padOv(),minSpan:s.pad||0,dur:instant?0:1600});
  var k=0;routes.forEach(function(r,j){var target=r.step<=i?1:0;if(ovMap.segP[j]===target)return;if(target&&r.step===i){ovMap.animateSeg(j,1,1100,600+k*380);k++}else ovMap.animateSeg(j,target,instant?0:500,0)})}
 // the chapter is whichever step holds the middle of the screen (or the nearest one). The observer only reports band crossings, and a fling can jump a
 // step over the band between two frames, so the step is also re-read once scrolling settles.
 var stepsEl=$$('.ov-step',view),setT=0;
 function pick(){if(!el.isConnected)return;var mid=innerHeight/2,best=-1,bd=1e9;stepsEl.forEach(function(s){var r=s.getBoundingClientRect();var d=r.top<=mid&&r.bottom>=mid?0:Math.min(Math.abs(r.top-mid),Math.abs(r.bottom-mid));if(d<bd){bd=d;best=+s.getAttribute('data-i')}});
  var sec=el.closest('section')||el.parentNode,sr=sec.getBoundingClientRect();if(best>=0&&sr.bottom>0&&sr.top<innerHeight)ovStep(best)}
 var io=new IntersectionObserver(function(){pick()},{rootMargin:'-45% 0px -45% 0px'});
 stepsEl.forEach(function(s){io.observe(s)});homeIO.push(io);
 function onS(){clearTimeout(setT);setT=setTimeout(pick,140)}window.addEventListener('scroll',onS,{passive:true});homeIO.push({disconnect:function(){window.removeEventListener('scroll',onS);clearTimeout(setT)}});
}
