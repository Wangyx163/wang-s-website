
/* ── AI 提问：四种入口共用的回答（蒸馏之前先用写死的示例） ── */
const QA=[
 {k:['拍照','照片','摄影','相机','快门'],a:'因为拍照逼我停下来。走在路上看到一条斜线、一块光，按下快门那一下，我才算真的看见了它。',src:'卡片 No.13'},
 {k:['读','书'],a:'桌上三本：《风沙星辰》《控制论与科学方法论》《比山更高》。第一本读得最慢，舍不得读完。',src:'在读'},
 {k:['设计','工作','做什么','怎么做'],a:'先把「下一步能做什么」收窄，再让东西有手感。好的界面，用的人会忘了它在那里。',src:'卡片 No.14'},
 {k:['吉他','弹','音乐','歌','磁带'],a:'磁带里那段是占位的。真正的录音我还在练，练好了就换上去。',src:'磁带 A 面'},
 {k:['你是谁','介绍','whoami'],a:'我是 Your Name。白天[在做的事]，空下来拍照、弹琴、读书。',src:'扉页'}];
const QA0={a:'这个问题我还没被教过怎么回答。我先记下来，真人看到会回你。',src:'待真人回答'};
const answerFor=q=>QA.find(x=>x.k.some(k=>q.includes(k)))||QA0;
function typeOut(el,text,done,sp=36,onStep){if(RM.matches){el.textContent=text;onStep&&onStep();done&&done();return}
 let i=0;const step=()=>{i++;el.textContent=text.slice(0,i);onStep&&onStep();if(i<text.length){setTimeout(step,sp+('，。；！？'.includes(text[i-1])?200:0))}else done&&done()};step()}
function think(el,cb){el.classList.add('thinking');el.textContent='在想…';setTimeout(()=>{el.classList.remove('thinking');cb()},650)}

/* A：扉页「问我」，回答钉成纸条 */
function askA(q){q=q.trim();if(!q)return;const r=answerFor(q),box=$('#slips');const el=document.createElement('div');el.className='slip';
 el.style.setProperty('--r',(Math.random()*3-1.8).toFixed(1)+'deg');
 el.innerHTML='<span class="pin g" aria-hidden="true"></span><p class="sq"></p><p class="sa"></p><p class="sf"><span class="aistamp">AI 代答</span><span></span></p>';
 el.querySelector('.sq').textContent='问：'+q;el.querySelector('.sf span:last-child').textContent='出自'+r.src;
 box.prepend(el);while(box.children.length>2)box.lastChild.remove();const sa=el.querySelector('.sa');think(sa,()=>typeOut(sa,r.a))}

/* B：卡片那一摞最上面的空白卡 */
function askCardHTML(){const d=new Date();return `<article class="icard askcard sk" data-sel="card · 问我"><div class="ic-h"><span>问我  No.${CARDS[0].no+1}</span><span>${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}</span></div><form class="askcf"><textarea class="askta" rows="2" maxlength="60" placeholder="在格子上写一个问题，按回车" aria-label="问 AI 版的我一个问题"></textarea></form><p class="ic-n ask-ans" hidden></p><p class="ic-s ask-src" hidden><span class="aistamp">AI 代答</span><span></span></p><button class="ic-again" type="button" hidden>再问一张</button></article>`}
function wireAskCard(c){if(!c)return;const ta=c.querySelector('.askta'),f=c.querySelector('.askcf'),an=c.querySelector('.ask-ans'),sr=c.querySelector('.ask-src'),ag=c.querySelector('.ic-again');
 const go=()=>{const q=ta.value.trim();if(!q)return;const r=answerFor(q);const p=document.createElement('p');p.className='ic-q';p.textContent=q;f.replaceWith(p);an.hidden=false;
  think(an,()=>typeOut(an,r.a,()=>{sr.hidden=false;sr.lastChild.textContent='出自'+r.src;ag.hidden=false}))};
 f.onsubmit=e=>{e.preventDefault();go()};ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();go()}});ag.onclick=()=>buildStack(true)}

