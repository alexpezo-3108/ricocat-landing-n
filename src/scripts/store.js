import { products, STAGES, FORMATS, FLAVORS, PAGE_SIZE, labelOf } from '../data/products.js';

/**
 * "Elige tu Ricocat": filtros combinables (etapa + formato + sabor en Adultos), paginación de 8 en 8,
 * entrada tipo "cartas repartidas" y reordenamiento FLIP. Todo animado con transform/opacity (WAAPI).
 * "Ver producto" emite `ricocat:where-to-buy` en document con { product } para el selector "Dónde comprar".
 */

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function readMotion(el) {
  const cs = getComputedStyle(el);
  const v = (name, fallback) => {
    const raw = cs.getPropertyValue(name).trim();
    if (!raw) return fallback;
    const n = parseFloat(raw);
    return raw.endsWith('ms') ? n : raw.endsWith('s') ? n * 1000 : n;
  };
  const s = (name, fallback) => cs.getPropertyValue(name).trim() || fallback;
  return {
    cardDelay: v('--store-delay-cards', 500),
    cardStagger: v('--store-card-stagger', 90),
    cardDur: v('--store-dur-card', 750),
    cardDistance: s('--store-card-distance', '16px'),
    exitDur: v('--store-dur-exit', 320),
    flipDur: v('--store-dur-flip', 600),
    popDur: v('--store-dur-filter-pop', 520),
    ease: s('--store-ease-card', 'cubic-bezier(0.22, 0.61, 0.36, 1)'),
    spring: s('--motion-ease-spring', 'cubic-bezier(0.34, 1.56, 0.64, 1)'),
  };
}

function splitTitle(h) {
  const text = h.textContent.trim();
  let i = 0;
  const words = text.split(/\s+/).map((w) => {
    const letters = [...w].map((ch) => {
      const r = (i % 2 ? 1 : -1) * (3 + ((i * 7) % 5));
      return `<span class="store__letter" style="--i: ${i++}; --lr: ${r}deg">${ch}</span>`;
    }).join('');
    return `<span class="store__word">${letters}</span>`;
  });
  h.innerHTML = `<span class="visually-hidden">${text}</span><span aria-hidden="true">${words.join(' ')}</span>`;
  h.closest('[data-store]').style.setProperty('--store-letters', i);
}

