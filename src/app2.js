/* ---------- flat map engine ---------- */
var SEAS=[{n:'大西洋',p:[-13,35.5]},{n:'大西洋',p:[-10.5,32.6]},{n:'大西洋',p:[-12,47]},{n:'地中海',p:[4.5,38.6]},{n:'北海',p:[3.2,56]},{n:'爱琴海',p:[25.2,38.9]},{n:'第勒尼安海',p:[11.6,40.2]},{n:'利古里亚海',p:[8.6,43.6]},{n:'安达曼海',p:[96.5,10]},{n:'泰国湾',p:[101.6,10.6]},{n:'黄海',p:[123.5,35.3]},{n:'日本海',p:[134,40.5]},{n:'马六甲海峡',p:[99.6,3.6]},{n:'南海',p:[113.5,15.5]},{n:'东海',p:[125,29]},{n:'渤海',p:[120.3,38.9]},{n:'凯尔特海',p:[-7.5,50.6]},{n:'爱尔兰海',p:[-4.9,53.6]},{n:'北大西洋',p:[-27,58]},{n:'挪威海',p:[2,66]}];
var CTXC=[['卡萨布兰卡',-7.59,33.57],['拉巴特',-6.84,34.02],['阿加迪尔',-9.6,30.42],['非斯',-5.0,34.03],['丹吉尔',-5.8,35.76],['伦敦',-0.13,51.51],['曼彻斯特',-2.24,53.48],['格拉斯哥',-4.25,55.86],['布里斯托',-2.59,51.45],['都柏林',-6.26,53.35],['布鲁塞尔',4.35,50.85],['阿姆斯特丹',4.9,52.37],['鲁昂',1.1,49.44],['里尔',3.06,50.63],['兰斯',4.03,49.26],['奥尔良',1.91,47.9],['里昂',4.84,45.76],['马赛',5.37,43.3],['波尔多',-0.58,44.84],['尼斯',7.26,43.7],['日内瓦',6.14,46.2],['伯尔尼',7.45,46.95],['慕尼黑',11.58,48.14],['都灵',7.69,45.07],['佛罗伦萨',11.26,43.77],['那不勒斯',14.27,40.85],['博洛尼亚',11.34,44.49],['瓦伦西亚',-0.38,39.47],['毕尔巴鄂',-2.93,43.26],['马拉加',-4.42,36.72],['里斯本',-9.14,38.72],['塞萨洛尼基',22.94,40.64],['伊拉克利翁',25.14,35.34],['帕特雷',21.73,38.25],['阿库雷里',-18.09,65.68],['清迈',98.99,18.79],['芭提雅',100.88,12.93],['华欣',99.96,12.57],['槟城',100.33,5.41],['马六甲',102.25,2.19],['新加坡',103.82,1.35],['普吉',98.39,7.88],['釜山',129.08,35.18],['仁川',126.7,37.46]];
function bboxOf(pts){var x0=180,y0=90,x1=-180,y1=-90;pts.forEach(function(p){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])});return [[x0,y0],[x1,y1]]}
function grow(b,f,minSpan){var cx=(b[0][0]+b[1][0])/2,cy=(b[0][1]+b[1][1])/2,w=Math.max((b[1][0]-b[0][0])*f,minSpan||0),h=Math.max((b[1][1]-b[0][1])*f,(minSpan||0)*0.6);var C=function(v,a,b){return Math.max(a,Math.min(b,v))};return [[C(cx-w/2,-180,180),C(cy-h/2,-85.05112877,85.05112877)],[C(cx+w/2,-180,180),C(cy+h/2,-85.05112877,85.05112877)]]}
function bIntersects(a,b){return !(a[1][0]<b[0][0]||a[0][0]>b[1][0]||a[1][1]<b[0][1]||a[0][1]>b[1][1])}
function mpFeature(b){return {type:'Feature',geometry:{type:'MultiPoint',coordinates:[b[0],b[1],[b[0][0],b[1][1]],[b[1][0],b[0][1]]]}}}
function textW(s,fs,ls){return s.length*fs*(/[\u4e00-\u9fff]/.test(s)?1:0.55)+s.length*fs*(ls||0.08)}

