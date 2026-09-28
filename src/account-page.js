import { createClient } from '@supabase/supabase-js';
import './style.css';
import './rooblox-black-premium.css';

const url=String(import.meta.env.VITE_SUPABASE_URL||'').trim().replace(/\/+$/,'').replace(/\/rest\/v1$/i,'');
const key=String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'').trim();
const sb=url&&key?createClient(url,key):null;
const icons={home:'⌂',cart:'🛒',box:'▣',heart:'♡',gift:'◇',wallet:'◈',users:'♧',support:'?',bell:'◌',lock:'◇',settings:'⚙',seller:'△'};
const sections=[
 ['home','Visão geral','Seu resumo, atalhos e atividade.'],['cart','Compras','Histórico e acompanhamento de compras.'],['box','Produtos adquiridos','Acesse seus produtos e entregas.'],['heart','Favoritos e Wishlist','Itens salvos para comprar depois.'],['gift','Recompensas','Campanhas, bônus e benefícios.'],['wallet','Carteira','Créditos e movimentações da conta.'],['users','Comunidade','Perfil e recursos da comunidade.'],['support','Atendimento','Abra e acompanhe solicitações.'],['bell','Notificações','Avisos importantes da sua conta.'],['lock','Segurança','Proteja sua conta e sessão.'],['settings','Configurações','Preferências da sua conta.'],['seller','Área de vendedor','Produtos, pedidos e ferramentas de venda.']
];
const svg=(d)=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
const icon={home:svg('M4 11 12 4l8 7v8H4z'),cart:svg('M3 4h2l2 11h10l3-8H6'),box:svg('m4 7 8-4 8 4v10l-8 4-8-4V7Z'),heart:svg('M20 8.5C20 14 12 20 12 20S4 14 4 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8 2.5Z'),gift:svg('M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-4 0-5-2-3-4 2-1 3 2 3 4Zm0 0c4 0 5-2 3-4-2-1-3 2-3 4Z'),wallet:svg('M4 7h15v12H4zM4 10h16v4h-5a2 2 0 0 1 0-4h5M7 5h9'),users:svg('M16 20c0-3-2-5-5-5s-5 2-5 5M11 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6M17 11a2.5 2.5 0 1 0 0-5M19 20c0-2-1-3.5-3-4'),support:svg('M4 13v-1a8 8 0 0 1 16 0v1M4 13h3v5H5a1 1 0 0 1-1-1v-4ZM20 13h-3v5h2a1 1 0 0 0 1-1v-4Z'),bell:svg('M6 17h12l-1.5-2v-4a4.5 4.5 0 0 0-9 0v4L6 17ZM10 20h4'),lock:svg('M6 10h12v10H6zM8 10V7a4 4 0 0 1 8 0v3'),settings:svg('M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1'),seller:svg('M5 20V8l7-4 7 4v12M9 20v-5h6v5M8 9h.01M12 9h.01M16 9h.01')};
const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
function card([id,title,desc],i){return `<a class="account-tile" href="#${id}" data-section="${id}"><span class="account-icon">${icon[id]}</span><span class="account-copy"><strong>${title}</strong><small>${desc}</small></span><span class="account-arrow">→</span><i>${String(i+1).padStart(2,'0')}</i></a>`}
async function start(){
 document.body.innerHTML=`<header class="site-header"><div class="nav"><a class="brand" href="/"><img class="logo" src="/logo.svg" alt="Rooblox"></a><nav><a href="/">Início</a><a href="/#/catalogo">Produtos</a><a href="/#/ajuda">Ajuda</a></nav><div class="right"><a class="ghost" href="/">Voltar à loja</a></div></div></header><main class="account-page"><div id="account-loading" class="account-loading"><span></span><b>Carregando sua conta...</b></div><div id="account-root" hidden></div></main>`;
 if(!sb){location.href='/#\/login';return}
 const {data:{session}}=await sb.auth.getSession();
 if(!session){location.href='/#\/login';return}
 let profile=null;try{profile=(await sb.from('profiles').select('*').eq('id',session.user.id).maybeSingle()).data||null}catch{}
 const name=profile?.display_name||profile?.username||session.user.email?.split('@')[0]||'Usuário';
 const root=document.getElementById('account-root');
 root.innerHTML=`<section class="account-hero"><div class="account-avatar">${esc(name.slice(0,1).toUpperCase())}</div><div><span class="eyebrow">ÁREA DO CLIENTE</span><h1>Olá, ${esc(name)}.</h1><p>${esc(session.user.email||'')} · Tudo o que você precisa em um só lugar.</p></div><button id="logout" class="account-logout">Sair da conta</button></section><section class="account-section-head"><div><span class="eyebrow">CENTRAL DA CONTA</span><h2>O que você deseja fazer?</h2><p>Acesse rapidamente cada área da sua conta.</p></div><span class="account-count">12 áreas</span></section><div class="account-tiles">${sections.map(card).join('')}</div><section class="account-bottom"><div><span class="eyebrow">PRECISA DE AJUDA?</span><h3>Fale com nosso suporte</h3><p>Abra uma solicitação e acompanhe o atendimento.</p></div><a class="primary" href="/#/ajuda">Abrir central de ajuda →</a></section>`;
 document.getElementById('account-loading').remove();root.hidden=false;
 document.getElementById('logout').onclick=async()=>{await sb.auth.signOut();location.href='/'};
 root.querySelectorAll('[data-section]').forEach(a=>a.addEventListener('click',e=>{const s=a.dataset.section;if(s==='home')return; e.preventDefault();sessionStorage.setItem('rooblox_account_section',s);location.href='/'}));
}
start();
