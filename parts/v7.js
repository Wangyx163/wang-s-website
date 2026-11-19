/* ══════════ v7：定义文档落地 ══════════ */
const RM7=matchMedia('(prefers-reduced-motion: reduce)');
const SHOT7=/[?&]shot\b/.test(location.search);
const pad2=n=>String(n).padStart(2,'0');
const todayStr=()=>{const d=new Date();return `${d.getFullYear()}.${pad2(d.getMonth()+1)}.${pad2(d.getDate())}`};

let SON=true;
try{SON=localStorage.getItem('tk-snd')!=='0'}catch(e){}

/* ── 照片：最上面一张黑框；第一次看到时显影，换到新的一张也显影一次 ── */
safe('v7pile',()=>{const pps=$$('#pile .pp');if(!pps.length)return;pps[0].classList.add('blk');
 const seen=new Set();let on=false;
 const dev=p=>{if(SHOT7||RM7.matches||!p||seen.has(p))return;seen.add(p);p.classList.add('raw');requestAnimationFrame(()=>requestAnimationFrame(()=>p.classList.remove('raw')))};
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){on=true;dev($('#pile .pp.top'));io.disconnect()}}),{threshold:.4});io.observe($('#pile'));
 document.addEventListener('piletop',()=>{if(on)setTimeout(()=>dev($('#pile .pp.top')),200)})});

/* ── 文具角：拿哪个就是哪个工具 ── */
safe('v7diy',()=>{
 const pick=b=>{if(!TRAYOPEN)$('#traytog').click();const t=b.dataset.pick;if(DIY.tool!==t)setTool(t)};
 document.addEventListener('pointerdown',e=>{if(e.target.closest('.hdiy .dt'))e.stopPropagation()},true);
 document.addEventListener('click',e=>{const b=e.target.closest('.hdiy .dt');if(!b)return;e.stopPropagation();e.preventDefault();pick(b)},true)});

/* ── 一点声音：出票的咔哒、撕纸、打孔、盖章。可以关 ── */
let SCTX=null;
function snd(kind){if(!SON||RM7.matches)return;try{SCTX=SCTX||new (window.AudioContext||window.webkitAudioContext)();const c=SCTX;if(c.state==='suspended')c.resume();if(c.state!=='running')return;const t=c.currentTime;
 const noise=(dur,f,q,vol,t0=t)=>{const n=c.createBuffer(1,Math.ceil(c.sampleRate*dur),c.sampleRate),d=n.getChannelData(0);for(let i=0;i<d.length;i++){const k=i/d.length;d[i]=(Math.random()*2-1)*(kind==='tear'?(.4+.6*Math.random()>.7?1:.35)*(1-k):1)*Math.pow(1-k,kind==='tear'?.6:3)}
  const s=c.createBufferSource();s.buffer=n;const b=c.createBiquadFilter();b.type='bandpass';b.frequency.value=f;b.Q.value=q;const g=c.createGain();g.gain.value=vol;s.connect(b).connect(g).connect(c.destination);s.start(t0)};
 const tone=(f0,f1,dur,vol,type='sine')=>{const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g).connect(c.destination);o.start(t);o.stop(t+dur+.02)};
 if(kind==='feed'){tone(700,500,.035,.04,'square');noise(.05,3200,1.2,.25)}
 if(kind==='tick'){tone(1900,1700,.03,.03,'square')}
 if(kind==='tear'){noise(.32,2600,.9,.9);noise(.18,5200,1.4,.35,t+.05)}
 if(kind==='punch'){tone(1400,900,.02,.05,'square');tone(180,90,.08,.25)}
 if(kind==='stamp'){tone(130,55,.16,.4);noise(.06,900,1,.35)}
}catch(e){}}

