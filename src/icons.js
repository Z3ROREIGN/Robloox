const svg={
brain:'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M13 5a5 5 0 0 0-5 5v1.1A5.5 5.5 0 0 0 7 21.6 5 5 0 0 0 12 27h3V18h-2a3 3 0 0 1 0-6h2V5h-2Z"/><path d="M19 5a5 5 0 0 1 5 5v1.1a5.5 5.5 0 0 1 1 10.5 5 5 0 0 1-5 5h-3V18h2a3 3 0 0 0 0-6h-2V5h2Z"/></svg>',
knife:'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="m19.5 4 8.5 8.5-4 4-3-3-8.8 8.8-4 .7.7-4 8.8-8.8-3-3 4.8-3.2Z"/><path d="m6 26 5-5"/></svg>',
fruit:'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M10 8c6.5 0 11 4.6 11 10.2C21 23.5 17.7 27 12 27S4 23.8 4 18c0-4.7 2.5-8.2 6-10Z"/><path d="M15 8c.8-3.4 3.1-5 6-5-.5 3.2-2.5 5.2-6 5Z"/><path d="M21 13c3-.1 5 1.8 6 4"/></svg>',
robux:'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="m11 5 14 3.8-3 11-14-3.8L11 5Z"/><path d="m8 16 14 3.8-3 8-14-3.8 3-8Z"/><path d="m14 10 5 1.4"/></svg>'
};
function iconFor(text=''){const t=text.toLowerCase();return t.includes('brain')?svg.brain:t.includes('murder')||t.includes('mm2')?svg.knife:t.includes('blox')||t.includes('fruit')?svg.fruit:t.includes('robux')?svg.robux:null}
function mount(){document.querySelectorAll('.cats button').forEach(b=>{if(b.querySelector('.cat-icon'))return;const i=iconFor(b.textContent);if(i)b.insertAdjacentHTML('afterbegin',`<span class="cat-icon">${i}</span>`)});document.querySelectorAll('.trust div').forEach((b,i)=>{if(b.querySelector('.trust-icon'))return;const a=[svg.robux,svg.brain,svg.knife][i];if(a)b.insertAdjacentHTML('afterbegin',`<span class="trust-icon">${a}</span>`)});}
mount();new MutationObserver(mount).observe(document.body,{childList:true,subtree:true});
