/**
 * 04 · Pintado con metaballs (OGL + fragment shader): gotas azules que nacen del plato, se desprenden por trayectorias
 * curvas unidas por hilos, salpican y terminan cubriendo el escenario. El campo se deforma con ruido (fbm + domain
 * warping), más fuerte en el borde, y el ruido avanza solo en el tiempo (pintura viva) sin cambiar cuánto está pintado.
 * Progreso único s ∈ [0, 2]: 0→1 pintado, 1→2 despintado en espejo. Depende SOLO del scroll (con suavizado tipo scrub);
 * el espacio hacia arriba se resuelve con la composición: el campo se "aplasta" hacia arriba hasta que el escenario es sticky.
 */
const MAX = 24;
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
uniform vec3 uBalls[${MAX}];
uniform int uCount;
uniform vec2 uRes;
uniform vec3 uColor;
uniform vec2 uOrigin;     // plato (px)
uniform float uUp;        // aplastamiento hacia arriba (1 = libre)
uniform float uTime;
uniform float uNoiseScale; // px → espacio de ruido
uniform float uWarp;      // px de domain warping en el borde
uniform float uEdgeNoise; // irregularidad del umbral en el borde
uniform float uSolid;     // 1 = pintado completo: azul sólido, sin campo ni ruido (nada de huecos)
in vec2 vUv;
out vec4 fragColor;