const odoHTML=n=>`<span class="odo" aria-label="${String(n).padStart(4,'0')}">${String(n).padStart(4,'0').split('').map(d=>`<span><i style="translate:0 -${d}em">0<br>1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9</i></span>`).join('')}</span>`;
function setOdo(root,n){$$('.odo',root).forEach(o=>{const ds=String(n).padStart(4,'0');$$('i',o).forEach((i,k)=>i.style.translate=`0 -${ds[k]}em`);o.setAttribute('aria-label',ds)})}
function jag7(w,h,side,seed){let a=seed;const R=()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};const pts=[],n=Math.round(h/4);
 if(side==='r'){pts.push([0,0]);for(let i=0;i<=n;i++)pts.push([w-3-R()*4,h*i/n]);pts.push([0,h])}else{for(let i=0;i<=n;i++)pts.push([R()*4+1,h*i/n]);pts.push([w,h]);pts.push([w,0])}
 const d='M'+pts.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join('L')+'Z';
 return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><path d='${d}'/></svg>`)}")`}

/* 撕下时，纸把旁边几件东西扯得轻轻一晃 */
function ripple(ox,oy){if(RM7.matches)return;$$('.home>.hobj,.home>.hfilm').forEach(el=>{if(el.classList.contains('hticket')||el.classList.contains('hname'))return;
 const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=cx-ox,dy=cy-oy,d=Math.hypot(dx,dy)||1,f=Math.max(0,1-d/760);if(f<=.05)return;
 const a=3*f,ux=dx/d,uy=dy/d,base=parseFloat(getComputedStyle(el).rotate)||0,ra=.9*f*(ux>0?1:-1);
 el.animate([{translate:'0 0',rotate:base+'deg'},{translate:`${ux*a}px ${uy*a}px`,rotate:(base+ra)+'deg'},{translate:`${-ux*a*.45}px ${-uy*a*.45}px`,rotate:(base-ra*.5)+'deg'},{translate:`${ux*a*.15}px ${uy*a*.15}px`,rotate:(base+ra*.2)+'deg'},{translate:'0 0',rotate:base+'deg'}],{duration:600,delay:d*.3,easing:'ease-out'})})}

/* ── 磁带：鼠标放上去，卷轴轻轻转一下 ── */
safe('v7reel',()=>{const c=$('#cassette');if(!c)return;let busy=false;
 c.addEventListener('pointerenter',e=>{if(e.pointerType!=='mouse'||busy||TP.mode!=='stop'||RM7.matches)return;busy=true;const a0={L:TP.rot.L,R:TP.rot.R},t0=performance.now();
  const f=t=>{const k=Math.min(1,(t-t0)/650),e2=1-Math.pow(1-k,3);TP.rot.L=a0.L-30*e2;TP.rot.R=a0.R-30*e2;tapeDraw(0);if(k<1)requestAnimationFrame(f);else busy=false};requestAnimationFrame(f)})});

/* ── 放磁带：画板的光变暖一点 ── */
const _tapeSet7=tapeSet;
tapeSet=function(m){_tapeSet7(m);document.body.classList.toggle('playing',TP.mode==='play'&&!TP.voice)};

/* ══════════ v7.1 手感：视差、高光、风 ══════════
   画板不动；放在上面的东西按厚度轻微错开，反光的材质跟着鼠标有一点高光，
   挂着的工牌和只贴了上沿的小票会被鼠标带过的风吹动。触屏和“减少动态效果”下不启用。 */
