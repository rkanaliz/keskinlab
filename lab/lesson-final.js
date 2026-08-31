(()=>{
'use strict';

const stage=document.getElementById('slideStage');
const teacher=document.getElementById('teacherContent');
const prev=document.getElementById('prevButton');
const next=document.getElementById('nextButton');
const fullscreen=document.getElementById('fullscreenButton');

/* Smartboard / tablet swipe: interactions inside buttons remain untouched. */
let gesture=null;
if(stage){
  stage.addEventListener('pointerdown',e=>{
    if(e.button!==undefined&&e.button!==0)return;
    if(e.target.closest('button,a,input,textarea,select'))return;
    gesture={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now()};
    try{stage.setPointerCapture(e.pointerId)}catch{}
  });
  stage.addEventListener('pointerup',e=>{
    if(!gesture||gesture.id!==e.pointerId)return;
    const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y,dt=performance.now()-gesture.t;
    gesture=null;
    if(dt>900||Math.abs(dx)<90||Math.abs(dx)<Math.abs(dy)*1.35)return;
    (dx<0?next:prev)?.click();
  });
  stage.addEventListener('pointercancel',()=>{gesture=null});
}

/* Familiar presentation shortcut without making the interface depend on it. */
document.addEventListener('keydown',e=>{
  if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;
  if(e.key.toLowerCase()==='f')fullscreen?.click();
});

function firstStepForCurrentLesson(){
  const u=new URL(location.href);
  const course=u.searchParams.get('course');
  const week=u.searchParams.get('week');
  if(course==='5-sinif'&&(week==='01'||week==='1'))return'w01-beyin-firtinasi';
  return'';
}

async function copyCurrentLink(state){
  try{
    await navigator.clipboard.writeText(location.href);
    state.textContent='Bu adımın bağlantısı kopyalandı.';
  }catch{
    state.textContent='Bağlantı kopyalanamadı; adres çubuğundaki URL kullanılabilir.';
  }
  window.setTimeout(()=>{state.textContent=''},2600);
}

function restartLesson(){
  const first=firstStepForCurrentLesson();
  if(!first)return;
  const u=new URL(location.href);
  u.searchParams.set('step',first);
  location.href=u.toString();
}

function decorateTeacher(){
  if(!teacher||teacher.querySelector('.teacher-tools'))return;
  const tools=document.createElement('div');
  tools.className='teacher-tools';
  tools.innerHTML=`<button type="button" class="teacher-tool" data-copy-step>BU ADIMIN LİNKİNİ KOPYALA</button><button type="button" class="teacher-tool" data-restart-lesson>DERSİN BAŞINA DÖN</button><div class="teacher-copy-state" aria-live="polite"></div>`;
  teacher.appendChild(tools);
  const state=tools.querySelector('.teacher-copy-state');
  tools.querySelector('[data-copy-step]').onclick=()=>copyCurrentLink(state);
  tools.querySelector('[data-restart-lesson]').onclick=restartLesson;
}

if(teacher){
  new MutationObserver(decorateTeacher).observe(teacher,{childList:true,subtree:false});
  decorateTeacher();
}

/* Keep the browser title useful when the lesson is pinned or projected. */
const meta=document.getElementById('lessonMeta');
if(meta){
  const syncTitle=()=>{
    const text=meta.textContent?.trim();
    if(text)document.title=`KeskinLab · ${text.replace(/ · /g,' — ')}`;
  };
  new MutationObserver(syncTitle).observe(meta,{childList:true,characterData:true,subtree:true});
  syncTitle();
}
})();
