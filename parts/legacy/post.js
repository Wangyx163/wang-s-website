/* ④ badge */
safe('badge',()=>{const rig=$('#rig');const P={a:0};let d=null;const ap=()=>{rig.style.transform=`rotate(${P.a}deg)`};
 rig.addEventListener('pointerdown',e=>{if(e.button!==0||matchMedia('(max-width:760px)').matches)return;const pr=rig.parentElement.getBoundingClientRect();const px=pr.left+rig.offsetLeft+110,py=pr.top+rig.offsetTop;
  d={id:e.pointerId,px,py,ang0:Math.atan2(e.clientX-px,e.clientY-py),a0:P.a,moved:false,sx:e.clientX,sy:e.clientY,la:P.a,lt:performance.now(),w:0}});
 rig.addEventListener('pointermove',e=>{if(!d||e.pointerId!==d.id)return;if(!d.moved){if(Math.hypot(e.clientX-d.sx,e.clientY-d.sy)<5)return;d.moved=true;rig.setPointerCapture(e.pointerId);SEL.drag=rig;if(P._raf)cancelAnimationFrame(P._raf)}
  const a=clamp(d.a0-(Math.atan2(e.clientX-d.px,e.clientY-d.py)-d.ang0)*180/Math.PI,-55,55);const now=performance.now();d.w=(a-d.la)/Math.max(8,now-d.lt)*1000;d.la=a;d.lt=now;P.a=a;ap()});
 const end=e=>{if(!d||e.pointerId!==d.id)return;const w=d;d=null;SEL.drag=null;if(!w.moved){rig.classList.toggle('flip');return}P.va=w.w;spring(P,['a'],{a:0},{k:46,c:2.6,onFrame:ap})};
 rig.addEventListener('pointerup',end);rig.addEventListener('pointercancel',end);
 rig.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();rig.classList.toggle('flip')}});
 const h=$('#holo');let ha=0;if(!RM.matches)(function l(){ha=(ha+.4)%360;h.style.setProperty('--ha',ha+'deg');requestAnimationFrame(l)})()});
/* ⑤ thoughts to things */
const STAGES=['好奇','思考','实验','作品'];
const QS=[
 {id:'q1',title:'Agent 为什么需要状态机？',grown:4},
 {id:'q2',title:'游戏机制能教产品什么？',grown:2},
 {id:'q3',title:'照片里的秩序与辽阔从哪来？',grown:3}];
