/* ---------- detail ---------- */
var dMap=null,dIO=[];
// day photos: justified rows that keep each photo's own orientation (no forced crops)
function pgHTML(ps,ctx){if(!ps.length)return '';var rows=[],n=ps.length,i=0;var sizes=n===4?[2,2]:n===5?[3,2]:null;
 if(sizes)sizes.forEach(function(k){rows.push(ps.slice(i,i+k));i+=k});else for(;i<n;i+=3)rows.push(ps.slice(i,i+3));
 return '<div class="pg">'+rows.map(function(r){var sum=0;r.forEach(function(p){sum+=(p.w||3)/(p.h||4)});var mw=r.length===1?((p0=r[0]).w>p0.h?100:58):(sum<1.6?78:100);
  return '<div class="pgr" style="max-width:'+mw+'%">'+r.map(function(p){var ar=(p.w||3)/(p.h||4);return img(p,{lift:true,attrs:' data-lbi="'+ctx.indexOf(p)+'"',alt:p.place,sizes:'(max-width:860px) '+Math.round(100*ar/sum)+'vw, '+Math.round(45*ar/sum)+'vw',style:'flex:'+ar.toFixed(3)+' 1 0;aspect-ratio:'+(p.w||3)+'/'+(p.h||4)})}).join('')+'</div>'}).join('')+'</div>'}
