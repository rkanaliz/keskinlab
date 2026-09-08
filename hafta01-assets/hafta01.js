(()=>{'use strict';
const P='/materyaller/5-sinif/hafta01/sunum/';
const slides=[
  'Bilişim Teknolojileri Dünyasına Yolculuk',
  'Bilişim Teknolojileri Deyince Aklına Ne Geliyor?',
  '5 Sihirli Kavram',
  'Bilgi mi, İletişim mi?',
  'Teknoloji mi, Bilişim mi?',
  'BİT Nedir?',
  'Bu Araç Bilgiyle Ne Yapıyor?',
  'Bilişim Teknolojileri Bize Ne Sağlıyor?',
  'Bir Örneği Birlikte Çözelim',
  'İlk Derste Ne Öğrendik?',
  'Zaman Yolculuğu Başlıyor',
  'Değişen Araç, Değişmeyen İhtiyaç',
  'Aynı mı, Farklı mı?',
  'Teknoloji Değişince Ne Değişiyor?',
  'Sinema Sihri: Yeşil Ekran',
  'Kamera Arkasına Bakalım!',
  'Yeşil Ekran Nasıl Çalışıyor?',
  'Sinemadan Çıkalım: Bilişim Teknolojileri Nerelerde?',
  'Hangi Araç Hangi Alanda?',
  'Teknoloji Nerede, Ne Sağlıyor?'
];
const $=selector=>document.querySelector(selector);
const stage=$('#stage'),player=$('#player');
let index=0,touchX=null;

function render(){
  stage.querySelectorAll(':scope > *:not(.nav)').forEach(node=>node.remove());
  const number=index+1;
  const image=document.createElement('img');
  image.src=P+String(number).padStart(2,'0')+'.png';
  image.alt=slides[index];
  stage.insertBefore(image,$('#next'));
  $('#meta').textContent=`${number<=10?'1':'2'}. DERS · ${slides[index]}`;
  $('#counter').textContent=`${number} / ${slides.length}`;
  $('#prev').disabled=index===0;
  $('#next').disabled=index===slides.length-1;
}

function start(period){
  index=period===2?10:0;
  player.classList.add('open');
  player.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  stage.querySelector('.loading')?.remove();
  render();
}

function close(){
  player.classList.remove('open');
  player.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
  if(document.fullscreenElement)document.exitFullscreen?.();
}

function step(delta){
  const next=index+delta;
  if(next<0||next>=slides.length)return;
  index=next;
  render();
}

$('[data-start="1"]').onclick=()=>start(1);
$('[data-start="2"]').onclick=()=>start(2);
$('#close').onclick=close;
$('#prev').onclick=()=>step(-1);
$('#next').onclick=()=>step(1);
$('#full').onclick=()=>player.requestFullscreen?.();

addEventListener('keydown',event=>{
  if(!player.classList.contains('open'))return;
  if(event.key==='ArrowRight')step(1);
  if(event.key==='ArrowLeft')step(-1);
  if(event.key==='Escape')close();
});

stage.addEventListener('touchstart',event=>{
  touchX=event.changedTouches[0]?.clientX;
},{passive:true});
stage.addEventListener('touchend',event=>{
  if(touchX==null)return;
  const delta=event.changedTouches[0].clientX-touchX;
  touchX=null;
  if(Math.abs(delta)>50)step(delta>0?-1:1);
},{passive:true});
})();
