// Restore the theme before paint. Motion is handled with progressive enhancement.
try { document.documentElement.classList.toggle('light-mode', localStorage.getItem('theme') !== 'dark'); } catch (_) {}
