// ========== THEME ==========
let isDark = true;
function toggleTheme() {
  isDark = !isDark;
  document.body.classList.toggle('light-mode', !isDark);
  document.getElementById('themeIcon').textContent = isDark ? '☀️' : '🌙';
  document.getElementById('themeLabel').textContent = isDark ? 'Light' : 'Dark';
  updateCharts();
}

