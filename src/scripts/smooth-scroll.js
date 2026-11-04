/** Smooth scroll global (Lenis). Se desactiva con prefers-reduced-motion y se pausa con el scroll bloqueado (modales). */
async function loadLenis() {
  try { return (await import('lenis')).default; } catch { return (await import('https://cdn.jsdelivr.net/npm/lenis@1.3.4/dist/lenis.mjs')).default; }
}

export async function initSmoothScroll() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  let Lenis;
  try { Lenis = await loadLenis(); } catch { return null; }
  const css = getComputedStyle(document.documentElement);
  const lerp = parseFloat(css.getPropertyValue('--scroll-lerp')) || 0.1;
  const lenis = new Lenis({ lerp, smoothWheel: true, anchors: true });
  window.__lenis = lenis;
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  // Modales/menú bloquean el scroll de la página: Lenis se detiene mientras tanto
  const sync = () => {
    const locked = document.documentElement.classList.contains('is-locked') || !!document.querySelector('dialog[open]');
    if (locked) lenis.stop(); else lenis.start();
  };
  new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['class'], subtree: true });
  return lenis;
}
