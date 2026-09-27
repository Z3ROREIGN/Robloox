import { createClient } from '@supabase/supabase-js';

const raw=String(import.meta.env.VITE_SUPABASE_URL||'').trim();
const url=raw.replace(/\/+$/,'').replace(/\/rest\/v1$/i,'');
const key=String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'').trim();
const sb=url&&key?createClient(url,key):null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const sections=[
 ['overview','🏠','Visão geral','Resumo da sua conta'],
 ['purchases','🛒','Compras','Pedidos e histórico de compras'],
 ['library','📦','Produtos adquiridos','Sua biblioteca digital'],
 ['favorites','❤️','Favoritos e Wishlist','Itens que você salvou'],
 ['rewards','🎁','Recompensas','Points, níveis e conquistas'],
 ['wallet','💰','Carteira','Saldo e movimentações'],
 ['community','👥','Comunidade','Perfil, seguidores e privacidade'],
 ['support','🎧','Atendimento','Tickets e central de ajuda'],
 ['notifications','🔔','Notificações','Avisos e atualizações'],
 ['security','🔐','Segurança','Sessões e proteção da conta'],
 ['settings','⚙️','Configurações','Perfil, tema e preferências'],
 ['seller','🏪','Área de vendedor','Produtos e vendas']
];
let active='overview', data={user:null,profile:null,orders:[],points:0,balance:0,notifications:0,badges:0,seller:0};
function css(){if(document.querySelector('#rx-account-live-css'))return;const s=document.createElement('style');s.id='rx-account-live-css';s.textContent=`
.rx-account{max-width:1180px;margin:0 auto;padding:42px 20px 80px}.rx-account-head{display:flex;justify-content:space-between;gap:20px;align-items:center;margin-bottom:28px}.rx-account-user{display:flex;align-items:center;gap:16px}.rx-account-avatar{width:58px;height:58px;border-radius:18px;display:grid;place-items:center;background:#111;color:#fff;font-size:22px;font-weight:800}.rx-account-user h1{margin:2px 0 4px;font-size:30px}.rx-account-user p{margin:0;color:#777}.rx-account-layout{display:grid;grid-template-columns:260px 1fr;gap:20px}.rx-account-nav{display:flex;flex-direction:column;gap:5px;padding:10px;border:1px solid #e7e7e7;border-radius:18px;background:#fff;align-self:start;position:sticky;top:18px}.rx-account-nav button{border:0;background:transparent;text-align:left;padding:12px;border-radius:12px;cursor:pointer;color:#555;font:inherit}.rx-account-nav button:hover{background:#f5f5f5;color:#111}.rx-account-nav button.active{background:#111;color:#fff}.rx-account-nav strong{display:block;font-size:13px}.rx-account-nav small{display:block;font-size:10px;opacity:.7;margin-top:2px}.rx-account-content{min-width:0}.rx-account-panel{border:1px solid #e7e7e7;border-radius:20px;background:#fff;padding:25px}.rx-account-panel h2{margin:0 0 6px;font-size:25px}.rx-account-panel>p{margin:0 0 22px;color:#777}.rx-account-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}.rx-stat{padding:17px;border:1px solid #e8e8e8;border-radius:15px;background:#fafafa}.rx-stat b{display:block;font-size:22px;margin-top:5px}.rx-stat span{font-size:11px;color:#777}.rx-actions{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.rx-action{display:flex;align-items:center;gap:12px;text-decoration:none;color:#111;padding:15px;border:1px solid #e8e8e8;border-radius:14px}.rx-action:hover{border-color:#bbb;background:#fafafa}.rx-action b{display:block}.rx-action span{display:block;color:#777;font-size:12px;margin-top:3px}.rx-empty{padding:35px;text-align:center;border:1px dashed #ddd;border-radius:15px;color:#777}.rx-mobile-select{display:none;width:100%;padding:12px;border:1px solid #ddd;border-radius:12px;background:#fff;margin-bottom:12px}@media(max-width:760px){.rx-account{padding:25px 14px 70px}.rx-account-head{align-items:flex-start}.rx-account-layout{display:block}.rx-account-nav{display:none}.rx-mobile-select{display:block}.rx-account-stats{grid-template-columns:repeat(2,1fr)}.rx-actions{grid-template-columns:1fr}.rx-account-user h1{font-size:24px}.rx-account-panel{padding:18px}}
`;document.head.append(s)}
async function load(){if(!sb)return;const {data:{user}}=await sb.auth.getUser();data.user=user;if(!user)return;const results=await Promise.allSettled([
 sb.from('profiles').select('*').eq('id',user.id).maybeSingle(),
 sb.from('store_orders').select('id,total_amount,status,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(20),
 sb.from('store_points_accounts').select('balance').eq('user_id',user.id).maybeSingle(),
 sb.from('wallet_accounts').select('balance').eq('user_id',user.id).maybeSingle(),
 sb.from('notifications').select('id',{count:'exact',head:true}).eq('user_id',user.id).is('read_at',null),
 sb.from('store_user_badges').select('id',{count:'exact',head:true}).eq('user_id',user.id),
 sb.from('marketplace_products').select('id',{count:'exact',head:true}).eq('seller_id',user.id)
]);
 data.profile=results[0].status==='fulfilled'?results[0].value.data:null;
 data.orders=results[1].status==='fulfilled'?(results[1].value.data||[]):[];
 data.points=results[2].status==='fulfilled'?Number(results[2].value.data?.balance||0):0;
 data.balance=results[3].status==='fulfilled'?Number(results[3].value.data?.balance||0):0;
 data.notifications=results[4].status==='fulfilled'?Number(results[4].value.count||0):0;
 data.badges=results[5].status==='fulfilled'?Number(results[5].value.count||0):0;
 data.seller=results[6].status==='fulfilled'?Number(results[6].value.count||0):0;
}
function link(h,icon,title,desc){return `<a class="rx-action" href="${h}"><b>${icon}</b><div><b>${title}</b><span>${desc}</span></div></a>`}
function panel(){const p=data.profile||{},name=p.display_name||p.username||data.user?.email?.split('@')[0]||'Minha conta';let title=sections.find(x=>x[0]===active)?.[2]||'Visão geral';let desc=sections.find(x=>x[0]===active)?.[3]||'';let body='';
if(active==='overview')body=`<div class="rx-account-stats"><div class="rx-stat"><span>Pedidos</span><b>${data.orders.length}</b></div><div class="rx-stat"><span>Points</span><b>${data.points}</b></div><div class="rx-stat"><span>Saldo</span><b>${money(data.balance)}</b></div><div class="rx-stat"><span>Notificações</span><b>${data.notifications}</b></div></div><div class="rx-actions">${link('#/pedidos','🛒','Meus pedidos','Acompanhe seus pedidos')}${link('#/recompensas','🎁','Recompensas','Points e conquistas')}${link('/favoritos.html','❤️','Favoritos','Itens salvos')}${link('#/ajuda','🎧','Suporte','Precisa de ajuda?')}</div>`;
if(active==='purchases')body=data.orders.length?`<div class="rx-actions">${data.orders.map(o=>link('#/pedidos','🧾',`Pedido #${String(o.id).slice(0,8)}`,`${esc(o.status||'Processando')} · ${money(o.total_amount)}`)).join('')}</div>`:`<div class="rx-empty">Você ainda não possui pedidos.<br><br><a class="primary" href="#/catalogo">Explorar produtos</a></div>`;
if(active==='library')body=`<div class="rx-empty">Seus produtos digitais adquiridos aparecerão aqui após uma compra aprovada.<br><br><a class="primary" href="#/pedidos">Ver pedidos</a></div>`;
if(active==='favorites')body=`<div class="rx-actions">${link('/favoritos.html','❤️','Favoritos','Gerencie produtos salvos')}${link('/favoritos.html','📝','Wishlist','Sua lista de desejos')}</div>`;
if(active==='rewards')body=`<div class="rx-account-stats"><div class="rx-stat"><span>Points</span><b>${data.points}</b></div><div class="rx-stat"><span>Badges</span><b>${data.badges}</b></div></div><div class="rx-actions">${link('#/recompensas','🎁','Central de recompensas','Campanhas e solicitações')}${link('/indicacoes.html','🤝','Indicações','Convide amigos e acompanhe')}</div>`;
if(active==='wallet')body=`<div class="rx-account-stats"><div class="rx-stat"><span>Saldo disponível</span><b>${money(data.balance)}</b></div></div><div class="rx-actions">${link('#/carteira','💰','Minha carteira','Saldo e movimentações')}</div>`;
if(active==='community')body=`<div class="rx-actions">${link('#/perfil','👤','Meu perfil público','Veja sua presença na comunidade')}${link('#/privacidade','🔒','Privacidade','Controle sua visibilidade')}${link('#/mensagens','💬','Mensagens','Suas conversas')}</div>`;
if(active==='support')body=`<div class="rx-actions">${link('#/suporte','🎧','Meus atendimentos','Acompanhe seus tickets')}${link('#/ajuda','❓','Central de ajuda','FAQ e orientações')}</div>`;
if(active==='notifications')body=`<div class="rx-actions">${link('#/notificacoes','🔔',`${data.notifications} não lida(s)`,'Abrir central de notificações')}</div>`;
if(active==='security')body=`<div class="rx-actions">${link('#/seguranca','🔐','Segurança da conta','Sessões e proteção')}${link('#/privacidade','🛡️','Privacidade','Preferências de privacidade')}</div>`;
if(active==='settings')body=`<div class="rx-actions">${link('#/configuracoes','⚙️','Configurações','Dados pessoais e preferências')}${link('#/tema','🌙','Tema','Claro, escuro ou automático')}</div>`;
if(active==='seller')body=`<div class="rx-account-stats"><div class="rx-stat"><span>Produtos publicados</span><b>${data.seller}</b></div></div><div class="rx-actions">${link('/marketplace.html','🏪','Painel do vendedor','Gerencie seus produtos')}${link('/marketplace.html','📦','Produtos e vendas','Acompanhe sua operação')}</div>`;
return `<div class="rx-account-panel"><h2>${title}</h2><p>${desc}</p>${body}</div>`}
function render(){if(location.hash!=='#/conta')return;css();const root=document.querySelector('#app');if(!root)return;root.innerHTML=`<section class="rx-account"><div class="rx-account-head"><div class="rx-account-user"><div class="rx-account-avatar">${esc((data.profile?.display_name||data.profile?.username||data.user?.email||'R')[0].toUpperCase())}</div><div><small>MINHA CONTA</small><h1>${esc(data.profile?.display_name||data.profile?.username||'Minha conta')}</h1><p>${esc(data.user?.email||'')}</p></div></div></div><div class="rx-account-layout"><nav class="rx-account-nav">${sections.map(x=>`<button class="${x[0]===active?'active':''}" data-rx-section="${x[0]}">${x[1]} <strong>${x[2]}</strong><small>${x[3]}</small></button>`).join('')}</nav><select class="rx-mobile-select" id="rx-section-select">${sections.map(x=>`<option value="${x[0]}" ${x[0]===active?'selected':''}>${x[1]} ${x[2]}</option>`).join('')}</select><div class="rx-account-content">${panel()}</div></div></section>`;root.querySelectorAll('[data-rx-section]').forEach(b=>b.onclick=()=>{active=b.dataset.rxSection;render()});root.querySelector('#rx-section-select')?.addEventListener('change',e=>{active=e.target.value;render()})}
let loading=false,lastHash='';
async function run(){if(location.hash!=='#/conta'){lastHash=location.hash;return}if(loading)return;loading=true;try{await load();render()}finally{loading=false}}
window.addEventListener('hashchange',()=>setTimeout(run,0));
new MutationObserver(()=>{if(location.hash==='#/conta'&&!document.querySelector('.rx-account'))setTimeout(run,0)}).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
run();