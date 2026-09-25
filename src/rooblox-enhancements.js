/* Rooblox Complete Upgrade: favorites, theme, catalog tools, account UX, PWA install. */
const RX_KEY='rooblox_favorites_v1', RX_THEME='rooblox_theme_v1';
const rxGet=()=>{try{return JSON.parse(localStorage.getItem(RX_KEY)||'[]')}catch{return[]}};
const rxSet=v=>localStorage.setItem(RX_KEY,JSON.stringify([...new Set(v)]));
const rxTheme=()=>localStorage.getItem(RX_THEME)||'light';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const brl=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const heart=()=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 8.7c0 5.5-8.8 10.3-8.8 10.3S3.2 14.2 3.2 8.7A5 5 0 0 1 12 5a5 5 0 0 1 8.8 3.7Z"/></svg>';
function applyTheme(){document.documentElement.dataset.theme=rxTheme()}
function toggleTheme(){const n=rxTheme()==='dark'?'light':'dark';localStorage.setItem(RX_THEME,n);applyTheme();decorate()}
function decorate(){
 applyTheme();
 const right=document.querySelector('.site-header .right');
 if(right&&!right.querySelector('[data-rx-theme]')){
   const wrap=document.createElement('span');wrap.className='rx-actions';
   wrap.innerHTML='<button class="rx-icon-btn" data-rx-theme aria-label="Alternar tema">◐</button><a class="rx-icon-btn" href="#/favoritos" aria-label="Favoritos">♡</a>';
   right.appendChild(wrap);wrap.querySelector('[data-rx-theme]').onclick=toggleTheme;
 }
 document.querySelectorAll('.card').forEach(card=>{
   const a=card.querySelector('.cover[href*="/produto/"]');const id=a?.getAttribute('href')?.split('/produto/')[1];if(!id||card.querySelector('.rx-fav'))return;
   const b=document.createElement('button');b.className='rx-fav';b.innerHTML=heart();b.title='Adicionar aos favoritos';b.setAttribute('aria-label','Adicionar aos favoritos');
   if(rxGet().includes(id))b.classList.add('active');
   b.onclick=e=>{e.preventDefault();e.stopPropagation();const f=rxGet();const on=f.includes(id);rxSet(on?f.filter(x=>x!==id):[...f,id]);b.classList.toggle('active',!on);b.title=on?'Adicionar aos favoritos':'Remover dos favoritos'};
   card.querySelector('.cover')?.appendChild(b);
 });
 const p=document.querySelector('.product-info');if(p&&!p.querySelector('.rx-product-fav')){const id=location.hash.split('/produto/')[1];if(id){const b=document.createElement('button');b.className='ghost rx-product-fav';b.innerHTML=heart()+' <span>Favoritar</span>';if(rxGet().includes(id))b.classList.add('active');b.onclick=()=>{const f=rxGet(),on=f.includes(id);rxSet(on?f.filter(x=>x!==id):[...f,id]);b.classList.toggle('active',!on);b.querySelector('span').textContent=on?'Favoritar':'Favoritado'};p.querySelector('.purchase-note')?.before(b)}}
 if(location.hash==='#/catalogo')catalogTools();
 if(location.hash==='#/conta')accountTools();
 if(location.hash==='#/favoritos')favoritesPage();
}
function catalogTools(){
 const grid=document.querySelector('.page .grid');if(!grid)return;
 if(!document.querySelector('.rx-toolbar')){const bar=document.createElement('div');bar.className='rx-toolbar';bar.innerHTML='<span class="rx-count"></span><select class="rx-sort" aria-label="Ordenar produtos"><option value="featured">Recomendados</option><option value="priceAsc">Menor preço</option><option value="priceDesc">Maior preço</option><option value="name">Nome A–Z</option></select>';grid.before(bar)}
 const cards=[...grid.querySelectorAll('.card')],sort=document.querySelector('.rx-sort'),count=document.querySelector('.rx-count');count.textContent=cards.length+' produto(s) exibido(s)';
 const key='rooblox_sort';sort.value=localStorage.getItem(key)||'featured';sort.onchange=()=>{localStorage.setItem(key,sort.value);sortCards(grid,sort.value)};
 sortCards(grid,sort.value)
}
function sortCards(grid,mode){const cards=[...grid.querySelectorAll('.card')];cards.sort((a,b)=>{const pa=Number(a.querySelector('.price')?.textContent.replace(/[^0-9,-]/g,'').replace('.','').replace(',','.'))||0,pb=Number(b.querySelector('.price')?.textContent.replace(/[^0-9,-]/g,'').replace('.','').replace(',','.'))||0,na=a.querySelector('h3')?.textContent||'',nb=b.querySelector('h3')?.textContent||'';return mode==='priceAsc'?pa-pb:mode==='priceDesc'?pb-pa:mode==='name'?na.localeCompare(nb,'pt-BR'):0});cards.forEach(x=>grid.appendChild(x))}
function favoritesPage(){
 const app=document.querySelector('#app');if(!app)return;
 const ids=rxGet();const cards=[...document.querySelectorAll('.card')]; // no-op: main rendered home before this route
 const cached=JSON.parse(localStorage.getItem('rooblox_products_cache')||'[]');const products=cached.filter(p=>ids.includes(String(p.id)));
 app.querySelectorAll('.rx-favorites-page').forEach(x=>x.remove());
 const old=app.querySelector('main');const html='<section class="page rx-favorites-page"><div class="page-head"><div><span class="eyebrow dark">MINHA CONTA</span><h1>Favoritos</h1><p>Seus produtos salvos para encontrar depois.</p></div></div><div class="rx-fav-grid">'+(products.length?products.map(p=>'<article class="card"><a class="cover" href="#/produto/'+encodeURIComponent(p.id)+'">'+(p.image_url?'<img src="'+esc(p.image_url)+'" alt="'+esc(p.name)+'">':'<span class="cover-fallback">♡</span>')+'</a><div class="card-body"><small>'+esc(p.category_slug||'Produto')+'</small><h3>'+esc(p.name)+'</h3><div class="price">'+brl(p.price)+'</div><button class="add" data-rx-unfav="'+esc(p.id)+'">Remover dos favoritos</button></div></article>').join(''):'<div class="rx-empty"><h3>Nenhum favorito ainda</h3><p>Toque no coração de um produto para salvá-lo.</p><a class="primary" href="#/catalogo">Explorar produtos</a></div>')+'</div></section>';app.innerHTML=html;
 app.querySelectorAll('[data-rx-unfav]').forEach(b=>b.onclick=()=>{rxSet(rxGet().filter(x=>x!==b.dataset.rxUnfav));favoritesPage()});
}
function accountTools(){
 const page=document.querySelector('.page');if(!page||page.querySelector('.rx-stat-row'))return;
 const stats=document.createElement('div');stats.className='rx-stat-row';stats.innerHTML='<div class="rx-stat"><b>'+JSON.parse(localStorage.getItem('rooblox_cart')||'[]').length+'</b><span>Itens no carrinho</span></div><div class="rx-stat"><b>'+rxGet().length+'</b><span>Favoritos</span></div><div class="rx-stat"><b>'+('theme' in localStorage?localStorage.getItem(RX_THEME):'light')+'</b><span>Tema atual</span></div>';page.querySelector('.profile')?.after(stats);
 const grid=page.querySelector('.account-grid');if(grid&&!grid.querySelector('[href="#/favoritos"]')){const a=document.createElement('a');a.className='panel';a.href='#/favoritos';a.innerHTML='<span class="panel-icon">♡</span><b>Favoritos</b><span>Produtos que você salvou.</span>';grid.prepend(a)}
}
function cacheProducts(){
 const cards=[...document.querySelectorAll('.card')];const data=cards.map(c=>{const a=c.querySelector('.cover[href*="/produto/"]');const id=a?.href?.split('/produto/')[1];return id?{id,name:c.querySelector('h3')?.textContent||'',price:Number((c.querySelector('.price')?.textContent||'').replace(/[^0-9,]/g,'').replace(',','.')),category_slug:c.querySelector('small')?.textContent||'Produto',image_url:c.querySelector('.cover img')?.getAttribute('src')||null}:null}).filter(Boolean);if(data.length)localStorage.setItem('rooblox_products_cache',JSON.stringify(data))}
function pwa(){
 let deferred=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;const bar=document.createElement('div');bar.className='rx-install';bar.innerHTML='<span><b>Instalar Rooblox</b><br><small>Acesse mais rápido pelo celular.</small></span><button>Instalar</button>';bar.querySelector('button').onclick=async()=>{bar.remove();deferred?.prompt();deferred=null};document.body.appendChild(bar)});
 if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});
}
applyTheme();pwa();
let last='';
const run=()=>{const sig=location.hash+'|'+document.querySelectorAll('.card').length+'|'+document.querySelector('.site-header')?.innerText?.slice(0,50);if(sig===last)return;last=sig;cacheProducts();decorate()};
new MutationObserver(()=>queueMicrotask(run)).observe(document.documentElement,{subtree:true,childList:true});
window.addEventListener('hashchange',()=>setTimeout(run,30));
