(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var RM=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function isMob(){return window.innerWidth<=860}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function p2(n){return String(n).padStart(2,'0')}
var TOGETHER_FROM='2024-12-22',MET='2024-10-13';
var MONTH_EN=['January','February','March','April','May','June','July','August','September','October','November','December'];
var COUNTRY_EN={'韩国':'Korea','法国':'France','冰岛':'Iceland','葡萄牙':'Portugal','西班牙':'Spain','瑞士':'Switzerland','泰国':'Thailand','摩洛哥':'Morocco','英国':'United Kingdom','意大利':'Italy','梵蒂冈':'Vatican City','希腊':'Greece','马来西亚':'Malaysia','中国':'China','新加坡':'Singapore','俄罗斯':'Russia','印度尼西亚':'Indonesia'};
// covers: scenery first, or people small in the frame; never selfies or two big faces. 'MAP' = use the route map as the hero.
var PHOTO_META = {
  'honeymoon/11': { country: '马来西亚', place: '吉隆坡' },
  'honeymoon/14': { country: '马来西亚', place: '吉隆坡' },
  'malaysia/03': { country: '马来西亚', place: '吉隆坡' },
  'honeymoon/06': { country: '泰国', place: '' },
  'thailand/03': { country: '泰国', place: '曼谷' },
};
var MIXED_FOLDERS = ['thailand', 'malaysia', 'honeymoon'];
function photoCountry(pk, ph, p){
  var folder = String(pk).split('/')[0];
  if (MIXED_FOLDERS.indexOf(folder) !== -1) {
    var meta = PHOTO_META[pk];
    return meta ? meta.country : null;
  }
  return (ph && ph.country) || (p && p.country) || null;
}
function photoPlace(pk, ph, p){
  var folder = String(pk).split('/')[0];
  if (MIXED_FOLDERS.indexOf(folder) !== -1) {
    var meta = PHOTO_META[pk];
    return meta && typeof meta.place === 'string' ? meta.place : '';
  }
  return (ph && ph.place) || (p && p.name) || '';
}
var LEAD={'2026-korea':'korea/02','2024-paris-winter':'paris24/03','2024-iceland':'iceland/02','2024-iberia-may':'iberia-t56-lisbon/01','2024-switzerland':'switzerland/01','2024-thailand':'thailand/04','2024-cornwall-zx':'cornwall-zx/03','2024-highlands-zx':'highlands/07','2024-scotland-dec-zx':'scotland-dec/03','2024-morocco':'morocco/07','2025-wales':'wales/06','2025-france':'france/06','2025-italy-spring':'vatican/02','2025-greece':'greece/04','2025-spain-summer':'spain/12','2025-car-day':'birmingham/06','2024-uk-loop':'ukloop24/04','2024-cornwall':'cornwall24/04','2025-family-uk':'london-dec25/07','2026-singapore-zx':'singapore/01','2026-sea-honeymoon':'honeymoon/14','2026-moscow-zx':'moscow/05','2026-jakarta-zx':'jakarta/02','2026-seoul-mom':'seoul-mom/09','edinburgh-again':'edinburgh/04','uk-years':'london/06','china':'qinhuangdao/04'};
var SECOND={'2026-korea':'korea/03','2024-paris-winter':'paris24/04','2024-iceland':'iceland/04','2024-iberia-may':'iberia-t56-barcelona/01','2024-switzerland':'switzerland/05','2024-thailand':'thailand/05','2024-cornwall-zx':'cornwall-zx/06','2024-highlands-zx':'highlands/05','2024-scotland-dec-zx':'scotland-dec/06','2024-morocco':'morocco/02','2025-wales':'wales2/02','2025-italy-spring':'italy/02','2025-greece':'greece/06','2025-spain-summer':'spain/06','2025-car-day':'birmingham/03','2025-family-uk':'london-dec25/03','2026-singapore-zx':'singapore/02','2026-sea-honeymoon':'honeymoon/09','2026-moscow-zx':'moscow/02','2026-jakarta-zx':'jakarta/03','2026-seoul-mom':'seoul-mom/02'};

/* ---------- icons ---------- */
var IC={
 plane:'<path d="M3 13.5l7.5-2.2V5.6c0-.9.7-1.6 1.5-1.6s1.5.7 1.5 1.6v5.7l7.5 2.2v1.8l-7.5-1.6v4.4l2.2 1.7V21L12 20.1 9.3 21v-1.2l2.2-1.7v-4.4L3 15.3z"/>',
 train:'<rect x="6.5" y="3.5" width="11" height="12.5" rx="3"/><path d="M6.5 10h11M9 18.5 7.5 20.5M15 18.5l1.5 2"/><circle cx="9.5" cy="13" r=".6"/><circle cx="14.5" cy="13" r=".6"/>',
 bus:'<rect x="4.5" y="4" width="15" height="13" rx="2"/><path d="M4.5 11h15M8 17v2M16 17v2"/><circle cx="8" cy="14" r=".6"/><circle cx="16" cy="14" r=".6"/>',
 car:'<path d="M4 15.5l1.4-4.6A2 2 0 0 1 7.3 9.5h9.4a2 2 0 0 1 1.9 1.4l1.4 4.6v2.5H4z"/><circle cx="7.5" cy="18" r="1.4"/><circle cx="16.5" cy="18" r="1.4"/>',
 boat:'<path d="M3.5 15h17l-2.4 4.2H5.9zM6.5 15V9.5h11V15M12 9.5V5.5"/>',
 walk:'<circle cx="13" cy="4.5" r="1.4"/><path d="M10.5 20.5l1.8-5.5 2.7 2.7v2.8M8.8 11.8l3-3.6 3 2 1.9 2.8M12.3 15l-.9-4.4"/>',
 cable:'<path d="M3 5l18 4M12 7v3"/><rect x="8" y="10" width="8" height="8.5" rx="1.5"/><path d="M8 14h8"/>',
 sun:'<circle cx="9" cy="9" r="3"/><path d="M9 3v1.3M9 13.7V15M3 9h1.3M13.7 9H15M4.8 4.8l.9.9M12.3 12.3l.9.9M4.8 13.2l.9-.9M12.3 5.7l.9-.9"/><path d="M11.5 19.5h6.2a3 3 0 0 0 .3-6 4 4 0 0 0-7.6 1.2 2.4 2.4 0 0 0 1.1 4.8z"/>',
 bed:'<path d="M3.5 18.5v-11M3.5 14.5h17v4M20.5 14.5v-2a3 3 0 0 0-3-3h-6.5v5"/><circle cx="7.3" cy="11.7" r="1.6"/>',
 pin:'<path d="M12 20.5s6-5.6 6-10.3a6 6 0 0 0-12 0c0 4.7 6 10.3 6 10.3z"/><circle cx="12" cy="10.2" r="2"/>',
 food:'<path d="M7 3.5v6.5a2 2 0 0 0 2 2v8.5M11 3.5V10M9 3.5V8M16.5 20.5v-17c-2 1.4-3 4-3 7 0 2.6 1 4 3 4"/>',
 people:'<circle cx="9" cy="8" r="2.6"/><path d="M4 19c.4-3.2 2.4-5 5-5s4.6 1.8 5 5"/><circle cx="16.5" cy="9" r="2.1"/><path d="M15.2 14.2c2.4-.3 4.3 1.3 4.8 4.3"/>',
 shuffle:'<path d="M3 7h3.5c4.5 0 5.5 10 11 10H21M3 17h3.5c1.9 0 3.1-1.6 4.1-3.6M13.5 9.6c1-1.5 2.2-2.6 4-2.6H21M18.5 4.5 21 7l-2.5 2.5M18.5 14.5 21 17l-2.5 2.5"/>',
 arrow:'<path d="M1 4h16M13.5 .8 17 4l-3.5 3.2"/>',
 left:'<path d="M15 5l-7 7 7 7"/>',right:'<path d="M9 5l7 7-7 7"/>',x:'<path d="M6 6l12 12M18 6 6 18"/>'
};
function icon(n,cls){var vb=n==='arrow'?'0 0 18 8':'0 0 24 24';return '<svg class="'+(cls||'')+'" viewBox="'+vb+'" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[n]+'</svg>'}
function transIcon(by){by=by||'';
 if(/飞/.test(by))return 'plane'; if(/船|渡|轮/.test(by))return 'boat'; if(/缆/.test(by))return 'cable';
 if(/大巴|巴士|公交/.test(by))return 'bus'; if(/自驾|租车|开车|出租|车$/.test(by)&&!/火车|电车/.test(by))return 'car';
 if(/火车|高铁|快铁|地铁|铁|电车|欧洲之星/.test(by))return 'train'; if(/步行|走/.test(by))return 'walk'; return 'train'}

/* ---------- dates ---------- */
function D(s){var a=String(s).split('-');return new Date(+a[0],(+a[1]||1)-1,+a[2]||1)}
function daysIncl(a,b){return Math.round((D(b)-D(a))/864e5)+1}
function fmtRange(a,b){if(!a)return '';var x=a.split('-'),y=(b||a).split('-');
 if(!x[1])return x[0]+(y[0]!==x[0]?' — '+y[0]:'');
 var s=x[0]+'.'+x[1]+'.'+x[2];if(!b||a===b)return s;
 if(y[0]!==x[0])return s+' — '+y[0]+'.'+y[1]+'.'+y[2];return s+' — '+y[1]+'.'+y[2]}
var WK='日一二三四五六';
function fmtDay(s){var d=D(s);return p2(d.getMonth()+1)+'.'+p2(d.getDate())+' · 周'+WK[d.getDay()]}
function hav(a,b){var R=6371,r=Math.PI/180,dl=(b[1]-a[1])*r,dn=(b[0]-a[0])*r,x=Math.sin(dl/2)*Math.sin(dl/2)+Math.cos(a[1]*r)*Math.cos(b[1]*r)*Math.sin(dn/2)*Math.sin(dn/2);return 2*R*Math.asin(Math.sqrt(x))}
function fmtNum(n){return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,',')}

/* ---------- data ---------- */
var TRIPS=[],BYID={},PL={},WORLD=null,DETAIL=null,CHINA=null,detailP=null,chinaP=null,ALLPH=[];
function J(u){return fetch(u).then(function(r){if(!r.ok)throw new Error(u);return r.json()})}
function repairDetailGeometry(fc){
 var by={};WORLD.features.forEach(function(f){by[f.properties.name]=f});
 function bounds(g){var b=[Infinity,Infinity,-Infinity,-Infinity];function walk(v){if(!Array.isArray(v))return;if(typeof v[0]==='number'&&typeof v[1]==='number'){b[0]=Math.min(b[0],v[0]);b[1]=Math.min(b[1],v[1]);b[2]=Math.max(b[2],v[0]);b[3]=Math.max(b[3],v[1]);return}v.forEach(walk)}walk(g.coordinates);return b}
 // detail-hi is intentionally cropped at 143°E / 11°S / 48°W / 73°N.
 // Use the full world geometry for countries touching those cut edges so the map
 // doesn't end in a straight seam (notably Indonesia, PNG and Australia).
 fc.features=fc.features.map(function(f){var n=f.properties.name,w=by[n],b=bounds(f.geometry),wb=w?bounds(w.geometry):null,clipped=b[0]<=-47.95||b[1]<=-10.95||b[2]>=142.95||b[3]>=72.95;
  // Several Sahara-border countries in detail-hi share a flat 24°N cutoff.
  if(wb&&b[1]>=23.95&&b[1]<=24.05&&wb[1]<b[1]-1.5)clipped=true;
  if((n==='俄罗斯'||n==='印度'||clipped)&&w)return {type:'Feature',properties:f.properties,geometry:w.geometry};return f});
 delete fc._ref;return fc
}
function prepGeo(fc){fc.features.forEach(function(f){var b=d3.geoBounds(f);if(b[0][0]>b[1][0]){b=[[-180,b[0][1]],[180,b[1][1]]]}f._b=b;});return fc}
function loadDetail(){if(!detailP)detailP=J('public/v9/detail-countries.topo.json').then(function(t){var d=topojson.feature(t,t.objects.c);if(!HI)DETAIL=prepGeo(repairDetailGeometry(d));return d});return detailP}
// trip and country pages zoom far into coastlines, so they use the unsimplified layer
var HI=false,hiP=null;function loadDetailHi(){if(!hiP)hiP=J('public/v9/detail-hi.topo.json').then(function(t){var d=topojson.feature(t,t.objects.c);HI=true;DETAIL=prepGeo(repairDetailGeometry(d));return d}).catch(function(){return loadDetail()});return hiP}
function loadChina(){if(!chinaP)chinaP=J('public/data/china-provinces.json').then(function(d){CHINA=prepGeo(d);return d});return chinaP}
function phKey(src){return src.replace(/^.*photos\//,'').replace(/\.webp$/,'')}
function build(tripsD,placesD,storyD){
 placesD.places.forEach(function(p){PL[p.id]=p});
 var ST={};((storyD&&storyD.trips)||[]).forEach(function(s){ST[s.id]=s});
 var OPT=(storyD&&storyD.options)||{};var tl=tripsD.trips.filter(function(t){return t.id!=='edinburgh-again'&&!(OPT.cornwall_split===false&&t.id==='2024-cornwall-zx')}); // v9.2f: the standalone Edinburgh entry is gone; Edinburgh stays inside its trips
 TRIPS=tl.map(function(t){
  var s=ST[t.id]||{};var bf=(BRIEF&&BRIEF[t.id==='china'?'china-diary':t.id])||{};var o={who:t.who||s.who||'',id:t.id==='china'?'china-diary':t.id,title:bf.title||(t.id==='china'?'国内日记':t.title),start:t.start,end:t.end,nights:t.nights,kind:t.kind,year:t.year,countries:t.countries||[],summary:bf.line||s.summary||'',highlights:s.highlights||[],transport:s.transport||[],unordered:!!(s.unordered||s.orderedRoute===false)};
  o.photos=[];(t.places||[]).forEach(function(pid){var p=PL[pid];if(!p)return;(p.photos||[]).forEach(function(ph){if(ph.hidden)return;var pk=phKey(ph.src);o.photos.push({src:'public/'+ph.src,bg:ph.bg||'#1b1814',w:ph.w,h:ph.h,fy:ph.focusY,place:photoPlace(pk,ph,p),pid:pid,key:pk,country:photoCountry(pk,ph,p),province:p.province})})});
  var lk=LEAD[o.id]||LEAD[t.id];o.cover=lk==='MAP'?null:((lk&&o.photos.filter(function(p){return p.key===lk})[0])||o.photos[0]||null);o.portrait=!!(o.cover&&o.cover.h>o.cover.w);
  var sk=SECOND[o.id]||SECOND[t.id];o.second=(sk&&o.photos.filter(function(p){return p.key===sk})[0])||o.photos.filter(function(p){return p!==o.cover})[0]||null;
  if(t.id==='china'){o.stops=[{city:'中国',country:'中国',lat:35,lng:104,area:true,days:[]}];} // 国内日记: no cities, no route; the country is lit
  else if(s.route&&s.route.length){o.stops=s.route.slice().sort(function(a,b){return (a.order||0)-(b.order||0)}).map(function(r){return {city:r.city,country:r.country,lat:+r.lat,lng:+r.lng,area:!!r.area,days:r.days||[],by:'',note:''}})}
  else if(s.moments){var seen={};o.stops=[];s.moments.forEach(function(m){if(!seen[m.city]){seen[m.city]=1;o.stops.push({city:m.city,lat:+m.lat,lng:+m.lng,days:[]})}})}
  else o.stops=[];
  o.days=(s.days||s.itinerary||[]).map(function(d){return {day:d.day,date:d.date,city:d.city,title:d.title||'',text:d.text||d.note||'',weather:d.weather||'',stay:d.stay||'',pk:d.photos||null,food:d.food||(((EXTRA.food||{})[t.id]||{})[String(d.day)])||'',draft:!!d.draft}});
  o.moments=s.moments||null;o.visits=s.visits||null;
  o.together=t.kind==='trip'?(o.who?(o.who==='tg'||o.who==='fam'):(t.start>=TOGETHER_FROM)):null;
  o.lc=lineCls(o.who,o.together);
  o.dayCount=(t.kind==='trip'&&t.start&&t.end)?daysIncl(t.start,t.end):0;
  var km=0;if(!o.unordered){for(var i=1;i<o.stops.length;i++)km+=hav([o.stops[i-1].lng,o.stops[i-1].lat],[o.stops[i].lng,o.stops[i].lat]);}
  o.km=t.id==='china'?0:km;
  var cs={};o.stops.forEach(function(x){if(!x.area)cs[x.city]=1});o.cityCount=Object.keys(cs).length;o.legs=t.legs||null;
  return o});
 TRIPS.forEach(function(t){BYID[t.id]=t});
 // photos of the removed Edinburgh entry: which visit each is from is not known, so they stay on the UK country page
 LOOSE=[];var usedPl={};tripsD.trips.forEach(function(t){(t.places||[]).forEach(function(p){usedPl[p]=1})});[{places:Object.keys(PL).filter(function(k){return !usedPl[k]&&PL[k].scope!=='china'})}].forEach(function(t){(t.places||[]).forEach(function(pid){var p=PL[pid];if(!p)return;(p.photos||[]).forEach(function(ph){var pk=phKey(ph.src);LOOSE.push({src:'public/'+ph.src,bg:ph.bg||'#1b1814',w:ph.w,h:ph.h,fy:ph.focusY,place:photoPlace(pk,ph,p),pid:pid,key:pk,country:photoCountry(pk,ph,p),province:p.province})})})});
 ALLPH_X=LOOSE;
 // order of trips for prev/next: real trips newest-first, then uk, china
 var real=TRIPS.filter(function(t){return t.kind==='trip'}).sort(function(a,b){return a.start>b.start?-1:a.start<b.start?1:0});
 SEQ=real.concat(['uk-years','china-diary'].map(function(i){return BYID[i]}).filter(Boolean));
 ALLPH=[];TRIPS.forEach(function(t){t.photos.forEach(function(p){ALLPH.push(p)})});
}
var SEQ=[],EXTRA={},CAPS=null,BRIEF=null,LOOSE=[],ALLPH_X=[]; // BRIEF is baked in by build.py from data/trips-brief.kimi.json (approved copy); USE_BRIEF=0 python3 build.py leaves it out
function stats(){
 var cc={},cities={},trips=0,km=0,days=0;
 TRIPS.forEach(function(t){t.countries.forEach(function(c){cc[c]=1});t.stops.forEach(function(s){cities[s.city]=1});if(t.kind==='trip'){trips++;days+=t.dayCount}km+=t.km;
  if(t.visits)t.visits.forEach(function(v){if(v.start&&v.end)days+=daysIncl(v.start,v.end)})});
 return {countries:Object.keys(cc).length,cities:Object.keys(cities).length,trips:trips,km:km,days:days};
}
var WHO={jy:'嘉怡一个人',zx:'兴兴一个人',sis:'嘉怡一个人',friend:'嘉怡一个人',tg:'兴兴嘉怡一起',fam:'兴兴嘉怡一起',zxbiz:'兴兴一个人',zxwork:'兴兴一个人',mom:'嘉怡一个人'};
function lineCls(w,tg){if(w==='zx'||w==='zxbiz'||w==='zxwork')return 'zx';if(w==='tg'||w==='fam')return 'tg';if(w)return 'solo';return tg?'tg':'solo'}
function companion(t){if(t.who&&WHO[t.who])return {tg:t.lc==='tg',cls:t.lc,txt:WHO[t.who]};if(t.together===true)return {tg:true,cls:'tg',txt:'兴兴嘉怡一起'};if(t.together===false)return {tg:false,cls:'solo',txt:'嘉怡一个人'};return null}
function routeText(t){if(t.unordered){return t.stops.filter(function(s){return !s.area}).map(function(s){return s.city})}var out=[];t.stops.forEach(function(s,i){if(i&&s.city===t.stops[i-1].city)return;out.push(s.city)});return out}
function engMonth(t){if(!t.start||t.start.length<8)return '';var d=D(t.start);return MONTH_EN[d.getMonth()]+' '+d.getFullYear()}

function tripCountries(t){var o={};(t.countries||[]).forEach(function(c){if(c)o[c]=1});(t.stops||[]).forEach(function(s){if(s.country)o[s.country]=1});return Object.keys(o)}
function allVisited(){var o={};TRIPS.forEach(function(t){tripCountries(t).forEach(function(c){o[c]=1})});return o}
function isSeoulCity(t){if(!t||t.kind!=='trip')return false;var cs={};(t.stops||[]).forEach(function(s){if(!s.area)cs[s.city]=1});var k=Object.keys(cs);return k.length===1&&k[0]==='首尔'}
var SEOUL_POI={'2026-seoul-mom':[{city:'狎鸥亭',lng:127.0286,lat:37.5273},{city:'圣水',lng:127.0556,lat:37.5445},{city:'光化门',lng:126.9769,lat:37.5759},{city:'西村',lng:126.9668,lat:37.5788},{city:'三清',lng:126.9816,lat:37.5845},{city:'林荫道',lng:127.023175,lat:37.5206268},{city:'汝矣岛',lng:126.9245,lat:37.5219},{city:'弘大',lng:126.9237,lat:37.5563},{city:'延南',lng:126.9253,lat:37.5662},{city:'仁川机场',lng:126.4407,lat:37.4602},{city:'岛山',lng:127.0363,lat:37.5226}],'2026-korea':[{city:'明洞',lng:126.9849,lat:37.5636},{city:'景福宫',lng:126.977,lat:37.5796},{city:'南山塔',lng:126.9882,lat:37.5512},{city:'仁寺洞',lng:126.986,lat:37.574},{city:'广藏市场',lng:126.9996,lat:37.570}]};
function seoulPois(t){return (SEOUL_POI[t&&t.id]||[]).slice()}
function mapPts(t){if(isSeoulCity(t)){return seoulPois(t).filter(function(s){return s.city!=='仁川机场'}).map(function(s){return [s.lng,s.lat]})}var p=(t.stops||[]).map(function(s){return [s.lng,s.lat]});(t.legs||[]).forEach(function(l){l.forEach(function(x){p.push([x.lng,x.lat])})});return p}
// Camera-only context for long east-west routes: these points widen the map frame
// without becoming markers, stops, or route segments.
function mapFramePts(t){var p=mapPts(t);if(t&&t.id==='2026-moscow-zx')p=p.concat([[78,8]]);return p}
function mapFocusPts(t){return t&&t.id==='2026-moscow-zx'?[[32,48],[46,63]]:mapFramePts(t)}
var SEOUL_OSM=null,seoulOSMP=null;
function loadSeoulOSM(){
 if(seoulOSMP) return seoulOSMP;
 seoulOSMP = J('public/v9/seoul-osm.geo.json').then(function(fc){
   if(!fc || fc.type!=='FeatureCollection' || !Array.isArray(fc.features) || !fc.features.length) throw new Error('Invalid Seoul OSM data');
   var waterCount=0, roadCount=0, hanFound=false;
   function signedArea(ring){ var a=0; for(var i=0,j=ring.length-1;i<ring.length;j=i++){ a+=ring[j][0]*ring[i][1]-ring[i][0]*ring[j][1]; } return a/2; }
   function normalizePolygon(coords){ return coords.map(function(ring,i){ var area=signedArea(ring); if(i===0 && area>0) return ring.slice().reverse(); if(i>0 && area<0) return ring.slice().reverse(); return ring; }); }
   var features = fc.features.map(function(f){
     if(!f || !f.geometry || !f.properties) throw new Error('Invalid feature in Seoul OSM');
     var g = JSON.parse(JSON.stringify(f.geometry));
     var kind = f.properties.kind;
     var name = (f.properties.name || '')+' '+(f.properties['name:en'] || '');
     if(/한강|hangang|han river/i.test(name)) hanFound = true;
     if(kind === 'water'){
       if(g.type === 'Polygon') { g.coordinates = normalizePolygon(g.coordinates); waterCount++; }
       else if(g.type === 'MultiPolygon') { g.coordinates = g.coordinates.map(normalizePolygon); waterCount++; }
     } else if(kind === 'road' || kind === 'river' || kind === 'coast') {
       if(kind === 'road' && (g.type === 'LineString' || g.type === 'MultiLineString')) roadCount++;
     }
     return { type:'Feature', id:f.id, properties: f.properties, geometry: g };
   });
   if(waterCount===0 || roadCount===0 || !hanFound) throw new Error('Seoul OSM missing required water/roads/Han river');
   var copy = { type:'FeatureCollection', features: features, properties: fc.properties };
   SEOUL_OSM = copy;
   return copy;
 }).catch(function(e){ seoulOSMP=null; throw e; });
 return seoulOSMP;
}
function cityMinSpan(t){
 var pts = mapPts(t);
 if(!pts || !pts.length || pts.length < 2) return 0.1;
 var b = bboxOf(pts);
 var w = b[1][0] - b[0][0];
 var h = b[1][1] - b[0][1];
 var span = Math.max(w, h);
 return span < 0.055 ? 0.055 : 0;
}
