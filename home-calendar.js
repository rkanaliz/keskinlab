(function(){
  const EVENTS = [{"date": "2026-09-14", "label": "Ders Yılı Başlangıcı", "type": "donem"}, {"date": "2026-10-29", "label": "Cumhuriyet Bayramı", "type": "kutlama"}, {"date": "2026-11-10", "label": "Atatürk'ü Anma", "type": "kutlama"}, {"date": "2026-11-16", "label": "Ara Tatil", "type": "tatil"}, {"date": "2026-11-17", "label": "Ara Tatil", "type": "tatil"}, {"date": "2026-11-18", "label": "Ara Tatil", "type": "tatil"}, {"date": "2026-11-19", "label": "Ara Tatil", "type": "tatil"}, {"date": "2026-11-20", "label": "Ara Tatil", "type": "tatil"}, {"date": "2026-11-24", "label": "Öğretmenler Günü", "type": "kutlama"}, {"date": "2027-01-01", "label": "Yılbaşı", "type": "tatil"}, {"date": "2027-01-25", "label": "Yarıyıl Tatili", "type": "tatil"}, {"date": "2027-01-26", "label": "Yarıyıl Tatili", "type": "tatil"}, {"date": "2027-01-27", "label": "Yarıyıl Tatili", "type": "tatil"}, {"date": "2027-01-28", "label": "Yarıyıl Tatili", "type": "tatil"}, {"date": "2027-01-29", "label": "Yarıyıl Tatili", "type": "tatil"}, {"date": "2027-01-30", "label": "Yarıyıl Tatili", "type": "tatil"}, {"date": "2027-01-31", "label": "Yarıyıl Tatili", "type": "tatil"}, {"date": "2027-02-01", "label": "Yarıyıl Tatili", "type": "tatil"}, {"date": "2027-02-02", "label": "Yarıyıl Tatili", "type": "tatil"}, {"date": "2027-02-03", "label": "Yarıyıl Tatili", "type": "tatil"}, {"date": "2027-02-04", "label": "Yarıyıl Tatili", "type": "tatil"}, {"date": "2027-02-05", "label": "Yarıyıl Tatili", "type": "tatil"}, {"date": "2027-03-08", "label": "Ramazan Bayramı", "type": "tatil"}, {"date": "2027-03-09", "label": "Ramazan Bayramı", "type": "tatil"}, {"date": "2027-03-10", "label": "Ramazan Bayramı", "type": "tatil"}, {"date": "2027-03-11", "label": "Ramazan Bayramı", "type": "tatil"}, {"date": "2027-03-12", "label": "Ara Tatil", "type": "tatil"}, {"date": "2027-04-23", "label": "Ulusal Egemenlik ve Çocuk Bayramı", "type": "kutlama"}, {"date": "2027-05-15", "label": "Kurban Bayramı", "type": "tatil"}, {"date": "2027-05-16", "label": "Kurban Bayramı", "type": "tatil"}, {"date": "2027-05-17", "label": "Kurban Bayramı", "type": "tatil"}, {"date": "2027-05-18", "label": "Kurban Bayramı", "type": "tatil"}, {"date": "2027-05-19", "label": "19 Mayıs / Kurban Bayramı (5. gün)", "type": "kutlama"}, {"date": "2027-06-25", "label": "Ders Yılı Bitişi", "type": "donem"}];

  const EVENTS_MAP = {};
  EVENTS.forEach(e => { EVENTS_MAP[e.date] = e; });

  const TR_MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
  const TR_DOW = ["Pt","Sa","Ça","Pe","Cu","Ct","Pz"];

  const style = document.createElement('style');
  style.textContent = `
    .cal-grid-head{position:relative;}
    .cal-nav{
      background:none;border:none;cursor:pointer;color:#AEB6CC;font-size:1.1rem;
      width:26px;height:26px;display:flex;align-items:center;justify-content:center;border-radius:6px;
      transition:background .15s, color .15s;
    }
    .cal-nav:hover{background:rgba(255,255,255,0.08);color:#fff;}
    .cal-days span{position:relative;cursor:default;}
    .cal-days span.has-event{cursor:pointer;}
    .cal-days span.has-event:hover{background:rgba(255,255,255,0.08);}
    .cal-days span .dot{
      position:absolute;bottom:2px;left:50%;transform:translateX(-50%);
      width:4px;height:4px;border-radius:50%;background:currentColor;
    }
    .cal-days span.event .dot{background:var(--amber);}
    .cal-today-row{display:flex;justify-content:flex-end;margin-top:10px;}
    .cal-today-btn{
      background:none;border:none;color:#7D86A0;font-family:'IBM Plex Mono',monospace;
      font-size:0.7rem;cursor:pointer;padding:2px 6px;
    }
    .cal-today-btn:hover{color:#fff;}
    .cal-popover{
      margin-top:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);
      border-radius:8px;padding:9px 12px;font-size:0.8rem;color:#DDE2F0;
    }
    .cal-list li{cursor:default;}
  `;
  document.head.appendChild(style);

  function pad(n){ return String(n).padStart(2,'0'); }
  function dkey(y,m,d){ return `${y}-${pad(m+1)}-${pad(d)}`; }

  const today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();

  function upcomingEvents(fromDate, limit){
    const fromKey = dkey(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
    const future = EVENTS.filter(e => e.date >= fromKey);
    const seen = new Set();
    const out = [];
    for(const e of future){
      const sig = e.label;
      if(seen.has(sig)) continue;
      seen.add(sig);
      out.push(e);
      if(out.length >= limit) break;
    }
    return out;
  }

  function fmtShort(dateStr){
    const [y,m,d] = dateStr.split('-').map(Number);
    const MON = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
    return `${d} ${MON[m-1]}`;
  }

  function renderUpcoming(){
    const list = document.querySelector('.cal-list');
    if(!list) return;
    const items = upcomingEvents(today, 3);
    list.innerHTML = items.map(e =>
      `<li><span class="cal-date">${fmtShort(e.date)}</span> ${e.label}</li>`
    ).join('') || '<li>Yaklaşan özel gün yok</li>';
  }

  function renderGrid(){
    const box = document.querySelector('.cal-grid-box');
    if(!box) return;

    let head = box.querySelector('.cal-grid-head');
    let dow = box.querySelector('.cal-dow');
    let daysEl = box.querySelector('.cal-days');

    if(!head.querySelector('.cal-nav')){
      head.innerHTML = `
        <button class="cal-nav" data-dir="-1" aria-label="Önceki ay">‹</button>
        <span class="cal-month-label"></span>
        <button class="cal-nav" data-dir="1" aria-label="Sonraki ay">›</button>`;
      head.querySelectorAll('.cal-nav').forEach(btn => {
        btn.addEventListener('click', () => {
          viewMonth += parseInt(btn.dataset.dir, 10);
          if(viewMonth < 0){ viewMonth = 11; viewYear--; }
          if(viewMonth > 11){ viewMonth = 0; viewYear++; }
          renderGrid();
        });
      });
    }
    if(!dow.dataset.built){
      dow.innerHTML = TR_DOW.map(d => `<span>${d}</span>`).join('');
      dow.dataset.built = '1';
    }
    if(!box.querySelector('.cal-today-row')){
      const row = document.createElement('div');
      row.className = 'cal-today-row';
      row.innerHTML = '<button class="cal-today-btn">Bugüne Dön</button>';
      row.querySelector('.cal-today-btn').addEventListener('click', () => {
        viewYear = today.getFullYear();
        viewMonth = today.getMonth();
        renderGrid();
      });
      box.appendChild(row);
      const pop = document.createElement('div');
      pop.className = 'cal-popover';
      pop.hidden = true;
      box.appendChild(pop);
    }

    head.querySelector('.cal-month-label').textContent = `${TR_MONTHS[viewMonth]} ${viewYear}`;

    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startWeekday = (firstOfMonth.getDay() + 6) % 7; // Pazartesi=0
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    let cellsHTML = '';
    for(let i = 0; i < startWeekday; i++){
      cellsHTML += `<span class="muted">${daysInPrevMonth - startWeekday + 1 + i}</span>`;
    }
    for(let d = 1; d <= daysInMonth; d++){
      const k = dkey(viewYear, viewMonth, d);
      const ev = EVENTS_MAP[k];
      const isToday = (viewYear === today.getFullYear() && viewMonth === today.getMonth() && d === today.getDate());
      let cls = [];
      if(isToday) cls.push('today');
      if(ev) cls.push(ev.type === 'kutlama' ? 'event' : 'holiday', 'has-event');
      cellsHTML += `<span class="${cls.join(' ')}" data-key="${k}" data-label="${ev ? ev.label.replace(/"/g,'&quot;') : ''}">${d}${ev ? '<i class="dot"></i>' : ''}</span>`;
    }
    let totalCells = startWeekday + daysInMonth;
    let trailing = (7 - (totalCells % 7)) % 7;
    for(let i = 1; i <= trailing; i++){
      cellsHTML += `<span class="muted">${i}</span>`;
    }
    daysEl.innerHTML = cellsHTML;

    const pop = box.querySelector('.cal-popover');
    pop.hidden = true;
    daysEl.querySelectorAll('.has-event').forEach(el => {
      el.addEventListener('click', () => {
        pop.hidden = false;
        pop.textContent = `${el.textContent.replace(/\d+$/,'').trim() || el.dataset.key} — ${el.dataset.label}`;
        const d = parseInt(el.dataset.key.split('-')[2], 10);
        pop.textContent = `${d} ${TR_MONTHS[viewMonth]}: ${el.dataset.label}`;
      });
    });
  }

  function init(){
    if(!document.querySelector('.cal-grid-box')) return;
    renderGrid();
    renderUpcoming();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
