(()=>{
'use strict';

const NOTE_HTML=`
<div class="webdoc-head">
  <span>DERS NOTU · BTY.5.1.1</span>
  <p>Bu hafta günlük yaşamda kullanılan bilişim teknolojilerini tanıyacak; geçmiş ve günümüz örneklerini karşılaştıracak; kullanım alanlarına göre sınıflandıracağız.</p>
</div>
<section class="webdoc-section">
  <h4><span>01</span> Temel Kavramlar</h4>
  <div class="webdoc-defs">
    <div><b>BİLGİ</b><p>Öğrenme, araştırma, gözlem ve deneyimler sonucunda anlamlandırdığımız içeriktir.</p></div>
    <div><b>TEKNOLOJİ</b><p>İhtiyaçları karşılamak ve işleri kolaylaştırmak için geliştirilen araç, yöntem ve uygulamaların genel adıdır.</p></div>
  </div>
  <p class="webdoc-callout"><b>Bilişim teknolojileri:</b> Bilgiyi oluşturmak, işlemek, saklamak ve paylaşmak için kullandığımız teknolojilerdir.</p>
</section>
<section class="webdoc-section">
  <h4><span>02</span> Teknoloji Zamanla Değişir</h4>
  <div class="webdoc-compare">
    <div class="compare-row compare-head"><span>Geçmişte</span><span>Günümüzde</span><span>Ortak amaç</span></div>
    <div class="compare-row"><span data-l="Geçmişte">Mektup</span><span data-l="Günümüzde">Mesaj / e-posta</span><span data-l="Ortak amaç">İletişim kurmak</span></div>
    <div class="compare-row"><span data-l="Geçmişte">Basılı harita</span><span data-l="Günümüzde">Navigasyon</span><span data-l="Ortak amaç">Yol bulmak</span></div>
    <div class="compare-row"><span data-l="Geçmişte">Filmli fotoğraf makinesi</span><span data-l="Günümüzde">Telefon kamerası</span><span data-l="Ortak amaç">Görüntü kaydetmek</span></div>
    <div class="compare-row"><span data-l="Geçmişte">Eski masaüstü bilgisayar</span><span data-l="Günümüzde">Dizüstü / tablet</span><span data-l="Ortak amaç">Bilgiyle çalışmak</span></div>
  </div>
</section>
<section class="webdoc-section">
  <h4><span>03</span> Kullanım Alanlarına Göre Sınıflandırma</h4>
  <div class="webdoc-categories">
    <div><b>İletişim</b><span>telefon, e-posta</span></div>
    <div><b>Eğitim</b><span>akıllı tahta, tablet</span></div>
    <div><b>Sağlık</b><span>ateş ölçer, MR</span></div>
    <div><b>Ulaşım</b><span>navigasyon, radar</span></div>
    <div><b>Eğlence</b><span>oyun konsolu, VR</span></div>
  </div>
  <p class="webdoc-note"><b>UNUTMA:</b> Aynı teknoloji, kullanım amacına göre birden fazla grupta yer alabilir. Örneğin tablet; ders çalışırken eğitim, oyun oynarken eğlence amacıyla kullanılabilir.</p>
</section>
<section class="webdoc-section">
  <h4><span>04</span> Kendini Kontrol Et</h4>
  <ol class="webdoc-check">
    <li>Bir bilişim teknolojisi örneği yaz ve ne amaçla kullanıldığını söyle.</li>
    <li>Geçmişte kullanılan bir araçla günümüzdeki karşılığını eşleştir.</li>
    <li>Bir teknolojinin birden fazla kullanım alanına girebilmesine örnek ver.</li>
  </ol>
</section>
<p class="webdoc-source">Tanımlar 5. sınıf düzeyinde sadeleştirilmiştir. Kaynak: TYMM BTY 5. Sınıf, Tema 1 · BTY.5.1.1.</p>`;

const ACTIVITY_HTML=`
<div class="webdoc-head activity-head">
  <span>TEKNOLOJİ ARAŞTIRMACILARI · BTY.5.1.1</span>
  <p><b>Görev:</b> Grubunuzla bir bilişim teknolojisi seçin. Geçmişte ve günümüzde nasıl kullanıldığını araştırın, kullanım alanını belirleyin ve sınıfa kısa bir sunum yapın.</p>
</div>
<section class="webdoc-section">
  <h4><span>01</span> Teknolojiyi Tanıyalım</h4>
  <label class="web-field">Bu teknoloji ne işe yarar?<textarea rows="2"></textarea></label>
  <fieldset class="web-choice"><legend>Bilgiyi nasıl kullanır?</legend><label><input type="checkbox"> Oluşturur</label><label><input type="checkbox"> İşler</label><label><input type="checkbox"> Saklar</label><label><input type="checkbox"> Paylaşır</label></fieldset>
  <label class="web-field">En çok nerede kullanılır?<textarea rows="2"></textarea></label>
</section>
<section class="webdoc-section">
  <h4><span>02</span> Geçmişten Günümüze Karşılaştıralım</h4>
  <div class="activity-compare">
    <div class="activity-compare-head"><b>Geçmişte</b><b>Günümüzde</b><b>Benzerlik / Farklılık</b></div>
    ${[1,2,3].map(()=>'<div class="activity-compare-row"><textarea rows="2" aria-label="Geçmişte"></textarea><textarea rows="2" aria-label="Günümüzde"></textarea><textarea rows="2" aria-label="Benzerlik veya farklılık"></textarea></div>').join('')}
  </div>
</section>
<section class="webdoc-section">
  <h4><span>03</span> Kullanım Alanını Belirleyelim</h4>
  <p>Seçtiğiniz teknolojiyi uygun alanlara işaretleyin. Birden fazla alan seçebilirsiniz.</p>
  <div class="web-choice web-choice-wide"><label><input type="checkbox"> İletişim</label><label><input type="checkbox"> Eğitim</label><label><input type="checkbox"> Sağlık</label><label><input type="checkbox"> Ulaşım</label><label><input type="checkbox"> Eğlence</label></div>
  <label class="web-field">Neden?<textarea rows="2"></textarea></label>
</section>
<section class="webdoc-section">
  <h4><span>04</span> Mini Sunum Planı</h4>
  <p class="webdoc-note">Sunum süresi yaklaşık 2 dakika. Her grup üyesi en az bir cümle söylesin.</p>
  <ol class="webdoc-check">
    <li>Seçtiğimiz teknoloji nedir ve ne işe yarar?</li>
    <li>Geçmişte nasıl kullanılıyordu / nasıldı?</li>
    <li>Günümüzde nasıl kullanılıyor / nasıl değişti?</li>
    <li>Benzer kalan amaç nedir?</li>
    <li>Hangi kullanım alanına veya alanlarına girer? Neden?</li>
  </ol>
</section>
<section class="webdoc-section">
  <h4><span>05</span> Grup İçi Görev Paylaşımı</h4>
  <div class="activity-roles">
    <div class="activity-role-head"><b>Grup Üyesi</b><b>Görevi</b><b>Söyleyeceği Bölüm</b></div>
    ${[1,2,3].map(()=>'<div class="activity-role-row"><input aria-label="Grup üyesi"><input aria-label="Görevi"><input aria-label="Söyleyeceği bölüm"></div>').join('')}
  </div>
</section>
<section class="webdoc-section">
  <h4><span>06</span> Sunumdan Önce Son Kontrol</h4>
  <div class="web-checklist">
    <label><input type="checkbox"> Teknolojinin ne işe yaradığını açıklayabiliyoruz.</label>
    <label><input type="checkbox"> Geçmiş ve günümüz arasında en az bir benzerlik veya farklılık söyleyebiliyoruz.</label>
    <label><input type="checkbox"> Kullanım alanını doğru gerekçeyle açıklayabiliyoruz.</label>
    <label><input type="checkbox"> Tüm grup üyeleri sunuma katılıyor.</label>
  </div>
</section>
<section class="webdoc-section">
  <h4><span>07</span> Bir Cümleyle Sonuç</h4>
  <label class="web-field">Bu etkinlikten sonra şunu fark ettim:<textarea rows="3"></textarea></label>
</section>`;

function mountStyles(){
  if(document.getElementById('week01-web-content-style'))return;
  const s=document.createElement('style');
  s.id='week01-web-content-style';
  s.textContent=`
  .week01-web-content{border:1px solid var(--line);border-radius:10px;background:#fff;padding:clamp(18px,3vw,34px);color:var(--ink)}
  .webdoc-head{padding-bottom:24px;border-bottom:1px solid var(--line)}.webdoc-head>span{display:block;font:600 9px "IBM Plex Mono";letter-spacing:.09em;color:var(--teal2);margin-bottom:10px}.webdoc-head p{max-width:820px;margin:0;font:500 clamp(14px,1.5vw,17px) Inter;line-height:1.7}.webdoc-section{padding:28px 0;border-bottom:1px solid var(--line)}.webdoc-section h4{display:flex;align-items:baseline;gap:10px;margin:0 0 18px;font:650 clamp(20px,2.2vw,28px) "Space Grotesk";letter-spacing:-.025em}.webdoc-section h4 span{font:600 9px "IBM Plex Mono";letter-spacing:.08em;color:var(--amber)}.webdoc-section p{font:400 14px Inter;line-height:1.65}.webdoc-defs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:var(--line);border:1px solid var(--line)}.webdoc-defs>div{background:#fff;padding:18px}.webdoc-defs b,.webdoc-categories b{font:650 13px "Space Grotesk"}.webdoc-defs p{margin:6px 0 0;color:var(--muted)}.webdoc-callout,.webdoc-note{margin:14px 0 0;padding:14px 16px;border-left:3px solid var(--amber);background:rgba(226,166,59,.08)}.webdoc-compare{border-top:1px solid var(--line)}.compare-row{display:grid;grid-template-columns:1fr 1fr 1fr;border-bottom:1px solid var(--line)}.compare-row span{padding:12px 14px;border-right:1px solid var(--line);font:500 13px Inter}.compare-row span:last-child{border-right:0}.compare-head{background:rgba(30,138,128,.06)}.compare-head span{font:600 9px "IBM Plex Mono";letter-spacing:.04em;color:var(--teal2)}.webdoc-categories{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));border:1px solid var(--line)}.webdoc-categories>div{padding:14px 10px;text-align:center;border-right:1px solid var(--line)}.webdoc-categories>div:last-child{border-right:0}.webdoc-categories span{display:block;margin-top:5px;font:400 12px Inter;color:var(--muted)}.webdoc-check{margin:0;padding-left:22px}.webdoc-check li{padding:5px 0 5px 5px;font:400 14px Inter;line-height:1.6}.webdoc-source{margin:18px 0 0;font:500 10px "IBM Plex Mono";line-height:1.5;color:var(--muted)}
  .web-field{display:grid;gap:8px;margin:14px 0;font:600 12px Inter}.web-field textarea,.activity-compare textarea,.activity-role-row input{width:100%;box-sizing:border-box;border:1px solid var(--line-strong);border-radius:6px;background:#fff;padding:10px;font:400 14px Inter;color:var(--ink);resize:vertical}.web-field textarea:focus,.activity-compare textarea:focus,.activity-role-row input:focus{outline:2px solid rgba(30,138,128,.18);border-color:var(--teal)}.web-choice{display:flex;flex-wrap:wrap;gap:12px 18px;margin:14px 0;padding:14px 16px;border:1px solid var(--line);border-radius:7px}.web-choice legend{padding:0 6px;font:600 12px Inter}.web-choice label,.web-checklist label{font:500 13px Inter}.web-choice-wide{justify-content:space-between}.activity-compare,.activity-roles{border-top:1px solid var(--line);border-left:1px solid var(--line)}.activity-compare-head,.activity-compare-row,.activity-role-head,.activity-role-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}.activity-compare-head>* ,.activity-role-head>*{padding:10px;border-right:1px solid var(--line);border-bottom:1px solid var(--line);font:600 9px "IBM Plex Mono";letter-spacing:.03em}.activity-compare-row>* ,.activity-role-row>*{border-radius:0;border:0;border-right:1px solid var(--line);border-bottom:1px solid var(--line);min-height:58px}.web-checklist{display:grid;gap:10px}.web-checklist label{display:flex;align-items:flex-start;gap:9px;line-height:1.5}
  @media(max-width:700px){.week01-web-content{padding:18px 16px}.webdoc-defs{grid-template-columns:1fr}.webdoc-categories{grid-template-columns:1fr 1fr}.webdoc-categories>div{border-bottom:1px solid var(--line)}.compare-head{display:none}.compare-row{grid-template-columns:1fr}.compare-row span{display:grid;grid-template-columns:92px 1fr;gap:8px;border-right:0}.compare-row span:before{content:attr(data-l);font:600 8px "IBM Plex Mono";letter-spacing:.04em;color:var(--muted)}.activity-compare-head,.activity-role-head{display:none}.activity-compare-row,.activity-role-row{grid-template-columns:1fr;margin-bottom:14px;border-top:1px solid var(--line)}.activity-compare-row textarea,.activity-role-row input{border-right:1px solid var(--line);min-height:54px}.activity-compare-row textarea:before{content:attr(aria-label)}.web-choice-wide{justify-content:flex-start}}
  `;
  document.head.appendChild(s);
}

function weekOneIsOpen(){
  const no=document.getElementById('lessonNo')?.textContent?.trim();
  return no==='01' && document.getElementById('lessonView')?.classList.contains('active');
}

function replaceSection(title,html){
  const section=[...document.querySelectorAll('.flow-section')].find(s=>s.querySelector('.flow-title')?.textContent.trim()===title);
  if(!section)return;
  const stage=section.querySelector('.material-stage');
  if(!stage||stage.dataset.week01Web==='1')return;
  const article=stage.querySelector('article');
  if(!article)return;
  article.querySelector('.pdf-frame')?.remove();
  article.querySelector('.pdf-reader-link')?.remove();
  const web=document.createElement('div');
  web.className='week01-web-content';
  web.innerHTML=html;
  article.insertBefore(web,article.firstChild);
  stage.dataset.week01Web='1';
}

function enhance(){
  if(!weekOneIsOpen())return;
  mountStyles();
  replaceSection('Ders Notu',NOTE_HTML);
  replaceSection('Öğrenci Etkinliği',ACTIVITY_HTML);
}

mountStyles();
new MutationObserver(enhance).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
window.addEventListener('popstate',()=>requestAnimationFrame(enhance));
requestAnimationFrame(enhance);
})();