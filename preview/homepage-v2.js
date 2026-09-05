(() => {
  const carousel = document.querySelector('[data-hero-carousel]');
  if (!carousel) return;

  const slides = [...carousel.querySelectorAll('.hero-slide')];
  const dots = [...carousel.querySelectorAll('[data-slide]')];
  if (!slides.length || slides.length !== dots.length) return;

  let current = 0;
  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, position) => {
      const active = position === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      dots[position].classList.toggle('is-active', active);
      dots[position].setAttribute('aria-pressed', String(active));
    });
  };

  carousel.querySelector('[data-carousel-prev]').addEventListener('click', () => show(current - 1));
  carousel.querySelector('[data-carousel-next]').addEventListener('click', () => show(current + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => show(index)));
})();

(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const pad = n => String(n).padStart(2, '0');
  const courses = [
    { key:'5-sinif', label:'5. Sınıf BTY', page:'../5-sinif-bty.html', folder:'5sinif', suffix:'5sinif-bty' },
    { key:'6-sinif', label:'6. Sınıf BTY', page:'../6-sinif-bty.html', folder:'6sinif', suffix:'6sinif-bty' },
    { key:'robotik', label:'Robotik Kodlama', page:'../robotik-kodlama.html', folder:'robotik', suffix:'robotik-kodlama' },
    { key:'yapay-zeka', label:'Yapay Zekâ Uygulamaları', page:'../yapay-zeka.html', folder:'yapay-zeka', suffix:'yapay-zeka-uygulamalari' }
  ];
  const state = { data:{}, events:[], selected:null, records:[], ready:false, calendarReady:false, materialReady:false, day:null, filter:null };
  const openers = new Map();
  const norm = value => String(value || '').toLocaleLowerCase('tr-TR').replace(/ı/g,'i').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const parse = value => new Date(value + 'T12:00:00Z');
  const iso = date => date.toISOString().slice(0,10);
  const shift = (date, days) => new Date(date.getTime() + days * 86400000);
  const fmt = date => new Intl.DateTimeFormat('tr-TR',{day:'numeric',month:'long',timeZone:'UTC'}).format(date);
  const today = () => {
    const parts = new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const fields = Object.fromEntries(parts.map(p=>[p.type,p.value]));
    return parse(fields.year + '-' + fields.month + '-' + fields.day);
  };
  const plan = (course, number) => '../gunluk-planlar-' + course.folder + '/hafta' + pad(number) + '-' + course.suffix + '.docx';
  const weekFor = (course, number) => state.data[course.key].weeks.find(w=>Number(w.hafta_no)===number);
  const range = week => week.tarih_araligi || fmt(parse(week.baslangic)) + ' – ' + fmt(parse(week.bitis));
  const weeks = () => state.data['5-sinif'].weeks;
  const maxWeek = () => Number(weeks().at(-1).hafta_no);
  const indexOn = date => weeks().findIndex(w=>iso(date)>=w.baslangic && iso(date)<=w.bitis);
  const indexFrom = date => {
    const active = indexOn(date);
    return active >= 0 ? active : weeks().findIndex(w=>w.baslangic>=iso(date));
  };
  async function load(url, format='json') {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Kaynak yüklenemedi: ' + url);
    return format==='json' ? response.json() : response.text();
  }
  function holidayAt(date) {
    const day = iso(date);
    return state.events.find(e => (e.type==='tatil' || (e.type==='kutlama' && /bayram|15 temmuz/.test(norm(e.label)))) && day>=e.date && day<=(e.end||e.date));
  }
  function nextSchoolDay(date) {
    let next = date;
    for (let i=0; i<370; i++, next=shift(next,1)) {
      if (next.getUTCDay()!==0 && next.getUTCDay()!==6 && !holidayAt(next)) return next;
    }
    return next;
  }
  function derive(date) {
    if (iso(date)<weeks()[0].baslangic) return {kind:'pre',index:0};
    if (iso(date)>weeks().at(-1).bitis) return {kind:'complete',index:null};
    const pause = holidayAt(date);
    if (pause) {
      let end = parse(pause.end||pause.date);
      while (holidayAt(shift(end,1))) end=shift(end,1);
      const resume = nextSchoolDay(shift(end,1));
      return {kind:'break',index:indexFrom(resume),pause,end,resume};
    }
    const active=indexOn(date);
    if (active>=0 && date.getUTCDay()>0 && date.getUTCDay()<6) return {kind:'active',index:active};
    const resume=nextSchoolDay(date);
    return {kind:'weekend',index:indexFrom(resume),resume};
  }
  function topic(course, week) {
    const raw=String(week.konu || week.ders_saati || 'Ders akışı');
    if (!['robotik','yapay-zeka'].includes(course.key)) return raw;
    let parts=raw.split('•');
    if (parts.length>1 && /^[A-ZÇĞİÖŞÜ]+\./u.test(parts[0].trim())) parts=parts.slice(1);
    return parts.map(part=>part.trim().replace(/^(?:[A-ZÇĞİÖŞÜ]+\.)?\d+(?:\.\d+)+\.?\s*/u,'').replace(/([iİ])\u0307/g,'$1')).join(' · ');
  }
  function context(view) {
    if (view.kind==='pre') return 'Ders yılı ' + fmt(parse(weeks()[0].baslangic)) + ' tarihinde başlıyor. İlk hafta hazırlık için gösteriliyor.';
    if (view.kind==='break') return view.pause.label + ' · Dersler ' + fmt(view.resume) + ' tarihinde devam edecek. Dönüş haftası hazırlık için gösteriliyor.';
    if (view.kind==='weekend') return 'Hafta sonu / geçiş · ' + fmt(view.resume) + ' için sıradaki ders haftası hazırlık amacıyla gösteriliyor.';
    if (view.kind==='complete') return 'Ders yılı tamamlandı. Dersleri ve dönem haftalarını arşivden açabilirsiniz.';
    return 'Bu haftanın dört ders içeriği ve günlük planları.';
  }
  const overlapEvents = week => state.events.filter(e=>e.date<=week.bitis && (e.end||e.date)>=week.baslangic);
  function calendarRow(label, value) {
    return '<li class="calendar-item"><span class="cal-date">' + esc(label) + '</span><span class="cal-label">' + value + '</span></li>';
  }
  function renderCalendar(base, view) {
    if (!state.calendarReady) {
      $('#calendarSummary').innerHTML=calendarRow('Takvim','Takvim olayları şu anda yüklenemedi. <a href="../takvim.html">Eğitim takvimini aç →</a>');
      return;
    }
    const rows=[];
    if (view.kind==='complete') {
      rows.push(calendarRow('Ders yılı',esc(fmt(parse(weeks().at(-1).bitis)) + ' tarihinde tamamlandı.')));
      rows.push(calendarRow('Arşiv','<a href="#bu-hafta">Dönem haftalarını incele →</a>'));
      const next=state.events.find(e=>(e.end||e.date)>=iso(today()));
      if (next) rows.push(calendarRow('Yaklaşan',esc(next.label + ' · ' + fmt(parse(next.date)))));
    } else if (view.kind==='break') {
      rows.push(calendarRow('Tatil',esc(view.pause.label + ' · ' + fmt(parse(view.pause.date)) + ' – ' + fmt(view.end))));
      rows.push(calendarRow('Dönüş',esc(fmt(view.resume)) + ' · <a href="#bu-hafta">' + pad(base.hafta_no) + '. hafta hazırlığı →</a>'));
      const event=overlapEvents(base).find(e=>e.type!=='tatil');
      if (event) rows.push(calendarRow('Gündem',esc(event.label)));
    } else {
      rows.push(calendarRow(view.kind==='pre'?'Hazırlık haftası':'Eğitim haftası',esc(pad(base.hafta_no) + ' · ' + range(base))));
      const event=overlapEvents(base).find(e=>e.type!=='tatil' && e.type!=='donem') || state.events.find(e=>e.date>base.bitis && !['tatil','donem'].includes(e.type));
      if (event) rows.push(calendarRow('Gündem',esc(event.label + ' · ' + fmt(parse(event.date)))));
      const next=state.events.find(e=>e.date>base.bitis && ['tatil','donem'].includes(e.type));
      if (next) rows.push(calendarRow('Yaklaşan',esc(next.label + ' · ' + fmt(parse(next.date)))));
    }
    $('#calendarSummary').innerHTML=rows.join('');
  }
  function archiveCard(course, text) {
    return '<article class="week-card"><div class="week-body"><p class="week-course">' + course.label + '</p><p class="week-topic">' + esc(text) + '</p></div><a class="text-link text-link-sm" href="' + course.page + '?view=weeks">Ders arşivi →</a></article>';
  }
  function renderWeek() {
    const live=derive(today());
    const number=state.selected ?? (live.index===null || live.index<0 ? null : Number(weeks()[live.index].hafta_no));
    const view=state.selected===null ? live : {kind:'manual'};
    $('#weekStatus').textContent=state.selected===null ? context(live) : 'Seçilen hafta · dört dersin bağlantıları birlikte güncellenir.';
    const currentNumber=live.index===null || live.index<0 ? null : Number(weeks()[live.index].hafta_no);
    $('#todayWeek').hidden=state.selected===null || state.selected===currentNumber;
    $('#prevWeek').disabled=number===1;
    $('#nextWeek').disabled=number===maxWeek();
    $('#weekLead').textContent='';
    $('#weekLead').hidden=true;
    if (number===null) {
      $('#weekNumber').textContent='DÖNEM TAMAMLANDI';
      $('#weekDates').textContent='';
      $('#weekRows').innerHTML=courses.map(c=>archiveCard(c,'Dönem haftaları erişilebilir.')).join('');
      renderCalendar(null,view);
      return;
    }
    const base=weekFor(courses[0],number);
    $('#weekNumber').textContent='HAFTA ' + pad(number);
    $('#weekDates').textContent=range(base);
    $('#weekRows').innerHTML=courses.map(course=>{
      const week=weekFor(course,number);
      if (!week) return archiveCard(course,'Bu dersin programı ' + state.data[course.key].weeks.length + ' hafta; ' + number + '. hafta kaydı yok.');
      const different=week.baslangic!==base.baslangic || week.bitis!==base.bitis;
      const note=different ? '<span class="week-source-range">Bu dersin kaynak tarihi: ' + esc(range(week)) + '</span>' : '';
      return '<article class="week-card"><div class="week-body"><p class="week-course">' + course.label + '</p><p class="week-topic">' + esc(topic(course,week)) + '</p>' + note + '</div><div class="week-links"><a href="' + course.page + '?week=' + number + '">Derse Başla →</a><a href="' + plan(course,number) + '" download>Günlük Plan ↓</a></div></article>';
    }).join('');
    const events=overlapEvents(base).filter(e=>!['tatil','donem'].includes(e.type)).slice(0,2);
    $('#weekLead').textContent=events.map(e=>e.label).join(' · ');
    $('#weekLead').hidden=events.length===0;
    renderCalendar(base,view);
  }
  function move(delta) {
    if (!state.ready) return;
    const live=derive(today());
    const current=state.selected ?? (live.index===null || live.index<0 ? (delta<0?maxWeek()+1:0) : Number(weeks()[live.index].hafta_no));
    const next=Math.max(1,Math.min(maxWeek(),current+delta));
    const currentNumber=live.index===null || live.index<0 ? null : Number(weeks()[live.index].hafta_no);
    state.selected=next===currentNumber ? null : next;
    renderWeek();
  }
  function addRecord(type,title,detail,href,keywords,extra={}) {
    state.records.push({type,title,detail,href,tokens:norm(title+' '+detail+' '+keywords),...extra});
  }
  function buildSearch() {
    courses.forEach(course=>{
      addRecord('DERS',course.label,'Dersin bütün haftaları',course.page,course.label,{course:course.key});
      state.data[course.key].weeks.forEach(week=>{
        const number=Number(week.hafta_no), metadata={course:course.key,week:number};
        addRecord('DERS',course.label+' · Hafta '+number,topic(course,week),course.page+'?week='+number,[week.tema,week.ogrenme_ciktisi,week.kazanimlar,week.surec_bilesenleri,week.etkinlik].flat().join(' '),metadata);
        addRecord('EVRAK',course.label+' · Hafta '+number+' Günlük Plan',range(week),plan(course,number),'günlük ders planı',metadata);
      });
    });
    state.events.forEach(e=>addRecord('TAKVİM',e.label,fmt(parse(e.date)),'../takvim.html',e.date+' '+(e.end||'')));
    ['5','6'].forEach(grade=>addRecord('EVRAK',grade+'. Sınıf BTY — Çerçeve Yıllık Plan','XLSX','../'+grade+'-sinif-bty-cerceve-yillik-plan.xlsx','yıllık plan',{course:grade+'-sinif'}));
  }
  async function loadMaterials() {
    const local=window.KeskinLabHomepageMaterials;
    if (Array.isArray(local)) {
      const labels={'sunum':'Sunu','ders-notu':'Ders Notu','ogrenci-etkinligi':'Öğrenci Etkinliği / Çalışma Kâğıdı','infografik':'İnfografik','hafta-ozeti':'Hafta Özeti','olcme-degerlendirme/kisa-cevap':'Kısa Cevaplı Test','olcme-degerlendirme/rubrik':'Rubrik','olcme-degerlendirme/kontrol-listesi':'Kontrol Listesi','ogretmen/gozlem-formu':'Öğretmen Gözlem Formu'};
      local.forEach(material=>{
        const course=courses.find(c=>c.key===material.course);
        if (!course || !material.href.startsWith('materyaller/')) return;
        const source=weekFor(course,material.week);
        const label=labels[material.type]||material.type;
        addRecord('MATERYAL',course.label+' · Hafta '+material.week+' · '+label+' '+material.index,source?topic(course,source):label,'../'+material.href,material.type+' '+label,{course:course.key,week:material.week,materialType:material.type});
      });
      state.materialReady=true;
      return;
    }
    try {
      const manifest=await load('../generated/materials.json');
      Object.entries(manifest.courses||{}).forEach(([key,course])=>Object.values(course.weeks||{}).forEach(week=>(week.materials||[]).forEach(material=>{
        const href=material.preview||material.editable||material.downloads?.[0]?.href;
        if (!href || /^(?:[a-z]+:|\/\/)/i.test(href)) return;
        const source=state.data[key]?.weeks.find(w=>Number(w.hafta_no)===Number(week.week));
        addRecord('MATERYAL',course.title+' · Hafta '+week.week+' · '+material.label,source?.konu||material.label,'../'+href,material.type+' '+material.label,{course:key,week:Number(week.week),materialType:material.type});
      })));
      state.materialReady=true;
    } catch { /* A missing generated catalog must not disable canonical course data. */ }
  }
  const materialFilters={
    sunum:['sunum'], etkinlik:['ogrenci-etkinligi'], calisma:['ogrenci-etkinligi','ders-notu'],
    test:['olcme-degerlendirme/kisa-cevap'], gorsel:['infografik','hafta-ozeti','sunum'],
    sablon:['ogretmen/gozlem-formu','olcme-degerlendirme/kontrol-listesi'],
    olcme:['olcme-degerlendirme/kisa-cevap','olcme-degerlendirme/rubrik','olcme-degerlendirme/kontrol-listesi'],
    form:['ogretmen/gozlem-formu','olcme-degerlendirme/rubrik','olcme-degerlendirme/kontrol-listesi']
  };
  function renderResults(query) {
    const clean=norm(query), terms=clean.split(' ').filter(Boolean);
    const grade=clean.match(/\b([56]) sinif\b/);
    const weekMatch=clean.match(/\b(\d{1,2}) hafta\b|\bhafta (\d{1,2})\b/);
    const number=weekMatch ? Number(weekMatch[1]||weekMatch[2]) : null;
    const matches=state.records.filter(record=>{
      if (state.filter && !(record.type==='MATERYAL' && materialFilters[state.filter].includes(record.materialType))) return false;
      if (grade && record.course!==grade[1]+'-sinif') return false;
      if (number!==null && record.week!==number) return false;
      return terms.every(term=>record.tokens.split(' ').some(token=>/^\d+$/.test(term)?token===term:token.includes(term)||token.includes(term.replace(/ligi$/,'lik'))));
    }).slice(0,12);
    if (!terms.length && !state.filter) {
      $('#searchResults').innerHTML='<p class="search-help">Ders, hafta, konu, günlük plan veya takvimde arayın.</p>';
    } else if (matches.length) {
      $('#searchResults').innerHTML=matches.map(r=>'<a class="search-result" href="'+esc(r.href)+'"><small>'+r.type+'</small><strong>'+esc(r.title)+'</strong><span>'+esc(r.detail)+'</span></a>').join('');
    } else {
      const note=state.filter && !state.materialReady ? 'Materyal kataloğu bu önizlemede henüz erişilebilir değil.' : 'Bu arama için mevcut kaynaklarda sonuç bulunamadı.';
      $('#searchResults').innerHTML='<p class="search-help">'+note+'</p><a class="search-fallback" href="../dijital-araclar.html#ders-hazirla">Dijital kaynak rehberini aç →</a>';
    }
  }
  function syncModal() {
    const active=!$('#searchDialog').hidden || !$('#mobileMenu').hidden;
    for (const element of [$('.site-header'),$('main'),$('.site-footer')]) element.inert=active;
    document.body.classList.toggle('homepage-modal-open',active);
    $('#mobileBackdrop').hidden=$('#mobileMenu').hidden;
  }
  function close(box, restore=true) {
    box.hidden=true;
    const trigger=box.id==='lessonMenu'?$('#startLesson'):box.id==='mobileMenu'?$('#mobileMenuTrigger'):null;
    trigger?.setAttribute('aria-expanded','false');
    syncModal();
    if (restore) openers.get(box)?.focus();
  }
  function open(box, opener) {
    for (const id of ['#lessonMenu','#mobileMenu','#searchDialog']) {
      const other=$(id);
      if (!other.hidden) close(other,false);
    }
    openers.set(box,opener||document.activeElement);
    box.hidden=false;
    syncModal();
  }
  function openSearch(filter=null, opener=null) {
    open($('#searchDialog'),opener);
    state.filter=filter;
    $('#searchInput').value='';
    renderResults('');
    $('#searchInput').focus();
  }
  function lessonMenu() {
    const box=$('#lessonMenu'), trigger=$('#startLesson');
    if (!box.hidden) return close(box);
    let number=null, copy='Ders takvimi yükleniyor. Dersleri doğrudan açabilirsiniz.';
    if (state.ready) {
      const view=derive(today());
      number=view.index===null||view.index<0?null:Number(weeks()[view.index].hafta_no);
      copy=context(view);
    }
    box.innerHTML='<p>'+esc(copy)+'</p>'+courses.map(c=>'<a href="'+c.page+(number&&weekFor(c,number)?'?week='+number:'?view=weeks')+'">'+c.label+'</a>').join('');
    open(box,trigger);
    trigger.setAttribute('aria-expanded','true');
    box.querySelector('a').focus();
  }
  function trap(box,event) {
    const controls=[...box.querySelectorAll('a[href],button:not(:disabled),input')].filter(e=>e.getClientRects().length);
    if (!controls.length) return;
    if (event.shiftKey && document.activeElement===controls[0]) {event.preventDefault();controls.at(-1).focus();}
    else if (!event.shiftKey && document.activeElement===controls.at(-1)) {event.preventDefault();controls[0].focus();}
  }
  function wire() {
    $('#startLesson').addEventListener('click',lessonMenu);
    $('#mobileMenuTrigger').addEventListener('click',()=>{
      const box=$('#mobileMenu');
      open(box,$('#mobileMenuTrigger'));
      $('#mobileMenuTrigger').setAttribute('aria-expanded','true');
      box.querySelector('button').focus();
    });
    $('.menu-close').addEventListener('click',()=>close($('#mobileMenu')));
    $('#mobileBackdrop').addEventListener('click',()=>close($('#mobileMenu')));
    $('.menu-search').addEventListener('click',()=>openSearch(null,$('#mobileMenuTrigger')));
    $('#mobileMenu').querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>close($('#mobileMenu'))));
    $('#searchTrigger').addEventListener('click',()=>openSearch());
    $('#searchClose').addEventListener('click',()=>close($('#searchDialog')));
    $('#searchDialog').addEventListener('click',event=>{if(event.target===$('#searchDialog'))close($('#searchDialog'));});
    $('#searchInput').addEventListener('input',event=>renderResults(event.target.value));
    $$('[data-material-filter]').forEach(a=>a.addEventListener('click',event=>{
      if (event.ctrlKey||event.metaKey||event.shiftKey||event.altKey) return;
      event.preventDefault();
      openSearch(a.dataset.materialFilter,a);
    }));
    $('#prevWeek').addEventListener('click',()=>move(-1));
    $('#nextWeek').addEventListener('click',()=>move(1));
    $('#todayWeek').addEventListener('click',()=>{state.selected=null;renderWeek();});
    document.addEventListener('click',event=>{
      const box=$('#lessonMenu');
      if (!box.hidden&&!box.contains(event.target)&&!$('#startLesson').contains(event.target)) close(box,false);
    });
    document.addEventListener('keydown',event=>{
      if ((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k') {event.preventDefault();openSearch(null,$('#searchTrigger'));return;}
      const box=['#searchDialog','#mobileMenu','#lessonMenu'].map($).find(e=>!e.hidden);
      if (!box) return;
      if (event.key==='Escape') {event.preventDefault();close(box);return;}
      if (event.key==='Tab') trap(box,event);
      if (box.id==='searchDialog' && ['ArrowDown','ArrowUp'].includes(event.key)) {
        const results=$$('#searchResults a'), index=results.indexOf(document.activeElement);
        event.preventDefault();
        if (event.key==='ArrowUp' && index<=0) $('#searchInput').focus();
        else results[event.key==='ArrowDown'?Math.min(index+1,results.length-1):index-1]?.focus();
      }
      if (box.id==='searchDialog' && event.key==='Enter' && document.activeElement===$('#searchInput')) {
        event.preventDefault();$('#searchResults a')?.click();
      }
    });
    const refresh=()=>{
      const day=iso(today());
      if (state.ready && day!==state.day) {state.day=day;renderWeek();}
    };
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
    window.addEventListener('focus',refresh);
  }
  async function init() {
    wire();
    try {
      const payload=await Promise.all(courses.map(c=>load('../data/'+c.key+'.json')));
      payload.forEach((data,index)=>{
        if (!Array.isArray(data.weeks)||!data.weeks.length) throw new Error('Ders haftaları eksik.');
        state.data[courses[index].key]=data;
      });
      try {
        const text=await load('../home-calendar.js','text');
        const match=text.match(/const EVENTS = (\[[\s\S]*?\]);\s*\n\s*const TR_MONTHS/);
        if (!match) throw new Error('Takvim olayları okunamadı.');
        state.events=JSON.parse(match[1]).sort((a,b)=>a.date.localeCompare(b.date));
        state.calendarReady=true;
      } catch { state.calendarReady=false; }
      state.ready=true;state.day=iso(today());
      buildSearch();renderWeek();
      await loadMaterials();
    } catch {
      $('#weekStatus').textContent='Ders haftaları şu anda yüklenemedi.';
      $('#weekLead').textContent='Dersleri veya günlük planların bulunduğu evrak sayfasını açabilirsiniz.';
      $('#weekRows').innerHTML=courses.map(c=>archiveCard(c,'Ders sayfasını açabilirsiniz.')).join('');
      $('#calendarSummary').innerHTML=calendarRow('Takvim','<a href="../takvim.html">Eğitim takvimini aç →</a>');
      $('#prevWeek').disabled=true;$('#nextWeek').disabled=true;
    }
  }
  init();
})();
