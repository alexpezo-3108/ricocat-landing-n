/**
 * EXPERIMENTO · Anillo de luz alrededor del bodegón del Hero (independiente del resto).
 * Órbita única: mitad superior detrás de las bolsas (canvas trasero) y base por delante (canvas delantero).
 * Ritmo: pasadas sueltas. Cada haz da UNA vuelta rápida y se apaga; luego una pausa aleatoria sin haces.
 * Para quitarlo: ENABLE_LIGHT_RINGS = false (o no importar este módulo).
 */
export const ENABLE_LIGHT_RINGS = true;

export const LIGHT_RINGS = {
  orbit: { rx: 0.6, ry: 0.27, cy: 0.56, tilt: -10 }, // rx/ry: fracción del ancho del escenario; cy: centro (fracción del alto)
  baseLine: 0.9,       // fracción del alto del escenario: por encima, la órbita va DETRÁS (nunca tapa los empaques)
  beamsPerPass: [1, 2],// haces por pasada (el 2.º sale a mitad de la vuelta del 1.º)
  lap: [1.6, 2.4],     // s por vuelta (aleatorio dentro del rango)
  length: [0.26, 0.2], // largo de cada haz (fracción del perímetro)
  pause: [1.4, 2.8],   // s sin haces entre pasadas
  fadeIn: 0.15,        // s
  fadeOut: 0.45,       // s: al completar la vuelta sigue avanzando mientras la cola se desvanece
  core: 6.5,           // px: trazo nítido
  glow: 22,            // px: brillo difuso
  glowAlpha: 0.6,
  head: 1.35,          // destello de la cabeza (× glow)
  brightness: 1,
  flicker: 0.18,
  sparksPerSec: 45,    // por haz
  sparkLife: 0.6,
  sparkSize: [2, 4],
  sparkSpread: 38,
  rampUp: 1.2,         // s: la primera pasada acelera desde quieta
  startDelay: 0,       // s tras el fin de la intro
  // Mobile: el escenario es más ancho que la pantalla y los lados de la órbita quedaban fuera.
  // Órbita limitada al ancho visible y haz algo más grueso y brillante (los productos no se tocan).
  // frontFromCenter: la mitad inferior de la elipse va por delante; frontBefore: esa capa se inserta antes de la
  // lata, así el haz cruza por delante de las bolsas y por detrás de la lata y el sachet.
  frontFromCenter: true,               // la mitad inferior de la elipse va por delante (mobile y desktop)
  frontBefore: '.hero__item--lata',    // y pasa entre las bolsas y la lata/sachet
  mobile: { maxRxVw: 0.47, ryRatio: 0.45, cy: 0.6, core: 5.5, glow: 20, glowAlpha: 0.75, brightness: 1.25, pause: [1, 2] }, // más delgada y algo más frecuente
};

const TAU = Math.PI * 2;
const rand = ([a, b]) => a + Math.random() * (b - a);

