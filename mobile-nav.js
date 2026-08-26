(function(){
  const COURSE_PAGES = {
    robotik: 'robotik-kodlama.html',
    yapayzeka: 'yapay-zeka.html'
  };

  function normalizeCourseLinks(){
    document.querySelectorAll('a').forEach(a => {
      const text = (a.textContent || '').trim();
      const href = a.getAttribute('href') || '';
      if(text === 'Robotik Kodlama' || href === '#robotik' || href === 'index.html#robotik'){
        a.setAttribute('href', COURSE_PAGES.robotik);
      }
      if(text === 'Yapay Zekâ' || text === 'Yapay Zeka' || href === '#yapayzeka' || href === 'index.html#yapayzeka'){
        a.setAttribute('href', COURSE_PAGES.yapayzeka);
      }
    });

    const robotCard = document.getElementById('robotik');
    if(robotCard && robotCard.classList.contains('area-card') && robotCard.tagName !== 'A'){
      robotCard.setAttribute('role','link');
      robotCard.setAttribute('tabindex','0');
      robotCard.style.cursor='pointer';
      robotCard.addEventListener('click',()=>location.href=COURSE_PAGES.robotik);
      robotCard.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault();location.href=COURSE_PAGES.robotik;} });
      const tag=robotCard.querySelector('.area-tag'); if(tag) tag.textContent='36 günlük plan · 72 saat';
    }

    const aiCard = document.getElementById('yapayzeka');
    if(aiCard && aiCard.classList.contains('area-card') && aiCard.tagName !== 'A'){
      aiCard.setAttribute('role','link');
      aiCard.setAttribute('tabindex','0');
      aiCard.style.cursor='pointer';
      aiCard.addEventListener('click',()=>location.href=COURSE_PAGES.yapayzeka);
      aiCard.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault();location.href=COURSE_PAGES.yapayzeka;} });
      const tag=aiCard.querySelector('.area-tag'); if(tag) tag.textContent='36 günlük plan · 72 saat';
    }

    document.querySelectorAll('.terminal-body .line').forEach(line=>{
      if(line.textContent.includes('Robotik Kodlama modülü')){
        line.classList.remove('pending'); line.classList.add('ok');
        line.textContent='› Robotik Kodlama modülü .................. hazır';
      }
      if(line.textContent.includes('Yapay Zekâ modülü')){
        line.classList.remove('pending'); line.classList.add('ok');
        line.textContent='› Yapay Zekâ modülü ......................... hazır';
      }
    });
  }

  function extendSearchIndex(){
    if(typeof SEARCH_INDEX === 'undefined' || !Array.isArray(SEARCH_INDEX)) return;
    const add = item => { if(!SEARCH_INDEX.some(x => x.url === item.url)) SEARCH_INDEX.push(item); };
    add({title:'Robotik Kodlama-I',subtitle:'5. Sınıf · 36 günlük plan · 72 saat',url:'robotik-kodlama.html',type:'sayfa'});
    add({title:'Yapay Zekâ Uygulamaları-I',subtitle:'7–8. Sınıf · 36 günlük plan · 72 saat',url:'yapay-zeka.html',type:'sayfa'});
    if(typeof COURSE !== 'undefined' && COURSE && Array.isArray(COURSE.weeks)){
      const page = location.pathname.split('/').pop() || 'index.html';
      COURSE.weeks.forEach(w=>add({
        title:`${w.hafta_no}. Hafta — ${w.konu}`,
        subtitle:`${COURSE.title} · ${w.tarih} · ${w.unite}`,
        url:`${page}#hafta-${w.hafta_no}`,
        type:'hafta'
      }));
    }
  }

  const style = document.createElement('style');
  style.textContent = `
    .mnav-btn{display:none;background:none;border:none;cursor:pointer;padding:6px;color:var(--ink);flex-shrink:0;}
    .mnav-btn svg{width:24px;height:24px;display:block;}
    @media (max-width:1060px){ .mnav-btn{display:flex;} }
    .mnav-panel{display:none;position:fixed;inset:0;z-index:150;background:rgba(15,21,36,0.55);backdrop-filter:blur(2px);}
    .mnav-panel.open{display:block;}
    .mnav-sheet{position:relative;background:var(--surface);padding:18px 24px 26px;border-radius:0 0 16px 16px;display:flex;flex-direction:column;gap:2px;box-shadow:0 20px 50px -20px rgba(15,21,36,0.4);max-width:var(--maxw);margin:0 auto;}
    .mnav-sheet a{padding:13px 6px;font-size:1rem;font-weight:500;color:var(--ink-soft);border-bottom:1px solid var(--bg);}
    .mnav-sheet a.active{color:var(--teal-deep);}
    .mnav-sheet .navcta{margin-top:10px;text-align:center;border-bottom:none;background:var(--ink);color:#fff;border-radius:8px;}
    .mnav-sheet .cp-trigger{justify-content:center;margin-top:6px;border-bottom:none;align-self:flex-start;width:auto;}
    .mnav-close{position:absolute;top:14px;right:18px;background:none;border:none;cursor:pointer;color:var(--ink-faint);padding:6px;}
    .mnav-close svg{width:20px;height:20px;display:block;}
  `;
  document.head.appendChild(style);

  function setup(){
    normalizeCourseLinks();
    extendSearchIndex();

    const nav = document.querySelector('header nav');
    const navlinks = document.querySelector('.navlinks');
    if(!nav || !navlinks) return;

    const oldToggle = nav.querySelector('.menutoggle');
    if(oldToggle) oldToggle.remove();

    const btn = document.createElement('button');
    btn.className = 'mnav-btn';
    btn.setAttribute('aria-label', 'Menüyü aç');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
    nav.appendChild(btn);

    const panel = document.createElement('div');
    panel.className = 'mnav-panel';
    const sheet = document.createElement('div');
    sheet.className = 'mnav-sheet';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'mnav-close';
    closeBtn.setAttribute('aria-label', 'Menüyü kapat');
    closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    sheet.appendChild(closeBtn);

    Array.from(navlinks.children).forEach(child => sheet.appendChild(child.cloneNode(true)));
    panel.appendChild(sheet);
    document.body.appendChild(panel);

    function open(){ panel.classList.add('open'); }
    function close(){ panel.classList.remove('open'); }

    btn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    panel.addEventListener('click', (e) => { if(e.target === panel) close(); });
    sheet.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', (e) => { if(e.key === 'Escape') close(); });

    const clonedSearchBtn = sheet.querySelector('.cp-trigger');
    if(clonedSearchBtn){
      clonedSearchBtn.addEventListener('click', () => {
        close();
        setTimeout(() => {
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
        }, 200);
      });
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
})();
