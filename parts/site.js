
/* ── 一摞纸：照片和卡片共用。拖开最上面一张，或点一下，它会滑到最底下 ── */
function paperStack(root,els,slots,onChange){
 const ORD=els.map((_,i)=>i),ST=els.map(()=>({x:0,y:0,r:0}));
 const ap=i=>{const s=ST[i];els[i].style.transform=`translate(calc(-50% + ${s.x.toFixed(1)}px),calc(-50% + ${s.y.toFixed(1)}px)) rotate(${s.r.toFixed(2)}deg)`};
 const z=()=>{ORD.forEach((i,pos)=>{els[i].style.zIndex=ORD.length-pos;els[i].classList.toggle('top',pos===0)});onChange&&onChange(ORD[0])};
 const settle=(i,k=210,c=23)=>spring(ST[i],['x','y','r'],slots[ORD.indexOf(i)%slots.length],{k,c,onFrame:()=>ap(i)});
 ORD.forEach((i,pos)=>{Object.assign(ST[i],slots[pos%slots.length]);ap(i)});z();
 const out=(i,nx,ny,after)=>{const W=els[i].offsetWidth,s=ST[i];spring(s,['x','y','r'],{x:s.x+nx*W*.7,y:s.y+ny*W*.25,r:s.r+nx*7},{k:240,c:25,onFrame:()=>ap(i)});setTimeout(after,190)};
 const next=(nx=1,ny=-.12)=>{out(ORD[0],nx,ny,()=>{ORD.push(ORD.shift());z();ORD.forEach(j=>settle(j))})};
 const prev=()=>{out(ORD[ORD.length-1],-1,.05,()=>{ORD.unshift(ORD.pop());z();ORD.forEach(j=>settle(j))})};
 let d=null;
 root.addEventListener('pointerdown',e=>{if(e.target.closest('textarea,input,button,form'))return;const el=e.target.closest('.sk');if(!el||e.button!==0||d)return;const i=els.indexOf(el);if(ORD[0]!==i)return;
  const sc=el.getBoundingClientRect().width/Math.max(1,el.offsetWidth)||1;
  d={i,id:e.pointerId,sx:e.clientX,sy:e.clientY,ox:ST[i].x,oy:ST[i].y,moved:false,lx:e.clientX,ly:e.clientY,lt:performance.now(),vx:0,vy:0,sc}});
 root.addEventListener('pointermove',e=>{if(!d||e.pointerId!==d.id)return;const dx=(e.clientX-d.sx)/d.sc,dy=(e.clientY-d.sy)/d.sc;
  if(!d.moved){if(Math.hypot(dx,dy)<5)return;d.moved=true;root.setPointerCapture(e.pointerId);els[d.i].classList.add('lifted');els[d.i]._st=ST[d.i];SEL.drag=els[d.i];if(ST[d.i]._raf)cancelAnimationFrame(ST[d.i]._raf)}
  const now=performance.now(),dt=Math.max(8,now-d.lt);d.vx=.7*((e.clientX-d.lx)/d.sc/dt)+.3*d.vx;d.vy=.7*((e.clientY-d.ly)/d.sc/dt)+.3*d.vy;d.lx=e.clientX;d.ly=e.clientY;d.lt=now;
  const s=ST[d.i];s.x=d.ox+dx;s.y=d.oy+dy;s.r=slots[0].r+clamp(dx*.025+d.vx*2.5,-10,10);ap(d.i)});
 const end=e=>{if(!d||e.pointerId!==d.id)return;const w=d;d=null;if(!w.moved){next();return}
  els[w.i].classList.remove('lifted');SEL.drag=null;const s=ST[w.i];const dist=Math.hypot(s.x-slots[0].x,s.y-slots[0].y),sp=Math.hypot(w.vx,w.vy);
  s.vx=w.vx*1000;s.vy=w.vy*1000;
  if(dist>90||sp>.65){const nx=dist>1?s.x/dist:w.vx/sp,ny=dist>1?s.y/dist:w.vy/sp;next(nx,ny)}else settle(w.i,320,26)};
 root.addEventListener('pointerup',end);root.addEventListener('pointercancel',end);
 root.addEventListener('keydown',e=>{if(e.target.closest('textarea,input,button'))return;if(e.key==='Enter'||e.key===' '||e.key==='ArrowRight'){e.preventDefault();next()}else if(e.key==='ArrowLeft'){e.preventDefault();prev()}});
 return {next,prev}}

/* ── 照片 ── */
const PH=[
 {file:'DSC_2660',o:'l',cap:'Long Reef',loc:'Sydney',ex:'33mm  f/2  1/1600s'},
 {file:'DSC_2175',o:'p',cap:'Royal Botanic Garden',loc:'Sydney',ex:'250mm  f/6.3  1/800s'},
 {file:'DSC_2005',o:'l',cap:'Newtown',loc:'Sydney',ex:'150mm  f/5.6  1/2000s'},
 {file:'DSC_2224',o:'p',cap:'Town Hall',loc:'Sydney',ex:''}];
const phMeta=p=>[p.loc,p.ex].filter(Boolean).join('　');
const printHTML=(p,i,cls='')=>`<figure class="pp ${p.o} ${cls}" data-i="${i}" data-sel="print · ${p.file}.jpg"><span class="ppi"><img src="photos/${p.file}.jpg" alt="${p.cap}" draggable="false" loading="lazy"></span><figcaption>${p.cap}<span class="loc">${p.loc}</span>${phMeta(p)?`<small>${phMeta(p)}</small>`:''}</figcaption></figure>`;
safe('pile',()=>{const pile=$('#pile');
 pile.innerHTML=PH.map((p,i)=>printHTML(p,i,'sk')).join('')+'<span class="pcount" id="pcount" aria-live="polite"></span>';
 window.PILE=paperStack(pile,$$('.pp',pile),[{x:0,y:0,r:-1.2},{x:16,y:-12,r:2.8},{x:-18,y:8,r:-3.6},{x:10,y:14,r:4.4}],top=>{window.PILE_TOP=top;$('#pcount').textContent=`${top+1} / ${PH.length}`;document.dispatchEvent(new CustomEvent('piletop',{detail:top}))})});
