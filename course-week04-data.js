/* Hafta 04 materyal paketi: mevcut 6. sınıf viewer veri katmanına eklenir. */
(() => {
  'use strict';
  const data = window.KL5_DATA;
  if (!data) return;

  const base = '/materyaller/6-sinif/hafta04';
  data.materials = data.materials || {};
  data.resourceBundles = data.resourceBundles || {};

  data.materials['4'] = {
    sunum: Array.from({ length: 32 }, (_, i) => `${base}/sunum/${String(i + 1).padStart(2, '0')}.png`)
  };

  const file = (id, label, group) => ({
    id,
    label,
    group,
    pdf: `${base}/evraklar/${id}.pdf`,
    docx: `${base}/evraklar/${id}.docx`
  });

  data.resourceBundles['4'] = [
    file('00-ogretmen-uygulama-kilavuzu', 'Öğretmen Uygulama Kılavuzu', 'teacher'),
    file('01-sorudan-veriye', 'Sorudan Veriye', 'student'),
    file('02-veriden-bulguya', 'Veriden Bulguya', 'student'),
    file('03-performans-gorevi-rubrik', 'Performans Görevi + Rubrik', 'assessment'),
    file('04-oz-akran-degerlendirme', 'Öz + Akran Değerlendirme', 'assessment'),
    file('05-ogretmen-kontrol-listesi', 'Öğretmen Kontrol Listesi', 'teacher')
  ];

  const week = data.weeks.find(item => item.n === 4);
  if (week) week.saat = '2';
})();
