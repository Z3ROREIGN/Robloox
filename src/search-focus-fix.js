// Keeps the catalog search field focused while the SPA re-renders after each keystroke.
// main.js currently replaces #app.innerHTML on every search input, which destroys the
// focused input element on mobile and makes the on-screen keyboard close.
let pending = false;

document.addEventListener('input', (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.id !== 'q') return;
  const selectionStart = input.selectionStart;
  const selectionEnd = input.selectionEnd;

  if (pending) return;
  pending = true;
  setTimeout(() => {
    pending = false;
    const next = document.querySelector('#q');
    if (!next) return;
    next.focus({ preventScroll: true });
    try {
      const end = next.value.length;
      const start = Math.min(selectionStart ?? end, end);
      const finish = Math.min(selectionEnd ?? end, end);
      next.setSelectionRange(start, finish);
    } catch (_) {
      // Some mobile browsers do not allow selection changes in every input state.
    }
  }, 0);
}, true);
