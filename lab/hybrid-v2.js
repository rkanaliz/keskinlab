(()=>{
'use strict';
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');

const state={lesson:null,index:0,revealed:new Set(),selected:null,activities:new Map(),checks:new Map(),drawerMode:'step'};
const els={
  stage:$('#stage'),nav:$('#chapterNav'),loading:$('#loading'),prev:$('#prevBtn'),next:$('#nextBtn'),
  chapterLabel:$('#chapterLabel'),stepLabel:$('#stepLabel'),fill:$('#progressFill'),
  promptTitle:$('#promptTitle'),promptText:$('#promptText'),promptHint:$('#promptHint'),promptIcon:$('#promptIcon'),promptAction:$('#promptAction'),
  teacher:$('#teacherDrawer'),teacherContent:$('#teacherContent'),drawerTitle:$('#drawerTitle'),scrim:$('#scrim')
};
const stageWrap=$('.stage-wrap');

function sections(){return state.lesson?.sections||[]}
function current(){return state.lesson.steps[state.index]}
function stepIndex(id){return state.lesson.steps.findIndex(s=>s.id===id)}
function sectionIndexFor(i=state.index){const sid=state.lesson.steps[i]?.section;const n=sections().findIndex(s=>s.id===sid);return n>=0?n:0}
function sectionStart(i){return stepIndex(sections()[i]?.start)}
function stageBrand(){return `<div class="stage-brand"><img src="../brand/devre-karakteri.svg" alt=""><span>Keskin<span>Lab</span></span></div>`}
function header(step){return `<div class="slide-head"><span class="step-kicker">${esc(step.student?.label||step.tymm?.phaseLabel||'DERS AKIŞI')}</span><span class="step-count">ADIM ${pad(state.index+1)} / ${pad(state.lesson.steps.length)}</span></div>`}

function fitStage(){
  if(!stageWrap||!els.stage)return;
  const r=stageWrap.getBoundingClientRect();if(!r.width||!r.height)return;
  const ratio=16/9;let w=r.width,h=w/ratio;
  if(h>r.height){h=r.height;w=h*ratio}
  els.stage.style.width=`${Math.floor(w)}px`;els.stage.style.height=`${Math.floor(h)}px`;
}

function renderVisual(step){
  const s=sections()[sectionIndexFor()];
  return `<div class="visual-slide"><img class="visual-image" src="${esc(s.slide)}" alt="${esc(s.title)}" data-slide-img></div>`;
}
function bindVisualFallback(step){
  const img=els.stage.querySelector('[data-slide-img]');if(!img)return;
  img.addEventListener('error',()=>{els.stage.classList.remove('visual-mode');els.stage.innerHTML=renderNarrative({...step,student:{...(step.student||{}),intro:'Görsel yüklenemedi; ders akışı bu ekran üzerinden devam edebilir.'}})},{once:true});
}

function renderDiscoveryBridge(step){
  const s=step.student||{};
  const specimens=[
    ['phone','AKILLI TELEFON','mesaj · görüntü · veri','İLETİŞİM'],
    ['atm','ATM','işlem bilgisi · hesap','BİLGİ İŞLEME'],
    ['board','AKILLI TAHTA','ders · içerik · paylaşım','BİLGİ + İLETİŞİM'],
    ['nav','NAVİGASYON','konum · rota · yönlendirme','ANLAMLI BİLGİ']
  ].map(x=>`<div class="specimen ${x[0]}"><small>${esc(x[3])}</small><b>${esc(x[1])}</b><span>${esc(x[2])}</span></div>`).join('');
  return `<div class="slide interaction-slide discovery-scene">${header(step)}<div class="slide-body discovery-layout"><div class="discovery-copy"><div class="scene-tag">KEŞİF MASASI · BAĞ KUR</div><h1 class="scene-title">${esc(s.title||'')}</h1><p class="scene-lead">${esc(s.intro||'')}</p></div><div class="discovery-map">${specimens}<div class="discovery-hub"><small>ORTAK DİLİMİZ</small><b>Bilgi · İletişim</b><span>ve teknolojinin yaptığı işlemler</span></div></div><div class="scene-question"><small>SONRAKİ ADIM</small><strong>${esc(s.question||'Bu ilişkileri konuşabilmek için önce beş temel kavramı tanıyalım.')}</strong></div></div>${stageBrand()}</div>`;
}

function renderConceptArchive(step){
  const s=step.student||{},concepts=s.concepts||[];
  const cards=concepts.map((c,i)=>`<article class="archive-card concept-pos-${i+1}"><span>${pad(i+1)}</span><div><h3>${esc(c.term)}</h3><p>${esc(c.copy)}</p>${c.example?`<small>${esc(c.example)}</small>`:''}</div></article>`).join('');
  return `<div class="slide interaction-slide concept-archive-scene">${header(step)}<div class="slide-body"><div class="concept-archive-head"><div><div class="scene-tag">TEKNOLOJİ ARŞİVİ · KAVRAM DOSYASI</div><h1 class="scene-title">${esc(s.title||'')}</h1><p class="scene-lead">${esc(s.intro||'')}</p></div><div class="archive-index"><small>ARŞİV NOTU</small><strong>Ezberleme → ilişkilendir</strong></div></div><div class="archive-board">${cards}<div class="archive-core"><small>ORTAK ALAN</small><b>Bilişim Teknolojileri</b><span>bilgi · işlem · iletişim</span></div></div></div>${stageBrand()}</div>`;
}

function renderArchiveCompare(step){
  const s=step.student||{},a=s.compare?.left||{},b=s.compare?.right||{},caption=s.compare?.caption||'';
  return `<div class="slide interaction-slide archive-compare-scene">${header(step)}<div class="slide-body"><div class="archive-compare-head"><div><div class="scene-tag">TEKNOLOJİ ARŞİVİ · ZAMAN İZİ</div><h1 class="scene-title">${esc(s.title||'')}</h1><p class="scene-lead">${esc(s.intro||'İki araç farklı dönemlere ait; önce neyi aynı amaçla yaptıklarına bakalım.')}</p></div><div class="need-badge"><small>DEĞİŞMEYEN İHTİYAÇ</small><b>Yazı üretmek</b></div></div><div class="archive-timeline"><article class="era-panel"><small>${esc(a.label||'GEÇMİŞ')}</small><h3>${esc(a.title||'')}</h3><p>${esc(a.copy||'')}</p><div class="device-sketch typewriter" aria-hidden="true"></div></article><div class="timeline-bridge"><small>ARAÇ DEĞİŞİYOR</small></div><article class="era-panel"><small>${esc(b.label||'GÜNÜMÜZ')}</small><h3>${esc(b.title||'')}</h3><p>${esc(b.copy||'')}</p><div class="device-sketch laptop" aria-hidden="true"></div></article></div><div class="compare-prompts"><div class="compare-prompt"><small>01 · BENZERLİK</small><b>İkisi de hangi ihtiyacı karşılıyor?</b></div><div class="compare-prompt"><small>02 · FARK</small><b>İşi yapma biçimi nasıl değişmiş?</b></div><div class="compare-prompt"><small>03 · SONUÇ</small><b>${esc(caption||'Değişmeyen ihtiyaç hangisi?')}</b></div></div></div>${stageBrand()}</div>`;
}

function renderProductionSystem(step){
  const s=step.student||{};
  const nodes=[
    ['camera','01 · ÇEKİM','Dijital kamera','Görüntüyü kaydeder.'],
    ['mic','02 · SES','Mikrofon','Sesi kaydeder.'],
    ['edit','03 · DÜZENLEME','Kurgu yazılımı','Görüntü ve sesi düzenler.'],
    ['green','04 · EFEKT','Yeşil ekran','Arka planın dijital olarak değiştirilmesini sağlar.'],
    ['broadcast','05 · İLETİM','Dijital yayın sistemi','İçeriği izleyiciye ulaştırır.']
  ].map(n=>`<article class="production-node"><small>${esc(n[1])}</small><h3>${esc(n[2])}</h3><p>${esc(n[3])}</p><div class="node-mark ${n[0]}" aria-hidden="true"></div></article>`).join('');
  return `<div class="slide interaction-slide production-scene">${header(step)}<div class="slide-body"><div class="production-head"><div><div class="scene-tag">PRODÜKSİYON DOSYASI · SİSTEMİ GÖR</div><h1 class="scene-title">${esc(s.title||'')}</h1><p class="scene-lead">${esc(s.intro||'')}</p></div><div class="production-stamp">TEK ARAÇ DEĞİL · BİRLİKTE ÇALIŞAN SİSTEM</div></div><div class="production-flow">${nodes}</div><div class="production-question">${esc(s.question||'Şimdi bu teknolojileri yaptıkları işe göre gruplayalım.')}</div></div>${stageBrand()}</div>`;
}

function renderNarrative(step){
  const s=step.student||{};
  const points=(s.points||[]).map((p,i)=>`<div class="story-point"><span>${pad(i+1)}</span><p>${esc(p)}</p></div>`).join('');
  return `<div class="slide interaction-slide rich-slide">${header(step)}<div class="slide-body rich-body"><div class="rich-copy"><h1 class="big-title">${esc(s.title||'')}</h1>${s.intro?`<p class="lead">${esc(s.intro)}</p>`:''}</div>${points?`<div class="story-grid">${points}</div>`:''}${s.question?`<div class="focus-question"><small>ŞİMDİ DÜŞÜN</small><strong>${esc(s.question)}</strong></div>`:''}</div>${stageBrand()}</div>`;
}
function renderQuestion(step){
  const s=step.student||{};const context=(s.context||[]).map(x=>`<div class="context-chip">${esc(x)}</div>`).join('');
  const open=state.revealed.has(step.id);const reveal=step.reveal?`<div class="reveal ${open?'open':''}"><b>${esc(step.reveal.title||'')}</b><p>${esc(step.reveal.text||'')}</p></div>`:'';
  return `<div class="slide interaction-slide question-slide">${header(step)}<div class="slide-body question-body"><div class="question-copy"><h1 class="big-title">${esc(s.title||'')}</h1>${s.intro?`<p class="lead">${esc(s.intro)}</p>`:''}${s.question?`<div class="focus-question"><small>SORU</small><strong>${esc(s.question)}</strong></div>`:''}${reveal}</div>${context?`<div class="context-panel"><small>DÜŞÜNÜRKEN</small><div class="context-grid">${context}</div></div>`:''}</div>${stageBrand()}</div>`;
}
function renderConcepts(step){
  const s=step.student||{};const concepts=(s.concepts||[]).map((c,i)=>`<article class="concept-card"><span>${pad(i+1)}</span><div><h3>${esc(c.term)}</h3><p>${esc(c.copy)}</p>${c.example?`<small>${esc(c.example)}</small>`:''}</div></article>`).join('');
  return `<div class="slide interaction-slide concepts-slide">${header(step)}<div class="slide-body"><h1 class="big-title compact-title">${esc(s.title||'')}</h1>${s.intro?`<p class="lead compact-lead">${esc(s.intro)}</p>`:''}<div class="concept-grid">${concepts}</div></div>${stageBrand()}</div>`;
}
function renderTask(step){
  const s=step.student||{};const prompts=(s.prompts||[]).map((p,i)=>`<div class="task-row"><span>${pad(i+1)}</span><strong>${esc(p)}</strong></div>`).join('');
  return `<div class="slide interaction-slide task-slide">${header(step)}<div class="slide-body"><h1 class="big-title compact-title">${esc(s.title||'')}</h1>${s.intro?`<p class="lead compact-lead">${esc(s.intro)}</p>`:''}<div class="task-grid">${prompts}</div>${s.closing?`<div class="closing-note">${esc(s.closing)}</div>`:''}</div>${stageBrand()}</div>`;
}
function renderCompare(step){
  const s=step.student||{},a=s.compare?.left||step.compare?.left||{},b=s.compare?.right||step.compare?.right||{},caption=s.compare?.caption||step.compare?.caption||'';
  return `<div class="slide interaction-slide compare-slide">${header(step)}<div class="slide-body"><h1 class="big-title compact-title">${esc(s.title||'')}</h1>${s.intro?`<p class="lead compact-lead">${esc(s.intro)}</p>`:''}<div class="compare"><div class="compare-card"><small>${esc(a.label||'GEÇMİŞ')}</small><h3>${esc(a.title||'')}</h3><p>${esc(a.copy||'')}</p></div><div class="compare-arrow">→</div><div class="compare-card"><small>${esc(b.label||'GÜNÜMÜZ')}</small><h3>${esc(b.title||'')}</h3><p>${esc(b.copy||'')}</p></div></div>${caption?`<div class="compare-question">${esc(caption)}</div>`:''}</div>${stageBrand()}</div>`;
}
function renderExit(step){
  const s=step.student||{};const items=(s.items||[]).map((x,i)=>`<div class="exit-card"><span>${pad(i+1)}</span><div><strong>${esc(x.prompt)}</strong><small>${esc(x.hint||'')}</small></div></div>`).join('');
  return `<div class="slide interaction-slide exit-slide">${header(step)}<div class="slide-body"><h1 class="big-title compact-title">${esc(s.title||'')}</h1>${s.intro?`<p class="lead compact-lead">${esc(s.intro)}</p>`:''}<div class="exit-grid">${items}</div></div>${stageBrand()}</div>`;
}

function activityMap(step){if(!state.activities.has(step.id))state.activities.set(step.id,new Map());return state.activities.get(step.id)}
function placedZone(step,itemId){for(const [zone,items] of activityMap(step).entries())if(items.includes(itemId))return zone;return null}
function activityStatus(step,itemId){return state.checks.get(step.id)?.status?.[itemId]||''}
function renderActivity(step){
  const s=step.student||{},map=activityMap(step),used=new Set([...map.values()].flat()),check=state.checks.get(step.id),placed=used.size,total=(step.items||[]).length;
  const items=(step.items||[]).map(x=>`<button class="item-btn ${state.selected?.step===step.id&&state.selected?.item===x.id?'selected':''} ${used.has(x.id)?'used':''}" data-item="${esc(x.id)}"><b>${esc(x.label)}</b><small>${esc(x.hint||'')}</small></button>`).join('');
  const zones=(step.categories||[]).map(z=>`<button class="zone" data-zone="${esc(z.id)}"><b>${esc(z.label.toLocaleUpperCase('tr-TR'))}</b><div class="chips">${(map.get(z.id)||[]).map(id=>{const it=step.items.find(x=>x.id===id),st=activityStatus(step,id);return `<span class="chip ${st}">${esc(it?.label||id)}</span>`}).join('')}</div></button>`).join('');
  const result=check?`<div class="activity-result ${check.allCorrect?'success':check.type==='partial'?'partial':'needs-work'}"><strong>${esc(check.message)}</strong>${check.detail?`<span>${esc(check.detail)}</span>`:''}</div>`:'';
  return `<div class="slide interaction-slide activity-slide">${header(step)}<div class="slide-body activity-body"><div class="activity-head"><div><div class="activity-eyebrow">TAHTADA BİRLİKTE YAPIN</div><h1 class="big-title activity-title">${esc(s.title||'')}</h1>${s.intro?`<p class="lead activity-lead">${esc(s.intro)}</p>`:''}</div><div class="activity-counter"><b>${placed}</b><span>/ ${total} YERLEŞTİRİLDİ</span></div></div><div class="activity-grid"><div class="item-pool">${items}</div><div class="zones">${zones}</div></div><div class="activity-actions">${result}<div class="activity-buttons"><button data-reset type="button">SIFIRLA</button>${step.interaction?.checkable?`<button class="check-btn" data-check type="button">KONTROL ET</button>`:''}</div></div></div>${stageBrand()}</div>`;
}
function checkActivity(step){
  const map=activityMap(step),used=new Set([...map.values()].flat()),total=step.items.length;
  if(used.size<total){state.checks.set(step.id,{type:'partial',allCorrect:false,status:{},message:'Önce tüm kartları yerleştirin.',detail:`${used.size}/${total} kart yerleştirildi.`});render();return}
  const status={};let correct=0;
  for(const item of step.items){const zone=placedZone(step,item.id),accepted=step.answerKey?.[item.id]||[];const ok=accepted.includes(zone);status[item.id]=ok?'correct':'wrong';if(ok)correct++}
  const allCorrect=correct===total;
  state.checks.set(step.id,{type:'checked',allCorrect,status,message:allCorrect?'Harika! Tüm eşleşmeler güçlü ve tutarlı.':`${correct}/${total} eşleşme güçlü görünüyor.`,detail:allCorrect?'Şimdi seçimlerinizi gerekçeleriyle sınıfça konuşun.':'Kırmızı işaretli eşleşmeleri yeniden düşünün; sonra tekrar kontrol edin.'});render();
}
function resetActivity(step){state.activities.set(step.id,new Map());state.checks.delete(step.id);state.selected=null;render()}
function bindActivity(step){
  if(step.layout!=='activity')return;
  els.stage.querySelectorAll('[data-item]').forEach(b=>b.addEventListener('click',()=>{if(b.classList.contains('used'))return;const next=b.dataset.item;state.selected=state.selected?.step===step.id&&state.selected?.item===next?null:{step:step.id,item:next};render()}));
  els.stage.querySelectorAll('[data-zone]').forEach(b=>b.addEventListener('click',()=>{if(!state.selected||state.selected.step!==step.id)return;const map=activityMap(step),arr=map.get(b.dataset.zone)||[];arr.push(state.selected.item);map.set(b.dataset.zone,arr);state.selected=null;state.checks.delete(step.id);render()}));
  els.stage.querySelector('[data-check]')?.addEventListener('click',()=>checkActivity(step));
  els.stage.querySelector('[data-reset]')?.addEventListener('click',()=>resetActivity(step));
}

function renderInteraction(step){
  if(step.id==='w01-kopru')return renderDiscoveryBridge(step);
  if(step.id==='w01-kavram-anlatimi')return renderConceptArchive(step);
  if(step.id==='w01-yazi-ihtiyaci')return renderArchiveCompare(step);
  if(step.id==='w01-sinema-tv-havuz')return renderProductionSystem(step);
  if(step.layout==='activity')return renderActivity(step);
  if(step.layout==='concepts')return renderConcepts(step);
  if(step.layout==='task')return renderTask(step);
  if(step.layout==='compare')return renderCompare(step);
  if(step.layout==='narrative')return renderNarrative(step);
  if(step.layout==='exit')return renderExit(step);
  return renderQuestion(step);
}
function renderStage(){
  const step=current(),visual=step.layout==='visual';
  els.stage.classList.toggle('visual-mode',visual);els.stage.innerHTML=visual?renderVisual(step):renderInteraction(step);
  if(visual)bindVisualFallback(step);bindActivity(step);requestAnimationFrame(fitStage);
}

function renderNav(){
  const active=sectionIndexFor();els.nav.innerHTML=sections().map((s,i)=>`<button class="chapter-btn ${i===active?'active':''}" data-section="${i}" data-n="${pad(i+1)}"><strong>${esc(s.title)}</strong><small>${esc(s.sub)}</small></button>`).join('');
  els.nav.querySelectorAll('[data-section]').forEach(b=>b.addEventListener('click',()=>go(sectionStart(Number(b.dataset.section)))));
}
function renderPrompt(){
  const s=current(),student=s.student||{};const presets={visual:['●','SINIFÇA',student.cue||'Görseli inceleyin ve devam edin.','GÖZLEMLE · KONUŞ'],question:['?','SIRAN SİZDE','Önce düşünün; sonra sınıfça paylaşın.','DÜŞÜN · PAYLAŞ'],activity:['↔','ETKİLEŞİM','Kartları yerleştirip etkinliği tamamlayın.','SEÇ · YERLEŞTİR · KONTROL ET'],compare:['↔','KARŞILAŞTIR','Benzerlik, farklılık ve değişmeyen ihtiyacı konuşun.','BAK · KARŞILAŞTIR'],task:['✓','GRUP GÖREVİ','Yönergeleri sırayla uygulayın.','ARAŞTIR · HAZIRLAN'],narrative:['→','DERS AKIŞI','Ekrandaki örnekleri birlikte inceleyin.','İNCELE · DEVAM ET'],concepts:['→','KAVRAMLAR','Kavramları örneklerle birlikte düşünün.','ANLA · ÖRNEKLE'],exit:['✓','ÇIKIŞ KANITI','Üç kısa görevle öğrenmeyi görünür kılın.','DÜŞÜN · AÇIKLA']};
  const p=presets[s.layout]||presets.narrative;els.promptIcon.textContent=p[0];els.promptTitle.textContent=p[1];els.promptText.textContent=student.cue||p[2];els.promptHint.textContent=p[3];
  const hasReveal=!!s.reveal;els.promptAction.hidden=!hasReveal;if(hasReveal){els.promptAction.textContent=state.revealed.has(s.id)?'CEVABI KAPAT':'CEVABI GÖSTER';els.promptAction.onclick=()=>{state.revealed.has(s.id)?state.revealed.delete(s.id):state.revealed.add(s.id);render()}}
}
function renderTeacherStep(){
  const s=current(),t=s.teacher||{},refs=s.sourceRefs||[];els.drawerTitle.textContent='Bu adımda';
  els.teacherContent.innerHTML=`<div class="teacher-block"><small>ÖĞRETMEN NOTU</small><p>${esc(t.note||'Bu adım için ek not yok.')}</p></div><div class="teacher-block"><small>PEDAGOJİK ROL</small><p>${esc(s.tymm?.phaseLabel||s.mode||'')}</p></div>${refs.length?`<div class="teacher-block"><small>KAYNAK BAĞLANTISI</small><p>${refs.map(esc).join(' · ')}</p></div>`:''}`;
}
function renderPreparation(){
  els.drawerTitle.textContent='Haftaya hazırlık';const req=(state.lesson.minimumRequirements||[]).map(x=>`<li>${esc(x)}</li>`).join(''),prep=(state.lesson.preparation||[]).map(x=>`<li>${esc(x)}</li>`).join('');
  els.teacherContent.innerHTML=`<div class="teacher-block"><small>MİNİMUM ÖN KOŞUL</small><ul class="teacher-list">${req}</ul></div><div class="teacher-block"><small>DERSTEN ÖNCE</small><ul class="teacher-list">${prep}</ul></div><div class="teacher-block"><small>BU HAFTA</small><p><b>${esc(state.lesson.learningOutcome?.code||'')}</b><br>${esc(state.lesson.learningOutcome?.text||'')}</p></div>`;
}
function updateProgress(){const section=sectionIndexFor();els.chapterLabel.textContent=sections()[section].title.toLocaleUpperCase('tr-TR');els.stepLabel.textContent=`BÖLÜM ${pad(section+1)} / ${pad(sections().length)}`;els.fill.style.width=`${((section+1)/sections().length)*100}%`;els.prev.disabled=state.index===0;els.next.innerHTML=state.index===state.lesson.steps.length-1?'✓':'<span>SONRAKİ</span> →'}
function updateUrl(){const u=new URL(location.href);u.searchParams.set('course','5-sinif');u.searchParams.set('week','01');u.searchParams.set('step',current().id);history.replaceState(null,'',u)}
function render(){renderStage();renderNav();renderPrompt();if(state.drawerMode==='prep')renderPreparation();else renderTeacherStep();updateProgress();updateUrl()}
function go(i){if(!Number.isInteger(i)||i<0||i>=state.lesson.steps.length)return;state.index=i;state.selected=null;state.drawerMode='step';render()}
function openDrawer(mode='step'){state.drawerMode=mode;mode==='prep'?renderPreparation():renderTeacherStep();els.teacher.classList.add('open');els.teacher.setAttribute('aria-hidden','false');els.scrim.hidden=false}
function closeDrawer(){els.teacher.classList.remove('open');els.teacher.setAttribute('aria-hidden','true');els.scrim.hidden=true}

async function load(){
  try{
    const r=await fetch('lessons/5-sinif/hafta-01-teacher.json',{cache:'no-store'});if(!r.ok)throw new Error(`Ders verisi yüklenemedi (${r.status})`);
    state.lesson=await r.json();if(!Array.isArray(state.lesson.steps)||!state.lesson.steps.length)throw new Error('Ders adımları bulunamadı.');
    const requested=new URL(location.href).searchParams.get('step'),i=requested?stepIndex(requested):-1;state.index=i>=0?i:0;els.loading.classList.add('hidden');render();fitStage();
  }catch(e){console.error(e);els.loading.innerHTML=`<div class="loading-mark">!</div><strong>Ders açılamadı</strong><span>${esc(e.message)}</span>`}
}

els.prev.addEventListener('click',()=>go(state.index-1));
els.next.addEventListener('click',()=>{if(state.index<state.lesson.steps.length-1)go(state.index+1)});
$('#teacherBtn').addEventListener('click',()=>openDrawer('step'));
$('#prepBtn').addEventListener('click',()=>openDrawer('prep'));
$('#closeDrawer').addEventListener('click',closeDrawer);els.scrim.addEventListener('click',closeDrawer);
$('#fullscreenBtn').addEventListener('click',async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen()}catch{}});
window.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer();if(e.target.matches('button,input,textarea,select'))return;if(e.key==='ArrowRight'||e.key==='PageDown')go(state.index+1);if(e.key==='ArrowLeft'||e.key==='PageUp')go(state.index-1)});
window.addEventListener('resize',fitStage);
if('ResizeObserver' in window)new ResizeObserver(fitStage).observe(stageWrap);
load();
})();