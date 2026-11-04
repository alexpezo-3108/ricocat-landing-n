// Fallback de la banda para navegadores sin animation-timeline: mismo recorrido, solo transform.
export function initScrollBands() {
  if (CSS.supports('animation-timeline: view()')) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('[data-scroll-band]').forEach((band) => {
    const track = band.querySelector('[data-scroll-band-track]');
    let visible = false;
    let frame = 0;

    const render = () => {
      frame = 0;
      if (reduced.matches) return track.style.removeProperty('transform');
      const styles = getComputedStyle(band);
      const distance = (parseFloat(styles.getPropertyValue('--band-speed')) || 0) * window.innerWidth / 100;
      const direction = parseFloat(styles.getPropertyValue('--band-direction')) || 1;
      const rect = band.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height))); // = animation-range: cover
      track.style.transform = `translate3d(${(progress - 0.5) * distance * direction}px, 0, 0)`;
    };

    const request = () => {
      if (visible && !frame) frame = requestAnimationFrame(render);
    };

    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      request();
    }).observe(band);

    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    reduced.addEventListener('change', render);
    render();
  });
}
