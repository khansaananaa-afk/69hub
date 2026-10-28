/* 69HUB – static demo. All data is in memory and resets on reload.
   BACKEND HOOK: replace the `api` object below with fetch() calls to a real server later. */
'use strict';

const B = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/';
const api = { // Today: sample data. Later: swap these for real network requests.
  videos: [
    ['Big Buck Bunny','Animation','Blender Studio',1820000,'2026-10-20','BigBuckBunny.mp4','10:34'],
    ['Elephants Dream','Animation','Orange Team',940000,'2026-10-12','ElephantsDream.mp4','10:53'],
    ['Sintel: The Dragon Quest','Animation','Blender Studio',2410000,'2026-09-30','Sintel.mp4','14:48'],
    ['Tears of Steel','Sci-Fi','Mango Team',1260000,'2026-10-25','TearsOfSteel.mp4','12:14'],
    ['For Bigger Blazes','Demo','Nova Studio',310000,'2026-10-27','ForBiggerBlazes.mp4','0:15'],
    ['For Bigger Escapes','Travel','Nova Studio',275000,'2026-10-26','ForBiggerEscapes.mp4','0:15'],
    ['For Bigger Fun','Demo','Pixel Pals',198000,'2026-10-18','ForBiggerFun.mp4','1:00'],
    ['For Bigger Joyrides','Travel','Road Reel',452000,'2026-10-08','ForBiggerJoyrides.mp4','0:15'],
    ['For Bigger Meltdowns','Demo','Pixel Pals',87000,'2026-09-22','ForBiggerMeltdowns.mp4','0:15'],
    ['Subaru Outback On Street And Dirt','Travel','Road Reel',640000,'2026-09-15','SubaruOutbackOnStreetAndDirt.mp4','9:54'],
    ['Volkswagen GTI Review','Tech','Gear Lab',730000,'2026-09-05','VolkswagenGTIReview.mp4','8:45'],
    ['We Are Going On Bullrun','Travel','Road Reel',156000,'2026-08-28','WeAreGoingOnBullrun.mp4','4:00'],
  ].map((v,i)=>({id:i,title:v[0],cat:v[1],creator:v[2],views:v[3],date:v[4],src:B+v[5],dur:v[6],
    desc:'Sample video for demonstration. Licensed for open use (Blender Foundation / Google sample bucket).',
    featured:i<3,status:'Approved'})),
  categories:['Animation','Sci-Fi','Travel','Tech','Demo'],
};

const $ = (s,r=document)=>r.querySelector(s);
const esc = s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const grad = id=>`linear-gradient(135deg,hsl(${(id*47)%360} 55% 22%),hsl(${(id*47+40)%360} 70% 38%))`;
const fmtViews = n=>n>=1e6?(n/1e6).toFixed(1)+'M views':n>=1e3?Math.round(n/1e3)+'K views':n+' views';
const ago = d=>{const days=Math.max(0,Math.round((new Date('2026-10-28')-new Date(d))/864e5));return days<1?'today':days<30?days+'d ago':Math.round(days/30)+'mo ago'};
const PAGE = 8;
const st = {q:'',cat:'All',sort:'new',shown:PAGE};
const approved = ()=>api.videos.filter(v=>v.status==='Approved');

function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2600)}