// Simplex 2D (Ashima / Ian McEwan, MIT)
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
float fbm(vec2 p) {
  float f = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { f += a * snoise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return f;
}
float field(vec2 p) {
  float f = 0.0;
  for (int i = 0; i < ${MAX}; i++) {
    if (i >= uCount) break;
    vec3 b = uBalls[i];
    vec2 d = p - b.xy;
    if (p.y < uOrigin.y) d.y *= uUp; // hacia arriba crece más lento hasta que la sección es sticky
    f += (b.z * b.z) / (dot(d, d) + 0.001);
  }
  return f;
}
void main() {
  if (uSolid > 0.5) { fragColor = vec4(uColor, 1.0); return; }
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uRes;
  float f0 = field(p);
  // Ruido más fuerte en el borde y casi nulo dentro de la masa
  float edge = 1.0 - smoothstep(1.0, 3.0, f0);
  vec2 q = p * uNoiseScale;
  vec2 warp = vec2(fbm(q + vec2(0.0, uTime)), fbm(q + vec2(5.2, -uTime) + 1.7));
  float f = field(p + warp * uWarp * edge);
  // Irregularidad del umbral SOLO en una banda pegada al contorno (f0 ≈ 1) y de baja frecuencia:
  // así no nacen islas sueltas lejos de la masa ni huecos dentro (los "fragmentos tipo vidrio")
  float band = smoothstep(0.75, 1.0, f0) * (1.0 - smoothstep(1.0, 1.5, f0));
  f += fbm(q * 1.2 - uTime * 0.6) * uEdgeNoise * band;
  // El campo tiende a infinito en el centro de cada gota: se acota ANTES del antialias para que fwidth
  // no explote ahí (eso abría agujeritos en los centros de las gotas)
  float fc = min(f, 2.0);
  float w = max(fwidth(fc), 1e-4) * 0.9; // antialias ~1–2px en el umbral (borde nítido)
  float a = smoothstep(1.0 - w, 1.0 + w, fc);
  fragColor = vec4(uColor * a, a);      // premultiplicado: color exacto donde a = 1
}`;

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (u) => u * u * (3 - 2 * u);
const easeOut = (u) => 1 - (1 - u) ** 3;
const sideOrDown = (r) => -0.3 + r * (Math.PI + 0.6); // nunca hacia arriba (y crece hacia abajo)

export async function createMetaballs({ stage, paint, platePin, section }) {
  if (!document.createElement('canvas').getContext('webgl2')) return null;
  const { Renderer, Program, Mesh, Triangle } = await loadOgl();

  const css = getComputedStyle(section);
  const num = (n, d) => { const v = parseFloat(css.getPropertyValue(n)); return Number.isFinite(v) ? v : d; };
  const small = innerWidth < 768;
  const total = Math.max(12, Math.min(MAX, Math.round(num('--types-drops', 18) * (small ? 0.75 : 1)))); // menos en mobile
  const splashes = Math.max(0, Math.min(8, Math.round(num('--types-splashes', 5) * (small ? 0.8 : 1))));
  const viscosity = num('--types-viscosity', 1);
  const scrub = num('--types-scrub', 0.6);
  const originDrop = num('--types-blob-origin-drop', 0.06);
  const upSquash = num('--types-up-squash', 2.4);       // cuánto más lento crece hacia arriba al inicio
  const upRelease = num('--types-up-release', 0.85);    // desde qué progreso puede crecer libre hacia arriba
  const noiseScale = num('--types-noise-scale', 0.006);
  const warp = num('--types-noise-warp', 38);
  const edgeNoise = num('--types-noise-edge', 0.35);
  const flow = num('--types-noise-speed', 0.06);        // avance del ruido por segundo (movimiento propio)
  const minR = num('--types-drop-min', 12) / 2;

  const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, 1.5), alpha: true, premultipliedAlpha: true, antialias: false, webgl: 2 });
  const { gl } = renderer;
  if (!renderer.isWebgl2) return null;
  gl.canvas.className = 'types__metaballs';
  gl.canvas.setAttribute('aria-hidden', 'true');
  paint.prepend(gl.canvas);

  // Uniforms creados una vez; por cuadro solo se actualizan valores
  const balls = new Array(MAX * 3).fill(0); // Array (no Float32Array): OGL así reconoce uBalls[0]
  const u = {
    uBalls: { value: balls }, uCount: { value: total }, uRes: { value: [1, 1] }, uColor: { value: COLOR },
    uOrigin: { value: [0, 0] }, uUp: { value: upSquash }, uTime: { value: 0 },
    uNoiseScale: { value: noiseScale }, uWarp: { value: warp }, uEdgeNoise: { value: edgeNoise }, uSolid: { value: 0 },
  };
  const program = new Program(gl, { vertex, fragment, transparent: true, uniforms: u });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

  const rand = rng(4242);
  const mains = 4;
  const mediums = total - mains - splashes;
  const drops = Array.from({ length: total }, (_, i) => {
    const kind = i < mains ? 'main' : i < mains + mediums ? 'medium' : 'splash';
    return { kind, dir: sideOrDown(rand()), curve: (rand() - 0.5) * 1.6, a: rand(), b: rand(), c: rand() };
  });

  // Geometría cacheada: solo en resize/refresh y al volverse visible (nunca dentro del loop)
  let W = 1, H = 1, X = 0, Y = 0, R = 1;
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
    R = Math.hypot(Math.max(X, W - X), Math.max(Y, H - Y));
  };

  const layout = (p, splashP) => {
    const ox = X, oy = Y + originDrop * H * (1 - p);
    u.uOrigin.value = [ox, oy];
    u.uUp.value = 1 + (upSquash - 1) * (1 - smooth(clamp01((p - upRelease) / Math.max(0.01, 1 - upRelease))));
    drops.forEach((d, k) => {
      let x = ox, y = oy, r = 0;
      if (d.kind === 'main') {
        const g = smooth(clamp01((p - d.a * 0.08) / 0.92)) ** 1.15;
        const off = k === 0 ? 0 : R * (0.03 + d.b * 0.05) * (1 - p);
        x += Math.cos(d.dir) * off; y += Math.sin(d.dir) * off;
        r = (k === 0 ? R * 1.3 : R * (0.32 + d.c * 0.18)) * g;
      } else if (d.kind === 'medium') {
        // trayectoria curva: sale, se estira (hilo con el cuerpo) y vuelve parcialmente
        const t = clamp01((p - d.a * 0.12) / 0.8);
        const out = Math.sin(Math.PI * Math.min(1, t * 1.1)) ** 0.8 * (1 - 0.55 * t) + 0.25 * t;
        const ang = d.dir + d.curve * t;
        const dist = R * (0.18 + d.b * 0.26) * viscosity * out;
        x += Math.cos(ang) * dist; y += Math.sin(ang) * dist;
        r = R * (0.045 + d.c * 0.07) * smooth(clamp01(p / 0.3)) * (1 + 0.6 * p);
      } else {
        const t = clamp01((splashP - d.a * 0.1) / 0.45);
        const ang = d.dir + d.curve * 0.4 * t;
        const dist = R * (0.3 + d.b * 0.5) * easeOut(t);
        x += Math.cos(ang) * dist; y += Math.sin(ang) * dist;
        r = Math.max(minR, R * (0.014 + d.c * 0.022)) * Math.min(1, splashP / 0.08);
      }
      // Sin puntos sueltos: gotas desprendidas por debajo de --types-drop-min (radio) no se dibujan; las del cuerpo sí
      if (d.kind !== 'main' && r < minR) r = 0;
      balls[k * 3] = x; balls[k * 3 + 1] = y; balls[k * 3 + 2] = Math.max(0, r);
    });
  };

  let s = 0, target = 0, raf = 0, last = 0, visible = false, time = 0, idleKey = -1, wasFull = false;
  const tick = (now) => {
    const dt = Math.min(0.1, (now - (last || now)) / 1000);
    last = now;
    time += dt * flow;
    s += (target - s) * (1 - Math.exp((-dt * 3) / Math.max(0.05, scrub)));
    if (Math.abs(target - s) < 0.0003) s = target;
    const idle = s === target && (s === 0 || s === 1 || s === 2); // vacío o cubierto: no hay borde que animar
    // Completo: el canvas se oculta y queda el azul por CSS (.types__paint.is-full); vuelve al empezar el despintado
    const full = s >= 0.999 && s <= 1.001;
    if (full !== wasFull) {
      wasFull = full;
      paint.classList.toggle('is-full', full);
      gl.canvas.style.visibility = full ? 'hidden' : '';
    }
    u.uSolid.value = full ? 1 : 0;
    if (!full && (!idle || idleKey !== s)) {
      const p = s <= 1 ? s : 2 - s;
      const sp = s <= 1 ? s : clamp01(2 - s) ** 0.5; // salida: salpicaduras quedan atrás un instante
      layout(p, sp);
      u.uTime.value = time;
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
    /** paint: 0→1 entrada · exit: 0→1 despintado de las gotas */
    update({ paint: pv, exit }) { target = exit > 0 ? 1 + exit : pv; },
    refresh: measure,
  };
}
