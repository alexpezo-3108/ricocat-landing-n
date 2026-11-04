/**
 * 04 · Pintado: blobs azules (SVG + GSAP MorphSVG) que nacen del plato y cubren el escenario, luego el patrón
 * entra en onda. Ligado al scroll con suavizado tipo scrub (--types-scrub): food-types.js mide el scroll y
 * llama update({ paint, wave, exit }) con fracciones 0–1; la salida reproduce la misma línea de tiempo en reversa.
 * GSAP se carga solo aquí: import dinámico (Astro/Vite) o, si no hay bundler, desde CDN.
 */
import { createHalftone } from './types-halftone.js';
import { createParticles } from './types-particles.js';

const CDN = 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/';
const NS = 'http://www.w3.org/2000/svg';

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = Object.assign(document.createElement('script'), { src, async: false });
    s.onload = resolve;
    s.onerror = reject;
    document.head.append(s);
  });
}

// MorphSVG solo hace falta para los blobs SVG (modo "metaballs" sin WebGL); en "halftone" no se carga.
async function loadGsap(withMorph) {
  try {
    const [{ gsap }, morph] = await Promise.all([import('gsap'), withMorph ? import('gsap/MorphSVGPlugin') : null]);
    return { gsap, MorphSVGPlugin: morph?.MorphSVGPlugin ?? null };
  } catch {
    await loadScript(`${CDN}gsap.min.js`);
    if (withMorph) await loadScript(`${CDN}MorphSVGPlugin.min.js`);
    return { gsap: window.gsap, MorphSVGPlugin: withMorph ? window.MorphSVGPlugin : null };
  }
}

// PRNG con semilla: formas fijas (no se recalculan por cuadro)
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Blob orgánico cerrado: n puntos alrededor de (cx, cy), radio r ± amp, suavizado Catmull-Rom → Bézier. */
function blobPath(cx, cy, r, amp, seed, n = 9) {
  const rand = rng(seed);
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + (rand() - 0.5) * 0.35;
    const rr = r * (1 + (rand() * 2 - 1) * amp);
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  });
  const f = (v) => v.toFixed(1);
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < n; i += 1) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return `${d}Z`;
}

// Dirección (rad), deriva (fracción del radio) y ritmo (fracción de la duración) de cada blob.
// El primero es el central y el más lento: es el que garantiza cubrir el 100% al terminar.
// Direcciones hacia los lados y hacia abajo (donde hay espacio mientras la sección entra), nunca hacia arriba
const BLOBS = [
  { dir: 0, drift: 0, pace: 1, delay: 0 },
  { dir: 0.25, drift: 0.34, pace: 0.72, delay: 0.05 },
  { dir: 2.9, drift: 0.3, pace: 0.78, delay: 0.1 },
  { dir: 1.5, drift: 0.36, pace: 0.68, delay: 0.14 },
  { dir: 2.3, drift: 0.28, pace: 0.74, delay: 0.08 },
  { dir: 0.85, drift: 0.32, pace: 0.66, delay: 0.18 },
];

