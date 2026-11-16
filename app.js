// Payout config (to 1). In production this lives on the server only.
const PAYOUT={small:1,big:1,odd:1,even:1,any3:30,triple:150,double:8,combo:5,
 total:{4:50,5:20,6:15,7:12,8:8,9:6,10:6,11:6,12:6,13:8,14:12,15:15,16:20,17:50}};
const CHIPS=[10,50,100,500];
let bal=5000,chip=50,bets={},phase='bet',left=15,round=1000,dice=[1,1,1];
const $=id=>document.getElementById(id);
const rnd=()=>{const a=new Uint32Array(1);let x;do{crypto.getRandomValues(a);x=a[0]}while(x>=4294967292);return x%6+1};
const fmt=n=>n.toLocaleString('en-IN');
const label=k=>({small:'Small',big:'Big',odd:'Odd',even:'Even',any3:'Any Triple'}[k]||(k[0]=='t'&&k[1]!='r'?'Total '+k.slice(1):k.slice(0,2)=='tr'?'Triple '+k[2]:k[0]=='d'?'Double '+k[1]:'Combo '+k[1]+'+'+k[2]));
function pips(v){const m={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]}[v];return Array.from({length:9},(_,i)=>`<i class="${m.includes(i)?'on':''}"></i>`).join('')}
function drawDice(cls=''){ $('dice').innerHTML=dice.map(v=>`<div class="die ${cls}">${pips(v)}</div>`).join('')}
function mult(k,d){const s=d[0]+d[1]+d[2],tri=d[0]==d[1]&&d[1]==d[2];
 if(k[0]=='s')return d.filter(x=>x==+k[1]).length;
 if(k=='any3')return tri?PAYOUT.any3:0;
 if(k[0]=='t'&&k[1]=='r')return tri&&d[0]==+k[2]?PAYOUT.triple:0;
 if(k=='small')return !tri&&s<=10?PAYOUT.small:0;
 if(k=='big')return !tri&&s>=11?PAYOUT.big:0;
 if(k=='odd')return !tri&&s%2?PAYOUT.odd:0;
 if(k=='even')return !tri&&s%2==0?PAYOUT.even:0;
 if(k[0]=='t')return s==+k.slice(1)?PAYOUT.total[s]:0;
 if(k[0]=='d'){const n=+k[1],c=d.filter(x=>x==n).length;return c>=2?PAYOUT.double:0}
 if(k[0]=='c'){const a=+k[1],b=+k[2];return d.includes(a)&&d.includes(b)?PAYOUT.combo:0}return 0}
