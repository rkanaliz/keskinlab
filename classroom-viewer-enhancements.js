(()=>{
'use strict';

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
let overlay=null,viewerImage=null,counter=null,prevBtn=null,nextBtn=null,titleEl=null;
let sources=[],index=0,mode='lightbox',nativeFullscreen=false,closing=false;

function mountStyles(){
 if(document.getElementById('keskinlab-viewer-enhancements'))return;
 const style=document.createElement('style');
 style.id='keskinlab-viewer-enhancements';
 style.textContent=`
.viewer-launch{display:inline-flex;align-items:center;gap:7px;min-height:38px;margin-top:10px;padding:0 12px;border:1px solid var(--line-strong);border-radius:6px;background:rgba(255,255,255,.55);color:var(--ink);font:600 9px "IBM Plex Mono";letter-spacing:.04em;cursor:pointer}.viewer-launch:hover{border-color:var(--teal);color:var(--teal2)}.slide-card>img,.material-card>img[data-viewer-ready="1"]{cursor:zoom-in}.slide-card .viewer-launch{width:max-content}.keskinlab-viewer{position:fixed;inset:0;z-index:9999;display:none;grid-template-rows:auto minmax(0,1fr) auto;background:rgba(18,24,43,.97);color:#F4F6F3}.keskinlab-viewer.open{display:grid}.keskinlab-viewer-top{display:flex;align-items:center;gap:14px;padding:14px 18px;border-bottom:1px solid rgba(244,246,243,.16)}.keskinlab-viewer-title{min-width:0;flex:1;font:600 10px "IBM Plex Mono";letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.keskinlab-viewer-count{font:500 10px "IBM Plex Mono";color:rgba(244,246,243,.68)}.keskinlab-viewer-btn{display:inline-grid;place-items:center;min-width:42px;height:42px;padding:0 12px;border:1px solid rgba(244,246,243,.24);border-radius:7px;background:rgba(244,246,243,.06);color:#F4F6F3;font:600 10px "IBM Plex Mono";cursor:pointer}.keskinlab-viewer-btn:hover{background:rgba(244,246,243,.12)}.keskinlab-viewer-stage{position:relative;display:grid;place-items:center;min-height:0;overflow:hidden;box-sizing:border-box;padding:18px 76px}.keskinlab-viewer-stage img{display:block;width:auto;height:auto;max-width:calc(100vw - 176px);max-height:calc(100vh - 150px);max-height:calc(100dvh - 150px);object-fit:contain}.keskinlab-viewer-nav{position:absolute;top:50%;transform:translateY(-50%);width:48px;height:64px;padding:0}.keskinlab-viewer-prev{left:16px}.keskinlab-viewer-next{right:16px}.keskinlab-viewer-nav[hidden]{display:none}.keskinlab-viewer-bottom{display:flex;justify-content:center;align-items:center;gap:10px;min-height:48px;padding:8px 16px;border-top:1px solid rgba(244,246,243,.12);font:500 9px "IBM Plex Mono";color:rgba(244,246,243,.66)}body.viewer-open{overflow:hidden}@media(max-width:820px){.keskinlab-viewer-stage{padding:12px 52px}.keskinlab-viewer-stage img{max-width:calc(100vw - 120px);max-height:calc(100vh - 132px);max-height:calc(100dvh - 132px)}.keskinlab-viewer-nav{width:40px;height:54px}.keskinlab-viewer-prev{left:6px}.keskinlab-viewer-next{right:6px}.keskinlab-viewer-top{padding:10px 12px}.keskinlab-viewer-bottom{font-size:8px}.viewer-launch{min-height:36px}}
 `;
 document.head.appendChild(style);
}

function ensureOverlay(){
 if(overlay)return;
 overlay=document.createElement('div');
 overlay.className='keskinlab-viewer';
 overlay.setAttribute('role','dialog');
 overlay.setAttribute('aria-modal','true');
 overlay.setAttribute('aria-hidden','true');
 overlay.innerHTML=`<div class="keskinlab-viewer-top"><div class="keskinlab-viewer-title"></div><div class="keskinlab-viewer-count"></div><button class="keskinlab-viewer-btn keskinlab-viewer-close" type="button" aria-label="Görüntüleyiciyi kapat">KAPAT ×</button></div><div class="keskinlab-viewer-stage"><button class="keskinlab-viewer-btn keskinlab-viewer-nav keskinlab-viewer-prev" type="button" aria-label="Önceki görsel">←</button><img alt=""><button class="keskinlab-viewer-btn keskinlab-viewer-nav keskinlab-viewer-next" type="button" aria-label="Sonraki görsel">→</button></div><div class="keskinlab-viewer-bottom">← → ile değiştir · Esc ile çık</div>`;
 document.body.appendChild(overlay);
 viewerImage=$('img',overlay);counter=$('.keskinlab-viewer-count',overlay);prevBtn=$('.keskinlab-viewer-prev',overlay);nextBtn=$('.keskinlab-viewer-next',overlay);titleEl=$('.keskinlab-viewer-title',overlay);
 $('.keskinlab-viewer-close',overlay).addEventListener('click',()=>closeViewer());
 prevBtn.addEventListener('click',()=>step(-1));
 nextBtn.addEventListener('click',()=>step(1));
 overlay.addEventListener('click',e=>{if(e.target===overlay)closeViewer()});
}

function renderViewer(){
 if(!sources.length)return;
 index=(index+sources.length)%sources.length;
 const item=sources[index];
 viewerImage.src=item.src;
 viewerImage.alt=item.alt||'KeskinLab görsel materyali';
 titleEl.textContent=item.title||'KeskinLab Görsel Materyali';
 counter.textContent=sources.length>1?`${index+1} / ${sources.length}`:'';
 const multi=sources.length>1;
 prevBtn.hidden=!multi;nextBtn.hidden=!multi;
}

function step(delta){index+=delta;renderViewer()}

async function requestNativeFullscreen(){
 const fn=overlay.requestFullscreen||overlay.webkitRequestFullscreen;
 if(!fn)return;
 try{await fn.call(overlay);nativeFullscreen=true}catch{nativeFullscreen=false}
}

function hideOverlay(){
 if(!overlay)return;
 overlay.classList.remove('open');
 overlay.setAttribute('aria-hidden','true');
 document.body.classList.remove('viewer-open');
 viewerImage.removeAttribute('src');
 sources=[];index=0;mode='lightbox';nativeFullscreen=false;
}

async function closeViewer(){
 if(!overlay?.classList.contains('open'))return;
 closing=true;
 const fsEl=document.fullscreenElement||document.webkitFullscreenElement;
 if(fsEl===overlay){
  try{await (document.exitFullscreen?.()||document.webkitExitFullscreen?.())}catch{}
 }
 hideOverlay();
 closing=false;
}

async function openViewer(items,start=0,options={}){
 mountStyles();ensureOverlay();
 sources=items.filter(x=>x?.src);if(!sources.length)return;
 index=Math.max(0,Math.min(start,sources.length-1));
 mode=options.mode||'lightbox';
 overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');document.body.classList.add('viewer-open');renderViewer();
 if(mode==='fullscreen')await requestNativeFullscreen();
}

function sourceFromImage(img,title){return{src:img.currentSrc||img.src,alt:img.alt||'',title:title||img.alt||'KeskinLab görsel materyali'}}

function enhanceSlides(){
 $$('.slide-card').forEach(card=>{
  if(card.dataset.viewerReady==='1')return;
  const img=$('img',card);if(!img)return;
  card.dataset.viewerReady='1';img.dataset.viewerReady='1';
  const btn=document.createElement('button');btn.type='button';btn.className='viewer-launch';btn.innerHTML='⛶ TAM EKRAN';btn.setAttribute('aria-label','Sunumu tam ekranda aç');
  const actions=$('.material-actions',card);card.insertBefore(btn,actions||null);
  const open=()=>{const strip=card.closest('.slide-strip');const imgs=strip?$$('.slide-card img',strip):[img];const items=imgs.map((el,i)=>sourceFromImage(el,`Ders Sunumu · Slayt ${i+1}`));openViewer(items,Math.max(0,imgs.indexOf(img)),{mode:'fullscreen'})};
  btn.addEventListener('click',open);
  img.addEventListener('click',open);
 })
}

function enhanceVisuals(){
 $$('.material-grid .material-card img').forEach(img=>{
  if(img.dataset.viewerReady==='1')return;
  img.dataset.viewerReady='1';img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-label',`${img.alt||'Görsel materyal'} büyüt`);img.title='Büyütmek için tıkla';
  const open=()=>{const grid=img.closest('.material-grid');const imgs=grid?$$('.material-card img',grid):[img];const items=imgs.map(el=>sourceFromImage(el,el.alt||'Görsel Materyal'));openViewer(items,Math.max(0,imgs.indexOf(img)),{mode:'lightbox'})};
  img.addEventListener('click',open);
  img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}})
 })
}

function enhance(){enhanceSlides();enhanceVisuals()}

mountStyles();ensureOverlay();enhance();
new MutationObserver(enhance).observe(document.body,{childList:true,subtree:true});
document.addEventListener('keydown',e=>{
 if(!overlay?.classList.contains('open'))return;
 if(e.key==='Escape'){e.preventDefault();closeViewer()}
 else if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}
 else if(e.key==='ArrowRight'){e.preventDefault();step(1)}
});
['fullscreenchange','webkitfullscreenchange'].forEach(evt=>document.addEventListener(evt,()=>{
 const fsEl=document.fullscreenElement||document.webkitFullscreenElement;
 if(nativeFullscreen&&!fsEl&&!closing&&overlay?.classList.contains('open'))hideOverlay();
}));
})();
