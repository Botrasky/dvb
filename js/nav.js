function toggleMenu() {
 const links = document.getElementById('navLinks');
 const button = document.getElementById('hamburger');
 const open = links.classList.toggle('open');
 button.setAttribute('aria-expanded', String(open));
 button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
}
function closeMenu() {
 const links = document.getElementById('navLinks');
 if (links.classList.contains('open')) toggleMenu();
}
document.querySelectorAll('#navLinks a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if(e.key === 'Escape') { closeMenu(); document.getElementById('hamburger').focus(); } });
window.addEventListener('resize', () => { if(innerWidth > 900) closeMenu(); });
