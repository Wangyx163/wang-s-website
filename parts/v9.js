/* ══════════ v9：等比缩放 · 后端 · Star Wang · 入口 · 入场券仪式 · 贴完之后 ══════════ */
const STARP='M12.3 2.4l2.6 6.2 6.6.5-5.1 4.3 1.6 6.5-5.7-3.6-5.6 3.7 1.6-6.5-5.1-4.2 6.6-.6z';
const STARSVG=`<svg viewBox="0 0 24 24"><path d="${STARP}"/></svg>`;
const debounce=(f,ms=120)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>f(...a),ms)}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function hash32(s){let h=2166136261;for(const c of String(s)){h^=c.codePointAt(0);h=Math.imul(h,16777619)}return h>>>0}
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const lsGet=(k,d=null)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};

/* ── 整页等比：桌面按 1440 宽排版，手机按 390 宽排版，再整体缩放到窗口宽。
      拉窗口、浏览器放大缩小，看到的都是同一张画板按比例变大变小 ── */
const FIT={s:1,m:false};
function fit(){const d=document.documentElement,w=d.clientWidth,h=innerHeight,m=innerWidth<900;
 const s=m?clamp(w/390,.8,1.5):clamp(w/1440,.6,2);
 document.body.style.zoom=s;d.style.setProperty('--vw',w/s/100+'px');d.style.setProperty('--vh',h/s/100+'px');d.classList.toggle('mob',m);
 const ch=Math.abs(s-FIT.s)>1e-4||m!==FIT.m;FIT.s=s;FIT.m=m;if(ch)document.dispatchEvent(new CustomEvent('fitchange',{detail:{s,m}}))}
safe('fit',()=>{fit();let raf=0;addEventListener('resize',()=>{if(!raf)raf=requestAnimationFrame(()=>{raf=0;fit()})});
 const nm=debounce(()=>safe('navmarks',navMarks),160);document.addEventListener('fitchange',nm);addEventListener('resize',nm)});

/* ── 后端：页面自带的数据库。没登录、只读、或者在本地打开时，全部退回到这台设备上 ── */
const DB={db:null,user:null,uid:null,owner:false,ro:false,ready:false};
const withTO=(p,ms=10000)=>Promise.race([p,sleep(ms).then(()=>{throw {code:'timeout'}})]);
const dbReady=(async()=>{try{const use=window.claude&&window.claude.use;if(typeof use!=='function')return DB;
  const [u,d]=await Promise.all([window.claude.use('user').catch(()=>null),window.claude.use('db').catch(()=>null)]);DB.user=u;DB.db=d;
  if(u){try{DB.uid=await u.id()}catch(e){}try{DB.owner=!!(await u.isOwner())}catch(e){}}
 }catch(e){}finally{DB.ready=true}return DB})();
const canWrite=()=>!!(DB.db&&DB.uid&&!DB.ro);
const WQ={};
function dbSet(path,data){if(!canWrite())return Promise.reject({code:'offline'});
 const p=(WQ[path]||Promise.resolve()).then(()=>withTO(DB.db.doc(path).set(data))).catch(e=>{if(e&&(e.code==='invalid_argument'||e.code==='revoked'||e.code==='not_granted'))DB.ro=true;throw e});
 WQ[path]=p.catch(()=>{});return p}

/* ── 真名：默认藏起来，点小眼睛才显示 ── */
const RNC=[29579,26161,32724];
safe('eye',()=>{let on=false;const set=v=>{on=v;$$('.rn').forEach(r=>{r.textContent=on?String.fromCharCode(...RNC):'●●●';r.classList.toggle('on',on)});
  $$('.eye').forEach(b=>{b.setAttribute('aria-pressed',on);b.setAttribute('aria-label',on?'藏起真名':'显示真名')})};
 document.addEventListener('pointerdown',e=>{if(e.target.closest('.eye'))e.stopPropagation()},true);
 document.addEventListener('click',e=>{const b=e.target.closest('.eye');if(!b)return;e.preventDefault();e.stopPropagation();set(!on)},true);set(false)});

/* ── 我的 AI 分身：先用预设回答。关键词对上哪条就答哪条；{…} 会换成书架、卡片里的最新内容 ── */
const EMAIL='w_wangyi163@163.com';
const QA=[
 {id:'idea',l:'新想法',kw:'想法,新想,在想,念头,点子,灵感,idea',a:'最近记下的一个念头（{ideaDate}）：{idea}\n{ideaNote}\n其他的都在[卡片盒](#/mind)里。'},
 {id:'proj',l:'项目 / 论文',kw:'项目,论文,研究,在做什么,作品,project,paper,colwork,drwkv',a:'发过的论文有 {papers}，做的是低光照图像增强，和无人机图像里的小目标检测。\n在做的东西叫 Colwork，一个帮会后协作落地的 AI Agent。\n细节都在[Projects](#/projects)。'},
 {id:'music',l:'音乐',kw:'歌,音乐,磁带,听什么,music',a:'磁带里现在是 Warm Place — AMatroskin。按 PLAY 就能听，快进、倒带也都能用。'},
 {id:'mail',l:'联系方式',kw:'联系,邮箱,邮件,email,找你,写信',a:'写信到 {email}。也可以在画板上贴完、点「贴好了」，寄给我。'},
 {id:'read',l:'在读什么',kw:'读,书,在看,reading,book',a:'在读{reading}。\n书架上读完的还有 {doneN} 本，比如{done}。\n整面书架在[这里](#/shelf)。'},
 {id:'me',l:'介绍自己',kw:'介绍,你是谁,自己,关于你,about,who',a:'我是 Wang，这块画板上也叫 Star Wang。\n这里摊着我拍的照片、随手记的卡片、在读的书，还有论文和在做的东西。\n想聊点什么，写信到 {email}。'},
 {id:'else',l:'没对上的时候',kw:'',a:'这个我还没准备好答案。\n现在能聊：在读什么、新想法、我是谁、在做的项目。想直接问我本人，写信到 {email}。'}];
const bkl=L=>L.map(b=>`《${b.t}》`).join('');
function qaVars(){const R=BOOKS.filter(b=>b.st==='reading'),D=BOOKS.filter(b=>b.st==='read');const id=CARDS.find(c=>c.k==='想法')||CARDS[0]||{};
 const P=typeof PAPERS!=='undefined'?PAPERS.map(p=>p.t.split(':')[0]).join('、'):'';
 return {reading:R.length?bkl(R):'（这阵子没在读）',done:bkl(D.slice(0,3)),doneN:String(D.length),idea:id.q||'（还没记）',ideaDate:id.d||'',ideaNote:id.n||'',papers:P,email:'\u0001'}}
