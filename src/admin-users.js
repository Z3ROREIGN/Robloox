import { createClient } from '@supabase/supabase-js';
import { icons } from './icons.js';
import './admin-users.css';

const rawUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
const url = rawUrl.replace(/\/+$/, '').replace(/\/rest\/v1$/i, '');
const key = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();
const sb = url && key ? createClient(url, key) : null;
const OWNER_EMAIL = 'willianwca2011@gmail.com';
const app = document.querySelector('#admin-app');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
let users = [];
let roles = new Map();
let filter = '';

function msg(error) {
  return error?.message || error?.error_description || 'Não foi possível concluir a ação.';
}

function shell(body) {
  return `<header><a class="brand" href="/"><img src="/logo.svg" alt="Rooblox"></a><div class="head-right"><a href="/">Ver loja</a><button id="signout-users">Sair</button></div></header><main>${body}</main>`;
}

function roleFor(id) {
  return roles.get(id) || 'USUÁRIO';
}

function statusMeta(status) {
  const s = String(status || 'ACTIVE').toUpperCase();
  if (s === 'BANNED') return { label:'Banido', cls:'is-banned' };
  if (s === 'SUSPENDED') return { label:'Suspenso', cls:'is-suspended' };
  return { label:'Ativo', cls:'is-active' };
}

function userCard(u) {
  const email = String(u.email || '').toLowerCase();
  const owner = email === OWNER_EMAIL;
  const role = roleFor(u.id);
  const status = statusMeta(u.account_status);
  const name = u.display_name || u.username || u.roblox_username || 'Usuário';
  const initial = String(name).trim().charAt(0).toUpperCase() || 'U';
  const secondary = u.username ? `@${u.username}` : (u.roblox_username ? `Roblox: ${u.roblox_username}` : 'Sem nome de usuário');
  const date = u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '—';
  const support = role === 'SUPORTE';
  const actions = owner
    ? `<span class="user-protected">${icons.shield || '🛡️'} Conta protegida</span>`
    : `<div class="user-actions">
        ${status.label === 'Suspenso' ? `<button class="user-btn user-btn-safe" data-action="unsuspend" data-id="${esc(u.id)}">Reativar</button>` : ''}
        ${status.label === 'Banido' ? `<button class="user-btn user-btn-safe" data-action="unban" data-id="${esc(u.id)}">Desbanir</button>` : ''}
        ${status.label === 'Ativo' ? `<button class="user-btn user-btn-warning" data-action="suspend" data-id="${esc(u.id)}">Suspender</button><button class="user-btn user-btn-danger" data-action="ban" data-id="${esc(u.id)}">Banir</button>` : ''}
        ${support ? `<button class="user-btn user-btn-neutral" data-action="remove-support" data-id="${esc(u.id)}">Remover suporte</button>` : `<button class="user-btn user-btn-support" data-action="add-support" data-id="${esc(u.id)}">Tornar suporte</button>`}
      </div>`;
  return `<article class="user-card ${owner ? 'is-owner' : ''}">
    <div class="user-main">
      <div class="user-avatar">${u.avatar_url ? `<img src="${esc(u.avatar_url)}" alt="">` : esc(initial)}</div>
      <div class="user-info"><div class="user-name-row"><strong>${esc(name)}</strong>${owner ? '<span class="owner-badge">LÍDER</span>' : ''}</div><span>${esc(email)}</span><small>${esc(secondary)} · membro desde ${esc(date)}</small></div>
    </div>
    <div class="user-meta"><span class="role-badge ${support ? 'role-support' : ''}">${esc(owner ? 'LÍDER' : role)}</span><span class="status-badge ${status.cls}">${status.label}</span>${u.suspended_until ? `<small>até ${new Date(u.suspended_until).toLocaleString('pt-BR')}</small>` : ''}</div>
    ${u.moderation_reason ? `<div class="user-reason">${icons.info || 'ⓘ'} ${esc(u.moderation_reason)}</div>` : ''}
    ${actions}
  </article>`;
}

