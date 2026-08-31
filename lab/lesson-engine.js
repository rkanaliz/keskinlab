(()=>{
'use strict';

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const app=$('#lessonApp');
const stage=$('#slideStage');
const shell=$('#slideViewport');
const loading=$('#loadingState');
const chapterPanel=$('#chapterPanel');
const teacherPanel=$('#teacherPanel');
const scrim=$('#panelScrim');
const params=new URL(location.href).searchParams;

let lesson=null;
let current=0;
let revealOpen=false;
let classifyState={selected:null,placed:new Map()};

const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');

function iconSvg(name){
  const common='fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';
  const icons={
    phone:`<rect x="22" y="8" width="28" height="48" rx="5"/><path d="M29 14h14M32 49h8"/>`,
    laptop:`<rect x="12" y="13" width="52" height="34" rx="3"/><path d="M7 53h62l-5 6H12z"/>`,
    atm:`<rect x="13" y="8" width="50" height="53" rx="3"/><rect x="20" y="15" width="36" height="16" rx="1"/><path d="M23 40h30M23 47h18M49 47h4"/>`,
    navigation:`<path d="M37 8c-12 0-21 9-21 21 0 17 21 35 21 35s21-18 21-35C58 17 49 8 37 8z"/><circle cx="37" cy="29" r="7"/>`,
    board:`<rect x="10" y="12" width="56" height="38" rx="2"/><path d="M22 59h32M28 50l-4 9M48 50l4 9"/><circle cx="58" cy="43" r="2"/>`,
    health:`<rect x="13" y="14" width="50" height="45" rx="5"/><path d="M23 36h8l4-9 7 19 5-10h7"/>`,
    scanner:`<path d="M13 21h50v34H13zM21 14h34v7"/><path d="M23 32h30M23 39h30M23 46h18"/>`,
    typewriter:`<path d="M18 18h39l5 26H13z"/><path d="M20 44h35l6 12H14zM26 25h4M35 25h4M44 25h4M24 33h25"/>`,
    landline:`<path d="M20 22c10-9 24-9 34 0l-6 8c-7-5-15-5-22 0z"/><rect x="17" y="34" width="40" height="23" rx="4"/><circle cx="37" cy="45" r="6"/>`,
    cassette:`<rect x="12" y="17" width="52" height="40" rx="4"/><circle cx="28" cy="36" r="7"/><circle cx="48" cy="36" r="7"/><path d="M24 50h28"/>`,
    desktop:`<rect x="12" y="12" width="45" height="33" rx="2"/><path d="M28 45v9M20 55h28"/><rect x="60" y="18" width="8" height="37" rx="1"/>`,
    message:`<path d="M12 13h52v38H34L21 61V51h-9z"/><path d="M22 26h32M22 34h24"/>`,
    info:`<circle cx="37" cy="37" r="28"/><path d="M37 33v18M37 23h.01"/>`
  };
  return `<svg class="tech-icon" viewBox="0 0 74 74" aria-hidden="true"><g ${common}>${icons[name]||icons.info}</g></svg>`;
}

function baseChrome(step,index){
  const total=lesson?.steps?.length||index+1;
  return `<div class="s-grid"></div><div class="s-circuit"></div><div class="s-brand">KESKİNLAB · 5. SINIF BTY</div><div class="s-step">${pad(index+1)} / ${pad(total)}</div>`;
}

function scaleStage(){
  if(!shell||!stage)return;
  const r=shell.getBoundingClientRect();
  const scale=Math.min(r.width/1920,r.height/1080);
  stage.style.transform=`translate(-50%,-50%) scale(${Math.max(.1,scale)})`;
}

function chapterOf(step){return lesson.chapters.find(c=>c.id===step.chapter)||lesson.chapters[0]}
function indexByStepId(id){return lesson.steps.findIndex(s=>s.id===id)}
function firstIndexOfChapter(id){return lesson.steps.findIndex(s=>s.chapter===id)}

function updateProgress(){
  const step=lesson.steps[current],chapter=chapterOf(step);
  $('#lessonMeta').textContent=`5. SINIF · BTY · HAFTA ${pad(lesson.week)} · ${lesson.title.toLocaleUpperCase('tr-TR')}`;
  const hour=step.lessonHour?` · ${step.lessonHour}. DERS`:'';
  $('#chapterLabel').textContent=`${chapter?.title||'DERS'}${hour}`.toLocaleUpperCase('tr-TR');
  $('#stepLabel').textContent=`${pad(current+1)} / ${pad(lesson.steps.length)}`;
  $('#progressFill').style.width=`${((current+1)/lesson.steps.length)*100}%`;
  $('#prevButton').disabled=current===0;
  $('#prevButton').style.opacity=current===0?'.35':'1';
  $('#nextButton').textContent=current===lesson.steps.length-1?'✓':'→';
}

function updateUrl(){
  const u=new URL(location.href);u.searchParams.set('course',lesson.course);u.searchParams.set('week',pad(lesson.week));u.searchParams.set('step',lesson.steps[current].id);history.replaceState(null,'',u);
  try{localStorage.setItem(`keskinlab:last:${lesson.id}`,lesson.steps[current].id)}catch{}
}

function renderTeacher(){
  const step=lesson.steps[current];
  const t=step.teacher||{};
  const refs=(step.sourceRefs||[]).map(x=>`<span class="teacher-tag">${escapeHtml(x)}</span>`).join('');
  $('#teacherContent').innerHTML=`
    <div class="teacher-block"><div class="teacher-label">ÖĞRETMEN NOTU</div><p>${escapeHtml(t.note||'Bu adım için ek öğretmen notu yok.')}</p></div>
    ${t.timeHint?`<div class="teacher-block"><div class="teacher-label">SÜRE İPUCU</div><p>${escapeHtml(t.timeHint)}</p></div>`:''}
    <div class="teacher-block"><div class="teacher-label">TYMM / PEDAGOJİK ROL</div><p>${escapeHtml(step.tymm?.phaseLabel||step.mode||'')}</p></div>
    ${t.support?`<div class="teacher-block"><div class="teacher-label">DESTEKLEME · GEREKİRSE</div><p>${escapeHtml(t.support)}</p></div>`:''}
    ${t.enrichment?`<div class="teacher-block"><div class="teacher-label">ZENGİNLEŞTİRME · GEREKİRSE</div><p>${escapeHtml(t.enrichment)}</p></div>`:''}
    ${step.evidence?`<div class="teacher-block"><div class="teacher-label">ÖĞRENME KANITI</div><p>Bu adımda öğrencinin açıklaması, sınıflandırması veya ürünü süreç içi öğrenme kanıtı olarak gözlenebilir. Sistem öğrenci verisi kaydetmez.</p></div>`:''}
    ${refs?`<div class="teacher-block"><div class="teacher-label">KAYNAK BAĞLANTISI</div><div class="teacher-tags">${refs}</div></div>`:''}
  `;
}

function renderChapters(){
  const step=lesson.steps[current];
  $('#chapterList').innerHTML=lesson.chapters.map((c,i)=>{
    const first=firstIndexOfChapter(c.id),count=lesson.steps.filter(s=>s.chapter===c.id).length;
    return `<button type="button" class="chapter-jump ${step.chapter===c.id?'active':''}" data-chapter="${escapeHtml(c.id)}"><span class="num">${pad(i+1)}</span><strong>${escapeHtml(c.title)}</strong><span>${count} ADIM</span></button>`;
  }).join('');
  $$('[data-chapter]',chapterPanel).forEach(b=>b.onclick=()=>{const i=firstIndexOfChapter(b.dataset.chapter);if(i>=0){go(i);closePanels()}});
}

function renderQuestion(step,index){
  const visual=(step.visualItems||[]).length?`<div style="display:flex;gap:22px;align-items:center;margin-top:42px">${step.visualItems.map(v=>`<div style="width:150px;height:150px;display:grid;place-items:center;border-bottom:2px solid rgba(18,24,43,.14);color:var(--teal2)">${iconSvg(v.icon)}<span style="display:none">${escapeHtml(v.label)}</span></div>`).join('')}</div>`:'';
  stage.className='slide-stage layout-question';
  stage.innerHTML=`${baseChrome(step,index)}<div class="content"><div class="prompt-tag">${escapeHtml(step.student?.label||'DÜŞÜN')}</div><h1 class="s-question">${escapeHtml(step.student?.title)}</h1>${step.student?.lead?`<p class="s-lead">${escapeHtml(step.student.lead)}</p>`:''}${visual}${step.reveal?`<div class="s-reveal ${revealOpen?'is-visible':''}" id="revealBox"><strong>${escapeHtml(step.reveal.title||'')}</strong><p>${escapeHtml(step.reveal.text||'')}</p></div>`:''}</div>${step.reveal?`<button type="button" class="s-action" id="revealButton">${revealOpen?'AÇIK':'CEVABI GÖSTER'}</button>`:''}`;
  $('#revealButton')?.addEventListener('click',()=>showReveal());
}

function renderConcepts(step,index){
  stage.className='slide-stage layout-concepts';
  stage.innerHTML=`${baseChrome(step,index)}<div class="content"><div class="s-kicker">${escapeHtml(step.student?.label||'KAVRAMLARI KUR')}</div><h1 class="s-title">${escapeHtml(step.student?.title)}</h1><div>${(step.concepts||[]).map((c,i)=>`<div class="concept-line"><div><div class="concept-code">0${i+1}</div><div class="concept-word">${escapeHtml(c.term)}</div></div><div class="concept-copy">${escapeHtml(c.copy)}</div></div>`).join('')}</div></div>`;
}

function renderActivity(step,index){
  classifyState.selected=null;classifyState.placed=new Map();
  drawActivity(step,index);
}

function drawActivity(step,index){
  const placedIds=new Set([...classifyState.placed.values()].flat());
  stage.className='slide-stage layout-activity';
  stage.innerHTML=`${baseChrome(step,index)}<div class="content"><div class="activity-head"><div><div class="s-kicker">${escapeHtml(step.student?.label||'ŞİMDİ SİZİN SIRANIZ')}</div><h1 class="s-title">${escapeHtml(step.student?.title)}</h1></div><div class="activity-help">${escapeHtml(step.student?.lead||'Bir kart seç, sonra uygun gördüğün kullanım alanına dokun.')}</div></div><div class="activity-board"><div class="activity-pool">${step.items.map(item=>`<button type="button" class="tech-item ${classifyState.selected===item.id?'selected':''} ${placedIds.has(item.id)?'used':''}" data-item="${escapeHtml(item.id)}">${iconSvg(item.icon)}<span><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.hint||'')}</small></span></button>`).join('')}</div><div class="activity-zones">${step.categories.map(cat=>{const ids=classifyState.placed.get(cat.id)||[];return `<button type="button" class="category-zone ${classifyState.selected?'active':''}" data-zone="${escapeHtml(cat.id)}"><b>${escapeHtml(cat.label.toLocaleUpperCase('tr-TR'))}</b><div class="zone-items">${ids.map(id=>{const item=step.items.find(x=>x.id===id);return `<span class="placed-item">${escapeHtml(item?.label||id)}</span>`}).join('')}</div></button>`}).join('')}</div></div></div><div class="activity-status">${classifyState.selected?'Şimdi bir kullanım alanı seç.':'Kartlardan birini seçerek başla. Tek bir doğru sınıflandırma dayatılmıyor; gerekçen önemli.'}</div><button type="button" class="s-action" id="resetActivity">SIFIRLA</button>`;
  $$('[data-item]',stage).forEach(b=>b.onclick=()=>{if(b.classList.contains('used'))return;classifyState.selected=classifyState.selected===b.dataset.item?null:b.dataset.item;drawActivity(step,index)});
  $$('[data-zone]',stage).forEach(b=>b.onclick=()=>{if(!classifyState.selected)return;const arr=classifyState.placed.get(b.dataset.zone)||[];arr.push(classifyState.selected);classifyState.placed.set(b.dataset.zone,arr);classifyState.selected=null;drawActivity(step,index)});
  $('#resetActivity')?.addEventListener('click',()=>renderActivity(step,index));
}