export function initTypesPaint({ section, stage, paint, platePin }) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches) return null;

  const svg = document.createElementNS(NS, 'svg');
  svg.classList.add('types__blobs');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  paint.prepend(svg);

  // Fracciones que manda food-types.js: paint (blobs), wave (patrón), exit (despintado 0→1)
  const ctl = { tl: null, A: 0, B: 0, cap: Infinity, state: { paint: 0, wave: 0, exit: 0, free: false }, scrub: 0.6, gsap: null, mb: null };
  const PATTERN_OUT = 0.3; // metaballs: primer 30% de la salida apaga el patrón; el resto retrae las gotas
  const targetTime = ({ paint: p, wave: w, exit: x, free }) => {
    if (ctl.mb || ctl.circle) {
      // Línea de tiempo solo del patrón (A = 0); el azul lo mueve el shader (o el clip-path)
      if (x > 0) return ctl.B * (1 - clamp(x / PATTERN_OUT));
      return w > 0 && free ? ctl.B * w : 0;
    }
    if (x > 0) return ctl.B * (1 - x); // espejo: primero se apaga el patrón, luego se retraen los blobs
    if (w > 0 && free) return ctl.A + (ctl.B - ctl.A) * w; // el patrón solo avanza con el azul completo
    return ctl.A * p; // solo depende del scroll (sin esperas)
  };
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const particles = createParticles({ stage, paint, section });
  ctl.update = (state) => {
    ctl.state = state;
    // Partículas: pop al terminar de entrar el patrón; se van al empezar el despintado
    const appear = state.exit > 0 ? 1 - clamp(state.exit / PATTERN_OUT) : (state.free ? clamp((state.wave - 0.6) / 0.4) : 0);
    particles.update({ appear, travel: state.travel || 0 });
    // SVG: si la geometría cambió desde que se armó (al iniciar puede no estar asentada), se rearma antes de pintar
    if (!ctl.mb && ctl.build && state.exit === 0) {
      const sr = stage.getBoundingClientRect();
      const key = `${Math.round(sr.width)}|${Math.round(sr.height)}|${Math.round(platePin.getBoundingClientRect().top - sr.top)}`;
      if (key !== ctl.key) ctl.build();
    }
    ctl.mb?.update({ paint: state.paint, exit: clamp((state.exit - PATTERN_OUT) / (1 - PATTERN_OUT)), free: state.free, stickyP: state.stickyP });
    if (ctl.circle) {
      const k = state.exit > 0 ? 1 - clamp((state.exit - PATTERN_OUT) / (1 - PATTERN_OUT)) : state.paint;
      paint.classList.add('is-full');
      paint.style.clipPath = k >= 1 ? '' : `circle(${(k * 150).toFixed(2)}vmax at var(--paint-x, 50%) var(--paint-y, 50%))`;
    }
    if (!ctl.tl) return;
    ctl.gsap.to(ctl.tl, { time: targetTime(state), duration: ctl.scrub, ease: 'power3.out', overwrite: true });
  };

  // Pintado por shader (WebGL2 + OGL): --types-paint-mode = halftone (por defecto) | metaballs
  const mode = getComputedStyle(section).getPropertyValue('--types-paint-mode').trim() || 'halftone';
  // types-metaballs.js solo se importa si se activa ese modo
  const createP = mode === 'metaballs' ? import('./types-metaballs.js').then((m) => m.createMetaballs) : Promise.resolve(createHalftone);
  const mbReady = createP.then((create) => create({ stage, paint, platePin, section })).catch(() => null);
  Promise.all([loadGsap(mode !== 'halftone'), mbReady]).then(([{ gsap, MorphSVGPlugin }, mb]) => {
    if (MorphSVGPlugin) gsap.registerPlugin(MorphSVGPlugin);
    ctl.gsap = gsap;
    ctl.mb = mb;
    if (mb) { svg.remove(); mb.update({ ...ctl.state, exit: 0 }); }
    else if (mode === 'halftone') { svg.remove(); ctl.circle = true; } // sin WebGL: clip-path circular simple
    const css = getComputedStyle(section);
    const num = (n, d) => { const v = parseFloat(css.getPropertyValue(n)); return Number.isFinite(v) ? v : d; };
    const str = (n, d) => css.getPropertyValue(n).trim() || d;

    const build = () => {
      ctl.tl?.kill();

      const dur = ctl.mb || ctl.circle ? 0 : num('--types-blob-dur', 1.2);
      const ease = str('--types-blob-ease', 'power3.inOut');
      const count = Math.max(1, Math.min(BLOBS.length, Math.round(num('--types-blob-count', 6))));
      const drop = num('--types-blob-start', 6); // radio inicial (px): casi una gota
      const wave = {
        dur: num('--types-wave-dur', 0.9),
        cellDur: num('--types-wave-cell-dur', 0.5),
        pop: num('--types-wave-pop', 1),
        from: num('--types-wave-from', 0.92),
        rot: num('--types-wave-rotate', 15),
        drift: num('--types-wave-drift', 28),
      };

      const sr = stage.getBoundingClientRect();
      const pr = platePin.getBoundingClientRect();
      const w = sr.width, h = sr.height;
      ctl.key = `${Math.round(w)}|${Math.round(h)}|${Math.round(pr.top - sr.top)}`;
      const x = pr.left - sr.left, y = pr.top - sr.top;
      const far = (cx, cy) => Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy));
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      svg.replaceChildren();

      const tl = gsap.timeline({ paused: true });
      const R = far(x, y);
      const originDrop = num('--types-blob-origin-drop', 0.06) * h; // origen levemente bajo el plato
      (ctl.mb || ctl.circle ? [] : BLOBS.slice(0, count)).forEach((b, i) => {
        const seed = 101 + i * 37;
        const cx = (k) => x + Math.cos(b.dir) * b.drift * R * k;
        const cy = (k) => y + originDrop * (1 - k) + Math.sin(b.dir) * b.drift * R * k;
        const finalAmp = 0.12;
        const rFinal = (far(cx(1), cy(1)) / (1 - finalAmp)) * 1.04; // su radio mínimo aún excede las esquinas
        // gota → mancha chica → se esparce → cubre: crecimiento gradual, poco invasivo al inicio
        const steps = [
          blobPath(cx(0), cy(0), drop, 0.25, seed),
          blobPath(cx(0.3), cy(0.3), Math.max(drop * 2, rFinal * 0.1), 0.34, seed + 1),
          blobPath(cx(0.65), cy(0.65), rFinal * 0.34, 0.3, seed + 2),
          blobPath(cx(1), cy(1), rFinal, finalAmp, seed + 3),
        ];
        const path = document.createElementNS(NS, 'path');
        path.setAttribute('d', steps[0]);
        path.classList.add('types__blob');
        svg.append(path);
        const d = dur * b.pace;
        const at = dur * b.delay * (i === 0 ? 0 : 1);
        // Pasos directamente en la línea maestra (reversible): arranque suave → tramo medio → frenado (≈ --types-blob-ease)
        const [easeIn, easeOut] = ease.includes('.') ? [`${ease.split('.')[0]}.in`, `${ease.split('.')[0]}.out`] : ['power2.in', 'power2.out'];
        const pos = i === 0 ? 0 : Math.min(at, dur - d);
        tl.fromTo(path, { morphSVG: steps[0] }, { morphSVG: steps[1], duration: d * 0.35, ease: easeIn, immediateRender: false }, pos)
          .to(path, { morphSVG: steps[2], duration: d * 0.3, ease: 'none' }, pos + d * 0.35)
          .to(path, { morphSVG: steps[3], duration: d * 0.35, ease: easeOut }, pos + d * 0.65);
      });
      // Patrón en celdas: onda desde el plato. Cada celda: pop (0 → pop → 1), giro ±rot → 0 y leve deriva desde el plato
      const pattern = document.createElement('div');
      pattern.className = 'types__pattern';
      const cols = w >= h ? 6 : 4;
      const rows = w >= h ? 4 : 6;
      const cw = w / cols, ch = h / rows;
      const cells = [];
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const cell = document.createElement('div');
          cell.className = 'types__cell';
          const left = Math.floor(c * cw), top = Math.floor(r * ch);
          Object.assign(cell.style, { left: `${left}px`, top: `${top}px`, width: `${Math.ceil(cw) + 1}px`, height: `${Math.ceil(ch) + 1}px` });
          cell.style.setProperty('--cell-x', `${left}px`);
          cell.style.setProperty('--cell-y', `${top}px`);
          const mx = left + cw / 2 - x, my = top + ch / 2 - y;
          cells.push({ cell, mx, my, dist: Math.hypot(mx, my), sign: (r + c) % 2 ? 1 : -1 });
          pattern.append(cell);
        }
      }
      paint.querySelector('.types__pattern')?.remove();
      paint.append(pattern);
      const maxDist = Math.max(...cells.map((k) => k.dist), 1);
      const spread = Math.max(0, wave.dur - wave.cellDur);
      cells.forEach(({ cell, mx, my, dist, sign }) => {
        const k = wave.drift / Math.max(1, dist);
        // Entrada lineal y discreta: aparece mientras crece apenas (from → 1) y se acerca unos px
        gsap.set(cell, { opacity: 0, scale: wave.from, rotation: sign * wave.rot, x: -mx * k, y: -my * k, transformOrigin: '50% 50%' });
        tl.to(cell, {
          keyframes: { scale: [wave.from, wave.pop, 1], rotation: [sign * wave.rot, 0, 0], x: [-mx * k, 0, 0], y: [-my * k, 0, 0], opacity: [0, 0.7, 1], easeEach: 'none' },
          duration: wave.cellDur,
          ease: 'none',
        }, dur + (dist / maxDist) * spread);
      });

      // Límite de espacio: el mayor tiempo en que ningún blob sube a menos de --types-blob-safe px del borde superior
      const safe = num('--types-blob-safe', 40);
      const paths = [...svg.querySelectorAll('path')];
      ctl.cap = 0;
      for (let k = 0; k <= (ctl.mb || ctl.circle ? -1 : 80); k += 1) {
        const tt = (dur * k) / 80;
        tl.time(tt);
        const top = Math.min(...paths.map((p) => p.getBBox().y));
        if (top < safe) break;
        ctl.cap = tt;
      }
      tl.time(0);

      ctl.tl = tl;
      ctl.A = dur;
      ctl.B = tl.duration();
      ctl.scrub = num('--types-scrub', 0.6);
      tl.time(targetTime(ctl.state)); // estado actual sin animar (al cargar o redimensionar a mitad de página)
    };

    ctl.build = build;
    build();
    let t = 0;
    addEventListener('resize', () => { clearTimeout(t); t = setTimeout(build, 200); });
  }).catch(() => {
    paint.classList.add('is-static'); // sin GSAP: azul y patrón directos
  });

  return ctl;
}
