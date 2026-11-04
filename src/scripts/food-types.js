// 04 Tipos de alimento: progreso del scroll → estado de cada elemento (--s) y del plato.
import { createPlate } from './plate-sequence.js';
import { initTypesPaint } from './types-paint.js';

const MOMENTS = ['entrada', 'seco', 'humedo', 'mix', 'salida'];
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const easeOut = (u) => 1 - (1 - u) ** 3;
const easeIn = (u) => u ** 3;
const smooth = (u) => u * u * (3 - 2 * u);
const backOut = (u, c) => 1 + (c + 1) * (u - 1) ** 3 + c * (u - 1) ** 2;

export function initFoodTypes() {
  document.querySelectorAll('[data-types]').forEach(setup);
}

function setup(section) {
  const stage = section.querySelector('.types__stage');
  const plate = createPlate(section.querySelector('[data-plate]'));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const items = [...section.querySelectorAll('[data-types-anim]')].map((el) => ({
    el,
    group: el.dataset.group,
    role: el.classList.contains('types__anim--lead') ? 'lead' : 'pop',
    value: NaN,
  }));
  // Orden de brote por momento (orden del DOM).
  ['seco', 'humedo', 'mix'].forEach((group) => {
    const pops = items.filter((item) => item.group === group && item.role === 'pop');
    pops.forEach((item, i) => { item.index = i; item.count = pops.length; });
  });
  // Capa que "pinta" el azul desde el plato (círculo) y enciende el patrón en ondas (máscara radial)
  const paint = document.createElement('div');
  paint.className = 'types__paint';
  paint.setAttribute('aria-hidden', 'true');
  stage.prepend(paint);
  const platePin = section.querySelector('.types__pin--plate');
  // Línea punteada que baja hasta el plato y dispara el pintado (revelada con clip, los trazos no se deslizan)
  const line = document.createElement('div');
  line.className = 'types__line';
  line.setAttribute('aria-hidden', 'true');
  line.innerHTML = '<svg class="types__line-svg" preserveAspectRatio="none"><line x1="50%" y1="0" x2="50%" y2="100%" /></svg><span class="types__line-tip"></span>';
  paint.before(line); // debajo de la pintura: el azul la "borra" al pintarse

  let cfg = null;
  let paintCtl = null;
  let frame = 0;
  let visible = false;

  const readConfig = () => {
    const styles = getComputedStyle(section);
    const num = (name, fallback) => {
      const v = parseFloat(styles.getPropertyValue(name));
      return Number.isFinite(v) ? v : fallback;
    };
    const lens = MOMENTS.map((m) => num(`--types-len-${m}`, 1));
    const starts = [];
    lens.reduce((acc, len, i) => { starts[i] = acc; return acc + len; }, 0);
    cfg = {
      lens,
      starts,
      total: lens.reduce((a, b) => a + b, 0),
      hold: clamp01(num('--types-hold', 0.5)),
      drift: num('--types-drift', 0.08),
      overlap: num('--types-overlap', 0.35),
      popDur: num('--types-pop-dur', 0.2),
      popStagger: num('--types-pop-stagger', 0.07),
      bounce: num('--types-pop-bounce', 1.7),
      plateY: MOMENTS.map((m) => num(`--plate-y-${m}`, 0)),
      cover: num('--types-cover', 1), // tramo final reservado para que #etapas tape el escenario
      paintAfter: num('--types-paint-after', 0.15),
      lineReach: num('--types-line-reach', 0.6),
      lineRetract: num('--types-line-retract', 0.35),
      waveLen: num('--types-wave-len', 0.25),
      exitStart: num('--types-exit-start', 0.35),
      exitEnd: num('--types-exit-end', 1),
      exitPlate: num('--types-exit-plate', 1.1),
      plateZoom: num('--types-plate-zoom', 1.7),
      plateZoomMobile: num('--types-plate-zoom-mobile', 1.5),
      zoomFrom: num('--types-plate-zoom-from', 0.25),
      zoomTo: num('--types-plate-zoom-to', 1),
      patternSpeed: num('--types-pattern-speed', 0.35),
      patternHold: num('--types-pattern-hold', 0.35),
      waveStart: num('--types-wave-start', 0.5),
      waveEnd: num('--types-wave-end', 0.92),
      waveFeather: num('--types-wave-feather', 180),
      wavePop: num('--types-wave-pop', 0.06),
    };
  };

  // Ventanas de un momento: la tarjeta sube y se asienta → brotan los pops → pausa de lectura
  // → se van los pops (orden inverso) → la tarjeta sigue subiendo y sale.
  const windows = (group) => {
    const i = MOMENTS.indexOf(group);
    const start = cfg.starts[i];
    const len = cfg.lens[i];
    const ramp = ((1 - cfg.hold) / 2) * len;
    return {
      enterStart: start - cfg.overlap,
      enterEnd: start + ramp,
      exitStart: start + len - ramp,
      exitEnd: start + len + cfg.overlap,
    };
  };

  const leadState = (t, w) => {
    if (t <= w.enterStart) return -1;
    if (t < w.enterEnd) return -1 + (1 - cfg.drift) * easeOut((t - w.enterStart) / (w.enterEnd - w.enterStart));
    if (t < w.exitStart) return -cfg.drift + 2 * cfg.drift * ((t - w.enterEnd) / (w.exitStart - w.enterEnd));
    if (t < w.exitEnd) return cfg.drift + (1 - cfg.drift) * easeIn((t - w.exitStart) / (w.exitEnd - w.exitStart));
    return 1;
  };

  const popState = (t, w, index, count) => {
    // Si la pausa es corta, se comprimen duraciones y desfases para que entrar y salir no se crucen.
    const room = (w.exitStart - w.enterEnd) / 2;
    const needed = cfg.popDur + cfg.popStagger * (count - 1);
    const k = needed > room ? room / needed : 1;
    const dur = cfg.popDur * k;
    const stag = cfg.popStagger * k;
    const inStart = w.enterEnd + index * stag;
    const outEnd = w.exitStart - index * stag; // el último en brotar es el primero en irse
    if (t <= inStart || t >= outEnd) return 0;
    if (t < inStart + dur) return backOut((t - inStart) / dur, cfg.bounce);
    if (t > outEnd - dur) return backOut((outEnd - t) / dur, cfg.bounce);
    return 1;
  };

  // El plato cambia de posición/imagen solo alrededor de cada frontera entre momentos.
  const plateState = (t) => {
    for (let k = 0; k < MOMENTS.length - 1; k += 1) {
      const border = cfg.starts[k + 1];
      if (t < border - cfg.overlap) return { from: k, to: k, blend: 0 };
      if (t <= border + cfg.overlap) return { from: k, to: k + 1, blend: smooth((t - (border - cfg.overlap)) / (2 * cfg.overlap)) };
    }
    const last = MOMENTS.length - 1;
    return { from: last, to: last, blend: 0 };
  };

  // Centro del plato dentro del escenario: origen de los blobs (types-paint.js) y de la máscara del patrón
  let lastPaint = '';
  const renderPaint = () => {
    const sr = stage.getBoundingClientRect();
    const pr = platePin.getBoundingClientRect();
    const key = `${(pr.left - sr.left).toFixed(1)}|${(pr.top - sr.top).toFixed(1)}`;
    if (key === lastPaint) return;
    lastPaint = key;
    paint.style.setProperty('--paint-x', `${(pr.left - sr.left).toFixed(1)}px`);
    paint.style.setProperty('--paint-y', `${(pr.top - sr.top).toFixed(1)}px`);
  };

  // Avance del patrón (sensación de bajar): integral de la velocidad, más lenta durante la pausa de cada momento
  const patternTravel = (t) => {
    const holds = ['seco', 'humedo', 'mix'].map((g) => { const w = windows(g); return [w.enterEnd, w.exitStart]; });
    const steps = 240;
    const dt = t / steps;
    let d = 0;
    for (let s = 0; s < steps; s += 1) {
      const m = (s + 0.5) * dt;
      d += (holds.some(([a, b]) => m > a && m < b) ? cfg.patternHold : 1) * dt;
    }
    return d;
  };

  const render = () => {
    frame = 0;
    const rect = section.getBoundingClientRect();
    renderPaint();
    const sequence = rect.height - window.innerHeight - cfg.cover * stage.offsetHeight;
    const progress = clamp01(-rect.top / Math.max(1, sequence));
    const t = progress * cfg.total;
    // Pintado ligado al scroll (scrub en types-paint.js). d = px recorridos desde que la sección asoma por abajo.
    const vh = window.innerHeight;
    const d = vh - rect.top;
    // 1) La línea baja hasta el borde superior del plato; 2) al tocarlo empieza el pintado (mismo scroll, sin huecos)
    const sr = stage.getBoundingClientRect();
    // La línea termina en el centro del plato: se pierde detrás de él (el plato está por encima)
    const plateTop = Math.max(0, platePin.getBoundingClientRect().top - sr.top);
    // La punta avanza visible: llega al plato cuando el centro del plato está a --types-line-reach de la altura del viewport
    const lineEnd = Math.max(1, vh - (cfg.lineReach * vh - plateTop));
    const lineU = clamp01(d / lineEnd);
    const paintEnd = Math.max(lineEnd + 1, vh * (1 + cfg.paintAfter));
    const paintU = clamp01((d - lineEnd) / (paintEnd - lineEnd));
    const retract = 0; // sin salida: la línea se queda
    line.style.setProperty('--line-x', `${(platePin.getBoundingClientRect().left - sr.left).toFixed(1)}px`);
    line.style.setProperty('--line-h', `${plateTop.toFixed(1)}px`);
    line.style.setProperty('--line-l', `${(plateTop * lineU * (1 - retract)).toFixed(1)}px`);
    line.classList.toggle('is-off', lineU <= 0 || paintU >= 1); // se borra al quedar el fondo pintado
    const free = rect.top <= 0;
    const waveU = clamp01((d - paintEnd) / Math.max(1, cfg.waveLen * vh));
    const salida = MOMENTS.length - 1;
    const x0 = cfg.starts[salida] + cfg.exitStart * cfg.lens[salida];
    const x1 = cfg.starts[salida] + cfg.exitEnd * cfg.lens[salida];
    // Sin despintado de salida: el azul (y su patrón) se mantiene hasta que Gatitos sube por encima
    const exitU = 0; void x0; void x1;
    const stickyP = clamp01((vh - lineEnd) / (paintEnd - lineEnd)); // progreso del pintado al quedar sticky
    paintCtl?.update({ paint: paintU, wave: waveU, exit: exitU, free, travel: d, stickyP });
    section.classList.toggle('is-exit', exitU > 0);
    // Plato: se reduce en el mismo tramo del pintado (frenando) y crece levemente al despintarse
    // Desde que el plato asoma (--types-plate-zoom-from) hasta que empieza Entrada (sección arriba), frenando (power2.out)
    const zU = clamp01((d / vh - cfg.zoomFrom) / Math.max(0.01, cfg.zoomTo - cfg.zoomFrom));
    const zoom = window.innerWidth < 768 ? cfg.plateZoomMobile : cfg.plateZoom;
    const plateZoom = 1 + (zoom - 1) * (1 - zU) ** 2;
    stage.style.setProperty('--plate-zoom', plateZoom.toFixed(4));
    stage.style.setProperty('--plate-exit', (1 + (cfg.exitPlate - 1) * smooth(exitU)).toFixed(4));
    // t en "pantallas" de scroll → px; el patrón sube (posición negativa) a --types-pattern-speed del scroll
    paint.style.setProperty('--pattern-y', `${(-patternTravel(t) * window.innerHeight * cfg.patternSpeed).toFixed(1)}px`);

    items.forEach((item) => {
      const w = windows(item.group);
      const value = item.role === 'lead' ? leadState(t, w) : popState(t, w, item.index, item.count);
      if (Math.abs(value - item.value) < 0.0005) return;
      item.value = value;
      if (item.role === 'lead') {
        item.el.style.setProperty('--s', value.toFixed(4));
        item.el.style.setProperty('--a', Math.abs(value).toFixed(4));
      } else {
        item.el.style.setProperty('--pop', value.toFixed(4));
      }
    });

    const { from, to, blend } = plateState(t);
    const y = cfg.plateY[from] + (cfg.plateY[to] - cfg.plateY[from]) * blend;
    stage.style.setProperty('--plate-y', y.toFixed(2));
    const moment = MOMENTS[blend < 0.5 ? from : to];
    stage.dataset.moment = moment;
    plate.update({ progress, t, starts: cfg.starts, lens: cfg.lens, moment, from: MOMENTS[from], to: MOMENTS[to], blend });
    // Gancho para el elemento 3D: mismo reloj que el resto de la sección (ver docs/scroll-timeline-04.md)
    section.dispatchEvent(new CustomEvent('types:progress', { detail: {
      approach: clamp01(d / vh), t, total: cfg.total, progress, moment,
      from: MOMENTS[from], to: MOMENTS[to], blend, plateZoom, plateY: y, line: lineU, paint: paintU, wave: waveU,
    } }));
  };

  const isLive = () => section.classList.contains('types--live');
  const request = () => {
    if (visible && isLive() && !frame) frame = requestAnimationFrame(render);
  };

  const setLive = () => {
    const live = !reduced.matches;
    section.classList.toggle('types--live', live);
    if (live) {
      readConfig();
      render();
      paintCtl ??= initTypesPaint({ section, stage, paint, platePin });
      return;
    }
    items.forEach((item) => {
      ['--s', '--a', '--pop'].forEach((prop) => item.el.style.removeProperty(prop));
      item.value = NaN;
    });
    stage.style.removeProperty('--plate-y');
  };

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    request();
  }).observe(section);

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', () => {
    if (!isLive()) return;
    readConfig();
    request();
  });
  reduced.addEventListener('change', setLive);
  setLive();
}