const PIPS={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
const die=v=>`<svg class="pd" viewBox="0 0 20 20" aria-hidden="true"><rect width="20" height="20" rx="4" fill="#d7263d"/>${PIPS[v].map(k=>`<circle cx="${4.5+(k%3)*5.5}" cy="${4.5+Math.floor(k/3)*5.5}" r="1.9" fill="#fff"/>`).join('')}</svg>`;
const C=(k,inner,cls)=>`<button class="cell ${cls||''}" data-k="${k}">${inner}<span class="chip" hidden></span></button>`;
const NUM=['','One','Two','Three','Four','Five','Six'];
function build(){const P=PAYOUT,T=P.total,six=[1,2,3,4,5,6];
 let h=`<div class="bd"><div class="lbs"><div class="lb">1:1 lose if any triple</div><div class="lb">${P.any3}:1</div><div class="lb">1:1 lose if any triple</div></div>`;
 h+=`<div class="r5">${C('small','<b>SMALL</b><small>4 – 10</small>')}${C('odd','<b class="v">ODD</b>')}${C('any3','<b>ANY TRIPLE</b>')}${C('even','<b class="v">EVEN</b>')}${C('big','<b>BIG</b><small>11 – 17</small>')}</div>`;
 h+=`<div class="lb">${P.double}:1 each double</div><div class="rg" style="grid-template-columns:repeat(6,1fr)">${six.map(n=>C('d'+n,die(n)+die(n),'dr')).join('')}</div>`;
 h+=`<div class="lb">${P.triple}:1 each triple</div><div class="rg" style="grid-template-columns:repeat(6,1fr)">${six.map(n=>C('tr'+n,die(n)+die(n)+die(n),'tall')).join('')}</div>`;
 for(const [a,b] of [[4,10],[11,17]]){h+=`<div class="rg" style="grid-template-columns:repeat(7,1fr)">`;for(let n=a;n<=b;n++)h+=C('t'+n,`<b>${n}</b><small>${T[n]}:1</small>`);h+='</div>'}
 let cb='';for(let a=1;a<=6;a++)for(let b=a+1;b<=6;b++)cb+=C('c'+a+b,die(a)+die(b),'dr');
 h+=`<div class="lb">${P.combo}:1 two dice</div><div class="rg" style="grid-template-columns:repeat(5,1fr)">${cb}</div>`;
 h+=`<div class="lb">1:1 on single · 2:1 on double · 3:1 on triple</div><div class="rg" style="grid-template-columns:repeat(3,1fr)">${six.map(n=>C('s'+n,NUM[n].toUpperCase()+die(n),'dr sp')).join('')}</div></div>`;
 $('board').innerHTML=h;
 $('chips').innerHTML=`<button data-act="undo">↶ Undo</button>`+CHIPS.map(v=>`<button class="chp ${v==chip?'sel':''}" data-c="${v}">${v}</button>`).join('')+`<button data-act="dbl">×2 Double</button>`;
 $('rulesBody').innerHTML='<table><tr><th>Bet</th><th>Pays</th></tr>'+[['Small / Big / Odd / Even','1:1, loses on any triple'],['Total 4 or 17',T[4]+':1'],['Total 5 or 16',T[5]+':1'],['Total 6 or 15',T[6]+':1'],['Total 7 or 14',T[7]+':1'],['Total 8 or 13',T[8]+':1'],['Total 9 to 12',T[9]+':1'],['Each triple',P.triple+':1'],['Any triple',P.any3+':1'],['Each double',P.double+':1'],['Two dice',P.combo+':1'],['Single number','1:1, 2:1 or 3:1 by how many dice show it']].map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')+'</table><p class="note">A winning bet returns your stake plus winnings. Dice are random and never depend on bets or balance.</p>'}
function tx(t,a){const r=document.createElement('tr');r.innerHTML=`<td>${t}</td><td>${a>=0?'+':''}${fmt(a)}</td><td>${fmt(bal)}</td>`;$('tx').prepend(r)}
function sync(){ $('bal').textContent=fmt(bal);$('hbal').textContent=fmt(bal);save();const tot=Object.values(bets).reduce((a,b)=>a+b,0);$('staked').textContent='Staked this round: '+fmt(tot)+' · Limits '+fmt(LIM.min)+'–'+fmt(LIM.max)+' (triples up to '+fmt(LIM.tri)+')';
 document.querySelectorAll('#board .cell').forEach(e=>{const v=bets[e.dataset.k],c=e.querySelector('.chip');c.hidden=!v;c.textContent=v||''})}
let LIM={min:10,max:5000,tri:500},ST={r:[],tot:{n:0,st:0,pd:0},t:{}};
try{LIM=Object.assign(LIM,JSON.parse(localStorage.getItem('sb_limits')||'{}'));const x=JSON.parse(localStorage.getItem('sb_stats')||'null');if(x&&x.tot)ST=x}catch(e){}
const pst=()=>{try{localStorage.setItem('sb_stats',JSON.stringify(ST));localStorage.setItem('sb_limits',JSON.stringify(LIM))}catch(e){}};
const isTri=k=>k=='any3'||k.slice(0,2)=='tr';
const tileName=k=>({small:'Small',big:'Big',odd:'Odd',even:'Even',any3:'Any Triple'}[k]||(k.slice(0,2)=='tr'?'Triple '+k[2]:k[0]=='t'?'Total '+k.slice(1):k[0]=='d'?'Double '+k[1]:k[0]=='s'?'Single '+k[1]:'Combo '+k[1]+'+'+k[2]));
function renderStats(){const t=ST.tot,p=t.st-t.pd,e=t.st?(p/t.st*100).toFixed(1):'0.0';
 const top=Object.entries(ST.t).sort((a,b)=>b[1]-a[1]).slice(0,5).map(x=>tileName(x[0])+': '+fmt(x[1])).join(' · ')||'No bets yet';
 const rows=ST.r.slice().reverse().slice(0,10).map(r=>`<tr><td>#${r.id}</td><td>${fmt(r.st)}</td><td>${fmt(r.pd)}</td><td>${fmt(r.st-r.pd)}</td></tr>`).join('')||'<tr><td colspan="4">No rounds yet.</td></tr>';
 $('astats').innerHTML=`<table><tr><td>Rounds with bets</td><td>${t.n}</td></tr><tr><td>Total staked</td><td>${fmt(t.st)}</td></tr><tr><td>Total paid out</td><td>${fmt(t.pd)}</td></tr><tr><td>House profit</td><td><b style="color:${p>=0?'var(--win)':'#ff7b8a'}">${p>=0?'+':''}${fmt(p)}</b> (${e}%)</td></tr><tr><td>Most-bet tiles</td><td>${top}</td></tr></table><div class="scroll" style="max-height:180px"><table><tr><th>Round</th><th>Staked</th><th>Paid</th><th>House</th></tr>${rows}</table></div><p class="note">Dice are random. Profit comes from the payout table, never from changing results.</p>`;
 $('lmin').value=LIM.min;$('lmax').value=LIM.max;$('ltri').value=LIM.tri}
$('lsave').onclick=()=>{const a=+$('lmin').value,b=+$('lmax').value,c=+$('ltri').value;
 if(!(a>=1&&b>=a&&c>=a&&c<=b)){$('lerr').textContent='Use min 1 or more, max at least min, and a triple max between min and max.';return}
 LIM={min:a,max:b,tri:c};pst();$('lerr').textContent='Saved.'};
let stack=[],SH=[];
function strip(t,tri){SH.unshift([t,tri]);SH=SH.slice(0,14);$('strip').innerHTML=SH.map(x=>`<span class="${x[1]?'tri':''}">${x[0]}</span>`).join('')}
$('board').onclick=e=>{const b=e.target.closest('.cell');if(!b)return;
 if(phase!='bet'){$('msg').textContent='Betting is closed. Wait for the next round.';return}
 if(bal<chip){$('msg').textContent='Not enough coins. Add coins to keep playing.';return}
 const k=b.dataset.k,cap=isTri(k)?LIM.tri:LIM.max,nv=(bets[k]||0)+chip;
 if(nv<LIM.min){$('msg').textContent='Minimum bet is '+fmt(LIM.min)+'. Pick a larger chip.';return}
 if(nv>cap){$('msg').textContent='Maximum on this bet is '+fmt(cap)+'.';return}
 bal-=chip;bets[k]=nv;stack.push([k,chip]);sync()};
$('chips').onclick=e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.c){chip=+b.dataset.c;document.querySelectorAll('.chp').forEach(x=>x.classList.toggle('sel',+x.dataset.c==chip));return}
 if(phase!='bet')return;
 if(b.dataset.act=='undo'){const l=stack.pop();if(!l)return;bal+=l[1];bets[l[0]]-=l[1];if(!bets[l[0]])delete bets[l[0]];sync()}
 if(b.dataset.act=='dbl'){const en=Object.entries(bets),need=en.reduce((a,x)=>a+x[1],0);if(!need)return;if(en.some(x=>x[1]*2>(isTri(x[0])?LIM.tri:LIM.max))){$('msg').textContent='Doubling would pass the maximum bet.';return}if(need>bal){$('msg').textContent='Not enough coins to double your bets.';return}bal-=need;en.forEach(x=>{bets[x[0]]+=x[1];stack.push([x[0],x[1]])});sync()}};