function FlatMap(el,opt){
 var self=this;this.el=el;this.opt=opt;this.T={k:1,x:0,y:0};this.segP=[];this.active=-1;this.lblPos={};this.ready=false;this.raf=0;this.rings=0;
 // land is painted once per settled camera onto a canvas; during camera moves the canvas is moved with a CSS transform (compositor only)
 this.cv=document.createElement('canvas');this.cv.className='mp-cv';el.appendChild(this.cv);this.cx=this.cv.getContext('2d',{willReadFrequently:true}); // CPU-backed: the land is drawn rarely, and a GPU canvas forces its own layer plus every overlapping element into layers
 this.svg=d3.select(el).append('svg').attr('aria-hidden','true');
 this.gOver=this.svg.append('g');this.gSeaL=this.gOver.append('g');this.gCty=this.gOver.append('g');this.ctxG=this.gOver.append('g');this.gRoute=this.gOver.append('g');this.gDots=this.gOver.append('g');this.gLbl=this.gOver.append('g');
 this.resize();
}
var LAND_STYLE={n:['#1B1814','rgba(201,162,122,.12)'],v:['#5A4A38','rgba(237,230,218,.32)'],hl:['#6E5A44','rgba(237,230,218,.40)'],p:['#1A1714','rgba(237,230,218,.08)'],pv:['#5A4A38','rgba(237,230,218,.32)']};
FlatMap.prototype.resize=function(){
 var el=this.el,W=el.clientWidth||300,H=el.clientHeight||200,o=this.opt;this.W=W;this.H=H;
 this.dpr=Math.min(1.5,window.devicePixelRatio||1);this.cv.width=Math.round(W*this.dpr);this.cv.height=Math.round(H*this.dpr);this.cv.style.width=W+'px';this.cv.style.height=H+'px';
 this.svg.attr('viewBox','0 0 '+W+' '+H).attr('width',W).attr('height',H);
 this.proj=d3.geoMercator().fitExtent([[0,0],[W,H]],mpFeature(o.base));
 this.drawLand();this.ready=true;
 if(this.cam)this.T=this.camT(this.cam.pts,this.cam.pad,this.cam.minSpan);
 this.applyT(true);
};
// Every FlatMap is plain Mercator scaled and shifted (fitExtent), so land paths are built ONCE per dataset in a
// reference Mercator and reused by all maps through a canvas transform. Creating a map no longer projects geometry.
var REFS=4000;
function refGeo(fc,centroid){if(!fc)return null;if(fc._ref)return fc._ref;var P=d3.geoMercator().scale(REFS).translate([0,0]),path=d3.geoPath(P);
 fc._ref=fc.features.map(function(f){var d=path(f);return {n:f.properties.name,f:f,p:d?new Path2D(d):null,b:path.bounds(f),a:path.area(f),cj:/[\u4e00-\u9fff]/.test(f.properties.name),lp:undefined,ctr:centroid}}).filter(function(r){return r.p});return fc._ref}
FlatMap.prototype.drawLand=function(){
 var o=this.opt,vis=o.highlight||{},self=this,P=this.proj,m=P.scale()/REFS,t=P.translate();this.m=m;this.t0=t;
 this.landW=o.useWorld?refGeo(WORLD):null;this.landD=refGeo(DETAIL);this.landP=o.china?refGeo(CHINA,true):null;
 this.landO=refOverlay(o.overlay);this.cityGeo=o.cityOSM?refCityGeo(o.cityOSM):null;
 var cls={};Object.keys(vis).forEach(function(n){if(vis[n])cls[n]='v'});this.cls=cls;
 this.ctyAnchors=[];var src=o.china?this.landP:(this.landD||this.landW);
 if(src&&o.countryLabels!==false){var ctx=grow(o.base,1.6,0),c0=P(ctx[0]),c1=P(ctx[1]),bx0=Math.min(c0[0],c1[0]),bx1=Math.max(c0[0],c1[0]),by0=Math.min(c0[1],c1[1]),by1=Math.max(c0[1],c1[1]);
  src.forEach(function(r){if(!r.cj)return;var x0=t[0]+m*r.b[0][0],x1=t[0]+m*r.b[1][0],y0=t[1]+m*r.b[0][1],y1=t[1]+m*r.b[1][1];if(x1<bx0||x0>bx1||y1<by0||y0>by1)return;
   if(r.lp===undefined)r.lp=r.ctr?d3.geoCentroid(r.f):labelPoint(r.f);if(!r.lp)return;
   var lp=r.lp
   self.ctyAnchors.push({n:r.n,p:P(lp),area:r.a*m*m,v:!!vis[r.n]})})}
 this.painted=null;
};
function refCityGeo(fc){
 if(!fc) return null;
 if(fc._cityRef) return fc._cityRef;
 var P = d3.geoMercator().scale(REFS).translate([0,0]);
 var path = d3.geoPath(P);
 fc._cityRef = fc.features.map(function(f){
   var g = f.geometry;
   var props = f.properties || {};
   var kind = props.kind;
   var isWater = kind === 'water';
   var isLine = kind === 'road' || kind === 'river' || kind === 'coast';
   if(!isWater && !isLine) return null;
   if(isWater && g.type !== 'Polygon' && g.type !== 'MultiPolygon') return null;
   if(isLine && g.type !== 'LineString' && g.type !== 'MultiLineString') return null;
   var d = path(f);
   if(d == null || /NaN|Infinity/.test(d)) throw new Error('Invalid path for OSM feature '+(props.id||props['@id']||''));
   var b = path.bounds(f);
   return {
     id: f.id || props.id || props['@id'] || ((props.osm_type||'')+'/'+props.osm_id),
     name: (props.name || '')+' '+(props['name:en'] || ''),
     highway: props.highway || '',
     kind: kind,
     _f: f,
     p: new Path2D(d),
     b: b
   };
 }).filter(function(r){ return r != null; });
 return fc._cityRef;
}
function refOverlay(fc){if(!fc)return null;var P=d3.geoMercator().scale(REFS).translate([0,0]),path=d3.geoPath(P),feats=fc.features||(fc.type==='Feature'?[fc]:[]);
 return feats.map(function(f){var d=path(f);return {p:d?new Path2D(d):null,kind:(f.properties&&f.properties.kind)||'water'}}).filter(function(r){return r.p})}

