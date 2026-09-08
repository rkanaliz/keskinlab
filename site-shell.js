(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const openers = new WeakMap();
  const courses = [['5. Sınıf BTY', '/5-sinif-bty'], ['6. Sınıf BTY', '/6-sinif-bty'], ['Robotik Kodlama', '/robotik-kodlama'], ['Yapay Zekâ Uygulamaları', '/yapay-zeka']];
  const labels = { sunum: 'Sunu', 'ders-notu': 'Ders Notu', 'ogrenci-etkinligi': 'Öğrenci Etkinliği / Çalışma Kâğıdı', infografik: 'İnfografik', 'hafta-ozeti': 'Hafta Özeti', 'olcme-degerlendirme/kisa-cevap': 'Kısa Cevaplı Test', 'olcme-degerlendirme/rubrik': 'Rubrik', 'ogretmen/gozlem-formu': 'Öğretmen Gözlem Formu' };
  const courseNames = { '5-sinif': '5. Sınıf BTY', '6-sinif': '6. Sınıf BTY', robotik: 'Robotik Kodlama', 'yapay-zeka': 'Yapay Zekâ' };
  const baseRecords = [...courses.map(([title, href]) => ['DERS', title, href]), ['EVRAK', 'Evrak Çantası', '/evrak-cantasi'], ['TAKVİM', 'Eğitim Takvimi', '/takvim'], ['REHBER', 'Dijital Araçlar', '/dijital-araclar'], ['SAYFA', 'Hakkında', '/hakkinda']];
  const materialRecords = (window.KeskinLabHomepageMaterials || []).map((item) => ['MATERYAL', `${courseNames[item.course]} · Hafta ${item.week} · ${labels[item.type] || item.type}`, `/${String(item.href).replace(/^\//, '')}`]);
  const records = [...baseRecords, ...materialRecords];
  const normalize = (value) => String(value || '').toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  function syncModal() { const active = !$('#searchDialog').hidden || !$('#mobileMenu').hidden; document.body.classList.toggle('shell-modal-open', active); $('#mobileBackdrop').hidden = $('#mobileMenu').hidden; }
  function close(box, restore = true) { box.hidden = true; const trigger = box.id === 'lessonMenu' ? $('#startLesson') : box.id === 'mobileMenu' ? $('#mobileMenuTrigger') : null; trigger?.setAttribute('aria-expanded', 'false'); syncModal(); if (restore) openers.get(box)?.focus(); }
  function open(box, opener) { ['#lessonMenu', '#mobileMenu', '#searchDialog'].forEach((selector) => { const other = $(selector); if (other !== box && !other.hidden) close(other, false); }); openers.set(box, opener || document.activeElement); box.hidden = false; syncModal(); }
  function renderResults(value) { const terms = normalize(value).split(' ').filter(Boolean); const found = terms.length ? records.filter((record) => terms.every((term) => normalize(record[1]).includes(term))).slice(0, 16) : baseRecords; $('#searchResults').innerHTML = found.length ? found.map(([type, title, href]) => `<a class="search-result" href="${href}"><small>${type}</small><strong>${title}</strong></a>`).join('') : '<p class="search-help">Bu arama için mevcut kaynak bulunamadı.</p>'; }
  function openSearch(opener) { open($('#searchDialog'), opener); $('#searchInput').value = ''; renderResults(''); $('#searchInput').focus(); }
  function toggleLessonMenu() { const box = $('#lessonMenu'); if (!box.hidden) return close(box); box.innerHTML = `<p>Ders çalışma alanını açın.</p>${courses.map(([label, href]) => `<a href="${href}">${label}</a>`).join('')}`; open(box, $('#startLesson')); $('#startLesson').setAttribute('aria-expanded', 'true'); box.querySelector('a')?.focus(); }
  function trap(box, event) { const controls = [...box.querySelectorAll('a[href],button:not(:disabled),input')].filter((element) => element.getClientRects().length); if (!controls.length) return; if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls.at(-1).focus(); } else if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0].focus(); } }
  $('#startLesson')?.addEventListener('click', toggleLessonMenu);
  $('#mobileMenuTrigger')?.addEventListener('click', () => { open($('#mobileMenu'), $('#mobileMenuTrigger')); $('#mobileMenuTrigger').setAttribute('aria-expanded', 'true'); $('#mobileMenu .menu-close')?.focus(); });
  $('#mobileMenu .menu-close')?.addEventListener('click', () => close($('#mobileMenu')));
  $('#mobileBackdrop')?.addEventListener('click', () => close($('#mobileMenu')));
  $('#mobileMenu .menu-search')?.addEventListener('click', () => openSearch($('#mobileMenuTrigger')));
  $$('#mobileMenu a').forEach((link) => link.addEventListener('click', () => close($('#mobileMenu'), false)));
  $('#searchTrigger')?.addEventListener('click', () => openSearch($('#searchTrigger')));
  $('#searchClose')?.addEventListener('click', () => close($('#searchDialog')));
  $('#searchDialog')?.addEventListener('click', (event) => { if (event.target === $('#searchDialog')) close($('#searchDialog')); });
  $('#searchInput')?.addEventListener('input', (event) => renderResults(event.target.value));
  document.addEventListener('click', (event) => { const box = $('#lessonMenu'); if (box && !box.hidden && !box.contains(event.target) && !$('#startLesson').contains(event.target)) close(box, false); });
  document.addEventListener('keydown', (event) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch($('#searchTrigger')); return; } const box = ['#searchDialog', '#mobileMenu', '#lessonMenu'].map($).find((element) => element && !element.hidden); if (!box) return; if (event.key === 'Escape') { event.preventDefault(); close(box); return; } if (event.key === 'Tab') trap(box, event); });
})();
