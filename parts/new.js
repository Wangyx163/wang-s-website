/* textures：拉丝铝、布面 */
safe('tex',()=>{const c=document.createElement('canvas');c.width=512;c.height=96;const g=c.getContext('2d');
 for(let y=0;y<96;y++){const v=Math.random();g.fillStyle=`rgba(${v>.5?255:0},${v>.5?255:0},${v>.5?255:0},${.025+Math.random()*.05})`;g.fillRect(0,y,512,1)}
 for(let k=0;k<70;k++){const y=Math.random()*96,x=Math.random()*512,w=60+Math.random()*260;g.fillStyle=`rgba(255,255,255,${.04+Math.random()*.08})`;g.fillRect(x,y,w,.6);g.fillRect(x-512,y,w,.6)}
 document.documentElement.style.setProperty('--brushed',`url(${c.toDataURL()})`);
 const d=document.createElement('canvas');d.width=d.height=48;const h=d.getContext('2d');
 for(let y=0;y<48;y+=2){h.fillStyle=`rgba(0,0,0,${.05+Math.random()*.05})`;h.fillRect(0,y,48,1)}
 for(let x=0;x<48;x+=2){h.fillStyle=`rgba(255,255,255,${.03+Math.random()*.04})`;h.fillRect(x,0,1,48)}
 for(let i=0;i<120;i++){h.fillStyle=`rgba(0,0,0,${Math.random()*.08})`;h.fillRect(Math.random()*48,Math.random()*48,1.5,1)}
 document.documentElement.style.setProperty('--cloth',`url(${d.toDataURL()})`)});

