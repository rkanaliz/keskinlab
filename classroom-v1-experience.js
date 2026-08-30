(()=>{
'use strict';

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const C=window.KESKINLAB_COURSE||{};
let DATA=null,overlay=null,stage=null,overlayMeta=null,selectedCard=null,draggingCard=null,selectedLeft=null;

function courseKey(){if(C.legacy==='5-sinif-bty.html')return'5-sinif';if(C.legacy==='6-sinif-bty.html')return'6-sinif';return''}
function weekNo(){const n=Number(new URL(location.href).searchParams.get('week'));return Number.isFinite(n)&&n>0?String(n).padStart(2,'0'):''}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function weekData(){const key=courseKey(),no=weekNo();return DATA?.courses?.[key]?.weeks?.[no]||null}
function titleOf(section){return $('.flow-title',section)?.textContent?.trim()||''}

function mountStyles(){
 if($('#keskinlab-v1-experience-style'))return;
 const style=document.createElement('style');
 style.id='keskinlab-v1-experience-style';
 style.textContent=`
.v1-player-box{margin-top:20px;border:1px solid var(--line-strong);border-radius:10px;background:rgba(255,255,255,.34);overflow:hidden}.v1-player-head{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:center;padding:18px 20px;border-bottom:1px solid var(--line)}.v1-player-head b{display:block;font:650 20px "Space Grotesk";letter-spacing:-.025em}.v1-player-head span{display:block;margin-top:5px;color:var(--muted);font-size:12px;line-height:1.55}.v1-player-launch{min-height:42px;padding:0 14px;border:1px solid var(--ink);border-radius:6px;background:var(--ink);color:#fff;font:600 9px "IBM Plex Mono";letter-spacing:.04em}.v1-player-launch:hover{background:var(--teal2);border-color:var(--teal2)}.v1-player-mods{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}.v1-player-mod{appearance:none;border:0;border-right:1px solid var(--line);background:transparent;text-align:left;padding:18px 20px;min-height:122px}.v1-player-mod:last-child{border-right:0}.v1-player-mod:hover{background:rgba(30,138,128,.045)}.v1-player-mod small{font:600 8px "IBM Plex Mono";letter-spacing:.08em;color:var(--amber)}.v1-player-mod strong{display:block;margin-top:9px;font:650 18px "Space Grotesk";letter-spacing:-.02em}.v1-player-mod p{margin:6px 0 0;color:var(--muted);font-size:12px;line-height:1.5}
.v1-summary-single .material-grid{grid-template-columns:minmax(0,760px)!important}.v1-summary-single .material-card{padding:12px}.v1-summary-single .material-card img{width:100%;height:auto}.v1-summary-single .material-actions{margin-top:10px}
.v1-diff-grid{display:grid;grid-template-columns:1fr 1fr;margin-top:20px;border:1px solid var(--line-strong);border-radius:10px;background:rgba(255,255,255,.34);overflow:hidden}.v1-diff-card{padding:20px}.v1-diff-card+ .v1-diff-card{border-left:1px solid var(--line)}.v1-diff-label{font:600 8px "IBM Plex Mono";letter-spacing:.09em;color:var(--amber)}.v1-diff-card h4{margin:9px 0 7px;font:650 23px "Space Grotesk";letter-spacing:-.035em}.v1-diff-card p{margin:0;color:var(--muted);font-size:13px;line-height:1.6}.v1-diff-card details{margin-top:15px;padding-top:13px;border-top:1px solid var(--line)}.v1-diff-card summary{cursor:pointer;font:600 9px "IBM Plex Mono";letter-spacing:.05em;color:var(--teal2)}.v1-diff-card ol{margin:12px 0 0;padding-left:21px;color:var(--ink2);font-size:12px;line-height:1.65}
.v1-download-panel{margin-top:18px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:17px 0;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:center}.v1-download-panel b{display:block;font:650 16px "Space Grotesk"}.v1-download-panel span{display:block;margin-top:5px;font:500 8px "IBM Plex Mono";letter-spacing:.06em;color:var(--muted)}.v1-download-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.v1-download-actions a{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:0 13px;border:1px solid var(--line-strong);border-radius:6px;font:600 9px "IBM Plex Mono";letter-spacing:.04em}.v1-download-actions a:first-child{background:var(--ink);border-color:var(--ink);color:#fff}.v1-teacher-extra{margin-top:18px;padding-top:16px;border-top:1px solid var(--line)}.v1-teacher-extra-label{font:600 8px "IBM Plex Mono";letter-spacing:.08em;color:var(--amber);margin-bottom:9px}.v1-teacher-extra .material-actions{margin-top:0}
.klx-overlay{position:fixed;inset:0;z-index:10050;display:none;grid-template-rows:58px minmax(0,1fr) 58px;background:var(--ink);color:#fff}.klx-overlay.open{display:grid}.klx-top,.klx-bottom{display:flex;align-items:center;gap:10px;padding:0 16px;background:var(--ink)}.klx-top{border-bottom:1px solid rgba(244,246,243,.14)}.klx-bottom{justify-content:center;border-top:1px solid rgba(244,246,243,.14)}.klx-brand{font:700 16px "Space Grotesk";white-space:nowrap}.klx-brand em{font-style:normal;color:#8FD1C8}.klx-meta{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:500 8px "IBM Plex Mono";letter-spacing:.07em;color:#B9C2D9}.klx-close{margin-left:auto}.klx-btn{min-height:38px;padding:0 12px;border:1px solid rgba(244,246,243,.22);border-radius:6px;background:transparent;color:#fff;font:600 9px "IBM Plex Mono";letter-spacing:.03em}.klx-btn.primary{background:#fff;color:var(--ink);border-color:#fff}.klx-stage{overflow:auto;-webkit-overflow-scrolling:touch;background:var(--paper);color:var(--ink);padding:34px max(4vw,22px)}.klx-inner{max-width:1120px;margin:auto}.klx-kicker{font:600 9px "IBM Plex Mono";letter-spacing:.1em;color:var(--teal2);text-transform:uppercase;display:flex;align-items:center;gap:9px}.klx-kicker:before{content:"";width:18px;height:1px;background:var(--amber)}.klx-inner h2{margin:12px 0 7px;font:700 clamp(36px,5.4vw,64px)/.98 "Space Grotesk";letter-spacing:-.05em}.klx-intro{max-width:68ch;margin:0;color:var(--muted);font-size:13px;line-height:1.65}.klx-menu{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:28px}.klx-menu button{border:1px solid var(--line-strong);border-radius:8px;background:#fff;text-align:left;padding:20px;min-height:170px}.klx-menu button:hover{border-color:var(--teal);background:#F8FBFA}.klx-menu small{font:600 8px "IBM Plex Mono";letter-spacing:.08em;color:var(--amber)}.klx-menu strong{display:block;margin-top:11px;font:650 23px "Space Grotesk";letter-spacing:-.03em}.klx-menu span{display:block;margin-top:8px;color:var(--muted);font-size:12px;line-height:1.55}.klx-teacher-prompt{margin-top:18px;padding:14px 16px;border-left:2px solid var(--amber);background:rgba(226,166,59,.06);color:var(--ink2);font-size:12px;line-height:1.55}.klx-reset{margin-top:15px;min-height:40px;padding:0 12px;border:1px solid var(--line-strong);border-radius:6px;background:transparent;font:600 9px "IBM Plex Mono"}
.klx-classify{display:grid;grid-template-columns:270px minmax(0,1fr);gap:24px;margin-top:27px}.klx-pool{display:flex;flex-direction:column;gap:8px;padding-right:18px;border-right:1px solid var(--line)}.klx-card{border:1px solid var(--line-strong);border-radius:6px;background:#fff;padding:12px 13px;text-align:left;font-weight:600;cursor:grab;touch-action:manipulation}.klx-card.selected{border-color:var(--teal);background:#EAF5F2}.klx-card.used{opacity:.28}.klx-zones{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.klx-zone{min-height:126px;padding:12px;border:1px dashed var(--line-strong);border-radius:7px;background:#fff;touch-action:manipulation}.klx-zone.target,.klx-zone.over{border-color:var(--teal);background:#EAF5F2}.klx-zone-name{font:600 8px "IBM Plex Mono";letter-spacing:.07em;color:var(--teal2)}.klx-zone-items{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px}.klx-placed{padding:5px 7px;border-radius:4px;background:var(--ink);color:#fff;font-size:10px}
.klx-match{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:26px}.klx-match-col{display:grid;gap:8px;align-content:start}.klx-match-title{font:600 8px "IBM Plex Mono";letter-spacing:.08em;color:var(--muted);margin-bottom:2px}.klx-match-item{border:1px solid var(--line-strong);border-radius:6px;background:#fff;padding:13px;text-align:left;min-height:48px}.klx-match-item.selected{border-color:var(--teal);background:#EAF5F2}.klx-match-item.matched{border-color:var(--teal);background:#EAF5F2;color:var(--teal2)}.klx-match-item.wrong{border-color:#B76B62;background:#FAEFED}.klx-match-status{margin-top:14px;min-height:22px;font:600 9px "IBM Plex Mono";color:var(--teal2)}
.klx-quiz{display:grid;gap:22px;margin-top:26px}.klx-q{padding-top:19px;border-top:1px solid var(--line)}.klx-q:first-child{border-top:0;padding-top:0}.klx-q strong{font:650 18px/1.35 "Space Grotesk"}.klx-options{display:grid;gap:7px;margin-top:11px;max-width:820px}.klx-option{border:1px solid var(--line-strong);border-radius:6px;background:#fff;text-align:left;padding:11px 13px}.klx-option.correct{border-color:var(--teal);background:#EAF5F2}.klx-option.wrong{border-color:#B76B62;background:#FAEFED}.klx-feedback{display:none;margin-top:9px;color:var(--ink2);font-size:12px;line-height:1.5}.klx-feedback.show{display:block}
body.klx-open{overflow:hidden}
@media(max-width:820px){.v1-player-head{grid-template-columns:1fr}.v1-player-launch{width:max-content}.v1-player-mods{grid-template-columns:1fr}.v1-player-mod{border-right:0;border-bottom:1px solid var(--line)}.v1-player-mod:last-child{border-bottom:0}.v1-diff-grid{grid-template-columns:1fr}.v1-diff-card+ .v1-diff-card{border-left:0;border-top:1px solid var(--line)}.v1-download-panel{grid-template-columns:1fr}.v1-download-actions{justify-content:flex-start}.klx-meta{display:none}.klx-menu{grid-template-columns:1fr}.klx-classify{grid-template-columns:1fr}.klx-pool{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));padding:0 0 15px;border-right:0;border-bottom:1px solid var(--line)}.klx-zones{grid-template-columns:repeat(2,minmax(0,1fr))}.klx-match{grid-template-columns:1fr}.klx-stage{padding-top:26px}}
@media(max-width:520px){.klx-pool,.klx-zones{grid-template-columns:1fr}.klx-top,.klx-bottom{padding-left:9px;padding-right:9px}.klx-brand{font-size:14px}}
 `;
 document.head.appendChild(style);
}

async function loadData(){
 try{const r=await fetch('lesson-player-data.json',{cache:'no-store'});if(r.ok)DATA=await r.json()}catch(e){console.warn('KeskinLab Lesson Player verisi yüklenemedi.',e)}
}

function mountOverlay(){
 if(overlay)return;
 overlay=document.createElement('section');
 overlay.className='klx-overlay';
 overlay.setAttribute('aria-hidden','true');
 overlay.innerHTML=`<div class="klx-top"><div class="klx-brand">Keskin<em>Lab</em> · Lesson Player</div><div class="klx-meta"></div><button type="button" class="klx-btn klx-close">ÇIKIŞ</button></div><div class="klx-stage"></div><div class="klx-bottom"><button type="button" class="klx-btn klx-menu-btn">ETKİNLİKLER</button><button type="button" class="klx-btn primary klx-fullscreen">TAM EKRAN</button></div>`;
 document.body.appendChild(overlay);
 stage=$('.klx-stage',overlay);overlayMeta=$('.klx-meta',overlay);
 $('.klx-close',overlay).onclick=closePlayer;
 $('.klx-menu-btn',overlay).onclick=renderMenu;
 $('.klx-fullscreen',overlay).onclick=async()=>{try{if(!document.fullscreenElement)await overlay.requestFullscreen();else await document.exitFullscreen()}catch{}};
}

function openPlayer(activityId=''){
 const d=weekData()?.lessonPlayer;if(!d)return;
 mountOverlay();overlay.classList.add('open');overlay.setAttribute('aria-hidden','false');document.body.classList.add('klx-open');
 overlayMeta.textContent=`${courseKey()==='5-sinif'?'5. SINIF':'6. SINIF'} · BTY · HAFTA ${weekNo()}`;
 activityId?renderActivity(activityId):renderMenu();
}
async function closePlayer(){
 if(document.fullscreenElement===overlay){try{await document.exitFullscreen()}catch{}}
 overlay?.classList.remove('open');overlay?.setAttribute('aria-hidden','true');document.body.classList.remove('klx-open');selectedCard=null;draggingCard=null;selectedLeft=null;
}

function renderMenu(){
 const d=weekData()?.lessonPlayer;if(!d||!stage)return;
 stage.innerHTML=`<div class="klx-inner"><div class="klx-kicker">LESSON PLAYER · HAFTA ${esc(weekNo())}</div><h2>Ne yapmak istiyorsun?</h2><p class="klx-intro">${esc(d.description||'Sunumdan sonra doğrudan istediğin etkinliği seç.')}</p><div class="klx-menu">${(d.activities||[]).map(a=>`<button type="button" data-activity="${esc(a.id)}"><small>${esc(a.phase||'ETKİNLİK')}</small><strong>${esc(a.title)}</strong><span>${esc(a.description||'')}</span></button>`).join('')}</div></div>`;
 $$('[data-activity]',stage).forEach(b=>b.onclick=()=>renderActivity(b.dataset.activity));
}
function activityById(id){return weekData()?.lessonPlayer?.activities?.find(a=>a.id===id)||null}
function renderActivity(id){const a=activityById(id);if(!a)return renderMenu();selectedCard=null;draggingCard=null;selectedLeft=null;if(a.kind==='classify')renderClassify(a);else if(a.kind==='match')renderMatch(a);else if(a.kind==='quiz')renderQuiz(a);else renderMenu()}

function renderClassify(a){
 stage.innerHTML=`<div class="klx-inner"><div class="klx-kicker">${esc(a.phase)} · SINIFLANDIRMA</div><h2>${esc(a.title)}</h2><p class="klx-intro">${esc(a.description)}</p><div class="klx-classify"><div class="klx-pool">${(a.items||[]).map(x=>`<button type="button" draggable="true" class="klx-card" data-card="${esc(x)}">${esc(x)}</button>`).join('')}</div><div class="klx-zones">${(a.categories||[]).map(x=>`<div class="klx-zone" tabindex="0" role="button"><div class="klx-zone-name">${esc(x).toLocaleUpperCase('tr-TR')}</div><div class="klx-zone-items"></div></div>`).join('')}</div></div>${a.teacherPrompt?`<div class="klx-teacher-prompt"><b>ÖĞRETMEN İPUCU</b><br>${esc(a.teacherPrompt)}</div>`:''}<button type="button" class="klx-reset">SIFIRLA</button></div>`;
 const cards=$$('.klx-card',stage),zones=$$('.klx-zone',stage);
 function clearTargets(){zones.forEach(z=>z.classList.remove('target','over'))}
 function select(card){if(card.classList.contains('used'))return;cards.forEach(x=>x.classList.remove('selected'));selectedCard=selectedCard===card?null:card;if(selectedCard){selectedCard.classList.add('selected');zones.forEach(z=>z.classList.add('target'))}else clearTargets()}
 function place(card,zone){if(!card||card.classList.contains('used'))return;const tag=document.createElement('span');tag.className='klx-placed';tag.textContent=card.dataset.card;$('.klx-zone-items',zone).appendChild(tag);card.classList.remove('selected');card.classList.add('used');card.draggable=false;selectedCard=null;draggingCard=null;clearTargets()}
 cards.forEach(card=>{card.onclick=()=>select(card);card.ondragstart=e=>{draggingCard=card;e.dataTransfer?.setData('text/plain',card.dataset.card)}});
 zones.forEach(zone=>{zone.onclick=()=>{if(selectedCard)place(selectedCard,zone)};zone.ondragover=e=>{e.preventDefault();zone.classList.add('over')};zone.ondragleave=()=>zone.classList.remove('over');zone.ondrop=e=>{e.preventDefault();place(draggingCard,zone)}});
 $('.klx-reset',stage).onclick=()=>renderClassify(a);
}

function renderMatch(a){
 const right=[...(a.pairs||[])].map(p=>p.right).sort((x,y)=>String(x).localeCompare(String(y),'tr')).reverse();
 stage.innerHTML=`<div class="klx-inner"><div class="klx-kicker">${esc(a.phase)} · EŞLEŞTİRME</div><h2>${esc(a.title)}</h2><p class="klx-intro">${esc(a.description)}</p><div class="klx-match"><div class="klx-match-col"><div class="klx-match-title">SOL KARTLAR</div>${(a.pairs||[]).map(p=>`<button type="button" class="klx-match-item klx-left" data-left="${esc(p.left)}">${esc(p.left)}</button>`).join('')}</div><div class="klx-match-col"><div class="klx-match-title">EŞLEŞEN KARTLAR</div>${right.map(x=>`<button type="button" class="klx-match-item klx-right" data-right="${esc(x)}">${esc(x)}</button>`).join('')}</div></div><div class="klx-match-status"></div><button type="button" class="klx-reset">SIFIRLA</button></div>`;
 const pairs=a.pairs||[],status=$('.klx-match-status',stage),lefts=$$('.klx-left',stage),rights=$$('.klx-right',stage);
 lefts.forEach(b=>b.onclick=()=>{if(b.classList.contains('matched'))return;lefts.forEach(x=>x.classList.remove('selected'));selectedLeft=b;b.classList.add('selected');status.textContent='Şimdi sağ taraftaki eşini seç.'});
 rights.forEach(b=>b.onclick=()=>{if(!selectedLeft||b.classList.contains('matched'))return;const pair=pairs.find(p=>p.left===selectedLeft.dataset.left);if(pair?.right===b.dataset.right){selectedLeft.classList.remove('selected');selectedLeft.classList.add('matched');b.classList.add('matched');selectedLeft=null;status.textContent='Doğru eşleşme.'}else{b.classList.add('wrong');status.textContent='Bu ikisi eşleşmiyor. Yeniden dene.';setTimeout(()=>b.classList.remove('wrong'),650)}});
 $('.klx-reset',stage).onclick=()=>renderMatch(a);
}

function renderQuiz(a){
 stage.innerHTML=`<div class="klx-inner"><div class="klx-kicker">${esc(a.phase)} · KISA KONTROL</div><h2>${esc(a.title)}</h2><p class="klx-intro">${esc(a.description)}</p><div class="klx-quiz">${(a.questions||[]).map((q,qi)=>`<div class="klx-q" data-q="${qi}"><strong>${qi+1}. ${esc(q.prompt)}</strong><div class="klx-options">${(q.options||[]).map((o,oi)=>`<button type="button" class="klx-option" data-option="${oi}">${String.fromCharCode(65+oi)} · ${esc(o)}</button>`).join('')}</div><div class="klx-feedback">${esc(q.feedback||'')}</div></div>`).join('')}</div><button type="button" class="klx-reset">SIFIRLA</button></div>`;
 $$('.klx-q',stage).forEach((box,qi)=>{const q=a.questions[qi];$$('.klx-option',box).forEach(btn=>btn.onclick=()=>{const oi=Number(btn.dataset.option);$$('.klx-option',box).forEach(x=>x.classList.remove('correct','wrong'));btn.classList.add(oi===q.correct?'correct':'wrong');if(oi!==q.correct){const right=$$('.klx-option',box)[q.correct];right?.classList.add('correct')}$('.klx-feedback',box)?.classList.add('show')})});
 $('.klx-reset',stage).onclick=()=>renderQuiz(a);
}

function playerSection(d){
 const section=document.createElement('div');section.className='flow-section v1-player-section';section.innerHTML=`<div class="flow-n">02 · PEKİŞTİR</div><div><h3 class="flow-title">Lesson Player</h3><p class="flow-desc">Ders sunumundan sonra pekiştirme ve öğrenme kanıtı için kısa etkileşimler. Öğretmen ihtiyacına göre doğrudan istediği etkinliği seçer.</p><div class="v1-player-box"><div class="v1-player-head"><div><b>${esc(d.title||'Hafta Etkileşimleri')}</b><span>${esc(d.description||'')}</span></div><button type="button" class="v1-player-launch">Lesson Player'ı Aç →</button></div><div class="v1-player-mods">${(d.activities||[]).map(a=>`<button type="button" class="v1-player-mod" data-v1-activity="${esc(a.id)}"><small>${esc(a.phase||'ETKİNLİK')}</small><strong>${esc(a.title)}</strong><p>${esc(a.description||'')}</p></button>`).join('')}</div></div></div>`;
 $('.v1-player-launch',section).onclick=()=>openPlayer();$$('[data-v1-activity]',section).forEach(b=>b.onclick=()=>openPlayer(b.dataset.v1Activity));return section;
}

function differentiationSection(d){
 const section=document.createElement('div');section.className='flow-section v1-differentiation';const card=x=>x?`<article class="v1-diff-card"><div class="v1-diff-label">${esc(x.label||'')}</div><h4>${esc(x.title||'')}</h4><p>${esc(x.description||'')}</p><details><summary>GÖREVİ AÇ</summary><ol>${(x.steps||[]).map(s=>`<li>${esc(s)}</li>`).join('')}</ol></details></article>`:'';
 section.innerHTML=`<div class="flow-n">04 · FARKLILAŞTIR</div><div><h3 class="flow-title">Destekleme ve Zenginleştirme</h3><p class="flow-desc">Sınıfın ihtiyacına göre seçilebilen, dersin zorunlu omurgasının dışında kalan iki farklı yol.</p><div class="v1-diff-grid">${card(d.support)}${card(d.enrichment)}</div></div>`;return section;
}

function compactDocument(section,label,meta){
 if(!section)return;const links=[];$$('.material-actions a',section).forEach(a=>{if(!links.some(x=>x.href===a.href))links.push(a.cloneNode(true))});const right=document.createElement('div');right.className='v1-download-actions';links.forEach(a=>right.appendChild(a));const panel=document.createElement('div');panel.className='v1-download-panel';const left=document.createElement('div');left.innerHTML=`<b>Hafta ${esc(weekNo())} ${esc(label)}</b><span>${esc(meta)} · İNDİRİLEBİLİR</span>`;panel.append(left,right);const body=$('.flow-section>div:nth-child(2)',section);if(body){$$('.material-stage,.material-grid',body).forEach(x=>x.remove());body.appendChild(panel)}
}

function moveAssessment(assessment,teacher){
 if(!assessment)return;if(!teacher){assessment.remove();return}const links=$$('.material-actions a',assessment).map(a=>a.cloneNode(true));if(links.length){const content=$('.teacher-content',teacher);if(content){const extra=document.createElement('div');extra.className='v1-teacher-extra';extra.innerHTML='<div class="v1-teacher-extra-label">ÖLÇME VE DEĞERLENDİRME</div><div class="material-actions"></div>';const box=$('.material-actions',extra);links.forEach(a=>box.appendChild(a));content.appendChild(extra)}}assessment.remove();
}

function normalizeSummary(section){
 if(!section)return;section.classList.add('v1-summary-single');const t=$('.flow-title',section);if(t)t.textContent='Hafta Özeti';const d=$('.flow-desc',section);if(d)d.textContent='Haftanın görsel tekrar ve hızlı başvuru özeti.';const cards=$$('.material-card',section);const summary=cards.find(c=>($('img',c)?.getAttribute('src')||'').includes('/hafta-ozeti/'));cards.forEach(c=>{if(c!==summary)c.remove()});if(!summary&&cards[0]){cards.slice(1).forEach(c=>c.remove())}
}

function setFlowLabel(section,text){const n=$('.flow-n',section);if(n)n.textContent=text}

function applyArchitecture(){
 const key=courseKey(),no=weekNo(),flow=$('.lesson-flow');if(!key||!no||!flow||!$('#lessonView')?.classList.contains('active'))return;const stamp=`${key}-${no}`;if(flow.dataset.v1Architecture===stamp)return;const wd=weekData();if(!wd)return;
 const sections=$$('.flow-section',flow);const find=name=>sections.find(s=>titleOf(s)===name||titleOf(s).startsWith(name));
 const slides=find('Ders Sunumu');const visuals=find('İnfografikler')||find('Hafta Özeti');const notes=find('Ders Notu');const activity=find('Öğrenci Etkinliği');const assessment=find('Ölçme ve Değerlendirme');const teacher=find('Öğretmen Masası');
 if(slides)setFlowLabel(slides,'01 · DERSE BAK');normalizeSummary(visuals);if(visuals)setFlowLabel(visuals,'03 · ÖZETLE');compactDocument(activity,'Öğrenci Etkinliği','PDF');if(activity)setFlowLabel(activity,'05 · UYGULA');compactDocument(notes,'Ders Notu','PDF');if(notes)setFlowLabel(notes,'06 · KAYNAK');if(teacher)setFlowLabel(teacher,'07 · ÖĞRETMEN');moveAssessment(assessment,teacher);
 const player=wd.lessonPlayer?playerSection(wd.lessonPlayer):null;const diff=wd.differentiation?differentiationSection(wd.differentiation):null;
 const order=[slides,player,visuals,diff,activity,notes,teacher].filter(Boolean);order.forEach(s=>flow.appendChild(s));
 flow.dataset.v1Architecture=stamp;
}

function scheduleApply(){requestAnimationFrame(()=>requestAnimationFrame(applyArchitecture))}
function wireGlobal(){
 new MutationObserver(scheduleApply).observe(document.body,{childList:true,subtree:true});
 addEventListener('popstate',scheduleApply);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay?.classList.contains('open')&&!document.fullscreenElement)closePlayer()});
}

async function init(){const key=courseKey();if(!key)return;mountStyles();await loadData();mountOverlay();wireGlobal();scheduleApply()}
init();
})();
