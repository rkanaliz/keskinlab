(()=>{
'use strict';
const stage=document.getElementById('stage');
const wrap=document.querySelector('.stage-wrap');
if(!stage||!wrap)return;

const CONFIG_URL='lessons/5-sinif/hafta-01-scenes.json';
const LESSON_URL='lessons/5-sinif/hafta-01-teacher.json';
let dataPromise=null,scheduled=false,sceneActive=false;

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const svg=body=>`<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">${body}</svg>`;
const marks={
  clock:svg('<circle cx="32" cy="32" r="23"/><path d="M32 18v16l11 7"/>'),
  process:svg('<path d="M10 20h34l-7-7M44 20l-7 7M54 44H20l7 7M20 44l7-7"/><circle cx="14" cy="44" r="4"/><circle cx="50" cy="20" r="4"/>'),
  search:svg('<circle cx="27" cy="27" r="17"/><path d="m40 40 14 14M20 23h14M20 30h10"/>'),
  message:svg('<path d="M9 12h46v31H29L17 53V43H9z"/><circle cx="23" cy="28" r="2"/><circle cx="32" cy="28" r="2"/><circle cx="41" cy="28" r="2"/>'),
  info:svg('<circle cx="32" cy="32" r="23"/><path d="M32 28v17M32 19h.1"/>'),
  group:svg('<circle cx="24" cy="25" r="8"/><circle cx="43" cy="27" r="6"/><path d="M9 49c2-11 28-11 30 0M36 45c2-7 16-7 19 0"/>'),
  question:svg('<path d="M22 23c1-9 19-10 20 1 1 8-10 8-10 16M32 49h.1"/>'),
  camera:svg('<rect x="8" y="18" width="35" height="28" rx="4"/><circle cx="25" cy="32" r="9"/><path d="m43 26 13-7v26l-13-7z"/>'),
  screen:svg('<rect x="7" y="10" width="50" height="35" rx="3"/><path d="M22 54h20M32 45v9"/>'),
  education:svg('<path d="M32 13c-7-5-15-6-24-3v38c9-3 17-2 24 4 7-6 15-7 24-4V10c-9-3-17-2-24 3z"/><path d="M32 13v39"/>'),
  health:svg('<path d="M32 53S9 40 9 22c0-11 14-15 23-4 9-11 23-7 23 4 0 18-23 31-23 31z"/><path d="M17 33h9l5-10 7 19 5-9h8"/>'),
  route:svg('<path d="M32 55s17-17 17-32a17 17 0 1 0-34 0c0 15 17 32 17 32z"/><circle cx="32" cy="23" r="6"/>'),
  finance:svg('<rect x="9" y="12" width="46" height="39" rx="4"/><path d="M9 23h46M18 36h12M18 43h20"/>'),
  media:svg('<rect x="8" y="14" width="48" height="36" rx="4"/><path d="m27 24 16 8-16 8z"/>')
};

function loadData(){
  if(dataPromise)return dataPromise;
  dataPromise=Promise.all([
    fetch(CONFIG_URL,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`Scene config ${r.status}`);return r.json()}),
    fetch(LESSON_URL,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`Lesson data ${r.status}`);return r.json()})
  ]).then(([config,lesson])=>({config,steps:new Map((lesson.steps||[]).map(s=>[s.id,s]))})).catch(err=>{console.error('[scene-engine]',err);return {config:{scenes:{}},steps:new Map()}});
  return dataPromise;
}
function currentStepId(){return new URL(location.href).searchParams.get('step')||''}
function currentStepCount(){return stage.querySelector('.step-count')?.textContent?.trim()||''}
function brand(){return `<div class="scene-pilot-brand"><img src="../brand/devre-karakteri.svg" alt=""><b>Keskin<span>Lab</span></b></div>`}
function student(step){return step?.student||{}}
function sceneTitle(scene,step){return scene.title||student(step).title||''}
function sceneLead(scene,step){return scene.lead||student(step).intro||student(step).cue||''}
function sceneLabel(scene,step){return scene.label||student(step).label||step?.tymm?.phaseLabel||'DERS SAHNESİ'}
function sceneQuestion(scene,step){return scene.question||student(step).question||student(step).cue||''}
function mark(name){return marks[name]||marks.info}
function numbered(items,cls='scene-card'){return (items||[]).map((x,i)=>`<article class="${cls}"><small>${String(i+1).padStart(2,'0')}</small><strong>${esc(x)}</strong></article>`).join('')}
function renderHead(scene,step,count){return `<header class="scene-pilot-head"><div><div class="scene-pilot-label">${esc(sceneLabel(scene,step))}</div><h1 class="scene-pilot-title">${esc(sceneTitle(scene,step))}</h1>${sceneLead(scene,step)?`<p class="scene-pilot-lead">${esc(sceneLead(scene,step))}</p>`:''}</div><div class="scene-pilot-step">${esc(count)}</div></header>`}
function frame(scene,step,count,body,footer='',extra=''){return `<div class="scene-pilot ${extra}" data-art="${esc(scene.art||'technology-archive')}"><div class="scene-pilot-inner">${renderHead(scene,step,count)}${body}${footer}${brand()}</div></div>`}

