import { createClient } from '@supabase/supabase-js';

const url = String(import.meta.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '').replace(/\/rest\/v1$/i, '');
const key = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '');
const sb = createClient(url, key);
const id = new URLSearchParams(location.search).get('id');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const brl = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const app = document.querySelector('#app');
let p;
let session;
let accounts = [];

async function init() {
  if (!id) {
    app.innerHTML = '<section class="error-page"><h1>Produto não encontrado</h1><a class="btn" href="/">Voltar à loja</a></section>';
    return;
  }
  const s = await sb.auth.getSession();
  session = s.data.session;
  const r = await sb.from('products').select('id,name,description,price,image_url,category_slug,stock_quantity,delivery_type,active,featured').eq('id', id).eq('active', true).maybeSingle();
  if (r.error || !r.data) {
    app.innerHTML = '<section class="error-page"><h1>Produto não encontrado</h1><a class="btn" href="/">Voltar à loja</a></section>';
    return;
  }
  p = r.data;
  const auto = ['automatic', 'digital'].includes(String(p.delivery_type || '').toLowerCase());
  if (auto && session) {
    const a = await sb.rpc('list_available_product_accounts', { p_product_id: id });
    if (!a.error) accounts = a.data || [];
  }
  render(auto);
}

function render(auto) {
  const stock = auto ? accounts.length : Number(p.stock_quantity || 0);
  const accountHtml = auto ? `
    <div class="delivery"><div class="delivery-head"><div><b>Escolha sua conta</b><small>As credenciais ficam protegidas até o pagamento ser confirmado.</small></div><span>${accounts.length} disponível(is)</span></div>
    ${session ? (accounts.length ? `<div class="accounts">${accounts.map((a, i) => `<label class="account-option"><input type="radio" name="account" value="${esc(a.id)}"><span><b>Conta ${i + 1}</b><small>Disponível • credenciais liberadas após pagamento</small></span></label>`).join('')}</div>` : '<div class="notice">Nenhuma conta disponível no momento.</div>') : '<div class="notice">Entre na sua conta para escolher uma conta disponível.</div>'}</div>` : '';
  app.innerHTML = `<section class="product-page"><a class="back" href="/#/catalogo">← Voltar ao catálogo</a><div class="product-card"><div class="visual">${p.image_url ? `<img src="${esc(p.image_url)}" alt="${esc(p.name)}">` : '<div class="visual-fallback">ROOBLOX</div>'}</div><div class="details"><span class="eyebrow">${esc(p.category_slug || 'PRODUTO')}</span><h1>${esc(p.name)}</h1><p class="desc">${esc(p.description || 'Produto digital para seu jogo favorito.')}</p><div class="price">${brl(p.price)}</div><div class="meta"><span>✓ Compra protegida</span><span>✓ Entrega ${auto ? 'automática' : 'por atendimento'}</span><span>✓ Pedido salvo na conta</span></div>${accountHtml}<div class="buy-row"><input id="qty" type="number" min="1" max="${auto ? 1 : Math.max(1, stock)}" value="1" ${auto ? 'disabled' : ''}><button id="buy" class="btn" ${stock < 1 ? 'disabled' : ''}>${auto ? 'Continuar para checkout' : 'Continuar para atendimento'}</button></div><div id="msg" class="notice hidden"></div></div></div></section>`;
  document.querySelector('#buy')?.addEventListener('click', () => {
    if (!session) { location.href = '/#/login'; return; }
    const q = auto ? 1 : Math.max(1, Math.min(Number(document.querySelector('#qty').value || 1), stock));
    const chosen = auto ? [document.querySelector('input[name="account"]:checked')?.value].filter(Boolean) : [];
    if (auto && chosen.length !== 1) {
      const msg = document.querySelector('#msg');
      msg.textContent = 'Selecione a conta que deseja receber.';
      msg.classList.remove('hidden');
      return;
    }
    let cart = JSON.parse(localStorage.getItem('rooblox_cart') || '[]');
    cart = cart.filter((x) => x.id !== p.id);
    cart.push({ id: p.id, name: p.name, price: Number(p.price), quantity: q, accountIds: chosen });
    localStorage.setItem('rooblox_cart', JSON.stringify(cart));
    location.href = '/checkout.html';
  });
}

init();