$('clear').onclick=()=>{if(phase!='bet')return;for(const k in bets)bal+=bets[k];bets={};stack=[];sync()};
let users={},cur=null,lmode='in',wl=[];
try{users=JSON.parse(localStorage.getItem('sb_users')||'{}')}catch(e){}
function save(){if(!cur)return;users[cur].bal=bal;users[cur].wl=wl;try{localStorage.setItem('sb_users',JSON.stringify(users))}catch(e){}}
const sha=async s=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('');
function view(v){['login','home','game','cards','cricket','admin'].forEach(x=>$(x).hidden=x!=v);$('hdr').hidden=v=='login'||v=='admin';$('homeBtn').hidden=v!='game'&&v!='cards'&&v!='cricket'}
function renderWl(){$('wl').innerHTML=wl.length?wl.slice().reverse().map(w=>`<tr><td>${w.t}</td><td>${fmt(w.a)}${w.bonus?' +'+fmt(w.bonus)+' bonus':''}</td><td>${w.id}</td><td>${w.s}</td></tr>`).join(''):'<tr><td colspan="4">No requests yet. Use Deposit to add coins.</td></tr>'}
function addWl(t,a,s,utr){const id=(t=='Deposit'?'DP':'WD')+Date.now().toString(36).toUpperCase()+rnd();wl.push({t,a,id,s,utr});renderWl();save();return id}
function modal(h){$('modal').innerHTML=`<div class="mbox">${h}<button id="mx">Close</button></div>`;$('modal').hidden=false;$('mx').onclick=()=>$('modal').hidden=true}
function depStep1(){modal(`<h2>Deposit</h2><p class="note">Get a ${BONUS_PCT}% bonus on every approved deposit.</p><input id="amt" type="number" inputmode="numeric" placeholder="Amount (₹)"><div class="chips">${[100,200,500,1000,2000].map(v=>`<button data-q="${v}">₹${v}</button>`).join('')}</div><div class="err" id="merr"></div><button class="pri" id="mgo">Continue</button>`);
 $('modal').onclick=e=>{const q=e.target.dataset&&e.target.dataset.q;if(q)$('amt').value=q};
 $('mgo').onclick=()=>{const a=+$('amt').value;if(!(a>=100&&a<=100000)){$('merr').textContent='Enter an amount from 100 to 1,00,000.';return}depStep2(a)}}