function qaHTML(t){const v=qaVars();let h=esc(t.replace(/\{(\w+)\}/g,(m,k)=>k in v?v[k]:m));
 h=h.replace(/\[([^\]]+)\]\((#\/[a-z]*)\)/g,'<a href="$2">$1</a>').replace(/\u0001/g,`<a href="mailto:${EMAIL}">${EMAIL}</a>`);
 return h.split('\n').filter(x=>x.trim()).map(x=>`<span class="al">${x}</span>`).join('')}
function qaPick(q){const s=q.toLowerCase();return QA.find(x=>x.kw&&x.kw.split(/[,，]/).map(k=>k.trim().toLowerCase()).filter(Boolean).some(k=>s.includes(k)))||QA.find(x=>x.id==='else')||QA[QA.length-1]}
function askA(q){q=(q||'').trim();if(!q)return;const box=$('#slips');box.innerHTML='';const el=document.createElement('div');el.className='ans';
 el.innerHTML='<p class="aq"></p><p class="aa thinking">……</p><p class="af">预设回答</p><button type="button" class="ax" aria-label="收起回答">×</button>';el.querySelector('.ax').onclick=()=>{el.classList.remove('in');setTimeout(()=>el.remove(),RM.matches?0:240);$('.askin').focus({preventScroll:true})};el.querySelector('.aq').textContent='问：'+q;box.append(el);requestAnimationFrame(()=>el.classList.add('in'));
 setTimeout(()=>{const a=$('.aa',el);a.classList.remove('thinking');a.innerHTML=qaHTML(qaPick(q).a)},RM.matches?0:420)}
safe('ask',()=>{$('.askf').onsubmit=e=>{e.preventDefault();const i=$('.askin');askA(i.value);i.value=''};$$('.asksug button').forEach(b=>b.onclick=()=>askA(b.dataset.q))});

/* ── 入口：照片（字、箭头、胶卷）→ 照片页并停在刚才那张；书（书脊、说明卡、书架板）→ Shelf 并停在那本 ── */
let PH_FOCUS=null,BOOK_FOCUS=null;
safe('links',()=>{
 document.addEventListener('click',e=>{const a=e.target.closest('#home a[href="#/photos"]');if(a)PH_FOCUS=window.PILE_TOP??0},true);
 document.addEventListener('pagechange',e=>{
  if(e.detail==='photos'&&PH_FOCUS!=null){const i=PH_FOCUS;PH_FOCUS=null;const f=$$('#lt .pp')[i];if(f)setTimeout(()=>{f.scrollIntoView({block:'center',behavior:RM.matches?'auto':'smooth'});f.classList.remove('lit');void f.offsetWidth;f.classList.add('lit')},80)}
})});
/* ── 最近：小票，只读 ── */
function rcptRender(fresh){const box=$('#rcpt');if(!box)return;
 let rows=LOG.map(([d,t])=>`<div class="ln"><span>${esc(d)}</span><span>${esc(t)}</span></div>`).join('');
 if(PASS&&PASS.torn){const td=PASS.d===todayStr()?'今天':PASS.d.slice(5);
  const who=PASS.ord?`你是第 ${PASS.no} 位访客`:`No.${String(PASS.no).padStart(4,'0')} 已入场`;
  rows=`<div class="ln${fresh?' new':''}"><span>${td}</span><span>${esc(who)}</span></div>`+rows}
 box.innerHTML=`<h4>最近</h4><p class="c">${todayStr()}</p><hr>${rows}<hr><p class="c">共 ${LOG.length+(PASS&&PASS.torn?1:0)} 条</p><button type="button" class="devbtn rcedit" data-dev="log-edit">编辑「最近」</button>`}

/* ══ 入场券 ══
   按取票机上的红钮 → 出票（编号、时间、票码、一小片只属于这张票的星图）
   → 在票上打孔（真的打穿）、在存根上签名 → 按住存根撕下来 → 票面盖「已入场」，交互结束，存根可以带走 */
let PASS=lsGet('sw-pass-v1');let PST='idle';
/* 每天一张票：换了一天，机器重新可以取票；第几位访客跟着人走，不会因为换天变 */
if(PASS&&PASS.d!==todayStr()){lsSet('sw-pass-prev',{first:PASS.first||PASS.at,no:PASS.ord?PASS.no:null});PASS=null;try{localStorage.removeItem('sw-pass-v1')}catch(e){}}const TOT={known:false,visits:0,like:0,kick:0,seal:0};
const PKEY='sw-pass-v1',CODEA='23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const PUNCH=[['like','赞你一下'],['kick','踢你一下'],['seal','盖个章']];
const HEART='M8 14.2 2.2 8.6A3.6 3.6 0 0 1 8 3.9a3.6 3.6 0 0 1 5.8 4.7Z';
const FOOT='<ellipse cx="8.6" cy="5.6" rx="3.3" ry="4.4" transform="rotate(12 8.6 5.6)"/><ellipse cx="7" cy="12.6" rx="2.4" ry="2.2"/>';
const STAMP9=`<svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="23" fill="none" stroke="#C8412B" stroke-width="2.4"/><circle cx="26" cy="26" r="18" fill="none" stroke="#C8412B" stroke-width="1"/><text x="26" y="31" text-anchor="middle" font-family="Noto Serif SC" font-weight="700" font-size="14" fill="#C8412B">到此</text></svg>`;
const passSave=()=>lsSet(PKEY,PASS);
const no4=n=>String(n).padStart(4,'0');
function newPass(){const b=new Uint8Array(6);(crypto.getRandomValues?crypto.getRandomValues(b):b.forEach((_,i)=>b[i]=Math.random()*256));
 const code=[...b].map(x=>CODEA[x%CODEA.length]).join('');const n=new Date();
 const prev=lsGet('sw-pass-prev')||{};const at=n.toISOString();
 return {code,at,first:prev.first||at,d:todayStr(),t:`${pad2(n.getHours())}:${pad2(n.getMinutes())}:${pad2(n.getSeconds())}`,no:prev.no||1000+hash32(code)%9000,ord:!!prev.no,name:'',p:{like:0,kick:0,seal:0},torn:false}}
const codeStr=p=>`SW-${p.d.slice(5).replace('.','')}-${p.code}`;
function skyData(code){const R=rng(hash32(code+'sky'));const n=5+Math.floor(R()*3),pts=[];
 for(let i=0;i<n;i++){let p,k=0;do{p=[10+R()*80,9+R()*42];k++}while(k<30&&pts.some(q=>Math.hypot(q[0]-p[0],q[1]-p[1])<15));pts.push(p)}
 pts.sort((a,b)=>a[0]-b[0]);const me=Math.floor(R()*n),br=Math.floor(R()*(n-2));
 const dust=Array.from({length:14},()=>[R()*100,R()*60,.25+R()*.45]);const sz=pts.map(()=>.9+R()*1);return {pts,me,br,dust,sz}}
function skySVG(code){const S=skyData(code),P=S.pts;const d='M'+P.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join('L')+(P[S.br+2]?`M${P[S.br][0].toFixed(1)} ${P[S.br][1].toFixed(1)}L${P[S.br+2][0].toFixed(1)} ${P[S.br+2][1].toFixed(1)}`:'');
 const sp=(x,y,r)=>`M${x} ${y-r}Q${x} ${y} ${x+r} ${y}Q${x} ${y} ${x} ${y+r}Q${x} ${y} ${x-r} ${y}Q${x} ${y} ${x} ${y-r}Z`;
 return `<svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${S.dust.map(([x,y,r])=>`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#F4ECD2" opacity=".55"/>`).join('')}
  <path class="ln" d="${d}" style="--l:400"/>${P.map((p,i)=>i===S.me?`<path class="me" d="${sp(p[0],p[1],4.6)}" style="--d:${i*110}ms"/>`:`<circle class="st" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${S.sz[i].toFixed(2)}" style="--d:${i*110}ms"/>`).join('')}</svg>`}
function barSVG(code){const R=rng(hash32(code+'bar'));let x=0,s='';while(x<99){const w=[.8,1.2,2,2.6][Math.floor(R()*4)];s+=`<rect x="${x.toFixed(1)}" width="${w}" height="30"/>`;x+=w+[.8,1.2,2][Math.floor(R()*3)]}
 return `<svg viewBox="0 0 100 30" preserveAspectRatio="none" fill="#2B3A2E" opacity=".86" aria-hidden="true">${s}</svg>`}
function passHTML(p){if(!p)return '<div class="ps-main"></div><div class="ps-stub"></div>';const R=rng(hash32(p.code+'bg'));
 const g=`--gx:${(8+R()*34).toFixed(1)}%;--gy:${(96+R()*40).toFixed(1)}%;--hx:${(58+R()*40).toFixed(1)}%;--hy:${(-46+R()*36).toFixed(1)}%`;
 return `<div class="ps-main" style="${g}"><div class="ps-band"><span>ADMIT ONE</span><b>访客入场券</b></div>
  <div class="ps-no">No.${odoHTML(p.no)}</div>
  <div class="ps-body"><p class="ps-title"><span class="h">Star<i>${STARSVG}</i>Wang</span>的画板</p>
   <p class="ps-sub">打个孔，留个回应：</p>
   <div class="punches">${PUNCH.map(([k,l])=>`<button type="button" class="pch${p.p[k]?' done':''}" data-k="${k}"><span class="tg"></span>${l}<span class="ct"></span>${k==='seal'?`<span class="stampmark">${STAMP9}</span>`:''}</button>`).join('')}</div></div>
  <div class="ps-row"><span>日期<b>${p.d}</b></span><span>时间<b>${p.t}</b></span><span>座位<b>随便坐</b></span></div>
  <div class="ps-check" aria-hidden="true">已入场<small>${p.d}</small></div></div>
 <div class="ps-stub" style="${g}"><div class="sv-h"><span>存根</span><b>No.${no4(p.no)}</b></div>
  <div class="sky">${skySVG(p.code)}</div>
  <div class="sign"><span>签名</span><canvas role="img" aria-label="手写签名区：用鼠标或手指在这里签名"></canvas><button type="button" class="rs" hidden>重写</button></div>
  <div class="sv-code">${codeStr(p)}</div><div class="sv-bar">${barSVG(p.code)}</div></div>`}
/* 票面形状：右边两个半圆缺口；打过的孔真的穿透；撕开后是毛边 */
function maskURL(w,h,side,torn,holes,seed){const r=10,R=rng(seed);let jag='';const n=Math.max(8,Math.round((h-2*r)/4));
 if(side==='m'){if(torn)for(let i=1;i<n;i++)jag+=`L${(w-1-R()*4.5).toFixed(1)} ${(r+(h-2*r)*i/n).toFixed(1)}`;
  var d=`M0 0L${w-r} 0A${r} ${r} 0 0 0 ${w} ${r}${jag}L${w} ${h-r}A${r} ${r} 0 0 0 ${w-r} ${h}L0 ${h}Z`}
 else{if(torn)for(let i=n-1;i>0;i--)jag+=`L${(1+R()*4.5).toFixed(1)} ${(r+(h-2*r)*i/n).toFixed(1)}`;
  var d=`M${r} 0L${w} 0L${w} ${h}L${r} ${h}A${r} ${r} 0 0 0 0 ${h-r}${jag}L0 ${r}A${r} ${r} 0 0 0 ${r} 0Z`}
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><mask id="k" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#fff"/>${holes}</mask></defs><path d="${d}" mask="url(#k)"/></svg>`;
 return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`}
function holeAt(k,cx,cy){const t=`translate(${(cx-7.6).toFixed(1)} ${(cy-7.6).toFixed(1)}) scale(.95)`;return k==='like'?`<path transform="${t}" d="${HEART}" fill="#000"/>`:`<g transform="${t}" fill="#000">${FOOT}</g>`}
function centerIn(el,ref){const a=el.getBoundingClientRect(),b=ref.getBoundingClientRect(),z=b.width/Math.max(1,ref.offsetWidth)||1;return [(a.left+a.width/2-b.left)/z,(a.top+a.height/2-b.top)/z]}
function pmask(){const m=$('#pass .ps-main'),s=$('#pass .ps-stub');if(!m||!m.offsetWidth)return;const torn=PST==='torn',seed=PASS?hash32(PASS.code):7;
 const holes=$$('.pch.done',m).filter(b=>b.dataset.k!=='seal').map(b=>{const [x,y]=centerIn($('.tg',b),m);return holeAt(b.dataset.k,x,y)}).join('');
 m.style.setProperty('--mk',maskURL(m.offsetWidth,m.offsetHeight,'m',torn,holes,seed));
 s.style.setProperty('--mks',maskURL(s.offsetWidth,s.offsetHeight,'s',torn,'',seed+1))}
function setCounts(){$$('#pass .pch').forEach(b=>{const k=b.dataset.k;$('.ct',b).textContent=TOT.known?TOT[k]:''})}
function winText(){if(PST==='printing')return '出票中…';if(PASS&&PST==='torn')return '已入场 '+no4(PASS.no);if(PASS)return 'No.'+no4(PASS.no);return TOT.known?`下一位 ${no4(TOT.visits+1)}`:'请取票'}
function setPST(st){PST=st;const h=$('.hticket');h.dataset.st=st;if(st!=='torn')h.classList.remove('gone');$('#pmwin').textContent=winText();const btn=$('#pmbtn');btn.disabled=st!=='idle';
 $('.lb',btn).textContent=st==='idle'?'取票':st==='printing'?'出票':'已取票';btn.setAttribute('aria-label',st==='idle'?'取一张入场券':'已经取过票了');
 $('#tearbtn').hidden=st!=='issued';const stub=$('#pass .ps-stub');
 if(stub){if(st==='torn'){stub.tabIndex=0;stub.setAttribute('role','button');stub.setAttribute('aria-label','你的存根：点一下带走')}else{stub.removeAttribute('tabindex');stub.removeAttribute('role');stub.removeAttribute('aria-label')}}
 $$('#pass .pch').forEach(b=>b.disabled=st!=='issued')}
/* 手写签名：鼠标移上去是一支钢笔，按住就能写；笔画按比例存，换设备、存成图都一样 */
const SIGC='#1F2E6A';
function sigWire(){const cv=$('#pass .sign canvas'),rs=$('#pass .sign .rs');if(!cv||!PASS)return;PASS.sig=PASS.sig||[];rs.hidden=!PASS.sig.length||PST!=='issued';
 const paint=()=>{const r=cv.getBoundingClientRect();if(!r.width)return;const d=devicePixelRatio||1;cv.width=Math.round(r.width*d);cv.height=Math.round(r.height*d);const x=cv.getContext('2d');x.setTransform(cv.width,0,0,cv.height,0,0);
  x.lineCap=x.lineJoin='round';x.strokeStyle=SIGC;x.lineWidth=1.9/r.height;PASS.sig.forEach(st=>{x.beginPath();x.moveTo(st[0][0],st[0][1]);for(let i=1;i<st.length;i++){const p=st[i-1],q=st[i];x.quadraticCurveTo(p[0],p[1],(p[0]+q[0])/2,(p[1]+q[1])/2)}const l=st[st.length-1];x.lineTo(l[0]+(st.length===1?.004:0),l[1]);x.stroke()})};
 cv._paint=paint;requestAnimationFrame(paint);let cur=null,pid=null,npts=0;
 cv.addEventListener('pointerdown',e=>{if(PST!=='issued'||e.button>0)return;e.preventDefault();e.stopPropagation();pid=e.pointerId;cv.setPointerCapture(pid);npts=PASS.sig.reduce((a,s)=>a+s.length,0);
  const r=cv.getBoundingClientRect();cur=[[+((e.clientX-r.left)/r.width).toFixed(3),+((e.clientY-r.top)/r.height).toFixed(3)]];PASS.sig.push(cur);paint()});
 cv.addEventListener('pointermove',e=>{if(!cur||e.pointerId!==pid||npts>900)return;const r=cv.getBoundingClientRect();const p=[+((e.clientX-r.left)/r.width).toFixed(3),+((e.clientY-r.top)/r.height).toFixed(3)];
  const l=cur[cur.length-1];if(Math.hypot((p[0]-l[0])*r.width,(p[1]-l[1])*r.height)<1.5)return;cur.push(p);npts++;paint()});
 const end=()=>{if(!cur)return;cur=null;passSave();syncPass();rs.hidden=false};cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);
 rs.addEventListener('click',e=>{e.stopPropagation();PASS.sig=[];passSave();syncPass();rs.hidden=true;paint()})}
function signFreeze(){const rs=$('#pass .sign .rs');if(rs)rs.hidden=true}
function noteText(){return `No.${no4(PASS.no)} 的存根交给你了 <button type="button" class="pnagain">再看一眼</button>`}
function passRender(){$('#pass').innerHTML=passHTML(PASS);sigWire();
 setCounts();requestAnimationFrame(pmask)}

/* 后端同步：公开的只有“第几位、打了哪几个孔、撕没撕”；名字只存在自己那份里 */
function tally(snap){TOT.known=true;TOT.visits=snap.size;TOT.like=TOT.kick=TOT.seal=0;snap.docs.forEach(d=>{const v=d.data()||{},p=v.p||{};PUNCH.forEach(([k])=>{if(p[k])TOT[k]++})})}
function ordOf(snap){const me=PASS.first||PASS.at;let n=1;snap.docs.forEach(d=>{if(d.id===DB.uid)return;const v=d.data()||{};if(v.at&&(v.at<me||(v.at===me&&d.id<DB.uid)))n++});return n}
const pubPass=()=>({at:PASS.first||PASS.at,last:PASS.at,code:PASS.code,p:PASS.p,torn:!!PASS.torn});
async function loadTotals(){await dbReady;if(!DB.db)return null;try{const snap=await withTO(DB.db.collection('visits').get());tally(snap);setCounts();$('#pmwin').textContent=winText();return snap}catch(e){return null}}
async function registerVisit(){await dbReady;if(!canWrite())return null;try{await dbSet('visits/'+DB.uid,pubPass());dbSet('data/users/'+DB.uid+'/pass',{...PASS}).catch(()=>{});
  const snap=await withTO(DB.db.collection('visits').get());tally(snap);return ordOf(snap)}catch(e){return null}}
const syncPass=debounce(()=>{if(!PASS||!canWrite())return;dbSet('visits/'+DB.uid,pubPass()).catch(()=>{});dbSet('data/users/'+DB.uid+'/pass',{...PASS}).catch(()=>{})},800);
async function adoptRemote(){await dbReady;if(!DB.db||!DB.uid)return;try{const r=await withTO(DB.db.doc('data/users/'+DB.uid+'/pass').get());
  if(r.exists){const v=r.data();if(v&&v.code&&v.d===todayStr()&&(!PASS||PASS.code!==v.code)&&(!PASS||v.at<PASS.at)){PASS={...v,p:{like:0,kick:0,seal:0,...(v.p||{})}};passSave();passRender();setPST(PASS.torn?'torn':'issued');if(PASS.torn)tornLook(false);rcptRender(false)}}
  else if(PASS&&canWrite())syncPass()}catch(e){}}

async function issue(){if(PST!=='idle')return;const h=$('.hticket'),btn=$('#pmbtn');btn.classList.add('down');setTimeout(()=>btn.classList.remove('down'),160);snd('tick');
 PASS=newPass();passSave();passRender();setPST('printing');$('#pass .sv-h b').textContent='No.····';const t0=performance.now();const srv=registerVisit();
 const tk=$('#pass'),still=SHOT7||RM7.matches;let spin=null;
 if(!still)spin=setInterval(()=>setOdo(tk,Math.floor(Math.random()*9999)),110);
 if(!still){const H=tk.offsetHeight+8;const kf=[[0,-H+9],[.1,-H*.74],[.24,-H*.74],[.34,-H*.49],[.48,-H*.49],[.58,-H*.24],[.72,-H*.24],[.86,0],[.92,3],[1,0]];
  const an=tk.animate(kf.map(([o,y])=>({offset:o,translate:`0 ${y}px`})),{duration:1800,easing:'cubic-bezier(.3,.7,.3,1)'});
  [0,.24,.48,.72].forEach(o=>setTimeout(()=>snd('feed'),o*1800));await an.finished.catch(()=>{})}
 let no=null;try{no=await Promise.race([srv,sleep(Math.max(300,3200-(performance.now()-t0))).then(()=>null)])}catch(e){}
 if(no){PASS.no=no;PASS.ord=true;passSave();syncPass()}
 clearInterval(spin);setOdo(tk,PASS.no);$('#pass .sv-h b').textContent='No.'+no4(PASS.no);snd('tick');
 setPST('issued');setCounts();pmask();if(!still){$('#pass .sky').classList.add('draw')}
 setTimeout(()=>h.classList.add('guide'),still?0:1300)}

function chadFall(k,b){if(RM7.matches)return;const h=$('.hticket'),tg=$('.tg',b),[x,y]=centerIn(tg,h);const c=document.createElement('i');c.className='chad';
 const shape=k==='like'?`<path d="${HEART}"/>`:FOOT;const u=`url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'>${shape}</svg>`)}")`;
 c.style.cssText=`left:${x-11}px;top:${y-11}px;-webkit-mask:${u} center/68% no-repeat;mask:${u} center/68% no-repeat`;h.appendChild(c);
 const dx=(Math.random()-.35)*70,dy=160+Math.random()*60;
 c.animate([{transform:'translate(0,0) rotate(0)'},{transform:`translate(${dx*.4}px,-16px) rotate(110deg)`,offset:.25},{transform:`translate(${dx}px,${dy}px) rotate(320deg)`,opacity:1,offset:.9},{transform:`translate(${dx}px,${dy+8}px) rotate(330deg)`,opacity:0}],{duration:900,easing:'cubic-bezier(.3,.1,.6,1)',fill:'forwards'}).onfinish=()=>c.remove()}
function punch(b){const tk=$('#pass');if(PST!=='issued')return;if(b.classList.contains('done')){b.animate([{translate:'0 0'},{translate:'-2px 0'},{translate:'2px 0'},{translate:'0 0'}],{duration:220});return}
 const k=b.dataset.k;PASS.p[k]=1;passSave();b.classList.add('done','fresh');setTimeout(()=>b.classList.remove('fresh'),400);if(TOT.known){TOT[k]++;setCounts()}
 tk.classList.remove('ticket-jolt','ticket-thud');void tk.offsetWidth;tk.classList.add(k==='seal'?'ticket-thud':'ticket-jolt');snd(k==='seal'?'stamp':'punch');
 if(k!=='seal'){pmask();chadFall(k,b)}syncPass()}
function tornLook(fresh){const h=$('.hticket'),tk=$('#pass');h.classList.remove('guide');if(!fresh){h.classList.add('still');requestAnimationFrame(()=>requestAnimationFrame(()=>h.classList.remove('still')))}setPST('torn');signFreeze();pmask();$('#pnote').innerHTML=noteText();if(!fresh)h.classList.add('gone');
 if(fresh){const c=$('.ps-check',tk);c.classList.add('fresh')}}
function tear(){if(PST!=='issued')return;PASS.torn=true;PASS.tornAt=new Date().toISOString();passSave();
 tornLook(true);rcptRender(true);snd('tear');setTimeout(()=>snd('stamp'),320);setTimeout(()=>snd('feed'),1000);setTimeout(()=>snd('feed'),1250);const s=$('#pass .ps-stub').getBoundingClientRect();ripple(s.left,s.top+s.height/2);syncPass();
 const h=$('.hticket'),q=RM7.matches||SHOT7;setTimeout(()=>{if(PST!=='torn')return;h.classList.add('gone');snd('feed')},q?300:1900);
 setTimeout(()=>{if(PST==='torn')keepStub()},q?500:2500)}

/* 存根画成一张图，可以存下来 */
async function stubPNG(){try{await Promise.all(['20px "Long Cang"','600 16px "IBM Plex Mono"','500 12px "Noto Sans SC"','24px "Homemade Apple"'].map(f=>document.fonts.load(f)))}catch(e){}
 const S=3,W=150*S,H=250*S,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');const R=rng(hash32(PASS.code)+1);
 x.fillStyle='#EFE7D3';x.beginPath();x.moveTo(8*S,0);for(let y=10*S;y<H-10*S;y+=4*S)x.lineTo((1+R()*4.5)*S,y);x.lineTo(8*S,H);x.lineTo(W,H);x.lineTo(W,0);x.closePath();x.fill();
 x.save();x.clip();x.strokeStyle='rgba(94,106,85,.08)';x.lineWidth=S;for(let r=9;r<500;r+=10){x.beginPath();x.arc(W*.2,H*1.2,r*S,0,Math.PI*2);x.stroke()}x.restore();
 x.textAlign='left';x.fillStyle='#4A5A4D';x.font=`400 ${11*S}px "Noto Sans SC"`;x.fillText('存根',18*S,26*S);
 x.textAlign='right';x.fillStyle='#C8412B';x.font=`600 ${14*S}px "IBM Plex Mono"`;x.fillText('No.'+no4(PASS.no),W-14*S,26*S);
 const sx=18*S,sy=38*S,sw=W-32*S,sh=78*S;const g=x.createRadialGradient(sx+sw*.3,sy,4,sx+sw*.3,sy,sw);g.addColorStop(0,'#33456B');g.addColorStop(.7,'#1D2741');x.fillStyle=g;x.fillRect(sx,sy,sw,sh);
 const SD=skyData(PASS.code),k=Math.max(sw/100,sh/60),ox=sx+(sw-100*k)/2,oy=sy+(sh-60*k)/2;x.save();x.beginPath();x.rect(sx,sy,sw,sh);x.clip();
 x.fillStyle='rgba(244,236,210,.55)';SD.dust.forEach(([a,b,r])=>{x.beginPath();x.arc(ox+a*k,oy+b*k,r*k,0,7);x.fill()});
 x.strokeStyle='rgba(232,221,189,.5)';x.lineWidth=.8*k;x.beginPath();SD.pts.forEach((p,i)=>i?x.lineTo(ox+p[0]*k,oy+p[1]*k):x.moveTo(ox+p[0]*k,oy+p[1]*k));if(SD.pts[SD.br+2]){x.moveTo(ox+SD.pts[SD.br][0]*k,oy+SD.pts[SD.br][1]*k);x.lineTo(ox+SD.pts[SD.br+2][0]*k,oy+SD.pts[SD.br+2][1]*k)}x.stroke();
 SD.pts.forEach((p,i)=>{const X=ox+p[0]*k,Y=oy+p[1]*k;if(i===SD.me){const r=4.6*k;x.fillStyle='#E9B949';x.beginPath();x.moveTo(X,Y-r);x.quadraticCurveTo(X,Y,X+r,Y);x.quadraticCurveTo(X,Y,X,Y+r);x.quadraticCurveTo(X,Y,X-r,Y);x.quadraticCurveTo(X,Y,X,Y-r);x.fill()}else{x.fillStyle='#F4ECD2';x.beginPath();x.arc(X,Y,SD.sz[i]*k,0,7);x.fill()}});x.restore();
 x.textAlign='left';x.fillStyle='#6B786C';x.font=`400 ${9.5*S}px "Noto Sans SC"`;x.fillText('签名',18*S,132*S);
 x.save();x.translate(18*S,134*S);x.scale(W-32*S,26*S);x.lineCap=x.lineJoin='round';x.strokeStyle=SIGC;x.lineWidth=1.9/26;(PASS.sig||[]).forEach(st=>{x.beginPath();x.moveTo(st[0][0],st[0][1]);for(let i=1;i<st.length;i++){const p=st[i-1],q=st[i];x.quadraticCurveTo(p[0],p[1],(p[0]+q[0])/2,(p[1]+q[1])/2)}const l=st[st.length-1];x.lineTo(l[0]+(st.length===1?.004:0),l[1]);x.stroke()});x.restore();x.strokeStyle='rgba(43,58,46,.3)';x.lineWidth=S;x.beginPath();x.moveTo(18*S,162*S);x.lineTo(W-14*S,162*S);x.stroke();
 x.fillStyle='#4A5A4D';x.font=`500 ${8.6*S}px "IBM Plex Mono"`;x.fillText(codeStr(PASS),18*S,178*S);x.fillText(PASS.d+'  '+PASS.t,18*S,191*S);
 const RB=rng(hash32(PASS.code+'bar'));let bx=0;x.fillStyle='rgba(43,58,46,.86)';const bw=(W-32*S)/100;while(bx<99){const w=[.8,1.2,2,2.6][Math.floor(RB()*4)];x.fillRect(18*S+bx*bw,200*S,w*bw,30*S);bx+=w+[.8,1.2,2][Math.floor(RB()*3)]}
 x.fillStyle='#4A5A4D';x.font=`400 ${8.5*S}px "Noto Sans SC"`;x.fillText('来过 Star Wang 的画板',18*S,244*S);
 return cv.toDataURL('image/png')}
async function saveFile(url,name,msgEl){const blob=await (await fetch(url)).blob();let dl=null;try{dl=window.claude&&window.claude.use?await window.claude.use('downloads'):null}catch(e){}
 if(dl){try{await dl.save({filename:name,data:blob});msgEl.textContent='存好了。'}catch(e){msgEl.textContent=e&&e.code==='declined'?'没有存，图还在这儿。':'这里暂时存不了，可以长按或右键图片另存。'}return}
 const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();msgEl.textContent='存好了。'}
async function keepStub(){let d=$('#keep');if(!d){d=document.createElement('dialog');d.id='keep';d.className='keep';d.setAttribute('aria-label','你的存根');
  d.innerHTML='<img alt="入场券存根"><p></p><div class="row"><button type="button" class="ok">收好了</button><button type="button" class="save">存成图片</button></div>';document.body.append(d);
  d.querySelector('.ok').onclick=()=>d.close();d.addEventListener('click',e=>{if(e.target===d)d.close()})}
 const url=await stubPNG(),p=d.querySelector('p');d.querySelector('img').src=url;p.textContent=`No.${no4(PASS.no)}，${PASS.d}。这张存根只有一张，存下来就是你的了。`;
 d.querySelector('.save').onclick=()=>saveFile(url,`入场券存根-${no4(PASS.no)}-${PASS.code}.png`,p);d.showModal()}

safe('pass',()=>{const h=$('.hticket'),tk=$('#pass');if(!h||!tk)return;
 const sb=$('#tksnd');const sbSet=()=>{sb.setAttribute('aria-pressed',SON);sb.textContent=SON?'声音 开':'声音 关'};sbSet();sb.onclick=()=>{SON=!SON;try{localStorage.setItem('tk-snd',SON?'1':'0')}catch(e){}sbSet();if(SON)snd('tick')};
 passRender();if(PASS){setPST(PASS.torn?'torn':'issued');if(PASS.torn)tornLook(false);else h.classList.add('guide')}else setPST('idle');
 $('#pmbtn').addEventListener('click',issue);
 tk.addEventListener('click',e=>{const b=e.target.closest('.pch');if(b)punch(b)});
 $('#tearbtn').addEventListener('click',tear);
 $('#pnote').addEventListener('click',e=>{if(e.target.closest('.pnagain')&&PASS&&PST==='torn')keepStub()});
 let sx,sy,on=false,downTorn=false,pid=null;
 tk.addEventListener('pointerdown',e=>{const st=e.target.closest('.ps-stub');if(!st||e.button!==0)return;downTorn=PST==='torn';if(PST!=='issued'||e.target.closest('.sign'))return;
  on=true;sx=e.clientX;sy=e.clientY;pid=e.pointerId;st.setPointerCapture(e.pointerId);tk.classList.add('tearing');e.preventDefault()});
 tk.addEventListener('pointermove',e=>{if(!on||e.pointerId!==pid)return;const st=$('.ps-stub',tk);const d=Math.hypot(e.clientX-sx,e.clientY-sy)/FIT.s,res=d<60?d*.18:10.8+(d-60)*.05;
  st.style.transform=`rotate(${Math.min(14,res).toFixed(2)}deg) translateX(${Math.min(10,d/12).toFixed(1)}px)`;
  if(d>96){on=false;tk.classList.remove('tearing');st.style.transform='';tear()}});
 const up=()=>{if(!on)return;on=false;tk.classList.remove('tearing');const st=$('.ps-stub',tk);if(st)st.style.transform=''};
 tk.addEventListener('pointerup',up);tk.addEventListener('pointercancel',up);
 tk.addEventListener('click',e=>{if(!e.target.closest('.ps-stub'))return;const ok=downTorn;downTorn=false;if(ok&&PST==='torn')keepStub()});
 tk.addEventListener('keydown',e=>{if(!e.target.closest('.ps-stub')||e.target.closest('input'))return;if((e.key==='Enter'||e.key===' ')&&PST==='torn'){e.preventDefault();keepStub()}});
 const repaint=()=>requestAnimationFrame(()=>{pmask();const cv=$('#pass .sign canvas');cv&&cv._paint&&cv._paint()});
 document.addEventListener('pagechange',e=>{if(e.detail==='desk')repaint()});document.addEventListener('fitchange',repaint);
 document.fonts&&document.fonts.ready.then(()=>requestAnimationFrame(pmask));
 rcptRender(false);loadTotals();adoptRemote()});

/* ══ 文具：贴完之后，可以寄给我、存成一张图，或者就留在这儿 ══ */
const hasDIY=()=>DIY.items.length>0||DIY.strokes.length>0;
function diyUI(){const has=hasDIY(),b=$('#donebtn'),l=$('#dlabel');if(b)b.hidden=!has;if(l){l.textContent=has?'贴好了？':'贴点什么';l.classList.toggle('ready',has)}}
const _dsave9=dsave;dsave=function(){_dsave9();diyUI()};
const _drender9=drender;drender=function(){_drender9();diyUI()};
function ghosts(){const h=$('#home'),R=h.getBoundingClientRect(),z=R.width/Math.max(1,h.offsetWidth)||1;
 return $$('#home>.hobj,#home>.hfilm').filter(o=>o.offsetWidth&&!o.closest('[hidden]')).map(o=>{const r=o.getBoundingClientRect();return [Math.round((r.left-R.left)/z),Math.round((r.top-R.top)/z),Math.round(r.width/z),Math.round(r.height/z),o.dataset.name||'胶卷']})}
function boardData(){const h=$('#home');let pts=0;const strokes=[];for(const s of DIY.strokes){const p=s.p.filter((_,i)=>i%2===0||i===s.p.length-1).map(q=>[Math.round(q[0]),Math.round(q[1])]);if(pts+p.length>6000)break;pts+=p.length;strokes.push({p})}
 return {w:h.offsetWidth,h:h.offsetHeight,desk:DIY.desk,items:DIY.items.map(i=>({...i})),strokes,g:ghosts()}}
const TAPEC=['rgba(222,203,160,.8)','rgba(234,168,160,.75)','rgba(150,168,128,.8)','rgba(158,190,214,.78)'];
const DESKC={grid:'#EFEBE2',kraft:'#D9BF98',cork:'#C79F74',mat:'#3D5A4B'};
function svgImg(svg){return new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src='data:image/svg+xml,'+encodeURIComponent(svg.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" '))})}
async function boardPNG(B,scale=1.2){try{await Promise.all(['20px "Caveat"','14px "Oswald"','18px "Long Cang"','12px "Noto Sans SC"'].map(f=>document.fonts.load(f)))}catch(e){}
 const W=B.w||1360,H=B.h||1120,cv=document.createElement('canvas');cv.width=Math.round(W*scale);cv.height=Math.round(H*scale);const x=cv.getContext('2d');x.scale(scale,scale);
 const dark=B.desk==='mat';x.fillStyle=DESKC[B.desk]||DESKC.grid;x.fillRect(0,0,W,H);x.strokeStyle=dark?'rgba(238,240,232,.18)':'rgba(60,50,30,.07)';x.lineWidth=1;
 for(let g=0;g<W;g+=28){x.beginPath();x.moveTo(g+.5,0);x.lineTo(g+.5,H);x.stroke()}for(let g=0;g<H;g+=28){x.beginPath();x.moveTo(0,g+.5);x.lineTo(W,g+.5);x.stroke()}
 x.setLineDash([5,5]);x.strokeStyle=dark?'rgba(238,240,232,.35)':'rgba(60,60,50,.3)';x.fillStyle=dark?'rgba(238,240,232,.55)':'rgba(60,60,50,.45)';x.font='13px "Noto Sans SC", sans-serif';x.textAlign='center';
 (B.g||[]).forEach(([a,b,w,h,l])=>{x.beginPath();x.roundRect?x.roundRect(a,b,w,h,6):x.rect(a,b,w,h);x.stroke();x.fillText(l,a+w/2,b+h/2+4)});x.setLineDash([]);
 x.strokeStyle=dark?'#F1EFE6':'#3B403C';x.lineWidth=2.4;x.lineCap=x.lineJoin='round';(B.strokes||[]).forEach(s=>{if(s.p.length>1)x.stroke(new Path2D(spath(s.p)))});
 for(const it of (B.items||[])){x.save();
  if(it.t==='tape'){x.translate(it.x,it.y);x.rotate(it.a*Math.PI/180);x.globalCompositeOperation='multiply';x.fillStyle=TAPEC[it.p%4];x.fillRect(0,-13,it.len,26)}
  else if(it.t==='st'){const s=(STK.find(q=>q.k===it.k)||STK[0]).svg;const im=await svgImg(s);x.translate(it.x,it.y);x.rotate(it.r*Math.PI/180);if(im)x.drawImage(im,-39,-39,78,78)}
  else if(it.t==='stamp'){x.translate(it.x,it.y);x.rotate(it.r*Math.PI/180);x.globalAlpha=.85;x.strokeStyle='#C8412B';x.fillStyle='#C8412B';x.lineWidth=3;x.beginPath();x.arc(0,0,46,0,7);x.stroke();x.lineWidth=1.2;x.beginPath();x.arc(0,0,37,0,7);x.stroke();
   x.textAlign='center';x.font='600 14px "Oswald", sans-serif';x.fillText(it.d||'',0,-2);x.font='18px "Long Cang", cursive';x.fillText('来过',0,20)}
  else if(it.t==='note'){x.translate(it.x+88,it.y+78);x.rotate(it.r*Math.PI/180);x.fillStyle=it.c||'#F2E199';x.shadowColor='rgba(48,34,18,.25)';x.shadowBlur=10;x.shadowOffsetY=6;x.fillRect(-88,-78,176,156);x.shadowColor='transparent';
   x.fillStyle='#3B3725';x.font='20px "Caveat", "Long Cang", cursive';x.textAlign='left';let ln='',y=-46;for(const ch of (it.text||'')){if(ch==='\n'||x.measureText(ln+ch).width>148){x.fillText(ln,-74,y);y+=28;ln=ch==='\n'?'':ch;if(y>66)break}else ln+=ch}if(y<=66)x.fillText(ln,-74,y)}
  x.restore()}
 x.fillStyle=dark?'rgba(238,240,232,.7)':'rgba(60,60,50,.6)';x.font='13px "Noto Sans SC", sans-serif';x.textAlign='right';x.fillText(`贴在 Star Wang 的画板上 · ${B.d||todayStr()}`,W-24,H-20);
 return cv.toDataURL('image/png')}

safe('after',()=>{const d=$('#after');if(!d)return;const pane=p=>$$('.apane',d).forEach(x=>x.hidden=x.dataset.p!==p);
 const open=()=>{pane('pick');$('#anote').textContent='';d.showModal()};window.openAfter=open;
 $('#donebtn').onclick=open;
 document.addEventListener('pointerdown',e=>{if(e.target.closest('#dlabel'))e.stopPropagation()},true);
 document.addEventListener('click',e=>{if(!e.target.closest('#dlabel'))return;e.preventDefault();e.stopPropagation();if(hasDIY())open();else{if(!TRAYOPEN)$('#traytog').click();setTool('tape')}},true);
 $('#ax').onclick=()=>d.close();d.addEventListener('click',e=>{if(e.target===d)d.close()});
 const done=(h,html)=>{$('#adoneh').textContent=h;$('#adonep').innerHTML=html;pane('done')};
 d.addEventListener('click',async e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a;
  if(a==='pick')pane('pick');
  if(a==='close')d.close();
  if(a==='keep'){d.close();toast('好，它们会留在原处',()=>{});$('#toastb').hidden=true;setTimeout(()=>$('#toastb').hidden=false,6200)}
  if(a==='send'){pane('send');await dbReady;$('#anote').textContent=canWrite()?'':'这个页面现在没法直接替你寄出。点「寄出」会打开你的邮件应用，收件人和内容都帮你填好。';setTimeout(()=>$('.asend textarea').focus(),50)}
  if(a==='save'){done('存成一张图','<span class="wait">正在画……</span>');const url=await boardPNG(boardData());
   $('#adonep').innerHTML=`<img src="${url}" alt="你贴过的画板" style="width:100%;height:auto;border:1px solid rgba(0,0,0,.08)"><span class="msg" style="display:block;margin-top:8px"></span>`;
   const row=$('.adone .arow',d);row.innerHTML='<button type="button" class="aback" data-a="close">关闭</button><button type="button" class="ago sv">存下来</button>';
   $('.sv',row).onclick=()=>saveFile(url,`我贴的画板-${todayStr()}.png`,$('#adonep .msg'))}});
 $('.asend',d).addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,kind=f.ak.value,text=f.at.value.trim().slice(0,600),sign=f.as.value.trim().slice(0,30);
  const go=$('.ago',f);go.disabled=true;go.textContent='寄出中…';const row=$('.adone .arow',d);row.innerHTML='<button type="button" class="ago" data-a="close">好</button>';
  try{await dbReady;if(canWrite()){const L={at:new Date().toISOString(),kind,text,sign,board:{...boardData(),d:todayStr()}};
    const ref=DB.db.doc('letters/'+DB.uid);let items=[];try{const c=await withTO(ref.get());if(c.exists)items=(c.data().items||[]).slice()}catch(err){}
    items.push(L);while(items.length>20||JSON.stringify(items).length>220000)items.shift();
    await dbSet('letters/'+DB.uid,{items,n:items.length,last:L.at});f.reset();done('寄出了','我会在信箱里看到你写的话，和你贴在画板上的这些东西。');return}}catch(err){}
  finally{go.disabled=false;go.textContent='寄出'}
  const n=DIY.items.length,m=DIY.strokes.length;const body=`${text||'（没写字，只是来贴了点东西）'}\n\n—— ${sign||'一位访客'}\n（我在你的画板上贴了 ${n} 样东西${m?`，画了 ${m} 笔`:''}。想看的话，我可以把画板存成图发给你。）`;
  const href=`mailto:w_wangyi163@163.com?subject=${encodeURIComponent('[画板来信] '+({建议:'一条建议',想法:'一个想法',招呼:'打个招呼'}[kind]||kind))}&body=${encodeURIComponent(body)}`;
  done('帮你写好了一封邮件',`收件人 w_wangyi163@163.com，内容已经填好。想把画板也带上，可以先「存成一张图」，再作为附件一起寄。`);
  row.innerHTML=`<button type="button" class="aback" data-a="pick">返回</button><a class="ago" href="${href}" target="_blank" rel="noopener" style="text-decoration:none;font:500 13.5px/1 'Noto Sans SC',sans-serif;padding:10px 16px;border-radius:4px;background:var(--ink);color:#F7F5F0">打开邮件</a>`});
 diyUI()});

/* ══ 信箱：只有 Star 自己能读 ══ */
const IBSEEN='ib-seen';
async function ownerInit(){await dbReady;if(!DB.owner||!DB.db)return;
 try{const s=await withTO(DB.db.collection('letters').get());const seen=lsGet(IBSEEN,'');let n=0;s.docs.forEach(d=>{(d.data().items||[]).forEach(it=>{if(it.at>seen)n++})});$('#nbadge').textContent=n?String(n):''}catch(e){}}
async function inboxLoad(){const sum=$('#ibsum'),list=$('#iblist'),stats=$('#ibstats');await dbReady;
 if(!DB.owner||!DB.db){sum.textContent='这一页只有我自己看得到。';list.innerHTML='';stats.innerHTML='';return}
 sum.textContent='正在取信……';
 try{const [ls,vs]=await Promise.all([withTO(DB.db.collection('letters').get()),withTO(DB.db.collection('visits').get())]);tally(vs);
  const torn=vs.docs.filter(d=>(d.data()||{}).torn).length;
  stats.innerHTML=`<span><b>${TOT.visits}</b>取过票</span><span><b>${torn}</b>撕下存根</span><span><b>${TOT.like}</b>赞你一下</span><span><b>${TOT.kick}</b>踢你一下</span><span><b>${TOT.seal}</b>盖个章</span>`;
  const all=[];ls.docs.forEach(d=>(d.data().items||[]).forEach((it,i)=>all.push({uid:d.id,i,...it})));all.sort((a,b)=>a.at<b.at?1:-1);
  sum.textContent=all.length?`一共 ${all.length} 封。来自只读访客的信会走邮件，不在这里。`:'还没有信。';
  list.innerHTML=all.map((it,k)=>`<article class="ibl" data-k="${k}"><header><b>${esc({建议:'建议',想法:'想法',招呼:'招呼'}[it.kind]||it.kind)}</b><time>${esc(it.at.slice(0,16).replace('T',' '))}</time></header>${it.text?`<p>${esc(it.text)}</p>`:''}${it.sign?`<span class="sg">—— ${esc(it.sign)}</span>`:''}<img alt="来信附带的画板" hidden><button type="button" class="del">删掉这封</button></article>`).join('');
  lsSet(IBSEEN,all[0]?all[0].at:'');$('#nbadge').textContent='';
  for(const [k,it] of all.entries()){if(!it.board||!(it.board.items||[]).length&&!(it.board.strokes||[]).length)continue;const img=$(`.ibl[data-k="${k}"] img`,list);boardPNG(it.board,.5).then(u=>{img.src=u;img.hidden=false})}
  list.onclick=async e=>{const b=e.target.closest('.del');if(!b)return;const it=all[+b.closest('.ibl').dataset.k];if(!confirm('删掉这封信？删了就找不回来了。'))return;
   try{const r=await withTO(DB.db.doc('letters/'+it.uid).get());const items=(r.data().items||[]).filter(x=>x.at!==it.at);await withTO(DB.db.doc('letters/'+it.uid).set({items,n:items.length,last:items.length?items[items.length-1].at:''}));b.closest('.ibl').remove()}catch(err){alert('没删掉，稍后再试。')}}
 }catch(e){sum.textContent='信箱暂时打不开，稍后再试。'}}
safe('inbox',()=>{ownerInit();document.addEventListener('pagechange',e=>{if(e.detail==='inbox')inboxLoad()});if(CURPG==='inbox')inboxLoad()});

/* ══ 联动：字、箭头和它指向的东西一起动（全部照片↔胶卷、卡片盒↔卡片、书架↔书）。用委托，重新渲染后照样有效 ══ */
const LKG=[['.hphotos .door','a.hfilm'],['.hcards .door','#cstack'],['.hbooks .door','#homeBooks']];
function lkSet(t){LKG.forEach(g=>{const on=!!t&&g.some(s=>t.closest&&t.closest(s));$$(g.join(',')).forEach(x=>x.classList.toggle('lk',on))})}
safe('linked',()=>{document.addEventListener('pointerover',e=>{if(e.pointerType==='mouse')lkSet(e.target)});document.addEventListener('pointerleave',()=>lkSet(null));
 document.addEventListener('focusin',e=>lkSet(e.target))});

/* ══ Projects ══ */
const ME='Yuxiang Wang';
const PAPERS=[
 {id:'drwkv',k:'paper',v:'WACV 2026',kind:'会议论文',y:'2026',t:'DRWKV: Focusing on Object Edges for Low-Light Image Enhancement',
  au:['Xuecheng Bai*','Yuxiang Wang*','Boyu Hu','Qinyuan Jie','Chuanzhi Xu','Kechen Li','Hongru Xiao','Vera Chung'],note:'* 共同第一作者',
  kw:['Low-light Image Enhancement','Receptance Weighted Key Value','Global Edge Retinex Theory'],
  zh:'低光照图像增强：把光照和物体边缘拆开处理，让增强后的边缘更连贯、颜色更自然，也能帮到低光下的多目标跟踪。',
  ab:'Low-light image enhancement remains a challenging task, particularly in preserving object edge continuity and fine structural details under extreme illumination degradation. In this paper, we propose a novel model, DRWKV (Detailed Receptance Weighted Key Value), which integrates our proposed Global Edge Retinex (GER) theory, enabling effective decoupling of illumination and edge structures for enhanced edge fidelity. Secondly, we introduce Evolving WKV Attention, a spiral-scanning mechanism that captures spatial edge continuity and models irregular structures more effectively. Thirdly, we design the Bilateral Spectrum Aligner (Bi-SAB) and a tailored MS2-Loss to jointly align luminance and chrominance features, improving visual naturalness and mitigating artifacts. Extensive experiments on five LLIE benchmarks demonstrate that DRWKV achieves leading performance in PSNR, SSIM, and NIQE while maintaining low computational complexity. Furthermore, DRWKV enhances downstream performance in low-light multi-object tracking tasks, validating its generalization capabilities.',
  ln:[['论文','https://openaccess.thecvf.com/content/WACV2026/html/Bai_DRWKV_Focusing_on_Object_Edges_for_Low-Light_Image_Enhancement_WACV_2026_paper.html'],['arXiv','https://arxiv.org/abs/2507.18594'],['代码','https://github.com/JackBaixue/DRWKV']]},
 {id:'mgdfis',k:'paper',v:'arXiv',kind:'预印本',y:'2025',t:'MGDFIS: Multi-scale Global-detail Feature Integration Strategy for Small Object Detection',
  au:['Yuxiang Wang*','Xuecheng Bai*','Chuanzhi Xu','Ying Zhou','Weidong Cai'],note:'* 共同第一作者',
  kw:['Small Object Detection','UAV Imagery','Multi-scale Feature Fusion','Attention'],
  zh:'无人机画面里的小目标检测：在检测颈部把全局上下文、局部细节和像素级的前景/背景校准放进同一条融合路径。',
  ab:'Small-object detection in Unmanned Aerial Vehicle (UAV) imagery requires preserving weak local evidence while using broader context to separate tiny foreground targets from cluttered backgrounds. Existing multi-scale fusion methods improve feature aggregation, but they often add computation or blur fine details during repeated cross-scale fusion. The central challenge is to balance low-SNR target preservation, clutter suppression, and efficient cross-scale context exchange. To address this challenge, we propose the Multi-scale Global-detail Feature Integration Strategy (MGDFIS), a neck-level feature-fusion strategy that couples global context exchange, local-detail recovery, and pixel-level foreground-background recalibration. MGDFIS integrates three coordinated modules: FusionLock-TSS Attention for stabilizing spectral-spatial responses, Global-detail Integration for combining long-range mixing with local detail capture, and Dynamic Pixel Attention for reweighting compact foreground regions. On the controlled VisDrone setting, YOLO26m + MGDFIS improves AP50:95 from 25.7 to 30.2 and AP50 from 37.2 to 44.2 over the YOLO26m baseline, with 96.1 GFLOPs. Additional dataset-specific evaluations report 38.9 AP50 and 21.9 AP50:95 on UAVDT and 97.4 AP50 on CARPK.',
  ln:[['arXiv','https://arxiv.org/abs/2506.12697'],['代码','https://github.com/Bai-Xuecheng/MGDFIS']]},
 {id:'collabod',k:'paper',v:'arXiv',kind:'预印本',y:'2026',t:'CollabOD: Collaborative Multi-Backbone with Cross-scale Vision for UAV Small Object Detection',
  au:['Xuecheng Bai*','Yuxiang Wang*','Chuanzhi Xu','Kang Han','Jun Guo','Pengfei Ye'],note:'* 共同第一作者',
  kw:['UAV Small Object Detection','Lightweight Detector','Cross-scale Feature Alignment','Multi-backbone'],
  zh:'还是无人机小目标：在多尺度融合之前先保住结构细节、对齐不同路径的特征，推理时检测头依然轻量。',
  ab:'Small object detection in unmanned aerial vehicle (UAV) imagery is challenging because high-altitude viewpoints produce severe scale variation, weak structural cues, and tight computational budgets. Existing lightweight detectors usually fuse multi-scale features after downsampling, where boundary and texture details have already been attenuated and heterogeneous feature streams may be spatially misaligned. To address these issues, we propose CollabOD, a collaborative detection framework that preserves structural details, aligns cross-path features before fusion, and keeps the detection head lightweight at inference time. CollabOD combines a Dual-Path Fusion Stem, a Dense Aggregation Block, a Bilateral Reweighting Module, and a Unified Detail-Aware Head to strengthen localization-oriented representation while limiting extra computation. On VisDrone, CollabOD obtains 52.4 AP50, 30.8 AP75, and 29.9 AP50:95 with 65.5 GFLOPs; on UAVDT it reaches 31.2 AP50 and 17.4 AP50:95; and on AI-TOD it reaches 45.4 AP50 and 20.0 AP50:95 at 137 FPS.',
  ln:[['arXiv','https://arxiv.org/abs/2603.05905'],['代码','https://github.com/Bai-Xuecheng/CollabOD']]}];
const COLWORK={
 what:'一个面向会后协作的 AI Agent：从会议逐字稿里找出行动项，让负责人确认分工、派发给成员，一路跟进多人提交，直到成果被验收、汇总成终稿。它不是再多生成一份会议纪要，而是让会后的事有人负责、有迹可循。',
 why:'社团会议结束之后，决定当场就有了，难的是会后：谁来做、做到哪一步、交上来的是不是最新版，常常散在群聊里，没人说得清。开会只是开始，我想让“会后”这段路也被好好接住。',
 can:['从逐字稿里定位行动线索，每条都附上原文证据','负责人补全任务、选参与者、按版本派发；成员逐个接受或退回','承诺时间、进展、风险、求助，都记在同一项任务下','多人提交保留版本和来源，成果经过校验和人工验收','终稿只引用验收过的版本，负责人批准后才发布','接入飞书：派发卡片、接受 / 退回（部分已在真实团队里跑通）'],
 flow:[['逐字稿','导入会议记录'],['抽取','找出候选行动项和原文'],['复核派发','负责人确认、分工'],['回应','成员接受或退回'],['推进','进展、风险、求助'],['提交验收','多版本、人工把关'],['汇总','引用验收过的版本'],['发布','负责人批准、归档']],
 next:['降低复核负担：现在漏得少了，但每场会要看的草稿和提示还太多，下一步提高精度','在真实飞书团队里补全逐字稿导入和群成员对应','多步骤投票和审批的跨窗口串联','组织级权限、真实工作日历、部署与运维'],
 stack:['Python 3.12','React · TypeScript','SQLite / PostgreSQL','飞书长连接','Human-in-the-loop'],
 ln:[['GitHub','https://github.com/Wangyx163/colwork_agent']]};
function auHTML(a){return a.map(n=>{const bare=n.replace(/[*†]/g,'');return bare===ME?`<b class="me">${esc(n)}</b>`:esc(n)}).join(', ')}
const lnHTML=ln=>`<nav class="pj-ln" aria-label="链接">${ln.map(([l,u])=>`<a href="${u}" target="_blank" rel="noopener">${l}<span aria-hidden="true"> ↗</span></a>`).join('')}</nav>`;
function pjRender(){const b=$('#pjboard');if(!b)return;
 const P=[...PAPERS].sort((x,y)=>(+y.y)-(+x.y));const notes=[...new Set(P.map(p=>p.note).filter(Boolean))];
 const papers=`<section class="pubs" aria-labelledby="pubs-h"><h2 class="pub-h" id="pubs-h">Publications<span>${P.length}</span></h2><ol class="publ">${P.map(p=>{const main=(p.ln.find(l=>l[0]==='论文')||p.ln[0]||[])[1];
  return `<li class="pub" id="pj-${p.id}"><span class="pub-y">${p.y}</span><div class="pub-m">
  <h3 class="pub-t" lang="en">${main?`<a href="${main}" target="_blank" rel="noopener">${p.t}</a>`:p.t}</h3>
  <p class="pub-au" lang="en">${auHTML(p.au)}</p>
  <p class="pub-v"><span class="pub-venue">${p.v}</span><span class="pub-kind">${p.kind}</span>${p.ln.map(([l,u])=>`<a href="${u}" target="_blank" rel="noopener">${l}<span aria-hidden="true"> ↗</span></a>`).join('')}</p>
  <details class="pj-ab pub-ab"><summary>摘要</summary><p class="pub-zh">${p.zh}</p><p lang="en">${p.ab}</p><ul class="pj-kw" aria-label="关键词">${p.kw.map(k=>`<li lang="en">${k}</li>`).join('')}</ul></details>
  </div></li>`}).join('')}</ol>${notes.map(n=>`<p class="pub-note">${n}</p>`).join('')}</section>`;
 const c=COLWORK;
 const build=`<article class="pj pj-build" data-k="build" id="pj-colwork">
  <span class="pj-tape" aria-hidden="true"></span>
  <header class="pj-h"><span class="pj-v">个人项目</span><span>还在迭代</span></header>
  <h3 class="pj-t">ColWork<small>会后协作 Agent</small></h3>
  <p class="pj-lede">从会议决策，到有人负责、持续协作、可追溯且经过确认的成果。</p>
  <div class="pj-two"><section><h4>它是做什么的</h4><p>${c.what}</p></section><section><h4>灵感从哪来</h4><p>${c.why}</p></section></div>
  <section><h4>一场会之后，它怎么走</h4><ol class="pj-flow">${c.flow.map(([a,d])=>`<li tabindex="0"><b>${a}</b><span>${d}</span></li>`).join('')}</ol></section>
  <div class="pj-two"><section><h4>现在能做的</h4><ul class="pj-list">${c.can.map(x=>`<li>${x}</li>`).join('')}</ul></section>
  <section><h4>接下来</h4><ul class="pj-list next">${c.next.map(x=>`<li>${x}</li>`).join('')}</ul></section></div>
  <ul class="pj-kw" aria-label="技术">${c.stack.map(k=>`<li>${k}</li>`).join('')}</ul>
  ${lnHTML(c.ln)}</article>`;
 b.innerHTML=`${papers}<section class="pjs" aria-labelledby="pjs-h"><h2 class="pub-h" id="pjs-h">在做的东西<span>1</span></h2>${build}</section>`;
 const fs=$$('[data-page=projects] .pjf');fs.forEach(f=>f.addEventListener('click',()=>{const v=f.dataset.f;fs.forEach(x=>{x.classList.toggle('on',x===f);x.setAttribute('aria-pressed',x===f)});
  $('.pubs',b).hidden=v==='build';$('.pjs',b).hidden=v==='paper'}))}
safe('projects',pjRender);

/* ══════════ v9.2：书架、卡片、内容存储、开发端 / 展示端 ══════════ */
const STN={reading:'在读',read:'读过',want:'想读'};
const SKN={night:'深蓝布面',stone:'米白哑光纸',debate:'深青哑光',tencent:'白色亮面',photo:'砖红布面',plain:'纯色（下面选颜色）'};
let COVERS={};let SHF='all';
const bookById=id=>BOOKS.find(b=>b.id===id);
function note9(msg){toast(msg,()=>{});const b=$('#toastb');if(b){b.hidden=true;setTimeout(()=>b.hidden=false,6200)}}

/* 首页：只摆“在读”的几本 */
function homeBooksRender(){const sh=$('#homeBooks');if(!sh)return;const R=BOOKS.filter(b=>b.st==='reading').slice(0,7);
 sh.innerHTML=spinesHTML(false,R)+`<div class="binfo" id="binfo" aria-live="polite"><p class="bi-hint">最近在读 ${R.length} 本<br>指一本看看</p></div>`}
function focusBook(id){const el=$('#book-'+id);if(!el)return;el.scrollIntoView({block:'center',behavior:RM.matches?'auto':'smooth'});el.classList.remove('lit');void el.offsetWidth;el.classList.add('lit');el.focus({preventScroll:true})}
safe('homeBooks',()=>{homeBooksRender();const sh=$('#homeBooks');let cur=-1,t=null,touch=false;
 const info=()=>$('#binfo');const hint=()=>`<p class="bi-hint">最近在读 ${$$('.sp',sh).length} 本<br>指一本看看</p>`;
 const show=i=>{clearTimeout(t);if(cur===i)return;cur=i;$$('.sp',sh).forEach(s=>s.classList.toggle('on',+s.dataset.i===i));info().innerHTML=binfoHTML(BOOKS[i]);info().classList.add('show')};
 const hide=()=>{clearTimeout(t);t=setTimeout(()=>{cur=-1;$$('.sp',sh).forEach(s=>s.classList.remove('on'));const f=info();if(f){f.classList.remove('show');f.innerHTML=hint()}},300)};
 const go=i=>{BOOK_FOCUS=i!=null&&BOOKS[i]?BOOKS[i].id:null;location.hash='#/shelf'};
 sh.addEventListener('pointerdown',e=>{if(e.target.closest('.sp'))touch=e.pointerType!=='mouse'});
 sh.addEventListener('pointerover',e=>{const s=e.target.closest('.sp');if(s&&e.pointerType==='mouse')show(+s.dataset.i);if(e.target.closest('#binfo'))clearTimeout(t)});
 sh.addEventListener('pointerout',e=>{if(e.pointerType!=='mouse')return;const s=e.target.closest('.sp,#binfo');if(s&&!s.contains(e.relatedTarget))hide()});
 sh.addEventListener('focusin',e=>{const s=e.target.closest('.sp');if(s)show(+s.dataset.i)});sh.addEventListener('focusout',e=>{if(e.target.closest('.sp'))hide()});
 sh.addEventListener('click',e=>{const s=e.target.closest('.sp');if(s){const i=+s.dataset.i;if(touch&&cur!==i){show(i);return}go(i);return}
  if(e.target.closest('#binfo'))go(cur>=0?cur:null);else if(e.target.closest('.ledge,.bookend'))go(null)})});

/* 书架页：正常的书籍展示，能一直加下去 */
function coverHTML(b){const img=COVERS[b.id];if(img)return `<img src="${img}" alt="《${esc(b.t)}》的封面照片" loading="lazy">`;
 const sk=b.sk||'plain';return `<span class="cv sk-${sk}"${sk==='plain'?` style="--c:${b.c||'#5E6A55'};--fc:${b.fc||'#F4EFE4'}"`:''} aria-hidden="true"><i class="cv-top"></i><span class="cv-t">${esc(b.t)}</span>${b.sub?`<span class="cv-sub">${esc(b.sub)}</span>`:''}${b.en&&b.en.length<=28?`<span class="cv-en">${esc(b.en)}</span>`:''}<span class="cv-a">${esc(b.sa||'')}</span></span>`}
const lnk=(u,n)=>u?`<a href="${esc(u)}" target="_blank" rel="noopener">${esc(n||'来源')} ↗</a>`:'';
function bookCardHTML(b){const meta=[b.a,b.pub,b.y].filter(Boolean).map(esc).join(' · ');
 return `<article class="bco" id="book-${b.id}" tabindex="-1" data-id="${b.id}">
 <div class="bco-cv">${coverHTML(b)}</div>
 <div class="bco-m"><span class="bco-st st-${b.st}">${STN[b.st]||''}</span><h3>${esc(b.t)}</h3>${b.sub?`<p class="bco-sub">${esc(b.sub)}</p>`:''}${b.en?`<p class="bco-en">${esc(b.en)}</p>`:''}${meta?`<p class="bco-a">${meta}</p>`:''}
 ${b.q?`<p class="bco-q"><q>${esc(b.q)}</q><span class="bco-src">${b.src?lnk(b.src,b.srcn==='豆瓣'?'豆瓣简介':b.srcn):esc(b.srcn||'')}</span></p>`:''}
 ${b.note?`<p class="bco-note">${esc(b.note)} ${lnk(b.src,b.srcn)}</p>`:''}${b.ref?`<p class="bco-ref">${lnk(b.ref,b.refn)}</p>`:''}
 ${b.my?`<p class="bco-my"><span class="ic-l">我想到</span>${esc(b.my)}</p>`:''}</div>
 <div class="devbar"><button type="button" class="devbtn" data-dev="book-edit" data-id="${b.id}">编辑</button><button type="button" class="devbtn" data-dev="book-del" data-id="${b.id}">删掉</button></div></article>`}
function shelfRender(){const g=$('#shelfBooks'),f=$('#shf');if(!g)return;const n={all:BOOKS.length};['reading','read','want'].forEach(k=>n[k]=BOOKS.filter(b=>b.st===k).length);
 if(SHF!=='all'&&!n[SHF])SHF='all';
 f.innerHTML=['all','reading','read','want'].filter(k=>k==='all'||n[k]).map(k=>`<button type="button" class="pjf${SHF===k?' on':''}" data-f="${k}" aria-pressed="${SHF===k}">${k==='all'?'全部':STN[k]} <b>${n[k]}</b></button>`).join('');
 const L=BOOKS.filter(b=>SHF==='all'||b.st===SHF);if(!L.length){g.innerHTML='<p class="empty">这一格还空着。</p>';return}
 const cats=[...BCAT,['other','其他']];const known=new Set(BCAT.map(c=>c[0]));
 g.innerHTML=cats.map(([k,l])=>{const B=L.filter(b=>(known.has(b.cat)?b.cat:'other')===k);return B.length?`<section class="shcat" aria-label="${l}"><h2 class="shcat-h">${l}<span>${B.length}</span></h2><div class="shgrid">${B.map(bookCardHTML).join('')}</div></section>`:''}).join('')}
safe('shelf9',()=>{shelfRender();$('#shf').addEventListener('click',e=>{const b=e.target.closest('.pjf');if(!b)return;SHF=b.dataset.f;shelfRender()})});
document.addEventListener('pagechange',e=>{if(e.detail==='shelf'&&BOOK_FOCUS){const id=BOOK_FOCUS;BOOK_FOCUS=null;if(SHF!=='all'){SHF='all';shelfRender()}setTimeout(()=>focusBook(id),80)}});

/* 卡片盒：首页那摞和 Mind 页的卡盒 */
const cardDev=c=>`<div class="devbar"><button type="button" class="devbtn" data-dev="card-edit" data-no="${c.no}">编辑</button><button type="button" class="devbtn" data-dev="card-del" data-no="${c.no}">删掉</button></div>`;
function cardsRender(){safe('stack',buildStack);const box=$('#cbox');if(!box)return;
 box.innerHTML=CARDS.length?CARDS.map(c=>icardHTML(c).replace(/<\/article>$/,cardDev(c)+'</article>')).join(''):'<p class="empty">卡盒还是空的。</p>';
 $$('#cbox .icard').forEach((c,i)=>{c.style.setProperty('--r',[-1.2,1.4,-.4,.9,-1.6][i%5]+'deg');c.style.setProperty('--cw','300px')})}
safe('cards9',cardsRender);

/* 内容：默认写在页面里；我在开发端改过的，存进页面自带的数据库，所有能读数据的人看到的都是新的 */
const LOCALDEV=location.hostname==='127.0.0.1'&&/[?&]dev\b/.test(location.search);
const CONTENT_DOC='content/site';
function contentSnapshot(){return {cards:CARDS.map(c=>({...c})),books:BOOKS.map(b=>({...b})),log:LOG.map(l=>[l[0],l[1]]),qa:QA.map(x=>({...x})),at:new Date().toISOString()}}
function renderAll(){cardsRender();homeBooksRender();shelfRender();rcptRender(false)}
function contentApply(d){if(!d)return;if(Array.isArray(d.cards))CARDS.splice(0,CARDS.length,...d.cards);if(Array.isArray(d.books))BOOKS.splice(0,BOOKS.length,...d.books);if(Array.isArray(d.qa))d.qa.forEach(x=>{const o=QA.find(y=>y.id===x.id);if(o)Object.assign(o,x);else QA.splice(QA.length-1,0,x)});
 if(Array.isArray(d.log))LOG.splice(0,LOG.length,...d.log.map(l=>[l[0],l[1],'']));renderAll()}
async function contentLoad(){if(LOCALDEV){contentApply(lsGet('dev-content'));COVERS=lsGet('dev-covers',{})||{};shelfRender();return}
 await dbReady;if(!DB.db)return;try{const r=await withTO(DB.db.doc(CONTENT_DOC).get());if(r.exists)contentApply(r.data())}catch(e){}
 try{const cs=await withTO(DB.db.collection('covers').get());cs.docs.forEach(d=>{const v=d.data();if(v&&v.img)COVERS[d.id]=v.img});shelfRender()}catch(e){}}
async function contentSave(){const d=contentSnapshot();if(LOCALDEV){lsSet('dev-content',d);note9('存好了（本地测试）');return true}
 if(DB.owner&&DB.db){try{await dbSet(CONTENT_DOC,d);note9('存好了');return true}catch(e){note9('没存上：'+(e&&e.code==='quota_exceeded'?'存储满了':'稍后再试'));return false}}
 note9('只有在开发端才能保存');return false}
async function coverSave(id,img){if(img)COVERS[id]=img;else delete COVERS[id];if(LOCALDEV){lsSet('dev-covers',COVERS);return}
 if(DB.owner&&DB.db){try{if(img)await dbSet('covers/'+id,{img});else await withTO(DB.db.doc('covers/'+id).delete())}catch(e){note9('封面没存上，稍后再试')}}}
safe('content',contentLoad);

/* 编辑框：一个通用的小表单 */
function shrinkImg(file,max=420){return new Promise((res,rej)=>{const r=new FileReader();r.onerror=rej;r.onload=()=>{const im=new Image();im.onerror=rej;im.onload=()=>{const k=Math.min(1,max/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.82))};im.src=r.result};r.readAsDataURL(file)})}
function editDialog(title,fields,vals={},opt={}){return new Promise(done=>{let d=$('#ed');if(!d){d=document.createElement('dialog');d.id='ed';d.className='after ed';document.body.append(d)}
 d.innerHTML=`<form class="apane" method="dialog"><h3>${esc(title)}</h3>${opt.tip?`<p class="edtip">${esc(opt.tip)}</p>`:''}<div class="edf">${fields.map(f=>{const v=vals[f.k]??f.def??'';const id='ed-'+f.k;
  if(f.type==='select')return `<label class="afield"><span>${f.l}</span><select id="${id}" name="${f.k}">${f.opts.map(([k,l])=>`<option value="${k}"${k===v?' selected':''}>${l}</option>`).join('')}</select></label>`;
  if(f.type==='textarea')return `<label class="afield"><span>${f.l}</span><textarea id="${id}" name="${f.k}" rows="${f.rows||3}" placeholder="${esc(f.ph||'')}"${f.req?' required':''}>${esc(v)}</textarea></label>`;
  if(f.type==='color')return `<label class="afield"><span>${f.l}</span><input type="color" id="${id}" name="${f.k}" value="${esc(v||'#5E6A55')}"></label>`;
  if(f.type==='file')return `<label class="afield"><span>${f.l}</span><input type="file" id="${id}" name="${f.k}" accept="image/*">${vals.__img?`<span class="edimg"><img src="${vals.__img}" alt=""><label><input type="checkbox" name="${f.k}__rm"> 去掉这张</label></span>`:''}<small>${esc(f.ph||'')}</small></label>`;
  return `<label class="afield"><span>${f.l}</span><input id="${id}" name="${f.k}" value="${esc(v)}" placeholder="${esc(f.ph||'')}"${f.req?' required':''}></label>`}).join('')}</div>
  <div class="arow">${opt.del?'<button type="button" class="aback eddel">删掉</button>':''}<span style="flex:1"></span><button type="button" class="aback edx">取消</button><button type="submit" class="ago">保存</button></div></form>`;
 const f=$('form',d);let out=null;
 $('.edx',d).onclick=()=>d.close();const del=$('.eddel',d);if(del)del.onclick=()=>{out={action:'del'};d.close()};
 f.onsubmit=async e=>{e.preventDefault();const v={};for(const fl of fields){const el=f.elements[fl.k];if(fl.type==='file'){const file=el.files&&el.files[0];v[fl.k]=file?await shrinkImg(file).catch(()=>null):undefined;if(f.elements[fl.k+'__rm']&&f.elements[fl.k+'__rm'].checked)v[fl.k]=null}else v[fl.k]=(el.value||'').trim()}
  out={action:'ok',v};d.close()};
 d.addEventListener('close',()=>done(out),{once:true});d.showModal()})}