/* 导航：红蜡笔圈 */
function catmull(p){let d=`M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;for(let i=0;i<p.length-1;i++){const p0=p[i-1]||p[i],p1=p[i],p2=p[i+1],p3=p[i+2]||p2;
 const c1=[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6],c2=[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6];
 d+=`C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`}return d}
function navMarks(){$$('.nav a').forEach((a,k)=>{a.querySelectorAll('svg').forEach(s=>s.remove());const tx=a.querySelector('.tx');
 const tw=tx.offsetWidth,th=tx.offsetHeight,ox=tx.offsetLeft,oy=tx.offsetTop;let s=(k+3)*7919;const rnd=()=>{s=(s*9301+49297)%233280;return s/233280};
 const mb=document.documentElement.classList.contains('mob'),rx=tw/2+(mb?7:13),ry=th/2+(mb?6:8),cx=tw/2,cy=th/2;const pts=[];const st=-.55+rnd()*.25,turns=1.12,n=15;
 for(let i=0;i<=n;i++){const t=st-turns*2*Math.PI*i/n;const j=1+(rnd()-.5)*.09,grow=1+.07*i/n;pts.push([cx+Math.cos(t)*rx*j*grow,cy+Math.sin(t)*ry*j*grow+(i/n)*2.5])}
 const pad=24,W=tw+pad*2,H=th+pad*2;const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('viewBox',`${-pad} ${-pad} ${W} ${H}`);svg.setAttribute('width',W);svg.setAttribute('height',H);svg.setAttribute('aria-hidden','true');svg.style.left=ox-pad+'px';svg.style.top=oy-pad+'px';
 const wob=[0,th+5,tw*.35,th+7.5,tw*.7,th+5.5,tw,th+7];
 svg.innerHTML=`<path class="ul" d="M${wob[0]} ${wob[1]}C${wob[2]} ${wob[3]} ${wob[4]} ${wob[5]} ${wob[6]} ${wob[7]}"/><path class="loop" d="${catmull(pts)}"/>`;a.appendChild(svg);
 svg.querySelectorAll('path').forEach(p=>p.style.setProperty('--len',Math.ceil(p.getTotalLength())+1))})}
safe('nav',()=>{navMarks();document.fonts&&document.fonts.ready.then(navMarks)});

/* ── 磁带：几何单位 0.1mm，盒子 100.4 × 63.8mm ── */
const HUB={L:[289.5,296],R:[714.5,296]};
const RH=110,RX=255,A2=RX*RX-RH*RH,THK=.18,VT=476;      // 轴心半径 11mm，满带 25.5mm，带厚 18µm，带速 47.6mm/s
const TSIDE=Math.PI*A2/THK/VT;                          // 一面的时长（秒）
const radii=p=>({L:Math.sqrt(RX*RX-p*A2),R:Math.sqrt(RH*RH+p*A2)});
function hubSVG(id,c){return `<g id="${id}" transform="translate(${c[0]} ${c[1]})">
 <circle r="110" fill="#E8E5DD"/><circle r="104" fill="none" stroke="#CFCBC1" stroke-width="2"/><circle r="64" fill="none" stroke="#D6D2C8" stroke-width="4"/>
 <circle r="38" fill="#0F100F"/>${[0,60,120,180,240,300].map(a=>`<rect x="-4.5" y="-40" width="9" height="14" rx="1.5" fill="#E8E5DD" transform="rotate(${a})"/>`).join('')}
 ${[30,150,270].map(a=>`<circle cx="${(52*Math.cos(a*Math.PI/180)).toFixed(1)}" cy="${(52*Math.sin(a*Math.PI/180)).toFixed(1)}" r="5.5" fill="#B4AFA4"/>`).join('')}
 <path d="M-30 -52A60 60 0 0 1 30 -52" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/></g>`}
function packSVG(id,c){return `<g id="${id}"><circle cx="${c[0]}" cy="${c[1]}" r="200" fill="url(#packG)"/><circle cx="${c[0]}" cy="${c[1]}" r="180" fill="none" stroke="#fff" stroke-opacity=".045" stroke-width="2"/><circle cx="${c[0]}" cy="${c[1]}" r="150" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="1.5"/><circle cx="${c[0]}" cy="${c[1]}" r="200" fill="none" stroke="#6E513B" stroke-width="2"/></g>`}
function cassetteSVG(side='A'){const B=side==='B';
 const WIN='M289.5 226H714.5A70 70 0 0 1 714.5 366H289.5A70 70 0 0 1 289.5 226Z';
 const HOLE='M289.5 218H714.5A78 78 0 0 1 714.5 374H289.5A78 78 0 0 1 289.5 218Z';
 const LBL='M82 28H922A12 12 0 0 1 934 40V446A12 12 0 0 1 922 458H82A12 12 0 0 1 70 446V40A12 12 0 0 1 82 28Z';
 const screw=(x,y)=>`<g transform="translate(${x} ${y})"><circle r="17" fill="url(#screwG)"/><circle r="17" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="1.5"/><path d="M-9 0H9M0 -9V9" stroke="#3B3D3B" stroke-width="3.2" stroke-linecap="round" transform="rotate(${(x*7+y)%60})"/></g>`;
 return `<svg viewBox="0 0 1004 638" role="img" aria-hidden="true">
 <defs>
  <linearGradient id="shellG" x1="0" y1="0" x2=".25" y2="1"><stop offset="0" stop-color="#3D403E"/><stop offset=".5" stop-color="#2B2D2C"/><stop offset="1" stop-color="#222423"/></linearGradient>
  <linearGradient id="trapG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#363937"/><stop offset="1" stop-color="#2A2C2B"/></linearGradient>
  <radialGradient id="packG" cx=".5" cy=".5" r=".5"><stop offset=".42" stop-color="#5E4433"/><stop offset=".75" stop-color="#47331F"/><stop offset="1" stop-color="#3A2919"/></radialGradient>
  <radialGradient id="screwG" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#E4E2DC"/><stop offset=".5" stop-color="#A9A69E"/><stop offset="1" stop-color="#5E5C57"/></radialGradient>
  <linearGradient id="glassG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".38" stop-color="#fff" stop-opacity=".04"/><stop offset=".39" stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#fff" stop-opacity="0"/><stop offset=".71" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#fff" stop-opacity=".02"/></linearGradient>
  <linearGradient id="glossG" x1="0" y1="0" x2="1" y2=".4"><stop offset="0" stop-color="#fff" stop-opacity=".09"/><stop offset=".45" stop-color="#fff" stop-opacity=".02"/><stop offset=".46" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <clipPath id="winC"><path d="${WIN}"/></clipPath>
  <clipPath id="lblC"><path d="${LBL}"/></clipPath>
  <clipPath id="openC"><rect x="214" y="604" width="86" height="40" rx="4"/><rect x="352" y="604" width="78" height="40" rx="4"/><rect x="456" y="604" width="92" height="40" rx="4"/><rect x="574" y="604" width="78" height="40" rx="4"/><rect x="704" y="604" width="86" height="40" rx="4"/></clipPath>
  <filter id="grainF" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .32  0 0 0 0 .27  0 0 0 0 .2  0 0 0 .22 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
 </defs>
 <rect width="1004" height="638" rx="34" fill="url(#shellG)"/>
 <rect x="1.5" y="1.5" width="1001" height="635" rx="33" fill="none" stroke="#fff" stroke-opacity=".13" stroke-width="3"/><rect x="7" y="7" width="990" height="624" rx="28" fill="none" stroke="#fff" stroke-opacity=".07" stroke-width="2"/>
 <path d="M150 478H854L816 638H188Z" fill="url(#trapG)"/>
 <path d="M150 478.5H854" stroke="#fff" stroke-opacity=".1" stroke-width="2"/>
 <path d="M150 478L188 638M854 478L816 638" stroke="#000" stroke-opacity=".35" stroke-width="2"/>
 <g clip-path="url(#openC)"><rect x="200" y="600" width="604" height="40" fill="#0C0D0C"/>
  <circle cx="234" cy="618" r="11" fill="#DCD8CE"/><circle cx="770" cy="618" r="11" fill="#DCD8CE"/>
  <rect x="200" y="621" width="604" height="9" fill="#4B3526"/><rect x="200" y="621" width="604" height="2" fill="#6A4C37"/>
  <rect x="470" y="606" width="64" height="4" fill="#A19C91"/><rect x="487" y="609" width="30" height="11" rx="1" fill="#CFC1A2"/></g>
 <circle cx="332" cy="566" r="15" fill="#121312"/><circle cx="672" cy="566" r="15" fill="#121312"/>
 <circle cx="332" cy="566" r="15" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="2"/><circle cx="672" cy="566" r="15" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="2"/>
 ${screw(502,530)}${screw(40,40)}${screw(964,40)}${screw(46,590)}${screw(958,590)}
 <g clip-path="url(#winC)"><rect x="200" y="210" width="604" height="170" fill="#0E100F"/>
  ${packSVG('packL',HUB.L)}${packSVG('packR',HUB.R)}${hubSVG('hubL',HUB.L)}${hubSVG('hubR',HUB.R)}</g>
 <path d="${LBL}${HOLE}" fill="#F1EBDC" fill-rule="evenodd"/>
 <path d="${LBL}${HOLE}" fill="#fff" fill-rule="evenodd" filter="url(#grainF)"/>
 <g clip-path="url(#lblC)"><rect x="70" y="392" width="864" height="70" fill="#5E6A55"/><rect x="70" y="392" width="864" height="2" fill="#000" fill-opacity=".12"/></g>
 <path d="${LBL}${HOLE}" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="1.5" fill-rule="evenodd"/>
 <rect x="96" y="54" width="74" height="94" rx="5" fill="none" stroke="#2B2E2A" stroke-width="3.4"/>
 <text x="133" y="131" text-anchor="middle" font-family="Oswald, sans-serif" font-weight="600" font-size="76" fill="#2B2E2A">${B?'B':'A'}</text>
 <line x1="198" y1="148" x2="906" y2="148" stroke="#93A6AF" stroke-opacity=".6" stroke-width="2"/>
 <line x1="198" y1="202" x2="906" y2="202" stroke="#93A6AF" stroke-opacity=".6" stroke-width="2"/>
 <text x="204" y="134" font-family="${B?'Long Cang, cursive':'Caveat, cursive'}" font-weight="${B?400:700}" font-size="${B?74:78}" fill="#262925">${B?'问我':'Warm Place'}</text>
 <text x="208" y="192" font-family="Caveat, cursive" font-weight="700" font-size="46" fill="#3D423D">${B?'':'AMatroskin'}</text>
 <text x="906" y="92" text-anchor="end" font-family="Oswald, sans-serif" font-weight="500" font-size="38" letter-spacing="3" fill="#5E6A55">C60</text>
 <text x="141" y="288" text-anchor="middle" font-family="Oswald, sans-serif" font-weight="500" font-size="20" letter-spacing="3" fill="#2B2E2A">NORMAL</text>
 <text x="141" y="314" text-anchor="middle" font-family="Oswald, sans-serif" font-weight="500" font-size="20" letter-spacing="3" fill="#2B2E2A">POSITION</text>
 <text x="863" y="314" text-anchor="middle" font-family="Oswald, sans-serif" font-weight="500" font-size="34" letter-spacing="2" fill="#2B2E2A">TYPE I</text>
 <text x="100" y="438" font-family="Homemade Apple, cursive" font-size="29" fill="#EEE8D8">Star</text><path transform="translate(186 410) scale(1.05)" d="M12.3 2.4l2.6 6.2 6.6.5-5.1 4.3 1.6 6.5-5.7-3.6-5.6 3.7 1.6-6.5-5.1-4.2 6.6-.6z" fill="#E9B949" stroke="#EEE8D8" stroke-width="1.2" stroke-linejoin="round"/><text x="218" y="438" font-family="Homemade Apple, cursive" font-size="29" fill="#EEE8D8">Wang</text>
 <text x="906" y="434" text-anchor="end" font-family="Oswald, sans-serif" font-weight="500" font-size="22" letter-spacing="4" fill="#EEE8D8">${B?'SIDE B   ASK ME':'SIDE A   4:35'}</text>
 <path d="${WIN}" fill="url(#glassG)"/>
 <path d="${WIN}" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="3"/>
 <path d="M290 229.5H714" stroke="#fff" stroke-opacity=".18" stroke-width="2"/>
 <path d="M34 0H360L120 638H34A34 34 0 0 1 0 604V34A34 34 0 0 1 34 0Z" fill="url(#glossG)" pointer-events="none"/>
</svg>`}

/* ── VU 表：刻度按 VU 标准（电压线性，0 VU = 100%），−3 正好在中间 ── */
const VUT=42,VUC=[150,255],VUR=180;
const vuAng=v=>-VUT+2*VUT*v/1.413;
const pol=(a,r)=>[VUC[0]+r*Math.sin(a*Math.PI/180),VUC[1]-r*Math.cos(a*Math.PI/180)];
function meterSVG(ch){
 const dB=[[-20,'20'],[-10,'10'],[-7,'7'],[-5,'5'],[-3,'3'],[-2,'2'],[-1,'1'],[0,'0'],[1,'1'],[2,'2'],[3,'3']];
 const minor=[-15,-8,-6,-4,-2.5,-1.5,-.5,.5,1.5,2.5];
 const V=d=>Math.pow(10,d/20);
 const arc=(a0,a1,r)=>{const p0=pol(a0,r),p1=pol(a1,r);return `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}A${r} ${r} 0 0 1 ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`};
 const tick=(a,r0,r1,col,w)=>{const p=pol(a,r0),q=pol(a,r1);return `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" stroke="${col}" stroke-width="${w}"/>`};
 const a0=vuAng(V(0));
 return `<defs>
  <radialGradient id="lamp${ch}" cx=".5" cy="1.1" r=".95"><stop offset="0" stop-color="#FFD98C" stop-opacity=".95"/><stop offset=".55" stop-color="#F6E3B4" stop-opacity=".5"/><stop offset="1" stop-color="#EFE6CC" stop-opacity="0"/></radialGradient>
  <linearGradient id="gl${ch}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset=".42" stop-color="#fff" stop-opacity=".06"/><stop offset=".43" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <filter id="nb${ch}" x="-50%" y="-10%" width="200%" height="120%"><feGaussianBlur stdDeviation="2.2"/></filter>
 </defs>
 <rect width="300" height="180" fill="#EBE1C4"/><rect width="300" height="180" fill="url(#lamp${ch})" class="lamp"/>
 <path d="${arc(-VUT,a0,VUR)}" fill="none" stroke="#2A2620" stroke-width="1.6"/>
 <path d="${arc(a0,VUT,VUR+4)}" fill="none" stroke="#B5402A" stroke-width="8"/>
 ${dB.map(([d])=>tick(vuAng(V(d)),VUR,VUR+(d>=0?16:13),d>0?'#B5402A':'#2A2620',2.2)).join('')}
 ${minor.map(d=>tick(vuAng(V(d)),VUR,VUR+7,d>0?'#B5402A':'#2A2620',1.4)).join('')}
 ${dB.map(([d,l])=>{const p=pol(vuAng(V(d)),VUR+30);return `<text x="${p[0].toFixed(1)}" y="${(p[1]+5).toFixed(1)}" text-anchor="middle" font-family="Oswald, sans-serif" font-weight="500" font-size="15" fill="${d>0?'#B5402A':'#2A2620'}">${l}</text>`}).join('')}
 ${(()=>{const p=pol(-VUT+3,VUR-12),q=pol(VUT-3,VUR-12);return `<text x="${p[0].toFixed(1)}" y="${(p[1]+12).toFixed(1)}" text-anchor="middle" font-family="Oswald, sans-serif" font-size="20" fill="#2A2620">−</text><text x="${q[0].toFixed(1)}" y="${(q[1]+12).toFixed(1)}" text-anchor="middle" font-family="Oswald, sans-serif" font-size="20" fill="#B5402A">+</text>`})()}
 <path d="${arc(-VUT,VUT,VUR-24)}" fill="none" stroke="#2A2620" stroke-opacity=".55" stroke-width="1"/>
 ${[0,.2,.4,.6,.8,1].map(v=>tick(vuAng(v),VUR-24,VUR-31,'#2A2620',1)).join('')}
 ${[[0,'0'],[.5,'50'],[1,'100']].map(([v,l])=>{const p=pol(vuAng(v),VUR-42);return `<text x="${p[0].toFixed(1)}" y="${(p[1]+3).toFixed(1)}" text-anchor="middle" font-family="Oswald, sans-serif" font-size="9.5" fill="#2A2620" fill-opacity=".7">${l}</text>`}).join('')}
 <text x="150" y="150" text-anchor="middle" font-family="Oswald, sans-serif" font-weight="600" font-size="28" letter-spacing="1" fill="#2A2620">VU</text>
 <text x="26" y="168" font-family="Oswald, sans-serif" font-weight="500" font-size="13" fill="#2A2620" fill-opacity=".75">${ch}</text>
 <circle id="pk${ch}" cx="272" cy="160" r="5" fill="#6B2E22"/>
 <g id="ns${ch}" transform="translate(4 7) rotate(${-VUT-3} ${VUC[0]} ${VUC[1]})" opacity=".22" filter="url(#nb${ch})"><line x1="150" y1="255" x2="150" y2="66" stroke="#2A2620" stroke-width="2.4"/></g>
 <g id="nd${ch}" transform="rotate(${-VUT-3} ${VUC[0]} ${VUC[1]})"><line x1="150" y1="255" x2="150" y2="64" stroke="#181713" stroke-width="2"/><line x1="150" y1="92" x2="150" y2="64" stroke="#181713" stroke-width="1.2"/></g>
 <circle cx="150" cy="255" r="90" fill="#1C1D1B"/><path d="M78 201A90 90 0 0 1 222 201" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>
 <rect width="300" height="180" fill="url(#gl${ch})"/>
 <rect x="1" y="1" width="298" height="178" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="2"/>`}

