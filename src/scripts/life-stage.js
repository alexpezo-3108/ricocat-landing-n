// Etapas de vida: entrada al verse, CTA → selector de tiendas, y cambio de sabor (si hay varios).
export function initLifeStages() {
  document.querySelectorAll('[data-stage]').forEach(setup);
  initStageCards(document.getElementById('etapas'));
}

/**
 * Patrón "tarjeta que sube por encima" entre etapas (.stages--cards): cada etapa es sticky (top 0, 100svh);
 * la siguiente sube a velocidad normal y la tapa. Por tarjeta: --rise (0→1 mientras sube: esquinas + sombra superior)
 * y en la anterior --under (0→1: se encoge y oscurece). Sin efecto con prefers-reduced-motion.
 */
function initStageCards(container) {
  if (!container) return;
  const cards = [...container.querySelectorAll(':scope > .stage')];
  if (cards.length < 2) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  let frame = 0;
  let visible = false;

  // Oscurecimiento por tarjeta (dentro de la tarjeta de color)
  cards.forEach((section) => {
    const card = section.querySelector('.stage__card');
    if (!card) return;
    const dim = document.createElement('span');
    dim.className = 'stage__dim';
    dim.setAttribute('aria-hidden', 'true');
    card.append(dim);
  });

  const update = () => {
    frame = 0;
    const vh = window.innerHeight;
    cards.forEach((card, i) => {
      const p = clamp01((vh - card.getBoundingClientRect().top) / vh);
      card.style.setProperty('--rise', p.toFixed(4));
      if (i > 0) cards[i - 1].style.setProperty('--under', p.toFixed(4));
    });
  };
  const request = () => { if (visible && !reduced.matches && !frame) frame = requestAnimationFrame(update); };
  const apply = () => {
    const on = !reduced.matches;
    container.classList.toggle('stages--cards', on);
    if (on) update();
    else cards.forEach((c) => { c.style.removeProperty('--rise'); c.style.removeProperty('--under'); });
  };

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; request(); }).observe(container);
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  reduced.addEventListener('change', apply);
  apply();
}

