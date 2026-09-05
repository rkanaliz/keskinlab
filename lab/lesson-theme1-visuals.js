(()=>{
'use strict';
const stage=document.getElementById('slideStage');
if(!stage)return;

const assets={
  archive:'assets/w01/technology-archive.webp',
  evolution:'assets/w01/communication-evolution.webp',
  green:'assets/w01/green-screen-studio.webp'
};

const map={
  'w01-bilisim-ne':{asset:'archive',variant:'archive-hero'},
  'w01-gunluk-hayat-ornekleri':{asset:'archive',variant:'archive-close'},
  'w01-ortak-islev':{asset:'archive',variant:'archive-soft'},

  'w01-gecmis-bugun-ornek-ver':{asset:'evolution',variant:'evolution-hero'},
  'w01-arsiv-daktilo':{asset:'evolution',variant:'evolution-typewriter'},
  'w01-arsiv-teyp':{asset:'evolution',variant:'evolution-media'},
  'w01-arsiv-bilgisayar':{asset:'evolution',variant:'evolution-wide'},

  'w01-yesil-ekran-sahne':{asset:'green',variant:'green-result'},
  'w01-yesil-ekran-merak':{asset:'green',variant:'green-result'},
  'w01-yesil-ekran-kamera-arkasi':{asset:'green',variant:'green-studio'},
  'w01-yesil-ekran-farkli-sahneler':{asset:'green',variant:'green-studio'},
  'w01-sinema-tv-teknolojileri':{asset:'green',variant:'green-equipment'}
};

function currentStep(){return new URL(location.href).searchParams.get('step')||''}
function layerFor(step,cfg){
  const alt=cfg.asset==='archive'?'Teknoloji arşivi':cfg.asset==='evolution'?'Geçmişten günümüze iletişim teknolojileri':'Yeşil ekran stüdyosu';
  return `<div class="klv-photo klv-photo--${cfg.variant}" aria-hidden="true"><img src="${assets[cfg.asset]}" alt="${alt}" decoding="async"><span class="klv-photo-tag">${cfg.asset==='archive'?'TEKNOLOJİ ARŞİVİ':cfg.asset==='evolution'?'GEÇMİŞ ↔ GÜNÜMÜZ':'PRODÜKSİYON / YEŞİL EKRAN'}</span></div>`;
}

function decorate(){
  const step=currentStep();
  const cfg=map[step];
  const existing=stage.querySelector(':scope > .klv-photo');
  if(!cfg){
    existing?.remove();
    delete stage.dataset.klvPhoto;
    delete stage.dataset.klvVariant;
    return;
  }
  if(existing&&stage.dataset.klvPhoto===cfg.asset&&stage.dataset.klvVariant===cfg.variant)return;
  existing?.remove();
  stage.dataset.klvPhoto=cfg.asset;
  stage.dataset.klvVariant=cfg.variant;
  stage.insertAdjacentHTML('afterbegin',layerFor(step,cfg));
}

let raf=0;
const schedule=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(decorate)};
new MutationObserver(schedule).observe(stage,{childList:true});
window.addEventListener('popstate',schedule);
window.addEventListener('load',schedule);
schedule();
})();