FlatMap.prototype.paintLand=function(){
 if(this.opt.cityDiagram){this.paintCityDiagram();return;}
 var T=this.T,W=this.W,H=this.H,c=this.cx,dpr=this.dpr,o=this.opt,m=this.m,t=this.t0,cls=this.cls||{},hl=this.hlSet||{};if(!c)return;
 c.setTransform(1,0,0,1,0,0);c.fillStyle='#0E0C0B';c.fillRect(0,0,this.cv.width,this.cv.height);
 var set=o.useWorld?((this.landD&&T.k>=1.9)?this.landD:this.landW):this.landD;
 if(this.landO&&this.landO.some(function(r){return r.kind==='land'}))set=null;
 var K=T.k*m,X=T.k*t[0]+T.x,Y=T.k*t[1]+T.y;
 var vx0=-X/K,vy0=-Y/K,vx1=(W-X)/K,vy1=(H-Y)/K;
 c.setTransform(dpr*K,0,0,dpr*K,dpr*X,dpr*Y);c.lineWidth=0.6/K;c.lineJoin='round';
 function layer(list,prov){if(!list)return;var groups={n:[],v:[],hl:[]};
  list.forEach(function(r){if(r.b[1][0]<vx0||r.b[0][0]>vx1||r.b[1][1]<vy0||r.b[0][1]>vy1)return;var k=hl[r.n]?'hl':(cls[r.n]||'n');groups[k].push(r)});
  ['n','v','hl'].forEach(function(k){var st=LAND_STYLE[prov?(k==='n'?'p':'pv'):k];c.fillStyle=st[0];c.strokeStyle=st[1];groups[k].forEach(function(r){c.fill(r.p);c.stroke(r.p)})})}
 layer(set);layer(this.landP,true);
 if(this.landO){var vst=LAND_STYLE.v;this.landO.forEach(function(r){if(r.kind==='land'){c.fillStyle=vst[0];c.strokeStyle=vst[1];c.lineWidth=0.6/K;c.fill(r.p);c.stroke(r.p)}});c.fillStyle='#0B0D10';c.strokeStyle='rgba(8,10,14,.85)';c.lineWidth=1.1/K;this.landO.forEach(function(r){if(r.kind!=='land'){c.fill(r.p);c.stroke(r.p)}})}
 this.painted={k:T.k,x:T.x,y:T.y,t:performance.now()};this.cv.style.transform='';
};
FlatMap.prototype.moveLand=function(){if(this.opt.cityDiagram){this.paintCityDiagram();return;}var P=this.painted,T=this.T;if(!P){this.paintLand();return}
 var s=T.k/P.k,W=this.W,H=this.H;
 // repaint (throttled) when the view leaves the painted area, zooms in a lot, or crosses the world/detail switch
 var vx0=-T.x/T.k,vy0=-T.y/T.k,vx1=(W-T.x)/T.k,vy1=(H-T.y)/T.k,px0=-P.x/P.k,py0=-P.y/P.k,px1=(W-P.x)/P.k,py1=(H-P.y)/P.k;
 var out=vx0<px0-1/P.k||vy0<py0-1/P.k||vx1>px1+1/P.k||vy1>py1+1/P.k,blur=s>2.2,sw=this.opt.useWorld&&((T.k>=1.9)!==(P.k>=1.9));
 if((out||blur||sw)&&performance.now()-P.t>180){this.paintLand();return}
 this.cv.style.transform='translate('+(T.x-s*P.x).toFixed(2)+'px,'+(T.y-s*P.y).toFixed(2)+'px) scale('+s.toFixed(5)+')'};
function labelPoint(f){ // centroid of the largest polygon
 var g=f.geometry;if(!g)return null;var polys=g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[];var best=null,ba=-1;
 polys.forEach(function(p){var a=d3.geoArea({type:'Polygon',coordinates:p});if(a>ba){ba=a;best=p}});
 if(!best)return null;var c=d3.geoCentroid({type:'Polygon',coordinates:best});
 var fix={'挪威':[9.5,61.3],'英国':[-1.6,52.6],'法国':[2.4,46.8],'马来西亚':[102.2,4.2],'希腊':[22.2,39.6],'意大利':[12.6,42.9],'克罗地亚':[16,45.4],'泰国':[101,15.6],'越南':[105.8,20.5],'缅甸':[96,21.5],'日本':[138.5,36.5],'印度尼西亚':[102.5,-0.5],'摩洛哥':[-6.3,32.2]};
 return fix[f.properties.name]||c}
FlatMap.prototype.landMix=function(){};
FlatMap.prototype.camT=function(pts,pad,minSpan){
 var W=this.W,H=this.H,P=this.proj,b=bboxOf(pts);b=grow(b,1,minSpan||0);
 var a=P(b[0]),c=P(b[1]),x0=Math.min(a[0],c[0]),x1=Math.max(a[0],c[0]),y0=Math.min(a[1],c[1]),y1=Math.max(a[1],c[1]);
 var px=pad&&pad.length?pad:[pad||0.2,pad||0.2,pad||0.2,pad||0.2]; // top,right,bottom,left as fraction
 var aw=W*(1-px[1]-px[3]),ah=H*(1-px[0]-px[2]);
 var k=Math.min(aw/Math.max(x1-x0,1),ah/Math.max(y1-y0,1));k=Math.max(this.opt.kmin||0.6,Math.min(k,this.opt.kmax||40));
 var cx=(x0+x1)/2,cy=(y0+y1)/2,ox=W*px[3]+aw/2,oy=H*px[0]+ah/2;
 return {k:k,x:ox-k*cx,y:oy-k*cy}};