const IT={
 s1:{q:'q1',st:0,type:'spark',title:'Agent 为什么需要状态机？',from:'起点：做 [Agent 项目] 时，模型总在「执行」里打转',date:'2026.03',body:['做 [Agent 项目] 时发现：模型很会回答问题，却不太会决定「下一步该做什么」。同一个任务，它有时跳过检查，有时在执行里反复打转。','于是冒出这个问题：是不是应该把流程从模型手里拿出来？'],links:['n1','n2']},
 n1:{q:'q1',st:1,type:'note',grow:'常青',title:'把「下一步能做什么」收窄',ex:'模型擅长在给定选项里挑，不擅长自己设计流程。',body:['模型擅长在给定的几个选项里挑一个，不擅长自己设计流程。状态机做的事情很朴素：在每个状态下，只列出合法的下一步。','这样，自由度留给「怎么做」，而「做什么」由结构决定。'],links:['n2','e1']},
 n2:{q:'q1',st:1,type:'note',grow:'发芽',title:'失败也是一个状态',ex:'检查不通过时，回到一个明确的状态，而不是从头再来。',body:['检查不通过时，Agent 不该从头再来，而是回到一个明确的状态，比如「重新计划」。','把失败写成一条边，它就能被观察、被统计、被改进。'],links:['e1','t1']},
 e1:{q:'q1',st:2,type:'exp',title:'实验：跑 12 步',body:['同一个随机的「模型」，一边自由决定下一步，一边被状态机约束。点「跑一次」多试几轮，看哪边更常在 12 步内完成。'],links:['t1','n1']},
 t1:{q:'q1',st:3,type:'thing',title:'[Agent 项目]',sub:'Demo · 状态机 + RAG',cover:'agent',body:['这里是作品页：问题 → 决策 → 结果，附一个能点开的 Demo。','它从上面那条问题长出来，所以页面底部会反过来链接到那些笔记和实验。'],links:['n1','t2']},
 t2:{q:'q1',st:3,type:'thing',title:'[论文标题]',sub:'论文 · [会议] 20XX',cover:'paper',body:['论文也是一种「作品」。两句摘要，加上你在其中的贡献，附 PDF / DOI。'],links:['n2']},
 s2:{q:'q2',st:0,type:'spark',title:'游戏机制能教产品什么？',from:'起点：[玩某个游戏时的一个瞬间]',date:'2026.05',body:['[那个瞬间是什么，为什么让你想到产品]'],links:['n3']},
 n3:{q:'q2',st:1,type:'note',grow:'种子',title:'[一个还没想清楚的判断]',ex:'种子阶段：先把问题本身写下来。',body:['种子阶段的笔记允许不完整。先把问题写下来，等它慢慢长。'],links:['s2']},
 s3:{q:'q3',st:0,type:'spark',title:'照片里的秩序与辽阔从哪来？',from:'起点：翻看自己拍的照片',date:'2026.07',body:['翻看自己拍的照片，发现总被两种东西吸引：规整的线条，和开阔的地方。'],links:['n4','t3']},
 n4:{q:'q3',st:1,type:'note',grow:'发芽',title:'弯路比直路好看',ex:'[关于构图里曲线的一点观察]',body:['[一点关于构图的观察，配一张照片]'],links:['t3']},
 t3:{q:'q3',st:3,type:'thing',title:'[一组照片]',sub:'摄影集 · 4 张',cover:'photo',body:['作品不一定是代码。一组照片也可以是这个问题长出来的东西。'],links:['n4']}
};
let CURQ='q1';const READ=[];
const COVER={agent:`<svg viewBox="0 0 200 150" style="width:100%;height:100%;display:block;background:#1F2A6B"><g stroke="#8EA1FF" stroke-width="1" opacity=".35">${Array.from({length:11},(_,i)=>`<line x1="${i*20}" y1="0" x2="${i*20}" y2="150"/>`).join('')}${Array.from({length:8},(_,i)=>`<line x1="0" y1="${i*20}" x2="200" y2="${i*20}"/>`).join('')}</g><g fill="none" stroke="#fff" stroke-width="2"><circle cx="50" cy="60" r="16"/><circle cx="100" cy="60" r="16"/><circle cx="150" cy="60" r="16"/><circle cx="100" cy="112" r="16" fill="#fff"/><path d="M66 60h18M116 60h18M150 76c0 26-20 36-34 36M84 112c-18 0-34-14-34-36"/></g><text x="12" y="140" fill="#fff" font-family="IBM Plex Mono" font-size="10">state machine</text></svg>`,
 paper:`<div style="width:100%;height:100%;background:#E8DFCB;padding:16px;display:flex;flex-direction:column;justify-content:space-between;color:#2B2722"><span style="font:500 10px 'IBM Plex Mono'">PROCEEDINGS · 20XX</span><span style="font:700 26px/1.1 'Noto Serif SC'">[论文<br>标题]</span><span style="height:5px;background:#2B2722;width:40%"></span></div>`,
 photo:`<img src="photos/DSC_2660_s.jpg" alt="">`};
safe('ttt',()=>{
 $('#qs').innerHTML=QS.map(q=>`<button class="q" data-q="${q.id}" aria-pressed="${q.id===CURQ}"><b>${q.title}</b><small><span class="grow">${[0,1,2,3].map(i=>`<i class="${i<q.grown?'f':''}"></i>`).join('')}</span>${STAGES[q.grown-1]}阶段</small></button>`).join('');
 $('#qs').addEventListener('click',e=>{const b=e.target.closest('.q');if(!b)return;CURQ=b.dataset.q;$$('.q').forEach(x=>x.setAttribute('aria-pressed',x===b));READ.length=0;renderReader();renderPath()});
 $('#cols').addEventListener('click',e=>{if(e.target.closest('.sim'))return;const c=e.target.closest('.card');if(c){READ.length=0;openRead(c.dataset.id)}});
 $('#cols').addEventListener('pointerover',e=>{const c=e.target.closest('.card');hi(c?c.dataset.id:null)});
 $('#cols').addEventListener('pointerleave',()=>hi(null));
 renderPath()});
