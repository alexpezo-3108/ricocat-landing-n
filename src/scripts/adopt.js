/** 12 · Adopta un gatito: entrada al llegar a la sección y parallax de las formas (fallback JS). */
export function initAdopt() {
  document.querySelectorAll('[data-adopt]').forEach((section) => {
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      section.classList.add('is-in');
    }, { threshold: 0.25 });
    io.observe(section);
    initParallaxFallback(section);
  });
}

// Solo si no hay scroll-driven animations: rAF mientras la sección es visible, solo transform.
function initParallaxFallback(section) {
  if (CSS.supports('animation-timeline: view()')) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const layers = [...section.querySelectorAll('.adopt__layer')];
  let visible = false;
  let frame = 0;

  const update = () => {
    frame = 0;
    if (reduced.matches) { layers.forEach((l) => { l.style.transform = ''; }); return; }
    const r = section.getBoundingClientRect();
    const vh = innerHeight;
    const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height))); // 0 entra · 0.5 centro · 1 sale
    layers.forEach((l) => {
      const cs = getComputedStyle(l);
      const amp = parseFloat(cs.getPropertyValue('--adopt-parallax')) || 0;
      const rot = parseFloat(cs.getPropertyValue('--adopt-parallax-rot')) || 0;
      const k = (p - 0.5) * 2;
      l.style.transform = `translate3d(0, ${(k * amp).toFixed(2)}px, 0) rotate(${(k * rot).toFixed(2)}deg)`;
    });
  };
  const onScroll = () => { if (visible && !frame) frame = requestAnimationFrame(update); };

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) onScroll();
  }).observe(section);
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
}
