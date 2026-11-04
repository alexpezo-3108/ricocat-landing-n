// Desktop: reserva a la izquierda de los beneficios el espacio que ocupa la bolsa derecha,
// así ningún beneficio queda tapado. El tamaño de los beneficios crece con el espacio libre (cqi).
const DESKTOP = '(min-width: 75em)';
// Margen transparente aproximado del PNG de la bolsa (fracción de su ancho).
const BAG_TRANSPARENT_EDGE = 0.18;

const leftWithin = (el, root) => {
  let x = 0;
  for (let n = el; n && n !== root; n = n.offsetParent) x += n.offsetLeft;
  return x;
};

export function initBenefitsClearance() {
  initHeroPlay();
  initHorizon();
  const hero = document.querySelector('.hero');
  const bag = hero?.querySelector('.hero__item--adultos');
  const track = hero?.querySelector('.benefits__track');
  const intro = hero?.querySelector('.hero__intro');
  // Productos a la izquierda que el titular nunca debe pisar: [elemento, margen transparente izq.].
  const leftItems = [['.hero__item--esterilizados', 0.15], ['.hero__item--lata', 0.08]]
    .map(([sel, edge]) => [hero.querySelector(sel), edge])
    .filter(([el]) => el);
  if (!bag || !track) return;
  const mq = window.matchMedia(DESKTOP);

  const update = () => {
    if (!mq.matches) {
      track.style.removeProperty('--bag-clear');
      hero.style.removeProperty('--intro-left');
      return;
    }
    const bagRight = leftWithin(bag, hero) + bag.offsetWidth * (1 - BAG_TRANSPARENT_EDGE);
    track.style.setProperty('--bag-clear', `${Math.round(bagRight - leftWithin(track, hero))}px`);

    // Titular: nunca más a la izquierda que el margen base; si sobra espacio, a medio camino hacia los productos.
    if (intro && leftItems.length) {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const productsLeft = Math.min(...leftItems.map(([el, edge]) => leftWithin(el, hero) + el.offsetWidth * edge));
      const vw = document.documentElement.clientWidth;
      const base = Math.min(Math.max(1.5 * rem, vw * 0.038), 4.5 * rem); // = clamp(1.5rem, 3.8vw, 4.5rem)
      const maxLeft = productsLeft - intro.offsetWidth - 2.5 * rem;       // no pisar productos
      const cap = vw / 2 - 48 * rem;                                      // tope en pantallas muy anchas
      const nudge = vw >= 1600 ? vw * 0.02 : 0;                          // pantallas grandes: 2% más cerca de los productos
      const target = Math.min(Math.min((base + maxLeft) / 2, cap) + nudge, maxLeft);
      const left = Math.max(base, target);
      hero.style.setProperty('--intro-left', `${Math.round(left)}px`);
    }
  };

  new ResizeObserver(update).observe(hero);
  mq.addEventListener('change', update);

  // Mide con la tipografía final y recién entonces deja entrar titular y beneficios (evita el salto).
  // Tope de espera: si la tipografía tarda, entra igual (la medición se repite al cargar).
  let done = false;
  const ready = () => {
    update();
    if (done) return;
    done = true;
    hero.dataset.layoutReady = '';
  };
  (document.fonts?.ready ?? Promise.resolve()).then(ready, ready);
  setTimeout(ready, 250);

}

function initHeroPlay() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  // Toda la coreografía del hero arranca a la vez cuando las imágenes del bodegón ya están decodificadas
  // (si no, un alimento que carga tarde "entra" después del titular). Tope de espera: HERO_WAIT_MAX.
  const HERO_WAIT_MAX = 1200;
  const imgs = [...hero.querySelectorAll('.hero__item-img')];
  const play = () => { if (!('heroPlay' in hero.dataset)) requestAnimationFrame(() => { hero.dataset.heroPlay = ''; }); };
  Promise.race([
    Promise.all(imgs.map((img) => {
      const loaded = img.complete ? Promise.resolve() : new Promise((r) => {
        img.addEventListener('load', r, { once: true });
        img.addEventListener('error', r, { once: true });
      });
      return loaded.then(() => img.decode?.()).catch(() => {});
    })),
    new Promise((r) => setTimeout(r, HERO_WAIT_MAX)),
  ]).then(play, play);
}

// Horizonte del set de estudio = base de las bolsas (≈95% del alto del escenario; el PNG trae sombra abajo).
const HORIZON_AT = 0.67;
function initHorizon() {
  const hero = document.querySelector('.hero');
  const stage = hero?.querySelector('.hero__stage');
  if (!stage) return;
  const set = () => {
    let y = 0;
    for (let n = stage; n && n !== hero; n = n.offsetParent) y += n.offsetTop;
    hero.style.setProperty('--horizon', `${Math.round(y + stage.offsetHeight * HORIZON_AT)}px`);
  };
  set();
  new ResizeObserver(set).observe(hero);
}