function hi(id){$$('.card').forEach(c=>c.classList.toggle('hi',c.dataset.id===id));$$('#graph .dot').forEach(d=>d.classList.toggle('hi',d.dataset.id===id))}
function cardHTML(id){const it=IT[id];
 if(it.type==='spark')return `<button class="card c-spark" data-id="${id}"><span class="cs"><span class="qm">?</span><b>${it.title}</b><span class="kind">${it.from}</span><span class="kind">${it.date}</span></span></button>`;
 if(it.type==='note')return `<button class="card c-note" data-id="${id}"><span class="cs"><span class="badge">${growIcon(it.grow)}${it.grow}</span><b>${it.title}</b><p>${it.ex}</p></span></button>`;
 if(it.type==='exp')return `<div class="card c-exp" data-id="${id}" role="button" tabindex="0"><span class="cs sim" id="sim"></span></div>`;
 return `<button class="card c-thing" data-id="${id}"><span class="cs"><span class="cover">${COVER[it.cover]}</span><span class="meta"><b>${it.title}</b><small>${it.sub}</small></span></span></button>`}
function growIcon(g){return g==='种子'?'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20v-6M12 14c0-3 2-5 5-5 0 3-2 5-5 5zM6 20h12"/></svg>':g==='发芽'?'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 21V10M12 13c0-3 2.4-5.4 6-5.4 0 3.6-2.4 5.4-6 5.4zM12 10c0-2.6-2-4.6-5-4.6 0 2.8 2 4.6 5 4.6z"/></svg>':'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l5 7h-3l4 6h-4l3 4H7l3-4H6l4-6H7z"/></svg>'}
function renderPath(){const ids=Object.keys(IT).filter(k=>IT[k].q===CURQ);
 $('#cols').innerHTML=STAGES.map((s,si)=>{const inS=ids.filter(k=>IT[k].st===si);return `<div class="col"><div class="colh"><span>${si+1} · ${s}</span><small>${inS.length||'—'}</small></div>${inS.length?inS.map(cardHTML).join(''):`<div class="empty"><b>还没长出来</b>${si===2?'[一个可以玩的小实验]':si===3?'等它长成作品':'—'}</div>`}</div>`}).join('');
 if($('#sim'))sim();
 requestAnimationFrame(()=>drawGraph(ids))}
function drawGraph(ids,anim=true){const g=$('#graph');const W=g.clientWidth;if(!W)return;const cw=W/4;const y0=40,y1=74;
 const pos={};const byS=[0,1,2,3].map(s=>ids.filter(k=>IT[k].st===s));
 byS.forEach((arr,s)=>arr.forEach((k,i)=>{pos[k]={x:s*cw+24+i*34,y:IT[k].type==='exp'?y1:y0}}));
 let main='',branch='',todo='';const pts=ids.filter(k=>IT[k].type!=='exp').sort((a,b)=>pos[a].x-pos[b].x);
 pts.forEach((k,i)=>{const p=pos[k];main+=(i?'L':'M')+p.x+' '+p.y});
 const lastS=Math.max(...ids.map(k=>IT[k].st));const endX=pts.length?pos[pts[pts.length-1]].x:24;if(lastS<3)todo=`M${endX} ${y0}L${3*cw+24} ${y0}`;
 ids.filter(k=>IT[k].type==='exp').forEach(k=>{const p=pos[k];const prev=pts.filter(q=>pos[q].x<p.x).pop();const next=pts.find(q=>pos[q].x>p.x);
  if(prev)branch+=`M${pos[prev].x} ${y0}C${pos[prev].x+30} ${y0} ${p.x-30} ${y1} ${p.x} ${y1}`;if(next)branch+=`M${p.x} ${y1}C${p.x+30} ${y1} ${pos[next].x-30} ${y0} ${pos[next].x} ${y0}`});
 g.innerHTML=`${STAGES.map((s,i)=>`<text x="${i*cw+24}" y="14">${['curiosity','notes','experiments','things'][i]}</text>`).join('')}
  <path class="ln todo" d="${todo}"/><path class="ln${anim?' draw':''}" id="gmain" d="${main}"/><path class="ln${anim?' draw':''}" d="${branch}"/>
  ${ids.map(k=>`<circle class="dot${IT[k].type==='thing'?' f':''}" data-id="${k}" cx="${pos[k].x}" cy="${pos[k].y}" r="6"><title>${IT[k].title}</title></circle>`).join('')}`;
 $$('#graph .draw').forEach(p=>{const L=p.getTotalLength?Math.ceil(p.getTotalLength()):800;p.style.setProperty('--len',L||1)});
 $$('#graph .dot').forEach(d=>{d.addEventListener('pointerenter',()=>hi(d.dataset.id));d.addEventListener('click',()=>{READ.length=0;openRead(d.dataset.id)})})}