function setup(section) {
  const flavors = [...section.querySelectorAll('[data-flavor]')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const label = section.querySelector('[data-flavor-count]');
  let index = 0;
  let busy = false;
  // El JS es dueño del estado: data-active manda (no depende de que el atributo hidden sobreviva al render).
  flavors.forEach((f, i) => { f.dataset.active = String(i === 0); f.hidden = i !== 0; });

  new IntersectionObserver(([entry]) => {
    if (entry.intersectionRatio >= 0.2) section.classList.add('is-visible');
    else if (!entry.isIntersecting) section.classList.remove('is-visible');
  }, { threshold: [0, 0.2] }).observe(section);

  // "Ver producto": el selector de tiendas (otra tarea) escucha este evento.
  section.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-store-trigger]');
    if (!trigger) return;
    trigger.dispatchEvent(new CustomEvent('stores:open', {
      bubbles: true,
      detail: { stores: trigger.dataset.stores, stage: trigger.dataset.stage, flavor: trigger.dataset.flavorId },
    }));
  });

  if (flavors.length < 2) return;

  const css = (name) => getComputedStyle(section).getPropertyValue(name).trim();
  const ms = (name) => parseFloat(css(name)) || 0;
  const card = section.querySelector('.stage__card');
  const BIG = 4000; // lados del recorte que no se limitan

  // Precarga: las imágenes de sabores ocultos son lazy y no cargarían hasta mostrarse.
  const imgsOf = (flavor) => [...flavor.querySelectorAll('img')];
  const preload = () => {
    [index - 1, index + 1].forEach((i) => {
      imgsOf(flavors[(i + flavors.length) % flavors.length]).forEach((img) => { img.loading = 'eager'; });
    });
  };
  preload();
  const ready = (flavor) => Promise.race([
    Promise.all(imgsOf(flavor).map((img) => { img.loading = 'eager'; return img.decode().catch(() => {}); })),
    new Promise((r) => setTimeout(r, 400)),
  ]);

  const setLabel = () => {
    if (label) label.textContent = `Sabor ${index + 1} de ${flavors.length}: ${flavors[index].querySelector('.stage__flavor-name')?.textContent.trim() ?? ''}`;
  };

  const show = async (next, dir) => {
    busy = true;
    const current = flavors[index];
    const incoming = flavors[next];
    const swapState = () => {
      current.hidden = true;
      current.dataset.active = 'false';
      incoming.hidden = false;
      incoming.dataset.active = 'true';
      section.dataset.palette = incoming.dataset.palette;
      index = next;
      setLabel();
      preload();
    };
    if (reduced.matches) { swapState(); busy = false; return; }

    await ready(incoming);
    section.classList.add('has-swapped');
    card.style.backgroundColor = getComputedStyle(card).backgroundColor; // el fondo viejo queda debajo del barrido
    incoming.hidden = false;
    incoming.dataset.active = 'true';
    section.dataset.palette = incoming.dataset.palette; // título fijo, beneficios y flechas cambian de color

    const wipe = document.createElement('div');
    wipe.className = 'stage__wipe';
    wipe.dataset.palette = incoming.dataset.palette;
    wipe.setAttribute('aria-hidden', 'true');
    card.prepend(wipe);

    const c = card.getBoundingClientRect();
    const W = c.width;
    const dur = ms('--stage-swap-dur');
    const pDur = ms('--stage-swap-parallax-dur');
    const easing = css('--stage-swap-ease') || 'ease-in-out';
    const f = (name) => parseFloat(css(name)) || 0;
    const sign = dir > 0 ? 1 : -1; // siguiente: entra desde la derecha
    const [e0, e1] = dir > 0 ? [W, 0] : [0, W]; // posición del borde del barrido
    const anims = [];
    const run = (el, frames, opts) => anims.push(el.animate(frames, { duration: dur, easing, fill: 'both', ...opts }));
    const inset = (l, r) => `inset(-${BIG}px ${r}px -${BIG}px ${l}px)`;

    // Recorte en coordenadas de la tarjeta: el borde de todas las capas coincide en cada frame.
    const clip = (el, isIncoming) => {
      const r = el.getBoundingClientRect();
      const L = r.left - c.left;
      const Rr = r.right - c.left;
      const showRight = (dir > 0) === isIncoming; // la parte visible está a la derecha del borde
      const at = (e) => (showRight ? inset(e - L, -BIG) : inset(-BIG, Rr - e));
      run(el, [{ clipPath: at(e0) }, { clipPath: at(e1) }]);
    };
    clip(wipe, true);
    [incoming, current].forEach((flavor) => {
      flavor.querySelectorAll('.stage__art, .stage__info').forEach((el) => clip(el, flavor === incoming));
    });

    const shift = (el, from, to, opts) => run(el, [{ transform: `translateX(${from}px)` }, { transform: `translateX(${to}px)` }], opts);
    // Saliente: se va hacia el lado contrario al que entra el barrido.
    current.querySelectorAll('.stage__item, .stage__kibble').forEach((el) => {
      const k = el.classList.contains('stage__kibble') ? 1.5 : 1;
      shift(el, 0, -sign * W * f('--stage-swap-shift-out') * k);
    });
    current.querySelectorAll('.stage__info > *').forEach((el) => shift(el, 0, -sign * W * f('--stage-swap-shift-text')));
    // Entrante: parallax por capas (bodegón → gato → croquetas, más rápidas y desfasadas).
    incoming.querySelectorAll('.stage__item').forEach((el) => {
      const isCat = el.classList.contains('stage__item--cat');
      shift(el, sign * W * f(isCat ? '--stage-swap-shift-cat' : '--stage-swap-shift-bag'), 0,
        { duration: pDur, delay: isCat ? ms('--stage-swap-cat-delay') : 0 });
    });
    incoming.querySelectorAll('.stage__kibble').forEach((el, i) => {
      shift(el, sign * W * f('--stage-swap-shift-kibble') * (1 + (i % 2) * 0.25), 0,
        { duration: pDur, delay: ms('--stage-swap-kibble-delay') + i * ms('--stage-swap-kibble-stagger') });
    });
    incoming.querySelectorAll('.stage__info > *').forEach((el, i) => {
      shift(el, sign * W * f('--stage-swap-shift-text'), 0, { duration: pDur, delay: i * 40 });
    });

    await Promise.all(anims.map((a) => a.finished.catch(() => {})));
    current.hidden = true;
    current.dataset.active = 'false';
    card.style.backgroundColor = '';
    wipe.remove();
    anims.forEach((a) => a.cancel());
    index = next;
    setLabel();
    preload();
    busy = false;
  };

  const step = (dir) => {
    if (busy) return;
    show((index + dir + flavors.length) % flavors.length, dir); // del último vuelve al primero, misma dirección
  };

  section.querySelectorAll('[data-flavor-step]').forEach((button) => {
    button.addEventListener('click', () => step(Number(button.dataset.flavorStep)));
  });

  // Teclado: ← / → con el foco en el selector.
  section.querySelector('.stage__picker')?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
  });

  // Swipe horizontal (táctil) sobre la tarjeta.
  let start = null;
  card.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch') start = { x: event.clientX, y: event.clientY };
  });
  card.addEventListener('pointerup', (event) => {
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    start = null;
    if (Math.abs(dx) >= (ms('--stage-swipe-min') || 40) && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
  });
  card.addEventListener('pointercancel', () => { start = null; });
}