function initStore(root) {
  const grid = root.querySelector('[data-store-grid]');
  const empty = root.querySelector('[data-store-empty]');
  const more = root.querySelector('[data-store-more]');
  const status = root.querySelector('[data-store-status]');
  const flavorGroup = root.querySelector('[data-flavor-group]');
  const flavorSelect = root.querySelector('[data-flavor-select]');
  const imgMap = JSON.parse(root.querySelector('[data-store-images]')?.textContent || '{}');
  const imgBase = root.dataset.imgBase || '';
  const srcOf = (file) => imgMap[file] ?? imgBase + file;

  splitTitle(root.querySelector('[data-store-title]'));

  const state = { stage: 'all', format: 'all', flavor: 'all', limit: PAGE_SIZE };
  const nodes = new Map();
  let entered = false;

  const matches = (x, s = state) =>
    (s.stage === 'all' || x.stage === s.stage) &&
    (s.format === 'all' || x.format === s.format) &&
    (s.stage !== 'adultos' || s.flavor === 'all' || x.palette === s.flavor);
  const filtered = () => products.filter((x) => matches(x));

  function cardFor(x) {
    if (nodes.has(x.id)) return nodes.get(x.id);
    const li = document.createElement('li');
    li.className = 'product';
    li.dataset.id = x.id;
    const f = x.fit ?? { w: 500, h: 500, content: 0.8, bottom: 0.1 };
    li.style.cssText = `--card-tint: var(--${x.palette}-200); --card-accent: var(--${x.palette}-600); --fit-target: var(--store-fit-${x.pack}); --fit-content: ${f.content}; --fit-bottom: ${f.bottom}; --fit-adjust: ${x.scale ?? 1}; --fit-offset: ${x.offsetY ?? 0}px`;
    const tag = `${labelOf(STAGES, x.stage)} · ${labelOf(FORMATS, x.format)}`;
    const size = x.showPresentation ? `<span class="product__size">${x.presentation}</span>` : '';
    const alt = `Ricocat ${x.name}${x.showPresentation ? `, ${x.presentation}` : ''}`;
    li.innerHTML = `
      <article class="product__card">
        <div class="product__media"><div class="product__hop"><img class="product__img" src="${srcOf(x.image)}" width="${f.w}" height="${f.h}" alt="${alt}" decoding="async"></div></div>
        <p class="product__tag">${tag}</p>
        <h3 class="product__name">${x.name}${size}</h3>
        <button type="button" class="btn product__cta" data-action="where-to-buy" data-product-id="${x.id}" aria-label="Ver producto: ${alt.replace('Ricocat ', '')}">Ver producto</button>
      </article>`;
    nodes.set(x.id, li);
    return li;
  }

  // Entrada sutil: sube un poco y aparece, en cascada breve
  function deal(li, order, baseDelay, m) {
    li.animate(
      [{ transform: `translateY(${m.cardDistance})`, opacity: 0 }, { transform: 'none', opacity: 1 }],
      { duration: m.cardDur, delay: baseDelay + order * m.cardStagger, easing: m.ease, fill: 'backwards' },
    );
  }

  function announce(list) {
    const shown = Math.min(state.limit, list.length);
    status.textContent = list.length
      ? `Mostrando ${shown} de ${list.length} ${list.length === 1 ? 'producto' : 'productos'}`
      : 'No hay productos con estos filtros';
  }

  /** Re-renderiza la grilla con FLIP. mode: 'filter' | 'more' | 'init' */
  function render(mode = 'filter', mutate) {
    const animate = entered && !reduced();
    const m = readMotion(root);
    const list = filtered();
    const visible = list.slice(0, state.limit);
    const keep = new Set(visible.map((x) => x.id));

    grid.querySelectorAll('.product.is-leaving').forEach((el) => el.remove());
    const first = new Map();
    for (const [id, li] of nodes) {
      if (!li.isConnected) continue;
      first.set(id, li.getBoundingClientRect());
      li.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    }
    mutate?.(); // p. ej. aparece el filtro Sabor: se mide antes para que la grilla también se deslice
    const gridBox = grid.getBoundingClientRect();

    // Salen: se fijan donde estaban y se encogen
    for (const [id, li] of nodes) {
      if (!li.isConnected || keep.has(id)) continue;
      nodes.delete(id);
      if (!animate) { li.remove(); continue; }
      const r = first.get(id);
      li.classList.add('is-leaving');
      Object.assign(li.style, {
        position: 'absolute', left: `${r.left - gridBox.left}px`, top: `${r.top - gridBox.top}px`,
        width: `${r.width}px`, height: `${r.height}px`,
      });
      li.animate(
        [{ transform: 'none', opacity: 1 }, { transform: 'scale(0.96)', opacity: 0 }],
        { duration: m.exitDur, easing: 'ease-out', fill: 'forwards' },
      ).finished.then(() => li.remove(), () => {});
    }

    const fresh = [];
    visible.forEach((x) => {
      const li = cardFor(x);
      if (!li.isConnected || !first.has(x.id)) fresh.push(li);
      grid.appendChild(li);
    });
    grid.querySelectorAll('.product.is-leaving').forEach((el) => grid.appendChild(el));

    if (animate) {
      for (const [id, r] of first) {
        const li = nodes.get(id);
        if (!li?.isConnected || li.classList.contains('is-leaving')) continue;
        const n = li.getBoundingClientRect();
        const dx = r.left - n.left, dy = r.top - n.top;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
        li.animate(
          [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
          { duration: m.flipDur, easing: m.ease },
        );
      }
      const base = mode === 'more' ? 0 : m.exitDur * 0.6;
      fresh.forEach((li, i) => deal(li, i, base, m));
    }

    empty.hidden = list.length > 0;
    more.hidden = list.length <= state.limit;
    root.classList.toggle('is-empty', list.length === 0);
    announce(list);
    return fresh;
  }

  // Sabor: visible solo en Adultos; deshabilita opciones sin productos
  function syncFlavor(wasOpen) {
    const open = state.stage === 'adultos';
    if (!open) state.flavor = 'all';
    root.classList.toggle('has-flavor', open);
    flavorGroup.hidden = !open;
    flavorSelect.closest('.store__select').hidden = !open;
    const avail = (v) => v === 'all' || products.some((x) => matches(x, { ...state, flavor: v }));
    flavorGroup.querySelectorAll('[data-value]').forEach((b) => {
      b.disabled = !avail(b.dataset.value);
      b.setAttribute('aria-pressed', String(b.dataset.value === state.flavor));
    });
    [...flavorSelect.options].forEach((o) => { o.disabled = !avail(o.value); });
    flavorSelect.value = state.flavor;
    checkWrap();
    if (open && !wasOpen) {
      if (entered && !reduced()) {
        const m = readMotion(root);
        // Se despliega desde Adultos: cada chip sale de la izquierda en cascada (desktop); el select cae en mobile
        [...flavorGroup.children].forEach((el, i) => el.animate(
          [{ transform: 'translateX(-1.5rem) scale(0.85)', opacity: 0 }, { opacity: 1, offset: 0.35 }, { transform: 'none', opacity: 1 }],
          { duration: m.popDur, delay: i * 45, easing: m.spring, fill: 'backwards' },
        ));
        flavorSelect.closest('.store__select').animate(
          [{ transform: 'translateY(-0.6rem) scaleY(0.6)', transformOrigin: 'top', opacity: 0 }, { opacity: 1, offset: 0.3 }, { transform: 'none', opacity: 1 }],
          { duration: m.popDur, easing: m.spring },
        );
      }
    }
  }

  function syncControls() {
    for (const key of ['stage', 'format']) {
      root.querySelectorAll(`[data-filter="${key}"] [data-value]`).forEach((b) =>
        b.setAttribute('aria-pressed', String(b.dataset.value === state[key])));
      const sel = root.querySelector(`select[data-filter-select="${key}"]`);
      if (sel) sel.value = state[key];
    }
  }

  // Si Sabor no cabe junto a Formato, pasa a una segunda fila centrada (sin divisor)
  function checkWrap() {
    const chips = root.querySelector('.store__chips');
    chips.querySelectorAll(':scope > .store__divider').forEach((dv) => {
      dv.hidden = false;
      const a = dv.previousElementSibling, b = dv.nextElementSibling;
      const wrapped = b.offsetTop > a.offsetTop + a.offsetHeight / 2;
      dv.hidden = wrapped;
      chips.classList.toggle('is-wrapped', wrapped);
    });
    flavorGroup.classList.remove('is-wrapped');
    if (flavorGroup.hidden || !flavorGroup.offsetParent) return;
    const ref = root.querySelector('[data-filter="stage"]');
    if (flavorGroup.offsetTop > ref.offsetTop + ref.offsetHeight / 2) flavorGroup.classList.add('is-wrapped');
  }
  new ResizeObserver(checkWrap).observe(root.querySelector('.store__filters'));

  function setFilter(key, value) {
    if (state[key] === value) return;
    const wasOpen = state.stage === 'adultos';
    state[key] = value;
    state.limit = PAGE_SIZE;
    syncControls();
    render('filter', () => syncFlavor(wasOpen));
    if (key === 'stage' && value === 'adultos' && !wasOpen) {
      status.textContent = `Nuevo filtro disponible: Sabor. ${status.textContent}`;
    }
  }

  root.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-filter] [data-value]');
    if (chip && !chip.disabled) return setFilter(chip.closest('[data-filter]').dataset.filter, chip.dataset.value);
    const cta = e.target.closest('[data-action="where-to-buy"]');
    if (cta) {
      const product = products.find((x) => x.id === cta.dataset.productId);
      document.dispatchEvent(new CustomEvent('ricocat:where-to-buy', { detail: { product, trigger: cta } }));
    }
    const reset = e.target.closest('[data-store-reset]');
    if (reset) {
      const wasOpen = state.stage === 'adultos';
      Object.assign(state, { stage: 'all', format: 'all', flavor: 'all', limit: PAGE_SIZE });
      syncControls();
      render('filter', () => syncFlavor(wasOpen));
      root.querySelector('[data-filter="stage"] [data-value="all"]')?.focus({ preventScroll: true });
    }
  });

  root.querySelectorAll('select[data-filter-select]').forEach((sel) =>
    sel.addEventListener('change', () => setFilter(sel.dataset.filterSelect, sel.value)));

  // La grilla crece (y durante el FLIP sus tarjetas van en absolute): el smooth scroll debe re-medir la página
  // o se queda con el alto anterior y no deja seguir bajando.
  const refreshScroll = () => [0, 350, 900, 1600].forEach((ms) => setTimeout(() => window.__lenis?.resize?.(), ms));
  more.addEventListener('click', () => {
    state.limit += PAGE_SIZE;
    const fresh = render('more');
    if (more.hidden) fresh[0]?.querySelector('.product__cta')?.focus({ preventScroll: true });
    refreshScroll();
  });

  syncFlavor(true);
  render('init');
  status.textContent = '';

  const io = new IntersectionObserver((entries) => {
    if (!entries.some((en) => en.isIntersecting)) return;
    io.disconnect();
    entered = true;
    root.classList.add('is-in');
    if (reduced()) return;
    const m = readMotion(root);
    const letters = parseInt(root.style.getPropertyValue('--store-letters')) || 0;
    const titleEnd = letters * (parseFloat(getComputedStyle(root).getPropertyValue('--store-letter-stagger')) || 40);
    [...grid.children].forEach((li, i) => deal(li, i, titleEnd * 0.5 + m.cardDelay, m));
  }, { threshold: 0.15 });
  io.observe(root.querySelector('.store__head'));
}

export function initStores() {
  document.querySelectorAll('[data-store]').forEach(initStore);
}
