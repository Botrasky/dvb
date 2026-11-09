// Keep content visible by default; add a short entrance only when motion is allowed.
(() => {
 const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
 document.querySelectorAll('.skill-bar-fill').forEach(bar => { bar.style.width = bar.dataset.width + '%'; });
 if (reduced || !('IntersectionObserver' in window)) return;
 const observer = new IntersectionObserver(entries => entries.forEach(entry => {
   if (!entry.isIntersecting) return;
   entry.target.animate([{opacity:0.6,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:240,easing:'ease-out'});
   observer.unobserve(entry.target);
 }), {threshold:0.05});
 document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();