/* 开发端的动作 */
const CARD_F=[{k:'k',l:'类型',type:'select',opts:[['句子','句子（一句原话）'],['看到','看到（一个画面）'],['想法','想法（冒出来的念头）']]},{k:'d',l:'日期',ph:'例如 11.19'},{k:'q',l:'记下来的东西',type:'textarea',req:true,ph:'原话、看到的画面，或者那个想法'},{k:'n',l:'我想到',type:'textarea',rows:2,ph:'当时的理解，一两句'},{k:'s',l:'出处',ph:'在哪儿遇见的（可空）'}];
const BOOK_F=[{k:'st',l:'状态',type:'select',opts:[['reading','在读（会出现在首页）'],['read','读过'],['want','想读']]},{k:'cat',l:'分类',type:'select',opts:BCAT},{k:'t',l:'书名',req:true},{k:'sub',l:'副标题（可空）'},{k:'en',l:'原作名（外文书才填，可空）'},{k:'a',l:'作者 / 译者'},{k:'pub',l:'出版社'},{k:'y',l:'出版时间',ph:'例如 2024.6'},{k:'isbn',l:'ISBN'},
 {k:'q',l:'简介摘句',type:'textarea',rows:2,ph:'从书的官方简介里摘一句原文'},{k:'src',l:'简介来源链接',ph:'豆瓣或出版社的页面'},{k:'srcn',l:'来源名',ph:'豆瓣'},{k:'my',l:'我想到',type:'textarea',rows:2,ph:'读的时候的一句话（可空）'},
 {k:'sk',l:'书脊样式',type:'select',opts:Object.entries(SKN)},{k:'c',l:'纯色书脊的颜色',type:'color'},{k:'cover',l:'封面照片（可选）',type:'file',ph:'拍一张自己手上的书；会压缩到 420px 宽再存'}];