FlatMap.prototype.view=function(pts,o){
 o=o||{};var self=this;this.cam={pts:pts,pad:o.pad,minSpan:o.minSpan};
 var T1=this.camT(pts,o.pad,o.minSpan),T0=this.T,dur=o.forceMotion?(o.dur||1400):(RM||o.instant?0:(o.dur||1400));
 cancelAnimationFrame(this.craf);
 if(!dur){this.moving=false;this.T=T1;this.applyT();return}
 var W=this.W,H=this.H;
 if(o.linear){var c0x=(W/2-T0.x)/T0.k,c0y=(H/2-T0.y)/T0.k,c1x=(W/2-T1.x)/T1.k,c1y=(H/2-T1.y)/T1.k,t1=performance.now(),ease=d3.easeCubicInOut,half=false;self.moving=true;function linearFr(now){if(self.dead)return;var p=Math.min(1,(now-t1)/dur),e=ease(p),k=T0.k*Math.pow(T1.k/T0.k,e),cx=c0x+(c1x-c0x)*e,cy=c0y+(c1y-c0y)*e;self.T={k:k,x:W/2-k*cx,y:H/2-k*cy};if(!half&&o.onHalf&&p>=.48){half=true;o.onHalf()}if(p>=1)self.moving=false;self.applyT();if(p<1)self.craf=requestAnimationFrame(linearFr)}this.craf=requestAnimationFrame(linearFr);return}
 var c0=[(W/2-T0.x)/T0.k,(H/2-T0.y)/T0.k,W/T0.k],c1=[(W/2-T1.x)/T1.k,(H/2-T1.y)/T1.k,W/T1.k];
 var iz=d3.interpolateZoom(c0,c1),t0=performance.now(),ease=d3.easeCubicInOut;
 self.moving=true;function fr(now){if(self.dead)return;var t=Math.min(1,(now-t0)/dur),v=iz(ease(t)),k=W/v[2];self.T={k:k,x:W/2-k*v[0],y:H/2-k*v[1]};if(t>=1)self.moving=false;self.applyT();if(t<1)self.craf=requestAnimationFrame(fr)}
 this.craf=requestAnimationFrame(fr);
};
FlatMap.prototype.zoomBy=function(f){var W=this.W,H=this.H,T=this.T,cx=(W/2-T.x)/T.k,cy=(H/2-T.y)/T.k,k=T.k*f;var pts=[this.proj.invert([cx-W/2/k,cy-H/2/k]),this.proj.invert([cx+W/2/k,cy+H/2/k])];this.view(pts,{pad:0,dur:700})};
FlatMap.prototype.S=function(ll){var p=this.proj(ll),T=this.T;return [T.k*p[0]+T.x,T.k*p[1]+T.y]};
FlatMap.prototype.applyT=function(force){if(this.moving&&!force)this.moveLand();else this.paintLand();this.renderOver()};
/* routes: opt.routes = [{pts:[[lng,lat]..], cls:'tg'|'solo', id}] ; stops: opt.stops [{city,lat,lng,cls}] */
FlatMap.prototype.setRoutes=function(routes,stops){this.opt.routes=routes;this.opt.stops=stops;this.segP=routes.map(function(){return 0});this.gRoute.selectAll('*').remove();this.gDots.selectAll('*').remove();this.gLbl.selectAll('*').remove();this.lblPos={};
 var self=this;this.routeEls=routes.map(function(r){var g={ghost:self.opt.ghost?self.gRoute.append('path').attr('class','mp-route ghost'):null,line:/\bleg\b/.test(r.cls)?self.gRoute.append('path').attr('class','mp-route '+r.cls):self.gRoute.append('path').attr('class','mp-route '+(r.cls||'tg')).attr('pathLength',1).style('stroke-dasharray','1 1').style('stroke-dashoffset',1)};return g});
 // unique dots by city
 var u={};this.dots=[];(stops||[]).forEach(function(s,i){var key=s.city;if(u[key]){u[key].idx.push(i);return}var d={city:s.city,ll:[s.lng,s.lat],idx:[i],cls:s.cls||'',lbl:s.label!==false};u[key]=d;self.dots.push(d)});
 this.dots.forEach(function(d){d.c=self.gDots.append('circle').attr('r',3.2).attr('class','mp-dot '+d.cls);if(self.opt.onStop){d.c.attr('tabindex',0).attr('role','button').attr('aria-label','查看 '+d.city).style('cursor','pointer').on('click',function(){self.opt.onStop(d.city,d.idx[0])}).on('keydown',function(ev){if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();self.opt.onStop(d.city,d.idx[0])}})}if(d.lbl)d.t=self.gLbl.append('text').attr('class','mp-lbl').text(d.city)});
 this.pulse=this.gDots.append('circle').attr('class','mp-pulse').attr('r',12).attr('display','none');
 this.ringsG=this.gDots.append('g');
 this.renderOver()};
