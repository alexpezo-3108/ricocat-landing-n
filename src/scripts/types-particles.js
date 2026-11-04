/**
 * 04 · Partículas sobre el azul (canvas 2D, sobre el patrón y bajo el plato): elipses blancas pequeñas y tenues
 * que flotan a su ritmo con leve rotación y parallax de scroll según su profundidad. Aparecen creciendo suave desde 0
 * después del patrón y se van con el despintado. Nunca elementos DOM sueltos.
 */
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (u) => u * u * (3 - 2 * u);

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createParticles({ stage, paint, section }) {
  const css = getComputedStyle(section);
  const num = (n, d) => { const v = parseFloat(css.getPropertyValue(n)); return Number.isFinite(v) ? v : d; };
  const small = innerWidth < 768;
  const count = Math.round(small ? num('--types-particles-mobile', 14) : num('--types-particles', 24));
  const minS = num('--types-particle-min', 3), maxS = num('--types-particle-max', 7);
  const minA = num('--types-particle-alpha-min', 0.1), maxA = num('--types-particle-alpha-max', 0.3);
  const speed = num('--types-particle-speed', 1);
  const parallax = num('--types-particle-parallax', 0.35);
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canvas = document.createElement('canvas');
  canvas.className = 'types__particles';
  canvas.setAttribute('aria-hidden', 'true');
  paint.append(canvas);
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  const rand = rng(777);
  const parts = Array.from({ length: count }, () => {
    const size = minS + rand() * (maxS - minS);
    const alpha = minA + rand() * (maxA - minA);
    const depth = 0.25 + 0.75 * (((size - minS) / Math.max(0.01, maxS - minS) + (alpha - minA) / Math.max(0.01, maxA - minA)) / 2);
    return {
      size, alpha, depth, ratio: 1 + rand() * 0.4, // elipse 1:1 → 1:1.4
      x0: rand(), y0: rand(), ax: 10 + rand() * 26, ay: 8 + rand() * 20,
      fx: 0.08 + rand() * 0.14, fy: 0.06 + rand() * 0.12, ph: rand() * 6.28,
      rot: rand() * 6.28, fr: (rand() - 0.5) * 0.5, delay: rand() * 0.45,
    };
  });

  let W = 1, H = 1, appear = 0, shown = 0, travel = 0, raf = 0, last = 0, visible = false, time = 0;
  const measure = () => {
    const r = stage.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
  };

  const draw = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (shown <= 0.001) return;
    const span = H + 40;
    const t = still ? 0 : time;
    ctx.fillStyle = '#FFFFFF';
    parts.forEach((p) => {
      const k = smooth(clamp01((shown - p.delay) / 0.55)); // crece suave desde 0, sin "pop"
      if (k <= 0) return;
      const x = p.x0 * W + Math.sin(t * p.fx * speed + p.ph) * p.ax;
      let y = p.y0 * span + Math.cos(t * p.fy * speed + p.ph) * p.ay - (still ? 0 : travel * parallax * p.depth);
      y = ((y % span) + span) % span - 20;
      // Nunca puntos < 3px ni casi invisibles: crecen de 3px a su tamaño mientras ganan opacidad
      const a = p.alpha * k;
      if (a < 0.04) return;
      const r = (3 + (p.size - 3) * k) / 2;
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.ellipse(x, y, r * p.ratio, r, p.rot + Math.sin(t * p.fr * speed) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  };

  const tick = (now) => {
    const dt = Math.min(0.1, (now - (last || now)) / 1000);
    last = now;
    time += dt;
    shown += (appear - shown) * (1 - Math.exp(-dt * 4));
    if (Math.abs(appear - shown) < 0.001) shown = appear;
    draw();
    raf = visible ? requestAnimationFrame(tick) : 0;
  };

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) { measure(); if (!raf) { last = 0; raf = requestAnimationFrame(tick); } }
  }, { rootMargin: '10% 0px' }).observe(section);
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(measure, 150); });
  measure();

  return {
    /** appear: 0→1 tras el patrón (0 con el despintado) · travel: px de scroll recorridos (parallax) */
    update({ appear: a, travel: tr }) { appear = clamp01(a); travel = tr; },
  };
}
