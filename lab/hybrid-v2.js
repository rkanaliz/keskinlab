(()=>{
'use strict';
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');

const SECTIONS=[
  {title:'Açılış',sub:'Merak Uyandırma',start:'w01-bilisim-ne'},
  {title:'Ön Bilgimizi Paylaşıyoruz',sub:'Günlük yaşamdan örnekler',start:'w01-gunluk-hayat-ornekleri'},
  {title:'Kavramları Keşfedelim',sub:'5 temel kavram',start:'w01-bes-kavram'},
  {title:'Gruplarla Araştırıyoruz',sub:'Araştır · sor · paylaş',start:'w01-kelime-kavanozu'},
  {title:'Geçmişten Günümüze',sub:'Aynı ihtiyaç, farklı araçlar',start:'w01-checkpoint-2ders'},
  {title:'Yeşil Ekranın Arkası',sub:'Gerçek ile kurgu',start:'w01-yesil-ekran-sahne'},
  {title:"Sinema ve TV'de Teknolojiler",sub:'Sahnenin görünmeyen araçları',start:'w01-sinema-tv-teknolojileri'},
  {title:'Nerelerde Kullanılıyor?',sub:'Kullanım alanları',start:'w01-baska-alanlar'},
  {title:'Neler Öğrendik?',sub:'Ortak sonuca ulaşalım',start:'w01-toplumsal-etki-tartisma'},
  {title:'Çıkış Bileti',sub:'Öğrenmeyi görünür kıl',start:'w01-cikis-kaniti'}
];

const state={lesson:null,index:0,revealed:new Set(),selected:null,placed:new Map(),sprites:[]};
const els={stage:$('#stage'),nav:$('#chapterNav'),loading:$('#loading'),prev:$('#prevBtn'),next:$('#nextBtn'),chapterLabel:$('#chapterLabel'),stepLabel:$('#stepLabel'),fill:$('#progressFill'),promptTitle:$('#promptTitle'),promptText:$('#promptText'),promptHint:$('#promptHint'),promptIcon:$('#promptIcon'),promptAction:$('#promptAction'),teacher:$('#teacherDrawer'),teacherContent:$('#teacherContent'),scrim:$('#scrim')};

function current(){return state.lesson.steps[state.index]}
function stepIndex(id){return state.lesson.steps.findIndex(s=>s.id===id)}
function sectionStart(i){const n=stepIndex(SECTIONS[i].start);return n>=0?n:0}
function sectionIndexFor(i=state.index){let section=0;for(let s=0;s<SECTIONS.length;s++){const start=sectionStart(s);if(i>=start)section=s;else break}return section}

function loadSprite(base64){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Slayt görselleri açılamadı.'));img.src=`data:image/webp;base64,${base64.trim()}`})}
async function loadVisualAssets(){
  const [r1,r2]=await Promise.all([fetch('assets/w01/slides-sprite-1.b64',{cache:'force-cache'}),fetch('assets/w01/slides-sprite-2.b64',{cache:'force-cache'})]);
  if(!r1.ok||!r2.ok)throw new Error('Slayt görselleri yüklenemedi.');
  const [b1,b2]=await Promise.all([r1.text(),r2.text()]);
  state.sprites=await Promise.all([loadSprite(b1),loadSprite(b2)]);
}

function renderVisual(section){
  return `<div class="visual-slide" data-visual="${section+1}"><canvas class="visual-canvas" aria-label="${esc(SECTIONS[section].title)}"></canvas></div>`;
}
function paintVisual(section){
  const canvas=els.stage.querySelector('.visual-canvas');if(!canvas||!state.sprites.length)return;
  const sprite=state.sprites[section<5?0:1];const frame=section%5;
  const rect=els.stage.getBoundingClientRect();const dpr=Math.min(window.devicePixelRatio||1,2);
  const W=Math.max(1,Math.round(rect.width*dpr)),H=Math.max(1,Math.round(rect.height*dpr));canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.fillStyle='#071525';ctx.fillRect(0,0,W,H);
  const srcW=960,srcH=540;const scale=Math.min(W/srcW,H/srcH);const dw=srcW*scale,dh=srcH*scale;const dx=(W-dw)/2,dy=(H-dh)/2;
  ctx.drawImage(sprite,0,frame*srcH,srcW,srcH,dx,dy,dw,dh);
}

function stageBrand(){return `<div class="stage-brand"><img src="../brand/devre-karakteri.svg" alt=""><span>Keskin<span>Lab</span></span></div>`}
function header(step){return `<div class="slide-head"><span class="step-kicker">ETKİLEŞİMLİ DURAK · ${esc(step.student?.label||step.tymm?.phaseLabel||'DERS AKIŞI')}</span><span class="step-count">ADIM ${pad(state.index+1)} / ${pad(state.lesson.steps.length)}</span></div>`}
function renderQuestion(step){const open=state.revealed.has(step.id);const reveal=step.reveal?`<div class="reveal ${open?'open':''}"><b>${esc(step.reveal.title||'')}</b><p>${esc(step.reveal.text||'')}</p></div>`:'';return `<div class="slide interaction-slide">${header(step)}<div class="slide-body"><h1 class="big-title">${esc(step.student?.title||'')}</h1><div class="accent-line"></div>${step.student?.lead?`<p class="lead">${esc(step.student.lead)}</p>`:''}${reveal}</div>${stageBrand()}</div>`}
function renderConcepts(step){return `<div class="slide interaction-slide">${header(step)}<div class="slide-body"><h1 class="big-title">${esc(step.student?.title||'')}</h1><div class="concepts">${(step.concepts||[]).map(c=>`<div class="concept"><b>${esc(c.term)}</b><p>${esc(c.copy)}</p></div>`).join('')}</div></div>${stageBrand()}</div>`}
function renderTask(step){return `<div class="slide interaction-slide">${header(step)}<div class="slide-body"><h1 class="big-title">${esc(step.student?.title||'')}</h1>${step.student?.foot?`<p class="lead">${esc(step.student.foot)}</p>`:''}<div class="task-list">${(step.prompts||[]).map((p,i)=>`<div class="task"><span>${pad(i+1)}</span><b>${esc(p)}</b></div>`).join('')}</div></div>${stageBrand()}</div>`}
function renderCompare(step){const a=step.compare?.left||{},b=step.compare?.right||{};return `<div class="slide interaction-slide">${header(step)}<div class="slide-body"><h1 class="big-title">${esc(step.student?.title||'')}</h1><div class="compare"><div class="compare-card"><small>${esc(a.label||'GEÇMİŞ')}</small><h3>${esc(a.title||'')}</h3><p>${esc(a.copy||'')}</p></div><div class="compare-arrow">→</div><div class="compare-card"><small>${esc(b.label||'GÜNÜMÜZ')}</small><h3>${esc(b.title||'')}</h3><p>${esc(b.copy||'')}</p></div></div>${step.compare?.caption?`<p class="lead">${esc(step.compare.caption)}</p>`:''}</div>${stageBrand()}</div>`}
function renderCheckpoint(step){return `<div class="checkpoint"><div class="slide interaction-slide">${header(step)}<div class="slide-body"><h1 class="big-title">${esc(step.student?.title||'')}</h1><div class="accent-line"></div><p class="lead">${esc(step.student?.lead||'')}</p></div>${stageBrand()}</div></div>`}
function renderActivity(step){const used=new Set([...state.placed.values()].flat());return `<div class="slide interaction-slide activity-slide">${header(step)}<div class="slide-body"><div class="activity-eyebrow">TAHTADA BİRLİKTE YAPIN</div><h1 class="big-title activity-title">${esc(step.student?.title||'')}</h1>${step.student?.lead?`<p class="lead activity-lead">${esc(step.student.lead)}</p>`:''}<div class="activity-grid"><div class="item-pool">${(step.items||[]).map(x=>`<button class="item-btn ${state.selected===x.id?'selected':''} ${used.has(x.id)?'used':''}" data-item="${esc(x.id)}"><b>${esc(x.label)}</b><small>${esc(x.hint||'')}</small></button>`).join('')}</div><div class="zones">${(step.categories||[]).map(z=>`<button class="zone" data-zone="${esc(z.id)}"><b>${esc(z.label.toLocaleUpperCase('tr-TR'))}</b><div class="chips">${(state.placed.get(z.id)||[]).map(id=>{const it=step.items.find(x=>x.id===id);return `<span class="chip">${esc(it?.label||id)}</span>`}).join('')}</div></button>`).join('')}</div></div></div>${stageBrand()}</div>`}

function renderStage(){
  const step=current();const section=sectionIndexFor();let html='';let visual=false;
  if(step.layout==='activity'){html=renderActivity(step)}
  else if(state.sprites.length){html=renderVisual(section);visual=true}
  else if(step.layout==='question'||step.layout==='exit')html=renderQuestion(step);
  else if(step.layout==='concepts')html=renderConcepts(step);
  else if(step.layout==='task')html=renderTask(step);
  else if(step.layout==='compare')html=renderCompare(step);
  else if(step.layout==='checkpoint')html=renderCheckpoint(step);
  else html=renderQuestion(step);
  els.stage.classList.toggle('visual-mode',visual);els.stage.innerHTML=html;if(visual)requestAnimationFrame(()=>paintVisual(section));bindActivity(step);
}
function bindActivity(step){if(step.layout!=='activity')return;els.stage.querySelectorAll('[data-item]').forEach(b=>b.addEventListener('click',()=>{if(b.classList.contains('used'))return;state.selected=state.selected===b.dataset.item?null:b.dataset.item;render()}));els.stage.querySelectorAll('[data-zone]').forEach(b=>b.addEventListener('click',()=>{if(!state.selected)return;const arr=state.placed.get(b.dataset.zone)||[];arr.push(state.selected);state.placed.set(b.dataset.zone,arr);state.selected=null;render()}))}

function renderNav(){const active=sectionIndexFor();els.nav.innerHTML=SECTIONS.map((s,i)=>`<button class="chapter-btn ${i===active?'active':''}" data-section="${i}" data-n="${pad(i+1)}"><strong>${esc(s.title)}</strong><small>${esc(s.sub)}</small></button>`).join('');els.nav.querySelectorAll('[data-section]').forEach(b=>b.addEventListener('click',()=>go(sectionStart(Number(b.dataset.section)))))}
function renderPrompt(){
  const s=current(),m=s.layout;const presets={question:['?','DÜŞÜN VE PAYLAŞ','Önce öğrenci sesi; ardından ders devam eder.','SOR · BEKLE · PAYLAŞ'],activity:['↔','TAHTADA BİRLİKTE YAPIN','Bir kart seç, sonra uygun alana dokun.','DOKUN · SEÇ · YERLEŞTİR'],compare:['↔','KARŞILAŞTIR','Benzerlik ve farklılıkları öğrenciler söylesin.','BAK · KARŞILAŞTIR · SÖYLE'],task:['✓','GÖREV','Yönergeyi okuyun ve uygulamaya geçin.','UYGULA · PAYLAŞ'],checkpoint:['●','DEVAM NOKTASI','Dersi burada bırakabilir veya buradan yeniden başlayabilirsiniz.','BÖLÜM BAŞLANGICI'],concepts:['→','KAVRAMLARI KUR','Kavramları örneklerle ilişkilendirerek ilerleyin.','GÖSTER · KONUŞ · DEVAM ET'],exit:['✓','ÇIKIŞ BİLETİ','Öğrenmeyi kısa bir öğrenci cevabıyla görünür kılın.','DÜŞÜN · CEVAPLA']};
  const p=presets[m]||['→','DERS AKIŞI','Bu ekran anlatım ve gözlem için kullanılır.','DEVAM ET'];
  els.promptIcon.textContent=p[0];els.promptTitle.textContent=s.student?.title||p[1];els.promptText.textContent=s.student?.lead||s.student?.foot||p[2];els.promptHint.textContent=p[3];
  const hasReveal=!!s.reveal;els.promptAction.hidden=!hasReveal;if(hasReveal){els.promptAction.textContent=state.revealed.has(s.id)?'CEVABI KAPAT':'CEVABI GÖSTER';els.promptAction.onclick=()=>{state.revealed.has(s.id)?state.revealed.delete(s.id):state.revealed.add(s.id);const r=s.reveal;if(state.revealed.has(s.id)){els.promptText.textContent=`${r.title||''} ${r.text||''}`.trim()}else{els.promptText.textContent=s.student?.lead||p[2]}}}
}
function renderTeacher(){const s=current(),t=s.teacher||{},refs=s.sourceRefs||[];els.teacherContent.innerHTML=`<div class="teacher-block"><small>ÖĞRETMEN NOTU</small><p>${esc(t.note||'Bu adım için ek not yok.')}</p></div>${t.timeHint?`<div class="teacher-block"><small>SÜRE İPUCU</small><p>${esc(t.timeHint)}</p></div>`:''}<div class="teacher-block"><small>PEDAGOJİK ROL</small><p>${esc(s.tymm?.phaseLabel||s.mode||'')}</p></div>${refs.length?`<div class="teacher-block"><small>KAYNAK BAĞLANTISI</small><p>${refs.map(esc).join(' · ')}</p></div>`:''}`}
function updateProgress(){const section=sectionIndexFor();els.chapterLabel.textContent=SECTIONS[section].title.toLocaleUpperCase('tr-TR');els.stepLabel.textContent=`${pad(section+1)} / ${pad(SECTIONS.length)}`;els.fill.style.width=`${((section+1)/SECTIONS.length)*100}%`;els.prev.disabled=state.index===0;els.next.innerHTML=state.index===state.lesson.steps.length-1?'✓':'<span>SONRAKİ</span> →'}
function updateUrl(){const u=new URL(location.href);u.searchParams.set('course','5-sinif');u.searchParams.set('week','01');u.searchParams.set('step',current().id);history.replaceState(null,'',u)}
function render(){renderStage();renderNav();renderPrompt();renderTeacher();updateProgress();updateUrl()}
function go(i){if(!Number.isInteger(i)||i<0||i>=state.lesson.steps.length)return;state.index=i;state.selected=null;state.placed=new Map();render()}
function openDrawer(){els.teacher.classList.add('open');els.teacher.setAttribute('aria-hidden','false');els.scrim.hidden=false}
function closeDrawer(){els.teacher.classList.remove('open');els.teacher.setAttribute('aria-hidden','true');els.scrim.hidden=true}

async function load(){
  try{
    const lessonReq=fetch('lessons/5-sinif/hafta-01.json',{cache:'no-store'});
    const [,lessonResponse]=await Promise.all([loadVisualAssets(),lessonReq]);
    if(!lessonResponse.ok)throw new Error(`Ders verisi yüklenemedi (${lessonResponse.status})`);
    state.lesson=await lessonResponse.json();if(!Array.isArray(state.lesson.steps)||!state.lesson.steps.length)throw new Error('Ders adımları bulunamadı.');
    const requested=new URL(location.href).searchParams.get('step');const i=requested?stepIndex(requested):-1;state.index=i>=0?i:0;els.loading.classList.add('hidden');render();
  }catch(e){console.error(e);els.loading.innerHTML=`<div class="loading-mark">!</div><strong>Ders açılamadı</strong><span>${esc(e.message)}</span>`}
}

els.prev.addEventListener('click',()=>go(state.index-1));els.next.addEventListener('click',()=>{if(state.index<state.lesson.steps.length-1)go(state.index+1)});$('#teacherBtn').addEventListener('click',openDrawer);$('#notesBtn').addEventListener('click',openDrawer);$('#closeDrawer').addEventListener('click',closeDrawer);els.scrim.addEventListener('click',closeDrawer);$('#fullscreenBtn').addEventListener('click',async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen()}catch{}});
window.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer();if(e.target.matches('button,input,textarea,select'))return;if(e.key==='ArrowRight'||e.key==='PageDown')go(state.index+1);if(e.key==='ArrowLeft'||e.key==='PageUp')go(state.index-1)});
let resizeTimer=0;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(els.stage.querySelector('.visual-canvas'))paintVisual(sectionIndexFor())},80)});
load();
})();
