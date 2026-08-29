const root=document.getElementById('readerRoot');
const titleEl=document.getElementById('readerTitle');
const type=new URLSearchParams(location.search).get('type')||'';
const base='generated/web/5-sinif/hafta01';
const raw='materyaller/5-sinif/hafta01';
const slides=Array.from({length:10},(_,i)=>`${base}/sunum/${String(i+1).padStart(2,'0')}.webp`);
const visuals=[
 {src:`${base}/infografik/01.webp`,raw:`${raw}/infografik/01.png`,label:'İnfografik 01'},
 {src:`${base}/infografik/02.webp`,raw:`${raw}/infografik/02.png`,label:'İnfografik 02'},
 {src:`${base}/hafta-ozeti/01.webp`,raw:`${raw}/hafta-ozeti/01.png`,label:'Hafta Özeti'}
];
const pdfs={
 note:{title:'Ders Notu',src:`${raw}/ders-notu/01.pdf`,download:'KeskinLab-5-Sinif-Hafta-01-Ders-Notu.pdf'},
 activity:{title:'Öğrenci Etkinliği',src:`${raw}/ogrenci-etkinligi/01.pdf`,download:'KeskinLab-5-Sinif-Hafta-01-Ogrenci-Etkinligi.pdf'}
};

document.querySelectorAll('.reader-tabs a').forEach(a=>a.classList.toggle('active',a.dataset.type===type));

function home(){
 titleEl.textContent='Reader Prototipi';
 root.innerHTML=`<section class="reader-empty"><div class="reader-context"><span>ALTERNATİF GÖSTERİM DENEYİ</span></div><h1>Tek materyal, cihazdan bağımsız okuma.</h1><p>Bu sayfa yalnızca 5. Sınıf BTY · Hafta 01 için hazırlanmış bir prototiptir. Mevcut Classroom viewer değiştirilmedi. Aşağıdaki dört yüzey telefonda ve bilgisayarda ayrı ayrı karşılaştırılabilir.</p><div class="reader-home-grid"><a href="?type=slides"><b>Ders Sunumu</b><span>Modal yerine tam sayfa yatay okuyucu; swipe, ok tuşları ve isteğe bağlı gerçek tam ekran.</span></a><a href="?type=visuals"><b>İnfografikler</b><span>Lightbox yok. Dikey görseller doğal genişlikte, sayfa akışında ve kırpılmadan okunur.</span></a><a href="?type=note"><b>Ders Notu</b><span>PDF iframe yok. Sayfalar PDF.js ile KeskinLab yüzeyinde responsive olarak çizilir.</span></a><a href="?type=activity"><b>Öğrenci Etkinliği</b><span>Ders notuyla aynı belge okuyucusu; iç scrollbar ve tarayıcı PDF toolbar’ı yok.</span></a></div></section>`;
}

function renderSlides(){
 titleEl.textContent='Ders Sunumu';
 root.innerHTML=`<section class="slides-shell"><div class="slides-track" id="slidesTrack">${slides.map((src,i)=>`<div class="slide-page" data-index="${i}"><img src="${src}" alt="Ders Sunumu · Slayt ${i+1}" ${i?'loading="lazy"':''}></div>`).join('')}</div><div class="slides-controls"><button class="reader-button" id="slidePrev" type="button" aria-label="Önceki slayt">←</button><div class="slides-count" id="slideCount">1 / ${slides.length}</div><button class="reader-button" id="slideNext" type="button" aria-label="Sonraki slayt">→</button><button class="reader-button fullscreen-btn" id="slideFullscreen" type="button">⛶ SUNUM MODU</button></div></section>`;
 const track=document.getElementById('slidesTrack');
 const count=document.getElementById('slideCount');
 const prev=document.getElementById('slidePrev');
 const next=document.getElementById('slideNext');
 let current=0;
 const pages=[...track.querySelectorAll('.slide-page')];
 const go=n=>{current=Math.max(0,Math.min(n,pages.length-1));pages[current].scrollIntoView({behavior:'smooth',block:'nearest',inline:'start'});update()};
 const update=()=>{count.textContent=`${current+1} / ${pages.length}`;prev.disabled=current===0;next.disabled=current===pages.length-1};
 const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(visible&&visible.intersectionRatio>.55){current=Number(visible.target.dataset.index);update()}},{root:track,threshold:[.55,.75,.95]});
 pages.forEach(p=>observer.observe(p));
 prev.onclick=()=>go(current-1);next.onclick=()=>go(current+1);
 document.getElementById('slideFullscreen').onclick=async()=>{try{const el=document.querySelector('.slides-shell');if(document.fullscreenElement)await document.exitFullscreen();else await el.requestFullscreen()}catch{}};
 document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')go(current-1);if(e.key==='ArrowRight')go(current+1)});
 update();
}

