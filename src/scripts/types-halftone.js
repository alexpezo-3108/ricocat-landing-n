/**
 * 04 · Pintado en semitono (OGL + fragment shader): una grilla rotada de puntos azules que nacen alrededor del plato,
 * crecen y se fusionan en sólido. El frente es un degradado de puntos (no una línea) deformado con ruido suave.
 * Progreso único s ∈ [0, 2]: 0→1 pintado, 1→2 despintado en espejo; depende solo del scroll (suavizado tipo scrub).
 * Hacia arriba el frente avanza más lento hasta que el escenario queda sticky (no toca el borde superior).
 */
const COLOR = [0, 50 / 255, 110 / 255]; // #00326E exacto

async function loadOgl() {
  try { return await import('ogl'); } catch { return import('https://cdn.jsdelivr.net/npm/ogl@1.0.11/src/index.js'); }
}

const vertex = /* glsl */ `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }`;

const fragment = /* glsl */ `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform vec3 uColor;
uniform vec2 uOrigin;      // plato (px)
uniform float uFrontPos;   // radio del frente (px)
uniform float uFront;      // ancho del degradado de puntos (px)
uniform float uSpacing;    // separación de la grilla (px)
uniform float uAngle;      // rotación de la grilla (rad)
uniform float uNoise;      // px de deformación del frente
uniform float uNoiseScale;
uniform float uJitter;     // variación de tamaño entre vecinos (0–1)
uniform float uUp;         // aplastamiento hacia arriba (1 = libre)
uniform float uSolid;
in vec2 vUv;
out vec4 fragColor;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { return vnoise(p) * 0.65 + vnoise(p * 2.1 + 7.3) * 0.35; }

void main() {
  if (uSolid > 0.5) { fragColor = vec4(uColor, 1.0); return; }
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uRes;
  float c = cos(uAngle), s = sin(uAngle);
  mat2 rot = mat2(c, -s, s, c);       // pantalla → grilla
  mat2 inv = mat2(c, s, -s, c);       // grilla → pantalla
  vec2 g = rot * p / uSpacing;
  vec2 base = floor(g);
  float a = 0.0;
  // 3×3 celdas vecinas: los puntos grandes se solapan con los de al lado sin cortes
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 cell = base + vec2(float(i), float(j));
      vec2 center = inv * ((cell + 0.5) * uSpacing);
      vec2 d = center - uOrigin;
      float dist = length(d) + (fbm(center * uNoiseScale) - 0.5) * 2.0 * uNoise;
      float t = clamp((uFrontPos - dist) / uFront, 0.0, 1.0);
      if (t <= 0.0) continue;
      float jit = 1.0 - uJitter * (1.0 - t) * hash(cell);
      float r = uSpacing * 0.75 * t * jit; // ≥ 0.707 × separación al completarse: sin huecos
      float dd = length(p - center);
      a = max(a, 1.0 - smoothstep(r - 0.75, r + 0.75, dd)); // borde nítido ~1.5px
    }
  }
  fragColor = vec4(uColor * a, a);
}`;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (u) => u * u * (3 - 2 * u);