function render() {
  if (!app) return;
  const q = filter.trim().toLocaleLowerCase('pt-BR');
  const visible = users.filter(u => `${u.email || ''} ${u.username || ''} ${u.display_name || ''} ${u.roblox_username || ''}`.toLocaleLowerCase('pt-BR').includes(q));
  const active = users.filter(u => String(u.account_status || 'ACTIVE').toUpperCase() === 'ACTIVE').length;
  const suspended = users.filter(u => String(u.account_status || '').toUpperCase() === 'SUSPENDED').length;
  const banned = users.filter(u => String(u.account_status || '').toUpperCase() === 'BANNED').length;
  const support = users.filter(u => roleFor(u.id) === 'SUPORTE').length;
  app.innerHTML = shell(`<div class="admin-shell"><aside><div class="admin-title">${icons.grid}<span>Administração</span></div><button class="nav" data-users-nav="dashboard">${icons.grid}<span>Visão geral</span></button><button class="nav" data-users-nav="products">${icons.box}<span>Produtos</span></button><button class="nav" data-users-nav="categories">${icons.game}<span>Categorias</span></button><button class="nav" data-users-nav="orders">${icons.orders}<span>Pedidos</span></button><button class="nav active">${icons.user}<span>Usuários</span></button><button class="nav" data-users-nav="rewards">${icons.gift || icons.box}<span>Recompensas</span></button></aside><section class="content users-content">
    <div class="users-hero"><div><small>ADMIN / CONTAS</small><h1>Gestão de usuários</h1><p>Pesquise membros, acompanhe o estado das contas e gerencie o suporte com segurança.</p></div><div class="users-hero-icon">${icons.user}</div></div>
    <div class="user-stats"><article><span>Total de membros</span><b>${users.length}</b><small>Contas cadastradas</small></article><article><span>Ativos</span><b>${active}</b><small>Contas liberadas</small></article><article><span>Suporte</span><b>${support}</b><small>Equipe de atendimento</small></article><article><span>Moderados</span><b>${suspended + banned}</b><small>${suspended} suspenso(s) · ${banned} banido(s)</small></article></div>
    <div class="section-card users-panel"><div class="section-head"><div><h2>Membros da plataforma</h2><p>${visible.length} resultado(s) encontrado(s).</p></div><button class="secondary" id="refresh-users">Atualizar</button></div>
      <label class="admin-search users-search">${icons.search}<input id="users-search" type="search" placeholder="Pesquisar por nome, @usuário ou e-mail..." autocomplete="off" spellcheck="false" value="${esc(filter)}"></label>
      <div class="users-notice">${icons.shield || '🛡️'} <div><strong>Proteção do líder ativa</strong><span>A conta do administrador principal não pode ser suspensa, banida, rebaixada ou administrada por outros usuários.</span></div></div>
      <div class="users-list">${visible.map(userCard).join('') || `<div class="users-empty">${icons.search}<strong>Nenhum membro encontrado</strong><span>Tente outro nome, usuário ou e-mail.</span></div>`}</div>
    </div>
  </section></div>`);
  document.querySelector('#signout-users').onclick = async () => { await sb.auth.signOut(); location.reload(); };
  document.querySelector('#users-search').oninput = (e) => { filter = e.currentTarget.value; render(); const el = document.querySelector('#users-search'); el.focus(); el.setSelectionRange(filter.length, filter.length); };
  document.querySelector('#refresh-users').onclick = loadUsers;
  document.querySelectorAll('[data-action]').forEach(b => b.onclick = () => handleAction(b.dataset.action, b.dataset.id));
  document.querySelectorAll('[data-users-nav]').forEach(b => b.onclick = () => { const target = b.dataset.usersNav; const original = document.querySelector(`.nav[data-tab="${target}"]`); if (original) original.click(); });
}

async function loadUsers() {
  if (!sb) return;
  const [{ data, error }, { data: roleData, error: roleError }] = await Promise.all([
    sb.from('profiles').select('id,email,username,display_name,roblox_username,avatar_url,created_at,account_status,suspended_until,moderation_reason').order('created_at', { ascending:false }),
    sb.from('admin_roles').select('user_id,role')
  ]);
  if (error) return alert(msg(error));
  if (roleError) return alert(msg(roleError));
  users = data || [];
  roles = new Map((roleData || []).map(r => [r.user_id, String(r.role || '').toUpperCase()]));
  render();
}

async function handleAction(action, id) {
  const target = users.find(u => u.id === id);
  if (!target || String(target.email || '').toLowerCase() === OWNER_EMAIL) return alert('Esta conta é protegida e não pode ser administrada.');
  let reason = null;
  let until = null;
  if (action === 'suspend') {
    reason = prompt('Motivo da suspensão (opcional):', '') || null;
    const days = prompt('Duração em dias. Use 0 para suspensão sem prazo:', '7');
    if (days === null) return;
    const n = Number(days);
    if (!Number.isFinite(n) || n < 0) return alert('Duração inválida.');
    until = n === 0 ? null : new Date(Date.now() + n * 86400000).toISOString();
  } else if (action === 'ban') {
    if (!confirm(`Banir ${target.display_name || target.username || target.email}? Esta ação bloqueia a conta até um desbanimento administrativo.`)) return;
    reason = prompt('Motivo do banimento (opcional):', '') || null;
  } else if (action === 'add-support') {
    if (!confirm(`Dar acesso de SUPORTE para ${target.display_name || target.username || target.email}?`)) return;
  } else if (action === 'remove-support') {
    if (!confirm(`Remover o cargo de SUPORTE de ${target.display_name || target.username || target.email}?`)) return;
  } else if (action === 'unsuspend' || action === 'unban') {
    if (!confirm('Confirmar reativação desta conta?')) return;
  }
  const { data, error } = await sb.rpc('admin_manage_user', { p_target_user_id:id, p_action:action === 'add-support' ? 'ADD_SUPPORT' : action === 'remove-support' ? 'REMOVE_SUPPORT' : action.toUpperCase(), p_reason:reason, p_until_at:until });
  if (error) return alert(msg(error));
  if (!data?.ok) return alert('Ação recusada.');
  await loadUsers();
}

document.addEventListener('click', (event) => {
  const nav = event.target.closest?.('.nav[data-tab="users"]');
  if (!nav) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  loadUsers();
}, true);
