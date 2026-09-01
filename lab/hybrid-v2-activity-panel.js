(()=>{
'use strict';
const stage=document.getElementById('stage');
if(!stage)return;

const zoneSeal={iletisim:'İL',bilgi:'BG',bilisim:'BŞ',teknoloji:'TK',bit:'BİT',goruntu:'GR',ses:'SS',duzenleme:'DZ',efekt:'FX',yayin:'YN',egitim:'EĞ',saglik:'SA',ulasim:'UL',finans:'FT',eglence:'ME'};

function enhance(){
  const slide=stage.querySelector('.activity-slide');
  document.body.classList.toggle('activity-focus',!!slide);
  if(!slide||slide.dataset.activityV3==='1')return;
  slide.dataset.activityV3='1';
  slide.classList.add('activity-v3');

  const body=slide.querySelector('.activity-body');
  const head=slide.querySelector('.activity-head');
  const counter=slide.querySelector('.activity-counter');
  const pool=slide.querySelector('.item-pool');
  const zones=slide.querySelector('.zones');
  const actions=slide.querySelector('.activity-actions');
  if(!body||!head||!counter||!pool||!zones||!actions)return;

  const meta=document.createElement('div');
  meta.className='activity-v3-meta';
  const note=document.createElement('div');
  note.className='activity-v3-note';
  note.innerHTML='<small>ARŞİV NOTU</small><strong>Kavramın adından önce anlamını düşün.</strong>';
  meta.append(note,counter);
  head.append(meta);

  pool.querySelectorAll('.item-btn').forEach((btn,i)=>{
    if(btn.querySelector('.item-serial'))return;
    const serial=document.createElement('span');
    serial.className='item-serial';
    serial.textContent=String(i+1).padStart(2,'0');
    btn.prepend(serial);
  });

  zones.querySelectorAll('.zone').forEach(zone=>{
    if(zone.querySelector('.zone-seal'))return;
    const seal=document.createElement('span');
    seal.className='zone-seal';
    seal.textContent=zoneSeal[zone.dataset.zone]||String(zone.querySelector('b')?.textContent||'').slice(0,2);
    zone.prepend(seal);
  });

  const tip=document.createElement('div');
  tip.className='activity-v3-tip';
  tip.innerHTML='<img src="../brand/devre-karakteri.svg" alt=""><div><small>İPUCU</small><span>Bir kartı seç, sonra en güçlü bağ kurduğu alana dokun. Kontrolden sonra gerekçeni söyle.</span></div>';
  actions.prepend(tip);
}

let scheduled=false;
function schedule(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;enhance()});
}
new MutationObserver(schedule).observe(stage,{childList:true,subtree:true});
window.addEventListener('resize',schedule);
schedule();
})();