/* ── 声音：用 Karplus–Strong 拨弦合成一段 8 小节的指弹，过一遍「磁带」：抖晃、饱和、高频滚降、底噪 ── */
const AU={ctx:null,ready:false,src:null,stereo:null,ref:.1,an:[],buf:null};
function renderGuitar(sr){
 const bpm=72,e=60/bpm/2,bar=8*e;
 const BARS=[{b:[43,50],u:[59,62,66]},{b:[40,47],u:[55,59,62]},{b:[48,43],u:[55,59,64]},{b:[50,45],u:[54,57,62]},
             {b:[43,50],u:[59,62,67]},{b:[40,47],u:[55,59,64]},{b:[48,43],u:[55,60,64]},{b:[50,45],u:[54,57,64]}];
 const total=BARS.length*bar,N=Math.round(total*sr);const L=new Float32Array(N),R=new Float32Array(N);
 let seed=11;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
 const notes=[];
 BARS.forEach((b,bi)=>{const t0=bi*bar;
  for(let q=0;q<4;q++)notes.push({t:t0+q*2*e,m:b.b[q%2],v:q===0?.95:.72,pan:-.22,len:2*e*2.2});
  [[1,1],[3,0],[5,2],[7,1]].forEach(([ei,ui])=>notes.push({t:t0+ei*e,m:b.u[ui],v:.5+rnd()*.12,pan:ui===2?.28:ui===1?.12:-.02,len:3.2}));
  notes.push({t:t0,m:b.u[2]+(bi%4===3?2:0),v:.62,pan:.3,len:3.4});
  if(bi%2===1)notes.push({t:t0+6.5*e,m:b.u[2]+5,v:.36,pan:.34,len:2.4})});
 notes.forEach(n=>{const f=440*Math.pow(2,(n.m-69)/12);const d=sr/f-.5,Ni=Math.floor(d),fr=d-Ni,C=(1-fr)/(1+fr);
  const line=new Float32Array(Ni);let pr=0;const bright=.28+.42*n.v;for(let i=0;i<Ni;i++){pr+=((rnd()*2-1)-pr)*bright;line[i]=pr}
  let mean=0;for(let i=0;i<Ni;i++)mean+=line[i];mean/=Ni;for(let i=0;i<Ni;i++)line[i]-=mean;
  const dec=n.m<52?.9968:n.m<62?.9962:.9955;const st=Math.round((n.t+(rnd()-.5)*.014)*sr);const len=Math.round(n.len*sr);const fade=Math.round(.06*sr);
  const gl=Math.cos((n.pan+1)*Math.PI/4)*n.v,gr=Math.sin((n.pan+1)*Math.PI/4)*n.v;let idx=0,x1=0,y1=0;
  for(let i=0;i<len;i++){const o=line[idx];const avg=.5*(o+line[(idx+1)%Ni])*dec;const ap=C*avg+x1-C*y1;x1=avg;y1=ap;line[idx]=ap;idx=(idx+1)%Ni;
   const env=(i<48?i/48:1)*(i>len-fade?(len-i)/fade:1);const k=(st+i)%N;L[k]+=o*gl*env;R[k]+=o*gr*env}});
 let pk=0,ss=0;for(let i=0;i<N;i++){pk=Math.max(pk,Math.abs(L[i]),Math.abs(R[i]));ss+=L[i]*L[i]+R[i]*R[i]}
 const g=.62/pk;for(let i=0;i<N;i++){L[i]*=g;R[i]*=g}
 return {L,R,N,rms:Math.sqrt(ss/(2*N))*g}}
