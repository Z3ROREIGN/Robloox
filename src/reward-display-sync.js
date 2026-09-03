import { createClient } from '@supabase/supabase-js';
const raw=String(import.meta.env.VITE_SUPABASE_URL||'').trim();
const url=raw.replace(/\/+$/,'').replace(/\/rest\/v1$/i,'');
const key=String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'').trim();
const sb=url&&key?createClient(url,key):null;
let value=null;
const moneyRobux=n=>Number(n||0).toLocaleString('pt-BR');
async function sync(){
 if(!sb)return;
 const {data}=await sb.from('reward_campaigns').select('reward_robux').eq('active',true).order('created_at',{ascending:false}).limit(1).maybeSingle();
 if(!data)return;
 value=moneyRobux(data.reward_robux);
 document.querySelectorAll('.reward-account strong').forEach(el=>{el.textContent=`Até ${value} Robux`});
 document.querySelectorAll('[data-reward-value]').forEach(el=>{el.textContent=value});
}
sync();
new MutationObserver(()=>{if(value)document.querySelectorAll('.reward-account strong').forEach(el=>{if(el.textContent.includes('1.000')||el.textContent.includes('800')||el.textContent.includes('Robux'))el.textContent=`Até ${value} Robux`})}).observe(document.body,{childList:true,subtree:true});
