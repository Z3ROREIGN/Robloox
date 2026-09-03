import { createClient } from '@supabase/supabase-js';

const raw = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
const url = raw.replace(/\/+$/, '').replace(/\/rest\/v1$/i, '');
const key = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();
const sb = url && key ? createClient(url, key) : null;

let value = null;
let syncQueued = false;

const moneyRobux = n => Number(n || 0).toLocaleString('pt-BR');

function applyValue() {
  if (value === null) return;
  const label = `Até ${value} Robux`;
  document.querySelectorAll('.reward-account strong').forEach(el => {
    if (el.textContent !== label) el.textContent = label;
  });
  document.querySelectorAll('[data-reward-value]').forEach(el => {
    if (el.textContent !== value) el.textContent = value;
  });
}

function queueApply() {
  if (syncQueued) return;
  syncQueued = true;
  queueMicrotask(() => {
    syncQueued = false;
    applyValue();
  });
}

async function sync() {
  if (!sb) return;
  try {
    const { data, error } = await sb
      .from('reward_campaigns')
      .select('reward_robux')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return;
    value = moneyRobux(data.reward_robux);
    applyValue();
  } catch (error) {
    console.error('Reward display sync failed:', error);
  }
}

sync();

// Keep the dynamic value in newly rendered account content without creating
// a mutation loop. The previous implementation wrote to textContent from
// inside the observer on every mutation, which could continuously retrigger
// itself and freeze the page.
if (document.body) {
  const observer = new MutationObserver(() => queueApply());
  observer.observe(document.body, { childList: true, subtree: true });
}
