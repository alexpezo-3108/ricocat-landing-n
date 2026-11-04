// Menú mobile: el botón hamburguesa se transforma en la X sin moverse de su lugar,
// y el panel se "pinta" desde ese mismo botón.
export function initMenu() {
  const dialog = document.querySelector('[data-menu]');
  if (!dialog) return;

  const panel = dialog.querySelector('.menu__panel');
  const closeBtn = dialog.querySelector('.menu__close');
  const openers = [...document.querySelectorAll('[data-menu-open]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeOpener = null;

  const setExpanded = (value) => openers.forEach((btn) => btn.setAttribute('aria-expanded', String(value)));

  // La X ocupa exactamente el lugar y tamaño del botón que abrió el menú
  const placeCloseOver = (btn) => {
    const r = btn.getBoundingClientRect();
    const bg = getComputedStyle(btn).backgroundColor;
    dialog.style.setProperty('--toggle-x', `${r.left}px`);
    dialog.style.setProperty('--toggle-y', `${r.top}px`);
    dialog.style.setProperty('--toggle-size', `${r.width}px`);
    dialog.style.setProperty('--toggle-bg', bg);
    const p = panel.getBoundingClientRect();
    panel.style.setProperty('--reveal-x', `${r.left + r.width / 2 - p.left}px`);
    panel.style.setProperty('--reveal-y', `${r.top + r.height / 2 - p.top}px`);
  };

  const open = (event) => {
    activeOpener = event.currentTarget;
    dialog.showModal();
    placeCloseOver(activeOpener);
    activeOpener.style.visibility = 'hidden';
    setExpanded(true);
    requestAnimationFrame(() => requestAnimationFrame(() => dialog.classList.add('is-x')));
  };

  const finish = () => {
    dialog.classList.remove('is-closing', 'is-x');
    dialog.close();
  };

  const close = () => {
    if (!dialog.open || dialog.classList.contains('is-closing')) return;
    dialog.classList.remove('is-x'); // la X vuelve a ser hamburguesa mientras el panel se recoge
    if (reducedMotion.matches) return finish();
    dialog.classList.add('is-closing');
    const onEnd = (event) => {
      if (event.target !== panel) return;
      panel.removeEventListener('animationend', onEnd);
      finish();
    };
    panel.addEventListener('animationend', onEnd);
  };

  openers.forEach((btn) => btn.addEventListener('click', open));
  dialog.querySelectorAll('[data-menu-close], a[href^="#"]').forEach((el) => el.addEventListener('click', close));
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
  });
  dialog.addEventListener('close', () => {
    setExpanded(false);
    if (activeOpener) { activeOpener.style.visibility = ''; activeOpener.focus({ preventScroll: true }); }
  });
  addEventListener('resize', () => { if (dialog.open && activeOpener) placeCloseOver(activeOpener); });
  void closeBtn;
}
