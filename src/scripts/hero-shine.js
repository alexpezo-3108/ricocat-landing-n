/**
 * Brillo diagonal ocasional sobre las bolsas del Hero (reflejo que recorre el empaque de abajo hacia arriba).
 * Capa por bolsa recortada con la propia imagen como máscara (nunca ilumina el fondo). Solo transform de la franja.
 * - Intro: la timeline dispara 'hero:shine' (detail: { bag: 'festival' }) mientras la bolsa central está en primer plano.
 * - Luego: cada SHINE.every s, una bolsa al azar (nunca la misma dos veces); espera si un haz de los anillos está pasando.
 * - prefers-reduced-motion: sin brillo.
 */
export const SHINE = {
  bags: ['festival', 'esterilizados', 'adultos'],
  angle: 25,          // ° de inclinación de la franja
  width: 35,          // % del ancho de la bolsa
  intensity: 0.32,    // blanco en el centro de la franja (pasadas ocasionales, sutiles)
  introIntensity: 0.9,// más fuerte en la pasada de la intro (bolsa central en primer plano)
  blend: 'overlay',   // 'soft-light' más sutil · 'overlay' más visible
  duration: 1.1,      // s por pasada
  easing: 'cubic-bezier(0.45, 0, 0.55, 1)', // ≈ power2.inOut
  every: [4.5, 8],    // s entre pasadas ocasionales
};

const rand = ([a, b]) => a + Math.random() * (b - a);

export function initHeroShine() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const hero = document.querySelector('.hero');
  if (!hero || hero.querySelector('.hero__shine')) return;
  const S = SHINE;

  const layers = new Map();
  S.bags.forEach((id) => {
    const pic = hero.querySelector(`.hero__item--${id}`);
    const img = pic?.querySelector('img');
    if (!img) return;
    const layer = document.createElement('span');
    layer.className = 'hero__shine';
    layer.setAttribute('aria-hidden', 'true');
    Object.assign(layer.style, {
      position: 'absolute', inset: '0', overflow: 'hidden', pointerEvents: 'none',
      mixBlendMode: S.blend, maskSize: '100% 100%', webkitMaskSize: '100% 100%',
      maskRepeat: 'no-repeat', webkitMaskRepeat: 'no-repeat', maskPosition: '0 0', webkitMaskPosition: '0 0',
    });
    const setMask = () => {
      const url = `url("${img.currentSrc || img.src}")`;
      layer.style.maskImage = url; layer.style.webkitMaskImage = url;
    };
    img.complete ? setMask() : img.addEventListener('load', setMask, { once: true });
    const band = document.createElement('span');
    Object.assign(band.style, {
      position: 'absolute', top: '-50%', left: '0', width: `${S.width}%`, height: '200%',
      background: `linear-gradient(to right, transparent, rgb(255 255 255 / ${S.intensity}) 50%, transparent)`,
      transform: `translate(-150%, 25%) rotate(${S.angle}deg)`, willChange: 'transform',
    });
    layer.append(band);
    pic.append(layer);
    layers.set(id, band);
  });
  if (!layers.size) return;

  let busy = false, last = null;
  const gradient = (k) => `linear-gradient(to right, transparent, rgb(255 255 255 / ${k}) 50%, transparent)`;
  const pass = (id, intensity = S.intensity) => {
    const band = layers.get(id);
    if (!band || busy) return Promise.resolve();
    busy = true; last = id;
    band.style.background = gradient(intensity);
    const a = band.animate([
      { transform: `translate(-150%, 25%) rotate(${S.angle}deg)` },
      { transform: `translate(330%, -25%) rotate(${S.angle}deg)` },
    ], { duration: S.duration * 1000, easing: S.easing });
    return a.finished.catch(() => {}).then(() => { busy = false; });
  };

  // Intro: pasada en la bolsa central durante el acercamiento
  document.addEventListener('hero:shine', (e) => pass(e.detail?.bag || 'festival', S.introIntensity));

  // Ciclo ocasional: solo con el Hero visible; espera a que no haya un haz de los anillos pasando
  let visible = true, timer = 0;
  const schedule = () => { clearTimeout(timer); timer = setTimeout(tick, rand(S.every) * 1000); };
  const tick = () => {
    if (!visible || document.hidden) return; // se retoma al volver
    if (busy || hero.hasAttribute('data-ring-active')) { timer = setTimeout(tick, 400); return; }
    const options = [...layers.keys()].filter((id) => id !== last);
    pass(options[Math.floor(Math.random() * options.length)]).then(schedule);
  };
  new IntersectionObserver(([e]) => {
    const was = visible; visible = e.isIntersecting;
    if (visible && !was) schedule(); else if (!visible) clearTimeout(timer);
  }).observe(hero);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && visible) schedule(); });
  const begin = () => schedule();
  if (document.documentElement.classList.contains('hero-intro') && !hero.classList.contains('is-lit')) {
    document.addEventListener('hero:intro-end', begin, { once: true });
  } else begin();
}
