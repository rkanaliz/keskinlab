(()=>{
'use strict';
const stage=document.getElementById('stage');
if(!stage)return;

const svg=(body)=>`<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">${body}</svg>`;
const icons={
  message:svg('<path d="M8 10h32v22H20l-8 6v-6H8z"/><circle cx="18" cy="21" r="1.5"/><circle cx="24" cy="21" r="1.5"/><circle cx="30" cy="21" r="1.5"/>'),
  email:svg('<rect x="7" y="11" width="34" height="26" rx="3"/><path d="m9 14 15 12 15-12"/>'),
  route:svg('<path d="M24 42s12-12 12-23a12 12 0 1 0-24 0c0 11 12 23 12 23z"/><circle cx="24" cy="19" r="4"/>'),
  nav:svg('<path d="M24 42s12-12 12-23a12 12 0 1 0-24 0c0 11 12 23 12 23z"/><circle cx="24" cy="19" r="4"/>'),
  atm:svg('<rect x="8" y="7" width="32" height="34" rx="3"/><rect x="13" y="12" width="22" height="10" rx="1"/><path d="M15 29h18M18 34h5M27 34h4"/>'),
  atm2:svg('<rect x="8" y="7" width="32" height="34" rx="3"/><rect x="13" y="12" width="22" height="10" rx="1"/><path d="M15 29h18M18 34h5M27 34h4"/>'),
  printer:svg('<path d="m24 6 14 8v19l-14 9-14-9V14z"/><path d="m10 14 14 8 14-8M24 22v20"/>'),
  board:svg('<rect x="7" y="8" width="34" height="24" rx="2"/><path d="M18 40h12M24 32v8"/><circle cx="18" cy="19" r="3"/><path d="m26 22 4-5 5 7"/>'),
  board2:svg('<rect x="7" y="8" width="34" height="24" rx="2"/><path d="M18 40h12M24 32v8"/><circle cx="18" cy="19" r="3"/><path d="m26 22 4-5 5 7"/>'),
  library:svg('<circle cx="20" cy="20" r="10"/><path d="m28 28 10 10M15 17h10M15 22h7"/>'),
  hospital:svg('<path d="M24 40S8 31 8 18c0-8 10-11 16-3 6-8 16-5 16 3 0 13-16 22-16 22z"/><path d="M15 24h6l3-6 4 12 3-6h5"/>'),
  phoneedu:svg('<rect x="15" y="5" width="18" height="38" rx="4"/><path d="M20 10h8M22 37h4"/><circle cx="24" cy="23" r="5"/>'),
  watchhealth:svg('<rect x="14" y="12" width="20" height="24" rx="6"/><path d="M19 4h10l2 8H17zM19 44h10l2-8H17zM18 25h4l2-5 3 9 2-4h3"/>'),
  video:svg('<rect x="6" y="10" width="27" height="28" rx="4"/><path d="m33 19 9-5v20l-9-5z"/><circle cx="19" cy="20" r="4"/><path d="M12 32c2-6 12-6 14 0"/>'),
  game:svg('<path d="M13 18h22c5 0 8 4 7 9l-3 10c-1 4-6 5-9 2l-3-4h-6l-3 4c-3 3-8 2-9-2L6 27c-1-5 2-9 7-9z"/><path d="M14 27h8M18 23v8M31 25h.1M35 29h.1"/>'),
  barcode:svg('<path d="M8 10v28M13 10v28M18 10v28M25 10v28M29 10v28M36 10v28M40 10v28"/>'),
  camera:svg('<rect x="7" y="13" width="27" height="24" rx="4"/><path d="m34 20 8-5v20l-8-5z"/><circle cx="20" cy="25" r="6"/>'),
  microphone:svg('<rect x="18" y="7" width="12" height="24" rx="6"/><path d="M13 25a11 11 0 0 0 22 0M24 36v6M18 42h12"/>'),
  editing:svg('<path d="M9 12h30M9 24h30M9 36h30"/><circle cx="18" cy="12" r="4"/><circle cx="31" cy="24" r="4"/><circle cx="23" cy="36" r="4"/>'),
  green:svg('<rect x="7" y="9" width="34" height="28" rx="3"/><path d="m15 30 7-8 5 5 5-7 6 10"/><circle cx="16" cy="17" r="3"/>'),
  stream:svg('<circle cx="24" cy="24" r="3"/><path d="M16 16a11 11 0 0 0 0 16M32 16a11 11 0 0 1 0 16M11 11a18 18 0 0 0 0 26M37 11a18 18 0 0 1 0 26"/>'),
  monitor:svg('<rect x="6" y="8" width="36" height="27" rx="3"/><path d="M17 42h14M24 35v7"/>')
};
const fallbackIcon=svg('<circle cx="24" cy="24" r="15"/><path d="M16 24h16M24 16v16"/>');
const zoneIcons={
  iletisim:svg('<path d="M7 10h25v20H18l-7 6v-6H7z"/><path d="M27 17h14v17h-5l-5 5v-5h-4"/><circle cx="15" cy="20" r="1.4"/><circle cx="21" cy="20" r="1.4"/><circle cx="27" cy="20" r="1.4"/>'),
  bilgi:svg('<path d="M24 13c-5-4-11-5-17-3v27c6-2 12-1 17 3 5-4 11-5 17-3V10c-6-2-12-1-17 3z"/><path d="M24 13v27M12 17h7M12 22h7M29 17h7M29 22h7"/>'),
  bilisim:svg('<path d="M16 36h19a8 8 0 0 0 1-16 12 12 0 0 0-23-2 9 9 0 0 0 3 18z"/><circle cx="24" cy="27" r="5"/><path d="M24 18v4M24 32v4M15 27h4M29 27h4M18 21l3 3M27 30l3 3M30 21l-3 3M21 30l-3 3"/>'),
  teknoloji:svg('<circle cx="24" cy="24" r="8"/><path d="M24 7v6M24 35v6M7 24h6M35 24h6M12 12l5 5M31 31l5 5M36 12l-5 5M17 31l-5 5"/>'),
  bit:svg('<rect x="7" y="10" width="25" height="20" rx="2"/><path d="M13 36h13M20 30v6"/><rect x="31" y="18" width="10" height="20" rx="2"/>'),
  goruntu:icons.camera, ses:icons.microphone, duzenleme:icons.editing, efekt:svg('<path d="m24 5 3 10 10 3-10 3-3 10-3-10-10-3 10-3zM37 28l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>'), yayin:icons.stream,
  egitim:zoneIconsPlaceholder(), saglik:icons.hospital, ulasim:icons.route, finans:icons.atm, eglence:icons.game
};
function zoneIconsPlaceholder(){return svg('<path d="M24 13c-5-4-11-5-17-3v27c6-2 12-1 17 3 5-4 11-5 17-3V10c-6-2-12-1-17 3z"/><path d="M24 13v27"/>')}

const zoneColor={iletisim:'#7152B9',bilgi:'#2D78C8',bilisim:'#408A5B',teknoloji:'#E87922',bit:'#178D8D',goruntu:'#2D78C8',ses:'#7152B9',duzenleme:'#178D8D',efekt:'#E87922',yayin:'#408A5B',egitim:'#2D78C8',saglik:'#D45757',ulasim:'#178D8D',finans:'#E87922',eglence:'#7152B9'};
const itemAccent=['#7152B9','#2D78C8','#E87922','#5B9C67','#178D8D','#7152B9','#D85A43','#E87922'];

function enhance(){
  const slide=stage.querySelector('.activity-slide');
  document.body.classList.toggle('activity-focus',!!slide);
  if(!slide||slide.dataset.activityV4==='1')return;
  slide.dataset.activityV4='1';
  slide.classList.add('activity-v4');

  const body=slide.querySelector('.activity-body');
  const head=slide.querySelector('.activity-head');
  const counter=slide.querySelector('.activity-counter');
  const pool=slide.querySelector('.item-pool');
  const zones=slide.querySelector('.zones');
  const actions=slide.querySelector('.activity-actions');
  if(!body||!head||!counter||!pool||!zones||!actions)return;

  const hero=document.createElement('div');
  hero.className='activity-v4-hero';
  hero.innerHTML='<div class="hero-window"><i></i><i></i><i></i></div><div class="hero-desk"></div><div class="hero-lamp"><i></i></div><div class="hero-books"><i></i><i></i><i></i></div><div class="hero-plant"><i></i><i></i><i></i></div><div class="hero-note"><small>DERS NOTU</small><b>Önce anlamı düşün.<br>Sonra eşleştir.</b></div>';
  hero.append(counter);
  head.append(hero);

  pool.querySelectorAll('.item-btn').forEach((btn,i)=>{
    const id=btn.dataset.item||'';
    const icon=document.createElement('span');
    icon.className='item-icon';
    icon.style.setProperty('--accent',itemAccent[i%itemAccent.length]);
    icon.innerHTML=icons[id]||fallbackIcon;
    btn.prepend(icon);
  });

  zones.querySelectorAll('.zone').forEach(zone=>{
    const id=zone.dataset.zone||'';
    zone.style.setProperty('--zone',zoneColor[id]||'#178D8D');
    const icon=document.createElement('span');
    icon.className='zone-icon';
    icon.innerHTML=zoneIcons[id]||fallbackIcon;
    const label=zone.querySelector('b');
    if(label)label.after(icon);else zone.prepend(icon);
    const drop=document.createElement('span');
    drop.className='zone-drop-label';
    drop.textContent='Buraya yerleştir';
    zone.append(drop);
  });

  const tip=document.createElement('div');
  tip.className='activity-v4-tip';
  tip.innerHTML='<span class="tip-lens">⌕</span><div><small>İPUCU</small><span>Kartın üzerindeki küçük açıklamayı oku; en güçlü bağı kurduğu kavramı seç.</span></div>';
  actions.prepend(tip);

  const coach=document.createElement('img');
  coach.className='activity-v4-coach';
  coach.src='../brand/devre-karakteri.svg';
  coach.alt='';
  actions.append(coach);
}

let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;enhance()})}
new MutationObserver(schedule).observe(stage,{childList:true,subtree:true});
window.addEventListener('resize',schedule);
schedule();
})();
