const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const safe=(name,fn)=>{try{fn()}catch(e){console.error(name,e)}};
const go=id=>document.getElementById(id).scrollIntoView({behavior:RM.matches?'auto':'smooth'});
safe('noise',()=>{const c=document.createElement('canvas');c.width=c.height=160;const g=c.getContext('2d');let d=g.createImageData(160,160);
 for(let i=0;i<d.data.length;i+=4){const v=120+Math.random()*135;d.data[i]=v;d.data[i+1]=v*.96;d.data[i+2]=v*.9;d.data[i+3]=Math.random()<.5?34:12}
 g.putImageData(d,0,0);document.documentElement.style.setProperty('--noise',`url(${c.toDataURL()})`);
 d=g.createImageData(160,160);for(let i=0;i<d.data.length;i+=4){const r=Math.random();d.data[i+3]=r<.12?40:r<.3?170:255}
 g.putImageData(d,0,0);document.documentElement.style.setProperty('--grit',`url(${c.toDataURL()})`)});

/* springs + drag */
function spring(st,keys,targets,{k=420,c=34,onFrame,onDone}={}){
 if(st._raf)cancelAnimationFrame(st._raf);
 if(RM.matches){keys.forEach(key=>{st[key]=targets[key];st['v'+key]=0});onFrame&&onFrame();onDone&&onDone();return}
 let last=performance.now();
 const step=t=>{const dt=Math.min(.032,(t-last)/1000);last=t;let busy=false;
  keys.forEach(key=>{const a=-k*(st[key]-targets[key])-c*(st['v'+key]||0);st['v'+key]=(st['v'+key]||0)+a*dt;st[key]+=st['v'+key]*dt;if(Math.abs(st[key]-targets[key])>.05||Math.abs(st['v'+key])>.5)busy=true});
  onFrame&&onFrame();if(busy)st._raf=requestAnimationFrame(step);else{keys.forEach(key=>{st[key]=targets[key];st['v'+key]=0});onFrame&&onFrame();st._raf=null;onDone&&onDone()}};
 st._raf=requestAnimationFrame(step)}
let Z=10;const SEL={el:null,drag:null};
function draggable(el,{onTap,handle}={}){
 el._drag=true;const base=parseFloat(el.dataset.r||0);const st={x:0,y:0,r:base};
 const apply=()=>{el.style.transform=`translate(${st.x}px,${st.y}px) rotate(${st.r}deg)`};apply();el._st=st;
 const box=el.parentElement;let d=null;
 const lim=()=>({minX:-el.offsetLeft+30,maxX:box.clientWidth-el.offsetLeft-el.offsetWidth-30,minY:-el.offsetTop+10,maxY:box.clientHeight-el.offsetTop-el.offsetHeight+30});
 const fix=L=>({minX:Math.min(L.minX,L.maxX),maxX:Math.max(L.minX,L.maxX),minY:Math.min(L.minY,L.maxY),maxY:Math.max(L.minY,L.maxY)});
 const rub=(v,a,b)=>v<a?a-(a-v)*.25:v>b?b+(v-b)*.25:v;
 el.addEventListener('pointerdown',e=>{if(d||e.button!==0||matchMedia('(max-width:760px)').matches)return;if(e.target.closest('[data-nodrag],input,a,label'))return;if(handle&&!e.target.closest(handle))return;
  d={id:e.pointerId,sx:e.clientX,sy:e.clientY,ox:st.x,oy:st.y,moved:false,lx:e.clientX,ly:e.clientY,lt:performance.now(),vx:0,vy:0}});
 el.addEventListener('pointermove',e=>{if(!d||e.pointerId!==d.id)return;const dx=e.clientX-d.sx,dy=e.clientY-d.sy;
  if(!d.moved){if(Math.hypot(dx,dy)<5)return;d.moved=true;el.setPointerCapture(e.pointerId);el.classList.add('lifted');el.style.zIndex=++Z;SEL.drag=el;if(st._raf)cancelAnimationFrame(st._raf)}
  const now=performance.now(),dt=Math.max(8,now-d.lt);d.vx=.7*((e.clientX-d.lx)/dt)+.3*d.vx;d.vy=.7*((e.clientY-d.ly)/dt)+.3*d.vy;d.lx=e.clientX;d.ly=e.clientY;d.lt=now;
  const L=fix(lim());st.x=rub(d.ox+dx,L.minX,L.maxX);st.y=rub(d.oy+dy,L.minY,L.maxY);st.r=base+clamp(d.vx*5,-5,5);apply()});
 const end=e=>{if(!d||e.pointerId!==d.id)return;const w=d;d=null;if(!w.moved){onTap&&onTap(e);return}el.classList.remove('lifted');SEL.drag=null;
  const L=fix(lim());st.vx=w.vx*1000;st.vy=w.vy*1000;spring(st,['x','y','r'],{x:clamp(st.x+w.vx*110,L.minX,L.maxX),y:clamp(st.y+w.vy*110,L.minY,L.maxY),r:base},{k:260,c:26,onFrame:apply})};
 el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
 el.addEventListener('keydown',e=>{if(e.target!==el)return;const m={ArrowLeft:[-10,0],ArrowRight:[10,0],ArrowUp:[0,-10],ArrowDown:[0,10]}[e.key];
  if(m){e.preventDefault();const L=fix(lim());st.x=clamp(st.x+m[0],L.minX,L.maxX);st.y=clamp(st.y+m[1],L.minY,L.maxY);apply();return}
  if((e.key==='Enter'||e.key===' ')&&onTap){e.preventDefault();onTap(e)}});
 return st}
document.addEventListener('dragstart',e=>{if(e.target.closest&&e.target.closest('.obj,.stack,.rig'))e.preventDefault()});
/* selection overlay */
safe('sel',()=>{const sel=$('#sel'),nm=$('#selname'),dm=$('#seldim');const fine=matchMedia('(hover:hover) and (pointer:fine)');let raf=null;
 function loop(){const el=SEL.drag||SEL.el;if(!el){sel.classList.remove('show');raf=null;return}
  const r=el.getBoundingClientRect();sel.style.transform=`translate(${r.left-4}px,${r.top-4}px)`;sel.style.width=r.width+8+'px';sel.style.height=r.height+8+'px';
  nm.textContent=el.dataset.sel;const st=el._st;dm.textContent=st&&SEL.drag===el?`x ${Math.round(st.x)}  y ${Math.round(st.y)}  ${st.r.toFixed(1)}°`:`${Math.round(r.width)} × ${Math.round(r.height)}`;
  sel.classList.add('show');raf=requestAnimationFrame(loop)}
 document.addEventListener('pointerover',e=>{if(!fine.matches)return;const el=e.target.closest('[data-sel]');if(el!==SEL.el){SEL.el=el;if(!raf)raf=requestAnimationFrame(loop)}});
 document.addEventListener('pointerleave',()=>{SEL.el=null});
});