/* Ensures the SPA account route renders even when the hash is selected before main.js finishes booting. */
(() => {
  const wake = () => {
    if (location.hash !== '#/conta') return;
    const ready = () => !!document.querySelector('.account-grid,.profile,.rx-account-categories');
    if (ready()) return;
    window.dispatchEvent(new Event('hashchange'));
  };
  addEventListener('hashchange', () => [0,120,400,900].forEach(t => setTimeout(wake,t)));
  [0,250,700,1400].forEach(t => setTimeout(wake,t));
})();