safe('v7feel',()=>{const home=$('#home');if(!home||SHOT7||RM7.matches||!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
 const L=[['.hbadge',2.2],['.hdiy',3],['.hplayer',4],['.hdeck',3.2],['.hphotos',1.6],['.hfilm',3.4],['.hcards',1.3],['.hticket',1.4],['.hbooks',2.8],['.hrcpt',1]]
  .map(([s,d])=>({el:$(s,home),d,x:0,y:0})).filter(o=>o.el);
 $$('#pile .ppi').forEach(p=>{const g=document.createElement('i');g.className='gl';p.appendChild(g)});
 const mk=(host,br)=>{if(!host)return null;const g=document.createElement('i');g.className='gl';if(br)g.style.borderRadius=br;host.appendChild(g);return g};
 const gBadge=mk($('.hbadge .mcard')),gCas=mk($('#cassette'),'3% / 5%');
 const B={el:$('.hbadge',home),th:0,w:0,base:parseFloat(getComputedStyle($('.hbadge',home)).rotate)||4};
 const R={el:$('.hrcpt .rp',home),th:0,w:0};
 let mx=0,my=0,cx=-1e4,cy=-1e4,vx=0,vy=0,lx=0,ly=0,lt=0,inside=false,lastMove=0,raf=0,prev=0;
 const near=(el,pad)=>{const r=el.getBoundingClientRect();return cx>r.left-pad&&cx<r.right+pad&&cy>r.top-pad&&cy<r.bottom+pad};
 const gloss=(g)=>{if(!g)return;const r=g.parentElement.getBoundingClientRect();const gx=(cx-r.left)/r.width*100,gy=(cy-r.top)/r.height*100;
  const d=Math.hypot(cx-(r.left+r.width/2),cy-(r.top+r.height/2))/Math.max(r.width,r.height);
  g.style.setProperty('--gx',gx.toFixed(1)+'%');g.style.setProperty('--gy',gy.toFixed(1)+'%');g.style.setProperty('--go',inside?Math.max(0,Math.min(1,1.35-d)).toFixed(2):'0')};
 const tick=t=>{const dt=Math.min(.05,(t-(prev||t))/1000)||.016;prev=t;let busy=false;
  L.forEach(o=>{const tx=inside?-mx*o.d:0,ty=inside?-my*o.d*.6:0;o.x+=(tx-o.x)*.1;o.y+=(ty-o.y)*.1;if(Math.abs(tx-o.x)>.02||Math.abs(ty-o.y)>.02)busy=true;o.el.style.translate=`${o.x.toFixed(2)}px ${o.y.toFixed(2)}px`});
  if(B.el){const a=-70*B.th-3.2*B.w;B.w+=a*dt;B.th=Math.max(-8,Math.min(8,B.th+B.w*dt));if(Math.abs(B.th)>.02||Math.abs(B.w)>.05){busy=true;B.el.style.transition='none';B.el.style.rotate=(B.base+B.th).toFixed(2)+'deg'}else if(B.el.style.rotate){B.th=B.w=0;B.el.style.rotate='';B.el.style.transition=''}}
  if(R.el){const a=-95*R.th-7*R.w;R.w+=a*dt;R.th=Math.max(0,Math.min(14,R.th+R.w*dt));if(R.th===0&&R.w<0)R.w=0;if(R.th>.02||Math.abs(R.w)>.05){busy=true;R.el.style.transform=`perspective(520px) rotateX(${R.th.toFixed(2)}deg)`}else if(R.el.style.transform){R.th=R.w=0;R.el.style.transform=''}}
  gloss($('#pile .pp.top .gl'));gloss(gBadge);gloss(gCas);
  if(busy||t-lastMove<900)raf=requestAnimationFrame(tick);else{raf=0;prev=0}};
 const go=()=>{if(!raf)raf=requestAnimationFrame(tick)};
 home.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const now=performance.now(),dt=Math.max(8,now-lt);
  vx=.6*((e.clientX-lx)/dt)+.4*vx;vy=.6*((e.clientY-ly)/dt)+.4*vy;lx=cx=e.clientX;ly=cy=e.clientY;lt=lastMove=now;inside=true;
  mx=(cx/innerWidth-.5)*2;my=(cy/innerHeight-.5)*2;
  if(B.el&&near(B.el,10)){B.w+=Math.max(-3,Math.min(3,vx))*30}
  if(R.el&&near(R.el,50)){const sp=Math.hypot(vx,vy);if(sp>.35)R.w+=sp*26}
  $$('#pile .pp:not(.top) .gl').forEach(g=>g.style.setProperty('--go','0'));go()});
 home.addEventListener('pointerleave',()=>{inside=false;lastMove=performance.now();go()});
 addEventListener('blur',()=>{inside=false;go()})});