export function initHeroLightRings() {
  if (!ENABLE_LIGHT_RINGS || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const hero = document.querySelector('.hero');
  const stage = hero?.querySelector('.hero__stage');
  if (!stage || stage.querySelector('.hero-rings')) return;
  const C = LIGHT_RINGS;
  const isMobile = matchMedia('(max-width: 74.99em)');
  isMobile.addEventListener?.('change', () => placeFront());
  let T = C; // valores de dibujo efectivos (mobile los sobreescribe)

  const make = (where) => {
    const c = document.createElement('canvas');
    c.className = `hero-rings hero-rings--${where}`;
    c.setAttribute('aria-hidden', 'true');
    Object.assign(c.style, { position: 'absolute', left: '-25%', top: '-25%', width: '150%', height: '150%', pointerEvents: 'none' });
    return c;
  };
  const back = make('back');
  const front = make('front');
  stage.prepend(back);
  // Capa delantera: en mobile entre las bolsas y la lata/sachet; en desktop, delante de todo
  const placeFront = () => {
    const ref = C.frontBefore ? stage.querySelector(C.frontBefore) : null;
    if (ref) stage.insertBefore(front, ref); else stage.append(front);
  };
  placeFront();
  const bctx = back.getContext('2d');
  const fctx = front.getContext('2d');

  let W = 0, H = 0, dpr = 1, geo = null;
  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    W = stage.offsetWidth * 1.5; H = stage.offsetHeight * 1.5;
    [back, front].forEach((c) => { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
    const sw = stage.offsetWidth, sh = stage.offsetHeight;
    const a = (C.orbit.tilt * Math.PI) / 180;
    let rx = sw * C.orbit.rx, ry = sw * C.orbit.ry;
    T = isMobile.matches ? { ...C, ...C.mobile } : C;
    if (isMobile.matches) {
      rx = Math.min(rx, innerWidth * C.mobile.maxRxVw); // los lados quedan dentro de la pantalla
      ry = rx * C.mobile.ryRatio;
    }
    const cy = sh * 0.25 + sh * (isMobile.matches ? C.mobile.cy : C.orbit.cy);
    const base = C.frontFromCenter ? cy : sh * 0.25 + sh * C.baseLine;
    geo = { base, cx: W / 2, cy, rx, ry, cos: Math.cos(a), sin: Math.sin(a) };
  };
  resize();
  new ResizeObserver(resize).observe(stage);

  const point = (th) => {
    const x = geo.rx * Math.cos(th), y = geo.ry * Math.sin(th);
    const Y = geo.cy + x * geo.sin + y * geo.cos;
    return [geo.cx + x * geo.cos - y * geo.sin, Y, Y < geo.base];
  };
  const normal = (th) => {
    let nx = Math.cos(th) / geo.rx, ny = Math.sin(th) / geo.ry;
    const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    return [nx * geo.cos - ny * geo.sin, nx * geo.sin + ny * geo.cos];
  };

  const SEG = 36;
  const drawBeam = (head, length, alpha) => {
    const span = length * TAU;
    for (let i = 0; i < SEG; i += 1) {
      const t0 = i / SEG, t1 = (i + 1) / SEG;
      const [x0, y0, isBack] = point(head - span * (1 - t0));
      const [x1, y1] = point(head - span * (1 - t1));
      const ctx = isBack ? bctx : fctx;
      const k = t1 ** 1.6 * alpha;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
      ctx.lineWidth = T.glow * (0.4 + 0.6 * t1); ctx.strokeStyle = `rgba(255,255,255,${(k * T.glowAlpha * 0.35).toFixed(3)})`; ctx.stroke();
      ctx.lineWidth = T.glow * 0.5; ctx.strokeStyle = `rgba(255,255,255,${(k * T.glowAlpha * 0.4).toFixed(3)})`; ctx.stroke();
      ctx.lineWidth = T.core * (0.5 + 0.5 * t1); ctx.strokeStyle = `rgba(255,255,255,${Math.min(1, k * 1.1).toFixed(3)})`; ctx.stroke();
    }
    const [hx, hy, hb] = point(head);
    const ctx = hb ? bctx : fctx;
    const r = T.glow * T.head;
    const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, r);
    g.addColorStop(0, `rgba(255,255,255,${alpha.toFixed(3)})`);
    g.addColorStop(0.3, `rgba(255,255,255,${(alpha * 0.45).toFixed(3)})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx, hy, r, 0, TAU); ctx.fill();
    return [hx, hy, hb, head];
  };

  // Pasadas: cada haz = una vuelta + apagado. Pausa aleatoria entre pasadas.
  let beams = [], waitUntil = 0, first = true;
  const sparks = [];
  const newPass = (now) => {
    const n = Math.round(rand(C.beamsPerPass));
    const lap = rand(C.lap);
    const phase = Math.random();
    beams = Array.from({ length: n }, (_, i) => ({
      start: now + i * (lap / 2) * 1000, // el 2.º arranca a mitad de la vuelta del 1.º
      lap, phase: (phase + i * 0.37) % 1, length: C.length[i] ?? 0.2,
      pos: 0, acc: 0, seed: Math.random() * 10, ramp: first && i === 0,
    }));
    first = false;
  };

  let running = false, raf = 0, last = 0, t = 0, started = false;
  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now; t += dt;
    [bctx, fctx].forEach((ctx) => { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H); ctx.lineCap = 'round'; });
    if (!started) return;

    if (!beams.length && now >= waitUntil) newPass(now);
    beams.forEach((b, i) => {
      const age = (now - b.start) / 1000;
      if (age < 0 || b.done) return;
      const speed = b.ramp ? 1 - (1 - Math.min(1, age / C.rampUp)) ** 3 : 1;
      b.pos += (dt / b.lap) * speed;                          // vueltas recorridas
      const over = Math.max(0, b.pos - 1) * b.lap;            // s desde que completó la vuelta
      if (over >= C.fadeOut) { b.done = true; return; }
      const env = Math.min(1, age / C.fadeIn) * (1 - over / C.fadeOut);
      const alpha = env * T.brightness * (1 - C.flicker + C.flicker * Math.sin(t * (9 + i * 3.7) + b.seed));
      const len = b.length * Math.min(1, 0.3 + b.pos) * (1 - 0.6 * (over / C.fadeOut));
      const [hx, hy, hb, head] = drawBeam((b.phase + b.pos) * TAU, len, alpha);
      b.acc += C.sparksPerSec * dt * speed * env;
      const [nx, ny] = normal(head);
      while (b.acc >= 1) {
        b.acc -= 1;
        const out = C.sparkSpread * (0.4 + Math.random());
        sparks.push({
          x: hx + (Math.random() - 0.5) * 6, y: hy + (Math.random() - 0.5) * 6,
          vx: nx * out + (Math.random() - 0.5) * 18, vy: ny * out + (Math.random() - 0.5) * 18,
          age: 0, life: C.sparkLife * (0.6 + Math.random() * 0.6),
          size: rand(C.sparkSize), back: hb, seed: Math.random() * 10,
        });
      }
    });
    const ringActive = beams.some((b) => !b.done && (now - b.start) >= 0);
    if (ringActive !== hero.hasAttribute('data-ring-active')) hero.toggleAttribute('data-ring-active', ringActive); // lo lee hero-shine.js
    if (beams.length && beams.every((b) => b.done)) {
      beams = [];
      waitUntil = now + rand(T.pause) * 1000;
    }
    for (let i = sparks.length - 1; i >= 0; i -= 1) {
      const s = sparks[i];
      s.age += dt;
      if (s.age >= s.life) { sparks.splice(i, 1); continue; }
      s.x += s.vx * dt; s.y += s.vy * dt;
      const life = 1 - s.age / s.life;
      const a = life * (0.55 + 0.45 * Math.sin(s.age * 45 + s.seed)) * T.brightness;
      if (a <= 0.02) continue;
      const ctx = s.back ? bctx : fctx;
      ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, (s.size / 2) * (0.6 + 0.4 * life), 0, TAU); ctx.fill();
    }
  };
  const play = () => { if (!running) { running = true; last = 0; raf = requestAnimationFrame(frame); } };
  const pause = () => { running = false; cancelAnimationFrame(raf); };

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible && !document.hidden ? play() : pause(); }).observe(hero);
  document.addEventListener('visibilitychange', () => (visible && !document.hidden ? play() : pause()));

  const start = () => { if (started) return; setTimeout(() => { started = true; waitUntil = 0; }, C.startDelay * 1000); };
  if (document.documentElement.classList.contains('hero-intro') && !hero.classList.contains('is-lit')) {
    document.addEventListener('hero:intro-end', start, { once: true });
    setTimeout(start, 9000);
  } else start();
  play();
}
