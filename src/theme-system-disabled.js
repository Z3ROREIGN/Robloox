(() => {
  const kill = () => {
    try { localStorage.removeItem('rooblox_theme'); localStorage.removeItem('rooblox_theme_v1'); localStorage.removeItem('theme'); } catch {}
    const root=document.documentElement;
    root.removeAttribute('data-theme');
    root.style.colorScheme='dark';
    document.querySelectorAll('[data-rx-theme],.theme-toggle,.theme-switch,.theme-picker,[data-theme-toggle],[data-theme-switch]').forEach(el=>el.remove());
    document.querySelectorAll('.rx-actions').forEach(el=>{ if(!el.querySelector('.rx-fav-header')) el.classList.add('theme-disabled'); });
    document.querySelectorAll('select').forEach(el=>{ if(/automático|claro|escuro|dark|light|theme/i.test(el.textContent||'')) el.remove(); });
  };
  kill();
  new MutationObserver(kill).observe(document.documentElement,{subtree:true,childList:true,attributes:true});
})();
