// Prevent the Android keyboard from closing while typing in the catalog search.
// The search field must not be replaced or re-rendered on each keystroke.
(() => {
  const normalize = (value) => String(value || '').trim().toLocaleLowerCase('pt-BR');

  document.addEventListener('input', (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.id !== 'q') return;

    // Block the legacy input listener that rebuilds the SPA tree.
    event.stopImmediatePropagation();

    const query = normalize(input.value);
    const cards = document.querySelectorAll('.grid .card');
    let visible = 0;

    cards.forEach((card) => {
      const show = !query || normalize(card.textContent).includes(query);
      card.hidden = !show;
      if (show) visible++;
    });

    const count = document.querySelector('.result-count');
    if (count) count.textContent = `${visible} produto(s)`;
  }, true);
})();