var p0;
// v9.2b trip page: cover, one short line, places, route map, photos grouped by place.
// v9.2k: non-draft day cards (itinerary) sit between the map and leftover photos.
function travelDirectionHTML(t){
  if (!t || !t.id) return '';
  var m = {
    '2026-moscow-zx': '<div class="travel-direction"><p>去程 济南—北京—莫斯科</p><p>返程 莫斯科—青岛—济南</p></div>',
    '2026-jakarta-zx': '<div class="travel-direction"><p>去程 济南—成都—雅加达</p><p>返程 雅加达—成都—济南</p></div>'
  };
  return m[t.id] || '';
}
function wireLightboxThumbs(view, opener, alsoLight){
 $$('[data-lbi]',view).forEach(function(el){
  el.setAttribute('tabindex','0');
  el.setAttribute('role','button');
  el.addEventListener('click',function(){opener(el)});
  el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();opener(el)}});
  if(alsoLight)el.addEventListener('mousemove',cursorLight);
 });
}
function renderDetail(view,id){
 var t=BYID[id];if(!t){view.innerHTML=missHTML();return}
 var i=SEQ.indexOf(t),prev=SEQ[(i-1+SEQ.length)%SEQ.length],next=SEQ[(i+1)%SEQ.length];
 var cm=companion(t),h='',isE=!!t.visits,isU=!!t.moments,isC=t.id==='china-diary';
 var k=isE?'Edinburgh · '+t.visits.length+' visits':isU?'London · Exeter':isC?'China':engMonth(t);
 var dateS=isE?(t.visits[0].start.slice(0,4)+' — '+t.visits[t.visits.length-1].start.slice(0,4)):isU?'2024 — 2026':isC?'':fmtRange(t.start,t.end);
 var title=t.title,line=tripLine(t);
 var split=t.cover&&t.portrait;
 h+='<section class="cover'+(t.cover?'':' nophoto')+(split?' split':'')+'">'+(t.cover?'<div class="kb">'+img(t.cover,{eager:true,alt:title,sizes:split?'(max-width:860px) 100vw, 50vw':'100vw',big:true})+'</div>':'<div class="mapcover" id="mapcover"></div>')+
  '<div class="c"><div><div class="k">'+esc(k)+'</div><h1>'+esc(title)+'</h1>'+(line?'<div class="s">'+esc(line)+'</div>':'')+'</div>'+
  (cm?'<div class="whom '+cm.cls+'"><i></i>'+cm.txt+(dateS?' · '+dateS:'')+'</div>':(dateS?'<div class="whom">'+dateS+'</div>':''))+'</div></section>';
 // places + map
 var places=[],seoul=isSeoulCity(t);
 if(isE)t.visits.forEach(function(v,j){places.push({nm:fmtRange(v.start,v.end),sub:visitWho(v),stop:0,visit:j,link:v.trip})});
 else if(seoul)seoulPois(t).forEach(function(s,j){places.push({nm:s.city,sub:'',stop:j})});
 else if(!isC){var seen={};t.stops.forEach(function(s,j){var key=s.city;if(seen[key]!=null)return;seen[key]=j;places.push({nm:s.city,sub:isC?(s.province||''):(s.area?'':(s.country&&t.countries.length>1?s.country:'')),stop:j})})}
 var start=!isE&&!isC&&!isU&&t.stops.length>2&&t.stops[0].city===t.stops[t.stops.length-1].city?t.stops[0].city:'';
 h+='<section class="tp'+(places.length?'':' tp-solo')+'"><div class="tp-pl"><div class="sec-k">'+(isE?'四次到访':isC?'去过的城市':t.stops.length===1&&t.stops[0].area?'去过的地方':'去过的地方')+'</div><ol>'+
  places.map(function(pl,j){return '<li class="st-c" data-stop="'+pl.stop+'"'+(pl.visit!=null?' data-visit="'+pl.visit+'"':'')+' tabindex="0"><span class="n latin">'+(t.unordered?'·':p2(j+1))+'</span><span class="nm">'+esc(pl.nm)+'</span>'+(pl.sub?'<span class="sb">'+esc(pl.sub)+'</span>':'')+(pl.link&&BYID[pl.link]?'<a class="vlink" href="#/trip/'+pl.link+'">那一趟'+ARROW+'</a>':'')+'</li>'}).join('')+'</ol>'+
  (start?'<div class="tp-note">从'+esc(start)+'出发，又回到'+esc(start)+'</div>':'')+'</div>'+
  '<div class="dmap tp-map"><div class="box" id="dmapbox"><div class="zoom"><button data-z="in" aria-label="放大">+</button><button data-z="out" aria-label="缩小">−</button><button data-z="fit" aria-label="全部路线" style="font-size:11px">⤢</button></div><div class="cap"><span>'+(isE?'爱丁堡':isC?'中国':t.unordered?'到访城市':'路线')+'</span><b id="dmapcap"></b></div></div></div></section>';
 h+=travelDirectionHTML(t);
 // published day cards (only days with draft:false; existing trips stay hidden)
 var ctx=t.photos.slice();
 var days=(t.days||[]).filter(function(d){return !d.draft});
 var used={};
 var dph=days.map(function(d){
  var ps=(d.pk||[]).map(function(k){return t.photos.filter(function(p){return p.key===k})[0]}).filter(Boolean);
  ps.forEach(function(p){used[p.key]=1});
  return {d:d,ps:ps};
 });
 if(days.length){
  h+='<section class="itin"><div class="sec-k">行程</div><ol>'+dph.map(function(x){
   var d=x.d,row='<li class="itin-d">';
   if(d.date)row+='<div class="itin-k latin">'+esc(fmtDay(d.date))+'</div>';
   if(d.title)row+='<h3>'+esc(d.title)+'</h3>';
   if(d.text)row+='<p>'+esc(d.text)+'</p>';
   if(d.stay)row+='<div class="itin-stay">'+esc(d.stay)+'</div>';
   if(x.ps.length)row+=pgHTML(x.ps,ctx);
   return row+'</li>';
  }).join('')+'</ol></section>';
 }
 // photos not already shown on a day card, grouped by place
 var rest=ctx.filter(function(p){return !used[p.key]}),groups=[],gi={};
 rest.forEach(function(p){var nm=isC?'':(p.place||'');var cn=!nm&&p.country?p.country:'';if(gi[nm+'|'+cn]==null){gi[nm+'|'+cn]=groups.length;groups.push({nm:nm,cn:cn,ps:[]})}groups[gi[nm+'|'+cn]].ps.push(p)});
 if(rest.length){h+='<section class="tp-ph"><div class="sec-k">照片 · '+rest.length+'</div>'+groups.map(function(g){var head=groups.length>1&&g.nm?'<h3 data-place="'+esc(g.nm)+'">'+esc(g.nm)+'</h3>':(groups.length>1&&g.cn?'<h3 data-country="'+esc(g.cn)+'">'+esc(g.cn)+'</h3>':'');return '<div class="tp-g">'+head+pgHTML(g.ps,ctx)+'</div>'}).join('')+'</section>'}
 h+='<section class="dfoot"><div class="k">继续看</div><div class="nx">'+nxHTML(prev,'上一站',false)+nxHTML(next,'下一站',true)+'</div><div class="keys">键盘 <kbd>←</kbd><kbd>→</kbd> 切换旅行，<kbd>Esc</kbd> 回到全部</div>'+
  '<div style="text-align:center"><button class="rand" data-rand>'+icon('shuffle')+'随便翻一段旅行</button></div>'+footHTML()+'</section>';
 view.innerHTML=h;markLoaded(view);
 $('#dtitle').textContent=title;
 $('#dprev').setAttribute('href','#/trip/'+prev.id);$('#dprev .lbl').textContent=prev.title;
 $('#dnext').setAttribute('href','#/trip/'+next.id);$('#dnext .lbl').textContent=next.title;
 reveal(view);
 wireLightboxThumbs(view,function(el){openLB(ctx.map(function(p){return {p:p,a:title,b:(CAPS&&CAPS[p.src.replace(/^public\//,'')])||p.place}}),+el.getAttribute('data-lbi'))},true);
 setupDetailMap(t,view);
}
function tripLine(t){return t.summary||''}
function routeSpan(p){var b=bboxOf(p);return Math.max(b[1][0]-b[0][0],b[1][1]-b[0][1])}
function visitWho(v){if(v.who&&WHO[v.who])return WHO[v.who];var n=v.note||'';if(/政兴|兴兴/.test(n))return '兴兴一个人';return '嘉怡一个人'}
function nxHTML(t,lab,r){var ttl=t.title;var sub=t.visits?'4 次到访':t.moments?'伦敦 · 埃克塞特':t.id==='china-diary'?t.summary:fmtRange(t.start,t.end)+' · '+routeText(t).join(t.unordered?' · ':' — ');
 return '<a href="#/trip/'+t.id+'" class="'+(r?'r':'')+'">'+(t.cover?img(t.cover,{alt:ttl,sizes:'(max-width:860px) 100vw, 50vw'}):'<div class="maparts" data-map="art" data-id="'+t.id+'"></div>')+'<div class="t"><small>'+lab+'</small><b>'+esc(ttl)+'</b><em>'+esc(sub)+'</em></div></a>'}
var detailMapGen=0;
function addSeoulTransit(el, t) {
    if (!el || !t || !Array.isArray(t.legs) || t.legs.length === 0) return;
    
    const legs = t.legs.filter(leg => Array.isArray(leg) && leg.length >= 2);
    if (legs.length === 0) return;
    
    let note = null;
    if (el._transitNote && el._transitNote.isConnected) {
        note = el._transitNote;
    } else {
        if (el._transitNote && el._transitNote.parentNode) {
            el._transitNote.parentNode.removeChild(el._transitNote);
        }
        note = document.createElement('div');
        note.className = 'seoul-transit';
        el._transitNote = note;
        el.parentNode.insertBefore(note, el.nextSibling);
    }
    
    const isHome = el.hasAttribute && el.hasAttribute('data-map');
    const isCover = el.id === 'mapcover';
    const isDetail = !isHome && !isCover;
    
    note.style.cssText = 'font-size:11px;color:rgba(237,230,218,.8);background:rgba(23,27,25,.6);padding:6px;line-height:1.5;pointer-events:none;';
    
    if (isHome) {
        note.style.cssText += 'position:absolute;top:12px;left:12px;right:12px;z-index:3;';
    } else if (isCover) {
        note.style.cssText += 'position:absolute;top:12px;left:12px;right:12px;z-index:3;';
    } else {
        note.style.cssText += 'margin-top:6px;';
    }
    
    const coordPairs = [];
    
    legs.forEach(leg => {
        const first = leg[0];
        const last = leg[leg.length - 1];
        coordPairs.push(`${first.lng},${first.lat};${last.lng},${last.lat}`);
    });
    
    const heading = '机场交通';
    
    note.innerHTML = '';
    
    const headingEl = document.createElement('div');
    headingEl.textContent = heading;
    headingEl.style.fontWeight = 'bold';
    note.appendChild(headingEl);
    
    
    legs.forEach((leg, index) => {
        const row = document.createElement('div');
        row.setAttribute('data-coord', coordPairs[index]);
        row.textContent = `${esc(leg[0].city)} → ${esc(leg[leg.length - 1].city)}`;
        note.appendChild(row);
    });
}

function setupDetailMap(t,view){
 if(dMap){try{dMap.destroy()}catch(e){}dMap=null}
 var box=$('#dmapbox',view);if(!box)return;var isC=t.id==='china-diary',isE=!!t.visits,seoul=isSeoulCity(t),gen=++detailMapGen;
 var pois=seoul?seoulPois(t):null;
 var pts=mapPts(t),hl={};tripCountries(t).forEach(function(c){hl[c]=1});if(isC)t.stops.forEach(function(s){hl[s.province]=1});
 var area=t.stops.length===1&&t.stops[0].area;
 var base=grow(bboxOf(pts),isC?22:area?14:seoul?1.4:1.55,isC?38:area?20:seoul?cityMinSpan(t):Math.max(1.2,routeSpan(pts)*.2));
 var p=isC?Promise.all([loadDetailHi(),loadChina()]):seoul?Promise.all([loadDetailHi(),loadSeoulOSM()]):loadDetailHi();
 p.then(function(){
  if(gen!==detailMapGen||!document.body.contains(box))return;
  dMap=new FlatMap(box,{base:base,highlight:hl,overlay:null,cityDiagram:seoul,cityOSM:seoul?SEOUL_OSM:null,china:isC,kmax:seoul?80:60,lblSize:13.5,ctyAreaMin:isC?900:seoul?400:1800,seaK:seoul?9:.9,dotR:area?0:3.6,progress:false,ghost:false,capH:34,ctxCities:false,countryLabels:!seoul,ctxAvoid:function(W,H){return [W-56,0,W,136]}});
  if(seoul)addOSMCredit(box);
  var routes=(isC||!!t.moments||area||seoul)?[]:legRoutes(t).concat(tripRoutes(t,t.lc||'tg'));
  if(t.moments)routes=[{pts:tripPts(t),cls:'tg',bend:.1}];
  var stops=area?[]:seoul?pois.filter(function(s){return s.city!=='仁川机场'}):pois?pois.concat(legStops(t).filter(function(s){return !pois.some(function(x){return x.city===s.city})})):t.stops.map(function(s){return {city:s.city,lat:s.lat,lng:s.lng}}).concat(legStops(t));
  dMap.setRoutes(routes,stops);
  if(seoul)addSeoulTransit(box,t);
  var fitAll={pad:isMob()?[.14,.1,.16,.1]:[.12,.12,.16,.12],minSpan:isC?40:area?9:isE?7:seoul?cityMinSpan(t):Math.max(1.2,routeSpan(pts)*1.08)};
  dMap.view(pts,{pad:fitAll.pad,minSpan:fitAll.minSpan,instant:true});dMap.fitAll=fitAll;
  setTimeout(function(){if(!dMap||gen!==detailMapGen)return;for(var i=0;i<dMap.segP.length;i++)dMap.animateSeg(i,1,800,250+i*420)},250);
  var cap0=seoul?'首尔':area?t.countries.join('、'):isE?'4 次':t.cityCount+' 座城';$('#dmapcap').textContent=cap0;
  $$('.zoom button',box).forEach(function(b){b.addEventListener('click',function(){var z=b.getAttribute('data-z');if(z==='in')dMap.zoomBy(1.7);else if(z==='out')dMap.zoomBy(1/1.7);else{dMap.setActive(-1);dMap.view(pts,{pad:fitAll.pad,minSpan:fitAll.minSpan,dur:900})}})});
  var mc=$('#mapcover',view);if(mc){var m2=new FlatMap(mc,{base:grow(bboxOf(pts),isC?22:area?14:seoul?1.4:1.8,isC?38:area?20:seoul?cityMinSpan(t):Math.max(1.6,routeSpan(pts)*.25)),highlight:hl,overlay:null,cityDiagram:seoul,cityOSM:seoul?SEOUL_OSM:null,kmax:seoul?80:30,lblSize:15,ctyAreaMin:3000,seaK:1,dotR:area?0:4,pulse:false,ghost:false,ctxCities:false,countryLabels:!seoul});if(seoul)addOSMCredit(mc);m2.setRoutes(area?[]:seoul?[]:legRoutes(t).concat(tripRoutes(t,t.lc||'tg')),stops);m2.view(pts,{pad:isMob()?[.18,.12,.42,.12]:[.14,.1,.36,.42],minSpan:isC?40:area?9:seoul?cityMinSpan(t):2,instant:true});if(seoul)addSeoulTransit(mc,t);for(var i=0;i<m2.segP.length;i++)m2.animateSeg(i,1,1000,500+i*700)}
  $$('.nx [data-map]',view).forEach(function(el){makeTripMap(el)});
  // hovering or focusing a place lights it on the map; leaving returns to the whole route
  var on=-1,outT=0;
  function lightUp(el){clearTimeout(outT);var si=+el.getAttribute('data-stop');if(si===on)return;on=si;$$('.st-c',view).forEach(function(c){c.classList.toggle('on',c===el)});
   if(isE){dMap.rings=+el.getAttribute('data-visit')+1;$('#dmapcap').textContent='第 '+dMap.rings+' 次';dMap.setActive(0);return}
   if(area)return;var s=pois?pois[si]:t.stops[si];$('#dmapcap').textContent=s?s.city:'';dMap.setActive(si);
   if(seoul){var origIdx=+el.getAttribute('data-stop');var filteredIdx=pois.filter(function(s){return s.city!=='仁川机场'}).findIndex(function(s){return s.city===pois[origIdx].city});dMap.setActive(filteredIdx);return}
   if(!isMob()){var ll=s?[s.lng,s.lat]:null,near=ll?[ll]:[pts[si]||pts[0]];if(!seoul){if(si>0)near.push(pts[si-1]);if(si<pts.length-1)near.push(pts[si+1])}dMap.view(near,{pad:.22,minSpan:isC?4:seoul?.18:Math.max(routeSpan(near),2),dur:900})}}
  function reset(){outT=setTimeout(function(){if(!dMap||gen!==detailMapGen)return;on=-1;$$('.st-c',view).forEach(function(c){c.classList.remove('on')});dMap.setActive(-1);dMap.rings=0;$('#dmapcap').textContent=cap0;dMap.view(pts,{pad:fitAll.pad,minSpan:fitAll.minSpan,dur:900})},260)}
  $$('.st-c',view).forEach(function(c){c.addEventListener('mouseenter',function(){lightUp(c)});c.addEventListener('focus',function(){lightUp(c)});c.addEventListener('click',function(e){if(e.target.closest('a'))return;lightUp(c)});c.addEventListener('mouseleave',reset);c.addEventListener('blur',reset)});
  // hovering a photo group heading lights its place too
  $$('.tp-g h3[data-place]',view).forEach(function(hd){var names=(pois||t.stops).map(function(s){return s.city});var j=names.indexOf(hd.getAttribute('data-place'));if(j<0)return;var c=$('.st-c[data-stop="'+j+'"]',view);if(!c)return;hd.addEventListener('mouseenter',function(){lightUp(c)});hd.addEventListener('mouseleave',reset)});
 });
}

/* ---------- country page ---------- */
function renderCountry(view,name){
 var X=countryIndex(),g=X.by[name];if(!g){view.innerHTML=missHTML();return}
 var i=X.order.indexOf(name),prev=X.order[(i-1+X.order.length)%X.order.length],next=X.order[(i+1)%X.order.length];
 var h='<section class="cpage"><div class="wrap"><div class="c-head"><div class="k latin">'+esc(COUNTRY_EN[name]||'')+'</div><h1>'+esc(name)+'</h1>'+
  '<div class="c-meta">'+[g.trips.length+' 段旅行',yearsTxt(g),g.cities.length?g.cities.length+' 座城市':'',g.ph.length?g.ph.length+' 张照片':''].filter(Boolean).map(esc).join(' · ')+'</div></div>'+
  '<div class="c-grid"><div class="c-map" id="cmap"></div><div class="c-side">'+
  (g.cities.length?'<div class="c-k">去过的城市</div><div class="c-cities">'+g.cities.map(function(c){return '<span>'+esc(c)+'</span>'}).join('')+'</div>':'')+
  '<div class="c-k">这些旅行</div><div class="c-trips">'+g.trips.map(function(t){var cm=companion(t);return '<a href="#/trip/'+t.id+'"><b>'+esc(t.title)+'</b><small>'+esc(t.start&&t.start.length>8?fmtRange(t.start,t.end):(t.visits?t.visits.length+' 次':''))+(cm?' · '+esc(cm.txt):'')+'</small>'+ARROW+'</a>'}).join('')+'</div></div></div>'+
  (g.ph.length?'<div class="c-k" style="margin-top:64px">照片</div><div class="c-photos">'+g.ph.map(function(p,j){return img(p,{lift:true,attrs:' data-lbi="'+j+'"',alt:p.place,sizes:'(max-width:860px) 50vw, 25vw'})}).join('')+'</div>':'')+
  '<div class="c-nav"><a href="#/country/'+encodeURIComponent(prev)+'">‹&nbsp; '+esc(prev)+'</a><a href="#/archive" data-sec="archive">全部国家</a><a href="#/country/'+encodeURIComponent(next)+'">'+esc(next)+' &nbsp;›</a></div>'+
  '</div>'+footHTML()+'</section>';
 view.innerHTML=h;markLoaded(view);reveal(view);
 $('#dtitle').textContent=name;
 $('#dprev').setAttribute('href','#/country/'+encodeURIComponent(prev));$('#dprev .lbl').textContent=prev;
 $('#dnext').setAttribute('href','#/country/'+encodeURIComponent(next));$('#dnext .lbl').textContent=next;
 wireLightboxThumbs(view,function(el){openLB(g.ph.map(function(p){var t=g.trips.filter(function(x){return x.photos.indexOf(p)>=0})[0];return {p:p,a:t?t.title:name,b:p.place}}),+el.getAttribute('data-lbi'))},false);
 var box=$('#cmap',view),stops=[],seen={};
 g.trips.forEach(function(t){t.stops.forEach(function(s){var c=s.country||(t.countries.length===1?t.countries[0]:'');if(name==='中国'&&t.id==='china-diary')c='中国';if(c===name&&!seen[s.city]){seen[s.city]=1;stops.push(s)}})});
 var gen=++detailMapGen;
 loadDetailHi().then(function(){
   if(gen!==detailMapGen||!document.body.contains(box))return;
   if(dMap){try{dMap.destroy()}catch(e){}dMap=null}
   dMap=new CountryOutline(box, name, {pad:0.12});
 });
}
function missHTML(){var h='<section class="miss"><p>这一页没有找到。可以从下面的旅行里挑一段。</p><ul class="mlist">';
 SEQ.forEach(function(t){h+='<li><a href="#/trip/'+t.id+'"><span class="d">'+esc(String(t.start||'').slice(0,7).replace('-','.'))+'</span>'+esc(t.title)+'</a></li>'});
 return h+'</ul><a class="home" href="#/">回到首页'+ARROW+'</a></section>'}

/* ---------- globe (canvas, d3 orthographic; initialised only when scrolled near) ---------- */
function globeHTML(){var real=SEQ.filter(function(t){return t.kind==='trip'}),ys={};real.forEach(function(t){(ys[t.year]=ys[t.year]||[]).push(t)});
 return '<section class="globe" id="globe"><div class="wrap"><div class="sec-k rv">地球 · Globe</div><h2 class="sec-t rv d1">拖动地球，点一段旅行</h2>'+
  '<div class="gl-grid"><div class="gl-stage rv" id="glstage"><div class="gl-canvas" id="gl"></div><div class="gl-card" id="glcard" aria-live="polite"></div></div>'+
  '<div class="gl-list rv d1">'+Object.keys(ys).sort().reverse().map(function(y){return '<div class="gy"><div class="gyk latin">'+y+'</div><div class="gyt">'+ys[y].slice().sort(function(a,b){return a.start>b.start?-1:a.start<b.start?1:0}).map(function(t){return '<button type="button" class="gchip '+t.lc+'" data-gt="'+t.id+'"><i></i>'+esc(t.title)+'</button>'}).join('')+'</div></div>'}).join('')+
  '<div class="legend gl-legend"><span><i></i>嘉怡一个人</span><span><i class="zx"></i>兴兴一个人</span><span><i class="tg"></i>兴兴嘉怡一起</span></div></div></div></div></section>'}
var GCOL={solo:'154,144,132',zx:'138,154,162',tg:'201,162,122'};
var globeLibP=null;
function loadGlobeLib(){if(window.Globe)return Promise.resolve();if(!globeLibP)globeLibP=new Promise(function(res,rej){var sc=document.createElement('script');sc.src='public/lib/globe.gl.min.js';sc.async=true;sc.onload=res;sc.onerror=function(){globeLibP=null;rej(new Error('globe.gl'))};document.head.appendChild(sc)});return globeLibP}
// WebGL that is really software (SwiftShader, llvmpipe: GPU blocklisted, VMs, remote desktops) chokes on a big 3D globe and stalls scrolling for seconds;
// those get the canvas globe. ?gl forces globe.gl (QA and screenshots).
function hasGL(){try{var c=document.createElement('canvas'),g=window.WebGLRenderingContext&&(c.getContext('webgl2')||c.getContext('webgl'));if(!g)return false;if(/[?&]gl\b/.test(location.search))return true;
 var x=g.getExtension('WEBGL_debug_renderer_info'),r=x?String(g.getParameter(x.UNMASKED_RENDERER_WEBGL)):'';var lose=g.getExtension('WEBGL_lose_context');if(lose)lose.loseContext();return !/swiftshader|llvmpipe|software|basic render/i.test(r)}catch(e){return false}}
function setupGlobe(view){
 var host=$('#gl',view);if(!host)return;
 var started=false,queued=null,gen=routeGen;
 var lastScr=0;function noteScr(){lastScr=performance.now()}window.addEventListener('scroll',noteScr,{passive:true});
 function start(){if(started)return;if(performance.now()-lastScr<500){setTimeout(function(){if(gen===routeGen&&host.isConnected&&isNear())start()},500);return}started=true;window.removeEventListener('scroll',noteScr);near.disconnect();host.classList.add('loading');
  var useGL=hasGL()&&!isMob(); /* phones get the light canvas globe: no 526KB library, no WebGL in the first screen */(useGL?loadGlobeLib():Promise.reject()).then(function(){if(gen!==routeGen||!host.isConnected)return;globeCtl=makeGlobeGL(host,view)})
   .catch(function(){if(gen!==routeGen||!host.isConnected)return;globeCtl=makeFlatGlobe(host,view)})
   .then(function(){host.classList.remove('loading');if(globeCtl)setupScrub(view,globeCtl);if(globeCtl&&queued){globeCtl.pickTrip(queued);queued=null}})}
 var nearNow=false;function isNear(){return nearNow}
 var near=new IntersectionObserver(function(es){es.forEach(function(e){nearNow=e.isIntersecting;if(e.isIntersecting)start()})});
 homeIO.push(near);
 // the globe sits in the first screen: wait until the page has loaded and gone quiet, so it never competes with the first paint
 function arm(){if(gen!==routeGen||!host.isConnected)return;var go=function(){if(gen===routeGen&&host.isConnected)near.observe(host)};if(window.requestIdleCallback)requestIdleCallback(go,{timeout:1500});else setTimeout(go,300)}
 if(document.readyState==='complete')setTimeout(arm,600);else window.addEventListener('load',function(){setTimeout(arm,600)},{once:true});
 $$('[data-gt]',view).forEach(function(b){b.addEventListener('click',function(){var id=b.getAttribute('data-gt');if(globeCtl)globeCtl.pickTrip(id);else{queued=id;start()}})});
}
// ---- shared globe targets: arcs, city dots and countries all resolve to trips from the same data ----
function globeIndex(){var real=SEQ.filter(function(t){return t.kind==='trip'&&t.stops.length&&!(t.stops[0]&&t.stops[0].area)});
 var segs=[],cities={},countries={};
 real.forEach(function(t){if(!t.unordered){for(var i=1;i<t.stops.length;i++){var a=t.stops[i-1],b=t.stops[i];if(a.lat===b.lat&&a.lng===b.lng)continue;segs.push({a:[a.lng,a.lat],b:[b.lng,b.lat],c:t.lc,id:t.id})}}
  t.stops.forEach(function(s){if(s.area)return;var k=s.city;if(!cities[k])cities[k]={city:k,lat:s.lat,lng:s.lng,c:t.lc,trips:[]};var C=cities[k];if(C.trips.indexOf(t)<0)C.trips.push(t);if(t.lc==='tg')C.c='tg'});
  t.countries.forEach(function(c){(countries[c]=countries[c]||[]).indexOf(t)<0&&countries[c].push(t)})});
 return {real:real,segs:segs,cities:Object.keys(cities).map(function(k){return cities[k]}),countries:countries}}
function tipTrips(head,ts){return (head?'<i>'+esc(head)+'</i>':'')+ts.map(function(t){return '<a href="#/trip/'+t.id+'"><b>'+esc(t.title)+'</b><span>'+fmtRange(t.start,t.end)+'</span></a>'}).join('')}
// the tooltip: hover shows it (mouse), a click or tap pins it; a single-trip target opens straight away on click, on touch the second tap (or a tap on the tooltip) opens it
function makeGTip(host){var wrap=host.parentNode,el=document.createElement('div');el.className='gtip';el.setAttribute('role','tooltip');wrap.appendChild(el);var cur=null,pinned=false;
 function place(x,y){var r=wrap.getBoundingClientRect(),w=el.offsetWidth,h=el.offsetHeight,lx=x-r.left+14,ly=y-r.top-h-12;if(lx+w>r.width)lx=x-r.left-w-14;if(ly<0)ly=y-r.top+16;el.style.transform='translate('+Math.round(lx)+'px,'+Math.round(ly)+'px)'}
 function key(t){return t?t.kind+':'+t.key:''}
 return {el:el,get:function(){return cur},pinned:function(){return pinned},
  show:function(t,x,y,pin){if(!t){if(!pinned)this.hide();return}if(key(t)!==key(cur)||pin!==pinned){el.innerHTML=t.html;cur=t}pinned=!!pin;el.classList.add('on');el.classList.toggle('pin',pinned);place(x,y)},
  hide:function(){cur=null;pinned=false;el.classList.remove('on','pin')},same:function(t){return t&&cur&&key(t)===key(cur)},destroy:function(){el.remove()}}}
// the side card for a selected trip: cover, title, dates, its one line, and a way in
function globeCardHTML(t){var c=t.cover;return (c?'<a class="gc-ph" href="#/trip/'+t.id+'" tabindex="-1">'+img(c,{alt:'',sizes:'120px'})+'</a>':'')+'<div class="gc-tx"><div class="k">'+esc(engMonth(t))+'</div><b>'+esc(t.title)+'</b><div class="m">'+fmtRange(t.start,t.end)+'</div>'+(t.summary?'<p class="l">'+esc(t.summary)+'</p>':'')+'<a class="gc-go" href="#/trip/'+t.id+'">看这趟旅行'+ARROW+'</a></div>'}
function tripLit(id,cut){var t=BYID[id];return !cut||!t||(t.start||'')<=cut}
function gTarget(kind,key,ts,head){ts=ts.filter(Boolean);if(!ts.length)return null;return {kind:kind,key:key,trips:ts,html:tipTrips(head,ts)}}
// pointer logic common to both globes. api: hit(x,y)->target, rotate(dx,dy), zoom(f)->bool (false at a limit), idle(), busy()
function globeInput(host,api,tip){var surf=api.surface;surf.style.touchAction='pan-y';
 var pts={},drag=null,pinch=null,lastTap=null,vel=[0,0],lt=0,inert=0;
 function rel(e){return [e.clientX,e.clientY]}
 function go(t){if(t&&t.trips.length===1){location.hash='#/trip/'+t.trips[0].id;return true}return false}
 surf.addEventListener('pointerdown',function(e){pts[e.pointerId]=rel(e);var ids=Object.keys(pts);api.busy();cancelAnimationFrame(inert);
  if(ids.length===2){var a=pts[ids[0]],b=pts[ids[1]];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1])};drag=null;return}
  drag={x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,moved:false,id:e.pointerId,type:e.pointerType};vel=[0,0];lt=performance.now()});
 surf.addEventListener('pointermove',function(e){if(pts[e.pointerId])pts[e.pointerId]=rel(e);
  if(pinch){var ids=Object.keys(pts);if(ids.length<2)return;var a=pts[ids[0]],b=pts[ids[1]],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pinch.d>0)api.zoom(d/pinch.d);pinch.d=d;api.busy();return}
  if(drag&&drag.id===e.pointerId){var dx=e.clientX-drag.x,dy=e.clientY-drag.y;
   if(!drag.moved&&drag.type!=='mouse'){ // v9.2j: one finger: vertical swipes belong to the page; rotate only once horizontal clearly dominates
    if(Math.abs(dy)>8&&Math.abs(dy)>=Math.abs(dx)){drag=null;return}if(Math.abs(dx)<10||Math.abs(dx)<1.8*Math.abs(dy))return}
   if(!drag.moved&&Math.abs(dx)+Math.abs(dy)>6){drag.moved=true;tip.hide();try{surf.setPointerCapture(e.pointerId)}catch(_){}}
   if(drag.moved){var now=performance.now(),mx=e.clientX-drag.lx,my=e.clientY-drag.ly,dt=Math.max(8,now-lt);vel=[mx/dt*16,my/dt*16];lt=now;drag.lx=e.clientX;drag.ly=e.clientY;if(drag.type!=='mouse'){my=0;vel[1]=0}api.rotate(mx,my);api.busy()}return}
  if(e.pointerType==='mouse'&&!tip.pinned()){var t=api.hit(e.clientX,e.clientY);surf.style.cursor=t?'pointer':'grab';if(t)tip.show(t,e.clientX,e.clientY,false);else tip.hide();if(t&&t.kind==='trip'&&api.preview)api.preview(t.trips[0].id)}});
 function end(e){var was=drag;delete pts[e.pointerId];if(pinch){if(Object.keys(pts).length<2)pinch=null;api.idle();return}drag=null;
  if(!was||was.id!==e.pointerId){api.idle();return}
  if(was.moved){var v=vel.slice(),f=function(){v[0]*=.92;v[1]*=.92;if(Math.abs(v[0])+Math.abs(v[1])<.15){api.idle();return}api.rotate(v[0],v[1]);inert=requestAnimationFrame(f)};if(performance.now()-lt<80)inert=requestAnimationFrame(f);else api.idle();return}
  if(e.type==='pointercancel'){api.idle();return}
  var t=api.hit(e.clientX,e.clientY);
  if(was.type==='mouse'){if(t&&!go(t))tip.show(t,e.clientX,e.clientY,true);else if(!t)tip.hide()}
  else{if(t&&tip.same(t)&&tip.pinned()){go(t)}else if(t){tip.show(t,e.clientX,e.clientY,true);if(t.kind==='trip'&&api.select)api.select(t.trips[0].id)}else tip.hide()}
  api.idle()}
 surf.addEventListener('pointerup',end);surf.addEventListener('pointercancel',end);
 surf.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse'&&!tip.pinned()&&!drag)tip.hide()});
 tip.el.addEventListener('click',function(e){var a=e.target.closest('a');if(a)return;var t=tip.get();if(t&&t.trips.length===1)location.hash='#/trip/'+t.trips[0].id});
 // wheel: zoom only over the globe itself; at the zoom limit the page scrolls on
 host.addEventListener('wheel',function(e){if(!api.over(e.clientX,e.clientY))return;var f=Math.exp(-e.deltaY*.0015);if(api.zoom(f)){e.preventDefault();api.busy();api.idle()}},{passive:false})}
// the time scrubber under the home globe: drag to light the routes up to a date; each trip is a small stop on the line
function setupScrub(view,G){var el=$('#gscrub',view);if(!el)return;
 var ts=SEQ.filter(function(t){return t.kind==='trip'&&t.start&&t.stops.length&&!(t.stops[0]&&t.stops[0].area)}).slice().sort(function(a,b){return a.start<b.start?-1:1});if(!ts.length)return;
 var y0=+ts[0].start.slice(0,4),y1=+ts[ts.length-1].start.slice(0,4),T0=Date.UTC(y0,0,1),T1=Date.UTC(y1+1,0,1);
 function fr(d){var p=d.split('-');return (Date.UTC(+p[0],+p[1]-1,+(p[2]||1))-T0)/(T1-T0)}
 function iso(f){var d=new Date(T0+f*(T1-T0));return d.toISOString().slice(0,10)}
 var h='<div class="gs-tr"><i class="gs-fill"></i>';for(var y=y0;y<=y1+1;y++)h+='<span class="gs-tk" style="left:'+((Date.UTC(y,0,1)-T0)/(T1-T0)*100).toFixed(2)+'%">'+(y<=y1?'<em class="latin">'+y+'</em>':'')+'</span>';
 ts.forEach(function(t){h+='<button type="button" class="gs-st '+t.lc+'" data-id="'+t.id+'" style="left:'+(fr(t.start)*100).toFixed(2)+'%" aria-label="'+esc(t.title)+'"></button>'});
 h+='<b class="gs-h" role="slider" tabindex="0" aria-label="时间" aria-valuemin="0" aria-valuemax="100"></b></div>';el.innerHTML=h;el.classList.add('on');
 var tr=$('.gs-tr',el),fill=$('.gs-fill',el),hd=$('.gs-h',el),cur=1,play=0,alive=true,gen=routeGen;
 function set(f,user){cur=Math.max(0,Math.min(1,f));var p=(cur*100).toFixed(2)+'%';fill.style.transform='scaleX('+cur.toFixed(4)+')';hd.style.left=p;hd.setAttribute('aria-valuenow',Math.round(cur*100));
  var c=cur>=.999?null:iso(cur);G.setTime(c);$$('.gs-st',el).forEach(function(b){b.classList.toggle('lit',!c||b.style.left&&parseFloat(b.style.left)/100<=cur+1e-4)});if(user&&play){cancelAnimationFrame(play);play=0}}
 function fromX(x){var r=tr.getBoundingClientRect();return (x-r.left)/r.width}
 var dr=null;
 // a tap or click picks the nearest trip stop (stops sit close together on phones); a drag scrubs
 var dx0=0,dmv=false;function nearest(x){var best=null,bd=12;$$('.gs-st',el).forEach(function(b){var r=b.getBoundingClientRect(),d=Math.abs(r.left+r.width/2-x);if(d<bd){bd=d;best=b}});return best}
 tr.addEventListener('pointerdown',function(e){dr=e.pointerId;dx0=e.clientX;dmv=false;try{tr.setPointerCapture(e.pointerId)}catch(_){}G.busy();e.preventDefault()});
 tr.addEventListener('pointermove',function(e){if(dr!==e.pointerId)return;if(!dmv&&Math.abs(e.clientX-dx0)>4)dmv=true;if(dmv)set(fromX(e.clientX),true)});
 function up(e){if(dr!==e.pointerId)return;dr=null;if(!dmv&&e.type==='pointerup'){var b=nearest(e.clientX);if(b)pickStop(b);else set(fromX(e.clientX),true)}G.idle()}tr.addEventListener('pointerup',up);tr.addEventListener('pointercancel',up);
 hd.addEventListener('keydown',function(e){var d=e.key==='ArrowRight'?.02:e.key==='ArrowLeft'?-.02:0;if(d){set(cur+d,true);e.preventDefault()}});
 function pickStop(b){var t=BYID[b.getAttribute('data-id')];if(!t)return;set(fr(t.end||t.start)+.002,true);G.pickTrip(t.id)}
 $$('.gs-st',el).forEach(function(b){b.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){pickStop(b);e.preventDefault()}})});
 set(1);
 // once per visit, the first time the globe is in view: the routes draw themselves in order, then the line rests at 'all'
 var seen=false;try{seen=sessionStorage.getItem('fp-scrub')==='1'}catch(e){}
 if(!seen&&!RM){var io=new IntersectionObserver(function(es){if(!es[0].isIntersecting)return;io.disconnect();try{sessionStorage.setItem('fp-scrub','1')}catch(e){}
   var t0=0,D=9000;set(0);function f(now){if(!alive||gen!==routeGen)return;if(!t0)t0=now;var k=Math.min(1,(now-t0)/D);set(k);if(k<1)play=requestAnimationFrame(f);else{play=0;set(1)}}setTimeout(function(){play=requestAnimationFrame(f)},700)},{threshold:.4});io.observe(el);homeIO.push(io)}
 homeIO.push({disconnect:function(){alive=false;cancelAnimationFrame(play)}});
 if(/[?&]qa\b/.test(location.search))window.__scrub={set:function(f){set(f,true)},cur:function(){return cur}}}
var EXETER={lat:50.7184,lng:-3.5339};
function makeGlobeGL(host,view){
 var W=Math.min(host.clientWidth||600,1200),card=$('#glcard',view),alive=true;
 var visited=allVisited();
 var X=globeIndex(),COL={solo:'rgba(154,144,132,.85)',zx:'rgba(138,154,162,.85)',tg:'rgba(201,162,122,1)'};
 var arcs=[];X.segs.forEach(function(s){var o={startLat:s.a[1],startLng:s.a[0],endLat:s.b[1],endLng:s.b[0],id:s.id,c:s.c};arcs.push(o);arcs.push({startLat:o.startLat,startLng:o.startLng,endLat:o.endLat,endLng:o.endLng,id:s.id,c:s.c,hit:true})});
 var hfT=0,haT=0,lastF=null,mX=0,mY=0,hovF=null,hovA=null,selId=null,sel=null,clickT=0,dblAt=0,tip=makeGTip(host);
 function cap(f){var n=f.properties.name;return f===hovF||n===sel?'#8A7054':visited[n]?'#5C4A38':'#1C1916'}
 var cut=null;function arcCol(d){if(d.hit||!tripLit(d.id,cut))return 'rgba(0,0,0,0)';var c=COL[d.c];if(selId)return d.id===selId?c.replace(/[\d.]+\)$/,'1)'):c.replace(/[\d.]+\)$/,'.18)');return d.id===hovA?c.replace(/[\d.]+\)$/,'1)'):c}
 var g=Globe({animateIn:false,rendererConfig:{antialias:true,alpha:true,powerPreference:'low-power'}})(host)
  .width(W).height(W).backgroundColor('rgba(0,0,0,0)').showAtmosphere(true).atmosphereColor('#3a322c').atmosphereAltitude(0.12).showGraticules(false)
  .polygonsData(WORLD.features).polygonCapColor(cap).polygonSideColor(function(){return 'rgba(0,0,0,0)'}).polygonStrokeColor(function(f){return visited[f.properties.name]?'rgba(237,230,218,.34)':'rgba(237,230,218,.06)'})
  .polygonAltitude(function(f){var n=f.properties.name;return f===hovF||n===sel?0.026:visited[n]?0.021:0.003}).polygonsTransitionDuration(0)
  .onPolygonClick(function(f,ev){ // v9.2j: globe.gl drops its hover on click, so take the country from the click itself
   if(!f||!ev||!visited[f.properties.name]||tip.pinned())return;if(Math.abs(ev.clientX-dX)+Math.abs(ev.clientY-dY)>6)return;
   var n=f.properties.name;tip.show(gTarget('country',n,X.countries[n]||[],n),ev.clientX,ev.clientY,true)})
  .onPolygonHover(function(f){var n=f&&visited[f.properties.name]?f:null;clearTimeout(hfT);if(n){lastF={f:n,x:mX,y:mY};if(n!==hovF){hovF=n;g.polygonCapColor(cap)}}else hfT=setTimeout(function(){if(hovF){hovF=null;g.polygonCapColor(cap)}},300)})
  .arcsData(arcs).arcColor(arcCol).arcStroke(function(d){return d.hit?1.5:d.c==='tg'?.6:.38}).arcAltitudeAutoScale(.32).arcsTransitionDuration(0).arcDashLength(1).arcDashGap(0)
  .onArcHover(function(d){var id=d?d.id:null;clearTimeout(haT);if(id){if(id!==hovA){hovA=id;g.arcColor(arcCol)}}else haT=setTimeout(function(){if(hovA){hovA=null;g.arcColor(arcCol)}},300)})
  .pointsData(X.cities).pointLat('lat').pointLng('lng').pointColor(function(d){return COL[d.c]}).pointAltitude(.012).pointRadius(.11).pointsMerge(true).pointsTransitionDuration(0);
 try{g.renderer().setPixelRatio(W>760?1:Math.min(1.5,window.devicePixelRatio||1))}catch(e){}
 try{var m=g.globeMaterial();m.color.set('#12100E');if(m.emissive)m.emissive.set('#090807');m.shininess=2}catch(e){}
 var ctl=g.controls();ctl.autoRotate=!RM;ctl.autoRotateSpeed=.35;ctl.enableZoom=false;ctl.enablePan=false;ctl.enableRotate=false; // rotation is ours (shared input), so touch keeps pan-y
 g.pointOfView({lat:22,lng:18,altitude:1.5},0);
 var MINA=.9,MAXA=3.2,idleT=0;
 function center(){var p=g.pointOfView();return [p.lng,p.lat]}
 function scr(c){var r=host.getBoundingClientRect(),q=g.getScreenCoords(c.lat,c.lng,.012);return q?[q.x+r.left,q.y+r.top]:null}
 function hit(x,y){var r=host.getBoundingClientRect(),cc=center(),best=null,bd=144;
  X.cities.forEach(function(c){if(d3.geoDistance([c.lng,c.lat],cc)>Math.PI/2-.12)return;var q=scr(c);if(!q)return;var d=(q[0]-x)*(q[0]-x)+(q[1]-y)*(q[1]-y);if(d<bd){bd=d;best=c}});
  if(best)return gTarget('city',best.city,best.trips,best.city);
  if(hovA)return gTarget('trip',hovA,[BYID[hovA]]);
  var f=hovF||(lastF&&Math.abs(lastF.x-x)+Math.abs(lastF.y-y)<12?lastF.f:null);if(!f){var rr=host.getBoundingClientRect(),ll=g.toGlobeCoords(x-rr.left,y-rr.top);if(ll)f=WORLD.features.filter(function(z){return visited[z.properties.name]&&d3.geoContains(z,[ll.lng,ll.lat])})[0]||null} // globe.gl forgets its hover while the button is down
  if(f)return gTarget('country',f.properties.name,X.countries[f.properties.name]||[],f.properties.name);return null}
 function over(x,y){var r=host.getBoundingClientRect();return !!g.toGlobeCoords(x-r.left,y-r.top)}
 host.addEventListener('pointermove',function(e){mX=e.clientX;mY=e.clientY},true);
