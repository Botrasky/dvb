// Reveal once without hiding content when scripting or observers are unavailable.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      observer.unobserve(target);
      if (reduced.matches) return;
      target.animate([
        { opacity: .65, transform: 'translateY(14px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], { duration: 420, easing: 'cubic-bezier(.2,.7,.3,1)' });
    });
  }, { threshold: .08 });
  document.querySelectorAll('.dash-section, .author-intro, .page-about .section-header').forEach(el => observer.observe(el));
  reduced.addEventListener('change', () => {
    if (!reduced.matches) return;
    observer.disconnect();
    document.getAnimations().forEach(animation => { if (Number.isFinite(animation.effect?.getComputedTiming().endTime)) animation.finish(); });
  });
})();
