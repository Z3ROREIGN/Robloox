(() => {
  const go = (hash) => {
    if (!hash) return false;
    if (hash === '#/checkout') { location.href = '/checkout.html'; return true; }
    if (hash === '#/pedidos') { location.href = '/orders.html'; return true; }
    const m = hash.match(/^#\/produto\/([^/?#]+)/);
    if (m) { location.href = '/produto.html?id=' + encodeURIComponent(m[1]); return true; }
    return false;
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href^="#/"]');
    if (a && go(a.getAttribute('href'))) e.preventDefault();
  }, true);
  go(location.hash);
})();
