const COURSE = '5-sinif';
const WEEK = 1;

const $ = (selector) => document.querySelector(selector);
const pad = (value) => String(value).padStart(2, '0');
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

const PHASE_LABELS = {
  giris: 'Giriş',
  kesfetme: 'Keşfetme',
  'dogrudan-ogretim': 'Doğrudan Öğretim',
  uygulama: 'Uygulama',
  tartisma: 'Tartışma',
  pekistirme: 'Pekiştirme',
  degerlendirme: 'Değerlendirme',
  kapanis: 'Kapanış'
};

const EVIDENCE_LABELS = {
  oral: 'Sözlü',
  observation: 'Gözlem',
  worksheet: 'Çalışma Kâğıdı',
  quiz: 'Kısa Kontrol',
  product: 'Ürün',
  'peer-review': 'Akran Değerlendirmesi'
};

const MATERIAL_LABELS = {
  sunum: 'Ders Sunumu',
  infografik: 'İnfografik',
  'hafta-ozeti': 'Hafta Özeti',
  'ders-notu': 'Ders Notu',
  'ogrenci-etkinligi': 'Öğrenci Etkinliği'
};

let spec = null;
let courseData = null;
let lessonPlayerData = null;
let activePeriodIndex = -1;
let activeStepIndex = 0;

