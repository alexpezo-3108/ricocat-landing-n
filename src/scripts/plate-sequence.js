/**
 * PLATO: secuencia 3D (public/plate-seq/bowl_0001…0187.webp, 960×984; versión liviana 640×656 en plate-seq/m/)
 * dibujada en un <canvas> dentro de [data-plate], ligada al mismo reloj de scroll que food-types.js.
 *
 * KEYS: por momento, [desplazamiento en pantallas desde el inicio del momento, frame real].
 * Entre puntos se interpola. Negativos = arranca durante la transición desde el momento anterior.
 * Frames (376): 1–60 entrada/ · 61–120 seco/ · 121–236 humedo/ · 237–266 vuelta/ · 267–311 mix/ ·
 * 312–326 bowl_0151–0165 (mix quieto) · 327–376 salida/.
 */
// Suavizado: BLEND mezcla frames vecinos; SMOOTH = cuánto se acerca al frame objetivo por cuadro (0–1, menor = más suave)
const BLEND = false;
const SMOOTH = 0.3;
const KEYS = {
  entrada: [[0, 1], [0.7, 60]],
  seco:    [[-0.35, 61], [-0.25, 68], [0.3, 108], [1.82, 120]],
  humedo:  [[-0.35, 120], [0.1, 151], [0.5, 198], [1.98, 236], [2.3, 266]],
  mix:     [[0, 266], [0.36, 311], [1.49, 325]],
  salida:  [[-0.25, 327], [0.6, 376]],
};
const MOMENTS = ['entrada', 'seco', 'humedo', 'mix', 'salida'];
const PARALLEL = 6;
const pad = (n) => String(n).padStart(4, '0');
// Tramo seco re-renderizado: frames 25–84 = seco/seco_0001…0060; desde 85 sigue bowl_0073… (desfase +12)
// Tramos re-renderizados: 25–84 = seco/seco_0001…0060 · 85–200 = humedo/humedo_0001…0116 (reemplaza bowl_0073…0118) · 201+ = bowl_0119…
const SEGS = [
  { from: 1,   len: 60,  name: (k) => `entrada/entrada_${pad(k)}.webp` },
  { from: 61,  len: 60,  name: (k) => `seco/seco_${pad(k)}.webp` },
  { from: 121, len: 116, name: (k) => `humedo/humedo_${pad(k)}.webp` },
  { from: 237, len: 30,  name: (k) => `vuelta/vuelta_${pad(k)}.webp` },
  { from: 267, len: 45,  name: (k) => `mix/mix_${pad(k)}.webp` },
  { from: 312, len: 15,  name: (k) => `bowl_${pad(k + 150)}.webp` },
  { from: 327, len: 50,  name: (k) => `salida/salida_${pad(k)}.webp` },
];
const framePath = (i) => {
  const seg = SEGS.find((g) => i >= g.from && i < g.from + g.len) || SEGS[SEGS.length - 1];
  return seg.name(Math.min(seg.len, i - seg.from + 1));
};

// Orden de carga: primero cada 8 frames, luego cada 4, 2 y el resto → la secuencia es "jugable" enseguida
const loadOrder = (count) => {
  const seen = new Set();
  const out = [];
  [8, 4, 2, 1].forEach((step) => {
    for (let i = 1; i <= count; i += step) if (!seen.has(i)) { seen.add(i); out.push(i); }
  });
  if (!seen.has(count)) out.push(count);
  return out;
};

export function createPlate(el) {
  if (!el) return { update() {} };
  const root = el.dataset.plateSeq;
  if (!root) return { update() {} };

  const count = Number(el.dataset.plateFrames) || 269;
  const mobile = window.matchMedia('(max-width: 767px)').matches;
  const base = mobile ? `${root}m/` : root;

  const canvas = document.createElement('canvas');
  canvas.className = 'types__plate-seq';
  canvas.width = mobile ? 640 : 960;
  canvas.height = mobile ? 656 : 984;
  el.append(canvas);
  const ctx = canvas.getContext('2d');

  const frames = new Array(count + 1); // ImageBitmap o <img> ya decodificado
  let started = false;
  let current = 1;
  let drawn = 0;

  const nearestReady = (n) => {
    for (let d = 0; d < count; d += 1) {
      if (frames[n - d]) return n - d;
      if (frames[n + d]) return n + d;
    }
    return 0;
  };

  // Frame fraccionario: mezcla el frame actual con el siguiente (cross-fade) para suavizar tramos con pocos frames
  let shown = 0, target = 0, raf = 0, lastKey = '';
  const paint = (f) => {
    const a = Math.floor(f), mix = BLEND ? f - a : 0;
    current = Math.round(f);
    const ka = nearestReady(a), kb = mix > 0.02 ? nearestReady(a + 1) : 0;
    if (!ka) return;
    const key = ka + ':' + (kb && kb !== ka ? kb + ':' + mix.toFixed(2) : '');
    if (key === lastKey) return;
    lastKey = key; drawn = ka;
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(frames[ka], 0, 0, canvas.width, canvas.height);
    if (kb && kb !== ka) { ctx.globalAlpha = mix; ctx.drawImage(frames[kb], 0, 0, canvas.width, canvas.height); ctx.globalAlpha = 1; }
    el.classList.add('has-seq');
  };
  const tick = () => {
    const d = target - shown;
    shown = Math.abs(d) < 0.01 ? target : shown + d * SMOOTH;
    paint(shown);
    raf = shown !== target ? requestAnimationFrame(tick) : 0;
  };
  const draw = (n) => {
    target = n;
    if (!shown || Math.abs(target - shown) > 40) shown = target;
    if (!raf) raf = requestAnimationFrame(tick);
  };

  // Decodifica fuera del scroll (createImageBitmap / img.decode) para que dibujar sea instantáneo
  const load = async (i) => {
    try {
      const img = new Image();
      img.decoding = 'async';
      img.src = `${base}${framePath(i)}`;
      await img.decode();
      frames[i] = 'createImageBitmap' in window ? await createImageBitmap(img) : img;
      if (!drawn || Math.abs(i - current) < Math.abs(drawn - current)) { lastKey = ''; drawn = drawn || 0; paint(shown || target || 1); }
    } catch (e) { /* frame faltante: se usa el más cercano */ }
  };

  const start = async () => {
    if (started) return;
    started = true;
    const queue = loadOrder(count);
    const worker = async () => { while (queue.length) await load(queue.shift()); };
    await Promise.all(Array.from({ length: PARALLEL }, worker));
  };
  const section = el.closest('[data-types]') || el;
  new IntersectionObserver(([e], io) => {
    if (e.isIntersecting) { start(); io.disconnect(); }
  }, { rootMargin: '200% 0px' }).observe(section);

  const frameAt = (t, starts) => {
    const pts = [];
    MOMENTS.forEach((m, i) => KEYS[m].forEach(([dt, f]) => pts.push([starts[i] + dt, Math.min(count, f)])));
    if (t <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i += 1) {
      const [t1, f1] = pts[i];
      const [t0, f0] = pts[i - 1];
      if (t <= t1) return f0 + (f1 - f0) * ((t - t0) / Math.max(0.0001, t1 - t0));
    }
    return pts[pts.length - 1][1];
  };

  return {
    update(state) {
      el.style.setProperty('--plate-progress', state.progress.toFixed(4));
      el.dispatchEvent(new CustomEvent('plate:progress', { detail: state }));
      if (!state.starts) return;
      const n = Math.min(count, Math.max(1, frameAt(state.t, state.starts)));
      if (n !== target || !drawn) draw(n);
    },
  };
}