FlatMap.prototype.arcD=function(a,b,bend){var dx=b[0]-a[0],dy=b[1]-a[1],L=Math.sqrt(dx*dx+dy*dy);if(L<0.5)return 'M'+a[0]+','+a[1];var o=Math.min(L*(bend==null?0.14:bend),60),mx=(a[0]+b[0])/2-dy/L*o,my=(a[1]+b[1])/2+dx/L*o;return 'M'+a[0].toFixed(1)+','+a[1].toFixed(1)+'Q'+mx.toFixed(1)+','+my.toFixed(1)+' '+b[0].toFixed(1)+','+b[1].toFixed(1)};
FlatMap.prototype.routeD=function(r){var self=this,s=r.pts.map(function(p){return self.S(p)}),d='';
 if(s.length<2)return 'M0,0';
 for(var i=1;i<s.length;i++){var seg=this.arcD(s[i-1],s[i],r.bend);d+=(i===1?seg:seg.replace(/^M[^Q]+/,' L'+s[i-1][0].toFixed(1)+','+s[i-1][1].toFixed(1)+' '))}
 return d};
FlatMap.prototype.renderOver=function(){
 if(!this.ready)return;var self=this,W=this.W,H=this.H,o=this.opt;
 if(o.cityDiagram){this.renderCityDiagram();return;}
 (o.routes||[]).forEach(function(r,i){var e=self.routeEls&&self.routeEls[i];if(!e)return;var d=self.routeD(r);e.line.attr('d',d);if(!/\bleg\b/.test(r.cls))e.line.style('stroke-dashoffset',1-self.segP[i]);if(e.ghost)e.ghost.attr('d',d)});
 var obst=[];var boxes=[];var lineB=[];
 (o.routes||[]).forEach(function(r){var s=r.pts.map(function(p){return self.S(p)});for(var i=1;i<s.length;i++){var a=s[i-1],b=s[i],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.sqrt(dx*dx+dy*dy);if(L<0.5)continue;var off=Math.min(L*(r.bend==null?0.14:r.bend),60),mx=(a[0]+b[0])/2-dy/L*off,my=(a[1]+b[1])/2+dx/L*off,n=Math.max(4,Math.ceil(L/9));
  for(var j=0;j<=n;j++){var t=j/n,u=1-t,x=u*u*a[0]+2*u*t*mx+t*t*b[0],y=u*u*a[1]+2*u*t*my+t*t*b[1];if(Math.hypot(x-a[0],y-a[1])<7||Math.hypot(x-b[0],y-b[1])<7)continue;lineB.push([x-2.5,y-2.5,x+2.5,y+2.5])}
}});
 (this.dots||[]).forEach(function(d){var p=self.S(d.ll);d.p=p;var on=d.idx.indexOf(self.active)>=0;var past=self.active>=0&&Math.min.apply(null,d.idx)<=self.active;
  d.c.style('opacity',o.dotSet&&!o.dotSet[d.city]?0:1);d.c.attr('cx',p[0]).attr('cy',p[1]).attr('r',on?5:(o.dotR||3.4)).attr('class','mp-dot '+(on?'cur':(o.progress&&self.active>=0?(past?'past':''):d.cls)));if(!(o.dotSet&&!o.dotSet[d.city]))obst.push([p[0]-5,p[1]-5,p[0]+5,p[1]+5])});
 if(this.pulse){var cur=(this.dots||[]).filter(function(d){return d.idx.indexOf(self.active)>=0})[0];if(cur&&o.pulse!==false){this.pulse.attr('cx',cur.p[0]).attr('cy',cur.p[1]).attr('display',null)}else this.pulse.attr('display','none')}
 if(this.ringsG){var ed=(this.dots||[])[0];this.ringsG.selectAll('circle').remove();if(ed&&this.rings){for(var r=1;r<=this.rings;r++)this.ringsG.append('circle').attr('cx',ed.p[0]).attr('cy',ed.p[1]).attr('r',6+r*8).attr('class','mp-ring').style('opacity',r===this.rings?0.9:0.32)}}
 // city labels with candidate placement + hysteresis
 var fs=o.lblSize||13,M=14;var C=[[1,0,'start',10,4],[-1,0,'end',-10,4],[0,-1,'middle',0,-11],[0,1,'middle',0,19],[1,-1,'start',7,-8],[1,1,'start',7,15],[-1,-1,'end',-7,-8],[-1,1,'end',-7,15]];
 var placed=[];
 var order=(this.dots||[]).slice().sort(function(a,b){var A=a.idx.indexOf(self.active)>=0?0:1,B=b.idx.indexOf(self.active)>=0?0:1;return A-B});
 order.forEach(function(d){if(!d.t)return;if(o.lblSet&&!o.lblSet[d.city]){d.t.style('opacity',0);return}var on=d.idx.indexOf(self.active)>=0,f=on?fs+2:fs,w=textW(d.city,f,.08),h=f+2,p=d.p;
  if(p[0]<-40||p[0]>W+40||p[1]<-40||p[1]>H+40){d.t.style('opacity',0);return}
  function rect(c){var x=p[0]+c[3],y=p[1]+c[4];var x0=c[2]==='start'?x:c[2]==='end'?x-w:x-w/2;return [x0,y-h+3,x0+w,y+3]}
  function bad(r){var s=0;if(r[0]<M||r[2]>W-M||r[1]<M||r[3]>H-M-(o.capH||0))s+=5;placed.concat(obst.filter(function(b){return !(Math.abs((b[0]+b[2])/2-p[0])<1&&Math.abs((b[1]+b[3])/2-p[1])<1)})).forEach(function(b){if(!(r[2]<b[0]||r[0]>b[2]||r[3]<b[1]||r[1]>b[3]))s+=1});var lh=0;lineB.forEach(function(b){if(!(r[2]<b[0]||r[0]>b[2]||r[3]<b[1]||r[1]>b[3]))lh++});return s+Math.min(.9,lh*.12)}
  var prev=self.lblPos[d.city],best=null,bs=1e9;
  if(prev!=null){var pr=rect(C[prev]);if(bad(pr)===0){best=prev;bs=0}}
  if(best==null)C.forEach(function(c,i){var sc=bad(rect(c))+i*0.01;if(sc<bs){bs=sc;best=i}});
  self.lblPos[d.city]=best;var c=C[best],r=rect(c);if(!((bs>=1&&!on)||bs>=5))placed.push(r);
  d.t.attr('x',p[0]+c[3]).attr('y',p[1]+c[4]).attr('text-anchor',c[2]).attr('class','mp-lbl'+(on?' cur':'')+(self.active>=0&&!on&&o.progress?' dim':'')).style('opacity',(bs>=1&&!on)||bs>=5?0:1)});
 boxes=placed.concat(obst);
 if(this.ctxG){this.ctxG.selectAll('*').remove();if(o.ctxCities&&T0k(self)>=(o.ctxK||1.6)){var stopsLL=(this.dots||[]).map(function(d){return d.ll});
  CTXC.forEach(function(cc){if(stopsLL.some(function(l){return Math.abs(l[0]-cc[1])<0.35&&Math.abs(l[1]-cc[2])<0.35}))return;var p=self.S([cc[1],cc[2]]);if(p[0]<20||p[0]>W-20||p[1]<20||p[1]>H-20-(o.capH||0))return;
   var w=textW(cc[0],11,.1),r=[p[0]+6,p[1]-9,p[0]+8+w,p[1]+4];if(r[2]>W-10)r=[p[0]-8-w,p[1]-9,p[0]-6,p[1]+4];var all=boxes.concat(lineB).concat(o.ctxAvoid?[o.ctxAvoid(W,H)]:[]);if(all.some(function(b){return !(r[2]<b[0]-2||r[0]>b[2]+2||r[3]<b[1]-2||r[1]>b[3]+2)}))return;boxes.push(r);
   self.ctxG.append('circle').attr('cx',p[0]).attr('cy',p[1]).attr('r',1.7).attr('class','mp-cdot');self.ctxG.append('text').attr('class','mp-clbl').attr('x',r[0]).attr('y',p[1]+3.5).text(cc[0])})}}
 // country labels
 var T=this.T;boxes=boxes.concat(lineB);this.gCty.selectAll('*').remove();this.gSeaL.selectAll('*').remove();
 if(o.countryLabels!==false&&this.ctyAnchors){var areaMin=o.ctyAreaMin||1600;
  this.ctyAnchors.slice().sort(function(a,b){return b.area-a.area}).forEach(function(a){var sa=a.area*T.k*T.k;if(sa<areaMin)return;var x=T.k*a.p[0]+T.x,y=T.k*a.p[1]+T.y;var fs2=o.china?10:10.5,w=textW(a.n,fs2,.42)+6,r=[x-w/2,y-9,x+w/2,y+4];
   if(r[0]<4||r[2]>W-4||r[1]<4||r[3]>H-4)return;if(boxes.some(function(b){return !(r[2]<b[0]-4||r[0]>b[2]+4||r[3]<b[1]-4||r[1]>b[3]+4)}))return;boxes.push(r);
   self.gCty.append('text').attr('class','mp-cty').attr('x',x).attr('y',y).style('fill',a.v?'rgba(237,230,218,.62)':'rgba(237,230,218,.14)').text(a.n)})}
 if(o.seaLabels!==false){SEAS.forEach(function(s){var p=self.S(s.p),w=textW(s.n,13,.2),r=[p[0]-w/2,p[1]-11,p[0]+w/2,p[1]+3];if(r[0]<8||r[2]>W-8||r[1]<8||r[3]>H-8)return;
   if(T.k<(o.seaK||1.2))return;if(boxes.some(function(b){return !(r[2]<b[0]||r[0]>b[2]||r[3]<b[1]||r[1]>b[3])}))return;
   // must be in sea: check no land path under point is too expensive; rely on curated coordinates
   boxes.push(r);self.gSeaL.append('text').attr('class','mp-sealbl').attr('x',p[0]).attr('y',p[1]).text(s.n)})}
};
function cityLabelLayout(dots, active, W, H) {
  var fs = 13, activeFs = 15;
  var M = 14;
  var leaderMax = 55;
  if (!dots.length) return [];
  
  var candidates = [
    [1, 0, 'start', 10, 0],
    [-1, 0, 'end', -10, 0],
    [0, -1, 'middle', 0, -11],
    [0, 1, 'middle', 0, 19],
    [1, -1, 'start', 7, -8],
    [1, 1, 'start', 7, 15],
    [-1, -1, 'end', -7, -8],
    [-1, 1, 'end', -7, 15]
  ];
  
  function rectFor(d, c) {
    var on = d.idx.indexOf(active) >= 0;
    var f = on ? activeFs : fs;
    var w = textW(d.city, f, 0.08);
    var h = f + 2;
    
    // Position text at exact point offset
    var textX = d.p[0] + c[3];
    var textY = d.p[1] + c[4];
    
    // Calculate box origin based on anchor
    var x0 = c[2] === 'start' ? textX : 
             c[2] === 'end' ? textX - w : 
             textX - w / 2;
    
    // Box should be [y - h/2, y + h/2] with dominant-baseline="middle"
    var y0 = textY - h / 2;
    var y1 = textY + h / 2;
    
    return {
      box: [x0, y0, x0 + w, y1],
      anchor: c[2],
      fontSize: f,
      textX: textX,
      textY: textY,
      leader: [d.p, [c[2] === 'start' ? x0 : 
                      c[2] === 'end' ? x0 + w : 
                      textX, textY]]
    };
  }
  
  function leaderLength(r) {
    if (!r.leader) return 0;
    var a = r.leader[0], b = r.leader[1];
    return Math.hypot(a[0] - b[0], a[1] - b[1]);
  }
  
  function inside(r) {
    return r.box[0] >= M && r.box[2] <= W - M && 
           r.box[1] >= M && r.box[3] <= H - M - 20;
  }
  
  function boxesOverlap(b1, b2) {
    return !(b1[2] <= b2[0] || b1[0] >= b2[2] || 
             b1[3] <= b2[1] || b1[1] >= b2[3]);
  }
  
  var placed = [];
  var res = [];
  
  // Sort by priority (active first) and then by marker position
  var sorted = dots.slice().sort(function(a, b) {
    var ao = a.idx.indexOf(active) >= 0 ? 0 : 1;
    var bo = b.idx.indexOf(active) >= 0 ? 0 : 1;
    if (ao !== bo) return ao - bo;
    return a.p[1] - b.p[1] || a.p[0] - b.p[0];
  });
  
  // Try multiple passes with different starting orders
  var bestResult = [];
  var bestPlacedCount = 0;
  
  for (var pass = 0; pass < 3; pass++) {
    placed = [];
    var currentResult = [];
    
    for (var i = 0; i < sorted.length; i++) {
      var d = sorted[i];
      var on = d.idx.indexOf(active) >= 0;
      var best = null;
      var bestScore = Infinity;
      var bestOverlaps = Infinity;
      
      for (var j = 0; j < candidates.length; j++) {
        var r = rectFor(d, candidates[j]);
        var len = leaderLength(r);
        
        // Hard constraints
        if (len > leaderMax) continue;
        if (!inside(r)) continue;
        
        // Check overlaps
        var overlaps = 0;
        for (var k = 0; k < placed.length; k++) {
          if (boxesOverlap(r.box, placed[k].box)) {
            overlaps++;
          }
        }
        
        // Score prioritizes no overlap, then shorter leader
        var score = overlaps * 1000 + len;
        
        if (score < bestScore) {
          bestScore = score;
          bestOverlaps = overlaps;
          best = r;
        }
      }
      
      if (best && bestOverlaps === 0) {
        placed.push(best);
        currentResult.push({
          city: d.city,
          idx: d.idx,
          point: d.p,
          x: best.textX,
          y: best.textY,
          anchor: best.anchor,
          box: best.box,
          leader: best.leader,
          fontSize: best.fontSize,
          active: on
        });
      }
    }
    
    if (currentResult.length > bestPlacedCount) {
      bestPlacedCount = currentResult.length;
      bestResult = currentResult;
    }
    
    // Rotate candidates for next pass
    candidates.unshift(candidates.pop());
    // Reverse sorted order for variety
    sorted.reverse();
  }
  
  // Sort final result
  return bestResult.sort(function(a, b) {
    var ao = a.idx.indexOf(active) >= 0 ? 0 : 1;
    var bo = b.idx.indexOf(active) >= 0 ? 0 : 1;
    return ao - bo || a.box[1] - b.box[1] || a.box[0] - b.box[0];
  });
}

