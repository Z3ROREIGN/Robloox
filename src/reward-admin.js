import { createClient } from '@supabase/supabase-js';
import './rewards.css';

const ADMIN_EMAIL='willianwca2011@gmail.com';
const raw=String(import.meta.env.VITE_SUPABASE_URL||'').trim();
const url=raw.replace(/\/+$/,'').replace(/\/rest\/v1$/i,'');
const key=String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'').trim();
const sb=url&&key?createClient(url,key):null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDate=v=>v?new Date(v).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}):'—';
let campaign=null;

function admin(){return document.querySelector('#admin-app') && document.querySelector('.admin-shell')}
function render(){
 const root=document.querySelector('#panel'); if(!root)return;
 root.innerHTML=`<div class="section-card reward-admin-card"><div class="section-head"><div><small class="reward-admin-kicker">ADMIN / RECOMPENSAS</small><h2>Central de Recompensas</h2><p>Configure a campanha e analise solicitações em um único lugar.</p></div><button class="secondary" id="reward-refresh">Atualizar</button></div><div id="reward-admin-content"><div class="rewards-loading panel"><h2>Carregando...</h2></div></div></div>`;
 load();
}
async function load(){
 const out=document.querySelector('#reward-admin-content');if(!out||!sb)return;
 const {data:cs,error:ce}=await sb.from('reward_campaigns').select('*').order('created_at',{ascending:false}).limit(1);
 if(ce){out.innerHTML=err(ce.message);return} campaign=cs?.[0]||null;
 let claims=[];let users={};
 if(campaign){const r=await sb.from('reward_claims').select('id,campaign_id,user_id,status,created_at,updated_at').eq('campaign_id',campaign.id).order('created_at',{ascending:false});if(r.error){out.innerHTML=err(r.error.message);return}claims=r.data||[];
  const ids=[...new Set(claims.map(x=>x.user_id))];
  if(ids.length){const p=await sb.from('profiles').select('id,display_name,username').in('id',ids);if(!p.error)(p.data||[]).forEach(x=>users[x.id]=x)}
 }
 const counts={pending:0,review:0,approved:0,rejected:0};claims.forEach(x=>counts[x.status]=(counts[x.status]||0)+1);
 out.innerHTML=`<div class="reward-admin-hero"><div class="reward-admin-symbol">🎁</div><div class="reward-admin-copy"><span>Campanha ativa</span><strong>${esc(campaign?.title||'Nenhuma campanha')}</strong><small>${esc(campaign?.description||'Crie uma campanha para começar.')}</small></div><div class="reward-admin-value"><b>${Number(campaign?.reward_robux||0).toLocaleString('pt-BR')}</b><span>Robux</span></div></div>
 <div class="reward-admin-stats"><div><span>Pendentes</span><b>${counts.pending||0}</b></div><div><span>Em análise</span><b>${counts.review||0}</b></div><div><span>Aprovadas</span><b>${counts.approved||0}</b></div><div><span>Recusadas</span><b>${counts.rejected||0}</b></div></div>
 <div class="reward-admin-config"><div><h3>Configuração da campanha</h3><p>O valor abaixo é a única fonte usada pela área pública.</p></div><div class="reward-config-grid"><label>Recompensa<input id="ra-value" type="number" min="1" step="1" value="${esc(campaign?.reward_robux??1000)}"></label><label>Link<input id="ra-url" type="url" placeholder="https://..." value="${esc(campaign?.campaign_url||'')}"></label><label class="reward-config-wide">Descrição<textarea id="ra-desc" maxlength="2000">${esc(campaign?.description||'')}</textarea></label><label class="check"><input id="ra-active" type="checkbox" ${campaign?.active!==false?'checked':''}> Campanha ativa</label><button class="primary" id="ra-save">Salvar configuração</button></div></div>
 <div class="reward-review"><div class="section-head"><div><h3>Solicitações</h3><p>Revise cada participação e defina o status.</p></div></div><div class="table-wrap"><table><thead><tr><th>Participante</th><th>Data</th><th>Status</th><th>Ação</th></tr></thead><tbody>${claims.length?claims.map(c=>{const u=users[c.user_id];return `<tr><td><b>${esc(u?.display_name||u?.username||'Usuário')}</b><small class="reward-user-id">${esc(String(c.user_id).slice(0,8))}</small></td><td>${fmtDate(c.created_at)}</td><td><span class="reward-status ${esc(c.status)}"><b>${label(c.status)}</b></span></td><td><select class="reward-status-select" data-claim="${esc(c.id)}"><option value="pending" ${c.status==='pending'?'selected':''}>Pendente</option><option value="review" ${c.status==='review'?'selected':''}>Em análise</option><option value="approved" ${c.status==='approved'?'selected':''}>Aprovada</option><option value="rejected" ${c.status==='rejected'?'selected':''}>Recusada</option></select></td></tr>`}).join(''):`<tr><td colspan="4" class="empty">Nenhuma solicitação recebida.</td></tr>`}</tbody></table></div></div>`;
 bind();
}
function label(s){return ({pending:'Pendente',review:'Em análise',approved:'Aprovada',rejected:'Recusada'})[s]||s}
function err(m){return `<div class="rewards-error panel"><h2>Não foi possível carregar</h2><p>${esc(m)}</p><button class="secondary" id="reward-retry">Tentar novamente</button></div>`}
function bind(){
 document.querySelector('#reward-refresh')?.addEventListener('click',load);
 document.querySelector('#reward-retry')?.addEventListener('click',load);
 document.querySelector('#ra-save')?.addEventListener('click',saveCampaign);
 document.querySelectorAll('.reward-status-select').forEach(s=>s.addEventListener('change',()=>updateClaim(s)));
}
async function saveCampaign(){
 if(!campaign)return alert('Nenhuma campanha encontrada.');
 const reward=Number(document.querySelector('#ra-value').value);const desc=document.querySelector('#ra-desc').value.trim();const campaign_url=document.querySelector('#ra-url').value.trim()||null;const active=document.querySelector('#ra-active').checked;
 if(!Number.isInteger(reward)||reward<1||!desc)return alert('Informe uma recompensa válida e uma descrição.');
 const b=document.querySelector('#ra-save');b.disabled=true;
 const {error}=await sb.from('reward_campaigns').update({reward_robux:reward,description:desc,campaign_url,active,updated_at:new Date().toISOString()}).eq('id',campaign.id);
 b.disabled=false;if(error)return alert(error.message);await load();toast('Campanha atualizada.');
}
async function updateClaim(select){
 const status=select.value;const id=select.dataset.claim;select.disabled=true;
 const {error}=await sb.from('reward_claims').update({status,updated_at:new Date().toISOString()}).eq('id',id);
 select.disabled=false;if(error){alert(error.message);await load();return}toast(`Solicitação marcada como ${label(status).toLowerCase()}.`);await load();
}
function toast(m){const x=document.createElement('div');x.className='toast';x.textContent=m;document.body.append(x);setTimeout(()=>x.remove(),2800)}

document.addEventListener('click',e=>{const b=e.target.closest('.nav[data-tab="rewards"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();if(!admin())return;document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x===b));render()},true);
const observer=new MutationObserver(()=>{if(document.querySelector('.nav[data-tab="rewards"]')&&!document.documentElement.dataset.rewardAdminReady)document.documentElement.dataset.rewardAdminReady='1'});observer.observe(document.body,{childList:true,subtree:true});