function renderCompare(step,index){
  const a=step.compare?.left||{},b=step.compare?.right||{};
  stage.className='slide-stage layout-compare';
  stage.innerHTML=`${baseChrome(step,index)}<div class="content"><div class="s-kicker">${escapeHtml(step.student?.label||'KARŞILAŞTIR')}</div><h1 class="s-title">${escapeHtml(step.student?.title)}</h1><div class="compare-grid"><section class="compare-side"><div class="compare-label">${escapeHtml(a.label||'GEÇMİŞ')}</div><div class="compare-visual">${iconSvg(a.icon)}</div><h3>${escapeHtml(a.title)}</h3><p>${escapeHtml(a.copy||'')}</p></section><div class="compare-arrow">→</div><section class="compare-side"><div class="compare-label">${escapeHtml(b.label||'GÜNÜMÜZ')}</div><div class="compare-visual">${iconSvg(b.icon)}</div><h3>${escapeHtml(b.title)}</h3><p>${escapeHtml(b.copy||'')}</p></section></div><p class="compare-caption">${escapeHtml(step.compare?.caption||'')}</p></div>`;
}

function renderTask(step,index){
  stage.className='slide-stage layout-task';
  stage.innerHTML=`${baseChrome(step,index)}<div class="content"><div class="s-kicker">${escapeHtml(step.student?.label||'GRUP ÇALIŞMASI')}</div><h1 class="s-title">${escapeHtml(step.student?.title)}</h1><div class="task-list">${(step.prompts||[]).map((p,i)=>`<div class="task-row"><span>${pad(i+1)}</span><strong>${escapeHtml(p)}</strong></div>`).join('')}</div></div>${step.student?.foot?`<div class="task-foot">${escapeHtml(step.student.foot)}</div>`:''}`;
}