FlatMap.prototype.renderCityDiagram = function() {
  if (!this.ready) return;
  var self = this, W = this.W, H = this.H, o = this.opt;
  (o.routes || []).forEach(function(r, i) {
    var e = self.routeEls && self.routeEls[i];
    if (!e) return;
    var d = self.routeD(r);
    e.line.attr('d', d);
    if (!/\bleg\b/.test(r.cls)) e.line.style('stroke-dashoffset', 1 - self.segP[i]);
    if (e.ghost) e.ghost.attr('d', d);
  });
  (this.dots || []).forEach(function(d) {
    var p = self.S(d.ll);
    d.p = p;
    var on = d.idx.indexOf(self.active) >= 0;
    var past = self.active >= 0 && Math.min.apply(null, d.idx) <= self.active;
    d.c.style('opacity', o.dotSet && !o.dotSet[d.city] ? 0 : 1);
    d.c.attr('cx', p[0]).attr('cy', p[1]).attr('r', on ? 5 : (o.dotR || 3.4))
         .attr('class', 'mp-dot ' + (on ? 'cur' : (o.progress && self.active >= 0 ? (past ? 'past' : '') : d.cls)));
    if (d.t) d.t.style('opacity', 0);
  });
  if (this.pulse) this.pulse.attr('display', 'none');
  if (this.ringsG) this.ringsG.selectAll('circle').remove();
  if (this.ctxG) this.ctxG.selectAll('*').remove();
  if (this.gCty) this.gCty.selectAll('*').remove();
  if (this.gSeaL) this.gSeaL.selectAll('*').remove();
  this.gLbl.selectAll('.mp-city-labels').remove();
  var layoutData = cityLabelLayout((this.dots || []).filter(function(d){ return d.t; }), this.active, W, H);
  this.cityLayout = layoutData;
  var gCity = this.gLbl.append('g').attr('class', 'mp-city-labels');
  layoutData.forEach(function(item) {
    gCity.append('line')
      .attr('x1', item.leader[0][0])
      .attr('y1', item.leader[0][1])
      .attr('x2', item.leader[1][0])
      .attr('y2', item.leader[1][1])
      .attr('class', 'mp-city-leader');
    gCity.append('text')
      .attr('x', item.x)
      .attr('y', item.y)
      .attr('text-anchor', item.anchor)
      .attr('dominant-baseline', 'middle')
      .attr('class', 'mp-city-label' + (item.active ? ' cur' : ''))
      .attr('font-size', item.fontSize)
      .text(item.city);
  });
};
FlatMap.prototype.paintCityDiagram = function() {
  var T = this.T, W = this.W, H = this.H, c = this.cx, dpr = this.dpr;
  if (!c) return;
  if (!this.cityGeo) throw new Error('paintCityDiagram: cityGeo not initialized');
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillStyle = '#171512';
  c.fillRect(0, 0, this.cv.width, this.cv.height);
  var m = this.m, t0 = this.t0;
  var K = T.k * m;
  var X = T.k * t0[0] + T.x;
  var Y = T.k * t0[1] + T.y;
  var vx0 = -X / K, vy0 = -Y / K;
  var vx1 = (W - X) / K, vy1 = (H - Y) / K;
  c.setTransform(dpr * K, 0, 0, dpr * K, dpr * X, dpr * Y);
  var metrics = {waterFills:0,roadStrokes:0,riverStrokes:0,coastStrokes:0,hanVisible:false,ids:[]};
  var rows = this.cityGeo;
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (r.b[1][0] < vx0 || r.b[0][0] > vx1 || r.b[1][1] < vy0 || r.b[0][1] > vy1) continue;
    if (r.kind === 'water') {
      var name = (r.name || '').toLowerCase();
      var isHan = /han river|hangang|한강/.test(name);
      if (isHan || !/(river|stream|canal|drain|pond|reservoir|basin)/.test(name)) {
        c.fillStyle = isHan ? '#403528' : '#28241e';
        c.fill(r.p);metrics.waterFills++;if(isHan)metrics.hanVisible=true;if(r.id)metrics.ids.push(r.id);
      }
    } else if (r.kind === 'coast') {
      c.strokeStyle = 'rgba(201,162,122,.28)';
      c.lineWidth = 0.8 / K;
      c.lineJoin = 'round';
      c.lineCap = 'round';
      c.stroke(r.p);metrics.coastStrokes++;
    }
  }
  this.cityPaintMetrics = metrics;
  this.painted = { k: T.k, x: T.x, y: T.y, t: performance.now() };
  this.cv.style.transform = '';
};
function addOSMCredit(el){
 if(!el || el.querySelector('.osm-credit')) return;
 var div = document.createElement('div');
 div.className = 'osm-credit';
 div.innerHTML = '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap contributors</a>';
 el.appendChild(div);
}
function T0k(m){return m.T.k}
FlatMap.prototype.setActive=function(i){this.active=i;this.renderOver()};
FlatMap.prototype.animateSeg=function(i,to,dur,delay){var self=this;var from=this.segP[i];if(RM||!dur){this.segP[i]=to;this.renderOver();return}
 self.segTok=self.segTok||[];var tok=self.segTok[i]=(self.segTok[i]||0)+1;var t0=performance.now()+(delay||0);function fr(now){if(self.dead||self.segTok[i]!==tok)return;var t=Math.max(0,Math.min(1,(now-t0)/dur));self.segP[i]=from+(to-from)*d3.easeCubicInOut(t);var e=self.routeEls&&self.routeEls[i];if(e)e.line.style('stroke-dashoffset',1-self.segP[i]);if(t<1)requestAnimationFrame(fr)}requestAnimationFrame(fr)};
FlatMap.prototype.destroy=function(){this.dead=true;cancelAnimationFrame(this.craf);cancelAnimationFrame(this.raf);try{this.svg.remove();this.cv.remove()}catch(e){}this.landW=this.landD=this.landP=null;this.cx=null;this.cv.width=0;this.cv.height=0;this.hlSet=null;this.cls=null;this.painted=null};
FlatMap.prototype.highlight=function(names){var set={};(names||[]).forEach(function(n){set[n]=1});this.hlSet=set;this.paintLand()};