const UPI_ID='',BONUS_PCT=5;
function depStep2(a){modal(`<h2>Pay ₹${fmt(a)}</h2><p class="note">After verification you get ${fmt(a)} coins + ${fmt(Math.floor(a*BONUS_PCT/100))} bonus.</p><img class="deposit-qr" src="deposit-qr.png" width="170" height="170" alt="Deposit payment QR code"><p class="note">Scan the saved QR code. Check the recipient and amount in your payment app before paying. Payments are not confirmed automatically in this demo.</p><div class="chips"><span>UPI ID: <b>${UPI_ID}</b></span><button id="cp">Copy UPI ID</button></div><div class="err" id="merr"></div><p class="note">1. Open Google Pay, PhonePe or Paytm. 2. Scan the QR or enter the UPI ID. 3. Pay exactly ₹${fmt(a)}. 4. Note the 12-digit UTR number.</p><button class="pri" id="mgo">I’ve paid, continue</button>`);
 $('cp').onclick=async()=>{try{await navigator.clipboard.writeText(UPI_ID);$('cp').textContent='Copied'}catch(e){$('merr').textContent='Copy is blocked here. Select the UPI ID and copy it manually.'}};
 $('mgo').onclick=()=>depStep3(a)}
function depStep3(a){modal(`<h2>Payment details</h2><p class="note">Amount: ₹${fmt(a)}</p><input id="utr" inputmode="numeric" maxlength="12" placeholder="Enter 12-digit UTR number"><label class="note">Payment screenshot or slip (JPG, PNG or PDF, up to 5 MB)</label><input id="slip" type="file" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"><div class="err" id="merr"></div><button class="pri" id="mgo">Submit deposit request</button>`);
 $('mgo').onclick=()=>{const utr=$('utr').value.trim(),f=$('slip').files[0],e=$('merr');
  if(!/^\d{12}$/.test(utr)){e.textContent='UTR must be exactly 12 digits.';return}
  if(!f){e.textContent='Upload your payment screenshot or slip.';return}
  if(!/\.(jpe?g|png|pdf)$/i.test(f.name)){e.textContent='Only JPG, PNG or PDF files are accepted.';return}
  if(f.size>5*1024*1024){e.textContent='File is larger than 5 MB.';return}
  if(Object.values(users).some(u=>(u.wl||[]).some(w=>w.utr==utr))){e.textContent='This UTR was already submitted.';return}
  const id=addWl('Deposit',a,'Pending',utr);wl[wl.length-1].slip=f.name;wl[wl.length-1].bonus=Math.floor(a*BONUS_PCT/100);modal(`<h2>Request in progress</h2><p>Your deposit of ₹${fmt(a)} is waiting for payment verification.</p><p class="note">Reference: ${id}<br>UTR: ${utr}<br>Status: Pending<br>Coins are added once the payment is verified.</p>`)}}
function wdOpen(){modal(`<h2>Withdraw</h2><p>Available: <b>${fmt(bal)}</b> coins</p><input id="amt" type="number" inputmode="numeric" placeholder="Amount"><input id="upi" placeholder="UPI ID or bank account"><div class="err" id="merr"></div><button class="pri" id="mgo">Confirm withdrawal</button>`);
 $('mgo').onclick=()=>{const a=+$('amt').value,u=$('upi').value.trim();if(!(a>=100)){$('merr').textContent='Minimum withdrawal is 100.';return}if(a>bal){$('merr').textContent='Amount is more than your balance.';return}if(u.length<5){$('merr').textContent='Enter your UPI ID or bank details.';return}
  bal-=a;const id=addWl('Withdrawal',a,'Pending');tx('Withdrawal '+id,-a);sync();modal(`<h2>Request sent</h2><p>Transaction ID: <b>${id}</b><br>Status: Pending</p>`)}}
$('topup').onclick=$('hdep').onclick=depStep1;$('cash').onclick=$('hwd').onclick=wdOpen;
$('play').onclick=()=>view('game');$('homeBtn').onclick=()=>view('home');
$('logout').onclick=()=>{for(const k in bets)bal+=bets[k];for(const k in cb)bal+=cb[k];cb={};cst=[];bets={};stack=[];save();cur=null;$('un').value='';view('login')};
$('lswitch').onclick=()=>{lmode=lmode=='in'?'up':'in';const up=lmode=='up';$('ltitle').textContent=up?'Create account':'Log in';$('lgo').textContent=up?'Create account':'Log in';$('lswitch').textContent=up?'Have an account? Log in':'New here? Create an account';$('lmsg').textContent=''};
async function auth(){const u=$('un').value.trim().toLowerCase(),p=$('pw').value,m=$('lmsg');
 if(u.length<3||p.length<6){m.textContent='Username needs 3+ characters and password 6+.';return}
 const h=await sha(u+':'+p);
 if(u=='admin'&&!users.admin&&lmode=='in'&&p=='admin123')users.admin={h,bal:0,wl:[],admin:true};
 if(lmode=='up'){if(users[u]||u=='admin'){m.textContent='That username is taken.';return}users[u]={h,bal:0,wl:[]}}
 else if(!users[u]||users[u].h!=h){m.textContent='Wrong username or password.';return}
 cur=u;bal=users[u].bal;wl=users[u].wl||[];$('pw').value='';m.textContent='';$('who').textContent=u;$('tx').innerHTML='';tx('Starting balance',bal);renderWl();sync();if(users[u].admin){view('admin');renderAdmin()}else view('home')}
