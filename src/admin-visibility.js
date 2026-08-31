import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'willianwca2011@gmail.com';
const rawUrl = String(import.meta.env.VITE_SUPABASE_URL || '').trim();
const url = rawUrl.replace(/\/+$/, '').replace(/\/rest\/v1$/i, '');
const key = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();

if (url && key) {
  const supabase = createClient(url, key);

  const removeUnauthorizedLinks = () => {
    document.querySelectorAll('a[href="/admin.html"], a[href="/admin.html/"]').forEach((el) => el.remove());
  };

  const addAdminLink = () => {
    removeUnauthorizedLinks();
    const existing = document.querySelector('[data-rooblox-admin-link]');
    if (existing) return;
    const link = document.createElement('a');
    link.href = '/admin.html';
    link.dataset.roobloxAdminLink = 'true';
    link.textContent = 'Administração';
    link.setAttribute('aria-label', 'Área administrativa');
    link.className = 'rooblox-admin-link';
    document.body.appendChild(link);
  };

  const sync = async () => {
    removeUnauthorizedLinks();
    const { data } = await supabase.auth.getSession();
    const email = String(data.session?.user?.email || '').trim().toLowerCase();
    if (email === ADMIN_EMAIL) addAdminLink();
  };

  new MutationObserver(() => {
    const link = document.querySelector('[data-rooblox-admin-link]');
    if (!link) sync();
  }).observe(document.body, { childList: true, subtree: true });

  supabase.auth.onAuthStateChange(() => sync());
  sync();
}
