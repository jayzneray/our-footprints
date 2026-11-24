/* ---------- lightbox ---------- */
var LB={list:[],i:0};
function openLB(list,i){LB.list=list;LB.i=i||0;var lb=$('#lb');lb.classList.add('open');document.documentElement.style.overflow='hidden';showLB();duck(true)}
function closeLB(){$('#lb').classList.remove('open');document.documentElement.style.overflow='';duck(false)}
function showLB(){var it=LB.list[LB.i];if(!it)return;var im=$('#lb img');im.classList.remove('ld');var n=new Image();n.onload=function(){im.src=n.src;im.alt=it.b||'';requestAnimationFrame(function(){im.classList.add('ld')})};n.src=it.p.src;
 $('#lb .cap').innerHTML='<b>'+esc(it.a||'')+'</b>'+esc(it.b||'')+'<span>'+(LB.i+1)+' / '+LB.list.length+'</span>';
 [LB.i+1,LB.i-1].forEach(function(j){var x=LB.list[(j+LB.list.length)%LB.list.length];if(x){var q=new Image();q.src=x.p.src}})}
function lbStep(d){if(!LB.list.length)return;LB.i=(LB.i+d+LB.list.length)%LB.list.length;showLB()}
function initLB(){var lb=$('#lb');$('.x',lb).onclick=closeLB;$('.pv',lb).onclick=function(e){e.stopPropagation();lbStep(-1)};$('.nv',lb).onclick=function(e){e.stopPropagation();lbStep(1)};
 lb.addEventListener('click',function(e){if(e.target===lb||e.target.classList.contains('stage'))closeLB()});
 var sx=0,sy=0;lb.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
 lb.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))lbStep(dx<0?1:-1);else if(dy>90)closeLB()})}

/* ---------- music ---------- */
var MU={a:null,on:false,want:false,tracks:['public/audio/bgm-main.mp3','public/audio/bgm-alt.mp3'],ti:0,intro:'public/audio/bgm-intro.mp3',introS:60,introDone:false,fade:0,duck:false};
function musicTarget(){var v=document.body.classList.contains('is-detail')?0.15:0.24;if(MU.duck)v*=0.55;return v}
function fadeTo(v,ms,cb){var a=MU.a;if(!a)return;cancelAnimationFrame(MU.fade);var v0=a.volume,t0=performance.now();function f(now){var t=Math.min(1,(now-t0)/ms);a.volume=Math.max(0,Math.min(1,v0+(v-v0)*t));if(t<1)MU.fade=requestAnimationFrame(f);else if(cb)cb()}MU.fade=requestAnimationFrame(f)}
function ensureAudio(){if(MU.a)return MU.a;var a=new Audio();a.preload='none';a.src=MU.ti===0&&!MU.introDone?MU.intro:MU.tracks[MU.ti];a.volume=0;
 // the first minute of the main piece is a small 64kbps file (~470KB), so entering the site never pulls the full 2MB track; when it ends the full track picks up at the same second
 a.addEventListener('ended',function(){if(!MU.introDone&&MU.ti===0){MU.introDone=true;a.src=MU.tracks[0];a.addEventListener('loadedmetadata',function seek(){a.removeEventListener('loadedmetadata',seek);try{a.currentTime=MU.introS}catch(e){}},{once:true});a.play().catch(function(){});return}MU.ti=(MU.ti+1)%MU.tracks.length;a.src=MU.tracks[MU.ti];a.play().catch(function(){});updTip()});MU.a=a;return a}
