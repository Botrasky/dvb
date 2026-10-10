// ========== TYPING ==========
const phrases = [
  'CEH Certified · Ethical Hacker',
  'SOC Analyst · Threat Hunter',
  'Digital Forensics Investigator',
  'Python Security Automation',
  'Penetration Tester · Red Team'
];
let pIdx = 0, cIdx = 0, deleting = false;
function type() {
  const el = document.getElementById('typingEl');
  const phrase = phrases[pIdx];
  if (!deleting) {
    el.textContent = phrase.slice(0, ++cIdx);
    if (cIdx === phrase.length) { deleting = true; setTimeout(type, 2000); return; }
  } else {
    el.textContent = phrase.slice(0, --cIdx);
    if (cIdx === 0) { deleting = false; pIdx = (pIdx + 1) % phrases.length; }
  }
  setTimeout(type, deleting ? 50 : 90);
}
type();

// ========== COUNTER ANIMATION ==========
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const start = Date.now();
    const duration = 1800;
    function update() {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(update);
    }
    update();
  });
}
animateCounters();

