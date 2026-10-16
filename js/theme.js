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

function toggleTheme() {
  isDark = !isDark;
  setStoredTheme(isDark ? 'dark' : 'light');
  const html = document.documentElement;
  if (!document.startViewTransition) {
    applyTheme(isDark);
  } else {
    html.classList.add('theme-changing');
    const vt = document.startViewTransition(() => applyTheme(isDark));
    vt.finished.finally(() => html.classList.remove('theme-changing'));
  }
  if (typeof updateCharts === 'function') updateCharts();
}
