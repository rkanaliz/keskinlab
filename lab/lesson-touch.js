(()=>{
'use strict';

const app=document.querySelector('#lessonApp');
const viewport=document.querySelector('#slideViewport');
const stage=document.querySelector('#slideStage');
const prev=document.querySelector('#prevButton');
const next=document.querySelector('#nextButton');
if(!app||!viewport||!stage||!prev||!next)return;

let gesture=null;
let pulseTimer=0;
const INTERACTIVE='button,a,input,textarea,select,[role="button"],[data-item],[data-zone],.tech-item,.category-zone,.s-action';

function rememberInput(e){
  const type=e.pointerType||'mouse';
  app.dataset.input=type;
  document.documentElement.dataset.input=type;
}

function interactionActive(){
  return stage.classList.contains('layout-activity')||!!stage.querySelector('[data-item],[data-zone]');
}

function canStartGesture(e){
  if(e.isPrimary===false)return false;
  if(e.button!=null&&e.button!==0)return false;
  if(interactionActive())return false;
  if(e.target.closest(INTERACTIVE))return false;
  return e.pointerType==='touch'||e.pointerType==='pen';
}

function clearGesture(){
  gesture=null;
}

function pulse(direction){
  clearTimeout(pulseTimer);
  viewport.classList.remove('touch-swipe-next','touch-swipe-prev');
  void viewport.offsetWidth;
  viewport.classList.add(direction==='next'?'touch-swipe-next':'touch-swipe-prev');
  pulseTimer=setTimeout(()=>viewport.classList.remove('touch-swipe-next','touch-swipe-prev'),240);
}

viewport.addEventListener('pointerdown',e=>{
  rememberInput(e);
  if(!canStartGesture(e)){clearGesture();return}
  gesture={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now()};
  try{viewport.setPointerCapture(e.pointerId)}catch{}
},{passive:true});

viewport.addEventListener('pointerup',e=>{
  rememberInput(e);
  if(!gesture||gesture.id!==e.pointerId)return;
  const dx=e.clientX-gesture.x;
  const dy=e.clientY-gesture.y;
  const dt=performance.now()-gesture.t;
  clearGesture();

  const horizontal=Math.abs(dx)>=110&&Math.abs(dx)>Math.abs(dy)*1.55;
  const deliberate=dt<=1100;
  if(!horizontal||!deliberate)return;

  if(dx<0){pulse('next');next.click()}
  else if(!prev.disabled){pulse('prev');prev.click()}
});

viewport.addEventListener('pointercancel',clearGesture,{passive:true});
viewport.addEventListener('lostpointercapture',()=>{if(gesture)clearGesture()},{passive:true});

/* Tahtaların bir kısmı dokunmayı mouse/click olarak raporlar. Click modeli bu yüzden her zaman ana yol olarak kalır. */
document.addEventListener('pointerdown',rememberInput,{capture:true,passive:true});

/* Etkinlik alanında tarayıcının görsel/öğe sürüklemesini devre dışı bırak; seçim → hedefe dokun davranışı korunur. */
stage.addEventListener('dragstart',e=>{
  if(interactionActive())e.preventDefault();
});

/* Uzun dokunma ile metin seçme / bağlam menüsü sınıf kullanımında yanlış tetiklenmesin. */
stage.addEventListener('contextmenu',e=>{
  if(app.dataset.input==='touch'||app.dataset.input==='pen')e.preventDefault();
});

})();
