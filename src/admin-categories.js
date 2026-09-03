import { createClient } from '@supabase/supabase-js';
import './admin-categories.css';

const raw = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
const url = raw.replace(/\/+$/, '').replace(/\/rest\/v1$/i, '');
const key = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();
const sb = url && key ? createClient(url, key) : null;
const OWNER = 'willianwca2011@gmail.com';
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let cats = [];

async function load() {
  if (!sb) return;
  const { data, error } = await sb.from('store_categories').select('*').order('sort_order', { ascending: true });
  if (error) return showError(error.message);
  cats = data || [];
  render();
}
function showError(text) {
  const p = document.querySelector('#categories-enhanced-panel');
  if (p) p.innerHTML = `<div class="cat-error">Não foi possível carregar as categorias.<small>${esc(text)}</small></div>`;
}
function render() {
  const host = document.querySelector('#categories-enhanced-panel');
  if (!host) return;
  const active = cats.filter(c => c.active !== false).length;
  const inactive = cats.length - active;
  host.innerHTML = `<div class="cat-hero"><div><span class="cat-kicker">CATÁLOGO DA LOJA</span><h2>Organize seus jogos</h2><p>Categorias são as seções que agrupam os produtos na loja. Ex.: <b>Blox Fruits</b>, <b>Murder Mystery 2</b> e <b>Roube um Brainrot</b>.</p></div><div class="cat-hero-icon">⌘</div></div>
  <div class="cat-stats"><div><small>Total</small><strong>${cats.length}</strong><span>Categorias criadas</span></div><div><small>Visíveis</small><strong>${active}</strong><span>Aparecem na loja</span></div><div><small>Ocultas</small><strong>${inactive}</strong><span>Não aparecem para clientes</span></div></div>
  <div class="cat-toolbar"><div><h3>Suas categorias</h3><p>Use os controles para ativar ou ocultar uma categoria.</p></div><button id="cat-new">+ Nova categoria</button></div>
  <div class="cat-grid">${cats.map(card).join('') || `<div class="cat-empty"><strong>Nenhuma categoria cadastrada</strong><span>Crie sua primeira categoria para começar a organizar os produtos.</span></div>`}</div>`;
  host.querySelector('#cat-new').onclick = () => edit();
  host.querySelectorAll('[data-cat-edit]').forEach(b => b.onclick = () => edit(b.dataset.catEdit));
  host.querySelectorAll('[data-cat-toggle]').forEach(b => b.onclick = () => toggle(b.dataset.catToggle));
}
function card(c) {
  const on = c.active !== false;
  return `<article class="cat-card"><div class="cat-card-top"><div class="cat-symbol">${esc(String(c.name || '?').trim().charAt(0).toUpperCase())}</div><span class="cat-state ${on?'on':'off'}">${on?'Visível':'Oculta'}</span></div><h4>${esc(c.name)}</h4><code>${esc(c.slug)}</code><p>${on?'Produtos desta categoria podem ser exibidos e encontrados na loja.':'A categoria está oculta e não deve ser apresentada aos clientes.'}</p><div class="cat-actions"><button data-cat-edit="${esc(c.id)}">Editar</button><button data-cat-toggle="${esc(c.id)}">${on?'Ocultar':'Mostrar'}</button></div></article>`;
}
async function edit(id) {
  const c = cats.find(x => String(x.id) === String(id)) || {};
  const name = prompt('Nome da categoria:', c.name || '');
  if (name === null) return;
  const clean = name.trim();
  if (!clean) return alert('Informe um nome.');
  const slug = (c.slug || clean.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')).trim();
  const sort = Number.isFinite(Number(c.sort_order)) ? Number(c.sort_order) : cats.length;
  const payload = { name: clean, slug, sort_order: sort, active: c.active !== false, updated_at: new Date().toISOString() };
  let res;
  if (id) res = await sb.from('store_categories').update(payload).eq('id', id);
  else res = await sb.from('store_categories').insert(payload);
  if (res.error) return alert(res.error.message);
  await load();
}
async function toggle(id) {
  const c = cats.find(x => String(x.id) === String(id));
  if (!c) return;
  const { error } = await sb.from('store_categories').update({ active: c.active === false, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) return alert(error.message);
  await load();
}
function enhance() {
  const nav = document.querySelector('.nav[data-tab="categories"]');
  if (!nav) return;
  document.addEventListener('click', (e) => {
    const b = e.target.closest?.('.nav[data-tab="categories"]');
    if (!b) return;
    setTimeout(() => {
      const content = document.querySelector('.content');
      if (!content) return;
      let panel = document.querySelector('#categories-enhanced-panel');
      if (!panel) {
        panel = document.createElement('div'); panel.id = 'categories-enhanced-panel';
        const simple = content.querySelector('.simple');
        if (simple) simple.replaceWith(panel); else content.appendChild(panel);
      }
      load();
    }, 0);
  }, true);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhance); else enhance();