safe('album',()=>{const lt=$('#lt');lt.innerHTML=PH.map((p,i)=>printHTML(p,i)).join('');
 $$('.pp',lt).forEach((f,k)=>{f.style.setProperty('--r',[-1.4,1.1,-.6,1.6][k%4]+'deg');f.tabIndex=0;f.setAttribute('role','button');f.setAttribute('aria-label','放大看：'+PH[k].cap+'，'+PH[k].loc)});
 const v=$('#viewer');let cur=0;const open=i=>{cur=(i+PH.length)%PH.length;const p=PH[cur];$('#vimg').src=`photos/${p.file}.jpg`;$('#vimg').alt='照片：'+p.cap+'，'+p.loc;$('#vcap').innerHTML=`${p.cap}<small>${phMeta(p)}　${cur+1} / ${PH.length}</small>`;if(!v.open)v.showModal()};
 window.PHOPEN=open;$('#vprev').onclick=()=>open(cur-1);$('#vnext').onclick=()=>open(cur+1);
 v.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();open(cur-1)}if(e.key==='ArrowRight'){e.preventDefault();open(cur+1)}});
 lt.addEventListener('click',e=>{const f=e.target.closest('.pp');if(f)open(+f.dataset.i)});
 lt.addEventListener('keydown',e=>{const f=e.target.closest('.pp');if(f&&(e.key==='Enter'||e.key===' ')){e.preventDefault();open(+f.dataset.i)}});
 $('#vx').onclick=()=>v.close();v.addEventListener('click',e=>{if(e.target===v)v.close()})});

/* ── 卡片：句子 / 想法 / 看到 ── */
const CARDS=[
 {k:'句子',no:14,d:'11.16',q:'「好的界面，用的人会忘了它在那里。」',n:'所以磁带的按键要有手感，但不要说明书。',s:''},
 {k:'看到',no:13,d:'11.12',q:'旗子的斜线，比旗子本身好看。',n:'对角线会让一张静止的照片动起来。',s:'Bank Hotel，路过'},
 {k:'想法',no:12,d:'11.08',q:'把网站的「最近」做成 git log。',n:'读的人一眼就知道你最近在长什么。',s:''},
 {k:'句子',no:11,d:'11.03',q:'「慢一点，问题自己会变清楚。」',n:'状态机也是这个意思：先把下一步收窄。',s:''},
 {k:'看到',no:10,d:'10.29',q:'球道的弯，是给人走的，不是给球走的。',n:'好的路径设计，先考虑走的人。',s:'傍晚，球场'}];
const CLIP=`<svg class="ic-clip" viewBox="0 0 16 44" aria-hidden="true"><path d="M5 30V8a3.5 3.5 0 0 1 7 0v26a5.5 5.5 0 0 1-11 0V12" fill="none" stroke="#9C9A93" stroke-width="1.6" stroke-linecap="round"/><path d="M5 30V8a3.5 3.5 0 0 1 7 0" fill="none" stroke="#E4E2DC" stroke-width=".6" stroke-linecap="round"/></svg>`;
function icardHTML(c,cls=''){const t={'句子':'quote','想法':'idea','看到':'seen'}[c.k];
 return `<article class="icard ${t}${c.img?' has-img':''} ${cls}" data-sel="card · No.${c.no}" aria-label="${c.k}卡：${c.q.replace(/[「」]/g,'')}">
  ${c.img?`<span class="ic-img">${CLIP}<img src="${c.img}" alt="" draggable="false"></span>`:''}
  <div class="ic-h"><span>${c.k}  No.${c.no}</span><span>${c.d}</span></div>
  <p class="ic-q">${c.q}</p>${c.n?`<p class="ic-n"><span class="ic-l">我想到</span>${c.n}</p>`:''}${c.s?`<p class="ic-s"><span class="ic-l">出处</span>${c.s}</p>`:''}</article>`}
function buildStack(){const old=$('#cstack');const st=old.cloneNode(false);old.replaceWith(st);st.innerHTML=CARDS.map(c=>icardHTML(c,'sk')).join('');$$('.icard',st).forEach(c=>c.style.setProperty('--cw','290px'));
 paperStack(st,$$('.icard',st),[{x:0,y:0,r:-1.6},{x:10,y:-10,r:1.8},{x:-8,y:8,r:-3.2},{x:2,y:2,r:-.6},{x:2,y:2,r:-.6},{x:2,y:2,r:-.6}])}
safe('cards',()=>{buildStack();
 $('#cbox').innerHTML=CARDS.map((c,i)=>icardHTML(c)).join('');$$('#cbox .icard').forEach((c,i)=>{c.style.setProperty('--r',[-1.2,1.4,-.4,.9,-1.6][i%5]+'deg');c.style.setProperty('--cw','300px')})});

