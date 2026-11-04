/** Footer: entrada, año automático, scroll suave de la navegación y "Volver arriba". */
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const behavior = () => (reduced() ? 'auto' : 'smooth');

export function initFooter() {
  const footer = document.querySelector('[data-footer]');
  if (!footer) return;

  const year = footer.querySelector('[data-footer-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  footer.querySelectorAll('[data-footer-scroll]').forEach((a) => a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    if (window.__lenis) window.__lenis.scrollTo(target);
    else scrollTo({ top: target.getBoundingClientRect().top + scrollY, behavior: behavior() });
    history.pushState(null, '', a.getAttribute('href'));
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }));

  footer.querySelector('[data-footer-top]')?.addEventListener('click', () => {
    if (window.__lenis) window.__lenis.scrollTo(0);
    else scrollTo({ top: 0, behavior: behavior() });
    // Foco al principio de la página (el siguiente Tab llega al "Saltar al contenido")
    const body = document.body;
    body.setAttribute('tabindex', '-1');
    body.focus({ preventScroll: true });
    body.addEventListener('blur', () => body.removeAttribute('tabindex'), { once: true });
  });

  const io = new IntersectionObserver((entries) => {
    if (!entries.some((en) => en.isIntersecting)) return;
    io.disconnect();
    footer.classList.add('is-in');
  }, { threshold: 0.15 });
  io.observe(footer);
}