function persist(){try{localStorage.setItem('sb_users',JSON.stringify(users))}catch(e){}}
function act(u,i,w){const b=(l,a,c)=>`<button data-u="${u}" data-i="${i}" data-a="${a}" class="${c||''}">${l}</button>`;
 if(w.t=='Withdrawal'&&w.s=='Approved')return b('Mark completed','done');
 if(w.s=='Pending')return b('Approve','ok','pri')+' '+b('Reject','no');return ''}
function renderAdmin(){renderStats();renderCrAdmin();const rows=[];
 for(const u in users){if(users[u].admin)continue;(users[u].wl||[]).forEach((w,i)=>rows.push({u,i,w}))}
 $('areq').innerHTML=rows.length?rows.reverse().map(({u,i,w})=>`<tr><td>${u}</td><td>${w.t}</td><td>${fmt(w.a)}${w.bonus?' +'+fmt(w.bonus)+' bonus':''}</td><td>${w.utr||'—'}${w.slip?'<br>'+w.slip:''}</td><td>${w.id}</td><td>${w.s}</td><td>${act(u,i,w)}</td></tr>`).join(''):'<tr><td colspan="7">No requests yet.</td></tr>';
 $('ausers').innerHTML=Object.keys(users).filter(u=>!users[u].admin).map(u=>`<tr><td>${u}</td><td>${fmt(users[u].bal)}</td></tr>`).join('')||'<tr><td colspan="2">No users yet.</td></tr>'}
$('admin').onclick=e=>{const b=e.target.closest('button[data-a]');if(!b)return;const U=users[b.dataset.u],w=U.wl[+b.dataset.i],a=b.dataset.a;
 if(a=='ok'&&w.s=='Pending'){if(w.t=='Deposit')U.bal+=w.a+(w.bonus||0);w.s='Approved'}
 else if(a=='no'&&w.s=='Pending'){if(w.t=='Withdrawal')U.bal+=w.a;w.s='Rejected'}
 else if(a=='done'&&w.s=='Approved')w.s='Completed';
 persist();renderAdmin()};
$('alogout').onclick=()=>{cur=null;$('un').value='';view('login')};
$('lgo').onclick=auth;$('pw').onkeydown=e=>{if(e.key=='Enter')auth()};
const SUITS=[['♠','Spades','b'],['♥','Hearts','r'],['♦','Diamonds','r'],['♣','Clubs','b']],RANKS=['7','8','9','10','J','Q','K','A'];
const CP={red:.95,face:1.5,suit:2.8,card:28};
let cb={},cst=[],cph='bet',cleft=15,cround=2000,CH=[];
const cmult=(k,i)=>{const su=i>>3,rk=i%8;
 if(k=='red'||k=='black')return (su==1||su==2)==(k=='red')?CP.red:0;
 if(k=='face')return rk>=4&&rk<=6?CP.face:0;
 if(k[0]=='s')return +k[1]==su?CP.suit:0;
 if(k[0]=='k')return +k.slice(1)==i?CP.card:0;return 0};
function cbuild(){
 const sym=i=>{const x=SUITS[i>>3];return `<span class="${x[2]=='r'?'cr':''}">${RANKS[i%8]}${x[0]}</span>`};
 let h=`<div class="bd"><div class="lb">Colour ${CP.red}:1 · Face card ${CP.face}:1</div><div class="rg" style="grid-template-columns:repeat(3,1fr)">${C('red','<b class="cr">RED</b><small>♥ ♦</small>')}${C('black','<b>BLACK</b><small>♠ ♣</small>')}${C('face','<b>FACE</b><small>J Q K</small>')}</div>`;
 h+=`<div class="lb">Suit ${CP.suit}:1</div><div class="rg" style="grid-template-columns:repeat(4,1fr)">${SUITS.map((x,i)=>C('s'+i,`<b class="${x[2]=='r'?'cr':''}">${x[0]}</b><small>${x[1]}</small>`)).join('')}</div>`;
 h+=`<div class="lb">Exact card ${CP.card}:1</div><div class="rg" style="grid-template-columns:repeat(8,1fr)">${Array.from({length:32},(_,i)=>C('k'+i,sym(i),'sm')).join('')}</div></div>`;
 $('cboard').innerHTML=h;
 $('cchips').innerHTML=`<button data-act="undo">↶ Undo</button>`+CHIPS.map(v=>`<button class="chp ${v==chip?'sel':''}" data-c="${v}">${v}</button>`).join('')+`<button data-act="dbl">×2 Double</button>`;
 $('crules').innerHTML='<table><tr><th>Bet</th><th>Wins when</th><th>Pays</th></tr><tr><td>Red / Black</td><td>Card is red (♥ ♦) or black (♠ ♣)</td><td>'+CP.red+':1</td></tr><tr><td>Face</td><td>Card is J, Q or K</td><td>'+CP.face+':1</td></tr><tr><td>Suit</td><td>Card is that suit</td><td>'+CP.suit+':1</td></tr><tr><td>Exact card</td><td>Card is exactly that card</td><td>'+CP.card+':1</td></tr></table><p class="note">One card is drawn at random from a fresh 32-card deck (7 to Ace, four suits) each round. A winning bet returns your stake plus winnings. Results never depend on bets or balance.</p>'}
