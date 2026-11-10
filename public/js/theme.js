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
const themeButton = document.getElementById('themeToggle');
if (themeButton && !themeButton.hasAttribute('onclick')) themeButton.addEventListener('click', toggleTheme);


// Visible card entrances on every page, including Safari without page transitions.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const requested = new URLSearchParams(location.search).get('motion');
  let mode = requested;
  try {
    if (['on', 'off', 'system'].includes(requested)) sessionStorage.setItem('fxMotion', requested);
    mode = sessionStorage.getItem('fxMotion');
  } catch (_) { /* The URL still works without storage. */ }
  const enabled = () => mode === 'on' || (mode !== 'off' && !reduced.matches);
  window.siteMotion = { enabled };
  if (mode === 'on') document.documentElement.classList.add('site-motion-on');
  if (mode === 'off') document.documentElement.classList.add('site-motion-off');

  const selectors = document.querySelector('.wu-article')
    ? '.wu-page-title, .wu-meta-line, .wu-glance, .wu-body > h2, .wu-body > p, .article-contents'
    : document.body.classList.contains('page-library')
      ? '.wu-sidebar, .collection-toolbar, .wu-card'
      : document.body.classList.contains('page-about')
        ? '.hero-content, .section-header, .about-card, .chart-wrap, .exp-card, .ach-card, .edu-card, .road-card, .cta-box'
        : '.dash-masthead, .mission, .brief, .topic-card, .lab-card, .author-strip, .author-intro, .author-detail > section';
  const targets = [...document.querySelectorAll(selectors)];
  let observer;

  function reveal(elements) {
    if (!enabled()) return;
    elements.forEach((element, index) => {
      observer?.unobserve(element);
      element.style.setProperty('--entrance-x', index % 2 ? '64px' : '-64px');
      element.style.setProperty('--entrance-delay', Math.min(index, 5) * 85 + 'ms');
      element.classList.add('site-arrive');
    });
  }

  function start() {
    observer?.disconnect();
    targets.forEach(element => element.classList.remove('site-arrive'));
    if (!enabled()) return;
    observer = 'IntersectionObserver' in window
      ? new IntersectionObserver(entries => reveal(entries.filter(entry => entry.isIntersecting).map(entry => entry.target)))
      : null;
    if (observer) targets.forEach(element => observer.observe(element));
    else reveal(targets);
  }

  start();
  window.addEventListener('pageshow', event => { if (event.persisted) start(); });
  reduced.addEventListener('change', start);
})();
