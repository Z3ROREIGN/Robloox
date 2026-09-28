(() => {
  try { localStorage.removeItem('rooblox_theme'); localStorage.removeItem('theme'); } catch {}
  const force = () => {
    const root = document.documentElement;
    root.removeAttribute('data-theme');
    root.classList.remove('light','dark','theme-light','theme-dark');
    root.style.colorScheme = 'dark';
    document.body?.classList.remove('light','theme-light');
    document.querySelectorAll('.theme-toggle,.theme-switch,.theme-picker,[data-theme-toggle],[data-theme-switch]').forEach(x => x.remove());
  };
  force();
  new MutationObserver(force).observe(document.documentElement,{attributes:true,childList:true,subtree:true});
})();
