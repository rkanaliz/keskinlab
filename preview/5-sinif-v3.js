(function () {
  'use strict';

  var D = window.KL5_DATA;
  if (!D) { console.error('KL5_DATA yüklenemedi'); return; }

  // ---------------------------------------------------------------
  // Tarih yardımcıları (home-calendar.js ile aynı teknik: yerel gün karşılaştırması)
  // ---------------------------------------------------------------
  function parseISO(s) {
    var p = s.split('-').map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }
  function daysBetween(a, b) {
    var MS = 24 * 60 * 60 * 1000;
    var da = new Date(a.getFullYear(), a.getMonth(), a.getDate());
    var db = new Date(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((db - da) / MS);
  }
  function todayDate() { return new Date(); }

  function replayMotion(el, className) {
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
  }

  // ---------------------------------------------------------------
  // Öğrenci akışı — 37 haftanın gerçek konu/süreç bileşenlerinden
  // elle kürate edilmiş sunum-katmanı metni (bkz. 5-sinif-v3-data.js
  // içindeki "studentCopy" bloğunun başındaki not). Resmî cikti/surec
  // alanları değişmeden kalır; burada yalnızca öğrenciye görünen kısa
  // açıklama ve akış adımları okunur. Kürasyon bulunmayan (örn. ileride
  // eklenecek) haftalarda güvenli, mekanik olmayan bir yedek kullanılır.
  // ---------------------------------------------------------------
  function deriveFlow(week) {
    if (week.n === 1) return D.week1Flow;
    if (week.ozel) return [];
    var copy = D.studentCopy && D.studentCopy[String(week.n)];
    if (copy && copy.flow && copy.flow.length) {
      return copy.flow.map(function (l) { return { title: l }; });
    }
    return [];
  }

  function studentExplainer(week) {
    if (week.ozel) return null;
    var copy = D.studentCopy && D.studentCopy[String(week.n)];
    if (copy && copy.explainer) return copy.explainer;
    if (!week.cikti) return null;
    // Kürasyon henüz yapılmamış bir hafta için sade bir yedek metin
    // (resmî öğrenme çıktısının doğal dile çevrilmiş hâli)
    var first = week.cikti.replace(/^\S*\d(?:\.\d+)+\.?\s*/u, '').trim();
    first = first.replace(/\s+\S*\d(?:\.\d+)+.*$/u, '');
    return 'Bu hafta ' + first.charAt(0).toLocaleLowerCase('tr') + first.slice(1);
  }

  // ---------------------------------------------------------------
  // Takvim örtüşmesi
  // ---------------------------------------------------------------
  function overlappingEvents(startISO, endISO) {
    var s = parseISO(startISO), e = parseISO(endISO);
    return D.events.filter(function (ev) {
      var evStart = parseISO(ev.date);
      var evEnd = ev.end ? parseISO(ev.end) : evStart;
      return evStart <= e && evEnd >= s && (ev.type === 'tatil' || ev.type === 'kutlama' || ev.type === 'donem');
    });
  }

  // ---------------------------------------------------------------
  // Bugünkü durum motoru
  // ---------------------------------------------------------------
  function determineContext() {
    var today = todayDate();
    var weeks = D.weeks;
    for (var i = 0; i < weeks.length; i++) {
      var w = weeks[i];
      if (parseISO(w.baslangic) <= today && today <= parseISO(w.bitis)) {
        return { state: 'active', week: w };
      }
    }
    var first = weeks[0], last = weeks[weeks.length - 1];
    if (today < parseISO(first.baslangic)) {
      return { state: 'before', week: first, daysUntil: daysBetween(today, parseISO(first.baslangic)) };
    }
    if (today > parseISO(last.bitis)) {
      return { state: 'after', week: last };
    }
    // aradaki boşluk (tatil / hafta sonu)
    var upcoming = null;
    for (var j = 0; j < weeks.length; j++) {
      if (parseISO(weeks[j].baslangic) > today) { upcoming = weeks[j]; break; }
    }
    var ev = null;
    if (upcoming) {
      var idx = weeks.indexOf(upcoming);
      var prevEnd = idx > 0 ? weeks[idx - 1].bitis : first.baslangic;
      var evs = overlappingEvents(prevEnd, upcoming.baslangic);
      ev = evs.length ? evs[0] : null;
    }
    return { state: 'gap', week: upcoming || last, event: ev };
  }

  // ---------------------------------------------------------------
  // Hafta görsel alanı — tema başına küçük bir "keşif sahnesi" yer
  // tutucusu. Amaç ikon göstermek değil, o temanın dünyasını basit
  // geometrik siluetlerle hissettirmek; final clay/3D görsel asset
  // gelene kadar tek satırda değiştirilebilecek bir slot olarak kalır.
  // (bkz. renderVisual — köşedeki mono etiket tema adını taşır.)
  // ---------------------------------------------------------------
  var ACCENT = 'var(--color-accent)';
  var TEXT = 'var(--color-text)';
  var THEME_SCENES = {
    // Tema 1 — farklı cihazları iki kümeye ayırıp gruplama fikri
    '1': '<svg viewBox="0 0 160 120" fill="none">' +
      '<rect x="18" y="30" width="26" height="40" rx="6" fill="' + ACCENT + '" opacity=".14"/>' +
      '<rect x="48" y="46" width="20" height="24" rx="10" fill="' + ACCENT + '" opacity=".22"/>' +
      '<rect x="22" y="36" width="18" height="28" rx="4" stroke="' + TEXT + '" stroke-width="2.5"/>' +
      '<circle cx="58" cy="58" r="9" stroke="' + TEXT + '" stroke-width="2.5"/>' +
      '<line x1="76" y1="60" x2="76" y2="30" stroke="' + TEXT + '" stroke-width="1.5" stroke-dasharray="3 5"/>' +
      '<rect x="98" y="34" width="24" height="34" rx="4" fill="' + ACCENT + '" opacity=".14"/>' +
      '<rect x="100" y="38" width="20" height="26" rx="3" stroke="' + TEXT + '" stroke-width="2.5"/>' +
      '<rect x="128" y="48" width="20" height="16" rx="3" stroke="' + TEXT + '" stroke-width="2.5"/>' +
      '</svg>',
    // Tema 2 — kurgudan görsele/dosyaya dönüşen bir "yapım" katmanı
    '2': '<svg viewBox="0 0 160 120" fill="none">' +
      '<rect x="30" y="28" width="70" height="50" rx="6" fill="' + ACCENT + '" opacity=".12"/>' +
      '<rect x="42" y="38" width="70" height="50" rx="6" stroke="' + TEXT + '" stroke-width="2.5"/>' +
      '<path d="M52 62l12-12 10 8 14-16" stroke="' + ACCENT + '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="118" cy="34" r="7" fill="' + ACCENT + '" opacity=".9"/>' +
      '<path d="M115 34l2 2 4-5" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>',
    // Tema 3 — farklı büyüklükte düğümlerin gevşek bir ağ oluşturması
    '3': '<svg viewBox="0 0 160 120" fill="none">' +
      '<circle cx="80" cy="60" r="11" stroke="' + TEXT + '" stroke-width="2.5"/>' +
      '<circle cx="34" cy="34" r="7" fill="' + ACCENT + '" opacity=".7"/>' +
      '<circle cx="126" cy="30" r="6" fill="' + ACCENT + '" opacity=".5"/>' +
      '<circle cx="30" cy="86" r="6" fill="' + ACCENT + '" opacity=".5"/>' +
      '<circle cx="128" cy="88" r="8" fill="' + ACCENT + '" opacity=".7"/>' +
      '<path d="M69 52L38 37M91 53l31-21M70 68L36 82M91 68l32 17" stroke="' + TEXT + '" stroke-width="1.5"/>' +
      '</svg>',
    // Tema 4 — katmanlı kalkan + kilit: etik/güvenlik hissi
    '4': '<svg viewBox="0 0 160 120" fill="none">' +
      '<path d="M80 22l30 11v20c0 22-13 34-30 39-17-5-30-17-30-39V33l30-11z" fill="' + ACCENT + '" opacity=".12"/>' +
      '<path d="M80 30l24 9v16c0 18-10 27-24 31-14-4-24-13-24-31V39l24-9z" stroke="' + TEXT + '" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<rect x="70" y="58" width="20" height="15" rx="2" stroke="' + TEXT + '" stroke-width="2.2"/>' +
      '<path d="M74 58v-6a6 6 0 0112 0v6" stroke="' + TEXT + '" stroke-width="2.2"/>' +
      '</svg>',
    // Tema 5 — merkezî düğümden yayılan gevşek bir yıldız kümesi
    '5': '<svg viewBox="0 0 160 120" fill="none">' +
      '<circle cx="80" cy="60" r="16" fill="' + ACCENT + '" opacity=".14"/>' +
      '<circle cx="80" cy="60" r="9" stroke="' + TEXT + '" stroke-width="2.5"/>' +
      '<circle cx="46" cy="42" r="4" fill="' + ACCENT + '" opacity=".8"/>' +
      '<circle cx="114" cy="40" r="3.5" fill="' + ACCENT + '" opacity=".6"/>' +
      '<circle cx="112" cy="84" r="4.5" fill="' + ACCENT + '" opacity=".8"/>' +
      '<circle cx="48" cy="86" r="3" fill="' + ACCENT + '" opacity=".5"/>' +
      '<path d="M72 53L48 44M89 54l24-13M87 68l24 15M73 68L50 83" stroke="' + TEXT + '" stroke-width="1.4" stroke-dasharray="2 4"/>' +
      '</svg>',
    // Tema 6 — üst üste bloklar: algoritma/yazılım inşası
    '6': '<svg viewBox="0 0 160 120" fill="none">' +
      '<rect x="42" y="70" width="76" height="14" rx="4" fill="' + ACCENT + '" opacity=".16"/>' +
      '<rect x="42" y="70" width="76" height="14" rx="4" stroke="' + TEXT + '" stroke-width="2.2"/>' +
      '<rect x="52" y="52" width="56" height="14" rx="4" fill="' + ACCENT + '" opacity=".16"/>' +
      '<rect x="52" y="52" width="56" height="14" rx="4" stroke="' + TEXT + '" stroke-width="2.2"/>' +
      '<rect x="62" y="34" width="36" height="14" rx="4" stroke="' + TEXT + '" stroke-width="2.2"/>' +
      '<path d="M118 41l8-8m0 0h-6m6 0v6" stroke="' + ACCENT + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>'
  };
  var SPECIAL_SCENE = '<svg viewBox="0 0 160 120" fill="none">' +
    '<rect x="52" y="26" width="56" height="70" rx="8" fill="' + ACCENT + '" opacity=".1"/>' +
    '<rect x="58" y="32" width="44" height="58" rx="5" stroke="' + TEXT + '" stroke-width="2.3"/>' +
    '<rect x="70" y="24" width="20" height="10" rx="3" fill="' + TEXT + '"/>' +
    '<path d="M68 56l9 9 15-17" stroke="' + ACCENT + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<line x1="68" y1="76" x2="92" y2="76" stroke="' + TEXT + '" stroke-width="2" stroke-linecap="round"/>' +
    '</svg>';
  var THEME_LABELS = {
    '1': 'TEMA 1', '2': 'TEMA 2', '3': 'TEMA 3', '4': 'TEMA 4', '5': 'TEMA 5', '6': 'TEMA 6'
  };

  // ---------------------------------------------------------------
  // Materyal ve öğretmen etiketleri
  // ---------------------------------------------------------------
  var MATERIAL_LABELS = {
    'sunum': 'Sunum', 'ders-notu': 'Ders Notu', 'ogrenci-etkinligi': 'Etkinlik',
    'infografik': 'İnfografik', 'hafta-ozeti': 'Hafta Özeti', 'olcme-degerlendirme': 'Ölçme / Değerlendirme'
  };
  // Ekranda gösterilecek görsel materyallerin seçici sırası
  var MATERIAL_ORDER = ['sunum', 'infografik', 'hafta-ozeti'];
  var IMAGE_EXT_RE = /\.(png|jpe?g|webp|gif)$/i;
  var PDF_EXT_RE = /\.pdf$/i;
  var activeMaterialType = null;
  var activeMaterialIndex = 0;
  var activeMaterialItems = [];

  // ---------------------------------------------------------------
  // Render: hafta görsel sahnesi (tema bazlı yer tutucu)
  // ---------------------------------------------------------------
  function renderVisual(week) {
    var el = document.getElementById('weekVisual');
    if (week.n === 1 && !week.ozel) {
      el.classList.add('is-question');
      el.removeAttribute('aria-hidden');
      el.innerHTML =
        '<div class="week-question">' +
          '<p class="week-question-label">Haftanın Sorusu</p>' +
          '<h3>Telefon, akıllı saat, yazıcı ve oyun konsolu aynı işi mi yapıyor?</h3>' +
          '<div class="week-question-prompts" aria-label="Soruyu düşünme yolları">' +
            '<span>Ne işe yarıyor?</span>' +
            '<span>Nerede kullanılıyor?</span>' +
            '<span>Zamanla nasıl değişti?</span>' +
          '</div>' +
        '</div>';
      return;
    }
    el.classList.remove('is-question');
    el.setAttribute('aria-hidden', 'true');
    var scene = week.ozel ? SPECIAL_SCENE : (THEME_SCENES[String(week.temaNo)] || SPECIAL_SCENE);
    var tag = week.ozel ? 'ÖZEL HAFTA' : (THEME_LABELS[String(week.temaNo)] || '');
    el.innerHTML = scene + (tag ? '<span class="scene-tag">' + tag + '</span>' : '');
  }

  // ---------------------------------------------------------------
  // Render: hafta yüzeyi
  // ---------------------------------------------------------------
  var currentN = null;

  function specialLabel(saat) {
    if (/SINAV/i.test(saat)) return 'Sınav Haftası';
    if (/SOSYAL/i.test(saat)) return 'Sosyal Etkinlik Haftası';
    if (/OKUL TEMELLİ/i.test(saat)) return 'Okul Temelli Planlama Haftası';
    return saat;
  }

  function renderWeek(n, opts) {
    opts = opts || {};
    var week = D.weeks.find(function (w) { return w.n === n; });
    if (!week) return;
    currentN = n;

    document.getElementById('weekTag').textContent = 'HAFTA ' + String(n).padStart(2, '0');
    document.getElementById('weekDate').textContent = week.tarih;

    var pill = document.getElementById('weekStatusPill');
    var ctx = determineContext();
    if (ctx.week.n === n && (ctx.state === 'active')) {
      pill.hidden = false; pill.textContent = 'Bu Hafta';
    } else if (ctx.week.n === n && ctx.state === 'before') {
      pill.hidden = false; pill.textContent = ctx.daysUntil + ' gün sonra başlıyor';
    } else if (ctx.week.n === n && ctx.state === 'gap') {
      pill.hidden = false; pill.textContent = ctx.event ? ctx.event.label : 'Sıradaki Hafta';
    } else if (ctx.week.n === n && ctx.state === 'after') {
      pill.hidden = false; pill.textContent = 'Dönemin Son Haftası';
    } else {
      pill.hidden = true;
    }

    var kicker = document.getElementById('weekKicker');
    var topic = document.getElementById('weekTopic');
    var explainer = document.getElementById('weekExplainer');

    if (week.ozel) {
      kicker.textContent = 'Bu hafta ders akışı farklı';
      topic.textContent = specialLabel(week.saat);
      explainer.textContent = 'Bu hafta için ölçme, sosyal etkinlik veya okul temelli planlama süreci uygulanır; yeni bir öğrenme çıktısı işlenmez.';
    } else {
      kicker.textContent = 'Bu hafta neyi keşfediyoruz?';
      topic.textContent = week.konu;
      explainer.textContent = studentExplainer(week) || '';
    }

    // akış
    var flow = deriveFlow(week);
    var flowEl = document.getElementById('flowChips');
    flowEl.innerHTML = flow.map(function (f, i) {
      var chip = '<span class="flow-chip"><span class="flow-chip-index">' + (i + 1) + '</span>' + f.title + '</span>';
      return i === 0 ? chip : '<span class="flow-connector"></span>' + chip;
    }).join('');

    // materyaller
    renderMaterials(week);

    // takvim bağlamı
    renderCalendarNote(week);

    // öğretmen paneli — bu hafta
    renderTeacherWeekLinks(week);

    // program bağlamı
    renderCurriculum(week);

    // gezinim: tema grubu + pill'ler
    renderThemeNav(week);

    // ok butonları
    document.getElementById('prevWeekBtn').disabled = n <= 1;
    document.getElementById('nextWeekBtn').disabled = n >= D.weeks.length;

    if (!opts.skipUrl) {
      var url = new URL(window.location.href);
      url.searchParams.set('week', n);
      window.history.replaceState({}, '', url);
    }

    replayMotion(document.querySelector('.week-surface-inner'), 'is-refreshing');
  }

  function materialViewerItem(files) {
    var images = files.filter(function (f) { return IMAGE_EXT_RE.test(f); });
    return { previews: images };
  }

  function materialSupportsFullscreen(key) {
    return key === 'sunum' || key === 'infografik' || key === 'hafta-ozeti';
  }

  function updateMaterialPage(index) {
    var active = activeMaterialItems.find(function (item) { return item.key === activeMaterialType; });
    if (!active || !active.previews.length) return;
    activeMaterialIndex = Math.max(0, Math.min(index, active.previews.length - 1));

    var el = document.getElementById('weekMaterials');
    var image = el.querySelector('.material-stage img');
    var counter = el.querySelector('.material-pagination span');
    var prev = el.querySelector('[data-material-page="prev"]');
    var next = el.querySelector('[data-material-page="next"]');
    if (image) {
      image.src = active.previews[activeMaterialIndex];
      replayMotion(image, 'is-changing');
    }
    if (counter) counter.textContent = (activeMaterialIndex + 1) + ' / ' + active.previews.length;
    if (prev) prev.disabled = activeMaterialIndex === 0;
    if (next) next.disabled = activeMaterialIndex === active.previews.length - 1;
  }

  function renderLessonFiles(mats) {
    var definitions = [
      { key: 'ogrenci-etkinligi', label: 'Etkinlik', openLabel: 'Etkinliği aç', downloadLabel: 'Etkinliği indir' },
      { key: 'ders-notu', label: 'Ders Notu', openLabel: 'Ders Notunu aç', downloadLabel: 'Ders Notunu indir' }
    ];
    var rows = definitions.map(function (definition) {
      var files = mats[definition.key] || [];
      var pdf = files.find(function (file) { return PDF_EXT_RE.test(file); });
      if (!pdf) return '';
      return '<div class="lesson-file-row">' +
        '<span class="lesson-file-name">' + definition.label + '</span>' +
        '<span class="lesson-file-actions">' +
          '<a href="' + pdf + '" aria-label="' + definition.openLabel + '">Aç</a>' +
          '<a href="' + pdf + '" download aria-label="' + definition.downloadLabel + '">↓ indir</a>' +
        '</span>' +
      '</div>';
    }).filter(Boolean).join('');
    if (!rows) return '';
    return '<section class="lesson-files" aria-labelledby="lessonFilesTitle">' +
      '<h3 class="lesson-files-title" id="lessonFilesTitle">DERS DOSYALARI</h3>' +
      '<div class="lesson-files-list">' + rows + '</div>' +
    '</section>';
  }

  function wireMaterialStage(stage, active) {
    if (!stage || active.previews.length < 2) return;
    var pointerStart = null;
    function isControl(target) {
      return target && target.closest && target.closest('button, a');
    }
    stage.addEventListener('pointerdown', function (event) {
      if (isControl(event.target)) return;
      pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
    });
    stage.addEventListener('pointerup', function (event) {
      if (!pointerStart || pointerStart.id !== event.pointerId || isControl(event.target)) {
        pointerStart = null;
        return;
      }
      var dx = event.clientX - pointerStart.x;
      var dy = event.clientY - pointerStart.y;
      var absX = Math.abs(dx);
      var absY = Math.abs(dy);
      pointerStart = null;

      if (absX >= 50 && absX > absY * 1.25) {
        updateMaterialPage(activeMaterialIndex + (dx < 0 ? 1 : -1));
        return;
      }
      if (absX > 10 || absY > 10) return;
      var bounds = stage.getBoundingClientRect();
      var position = (event.clientX - bounds.left) / bounds.width;
      if (position <= .3) updateMaterialPage(activeMaterialIndex - 1);
      if (position >= .7) updateMaterialPage(activeMaterialIndex + 1);
    });
    stage.addEventListener('pointercancel', function () { pointerStart = null; });
  }

  function renderMaterialViewer(week, items, lessonFiles) {
    var el = document.getElementById('weekMaterials');
    activeMaterialItems = items;
    var active = items.find(function (item) { return item.key === activeMaterialType; }) || items[0];
    activeMaterialType = active.key;
    activeMaterialIndex = Math.max(0, Math.min(activeMaterialIndex, active.previews.length - 1));

    var preview = active.previews[activeMaterialIndex];
    var hasPagination = active.previews.length > 1;
    var supportsFullscreen = materialSupportsFullscreen(active.key);
    var selector = items.map(function (item) {
      var selected = item.key === activeMaterialType;
      var shortLabel = item.label;
      return '<button class="material-selector-item' + (selected ? ' is-active' : '') + '" type="button" data-material-type="' + item.key + '" aria-pressed="' + selected + '">' +
        '<span class="material-label-full">' + item.label + '</span>' +
        '<span class="material-label-short">' + shortLabel + '</span>' +
      '</button>';
    }).join('');

    var pagination = hasPagination
      ? '<div class="material-pagination" aria-label="' + active.label + ' sayfaları">' +
          '<button type="button" class="material-page-btn" data-material-page="prev" aria-label="Önceki"' + (activeMaterialIndex === 0 ? ' disabled' : '') + '>←</button>' +
          '<span aria-live="polite">' + (activeMaterialIndex + 1) + ' / ' + active.previews.length + '</span>' +
          '<button type="button" class="material-page-btn" data-material-page="next" aria-label="Sonraki"' + (activeMaterialIndex === active.previews.length - 1 ? ' disabled' : '') + '>→</button>' +
        '</div>'
      : '<span></span>';
    var footer = hasPagination
      ? '<div class="material-viewer-footer">' + pagination + '</div>'
      : '';
    var fullscreenButton = supportsFullscreen
      ? '<button class="material-fullscreen-btn" type="button" title="Tam ekran" aria-label="Tam ekran">' +
          '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 3H3v4M13 3h4v4M17 13v4h-4M7 17H3v-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</button>'
      : '';

    el.innerHTML =
      '<div class="material-viewer">' +
        '<div class="material-stage-column">' +
          '<div class="material-stage">' +
            (preview ? '<img src="' + preview + '" alt="' + active.label + ' önizlemesi">' : '') +
            fullscreenButton +
          '</div>' +
          footer +
        '</div>' +
        '<div class="material-selector" aria-label="Materyal seçici">' + selector + '</div>' +
      '</div>' + lessonFiles;

    el.querySelectorAll('[data-material-type]').forEach(function (button) {
      button.addEventListener('click', function () {
        activeMaterialType = button.getAttribute('data-material-type');
        activeMaterialIndex = 0;
        renderMaterialViewer(week, items, lessonFiles);
      });
    });
    el.querySelectorAll('[data-material-page]').forEach(function (button) {
      button.addEventListener('click', function () {
        updateMaterialPage(activeMaterialIndex + (button.getAttribute('data-material-page') === 'next' ? 1 : -1));
      });
    });
    var fullscreenButtonEl = el.querySelector('.material-fullscreen-btn');
    if (fullscreenButtonEl) {
      fullscreenButtonEl.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
          return;
        }
        var target = fullscreenButtonEl.closest('.material-stage-column');
        if (target && target.requestFullscreen) target.requestFullscreen();
      });
    }
    wireMaterialStage(el.querySelector('.material-stage'), active);
    replayMotion(el.querySelector('.material-viewer'), 'is-switching');
  }

  function renderMaterials(week) {
    var el = document.getElementById('weekMaterials');
    var mats = D.materials[String(week.n)];
    if (!mats || week.ozel) {
      el.innerHTML = '<p class="materials-empty">' +
        (week.ozel ? 'Bu hafta için ek ders materyali bulunmuyor.' : 'Bu hafta için ek materyal henüz yüklenmedi. Günlük ders planı hazır.') +
        '</p>';
      return;
    }
    var items = [];
    var lessonFiles = renderLessonFiles(mats);
    MATERIAL_ORDER.forEach(function (key) {
      var files = mats[key];
      if (!files || !files.length) return;
      var viewerItem = materialViewerItem(files);
      if (!viewerItem.previews.length) return;
      viewerItem.key = key;
      viewerItem.label = MATERIAL_LABELS[key] || key;
      items.push(viewerItem);
    });
    if (!items.length && !lessonFiles) {
      el.innerHTML = '<p class="materials-empty">Bu hafta için ek materyal henüz yüklenmedi. Günlük ders planı hazır.</p>';
      return;
    }
    if (!items.length) { el.innerHTML = lessonFiles; return; }
    activeMaterialType = items[0].key;
    activeMaterialIndex = 0;
    renderMaterialViewer(week, items, lessonFiles);
  }

  document.addEventListener('keydown', function (event) {
    var fullscreen = document.fullscreenElement;
    if (!fullscreen || !fullscreen.classList.contains('material-stage-column')) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    var active = activeMaterialItems.find(function (item) { return item.key === activeMaterialType; });
    if (!active || active.previews.length < 2) return;
    event.preventDefault();
    updateMaterialPage(activeMaterialIndex + (event.key === 'ArrowRight' ? 1 : -1));
  });

  function renderCalendarNote(week) {
    var el = document.getElementById('weekCalendarNote');
    if (week.ozel) { el.hidden = true; return; }
    var evs = overlappingEvents(week.baslangic, week.bitis);
    if (!evs.length) {
      // gün tipi olayları da (belirli gün/hafta) göster, sınırlı
      evs = D.events.filter(function (ev) {
        var evStart = parseISO(ev.date);
        var evEnd = ev.end ? parseISO(ev.end) : evStart;
        return evStart <= parseISO(week.bitis) && evEnd >= parseISO(week.baslangic);
      });
    }
    if (!evs.length) { el.hidden = true; return; }
    el.hidden = false;
    el.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="1.3" stroke="currentColor" stroke-width="1.4"/><path d="M2 6.5h12M5.5 2v3M10.5 2v3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>' +
      '<span>Bu hafta: <b>' + evs.map(function (e) { return e.label; }).join(', ') + '</b></span>';
  }

  function renderTeacherWeekLinks(week) {
    var el = document.getElementById('teacherWeekLinks');
    var links = [];
    var plan = D.dailyPlans[week.n];
    if (plan) links.push('<a href="' + plan + '" class="teacher-link">Günlük Ders Planı</a>');
    var mats = D.materials[String(week.n)];
    if (mats) {
      if (mats['sunum'] && week.n !== 1) links.push('<a href="' + mats['sunum'][0] + '" class="teacher-link">Sınıf Sunumunu Aç</a>');
      if (mats['ogrenci-etkinligi']) links.push('<a href="' + mats['ogrenci-etkinligi'][0] + '" class="teacher-link">Çalışma Kâğıdı</a>');
      if (mats['ogretmen'] && mats['ogretmen']['gozlem-formu']) links.push('<a href="' + mats['ogretmen']['gozlem-formu'][0] + '" class="teacher-link">Gözlem Formu</a>');
    }
    el.innerHTML = links.length ? links.join('') : '<p class="teacher-empty">Bu hafta için özel öğretmen materyali henüz yok.</p>';
  }

  function renderCurriculum(week) {
    var el = document.getElementById('curriculumBody');
    if (week.ozel || !week.cikti) {
      el.innerHTML = '<p>Bu hafta yeni bir öğrenme çıktısı işlenmez.</p>';
      return;
    }
    var html = '<span class="code-line">' + week.cikti + '</span>';
    if (week.surec && week.surec.length) {
      html += '<ul>' + week.surec.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul>';
    }
    el.innerHTML = html;
  }

  function renderThemeNav(week) {
    var themeNo = week.ozel ? null : week.temaNo;
    var title = document.getElementById('themeGroupTitle');
    if (themeNo) {
      title.textContent = 'Tema ' + themeNo + ' · ' + D.themes[themeNo];
    } else {
      title.textContent = 'Bu Hafta';
    }

    var pillsEl = document.getElementById('themeWeekPills');
    var groupWeeks = D.weeks.filter(function (w) {
      if (themeNo) return !w.ozel && w.temaNo === themeNo;
      return false;
    });
    if (!groupWeeks.length) {
      // özel hafta: komşu haftaları göster
      var idx = D.weeks.findIndex(function (w) { return w.n === week.n; });
      groupWeeks = D.weeks.slice(Math.max(0, idx - 3), Math.min(D.weeks.length, idx + 4));
    }
    pillsEl.innerHTML = groupWeeks.map(function (w) {
      var cls = 'week-pill' + (w.n === week.n ? ' is-active' : '') + (w.ozel ? ' is-special' : '');
      return '<button type="button" class="' + cls + '" data-week="' + w.n + '">' + (w.ozel ? '—' : String(w.n).padStart(2, '0')) + '</button>';
    }).join('');
    Array.prototype.forEach.call(pillsEl.querySelectorAll('.week-pill'), function (btn) {
      btn.addEventListener('click', function () { renderWeek(Number(btn.dataset.week)); });
    });
  }

  function renderAllWeeksPanel() {
    var el = document.getElementById('allWeeksPanel');
    var html = '';
    // Temaya göre grupla (özel haftalar kendi ayrı bloklarında, sonda görünür)
    var byTheme = {};
    var specials = [];
    D.weeks.forEach(function (w) {
      if (w.ozel) { specials.push(w); return; }
      var k = w.temaNo;
      if (!byTheme[k]) byTheme[k] = [];
      byTheme[k].push(w);
    });
    Object.keys(D.themes).forEach(function (k) {
      var ws = byTheme[k] || [];
      if (!ws.length) return;
      html += '<div class="theme-group"><p class="theme-group-label">Tema ' + k + ' · ' + D.themes[k] + '</p><div class="theme-group-rows">';
      html += ws.map(function (w) {
        return '<div class="week-row" data-week="' + w.n + '"><span class="wn">H' + String(w.n).padStart(2, '0') + '</span><span class="wd">' + w.tarih + '</span><span class="wt">' + w.konu + '</span></div>';
      }).join('');
      html += '</div></div>';
    });
    if (specials.length) {
      html += '<div class="theme-group"><p class="theme-group-label">Sınav / Özel Haftalar</p><div class="theme-group-rows">';
      html += specials.map(function (w) {
        return '<div class="week-row is-special" data-week="' + w.n + '"><span class="wn">H' + String(w.n).padStart(2, '0') + '</span><span class="wd">' + w.tarih + '</span><span class="wt">' + specialLabel(w.saat) + '</span></div>';
      }).join('');
      html += '</div></div>';
    }
    el.innerHTML = html;
    Array.prototype.forEach.call(el.querySelectorAll('.week-row'), function (row) {
      row.addEventListener('click', function () {
        renderWeek(Number(row.dataset.week));
        el.hidden = true;
        document.getElementById('toggleAllWeeksBtn').textContent = 'Tüm Haftalar';
      });
    });
  }

  // ---------------------------------------------------------------
  // Bugün rozeti (üst şerit)
  // ---------------------------------------------------------------
  function renderTodayBadge() {
    var ctx = determineContext();
    var el = document.getElementById('courseStripMeta');
    var text;
    if (ctx.state === 'before') {
      text = 'Ders yılı ' + ctx.daysUntil + ' gün sonra başlıyor · ilk hafta <b>Hafta 01</b>';
    } else if (ctx.state === 'active') {
      text = 'Bugün: <b>Hafta ' + String(ctx.week.n).padStart(2, '0') + '</b>';
    } else if (ctx.state === 'gap') {
      text = ctx.event ? ('<b>' + ctx.event.label + '</b> · sıradaki hafta Hafta ' + String(ctx.week.n).padStart(2, '0')) : ('Sıradaki hafta: <b>Hafta ' + String(ctx.week.n).padStart(2, '0') + '</b>');
    } else if (ctx.state === 'after') {
      text = 'Ders yılı tamamlandı · <b>Hafta 37</b>';
    }
    el.innerHTML = '<span class="today-badge">' + text + '</span>';
    return ctx;
  }

  // ---------------------------------------------------------------
  // Etkileşimler
  // ---------------------------------------------------------------
  document.getElementById('prevWeekBtn').addEventListener('click', function () {
    if (currentN > 1) renderWeek(currentN - 1);
  });
  document.getElementById('nextWeekBtn').addEventListener('click', function () {
    if (currentN < D.weeks.length) renderWeek(currentN + 1);
  });

  document.getElementById('toggleAllWeeksBtn').addEventListener('click', function () {
    var panel = document.getElementById('allWeeksPanel');
    if (panel.hidden) { renderAllWeeksPanel(); panel.hidden = false; replayMotion(panel, 'is-opening'); this.textContent = 'Haftaları Gizle'; }
    else { panel.hidden = true; this.textContent = 'Tüm Haftalar'; }
  });

  var teacherToggle = document.getElementById('teacherToggle');
  teacherToggle.addEventListener('click', function () {
    var panel = document.getElementById('teacherPanel');
    var open = panel.hidden;
    panel.hidden = !open;
    if (open) replayMotion(panel, 'is-opening');
    teacherToggle.setAttribute('aria-expanded', String(open));
  });

  // =================================================================
  // Site geneli kabuk: mobil menü, arama, header "Derse Başla" menüsü
  // (homepage-v2.js ile aynı etkileşim mantığı — bağımsız sayfa bağlamı
  // için burada yeniden uygulanmıştır; homepage-v2.js değiştirilmedi.)
  // =================================================================
  (function siteChrome() {
    var $ = function (s) { return document.querySelector(s); };
    var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
    var pad = function (n) { return String(n).padStart(2, '0'); };

    var SITE_COURSES = [
      { key: '5-sinif', label: '5. Sınıf BTY', page: '5-sinif-v3.html', folder: '5sinif', suffix: '5sinif-bty' },
      { key: '6-sinif', label: '6. Sınıf BTY', page: '../6-sinif-bty.html', folder: '6sinif', suffix: '6sinif-bty' },
      { key: 'robotik', label: 'Robotik Kodlama', page: '../robotik-kodlama.html', folder: 'robotik', suffix: 'robotik-kodlama' },
      { key: 'yapay-zeka', label: 'Yapay Zekâ Uygulamaları', page: '../yapay-zeka.html', folder: 'yapay-zeka', suffix: 'yapay-zeka-uygulamalari' }
    ];

    var siteState = { data: {}, events: [], records: [], ready: false };
    var openers = new Map();

    function norm(v) {
      return String(v || '').toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
    }
    function esc(v) {
      return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }
    function planPath(course, number) {
      return '../gunluk-planlar-' + course.folder + '/hafta' + pad(number) + '-' + course.suffix + '.docx';
    }
    function weekForCourse(course, number) {
      var d = siteState.data[course.key];
      if (!d) return null;
      return d.weeks.find(function (w) { return Number(w.hafta_no) === number; });
    }
    function rangeOf(week) {
      return week.tarih_araligi || (week.baslangic + ' – ' + week.bitis);
    }

    async function fetchJSON(url) {
      var res = await fetch(url);
      if (!res.ok) throw new Error('Kaynak yüklenemedi: ' + url);
      return res.json();
    }

    function addRecord(type, title, detail, href, keywords, extra) {
      siteState.records.push({ type: type, title: title, detail: detail, href: href, tokens: norm(title + ' ' + detail + ' ' + keywords), extra: extra || {} });
    }

    function buildSearchIndex() {
      SITE_COURSES.forEach(function (course) {
        addRecord('DERS', course.label, 'Dersin bütün haftaları', course.page, course.label, { course: course.key });
        var d = siteState.data[course.key];
        if (!d) return;
        d.weeks.forEach(function (week) {
          var number = Number(week.hafta_no);
          var topic = week.konu || week.ders_saati || 'Ders akışı';
          addRecord('DERS', course.label + ' · Hafta ' + number, topic, course.page + '?week=' + number,
            [week.tema, week.ogrenme_ciktisi, week.konu].filter(Boolean).join(' '), { course: course.key, week: number });
          addRecord('EVRAK', course.label + ' · Hafta ' + number + ' Günlük Plan', rangeOf(week), planPath(course, number), 'günlük ders planı', { course: course.key, week: number });
        });
      });
      siteState.events.forEach(function (e) {
        addRecord('TAKVİM', e.label, e.date, '../takvim.html', e.date + ' ' + (e.end || ''), {});
      });
      ['5', '6'].forEach(function (grade) {
        addRecord('EVRAK', grade + '. Sınıf BTY — Çerçeve Yıllık Plan', 'XLSX', '../' + grade + '-sinif-bty-cerceve-yillik-plan.xlsx', 'yıllık plan', { course: grade + '-sinif' });
      });
      var materials = window.KeskinLabHomepageMaterials;
      if (Array.isArray(materials)) {
        var labels = { 'sunum': 'Sunum', 'ders-notu': 'Ders Notu', 'ogrenci-etkinligi': 'Öğrenci Etkinliği / Çalışma Kâğıdı', 'infografik': 'İnfografik', 'hafta-ozeti': 'Hafta Özeti', 'olcme-degerlendirme/kisa-cevap': 'Kısa Cevaplı Test', 'olcme-degerlendirme/rubrik': 'Rubrik', 'ogretmen/gozlem-formu': 'Öğretmen Gözlem Formu' };
        materials.forEach(function (m) {
          var course = SITE_COURSES.find(function (c) { return c.key === m.course; });
          if (!course) return;
          var source = weekForCourse(course, m.week);
          var label = labels[m.type] || m.type;
          addRecord('MATERYAL', course.label + ' · Hafta ' + m.week + ' · ' + label, source ? (source.konu || '') : label, '../' + m.href, m.type + ' ' + label, { course: course.key, week: m.week });
        });
      }
    }

    function renderResults(query) {
      var box = $('#searchResults');
      var clean = norm(query), terms = clean.split(' ').filter(Boolean);
      var gradeMatch = clean.match(/\b([56]) sinif\b/);
      var weekMatch = clean.match(/\b(\d{1,2}) hafta\b|\bhafta (\d{1,2})\b/);
      var number = weekMatch ? Number(weekMatch[1] || weekMatch[2]) : null;
      if (!siteState.ready) {
        box.innerHTML = '<p class="search-help">Arama kaynakları yükleniyor…</p>';
        return;
      }
      var matches = siteState.records.filter(function (r) {
        if (gradeMatch && r.extra.course !== gradeMatch[1] + '-sinif') return false;
        if (number !== null && r.extra.week !== number) return false;
        return terms.every(function (term) {
          return r.tokens.split(' ').some(function (tok) { return /^\d+$/.test(term) ? tok === term : tok.indexOf(term) !== -1; });
        });
      }).slice(0, 12);
      if (!terms.length && !gradeMatch && number === null) {
        box.innerHTML = '<p class="search-help">Ders, hafta, konu, günlük plan veya takvimde arayın.</p>';
      } else if (matches.length) {
        box.innerHTML = matches.map(function (r) {
          return '<a class="search-result" href="' + esc(r.href) + '"><small>' + r.type + '</small><strong>' + esc(r.title) + '</strong><span>' + esc(r.detail) + '</span></a>';
        }).join('');
      } else {
        box.innerHTML = '<p class="search-help">Bu arama için mevcut kaynaklarda sonuç bulunamadı.</p>';
      }
    }

    function syncModal() {
      var active = !$('#searchDialog').hidden || !$('#mobileMenu').hidden;
      document.body.classList.toggle('v3-modal-open', active);
      $('#mobileBackdrop').hidden = $('#mobileMenu').hidden;
    }
    function closeBox(box, restore) {
      box.hidden = true;
      var trigger = box.id === 'lessonMenu' ? $('#startLesson') : box.id === 'mobileMenu' ? $('#mobileMenuTrigger') : null;
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      syncModal();
      if (restore !== false) { var o = openers.get(box); if (o) o.focus(); }
    }
    function openBox(box, opener) {
      ['#lessonMenu', '#mobileMenu', '#searchDialog'].forEach(function (id) {
        var other = $(id);
        if (other !== box && !other.hidden) closeBox(other, false);
      });
      openers.set(box, opener || document.activeElement);
      box.hidden = false;
      syncModal();
    }
    function openSearch(opener) {
      openBox($('#searchDialog'), opener);
      $('#searchInput').value = '';
      renderResults('');
      $('#searchInput').focus();
      if (!siteState.ready) loadSiteData();
    }
    function trapFocus(box, event) {
      var controls = $$('a[href],button:not(:disabled),input').filter(function (el) { return box.contains(el) && el.getClientRects().length; });
      if (!controls.length) return;
      if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls[controls.length - 1].focus(); }
      else if (!event.shiftKey && document.activeElement === controls[controls.length - 1]) { event.preventDefault(); controls[0].focus(); }
    }

    function lessonMenuContent() {
      var box = $('#lessonMenu');
      var number = null, copy = 'Ders takvimi yükleniyor. Dersleri doğrudan açabilirsiniz.';
      if (D && D.weeks && D.weeks.length) {
        var ctx = determineContext();
        number = ctx.week ? ctx.week.n : null;
        if (ctx.state === 'before') copy = 'Ders yılı ' + ctx.daysUntil + ' gün sonra başlıyor. İlk hafta hazırlık için gösteriliyor.';
        else if (ctx.state === 'active') copy = 'Bu haftanın derslerine hızlıca gidin.';
        else if (ctx.state === 'gap') copy = (ctx.event ? ctx.event.label + ' · ' : '') + 'Sıradaki hafta hazırlık için gösteriliyor.';
        else if (ctx.state === 'after') copy = 'Ders yılı tamamlandı. Dönem haftalarını arşivden açabilirsiniz.';
      }
      box.innerHTML = '<p>' + esc(copy) + '</p>' + SITE_COURSES.map(function (c) {
        var hasWeek = number && (c.key !== '5-sinif' ? siteState.data[c.key] && weekForCourse(c, number) : true);
        var href = c.key === '5-sinif' ? (number ? c.page + '?week=' + number : c.page) : (hasWeek ? c.page + '?week=' + number : c.page);
        return '<a href="' + href + '">' + c.label + '</a>';
      }).join('');
    }
    function toggleLessonMenu() {
      var box = $('#lessonMenu'), trigger = $('#startLesson');
      if (!box.hidden) { closeBox(box); return; }
      lessonMenuContent();
      openBox(box, trigger);
      trigger.setAttribute('aria-expanded', 'true');
      var firstLink = box.querySelector('a');
      if (firstLink) firstLink.focus();
    }

    async function loadSiteData() {
      try {
        var payload = await Promise.all(SITE_COURSES.map(function (c) { return fetchJSON('../data/' + c.key + '.json'); }));
        payload.forEach(function (data, i) {
          if (Array.isArray(data.weeks) && data.weeks.length) siteState.data[SITE_COURSES[i].key] = data;
        });
      } catch (e) { /* arama, mevcut olmayan bir ders verisiyle de çalışabilir */ }
      try {
        var text = await (await fetch('../home-calendar.js')).text();
        var match = text.match(/const EVENTS = (\[[\s\S]*?\]);\s*\n\s*const TR_MONTHS/);
        if (match) siteState.events = JSON.parse(match[1]);
      } catch (e) { /* takvim olayları arama için isteğe bağlı */ }
      siteState.ready = true;
      buildSearchIndex();
      if (!$('#searchDialog').hidden) renderResults($('#searchInput').value);
    }

    function wireChrome() {
      $('#startLesson').addEventListener('click', toggleLessonMenu);
      $('#mobileMenuTrigger').addEventListener('click', function () {
        var box = $('#mobileMenu');
        openBox(box, $('#mobileMenuTrigger'));
        $('#mobileMenuTrigger').setAttribute('aria-expanded', 'true');
        var firstControl = box.querySelector('a,button');
        if (firstControl) firstControl.focus();
      });
      $('.menu-close').addEventListener('click', function () { closeBox($('#mobileMenu')); });
      $('#mobileBackdrop').addEventListener('click', function () { closeBox($('#mobileMenu')); });
      $('.menu-search').addEventListener('click', function () { closeBox($('#mobileMenu'), false); openSearch($('#mobileMenuTrigger')); });
      $$('#mobileMenu a').forEach(function (a) { a.addEventListener('click', function () { closeBox($('#mobileMenu'), false); }); });
      $('#searchTrigger').addEventListener('click', function () { openSearch($('#searchTrigger')); });
      $('#searchClose').addEventListener('click', function () { closeBox($('#searchDialog')); });
      $('#searchDialog').addEventListener('click', function (event) { if (event.target === $('#searchDialog')) closeBox($('#searchDialog')); });
      $('#searchInput').addEventListener('input', function (event) { renderResults(event.target.value); });

      document.addEventListener('click', function (event) {
        var box = $('#lessonMenu');
        if (!box.hidden && !box.contains(event.target) && !$('#startLesson').contains(event.target)) closeBox(box, false);
      });
      document.addEventListener('keydown', function (event) {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch($('#searchTrigger')); return; }
        var box = ['#searchDialog', '#mobileMenu', '#lessonMenu'].map($).find(function (e) { return !e.hidden; });
        if (!box) return;
        if (event.key === 'Escape') { event.preventDefault(); closeBox(box); return; }
        if (event.key === 'Tab') trapFocus(box, event);
        if (box.id === 'searchDialog' && ['ArrowDown', 'ArrowUp'].indexOf(event.key) !== -1) {
          var results = $$('#searchResults a'), index = results.indexOf(document.activeElement);
          event.preventDefault();
          if (event.key === 'ArrowUp' && index <= 0) $('#searchInput').focus();
          else { var next = results[event.key === 'ArrowDown' ? Math.min(index + 1, results.length - 1) : index - 1]; if (next) next.focus(); }
        }
        if (box.id === 'searchDialog' && event.key === 'Enter' && document.activeElement === $('#searchInput')) {
          event.preventDefault();
          var first = $('#searchResults a');
          if (first) first.click();
        }
      });
    }

    wireChrome();
    loadSiteData();
  })();

  // ---------------------------------------------------------------
  // Başlangıç
  // ---------------------------------------------------------------
  function init() {
    var ctx = renderTodayBadge();
    var params = new URLSearchParams(window.location.search);
    var wParam = parseInt(params.get('week'), 10);
    var startN = (wParam >= 1 && wParam <= D.weeks.length) ? wParam : ctx.week.n;
    renderWeek(startN, { skipUrl: !(wParam >= 1 && wParam <= D.weeks.length) });
  }

  init();
})();
