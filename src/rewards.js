export function rewardsPage(S,sb,esc,icons){
  const loading=`<section class="page rewards-page"><div class="rewards-loading panel">${icons.box}<h2>Carregando recompensas...</h2></div></section>`;
  if(!S.user)return `<section class="page rewards-page"><div class="rewards-hero"><span class="eyebrow dark">RECOMPENSAS</span><h1>Ganhe até <em>1.000 Robux</em></h1><p>Entre na sua conta para ver campanhas disponíveis e acompanhar suas solicitações.</p><a class="primary" href="#/login">Entrar na conta</a></div></section>`;
  setTimeout(()=>loadRewards(S,sb,esc,icons),0);
  return loading;
}
async function loadRewards(S,sb,esc,icons){
  const root=document.querySelector('.rewards-page'); if(!root||!sb)return;
  const {data:campaigns,error}=await sb.from('reward_campaigns').select('id,title,description,reward_robux,campaign_url,max_claims,created_at').eq('active',true).order('created_at',{ascending:false});
  if(error){root.innerHTML=`<div class="panel rewards-error"><h2>Não foi possível carregar as recompensas</h2><p>${esc(error.message||'Erro ao consultar as campanhas.')}</p><button class="secondary" id="retry-rewards">Tentar novamente</button></div>`;document.querySelector('#retry-rewards')?.addEventListener('click',()=>loadRewards(S,sb,esc,icons));return;}
  const ids=(campaigns||[]).map(c=>c.id);
  let claims=[];
  if(ids.length){const r=await sb.from('reward_claims').select('id,campaign_id,status,created_at,updated_at').eq('user_id',S.user.id).in('campaign_id',ids);if(!r.error)claims=r.data||[];}
  const claimBy=new Map(claims.map(c=>[c.campaign_id,c]));
  root.innerHTML=`<div class="rewards-hero"><div><span class="eyebrow dark">ÁREA DE RECOMPENSAS</span><h1>Recompensas</h1><p>Participe de campanhas elegíveis, acompanhe sua solicitação e veja o status diretamente na sua conta.</p></div><div class="reward-highlight"><span>RECOMPENSA</span><strong>1.000</strong><small>Robux</small></div></div><div class="rewards-list">${campaigns?.length?campaigns.map(c=>campaignCard(c,claimBy.get(c.id),esc,icons)).join(''):`<div class="panel rewards-empty"><div class="empty-icon">${icons.box}</div><h2>Nenhuma campanha disponível</h2><p>Quando houver uma campanha ativa, ela aparecerá aqui.</p></div>`}</div>`;
  root.querySelectorAll('[data-claim]').forEach(b=>b.addEventListener('click',()=>claimReward(b.dataset.claim,S,sb,esc,icons)));
}
function campaignCard(c,claim,esc,icons){
  const status=claim?.status;
  const labels={pending:['Pendente','Sua solicitação foi registrada e aguarda análise.'],review:['Em análise','A equipe está verificando sua participação.'],approved:['Aprovada','Sua recompensa foi aprovada.'],rejected:['Recusada','Esta solicitação não foi aprovada.']};
  const st=status?labels[status]:null;
  const action=claim?`<div class="reward-status ${esc(status)}"><b>${esc(st?.[0]||status)}</b><span>${esc(st?.[1]||'Status atualizado.')}</span></div>`:`<button class="primary reward-action" data-claim="${esc(c.id)}">Quero participar</button>`;
  return `<article class="panel reward-card"><div class="reward-card-top"><div class="reward-icon">${icons.gift||icons.box}</div><div><span class="eyebrow dark">CAMPANHA</span><h2>${esc(c.title)}</h2></div><div class="reward-value"><b>${Number(c.reward_robux||0).toLocaleString('pt-BR')}</b><span>Robux</span></div></div><p>${esc(c.description)}</p><div class="reward-steps"><div><b>01</b><span>Leia as regras da campanha</span></div><div><b>02</b><span>Use somente ações e contas elegíveis</span></div><div><b>03</b><span>Envie sua solicitação e acompanhe a análise</span></div></div><div class="reward-actions">${c.campaign_url?`<a class="ghost" href="${esc(c.campaign_url)}" target="_blank" rel="noopener noreferrer">${icons.arrow}<span>Abrir campanha</span></a>`:''}${action}</div><small class="reward-note">A recompensa está sujeita às regras e à validação da campanha. Não crie contas duplicadas nem tente burlar limites.</small></article>`;
}
async function claimReward(id,S,sb,esc,icons){
  if(!S.user)return location.hash='#/login';
  const b=document.querySelector(`[data-claim="${CSS.escape(id)}"]`);if(b)b.disabled=true;
  const {data,error}=await sb.from('reward_claims').insert({campaign_id:id,user_id:S.user.id,status:'pending'}).select('id,status').single();
  if(error){if(b)b.disabled=false;const msg=error.code==='23505'?'Você já enviou uma solicitação para esta campanha.':error.message||'Não foi possível registrar a solicitação.';toastReward(msg,true);loadRewards(S,sb,esc,icons);return;}
  toastReward('Solicitação enviada com sucesso.');loadRewards(S,sb,esc,icons);
}
function toastReward(message,error=false){const x=document.createElement('div');x.className='toast '+(error?'error':'');x.innerHTML=`<span>${String(message).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]) )}</span>`;document.body.append(x);setTimeout(()=>x.remove(),3200)}
