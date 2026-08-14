(function(){
  const EVENTS = [{"date": "2026-08-30", "label": "Zafer Bayramı", "type": "kutlama"}, {"date": "2026-09-01", "label": "Öğretmenlerin Mesleki Çalışmaları Başlangıcı", "type": "donem"}, {"date": "2026-09-07", "label": "Uluslararası Temiz Hava Günü", "type": "gun"}, {"date": "2026-09-07", "end": "2026-09-11", "label": "Uyum Eğitimleri (Okul Öncesi ve 1. Sınıf)", "type": "hafta"}, {"date": "2026-09-12", "label": "Dünya İlk Yardım Günü", "type": "gun"}, {"date": "2026-09-14", "label": "Ders Yılı Başlangıcı", "type": "donem"}, {"date": "2026-09-14", "end": "2026-09-20", "label": "İlköğretim Haftası", "type": "hafta"}, {"date": "2026-09-19", "label": "Gaziler Günü", "type": "gun"}, {"date": "2026-09-20", "label": "Öğrenciler Günü", "type": "gun"}, {"date": "2026-09-28", "label": "Dünya Okul Sütü Günü", "type": "gun"}, {"date": "2026-09-28", "end": "2026-10-04", "label": "Disleksi Haftası", "type": "hafta"}, {"date": "2026-10-01", "label": "Dünya Disleksi Günü", "type": "gun"}, {"date": "2026-10-04", "label": "Hayvanları Koruma Günü", "type": "gun"}, {"date": "2026-10-08", "end": "2026-10-12", "label": "Ahilik Kültürü Haftası", "type": "hafta"}, {"date": "2026-10-13", "label": "Dünya Afet Azaltma Günü", "type": "gun"}, {"date": "2026-10-24", "label": "Birleşmiş Milletler Günü", "type": "gun"}, {"date": "2026-10-29", "label": "Cumhuriyet Bayramı", "type": "kutlama"}, {"date": "2026-10-29", "end": "2026-11-04", "label": "Kızılay Haftası", "type": "hafta"}, {"date": "2026-11-02", "end": "2026-11-08", "label": "Lösemili Çocuklar Haftası", "type": "hafta"}, {"date": "2026-11-03", "end": "2026-11-09", "label": "Organ Bağışı ve Nakli Haftası", "type": "hafta"}, {"date": "2026-11-10", "end": "2026-11-16", "label": "Atatürk Haftası", "type": "hafta"}, {"date": "2026-11-12", "label": "Afet Eğitimi Hazırlık Günü", "type": "gun"}, {"date": "2026-11-14", "label": "Dünya Diyabet Günü", "type": "gun"}, {"date": "2026-11-16", "end": "2026-11-20", "label": "Ara Tatil", "type": "tatil"}, {"date": "2026-11-20", "label": "Dünya Felsefe Günü", "type": "gun"}, {"date": "2026-11-20", "label": "Dünya Çocuk Hakları Günü", "type": "gun"}, {"date": "2026-11-21", "end": "2026-11-27", "label": "Ağız ve Diş Sağlığı Haftası", "type": "hafta"}, {"date": "2026-11-24", "label": "Öğretmenler Günü", "type": "kutlama"}, {"date": "2026-12-03", "label": "Dünya Engelliler Günü", "type": "gun"}, {"date": "2026-12-04", "label": "Dünya Madenciler Günü", "type": "gun"}, {"date": "2026-12-05", "label": "Türk Kadınına Seçme ve Seçilme Hakkının Verilişi", "type": "gun"}, {"date": "2026-12-07", "end": "2026-12-17", "label": "Mevlana Haftası", "type": "hafta"}, {"date": "2026-12-07", "end": "2026-12-13", "label": "İnsan Hakları ve Demokrasi Haftası", "type": "hafta"}, {"date": "2026-12-12", "end": "2026-12-18", "label": "Tutum, Yatırım ve Türk Malları Haftası", "type": "hafta"}, {"date": "2026-12-20", "end": "2026-12-27", "label": "Mehmet Akif Ersoy'u Anma Haftası", "type": "hafta"}, {"date": "2027-01-01", "label": "Yılbaşı", "type": "tatil"}, {"date": "2027-01-04", "end": "2027-01-10", "label": "Enerji Tasarrufu Haftası", "type": "hafta"}, {"date": "2027-01-25", "end": "2027-02-05", "label": "Yarıyıl Tatili", "type": "tatil"}, {"date": "2027-02-22", "end": "2027-02-28", "label": "Vergi Haftası", "type": "hafta"}, {"date": "2027-03-01", "end": "2027-03-07", "label": "Yeşilay Haftası", "type": "hafta"}, {"date": "2027-03-01", "end": "2027-03-07", "label": "Girişimcilik Haftası", "type": "hafta"}, {"date": "2027-03-08", "end": "2027-03-11", "label": "Ramazan Bayramı", "type": "tatil"}, {"date": "2027-03-08", "label": "Dünya Kadınlar Günü", "type": "gun"}, {"date": "2027-03-08", "end": "2027-03-14", "label": "Bilim ve Teknoloji Haftası", "type": "hafta"}, {"date": "2027-03-12", "label": "Ara Tatil", "type": "tatil"}, {"date": "2027-03-12", "label": "İstiklâl Marşı'nın Kabulü ve Mehmet Akif Ersoy'u Anma Günü", "type": "gun"}, {"date": "2027-03-15", "end": "2027-03-21", "label": "Tüketiciyi Koruma Haftası", "type": "hafta"}, {"date": "2027-03-15", "end": "2027-03-21", "label": "Türk Dünyası ve Toplulukları Haftası", "type": "hafta"}, {"date": "2027-03-18", "label": "Şehitler Günü", "type": "gun"}, {"date": "2027-03-18", "end": "2027-03-24", "label": "Yaşlılar Haftası", "type": "hafta"}, {"date": "2027-03-21", "end": "2027-03-26", "label": "Orman Haftası", "type": "hafta"}, {"date": "2027-03-22", "label": "Dünya Su Günü", "type": "gun"}, {"date": "2027-03-27", "label": "Dünya Tiyatrolar Günü", "type": "gun"}, {"date": "2027-03-29", "end": "2027-04-04", "label": "Kütüphaneler Haftası", "type": "hafta"}, {"date": "2027-04-01", "end": "2027-04-07", "label": "Kanser Haftası", "type": "hafta"}, {"date": "2027-04-02", "label": "Dünya Otizm Farkındalık Günü", "type": "gun"}, {"date": "2027-04-07", "label": "Kişisel Verileri Koruma Günü", "type": "gun"}, {"date": "2027-04-07", "end": "2027-04-13", "label": "Dünya Sağlık Haftası", "type": "hafta"}, {"date": "2027-04-15", "end": "2027-04-22", "label": "Turizm Haftası", "type": "hafta"}, {"date": "2027-04-23", "label": "Ulusal Egemenlik ve Çocuk Bayramı", "type": "kutlama"}, {"date": "2027-04-26", "label": "Dünya Fikrî Mülkiyet Günü", "type": "gun"}, {"date": "2027-04-26", "end": "2027-05-02", "label": "Bilişim Haftası", "type": "hafta"}, {"date": "2027-04-26", "end": "2027-05-02", "label": "Trafik ve İlkyardım Haftası", "type": "hafta"}, {"date": "2027-04-29", "label": "Kût'ül Amâre Zaferi", "type": "gun"}, {"date": "2027-05-01", "label": "Emek ve Dayanışma Günü", "type": "tatil"}, {"date": "2027-05-03", "end": "2027-05-09", "label": "Vakıflar Haftası", "type": "hafta"}, {"date": "2027-05-04", "end": "2027-05-10", "label": "İş Sağlığı ve Güvenliği Haftası", "type": "hafta"}, {"date": "2027-05-09", "label": "Anneler Günü", "type": "gun"}, {"date": "2027-05-10", "end": "2027-05-16", "label": "Engelliler Haftası", "type": "hafta"}, {"date": "2027-05-15", "end": "2027-05-18", "label": "Kurban Bayramı", "type": "tatil"}, {"date": "2027-05-18", "end": "2027-05-24", "label": "Müzeler Haftası", "type": "hafta"}, {"date": "2027-05-19", "label": "19 Mayıs / Kurban Bayramı (5. gün)", "type": "kutlama"}, {"date": "2027-05-25", "label": "Etik Günü", "type": "gun"}, {"date": "2027-05-29", "label": "İstanbul'un Fethi", "type": "gun"}, {"date": "2027-05-31", "end": "2027-06-06", "label": "Hayat Boyu Öğrenme Haftası", "type": "hafta"}, {"date": "2027-06-07", "end": "2027-06-13", "label": "Çevre ve İklim Değişikliği Haftası", "type": "hafta"}, {"date": "2027-06-20", "label": "Babalar Günü", "type": "gun"}, {"date": "2027-06-25", "label": "Ders Yılı Bitişi", "type": "donem"}, {"date": "2027-07-15", "label": "15 Temmuz Demokrasi ve Millî Birlik Günü", "type": "kutlama"}, {"date": "2027-08-30", "label": "Zafer Bayramı", "type": "kutlama"}];

  const TR_MONTHS_SHORT = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];

  function parseDate(s){
    const [y,m,d] = s.split('-').map(Number);
    return new Date(y, m-1, d);
  }
  function fmtShort(s){
    const [y,m,d] = s.split('-').map(Number);
    return `${d} ${TR_MONTHS_SHORT[m-1]}`;
  }
  function daysBetween(a,b){
    const MS = 24*60*60*1000;
    const da = new Date(a.getFullYear(),a.getMonth(),a.getDate());
    const db = new Date(b.getFullYear(),b.getMonth(),b.getDate());
    return Math.round((db-da)/MS);
  }
  function countLabel(n){
    if(n === 0) return 'Bugün';
    if(n === 1) return 'Yarın';
    return `${n} gün sonra`;
  }

  function upcomingEvents(today, limit){
    const items = EVENTS
      .map(e => ({...e, _d: parseDate(e.date)}))
      .filter(e => daysBetween(today, e._d) >= 0)
      .sort((a,b) => a._d - b._d);
    const seen = new Set();
    const out = [];
    for(const e of items){
      if(seen.has(e.label)) continue;
      seen.add(e.label);
      out.push(e);
      if(out.length >= limit) break;
    }
    return out;
  }

  function render(){
    const list = document.getElementById('upcoming-list');
    if(!list) return;
    const today = new Date();
    const items = upcomingEvents(today, 6);
    if(items.length === 0){
      list.innerHTML = '<div class="upcoming-item"><span class="up-label">Yaklaşan özel gün bulunamadı.</span></div>';
      return;
    }
    list.innerHTML = items.map(e => {
      const n = daysBetween(today, e._d);
      return `<div class="upcoming-item">
        <span class="up-date">${fmtShort(e.date)}</span>
        <span class="up-label">${e.label}</span>
        <span class="up-count">${countLabel(n)}</span>
      </div>`;
    }).join('');
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
