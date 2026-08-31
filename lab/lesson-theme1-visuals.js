(()=>{
'use strict';
const stage=document.getElementById('slideStage');
const chapterLabel=document.getElementById('chapterLabel');
if(!stage)return;

const I=(name)=>{
  const p={
    typewriter:'<path d="M18 20h40l5 25H13zM18 45h40l5 13H13z"/><path d="M24 27h5m6 0h5m6 0h5M22 35h32M27 14h25v6"/>',
    laptop:'<rect x="12" y="13" width="50" height="33" rx="3"/><path d="M8 52h58l-5 7H13z"/><path d="M22 20h30"/>',
    phone:'<rect x="23" y="7" width="28" height="52" rx="5"/><path d="M30 13h14M33 52h8"/>',
    landline:'<path d="M17 24c12-10 28-10 40 0l-7 8c-8-5-18-5-26 0z"/><rect x="16" y="36" width="42" height="22" rx="4"/><circle cx="37" cy="47" r="6"/>',
    cassette:'<rect x="10" y="17" width="54" height="40" rx="4"/><circle cx="27" cy="36" r="7"/><circle cx="47" cy="36" r="7"/><path d="M23 50h28"/>',
    tablet:'<rect x="9" y="9" width="56" height="48" rx="5"/><path d="M34 52h7"/>',
    camera:'<rect x="13" y="22" width="48" height="32" rx="5"/><circle cx="38" cy="38" r="11"/><path d="M22 22l5-8h18l5 8"/>',
    radio:'<rect x="10" y="20" width="54" height="35" rx="4"/><circle cx="50" cy="38" r="8"/><path d="M17 29h20M17 36h16M17 44h10M17 20l8-9"/>',
    speaker:'<rect x="16" y="15" width="42" height="43" rx="8"/><circle cx="37" cy="39" r="11"/><path d="M27 24h20"/>',
    atm:'<rect x="15" y="8" width="45" height="54" rx="3"/><rect x="21" y="15" width="33" height="17" rx="1"/><path d="M24 40h28M24 47h18M48 47h4"/>',
    scanner:'<path d="M13 21h48v34H13zM20 14h34v7"/><path d="M22 32h30M22 39h30M22 46h18"/>',
    health:'<rect x="12" y="14" width="50" height="45" rx="5"/><path d="M20 36h9l5-10 8 20 6-10h7"/>',
    board:'<rect x="9" y="12" width="56" height="37" rx="2"/><path d="M22 59h31M28 49l-4 10M48 49l5 10"/>',
    nav:'<path d="M37 8c-12 0-21 9-21 21 0 17 21 35 21 35s21-18 21-35C58 17 49 8 37 8z"/><circle cx="37" cy="29" r="7"/>',
    mic:'<rect x="29" y="9" width="16" height="34" rx="8"/><path d="M22 31c0 11 6 17 15 17s15-6 15-17M37 48v11M28 59h18"/>',
    light:'<path d="M17 24h39l-7 29H24z"/><path d="M37 53v9M27 62h20M20 28l-8-7M54 28l8-7"/>',
    monitor:'<rect x="10" y="12" width="54" height="37" rx="3"/><path d="M37 49v10M25 59h24"/><path d="M19 38l10-9 8 6 9-12 9 15"/>',
    clapper:'<path d="M14 27h48v31H14zM14 16h48v11H14z"/><path d="M20 16l8 11M35 16l8 11M50 16l8 11"/>'
  };
  return `<svg viewBox="0 0 74 74" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${p[name]||p.monitor}</g></svg>`;
};

function archive(){
  const items=[['typewriter','Daktilo','p1'],['landline','Sabit telefon','p2'],['laptop','Dizüstü','p3'],['atm','ATM','p4'],['scanner','Barkod','p5'],['nav','Navigasyon','p6'],['phone','Akıllı telefon','p7'],['health','Sağlık','p8']];
  return `<div class="klv-layer klv-archive">${items.map(([i,n,c])=>`<div class="klv-plate ${c}">${I(i)}<span class="klv-name">${n}</span></div>`).join('')}<i class="klv-route r1"></i><i class="klv-route r2"></i><i class="klv-route r3"></i><i class="klv-route r4"></i><div class="klv-index"><b>ARŞİV 01</b> · GÜNLÜK YAŞAM TEKNOLOJİLERİ</div></div>`;
}
function evolution(){
  const pairs=[['typewriter','Daktilo','laptop','Dizüstü'],['landline','Sabit telefon','phone','Akıllı telefon'],['cassette','Kaset','tablet','Dijital ortam'],['camera','Analog kamera','camera','Dijital kamera']];
  return `<div class="klv-layer klv-evolution">${pairs.map((p,i)=>`<div class="klv-pair" data-no="0${i+1}"><div class="klv-object">${I(p[0])}<span>${p[1]}</span></div><i class="klv-arrow"></i><div class="klv-object">${I(p[2])}<span>${p[3]}</span></div></div>`).join('')}</div>`;
}
function studioSvg(){
  return `<svg class="studio-svg" viewBox="0 0 920 720" aria-hidden="true">
  <defs><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2"/><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 .08 0"/></filter></defs>
  <rect x="84" y="86" width="470" height="470" rx="4" fill="#759565" stroke="#12182B" stroke-width="3"/><rect x="84" y="86" width="470" height="470" filter="url(#n)" opacity=".55"/>
  <path d="M84 86h470M105 70v16M532 70v16" stroke="#12182B" stroke-width="4"/>
  <circle cx="330" cy="258" r="38" fill="#D8B58D" stroke="#12182B" stroke-width="3"/><path d="M280 455c12-105 20-150 50-150s43 45 57 150" fill="#CBD8D0" stroke="#12182B" stroke-width="3"/><path d="M289 350l-78 68M377 348l72 60" stroke="#12182B" stroke-width="8" stroke-linecap="round"/>
  <g transform="translate(615 260)" fill="none" stroke="#12182B" stroke-width="4"><rect x="0" y="0" width="110" height="72" rx="6"/><circle cx="55" cy="36" r="22"/><path d="M55 72v105M20 177h70M55 120l-52 88M55 120l55 88"/></g>
  <g transform="translate(30 220)" fill="none" stroke="#12182B" stroke-width="4"><path d="M0 0h88l-18 112H18z"/><path d="M44 112v95M12 207h64"/></g>
  <g transform="translate(740 120)" fill="none" stroke="#12182B" stroke-width="4"><path d="M0 0h95l-18 112H18z"/><path d="M47 112v95M14 207h66"/></g>
  <g transform="translate(600 475)"><rect x="0" y="0" width="250" height="150" rx="7" fill="#F4F6F3" stroke="#12182B" stroke-width="4"/><rect x="14" y="14" width="222" height="112" fill="#20495A"/><path d="M15 126h220" stroke="#12182B" stroke-width="3"/><circle cx="127" cy="58" r="20" fill="#D8B58D"/><path d="M85 108c9-45 22-63 42-63s35 18 45 63" fill="#CBD8D0"/><path d="M14 86l50-38 50 23 39-49 83 65" fill="none" stroke="#8FD1C8" stroke-width="5"/></g>
  <path d="M560 100c92 4 154 30 214 75" stroke="#1E8A80" stroke-width="2" stroke-dasharray="8 8" fill="none"/><circle cx="778" cy="176" r="6" fill="#E2A63B"/><path d="M545 565c78 34 117 29 178 11" stroke="#1E8A80" stroke-width="2" stroke-dasharray="8 8" fill="none"/>
  </svg>`;
}
function green(step){
  const examples=step==='w01-yesil-ekran-farkli-sahneler'?`<div class="klv-green-examples">${[['Dağ','M22 91l42-46 35 32 31-52 55 66'],['Şehir','M18 92V53h28v39m8 0V35h36v57m10 0V61h29v31m10 0V45h30v47'],['Uzay','M20 85c35-72 97-72 143 0M60 51l22-22 22 22m32 12l17-17 15 15']].map(([n,d])=>`<div class="klv-scene"><svg viewBox="0 0 180 100"><rect x="4" y="4" width="172" height="92" fill="#244B5B" opacity=".08"/><path d="${d}" fill="none" stroke="#1E8A80" stroke-width="3"/><circle cx="90" cy="55" r="10" fill="#E2A63B" opacity=".75"/></svg><span>${n}</span></div>`).join('')}</div>`:'';
  const wide=step==='w01-yesil-ekran-kamera-arkasi'?' style="left:520px;right:35px;opacity:.32"':'';
  return `<div class="klv-layer klv-green"${wide}>${studioSvg()}<div class="klv-index"><b>PRODÜKSİYON</b> · SAHNE → KAMERA → KURGU</div>${examples}</div>`;
}
function production(){
  const e=[['camera','KAMERA','e1'],['mic','SES','e2'],['light','IŞIK','e3'],['monitor','MONİTÖR','e4'],['clapper','KURGU','e5'],['green','YEŞİL EKRAN','e6']];
  return `<div class="klv-layer klv-production">${e.map(([i,n,c])=>`<div class="equipment ${c}">${i==='green'?'<svg viewBox="0 0 74 74"><rect x="9" y="11" width="56" height="49" fill="#759565" stroke="#12182B" stroke-width="2.6"/><path d="M9 60h56M20 60v7M54 60v7" stroke="#12182B" stroke-width="2.6"/></svg>':I(i)}<span>${n}</span></div>`).join('')}<i class="wire w1"></i><i class="wire w2"></i><i class="wire w3"></i></div>`;
}

function modeFor(step){
  const chapter=(chapterLabel?.textContent||'').toLocaleUpperCase('tr-TR');
  if(['w01-bilisim-ne','w01-gunluk-hayat-ornekleri','w01-ortak-islev'].includes(step))return'archive';
  if(step==='w01-sinema-tv-teknolojileri')return'production';
  if(step.startsWith('w01-yesil-ekran'))return'green';
  if(chapter.includes('GEÇMİŞTEN GÜNÜMÜZE'))return'evolution';
  return'';
}
function decorate(){
  const step=new URL(location.href).searchParams.get('step')||'';
  const mode=modeFor(step);
  const old=stage.querySelector(':scope > .klv-layer');
  if(old&&stage.dataset.klv===mode)return;
  old?.remove();
  delete stage.dataset.klv;
  if(!mode)return;
  stage.dataset.klv=mode;
  const html=mode==='archive'?archive():mode==='evolution'?evolution():mode==='green'?green(step):production();
  stage.insertAdjacentHTML('beforeend',html);
}
let raf=0;
const schedule=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(decorate)};
new MutationObserver(schedule).observe(stage,{childList:true});
if(chapterLabel)new MutationObserver(schedule).observe(chapterLabel,{childList:true,characterData:true,subtree:true});
window.addEventListener('popstate',schedule);
schedule();
})();
