(() => {
  const fallback = img => {
    if (img.dataset.mediaFallback) return;
    img.dataset.mediaFallback = '1';
    img.style.opacity = '0';
    const box = img.closest('.cover,.product-image');
    if (box) {
      box.classList.add('media-failed');
      if (!box.querySelector('.media-fallback-icon')) {
        const el = document.createElement('div');
        el.className = 'media-fallback-icon';
        el.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1.5"/><path d="m5 17 5-5 3 3 2-2 4 4"/></svg><span>Imagem indisponível</span>';
        box.appendChild(el);
      }
    }
  };
  const prepare = root => root.querySelectorAll?.('img').forEach(img => {
    if (!img.dataset.mediaPrepared) {
      img.dataset.mediaPrepared = '1';
      img.loading = img.loading || 'lazy';
      img.decoding = 'async';
      img.addEventListener('error', () => fallback(img), {once:true});
      if (img.complete && img.naturalWidth === 0 && img.src) fallback(img);
    }
  });
  prepare(document);
  new MutationObserver(m => m.forEach(x => x.addedNodes.forEach(n => n.nodeType === 1 && prepare(n)))).observe(document.documentElement,{childList:true,subtree:true});
})();
