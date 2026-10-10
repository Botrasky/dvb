// ========== SLIDESHOW ==========
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dotsContainer = document.getElementById('slideDots');
slides.forEach((_, i) => {
  const dot = document.createElement('div');
  dot.className = 'slide-dot' + (i === 0 ? ' active' : '');
  dot.onclick = () => goSlide(i);
  dotsContainer.appendChild(dot);
});
function goSlide(n) {
  slides[currentSlide].classList.remove('active');
  dotsContainer.children[currentSlide].classList.remove('active');
  currentSlide = (n + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  dotsContainer.children[currentSlide].classList.add('active');
}
function nextSlide() { goSlide(currentSlide + 1); }
function prevSlide() { goSlide(currentSlide - 1); }
setInterval(() => nextSlide(), 5000);

// Touch swipe support
let touchStartX = 0;
document.getElementById('slideshow').addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
document.getElementById('slideshow').addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if(Math.abs(diff) > 40) { diff > 0 ? nextSlide() : prevSlide(); }
});