function csync(){const t=Object.values(cb).reduce((a,b)=>a+b,0);$('cstaked').textContent='Staked this round: '+fmt(t)+' · Limits '+fmt(LIM.min)+'–'+fmt(LIM.max)+' (exact card up to '+fmt(LIM.tri)+')';
 document.querySelectorAll('#cboard .cell').forEach(e=>{const v=cb[e.dataset.k],c=e.querySelector('.chip');c.hidden=!v;c.textContent=v||''});sync()}
$('cboard').onclick=e=>{const b=e.target.closest('.cell');if(!b)return;
 if(cph!='bet'){$('cmsg').textContent='Betting is closed. Wait for the next round.';return}
 if(bal<chip){$('cmsg').textContent='Not enough coins. Deposit to keep playing.';return}
 const k=b.dataset.k,cap=k[0]=='k'?LIM.tri:LIM.max,nv=(cb[k]||0)+chip;
 if(nv<LIM.min){$('cmsg').textContent='Minimum bet is '+fmt(LIM.min)+'. Pick a larger chip.';return}
 if(nv>cap){$('cmsg').textContent='Maximum on this bet is '+fmt(cap)+'.';return}
 bal-=chip;cb[k]=nv;cst.push([k,chip]);csync()};
$('cchips').onclick=e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.c){chip=+b.dataset.c;document.querySelectorAll('.chp').forEach(x=>x.classList.toggle('sel',+x.dataset.c==chip));return}
 if(cph!='bet')return;
 if(b.dataset.act=='undo'){const l=cst.pop();if(!l)return;bal+=l[1];cb[l[0]]-=l[1];if(!cb[l[0]])delete cb[l[0]];csync()}
 if(b.dataset.act=='dbl'){const en=Object.entries(cb),need=en.reduce((a,x)=>a+x[1],0);if(!need)return;
  if(en.some(x=>x[1]*2>(x[0][0]=='k'?LIM.tri:LIM.max))){$('cmsg').textContent='Doubling would pass the maximum bet.';return}
  if(need>bal){$('cmsg').textContent='Not enough coins to double your bets.';return}
  bal-=need;en.forEach(x=>{cb[x[0]]+=x[1];cst.push([x[0],x[1]])});csync()}};
$('cclear').onclick=()=>{if(cph!='bet')return;for(const k in cb)bal+=cb[k];cb={};cst=[];csync()};
$('cplay').onclick=()=>view('cards');
function showCard(i){const x=SUITS[i>>3],c=$('ccard');c.className='pc flip '+(x[2]=='r'?'r':'');c.innerHTML=`<span>${RANKS[i%8]}</span><span>${x[0]}</span>`}
function csettle(i){let stake=0,back=0;
 document.querySelectorAll('#cboard .cell').forEach(e=>{const k=e.dataset.k,v=cb[k];if(!v)return;stake+=v;const m=cmult(k,i);if(m){back+=Math.floor(v*(1+m));e.classList.add('won')}else e.classList.add('lost')});
 bal+=back;const net=back-stake,x=SUITS[i>>3],nm=RANKS[i%8]+x[0];
 if(stake){ST.tot.n++;ST.tot.st+=stake;ST.tot.pd+=back;ST.r.push({id:'C'+cround,st:stake,pd:back});ST.r=ST.r.slice(-30);pst();tx('32 Cards #'+cround+' bets',-stake);if(back)tx('32 Cards #'+cround+' payout',back)}
 $('cmsg').className='msg '+(net>0?'win':'lose');
 $('cmsg').textContent=!stake?'No bets this round.':net>0?`You won ${fmt(back)} coins (net +${fmt(net)}).`:back>0?`${fmt(back)} coins returned (net -${fmt(-net)}).`:`No winning bets. Lost ${fmt(stake)} coins.`;
 const r=document.createElement('tr');r.innerHTML=`<td>#${cround}</td><td>${nm}</td><td>${stake?(net>=0?'+':'')+fmt(net):'—'}</td>`;$('chist').prepend(r);
 CH.unshift([nm,x[2]=='r']);CH=CH.slice(0,14);$('cstrip').innerHTML=CH.map(y=>`<span class="${y[1]?'cr2':''}">${y[0]}</span>`).join('');
 if(net>0&&!$('cards').hidden)celebrate(back,net,false);
 csync()}