function renderCheckpoint(step,index){
  stage.className='slide-stage layout-checkpoint';
  stage.innerHTML=`${baseChrome(step,index)}<div class="content"><div class="checkpoint-no">${escapeHtml(step.student?.label||'CHECKPOINT')}</div><h1 class="checkpoint-title">${escapeHtml(step.student?.title)}</h1><p class="checkpoint-copy">${escapeHtml(step.student?.lead||'')}</p><div class="checkpoint-line"></div></div>`;
}

function renderExit(step,index){
  stage.className='slide-stage layout-exit';
  stage.innerHTML=`${baseChrome(step,index)}<div class="content"><div class="s-kicker">${escapeHtml(step.student?.label||'ÇIKIŞ BİLETİ')}</div><h1 class="s-title">${escapeHtml(step.student?.title)}</h1><div class="exit-list">${(step.items||[]).map((x,i)=>`<section class="exit-item"><span>${pad(i+1)}</span><strong>${escapeHtml(x.prompt)}</strong><small>${escapeHtml(x.hint||'')}</small></section>`).join('')}</div></div>`;
}

function renderCover(step,index){
  stage.className='slide-stage layout-cover';
  stage.innerHTML=`${baseChrome(step,index)}<div class="content"><div class="eyebrow">${escapeHtml(step.student?.label||'KESKİNLAB')}</div><h1 class="big">${escapeHtml(step.student?.title)}</h1>${step.student?.lead?`<p class="sub">${escapeHtml(step.student.lead)}</p>`:''}</div>`;
}