function auInit(){if(AU.ctx)return AU.ctx;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
 try{const ctx=new AC();AU.ctx=ctx;const sr=ctx.sampleRate;
  const g=AU.pre||renderGuitar(44100);const buf=ctx.createBuffer(2,g.N,44100);buf.copyToChannel(g.L,0);buf.copyToChannel(g.R,1);AU.buf=buf;
  const nz=ctx.createBuffer(1,sr*2,sr);const nd=nz.getChannelData(0);let b0=0,b1=0,b2=0;for(let i=0;i<nd.length;i++){const w=Math.random()*2-1;b0=.997*b0+w*.03;b1=.985*b1+w*.03;b2=.95*b2+w*.05;nd[i]=(b0+b1+b2+w*.1)*.6}AU.noise=nz;
  const bf=(t,f,q,gn)=>{const n=ctx.createBiquadFilter();n.type=t;n.frequency.value=f;if(q!=null)n.Q.value=q;if(gn!=null)n.gain.value=gn;return n};
  const input=ctx.createGain();const hp=bf('highpass',70,.7),body=bf('peaking',190,1.1,3),pres=bf('peaking',2600,.9,-2),lp=bf('lowpass',6800,.6);
  const sh=ctx.createWaveShaper();const cv=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/511.5-1;cv[i]=Math.tanh(1.5*x)/Math.tanh(1.5)}sh.curve=cv;
  const mg=ctx.createGain();mg.gain.value=0;AU.mg=mg;
  const bus=ctx.createGain();const master=ctx.createGain();master.gain.value=.5;AU.master=master;
  input.connect(hp).connect(body).connect(pres).connect(lp).connect(sh).connect(mg).connect(bus);
  const conv=ctx.createConvolver();const ir=ctx.createBuffer(2,Math.round(sr*.9),sr);for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3.2)}conv.buffer=ir;
  const wet=ctx.createGain();wet.gain.value=.1;mg.connect(conv).connect(wet).connect(bus);
  const hz=ctx.createBufferSource();hz.buffer=nz;hz.loop=true;const hzf=bf('highpass',2600,.7);const hg=ctx.createGain();hg.gain.value=0;AU.hg=hg;hz.connect(hzf).connect(hg).connect(bus);hz.start();
  const mt=ctx.createBufferSource();mt.buffer=nz;mt.loop=true;const mtf=bf('bandpass',420,1.6);const mtg=ctx.createGain();mtg.gain.value=0;AU.mtg=mtg;mt.connect(mtf).connect(mtg).connect(bus);mt.start();
  bus.connect(master).connect(ctx.destination);
  const sp=ctx.createChannelSplitter(2);bus.connect(sp);AU.an=[0,1].map(c=>{const a=ctx.createAnalyser();a.fftSize=2048;sp.connect(a,c);return a});AU.td=new Float32Array(2048);
  const wow=ctx.createOscillator();wow.frequency.value=.55;const wg=ctx.createGain();wg.gain.value=.0032;wow.connect(wg);wow.start();
  const flu=ctx.createOscillator();flu.frequency.value=6.8;const fg=ctx.createGain();fg.gain.value=.0011;flu.connect(fg);flu.start();AU.mods=[wg,fg];
  AU.input=input;AU.ref=g.rms/.3;AU.ready=true;auFile(ctx,input);return ctx}catch(err){console.error('audio',err);AU.ctx=null;return null}}