function ctick(){
 if(cph=='bet'){cleft--;$('ctime').textContent=cleft;
  if(cleft<=0){cph='deal';$('cphase').textContent='Dealing…';$('ctime').textContent='';$('cmsg').className='msg';$('cmsg').textContent='No more bets.';
   const i=crypto.getRandomValues(new Uint32Array(1))[0]%32,c=$('ccard');c.className='pc back fly';c.innerHTML='';
   setTimeout(()=>{showCard(i);csettle(i);cph='show';cleft=6;$('cphase').textContent='Result';$('ctime').textContent=cleft},900)}}
 else if(cph=='show'){cleft--;$('ctime').textContent=cleft;
  if(cleft<=0){cb={};cst=[];cround++;cph='bet';cleft=15;$('cphase').textContent='Place your bets';$('ctime').textContent=cleft;$('cmsg').className='msg';$('cmsg').textContent='New round. Choose a chip, then tap a bet or a card.';
   const c=$('ccard');c.className='pc back';c.innerHTML='';document.querySelectorAll('#cboard .cell').forEach(e=>e.classList.remove('won','lost'));csync()}}}
const SEED=[
{tour:"One-Day Cup",home:"Victoria",away:"Western Australia",time:"Mon 16 Nov, 8:30 AM IST",status:"live",score:"",result:""},
{tour:"Syed Mushtaq Ali Trophy Elite",home:"Himachal Pradesh",away:"Andhra",time:"Mon 16 Nov, 8:30 AM IST",status:"scheduled",score:"",result:""},
{tour:"Syed Mushtaq Ali Trophy Elite",home:"Railways",away:"Bihar",time:"Mon 16 Nov, 9:00 AM IST",status:"scheduled",score:"",result:""},
{tour:"Syed Mushtaq Ali Trophy Elite",home:"Rajasthan",away:"Jharkhand",time:"Mon 16 Nov, 9:00 AM IST",status:"scheduled",score:"",result:""},
{tour:"Senior Women's T20 Trophy Elite",home:"Karnataka",away:"Vidarbha",time:"Mon 16 Nov, 9:00 AM IST",status:"scheduled",score:"",result:""},
{tour:"Syed Mushtaq Ali Trophy Elite",home:"Jammu And Kashmir",away:"Tamil Nadu",time:"Mon 16 Nov, 11:00 AM IST",status:"scheduled",score:"",result:""},
{tour:"Syed Mushtaq Ali Trophy Elite",home:"Vidarbha",away:"Odisha",time:"Mon 16 Nov, 8:00 AM IST",status:"final",score:"",result:"Vidarbha won by 8 wickets"},
{tour:"One-Day Cup",home:"New South Wales Blues",away:"South Australia",time:"Mon 16 Nov, 4:30 AM IST",status:"final",score:"236/3 · 108/10",result:"South Australia won by 172 runs (D/L method)"},
{tour:"ODI Series Australia v England",home:"Australia",away:"England",time:"Sun 15 Nov, 9:00 AM IST",status:"final",score:"355/6 · 220/10",result:"England won by 135 runs"}];
let CR=SEED;try{const x=JSON.parse(localStorage.getItem('sb_cricket')||'null');if(Array.isArray(x))CR=x}catch(e){}
const pcr=()=>{try{localStorage.setItem('sb_cricket',JSON.stringify(CR))}catch(e){}};
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function renderCricket(){
 const card=m=>`<div class="tile"><span class="phase">${esc(m.tour)}</span><h2>${esc(m.home)} v ${esc(m.away)}</h2>${m.score?`<div class="num">${esc(m.score)}</div>`:''}<span class="${m.status=='live'?'live':'phase'}">${m.status=='live'?'● Live now':m.status=='final'?esc(m.result||'Match finished'):'Starts '+esc(m.time)}</span></div>`;
 const sec=(t,st)=>{const l=CR.filter(m=>m.status==st);return `<h3>${t}</h3><div class="tiles">${l.length?l.map(card).join(''):'<p class="note">No matches.</p>'}</div>`};
 $('crlist').innerHTML=sec('Live now','live')+sec('Upcoming','scheduled')+sec('Results','final')}
function renderCrAdmin(){const o=v=>['live','scheduled','final'].map(x=>`<option ${x==v?'selected':''}>${x}</option>`).join('');
 $('acr').innerHTML=CR.length?CR.map((m,i)=>`<tr data-i="${i}"><td>${esc(m.home)} v ${esc(m.away)}</td><td><select>${o(m.status)}</select></td><td><input data-f="score" value="${esc(m.score)}"></td><td><input data-f="result" value="${esc(m.result)}"></td><td><button data-sv="1">Save</button> <button data-del="1">Delete</button></td></tr>`).join(''):'<tr><td colspan="5">No matches yet.</td></tr>'}
$('acr').onclick=e=>{const b=e.target.closest('button');if(!b)return;const tr=b.closest('tr'),i=+tr.dataset.i;
 if(b.dataset.del)CR.splice(i,1);
 else if(b.dataset.sv){CR[i].status=tr.querySelector('select').value;CR[i].score=tr.querySelector('[data-f=score]').value.trim();CR[i].result=tr.querySelector('[data-f=result]').value.trim()}
 pcr();renderCrAdmin();renderCricket()};