export async function createHalftone({ stage, paint, platePin, section }) {
  if (!document.createElement('canvas').getContext('webgl2')) return null;
  const { Renderer, Program, Mesh, Triangle } = await loadOgl();

  const css = getComputedStyle(section);
  const num = (n, d) => { const v = parseFloat(css.getPropertyValue(n)); return Number.isFinite(v) ? v : d; };
  const small = innerWidth < 768;
  const scrub = num('--types-scrub', 0.6);
  const upSquash = num('--types-up-squash', 2.4);
  const upRelease = num('--types-up-release', 0.85);
  const front = num('--types-halftone-front', 220);
  const noise = num('--types-halftone-noise', 14);

  const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, 1.5), alpha: true, premultipliedAlpha: true, antialias: false, webgl: 2 });
  const { gl } = renderer;
  if (!renderer.isWebgl2) return null;
  gl.canvas.className = 'types__metaballs'; // misma capa que el pintado anterior
  gl.canvas.setAttribute('aria-hidden', 'true');
  paint.prepend(gl.canvas);

  const u = {
    uRes: { value: [1, 1] }, uColor: { value: COLOR }, uOrigin: { value: [0, 0] },
    uFrontPos: { value: 0 }, uFront: { value: front },
    uSpacing: { value: small ? num('--types-halftone-spacing-mobile', 12) : num('--types-halftone-spacing', 16) },
    uAngle: { value: (num('--types-halftone-angle', 45) * Math.PI) / 180 },
    uNoise: { value: noise }, uNoiseScale: { value: num('--types-halftone-noise-scale', 0.004) },
    uJitter: { value: num('--types-halftone-jitter', 0.25) }, uUp: { value: upSquash }, uSolid: { value: 0 },
  };
  const program = new Program(gl, { vertex, fragment, transparent: true, uniforms: u });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

  // Geometría cacheada (nunca dentro del loop)
  let W = 1, H = 1, X = 0, Y = 0, reach = 1;
  const measure = () => {
    idleKey = -1;
    const sr = stage.getBoundingClientRect();
    const pr = platePin.getBoundingClientRect();
    if (sr.width !== W || sr.height !== H) {
      W = sr.width; H = sr.height;
      renderer.setSize(W, H);
      u.uRes.value = [W, H];
    }
    X = pr.left - sr.left; Y = pr.top - sr.top;
    u.uOrigin.value = [X, Y];
    reach = Math.hypot(Math.max(X, W - X), Math.max(Y, H - Y)) + front + noise + 2; // al llegar a 1, todo sólido
  };

  let s = 0, target = 0, raf = 0, last = 0, visible = false, idleKey = -1, wasFull = false, free = false, upCur = upSquash;
  const safe = num('--types-halftone-safe', 40);
  let pS = 0.5; // progreso del pintado en que el escenario queda sticky (lo manda food-types.js)
  const curve = num('--types-halftone-curve', 1.6);      // >1 = el radio arranca más lento
  const tick = (now) => {
    const dt = Math.min(0.1, (now - (last || now)) / 1000);
    last = now;
    s += (target - s) * (1 - Math.exp((-dt * 3) / Math.max(0.05, scrub)));
    if (Math.abs(target - s) < 0.0003) s = target;
    const full = s >= 0.999 && s <= 1.001;
    if (full !== wasFull) {
      wasFull = full;
      paint.classList.toggle('is-full', full);
      gl.canvas.style.visibility = full ? 'hidden' : '';
    }
    const idle = s === target;
    if (!full && (!idle || idleKey !== s)) {
      const p = s <= 1 ? s : 2 - s;
      // Círculo uniforme (distancia euclidiana en px). Solo cambia el ritmo: hasta que el escenario queda sticky (pS),
      // el radio crece lento (curva) y su borde superior llega justo a `safe` px del tope; después crece libre hasta cubrir.
      const capR = Math.max(0, Y - safe - u.uSpacing.value - noise);
      const frontPos = p < pS
        ? capR * (p / pS) ** curve
        : capR + (reach - capR) * smooth((p - pS) / (1 - pS));
      u.uFrontPos.value = frontPos;
      u.uUp.value = 1;
      u.uSolid.value = 0;
      renderer.render({ scene: mesh });
      idleKey = idle ? s : -1;
    }
    raf = visible ? requestAnimationFrame(tick) : 0;
  };
  const start = () => { if (!raf) { last = 0; raf = requestAnimationFrame(tick); } };

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) { measure(); start(); }
  }, { rootMargin: '20% 0px' }).observe(section);
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(measure, 150); });
  measure();

  return {
    update({ paint: pv, exit, free: f, stickyP }) {
      target = exit > 0 ? 1 + exit : pv; free = !!f;
      if (Number.isFinite(stickyP)) pS = Math.min(0.95, Math.max(0.05, stickyP));
    },
    refresh: measure,
  };
}
