(() => {
  const carousel = document.querySelector('[data-hero-carousel]');
  if (!carousel) return;

  const slides = [...carousel.querySelectorAll('.hero-slide')];
  const dots = [...carousel.querySelectorAll('[data-slide]')];
  if (!slides.length || slides.length !== dots.length) return;

  let current = 0;
  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, position) => {
      const active = position === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      dots[position].classList.toggle('is-active', active);
      dots[position].setAttribute('aria-pressed', String(active));
    });
  };

  carousel.querySelector('[data-carousel-prev]').addEventListener('click', () => show(current - 1));
  carousel.querySelector('[data-carousel-next]').addEventListener('click', () => show(current + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => show(index)));
})();
