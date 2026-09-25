const KEY='rooblox_theme_v2';
const pref=()=>localStorage.getItem(KEY)||localStorage.getItem('rooblox_theme_v1')||'system';
const apply=()=>{const p=pref();const dark=p==='dark'||(p==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=dark?'dark':'light';document.documentElement.dataset.themePreference=p};
const toggle=()=>{const p=pref();localStorage.setItem(KEY,p==='light'?'dark':p==='dark'?'system':'light');apply();location.reload()};
apply();
const top=document.querySelector('.top');
if(top&&!top.querySelector('[data-theme-toggle]')){const b=document.createElement('button');b.dataset.themeToggle='1';b.type='button';b.textContent=pref()==='dark'?'☾':pref()==='light'?'☀':'◐';b.title='Alternar tema';b.setAttribute('aria-label','Alternar tema');b.style.cssText='border:1px solid var(--rx-line,#ddd);background:var(--rx-card,#fff);color:var(--rx-text,#111);border-radius:10px;width:40px;height:40px;cursor:pointer;font-size:16px';b.onclick=toggle;top.insertBefore(b,top.querySelector('.cart')||null)}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>pref()==='system'&&apply());