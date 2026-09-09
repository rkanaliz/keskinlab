(() => {
  const guides = {
    'eba-guide': {
      type: 'DERS HAZIRLIĞI · 4 ADIM',
      title: 'EBA’da 10 dakikada içerik bul',
      steps: ['Ders ve sınıf seviyeni seç; aramayı bütün EBA üzerinde açık bırakma.', 'İçerik türünü görsel, etkileşimli içerik, video veya alıştırma olarak daralt.', 'İçeriği dersten önce öğrenci görünümünde açıp süre ve erişim kontrolü yap.', 'Bağlantıyı ders planına ekle ve çevrim dışı bir yedek hazırla.'],
      note: 'KeskinLab notu: İlk keşifte tek bir konuya odaklanmak, platformda kaybolmadan hızlıca kullanılabilir içerik bulmayı kolaylaştırır.'
    },
    'ai-guide': {
      type: 'ETİK & GÜVENLİK · 5 KONTROL',
      title: 'Yapay zekâyı güvenle kullan',
      steps: ['Araç öğrencinin kişisel verisini veya okul bilgisini istiyor mu?', 'Üretilen bilgi en az bir güvenilir kaynaktan doğrulanabiliyor mu?', 'Kullanılan kaynaklar ve yapay zekâ desteği açıkça belirtiliyor mu?', 'Öğrencinin düşünmesi ve kendi katkısı üründe görünür durumda mı?', 'Araç ve üretilen içerik öğrencinin yaşına uygun mu?'],
      note: 'Bu kontrol listesi, YEĞİTEK’in güvenli ve sorumlu kullanım yaklaşımını sınıf içi karara dönüştüren kısa bir başlangıçtır.'
    },
    'd3-guide': {
      type: 'SINIFTA UYGULAMA · 40 DAKİKA',
      title: 'D3 senaryosunu sınıfına uyarla',
      steps: ['Senaryodaki temel öğrenme hedefini tek cümleyle belirle.', 'Hazırlık ve anlatım bölümünü 10 dakikayla sınırla.', 'Dijital aracı okulun cihaz ve bağlantı imkânına göre seç veya değiştir.', 'Öğrencinin ders sonunda göstereceği tek, gözlenebilir ürünü tanımla.'],
      note: 'Hazır senaryonun her adımını uygulamak gerekmez; hedefi koruyup süreyi ve aracı değiştirebilirsin.'
    }
  };
  const dialog = document.querySelector('#guideDialog');
  const title = document.querySelector('#guideDialogTitle');
  const type = document.querySelector('#guideDialogType');
  const steps = document.querySelector('#guideDialogSteps');
  const note = document.querySelector('#guideDialogNote');
  let lastTrigger = null;
  const close = () => { if (!dialog || dialog.hidden) return; dialog.hidden = true; document.body.style.overflow = ''; lastTrigger?.focus(); };
  document.querySelectorAll('[data-guide]').forEach((button) => button.addEventListener('click', () => {
    const guide = guides[button.dataset.guide]; if (!guide || !dialog) return;
    lastTrigger = button; type.textContent = guide.type; title.textContent = guide.title;
    steps.innerHTML = guide.steps.map((step) => `<li>${step}</li>`).join(''); note.textContent = guide.note;
    dialog.hidden = false; document.body.style.overflow = 'hidden'; dialog.querySelector('.dialog-close')?.focus();
  }));
  dialog?.querySelectorAll('[data-dialog-close]').forEach((el) => el.addEventListener('click', close));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
  const reveal = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) reveal.forEach((el) => el.classList.add('is-visible'));
  else { const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: .12 }); reveal.forEach((el) => observer.observe(el)); }
})();
