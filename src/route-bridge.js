(() => {
  const pages={
    '#/checkout':'/checkout.html','#/pedidos':'/orders.html','#/favoritos':'/favoritos.html','#/indicacoes':'/indicacoes.html','#/ajuda':'/ajuda.html','#/mensagens':'/chat.html'
  };
  const go=(hash)=>{
    if(!hash)return false;
    if(pages[hash]){location.href=pages[hash];return true}
    const m=hash.match(/^#\/produto\/([^/?#]+)/);
    if(m){location.href='/produto.html?id='+encodeURIComponent(m[1]);return true}
    return false;
  };
  document.addEventListener('click',e=>{const a=e.target.closest?.('a[href^="#/"]');if(a&&go(a.getAttribute('href')))e.preventDefault()},true);
  go(location.hash);
})();
