(() => {
  const clean = () => {
    try {
      localStorage.removeItem('rooblox_theme');
      localStorage.removeItem('rooblox_theme_v1');
      localStorage.removeItem('rooblox_theme_v2');
      localStorage.removeItem('theme');
    } catch {}
    const root = document.documentElement;
    root.style.colorScheme = 'dark';
    root.removeAttribute('data-theme');
    root.removeAttribute('data-theme-preference');
    document.querySelectorAll('.theme-toggle,.theme-switch,.theme-picker,[data-theme-toggle],[data-theme-switch],[data-rx-theme],.rx-theme-menu').forEach(el => el.remove());
  };
  clean();
  setInterval(clean, 500);
})();
