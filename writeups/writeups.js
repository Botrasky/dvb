// ========== WRITEUPS: hub filtering + report-page helpers ==========

// --- Hub: filter by category/difficulty and search ---
(function initHub() {
  const grid = document.getElementById('wuGrid');
  if (!grid) return;
  const cards = [...grid.querySelectorAll('.wu-card')];
  const search = document.getElementById('wuSearch');
  const filters = [...document.querySelectorAll('.wu-filter')];
  const topic = new URLSearchParams(location.search).get('topic');
  const initialFilter = filters.find(button => button.dataset.filter === topic);
  let activeCat = initialFilter?.dataset.filter || 'all';
  const difficulty = document.getElementById('wuDifficulty');

  function apply() {
    const q = (search?.value || '').trim().toLowerCase();
    let shown = 0;
    cards.forEach(card => {
      const catOk = activeCat === 'all' || card.dataset.category === activeCat;
      const textOk = !q || card.textContent.toLowerCase().includes(q);
      const levelOk = !difficulty || difficulty.value === 'all' || !!card.querySelector('.diff-' + difficulty.value);
      const show = catOk && textOk && levelOk;
      card.style.display = show ? '' : 'none';
      if (show) shown++;
    });
    const empty = document.getElementById('wuEmpty');
    if (empty) empty.style.display = shown ? 'none' : '';
    const count = document.getElementById('wuCount');
    if(count) count.textContent = shown + ' of ' + cards.length + ' writeups';
  }

  if (initialFilter) {
    for (const button of filters) {
      const active = button === initialFilter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    }
  }

  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    activeCat = btn.dataset.filter;
    apply();
  }));
  search?.addEventListener('input', apply);
  difficulty?.addEventListener('change', apply);
  document.getElementById('wuReset')?.addEventListener('click', () => {
    search.value = ''; difficulty.value = 'all'; activeCat = 'all';
    filters.forEach(b => { const active=b.dataset.filter === 'all'; b.classList.toggle('active',active); b.setAttribute('aria-pressed',String(active)); }); apply();
  });
  apply();
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