function render(){
  if(!lesson)return;
  const step=lesson.steps[current];
  revealOpen=false;
  if(step.layout==='question')renderQuestion(step,current);
  else if(step.layout==='concepts')renderConcepts(step,current);
  else if(step.layout==='activity')renderActivity(step,current);
  else if(step.layout==='compare')renderCompare(step,current);
  else if(step.layout==='task')renderTask(step,current);
  else if(step.layout==='checkpoint')renderCheckpoint(step,current);
  else if(step.layout==='exit')renderExit(step,current);
  else renderCover(step,current);
  updateProgress();renderTeacher();renderChapters();updateUrl();scaleStage();
}

function showReveal(){
  const step=lesson.steps[current];if(!step.reveal||revealOpen)return false;
  revealOpen=true;$('#revealBox')?.classList.add('is-visible');const btn=$('#revealButton');if(btn)btn.textContent='AÇIK';return true;
}

function next(){
  const step=lesson.steps[current];
  if(step.reveal&&!revealOpen){showReveal();return}
  if(current<lesson.steps.length-1)go(current+1);
}
function prev(){if(current>0)go(current-1)}
function go(i){if(!lesson)return;current=Math.max(0,Math.min(lesson.steps.length-1,i));closePanels();render()}

function openPanel(panel){closePanels();panel.classList.add('open');panel.setAttribute('aria-hidden','false');scrim.hidden=false}
function closePanels(){[chapterPanel,teacherPanel].forEach(p=>{p.classList.remove('open');p.setAttribute('aria-hidden','true')});scrim.hidden=true}