function renderCollection(scene,step,count){
  const lanes=scene.lanes||[];
  const cards=lanes.map((l,i)=>`<section class="collection-lane"><div class="collection-lane-code">${esc(l.code||String(i+1).padStart(2,'0'))} · ${esc(l.kicker||'DÜŞÜNME ALANI')}</div><div class="collection-mark">${mark(l.mark)}</div><h3>${esc(l.title)}</h3><p>${esc(l.prompt||'')}</p><div class="idea-slots"><div class="idea-slot"><b>FİKİR 01</b><span>Sınıftan bir örnek</span></div><div class="idea-slot"><b>FİKİR 02</b><span>Başka bir örnek</span></div>${scene.compact?'':`<div class="idea-slot"><b>FİKİR 03</b><span>Gerekçesi</span></div>`}</div></section>`).join('');
  const body=`<main class="collection-board" style="--scene-cols:${Math.max(1,lanes.length)}">${cards}</main>`;
  const footer=`<footer class="collection-footer"><strong>${esc(sceneQuestion(scene,step)||'Sınıftan fikirleri toplayın.')}</strong><span>${esc(scene.footer||'Önce öğrenci fikirleri gelsin; sonucu birlikte kuracağız.')}</span></footer>`;
  return frame(scene,step,count,body,footer,'scene-collection');
}
function renderTimelineObject(side,base,art){
  const data={...base,...art};
  const evidence=(data.evidence||[]).map(x=>`<span>${esc(x)}</span>`).join('');
  return `<section class="timeline-object ${side}"><div class="timeline-era">${esc(data.era||'')}</div><div class="object-stage">${data.object?`<img src="${esc(data.object)}" alt="${esc(data.title||'')}">`:''}</div><div><h3>${esc(data.title||'')}</h3><p class="timeline-object-copy">${esc(data.copy||'')}</p></div><div class="evidence-row">${evidence}</div></section>`;
}
function renderTimeline(scene,step,count){
  const cmp=student(step).compare||step.compare||{};
  const past={era:cmp.left?.label,title:cmp.left?.title,copy:cmp.left?.copy};
  const present={era:cmp.right?.label,title:cmp.right?.title,copy:cmp.right?.copy};
  const prompts=(scene.prompts||[]).map(p=>`<div class="timeline-prompt"><small>${esc(p.code)} · ${esc(p.label)}</small><strong>${esc(p.text)}</strong></div>`).join('');
  const body=`<main class="timeline-surface">${renderTimelineObject('past',past,scene.past||{})}<div class="timeline-spine"><div class="constant-need"><small>DEĞİŞMEYEN İHTİYAÇ</small><strong>${esc(scene.constant||'')}</strong></div><div class="constant-arrow">→</div></div>${renderTimelineObject('present',present,scene.present||{})}</main>`;
  return frame(scene,step,count,body,`<footer class="timeline-prompts">${prompts}</footer>`,'scene-timeline');
}
function renderBridge(scene,step,count){
  const nodes=(scene.nodes||[]).map((n,i)=>`<article class="bridge-node"><div class="bridge-mark">${mark(n.mark)}</div><small>${String(i+1).padStart(2,'0')} · ${esc(n.kicker||'ÖRNEK')}</small><h3>${esc(n.title)}</h3><p>${esc(n.copy||'')}</p></article>`).join('');
  const body=`<main class="bridge-surface"><div class="bridge-nodes">${nodes}</div><div class="bridge-core"><small>${esc(scene.coreKicker||'ORTAK BAĞ')}</small><strong>${esc(scene.core||'Bilgi · İletişim · İşlem')}</strong><span>${esc(scene.coreNote||'Farklı araçlar, ortak kavramlarla açıklanabilir.')}</span></div></main>`;
  const footer=sceneQuestion(scene,step)?`<footer class="scene-callout">${esc(sceneQuestion(scene,step))}</footer>`:'';
  return frame(scene,step,count,body,footer,'scene-bridge');
}
function renderConceptArchive(scene,step,count){
  const concepts=student(step).concepts||[];
  const cards=concepts.map((c,i)=>`<article class="concept-file"><small>${String(i+1).padStart(2,'0')} · KAVRAM</small><h3>${esc(c.term)}</h3><p>${esc(c.copy)}</p><span>${esc(c.example||'')}</span></article>`).join('');
  const body=`<main class="concept-files">${cards}<div class="concept-core"><small>ORTAK DOSYA</small><strong>Bilişim Teknolojileri</strong><span>Bilgi · işlem · iletişim · araç</span></div></main>`;
  return frame(scene,step,count,body,'','scene-concept-files');
}
function renderResearch(scene,step,count){
  const prompts=student(step).prompts||[];
  const body=`<main class="research-surface"><section class="research-route">${prompts.map((p,i)=>`<article><small>${String(i+1).padStart(2,'0')} · ${esc(scene.stepLabels?.[i]||'ARAŞTIR')}</small><strong>${esc(p)}</strong></article>`).join('')}</section><aside class="research-output"><small>${esc(scene.outputKicker||'HAZIRLIK SONUCU')}</small><strong>${esc(scene.output||student(step).closing||'Paylaşmaya hazır olun.')}</strong><div class="research-lines"><i></i><i></i><i></i></div></aside></main>`;
  const footer=student(step).closing?`<footer class="scene-callout">${esc(student(step).closing)}</footer>`:'';
  return frame(scene,step,count,body,footer,'scene-research');
}
function renderShare(scene,step,count){
  const points=student(step).points||[];
  const body=`<main class="share-surface"><section class="share-presenter"><small>SUNAN GRUP</small><div class="share-person-mark">${mark('group')}</div>${numbered(points,'share-point')}</section><section class="share-audience"><small>DİNLEYENLER</small><div class="share-question-mark">${mark('question')}</div><strong>${esc(scene.audiencePrompt||sceneQuestion(scene,step)||'Sunum sonunda bir soru sorun.')}</strong><span>${esc(scene.audienceNote||'Soru, anlatılanı daha iyi anlamaya yardım etmeli.')}</span></section></main>`;
  return frame(scene,step,count,body,'','scene-share');
}
function renderSummary(scene,step,count){
  const points=student(step).points||[];
  const body=`<main class="summary-strip">${points.map((p,i)=>`<article><small>${String(i+1).padStart(2,'0')}</small><div class="summary-mark">${mark(scene.marks?.[i]||['clock','search','process','info'][i%4])}</div><strong>${esc(p)}</strong></article>`).join('')}</main>`;
  const footer=sceneQuestion(scene,step)?`<footer class="scene-caution"><small>DİKKAT</small><strong>${esc(sceneQuestion(scene,step))}</strong></footer>`:'';
  return frame(scene,step,count,body,footer,'scene-summary');
}
function renderTransform(scene,step,count){
  const cmp=student(step).compare||step.compare||{};
  const stages=scene.stages||['ÇEKİM','AYIR','YERLEŞTİR'];
  const body=`<main class="transform-surface"><section class="transform-side green"><small>${esc(cmp.left?.label||'ÇEKİM')}</small><div class="transform-visual green-screen">${mark('camera')}</div><h3>${esc(cmp.left?.title||'')}</h3><p>${esc(cmp.left?.copy||'')}</p></section><div class="transform-middle">${stages.map((s,i)=>`<div><span>${String(i+1).padStart(2,'0')}</span><strong>${esc(s)}</strong></div>`).join('')}</div><section class="transform-side final"><small>${esc(cmp.right?.label||'SONUÇ')}</small><div class="transform-visual final-screen">${mark('screen')}</div><h3>${esc(cmp.right?.title||'')}</h3><p>${esc(cmp.right?.copy||'')}</p></section></main>`;
  const footer=`<footer class="scene-callout">${esc(cmp.caption||sceneQuestion(scene,step))}</footer>`;
  return frame(scene,step,count,body,footer,'scene-transform');
}
function renderGallery(scene,step,count){
  const points=student(step).points||[];
  const body=`<main class="example-gallery">${points.map((p,i)=>`<article><div class="gallery-mark">${mark(scene.marks?.[i]||['screen','camera','media','message'][i%4])}</div><small>${String(i+1).padStart(2,'0')} · KULLANIM</small><strong>${esc(p)}</strong></article>`).join('')}<div class="gallery-core"><small>ORTAK TEKNİK</small><strong>${esc(scene.core||'YEŞİL EKRAN')}</strong></div></main>`;
  const footer=sceneQuestion(scene,step)?`<footer class="scene-callout">${esc(sceneQuestion(scene,step))}</footer>`:'';
  return frame(scene,step,count,body,footer,'scene-gallery');
}
function renderProcessFlow(scene,step,count){
  const points=student(step).points||[];
  const body=`<main class="process-flow">${points.map((p,i)=>{const [title,...rest]=String(p).split('→');const copy=rest.join('→').trim();return `<article><small>${String(i+1).padStart(2,'0')} · ${esc(scene.kickers?.[i]||'SÜREÇ')}</small><div class="process-mark">${mark(scene.marks?.[i]||['camera','message','process','screen','media'][i%5])}</div><h3>${esc(title.trim())}</h3><p>${esc(copy)}</p></article>`}).join('')}</main>`;
  const footer=sceneQuestion(scene,step)?`<footer class="scene-callout">${esc(sceneQuestion(scene,step))}</footer>`:'';
  return frame(scene,step,count,body,footer,'scene-process');
}
function renderFieldMap(scene,step,count){
  const points=student(step).points||[];
  const body=`<main class="field-map"><div class="field-core"><small>SINIFLANDIRMA ÖLÇÜTÜ</small><strong>Kullanım amacı</strong><span>Aynı cihaz farklı amaçlarla farklı alanlara girebilir.</span></div>${points.map((p,i)=>{const [title,...rest]=String(p).split('→');return `<article><div class="field-mark">${mark(scene.marks?.[i]||['education','health','route','finance','message','media'][i%6])}</div><small>${String(i+1).padStart(2,'0')}</small><h3>${esc(title.trim())}</h3><p>${esc(rest.join('→').trim())}</p></article>`}).join('')}</main>`;
  const footer=sceneQuestion(scene,step)?`<footer class="scene-callout">${esc(sceneQuestion(scene,step))}</footer>`:'';
  return frame(scene,step,count,body,footer,'scene-fields');
}
function renderSplitContext(scene,step,count){
  const contexts=scene.contexts||[];
  const body=`<main class="split-context"><section><small>${esc(contexts[0]?.kicker||'BAĞLAM 01')}</small><div class="context-device">${mark(contexts[0]?.mark||'education')}</div><h3>${esc(contexts[0]?.title||'Eğitim')}</h3><p>${esc(contexts[0]?.copy||'Derste kullanıldığında eğitim amacı öne çıkar.')}</p></section><div class="same-device"><small>AYNI ARAÇ</small><strong>${esc(scene.object||'TABLET')}</strong><span>Kategori, kullanım amacına göre değişir.</span></div><section><small>${esc(contexts[1]?.kicker||'BAĞLAM 02')}</small><div class="context-device">${mark(contexts[1]?.mark||'media')}</div><h3>${esc(contexts[1]?.title||'Eğlence')}</h3><p>${esc(contexts[1]?.copy||'Oyun için kullanıldığında eğlence amacı öne çıkar.')}</p></section></main>`;
  const footer=`<footer class="scene-callout">${esc(sceneQuestion(scene,step))}</footer>`;
  return frame(scene,step,count,body,footer,'scene-split');
}
function renderContribution(scene,step,count){
  const prompts=student(step).prompts||[];
  const labels=scene.labels||['ALAN','TEKNOLOJİ','KATKI'];
  const body=`<main class="contribution-chain">${prompts.map((p,i)=>`<article><small>${String(i+1).padStart(2,'0')} · ${esc(labels[i]||'ADIM')}</small><div class="chain-mark">${mark(scene.marks?.[i]||['education','process','info'][i%3])}</div><strong>${esc(p)}</strong></article>`).join('')}<div class="chain-arrow a">→</div><div class="chain-arrow b">→</div></main>`;
  const footer=student(step).closing?`<footer class="scene-callout">${esc(student(step).closing)}</footer>`:'';
  return frame(scene,step,count,body,footer,'scene-contribution');
}
function renderExit(scene,step,count){
  const items=student(step).items||[];
  const body=`<main class="evidence-grid">${items.map((x,i)=>`<article><small>${String(i+1).padStart(2,'0')} · ${esc(scene.labels?.[i]||['KAVRAM','KARŞILAŞTIR','SINIFLANDIR'][i]||'KANIT')}</small><strong>${esc(x.prompt)}</strong><span>${esc(x.hint||'')}</span><div class="evidence-line"></div></article>`).join('')}</main>`;
  return frame(scene,step,count,body,'','scene-exit');
}