var dX=-99,dY=-99;host.addEventListener('pointerdown',function(e){dX=e.clientX;dY=e.clientY},true);
 function busy(){ctl.autoRotate=false;clearTimeout(idleT)}
 function idle(){clearTimeout(idleT);idleT=setTimeout(function(){if(!alive||RM)return;if(tip.pinned())tip.hide();ctl.autoRotate=true},4000)}
 var prevT=0;function preview(id){var t=BYID[id];if(!t||card.getAttribute('data-id')===id)return;clearTimeout(prevT);prevT=setTimeout(function(){showCard(globeCardHTML(t),'trip');card.setAttribute('data-id',id)},160)}
 globeInput(host,{surface:g.renderer().domElement,hit:hit,over:over,busy:busy,idle:idle,preview:preview,select:function(id){pickTrip(id)},
  rotate:function(dx,dy){var p=g.pointOfView(),k=p.altitude*28/ (W/2);g.pointOfView({lat:Math.max(-75,Math.min(75,p.lat+dy*k)),lng:p.lng-dx*k,altitude:p.altitude},0)},
  zoom:function(f){var p=g.pointOfView(),a=Math.max(MINA,Math.min(MAXA,p.altitude/f));if(Math.abs(a-p.altitude)<1e-3)return false;g.pointOfView({lat:p.lat,lng:p.lng,altitude:a},0);return true}},tip);
 function showCard(h,kind){card.innerHTML='<button class="gx" aria-label="关闭">'+icon('x')+'</button>'+h;card.className='gl-card on'+(kind?' gc-'+kind:'');card.removeAttribute('data-id');$('.gx',card).onclick=function(){card.classList.remove('on');sel=null;selId=null;g.polygonCapColor(cap);g.arcColor(arcCol)}}
 var litN=-1;function setTime(c){cut=c;var n=X.real.filter(function(t){return tripLit(t.id,cut)}).length;if(n!==litN){litN=n;g.arcColor(arcCol);g.pointColor(function(d){return d.trips.some(function(t){return tripLit(t.id,cut)})?COL[d.c]:'rgba(0,0,0,0)'})}}
 function spanOf(t){var m=0;t.stops.forEach(function(a){t.stops.forEach(function(b){m=Math.max(m,d3.geoDistance([a.lng,a.lat],[b.lng,b.lat]))})});return m*180/Math.PI}
 function pickTrip(id){var t=BYID[id];if(!t||!t.stops.length)return;busy();selId=id;g.arcColor(arcCol);
  var c=d3.geoCentroid({type:'MultiPoint',coordinates:t.stops.map(function(s){return [s.lng,s.lat]})}),sp=spanOf(t);
  var alt=sp<5?1.4:sp<12?1.45:sp<30?1.6:2.0; // never closer than the whole-sphere view allowsg.pointOfView({lat:c[1],lng:c[0],altitude:alt},1300);
  showCard(globeCardHTML(t),'trip');idle()}
 function onDbl(e){var r=host.getBoundingClientRect(),c=g.toGlobeCoords(e.clientX-r.left,e.clientY-r.top);if(!c)return;
  if(d3.geoDistance([c.lng,c.lat],[EXETER.lng,EXETER.lat])*180/Math.PI>1.6)return;dblAt=performance.now();busy();tip.hide();
  g.pointOfView({lat:EXETER.lat,lng:EXETER.lng,altitude:1},1600);
  g.ringsData([EXETER]).ringColor(function(){return function(t){return 'rgba(201,162,122,'+(1-t)+')'}}).ringMaxRadius(1.4).ringPropagationSpeed(.7).ringRepeatPeriod(1400);
  showCard('<b>埃克塞特</b><div class="m">很多条路，是从这里出发的。</div>');setTimeout(function(){if(alive)g.ringsData([])},7000);idle()}
 host.addEventListener('dblclick',onDbl);
 if(/[?&]qa\b/.test(location.search)){window.__globe=g;window.__gpick=pickTrip;window.__gq={kind:'gl',lit:function(){return litN},scr:function(city){var c=X.cities.filter(function(x){return x.city===city})[0];return c&&scr(c)},look:function(lng,lat){g.pointOfView({lat:lat,lng:lng,altitude:g.pointOfView().altitude},0)},state:function(){var p=g.pointOfView();return {lng:p.lng,lat:p.lat,z:p.altitude,auto:ctl.autoRotate}}}}
 var vis=true,scrl=false,run=true,scrT=0;
 function sync(){var want=alive&&vis&&!scrl&&!document.hidden;if(want===run)return;run=want;if(want)g.resumeAnimation();else g.pauseAnimation()}
 var io=new IntersectionObserver(function(es){es.forEach(function(e){vis=e.isIntersecting&&e.intersectionRatio>.12;sync()})},{threshold:[0,.12,.3]});io.observe(host);homeIO.push(io);
 function onScr(){if(!vis)return;scrl=true;sync();clearTimeout(scrT);scrT=setTimeout(function(){scrl=false;sync()},160)}window.addEventListener('scroll',onScr,{passive:true});
 function vh(){sync()}document.addEventListener('visibilitychange',vh);
 function rs(){var w=Math.min(host.clientWidth||600,1200);if(w!==W){W=w;g.width(W).height(W)}}window.addEventListener('resize',rs);
 return {pickTrip:pickTrip,setTime:setTime,busy:busy,idle:idle,gl:g,destroy:function(){alive=false;clearTimeout(clickT);clearTimeout(scrT);clearTimeout(idleT);tip.destroy();window.removeEventListener('scroll',onScr);window.removeEventListener('resize',rs);document.removeEventListener('visibilitychange',vh);host.removeEventListener('dblclick',onDbl);try{g.pauseAnimation();g._destructor()}catch(e){}host.innerHTML=''}};
}
function makeFlatGlobe(host,view){ // canvas globe: phones and software WebGL
 host.classList.add('flat');
 var cv=document.createElement('canvas');host.appendChild(cv);var ctx=cv.getContext('2d',{willReadFrequently:true}); // CPU canvas: a GPU canvas is promoted to a layer and drags every overlapping trip card into its own layer
 var W=0,H=0,dpr=Math.min(1.5,window.devicePixelRatio||1);
 var proj=d3.geoOrthographic().clipAngle(90).precision(.8),path=d3.geoPath(proj,ctx),grat=d3.geoGraticule10();
 var rot=[-18,-22,0],baseScale=1,zoom=1,ZMIN=1,ZMAX=4,auto=!RM,lastUser=-1e9,visible=true,raf=0,dirty=true,alive=true,held=false;
 var visited=allVisited();
 var feats=WORLD.features,vis=feats.filter(function(f){return visited[f.properties.name]}),oth=feats.filter(function(f){return !visited[f.properties.name]});
 var X=globeIndex(),allSegs=X.segs;
 var sel=null,selP=1,hover=null,hovT=null,card=$('#glcard',view),tip=makeGTip(host);
 function size(){var w=host.clientWidth||600;W=w;H=w;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+'px';cv.style.height=H+'px';baseScale=W/2-6;proj.translate([W/2,H/2]);dirty=true}
 size();
 function centerLL(){return [-rot[0],-rot[1]]}
 function draw(){proj.rotate(rot).scale(baseScale*zoom);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
  ctx.beginPath();path({type:'Sphere'});ctx.fillStyle='#0E0C0B';ctx.fill();
  ctx.beginPath();path(grat);ctx.strokeStyle='rgba(237,230,218,.04)';ctx.lineWidth=.6;ctx.stroke();
  ctx.beginPath();oth.forEach(function(f){path(f)});ctx.fillStyle='#1C1916';ctx.fill();
  ctx.beginPath();vis.forEach(function(f){path(f)});ctx.fillStyle='#5C4A38';ctx.fill();
  if(hover){ctx.beginPath();path(hover);ctx.fillStyle='#8A7054';ctx.fill()}
  ctx.beginPath();feats.forEach(function(f){path(f)});ctx.strokeStyle='rgba(18,16,14,.75)';ctx.lineWidth=.5;ctx.stroke();
  ['solo','zx','tg'].forEach(function(c){ctx.beginPath();allSegs.forEach(function(s){if(s.c===c&&tripLit(s.id,cut))path({type:'LineString',coordinates:[s.a,s.b]})});ctx.strokeStyle='rgba('+GCOL[c]+','+(sel?.16:.55)+')';ctx.lineWidth=c==='tg'?1.1:.8;ctx.stroke()});
  var hl=sel||(hovT&&BYID[hovT]);
  if(hl){var st=hl.stops,n=st.length-1,c=GCOL[hl.lc],P=sel?selP:1;ctx.beginPath();
   for(var i=1;i<=n;i++){var lp=Math.max(0,Math.min(1,P*n-(i-1)));if(lp<=0)break;var a=[st[i-1].lng,st[i-1].lat],b=[st[i].lng,st[i].lat];path({type:'LineString',coordinates:[a,lp<1?d3.geoInterpolate(a,b)(lp):b]})}
   ctx.strokeStyle='rgba('+c+',1)';ctx.lineWidth=2;ctx.stroke()}
  var cc=centerLL();X.cities.forEach(function(s){if(d3.geoDistance([s.lng,s.lat],cc)>Math.PI/2-.05)return;if(cut&&!s.trips.some(function(t){return tripLit(t.id,cut)}))return;var q=proj([s.lng,s.lat]);ctx.beginPath();ctx.arc(q[0],q[1],2.4,0,6.283);ctx.fillStyle='rgba('+GCOL[s.c]+',.95)';ctx.fill()});
  ctx.beginPath();path({type:'Sphere'});ctx.strokeStyle='rgba(237,230,218,.16)';ctx.lineWidth=1;ctx.stroke();
  dirty=false}
 var lt=0;
 function loop(now){raf=0;if(!alive)return;var dt=lt?Math.min(64,now-lt):16;lt=now;
  if(auto&&!fly&&!held&&now-lastUser>4000){rot[0]+=dt*0.004;dirty=true;if(tip.pinned())tip.hide()}
  if(fly){var t=Math.min(1,(now-fly.t0)/fly.d),e=d3.easeCubicInOut(t);rot=[fly.r0[0]+fly.dl*e,fly.r0[1]+(fly.r1[1]-fly.r0[1])*e,0];zoom=fly.z0+(fly.z1-fly.z0)*e;dirty=true;if(t>=1){var cb=fly.cb;fly=null;if(cb)cb()}}
  if(selAnim){selP=Math.min(1,(now-selAnim)/1100);if(selP>=1)selAnim=0;dirty=true}
  if(dirty)draw();
  if(visible&&!scr&&!document.hidden&&(auto||fly||selAnim||dirty))raf=requestAnimationFrame(loop);else lt=0}
 var scr=false,scrT=0;function onScr(){if(!visible)return;scr=true;clearTimeout(scrT);scrT=setTimeout(function(){scr=false;kick()},160)}window.addEventListener('scroll',onScr,{passive:true});
 function kick(){if(!raf&&visible&&!scr&&!document.hidden){lt=0;raf=requestAnimationFrame(loop)}}
 var fly=null,selAnim=0;
 function flyTo(ll,z,cb){var r1=[-ll[0],-ll[1]];var dl=((r1[0]-rot[0])%360+540)%360-180;fly={t0:performance.now(),d:1300,r0:rot.slice(),r1:r1,dl:dl,z0:zoom,z1:z,cb:cb};kick()}
 function spanOf(t){var m=0;t.stops.forEach(function(a){t.stops.forEach(function(b){m=Math.max(m,d3.geoDistance([a.lng,a.lat],[b.lng,b.lat]))})});return m*180/Math.PI}
 function pickTrip(id){var t=BYID[id];if(!t||!t.stops.length)return;sel=t;selP=0;selAnim=0;lastUser=performance.now();
  var c=d3.geoCentroid({type:'MultiPoint',coordinates:t.stops.map(function(s){return [s.lng,s.lat]})}),sp=spanOf(t);
  var z=sp<5?1.6:sp<9?1.5:sp<16?1.4:sp<32?1.25:1.05; // capped near 1.6x so the region keeps its neighbours and the sphere edge
  showCard(globeCardHTML(t),'trip');
  flyTo(c,z,function(){selAnim=performance.now();kick()})}
 function showCard(h,kind){card.innerHTML='<button class="gx" aria-label="关闭">'+icon('x')+'</button>'+h;card.className='gl-card on'+(kind?' gc-'+kind:'');card.removeAttribute('data-id');$('.gx',card).onclick=function(){card.classList.remove('on');sel=null;dirty=true;kick()}}
 var cut=null,litN=-1;function setTime(c){cut=c;var n=X.real.filter(function(t){return tripLit(t.id,cut)}).length;if(n!==litN){litN=n;dirty=true;kick()}}
 var prevT=0;function preview(id){var t=BYID[id];if(!t||card.getAttribute('data-id')===id)return;clearTimeout(prevT);prevT=setTimeout(function(){showCard(globeCardHTML(t),'trip');card.setAttribute('data-id',id)},160)}
 function local(x,y){var b=cv.getBoundingClientRect();return [x-b.left,y-b.top]}
 function front(ll){return d3.geoDistance(ll,centerLL())<Math.PI/2-.04}
 function segD(p,a,b){var dx=b[0]-a[0],dy=b[1]-a[1],L=dx*dx+dy*dy,t=L?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/L)):0;return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)}
 function hitArc(p){var best=null,bd=8;allSegs.forEach(function(s){var ip=d3.geoInterpolate(s.a,s.b),prev=null;for(var k=0;k<=8;k++){var ll=ip(k/8);if(!front(ll)){prev=null;continue}var q=proj(ll);if(prev){var d=segD(p,prev,q);if(d<bd){bd=d;best=s}}prev=q}});return best}
 function hit(x,y){var p=local(x,y),best=null,bd=144;
  X.cities.forEach(function(c){if(!front([c.lng,c.lat]))return;var q=proj([c.lng,c.lat]),d=(q[0]-p[0])*(q[0]-p[0])+(q[1]-p[1])*(q[1]-p[1]);if(d<bd){bd=d;best=c}});
  if(best)return gTarget('city',best.city,best.trips,best.city);
  var s=hitArc(p);if(s)return gTarget('trip',s.id,[BYID[s.id]]);
  var ll=proj.invert(p);if(ll&&front(ll))for(var i=0;i<vis.length;i++)if(d3.geoContains(vis[i],ll)){var n=vis[i].properties.name;return gTarget('country',n,X.countries[n]||[],n)}
  return null}
 function over(x,y){var p=local(x,y);return Math.hypot(p[0]-W/2,p[1]-H/2)<=baseScale*zoom}
 // hover look: the hovered country and route light up
 cv.addEventListener('pointermove',function(e){if(e.pointerType!=='mouse'||held)return;var p=local(e.clientX,e.clientY),s=hitArc(p),ll=proj.invert(p),f=null;if(!s&&ll&&front(ll))for(var i=0;i<vis.length;i++)if(d3.geoContains(vis[i],ll)){f=vis[i];break}
  var nt=s?s.id:null;if(nt!==hovT||f!==hover){hovT=nt;hover=f;dirty=true;kick()}});
 cv.addEventListener('pointerleave',function(){if(hover||hovT){hover=null;hovT=null;dirty=true;kick()}});
 globeInput(host,{surface:cv,hit:hit,over:over,preview:preview,select:function(id){pickTrip(id)},busy:function(){held=true;lastUser=performance.now();fly=null},idle:function(){held=false;lastUser=performance.now();kick()},
  rotate:function(dx,dy){var k=75/(baseScale*zoom);rot=[rot[0]+dx*k,Math.max(-75,Math.min(75,rot[1]-dy*k)),0];dirty=true;kick()},
  zoom:function(f){var z=Math.max(ZMIN,Math.min(ZMAX,zoom*f));if(Math.abs(z-zoom)<1e-3)return false;zoom=z;dirty=true;kick();return true}},tip);
 if(/[?&]qa\b/.test(location.search)){window.__gpick=pickTrip;window.__gq={kind:'flat',lit:function(){return litN},scr:function(city){var c=X.cities.filter(function(x){return x.city===city})[0];if(!c||!front([c.lng,c.lat]))return null;var q=proj([c.lng,c.lat]),b=cv.getBoundingClientRect();return [q[0]+b.left,q[1]+b.top]},look:function(lng,lat){rot=[-lng,-lat,0];lastUser=performance.now();dirty=true;draw()},state:function(){return {lng:-rot[0],lat:-rot[1],z:zoom,auto:auto&&!held&&performance.now()-lastUser>4000}}}}
 var io=new IntersectionObserver(function(es){es.forEach(function(e){visible=e.isIntersecting;if(visible)kick()})});io.observe(host);homeIO.push(io);
 function vh(){if(!document.hidden)kick()}document.addEventListener('visibilitychange',vh);
 draw();kick();
 return {pickTrip:pickTrip,setTime:setTime,busy:function(){held=true;lastUser=performance.now()},idle:function(){held=false;lastUser=performance.now();kick()},resize:function(){size();kick()},destroy:function(){alive=false;if(raf)cancelAnimationFrame(raf);clearTimeout(scrT);tip.destroy();window.removeEventListener('scroll',onScr);document.removeEventListener('visibilitychange',vh)}};
}
