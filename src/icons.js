const svg={
search:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.2 4.2"/></svg>',
cart:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2 11h10l3-8H6"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/></svg>',
user:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.5 3.2-5.3 7-5.3s6.2 1.8 7 5.3"/></svg>',
check:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4.2 4.2L19 6.8"/></svg>',
alert:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4 21 20H3L12 4Z"/><path d="M12 9v5M12 17h.01"/></svg>',
info:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 10.5v5M12 7.5h.01"/></svg>',
arrow:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
arrowLeft:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H6M11 6l-6 6 6 6"/></svg>',
grid:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>',
shield:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 19 6v5.2c0 4.2-2.7 7.7-7 9.8-4.3-2.1-7-5.6-7-9.8V6l7-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></svg>',
zap:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 2-8 11h6l-1 9 8-12h-6l1-8Z"/></svg>',
pix:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7.5 7.5 3-3a2.1 2.1 0 0 1 3 0l3 3M16.5 16.5l-3 3a2.1 2.1 0 0 1-3 0l-3-3M4.5 10.5l3-3 4.5 4.5a2.1 2.1 0 0 0 3 0l4.5-4.5M4.5 13.5l3 3 4.5-4.5a2.1 2.1 0 0 1 3 0l4.5 4.5"/></svg>',
support:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13v-1a8 8 0 0 1 16 0v1"/><path d="M4 13h3v5H5a1 1 0 0 1-1-1v-4ZM20 13h-3v5h2a1 1 0 0 0 1-1v-4Z"/><path d="M17 18c-1 .9-2.5 1.5-4 1.5"/></svg>',
orders:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v15H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
logout:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10"/></svg>',
game:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8h10a4 4 0 0 1 3.8 5.3l-1.2 3.5a2 2 0 0 1-3.5.6L14 15H10l-2.1 2.4a2 2 0 0 1-3.5-.6l-1.2-3.5A4 4 0 0 1 7 8Z"/><path d="M7 11v4M5 13h4M16 12h.01M18 14h.01"/></svg>',
star:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z"/></svg>',
box:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 7 8-4 8 4v10l-8 4-8-4V7Z"/><path d="m4 7 8 4 8-4M12 11v10"/></svg>',
copy:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
brain:'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M13 5a5 5 0 0 0-5 5v1.1A5.5 5.5 0 0 0 7 21.6 5 5 0 0 0 12 27h3V18h-2a3 3 0 0 1 0-6h2V5h-2Z"/><path d="M19 5a5 5 0 0 1 5 5v1.1a5.5 5.5 0 0 1 1 10.5 5 5 0 0 1-5 5h-3V18h2a3 3 0 0 0 0-6h-2V5h2Z"/></svg>',
knife:'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="m19.5 4 8.5 8.5-4 4-3-3-8.8 8.8-4 .7.7-4 8.8-8.8-3-3 4.8-3.2Z"/><path d="m6 26 5-5"/></svg>',
fruit:'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M10 8c6.5 0 11 4.6 11 10.2C21 23.5 17.7 27 12 27S4 23.8 4 18c0-4.7 2.5-8.2 6-10Z"/><path d="M15 8c.8-3.4 3.1-5 6-5-.5 3.2-2.5 5.2-6 5Z"/><path d="M21 13c3-.1 5 1.8 6 4"/></svg>',
robux:'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="m11 5 14 3.8-3 11-14-3.8L11 5Z"/><path d="m8 16 14 3.8-3 8-14-3.8 3-8Z"/><path d="m14 10 5 1.4"/></svg>'
};
export const icons=svg;
export const iconFor=(text='')=>{const t=text.toLowerCase();return t.includes('brain')?svg.brain:t.includes('murder')||t.includes('mm2')?svg.knife:t.includes('blox')||t.includes('fruit')?svg.fruit:t.includes('robux')?svg.robux:svg.box};
