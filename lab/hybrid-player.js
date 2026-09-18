(()=>{
'use strict';
const stage=document.getElementById('slideStage');
const legacyList=document.getElementById('chapterList');
const rail=document.getElementById('hybridChapters');
const interaction=document.getElementById('hybridInteraction');
const promptTitle=document.getElementById('hybridPromptTitle');
const promptText=document.getElementById('hybridPromptText');
const promptHint=document.getElementById('hybridPromptHint');
const promptIcon=document.getElementById('hybridPromptIcon');
if(!stage||!rail||!legacyList)return;

const txt=(el)=>el?.textContent?.replace(/\s+/g,' ').trim()||'';
const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function rebuildRail(){
  const buttons=[...legacyList.querySelectorAll('.chapter-jump')];
  if(!buttons.length)return;
  rail.innerHTML=buttons.map((b,i)=>{
    const title=txt(b.querySelector('strong'))||`Bölüm ${i+1}`;
    const count=txt(b.querySelector('span:last-child'));
    return `<button type="button" class="hybrid-chapter ${b.classList.contains('active')?'active':''}" data-index="${String(i+1).padStart(2,'0')}" data-hybrid-chapter="${i}"><strong>${esc(title)}</strong><small>${esc(count)}</small></button>`;
  }).join('');
  rail.querySelectorAll('[data-hybrid-chapter]').forEach((b)=>{
    b.addEventListener('click',()=>{
      const source=legacyList.querySelectorAll('.chapter-jump')[Number(b.dataset.hybridChapter)];
      source?.click();
    });
  });
}

function mode(){
  if(stage.classList.contains('layout-activity'))return'activity';
  if(stage.classList.contains('layout-checkpoint'))return'checkpoint';
  if(stage.classList.contains('layout-compare'))return'compare';
  if(stage.classList.contains('layout-task'))return'task';
  if(stage.classList.contains('layout-question'))return'question';
  if(stage.classList.contains('layout-exit'))return'exit';
  return'lesson';
}

function syncInteraction(){
  const m=mode();
  interaction.dataset.mode=m;
  const kicker=txt(stage.querySelector('.prompt-tag,.s-kicker,.eyebrow,.checkpoint-no'));
  const title=txt(stage.querySelector('.s-question,.s-title,.checkpoint-title,.exit-title,.big'));
  const lead=txt(stage.querySelector('.s-lead,.compare-caption,.checkpoint-copy,.exit-copy,.task-foot,.sub'));
  const reveal=stage.querySelector('.s-reveal');
  const map={
    activity:['ETKİLEŞİM','Tahtada birlikte tamamlayın.','DOKUN · SEÇ · YERLEŞTİR','↔'],
    compare:['KARŞILAŞTIR','Benzerlik ve farklılıkları birlikte bulun.','BAK · KARŞILAŞTIR · SÖYLE','↔'],
    task:['GÖREV','Yönergeyi okuyun ve grup çalışmasına geçin.','UYGULA · PAYLAŞ','✓'],
    checkpoint:['DEVAM NOKTASI','Dersi burada bırakabilir veya bu bölümden yeniden başlayabilirsiniz.','BÖLÜM BAŞLANGICI','●'],
    exit:['ÇIKIŞ BİLETİ','Öğrenmeyi kısa bir öğrenci cevabıyla görünür kılın.','DÜŞÜN · CEVAPLA','✓'],
    question:['DÜŞÜN VE PAYLAŞ','Önce öğrenci sesi; ardından ders devam eder.','SOR · BEKLE · PAYLAŞ','?'],
    lesson:['DERS AKIŞI','Bu ekran anlatım ve gözlem için kullanılır.','GÖSTER · KONUŞ · DEVAM ET','→']
  };
  const preset=map[m]||map.lesson;
  promptTitle.textContent=title||kicker||preset[0];
  promptText.textContent=lead||preset[1];
  promptHint.textContent=reveal?'CEVAP, PAYLAŞIMDAN SONRA AÇILIR':preset[2];
  promptIcon.textContent=preset[3];
}

function syncActiveRail(){
  const active=[...legacyList.querySelectorAll('.chapter-jump')].findIndex(b=>b.classList.contains('active'));
  rail.querySelectorAll('.hybrid-chapter').forEach((b,i)=>b.classList.toggle('active',i===active));
}

const stageObserver=new MutationObserver(()=>requestAnimationFrame(()=>{syncInteraction();syncActiveRail()}));
stageObserver.observe(stage,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
const chapterObserver=new MutationObserver(()=>requestAnimationFrame(()=>{rebuildRail();syncActiveRail()}));
chapterObserver.observe(legacyList,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});

const notes=document.getElementById('hybridNotes');
const teacher=document.getElementById('teacherButton');
notes?.addEventListener('click',()=>teacher?.click());

window.addEventListener('popstate',()=>requestAnimationFrame(()=>{syncInteraction();syncActiveRail()}));
window.addEventListener('load',()=>setTimeout(()=>{rebuildRail();syncInteraction();syncActiveRail()},80));
setTimeout(()=>{rebuildRail();syncInteraction();syncActiveRail()},250);
})();
