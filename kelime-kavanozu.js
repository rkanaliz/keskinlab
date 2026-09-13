(function () {
  'use strict';

  var DEFAULT_CONCEPTS = [
    'İletişim',
    'Bilgi',
    'Bilişim',
    'Teknoloji',
    'BİT'
  ];
  var STORAGE_KEY = 'keskinlab.kelime-kavanozu.students';
  var REMEMBER_KEY = 'keskinlab.kelime-kavanozu.remember';
  var groups = [];
  var assignments = [];

  var studentNames = document.getElementById('studentNames');
  var conceptNames = document.getElementById('conceptNames');
  var groupCount = document.getElementById('groupCount');
  var rememberNames = document.getElementById('rememberNames');
  var groupResults = document.getElementById('groupResults');
  var resultSummary = document.getElementById('resultSummary');
  var notice = document.getElementById('jarNotice');

  function lines(value) {
    var seen = Object.create(null);
    return value.split(/\r?\n/).map(function (item) { return item.trim(); }).filter(function (item) {
      if (!item) return false;
      var key = item.toLocaleLowerCase('tr-TR');
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function shuffle(items) {
    var copy = items.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = copy[i]; copy[i] = copy[j]; copy[j] = temp;
    }
    return copy;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char];
    });
  }

  function showNotice(message, isError) {
    notice.hidden = false;
    notice.textContent = message;
    notice.classList.toggle('is-error', Boolean(isError));
  }

  function clearNotice() {
    notice.hidden = true;
    notice.textContent = '';
    notice.classList.remove('is-error');
  }

  function saveNames() {
    try {
      if (rememberNames.checked) {
        localStorage.setItem(STORAGE_KEY, studentNames.value);
        localStorage.setItem(REMEMBER_KEY, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(REMEMBER_KEY);
      }
    } catch (error) { /* Tarayıcı depolaması kapalıysa araç yine çalışır. */ }
  }

  function makeGroups() {
    clearNotice();
    var students = lines(studentNames.value);
    var count = Math.max(2, Math.min(12, Number(groupCount.value) || 4));
    groupCount.value = count;
    if (students.length < 2) {
      showNotice('Grup oluşturmak için en az iki öğrenci adı ekleyin.', true);
      studentNames.focus();
      return false;
    }
    if (count > students.length) {
      showNotice('Grup sayısı öğrenci sayısından fazla olamaz.', true);
      groupCount.focus();
      return false;
    }
    groups = Array.from({ length: count }, function () { return []; });
    shuffle(students).forEach(function (student, index) { groups[index % count].push(student); });
    assignments = Array.from({ length: count }, function () { return []; });
    saveNames();
    render();
    showNotice(students.length + ' öğrenci ' + count + ' dengeli gruba ayrıldı.', false);
    return true;
  }

  function distributeConcepts() {
    clearNotice();
    if (!groups.length && !makeGroups()) return;
    var concepts = lines(conceptNames.value);
    if (!concepts.length) {
      showNotice('Dağıtmak için en az bir kavram ekleyin.', true);
      conceptNames.focus();
      return;
    }
    assignments = Array.from({ length: groups.length }, function () { return []; });
    shuffle(concepts).forEach(function (concept, index) { assignments[index % groups.length].push(concept); });
    render();
    showNotice(concepts.length + ' kavram gruplara dengeli biçimde dağıtıldı.', false);
  }

  function render() {
    if (!groups.length) {
      groupResults.innerHTML = '<p class="group-empty">Henüz grup oluşturulmadı.</p>';
      resultSummary.textContent = 'Öğrenci listesini ekleyip grupları oluşturun.';
      return;
    }
    var studentTotal = groups.reduce(function (total, group) { return total + group.length; }, 0);
    var conceptTotal = assignments.reduce(function (total, group) { return total + group.length; }, 0);
    resultSummary.textContent = studentTotal + ' öğrenci · ' + groups.length + ' grup' + (conceptTotal ? ' · ' + conceptTotal + ' kavram' : '');
    groupResults.innerHTML = groups.map(function (group, index) {
      var concepts = assignments[index] || [];
      return '<article class="group-card">' +
        '<span class="group-number">' + String(index + 1).padStart(2, '0') + '</span>' +
        '<div class="group-content"><h3>Grup ' + (index + 1) + '</h3>' +
          '<ul class="student-list" aria-label="Grup ' + (index + 1) + ' öğrencileri">' + group.map(function (name) { return '<li>' + escapeHtml(name) + '</li>'; }).join('') + '</ul>' +
          (concepts.length ? '<ul class="concept-list" aria-label="Grup ' + (index + 1) + ' kavramları">' + concepts.map(function (concept) { return '<li>' + escapeHtml(concept) + '</li>'; }).join('') + '</ul>' : '') +
        '</div></article>';
    }).join('');
  }

  function outputText(includeConcepts) {
    return groups.map(function (group, index) {
      var text = 'GRUP ' + (index + 1) + '\n' + group.map(function (name) { return '• ' + name; }).join('\n');
      var concepts = assignments[index] || [];
      if (includeConcepts && concepts.length) text += '\nKavramlar:\n' + concepts.map(function (concept) { return '– ' + concept; }).join('\n');
      return text;
    }).join('\n\n');
  }

  function copyText(value, successMessage) {
    if (!value) { showNotice('Önce grupları oluşturun.', true); return; }
    function done() { showNotice(successMessage, false); }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(value).then(done).catch(function () { fallbackCopy(value, done); });
    } else fallbackCopy(value, done);
  }

  function fallbackCopy(value, done) {
    var field = document.createElement('textarea');
    field.value = value; field.setAttribute('readonly', ''); field.style.position = 'fixed'; field.style.opacity = '0';
    document.body.appendChild(field); field.select();
    try { document.execCommand('copy'); done(); } catch (error) { showNotice('Kopyalama başarısız oldu. Tarayıcı iznini kontrol edin.', true); }
    field.remove();
  }

  document.getElementById('createGroups').addEventListener('click', makeGroups);
  document.getElementById('reshuffleGroups').addEventListener('click', makeGroups);
  document.getElementById('assignConcepts').addEventListener('click', distributeConcepts);
  document.getElementById('resetConcepts').addEventListener('click', function () { conceptNames.value = DEFAULT_CONCEPTS.join('\n'); showNotice('Hazır BTY.5.1.1 kavramları geri yüklendi.', false); });
  document.getElementById('copyGroups').addEventListener('click', function () { copyText(outputText(false), 'Gruplar panoya kopyalandı.'); });
  document.getElementById('copyAssignments').addEventListener('click', function () { copyText(outputText(true), 'Gruplar ve kavramlar panoya kopyalandı.'); });
  rememberNames.addEventListener('change', saveNames);
  studentNames.addEventListener('input', function () { if (rememberNames.checked) saveNames(); });

  conceptNames.value = DEFAULT_CONCEPTS.join('\n');
  try {
    rememberNames.checked = localStorage.getItem(REMEMBER_KEY) === 'true';
    if (rememberNames.checked) studentNames.value = localStorage.getItem(STORAGE_KEY) || '';
  } catch (error) { /* Depolama kullanılamıyorsa boş listeyle devam edilir. */ }
  render();
}());
