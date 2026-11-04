export function initCarousels() {
  document.querySelectorAll('[data-carousel]').forEach(setupCarousel);
}

function setupCarousel(root) {
  const track = root.querySelector('[data-carousel-track]');
  const slides = [...track.children];
  const dots = [...root.querySelectorAll('[data-carousel-dot]')];
  const interval = Number(root.dataset.interval) || 3000;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let timer = null;
  let paused = false;

  const isScrollable = () => track.scrollWidth > track.clientWidth + 1;

  const setActive = (i) => {
    index = i;
    slides.forEach((slide, n) => slide.classList.toggle('is-active', n === i));
    dots.forEach((dot, n) => dot.setAttribute('aria-current', String(n === i)));
  };

  const goTo = (i) => {
    track.scrollTo({ left: slides[i].offsetLeft, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  };

  const stop = () => {
    clearInterval(timer);
    timer = null;
  };

  // En el hero, el autoplay espera a que termine la intro de cámara (tope de 6s por si no llega el aviso).
  let waitIntro = !!root.closest('.hero') && document.documentElement.classList.contains('hero-intro');
  if (waitIntro) {
    const release = () => { if (waitIntro) { waitIntro = false; start(); } };
    document.addEventListener('hero:intro-end', release, { once: true });
    setTimeout(release, 6000);
  }

  const start = () => {
    stop();
    if (waitIntro || paused || reducedMotion.matches || document.hidden || !isScrollable()) return;
    timer = setInterval(() => goTo((index + 1) % slides.length), interval);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && isScrollable()) setActive(slides.indexOf(entry.target));
    });
  }, { root: track, threshold: 0.6 });
  slides.forEach((slide) => observer.observe(slide));

  dots.forEach((dot, n) => dot.addEventListener('click', () => {
    goTo(n);
    start();
  }));

  const pause = () => { paused = true; stop(); };
  const resume = () => { paused = false; start(); };
  root.addEventListener('pointerenter', pause);
  root.addEventListener('pointerleave', resume);
  root.addEventListener('focusin', pause);
  root.addEventListener('focusout', resume);
  track.addEventListener('touchstart', pause, { passive: true });
  track.addEventListener('touchend', resume);
  document.addEventListener('visibilitychange', start);
  reducedMotion.addEventListener('change', start);
  new ResizeObserver(start).observe(track);

  setActive(0);
  start();
}