const ACT={
 'card-add':async()=>{const r=await editDialog('新卡片',CARD_F,{k:'句子',d:todayStr().slice(5)});if(!r||r.action!=='ok')return;const no=CARDS.reduce((m,c)=>Math.max(m,c.no||0),0)+1;CARDS.unshift({...r.v,no});renderAll();contentSave()},
 'card-edit':async b=>{const c=CARDS.find(x=>String(x.no)===b.dataset.no);if(!c)return;const r=await editDialog(`编辑卡片 No.${c.no}`,CARD_F,c,{del:true});if(!r)return;if(r.action==='del')return ACT['card-del'](b);Object.assign(c,r.v);renderAll();contentSave()},
 'card-del':async b=>{const i=CARDS.findIndex(x=>String(x.no)===b.dataset.no);if(i<0||!confirm('删掉这张卡？'))return;CARDS.splice(i,1);renderAll();contentSave()},
 'book-add':async()=>{const r=await editDialog('加一本书',BOOK_F,{st:'reading',cat:'story',sk:'plain',c:'#5E6A55',srcn:'豆瓣'});if(!r||r.action!=='ok')return;const {cover,...v}=r.v;const id='b'+Date.now().toString(36);
  BOOKS.push({id,w:28+Math.round(Math.random()*10),h:180+Math.round(Math.random()*36),sf:13,sa:(v.a||'').slice(0,8),...v});if(cover)await coverSave(id,cover);renderAll();contentSave()},
 'book-edit':async b=>{const bk=bookById(b.dataset.id);if(!bk)return;const r=await editDialog(`编辑《${bk.t}》`,BOOK_F,{...bk,__img:COVERS[bk.id]},{del:true});if(!r)return;if(r.action==='del')return ACT['book-del'](b);
  const {cover,...v}=r.v;Object.assign(bk,v);if(!bk.sa||bk.sa===bk.a)bk.sa=(bk.a||'').slice(0,8);if(cover!==undefined)await coverSave(bk.id,cover);renderAll();contentSave()},
 'book-del':async b=>{const i=BOOKS.findIndex(x=>x.id===b.dataset.id);if(i<0||!confirm(`把《${BOOKS[i].t}》从书架上拿掉？`))return;const id=BOOKS[i].id;BOOKS.splice(i,1);if(COVERS[id])await coverSave(id,null);renderAll();contentSave()},
 'log-edit':async()=>{const r=await editDialog('编辑「最近」',[{k:'lines',l:'一行一条：日期 空格 内容',type:'textarea',rows:7,ph:'11.19 照片：新增 4 张'}],{lines:LOG.map(l=>l[0]+' '+l[1]).join('\n')});if(!r||r.action!=='ok')return;
  const L=r.v.lines.split('\n').map(x=>x.trim()).filter(Boolean).map(x=>{const m=x.match(/^(\S+)\s+(.+)$/);return m?[m[1],m[2],'']:[todayStr().slice(5),x,'']});LOG.splice(0,LOG.length,...L);renderAll();contentSave()},
 'qa-edit':async()=>{const F=[];QA.forEach((x,i)=>{F.push({k:'a'+i,l:x.l,type:'textarea',rows:3});if(x.id!=='else')F.push({k:'kw'+i,l:'↑ 什么时候用这条（关键词，逗号隔开）'})});
  const V={};QA.forEach((x,i)=>{V['a'+i]=x.a;V['kw'+i]=x.kw});const r=await editDialog('预设回答',F,V,{tip:'可以用：{reading} 在读的书、{done} 读过的几本、{doneN} 读过几本、{idea} 最新的念头、{papers} 论文、{email} 邮箱；[文字](#/shelf) 是站内链接。'});if(!r||r.action!=='ok')return;
  QA.forEach((x,i)=>{if(r.v['a'+i])x.a=r.v['a'+i];if(r.v['kw'+i]!==undefined&&x.id!=='else')x.kw=r.v['kw'+i]});contentSave()},
 'pass-reset':()=>{if(!confirm('清掉这台设备上的票，重新取一张？'))return;try{localStorage.removeItem('sw-pass-v1');localStorage.removeItem('sw-pass-prev')}catch(e){}PASS=null;
  const h=$('.hticket');h.classList.remove('guide');h.classList.add('still');passRender();setPST('idle');$('#pnote').textContent='';rcptRender(false);requestAnimationFrame(()=>requestAnimationFrame(()=>h.classList.remove('still')));note9('取票机复位了')}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-dev]');if(!b||!document.documentElement.classList.contains('dev'))return;e.preventDefault();e.stopPropagation();const f=ACT[b.dataset.dev];f&&f(b)},true);

