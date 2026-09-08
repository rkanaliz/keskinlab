(()=>{'use strict';
const q=s=>document.querySelector(s), mobile=q('#siteShellMobile'), search=q('#siteShellSearch'), input=q('#siteShellSearchInput'), results=q('#siteShellResults');
const norm=v=>String(v||'').toLocaleLowerCase('tr-TR').replace(/ı/g,'i').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const labels={sunum:'Sunu','ders-notu':'Ders Notu','ogrenci-etkinligi':'Öğrenci Etkinliği / Çalışma Kâğıdı',infografik:'İnfografik','hafta-ozeti':'Hafta Özeti','olcme-degerlendirme/kisa-cevap':'Kısa Cevaplı Test','olcme-degerlendirme/rubrik':'Rubrik','ogretmen/gozlem-formu':'Öğretmen Gözlem Formu'};
const courses={'5-sinif':'5. Sınıf BTY','6-sinif':'6. Sınıf BTY',robotik:'Robotik Kodlama','yapay-zeka':'Yapay Zekâ'};
const staticRecords=[['DERS','5. Sınıf BTY','/5-sinif-bty'],['DERS','6. Sınıf BTY','/6-sinif-bty'],['DERS','Robotik Kodlama','/robotik-kodlama'],['DERS','Yapay Zekâ Uygulamaları','/yapay-zeka'],['EVRAK','Evrak Çantası','/evrak-cantasi'],['TAKVİM','Eğitim Takvimi','/takvim'],['REHBER','Dijital Araçlar','/dijital-araclar']];
const materialRecords=(window.KeskinLabHomepageMaterials||[]).map(m=>['MATERYAL',`${courses[m.course]} · Hafta ${m.week} · ${labels[m.type]||m.type}`,'/'+m.href]);
const records=[...staticRecords,...materialRecords];
function close(){mobile.hidden=true;search.hidden=true;document.body.style.overflow=''}
function openSearch(){mobile.hidden=true;search.hidden=false;document.body.style.overflow='hidden';input.value='';render('');input.focus()}
function render(value){const terms=norm(value).split(' ').filter(Boolean);const found=terms.length?records.filter(r=>terms.every(t=>norm(r[1]).includes(t))).slice(0,16):staticRecords;results.innerHTML=found.map(r=>`<a href="${r[2]}"><small>${r[0]}</small>${r[1]}</a>`).join('')||'<p>Bu arama için mevcut kaynak bulunamadı.</p>'}
q('#siteShellMenuButton')?.addEventListener('click',()=>{mobile.hidden=!mobile.hidden;search.hidden=true;document.body.style.overflow=mobile.hidden?'':'hidden'});q('#siteShellSearchButton')?.addEventListener('click',openSearch);q('#siteShellMobileSearch')?.addEventListener('click',openSearch);document.querySelectorAll('[data-shell-close]').forEach(b=>b.addEventListener('click',close));input?.addEventListener('input',e=>render(e.target.value));document.addEventListener('keydown',e=>{if(e.key==='Escape')close();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch()}});
})();
