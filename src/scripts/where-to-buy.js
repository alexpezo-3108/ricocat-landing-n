import { products, STAGES, FORMATS, labelOf } from '../data/products.js';
import { storesFor } from '../data/stores.js';

/**
 * Selector "Dónde comprar": un único <dialog> reutilizable.
 * Desktop (≥48em): modal centrado. Mobile: pantalla completa tipo sheet, cerrable con el "atrás" del sistema.
 * Se abre con los eventos `ricocat:where-to-buy` (tienda: { product, trigger }) y `stores:open` (etapas: { flavor }).
 */

const desktop = matchMedia('(min-width: 48em)');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

function imageResolver() {
  const store = document.querySelector('[data-store]');
  const map = JSON.parse(store?.querySelector('[data-store-images]')?.textContent || '{}');
  const base = store?.dataset.imgBase || '';
  return (file) => map[file] ?? base + file;
}

export function initWhereToBuy() {
  const dialog = document.querySelector('[data-wtb]');
  if (!dialog) return;
  const panel = dialog.querySelector('[data-wtb-panel]');
  const media = dialog.querySelector('[data-wtb-media]');
  const img = dialog.querySelector('[data-wtb-img]');
  const list = dialog.querySelector('[data-wtb-list]');
  const rowProto = dialog.querySelector('[data-wtb-row]'); // prototipo oculto de fila
  const srcOf = imageResolver();
  let trigger = null;
  let pushed = false;
  let closing = false;

  function fill(product) {
    dialog.style.setProperty('--card-tint', `var(--${product.palette}-200)`);
    dialog.style.setProperty('--card-accent', `var(--${product.palette}-600)`);
    const size = product.showPresentation ? ` · ${product.presentation}` : '';
    dialog.querySelector('[data-wtb-tag]').textContent = `${labelOf(STAGES, product.stage)} · ${labelOf(FORMATS, product.format)}`;
    dialog.querySelector('[data-wtb-name]').textContent = product.name + size;
    img.src = srcOf(product.image);
    img.alt = `Ricocat ${product.name}${size.replace(' · ', ', ')}`;
    const found = shuffle(storesFor(product));
    if (!found.length) {
      const li = document.createElement('li');
      li.className = 'wtb__empty';
      li.textContent = 'Pronto estará disponible en tiendas online. Pregunta por él en tu tienda o pet shop de confianza.';
      list.replaceChildren(li);
      list.scrollTop = 0;
      dialog.scrollTop = 0;
      return;
    }
    list.replaceChildren(...found.map((s, i) => {
      const li = rowProto.cloneNode(true);
      li.removeAttribute('data-wtb-row');
      const a = li.querySelector('a');
      a.href = s.url;
      a.style.setProperty('--i', i);
      li.querySelector('[data-wtb-store-name]').textContent = s.name;
      li.querySelector('[data-wtb-store-type]').textContent = s.type;
      if (s.logo) {
        const logo = li.querySelector('[data-wtb-logo]');
        logo.textContent = '';
        logo.append(Object.assign(new Image(), { src: s.logo, alt: '' }));
      }
      return li;
    }));
    list.scrollTop = 0;
    dialog.scrollTop = 0;
  }

  function lockScroll(on) {
    const root = document.documentElement;
    if (on) {
      const sw = innerWidth - root.clientWidth;
      root.style.setProperty('--scrollbar-comp', `${sw}px`);
      root.classList.add('is-locked');
    } else {
      root.classList.remove('is-locked');
      root.style.removeProperty('--scrollbar-comp');
    }
  }

  function focusClose() {
    const btn = [...dialog.querySelectorAll('[data-wtb-close]')].find((b) => b.offsetParent);
    btn?.focus({ preventScroll: true });
  }

  function show() {
    closing = false;
    dialog.classList.remove('is-closing');
    dialog.classList.add('is-opening');
    lockScroll(true);
    dialog.showModal();
    focusClose();
    // El foco inicial de showModal() hace scroll hacia el botón mientras la hoja aún está abajo: volver arriba
    const toTop = () => { dialog.scrollTop = 0; };
    toTop();
    requestAnimationFrame(toTop);
    panel.addEventListener('animationend', function done(e) {
      if (e.target !== panel) return;
      panel.removeEventListener('animationend', done);
      dialog.classList.remove('is-opening');
    });
    if (!desktop.matches) {
      history.pushState({ wtb: true }, '');
      pushed = true;
    }
  }

  // La foto "viaja" desde su tarjeta hasta el modal. El clon vuela DENTRO del diálogo (capa superior), así va
  // siempre por delante; el panel solo aparece con fundido para que el destino no se mueva y la foto no vibre.
  function fly(sourceImg) {
    const from = sourceImg.getBoundingClientRect();
    const to = img.getBoundingClientRect();
    if (!from.width || !to.width) return;
    const cs = getComputedStyle(dialog);
    const dur = (parseFloat(cs.getPropertyValue('--wtb-dur-vt')) || 0.5) * (/ms/.test(cs.getPropertyValue('--wtb-dur-vt')) ? 1 : 1000);
    const ease = cs.getPropertyValue('--wtb-ease-vt').trim() || 'cubic-bezier(0.22, 1, 0.36, 1)';
    const clone = new Image();
    clone.src = sourceImg.currentSrc || sourceImg.src;
    clone.alt = '';
    clone.setAttribute('aria-hidden', 'true');
    Object.assign(clone.style, {
      position: 'fixed', left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px`,
      objectFit: 'contain', objectPosition: getComputedStyle(img).objectPosition, margin: '0', zIndex: '10',
      pointerEvents: 'none', transformOrigin: '50% 50%', willChange: 'transform',
    });
    const k = Math.min(from.width / to.width, from.height / to.height);
    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    dialog.append(clone);
    img.style.opacity = '0';
    sourceImg.style.opacity = '0';
    const anim = clone.animate(
      [{ transform: `translate(${dx}px, ${dy}px) scale(${k})` }, { transform: 'none' }],
      { duration: dur, easing: ease, fill: 'both' },
    );
    const done = () => { img.style.opacity = ''; sourceImg.style.opacity = ''; clone.remove(); };
    anim.finished.then(done, done);
  }

  function open(product, from, sourceImg) {
    if (!product || dialog.open) return;
    trigger = from;
    fill(product);
    const canFly = sourceImg && !reduced.matches && sourceImg.getBoundingClientRect().width;
    dialog.classList.toggle('is-fly', !!canFly);
    show();
    if (canFly) fly(sourceImg);
  }

  function finishClose() {
    dialog.classList.remove('is-closing', 'is-opening', 'is-fly');
    dialog.close();
    lockScroll(false);
    closing = false;
    trigger?.focus({ preventScroll: true });
  }

  function close() {
    if (!dialog.open || closing) return;
    closing = true;
    if (pushed) { pushed = false; history.back(); }
    if (reduced.matches) return finishClose();
    dialog.classList.remove('is-opening');
    dialog.classList.add('is-closing');
    let done = false;
    const end = () => { if (!done) { done = true; finishClose(); } };
    panel.addEventListener('animationend', function onEnd(e) {
      if (e.target !== panel) return;
      panel.removeEventListener('animationend', onEnd);
      end();
    });
    setTimeout(end, 800);
  }

  dialog.querySelectorAll('[data-wtb-close]').forEach((b) => b.addEventListener('click', close));
  dialog.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  dialog.addEventListener('click', (e) => { if (e.target === dialog && desktop.matches) close(); });
  addEventListener('popstate', () => { if (pushed && dialog.open) { pushed = false; close(); } });

  document.addEventListener('ricocat:where-to-buy', (e) => {
    const { product, trigger: from } = e.detail;
    open(product, from, from?.closest('.product')?.querySelector('.product__img'));
  });
  document.addEventListener('stores:open', (e) => {
    const product = products.find((p) => p.flavorId === e.detail.flavor);
    const from = e.target;
    const art = from.closest('[data-stage]')?.querySelector('[data-flavor][data-active="true"] .stage__item--bag');
    open(product, from, art);
  });
}

/** Fisher–Yates: orden distinto en cada apertura, para no favorecer a ninguna tienda. */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
