import { createClient } from '@supabase/supabase-js';

const url = String(import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '').replace(/\/rest\/v1$/i, '');
const key = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();
const sb = url && key ? createClient(url, key) : null;
const THEME = 'rooblox_theme_v2';

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[c]));

function getTheme() {
  return localStorage.getItem(THEME) || localStorage.getItem('rooblox_theme_v1') || 'system';
}

function applyTheme() {
  const t = getTheme();
  const dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.dataset.themePreference = t;
}

function themeUI() {
  const top = document.querySelector('.site-header .right, .top, .head-right');
  if (!top || document.querySelector('.rx-theme-menu')) return;
  const wrap = document.createElement('div');
  wrap.className = 'rx-theme-menu';
  wrap.innerHTML = '<button type="button" aria-label="Tema">◐ Tema</button><div class="rx-theme-pop"><button data-t="system">Automático</button><button data-t="light">Claro</button><button data-t="dark">Escuro</button></div>';
  top.appendChild(wrap);
  wrap.querySelector('button').addEventListener('click', () => wrap.classList.toggle('open'));
  wrap.querySelectorAll('[data-t]').forEach((button) => button.addEventListener('click', () => {
    const value = button.dataset.t;
    localStorage.setItem(THEME, value);
    localStorage.setItem('rooblox_theme_v1', value === 'system' ? 'light' : value);
    applyTheme();
    wrap.classList.remove('open');
  }));
}

function toast(message) {
  let el = document.querySelector('.rx-toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'rx-toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.remove(), 2800);
}

async function getUser() {
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data?.user || null;
}

async function notificationBell() {
  const user = await getUser();
  if (!user) return;
  const top = document.querySelector('.site-header .right, .top, .head-right');
  if (!top || top.querySelector('[data-rx-notify]')) return;
  const button = document.createElement('a');
  button.href = '#/conta';
  button.className = 'rx-icon-btn';
  button.dataset.rxNotify = '1';
  button.textContent = '♢';
  button.title = 'Notificações';
  top.appendChild(button);
  const { count } = await sb.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).is('read_at', null);
  if (count) button.textContent = `♢ ${count}`;
}

async function syncFavorite(productId, enabled) {
  const user = await getUser();
  if (!user || !productId) return;
  const query = enabled
    ? sb.from('product_favorites').upsert({ user_id: user.id, product_id: productId }, { onConflict: 'user_id,product_id' })
    : sb.from('product_favorites').delete().eq('user_id', user.id).eq('product_id', productId);
  const result = await query;
  if (result.error) toast('Não foi possível sincronizar o favorito.');
}

function enhanceFavorites() {
  document.querySelectorAll('.rx-fav, [data-rx-favorite]').forEach((button) => {
    if (button.dataset.rxBound) return;
    button.dataset.rxBound = '1';
    button.addEventListener('click', () => {
      const id = button.dataset.rxFavorite || button.closest('.card')?.querySelector('a.cover')?.href?.split('/produto/')[1];
      if (id) syncFavorite(decodeURIComponent(id), button.classList.contains('active'));
    });
  });
}

function helpCTA() {
  if (location.hash !== '#/ajuda') return;
  const main = document.querySelector('main');
  if (!main || main.querySelector('.rx-help-grid')) return;
  const section = document.createElement('section');
  section.className = 'rx-help-grid';
  section.innerHTML = '<a class="rx-help-card" href="#/suporte"><b>🎧 Atendimento</b><span>Abra um chamado e converse com nossa equipe.</span></a><a class="rx-help-card" href="#/pedidos"><b>📦 Pedidos</b><span>Consulte status, pagamentos e entregas.</span></a><a class="rx-help-card" href="#/conta"><b>⚙️ Conta</b><span>Perfil, segurança, favoritos e preferências.</span></a>';
  main.appendChild(section);
}

function run() {
  applyTheme();
  themeUI();
  notificationBell();
  helpCTA();
  enhanceFavorites();
}

window.addEventListener('hashchange', () => setTimeout(run, 60));
window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
  if (getTheme() === 'system') applyTheme();
});
new MutationObserver(() => queueMicrotask(run)).observe(document.documentElement, { subtree: true, childList: true });
run();
