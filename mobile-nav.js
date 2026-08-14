(function(){
  const style = document.createElement('style');
  style.textContent = `
    .mnav-btn{
      display:none;background:none;border:none;cursor:pointer;padding:6px;color:var(--ink);flex-shrink:0;
    }
    .mnav-btn svg{width:24px;height:24px;display:block;}
    @media (max-width:1060px){ .mnav-btn{display:flex;} }
    .mnav-panel{
      display:none;position:fixed;inset:0;z-index:150;
      background:rgba(15,21,36,0.55);backdrop-filter:blur(2px);
    }
    .mnav-panel.open{display:block;}
    .mnav-sheet{
      position:relative;background:var(--surface);padding:18px 24px 26px;
      border-radius:0 0 16px 16px;display:flex;flex-direction:column;gap:2px;
      box-shadow:0 20px 50px -20px rgba(15,21,36,0.4);max-width:var(--maxw);margin:0 auto;
    }
    .mnav-sheet a{
      padding:13px 6px;font-size:1rem;font-weight:500;color:var(--ink-soft);
      border-bottom:1px solid var(--bg);
    }
    .mnav-sheet a.active{color:var(--teal-deep);}
    .mnav-sheet .navcta{
      margin-top:10px;text-align:center;border-bottom:none;background:var(--ink);color:#fff;border-radius:8px;
    }
    .mnav-sheet .cp-trigger{justify-content:center;margin-top:6px;border-bottom:none;}
    .mnav-close{
      position:absolute;top:14px;right:18px;background:none;border:none;cursor:pointer;
      color:var(--ink-faint);padding:6px;
    }
    .mnav-close svg{width:20px;height:20px;display:block;}
  `;
  document.head.appendChild(style);

  function setup(){
    const nav = document.querySelector('header nav');
    const navlinks = document.querySelector('.navlinks');
    if(!nav || !navlinks) return;

    // Var olan (index.html'deki işlevsiz) eski hamburger düğmesini kaldır
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

    // .navlinks içindeki tüm öğeleri (linkler + varsa Ara düğmesi) klonla
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

    // Klonlanan "Ara" düğmesinin orijinal olay dinleyicisi kopyalanmaz —
    // tıklanınca paneli kapat ve gerçek ⌘K kısayolunu tetikle.
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

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