/* A 面：Warm Place — AMatroskin。歌放在磁带开头（留 3 秒导带），磁带位置就是播放位置：
   播放时以音频时钟为准推动磁带，快进、倒带后再播，从磁带所在的位置接着放；放完自动停，再按 PLAY 会先倒回开头。 */
const A_SIDE_SRC='audio/warm-place.mp3',A_LEN=275.6,P0=3*VT*THK/(Math.PI*A2),A_RMS=.257;
const songAt=()=>(TP.p-P0)*TSIDE;
function auFile(ctx,input){if(!A_SIDE_SRC)return;try{const el=new Audio();el.preload='auto';el.src=A_SIDE_SRC;
  /* 整首取回来换成本地地址：这样不管服务器支不支持分段请求，都能随意跳到磁带所在的位置 */
  fetch(A_SIDE_SRC).then(r=>r.ok?r.blob():null).then(b=>{if(!b)return;const u=URL.createObjectURL(b);const swap=()=>{const t=el.currentTime;el.src=u;try{el.currentTime=t}catch(e){}};if(el.paused)swap();else el.addEventListener('pause',swap,{once:true})}).catch(()=>{});
  const ms=ctx.createMediaElementSource(el);ms.connect(input);AU.el=el;AU.file=true;AU.ref=A_RMS/.3;
  el.addEventListener('ended',()=>{if(TP.mode==='play'){TP.p=P0+A_LEN/TSIDE;clunk(false);tapeSet('stop')}});
  el.addEventListener('error',()=>{AU.file=false;AU.el=null;AU.ref=(AU.pre||{rms:.2}).rms/.3})}catch(e){AU.file=false}}