function openRead(id,from){const at=from==null?READ.length:READ.indexOf(from)+1;READ.splice(at);if(!READ.includes(id))READ.push(id);renderReader();if(window.innerWidth<1100||READ.length>1){const r=$('#reader');r.scrollTo({left:r.scrollWidth,behavior:RM.matches?'auto':'smooth'})}}
function renderReader(still){const r=$('#reader');const n=READ.length;
 r.innerHTML=READ.map((id,i)=>{const it=IT[id];const back=Object.keys(IT).filter(k=>IT[k].links.includes(id));
  if(n>2&&i<n-2&&window.innerWidth>760)return `<div class="pane mini" data-i="${i}" role="button" tabindex="0">${it.title}</div>`;
  return `<article class="pane${still||i<n-1?' still':''}" data-id="${id}"><button class="x" data-close="${i}" aria-label="关闭这一页">✕</button><span class="kind">${STAGES[it.st]} · ${{spark:'问题',note:'笔记',exp:'实验',thing:'作品'}[it.type]}${it.grow?' · '+it.grow:''}</span><h3>${it.title}</h3>${it.body.map(p=>`<p>${p}</p>`).join('')}
   <span class="kind">链接到</span><div class="lk">${it.links.map(l=>`<button data-open="${l}" data-from="${id}">${IT[l].title}</button>`).join('')}</div>
   ${back.length?`<span class="kind" style="display:block;margin-top:12px">被这些提到</span><div class="lk">${back.map(l=>`<button data-open="${l}" data-from="${id}">${IT[l].title}</button>`).join('')}</div>`:''}</article>`}).join('')}
safe('reader',()=>{$('#reader').addEventListener('click',e=>{const o=e.target.closest('[data-open]');if(o){openRead(o.dataset.open,o.dataset.from);return}
 const x=e.target.closest('[data-close]');if(x){READ.splice(+x.dataset.close);renderReader();return}
 const m=e.target.closest('.pane.mini');if(m){READ.splice(+m.dataset.i+1);renderReader()}})});
function sim(){const box=$('#sim');const S=[['计划',30,30],['执行',110,30],['检查',190,30],['完成',190,92]];
 box.innerHTML=`<h4><span>实验：跑 12 步</span><span id="simmode">状态机</span></h4>
  <svg class="simsvg" viewBox="0 0 230 118" aria-label="状态图"><path d="M48 30h44M128 30h44M190 48v26M174 40C140 80 70 80 40 46"/><path d="M174 40C140 80 70 80 40 46" stroke-dasharray="3 4"/>
   ${S.map((s,i)=>`<circle class="s" data-s="${i}" cx="${s[1]}" cy="${s[2]}" r="17"/><text x="${s[1]}" y="${s[2]+4}" text-anchor="middle">${s[0]}</text>`).join('')}
   <text x="96" y="84" font-size="9">失败 → 重新计划</text></svg>
  <div class="seg" role="group" aria-label="模式" style="margin:4px 0"><button aria-pressed="true" data-mode="fsm">状态机</button><button aria-pressed="false" data-mode="free">自由决定</button></div>
  <div class="simlog" id="simlog"></div><div class="simres" id="simres">点「跑一次」</div>
  <div style="display:flex;gap:6px;margin-top:6px"><button class="btn sys" id="simrun" style="min-height:34px">跑一次</button><button class="btn" id="simten" style="min-height:34px">跑 20 次</button></div>`;
 let mode='fsm';let stats={ok:0,n:0};
 $$('.seg button',box).forEach(b=>b.onclick=e=>{e.stopPropagation();mode=b.dataset.mode;$$('.seg button',box).forEach(x=>x.setAttribute('aria-pressed',x===b));$('#simmode').textContent=b.textContent;stats={ok:0,n:0};$('#simres').textContent='点「跑一次」';$('#simlog').innerHTML=''});
 const once=()=>{let s=0,log=[],done=false,reps=0;for(let k=0;k<12&&!done;k++){let nx;
   if(mode==='fsm'){nx=s===0?1:s===1?2:(Math.random()<.35?0:3)}else{const r=Math.random();nx=r<.45?1:r<.62?0:r<.82?2:3;if(s===1&&nx===1)reps++;if(nx===3&&!log.includes('检查'))nx=1}
   log.push(S[nx][0]);if(nx===3&&(mode==='fsm'||log.includes('检查')))done=true;s=nx}
  return{log,done,reps}};
 const show=(r)=>{$('#simlog').innerHTML=r.log.map(l=>`<i class="${l==='执行'&&mode==='free'&&r.reps>1?'bad':''}">${l}</i>`).join('');
  stats.n++;if(r.done)stats.ok++;$('#simres').textContent=`${r.done?'✓ 12 步内完成':'✗ 没完成'} · 累计 ${stats.ok}/${stats.n}${mode==='free'&&r.reps?' · 连续执行 '+r.reps+' 次':''}`;
  if(RM.matches)return;let i=0;const cs=$$('circle.s',box);const tick=()=>{cs.forEach(c=>c.classList.remove('on'));if(i>=r.log.length)return;cs[S.findIndex(s=>s[0]===r.log[i])].classList.add('on');i++;setTimeout(tick,150)};tick()};
 $('#simrun').onclick=e=>{e.stopPropagation();show(once())};
 $('#simten').onclick=e=>{e.stopPropagation();let last;for(let i=0;i<19;i++){const r=once();stats.n++;if(r.done)stats.ok++;last=r}show(once())};
 box.addEventListener('click',e=>{if(!e.target.closest('button'))openRead('e1')})}
