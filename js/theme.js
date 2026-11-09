// ========== THEME ==========
// Persisted in localStorage so the chosen theme survives navigating
// between pages (homepage, writeups hub, each writeup) instead of
// resetting to dark on every new page load.
function getStoredTheme() {
  try { return localStorage.getItem('theme'); } catch (e) { return null; }
}
function setStoredTheme(value) {
  try { localStorage.setItem('theme', value); } catch (e) { /* storage unavailable, fall back to in-memory only */ }
}
function applyTheme(dark) {
  document.body.classList.toggle('light-mode', !dark);
  document.documentElement.classList.toggle('light-mode', !dark);
  const btn = document.getElementById('themeToggle');
  const label = document.getElementById('themeLabel');
  if (label) label.textContent = dark ? 'Dark' : 'Light';
  if (btn) btn.setAttribute('aria-pressed', String(!dark));
}

let isDark = getStoredTheme() === 'dark';
applyTheme(isDark);

let themeTransition;
function toggleTheme() {
  isDark = !isDark;
  setStoredTheme(isDark ? 'dark' : 'light');
  const dark = isDark;
  themeTransition?.skipTransition();
  const renderTheme = () => {
    applyTheme(dark);
    if (typeof updateCharts === 'function') updateCharts();
  };
  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.body.classList.add("theme-changing");
    themeTransition = document.startViewTransition(renderTheme);
    const currentTransition = themeTransition;
    currentTransition.finished.finally(() => {
      if (themeTransition === currentTransition) document.body.classList.remove("theme-changing");
    });
  } else {
    renderTheme();
  }
}


// Visible card entrances on every page, including Safari without page transitions.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return;
  const selectors = document.querySelector('.wu-article')
    ? '.wu-page-title, .wu-meta-line, .wu-glance, .wu-body > h2, .wu-body > p, .article-contents'
    : document.body.classList.contains('page-library')
      ? '.wu-sidebar, .collection-toolbar, .wu-card'
      : document.body.classList.contains('page-about')
        ? '.hero-content, .section-header, .about-card, .chart-wrap, .exp-card, .ach-card, .edu-card, .road-card, .cta-box'
        : '.dash-masthead, .mission, .brief, .topic-card, .lab-card, .author-strip, .author-intro, .author-detail > section';
  const animations = new Set();
  let order = 0;
  function reveal(el) {
    if (reduced.matches || !el.animate) return;
    const index = order++;
    const animation = el.animate([
      { opacity: 0, transform: `translateX(${index % 2 ? 44 : -44}px)` },
      { opacity: 1, transform: 'translateX(0)' },
    ], { duration: 720, delay: (index % 4) * 90, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
    animations.add(animation);
    animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
  }
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { observer.unobserve(entry.target); reveal(entry.target); } });
  }, {threshold: .06}) : null;
  document.querySelectorAll(selectors).forEach(el => observer ? observer.observe(el) : reveal(el));
  reduced.addEventListener('change', () => {
    if (!reduced.matches) return;
    observer?.disconnect();
    animations.forEach(animation => animation.cancel());
  });
})();
