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


// A short contextual entrance also works in browsers without page transitions.
(() => {
  if ('onpagereveal' in window || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const main = document.querySelector('main');
  if (!main || !main.animate) return;
  const from = document.querySelector('.wu-article') ? 'translateY(18px)' :
    document.querySelector('.author-shell') ? 'translateY(28px)' :
    document.body.classList.contains('page-library') ? 'translateX(28px)' : 'scale(.98)';
  main.animate([{opacity: .3, transform: from}, {opacity: 1, transform: 'none'}],
    {duration: 460, easing: 'cubic-bezier(.16,1,.3,1)'});
})();