function musicOn(){var a=ensureAudio();MU.on=true;try{localStorage.setItem('fp-music','on')}catch(e){}a.volume=0;var p=a.play();if(p&&p.catch)p.catch(function(){MU.on=false;updMusic()});fadeTo(musicTarget(),2000);updMusic()}
function musicOff(){MU.on=false;try{localStorage.setItem('fp-music','off')}catch(e){}if(MU.a)fadeTo(0,1200,function(){if(!MU.on)MU.a.pause()});updMusic()}
function updTip(){var tip=$('#music .tip');if(!tip)return;tip.innerHTML=MU.on?('音乐 <em>'+(MU.ti?'Chopin · Nocturne Op. 9 No. 2':'Satie · Gymnopédie No. 1')+'</em>'):'音乐'}
function updMusic(){var b=$('#music');b.classList.toggle('on',MU.on);b.setAttribute('aria-pressed',MU.on?'true':'false');updTip()}
function duck(d){MU.duck=d;if(MU.on&&MU.a)fadeTo(musicTarget(),900)}
function initMusic(){var b=$('#music');b.addEventListener('click',function(e){e.stopPropagation();disarm();MU.want=false;if(MU.on){musicOff()}else{musicOn()}b.classList.add('flash');clearTimeout(b._ft);b._ft=setTimeout(function(){b.classList.remove('flash')},2600)});
 var saved=null;try{saved=localStorage.getItem('fp-music')}catch(e){}
 // default on: only an explicit mute ('off') keeps it quiet on later visits
 if(saved!=='off'){MU.want=true;arm();
  // autoplay attempt waits until the page has loaded, so the mp3 never competes with the hero photo and fonts
  }
 document.addEventListener('visibilitychange',function(){if(!MU.a||!MU.on)return;if(document.hidden)fadeTo(0,500,function(){if(document.hidden)MU.a.pause()});else{MU.a.play().catch(function(){});fadeTo(musicTarget(),1500)}});
 updMusic()}
var ARM_EV=['pointerdown','touchend','click','keydown'];
function onArm(e){if(e&&e.target&&e.target.closest&&e.target.closest('#music'))return;if(!MU.want||MU.on)return;var soft=/scroll|wheel|touchstart/.test(e.type),now=Date.now();if(soft&&now-(MU.lt||0)<700)return;MU.lt=now;tryStart()}
function arm(){ARM_EV.forEach(function(n){window.addEventListener(n,onArm,{capture:true,passive:true})})}
function disarm(){ARM_EV.forEach(function(n){window.removeEventListener(n,onArm,{capture:true,passive:true})})}
// play quietly; if the browser blocks autoplay, wait for the next gesture and fade in over 2s
function tryStart(){if(MU.on||MU.trying)return;var a=ensureAudio();MU.trying=true;a.volume=0;var p;try{p=a.play()}catch(e){MU.trying=false;return}
 var ok=function(){MU.trying=false;MU.on=true;MU.want=false;disarm();fadeTo(musicTarget(),2000);updMusic()};
 if(p&&p.then)p.then(ok,function(){MU.trying=false;try{a.pause()}catch(_){}});else ok()}