/* ---------- Cards & home ---------- */
function card(v){
  return `<button class="card" data-id="${v.id}" aria-label="Play ${esc(v.title)}">
    <div class="thumb" style="background:${v.thumb||grad(v.id)}"><span class="dur">${v.dur}</span></div>
    <div class="cbody"><h3>${esc(v.title)}</h3><p class="meta">${esc(v.creator)}</p>
    <p class="meta">${fmtViews(v.views)} · ${ago(v.date)}</p></div></button>`;
}
function renderCats(){
  $('#cats').innerHTML=['All',...api.categories].map(c=>`<button role="tab" aria-selected="${c===st.cat}" class="${c===st.cat?'on':''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
  $('#upCat').innerHTML=api.categories.map(c=>`<option>${esc(c)}</option>`).join('');
}
function renderHome(){
  const list=approved();
  $('#featured').innerHTML=list.filter(v=>v.featured).map(card).join('');
  $('#trending').innerHTML=[...list].sort((a,b)=>b.views-a.views).slice(0,4).map(card).join('');
  const q=st.q.trim().toLowerCase();
  let res=list.filter(v=>(st.cat==='All'||v.cat===st.cat)&&v.title.toLowerCase().includes(q));
  res.sort(st.sort==='views'?(a,b)=>b.views-a.views:(a,b)=>new Date(b.date)-new Date(a.date));
  const filtered=q||st.cat!=='All';
  $('#featuredWrap').hidden=filtered;
  $('#listTitle').textContent=filtered?`${res.length} result${res.length===1?'':'s'}`:'Recently uploaded';
  $('#grid').innerHTML=res.slice(0,st.shown).map(card).join('');
  $('#empty').hidden=res.length>0;
  $('#more').hidden=st.shown>=res.length;
  renderCats();
}
function clearFilters(){st.q='';st.cat='All';st.sort='new';st.shown=PAGE;$('#searchInput').value='';$('#sort').value='new';renderHome()}

/* ---------- Player ---------- */
const vid=$('#video');
function openVideo(id){
  const v=api.videos[id]; if(!v) return location.hash='#home';
  $('#perr').hidden=true; vid.src=v.src; vid.poster=''; vid.playbackRate=+$('#speed').value;
  $('#wTitle').textContent=v.title;
  $('#wMeta').textContent=`${v.creator} · ${fmtViews(v.views)} · ${v.date} · ${v.cat}`;
  $('#wDesc').textContent=v.desc; $('#reportBtn').dataset.id=id;
}
const fmtT=s=>isFinite(s)?Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0'):'0:00';
$('#pp').onclick=()=>vid.paused?vid.play().catch(()=>{}):vid.pause();
vid.onclick=$('#pp').onclick;
vid.onplay=vid.onpause=()=>{$('#pp').textContent=vid.paused?'▶':'⏸';$('#pp').setAttribute('aria-label',vid.paused?'Play':'Pause')};
vid.ontimeupdate=vid.onloadedmetadata=()=>{$('#seek').value=vid.duration?vid.currentTime/vid.duration*100:0;$('#time').textContent=fmtT(vid.currentTime)+' / '+fmtT(vid.duration)};
$('#seek').oninput=e=>{if(vid.duration)vid.currentTime=e.target.value/100*vid.duration};
$('#vol').oninput=e=>{vid.volume=+e.target.value;vid.muted=false};
$('#mute').onclick=()=>{vid.muted=!vid.muted};
vid.onvolumechange=()=>{$('#mute').textContent=vid.muted||!vid.volume?'🔇':'🔊'};
$('#speed').onchange=e=>{vid.playbackRate=+e.target.value};
$('#fs').onclick=()=>{const p=$('#player');document.fullscreenElement?document.exitFullscreen():(p.requestFullscreen||p.webkitRequestFullscreen||(()=>toast('Full screen is not supported here')))?.call(p)};
vid.onerror=()=>{$('#perr').hidden=false};
function stopVideo(){vid.pause();vid.removeAttribute('src');vid.load()}

/* ---------- Dialogs (reports, removal requests, legal pages) ---------- */
const docs={
  about:['About 69HUB','<p>69HUB is a front-end demo of a video-sharing site. It has no accounts, no uploads, and no server.</p>'],
  contact:['Contact','<p>Demo site: replace this text with your real contact email.</p>'],
  privacy:['Privacy Policy','<p>This demo collects no personal data and sets no cookies. A real site needs a policy covering accounts, uploads, analytics and data requests.</p>'],
  terms:['Terms of Service','<p>Demo placeholder. A real service must have lawyer-reviewed terms covering ownership, consent, age rules and prohibited content.</p>'],
};
function showDlg(html){$('#dlgBody').innerHTML=html;const d=$('#dlg');d.open||d.showModal()}
function formDlg(title,intro,extra=''){
  showDlg(`<h2>${title}</h2><p class="meta">${intro}</p><label>Reason<select name="r"><option>Illegal content</option><option>Copyright</option><option>Privacy / consent</option><option>Harassment</option><option>Other</option></select></label><label>Details<textarea name="d" rows="3"></textarea></label>${extra}<button class="btn" value="send" id="sendRep" type="button">Send</button> `);
  $('#sendRep').onclick=()=>{$('#dlg').close();toast('Demo: nothing was sent. A backend is required to receive reports.')};
}
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-doc]'); if(!a) return; e.preventDefault();
  if(a.dataset.doc==='removal') return formDlg('Request content removal','Tell us which content to remove and why.','<label>Video link<input name="u" placeholder="Paste video link"></label>');
  showDlg(`<h2>${docs[a.dataset.doc][0]}</h2>${docs[a.dataset.doc][1]}`);
});
$('#reportBtn').onclick=e=>{
  const v=api.videos[e.target.dataset.id];
  formDlg('Report this video',`Reporting “${esc(v.title)}”.`);
};

/* ---------- Creator ---------- */
const thumbOpts=[0,1,2].map(i=>`linear-gradient(135deg,hsl(${[48,200,320][i]} 60% 25%),hsl(${[48,200,320][i]} 80% 50%))`);
$('#thumbPick').innerHTML=thumbOpts.map((g,i)=>`<label><input type="radio" name="th" value="${i}" ${i?'':'checked'}><span style="background:${g}"></span></label>`).join('');
function renderMine(){
  $('#myVideos').innerHTML=api.videos.filter(v=>v.creator==='Nova Studio').map(v=>
    `<tr><td>${esc(v.title)}</td><td><span class="badge ${v.status.split(' ')[0]}">${v.status}</span></td></tr>`).join('');
}
$('#uploadForm').onsubmit=e=>{
  e.preventDefault();
  const f=e.target,file=$('#upFile').files[0],prog=$('#upProg');
  prog.hidden=false;prog.value=0;let p=0;
  $('#upStatus').textContent='Simulating upload… (no file leaves your device)';
  const t=setInterval(()=>{
    prog.value=p+=20;
    if(p>=100){clearInterval(t);
      const id=api.videos.length;
      api.videos.push({id,title:f.title.value,cat:f.cat.value,creator:'Nova Studio',views:0,date:'2026-10-28',
        src:file?URL.createObjectURL(file):api.videos[4].src,dur:'—',desc:f.desc.value||'No description.',
        thumb:thumbOpts[+f.th.value],status:'Pending Review'});
      $('#upStatus').textContent='Status: Pending Review. Not published until an admin approves it.';
      f.reset();prog.hidden=true;renderMine();renderQueue();renderHome();
    }
  },250);
};

/* ---------- Admin (demo UI only: no real authorization) ---------- */
const reports=[{id:1,vid:7,why:'Copyright'},{id:2,vid:8,why:'Spam'}];
function renderQueue(){
  const q=api.videos.filter(v=>v.status==='Pending Review');
  $('#queue').innerHTML=q.length?q.map(v=>`<div class="item"><div><strong>${esc(v.title)}</strong><p class="meta">${esc(v.creator)} · ${esc(v.cat)}</p></div>
    <div><button class="btn sm" data-act="approve" data-id="${v.id}">Approve</button> <button class="btn sm bad" data-act="reject" data-id="${v.id}">Reject</button></div></div>`).join(''):'<p class="meta">Nothing to review. Submit a video in the Creator tab to see it here.</p>';
  $('#reports').innerHTML=reports.length?reports.map(r=>`<div class="item"><div><strong>${esc(api.videos[r.vid].title)}</strong><p class="meta">Reason: ${r.why}</p></div>
    <div><button class="btn sm ghost" data-act="dismiss" data-id="${r.id}">Dismiss</button> <button class="btn sm bad" data-act="remove" data-id="${r.id}">Remove video</button></div></div>`).join(''):'<p class="meta">No open reports.</p>';
  $('#catList').innerHTML=api.categories.map(c=>`<span class="chip">${esc(c)} <button class="icon-btn" style="min-width:24px;min-height:24px;font-size:1rem" data-act="delcat" data-c="${esc(c)}" aria-label="Delete ${esc(c)}">×</button></span>`).join('');
}
$('#view-admin').addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b)return;
  const id=+b.dataset.id,act=b.dataset.act;
  if(act==='approve'||act==='reject'){api.videos[id].status=act==='approve'?'Approved':'Rejected';toast(act==='approve'?'Approved':'Rejected')}
  if(act==='dismiss')reports.splice(reports.findIndex(r=>r.id===id),1);
  if(act==='remove'){const r=reports.find(r=>r.id===id);api.videos[r.vid].status='Removed';reports.splice(reports.indexOf(r),1);toast('Video removed from listings')}
  if(act==='delcat'){api.categories=api.categories.filter(c=>c!==b.dataset.c);if(st.cat===b.dataset.c)st.cat='All'}
  renderQueue();renderMine();renderHome();
});
$('#catForm').onsubmit=e=>{e.preventDefault();const n=$('#newCat').value.trim();if(n&&!api.categories.includes(n))api.categories.push(n);$('#newCat').value='';renderQueue();renderHome()};

/* ---------- Events & routing ---------- */
$('#cats').onclick=e=>{const b=e.target.closest('[data-cat]');if(b){st.cat=b.dataset.cat;st.shown=PAGE;renderHome()}};
$('#searchForm').onsubmit=e=>{e.preventDefault();st.q=$('#searchInput').value;st.shown=PAGE;location.hash='#home';renderHome()};
$('#searchInput').oninput=e=>{st.q=e.target.value;st.shown=PAGE;renderHome()};
$('#sort').onchange=e=>{st.sort=e.target.value;renderHome()};
$('#more').onclick=()=>{st.shown+=PAGE;renderHome()};
$('#clear').onclick=$('#emptyClear').onclick=clearFilters;
$('#main').addEventListener('click',e=>{const c=e.target.closest('.card');if(c)location.hash='#watch/'+c.dataset.id});
$('#menuBtn').onclick=()=>{const o=$('#nav').classList.toggle('open');$('#menuBtn').setAttribute('aria-expanded',o)};

function route(){
  const [name,arg]=(location.hash.slice(1)||'home').split('/');
  const view=['home','watch','creator','admin'].includes(name)?name:'home';
  document.querySelectorAll('.view').forEach(s=>s.hidden=s.id!=='view-'+view);
  document.querySelectorAll('.nav a').forEach(a=>a.classList.toggle('on',a.dataset.route===view));
  $('#nav').classList.remove('open');
  if(view==='watch')openVideo(+arg);else stopVideo();
  window.scrollTo(0,0);
}
window.addEventListener('hashchange',route);
renderCats();renderHome();renderMine();renderQueue();route();
