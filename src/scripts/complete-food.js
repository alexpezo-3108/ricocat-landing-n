// Sección 03: animaciones solo mientras está visible, huellas al azar y parallax de las fotos.
export function initCompleteFood() {
  document.querySelectorAll('[data-food]').forEach(setup);
}

const rand = (min, max) => min + Math.random() * (max - min);

function setup(section) {
  const table = section.querySelector('.food__table');
  const pawLayer = section.querySelector('.food__paws');
  const cards = [...section.querySelectorAll('.food__card')];
  const template = section.querySelector('[data-paw]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let pool = [];
  let timer = null;
  let step = 0;
  let visible = false;

  const vars = () => {
    const s = getComputedStyle(section);
    return {
      count: Math.max(1, parseInt(s.getPropertyValue('--food-paw-count'), 10) || 4),
      interval: parseFloat(s.getPropertyValue('--food-paw-step')) || 900,
      ease: parseFloat(s.getPropertyValue('--food-parallax-ease')) || 0.08,
    };
  };

  /* ---------- Huellas al azar dentro de la mesa, sin quedar ocultas tras las fotos ---------- */
  const cardBoxes = () => {
    const w = table.offsetWidth;
    const h = table.offsetHeight;
    return cards.map((card) => ({
      x1: (card.offsetLeft / w) * 100 - 2,
      y1: (card.offsetTop / h) * 100 - 2,
      x2: ((card.offsetLeft + card.offsetWidth) / w) * 100 + 2,
      y2: ((card.offsetTop + card.offsetHeight) / h) * 100 + 2,
    }));
  };

  const pickSpot = (others) => {
    const boxes = cardBoxes();
    let best = null;
    for (let i = 0; i < 40; i += 1) {
      const spot = { x: rand(8, 92), y: rand(4, 92) };
      const hidden = boxes.some((b) => spot.x > b.x1 && spot.x < b.x2 && spot.y > b.y1 && spot.y < b.y2);
      const crowded = others.some((o) => Math.hypot(o.x - spot.x, o.y - spot.y) < 12);
      if (!hidden && !crowded) return spot;
      if (!hidden) best = spot;
    }
    return best ?? { x: rand(8, 92), y: rand(4, 10) };
  };

  const buildPool = () => {
    const { count } = vars();
    pool.forEach((paw) => paw.remove());
    pool = Array.from({ length: count }, () => {
      const paw = template.cloneNode(true);
      paw.removeAttribute('data-paw-rest');
      paw.classList.remove('food__paw--rest', 'is-on');
      paw.dataset.pawRandom = '';
      pawLayer.append(paw);
      return paw;
    });
    // Las huellas fijas (sin JS / movimiento reducido) se ocultan mientras corre el azar.
    section.querySelectorAll('[data-paw-rest]').forEach((paw) => paw.classList.remove('is-on'));
  };

  const movePaw = () => {
    const paw = pool[step % pool.length];
    step += 1;
    paw.classList.remove('is-on');
    setTimeout(() => {
      const others = pool.filter((p) => p !== paw && p.classList.contains('is-on'))
        .map((p) => ({ x: parseFloat(p.style.getPropertyValue('--x')), y: parseFloat(p.style.getPropertyValue('--y')) }));
      const spot = pickSpot(others);
      paw.style.setProperty('--x', `${spot.x.toFixed(1)}%`);
      paw.style.setProperty('--y', `${spot.y.toFixed(1)}%`);
      paw.classList.add('is-on');
    }, 450);
  };

  const showRest = () => {
    pool.forEach((paw) => paw.classList.remove('is-on'));
    section.querySelectorAll('[data-paw-rest]').forEach((paw) => paw.classList.add('is-on'));
  };

  const startPaws = () => {
    if (timer || !template) return;
    if (reduced.matches) return showRest();
    if (!pool.length) buildPool();
    pool.forEach((paw, i) => setTimeout(movePaw, i * 200));
    timer = setInterval(movePaw, vars().interval);
  };

  const stopPaws = () => {
    clearInterval(timer);
    timer = null;
  };

  /* ---------- Parallax suave de las fotos con el cursor ---------- */
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  let frame = 0;

  const tick = () => {
    const { ease } = vars();
    current.x += (target.x - current.x) * ease;
    current.y += (target.y - current.y) * ease;
    section.style.setProperty('--px', current.x.toFixed(4));
    section.style.setProperty('--py', current.y.toFixed(4));
    const settled = Math.abs(target.x - current.x) < 0.001 && Math.abs(target.y - current.y) < 0.001;
    frame = settled ? 0 : requestAnimationFrame(tick);
  };

  const kick = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };

  section.addEventListener('pointermove', (event) => {
    if (!visible || reduced.matches || !finePointer.matches || event.pointerType !== 'mouse') return;
    const rect = table.getBoundingClientRect();
    target.x = Math.max(-1, Math.min(1, (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)));
    target.y = Math.max(-1, Math.min(1, (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)));
    kick();
  });

  section.addEventListener('pointerleave', () => {
    target.x = 0;
    target.y = 0;
    kick();
  });

  /* ---------- Visibilidad ---------- */
  new IntersectionObserver(([entry]) => {
    if (entry.intersectionRatio >= 0.2) {
      visible = true;
      section.classList.add('is-visible');
      startPaws();
    } else if (!entry.isIntersecting) {
      visible = false;
      section.classList.remove('is-visible');
      stopPaws();
    }
  }, { threshold: [0, 0.2] }).observe(section);

  reduced.addEventListener('change', () => {
    stopPaws();
    if (visible) startPaws();
  });
}