async function toggleFullscreen(){try{if(!document.fullscreenElement)await app.requestFullscreen();else await document.exitFullscreen()}catch(e){console.warn('Tam ekran açılamadı',e)}}

async function loadLesson(){
  const course=params.get('course')||'5-sinif';
  const week=params.get('week')||'01';
  if(course!=='5-sinif'||week!=='01')throw Error('Bu laboratuvar sürümünde yalnız 5. sınıf Hafta 01 tanımlı.');
  const url=`lessons/${course}/hafta-${week}.json`;
  const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error(`${url} → ${r.status}`);
  lesson=await r.json();
  if(!Array.isArray(lesson.steps)||!lesson.steps.length)throw Error('Ders adımları bulunamadı.');
  const requested=params.get('step');
  let i=requested?indexByStepId(requested):-1;
  if(i<0){try{const saved=localStorage.getItem(`keskinlab:last:${lesson.id}`);if(saved)i=indexByStepId(saved)}catch{}}
  current=i>=0?i:0;
  loading.classList.add('hidden');
  render();
}

$('#nextButton').onclick=next;
$('#prevButton').onclick=prev;
$('#chapterButton').onclick=()=>openPanel(chapterPanel);
$('#teacherButton').onclick=()=>openPanel(teacherPanel);
$('#fullscreenButton').onclick=toggleFullscreen;
$$('[data-close-panel]').forEach(b=>b.onclick=closePanels);
scrim.onclick=closePanels;

addEventListener('keydown',e=>{
  if(e.key==='Escape'&&(chapterPanel.classList.contains('open')||teacherPanel.classList.contains('open'))){closePanels();return}
  if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;
  if(e.key==='ArrowRight'||e.key==='PageDown'||e.key===' '){e.preventDefault();next()}
  if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();prev()}
  if(e.key.toLowerCase()==='t')openPanel(teacherPanel);
  if(e.key.toLowerCase()==='m')openPanel(chapterPanel);
});
addEventListener('resize',scaleStage);
new ResizeObserver(scaleStage).observe(shell);
addEventListener('popstate',()=>{if(!lesson)return;const id=new URL(location.href).searchParams.get('step');const i=indexByStepId(id);if(i>=0){current=i;render()}});

loadLesson().catch(err=>{
  console.error(err);loading.innerHTML=`<div class="loading-mark">!</div><strong>Ders açılamadı</strong><span>${escapeHtml(err.message)}</span>`;
});
})();