function renderScene(scene,step,count){
  const type=scene.archetype;
  if(type==='collection-board')return renderCollection(scene,step,count);
  if(type==='timeline')return renderTimeline(scene,step,count);
  if(type==='bridge-map')return renderBridge(scene,step,count);
  if(type==='concept-archive')return renderConceptArchive(scene,step,count);
  if(type==='research-desk')return renderResearch(scene,step,count);
  if(type==='share-stage')return renderShare(scene,step,count);
  if(type==='summary-strip')return renderSummary(scene,step,count);
  if(type==='transformation')return renderTransform(scene,step,count);
  if(type==='example-gallery')return renderGallery(scene,step,count);
  if(type==='process-flow')return renderProcessFlow(scene,step,count);
  if(type==='field-map')return renderFieldMap(scene,step,count);
  if(type==='split-context')return renderSplitContext(scene,step,count);
  if(type==='contribution-chain')return renderContribution(scene,step,count);
  if(type==='exit-evidence')return renderExit(scene,step,count);
  return '';
}
function fitScene(){
  if(!sceneActive)return;
  const r=wrap.getBoundingClientRect();if(!r.width||!r.height)return;
  const scale=Math.min(r.width/1600,r.height/900);
  stage.style.width='1600px';stage.style.height='900px';stage.style.transform=`translate(-50%,-50%) scale(${scale})`;
}
function restoreLegacyFit(){
  sceneActive=false;document.body.classList.remove('scene-pilot-focus');delete stage.dataset.scenePilot;stage.style.removeProperty('transform');
  const r=wrap.getBoundingClientRect();if(!r.width||!r.height)return;const ratio=16/9;let w=r.width,h=w/ratio;if(h>r.height){h=r.height;w=h*ratio}stage.style.width=`${Math.floor(w)}px`;stage.style.height=`${Math.floor(h)}px`;
}
async function apply(){
  scheduled=false;const id=currentStepId();const data=await loadData();if(id!==currentStepId())return;
  const scene=data.config.scenes?.[id],step=data.steps.get(id);if(!scene||!step){if(sceneActive)restoreLegacyFit();return}
  if(stage.dataset.scenePilot===id){sceneActive=true;fitScene();return}
  const count=currentStepCount();const html=renderScene(scene,step,count);if(!html)return;
  stage.dataset.scenePilot=id;stage.classList.remove('visual-mode');stage.innerHTML=html;sceneActive=true;document.body.classList.add('scene-pilot-focus');fitScene();
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply)}
new MutationObserver(schedule).observe(stage,{childList:true,subtree:true});
window.addEventListener('resize',()=>requestAnimationFrame(()=>sceneActive?fitScene():null));
window.addEventListener('popstate',schedule);
schedule();
})();