function auStart(){if(!AU.ready)return;const ctx=AU.ctx;ctx.resume();const now=ctx.currentTime;
 if(AU.file&&AU.el){if(TP.p<P0)TP.p=P0;const el=AU.el;clearTimeout(AU.pz);el.currentTime=clamp(songAt(),0,A_LEN-.05);const pr=el.play();pr&&pr.catch(()=>{});AU.src='el';
  AU.mg.gain.cancelScheduledValues(now);AU.mg.gain.setValueAtTime(AU.mg.gain.value,now);AU.mg.gain.linearRampToValueAtTime(1,now+.12);
  AU.hg.gain.cancelScheduledValues(now);AU.hg.gain.setTargetAtTime(.012,now,.05);return}
 const s=ctx.createBufferSource();s.buffer=AU.buf;s.loop=true;s.playbackRate.setValueAtTime(.5,now);s.playbackRate.linearRampToValueAtTime(1,now+.16);
 AU.mods.forEach(m=>m.connect(s.playbackRate));s.connect(AU.input);s.start(now+.02,(TP.p*TSIDE)%AU.buf.duration);AU.src=s;
 AU.mg.gain.cancelScheduledValues(now);AU.mg.gain.setValueAtTime(AU.mg.gain.value,now);AU.mg.gain.linearRampToValueAtTime(1,now+.1);
 AU.hg.gain.cancelScheduledValues(now);AU.hg.gain.setTargetAtTime(.012,now,.05)}