/* C：终端 */
function askC(q){q=q.trim();if(!q)return;const b=$('#tbody'),r=answerFor(q);const l=document.createElement('p');l.className='tq';l.innerHTML='<b>~ %</b>';l.append(q==='whoami'?q:'ask '+q);
 const o=document.createElement('p');o.className='to';b.append(l,o);const sc=()=>b.scrollTop=b.scrollHeight;sc();
 think(o,()=>typeOut(o,r.a,()=>{const s=document.createElement('p');s.className='to src';s.textContent='— AI 代答，出自'+r.src;b.append(s);sc()},22,sc))}

/* D：磁带 B 面 */
let SIDE='A';
function flipTo(side,instant){if(SIDE===side)return;const c=$('#cassette');
 const swap=()=>{c.innerHTML=cassetteSVG(side);SIDE=side;tapeDraw(0);$('#bover').hidden=side!=='B';$('#flipb').firstChild.textContent=side==='B'?'翻回 A 面':'翻到 B 面，问我'};
 if(instant||RM.matches){swap();return}c.classList.add('flip');setTimeout(()=>{swap();c.classList.remove('flip')},150)}
function askD(){const i=$('.bin');const q=i.value.trim();if(!q){i.focus();return}const r=answerFor(q),t=$('#tscript');
 if(TP.mode!=='stop')tapeSet('stop');TP.voice=true;tapeSet('play');
 t.hidden=false;t.innerHTML='<h5>B 面录音稿</h5><p class="q"></p><p class="a"></p><p class="src" hidden><span class="aistamp">AI 代答</span><span></span></p>';
 t.querySelector('.q').textContent='问：'+q;t.style.animation='none';void t.offsetWidth;t.style.animation='';const a=t.querySelector('.a');
 think(a,()=>typeOut(a,'答：'+r.a,()=>{const s=t.querySelector('.src');s.hidden=false;s.lastChild.textContent='出自'+r.src;if(TP.voice){tapeSet('stop');TP.voice=false}},30))}