/* ---------- router ---------- */
var homeY=0,curRoute=null,navJump=false;
var ALIAS={trips:'y2026',again:'again',places:'again',archive:'archive',countries:'archive',globe:'globe',earth:'globe',map:'globe',intro:'globe'};
function parse(){var h=location.hash.replace(/^#\/?/,'');var m=h.match(/^trip\/([^\/]+)(?:\/(\d+))?/);if(m){var tid=decodeURIComponent(m[1]);if(tid==='china')tid='china-diary';return {v:'trip',id:tid,day:m[2]?+m[2]:0}}
 var c=h.match(/^country\/(.+)$/);if(c){var nm;try{nm=decodeURIComponent(c[1])}catch(e){nm=c[1]}return {v:'country',id:nm}}
 if(/^china/.test(h)||/^trip\/china(\/|$)/.test(h))return {v:'trip',id:'china-diary'};var an=h&&!/^trip\//.test(h)?h:'';if(an&&ALIAS[an])an=ALIAS[an];return {v:'home',anchor:an}}
function cleanup(){routeGen++;if($('#lb').classList.contains('open'))closeLB();homeIO.forEach(function(o){o.disconnect()});homeIO=[];dIO.forEach(function(o){o.disconnect()});dIO=[];
 [ovMap,dMap].concat(homeMaps).forEach(function(m){if(m&&m.destroy)try{m.destroy()}catch(e){}});
 if(globeCtl){globeCtl.destroy();globeCtl=null}homeMaps=[];ovMap=null;dMap=null;actTrip=null;closeSheet()}
function errHTML(){return '<section class="miss"><p>这一页加载出了点问题。</p><a href="#/">回到首页'+ARROW+'</a></section>'}
// old trip ids and unknown routes: old ids open their new trip, anything else goes home (replaceState, never the not-found page)
var TRIP_ALIAS={'2019-korea':'2026-korea','2026-seoul':'2026-korea','edinburgh-again':'','china':'china-diary'};
function knownAnchor(a){if(!a||/^(globe|intro|map|met|turn|again|archive)$/.test(a))return true;var m=a.match(/^y(\d{4})$/);return !!m&&SEQ.some(function(t){return (t.start||'').slice(0,4)===m[1]})}
function fixRoute(r){var to=null;
 if(r.v==='trip'&&!BYID[r.id]){var a=TRIP_ALIAS[r.id];to=a&&BYID[a]?'#/trip/'+a:'#/'}
 else if(r.v==='country'&&!countryIndex().by[r.id])to='#/';
 else if(r.v==='home'&&!knownAnchor(r.anchor))to='#/';
 if(to==null)return r;history.replaceState(null,'',location.pathname+location.search+to);return parse()}
function route(first){
 var r=fixRoute(parse()),view=$('#view');
 if(curRoute&&curRoute.v==='home'&&r.v==='home'&&!r.anchor&&!location.hash.replace(/^#\/?/,'')){window.scrollTo(0,0)}
 if(curRoute&&curRoute.v==='home'&&r.v!=='home')homeY=scrollY;
 if(curRoute&&r.v==='home'&&curRoute.v==='home'){if(r.anchor)scrollToId(r.anchor);return}
 var jump=navJump;navJump=false;
 var go=function(){cleanup();
  document.body.classList.toggle('is-detail',r.v!=='home');
  try{
   if(r.v==='trip'){renderDetail(view,r.id);window.scrollTo(0,0);document.title=(BYID[r.id]?BYID[r.id].title+' · ':'')+'旅行日志'}
   else if(r.v==='country'){renderCountry(view,r.id);window.scrollTo(0,0);document.title=r.id+' · 旅行日志'}
   else{renderHome(view);document.title='旅行日志';
    if(r.anchor&&!document.getElementById(r.anchor)){cleanup();view.innerHTML=missHTML();document.body.classList.add('is-detail');window.scrollTo(0,0)}
    else if(r.anchor&&(jump||!curRoute||curRoute.v==='home'||!homeY)){var an=r.anchor;requestAnimationFrame(function(){scrollToId(an,true)})}
    else window.scrollTo(0,curRoute&&curRoute.v!=='home'?homeY:0)}
  }catch(err){console.error(err);try{cleanup()}catch(_){}view.innerHTML=errHTML()}
  curRoute=r;onScroll();
  if(MU.on&&MU.a)fadeTo(musicTarget(),1500);
  requestAnimationFrame(function(){view.classList.remove('out')})};
 if(first||RM){go()}else{view.classList.add('out');setTimeout(go,300)}
}
function scrollToId(id,instant,sec){id=ALIAS[id]||id;var el=document.getElementById(id);if(!el)return;
 var off=id==='intro'?0:(id==='met'?innerHeight*.3:40);function tgt(){return el.getBoundingClientRect().top+scrollY-off}
 var y=tgt(),far=Math.abs(y-scrollY)>1.2*innerHeight,v=$('#view');
 if(RM||instant||far){
  if(far&&!instant&&!RM){v.classList.add('jump');v.getBoundingClientRect()}
  window.scrollTo({top:y,behavior:'auto'});
  // sections near the landing point may finish layout after the jump; correct once
  var n=0,ok=0;(function fix(){var y2=tgt();if(Math.abs(y2-scrollY)>2){window.scrollTo({top:y2,behavior:'auto'});ok=0}else ok++;if(n===1)v.classList.remove('jump');if(++n<45&&ok<4)requestAnimationFrame(fix);else v.classList.remove('jump')})();
 }else window.scrollTo({top:y,behavior:'smooth'});
 if(sec&&location.hash!=='#/'+sec)history.replaceState(null,'','#/'+sec)}
function openSheet(){var sh=$('#sheet');sh.classList.add('open');$('#menub').setAttribute('aria-expanded','true')}
function closeSheet(){var sh=$('#sheet');if(!sh)return;sh.classList.remove('open');$('#menub').setAttribute('aria-expanded','false')}
function randomDay(){var pool=TRIPS.filter(function(t){return t.kind==='trip'||t.visits||t.moments});var cur=parse().id,pick;do{pick=pool[Math.floor(Math.random()*pool.length)]}while(pool.length>1&&pick.id===cur);location.hash='#/trip/'+pick.id}

/* ---------- scroll ui ---------- */
var ticking=false;
function onScroll(){if(ticking)return;ticking=true;requestAnimationFrame(function(){ticking=false;var y=scrollY,H=document.documentElement.scrollHeight-innerHeight;$('#progress').style.transform='scaleX('+(H>0?y/H:0)+')';
 var top=$('#top');top.classList.toggle('solid',y>innerHeight*0.6||(document.body.classList.contains('is-detail')&&y>innerHeight*0.5));
 top.classList.toggle('show-title',document.body.classList.contains('is-detail')&&y>innerHeight*0.7);
 if(!document.body.classList.contains('is-detail')){var secs=['globe','map','y2026','y2025','y2024','again','archive'],on='';secs.forEach(function(s){var el=document.getElementById(s);if(el&&el.getBoundingClientRect().top<innerHeight*.5)on=s});$$('.nav a').forEach(function(a){var k=a.getAttribute('data-sec');a.classList.toggle('on',k===on||(k==='trips'&&/^y/.test(on)))})}})}

/* ---------- init ---------- */
function init(){
 try{history.scrollRestoration='manual'}catch(e){}
 var q=new URLSearchParams(location.search),storyURL=q.get('story')||'data/trips-story.json';
 Promise.all([J('public/data/trips.json'),J('public/data/places.json'),J(storyURL).catch(function(){return {trips:[]}}),J('public/v9/world.topo.json').then(function(t){return topojson.feature(t,t.objects.c)}),null]).then(function(r){
  WORLD=prepGeo(r[3]);build(r[0],r[1],r[2]);
  initLB();initMusic();
  window.addEventListener('hashchange',function(){try{route(false)}catch(err){console.error(err);$('#view').innerHTML=errHTML()}});
  window.addEventListener('error',function(e){console.error('[fp]',e.message)});
  window.addEventListener('scroll',onScroll,{passive:true});
  var scrC=0,de=document.documentElement;window.addEventListener('scroll',function(){if(!scrC)de.classList.add('scr');clearTimeout(scrC);scrC=setTimeout(function(){scrC=0;de.classList.remove('scr')},160)},{passive:true});
  var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){[ovMap,dMap].concat(homeMaps).forEach(function(m){if(m&&m.el.clientWidth)m.resize()});if(globeCtl)globeCtl.resize()},200)});
  document.addEventListener('click',function(e){var r=e.target.closest('[data-rand]');if(r){e.preventDefault();randomDay();return}var s=e.target.closest('[data-scroll]');if(s){e.preventDefault();scrollToId(s.getAttribute('data-scroll'))}
   var mb=e.target.closest('#menub');if(mb){e.preventDefault();$('#sheet').classList.contains('open')?closeSheet():openSheet();return}
   var a=e.target.closest('a[data-sec]');if(a){e.preventDefault();closeSheet();var sec=a.getAttribute('data-sec');if(parse().v!=='home'){navJump=true;if(location.hash==='#/'+sec){route(false)}else location.hash='#/'+sec}else scrollToId(sec,false,sec);return}
   if($('#sheet').classList.contains('open')&&!e.target.closest('#sheet'))closeSheet()});
  document.addEventListener('keydown',function(e){if(e.metaKey||e.ctrlKey||e.altKey)return;var lb=$('#lb').classList.contains('open');if(e.key==='Escape'&&$('#sheet').classList.contains('open')){closeSheet();return}
   if(lb){if(e.key==='Escape')closeLB();else if(e.key==='ArrowRight')lbStep(1);else if(e.key==='ArrowLeft')lbStep(-1);return}
   if(document.body.classList.contains('is-detail')){if(e.key==='Escape'){location.hash='#/'}else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){var nx=$(e.key==='ArrowRight'?'#dnext':'#dprev');if(nx)location.hash=nx.getAttribute('href')}}});
  try{route(true)}catch(err){console.error(err);$('#view').innerHTML=errHTML()}
  setTimeout(function(){$('#veil').classList.add('gone')},60);
  var idleGeo=function(){if(parse().v==='home')loadDetail();else loadDetailHi()};if('requestIdleCallback' in window)requestIdleCallback(idleGeo);else setTimeout(idleGeo,1500);
 }).catch(function(err){console.error(err);$('#view').innerHTML='<div style="padding:30vh 8vw;color:#8C8378;letter-spacing:.2em">加载失败，请刷新一下。</div>';$('#veil').classList.add('gone')});
}
init();
})();