function auHalt(){if(!AU.ready||!AU.src)return;const ctx=AU.ctx,now=ctx.currentTime,s=AU.src;AU.src=null;
 AU.mg.gain.cancelScheduledValues(now);AU.mg.gain.setValueAtTime(AU.mg.gain.value,now);AU.mg.gain.linearRampToValueAtTime(0,now+.12);AU.hg.gain.setTargetAtTime(0,now,.04);
 if(s==='el'){const el=AU.el;AU.pz=setTimeout(()=>{if(AU.src!=='el')el&&el.pause()},140);return}
 s.playbackRate.cancelScheduledValues(now);s.playbackRate.setValueAtTime(s.playbackRate.value,now);s.playbackRate.linearRampToValueAtTime(.3,now+.18);
 s.stop(now+.26);setTimeout(()=>{try{AU.mods.forEach(m=>m.disconnect(s.playbackRate))}catch(e){}},400)}
function auMotor(on){if(!AU.ready)return;AU.mtg.gain.setTargetAtTime(on?.05:0,AU.ctx.currentTime,on?.12:.05)}
function clunk(strong){if(!AU.ready)return;const ctx=AU.ctx,now=ctx.currentTime;
 const n=ctx.createBufferSource();n.buffer=AU.noise;const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=2200;bp.Q.value=1.1;
 const g=ctx.createGain();g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(strong?.5:.32,now+.002);g.gain.exponentialRampToValueAtTime(.0001,now+.045);
 n.connect(bp).connect(g).connect(AU.master);n.start(now,Math.random());n.stop(now+.07);
 const o=ctx.createOscillator();o.frequency.setValueAtTime(150,now);o.frequency.exponentialRampToValueAtTime(55,now+.07);
 const og=ctx.createGain();og.gain.setValueAtTime(.0001,now);og.gain.exponentialRampToValueAtTime(strong?.55:.35,now+.004);og.gain.exponentialRampToValueAtTime(.0001,now+.09);
 o.connect(og).connect(AU.master);o.start(now);o.stop(now+.12)}

/* ── 走带 ── */
const TP={p:3*476*.18/(Math.PI*(255*255-110*110)),mode:'stop',vel:0,rot:{L:0,R:0},n0:0,last:0,raf:null,M:{L:{x:0,v:0,pk:0},R:{x:0,v:0,pk:0}},sim:0};
function tapeSet(mode){const was=TP.mode;if(mode===was&&mode!=='stop')mode='stop';
 if(mode==='play'&&AU.file&&songAt()>=A_LEN-.4){TP.auto=true;mode='rew'}
 if(mode==='play'&&TP.p>=1)mode='stop';if(mode==='ff'&&TP.p>=1)mode='stop';if(mode==='rew'&&TP.p<=0)mode='stop';
 TP.mode=mode;
 if(was==='play'&&mode!=='play')auHalt();if(mode==='play'&&was!=='play'&&!TP.voice)auStart();
 auMotor(mode==='ff'||mode==='rew');
 $('#kPlay').setAttribute('aria-pressed',mode==='play');$('#kFf').setAttribute('aria-pressed',mode==='ff');$('#kRew').setAttribute('aria-pressed',mode==='rew');
 $('#led').classList.toggle('on',mode==='play');$('#cassette').setAttribute('aria-label',mode==='play'?'磁带：正在播放，点一下停止':'磁带：点一下播放');
 if(mode==='play')$('#note').classList.add('gone');
 if(!TP.raf){TP.last=performance.now();TP.raf=requestAnimationFrame(tapeTick)}}