/* ── 在读的书：首页和 Shelf 用同一份 ── */
/* 书：书目信息来自我整理的书单；简介只摘原文一句，完整的点来源看 */
const BCAT=[['story','人与故事'],['think','思考与创造'],['civ','文明与历史'],['build','创业者与企业'],['life','艺术与日常'],['game','游戏设计与虚拟世界']];
const DB_='https://book.douban.com/subject/';
const BOOKS=[
 {id:'b1',cat:'story',st:'reading',t:'风沙星辰',en:'Terre des hommes',a:'圣埃克苏佩里 著，梅思繁 译',pub:'四川文艺出版社',y:'2023.6',isbn:'9787541166648',
  q:'描绘了微风、沙漠和星辰的温柔诗意',src:DB_+'36425991/',srcn:'豆瓣',sk:'night',w:31,h:194,sa:'圣埃克苏佩里',sf:15},
 {id:'b6',cat:'story',st:'read',t:'咸的玩笑',a:'刘震云',pub:'人民文学出版社',y:'2026.1',isbn:'9787020197620',
  q:'在嬉笑怒骂间照见普通人的日常',src:DB_+'37833272/',srcn:'豆瓣',sk:'plain',c:'#C9B27C',fc:'#2F2618',w:36,h:200,sa:'刘震云',sf:16},
 {id:'b7',cat:'story',st:'read',t:'比山更高',sub:'自由攀登者的悲情与荣耀',a:'宋明蔚',pub:'上海文艺出版社',y:'2024.6',isbn:'9787532190034',
  q:'中国自由攀登者用攀登书写各自的命运',src:DB_+'36838903/',srcn:'豆瓣',sk:'plain',c:'#3F5A6B',fc:'#EEF1EC',w:42,h:214,sa:'宋明蔚',sf:16},
 {id:'b3',cat:'think',st:'reading',t:'思辨力35讲',th:'思辨力<b class="up">35</b>讲',sub:'像辩手一样思考',a:'庞颖',pub:'云南人民出版社',y:'2024.5',isbn:'9787222228139',
  q:'识破逻辑陷阱，迅速提升分析、表达问题的实用指南',src:DB_+'36892666/',srcn:'豆瓣',sk:'debate',w:34,h:172,sa:'庞颖',sf:15},
 {id:'b8',cat:'think',st:'read',t:'控制论与科学方法论',a:'金观涛、华国凡',pub:'广东人民出版社',y:'2025.3（新版，初版 1983）',isbn:'9787218183282',
  q:'以控制论为核心，融合系统论、信息论等多学科知识',src:DB_+'37235927/',srcn:'豆瓣',sk:'plain',c:'#2F3A33',fc:'#E9E4D4',w:30,h:188,sa:'金观涛 等',sf:12},
 {id:'b2',cat:'think',st:'reading',t:'为什么伟大不能被计划',sub:'对创意、创新和创造的自由探索',en:'Why Greatness Cannot Be Planned: The Myth of the Objective',a:'肯尼斯·斯坦利、乔尔·雷曼 著，彭相珍 译',pub:'中译出版社',y:'2023.4',isbn:'9787500173625',
  q:'打破了人类世界……依靠目标和计划成事的文化基因',src:DB_+'36357804/',srcn:'豆瓣',sk:'stone',w:29,h:224,sa:'斯坦利 等',sf:11},
 {id:'b9',cat:'civ',st:'read',t:'帆与锚',sub:'澳大利亚简史',en:'A Shorter History of Australia',a:'杰弗里·布莱内 著，鲁伊 译',pub:'广西师范大学出版社',y:'2021.5',isbn:'9787559837127',
  q:'库克船长发现澳大利亚海岸以来两百多年的澳大利亚史',src:DB_+'35447143/',srcn:'豆瓣',sk:'plain',c:'#B4562F',fc:'#F6EEE2',w:38,h:204,sa:'布莱内',sf:17},
 {id:'b10',cat:'civ',st:'read',t:'最早的帝国',sub:'二里岗文明冲击波',a:'许宏',pub:'大象出版社',y:'2023.7',isbn:'9787571117450',
  q:'揭示了数百年间中原王朝文明的兴替流变',src:DB_+'36224071/',srcn:'豆瓣',sk:'plain',c:'#7A4E2A',fc:'#EFE4CF',w:33,h:198,sa:'许宏',sf:15},
 {id:'b4',cat:'build',st:'read',t:'腾讯传',th:'腾讯传<small class="yr">1998–2016</small>',sub:'1998—2016：中国互联网公司进化论',a:'吴晓波',pub:'浙江大学出版社',y:'2017.1',isbn:'9787308164207',
  q:'全景式地记录了腾讯崛起的经历',src:DB_+'26929955/',srcn:'豆瓣',sk:'tencent',w:40,h:196,sa:'吴晓波 著',sf:19},
 {id:'b11',cat:'build',st:'read',t:'创京东',sub:'刘强东亲述创业之路',a:'李志刚',pub:'中信出版社',y:'2015.5',isbn:'9787508651880',
  q:'1998年，刘强东创业，在中关村经销光磁产品。',src:DB_+'26400900/',srcn:'豆瓣',sk:'plain',c:'#A8322B',fc:'#F6EDE4',w:32,h:200,sa:'李志刚',sf:16},
 {id:'b5',cat:'life',st:'read',t:'你好小朋友',a:'秋山亮二 摄',pub:'青艸堂（复刻版，原版 1983）',y:'2019.6',isbn:'9784909787019',
  q:'日本摄影师镜头下的80年代中国童年',src:'https://m.thepaper.cn/newsDetail_forward_3239969',srcn:'澎湃新闻',ref:'https://ndlsearch.ndl.go.jp/books/R100000002-I029740253',refn:'馆藏书目',sk:'photo',w:26,h:206,sa:'秋山亮二',sf:13},
 {id:'b12',cat:'life',st:'read',t:'给明天的一句话',sub:'「about关于」系列第 7 册',a:'小红书 编著，24小时工作室 出品',pub:'中信出版社',y:'2025.5',isbn:'9787521775365',
  q:'一句话给「明天」做注脚，直面人生必答题。',src:DB_+'37378905/',srcn:'豆瓣',sk:'plain',c:'#E7E1D3',fc:'#2B2D2B',w:28,h:190,sa:'about关于',sf:13},
 {id:'b13',cat:'game',st:'read',t:'【创】天工开物',sub:'虚拟世界建构心得',a:'',pub:'',y:'',
  note:'目前只查到书名和它与网易互娱的关联，作者、出版社和年份还没找到可靠记录。',src:'https://www.tup.com.cn/bookscenter/bookpreface?id=08540601',srcn:'提到它的一篇前言',sk:'plain',c:'#1F2B3A',fc:'#D9C9A0',w:34,h:208,sa:'',sf:14}];
/* 书脊：按原书的材质和气质做（布面、哑光纸、亮面、贴标签），不照搬封面图案和出版社标识 */
function spinesHTML(live,list=BOOKS){
 return `<div class="spines">${list.map((b,k)=>{const i=BOOKS.indexOf(b);return `<button type="button" class="sp sk-${b.sk||'plain'}" data-i="${i}" style="--w:${b.w||30}px;--h:${b.h||190}px;--sf:${b.sf||14}px;--k:${k}${(b.sk||'plain')==='plain'?`;--c:${b.c||'#5E6A55'};--fc:${b.fc||'#F4EFE4'}`:''}" aria-label="${b.t}，${b.a}"><i class="sp-top" aria-hidden="true"></i><span class="st">${b.th||b.t}</span><span class="sa">${b.sa}</span><i class="sp-mk" aria-hidden="true"></i></button>`}).join('')}<span class="bookend" aria-hidden="true"></span></div><div class="ledge" aria-hidden="true"></div>`}
