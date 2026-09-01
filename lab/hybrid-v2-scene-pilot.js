(()=>{
'use strict';
const stage=document.getElementById('stage');
const wrap=document.querySelector('.stage-wrap');
if(!stage||!wrap)return;

const CONFIG_URL='lessons/5-sinif/hafta-01-scenes.json';
let configPromise=null;
let scheduled=false;
let pilotActive=false;

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const svg=body=>`<svg viewBox="0 0 64 64" aria-hidden="true">${body}</svg>`;
const marks={
  clock:svg('<circle cx="32" cy="32" r="23"/><path d="M32 18v16l11 7"/><path d="M18 8l-7 8M46 8l7 8"/>'),
  process:svg('<path d="M10 20h34l-7-7M44 20l-7 7M54 44H20l7 7M20 44l7-7"/><circle cx="14" cy="44" r="4"/><circle cx="50" cy="20" r="4"/>'),
  search:svg('<circle cx="27" cy="27" r="17"/><path d="m40 40 14 14M20 23h14M20 30h10"/>'),
  message:svg('<path d="M9 12h46v31H29L17 53V43H9z"/><circle cx="23" cy="28" r="2"/><circle cx="32" cy="28" r="2"/><circle cx="41" cy="28" r="2"/>')
};

function loadConfig(){
  if(!configPromise)configPromise=fetch(CONFIG_URL,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`Scene config ${r.status}`);return r.json()}).catch(err=>{console.error('[scene-pilot]',err);return {scenes:{}}});
  return configPromise;
}
function currentStepId(){return new URL(location.href).searchParams.get('step')||''}
function currentStepCount(){return stage.querySelector('.step-count')?.textContent?.trim()||''}
function brand(){return `<div class="scene-pilot-brand"><img src="../brand/devre-karakteri.svg" alt=""><b>Keskin<span>Lab</span></b></div>`}

function renderHead(scene,count){
  return `<header class="scene-pilot-head"><div><div class="scene-pilot-label">${esc(scene.label||'DERS SAHNESİ')}</div><h1 class="scene-pilot-title">${esc(scene.title||'')}</h1><p class="scene-pilot-lead">${esc(scene.lead||'')}</p></div><div class="scene-pilot-step">${esc(count)}</div></header>`;
}
function renderCollection(scene,count){
  const lanes=(scene.lanes||[]).map(l=>`<section class="collection-lane"><div class="collection-lane-code">${esc(l.code)} · DÜŞÜNME ALANI</div><div class="collection-mark">${marks[l.mark]||marks.search}</div><h3>${esc(l.title)}</h3><p>${esc(l.prompt)}</p><div class="idea-slots"><div class="idea-slot"><b>FİKİR 01</b><span>Sınıftan bir örnek</span></div><div class="idea-slot"><b>FİKİR 02</b><span>Başka bir örnek</span></div><div class="idea-slot"><b>FİKİR 03</b><span>Gerekçesi</span></div></div></section>`).join('');
  return `<div class="scene-pilot scene-collection" data-art="${esc(scene.art||'archive-board')}"><div class="scene-pilot-inner">${renderHead(scene,count)}<main class="collection-board">${lanes}</main><footer class="collection-footer"><strong>${esc(scene.question||'Sınıftan örnekleri toplayın.')}</strong><span>Önce öğrenci örnekleri gelsin; ortak sonuç sonraki sahnede kurulacak.</span></footer>${brand()}</div></div>`;
}
function renderTimelineObject(side,data){
  const evidence=(data.evidence||[]).map(x=>`<span>${esc(x)}</span>`).join('');
  return `<section class="timeline-object ${side}"><div class="timeline-era">${esc(data.era||'')}</div><div class="object-stage"><img src="${esc(data.object||'')}" alt="${esc(data.title||'')}"></div><div><h3>${esc(data.title||'')}</h3><p class="timeline-object-copy">${esc(data.copy||'')}</p></div><div class="evidence-row">${evidence}</div></section>`;
}
function renderTimeline(scene,count){
  const prompts=(scene.prompts||[]).map(p=>`<div class="timeline-prompt"><small>${esc(p.code)} · ${esc(p.label)}</small><strong>${esc(p.text)}</strong></div>`).join('');
  return `<div class="scene-pilot scene-timeline" data-art="${esc(scene.art||'archive-desk')}"><div class="scene-pilot-inner">${renderHead(scene,count)}<main class="timeline-surface">${renderTimelineObject('past',scene.past||{})}<div class="timeline-spine"><div class="constant-need"><small>DEĞİŞMEYEN İHTİYAÇ</small><strong>${esc(scene.constant||'')}</strong></div><div class="constant-arrow">→</div></div>${renderTimelineObject('present',scene.present||{})}</main><footer class="timeline-prompts">${prompts}</footer>${brand()}</div></div>`;
}
function renderScene(scene,count){
  if(scene.archetype==='collection-board')return renderCollection(scene,count);
  if(scene.archetype==='timeline')return renderTimeline(scene,count);
  return '';
}

function fitPilot(){
  if(!pilotActive)return;
  const r=wrap.getBoundingClientRect();
  if(!r.width||!r.height)return;
  const scale=Math.min(r.width/1600,r.height/900);
  stage.style.width='1600px';
  stage.style.height='900px';
  stage.style.transform=`translate(-50%,-50%) scale(${scale})`;
}
function restoreLegacyFit(){
  pilotActive=false;
  document.body.classList.remove('scene-pilot-focus');
  delete stage.dataset.scenePilot;
  stage.style.removeProperty('transform');
  const r=wrap.getBoundingClientRect();if(!r.width||!r.height)return;
  const ratio=16/9;let w=r.width,h=w/ratio;if(h>r.height){h=r.height;w=h*ratio}
  stage.style.width=`${Math.floor(w)}px`;stage.style.height=`${Math.floor(h)}px`;
}
async function apply(){
  scheduled=false;
  const id=currentStepId();
  const cfg=await loadConfig();
  if(id!==currentStepId())return;
  const scene=cfg.scenes?.[id];
  if(!scene){if(pilotActive)restoreLegacyFit();return}
  if(stage.dataset.scenePilot===id){pilotActive=true;fitPilot();return}
  const count=currentStepCount();
  const html=renderScene(scene,count);
  if(!html)return;
  stage.dataset.scenePilot=id;
  stage.classList.remove('visual-mode');
  stage.innerHTML=html;
  pilotActive=true;
  document.body.classList.add('scene-pilot-focus');
  fitPilot();
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply)}

new MutationObserver(schedule).observe(stage,{childList:true,subtree:true});
window.addEventListener('resize',()=>requestAnimationFrame(()=>pilotActive?fitPilot():null));
window.addEventListener('popstate',schedule);
schedule();
})();