async function json(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${url} → ${response.status}`);
  return response.json();
}

function canonicalWeek() {
  return courseData?.weeks?.find((item) => item.hafta_no === WEEK) ?? null;
}

function totalMinutes() {
  return spec.periods.reduce((sum, period) => sum + period.plannedMinutes, 0);
}

function stepMinuteRange(period, stepIndex) {
  let start = 0;
  for (let index = 0; index < stepIndex; index += 1) start += period.steps[index].minutes;
  return `${start}–${start + period.steps[stepIndex].minutes} dk`;
}

function renderHero() {
  const week = canonicalWeek();
  $('#heroKicker').textContent = `5. SINIF BTY · HAFTA ${pad(spec.week)}`;
  $('#heroTitle').textContent = week?.konu || 'Ders Yaşam Alanı';
  $('#heroDuration').textContent = `${totalMinutes()} DAKİKA`;
  $('#heroPeriods').textContent = `${spec.periods.length} BAĞIMSIZ DERS SAATİ`;
  $('#heroOutcome').textContent = spec.learningOutcomes.join(' · ');
  $('#outcomeText').textContent = week?.ogrenme_ciktisi || spec.learningOutcomes.join(' · ');
}

function phaseSequence(period) {
  return period.steps.map((step) => PHASE_LABELS[step.phase] || step.phase).join(' · ');
}

function renderPeriodCards() {
  $('#periodGrid').innerHTML = spec.periods.map((period, index) => `
    <article class="period-card">
      <div class="n">DERS ${pad(period.periodNo)} · ${period.plannedMinutes} DK</div>
      <h2>${esc(period.title)}</h2>
      <p>${esc(phaseSequence(period))}</p>
      <div class="period-facts"><span>${period.steps.length} ADIM</span><span>${period.plannedMinutes} DK</span></div>
      <button class="start-btn" data-period-index="${index}">${period.periodNo}. Dersi Başlat →</button>
    </article>
  `).join('');

  document.querySelectorAll('[data-period-index]').forEach((button) => {
    button.addEventListener('click', () => openPeriod(Number(button.dataset.periodIndex)));
  });
}

function openPeriod(index) {
  activePeriodIndex = index;
  activeStepIndex = 0;
  const period = spec.periods[index];
  $('#workspaceKicker').textContent = `DERS ${pad(period.periodNo)} · ${period.plannedMinutes} DAKİKA`;
  $('#workspaceTitle').textContent = period.title;
  $('#workspaceMeta').textContent = `${period.steps.length} pedagojik adım · İkinci ders bağımsız olarak açılabilir.`;
  $('#workspace').classList.add('open');
  renderStepNav();
  renderStep();
  $('#workspace').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeWorkspace() {
  $('#workspace').classList.remove('open');
  activePeriodIndex = -1;
  activeStepIndex = 0;
}

function renderStepNav() {
  const period = spec.periods[activePeriodIndex];
  $('#stepNav').innerHTML = period.steps.map((step, index) => `
    <button class="step-button ${index === activeStepIndex ? 'active' : ''}" data-step-index="${index}">
      <span class="idx">${pad(index + 1)}</span>
      <span><b>${esc(PHASE_LABELS[step.phase] || step.phase)}</b><small>${esc(stepMinuteRange(period, index))}</small></span>
      <small>${step.minutes}'</small>
    </button>
  `).join('');

  document.querySelectorAll('[data-step-index]').forEach((button) => {
    button.addEventListener('click', () => {
      activeStepIndex = Number(button.dataset.stepIndex);
      renderStepNav();
      renderStep();
    });
  });
}

function resourcePath(resource, index, extension) {
  const typePath = resource.type.split('/').map(encodeURIComponent).join('/');
  return `/materyaller/${encodeURIComponent(spec.course)}/hafta${pad(spec.week)}/${typePath}/${index}.${extension}`;
}

function renderMaterialResource(resourceId, resource) {
  const label = MATERIAL_LABELS[resource.type] || resource.type;
  if (resource.indexes === 'all') {
    return `
      <section class="resource-card">
        <div class="resource-head"><b>${esc(label)}</b><small>${esc(resourceId)}</small></div>
        <div class="resource-body"><p class="teacher-led">Bu resource <code>indexes: all</code> kullanıyor. Production renderer materyal manifestinden ilgili klasördeki tüm dosyaları çözümleyecek.</p></div>
      </section>`;
  }

  const indexes = resource.indexes || [];
  const isImage = ['sunum', 'infografik', 'hafta-ozeti'].includes(resource.type);
  if (isImage) {
    return `
      <section class="resource-card">
        <div class="resource-head"><b>${esc(label)}</b><small>${esc(indexes.join(' · '))}</small></div>
        <div class="resource-body"><div class="image-strip">${indexes.map((index) => `<img src="${resourcePath(resource, index, 'png')}" alt="${esc(label)} ${esc(index)}" loading="lazy">`).join('')}</div></div>
      </section>`;
  }

  return `
    <section class="resource-card">
      <div class="resource-head"><b>${esc(label)}</b><small>${esc(indexes.join(' · '))}</small></div>
      <div class="resource-body">${indexes.map((index) => `
        <a class="doc-link" href="${resourcePath(resource, index, 'pdf')}" target="_blank" rel="noopener">PDF'yi Aç · ${esc(index)}</a>
      `).join(' ')}</div>
    </section>`;
}

function playerActivity(activityId) {
  return lessonPlayerData?.courses?.[spec.course]?.weeks?.[pad(spec.week)]?.lessonPlayer?.activities?.find((activity) => activity.id === activityId) ?? null;
}

function renderPlayerDetails(activity) {
  if (!activity) return '<p class="player-copy">Etkinlik verisi bulunamadı.</p>';
  if (activity.kind === 'classify') {
    return `<div class="player-details"><span><b>Kartlar:</b> ${esc(activity.items?.join(' · '))}</span><span><b>Alanlar:</b> ${esc(activity.categories?.join(' · '))}</span></div>`;
  }
  if (activity.kind === 'match') {
    return `<div class="player-details">${(activity.pairs || []).map((pair) => `<span>${esc(pair.left)} ↔ ${esc(pair.right)}</span>`).join('')}</div>`;
  }
  if (activity.kind === 'quiz') {
    return `<div class="player-details">${(activity.questions || []).map((question, index) => `<span><b>${index + 1}.</b> ${esc(question.prompt)}</span>`).join('')}</div>`;
  }
  return '';
}

function renderLessonPlayerResource(resourceId, resource) {
  const activity = playerActivity(resource.activityId);
  return `
    <section class="resource-card">
      <div class="resource-head"><b>${esc(activity?.title || 'Lesson Player')}</b><small>${esc(resource.activityId)}</small></div>
      <div class="resource-body">
        <p class="player-copy">${esc(activity?.description || 'Lesson Player etkinliği')}</p>
        ${activity?.teacherPrompt ? `<p class="player-copy"><b>Öğretmen notu:</b> ${esc(activity.teacherPrompt)}</p>` : ''}
        ${renderPlayerDetails(activity)}
        ${resource.requiresTechnology ? `<p class="player-copy"><b>Teknoloji yedeği:</b> ${esc(resource.fallbackResourceRef || 'tanımsız')}</p>` : ''}
      </div>
    </section>`;
}

function renderTeacherLedResource(resourceId, resource) {
  return `
    <section class="resource-card">
      <div class="resource-head"><b>Sınıf İçi Yönlendirme</b><small>${esc(resourceId)}</small></div>
      <div class="resource-body"><p class="teacher-led">${esc(resource.description)}</p></div>
    </section>`;
}

function renderResources(step) {
  if (!step.resourceRefs?.length) return '<p class="teacher-led">Bu adım materyal gerektirmiyor; öğretmen-öğrenci etkileşimiyle yürütülüyor.</p>';
  return step.resourceRefs.map((resourceId) => {
    const resource = spec.resources[resourceId];
    if (!resource) return `<p class="teacher-led">Tanımsız resource: ${esc(resourceId)}</p>`;
    if (resource.kind === 'material') return renderMaterialResource(resourceId, resource);
    if (resource.kind === 'lessonPlayer') return renderLessonPlayerResource(resourceId, resource);
    if (resource.kind === 'teacherLed') return renderTeacherLedResource(resourceId, resource);
    return `<p class="teacher-led">Desteklenmeyen resource: ${esc(resourceId)}</p>`;
  }).join('');
}

function evidenceHtml(evidence) {
  if (!evidence) return '';
  return `
    <section class="evidence">
      <small>ÖĞRENME KANITI</small>
      <p>${esc(evidence.observable)}</p>
      ${evidence.criterion ? `<p><b>Ölçüt:</b> ${esc(evidence.criterion)}</p>` : ''}
      <div class="evidence-meta"><span>${esc(EVIDENCE_LABELS[evidence.mode] || evidence.mode)}</span></div>
    </section>`;
}

function differentiationHtml(step) {
  if (!step.support && !step.enrichment) return '';
  return `<div class="diff-grid">
    ${step.support ? `<section class="diff"><small>DESTEKLEME</small><p>${esc(step.support)}</p></section>` : '<div></div>'}
    ${step.enrichment ? `<section class="diff"><small>ZENGİNLEŞTİRME</small><p>${esc(step.enrichment)}</p></section>` : ''}
  </div>`;
}

function renderStep() {
  const period = spec.periods[activePeriodIndex];
  const step = period.steps[activeStepIndex];
  const phase = PHASE_LABELS[step.phase] || step.phase;

  $('#stepStage').innerHTML = `
    <div class="step-top"><span class="phase">${pad(activeStepIndex + 1)} · ${esc(phase).toLocaleUpperCase('tr-TR')}</span><span class="time">${esc(stepMinuteRange(period, activeStepIndex))}</span></div>
    <h3>${esc(phase)}</h3>
    <div class="curriculum-refs">${(step.curriculumRefs || []).map((ref) => `<span>${esc(ref)}</span>`).join('')}</div>
    <div class="action-grid">
      <section class="action-box"><small>ÖĞRETMEN NE YAPAR?</small><p>${esc(step.teacherAction)}</p></section>
      <section class="action-box student"><small>ÖĞRENCİ NE YAPAR?</small><p>${esc(step.studentAction)}</p></section>
    </div>
    ${step.teacherPrompt ? `<section class="prompt"><small>SINIFA SÖYLE / SOR</small><strong>${esc(step.teacherPrompt)}</strong></section>` : ''}
    ${evidenceHtml(step.evidence)}
    ${differentiationHtml(step)}
    <section class="resources"><div class="resources-title">BU ADIMDA KULLAN</div><div class="resource-list">${renderResources(step)}</div></section>
    <div class="step-controls">
      <button id="prevStep" ${activeStepIndex === 0 ? 'disabled' : ''}>← Önceki Adım</button>
      <button class="primary" id="nextStep">${activeStepIndex === period.steps.length - 1 ? 'Dersi Bitir' : 'Sonraki Adım →'}</button>
    </div>`;

  $('#prevStep').addEventListener('click', () => {
    if (activeStepIndex === 0) return;
    activeStepIndex -= 1;
    renderStepNav();
    renderStep();
  });

  $('#nextStep').addEventListener('click', () => {
    if (activeStepIndex < period.steps.length - 1) {
      activeStepIndex += 1;
      renderStepNav();
      renderStep();
      return;
    }
    closeWorkspace();
    window.scrollTo({ top: $('#periodGrid').offsetTop - 80, behavior: 'smooth' });
  });
}

async function load() {
  try {
    [spec, courseData, lessonPlayerData] = await Promise.all([
      json(`/lesson-specs/${COURSE}/hafta${pad(WEEK)}.json`),
      json(`/data/${COURSE}.json`),
      json('/lesson-player-data.json')
    ]);
    renderHero();
    renderPeriodCards();
  } catch (error) {
    $('#dataError').hidden = false;
    $('#dataErrorText').textContent = error.message;
    console.error(error);
  }
}

$('#closeWorkspace').addEventListener('click', closeWorkspace);
await load();
