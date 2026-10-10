// ========== WRITEUPS: hub filtering + report-page helpers ==========

// --- Hub: filter by category/difficulty and search ---
(function initHub() {
  const grid = document.getElementById('wuGrid');
  if (!grid) return;
  const cards = [...grid.querySelectorAll('.wu-card')];
  const search = document.getElementById('wuSearch');
  const filters = [...document.querySelectorAll('.wu-filter')];
  let activeCat = 'all';

  function apply() {
    const q = (search?.value || '').trim().toLowerCase();
    let shown = 0;
    cards.forEach(card => {
      const catOk = activeCat === 'all' || card.dataset.category === activeCat;
      const textOk = !q || card.textContent.toLowerCase().includes(q);
      const show = catOk && textOk;
      card.style.display = show ? '' : 'none';
      if (show) shown++;
    });
    const empty = document.getElementById('wuEmpty');
    if (empty) empty.style.display = shown ? 'none' : '';
  }

  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCat = btn.dataset.filter;
    apply();
  }));
  search?.addEventListener('input', apply);
})();

// --- Report page: copy buttons on code blocks ---
document.querySelectorAll('.wu-copy').forEach(btn => {
  btn.addEventListener('click', async () => {
    const code = btn.closest('.wu-code')?.querySelector('code');
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code.innerText);
      const prev = btn.textContent;
      btn.textContent = 'copied'; btn.classList.add('copied');
      setTimeout(() => { btn.textContent = prev; btn.classList.remove('copied'); }, 1400);
    } catch { /* clipboard blocked; ignore */ }
  });
});

// --- Report page: click to reveal a blurred flag ---
document.querySelectorAll('.wu-flag').forEach(el => {
  el.addEventListener('click', () => el.classList.add('revealed'));
});