$('cadd').onclick=()=>{const v=[1,2,3,4].map(n=>$('cn'+n).value.trim());
 if(!v[1]||!v[2]){$('cerr').textContent='Enter both team names.';return}
 CR.unshift({tour:v[0]||'Cricket',home:v[1],away:v[2],time:v[3]||'Time to be announced',status:'scheduled',score:'',result:''});
 [1,2,3,4].forEach(n=>$('cn'+n).value='');$('cerr').textContent='Match added.';pcr();renderCrAdmin();renderCricket()};
$('crplay').onclick=()=>{renderCricket();view('cricket')};
renderCricket();
cbuild();csync();setInterval(ctick,1000);
function celebrate(back,net,big){const el=$('cele');
 el.innerHTML=`<div class="cbox">${big?'TRIPLE WIN!':'YOU WON'}<br>+${fmt(net)} coins<small>${fmt(back)} returned with your stake</small></div>`;
 const cols=['#f2c14e','#d7263d','#38d996','#4da3ff','#ffffff'];
 for(let i=0;i<(big?120:70);i++){const c=document.createElement('i');c.className='cf';c.style.cssText=`left:${Math.random()*100}%;background:${cols[i%5]};animation-duration:${1.8+Math.random()*1.8}s;animation-delay:${Math.random()*.6}s;transform:rotate(${Math.random()*360}deg)`;el.appendChild(c)}
 el.classList.add('on');clearTimeout(window._ct);window._ct=setTimeout(()=>{el.classList.remove('on');el.innerHTML=''},big?4500:3200)}
function settle(){
 const s=dice[0]+dice[1]+dice[2],tri=dice[0]==dice[1]&&dice[1]==dice[2];
 let stake=0,back=0;
 document.querySelectorAll('#board .cell').forEach(e=>{const k=e.dataset.k,v=bets[k];if(!v)return;stake+=v;const m=mult(k,dice);
  if(m){back+=v*(m+1);e.classList.add('won')}else e.classList.add('lost')});
 bal+=back;const net=back-stake;
 if(stake){ST.tot.n++;ST.tot.st+=stake;ST.tot.pd+=back;ST.r.push({id:round,st:stake,pd:back});ST.r=ST.r.slice(-30);for(const k in bets)ST.t[k]=(ST.t[k]||0)+bets[k];pst()}
 $('total').textContent='Total '+s+(tri?' · Triple':'');
 $('jp').classList.toggle('show',tri&&bets.any3>0);
 if(net>0&&!$('game').hidden)celebrate(back,net,tri&&bets.any3>0);
 if(!stake)$('msg').textContent='No bets this round.';
 else{$('msg').className='msg '+(net>0?'win':'lose');$('msg').textContent=net>0?`You won ${fmt(back)} coins (net +${fmt(net)}).`:`No winning bets. Lost ${fmt(stake)} coins.`}
 const r=document.createElement('tr');r.innerHTML=`<td>#${round}</td><td>${dice.map(d=>`<span class="mini">${d}</span>`).join('')}</td><td>${s}</td><td>${stake?(net>=0?'+':'')+fmt(net):'—'}</td>`;$('hist').prepend(r);strip(s,tri);
 if(stake){tx('Round #'+round+' bets',-stake);if(back)tx('Round #'+round+' payout',back)}
 sync()}
function tick(){
 if(phase=='bet'){left--;$('time').textContent=left;
  if(left<=0){phase='roll';$('scene').classList.add('rolling');$('phase').textContent='Rolling…';$('time').textContent='';$('msg').className='msg';$('msg').textContent='No more bets.';
   dice=[rnd(),rnd(),rnd()];let n=0;const iv=setInterval(()=>{dice=[rnd(),rnd(),rnd()];drawDice('roll');setSD();if(++n>=7){clearInterval(iv);}},170);
   setTimeout(()=>{clearInterval(iv);dice=[rnd(),rnd(),rnd()];drawDice();$('scene').classList.remove('rolling');setSD();settle();phase='show';left=6;$('phase').textContent='Result';$('time').textContent=left},1400)}}
 else if(phase=='show'){left--;$('time').textContent=left;
  if(left<=0){bets={};stack=[];round++;phase='bet';left=15;$('phase').textContent='Place your bets';$('time').textContent=left;$('msg').className='msg';$('msg').textContent='New round. Choose a chip, then tap a bet.';$('jp').classList.remove('show');
   document.querySelectorAll('#board .cell').forEach(e=>e.classList.remove('won','lost'));sync()}}}
function setSD(){const P={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};document.querySelectorAll('#scene .pp').forEach((g,i)=>{g.innerHTML=P[dice[i]].map(k=>`<circle cx='${5+(k%3)*5}' cy='${5+Math.floor(k/3)*5}' r='1.9' fill='#fff'/>`).join('')})}
build();drawDice();setSD();view('login');setInterval(tick,1000);