/* 开发端 / 展示端：只有我自己能切；展示端和访客看到的一模一样 */
const DEV={on:false};
function applyDev(){const R=document.documentElement;R.classList.toggle('dev',DEV.on);$$('.devsw button').forEach(b=>b.setAttribute('aria-pressed',(b.dataset.v==='dev')===DEV.on));
 const a=$('.nav a.own');if(a)a.hidden=!DEV.on;safe('navmarks',navMarks);setTimeout(()=>dispatchEvent(new Event('resize')),60)}
async function devInit(){await dbReady;if(!(DB.owner||LOCALDEV))return;document.documentElement.classList.add('owner');
 const sw=document.createElement('div');sw.className='devsw';sw.setAttribute('role','group');sw.setAttribute('aria-label','切换视图（只有你看得到）');
 sw.innerHTML='<button type="button" data-v="show">展示端</button><button type="button" data-v="dev">开发端</button>';$('.menubar').append(sw);
 sw.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;DEV.on=b.dataset.v==='dev';lsSet('dev-on',DEV.on);applyDev()});
 const tk=$('.hticket');if(tk&&!$('.tkreset',tk)){const b=document.createElement('button');b.type='button';b.className='devbtn tkreset';b.dataset.dev='pass-reset';b.textContent='复位取票机（只清这台设备）';tk.append(b)}
 DEV.on=lsGet('dev-on',true)!==false;applyDev()}
safe('dev',devInit);

/* 首页文具角的贴纸页：用真正的贴纸画 */
safe('sheetArt',()=>{const sv=$('.hdiy .sheet svg');if(!sv)return;const pick=['star','pick','night','leaf'].map(k=>STK.find(s=>s.k===k)).filter(Boolean);
 const pos=[[6,6],[56,10],[8,66],[56,70]];sv.innerHTML=`<rect x="3" y="3" width="104" height="124" rx="4" fill="#FBFAF5" stroke="#DCD7CA"/><path d="M3 112h104" stroke="#E4DFD3" stroke-dasharray="3 3"/>`+
  pick.map((s,i)=>s.svg.replace('<svg ',`<svg x="${pos[i][0]}" y="${pos[i][1]}" width="48" height="48" `)).join('')});

/* 工牌：手机上点一下也能翻面（原来的拖动逻辑在窄屏上不接管） */
safe('badgeTap',()=>{const rig=$('#rig');if(!rig)return;rig.addEventListener('click',e=>{if(!matchMedia('(max-width:760px)').matches)return;rig.classList.toggle('flip')})});
