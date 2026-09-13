(() => {
  'use strict';
  const truth = [
    { prompt: 'Tabletin kamerası açılınca masanın üzerinde dönen üç boyutlu bir kalp modeli görünüyor.', answer: true, note: 'Dijital model, kameranın gördüğü gerçek ortamın üstüne ekleniyor.' },
    { prompt: 'Gözlüğü takınca tamamen farklı bir dünyanın içinde yürüyormuş gibi hissediyorsun.', answer: false, note: 'Bu örnek, kullanıcıyı bütünüyle dijital ortama taşıyan VR teknolojisidir.' },
    { prompt: 'Yazıcı, plastik malzemeyi katman katman biriktirerek uçak maketi oluşturuyor.', answer: false, note: 'Bu, 3B yazıcı teknolojisine örnektir; AR değildir.' },
    { prompt: 'Telefon kamerasını odaya yöneltince odanın içinde yürüyebilen sanal bir kedi görünür.', answer: true, note: 'Sanal kedi gerçek oda görüntüsünün üzerinde gösterildiği için AR örneğidir.' }
  ];
  const scenarios = [
    { prompt: 'Ayşe, müzede tarihi bir esere telefonunu doğrultuyor. Ekranda eserin üç boyutlu modeli ve hakkında bilgiler beliriyor.', options: ['Artırılmış Gerçeklik (AR)', 'Sanal Gerçeklik (VR)', 'Bulut bilişim'], answer: 0, note: 'Telefon ekranında gerçek eser ile dijital bilgi bir arada görülüyor.' },
    { prompt: 'Bir sınıfta öğrenciler gözlük takarak çok uzun zaman önce yaşayan bir medeniyetin sokaklarında geziyor.', options: ['Artırılmış Gerçeklik (AR)', 'Sanal Gerçeklik (VR)'], answer: 1, note: 'Öğrenciler bütünüyle oluşturulmuş bir ortamın içindedir.' },
    { prompt: 'Ali, bisiklet alırken telefon kamerasını bahçeye yöneltiyor ve bisiklet modelinin orada nasıl görüneceğini inceliyor.', options: ['Artırılmış Gerçeklik (AR)', 'Sanal Gerçeklik (VR)', '3B yazıcı'], answer: 0, note: 'Dijital bisiklet, gerçek bahçe görüntüsüne eklenmiştir.' },
    { prompt: 'Bir cerrah, ameliyat sırasında gözlük ekranında hastanın iç organlarının 3B modelini ve canlı ölçümlerini görüyor.', options: ['Eğlence', 'Sağlık / tıp', 'Ulaşım'], answer: 1, note: 'AR teknolojisi burada sağlık alanındaki çalışmayı destekliyor.' }
  ];
  const sortItems = [
    ['YZ destekli teşhis yazılımı', 'Sağlık'], ['Dijital öğretmen asistanı', 'Eğitim'], ['Akıllı park sistemi', 'Ulaşım'], ['Trafik yoğunluğu tahmini', 'Ulaşım'], ['Dil öğrenme uygulaması', 'Eğitim'], ['Artırılmış gerçeklik oyunu', 'Eğlence'], ['Akıllı protez kol', 'Sağlık'], ['Müzik öneri sistemi', 'Eğlence']
  ];
  const writing = [
    { id: 'ar-explain', prompt: 'Artırılmış gerçekliği kendi sözcüklerinle nasıl açıklarsın? Bir örnek ver.', cue: 'Sınıfınıza yeni gelen bir öğrenci “Artırılmış gerçeklik nedir?” diye soruyor.' },
    { id: 'ar-area', prompt: 'AR teknolojisinin kullanılabileceği bir alan seç ve orada nasıl kullanılabileceğini açıkla.', cue: 'Eğitim, sağlık, ulaşım, spor, eğlence veya tarım arasından seçim yapabilirsin.' },
    { id: 'ar-vr-choice', prompt: 'Tarihi bir kaleyi öğrencilere tanıtmak için AR mı VR mı seçerdin? Neden?', cue: 'Her iki teknolojinin de farklı güçlü yanları vardır.' }
  ];
  const areas = ['Sağlık', 'Eğitim', 'Ulaşım', 'Eğlence'];
  const state = { panel: 0, truth: Array(truth.length).fill(null), scenarios: Array(scenarios.length).fill(null), selectedCard: null, placements: {} };
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const esc = (text) => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

  function renderTruth() {
    $('[data-quiz="truth"]').innerHTML = truth.map((q, i) => `<article class="question-card"><div class="question-prompt">${i + 1}. ${esc(q.prompt)}</div><div class="answer-set"><button type="button" class="answer-button" data-truth="${i}" data-value="true" aria-pressed="${state.truth[i] === true}">AR örneği</button><button type="button" class="answer-button" data-truth="${i}" data-value="false" aria-pressed="${state.truth[i] === false}">AR değil</button></div><p class="feedback" hidden></p></article>`).join('');
    $$('[data-truth]').forEach(button => button.addEventListener('click', () => { state.truth[Number(button.dataset.truth)] = button.dataset.value === 'true'; renderTruth(); }));
  }
  function checkTruth() {
    $$('.question-card', $('[data-quiz="truth"]')).forEach((card, i) => { const selected = state.truth[i]; $$('[data-truth]', card).forEach(button => { const value = button.dataset.value === 'true'; button.classList.toggle('is-correct', value === truth[i].answer); button.classList.toggle('is-wrong', selected !== null && value === selected && value !== truth[i].answer); }); const feedback = $('.feedback', card); feedback.hidden = false; feedback.textContent = selected === null ? `Önce bir seçim yap. ${truth[i].note}` : truth[i].note; });
  }
  function renderSort() {
    $('#sortBank').innerHTML = sortItems.map(([label], i) => `<button type="button" draggable="${!Object.hasOwn(state.placements, i)}" class="tech-card${state.selectedCard === i ? ' is-selected' : ''}${Object.hasOwn(state.placements, i) ? ' is-placed' : ''}" data-card="${i}">${esc(label)}</button>`).join('');
    $('#sortZones').innerHTML = areas.map(area => `<section class="sort-zone" data-zone="${area}" tabindex="0" role="button" aria-label="${area} alanı"><h3>${area}</h3><div class="placed-list">${Object.entries(state.placements).filter(([, value]) => value === area).map(([i]) => `<span class="placed-tag">${esc(sortItems[i][0])}</span>`).join('')}</div></section>`).join('');
    $$('.tech-card').forEach(card => { const i = Number(card.dataset.card); card.addEventListener('click', () => { if (Object.hasOwn(state.placements, i)) return; state.selectedCard = state.selectedCard === i ? null : i; renderSort(); }); card.addEventListener('dragstart', event => { state.selectedCard = i; event.dataTransfer.setData('text/plain', String(i)); }); });
    $$('.sort-zone').forEach(zone => { const place = () => { if (state.selectedCard === null) return; state.placements[state.selectedCard] = zone.dataset.zone; state.selectedCard = null; $('#sortStatus').textContent = 'Kart yerleştirildi.'; renderSort(); }; zone.addEventListener('click', place); zone.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); place(); } }); zone.addEventListener('dragover', event => { event.preventDefault(); zone.classList.add('is-over'); }); zone.addEventListener('dragleave', () => zone.classList.remove('is-over')); zone.addEventListener('drop', event => { event.preventDefault(); zone.classList.remove('is-over'); state.selectedCard = Number(event.dataTransfer.getData('text/plain')); place(); }); });
  }
  function checkSort() { const count = Object.keys(state.placements).length; const correct = Object.entries(state.placements).filter(([i, area]) => sortItems[i][1] === area).length; $('#sortStatus').textContent = count < sortItems.length ? `${count} kart yerleştirildi. Kalan kartları da yerleştir.` : `${correct} / ${sortItems.length} doğru yerleştirme yaptın. Yanlış kartları sıfırlayıp yeniden deneyebilirsin.`; }
  function renderScenarios() {
    $('[data-quiz="scenario"]').innerHTML = scenarios.map((q, i) => `<article class="scenario-card"><h3>SENARYO ${i + 1}</h3><div class="scenario-prompt">${esc(q.prompt)}</div><div class="scenario-options" role="radiogroup" aria-label="Senaryo ${i + 1}">${q.options.map((option, oi) => `<button type="button" role="radio" aria-checked="${state.scenarios[i] === oi}" class="scenario-option" data-scenario="${i}" data-option="${oi}"><span>${String.fromCharCode(65 + oi)}</span>${esc(option)}</button>`).join('')}</div><p class="feedback" hidden></p></article>`).join('');
    $$('[data-scenario]').forEach(button => button.addEventListener('click', () => { state.scenarios[Number(button.dataset.scenario)] = Number(button.dataset.option); renderScenarios(); }));
  }
  function checkScenarios() { $$('.scenario-card', $('[data-quiz="scenario"]')).forEach((card, i) => { $$('[data-scenario]', card).forEach(button => { const oi = Number(button.dataset.option); button.classList.toggle('is-correct', oi === scenarios[i].answer); button.classList.toggle('is-wrong', state.scenarios[i] === oi && oi !== scenarios[i].answer); }); const feedback = $('.feedback', card); feedback.hidden = false; feedback.textContent = scenarios[i].note; }); }
  function renderWriting() { $('#writingList').innerHTML = writing.map(item => `<article class="writing-card"><blockquote>${esc(item.cue)}</blockquote><label for="${item.id}">${esc(item.prompt)}</label><textarea id="${item.id}" maxlength="400" placeholder="Düşünceni buraya yaz…"></textarea><p class="char-count"><span>0</span> / 400 karakter</p></article>`).join(''); writing.forEach(item => { const input = $(`#${item.id}`); input.value = localStorage.getItem(`keskinlab-${item.id}`) || ''; updateCount(input); input.addEventListener('input', () => updateCount(input)); }); }
  function updateCount(input) { $('.char-count span', input.closest('.writing-card')).textContent = input.value.length; }
  function saveWriting() { writing.forEach(item => localStorage.setItem(`keskinlab-${item.id}`, $(`#${item.id}`).value)); $('#saveWriting').textContent = 'Kaydedildi'; setTimeout(() => { $('#saveWriting').textContent = 'Cevaplarımı kaydet'; }, 1500); }
  function changePanel(next) { state.panel = Math.max(0, Math.min(3, next)); $$('.activity-panel').forEach(panel => panel.classList.toggle('is-active', Number(panel.dataset.panel) === state.panel)); $$('.progress-step').forEach((step, i) => step.classList.toggle('is-active', i === state.panel)); $('#panelCount').textContent = `${state.panel + 1} / 4`; $('#previous').disabled = state.panel === 0; $('#next').textContent = state.panel === 3 ? 'Başa dön' : 'Sonraki →'; window.scrollTo({ top: 0, behavior: 'smooth' }); }
  $('[data-check="truth"]').addEventListener('click', checkTruth); $('[data-check="sort"]').addEventListener('click', checkSort); $('[data-check="scenario"]').addEventListener('click', checkScenarios); $('[data-reset="sort"]').addEventListener('click', () => { state.selectedCard = null; state.placements = {}; $('#sortStatus').textContent = ''; renderSort(); }); $('#saveWriting').addEventListener('click', saveWriting); $$('.progress-step').forEach(button => button.addEventListener('click', () => changePanel(Number(button.dataset.go)))); $('#previous').addEventListener('click', () => changePanel(state.panel - 1)); $('#next').addEventListener('click', () => changePanel(state.panel === 3 ? 0 : state.panel + 1));
  renderTruth(); renderSort(); renderScenarios(); renderWriting(); changePanel(0);
})();
