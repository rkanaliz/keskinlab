(function(){
  const style = document.createElement('style');
  style.textContent = `
    .cp-trigger{
      display:flex;align-items:center;gap:8px;font-family:'IBM Plex Mono',monospace;
      font-size:0.8rem;color:var(--ink-faint);background:var(--surface);border:1px solid var(--line);
      border-radius:8px;padding:7px 10px;cursor:pointer;transition:border-color .15s;
    }
    .cp-trigger:hover{border-color:var(--teal);color:var(--ink-soft);}
    .cp-trigger kbd{
      font-family:'IBM Plex Mono',monospace;font-size:0.68rem;background:var(--bg);
      border:1px solid var(--line);border-radius:4px;padding:1px 5px;
    }
    .cp-overlay{
      position:fixed;inset:0;background:rgba(15,21,36,0.55);backdrop-filter:blur(2px);
      z-index:200;display:none;align-items:flex-start;justify-content:center;padding-top:12vh;
    }
    .cp-overlay.open{display:flex;}
    .cp-modal{
      width:92%;max-width:560px;background:var(--surface);border-radius:14px;
      box-shadow:0 30px 70px -20px rgba(15,21,36,0.5);overflow:hidden;
      font-family:'Inter',system-ui,sans-serif;
    }
    .cp-input-row{display:flex;align-items:center;gap:10px;padding:16px 18px;border-bottom:1px solid var(--line);}
    .cp-input-row svg{width:18px;height:18px;color:var(--ink-faint);flex-shrink:0;}
    .cp-input{
      flex:1;border:none;outline:none;font-size:1rem;background:transparent;color:var(--ink);
      font-family:'Inter',system-ui,sans-serif;
    }
    .cp-esc{
      font-family:'IBM Plex Mono',monospace;font-size:0.68rem;color:var(--ink-faint);
      background:var(--bg);border:1px solid var(--line);border-radius:4px;padding:2px 6px;flex-shrink:0;
    }
    .cp-results{max-height:52vh;overflow-y:auto;padding:8px;}
    .cp-item{
      display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:9px;cursor:pointer;
    }
    .cp-item.active{background:#EAF3F1;}
    .cp-item-icon{
      width:30px;height:30px;border-radius:7px;background:var(--bg);color:var(--teal-deep);
      display:flex;align-items:center;justify-content:center;flex-shrink:0;
    }
    .cp-item-icon svg{width:15px;height:15px;}
    .cp-item-main{flex:1;min-width:0;}
    .cp-item-title{font-size:0.9rem;font-weight:600;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .cp-item-sub{font-size:0.76rem;color:var(--ink-faint);font-family:'IBM Plex Mono',monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .cp-empty{padding:30px 18px;text-align:center;color:var(--ink-faint);font-size:0.86rem;}
  `;
  document.head.appendChild(style);

  const trigger = document.createElement('button');
  trigger.className = 'cp-trigger';
  trigger.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>Ara<kbd>⌘K</kbd>';
  trigger.setAttribute('aria-label', 'Site içinde ara');

  const overlay = document.createElement('div');
  overlay.className = 'cp-overlay';
  overlay.innerHTML = `
    <div class="cp-modal">
      <div class="cp-input-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <input class="cp-input" type="text" placeholder="Hafta, konu ya da sayfa ara…" autocomplete="off">
        <span class="cp-esc">ESC</span>
      </div>
      <div class="cp-results"></div>
    </div>`;
  document.body.appendChild(overlay);

  const input = overlay.querySelector('.cp-input');
  const resultsEl = overlay.querySelector('.cp-results');
  let activeIndex = 0;
  let currentResults = [];

  function iconFor(type){
    if(type === 'sayfa') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/></svg>';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';
  }

  function search(query){
    const idx = (typeof SEARCH_INDEX !== 'undefined') ? SEARCH_INDEX : [];
    if(!query.trim()) return idx.filter(i => i.type === 'sayfa');
    const q = query.toLocaleLowerCase('tr');
    return idx.filter(i =>
      i.title.toLocaleLowerCase('tr').includes(q) ||
      i.subtitle.toLocaleLowerCase('tr').includes(q)
    ).slice(0, 30);
  }

  function render(){
    if(currentResults.length === 0){
      resultsEl.innerHTML = '<div class="cp-empty">Sonuç bulunamadı</div>';
      return;
    }
    resultsEl.innerHTML = currentResults.map((r, i) => `
      <div class="cp-item ${i === activeIndex ? 'active' : ''}" data-idx="${i}">
        <div class="cp-item-icon">${iconFor(r.type)}</div>
        <div class="cp-item-main">
          <div class="cp-item-title">${r.title}</div>
          <div class="cp-item-sub">${r.subtitle}</div>
        </div>
      </div>
    `).join('');
    resultsEl.querySelectorAll('.cp-item').forEach(el => {
      el.addEventListener('click', () => go(parseInt(el.dataset.idx)));
      el.addEventListener('mouseenter', () => { activeIndex = parseInt(el.dataset.idx); render(); });
    });
  }

  function go(i){
    const r = currentResults[i];
    if(r) window.location.href = r.url;
  }

  function openPalette(){
    overlay.classList.add('open');
    input.value = '';
    currentResults = search('');
    activeIndex = 0;
    render();
    setTimeout(() => input.focus(), 30);
  }
  function closePalette(){
    overlay.classList.remove('open');
  }

  trigger.addEventListener('click', openPalette);
  overlay.addEventListener('click', (e) => { if(e.target === overlay) closePalette(); });

  input.addEventListener('input', () => {
    currentResults = search(input.value);
    activeIndex = 0;
    render();
  });

  document.addEventListener('keydown', (e) => {
    const isK = e.key === 'k' || e.key === 'K';
    if((e.metaKey || e.ctrlKey) && isK){
      e.preventDefault();
      overlay.classList.contains('open') ? closePalette() : openPalette();
      return;
    }
    if(!overlay.classList.contains('open')) return;
    if(e.key === 'Escape'){ closePalette(); }
    else if(e.key === 'ArrowDown'){ e.preventDefault(); activeIndex = Math.min(activeIndex+1, currentResults.length-1); render(); }
    else if(e.key === 'ArrowUp'){ e.preventDefault(); activeIndex = Math.max(activeIndex-1, 0); render(); }
    else if(e.key === 'Enter'){ e.preventDefault(); go(activeIndex); }
  });

  // Mount trigger button into nav (before the navcta button if present, else append to .navlinks)
  document.addEventListener('DOMContentLoaded', () => {
    const navlinks = document.querySelector('.navlinks');
    if(navlinks){
      const cta = navlinks.querySelector('.navcta');
      if(cta) navlinks.insertBefore(trigger, cta);
      else navlinks.appendChild(trigger);
    }
  });
  if(document.readyState !== 'loading'){
    const navlinks = document.querySelector('.navlinks');
    if(navlinks){
      const cta = navlinks.querySelector('.navcta');
      if(cta) navlinks.insertBefore(trigger, cta);
      else navlinks.appendChild(trigger);
    }
  }
})();