/* ⑥ collection */
const CH=['形状与秩序','声音','界面','句子'];
const BL=[
 {k:'image',t:'傍晚的弧线',c:['形状与秩序'],src:'photos/blk_path.jpg',from:'DSC_2660 局部',d:'2026.11'},
 {k:'quote',t:'[一句收藏的句子]',c:['句子'],q:'「[一句收藏的句子，打字机字体，像从旧报纸上剪下来]」',from:'[出处]',d:'2026.11'},
 {k:'color',t:'苔绿与赤陶',c:['形状与秩序'],from:'从照片里取色',d:'2026.11'},
 {k:'image',t:'旗子的斜线',c:['形状与秩序'],src:'photos/blk_flags.jpg',from:'DSC_2005 局部',d:'2026.11'},
 {k:'ui',t:'一个手感好的开关',c:['界面'],from:'活的组件，可以按',d:'2026.11'},
 {k:'sound',t:'[一段录音]',c:['声音'],from:'[在哪录的] · 0:42',d:'2026.10'},
 {k:'image',t:'等风的人',c:['形状与秩序','句子'],src:'photos/blk_bench.jpg',from:'DSC_2175 局部',d:'2026.10'},
 {k:'link',t:'[一个好网站]',c:['界面'],url:'[网址]',from:'[为什么收藏]',d:'2026.10'},
 {k:'slider',t:'一根顺手的滑杆',c:['界面'],from:'活的组件，可以拖',d:'2026.09'},
 {k:'image',t:'水面',c:['声音','形状与秩序'],src:'photos/blk_water.jpg',from:'DSC_2175 局部',d:'2026.09'},
 {k:'quote',t:'[读到的一段话]',c:['句子'],q:'「[读到的一段话]」',from:'[书名]，p.[页码]',d:'2026.09'},
 {k:'empty',t:'留给下一个',c:[],from:'',d:''}
];
const corners='<i class="corner a"></i><i class="corner b"></i><i class="corner c"></i><i class="corner d"></i>';
function blockInner(b){
 if(b.k==='image')return `<div class="mount">${corners}<img src="${b.src}" alt="${b.t}" loading="lazy"></div>`;
 if(b.k==='quote')return `<div class="bquote" style="rotate:${b.t.length%2?-1.5:1}deg">${b.q}</div>`;
 if(b.k==='color')return `<div class="bcolor"><span style="background:#566A4B">#566A4B</span><span style="background:#AD5636">#AD5636</span><span style="background:#C49D6E">#C49D6E</span></div>`;
 if(b.k==='link')return `<div class="blink"><div class="fav">N</div><b style="font:700 14px/1.4 'Noto Sans SC'">${b.t}</b><div class="kind">${b.url}</div></div>`;
 if(b.k==='sound')return `<div class="bsound"><div class="kind" style="color:#9CA19B">0:42</div><svg viewBox="0 0 120 56" preserveAspectRatio="none">${Array.from({length:40},(_,i)=>{const h=6+Math.abs(Math.sin(i*1.7)*Math.cos(i*.4))*44;return `<rect x="${i*3}" y="${28-h/2}" width="1.8" height="${h}" fill="#8EA1FF"/>`}).join('')}</svg></div>`;
 if(b.k==='ui')return `<div class="bui" data-nodrag><button class="tog" role="switch" aria-checked="true" aria-label="示例开关"></button><span class="kind">220ms · ease-out</span></div>`;
 if(b.k==='slider')return `<div class="bui"><input class="rng" type="range" min="0" max="100" value="62" aria-label="示例滑杆"><span class="kind" id="rngv">62</span></div>`;
 return `<div class="bempty"><b>+</b>粘贴链接或拖入图片<br>留给下一个</div>`}