function press(mode){auInit();clunk(mode!=='stop');tapeSet(mode)}
function rmsOf(a){a.getFloatTimeDomainData(AU.td);let s=0;for(let i=0;i<AU.td.length;i++)s+=AU.td[i]*AU.td[i];return Math.sqrt(s/AU.td.length)}
function tapeTick(t){const dt=Math.min(.05,(t-TP.last)/1000);TP.last=t;
 const target=TP.mode==='play'?VT:TP.mode==='ff'?VT*24:TP.mode==='rew'?-VT*(TP.auto?64:24):0;
 const tau=TP.mode==='play'?.06:TP.mode==='stop'?.07:.35;TP.vel+=(target-TP.vel)*(1-Math.exp(-dt/tau));
 if(Math.abs(TP.vel)<.5&&target===0)TP.vel=0;
 TP.p=clamp(TP.p+TP.vel*dt*THK/(Math.PI*A2),0,1);
 /* 播放时以音频为准：磁带走到哪，就是歌放到哪 */
 if(TP.mode==='play'&&AU.file&&AU.el&&AU.src==='el'&&!AU.el.paused)TP.p=P0+AU.el.currentTime/TSIDE;
 if(TP.auto&&TP.mode==='rew'&&TP.p<=P0){TP.auto=false;TP.p=P0;TP.vel=0;tapeSet('play')}
 if(TP.auto&&TP.mode!=='rew')TP.auto=false;
 const r=radii(TP.p);TP.rot.L-=TP.vel/r.L*dt*180/Math.PI;TP.rot.R-=TP.vel/r.R*dt*180/Math.PI;
 if((TP.p>=1&&TP.vel>0)||(TP.p<=0&&TP.vel<0)){TP.vel=0;if(TP.mode!=='stop'){clunk(false);tapeSet('stop')}}
 /* 电平：有声音就读真实 RMS，没有就用一条模拟包络 */
 let tL=0,tR=0;if(TP.mode==='play'&&TP.vel>VT*.5){if(AU.ready&&AU.src&&!TP.voice){tL=rmsOf(AU.an[0])/AU.ref;tR=rmsOf(AU.an[1])/AU.ref}else{TP.sim+=dt;const b=.5+.28*Math.sin(TP.sim*5.2)*Math.sin(TP.sim*1.3)+Math.random()*.18;tL=b;tR=b*(.9+Math.random()*.15)}}
 const wn=15,z=.78;let busy=TP.vel!==0;
 [['L',tL],['R',tR]].forEach(([c,tg])=>{const m=TP.M[c];const a=wn*wn*(Math.min(tg,1.6)-m.x)-2*z*wn*m.v;m.v+=a*dt;m.x+=m.v*dt;if(m.x<-.03){m.x=-.03;m.v=0}if(m.x>1.5){m.x=1.5;m.v=0}
  if(tg>1.12)m.pk=t;if(Math.abs(m.v)>.002||m.x>.002)busy=true});
 tapeDraw(t);if(busy||TP.mode!=='stop')TP.raf=requestAnimationFrame(tapeTick);else TP.raf=null}
function tapeDraw(t){const r=radii(TP.p);
 [['L',r.L],['R',r.R]].forEach(([c,rr])=>{const g=document.getElementById('pack'+c);if(g)g.querySelectorAll('circle').forEach((ci,k)=>ci.setAttribute('r',(rr*[1,.92,.8,1][k]).toFixed(1)));
  const h=document.getElementById('hub'+c);h&&h.setAttribute('transform',`translate(${HUB[c][0]} ${HUB[c][1]}) rotate(${TP.rot[c].toFixed(2)})`);
  const m=TP.M[c];const a=clamp(vuAng(m.x),-VUT-3,VUT+4);document.getElementById('nd'+c).setAttribute('transform',`rotate(${a.toFixed(2)} ${VUC[0]} ${VUC[1]})`);
  document.getElementById('ns'+c).setAttribute('transform',`translate(4 7) rotate(${a.toFixed(2)} ${VUC[0]} ${VUC[1]})`);
  document.getElementById('pk'+c).setAttribute('fill',t&&t-m.pk<140?'#FF5A3C':'#6B2E22')});
 const n=((r.R-RH)/THK-TP.n0+1000)%1000;const ds=$$('#counter .drum i');
 const u0=n%10,u=Math.floor(u0)+clamp((u0%1-.78)/.22,0,1),c=u>9?u-9:0,tn=Math.floor(n/10)%10,hn=Math.floor(n/100)%10;
 ds[2].style.transform=`translateY(${(-u*26).toFixed(1)}px)`;ds[1].style.transform=`translateY(${(-(tn+c)*26).toFixed(1)}px)`;ds[0].style.transform=`translateY(${(-(hn+(tn===9?c:0))*26).toFixed(1)}px)`;
 $('#counter').setAttribute('aria-label','计数器 '+String(Math.floor(n)).padStart(3,'0'))}
safe('tape',()=>{const pre=()=>{if(!AU.pre&&!AU.ctx)AU.pre=renderGuitar(44100)};(window.requestIdleCallback||(f=>setTimeout(f,1200)))(pre,{timeout:4000});
 $('#cassette').innerHTML=cassetteSVG();$('#vuL').innerHTML=meterSVG('L');$('#vuR').innerHTML=meterSVG('R');
 $$('#counter .drum i').forEach(d=>d.innerHTML=[0,1,2,3,4,5,6,7,8,9,0].map(x=>`<b style="font-weight:500;height:26px">${x}</b>`).join(''));
 $('#kPlay').onclick=()=>press('play');$('#kFf').onclick=()=>press('ff');$('#kRew').onclick=()=>press('rew');$('#kStop').onclick=()=>press('stop');
 $('#cassette').onclick=()=>press(TP.mode==='play'?'stop':'play');
 $('#rst').onclick=()=>{TP.n0=(radii(TP.p).R-RH)/THK;tapeDraw(0)};
 TP.n0=(radii(TP.p).R-RH)/THK;tapeDraw(0)});