function renderVisuals(){
 titleEl.textContent='İnfografikler';
 root.innerHTML=`<section class="visuals-shell"><header class="reader-intro"><div class="kicker">GÖRSEL OKUYUCU · MODAL YOK</div><h1>İnfografikler</h1><p>Dikey materyaller tek ekrana sıkıştırılmıyor. Telefon ve bilgisayarda sayfa genişliğine göre ölçekleniyor; uzun görseller doğal olarak aşağı kaydırılarak okunuyor.</p></header>${visuals.map(v=>`<article class="visual-page"><img src="${v.src}" alt="${v.label}"><div class="visual-caption"><span>${v.label}</span><a href="${v.raw}" target="_blank" rel="noopener">Orijinali aç ↗</a></div></article>`).join('')}</section>`;
}

let pdfRenderToken=0;
async function renderPdf(kind){
 const cfg=pdfs[kind];titleEl.textContent=cfg.title;
 root.innerHTML=`<section class="pdf-shell"><header class="reader-intro"><div class="kicker">BELGE OKUYUCU · IFRAME YOK</div><h1>${cfg.title}</h1><p>PDF sayfaları tarayıcının gömülü PDF görüntüleyicisine bırakılmadan, doğrudan KeskinLab sayfasının genişliğine göre çiziliyor.</p><div class="pdf-toolbar"><a class="primary" href="${cfg.src}" download="${cfg.download}">PDF indir ↓</a><a href="${cfg.src}" target="_blank" rel="noopener">Orijinal PDF’yi aç ↗</a></div></header><div class="pdf-pages" id="pdfPages"><div class="pdf-loading">BELGE HAZIRLANIYOR…</div></div></section>`;
 const token=++pdfRenderToken;
 try{
  const pdfjs=await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@6.2.108/build/pdf.min.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@6.2.108/build/pdf.worker.min.mjs';
  const doc=await pdfjs.getDocument(cfg.src).promise;if(token!==pdfRenderToken)return;
  const pages=document.getElementById('pdfPages');pages.innerHTML='';
  const cssWidth=()=>Math.max(260,Math.min(1060,pages.clientWidth-8));
  for(let n=1;n<=doc.numPages;n++){
   if(token!==pdfRenderToken)return;
   const page=await doc.getPage(n);const baseViewport=page.getViewport({scale:1});const width=cssWidth();
   const cssScale=width/baseViewport.width;const pixelRatio=Math.min(window.devicePixelRatio||1,2);const renderViewport=page.getViewport({scale:cssScale*pixelRatio});
   const wrap=document.createElement('article');wrap.className='pdf-page';wrap.dataset.page=String(n);
   const canvas=document.createElement('canvas');const ctx=canvas.getContext('2d',{alpha:false});canvas.width=Math.floor(renderViewport.width);canvas.height=Math.floor(renderViewport.height);canvas.style.width=`${Math.floor(baseViewport.width*cssScale)}px`;canvas.style.height=`${Math.floor(baseViewport.height*cssScale)}px`;wrap.appendChild(canvas);pages.appendChild(wrap);
   await page.render({canvasContext:ctx,viewport:renderViewport}).promise;
  }
 }catch(err){const pages=document.getElementById('pdfPages');if(pages)pages.innerHTML=`<div class="pdf-error"><b>Belge okuyucu yüklenemedi.</b><p>${String(err?.message||err)}</p><div class="pdf-toolbar"><a class="primary" href="${cfg.src}" target="_blank" rel="noopener">PDF’yi doğrudan aç ↗</a></div></div>`}
}

if(type==='slides')renderSlides();else if(type==='visuals')renderVisuals();else if(type==='note'||type==='activity')renderPdf(type);else home();