let FCH='全部';
safe('found',()=>{const wrap=$('#blocks');
 wrap.innerHTML=BL.map((b,i)=>`<div class="blk" data-i="${i}" role="button" tabindex="0" aria-label="${b.t}"><div class="bx">${blockInner(b)}</div><div class="bt">${b.t}</div><div class="bm"><span>${b.c.join(' / ')||'—'}</span><span>${b.d}</span></div></div>`).join('');
 $('#bcount').textContent=BL.length-1;$('#bupd').textContent='2026.11';
 $('#chips').innerHTML=['全部',...CH].map(c=>`<button class="fchip" aria-pressed="${c===FCH}" data-c="${c}">${c}</button>`).join('');
 $('#chips').addEventListener('click',e=>{const b=e.target.closest('.fchip');if(!b)return;FCH=b.dataset.c;$$('.fchip',$('#chips')).forEach(x=>x.setAttribute('aria-pressed',x===b));$$('.blk',wrap).forEach(el=>{const bl=BL[+el.dataset.i];el.hidden=!(FCH==='全部'||bl.c.includes(FCH)||bl.k==='empty')})});
 wrap.addEventListener('click',e=>{if(e.target.closest('.tog')){const t=e.target.closest('.tog');t.setAttribute('aria-checked',t.getAttribute('aria-checked')!=='true');e.stopPropagation();return}
  if(e.target.closest('.rng'))return;const el=e.target.closest('.blk');if(el)openBlock(+el.dataset.i)});
 wrap.addEventListener('input',e=>{if(e.target.classList.contains('rng'))$('#rngv').textContent=e.target.value});
 wrap.addEventListener('keydown',e=>{const el=e.target.closest('.blk');if(el&&e.target===el&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openBlock(+el.dataset.i)}});
 $('#mclose').onclick=closeBlock;$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeBlock()});$('#modal').addEventListener('keydown',e=>{if(e.key==='Escape')closeBlock()});
 $('#mconn').onclick=()=>{const b=$('#mconn');const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on);b.textContent=on?'已连到「我的收藏」':'连到「我的收藏」'}});
let lastF=null;
function openBlock(i){const b=BL[i];lastF=document.activeElement;$('#mkind').textContent={image:'图片块',quote:'文字块',color:'颜色块',link:'链接块',sound:'声音块',ui:'组件块',slider:'组件块',empty:'空块'}[b.k];$('#mtitle').textContent=b.t;
 $('#mprev').innerHTML=b.k==='image'?`<img src="${b.src}" alt="${b.t}">`:`<div style="width:min(300px,80%)">${blockInner(b)}</div>`;
 $('#mdl').innerHTML=`<dt>来源</dt><dd>${b.from||'—'}</dd><dt>收进于</dt><dd>${b.d||'—'}</dd><dt>连接</dt><dd>${b.c.length?b.c.map(c=>'「'+c+'」').join(' '):'还没有连到任何频道'}</dd>`;
 $('#mconn').setAttribute('aria-pressed','false');$('#mconn').textContent='连到「我的收藏」';$('#modal').classList.add('show');$('#mclose').focus()}
function closeBlock(){$('#modal').classList.remove('show');lastF&&lastF.focus()}
window.addEventListener('resize',()=>{clearTimeout(window._rt);window._rt=setTimeout(()=>{safe('graph',()=>drawGraph(Object.keys(IT).filter(k=>IT[k].q===CURQ),false));renderReader(true)},150)});