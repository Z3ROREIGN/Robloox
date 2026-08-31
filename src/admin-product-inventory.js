import { createClient } from '@supabase/supabase-js';

const url = String(import.meta.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '').replace(/\/rest\/v1$/i, '');
const key = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();
if (!url || !key) throw new Error('Supabase não configurado.');
const sb = createClient(url, key);
const ADMIN = 'willianwca2011@gmail.com';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

function addInventoryField(form) {
  if (form.querySelector('[data-inline-accounts]')) return;
  const delivery = form.querySelector('[name="delivery_type"]');
  if (!delivery) return;
  const wrap = document.createElement('label');
  wrap.setAttribute('data-inline-accounts', '1');
  wrap.innerHTML = 'Estoque inicial de contas <textarea name="inline_accounts" maxlength="50000" placeholder="conta1:senha1\nconta2:senha2\nconta3:senha3"></textarea><small style="display:block;color:#6b7280;margin-top:6px;font-weight:500">Disponível somente para entrega Digital. Uma conta por linha no formato nome:senha. Você também poderá repor o estoque depois em <b>Estoque de contas</b>.</small>';
  const status = form.querySelector('[name="active"]')?.closest('label');
  (status?.parentElement || form).insertBefore(wrap, status || form.querySelector('.actions'));
  const toggle = () => {
    const digital = delivery.value === 'digital';
    wrap.style.display = digital ? 'block' : 'none';
    const ta = wrap.querySelector('textarea');
    ta.disabled = !digital;
    if (!digital) ta.value = '';
  };
  delivery.addEventListener('change', toggle);
  toggle();
}

function parseAccounts(raw) {
  const lines = String(raw || '').split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  const result = [];
  for (const line of lines) {
    const i = line.indexOf(':');
    if (i <= 0 || i >= line.length - 1) throw new Error(`Conta inválida: ${line}. Use nome:senha.`);
    const login = line.slice(0, i).trim();
    const password = line.slice(i + 1).trim();
    if (!login || !password) throw new Error(`Conta inválida: ${line}.`);
    result.push({ login, password });
  }
  return result;
}

async function isAdmin() {
  const { data } = await sb.auth.getSession();
  return String(data.session?.user?.email || '').toLowerCase() === ADMIN;
}

async function handleSubmit(e, form) {
  const delivery = form.querySelector('[name="delivery_type"]')?.value;
  const textarea = form.querySelector('[name="inline_accounts"]');
  if (delivery !== 'digital' || !textarea || !textarea.value.trim()) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  if (!(await isAdmin())) return alert('Acesso negado.');
  const get = (name) => form.querySelector(`[name="${name}"]`)?.value ?? '';
  let accounts;
  try { accounts = parseAccounts(textarea.value); } catch (err) { alert(err.message); return; }
  const stock = Number(get('stock_quantity') || 0);
  if (stock !== accounts.length) {
    if (!confirm(`Você informou ${accounts.length} conta(s), mas o estoque inicial está ${stock}. Deseja usar ${accounts.length} como estoque inicial?`)) return;
  }
  const data = {
    name: String(get('name')).trim(), description: String(get('description')).trim(), price: Number(get('price')),
    stock_quantity: accounts.length, method: String(get('method') || 'digital').trim(), robux: Number(get('robux') || 0),
    category_slug: get('category_slug') || null, image_url: String(get('image_url')).trim() || null,
    delivery_type: 'digital', active: form.querySelector('[name="active"]')?.value === 'true',
    featured: form.querySelector('[name="featured"]')?.checked === true
  };
  if (!data.name || !Number.isFinite(data.price) || data.price < 0) { alert('Confira nome e preço.'); return; }
  const btn = form.querySelector('button[type="submit"], .primary');
  if (btn) { btn.disabled = true; btn.textContent = 'Criando produto e estoque…'; }
  const { data: product, error: pe } = await sb.from('products').insert(data).select('id').single();
  if (pe) { if (btn) { btn.disabled=false; btn.textContent='Salvar produto'; } alert(pe.message); return; }
  const payload = accounts.map(a => ({ product_id: product.id, login: a.login, password: a.password, extra: null }));
  const { error: ae } = await sb.from('product_accounts').insert(payload);
  if (ae) {
    await sb.from('products').delete().eq('id', product.id);
    if (btn) { btn.disabled=false; btn.textContent='Salvar produto'; }
    alert(`Produto não foi criado porque o estoque não pôde ser salvo: ${ae.message}`); return;
  }
  location.reload();
}

const observer = new MutationObserver(() => {
  const form = document.querySelector('#product-form');
  if (form) {
    addInventoryField(form);
    if (!form.dataset.inventoryBound) {
      form.dataset.inventoryBound = '1';
      form.addEventListener('submit', e => handleSubmit(e, form), true);
    }
  }
});
observer.observe(document.body, { childList: true, subtree: true });