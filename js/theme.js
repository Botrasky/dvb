// ========== THEME ==========
let isDark = true;
function toggleTheme() {
  isDark = !isDark;
  document.body.classList.toggle('light-mode', !isDark);
  document.getElementById('themeIcon').textContent = isDark ? '☀️' : '🌙';
  document.getElementById('themeLabel').textContent = isDark ? 'Light' : 'Dark';
  // Charts only exist on the homepage; writeup pages share this file without them.
  if (typeof updateCharts === 'function') updateCharts();
}