/* ── 赞你 / 踢你 / 盖章 ── */
const RXS={c:{zan:128,ti:12,zhang:56},r1:{zan:[],ti:[],zhang:[]},r2:{},r4:[],shoes:[]};
const SHOE='<svg viewBox="0 0 30 46"><path d="M15 2c7 0 11 6 11 14 0 6-3 9-4 12-1 2-1 4-1 5H9c0-2-1-4-2-6C5 23 4 19 4 14 4 7 8 2 15 2Z"/><path d="M9 36h12c0 5-2 8-6 8s-6-3-6-8Z"/></svg>';
const THUMB='<svg viewBox="0 0 24 24"><path d="M7 10v10H4V10Zm2 10h7.6a2 2 0 0 0 2-1.6l1.3-6.1A2 2 0 0 0 18 10h-4.5V6.4A2.4 2.4 0 0 0 11.1 4L9 10Z"/></svg>';
const today=()=>{const d=new Date();return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`};
function rxSave(){try{localStorage.setItem('rx-v1',JSON.stringify(RXS))}catch(e){}}
function rxLoad(){try{const s=JSON.parse(localStorage.getItem('rx-v1')||'null');if(s)Object.assign(RXS,s)}catch(e){}}
function setCounts(){['zan','ti','zhang'].forEach(k=>{$$(`[data-c="${k}"]`).forEach(e=>e.textContent=RXS.c[k]);
 const n=String(RXS.c[k]%1000).padStart(3,'0');$$(`.r3cnt[data-k="${k}"] .drum i`).forEach((d,i)=>d.style.transform=`translateY(${-(+n[i])*26}px)`)})}
function bump(k,d=1){RXS.c[k]=Math.max(0,RXS.c[k]+d);setCounts();rxSave()}
function impHTML(k,m,fresh){const st=`left:${m.x}px;top:${m.y}px;rotate:${m.r}deg`,f=fresh?' fresh':'';
 if(k==='zan')return `<span class="imp zan${f}" style="${st}">赞</span>`;if(k==='ti')return `<span class="imp ti${f}" style="${st}">${SHOE}</span>`;
 return `<span class="imp zhang${f}" style="${st}"><b>${m.d||today()}</b><small>来过</small></span>`}
function renderR1(k,fresh){const col=$(`.rcol[data-k="${k}"] .rmarks`);const L=RXS.r1[k];col.innerHTML=L.map((m,i)=>impHTML(k,m,fresh&&i===L.length-1)).join('')}
function renderShoes(fresh){const box=$('.hname .shoes');box.innerHTML=RXS.shoes.map((s,i)=>`<span class="shoe" style="left:${s.x}px;top:${s.y}px;rotate:${s.r}deg${fresh&&i===RXS.shoes.length-1?';animation:stampIn 200ms var(--eo)':''}">${SHOE}</span>`).join('')}
function mk4HTML(m){const st=`left:${m.x}px;top:${m.y}px;rotate:${m.r}deg`;return m.k==='zan'?`<span class="mk4 zan" style="${st}">${THUMB}</span>`:`<span class="mk4 zhang" style="${st}"><b>${m.d}</b><small>来过</small></span>`}
function renderR4(){$('#rx4marks').innerHTML=RXS.r4.map(mk4HTML).join('')}
function homeXY(cx,cy){return hxy({clientX:cx,clientY:cy})}

/* ── 评审面板 ── */
const RV={ai:'a',rx:'1'};
const RVNOTE={a:'A 名字下问我：名字下面一行「问问 AI 版的我」，回答写成一张钉在下面的纸条，标明 AI 代答和出处。',
 b:'B 空白卡片：卡片那一摞最上面是一张空白索引卡，访客在格子上写问题，AI 用蓝墨水在下面回答，问答本身也成了一张卡。',
 c:'C 终端：名字下面一个终端小窗。whoami 介绍你，ask 加问题提问，电脑感最强。',
 d:'D 磁带 B 面：点磁带下面「翻到 B 面」，在 B 面标签上写问题、按红色 REC，磁带转起来，回答像录音稿一样从走带机里打印出来。'};
const RXNOTE={'1':'1 印章台：画板下方一张「到此一游」签到纸，旁边三个橡皮章，点一下就在对应那栏盖一个印。',
 '2':'2 名字下三格：名字下面三个手写勾选框，最轻。',
 '3':'3 琴键计数：沿用走带机的琴键和机械计数器，按下去咔哒一声，数字滚一格。',
 '4':'4 留下痕迹：名字下面三颗按钮。赞会飞出一枚贴纸贴在名字周围，踢会让名字被踢得晃一下并留个鞋印，章盖在名字旁边。'};
function applyRV(){
 $$('[data-ai]').forEach(el=>{el.hidden=!el.dataset.ai.split(' ').includes(RV.ai)});
 $$('[data-rx]').forEach(el=>{el.hidden=el.dataset.rx!==RV.rx});
 $$('#rvai button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===RV.ai));$$('#rvrx button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===RV.rx));
 $('#rvnote').innerHTML=RVNOTE[RV.ai]+'<br>'+RXNOTE[RV.rx]+'<br><span style="color:#8A90B0">回答和数字都是写死的示例。</span>';
 buildStack(RV.ai==='b');if(RV.ai!=='d'){if(TP.voice){TP.voice=false;tapeSet('stop')}flipTo('A',true);$('#tscript').hidden=true}
 try{localStorage.setItem('review-v1',JSON.stringify(RV))}catch(e){}}

safe('review',()=>{try{Object.assign(RV,JSON.parse(localStorage.getItem('review-v1')||'{}'))}catch(e){}rxLoad();
 /* A */
 $('.askf').onsubmit=e=>{e.preventDefault();const i=$('.askin');askA(i.value);i.value=''};$$('.asksug button').forEach(b=>b.onclick=()=>askA(b.dataset.q));
 /* C */
 const tin=$('.tin input');$('.tin').onsubmit=e=>{e.preventDefault();askC(tin.value);tin.value=''};$$('.tsug button').forEach(b=>b.onclick=()=>askC(b.dataset.q));
 $('.term').addEventListener('click',e=>{if(!e.target.closest('button'))tin.focus()});
 /* D */
 $('#flipb').onclick=()=>{if(TP.mode!=='stop')tapeSet('stop');const to=SIDE==='A'?'B':'A';flipTo(to);if(to==='B')setTimeout(()=>$('.bin').focus({preventScroll:true}),260)};
 $('#kRec').onclick=()=>{auInit();clunk(true);if(SIDE!=='B'){flipTo('B');setTimeout(()=>$('.bin').focus({preventScroll:true}),260);return}askD()};
 $('.bform').onsubmit=e=>{e.preventDefault();auInit();clunk(true);askD()};
 /* 1 */
 $$('.rstamp').forEach(b=>b.onclick=()=>{const k=b.dataset.k;b.classList.add('press');setTimeout(()=>b.classList.remove('press'),150);bump(k);
  const col=$(`.rcol[data-k="${k}"] .rmarks`);const w=Math.max(120,col.clientWidth);RXS.r1[k].push({x:Math.round(Math.random()*(w-54)),y:Math.round(4+Math.random()*54),r:Math.round(Math.random()*40-20),d:today()});
  if(RXS.r1[k].length>8)RXS.r1[k].shift();rxSave();renderR1(k,true)});
 /* 2 */
 $$('.rbox').forEach(b=>{const k=b.dataset.k;b.setAttribute('aria-pressed',!!RXS.r2[k]);b.onclick=()=>{RXS.r2[k]=!RXS.r2[k];b.setAttribute('aria-pressed',RXS.r2[k]);bump(k,RXS.r2[k]?1:-1)}});
 /* 3 */
 $$('.r3cnt .drum i').forEach(d=>d.innerHTML=[0,1,2,3,4,5,6,7,8,9,0].map(x=>`<b style="font-weight:500;height:26px">${x}</b>`).join(''));
 $$('.r3key').forEach(b=>b.onclick=()=>{auInit();clunk(true);bump(b.dataset.k)});
 /* 4 */
 const pg=$('.hname'),nm=$('.nm');const sh=document.createElement('div');sh.className='shoes';sh.dataset.rx='4';sh.style.cssText='position:absolute;inset:0;pointer-events:none;z-index:3';pg.appendChild(sh);
 $$('.rpin').forEach(b=>b.onclick=()=>{const k=b.dataset.k;bump(k);
  if(k==='ti'){nm.classList.remove('kicked');void nm.offsetWidth;nm.classList.add('kicked');RXS.shoes.push({x:Math.round(80+Math.random()*560),y:Math.round(10+Math.random()*110),r:Math.round(Math.random()*60-30)});if(RXS.shoes.length>3)RXS.shoes.shift();rxSave();renderShoes(true);return}
  const cx=pg.offsetLeft+pg.offsetWidth/2,cy=pg.offsetTop+90,a=Math.random()*Math.PI*2;
  const m={k,x:Math.round(cx+Math.cos(a)*(390+Math.random()*50)-22),y:Math.round(cy+Math.sin(a)*(200+Math.random()*40)-22),r:Math.round(Math.random()*50-25),d:today()};
  RXS.r4.push(m);if(RXS.r4.length>24)RXS.r4.shift();rxSave();renderR4();
  const el=$('#rx4marks').lastElementChild,br=b.getBoundingClientRect(),[bx,by]=homeXY(br.left+br.width/2,br.top+br.height/2);
  if(el&&!RM.matches)el.animate([{translate:`${bx-m.x-22}px ${by-m.y-22}px`,scale:.3,opacity:.4},{translate:'0 0',scale:1.15,opacity:1,offset:.8},{translate:'0 0',scale:1,opacity:1}],{duration:560,easing:'cubic-bezier(.23,1,.32,1)'})});
 if(!RXS.seeded){RXS.seeded=1;const seed=(k,n)=>{for(let i=0;i<n;i++)RXS.r1[k].push({x:Math.round(6+Math.random()*80),y:Math.round(4+Math.random()*54),r:Math.round(Math.random()*40-20),d:'2026.11.'+(10+i)})};seed('zan',4);seed('ti',2);seed('zhang',3);rxSave()}
 ['zan','ti','zhang'].forEach(k=>renderR1(k));renderShoes();renderR4();setCounts();
 /* 面板 */
 $('#rvai').onclick=e=>{const b=e.target.closest('button');if(b){RV.ai=b.dataset.v;applyRV()}};$('#rvrx').onclick=e=>{const b=e.target.closest('button');if(b){RV.rx=b.dataset.v;applyRV()}};
 const rv=$('#review');if(true){rv.classList.add('min');$('#rvx').textContent='展开';$('#rvx').setAttribute('aria-expanded','false')}
 $('#rvx').onclick=()=>{const m=rv.classList.toggle('min');$('#rvx').textContent=m?'展开':'收起';$('#rvx').setAttribute('aria-expanded',!m)};
 applyRV()});