function binfoHTML(b){const y=(b.y||'').split(/[.（]/)[0];return `<p class="bi-t">${b.t}</p>${b.en?`<p class="bi-en">${b.en}</p>`:''}<p class="bi-a">${[b.a,y].filter(Boolean).join('，')}</p>${b.q?`<p class="bi-i">“${b.q}”</p><p class="bi-src">${b.srcn==='豆瓣'?'摘自豆瓣简介':'摘自'+(b.srcn||'')}</p>`:''}`}
/* 书：首页“最近在读”和 Shelf 页都在 v9 里渲染 */

/* ── 最近：像 git log 一样的更新记录 ── */
const LOG=[['11.18','照片：新增 4 张，都在悉尼','#/photos'],['11.16','卡片：好的界面会被忘掉','#/mind'],['11.10','Mind：失败也是一个状态','#/mind']];

/* ── 路由：#/、#/photos、#/mind、#/shelf、#/about ── */
const PAGES={'':'desk',photos:'photos',mind:'mind',shelf:'shelf',projects:'projects',about:'about',inbox:'inbox'};
const NAVOF={desk:'desk',photos:'desk',mind:'mind',shelf:'shelf',projects:'projects',post:'projects',about:'about',inbox:'inbox'};
let CURPG=null;
function setNav(key){$$('.nav a').forEach(a=>{a.dataset.nav===key?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current')})}
function route(first){const h=location.hash;if(h&&!h.startsWith('#/'))return;const key=h.replace(/^#\/?/,'');const pg=/^p\/[\w-]+$/.test(key)?'post':(PAGES[key]||'desk');if(pg===CURPG)return;
 const swap=()=>{$$('.page').forEach(p=>p.hidden=p.dataset.page!==pg);CURPG=pg;window.scrollTo({top:0,behavior:'instant'});setNav(NAVOF[pg]);
  if(pg==='mind')safe('mindshow',()=>{renderPath();renderReader(true)});
  const onDesk=pg==='desk';$('#tray').hidden=!onDesk||!TRAYOPEN;$('#traytog').hidden=!onDesk;$('#trayhint').hidden=!onDesk||!TRAYOPEN;if(!onDesk){if(DIY.tool)setTool(null);$('#sheet').hidden=true;$('#toast').hidden=true}
  document.title=({desk:'Star Wang',photos:'照片 — Star Wang',mind:'Mind — Star Wang',shelf:'Shelf — Star Wang',projects:'Projects — Star Wang',post:'Projects — Star Wang',about:'About — Star Wang',inbox:'信箱 — Star Wang'})[pg];
  document.dispatchEvent(new CustomEvent('pagechange',{detail:pg}))};
 if(!first&&document.startViewTransition&&!RM.matches)document.startViewTransition(swap);else swap()}


/* ── DIY：挪东西 / 铅笔 / 胶带 / 贴纸 / 便签 / 印章 / 橡皮 / 桌布 / 收拾。只存在这位访客自己的浏览器里 ── */
const W8='stroke="#fff" stroke-width="7" stroke-linejoin="round" paint-order="stroke"';
/* 贴纸：模切的乙烯贴纸——白边、细节、一点高光 */
const STK=[
 {k:'star',svg:`<svg viewBox="0 0 80 80"><defs><linearGradient id="sgStar" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FCE79A"/><stop offset=".5" stop-color="#F2C14E"/><stop offset="1" stop-color="#D38D24"/></linearGradient></defs><path d="M40 7l9.6 20.2 22.1 2.8-16.3 15.2 4.2 21.9L40 56.4 20.4 67.1l4.2-21.9L8.3 30l22.1-2.8Z" fill="url(#sgStar)" ${W8}/><path d="M40 9v33M70 30.5 40 42M58.6 65.5 40 42M21.4 65.5 40 42M10 30.5 40 42" stroke="#fff" stroke-opacity=".3" stroke-width="1"/><path d="M40 9 49.6 27.2 70 30.5 40 42Z" fill="#fff" fill-opacity=".16"/><path d="M33.5 21.5l3.5-7.5" stroke="#fff" stroke-opacity=".85" stroke-width="2.6" stroke-linecap="round"/><circle cx="58" cy="17" r="1.6" fill="#fff"/></svg>`},
 {k:'pick',svg:`<svg viewBox="0 0 80 80"><defs><radialGradient id="sgPick" cx=".34" cy=".28" r=".95"><stop offset="0" stop-color="#E9775E"/><stop offset=".55" stop-color="#C8412B"/><stop offset="1" stop-color="#8A2618"/></radialGradient><clipPath id="cpPick"><path d="M40 73C29 62 13 41 13 26 13 13 26 7 40 7s27 6 27 19c0 15-16 36-27 47Z"/></clipPath></defs><path d="M40 73C29 62 13 41 13 26 13 13 26 7 40 7s27 6 27 19c0 15-16 36-27 47Z" fill="url(#sgPick)" ${W8}/><g clip-path="url(#cpPick)" fill="#6E1C10" fill-opacity=".28"><ellipse cx="26" cy="30" rx="7" ry="4" transform="rotate(-30 26 30)"/><ellipse cx="50" cy="44" rx="9" ry="3.5" transform="rotate(20 50 44)"/><ellipse cx="38" cy="58" rx="5" ry="2.6"/><ellipse cx="56" cy="22" rx="4" ry="2.4"/></g><path d="M40 27l2.4 5 5.5.7-4 3.8 1 5.4-4.9-2.7-4.9 2.7 1-5.4-4-3.8 5.5-.7Z" fill="#F7DCCB" fill-opacity=".75"/><path d="M22 20c4-7 12-9 19-8" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2.6" stroke-linecap="round"/></svg>`},
 {k:'tape',svg:`<svg viewBox="0 0 80 80"><defs><linearGradient id="sgCas" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A3D3B"/><stop offset="1" stop-color="#232523"/></linearGradient></defs><rect x="7" y="17" width="66" height="46" rx="5" fill="url(#sgCas)" ${W8}/><rect x="12" y="21" width="56" height="27" rx="2" fill="#F1EBDC"/><rect x="12" y="21" width="56" height="5" fill="#C8412B"/><path d="M16 30.5h26M16 33.5h18" stroke="#B9B2A2" stroke-width=".9"/><rect x="25" y="36" width="30" height="10" rx="5" fill="#2A2C2A"/><circle cx="31" cy="41" r="3.6" fill="#EFEAE0"/><circle cx="49" cy="41" r="3.6" fill="#EFEAE0"/><path d="M31 38.6v4.8M28.6 41h4.8M49 38.6v4.8M46.6 41h4.8" stroke="#2A2C2A" stroke-width="1.1"/><rect x="12" y="44" width="56" height="4" fill="#5E6A55"/><path d="M21 63l4-9h30l4 9" fill="#2E302E"/><circle cx="11" cy="21" r="1.3" fill="#8D918B"/><circle cx="69" cy="21" r="1.3" fill="#8D918B"/><circle cx="11" cy="59" r="1.3" fill="#8D918B"/><circle cx="69" cy="59" r="1.3" fill="#8D918B"/><text x="62" y="31" text-anchor="end" font-family="Caveat, cursive" font-weight="700" font-size="7" fill="#262925">side A</text></svg>`},
 {k:'camera',svg:`<svg viewBox="0 0 80 80"><defs><linearGradient id="sgCam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E6E3DC"/><stop offset="1" stop-color="#B9B5AC"/></linearGradient><pattern id="ptLeather" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="#2B2D2B"/><circle cx="1.5" cy="1.5" r=".7" fill="#3A3C39"/></pattern></defs><path d="M9 25h18l3-5h20l3 5h18v38H9Z" fill="url(#sgCam)" ${W8}/><rect x="9" y="33" width="62" height="24" fill="url(#ptLeather)"/><rect x="13" y="27" width="11" height="5" rx="1" fill="#2E3B44"/><rect x="56" y="27" width="10" height="4" rx="1" fill="#7E8B92"/><rect x="31" y="19" width="7" height="3" rx="1" fill="#8E8A82"/><circle cx="40" cy="45" r="15" fill="#D9D5CC"/><circle cx="40" cy="45" r="12" fill="#1C1E1D"/><circle cx="40" cy="45" r="8" fill="#2E3A42"/><circle cx="40" cy="45" r="4.4" fill="#141617"/><circle cx="36.5" cy="41.5" r="2.4" fill="#fff" fill-opacity=".7"/><circle cx="43" cy="48" r="1" fill="#9FB7C4" fill-opacity=".8"/><circle cx="64" cy="22.5" r="2.2" fill="#C8412B"/></svg>`},
 {k:'leaf',svg:`<svg viewBox="0 0 80 80"><defs><linearGradient id="sgLeaf" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#5F7A4C"/><stop offset=".6" stop-color="#86A06D"/><stop offset="1" stop-color="#A9BE8D"/></linearGradient></defs><path d="M14 67C11 36 30 13 67 11c3 35-18 58-53 56Z" fill="url(#sgLeaf)" ${W8}/><path d="M15 65C29 49 44 34 61 17" fill="none" stroke="#E4ECD8" stroke-width="2" stroke-linecap="round"/><path d="M28 52c-1-6-1-12 0-17M37 43c-1-6-1-12 1-18M46 34c0-5 1-10 3-14M28 52c6 0 11-1 17-3M37 43c6 0 12-2 17-5M46 34c5-1 9-3 12-6" fill="none" stroke="#E4ECD8" stroke-opacity=".8" stroke-width="1.2" stroke-linecap="round"/><path d="M14 67l-5 5" stroke="#5F7A4C" stroke-width="2.4" stroke-linecap="round"/><path d="M58 17c2 6 1 13-2 19" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2.4" stroke-linecap="round"/></svg>`},
 {k:'coffee',svg:`<svg viewBox="0 0 80 80"><defs><linearGradient id="sgCup" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#DCD5C6"/><stop offset=".35" stop-color="#FBF8F2"/><stop offset="1" stop-color="#D8D0BF"/></linearGradient></defs><ellipse cx="38" cy="64" rx="28" ry="6" fill="#F1ECE2" ${W8}/><path d="M15 33h44v13a18 18 0 0 1-18 18h-8a18 18 0 0 1-18-18ZM59 37h5a7.5 7.5 0 0 1 0 15h-6" fill="url(#sgCup)" ${W8}/><ellipse cx="37" cy="33" rx="22" ry="5" fill="#7A5236"/><path d="M37 36.2c-3.2-2.4-6-2.2-6-.4 0 1.6 3 2.6 6 4 3-1.4 6-2.4 6-4 0-1.8-2.8-2-6 .4Z" fill="#F2E7D6"/><path d="M27 10c-4 5 4 8 0 14M37 7c-4 6 4 9 0 16M47 10c-4 5 4 8 0 14" fill="none" stroke="#B5AFA4" stroke-width="2.2" stroke-linecap="round"/></svg>`},
 {k:'heart',svg:`<svg viewBox="0 0 80 80"><defs><radialGradient id="sgHeart" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#F49A8F"/><stop offset=".55" stop-color="#E36F6A"/><stop offset="1" stop-color="#B94743"/></radialGradient></defs><path d="M40 68C22 54 10 42 10 28a14 14 0 0 1 30-6 14 14 0 0 1 30 6c0 14-12 26-30 40Z" fill="url(#sgHeart)" ${W8}/><path d="M18 27a8 8 0 0 1 9-8" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="3" stroke-linecap="round"/><circle cx="17.5" cy="34" r="1.8" fill="#fff" fill-opacity=".75"/><path d="M60 20l1 3 3 1-3 1-1 3-1-3-3-1 3-1Z" fill="#fff"/></svg>`},
 {k:'night',svg:`<svg viewBox="0 0 80 80"><defs><linearGradient id="sgNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2D3E62"/><stop offset="1" stop-color="#1A2338"/></linearGradient></defs><path d="M12 10h56v60H12Z" fill="#FBF8F0" ${W8}/><path d="M12 10h56v60H12Z" fill="none" stroke="#FBF8F0" stroke-width="5" stroke-dasharray="2.2 3.2"/><rect x="17" y="15" width="46" height="44" fill="url(#sgNight)"/><path d="M17 50l12-9 9 6 11-10 14 11v11H17Z" fill="#0F1524"/><g fill="#F4ECD2"><circle cx="24" cy="23" r=".9"/><circle cx="33" cy="30" r="1.1"/><circle cx="55" cy="21" r=".8"/><circle cx="43" cy="26" r=".7"/><circle cx="58" cy="35" r="1"/></g><path d="M24 23 33 30 43 26 55 21" fill="none" stroke="#F4ECD2" stroke-opacity=".5" stroke-width=".6"/><path d="M46 30l1.3 2.8 3 .4-2.2 2.1.6 3-2.7-1.5-2.7 1.5.6-3-2.2-2.1 3-.4Z" fill="#E9B949"/><text x="40" y="66" text-anchor="middle" font-family="Noto Serif SC, serif" font-weight="600" font-size="5.6" letter-spacing="1.2" fill="#2B2D2B">仰望星空</text></svg>`},
 {k:'nice',svg:`<svg viewBox="0 0 80 80"><defs><pattern id="ptDot" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r=".6" fill="#343A35" fill-opacity=".35"/></pattern></defs><path d="M10 14h60v40H38l-14 12v-12H10Z" fill="#FDFCF7" ${W8} stroke-opacity="1"/><path d="M14 18h60v40H42l-14 12v-12H14Z" fill="url(#ptDot)" opacity=".6" transform="translate(-1 1)"/><path d="M10 14h60v40H38l-14 12v-12H10Z" fill="#FDFCF7"/><path d="M10 14h60v40H38l-14 12v-12H10Z" fill="none" stroke="#343A35" stroke-width="2.2" stroke-linejoin="round"/><text x="40" y="42" text-anchor="middle" font-family="Long Cang, cursive" font-size="22" fill="#C8412B" transform="rotate(-4 40 36)">好看！</text><path d="M58 22l1.6 3.4M64 26l-3.2 1.4" stroke="#C8412B" stroke-width="1.6" stroke-linecap="round"/></svg>`}];
/* 印章：一枚橡皮章——双圈、环形字、日期和“来过”，油墨有轻有重、边缘不齐 */
const STAMPSVG=d=>`<svg viewBox="0 0 120 120" aria-hidden="true"><defs><path id="stArc" d="M60 60m-42 0a42 42 0 1 1 84 0a42 42 0 1 1-84 0"/></defs><g filter="url(#inkRough)"><circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" stroke-width="3.4"/><circle cx="60" cy="60" r="31.5" fill="none" stroke="currentColor" stroke-width="1.3"/><text font-family="Oswald, sans-serif" font-weight="500" font-size="10" fill="currentColor"><textPath href="#stArc" textLength="258" lengthAdjust="spacing">STAR WANG · 的画板 · VISITED · ${d.replace(/\./g,' ')} · </textPath></text><path d="M60 35.5l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5Z" fill="currentColor"/><text x="60" y="61" text-anchor="middle" font-family="Oswald, sans-serif" font-weight="600" font-size="10.5" letter-spacing=".3" fill="currentColor">${d}</text><text x="60" y="80" text-anchor="middle" font-family="Long Cang, cursive" font-size="17" fill="currentColor">来过</text></g></svg>`;
const DIY={tool:null,items:[],strokes:[],pos:{},desk:'grid',armed:null};
const DKEY='desk-diy-v7',NOTEC=['#F2E199','#F3C6C0','#CFE3C8','#C9DCEB'],DESKS=[['grid','方格纸'],['kraft','牛皮纸'],['cork','软木板'],['mat','切割垫']];
const HINT={'':'随便贴、随便画。贴完了点「贴好了」，可以寄给我，也可以存成图',move:'挪东西：按住画板上任何一样，拖到你喜欢的地方',pencil:'铅笔：在画板上随便画',tape:'胶带：按住拖一下，撕一段贴上',sticker:'贴纸：拖一张到画板上，或者选好再点一下',note:'便签：点一下画板，写点什么',stamp:'印章：点哪儿盖哪儿',eraser:'橡皮：点掉贴上去的东西，或者擦掉铅笔线'};
let tapeN=0,noteN=0;
const uid=()=>Math.random().toString(36).slice(2,9);
const rnd=(a,b)=>a+Math.random()*(b-a);
function dsave(){try{localStorage.setItem(DKEY,JSON.stringify({items:DIY.items,strokes:DIY.strokes,pos:DIY.pos,desk:DIY.desk}))}catch(e){}}
const DEFAULT_ITEMS=[];
let TRAYOPEN=false;
function dload(){let s=null;try{s=JSON.parse(localStorage.getItem(DKEY)||'null')}catch(e){}if(s){DIY.items=s.items||[];DIY.strokes=s.strokes||[];DIY.pos={};DIY.desk=DESKS.some(d=>d[0]===s.desk)?s.desk:'grid'}else DIY.items=innerWidth<900?[]:DEFAULT_ITEMS.map(i=>({...i}))}
function hxy(e){const h=$('#home'),r=h.getBoundingClientRect(),z=r.width/h.offsetWidth||1;return [(e.clientX-r.left)/z,(e.clientY-r.top)/z]}
function spath(p){if(p.length<2)return '';let d=`M${p[0][0]} ${p[0][1]}`;for(let i=1;i<p.length-1;i++){d+=`Q${p[i][0]} ${p[i][1]} ${((p[i][0]+p[i+1][0])/2).toFixed(1)} ${((p[i][1]+p[i+1][1])/2).toFixed(1)}`}const l=p[p.length-1];return d+`L${l[0]} ${l[1]}`}
function tapeCSS(it){return `left:${it.x}px;top:${it.y}px;width:${it.len}px;transform:translateY(-50%) rotate(${it.a}deg)`}
function itemEl(it){const el=document.createElement('div');el.dataset.id=it.id;
 if(it.t==='tape'){el.className='dtape tp'+it.p;el.style.cssText=tapeCSS(it);el.dataset.sel='胶带'}
 else if(it.t==='st'){el.className='dst';el.innerHTML=(STK.find(s=>s.k===it.k)||STK[0]).svg;el.style.cssText=`left:${it.x}px;top:${it.y}px;transform:translate(-50%,-50%) rotate(${it.r}deg)`;el.dataset.sel='贴纸'}
 else if(it.t==='stamp'){el.className='dstamp';el.innerHTML=STAMPSVG(it.d);el.style.setProperty('--ink',(it.ink||.86));el.style.cssText=`left:${it.x}px;top:${it.y}px;transform:translate(-50%,-50%) rotate(${it.r}deg)`;el.dataset.sel='印章'}
 else if(it.t==='note'){el.className='dnote';el.style.cssText=`left:${it.x}px;top:${it.y}px;--nc:${it.c};transform:rotate(${it.r}deg)`;el.dataset.sel='便签';
  el.innerHTML='<span class="dgrip" aria-hidden="true"></span><span class="dcurl" aria-hidden="true"></span><textarea aria-label="便签" maxlength="140" placeholder="写点什么"></textarea>';const ta=el.querySelector('textarea');ta.value=it.text||'';ta.addEventListener('input',()=>{it.text=ta.value;dsave()})}
 return el}
function drender(){const L=$('#diy');L.innerHTML='';DIY.items.forEach(it=>L.appendChild(itemEl(it)));
 $('#ink').innerHTML=DIY.strokes.map(s=>`<path d="${spath(s.p)}" data-id="${s.id}"/>`).join('');
 $$('#home .hobj').forEach(o=>{const p=DIY.pos[o.dataset.id];o.style.transform=p?`translate(${p[0]}px,${p[1]}px)`:''});
 document.body.dataset.desk=DIY.desk;$('#deskbtn').textContent='画纸：'+(DESKS.find(d=>d[0]===DIY.desk)||DESKS[0])[1]}
function setTool(t){if(DIY.tool===t)t=null;DIY.tool=t;const home=$('#home');
 $$('#tray [data-tool]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.tool===t));
 if(t)home.dataset.tool=t;else delete home.dataset.tool;
 $('#sheet').hidden=t!=='sticker';if(t!=='sticker'){DIY.armed=null;$$('#sheet button').forEach(b=>b.setAttribute('aria-pressed','false'))}
 $('#trayhint').textContent=HINT[t||'']+(t?'。按 Esc 收起':'');$('#trayhint').classList.toggle('idle',!t);
 $$('#home .hobj').forEach(o=>{if(t==='move')o.dataset.sel='挪动：'+o.dataset.name;else delete o.dataset.sel})}
function addItem(it,fresh){DIY.items.push(it);const el=itemEl(it);if(fresh)el.classList.add('fresh');$('#diy').appendChild(el);dsave();return el}
function addSticker(k,x,y){addItem({t:'st',id:uid(),x:Math.round(x),y:Math.round(y),r:+rnd(-14,14).toFixed(1),k},true)}
function dragItem(el,e){const it=DIY.items.find(i=>i.id===el.dataset.id);if(!it)return;const [x0,y0]=hxy(e),ox=it.x,oy=it.y;let moved=false;
 el.setPointerCapture(e.pointerId);
 const mv=ev=>{const [x,y]=hxy(ev);if(!moved&&Math.hypot(x-x0,y-y0)<3)return;if(!moved){moved=true;el.classList.add('lifted')}it.x=Math.round(ox+x-x0);it.y=Math.round(oy+y-y0);
  if(it.t==='tape')el.style.cssText=tapeCSS(it);else{el.style.left=it.x+'px';el.style.top=it.y+'px'}};
 const up=()=>{el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);el.classList.remove('lifted');if(moved){DIY.items.push(DIY.items.splice(DIY.items.indexOf(it),1)[0]);el.parentNode.appendChild(el);dsave()}};
 el.addEventListener('pointermove',mv);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)}
function dragObj(o,e){const id=o.dataset.id,p=DIY.pos[id]||[0,0],[x0,y0]=hxy(e),st={x:p[0],y:p[1],r:0};o._st=st;SEL.drag=o;o.classList.add('moving');o.setPointerCapture(e.pointerId);
 const mv=ev=>{const [x,y]=hxy(ev);st.x=p[0]+x-x0;st.y=p[1]+y-y0;o.style.transform=`translate(${st.x}px,${st.y}px)`};
 const up=()=>{o.removeEventListener('pointermove',mv);o.removeEventListener('pointerup',up);o.removeEventListener('pointercancel',up);o.classList.remove('moving');SEL.drag=null;DIY.pos[id]=[Math.round(st.x),Math.round(st.y)];dsave()};
 o.addEventListener('pointermove',mv);o.addEventListener('pointerup',up);o.addEventListener('pointercancel',up)}
function eraseAt(e){const t=document.elementFromPoint(e.clientX,e.clientY);const di=t&&t.closest('#diy>*');
 if(di){DIY.items=DIY.items.filter(i=>i.id!==di.dataset.id);di.classList.add('gone');setTimeout(()=>di.remove(),170);dsave();return}
 const [x,y]=hxy(e);const n=DIY.strokes.length;DIY.strokes=DIY.strokes.filter(s=>{const hit=s.p.some(q=>Math.hypot(q[0]-x,q[1]-y)<11);if(hit){const pe=$(`#ink path[data-id="${s.id}"]`);pe&&pe.remove()}return !hit});if(DIY.strokes.length!==n)dsave()}
let toastT=null;
function toast(msg,undo){$('#toastt').textContent=msg;$('#toast').hidden=false;$('#toastb').onclick=()=>{undo();$('#toast').hidden=true};clearTimeout(toastT);toastT=setTimeout(()=>$('#toast').hidden=true,6000)}
safe('diy',()=>{dload();const home=$('#home');drender();setTool(null);
 $('#traytog').onclick=()=>{TRAYOPEN=!TRAYOPEN;$('#tray').hidden=!TRAYOPEN;$('#trayhint').hidden=!TRAYOPEN;$('#traytog').setAttribute('aria-expanded',TRAYOPEN);$('#traytog span').textContent=TRAYOPEN?'收起':'工具';if(!TRAYOPEN){setTool(null);$('#sheet').hidden=true}};
 $('#sheet').innerHTML=STK.map(s=>`<button data-k="${s.k}" aria-pressed="false" aria-label="贴纸">${s.svg}</button>`).join('');
 $('#tray').addEventListener('click',e=>{const b=e.target.closest('[data-tool]');if(b)setTool(b.dataset.tool)});
 $('#deskbtn').onclick=()=>{const i=DESKS.findIndex(d=>d[0]===DIY.desk);DIY.desk=DESKS[(i+1)%DESKS.length][0];dsave();drender()};
 $('#tidybtn').onclick=()=>{const snap=JSON.stringify({items:DIY.items,strokes:DIY.strokes,pos:DIY.pos});if(snap==='{"items":[],"strokes":[],"pos":{}}'){toast('画板本来就是干净的',()=>{});return}
  DIY.items=[];DIY.strokes=[];DIY.pos={};dsave();drender();setTool(null);
  toast('画板收拾好了',()=>{Object.assign(DIY,JSON.parse(snap));dsave();drender()})};
 addEventListener('keydown',e=>{if(e.key==='Escape'&&DIY.tool&&CURPG==='desk'&&!e.target.closest('textarea'))setTool(null)});
 /* 贴纸：从贴纸页拖出来，或者点选后再点桌面 */
 $('#sheet').addEventListener('pointerdown',e=>{const b=e.target.closest('[data-k]');if(!b)return;e.preventDefault();const k=b.dataset.k;
  DIY.armed=k;$$('#sheet button').forEach(x=>x.setAttribute('aria-pressed',x===b));$('#trayhint').textContent='选好了，点一下画板贴上去；也可以直接拖过去';
  const g=document.createElement('div');g.className='dghost';g.innerHTML=b.innerHTML;document.body.appendChild(g);const sx=e.clientX,sy=e.clientY;let moved=false;
  const mv=ev=>{g.style.left=ev.clientX+'px';g.style.top=ev.clientY+'px';if(!moved&&Math.hypot(ev.clientX-sx,ev.clientY-sy)>6){moved=true;g.classList.add('on')}};
  const up=ev=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);g.remove();if(!moved)return;const t=document.elementFromPoint(ev.clientX,ev.clientY);if(t&&t.closest('#home')){const [x,y]=hxy(ev);addSticker(k,x,y)}};
  mv(e);addEventListener('pointermove',mv);addEventListener('pointerup',up)});
 /* 桌面上的手势 */
 let act=null;
 home.addEventListener('pointerdown',e=>{if(e.button!==0)return;const tool=DIY.tool;const di=e.target.closest('#diy>*');
  if(tool==='eraser'){e.preventDefault();e.stopPropagation();act={k:'erase'};home.setPointerCapture(e.pointerId);eraseAt(e);return}
  if(di&&(!tool||tool==='move')){if(e.target.tagName==='TEXTAREA')return;e.stopPropagation();e.preventDefault();dragItem(di,e);return}
  if(!tool)return;
  if(di&&di.classList.contains('dnote')&&e.target.tagName==='TEXTAREA')return;
  e.preventDefault();e.stopPropagation();const [x,y]=hxy(e);
  if(tool==='move'){const o=e.target.closest('.hobj');if(o)dragObj(o,e);return}
  if(tool==='pencil'){const el=document.createElementNS('http://www.w3.org/2000/svg','path');$('#ink').appendChild(el);act={k:'pen',p:[[+x.toFixed(1),+y.toFixed(1)]],el};home.setPointerCapture(e.pointerId);return}
  if(tool==='tape'){const it={t:'tape',id:uid(),x:Math.round(x),y:Math.round(y),len:1,a:0,p:tapeN%4};const el=itemEl(it);$('#diy').appendChild(el);act={k:'tape',it,el};home.setPointerCapture(e.pointerId);return}
  if(tool==='stamp'){const d=new Date();addItem({t:'stamp',id:uid(),x:Math.round(x),y:Math.round(y),r:+rnd(-16,16).toFixed(1),d:`${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`},true);return}
  if(tool==='note'){const it={t:'note',id:uid(),x:Math.round(x-88),y:Math.round(y-20),r:+rnd(-3,3).toFixed(1),c:NOTEC[noteN++%4],text:''};const el=addItem(it,true);setTool(null);el.querySelector('textarea').focus({preventScroll:true});requestAnimationFrame(()=>el.querySelector('textarea').focus({preventScroll:true}));return}
  if(tool==='sticker'&&DIY.armed){addSticker(DIY.armed,x,y)}},true);
 home.addEventListener('pointermove',e=>{if(!act)return;
  if(act.k==='erase'){eraseAt(e);return}
  const [x,y]=hxy(e);
  if(act.k==='pen'){const l=act.p[act.p.length-1];if(Math.hypot(x-l[0],y-l[1])>1.6){act.p.push([+x.toFixed(1),+y.toFixed(1)]);act.el.setAttribute('d',spath(act.p))}}
  else if(act.k==='tape'){const it=act.it,dx=x-it.x,dy=y-it.y;it.len=Math.round(Math.hypot(dx,dy));it.a=+(Math.atan2(dy,dx)*180/Math.PI).toFixed(1);act.el.style.cssText=tapeCSS(it)}});
 const fin=()=>{if(!act)return;const a=act;act=null;
  if(a.k==='pen'){if(a.p.length>2){const s={id:uid(),p:a.p};a.el.dataset.id=s.id;DIY.strokes.push(s);dsave()}else a.el.remove()}
  else if(a.k==='tape'){if(a.it.len>24){DIY.items.push(a.it);tapeN++;dsave()}else a.el.remove()}};
 home.addEventListener('pointerup',fin);home.addEventListener('pointercancel',fin);
 home.addEventListener('click',e=>{if(DIY.tool){e.preventDefault();e.stopPropagation()}},true)});
safe('router',()=>{addEventListener('hashchange',()=>route(false));route(true)});
