import { createClient } from '@supabase/supabase-js';
import './profile-dashboard.css';

const raw=String(import.meta.env.VITE_SUPABASE_URL||'').trim();
const url=raw.replace(/\/+$/,'').replace(/\/rest\/v1$/i,'');
const key=String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'').trim();
const sb=url&&key?createClient(url,key):null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons={overview:'⌂',orders:'▣',products:'◈',favorites:'♥',rewards:'✦',wallet:'₿',community:'◎',support:'?',notifications:'◉',security:'⌁',settings:'⚙',seller:'◇'};
const sections=[
 ['overview','Visão geral','Dashboard da conta','Resumo, estatísticas e atividade'],
 ['orders','Compras','Pedidos e entregas','Acompanhe suas compras e status'],
 ['products','Produtos adquiridos','Meus produtos','Itens que você comprou'],
 ['favorites','Favoritos e desejos','Salvos','Favoritos e listas de desejos'],
 ['rewards','Recompensas','Points e conquistas','Pontos, nível, badges e benefícios'],
 ['wallet','Carteira','Saldo e transações','Saldo, movimentações e pagamentos'],
 ['community','Comunidade','Social','Seguidores, seguindo, mensagens e bloqueios'],
 ['support','Atendimento','Suporte','Tickets, dúvidas e atendimento'],
 ['notifications','Notificações','Central','Pedidos, pagamentos e avisos'],
 ['security','Segurança','Privacidade e sessões','Dispositivos, sessões e privacidade'],
 ['settings','Configurações','Preferências','Perfil, dados e preferências'],
 ['seller','Vendedor','Marketplace','Produtos, vendas e área de vendedor']
];
let lastHash='';
async function render(){
 if(location.hash!=='#/conta'||!sb)return;
 const app=document.querySelector('#app');
 if(!app)return;
 const {data:{user}}=await sb.auth.getUser();
 if(!user)return;
 const {data:profile}=await sb.from('profiles').select('display_name,username,avatar_url,roblox_username,bio').eq('id',user.id).maybeSingle();
 const [orders,favs,notifs,points]=await Promise.all([
  sb.from('store_orders').select('*',{count:'exact',head:true}).eq('user_id',user.id),
  sb.from('user_favorites').select('*',{count:'exact',head:true}).eq('user_id',user.id),
  sb.from('notifications').select('*',{count:'exact',head:true}).eq('user_id',user.id).is('read_at',null),
  sb.from('store_points_accounts').select('points,level').eq('user_id',user.id).maybeSingle()
 ]);
 const name=profile?.display_name||profile?.username||'Minha conta';
 const active=location.hash;
 app.innerHTML=`<section class="page pd-fallback"><div class="pd-account-head"><div class="pd-avatar">${profile?.avatar_url?`<img src="${esc(profile.avatar_url)}" alt="">`:esc(name.slice(0,1).toUpperCase())}</div><div><span class="eyebrow dark">MINHA CONTA</span><h1>${esc(name)}</h1><p>${esc(user.email||'')} ${profile?.roblox_username?`· Roblox: ${esc(profile.roblox_username)}`:''}</p></div></div><div class="pd-layout"><aside class="pd-nav"><div class="pd-nav-title">Conta</div>${sections.map(([id,title,sub])=>`<button class="pd-nav-item ${id==='overview'?'active':''}" data-section="${id}"><i>${icons[id]}</i><span><b>${title}</b><small>${sub}</small></span></button>`).join('')}<button class="pd-nav-item" id="pd-logout"><i>↪</i><span><b>Sair</b><small>Encerrar sessão</small></span></button></aside><div class="pd-content"><div class="pd-mobile-select"><select id="pd-select">${sections.map(([id,title])=>`<option value="${id}">${title}</option>`).join('')}</select></div><div id="pd-panel"></div></div></div></section>`;
 const panel=document.querySelector('#pd-panel');
 const stat=(label,value)=>`<div class="pd-f-stat"><span>${label}</span><b>${value}</b></div>`;
 const base={overview:`<div class="pd-section-title"><span>VISÃO GERAL</span><h2>Seu espaço no Rooblox</h2><p>Todos os sistemas da sua conta em um só lugar.</p></div><div class="pd-f-stats">${stat('Pedidos',orders.count||0)}${stat('Favoritos',favs.count||0)}${stat('Notificações',notifs.count||0)}${stat('Rooblox Points',Number(points.data?.points||0).toLocaleString('pt-BR'))}</div><div class="pd-f-grid">${sections.slice(1).map(([id,title,sub])=>`<button class="pd-f-card" data-section="${id}"><i>${icons[id]}</i><b>${title}</b><span>${sub}</span><em>›</em></button>`).join('')}</div>`,orders:`<div class="pd-section-title"><span>COMPRAS</span><h2>Meus pedidos</h2><p>Acesse seus pedidos, pagamentos e entregas.</p></div><div class="pd-f-grid"><a class="pd-f-card" href="#/pedidos"><i>▣</i><b>Pedidos</b><span>Histórico e status dos pedidos.</span><em>›</em></a><a class="pd-f-card" href="#/pedidos"><i>📦</i><b>Entregas</b><span>Acompanhe suas entregas digitais.</span><em>›</em></a><a class="pd-f-card" href="/favoritos.html"><i>★</i><b>Avaliações</b><span>Avalie produtos comprados.</span><em>›</em></a></div>`,products:`<div class="pd-section-title"><span>PRODUTOS</span><h2>Produtos adquiridos</h2><p>Seus produtos comprados ficam organizados aqui.</p></div><div class="pd-f-grid"><a class="pd-f-card" href="#/pedidos"><i>◈</i><b>Minha biblioteca</b><span>Produtos vinculados às suas compras.</span><em>›</em></a></div>`,favorites:`<div class="pd-section-title"><span>SALVOS</span><h2>Favoritos e desejos</h2><p>Gerencie os produtos que você quer acompanhar.</p></div><div class="pd-f-grid"><a class="pd-f-card" href="/favoritos.html"><i>♥</i><b>Favoritos</b><span>Produtos salvos.</span><em>›</em></a><a class="pd-f-card" href="/favoritos.html"><i>♡</i><b>Lista de desejos</b><span>Itens para comprar depois.</span><em>›</em></a></div>`,rewards:`<div class="pd-section-title"><span>RECOMPENSAS</span><h2>Points e conquistas</h2><p>Veja seu nível, pontos e benefícios.</p></div><div class="pd-f-grid"><a class="pd-f-card" href="#/recompensas"><i>✦</i><b>Rooblox Points</b><span>${Number(points.data?.points||0).toLocaleString('pt-BR')} pontos · Nível ${points.data?.level||1}</span><em>›</em></a><a class="pd-f-card" href="#/recompensas"><i>🏆</i><b>Badges</b><span>Suas conquistas e emblemas.</span><em>›</em></a></div>`,wallet:`<div class="pd-section-title"><span>CARTEIRA</span><h2>Carteira e pagamentos</h2><p>Gerencie saldo e movimentações.</p></div><div class="pd-f-grid"><a class="pd-f-card" href="#/carteira"><i>₿</i><b>Minha carteira</b><span>Saldo e histórico financeiro.</span><em>›</em></a></div>`,community:`<div class="pd-section-title"><span>COMUNIDADE</span><h2>Área social</h2><p>Gerencie sua presença na comunidade.</p></div><div class="pd-f-grid"><a class="pd-f-card" href="#/perfil"><i>◎</i><b>Perfil público</b><span>Como outros usuários veem você.</span><em>›</em></a><a class="pd-f-card" href="#/mensagens"><i>✉</i><b>Mensagens</b><span>Conversas e comunicação.</span><em>›</em></a><a class="pd-f-card" href="#/privacidade"><i>⌁</i><b>Bloqueios</b><span>Controle usuários bloqueados.</span><em>›</em></a></div>`,support:`<div class="pd-section-title"><span>ATENDIMENTO</span><h2>Central de suporte</h2><p>Precisa de ajuda? Estamos aqui.</p></div><div class="pd-f-grid"><a class="pd-f-card" href="#/suporte"><i>?</i><b>Meus tickets</b><span>Acompanhe seus chamados.</span><em>›</em></a><a class="pd-f-card" href="#/ajuda"><i>▣</i><b>Central de ajuda</b><span>Encontre respostas rápidas.</span><em>›</em></a></div>`,notifications:`<div class="pd-section-title"><span>NOTIFICAÇÕES</span><h2>Central de notificações</h2><p>${notifs.count||0} notificação(ões) não lida(s).</p></div><div class="pd-f-grid"><a class="pd-f-card" href="#/notificacoes"><i>◉</i><b>Todas as notificações</b><span>Pedidos, pagamentos, suporte e novidades.</span><em>›</em></a></div>`,security:`<div class="pd-section-title"><span>SEGURANÇA</span><h2>Segurança e privacidade</h2><p>Controle o acesso e a visibilidade da sua conta.</p></div><div class="pd-f-grid"><a class="pd-f-card" href="#/seguranca"><i>⌁</i><b>Sessões e dispositivos</b><span>Veja onde sua conta está conectada.</span><em>›</em></a><a class="pd-f-card" href="#/privacidade"><i>◉</i><b>Privacidade</b><span>Mensagens, perfil e preferências.</span><em>›</em></a></div>`,settings:`<div class="pd-section-title"><span>CONFIGURAÇÕES</span><h2>Preferências da conta</h2><p>Personalize sua experiência.</p></div><div class="pd-f-grid"><a class="pd-f-card" href="#/configuracoes"><i>⚙</i><b>Dados do perfil</b><span>Nome, username, bio e usuário Roblox.</span><em>›</em></a><a class="pd-f-card" href="#/configuracoes"><i>◐</i><b>Tema</b><span>Claro, escuro ou automático.</span><em>›</em></a></div>`,seller:`<div class="pd-section-title"><span>VENDEDOR</span><h2>Marketplace</h2><p>Venda seus próprios produtos quando habilitado.</p></div><div class="pd-f-grid"><a class="pd-f-card" href="#/vendedor"><i>◇</i><b>Área do vendedor</b><span>Produtos, vendas e pedidos recebidos.</span><em>›</em></a><a class="pd-f-card" href="#/vendedor"><i>+</i><b>Começar a vender</b><span>Consulte os requisitos e solicite acesso.</span><em>›</em></a></div>`};
 const show=id=>{panel.innerHTML=base[id]||base.overview;document.querySelectorAll('.pd-nav-item[data-section]').forEach(b=>b.classList.toggle('active',b.dataset.section===id));const select=document.querySelector('#pd-select');if(select)select.value=id;panel.querySelectorAll('[data-section]').forEach(b=>b.onclick=()=>show(b.dataset.section));};
 document.querySelectorAll('.pd-nav-item[data-section]').forEach(b=>b.onclick=()=>show(b.dataset.section));
 document.querySelector('#pd-select').onchange=e=>show(e.target.value);
 document.querySelector('#pd-logout').onclick=async()=>{await sb.auth.signOut();location.hash='#/login'};
 show('overview');
}
let running=false;const run=()=>{if(running)return;running=true;requestAnimationFrame(async()=>{running=false;if(location.hash!==lastHash){lastHash=location.hash;if(location.hash==='#/conta')await render()}})};
window.addEventListener('hashchange',run);new MutationObserver(run).observe(document.documentElement,{subtree:true,childList:true});run();