import { createClient } from '@supabase/supabase-js';

const url = String(import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '').replace(/\/rest\/v1$/i, '');
const key = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();
const sb = url && key ? createClient(url, key) : null;
const THEME = 'rooblox_theme_v2';

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

function theme() {
  return localStorage.getItem(THEME) || localStorage.getItem('rooblox_theme_v1') || 'system';
}

function applyTheme() {
  const t = theme();
  const dark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.documentElement.dataset.themePreference = t;
}

function themeUI() {
  const top = document.querySelector('.site-header .right,.top,.head-right');
  if (!top || document.querySelector('.rx-theme-menu')) return;
  const wrap = document.createElement('div');
  wrap.className = 'rx-theme-menu';
  wrap.innerHTML = '<button type="button" aria-label="Tema">◐ Tema</button><div class="rx-theme-pop"><button data-t="system">Automático</button><button data-t="light">Claro</button><button data-t="dark">Escuro</button></div>';
  top.appendChild(wrap);
  wrap.querySelector('button').onclick = () => wrap.classList.toggle('open');
  wrap.querySelectorAll('[data-t]').forEach((button) => {
    button.onclick = () => {
      localStorage.setItem(THEME, button.dataset.t);
      applyTheme();
      wrap.classList.remove('open');
    };
  });
}

function toast(message) {
  let node = document.querySelector('.rx-toast');
  if (!node) {
    node = document.createElement('div');
    node.className = 'rx-toast';
    document.body.appendChild(node);
  }
  node.textContent = message;
  clearTimeout(node._timer);
  node._timer = setTimeout(() => node.remove(), 2800);
}

async function getUser() {
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data?.user || null;
}

async function notificationBell() {
  if (!sb) return;
  const user = await getUser();
  if (!user) return;
  const top = document.querySelector('.site-header .right,.top,.head-right');
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
  document.querySelectorAll('.rx-fav,[data-rx-favorite]').forEach((button) => {
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

async function supportPage() {
  if (location.hash !== '#/suporte' || !sb) return;
  const user = await getUser();
  const app = document.querySelector('#app');
  if (!app || !user) return;

  let tickets = [];

  async function loadTickets() {
    const result = await sb.from('support_tickets').select('id,subject,category,status,priority,created_at,updated_at').eq('user_id', user.id).order('updated_at', { ascending: false });
    tickets = result.data || [];
    render();
  }

  function render() {
    app.innerHTML = `<section class="rx-support-shell"><div class="page-head"><div><span class="eyebrow dark">ATENDIMENTO</span><h1>Central de suporte</h1><p>Abra chamados, acompanhe respostas e resolva problemas em um único lugar.</p></div><button class="primary" id="new-ticket">Novo atendimento</button></div><div class="rx-ticket-layout"><div class="rx-ticket-list">${tickets.length ? tickets.map((ticket) => `<button class="rx-ticket" data-ticket="${esc(ticket.id)}"><b>${esc(ticket.subject)}</b><small>${esc(ticket.category)} · ${esc(ticket.status)}</small></button>`).join('') : '<div class="rx-empty-state">Você ainda não abriu chamados.</div>'}</div><div id="ticket-area" class="rx-chat-box"><div class="rx-empty-state">Selecione um atendimento para visualizar a conversa.</div></div></div></section>`;
    document.querySelector('#new-ticket')?.addEventListener('click', newTicket);
    document.querySelectorAll('[data-ticket]').forEach((button) => button.addEventListener('click', () => openTicket(button.dataset.ticket)));
  }

  function newTicket() {
    const area = app.querySelector('#ticket-area');
    if (!area) return;
    area.innerHTML = '<form class="rx-empty-state" id="ticket-form"><input name="subject" required maxlength="120" placeholder="Assunto" style="width:min(520px,100%);padding:12px;border:1px solid var(--rx-line);border-radius:10px"><select name="category" style="width:min(520px,100%);padding:12px;margin:8px;border:1px solid var(--rx-line);border-radius:10px"><option>compras</option><option>pagamentos</option><option>entrega</option><option>conta</option><option>outros</option></select><button class="primary">Criar atendimento</button></form>';
    document.querySelector('#ticket-form')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const result = await sb.from('support_tickets').insert({ user_id: user.id, subject: String(form.get('subject') || '').trim(), category: form.get('category') }).select('id').single();
      if (result.error) return toast(result.error.message);
      await loadTickets();
      openTicket(result.data.id);
    });
  }

  async function openTicket(id) {
    const ticket = tickets.find((item) => String(item.id) === String(id));
    if (!ticket) return;
    const area = document.querySelector('#ticket-area');
    if (!area) return;
    area.innerHTML = `<div class="rx-chat-head"><b>${esc(ticket.subject)}</b><span class="rx-badge">${esc(ticket.status)}</span></div><div id="rx-msgs" class="rx-chat-messages"><div class="rx-empty-state">Carregando…</div></div><form id="rx-compose" class="rx-chat-compose"><input name="body" maxlength="2000" required placeholder="Escreva uma mensagem..."><button>Enviar</button></form>`;

    async function loadMessages() {
      const result = await sb.from('support_messages').select('id,sender_id,body,created_at').eq('ticket_id', id).order('created_at');
      const box = document.querySelector('#rx-msgs');
      if (!box) return;
      box.innerHTML = (result.data || []).map((message) => `<div class="rx-msg ${message.sender_id === user.id ? 'mine' : ''}"><span>${esc(message.body)}</span><small>${new Date(message.created_at).toLocaleString('pt-BR')}</small></div>`).join('') || '<div class="rx-empty-state">Nenhuma mensagem ainda.</div>';
      box.scrollTop = box.scrollHeight;
    }

    await loadMessages();
    document.querySelector('#rx-compose')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const body = String(form.get('body') || '').trim();
      if (!body) return;
      const result = await sb.from('support_messages').insert({ ticket_id: id, sender_id: user.id, body });
      if (result.error) return toast(result.error.message);
      event.currentTarget.reset();
      await loadMessages();
    });
  }

  await loadTickets();
}

async function run() {
  applyTheme();
  themeUI();
  await notificationBell();
  helpCTA();
  await supportPage();
  enhanceFavorites();
}

matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
  if (theme() === 'system') applyTheme();
});
window.addEventListener('hashchange', () => setTimeout(() => run().catch(console.error), 60));
new MutationObserver(() => queueMicrotask(() => run().catch(console.error))).observe(document.documentElement, { subtree: true, childList: true });
run().catch(console.error);
